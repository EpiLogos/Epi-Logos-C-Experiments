use portal_core::{
    AnuttaraLayerProjection, AxisViewsProjection, CanonRecognitionAnchor, CanonicalSourceHandle,
    CouplingFlowAlignment, CpfState, CsDirection, CsField, EpiiReviewWorkbenchProjection,
    InversionOperatorHandle, M0LayerView, M1InstanceHandle, M1TopologyProjection,
    MahamayaLensStack, OracleFrameProjection, OracleSequenceProjection,
    ParashaktiMeaningProjection, PersonalPoleProjection, ProtectedHandle, QLFloweringProjection,
    ReadingFrameProjection, ReadingPosition, SymbolicProteinProjection, TorusKnotPhase,
    TranscriptionalClockPacket, VakAddress,
};
use serde_json::{json, Value};

fn sample_vak(cp: &str, direction: CsDirection) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4a".to_owned()],
        cp: cp.to_owned(),
        cf: "(0/1/2/3)".to_owned(),
        cfp: "CFP-reading-frame".to_owned(),
        cs: CsField {
            code: "CS0".to_owned(),
            direction,
            recognized: false,
        },
    }
}

fn round_trip<T>(value: &T) -> (T, Value)
where
    T: serde::Serialize + for<'de> serde::Deserialize<'de>,
{
    let json = serde_json::to_value(value).expect("projection serializes");
    let decoded = serde_json::from_value(json.clone()).expect("projection deserializes");
    (decoded, json)
}

fn m0_projection() -> AnuttaraLayerProjection {
    AnuttaraLayerProjection {
        active_layer: M0LayerView::QlStructure,
        data_layers: vec![
            M0LayerView::Language,
            M0LayerView::QlStructure,
            M0LayerView::Relations,
            M0LayerView::CommunityTime,
            M0LayerView::PersonalBridge,
            M0LayerView::PedagogyBridge,
        ],
        relation_family_partition: Some(portal_core::RelationFamilyPartition {
            structural: 12,
            correspondential: 9,
            kernel_core: 65,
            inferred: 4,
            review_pending: 1,
        }),
        kernel_core_audit: portal_core::KernelCoreAuditState {
            present: 65,
            missing: 0,
            mismatched: 0,
            provenance: "S2 graph-services core65Audit".to_owned(),
        },
        asset_handles: vec![portal_core::AssetHandle {
            asset_uri: "bimba://assets/m0/node-seal".to_owned(),
            asset_kind: "sigil".to_owned(),
            provenance: "S2 c_1_asset_uri".to_owned(),
        }],
    }
}

fn m1_topology() -> M1TopologyProjection {
    M1TopologyProjection {
        double_cover_deg: 720,
        torus_genus: 1,
        euler_characteristic: 0,
        hopf_project_deg: 60,
        hopf_fiber: 1,
        hopf_identity: "S3 -> S2 Hopf fibration".to_owned(),
        ring_quaternion: [0.70710677, 0.0, 0.70710677, 0.0],
        element_count: 6,
        composed_quaternion: [1.0, 0.0, 0.0, 0.0],
        walk_mode: "Torus".to_owned(),
        bifurcation_lambda: 0.5,
        resolution_level: 2,
        torus_knot_phase: TorusKnotPhase { p: 0.25, q: 0.5 },
        parent_attribution: "M1-5 is the +1 parent".to_owned(),
        prior_ground: "M0 is the prior 0/1 ground".to_owned(),
        downstream_double_torus: "Double-torus delegated to M3-5".to_owned(),
    }
}

fn m2_projection() -> ParashaktiMeaningProjection {
    ParashaktiMeaningProjection {
        address72: 44,
        axis_views: AxisViewsProjection {
            mef: "lens=8 position=2 inverted=false".to_owned(),
            tattva_phase: "tattva=22 phase=1".to_owned(),
            decan_face: "earth-sign decan face".to_owned(),
            shem: "light/shadow pair".to_owned(),
            maqam: "maqam-family=4 mode=2".to_owned(),
            det: "m2-to-m3 9:8 projection preview".to_owned(),
            planetary_axis: portal_core::PlanetaryAxisProjection {
                earth_centre_semantic: true,
                observer_policy:
                    "Earth-at-centre is semantic documentation on the planetary axis projection"
                        .to_owned(),
                source_handle: "m2://planetary-axis/earth-centre".to_owned(),
            },
        },
        klein_flip: "primary".to_owned(),
        routing_trace: Some("f-routing://trace/current".to_owned()),
        det_projection: portal_core::DetProjection64 {
            address64: 39,
            epogdoon_ratio: "9:8".to_owned(),
            provenance: "m2_epogdoon_compress(address72)".to_owned(),
        },
    }
}

