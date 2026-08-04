//! Coordinate: M' (gateway supervisor)
//! Residency: Body/M/pratibimba-app/src-tauri/src
//! Actualises: boot = supervise — the face cannot open without the organism.
//!   Probes 127.0.0.1:18794; adopts an already-running gateway as `external`,
//!   otherwise resolves a bounded, compatible `epi` binary from explicit,
//!   saved, repository, bundled, and PATH candidates, repairs stale saved
//!   configuration, spawns `epi gate start --port 18794`, and monitors it.
//!   Emits provenance-bearing `gateway://status` events consumed by
//!   src/bridge/tauriEvents.ts.
//! Public surface: SupervisorState, SupervisorStatus, EpiBinaryResolution,
//!   EpiBinaryCandidate, resolve_epi_binary_candidates, start_supervisor,
//!   shutdown, gateway_status (tauri command), probe_port, epi_binary.
//! Does NOT own: the gateway protocol (Body/S/S3/gateway-contract) or the
//!   kernel profile (Body/S/S0/portal-core).

use std::collections::HashSet;
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

pub const GATEWAY_PORT: u16 = 18794;
pub const STATUS_EVENT: &str = "gateway://status";
const PROBE_TIMEOUT: Duration = Duration::from_millis(400);
const BINARY_IDENTITY_TIMEOUT: Duration = Duration::from_secs(2);
const LOOP_INTERVAL: Duration = Duration::from_secs(3);

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SupervisorStatus {
    pub state: String,
    pub port: u16,
    pub pid: Option<u32>,
    pub detail: String,
    pub binary_path: Option<String>,
    pub binary_source: Option<String>,
    pub binary_identity: Option<String>,
}

impl SupervisorStatus {
    fn new(state: &str, port: u16, pid: Option<u32>, detail: impl Into<String>) -> Self {
        Self {
            state: state.to_string(),
            port,
            pid,
            detail: detail.into(),
            binary_path: None,
            binary_source: None,
            binary_identity: None,
        }
    }

    fn with_binary(mut self, binary: Option<&EpiBinaryResolution>) -> Self {
        if let Some(binary) = binary {
            self.binary_path = Some(binary.path.display().to_string());
            self.binary_source = Some(binary.source.clone());
            self.binary_identity = Some(binary.identity.clone());
        }
        self
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
    pub resolved_binary: Mutex<Option<EpiBinaryResolution>>,
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

#[derive(Clone, Debug, PartialEq)]
pub struct EpiBinaryResolution {
    pub path: PathBuf,
    pub source: String,
    pub identity: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct EpiBinaryCandidate {
    source: String,
    path: PathBuf,
}

impl EpiBinaryCandidate {
    pub fn new(source: impl Into<String>, path: impl Into<PathBuf>) -> Self {
        Self {
            source: source.into(),
            path: path.into(),
        }
    }
}

fn is_executable(path: &Path) -> bool {
    let Ok(metadata) = std::fs::metadata(path) else {
        return false;
    };
    if !metadata.is_file() {
        return false;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        metadata.permissions().mode() & 0o111 != 0
    }
    #[cfg(not(unix))]
    {
        true
    }
}

fn compatible_epi_identity(path: &Path) -> Result<String, String> {
    compatible_epi_identity_with_timeout(path, BINARY_IDENTITY_TIMEOUT)
}

fn compatible_epi_identity_with_timeout(path: &Path, timeout: Duration) -> Result<String, String> {
    let mut child = Command::new(path)
        .arg("--help")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|err| format!("could not execute compatibility probe: {err}"))?;
    let deadline = Instant::now() + timeout;
    loop {
        match child.try_wait() {
            Ok(Some(_)) => break,
            Ok(None) if Instant::now() < deadline => {
                std::thread::sleep(Duration::from_millis(10));
            }
            Ok(None) => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!(
                    "compatibility probe timed out after {} ms",
                    timeout.as_millis()
                ));
            }
            Err(err) => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(format!("could not wait for compatibility probe: {err}"));
            }
        }
    }
    let output = child
        .wait_with_output()
        .map_err(|err| format!("could not read compatibility probe output: {err}"))?;
    if !output.status.success() {
        return Err(format!("compatibility probe exited with {}", output.status));
    }
    let combined = format!(
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let identity = combined
        .lines()
        .map(str::trim)
        .find(|line| line.starts_with("Usage: epi "))
        .ok_or_else(|| "compatibility probe did not identify the epi command surface".to_owned())?;
    Ok(identity.to_owned())
}

