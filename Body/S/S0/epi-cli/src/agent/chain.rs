use serde::Serialize;
use uuid::Uuid;

use crate::agent::{
    subagents::{self, RuntimeSubagentRequest},
    ChainCmd,
};
use crate::gate::{
    config,
    session_store::{SessionPatch, SessionStore},
    subagents as gate_subagents,
    team_store::{TeamMemberRecord, TeamRecord, TeamStore},
};
use crate::techne::cmux;

pub fn run(cmd: &ChainCmd, json: bool) -> Result<String, String> {
    match cmd {
        ChainCmd::Run {
            parent_session,
            label,
            task,
            agents,
        } => render_json_or_text(
            &run_chain(parent_session, label.clone(), task, agents)?,
            json,
        ),
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ChainRunReport {
    ok: bool,
    status: String,
    team: TeamRecord,
    steps: Vec<ChainStepReport>,
    output: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ChainStepReport {
    agent: String,
    session_key: String,
    status: String,
    output: String,
    exit_code: i32,
    elapsed_ms: u128,
}

fn run_chain(
    parent_session: &str,
    label: Option<String>,
    task: &str,
    agents: &[String],
) -> Result<ChainRunReport, String> {
    if agents.is_empty() {
        return Err("epi agent chain run: provide at least one --agent".to_owned());
    }

    let gate_root = config::gate_root_from_env()?;
    let session_store = SessionStore::new(&gate_root)?;
    let team_store = TeamStore::new(&gate_root)?;
    session_store.ensure(parent_session)?;

    let mut team = build_chain_team(parent_session, label, task, agents);
    for member in &team.members {
        prepare_member_session(&session_store, &team, member)?;
    }
    team.status = "running".to_owned();
    team = team_store.create(team)?;

    let mut input = task.to_owned();
    let mut steps = Vec::new();

    for member in &mut team.members {
        member.status = "running".to_owned();
        let report = subagents::run_runtime(RuntimeSubagentRequest {
            agent_id: member.agent_id.clone(),
            parent_session_key: parent_session.to_owned(),
            session_key: Some(member.session_key.clone()),
            prompt: input.clone(),
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
        member.status = report.status.clone();
        input = report.output.clone();
        steps.push(ChainStepReport {
            agent: member.agent_id.clone(),
            session_key: report.session_key,
            status: report.status.clone(),
            output: report.output,
            exit_code: report.exit_code,
            elapsed_ms: report.elapsed_ms,
        });
        if !report.ok {
            team.status = "error".to_owned();
            team = team_store.save_record(&team)?;
            return Ok(ChainRunReport {
                ok: false,
                status: "error".to_owned(),
                team,
                steps,
                output: input,
            });
        }
    }

    team.status = "completed".to_owned();
    team = team_store.save_record(&team)?;
    Ok(ChainRunReport {
        ok: true,
        status: "completed".to_owned(),
        team,
        steps,
        output: input,
    })
}

fn build_chain_team(
    parent_session: &str,
    label: Option<String>,
    task: &str,
    agents: &[String],
) -> TeamRecord {
    let team_id = format!("team-{}", Uuid::new_v4().simple());
    let workspace = cmux::workspace_name(&team_id);
    let members = agents
        .iter()
        .enumerate()
        .map(|(index, agent_id)| {
            let worker_index = Some((index + 1) as u32);
            TeamMemberRecord {
                session_key: format!("agent:{agent_id}:subagent:{team_id}-{}", index + 1),
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
        strategy: "chain".to_owned(),
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
    .ok_or_else(|| "chain member lineage context should resolve".to_owned())?;
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
