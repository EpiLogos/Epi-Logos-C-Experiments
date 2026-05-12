use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BootstrapArtifact {
    pub name: String,
    pub path: PathBuf,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionContext {
    pub session_id: String,
    pub day_id: String,
    pub now_path: PathBuf,
    pub started_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionState {
    pub context: SessionContext,
    pub bootstrap: Vec<BootstrapArtifact>,
    pub env: BTreeMap<String, String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AgentSessionRuntimeRequest {
    pub effective_cwd: PathBuf,
    pub now: DateTime<Utc>,
    pub random_suffix: Option<String>,
    pub force_new: bool,
    pub agent_id: Option<String>,
    pub pi_event: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AgentSessionRuntimeDiagnostic {
    pub severity: String,
    pub message: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AgentSessionRuntime {
    pub effective_cwd: PathBuf,
    pub vault_root: PathBuf,
    pub context: SessionContext,
    pub bootstrap: Vec<BootstrapArtifact>,
    pub env: BTreeMap<String, String>,
    pub pi_session: PiSessionRuntime,
    pub now_write: String,
    pub diagnostics: Vec<AgentSessionRuntimeDiagnostic>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PiSessionRuntime {
    pub event: String,
    pub agent_id: String,
    pub agent_dir: PathBuf,
    pub plugin_runtime_path: PathBuf,
    pub models_path: PathBuf,
    pub auth_profiles_path: PathBuf,
    pub settings_path: PathBuf,
    pub gate_state_root: PathBuf,
    pub resource_loader_id: String,
    #[serde(default)]
    pub default_model: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct AgentSessionRuntimeFactory;

impl AgentSessionRuntimeFactory {
    pub fn new() -> Self {
        Self
    }

    pub fn create(
        &self,
        request: AgentSessionRuntimeRequest,
    ) -> Result<AgentSessionRuntime, String> {
        let env = load_env_file(&request.effective_cwd)?;
        let vault_root = resolve_vault_root_for_repo(&request.effective_cwd, &env);
        let pi_session = pi_session_runtime_for_request(&request, &env);
        let expected_day_id = request.now.format("%d-%m-%Y").to_string();
        let mut diagnostics = Vec::new();

        if !request.force_new && request.random_suffix.is_none() {
            if let Ok(existing) = read_session_state(&request.effective_cwd) {
                let same_day = existing.context.day_id == expected_day_id;
                if same_day && existing.context.now_path.exists() {
                    diagnostics.push(AgentSessionRuntimeDiagnostic {
                        severity: "info".to_string(),
                        message: format!(
                            "reused existing NOW for day {} at {}",
                            existing.context.day_id,
                            existing.context.now_path.display()
                        ),
                    });
                    return Ok(AgentSessionRuntime {
                        effective_cwd: request.effective_cwd,
                        vault_root,
                        context: existing.context,
                        bootstrap: existing.bootstrap,
                        env: existing.env,
                        pi_session,
                        now_write: "reused".to_string(),
                        diagnostics,
                    });
                }
            }
        }

        let context =
            SessionContext::new(request.now, request.random_suffix.as_deref(), &vault_root);
        ensure_now_file(&context)?;
        let bootstrap = bootstrap_sequence(&request.effective_cwd, &context.now_path);
        let state = SessionState {
            context: context.clone(),
            bootstrap: bootstrap.clone(),
            env: env.clone(),
        };
        write_session_state(&request.effective_cwd, &state)?;
        diagnostics.push(AgentSessionRuntimeDiagnostic {
            severity: "info".to_string(),
            message: format!("created NOW at {}", context.now_path.display()),
        });

        Ok(AgentSessionRuntime {
            effective_cwd: request.effective_cwd,
            vault_root,
            context,
            bootstrap,
            env,
            pi_session,
            now_write: "created".to_string(),
            diagnostics,
        })
    }
}

fn pi_session_runtime_for_request(
    request: &AgentSessionRuntimeRequest,
    env: &BTreeMap<String, String>,
) -> PiSessionRuntime {
    let event = request
        .pi_event
        .clone()
        .or_else(|| std::env::var("EPI_PI_EVENT").ok())
        .unwrap_or_else(|| "session_start".to_string());
    let agent_id = request
        .agent_id
        .clone()
        .or_else(|| env.get("EPI_AGENT_ID").cloned())
        .or_else(|| std::env::var("EPI_AGENT_ID").ok())
        .or_else(|| std::env::var("EPI_AGENT_NAME").ok())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| crate::agent::DEFAULT_PI_AGENT_ID.to_string());
    let epi_home = env
        .get("EPI_AGENT_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var("EPI_AGENT_HOME").ok().map(PathBuf::from))
        .unwrap_or_else(|| request.effective_cwd.join(".epi"));
    let agent_dir = epi_home.join("agents").join(&agent_id).join("agent");
    let plugin_runtime_path = agent_dir.join("plugin-runtime.json");
    let models_path = agent_dir.join("models.json");
    let auth_profiles_path = agent_dir.join("auth-profiles.json");
    let settings_path = agent_dir.join("settings.json");
    let gate_state_root = epi_home.join("gate");
    let default_model = read_default_model(&models_path);
    let resource_loader_id = format!(
        "pi:{agent_id}:{}",
        plugin_runtime_path.to_string_lossy().replace('\\', "/")
    );

    PiSessionRuntime {
        event,
        agent_id,
        agent_dir,
        plugin_runtime_path,
        models_path,
        auth_profiles_path,
        settings_path,
        gate_state_root,
        resource_loader_id,
        default_model,
    }
}

fn read_default_model(models_path: &Path) -> Option<String> {
    let body = fs::read_to_string(models_path).ok()?;
    let value: serde_json::Value = serde_json::from_str(&body).ok()?;
    value
        .get("defaultModel")
        .and_then(|model| model.as_str())
        .map(ToOwned::to_owned)
}

impl SessionContext {
    pub fn new(now: DateTime<Utc>, suffix: Option<&str>, vault_root: &Path) -> Self {
        let random_suffix = suffix
            .map(ToOwned::to_owned)
            .unwrap_or_else(default_random_suffix);
        let session_id = generate_session_id_with_suffix(now, &random_suffix);
        let day_id = now.format("%d-%m-%Y").to_string();
        let now_path = vault_root
            .join("Empty")
            .join("Present")
            .join(&day_id)
            .join(&session_id)
            .join("now.md");

        Self {
            session_id,
            day_id,
            now_path,
            started_at: now,
        }
    }

    pub fn new_for_tests(now: DateTime<Utc>, suffix: &str, vault_root: &Path) -> Self {
        Self::new(now, Some(suffix), vault_root)
    }

    pub fn elapsed_summary(&self, now: DateTime<Utc>) -> String {
        let elapsed = now.signed_duration_since(self.started_at);
        let total = elapsed.num_seconds().max(0);
        let hours = total / 3600;
        let minutes = (total % 3600) / 60;
        let seconds = total % 60;
        format!("{hours}h {minutes}m {seconds}s")
    }
}

pub fn generate_session_id_with_suffix(now: DateTime<Utc>, suffix: &str) -> String {
    format!("{}-{suffix}", now.format("%Y%m%d-%H%M%S"))
}

pub fn bootstrap_sequence(repo_root: &Path, now_path: &Path) -> Vec<BootstrapArtifact> {
    vec![
        BootstrapArtifact {
            name: "CONTINUATION.md".to_string(),
            path: repo_root.join("CONTINUATION.md"),
        },
        BootstrapArtifact {
            name: "ANIMA.md".to_string(),
            path: repo_root.join("ANIMA.md"),
        },
        BootstrapArtifact {
            name: "PARADIGM.md".to_string(),
            path: repo_root.join("PARADIGM.md"),
        },
        BootstrapArtifact {
            name: "PASU".to_string(),
            path: repo_root.join("PASU.md"),
        },
        BootstrapArtifact {
            name: "NOW.md".to_string(),
            path: now_path.to_path_buf(),
        },
        BootstrapArtifact {
            name: "TOOLS.md".to_string(),
            path: repo_root.join("TOOLS.md"),
        },
    ]
}

pub fn repo_root_from_env() -> PathBuf {
    std::env::var("EPI_REPO_ROOT")
        .map(PathBuf::from)
        .or_else(|_| std::env::current_dir())
        .unwrap_or_else(|_| PathBuf::from("."))
}

pub fn resolve_vault_root(env_map: &BTreeMap<String, String>) -> PathBuf {
    resolve_vault_root_for_repo(&repo_root_from_env(), env_map)
}

pub fn resolve_vault_root_for_repo(
    repo_root: &Path,
    env_map: &BTreeMap<String, String>,
) -> PathBuf {
    // 1. Explicit env var from .epi-logos.env. Explicit roots are authoritative
    // even before they exist; session init is responsible for creating them.
    if let Some(path) = env_map
        .get("EPILOGOS_VAULT")
        .map(|path| path.trim())
        .filter(|path| !path.is_empty())
    {
        return PathBuf::from(path);
    }
    // 2. EPILOGOS_VAULT from process env (set by khora session_start before this runs)
    if let Ok(path) = std::env::var("EPILOGOS_VAULT") {
        let path = path.trim();
        if !path.is_empty() {
            return PathBuf::from(path);
        }
    }
    // 3. {repo_root}/Idea — autodetect from current repo (canonical repo-as-vault layout)
    let idea = repo_root.join("Idea");
    if idea.exists() {
        return idea;
    }
    // 4. Legacy hardcoded fallback (last resort)
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Documents")
        .join("Epi-Logos")
        .join("Idea")
}

pub fn load_env_file(repo_root: &Path) -> Result<BTreeMap<String, String>, String> {
    let path = repo_root.join(".epi-logos.env");
    if !path.exists() {
        return Ok(BTreeMap::new());
    }

    let content = fs::read_to_string(&path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    let mut values = BTreeMap::new();
    for (index, raw_line) in content.lines().enumerate() {
        let line = raw_line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let (key, value) = line
            .split_once('=')
            .ok_or_else(|| format!("invalid env line {} in {}", index + 1, path.display()))?;
        values.insert(key.trim().to_string(), value.trim().to_string());
    }
    Ok(values)
}

pub fn session_state_path(repo_root: &Path) -> PathBuf {
    repo_root.join(".epi").join("session.json")
}

pub fn write_session_state(repo_root: &Path, state: &SessionState) -> Result<(), String> {
    let path = session_state_path(repo_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let body = serde_json::to_string_pretty(state)
        .map_err(|err| format!("failed to serialize session state: {err}"))?;
    fs::write(&path, body).map_err(|err| format!("failed to write {}: {err}", path.display()))
}

pub fn read_session_state(repo_root: &Path) -> Result<SessionState, String> {
    let path = session_state_path(repo_root);
    let body = fs::read_to_string(&path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    serde_json::from_str(&body).map_err(|err| format!("failed to parse {}: {err}", path.display()))
}

pub fn ensure_now_file(context: &SessionContext) -> Result<(), String> {
    if let Some(parent) = context.now_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    if !context.now_path.exists() {
        let content = format!(
            "---\nsession_id: \"{}\"\nday_id: \"{}\"\n---\n\n# NOW\n\n## #0 Question\n\n## #1 Material\n\n## #2 Analysis\n\n## #3 Pattern\n\n## #4 Context\n\n## #5 Integration\n",
            context.session_id, context.day_id
        );
        fs::write(&context.now_path, content)
            .map_err(|err| format!("failed to write {}: {err}", context.now_path.display()))?;
    }
    Ok(())
}

pub fn default_random_suffix() -> String {
    uuid::Uuid::new_v4().simple().to_string()[..6].to_string()
}
