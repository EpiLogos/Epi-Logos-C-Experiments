#![cfg(feature = "resonance_ebm")]

use epi_s5_epii_autoresearch_core::resonance_ebm::{
    CheckpointLoadPolicy, EbmCheckpoint, ElementTickInvocation, MirrorConsistencyReport,
    ResonanceEbmConfig, ResonanceEbmRuntime,
};
use portal_core::{kernel_tick_from_epogdoon, BioQuaternionState, MathemeHarmonicProfile};

#[test]
fn mirror_consistency_loss_asserts_tritone_pairs() {
    let mut vector = [0.0f32; 72];
    for lens_anchor in 0..12 {
        for position in 0..6 {
            let idx = lens_anchor * 6 + position;
            vector[idx] = (position as f32 + 1.0) / 7.0;
            let mirror_idx = lens_anchor * 6 + (5 - position);
            vector[mirror_idx] = vector[idx];
        }
    }

    let report = MirrorConsistencyReport::evaluate(&vector, 0.0001);

    assert_eq!(report.checked_pairs, 36);
    assert_eq!(report.violations, 0);
    assert_eq!(report.loss, 0.0);
    assert!(report.assert_invariant().is_ok());

    vector[0] = 0.99;
    let broken = MirrorConsistencyReport::evaluate(&vector, 0.0001);
    assert!(broken.violations > 0);
    assert!(broken.assert_invariant().is_err());
}

#[test]
fn checkpoint_roundtrip_reuses_snapshot_deterministically() {
    let temp = tempfile::tempdir().expect("tempdir");
    let checkpoint_path = temp.path().join("ebm-checkpoint.json");
    let config = ResonanceEbmConfig {
        latent_dim: 6,
        channel_encoder_width: 4,
        attention_width: 3,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: Some(checkpoint_path.clone()),
        variant_id: "roundtrip-full-fusion".to_owned(),
    };
    let checkpoint = EbmCheckpoint::seeded_for_config(
        config.clone(),
        "corpus://snapshot/roundtrip-fixture".to_owned(),
    )
    .expect("seeded checkpoint");

    checkpoint
        .persist(&checkpoint_path)
        .expect("persist checkpoint");
    let loaded = EbmCheckpoint::load(&checkpoint_path).expect("load checkpoint");
    let reloaded = EbmCheckpoint::load(&checkpoint_path).expect("reload checkpoint");

    assert_eq!(loaded.metadata, reloaded.metadata);
    assert_eq!(loaded.weights, reloaded.weights);
    assert_eq!(
        loaded.corpus_snapshot_uri,
        "corpus://snapshot/roundtrip-fixture"
    );
}

#[test]
fn checkpoint_rejects_incompatible_architecture_and_channel_metadata() {
    let temp = tempfile::tempdir().expect("tempdir");
    let checkpoint_path = temp.path().join("incompatible-checkpoint.json");
    let config = ResonanceEbmConfig {
        latent_dim: 6,
        channel_encoder_width: 4,
        attention_width: 3,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: Some(checkpoint_path.clone()),
        variant_id: "metadata-validation".to_owned(),
    };
    let mut checkpoint = EbmCheckpoint::seeded_for_config(
        config,
        "corpus://snapshot/metadata-validation".to_owned(),
    )
    .expect("seeded checkpoint");

    checkpoint.metadata.architecture = "legacy/pseudo-tensor-runtime".to_owned();
    assert!(checkpoint.persist(&checkpoint_path).is_err());

    checkpoint = EbmCheckpoint::seeded_for_config(
        checkpoint.config.clone(),
        checkpoint.corpus_snapshot_uri.clone(),
    )
    .expect("replacement checkpoint");
    checkpoint
        .persist(&checkpoint_path)
        .expect("persist valid checkpoint");

    let mut json: serde_json::Value =
        serde_json::from_reader(std::fs::File::open(&checkpoint_path).expect("open checkpoint"))
            .expect("parse checkpoint json");
    json["metadata"]["channelSet"] = serde_json::json!(["lens_resonance_72"]);
    serde_json::to_writer_pretty(
        std::fs::File::create(&checkpoint_path).expect("rewrite checkpoint"),
        &json,
    )
    .expect("write incompatible checkpoint");

    let error = EbmCheckpoint::load(&checkpoint_path).expect_err("reject channel mismatch");
    assert!(error.contains("canonical ordered channel set"), "{error}");
}

