use crate::coordinate::{
    convert_hash_to_m_family, wrap_context_frames, CoordLayer, CoordinateArrayParser,
};
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

const STRING_LIST_TARGETS: &[&str] = &[
    "c_4_ql_operator_types",
    "c_5_resonances",
    "l_2_therapeutic_properties",
    "s_5_tool_affinity",
];

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
        let sanitized = sanitize_json_control_chars(strip_json_bom(&data));
        let nodes: Vec<Value> = serde_json::from_str(&sanitized)
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
            append_deep_prefixed_rel_props(rel, &mut set_parts);
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

fn sanitize_json_control_chars(raw: &str) -> String {
    let mut result = String::with_capacity(raw.len());
    let mut in_string = false;
    let mut escaped = false;

    for ch in raw.chars() {
        if escaped {
            result.push(ch);
            escaped = false;
            continue;
        }

        if ch == '\\' {
            result.push(ch);
            escaped = true;
            continue;
        }

        if ch == '"' {
            in_string = !in_string;
            result.push(ch);
            continue;
        }

        match ch {
            '\n' if in_string => result.push_str("\\n"),
            '\r' if in_string => result.push_str("\\r"),
            '\t' if in_string => result.push_str("\\t"),
            _ => result.push(ch),
        }
    }

    result
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
    s.replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
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

fn append_deep_prefixed_filtered_props(
    node: &Value,
    parsed: Option<&crate::coordinate::ParsedCoordinate>,
    set_parts: &mut Vec<String>,
) {
    let Some(props) = node
        .get("filteredProps")
        .and_then(|value| value.as_object())
    else {
        return;
    };

    for (source_key, value) in props {
        if is_deep_coordinate_source_key(source_key) {
            continue;
        }
        let Some(target_key) = canonical_deep_property_key(source_key, node, parsed) else {
            continue;
        };
        if target_already_set(set_parts, &target_key) {
            continue;
        }
        let Some(literal) = cypher_literal(value, &target_key) else {
            continue;
        };
        set_parts.push(format!("n.{target_key} = {literal}"));
    }
}

fn is_deep_coordinate_source_key(source_key: &str) -> bool {
    matches!(source_key, "coordinate" | "bimbaCoordinate")
}

fn target_already_set(set_parts: &[String], target_key: &str) -> bool {
    let prefix = format!("n.{target_key} ");
    set_parts.iter().any(|part| part.starts_with(&prefix))
}

fn canonical_deep_property_key(
    source_key: &str,
    node: &Value,
    parsed: Option<&crate::coordinate::ParsedCoordinate>,
) -> Option<String> {
    explicit_deep_property_key(source_key)
        .and_then(|target| canonicalize_prime_surface_property(&target, node))
        .or_else(|| {
            let semantic = deep_property_semantic(source_key)?;
            source_key
                .starts_with("q_")
                .then(|| format!("q_{}_{}", node_position(node, parsed), semantic))
        })
}

fn canonicalize_prime_surface_property(target_key: &str, node: &Value) -> Option<String> {
    if !target_key.starts_with("m_") {
        return Some(target_key.to_string());
    }

    let semantic = target_key.splitn(3, '_').nth(2)?;
    let prefix = m_prime_property_prefix(node)?;
    Some(format!("{prefix}_{semantic}"))
}

fn m_prime_property_prefix(node: &Value) -> Option<String> {
    let coord = coordinate_from_node(node)?;
    let normalized = convert_hash_to_m_family(coord);
    let mut chars = normalized.chars();
    if chars.next()? != 'M' {
        return None;
    }

    let root = chars.next()?.to_digit(10)?;
    let mut prefix = format!("m_{root}");

    if chars.next() == Some('-') {
        let slot = chars
            .take_while(|ch| ch.is_ascii_digit())
            .collect::<String>();
        if !slot.is_empty() {
            prefix.push('_');
            prefix.push_str(&slot);
        }
    }

    Some(prefix)
}

fn deep_property_semantic(source_key: &str) -> Option<String> {
    let raw = source_key
        .strip_prefix("q_")
        .or_else(|| source_key.strip_prefix("f_"))
        .unwrap_or(source_key);
    let mut out = String::new();
    let mut last_was_underscore = false;

    for ch in raw.chars() {
        let replacement = ascii_property_char(ch);
        if replacement == "_" {
            if !last_was_underscore && !out.is_empty() {
                out.push('_');
                last_was_underscore = true;
            }
            continue;
        }
        if ch.is_uppercase() && !out.is_empty() && !last_was_underscore {
            out.push('_');
        }
        out.push_str(&replacement);
        last_was_underscore = false;
    }

    let semantic = out.trim_matches('_').to_string();
    if semantic.is_empty() {
        None
    } else {
        Some(semantic)
    }
}

fn ascii_property_char(ch: char) -> String {
    match ch {
        'a'..='z' | '0'..='9' => ch.to_string(),
        'A'..='Z' => ch.to_ascii_lowercase().to_string(),
        'ā' | 'á' | 'à' | 'â' | 'ä' | 'ã' | 'å' | 'Ā' | 'Á' | 'À' | 'Â' | 'Ä' | 'Ã' | 'Å' => {
            "a".into()
        }
        'ç' | 'Ç' => "c".into(),
        'ḍ' | 'ď' | 'Ḍ' | 'Ď' => "d".into(),
        'é' | 'è' | 'ê' | 'ë' | 'É' | 'È' | 'Ê' | 'Ë' => "e".into(),
        'ī' | 'í' | 'ì' | 'î' | 'ï' | 'Ī' | 'Í' | 'Ì' | 'Î' | 'Ï' => "i".into(),
        'ñ' | 'Ñ' => "n".into(),
        'ó' | 'ò' | 'ô' | 'ö' | 'õ' | 'Ó' | 'Ò' | 'Ô' | 'Ö' | 'Õ' => "o".into(),
        'ṛ' | 'ř' | 'Ṛ' | 'Ř' => "r".into(),
        'ś' | 'ṣ' | 'š' | 'Ś' | 'Ṣ' | 'Š' => "s".into(),
        'ṭ' | 'ť' | 'Ṭ' | 'Ť' => "t".into(),
        'ú' | 'ù' | 'û' | 'ü' | 'Ú' | 'Ù' | 'Û' | 'Ü' => "u".into(),
        'ý' | 'ÿ' | 'Ý' => "y".into(),
        _ => "_".into(),
    }
}

fn explicit_deep_property_key(source_key: &str) -> Option<String> {
    let target = match source_key {
        "name" => "c_1_name",
        "primaryDesignation" => "c_1_primary_designation",
        "description" => "c_1_description",
        "coreNature" => "c_0_core_nature",
        "operationalEssence" => "c_0_essence",
        "internalStructure" => "c_1_structure",
        "completeFormulation" => "c_1_complete_formulation",
        "formulationBreakdown" => "c_1_formulation_breakdown",
        "keyPrinciples" => "c_1_key_principles",
        "practicalApplications" => "c_3_practical_applications",
        "relatedCoordinates" => "c_3_related_coordinates",
        "lastUpdated" | "updatedAt" | "updated_at" => "c_3_updated_at",
        "contextFrame" => "c_3_context_frame",
        "qlCategory" => "c_4_ql_category",
        "qlOperatorTypes" => "c_4_ql_operator_types",
        "accessLevel" => "c_4_access_level",
        "resonances" => "c_5_resonances",
        "qlVariant" => "p_1_variant",
        "qlPositionWeave" => "p_1_weave",
        "positionId" => "p_1_position_id",
        "stageId" => "p_1_stage_id",
        "sequence" => "p_3_sequence",
        "therapeuticProperties" => "l_2_therapeutic_properties",
        "temperamentBalance" => "l_2_temperament_balance",
        "healingSpecialty" => "l_2_healing_specialty",
        "chakraCorrespondence" => "l_2_chakra_correspondence",
        "breathPattern" => "l_2_breath_pattern",
        "elementalNature" => "l_2_elemental_nature",
        "seasonalPosition" => "l_3_seasonal_position",
        "modality" => "l_4_modality",
        "mefCondition" => "l_4_mef_condition",
        "interpretiveRole" => "l_4_interpretive_role",
        "reflectionTable" => "l_4_reflection_table",
        "f_role" => "s_4_function_role",
        "f_description" => "s_4_function_description",
        "f_inputContracts" => "s_4_input_contracts",
        "f_outputContracts" => "s_4_output_contracts",
        "f_queryableProperties" => "s_4_queryable_properties",
        "f_translationSchema" => "s_4_translation_schema",
        "f_agent" => "s_5_agent",
        "f_tool_affinity" => "s_5_tool_affinity",
        "f_system_prompt" => "s_5_system_prompt",
        "f_capabilities" => "s_5_capabilities",
        "safetyClass" => "s_4_safety_class",
        "eligibleFormats" => "s_4_eligible_formats",
        "epistemicFunction" => "t_1_epistemic_function",
        "developmentalStage" => "t_3_developmental_stage",
        "processRealization" => "t_3_process_realization",
        "nextEvolutionPhase" => "t_5_next_evolution_phase",
        "q_theoreticalThesis" => "q_1_theoretical_thesis",
        "q_sophiaLogosDialectic" => "q_2_sophia_logos_dialectic",
        "q_instantiationMode" => "q_2_instantiation_mode",
        "q_dialecticalMovement" => "q_3_dialectical_movement",
        "q_historicalDiagnosis" => "q_4_historical_diagnosis",
        "q_integrationTemplate" => "q_5_integration_template",
        "q_conjunctiveThreshold" => "q_5_conjunctive_threshold",
        "consciousnessOperation" => "m_0_consciousness_operation",
        "consciousnessFunction" => "m_0_consciousness_function",
        "grammaticalFunction" => "m_0_grammatical_function",
        "spandaRelationship" => "m_0_spanda_relationship",
        "metaphysicalNames" => "m_0_metaphysical_names",
        "adamEveClassification" => "m_0_adam_eve_classification",
        "topologicalSignificance" => "m_1_topological_significance",
        "topologicalFormula" => "m_1_topological_formula",
        "processualTopologyRole" => "m_1_processual_topology_role",
        "matrixType" => "m_1_matrix_type",
        "constructionPhase" => "m_1_construction_phase",
        "algebraicCorrespondence" => "m_1_algebraic_correspondence",
        "abjadValue" => "m_2_abjad_value",
        "arabicText" => "m_2_arabic_text",
        "trilateralRoot" => "m_2_trilateral_root",
        "dhikrApplication" => "m_2_dhikr_application",
        "recitationCount" => "m_2_recitation_count",
        "zodiacalInfluence" => "m_2_zodiacal_influence",
        "therapeuticCluster" => "m_2_therapeutic_cluster",
        "digitalRoot" => "m_2_digital_root",
        "matrixConstant" => "m_2_matrix_constant",
        "magicSquareSum" => "m_2_magic_square_sum",
        "degree" => "m_3_degree",
        "quadrant" => "m_3_quadrant",
        "rotationalPhase" => "m_3_rotational_phase",
        "yinYangBalance" => "m_3_yin_yang_balance",
        "elementalAffinity" => "m_3_elemental_affinity",
        "aminoAcidCode" => "m_3_amino_acid_code",
        "positive_codon_binary" => "m_3_positive_codon_binary",
        "negative_codon_binary" => "m_3_negative_codon_binary",
        "upper_Pair_binary" => "m_3_upper_pair_binary",
        "lower_Pair_binary" => "m_3_lower_pair_binary",
        "tarotCard" => "m_3_tarot_card",
        "hebrewLetter" => "m_3_hebrew_letter",
        "twoStrokeDoctrine" => "m_4_two_stroke_doctrine",
        "temporalStructure" => "m_4_temporal_structure",
        "temporalIntelligenceLayer" => "m_4_temporal_intelligence_layer",
        "kashmirShaivismAlignment" => "m_4_kashmir_shaivism_alignment",
        "practicalManifestations" => "m_4_practical_manifestations",
        "capabilitySignals" => "m_4_capability_signals",
        "preferredTiming" => "m_4_preferred_timing",
        "lacanianPublicInterface" => "m_5_lacanian_interface",
        "whiteheadLacanSynthesis" => "m_5_whitehead_lacanian",
        "lacanianEtymologicalArchaeology" => "m_5_archaeology_method",
        _ => return None,
    };
    Some(target.to_string())
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

fn node_position(node: &Value, parsed: Option<&crate::coordinate::ParsedCoordinate>) -> u8 {
    parsed
        .and_then(|parsed| parsed.ql_position)
        .or_else(|| {
            nested_filtered_property(node, "qlPosition").and_then(|value| value.parse::<u8>().ok())
        })
        .or_else(|| {
            coordinate_from_node(node).and_then(|coord| {
                coord
                    .trim_start_matches('#')
                    .chars()
                    .find(|ch| ch.is_ascii_digit())
                    .and_then(|ch| ch.to_digit(10))
                    .map(|digit| digit as u8)
            })
        })
        .filter(|position| *position <= 5)
        .unwrap_or(0)
}

fn cypher_literal(value: &Value, target_key: &str) -> Option<String> {
    match value {
        Value::Null => None,
        Value::Bool(value) => Some(value.to_string()),
        Value::Number(value) => Some(value.to_string()),
        Value::String(value) if STRING_LIST_TARGETS.contains(&target_key) => {
            let items = value
                .split(',')
                .map(str::trim)
                .filter(|item| !item.is_empty())
                .map(|item| format!("'{}'", escape_cypher(item)))
                .collect::<Vec<_>>();
            Some(format!("[{}]", items.join(", ")))
        }
        Value::String(value) if value.trim().is_empty() => None,
        Value::String(value) => Some(format!("'{}'", escape_cypher(value))),
        Value::Array(values) => {
            let items = values
                .iter()
                .filter_map(|value| cypher_array_item_literal(value))
                .collect::<Vec<_>>();
            Some(format!("[{}]", items.join(", ")))
        }
        Value::Object(_) => serde_json::to_string(value)
            .ok()
            .map(|value| format!("'{}'", escape_cypher(&value))),
    }
}

fn cypher_array_item_literal(value: &Value) -> Option<String> {
    match value {
        Value::Null => None,
        Value::Bool(value) => Some(value.to_string()),
        Value::Number(value) => Some(value.to_string()),
        Value::String(value) if value.trim().is_empty() => None,
        Value::String(value) => Some(format!("'{}'", escape_cypher(value))),
        Value::Array(_) | Value::Object(_) => serde_json::to_string(value)
            .ok()
            .map(|value| format!("'{}'", escape_cypher(&value))),
    }
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
        assert_eq!(escape_cypher("line\nnext\tcell"), "line\\nnext\\tcell");
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
    fn deep_properties_are_promoted_with_canonical_prefixes() {
        let node = serde_json::json!({
            "coordinate": "#2-4",
            "filteredProps": {
                "q_theoreticalThesis": "QV is quintessential",
                "f_role": "Knowing surface",
                "therapeuticProperties": "grounding, integration",
                "topologicalSignificance": "M-prime expression",
                "qlVariant": "0/1",
                "matrixConstant": 21,
                "vimarśaFunction": "self-recognition"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M2-4").ok();
        let mut set_parts = Vec::new();

        append_deep_prefixed_filtered_props(&node, parsed.as_ref(), &mut set_parts);

        assert!(set_parts.contains(&"n.q_1_theoretical_thesis = 'QV is quintessential'".into()));
        assert!(set_parts.contains(&"n.s_4_function_role = 'Knowing surface'".into()));
        assert!(set_parts
            .contains(&"n.l_2_therapeutic_properties = ['grounding', 'integration']".into()));
        assert!(
            set_parts.contains(&"n.m_2_4_topological_significance = 'M-prime expression'".into())
        );
        assert!(set_parts.contains(&"n.p_1_variant = '0/1'".into()));
        assert!(set_parts.contains(&"n.m_2_4_matrix_constant = 21".into()));
        assert!(
            set_parts
                .iter()
                .all(|part| !part.contains("vimarsa_function")),
            "unreviewed non-q properties must not be guessed into coordinate families"
        );
        assert!(
            set_parts.iter().all(|part| !part.contains("n.`")),
            "deep properties must never be written as raw backtick-escaped source keys"
        );
    }

    #[test]
    fn deep_coordinate_source_keys_are_not_written_as_duplicate_properties() {
        let node = serde_json::json!({
            "coordinate": "#2-1",
            "filteredProps": {
                "bimbaCoordinate": "#2-1",
                "coordinate": "#2-1",
                "name": "Already handled by identity path"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M2-1").ok();
        let mut set_parts = Vec::new();
        set_parts.push("n.c_1_name = COALESCE(n.c_1_name, 'Already handled')".into());

        append_deep_prefixed_filtered_props(&node, parsed.as_ref(), &mut set_parts);

        assert!(
            set_parts
                .iter()
                .all(|part| !part.contains("bimbaCoordinate") && !part.contains("`coordinate`")),
            "coordinate aliases are node identity, not deep properties"
        );
        assert!(
            set_parts.iter().filter(|part| part.starts_with("n.c_1_name ")).count() == 1,
            "canonical targets already set by higher-priority importer paths must not be duplicated"
        );
    }

    #[test]
    fn q_properties_keep_their_own_class_and_node_position() {
        let node = serde_json::json!({
            "coordinate": "#5-1",
            "filteredProps": {
                "q_instantiationMode": "Quick-view surface",
                "q_paramādvaita": "supreme nondualism",
                "q_śivaŚaktiPlay": "light-power play"
            }
        });
        let parsed = CoordinateArrayParser::parse_one("M5-1").ok();
        let mut set_parts = Vec::new();

        append_deep_prefixed_filtered_props(&node, parsed.as_ref(), &mut set_parts);

        assert!(set_parts.contains(&"n.q_2_instantiation_mode = 'Quick-view surface'".into()));
        assert!(set_parts.contains(&"n.q_5_paramadvaita = 'supreme nondualism'".into()));
        assert!(set_parts.contains(&"n.q_5_siva_sakti_play = 'light-power play'".into()));
    }

    #[test]
    fn m_prime_properties_use_coordinate_slot_prefixes() {
        let root_node = serde_json::json!({
            "coordinate": "#3",
            "filteredProps": {
                "degree": 0
            }
        });
        let sub_node = serde_json::json!({
            "coordinate": "#3-5-8",
            "filteredProps": {
                "degree": 248
            }
        });
        let mut root_parts = Vec::new();
        let mut sub_parts = Vec::new();

        append_deep_prefixed_filtered_props(&root_node, None, &mut root_parts);
        append_deep_prefixed_filtered_props(&sub_node, None, &mut sub_parts);

        assert!(root_parts.contains(&"n.m_3_degree = 0".into()));
        assert!(sub_parts.contains(&"n.m_3_5_degree = 248".into()));
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
    fn deep_dataset_json_sanitizer_preserves_multiline_string_content() {
        let raw =
            "[{\"coordinate\":\"#5\",\"filteredProps\":{\"f_system_prompt\":\"first\nsecond\"}}]";
        let sanitized = sanitize_json_control_chars(raw);
        let parsed: Vec<Value> =
            serde_json::from_str(&sanitized).expect("sanitized JSON should parse");

        assert_eq!(
            parsed[0]["filteredProps"]["f_system_prompt"],
            Value::String("first\nsecond".into())
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
