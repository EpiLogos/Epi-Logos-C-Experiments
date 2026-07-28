mod support;

use chrono::{DateTime, Local, Utc};
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

    // `--now` is a real instant, so the ratified law applies twice
    // (`src/vault/paths.rs`): the day folder is the LOCAL calendar day spelled
    // MONTH-FIRST, and the NOW dir carries the LOCAL wall-clock stamp. Both are
    // derived from that same instant here so the assertions hold in every
    // timezone — the old literals `11-03-2026` / `20260311-091011` encoded both
    // the pre-CHARTER day-first spelling and the author's UTC offset.
    let now: DateTime<Utc> = "2026-03-11T09:10:11Z".parse().unwrap();
    let local = now.with_timezone(&Local);
    let day_id = local.format("%m-%d-%Y").to_string();
    let session_id = format!("{}-kh0ra1", local.format("%Y%m%d-%H%M%S"));

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
    assert_eq!(khora.context.session_id, session_id);
    assert_eq!(khora.context.day_id, day_id);
    // Present is FLAT: Empty/Present/{MM-DD-YYYY}/{session-id}/now.md
    assert_eq!(
        khora.context.now_path,
        vault_root
            .join("Empty")
            .join("Present")
            .join(&day_id)
            .join(&session_id)
            .join("now.md")
    );

    let gate_root = env.home.join(".epi").join("gate");
    let _guard = env.apply_to_process();
    let store = SessionStore::new(&gate_root).unwrap();
    let record = store
        .resolve("agent:epii:main")
        .expect("session init should propagate PI runtime identity into S3 gateway session store");

    assert_eq!(record.session_id, khora.context.session_id);
    assert_eq!(
        record.day_id.as_deref(),
        Some(khora.context.day_id.as_str())
    );
    assert_eq!(
        record.vault_now_path.as_deref(),
        Some(khora.context.now_path.to_string_lossy().as_ref())
    );
    // Default agent is `epii` (DEFAULT_PI_AGENT_ID, Anima/Epii split law).
    assert_eq!(record.active_agent_id, "epii");
    assert_eq!(
        record.runtime_cwd.as_deref(),
        Some(env.repo_root.to_string_lossy().as_ref())
    );
    assert_eq!(
        record.vault_root.as_deref(),
        Some(vault_root.to_string_lossy().as_ref())
    );
    assert!(record
        .resource_loader_id
        .as_deref()
        .unwrap_or_default()
        .contains("pi:epii:"));
    assert!(record
        .resource_loader_id
        .as_deref()
        .unwrap_or_default()
        .contains("plugin-runtime.json"));
    assert!(record
        .diagnostics
        .iter()
        .any(|diagnostic| diagnostic["message"]
            .as_str()
            .unwrap_or_default()
            .contains("created NOW")));

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
    assert_eq!(
        health["checks"]["gatewaySession"]["canonicalKey"],
        "agent:epii:main"
    );
    assert_eq!(
        health["checks"]["gatewaySession"]["sessionId"],
        khora.context.session_id
    );
    assert_eq!(health["checks"]["gatewaySession"]["activeAgentId"], "epii");
    assert_eq!(
        health["checks"]["gatewaySession"]["projection"]["sessionSurfaceTable"],
        "session_surface"
    );
    assert_eq!(health["checks"]["vault"]["ok"], true);
    assert_eq!(
        health["checks"]["vault"]["nowPath"],
        khora.context.now_path.to_string_lossy().to_string()
    );
    assert!(health["checks"]["graph"]["ok"].is_boolean());
    assert!(health["checks"]["graph"]["report"].is_object());
}
