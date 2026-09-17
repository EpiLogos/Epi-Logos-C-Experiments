//! dataset_import::branch — dataset branch descriptors and import report types.
//!
//! Owns the plain-data structures that describe a dataset branch and the
//! human-readable report produced by an import run. Split out of the former
//! `dataset_import.rs` per S2-ARCHITECTURE.md §5.7 (finding 7).

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

#[cfg(test)]
mod tests {
    use super::*;

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
}
