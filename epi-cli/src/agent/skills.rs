//! Skill discovery: parse SKILL.md frontmatter, enumerate skills from plugin roots.

use std::fs;
use std::path::Path;

use crate::agent::plugin_manifest::{SkillCategory, SkillEntry};

/// Metadata extracted from a SKILL.md frontmatter block.
#[derive(Debug, Clone)]
pub struct SkillMeta {
    pub name: String,
    pub category: SkillCategory,
    pub description: String,
}

/// Discover skills under a plugin root by walking `skills/atomic/` and
/// `skills/orchestration/` subdirectories for SKILL.md files.
pub fn discover_skills(plugin_root: &Path) -> Vec<SkillEntry> {
    let mut results = Vec::new();

    for (subdir, category) in [
        ("atomic", SkillCategory::Atomic),
        ("orchestration", SkillCategory::Orchestration),
        ("constitutional", SkillCategory::Constitutional),
    ] {
        let dir = plugin_root.join("skills").join(subdir);
        if !dir.is_dir() {
            continue;
        }
        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let skill_md = path.join("SKILL.md");
                    if skill_md.exists() {
                        if let Some(meta) = parse_skill_frontmatter(&skill_md) {
                            results.push(SkillEntry {
                                name: meta.name,
                                path: path.display().to_string(),
                                category: category.clone(),
                            });
                        }
                    }
                }
            }
        }
    }

    results
}

/// Parse YAML frontmatter from a SKILL.md file.
///
/// Expected format:
/// ```markdown
/// ---
/// name: skill-name
/// category: atomic
/// description: A brief description
/// ---
/// # Skill body...
/// ```
pub fn parse_skill_frontmatter(path: &Path) -> Option<SkillMeta> {
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
    let description = yaml
        .get("description")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_owned();

    let category = match yaml.get("category").and_then(|v| v.as_str()) {
        Some("orchestration") => SkillCategory::Orchestration,
        Some("constitutional") => SkillCategory::Constitutional,
        _ => SkillCategory::Atomic,
    };

    Some(SkillMeta {
        name,
        category,
        description,
    })
}
