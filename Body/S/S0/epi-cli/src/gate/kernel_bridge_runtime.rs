use std::collections::{BTreeMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_gateway_contract::{
    SPACETIME_PROJECTION_MODE_FULL, SPACETIME_PROJECTION_MODE_LITE,
    SPACETIME_PROJECTION_SOURCE_HTTP_SQL, SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
};
use portal_core::{
    bioquaternion_transcription, cymatic_monopoly_state, epogdoon_bridge_lattice,
    planetary_elemental_weights, DepositionAnchorProjection, EpogdoonBridgeProjection, KernelPhase,
    KleinFlipEvent, MPrimePerformanceEvent, MathemeDiatonicContext, MathemeHarmonicProfile,
    MathemeNodalConstraint, MathemePointerAnchorProjection, PortalClockState, ProfilePrivacyClass,
    RelationDescriptor, RelationFamily, VakAddress, EPOGDOON_M2_ADDRESS_COUNT,
};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use super::spacetimedb_bridge::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate};

pub const KERNEL_BRIDGE_SOURCE: &str = "kernel-bridge";
pub const KERNEL_BRIDGE_RUNTIME_OWNER: &str = "S0/S0' kernel-bridge runtime";
pub const KERNEL_BRIDGE_THEIA_ADAPTER: &str = "Theia KernelBridgeAPI dependency-injection adapter";
pub const KERNEL_BRIDGE_TAURI_ADAPTER: &str = "Tauri 0/1 surface adapter";
pub const KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY: &str = "safe-public-current-kernel-tick";
pub const KERNEL_BRIDGE_AGENT_PRIVACY: &str = "public_current_with_graph_provenance";
pub const M1_PROFILE_TO_PERFORMANCE_STREAM: &str = "S0.kernel-bridge.m1-profile-to-performance";

/// Bridge-contract identifier for the epogdoon 72→64 descent projection
/// (37.T37.1). The Theia EpogdoonBridgeEngine reads this single authority and
/// never recomputes the 9:8 fold locally.
pub const KERNEL_BRIDGE_M2_EPOGDOON_PROJECTION: &str =
    "kernelBridge.m2.epogdoonProjection(address72)";
pub const KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS: &str =
    "kernelBridge.m2.planetaryElementalWeights()";
pub const KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE: &str =
    "kernelBridge.m2.cymaticMonoPolyState(address72)";
pub const KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION: &str =
    "kernelBridge.m3.bioquaternionTranscription(codon)";

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
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeProfileJsonShape {
    pub generation: u64,
    pub cached_at_ms: u128,
    pub stale: bool,
    pub staleness_ms: u128,
    pub privacy_class: String,
    pub profile: Value,
}

