use std::collections::BTreeMap;

use epi_s2_graph_schema::{labels_for_coordinate_node, COORDINATE_PROPERTY};
use neo4rs::{query, Query};
use serde_json::Value;

use crate::RelationshipWritePlan;

#[derive(Clone, Debug, PartialEq)]
pub struct PromotionPlan {
    pub coordinate: String,
    pub identity_property: &'static str,
    pub labels: Vec<String>,
    pub properties: BTreeMap<String, Value>,
    pub source_path: String,
    pub relationships: Vec<RelationshipWritePlan>,
    pub compatibility_migrations: Vec<String>,
    pub sync_version: String,
    pub promotion_source: String,
}

impl PromotionPlan {
    pub fn new(
        coordinate: impl Into<String>,
        artifact_kind: impl AsRef<str>,
    ) -> Result<Self, String> {
        let coordinate = coordinate.into();
        if !crate::CoordinateArrayParser::parse_one(&coordinate).is_ok()
            && !coordinate
                .split('/')
                .all(|part| crate::CoordinateArrayParser::parse_one(part).is_ok())
        {
            return Err(format!("invalid graph promotion coordinate: {coordinate}"));
        }

        let labels = labels_for_coordinate_node(&coordinate, artifact_kind.as_ref())?;
        let mut properties = BTreeMap::new();
        properties.insert("coordinate".to_owned(), Value::String(coordinate.clone()));
        properties.insert(
            "coordinate_depth".to_owned(),
            Value::Number(serde_json::Number::from(
                coordinate
                    .split('/')
                    .filter(|part| !part.is_empty())
                    .count() as i64,
            )),
        );
        if let Some(prefix) = coordinate.split('/').next().filter(|part| !part.is_empty()) {
            properties.insert(
                "coordinate_prefix".to_owned(),
                Value::String(prefix.to_owned()),
            );
        }
        properties.insert(
            "artifact_kind".to_owned(),
            Value::String(artifact_kind.as_ref().to_owned()),
        );

        Ok(Self {
            coordinate,
            identity_property: COORDINATE_PROPERTY,
            labels,
            properties,
            source_path: String::new(),
            relationships: Vec::new(),
            compatibility_migrations: Vec::new(),
            sync_version: "s2-promotion-plan-v1".to_owned(),
            promotion_source: "graph-services".to_owned(),
        })
    }

    pub fn from_intent_fixture(coordinate: &str, artifact_kind: &str) -> Result<Self, String> {
        Self::new(coordinate, artifact_kind)
    }

    /// Absorb a `portal_core::VakAddress` into the plan's properties map under
    /// the canonical VAK prefix keys (`cpf`, `ct`, `cp`, `cf`, `cfp`,
    /// `cs_code`, `cs_direction`). Sophia-promoted artifacts inherit their
    /// producing VAK address this way.
    ///
    /// Leans on the serde `rename` markers on [`portal_core::CpfState`] and
    /// [`portal_core::CsDirection`] so the canonical wire literals — `(00/00)`,
    /// `(4.0/1-4.4/5)`, `Night'` — survive round-trip into the property map.
    ///
    /// Note: `ct` is stored here as a raw JSON value, but when this
    /// `PromotionPlan` is bound to Neo4j it flows through the
    /// `bind_json_param` convention (see `sync/plan.rs`)
    /// which JSON-encodes complex values to strings before binding.
    pub fn attach_vak_address(&mut self, vak: &portal_core::VakAddress) {
        self.properties.insert(
            "cpf".to_owned(),
            serde_json::to_value(&vak.cpf)
                .expect("CpfState serialization is infallible (fieldless enum)"),
        );
        self.properties
            .insert("ct".to_owned(), serde_json::json!(vak.ct));
        self.properties
            .insert("cp".to_owned(), Value::String(vak.cp.clone()));
        self.properties
            .insert("cf".to_owned(), Value::String(vak.cf.clone()));
        self.properties
            .insert("cfp".to_owned(), Value::String(vak.cfp.clone()));
        self.properties
            .insert("cs_code".to_owned(), Value::String(vak.cs.code.clone()));
        self.properties.insert(
            "cs_direction".to_owned(),
            serde_json::to_value(&vak.cs.direction)
                .expect("CsDirection serialization is infallible (fieldless enum)"),
        );
    }