pub fn resolve_epi_binary_candidates(
    candidates: impl IntoIterator<Item = EpiBinaryCandidate>,
) -> Result<EpiBinaryResolution, String> {
    let mut seen = HashSet::new();
    let mut failures = Vec::new();
    for candidate in candidates {
        let Ok(path) = candidate.path.canonicalize() else {
            failures.push(format!(
                "{}: missing ({})",
                candidate.source,
                candidate.path.display()
            ));
            continue;
        };
        if !seen.insert(path.clone()) {
            continue;
        }
        if !is_executable(&path) {
            failures.push(format!(
                "{}: not executable ({})",
                candidate.source,
                path.display()
            ));
            continue;
        }
        match compatible_epi_identity(&path) {
            Ok(identity) => {
                return Ok(EpiBinaryResolution {
                    path,
                    source: candidate.source,
                    identity,
                });
            }
            Err(reason) => failures.push(format!(
                "{}: incompatible ({}, {reason})",
                candidate.source,
                path.display()
            )),
        }
    }
    Err(format!(
        "no compatible epi binary found; {}",
        failures.join("; ")
    ))
}

fn app_config_path() -> Option<PathBuf> {
    std::env::var_os("EPI_APP_CONFIG_DIR")
        .map(PathBuf::from)
        .or_else(crate::vault::app_config_dir)
        .map(|dir| dir.join("config.json"))
}

fn read_saved_binary(config_path: Option<&Path>) -> Option<PathBuf> {
    let raw = std::fs::read_to_string(config_path?).ok()?;
    let value: serde_json::Value = serde_json::from_str(&raw).ok()?;
    let binary = value.get("epiBin")?.as_str()?.trim();
    (!binary.is_empty()).then(|| PathBuf::from(binary))
}

fn source_checkout_root() -> Option<PathBuf> {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .map(Path::to_path_buf)
}

fn path_candidates() -> Vec<EpiBinaryCandidate> {
    std::env::var_os("PATH")
        .into_iter()
        .flat_map(|value| std::env::split_paths(&value).collect::<Vec<_>>())
        .map(|dir| EpiBinaryCandidate::new("path", dir.join("epi")))
        .collect()
}

fn repair_saved_binary(config_path: &Path, selected: &Path) -> Result<(), String> {
    let raw = std::fs::read_to_string(config_path)
        .map_err(|err| format!("could not read saved app config: {err}"))?;
    let mut value: serde_json::Value = serde_json::from_str(&raw)
        .map_err(|err| format!("could not parse saved app config: {err}"))?;
    let object = value
        .as_object_mut()
        .ok_or_else(|| "saved app config is not a JSON object".to_owned())?;
    object.insert(
        "epiBin".to_owned(),
        serde_json::Value::String(selected.display().to_string()),
    );
    let parent = config_path
        .parent()
        .ok_or_else(|| "saved app config has no parent directory".to_owned())?;
    std::fs::create_dir_all(parent)
        .map_err(|err| format!("could not create app config directory: {err}"))?;
    let temporary = config_path.with_extension("json.tmp");
    std::fs::write(
        &temporary,
        serde_json::to_vec_pretty(&value).map_err(|err| err.to_string())?,
    )
    .map_err(|err| format!("could not write repaired app config: {err}"))?;
    std::fs::rename(&temporary, config_path)
        .map_err(|err| format!("could not install repaired app config: {err}"))
}

