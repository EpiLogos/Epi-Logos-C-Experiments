//! 13.T4: S3' SpaceTimeDB bridge — native WebSocket subscription, HTTP
//! reducer client, lifecycle envelope construction, fallback policy, readiness
//! schema. Extracted from `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`
//! per plan 13.T4 deliverable. S0 keeps only env/config discovery and the
//! file-based `SpacetimeBridge` test recorder; everything in this module is
//! S3-owned.
//!
//! Lane discipline (13.T4):
//! - `s3'.temporal.subscribe` and `s3'.spacetime.subscribe` share ONE
//!   subscription registry. Lifecycle envelopes use the same
//!   `SpacetimeSubscriptionLifecycleEnvelope` type carried by the
//!   gateway-contract crate.
//! - Fallback policy is explicit. Silent HTTP fallback is forbidden:
//!   `silent_fallback_refused()` returns the contract sentinel constant; no
//!   code path here may produce a "silently degraded to HTTP" projection
//!   source. When native is unavailable, callers receive an explicit
//!   `SpacetimeFallbackPolicy::FallbackActive` signal AND the readiness JSON
//!   names HTTP SQL polling as the fallback mode.

use std::path::{Path, PathBuf};

use epi_s3_gateway_contract::{
    SpacetimeFallbackPolicy, SpacetimeProjectionPlan, SpacetimeProjectionRows,
    DEFAULT_GATEWAY_PORT, SPACETIME_FALLBACK_ACTIVE, SPACETIME_FULL_PROJECTION_TABLES,
    SPACETIME_LITE_PROJECTION_TABLES, SPACETIME_PROJECTION_MODE_FULL,
    SPACETIME_PROJECTION_MODE_LITE, SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
    SPACETIME_PROJECTION_SOURCE_NATIVE_WS, SPACETIME_PROJECTION_TABLES,
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
};
use futures_util::{SinkExt, StreamExt};
use reqwest::blocking::Client as BlockingClient;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use tokio::net::TcpStream;
use tokio_tungstenite::{
    connect_async,
    tungstenite::{client::IntoClientRequest, Message},
    MaybeTlsStream, WebSocketStream,
};

// =============================================================================
// 13.T4: silent-HTTP-fallback sentinel
// =============================================================================

/// Returns the canonical sentinel string that names the forbidden silent HTTP
/// fallback path. Test fixtures may compare against this value, but no
/// production code path here ever returns it as a `projectionSource`. The
/// `silent_fallback_refused_is_never_emitted` regression test in the gateway
/// crate asserts the sentinel is not present in any reachable readiness JSON
/// or lifecycle envelope.
pub fn silent_fallback_refused() -> &'static str {
    SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN
}

/// 13.T4: derive a `SpacetimeFallbackPolicy` from a `SpacetimeProjectionPlan`.
/// This is the SINGLE entry point for routing native↔fallback decisions; any
/// new caller must use this — never construct a fallback decision via string
/// comparison or by silently downgrading.
pub fn fallback_policy_for_plan(plan: &SpacetimeProjectionPlan) -> SpacetimeFallbackPolicy {
    if plan.endpoint.is_empty() {
        SpacetimeFallbackPolicy::Disabled
    } else if plan.mode == SPACETIME_PROJECTION_SOURCE_NATIVE_WS {
        SpacetimeFallbackPolicy::NativeWebsocket
    } else {
        SpacetimeFallbackPolicy::FallbackActive
    }
}

// =============================================================================
// Connection state + resync tracker (was S0; now S3)
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum SpacetimeProjectionConnectionState {
    Connected,
    ConnectionLost,
    Reconnecting,
    StaleProfile,
    ResyncedProfileGeneration,
    DegradedButSubscribable,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeProjectionUpdate {
    pub state: SpacetimeProjectionConnectionState,
    pub source: String,
    pub profile_generation: Option<u64>,
    pub stale_profile_generation: Option<u64>,
    pub resynced_profile_generation: Option<u64>,
    pub degraded_but_subscribable: bool,
    pub context: Option<Value>,
}

#[derive(Debug, Clone, Default)]
pub struct SpacetimeProjectionResyncTracker {
    current_generation: Option<u64>,
    stale_generation: Option<u64>,
    reconnecting: bool,
}

impl SpacetimeProjectionResyncTracker {
    pub fn current_generation(&self) -> Option<u64> {
        self.current_generation
    }

    pub fn mark_connection_lost(&mut self) -> SpacetimeProjectionUpdate {
        self.stale_generation = self.current_generation;
        self.reconnecting = false;
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::ConnectionLost,
            source: SPACETIME_PROJECTION_SOURCE_NATIVE_WS.to_owned(),
            profile_generation: self.current_generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        }
    }

    pub fn mark_reconnecting(&mut self) -> SpacetimeProjectionUpdate {
        self.stale_generation = self.stale_generation.or(self.current_generation);
        self.reconnecting = true;
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Reconnecting,
            source: SPACETIME_PROJECTION_SOURCE_NATIVE_WS.to_owned(),
            profile_generation: self.current_generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        }
    }

    pub fn mark_degraded_but_subscribable(&mut self) -> SpacetimeProjectionUpdate {
        self.stale_generation = self.stale_generation.or(self.current_generation);
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::DegradedButSubscribable,
            source: SPACETIME_PROJECTION_SOURCE_NATIVE_WS.to_owned(),
            profile_generation: self.current_generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: None,
            degraded_but_subscribable: true,
            context: None,
        }
    }

    pub fn observe_context(&mut self, context: Value) -> SpacetimeProjectionUpdate {
        let generation = context
            .pointer("/kernel/generation")
            .and_then(Value::as_u64);
        let state = if self.reconnecting {
            if generation.is_some() && generation != self.stale_generation {
                SpacetimeProjectionConnectionState::ResyncedProfileGeneration
            } else {
                SpacetimeProjectionConnectionState::StaleProfile
            }
        } else {
            SpacetimeProjectionConnectionState::Connected
        };
        let resynced_generation = (state
            == SpacetimeProjectionConnectionState::ResyncedProfileGeneration)
            .then_some(generation)
            .flatten();
        let update = SpacetimeProjectionUpdate {
            state,
            source: context
                .pointer("/spacetimedb/projectionSource")
                .and_then(Value::as_str)
                .unwrap_or(SPACETIME_PROJECTION_SOURCE_NATIVE_WS)
                .to_owned(),
            profile_generation: generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: resynced_generation,
            degraded_but_subscribable: false,
            context: Some(context),
        };
        if update.resynced_profile_generation.is_some()
            || update.state == SpacetimeProjectionConnectionState::Connected
        {
            self.current_generation = generation;
            self.stale_generation = None;
            self.reconnecting = false;
        }
        update
    }
}

// =============================================================================
// SpacetimeRegistration: native subscription + reducer client + readiness
// =============================================================================

pub type SpacetimeSubscriptionPlan = SpacetimeProjectionPlan;

#[derive(Debug, Clone)]
pub struct SpacetimeRegistration {
    pub url: String,
    pub database: String,
    pub installation_id: String,
    pub gateway_id: String,
    pub workspace_root_hash: String,
    pub endpoint: String,
    pub protocol_version: String,
}

pub struct SpacetimeProjectionSubscription {
    socket: WebSocketStream<MaybeTlsStream<TcpStream>>,
    agent_id: String,
    resync: SpacetimeProjectionResyncTracker,
}

