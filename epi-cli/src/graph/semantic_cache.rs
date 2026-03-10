use std::collections::BTreeMap;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct SemanticCacheConfig {
    pub redis_url: String,
    pub python_bin: PathBuf,
    pub script_path: PathBuf,
    pub cache_name: String,
    pub similarity_threshold: f64,
    pub ttl_seconds: Option<u64>,
    pub arch: Option<String>,
}

impl SemanticCacheConfig {
    pub fn from_env() -> Result<Self, String> {
        let redis_url = std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL")
            .map_err(|_| "EPILOGOS_SEMANTIC_CACHE_REDIS_URL not set".to_string())?;
        let script_path = std::env::var("EPILOGOS_SEMANTIC_CACHE_SCRIPT")
            .map(PathBuf::from)
            .unwrap_or_else(|_| default_script_path());

        Ok(Self {
            redis_url,
            python_bin: resolve_python_bin(&script_path),
            script_path,
            cache_name: std::env::var("EPILOGOS_SEMANTIC_CACHE_NAME")
                .unwrap_or_else(|_| "epi_semantic_cache".into()),
            similarity_threshold: std::env::var("EPILOGOS_SEMANTIC_CACHE_THRESHOLD")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(0.9),
            ttl_seconds: std::env::var("EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS")
                .ok()
                .and_then(|value| value.parse().ok()),
            arch: std::env::var("EPILOGOS_SEMANTIC_CACHE_ARCH")
                .ok()
                .or_else(default_arch_override),
        })
    }

