//! Plugin system for discovering, validating, installing, and caching Claude-compatible plugins.
//!
//! A plugin root is a directory with `.claude-plugin/plugin.json` containing:
//! - name, version, description
//! - Optional: skills/, agents/, hooks/, evals/, scripts/

use std::fs;
use std::path::{Path, PathBuf};

use crate::agent::plugin_manifest::{EvalCase, EvalSuite, InstalledPlugin, PluginManifest};

const PLUGIN_DIR_NAME: &str = ".claude-plugin";
const MANIFEST_FILE: &str = "plugin.json";

/// Validate a plugin root directory and return its parsed manifest.
pub fn validate_plugin_root(path: &Path) -> Result<PluginManifest, String> {
    let manifest_path = path.join(PLUGIN_DIR_NAME).join(MANIFEST_FILE);
    if !manifest_path.exists() {
        return Err(format!(
            "no plugin manifest at {}",
            manifest_path.display()
        ));
    }

    let content = fs::read_to_string(&manifest_path)
        .map_err(|e| format!("failed to read {}: {e}", manifest_path.display()))?;

    let manifest: PluginManifest = serde_json::from_str(&content)
        .map_err(|e| format!("invalid plugin manifest: {e}"))?;

    if manifest.name.is_empty() {
        return Err("plugin name must not be empty".to_owned());
    }
    if manifest.version.is_empty() {
        return Err("plugin version must not be empty".to_owned());
    }

    Ok(manifest)
}

/// Discover plugins under a `plugins/` directory in a repo root.
/// Each subdirectory of `plugins/` is checked for a `.claude-plugin/plugin.json`.
pub fn discover_plugins(repo_root: &Path) -> Vec<PluginManifest> {
    let plugins_dir = repo_root.join("plugins");
    if !plugins_dir.is_dir() {
        return Vec::new();
    }

    let mut results = Vec::new();
    if let Ok(entries) = fs::read_dir(&plugins_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Ok(manifest) = validate_plugin_root(&path) {
                    results.push(manifest);
                }
            }
        }
    }
    results
}

/// Install a plugin from `source` directory into the cache at `cache_dir`.
/// Copies the entire plugin tree to `<cache_dir>/<name>/<version>/`.
pub fn install_plugin(source: &Path, cache_dir: &Path) -> Result<InstalledPlugin, String> {
    let manifest = validate_plugin_root(source)?;
    let dest = cache_dir
        .join(&manifest.name)
        .join(&manifest.version);

    if dest.exists() {
        fs::remove_dir_all(&dest)
            .map_err(|e| format!("failed to remove existing install: {e}"))?;
    }

    copy_dir_recursive(source, &dest)?;

    Ok(InstalledPlugin {
        name: manifest.name,
        version: manifest.version,
        install_path: dest.display().to_string(),
    })
}

/// List all installed plugins under a cache directory.
/// Expected layout: `<cache_dir>/<name>/<version>/.claude-plugin/plugin.json`
pub fn list_installed(cache_dir: &Path) -> Vec<InstalledPlugin> {
    let mut results = Vec::new();
    if !cache_dir.is_dir() {
        return results;
    }

    if let Ok(names) = fs::read_dir(cache_dir) {
        for name_entry in names.flatten() {
            let name_path = name_entry.path();
            if !name_path.is_dir() {
                continue;
            }
            if let Ok(versions) = fs::read_dir(&name_path) {
                for ver_entry in versions.flatten() {
                    let ver_path = ver_entry.path();
                    if ver_path.is_dir() {
                        if let Ok(manifest) = validate_plugin_root(&ver_path) {
                            results.push(InstalledPlugin {
                                name: manifest.name,
                                version: manifest.version,
                                install_path: ver_path.display().to_string(),
                            });
                        }
                    }
                }
            }
        }
    }
    results
}

/// Uninstall a plugin by name from the cache directory.
/// Removes `<cache_dir>/<name>/` entirely.
pub fn uninstall_plugin(name: &str, cache_dir: &Path) -> Result<(), String> {
    let plugin_dir = cache_dir.join(name);
    if !plugin_dir.exists() {
        return Err(format!("plugin '{}' is not installed", name));
    }
    fs::remove_dir_all(&plugin_dir)
        .map_err(|e| format!("failed to remove plugin: {e}"))?;
    Ok(())
}

/// Discover eval suite YAML files under a plugin root's `evals/suites/` directory.
pub fn discover_eval_suites(plugin_root: &Path) -> Vec<EvalSuite> {
    let suites_dir = plugin_root.join("evals").join("suites");
    if !suites_dir.is_dir() {
        return Vec::new();
    }

    let mut results = Vec::new();
    if let Ok(entries) = fs::read_dir(&suites_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("yaml")
                || path.extension().and_then(|e| e.to_str()) == Some("yml")
            {
                if let Ok(suite) = parse_eval_suite(&path) {
                    results.push(suite);
                }
            }
        }
    }
    results
}

