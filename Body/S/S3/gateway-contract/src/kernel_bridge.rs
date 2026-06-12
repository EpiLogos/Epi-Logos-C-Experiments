use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    GraphitiRuntimeStatus, SpacetimeMessageKind, SpacetimeTableDelta,
    SPACETIME_CLOCK_PROTOCOL_VERSION, SPACETIME_PROJECTION_SCHEMA_VERSION,
    SPACETIME_REDUCER_ABI_VERSION,
};

// =============== 03.T5 kernel-bridge stream contract ================
//
// The TypeScript-facing stream contract consumed by the Theia kernel-bridge
// extension (`Body/M/epi-theia/extensions/kernel-bridge/`) and the
// `/body` shell layout. Both consumers receive the same envelope shapes via
// serde-JSON over the gateway WebSocket multiplex; there is no Tauri-native
// alternative (PRD-01 obviated it).
//
// The kernel-bridge maintains an in-process row cache PER session_key and
// emits these envelopes to downstream M-extensions through Theia DI. Privacy
// filtering happens at the gateway boundary via `privacy_filter_*` helpers
// below so protected-reference-only rows cannot accidentally cross with
// hidden detail attached.

/// Connection state to the gateway from the kernel-bridge's perspective.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum KernelBridgeConnectionState {
    Connecting,
    Connected,
    Disconnected,
    Reconnecting,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeConnectionStatus {
    pub gateway_id: String,
    pub state: KernelBridgeConnectionState,
    pub protocol_version: u32,
    pub clock_protocol_version: String,
    /// 03.T6: surface the Graphiti runtime status so agents can decide
    /// whether episodic operations (s5.episodic.*) are available before
    /// invoking them. `Available` means the runtime answered its health
    /// probe; `Degraded` means the gateway reached it but with a non-ok
    /// status; `Unavailable` means no response within the probe timeout.
    pub graphiti_runtime_status: GraphitiRuntimeStatus,
    pub at_ms: u64,
}

/// 03.T6: typed status of the Graphiti runtime (the HTTP compatibility
/// adapter at port 37778 currently). Surfaced through the gateway readiness
/// AND through every subscription metadata envelope so consumers don't have
/// to make a separate readiness call to know whether episodic operations
/// will succeed.
///
/// Per IOD-08 the native-library boundary is unresolved; this enum is the
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeSubscriptionStatus {
    pub subscription_id: String,
    pub method: String,
    pub session_key: String,
    pub phase: String,
    pub source: String,
    pub privacy_class: String,
    /// 03.T6: Graphiti runtime status at the time this subscription
    /// envelope was emitted. Agents subscribing to KairosSurface +
    /// GlobalTemporalSurface use this to gate s5.episodic.* invocations
    /// without a separate readiness round-trip.
    pub graphiti_runtime_status: GraphitiRuntimeStatus,
    pub at_ms: u64,
}

/// 03.T6: typed envelope for routing S5/S5' Graphiti invocation through
/// the gateway RPC layer (instead of consumers reaching Graphiti directly).
/// Carries the explicit session/day/NOW/namespace/privacy axes named in
/// the deliverable so the gateway can refuse requests that don't supply
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum KernelBridgePrivacyClass {
    PublicSafe,
    ProtectedReferenceOnly,
    OptInShared,
}

/// One row in the kernel-bridge's latest-row cache. `surface` matches the
/// `SpacetimeTableDelta` variant identity; `row` carries the post-privacy
/// payload (NOT the raw native-WS row).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeCachedSurface {
    pub surface: String,
    pub privacy_class: KernelBridgePrivacyClass,
    pub row: Value,
    pub updated_at_ms: u64,
}

/// Snapshot of the kernel-bridge's row cache for a single session at a
/// single point in time. Emitted on (re)connection and after a resync.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeLatestRowCache {
    pub session_key: String,
    pub surfaces: Vec<KernelBridgeCachedSurface>,
}

