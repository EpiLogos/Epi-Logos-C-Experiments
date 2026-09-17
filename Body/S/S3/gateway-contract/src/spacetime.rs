use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::GRAPHITI_RUNTIME_AUTHORITY;

pub const SPACETIME_PROJECTION_SOURCE_HTTP_SQL: &str = "http-sql-poll";
pub const SPACETIME_PROJECTION_SOURCE_NATIVE_WS: &str = "native-websocket";
pub const SPACETIME_PROJECTION_MODE_LITE: &str = "lite";
pub const SPACETIME_PROJECTION_MODE_FULL: &str = "full";
pub const SPACETIME_CLOCK_PROTOCOL_VERSION: &str = "2026-06-01.s3-clock-v1";
// 03.T4: bumped from v1 → v2 because the shared-cosmos schema now includes
// world_clock_tick, coincidence_tick, and module_version. The
// epi-spacetime-module crate carries identically-versioned constants so
// drift between host and module is observable via the module_version row.
pub const SPACETIME_PROJECTION_SCHEMA_VERSION: &str = "2026-06-02.s3-projection-v2";
pub const SPACETIME_REDUCER_ABI_VERSION: &str = "2026-06-02.s3-reducer-v2";
pub const SPACETIME_SUBSCRIBE_METHOD: &str = "s3'.temporal.subscribe";
pub const SPACETIME_SUBSCRIBE_ALIAS_METHOD: &str = "s3'.spacetime.subscribe";
pub const SPACETIME_PROJECTION_TABLES: &[&str] = &[
    "gateway_instance",
    "agent_instance",
    "client_registration",
    "session_surface",
    "kairos_surface",
    "global_temporal_surface",
    "temporal_event",
    "world_clock",
    "world_clock_tick",
    "pratibimba_presence",
    "shared_archetype_event",
    "coincidence",
    "coincidence_tick",
    "module_version",
    "aletheia_veto_log",
    "being_pattern_presence",
    "being_pattern_relation_edge",
    "being_pattern_review_candidate",
];
pub const SPACETIME_LITE_PROJECTION_TABLES: &[&str] = &[
    "session_surface",
    "kairos_surface",
    "global_temporal_surface",
];
pub const SPACETIME_FULL_PROJECTION_TABLES: &[&str] = &[
    "session_surface",
    "kairos_surface",
    "global_temporal_surface",
    "gateway_instance",
    "agent_instance",
    "client_registration",
    "temporal_event",
    "world_clock",
    "world_clock_tick",
    "pratibimba_presence",
    "shared_archetype_event",
    "coincidence",
    "coincidence_tick",
    "module_version",
    "aletheia_veto_log",
    "being_pattern_presence",
    "being_pattern_relation_edge",
    "being_pattern_review_candidate",
];

