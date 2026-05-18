use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s3_gateway_contract::{
    SpacetimeProjectionPlan, SpacetimeProjectionRows, DEFAULT_GATEWAY_PORT,
    SPACETIME_PROJECTION_SOURCE_HTTP_SQL, SPACETIME_PROJECTION_SOURCE_NATIVE_WS,
    SPACETIME_PROJECTION_TABLES,
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

use super::{
    sessions::{SessionRecord, SessionStore},
    system, temporal,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeEvent {
    pub kind: String,
    pub table: String,
    pub payload: Value,
    pub timestamp_ms: u128,
}

pub struct SpacetimeBridge {
    state_root: PathBuf,
}

pub fn publish_session_surface(state_root: &Path, record: &SessionRecord) -> Result<(), String> {
    let bridge = SpacetimeBridge::new(state_root)?;
    let temporal_context = temporal::hydrate_redis_for_record_on_propagation(
        state_root,
        record,
        &record.active_agent_id,
    )?;
    bridge.publish_session_record(
        record,
        record.aliases.first().map(String::as_str),
        temporal_context.as_ref(),
    )?;

    if let Some(registration) = SpacetimeRegistration::from_env(DEFAULT_GATEWAY_PORT, state_root)? {
        registration.register_session_agent(state_root, &record.canonical_key)?;
    }

    Ok(())
}

impl SpacetimeBridge {
    pub fn new(state_root: impl AsRef<Path>) -> Result<Self, String> {
        let state_root = state_root.as_ref().to_path_buf();
        fs::create_dir_all(event_path(&state_root).parent().unwrap())
            .map_err(|err| err.to_string())?;
        Ok(Self { state_root })
    }

    pub fn publish_presence(&self, operator_id: &str) -> Result<(), String> {
        let snapshot = system::presence(&self.state_root)?;
        self.append(
            "presence",
            "now_presence",
            json!({
                "operatorId": operator_id,
                "heartbeats": snapshot["heartbeats"].clone(),
                "events": snapshot["events"].clone(),
            }),
        )
    }

    pub fn register_gateway_instance(
        &self,
        gateway_id: &str,
        installation_id: &str,
        workspace_root_hash: &str,
        endpoint: &str,
        protocol_version: &str,
    ) -> Result<(), String> {
        self.append(
            "gateway_registration",
            "gateway_instance",
            json!({
                "gatewayId": gateway_id,
                "installationId": installation_id,
                "workspaceRootHash": workspace_root_hash,
                "endpoint": endpoint,
                "protocolVersion": protocol_version,
                "status": "online",
            }),
        )
    }

    pub fn register_agent_instance(
        &self,
        agent_instance_id: &str,
        installation_id: &str,
        gateway_id: &str,
        agent_id: &str,
        agent_kind: &str,
        session_key: &str,
        capability_surface_hash: &str,
    ) -> Result<(), String> {
        self.append(
            "agent_registration",
            "agent_instance",
            json!({
                "agentInstanceId": agent_instance_id,
                "installationId": installation_id,
                "gatewayId": gateway_id,
                "agentId": agent_id,
                "agentKind": agent_kind,
                "sessionKey": session_key,
                "capabilitySurfaceHash": capability_surface_hash,
                "status": "online",
            }),
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
        self.append(
            "client_registration",
            "client_registration",
            json!({
                "clientId": client_id,
                "installationId": installation_id,
                "gatewayId": gateway_id,
                "clientKind": client_kind,
                "scopes": scopes,
                "status": "online",
            }),
        )
    }

    pub fn publish_session(&self, identifier: &str, now_alias: Option<&str>) -> Result<(), String> {
        let store = SessionStore::new(&self.state_root)?;
        let record = store.resolve(identifier)?;
        self.publish_session_record(&record, now_alias, None)
    }

    pub fn publish_session_record(
        &self,
        record: &SessionRecord,
        now_alias: Option<&str>,
        temporal_context: Option<&Value>,
    ) -> Result<(), String> {
        let default_temporal_context =
            temporal::context_for_record(&self.state_root, record, &record.active_agent_id);
        let temporal_context = temporal_context.unwrap_or(&default_temporal_context);
        let mut payload = json!({
            "canonicalKey": record.canonical_key,
            "aliases": record.aliases,
            "label": record.label,
            "sessionId": temporal_context["session"]["sessionId"].clone(),
            "recordSessionId": record.session_id,
            "dayId": temporal_context["day"]["dayId"].clone(),
            "parentSessionKey": record.parent_session_key,
            "sourceSessionKey": record.source_session_key,
            "sourceSessionKind": record.source_session_kind,
            "runtimeCwd": record.runtime_cwd,
            "vaultRoot": record.vault_root,
            "resourceLoaderId": record.resource_loader_id,
            "retrySettlementState": record.retry_settlement_state,
            "diagnostics": record.diagnostics,
            "dayWikilink": temporal_context["day"]["wikilink"].clone(),
            "vaultNowPath": temporal_context["now"]["path"].clone(),
            "nowWikilink": temporal_context["now"]["wikilink"].clone(),
            "history": temporal_context["history"].clone(),
            "redisTemporalContext": temporal_context["redis"].clone(),
            "kairos": temporal_context["kairos"].clone(),
            "kernel": temporal_context["kernel"].clone(),
            "pratibimba": temporal_context["pratibimba"].clone(),
            "graphiti": temporal_context["graphiti"].clone(),
            "activeAgentId": record.active_agent_id,
            "subagentLineage": record.subagent_lineage,
            "workspaceRoot": record.workspace_root,
            "bootstrapScope": record.bootstrap_scope,
            "teamId": record.team_id,
            "teamRole": record.team_role,
            "orchestrationKind": record.orchestration_kind,
            "cmuxWorkspace": record.cmux_workspace,
            "cmuxSurface": record.cmux_surface,
            "cmuxPaneId": record.cmux_pane_id,
        });

        if let Some(alias) = now_alias {
            payload["nowAlias"] = json!(alias);
        }

        self.append("session_surface", "session_surface", payload)?;
        self.publish_global_temporal_record(record, temporal_context)
    }

    fn publish_global_temporal_record(
        &self,
        record: &SessionRecord,
        temporal_context: &Value,
    ) -> Result<(), String> {
        let day_id = string_at(temporal_context, "/day/dayId", "unknown-day");
        let installation_id =
            optional_env("EPI_INSTALLATION_ID").unwrap_or_else(|| "install-local".to_owned());
        let gateway_id =
            optional_env("EPI_GATEWAY_ID").unwrap_or_else(|| "gateway-main".to_owned());
        let redis_global_context_key =
            redis_global_context_key(&installation_id, &gateway_id, day_id);
        let payload = json!({
            "coordinateOwner": "S3'",
            "agentAccessOwner": "S4/S5",
            "surfaceKey": global_temporal_surface_key(&installation_id, &gateway_id, &record.canonical_key),
            "installationId": installation_id,
            "gatewayId": gateway_id,
            "sessionKey": record.canonical_key,
            "agentId": record.active_agent_id,
            "dayId": day_id,
            "dayWikilink": temporal_context["day"]["wikilink"].clone(),
            "nowPath": temporal_context["now"]["path"].clone(),
            "nowWikilink": temporal_context["now"]["wikilink"].clone(),
            "nowLineageKey": record.canonical_key,
            "historyArchivePath": temporal_context["history"]["archivePath"].clone(),
            "redis": {
                "sessionNowKey": temporal_context["redis"]["sessionNowKey"].clone(),
                "dayContextKey": temporal_context["redis"]["dayContextKey"].clone(),
                "globalContextKey": redis_global_context_key,
                "hydrated": temporal_context["redis"]["hydrated"].clone(),
            },
            "kairosSnapshotId": kairos_snapshot_id(temporal_context),
            "kairos": temporal_context["kairos"].clone(),
            "kernel": temporal_context["kernel"].clone(),
            "pratibimba": temporal_context["pratibimba"].clone(),
            "graphiti": {
                "runtimeOwner": "S3'",
                "invocationOwner": "S5/S5'",
                "namespaceRef": temporal_context["graphiti"]["namespaceRef"].clone(),
                "sessionArcId": temporal_context["graphiti"]["sessionArcId"].clone(),
            },
            "privacy": "safe-live-projection",
        });

        self.append(
            "global_temporal_surface",
            "global_temporal_surface",
            payload,
        )
    }

    pub fn publish_activity_event(&self, kind: &str, payload: Value) -> Result<(), String> {
        self.append(
            "activity_event",
            "now_activity",
            json!({
                "kind": kind,
                "payload": payload,
            }),
        )
    }

    pub fn publish_m_clock_placeholder(&self, clock: &str) -> Result<(), String> {
        self.append(
            "m_clock_state",
            "now_m_clock",
            json!({
                "clock": clock,
                "state": "placeholder",
                "bridgeMode": "one_way",
            }),
        )
    }

    pub fn drain_test_events(&self) -> Result<Vec<BridgeEvent>, String> {
        let path = event_path(&self.state_root);
        if !path.exists() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        let events = serde_json::from_str(&content).map_err(|err| err.to_string())?;
        fs::write(path, "[]").map_err(|err| err.to_string())?;
        Ok(events)
    }

    fn append(&self, kind: &str, table: &str, payload: Value) -> Result<(), String> {
        let path = event_path(&self.state_root);
        let mut events = if path.exists() {
            let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
            serde_json::from_str::<Vec<BridgeEvent>>(&content).map_err(|err| err.to_string())?
        } else {
            Vec::new()
        };

        events.push(BridgeEvent {
            kind: kind.to_owned(),
            table: table.to_owned(),
            payload,
            timestamp_ms: now_ms()?,
        });

        let content = serde_json::to_string_pretty(&events).map_err(|err| err.to_string())?;
        fs::write(path, content).map_err(|err| err.to_string())
    }
}

fn event_path(state_root: &Path) -> PathBuf {
    state_root
        .join("spacetimedb-bridge")
        .join("test-events.json")
}

// ─── SpacetimeRuntime Client ────────────────────────────────────────────────
//
// Blocking client for calling the epi-spacetime-module registration reducers
// over the SpacetimeDB REST surface.

#[derive(Debug, Clone)]
pub struct SpacetimePresence {
    url: String,
    database: String,
}

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

pub type SpacetimeSubscriptionPlan = SpacetimeProjectionPlan;

pub struct SpacetimeProjectionSubscription {
    socket: WebSocketStream<MaybeTlsStream<TcpStream>>,
    agent_id: String,
}

impl SpacetimeRegistration {
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
        json!({
            "ok": true,
            "configured": true,
            "registrationMode": "live-reducer",
            "subscriptionMode": plan.mode,
            "nativeSubscriptionReady": native_ready,
            "url": self.url,
            "database": self.database,
            "installationId": self.installation_id,
            "gatewayId": self.gateway_id,
            "endpoint": self.endpoint,
            "protocolVersion": self.protocol_version,
            "projectionTables": SPACETIME_PROJECTION_TABLES,
            "projectionSubscriptionPlan": plan,
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
        .for_session(session_key, agent_id)
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

    pub fn register_session_agent(
        &self,
        state_root: &Path,
        session_key: &str,
    ) -> Result<(), String> {
        let store = SessionStore::new(state_root)?;
        let record = store.resolve(session_key)?;
        let temporal_context =
            temporal::context_for_record(state_root, &record, &record.active_agent_id);
        let agent_instance_id = agent_instance_id(
            &self.gateway_id,
            &record.active_agent_id,
            &record.session_id,
        );
        let capability_surface_hash =
            capability_surface_hash(&record.active_agent_id, &record.canonical_key);

        let client = self.client();
        client.register_agent(
            &agent_instance_id,
            &self.installation_id,
            &self.gateway_id,
            &record.active_agent_id,
            &agent_kind(&record.active_agent_id),
            &record.canonical_key,
            &capability_surface_hash,
        )?;

        let day_id = string_at(&temporal_context, "/day/dayId", "unknown-day");
        let now_path = string_at(&temporal_context, "/now/path", "");
        let now_wikilink = string_at(&temporal_context, "/now/wikilink", "");
        let history_archive_path = string_at(&temporal_context, "/history/archivePath", "");
        let redis_session_now_key = string_at(&temporal_context, "/redis/sessionNowKey", "");
        let redis_day_context_key = string_at(&temporal_context, "/redis/dayContextKey", "");
        let graphiti_arc_id = string_at(&temporal_context, "/graphiti/sessionArcId", "");
        let graphiti_namespace_ref = string_at(&temporal_context, "/graphiti/namespaceRef", "");
        let pratibimba_anchor_ref = string_at(&temporal_context, "/pratibimba/anchorId", "");
        let kairos_snapshot_id = kairos_snapshot_id(&temporal_context);
        let kernel_projection_json = kernel_projection_json(&temporal_context);
        let day_wikilink = day_wikilink(day_id);
        let global_surface_key = global_temporal_surface_key(
            &self.installation_id,
            &self.gateway_id,
            &record.canonical_key,
        );
        let redis_global_context_key =
            redis_global_context_key(&self.installation_id, &self.gateway_id, day_id);

        client.bind_session_temporal_context(
            &record.canonical_key,
            &self.installation_id,
            &self.gateway_id,
            &agent_instance_id,
            day_id,
            now_path,
            now_wikilink,
            history_archive_path,
            redis_session_now_key,
            redis_day_context_key,
            graphiti_arc_id,
            pratibimba_anchor_ref,
            &kairos_snapshot_id,
            record.parent_session_key.as_deref().unwrap_or(""),
            record.source_session_key.as_deref().unwrap_or(""),
            record.source_session_kind.as_deref().unwrap_or(""),
            record.runtime_cwd.as_deref().unwrap_or(""),
            record.vault_root.as_deref().unwrap_or(""),
            record.resource_loader_id.as_deref().unwrap_or(""),
            record.retry_settlement_state.as_deref().unwrap_or(""),
            &serde_json::to_string(&record.diagnostics).unwrap_or_else(|_| "[]".to_owned()),
            &kernel_projection_json,
        )?;

        let kairos = &temporal_context["kairos"];
        client.bind_kairos_surface(
            &kairos_snapshot_id,
            &self.installation_id,
            &self.gateway_id,
            day_id,
            &record.canonical_key,
            kairos
                .get("available")
                .and_then(Value::as_bool)
                .unwrap_or(false),
            kairos
                .get("fresh")
                .and_then(Value::as_bool)
                .unwrap_or(false),
            kairos
                .get("dominantSign")
                .and_then(Value::as_u64)
                .unwrap_or(0) as u8,
            kairos
                .get("dominantElement")
                .and_then(Value::as_u64)
                .unwrap_or(0) as u8,
            kairos
                .get("activeDecan")
                .and_then(Value::as_u64)
                .unwrap_or(0) as u8,
            kairos
                .get("activeTattva")
                .and_then(Value::as_u64)
                .unwrap_or(0) as u8,
            kairos.get("planets").cloned().unwrap_or_else(|| json!([])),
            kairos
                .get("source")
                .and_then(Value::as_str)
                .unwrap_or("nara.kairos.current"),
        )?;

        client.bind_global_temporal_surface(
            &global_surface_key,
            &self.installation_id,
            &self.gateway_id,
            &agent_instance_id,
            &record.canonical_key,
            day_id,
            &day_wikilink,
            now_path,
            now_wikilink,
            &record.canonical_key,
            history_archive_path,
            redis_session_now_key,
            redis_day_context_key,
            &redis_global_context_key,
            graphiti_namespace_ref,
            graphiti_arc_id,
            pratibimba_anchor_ref,
            &kairos_snapshot_id,
            &kernel_projection_json,
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
        if plan.mode != SPACETIME_PROJECTION_SOURCE_NATIVE_WS {
            return Err(format!(
                "spacetimedb subscription mode is {}; set EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket",
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
        })
    }

    fn client(&self) -> SpacetimePresence {
        SpacetimePresence::for_database(&self.url, &self.database)
    }
}

impl SpacetimeProjectionSubscription {
    pub async fn next_context(&mut self) -> Result<Option<Value>, String> {
        while let Some(message) = self.socket.next().await {
            let message =
                message.map_err(|err| format!("spacetimedb websocket receive failed: {err}"))?;
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
                return Ok(Some(context));
            }
        }
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
            "reason": "set SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL to enable live projection",
            "projectionTables": SPACETIME_PROJECTION_TABLES,
            "rawServiceHealth": "not configured",
            "agentAccess": "not registered",
            "subscriptionReadiness": "disabled until SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL is set",
        }),
        Err(error) => json!({
            "ok": false,
            "configured": false,
            "registrationMode": "invalid",
            "error": error,
            "subscriptionReadiness": "invalid SpaceTimeDB configuration",
        }),
    }
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
        let url = format!(
            "{}/v1/database/{}/call/{}",
            self.url, self.database, reducer
        );
        let reducer_name = reducer.to_owned();
        let response = run_blocking_http(move || {
            BlockingClient::new()
                .post(&url)
                .json(&payload)
                .send()
                .map_err(|err| format!("spacetimedb {reducer_name} request failed: {err}"))
        })?;

        if response.status().is_success() {
            return Ok(());
        }

        let status = response.status();
        let body = response
            .text()
            .unwrap_or_else(|_| "<unreadable body>".to_owned());
        Err(format!(
            "spacetimedb {reducer} request failed: {status} {body}"
        ))
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

fn projection_context_from_sql_result(
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
    let resource_loader_id = row_string(session_row, "resource_loader_id", "resourceLoaderId", "");
    let runtime_cwd = row_string(session_row, "runtime_cwd", "runtimeCwd", "");
    let source_session_key = row_string(session_row, "source_session_key", "sourceSessionKey", "");
    let source_session_kind =
        row_string(session_row, "source_session_kind", "sourceSessionKind", "");
    let graphiti_namespace_ref = pratibimba_anchor_ref.clone();
    let _kairos_snapshot_id = row_string(session_row, "kairos_snapshot_id", "kairosSnapshotId", "");
    let session_id = session_id_from_now_path(&now_path).unwrap_or_else(|| session_key.to_owned());
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

fn projection_context_from_subscription_message(
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

fn agent_instance_id(gateway_id: &str, agent_id: &str, session_id: &str) -> String {
    format!("{gateway_id}:{agent_id}:{session_id}")
}

fn global_temporal_surface_key(
    installation_id: &str,
    gateway_id: &str,
    session_key: &str,
) -> String {
    format!("{installation_id}:{gateway_id}:{session_key}")
}

fn redis_global_context_key(installation_id: &str, gateway_id: &str, day_id: &str) -> String {
    format!("s3:gateway:temporal:global:{installation_id}:{gateway_id}:day:{day_id}")
}

fn day_wikilink(day_id: &str) -> String {
    if day_id == "unknown-day" {
        String::new()
    } else {
        format!("[[{day_id}]]")
    }
}

fn capability_surface_hash(agent_id: &str, session_key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(agent_id.as_bytes());
    hasher.update(b":");
    hasher.update(session_key.as_bytes());
    hex::encode(hasher.finalize())
}

fn agent_kind(agent_id: &str) -> String {
    match agent_id {
        "epii" => "epii",
        "anima" => "anima",
        value if value.starts_with("subagent:") => "subagent",
        _ => "pi-agent",
    }
    .to_owned()
}

fn string_at<'a>(value: &'a Value, pointer: &str, fallback: &'a str) -> &'a str {
    value
        .pointer(pointer)
        .and_then(Value::as_str)
        .unwrap_or(fallback)
}

fn kairos_snapshot_id(context: &Value) -> String {
    let day_id = string_at(context, "/day/dayId", "unknown-day");
    let session_id = string_at(context, "/session/sessionId", "unknown-session");
    format!("kairos-{day_id}-{session_id}")
}

fn kernel_projection_json(context: &Value) -> String {
    let kernel = context
        .get("kernel")
        .filter(|value| value.is_object())
        .cloned()
        .unwrap_or_else(temporal::kernel_surface_value);
    kernel.to_string()
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
    temporal::kernel_surface_value()
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
