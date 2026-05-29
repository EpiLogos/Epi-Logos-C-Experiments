//! End-to-end Z-cycle smoke test (Phase F1 capstone).
//!
//! Walks the Möbius seam through the load-bearing crates without requiring
//! a live gateway or PI process:
//!   1. Construct canonical Sophia disclosure → EpiiInboxEntry shape
//!   2. InboxStore::append (C5)
//!   3. recompose_pass produces NextComposeHint (C6)
//!   4. Assert hint shape can seed next-cycle session_start
//!
//! Phase coverage:
//!   - A1 (z-phase-vak): rehearPhaseVakAddress shape mirrored here as rehear_phase_vak()
//!   - C2 (sophia-fire): wire format simulated as the canonical disclosure payload
//!   - C4 (aletheia ingest): the canonical EpiiInboxEntry shape is the C4 output;
//!     since C5's fix d2beb68b confirmed wire formats are identical, we can
//!     skip the file-shuffle step and construct the InboxEntry directly.
//!   - C5 (InboxStore): exercised via append + list_pending
//!   - C6 (recompose_pass): exercised end-to-end with HumanReview gate assertion

use epi_s5_epii_autoresearch_core::inbox::{InboxEntry, InboxStore};
use epi_s5_epii_autoresearch_core::recompose::{recompose_pass, RecomposeDecision};
use portal_core::{CpfState, CsDirection, CsField, VakAddress};
use std::collections::BTreeMap;
use tempfile::tempdir;

/// Matches the shape produced by `rehearPhaseVakAddress()` in
/// Body/S/S4/ta-onta/S4-4p-anima/modules/z-phase-vak.ts (A1 + C2 alignment).
fn rehear_phase_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT5".into()],
        cp: "CP4.5".into(),
        cf: "(5/0)".into(),
        cfp: "CFP3".into(),
        cs: CsField {
            code: "CS0".into(),
            direction: CsDirection::Night,
        },
    }
}

fn smoke_entry(session_id: &str, vectors: Vec<&str>, artifacts: Vec<&str>) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".into(),
        source: "aletheia_sophia_ingest".into(),
        session_id: session_id.into(),
        day_id: "22-05-2026".into(),
        final_vak: rehear_phase_vak(),
        improvement_vectors: vectors.into_iter().map(String::from).collect(),
        moirai_summary: BTreeMap::from([
            ("klotho".into(), "traces noted".into()),
            ("lachesis".into(), "sources consulted".into()),
            ("atropos".into(), "crystallisation: VAK transition tested".into()),
        ]),
        artifacts: artifacts.into_iter().map(String::from).collect(),
    }
}

#[test]
fn z_cycle_smoke_session_to_next_compose_hint() {
    // === Phase 1: Sophia disclosure landed (C2 → C4) ===
    // (Simulated: in production C2 writes the disclosure to Sophia inbox;
    //  C4 reads it and writes the canonical InboxEntry to Epii inbox.
    //  We construct the InboxEntry directly since C5's fix d2beb68b confirmed
    //  the wire formats are identical.)
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    let session_id = "agent:test:zsmoke";
    let entry = smoke_entry(
        session_id,
        vec!["consider deeper CT4b exploration", "revisit CP4.3 pattern"],
        vec!["/vault/note-A.md", "/vault/note-B.md"],
    );

    // === Phase 2: Aletheia → Epii (C4 → C5) ===
    let inbox_id = store.append(entry.clone()).unwrap();
    assert_eq!(inbox_id, format!("{session_id}#L0"), "C5 line-derived id");

    // Verify wire-format compatibility: read it back
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1, "C5 reads exactly one entry");
    assert_eq!(listed[0].entry.kind, "epii_autoresearch_inbox_entry");
    assert_eq!(listed[0].entry.source, "aletheia_sophia_ingest");
    assert_eq!(
        listed[0].entry.final_vak.cf, "(5/0)",
        "rehear phase Möbius cf preserved"
    );
    assert_eq!(
        listed[0].entry.final_vak.cs.direction,
        CsDirection::Night,
        "Night' direction preserved"
    );

    // === Phase 3: Epii recompose (C6) — Möbius seam closure ===
    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 1, "one hint per entry");
    let hint = &outputs[0].next_compose_hint;
    assert_eq!(
        hint.session_seed, session_id,
        "session_seed = originating session_id"
    );
    assert_eq!(
        hint.proposed_p0_questions.len(),
        2,
        "one question per improvement_vector"
    );
    assert!(
        hint.proposed_p0_questions[0].contains("CT4b")
            || hint.proposed_p0_questions[1].contains("CT4b"),
        "improvement vector preserved in question"
    );
    assert_eq!(
        hint.challenger_artifacts.len(),
        2,
        "artifacts carried as challengers"
    );

    // First-pass policy gate
    assert!(matches!(
        outputs[0].decision,
        RecomposeDecision::HumanReview(_)
    ));

    // === Phase 4: next-cycle compose can consume the hint ===
    // (Out of scope for smoke — verify hint shape is well-formed)
    assert!(
        !hint.session_seed.is_empty() && !hint.proposed_p0_questions.is_empty(),
        "hint is well-formed and ready to seed next compose"
    );
}

#[test]
fn z_cycle_smoke_multiple_sessions_aggregate_in_recompose() {
    // Two sessions writing to the same vault should both surface in recompose.
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    store
        .append(smoke_entry("agent:test:zsmoke-1", vec!["v1a"], vec![]))
        .unwrap();
    store
        .append(smoke_entry(
            "agent:test:zsmoke-2",
            vec!["v2a", "v2b"],
            vec!["/vault/x.md"],
        ))
        .unwrap();

    let outputs = recompose_pass(&store).unwrap();
    assert_eq!(outputs.len(), 2);

    let by_session: BTreeMap<&str, &_> = outputs
        .iter()
        .map(|o| (o.next_compose_hint.session_seed.as_str(), o))
        .collect();
    assert_eq!(
        by_session["agent:test:zsmoke-1"]
            .next_compose_hint
            .proposed_p0_questions
            .len(),
        1
    );
    assert_eq!(
        by_session["agent:test:zsmoke-2"]
            .next_compose_hint
            .proposed_p0_questions
            .len(),
        2
    );
    assert_eq!(
        by_session["agent:test:zsmoke-2"]
            .next_compose_hint
            .challenger_artifacts
            .len(),
        1
    );
}