/// A typed delta emitted to the kernel-bridge after privacy filtering.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeDelta {
    pub subscription_id: String,
    pub session_key: String,
    pub message_kind: SpacetimeMessageKind,
    pub inserts: Vec<KernelBridgeCachedSurface>,
    pub deletes: Vec<KernelBridgeCachedSurface>,
}

/// Resync envelope — emitted after the kernel-bridge reconnects and the
/// gateway has recovered the projection generation. Carries the recovered
/// surfaces so the consumer can re-render without polling.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeResync {
    pub subscription_id: String,
    pub session_key: String,
    pub stale_profile_generation: Option<u64>,
    pub recovered_profile_generation: u64,
    pub recovered_surfaces: Vec<KernelBridgeCachedSurface>,
}

/// Protocol mismatch — emitted when the kernel-bridge detects that any of
/// the gateway's announced version constants diverge from what the local
/// build expects. Downstream consumers MUST refuse to render data that
/// crossed a mismatched protocol.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KernelBridgeProtocolMismatch {
    pub local_projection_schema_version: String,
    pub remote_projection_schema_version: String,
    pub local_reducer_abi_version: String,
    pub remote_reducer_abi_version: String,
    pub local_clock_protocol_version: String,
    pub remote_clock_protocol_version: String,
    pub at_ms: u64,
}

/// The top-level stream contract. Every event the kernel-bridge consumes
/// from the gateway WS multiplex serialises into this enum. `kind`
/// (serde-internal-tag) is the discriminator the TypeScript side switches on.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "kind", content = "body")]
pub enum KernelBridgeStreamEvent {
    ConnectionStatus(KernelBridgeConnectionStatus),
    SubscriptionStatus(KernelBridgeSubscriptionStatus),
    LatestRowCache(KernelBridgeLatestRowCache),
    Delta(KernelBridgeDelta),
    Resync(KernelBridgeResync),
    ProtocolMismatch(KernelBridgeProtocolMismatch),
}

/// The kernel-bridge API contract — methods Theia consumers invoke against
/// the bridge frontend service. Each variant maps to a gateway RPC the
/// bridge translates and forwards. The bridge owns the WS connection and
/// the row cache; M-extensions consume via Theia DI.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "method", content = "params")]
pub enum KernelBridgeApiRequest {
    SubscribeWorldClock {
        #[serde(rename = "gatewayId")]
        gateway_id: String,
    },
    SubscribePratibimbaPresence {
        #[serde(rename = "sessionKey")]
        session_key: String,
    },
    SubscribeSharedArchetypeEvent {
        #[serde(rename = "dayId")]
        day_id: String,
        #[serde(rename = "aspectGridCellFilter")]
        aspect_grid_cell_filter: Option<u32>,
    },
    SubscribeKairosSurface {
        #[serde(rename = "sessionKey")]
        session_key: String,
    },
    SubscribeGlobalTemporalSurface {
        #[serde(rename = "sessionKey")]
        session_key: String,
    },
    InvokeGatewayRpc {
        #[serde(rename = "gatewayMethod")]
        gateway_method: String,
        #[serde(rename = "gatewayParams")]
        gateway_params: Value,
    },
    ObserveConnectionState,
}

/// Privacy classification for a known surface. Used by the gateway to
/// decide which fields cross to the kernel-bridge.
pub fn surface_privacy_class(surface: &str) -> KernelBridgePrivacyClass {
    match surface {
        // Personal/protected surfaces — only fingerprints/handles cross.
        "pratibimba_presence" => KernelBridgePrivacyClass::ProtectedReferenceOnly,
        // Opt-in surfaces — caller must have asserted consent.
        "shared_archetype_event" | "coincidence" => KernelBridgePrivacyClass::OptInShared,
        // Public-safe operational surfaces.
        _ => KernelBridgePrivacyClass::PublicSafe,
    }
}

