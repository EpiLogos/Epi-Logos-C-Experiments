use portal_core::{
    kernel_tick_from_epogdoon, CanonRecognitionEvent, CanonWriteBackState, CompositionLoadStatus,
    CosmicCompositionMountPoint, CosmicCompositionState, CosmicDegradationLevel,
    MathemeHarmonicProfile, PersonalPoleElementalBalance, PersonalPoleProjection,
    PersonalPoleResonance, ProtectedHandle, PsychoidDipyramidGeometry, PsychoidDipyramidLocus,
    PsychoidDipyramidLocusRole, PsychoidFieldProjection, PsychoidFieldReadiness, TorusKnotPhase,
};
use serde_json::Value;

fn tick() -> portal_core::KernelTick {
    kernel_tick_from_epogdoon(7, 4)
}

fn cosmic_state() -> CosmicCompositionState {
    CosmicCompositionState {
        load_status: CompositionLoadStatus::ReadyFull,
        degradation_level: CosmicDegradationLevel::ReadyFull,
        mount_points: vec![
            CosmicCompositionMountPoint {
                contributor_id: "m1-paramasiva-played-torus".to_owned(),
                coordinate: "M1".to_owned(),
                mount_point: "k2-surface".to_owned(),
                load_status: CompositionLoadStatus::ReadyFull,
                handle: ProtectedHandle::new("K2SurfaceHandle", "composition://1-2-3/m1/k2"),
            },
            CosmicCompositionMountPoint {
                contributor_id: "m2-parashakti".to_owned(),
                coordinate: "M2".to_owned(),
                mount_point: "cymatic-texture".to_owned(),
                load_status: CompositionLoadStatus::ReadyFull,
                handle: ProtectedHandle::new(
                    "CymaticTextureMountPoint",
                    "composition://1-2-3/m2/texture",
                ),
            },
            CosmicCompositionMountPoint {
                contributor_id: "m3-mahamaya".to_owned(),
                coordinate: "M3".to_owned(),
                mount_point: "codon-lens-ring".to_owned(),
                load_status: CompositionLoadStatus::ReadyFull,
                handle: ProtectedHandle::new(
                    "CodonLensRingMountPoint",
                    "composition://1-2-3/m3/codon-ring",
                ),
            },
        ],
    }
}

fn personal_pole() -> PersonalPoleProjection {
    PersonalPoleProjection {
        privacy: "protected-local-handles".to_owned(),
        q_personal_handle: ProtectedHandle::new("QPersonal", "protected://nara/q/personal"),
        q_composed_handle: ProtectedHandle::new("QComposed", "protected://nara/q/composed"),
        q_transit_handle: ProtectedHandle::new("QTransit", "protected://nara/q/transit"),
        q_activity_handle: ProtectedHandle::new("QActivity", "protected://nara/q/activity"),
        bioquaternion_handle: ProtectedHandle::new(
            "BioQuaternionState",
            "protected://nara/bioquaternion/current",
        ),
        pattern_packet_handle: ProtectedHandle::new(
            "PatternPacket",
            "protected://nara/pattern/pkt-1",
        ),
        psychoid_field_handle: ProtectedHandle::new(
            "PsychoidFieldProjection",
            "protected://nara/psychoid/field-1",
        ),
        oracle_frame_handle: ProtectedHandle::new("OracleFrame", "protected://nara/oracle/frame-1"),
        symbolic_protein_handle: ProtectedHandle::new(
            "SymbolicProtein",
            "protected://nara/protein/seq-1",
        ),
        nara_deck_context_handle: ProtectedHandle::new(
            "NaraDeckContext",
            "protected://nara/deck/context-1",
        ),
        vama_recognition_handle: ProtectedHandle::new(
            "VamaRecognition",
            "protected://nara/vama/recognition-1",
        ),
        resonance: PersonalPoleResonance {
            score: 0.83,
            conjugate_form_character: "Major".to_owned(),
        },
        elemental_balance: PersonalPoleElementalBalance {
            earth: 0.25,
            fire: 0.25,
            water: 0.25,
            air: 0.25,
        },
        torus_knot_phase: TorusKnotPhase { p: 0.25, q: 0.5 },
    }
}

