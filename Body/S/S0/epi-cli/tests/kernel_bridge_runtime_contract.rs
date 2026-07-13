use epi_logos::gate::{
    graph::dispatch_graph_method,
    kernel_bridge_runtime::{
        capability_names, end_to_end_acceptance_report, extract_typed_json,
        m1_performance_event_from_profile, runtime_for_spacetimedb_plan,
        typed_json_m2_cymatic_monopoly_state, typed_json_m2_planetary_elemental_weights,
        typed_json_m3_bioquaternion_transcription, typed_json_performance_event_from_profile,
        typed_json_profile_event_payload, KernelBridgeCapabilityRequest, KernelBridgeConsumerKind,
        KernelBridgePerformanceEventJsonShape, KernelBridgeProfileJsonShape,
        KernelBridgeRuntimeEventKind, KernelBridgeSubscriber, KernelBridgeSubscriptionProfile,
        GovernanceRole, KernelBridgeVakContext, MajorArcanaCardRef, OracleFrame, OracleSpreadScale,
        OracleTraversalDirection, SymbolicProtein,
        ReadingPosition, TranscriptionalClockPacket, KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE,
        KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS,
        KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION, M1_PROFILE_TO_PERFORMANCE_STREAM,
    },
    spacetimedb_bridge::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate},
};
use epi_logos::profile::{run as run_profile_command, ProfileCmd};
use portal_core::{
    compute_aspects, kernel_tick_from_epogdoon, CpfState, CsDirection, CsField, EventPrivacyClass,
    KernelProfileObservationEvent, KleinFlipEvent, MPrimePerformanceEvent, MathemeHarmonicProfile,
    PortalClockState, VakAddress, Valence,
};
use serde_json::{json, Value};

#[test]
fn kernel_bridge_runtime_fans_one_projection_source_to_ide_and_body_consumers() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:m0-anuttara-test-extension".to_owned(),
            kind: KernelBridgeConsumerKind::TestExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Full,
        })
        .expect("test extension subscribes");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "body:/body-lite-client".to_owned(),
            kind: KernelBridgeConsumerKind::BodySurface,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("/body subscribes");

    let delivered = runtime
        .observe_projection_update(projection_update(
            SpacetimeProjectionConnectionState::Connected,
            44,
        ))
        .expect("projection update should fan out");
    let snapshot = runtime.snapshot().expect("snapshot");
    let body_events = runtime.drain_consumer("body:/body-lite-client");
    let ide_events = runtime.drain_consumer("theia:m0-anuttara-test-extension");

    assert_eq!(
        snapshot.upstream_subscription_count, 1,
        "kernel-bridge owns one shared SpaceTimeDB/gateway subscription source"
    );
    assert_eq!(snapshot.subscriber_count, 2);
    assert_eq!(snapshot.current_profile_generation, Some(44));
    assert_eq!(
        snapshot.connection.subscription_mode, "native-websocket",
        "runtime preserves the real projection source mode"
    );
    assert!(delivered.iter().any(|event| {
        event.consumer_id == "body:/body-lite-client"
            && event.event.kind == KernelBridgeRuntimeEventKind::Profile
    }));
    assert_profile_generation(&body_events, 44);
    assert_profile_generation(&ide_events, 44);
    assert!(body_events.iter().any(|event| {
        event.kind == KernelBridgeRuntimeEventKind::Readiness
            && event.payload["upstreamSubscriptionCount"] == 1
            && event.payload["subscriptionProfile"] == "lite"
    }));
    assert!(ide_events.iter().any(|event| {
        event.kind == KernelBridgeRuntimeEventKind::ConnectionStatus
            && event.payload["connected"] == true
    }));
}

#[test]
fn kernel_bridge_runtime_replays_cached_safe_profile_to_late_subscribers_with_staleness_metadata() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "http-sql-poll");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:first".to_owned(),
            kind: KernelBridgeConsumerKind::IdeExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("first subscriber");
    runtime
        .observe_projection_update(projection_update(
            SpacetimeProjectionConnectionState::Connected,
            45,
        ))
        .expect("first profile");
    runtime
        .observe_projection_update(SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::ConnectionLost,
            source: "http-sql-poll".to_owned(),
            profile_generation: Some(45),
            stale_profile_generation: Some(45),
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        })
        .expect("connection loss keeps cache");

    let replay = runtime
        .subscribe(KernelBridgeSubscriber {
            id: "body:late".to_owned(),
            kind: KernelBridgeConsumerKind::BodySurface,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("late subscriber gets replay");

    let profile = replay
        .iter()
        .find(|event| event.kind == KernelBridgeRuntimeEventKind::Profile)
        .expect("cached profile replay");
    assert_eq!(profile.profile_generation, Some(45));
    assert_eq!(profile.payload["generation"], 45);
    assert_eq!(profile.payload["stale"], true);
    assert!(profile.payload["stalenessMs"].as_u64().is_some());
    assert!(replay.iter().any(|event| {
        event.kind == KernelBridgeRuntimeEventKind::ConnectionStatus
            && event.payload["state"] == "connection-lost"
    }));
}

#[test]
fn kernel_bridge_runtime_orders_disconnect_reconnect_stale_and_resync_for_consumers() {
    let mut runtime = runtime_for_spacetimedb_plan("full", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:m-runtime".to_owned(),
            kind: KernelBridgeConsumerKind::IdeExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Full,
        })
        .expect("subscriber");
    runtime
        .observe_projection_update(projection_update(
            SpacetimeProjectionConnectionState::Connected,
            11,
        ))
        .expect("initial profile");
    runtime.drain_consumer("theia:m-runtime");

    for update in [
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::ConnectionLost,
            source: "native-websocket".to_owned(),
            profile_generation: Some(11),
            stale_profile_generation: Some(11),
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        },
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Reconnecting,
            source: "native-websocket".to_owned(),
            profile_generation: Some(11),
            stale_profile_generation: Some(11),
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        },
        projection_update(SpacetimeProjectionConnectionState::StaleProfile, 11),
        projection_update(
            SpacetimeProjectionConnectionState::ResyncedProfileGeneration,
            12,
        ),
    ] {
        runtime
            .observe_projection_update(update)
            .expect("ordered lifecycle update");
    }

    let states = runtime
        .drain_consumer("theia:m-runtime")
        .into_iter()
        .filter(|event| event.kind == KernelBridgeRuntimeEventKind::ConnectionStatus)
        .map(|event| event.payload["state"].as_str().unwrap().to_owned())
        .collect::<Vec<_>>();

    assert_eq!(
        states,
        vec![
            "connection-lost",
            "reconnecting",
            "stale-profile",
            "resynced-profile-generation"
        ]
    );
    let tauri = runtime
        .tauri_adapter_snapshot()
        .expect("tauri adapter snapshot");
    assert_eq!(tauri["adapter"], "Tauri 0/1 surface adapter");
    assert_eq!(tauri["profileGeneration"], 12);
    assert_eq!(tauri["upstreamSubscriptionCount"], 1);
}