impl From<&KernelBridgeCachedProfile> for KernelBridgeProfileJsonShape {
    fn from(profile: &KernelBridgeCachedProfile) -> Self {
        Self {
            generation: profile.generation,
            cached_at_ms: profile.cached_at_ms,
            stale: profile.stale,
            staleness_ms: profile.staleness_ms,
            privacy_class: profile.privacy_class.clone(),
            profile: profile.profile.clone(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgePerformanceTickJsonShape {
    pub tick: u64,
    pub tick12: u8,
    pub cycle: u64,
    pub degree720: u16,
    pub su2_layer: String,
    pub position6: u8,
    pub kernel_tick_authority: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgePerformanceHarmonicJsonShape {
    pub phase: KernelPhase,
    pub position6: u8,
    pub helix: String,
    pub ratio_role: String,
    pub audio_octet: [f32; 8],
    pub nodal_quartet: [MathemeNodalConstraint; 4],
}

pub type KernelBridgeDepositionAnchorJsonShape = DepositionAnchorProjection;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeLensModeJsonShape {
    pub lens: u8,
    pub mode: u8,
    pub codon_id: u8,
    pub rotation: u8,
    pub codon_class: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgePerformanceStateJsonShape {
    pub tempo_clock: String,
    pub pitch_authority: String,
    pub nodal_constraint_authority: String,
    pub renderer_derivation_allowed: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgePerformanceEventJsonShape {
    pub event: String,
    pub stream: String,
    pub runtime_owner: String,
    pub source: String,
    pub profile_generation: u64,
    pub profile_schema_version: u16,
    pub privacy_class: ProfilePrivacyClass,
    pub required_profile_fields: Vec<String>,
    pub tick: KernelBridgePerformanceTickJsonShape,
    pub harmonic: KernelBridgePerformanceHarmonicJsonShape,
    pub pointer_anchor: MathemePointerAnchorProjection,
    pub diatonic: Option<MathemeDiatonicContext>,
    pub deposition_anchor: KernelBridgeDepositionAnchorJsonShape,
    pub lens_mode: KernelBridgeLensModeJsonShape,
    pub klein_flip: Option<KleinFlipEvent>,
    pub m_prime_performance_event: MPrimePerformanceEvent,
    pub performance_state: KernelBridgePerformanceStateJsonShape,
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum OracleSpreadScale {
    SingleCard,
    CompressedTriad,
    SixfoldQlTraverse,
    NightInversePass,
    #[serde(rename = "depth-4-5-pass")]
    Depth45Pass,
    ClockWalk,
    SymbolicOrf,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum OracleTraversalDirection {
    Day,
    Night,
    NightPrime,
    Inverse,
    Clockwise,
    Counterclockwise,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingPosition {
    pub key: String,
    pub ordinal: u8,
    pub cp_position_ref: String,
    pub label: Option<String>,
    pub vak: Option<VakAddress>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleFrame {
    pub frame_id: String,
    pub spread_scale: OracleSpreadScale,
    pub positions: Vec<ReadingPosition>,
    pub traversal_direction: Option<OracleTraversalDirection>,
    pub complementary_pairs: Vec<[String; 2]>,
}

pub type ReadingFrame = OracleFrame;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleSequenceCodon {
    pub ordinal: u16,
    pub symbol: String,
    pub cp_position_ref: String,
    pub vak: Option<VakAddress>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OracleSequence {
    pub sequence_id: String,
    pub frame_id: String,
    pub codons: Vec<OracleSequenceCodon>,
}

/// Mirrors M3_TranscriptClass from m3.h: SHARED=0, TRANSCRIBABLE=1
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TranscriptClass {
    Shared = 0,
    Transcribable = 1,
}

/// Mirrors M3_GovernanceRole from m3.h: NONE=0, START=1, STOP=2
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum GovernanceRole {
    None = 0,
    Start = 1,
    Stop = 2,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SymbolicProtein {
    pub protein_id: String,
    pub sequence: OracleSequence,
    pub reading_frame: OracleFrame,
    pub start_position_ref: Option<String>,
    pub stop_position_ref: Option<String>,
    /// M3 transcript-class distinction (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub transcript_class: Option<TranscriptClass>,
    /// M3 governance role (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub governance_role: Option<GovernanceRole>,
    /// True if this protein was derived from canonical spec rather than empirical input (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_canonical_derivation: Option<bool>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionalClockPacket {
    pub packet_id: String,
    pub profile_generation: Option<u64>,
    pub vak: VakAddress,
    pub oracle_frame: OracleFrame,
    pub cp_position_ref: String,
    pub oracle_sequence: Option<OracleSequence>,
    pub symbolic_protein: Option<SymbolicProtein>,
    pub provenance_handles: Vec<String>,
    /// M3 transcript-class distinction (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub transcript_class: Option<TranscriptClass>,
    /// M3 governance role (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub governance_role: Option<GovernanceRole>,
    /// Position in the transcriptional chain, 0-based (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub chain_position: Option<u32>,
    /// Hash of the parent TranscriptionalClockPacket for chain verification (additive, 4.17)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_packet_hash: Option<[u8; 32]>,
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
        let artifact = match request.method.as_str() {
            KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE => {
                typed_json_m2_cymatic_monopoly_state(address72_param(&request.params, "address72")?)
            }
            KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION => {
                typed_json_m3_bioquaternion_transcription(codon_param(&request.params, "codon")?)
            }
            _ => {
                json!({
                    "capability": request.method,
                    "gatewayMethod": gateway_method,
                    "runtimeOwner": KERNEL_BRIDGE_RUNTIME_OWNER,
                    "source": KERNEL_BRIDGE_SOURCE,
                    "profileGeneration": request.profile_generation,
                    "vakAddress": canonical_vak_json(&vak.vak_address),
                    "routeLineage": vak.route_lineage.clone(),
                    "params": request.params,
                })
            }
        };

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
        let payload = typed_json_profile_event_payload(profile)?;
        Ok(KernelBridgeRuntimeEvent {
            kind: KernelBridgeRuntimeEventKind::Profile,
            emitted_at_ms: now_ms()?,
            source: KERNEL_BRIDGE_SOURCE.to_owned(),
            profile_generation: Some(profile.generation),
            privacy_class: profile.privacy_class.clone(),
            payload: serde_json::to_value(payload).map_err(|err| err.to_string())?,
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
        "s2.parashaktiCorrespondences",
        KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS,
        KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE,
        KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION,
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

/// `kernelBridge.m2.epogdoonProjection(address72)` — project one M2 vibrational
/// address (0..71) into the M3 codon lattice. Runs the C epogdoon law through
/// portal-core (`apply_epogdoon_compression` / `is_evolutionary_gap` /
/// `m3_epogdoon_expand`); the address is taken modulo 72 so the projector is
/// total. Mirrors the Theia `M2EpogdoonProjector` contract exactly.
pub fn m2_epogdoon_projection(address72: u8) -> EpogdoonBridgeProjection {
    EpogdoonBridgeProjection::from_address72(address72)
}

/// The full 72-entry descent lattice surfaced by the bridge, address-ordered.
pub fn m2_epogdoon_projection_lattice() -> Vec<EpogdoonBridgeProjection> {
    epogdoon_bridge_lattice().to_vec()
}

/// Typed-JSON form of `kernelBridge.m2.epogdoonProjection(address72)` —
/// `{ compressedCodon, isEvolutionaryGap, expandedBack }` for the Theia adapter.
pub fn typed_json_m2_epogdoon_projection(address72: u8) -> Value {
    serde_json::to_value(m2_epogdoon_projection(address72))
        .expect("EpogdoonBridgeProjection serializes")
}

/// Typed-JSON form of the full 72→64 descent lattice for the Theia adapter,
/// carrying the bridge-contract identifier and the address-ordered cells.
pub fn typed_json_m2_epogdoon_lattice() -> Value {
    json!({
        "contract": KERNEL_BRIDGE_M2_EPOGDOON_PROJECTION,
        "runtimeOwner": KERNEL_BRIDGE_RUNTIME_OWNER,
        "source": KERNEL_BRIDGE_SOURCE,
        "addressCount": EPOGDOON_M2_ADDRESS_COUNT,
        "cells": m2_epogdoon_projection_lattice(),
    })
}

/// Typed-JSON form of `kernelBridge.m2.planetaryElementalWeights()` —
/// `{ weights, perPlanet, aspectGain }` projected from the current kernel clock.
pub fn typed_json_m2_planetary_elemental_weights(state: &PortalClockState) -> Value {
    let mut value = serde_json::to_value(planetary_elemental_weights(state))
        .expect("PlanetaryElementalWeights serializes");
    if let Value::Object(ref mut object) = value {
        object.insert(
            "contract".to_owned(),
            Value::String(KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS.to_owned()),
        );
        object.insert(
            "runtimeOwner".to_owned(),
            Value::String(KERNEL_BRIDGE_RUNTIME_OWNER.to_owned()),
        );
        object.insert(
            "source".to_owned(),
            Value::String(KERNEL_BRIDGE_SOURCE.to_owned()),
        );
    }
    value
}

/// Typed-JSON form of `kernelBridge.m2.cymaticMonoPolyState(address72)` —
/// `{ behaviourState, activeToneCount, mutualResonance, projection64 }`.
pub fn typed_json_m2_cymatic_monopoly_state(address72: u8) -> Value {
    let mut value = serde_json::to_value(cymatic_monopoly_state(address72))
        .expect("CymaticMonoPolyState serializes");
    if let Value::Object(ref mut object) = value {
        object.insert(
            "contract".to_owned(),
            Value::String(KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE.to_owned()),
        );
        object.insert(
            "runtimeOwner".to_owned(),
            Value::String(KERNEL_BRIDGE_RUNTIME_OWNER.to_owned()),
        );
        object.insert(
            "source".to_owned(),
            Value::String(KERNEL_BRIDGE_SOURCE.to_owned()),
        );
    }
    value
}

/// Typed-JSON form of `kernelBridge.m3.bioquaternionTranscription(codon)` —
/// one public codon transcription object, so renderers consume charges,
/// quaternion, elements, amino acid, tarot, and complement from the bridge.
pub fn typed_json_m3_bioquaternion_transcription(codon: u8) -> Value {
    let mut value = serde_json::to_value(bioquaternion_transcription(codon))
        .expect("BioquaternionTranscription serializes");
    if let Value::Object(ref mut object) = value {
        object.insert(
            "contract".to_owned(),
            Value::String(KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION.to_owned()),
        );
        object.insert(
            "runtimeOwner".to_owned(),
            Value::String(KERNEL_BRIDGE_RUNTIME_OWNER.to_owned()),
        );
        object.insert(
            "source".to_owned(),
            Value::String(KERNEL_BRIDGE_SOURCE.to_owned()),
        );
    }
    value
}

pub fn m1_performance_event_from_profile(
    profile_generation: u64,
    profile: &MathemeHarmonicProfile,
) -> Value {
    serde_json::to_value(typed_json_performance_event_from_profile(
        profile_generation,
        profile,
    ))
    .expect("KernelBridgePerformanceEventJsonShape serializes")
}

pub fn typed_json_profile_event_payload(
    profile: &KernelBridgeCachedProfile,
) -> Result<KernelBridgeProfileJsonShape, String> {
    forbid_private_payload_keys(&profile.profile)?;
    let raw = serde_json::to_value(KernelBridgeProfileJsonShape::from(profile))
        .map_err(|err| err.to_string())?;
    extract_typed_json(&raw, "kernel bridge profile event")
}

pub fn typed_json_performance_event_from_profile(
    profile_generation: u64,
    profile: &MathemeHarmonicProfile,
) -> KernelBridgePerformanceEventJsonShape {
    KernelBridgePerformanceEventJsonShape {
        event: "m1.profile_to_performance".to_owned(),
        stream: M1_PROFILE_TO_PERFORMANCE_STREAM.to_owned(),
        runtime_owner: KERNEL_BRIDGE_RUNTIME_OWNER.to_owned(),
        source: "portal_core::MathemeHarmonicProfile".to_owned(),
        profile_generation,
        profile_schema_version: profile.profile_schema_version,
        privacy_class: profile.privacy_class,
        required_profile_fields: vec![
            "tick".to_owned(),
            "harmonic".to_owned(),
            "pointerAnchor".to_owned(),
            "diatonic".to_owned(),
            "depositionAnchor".to_owned(),
            "lensMode".to_owned(),
            "kleinFlip".to_owned(),
        ],
        tick: KernelBridgePerformanceTickJsonShape {
            tick: profile.tick,
            tick12: profile.tick12,
            cycle: profile.cycle,
            degree720: profile.degree720,
            su2_layer: profile.su2_layer.clone(),
            position6: profile.position6,
            kernel_tick_authority: "portal_core::kernel_tick_from_epogdoon".to_owned(),
        },
        harmonic: KernelBridgePerformanceHarmonicJsonShape {
            phase: profile.phase,
            position6: profile.position6,
            helix: profile.helix.clone(),
            ratio_role: profile.ratio_role.clone(),
            audio_octet: profile.audio_octet,
            nodal_quartet: profile.nodal_quartet.clone(),
        },
        pointer_anchor: profile.pointer_anchor.clone(),
        diatonic: profile.diatonic.clone(),
        deposition_anchor: profile.deposition_anchor.clone(),
        lens_mode: KernelBridgeLensModeJsonShape {
            lens: profile.lens_mode.lens,
            mode: profile.lens_mode.mode,
            codon_id: profile.codon_rotation_projection.codon_id,
            rotation: profile.codon_rotation_projection.rotation,
            codon_class: profile.codon_rotation_projection.codon_class.clone(),
        },
        klein_flip: profile.klein_flip,
        m_prime_performance_event: m_prime_performance_event_from_profile(
            profile_generation,
            profile,
        ),
        performance_state: KernelBridgePerformanceStateJsonShape {
            tempo_clock: "kernel-tick-not-renderer-frame".to_owned(),
            pitch_authority: "portal_core::MathemeHarmonicProfile.audio_octet".to_owned(),
            nodal_constraint_authority: "portal_core::MathemeHarmonicProfile.nodal_quartet"
                .to_owned(),
            renderer_derivation_allowed: false,
        },
    }
}

fn m_prime_performance_event_from_profile(
    profile_generation: u64,
    profile: &MathemeHarmonicProfile,
) -> MPrimePerformanceEvent {
    let deposition_method = "s5.episodic.kernel_profile_observation.deposit";
    let relation_descriptor = RelationDescriptor::new(
        format!("m1-profile-relation-{profile_generation}-{}", profile.tick),
        relation_family_for_position(profile.position6),
        profile.pointer_anchor.lens_anchor.clone(),
        format!("matheme-profile-{profile_generation}"),
        profile.pointer_anchor.pitch_class as i8,
        profile.ratio_role.clone(),
        profile.klein_flip.is_some(),
    )
    .expect("profile-derived M' relation descriptor is valid");

    MPrimePerformanceEvent::new(
        format!("m1-performance-{profile_generation}-{}", profile.tick),
        format!("kernel-bridge-profile-generation-{profile_generation}"),
        profile.tick,
        "kernel-bridge-runtime",
        profile.pointer_anchor.source_coordinate.clone(),
        profile.pointer_anchor.lens_anchor.clone(),
        relation_descriptor,
        profile.lens_mode.lens,
        profile.lens_mode.mode,
        profile.audio_octet,
        profile.nodal_quartet.clone().map(|node| (node.m, node.n)),
        intended_chromagram_from_profile(profile),
    )
    .map(|mut event| {
        event.deposition_policy = deposition_method.to_owned();
        event
    })
    .expect("profile-derived MPrimePerformanceEvent is valid")
}

/// Bridge-contract identifier for the M1'/M2'/M3' chime frame (bell-kernel
/// spec §5): the tick event proving all three poles resolved the same
/// resonant state at one tick. Published as a SIBLING to the M1 performance
/// stream — additive, never a replacement.
pub const M123_CHIME_FRAME_CONTRACT: &str = "S0.kernel-bridge.m123-chime-frame";
pub const M123_CHIME_EVENT_TYPE: &str = "m123.chime";

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M123ChimeM1JsonShape {
    /// Always "K2" — the resonant body topology.
    pub surface: String,
    /// The active M1 composition mount handle when one is registered. The
    /// pratibimba-app carrier renders the K2 client-side; kernel-side this
    /// stays None until a composition mount registers a handle.
    pub k2_surface_handle: Option<String>,
    /// `m1-paramasiva-played-torus` is a retiring Theia surface — absent in
    /// this carrier, kept for contract compatibility.
    pub played_torus_handle: Option<String>,
    pub played_torus_status: Option<String>,
    /// "profile-bus" | "world-clock" | "manual-scrub".
    pub strike_route: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M123ChimeM2JsonShape {
    /// The full modal/bell interpretation — liveOctet MUST stay
    /// byte-compatible with the source profile bus after JSON round-trip.
    pub modal_resonator: portal_core::ModalResonatorProfile,
    pub m2_prime_meaning_packet_ref: Option<String>,
    /// Deterministic digest handle for renderer determinism — never a raw
    /// protected field body.
    pub cymatic_frame_handle: String,
    pub cymatic_texture_contribution_handle: Option<String>,
    pub exact_profile_bus: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M123ChimeWorldClockBindingJsonShape {
    /// "ready" | "pending" | "stale" | "blocked".
    pub state: String,
    pub world_clock_handle: Option<String>,
    pub generation: Option<u64>,
    pub source: Option<String>,
    pub subscription_mode: Option<String>,
    pub tick: Option<u64>,
    pub degree720: Option<u16>,
    pub degree720_matches_profile: bool,
    pub tick_matches_profile: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M123ChimeM3JsonShape {
    pub codon_rotation_projection: Option<Value>,
    pub world_clock_binding: M123ChimeWorldClockBindingJsonShape,
}

/// The world-clock reading the gateway binds a chime against. Kept separate
/// from the profile so the coherence booleans compare two REAL derivation
/// paths instead of asserting a tautology.
#[derive(Debug, Clone, PartialEq)]
pub struct M123WorldClockReading {
    pub world_clock_handle: String,
    pub generation: u64,
    pub subscription_mode: String,
    pub tick: u64,
    pub degree720: u16,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M123ChimeFrameJsonShape {
    pub event_type: String,
    pub contract: String,
    pub source_profile_generation: u64,
    pub tick: u64,
    pub tick12: u8,
    pub degree720: u16,
    pub m2_address72: usize,
    pub m1: M123ChimeM1JsonShape,
    pub m2: M123ChimeM2JsonShape,
    pub m3: M123ChimeM3JsonShape,
    pub privacy_class: String,
}

impl M123ChimeFrameJsonShape {
    /// Coherence rule (bell-kernel spec §5): a present world clock with any
    /// tick or degree720 mismatch makes the chime frame incoherent —
    /// consumers must block integrated readiness on it. A pending binding
    /// carries no mismatch evidence and does not by itself refute coherence.
    pub fn is_coherent(&self) -> bool {
        matches!(
            self.m3.world_clock_binding.state.as_str(),
            "ready" | "pending"
        )
    }
}

/// Build the chime frame for one resolved profile tick. Fails when the
/// profile carries no `modalResonator` (a chime cannot be attested without
/// the resonant body) or when the serialized frame would leak a private
/// payload key.
pub fn m123_chime_frame_from_profile(
    profile_generation: u64,
    profile: &MathemeHarmonicProfile,
    world_clock: Option<&M123WorldClockReading>,
) -> Result<M123ChimeFrameJsonShape, String> {
    let modal_resonator = profile
        .modal_resonator
        .clone()
        .ok_or_else(|| "chime frame requires MathemeHarmonicProfile.modalResonator".to_owned())?;

    let digest_input = serde_json::to_vec(&(
        &profile.audio_octet,
        &profile.nodal_quartet,
        profile.tick,
        profile_generation,
    ))
    .map_err(|err| err.to_string())?;
    let cymatic_frame_handle = format!(
        "cymatic-frame-{}-{}",
        profile.tick,
        &blake3::hash(&digest_input).to_hex().as_str()[..16]
    );

    let world_clock_binding = match world_clock {
        Some(reading) => {
            let tick_matches_profile = reading.tick == profile.tick;
            let degree720_matches_profile = reading.degree720 == profile.degree720;
            M123ChimeWorldClockBindingJsonShape {
                state: if tick_matches_profile && degree720_matches_profile {
                    "ready"
                } else {
                    "stale"
                }
                .to_owned(),
                world_clock_handle: Some(reading.world_clock_handle.clone()),
                generation: Some(reading.generation),
                source: Some("s3.world_clock".to_owned()),
                subscription_mode: Some(reading.subscription_mode.clone()),
                tick: Some(reading.tick),
                degree720: Some(reading.degree720),
                degree720_matches_profile,
                tick_matches_profile,
            }
        }
        None => M123ChimeWorldClockBindingJsonShape {
            state: "pending".to_owned(),
            world_clock_handle: None,
            generation: None,
            source: None,
            subscription_mode: None,
            tick: None,
            degree720: None,
            degree720_matches_profile: false,
            tick_matches_profile: false,
        },
    };

    let frame = M123ChimeFrameJsonShape {
        event_type: M123_CHIME_EVENT_TYPE.to_owned(),
        contract: M123_CHIME_FRAME_CONTRACT.to_owned(),
        source_profile_generation: profile_generation,
        tick: profile.tick,
        tick12: profile.tick12,
        degree720: profile.degree720,
        m2_address72: modal_resonator.m2_address72.address72,
        m1: M123ChimeM1JsonShape {
            surface: "K2".to_owned(),
            k2_surface_handle: None,
            played_torus_handle: None,
            played_torus_status: None,
            strike_route: "profile-bus".to_owned(),
        },
        m2: M123ChimeM2JsonShape {
            modal_resonator,
            m2_prime_meaning_packet_ref: None,
            cymatic_frame_handle,
            cymatic_texture_contribution_handle: None,
            exact_profile_bus: true,
        },
        m3: M123ChimeM3JsonShape {
            codon_rotation_projection: serde_json::to_value(&profile.codon_rotation_projection)
                .ok(),
            world_clock_binding,
        },
        privacy_class: "public-current-context".to_owned(),
    };

    let serialized = serde_json::to_value(&frame).map_err(|err| err.to_string())?;
    forbid_private_payload_keys(&serialized)?;
    Ok(frame)
}

fn relation_family_for_position(position6: u8) -> RelationFamily {
    match position6 {
        0 => RelationFamily::A,
        1 => RelationFamily::B,
        2 => RelationFamily::C,
        3 => RelationFamily::D1,
        4 => RelationFamily::D2,
        _ => RelationFamily::D3,
    }
}

fn intended_chromagram_from_profile(profile: &MathemeHarmonicProfile) -> [f32; 12] {
    let mut chromagram = [0.0; 12];
    let pitch_class = profile.chromatic.pitch_class as usize;
    if pitch_class < chromagram.len() {
        chromagram[pitch_class] = 1.0;
    }
    chromagram
}

pub fn extract_typed_json<T>(value: &Value, label: &str) -> Result<T, String>
where
    T: DeserializeOwned,
{
    serde_json::from_value(value.clone())
        .map_err(|err| format!("kernel-bridge typed_json extraction failed for {label}: {err}"))
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
    fn walk(value: &Value, forbidden: &[&str]) -> Result<(), String> {
        match value {
            Value::Object(items) => {
                for (key, child) in items {
                    if is_private_q_partition_key(key) {
                        return Err(format!(
                            "kernel-bridge safe profile cache rejected private q partition field {key}"
                        ));
                    }
                    if is_q_partition_key(key) && !is_public_q_partition_key(key) {
                        return Err(format!(
                            "kernel-bridge safe profile cache rejected unknown q partition field {key}"
                        ));
                    }
                    if forbidden.iter().any(|forbidden_key| key == forbidden_key) {
                        return Err(format!(
                            "kernel-bridge safe profile cache rejected protected/private field {key}"
                        ));
                    }
                    walk(child, forbidden)?;
                }
                Ok(())
            }
            Value::Array(items) => {
                for child in items {
                    walk(child, forbidden)?;
                }
                Ok(())
            }
            _ => Ok(()),
        }
    }
    walk(value, FORBIDDEN)
}

fn is_private_q_partition_key(key: &str) -> bool {
    let key = key.to_ascii_lowercase();
    ["q_personal", "q_identity", "q_activity", "q_composed"]
        .iter()
        .any(|reserved| key == *reserved || key.starts_with(&format!("{reserved}_")))
}

fn is_q_partition_key(key: &str) -> bool {
    let key = key.to_ascii_lowercase();
    key.starts_with("q_") || key.starts_with("qm_")
}

fn is_public_q_partition_key(key: &str) -> bool {
    let key = key.to_ascii_lowercase();
    let rest = if let Some(rest) = key.strip_prefix("qm_") {
        rest
    } else if let Some(rest) = key.strip_prefix("q_") {
        rest
    } else {
        return false;
    };
    let bytes = rest.as_bytes();
    if !matches!(bytes.first(), Some(b'0'..=b'5')) {
        return false;
    }
    let mut index = 1;
    if bytes.get(index) == Some(&b'\'') {
        index += 1;
    }
    if bytes.get(index) != Some(&b'_') {
        return false;
    }
    index += 1;
    index < bytes.len()
        && bytes[index..]
            .iter()
            .all(|byte| byte.is_ascii_lowercase() || *byte == b'_')
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
        "s2.parashaktiCorrespondences" => Ok(Some("s2.parashaktiCorrespondences".to_owned())),
        KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS => Ok(Some(
            KERNEL_BRIDGE_M2_PLANETARY_ELEMENTAL_WEIGHTS.to_owned(),
        )),
        KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE => {
            Ok(Some(KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE.to_owned()))
        }
        KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION => Ok(Some(
            KERNEL_BRIDGE_M3_BIOQUATERNION_TRANSCRIPTION.to_owned(),
        )),
        _ => Err(format!(
            "kernel-bridge rejected unsupported capability {method}"
        )),
    }
}

fn address72_param(params: &Value, key: &str) -> Result<u8, String> {
    let value = params
        .get(key)
        .and_then(Value::as_u64)
        .ok_or_else(|| format!("{key} must be an unsigned integer"))?;
    if value > 71 {
        return Err(format!(
            "{key} must be in M2 address space 0..71, got {value}"
        ));
    }
    Ok(value as u8)
}

fn codon_param(params: &Value, key: &str) -> Result<u8, String> {
    let value = params
        .get(key)
        .and_then(Value::as_u64)
        .ok_or_else(|| format!("{key} must be an unsigned integer"))?;
    if value > 63 {
        return Err(format!("{key} must be in codon space 0..63, got {value}"));
    }
    Ok(value as u8)
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
