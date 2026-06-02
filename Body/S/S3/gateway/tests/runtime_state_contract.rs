use std::time::Duration;

use epi_s3_gateway::runtime::GatewayRuntimeState;
use epi_s3_gateway::spacetime::{
    assert_no_silent_fallback_in_value, fallback_active_envelope, fallback_policy_for_plan,
    lifecycle_envelope_from_update, silent_fallback_refused, SpacetimeProjectionConnectionState,
    SpacetimeProjectionResyncTracker, SpacetimeRegistration,
};
use epi_s3_gateway_contract::{
    GatewayEvent, RunContext, RunSnapshot, SpacetimeFallbackPolicy, SpacetimeProjectionPlan,
    SPACETIME_FALLBACK_ACTIVE, SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
    SPACETIME_SUBSCRIBE_ALIAS_METHOD, SPACETIME_SUBSCRIBE_METHOD,
};
use serde_json::json;
use tokio::time::timeout;

#[test]
fn runtime_tracks_run_context_sequence_and_snapshots() {
    let state = GatewayRuntimeState::default();
    let context = RunContext::new("run-1", "agent:main:main", "agent");

    state.register_run(context.clone());
    state.cache_snapshot(RunSnapshot::ok("run-1", "agent:main:main", 10, 20));

    assert_eq!(state.run_context("run-1"), Some(context));
    assert_eq!(
        state.session_key_for_run("run-1").as_deref(),
        Some("agent:main:main")
    );
    assert_eq!(state.next_seq("run-1"), 1);
    assert_eq!(state.next_seq("run-1"), 2);
    assert_eq!(state.snapshot("run-1").unwrap().status, "ok");
}

#[test]
fn runtime_lists_snapshots_by_session_for_gateway_run_state_projection() {
    let state = GatewayRuntimeState::default();
    state.cache_snapshot(RunSnapshot {
        run_id: "run-later".to_owned(),
        session_key: "agent:main:main".to_owned(),
        status: "running".to_owned(),
        started_at_ms: 20,
        ended_at_ms: None,
        error: None,
    });
    state.cache_snapshot(RunSnapshot::ok("run-earlier", "agent:main:main", 10, 15));
    state.cache_snapshot(RunSnapshot::ok("run-other", "agent:other:main", 5, 6));

    let run_ids = state
        .snapshots_for_session("agent:main:main")
        .into_iter()
        .map(|snapshot| snapshot.run_id)
        .collect::<Vec<_>>();

    assert_eq!(run_ids, vec!["run-earlier", "run-later"]);
}

#[tokio::test]
async fn runtime_broadcasts_to_active_subscribers_only() {
    let state = GatewayRuntimeState::default();
    let mut subscription = state.subscribe();

    state.broadcast(GatewayEvent::new(
        "chat",
        Some("run-chat"),
        Some("agent:main:main"),
        Some(1),
        json!({"state":"delta"}),
    ));

    let first = timeout(Duration::from_millis(100), subscription.recv())
        .await
        .expect("listener should receive first event")
        .expect("event should be delivered");
    assert_eq!(first.channel, "chat");

    state.unsubscribe(subscription.id());
    state.broadcast(GatewayEvent::new(
        "chat",
        Some("run-chat"),
        Some("agent:main:main"),
        Some(2),
        json!({"state":"final"}),
    ));

    let second = timeout(Duration::from_millis(50), subscription.recv()).await;
    assert!(
        matches!(second, Err(_) | Ok(None)),
        "unsubscribed listeners should not receive events"
    );
}

// =============================================================================
// 13.T4: SpaceTimeDB bridge extraction — unified envelope + fallback discipline
// =============================================================================

fn native_plan() -> SpacetimeProjectionPlan {
    SpacetimeProjectionPlan::native("ws://127.0.0.1:3000", "epi-logos-runtime")
        .for_session("agent:13t4:envelope", "epii")
}

