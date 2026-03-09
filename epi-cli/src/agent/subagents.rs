use crate::agent::capabilities::CapabilityRegistry;
use crate::agent::skills::parse_markdown_frontmatter;
use crate::agent::SubagentCmd;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubagentDefinition {
    pub path: String,
    pub name: String,
    pub description: String,
    pub tools: Vec<String>,
    pub skills: Vec<String>,
    pub model: Option<String>,
    pub permission_mode: Option<String>,
    pub body: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubagentValidationReport {
    pub valid: bool,
    pub path: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub tools: Vec<String>,
    pub skills: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SubagentFrontmatter {
    name: String,
    description: String,
    #[serde(default)]
    tools: Vec<String>,
    #[serde(default)]
    disallowed_tools: Vec<String>,
    model: Option<String>,
    permission_mode: Option<String>,
    #[serde(default)]
    skills: Vec<String>,
}

pub fn validate_path(path: &Path, registry: &CapabilityRegistry) -> SubagentValidationReport {
    match parse_subagent(path, registry) {
        Ok(subagent) => SubagentValidationReport {
            valid: true,
            path: subagent.path.clone(),
            name: Some(subagent.name.clone()),
            description: Some(subagent.description.clone()),
            tools: subagent.tools.clone(),
            skills: subagent.skills.clone(),
            errors: Vec::new(),
        },
        Err(errors) => SubagentValidationReport {
            valid: false,
            path: display_path(path),
            name: None,
            description: None,
            tools: Vec::new(),
            skills: Vec::new(),
            errors,
        },
    }
}

pub fn run(cmd: &SubagentCmd, json: bool) -> Result<String, String> {
    match cmd {
        SubagentCmd::Validate { path } => {
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

pub fn discover_under(
    plugin_root: &Path,
    registry: &CapabilityRegistry,
) -> (Vec<SubagentDefinition>, Vec<String>) {
    let agents_dir = plugin_root.join("agents");
    let mut files = Vec::new();
    collect_markdown_files(&agents_dir, &mut files);
    files.sort();

    let mut definitions = Vec::new();
    let mut errors = Vec::new();
    for path in files {
        match parse_subagent(&path, registry) {
            Ok(subagent) => definitions.push(subagent),
            Err(mut path_errors) => errors.append(&mut path_errors),
        }
    }

    (definitions, errors)
}

pub fn parse_subagent(
    path: &Path,
    registry: &CapabilityRegistry,
) -> Result<SubagentDefinition, Vec<String>> {
    let contents = fs::read_to_string(path).map_err(|err| {
        vec![format!(
            "{}: unable to read subagent definition: {err}",
            display_path(path)
        )]
    })?;
    let (frontmatter, body) = parse_markdown_frontmatter(&contents, path)?;
    let metadata = serde_yaml::from_value::<SubagentFrontmatter>(frontmatter).map_err(|err| {
        vec![format!(
            "{}: invalid subagent frontmatter: {err}",
            display_path(path)
        )]
    })?;

    let mut errors = Vec::new();
    if metadata.name.trim().is_empty() {
        errors.push(format!(
            "{}: subagent `name` must not be empty",
            display_path(path)
        ));
    }
    if metadata.description.trim().is_empty() {
        errors.push(format!(
            "{}: subagent `description` must not be empty",
            display_path(path)
        ));
    }
    if body.trim().is_empty() {
        errors.push(format!("{}: subagent body must not be empty", display_path(path)));
    }
    errors.extend(
        registry
            .validate_tools(&metadata.tools)
            .into_iter()
            .map(|err| format!("{}: {err}", display_path(path))),
    );
    errors.extend(
        registry
            .validate_tools(&metadata.disallowed_tools)
            .into_iter()
            .map(|err| format!("{}: {err}", display_path(path))),
    );

    if errors.is_empty() {
        Ok(SubagentDefinition {
            path: display_path(path),
            name: metadata.name,
            description: metadata.description,
            tools: metadata.tools,
            skills: metadata.skills,
            model: metadata.model,
            permission_mode: metadata.permission_mode,
            body,
        })
    } else {
        Err(errors)
    }
}

fn collect_markdown_files(root: &Path, output: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(root) {
        Ok(entries) => entries,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_markdown_files(&path, output);
        } else if path.extension().and_then(|ext| ext.to_str()) == Some("md") {
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
