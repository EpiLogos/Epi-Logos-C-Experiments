use epi_s5_epii_autoresearch_core::inbox::{InboxEntry, InboxStore};
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

fn sample_entry(session_id: &str) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".into(),
        source: "aletheia_sophia_ingest".into(),
        session_id: session_id.into(),
        day_id: "22-05-2026".into(),
        final_vak: sample_vak(),
        improvement_vectors: vec!["consider X".into()],
        moirai_summary: BTreeMap::from([("klotho".into(), "traces".into())]),
        artifacts: vec!["/vault/note.md".into()],
    }
}

#[test]
fn append_then_list_returns_one_entry_with_line_derived_id() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    let id = store.append(sample_entry("agent:test:main")).unwrap();
    assert_eq!(id, "agent:test:main#L0");
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1);
    assert_eq!(listed[0].id, "agent:test:main#L0");
    assert_eq!(listed[0].entry.final_vak.cf, "(5/0)");
    assert_eq!(listed[0].entry.final_vak.cs.direction, CsDirection::Night);
    assert_eq!(
        listed[0].entry.moirai_summary.get("klotho").unwrap(),
        "traces"
    );
}

#[test]
fn repeated_appends_grow_session_jsonl_with_distinct_line_ids() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    let id1 = store.append(sample_entry("agent:repeat:1")).unwrap();
    let id2 = store.append(sample_entry("agent:repeat:1")).unwrap();
    assert_eq!(id1, "agent:repeat:1#L0");
    assert_eq!(id2, "agent:repeat:1#L1");
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 2);
}

#[test]
fn list_aggregates_across_multiple_session_files() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store.append(sample_entry("agent:s1")).unwrap();
    store.append(sample_entry("agent:s2")).unwrap();
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 2);
    // Deterministic order via filename sort
    assert_eq!(listed[0].id, "agent:s1#L0");
    assert_eq!(listed[1].id, "agent:s2#L0");
}

#[test]
fn list_pending_reads_actual_c4_wire_format() {
    // Simulate Aletheia's actual write — JSONL line, top-level fields, compact form.
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    let aletheia_written = r#"{"kind":"epii_autoresearch_inbox_entry","source":"aletheia_sophia_ingest","session_id":"agent:c4test:main","day_id":"22-05-2026","final_vak":{"cpf":"(4.0/1-4.4/5)","ct":["CT5"],"cp":"CP4.5","cf":"(5/0)","cfp":"CFP0","cs":{"code":"CS0","direction":"Night'"}},"improvement_vectors":["v1"],"moirai_summary":{"klotho":"k","lachesis":"l","atropos":"a"},"artifacts":["/x"]}"#;
    std::fs::write(
        tmp.path().join("agent:c4test:main.jsonl"),
        format!("{aletheia_written}\n"),
    )
    .unwrap();
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1);
    assert_eq!(listed[0].id, "agent:c4test:main#L0");
    assert_eq!(listed[0].entry.final_vak.cf, "(5/0)");
    assert_eq!(listed[0].entry.moirai_summary.len(), 3);
    assert_eq!(listed[0].entry.artifacts, vec!["/x".to_string()]);
}

#[test]
fn list_pending_skips_non_jsonl_files() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store.append(sample_entry("agent:filter")).unwrap();
    std::fs::write(tmp.path().join("README.md"), "not an entry").unwrap();
    std::fs::write(tmp.path().join("notes.json"), "{}").unwrap();
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1);
}

#[test]
fn list_pending_surfaces_parse_failure() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    std::fs::write(tmp.path().join("bogus.jsonl"), "{ not valid json\n").unwrap();
    assert!(store.list_pending().is_err());
}

#[test]
fn list_pending_ignores_empty_lines() {
    // Documented semantics: line indexes count among NON-EMPTY lines only,
    // so blank lines do not consume an id slot. This keeps ids stable when
    // whitespace-only lines are added or removed.
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    let entry = serde_json::to_string(&sample_entry("agent:blanks")).unwrap();
    std::fs::write(
        tmp.path().join("agent:blanks.jsonl"),
        format!("\n\n{entry}\n   \n{entry}\n"),
    )
    .unwrap();
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 2);
    assert_eq!(listed[0].id, "agent:blanks#L0");
    assert_eq!(listed[1].id, "agent:blanks#L1");
}
