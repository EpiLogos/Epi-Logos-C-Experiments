use std::collections::BTreeMap;

use epi_s2_graph_schema::{
    relationship_property_spec, relationship_required_evidence_property_keys, relationship_spec,
};
use neo4rs::query;
use serde_json::Value;

use crate::Neo4jClient;

/// Position-based relationship types: (position, forward, inverse)
pub const POSITION_REL_TYPES: &[(u8, &str, &str)] = &[
    (0, "POS0_LINKS_TO", "POS0_LINKED_FROM"),
    (1, "POS1_DEFINES", "POS1_DEFINED_BY"),
    (2, "POS2_OPERATES_VIA", "POS2_OPERATED_BY"),
    (3, "POS3_INSTANTIATES", "POS3_INSTANTIATED_BY"),
    (4, "POS4_SITUATED_IN", "POS4_SITUATES"),
    (5, "POS5_INTEGRATES_INTO", "POS5_INTEGRATED_FROM"),
];

pub struct RelationshipManager<'a> {
    client: &'a Neo4jClient,
}

#[derive(Clone, Debug, PartialEq)]
pub struct RelationshipWritePlan {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub rel_type: String,
    pub properties: BTreeMap<String, Value>,
}

impl RelationshipWritePlan {
    pub fn new(
        source_coordinate: impl Into<String>,
        target_coordinate: impl Into<String>,
        rel_type: impl Into<String>,
    ) -> Result<Self, String> {
        let source_coordinate = source_coordinate.into();
        let target_coordinate = target_coordinate.into();
        let rel_type = rel_type.into();

        if source_coordinate.trim().is_empty() {
            return Err("source coordinate is required".to_owned());
        }
        if target_coordinate.trim().is_empty() {
            return Err("target coordinate is required".to_owned());
        }
        relationship_spec(&rel_type)?;

        Ok(Self {
            source_coordinate,
            target_coordinate,
            rel_type,
            properties: BTreeMap::new(),
        })
    }

    pub fn with_wikilink_evidence(
        mut self,
        source_path: impl Into<String>,
        source_line: i64,
        evidence_text: impl Into<String>,
    ) -> Self {
        self.properties.insert(
            "evidence_kind".to_owned(),
            Value::String("wikilink".to_owned()),
        );
        self.properties
            .insert("source_path".to_owned(), Value::String(source_path.into()));
        self.properties.insert(
            "source_line".to_owned(),
            Value::Number(serde_json::Number::from(source_line)),
        );
        self.properties.insert(
            "evidence_text".to_owned(),
            Value::String(evidence_text.into()),
        );
        self
    }

    pub fn with_frontmatter_evidence(
        mut self,
        frontmatter_key: impl Into<String>,
        evidence_text: impl Into<String>,
    ) -> Self {
        self.properties.insert(
            "evidence_kind".to_owned(),
            Value::String("frontmatter".to_owned()),
        );
        self.properties.insert(
            "frontmatter_key".to_owned(),
            Value::String(frontmatter_key.into()),
        );
        self.properties.insert(
            "evidence_text".to_owned(),
            Value::String(evidence_text.into()),
        );
        self
    }

    pub fn with_property(mut self, key: impl Into<String>, value: Value) -> Result<Self, String> {
        let key = key.into();
        if relationship_property_spec(&key).is_none() {
            return Err(format!("unknown graph relationship property key: {key}"));
        }
        self.properties.insert(key, value);
        Ok(self)
    }

    pub fn cypher(&self) -> String {
        self.unchecked_cypher()
    }

    pub fn validated_cypher(&self) -> Result<String, String> {
        self.validate()?;
        Ok(self.unchecked_cypher())
    }

    pub fn validate(&self) -> Result<(), String> {
        relationship_spec(&self.rel_type)?;
        for key in self.properties.keys() {
            if relationship_property_spec(key).is_none() {
                return Err(format!("unknown graph relationship property key: {key}"));
            }
        }
        for required in relationship_required_evidence_property_keys() {
            let Some(value) = self.properties.get(*required) else {
                return Err(format!(
                    "missing required relationship evidence property: {required}"
                ));
            };
            if value.as_str().is_some_and(str::is_empty) {
                return Err(format!(
                    "empty required relationship evidence property: {required}"
                ));
            }
        }
        Ok(())
    }