pub const SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS: &[&str] = &[
    "requested",
    "applied",
    "delta",
    "resync",
    "error",
    "closed",
    "fallback-active",
];
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeProjectionPlan {
    pub mode: String,
    pub subscription_mode: String,
    pub endpoint: String,
    pub database: String,
    pub session_key: String,
    pub agent_id: String,
    pub coordinate_owner: String,
    pub agent_access_owner: String,
    pub tables: Vec<String>,
    pub sql_fallback_mode: String,
    pub clock_protocol_version: String,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct SpacetimeProjectionRows {
    pub session: Option<Value>,
    pub kairos: Option<Value>,
    pub global: Option<Value>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeReadinessContract {
    pub gateway_websocket_health: String,
    pub reducer_registration_health: String,
    pub native_subscription_readiness: String,
    pub active_fallback_mode: String,
    pub graphiti_runtime_compatibility_mode: String,
    pub clock_protocol_version: String,
    pub projection_schema_version: String,
    pub reducer_abi_version: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeSubscriptionLifecycleEnvelope {
    pub event: String,
    pub method: String,
    pub session_key: String,
    pub subscription_mode: String,
    pub projection_schema_version: String,
    pub payload: Value,
}

impl SpacetimeProjectionPlan {
    pub fn native(endpoint: impl Into<String>, database: impl Into<String>) -> Self {
        Self::new(
            SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
            endpoint.into(),
            database.into(),
        )
    }

    pub fn http_sql(endpoint: impl Into<String>, database: impl Into<String>) -> Self {
        Self::new(
            SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
            endpoint.into(),
            database.into(),
        )
    }

    pub fn new(mode: impl Into<String>, endpoint: String, database: String) -> Self {
        Self {
            mode: mode.into(),
            subscription_mode: SPACETIME_PROJECTION_MODE_LITE.to_owned(),
            endpoint,
            database,
            session_key: String::new(),
            agent_id: String::new(),
            coordinate_owner: "S3'".to_owned(),
            agent_access_owner: "S4/S5".to_owned(),
            tables: SPACETIME_LITE_PROJECTION_TABLES
                .iter()
                .map(|table| (*table).to_owned())
                .collect(),
            sql_fallback_mode: SPACETIME_PROJECTION_SOURCE_HTTP_SQL.to_owned(),
            clock_protocol_version: SPACETIME_CLOCK_PROTOCOL_VERSION.to_owned(),
            projection_schema_version: SPACETIME_PROJECTION_SCHEMA_VERSION.to_owned(),
            reducer_abi_version: SPACETIME_REDUCER_ABI_VERSION.to_owned(),
        }
    }

    pub fn for_session(
        mut self,
        session_key: impl Into<String>,
        agent_id: impl Into<String>,
    ) -> Self {
        self.session_key = session_key.into();
        self.agent_id = agent_id.into();
        self
    }

    pub fn for_subscription_mode(mut self, subscription_mode: impl AsRef<str>) -> Self {
        match subscription_mode.as_ref() {
            SPACETIME_PROJECTION_MODE_FULL => {
                self.subscription_mode = SPACETIME_PROJECTION_MODE_FULL.to_owned();
                self.tables = SPACETIME_FULL_PROJECTION_TABLES
                    .iter()
                    .map(|table| (*table).to_owned())
                    .collect();
            }
            _ => {
                self.subscription_mode = SPACETIME_PROJECTION_MODE_LITE.to_owned();
                self.tables = SPACETIME_LITE_PROJECTION_TABLES
                    .iter()
                    .map(|table| (*table).to_owned())
                    .collect();
            }
        }
        self
    }

    pub fn subscribe_url(&self) -> String {
        format!(
            "{}/v1/database/{}/subscribe",
            self.endpoint.trim_end_matches('/'),
            self.database
        )
    }

    pub fn subscribe_multi_message(&self) -> Value {
        serde_json::json!({
            "SubscribeMulti": {
                "query_strings": self.subscription_queries(),
                "request_id": 1,
                "query_id": { "id": 1 }
            }
        })
    }

    pub fn subscription_queries(&self) -> Vec<String> {
        let session_key = sql_string(&self.session_key);
        self.tables
            .iter()
            .filter_map(|table| match table.as_str() {
                "session_surface" | "kairos_surface" | "global_temporal_surface" => Some(format!(
                    "SELECT * FROM {table} WHERE session_key = {session_key}"
                )),
                "temporal_event" => Some(format!(
                    "SELECT * FROM temporal_event WHERE session_key = {session_key}"
                )),
                // 03.T4: pratibimba_presence has a session_key column.
                "pratibimba_presence" => Some(format!(
                    "SELECT * FROM pratibimba_presence WHERE session_key = {session_key}"
                )),
                // 03.T4: shared-cosmos tables are keyed by gateway_id / day_id /
                // identity_handle — not by session_key — so they subscribe
                // without a WHERE clause. Per-day or per-cell visibility is
                // enforced at the consumer side (and via SpaceTimeDB RLS when
                // it lands, per IOD-02).
                "world_clock"
                | "world_clock_tick"
                | "shared_archetype_event"
                | "coincidence"
                | "coincidence_tick"
                | "module_version" => Some(format!("SELECT * FROM {table}")),
                _ => None,
            })
            .collect()
    }

    pub fn readiness_contract(&self) -> SpacetimeReadinessContract {
        SpacetimeReadinessContract {
            gateway_websocket_health: "reported-by-gateway".to_owned(),
            reducer_registration_health: "reported-by-spacetimedb".to_owned(),
            native_subscription_readiness: self.mode.clone(),
            active_fallback_mode: self.sql_fallback_mode.clone(),
            graphiti_runtime_compatibility_mode: GRAPHITI_RUNTIME_AUTHORITY.to_owned(),
            clock_protocol_version: self.clock_protocol_version.clone(),
            projection_schema_version: self.projection_schema_version.clone(),
            reducer_abi_version: self.reducer_abi_version.clone(),
        }
    }

    pub fn lifecycle_envelope(
        &self,
        event: impl Into<String>,
        payload: Value,
    ) -> SpacetimeSubscriptionLifecycleEnvelope {
        self.lifecycle_envelope_for_method(SPACETIME_SUBSCRIBE_METHOD, event, payload)
    }

    /// 13.T4: emit a lifecycle envelope under EITHER `s3'.temporal.subscribe`
    /// OR `s3'.spacetime.subscribe`. Both methods MUST emit envelopes of THIS
    /// exact type — the S3-owned subscription registry is unified per the
    /// 13.T4 contract. Callers are expected to pass one of
    /// `SPACETIME_SUBSCRIBE_METHOD` or `SPACETIME_SUBSCRIBE_ALIAS_METHOD`;
    /// other method strings are accepted verbatim so downstream introspection
    /// can carry the method through unchanged.
    pub fn lifecycle_envelope_for_method(
        &self,
        method: impl Into<String>,
        event: impl Into<String>,
        payload: Value,
    ) -> SpacetimeSubscriptionLifecycleEnvelope {
        SpacetimeSubscriptionLifecycleEnvelope {
            event: event.into(),
            method: method.into(),
            session_key: self.session_key.clone(),
            subscription_mode: self.subscription_mode.clone(),
            projection_schema_version: self.projection_schema_version.clone(),
            payload,
        }
    }
}

/// 13.T4: the explicit fallback discipline. The S3-owned spacetime module
/// MUST publish exactly one of these states when native subscription is
/// unavailable. `SilentHttpFallback` is the negative space — it must NEVER be
/// emitted; the silent-HTTP-fallback sentinel test in the gateway crate proves
/// that no code path constructs this value. `FallbackActive` is the explicit
/// degraded mode named in 03.T2 deliverable 5.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SpacetimeFallbackPolicy {
    /// Native WS subscription is configured and the projection plan binds it.
    NativeWebsocket,
    /// Native WS subscription has failed or is not configured AND the consumer
    /// has been told explicitly. The runtime continues with HTTP SQL polling
    /// but downstream consumers KNOW the projection source is degraded.
    FallbackActive,
    /// Subscription is disabled (no SPACETIMEDB_URL / EPI_GATE_SPACETIME_URL).
    Disabled,
}

impl SpacetimeFallbackPolicy {
    pub fn as_str(self) -> &'static str {
        match self {
            SpacetimeFallbackPolicy::NativeWebsocket => SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
            SpacetimeFallbackPolicy::FallbackActive => SPACETIME_FALLBACK_ACTIVE,
            SpacetimeFallbackPolicy::Disabled => SPACETIME_FALLBACK_DISABLED,
        }
    }
}

/// 13.T4: the silent-HTTP-fallback sentinel. No code path inside the
/// S3-owned spacetime module may emit this string as a `projectionSource` or
/// as a `SpacetimeFallbackPolicy`. The gateway-side
/// `spacetime::silent_fallback_refused()` returns this constant so callers can
/// assert against it; the contract-level guard is that NO production code path
/// ever returns it.
pub const SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN: &str = "silent-http-fallback-forbidden";
pub const SPACETIME_FALLBACK_ACTIVE: &str = "fallback-active";
pub const SPACETIME_FALLBACK_DISABLED: &str = "disabled";

/// 13.T4: the canonical S3-owned subscription registry facts surfaced through
/// gateway readiness. Both `s3'.temporal.subscribe` and `s3'.spacetime.subscribe`
/// register under THIS schema; the registry is single-owner (S3), and the
/// `envelope_type_name` is fixed to `SpacetimeSubscriptionLifecycleEnvelope`
/// so downstream consumers can verify the envelope identity by name.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S3SubscriptionRegistryFacts {
    pub coordinate_owner: String,
    pub envelope_type_name: String,
    pub temporal_method: String,
    pub spacetime_alias_method: String,
    pub fallback_policy: SpacetimeFallbackPolicy,
    pub silent_fallback_forbidden_sentinel: String,
    pub native_endpoint: Option<String>,
}

