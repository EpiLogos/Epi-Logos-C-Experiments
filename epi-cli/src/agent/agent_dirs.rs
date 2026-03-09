use std::env;
use std::fs;
use std::path::{Path, PathBuf};

const REQUIRED_REPO_ASSETS: &[&str] = &[
    ".pi/README.md",
    ".pi/composite-entry.ts",
    ".pi/prompts/epi-system.md",
    ".pi/prompts/epi-agent-help.md",
    ".pi/agents/teams.yaml",
    ".pi/agents/agent-chain.yaml",
    "skills/README.md",
    "commands/README.md",
    "hooks/README.md",
    "hooks/manifest.json",
];

#[derive(Debug, Clone)]
pub struct AgentLayout {
    pub agent_id: String,
    pub repo_root: PathBuf,
    pub repo_pi_root: PathBuf,
    pub epi_home: PathBuf,
    pub agent_dir: PathBuf,
    pub models_path: PathBuf,
    pub auth_profiles_path: PathBuf,
    pub extensions_dir: PathBuf,
    pub prompts_dir: PathBuf,
    pub composite_entry_path: PathBuf,
    pub plugin_runtime_path: PathBuf,
    pub agents_registry_path: PathBuf,
    pub extension_sync_state_path: PathBuf,
}

impl AgentLayout {
    pub fn resolve(agent: Option<&str>) -> Result<Self, String> {
        let repo_root = detect_repo_root()?;
        let repo_pi_root = repo_root.join(".pi");

        if let Some(explicit_agent_dir) = explicit_agent_dir_override()? {
            let agent_id = agent
                .map(str::to_owned)
                .unwrap_or_else(|| infer_agent_id(&explicit_agent_dir));
            let epi_home = infer_epi_home(&explicit_agent_dir)
                .unwrap_or_else(|| default_epi_home().unwrap_or_else(|_| repo_root.join(".epi")));
            return Ok(Self::build(
                agent_id,
                repo_root,
                repo_pi_root,
                epi_home,
                explicit_agent_dir,
            ));
        }

        let agent_id = agent.unwrap_or("main").to_owned();
        let epi_home = default_epi_home()?;
        let agent_dir = epi_home.join("agents").join(&agent_id).join("agent");
        Ok(Self::build(
            agent_id,
            repo_root,
            repo_pi_root,
            epi_home,
            agent_dir,
        ))
    }

    fn build(
        agent_id: String,
        repo_root: PathBuf,
        repo_pi_root: PathBuf,
        epi_home: PathBuf,
        agent_dir: PathBuf,
    ) -> Self {
        Self {
            agent_id,
            repo_root,
            repo_pi_root,
            models_path: agent_dir.join("models.json"),
            auth_profiles_path: agent_dir.join("auth-profiles.json"),
            extensions_dir: agent_dir.join("extensions"),
            prompts_dir: agent_dir.join("prompts"),
            composite_entry_path: agent_dir.join("composite-entry.ts"),
            plugin_runtime_path: agent_dir.join("plugin-runtime.json"),
            agents_registry_path: epi_home.join("agents").join("registry.json"),
            extension_sync_state_path: agent_dir.join("extensions-sync-state.json"),
            epi_home,
            agent_dir,
        }
    }

    pub fn required_repo_assets() -> &'static [&'static str] {
        REQUIRED_REPO_ASSETS
    }

    pub fn ensure_managed_layout(&self) -> Result<(), String> {
        fs::create_dir_all(&self.agent_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.extensions_dir).map_err(|err| err.to_string())?;
        fs::create_dir_all(&self.prompts_dir).map_err(|err| err.to_string())?;
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

        Ok(())
    }

    pub fn relative_to_repo_root(&self, path: &Path) -> String {
        path.strip_prefix(&self.repo_root)
            .unwrap_or(path)
            .to_string_lossy()
            .replace('\\', "/")
    }
}

fn detect_repo_root() -> Result<PathBuf, String> {
    if let Ok(root) = env::var("EPI_REPO_ROOT") {
        return Ok(PathBuf::from(root));
    }

    let mut current = env::current_dir().map_err(|err| err.to_string())?;
    loop {
        if current.join("epi-cli/Cargo.toml").exists() {
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

fn default_epi_home() -> Result<PathBuf, String> {
    if let Ok(value) = env::var("EPI_AGENT_HOME") {
        if !value.trim().is_empty() {
            return Ok(PathBuf::from(value));
        }
    }

    let home = env::var("HOME").map_err(|_| "HOME is not set".to_owned())?;
    Ok(PathBuf::from(home).join(".epi"))
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