impl SpacetimeRegistration {
    /// 13.T4: env-config discovery returns an S3-owned registration. The
    /// state_root is used only to derive a stable workspace_root_hash if
    /// EPI_WORKSPACE_ROOT_HASH is not set; the registration object itself
    /// carries no S0-specific paths.
    pub fn from_env(port: u16, state_root: &Path) -> Result<Option<Self>, String> {
        let Some(url) =
            optional_env("EPI_GATE_SPACETIME_URL").or_else(|| optional_env("SPACETIMEDB_URL"))
        else {
            return Ok(None);
        };
        let database = optional_env("EPI_GATE_SPACETIME_DATABASE")
            .or_else(|| optional_env("SPACETIMEDB_DATABASE"))
            .unwrap_or_else(|| "epi-logos-runtime".to_owned());
        let installation_id =
            optional_env("EPI_INSTALLATION_ID").unwrap_or_else(|| "local".to_owned());
        let gateway_id =
            optional_env("EPI_GATEWAY_ID").unwrap_or_else(|| format!("gateway-{port}"));
        let workspace_root_hash = optional_env("EPI_WORKSPACE_ROOT_HASH")
            .unwrap_or_else(|| workspace_root_hash(state_root));
        let endpoint = optional_env("EPI_GATEWAY_ENDPOINT")
            .unwrap_or_else(|| format!("ws://127.0.0.1:{port}"));
        let protocol_version =
            optional_env("EPI_GATEWAY_PROTOCOL_VERSION").unwrap_or_else(|| "3".to_owned());

        Ok(Some(Self {
            url,
            database,
            installation_id,
            gateway_id,
            workspace_root_hash,
            endpoint,
            protocol_version,
        }))
    }

    pub fn readiness_value(&self) -> Value {
        let plan = self.subscription_plan("", "");
        let native_ready =
            plan.mode == SPACETIME_PROJECTION_SOURCE_NATIVE_WS && !plan.endpoint.is_empty();
        let capability_facts = projection_capability_facts(native_ready, &plan);
        let policy = fallback_policy_for_plan(&plan);
        json!({
            "ok": true,
            "configured": true,
            "registrationMode": "live-reducer",
            "subscriptionMode": plan.mode,
            "subscriptionProfile": plan.subscription_mode,
            "nativeSubscriptionReady": native_ready,
            "url": self.url,
            "database": self.database,
            "installationId": self.installation_id,
            "gatewayId": self.gateway_id,
            "endpoint": self.endpoint,
            "protocolVersion": self.protocol_version,
            "projectionTables": SPACETIME_PROJECTION_TABLES,
            "liteProjectionTables": SPACETIME_LITE_PROJECTION_TABLES,
            "fullProjectionTables": SPACETIME_FULL_PROJECTION_TABLES,
            "projectionSubscriptionPlan": plan,
            "capabilityFacts": capability_facts,
            // 13.T4: name the fallback policy explicitly + carry the
            // silent-fallback-forbidden sentinel so consumers can audit.
            "fallbackPolicy": policy,
            "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
            "rawServiceHealth": "configured reducer target; live reducer calls are verified by gateway registration tests",
            "agentAccess": "agent/session surfaces register when sessions publish temporal context",
            "subscriptionReadiness": if native_ready {
                "native SpaceTimeDB WebSocket projection plan is configured; HTTP SQL polling remains the fallback"
            } else {
                "TUI can bind projection via HTTP SQL polling; native WebSocket subscription remains an upgrade path"
            },
        })
    }

