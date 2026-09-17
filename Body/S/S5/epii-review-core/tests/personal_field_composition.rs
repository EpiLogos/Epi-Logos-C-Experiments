//! 08.T8.1 — Privacy-first composition contract (DR-M4-3).
//!
//! M4 personal fields (qIdentity / qTransit / qActivity / qComposed, the
//! audio-octet body, the natal chart) MUST cross into M5 review surfaces only
//! as opaque `*Handle` strings with provenance-state — never as raw
//! quaternions or bodies. The composition boundary is `ReviewStore::submit`;
//! these tests prove the boundary REJECTS raw payloads on every open Value
//! surface (coordinate_context, proposed_action, kernel_visibility.projection)
//! and admits the handle-only form.

use epi_s5_epii_review_core::{
    KernelReviewVisibility, ReviewPriority, ReviewProposedAction, ReviewSource, ReviewStore,
    ReviewSubmission,
};
use serde_json::{json, Value};

fn temp_store_root(name: &str) -> std::path::PathBuf {
    let root = std::env::temp_dir().join(format!("epii-review-core-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    root
}

fn submission_with_context(coordinate_context: Value) -> ReviewSubmission {
    ReviewSubmission {
        source: ReviewSource::Anima,
        title: "Personal composition crossing".to_owned(),
        body: "M4 personal field arrives at the M5 review surface.".to_owned(),
        priority: ReviewPriority::Normal,
        coordinate_context,
        proposed_action: None,
        requires_human: true,
        kernel_visibility: None,
        governance_profile: None,
    }
}

#[test]
fn raw_personal_quaternions_are_rejected_at_the_composition_boundary() {
    let store = ReviewStore::new(temp_store_root("raw-personal-quaternion"));
    for raw_key in [
        "qIdentity",
        "q_identity",
        "qTransit",
        "q_transit",
        "qActivity",
        "q_activity",
        "qComposed",
        "q_composed",
        "qPersonal",
        "q_personal",
    ] {
        let err = store
            .submit(submission_with_context(json!({
                "coordinate": "M4-4",
                raw_key: [0.5, 0.5, 0.5, 0.5]
            })))
            .expect_err("raw personal quaternion must not cross the review boundary");
        assert!(
            err.contains("DR-M4-3") && err.contains(raw_key),
            "rejection must name the law and the leaking key, got: {err}"
        );
    }
}

#[test]
fn audio_octet_and_natal_bodies_are_rejected_even_when_nested() {
    let store = ReviewStore::new(temp_store_root("audio-octet-nested"));
    // nested deep inside a proposed action payload, inside an array
    let submission = ReviewSubmission {
        proposed_action: Some(ReviewProposedAction {
            kind: "identity-augment".to_owned(),
            target: None,
            destination: Some("m5-epii".to_owned()),
            payload: Some(json!({
                "candidates": [
                    { "note": "fine" },
                    { "audio_octet": [440.0, 441.0, 442.0, 443.0, 444.0, 445.0, 446.0, 447.0] }
                ]
            })),
        }),
        ..submission_with_context(json!({ "coordinate": "M4-4" }))
    };
    let err = store
        .submit(submission)
        .expect_err("audio octet body must not cross the review boundary");
    assert!(err.contains("DR-M4-3") && err.contains("audio_octet"), "{err}");

    let err = store
        .submit(submission_with_context(json!({
            "coordinate": "M4-4",
            "kairos": { "natalChart": { "sun": 352.4 } }
        })))
        .expect_err("natal chart body must not cross the review boundary");
    assert!(err.contains("DR-M4-3") && err.contains("natalChart"), "{err}");
}

#[test]
fn kernel_visibility_projection_is_also_a_guarded_surface() {
    let store = ReviewStore::new(temp_store_root("visibility-personal"));
    let submission = ReviewSubmission {
        kernel_visibility: Some(KernelReviewVisibility {
            projection: json!({
                "privacy": "safe-public-current-kernel-tick",
                "computationSource": "portal-core::KernelProjection",
                "q_composed": [1.0, 0.0, 0.0, 0.0]
            }),
            energy_delta: None,
            resonance_delta: None,
            musical_readiness: "ready".to_owned(),
            visual_readiness: "ready".to_owned(),
            advisory_only: true,
        }),
        ..submission_with_context(json!({ "coordinate": "M4-4" }))
    };
    let err = store
        .submit(submission)
        .expect_err("raw composed quaternion must not ride kernel visibility");
    assert!(err.contains("DR-M4-3") && err.contains("q_composed"), "{err}");
}

#[test]
fn opaque_handles_with_provenance_cross_cleanly() {
    let store = ReviewStore::new(temp_store_root("handles-pass"));
    let item = store
        .submit(submission_with_context(json!({
            "coordinate": "M4-4",
            "qIdentityHandle": "protected://nara/identity/fixture-2026-05-29",
            "qTransitHandle": "protected://nara/transit/fixture-2026-05-29",
            "qActivityHandle": "protected://nara/activity/fixture-2026-05-29",
            "qComposedHandle": "protected://nara/composed/fixture-2026-05-29",
            "audioBusHandle": "protected://nara/audio-bus/fixture-2026-05-29",
            "planetaryChakralStateHandle": "protected://nara/chakral/fixture-2026-05-29",
            "provenanceState": "protected_local_handle"
        })))
        .expect("handle-only personal composition must cross");
    assert_eq!(
        item.coordinate_context["qIdentityHandle"],
        "protected://nara/identity/fixture-2026-05-29"
    );
}

#[test]
fn personal_handles_must_be_opaque_strings_not_smuggled_bodies() {
    let store = ReviewStore::new(temp_store_root("handle-smuggle"));
    let err = store
        .submit(submission_with_context(json!({
            "coordinate": "M4-4",
            "qIdentityHandle": [0.5, 0.5, 0.5, 0.5]
        })))
        .expect_err("a personal handle carrying a body instead of a string must reject");
    assert!(err.contains("DR-M4-3") && err.contains("qIdentityHandle"), "{err}");
}
