use epi_logos::gate::{
    kernel_bridge_runtime::{
        end_to_end_acceptance_report, m1_performance_event_from_profile,
        runtime_for_spacetimedb_plan, KernelBridgeCapabilityRequest, KernelBridgeConsumerKind,
        KernelBridgeRuntimeEventKind, KernelBridgeSubscriber, KernelBridgeSubscriptionProfile,
        KernelBridgeVakContext, M1_PROFILE_TO_PERFORMANCE_STREAM,
    },
    spacetimedb_bridge::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate},
};
use epi_logos::profile::{run as run_profile_command, ProfileCmd};
use portal_core::{
    kernel_tick_from_epogdoon, CpfState, CsDirection, CsField, KernelProfileObservationEvent,
    MathemeHarmonicProfile, VakAddress,
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
            },
        },
        route_lineage: vec![
            "vak_evaluate".to_owned(),
            "anima_orchestrate".to_owned(),
            "dispatch_agent".to_owned(),
        ],
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