    pub fn subscription_plan(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> SpacetimeSubscriptionPlan {
        let mode = match optional_env("EPI_SPACETIME_SUBSCRIPTION_MODE").as_deref() {
            Some("native-websocket") => SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
            _ => SPACETIME_PROJECTION_SOURCE_HTTP_SQL,
        }
        .to_owned();
        SpacetimeProjectionPlan::new(
            mode,
            spacetimedb_websocket_endpoint(&self.url),
            self.database.clone(),
        )
        .for_subscription_mode(subscription_mode_from_env())
        .for_session(session_key, agent_id)
    }

    pub fn fallback_policy(&self) -> SpacetimeFallbackPolicy {
        fallback_policy_for_plan(&self.subscription_plan("", ""))
    }

    pub fn register_gateway(&self) -> Result<(), String> {
        self.client().register_gateway(
            &self.gateway_id,
            &self.installation_id,
            &self.workspace_root_hash,
            &self.endpoint,
            &self.protocol_version,
        )
    }

    pub fn heartbeat_gateway(&self) -> Result<(), String> {
        self.client().heartbeat_gateway(&self.gateway_id)
    }

    pub fn register_client(
        &self,
        client_id: &str,
        client_kind: &str,
        scopes: &[String],
    ) -> Result<(), String> {
        let scope_refs = scopes.iter().map(String::as_str).collect::<Vec<_>>();
        self.client().register_client(
            client_id,
            &self.installation_id,
            &self.gateway_id,
            client_kind,
            &scope_refs,
        )
    }

    pub fn projection_temporal_context(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> Result<Option<Value>, String> {
        self.client()
            .projection_temporal_context(session_key, agent_id)
    }

    pub async fn subscribe_projection(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> Result<SpacetimeProjectionSubscription, String> {
        require_nonempty(session_key, "session_key")?;
        require_nonempty(agent_id, "agent_id")?;
        let plan = self.subscription_plan(session_key, agent_id);
        // 13.T4 fallback discipline: if the plan resolves to anything other
        // than native-websocket, refuse explicitly. This is the central
        // refuse-to-fall-back-silently gate — callers MUST observe the error,
        // signal `SpacetimeFallbackPolicy::FallbackActive` upstream, and route
        // through the HTTP SQL polling client. There is NO code path here
        // where native subscription quietly downgrades to HTTP behind the
        // caller's back.
        if plan.mode != SPACETIME_PROJECTION_SOURCE_NATIVE_WS {
            return Err(format!(
                "spacetimedb subscription mode is {}; set EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket (silent HTTP fallback is forbidden: {SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN})",
                plan.mode
            ));
        }

        let mut request = plan
            .subscribe_url()
            .into_client_request()
            .map_err(|err| format!("spacetimedb websocket request failed: {err}"))?;
        request.headers_mut().insert(
            "sec-websocket-protocol",
            "v1.json.spacetimedb"
                .parse()
                .map_err(|err| format!("invalid websocket subprotocol header: {err}"))?,
        );

        let (mut socket, _) = connect_async(request)
            .await
            .map_err(|err| format!("spacetimedb websocket connect failed: {err}"))?;
        socket
            .send(Message::Text(plan.subscribe_multi_message().to_string()))
            .await
            .map_err(|err| format!("spacetimedb subscribe message failed: {err}"))?;

        Ok(SpacetimeProjectionSubscription {
            socket,
            agent_id: agent_id.to_owned(),
            resync: SpacetimeProjectionResyncTracker::default(),
        })
    }

    pub fn client(&self) -> SpacetimePresence {
        SpacetimePresence::for_database(&self.url, &self.database)
    }
}

impl SpacetimeProjectionSubscription {
    pub fn mark_connection_lost(&mut self) -> SpacetimeProjectionUpdate {
        self.resync.mark_connection_lost()
    }

    pub fn mark_reconnecting(&mut self) -> SpacetimeProjectionUpdate {
        self.resync.mark_reconnecting()
    }

    pub fn mark_degraded_but_subscribable(&mut self) -> SpacetimeProjectionUpdate {
        self.resync.mark_degraded_but_subscribable()
    }

    pub async fn next_update(&mut self) -> Result<Option<SpacetimeProjectionUpdate>, String> {
        while let Some(message) = self.socket.next().await {
            let message = match message {
                Ok(message) => message,
                Err(err) => {
                    let update = self.resync.mark_connection_lost();
                    return Err(format!(
                        "spacetimedb websocket receive failed after {:?}: {err}",
                        update.state
                    ));
                }
            };
            if !message.is_text() {
                continue;
            }
            let raw = message
                .to_text()
                .map_err(|err| format!("spacetimedb text frame failed: {err}"))?;
            let value = serde_json::from_str::<Value>(raw)
                .map_err(|err| format!("spacetimedb websocket frame was not JSON: {err}"))?;
            if let Some(context) =
                projection_context_from_subscription_message(&value, &self.agent_id)?
            {
                return Ok(Some(self.resync.observe_context(context)));
            }
        }
        self.resync.mark_connection_lost();
        Ok(None)
    }

    pub async fn next_context(&mut self) -> Result<Option<Value>, String> {
        Ok(self.next_update().await?.and_then(|update| update.context))
    }

    /// Typed delta surface — 03.T3 deliverable; preserved through the 13.T4
    /// extraction. Decodes the next SpaceTimeDB subscription frame into a
    /// `SpacetimeProjectionDelta` so consumers can dispatch on `message_kind`
    /// and per-surface table identity. Skips non-text and Unknown frames;
    /// surfaces decoder errors instead of silently dropping them.
    pub async fn next_delta(
        &mut self,
    ) -> Result<Option<epi_s3_gateway_contract::SpacetimeProjectionDelta>, String> {
        while let Some(message) = self.socket.next().await {
            let message = match message {
                Ok(message) => message,
                Err(err) => {
                    self.resync.mark_connection_lost();
                    return Err(format!(
                        "spacetimedb websocket receive failed during next_delta: {err}"
                    ));
                }
            };
            if !message.is_text() {
                continue;
            }
            let raw = message
                .to_text()
                .map_err(|err| format!("spacetimedb text frame failed: {err}"))?;
            let value = serde_json::from_str::<Value>(raw)
                .map_err(|err| format!("spacetimedb websocket frame was not JSON: {err}"))?;
            let delta = epi_s3_gateway_contract::SpacetimeProjectionDelta::from_subscription_message(
                &value,
            )?;
            if matches!(
                delta.message_kind,
                epi_s3_gateway_contract::SpacetimeMessageKind::Unknown
            ) {
                // IdentityToken/Ping/server-control — skip and read the next.
                continue;
            }
            return Ok(Some(delta));
        }
        self.resync.mark_connection_lost();
        Ok(None)
    }
}

pub fn readiness_value(port: u16, state_root: &Path) -> Value {
    match SpacetimeRegistration::from_env(port, state_root) {
        Ok(Some(registration)) => registration.readiness_value(),
        Ok(None) => json!({
            "ok": false,
            "configured": false,
            "registrationMode": "disabled",
            "fallbackPolicy": SpacetimeFallbackPolicy::Disabled,
            "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
            "reason": "set SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL to enable live projection",
            "projectionTables": SPACETIME_PROJECTION_TABLES,
            "liteProjectionTables": SPACETIME_LITE_PROJECTION_TABLES,
            "fullProjectionTables": SPACETIME_FULL_PROJECTION_TABLES,
            "capabilityFacts": projection_capability_facts(
                false,
                &SpacetimeProjectionPlan::http_sql("", "")
                    .for_subscription_mode(subscription_mode_from_env())
            ),
            "rawServiceHealth": "not configured",
            "agentAccess": "not registered",
            "subscriptionReadiness": "disabled until SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL is set",
        }),
        Err(error) => json!({
            "ok": false,
            "configured": false,
            "registrationMode": "invalid",
            "fallbackPolicy": SpacetimeFallbackPolicy::Disabled,
            "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
            "error": error,
            "subscriptionReadiness": "invalid SpaceTimeDB configuration",
        }),
    }
}

/// 13.T4 wrapper: `DEFAULT_GATEWAY_PORT`-rooted readiness value. Kept as a
/// stable surface for S0 startup wiring.
pub fn readiness_value_default(state_root: &Path) -> Value {
    readiness_value(DEFAULT_GATEWAY_PORT, state_root)
}

fn spacetimedb_websocket_endpoint(url: &str) -> String {
    if let Some(rest) = url.strip_prefix("https://") {
        format!("wss://{}", rest.trim_end_matches('/'))
    } else if let Some(rest) = url.strip_prefix("http://") {
        format!("ws://{}", rest.trim_end_matches('/'))
    } else {
        url.trim_end_matches('/').to_owned()
    }
}

fn subscription_mode_from_env() -> &'static str {
    match optional_env("EPI_SPACETIME_SUBSCRIPTION_PROFILE").as_deref() {
        Some(SPACETIME_PROJECTION_MODE_FULL) => SPACETIME_PROJECTION_MODE_FULL,
        _ => SPACETIME_PROJECTION_MODE_LITE,
    }
}

fn projection_capability_facts(native_ready: bool, plan: &SpacetimeProjectionPlan) -> Value {
    let full_mode = plan.subscription_mode == SPACETIME_PROJECTION_MODE_FULL;
    json!({
        "rawServiceConfigured": !plan.endpoint.is_empty(),
        "nativeWebsocketPreferred": plan.mode == SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
        "nativeWebsocketSubscribable": native_ready,
        "httpSqlFallbackAvailable": true,
        "liteProjectionSubscribable": plan.tables.iter().any(|table| table == "session_surface")
            && plan.tables.iter().any(|table| table == "kairos_surface")
            && plan.tables.iter().any(|table| table == "global_temporal_surface"),
        "fullProjectionRequested": full_mode,
        "presenceProjectionIncluded": full_mode && plan.tables.iter().any(|table| table == "agent_instance"),
        "sharedEventProjectionIncluded": full_mode && plan.tables.iter().any(|table| table == "temporal_event"),
        "kernelTraceProjectionIncluded": plan.tables.iter().any(|table| table == "session_surface"),
        "temporalContextProjectionIncluded": plan.tables.iter().any(|table| table == "global_temporal_surface"),
        "observabilityEventsIncluded": full_mode && plan.tables.iter().any(|table| table == "temporal_event"),
        "privacySafePublicProjection": true,
        "resyncStates": [
            "connection-lost",
            "reconnecting",
            "stale-profile",
            "resynced-profile-generation",
            "degraded-but-subscribable"
        ]
    })
}

// =============================================================================
// SpacetimePresence: HTTP reducer client + projection SQL fallback
// =============================================================================

#[derive(Debug, Clone)]
pub struct SpacetimePresence {
    url: String,
    database: String,
}

impl SpacetimePresence {
    /// Create a new SpacetimePresence client pointing at the given SpacetimeDB URL.
    /// Default local URL: "http://localhost:3000"
    pub fn new(url: &str) -> Self {
        Self::for_database(url, "epi-logos-runtime")
    }

    pub fn for_database(url: &str, database: &str) -> Self {
        Self {
            url: url.trim_end_matches('/').to_owned(),
            database: database.to_owned(),
        }
    }

    pub fn url(&self) -> &str {
        &self.url
    }

    pub fn database(&self) -> &str {
        &self.database
    }

    pub fn register_gateway(
        &self,
        gateway_id: &str,
        installation_id: &str,
        workspace_root_hash: &str,
        endpoint: &str,
        protocol_version: &str,
    ) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(workspace_root_hash, "workspace_root_hash")?;
        require_nonempty(endpoint, "endpoint")?;
        self.post_reducer(
            "register_gateway",
            json!([
                gateway_id,
                installation_id,
                workspace_root_hash,
                endpoint,
                protocol_version,
            ]),
        )
    }

    pub fn heartbeat_gateway(&self, gateway_id: &str) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        self.post_reducer("heartbeat_gateway", json!([gateway_id]))
    }

