use crate::agent::capabilities::CapabilityRegistry;
use crate::agent::SkillCmd;
use epi_logos::graph::parse_yaml_frontmatter;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillDefinition {
    pub path: String,
    pub name: String,
    pub description: String,
    pub allowed_tools: Vec<String>,
    pub user_invocable: Option<bool>,
    pub body: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillValidationReport {
    pub valid: bool,
    pub path: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub allowed_tools: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct SkillFrontmatter {
    name: String,
    description: String,
    #[serde(rename = "allowed-tools", default)]
    allowed_tools: Vec<String>,
    #[serde(rename = "user-invocable")]
    user_invocable: Option<bool>,
}

pub fn validate_path(path: &Path, registry: &CapabilityRegistry) -> SkillValidationReport {
    match parse_skill(path, registry) {
        Ok(skill) => SkillValidationReport {
            valid: true,
            path: skill.path.clone(),
            name: Some(skill.name.clone()),
            description: Some(skill.description.clone()),
            allowed_tools: skill.allowed_tools.clone(),
            errors: Vec::new(),
        },
        Err(errors) => SkillValidationReport {
            valid: false,
            path: display_path(path),
            name: None,
            description: None,
            allowed_tools: Vec::new(),
            errors,
        },
    }
}

pub fn run(cmd: &SkillCmd, json: bool) -> Result<String, String> {
    match cmd {
        SkillCmd::Validate { path } => {
            let report = validate_path(path, &CapabilityRegistry::default());
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
    }
}

pub fn discover_under(plugin_root: &Path, registry: &CapabilityRegistry) -> (Vec<SkillDefinition>, Vec<String>) {
    let skills_dir = plugin_root.join("skills");
    let mut skill_files = Vec::new();
    collect_skill_files(&skills_dir, &mut skill_files);
    skill_files.sort();

    let mut definitions = Vec::new();
    let mut errors = Vec::new();
    for skill_path in skill_files {
        match parse_skill(&skill_path, registry) {
            Ok(skill) => definitions.push(skill),
            Err(mut path_errors) => errors.append(&mut path_errors),
        }
    }

    (definitions, errors)
}

pub fn parse_skill(path: &Path, registry: &CapabilityRegistry) -> Result<SkillDefinition, Vec<String>> {
    let contents = fs::read_to_string(path)
        .map_err(|err| vec![format!("{}: unable to read skill file: {err}", path.display())])?;
    let (frontmatter, body) = parse_markdown_frontmatter(&contents, path)?;
    let metadata = serde_yaml::from_value::<SkillFrontmatter>(frontmatter).map_err(|err| {
        vec![format!(
            "{}: invalid skill frontmatter: {err}",
            display_path(path)
        )]
    })?;

    let mut errors = Vec::new();
    if metadata.name.trim().is_empty() {
        errors.push(format!("{}: skill `name` must not be empty", display_path(path)));
    }
    if metadata.description.trim().is_empty() {
        errors.push(format!(
            "{}: skill `description` must not be empty",
            display_path(path)
        ));
    }
    if body.trim().is_empty() {
        errors.push(format!("{}: skill body must not be empty", display_path(path)));
    }
    errors.extend(
        registry
            .validate_tools(&metadata.allowed_tools)
            .into_iter()
            .map(|err| format!("{}: {err}", display_path(path))),
    );

    if errors.is_empty() {
        Ok(SkillDefinition {
            path: display_path(path),
            name: metadata.name,
            description: metadata.description,
            allowed_tools: metadata.allowed_tools,
            user_invocable: metadata.user_invocable,
            body,
        })
    } else {
        Err(errors)
    }
}

pub(crate) fn parse_markdown_frontmatter(
    contents: &str,
    path: &Path,
) -> Result<(serde_yaml::Value, String), Vec<String>> {
    let normalized = contents.replace("\r\n", "\n");
    let body = extract_body(&normalized).ok_or_else(|| {
        vec![format!(
            "{}: expected YAML frontmatter delimited by ---",
            display_path(path)
        )]
    })?;
    let frontmatter = parse_yaml_frontmatter(&normalized).ok_or_else(|| {
        vec![format!(
            "{}: unable to parse YAML frontmatter",
            display_path(path)
        )]
    })?;

    Ok((frontmatter, body))
}

fn extract_body(contents: &str) -> Option<String> {
    let stripped = contents.strip_prefix("---\n")?;
    let end = stripped.find("\n---\n")?;
    Some(stripped[end + 5..].trim_start().to_owned())
}

fn collect_skill_files(root: &Path, output: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_skill_files(&path, output);
        } else if path.file_name().and_then(|name| name.to_str()) == Some("SKILL.md") {
            output.push(path);
        }
    }
}

fn display_path(path: &Path) -> String {
    path.canonicalize()
        .unwrap_or_else(|_| path.to_path_buf())
        .display()
        .to_string()
}