#[test]
fn transcriptional_clock_packet_serializes_authoritative_oracle_frames() {
    let single = transcriptional_packet(
        "tcp:single",
        OracleSpreadScale::SingleCard,
        vec![reading_position("P2", 0, "CP4.2")],
        vec![],
        None,
        "CP4.2",
    );
    let single_json = serde_json::to_value(&single).expect("single serializes");
    assert_eq!(single_json["oracleFrame"]["spreadScale"], "single-card");
    assert_eq!(
        single_json["oracleFrame"]["positions"]
            .as_array()
            .unwrap()
            .len(),
        1
    );
    assert_eq!(single_json["cpPositionRef"], "CP4.2");

    let triad = transcriptional_packet(
        "tcp:triad",
        OracleSpreadScale::CompressedTriad,
        vec![
            reading_position("P1", 0, "CP4.1"),
            reading_position("P2", 1, "CP4.2"),
            reading_position("P3", 2, "CP4.3"),
        ],
        vec![],
        None,
        "CP4.2",
    );
    assert_eq!(triad.oracle_frame.positions.len(), 3);

    let sixfold = transcriptional_packet(
        "tcp:sixfold",
        OracleSpreadScale::SixfoldQlTraverse,
        vec![
            reading_position("P0", 0, "CP4.0"),
            reading_position("P1", 1, "CP4.1"),
            reading_position("P2", 2, "CP4.2"),
            reading_position("P3", 3, "CP4.3"),
            reading_position("P4", 4, "CP4.4"),
            reading_position("P5", 5, "CP4.5"),
        ],
        vec![
            ["P0".to_owned(), "P5".to_owned()],
            ["P1".to_owned(), "P4".to_owned()],
            ["P2".to_owned(), "P3".to_owned()],
        ],
        None,
        "CP4.0",
    );
    let sixfold_json = serde_json::to_value(&sixfold).expect("sixfold serializes");
    assert_eq!(
        sixfold_json["oracleFrame"]["complementaryPairs"],
        json!([["P0", "P5"], ["P1", "P4"], ["P2", "P3"]])
    );

    let night_prime = transcriptional_packet(
        "tcp:night-prime",
        OracleSpreadScale::NightInversePass,
        vec![
            reading_position("P5", 0, "CP4.5"),
            reading_position("P4", 1, "CP4.4"),
            reading_position("P3", 2, "CP4.3"),
            reading_position("P2", 3, "CP4.2"),
            reading_position("P1", 4, "CP4.1"),
            reading_position("P0", 5, "CP4.0"),
        ],
        vec![["P5".to_owned(), "P0".to_owned()]],
        Some(OracleTraversalDirection::NightPrime),
        "CP4.5",
    );
    let night_prime_json = serde_json::to_value(&night_prime).expect("night serializes");
    assert_eq!(
        night_prime_json["oracleFrame"]["traversalDirection"],
        "night-prime"
    );
    assert_eq!(night_prime_json["oracleFrame"]["positions"][0]["key"], "P5");
    assert_eq!(
        night_prime_json["oracleFrame"]["complementaryPairs"],
        json!([["P5", "P0"]])
    );
}

#[test]
fn kernel_bridge_runtime_rejects_private_profile_cache_fields() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:m4-nara".to_owned(),
            kind: KernelBridgeConsumerKind::IdeExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("subscriber");

    let err = runtime
        .observe_projection_update(SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Connected,
            source: "native-websocket".to_owned(),
            profile_generation: Some(1),
            stale_profile_generation: None,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: Some(json!({
                "kernel": {
                    "privacy": "safe-public-current-kernel-tick",
                    "generation": 1,
                    "bioquaternion": { "q_b": [1.0, 0.0, 0.0, 0.0] }
                }
            })),
        })
        .expect_err("protected private kernel details must not enter bridge cache");

    assert!(err.contains("bioquaternion"), "{err}");
}

#[test]
fn kernel_bridge_runtime_rejects_private_q_partition_fields() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:m4-nara".to_owned(),
            kind: KernelBridgeConsumerKind::IdeExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("subscriber");

    let err = runtime
        .observe_projection_update(SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Connected,
            source: "native-websocket".to_owned(),
            profile_generation: Some(2),
            stale_profile_generation: None,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: Some(json!({
                "kernel": {
                    "privacy": "safe-public-current-kernel-tick",
                    "generation": 2,
                    "q_personal": [0.0, 0.0, 0.0, 0.0],
                    "nested": {
                        "q_identity_hash": "private",
                        "q_activity_trace": "private",
                        "q_composed": [1.0, 0.0, 0.0, 0.0]
                    }
                }
            })),
        })
        .expect_err("DR-M4-4 private q fields must not enter bridge cache");

    assert!(err.contains("private q partition field"), "{err}");
    assert!(
        [
            "q_personal",
            "q_identity_hash",
            "q_activity_trace",
            "q_composed"
        ]
        .iter()
        .any(|field| err.contains(field)),
        "{err}"
    );
}

#[test]
fn kernel_bridge_runtime_allows_public_q_partition_fields() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:m5-epii".to_owned(),
            kind: KernelBridgeConsumerKind::IdeExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("subscriber");

    runtime
        .observe_projection_update(SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Connected,
            source: "native-websocket".to_owned(),
            profile_generation: Some(3),
            stale_profile_generation: None,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: Some(json!({
                "kernel": {
                    "privacy": "safe-public-current-kernel-tick",
                    "generation": 3,
                    "q_5_integration_template": "public carrier",
                    "qm_5_disclosure_meta": "public meta carrier"
                }
            })),
        })
        .expect("public q partition fields remain bridge-safe");

    let snapshot = runtime.snapshot().expect("snapshot");
    let profile = &snapshot.cached_profile.expect("cached profile").profile;
    assert_eq!(profile["q_5_integration_template"], "public carrier");
    assert_eq!(profile["qm_5_disclosure_meta"], "public meta carrier");
    let rendered = serde_json::to_string(profile).expect("profile json");
    assert!(!rendered.contains("q_personal"));
    assert!(!rendered.contains("q_identity"));
    assert!(!rendered.contains("q_activity"));
    assert!(!rendered.contains("q_composed"));
}

