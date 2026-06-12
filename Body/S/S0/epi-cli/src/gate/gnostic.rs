//! S0 gate bridge for the production S5 `epi-gnostic` stack.
//!
//! The gateway surface is intentionally thin: parameters are validated at the
//! S0 membrane, then execution is delegated to the configured `epi-gnostic`
//! command (`EPI_GNOSTIC_PYTHON`, default `epi-gnostic`). JSON emitted by the
//! production CLI is preserved for Theia callers.

use std::process::Command;

use serde_json::{json, Value};

use crate::techne::gnosis::config::GnosisConfig;

pub fn status() -> Result<Value, String> {
    run_gnostic(["status".to_owned()])
}

pub fn models() -> Result<Value, String> {
    run_gnostic(["models".to_owned()])
}

pub fn ingest(params: &Value) -> Result<Value, String> {
    if let Some(text) = optional_str_alias(params, &["text", "content", "body"]) {
        let mut args = vec!["ingest-text".to_owned(), text];
        if let Some(source_id) = optional_str_alias(params, &["sourceId", "source_id", "id"]) {
            args.push("--source-id".to_owned());
            args.push(source_id);
        }
        return run_gnostic(args);
    }

    let source = required_str_alias(params, &["source", "path", "filePath", "file_path"])?;
    let mut args = vec!["ingest".to_owned(), source];
    if let Some(coordinate) = optional_str_alias(params, &["coordinate", "bimbaCoordinate"]) {
        args.push("--coordinate".to_owned());
        args.push(coordinate);
    }
    if let Some(family) = optional_str_alias(params, &["family", "coordinateFamily"]) {
        args.push("--family".to_owned());
        args.push(family);
    }
    run_gnostic(args)
}

pub fn query(params: &Value) -> Result<Value, String> {
    let question = required_str_alias(params, &["query", "question"])?;
    let mut args = vec!["query".to_owned(), question];
    if let Some(mode) = optional_str(params, "mode") {
        args.push("--mode".to_owned());
        args.push(mode);
    }
    run_gnostic(args)
}

pub fn notebook(params: &Value) -> Result<Value, String> {
    let action =
        optional_str_alias(params, &["action", "operation"]).unwrap_or_else(|| "list".to_owned());
    let mut args = vec!["notebook".to_owned(), action.clone()];
    match action.as_str() {
        "create" | "delete" => args.push(required_str_alias(params, &["name", "notebook"])?),
        "list" => {}
        other => {
            return Err(format!(
                "unsupported s5'.gnostic.notebook action {other:?}; expected list, create, or delete"
            ));
        }
    }
    run_gnostic(args)
}

fn run_gnostic<I>(args: I) -> Result<Value, String>
where
    I: IntoIterator<Item = String>,
{
    let config = GnosisConfig::from_env();
    let output = Command::new(&config.python_bin)
        .args(args)
        .output()
        .map_err(|err| format!("failed to run {}: {err}", config.python_bin))?;

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
    if !output.status.success() {
        let diagnostic = if stderr.is_empty() { stdout } else { stderr };
        return Err(format!("epi-gnostic failed: {diagnostic}"));
    }

    if stdout.is_empty() {
        return Ok(json!({ "status": "ok" }));
    }
    serde_json::from_str(&stdout)
        .map_err(|err| format!("epi-gnostic returned non-JSON output: {err}; stdout={stdout}"))
}

fn required_str_alias(params: &Value, keys: &[&str]) -> Result<String, String> {
    optional_str_alias(params, keys).ok_or_else(|| {
        format!(
            "missing required string parameter; expected one of {}",
            keys.join(", ")
        )
    })
}

fn optional_str_alias(params: &Value, keys: &[&str]) -> Option<String> {
    keys.iter().find_map(|key| optional_str(params, key))
}

fn optional_str(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
}
