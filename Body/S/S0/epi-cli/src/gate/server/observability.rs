use std::path::PathBuf;
use std::time::Duration;

use serde_json::{json, Value};
use tokio::net::TcpListener;

use crate::gate::cron;
use crate::gate::events::GatewayEvent;
use crate::gate::parity::DEFAULT_GATEWAY_PORT;
use crate::gate::runtime::GatewayRuntimeState;
use crate::gate::spacetimedb_bridge::SpacetimeRegistration;

use super::{now_ms, optional_str};

pub(super) fn event_frame(event: &GatewayEvent) -> Value {
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

pub(super) async fn maintenance_loop(
    state_root: PathBuf,
    runtime: GatewayRuntimeState,
    registration: Option<SpacetimeRegistration>,
    lightweight_health: bool,
) {
    let mut tick_interval = tokio::time::interval(Duration::from_millis(150));
    let mut health_interval = tokio::time::interval(Duration::from_millis(350));
    let mut heartbeat_interval = tokio::time::interval(Duration::from_millis(550));
    heartbeat_interval.tick().await;

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
                if lightweight_health {
                    let seq = runtime.next_seq("__gateway__");
                    runtime.broadcast(GatewayEvent::new(
                        "health",
                        None,
                        None,
                        Some(seq),
                        json!({
                            "ok": true,
                            "source": "lightweight-test-maintenance",
                        }),
                    ));
                    continue;
                }
                let state_root = state_root.clone();
                let payload = tokio::task::spawn_blocking(move || {
                    crate::gate::system::health_snapshot(&state_root).unwrap_or_else(|_| json!({
                        "ok": false,
                    }))
                })
                .await
                .unwrap_or_else(|_| json!({ "ok": false }));
                let seq = runtime.next_seq("__gateway__");
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
                if let Some(registration) = registration.clone() {
                    let _ =
                        tokio::task::spawn_blocking(move || registration.heartbeat_gateway());
                }
                let cron_result = {
                    let state_root = state_root.clone();
                    tokio::task::spawn_blocking(move || cron::check_due_and_fire(&state_root)).await
                };
                match cron_result {
                    Ok(Ok(fired_jobs)) => {
                        for payload in fired_jobs {
                            let cron_seq = runtime.next_seq("__gateway__:cron");
                            runtime.broadcast(GatewayEvent::new(
                                "cron.fired",
                                None,
                                None,
                                Some(cron_seq),
                                payload,
                            ));
                        }
                    }
                    Ok(Err(message)) => {
                        let cron_seq = runtime.next_seq("__gateway__:cron");
                        runtime.broadcast(GatewayEvent::new(
                            "cron.error",
                            None,
                            None,
                            Some(cron_seq),
                            json!({ "message": message }),
                        ));
                    }
                    Err(err) => {
                        let cron_seq = runtime.next_seq("__gateway__:cron");
                        runtime.broadcast(GatewayEvent::new(
                            "cron.error",
                            None,
                            None,
                            Some(cron_seq),
                            json!({ "message": err.to_string() }),
                        ));
                    }
                }
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

pub(super) fn local_port(listener: &TcpListener) -> Result<u16, String> {
    listener
        .local_addr()
        .map(|address| address.port())
        .map_err(|err| err.to_string())
}

pub(super) async fn register_gateway_with_spacetimedb(
    port: u16,
    state_root: &PathBuf,
) -> Result<(), String> {
    let Some(registration) = SpacetimeRegistration::from_env(port, state_root)? else {
        return Ok(());
    };
    tokio::task::spawn_blocking(move || {
        registration.register_gateway()?;
        registration.heartbeat_gateway()
    })
    .await
    .map_err(|err| err.to_string())?
}

pub(super) async fn register_client_with_spacetimedb(
    state_root: &PathBuf,
    params: &Value,
) -> Result<(), String> {
    let Some(registration) = SpacetimeRegistration::from_env(DEFAULT_GATEWAY_PORT, state_root)?
    else {
        return Ok(());
    };
    let client_id =
        optional_str(params, "clientId").unwrap_or_else(|| "client:anonymous".to_owned());
    let client_kind =
        optional_str(params, "clientKind").unwrap_or_else(|| "gateway-client".to_owned());
    let scopes = params
        .get("scopes")
        .and_then(Value::as_array)
        .map(|items| {
            items
                .iter()
                .filter_map(Value::as_str)
                .map(str::to_owned)
                .collect::<Vec<_>>()
        })
        .filter(|items| !items.is_empty())
        .unwrap_or_else(|| vec!["s3.session".to_owned(), "s3'.temporal.context".to_owned()]);

    tokio::task::spawn_blocking(move || {
        registration.register_client(&client_id, &client_kind, &scopes)
    })
    .await
    .map_err(|err| err.to_string())?
}