    pub fn register_agent(
        &self,
        agent_instance_id: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_id: &str,
        agent_kind: &str,
        session_key: &str,
        capability_surface_hash: &str,
    ) -> Result<(), String> {
        require_nonempty(agent_instance_id, "agent_instance_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(agent_id, "agent_id")?;
        self.post_reducer(
            "register_agent",
            json!([
                agent_instance_id,
                installation_id,
                gateway_id,
                agent_id,
                agent_kind,
                session_key,
                capability_surface_hash,
            ]),
        )
    }

    pub fn register_client(
        &self,
        client_id: &str,
        installation_id: &str,
        gateway_id: &str,
        client_kind: &str,
        scopes: &[&str],
    ) -> Result<(), String> {
        require_nonempty(client_id, "client_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(client_kind, "client_kind")?;
        self.post_reducer(
            "register_client",
            json!([
                client_id,
                installation_id,
                gateway_id,
                client_kind,
                scopes.join(","),
            ]),
        )
    }

    pub fn bind_session_temporal_context(
        &self,
        session_key: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_instance_id: &str,
        day_id: &str,
        now_path: &str,
        now_wikilink: &str,
        history_archive_path: &str,
        redis_session_now_key: &str,
        redis_day_context_key: &str,
        graphiti_arc_id: &str,
        pratibimba_anchor_ref: &str,
        kairos_snapshot_id: &str,
        parent_session_key: &str,
        source_session_key: &str,
        source_session_kind: &str,
        runtime_cwd: &str,
        vault_root: &str,
        resource_loader_id: &str,
        retry_settlement_state: &str,
        diagnostics_json: &str,
        kernel_projection_json: &str,
    ) -> Result<(), String> {
        require_nonempty(session_key, "session_key")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(day_id, "day_id")?;
        self.post_reducer(
            "bind_session_temporal_context",
            json!([
                session_key,
                installation_id,
                gateway_id,
                agent_instance_id,
                day_id,
                now_path,
                now_wikilink,
                history_archive_path,
                redis_session_now_key,
                redis_day_context_key,
                graphiti_arc_id,
                pratibimba_anchor_ref,
                kairos_snapshot_id,
                parent_session_key,
                source_session_key,
                source_session_kind,
                runtime_cwd,
                vault_root,
                resource_loader_id,
                retry_settlement_state,
                diagnostics_json,
                kernel_projection_json,
            ]),
        )
    }

    pub fn bind_kairos_surface(
        &self,
        kairos_snapshot_id: &str,
        installation_id: &str,
        gateway_id: &str,
        day_id: &str,
        session_key: &str,
        available: bool,
        fresh: bool,
        dominant_sign: u8,
        dominant_element: u8,
        active_decan: u8,
        active_tattva: u8,
        planets: Value,
        source: &str,
    ) -> Result<(), String> {
        require_nonempty(kairos_snapshot_id, "kairos_snapshot_id")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(day_id, "day_id")?;
        self.post_reducer(
            "bind_kairos_surface",
            json!([
                kairos_snapshot_id,
                installation_id,
                gateway_id,
                day_id,
                session_key,
                available,
                fresh,
                dominant_sign,
                dominant_element,
                active_decan,
                active_tattva,
                planets.to_string(),
                source,
            ]),
        )
    }

    pub fn bind_global_temporal_surface(
        &self,
        surface_key: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_instance_id: &str,
        session_key: &str,
        day_id: &str,
        day_wikilink: &str,
        now_path: &str,
        now_wikilink: &str,
        now_lineage_key: &str,
        history_archive_path: &str,
        redis_session_now_key: &str,
        redis_day_context_key: &str,
        redis_global_context_key: &str,
        graphiti_namespace_ref: &str,
        graphiti_session_arc_id: &str,
        pratibimba_anchor_ref: &str,
        kairos_snapshot_id: &str,
        kernel_projection_json: &str,
    ) -> Result<(), String> {
        require_nonempty(surface_key, "surface_key")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(session_key, "session_key")?;
        require_nonempty(day_id, "day_id")?;
        self.post_reducer(
            "bind_global_temporal_surface",
            json!([
                surface_key,
                installation_id,
                gateway_id,
                agent_instance_id,
                session_key,
                day_id,
                day_wikilink,
                now_path,
                now_wikilink,
                now_lineage_key,
                history_archive_path,
                redis_session_now_key,
                redis_day_context_key,
                redis_global_context_key,
                graphiti_namespace_ref,
                graphiti_session_arc_id,
                pratibimba_anchor_ref,
                kairos_snapshot_id,
                kernel_projection_json,
            ]),
        )
    }

    pub fn publish_temporal_event(
        &self,
        installation_id: &str,
        gateway_id: &str,
        agent_instance_id: &str,
        session_key: &str,
        event_kind: &str,
        payload: Value,
    ) -> Result<(), String> {
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(event_kind, "event_kind")?;
        self.post_reducer(
            "publish_temporal_event",
            json!([
                installation_id,
                gateway_id,
                agent_instance_id,
                session_key,
                event_kind,
                payload.to_string(),
            ]),
        )
    }

    // =================== 03.T4 shared-cosmos reducer calls ===================

    /// Advance the authoritative shared world_clock. Inherits idempotent retry
    /// from `post_reducer`.
    pub fn advance_world_clock(
        &self,
        gateway_id: &str,
        tick: u64,
        source_now_ms: u64,
        dominant_aspect: u8,
        clock_kind: &str,
        kerykeion_state_hash: &str,
    ) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(clock_kind, "clock_kind")?;
        self.post_reducer(
            "advance_world_clock",
            json!([
                gateway_id,
                tick,
                source_now_ms,
                dominant_aspect,
                clock_kind,
                kerykeion_state_hash,
            ]),
        )
    }

    pub fn bind_pratibimba_presence(
        &self,
        identity_handle: &str,
        installation_id: &str,
        gateway_id: &str,
        session_key: &str,
        day_id: &str,
        quintessence_hash: &str,
        aspect_grid_cell: u32,
        present: bool,
    ) -> Result<(), String> {
        require_nonempty(identity_handle, "identity_handle")?;
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(day_id, "day_id")?;
        require_nonempty(quintessence_hash, "quintessence_hash")?;
        self.post_reducer(
            "bind_pratibimba_presence",
            json!([
                identity_handle,
                installation_id,
                gateway_id,
                session_key,
                day_id,
                quintessence_hash,
                aspect_grid_cell,
                present,
            ]),
        )
    }

    pub fn publish_shared_archetype_event(
        &self,
        installation_id: &str,
        gateway_id: &str,
        publisher_identity_handle: &str,
        day_id: &str,
        aspect_grid_cell: u32,
        event_kind: &str,
        payload: Value,
        opt_in_consent: bool,
    ) -> Result<(), String> {
        require_nonempty(installation_id, "installation_id")?;
        require_nonempty(gateway_id, "gateway_id")?;
        require_nonempty(publisher_identity_handle, "publisher_identity_handle")?;
        require_nonempty(day_id, "day_id")?;
        require_nonempty(event_kind, "event_kind")?;
        if !opt_in_consent {
            return Err(
                "publish_shared_archetype_event requires opt_in_consent = true".to_owned(),
            );
        }
        self.post_reducer(
            "publish_shared_archetype_event",
            json!([
                installation_id,
                gateway_id,
                publisher_identity_handle,
                day_id,
                aspect_grid_cell,
                event_kind,
                payload.to_string(),
                opt_in_consent,
            ]),
        )
    }

    pub fn detect_coincidences(
        &self,
        day_id: &str,
        aspect_grid_cell: u32,
        min_participants: u32,
    ) -> Result<(), String> {
        require_nonempty(day_id, "day_id")?;
        if min_participants < 2 {
            return Err("detect_coincidences min_participants must be >= 2".to_owned());
        }
        self.post_reducer(
            "detect_coincidences",
            json!([day_id, aspect_grid_cell, min_participants]),
        )
    }

    pub fn publish_module_version(&self, gateway_id: &str) -> Result<(), String> {
        require_nonempty(gateway_id, "gateway_id")?;
        self.post_reducer("publish_module_version", json!([gateway_id]))
    }

    pub fn publish_presence(&self, hash: &str, tick12: u8) -> Result<(), String> {
        require_nonempty(hash, "hash")?;
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            hash,
            "nara.presence",
            json!({ "hash": hash, "tick12": tick12 }),
        )
    }

