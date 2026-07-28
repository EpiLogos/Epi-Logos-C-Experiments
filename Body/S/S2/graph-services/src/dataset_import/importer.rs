//! dataset_import::importer — the `DatasetImporter` and its node/relation loops.
//!
//! Holds the `DatasetImporter` struct plus `import_nodes_with_metadata` /
//! `import_relations_with_metadata` and the branch orchestration around them
//! (`import_all`, `import_low_detail_all`, `import_deep_all`, labels, etc.). The
//! reusable field mapping, plan tables, JSON readers, and Cypher escaping live in
//! sibling modules. Split out of the former `dataset_import.rs` per
//! S2-ARCHITECTURE.md §5.7 (finding 7).

use super::branch::{DatasetBranch, DatasetBranchReport, DatasetImportReport, DatasetSkip};
use super::cypher::escape_cypher;
use super::json_utils::{
    coordinate_from_node, node_text_property, relation_endpoint, relation_type_from_value,
    sanitize_json_control_chars, strip_json_bom, truncate_utf8,
};
use super::plans::{canonical_dataset_plan, deep_dataset_plan, low_detail_dataset_plan};
use super::property_mapping::{
    append_deep_prefixed_filtered_props, append_deep_prefixed_rel_props, layer_string,
    relation_family_for_rel_type, sanitize_rel_type,
};
use crate::coordinate::{convert_hash_to_m_family, wrap_context_frames, CoordinateArrayParser};
use crate::Neo4jClient;
use epi_s2_graph_schema::RELATION_FAMILY_PROPERTY;
use serde_json::Value;
use std::path::{Path, PathBuf};
use uuid::Uuid;

#[derive(Debug, Clone, Default, PartialEq, Eq)]
struct DatasetNodeImportOutcome {
    imported: Vec<String>,
    skipped: Vec<DatasetSkip>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub(super) struct DatasetRelationImportOutcome {
    pub(super) imported: Vec<String>,
    pub(super) skipped: Vec<DatasetSkip>,
}

pub struct DatasetImporter<'a> {
    pub(super) client: &'a Neo4jClient,
    pub(super) datasets_dir: String,
}

impl<'a> DatasetImporter<'a> {
    pub fn new(client: &'a Neo4jClient, datasets_dir: &str) -> Self {
        Self {
            client,
            datasets_dir: datasets_dir.to_string(),
        }
    }

    /// Import a nodes JSON file. Each entry becomes a Bimba node.
    /// Uses MERGE on coordinate to avoid duplicates with seed data.
    pub async fn import_nodes(&self, filename: &str) -> Result<usize, String> {
        let report = self.import_nodes_with_metadata(filename, None).await?;
        Ok(report.imported.len())
    }

