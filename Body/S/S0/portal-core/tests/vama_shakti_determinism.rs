//! Determinism + classifier-discrimination contract for the Vama Shakti
//! essential-identity derivation (Tranche 41.3).
//!
//! Invariants exercised here:
//!   * DR-VAMA-2 — identical inputs derive an identical essential identity.
//!   * DR-VAMA-6 — the classifier byte participates in the quintessence hash,
//!     so the same coordinate under a different class is a distinct identity.
//!   * DR-VAMA-5 — the rūpa specialization is exposed only as an opaque,
//!     `protected://` handle; the raw rūpa body never crosses the bus, and the
//!     classifier inflects the (Frame Contract / Sattva) specialization hash.
//!   * cosmic-clock — the projected clock position lands on the 0..360° circle
//!     and the identity quaternion is a unit quaternion.

use portal_core::{
    compose_personal_quaternion, derive_vama_shakti_essential_identity, hash_revision,
    perturb_q_activity, rupa_specialization_handle, CpfState, CsDirection, CsField, VakAddress,
    VamaShaktiClass,
};

const ALL_CLASSES: [VamaShaktiClass; 4] = [
    VamaShaktiClass::Egregore,
    VamaShaktiClass::Sprite,
    VamaShaktiClass::Daemon,
    VamaShaktiClass::Mantra,
];

fn vak(label: &str) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: label.to_owned(),
        cf: "(4.5/0)".to_owned(),
        cfp: "m4.arena.test".to_owned(),
        cs: CsField {
            code: format!("test:{label}"),
            direction: CsDirection::Day,
            recognized: false,
        },
    }
}

fn quat_is_unit(q: [f32; 4]) -> bool {
    let mag2 = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
    (mag2 - 1.0).abs() < 1e-4
}

// ---------------------------------------------------------------------------
// DR-VAMA-2 — identical inputs derive an identical essential identity.
// ---------------------------------------------------------------------------
#[test]
fn identical_inputs_derive_identical_essential_identity() {
    let coord = vak("M4.companion");
    let digest = hash_revision("canonical-form");
    let revision = hash_revision("psyche-v1");

    for class in ALL_CLASSES {
        let left = derive_vama_shakti_essential_identity(
            &coord,
            &digest,
            "archetypal-sattva",
            class,
            revision,
        );
        let right = derive_vama_shakti_essential_identity(
            &coord,
            &digest,
            "archetypal-sattva",
            class,
            revision,
        );

        assert_eq!(
            left, right,
            "{class}: identical inputs must derive an identical essential identity"
        );
        assert_eq!(
            left.vama_shakti_quintessence_hash, right.vama_shakti_quintessence_hash,
            "{class}: quintessence hash must be deterministic"
        );
        assert_eq!(
            left.vama_shakti_clock_position,
            right.vama_shakti_clock_position
        );
        assert_eq!(left.vama_shakti_q_identity, right.vama_shakti_q_identity);
    }
}

// ---------------------------------------------------------------------------
// Collision-resistance — each of the four hashed inputs perturbs the hash.
// ---------------------------------------------------------------------------
#[test]
fn distinct_input_tuples_produce_distinct_hashes() {
    let coord_a = vak("M4.companion-a");
    let coord_b = vak("M4.companion-b");
    let digest_a = hash_revision("form-a");
    let digest_b = hash_revision("form-b");
    let revision = hash_revision("psyche-v1");
    let class = VamaShaktiClass::Daemon;

    let base =
        derive_vama_shakti_essential_identity(&coord_a, &digest_a, "sattva-a", class, revision)
            .vama_shakti_quintessence_hash;

    // Vary coordinate only.
    let h_coord =
        derive_vama_shakti_essential_identity(&coord_b, &digest_a, "sattva-a", class, revision)
            .vama_shakti_quintessence_hash;
    // Vary canonical form digest only.
    let h_digest =
        derive_vama_shakti_essential_identity(&coord_a, &digest_b, "sattva-a", class, revision)
            .vama_shakti_quintessence_hash;
    // Vary archetypal sattva only.
    let h_sattva =
        derive_vama_shakti_essential_identity(&coord_a, &digest_a, "sattva-b", class, revision)
            .vama_shakti_quintessence_hash;
    // Vary classifier only.
    let h_class = derive_vama_shakti_essential_identity(
        &coord_a,
        &digest_a,
        "sattva-a",
        VamaShaktiClass::Sprite,
        revision,
    )
    .vama_shakti_quintessence_hash;

    let hashes = [base, h_coord, h_digest, h_sattva, h_class];
    for i in 0..hashes.len() {
        for j in (i + 1)..hashes.len() {
            assert_ne!(
                hashes[i], hashes[j],
                "distinct (coordinate, form_digest, sattva, classifier) tuples must collide-resist (pair {i},{j})"
            );
        }
    }
}

