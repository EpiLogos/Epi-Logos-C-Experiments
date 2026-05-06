use std::fs;
use std::path::PathBuf;

use epi_s1_hen_compiler_core::{
    plan_compile, CompilePlanRequest, ExecutorKind, HenTimestamp, TargetAgent,
};

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!(
        "epi-s1-hen-compiler-core-{}-{}",
        name,
        std::process::id()
    ));
    let _ = fs::remove_dir_all(&root);
    root
}

#[test]
fn dry_run_compile_uses_canonical_day_source_and_thought_artifact() {
    let root = temp_root("anima");
    let vault = root.join("Idea");
    let source = vault.join("Empty/Present/25-04-2026/daily-note.md");
    fs::create_dir_all(source.parent().unwrap()).unwrap();
    fs::write(&source, "# Daily Note\n\nReal session material.\n").unwrap();

    let response = plan_compile(CompilePlanRequest {
        vault_root: vault.clone(),
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        now: HenTimestamp::new(2026, 4, 25, 10, 30, 5),
        channel: "ql".to_owned(),
        thought_lane: "T4".to_owned(),
        artifact_slug: "spine-smoke".to_owned(),
        executor_kind: ExecutorKind::PiAgent,
        target_agent: TargetAgent::Anima,
        required_skill: None,
        dry_run: true,
    });

    assert_eq!(response.errors, Vec::<String>::new());
    assert_eq!(response.compiled, 0);
    assert_eq!(response.source_paths, vec![source]);
    assert_eq!(
        response.artifacts,
        vec![vault.join("Pratibimba/Self/Thought/T/T4/spine-smoke.md")]
    );
    assert_eq!(response.ledger_entries, vec!["ql.ledger"]);

    let invocation = response.invocation.unwrap();
    assert_eq!(invocation.executor_kind, ExecutorKind::PiAgent);
    assert_eq!(invocation.target_agent, TargetAgent::Anima);
    assert_eq!(invocation.required_plugin, "pleroma");
    assert_eq!(invocation.required_skill, "anima-orchestration");
    assert_eq!(invocation.review_policy, "epii_inbox");
    assert_eq!(invocation.mutation_mode, "dry_run");
    assert!(!invocation.compatibility_backend);
}

#[test]
fn epii_compile_invocation_uses_epi_logos_plugin_body() {
    let root = temp_root("epii");
    let vault = root.join("Idea");
    let source = vault.join("Empty/Present/25-04-2026/daily-note.md");
    fs::create_dir_all(source.parent().unwrap()).unwrap();
    fs::write(
        &source,
        "# Daily Note\n\nReviewable improvement material.\n",
    )
    .unwrap();

    let response = plan_compile(CompilePlanRequest {
        vault_root: vault,
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        now: HenTimestamp::new(2026, 4, 25, 10, 30, 5),
        channel: "improvement".to_owned(),
        thought_lane: "T5".to_owned(),
        artifact_slug: "improvement-hypothesis".to_owned(),
        executor_kind: ExecutorKind::PiAgent,
        target_agent: TargetAgent::Epii,
        required_skill: Some("autoresearch".to_owned()),
        dry_run: true,
    });

    assert_eq!(response.errors, Vec::<String>::new());
    assert_eq!(response.ledger_entries, vec!["improvement.ledger"]);
    let invocation = response.invocation.unwrap();
    assert_eq!(invocation.executor_kind, ExecutorKind::PiAgent);
    assert_eq!(invocation.target_agent, TargetAgent::Epii);
    assert_eq!(invocation.required_plugin, "epi-logos");
    assert_eq!(invocation.required_skill, "autoresearch");
    assert_eq!(invocation.review_policy, "epii_inbox");
}

#[test]
fn vendor_claude_sdk_is_compatibility_executor_only() {
    let root = temp_root("vendor");
    let vault = root.join("Idea");
    let source = vault.join("Empty/Present/25-04-2026/daily-note.md");
    fs::create_dir_all(source.parent().unwrap()).unwrap();
    fs::write(&source, "# Daily Note\n\nVendor compatibility material.\n").unwrap();

    let response = plan_compile(CompilePlanRequest {
        vault_root: vault,
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        now: HenTimestamp::new(2026, 4, 25, 0, 0, 0),
        channel: "ql".to_owned(),
        thought_lane: "T4".to_owned(),
        artifact_slug: "vendor-compat".to_owned(),
        executor_kind: ExecutorKind::VendorClaudeSdk,
        target_agent: TargetAgent::Anima,
        required_skill: None,
        dry_run: true,
    });

    assert_eq!(response.errors, Vec::<String>::new());
    let invocation = response.invocation.unwrap();
    assert!(invocation.compatibility_backend);
    assert_eq!(invocation.executor_kind, ExecutorKind::VendorClaudeSdk);
    assert_eq!(invocation.tool_boundary, "vendor_compat_read_write");
}

#[test]
fn non_dry_run_requires_pi_agent_executor() {
    let root = temp_root("service-non-dry-run");
    let response = plan_compile(CompilePlanRequest {
        vault_root: root.join("Idea"),
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        now: HenTimestamp::new(2026, 4, 25, 0, 0, 0),
        channel: "ql".to_owned(),
        thought_lane: "T4".to_owned(),
        artifact_slug: "unsafe-service".to_owned(),
        executor_kind: ExecutorKind::Service,
        target_agent: TargetAgent::Anima,
        required_skill: None,
        dry_run: false,
    });

    assert_eq!(response.compiled, 0);
    assert!(response
        .errors
        .contains(&"non-dry-run compile requires pi_agent executor".to_owned()));
}

#[test]
fn plan_compile_rejects_unknown_channel() {
    let root = temp_root("unknown-channel");
    let response = plan_compile(CompilePlanRequest {
        vault_root: root.join("Idea"),
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        now: HenTimestamp::new(2026, 4, 25, 0, 0, 0),
        channel: "vendor".to_owned(),
        thought_lane: "T4".to_owned(),
        artifact_slug: "bad-channel".to_owned(),
        executor_kind: ExecutorKind::PiAgent,
        target_agent: TargetAgent::Anima,
        required_skill: None,
        dry_run: true,
    });

    assert_eq!(response.compiled, 0);
    assert!(response.artifacts.is_empty());
    assert!(response
        .errors
        .contains(&"unknown ledger channel: vendor".to_owned()));
}

#[test]
fn plan_compile_reports_missing_canonical_day_source() {
    let root = temp_root("missing-source");
    let source = root.join("Idea/Empty/Present/25-04-2026/daily-note.md");
    let response = plan_compile(CompilePlanRequest {
        vault_root: root.join("Idea"),
        compiler_root: root.join("Body/S/S1/hen-compiler"),
        now: HenTimestamp::new(2026, 4, 25, 0, 0, 0),
        channel: "ql".to_owned(),
        thought_lane: "T4".to_owned(),
        artifact_slug: "missing-source".to_owned(),
        executor_kind: ExecutorKind::PiAgent,
        target_agent: TargetAgent::Anima,
        required_skill: None,
        dry_run: true,
    });

    assert_eq!(response.compiled, 0);
    assert!(response.artifacts.is_empty());
    assert_eq!(response.source_paths, vec![source.clone()]);
    assert_eq!(
        response.errors,
        vec![format!("source path does not exist: {}", source.display())]
    );
}
