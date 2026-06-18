//! 41.T41.6 — `m4.arena.*` gateway route family + `epi nara arena` CLI parity.
//!
//! Exercises the admin CLI surface end-to-end against the real
//! [`epi_s3_gateway::m4_arena::M4ArenaRuntime`] route handlers (shared substrate
//! per DR-S5-ONE-1), plus the route-contract registration and the DR-VAMA-3 /
//! DR-VAMA-6 refusal laws.

use epi_logos::nara::arena::{dispatch, ArenaCmd};
use epi_s3_gateway_contract::{M4_ARENA_METHODS, M4_ARENA_ROUTE_CONTRACTS};
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

// Env-var-resolved authority is process-global; serialise the CLI tests.
static ENV_LOCK: Mutex<()> = Mutex::new(());

const WORLD_COORD: &str = ":World/Types/C/C5/egregore-of-the-now";

struct TestEnv {
    home: PathBuf,
    runtime_path: PathBuf,
}

impl TestEnv {
    fn new(tag: &str) -> Self {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock after epoch")
            .as_nanos();
        let home = std::env::temp_dir().join(format!("epi-m4-arena-{tag}-{nanos}"));
        std::fs::create_dir_all(&home).expect("create temp home");
        let runtime_path = home.join("arena-runtime.json");
        Self { home, runtime_path }
    }

    fn apply_authorized_env(&self) {
        std::env::set_var("EPI_NARA_ARENA_RUNTIME_PATH", &self.runtime_path);
        std::env::set_var("EPI_SESSION_ID", "agent:m4-arena-gate:main");
        std::env::set_var(
            "EPI_NOW_PATH",
            "/vault/Empty/Present/19-06-2026/m4-arena-gate/now.md",
        );
        std::env::set_var("EPI_DAY_ID", "19-06-2026");
    }

    fn clear_authority_env(&self) {
        std::env::set_var("EPI_NARA_ARENA_RUNTIME_PATH", &self.runtime_path);
        for key in [
            "EPI_SESSION_ID",
            "EPI_GATE_SESSION_KEY",
            "EPI_GATEWAY_SESSION_KEY",
            "EPI_ARENA_SESSION_KEY",
            "EPI_NOW_PATH",
            "EPI_ARENA_NOW_PATH",
            "EPI_DAY_ID",
            "EPI_ARENA_DAY_ID",
        ] {
            std::env::remove_var(key);
        }
    }
}

impl Drop for TestEnv {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.home);
    }
}

#[test]
fn route_contract_registers_eight_one_substrate_routes() {
    assert_eq!(M4_ARENA_METHODS.len(), 8, "eight m4 arena methods registered");
    assert_eq!(M4_ARENA_ROUTE_CONTRACTS.len(), 8);
    for (contract, method) in M4_ARENA_ROUTE_CONTRACTS.iter().zip(M4_ARENA_METHODS) {
        assert_eq!(contract.method, *method);
        assert!(
            contract.khora_session_authority,
            "DR-S5-ONE-1: {} enforces Khora session authority",
            contract.method
        );
        assert!(
            contract.cli_command.starts_with("epi nara arena"),
            "DR-VAMA-4: {} has an `epi nara arena` CLI parity command",
            contract.method
        );
        assert!(
            contract.redis_key_template.contains("arena"),
            "DR-S5-ONE-1: {} caches under a hierarchical arena Redis key",
            contract.method
        );
    }
}