impl S3SubscriptionRegistryFacts {
    pub fn new(fallback_policy: SpacetimeFallbackPolicy, native_endpoint: Option<String>) -> Self {
        Self {
            coordinate_owner: "S3'".to_owned(),
            envelope_type_name: "SpacetimeSubscriptionLifecycleEnvelope".to_owned(),
            temporal_method: SPACETIME_SUBSCRIBE_METHOD.to_owned(),
            spacetime_alias_method: SPACETIME_SUBSCRIBE_ALIAS_METHOD.to_owned(),
            fallback_policy,
            silent_fallback_forbidden_sentinel: SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN.to_owned(),
            native_endpoint,
        }
    }
}

impl SpacetimeProjectionRows {
    pub fn from_subscription_message(message: &Value) -> Result<Self, String> {
        let Some(update) = subscription_database_update(message) else {
            return Ok(Self::default());
        };
        let tables = update
            .get("tables")
            .and_then(Value::as_array)
            .ok_or_else(|| "spacetimedb subscription update missing tables".to_owned())?;
        let mut rows = Self::default();

        for table in tables {
            let table_name = table
                .get("table_name")
                .or_else(|| table.get("tableName"))
                .and_then(Value::as_str)
                .unwrap_or_default();
            let Some(row) = first_inserted_row(table) else {
                continue;
            };
            match table_name {
                "session_surface" => rows.session = Some(subscription_session_row(row)?),
                "kairos_surface" => rows.kairos = Some(subscription_kairos_row(row)?),
                "global_temporal_surface" => {
                    rows.global = Some(subscription_global_temporal_row(row)?)
                }
                _ => {}
            }
        }

        Ok(rows)
    }
}