/// Resolve one executable, compatible epi command surface. A stale saved path
/// is skipped and repaired after a repository, bundled, or PATH candidate wins.
pub fn epi_binary() -> Result<EpiBinaryResolution, String> {
    let config_path = app_config_path();
    let saved = read_saved_binary(config_path.as_deref());
    let mut candidates = Vec::new();
    if let Some(bin) = std::env::var_os("EPI_BIN").filter(|value| !value.is_empty()) {
        candidates.push(EpiBinaryCandidate::new("explicit-env", bin));
    }
    if let Some(path) = saved.clone() {
        candidates.push(EpiBinaryCandidate::new("saved-config", path));
    }
    if let Some(root) = source_checkout_root() {
        candidates.push(EpiBinaryCandidate::new(
            "repo-shared-target",
            root.join("target/debug/epi"),
        ));
        candidates.push(EpiBinaryCandidate::new(
            "repo-shared-release",
            root.join("target/release/epi"),
        ));
    }
    if let Ok(executable) = std::env::current_exe() {
        if let Some(parent) = executable.parent() {
            candidates.push(EpiBinaryCandidate::new("bundled", parent.join("epi")));
        }
    }
    candidates.extend(path_candidates());

    let resolved = resolve_epi_binary_candidates(candidates)?;
    if resolved.source != "explicit-env" {
        if let (Some(saved), Some(config_path)) = (saved, config_path) {
            let saved_canonical = saved.canonicalize().ok();
            if saved_canonical.as_ref() != Some(&resolved.path) {
                repair_saved_binary(&config_path, &resolved.path)?;
            }
        }
    }
    Ok(resolved)
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
    let binary = epi_binary()?;
    let mut command = Command::new(&binary.path);
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
    let child = command.spawn().map_err(|err| {
        format!(
            "failed to spawn `{} gate start`: {err}",
            binary.path.display()
        )
    })?;
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
    *state
        .resolved_binary
        .lock()
        .expect("supervisor binary poisoned") = Some(binary);
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
                        let _ = Command::new("kill")
                            .args(["-TERM", &pid.to_string()])
                            .status();
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
    let binary = epi_binary()?;
    Ok(format!(
        "stopped {:?}; supervision loop will respawn `{}` within ~3s",
        stopped,
        binary.path.display()
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
            let resolved_binary = app
                .state::<SupervisorState>()
                .resolved_binary
                .lock()
                .expect("supervisor binary poisoned")
                .clone();
            let status = match classify(port_open, child_pid) {
                GatewayPhase::Supervised(pid) => SupervisorStatus::new(
                    "supervised",
                    GATEWAY_PORT,
                    Some(pid),
                    "gateway healthy under supervision",
                )
                .with_binary(resolved_binary.as_ref()),
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
                    Ok(pid) => {
                        let binary = app
                            .state::<SupervisorState>()
                            .resolved_binary
                            .lock()
                            .expect("supervisor binary poisoned")
                            .clone();
                        SupervisorStatus::new(
                            "starting",
                            GATEWAY_PORT,
                            Some(pid),
                            format!(
                                "spawned `{} gate start --port {GATEWAY_PORT}`",
                                binary
                                    .as_ref()
                                    .map(|resolved| resolved.path.display().to_string())
                                    .unwrap_or_else(|| "epi".to_owned())
                            ),
                        )
                        .with_binary(binary.as_ref())
                    }
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
    use std::path::Path;

    #[cfg(unix)]
    fn write_epi_candidate(path: &Path, compatible: bool) {
        use std::os::unix::fs::PermissionsExt;

        let body = if compatible {
            "#!/bin/sh\nprintf 'Epi-Logos command surface\\nUsage: epi [OPTIONS] <COMMAND>\\n'\n"
        } else {
            "#!/bin/sh\nprintf 'not the epi command surface\\n'\n"
        };
        std::fs::write(path, body).expect("write candidate executable");
        let mut permissions = std::fs::metadata(path)
            .expect("candidate metadata")
            .permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(path, permissions).expect("mark candidate executable");
    }

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
    #[cfg(unix)]
    fn stale_saved_binary_falls_through_to_a_compatible_shared_binary() {
        let temp = tempfile::tempdir().expect("tempdir");
        let shared = temp.path().join("target/debug/epi");
        std::fs::create_dir_all(shared.parent().expect("shared parent"))
            .expect("create shared target");
        write_epi_candidate(&shared, true);

        let resolved = resolve_epi_binary_candidates([
            EpiBinaryCandidate::new("saved-config", temp.path().join("missing/epi")),
            EpiBinaryCandidate::new("repo-shared-target", shared.clone()),
        ])
        .expect("shared binary should repair the stale saved candidate");

        assert_eq!(
            resolved.path,
            shared.canonicalize().expect("canonical shared path")
        );
        assert_eq!(resolved.source, "repo-shared-target");
        assert!(resolved.identity.contains("Usage: epi"));
    }

    #[test]
    #[cfg(unix)]
    fn incompatible_executable_is_rejected_before_the_next_candidate() {
        let temp = tempfile::tempdir().expect("tempdir");
        let wrong = temp.path().join("wrong");
        let compatible = temp.path().join("epi");
        write_epi_candidate(&wrong, false);
        write_epi_candidate(&compatible, true);

        let resolved = resolve_epi_binary_candidates([
            EpiBinaryCandidate::new("explicit-env", wrong),
            EpiBinaryCandidate::new("path", compatible.clone()),
        ])
        .expect("compatible fallback should resolve");

        assert_eq!(
            resolved.path,
            compatible
                .canonicalize()
                .expect("canonical compatible path")
        );
        assert_eq!(resolved.source, "path");
    }

    #[test]
    #[cfg(unix)]
    fn compatibility_probe_times_out_and_reaps_a_wedged_candidate() {
        use std::os::unix::fs::PermissionsExt;

        let temp = tempfile::tempdir().expect("tempdir");
        let wedged = temp.path().join("wedged-epi");
        std::fs::write(&wedged, "#!/bin/sh\nwhile :; do :; done\n")
            .expect("write wedged candidate");
        let mut permissions = std::fs::metadata(&wedged)
            .expect("wedged candidate metadata")
            .permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(&wedged, permissions).expect("mark wedged candidate executable");

        let started = Instant::now();
        let result = compatible_epi_identity_with_timeout(&wedged, Duration::from_millis(60));

        assert!(result
            .expect_err("wedged candidate must fail")
            .contains("timed out"));
        assert!(started.elapsed() < Duration::from_secs(1));
    }

    #[test]
    fn status_serialises_camel_case_for_the_ts_store() {
        let status = SupervisorStatus::new("supervised", GATEWAY_PORT, Some(42), "ok");
        let json = serde_json::to_value(&status).expect("serialise status");
        assert_eq!(json["state"], "supervised");
        assert_eq!(json["port"], 18794);
        assert_eq!(json["pid"], 42);
        assert_eq!(json["detail"], "ok");
        assert!(json["binaryPath"].is_null());
        assert!(json["binarySource"].is_null());
        assert!(json["binaryIdentity"].is_null());
    }
}