#[test]
fn kernel_bridge_capability_invocation_requires_vak_lineage_and_gateway_boundary() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "m5-4:agentic-control-room".to_owned(),
            kind: KernelBridgeConsumerKind::IdeExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("subscriber");

    let receipt = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: "depositKernelObservation".to_owned(),
            session_key: "agent:anima:main".to_owned(),
            params: json!({
                "sourceCoordinate": "M2",
                "profileGeneration": 12,
                "coordinateAnchor": { "pointerAnchor": "pointer://s0/current" }
            }),
            profile_generation: Some(12),
            provenance_handles: vec![
                "profile:12".to_owned(),
                "session:agent:anima:main".to_owned(),
            ],
            vak: Some(vak_context()),
        })
        .expect("governed kernel observation deposit receipt");

    assert_eq!(
        receipt.gateway_method.as_deref(),
        Some("s5.episodic.kernel_profile_observation.deposit")
    );
    assert_eq!(receipt.vak.vak_address.cf, "(4.0/1-4.4/5)");
    assert_eq!(
        receipt.vak.route_lineage,
        vec!["vak_evaluate", "anima_orchestrate", "dispatch_agent"]
    );
    assert_eq!(
        receipt.privacy_class,
        "public_current_with_graph_provenance"
    );

    let events = runtime.drain_consumer("m5-4:agentic-control-room");
    assert!(events.iter().any(|event| {
        event.kind == KernelBridgeRuntimeEventKind::Observability
            && event.payload["event"] == "kernel_bridge.capability_invoked"
            && event.payload["gatewayMethod"] == "s5.episodic.kernel_profile_observation.deposit"
            && event.payload["vakAddress"]["CF"] == "(4.0/1-4.4/5)"
    }));
}

#[test]
fn kernel_bridge_names_s2_parashakti_correspondence_capability() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");

    let receipt = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: "s2.parashaktiCorrespondences".to_owned(),
            session_key: "theia:m2-parashakti".to_owned(),
            params: json!({ "address72": 17 }),
            profile_generation: Some(72),
            provenance_handles: vec!["profile:72".to_owned()],
            vak: Some(vak_context()),
        })
        .expect("s2 parashakti correspondences should be a named bridge capability");

    assert_eq!(
        receipt.gateway_method.as_deref(),
        Some("s2.parashaktiCorrespondences")
    );
    assert_eq!(receipt.artifact["params"]["address72"], 17);
    assert_eq!(
        receipt.provenance_handles,
        vec!["profile:72".to_owned()],
        "bridge receipt preserves inbound provenance until the S2 adapter returns its own handle"
    );
}

#[test]
fn kernel_bridge_surfaces_m2_cymatic_monopoly_state() {
    let fixtures = [
        (1, "mono", 1, 1),
        (7, "actually-many", 2, 7),
        (19, "actualising-one", 4, 19),
        (31, "monopoly", 6, 31),
    ];

    for (address72, expected_state, active_tone_count, projection64) in fixtures {
        let direct = typed_json_m2_cymatic_monopoly_state(address72);
        assert_eq!(direct["contract"], KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE);
        assert_eq!(direct["behaviourState"], expected_state);
        assert_eq!(direct["activeToneCount"], active_tone_count);
        assert_eq!(direct["projection64"], projection64);
        assert!(
            direct["mutualResonance"].as_f64().unwrap() >= 0.0
                && direct["mutualResonance"].as_f64().unwrap() <= 1.0
        );
    }

    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    let receipt = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE.to_owned(),
            session_key: "theia:m2-parashakti".to_owned(),
            params: json!({ "address72": 31 }),
            profile_generation: Some(72),
            provenance_handles: vec!["profile:72".to_owned()],
            vak: Some(vak_context()),
        })
        .expect("m2 cymatic MonoPoly state capability should return one bridge object");

    assert_eq!(
        receipt.gateway_method.as_deref(),
        Some(KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE)
    );
    assert_eq!(receipt.artifact["behaviourState"], "monopoly");
    assert_eq!(receipt.artifact["activeToneCount"], 6);
    assert_eq!(receipt.artifact["projection64"], 31);

    let err = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE.to_owned(),
            session_key: "theia:m2-parashakti".to_owned(),
            params: json!({ "address72": 72 }),
            profile_generation: Some(72),
            provenance_handles: vec!["profile:72".to_owned()],
            vak: Some(vak_context()),
        })
        .expect_err("address outside 0..71 must be rejected by the bridge");
    assert!(err.contains("M2 address space 0..71"), "{err}");
}

#[test]
fn kernel_bridge_surfaces_m3_bioquaternion_transcription_as_one_object() {
    let direct = typed_json_m3_bioquaternion_transcription(1);

    assert_eq!(
        direct["contract"],
        KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION
    );
    assert_eq!(direct["codon"], 1);
    assert_eq!(direct["charges"]["pp"], 21);
    assert_eq!(direct["charges"]["nn"], -9);
    assert_eq!(direct["charges"]["np"], 9);
    assert_eq!(direct["charges"]["pn"], 3);
    assert_eq!(direct["quaternion"], json!([21.0, -9.0, 9.0, 3.0]));
    assert_eq!(
        direct["elementsCanonical"],
        json!(["earth", "fire", "water", "air"])
    );
    assert_eq!(direct["chargeIdentity"][0]["charge"], "pp");
    assert_eq!(direct["chargeIdentity"][0]["xPermutation"], "X2");
    assert_eq!(direct["chargeIdentity"][0]["element"], "earth");
    assert_eq!(direct["chargeIdentity"][0]["quaternionComponent"], "w");
    assert_eq!(direct["chargeIdentity"][1]["charge"], "nn");
    assert_eq!(direct["chargeIdentity"][1]["xPermutation"], "X1");
    assert_eq!(direct["chargeIdentity"][2]["charge"], "np");
    assert_eq!(direct["chargeIdentity"][2]["xPermutation"], "X4");
    assert_eq!(direct["chargeIdentity"][3]["charge"], "pn");
    assert_eq!(direct["chargeIdentity"][3]["xPermutation"], "X3");
    assert_eq!(direct["aminoAcid"]["index"], 13);
    assert_eq!(direct["hexagramId"], 1);
    assert_eq!(direct["tarot"]["roundTrip"], true);
    assert_eq!(direct["complement"]["polarityXorMask"], 0x15);
    assert_eq!(direct["complement"]["basePairCodon"], 20);
    assert_eq!(
        direct["canonicalQuaternionPath"],
        "m3_compute_charges/evaluate_codon -> m3_eval_to_quat"
    );
    assert_eq!(
        direct["ringPositionQuaternionShortcut"],
        "m3_quat_from_codon"
    );

    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    let receipt = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION.to_owned(),
            session_key: "theia:m3-mahamaya".to_owned(),
            params: json!({ "codon": 1 }),
            profile_generation: Some(64),
            provenance_handles: vec!["profile:64".to_owned()],
            vak: Some(vak_context()),
        })
        .expect("m3 bioquaternion transcription capability should return one object");

    assert_eq!(
        receipt.gateway_method.as_deref(),
        Some(KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION)
    );
    assert_eq!(receipt.artifact, direct);

    let err = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION.to_owned(),
            session_key: "theia:m3-mahamaya".to_owned(),
            params: json!({ "codon": 64 }),
            profile_generation: Some(64),
            provenance_handles: vec!["profile:64".to_owned()],
            vak: Some(vak_context()),
        })
        .expect_err("codon outside 0..63 must be rejected by the bridge");
    assert!(err.contains("codon space 0..63"), "{err}");
}

