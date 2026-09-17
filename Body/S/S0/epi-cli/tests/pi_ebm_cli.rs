mod common;

use std::fs;

use common::{run_epi, TestEnv};
use serde_json::Value;

#[test]
fn pi_train_ebm_dry_run_emits_training_plan_without_checkpoint() {
    let env = TestEnv::empty();
    let corpus_root = env.root.join("resonance-corpus");
    let env = env.with_env(
        "EPI_RESONANCE_CORPUS_ROOT",
        corpus_root.display().to_string(),
    );

    let out = run_epi(["pi", "train-ebm", "--dry-run"].as_slice(), &env);

    assert!(
        out.status.success(),
        "epi pi train-ebm failed:\nstdout:\n{}\nstderr:\n{}",
        out.stdout,
        out.stderr
    );
    let payload: Value =
        serde_json::from_str(&out.stdout).expect("train-ebm dry-run stdout should be JSON");
    assert_eq!(payload["dryRun"], true);
    assert_eq!(payload["plan"]["manualInvocationRequired"], true);
    assert_eq!(payload["plan"]["eligiblePairs"], 0);
    assert!(payload["plan"]["corpusSnapshotId"]
        .as_str()
        .expect("snapshot id")
        .starts_with("corpus-"));
    assert!(
        !corpus_root.join("checkpoints").exists(),
        "dry-run must not write a checkpoint"
    );
}

#[test]
fn pi_export_ebm_state_writes_reloadable_checkpoint_metadata_pair() {
    let env = TestEnv::empty();
    let corpus_root = env.root.join("resonance-corpus");
    let export_dir = env.root.join("snapshots").join("test");
    let env = env.with_env(
        "EPI_RESONANCE_CORPUS_ROOT",
        corpus_root.display().to_string(),
    );

    let out = run_epi(
        [
            "pi",
            "export-ebm-state",
            export_dir.to_str().expect("export path"),
        ]
        .as_slice(),
        &env,
    );

    assert!(
        out.status.success(),
        "epi pi export-ebm-state failed:\nstdout:\n{}\nstderr:\n{}",
        out.stdout,
        out.stderr
    );
    let payload: Value =
        serde_json::from_str(&out.stdout).expect("export-ebm-state stdout should be JSON");
    assert_eq!(
        payload["checkpointPath"].as_str().expect("checkpoint path"),
        export_dir.join("ebm-checkpoint.json").display().to_string()
    );
    assert_eq!(
        payload["metadataPath"].as_str().expect("metadata path"),
        export_dir.join("metadata.json").display().to_string()
    );
    assert_eq!(
        payload["corpusSnapshotPath"]
            .as_str()
            .expect("corpus snapshot path"),
        export_dir
            .join("corpus-snapshot.json")
            .display()
            .to_string()
    );

    let metadata: Value = serde_json::from_str(
        &fs::read_to_string(export_dir.join("metadata.json")).expect("metadata file"),
    )
    .expect("metadata json");
    let checkpoint: Value = serde_json::from_str(
        &fs::read_to_string(export_dir.join("ebm-checkpoint.json")).expect("checkpoint file"),
    )
    .expect("checkpoint json");

    assert_eq!(metadata["checkpointId"], payload["checkpointId"]);
    assert_eq!(metadata["corpusSnapshotId"], payload["corpusSnapshotId"]);
    assert_eq!(
        checkpoint["corpusSnapshotUri"], metadata["corpusSnapshotUri"],
        "checkpoint must be paired with the exported corpus snapshot"
    );
    assert_eq!(checkpoint["metadata"]["schemaVersion"], 1);
    assert_eq!(
        checkpoint["weights"]["headWeights"]
            .as_array()
            .unwrap()
            .len(),
        3
    );
}
