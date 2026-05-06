use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

use serde_json::{json, Value};

pub fn append_line(state_root: impl AsRef<Path>, line: &str) -> Result<(), String> {
    let path = log_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|err| err.to_string())?;
    writeln!(file, "{line}").map_err(|err| err.to_string())
}

pub fn tail(state_root: impl AsRef<Path>, lines: usize) -> Result<Value, String> {
    let path = log_path(state_root);
    if !path.exists() {
        return Ok(json!({ "lines": [], "entries": [], "cursor": Value::Null }));
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    let lines = content
        .lines()
        .rev()
        .take(lines)
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .map(str::to_owned)
        .collect::<Vec<_>>();
    let entries = lines
        .iter()
        .map(|line| json!({ "raw": line }))
        .collect::<Vec<_>>();
    Ok(json!({ "lines": lines, "entries": entries, "cursor": lines.len() as u64 }))
}

fn log_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("logs").join("gateway.log")
}
