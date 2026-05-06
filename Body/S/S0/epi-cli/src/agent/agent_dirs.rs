use std::env;
use std::fs;
use std::path::{Path, PathBuf};

const REQUIRED_REPO_ASSETS: &[&str] = &[
    "Body/S/S4/pi-agent/README.md",
    "Body/S/S4/pi-agent/composite-entry.ts",
    "Body/S/S4/pi-agent/prompts/epi-system.md",
    "Body/S/S4/pi-agent/prompts/epi-agent-help.md",
    "Body/S/S4/pi-agent/agents/teams.yaml",
    "Body/S/S4/pi-agent/agents/agent-chain.yaml",
    "skills/README.md",
    "commands/README.md",
    "hooks/README.md",
    "hooks/manifest.json",
];

const TA_ONTA_SKILL_ROOTS: &[&str] = &[
    "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills",
    "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills",
    "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills",
];

const TA_ONTA_AGENT_ROOTS: &[&str] = &[
    "Body/S/S4/ta-onta/S4-4p-anima/S4'/agents",
    "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents",
];

#[derive(Debug, Clone)]
pub struct AgentLayout {
    pub agent_id: String,
    pub repo_root: PathBuf,
    pub repo_pi_root: PathBuf,
    pub home_root: PathBuf,
    pub epi_home: PathBuf,
    pub canonical_pi_agent_dir: PathBuf,
    pub managed_epi_agent_dir: PathBuf,
    pub agent_dir: PathBuf,
    pub models_path: PathBuf,
    pub auth_profiles_path: PathBuf,
    pub extensions_dir: PathBuf,
    pub prompts_dir: PathBuf,
    pub composite_entry_path: PathBuf,
    pub plugin_runtime_path: PathBuf,
    pub agents_registry_path: PathBuf,
    pub extension_sync_state_path: PathBuf,
    pub settings_path: PathBuf,
    pub auth_path: PathBuf,
    pub gate_state_root: PathBuf,
    pub codex_home: PathBuf,
    pub codex_skills_dir: PathBuf,
    pub codex_superpowers_skills_dir: PathBuf,
    pub agents_compat_root: PathBuf,
    pub agents_skills_dir: PathBuf,
    pub agents_subagents_dir: PathBuf,
}

impl AgentLayout {
    pub fn resolve(agent: Option<&str>) -> Result<Self, String> {
        let repo_root = detect_repo_root()?;
        let repo_pi_root = repo_root.join("Body/S/S4/pi-agent");

        if let Some(explicit_agent_dir) = explicit_agent_dir_override()? {
            let agent_id = agent
                .map(str::to_owned)
                .unwrap_or_else(|| infer_agent_id(&explicit_agent_dir));
            let home_root = env_home_root()?;
            let epi_home = infer_epi_home(&explicit_agent_dir)
                .unwrap_or_else(|| default_epi_home_for(&repo_root, &home_root));
            return Ok(Self::build(
                agent_id,
                repo_root,
                repo_pi_root,
                home_root,
                epi_home,
                explicit_agent_dir.clone(),
                explicit_agent_dir,
            ));
        }

        let agent_id = agent.unwrap_or("main").to_owned();
        let home_root = env_home_root()?;
        let epi_home = default_epi_home_for(&repo_root, &home_root);
        let canonical_pi_agent_dir = canonical_pi_agent_dir(&home_root);
        let managed_epi_agent_dir = epi_home.join("agents").join(&agent_id).join("agent");
        Ok(Self::build(
            agent_id,
            repo_root,
            repo_pi_root,
            home_root,
            epi_home,
            canonical_pi_agent_dir,
            managed_epi_agent_dir.clone(),
        ))
    }

    pub fn resolve_for_epi_home(agent: Option<&str>, epi_home: PathBuf) -> Result<Self, String> {
        let repo_root = detect_repo_root()?;
        let repo_pi_root = repo_root.join("Body/S/S4/pi-agent");
        let agent_id = agent.unwrap_or("main").to_owned();
        let home_root = env_home_root().unwrap_or_else(|_| {
            epi_home
                .parent()
                .map(Path::to_path_buf)
                .unwrap_or_else(|| epi_home.clone())
        });
        let canonical_pi_agent_dir = canonical_pi_agent_dir(&home_root);
        let managed_epi_agent_dir = epi_home.join("agents").join(&agent_id).join("agent");
        Ok(Self::build(
            agent_id,
            repo_root,
            repo_pi_root,
            home_root,
            epi_home,
            canonical_pi_agent_dir,
            managed_epi_agent_dir,
        ))
    }