fn reading_position(cp: &str, label: &str, index: u8) -> ReadingPosition {
    ReadingPosition {
        cp_ref: cp.to_owned(),
        label: label.to_owned(),
        index,
    }
}

fn oracle_frame(
    frame_id: &str,
    spread_grammar: &str,
    positions: Vec<ReadingPosition>,
    direction: CsDirection,
) -> OracleFrameProjection {
    let cp_refs = positions
        .iter()
        .map(|position| position.cp_ref.clone())
        .collect::<Vec<_>>();
    OracleFrameProjection {
        frame_id: frame_id.to_owned(),
        subject_ref: "subject://session/entity".to_owned(),
        deck_manifest_id: "deck://manifest/rider-waite-smith".to_owned(),
        deck_order_hash: "blake3:deck-order-fixture".to_owned(),
        entropy_mode: "seeded_replay".to_owned(),
        entropy_provenance: "test-seed:18.T18.4".to_owned(),
        spread_grammar: spread_grammar.to_owned(),
        vak_address: sample_vak(&cp_refs.join(","), direction),
        cp_position_refs: cp_refs,
        reading_frame: ReadingFrameProjection { positions },
        day_ref: "17-06-2026".to_owned(),
        now_ref: "Idea/Empty/Present/17-06-2026/session/now.md".to_owned(),
        redis_psyche_handle: "redis://cache:live:portal:protected:reading".to_owned(),
        kbase_source_pool_handle: "kbase://source-pool/m3-reading".to_owned(),
        graph_provenance_handles: vec!["graph://bimba/M3".to_owned()],
    }
}

fn transcription_packet() -> TranscriptionalClockPacket {
    TranscriptionalClockPacket {
        packet_id: "packet-1".to_owned(),
        clock: json!({
            "degree720": 420,
            "degree360": 60,
            "walkType": "hexagram64",
            "hexagramId": 11
        }),
        aperture: json!({
            "m2MefLens": 8,
            "m3LensSegments": [1, 6, 12],
            "namespaceState": "resolved"
        }),
        lens_stack: MahamayaLensStack {
            stack_id: "m3-lens-stack".to_owned(),
            aperture_count: 16,
            active_segments: vec![1, 6, 12],
            fibonacci_ground_ref: "m3://fibonacci-ground/60".to_owned(),
        },
        codon: json!({
            "codonId": 7,
            "dnaCodon": "ATG",
            "nucleotideBits": [0, 3, 2],
            "iChingValues": [6, 9, 7],
            "quaternionPpMmMpPm": [1, 0, 1, 0]
        }),
        generation: json!({
            "matrixPath": "resonance",
            "polarity": "positive",
            "generatedCodon": "AUG",
            "rotationalIndex": 3,
            "rotationalStateCount": 7,
            "rotationalDegrees": 135
        }),
        transcription: json!({
            "rnaCodon": "AUG",
            "transcriptionState": "start",
            "aminoOrOperator": "Met",
            "translationProvenance": "runtime_reconciled"
        }),
        expression: json!({
            "tarotReflectionNode": "#3-4.0",
            "tarotCard": "The Magician",
            "hexagramLabel": "Peace",
            "graphProvenance": ["graph://m3/hexagram/11"]
        }),
        vak: sample_vak("CP4.0,CP4.1,CP4.2,CP4.3,CP4.4,CP4.5", CsDirection::Day),
        oracle_frame_ref: Some("oracle-frame-sixfold".to_owned()),
        readiness: json!({
            "datasetLutState": "materialized",
            "warnings": []
        }),
    }
}