/// 03.T5: privacy filter for a typed table delta crossing the gateway →
/// kernel-bridge boundary. Strips fields per the surface's privacy class:
///
/// - `ProtectedReferenceOnly` (pratibimba_presence): emits ONLY
///   `identity_handle` + `day_id` + `aspect_grid_cell` + `present`. The
///   `quintessence_hash` is a fingerprint but still a derived identity
///   shape, so it stays behind the gateway. `session_key`,
///   `installation_id`, and `gateway_id` are correlation handles consumers
///   don't need.
///
/// - `OptInShared` (shared_archetype_event, coincidence): emits the safe
///   subset — no `installation_id`, no `gateway_id`, no raw `payload_json`.
///   `event_kind` + `aspect_grid_cell` + `day_id` + `publisher_identity_handle`
///   (which is already a BLAKE3 fingerprint) cross.
///
/// - `PublicSafe`: row passes through unmodified.
///
/// The input may be a positional array (live SpaceTimeDB native WS shape) or
/// an object (synthetic test shape); both are normalised to an object using
/// the surface's known column layout before filtering.
pub fn privacy_filter_table_delta(delta: &SpacetimeTableDelta) -> KernelBridgeCachedSurface {
    let (surface_name, raw_row) = match delta {
        SpacetimeTableDelta::SessionSurface { row } => ("session_surface", row),
        SpacetimeTableDelta::KairosSurface { row } => ("kairos_surface", row),
        SpacetimeTableDelta::GlobalTemporalSurface { row } => ("global_temporal_surface", row),
        SpacetimeTableDelta::WorldClock { row } => ("world_clock", row),
        SpacetimeTableDelta::PratibimbaPresence { row } => ("pratibimba_presence", row),
        SpacetimeTableDelta::SharedArchetypeEvent { row } => ("shared_archetype_event", row),
        SpacetimeTableDelta::Coincidence { row } => ("coincidence", row),
        SpacetimeTableDelta::GatewayInstance { row } => ("gateway_instance", row),
        SpacetimeTableDelta::AgentInstance { row } => ("agent_instance", row),
        SpacetimeTableDelta::ClientRegistration { row } => ("client_registration", row),
        SpacetimeTableDelta::TemporalEvent { row } => ("temporal_event", row),
        SpacetimeTableDelta::WorldClockTick { row } => ("world_clock_tick", row),
        SpacetimeTableDelta::CoincidenceTick { row } => ("coincidence_tick", row),
        SpacetimeTableDelta::ModuleVersion { row } => ("module_version", row),
        SpacetimeTableDelta::Other { table_name, row } => (table_name.as_str(), row),
    };
    let privacy_class = surface_privacy_class(surface_name);
    let normalised = normalise_row_to_object(surface_name, raw_row);
    let filtered = match privacy_class {
        KernelBridgePrivacyClass::ProtectedReferenceOnly => filter_protected_row(&normalised),
        KernelBridgePrivacyClass::OptInShared => filter_opt_in_row(&normalised),
        KernelBridgePrivacyClass::PublicSafe => normalised,
    };
    KernelBridgeCachedSurface {
        surface: surface_name.to_owned(),
        privacy_class,
        row: filtered,
        updated_at_ms: 0,
    }
}

