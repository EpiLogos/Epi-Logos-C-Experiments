use std::path::PathBuf;

use epi_s1_hen_compiler_core::{
    compile_plan, coordinate, frontmatter, graph_sync, ledger, residency,
};

#[test]
fn split_modules_expose_same_contracts_as_crate_root() {
    assert!(coordinate::is_valid_coordinate("S1'"));
    assert!(epi_s1_hen_compiler_core::is_valid_coordinate("S1'"));

    let channels = ledger::ql_first_channels();
    assert_eq!(channels[0].name, "ql");
    assert_eq!(channels, epi_s1_hen_compiler_core::ql_first_channels());

    let now = residency::HenTimestamp::new(2026, 4, 25, 10, 30, 5);
    let residency = residency::resolve_compiler_residency(
        PathBuf::from("/vault/Idea"),
        PathBuf::from("/repo/Body/S/S1/hen-compiler"),
        now,
        "T4".to_owned(),
        "module-surface".to_owned(),
    )
    .expect("residency");
    assert_eq!(residency.day_id, "25-04-2026");

    let invocation = compile_plan::compiler_invocation(
        compile_plan::ExecutorKind::PiAgent,
        compile_plan::TargetAgent::Anima,
        None,
        true,
    );
    assert_eq!(invocation.required_plugin, "pleroma");

    let yaml: serde_yaml::Value = serde_yaml::from_str(
        r#"
coordinate: "T4"
family: "T"
artifact_role: "thought"
day_id: "25-04-2026"
session_id: "session-1"
thought_type: "module"
source_coordinate: "S1'"
invocation_kind: "pi_agent"
provenance_refs:
  - "/vault/Idea/Empty/Present/25-04-2026/daily-note.md"
"#,
    )
    .unwrap();
    assert!(
        frontmatter::validate_compile_artifact_frontmatter(&yaml, &residency, &invocation,)
            .errors
            .is_empty()
    );

    let intent = graph_sync::graph_sync_intent("S1'", PathBuf::from("/vault/file.md"), None)
        .expect("graph intent");
    assert_eq!(intent.mode, graph_sync::GraphSyncMode::CanonicalWrite);
}
