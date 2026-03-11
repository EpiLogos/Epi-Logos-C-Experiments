use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{oneshot, Mutex as AsyncMutex};
use tokio::task::JoinHandle;
use tokio_tungstenite::{accept_async, tungstenite::Message};

use crate::agent;

use super::approvals;
use super::auth;
use super::browser;
use super::channels;
use super::chat;
use super::config;
use super::config::{BindMode, GatewayConfig};
use super::cron;
use super::devices;
use super::events::GatewayEvent;
use super::logs;
use super::models;
use super::nodes;
use super::parity::DEFAULT_GATEWAY_PORT;
use super::protocol::{self, RequestFrame};
use super::runs::{RunContext, RunSnapshot};
use super::runtime::GatewayRuntimeState;
use super::sessions::{self, SessionPatch, SessionStore};
use super::skills;
use super::spacetimedb_bridge::SpacetimeBridge;
use super::subagents;
use super::system;
use super::tls::GatewayTlsRuntime;
use super::transcripts;
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
    run_listener_loop(listener, state_root, GatewayRuntimeState::default(), None).await?;

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
    let runtime = GatewayRuntimeState::default();

    let task = tokio::spawn(async move {
        let _ = run_listener_loop(listener, state_root, runtime, Some(shutdown_rx)).await;
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
    runtime: GatewayRuntimeState,
    mut shutdown_rx: Option<oneshot::Receiver<()>>,
) -> Result<(), String> {
    let maintenance_task = tokio::spawn(maintenance_loop(state_root.clone(), runtime.clone()));
    loop {
        let accepted = if let Some(shutdown_rx) = shutdown_rx.as_mut() {
            tokio::select! {
                _ = shutdown_rx => {
                    maintenance_task.abort();
                    return Ok(());
                },
                accepted = listener.accept() => accepted,
            }
        } else {
            listener.accept().await
        };

        let (stream, _) = accepted.map_err(|err| err.to_string())?;
        let state_root = state_root.clone();
        let runtime = runtime.clone();
        tokio::spawn(async move {
            let _ = handle_connection(stream, state_root, runtime).await;
        });
    }
}

fn bind_host(bind_mode: &BindMode) -> &'static str {
    match bind_mode {
        BindMode::Loopback => "127.0.0.1",
        BindMode::Auto | BindMode::Lan | BindMode::Custom | BindMode::Tailnet => "0.0.0.0",
    }
}

async fn handle_connection(
    stream: TcpStream,
    state_root: PathBuf,
    runtime: GatewayRuntimeState,
) -> Result<(), String> {
    let socket = accept_async(stream).await.map_err(|err| err.to_string())?;
    let (write, mut read) = socket.split();
    let writer = Arc::new(AsyncMutex::new(write));
    let hello = serde_json::to_string(&protocol::hello_ok()).map_err(|err| err.to_string())?;
    writer
        .lock()
        .await
        .send(Message::Text(hello))
        .await
        .map_err(|err| err.to_string())?;
    let challenge = serde_json::to_string(&json!({
        "type": "event",
        "event": "connect.challenge",
        "payload": {
            "nonce": uuid::Uuid::new_v4().to_string(),
        }
    }))
    .map_err(|err| err.to_string())?;
    writer
        .lock()
        .await
        .send(Message::Text(challenge))
        .await
        .map_err(|err| err.to_string())?;
    let mut subscription = runtime.subscribe();
    let subscription_id = subscription.id();
    let event_writer = writer.clone();
    let event_task = tokio::spawn(async move {
        while let Some(event) = subscription.recv().await {
            let payload = match serde_json::to_string(&event_frame(&event)) {
                Ok(payload) => payload,
                Err(_) => continue,
            };
            if event_writer
                .lock()
                .await
                .send(Message::Text(payload))
                .await
                .is_err()
            {
                break;
            }
        }
    });

    let mut connected = false;

    while let Some(message) = read.next().await {
        let message = message.map_err(|err| err.to_string())?;
        if !message.is_text() {
            continue;
        }

        let frame: RequestFrame =
            serde_json::from_str(message.to_text().map_err(|err| err.to_string())?)
                .map_err(|err| err.to_string())?;

        let (response, post_response) = if !connected && frame.method != "connect" {
            (
                protocol::error(
                    frame.id,
                    "connect-required",
                    "connect must be the first request",
                ),
                None,
            )
        } else if frame.method == "connect" {
            match auth::validate_connect(&frame.params) {
                Ok(()) => {
                    connected = true;
                    (
                        protocol::success(frame.id, protocol::connect_result()),
                        None,
                    )
                }
                Err(err) => (protocol::error(frame.id, err.code, err.message), None),
            }
        } else {
            match dispatch_rpc(&state_root, &runtime, &frame).await {
                Ok(result) => (
                    protocol::success(frame.id, result.result),
                    result.post_response,
                ),
                Err((code, message)) => (protocol::error(frame.id, code, message), None),
            }
        };

        let payload = serde_json::to_string(&response).map_err(|err| err.to_string())?;
        writer
            .lock()
            .await
            .send(Message::Text(payload))
            .await
            .map_err(|err| err.to_string())?;

        if let Some(action) = post_response {
            execute_post_response(action, runtime.clone(), state_root.clone()).await;
        }
    }

    runtime.unsubscribe(subscription_id);
    event_task.abort();
    Ok(())
}

