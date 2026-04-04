use crate::agent::AgentLayout;
use crate::agent::runtime;
use serde::Serialize;
use std::fs;
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DoctorReport {
    agent_id: String,
    repo_root: String,
    epi_home: String,
    canonical_pi_agent_dir: String,
    managed_epi_agent_dir: String,
    interactive_launch_mode: String,
    gate_state_root: String,
    missing_repo_assets: Vec<String>,
    present_repo_assets: Vec<String>,
    pi_binary_present: bool,
    agent_dir: AgentDirStatus,
    extension_sync: ExtensionSyncStatus,
    gateway: GatewayStatus,
    codex_home: CodexHomeStatus,
    skill_roots: Vec<String>,
    surfaces: SurfaceStatus,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AgentDirStatus {
    path: String,
    exists: bool,
    models_path: String,
    auth_profiles_path: String,
    models_present: bool,
    auth_profiles_present: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ExtensionSyncStatus {
    state: String,
    sync_state_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GatewayStatus {
    state_root: String,
    url: String,
    port: u16,
    status_file_present: bool,
    process_record_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CodexHomeStatus {
    path: String,
    skills_path: String,
    superpowers_skills_path: String,
    projected_agents_path: String,
}

#[derive(Serialize)]
struct SurfaceStatus {
    skills: Vec<String>,
    commands: Vec<String>,
    hooks: Vec<String>,
}

pub fn run(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    let (present_repo_assets, missing_repo_assets) = repo_asset_status(&layout);
    let report = DoctorReport {
        agent_id: layout.agent_id.clone(),
        repo_root: layout.repo_root.display().to_string(),
        epi_home: layout.epi_home.display().to_string(),
        canonical_pi_agent_dir: layout.canonical_pi_agent_dir.display().to_string(),
        managed_epi_agent_dir: layout.managed_epi_agent_dir.display().to_string(),
        interactive_launch_mode: "claw".to_owned(),
        gate_state_root: layout.gate_state_root.display().to_string(),
        missing_repo_assets,
        present_repo_assets,
        pi_binary_present: pi_binary_present(),
        agent_dir: AgentDirStatus {
            path: layout.agent_dir.display().to_string(),
            exists: layout.agent_dir.exists(),
            models_path: layout.models_path.display().to_string(),
            auth_profiles_path: layout.auth_profiles_path.display().to_string(),
            models_present: layout.models_path.exists(),
            auth_profiles_present: layout.auth_profiles_path.exists(),
        },
        extension_sync: ExtensionSyncStatus {
            state: if layout.extension_sync_state_path.exists() {
                "synced".to_owned()
            } else {
                "not-synced".to_owned()
            },
            sync_state_path: layout.extension_sync_state_path.display().to_string(),
        },
        gateway: GatewayStatus {
            state_root: layout.gate_state_root.display().to_string(),
            url: format!("ws://127.0.0.1:{}", runtime::gateway_port_from_env()),
            port: runtime::gateway_port_from_env(),
            status_file_present: layout.gate_state_root.join("status.json").exists(),
            process_record_path: layout
                .gate_state_root
                .join("up/gateway-process.json")
                .display()
                .to_string(),
        },
        codex_home: CodexHomeStatus {
            path: layout.codex_home.display().to_string(),
            skills_path: layout.codex_skills_dir.display().to_string(),
            superpowers_skills_path: layout.codex_superpowers_skills_dir.display().to_string(),
            projected_agents_path: layout.agents_subagents_dir.display().to_string(),
        },
        skill_roots: layout
            .repo_skill_roots()
            .into_iter()
            .map(|path| path.display().to_string())
            .collect(),
        surfaces: SurfaceStatus {
            skills: list_surface_files(&layout.repo_root.join("skills")),
            commands: list_surface_files(&layout.repo_root.join("commands")),
            hooks: list_surface_files(&layout.repo_root.join("hooks")),
        },
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "agent {}\nrepo root: {}\nmissing repo assets: {}\npi binary present: {}",
            report.agent_id,
            report.repo_root,
            report.missing_repo_assets.join(", "),
            report.pi_binary_present
        ))
    }
}

fn repo_asset_status(layout: &AgentLayout) -> (Vec<String>, Vec<String>) {
    let mut present = Vec::new();
    let mut missing = Vec::new();

    for asset in AgentLayout::required_repo_assets() {
        if layout.repo_root.join(asset).exists() {
            present.push((*asset).to_owned());
        } else {
            missing.push((*asset).to_owned());
        }
    }

    (present, missing)
}

fn pi_binary_present() -> bool {
    Command::new("pi")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

fn list_surface_files(root: &std::path::Path) -> Vec<String> {
    let mut files = Vec::new();
    if let Ok(entries) = fs::read_dir(root) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                files.extend(list_surface_files(&path));
            } else {
                files.push(path.display().to_string());
            }
        }
    }
    files.sort();
    files
}
