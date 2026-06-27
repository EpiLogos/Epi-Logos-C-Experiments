use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt, AsyncReadExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{oneshot, Mutex as AsyncMutex};
use tokio_tungstenite::{accept_async, tungstenite::Message};

use crate::agent;
use crate::gate::events::GatewayEvent;
use crate::gate::protocol::{self, RequestFrame};
use crate::gate::runtime::{GatewayRuntimeState, RunContext, RunSnapshot};
use crate::gate::spacetimedb_bridge::SpacetimeRegistration;
use crate::gate::{auth, chat, transcripts};

use super::method_envelope::PostResponseAction;
use super::{agent_id_from_session_key, now_ms};

pub(super) async fn bind_with_retry(port: u16) -> Result<TcpListener, String> {
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

pub(super) async fn run_listener_loop(
    listener: TcpListener,
    state_root: PathBuf,
    runtime: GatewayRuntimeState,
    mut shutdown_rx: Option<oneshot::Receiver<()>>,
) -> Result<(), String> {
    let registration =
        SpacetimeRegistration::from_env(super::observability::local_port(&listener)?, &state_root)?;
    let lightweight_maintenance = shutdown_rx.is_some();
    let maintenance_task = tokio::spawn(super::observability::maintenance_loop(
        state_root.clone(),
        runtime.clone(),
        registration,
        lightweight_maintenance,
    ));
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
            let payload = match serde_json::to_string(&super::observability::event_frame(&event)) {
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
                    match super::observability::register_client_with_spacetimedb(
                        &state_root,
                        &frame.params,
                    )
                    .await
                    {
                        Ok(()) => (
                            protocol::success(frame.id, protocol::connect_result()),
                            None,
                        ),
                        Err(message) => (protocol::error(frame.id, "internal", message), None),
                    }
                }
                Err(err) => (protocol::error(frame.id, err.code, err.message), None),
            }
        } else {
            match super::dispatch::dispatch_rpc(&state_root, &runtime, &frame).await {
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

pub(super) async fn abort_chat_runs_for_session(
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

pub(super) async fn abort_chat_run(
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
