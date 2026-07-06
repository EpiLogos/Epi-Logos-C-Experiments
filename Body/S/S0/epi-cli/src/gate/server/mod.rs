use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::net::TcpListener;
use tokio::sync::oneshot;
use tokio::task::JoinHandle;

mod dispatch;
mod method_envelope;
mod observability;
mod subscription;
mod websocket;

use super::config::{BindMode, GatewayConfig};
use super::events::GatewayEvent;
use super::kernel_bridge_runtime;
use super::parity::DEFAULT_GATEWAY_PORT;
use super::runtime::GatewayRuntimeState;
use super::sessions::{self, SessionPatch, SessionRecord, SessionStore};
use super::spacetimedb_bridge::SpacetimeBridge;
use super::tls::GatewayTlsRuntime;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayStatus {
    pub running: bool,
    pub port: u16,
    pub bind_mode: BindMode,
    pub tls_enabled: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tls_fingerprint_sha256: Option<String>,
}

pub struct TestServerHandle {
    shutdown: Option<oneshot::Sender<()>>,
    task: JoinHandle<()>,
}

impl Drop for TestServerHandle {
    fn drop(&mut self) {
        if let Some(shutdown) = self.shutdown.take() {
            let _ = shutdown.send(());
        }
        self.task.abort();
    }
}

pub async fn start(config: &GatewayConfig, json: bool) -> Result<String, String> {
    let status = status_from_config(config)?;
    let state_root = gate_root(config.state_root.as_deref())?;
    publish_m_clock_placeholder(&state_root)?;
    let bind_host = bind_host(&config.bind_mode);
    let port = config.port;
    let listener = TcpListener::bind((bind_host, port))
        .await
        .map_err(|err| err.to_string())?;
    observability::register_gateway_with_spacetimedb(port, &state_root).await?;
    persist_status(config.state_root.as_deref(), &status)?;
    let runtime = GatewayRuntimeState::default();
    let heartbeat = spawn_profile_heartbeat(runtime.clone());
    let result = websocket::run_listener_loop(listener, state_root, runtime, None).await;
    heartbeat.abort();
    result?;

    render(&status, json)
}

/// S0 kernel tick → S3' shared `profile.update` stream. One heartbeat per
/// gateway process; every connected client reads the same broadcast —
/// renderers may not run a private clock (M'-SYSTEM-SPEC harmonic clock law).
fn spawn_profile_heartbeat(runtime: GatewayRuntimeState) -> JoinHandle<()> {
    tokio::spawn(async move {
        let mut generation: u64 = 0;
        let mut ticker = tokio::time::interval(std::time::Duration::from_secs(1));
        loop {
            ticker.tick().await;
            generation += 1;
            let now_ms = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64;
            let mut projection =
                portal_core::KernelTemporalProjection::from_clock_tick(now_ms, generation);
            // Live Kerykeion sky, attached only when the kairos cache is fresh
            // and complete (cosmic-clock §5.3 kairos_valid law) — the fields'
            // absence is the renderers' honest "kairos pending" state.
            if let Some((degrees, retrograde)) = crate::nara::kairos::heartbeat_live_sky() {
                projection.harmonic_profile.planet_degrees = Some(degrees);
                projection.harmonic_profile.live_planets =
                    Some(portal_core::live_planets_from_sky(&degrees, &retrograde));
            }
            // Handle-only PASU identity summary (Sprint-8 E6, DR-M4-3):
            // natal clock address + weight + preview + elemental quaternion.
            // Absence is the honest "no identity anchored" state; identity
            // BODIES (natal chart, per-layer profiles) never cross this bus.
            projection.harmonic_profile.quintessence =
                crate::nara::identity::heartbeat_quintessence();
            let payload = match serde_json::to_value(&projection) {
                Ok(value) => value,
                Err(_) => continue,
            };
            runtime.broadcast(GatewayEvent::new(
                "profile.update",
                None,
                None,
                Some(generation),
                payload,
            ));
            // Bell-kernel spec §5: the chime frame is a tick EVENT published
            // as a sibling to the profile stream — the proof that M1'/M2'/M3'
            // resolved the same resonant state at this tick. HONESTY NOTE
            // (verifier 2026-07-02): this reading is SYNTHESIZED here from
            // the temporal projection's own tick arithmetic — the same
            // authority the `s3.world_clock` surface serves, but not an
            // independent subscription. The coherence booleans therefore
            // guard gateway-vs-kernel derivation drift (two code paths over
            // one clock), not clock independence; when a real S3 world-clock
            // subscription lands, it should replace this reading.
            let world_clock = kernel_bridge_runtime::M123WorldClockReading {
                world_clock_handle: format!("s3-world-clock-{generation}"),
                generation,
                subscription_mode: "gateway-heartbeat".to_owned(),
                tick: projection.tick.cycle * 12 + (projection.tick.sub_tick % 12) as u64,
                degree720: (projection.tick.sub_tick % 12) as u16 * 60,
            };
            if let Ok(chime) = kernel_bridge_runtime::m123_chime_frame_from_profile(
                generation,
                &projection.harmonic_profile,
                Some(&world_clock),
            ) {
                if let Ok(chime_payload) = serde_json::to_value(&chime) {
                    runtime.broadcast(GatewayEvent::new(
                        kernel_bridge_runtime::M123_CHIME_EVENT_TYPE,
                        None,
                        None,
                        Some(generation),
                        chime_payload,
                    ));
                }
            }
        }
    })
}

