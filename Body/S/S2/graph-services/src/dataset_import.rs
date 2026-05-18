use crate::coordinate::{convert_hash_to_m_family, wrap_context_frames, CoordLayer, CoordinateArrayParser};
use crate::Neo4jClient;
use serde_json::Value;
use std::path::{Path, PathBuf};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DatasetBranch {
    pub id: &'static str,
    pub label: &'static str,
    pub nodes_file: &'static str,
    pub relations_file: Option<&'static str>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DatasetImportReport {
    pub branches: Vec<DatasetBranchReport>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DatasetBranchReport {
    pub branch_id: String,
    pub label: String,
    pub nodes: usize,
    pub relations: usize,
    pub skipped_nodes: usize,
    pub skipped_relations: usize,
}

impl DatasetImportReport {
    pub fn push(&mut self, branch: DatasetBranchReport) {
        self.branches.push(branch);
    }

    pub fn render(&self) -> String {
        if self.branches.is_empty() {
            return "Dataset import complete: no dataset files found".into();
        }

        let lines = self
            .branches
            .iter()
            .map(|branch| {
                format!(
                    "  {}: {} nodes, {} relations, {} skipped nodes, {} skipped relations",
                    branch.label,
                    branch.nodes,
                    branch.relations,
                    branch.skipped_nodes,
                    branch.skipped_relations
                )
            })
            .collect::<Vec<_>>()
            .join("\n");
        format!("Dataset import complete:\n{}", lines)
    }
}

pub struct DatasetImporter<'a> {
    client: &'a Neo4jClient,
    datasets_dir: String,
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
        Ok(report.0)
    }

    async fn import_nodes_with_metadata(
        &self,
        filename: &str,
        branch: Option<&DatasetBranch>,
    ) -> Result<(usize, usize), String> {
        let path = self.resolve_dataset_path(filename);
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", path.display(), e))?;
        let nodes: Vec<Value> = serde_json::from_str(strip_json_bom(&data))
            .map_err(|e| format!("parse {}: {}", path.display(), e))?;

        let mut count = 0;
        let mut skipped = 0;
        for node in &nodes {
            let raw_coord = match coordinate_from_node(node) {
                Some(c) => c,
                None => {
                    skipped += 1;
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
                    "n.c_3_dataset_branch = COALESCE(n.c_3_dataset_branch, '{}')",
                    escape_cypher(branch.id)
                ));
                set_parts.push(format!(
                    "n.c_3_dataset_branch_label = COALESCE(n.c_3_dataset_branch_label, '{}')",
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
                let layer_str = layer_string(&parsed.layer);
                set_parts.push(format!(
                    "n.c_4_layer = COALESCE(n.c_4_layer, '{}')",
                    layer_str
                ));
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

            // Compat — preserve legacy bimbaCoordinate when it differs from new form.
            if let Some(legacy) = legacy_bimba_coordinate(node) {
                if legacy != coord {
                    set_parts.push(format!(
                        "n.bimbaCoordinate = COALESCE(n.bimbaCoordinate, '{}')",
                        escape_cypher(legacy)
                    ));
                }
            }

            // Per-node `labels` field (added by Bimba label exports). When present,
            // these are authoritative — applied via APOC after the MERGE.
            let node_labels: Vec<String> = node
                .get("labels")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str())
                        .filter(|s| !s.is_empty()
                            && *s != "Bimba"
                            && *s != "BimbaNode"
                            && *s != "BimbaCoordinate")
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
                Ok(_) => count += 1,
                Err(e) => {
                    eprintln!("  warn: skip node '{}': {}", coord, e);
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
        }
        Ok((count, skipped))
    }

    /// Import a relations JSON file. Each entry becomes a Neo4j relationship.
    pub async fn import_relations(&self, filename: &str) -> Result<usize, String> {
        let report = self.import_relations_with_metadata(filename, None).await?;
        Ok(report.0)
    }

    async fn import_relations_with_metadata(
        &self,
        filename: &str,
        branch: Option<&DatasetBranch>,
    ) -> Result<(usize, usize), String> {
        let path = self.resolve_dataset_path(filename);
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", path.display(), e))?;
        let raw: Vec<Value> = serde_json::from_str(strip_json_bom(&data))
            .map_err(|e| format!("parse {}: {}", path.display(), e))?;

        // Detect aggregated shape `[{coordinate, outgoing, incoming}]` and flatten
        // into the standard `[{source, target, type}]` shape the loop expects.
        let rels: Vec<Value> = if raw.iter().any(|r| r.get("outgoing").is_some() || r.get("incoming").is_some()) {
            flatten_aggregated_relations(&raw)
        } else {
            raw
        };

        let mut count = 0;
        let mut skipped = 0;
        for rel in &rels {
            let raw_source = match relation_endpoint(rel, "source") {
                Some(s) => s,
                None => {
                    skipped += 1;
                    continue;
                }
            };
            let raw_target = match relation_endpoint(rel, "target") {
                Some(t) => t,
                None => {
                    skipped += 1;
                    continue;
                }
            };
            let source = wrap_context_frames(&convert_hash_to_m_family(raw_source));
            let target = wrap_context_frames(&convert_hash_to_m_family(raw_target));

            let rel_type = match relation_type_from_value(rel) {
                Some(t) => sanitize_rel_type(t),
                None => {
                    skipped += 1;
                    continue;
                }
            };

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
                    "r.c_3_dataset_branch = COALESCE(r.c_3_dataset_branch, '{}')",
                    escape_cypher(branch.id)
                ));
            }
            let set_clause = format!(" SET {}", set_parts.join(", "));

            let cypher = format!(
                "MATCH (s:Bimba {{coordinate: '{}'}}) \
                 MATCH (t:Bimba {{coordinate: '{}'}}) \
                 MERGE (s)-[r:{}]->(t){}",
                escape_cypher(&source),
                escape_cypher(&target),
                rel_type,
                set_clause
            );

            match self.client.run(&cypher).await {
                Ok(_) => count += 1,
                Err(e) => {
                    eprintln!(
                        "  warn: skip rel {} -[{}]-> {}: {}",
                        source, rel_type, target, e
                    );
                }
            }
        }
        Ok((count, skipped))
    }

    /// Import all canonical datasets in dependency order.
    pub async fn import_all(&self) -> Result<String, String> {
        self.import_branches(canonical_dataset_plan(Path::new(&self.datasets_dir)))
            .await
            .map(|report| report.render())
    }

    pub async fn import_low_detail_all(&self) -> Result<String, String> {
        let report = self.import_branches(low_detail_dataset_plan()).await?;
        let labels_report = self.import_labels_if_present("low-detail/bimba_labels.json").await?;
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
            let (nodes, skipped_nodes) = self
                .import_nodes_with_metadata(branch.nodes_file, Some(&branch))
                .await?;
            let (relations, skipped_relations) = match branch.relations_file {
                Some(rel_file) if self.resolve_dataset_path(rel_file).exists() => {
                    self.import_relations_with_metadata(rel_file, Some(&branch))
                        .await?
                }
                _ => (0, 0),
            };
            report.push(DatasetBranchReport {
                branch_id: branch.id.into(),
                label: branch.label.into(),
                nodes,
                relations,
                skipped_nodes,
                skipped_relations,
            });
        }
        Ok(report)
    }

    fn resolve_dataset_path(&self, filename: &str) -> PathBuf {
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
        let entries: Vec<Value> = serde_json::from_str(strip_json_bom(&data))
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

pub fn canonical_dataset_plan(datasets_dir: &Path) -> Vec<DatasetBranch> {
    let mut branches = Vec::new();
    if datasets_dir.join("low-detail").exists() {
        branches.extend(low_detail_dataset_plan());
    }
    branches.extend(deep_dataset_plan());
    branches
}

pub fn low_detail_dataset_plan() -> Vec<DatasetBranch> {
    vec![
        DatasetBranch {
            id: "low-detail/hash",
            label: "M# Root",
            nodes_file: "low-detail/nodes_hash.json",
            relations_file: Some("low-detail/relations_hash.json"),
        },
        DatasetBranch {
            id: "low-detail/foundation",
            label: "M Foundation",
            nodes_file: "low-detail/nodes_hash.json",
            relations_file: Some("low-detail/relations_foundation.json"),
        },
        DatasetBranch {
            id: "low-detail/anuttara",
            label: "M0 Anuttara",
            nodes_file: "low-detail/nodes_anuttara.json",
            relations_file: Some("low-detail/relations_anuttara.json"),
        },
        DatasetBranch {
            id: "low-detail/paramasiva",
            label: "M1 Paramasiva",
            nodes_file: "low-detail/nodes_paramasiva.json",
            relations_file: Some("low-detail/relations_paramasiva.json"),
        },
        DatasetBranch {
            id: "low-detail/parashakti",
            label: "M2 Parashakti",
            nodes_file: "low-detail/nodes_parashakti.json",
            relations_file: Some("low-detail/relations_parashakti.json"),
        },
        DatasetBranch {
            id: "low-detail/mahamaya",
            label: "M3 Mahamaya",
            nodes_file: "low-detail/nodes_mahamaya.json",
            relations_file: Some("low-detail/relations_mahamaya.json"),
        },
        DatasetBranch {
            id: "low-detail/nara",
            label: "M4 Nara",
            nodes_file: "low-detail/nodes_nara.json",
            relations_file: Some("low-detail/relations_nara.json"),
        },
        DatasetBranch {
            id: "low-detail/epii",
            label: "M5 Epii",
            nodes_file: "low-detail/nodes_epii.json",
            relations_file: Some("low-detail/relations_epii.json"),
        },
        // Parashakti stragglers: Neptune (M2-5-8) and Pluto (M2-5-9) — variant
        // positions beyond the QL ideal of 0..=5 that round out the 9-planet
        // harmonic. Sourced separately because the rest of low-detail froze the
        // 7-planet form. The relations file is in per-node aggregated shape;
        // import_relations_with_metadata handles either shape.
        DatasetBranch {
            id: "low-detail/parashakti-stragglers",
            label: "M2 Parashakti Stragglers",
            nodes_file: "low-detail/parashakti-stragglers-nodes.json",
            relations_file: Some("low-detail/parashakti-stragglers-relations.json"),
        },
    ]
}

pub fn deep_dataset_plan() -> Vec<DatasetBranch> {
    vec![
        DatasetBranch {
            id: "anuttara-deep",
            label: "M0 Anuttara Deep",
            nodes_file: "anuttara-deep/nodes-full-data.json",
            relations_file: Some("anuttara-deep/relations.json"),
        },
        DatasetBranch {
            id: "paramasiva-deep",
            label: "M1 Paramasiva Deep",
            nodes_file: "paramasiva-deep/nodes-full-detail.json",
            relations_file: Some("paramasiva-deep/relations.json"),
        },
        DatasetBranch {
            id: "parashakti-deep",
            label: "M2 Parashakti Deep",
            nodes_file: "parashakti-deep/nodes-full-detail.json",
            relations_file: Some("parashakti-deep/relations.json"),
        },
        DatasetBranch {
            id: "mahamaya-deep",
            label: "M3 Mahamaya Deep",
            nodes_file: "mahamaya-deep/nodes-full-detail.json",
            relations_file: Some("mahamaya-deep/relations.json"),
        },
        DatasetBranch {
            id: "nara-deep",
            label: "M4 Nara Deep",
            nodes_file: "nara-deep/nodes-full-detail.json",
            relations_file: Some("nara-deep/relations.json"),
        },
        DatasetBranch {
            id: "epii-deep",
            label: "M5 Epii Deep",
            nodes_file: "epii-deep/nodes-full-details.json",
            relations_file: Some("epii-deep/relations.json"),
        },
    ]
}

pub fn strip_json_bom(raw: &str) -> &str {
    raw.trim_start_matches('\u{feff}')
}

pub fn coordinate_from_node(node: &Value) -> Option<&str> {
    node.get("coordinate")
        .and_then(|value| value.as_str())
        .or_else(|| nested_filtered_property(node, "coordinate"))
        .or_else(|| nested_filtered_property(node, "bimbaCoordinate"))
}

pub fn node_text_property<'a>(node: &'a Value, keys: &[&str]) -> Option<&'a str> {
    for key in keys {
        if let Some(value) = node.get(*key).and_then(|value| value.as_str()) {
            return Some(value);
        }
        if let Some(value) = nested_filtered_property(node, key) {
            return Some(value);
        }
    }
    None
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

