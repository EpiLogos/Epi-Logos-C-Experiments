use chrono::{DateTime, Local, NaiveDate, TimeZone, Utc};
use epi_logos::vault::paths::{archive_day_path, day_note_path, now_note_path, thought_note_path};
use epi_logos::vault::templates::{render_template, TemplateRenderContext};
use std::fs;
use std::path::PathBuf;

/// The ratified day/stamp law (`src/vault/paths.rs`): the vault day is the LOCAL
/// calendar day spelled MONTH-FIRST, and anything named after the moment it was
/// made carries the LOCAL wall-clock stamp. Restated (not borrowed from the
/// production helpers) so the assertions still say something, and derived from
/// the test's own instant so they hold in every timezone.
fn expected_day_id(now: DateTime<Utc>) -> String {
    now.with_timezone(&Local).format("%m-%d-%Y").to_string()
}

fn expected_stamp(now: DateTime<Utc>) -> String {
    now.with_timezone(&Local)
        .format("%Y%m%d-%H%M%S")
        .to_string()
}

#[test]
fn builds_day_now_archive_and_thought_paths() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let vault = PathBuf::from("/tmp/vault");
    let day_id = expected_day_id(now);
    let stamp = expected_stamp(now);
    let session_id = format!("{stamp}-abc123");

    // Present is FLAT — only History nests.
    assert_eq!(
        day_note_path(&vault, now),
        vault.join(format!("Empty/Present/{day_id}/daily-note.md"))
    );
    assert_eq!(
        now_note_path(&vault, now, &session_id),
        vault.join(format!("Empty/Present/{day_id}/{session_id}/now.md"))
    );
    // The archive takes an explicit NaiveDate, so its nesting is timezone-free.
    assert_eq!(
        archive_day_path(&vault, NaiveDate::from_ymd_opt(2026, 3, 10).unwrap()),
        vault.join("Pratibimba/Self/Action/History/2026/03/W11/10")
    );
    assert_eq!(
        thought_note_path(&vault, now, 4),
        vault.join(format!("Pratibimba/Self/Thought/T/T4/T4-{stamp}.md"))
    );
}

#[test]
fn world_template_authority_precedes_built_in_template() {
    // Unique per run. A FIXED name here was a real hazard, not pedantry: the
    // test `remove_dir_all`s this path on entry, so two concurrent invocations
    // of the binary (cargo runs test binaries in parallel, and a developer may
    // have a full-suite run in flight) each deleted the other's fixture and the
    // override silently vanished before `render_template` looked for it.
    let root = std::env::temp_dir().join(format!(
        "epi-vault-template-override-{}-{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    let _ = fs::remove_dir_all(&root);
    fs::create_dir_all(root.join("Idea/Bimba/World")).unwrap();
    fs::write(
        root.join("Idea/Bimba/World/NOW.md"),
        "---\nartifact_role: now\n---\n\n# Custom Now\n",
    )
    .unwrap();

    let ctx = TemplateRenderContext {
        template_type: "now".to_string(),
        coordinate: Some("M2".to_string()),
        session_id: Some("20260310-090807-abc123".to_string()),
        now: Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap(),
    };
    let rendered = render_template(&ctx, &root, &root.join("home")).unwrap();
    assert!(rendered.contains("# Custom Now"));

    let _ = fs::remove_dir_all(&root);
}

#[test]
fn ct4b_templates_include_all_content_spaces() {
    let ctx = TemplateRenderContext {
        template_type: "daily-note".to_string(),
        coordinate: Some("M2".to_string()),
        session_id: Some("20260310-090807-abc123".to_string()),
        now: Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap(),
    };
    let rendered = render_template(&ctx, &PathBuf::from("/repo"), &PathBuf::from("/home")).unwrap();

    for heading in [
        "## #0 Question",
        "## #1 Material",
        "## #2 Analysis",
        "## #3 Pattern",
        "## #4 Context",
        "## #5 Integration",
    ] {
        assert!(rendered.contains(heading), "missing heading {heading}");
    }
}

#[test]
fn ct4a_and_ct4b_are_distinct_frames() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let ct4a = TemplateRenderContext {
        template_type: "ct4a".to_string(),
        coordinate: None,
        session_id: None,
        now,
    };
    let ct4b = TemplateRenderContext {
        template_type: "ct4b".to_string(),
        coordinate: None,
        session_id: None,
        now,
    };

    let ct4a_rendered =
        render_template(&ct4a, &PathBuf::from("/repo"), &PathBuf::from("/home")).unwrap();
    let ct4b_rendered =
        render_template(&ct4b, &PathBuf::from("/repo"), &PathBuf::from("/home")).unwrap();

    assert!(ct4a_rendered.contains("CF(4.5/0)"));
    assert!(ct4b_rendered.contains("CF(4.0-4.4/5)"));
    assert!(ct4b_rendered.contains("## 4.5 Integration"));
}

#[test]
fn builtin_template_emits_coordinate_not_bimba_coordinate() {
    let ctx = TemplateRenderContext {
        template_type: "now".to_string(),
        coordinate: Some("M2".to_string()),
        session_id: Some("20260310-090807-abc123".to_string()),
        now: Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap(),
    };
    let rendered = render_template(
        &ctx,
        &PathBuf::from("/nonexistent"),
        &PathBuf::from("/home"),
    )
    .unwrap();
    assert!(
        rendered.contains("coordinate: \"M2\""),
        "must emit coordinate: field, got:\n{rendered}"
    );
    assert!(
        !rendered.contains("bimbaCoordinate"),
        "must NOT emit bimbaCoordinate, got:\n{rendered}"
    );
}

#[test]
fn archive_day_path_includes_weekly_dir() {
    // 2026-03-10 is in ISO week 11
    let day = NaiveDate::from_ymd_opt(2026, 3, 10).unwrap();
    let vault = PathBuf::from("/tmp/vault");
    // Contract: {YYYY}/{MM}/W{WW}/{DD}
    assert_eq!(
        archive_day_path(&vault, day),
        vault.join("Pratibimba/Self/Action/History/2026/03/W11/10")
    );
}
