mod common;

use common::{run_epi, TestEnv};

#[test]
fn pi_train_ebm_dry_run_reports_training_plan() {
    let env = TestEnv::empty();
    let corpus_root = env.root.join("corpus");
    let out = run_epi(
        &[
            "--json",
            "pi",
            "train-ebm",
            "--dry-run",
            "--corpus-root",
            corpus_root.to_str().expect("corpus path"),
        ],
        &env,
    );

    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );
    let payload: serde_json::Value = serde_json::from_str(&out.stdout).expect("json");
    assert_eq!(payload["dryRun"], true);
    assert_eq!(payload["plan"]["manualInvocationRequired"], true);
    assert_eq!(payload["plan"]["eligiblePairs"], 0);
    assert!(payload["checkpointId"].is_null());
}

#[test]
fn pi_export_ebm_state_writes_checkpoint_and_metadata() {
    let env = TestEnv::empty();
    let corpus_root = env.root.join("corpus");
    let export_dir = env.root.join("snapshot");
    let out = run_epi(
        &[
            "--json",
            "pi",
            "export-ebm-state",
            export_dir.to_str().expect("export path"),
            "--corpus-root",
            corpus_root.to_str().expect("corpus path"),
        ],
        &env,
    );

    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );
    let payload: serde_json::Value = serde_json::from_str(&out.stdout).expect("json");
    assert!(payload["checkpointPath"]
        .as_str()
        .expect("checkpoint path")
        .ends_with("ebm-checkpoint.json"));
    assert!(export_dir.join("ebm-checkpoint.json").exists());
    assert!(export_dir.join("metadata.json").exists());
    assert!(export_dir.join("corpus-snapshot.json").exists());
}
