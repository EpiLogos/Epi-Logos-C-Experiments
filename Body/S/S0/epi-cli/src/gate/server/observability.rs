use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
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

    // The periodic clock must NEVER stall on blocking work. Earlier this loop
    // `.await`ed the health-snapshot filesystem scan and the cron scan INSIDE
    // the `select!` branch — and `select!` runs the chosen branch to completion
    // before polling any other, so a slow blocking call (e.g. blocking-pool
    // saturation or cron-state lock contention under concurrent gateways) froze
    // the whole loop: no tick, no health, no heartbeat emitted while it waited.
    // Fix: emit tick/health/heartbeat on schedule and run the blocking snapshot
    // and cron scan as DETACHED tasks that broadcast their results when done.
    // The single-flight guards preserve the original "one snapshot / one cron
    // check at a time" semantics (no overlapping fires) without blocking the
    // clock — if a scan is still running when the next interval fires, that tick
    // simply skips spawning a duplicate.
    let health_busy = Arc::new(AtomicBool::new(false));
    let cron_busy = Arc::new(AtomicBool::new(false));

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
                } else if health_busy
                    .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
                    .is_ok()
                {
                    let state_root = state_root.clone();
                    let runtime = runtime.clone();
                    let health_busy = Arc::clone(&health_busy);
                    tokio::spawn(async move {
                        let payload = tokio::task::spawn_blocking(move || {
                            crate::gate::system::health_snapshot(&state_root)
                                .unwrap_or_else(|_| json!({ "ok": false }))
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
                        health_busy.store(false, Ordering::Release);
                    });
                }
            }
            _ = heartbeat_interval.tick() => {
                // Emit the heartbeat on schedule first — it is never gated on the
                // cron scan (cron.fired/cron.error carry their own later seq).
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

                if let Some(registration) = registration.clone() {
                    let _ =
                        tokio::task::spawn_blocking(move || registration.heartbeat_gateway());
                }

                if cron_busy
                    .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
                    .is_ok()
                {
                    let state_root = state_root.clone();
                    let runtime = runtime.clone();
                    let cron_busy = Arc::clone(&cron_busy);
                    tokio::spawn(async move {
                        let cron_result = tokio::task::spawn_blocking(move || {
                            cron::check_due_and_fire(&state_root)
                        })
                        .await;
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
                        cron_busy.store(false, Ordering::Release);
                    });
                }
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