fn psychoid_field() -> PsychoidFieldProjection {
    PsychoidFieldProjection {
        field_handle: ProtectedHandle::new(
            "PsychoidFieldState",
            "protected://nara/psychoid/field-1",
        ),
        cymatic_signature: vec![0.125; 64],
        hopf_s2_projection: [0.0, 0.70710677, 0.70710677],
        torus_knot_phase_handle: ProtectedHandle::new(
            "PersonalPoleProjection.torusKnotPhase",
            "protected://nara/personal-pole/torus-knot-phase",
        ),
        field_readiness: PsychoidFieldReadiness::FullPhysicsRunning,
        dipyramid_geometry: PsychoidDipyramidGeometry {
            topology: "dipyramid-hopf-linked-tori".to_owned(),
            logical_position_count: 12,
            hopf_linked_tori: true,
            loci: vec![
                PsychoidDipyramidLocus {
                    locus_id: "apex-day".to_owned(),
                    role: PsychoidDipyramidLocusRole::TopApex,
                    position_refs: vec!["P5".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "apex-night".to_owned(),
                    role: PsychoidDipyramidLocusRole::BottomApex,
                    position_refs: vec!["P5'".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-p1".to_owned(),
                    role: PsychoidDipyramidLocusRole::BaseSquare,
                    position_refs: vec!["P1".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-p2".to_owned(),
                    role: PsychoidDipyramidLocusRole::BaseSquare,
                    position_refs: vec!["P2".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-p3".to_owned(),
                    role: PsychoidDipyramidLocusRole::BaseSquare,
                    position_refs: vec!["P3".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-p4".to_owned(),
                    role: PsychoidDipyramidLocusRole::BaseSquare,
                    position_refs: vec!["P4".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-prime-p1".to_owned(),
                    role: PsychoidDipyramidLocusRole::InvertedBase,
                    position_refs: vec!["P1'".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-prime-p2".to_owned(),
                    role: PsychoidDipyramidLocusRole::InvertedBase,
                    position_refs: vec!["P2'".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-prime-p3".to_owned(),
                    role: PsychoidDipyramidLocusRole::InvertedBase,
                    position_refs: vec!["P3'".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "base-prime-p4".to_owned(),
                    role: PsychoidDipyramidLocusRole::InvertedBase,
                    position_refs: vec!["P4'".to_owned()],
                },
                PsychoidDipyramidLocus {
                    locus_id: "central-axis".to_owned(),
                    role: PsychoidDipyramidLocusRole::CentralAxisPoint,
                    position_refs: vec!["P0".to_owned(), "P0'".to_owned()],
                },
            ],
        },
    }
}

fn canon_event() -> CanonRecognitionEvent {
    CanonRecognitionEvent {
        bimba_coordinate: "M0-5".to_owned(),
        pattern_packet_handle: "protected://nara/pattern/pkt-1".to_owned(),
        atelier_scent_path: vec!["logos-atelier://trail/6174".to_owned()],
        recognition_degree720: 420,
        write_back_state: CanonWriteBackState::Applied,
        recognized_at_ms: 1_782_395_520_000,
    }
}

#[test]
fn integrated_plugin_projections_round_trip_and_keep_private_bodies_opaque() {
    let profile = MathemeHarmonicProfile::with_composition_projections(
        tick(),
        cosmic_state(),
        personal_pole(),
        psychoid_field(),
        vec![canon_event()],
    );

    let json = serde_json::to_value(&profile).expect("profile serializes");
    let decoded: MathemeHarmonicProfile =
        serde_json::from_value(json.clone()).expect("profile deserializes");

    assert_eq!(
        decoded
            .cosmic_composition_state
            .as_ref()
            .expect("cosmic state")
            .mount_points
            .len(),
        3
    );
    assert_eq!(json["cosmicCompositionState"]["loadStatus"], "ready-full");
    assert_eq!(
        json["cosmicCompositionState"]["mountPoints"][1]["mountPoint"],
        "cymatic-texture"
    );

    assert_eq!(
        json["personalPole"]["psychoidFieldHandle"]["privacy"],
        "protected-local-body"
    );
    assert_eq!(
        json["psychoidField"]["fieldHandle"]["targetKind"],
        "PsychoidFieldState"
    );
    assert_eq!(
        json["psychoidField"]["cymaticSignature"]
            .as_array()
            .expect("signature array")
            .len(),
        64
    );
    assert_eq!(
        json["psychoidField"]["dipyramidGeometry"]["logicalPositionCount"],
        12
    );
    assert!(central_axis_locus(&json).contains(&Value::String("P0".to_owned())));
    assert!(central_axis_locus(&json).contains(&Value::String("P0'".to_owned())));
    assert!(json["psychoidField"].get("torusKnotPhase").is_none());

    assert_eq!(
        json["canonRecognitionStream"][0]["writeBackState"],
        "applied"
    );
    assert_eq!(json["canonRecognitionStream"][0]["bimbaCoordinate"], "M0-5");
    assert!(json["personalPole"].get("qPersonal").is_none());
    assert!(json["personalPole"].get("vamaRecognition").is_none());
    assert!(json["psychoidField"].get("fieldBody").is_none());
}

fn central_axis_locus(json: &Value) -> Vec<Value> {
    json["psychoidField"]["dipyramidGeometry"]["loci"]
        .as_array()
        .expect("loci array")
        .iter()
        .find(|locus| locus["role"] == "central-axis-point")
        .expect("central-axis locus")["positionRefs"]
        .as_array()
        .expect("position refs")
        .clone()
}
