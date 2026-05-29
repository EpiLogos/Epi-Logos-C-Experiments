use epi_s5_epii_autoresearch_core::inbox::{InboxEntry, InboxStore};
#[allow(unused_imports)]
use epi_s5_epii_autoresearch_core::recompose::{recompose_pass, RecomposeDecision, RecomposeOutput};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use std::collections::BTreeMap;
use tempfile::tempdir;

fn sample_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT5".into()],
        cp: "CP4.5".into(),
        cf: "(5/0)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS0".into(),
            direction: CsDirection::Night,
        },
    }
}

fn sample_entry(session_id: &str, vectors: Vec<&str>, artifacts: Vec<&str>) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".into(),
        source: "aletheia_sophia_ingest".into(),
        session_id: session_id.into(),
        day_id: "22-05-2026".into(),
        final_vak: sample_vak(),
        improvement_vectors: vectors.into_iter().map(String::from).collect(),
        moirai_summary: BTreeMap::new(),
        artifacts: artifacts.into_iter().map(String::from).collect(),
        closure_kind: "rehear".into(),
    }
}

#[test]
fn recompose_pass_produces_next_compose_hint_per_entry() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store
        .append(sample_entry("agent:test:main", vec!["consider X"], vec![]))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 1);
    assert_eq!(
        outputs[0].next_compose_hint.session_seed,
        "agent:test:main"
    );
    assert!(outputs[0]
        .next_compose_hint
        .proposed_p0_questions
        .iter()
        .any(|q| q.contains("X")));
}

#[test]
fn recompose_pass_proposes_question_per_improvement_vector() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store
        .append(sample_entry("agent:multi", vec!["v1", "v2", "v3"], vec![]))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 1);
    assert_eq!(outputs[0].next_compose_hint.proposed_p0_questions.len(), 3);
    for v in &["v1", "v2", "v3"] {
        assert!(
            outputs[0]
                .next_compose_hint
                .proposed_p0_questions
                .iter()
                .any(|q| q.contains(v)),
            "question containing {v} should be proposed"
        );
    }
}

#[test]
fn recompose_pass_carries_artifacts_as_challengers() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store
        .append(sample_entry(
            "agent:art",
            vec![],
            vec!["/vault/a.md", "/vault/b.md"],
        ))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 1);
    assert_eq!(outputs[0].next_compose_hint.challenger_artifacts.len(), 2);
    assert!(outputs[0]
        .next_compose_hint
        .challenger_artifacts
        .contains(&"/vault/a.md".to_string()));
}

#[test]
fn recompose_pass_defaults_to_human_review_gate() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store
        .append(sample_entry("agent:gate", vec!["v"], vec![]))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    match &outputs[0].decision {
        RecomposeDecision::HumanReview(reason) => {
            assert!(
                reason.contains("human"),
                "human-review reason should mention human"
            );
        }
        other => panic!("expected HumanReview, got {other:?}"),
    }
}

#[test]
fn recompose_pass_entry_id_matches_inbox_line_derived_id() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    let id1 = store
        .append(sample_entry("agent:idmatch", vec!["a"], vec![]))
        .unwrap();
    let id2 = store
        .append(sample_entry("agent:idmatch", vec!["b"], vec![]))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 2);
    let ids: Vec<_> = outputs.iter().map(|o| o.entry_id.clone()).collect();
    assert!(ids.contains(&id1));
    assert!(ids.contains(&id2));
    assert_eq!(id1, "agent:idmatch#L0");
    assert_eq!(id2, "agent:idmatch#L1");
}

#[test]
fn recompose_pass_handles_empty_inbox() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 0);
}

#[test]
fn recompose_pass_empty_improvement_vectors_still_human_review() {
    // Documented choice: an entry with no improvement_vectors still gets
    // HumanReview because artifacts may be human-interesting even without
    // vectors. We do NOT auto-discard.
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store
        .append(sample_entry("agent:empty", vec![], vec!["/x.md"]))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 1);
    assert_eq!(outputs[0].next_compose_hint.proposed_p0_questions.len(), 0);
    assert_eq!(outputs[0].next_compose_hint.challenger_artifacts.len(), 1);
    assert!(matches!(
        &outputs[0].decision,
        RecomposeDecision::HumanReview(_)
    ));
}

#[test]
fn recompose_pass_preserves_duplicate_improvement_vectors() {
    // Decision: duplicate vectors → duplicate questions (signal of repeated
    // emphasis, not noise). Pin this behaviour.
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store
        .append(sample_entry(
            "agent:dup",
            vec!["consider X", "consider X"],
            vec![],
        ))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs[0].next_compose_hint.proposed_p0_questions.len(), 2);
}
