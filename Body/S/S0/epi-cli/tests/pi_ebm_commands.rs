mod common;

use common::{run_epi, TestEnv};
use epi_logos::epii_autoresearch::resonance_corpus::{ResonanceCorpusStore, TrainingPairInput};
use epi_logos::epii_autoresearch::resonance_ebm::{
    CheckpointLoadPolicy, ElementTickInvocation, ResonanceEbmConfig, ResonanceEbmRuntime,
};
use portal_core::{kernel_tick_from_epogdoon, BioQuaternionState, MathemeHarmonicProfile};

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

    let runtime = ResonanceEbmRuntime::load(
        ResonanceEbmConfig::from_checkpoint(&checkpoint_path).expect("runtime config"),
        CheckpointLoadPolicy::RequireCheckpoint,
    )
    .expect("trained CLI checkpoint must load in Candle runtime");
    let invocation = ElementTickInvocation::new(
        3,
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 3)),
        BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.2, 0.7, -0.1, 0.3]),
    )
    .expect("element invocation");
    assert!(runtime
        .evaluate(&invocation)
        .expect("trained checkpoint execution")
        .energy_scalar
        .is_finite());
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

    let checkpoint_path = export_dir.join("ebm-checkpoint.json");
    let runtime = ResonanceEbmRuntime::load(
        ResonanceEbmConfig::from_checkpoint(&checkpoint_path).expect("runtime config"),
        CheckpointLoadPolicy::RequireCheckpoint,
    )
    .expect("CLI export must load in the Candle runtime");
    let invocation = ElementTickInvocation::new(
        3,
        MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 3)),
        BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.2, 0.7, -0.1, 0.3]),
    )
    .expect("element invocation");
    let evaluated = runtime
        .evaluate(&invocation)
        .expect("CLI-exported checkpoint must execute");
    assert!(evaluated.checkpoint_loaded);
    assert_eq!(evaluated.resonance_vector.len(), 72);
    assert!(evaluated.energy_scalar.is_finite());
}
