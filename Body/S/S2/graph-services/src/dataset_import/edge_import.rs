use super::node_import::DatasetImporter;
use super::validation::{
    cypher_literal, escape_cypher, sanitize_json_control_chars, strip_json_bom, DatasetBranch,
    DatasetSkip,
};
use crate::coordinate::{convert_hash_to_m_family, wrap_context_frames};
use serde_json::Value;

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub(super) struct DatasetRelationImportOutcome {
    pub(super) imported: Vec<String>,
    pub(super) skipped: Vec<DatasetSkip>,
}

impl<'a> DatasetImporter<'a> {
    /// Import a relations JSON file. Each entry becomes a Neo4j relationship.
    pub async fn import_relations(&self, filename: &str) -> Result<usize, String> {
        let report = self.import_relations_with_metadata(filename, None).await?;
        Ok(report.imported.len())
    }

    pub(super) async fn import_relations_with_metadata(
        &self,
        filename: &str,
        branch: Option<&DatasetBranch>,
    ) -> Result<DatasetRelationImportOutcome, String> {
        let path = self.resolve_dataset_path(filename);
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", path.display(), e))?;
        let sanitized = sanitize_json_control_chars(strip_json_bom(&data));
        let raw: Vec<Value> = serde_json::from_str(&sanitized)
            .map_err(|e| format!("parse {}: {}", path.display(), e))?;

        // Detect aggregated shape `[{coordinate, outgoing, incoming}]` and flatten
        // into the standard `[{source, target, type}]` shape the loop expects.
        let rels: Vec<Value> = if raw
            .iter()
            .any(|r| r.get("outgoing").is_some() || r.get("incoming").is_some())
        {
            flatten_aggregated_relations(&raw)
        } else {
            raw
        };

        let mut outcome = DatasetRelationImportOutcome::default();
        for rel in &rels {
            let raw_source = match relation_endpoint(rel, "source") {
                Some(s) => s,
                None => {
                    outcome.skipped.push(DatasetSkip {
                        item: relation_identity_hint(rel),
                        reason: "missing source endpoint".into(),
                    });
                    continue;
                }
            };
            let raw_target = match relation_endpoint(rel, "target") {
                Some(t) => t,
                None => {
                    outcome.skipped.push(DatasetSkip {
                        item: relation_identity_hint(rel),
                        reason: "missing target endpoint".into(),
                    });
                    continue;
                }
            };
            let source = wrap_context_frames(&convert_hash_to_m_family(raw_source));
            let target = wrap_context_frames(&convert_hash_to_m_family(raw_target));

            let rel_type = match relation_type_from_value(rel) {
                Some(t) => sanitize_rel_type(t),
                None => {
                    outcome.skipped.push(DatasetSkip {
                        item: relation_identity_hint(rel),
                        reason: "missing relationship type".into(),
                    });
                    continue;
                }
            };
            let relation_name = format!("{source} -[{rel_type}]-> {target}");

            let mut set_parts = Vec::new();
            set_parts.push(format!(
                "r.c_0_source_coordinate = COALESCE(r.c_0_source_coordinate, '{}')",
                escape_cypher(&source)
            ));
            set_parts.push(format!(
                "r.c_0_target_coordinate = COALESCE(r.c_0_target_coordinate, '{}')",
                escape_cypher(&target)
            ));
            set_parts.push(format!(
                "r.c_2_relation_type = COALESCE(r.c_2_relation_type, '{}')",
                escape_cypher(&rel_type)
            ));
            set_parts.push("r.c_3_created_at = COALESCE(r.c_3_created_at, datetime())".to_string());
            if let Some(branch) = branch {
                set_parts.push(format!(
                    "r.c_3_dataset_branch = '{}'",
                    escape_cypher(branch.id)
                ));
            }
            append_deep_prefixed_rel_props(rel, &mut set_parts);
            let set_clause = format!(" SET {}", set_parts.join(", "));

            let cypher = format!(
                "MATCH (s:Bimba {{coordinate: '{}'}}) \
                 MATCH (t:Bimba {{coordinate: '{}'}}) \
                 MERGE (s)-[r:{}]->(t){} \
                 RETURN s.coordinate AS source, t.coordinate AS target",
                escape_cypher(&source),
                escape_cypher(&target),
                rel_type,
                set_clause
            );

            match self.client.run(&cypher).await {
                Ok(rows) if !rows.is_empty() => outcome.imported.push(relation_name),
                Ok(_) => outcome.skipped.push(DatasetSkip {
                    item: relation_name,
                    reason: "missing source or target node in graph".into(),
                }),
                Err(e) => {
                    let reason = e.to_string();
                    eprintln!(
                        "  warn: skip rel {} -[{}]-> {}: {}",
                        source, rel_type, target, reason
                    );
                    outcome.skipped.push(DatasetSkip {
                        item: relation_name,
                        reason,
                    });
                }
            }
        }
        Ok(outcome)
    }
}

