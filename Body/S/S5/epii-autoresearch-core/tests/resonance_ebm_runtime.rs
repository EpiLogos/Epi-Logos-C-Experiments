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
