use crate::agent::{AgentLayout, AgentsCmd};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct AgentRegistry {
    agents: Vec<AgentRecord>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct AgentRecord {
    id: String,
    agent_dir: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AgentInspectReport {
    id: String,
    agent_dir: String,
    models_path: String,
    auth_profiles_path: String,
}

pub fn run(cmd: &AgentsCmd, json: bool) -> Result<String, String> {
    match cmd {
        AgentsCmd::Init => init(json),
        AgentsCmd::Add { id } => add(id, json),
        AgentsCmd::List => list(json),
        AgentsCmd::Inspect { id } => inspect(id, json),
    }
}

fn init(json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(Some("main"))?;
    ensure_registered(&layout)?;
    render_registry(load_registry(&layout)?, json)
}

fn add(id: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(Some(id))?;
    ensure_registered(&layout)?;
    let report = AgentInspectReport {
        id: layout.agent_id.clone(),
        agent_dir: layout.agent_dir.display().to_string(),
        models_path: layout.models_path.display().to_string(),
        auth_profiles_path: layout.auth_profiles_path.display().to_string(),
    };
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!("registered agent {}", report.id))
    }
}

fn list(json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(None)?;
    render_registry(load_registry(&layout)?, json)
}

fn inspect(id: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(Some(id))?;
    let report = AgentInspectReport {
        id: layout.agent_id,
        agent_dir: layout.agent_dir.display().to_string(),
        models_path: layout.models_path.display().to_string(),
        auth_profiles_path: layout.auth_profiles_path.display().to_string(),
    };
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!("{} -> {}", report.id, report.agent_dir))
    }
}

fn ensure_registered(layout: &AgentLayout) -> Result<(), String> {
    layout.ensure_managed_layout()?;
    let mut registry = load_registry(layout)?;
    if !registry
        .agents
        .iter()
        .any(|agent| agent.id == layout.agent_id)
    {
        registry.agents.push(AgentRecord {
            id: layout.agent_id.clone(),
            agent_dir: layout.agent_dir.display().to_string(),
        });
        registry
            .agents
            .sort_by(|left, right| left.id.cmp(&right.id));
        save_registry(layout, &registry)?;
    }
    Ok(())
}

fn load_registry(layout: &AgentLayout) -> Result<AgentRegistry, String> {
    if !layout.agents_registry_path.exists() {
        return Ok(AgentRegistry::default());
    }
    let contents =
        fs::read_to_string(&layout.agents_registry_path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

fn save_registry(layout: &AgentLayout, registry: &AgentRegistry) -> Result<(), String> {
    if let Some(parent) = layout.agents_registry_path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    fs::write(
        &layout.agents_registry_path,
        serde_json::to_string_pretty(registry).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())
}

fn render_registry(registry: AgentRegistry, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&registry).map_err(|err| err.to_string())
    } else {
        Ok(registry
            .agents
            .into_iter()
            .map(|agent| agent.id)
            .collect::<Vec<_>>()
            .join("\n"))
    }
}
