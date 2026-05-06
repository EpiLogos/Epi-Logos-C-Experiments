use serde::Serialize;
use uuid::Uuid;

use crate::agent::{
    subagents::{self, RuntimeSubagentRequest},
    TeamCmd,
};
use crate::gate::{
    config,
    session_store::{SessionPatch, SessionStore},
    subagents as gate_subagents,
    team_store::{TeamMemberRecord, TeamRecord, TeamStore},
};
use crate::techne::cmux;

pub fn run(cmd: &TeamCmd, json: bool) -> Result<String, String> {
    match cmd {
        TeamCmd::Create {
            parent_session,
            strategy,
            label,
            task,
            agents,
        } => render_json_or_text(
            &create_team(parent_session, strategy, label.clone(), task, agents)?,
            json,
        ),
        TeamCmd::Dispatch {
            parent_session,
            label,
            agent,
            task,
            session_key,
        } => render_json_or_text(
            &dispatch_team_member(
                parent_session,
                label.clone(),
                agent,
                task,
                session_key.clone(),
            )?,
            json,
        ),
        TeamCmd::List => {
            let teams = TeamStore::new(config::gate_root_from_env()?)?.list()?;
            if json {
                serde_json::to_string_pretty(&serde_json::json!({ "teams": teams }))
                    .map_err(|err| err.to_string())
            } else {
                Ok(teams
                    .into_iter()
                    .map(|team| format!("{}\t{}\t{}", team.team_id, team.strategy, team.status))
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        TeamCmd::Resolve { team_id } => {
            let team = TeamStore::new(config::gate_root_from_env()?)?.resolve(team_id)?;
            if json {
                serde_json::to_string_pretty(&serde_json::json!({ "team": team }))
                    .map_err(|err| err.to_string())
            } else {
                Ok(team.team_id)
            }
        }
        TeamCmd::Stop { team_id } => {
            let team = TeamStore::new(config::gate_root_from_env()?)?.stop(team_id)?;
            if json {
                serde_json::to_string_pretty(&serde_json::json!({ "team": team }))
                    .map_err(|err| err.to_string())
            } else {
                Ok(team.team_id)
            }
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TeamCreateReport {
    ok: bool,
    team: TeamRecord,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TeamDispatchReport {
    ok: bool,
    status: String,
    team: TeamRecord,
    team_id: String,
    session_key: String,
    output: String,
    exit_code: i32,
    elapsed_ms: u128,
    cmux_workspace: Option<String>,
    cmux_surface: Option<String>,
    cmux_pane_id: Option<String>,
}

fn create_team(
    parent_session: &str,
    strategy: &str,
    label: Option<String>,
    task: &str,
    agents: &[String],
) -> Result<TeamCreateReport, String> {
    if agents.is_empty() {
        return Err("epi agent team create: provide at least one --agent".to_owned());
    }

    let gate_root = config::gate_root_from_env()?;
    let session_store = SessionStore::new(&gate_root)?;
    let team_store = TeamStore::new(&gate_root)?;
    session_store.ensure(parent_session)?;

    let team = build_team(parent_session, strategy, label, task, agents, None);
    for member in &team.members {
        prepare_member_session(&session_store, &team, member)?;
    }
    let saved = team_store.create(team)?;
    Ok(TeamCreateReport {
        ok: true,
        team: saved,
    })
}

fn dispatch_team_member(
    parent_session: &str,
    label: Option<String>,
    agent: &str,
    task: &str,
    session_key: Option<String>,
) -> Result<TeamDispatchReport, String> {
    let gate_root = config::gate_root_from_env()?;
    let session_store = SessionStore::new(&gate_root)?;
    let team_store = TeamStore::new(&gate_root)?;
    session_store.ensure(parent_session)?;

    let agents = vec![agent.to_owned()];
    let mut team = build_team(
        parent_session,
        "parallel",
        label,
        task,
        &agents,
        session_key,
    );
    let member = team
        .members
        .first()
        .cloned()
        .ok_or_else(|| "dispatch requires exactly one member".to_owned())?;
    prepare_member_session(&session_store, &team, &member)?;
    team = team_store.create(team)?;

    let report = subagents::run_runtime(RuntimeSubagentRequest {
        agent_id: member.agent_id.clone(),
        parent_session_key: parent_session.to_owned(),
        session_key: Some(member.session_key.clone()),
        prompt: task.to_owned(),
        team_id: Some(team.team_id.clone()),
        team_role: Some(member.role.clone()),
        orchestration_kind: Some(team.strategy.clone()),
        cmux_workspace: Some(team.cmux_workspace.clone()),
        cmux_surface: Some(cmux::surface_name(
            &team.strategy,
            &member.role,
            member.worker_index,
        )),
        cmux_pane_id: member.cmux_pane_id.clone(),
    })?;

    if let Some(member_mut) = team.members.first_mut() {
        member_mut.status = report.status.clone();
    }
    team.status = report.status.clone();
    team = team_store.save_record(&team)?;

    Ok(TeamDispatchReport {
        ok: report.ok,
        status: report.status,
        team_id: team.team_id.clone(),
        session_key: report.session_key.clone(),
        output: report.output,
        exit_code: report.exit_code,
        elapsed_ms: report.elapsed_ms,
        cmux_workspace: report.cmux_workspace,
        cmux_surface: report.cmux_surface,
        cmux_pane_id: report.cmux_pane_id,
        team,
    })
}

fn build_team(
    parent_session: &str,
    strategy: &str,
    label: Option<String>,
    task: &str,
    agents: &[String],
    override_session_key: Option<String>,
) -> TeamRecord {
    let team_id = format!("team-{}", Uuid::new_v4().simple());
    let workspace = cmux::workspace_name(&team_id);
    let members = agents
        .iter()
        .enumerate()
        .map(|(index, agent_id)| {
            let worker_index = Some((index + 1) as u32);
            let session_key = override_session_key
                .clone()
                .unwrap_or_else(|| format!("agent:{agent_id}:subagent:{team_id}-{}", index + 1));
            TeamMemberRecord {
                session_key,
                agent_id: agent_id.clone(),
                role: "worker".to_owned(),
                status: "pending".to_owned(),
                worker_index,
                cmux_pane_id: Some(cmux::pane_id(&team_id, "worker", worker_index)),
            }
        })
        .collect::<Vec<_>>();

    TeamRecord {
        team_id,
        parent_session_key: parent_session.to_owned(),
        strategy: strategy.to_owned(),
        label,
        task: task.to_owned(),
        status: "pending".to_owned(),
        cmux_workspace: workspace,
        cmux_surface: Some("leader".to_owned()),
        members,
        created_at_ms: 0,
        updated_at_ms: 0,
    }
}

fn prepare_member_session(
    store: &SessionStore,
    team: &TeamRecord,
    member: &TeamMemberRecord,
) -> Result<(), String> {
    let inherited = gate_subagents::resolve_agent_launch_context(
        store,
        &member.session_key,
        Some(&team.parent_session_key),
    )?
    .ok_or_else(|| "team worker lineage context should resolve".to_owned())?;
    store.ensure(&member.session_key)?;
    store.patch(
        &member.session_key,
        SessionPatch {
            active_agent_id: Some(member.agent_id.clone()),
            subagent_lineage: Some(inherited.subagent_lineage),
            spawned_by: Some(Some(team.parent_session_key.clone())),
            vault_now_path: Some(inherited.vault_now_path),
            delivery_context: Some(inherited.delivery_context),
            channel: Some(inherited.channel),
            thread_id: Some(inherited.thread_id),
            group_id: Some(Some(team.team_id.clone())),
            group_channel: Some(Some(team.strategy.clone())),
            group_space: Some(Some(team.cmux_workspace.clone())),
            team_id: Some(Some(team.team_id.clone())),
            team_role: Some(Some(member.role.clone())),
            orchestration_kind: Some(Some(team.strategy.clone())),
            cmux_workspace: Some(Some(team.cmux_workspace.clone())),
            cmux_surface: Some(Some(cmux::surface_name(
                &team.strategy,
                &member.role,
                member.worker_index,
            ))),
            cmux_pane_id: Some(member.cmux_pane_id.clone()),
            ..SessionPatch::default()
        },
    )?;
    Ok(())
}

fn render_json_or_text<T>(value: &T, json: bool) -> Result<String, String>
where
    T: Serialize,
{
    if json {
        serde_json::to_string_pretty(value).map_err(|err| err.to_string())
    } else {
        serde_json::to_string(value).map_err(|err| err.to_string())
    }
}
