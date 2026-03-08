//! Hook system: parse hooks.json, execute hook scripts via stdin/stdout JSON.

use std::fs;
use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};

use crate::agent::plugin_manifest::{HookEntry, HooksManifest};

/// Result of executing a hook script.
#[derive(Debug, Clone)]
pub struct HookResult {
    pub event: String,
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
}

/// Load hooks from a plugin root's `.claude-plugin/hooks.json` file.
pub fn load_hooks(plugin_root: &Path) -> Result<HooksManifest, String> {
    let hooks_path = plugin_root
        .join(".claude-plugin")
        .join("hooks.json");

    if !hooks_path.exists() {
        return Ok(HooksManifest { hooks: Vec::new() });
    }

    let content = fs::read_to_string(&hooks_path)
        .map_err(|e| format!("failed to read hooks.json: {e}"))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("invalid hooks.json: {e}"))
}

/// Execute a hook script, passing `input_json` on stdin and reading stdout.
///
/// The script path is resolved relative to `working_dir`.
pub fn execute_hook(
    hook: &HookEntry,
    input_json: &str,
    working_dir: &Path,
) -> Result<HookResult, String> {
    let script_path = working_dir.join(&hook.script);

    if !script_path.exists() {
        return Err(format!(
            "hook script not found: {}",
            script_path.display()
        ));
    }

    let mut child = Command::new("sh")
        .arg(&script_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .current_dir(working_dir)
        .spawn()
        .map_err(|e| format!("failed to spawn hook script: {e}"))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(input_json.as_bytes())
            .map_err(|e| format!("failed to write to hook stdin: {e}"))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("failed to wait for hook: {e}"))?;

    Ok(HookResult {
        event: hook.event.clone(),
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
    })
}
