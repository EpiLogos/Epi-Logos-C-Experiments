mod support;

use std::fs;

use epi_logos::gate::{config::GatewayConfig, lock::GatewayLock, server, tls::GatewayTlsRuntime};
use support::temp_env;

#[test]
fn acquires_lock_on_config_hash_path() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");

    let lock = GatewayLock::acquire(&gate_root, "cfg-18794").unwrap();

    assert!(lock.path().exists());
    assert_eq!(lock.path(), GatewayLock::path_for(&gate_root, "cfg-18794"));
}

#[test]
fn cleans_up_stale_lock_before_acquiring() {
    let env = temp_env();
    let gate_root = env.home.join(".epi").join("gate");
    let lock_path = GatewayLock::path_for(&gate_root, "cfg-stale");
    fs::create_dir_all(lock_path.parent().unwrap()).unwrap();
    fs::write(
        &lock_path,
        r#"{"config_hash":"cfg-stale","pid":424242,"created_at_unix_s":1}"#,
    )
    .unwrap();

    let lock = GatewayLock::acquire(&gate_root, "cfg-stale").unwrap();
    let contents = fs::read_to_string(lock.path()).unwrap();

    assert!(contents.contains("\"config_hash\":\"cfg-stale\""));
    assert!(!contents.contains("\"pid\":424242"));
}

#[test]
fn generates_self_signed_gateway_cert_and_fingerprint() {
    let env = temp_env();

    let runtime = GatewayTlsRuntime::load_or_generate(env.home.join(".epi").join("gate")).unwrap();

    assert!(runtime.cert_path.exists());
    assert!(runtime.key_path.exists());
    assert!(runtime.fingerprint_sha256.starts_with("sha256:"));
}

#[test]
fn status_from_config_surfaces_tls_fingerprint() {
    let env = temp_env();
    let mut config = GatewayConfig::with_port(18794);
    config.tls_enabled = true;
    config.state_root = Some(env.home.join(".epi").join("gate").display().to_string());

    let status = server::status_from_config(&config).unwrap();

    assert!(status.tls_enabled);
    assert!(status
        .tls_fingerprint_sha256
        .as_deref()
        .unwrap_or_default()
        .starts_with("sha256:"));
}