#[test]
fn runtime_invocation_reads_full_harmonic_profile_and_returns_energy() {
    let temp = tempfile::tempdir().expect("tempdir");
    let checkpoint_path = temp.path().join("runtime-checkpoint.json");
    let config = ResonanceEbmConfig {
        latent_dim: 8,
        channel_encoder_width: 5,
        attention_width: 4,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: Some(checkpoint_path.clone()),
        variant_id: "runtime-gated-fusion".to_owned(),
    };
    let checkpoint =
        EbmCheckpoint::seeded_for_config(config, "corpus://snapshot/runtime-fixture".to_owned())
            .expect("checkpoint");
    checkpoint.persist(&checkpoint_path).expect("persist");

    let runtime = ResonanceEbmRuntime::load(
        ResonanceEbmConfig::from_checkpoint(&checkpoint_path).expect("config from checkpoint"),
        CheckpointLoadPolicy::RequireCheckpoint,
    )
    .expect("runtime");
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 5));
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
    let invocation = ElementTickInvocation::new(5, profile, state).expect("element invocation");

    let output = runtime.evaluate(&invocation).expect("evaluate");

    assert_eq!(output.resonance_vector.len(), 72);
    assert!(output
        .resonance_vector
        .iter()
        .all(|value| (0.0..=1.0).contains(value)));
    assert!(output.energy_scalar.is_finite());
    assert!(output.energy_scalar >= 0.0);
    assert_eq!(output.channel_set.len(), 7);
    assert_eq!(output.checkpoint_variant_id, "runtime-gated-fusion");
}

#[test]
fn candle_autograd_matches_an_independent_energy_derivative() {
    let temp = tempfile::tempdir().expect("tempdir");
    let checkpoint_path = temp.path().join("autograd-checkpoint.json");
    let config = ResonanceEbmConfig {
        latent_dim: 8,
        channel_encoder_width: 5,
        attention_width: 4,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: Some(checkpoint_path.clone()),
        variant_id: "autograd-gated-fusion".to_owned(),
    };
    EbmCheckpoint::seeded_for_config(config, "corpus://snapshot/autograd-fixture".to_owned())
        .expect("checkpoint")
        .persist(&checkpoint_path)
        .expect("persist");
    let runtime = ResonanceEbmRuntime::load(
        ResonanceEbmConfig::from_checkpoint(&checkpoint_path).expect("config"),
        CheckpointLoadPolicy::RequireCheckpoint,
    )
    .expect("runtime");
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 7));
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.21, 0.68, -0.31, 0.19]);
    let invocation = ElementTickInvocation::new(7, profile, state.clone()).expect("invocation");

    let gradient = runtime.gradient(&invocation).expect("autograd");
    assert_eq!(gradient.provenance, "resonance_ebm::candle_autograd_q_p");

    let epsilon = 0.0005f32;
    for idx in 0..4 {
        let mut plus_state = state.clone();
        plus_state.q_p[idx] += epsilon;
        let plus = ElementTickInvocation::new(7, invocation.profile.clone(), plus_state)
            .expect("plus invocation");
        let mut minus_state = state.clone();
        minus_state.q_p[idx] -= epsilon;
        let minus = ElementTickInvocation::new(7, invocation.profile.clone(), minus_state)
            .expect("minus invocation");
        let numerical = (runtime.evaluate(&plus).expect("plus").energy_scalar
            - runtime.evaluate(&minus).expect("minus").energy_scalar)
            / (2.0 * epsilon);
        assert!(
            (gradient.d_energy_d_q_p[idx] - numerical).abs() < 0.002,
            "component {idx}: autograd={} numerical={numerical}",
            gradient.d_energy_d_q_p[idx],
        );
    }
}

#[test]
fn unloaded_checkpoint_uses_zero_gradient_fallback_without_fake_scores() {
    let config = ResonanceEbmConfig {
        latent_dim: 8,
        channel_encoder_width: 5,
        attention_width: 4,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: None,
        variant_id: "no-checkpoint".to_owned(),
    };
    let runtime = ResonanceEbmRuntime::load(config, CheckpointLoadPolicy::AllowZeroFallback)
        .expect("zero fallback runtime");
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(0, 0));
    let state = BioQuaternionState::new([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]);
    let invocation = ElementTickInvocation::new(0, profile, state).expect("element invocation");

    let output = runtime.evaluate(&invocation).expect("fallback evaluate");
    let gradient = runtime.gradient(&invocation).expect("fallback gradient");

    assert_eq!(output.energy_scalar, 0.0);
    assert!(output.resonance_vector.iter().all(|value| *value == 0.0));
    assert_eq!(gradient.d_energy_d_q_p, [0.0; 4]);
    assert_eq!(
        gradient.provenance,
        "resonance_ebm::zero_checkpoint_fallback"
    );
}

#[test]
fn training_surface_cites_operational_capacity_substrates() {
    let training_surface = include_str!("../src/resonance_ebm/training.rs");

    assert!(training_surface.contains("parashakti-graph-relational-ml"));
    assert!(training_surface.contains("mahamaya-process-reward-rl"));
}
