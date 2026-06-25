use std::fs;
use std::path::{Path, PathBuf};

use epi_s1_hen_compiler_core::base_view::{
    derive_base_schema_from_ct_contract, ensure_base_view, BaseEnsureParams, BaseScope,
};

fn temp_root(name: &str) -> PathBuf {
    let mut root = std::env::temp_dir();
    root.push(format!("epi-s1-base-view-{name}-{}", std::process::id()));
    let _ = fs::remove_dir_all(&root);
    fs::create_dir_all(&root).expect("temp root");
    root
}

fn read(path: &Path) -> String {
    fs::read_to_string(path).expect("base-view note")
}

#[test]
fn ct4b_contract_schema_derives_period_console_columns() {
    let schema = derive_base_schema_from_ct_contract("CT4b").expect("CT4b schema");

    assert_eq!(schema.filter, r#"c_1_ct_type == "CT4b""#);
    assert_eq!(schema.group_by.as_deref(), Some("c_3_day_id"));
    assert!(schema.columns.iter().any(|column| column == "c_3_day_id"));
    assert!(schema
        .columns
        .iter()
        .any(|column| column == "c_3_created_at"));
    assert!(schema.columns.iter().any(|column| column == "p0_grounds"));
    assert!(schema
        .columns
        .iter()
        .any(|column| column == "p1_tasks_defined"));
    assert!(schema
        .columns
        .iter()
        .any(|column| column == "p2_operations"));
    assert!(schema.columns.iter().any(|column| column == "p3_decisions"));
    assert!(schema
        .columns
        .iter()
        .any(|column| column == "p4_files_touched"));
    assert!(schema.columns.iter().any(|column| column == "p5_synthesis"));
}

#[test]
fn ensure_base_view_emits_ct4b_markdown_note_and_is_idempotent() {
    let root = temp_root("ct4b-idempotent");
    let residency = root.join("Idea/Empty/Present");
    let params = BaseEnsureParams {
        coordinate: "CT4b".to_owned(),
        ct_type: Some("CT4b".to_owned()),
        scope: BaseScope::Ctx,
        residency: residency.clone(),
        views: None,
    };

    let first = ensure_base_view(&params).expect("first ensure");
    let first_body = read(&first.path);
    let second = ensure_base_view(&params).expect("second ensure");
    let second_body = read(&second.path);

    assert!(first.ok);
    assert!(second.ok);
    assert!(!first.existed);
    assert!(second.existed);
    assert!(!second.changed);
    assert_eq!(first.path, residency.join("CT4b.base-view.md"));
    assert_eq!(first_body, second_body);
    assert_eq!(first.derived_columns, second.derived_columns);
    assert!(first_body.contains("c_4_artifact_role: \"base-view\""));
    assert!(first_body.contains("c_1_ct_type: \"CT4b\""));
    assert!(first_body.contains("```base"));
    assert!(first_body.contains("- 'c_1_ct_type == \"CT4b\"'"));
    assert!(first_body.contains("- p0_grounds"));
    assert!(first_body.contains("- p5_synthesis"));
    assert!(first_body.contains("group_by: c_3_day_id"));
}

#[test]
fn ensure_base_view_refuses_canon_residency() {
    let root = temp_root("canon-refusal");
    let params = BaseEnsureParams {
        coordinate: "CT4b".to_owned(),
        ct_type: Some("CT4b".to_owned()),
        scope: BaseScope::Ctx,
        residency: root.join("Idea/Bimba/World"),
        views: None,
    };

    let error = ensure_base_view(&params).expect_err("canon residency refused");
    assert!(error.contains("reflection-only"));
    assert!(!root.join("Idea/Bimba/World/CT4b.base-view.md").exists());
}
