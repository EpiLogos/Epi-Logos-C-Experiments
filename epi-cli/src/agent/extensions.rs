use crate::agent::{AgentLayout, ExtensionsCmd};
use serde::{Deserialize, Serialize};
use std::fs;
use std::hash::Hasher;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ExtensionSyncReport {
    agent_id: String,
    agent_dir: String,
    source_hash: String,
    synced_files: Vec<String>,
    state: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SyncState {
    source_hash: String,
    synced_at_unix: u64,
    synced_files: Vec<String>,
}

pub fn run(cmd: &ExtensionsCmd, json: bool) -> Result<String, String> {
    match cmd {
        ExtensionsCmd::Sync(selection) => sync(selection.agent.as_deref(), json),
        ExtensionsCmd::Status(selection) => status(selection.agent.as_deref(), json),
        ExtensionsCmd::List(selection) => list(selection.agent.as_deref(), json),
    }
}

fn sync(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    let (source_hash, synced_files) = sync_layout(&layout)?;

    render_report(
        ExtensionSyncReport {
            agent_id: layout.agent_id,
            agent_dir: layout.agent_dir.display().to_string(),
            source_hash,
            synced_files,
            state: "synced".to_owned(),
        },
        json,
    )
}

pub fn sync_layout(layout: &AgentLayout) -> Result<(String, Vec<String>), String> {
    layout.ensure_managed_layout()?;

    if !layout.repo_pi_root.exists() {
        return Err(format!(
            "repo PI root is missing: {}",
            layout.repo_pi_root.display()
        ));
    }

    let repo_files = collect_files(&layout.repo_pi_root)?;
    let mut synced_files = Vec::new();
    for source in &repo_files {
        let relative = source
            .strip_prefix(&layout.repo_pi_root)
            .map_err(|err| err.to_string())?;
        let target = layout.agent_dir.join(relative);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        fs::copy(source, &target).map_err(|err| err.to_string())?;
        synced_files.push(relative.to_string_lossy().replace('\\', "/"));
    }

    let source_hash = hash_files(&repo_files, &layout.repo_pi_root)?;
    let state = SyncState {
        source_hash: source_hash.clone(),
        synced_at_unix: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|err| err.to_string())?
            .as_secs(),
        synced_files: synced_files.clone(),
    };
    fs::write(
        &layout.extension_sync_state_path,
        serde_json::to_string_pretty(&state).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;

    Ok((source_hash, synced_files))
}

fn status(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    let repo_files = if layout.repo_pi_root.exists() {
        collect_files(&layout.repo_pi_root)?
    } else {
        Vec::new()
    };
    let source_hash = if repo_files.is_empty() {
        String::new()
    } else {
        hash_files(&repo_files, &layout.repo_pi_root)?
    };
    let state_file = load_state(&layout.extension_sync_state_path)?;
    let state = match state_file.as_ref() {
        Some(saved) if !source_hash.is_empty() && saved.source_hash == source_hash => "synced",
        Some(_) => "drifted",
        None => "not-synced",
    }
    .to_owned();
    let synced_files = state_file
        .map(|saved| saved.synced_files)
        .unwrap_or_default();

    render_report(
        ExtensionSyncReport {
            agent_id: layout.agent_id,
            agent_dir: layout.agent_dir.display().to_string(),
            source_hash,
            synced_files,
            state,
        },
        json,
    )
}

fn list(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    let synced_files = collect_files(&layout.extensions_dir)
        .unwrap_or_default()
        .into_iter()
        .map(|path| {
            path.strip_prefix(&layout.agent_dir)
                .unwrap_or(&path)
                .to_string_lossy()
                .replace('\\', "/")
        })
        .collect::<Vec<_>>();

    render_report(
        ExtensionSyncReport {
            agent_id: layout.agent_id,
            agent_dir: layout.agent_dir.display().to_string(),
            source_hash: String::new(),
            synced_files,
            state: if layout.extension_sync_state_path.exists() {
                "synced".to_owned()
            } else {
                "not-synced".to_owned()
            },
        },
        json,
    )
}

fn render_report(report: ExtensionSyncReport, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "{}: {} file(s)",
            report.state,
            report.synced_files.len()
        ))
    }
}

fn collect_files(root: &Path) -> Result<Vec<PathBuf>, String> {
    let mut files = Vec::new();
    if !root.exists() {
        return Ok(files);
    }

    for entry in fs::read_dir(root).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            files.extend(collect_files(&path)?);
        } else if path.is_file() {
            files.push(path);
        }
    }
    files.sort();
    Ok(files)
}

fn hash_files(files: &[PathBuf], base: &Path) -> Result<String, String> {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    for file in files {
        hasher.write(
            file.strip_prefix(base)
                .map_err(|err| err.to_string())?
                .to_string_lossy()
                .as_bytes(),
        );
        hasher.write(&fs::read(file).map_err(|err| err.to_string())?);
    }
    Ok(format!("{:016x}", hasher.finish()))
}

fn load_state(path: &Path) -> Result<Option<SyncState>, String> {
    if !path.exists() {
        return Ok(None);
    }
    let contents = fs::read_to_string(path).map_err(|err| err.to_string())?;
    let state = serde_json::from_str(&contents).map_err(|err| err.to_string())?;
    Ok(Some(state))
}
