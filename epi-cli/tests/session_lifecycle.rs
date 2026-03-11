use chrono::{TimeZone, Utc};
use epi_logos::sesh::session::{
    bootstrap_sequence, generate_session_id_with_suffix, SessionContext,
};
use std::fs;
use std::path::PathBuf;

#[test]
fn session_id_matches_required_format() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let session_id = generate_session_id_with_suffix(now, "abc123");
    assert_eq!(session_id, "20260310-090807-abc123");
}

#[test]
fn session_context_derives_day_id_and_now_path() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let vault_root = PathBuf::from("/tmp/vault");
    let context = SessionContext::new_for_tests(now, "abc123", &vault_root);

    assert_eq!(context.session_id, "20260310-090807-abc123");
    assert_eq!(context.day_id, "10-03-2026");
    assert_eq!(
        context.now_path,
        vault_root.join("Empty/Present/10-03-2026/20260310-090807-abc123/now.md")
    );
}

#[test]
fn bootstrap_sequence_uses_specified_order() {
    let now_path = PathBuf::from("/vault/Empty/Present/10-03-2026/20260310-090807-abc123/now.md");
    let artifacts = bootstrap_sequence(PathBuf::from("/repo").as_path(), now_path.as_path());
    let names: Vec<_> = artifacts
        .iter()
        .map(|artifact| artifact.name.as_str())
        .collect();

    assert_eq!(
        names,
        vec![
            "CONTINUATION.md",
            "ANIMA.md",
            "PARADIGM.md",
            "PASU",
            "NOW.md",
            "TOOLS.md",
        ]
    );
    assert_eq!(artifacts[4].path, now_path);
}

#[test]
fn elapsed_summary_is_human_readable() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let later = Utc.with_ymd_and_hms(2026, 3, 10, 10, 10, 10).unwrap();
    let vault_root = PathBuf::from("/tmp/vault");
    let context = SessionContext::new_for_tests(now, "abc123", &vault_root);

    assert_eq!(context.elapsed_summary(later), "1h 2m 3s");
}

#[test]
fn session_id_follows_datetime_prefix_format() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 14, 30, 0).unwrap();
    let vault = PathBuf::from("/tmp/vault");
    let ctx = SessionContext::new(now, Some("tst01"), &vault);
    // Format: {YYYYMMDD-HHmmss-randomId}
    assert!(
        ctx.session_id.starts_with("20260310-143000-"),
        "got: {}",
        ctx.session_id
    );
    assert_eq!(ctx.day_id, "10-03-2026");
}

#[test]
fn now_path_nested_under_day_folder() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 14, 30, 0).unwrap();
    let vault = PathBuf::from("/tmp/vault");
    let ctx = SessionContext::new(now, Some("tst01"), &vault);
    let expected = vault.join("Empty/Present/10-03-2026/20260310-143000-tst01/now.md");
    assert_eq!(ctx.now_path, expected);
}

#[test]
fn bootstrap_sequence_returns_ordered_artifacts() {
    let tmp = std::env::temp_dir().join("epi-bootstrap-test");
    let _ = fs::remove_dir_all(&tmp);
    fs::create_dir_all(&tmp).unwrap();
    // Create ANIMA.md and PASU.md (CONTINUATION absent — should be skipped)
    fs::write(tmp.join("ANIMA.md"), "# ANIMA\n").unwrap();
    fs::write(tmp.join("PASU.md"), "# PASU\n").unwrap();
    let now_path = tmp.join("Empty/Present/10-03-2026/20260310-143000-tst01/now.md");
    fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    fs::write(&now_path, "# NOW\n").unwrap();

    let seq = bootstrap_sequence(&tmp, &now_path);
    let names: Vec<&str> = seq.iter().map(|a| a.name.as_str()).collect();
    // Bootstrap uses PASU (non-dual agent-user field), NOT MEMORY
    assert!(
        names.iter().any(|n| n.contains("PASU")),
        "bootstrap must include PASU, got: {:?}",
        names
    );
    assert!(
        !names.iter().any(|n| n.contains("MEMORY")),
        "bootstrap must NOT include MEMORY (use PASU instead), got: {:?}",
        names
    );
    // ANIMA must come before PASU in ordering
    let anima_pos = names.iter().position(|n| n.contains("ANIMA")).unwrap();
    let pasu_pos = names.iter().position(|n| n.contains("PASU")).unwrap();
    assert!(anima_pos < pasu_pos, "ANIMA must come before PASU");
}
