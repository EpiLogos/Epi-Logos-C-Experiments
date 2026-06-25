use crate::coordinate::CoordLayer;
use serde_json::Value;
use std::path::Path;

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
    pub imported_nodes: Vec<String>,
    pub imported_relations: Vec<String>,
    pub skipped_node_details: Vec<DatasetSkip>,
    pub skipped_relation_details: Vec<DatasetSkip>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DatasetSkip {
    pub item: String,
    pub reason: String,
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
        let details =
            self.branches
                .iter()
                .flat_map(|branch| {
                    let mut branch_lines = Vec::new();
                    branch_lines.push(format!("  [{}] {}", branch.branch_id, branch.label));
                    branch_lines.extend(
                        branch
                            .imported_nodes
                            .iter()
                            .map(|coord| format!("    imported node: {coord}")),
                    );
                    branch_lines.extend(
                        branch
                            .imported_relations
                            .iter()
                            .map(|rel| format!("    imported relation: {rel}")),
                    );
                    branch_lines.extend(
                        branch.skipped_node_details.iter().map(|skip| {
                            format!("    skipped node: {} ({})", skip.item, skip.reason)
                        }),
                    );
                    branch_lines.extend(branch.skipped_relation_details.iter().map(|skip| {
                        format!("    skipped relation: {} ({})", skip.item, skip.reason)
                    }));
                    branch_lines
                })
                .collect::<Vec<_>>()
                .join("\n");
        if details.is_empty() {
            format!("Dataset import complete:\n{}", lines)
        } else {
            format!("Dataset import complete:\n{}\nDetails:\n{}", lines, details)
        }
    }
}

const STRING_LIST_TARGETS: &[&str] = &[
    "c_1_asset_uri",
    "c_4_ql_operator_types",
    "c_5_resonances",
    "l_2_therapeutic_properties",
    "s_5_tool_affinity",
];

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

pub(super) fn sanitize_json_control_chars(raw: &str) -> String {
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

/// Escape single quotes for Cypher string literals
pub(super) fn escape_cypher(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

pub(super) fn cypher_literal(value: &Value, target_key: &str) -> Option<String> {
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

pub(super) fn truncate_utf8(value: &str, max_len: usize) -> &str {
    if value.len() <= max_len {
        return value;
    }
    let mut end = max_len;
    while !value.is_char_boundary(end) {
        end -= 1;
    }
    &value[..end]
}

pub(super) fn layer_string(layer: &CoordLayer) -> &'static str {
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
    fn canonical_plan_covers_low_detail_and_deep_branches() {
        let plan = canonical_dataset_plan(Path::new("../../../../Idea/Bimba/Map/datasets"));
        assert!(plan
            .iter()
            .any(|branch| branch.id == "low-detail/parashakti"));
        assert!(plan.iter().any(|branch| branch.id == "parashakti-deep"));
        assert_eq!(deep_dataset_plan().len(), 6);
    }

    #[test]
    fn canonical_plan_points_at_real_corpus_files() {
        let repo_datasets = Path::new("../../../../Idea/Bimba/Map/datasets");
        let plan = canonical_dataset_plan(repo_datasets);

        for branch in &plan {
            assert!(
                repo_datasets.join(branch.nodes_file).exists(),
                "{} nodes file must exist at {}",
                branch.id,
                branch.nodes_file
            );
            if let Some(relations_file) = branch.relations_file {
                assert!(
                    repo_datasets.join(relations_file).exists(),
                    "{} relations file must exist at {}",
                    branch.id,
                    relations_file
                );
            }
        }
    }

    #[test]
    fn import_report_names_imports_and_skip_reasons_deterministically() {
        let mut report = DatasetImportReport::default();
        report.push(DatasetBranchReport {
            branch_id: "anuttara-deep".into(),
            label: "M0 Anuttara Deep".into(),
            nodes: 1,
            relations: 1,
            skipped_nodes: 1,
            skipped_relations: 1,
            imported_nodes: vec!["M0".into()],
            imported_relations: vec!["M0 -[CONTAINS]-> M0-1".into()],
            skipped_node_details: vec![DatasetSkip {
                item: "No coordinate".into(),
                reason: "missing coordinate or filteredProps.bimbaCoordinate".into(),
            }],
            skipped_relation_details: vec![DatasetSkip {
                item: "M0 -[?]-> ?".into(),
                reason: "missing target endpoint".into(),
            }],
        });

        let rendered = report.render();
        assert!(rendered.contains("imported node: M0"));
        assert!(rendered.contains("imported relation: M0 -[CONTAINS]-> M0-1"));
        assert!(rendered.contains(
            "skipped node: No coordinate (missing coordinate or filteredProps.bimbaCoordinate)"
        ));
        assert!(rendered.contains("skipped relation: M0 -[?]-> ? (missing target endpoint)"));
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
    fn layer_string_covers_all_variants() {
        assert_eq!(layer_string(&CoordLayer::Psychoid), "PSYCHOID");
        assert_eq!(layer_string(&CoordLayer::Family), "COORDINATE");
        assert_eq!(layer_string(&CoordLayer::FamilyRoot), "FAMILY_ROOT");
        assert_eq!(layer_string(&CoordLayer::Lens), "LENS");
    }
}
