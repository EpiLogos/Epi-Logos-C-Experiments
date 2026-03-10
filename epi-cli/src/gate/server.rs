use std::fs;
use std::path::PathBuf;

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;
use tokio::task::JoinHandle;
use tokio_tungstenite::{accept_async, tungstenite::Message};

use super::approvals;
use super::auth;
use super::browser;
use super::channels;
use super::chat;
use super::config;
use super::config::{BindMode, GatewayConfig};
use super::cron;
use super::devices;
use super::logs;
use super::models;
use super::nodes;
use super::parity::DEFAULT_GATEWAY_PORT;
use super::protocol::{self, RequestFrame};
use super::sessions::{self, SessionPatch, SessionStore};
use super::skills;
use super::spacetimedb_bridge::SpacetimeBridge;
use super::system;
use super::tls::GatewayTlsRuntime;
use super::update;
use super::wizard;

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
    persist_status(config.state_root.as_deref(), &status)?;
    let state_root = gate_root(config.state_root.as_deref())?;
    publish_m_clock_placeholder(&state_root)?;
    let bind_host = bind_host(&config.bind_mode);
    let port = config.port;
    let listener = TcpListener::bind((bind_host, port))
        .await
        .map_err(|err| err.to_string())?;
    run_listener_loop(listener, state_root, None).await?;

    render(&status, json)
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
    let listener = bind_with_retry(port).await?;
    let (shutdown_tx, shutdown_rx) = oneshot::channel();

    let task = tokio::spawn(async move {
        let _ = run_listener_loop(listener, state_root, Some(shutdown_rx)).await;
    });

    Ok(TestServerHandle {
        shutdown: Some(shutdown_tx),
        task,
    })
}

async fn bind_with_retry(port: u16) -> Result<TcpListener, String> {
    let mut last_error = None;
    for _ in 0..20 {
        match TcpListener::bind(("127.0.0.1", port)).await {
            Ok(listener) => return Ok(listener),
            Err(err) => {
                last_error = Some(err.to_string());
                tokio::time::sleep(std::time::Duration::from_millis(25)).await;
            }
        }
    }

    Err(last_error.unwrap_or_else(|| "failed to bind test server".to_owned()))
}

async fn run_listener_loop(
    listener: TcpListener,
    state_root: PathBuf,
    mut shutdown_rx: Option<oneshot::Receiver<()>>,
) -> Result<(), String> {
    loop {
        let accepted = if let Some(shutdown_rx) = shutdown_rx.as_mut() {
            tokio::select! {
                _ = shutdown_rx => return Ok(()),
                accepted = listener.accept() => accepted,
            }
        } else {
            listener.accept().await
        };

        let (stream, _) = accepted.map_err(|err| err.to_string())?;
        let state_root = state_root.clone();
        tokio::spawn(async move {
            let _ = handle_connection(stream, state_root).await;
        });
    }
}

fn bind_host(bind_mode: &BindMode) -> &'static str {
    match bind_mode {
        BindMode::Loopback => "127.0.0.1",
        BindMode::Auto | BindMode::Lan | BindMode::Custom | BindMode::Tailnet => "0.0.0.0",
    }
}

async fn handle_connection(stream: TcpStream, state_root: PathBuf) -> Result<(), String> {
    let mut socket = accept_async(stream).await.map_err(|err| err.to_string())?;
    let hello = serde_json::to_string(&protocol::hello_ok()).map_err(|err| err.to_string())?;
    socket
        .send(Message::Text(hello))
        .await
        .map_err(|err| err.to_string())?;

    let mut connected = false;

    while let Some(message) = socket.next().await {
        let message = message.map_err(|err| err.to_string())?;
        if !message.is_text() {
            continue;
        }

        let frame: RequestFrame =
            serde_json::from_str(message.to_text().map_err(|err| err.to_string())?)
                .map_err(|err| err.to_string())?;

        let response = if !connected && frame.method != "connect" {
            protocol::error(
                frame.id,
                "connect-required",
                "connect must be the first request",
            )
        } else if frame.method == "connect" {
            match auth::validate_connect(&frame.params) {
                Ok(()) => {
                    connected = true;
                    protocol::success(frame.id, protocol::connect_result())
                }
                Err(err) => protocol::error(frame.id, err.code, err.message),
            }
        } else {
            match dispatch_rpc(&state_root, &frame) {
                Ok(result) => protocol::success(frame.id, result),
                Err((code, message)) => protocol::error(frame.id, code, message),
            }
        };

        let payload = serde_json::to_string(&response).map_err(|err| err.to_string())?;
        socket
            .send(Message::Text(payload))
            .await
            .map_err(|err| err.to_string())?;
    }

    Ok(())
}