    pub fn record_oracle_draw(&self, hash: &str, hexagram_id: u8) -> Result<(), String> {
        require_nonempty(hash, "hash")?;
        if hexagram_id > 63 {
            return Err("hexagram_id must be 0-63".to_string());
        }
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            hash,
            "nara.oracle_draw",
            json!({ "hash": hash, "hexagram_id": hexagram_id }),
        )
    }

    pub fn record_logos_stage(&self, hash: &str, stage: u8, day_key: &str) -> Result<(), String> {
        require_nonempty(hash, "hash")?;
        if stage > 5 {
            return Err("stage must be 0-5 (A-Logos through An-a-Logos)".to_string());
        }
        if day_key.len() != 10 {
            return Err("day_key must be YYYY-MM-DD format (10 chars)".to_string());
        }
        self.publish_temporal_event(
            "local",
            "nara",
            "",
            hash,
            "nara.logos_stage",
            json!({ "hash": hash, "stage": stage, "day_key": day_key }),
        )
    }

    pub fn projection_temporal_context(
        &self,
        session_key: &str,
        agent_id: &str,
    ) -> Result<Option<Value>, String> {
        require_nonempty(session_key, "session_key")?;
        require_nonempty(agent_id, "agent_id")?;
        let escaped_session = sql_string(session_key);
        let query = format!(
            "SELECT * FROM session_surface WHERE session_key = {escaped_session} LIMIT 1;\
             SELECT * FROM kairos_surface WHERE session_key = {escaped_session} LIMIT 1;\
             SELECT * FROM global_temporal_surface WHERE session_key = {escaped_session} LIMIT 1"
        );
        let result = self.sql(&query)?;
        projection_context_from_sql_result(&result, agent_id)
    }

    pub fn sql(&self, query: &str) -> Result<Value, String> {
        require_nonempty(query, "query")?;
        let url = format!("{}/v1/database/{}/sql", self.url, self.database);
        let query = query.to_owned();
        let response = run_blocking_http(move || {
            BlockingClient::new()
                .post(&url)
                .body(query)
                .send()
                .map_err(|err| format!("spacetimedb sql request failed: {err}"))
        })?;

        if response.status().is_success() {
            return response
                .json::<Value>()
                .map_err(|err| format!("spacetimedb sql response was not JSON: {err}"));
        }

        let status = response.status();
        let body = response
            .text()
            .unwrap_or_else(|_| "<unreadable body>".to_owned());
        Err(format!("spacetimedb sql request failed: {status} {body}"))
    }

    fn post_reducer(&self, reducer: &str, payload: Value) -> Result<(), String> {
        self.post_reducer_with_retry(reducer, payload, default_reducer_retry_policy())
    }

    /// 03.T3 deliverable: reducer post with bounded idempotent retry. All
    /// reducers in the epi-spacetime-module are pure inserts/upserts keyed by
    /// subject-identity (gateway_id, session_key, kairos_snapshot_id, …) so
    /// they are safe to replay.
    pub fn post_reducer_with_retry(
        &self,
        reducer: &str,
        payload: Value,
        policy: ReducerRetryPolicy,
    ) -> Result<(), String> {
        let url = format!(
            "{}/v1/database/{}/call/{}",
            self.url, self.database, reducer
        );
        let mut attempts: u32 = 0;
        let mut last_error: String = String::new();
        loop {
            attempts += 1;
            let reducer_name = reducer.to_owned();
            let url_attempt = url.clone();
            let payload_attempt = payload.clone();
            let response = run_blocking_http(move || {
                BlockingClient::new()
                    .post(&url_attempt)
                    .json(&payload_attempt)
                    .send()
                    .map_err(|err| {
                        format!("spacetimedb {reducer_name} request failed: {err}")
                    })
            });
            match response {
                Ok(response) => {
                    let status = response.status();
                    if status.is_success() {
                        return Ok(());
                    }
                    let body = response
                        .text()
                        .unwrap_or_else(|_| "<unreadable body>".to_owned());
                    last_error = format!(
                        "spacetimedb {reducer} request failed: {status} {body}"
                    );
                    // 4xx (other than 408/429) is not retryable — these are
                    // contract violations the caller must fix.
                    let retryable = status.is_server_error()
                        || status.as_u16() == 408
                        || status.as_u16() == 429;
                    if !retryable {
                        return Err(last_error);
                    }
                }
                Err(err) => {
                    last_error = err;
                }
            }
            if attempts >= policy.max_attempts {
                return Err(format!(
                    "{last_error} (gave up after {attempts} attempt(s))",
                ));
            }
            std::thread::sleep(policy.backoff(attempts));
        }
    }
}

/// Retry policy for reducer posts. Bounded attempts with linear backoff so
/// transient failures (e.g. SpaceTimeDB still booting, momentary 503) recover
/// without unbounded blocking.
#[derive(Debug, Clone, Copy)]
pub struct ReducerRetryPolicy {
    pub max_attempts: u32,
    pub base_backoff_ms: u64,
}

impl ReducerRetryPolicy {
    pub fn backoff(&self, attempt: u32) -> std::time::Duration {
        std::time::Duration::from_millis(self.base_backoff_ms.saturating_mul(attempt as u64))
    }
}