async fn dispatch_rpc(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    frame: &RequestFrame,
) -> Result<DispatchResult, (String, String)> {
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
            Ok(DispatchResult::immediate(result))
        }
        "sessions.resolve" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            Ok(DispatchResult::immediate(sessions::record_to_value(
                &record,
            )))
        }
        "sessions.preview" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::preview(state_root, &record.canonical_key)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
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
                spawned_by: frame
                    .params
                    .get("spawnedBy")
                    .map(|value| value.as_str().map(str::to_owned)),
                vault_now_path: frame
                    .params
                    .get("vaultNowPath")
                    .map(|value| value.as_str().map(str::to_owned)),
                delivery_context: frame.params.get("deliveryContext").map(|value| {
                    if value.is_null() {
                        None
                    } else {
                        Some(value.clone())
                    }
                }),
                channel: frame
                    .params
                    .get("channel")
                    .map(|value| value.as_str().map(str::to_owned)),
                thread_id: frame
                    .params
                    .get("threadId")
                    .map(|value| value.as_str().map(str::to_owned)),
                group_id: frame
                    .params
                    .get("groupId")
                    .map(|value| value.as_str().map(str::to_owned)),
                group_channel: frame
                    .params
                    .get("groupChannel")
                    .map(|value| value.as_str().map(str::to_owned)),
                group_space: frame
                    .params
                    .get("groupSpace")
                    .map(|value| value.as_str().map(str::to_owned)),
                model_override: frame
                    .params
                    .get("modelOverride")
                    .map(|value| value.as_str().map(str::to_owned)),
                provider_override: frame
                    .params
                    .get("providerOverride")
                    .map(|value| value.as_str().map(str::to_owned)),
                cli_session_ids: frame.params.get("cliSessionIds").and_then(|value| {
                    value.as_array().map(|items| {
                        items
                            .iter()
                            .filter_map(|item| item.as_str().map(str::to_owned))
                            .collect::<Vec<_>>()
                    })
                }),
            };
            let record = store.patch(&identifier, patch).map_err(not_found_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "key": record.canonical_key,
                "entry": sessions::session_row(&record),
                "record": sessions::record_to_value(&record),
            })))
        }
        "sessions.reset" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::reset(state_root, &record.canonical_key).map_err(internal_error)?;
            Ok(DispatchResult::immediate(
                json!({ "ok": true, "canonicalKey": record.canonical_key }),
            ))
        }
        "sessions.delete" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.delete(&identifier).map_err(not_found_error)?;
            let transcript_path = chat::transcript_path(state_root, &record.canonical_key);
            if transcript_path.exists() {
                fs::remove_file(transcript_path).map_err(|err| internal_error(err.to_string()))?;
            }
            Ok(DispatchResult::immediate(
                json!({ "ok": true, "canonicalKey": record.canonical_key }),
            ))
        }
        "sessions.compact" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::compact(state_root, &record.canonical_key)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "health" => system::health_snapshot(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "status" => system::status_summary(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wake" => {
            let mode = optional_str(&frame.params, "mode").unwrap_or_else(|| "now".to_owned());
            let text = optional_str(&frame.params, "text").unwrap_or_else(|| "wake".to_owned());
            let payload = json!({
                "ok": true,
                "mode": mode,
                "text": text,
            });
            publish_activity_surface(state_root, "wake", payload.clone())?;
            Ok(DispatchResult::immediate(payload))
        }
        "agent" => start_agent_run(state_root, runtime, &store, &frame.params).await,
        "agent.wait" => wait_for_run(runtime, &frame.params).await,
        "chat.send" => start_chat_run(state_root, runtime, &store, &frame.params).await,
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
            Ok(DispatchResult::immediate(
                json!({ "ok": true, "canonicalKey": record.canonical_key }),
            ))
        }
        "chat.abort" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let record = store.resolve(&session_key).map_err(not_found_error)?;
            let run_ids = if let Some(run_id) = optional_str(&frame.params, "runId") {
                if abort_chat_run(state_root, runtime, &record.canonical_key, &run_id, "rpc")
                    .await
                    .map_err(internal_error)?
                {
                    vec![run_id]
                } else {
                    Vec::new()
                }
            } else {
                abort_chat_runs_for_session(state_root, runtime, &record.canonical_key, "rpc")
                    .await
                    .map_err(internal_error)?
            };
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "canonicalKey": record.canonical_key,
                "aborted": !run_ids.is_empty(),
                "runIds": run_ids,
            })))
        }
        "chat.history" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let record = store.resolve(&session_key).map_err(not_found_error)?;
            let mut result = chat::history_response(state_root, &record.canonical_key)
                .map_err(internal_error)?;
            result["canonicalKey"] = json!(record.canonical_key);
            Ok(DispatchResult::immediate(result))
        }
        "config.get" => config::config_value(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "config.schema" => Ok(DispatchResult::immediate(config::schema_value())),
        "config.set" => {
            if let Some(raw) = frame.params.get("raw").and_then(|value| value.as_str()) {
                let base_hash = frame
                    .params
                    .get("baseHash")
                    .and_then(|value| value.as_str());
                config::set_raw_value(state_root, raw, base_hash)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            } else {
                let key = required_str(&frame.params, "key")?;
                let value =
                    frame.params.get("value").cloned().ok_or_else(|| {
                        ("invalid-params".to_owned(), "value is required".to_owned())
                    })?;
                config::set_value(state_root, &key, &value)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            }
        }
        "config.patch" => {
            let patch = frame
                .params
                .get("patch")
                .cloned()
                .unwrap_or_else(|| json!({}));
            config::patch_value(state_root, &patch)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "config.apply" => {
            if let Some(raw) = frame.params.get("raw").and_then(|value| value.as_str()) {
                let base_hash = frame
                    .params
                    .get("baseHash")
                    .and_then(|value| value.as_str());
                config::apply_raw_value(state_root, raw, base_hash)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            } else {
                let patch = frame
                    .params
                    .get("patch")
                    .cloned()
                    .unwrap_or_else(|| json!({}));
                config::apply_value(state_root, &patch)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
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
            Ok(DispatchResult::immediate(result))
        }
        "last-heartbeat" => system::last_heartbeat(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "system-presence" => system::presence(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "presence.list" => system::presence_list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "status.summary" => system::status_summary(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "health.snapshot" => system::health_snapshot(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
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
            Ok(DispatchResult::immediate(result))
        }
        "models.list" => models::list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "logs.tail" => {
            let lines = frame
                .params
                .get("lines")
                .and_then(|value| value.as_u64())
                .or_else(|| frame.params.get("limit").and_then(|value| value.as_u64()))
                .unwrap_or(20) as usize;
            logs::tail(state_root, lines)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "usage.status" => system::usage_status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "usage.cost" => system::usage_cost(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "update.run" => update::run(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wizard.start" => {
            let flow = required_str(&frame.params, "flow")?;
            wizard::start(state_root, &flow)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "wizard.next" => wizard::next(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wizard.cancel" => wizard::cancel(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wizard.status" => wizard::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "node.pair.request" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_request(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.pair.list" => nodes::pair_list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "node.pair.approve" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_approve(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.pair.reject" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_reject(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.pair.verify" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_verify(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.rename" => {
            let node = required_str(&frame.params, "node")?;
            let name = required_str(&frame.params, "name")?;
            nodes::rename(state_root, &node, &name)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.list" => nodes::list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "node.describe" => {
            let node = required_str(&frame.params, "node")?;
            nodes::describe(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.invoke" => {
            let node = required_str(&frame.params, "node")?;
            let command = required_str(&frame.params, "command")?;
            nodes::invoke(state_root, &node, &command)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.invoke.result" => {
            let result_id = required_str(&frame.params, "resultId")?;
            nodes::invoke_result(state_root, &result_id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.event" => {
            let node = required_str(&frame.params, "node")?;
            let kind = required_str(&frame.params, "kind")?;
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            nodes::event(state_root, &node, &kind, payload)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "browser.request" => {
            let url = required_str(&frame.params, "url")?;
            let method = frame
                .params
                .get("method")
                .and_then(|value| value.as_str())
                .unwrap_or("GET")
                .to_owned();
            browser::request(state_root, &url, &method)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "web.login.start" => {
            let channel =
                optional_str(&frame.params, "channel").unwrap_or_else(|| "whatsapp".to_owned());
            let workspace =
                optional_str(&frame.params, "workspace").unwrap_or_else(|| "main".to_owned());
            channels::mark_login_start(state_root, &channel).map_err(internal_error)?;
            browser::login_start(state_root, &channel, &workspace)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "web.login.wait" => {
            let login_id = frame.params.get("loginId").and_then(|value| value.as_str());
            let result = browser::login_wait(state_root, login_id).map_err(internal_error)?;
            if let Some(channel) = result.get("channel").and_then(|value| value.as_str()) {
                channels::mark_login_wait(state_root, channel).map_err(internal_error)?;
            }
            Ok(DispatchResult::immediate(result))
        }
        "device.pair.list" => devices::pair_list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "device.pair.approve" => {
            let device = required_str_alias(&frame.params, &["device", "requestId", "deviceId"])?;
            devices::pair_approve(state_root, &device)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "device.pair.reject" => {
            let device = required_str_alias(&frame.params, &["device", "requestId", "deviceId"])?;
            devices::pair_reject(state_root, &device)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "device.token.rotate" => {
            let device = required_str_alias(&frame.params, &["device", "deviceId"])?;
            devices::token_rotate(state_root, &device)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "device.token.revoke" => {
            let device = required_str(&frame.params, "device")?;
            let token = required_str(&frame.params, "token")?;
            devices::token_revoke(state_root, &device, &token)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approval.request" => {
            let command = required_str(&frame.params, "command")?;
            let node = required_str(&frame.params, "node")?;
            approvals::request(state_root, &command, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approval.resolve" => {
            let approval_id = required_str(&frame.params, "approvalId")?;
            let decision = required_str(&frame.params, "decision")?;
            approvals::resolve(state_root, &approval_id, &decision)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approvals.get" => approvals::get(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "exec.approvals.set" => {
            let mode = required_str(&frame.params, "mode")?;
            approvals::set_mode(state_root, &mode)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approvals.node.get" => {
            let node = required_str(&frame.params, "node")?;
            approvals::node_get(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approvals.node.set" => {
            let node = required_str(&frame.params, "node")?;
            let mode = required_str(&frame.params, "mode")?;
            approvals::node_set(state_root, &node, &mode)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "channels.status" => channels::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "channels.logout" => {
            let channel = required_str(&frame.params, "channel")?;
            channels::logout(state_root, &channel)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.status" => cron::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "cron.list" => cron::list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
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
            .map(DispatchResult::immediate)
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
            cron::update(state_root, &id, enabled, description)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.run" => {
            let id = required_str(&frame.params, "id")?;
            cron::run(state_root, &id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.runs" => {
            let id = required_str(&frame.params, "id")?;
            cron::runs(state_root, &id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.remove" => {
            let id = required_str(&frame.params, "id")?;
            cron::remove(state_root, &id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "talk.mode" => {
            let mode = required_str(&frame.params, "mode")?;
            system::talk_mode(state_root, &mode)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "tts.status" => system::tts_status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "tts.enable" => system::tts_enable(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "tts.disable" => system::tts_disable(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "tts.convert" => {
            let text = required_str(&frame.params, "text")?;
            system::tts_convert(state_root, &text)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "tts.setProvider" => {
            let provider = required_str(&frame.params, "provider")?;
            system::tts_set_provider(state_root, &provider)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "tts.providers" => Ok(DispatchResult::immediate(system::tts_providers())),
        "voicewake.get" => system::voicewake_get(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
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
            system::voicewake_set(state_root, enabled, &phrase)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "skills.status" => skills::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "skills.bins" => skills::bins(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "skills.install" => {
            let skill = required_str_alias(&frame.params, &["skill", "skillKey", "name"])?;
            skills::install(state_root, &skill)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "skills.update" => {
            let skill = required_str_alias(&frame.params, &["skill", "skillKey", "name"])?;
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool());
            let api_key = frame.params.get("apiKey").and_then(|value| value.as_str());
            skills::update(state_root, &skill, enabled, api_key)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        method if method.starts_with("nara.") => {
            super::nara::dispatch_nara(method, &frame.params).map(DispatchResult::immediate)
        }
        _ => Err((
            "unimplemented".to_owned(),
            format!("{} is not implemented yet", frame.method),
        )),
    }
}

async fn start_agent_run(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    store: &SessionStore,
    params: &Value,
) -> Result<DispatchResult, (String, String)> {
    let session_key = required_str(params, "sessionKey")?;
    let message = required_str(params, "message")?;
    let run_id =
        optional_str(params, "idempotencyKey").unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let requested_spawned_by = params.get("spawnedBy").and_then(Value::as_str);
    let subagent_launch =
        subagents::resolve_agent_launch_context(store, &session_key, requested_spawned_by)
            .map_err(internal_error)?;
    let record = store.ensure(&session_key).map_err(internal_error)?;
    let canonical_key = record.canonical_key.clone();
    let agent_id =
        agent_id_from_session_key(&canonical_key).unwrap_or_else(|| canonical_key.clone());
    let spawned_by_patch = match subagent_launch.as_ref() {
        Some(context) => Some(Some(context.spawned_by.clone())),
        None => {
            if params.get("spawnedBy").is_some() {
                return Err(invalid_params_error(
                    "spawnedBy is only supported for subagent:* sessions",
                ));
            }
            None
        }
    };
    let record = store
        .patch(
            &canonical_key,
            SessionPatch {
                active_agent_id: Some(agent_id),
                subagent_lineage: subagent_launch
                    .as_ref()
                    .map(|context| context.subagent_lineage.clone()),
                spawned_by: spawned_by_patch,
                vault_now_path: inherit_nullable_string_field(
                    params,
                    "vaultNowPath",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.vault_now_path.clone()),
                ),
                delivery_context: inherit_nullable_value_field(
                    params,
                    "deliveryContext",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.delivery_context.clone()),
                ),
                channel: inherit_nullable_string_field(
                    params,
                    "channel",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.channel.clone()),
                ),
                thread_id: inherit_nullable_string_field(
                    params,
                    "threadId",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.thread_id.clone()),
                ),
                group_id: inherit_nullable_string_field(
                    params,
                    "groupId",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.group_id.clone()),
                ),
                group_channel: inherit_nullable_string_field(
                    params,
                    "groupChannel",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.group_channel.clone()),
                ),
                group_space: inherit_nullable_string_field(
                    params,
                    "groupSpace",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.group_space.clone()),
                ),
                label: nullable_string_field(params, "label"),
                thinking_level: nullable_string_field(params, "thinkingLevel"),
                verbose_level: nullable_string_field(params, "verboseLevel"),
                reasoning_level: nullable_string_field(params, "reasoningLevel"),
                model_override: nullable_string_field(params, "modelOverride"),
                provider_override: nullable_string_field(params, "providerOverride"),
                ..SessionPatch::default()
            },
        )
        .map_err(internal_error)?;
    let canonical_key = record.canonical_key.clone();

    runtime.register_run(RunContext::new(&run_id, &canonical_key, "agent"));
    runtime.cache_snapshot(RunSnapshot {
        run_id: run_id.clone(),
        session_key: canonical_key.clone(),
        status: "running".to_owned(),
        started_at_ms: now_ms(),
        ended_at_ms: None,
        error: None,
    });
    publish_session_surface(state_root, &record)?;
    transcripts::append_message(state_root, &canonical_key, "user", &message, Some(&run_id))
        .map_err(internal_error)?;

    Ok(DispatchResult::with_post_response(
        json!({
            "ok": true,
            "runId": run_id.clone(),
            "canonicalKey": canonical_key.clone(),
            "status": "accepted",
            "acceptedAt": now_ms(),
        }),
        PostResponseAction::StartAgentRun {
            run_id,
            session_key: canonical_key,
            message,
        },
    ))
}

async fn start_chat_run(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    store: &SessionStore,
    params: &Value,
) -> Result<DispatchResult, (String, String)> {
    let session_key = required_str(params, "sessionKey")?;
    let message = required_str(params, "message")?;
    let record = store.ensure(&session_key).map_err(internal_error)?;
    if is_stop_command_text(&message) {
        let run_ids =
            abort_chat_runs_for_session(state_root, runtime, &record.canonical_key, "stop")
                .await
                .map_err(internal_error)?;
        return Ok(DispatchResult::immediate(json!({
            "ok": true,
            "canonicalKey": record.canonical_key,
            "aborted": !run_ids.is_empty(),
            "runIds": run_ids,
        })));
    }
    let run_id =
        chat::send_message(state_root, &record.canonical_key, &message).map_err(internal_error)?;

    runtime.register_run(RunContext::new(&run_id, &record.canonical_key, "chat.send"));
    runtime.cache_snapshot(RunSnapshot {
        run_id: run_id.clone(),
        session_key: record.canonical_key.clone(),
        status: "running".to_owned(),
        started_at_ms: now_ms(),
        ended_at_ms: None,
        error: None,
    });
    runtime.add_chat_run(&record.canonical_key, &run_id);
    publish_session_surface(state_root, &record)?;

    Ok(DispatchResult::with_post_response(
        json!({
            "ok": true,
            "runId": run_id.clone(),
            "canonicalKey": record.canonical_key.clone(),
            "status": "started",
        }),
        PostResponseAction::StartChatRun {
            run_id,
            session_key: record.canonical_key,
            message,
        },
    ))
}

async fn wait_for_run(
    runtime: &GatewayRuntimeState,
    params: &Value,
) -> Result<DispatchResult, (String, String)> {
    let run_id = required_str(params, "runId")?;
    let timeout_ms = params
        .get("timeoutMs")
        .and_then(|value| value.as_u64())
        .unwrap_or(30_000);
    let deadline = tokio::time::Instant::now() + Duration::from_millis(timeout_ms);

    loop {
        if let Some(snapshot) = runtime.snapshot(&run_id) {
            if snapshot.ended_at_ms.is_some() {
                return Ok(DispatchResult::immediate(json!({
                    "runId": snapshot.run_id,
                    "status": snapshot.status,
                    "startedAt": snapshot.started_at_ms,
                    "endedAt": snapshot.ended_at_ms,
                    "error": snapshot.error,
                })));
            }
        }

        if tokio::time::Instant::now() >= deadline {
            return Ok(DispatchResult::immediate(json!({
                "runId": run_id,
                "status": "timeout",
            })));
        }

        tokio::time::sleep(Duration::from_millis(10)).await;
    }
}

async fn execute_run_job(
    runtime: GatewayRuntimeState,
    state_root: PathBuf,
    session_key: String,
    run_id: String,
    message: String,
    emit_chat_events: bool,
) {
    let agent_id = agent_id_from_session_key(&session_key);
    let job = tokio::task::spawn_blocking(move || {
        agent::spawn::run_prompt(agent_id.as_deref(), &[], Some(&message), false)
    })
    .await;

    match job {
        Ok(Ok(output)) => {
            let finished_at = now_ms();
            let trimmed = output.trim().to_owned();
            runtime.cache_snapshot(RunSnapshot {
                run_id: run_id.clone(),
                session_key: session_key.clone(),
                status: "ok".to_owned(),
                started_at_ms: runtime
                    .run_context(&run_id)
                    .map(|context| context.started_at_ms)
                    .unwrap_or(finished_at),
                ended_at_ms: Some(finished_at),
                error: None,
            });
            let assistant = if trimmed.is_empty() {
                "completed".to_owned()
            } else {
                trimmed.clone()
            };
            let _ = transcripts::append_message(
                &state_root,
                &session_key,
                "assistant",
                &assistant,
                Some(&run_id),
            );
            if emit_chat_events {
                let _ = chat::inject_message(&state_root, &session_key, "assistant", &assistant);
                let final_seq = runtime.next_seq(&format!("chat:{run_id}"));
                runtime.broadcast(GatewayEvent::new(
                    "chat",
                    Some(&run_id),
                    Some(&session_key),
                    Some(final_seq),
                    json!({
                        "runId": run_id,
                        "sessionKey": session_key,
                        "seq": final_seq,
                        "state": "final",
                        "message": assistant,
                    }),
                ));
            }
            let agent_seq = runtime.next_seq(&format!("agent:{run_id}"));
            runtime.broadcast(GatewayEvent::new(
                "agent",
                Some(&run_id),
                Some(&session_key),
                Some(agent_seq),
                json!({
                    "runId": run_id.clone(),
                    "sessionKey": session_key.clone(),
                    "seq": agent_seq,
                    "stream": "lifecycle",
                    "data": {
                        "phase": "end",
                    }
                }),
            ));
        }
        Ok(Err(err)) => {
            let error = err;
            let finished_at = now_ms();
            runtime.cache_snapshot(RunSnapshot {
                run_id: run_id.clone(),
                session_key: session_key.clone(),
                status: "error".to_owned(),
                started_at_ms: runtime
                    .run_context(&run_id)
                    .map(|context| context.started_at_ms)
                    .unwrap_or(finished_at),
                ended_at_ms: Some(finished_at),
                error: Some(error.clone()),
            });
            if emit_chat_events {
                let seq = runtime.next_seq(&format!("chat:{run_id}"));
                runtime.broadcast(GatewayEvent::new(
                    "chat",
                    Some(&run_id),
                    Some(&session_key),
                    Some(seq),
                    json!({
                        "runId": run_id,
                        "sessionKey": session_key,
                        "seq": seq,
                        "state": "error",
                        "errorMessage": error,
                    }),
                ));
            }
            let agent_seq = runtime.next_seq(&format!("agent:{run_id}"));
            runtime.broadcast(GatewayEvent::new(
                "agent",
                Some(&run_id),
                Some(&session_key),
                Some(agent_seq),
                json!({
                    "runId": run_id.clone(),
                    "sessionKey": session_key.clone(),
                    "seq": agent_seq,
                    "stream": "lifecycle",
                    "data": {
                        "phase": "error",
                        "error": error.clone(),
                    }
                }),
            ));
        }
        Err(err) => {
            let error = err.to_string();
            let finished_at = now_ms();
            runtime.cache_snapshot(RunSnapshot {
                run_id: run_id.clone(),
                session_key: session_key.clone(),
                status: "error".to_owned(),
                started_at_ms: runtime
                    .run_context(&run_id)
                    .map(|context| context.started_at_ms)
                    .unwrap_or(finished_at),
                ended_at_ms: Some(finished_at),
                error: Some(error.clone()),
            });
            if emit_chat_events {
                let seq = runtime.next_seq(&format!("chat:{run_id}"));
                runtime.broadcast(GatewayEvent::new(
                    "chat",
                    Some(&run_id),
                    Some(&session_key),
                    Some(seq),
                    json!({
                        "runId": run_id,
                        "sessionKey": session_key,
                        "seq": seq,
                        "state": "error",
                        "errorMessage": error,
                    }),
                ));
            }
            let agent_seq = runtime.next_seq(&format!("agent:{run_id}"));
            runtime.broadcast(GatewayEvent::new(
                "agent",
                Some(&run_id),
                Some(&session_key),
                Some(agent_seq),
                json!({
                    "runId": run_id.clone(),
                    "sessionKey": session_key.clone(),
                    "seq": agent_seq,
                    "stream": "lifecycle",
                    "data": {
                        "phase": "error",
                        "error": error.clone(),
                    }
                }),
            ));
        }
    }
}

#[derive(Debug)]
struct DispatchResult {
    result: Value,
    post_response: Option<PostResponseAction>,
}

impl DispatchResult {
    fn immediate(result: Value) -> Self {
        Self {
            result,
            post_response: None,
        }
    }

    fn with_post_response(result: Value, post_response: PostResponseAction) -> Self {
        Self {
            result,
            post_response: Some(post_response),
        }
    }
}

#[derive(Debug)]
enum PostResponseAction {
    StartAgentRun {
        run_id: String,
        session_key: String,
        message: String,
    },
    StartChatRun {
        run_id: String,
        session_key: String,
        message: String,
    },
}

async fn execute_post_response(
    action: PostResponseAction,
    runtime: GatewayRuntimeState,
    state_root: PathBuf,
) {
    match action {
        PostResponseAction::StartAgentRun {
            run_id,
            session_key,
            message,
        } => {
            let agent_seq = runtime.next_seq(&format!("agent:{run_id}"));
            runtime.broadcast(GatewayEvent::new(
                "agent",
                Some(&run_id),
                Some(&session_key),
                Some(agent_seq),
                json!({
                    "runId": run_id.clone(),
                    "sessionKey": session_key.clone(),
                    "seq": agent_seq,
                    "stream": "lifecycle",
                    "data": {
                        "phase": "start",
                        "message": message.clone(),
                    }
                }),
            ));

            tokio::spawn(async move {
                execute_run_job(runtime, state_root, session_key, run_id, message, false).await;
            });
        }
        PostResponseAction::StartChatRun {
            run_id,
            session_key,
            message,
        } => {
            tokio::spawn(async move {
                execute_chat_run(runtime, state_root, session_key, run_id, message).await;
            });
        }
    }
}

async fn execute_chat_run(
    runtime: GatewayRuntimeState,
    state_root: PathBuf,
    session_key: String,
    run_id: String,
    message: String,
) {
    let agent_id = agent_id_from_session_key(&session_key);
    let launched = match agent::spawn::spawn_process(agent_id.as_deref(), &[], Some(&message)) {
        Ok(launched) => launched,
        Err(error) => {
            finalize_chat_error(&runtime, &session_key, &run_id, error);
            runtime.remove_chat_run(&run_id);
            return;
        }
    };

    let child = Arc::new(AsyncMutex::new(launched.child));
    let stdout = {
        let mut guard = child.lock().await;
        guard.stdout.take()
    };
    let stderr = {
        let mut guard = child.lock().await;
        guard.stderr.take()
    };
    runtime.register_chat_process(&run_id, child.clone());

    let stderr_task = tokio::spawn(async move {
        let mut output = String::new();
        if let Some(stderr) = stderr {
            let mut reader = BufReader::new(stderr);
            let _ = reader.read_to_string(&mut output).await;
        }
        output
    });

    let mut accumulated = String::new();
    if let Some(stdout) = stdout {
        let mut lines = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if !accumulated.is_empty() {
                accumulated.push('\n');
            }
            accumulated.push_str(&line);
            let seq = runtime.next_seq(&format!("chat:{run_id}"));
            runtime.broadcast(GatewayEvent::new(
                "chat",
                Some(&run_id),
                Some(&session_key),
                Some(seq),
                json!({
                    "runId": run_id.clone(),
                    "sessionKey": session_key.clone(),
                    "seq": seq,
                    "state": "delta",
                    "message": accumulated.clone(),
                }),
            ));
        }
    }

    let wait_result = {
        let mut guard = child.lock().await;
        guard.wait().await
    };
    runtime.remove_chat_process(&run_id);
    runtime.remove_chat_run(&run_id);

    let stderr_output = stderr_task.await.unwrap_or_default();
    if runtime.take_chat_aborted(&run_id) {
        return;
    }

    match wait_result {
        Ok(status) if status.success() => {
            let assistant = if accumulated.trim().is_empty() {
                "completed".to_owned()
            } else {
                accumulated.trim().to_owned()
            };
            let finished_at = now_ms();
            runtime.cache_snapshot(RunSnapshot {
                run_id: run_id.clone(),
                session_key: session_key.clone(),
                status: "ok".to_owned(),
                started_at_ms: runtime
                    .run_context(&run_id)
                    .map(|context| context.started_at_ms)
                    .unwrap_or(finished_at),
                ended_at_ms: Some(finished_at),
                error: None,
            });
            let _ = chat::inject_message(&state_root, &session_key, "assistant", &assistant);
            let final_seq = runtime.next_seq(&format!("chat:{run_id}"));
            runtime.broadcast(GatewayEvent::new(
                "chat",
                Some(&run_id),
                Some(&session_key),
                Some(final_seq),
                json!({
                    "runId": run_id.clone(),
                    "sessionKey": session_key.clone(),
                    "seq": final_seq,
                    "state": "final",
                    "message": assistant,
                }),
            ));
        }
        Ok(status) => {
            let message = if stderr_output.trim().is_empty() {
                format!("pi exited with status {status}")
            } else {
                stderr_output.trim().to_owned()
            };
            finalize_chat_error(&runtime, &session_key, &run_id, message);
        }
        Err(err) => finalize_chat_error(&runtime, &session_key, &run_id, err.to_string()),
    }
}

async fn abort_chat_runs_for_session(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    session_key: &str,
    stop_reason: &str,
) -> Result<Vec<String>, String> {
    let mut aborted = Vec::new();
    for run_id in runtime.active_chat_runs(session_key) {
        if abort_chat_run(state_root, runtime, session_key, &run_id, stop_reason).await? {
            aborted.push(run_id);
        }
    }
    Ok(aborted)
}

async fn abort_chat_run(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    session_key: &str,
    run_id: &str,
    stop_reason: &str,
) -> Result<bool, String> {
    if let Some(context) = runtime.run_context(run_id) {
        if context.session_key != session_key {
            return Ok(false);
        }
    }

    let Some(child) = runtime.chat_process(run_id) else {
        return Ok(false);
    };

    runtime.mark_chat_aborted(run_id);
    {
        let mut guard = child.lock().await;
        let _ = guard.kill().await;
        let _ = guard.wait().await;
    }
    runtime.remove_chat_process(run_id);
    runtime.remove_chat_run(run_id);
    chat::abort_run(state_root, session_key, run_id)?;
    let ended_at = now_ms();
    runtime.cache_snapshot(RunSnapshot {
        run_id: run_id.to_owned(),
        session_key: session_key.to_owned(),
        status: "aborted".to_owned(),
        started_at_ms: runtime
            .run_context(run_id)
            .map(|context| context.started_at_ms)
            .unwrap_or(ended_at),
        ended_at_ms: Some(ended_at),
        error: None,
    });
    let seq = runtime.next_seq(&format!("chat:{run_id}"));
    runtime.broadcast(GatewayEvent::new(
        "chat",
        Some(run_id),
        Some(session_key),
        Some(seq),
        json!({
            "runId": run_id,
            "sessionKey": session_key,
            "seq": seq,
            "state": "aborted",
            "stopReason": stop_reason,
        }),
    ));
    Ok(true)
}

fn finalize_chat_error(
    runtime: &GatewayRuntimeState,
    session_key: &str,
    run_id: &str,
    error: String,
) {
    let finished_at = now_ms();
    runtime.cache_snapshot(RunSnapshot {
        run_id: run_id.to_owned(),
        session_key: session_key.to_owned(),
        status: "error".to_owned(),
        started_at_ms: runtime
            .run_context(run_id)
            .map(|context| context.started_at_ms)
            .unwrap_or(finished_at),
        ended_at_ms: Some(finished_at),
        error: Some(error.clone()),
    });
    let seq = runtime.next_seq(&format!("chat:{run_id}"));
    runtime.broadcast(GatewayEvent::new(
        "chat",
        Some(run_id),
        Some(session_key),
        Some(seq),
        json!({
            "runId": run_id,
            "sessionKey": session_key,
            "seq": seq,
            "state": "error",
            "errorMessage": error,
        }),
    ));
}

fn agent_id_from_session_key(session_key: &str) -> Option<String> {
    let mut parts = session_key.split(':');
    match (parts.next(), parts.next()) {
        (Some("agent"), Some(agent_id)) if !agent_id.is_empty() => Some(agent_id.to_owned()),
        _ => None,
    }
}

fn event_frame(event: &GatewayEvent) -> Value {
    let mut payload = match &event.payload {
        Value::Object(map) => Value::Object(map.clone()),
        other => json!({ "value": other }),
    };

    if let Value::Object(map) = &mut payload {
        if let Some(run_id) = &event.run_id {
            map.entry("runId".to_owned())
                .or_insert_with(|| Value::String(run_id.clone()));
        }
        if let Some(session_key) = &event.session_key {
            map.entry("sessionKey".to_owned())
                .or_insert_with(|| Value::String(session_key.clone()));
        }
        if let Some(seq) = event.seq {
            map.entry("seq".to_owned())
                .or_insert_with(|| Value::from(seq));
        }
    }

    json!({
        "type": "event",
        "event": event.channel,
        "payload": payload,
        "seq": event.seq,
    })
}

async fn maintenance_loop(state_root: PathBuf, runtime: GatewayRuntimeState) {
    let mut tick_interval = tokio::time::interval(Duration::from_millis(150));
    let mut health_interval = tokio::time::interval(Duration::from_millis(350));
    let mut heartbeat_interval = tokio::time::interval(Duration::from_millis(550));

    loop {
        tokio::select! {
            _ = tick_interval.tick() => {
                let seq = runtime.next_seq("__gateway__");
                runtime.broadcast(GatewayEvent::new(
                    "tick",
                    None,
                    None,
                    Some(seq),
                    json!({ "ts": now_ms() }),
                ));
            }
            _ = health_interval.tick() => {
                let seq = runtime.next_seq("__gateway__");
                let payload = super::system::health_snapshot(&state_root).unwrap_or_else(|_| json!({
                    "ok": false,
                }));
                runtime.broadcast(GatewayEvent::new(
                    "health",
                    None,
                    None,
                    Some(seq),
                    payload,
                ));
            }
            _ = heartbeat_interval.tick() => {
                let seq = runtime.next_seq("__gateway__");
                runtime.broadcast(GatewayEvent::new(
                    "heartbeat",
                    None,
                    None,
                    Some(seq),
                    json!({
                        "ts": now_ms(),
                        "status": "idle",
                    }),
                ));
            }
        }
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

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
