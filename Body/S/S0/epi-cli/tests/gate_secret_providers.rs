use epi_logos::gate::config::{SecretProvider, SecretsConfig};
use epi_logos::gate::secrets::{SecretResolver, SecretStatus};
use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::sync::{Mutex, OnceLock};

fn env_lock() -> &'static Mutex<()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
}

#[test]
fn env_secret_provider_resolves_without_leaking_value() {
    let _guard = env_lock().lock().unwrap();
    std::env::set_var("EPILOGOS_SECRET_PROVIDER_TEST", "super-secret");
    let resolver = SecretResolver::new(SecretsConfig {
        provider: SecretProvider::Env,
        ..SecretsConfig::default()
    });

    let status = resolver.status("EPILOGOS_SECRET_PROVIDER_TEST");
    assert_eq!(status, SecretStatus::Resolved);
    assert_eq!(
        resolver.resolve("EPILOGOS_SECRET_PROVIDER_TEST").unwrap(),
        "super-secret"
    );
    std::env::remove_var("EPILOGOS_SECRET_PROVIDER_TEST");
}

#[test]
fn one_password_provider_uses_real_op_cli_contract_and_redacts_status() {
    let _guard = env_lock().lock().unwrap();
    let bin_dir = fake_bin(
        "op",
        "#!/bin/sh\nif [ \"$1\" = read ]; then echo op-secret; exit 0; fi\nexit 2\n",
    );
    prepend_path(&bin_dir);
    let resolver = SecretResolver::new(SecretsConfig {
        provider: SecretProvider::OnePassword,
        one_password_vault: Some("epi".into()),
        ..SecretsConfig::default()
    });

    assert_eq!(resolver.status("telegram/token"), SecretStatus::Resolved);
    assert_eq!(resolver.resolve("telegram/token").unwrap(), "op-secret");
}

#[test]
fn varlock_provider_reports_missing_cli_as_unavailable() {
    let _guard = env_lock().lock().unwrap();
    std::env::set_var("PATH", "/tmp/epilogos-no-varlock");
    let resolver = SecretResolver::new(SecretsConfig {
        provider: SecretProvider::Varlock,
        varlock_profile: Some("epi-local".into()),
        ..SecretsConfig::default()
    });

    match resolver.status("TELEGRAM_BOT_TOKEN") {
        SecretStatus::Unavailable { diagnostic } => {
            assert!(diagnostic.contains("varlock"));
        }
        other => panic!("expected unavailable varlock status, got {other:?}"),
    }
}

fn fake_bin(name: &str, body: &str) -> String {
    let dir = std::env::temp_dir().join(format!(
        "epi-secret-provider-test-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    fs::create_dir_all(&dir).unwrap();
    let path = dir.join(name);
    fs::write(&path, body).unwrap();
    let mut perms = fs::metadata(&path).unwrap().permissions();
    perms.set_mode(0o755);
    fs::set_permissions(&path, perms).unwrap();
    dir.to_string_lossy().into_owned()
}

fn prepend_path(bin_dir: &str) {
    let old_path = std::env::var("PATH").unwrap_or_default();
    std::env::set_var("PATH", format!("{bin_dir}:{old_path}"));
}