fn default_reducer_retry_policy() -> ReducerRetryPolicy {
    ReducerRetryPolicy {
        max_attempts: 3,
        base_backoff_ms: 50,
    }
}

fn run_blocking_http<T, F>(operation: F) -> Result<T, String>
where
    F: FnOnce() -> Result<T, String> + Send + 'static,
    T: Send + 'static,
{
    if tokio::runtime::Handle::try_current().is_ok() {
        return std::thread::spawn(operation)
            .join()
            .map_err(|_| "blocking SpacetimeDB HTTP worker panicked".to_owned())?;
    }

    operation()
}

// =============================================================================
// projection context hydration (SQL + native WebSocket)
// =============================================================================

pub fn projection_context_from_sql_result(
    result: &Value,
    agent_id: &str,
) -> Result<Option<Value>, String> {
    let statements = result.as_array().ok_or_else(|| {
        "spacetimedb sql response must be an array of statement results".to_owned()
    })?;
    let Some(session_row) = statements
        .first()
        .and_then(|statement| statement.get("rows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first())
    else {
        return Ok(None);
    };
    let kairos_row = statements
        .get(1)
        .and_then(|statement| statement.get("rows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first());
    let global_row = statements
        .get(2)
        .and_then(|statement| statement.get("rows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first());

    let session_key = row_string(session_row, "session_key", "sessionKey", "");
    let day_id = row_string(session_row, "day_id", "dayId", "unknown-day");
    let now_path = row_string(session_row, "now_path", "nowPath", "");
    let now_wikilink = row_string(session_row, "now_wikilink", "nowWikilink", "");
    let history_archive_path = row_string(
        session_row,
        "history_archive_path",
        "historyArchivePath",
        "",
    );
    let redis_session_now_key = row_string(
        session_row,
        "redis_session_now_key",
        "redisSessionNowKey",
        "",
    );
    let redis_day_context_key = row_string(
        session_row,
        "redis_day_context_key",
        "redisDayContextKey",
        "",
    );
    let graphiti_arc_id = row_string(session_row, "graphiti_arc_id", "graphitiArcId", "");
    let pratibimba_anchor_ref = row_string(
        session_row,
        "pratibimba_anchor_ref",
        "pratibimbaAnchorRef",
        "",
    );
    let active_agent_id = row_string(session_row, "active_agent_id", "activeAgentId", "");
    let resource_loader_id =
        row_string(session_row, "resource_loader_id", "resourceLoaderId", "");
    let runtime_cwd = row_string(session_row, "runtime_cwd", "runtimeCwd", "");
    let source_session_key =
        row_string(session_row, "source_session_key", "sourceSessionKey", "");
    let source_session_kind =
        row_string(session_row, "source_session_kind", "sourceSessionKind", "");
    let graphiti_namespace_ref = pratibimba_anchor_ref.clone();
    let _kairos_snapshot_id =
        row_string(session_row, "kairos_snapshot_id", "kairosSnapshotId", "");
    let session_id =
        session_id_from_now_path(&now_path).unwrap_or_else(|| session_key.to_owned());
    let global_surface_key = global_row
        .map(|row| row_string(row, "surface_key", "surfaceKey", ""))
        .unwrap_or_else(|| {
            global_temporal_surface_key(
                &row_string(session_row, "installation_id", "installationId", "local"),
                &row_string(session_row, "gateway_id", "gatewayId", "gateway-main"),
                &session_key,
            )
        });
    let global_redis_key = global_row
        .map(|row| row_string(row, "redis_global_context_key", "redisGlobalContextKey", ""))
        .unwrap_or_else(|| {
            redis_global_context_key(
                &row_string(session_row, "installation_id", "installationId", "local"),
                &row_string(session_row, "gateway_id", "gatewayId", "gateway-main"),
                &day_id,
            )
        });
    let global_graphiti_namespace = global_row
        .map(|row| row_string(row, "graphiti_namespace_ref", "graphitiNamespaceRef", ""))
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| graphiti_namespace_ref.clone());
    let global_graphiti_arc = global_row
        .map(|row| row_string(row, "graphiti_session_arc_id", "graphitiSessionArcId", ""))
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| graphiti_arc_id.clone());
    let kernel_projection = kernel_projection_from_rows(session_row, global_row);

    let planets = kairos_row
        .map(|row| row_string(row, "planets_json", "planetsJson", "[]"))
        .and_then(|raw| serde_json::from_str::<Value>(&raw).ok())
        .unwrap_or_else(|| json!([]));

    Ok(Some(json!({
        "coordinateOwner": "S3'",
        "agentAccessOwner": "S4/S5",
        "session": {
            "canonicalKey": session_key,
            "sessionId": session_id,
            "activeAgentId": if active_agent_id.is_empty() {
                Value::Null
            } else {
                Value::String(active_agent_id)
            },
            "resourceLoaderId": if resource_loader_id.is_empty() {
                Value::Null
            } else {
                Value::String(resource_loader_id)
            },
            "runtimeCwd": if runtime_cwd.is_empty() {
                Value::Null
            } else {
                Value::String(runtime_cwd)
            },
            "sourceSessionKey": if source_session_key.is_empty() {
                Value::Null
            } else {
                Value::String(source_session_key)
            },
            "sourceSessionKind": if source_session_kind.is_empty() {
                Value::Null
            } else {
                Value::String(source_session_kind)
            },
            "requestedAgentId": agent_id,
        },
        "day": {
            "dayId": day_id,
            "wikilink": if day_id == "unknown-day" {
                Value::Null
            } else {
                Value::String(format!("[[{day_id}]]"))
            },
        },
        "now": {
            "path": now_path,
            "wikilink": now_wikilink,
            "content": Value::Null,
        },
        "history": {
            "archivePath": history_archive_path,
        },
        "kernel": kernel_projection.clone(),
        "redis": {
            "namespace": "s3:gateway:temporal",
            "sessionNowKey": redis_session_now_key,
            "dayContextKey": redis_day_context_key,
            "hydrated": true,
        },
        "spacetimedb": {
            "projectionSource": "http-sql-poll",
            "projectionTable": "session_surface",
            "kairosProjectionTable": "kairos_surface",
            "globalProjectionTable": "global_temporal_surface",
        },
        "globalTemporal": {
            "coordinateOwner": "S3'",
            "agentAccessOwner": "S4/S5",
            "projectionTable": "global_temporal_surface",
            "surfaceKey": global_surface_key,
            "installationId": global_row
                .map(|row| row_string(row, "installation_id", "installationId", ""))
                .unwrap_or_else(|| row_string(session_row, "installation_id", "installationId", "")),
            "gatewayId": global_row
                .map(|row| row_string(row, "gateway_id", "gatewayId", ""))
                .unwrap_or_else(|| row_string(session_row, "gateway_id", "gatewayId", "")),
            "sessionKey": session_key,
            "dayId": global_row
                .map(|row| row_string(row, "day_id", "dayId", "unknown-day"))
                .unwrap_or_else(|| day_id.clone()),
            "dayWikilink": global_row
                .map(|row| row_string(row, "day_wikilink", "dayWikilink", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| if day_id == "unknown-day" { String::new() } else { format!("[[{day_id}]]") }),
            "nowPath": global_row
                .map(|row| row_string(row, "now_path", "nowPath", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| now_path.clone()),
            "nowWikilink": global_row
                .map(|row| row_string(row, "now_wikilink", "nowWikilink", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| now_wikilink.clone()),
            "nowLineageKey": global_row
                .map(|row| row_string(row, "now_lineage_key", "nowLineageKey", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| session_key.clone()),
            "historyArchivePath": global_row
                .map(|row| row_string(row, "history_archive_path", "historyArchivePath", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| history_archive_path.clone()),
            "redisGlobalContextKey": global_redis_key,
            "graphitiNamespaceRef": if global_graphiti_namespace.is_empty() {
                Value::Null
            } else {
                Value::String(global_graphiti_namespace)
            },
            "graphitiSessionArcId": global_graphiti_arc,
            "pratibimbaAnchorRef": if pratibimba_anchor_ref.is_empty() {
                Value::Null
            } else {
                Value::String(pratibimba_anchor_ref.clone())
            },
            "kairosSnapshotId": global_row
                .map(|row| row_string(row, "kairos_snapshot_id", "kairosSnapshotId", ""))
                .filter(|value| !value.is_empty())
                .unwrap_or_else(|| row_string(session_row, "kairos_snapshot_id", "kairosSnapshotId", "")),
            "kernelProjectionJson": kernel_projection.to_string(),
            "privacy": global_row
                .map(|row| row_string(row, "privacy_class", "privacyClass", "safe-live-projection"))
                .unwrap_or_else(|| "safe-live-projection".to_owned()),
        },
        "kairos": {
            "available": kairos_row
                .map(|row| row_bool(row, "available", "available", false))
                .unwrap_or(false),
            "fresh": kairos_row
                .map(|row| row_bool(row, "fresh", "fresh", false))
                .unwrap_or(false),
            "source": kairos_row
                .map(|row| row_string(row, "source", "source", "nara.kairos.current"))
                .unwrap_or_else(|| "nara.kairos.current".to_owned()),
            "dominantSign": kairos_row
                .map(|row| row_u64(row, "dominant_sign", "dominantSign", 0))
                .unwrap_or(0),
            "dominantElement": kairos_row
                .map(|row| row_u64(row, "dominant_element", "dominantElement", 0))
                .unwrap_or(0),
            "activeDecan": kairos_row
                .map(|row| row_u64(row, "active_decan", "activeDecan", 0))
                .unwrap_or(0),
            "activeTattva": kairos_row
                .map(|row| row_u64(row, "active_tattva", "activeTattva", 0))
                .unwrap_or(0),
            "planets": planets,
            "privacy": "public-current-transit-only",
        },
        "pratibimba": {
            "available": !pratibimba_anchor_ref.is_empty(),
            "anchorId": if pratibimba_anchor_ref.is_empty() {
                Value::Null
            } else {
                Value::String(pratibimba_anchor_ref.to_owned())
            },
            "coordinate": "M4.4.4.4",
            "graphitiNamespaceRef": if pratibimba_anchor_ref.is_empty() {
                Value::Null
            } else {
                Value::String(pratibimba_anchor_ref)
            },
            "layerPresenceSummary": {
                "presentCount": Value::Null,
                "detail": "projection-anchor-only",
                "protectedSource": "local-nara-profile",
            },
            "localProtectedGraphOwner": "S2/S5",
            "stewardshipOwner": "S5'",
            "mutationOwner": "Epii/user validation",
            "mutationBoundary": "identity-affecting changes require Epii/user validation; live projections carry references only",
            "privacy": "protected-reference-only",
        },
        "graphiti": {
            "runtimeOwner": "S3'",
            "invocationOwner": "S5/S5'",
            "sessionArcId": graphiti_arc_id,
            "namespaceRef": if graphiti_arc_id.is_empty() {
                Value::Null
            } else {
                Value::String(graphiti_namespace_ref)
            },
        },
    })))
}

pub fn projection_context_from_subscription_message(
    message: &Value,
    agent_id: &str,
) -> Result<Option<Value>, String> {
    let rows = SpacetimeProjectionRows::from_subscription_message(message)?;
    let Some(session_row) = rows.session else {
        return Ok(None);
    };
    let result = json!([
        {
            "schema": {},
            "rows": [session_row]
        },
        {
            "schema": {},
            "rows": rows.kairos.into_iter().collect::<Vec<_>>()
        },
        {
            "schema": {},
            "rows": rows.global.into_iter().collect::<Vec<_>>()
        }
    ]);
    projection_context_from_sql_result(&result, agent_id).map(|context| {
        context.map(|mut value| {
            value["spacetimedb"]["projectionSource"] = json!("native-websocket");
            value
        })
    })
}

// =============================================================================
// shared helpers (lifted from S0)
// =============================================================================

fn row_string(row: &Value, snake: &str, camel: &str, fallback: &str) -> String {
    row.get(snake)
        .or_else(|| row.get(camel))
        .and_then(Value::as_str)
        .unwrap_or(fallback)
        .to_owned()
}

fn row_bool(row: &Value, snake: &str, camel: &str, fallback: bool) -> bool {
    row.get(snake)
        .or_else(|| row.get(camel))
        .and_then(Value::as_bool)
        .unwrap_or(fallback)
}

fn row_u64(row: &Value, snake: &str, camel: &str, fallback: u64) -> u64 {
    row.get(snake)
        .or_else(|| row.get(camel))
        .and_then(Value::as_u64)
        .unwrap_or(fallback)
}

fn sql_string(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
}

fn session_id_from_now_path(path: &str) -> Option<String> {
    let parts = path.split('/').collect::<Vec<_>>();
    let empty_idx = parts.iter().position(|part| *part == "Empty")?;
    if parts.get(empty_idx + 1).copied() != Some("Present") {
        return None;
    }
    parts.get(empty_idx + 3).map(|value| (*value).to_owned())
}

fn optional_env(key: &str) -> Option<String> {
    std::env::var(key)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

fn workspace_root_hash(state_root: &Path) -> String {
    let workspace = optional_env("EPI_REPO_ROOT")
        .or_else(|| {
            std::env::current_dir()
                .ok()
                .map(|path| path.display().to_string())
        })
        .unwrap_or_else(|| state_root.display().to_string());
    let mut hasher = Sha256::new();
    hasher.update(workspace.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn agent_instance_id(gateway_id: &str, agent_id: &str, session_id: &str) -> String {
    format!("{gateway_id}:{agent_id}:{session_id}")
}

pub fn global_temporal_surface_key(
    installation_id: &str,
    gateway_id: &str,
    session_key: &str,
) -> String {
    format!("{installation_id}:{gateway_id}:{session_key}")
}

pub fn redis_global_context_key(installation_id: &str, gateway_id: &str, day_id: &str) -> String {
    format!("s3:gateway:temporal:global:{installation_id}:{gateway_id}:day:{day_id}")
}

pub fn day_wikilink(day_id: &str) -> String {
    if day_id == "unknown-day" {
        String::new()
    } else {
        format!("[[{day_id}]]")
    }
}

pub fn capability_surface_hash(agent_id: &str, session_key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(agent_id.as_bytes());
    hasher.update(b":");
    hasher.update(session_key.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn agent_kind(agent_id: &str) -> String {
    match agent_id {
        "epii" => "epii",
        "anima" => "anima",
        value if value.starts_with("subagent:") => "subagent",
        _ => "pi-agent",
    }
    .to_owned()
}

pub fn string_at<'a>(value: &'a Value, pointer: &str, fallback: &'a str) -> &'a str {
    value
        .pointer(pointer)
        .and_then(Value::as_str)
        .unwrap_or(fallback)
}

pub fn kairos_snapshot_id(context: &Value) -> String {
    let day_id = string_at(context, "/day/dayId", "unknown-day");
    let session_id = string_at(context, "/session/sessionId", "unknown-session");
    format!("kairos-{day_id}-{session_id}")
}

fn kernel_projection_from_rows(session_row: &Value, global_row: Option<&Value>) -> Value {
    for row in [global_row, Some(session_row)].into_iter().flatten() {
        let raw = row_string(row, "kernel_projection_json", "kernelProjectionJson", "");
        if raw.trim().is_empty() {
            continue;
        }
        if let Ok(value) = serde_json::from_str::<Value>(&raw) {
            if value.is_object() {
                return value;
            }
        }
    }
    // Fallback empty kernel projection when no row carries one; the S0
    // wrapper supplies a temporal::kernel_surface_value() before reducer
    // calls, so this is only used when decoding stale or partial rows.
    json!({
        "coordinateOwner": "S0/QL-meta",
        "projectionOwner": "S3'",
        "privacy": "safe-public-current-kernel-tick",
        "computationSource": "portal-core::KernelProjection",
        "generation": 0,
    })
}

fn require_nonempty(value: &str, field: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err(format!("{field} must not be empty"));
    }
    Ok(())
}

/// 03.T4: derive the canonical quintessence_hash. The hash is a BLAKE3
/// indexing fingerprint over canonical quaternionic bytes + caps — NOT the
/// identity itself. Hex-encoded for stable transport over JSON RPC.
pub fn quintessence_hash_blake3(canonical_quaternionic_bytes: &[u8]) -> String {
    blake3::hash(canonical_quaternionic_bytes).to_hex().to_string()
}

/// 03.T4: derive a public-safe `identity_handle` from raw identity bytes via
/// BLAKE3. The handle is a one-way fingerprint suitable for use as the
/// primary key of `pratibimba_presence` — the raw identity NEVER leaves the
/// caller's process.
pub fn identity_handle_blake3(canonical_identity_bytes: &[u8]) -> String {
    blake3::hash(canonical_identity_bytes).to_hex().to_string()
}

// =============================================================================
// 13.T4 envelope helpers — proves both s3'.temporal.subscribe AND
// s3'.spacetime.subscribe emit the same SpacetimeSubscriptionLifecycleEnvelope
// type with method carried verbatim.
// =============================================================================

/// Project the resync update into the canonical S3-owned
/// `SpacetimeSubscriptionLifecycleEnvelope`. Both subscribe methods share
/// this projection: pass the desired `method` (one of
/// `SPACETIME_SUBSCRIBE_METHOD`, `SPACETIME_SUBSCRIBE_ALIAS_METHOD`) and the
/// update is wrapped under the same envelope type.
pub fn lifecycle_envelope_from_update(
    plan: &SpacetimeProjectionPlan,
    method: &str,
    update: &SpacetimeProjectionUpdate,
) -> epi_s3_gateway_contract::SpacetimeSubscriptionLifecycleEnvelope {
    let event = match update.state {
        SpacetimeProjectionConnectionState::Connected => "connected",
        SpacetimeProjectionConnectionState::ConnectionLost => "connection-lost",
        SpacetimeProjectionConnectionState::Reconnecting => "reconnecting",
        SpacetimeProjectionConnectionState::StaleProfile => "stale-profile",
        SpacetimeProjectionConnectionState::ResyncedProfileGeneration => {
            "resynced-profile-generation"
        }
        SpacetimeProjectionConnectionState::DegradedButSubscribable => "degraded-but-subscribable",
    };
    let mut payload = json!({
        "source": update.source,
        "profileGeneration": update.profile_generation,
        "staleProfileGeneration": update.stale_profile_generation,
        "resyncedProfileGeneration": update.resynced_profile_generation,
        "degradedButSubscribable": update.degraded_but_subscribable,
    });
    if let Some(context) = &update.context {
        payload["context"] = context.clone();
    }
    plan.lifecycle_envelope_for_method(method, event, payload)
}

/// Construct a `fallback-active` lifecycle envelope when the runtime degrades
/// from native WS to HTTP SQL polling. The envelope carries the explicit
/// `SpacetimeFallbackPolicy::FallbackActive` marker AND the
/// silent-fallback-forbidden sentinel so consumers know this is the EXPLICIT
/// degraded path — not a silent downgrade.
pub fn fallback_active_envelope(
    plan: &SpacetimeProjectionPlan,
    method: &str,
    reason: &str,
) -> epi_s3_gateway_contract::SpacetimeSubscriptionLifecycleEnvelope {
    let payload = json!({
        "fallbackPolicy": SpacetimeFallbackPolicy::FallbackActive,
        "silentFallbackForbiddenSentinel": SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN,
        "reason": reason,
    });
    plan.lifecycle_envelope_for_method(method, SPACETIME_FALLBACK_ACTIVE, payload)
}

/// 13.T4 audit helper: walk a JSON value and assert no nested string field
/// names the silent-HTTP-fallback sentinel as a `projectionSource` or
/// `fallbackPolicy`. The contract is that `silentFallbackForbiddenSentinel` is
/// allowed to NAME the sentinel (so consumers can audit) but no
/// `projectionSource` or `fallbackPolicy` may equal it. This is invoked by the
/// `silent_fallback_refused_is_never_emitted` test.
pub fn assert_no_silent_fallback_in_value(value: &Value) -> Result<(), String> {
    walk_value_for_silent_fallback(value, &mut String::new())
}

fn walk_value_for_silent_fallback(value: &Value, path: &mut String) -> Result<(), String> {
    match value {
        Value::Object(map) => {
            for (key, child) in map {
                let key_lower = key.to_ascii_lowercase();
                if matches!(
                    key_lower.as_str(),
                    "projectionsource" | "fallbackpolicy" | "fallback_policy"
                ) {
                    if let Some(s) = child.as_str() {
                        if s == SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN {
                            return Err(format!(
                                "silent-HTTP-fallback sentinel emitted as {key} at {path}.{key}"
                            ));
                        }
                    }
                }
                let pushed = path.len();
                if !path.is_empty() {
                    path.push('.');
                }
                path.push_str(key);
                walk_value_for_silent_fallback(child, path)?;
                path.truncate(pushed);
            }
            Ok(())
        }
        Value::Array(items) => {
            for (idx, child) in items.iter().enumerate() {
                let pushed = path.len();
                path.push_str(&format!("[{idx}]"));
                walk_value_for_silent_fallback(child, path)?;
                path.truncate(pushed);
            }
            Ok(())
        }
        _ => Ok(()),
    }
}

// =============================================================================
// 13.T4 path helper: state-root-rooted readiness wrapper for S0 wiring.
// =============================================================================

/// Convenience wrapper accepting a `PathBuf` so the S0 wiring layer can pass
/// its gate-root without converting borrow lifetimes. Delegates to
/// `readiness_value(port, state_root)`.
pub fn readiness_value_for_state_root(port: u16, state_root: PathBuf) -> Value {
    readiness_value(port, &state_root)
}
