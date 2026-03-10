mod common;

use common::{run_epi, TestEnv};

#[test]
fn knowing_json_outputs_dossier_facets() {
    let env = TestEnv::empty();
    let output = run_epi(&["--json", "core", "knowing", "C1"], &env);

    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    let json: serde_json::Value =
        serde_json::from_str(&output.stdout).expect("knowing should emit valid json");
    assert_eq!(json["coordinate"], "C1");
    assert!(json["essence"]["text"].as_str().is_some());
    assert_eq!(
        json["structural_correspondences"]
            .as_array()
            .map(std::vec::Vec::len),
        Some(6)
    );
    assert!(json["relational_field"].is_object());
    assert_ne!(json["relational_field"]["source"], "structural-placeholder");
    assert!(json["vimarsa_field"].is_object());
    assert_ne!(json["vimarsa_field"]["source"], "structural-placeholder");
    assert!(json["notebook_pulse"].is_object());
    assert!(json["latest_snapshot"].is_object());
    assert_ne!(json["notebook_pulse"]["source"], "structural-placeholder");
    assert_ne!(json["latest_snapshot"]["source"], "structural-placeholder");
    assert!(json["actions"]
        .as_array()
        .is_some_and(|actions| actions.iter().any(|action| action["id"] == "refresh")));
}

#[test]
fn knowing_text_outputs_named_dossier_sections() {
    let env = TestEnv::empty();
    let output = run_epi(&["core", "knowing", "C1"], &env);

    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    for section in [
        "Essence:",
        "Structural Correspondences:",
        "Relational Field:",
        "Vimarsa Field:",
        "Notebook Pulse:",
        "Latest Snapshot:",
        "Actions:",
    ] {
        assert!(
            output.stdout.contains(section),
            "expected output to contain section {section:?}, got:\n{}",
            output.stdout
        );
    }
}

#[test]
fn knowing_help_mentions_dossier_flags() {
    let env = TestEnv::empty();
    let output = run_epi(&["core", "knowing", "--help"], &env);

    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    for flag in [
        "--open",
        "--glow",
        "--project",
        "--limit",
        "--refresh",
        "--tui",
    ] {
        assert!(
            output.stdout.contains(flag),
            "expected help text to contain {flag:?}, got:\n{}",
            output.stdout
        );
    }
}