#[test]
fn cli_round_trip_drives_all_eight_routes() {
    let _guard = ENV_LOCK.lock().unwrap();
    let env = TestEnv::new("round-trip");
    env.apply_authorized_env();

    // scene-open
    let scene = dispatch(
        &ArenaCmd::SceneOpen {
            scene_key: "arena:gate".to_owned(),
            pinned_coordinate: "C5".to_owned(),
            lifecycle_mode: "ephemeral".to_owned(),
            admitted_constitutional: vec!["Sophia".to_owned()],
            cpf_token: "cpf-confirmed-gate".to_owned(),
        },
        true,
    )
    .expect("scene opens with CPF token");
    assert!(scene.contains("arena:gate"));

    // summon a :World daemon
    let summon = dispatch(
        &ArenaCmd::Summon {
            scene_key: "arena:gate".to_owned(),
            entity_coordinate: WORLD_COORD.to_owned(),
            class_name: "daemon".to_owned(),
            lifecycle_mode: None,
        },
        true,
    )
    .expect("daemon summons");
    let summon_json: serde_json::Value = serde_json::from_str(&summon).expect("summon json");
    let identity_handle = summon_json["identityHandle"]
        .as_str()
        .expect("identity handle")
        .to_owned();

    // turn-advance by the summoned shakti
    let turn = dispatch(
        &ArenaCmd::TurnAdvance {
            scene_key: "arena:gate".to_owned(),
            speaker: identity_handle.clone(),
            intent: "open dialogue".to_owned(),
            kairos_delta: 0.25,
        },
        true,
    )
    .expect("turn advances");
    let turn_json: serde_json::Value = serde_json::from_str(&turn).expect("turn json");
    assert_eq!(turn_json["speakerClass"], "daemon");
    assert_eq!(turn_json["vakAddress"]["cfp"], "m4.arena.dialogue");

    // subscribe — protected-local stream
    let sub = dispatch(
        &ArenaCmd::Subscribe {
            scene_key: "arena:gate".to_owned(),
        },
        true,
    )
    .expect("subscribe");
    assert!(sub.contains("protected_local_handle_only"));

    // list — open scene visible
    let list = dispatch(
        &ArenaCmd::List {
            status: Some("open".to_owned()),
            pinned: None,
            max_age_ms: None,
        },
        true,
    )
    .expect("list");
    assert!(list.contains("arena:gate"));

    // scene-close — releases the ephemeral presence
    let close = dispatch(
        &ArenaCmd::SceneClose {
            scene_key: "arena:gate".to_owned(),
            intent: Some("gate done".to_owned()),
        },
        true,
    )
    .expect("scene closes");
    let close_json: serde_json::Value = serde_json::from_str(&close).expect("close json");
    assert_eq!(close_json["releasedEphemeralCount"], 1);
    assert_eq!(close_json["closureEmittedForDistillation"], true);

    // vama-list-warm — ephemeral identity GC'd on close, so inventory empty
    let warm = dispatch(
        &ArenaCmd::VamaListWarm {
            coordinate: None,
            class_filter: None,
            age_gte: None,
        },
        false,
    )
    .expect("warm list");
    assert_eq!(warm, "No warm Vama Shaktis.");

    env.clear_authority_env();
}

#[test]
fn warm_lifecycle_persists_and_release_routes_to_promotion() {
    let _guard = ENV_LOCK.lock().unwrap();
    let env = TestEnv::new("warm");
    env.apply_authorized_env();

    dispatch(
        &ArenaCmd::SceneOpen {
            scene_key: "arena:warm".to_owned(),
            pinned_coordinate: "C5".to_owned(),
            lifecycle_mode: "warm".to_owned(),
            admitted_constitutional: vec![],
            cpf_token: "cpf-warm".to_owned(),
        },
        true,
    )
    .expect("scene opens");
    let summon = dispatch(
        &ArenaCmd::Summon {
            scene_key: "arena:warm".to_owned(),
            entity_coordinate: WORLD_COORD.to_owned(),
            class_name: "egregore".to_owned(),
            lifecycle_mode: Some("warm".to_owned()),
        },
        true,
    )
    .expect("summon warm");
    let summon_json: serde_json::Value = serde_json::from_str(&summon).expect("summon json");
    let identity_handle = summon_json["identityHandle"].as_str().unwrap().to_owned();

    dispatch(
        &ArenaCmd::SceneClose {
            scene_key: "arena:warm".to_owned(),
            intent: None,
        },
        true,
    )
    .expect("close");

    // warm identity survives close
    let warm = dispatch(
        &ArenaCmd::VamaListWarm {
            coordinate: None,
            class_filter: Some("egregore".to_owned()),
            age_gte: None,
        },
        true,
    )
    .expect("warm list");
    assert!(warm.contains(&identity_handle));

    // release routes to promotion (Tranche 41.11)
    let release = dispatch(
        &ArenaCmd::VamaReleaseWarm {
            identity_handle: identity_handle.clone(),
            reason: "promote".to_owned(),
            emit_proposal: false,
            scenes: None,
            config: None,
        },
        true,
    )
    .expect("release to promotion");
    let release_json: serde_json::Value = serde_json::from_str(&release).expect("release json");
    assert_eq!(release_json["routedToPromotion"], true);

    env.clear_authority_env();
}

