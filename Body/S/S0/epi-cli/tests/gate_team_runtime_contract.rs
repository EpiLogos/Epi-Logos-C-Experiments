use std::fs;
use std::path::PathBuf;

use epi_logos::gate::{
    session_store::{SessionPatch, SessionStore},
    sessions,
    team_store::{TeamMemberRecord, TeamRecord, TeamStore},
};

#[test]
fn session_surfaces_expose_team_and_cmux_metadata() {
    let gate_root = unique_gate_root("session-metadata");
    let store = SessionStore::new(&gate_root).expect("session store");
    let created = store.create("agent:main:main").expect("session create");

    let patched = store
        .patch(
            &created.canonical_key,
            SessionPatch {
                team_id: Some(Some("team-alpha".to_owned())),
                team_role: Some(Some("leader".to_owned())),
                orchestration_kind: Some(Some("parallel".to_owned())),
                cmux_workspace: Some(Some("epi-team-alpha".to_owned())),
                cmux_surface: Some(Some("leader".to_owned())),
                cmux_pane_id: Some(Some("pane-main".to_owned())),
                ..SessionPatch::default()
            },
        )
        .expect("session patch");

    let value = sessions::record_to_value(&patched);
    assert_eq!(value["teamId"], "team-alpha");
    assert_eq!(value["teamRole"], "leader");
    assert_eq!(value["orchestrationKind"], "parallel");
    assert_eq!(value["cmuxWorkspace"], "epi-team-alpha");
    assert_eq!(value["cmuxSurface"], "leader");
    assert_eq!(value["cmuxPaneId"], "pane-main");

    let row = sessions::session_row(&patched);
    assert_eq!(row["teamId"], "team-alpha");
    assert_eq!(row["teamRole"], "leader");
    assert_eq!(row["orchestrationKind"], "parallel");
    assert_eq!(row["cmuxWorkspace"], "epi-team-alpha");
    assert_eq!(row["cmuxSurface"], "leader");
    assert_eq!(row["cmuxPaneId"], "pane-main");
}

#[test]
fn team_store_persists_records_and_recovers_after_reload() {
    let gate_root = unique_gate_root("team-store");
    let store = TeamStore::new(&gate_root).expect("team store");

    let created = store
        .create(TeamRecord {
            team_id: "team-alpha".to_owned(),
            parent_session_key: "agent:main:main".to_owned(),
            strategy: "parallel".to_owned(),
            label: Some("Alpha Team".to_owned()),
            task: "Investigate runtime drift".to_owned(),
            status: "running".to_owned(),
            cmux_workspace: "epi-team-alpha".to_owned(),
            cmux_surface: Some("leader".to_owned()),
            members: vec![
                TeamMemberRecord {
                    session_key: "agent:vak:subagent:team-alpha-1".to_owned(),
                    agent_id: "vak".to_owned(),
                    role: "worker".to_owned(),
                    status: "running".to_owned(),
                    worker_index: Some(1),
                    cmux_pane_id: Some("pane-1".to_owned()),
                },
                TeamMemberRecord {
                    session_key: "agent:nous:subagent:team-alpha-2".to_owned(),
                    agent_id: "nous".to_owned(),
                    role: "worker".to_owned(),
                    status: "pending".to_owned(),
                    worker_index: Some(2),
                    cmux_pane_id: Some("pane-2".to_owned()),
                },
            ],
            created_at_ms: 0,
            updated_at_ms: 0,
        })
        .expect("team create");

    assert!(
        store.team_path(&created.team_id).exists(),
        "team record should persist on disk"
    );

    let reloaded = TeamStore::new(&gate_root).expect("reload store");
    let listed = reloaded.list().expect("team list");
    assert_eq!(listed.len(), 1);
    assert_eq!(listed[0].team_id, "team-alpha");
    assert_eq!(listed[0].members.len(), 2);

    let resolved = reloaded.resolve("team-alpha").expect("team resolve");
    assert_eq!(resolved.parent_session_key, "agent:main:main");
    assert_eq!(resolved.cmux_workspace, "epi-team-alpha");
    assert_eq!(resolved.members[0].agent_id, "vak");

    let stopped = reloaded.stop("team-alpha").expect("team stop");
    assert_eq!(stopped.status, "stopped");
}

fn unique_gate_root(label: &str) -> PathBuf {
    let root = std::env::temp_dir().join(format!("epi-gate-{label}-{}", uuid::Uuid::new_v4()));
    fs::create_dir_all(&root).expect("gate root");
    root
}