/// 37.T37.2 — Ratify `kernelBridge.m2.planetaryElementalWeights()` at the bridge
/// edge. The typed-JSON surface must project the exact portal-core kernel feed:
/// the four-element vector matches a Keplerian kernel-side reference for a fixed
/// kairos, and the aspect-gain amplification matches `aspect.rs::compute_aspects`.
/// This is the bridge-contract sibling of the epogdoon (37.1), cymatic (37.3), and
/// bioquaternion (37.11) edge tests — the projection the design vision names.
#[test]
fn kernel_bridge_surfaces_m2_planetary_elemental_weights_for_fixed_kairos() {
    // Fixed kairos: Moon@100 (water, kepler 47270), Venus@100 (water, 3600),
    // Mercury@250 (air, 14739). Moon–Venus form an EXACT conjunction and share the
    // water element, so `compute_aspects` amplifies the water bar. Sun (0) is left
    // unpositioned — the excluded identity root of the 9:8 epogdoon asymmetry.
    let mut state = PortalClockState::default();
    state.kairos.planets[1].degree = 100;
    state.kairos.planets[3].degree = 100;
    state.kairos.planets[2].degree = 250;

    let edge = typed_json_m2_planetary_elemental_weights(&state);

    // Bridge-contract envelope — the projection is named on the wire (Add to
    // bridge contract) and carries the kernel-bridge provenance.
    assert_eq!(
        edge["contract"],
        KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS
    );
    assert_eq!(edge["source"], "kernel-bridge");
    assert_eq!(edge["runtimeOwner"], "S0/S0' kernel-bridge runtime");
    assert!(capability_names().contains(&KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS));

    // perPlanet excludes the Sun identity root and reports each orbiter's
    // Keplerian energy + element (mirroring `M2_PLANET_LUT[*].elem_sig`).
    let per_planet = edge["perPlanet"].as_array().expect("perPlanet array");
    assert!(
        per_planet.iter().all(|c| c["planetId"] != 0),
        "Sun must not appear among the nine orbiters"
    );
    let moon = per_planet
        .iter()
        .find(|c| c["planetId"] == 1)
        .expect("Moon contribution");
    assert_eq!(moon["element"], "water");
    assert_eq!(moon["couEnergy"].as_f64().unwrap(), 47270.0);

    // aspectGain matches `aspect.rs::compute_aspects` output for this kairos.
    let mut reference = state.clone();
    compute_aspects(&mut reference);
    let gain = edge["aspectGain"].as_array().expect("aspectGain array");
    assert_eq!(gain.len(), reference.aspects.len());
    let conjunction = gain
        .iter()
        .find(|h| h["planetA"] == 1 && h["planetB"] == 3 && h["aspectType"] == 0)
        .expect("Moon–Venus conjunction handle");
    assert_eq!(conjunction["gain"].as_f64().unwrap(), 1.0);
    assert!(conjunction["handle"]
        .as_str()
        .unwrap()
        .starts_with("aspect:conjunction:"));

    // Four-element vector matches the Keplerian kernel-side reference: the shared
    // water conjunction amplifies water by half the mean orbiter velocity, and no
    // fifth (aether) bucket is invented.
    let amplified_water = 47270.0 + 3600.0 + ((47270.0 + 3600.0) / 2.0);
    let total = amplified_water + 14739.0;
    assert!((edge["weights"]["water"].as_f64().unwrap() - (amplified_water / total)).abs() < 1e-4);
    assert!((edge["weights"]["air"].as_f64().unwrap() - (14739.0 / total)).abs() < 1e-4);
    assert_eq!(edge["weights"]["fire"].as_f64().unwrap(), 0.0);
    assert_eq!(edge["weights"]["earth"].as_f64().unwrap(), 0.0);
}

/// INVERSION of the retired `..._uses_parashakti_deep_dataset` contract. That
/// test asserted the adapter "should resolve without Neo4j" by reading the
/// static JSON seed — it encoded the exact violation this work eliminates
/// (Architect law: static datasets under Idea/Bimba/Map/datasets are one-way
/// Neo4j seeds, never serving truth). The decan chain now resolves bridge-side
/// from the KERNEL LUTs (offline-safe kernel law), and NO dataset file path may
/// appear on the wire. (Live asma/maqam graph sourcing is proven separately in
/// `tests/parashakti_correspondences_live_graph.rs`.)
#[tokio::test]
async fn s2_parashakti_correspondences_decan_chain_is_kernel_lut_sourced() {
    let artifact =
        dispatch_graph_method("s2.parashaktiCorrespondences", &json!({ "address72": 17 }))
            .await
            .expect("parashakti adapter resolves its kernel decan chain without a dataset file");

    assert_eq!(artifact["address72"], 17);
    assert_eq!(artifact["provenanceHandle"]["source"], "s2");
    // address 17 → decan 8 = Gemini Decan 3 in ZODIAC_DECAN_TABLE (kernel law).
    assert_eq!(artifact["decanFace"]["zodiacSign"], "Gemini");
    assert_eq!(artifact["decanFace"]["planetaryRuler"], "Sun");
    assert_eq!(artifact["decanFace"]["element"], "Air");
    assert_eq!(artifact["decanFace"]["tarotCard"], "10 of Swords");
    assert_eq!(artifact["decanFace"]["coordinate"], "M2-3-3-0-2");
    assert_eq!(artifact["decanFace"]["provenance"], "kernel-lut");
    // graphUnavailable is always present as an explicit provenance marker.
    assert!(artifact["graphUnavailable"].is_boolean());
    assert_eq!(
        artifact["planetaryChakral"]["earthObserverHandle"],
        artifact["earthObserverHandle"]
    );
    // no dataset file path may ever be served
    assert!(!json_contains_string(&artifact, "nodes-full-detail.json"));
    assert!(!json_contains_string(&artifact, "Idea/Bimba/Map/datasets"));
    assert!(!json_contains_string(&artifact, "filteredProps"));
}