#[test]
fn spacetime_envelope_unification_native_fallback_reconnect_resync_share_one_envelope_type() {
    // 13.T4 verification rider: native subscription, fallback-active,
    // reconnect, and resync lifecycle events MUST use the same S3-owned
    // envelope type (SpacetimeSubscriptionLifecycleEnvelope) regardless of
    // which dispatch method (`s3'.temporal.subscribe` vs
    // `s3'.spacetime.subscribe`) the consumer subscribed under.
    let plan = native_plan();
    let mut tracker = SpacetimeProjectionResyncTracker::default();

    // 1. NATIVE: a fresh observation produces a Connected update; envelope
    //    under the temporal method.
    let native_update = tracker.observe_context(json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": { "generation": 9 }
    }));
    let native_envelope = lifecycle_envelope_from_update(
        &plan,
        SPACETIME_SUBSCRIBE_METHOD,
        &native_update,
    );
    assert_eq!(native_envelope.event, "connected");
    assert_eq!(native_envelope.method, SPACETIME_SUBSCRIBE_METHOD);

    // 2. FALLBACK-ACTIVE: emitted under the alias method.
    let fallback_envelope = fallback_active_envelope(
        &plan,
        SPACETIME_SUBSCRIBE_ALIAS_METHOD,
        "native WS unavailable; switching to explicit fallback-active",
    );
    assert_eq!(fallback_envelope.event, SPACETIME_FALLBACK_ACTIVE);
    assert_eq!(fallback_envelope.method, SPACETIME_SUBSCRIBE_ALIAS_METHOD);
    // The fallback envelope's payload MUST carry the silent-fallback-forbidden
    // sentinel — this is the explicit-not-silent contract.
    assert_eq!(
        fallback_envelope.payload["silentFallbackForbiddenSentinel"],
        json!(SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN)
    );
    assert_eq!(
        fallback_envelope.payload["fallbackPolicy"],
        json!(SpacetimeFallbackPolicy::FallbackActive)
    );

    // 3. RECONNECT lifecycle: connection-lost → reconnecting both project
    //    through the same envelope type.
    let lost = tracker.mark_connection_lost();
    assert_eq!(lost.state, SpacetimeProjectionConnectionState::ConnectionLost);
    let lost_envelope =
        lifecycle_envelope_from_update(&plan, SPACETIME_SUBSCRIBE_METHOD, &lost);
    assert_eq!(lost_envelope.event, "connection-lost");

    let reconnecting = tracker.mark_reconnecting();
    let reconnect_envelope =
        lifecycle_envelope_from_update(&plan, SPACETIME_SUBSCRIBE_ALIAS_METHOD, &reconnecting);
    assert_eq!(reconnect_envelope.event, "reconnecting");

    // 4. RESYNC: observing a new generation while reconnecting produces a
    //    ResyncedProfileGeneration update; envelope under either method.
    let resync_update = tracker.observe_context(json!({
        "spacetimedb": { "projectionSource": "native-websocket" },
        "kernel": { "generation": 10 }
    }));
    assert_eq!(
        resync_update.state,
        SpacetimeProjectionConnectionState::ResyncedProfileGeneration
    );
    let resync_envelope =
        lifecycle_envelope_from_update(&plan, SPACETIME_SUBSCRIBE_METHOD, &resync_update);
    assert_eq!(resync_envelope.event, "resynced-profile-generation");

    // STRUCTURAL IDENTITY: every envelope above MUST serialise to the same
    // key set — the canonical SpacetimeSubscriptionLifecycleEnvelope schema.
    let envelopes = [
        &native_envelope,
        &fallback_envelope,
        &lost_envelope,
        &reconnect_envelope,
        &resync_envelope,
    ];
    let canonical_keys: Vec<&str> = vec![
        "event",
        "method",
        "sessionKey",
        "subscriptionMode",
        "projectionSchemaVersion",
        "payload",
    ];
    for envelope in envelopes {
        let value = serde_json::to_value(envelope).unwrap();
        let actual_keys: Vec<&str> = value
            .as_object()
            .unwrap()
            .keys()
            .map(String::as_str)
            .collect();
        for canonical in &canonical_keys {
            assert!(
                actual_keys.contains(canonical),
                "envelope must carry the canonical key `{canonical}` (got keys {:?})",
                actual_keys
            );
        }
    }
}