fn symbolic_protein(
    frame: &OracleFrameProjection,
    packets: Vec<TranscriptionalClockPacket>,
) -> SymbolicProteinProjection {
    SymbolicProteinProjection {
        sequence_id: "symbolic-protein-1".to_owned(),
        frame_id: frame.frame_id.clone(),
        sequence_mode: "sixfold_ql".to_owned(),
        packet_refs: packets
            .iter()
            .map(|packet| packet.packet_id.clone())
            .collect(),
        packets,
        tarot_sequence_refs: vec!["tarot://card/magician".to_owned()],
        iching_sequence_refs: vec!["iching://hexagram/11".to_owned()],
        codon_sequence_refs: vec!["codon://ATG".to_owned()],
        modulators: vec!["kbase_context".to_owned(), "transit_context".to_owned()],
        nara_pattern_packet_handle: Some("protected://nara/pattern/pkt-1".to_owned()),
    }
}

fn coupling_flow_alignment() -> CouplingFlowAlignment {
    CouplingFlowAlignment {
        symbolic_skeletons: vec![
            "137 = 64 + 72 + 1".to_owned(),
            "X(1) = (0,4,2,2,9)".to_owned(),
        ],
        physics_descent: vec![
            "physics_reference:G_SM".to_owned(),
            "physics_reference:EW breaking".to_owned(),
            "physics_reference:alpha_EM(0)".to_owned(),
        ],
        measurement_faces: vec![
            "137 integer skeleton".to_owned(),
            "137.035999... dressed low-energy measurement-face".to_owned(),
        ],
        recognition_context: portal_core::RecognitionContext {
            warrant: "source-warrant symbolic skeleton, not renderer computation".to_owned(),
            handles: vec!["canon://third-spanda".to_owned()],
        },
        caveats: vec![
            "137 is the integer skeleton; 137.035999... is the dressed low-energy measurement-face"
                .to_owned(),
            "No executable formula or renderer-computed constant is serialized".to_owned(),
        ],
    }
}

#[test]
fn m0_anuttara_layer_projection_round_trips_six_layers_and_core_audit() {
    let projection = m0_projection();
    let (decoded, json) = round_trip(&projection);

    assert_eq!(decoded.data_layers.len(), 6);
    assert_eq!(json["activeLayer"], "ql-structure");
    assert_eq!(json["kernelCoreAudit"]["present"], 65);
    assert_eq!(json["kernelCoreAudit"]["missing"], 0);
    assert_eq!(
        json["kernelCoreAudit"]["provenance"],
        "S2 graph-services core65Audit"
    );
}

#[test]
fn m1_topology_and_cross_language_handles_round_trip() {
    let topology = m1_topology();
    let inversion = InversionOperatorHandle {
        operator: "matheme-shell-toggle".to_owned(),
        handle: "m1://inversion/operator".to_owned(),
        provenance: "S0 inversion operator".to_owned(),
    };
    let source = CanonicalSourceHandle {
        source_id: "source-m1-5".to_owned(),
        coordinate: "M1-5".to_owned(),
        canon_ref: "[[M1'-SPEC]]".to_owned(),
    };
    let instance = M1InstanceHandle {
        instance_id: "m1-instance-1".to_owned(),
        coordinate: "M1-5".to_owned(),
        state_handle: "m1://instance/current".to_owned(),
    };
    let flowering = QLFloweringProjection {
        flowering_id: "ql-flowering-1".to_owned(),
        position_refs: vec!["CP4.0".to_owned(), "CP4.5".to_owned()],
        provenance: "M1 QL flowering surface".to_owned(),
    };

    let (decoded_topology, topology_json) = round_trip(&topology);
    let (_, handles_json) = round_trip(&json!({
        "inversionOperator": inversion,
        "canonicalSource": source,
        "m1Instance": instance,
        "qlFlowering": flowering
    }));

    assert_eq!(decoded_topology.double_cover_deg, 720);
    assert_eq!(decoded_topology.torus_genus, 1);
    assert_eq!(topology_json["torusKnotPhase"]["p"], 0.25);
    assert_eq!(topology_json["hopfIdentity"], "S3 -> S2 Hopf fibration");
    assert_eq!(
        handles_json["inversionOperator"]["operator"],
        "matheme-shell-toggle"
    );
    assert_eq!(handles_json["m1Instance"]["coordinate"], "M1-5");
}

#[test]
fn m2_parashakti_projection_documents_earth_centre_without_separate_handle() {
    let projection = m2_projection();
    let (decoded, json) = round_trip(&projection);

    assert_eq!(decoded.address72, 44);
    assert_eq!(
        json["axisViews"]["planetaryAxis"]["earthCentreSemantic"],
        true
    );
    assert_eq!(
        json["axisViews"]["planetaryAxis"]["observerPolicy"],
        "Earth-at-centre is semantic documentation on the planetary axis projection"
    );
    assert!(json.get("earthObserverHandle").is_none());
}