/// The adapter source itself must not reference the parashakti-deep dataset file
/// or the deleted `read_parashakti_deep_nodes` reader — the JSON seam is gone.
#[test]
fn s2_parashakti_adapter_source_never_references_dataset_file() {
    let source = include_str!("../src/gate/graph.rs");
    assert!(
        !source.contains("nodes-full-detail.json"),
        "gate/graph.rs still references the parashakti-deep dataset file"
    );
    assert!(
        !source.contains("read_parashakti_deep_nodes"),
        "gate/graph.rs still carries the deleted dataset reader"
    );
    assert!(
        !source.contains("datasets/parashakti-deep"),
        "gate/graph.rs still points at the datasets/ tree"
    );
}

#[test]
fn kernel_bridge_capability_invocation_rejects_missing_vak_and_unsafe_payloads() {
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");

    let missing_vak = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: "readCurrentProfile".to_owned(),
            session_key: "agent:anima:main".to_owned(),
            params: json!({}),
            profile_generation: Some(1),
            provenance_handles: vec!["profile:1".to_owned()],
            vak: None,
        })
        .expect_err("M5-4 bridge crossings require canonical VAK keys");
    assert!(
        missing_vak.contains("canonical VAK context"),
        "{missing_vak}"
    );

    let unsafe_payload = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: "invokeGatewayRpc".to_owned(),
            session_key: "agent:anima:main".to_owned(),
            params: json!({
                "gatewayMethod": "shell.exec",
                "rawNaraBody": "private text must not cross the bridge"
            }),
            profile_generation: Some(1),
            provenance_handles: vec!["profile:1".to_owned()],
            vak: Some(vak_context()),
        })
        .expect_err("protected private payloads are refused before gateway dispatch");
    assert!(unsafe_payload.contains("rawNaraBody"), "{unsafe_payload}");

    let shell_method = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: "invokeGatewayRpc".to_owned(),
            session_key: "agent:anima:main".to_owned(),
            params: json!({ "gatewayMethod": "shell.exec" }),
            profile_generation: Some(1),
            provenance_handles: vec!["profile:1".to_owned()],
            vak: Some(vak_context()),
        })
        .expect_err("unrestricted gateway methods are not bridge capabilities");
    assert!(
        shell_method.contains("ungoverned gateway method"),
        "{shell_method}"
    );
}

#[test]
fn m1_profile_to_performance_event_uses_real_matheme_profile_fields_without_renderer_derivation() {
    let generation = 91;
    let tick = kernel_tick_from_epogdoon(13, 0);
    let profile = MathemeHarmonicProfile::from_tick(tick);
    let event = m1_performance_event_from_profile(generation, &profile);

    assert_eq!(event["event"], "m1.profile_to_performance");
    assert_eq!(event["stream"], M1_PROFILE_TO_PERFORMANCE_STREAM);
    assert_eq!(event["profileGeneration"], generation);
    assert_eq!(
        event["profileSchemaVersion"],
        profile.profile_schema_version
    );
    assert_eq!(event["tick"]["tick"], profile.tick);
    assert_eq!(event["tick"]["tick12"], profile.tick12);
    assert_eq!(event["harmonic"]["audioOctet"][0], profile.audio_octet[0]);
    assert_eq!(
        event["harmonic"]["nodalQuartet"][2]["qlPosition"],
        profile.nodal_quartet[2].ql_position
    );
    assert_eq!(
        event["pointerAnchor"]["lensAnchor"],
        profile.pointer_anchor.lens_anchor
    );
    assert_eq!(
        event["diatonic"]["contextFrame"],
        profile
            .diatonic
            .as_ref()
            .expect("tick 0 has diatonic context")
            .context_frame
    );
    assert_eq!(
        event["depositionAnchor"]["mahamayaAddress64"],
        json!(profile.mahamaya.mahamaya_address64)
    );
    assert_eq!(event["lensMode"]["lens"], profile.lens_mode.lens);
    assert_eq!(event["lensMode"]["mode"], profile.lens_mode.mode);
    assert_eq!(
        event["performanceState"]["tempoClock"],
        "kernel-tick-not-renderer-frame"
    );
    assert_eq!(
        event["performanceState"]["rendererDerivationAllowed"],
        false
    );
    for field in [
        "tick",
        "harmonic",
        "pointerAnchor",
        "diatonic",
        "depositionAnchor",
        "lensMode",
        "kleinFlip",
    ] {
        assert!(
            event["requiredProfileFields"]
                .as_array()
                .expect("required fields array")
                .iter()
                .any(|value| value == field),
            "missing required M1 profile field {field}"
        );
    }
}

#[test]
fn m1_performance_event_replay_reconstructs_m_prime_performance_event_deterministically() {
    let generation = 137;
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(13, 6));
    let event = m1_performance_event_from_profile(generation, &profile);

    let replay: MPrimePerformanceEvent =
        serde_json::from_value(event["mPrimePerformanceEvent"].clone())
            .expect("bridge event exposes replayable MPrimePerformanceEvent envelope");
    let replay_again: MPrimePerformanceEvent =
        serde_json::from_value(event["mPrimePerformanceEvent"].clone())
            .expect("bridge event replay is deterministic");

    assert_eq!(replay, replay_again);
    assert_eq!(
        replay.event_id,
        format!("m1-performance-{generation}-{}", profile.tick)
    );
    assert_eq!(
        replay.session_id,
        format!("kernel-bridge-profile-generation-{generation}")
    );
    assert_eq!(replay.tick, profile.tick);
    assert_eq!(event["tick"]["tick12"], profile.tick12);
    assert_eq!(event["tick"]["degree720"], profile.degree720);
    assert_eq!(event["tick"]["su2Layer"], profile.su2_layer);
    assert_eq!(event["tick"]["position6"], profile.position6);
    assert_eq!(replay.lens, profile.lens_mode.lens);
    assert_eq!(replay.mode, profile.lens_mode.mode);
    assert_eq!(replay.audio_octet_hz, profile.audio_octet);
    assert_eq!(
        replay.nodal_quartet,
        profile.nodal_quartet.clone().map(|node| (node.m, node.n))
    );
    assert!(
        replay.klein_flip,
        "tick12 6 profile carries the M1 tritone-crossing Klein flip into replay"
    );
    assert_eq!(replay.privacy, EventPrivacyClass::PublicCurrentContext);
    assert_eq!(
        replay.deposition_policy,
        event["depositionAnchor"]["s3Method"]
            .as_str()
            .expect("bridge event carries deposition method")
    );
    assert_eq!(
        serde_json::to_value(&replay).expect("replay envelope serializes"),
        event["mPrimePerformanceEvent"]
    );
}