pub fn stop(json: bool) -> Result<String, String> {
    let path = status_path(None)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|err| err.to_string())?;
    }
    let status = GatewayStatus {
        running: false,
        port: DEFAULT_GATEWAY_PORT,
        bind_mode: BindMode::Loopback,
        tls_enabled: false,
        tls_fingerprint_sha256: None,
    };
    render(&status, json)
}

pub fn render_status(json: bool) -> Result<String, String> {
    let status = read_status(None)?.unwrap_or(GatewayStatus {
        running: false,
        port: DEFAULT_GATEWAY_PORT,
        bind_mode: BindMode::Loopback,
        tls_enabled: false,
        tls_fingerprint_sha256: None,
    });
    render(&status, json)
}

pub fn status_from_config(config: &GatewayConfig) -> Result<GatewayStatus, String> {
    let tls_runtime = if config.tls_enabled {
        Some(GatewayTlsRuntime::load_or_generate(gate_root(
            config.state_root.as_deref(),
        )?)?)
    } else {
        None
    };

    Ok(GatewayStatus {
        running: true,
        port: config.port,
        bind_mode: config.bind_mode.clone(),
        tls_enabled: config.tls_enabled,
        tls_fingerprint_sha256: tls_runtime.map(|runtime| runtime.fingerprint_sha256),
    })
}

fn render(status: &GatewayStatus, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string(status).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "running: {}\nport: {}\nbind-mode: {}",
            status.running,
            status.port,
            status.bind_mode.as_str()
        ))
    }
}