    fn unchecked_cypher(&self) -> String {
        let set_clause = self
            .properties
            .keys()
            .map(|key| format!("r.{key} = ${}", property_param_name(key)))
            .collect::<Vec<_>>();
        let set_clause = if set_clause.is_empty() {
            String::new()
        } else {
            format!(" SET {}", set_clause.join(", "))
        };
        format!(
            "MATCH (source) WHERE source.coordinate = $source_coordinate \
             MATCH (target) WHERE target.coordinate = $target_coordinate \
             MERGE (source)-[r:{}]->(target) \
             {} \
             RETURN source.coordinate AS src, target.coordinate AS tgt",
            self.rel_type, set_clause
        )
    }

    pub fn to_query(&self) -> Result<neo4rs::Query, String> {
        let cypher = self.validated_cypher()?;
        let mut q = query(&cypher)
            .param("source_coordinate", self.source_coordinate.clone())
            .param("target_coordinate", self.target_coordinate.clone());
        for (key, value) in &self.properties {
            let param = property_param_name(key);
            q = bind_json_param(q, &param, key, value)?;
        }
        Ok(q)
    }
}

fn property_param_name(key: &str) -> String {
    format!("rel_{}", key)
}

fn bind_json_param(
    q: neo4rs::Query,
    param: &str,
    key: &str,
    value: &Value,
) -> Result<neo4rs::Query, String> {
    Ok(match value {
        Value::String(value) => q.param(param, value.clone()),
        Value::Number(value) if value.is_i64() => q.param(param, value.as_i64().unwrap()),
        Value::Number(value) if value.is_u64() => {
            let value = i64::try_from(value.as_u64().unwrap())
                .map_err(|_| format!("relationship property {key} exceeds i64"))?;
            q.param(param, value)
        }
        Value::Number(value) if value.is_f64() => q.param(param, value.as_f64().unwrap()),
        Value::Bool(value) => q.param(param, *value),
        other => {
            let serialized = serde_json::to_string(other).map_err(|error| {
                format!("relationship property serialization error for {key}: {error}")
            })?;
            q.param(param, serialized)
        }
    })
}

impl<'a> RelationshipManager<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub fn position_rel_types() -> &'static [(u8, &'static str, &'static str)] {
        POSITION_REL_TYPES
    }

    pub fn rel_type_for_position(position: u8) -> Option<(u8, &'static str, &'static str)> {
        POSITION_REL_TYPES
            .iter()
            .find(|(candidate, _, _)| *candidate == position)
            .copied()
    }

    /// Create a forward position-based relationship between two coordinates
    pub async fn create_position_rel(
        &self,
        _source_coord: &str,
        _target_coord: &str,
        position: u8,
    ) -> Result<String, String> {
        let (_, rel_type, _) = POSITION_REL_TYPES
            .iter()
            .find(|(p, _, _)| *p == position)
            .ok_or_else(|| format!("invalid position: {}", position))?;

        Err(format!(
            "legacy positional relationship output is compatibility-only: {rel_type}"
        ))
    }

    /// Create a schema-registered relationship with parameterized coordinates.
    pub async fn create_relationship(
        &self,
        plan: &RelationshipWritePlan,
    ) -> Result<String, String> {
        let q = plan.to_query()?;

        self.client
            .run_query(q)
            .await
            .map_err(|e| format!("relationship error: {}", e))?;

        Ok(format!(
            "({}) -[:{}]-> ({})",
            plan.source_coordinate, plan.rel_type, plan.target_coordinate
        ))
    }

    /// Create bidirectional position relationship (forward + inverse)
    pub async fn create_bidirectional(
        &self,
        _source_coord: &str,
        _target_coord: &str,
        position: u8,
    ) -> Result<String, String> {
        let (_, fwd, inv) = POSITION_REL_TYPES
            .iter()
            .find(|(p, _, _)| *p == position)
            .ok_or_else(|| format!("invalid position: {}", position))?;

        Err(format!(
            "legacy positional relationship output is compatibility-only: {fwd}/{inv}"
        ))
    }

    pub fn plans_from_frontmatter(
        source_coord: &str,
        coord_keys: &[(String, Vec<String>)],
    ) -> Result<Vec<RelationshipWritePlan>, String> {
        let mut plans = Vec::new();
        for (key, targets) in coord_keys {
            let Some(rel_type) = canonical_relation_for_frontmatter_key(key) else {
                continue;
            };
            for target in targets {
                plans.push(
                    RelationshipWritePlan::new(source_coord, target, rel_type)?
                        .with_frontmatter_evidence(key, target),
                );
            }
        }
        Ok(plans)
    }

    /// Create canonical relationships from frontmatter coordinate arrays.
    pub async fn create_from_frontmatter(
        &self,
        source_coord: &str,
        coord_keys: &[(String, Vec<String>)],
    ) -> Result<usize, String> {
        let plans = Self::plans_from_frontmatter(source_coord, coord_keys)?;
        let count = plans.len();
        for plan in plans {
            self.create_relationship(&plan).await?;
        }
        Ok(count)
    }

    /// Query relationships by type from a source
    pub async fn query_by_type(
        &self,
        source_coord: &str,
        rel_type: &str,
    ) -> Result<Vec<String>, String> {
        relationship_spec(rel_type)?;
        let cypher = format!(
            "MATCH (s {{coordinate: '{}'}})-[:{}]->(t) \
             RETURN t.coordinate AS coord",
            source_coord, rel_type
        );
        let rows = self
            .client
            .run(&cypher)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows
            .iter()
            .filter_map(|r| r.get::<String>("coord").ok())
            .collect())
    }
}

