//! Coordinate: M' (gateway supervisor)
//! Residency: Body/M/pratibimba-app/src-tauri/src
//! Actualises: boot = supervise — the face cannot open without the organism.
//!   Probes 127.0.0.1:18794; adopts an already-running gateway as `external`,
//!   otherwise spawns `${EPI_BIN:-epi} gate start --port 18794` and monitors it.
//!   Emits `gateway://status` events consumed by src/bridge/tauriEvents.ts.
//! Public surface: SupervisorState, SupervisorStatus, start_supervisor,
//!   shutdown, gateway_status (tauri command), probe_port, epi_binary.
//! Does NOT own: the gateway protocol (Body/S/S3/gateway-contract) or the
//!   kernel profile (Body/S/S0/portal-core).

use std::net::{SocketAddr, TcpStream};
use std::process::{Child, Command};
use std::sync::Mutex;
use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

pub const GATEWAY_PORT: u16 = 18794;
pub const STATUS_EVENT: &str = "gateway://status";
const PROBE_TIMEOUT: Duration = Duration::from_millis(400);
const LOOP_INTERVAL: Duration = Duration::from_secs(3);

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SupervisorStatus {
    pub state: String,
    pub port: u16,
    pub pid: Option<u32>,
    pub detail: String,
}

impl SupervisorStatus {
    fn new(state: &str, port: u16, pid: Option<u32>, detail: impl Into<String>) -> Self {
        Self {
            state: state.to_string(),
            port,
            pid,
            detail: detail.into(),
        }
    }
}

impl Default for SupervisorStatus {
    fn default() -> Self {
        Self::new("probing", GATEWAY_PORT, None, "not yet probed")
    }
}

#[derive(Default)]
pub struct SupervisorState {
    pub current: Mutex<SupervisorStatus>,
    pub child: Mutex<Option<Child>>,
}

pub fn probe_port(port: u16, timeout: Duration) -> bool {
    let addr: SocketAddr = ([127, 0, 0, 1], port).into();
    TcpStream::connect_timeout(&addr, timeout).is_ok()
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum GatewayPhase {
    Supervised(u32),
    External,
    Starting(u32),
    NeedsSpawn,
}

/// The supervisor state machine, pure: (port observation, child observation) → phase.
/// The loop acts on the phase; only NeedsSpawn has a side effect.
pub fn classify(port_open: bool, child_pid: Option<u32>) -> GatewayPhase {
    match (port_open, child_pid) {
        (true, Some(pid)) => GatewayPhase::Supervised(pid),
        (true, None) => GatewayPhase::External,
        (false, Some(pid)) => GatewayPhase::Starting(pid),
        (false, None) => GatewayPhase::NeedsSpawn,
    }
}

/// Resolution: EPI_BIN env → `~/.epi/app/config.json` `epiBin` → `epi` (PATH).
pub fn epi_binary() -> String {
    if let Ok(bin) = std::env::var("EPI_BIN") {
        return bin;
    }
    if let Some(dir) = crate::vault::app_config_dir() {
        if let Ok(raw) = std::fs::read_to_string(dir.join("config.json")) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(&raw) {
                if let Some(bin) = value.get("epiBin").and_then(|b| b.as_str()) {
                    return bin.to_owned();
                }
            }
        }
    }
    "epi".to_string()
}

fn set_status(app: &AppHandle, status: SupervisorStatus) {
    let state: State<'_, SupervisorState> = app.state();
    {
        let mut current = state.current.lock().expect("supervisor status poisoned");
        if *current == status {
            return;
        }
        *current = status.clone();
    }
    let _ = app.emit(STATUS_EVENT, status);
}

/// The gateway is a system singleton managed through the `epi up` process
/// record at `<repo>/.epi/gate/up/gateway-process.json`. Spawning here keeps
/// that contract: logs land beside the record and the record is rewritten,
/// so `epi app dev`-style preflights stay coherent.
fn gate_up_dir() -> Option<std::path::PathBuf> {
    let vault = crate::vault::resolve_vault_root()?;
    Some(vault.parent()?.join(".epi").join("gate").join("up"))
}