/// The SpaceTimeDB subscription message kind. 03.T3 typed-delta surface:
/// consumers branch on this to handle the lifecycle phases explicitly rather
/// than treating every payload as the same "rows". `Unknown` covers
/// IdentityToken/Ping/server-control frames the consumer should ignore.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SpacetimeMessageKind {
    InitialSubscription,
    SubscribeMultiApplied,
    TransactionUpdate,
    TransactionUpdateLight,
    Unknown,
}

/// A row delta for one of the projection tables, tagged by table identity so
/// downstream consumers (Theia kernel-bridge, gateway lifecycle multiplex,
/// debugging tools) can route by surface without re-parsing table names.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case", tag = "table")]
pub enum SpacetimeTableDelta {
    SessionSurface {
        row: Value,
    },
    KairosSurface {
        row: Value,
    },
    GlobalTemporalSurface {
        row: Value,
    },
    WorldClock {
        row: Value,
    },
    PratibimbaPresence {
        row: Value,
    },
    SharedArchetypeEvent {
        row: Value,
    },
    Coincidence {
        row: Value,
    },
    GatewayInstance {
        row: Value,
    },
    AgentInstance {
        row: Value,
    },
    ClientRegistration {
        row: Value,
    },
    TemporalEvent {
        row: Value,
    },
    // 03.T4 audit/version surfaces.
    WorldClockTick {
        row: Value,
    },
    CoincidenceTick {
        row: Value,
    },
    ModuleVersion {
        row: Value,
    },
    BeingPatternPresence {
        row: Value,
    },
    BeingPatternRelationEdge {
        row: Value,
    },
    BeingPatternReviewCandidate {
        row: Value,
    },
    #[serde(rename = "other")]
    Other {
        table_name: String,
        row: Value,
    },
}

