use serde::{Deserialize, Serialize};

/// A validated plugin manifest parsed from `.claude-plugin/plugin.json`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub name: String,
    pub version: String,
    pub description: String,
    #[serde(default)]
    pub skills: Vec<SkillEntry>,
    #[serde(default)]
    pub agents: Vec<AgentEntry>,
    #[serde(default)]
    pub hooks: Option<HooksManifest>,
    #[serde(default)]
    pub eval_suites: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillEntry {
    pub name: String,
    pub path: String,
    pub category: SkillCategory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SkillCategory {
    Atomic,
    Orchestration,
    Constitutional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentEntry {
    pub name: String,
    pub path: String,
    pub cluster: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HooksManifest {
    pub hooks: Vec<HookEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookEntry {
    pub event: String,
    pub script: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalSuite {
    pub name: String,
    pub path: String,
    pub cases: Vec<EvalCase>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvalCase {
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub fixture: Option<String>,
    pub expected: String,
}

/// Metadata about an installed plugin in the cache.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledPlugin {
    pub name: String,
    pub version: String,
    pub install_path: String,
}