fn spawn_gateway(app: &AppHandle) -> Result<u32, String> {
    let bin = epi_binary();
    let mut command = Command::new(&bin);
    command.args(["gate", "start", "--port", &GATEWAY_PORT.to_string()]);
    let record_dir = gate_up_dir();
    if let Some(dir) = &record_dir {
        let _ = std::fs::create_dir_all(dir);
        let open = |name: &str| {
            std::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open(dir.join(name))
        };
        if let (Ok(out), Ok(err)) = (
            open(&format!("gateway-{GATEWAY_PORT}.stdout.log")),
            open(&format!("gateway-{GATEWAY_PORT}.stderr.log")),
        ) {
            command.stdout(out).stderr(err);
        }
    }
    let child = command
        .spawn()
        .map_err(|err| format!("failed to spawn `{bin} gate start`: {err}"))?;
    let pid = child.id();
    if let Some(dir) = &record_dir {
        let record = serde_json::json!({
            "pid": pid,
            "port": GATEWAY_PORT,
            "stdoutLog": dir.join(format!("gateway-{GATEWAY_PORT}.stdout.log")).display().to_string(),
            "stderrLog": dir.join(format!("gateway-{GATEWAY_PORT}.stderr.log")).display().to_string(),
            "supervisor": "pratibimba-app"
        });
        let _ = std::fs::write(
            dir.join("gateway-process.json"),
            serde_json::to_string_pretty(&record).unwrap_or_default(),
        );
    }
    let state: State<'_, SupervisorState> = app.state();
    *state.child.lock().expect("supervisor child poisoned") = Some(child);
    Ok(pid)
}

/// User-invoked, record-respecting restart (plan T2.7). Stops the recorded
/// process (or our own child), waits for the port to free, and lets the
/// supervision loop respawn from EPI_BIN within one turn.
#[tauri::command]
pub fn gateway_restart(state: State<'_, SupervisorState>) -> Result<String, String> {
    let mut stopped = Vec::new();
    {
        let mut guard = state.child.lock().expect("supervisor child poisoned");
        if let Some(mut child) = guard.take() {
            let pid = child.id();
            let _ = child.kill();
            let _ = child.wait();
            stopped.push(pid);
        }
    }
    if let Some(dir) = gate_up_dir() {
        if let Ok(raw) = std::fs::read_to_string(dir.join("gateway-process.json")) {
            if let Ok(record) = serde_json::from_str::<serde_json::Value>(&raw) {
                if let Some(pid) = record.get("pid").and_then(|p| p.as_u64()) {
                    if !stopped.contains(&(pid as u32)) {
                        let _ = Command::new("kill").args(["-TERM", &pid.to_string()]).status();
                        stopped.push(pid as u32);
                    }
                }
            }
        }
    }
    for _ in 0..25 {
        if !probe_port(GATEWAY_PORT, Duration::from_millis(200)) {
            break;
        }
        std::thread::sleep(Duration::from_millis(400));
    }
    if probe_port(GATEWAY_PORT, Duration::from_millis(200)) {
        return Err("gateway port still occupied after record-respecting stop".to_owned());
    }
    Ok(format!(
        "stopped {:?}; supervision loop will respawn `{}` within ~3s",
        stopped,
        epi_binary()
    ))
}

fn supervised_child_pid(app: &AppHandle) -> Option<u32> {
    let state: State<'_, SupervisorState> = app.state();
    let mut guard = state.child.lock().expect("supervisor child poisoned");
    match guard.as_mut() {
        Some(child) => match child.try_wait() {
            Ok(Some(_exit)) => {
                *guard = None;
                None
            }
            Ok(None) => Some(child.id()),
            Err(_) => None,
        },
        None => None,
    }
}

