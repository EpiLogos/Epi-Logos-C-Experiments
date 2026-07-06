mod support;

use std::fs;
use std::net::TcpListener;
use std::process::Command;
use std::time::Duration;

use serde_json::Value;
use support::{run_epi, temp_env, TestEnv};
use tokio_tungstenite::connect_async;

#[test]
fn app_command_help_names_the_theia_electron_surface_not_tauri() {
    let env = temp_env();
    let output = run_epi(&["app", "--help"], &env);

    assert!(
        output.status.success(),
        "epi app --help failed:\nstdout:\n{}\nstderr:\n{}",
        output.stdout,
        output.stderr
    );
    assert!(
        output.stdout.contains("Theia/Electron"),
        "help must name the active Theia/Electron app surface:\n{}",
        output.stdout
    );
    assert!(
        !output.stdout.contains("Tauri"),
        "help must not advertise the deprecated Tauri app path:\n{}",
        output.stdout
    );
}

#[test]
fn failed_gateway_start_does_not_leave_running_status() {
    let env = temp_env();
    let gate_root = env.repo_root.join(".epi/gate");
    let listener = TcpListener::bind("127.0.0.1:0").expect("reserve a loopback port");
    let port = listener.local_addr().expect("reserved port address").port();
    let port_arg = port.to_string();
    let env = env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());

    let output = run_epi(&["--json", "gate", "start", "--port", &port_arg], &env);
    assert!(
        !output.status.success(),
        "gate start should fail while another listener owns the requested port"
    );

    let status_path = gate_root.join("status.json");
    if status_path.exists() {
        let status: Value = serde_json::from_str(
            &fs::read_to_string(&status_path).expect("gateway status should be readable json"),
        )
        .expect("gateway status should be json");
        assert_ne!(
            status["running"],
            true,
            "failed gateway start must not leave a running=true status:\n{}",
            serde_json::to_string_pretty(&status).unwrap()
        );
    }
}

#[tokio::test]
async fn app_dev_preflights_gateway_and_passes_gateway_url_to_theia() {
    let env = temp_env().with_fake_pnpm();
    let app_source = env.repo_root.join("Body/M/epi-theia/electron-app");
    fs::create_dir_all(&app_source).unwrap();
    let env = env.with_env("EPI_APP_SOURCE_DIR", app_source.display().to_string());

    let output = run_epi(&["app", "dev"], &env);
    assert!(
        output.status.success(),
        "epi app dev failed:\nstdout:\n{}\nstderr:\n{}",
        output.stdout,
        output.stderr
    );

    // Read the spawned gateway's pid FIRST and hold a panic-safe kill guard —
    // a failing assert below must never leak an orphan `epi gate start`
    // daemon (leaked orphans squatted 18794/18832 and poisoned later runs).
    let record_path = env.repo_root.join(".epi/gate/up/gateway-process.json");
    let record: Value = serde_json::from_str(
        &fs::read_to_string(record_path).expect("gateway process record should be written"),
    )
    .expect("gateway process record should be json");
    struct KillGuard(i32);
    impl Drop for KillGuard {
        fn drop(&mut self) {
            kill_pid(self.0);
        }
    }
    let _gateway_guard = KillGuard(record["pid"].as_u64().expect("gateway record pid") as i32);

    let pnpm_env = fs::read_to_string(env.root.join("pnpm-env.txt"))
        .expect("fake pnpm should capture app environment");
    assert!(
        pnpm_env.contains("EPI_GATEWAY_URL=ws://127.0.0.1:18794"),
        "app dev must pass the preflighted gateway URL into Theia:\n{}",
        pnpm_env
    );

    connect_async("ws://127.0.0.1:18794")
        .await
        .expect("epi app dev must start a reachable gateway before launching Theia");
}

trait AppCliTestEnvExt {
    fn with_fake_pnpm(self) -> Self;
}

impl AppCliTestEnvExt for TestEnv {
    fn with_fake_pnpm(self) -> Self {
        let bin_dir = self.root.join("bin");
        fs::create_dir_all(&bin_dir).unwrap();
        write_executable_local(
            bin_dir.join("pnpm"),
            &format!(
                "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"{argv}\"\nenv | sort > \"{envs}\"\nexit 0\n",
                argv = self.root.join("pnpm-argv.txt").display(),
                envs = self.root.join("pnpm-env.txt").display()
            ),
        );
        self.with_env(
            "PATH",
            format!(
                "{}:{}",
                bin_dir.display(),
                std::env::var("PATH").unwrap_or_default()
            ),
        )
    }
}

fn write_executable_local(path: impl AsRef<std::path::Path>, contents: &str) {
    let path = path.as_ref();
    fs::write(path, contents).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let mut perms = fs::metadata(path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(path, perms).unwrap();
    }
}

fn kill_pid(pid: i32) {
    let _ = Command::new("kill").arg(pid.to_string()).status();
    std::thread::sleep(Duration::from_millis(50));
}