    pub fn from_env_optional() -> Result<Option<Self>, String> {
        match std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL") {
            Ok(_) => Self::from_env().map(Some),
            Err(_) => Ok(None),
        }
    }

    pub fn for_local_dev(repo_root: &Path) -> Self {
        let script_path = repo_root
            .join("epi-cli")
            .join("scripts")
            .join("redisvl_cache_service")
            .join("redisvl_cache_service.py");
        Self::from_script_path(script_path)
    }

    pub fn from_script_path(script_path: PathBuf) -> Self {
        let redis_url = std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".into());
        Self {
            redis_url,
            python_bin: resolve_python_bin(&script_path),
            script_path,
            cache_name: std::env::var("EPILOGOS_SEMANTIC_CACHE_NAME")
                .unwrap_or_else(|_| "epi_semantic_cache".into()),
            similarity_threshold: std::env::var("EPILOGOS_SEMANTIC_CACHE_THRESHOLD")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(0.9),
            ttl_seconds: std::env::var("EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS")
                .ok()
                .and_then(|value| value.parse().ok()),
            arch: std::env::var("EPILOGOS_SEMANTIC_CACHE_ARCH")
                .ok()
                .or_else(default_arch_override),
        }
    }

    pub fn environment_contract(&self) -> BTreeMap<String, String> {
        let mut env = BTreeMap::new();
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_REDIS_URL".into(),
            self.redis_url.clone(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_SCRIPT".into(),
            self.script_path.display().to_string(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_PYTHON".into(),
            self.python_bin.display().to_string(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_NAME".into(),
            self.cache_name.clone(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_THRESHOLD".into(),
            self.similarity_threshold.to_string(),
        );
        if let Some(ttl_seconds) = self.ttl_seconds {
            env.insert(
                "EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS".into(),
                ttl_seconds.to_string(),
            );
        }
        if let Some(arch) = &self.arch {
            env.insert("EPILOGOS_SEMANTIC_CACHE_ARCH".into(), arch.clone());
        }
        env
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SemanticCacheMatchStrategy {
    Exact,
    Semantic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchPayload {
    pub prompt: String,
    pub attributes: BTreeMap<String, String>,
    pub similarity_threshold: f64,
    pub strategies: Vec<SemanticCacheMatchStrategy>,
}

impl SearchPayload {
    pub fn new(
        prompt: impl Into<String>,
        attributes: BTreeMap<String, String>,
        similarity_threshold: f64,
        strategies: Vec<SemanticCacheMatchStrategy>,
    ) -> Self {
        Self {
            prompt: prompt.into(),
            attributes,
            similarity_threshold,
            strategies,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorePayload {
    pub prompt: String,
    pub response: String,
    pub attributes: BTreeMap<String, String>,
}

impl StorePayload {
    pub fn new(
        prompt: impl Into<String>,
        response: impl Into<String>,
        attributes: BTreeMap<String, String>,
    ) -> Self {
        Self {
            prompt: prompt.into(),
            response: response.into(),
            attributes,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub hit: bool,
    pub response: Option<String>,
    pub entry_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticCacheHealth {
    pub ok: bool,
    pub python: String,
    pub redis_url: String,
    pub cache_name: String,
    pub redis_ping: bool,
    pub redis_stack: bool,
    pub search_indexes: Vec<String>,
    pub filterable_fields: Vec<String>,
    pub error: Option<String>,
}

pub struct SemanticCacheClient {
    config: SemanticCacheConfig,
}

impl SemanticCacheClient {
    pub fn new(config: SemanticCacheConfig) -> Self {
        Self { config }
    }

    pub async fn search(
        &self,
        prompt: &str,
        attributes: BTreeMap<String, String>,
        strategies: Vec<SemanticCacheMatchStrategy>,
    ) -> Result<Option<SearchResult>, String> {
        let payload = SearchPayload::new(
            prompt,
            attributes,
            self.config.similarity_threshold,
            strategies,
        );
        let result: SearchResult = self.invoke("search", &payload)?;
        if result.hit {
            Ok(Some(result))
        } else {
            Ok(None)
        }
    }

    pub async fn store(
        &self,
        prompt: &str,
        response: &str,
        attributes: BTreeMap<String, String>,
    ) -> Result<(), String> {
        let payload = StorePayload::new(prompt, response, attributes);
        let _: serde_json::Value = self.invoke("store", &payload)?;
        Ok(())
    }

    pub async fn flush(&self) -> Result<(), String> {
        let _: serde_json::Value = self.invoke("flush", &serde_json::json!({}))?;
        Ok(())
    }

    pub async fn health(&self) -> Result<SemanticCacheHealth, String> {
        self.invoke("health", &serde_json::json!({}))
    }

    fn invoke<T: Serialize, R: for<'de> Deserialize<'de>>(
        &self,
        command: &str,
        payload: &T,
    ) -> Result<R, String> {
        let payload = serde_json::to_vec(payload).map_err(|e| e.to_string())?;
        let venv_dir = self
            .config
            .script_path
            .parent()
            .map(|dir| dir.join(".venv"))
            .unwrap_or_else(|| PathBuf::from(".venv"));
        let python_path = site_packages_path(&venv_dir);

        let mut command_builder = if let Some(arch) = &self.config.arch {
            let mut cmd = Command::new("arch");
            cmd.arg(format!("-{}", arch))
                .arg(&self.config.python_bin)
                .arg(&self.config.script_path)
                .arg(command);
            cmd
        } else {
            let mut cmd = Command::new(&self.config.python_bin);
            cmd.arg(&self.config.script_path).arg(command);
            cmd
        };
        command_builder
            .env(
                "EPILOGOS_SEMANTIC_CACHE_REDIS_URL",
                self.config.redis_url.as_str(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_NAME",
                self.config.cache_name.as_str(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_THRESHOLD",
                self.config.similarity_threshold.to_string(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS",
                self.config
                    .ttl_seconds
                    .map(|value| value.to_string())
                    .unwrap_or_default(),
            )
            .env("VIRTUAL_ENV", &venv_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        if let Some(path) = python_path {
            command_builder.env("PYTHONPATH", path);
        }

        let mut child = command_builder
            .spawn()
            .map_err(|e| format!("semantic cache service launch failed: {}", e))?;

        child
            .stdin
            .as_mut()
            .ok_or("semantic cache service stdin unavailable")?
            .write_all(&payload)
            .map_err(|e| format!("semantic cache service stdin write failed: {}", e))?;

        let output = child
            .wait_with_output()
            .map_err(|e| format!("semantic cache service execution failed: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "semantic cache service error: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        serde_json::from_slice(&output.stdout)
            .map_err(|e| format!("semantic cache response parse failed: {}", e))
    }
}

fn default_script_path() -> PathBuf {
    let manifest_candidate = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("scripts")
        .join("redisvl_cache_service")
        .join("redisvl_cache_service.py");
    if manifest_candidate.exists() {
        return manifest_candidate;
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(root) = exe.parent().and_then(Path::parent) {
            let candidate = root
                .join("scripts")
                .join("redisvl_cache_service")
                .join("redisvl_cache_service.py");
            if candidate.exists() {
                return candidate;
            }
        }
    }

    manifest_candidate
}

fn resolve_python_bin(script_path: &Path) -> PathBuf {
    if let Ok(explicit) = std::env::var("EPILOGOS_SEMANTIC_CACHE_PYTHON") {
        return PathBuf::from(explicit);
    }

    let venv_python = script_path
        .parent()
        .map(|dir| dir.join(".venv").join("bin").join("python3"))
        .unwrap_or_else(|| PathBuf::from("python3"));
    if venv_python.exists() {
        venv_python
    } else {
        PathBuf::from("python3")
    }
}

fn site_packages_path(venv_dir: &Path) -> Option<String> {
    let lib_dir = venv_dir.join("lib");
    let mut matches: Vec<PathBuf> = std::fs::read_dir(&lib_dir)
        .ok()?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path().join("site-packages"))
        .filter(|path| path.exists())
        .collect();
    matches.sort();
    matches
        .into_iter()
        .next()
        .map(|path| path.to_string_lossy().into_owned())
}

fn default_arch_override() -> Option<String> {
    if !cfg!(target_os = "macos") {
        return None;
    }

    let arm64_capable = Command::new("sysctl")
        .args(["-in", "hw.optional.arm64"])
        .output()
        .ok()
        .filter(|output| output.status.success())
        .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
        .map(|value| value == "1")
        .unwrap_or(false);
    if arm64_capable {
        return Some("arm64".into());
    }

    let output = Command::new("uname").arg("-m").output().ok()?;
    if !output.status.success() {
        return None;
    }

    let machine = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if machine == "arm64" {
        Some("arm64".into())
    } else {
        None
    }
}