pub fn start_supervisor(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            let port_open = probe_port(GATEWAY_PORT, PROBE_TIMEOUT);
            let child_pid = supervised_child_pid(&app);
            let status = match classify(port_open, child_pid) {
                GatewayPhase::Supervised(pid) => SupervisorStatus::new(
                    "supervised",
                    GATEWAY_PORT,
                    Some(pid),
                    "gateway healthy under supervision",
                ),
                GatewayPhase::External => SupervisorStatus::new(
                    "external",
                    GATEWAY_PORT,
                    None,
                    "adopted an externally-started gateway",
                ),
                GatewayPhase::Starting(pid) => SupervisorStatus::new(
                    "starting",
                    GATEWAY_PORT,
                    Some(pid),
                    "supervised gateway spawned; waiting for the port",
                ),
                GatewayPhase::NeedsSpawn => match spawn_gateway(&app) {
                    Ok(pid) => SupervisorStatus::new(
                        "starting",
                        GATEWAY_PORT,
                        Some(pid),
                        format!("spawned `{} gate start --port {GATEWAY_PORT}`", epi_binary()),
                    ),
                    Err(err) => SupervisorStatus::new("down", GATEWAY_PORT, None, err),
                },
            };
            set_status(&app, status);
            tokio::time::sleep(LOOP_INTERVAL).await;
        }
    });
}

pub fn shutdown(app: &AppHandle) {
    let state: State<'_, SupervisorState> = app.state();
    let mut guard = state.child.lock().expect("supervisor child poisoned");
    if let Some(mut child) = guard.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
}

#[tauri::command]
pub fn gateway_status(state: State<'_, SupervisorState>) -> SupervisorStatus {
    state
        .current
        .lock()
        .expect("supervisor status poisoned")
        .clone()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

    #[test]
    fn probe_detects_open_and_closed_ports() {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind test listener");
        let open_port = listener.local_addr().expect("listener addr").port();
        assert!(probe_port(open_port, Duration::from_millis(400)));
        drop(listener);
        assert!(!probe_port(open_port, Duration::from_millis(400)));
    }

    #[test]
    fn classify_covers_all_four_supervision_phases() {
        assert_eq!(classify(true, Some(7)), GatewayPhase::Supervised(7));
        assert_eq!(classify(true, None), GatewayPhase::External);
        assert_eq!(classify(false, Some(7)), GatewayPhase::Starting(7));
        assert_eq!(classify(false, None), GatewayPhase::NeedsSpawn);
    }

    #[test]
    fn dead_child_reclassifies_toward_respawn_not_starting() {
        // A reaped child yields child_pid=None on the next loop turn, so a
        // closed port must map to NeedsSpawn (respawn), never a stuck Starting.
        assert_eq!(classify(false, None), GatewayPhase::NeedsSpawn);
        // And an externally revived port with no child is adoption, not restart.
        assert_eq!(classify(true, None), GatewayPhase::External);
    }

    #[test]
    fn epi_binary_resolution_order_env_first() {
        std::env::set_var("EPI_BIN", "/tmp/epi-test-bin");
        assert_eq!(epi_binary(), "/tmp/epi-test-bin");
        std::env::remove_var("EPI_BIN");
        // Without the env override the chain falls to ~/.epi/app/config.json
        // `epiBin`, else "epi" — machine-dependent, so assert only that the
        // chain resolves to something invocable.
        assert!(!epi_binary().is_empty());
    }

    #[test]
    fn status_serialises_camel_case_for_the_ts_store() {
        let status = SupervisorStatus::new("supervised", GATEWAY_PORT, Some(42), "ok");
        let json = serde_json::to_value(&status).expect("serialise status");
        assert_eq!(json["state"], "supervised");
        assert_eq!(json["port"], 18794);
        assert_eq!(json["pid"], 42);
        assert_eq!(json["detail"], "ok");
    }
}
