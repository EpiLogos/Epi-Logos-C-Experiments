use crate::agent::HooksCmd;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

const SUPPORTED_EVENTS: &[&str] = &[
    "ConfigChange",
    "InstructionsLoaded",
    "Notification",
    "PermissionRequest",
    "PostToolUse",
    "PostToolUseFailure",
    "PreCompact",
    "PreToolUse",
    "SessionEnd",
    "SessionStart",
    "Setup",
    "Stop",
    "SubagentStart",
    "SubagentStop",
    "TaskCompleted",
    "TeammateIdle",
    "UserPromptSubmit",
    "WorktreeCreate",
    "WorktreeRemove",
];

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HookAction {
    pub event: String,
    #[serde(rename = "type")]
    pub hook_type: String,
    pub command: Option<String>,
    pub prompt: Option<String>,
    pub agent: Option<String>,
    pub resolved_path: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HookValidationReport {
    pub valid: bool,
    pub path: String,
    pub hook_count: usize,
    pub events: Vec<HookAction>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HookExecutionResult {
    pub event: String,
    pub command: String,
    pub stdout_json: Option<Value>,
    pub stderr: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HookTestReport {
    pub valid: bool,
    pub path: String,
    pub event: String,
    pub executed: Vec<HookExecutionResult>,
    pub errors: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct HooksFile {
    #[serde(default)]
    hooks: HookEntries,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum HookEntries {
    Legacy(Vec<HookEventConfig>),
    Modern(BTreeMap<String, Vec<HookMatcherConfig>>),
}

impl Default for HookEntries {
    fn default() -> Self {
        Self::Legacy(Vec::new())
    }
}

#[derive(Debug, Deserialize)]
struct HookEventConfig {
    event: String,
    #[serde(default)]
    hooks: Vec<HookConfig>,
}

#[derive(Debug, Deserialize)]
struct HookMatcherConfig {
    #[serde(default)]
    hooks: Vec<HookConfig>,
}

#[derive(Debug, Deserialize)]
struct HookConfig {
    #[serde(rename = "type")]
    hook_type: String,
    command: Option<String>,
    prompt: Option<String>,
    agent: Option<String>,
}

pub fn validate_path(path: &Path) -> HookValidationReport {
    let hooks_path = resolve_hooks_path(path);
    match load_hooks_file(&hooks_path) {
        Ok(file) => {
            let (events, errors) = validate_hooks(&hooks_path, file);
            HookValidationReport {
                valid: errors.is_empty(),
                path: display_path(&hooks_path),
                hook_count: events.len(),
                events,
                errors,
            }
        }
        Err(errors) => HookValidationReport {
            valid: false,
            path: display_path(&hooks_path),
            hook_count: 0,
            events: Vec::new(),
            errors,
        },
    }
}

pub fn run(cmd: &HooksCmd, json: bool) -> Result<String, String> {
    match cmd {
        HooksCmd::Validate { path } => render_validation(validate_path(path), json),
        HooksCmd::Test {
            event,
            fixture,
            path,
        } => render_test(test_path(path, event, fixture), json),
    }
}

pub fn test_path(path: &Path, event: &str, fixture_path: &Path) -> HookTestReport {
    let validation = validate_path(path);
    if !validation.valid {
        return HookTestReport {
            valid: false,
            path: validation.path,
            event: event.to_owned(),
            executed: Vec::new(),
            errors: validation.errors,
        };
    }

    let fixture = match fs::read(fixture_path) {
        Ok(contents) => contents,
        Err(err) => {
            return HookTestReport {
                valid: false,
                path: validation.path,
                event: event.to_owned(),
                executed: Vec::new(),
                errors: vec![format!(
                    "{}: unable to read fixture: {err}",
                    fixture_path.display()
                )],
            }
        }
    };

    let mut executed = Vec::new();
    let mut errors = Vec::new();
    for hook in validation.events.iter().filter(|hook| hook.event == event) {
        if hook.hook_type != "command" {
            continue;
        }

        let command_path = match &hook.resolved_path {
            Some(path) => PathBuf::from(path),
            None => continue,
        };

        match run_command_hook(&command_path, &fixture) {
            Ok(result) => executed.push(HookExecutionResult {
                event: hook.event.clone(),
                command: command_path.display().to_string(),
                stdout_json: result.0,
                stderr: result.1,
            }),
            Err(err) => errors.push(err),
        }
    }

    HookTestReport {
        valid: errors.is_empty(),
        path: validation.path,
        event: event.to_owned(),
        executed,
        errors,
    }
}

#[allow(dead_code)] // public API, not yet called from main binary
pub fn load_inventory(path: &Path) -> Result<Vec<HookAction>, Vec<String>> {
    let hooks_path = resolve_hooks_path(path);
    let file = load_hooks_file(&hooks_path)?;
    let (events, errors) = validate_hooks(&hooks_path, file);
    if errors.is_empty() {
        Ok(events)
    } else {
        Err(errors)
    }
}

fn load_hooks_file(path: &Path) -> Result<HooksFile, Vec<String>> {
    let contents = fs::read_to_string(path).map_err(|err| {
        vec![format!(
            "{}: unable to read hooks file: {err}",
            display_path(path)
        )]
    })?;
    serde_json::from_str::<HooksFile>(&contents)
        .map_err(|err| vec![format!("{}: invalid hooks JSON: {err}", display_path(path))])
}

fn validate_hooks(path: &Path, file: HooksFile) -> (Vec<HookAction>, Vec<String>) {
    let mut events = Vec::new();
    let mut errors = Vec::new();
    let hooks_root = path.parent().unwrap_or(path);

    for event in file.hooks.into_event_configs() {
        if !SUPPORTED_EVENTS.contains(&event.event.as_str()) {
            errors.push(format!(
                "{}: unsupported hook event `{}`",
                display_path(path),
                event.event
            ));
        }

        for hook in event.hooks {
            let resolved_path = if hook.hook_type == "command" {
                match hook.command.as_deref() {
                    Some(command) => {
                        if let Some(resolved) = resolve_command_path(hooks_root, command) {
                            if !resolved.exists() {
                                errors.push(format!(
                                    "{}: missing hook command `{}`",
                                    display_path(path),
                                    resolved.display()
                                ));
                            }
                            Some(display_path(&resolved))
                        } else {
                            None
                        }
                    }
                    None => {
                        errors.push(format!(
                            "{}: hook event `{}` is missing `command`",
                            display_path(path),
                            event.event
                        ));
                        None
                    }
                }
            } else {
                None
            };

            if hook.hook_type == "prompt" && hook.prompt.as_deref().unwrap_or("").trim().is_empty()
            {
                errors.push(format!(
                    "{}: hook event `{}` is missing `prompt`",
                    display_path(path),
                    event.event
                ));
            }
            if hook.hook_type == "agent" && hook.agent.as_deref().unwrap_or("").trim().is_empty() {
                errors.push(format!(
                    "{}: hook event `{}` is missing `agent`",
                    display_path(path),
                    event.event
                ));
            }
            if !["agent", "command", "prompt"].contains(&hook.hook_type.as_str()) {
                errors.push(format!(
                    "{}: unsupported hook type `{}`",
                    display_path(path),
                    hook.hook_type
                ));
            }

            events.push(HookAction {
                event: event.event.clone(),
                hook_type: hook.hook_type,
                command: hook.command,
                prompt: hook.prompt,
                agent: hook.agent,
                resolved_path,
            });
        }
    }

    (events, errors)
}

impl HookEntries {
    fn into_event_configs(self) -> Vec<HookEventConfig> {
        match self {
            HookEntries::Legacy(events) => events,
            HookEntries::Modern(events) => events
                .into_iter()
                .flat_map(|(event, groups)| {
                    groups.into_iter().map(move |group| HookEventConfig {
                        event: event.clone(),
                        hooks: group.hooks,
                    })
                })
                .collect(),
        }
    }
}

fn resolve_command_path(hooks_root: &Path, command: &str) -> Option<PathBuf> {
    let trimmed = command.trim();
    if !is_direct_path_command(trimmed) {
        return None;
    }

    let path = Path::new(trimmed);
    Some(if path.is_absolute() {
        path.to_path_buf()
    } else {
        hooks_root.join(path)
    })
}

fn is_direct_path_command(command: &str) -> bool {
    if command.is_empty() || command.contains(char::is_whitespace) {
        return false;
    }

    !command.contains(|ch: char| matches!(ch, '$' | '"' | '\'' | '`' | ';' | '|' | '&' | '(' | ')'))
}

fn run_command_hook(
    command_path: &Path,
    fixture: &[u8],
) -> Result<(Option<Value>, String), String> {
    let mut child = Command::new(command_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|err| {
            format!(
                "{}: failed to spawn hook command: {err}",
                command_path.display()
            )
        })?;

    if let Some(stdin) = child.stdin.as_mut() {
        stdin.write_all(fixture).map_err(|err| {
            format!(
                "{}: failed to write fixture to hook stdin: {err}",
                command_path.display()
            )
        })?;
    }

    let output = child.wait_with_output().map_err(|err| {
        format!(
            "{}: failed to wait for hook command: {err}",
            command_path.display()
        )
    })?;

    if !output.status.success() {
        return Err(format!(
            "{}: hook command exited with status {}",
            command_path.display(),
            output.status
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout_json = if stdout.is_empty() {
        None
    } else {
        Some(serde_json::from_str::<Value>(&stdout).map_err(|err| {
            format!(
                "{}: hook stdout was not valid JSON: {err}",
                command_path.display()
            )
        })?)
    };

    Ok((stdout_json, stderr))
}

fn resolve_hooks_path(path: &Path) -> PathBuf {
    if path.is_dir() {
        path.join("hooks/hooks.json")
    } else {
        path.to_path_buf()
    }
}

fn display_path(path: &Path) -> String {
    path.canonicalize()
        .unwrap_or_else(|_| path.to_path_buf())
        .display()
        .to_string()
}

fn render_validation(report: HookValidationReport, json: bool) -> Result<String, String> {
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

fn render_test(report: HookTestReport, json: bool) -> Result<String, String> {
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