    fn build(
        agent_id: String,
        repo_root: PathBuf,
        repo_pi_root: PathBuf,
        home_root: PathBuf,
        epi_home: PathBuf,
        canonical_pi_agent_dir: PathBuf,
        managed_epi_agent_dir: PathBuf,
    ) -> Self {
        let gate_state_root = epi_home.join("gate");
        let codex_home = managed_epi_agent_dir.join("compat/codex-home");
        let codex_skills_dir = codex_home.join("skills");
        let codex_superpowers_skills_dir = codex_home.join("superpowers").join("skills");
        let agents_compat_root = managed_epi_agent_dir.join("compat/.agents");
        let agents_skills_dir = agents_compat_root.join("skills");
        let agents_subagents_dir = agents_compat_root.join("agents");

        Self {
            agent_id,
            repo_root,
            repo_pi_root,
            home_root,
            models_path: managed_epi_agent_dir.join("models.json"),
            auth_profiles_path: managed_epi_agent_dir.join("auth-profiles.json"),
            extensions_dir: managed_epi_agent_dir.join("extensions"),
            prompts_dir: managed_epi_agent_dir.join("prompts"),
            composite_entry_path: managed_epi_agent_dir.join("composite-entry.ts"),
            plugin_runtime_path: managed_epi_agent_dir.join("plugin-runtime.json"),
            agents_registry_path: epi_home.join("agents").join("registry.json"),
            extension_sync_state_path: managed_epi_agent_dir.join("extensions-sync-state.json"),
            settings_path: managed_epi_agent_dir.join("settings.json"),
            auth_path: managed_epi_agent_dir.join("auth.json"),
            gate_state_root,
            codex_home,
            codex_skills_dir,
            codex_superpowers_skills_dir,
            agents_compat_root,
            agents_skills_dir,
            agents_subagents_dir,
            epi_home,
            canonical_pi_agent_dir,
            managed_epi_agent_dir: managed_epi_agent_dir.clone(),
            agent_dir: managed_epi_agent_dir,
        }
    }

    pub fn required_repo_assets() -> &'static [&'static str] {
        REQUIRED_REPO_ASSETS
    }

    pub fn ensure_managed_layout(&self) -> Result<(), String> {
        fs::create_dir_all(&self.agent_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.extensions_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.prompts_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.gate_state_root).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.codex_skills_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.codex_superpowers_skills_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.agents_skills_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.agents_subagents_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(self.agents_registry_path.parent().unwrap_or(&self.epi_home))
            .map_err(|err| err.to_string())?;

        if !self.models_path.exists() {
            fs::write(&self.models_path, "{\n  \"providers\": []\n}\n")
                .map_err(|err| err.to_string())?;
        }
        if !self.auth_profiles_path.exists() {
            fs::write(&self.auth_profiles_path, "{\n  \"profiles\": {}\n}\n")
                .map_err(|err| err.to_string())?;
        }
        seed_runtime_file(
            &self.canonical_pi_agent_dir.join("settings.json"),
            &self.settings_path,
            "{\n  \"lastChangelogVersion\": \"0.57.1\"\n}\n",
        )?;
        seed_runtime_file(
            &self.canonical_pi_agent_dir.join("auth.json"),
            &self.auth_path,
            "{}\n",
        )?;
        self.project_repo_capability_roots()?;

        Ok(())
    }

    pub fn repo_skill_roots(&self) -> Vec<PathBuf> {
        let mut roots = Vec::new();
        let repo_skills = self.repo_root.join("skills");
        if repo_skills.exists() {
            roots.push(repo_skills);
        }
        for relative in TA_ONTA_SKILL_ROOTS {
            let path = self.repo_root.join(relative);
            if path.exists() {
                roots.push(path);
            }
        }
        roots
    }

    pub fn repo_subagent_roots(&self) -> Vec<PathBuf> {
        let mut roots = Vec::new();
        for relative in TA_ONTA_AGENT_ROOTS {
            let path = self.repo_root.join(relative);
            if path.exists() {
                roots.push(path);
            }
        }
        roots
    }

    pub fn relative_to_repo_root(&self, path: &Path) -> String {
        path.strip_prefix(&self.repo_root)
            .unwrap_or(path)
            .to_string_lossy()
            .replace('\\', "/")
    }

    fn project_repo_capability_roots(&self) -> Result<(), String> {
        reset_dir(&self.codex_skills_dir)?;
        reset_dir(&self.codex_superpowers_skills_dir)?;
        reset_dir(&self.agents_skills_dir)?;
        reset_dir(&self.agents_subagents_dir)?;

        for root in self.repo_skill_roots() {
            let is_superpowers = root.ends_with("anima/S4'/skills");
            project_skill_root(
                &root,
                &self.codex_skills_dir,
                &self.agents_skills_dir,
                if is_superpowers {
                    Some(&self.codex_superpowers_skills_dir)
                } else {
                    None
                },
            )?;
        }

        for root in self.repo_subagent_roots() {
            project_agent_root(&root, &self.agents_subagents_dir)?;
        }

        Ok(())
    }
}

pub fn canonical_pi_agent_dir(home_root: &Path) -> PathBuf {
    home_root.join(".pi").join("agent")
}