fn canonical_relation_for_frontmatter_key(key: &str) -> Option<&'static str> {
    let parts = key.splitn(3, '_').collect::<Vec<_>>();
    if parts.len() != 3 {
        return None;
    }

    let semantic = parts[2];
    if semantic.contains("source") || semantic.contains("provenance") {
        Some("SOURCES")
    } else if semantic.contains("part_of") || semantic.contains("parent") {
        Some("PART_OF")
    } else if semantic.contains("contains") || semantic.contains("children") {
        Some("CONTAINS")
    } else {
        Some("REFERENCES")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_position_rel_types_complete() {
        assert_eq!(POSITION_REL_TYPES.len(), 6);
        for (pos, fwd, inv) in POSITION_REL_TYPES {
            assert!(*pos <= 5);
            assert!(fwd.starts_with("POS"));
            assert!(inv.starts_with("POS"));
        }
    }

    #[test]
    fn relationship_write_plan_rejects_positional_legacy_output() {
        let err = RelationshipWritePlan::new("C0", "C1", "POS0_LINKS_TO").unwrap_err();

        assert!(err.contains("not a canonical relationship type"));
    }

    #[test]
    fn relationship_write_plan_preserves_evidence_properties() {
        let plan = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES")
            .unwrap()
            .with_wikilink_evidence("Idea/Empty/current.md", 12, "[[C0/T4]]");

        assert_eq!(plan.properties["evidence_kind"], "wikilink");
        assert_eq!(
            plan.properties["source_line"],
            Value::Number(serde_json::Number::from(12))
        );
    }

    #[test]
    fn relationship_write_plan_matches_by_coordinate_property_not_bimba_label() {
        let plan = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES").unwrap();
        let cypher = plan.cypher();

        assert!(cypher.contains("source.coordinate = $source_coordinate"));
        assert!(cypher.contains("target.coordinate = $target_coordinate"));
        assert!(!cypher.contains(":Bimba"));
        assert!(cypher.contains("MERGE (source)-[r:ELABORATES]->(target)"));
    }

    #[test]
    fn relationship_write_plan_parameterizes_evidence_properties() {
        let plan = RelationshipWritePlan::new("C0/T5", "C0/T4", "ELABORATES")
            .unwrap()
            .with_wikilink_evidence("Idea/Empty/current.md", 12, "[[C0/T4]]");
        let cypher = plan.cypher();

        assert!(cypher.contains("r.evidence_kind = $rel_evidence_kind"));
        assert!(cypher.contains("r.source_line = $rel_source_line"));
        assert!(cypher.contains(" RETURN source.coordinate"));
        assert!(!cypher.contains("[[C0/T4]]"));
    }

    #[test]
    fn frontmatter_plans_use_canonical_schema_relationships() {
        let plans = RelationshipManager::plans_from_frontmatter(
            "C0/T5",
            &[
                ("c_0_source_coordinates".to_owned(), vec!["C0".to_owned()]),
                ("c_3_related_coordinates".to_owned(), vec!["C1".to_owned()]),
            ],
        )
        .unwrap();

        assert_eq!(plans.len(), 2);
        assert_eq!(plans[0].rel_type, "SOURCES");
        assert_eq!(plans[1].rel_type, "REFERENCES");
        assert!(plans
            .iter()
            .all(|plan| !plan.cypher().contains(":Bimba") && !plan.rel_type.starts_with("POS")));
    }
}