#[test]
fn typed_json_performance_edge_emits_all_klein_flip_variant_kinds() {
    let cases = [
        (6, "m1TritoneCrossing"),
        (7, "m2CymaticValenceInvert"),
        (8, "m3CodonRotationCross"),
    ];

    for (tick12, expected_kind) in cases {
        let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(13, tick12));
        let shape = typed_json_performance_event_from_profile(100 + u64::from(tick12), &profile);
        let value = serde_json::to_value(&shape).expect("typed performance shape serializes");

        assert_eq!(value["kleinFlip"]["kind"], expected_kind);

        let extracted: KernelBridgePerformanceEventJsonShape =
            extract_typed_json(&value, "klein flip performance event")
                .expect("typed performance shape round trips through JSON");
        let event = extracted
            .klein_flip
            .as_ref()
            .expect("profile tick emits a klein flip event");
        assert_eq!(kernel_bridge_klein_flip_kind(event), expected_kind);
    }
}

#[test]
fn typed_json_extracts_profile_and_performance_shapes_without_raw_value_contracts() {
    let generation = 92;
    let tick = kernel_tick_from_epogdoon(13, 1);
    let profile = MathemeHarmonicProfile::from_tick(tick);
    let performance_shape = typed_json_performance_event_from_profile(generation, &profile);
    let performance_value =
        serde_json::to_value(&performance_shape).expect("typed performance shape serializes");
    let extracted_performance: KernelBridgePerformanceEventJsonShape =
        extract_typed_json(&performance_value, "m1 performance event")
            .expect("typed performance shape round trips through JSON");

    assert_eq!(extracted_performance.profile_generation, generation);
    assert_eq!(extracted_performance.tick.tick12, profile.tick12);
    assert_eq!(
        extracted_performance.deposition_anchor.resonance72_index,
        profile.resonance72.lens_anchor_index,
        "performance transport preserves the 72-carrier address without decoding it"
    );
    assert_eq!(
        extracted_performance
            .harmonic
            .nodal_quartet
            .get(2)
            .expect("nodal quartet position")
            .ql_position,
        profile.nodal_quartet[2].ql_position
    );
    assert_eq!(
        extracted_performance.deposition_anchor.s3_method,
        "s5.episodic.kernel_profile_observation.deposit"
    );
    assert!(
        !extracted_performance
            .performance_state
            .renderer_derivation_allowed
    );

    let profile_json =
        serde_json::to_value(&profile).expect("real MathemeHarmonicProfile serializes");
    let mut runtime = runtime_for_spacetimedb_plan("lite", "native-websocket");
    runtime
        .observe_projection_update(SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Connected,
            source: "native-websocket".to_owned(),
            profile_generation: Some(generation),
            stale_profile_generation: None,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: Some(real_profile_projection_context(generation, &profile_json)),
        })
        .expect("projection update");
    let snapshot = runtime.snapshot().expect("snapshot");
    let cached = snapshot.cached_profile.as_ref().expect("cached profile");
    let profile_payload =
        typed_json_profile_event_payload(cached).expect("typed profile payload can be extracted");
    let profile_value = serde_json::to_value(&profile_payload).expect("profile payload serializes");
    let extracted_profile: KernelBridgeProfileJsonShape =
        extract_typed_json(&profile_value, "kernel bridge profile")
            .expect("typed profile shape round trips through JSON");

    assert_eq!(extracted_profile.generation, generation);
    assert_eq!(
        extracted_profile.privacy_class,
        "safe-public-current-kernel-tick"
    );
    assert_eq!(
        extracted_profile.profile["computationSource"],
        "portal_core::MathemeHarmonicProfile::from_tick"
    );
    assert_eq!(
        extracted_profile.profile["profile"]["resonance72"],
        json!({
            "legacyResonanceIndex": profile.resonance72.legacy_resonance_index,
            "lensAnchorIndex": profile.resonance72.lens_anchor_index,
            "baseLens": profile.resonance72.base_lens,
            "helixBit": profile.resonance72.helix_bit,
            "lensAnchor": profile.resonance72.lens_anchor,
            "position": profile.resonance72.position,
        }),
        "bridge profile transport round-trips the six-axis resonance72 carrier shape"
    );
}

fn kernel_bridge_klein_flip_kind(event: &KleinFlipEvent) -> &'static str {
    match event {
        KleinFlipEvent::M1TritoneCrossing { tick12, lens_pair } => {
            assert_eq!((*tick12, *lens_pair), (6, (0, 6)));
            "m1TritoneCrossing"
        }
        KleinFlipEvent::M2CymaticValenceInvert {
            valence_before,
            valence_after,
        } => {
            assert_eq!(
                (*valence_before, *valence_after),
                (Valence::Primary, Valence::Inverted)
            );
            "m2CymaticValenceInvert"
        }
        KleinFlipEvent::M3CodonRotationCross {
            codon_before,
            codon_after,
        } => {
            assert_ne!(codon_before, codon_after);
            "m3CodonRotationCross"
        }
    }
}