    pub fn attach_ananda_vortex(&mut self, vortex: &portal_core::AnandaVortexProjection) {
        self.properties.insert(
            "m_1_2_ananda_vortex_handle".to_owned(),
            Value::String("profile.ananda_vortex".to_owned()),
        );
        self.properties.insert(
            "m_1_2_ananda_vortex_active_op".to_owned(),
            serde_json::to_value(vortex.active_matrix_op)
                .expect("AnandaMatrixOp serialization is infallible"),
        );
        self.properties.insert(
            "m_1_2_ananda_vortex_cell".to_owned(),
            serde_json::json!([vortex.active_cell.0, vortex.active_cell.1]),
        );
        self.properties.insert(
            "m_1_2_ananda_vortex_payload".to_owned(),
            serde_json::to_value(vortex)
                .expect("AnandaVortexProjection serialization is infallible"),
        );
    }

    pub fn node_upsert_cypher(&self) -> String {
        let label_clause = if self.labels.is_empty() {
            String::new()
        } else {
            format!(
                " SET n:{}",
                self.labels
                    .iter()
                    .map(String::as_str)
                    .collect::<Vec<_>>()
                    .join(":")
            )
        };
        let property_clause = self
            .properties
            .keys()
            .map(|key| format!("n.{key} = ${}", node_property_param_name(key)))
            .collect::<Vec<_>>();
        let property_clause = if property_clause.is_empty() {
            String::new()
        } else {
            format!(" SET {}", property_clause.join(", "))
        };

        format!(
            "MERGE (n {{coordinate: $coordinate}}){label_clause}{property_clause} \
             REMOVE n:Coordinate REMOVE n:VaultArtifact \
             REMOVE n:BimbaNode REMOVE n:BimbaCoordinate \
             REMOVE n.bimbaCoordinate REMOVE n.bimba_coordinate \
             RETURN n.coordinate AS coordinate"
        )
    }

    pub fn node_upsert_query(&self) -> Result<Query, String> {
        let mut q = query(&self.node_upsert_cypher()).param("coordinate", self.coordinate.clone());
        for (key, value) in &self.properties {
            q = bind_json_param(q, &node_property_param_name(key), value)?;
        }
        Ok(q)
    }
}

pub(crate) fn validate_promotion_coordinate(coordinate: &str) -> Result<(), String> {
    if coordinate.trim().is_empty() {
        return Err("canonical coordinate is required for graph promotion".to_owned());
    }
    if crate::CoordinateArrayParser::parse_one(coordinate).is_ok()
        || coordinate
            .split('/')
            .all(|part| !part.is_empty() && crate::CoordinateArrayParser::parse_one(part).is_ok())
    {
        Ok(())
    } else {
        Err(format!("invalid graph promotion coordinate: {coordinate}"))
    }
}

fn node_property_param_name(key: &str) -> String {
    format!("node_{}", key)
}

fn bind_json_param(q: Query, param: &str, value: &Value) -> Result<Query, String> {
    Ok(match value {
        Value::String(value) => q.param(param, value.clone()),
        Value::Number(value) if value.is_i64() => q.param(param, value.as_i64().unwrap()),
        Value::Number(value) if value.is_u64() => {
            let value = i64::try_from(value.as_u64().unwrap())
                .map_err(|_| format!("node property {param} exceeds i64"))?;
            q.param(param, value)
        }
        Value::Number(value) if value.is_f64() => q.param(param, value.as_f64().unwrap()),
        Value::Bool(value) => q.param(param, *value),
        other => {
            let serialized = serde_json::to_string(other).map_err(|error| {
                format!("node property serialization error for {param}: {error}")
            })?;
            q.param(param, serialized)
        }
    })
}