#[test]
fn m3_oracle_symbolic_protein_fixture_has_reading_cardinality_and_caveats() {
    let frame = oracle_frame(
        "oracle-frame-sixfold",
        "sixfold_ql",
        vec![
            reading_position("CP4.0", "ground", 0),
            reading_position("CP4.1", "definition", 1),
            reading_position("CP4.2", "operation", 2),
            reading_position("CP4.3", "pattern", 3),
            reading_position("CP4.4", "context", 4),
            reading_position("CP4.5", "integration", 5),
        ],
        CsDirection::Day,
    );
    let packet = transcription_packet();
    let protein = symbolic_protein(&frame, vec![packet.clone()]);
    let sequence = OracleSequenceProjection {
        sequence_id: protein.sequence_id.clone(),
        frame_id: protein.frame_id.clone(),
        sequence_mode: protein.sequence_mode.clone(),
        symbolic_protein_ref: protein.sequence_id.clone(),
    };
    let coupling = coupling_flow_alignment();
    let payload = json!({
        "oracleFrame": frame,
        "symbolicProtein": protein,
        "oracleSequence": sequence,
        "transcriptionPacket": packet,
        "couplingFlowAlignment": coupling
    });

    let (decoded, json) = round_trip(&payload);

    assert_eq!(
        decoded["oracleFrame"]["readingFrame"]["positions"]
            .as_array()
            .expect("positions array")
            .len(),
        6
    );
    assert_eq!(json["oracleFrame"]["vakAddress"]["cs"]["direction"], "Day");
    assert_eq!(json["symbolicProtein"]["sequenceMode"], "sixfold_ql");
    assert_eq!(json["transcriptionPacket"]["clock"]["degree720"], 420);
    assert!(json["transcriptionPacket"].get("detFoldState").is_none());
    assert!(json["couplingFlowAlignment"]["symbolicSkeletons"].is_array());
    assert!(json["couplingFlowAlignment"]["physicsDescent"].is_array());
    assert!(json["couplingFlowAlignment"]["measurementFaces"].is_array());
    assert!(json["couplingFlowAlignment"]["recognitionContext"].is_object());
    assert!(json["couplingFlowAlignment"]["caveats"]
        .as_array()
        .unwrap()
        .iter()
        .any(|caveat| caveat
            .as_str()
            .unwrap()
            .contains("137 is the integer skeleton")
            && caveat.as_str().unwrap().contains("137.035999...")));
    assert!(json["couplingFlowAlignment"]
        .get("executableFormula")
        .is_none());
    assert!(json["couplingFlowAlignment"]
        .get("rendererComputedConstants")
        .is_none());
    assert!(json["couplingFlowAlignment"]
        .get("privateNaraBodies")
        .is_none());
}

#[test]
fn m3_reading_frame_fixtures_cover_single_triad_sixfold_night_and_four_five() {
    let single = oracle_frame(
        "oracle-frame-single",
        "single_packet",
        vec![reading_position("CP4.3", "pattern", 0)],
        CsDirection::Day,
    );
    let triad = oracle_frame(
        "oracle-frame-triad",
        "triad",
        vec![
            reading_position("CP4.1", "definition", 0),
            reading_position("CP4.2", "operation", 1),
            reading_position("CP4.4", "context", 2),
        ],
        CsDirection::Day,
    );
    let sixfold = oracle_frame(
        "oracle-frame-sixfold",
        "sixfold_ql",
        vec![
            reading_position("CP4.0", "ground", 0),
            reading_position("CP4.1", "definition", 1),
            reading_position("CP4.2", "operation", 2),
            reading_position("CP4.3", "pattern", 3),
            reading_position("CP4.4", "context", 4),
            reading_position("CP4.5", "integration", 5),
        ],
        CsDirection::Day,
    );
    let night = oracle_frame(
        "oracle-frame-night",
        "sixfold_ql",
        sixfold.reading_frame.positions.clone(),
        CsDirection::Night,
    );
    let four_five = oracle_frame(
        "oracle-frame-four-five",
        "four_five_depth",
        vec![
            reading_position("CP4.4", "context", 0),
            reading_position("CP4.5", "integration", 1),
        ],
        CsDirection::Day,
    );

    assert_eq!(single.reading_frame.positions.len(), 1);
    assert_eq!(triad.reading_frame.positions.len(), 3);
    assert_eq!(sixfold.reading_frame.positions.len(), 6);
    assert_eq!(night.vak_address.cs.direction, CsDirection::Night);
    assert_eq!(
        four_five
            .reading_frame
            .positions
            .iter()
            .map(ReadingPosition::cp_ref)
            .collect::<Vec<_>>(),
        vec!["CP4.4", "CP4.5"]
    );
}

