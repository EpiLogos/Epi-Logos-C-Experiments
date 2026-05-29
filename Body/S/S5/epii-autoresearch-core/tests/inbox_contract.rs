use epi_s5_epii_autoresearch_core::inbox::{InboxEntry, InboxStore};
use tempfile::tempdir;

fn sample_entry(session_id: &str) -> InboxEntry {
    InboxEntry {
        kind: "epii_autoresearch_inbox_entry".into(),
        source: "aletheia_sophia_ingest".into(),
        session_id: session_id.into(),
        day_id: "22-05-2026".into(),
        improvement_vectors: vec!["v1".into()],
        raw: serde_json::json!({"final_vak": "stub"}),
    }
}

#[test]
fn inbox_persists_and_lists_entries() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    let id = store.append(sample_entry("agent:test:main")).unwrap();
    let listed = store.list_pending().unwrap();

    assert_eq!(listed.len(), 1);
    assert_eq!(listed[0].id, id);
    assert_eq!(listed[0].entry.session_id, "agent:test:main");
    assert_eq!(listed[0].entry.kind, "epii_autoresearch_inbox_entry");
    assert_eq!(listed[0].entry.source, "aletheia_sophia_ingest");
}

#[test]
fn inbox_id_is_unique_across_repeated_appends_for_same_session() {
    // Aletheia (C4) uses appendFileSync — same session may write multiple
    // entries. Each must land as a distinct file in the store.
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    let id1 = store.append(sample_entry("agent:repeat:1")).unwrap();
    let id2 = store.append(sample_entry("agent:repeat:1")).unwrap();

    assert_ne!(id1, id2, "uuid disambiguates same-session appends");
    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 2);
}

#[test]
fn inbox_sanitises_unsafe_chars_in_session_id_for_filename() {
    // session_id like "agent:test:main" must not produce a colon-bearing
    // filename (cross-platform safety).
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    let id = store.append(sample_entry("agent:slash/colon")).unwrap();
    // The id is used in the filename; assert no raw : or / survived
    assert!(!id.contains(':'), "colon must be replaced for filename safety");
    assert!(!id.contains('/'), "slash must be replaced for filename safety");

    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1);
    assert_eq!(
        listed[0].entry.session_id, "agent:slash/colon",
        "data preserved even when filename is sanitised"
    );
}

#[test]
fn inbox_skips_non_json_files_in_root() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();
    store.append(sample_entry("agent:filter:test")).unwrap();

    // Pollute with a non-json file
    std::fs::write(tmp.path().join("README.md"), "not an inbox entry").unwrap();

    let listed = store.list_pending().unwrap();
    assert_eq!(listed.len(), 1, "non-.json files ignored");
}

#[test]
fn inbox_returns_error_when_listing_fails_to_parse() {
    let tmp = tempdir().unwrap();
    let store = InboxStore::new(tmp.path()).unwrap();

    // Write a malformed .json file directly into the root
    std::fs::write(tmp.path().join("inbox_bogus_xyz.json"), "{ not valid json").unwrap();

    let result = store.list_pending();
    assert!(result.is_err(), "list_pending surfaces parse failures");
}
