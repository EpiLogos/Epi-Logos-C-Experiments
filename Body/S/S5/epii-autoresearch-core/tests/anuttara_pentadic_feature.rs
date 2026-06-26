#![cfg(feature = "resonance_ebm")]

//! T36.6 — `anuttara_pentadic_runtime_trace` feature-family contract.
//!
//! Fixtures are REAL profiles emitted by portal-core
//! (`MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(..))`), the same
//! kernel projection the portal-core `AnuttaraPentadicRuntimeTraceProbe` reads —
//! never a hand-built mock struct.

use epi_s5_epii_autoresearch_core::resonance_ebm::{
    evaluate_anuttara_pentadic_runtime_trace, score_pentadic_hinges,
    AnuttaraPentadicRuntimeTraceInput, CheckpointLoadPolicy, EbmCheckpoint, PentadicHingeWisdomDelta,
    PentadicRuntimeTracePayload, ResonanceEbmConfig, ResonanceEbmRuntime,
    ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY, PENTADIC_HINGE_LABELS,
};
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

fn real_profile(cycle: u64, tick12: u8) -> MathemeHarmonicProfile {
    // Real kernel fixture — identical projection path to portal-core's
    // anuttara_pentadic_runtime_trace probe test.
    MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, tick12))
}

fn zero_fallback_runtime() -> ResonanceEbmRuntime {
    let config = ResonanceEbmConfig {
        latent_dim: 8,
        channel_encoder_width: 5,
        attention_width: 4,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: None,
        variant_id: "anuttara-pentadic-no-checkpoint".to_owned(),
    };
    ResonanceEbmRuntime::load(config, CheckpointLoadPolicy::AllowZeroFallback)
        .expect("zero-fallback runtime loads")
}

#[test]
fn zero_gradient_path_records_feature_family_without_a_trained_checkpoint() {
    let runtime = zero_fallback_runtime();
    let input = AnuttaraPentadicRuntimeTraceInput::from_profile(
        real_profile(2, 5),
        Some("q-composed://handle/abc".to_owned()),
        Some("checkpoint://learned-predictor/pending".to_owned()),
    );

    let delta = evaluate_anuttara_pentadic_runtime_trace(&input, &runtime)
        .expect("feature-family evaluation succeeds on the zero path");

    // The family is recorded …
    assert_eq!(
        delta.feature_family,
        ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY
    );
    // … without pretending a trained checkpoint exists.
    assert!(!delta.checkpoint_loaded);
    assert_eq!(delta.trained_energy_delta, None);
    assert_eq!(delta.energy_scalar, 0.0);
    assert_eq!(
        delta.gradient_provenance,
        "resonance_ebm::zero_checkpoint_fallback"
    );
    // Inputs are echoed for provenance.
    assert_eq!(
        delta.q_composed_handle.as_deref(),
        Some("q-composed://handle/abc")
    );
    assert_eq!(
        delta.checkpoint_ref.as_deref(),
        Some("checkpoint://learned-predictor/pending")
    );
    assert_eq!(delta.codon_charge, input.profile.q_cosmic);
    // It is a review annotation / wisdom delta — never a canon rewrite.
    assert!(!delta.rewrites_canon);
    assert!(delta.annotation.contains("canon is not rewritten"));
    assert!(delta
        .annotation
        .contains("registered without a trained score"));
}

#[test]
fn real_fixtures_preserve_the_hinge_coherently_across_the_substrate() {
    let runtime = zero_fallback_runtime();
    for tick12 in 0..12u8 {
        let input = AnuttaraPentadicRuntimeTraceInput::from_profile(
            real_profile(0, tick12),
            None,
            None,
        );
        let delta = evaluate_anuttara_pentadic_runtime_trace(&input, &runtime)
            .expect("evaluation succeeds");

        assert_eq!(delta.hinges.len(), 7);
        let labels: Vec<&str> = delta.hinges.iter().map(|hinge| hinge.label).collect();
        assert_eq!(labels, PENTADIC_HINGE_LABELS.to_vec());

        assert!(
            delta.hinge_coherent,
            "tick {tick12} real fixture must preserve the hinge: incoherent={:?}",
            delta.incoherent_hinges()
        );
        assert_eq!(delta.structural_coherence, 1.0);
        assert!(!delta.rewrites_canon);
    }
}

