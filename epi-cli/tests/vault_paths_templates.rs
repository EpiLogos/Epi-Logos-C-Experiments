use chrono::{NaiveDate, TimeZone, Utc};
use epi_logos::vault::paths::{archive_day_path, day_note_path, now_note_path, thought_note_path};
use epi_logos::vault::templates::{render_template, TemplateRenderContext};
use std::fs;
use std::path::PathBuf;

#[test]
fn builds_day_now_archive_and_thought_paths() {
    let now = Utc.with_ymd_and_hms(2026, 3, 10, 9, 8, 7).unwrap();
    let vault = PathBuf::from("/tmp/vault");

    assert_eq!(
        day_note_path(&vault, now),
        vault.join("Empty/Present/10-03-2026/daily-note.md")
    );
    assert_eq!(
        now_note_path(&vault, now, "20260310-090807-abc123"),
        vault.join("Empty/Present/10-03-2026/20260310-090807-abc123/now.md")
    );
    assert_eq!(
        archive_day_path(&vault, now.date_naive()),
        vault.join("Pratibimba/Self/Action/History/2026/03/W11/10")
    );
    assert_eq!(
        thought_note_path(&vault, now, 4),
        vault.join("Pratibimba/Self/Thought/T4/T4-20260310-090807.md")
    );
}

#[test]
fn world_template_authority_precedes_built_in_template() {
    let root = std::env::temp_dir().join("epi-vault-template-override");
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