/// Convert a raw row payload — which may be a JSON array (live SpaceTimeDB
/// native-WS positional shape), a JSON object (synthetic/test shape OR live
/// InitialSubscription shape), or a JSON-encoded string of either form —
/// into a normalised object using the schema column order for the named
/// surface.
fn normalise_row_to_object(surface: &str, raw: &Value) -> Value {
    // Resolve the row to an inner Value, peeling off the JSON-string wrapper
    // that SpaceTimeDB 2.2's wire format applies to some row payloads.
    let inner = match raw {
        Value::String(s) => match serde_json::from_str::<Value>(s) {
            Ok(parsed) => parsed,
            Err(_) => return raw.clone(),
        },
        other => other.clone(),
    };
    // Object-shaped rows (live InitialSubscription, synthetic tests) pass
    // through unchanged — column names are already present.
    if matches!(inner, Value::Object(_)) {
        return inner;
    }
    let Value::Array(array) = inner else {
        return raw.clone();
    };
    let columns: &[&str] = match surface {
        "pratibimba_presence" => &[
            "identity_handle",
            "installation_id",
            "gateway_id",
            "session_key",
            "day_id",
            "quintessence_hash",
            "aspect_grid_cell",
            "privacy_class",
            "present",
            "updated_at",
        ],
        "shared_archetype_event" => &[
            "event_id",
            "installation_id",
            "gateway_id",
            "publisher_identity_handle",
            "day_id",
            "aspect_grid_cell",
            "event_kind",
            "payload_json",
            "privacy_class",
            "created_at",
        ],
        "coincidence" => &[
            "coincidence_id",
            "day_id",
            "aspect_grid_cell",
            "participant_identity_handles",
            "confidence_score",
            "related_event_ids",
            "detected_at",
        ],
        "world_clock" => &[
            "gateway_id",
            "tick",
            "source_now_ms",
            "dominant_aspect",
            "clock_kind",
            "kerykeion_state_hash",
            "clock_protocol_version",
            "kerykeion_version",
            "updated_at",
        ],
        // For surfaces we don't carry an explicit column map for, return the
        // raw array — consumers know the per-surface schema.
        _ => return raw.clone(),
    };
    let mut object = serde_json::Map::new();
    for (idx, column) in columns.iter().enumerate() {
        if let Some(value) = array.get(idx) {
            object.insert((*column).to_owned(), value.clone());
        }
    }
    Value::Object(object)
}

fn filter_protected_row(row: &Value) -> Value {
    let Value::Object(map) = row else {
        return row.clone();
    };
    let safe_keys = [
        "identity_handle",
        "day_id",
        "aspect_grid_cell",
        "present",
        "privacy_class",
        "updated_at",
    ];
    let mut filtered = serde_json::Map::new();
    for key in safe_keys {
        if let Some(value) = map.get(key) {
            filtered.insert(key.to_owned(), value.clone());
        }
    }
    Value::Object(filtered)
}

fn filter_opt_in_row(row: &Value) -> Value {
    let Value::Object(map) = row else {
        return row.clone();
    };
    // Strip raw correlation fields + raw payload_json (which may carry
    // arbitrary publisher-supplied content) — keep the safe public-shared
    // subset.
    let strip = ["installation_id", "gateway_id", "payload_json"];
    let mut filtered = map.clone();
    for key in strip {
        filtered.remove(key);
    }
    Value::Object(filtered)
}

/// 03.T5: detect a protocol mismatch between local and remote module-version
/// reporting. Returns `Some(KernelBridgeProtocolMismatch)` when any of the
/// version triple drifts; `None` when versions align.
pub fn detect_protocol_mismatch(
    remote_projection_schema_version: &str,
    remote_reducer_abi_version: &str,
    remote_clock_protocol_version: &str,
    at_ms: u64,
) -> Option<KernelBridgeProtocolMismatch> {
    let projection_match = remote_projection_schema_version == SPACETIME_PROJECTION_SCHEMA_VERSION;
    let reducer_match = remote_reducer_abi_version == SPACETIME_REDUCER_ABI_VERSION;
    let clock_match = remote_clock_protocol_version == SPACETIME_CLOCK_PROTOCOL_VERSION;
    if projection_match && reducer_match && clock_match {
        return None;
    }
    Some(KernelBridgeProtocolMismatch {
        local_projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
        remote_projection_schema_version: remote_projection_schema_version.to_owned(),
        local_reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
        remote_reducer_abi_version: remote_reducer_abi_version.to_owned(),
        local_clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
        remote_clock_protocol_version: remote_clock_protocol_version.to_owned(),
        at_ms,
    })
}
