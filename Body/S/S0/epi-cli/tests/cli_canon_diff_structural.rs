mod common;

use common::{run_epi, TestEnv};

#[test]
fn canon_diff_returns_changed_poles_with_before_after_text() {
    let env = TestEnv::empty();
    let output = run_epi(&["canon", "diff", "P1-137-M0", "P2-137-M0"], &env);
    assert!(
        output.status.success(),
        "command failed:\nstdout:\n{}\n\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    let json: serde_json::Value =
        serde_json::from_str(&output.stdout).expect("diff output should be json");
    assert_eq!(json["from"], "P1-137-M0");
    assert_eq!(json["to"], "P2-137-M0");
    let changes = json["changed_poles"].as_array().expect("changed poles");
    assert!(!changes.is_empty(), "diff must report structural changes");
    assert!(changes.iter().all(|change| {
        change["pole"].is_string()
            && change["before"]["ql_text"].is_string()
            && change["after"]["ql_text"].is_string()
            && change["before"]["ql_text"] != change["after"]["ql_text"]
    }));
}