fn persist_status(state_root: Option<&str>, status: &GatewayStatus) -> Result<(), String> {
    let path = status_path(state_root)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(status).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn read_status(state_root: Option<&str>) -> Result<Option<GatewayStatus>, String> {
    let path = status_path(state_root)?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    let status = serde_json::from_str(&content).map_err(|err| err.to_string())?;
    Ok(Some(status))
}

fn status_path(state_root: Option<&str>) -> Result<PathBuf, String> {
    Ok(gate_root(state_root)?.join("status.json"))
}

fn gate_root(state_root: Option<&str>) -> Result<PathBuf, String> {
    if let Some(root) = state_root {
        return Ok(PathBuf::from(root));
    }

    if let Some(root) = std::env::var_os("EPI_GATE_STATE_ROOT") {
        return Ok(PathBuf::from(root));
    }

    let home = dirs::home_dir().ok_or_else(|| "HOME is not configured".to_owned())?;
    Ok(home.join(".epi").join("gate"))
}

pub async fn spawn_test_server(port: u16) -> Result<TestServerHandle, String> {
    let state_root = gate_root(None)?;
    spawn_test_server_with_state_root(state_root, port).await
}

pub async fn spawn_test_server_with_state_root(
    state_root: PathBuf,
    port: u16,
) -> Result<TestServerHandle, String> {
    publish_m_clock_placeholder(&state_root)?;
    let listener = websocket::bind_with_retry(port).await?;
    observability::register_gateway_with_spacetimedb(port, &state_root).await?;
    let (shutdown_tx, shutdown_rx) = oneshot::channel();
    let runtime = GatewayRuntimeState::default();

    let task = tokio::spawn(async move {
        let _ =
            websocket::run_listener_loop(listener, state_root, runtime, Some(shutdown_rx)).await;
    });

    Ok(TestServerHandle {
        shutdown: Some(shutdown_tx),
        task,
    })
}

fn bind_host(bind_mode: &BindMode) -> &'static str {
    match bind_mode {
        BindMode::Loopback => "127.0.0.1",
        BindMode::Auto | BindMode::Lan | BindMode::Custom | BindMode::Tailnet => "0.0.0.0",
    }
}

fn agent_id_from_session_key(session_key: &str) -> Option<String> {
    let mut parts = session_key.split(':');
    match (parts.next(), parts.next()) {
        (Some("agent"), Some(agent_id)) if !agent_id.is_empty() => Some(agent_id.to_owned()),
        _ => None,
    }
}

fn session_identifier(params: &Value) -> Result<String, (String, String)> {
    if let Some(value) = params.get("session").and_then(|value| value.as_str()) {
        return Ok(value.to_owned());
    }
    if let Some(value) = params.get("key").and_then(|value| value.as_str()) {
        return Ok(value.to_owned());
    }
    required_str(params, "sessionKey")
}

fn branch_session(
    store: &SessionStore,
    params: &Value,
    source_kind: &str,
) -> Result<sessions::SessionRecord, String> {
    let source_identifier = session_identifier(params).map_err(|(_, message)| message)?;
    let source = store.resolve(&source_identifier)?;
    let target_key = required_str(params, "targetSessionKey").map_err(|(_, message)| message)?;
    let target = store.ensure(&target_key)?;
    let label = params
        .get("label")
        .map(|value| value.as_str().map(str::to_owned));

    store.patch(
        &target.canonical_key,
        SessionPatch {
            label,
            session_id: Some(source.session_id.clone()),
            day_id: Some(source.day_id.clone()),
            active_agent_id: Some(source.active_agent_id.clone()),
            parent_session_key: Some(Some(source.canonical_key.clone())),
            source_session_key: Some(Some(source.canonical_key.clone())),
            source_session_kind: Some(Some(source_kind.to_owned())),
            vault_now_path: Some(source.vault_now_path.clone()),
            runtime_cwd: Some(source.runtime_cwd.clone()),
            vault_root: Some(source.vault_root.clone()),
            resource_loader_id: Some(source.resource_loader_id.clone()),
            retry_settlement_state: Some(source.retry_settlement_state.clone()),
            diagnostics: Some(source.diagnostics.clone()),
            delivery_context: Some(source.delivery_context.clone()),
            channel: Some(source.channel.clone()),
            thread_id: Some(source.thread_id.clone()),
            group_id: Some(source.group_id.clone()),
            group_channel: Some(source.group_channel.clone()),
            group_space: Some(source.group_space.clone()),
            team_id: Some(source.team_id.clone()),
            team_role: Some(source.team_role.clone()),
            orchestration_kind: Some(source.orchestration_kind.clone()),
            cmux_workspace: Some(source.cmux_workspace.clone()),
            cmux_surface: Some(source.cmux_surface.clone()),
            cmux_pane_id: Some(source.cmux_pane_id.clone()),
            thinking_level: Some(source.thinking_level.clone()),
            verbose_level: Some(source.verbose_level.clone()),
            reasoning_level: Some(source.reasoning_level.clone()),
            model_override: Some(source.model_override.clone()),
            provider_override: Some(source.provider_override.clone()),
            ..Default::default()
        },
    )
}