#[test]
fn track_01_t8_acceptance_report_uses_real_profile_and_names_remaining_blockers() {
    let generation = 84;
    let tick = kernel_tick_from_epogdoon(11, 7);
    let real_profile = MathemeHarmonicProfile::from_tick(tick);
    let cli_profile = run_profile_command(&ProfileCmd::Show {
        cycle: 11,
        sub_tick: 7,
    })
    .expect("real profile CLI dispatcher");
    assert_eq!(
        cli_profile["source"],
        "portal_core::MathemeHarmonicProfile::from_tick"
    );
    assert_eq!(cli_profile["profile"]["tick"], real_profile.tick);
    assert_eq!(cli_profile["profile"]["tick12"], real_profile.tick12);
    assert_eq!(
        cli_profile["profile"]["privacyClass"],
        "public-current-context"
    );

    let mut runtime = runtime_for_spacetimedb_plan("full", "native-websocket");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "body:/body-lite-client".to_owned(),
            kind: KernelBridgeConsumerKind::BodySurface,
            requested_profile: KernelBridgeSubscriptionProfile::Lite,
        })
        .expect("body lite subscription");
    runtime
        .subscribe(KernelBridgeSubscriber {
            id: "theia:m5-full-client".to_owned(),
            kind: KernelBridgeConsumerKind::TestExtension,
            requested_profile: KernelBridgeSubscriptionProfile::Full,
        })
        .expect("theia full subscription");

    let delivered = runtime
        .observe_projection_update(SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Connected,
            source: "native-websocket".to_owned(),
            profile_generation: Some(generation),
            stale_profile_generation: None,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: Some(real_profile_projection_context(
                generation,
                &cli_profile["profile"],
            )),
        })
        .expect("real profile projection update");

    let receipt = runtime
        .invoke_capability(KernelBridgeCapabilityRequest {
            method: "depositKernelObservation".to_owned(),
            session_key: "agent:anima:main".to_owned(),
            params: json!({
                "sourceCoordinate": "M2",
                "profileGeneration": generation,
                "coordinateAnchor": {
                    "pointerAnchor": real_profile.pointer_anchor.lens_anchor,
                    "contextFrame": real_profile.context_frames.active_frame
                }
            }),
            profile_generation: Some(generation),
            provenance_handles: vec![
                format!("profile:{generation}"),
                "session:agent:anima:main".to_owned(),
            ],
            vak: Some(vak_context()),
        })
        .expect("governed deposit receipt");

    let evidence_event = KernelProfileObservationEvent::from_profile(
        "track-01-t8-observation",
        "anima",
        "agent:anima:main",
        "pratibimba-test",
        "01-06-2026",
        "Idea/Empty/Present/01-06-2026/session/now.md",
        "M2",
        generation,
        &real_profile,
    )
    .expect("real profile observation event");
    let evidence_json = serde_json::to_value(evidence_event).expect("event JSON");
    let snapshot = runtime.snapshot().expect("runtime snapshot");
    let report = end_to_end_acceptance_report(&snapshot, &delivered, &evidence_json, &receipt);

    assert_eq!(report["profileGeneration"], generation);
    assert_eq!(report["singleUpstreamSubscription"], true);
    assert!(stage_ready(&report, "s0_profile_compute"));
    assert!(stage_ready(&report, "s0_cli_gateway_payload"));
    assert!(stage_ready(&report, "kernel_bridge_runtime"));
    assert!(stage_ready(&report, "body_lite_client"));
    assert!(stage_ready(&report, "theia_full_client"));
    assert!(stage_ready(&report, "m5_4_agent_capability"));
    assert!(stage_ready(&report, "review_evidence_event"));
    assert!(report["explicitBlockers"]
        .as_array()
        .unwrap()
        .iter()
        .any(|blocker| {
            blocker["id"] == "s3.native-spacetimedb-live-service"
                && blocker["state"] == "blocked_if_not_started_by_operator"
        }));
    assert!(report["explicitBlockers"]
        .as_array()
        .unwrap()
        .iter()
        .any(|blocker| {
            blocker["id"] == "s5.persisted-review-deposit"
                && blocker["state"] == "blocked_without_s5_persisted_store"
        }));
    for forbidden in [
        "rawNaraBody",
        "identityHashPreview",
        "bioquaternion",
        "privateIdentityData",
    ] {
        assert!(
            !json_contains_string(&report, forbidden),
            "acceptance report leaked protected field {forbidden}: {report}"
        );
    }
}

fn projection_update(
    state: SpacetimeProjectionConnectionState,
    generation: u64,
) -> SpacetimeProjectionUpdate {
    SpacetimeProjectionUpdate {
        state,
        source: "native-websocket".to_owned(),
        profile_generation: Some(generation),
        stale_profile_generation: None,
        resynced_profile_generation: None,
        degraded_but_subscribable: false,
        context: Some(projection_context(generation)),
    }
}

fn real_profile_projection_context(generation: u64, profile: &Value) -> Value {
    json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": {
            "coordinateOwner": "S0/QL-meta",
            "projectionOwner": "S3'",
            "privacy": "safe-public-current-kernel-tick",
            "computationSource": "portal_core::MathemeHarmonicProfile::from_tick",
            "generation": generation,
            "profile": profile
        }
    })
}

fn projection_context(generation: u64) -> Value {
    json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": {
            "coordinateOwner": "S0/QL-meta",
            "projectionOwner": "S3'",
            "privacy": "safe-public-current-kernel-tick",
            "computationSource": "portal-core::KernelProjection",
            "generation": generation,
            "tick": {
                "cycle": 99,
                "subTick": 4,
                "phase": "Descent",
                "element": "SlashFlip",
                "position6": 4,
                "harmonicRatio": "1.125000"
            },
            "harmonicPulse": {
                "cycle": 99,
                "subTick": 4,
                "phase": "Descent",
                "element": "SlashFlip",
                "ratioNum": 9,
                "ratioDen": 8,
                "tempoMultiplier": "1.125000",
                "periodMultiplier": "0.888889"
            },
            "energy": {
                "totalEnergy": "0.375000"
            }
        }
    })
}

fn vak_context() -> KernelBridgeVakContext {
    KernelBridgeVakContext {
        vak_address: VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT4a".to_owned()],
            cp: "CP4.4".to_owned(),
            cf: "(4.0/1-4.4/5)".to_owned(),
            cfp: "CFP0".to_owned(),
            cs: CsField {
                code: "CS0".to_owned(),
                direction: CsDirection::Day,
                recognized: false,
            },
        },
        route_lineage: vec![
            "vak_evaluate".to_owned(),
            "anima_orchestrate".to_owned(),
            "dispatch_agent".to_owned(),
        ],
    }
}

fn transcriptional_packet(
    packet_id: &str,
    spread_scale: OracleSpreadScale,
    positions: Vec<ReadingPosition>,
    complementary_pairs: Vec<[String; 2]>,
    traversal_direction: Option<OracleTraversalDirection>,
    cp_position_ref: &str,
) -> TranscriptionalClockPacket {
    TranscriptionalClockPacket {
        packet_id: packet_id.to_owned(),
        profile_generation: Some(23),
        vak: vak_context().vak_address,
        oracle_frame: OracleFrame {
            frame_id: format!("frame:{packet_id}"),
            spread_scale,
            positions,
            traversal_direction,
            complementary_pairs,
        },
        cp_position_ref: cp_position_ref.to_owned(),
        oracle_sequence: None,
        symbolic_protein: None,
        provenance_handles: vec!["profile:generation:23".to_owned()],
        transcript_class: None,
        governance_role: None,
        chain_position: None,
        parent_packet_hash: None,
        is_orf_seed: false,
        is_orf_seal: false,
        session_id_ref: None,
    }
}

