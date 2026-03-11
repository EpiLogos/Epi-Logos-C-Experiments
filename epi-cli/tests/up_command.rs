mod support;

use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;

use serde_json::Value;
use support::{run_epi, temp_env};
use tokio_tungstenite::connect_async;

#[tokio::test]
async fn up_command_initializes_session_and_starts_gateway_with_readiness_probe() {
    let base_env = temp_env();
    let vault_root = base_env.repo_root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());
    let port = 18831;

    let output = run_epi(
        &[
            "--json",
            "up",
            "--no-graph",
            "--no-tmux",
            "--no-app",
            "--port",
            &port.to_string(),
        ],
        &env,
    );
    assert!(
        output.status.success(),
        "epi up failed:\nstdout:\n{}\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    let payload: Value = serde_json::from_str(&output.stdout).expect("epi up json output");
    assert_eq!(payload["ok"], true);
    assert_eq!(payload["gateway"]["port"], port);
    assert!(payload["gateway"]["pid"].as_u64().is_some());
    assert_eq!(payload["steps"][0]["name"], "repo-env");
    assert_eq!(payload["steps"][1]["name"], "session-init");
    assert_eq!(payload["steps"][2]["name"], "vault-check");
    assert_eq!(payload["steps"][3]["name"], "gateway-start");
    assert_eq!(payload["steps"][4]["name"], "gateway-ready");

    let session_state = fs::read_to_string(env.repo_root.join(".epi/session.json"))
        .expect("session state should be written");
    assert!(session_state.contains("\"day_id\": \""));

    let (mut socket, _) = connect_async(format!("ws://127.0.0.1:{port}"))
        .await
        .expect("gateway should accept websocket probes");
    let hello = tokio::time::timeout(Duration::from_secs(2), async {
        use futures_util::StreamExt;
        loop {
            let frame = socket
                .next()
                .await
                .expect("gateway should stay open")
                .expect("frame should decode");
            if frame.is_text() {
                return serde_json::from_str::<Value>(frame.to_text().unwrap()).unwrap();
            }
        }
    })
    .await
    .expect("hello frame should arrive");
    assert_eq!(hello["type"], "hello-ok");

    kill_pid(payload["gateway"]["pid"].as_u64().unwrap() as i32);
}

#[test]
fn up_command_runs_tmux_cmux_and_app_steps_when_enabled() {
    let base_env = temp_env();
    let vault_root = base_env.repo_root.join("vault");
    let bin_dir = base_env.root.join("bin");
    fs::create_dir_all(&bin_dir).unwrap();

    let session_log = base_env.root.join("session.log");
    let cmux_log = base_env.root.join("cmux.log");
    let app_log = base_env.root.join("app.log");

    let session_script = write_executable(
        bin_dir.join("epi-session-v2.sh"),
        &format!(
            "#!/bin/sh\nprintf 'launch:%s\\n' \"$1\" >> \"{}\"\n",
            session_log.display()
        ),
    );
    let cmux_bin = write_executable(
        bin_dir.join("cmux"),
        &format!(
            "#!/bin/sh\nprintf 'cmux:%s\\n' \"$*\" >> \"{}\"\n",
            cmux_log.display()
        ),
    );
    let app_launcher = write_executable(
        bin_dir.join("epi-app-launch"),
        &format!(
            "#!/bin/sh\nprintf 'app-launch\\n' >> \"{}\"\n",
            app_log.display()
        ),
    );

    let env = base_env
        .with_env("EPILOGOS_VAULT", vault_root.display().to_string())
        .with_env("EPI_SESSION_SCRIPT", session_script.display().to_string())
        .with_env("EPI_CMUX_BIN", cmux_bin.display().to_string())
        .with_env("EPI_UP_APP_LAUNCHER", app_launcher.display().to_string());

    let output = run_epi(
        &["--json", "up", "--no-graph", "--attach", "--port", "18832"],
        &env,
    );
    assert!(
        output.status.success(),
        "epi up failed:\nstdout:\n{}\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    let payload: Value = serde_json::from_str(&output.stdout).expect("epi up json output");
    assert_eq!(payload["ok"], true);
    assert_eq!(payload["steps"][5]["name"], "tmux-launch");
    assert_eq!(payload["steps"][6]["name"], "app-launch");
    assert_eq!(payload["steps"][7]["name"], "cmux-attach");
    assert!(fs::read_to_string(&session_log)
        .unwrap()
        .contains("launch:sesh"));
    assert!(fs::read_to_string(&cmux_log).unwrap().contains("cmux:"));
    assert!(fs::read_to_string(&app_log).unwrap().contains("app-launch"));

    kill_pid(payload["gateway"]["pid"].as_u64().unwrap() as i32);
}

fn write_executable(path: PathBuf, contents: &str) -> PathBuf {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    fs::write(&path, contents).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let mut perms = fs::metadata(&path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&path, perms).unwrap();
    }
    path
}

fn kill_pid(pid: i32) {
    let _ = Command::new("kill")
        .arg(pid.to_string())
        .status()
        .expect("kill should run");
}