pub fn relation_type_from_value(rel: &Value) -> Option<&str> {
    rel.get("type")
        .and_then(|value| value.as_str())
        .or_else(|| rel.get("relType").and_then(|value| value.as_str()))
        .or_else(|| rel.get("relationshipType").and_then(|value| value.as_str()))
}

pub fn relation_endpoint<'a>(rel: &'a Value, key: &str) -> Option<&'a str> {
    rel.get(key).and_then(|value| match value {
        Value::String(s) if !s.trim().is_empty() => Some(s.as_str()),
        Value::Object(map) => map
            .get("coordinate")
            .and_then(|value| value.as_str())
            .or_else(|| map.get("id").and_then(|value| value.as_str())),
        _ => None,
    })
}

fn relation_identity_hint(rel: &Value) -> String {
    let source = relation_endpoint(rel, "source").unwrap_or("?");
    let target = relation_endpoint(rel, "target").unwrap_or("?");
    let rel_type = relation_type_from_value(rel).unwrap_or("?");
    format!("{source} -[{rel_type}]-> {target}")
}

/// Sanitize relationship type to valid Neo4j identifier (uppercase, underscores only)
pub(super) fn sanitize_rel_type(t: &str) -> String {
    t.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' {
                c.to_ascii_uppercase()
            } else {
                '_'
            }
        })
        .collect()
}

fn append_deep_prefixed_rel_props(rel: &Value, set_parts: &mut Vec<String>) {
    let Some(props) = rel.get("relProperties").and_then(|value| value.as_object()) else {
        return;
    };

    for (source_key, value) in props {
        let Some(target_key) = explicit_deep_relation_property_key(source_key) else {
            continue;
        };
        if rel_target_already_set(set_parts, &target_key) {
            continue;
        }
        let Some(literal) = cypher_literal(value, &target_key) else {
            continue;
        };
        set_parts.push(format!(
            "r.{target_key} = COALESCE(r.{target_key}, {literal})"
        ));
    }
}

fn explicit_deep_relation_property_key(source_key: &str) -> Option<String> {
    let target = match source_key {
        "description" => "c_1_relation_description",
        "type" | "relationship" | "relationshipType" => "c_2_relation_kind",
        "createdAt" => "c_3_created_at",
        "correspondenceType" | "specificCorrespondence" | "correspondence" => "c_5_correspondence",
        "basis" => "c_5_correspondence_basis",
        "fromCoordinate" => "c_0_source_coordinate",
        "toCoordinate" => "c_0_target_coordinate",
        "realizationLevel" => "l_5_realization_level",
        "mysticalIdentity" => "l_5_mystical_identity",
        "functionalRole" | "systemicFunction" => "s_4_function_role",
        "hierarchyLevel" => "s_4_hierarchy_level",
        "insight" | "holisticInsight" => "t_5_insight",
        "patternStructure" => "p_3_pattern_structure",
        "patternName" => "p_3_pattern_name",
        "developmentalFunction" => "t_3_developmental_function",
        _ => return None,
    };
    Some(target.to_string())
}

fn rel_target_already_set(set_parts: &[String], target_key: &str) -> bool {
    let prefix = format!("r.{target_key} ");
    set_parts.iter().any(|part| part.starts_with(&prefix))
}