fn session_tree(store: &SessionStore, root_key: &str) -> Result<Value, String> {
    let records = store.list()?;
    let mut included = vec![root_key.to_owned()];
    let mut changed = true;
    while changed {
        changed = false;
        for record in &records {
            let parent_match = record
                .parent_session_key
                .as_ref()
                .map(|key| included.iter().any(|entry| entry == key))
                .unwrap_or(false);
            let source_match = record
                .source_session_key
                .as_ref()
                .map(|key| included.iter().any(|entry| entry == key))
                .unwrap_or(false);
            if (parent_match || source_match)
                && !included.iter().any(|entry| entry == &record.canonical_key)
            {
                included.push(record.canonical_key.clone());
                changed = true;
            }
        }
    }

    let sessions = records
        .iter()
        .filter(|record| included.iter().any(|entry| entry == &record.canonical_key))
        .map(sessions::session_row)
        .collect::<Vec<_>>();
    let lineage = records
        .iter()
        .filter(|record| included.iter().any(|entry| entry == &record.canonical_key))
        .filter_map(|record| {
            let parent = record
                .parent_session_key
                .as_ref()
                .or(record.source_session_key.as_ref())?;
            Some(json!({
                "parentSessionKey": parent,
                "childSessionKey": record.canonical_key,
                "sourceSessionKey": record.source_session_key,
                "sourceSessionKind": record.source_session_kind,
            }))
        })
        .collect::<Vec<_>>();

    Ok(json!({
        "rootSessionKey": root_key,
        "sessions": sessions,
        "lineage": lineage,
    }))
}

fn session_value_with_run_state(runtime: &GatewayRuntimeState, record: &SessionRecord) -> Value {
    let mut value = sessions::record_to_value(record);
    value["runState"] = session_run_state_value(runtime, record);
    value
}

fn session_run_state_value(runtime: &GatewayRuntimeState, record: &SessionRecord) -> Value {
    let snapshots = runtime.snapshots_for_session(&record.canonical_key);
    let mut active_run_ids = snapshots
        .iter()
        .filter(|snapshot| snapshot.ended_at_ms.is_none())
        .map(|snapshot| snapshot.run_id.clone())
        .collect::<Vec<_>>();
    for run_id in runtime.active_chat_runs(&record.canonical_key) {
        if !active_run_ids.iter().any(|existing| existing == &run_id) {
            active_run_ids.push(run_id);
        }
    }
    active_run_ids.sort();

    let last_snapshot = snapshots.iter().max_by(|left, right| {
        left.started_at_ms
            .cmp(&right.started_at_ms)
            .then_with(|| left.run_id.cmp(&right.run_id))
    });
    let idle_state = if active_run_ids.is_empty() {
        retry_cycle_idle_state(record.retry_settlement_state.as_deref()).unwrap_or("idle")
    } else {
        "active"
    };
    let abort_state = last_snapshot
        .filter(|snapshot| snapshot.status == "aborted")
        .map(|_| "aborted");
    let active_run_count = active_run_ids.len();

    json!({
        "idleState": idle_state,
        "activeRunIds": active_run_ids,
        "activeRunCount": active_run_count,
        "lastRunId": last_snapshot.map(|snapshot| snapshot.run_id.clone()),
        "lastRunStatus": last_snapshot.map(|snapshot| snapshot.status.clone()),
        "lastRunStartedAtMs": last_snapshot.map(|snapshot| snapshot.started_at_ms),
        "lastRunEndedAtMs": last_snapshot.and_then(|snapshot| snapshot.ended_at_ms),
        "abortState": abort_state,
        "retrySettlementState": record.retry_settlement_state.clone(),
    })
}