    async fn import_nodes_with_metadata(
        &self,
        filename: &str,
        branch: Option<&DatasetBranch>,
    ) -> Result<DatasetNodeImportOutcome, String> {
        let path = self.resolve_dataset_path(filename);
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", path.display(), e))?;
        let sanitized = sanitize_json_control_chars(strip_json_bom(&data));
        let nodes: Vec<Value> = serde_json::from_str(&sanitized)
            .map_err(|e| format!("parse {}: {}", path.display(), e))?;

        let mut outcome = DatasetNodeImportOutcome::default();
        for node in &nodes {
            // DR-M3-1 import-time law: reject the TCT 8-count dataset error
            if let Some(reason) = reject_tct_cardinality_eight(node) {
                outcome.skipped.push(DatasetSkip {
                    item: node_identity_hint(node),
                    reason,
                });
                continue;
            }
            let raw_coord = match coordinate_from_node(node) {
                Some(c) => c,
                None => {
                    outcome.skipped.push(DatasetSkip {
                        item: node_identity_hint(node),
                        reason: "missing coordinate or filteredProps.bimbaCoordinate".into(),
                    });
                    continue;
                }
            };
            let coord = wrap_context_frames(&convert_hash_to_m_family(raw_coord));
            let parsed = CoordinateArrayParser::parse_one(&coord).ok();

            let mut set_parts = Vec::new();

            // Provenance (C3 — process)
            set_parts.push(format!(
                "n.c_3_source_dataset = COALESCE(n.c_3_source_dataset, 'bimba')"
            ));
            if let Some(branch) = branch {
                set_parts.push(format!(
                    "n.c_3_dataset_branch = '{}'",
                    escape_cypher(branch.id)
                ));
                set_parts.push(format!(
                    "n.c_3_dataset_branch_label = '{}'",
                    escape_cypher(branch.label)
                ));
            }

            // Deterministic UUID v5 from coordinate (C2 — Entity).
            let uuid = Uuid::new_v5(&Uuid::NAMESPACE_OID, coord.as_bytes());
            set_parts.push(format!("n.c_2_uuid = COALESCE(n.c_2_uuid, '{}')", uuid));

            // Computed coordinate-driven metadata (C4 — Type).
            if let Some(parsed) = &parsed {
                if let Some(family) = &parsed.family {
                    set_parts.push(format!(
                        "n.c_4_family = COALESCE(n.c_4_family, '{}')",
                        escape_cypher(family)
                    ));
                }
                if let Some(pos) = parsed.ql_position {
                    set_parts.push(format!(
                        "n.c_4_ql_position = COALESCE(n.c_4_ql_position, {})",
                        pos
                    ));
                }
                // `c_4_layer` is written ONLY where it discriminates. The
                // `Family` case used to stamp the literal 'COORDINATE' onto
                // every imported node — a tautology on a coordinate graph, and
                // worse than useless in practice: it landed on nodes labelled
                // Hexagram, Maqam, DivineName, Degree/ClockPosition, Codon and
                // GenerationEvent, none of which are coordinates. 1,940 of
                // 1,978 nodes carried it. The labels already carry the real
                // typology, so the flat default only misinformed.
                if let Some(layer_str) = layer_string(&parsed.layer) {
                    set_parts.push(format!(
                        "n.c_4_layer = COALESCE(n.c_4_layer, '{}')",
                        layer_str
                    ));
                }
                if parsed.inverted {
                    set_parts.push(
                        "n.c_4_inversion_state = COALESCE(n.c_4_inversion_state, 1)".to_string(),
                    );
                }
            }

            // Identity (C1 — Form)
            if let Some(name) = node_text_property(
                node,
                &[
                    "name",
                    "title",
                    "primaryDesignation",
                    "label",
                    "displayName",
                ],
            ) {
                set_parts.push(format!(
                    "n.c_1_name = COALESCE(n.c_1_name, '{}')",
                    escape_cypher(name)
                ));
            }
            if let Some(desc) = node_text_property(
                node,
                &[
                    "description",
                    "summary",
                    "operationalDescription",
                    "bimbaDescription",
                ],
            ) {
                set_parts.push(format!(
                    "n.c_1_description = COALESCE(n.c_1_description, '{}')",
                    escape_cypher(truncate_utf8(desc, 2000))
                ));
            }
            if let Some(form) = node_text_property(
                node,
                &[
                    "formulation",
                    "form",
                    "operationalFormulation",
                    "metaphysicalFormulation",
                ],
            ) {
                set_parts.push(format!(
                    "n.c_1_form = COALESCE(n.c_1_form, '{}')",
                    escape_cypher(truncate_utf8(form, 2000))
                ));
            }
            if let Some(structure) = node_text_property(
                node,
                &["structure", "structuralPattern", "operationalStructure"],
            ) {
                set_parts.push(format!(
                    "n.c_1_structure = COALESCE(n.c_1_structure, '{}')",
                    escape_cypher(truncate_utf8(structure, 2000))
                ));
            }

            // Ground / essence (C0 — Bimba)
            if let Some(essence) = node_text_property(
                node,
                &[
                    "essence",
                    "operationalEssence",
                    "metaphysicalEssence",
                    "ontologicalEssence",
                ],
            ) {
                set_parts.push(format!(
                    "n.c_0_essence = COALESCE(n.c_0_essence, '{}')",
                    escape_cypher(truncate_utf8(essence, 1000))
                ));
            }
            if let Some(core_nature) = node_text_property(node, &["coreNature", "core_nature"]) {
                set_parts.push(format!(
                    "n.c_0_core_nature = COALESCE(n.c_0_core_nature, '{}')",
                    escape_cypher(truncate_utf8(core_nature, 1000))
                ));
            }

            append_deep_prefixed_filtered_props(node, parsed.as_ref(), &mut set_parts);

            // Per-node `labels` field (added by Bimba label exports). When present,
            // these are authoritative — applied via APOC after the MERGE.
            let node_labels: Vec<String> = node
                .get("labels")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str())
                        .filter(|s| {
                            !s.is_empty()
                                && *s != "Bimba"
                                && *s != "BimbaNode"
                                && *s != "BimbaCoordinate"
                        })
                        .map(|s| s.to_string())
                        .collect()
                })
                .unwrap_or_default();

            let cypher = format!(
                "MERGE (n:Bimba {{coordinate: '{}'}}) SET {} RETURN n.coordinate",
                escape_cypher(&coord),
                set_parts.join(", ")
            );

            match self.client.run(&cypher).await {
                Ok(rows) if !rows.is_empty() => outcome.imported.push(coord.clone()),
                Ok(_) => outcome.skipped.push(DatasetSkip {
                    item: coord.clone(),
                    reason: "Neo4j write returned no node confirmation".into(),
                }),
                Err(e) => {
                    let reason = e.to_string();
                    eprintln!("  warn: skip node '{}': {}", coord, reason);
                    outcome.skipped.push(DatasetSkip {
                        item: coord.clone(),
                        reason,
                    });
                    continue;
                }
            }

            if !node_labels.is_empty() {
                let labels_lit = node_labels
                    .iter()
                    .map(|l| format!("'{}'", escape_cypher(l)))
                    .collect::<Vec<_>>()
                    .join(", ");
                let label_cypher = format!(
                    "MATCH (n:Bimba {{coordinate: '{}'}}) \
                     CALL apoc.create.addLabels(n, [{}]) YIELD node RETURN node.coordinate",
                    escape_cypher(&coord),
                    labels_lit
                );
                if let Err(e) = self.client.run(&label_cypher).await {
                    eprintln!("  warn: skip labels for '{}': {}", coord, e);
                }
            }

            // Tie every embedded context frame to its canonical CF_* node via OPERATES_IN.
            // `(0/1) → CF_BINARY`, `(5/0) → CF_MOBIUS`, all `(4.*/*) → CF_FRACTAL`, etc.
            for frame in crate::coordinate::extract_context_frames(&coord) {
                let Some(cf_node) = crate::coordinate::cf_node_for_frame(&frame) else {
                    continue;
                };
                let op_cypher = format!(
                    "MATCH (s:Bimba {{coordinate: '{src}'}}) \
                     MATCH (t:Bimba {{coordinate: '{tgt}'}}) \
                     MERGE (s)-[r:OPERATES_IN]->(t) \
                     ON CREATE SET r.c_3_created_at = datetime(), \
                                   r.c_0_source_coordinate = '{src}', \
                                   r.c_0_target_coordinate = '{tgt}', \
                                   r.c_2_relation_type = 'OPERATES_IN'",
                    src = escape_cypher(&coord),
                    tgt = cf_node,
                );
                if let Err(e) = self.client.run(&op_cypher).await {
                    eprintln!(
                        "  warn: skip OPERATES_IN '{}' -> '{}': {}",
                        coord, cf_node, e
                    );
                }
            }
        }
        Ok(outcome)
    }

    /// Import all canonical datasets in dependency order.
    pub async fn import_all(&self) -> Result<String, String> {
        let report = self
            .import_branches(canonical_dataset_plan(Path::new(&self.datasets_dir)))
            .await?;
        let labels_report = self
            .import_labels_if_present("low-detail/bimba_labels.json")
            .await?;
        Ok(format!("{}\n{}", report.render(), labels_report))
    }

    pub async fn import_low_detail_all(&self) -> Result<String, String> {
        let report = self.import_branches(low_detail_dataset_plan()).await?;
        let labels_report = self
            .import_labels_if_present("low-detail/bimba_labels.json")
            .await?;
        Ok(format!("{}\n{}", report.render(), labels_report))
    }

    pub async fn import_deep_all(&self) -> Result<String, String> {
        self.import_branches(deep_dataset_plan())
            .await
            .map(|report| report.render())
    }

    pub async fn import_deep_branch(&self, branch_id: &str) -> Result<String, String> {
        let branch = deep_dataset_plan()
            .into_iter()
            .find(|branch| branch.id == branch_id)
            .ok_or_else(|| format!("unknown deep dataset branch: {}", branch_id))?;
        self.import_branches(vec![branch])
            .await
            .map(|report| report.render())
    }

    async fn import_branches(
        &self,
        branches: Vec<DatasetBranch>,
    ) -> Result<DatasetImportReport, String> {
        let mut report = DatasetImportReport::default();
        for branch in branches {
            if !self.resolve_dataset_path(branch.nodes_file).exists() {
                continue;
            }
            let node_outcome = self
                .import_nodes_with_metadata(branch.nodes_file, Some(&branch))
                .await?;
            let relation_outcome = match branch.relations_file {
                Some(rel_file) if self.resolve_dataset_path(rel_file).exists() => {
                    self.import_relations_with_metadata(rel_file, Some(&branch))
                        .await?
                }
                _ => DatasetRelationImportOutcome::default(),
            };
            report.push(DatasetBranchReport {
                branch_id: branch.id.into(),
                label: branch.label.into(),
                nodes: node_outcome.imported.len(),
                relations: relation_outcome.imported.len(),
                skipped_nodes: node_outcome.skipped.len(),
                skipped_relations: relation_outcome.skipped.len(),
                imported_nodes: node_outcome.imported,
                imported_relations: relation_outcome.imported,
                skipped_node_details: node_outcome.skipped,
                skipped_relation_details: relation_outcome.skipped,
            });
        }
        Ok(report)
    }

    pub(super) fn resolve_dataset_path(&self, filename: &str) -> PathBuf {
        Path::new(&self.datasets_dir).join(filename)
    }

    /// Apply secondary labels from a `[{coord, labels}]` JSON file to existing :Bimba
    /// nodes. Coordinates are `# → M`-converted before matching. Nodes referenced by
    /// the label file that don't yet exist are CREATEd as stubs so the variant Bimba
    /// structure stays whole (the QL ideal 0..=5 doesn't gate which positions exist —
    /// real subsystems have decan degrees 0..=360, codon indices 0..=63, etc.).
    ///
    /// Requires APOC (`apoc.create.addLabels`). Returns a human-readable summary.
    pub async fn import_labels_if_present(&self, filename: &str) -> Result<String, String> {
        let path = self.resolve_dataset_path(filename);
        if !path.exists() {
            return Ok(format!("Labels import skipped: {} not present", filename));
        }
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", path.display(), e))?;
        let sanitized = sanitize_json_control_chars(strip_json_bom(&data));
        let entries: Vec<Value> = serde_json::from_str(&sanitized)
            .map_err(|e| format!("parse {}: {}", path.display(), e))?;

        const EXCLUDE: &[&str] = &["Bimba", "BimbaNode", "BimbaCoordinate"];
        let mut stubbed = 0usize;
        let mut labeled = 0usize;
        let mut skipped = 0usize;

        for entry in &entries {
            let raw_coord = match entry.get("coord").and_then(|v| v.as_str()) {
                Some(c) if !c.trim().is_empty() => c,
                _ => {
                    skipped += 1;
                    continue;
                }
            };
            let coord = wrap_context_frames(&convert_hash_to_m_family(raw_coord));
            let labels: Vec<&str> = entry
                .get("labels")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str())
                        .filter(|l| !EXCLUDE.contains(l) && !l.is_empty())
                        .collect()
                })
                .unwrap_or_default();
            if labels.is_empty() {
                skipped += 1;
                continue;
            }
            let labels_lit = labels
                .iter()
                .map(|l| format!("'{}'", escape_cypher(l)))
                .collect::<Vec<_>>()
                .join(", ");

            // Pre-check whether the node already exists so we report stub creations honestly.
            let exists_cypher = format!(
                "MATCH (n:Bimba {{coordinate: '{}'}}) RETURN 1 AS hit LIMIT 1",
                escape_cypher(&coord)
            );
            let pre_exists = self
                .client
                .run(&exists_cypher)
                .await
                .map(|rows| !rows.is_empty())
                .unwrap_or(false);

            let cypher = format!(
                "MERGE (n:Bimba {{coordinate: '{coord}'}}) \
                 ON CREATE SET n.c_3_source_dataset = 'bimba-labels', \
                               n.c_3_dataset_branch = 'low-detail/labels-only' \
                 WITH n \
                 CALL apoc.create.addLabels(n, [{labels_lit}]) YIELD node \
                 RETURN node.coordinate AS coord",
                coord = escape_cypher(&coord),
                labels_lit = labels_lit,
            );

            match self.client.run(&cypher).await {
                Ok(_) => {
                    labeled += 1;
                    if !pre_exists {
                        stubbed += 1;
                    }
                }
                Err(e) => {
                    eprintln!("  warn: skip labels for '{}': {}", coord, e);
                    skipped += 1;
                }
            }
        }
        Ok(format!(
            "Labels applied: {} nodes labeled ({} newly stubbed, {} skipped)",
            labeled, stubbed, skipped
        ))
    }
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
            set_parts.push(format!(
                "r.{RELATION_FAMILY_PROPERTY} = COALESCE(r.{RELATION_FAMILY_PROPERTY}, '{}')",
                relation_family_for_rel_type(&rel_type)
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

fn node_identity_hint(node: &Value) -> String {
    node_text_property(node, &["name", "title", "label", "primaryDesignation"])
        .map(|value| truncate_utf8(value, 96).to_string())
        .unwrap_or_else(|| "<node-without-coordinate>".into())
}

fn relation_identity_hint(rel: &Value) -> String {
    let source = relation_endpoint(rel, "source").unwrap_or("?");
    let target = relation_endpoint(rel, "target").unwrap_or("?");
    let rel_type = relation_type_from_value(rel).unwrap_or("?");
    format!("{source} -[{rel_type}]-> {target}")
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

/// DR-M3-1 import-time law: the runtime codon law is authority — TCT is a
/// 7-state non-dual codon; a dataset node claiming `cardinality = 8` (or a
/// rotational/state count of 8) for TCT is the known Nine-of-Wands dataset
/// error and must be REJECTED at import, never written to the graph.
fn reject_tct_cardinality_eight(node: &Value) -> Option<String> {
    let text_mentions_tct = ["name", "title", "label", "codon"].iter().any(|key| {
        node.get(key)
            .or_else(|| node.get("filteredProps").and_then(|p| p.get(key)))
            .and_then(Value::as_str)
            .is_some_and(|v| v.to_ascii_uppercase().contains("TCT"))
    });
    if !text_mentions_tct {
        return None;
    }
    for key in ["cardinality", "rotationalStates", "stateCount"] {
        let claimed = node
            .get(key)
            .or_else(|| node.get("filteredProps").and_then(|p| p.get(key)))
            .and_then(Value::as_u64);
        if claimed == Some(8) {
            return Some(format!(
                "DR-M3-1: TCT is 7-state non-dual (runtime classify_codon law); dataset {key}=8 rejected"
            ));
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

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

    /// DR-M3-1: the import validator rejects the Nine-of-Wands 8-count on TCT
    /// and accepts the corrected 7 (and non-TCT nodes untouched).
    #[test]
    fn tct_cardinality_eight_rejected_seven_accepted() {
        let bad = json!({"name": "TCT — Nine of Wands", "cardinality": 8});
        assert!(reject_tct_cardinality_eight(&bad).is_some());
        let bad_nested = json!({"filteredProps": {"codon": "tct", "rotationalStates": 8}});
        assert!(reject_tct_cardinality_eight(&bad_nested).is_some());
        let good = json!({"name": "TCT", "cardinality": 7});
        assert!(reject_tct_cardinality_eight(&good).is_none());
        let unrelated = json!({"name": "GGG", "cardinality": 8});
        assert!(reject_tct_cardinality_eight(&unrelated).is_none());
    }
}