#[test]
fn trained_checkpoint_path_emits_a_real_energy_delta() {
    let temp = tempfile::tempdir().expect("tempdir");
    let checkpoint_path = temp.path().join("pentadic-checkpoint.json");
    let config = ResonanceEbmConfig {
        latent_dim: 8,
        channel_encoder_width: 5,
        attention_width: 4,
        mirror_tolerance: 0.0001,
        energy_weight: 5.0,
        checkpoint_path: Some(checkpoint_path.clone()),
        variant_id: "anuttara-pentadic-trained".to_owned(),
    };
    EbmCheckpoint::seeded_for_config(config, "corpus://snapshot/pentadic-fixture".to_owned())
        .expect("seeded checkpoint")
        .persist(&checkpoint_path)
        .expect("persist checkpoint");

    let runtime = ResonanceEbmRuntime::load(
        ResonanceEbmConfig::from_checkpoint(&checkpoint_path).expect("config from checkpoint"),
        CheckpointLoadPolicy::RequireCheckpoint,
    )
    .expect("trained runtime");

    let input = AnuttaraPentadicRuntimeTraceInput::from_profile(
        real_profile(3, 4),
        Some("q-composed://handle/trained".to_owned()),
        Some("checkpoint://learned-predictor/loaded".to_owned()),
    );
    let delta = evaluate_anuttara_pentadic_runtime_trace(&input, &runtime)
        .expect("trained evaluation succeeds");

    assert_eq!(
        delta.feature_family,
        ANUTTARA_PENTADIC_RUNTIME_TRACE_FEATURE_FAMILY
    );
    assert!(delta.checkpoint_loaded);
    let trained = delta.trained_energy_delta.expect("trained energy delta present");
    assert!(trained.is_finite() && trained >= 0.0);
    assert_eq!(trained, delta.energy_scalar);
    assert_eq!(
        delta.gradient_provenance,
        "resonance_ebm::finite_difference_q_p"
    );
    assert!(delta.hinge_coherent);
    assert!(!delta.rewrites_canon);
    assert!(delta.annotation.contains("trained checkpoint loaded"));
}

#[test]
fn broken_hinge_is_flagged_for_review_not_rewritten() {
    // Start from a real fixture, then corrupt a single hinge address to prove the
    // coherence check actually bites.
    let mut trace = PentadicRuntimeTracePayload::from_profile(&real_profile(1, 7));
    trace.mahamaya_address64 = Some(200); // out of the 0..64 hexagram space
    trace.line_change_operator = 999; // out of the 0..384 line-graph space

    let hinges = score_pentadic_hinges(&trace);
    let incoherent: Vec<&str> = hinges
        .iter()
        .filter(|hinge| !hinge.coherent)
        .map(|hinge| hinge.label)
        .collect();
    assert!(incoherent.contains(&"64"));
    assert!(incoherent.contains(&"384"));

    // Build a delta through the full evaluation to confirm the annotation routes
    // to review and never claims a canon rewrite.
    let runtime = zero_fallback_runtime();
    let input = AnuttaraPentadicRuntimeTraceInput {
        profile: real_profile(1, 7),
        trace,
        codon_charge: real_profile(1, 7).q_cosmic,
        q_composed_handle: None,
        checkpoint_ref: None,
    };
    let delta: PentadicHingeWisdomDelta =
        evaluate_anuttara_pentadic_runtime_trace(&input, &runtime).expect("evaluation succeeds");

    assert!(!delta.hinge_coherent);
    assert!(delta.structural_coherence < 1.0);
    assert!(delta.incoherent_hinges().contains(&"64"));
    assert!(delta.incoherent_hinges().contains(&"384"));
    assert!(!delta.rewrites_canon);
    assert!(delta.annotation.contains("Flagged for wisdom-curation review"));
    assert!(delta.annotation.contains("canon is not rewritten"));
}