fn retry_cycle_idle_state(retry_settlement_state: Option<&str>) -> Option<&'static str> {
    let normalized = retry_settlement_state?
        .trim()
        .to_ascii_lowercase()
        .replace('_', "-");
    match normalized.as_str() {
        "pending" | "retry-pending" | "pending-retry" => Some("pending"),
        "retrying" | "retry-active" | "active-retry" => Some("retrying"),
        _ => None,
    }
}

fn required_str(params: &Value, key: &str) -> Result<String, (String, String)> {
    params
        .get(key)
        .and_then(|value| value.as_str())
        .map(str::to_owned)
        .ok_or_else(|| {
            (
                "invalid-params".to_owned(),
                format!("{key} must be a string"),
            )
        })
}

fn optional_str(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(|value| value.as_str())
        .map(str::to_owned)
}

fn optional_parse_param<T>(params: &Value, key: &str) -> Result<Option<T>, (String, String)>
where
    T: serde::de::DeserializeOwned,
{
    params
        .get(key)
        .map(|value| {
            serde_json::from_value(value.clone()).map_err(|err| {
                (
                    "invalid-params".to_owned(),
                    format!("{key} is invalid: {err}"),
                )
            })
        })
        .transpose()
}

fn is_stop_command_text(text: &str) -> bool {
    let trimmed = text.trim();
    !trimmed.is_empty() && trimmed.eq_ignore_ascii_case("/stop")
}

fn nullable_string_field(params: &Value, key: &str) -> Option<Option<String>> {
    params.get(key).map(|value| {
        if value.is_null() {
            None
        } else {
            value.as_str().map(str::to_owned)
        }
    })
}

fn nullable_value_field(params: &Value, key: &str) -> Option<Option<Value>> {
    params.get(key).map(|value| {
        if value.is_null() {
            None
        } else {
            Some(value.clone())
        }
    })
}

fn inherit_nullable_string_field(
    params: &Value,
    key: &str,
    inherited: Option<String>,
) -> Option<Option<String>> {
    nullable_string_field(params, key).or_else(|| inherited.map(Some))
}

fn inherit_nullable_value_field(
    params: &Value,
    key: &str,
    inherited: Option<Value>,
) -> Option<Option<Value>> {
    nullable_value_field(params, key).or_else(|| inherited.map(Some))
}

fn required_str_alias(params: &Value, keys: &[&str]) -> Result<String, (String, String)> {
    for key in keys {
        if let Some(value) = params.get(*key).and_then(|value| value.as_str()) {
            return Ok(value.to_owned());
        }
    }
    Err((
        "invalid-params".to_owned(),
        format!("one of [{}] must be a string", keys.join(", ")),
    ))
}

fn internal_error(message: String) -> (String, String) {
    ("internal".to_owned(), message)
}

fn not_found_error(message: String) -> (String, String) {
    ("not-found".to_owned(), message)
}

fn invalid_params_error(message: impl Into<String>) -> (String, String) {
    ("invalid-params".to_owned(), message.into())
}

fn publish_m_clock_placeholder(state_root: &PathBuf) -> Result<(), String> {
    let bridge = SpacetimeBridge::new(state_root)?;
    bridge.publish_m_clock_placeholder("M0")
}

fn publish_session_surface(
    state_root: &PathBuf,
    record: &sessions::SessionRecord,
) -> Result<(), (String, String)> {
    super::spacetimedb_bridge::publish_session_surface(state_root, record).map_err(internal_error)
}

fn publish_presence_surfaces(state_root: &PathBuf, result: &Value) -> Result<(), (String, String)> {
    let bridge = SpacetimeBridge::new(state_root).map_err(internal_error)?;
    let Some(heartbeats) = result.get("heartbeats").and_then(|value| value.as_object()) else {
        return Ok(());
    };

    if heartbeats.is_empty() {
        return bridge.publish_presence("system").map_err(internal_error);
    }

    for operator_id in heartbeats.keys() {
        bridge
            .publish_presence(operator_id)
            .map_err(internal_error)?;
    }

    Ok(())
}