// ---------------------------------------------------------------------------
// DR-VAMA-6 — same coordinate, every distinct classifier is a distinct hash.
// ---------------------------------------------------------------------------
#[test]
fn classifier_discriminates_quintessence_hash() {
    let coord = vak("M4.shared");
    let digest = hash_revision("shared-form");
    let revision = hash_revision("psyche-v1");

    let hashes: Vec<[u8; 32]> = ALL_CLASSES
        .iter()
        .map(|&class| {
            derive_vama_shakti_essential_identity(&coord, &digest, "shared-sattva", class, revision)
                .vama_shakti_quintessence_hash
        })
        .collect();

    for i in 0..hashes.len() {
        for j in (i + 1)..hashes.len() {
            assert_ne!(
                hashes[i], hashes[j],
                "same coordinate + different classifier must produce distinct hashes ({}, {})",
                ALL_CLASSES[i], ALL_CLASSES[j]
            );
        }
    }
}

// ---------------------------------------------------------------------------
// cosmic-clock — projected clock degree lands on the circle; q is unit.
// ---------------------------------------------------------------------------
#[test]
fn clock_position_lands_on_circle_and_quaternion_is_unit() {
    let digest = hash_revision("clock-form");
    let revision = hash_revision("psyche-v1");

    for label in ["M0.ground", "M2.symbol", "M4.user", "M5.epii"] {
        let coord = vak(label);
        for class in ALL_CLASSES {
            let id = derive_vama_shakti_essential_identity(
                &coord,
                &digest,
                "clock-sattva",
                class,
                revision,
            );
            assert!(
                (0.0..360.0).contains(&id.vama_shakti_clock_position),
                "{label}/{class}: clock position {} must lie on the 0..360 circle",
                id.vama_shakti_clock_position
            );
            assert!(
                quat_is_unit(id.vama_shakti_q_identity),
                "{label}/{class}: identity quaternion {:?} must be a unit quaternion",
                id.vama_shakti_q_identity
            );
        }
    }
}

// ---------------------------------------------------------------------------
// compose-at-now reuses the personal-identity algebra (one algebra across
// PASU and Vama Shakti) and stays on the unit sphere.
// ---------------------------------------------------------------------------
#[test]
fn compose_at_now_matches_personal_quaternion_law_and_stays_unit() {
    use portal_core::{compose_vama_shakti_q_at_now, transit_quaternion_at_millis};

    let coord = vak("M4.companion");
    let digest = hash_revision("compose-form");
    let revision = hash_revision("psyche-v1");
    let essential = derive_vama_shakti_essential_identity(
        &coord,
        &digest,
        "compose-sattva",
        VamaShaktiClass::Daemon,
        revision,
    );

    let q_transit = transit_quaternion_at_millis(7_200_000);
    let q_activity = perturb_q_activity(
        [1.0, 0.0, 0.0, 0.0],
        &vak("M4.user-turn"),
        0.5,
        &[vak("M4.user-memory")],
        VamaShaktiClass::Daemon,
    );

    let composed = compose_vama_shakti_q_at_now(&essential, q_transit, q_activity);
    let expected =
        compose_personal_quaternion(essential.vama_shakti_q_identity, q_transit, q_activity);

    assert_eq!(
        composed, expected,
        "compose_vama_shakti_q_at_now must reuse the personal-quaternion law verbatim"
    );
    assert!(
        quat_is_unit(composed),
        "composed quaternion must stay on the unit sphere"
    );
}

// ---------------------------------------------------------------------------
// DR-VAMA-5 — the rūpa specialization is opaque, dialogue-only, and the
// classifier inflects the (Frame Contract / Sattva) specialization hash.
// ---------------------------------------------------------------------------
#[test]
fn rupa_specialization_is_opaque_and_dialogue_only() {
    let coord = vak("M4.companion");
    let revision = hash_revision("psyche-v1");
    let psyche_md = "# Psyche Template\n## Frame Contract\n## Sattva\n";
    let entity_md = "## Rupa\nbody\n## Ontology\ndef\n## Sattva\narchetype\n";

    let handle = rupa_specialization_handle(
        psyche_md,
        entity_md,
        &coord,
        VamaShaktiClass::Daemon,
        revision,
    );

    // (a) dialogue-only profile enforced: only an opaque, protected handle is
    // exposed — the raw rūpa body never crosses the bus.
    assert!(
        handle.handle.starts_with("protected://nara/vama/rupa/"),
        "rūpa handle must be an opaque protected:// reference, got `{}`",
        handle.handle
    );
    assert!(
        !handle.handle.contains("body") && !handle.handle.contains("Rupa"),
        "opaque handle must not leak the raw rūpa body"
    );

    // Serializing the handle must not surface the raw template/form bodies.
    let serialized = serde_json::to_string(&handle).expect("handle serializes");
    assert!(
        !serialized.contains("body") && !serialized.contains("Ontology"),
        "serialized handle must not leak raw rūpa material across the bus"
    );

    // Determinism: identical inputs → identical handle.
    let again = rupa_specialization_handle(
        psyche_md,
        entity_md,
        &coord,
        VamaShaktiClass::Daemon,
        revision,
    );
    assert_eq!(
        handle, again,
        "rūpa specialization handle must be deterministic"
    );
}

