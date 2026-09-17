//! dataset_import::plans — canonical, low-detail, and deep dataset branch tables.
//!
//! The 14 low-detail branches + 6 deep branches that describe which Bimba corpus
//! files land in which order. Split out of the former `dataset_import.rs` per
//! S2-ARCHITECTURE.md §5.7 (finding 7): cycle-3 dataset additions edit this file
//! only.

use super::branch::DatasetBranch;
use std::path::Path;

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

#[cfg(test)]
mod tests {
    use super::*;

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
}
