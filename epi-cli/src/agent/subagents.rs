//! Subagent discovery and validation from plugin agent directories.

use std::fs;
use std::path::Path;

use crate::agent::plugin_manifest::AgentEntry;

/// Metadata extracted from an agent's AGENT.md frontmatter.
#[derive(Debug, Clone)]
pub struct AgentMeta {
    pub name: String,
    pub cluster: String,
    pub description: String,
}

/// Discover agents under a plugin root by walking the `agents/` directory.
/// Each subdirectory should contain an AGENT.md with frontmatter.
pub fn discover_agents(plugin_root: &Path) -> Vec<AgentEntry> {
    let agents_dir = plugin_root.join("agents");
    if !agents_dir.is_dir() {
        return Vec::new();
    }

    let mut results = Vec::new();
    if let Ok(entries) = fs::read_dir(&agents_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let agent_md = path.join("AGENT.md");
                if agent_md.exists() {
                    if let Some(meta) = parse_agent_frontmatter(&agent_md) {
                        results.push(AgentEntry {
                            name: meta.name,
                            path: path.display().to_string(),
                            cluster: meta.cluster,
                        });
                    }
                }
            }
        }
    }

    results
}

/// Parse YAML frontmatter from an AGENT.md file.
///
/// Expected format:
/// ```markdown
/// ---
/// name: agent-name
/// cluster: cluster-name
/// description: A brief description
/// ---
/// # Agent body...
/// ```
pub fn parse_agent_frontmatter(path: &Path) -> Option<AgentMeta> {
    let content = fs::read_to_string(path).ok()?;
    let trimmed = content.trim();

    if !trimmed.starts_with("---") {
        return None;
    }

    let after_first = &trimmed[3..];
    let end_idx = after_first.find("---")?;
    let frontmatter = &after_first[..end_idx];

    let yaml: serde_yaml::Value = serde_yaml::from_str(frontmatter).ok()?;

    let name = yaml.get("name")?.as_str()?.to_owned();
    let cluster = yaml
        .get("cluster")
        .and_then(|v| v.as_str())
        .unwrap_or("default")
        .to_owned();
    let description = yaml
        .get("description")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_owned();

    Some(AgentMeta {
        name,
        cluster,
        description,
    })
}
