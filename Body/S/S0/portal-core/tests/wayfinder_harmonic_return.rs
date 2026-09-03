use portal_core::{
    ananda_ql_traversal_event, bridge_ananda_ql_traversal, kernel_tick_from_epogdoon,
    project_janko_traversal, AnandaMatrixOp, AnandaQlTraversalRequest, AnandaTraversalSelection,
    AnandaVortexCell, ConjugateParticipation, M2BoundedRoute, M2MusicalRouteInput,
    M2RelationPlan, M2RelationPlanContext, M2SituatedProviderBinding, M3PrimarySelectionEvidence,
    M3ReplayPlanInput, M3Score, M3ScoreDirection, M3StableSourceRefs, MathemeHarmonicProfile,
    PointerTraversalEvidence, TraversalBasis, TraversalConjugateParticipation, TraversalCoordinate,
    TraversalFace,
};
use ql_core::{QlCoordinate, QlFace, QlPosition};
use ql_mef::{ContextFrameId, LensId, MusicalBasis};

fn q(position6: u8, face: QlFace) -> QlCoordinate {
    QlCoordinate::new(
        QlPosition::new(position6).expect("test position remains inside canonical 0..5"),
        face,
    )
}

fn situated_binding() -> M2SituatedProviderBinding {
    M2SituatedProviderBinding {
        planetary_state_ref: "provider:kerykeion:wayfinder-now".to_owned(),
        chakra_state_ref: "M4:nara:chakra:wayfinder-now".to_owned(),
        elemental_state_ref: "M4:nara:element:wayfinder-now".to_owned(),
        identity_relation_refs: vec!["S2':relation:nara-world:wayfinder".to_owned()],
        temporal_provider_refs: vec!["S3':world-clock:wayfinder-now".to_owned()],
    }
}

