use portal_core::{
    hash_revision, transit_quaternion_at_millis, CpfState, CsDirection, CsField,
    PrewarmVamaShaktiRequest, QActivityAccumulator, VakAddress, VamaShaktiClass,
    VamaShaktiReleaseReason, WarmVamaShaktiFilter, WarmVamaShaktiRegistry,
};

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

fn prewarm(
    registry: &mut WarmVamaShaktiRegistry,
    coordinate: &str,
    class: VamaShaktiClass,
    revision_text: &str,
    now_ms: u64,
) -> String {
    let row = registry.prewarm(PrewarmVamaShaktiRequest {
        coordinate_label: coordinate.to_owned(),
        coordinate: vak(coordinate),
        canonical_form_digest: hash_revision(coordinate),
        archetypal_sattva: format!("{coordinate}:{class}"),
        vama_shakti_class: class,
        psyche_template_md: revision_text.to_owned(),
        entity_form_md: format!("form:{coordinate}"),
        psyche_template_revision: hash_revision(revision_text),
        now_ms,
    });
    row.identity_handle
}

#[test]
fn class_specific_perturbation_is_deterministic_per_class() {
    let turn = vak("M4.user-turn");
    let cited = vec![vak("M4.user-memory"), vak("M2.symbol")];
    for class in [
        VamaShaktiClass::Egregore,
        VamaShaktiClass::Sprite,
        VamaShaktiClass::Daemon,
        VamaShaktiClass::Mantra,
    ] {
        let mut left = QActivityAccumulator::new(class);
        let mut right = QActivityAccumulator::new(class);
        for delta in [0.125, 0.5, -0.25, 1.0] {
            left.apply_turn(&turn, delta, &cited);
            right.apply_turn(&turn, delta, &cited);
        }
        assert_eq!(left.turn_count, 4);
        assert_eq!(left.q_activity_accumulator, right.q_activity_accumulator);
        assert_eq!(left.perturbation_hash, right.perturbation_hash);
    }
}

#[test]
fn class_specific_perturbation_diverges_between_classes() {
    let turn = vak("M4.user-turn");
    let cited = vec![vak("M4.user-memory"), vak("M2.symbol")];
    let mut sprite = QActivityAccumulator::new(VamaShaktiClass::Sprite);
    let mut mantra = QActivityAccumulator::new(VamaShaktiClass::Mantra);
    for delta in [0.125, 0.5, -0.25, 1.0] {
        sprite.apply_turn(&turn, delta, &cited);
        mantra.apply_turn(&turn, delta, &cited);
    }
    assert_ne!(sprite.q_activity_accumulator, mantra.q_activity_accumulator);
}

#[test]
fn warm_resurfacing_composes_with_accumulated_activity_after_scene_close() {
    let mut registry = WarmVamaShaktiRegistry::default();
    let identity = prewarm(
        &mut registry,
        "M4.warm-sprite",
        VamaShaktiClass::Sprite,
        "psyche-v1",
        1_000,
    );
    let turn = vak("M4.user-turn");
    let cited = vec![vak("M4.user-memory")];
    for idx in 0..4 {
        registry
            .apply_turn(
                &identity,
                &turn,
                0.25 + idx as f32 * 0.1,
                &cited,
                2_000 + idx,
            )
            .expect("warm turn applies");
    }

    let q_transit = transit_quaternion_at_millis(10_000);
    let presence = registry
        .summon_warm(
            "scene-after-close",
            &identity,
            q_transit,
            "psyche-v1",
            "form:M4.warm-sprite",
            hash_revision("psyche-v1"),
            10_000,
        )
        .expect("warm identity resurfaces");

    assert_eq!(presence.accumulated_turns_observed, 4);
    assert_eq!(
        presence.q_activity_accumulator,
        registry.warm[&identity]
            .q_activity_accumulator
            .q_activity_accumulator
    );
    assert_ne!(presence.q_activity_accumulator, [1.0, 0.0, 0.0, 0.0]);
    assert_ne!(presence.q_composed_at_now, [1.0, 0.0, 0.0, 0.0]);
}

#[test]
fn template_revision_drift_is_set_on_resurface_against_newer_psyche() {
    let mut registry = WarmVamaShaktiRegistry::default();
    let identity = prewarm(
        &mut registry,
        "M4.daemon",
        VamaShaktiClass::Daemon,
        "psyche-v1",
        1_000,
    );

    let presence = registry
        .summon_warm(
            "scene-with-new-template",
            &identity,
            transit_quaternion_at_millis(11_000),
            "psyche-v2",
            "form:M4.daemon",
            hash_revision("psyche-v2"),
            11_000,
        )
        .expect("warm identity resurfaces");

    assert!(presence.psyche_template_revision_drift);
    assert_eq!(
        presence.psyche_template_revision,
        hash_revision("psyche-v2")
    );
    assert_eq!(
        registry.warm[&identity]
            .essential_identity
            .psyche_template_revision,
        hash_revision("psyche-v2")
    );
}

#[test]
fn class_filter_returns_only_sprite_warm_rows() {
    let mut registry = WarmVamaShaktiRegistry::default();
    prewarm(
        &mut registry,
        "M4.sprite",
        VamaShaktiClass::Sprite,
        "psyche",
        1_000,
    );
    prewarm(
        &mut registry,
        "M4.egregore",
        VamaShaktiClass::Egregore,
        "psyche",
        1_000,
    );

    let rows = registry.list_warm(&WarmVamaShaktiFilter {
        coordinate: None,
        vama_shakti_class: Some(VamaShaktiClass::Sprite),
        age_gte_ms: Some(500),
        now_ms: 2_000,
    });

    assert_eq!(rows.len(), 1);
    assert_eq!(
        rows[0].essential_identity.vama_shakti_class,
        VamaShaktiClass::Sprite
    );
}

#[test]
fn release_marks_warm_row_inactive() {
    let mut registry = WarmVamaShaktiRegistry::default();
    let identity = prewarm(
        &mut registry,
        "M4.mantra",
        VamaShaktiClass::Mantra,
        "psyche",
        1_000,
    );
    registry
        .release(&identity, VamaShaktiReleaseReason::Gc, 2_000)
        .expect("release succeeds");

    let rows = registry.list_warm(&WarmVamaShaktiFilter {
        coordinate: None,
        vama_shakti_class: None,
        age_gte_ms: None,
        now_ms: 3_000,
    });

    assert!(rows.is_empty());
}