/// Flatten relations exported in per-node aggregated form
/// `[{coordinate, outgoing: [{target_coord, type, ...}], incoming: [{source_coord, type, ...}]}]`
/// into the standard `[{source, target, type}]` shape the importer expects.
/// Dedupes within the file so an edge listed under both endpoints lands once.
fn flatten_aggregated_relations(raw: &[Value]) -> Vec<Value> {
    use std::collections::BTreeSet;
    let mut seen: BTreeSet<(String, String, String)> = BTreeSet::new();
    let mut out = Vec::new();
    for entry in raw {
        let center = entry
            .get("coordinate")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        if center.is_empty() {
            continue;
        }
        if let Some(outgoing) = entry.get("outgoing").and_then(|v| v.as_array()) {
            for rel in outgoing {
                let target = rel.get("target_coord").and_then(|v| v.as_str());
                let rel_type = rel.get("type").and_then(|v| v.as_str());
                if let (Some(target), Some(rel_type)) = (target, rel_type) {
                    let key = (center.to_string(), target.to_string(), rel_type.to_string());
                    if seen.insert(key) {
                        out.push(serde_json::json!({
                            "source": center,
                            "target": target,
                            "type": rel_type,
                        }));
                    }
                }
            }
        }
        if let Some(incoming) = entry.get("incoming").and_then(|v| v.as_array()) {
            for rel in incoming {
                let source = rel.get("source_coord").and_then(|v| v.as_str());
                let rel_type = rel.get("type").and_then(|v| v.as_str());
                if let (Some(source), Some(rel_type)) = (source, rel_type) {
                    let key = (source.to_string(), center.to_string(), rel_type.to_string());
                    if seen.insert(key) {
                        out.push(serde_json::json!({
                            "source": source,
                            "target": center,
                            "type": rel_type,
                        }));
                    }
                }
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_rel_type() {
        assert_eq!(sanitize_rel_type("LINKS_TO"), "LINKS_TO");
        assert_eq!(
            sanitize_rel_type("SUCCEEDED_BY_AND_MANIFESTS_THROUGH"),
            "SUCCEEDED_BY_AND_MANIFESTS_THROUGH"
        );
        assert_eq!(sanitize_rel_type("has-relation"), "HAS_RELATION");
    }

    #[test]
    fn relation_family_classifies_dataset_relationships() {
        assert_eq!(relation_family_for_rel_type("CONTAINS"), "structural");
        assert_eq!(relation_family_for_rel_type("SYNCED_FROM"), "sync");
        assert_eq!(relation_family_for_rel_type("ELABORATES"), "inferred");
        assert_eq!(relation_family_for_rel_type("POS0_LINKS_TO"), "compatibility");
        assert_eq!(relation_family_for_rel_type("HAS_KERNEL_RESONANCE"), "kernel_core");
        assert_eq!(relation_family_for_rel_type("HAS_DECAN"), "correspondential");
        assert_eq!(relation_family_for_rel_type("HAS_MAQAM_FAMILY"), "correspondential");
        assert_eq!(relation_family_for_rel_type("RULED_BY"), "correspondential");
        assert_eq!(relation_family_for_rel_type("VORTEX_SPIRIT_AXIS"), "correspondential");
    }

    #[test]
    fn relation_properties_are_promoted_from_reviewed_map_only() {
        let rel = serde_json::json!({
            "relProperties": {
                "description": "relation prose",
                "correspondenceType": "harmonic",
                "functionalRole": "bridge",
                "patternStructure": "triadic",
                "mysteryField": "do not guess"
            }
        });
        let mut set_parts = Vec::new();

        append_deep_prefixed_rel_props(&rel, &mut set_parts);

        assert!(set_parts.contains(
            &"r.c_1_relation_description = COALESCE(r.c_1_relation_description, 'relation prose')"
                .into()
        ));
        assert!(set_parts
            .contains(&"r.c_5_correspondence = COALESCE(r.c_5_correspondence, 'harmonic')".into()));
        assert!(set_parts
            .contains(&"r.s_4_function_role = COALESCE(r.s_4_function_role, 'bridge')".into()));
        assert!(set_parts.contains(
            &"r.p_3_pattern_structure = COALESCE(r.p_3_pattern_structure, 'triadic')".into()
        ));
        assert!(
            set_parts.iter().all(|part| !part.contains("mystery")),
            "unreviewed relation properties must not be guessed into coordinate families"
        );
    }

    #[test]
    fn helpers_reject_null_relation_endpoints_and_strip_bom() {
        let raw = "\u{feff}[{\"coordinate\":\"#\"}]";
        assert!(strip_json_bom(raw).starts_with('['));

        let rel = serde_json::json!({
            "source": "#2",
            "target": null,
            "relType": "RELATES_TO"
        });
        assert_eq!(relation_endpoint(&rel, "target"), None);
    }

    #[test]
    fn flatten_aggregated_dedupes_across_endpoints() {
        let raw = vec![
            serde_json::json!({
                "coordinate": "#2-5-8",
                "outgoing": [{"target_coord": "#2-5-9", "type": "HARMONICALLY_LEADS_TO"}],
                "incoming": []
            }),
            serde_json::json!({
                "coordinate": "#2-5-9",
                "outgoing": [],
                "incoming": [{"source_coord": "#2-5-8", "type": "HARMONICALLY_LEADS_TO"}]
            }),
        ];
        let flat = flatten_aggregated_relations(&raw);
        assert_eq!(
            flat.len(),
            1,
            "duplicate edge listed under both endpoints should dedupe"
        );
        assert_eq!(flat[0]["source"], "#2-5-8");
        assert_eq!(flat[0]["target"], "#2-5-9");
        assert_eq!(flat[0]["type"], "HARMONICALLY_LEADS_TO");
    }
}