impl SpacetimeTableDelta {
    /// Construct a delta from a raw `table_name` + row payload. Unknown table
    /// names fall back to `Other`, preserving the original `table_name` so
    /// debug tooling can still surface the table identity.
    pub fn from_table_name(table_name: &str, row: Value) -> Self {
        match table_name {
            "session_surface" => SpacetimeTableDelta::SessionSurface { row },
            "kairos_surface" => SpacetimeTableDelta::KairosSurface { row },
            "global_temporal_surface" => SpacetimeTableDelta::GlobalTemporalSurface { row },
            "world_clock" => SpacetimeTableDelta::WorldClock { row },
            "pratibimba_presence" => SpacetimeTableDelta::PratibimbaPresence { row },
            "shared_archetype_event" => SpacetimeTableDelta::SharedArchetypeEvent { row },
            "coincidence" => SpacetimeTableDelta::Coincidence { row },
            "gateway_instance" => SpacetimeTableDelta::GatewayInstance { row },
            "agent_instance" => SpacetimeTableDelta::AgentInstance { row },
            "client_registration" => SpacetimeTableDelta::ClientRegistration { row },
            "temporal_event" => SpacetimeTableDelta::TemporalEvent { row },
            // 03.T4 audit/version surfaces.
            "world_clock_tick" => SpacetimeTableDelta::WorldClockTick { row },
            "coincidence_tick" => SpacetimeTableDelta::CoincidenceTick { row },
            "module_version" => SpacetimeTableDelta::ModuleVersion { row },
            "being_pattern_presence" => SpacetimeTableDelta::BeingPatternPresence { row },
            "being_pattern_relation_edge" => SpacetimeTableDelta::BeingPatternRelationEdge { row },
            "being_pattern_review_candidate" => {
                SpacetimeTableDelta::BeingPatternReviewCandidate { row }
            }
            other => SpacetimeTableDelta::Other {
                table_name: other.to_owned(),
                row,
            },
        }
    }
}

/// The typed delta surface returned by `SpacetimeProjectionSubscription`.
/// Carries the message kind explicitly so consumers can distinguish initial
/// snapshot (full table state) from steady-state updates (incremental rows).
/// `inserts` and `deletes` are typed by surface; unknown tables are preserved
/// as `SpacetimeTableDelta::Other` rather than silently dropped.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeProjectionDelta {
    pub message_kind: SpacetimeMessageKind,
    pub inserts: Vec<SpacetimeTableDelta>,
    pub deletes: Vec<SpacetimeTableDelta>,
}

impl SpacetimeProjectionDelta {
    pub fn empty(message_kind: SpacetimeMessageKind) -> Self {
        Self {
            message_kind,
            inserts: Vec::new(),
            deletes: Vec::new(),
        }
    }