#[test]
fn m4_personal_pole_projection_surfaces_only_protected_handles() {
    let projection = PersonalPoleProjection {
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
        resonance: portal_core::PersonalPoleResonance {
            score: 0.75,
            conjugate_form_character: "Major".to_owned(),
        },
        elemental_balance: portal_core::PersonalPoleElementalBalance {
            earth: 0.25,
            fire: 0.25,
            water: 0.25,
            air: 0.25,
        },
        torus_knot_phase: TorusKnotPhase { p: 0.25, q: 0.5 },
    };
    let (_, json) = round_trip(&projection);

    assert_eq!(json["privacy"], "protected-local-handles");
    assert_eq!(
        json["patternPacketHandle"]["privacy"],
        "protected-local-body"
    );
    assert_eq!(
        json["psychoidFieldHandle"]["targetKind"],
        "PsychoidFieldProjection"
    );
    assert_eq!(json["oracleFrameHandle"]["targetKind"], "OracleFrame");
    assert_eq!(
        json["symbolicProteinHandle"]["targetKind"],
        "SymbolicProtein"
    );
    assert_eq!(
        json["naraDeckContextHandle"]["targetKind"],
        "NaraDeckContext"
    );
    assert_eq!(json["resonance"]["score"], 0.75);
    assert!(json.get("patternPacket").is_none());
    assert!(json.get("oracleFrame").is_none());
    assert!(json.get("symbolicProtein").is_none());
    assert!(json.get("naraDeckContext").is_none());
    assert!(json.get("qPersonal").is_none());
    assert!(json.get("vamaRecognition").is_none());
}

#[test]
fn m5_epii_workbench_projection_round_trips_review_and_canon_anchor() {
    let projection = EpiiReviewWorkbenchProjection {
        inbox_summary: json!({
            "open": 3,
            "requiresHuman": 1
        }),
        capacity_lanes: vec![
            "anuttara".to_owned(),
            "paramasiva".to_owned(),
            "parashakti".to_owned(),
            "mahamaya".to_owned(),
            "nara".to_owned(),
            "epii_on_epii".to_owned(),
        ],
        spine_inspector: json!({
            "orchestrationState": "active"
        }),
        recursive_gates: vec!["sophia-on-sophia".to_owned()],
        aletheia_lineages: vec!["canon-review".to_owned()],
        day_now_anchor: portal_core::DayNowAnchor {
            day_id: "17-06-2026".to_owned(),
            now_path: "Idea/Empty/Present/17-06-2026/session/now.md".to_owned(),
        },
    };
    let anchor = CanonRecognitionAnchor {
        mahamaya64: portal_core::PointerAnchorProjection {
            coordinate: "M3".to_owned(),
            handle: "pointer://m3/64".to_owned(),
        },
        parashakti72: portal_core::PointerAnchorProjection {
            coordinate: "M2".to_owned(),
            handle: "pointer://m2/72".to_owned(),
        },
        paramasiva_plus1: portal_core::PointerAnchorProjection {
            coordinate: "M1-5".to_owned(),
            handle: "pointer://m1/plus-one".to_owned(),
        },
    };
    let (_, json) = round_trip(&json!({
        "workbench": projection,
        "canonRecognitionAnchor": anchor
    }));

    assert_eq!(
        json["workbench"]["capacityLanes"].as_array().unwrap().len(),
        6
    );
    assert_eq!(json["workbench"]["dayNowAnchor"]["dayId"], "17-06-2026");
    assert_eq!(
        json["canonRecognitionAnchor"]["mahamaya64"]["coordinate"],
        "M3"
    );
    assert_eq!(
        json["canonRecognitionAnchor"]["parashakti72"]["coordinate"],
        "M2"
    );
    assert_eq!(
        json["canonRecognitionAnchor"]["paramasivaPlus1"]["coordinate"],
        "M1-5"
    );
}