#[test]
fn spacetime_silent_fallback_refused_sentinel_is_never_emitted_as_projection_source() {
    // 13.T4 refuse-silent-fallback contract: the
    // `silent-http-fallback-forbidden` sentinel may appear ONLY as the value
    // of `silentFallbackForbiddenSentinel`. It must NEVER be emitted as a
    // `projectionSource` or as a `fallbackPolicy` — that would mean the code
    // silently downgraded to HTTP behind the consumer's back. The audit
    // walker below scans the reachable readiness JSON + envelope payloads and
    // asserts the sentinel does not appear in a forbidden field.
    let sentinel = silent_fallback_refused();
    assert_eq!(sentinel, SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN);

    let registration = SpacetimeRegistration {
        url: "http://127.0.0.1:3000".to_owned(),
        database: "epi-logos-runtime".to_owned(),
        installation_id: "install-13t4".to_owned(),
        gateway_id: "gateway-13t4".to_owned(),
        workspace_root_hash: "13t4-hash".to_owned(),
        endpoint: "ws://127.0.0.1:18794".to_owned(),
        protocol_version: "3".to_owned(),
    };
    let readiness = registration.readiness_value();
    assert!(
        assert_no_silent_fallback_in_value(&readiness).is_ok(),
        "readiness must not emit the silent-fallback sentinel as a projection source"
    );

    // Both subscribe-method envelopes MUST also be sentinel-clean: the
    // fallback-active envelope is allowed to NAME the sentinel via the
    // explicit `silentFallbackForbiddenSentinel` field, but that field name
    // is whitelisted by the walker — it inspects only `projectionSource` /
    // `fallbackPolicy` fields.
    let plan = native_plan();
    let fallback = fallback_active_envelope(
        &plan,
        SPACETIME_SUBSCRIBE_METHOD,
        "fallback-active for sentinel audit",
    );
    let fallback_value = serde_json::to_value(&fallback).unwrap();
    assert!(
        assert_no_silent_fallback_in_value(&fallback_value).is_ok(),
        "fallback-active envelope must NOT carry the sentinel as projectionSource/fallbackPolicy"
    );

    // Negative test: synthesise a forbidden value and prove the walker
    // refuses it. This proves the walker is real, not vacuous.
    let leaky = json!({
        "spacetimedb": {
            "projectionSource": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
        }
    });
    let refusal = assert_no_silent_fallback_in_value(&leaky);
    assert!(
        refusal.is_err(),
        "walker MUST refuse a leaky projectionSource carrying the sentinel"
    );
    let err = refusal.unwrap_err();
    assert!(
        err.contains("silent-HTTP-fallback sentinel emitted"),
        "refusal must name the violation: {err}"
    );
}

#[test]
fn spacetime_fallback_policy_explicit_routing_for_each_plan_mode() {
    // 13.T4: the fallback policy is derived ONLY through
    // `fallback_policy_for_plan`. No code path may construct a policy through
    // string comparison or silent downgrade.
    let native = SpacetimeProjectionPlan::native("ws://127.0.0.1:3000", "epi-logos-runtime");
    assert_eq!(
        fallback_policy_for_plan(&native),
        SpacetimeFallbackPolicy::NativeWebsocket
    );

    let http = SpacetimeProjectionPlan::http_sql("http://127.0.0.1:3000", "epi-logos-runtime");
    assert_eq!(
        fallback_policy_for_plan(&http),
        SpacetimeFallbackPolicy::FallbackActive
    );

    let disabled = SpacetimeProjectionPlan::native("", "epi-logos-runtime");
    assert_eq!(
        fallback_policy_for_plan(&disabled),
        SpacetimeFallbackPolicy::Disabled
    );
}

#[test]
fn runtime_tracks_chat_run_process_without_process_handles_for_contract_tests() {
    let state = GatewayRuntimeState::default();

    state.add_chat_run("agent:main:main", "run-chat");
    state.mark_chat_aborted("run-chat");

    assert_eq!(state.active_chat_runs("agent:main:main"), vec!["run-chat"]);
    assert!(state.take_chat_aborted("run-chat"));
    assert!(!state.take_chat_aborted("run-chat"));
    assert_eq!(
        state.remove_chat_run("run-chat").as_deref(),
        Some("agent:main:main")
    );
    assert!(state.active_chat_runs("agent:main:main").is_empty());
}
