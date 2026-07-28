mod common;

use common::{run_epi, TestEnv};
use epi_s5_epii_autoresearch_core::resonance_corpus::{ResonanceCorpusStore, TrainingPairInput};

// WHAT THIS SUITE PROVES, AND WHAT IT DELIBERATELY DOES NOT.
//
// S0 is the membrane: these tests prove the CLI reaches the S5 authority and
// writes what it says it wrote. They do NOT execute the model. That assertion
// used to live here, and it cost a `[dev-dependencies]` edge onto
// `epi-s5-epii-autoresearch-core` with `features = ["resonance_ebm"]` — which
// links the whole Candle ML stack (`candle-core`, `candle-nn`) into an S0 test
// binary and is a forbidden S0→S5 import the boundary lint rightly refused
// (`rustSStackBoundary`; the `[dependencies]` re-export edges are ratcheted
// legacy gaps, this one was new).
//
// It bought nothing. `pi train-ebm` / `pi export-ebm-state` are thin delegators
// (`src/main.rs` — they construct a `ResonanceCorpusStore` and call
// `store.train_ebm` / `store.export_ebm_state`), so S0 contributes no logic to
// the artifact, and neither `export_ebm_state`, `train_ebm`, `build_snapshot`
// nor `export_metadata` carries a `cfg(feature = "resonance_ebm")` branch — the
// file the feature-less CLI writes is the same file the featured build writes.
// The runtime round-trip over exactly that artifact is owned one layer down, by
// `exported_checkpoint_round_trips_into_resonance_ebm_runtime` in
// `Body/S/S5/epii-autoresearch-core/src/resonance_corpus/mod.rs`, which calls
// the same `export_ebm_state` and then loads, validates and builds the runtime.
// Proving it twice, across a layer boundary, is not extra coverage.

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
fn pi_train_ebm_fits_real_corpus_and_writes_reloadable_checkpoint() {
    let env = TestEnv::empty();
    let corpus_root = env.root.join("corpus");
    ResonanceCorpusStore::new(&corpus_root)
        .record_training_pair(TrainingPairInput {
            document_id: "doc-one".to_owned(),
            document_path: "corpus/doc-one.md".to_owned(),
            bimba_coordinate: "#2-1-5".to_owned(),
            content_hash: "hash-one".to_owned(),
            resonance_vector: (0..72)
                .map(|index| ((index + 1) % 72) as f32 / 72.0)
                .collect(),
            profile_snapshot: serde_json::json!({"elementTick": 3}),
        })
        .expect("record training pair");

    let out = run_epi(
        &[
            "--json",
            "pi",
            "train-ebm",
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
    assert_eq!(payload["dryRun"], false);
    assert_eq!(payload["plan"]["eligiblePairs"], 1);
    assert!(payload["metrics"]["validationMse"].is_number());
    let checkpoint_path = std::path::PathBuf::from(
        payload["checkpointPath"]
            .as_str()
            .expect("trained checkpoint path"),
    );
    assert!(checkpoint_path.exists());

    // The checkpoint the CLI trained is a real, loadable artifact — asserted at
    // the membrane, by shape, not by executing the model (see the note at the
    // top of this file: the runtime round-trip is S5's).
    let checkpoint: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&checkpoint_path).expect("checkpoint file"))
            .expect("checkpoint is valid json");
    assert_eq!(checkpoint["metadata"]["schemaVersion"], 1);
    assert!(
        checkpoint["metadata"]["architecture"].is_string(),
        "a trained checkpoint names its architecture"
    );
    assert!(
        checkpoint["weights"].is_object(),
        "training must write real weights, not an empty checkpoint"
    );

    // `metadata.json` is the pair's index — it, not the checkpoint body, carries
    // the id the CLI reported. It sits beside the checkpoint the CLI named.
    let metadata_path = checkpoint_path
        .parent()
        .expect("checkpoint sits in the export directory")
        .join("metadata.json");
    let metadata: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&metadata_path).expect("metadata file"))
            .expect("metadata is valid json");
    assert_eq!(
        metadata["checkpointId"], payload["checkpointId"],
        "the exported pair must carry the id the CLI reported"
    );
    assert_eq!(metadata["trainingState"], "trained");
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

    // Shape of the exported pair, asserted at the membrane. The 72-wide
    // resonance vector and the energy scalar are the RUNTIME's invariants and
    // are asserted where the runtime lives (S5's
    // `exported_checkpoint_round_trips_into_resonance_ebm_runtime`).
    let checkpoint_path = export_dir.join("ebm-checkpoint.json");
    let checkpoint: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&checkpoint_path).expect("checkpoint file"))
            .expect("checkpoint is valid json");
    let metadata: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string(export_dir.join("metadata.json")).expect("metadata file"),
    )
    .expect("metadata is valid json");
    assert_eq!(checkpoint["metadata"]["schemaVersion"], 1);
    assert_eq!(
        checkpoint["corpusSnapshotUri"], metadata["corpusSnapshotUri"],
        "checkpoint and metadata must name the same corpus snapshot"
    );
    assert_eq!(
        metadata["checkpointId"], payload["checkpointId"],
        "the exported pair must carry the id the CLI reported"
    );
    assert_eq!(metadata["trainingState"], "bootstrap-untrained");
}