    /// Decode a single SpaceTimeDB subscription frame into a typed delta.
    /// Recognises InitialSubscription, SubscribeMultiApplied,
    /// TransactionUpdate, and TransactionUpdateLight. For unknown or
    /// non-delta frames (IdentityToken, server pings) returns
    /// `(SpacetimeMessageKind::Unknown, empty inserts/deletes)`.
    pub fn from_subscription_message(message: &Value) -> Result<Self, String> {
        let message_kind = classify_subscription_message(message);
        if matches!(message_kind, SpacetimeMessageKind::Unknown) {
            return Ok(Self::empty(message_kind));
        }
        let Some(update) = subscription_database_update(message) else {
            return Ok(Self::empty(message_kind));
        };
        let tables = update
            .get("tables")
            .and_then(Value::as_array)
            .ok_or_else(|| "spacetimedb subscription update missing tables".to_owned())?;
        let mut inserts = Vec::new();
        let mut deletes = Vec::new();
        for table in tables {
            let table_name = table
                .get("table_name")
                .or_else(|| table.get("tableName"))
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned();
            let updates = match table.get("updates").and_then(Value::as_array) {
                Some(arr) => arr,
                None => continue,
            };
            for update_entry in updates {
                if let Some(rows) = update_entry.get("inserts").and_then(Value::as_array) {
                    for row in rows {
                        inserts.push(SpacetimeTableDelta::from_table_name(
                            &table_name,
                            row.clone(),
                        ));
                    }
                }
                if let Some(rows) = update_entry.get("deletes").and_then(Value::as_array) {
                    for row in rows {
                        deletes.push(SpacetimeTableDelta::from_table_name(
                            &table_name,
                            row.clone(),
                        ));
                    }
                }
            }
        }
        Ok(Self {
            message_kind,
            inserts,
            deletes,
        })
    }

    /// Convenience: does the delta carry the first `KairosSurface` insert?
    /// 03.T3 verification rider invokes `bind_kairos_surface` and expects the
    /// `KairosSurface` delta to round-trip within 100 ms.
    pub fn first_kairos_insert(&self) -> Option<&Value> {
        self.inserts.iter().find_map(|delta| match delta {
            SpacetimeTableDelta::KairosSurface { row } => Some(row),
            _ => None,
        })
    }
}

fn classify_subscription_message(message: &Value) -> SpacetimeMessageKind {
    if message.get("InitialSubscription").is_some() {
        SpacetimeMessageKind::InitialSubscription
    } else if message.get("SubscribeMultiApplied").is_some() {
        SpacetimeMessageKind::SubscribeMultiApplied
    } else if message.get("TransactionUpdateLight").is_some() {
        SpacetimeMessageKind::TransactionUpdateLight
    } else if message.get("TransactionUpdate").is_some() {
        SpacetimeMessageKind::TransactionUpdate
    } else {
        SpacetimeMessageKind::Unknown
    }
}
fn subscription_database_update(message: &Value) -> Option<&Value> {
    message
        .get("SubscribeMultiApplied")
        .and_then(|value| value.get("update"))
        .or_else(|| {
            message
                .get("InitialSubscription")
                .and_then(|value| value.get("database_update"))
        })
        .or_else(|| {
            message
                .get("InitialSubscription")
                .and_then(|value| value.get("databaseUpdate"))
        })
        .or_else(|| {
            message
                .get("TransactionUpdateLight")
                .and_then(|value| value.get("update"))
        })
        .or_else(|| {
            message
                .get("TransactionUpdate")
                .and_then(|value| value.get("status"))
                .and_then(|status| status.get("Committed"))
        })
}

fn first_inserted_row(table: &Value) -> Option<&Value> {
    table
        .get("updates")
        .and_then(Value::as_array)?
        .iter()
        .find_map(|update| {
            update
                .get("inserts")
                .and_then(Value::as_array)
                .and_then(|rows| rows.first())
        })
}

