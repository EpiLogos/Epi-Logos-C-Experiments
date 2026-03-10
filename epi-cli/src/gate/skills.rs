use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct SkillsState {
    #[serde(default)]
    skills: BTreeMap<String, InstalledSkill>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct InstalledSkill {
    skill_key: String,
    name: String,
    description: String,
    source: String,
    disabled: bool,
    updated_at_ms: u128,
    #[serde(default)]
    bins: Vec<String>,
    #[serde(default)]
    primary_env: Option<String>,
    #[serde(default)]
    api_key_set: bool,
}

pub fn install(state_root: impl AsRef<Path>, skill: &str) -> Result<Value, String> {
    let (name, description, source, primary_env) = discover_skill(skill)?;
    let mut state = load_state(&state_root)?;
    state.skills.insert(
        skill.to_owned(),
        InstalledSkill {
            skill_key: skill.to_owned(),
            name,
            description,
            source,
            disabled: false,
            updated_at_ms: now_ms()?,
            bins: vec![skill.to_owned()],
            primary_env,
            api_key_set: false,
        },
    );
    save_state(state_root, &state)?;
    Ok(json!({
        "installed": true,
        "skill": skill,
        "message": format!("Installed {skill}"),
    }))
}

pub fn update(
    state_root: impl AsRef<Path>,
    skill: &str,
    enabled: Option<bool>,
    api_key: Option<&str>,
) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    let entry = state
        .skills
        .get_mut(skill)
        .ok_or_else(|| format!("skill not installed: {skill}"))?;
    if let Some(enabled) = enabled {
        entry.disabled = !enabled;
    }
    if let Some(api_key) = api_key {
        entry.api_key_set = !api_key.trim().is_empty();
    }
    entry.updated_at_ms = now_ms()?;
    save_state(state_root, &state)?;
    Ok(json!({
        "updated": true,
        "skill": skill,
        "message": format!("Updated {skill}"),
    }))
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(&state_root)?;
    let skills = state
        .skills
        .values()
        .map(|skill| {
            json!({
                "skillKey": skill.skill_key,
                "name": skill.name,
                "description": skill.description,
                "source": skill.source,
                "filePath": skill.source,
                "baseDir": PathBuf::from(&skill.source).parent().map(|path| path.display().to_string()).unwrap_or_default(),
                "disabled": skill.disabled,
                "always": false,
                "eligible": true,
                "blockedByAllowlist": false,
                "primaryEnv": skill.primary_env,
                "install": [{"id":"install","label":"Install"}],
                "requirements": {"bins": skill.bins, "env": [], "config": [], "os": []},
                "missing": {"bins": [], "env": if skill.api_key_set { Vec::<String>::new() } else { skill.primary_env.clone().into_iter().collect::<Vec<_>>() }, "config": [], "os": []},
                "configChecks": [],
            })
        })
        .collect::<Vec<_>>();
    Ok(json!({
        "workspaceDir": state_root.as_ref().display().to_string(),
        "managedSkillsDir": state_path(&state_root).display().to_string(),
        "skills": skills,
    }))
}

pub fn bins(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let bins = state
        .skills
        .values()
        .flat_map(|skill| skill.bins.iter().cloned())
        .collect::<Vec<_>>();
    Ok(json!({ "bins": bins }))
}

pub fn invocation_surface(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let state = load_state(state_root)?;
    let skills = state.skills.keys().cloned().collect::<Vec<_>>();
    let bins = state
        .skills
        .values()
        .flat_map(|skill| skill.bins.iter().cloned())
        .collect::<Vec<_>>();
    Ok(json!({
        "skills": skills,
        "bins": bins,
    }))
}

fn discover_skill(skill: &str) -> Result<(String, String, String, Option<String>), String> {
    for root in skill_roots() {
        let path = root.join(skill).join("SKILL.md");
        if path.exists() {
            let content = fs::read_to_string(&path).map_err(|err| err.to_string())?;
            let description = content
                .lines()
                .find(|line| !line.trim().is_empty() && !line.trim_start().starts_with('#'))
                .unwrap_or("Installed skill")
                .trim()
                .to_owned();
            return Ok((
                skill.to_owned(),
                description,
                path.display().to_string(),
                Some(format!(
                    "{}_API_KEY",
                    skill.to_ascii_uppercase().replace('-', "_")
                )),
            ));
        }
    }
    Err(format!("skill not found on disk: {skill}"))
}

fn skill_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();
    if let Some(paths) = std::env::var_os("EPI_GATE_SKILLS_PATHS") {
        roots.extend(std::env::split_paths(&paths));
    }
    if let Some(code_home) = std::env::var_os("CODEX_HOME") {
        let home = PathBuf::from(code_home);
        roots.push(home.join("skills"));
        roots.push(home.join("superpowers/skills"));
    }
    let build_home = PathBuf::from(env!("HOME")).join(".codex");
    roots.push(build_home.join("skills"));
    roots.push(build_home.join("superpowers/skills"));
    if let Some(repo_root) = std::env::var_os("EPI_REPO_ROOT") {
        roots.push(PathBuf::from(repo_root).join("skills"));
    }
    roots
}

fn load_state(state_root: impl AsRef<Path>) -> Result<SkillsState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(SkillsState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &SkillsState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("skills.json")
}

fn now_ms() -> Result<u128, String> {
    Ok(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis())
}
