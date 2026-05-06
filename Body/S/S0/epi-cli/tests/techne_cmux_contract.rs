mod support;

use epi_logos::gate::{
    session_store::{SessionPatch, SessionStore},
    team_store::{TeamMemberRecord, TeamRecord, TeamStore},
};
use epi_logos::techne::cmux;
use serde_json::Value;
use support::{run_epi, TestEnv};

#[test]
fn cmux_projection_derives_deterministic_workspace_surface_and_pane_ids() {
    assert_eq!(cmux::workspace_name("team.alpha"), "epi-team_alpha");
    assert_eq!(cmux::surface_name("parallel", "leader", None), "leader");
    assert_eq!(
        cmux::surface_name("parallel", "worker", Some(2)),
        "worker-2"
    );
    assert_eq!(
        cmux::pane_id("team.alpha", "worker", Some(2)),
        "team_alpha-worker-2"
    );
}

#[test]
fn projected_cmux_commands_report_workspace_state_from_gate_records() {
    let base_env = TestEnv::repo_with_assets();
    let gate_root = base_env.root.join("gate");
    let env = base_env.with_env("EPI_GATE_STATE_ROOT", gate_root.display().to_string());
    let sessions = SessionStore::new(&gate_root).expect("session store");
    let teams = TeamStore::new(&gate_root).expect("team store");

    sessions.create("agent:main:main").expect("parent session");
    sessions
        .create("agent:vak:subagent:team-alpha-1")
        .expect("worker session");
    sessions
        .patch(
            "agent:vak:subagent:team-alpha-1",
            SessionPatch {
                team_id: Some(Some("team-alpha".to_owned())),
                team_role: Some(Some("worker".to_owned())),
                orchestration_kind: Some(Some("parallel".to_owned())),
                cmux_workspace: Some(Some("epi-team-alpha".to_owned())),
                cmux_surface: Some(Some("worker-1".to_owned())),
                cmux_pane_id: Some(Some("team-alpha-worker-1".to_owned())),
                ..Default::default()
            },
        )
        .expect("worker patch");

    teams
        .create(TeamRecord {
            team_id: "team-alpha".to_owned(),
            parent_session_key: "agent:main:main".to_owned(),
            strategy: "parallel".to_owned(),
            label: Some("Alpha".to_owned()),
            task: "Investigate drift".to_owned(),
            status: "running".to_owned(),
            cmux_workspace: "epi-team-alpha".to_owned(),
            cmux_surface: Some("leader".to_owned()),
            members: vec![TeamMemberRecord {
                session_key: "agent:vak:subagent:team-alpha-1".to_owned(),
                agent_id: "vak".to_owned(),
                role: "worker".to_owned(),
                status: "running".to_owned(),
                worker_index: Some(1),
                cmux_pane_id: Some("team-alpha-worker-1".to_owned()),
            }],
            created_at_ms: 0,
            updated_at_ms: 0,
        })
        .expect("team create");

    let list = run_epi(&["techne", "cmux", "list-workspaces", "--projected"], &env);
    assert!(
        list.status.success(),
        "list-workspaces failed: {}",
        list.stderr
    );
    assert!(list.stdout.contains("epi-team-alpha"));
    assert!(list.stdout.contains("team-alpha"));

    let identify = run_epi(&["techne", "cmux", "identify", "--projected"], &env);
    assert!(
        identify.status.success(),
        "identify failed: {}",
        identify.stderr
    );
    let payload: Value = serde_json::from_str(&identify.stdout).expect("identify json");
    assert_eq!(payload["workspace"], "epi-team-alpha");
    assert_eq!(payload["sessionKey"], "agent:vak:subagent:team-alpha-1");
    assert_eq!(payload["paneId"], "team-alpha-worker-1");
}