fn subscription_session_row(row: &Value) -> Result<Value, String> {
    if row.is_object() {
        return Ok(row.clone());
    }
    let values = row
        .as_array()
        .ok_or_else(|| "session_surface subscription row must be object or array".to_owned())?;
    Ok(serde_json::json!({
        "session_key": subscription_string(values, 0),
        "installation_id": subscription_string(values, 1),
        "gateway_id": subscription_string(values, 2),
        "agent_instance_id": subscription_string(values, 3),
        "day_id": subscription_string(values, 4),
        "parent_session_key": subscription_string(values, 5),
        "source_session_key": subscription_string(values, 6),
        "source_session_kind": subscription_string(values, 7),
        "runtime_cwd": subscription_string(values, 8),
        "vault_root": subscription_string(values, 9),
        "resource_loader_id": subscription_string(values, 10),
        "retry_settlement_state": subscription_string(values, 11),
        "diagnostics_json": subscription_string(values, 12),
        "now_path": subscription_string(values, 13),
        "now_wikilink": subscription_string(values, 14),
        "history_archive_path": subscription_string(values, 15),
        "redis_session_now_key": subscription_string(values, 16),
        "redis_day_context_key": subscription_string(values, 17),
        "graphiti_arc_id": subscription_string(values, 18),
        "pratibimba_anchor_ref": subscription_string(values, 19),
        "kairos_snapshot_id": subscription_string(values, 20),
        "kernel_projection_json": subscription_string(values, 21),
        "updated_at": subscription_u64(values, 22),
    }))
}

fn subscription_kairos_row(row: &Value) -> Result<Value, String> {
    if row.is_object() {
        return Ok(row.clone());
    }
    let values = row
        .as_array()
        .ok_or_else(|| "kairos_surface subscription row must be object or array".to_owned())?;
    Ok(serde_json::json!({
        "kairos_snapshot_id": subscription_string(values, 0),
        "installation_id": subscription_string(values, 1),
        "gateway_id": subscription_string(values, 2),
        "day_id": subscription_string(values, 3),
        "session_key": subscription_string(values, 4),
        "available": subscription_bool(values, 5),
        "fresh": subscription_bool(values, 6),
        "dominant_sign": subscription_u64(values, 7),
        "dominant_element": subscription_u64(values, 8),
        "active_decan": subscription_u64(values, 9),
        "active_tattva": subscription_u64(values, 10),
        "planets_json": subscription_string(values, 11),
        "source": subscription_string(values, 12),
        "privacy_class": subscription_string(values, 13),
        "updated_at": subscription_u64(values, 14),
    }))
}

fn subscription_global_temporal_row(row: &Value) -> Result<Value, String> {
    if row.is_object() {
        return Ok(row.clone());
    }
    let values = row.as_array().ok_or_else(|| {
        "global_temporal_surface subscription row must be object or array".to_owned()
    })?;
    Ok(serde_json::json!({
        "surface_key": subscription_string(values, 0),
        "installation_id": subscription_string(values, 1),
        "gateway_id": subscription_string(values, 2),
        "agent_instance_id": subscription_string(values, 3),
        "session_key": subscription_string(values, 4),
        "day_id": subscription_string(values, 5),
        "day_wikilink": subscription_string(values, 6),
        "now_path": subscription_string(values, 7),
        "now_wikilink": subscription_string(values, 8),
        "now_lineage_key": subscription_string(values, 9),
        "history_archive_path": subscription_string(values, 10),
        "redis_session_now_key": subscription_string(values, 11),
        "redis_day_context_key": subscription_string(values, 12),
        "redis_global_context_key": subscription_string(values, 13),
        "graphiti_namespace_ref": subscription_string(values, 14),
        "graphiti_session_arc_id": subscription_string(values, 15),
        "pratibimba_anchor_ref": subscription_string(values, 16),
        "kairos_snapshot_id": subscription_string(values, 17),
        "kernel_projection_json": subscription_string(values, 18),
        "privacy_class": subscription_string(values, 19),
        "updated_at": subscription_u64(values, 20),
    }))
}

fn subscription_string(values: &[Value], index: usize) -> String {
    values
        .get(index)
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_owned()
}

fn subscription_bool(values: &[Value], index: usize) -> bool {
    values.get(index).and_then(Value::as_bool).unwrap_or(false)
}

fn subscription_u64(values: &[Value], index: usize) -> u64 {
    values.get(index).and_then(Value::as_u64).unwrap_or(0)
}

fn sql_string(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
}
