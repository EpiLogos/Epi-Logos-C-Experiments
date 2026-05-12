use crate::agent::capabilities::CapabilityRegistry;
use crate::agent::hooks;
use crate::agent::plugin_manifest;
use crate::agent::skills;
use crate::agent::subagents;
use crate::agent::{AgentLayout, PluginCmd, PluginsCmd};
use serde::Deserialize;
use serde::Serialize;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};

const REPO_PLUGIN_REGISTRY_RELATIVE_PATHS: &[&str] = &[
    "Body/S/S4/plugins/registry.jsonl",
    "Body/S/S5/plugins/registry.jsonl",
    "plugins/registry.jsonl",
];
const REPO_PLUGIN_ROOT_RELATIVE_PATHS: &[&str] =
    &["Body/S/S4/plugins", "Body/S/S5/plugins", "plugins"];

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginValidationReport {
    pub valid: bool,
    pub path: String,
    pub name: Option<String>,
    pub version: Option<String>,
    pub description: Option<String>,
    pub skill_count: usize,
    pub subagent_count: usize,
    pub hook_event_count: usize,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginRuntimeIndex {
    pub plugins: Vec<PluginRuntimeEntry>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginRuntimeEntry {
    pub name: String,
    pub version: String,
    pub root: String,
    pub skill_count: usize,
    pub subagent_count: usize,
    pub hook_event_count: usize,
}

#[derive(Debug, Deserialize)]
struct RepoPluginRegistryEntry {
    root: String,
    #[serde(default)]
    agents: Option<Vec<String>>,
}

pub fn run_plugin(cmd: &PluginCmd, json: bool) -> Result<String, String> {
    match cmd {
        PluginCmd::Validate { path } => render(validate_plugin(path), json),
    }
}

pub fn run_plugins(cmd: &PluginsCmd, json: bool) -> Result<String, String> {
    match cmd {
        PluginsCmd::List => {
            let layout = AgentLayout::resolve(None)?;
            let reports = discover_all_repo_plugins(&layout.repo_root);
            if json {
                serde_json::to_string_pretty(&reports).map_err(|err| err.to_string())
            } else {
                Ok(reports
                    .into_iter()
                    .filter_map(|report| report.name)
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
    }
}

pub fn validate_plugin(path: &Path) -> PluginValidationReport {
    let root = path.to_path_buf();
    let registry = CapabilityRegistry::default();
    let mut errors = Vec::new();

    let manifest = match plugin_manifest::load_from_root(&root) {
        Ok(manifest) => Some(manifest),
        Err(mut manifest_errors) => {
            errors.append(&mut manifest_errors);
            None
        }
    };

    let (skills, mut skill_errors) = skills::discover_under(&root, &registry);
    let (subagents, mut subagent_errors) = subagents::discover_under(&root, &registry);
    errors.append(&mut skill_errors);
    errors.append(&mut subagent_errors);

    let hook_report = hooks::validate_path(&root);
    errors.extend(hook_report.errors.clone());
    errors.extend(duplicate_name_errors(
        "skill",
        skills
            .iter()
            .map(|skill| (skill.name.as_str(), skill.path.as_str())),
    ));
    errors.extend(duplicate_name_errors(
        "subagent",
        subagents
            .iter()
            .map(|subagent| (subagent.name.as_str(), subagent.path.as_str())),
    ));

    PluginValidationReport {
        valid: errors.is_empty() && manifest.is_some(),
        path: display_path(&root),
        name: manifest.as_ref().map(|item| item.name.clone()),
        version: manifest.as_ref().map(|item| item.version.clone()),
        description: manifest.and_then(|item| item.description),
        skill_count: skills.len(),
        subagent_count: subagents.len(),
        hook_event_count: hook_report.events.len(),
        errors,
    }
}

pub fn prepare_runtime(
    layout: &AgentLayout,
    plugin_dirs: &[PathBuf],
) -> Result<Option<PluginRuntimeIndex>, String> {
    if plugin_dirs.is_empty() {
        return Ok(None);
    }

    let mut entries = Vec::new();
    for plugin_dir in plugin_dirs {
        let report = validate_plugin(plugin_dir);
        if !report.valid {
            return Err(format!(
                "invalid plugin bundle at {}: {}",
                plugin_dir.display(),
                report.errors.join("; ")
            ));
        }

        entries.push(PluginRuntimeEntry {
            name: report.name.unwrap_or_default(),
            version: report.version.unwrap_or_default(),
            root: display_path(plugin_dir),
            skill_count: report.skill_count,
            subagent_count: report.subagent_count,
            hook_event_count: report.hook_event_count,
        });
    }

    let runtime = PluginRuntimeIndex { plugins: entries };
    fs::write(
        &layout.plugin_runtime_path,
        serde_json::to_string_pretty(&runtime).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;
    Ok(Some(runtime))
}

pub fn runtime_path(layout: &AgentLayout) -> &Path {
    &layout.plugin_runtime_path
}

pub fn resolve_runtime_plugin_dirs(
    repo_root: &Path,
    agent_id: &str,
    explicit_plugin_dirs: &[PathBuf],
) -> Result<Vec<PathBuf>, String> {
    let mut dirs = configured_repo_plugin_dirs(repo_root, agent_id)?;
    dirs.extend(explicit_plugin_dirs.iter().cloned());

    let mut deduped = Vec::new();
    let mut seen = BTreeMap::<String, ()>::new();
    for dir in dirs {
        let key = display_path(&dir);
        if seen.insert(key, ()).is_none() {
            deduped.push(dir);
        }
    }

    Ok(deduped)
}

fn discover_repo_plugins(repo_root: &Path) -> Vec<PluginValidationReport> {
    let mut reports = Vec::new();
    let mut seen = BTreeSet::<String>::new();

    for relative_path in REPO_PLUGIN_ROOT_RELATIVE_PATHS {
        let plugins_root = repo_root.join(relative_path);
        let entries = match fs::read_dir(&plugins_root) {
            Ok(entries) => entries,
            Err(_) => continue,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() && plugin_manifest::manifest_path(&path).exists() {
                let key = display_path(&path);
                if seen.insert(key) {
                    reports.push(validate_plugin(&path));
                }
            }
        }
    }

    reports.sort_by(|left, right| {
        left.name
            .as_deref()
            .unwrap_or("")
            .cmp(right.name.as_deref().unwrap_or(""))
            .then_with(|| left.path.cmp(&right.path))
    });
    reports
}

fn discover_all_repo_plugins(repo_root: &Path) -> Vec<PluginValidationReport> {
    let mut reports = discover_repo_plugins(repo_root);
    let mut seen = reports
        .iter()
        .map(|report| report.path.clone())
        .collect::<BTreeSet<_>>();

    if let Ok(extra_dirs) = configured_repo_plugin_dirs(repo_root, "*") {
        for dir in extra_dirs {
            let key = display_path(&dir);
            if seen.insert(key.clone()) {
                reports.push(validate_plugin(&dir));
            }
        }
    }

    reports.sort_by(|left, right| {
        left.name
            .as_deref()
            .unwrap_or("")
            .cmp(right.name.as_deref().unwrap_or(""))
            .then_with(|| left.path.cmp(&right.path))
    });
    reports
}

fn configured_repo_plugin_dirs(repo_root: &Path, agent_id: &str) -> Result<Vec<PathBuf>, String> {
    let mut dirs = Vec::new();
    for relative_path in REPO_PLUGIN_REGISTRY_RELATIVE_PATHS {
        let registry_path = repo_root.join(relative_path);
        if !registry_path.exists() {
            continue;
        }

        let contents = fs::read_to_string(&registry_path).map_err(|err| {
            format!(
                "{}: unable to read plugin registry: {err}",
                registry_path.display()
            )
        })?;

        for (index, line) in contents.lines().enumerate() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            let entry =
                serde_json::from_str::<RepoPluginRegistryEntry>(trimmed).map_err(|err| {
                    format!(
                        "{}:{}: invalid plugin registry entry: {err}",
                        registry_path.display(),
                        index + 1
                    )
                })?;

            if !entry_applies_to_agent(&entry, agent_id) {
                continue;
            }

            let path = PathBuf::from(&entry.root);
            let resolved = if path.is_absolute() {
                path
            } else {
                repo_root.join(path)
            };

            if !resolved.exists() {
                return Err(format!(
                    "{}:{}: plugin root does not exist: {}",
                    registry_path.display(),
                    index + 1,
                    resolved.display()
                ));
            }

            dirs.push(resolved);
        }
    }

    Ok(dirs)
}

fn entry_applies_to_agent(entry: &RepoPluginRegistryEntry, agent_id: &str) -> bool {
    if agent_id == "*" {
        return true;
    }

    entry
        .agents
        .as_ref()
        .map(|agents| {
            agents.iter().any(|agent| {
                agent == agent_id
                    || agent == "*"
                    || (agent_id == "main" && matches!(agent.as_str(), "anima" | "main"))
            })
        })
        .unwrap_or(true)
}

fn duplicate_name_errors<'a>(
    noun: &str,
    items: impl Iterator<Item = (&'a str, &'a str)>,
) -> Vec<String> {
    let mut seen: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for (name, path) in items {
        seen.entry(name).or_default().push(path);
    }

    seen.into_iter()
        .filter(|(_, paths)| paths.len() > 1)
        .flat_map(|(name, paths)| {
            paths
                .into_iter()
                .map(move |path| format!("{path}: duplicate {noun} name `{name}` in plugin bundle"))
        })
        .collect()
}

fn render(report: PluginValidationReport, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "{} {}",
            if report.valid { "valid" } else { "invalid" },
            report.path
        ))
    }
}

fn display_path(path: &Path) -> String {
    path.canonicalize()
        .unwrap_or_else(|_| path.to_path_buf())
        .display()
        .to_string()
}