/// Escape single quotes for Cypher string literals
fn escape_cypher(s: &str) -> String {
    s.replace('\\', "\\\\").replace('\'', "\\'")
}

/// Sanitize relationship type to valid Neo4j identifier (uppercase, underscores only)
fn sanitize_rel_type(t: &str) -> String {
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

fn nested_filtered_property<'a>(node: &'a Value, key: &str) -> Option<&'a str> {
    node.get("filteredProps")?
        .get(key)
        .and_then(|value| value.as_str())
}

fn legacy_bimba_coordinate(node: &Value) -> Option<&str> {
    nested_filtered_property(node, "bimbaCoordinate")
        .or_else(|| node.get("bimbaCoordinate").and_then(|value| value.as_str()))
}

fn truncate_utf8(value: &str, max_len: usize) -> &str {
    if value.len() <= max_len {
        return value;
    }
    let mut end = max_len;
    while !value.is_char_boundary(end) {
        end -= 1;
    }
    &value[..end]
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

fn layer_string(layer: &CoordLayer) -> &'static str {
    match layer {
        CoordLayer::Psychoid => "PSYCHOID",
        CoordLayer::Family => "COORDINATE",
        CoordLayer::FamilyRoot => "FAMILY_ROOT",
        CoordLayer::Lens => "LENS",
        CoordLayer::ContextFrame => "CONTEXT_FRAME",
        CoordLayer::Vak => "VAK",
        CoordLayer::Weave => "WEAVE",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_cypher() {
        assert_eq!(escape_cypher("hello"), "hello");
        assert_eq!(escape_cypher("it's"), "it\\'s");
        assert_eq!(escape_cypher("a\\b"), "a\\\\b");
    }

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
    fn canonical_plan_covers_low_detail_and_deep_branches() {
        let plan = canonical_dataset_plan(Path::new("../../../../docs/datasets"));
        assert!(plan
            .iter()
            .any(|branch| branch.id == "low-detail/parashakti"));
        assert!(plan.iter().any(|branch| branch.id == "parashakti-deep"));
        assert_eq!(deep_dataset_plan().len(), 6);
    }

    #[test]
    fn helpers_understand_deep_dataset_shape() {
        let node = serde_json::json!({
            "coordinate": "#2-3-0",
            "filteredProps": {
                "bimbaCoordinate": "#2-3-0",
                "operationalEssence": "Parashakti operational body"
            }
        });
        assert_eq!(coordinate_from_node(&node), Some("#2-3-0"));
        assert_eq!(
            node_text_property(&node, &["essence", "operationalEssence"]),
            Some("Parashakti operational body")
        );

        let rel = serde_json::json!({
            "source": "#2",
            "target": "#2-3",
            "relType": "has-deep child"
        });
        assert_eq!(relation_endpoint(&rel, "source"), Some("#2"));
        assert_eq!(relation_type_from_value(&rel), Some("has-deep child"));
        assert_eq!(
            sanitize_rel_type(relation_type_from_value(&rel).unwrap()),
            "HAS_DEEP_CHILD"
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
    fn layer_string_covers_all_variants() {
        assert_eq!(layer_string(&CoordLayer::Psychoid), "PSYCHOID");
        assert_eq!(layer_string(&CoordLayer::Family), "COORDINATE");
        assert_eq!(layer_string(&CoordLayer::FamilyRoot), "FAMILY_ROOT");
        assert_eq!(layer_string(&CoordLayer::Lens), "LENS");
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
        assert_eq!(flat.len(), 1, "duplicate edge listed under both endpoints should dedupe");
        assert_eq!(flat[0]["source"], "#2-5-8");
        assert_eq!(flat[0]["target"], "#2-5-9");
        assert_eq!(flat[0]["type"], "HARMONICALLY_LEADS_TO");
    }
}
