mod common;

use common::{run_epi, write_executable, TestEnv};
use std::fs;

#[test]
fn install_reports_missing_pi_binary_or_installer() {
    let env = TestEnv::repo_with_assets();
    let empty_bin = env.root.join("empty-bin");
    fs::create_dir_all(&empty_bin).unwrap();
    let out = run_epi(
        ["agent", "install", "--json"].as_slice(),
        &env.with_env("PATH", empty_bin.display().to_string()),
    );
    assert!(out.stdout.contains("\"status\": \"missing-prerequisite\""));
    assert!(out.stdout.contains("\"nextAction\""));
}

#[test]
fn install_bootstraps_pi_when_binary_is_missing_but_npm_is_available() {
    let env = TestEnv::repo_with_assets();
    let bin_dir = env.root.join("bin");
    fs::create_dir_all(&bin_dir).unwrap();
    let npm_log = env.root.join("npm-argv.txt");
    let pi_path = bin_dir.join("pi");

    write_executable(
        bin_dir.join("npm"),
        &format!(
            "#!/bin/sh\nprintf '%s\n' \"$@\" > \"{npm_log}\"\nif [ \"$1\" = \"install\" ] && [ \"$2\" = \"-g\" ] && [ \"$3\" = \"@mariozechner/pi-coding-agent\" ]; then\n  cat > \"{pi_path}\" <<'EOF'\n#!/bin/sh\nif [ \"$1\" = \"--version\" ]; then\n  printf '%s\\n' '0.57.1'\n  exit 0\nfi\nprintf '%s\\n' 'pi stub'\nEOF\n  chmod +x \"{pi_path}\"\n  exit 0\nfi\nprintf '%s\\n' 'unexpected npm invocation' >&2\nexit 9\n",
            npm_log = npm_log.display(),
            pi_path = pi_path.display()
        ),
    );

    let env = env.with_env("PATH", format!("{}:/usr/bin:/bin", bin_dir.display()));
    let out = run_epi(["agent", "install", "--json"].as_slice(), &env);

    assert!(out.status.success());
    assert!(out.stdout.contains("\"status\": \"ready\""));
    assert!(out.stdout.contains("\"piBinaryPresent\": true"));
    assert!(fs::exists(&pi_path).unwrap());
    let npm_args = fs::read_to_string(npm_log).unwrap();
    assert!(npm_args.contains("install"));
    assert!(npm_args.contains("@mariozechner/pi-coding-agent"));
}

#[test]
fn doctor_reports_binary_config_and_extensions_status() {
    let out = run_epi(
        ["agent", "doctor", "--json"].as_slice(),
        &TestEnv::repo_with_assets(),
    );
    assert!(out.stdout.contains("\"piBinaryPresent\""));
    assert!(out.stdout.contains("\"extensionSync\""));
    assert!(out.stdout.contains("\"modelsPath\""));
}