fn reading_position(key: &str, ordinal: u8, cp_position_ref: &str) -> ReadingPosition {
    ReadingPosition {
        key: key.to_owned(),
        ordinal,
        cp_position_ref: cp_position_ref.to_owned(),
        label: None,
        vak: Some(vak_context().vak_address),
    }
}

fn assert_profile_generation(
    events: &[epi_logos::gate::kernel_bridge_runtime::KernelBridgeRuntimeEvent],
    generation: u64,
) {
    assert!(events.iter().any(|event| {
        event.kind == KernelBridgeRuntimeEventKind::Profile
            && event.profile_generation == Some(generation)
            && event.payload["profile"]["generation"] == generation
            && event.payload["privacyClass"] == "safe-public-current-kernel-tick"
    }));
}

fn stage_ready(report: &Value, stage_id: &str) -> bool {
    report["stages"].as_array().unwrap().iter().any(|stage| {
        stage["id"].as_str() == Some(stage_id) && stage["status"].as_str() == Some("ready")
    })
}

fn json_contains_string(value: &Value, needle: &str) -> bool {
    match value {
        Value::String(value) => value.contains(needle),
        Value::Array(items) => items.iter().any(|item| json_contains_string(item, needle)),
        Value::Object(items) => items
            .values()
            .any(|item| json_contains_string(item, needle)),
        _ => false,
    }
}

/// Tranche 4.17 — strictly additive: a pre-4.17 packet JSON (no new keys)
/// deserializes cleanly with `None`/`false` on every 4.17 field, and existing
/// consumers see identical semantics after a round-trip.
#[test]
fn transcriptional_clock_packet_schema_additive() {
    let packet = transcriptional_packet(
        "tcp:pre-4.17",
        OracleSpreadScale::SingleCard,
        vec![reading_position("P2", 0, "CP4.2")],
        Vec::new(),
        None,
        "CP4.2",
    );
    let mut wire = serde_json::to_value(&packet).expect("packet serializes");
    // simulate a pre-4.17 producer: strip every 4.17 key from the wire form
    let object = wire.as_object_mut().expect("packet is an object");
    for key in [
        "transcriptClass",
        "governanceRole",
        "chainPosition",
        "parentPacketHash",
        "isOrfSeed",
        "isOrfSeal",
        "sessionIdRef",
    ] {
        object.remove(key);
    }
    let decoded: TranscriptionalClockPacket =
        serde_json::from_value(wire).expect("pre-4.17 packet deserializes");
    assert_eq!(decoded.transcript_class, None);
    assert_eq!(decoded.governance_role, None);
    assert_eq!(decoded.chain_position, None);
    assert!(!decoded.is_orf_seed);
    assert!(!decoded.is_orf_seal);
    assert_eq!(decoded.session_id_ref, None);
    // and the populated form round-trips verbatim
    let mut populated = packet;
    populated.is_orf_seed = true;
    populated.chain_position = Some(0);
    populated.session_id_ref = Some("session:demo".to_owned());
    let round =
        serde_json::from_value::<TranscriptionalClockPacket>(serde_json::to_value(&populated).expect("ser"))
            .expect("de");
    assert_eq!(round, populated);
}

/// Tranche 4.17 — SymbolicProtein chain invariants: start/stop packet refs are
/// internally consistent, chain positions are monotone, and the ORF seed
/// precedes the ORF seal.
#[test]
fn symbolic_protein_chain_invariants() {
    let mut chain: Vec<TranscriptionalClockPacket> = (0..3u32)
        .map(|n| {
            let mut packet = transcriptional_packet(
                &format!("tcp:chain-{n}"),
                OracleSpreadScale::ClockWalk,
                vec![reading_position("P2", 0, "CP4.2")],
                Vec::new(),
                None,
                "CP4.2",
            );
            packet.chain_position = Some(n);
            packet
        })
        .collect();
    chain[0].is_orf_seed = true;
    chain[0].governance_role = Some(GovernanceRole::Start);
    chain[2].is_orf_seal = true;
    chain[2].governance_role = Some(GovernanceRole::Stop);

    // chain positions monotone
    for pair in chain.windows(2) {
        assert!(pair[0].chain_position < pair[1].chain_position, "chain_position monotone");
    }
    // ORF seed precedes ORF seal
    let seed = chain.iter().position(|p| p.is_orf_seed).expect("seed present");
    let seal = chain.iter().position(|p| p.is_orf_seal).expect("seal present");
    assert!(seed < seal, "ORF seed must precede the seal");

    // protein start/stop refs bind to the actual seed/seal packets + kairos +
    // mythos ref carry verbatim
    let mut protein = SymbolicProtein {
        protein_id: "protein:chain-demo".to_owned(),
        sequence: chain[0]
            .oracle_sequence
            .clone()
            .unwrap_or_else(|| epi_logos::gate::kernel_bridge_runtime::OracleSequence {
                sequence_id: "seq:chain-demo".to_owned(),
                frame_id: chain[0].oracle_frame.frame_id.clone(),
                codons: Vec::new(),
            }),
        reading_frame: chain[0].oracle_frame.clone(),
        start_position_ref: None,
        stop_position_ref: None,
        transcript_class: None,
        governance_role: None,
        is_canonical_derivation: None,
        start_packet_ref: None,
        stop_packet_ref: None,
        kairos_open: None,
        kairos_close: None,
        mythos_archetype_reading: None,
    };
    protein.start_packet_ref = Some(chain[seed].packet_id.clone());
    protein.stop_packet_ref = Some(chain[seal].packet_id.clone());
    protein.kairos_open = Some("kairos://open/demo".to_owned());
    protein.kairos_close = Some("kairos://close/demo".to_owned());
    protein.mythos_archetype_reading = Some(MajorArcanaCardRef {
        card_id: 13,
        label: Some("Death".to_owned()),
    });
    let round = serde_json::from_value::<SymbolicProtein>(
        serde_json::to_value(&protein).expect("ser"),
    )
    .expect("de");
    assert_eq!(round, protein);
    assert_eq!(round.start_packet_ref.as_deref(), Some("tcp:chain-0"));
    assert_eq!(round.stop_packet_ref.as_deref(), Some("tcp:chain-2"));
    assert_eq!(round.mythos_archetype_reading.as_ref().map(|c| c.card_id), Some(13));
}