#[test]
fn wayfinder_m1_m4_forward_and_return_trace_preserves_each_native_distinction() {
    let episode_ref = "M4:episode:wayfinder-harmonic-001".to_owned();
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(0, 3));

    // M1 / W2: compose a source-backed Ananda ratio with an actual QL traversal.
    // The cell contributes harmonic evidence; the walk contributes relation identity.
    let traversal = ananda_ql_traversal_event(AnandaQlTraversalRequest {
        source: TraversalCoordinate {
            position6: 0,
            face: TraversalFace::Direct,
        },
        target: TraversalCoordinate {
            position6: 1,
            face: TraversalFace::Direct,
        },
        pointer: PointerTraversalEvidence {
            source_ref: "S2':coordinate:#0".to_owned(),
            target_ref: "S2':coordinate:#1".to_owned(),
            relation_ref: "S2':pointer:#0->#1".to_owned(),
            relation_roles: vec!["epogdoon-tick".to_owned()],
        },
        ananda: AnandaTraversalSelection {
            family: AnandaMatrixOp::Pratibimba,
            row12: 3,
            col12: 1,
        },
        conjugate_participation: TraversalConjugateParticipation::Both,
        basis: TraversalBasis::Chromatic,
        lens12: 0,
    })
    .expect("W2 traversal composes accepted owners");

    assert_eq!(traversal.ananda_cell.raw_value, Some(4));
    assert_eq!(traversal.ananda_cell.dr_value, Some(4));
    assert_eq!(traversal.ananda_cell.decimal10_value, Some(4));
    let ratio = traversal
        .ananda_ratio
        .as_ref()
        .expect("3X+1 is source-backed 4/3 evidence");
    assert_eq!((ratio.ratio.numerator, ratio.ratio.denominator), (4, 3));
    assert_eq!(traversal.relations.len(), 1);
    assert_eq!(traversal.relations[0].family, "A");
    assert_eq!(traversal.relations[0].completion_degree, "D3");
    assert_eq!(traversal.relations[0].completion_coordinates.len(), 4);
    assert_eq!(traversal.relations[0].interval_semitones, 2);

    // W3: compile the current 72-fold Power state into a bounded, real-time-safe plan.
    let forward_plan = M2RelationPlan::compile(
        &profile,
        M2RelationPlanContext {
            source_score_or_world_ref: episode_ref.clone(),
            situated_provider: Some(situated_binding()),
            musical: M2MusicalRouteInput {
                maqam_ref: Some("S2':maqam:wayfinder".to_owned()),
                tuning_ref: Some("S2':tuning:wayfinder".to_owned()),
                phrase_or_modulation_ref: Some("S2':phrase:wayfinder".to_owned()),
                mantra_or_name_route_refs: vec!["S2':shem:wayfinder".to_owned()],
            },
            material_routes: vec![M2BoundedRoute {
                route_ref: "material:wayfinder".to_owned(),
                provenance_ref: "S2':material:wayfinder".to_owned(),
            }],
            control_routes: vec![M2BoundedRoute {
                route_ref: "control:wayfinder".to_owned(),
                provenance_ref: "S2':control:wayfinder".to_owned(),
            }],
            audio_routes: vec![M2BoundedRoute {
                route_ref: "audio:vimarsha-octet".to_owned(),
                provenance_ref: "portal-core::parashakti::vimarsha_reading".to_owned(),
            }],
            provenance_refs: vec!["trace:forward:wayfinder".to_owned()],
        },
    )
    .expect("W3 relation plan compiles from bounded evidence");

    assert_eq!(forward_plan.source_score_or_world_ref, episode_ref);
    assert_eq!(forward_plan.situated.binding_state, "provider-bound");
    assert_eq!(forward_plan.execution.audio_octet_hz, profile.audio_octet);
    assert_eq!(forward_plan.execution.nodal_quartet, profile.nodal_quartet);
    assert_eq!(
        forward_plan.det.epogdoon_index64,
        ((u16::from(forward_plan.det.source_index72) * 8) / 9) as u8
    );

    // W4 forward hinge: the performed/current world state is inscribed as M3 score.
    let forward_score = M3Score::from_current_profile(
        &profile,
        M3StableSourceRefs {
            source_m1_ref: Some("M1:event:wayfinder-forward".to_owned()),
            source_m2_relation_plan_ref: Some("M2:plan:wayfinder-forward".to_owned()),
            source_world_event_ref: episode_ref.clone(),
            provenance_refs: vec!["trace:forward:wayfinder".to_owned()],
        },
    )
    .expect("current profile produces a forward M3 score");

    assert_eq!(forward_score.direction, M3ScoreDirection::Forward);
    assert_eq!(forward_score.sources.source_world_event_ref, episode_ref);
    assert!(forward_score.clock_position.is_some());
    assert_eq!(
        forward_score.primary_codec.address64,
        profile.binary.mahamaya_address64.expect("current profile has primary M3 address")
    );

    // Same M4 episode returns through M3. The still-open entity->address law is
    // NOT invented: the primary selection enters with explicit provenance.
    let return_score = M3Score::from_primary_selection(M3PrimarySelectionEvidence {
        address64: forward_score.primary_codec.address64,
        selection_derivation_ref: "M4->M3:explicit-selection:wayfinder".to_owned(),
        source_entity_or_event_ref: episode_ref.clone(),
        line_index: profile.binary.line_index,
        m2_vibration_index: profile.binary.m2_vibration_index,
        rna_phase: profile.binary.dna_rna_phase == "RNA",
        rotation: None,
        rotation_derivation_ref: None,
        temporal_context_ref: Some("S3':world-clock:episode-wayfinder".to_owned()),
        provenance_refs: vec!["M4:identity:evidence:wayfinder".to_owned()],
    })
    .expect("return score accepts only explicit provenance-backed primary selection");

    assert_eq!(return_score.direction, M3ScoreDirection::Return);
    assert_eq!(return_score.sources.source_world_event_ref, episode_ref);
    assert_eq!(return_score.primary_codec.address64, forward_score.primary_codec.address64);
    assert!(return_score.clock_position.is_none());
    assert_eq!(
        return_score.temporal_context_ref.as_deref(),
        Some("S3':world-clock:episode-wayfinder")
    );

    // Return M3 score is refracted through a current M2 plan. Provider/world state
    // can be current while the score remains the stable determinate source.
    let replay_plan = return_score
        .compile_m2_replay_plan(
            &profile,
            M3ReplayPlanInput {
                score_ref: "M3:score:wayfinder-return".to_owned(),
                situated_provider: Some(situated_binding()),
                musical: M2MusicalRouteInput::default(),
                material_routes: vec![],
                control_routes: vec![],
                audio_routes: vec![],
                provenance_refs: vec!["trace:return:wayfinder".to_owned()],
            },
        )
        .expect("return score compiles a bounded M2 replay plan");

    assert_eq!(replay_plan.source_score_or_world_ref, "M3:score:wayfinder-return");
    assert_eq!(replay_plan.situated.binding_state, "provider-bound");
    assert_eq!(replay_plan.execution.audio_octet_hz, profile.audio_octet);
    assert!(replay_plan.provenance.iter().any(|p| p.contains("M3-RECIPROCAL-SCORE-HINGE")));

    // W5 / returned performance projection: consume the same accepted QL musical
    // realization on the Janko controller without turning controller geometry into authority.
    let cell = AnandaVortexCell::project(AnandaMatrixOp::Pratibimba, 3, 1)
        .expect("canonical Ananda source cell");
    let bridge = bridge_ananda_ql_traversal(
        &cell,
        q(0, QlFace::Direct),
        q(1, QlFace::Direct),
        ConjugateParticipation::Both,
        MusicalBasis::Chromatic,
        LensId::L0,
    )
    .expect("accepted QL bridge realization");
    let performance = project_janko_traversal(
        &bridge.realizations[0],
        ContextFrameId::Cf1,
        0,
        1,
        bridge.ananda_ratio.as_ref(),
    )
    .expect("controller projection consumes the returned musical state");

    assert_eq!(performance.relation_family, "A");
    assert_eq!(performance.completion_degree, "D3");
    assert_eq!(performance.interval_semitones, 2);
    assert_eq!(
        performance
            .exact_ratio_overlay
            .as_ref()
            .map(|ratio| (ratio.numerator, ratio.denominator)),
        Some((4, 3))
    );
    assert!(performance
        .provenance
        .iter()
        .any(|reference| reference.contains("QL-MEF#81")));

    // The one test therefore carries both Wayfinder directions over the same
    // M4 episode identity while keeping M1, M2, M3 and controller provenance distinct.
    assert_eq!(forward_score.sources.source_world_event_ref, return_score.sources.source_world_event_ref);
    assert_eq!(traversal.provenance.ql_music_revision, "EpiLogos/QL-MEF#81@ed754d1cd65d92b54620f4305145970b84c3b53f");
}