fn dispatch_rpc(state_root: &PathBuf, frame: &RequestFrame) -> Result<Value, (String, String)> {
    let store = SessionStore::new(state_root).map_err(internal_error)?;

    match frame.method.as_str() {
        "sessions.list" => {
            let items = store
                .list()
                .map_err(internal_error)?
                .into_iter()
                .map(|record| sessions::record_to_value(&record))
                .collect::<Vec<_>>();
            let mut result = sessions::list_result(&store).map_err(internal_error)?;
            result["items"] = json!(items);
            Ok(result)
        }
        "sessions.resolve" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            Ok(sessions::record_to_value(&record))
        }
        "sessions.preview" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::preview(state_root, &record.canonical_key).map_err(internal_error)
        }
        "sessions.patch" => {
            let identifier = session_identifier(&frame.params)?;
            let patch = SessionPatch {
                aliases: frame.params.get("aliases").and_then(|value| {
                    value.as_array().map(|items| {
                        items
                            .iter()
                            .filter_map(|item| item.as_str().map(str::to_owned))
                            .collect::<Vec<_>>()
                    })
                }),
                label: frame
                    .params
                    .get("label")
                    .map(|value| value.as_str().map(str::to_owned)),
                active_agent_id: frame
                    .params
                    .get("activeAgentId")
                    .and_then(|value| value.as_str().map(str::to_owned)),
                subagent_lineage: frame.params.get("subagentLineage").and_then(|value| {
                    value.as_array().map(|items| {
                        items
                            .iter()
                            .filter_map(|item| item.as_str().map(str::to_owned))
                            .collect::<Vec<_>>()
                    })
                }),
                thinking_level: frame
                    .params
                    .get("thinkingLevel")
                    .map(|value| value.as_str().map(str::to_owned)),
                verbose_level: frame
                    .params
                    .get("verboseLevel")
                    .map(|value| value.as_str().map(str::to_owned)),
                reasoning_level: frame
                    .params
                    .get("reasoningLevel")
                    .map(|value| value.as_str().map(str::to_owned)),
            };
            let record = store.patch(&identifier, patch).map_err(not_found_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(json!({
                "ok": true,
                "key": record.canonical_key,
                "entry": sessions::session_row(&record),
                "record": sessions::record_to_value(&record),
            }))
        }
        "sessions.reset" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::reset(state_root, &record.canonical_key).map_err(internal_error)?;
            Ok(json!({ "ok": true, "canonicalKey": record.canonical_key }))
        }
        "sessions.delete" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.delete(&identifier).map_err(not_found_error)?;
            let transcript_path = chat::transcript_path(state_root, &record.canonical_key);
            if transcript_path.exists() {
                fs::remove_file(transcript_path).map_err(|err| internal_error(err.to_string()))?;
            }
            Ok(json!({ "ok": true, "canonicalKey": record.canonical_key }))
        }
        "sessions.compact" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::compact(state_root, &record.canonical_key).map_err(internal_error)
        }
        "chat.send" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let message = required_str(&frame.params, "message")?;
            let record = store.ensure(&session_key).map_err(internal_error)?;
            let run_id = chat::send_message(state_root, &record.canonical_key, &message)
                .map_err(internal_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(json!({
                "ok": true,
                "runId": run_id,
                "canonicalKey": record.canonical_key,
            }))
        }
        "chat.inject" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let message = required_str(&frame.params, "message")?;
            let role = frame
                .params
                .get("role")
                .and_then(|value| value.as_str())
                .unwrap_or("assistant");
            let record = store.ensure(&session_key).map_err(internal_error)?;
            chat::inject_message(state_root, &record.canonical_key, role, &message)
                .map_err(internal_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(json!({ "ok": true, "canonicalKey": record.canonical_key }))
        }
        "chat.abort" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let run_id = required_str(&frame.params, "runId")?;
            let record = store.resolve(&session_key).map_err(not_found_error)?;
            chat::abort_run(state_root, &record.canonical_key, &run_id).map_err(internal_error)?;
            Ok(json!({ "ok": true, "canonicalKey": record.canonical_key, "runId": run_id }))
        }
        "chat.history" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let record = store.resolve(&session_key).map_err(not_found_error)?;
            let mut result = chat::history_response(state_root, &record.canonical_key)
                .map_err(internal_error)?;
            result["canonicalKey"] = json!(record.canonical_key);
            Ok(result)
        }
        "config.get" => config::config_value(state_root).map_err(internal_error),
        "config.schema" => Ok(config::schema_value()),
        "config.set" => {
            if let Some(raw) = frame.params.get("raw").and_then(|value| value.as_str()) {
                let base_hash = frame
                    .params
                    .get("baseHash")
                    .and_then(|value| value.as_str());
                config::set_raw_value(state_root, raw, base_hash).map_err(internal_error)
            } else {
                let key = required_str(&frame.params, "key")?;
                let value =
                    frame.params.get("value").cloned().ok_or_else(|| {
                        ("invalid-params".to_owned(), "value is required".to_owned())
                    })?;
                config::set_value(state_root, &key, &value).map_err(internal_error)
            }
        }
        "config.patch" => {
            let patch = frame
                .params
                .get("patch")
                .cloned()
                .unwrap_or_else(|| json!({}));
            config::patch_value(state_root, &patch).map_err(internal_error)
        }
        "config.apply" => {
            if let Some(raw) = frame.params.get("raw").and_then(|value| value.as_str()) {
                let base_hash = frame
                    .params
                    .get("baseHash")
                    .and_then(|value| value.as_str());
                config::apply_raw_value(state_root, raw, base_hash).map_err(internal_error)
            } else {
                let patch = frame
                    .params
                    .get("patch")
                    .cloned()
                    .unwrap_or_else(|| json!({}));
                config::apply_value(state_root, &patch).map_err(internal_error)
            }
        }
        "set-heartbeats" => {
            let heartbeats = frame
                .params
                .get("heartbeats")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let result = system::set_heartbeats(state_root, &heartbeats).map_err(internal_error)?;
            publish_presence_surfaces(state_root, &result)?;
            Ok(result)
        }
        "last-heartbeat" => system::last_heartbeat(state_root).map_err(internal_error),
        "system-presence" => system::presence(state_root).map_err(internal_error),
        "presence.list" => system::presence_list(state_root).map_err(internal_error),
        "status.summary" => system::status_summary(state_root).map_err(internal_error),
        "health.snapshot" => system::health_snapshot(state_root).map_err(internal_error),
        "system-event" => {
            let kind = required_str(&frame.params, "kind")?;
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let result =
                system::event(state_root, &kind, payload.clone()).map_err(internal_error)?;
            publish_activity_surface(state_root, &kind, payload)?;
            Ok(result)
        }
        "models.list" => models::list(state_root).map_err(internal_error),
        "logs.tail" => {
            let lines = frame
                .params
                .get("lines")
                .and_then(|value| value.as_u64())
                .unwrap_or(20) as usize;
            logs::tail(state_root, lines).map_err(internal_error)
        }
        "usage.status" => system::usage_status(state_root).map_err(internal_error),
        "usage.cost" => system::usage_cost(state_root).map_err(internal_error),
        "update.run" => update::run(state_root).map_err(internal_error),
        "wizard.start" => {
            let flow = required_str(&frame.params, "flow")?;
            wizard::start(state_root, &flow).map_err(internal_error)
        }
        "wizard.next" => wizard::next(state_root).map_err(internal_error),
        "wizard.cancel" => wizard::cancel(state_root).map_err(internal_error),
        "wizard.status" => wizard::status(state_root).map_err(internal_error),
        "node.pair.request" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_request(state_root, &node).map_err(internal_error)
        }
        "node.pair.list" => nodes::pair_list(state_root).map_err(internal_error),
        "node.pair.approve" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_approve(state_root, &node).map_err(internal_error)
        }
        "node.pair.reject" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_reject(state_root, &node).map_err(internal_error)
        }
        "node.pair.verify" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_verify(state_root, &node).map_err(internal_error)
        }
        "node.rename" => {
            let node = required_str(&frame.params, "node")?;
            let name = required_str(&frame.params, "name")?;
            nodes::rename(state_root, &node, &name).map_err(internal_error)
        }
        "node.list" => nodes::list(state_root).map_err(internal_error),
        "node.describe" => {
            let node = required_str(&frame.params, "node")?;
            nodes::describe(state_root, &node).map_err(internal_error)
        }
        "node.invoke" => {
            let node = required_str(&frame.params, "node")?;
            let command = required_str(&frame.params, "command")?;
            nodes::invoke(state_root, &node, &command).map_err(internal_error)
        }
        "node.invoke.result" => {
            let result_id = required_str(&frame.params, "resultId")?;
            nodes::invoke_result(state_root, &result_id).map_err(internal_error)
        }
        "node.event" => {
            let node = required_str(&frame.params, "node")?;
            let kind = required_str(&frame.params, "kind")?;
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            nodes::event(state_root, &node, &kind, payload).map_err(internal_error)
        }
        "browser.request" => {
            let url = required_str(&frame.params, "url")?;
            let method = frame
                .params
                .get("method")
                .and_then(|value| value.as_str())
                .unwrap_or("GET")
                .to_owned();
            browser::request(state_root, &url, &method).map_err(internal_error)
        }
        "web.login.start" => {
            let channel =
                optional_str(&frame.params, "channel").unwrap_or_else(|| "whatsapp".to_owned());
            let workspace =
                optional_str(&frame.params, "workspace").unwrap_or_else(|| "main".to_owned());
            channels::mark_login_start(state_root, &channel).map_err(internal_error)?;
            browser::login_start(state_root, &channel, &workspace).map_err(internal_error)
        }
        "web.login.wait" => {
            let login_id = frame.params.get("loginId").and_then(|value| value.as_str());
            let result = browser::login_wait(state_root, login_id).map_err(internal_error)?;
            if let Some(channel) = result.get("channel").and_then(|value| value.as_str()) {
                channels::mark_login_wait(state_root, channel).map_err(internal_error)?;
            }
            Ok(result)
        }
        "device.pair.list" => devices::pair_list(state_root).map_err(internal_error),
        "device.pair.approve" => {
            let device = required_str_alias(&frame.params, &["device", "requestId", "deviceId"])?;
            devices::pair_approve(state_root, &device).map_err(internal_error)
        }
        "device.pair.reject" => {
            let device = required_str_alias(&frame.params, &["device", "requestId", "deviceId"])?;
            devices::pair_reject(state_root, &device).map_err(internal_error)
        }
        "device.token.rotate" => {
            let device = required_str_alias(&frame.params, &["device", "deviceId"])?;
            devices::token_rotate(state_root, &device).map_err(internal_error)
        }
        "device.token.revoke" => {
            let device = required_str(&frame.params, "device")?;
            let token = required_str(&frame.params, "token")?;
            devices::token_revoke(state_root, &device, &token).map_err(internal_error)
        }
        "exec.approval.request" => {
            let command = required_str(&frame.params, "command")?;
            let node = required_str(&frame.params, "node")?;
            approvals::request(state_root, &command, &node).map_err(internal_error)
        }
        "exec.approval.resolve" => {
            let approval_id = required_str(&frame.params, "approvalId")?;
            let decision = required_str(&frame.params, "decision")?;
            approvals::resolve(state_root, &approval_id, &decision).map_err(internal_error)
        }
        "exec.approvals.get" => approvals::get(state_root).map_err(internal_error),
        "exec.approvals.set" => {
            let mode = required_str(&frame.params, "mode")?;
            approvals::set_mode(state_root, &mode).map_err(internal_error)
        }
        "exec.approvals.node.get" => {
            let node = required_str(&frame.params, "node")?;
            approvals::node_get(state_root, &node).map_err(internal_error)
        }
        "exec.approvals.node.set" => {
            let node = required_str(&frame.params, "node")?;
            let mode = required_str(&frame.params, "mode")?;
            approvals::node_set(state_root, &node, &mode).map_err(internal_error)
        }
        "channels.status" => channels::status(state_root).map_err(internal_error),
        "channels.logout" => {
            let channel = required_str(&frame.params, "channel")?;
            channels::logout(state_root, &channel).map_err(internal_error)
        }
        "cron.status" => cron::status(state_root).map_err(internal_error),
        "cron.list" => cron::list(state_root).map_err(internal_error),
        "cron.add" => {
            let name = required_str(&frame.params, "name")?;
            let description = frame
                .params
                .get("description")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_owned();
            let agent_id = frame.params.get("agentId").and_then(|value| value.as_str());
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool())
                .unwrap_or(true);
            let schedule = frame
                .params
                .get("schedule")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let session_target = frame
                .params
                .get("sessionTarget")
                .and_then(|value| value.as_str())
                .unwrap_or("main");
            let wake_mode = frame
                .params
                .get("wakeMode")
                .and_then(|value| value.as_str())
                .unwrap_or("next-heartbeat");
            let isolation = frame.params.get("isolation").cloned();
            cron::add(
                state_root,
                &name,
                &description,
                agent_id,
                enabled,
                schedule,
                session_target,
                wake_mode,
                payload,
                isolation,
            )
            .map_err(internal_error)
        }
        "cron.update" => {
            let id = required_str(&frame.params, "id")?;
            let patch = frame
                .params
                .get("patch")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let enabled = patch
                .get("enabled")
                .and_then(|value| value.as_bool())
                .or_else(|| {
                    frame
                        .params
                        .get("enabled")
                        .and_then(|value| value.as_bool())
                });
            let description = patch
                .get("description")
                .and_then(|value| value.as_str())
                .or_else(|| {
                    frame
                        .params
                        .get("description")
                        .and_then(|value| value.as_str())
                });
            cron::update(state_root, &id, enabled, description).map_err(internal_error)
        }
        "cron.run" => {
            let id = required_str(&frame.params, "id")?;
            cron::run(state_root, &id).map_err(internal_error)
        }
        "cron.runs" => {
            let id = required_str(&frame.params, "id")?;
            cron::runs(state_root, &id).map_err(internal_error)
        }
        "cron.remove" => {
            let id = required_str(&frame.params, "id")?;
            cron::remove(state_root, &id).map_err(internal_error)
        }
        "talk.mode" => {
            let mode = required_str(&frame.params, "mode")?;
            system::talk_mode(state_root, &mode).map_err(internal_error)
        }
        "tts.status" => system::tts_status(state_root).map_err(internal_error),
        "tts.enable" => system::tts_enable(state_root).map_err(internal_error),
        "tts.disable" => system::tts_disable(state_root).map_err(internal_error),
        "tts.convert" => {
            let text = required_str(&frame.params, "text")?;
            system::tts_convert(state_root, &text).map_err(internal_error)
        }
        "tts.setProvider" => {
            let provider = required_str(&frame.params, "provider")?;
            system::tts_set_provider(state_root, &provider).map_err(internal_error)
        }
        "tts.providers" => Ok(system::tts_providers()),
        "voicewake.get" => system::voicewake_get(state_root).map_err(internal_error),
        "voicewake.set" => {
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool())
                .unwrap_or(false);
            let phrase = frame
                .params
                .get("phrase")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_owned();
            system::voicewake_set(state_root, enabled, &phrase).map_err(internal_error)
        }
        "skills.status" => skills::status(state_root).map_err(internal_error),
        "skills.bins" => skills::bins(state_root).map_err(internal_error),
        "skills.install" => {
            let skill = required_str_alias(&frame.params, &["skill", "skillKey", "name"])?;
            skills::install(state_root, &skill).map_err(internal_error)
        }
        "skills.update" => {
            let skill = required_str_alias(&frame.params, &["skill", "skillKey", "name"])?;
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool());
            let api_key = frame.params.get("apiKey").and_then(|value| value.as_str());
            skills::update(state_root, &skill, enabled, api_key).map_err(internal_error)
        }
        _ => Err((
            "unimplemented".to_owned(),
            format!("{} is not implemented yet", frame.method),
        )),
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

fn publish_m_clock_placeholder(state_root: &PathBuf) -> Result<(), String> {
    let bridge = SpacetimeBridge::new(state_root)?;
    bridge.publish_m_clock_placeholder("M0")
}

fn publish_session_surface(
    state_root: &PathBuf,
    record: &sessions::SessionRecord,
) -> Result<(), (String, String)> {
    let bridge = SpacetimeBridge::new(state_root).map_err(internal_error)?;
    bridge
        .publish_session(
            &record.canonical_key,
            record.aliases.first().map(String::as_str),
        )
        .map_err(internal_error)
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
