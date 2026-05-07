use std::path::PathBuf;

use epi_s1_hen_compiler_core::{suggest_link_candidates, LinkCandidateKind, LinkCandidateRequest};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

#[test]
fn suggest_link_candidates_uses_real_smart_env_fixtures() {
    let vault_root = repo_root().join("Idea");
    let response = suggest_link_candidates(LinkCandidateRequest {
        vault_root: vault_root.clone(),
        note_path: PathBuf::from("Bimba/Seeds/S/S-AD-HOC-ROADMAP.md"),
        source_wikilinks: vec!["[[S-SHARDING-TASK-LIST]]".to_owned()],
        limit: 50,
        include_stale: false,
    })
    .expect("smart env candidate response");

    assert_eq!(
        response.seed_sources,
        vec![PathBuf::from("Bimba/Seeds/S/S-SHARDING-TASK-LIST.md")]
    );
    assert!(response.warnings.is_empty(), "{:?}", response.warnings);
    assert!(
        !response.candidates.is_empty(),
        "expected non-empty candidate pool"
    );

    assert!(response.candidates.iter().any(|candidate| {
        candidate.target_path == PathBuf::from("Bimba/Seeds/S/S-SYSTEM-INDEX.md")
            && candidate.kind == LinkCandidateKind::ExplicitOutlink
    }));

    assert!(response.candidates.iter().any(|candidate| {
        matches!(
            candidate.kind,
            LinkCandidateKind::SemanticSource | LinkCandidateKind::SemanticBlock
        )
    }));

    assert!(response
        .candidates
        .iter()
        .all(|candidate| vault_root.join(&candidate.target_path).exists()));
}

#[test]
fn suggest_link_candidates_filters_stale_paths_and_keeps_target_lines() {
    let vault_root = repo_root().join("Idea");
    let response = suggest_link_candidates(LinkCandidateRequest {
        vault_root,
        note_path: PathBuf::from("Bimba/Seeds/S/S-AD-HOC-ROADMAP.md"),
        source_wikilinks: vec!["[[S-SHARDING-TASK-LIST]]".to_owned()],
        limit: 20,
        include_stale: false,
    })
    .expect("smart env candidate response");

    assert!(response
        .candidates
        .iter()
        .all(|candidate| candidate.target_path != PathBuf::from("Bimba/Seeds/S/S4-SPEC.md")));

    let block_candidate = response
        .candidates
        .iter()
        .find(|candidate| candidate.kind == LinkCandidateKind::SemanticBlock)
        .expect("expected at least one block-derived candidate");
    assert!(
        block_candidate.evidence_lines.is_some(),
        "semantic block candidates should carry target line ranges"
    );
}