fn publish_activity_surface(
    state_root: &PathBuf,
    kind: &str,
    payload: Value,
) -> Result<(), (String, String)> {
    let bridge = SpacetimeBridge::new(state_root).map_err(internal_error)?;
    bridge
        .publish_activity_event(kind, payload)
        .map_err(internal_error)
}

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

/// Dispatch for `s3'.temporal.subscribe`. The 03.T2 multiplex commitment: one
/// client-facing WebSocket carries ordinary RPC AND temporal-subscription
/// lifecycle events — the response returns the subscription identity, while
/// the broadcast emits `requested` then `applied` envelopes the per-connection
/// event task forwards onto the same socket.
///
/// Auth-bound: this handler runs only after `connect` has succeeded for the
/// connection (see handle_connection's `connected` gate). The subscription
/// record is registered before any lifecycle event is emitted so consumers can
/// correlate against `runtime.active_subscriptions()`.

mod tests {
    use super::*;
    use std::time::Duration;

    use futures_util::{SinkExt, StreamExt};
    use tokio_tungstenite::connect_async;
    use tokio_tungstenite::tungstenite::Message;
    use uuid::Uuid;

    use crate::gate::cron;

    #[tokio::test]
    async fn heartbeat_auto_fires_due_cron_job_without_manual_run() {
        let state_root = temp_state_root("heartbeat_auto_fires_due_cron_job_without_manual_run");
        fs::write(
            state_root.join("cron.json"),
            serde_json::to_string_pretty(&json!({
                "jobs": [{
                    "id": "heartbeat-due",
                    "name": "heartbeat due",
                    "description": "fires from heartbeat",
                    "schedule": {"kind":"every","amount":15,"unit":"minutes"},
                    "enabled": true,
                    "payload": {"kind":"systemEvent","text":"heartbeat"},
                    "sessionTarget": "main",
                    "wakeMode": "next-heartbeat",
                    "createdAtMs": 1,
                    "updatedAtMs": 1,
                    "state": {"nextRunAtMs": 1}
                }],
                "runs": []
            }))
            .expect("cron state should serialize"),
        )
        .expect("cron state should write");

        let _server = spawn_test_server_with_state_root(state_root.clone(), 18_977)
            .await
            .expect("test server should start");
        tokio::time::sleep(Duration::from_millis(50)).await;

        let (mut socket, _) = connect_async("ws://127.0.0.1:18977")
            .await
            .expect("websocket should connect");
        let _hello = next_json(&mut socket).await;
        let _challenge = next_json(&mut socket).await;
        socket
            .send(Message::Text(
                json!({"type":"req","id":1,"method":"connect","params":{}}).to_string(),
            ))
            .await
            .expect("connect should send");
        let _connect = next_json(&mut socket).await;

        let fired = wait_for_event(&mut socket, "cron.fired").await;
        let runs = cron::runs(&state_root, "heartbeat-due").expect("runs should load");

        assert_eq!(fired["payload"]["jobId"], "heartbeat-due");
        assert_eq!(fired["payload"]["payload"]["text"], "heartbeat");
        assert_eq!(runs["runs"].as_array().expect("runs array").len(), 1);
    }

    async fn wait_for_event(
        socket: &mut tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
        event: &str,
    ) -> Value {
        tokio::time::timeout(Duration::from_secs(2), async {
            loop {
                let frame = next_json(socket).await;
                if frame["type"] == "event" && frame["event"] == event {
                    return frame;
                }
            }
        })
        .await
        .expect("expected event before timeout")
    }

    async fn next_json(
        socket: &mut tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
    ) -> Value {
        loop {
            let message = socket
                .next()
                .await
                .expect("socket should remain open")
                .expect("frame should decode");
            if message.is_text() {
                return serde_json::from_str(message.to_text().expect("message should be text"))
                    .expect("frame should be json");
            }
        }
    }

    fn temp_state_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("epi-gate-{name}-{}", Uuid::new_v4()));
        fs::create_dir_all(&path).expect("temp gateway state root should be created");
        path
    }
}