#[test]
fn rupa_specialization_carries_classifier_and_sattva_inflection() {
    let coord = vak("M4.companion");
    let revision = hash_revision("psyche-v1");
    let psyche_md = "# Psyche Template\n";
    let entity_md_a = "## Sattva\narchetype-a\n";
    let entity_md_b = "## Sattva\narchetype-b\n";

    // (b) Frame Contract carries classifier-specific predicates: same form/sattva,
    // different classifier → different specialization handle + hash.
    let handles: Vec<_> = ALL_CLASSES
        .iter()
        .map(|&class| rupa_specialization_handle(psyche_md, entity_md_a, &coord, class, revision))
        .collect();
    for i in 0..handles.len() {
        for j in (i + 1)..handles.len() {
            assert_ne!(
                handles[i].specialization_hash, handles[j].specialization_hash,
                "classifier must inflect the Frame Contract specialization ({}, {})",
                ALL_CLASSES[i], ALL_CLASSES[j]
            );
            assert_ne!(
                handles[i].handle, handles[j].handle,
                "classifier must produce a distinct opaque handle"
            );
        }
    }

    // (c) Sattva carries classifier inflection: same classifier, different
    // archetypal sattva (entity form) → different specialization.
    let sattva_a = rupa_specialization_handle(
        psyche_md,
        entity_md_a,
        &coord,
        VamaShaktiClass::Mantra,
        revision,
    );
    let sattva_b = rupa_specialization_handle(
        psyche_md,
        entity_md_b,
        &coord,
        VamaShaktiClass::Mantra,
        revision,
    );
    assert_ne!(
        sattva_a.specialization_hash, sattva_b.specialization_hash,
        "differing archetypal Sattva must inflect the specialization"
    );
}

// ---------------------------------------------------------------------------
// Perturbation — class-specific rotation rules diverge correctly.
// ---------------------------------------------------------------------------
#[test]
fn perturbation_is_deterministic_per_class() {
    let turn = vak("M4.user-turn");
    let cited = vec![vak("M4.user-memory"), vak("M2.symbol")];

    for class in ALL_CLASSES {
        let left = perturb_q_activity([1.0, 0.0, 0.0, 0.0], &turn, 0.5, &cited, class);
        let right = perturb_q_activity([1.0, 0.0, 0.0, 0.0], &turn, 0.5, &cited, class);
        assert_eq!(left, right, "{class}: perturbation must be deterministic");
        assert!(
            quat_is_unit(left),
            "{class}: perturbed quaternion must stay unit"
        );
    }
}

#[test]
fn perturbation_diverges_across_all_classes() {
    let turn = vak("M4.user-turn");
    let cited = vec![vak("M4.user-memory"), vak("M2.symbol")];

    let results: Vec<[f32; 4]> = ALL_CLASSES
        .iter()
        .map(|&class| perturb_q_activity([1.0, 0.0, 0.0, 0.0], &turn, 0.5, &cited, class))
        .collect();

    for i in 0..results.len() {
        for j in (i + 1)..results.len() {
            assert_ne!(
                results[i], results[j],
                "class-specific perturbation must diverge ({}, {})",
                ALL_CLASSES[i], ALL_CLASSES[j]
            );
        }
    }
}

#[test]
fn daemon_perturbation_weights_user_coordinates() {
    let turn = vak("M4.turn");
    // Equal cited count, differing only in user-ish vs non-user coordinates.
    let user_cited = vec![vak("M4.user-memory"), vak("M4.personal-thread")];
    let non_user_cited = vec![vak("M2.symbol"), vak("M3.codon")];

    let weighted = perturb_q_activity(
        [1.0, 0.0, 0.0, 0.0],
        &turn,
        0.5,
        &user_cited,
        VamaShaktiClass::Daemon,
    );
    let unweighted = perturb_q_activity(
        [1.0, 0.0, 0.0, 0.0],
        &turn,
        0.5,
        &non_user_cited,
        VamaShaktiClass::Daemon,
    );

    assert_ne!(
        weighted, unweighted,
        "daemon perturbation must weight user-ish cited coordinates differently"
    );
}
