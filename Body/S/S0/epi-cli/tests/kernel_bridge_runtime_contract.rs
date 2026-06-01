use epi_logos::gate::{
    kernel_bridge_runtime::{
        runtime_for_spacetimedb_plan, KernelBridgeConsumerKind, KernelBridgeRuntimeEventKind,
        KernelBridgeSubscriber, KernelBridgeSubscriptionProfile,
    },
    spacetimedb_bridge::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate},
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
