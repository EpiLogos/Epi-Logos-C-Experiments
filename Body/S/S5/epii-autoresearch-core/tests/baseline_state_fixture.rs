use epi_s5_epii_autoresearch_core::{
    inbox::{InboxEntry, InboxStore},
    recompose::{recompose_pass, RecomposeDecision},
    ImprovementDecision, ImprovementStore, LoopState,
};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use std::collections::BTreeMap;

const IMPROVEMENT_FIXTURE: &str =
    include_str!("../../fixtures/track-04-t0/s5-improvement-state.json");

#[test]
fn tranche_04_t0_improvement_fixture_loads_through_public_store() {
    let root = temp_store_root("baseline-improvement-fixture");
    std::fs::write(root.join("s5-improvement-state.json"), IMPROVEMENT_FIXTURE)
        .expect("write fixture");

    let store = ImprovementStore::new(&root);
    let status = store.status().expect("fixture should deserialize");
    assert_eq!(status.loop_state, LoopState::Hypothesis);
    assert_eq!(status.total_runs, 2);
    assert_eq!(status.keep_count, 1);
    assert_eq!(status.discard_count, 0);
    assert_eq!(status.active_vectors.len(), 1);
    assert_eq!(
        status.active_vectors[0].run_id,
        "track-04-t0-improvement-pending"
    );

    let history = store.history(None).expect("history should read fixture");
    assert_eq!(history.runs.len(), 2);
    let kept = history
        .runs
        .iter()
        .find(|run| run.run_id == "track-04-t0-improvement-kept")
        .expect("kept fixture run");
    assert_eq!(kept.decision, Some(ImprovementDecision::Keep));
    assert_eq!(
        kept.evaluation.as_ref().unwrap().evidence[0].source_refs[0].kind,
        "track_04_t0_fixture"
    );
}

#[test]
fn tranche_04_t0_aletheia_jsonl_fixture_path_recomposes_with_human_gate() {
    let root = temp_store_root("baseline-inbox-recompose");
    let inbox = InboxStore::new(&root).expect("inbox");
    let entry = InboxEntry {
        kind: "epii_autoresearch_inbox_entry".to_owned(),
        source: "aletheia_sophia_ingest".to_owned(),
        session_id: "track-04-t0-session".to_owned(),
        day_id: "01-06-2026".to_owned(),
        final_vak: VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT5".to_owned()],
            cp: "CP4.5".to_owned(),
            cf: "(5/0)".to_owned(),
            cfp: "CFP0".to_owned(),
            cs: CsField {
                code: "CS0".to_owned(),
                direction: CsDirection::Night,
            },
        },
        improvement_vectors: vec!["revisit S5 review-state fixture".to_owned()],
        moirai_summary: BTreeMap::from([("atropos".to_owned(), "fixture sealed".to_owned())]),
        artifacts: vec!["Body/S/S5/fixtures/track-04-t0/s5-review-state.json".to_owned()],
        closure_kind: "rehear".to_owned(),
        disclosure_lineage: None,
    };

    let id = inbox.append(entry).expect("append real JSONL");
    assert_eq!(id, "track-04-t0-session#L0");

    let outputs = recompose_pass(&inbox).expect("recompose real inbox");
    assert_eq!(outputs.len(), 1);
    assert_eq!(outputs[0].entry_id, "track-04-t0-session#L0");
    assert_eq!(
        outputs[0].next_compose_hint.challenger_artifacts[0],
        "Body/S/S5/fixtures/track-04-t0/s5-review-state.json"
    );
    assert!(matches!(
        outputs[0].decision,
        RecomposeDecision::HumanReview(_)
    ));
}

fn temp_store_root(test_name: &str) -> std::path::PathBuf {
    let root = std::env::temp_dir().join(format!(
        "epi-s5-autoresearch-{test_name}-{}",
        std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
