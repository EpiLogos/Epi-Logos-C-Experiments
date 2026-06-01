use std::collections::{BTreeMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_gateway_contract::{
    SPACETIME_PROJECTION_MODE_FULL, SPACETIME_PROJECTION_MODE_LITE,
    SPACETIME_PROJECTION_SOURCE_HTTP_SQL, SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::spacetimedb_bridge::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate};

pub const KERNEL_BRIDGE_SOURCE: &str = "kernel-bridge";
pub const KERNEL_BRIDGE_RUNTIME_OWNER: &str = "S0/S0' kernel-bridge runtime";
pub const KERNEL_BRIDGE_THEIA_ADAPTER: &str = "Theia KernelBridgeAPI dependency-injection adapter";
pub const KERNEL_BRIDGE_TAURI_ADAPTER: &str = "Tauri 0/1 surface adapter";
pub const KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY: &str = "safe-public-current-kernel-tick";

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
        let capabilities = [
            "readCurrentProfile",
            "readPointerAnchor",
            "readReadiness",
            "subscribeObservability",
            "invokeGatewayRpc",
            "depositKernelObservation",
            "requestReviewEvidence",
        ];
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
            "capabilities": capabilities,
            "subscriptionProfile": self.connection.mode.as_str(),
            "subscriptionMode": self.connection.subscription_mode,
            "upstreamSubscriptionCount": self.upstream_subscription_count,
            "subscriberCount": self.subscribers.len(),
            "theiaDependencyInjectionAdapter": KERNEL_BRIDGE_THEIA_ADAPTER,
            "tauriAccessibleAdapter": KERNEL_BRIDGE_TAURI_ADAPTER,
        }))
    }
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
