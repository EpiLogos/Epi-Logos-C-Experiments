mod support;

use epi_logos::{
    gate::{sessions::SessionStore, system},
    sesh::session::read_session_state,
};
use support::{run_epi, temp_env};

#[test]
fn gateway_session_records_inherit_khora_identity_and_health_reports_cross_layer_state() {
    let base_env = temp_env();
    let vault_root = base_env.repo_root.join("vault");
    let env = base_env.with_env("EPILOGOS_VAULT", vault_root.display().to_string());

    let init = run_epi(
        &[
            "agent",
            "session",
            "init",
            "--now",
            "2026-03-11T09:10:11Z",
            "--random-suffix",
            "kh0ra1",
        ],
        &env,
    );
    assert!(
        init.status.success(),
        "session init failed:\nstdout:\n{}\nstderr:\n{}",
        init.stdout,
        init.stderr
    );

    let khora = read_session_state(&env.repo_root).expect("session state should exist");
    assert_eq!(khora.context.day_id, "11-03-2026");
    assert_eq!(
        khora.context.now_path,
        vault_root
            .join("Empty")
            .join("Present")
            .join("11-03-2026")
            .join("20260311-091011-kh0ra1")
            .join("now.md")
    );

    let gate_root = env.home.join(".epi").join("gate");
    let _guard = env.apply_to_process();
    let store = SessionStore::new(&gate_root).unwrap();
    let record = store.create("agent:main:main").unwrap();

    assert_eq!(record.session_id, khora.context.session_id);
    assert_eq!(
        record.day_id.as_deref(),
        Some(khora.context.day_id.as_str())
    );
    assert_eq!(
        record.vault_now_path.as_deref(),
        Some(khora.context.now_path.to_string_lossy().as_ref())
    );

    let listed = epi_logos::gate::sessions::session_row(&record);
    assert_eq!(listed["sessionId"], khora.context.session_id);
    assert_eq!(listed["dayId"], khora.context.day_id);
    assert_eq!(
        listed["vaultNowPath"],
        khora.context.now_path.to_string_lossy().to_string()
    );

    let health = system::health_snapshot(&gate_root).unwrap();
    assert_eq!(health["checks"]["session"]["ok"], true);
    assert_eq!(
        health["checks"]["session"]["sessionId"],
        khora.context.session_id
    );
    assert_eq!(health["checks"]["session"]["dayId"], khora.context.day_id);
    assert_eq!(
        health["checks"]["session"]["nowPath"],
        khora.context.now_path.to_string_lossy().to_string()
    );
    assert_eq!(health["checks"]["vault"]["ok"], true);
    assert_eq!(
        health["checks"]["vault"]["nowPath"],
        khora.context.now_path.to_string_lossy().to_string()
    );
    assert!(health["checks"]["graph"]["ok"].is_boolean());
    assert!(health["checks"]["graph"]["report"].is_object());
}