fn parse_eval_suite(path: &Path) -> Result<EvalSuite, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("failed to read eval suite: {e}"))?;

    // Parse YAML eval suite format:
    // name: suite-name
    // cases:
    //   - name: case1
    //     description: ...
    //     expected: ...
    let raw: serde_yaml::Value = serde_yaml::from_str(&content)
        .map_err(|e| format!("invalid eval suite YAML: {e}"))?;

    let name = raw
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("unnamed")
        .to_owned();

    let mut cases = Vec::new();
    if let Some(cases_val) = raw.get("cases").and_then(|v| v.as_sequence()) {
        for case_val in cases_val {
            let case_name = case_val
                .get("name")
                .and_then(|v| v.as_str())
                .unwrap_or("unnamed")
                .to_owned();
            let description = case_val
                .get("description")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_owned();
            let fixture = case_val
                .get("fixture")
                .and_then(|v| v.as_str())
                .map(str::to_owned);
            let expected = case_val
                .get("expected")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_owned();

            cases.push(EvalCase {
                name: case_name,
                description,
                fixture,
                expected,
            });
        }
    }

    Ok(EvalSuite {
        name,
        path: path.display().to_string(),
        cases,
    })
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst)
        .map_err(|e| format!("failed to create {}: {e}", dst.display()))?;

    for entry in fs::read_dir(src)
        .map_err(|e| format!("failed to read {}: {e}", src.display()))?
    {
        let entry = entry.map_err(|e| format!("dir entry error: {e}"))?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)
                .map_err(|e| format!("failed to copy {}: {e}", src_path.display()))?;
        }
    }
    Ok(())
}

/// CLI dispatch for the `epi agent plugin` subcommand.
pub fn dispatch_plugin(cmd: &super::PluginCmd, json: bool) -> Result<String, String> {
    match cmd {
        super::PluginCmd::Validate { path } => {
            let p = PathBuf::from(path);
            let manifest = validate_plugin_root(&p)?;
            if json {
                serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())
            } else {
                Ok(format!(
                    "valid plugin: {} v{}\n  {}\n  skills: {}\n  agents: {}\n  eval_suites: {}",
                    manifest.name,
                    manifest.version,
                    manifest.description,
                    manifest.skills.len(),
                    manifest.agents.len(),
                    manifest.eval_suites.len(),
                ))
            }
        }
        super::PluginCmd::Install { source } => {
            let src = PathBuf::from(source);
            let cache = default_plugin_cache()?;
            let installed = install_plugin(&src, &cache)?;
            if json {
                serde_json::to_string_pretty(&installed).map_err(|e| e.to_string())
            } else {
                Ok(format!(
                    "installed {} v{} to {}",
                    installed.name, installed.version, installed.install_path
                ))
            }
        }
        super::PluginCmd::List => {
            let cache = default_plugin_cache()?;
            let installed = list_installed(&cache);
            if json {
                serde_json::to_string_pretty(&installed).map_err(|e| e.to_string())
            } else if installed.is_empty() {
                Ok("no plugins installed".to_owned())
            } else {
                let lines: Vec<String> = installed
                    .iter()
                    .map(|p| format!("  {} v{} ({})", p.name, p.version, p.install_path))
                    .collect();
                Ok(format!("installed plugins:\n{}", lines.join("\n")))
            }
        }
        super::PluginCmd::Uninstall { name } => {
            let cache = default_plugin_cache()?;
            uninstall_plugin(name, &cache)?;
            if json {
                Ok(format!("{{\"uninstalled\": \"{name}\"}}"))
            } else {
                Ok(format!("uninstalled plugin: {name}"))
            }
        }
    }
}

/// CLI dispatch for the `epi agent skills` subcommand.
pub fn dispatch_skills(cmd: &super::SkillsCmd, json: bool) -> Result<String, String> {
    match cmd {
        super::SkillsCmd::List { plugin } => {
            let p = PathBuf::from(plugin);
            let skills = super::skills::discover_skills(&p);
            if json {
                serde_json::to_string_pretty(&skills).map_err(|e| e.to_string())
            } else if skills.is_empty() {
                Ok("no skills found".to_owned())
            } else {
                let lines: Vec<String> = skills
                    .iter()
                    .map(|s| format!("  {} ({:?}) — {}", s.name, s.category, s.path))
                    .collect();
                Ok(format!("skills:\n{}", lines.join("\n")))
            }
        }
        super::SkillsCmd::Eval { suite } => {
            let p = PathBuf::from(suite);
            let parent = p.parent().and_then(|p| p.parent()).unwrap_or(&p);
            let suites = discover_eval_suites(parent);
            if json {
                serde_json::to_string_pretty(&suites).map_err(|e| e.to_string())
            } else if suites.is_empty() {
                Ok("no eval suites found".to_owned())
            } else {
                let lines: Vec<String> = suites
                    .iter()
                    .map(|s| format!("  {} ({} cases)", s.name, s.cases.len()))
                    .collect();
                Ok(format!("eval suites:\n{}", lines.join("\n")))
            }
        }
    }
}

fn default_plugin_cache() -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|_| "HOME is not set".to_owned())?;
    Ok(PathBuf::from(home).join(".epi").join("plugins"))
}