#[test]
fn summon_refuses_non_world_and_unknown_classifier_dr_vama_3_6() {
    let _guard = ENV_LOCK.lock().unwrap();
    let env = TestEnv::new("refusal");
    env.apply_authorized_env();

    dispatch(
        &ArenaCmd::SceneOpen {
            scene_key: "arena:r".to_owned(),
            pinned_coordinate: "C5".to_owned(),
            lifecycle_mode: "ephemeral".to_owned(),
            admitted_constitutional: vec![],
            cpf_token: "cpf".to_owned(),
        },
        true,
    )
    .expect("scene opens");

    // DR-VAMA-3: non-:World coordinate is refused
    let non_world = dispatch(
        &ArenaCmd::Summon {
            scene_key: "arena:r".to_owned(),
            entity_coordinate: "C5.not-world".to_owned(),
            class_name: "daemon".to_owned(),
            lifecycle_mode: None,
        },
        true,
    )
    .expect_err("non-:World coordinate must refuse");
    assert!(non_world.contains("DR-VAMA-3"), "got: {non_world}");

    // DR-VAMA-6: unknown classifier is refused
    let unknown_class = dispatch(
        &ArenaCmd::Summon {
            scene_key: "arena:r".to_owned(),
            entity_coordinate: WORLD_COORD.to_owned(),
            class_name: "poltergeist".to_owned(),
            lifecycle_mode: None,
        },
        true,
    )
    .expect_err("unknown classifier must refuse");
    assert!(unknown_class.contains("DR-VAMA-6"), "got: {unknown_class}");

    env.clear_authority_env();
}

#[test]
fn scene_open_refuses_without_cpf_brainstorm_token() {
    let _guard = ENV_LOCK.lock().unwrap();
    let env = TestEnv::new("cpf");
    env.apply_authorized_env();

    let err = dispatch(
        &ArenaCmd::SceneOpen {
            scene_key: "arena:cpf".to_owned(),
            pinned_coordinate: "C5".to_owned(),
            lifecycle_mode: "ephemeral".to_owned(),
            admitted_constitutional: vec![],
            cpf_token: "   ".to_owned(),
        },
        true,
    )
    .expect_err("empty CPF token must refuse");
    assert!(err.contains("DR-VAMA-3"), "got: {err}");

    env.clear_authority_env();
}

#[test]
fn every_route_refuses_without_khora_session_authority() {
    let _guard = ENV_LOCK.lock().unwrap();
    let env = TestEnv::new("authority");
    env.clear_authority_env();

    let commands = vec![
        ArenaCmd::SceneOpen {
            scene_key: "s".to_owned(),
            pinned_coordinate: "C5".to_owned(),
            lifecycle_mode: "ephemeral".to_owned(),
            admitted_constitutional: vec![],
            cpf_token: "cpf".to_owned(),
        },
        ArenaCmd::Summon {
            scene_key: "s".to_owned(),
            entity_coordinate: WORLD_COORD.to_owned(),
            class_name: "daemon".to_owned(),
            lifecycle_mode: None,
        },
        ArenaCmd::TurnAdvance {
            scene_key: "s".to_owned(),
            speaker: "user".to_owned(),
            intent: "x".to_owned(),
            kairos_delta: 0.0,
        },
        ArenaCmd::SceneClose {
            scene_key: "s".to_owned(),
            intent: None,
        },
        ArenaCmd::List {
            status: None,
            pinned: None,
            max_age_ms: None,
        },
        ArenaCmd::Subscribe {
            scene_key: "s".to_owned(),
        },
        ArenaCmd::VamaListWarm {
            coordinate: None,
            class_filter: None,
            age_gte: None,
        },
        ArenaCmd::VamaReleaseWarm {
            identity_handle: "h".to_owned(),
            reason: "gc".to_owned(),
            emit_proposal: false,
            scenes: None,
            config: None,
        },
    ];
    assert_eq!(commands.len(), 8);
    for command in &commands {
        let err = dispatch(command, true).expect_err("unauthorized route must refuse");
        assert!(err.contains("DR-S5-ONE-1"), "got: {err}");
    }
}
