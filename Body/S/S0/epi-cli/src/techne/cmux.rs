use serde_json::json;

use crate::gate::{config, session_store::SessionStore, team_store::TeamStore};

pub fn workspace_name(team_id: &str) -> String {
    format!("epi-{}", sanitize(team_id))
}

pub fn surface_name(_strategy: &str, role: &str, worker_index: Option<u32>) -> String {
    match role {
        "leader" => "leader".to_owned(),
        "worker" => format!("worker-{}", worker_index.unwrap_or(1)),
        other if !other.is_empty() => match worker_index {
            Some(index) => format!("{other}-{index}"),
            None => other.to_owned(),
        },
        _ => "worker-1".to_owned(),
    }
}

pub fn pane_id(team_id: &str, role: &str, worker_index: Option<u32>) -> String {
    format!(
        "{}-{}",
        sanitize(team_id),
        surface_name("", role, worker_index)
    )
}

pub fn maybe_render_projected(args: &[String]) -> Result<Option<String>, String> {
    if args.is_empty() || !args.iter().any(|arg| arg == "--projected") {
        return Ok(None);
    }

    match args[0].as_str() {
        "list-workspaces" => projected_workspace_list().map(Some),
        "identify" => projected_identify().map(Some),
        _ => Ok(None),
    }
}

fn projected_workspace_list() -> Result<String, String> {
    let gate_root = config::gate_root_from_env()?;
    let store = TeamStore::new(gate_root)?;
    let teams = store.list()?;
    Ok(teams
        .into_iter()
        .map(|team| format!("{}\t{}", team.cmux_workspace, team.team_id))
        .collect::<Vec<_>>()
        .join("\n"))
}

fn projected_identify() -> Result<String, String> {
    let gate_root = config::gate_root_from_env()?;
    let store = SessionStore::new(gate_root)?;
    let mut sessions = store
        .list()?
        .into_iter()
        .filter(|record| record.cmux_workspace.is_some())
        .collect::<Vec<_>>();
    sessions.sort_by(|left, right| right.updated_at_ms.cmp(&left.updated_at_ms));
    let record = sessions
        .into_iter()
        .next()
        .ok_or_else(|| "no projected cmux session metadata found".to_owned())?;

    serde_json::to_string_pretty(&json!({
        "workspace": record.cmux_workspace,
        "surface": record.cmux_surface,
        "paneId": record.cmux_pane_id,
        "sessionKey": record.canonical_key,
        "teamId": record.team_id,
    }))
    .map_err(|err| err.to_string())
}

fn sanitize(value: &str) -> String {
    value
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect()
}