pub fn managed_epi_agent_dir(base_root: &Path, agent_id: &str) -> PathBuf {
    let epi_home = if base_root.file_name().and_then(|name| name.to_str()) == Some(".epi") {
        base_root.to_path_buf()
    } else {
        base_root.join(".epi")
    };
    epi_home.join("agents").join(agent_id).join("agent")
}

fn detect_repo_root() -> Result<PathBuf, String> {
    if let Ok(root) = env::var("EPI_REPO_ROOT") {
        return Ok(PathBuf::from(root));
    }

    let mut current = env::current_dir().map_err(|err| err.to_string())?;
    loop {
        if current.join("Body/S/S0/epi-cli/Cargo.toml").exists() && current.join("Idea").exists() {
            return Ok(current);
        }
        if !current.pop() {
            break;
        }
    }
    Err("unable to locate repo root; set EPI_REPO_ROOT".to_owned())
}

fn explicit_agent_dir_override() -> Result<Option<PathBuf>, String> {
    for key in ["PI_CODING_AGENT_DIR", "EPI_AGENT_DIR"] {
        if let Ok(value) = env::var(key) {
            if !value.trim().is_empty() {
                return Ok(Some(PathBuf::from(value)));
            }
        }
    }
    Ok(None)
}

fn env_home_root() -> Result<PathBuf, String> {
    let home = env::var("HOME").map_err(|_| "HOME is not set".to_owned())?;
    Ok(PathBuf::from(home))
}

fn default_epi_home_for(repo_root: &Path, home_root: &Path) -> PathBuf {
    if let Ok(value) = env::var("EPI_AGENT_HOME") {
        if !value.trim().is_empty() {
            return PathBuf::from(value);
        }
    }
    let _ = home_root;
    repo_root.join(".epi")
}

fn infer_agent_id(agent_dir: &Path) -> String {
    agent_dir
        .parent()
        .and_then(Path::file_name)
        .and_then(|name| name.to_str())
        .unwrap_or("main")
        .to_owned()
}

fn infer_epi_home(agent_dir: &Path) -> Option<PathBuf> {
    agent_dir
        .parent()?
        .parent()?
        .parent()
        .map(Path::to_path_buf)
}

fn seed_runtime_file(source: &Path, target: &Path, default_contents: &str) -> Result<(), String> {
    if target.exists() {
        return Ok(());
    }
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    if source.exists() {
        fs::copy(source, target).map_err(|err| err.to_string())?;
    } else {
        fs::write(target, default_contents).map_err(|err| err.to_string())?;
    }
    Ok(())
}

fn reset_dir(path: &Path) -> Result<(), String> {
    if path.exists() {
        fs::remove_dir_all(path).map_err(|err| err.to_string())?;
    }
    fs::create_dir_all(path).map_err(|err| err.to_string())
}

fn project_skill_root(
    source_root: &Path,
    codex_target_root: &Path,
    agents_target_root: &Path,
    superpowers_target_root: Option<&Path>,
) -> Result<(), String> {
    let entries = match fs::read_dir(source_root) {
        Ok(entries) => entries,
        Err(_) => return Ok(()),
    };

    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let source = entry.path();
        if !source.is_dir() || !source.join("SKILL.md").exists() {
            continue;
        }
        let name = entry.file_name();
        copy_tree(&source, &codex_target_root.join(&name))?;
        copy_tree(&source, &agents_target_root.join(&name))?;
        if let Some(target_root) = superpowers_target_root {
            copy_tree(&source, &target_root.join(&name))?;
        }
    }

    Ok(())
}

fn project_agent_root(source_root: &Path, target_root: &Path) -> Result<(), String> {
    let entries = match fs::read_dir(source_root) {
        Ok(entries) => entries,
        Err(_) => return Ok(()),
    };

    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let source = entry.path();
        if source.is_dir() {
            project_agent_root(&source, target_root)?;
            continue;
        }
        if source.extension().and_then(|ext| ext.to_str()) != Some("md") {
            continue;
        }
        let target = target_root.join(entry.file_name());
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|err| err.to_string())?;
        }
        fs::copy(&source, target).map_err(|err| err.to_string())?;
    }

    Ok(())
}

fn copy_tree(source: &Path, target: &Path) -> Result<(), String> {
    if target.exists() {
        fs::remove_dir_all(target).map_err(|err| err.to_string())?;
    }
    fs::create_dir_all(target).map_err(|err| err.to_string())?;

    for entry in fs::read_dir(source).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let source_path = entry.path();
        let target_path = target.join(entry.file_name());
        if source_path.is_dir() {
            copy_tree(&source_path, &target_path)?;
        } else {
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent).map_err(|err| err.to_string())?;
            }
            fs::copy(&source_path, &target_path).map_err(|err| err.to_string())?;
        }
    }

    Ok(())
}
