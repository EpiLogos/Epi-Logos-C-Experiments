use std::collections::{BTreeMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_gateway_contract::{
    SPACETIME_PROJECTION_MODE_FULL, SPACETIME_PROJECTION_MODE_LITE,
    SPACETIME_PROJECTION_SOURCE_HTTP_SQL, SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
};
use portal_core::VakAddress;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::spacetimedb_bridge::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate};

pub const KERNEL_BRIDGE_SOURCE: &str = "kernel-bridge";
pub const KERNEL_BRIDGE_RUNTIME_OWNER: &str = "S0/S0' kernel-bridge runtime";
pub const KERNEL_BRIDGE_THEIA_ADAPTER: &str = "Theia KernelBridgeAPI dependency-injection adapter";
pub const KERNEL_BRIDGE_TAURI_ADAPTER: &str = "Tauri 0/1 surface adapter";
pub const KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY: &str = "safe-public-current-kernel-tick";
pub const KERNEL_BRIDGE_AGENT_PRIVACY: &str = "public_current_with_graph_provenance";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum KernelBridgeConsumerKind {
    IdeExtension,
    BodySurface,
    TauriAdapter,
    TestExtension,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum KernelBridgeSubscriptionProfile {
    Lite,
    Full,
}

impl KernelBridgeSubscriptionProfile {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Lite => SPACETIME_PROJECTION_MODE_LITE,
            Self::Full => SPACETIME_PROJECTION_MODE_FULL,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeSubscriber {
    pub id: String,
    pub kind: KernelBridgeConsumerKind,
    pub requested_profile: KernelBridgeSubscriptionProfile,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeCachedProfile {
    pub generation: u64,
    pub cached_at_ms: u128,
    pub stale: bool,
    pub staleness_ms: u128,
    pub privacy_class: String,
    pub profile: Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum KernelBridgeRuntimeEventKind {
    ConnectionStatus,
    Readiness,
    Profile,
    Observability,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeRuntimeEvent {
    pub kind: KernelBridgeRuntimeEventKind,
    pub emitted_at_ms: u128,
    pub source: String,
    pub profile_generation: Option<u64>,
    pub privacy_class: String,
    pub payload: Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeDeliveredEvent {
    pub consumer_id: String,
    pub event: KernelBridgeRuntimeEvent,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeVakContext {
    pub vak_address: VakAddress,
    pub route_lineage: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeCapabilityRequest {
    pub method: String,
    pub session_key: String,
    pub params: Value,
    pub profile_generation: Option<u64>,
    pub provenance_handles: Vec<String>,
    pub vak: Option<KernelBridgeVakContext>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeCapabilityReceipt {
    pub method: String,
    pub gateway_method: Option<String>,
    pub session_key: String,
    pub profile_generation: Option<u64>,
    pub privacy_class: String,
    pub provenance_handles: Vec<String>,
    pub vak: KernelBridgeVakContext,
    pub artifact: Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeConnectionStatus {
    pub connected: bool,
    pub state: SpacetimeProjectionConnectionState,
    pub mode: KernelBridgeSubscriptionProfile,
    pub subscription_mode: String,
    pub reason: String,
    pub profile_generation: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeRuntimeSnapshot {
    pub runtime_owner: String,
    pub theia_adapter: String,
    pub tauri_adapter: String,
    pub upstream_subscription_count: u64,
    pub subscriber_count: usize,
    pub mode: KernelBridgeSubscriptionProfile,
    pub subscription_mode: String,
    pub current_profile_generation: Option<u64>,
    pub cached_profile: Option<KernelBridgeCachedProfile>,
    pub connection: KernelBridgeConnectionStatus,
    pub readiness: Value,
}

pub struct KernelBridgeRuntime {
    upstream_subscription_count: u64,
    subscribers: BTreeMap<String, KernelBridgeSubscriber>,
    pending_by_consumer: BTreeMap<String, VecDeque<KernelBridgeRuntimeEvent>>,
    latest_profile: Option<KernelBridgeCachedProfile>,
    connection: KernelBridgeConnectionStatus,
}

impl KernelBridgeRuntime {
    pub fn new(
        mode: KernelBridgeSubscriptionProfile,
        subscription_mode: impl Into<String>,
    ) -> Self {
        Self {
            upstream_subscription_count: 0,
            subscribers: BTreeMap::new(),
            pending_by_consumer: BTreeMap::new(),
            latest_profile: None,
            connection: KernelBridgeConnectionStatus {
                connected: false,
                state: SpacetimeProjectionConnectionState::ConnectionLost,
                mode,
                subscription_mode: subscription_mode.into(),
                reason: "kernel-bridge runtime created; waiting for first projection update"
                    .to_owned(),
                profile_generation: None,
            },
        }
    }

    pub fn subscribe(
        &mut self,
        subscriber: KernelBridgeSubscriber,
    ) -> Result<Vec<KernelBridgeRuntimeEvent>, String> {
        require_nonempty(&subscriber.id, "subscriber.id")?;
        self.subscribers
            .insert(subscriber.id.clone(), subscriber.clone());
        self.pending_by_consumer
            .entry(subscriber.id.clone())
            .or_default();

        let mut replay = Vec::new();
        replay.push(self.connection_event()?);
        replay.push(self.readiness_event()?);
        if let Some(profile) = &self.latest_profile {
            replay.push(self.profile_event(profile)?);
        }
        for event in replay.iter().cloned() {
            self.pending_by_consumer
                .entry(subscriber.id.clone())
                .or_default()
                .push_back(event);
        }
        Ok(replay)
    }

    pub fn unsubscribe(&mut self, consumer_id: &str) {
        self.subscribers.remove(consumer_id);
        self.pending_by_consumer.remove(consumer_id);
    }

    pub fn ensure_single_upstream_subscription(&mut self) {
        if self.upstream_subscription_count == 0 {
            self.upstream_subscription_count = 1;
        }
    }

    pub fn observe_projection_update(
        &mut self,
        update: SpacetimeProjectionUpdate,
    ) -> Result<Vec<KernelBridgeDeliveredEvent>, String> {
        self.ensure_single_upstream_subscription();
        self.update_connection(&update);

        let mut events = vec![self.connection_event()?, self.readiness_event()?];
        if let Some(context) = update.context.as_ref() {
            if let Some(profile) = safe_cached_profile_from_context(context, update.state)? {
                self.latest_profile = Some(profile);
                if let Some(profile) = &self.latest_profile {
                    events.push(self.profile_event(profile)?);
                }
            }
        } else if matches!(
            update.state,
            SpacetimeProjectionConnectionState::ConnectionLost
                | SpacetimeProjectionConnectionState::Reconnecting
                | SpacetimeProjectionConnectionState::StaleProfile
        ) {
            if let Some(profile) = &mut self.latest_profile {
                profile.stale = true;
                profile.staleness_ms = now_ms()?.saturating_sub(profile.cached_at_ms);
            }
        }

        Ok(self.fan_out(events))
    }

    pub fn drain_consumer(&mut self, consumer_id: &str) -> Vec<KernelBridgeRuntimeEvent> {
        self.pending_by_consumer
            .entry(consumer_id.to_owned())
            .or_default()
            .drain(..)
            .collect()
    }

    pub fn invoke_capability(
        &mut self,
        request: KernelBridgeCapabilityRequest,
    ) -> Result<KernelBridgeCapabilityReceipt, String> {
        require_nonempty(&request.method, "method")?;
        require_nonempty(&request.session_key, "session_key")?;
        if !capability_names().contains(&request.method.as_str()) {
            return Err(format!(
                "kernel-bridge rejected unsupported capability {}",
                request.method
            ));
        }
        forbid_private_payload_keys(&request.params)?;

        let vak = request.vak.ok_or_else(|| {
            "kernel-bridge capability invocation requires canonical VAK context".to_owned()
        })?;
        require_route_lineage(&vak.route_lineage)?;

        let gateway_method = gateway_method_for_capability(&request.method, &request.params)?;
        let artifact = json!({
            "capability": request.method,
            "gatewayMethod": gateway_method,
            "runtimeOwner": KERNEL_BRIDGE_RUNTIME_OWNER,
            "source": KERNEL_BRIDGE_SOURCE,
            "profileGeneration": request.profile_generation,
            "vakAddress": canonical_vak_json(&vak.vak_address),
            "routeLineage": vak.route_lineage.clone(),
            "params": request.params,
        });

        let receipt = KernelBridgeCapabilityReceipt {
            method: request.method.clone(),
            gateway_method,
            session_key: request.session_key.clone(),
            profile_generation: request.profile_generation,
            privacy_class: KERNEL_BRIDGE_AGENT_PRIVACY.to_owned(),
            provenance_handles: request.provenance_handles,
            vak: vak.clone(),
            artifact,
        };

        let event = KernelBridgeRuntimeEvent {
            kind: KernelBridgeRuntimeEventKind::Observability,
            emitted_at_ms: now_ms()?,
            source: KERNEL_BRIDGE_SOURCE.to_owned(),
            profile_generation: receipt.profile_generation,
            privacy_class: receipt.privacy_class.clone(),
            payload: json!({
                "event": "kernel_bridge.capability_invoked",
                "method": receipt.method,
                "gatewayMethod": receipt.gateway_method,
                "sessionKey": receipt.session_key,
                "provenanceHandles": receipt.provenance_handles,
                "vakAddress": canonical_vak_json(&receipt.vak.vak_address),
                "routeLineage": receipt.vak.route_lineage,
            }),
        };
        self.fan_out(vec![event]);

        Ok(receipt)
    }

    pub fn snapshot(&self) -> Result<KernelBridgeRuntimeSnapshot, String> {
        Ok(KernelBridgeRuntimeSnapshot {
            runtime_owner: KERNEL_BRIDGE_RUNTIME_OWNER.to_owned(),
            theia_adapter: KERNEL_BRIDGE_THEIA_ADAPTER.to_owned(),
            tauri_adapter: KERNEL_BRIDGE_TAURI_ADAPTER.to_owned(),
            upstream_subscription_count: self.upstream_subscription_count,
            subscriber_count: self.subscribers.len(),
            mode: self.connection.mode,
            subscription_mode: self.connection.subscription_mode.clone(),
            current_profile_generation: self
                .latest_profile
                .as_ref()
                .map(|profile| profile.generation),
            cached_profile: self.latest_profile.clone(),
            connection: self.connection.clone(),
            readiness: self.readiness_payload()?,
        })
    }

    pub fn tauri_adapter_snapshot(&self) -> Result<Value, String> {
        let snapshot = self.snapshot()?;
        Ok(json!({
            "adapter": KERNEL_BRIDGE_TAURI_ADAPTER,
            "runtimeOwner": snapshot.runtime_owner,
            "upstreamSubscriptionCount": snapshot.upstream_subscription_count,
            "subscriberCount": snapshot.subscriber_count,
            "connection": snapshot.connection,
            "readiness": snapshot.readiness,
            "profileGeneration": snapshot.current_profile_generation,
            "cachedProfile": snapshot.cached_profile,
        }))
    }

    fn update_connection(&mut self, update: &SpacetimeProjectionUpdate) {
        self.connection.connected = update.state == SpacetimeProjectionConnectionState::Connected
            || update.state == SpacetimeProjectionConnectionState::ResyncedProfileGeneration;
        self.connection.state = update.state.clone();
        self.connection.profile_generation = update
            .profile_generation
            .or(update.resynced_profile_generation)
            .or(update.stale_profile_generation)
            .or_else(|| {
                self.latest_profile
                    .as_ref()
                    .map(|profile| profile.generation)
            });
        self.connection.reason = connection_reason(update);
        self.connection.subscription_mode = update.source.clone();
    }

    fn fan_out(
        &mut self,
        events: Vec<KernelBridgeRuntimeEvent>,
    ) -> Vec<KernelBridgeDeliveredEvent> {
        let mut delivered = Vec::new();
        for consumer_id in self.subscribers.keys().cloned().collect::<Vec<_>>() {
            let queue = self
                .pending_by_consumer
                .entry(consumer_id.clone())
                .or_default();
            for event in events.iter().cloned() {
                queue.push_back(event.clone());
                delivered.push(KernelBridgeDeliveredEvent {
                    consumer_id: consumer_id.clone(),
                    event,
                });
            }
        }
        delivered
    }

    fn connection_event(&self) -> Result<KernelBridgeRuntimeEvent, String> {
        Ok(KernelBridgeRuntimeEvent {
            kind: KernelBridgeRuntimeEventKind::ConnectionStatus,
            emitted_at_ms: now_ms()?,
            source: KERNEL_BRIDGE_SOURCE.to_owned(),
            profile_generation: self.connection.profile_generation,
            privacy_class: KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY.to_owned(),
            payload: serde_json::to_value(&self.connection).map_err(|err| err.to_string())?,
        })
    }

    fn readiness_event(&self) -> Result<KernelBridgeRuntimeEvent, String> {
        Ok(KernelBridgeRuntimeEvent {
            kind: KernelBridgeRuntimeEventKind::Readiness,
            emitted_at_ms: now_ms()?,
            source: KERNEL_BRIDGE_SOURCE.to_owned(),
            profile_generation: self
                .latest_profile
                .as_ref()
                .map(|profile| profile.generation),
            privacy_class: KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY.to_owned(),
            payload: self.readiness_payload()?,
        })
    }

    fn profile_event(
        &self,
        profile: &KernelBridgeCachedProfile,
    ) -> Result<KernelBridgeRuntimeEvent, String> {
        Ok(KernelBridgeRuntimeEvent {
            kind: KernelBridgeRuntimeEventKind::Profile,
            emitted_at_ms: now_ms()?,
            source: KERNEL_BRIDGE_SOURCE.to_owned(),
            profile_generation: Some(profile.generation),
            privacy_class: profile.privacy_class.clone(),
            payload: serde_json::to_value(profile).map_err(|err| err.to_string())?,
        })
    }

    fn readiness_payload(&self) -> Result<Value, String> {
        Ok(json!({
            "state": if self.latest_profile.is_some() {
                "ready_public_current"
            } else if self.connection.connected {
                "degraded_but_readable"
            } else {
                "bridge_unavailable"
            },
            "reason": self.connection.reason,
            "profileGeneration": self.latest_profile.as_ref().map(|profile| profile.generation),
            "bridgeReachable": self.connection.connected || self.latest_profile.is_some(),
            "blockerIds": if self.latest_profile.is_some() {
                json!([])
            } else {
                json!(["s0.kernel-bridge.awaiting-safe-profile"])
            },
            "capabilities": capability_names(),
            "subscriptionProfile": self.connection.mode.as_str(),
            "subscriptionMode": self.connection.subscription_mode,
            "upstreamSubscriptionCount": self.upstream_subscription_count,
            "subscriberCount": self.subscribers.len(),
            "theiaDependencyInjectionAdapter": KERNEL_BRIDGE_THEIA_ADAPTER,
            "tauriAccessibleAdapter": KERNEL_BRIDGE_TAURI_ADAPTER,
        }))
    }
}

pub fn capability_names() -> &'static [&'static str] {
    &[
        "readCurrentProfile",
        "readPointerAnchor",
        "readReadiness",
        "subscribeObservability",
        "invokeGatewayRpc",
        "depositKernelObservation",
        "requestReviewEvidence",
    ]
}

pub fn runtime_for_spacetimedb_plan(
    subscription_profile: &str,
    subscription_mode: &str,
) -> KernelBridgeRuntime {
    let profile = match subscription_profile {
        SPACETIME_PROJECTION_MODE_FULL => KernelBridgeSubscriptionProfile::Full,
        _ => KernelBridgeSubscriptionProfile::Lite,
    };
    let mode = match subscription_mode {
        SPACETIME_PROJECTION_SOURCE_NATIVE_WS => SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
        _ => SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
    };
    KernelBridgeRuntime::new(profile, mode)
}

pub fn end_to_end_acceptance_report(
    snapshot: &KernelBridgeRuntimeSnapshot,
    delivered_events: &[KernelBridgeDeliveredEvent],
    evidence_event: &Value,
    capability_receipt: &KernelBridgeCapabilityReceipt,
) -> Value {
    let profile_generation = snapshot.current_profile_generation;
    let body_received_profile = delivered_events.iter().any(|delivered| {
        delivered.consumer_id.starts_with("body:")
            && delivered.event.kind == KernelBridgeRuntimeEventKind::Profile
            && delivered.event.profile_generation == profile_generation
    });
    let theia_received_profile = delivered_events.iter().any(|delivered| {
        delivered.consumer_id.starts_with("theia:")
            && delivered.event.kind == KernelBridgeRuntimeEventKind::Profile
            && delivered.event.profile_generation == profile_generation
    });
    let agent_receipt_matches = capability_receipt.profile_generation == profile_generation
        && capability_receipt.gateway_method.as_deref()
            == Some("s5.episodic.kernel_profile_observation.deposit");

    json!({
        "report": "track-01-t8-s0-to-surface-acceptance",
        "profileGeneration": profile_generation,
        "privacyClass": snapshot
            .cached_profile
            .as_ref()
            .map(|profile| profile.privacy_class.clone())
            .unwrap_or_else(|| KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY.to_owned()),
        "singleUpstreamSubscription": snapshot.upstream_subscription_count == 1,
        "stages": [
            {
                "id": "s0_profile_compute",
                "status": if snapshot.cached_profile.is_some() { "ready" } else { "blocked" },
                "evidence": "portal_core::MathemeHarmonicProfile::from_tick"
            },
            {
                "id": "s0_cli_gateway_payload",
                "status": if snapshot.cached_profile.is_some() { "ready" } else { "blocked" },
                "evidence": "epi profile show JSON / S0' profile dispatcher"
            },
            {
                "id": "s3_projection_contract",
                "status": if snapshot.connection.connected { "ready" } else { "blocked" },
                "evidence": snapshot.connection.subscription_mode
            },
            {
                "id": "kernel_bridge_runtime",
                "status": if snapshot.current_profile_generation.is_some() { "ready" } else { "blocked" },
                "evidence": "KernelBridgeRuntime shared fanout"
            },
            {
                "id": "body_lite_client",
                "status": if body_received_profile { "ready" } else { "blocked" },
                "evidence": "body:* consumer received matching profile event"
            },
            {
                "id": "theia_full_client",
                "status": if theia_received_profile { "ready" } else { "blocked" },
                "evidence": "theia:* consumer received matching profile event"
            },
            {
                "id": "m5_4_agent_capability",
                "status": if agent_receipt_matches { "ready" } else { "blocked" },
                "evidence": capability_receipt.gateway_method
            },
            {
                "id": "review_evidence_event",
                "status": if evidence_event
                    .pointer("/coordinateAnchor/coordinate_anchor/kernel/generation")
                    == Some(&json!(profile_generation)) {
                    "ready"
                } else {
                    "blocked"
                },
                "evidence": "portal_core::KernelProfileObservationEvent"
            }
        ],
        "explicitBlockers": [
            {
                "id": "s3.native-spacetimedb-live-service",
                "state": "blocked_if_not_started_by_operator",
                "reason": "This acceptance report proves the local projection contract and kernel-bridge fanout; a production native SpaceTimeDB WebSocket process still requires the Track 03 live harness."
            },
            {
                "id": "s5.persisted-review-deposit",
                "state": "blocked_without_s5_persisted_store",
                "reason": "M5-4 receives a governed deposit receipt and KernelProfileObservationEvent; persisted S5 review storage remains owned by Track 04/S5."
            },
            {
                "id": "s2.live-pointer-certification",
                "state": "degraded_without_live_s2_graph",
                "reason": "S0 profile carries safe pointer anchors; live S2 graph certification is consumed through Track 02 contracts and remains separately reportable."
            }
        ],
        "migrationPath": [
            "Legacy clock/profile consumers call `epi profile show|pointer|readiness` first.",
            "Shared clients subscribe through KernelBridgeRuntime / KernelBridgeAPI rather than direct SpaceTimeDB or portal-core imports.",
            "Lite `/body` and full Theia clients compare profileGeneration and privacyClass from bridge events.",
            "M5-4 capabilities deposit evidence through governed gateway methods, carrying VAK route lineage and profile generation."
        ]
    })
}

fn safe_cached_profile_from_context(
    context: &Value,
    state: SpacetimeProjectionConnectionState,
) -> Result<Option<KernelBridgeCachedProfile>, String> {
    let Some(kernel) = context.get("kernel").filter(|value| value.is_object()) else {
        return Ok(None);
    };
    let privacy_class = kernel
        .get("privacy")
        .and_then(Value::as_str)
        .unwrap_or(KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY);
    if privacy_class != KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY {
        return Err(format!(
            "kernel-bridge refuses to cache unsafe profile privacy class {privacy_class}"
        ));
    }
    forbid_private_payload_keys(kernel)?;
    let Some(generation) = kernel.get("generation").and_then(Value::as_u64) else {
        return Ok(None);
    };
    let cached_at_ms = now_ms()?;
    let stale = state == SpacetimeProjectionConnectionState::StaleProfile;
    Ok(Some(KernelBridgeCachedProfile {
        generation,
        cached_at_ms,
        stale,
        staleness_ms: 0,
        privacy_class: privacy_class.to_owned(),
        profile: kernel.clone(),
    }))
}

fn forbid_private_payload_keys(value: &Value) -> Result<(), String> {
    const FORBIDDEN: &[&str] = &[
        "protectedProfileHashDetail",
        "identityHashPreview",
        "layerPresenceMask",
        "rawNaraBody",
        "privateIdentityData",
        "bioquaternion",
        "resonanceSquareEmphasis",
    ];
    let raw = value.to_string();
    for key in FORBIDDEN {
        if raw.contains(&format!("\"{key}\"")) {
            return Err(format!(
                "kernel-bridge safe profile cache rejected protected/private field {key}"
            ));
        }
    }
    Ok(())
}

fn require_route_lineage(route_lineage: &[String]) -> Result<(), String> {
    let expected = ["vak_evaluate", "anima_orchestrate"];
    for required in expected {
        if !route_lineage.iter().any(|entry| entry == required) {
            return Err(format!(
                "kernel-bridge capability invocation missing VAK route lineage step {required}"
            ));
        }
    }
    if !route_lineage
        .iter()
        .any(|entry| entry.starts_with("dispatch_") || entry == "run_chain")
    {
        return Err(
            "kernel-bridge capability invocation missing dispatch_X route lineage step".to_owned(),
        );
    }
    Ok(())
}

fn gateway_method_for_capability(method: &str, params: &Value) -> Result<Option<String>, String> {
    match method {
        "readCurrentProfile" | "readPointerAnchor" | "readReadiness" | "subscribeObservability" => {
            Ok(None)
        }
        "invokeGatewayRpc" => {
            let gateway_method = params
                .get("gatewayMethod")
                .and_then(Value::as_str)
                .ok_or_else(|| "invokeGatewayRpc requires gatewayMethod".to_owned())?;
            if !matches!(
                gateway_method,
                "s5'.epii.status"
                    | "s5'.epii.runtime.context"
                    | "s5'.epii.deposit"
                    | "s5'.review.submit"
                    | "s5'.review.inbox"
                    | "s5.episodic.kernel_profile_observation.deposit"
                    | "s5.episodic.kernel_resonance.deposit"
            ) {
                return Err(format!(
                    "kernel-bridge invokeGatewayRpc rejected ungoverned gateway method {gateway_method}"
                ));
            }
            Ok(Some(gateway_method.to_owned()))
        }
        "depositKernelObservation" => Ok(Some(
            "s5.episodic.kernel_profile_observation.deposit".to_owned(),
        )),
        "requestReviewEvidence" => Ok(Some("s5'.review.submit".to_owned())),
        _ => Err(format!(
            "kernel-bridge rejected unsupported capability {method}"
        )),
    }
}

fn canonical_vak_json(vak: &VakAddress) -> Value {
    json!({
        "CPF": vak.cpf,
        "CT": vak.ct,
        "CP": vak.cp,
        "CF": vak.cf,
        "CFP": vak.cfp,
        "CS": vak.cs,
    })
}

fn connection_reason(update: &SpacetimeProjectionUpdate) -> String {
    match update.state {
        SpacetimeProjectionConnectionState::Connected => {
            "connected to SpaceTimeDB projection source".to_owned()
        }
        SpacetimeProjectionConnectionState::ConnectionLost => {
            "projection source disconnected; latest safe profile remains cached for replay"
                .to_owned()
        }
        SpacetimeProjectionConnectionState::Reconnecting => {
            "projection source reconnecting; downstream consumers stay subscribed to kernel-bridge"
                .to_owned()
        }
        SpacetimeProjectionConnectionState::StaleProfile => {
            "projection source replayed the stale generation while reconnecting".to_owned()
        }
        SpacetimeProjectionConnectionState::ResyncedProfileGeneration => {
            "projection source resynced with a newer profile generation".to_owned()
        }
        SpacetimeProjectionConnectionState::DegradedButSubscribable => {
            "projection source degraded but still subscribable through the shared bridge".to_owned()
        }
    }
}

fn require_nonempty(value: &str, field: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{field} must not be empty"));
    }
    Ok(())
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
