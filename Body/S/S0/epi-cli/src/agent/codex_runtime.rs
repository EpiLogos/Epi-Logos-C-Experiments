//! Codex runtime control-plane surface.
//!
//! Manages the repo-local oh-my-codex (OMX) installation under `.codex/` and `.omx/`.
//! The vendored OMX source lives at `vendors/oh-my-codex/`; this module never
//! fetches from npm or the network.

use crate::agent::AgentLayout;
use serde::Serialize;
use std::fs;

// ── Public report types ───────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodexInstallReport {
    pub status: &'static str,
    pub omx_vendor_path: String,
    pub codex_root: String,
    pub omx_dir: String,
    pub codex_skills_dir: String,
    pub codex_agents_dir: String,
    pub scope_file: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodexDoctorReport {
    pub omx_vendor_present: bool,
    pub codex_skills_present: bool,
    pub codex_agents_present: bool,
    pub omx_scope_present: bool,
    pub codex_root: String,
    pub omx_dir: String,
    pub issues: Vec<String>,
}

// ── install ───────────────────────────────────────────────────────────────────

/// `epi agent codex install` — scaffold `.codex/` and `.omx/` from the vendored OMX source.
pub fn run_install(json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(None)?;
    let repo_root = &layout.repo_root;

    let omx_vendor = repo_root.join("vendors/oh-my-codex");
    let omx_js = omx_vendor.join("dist/cli/omx.js");

    if !omx_js.exists() {
        let report = CodexInstallReport {
            status: "missing-prerequisite",
            omx_vendor_path: omx_vendor.display().to_string(),
            codex_root: String::new(),
            omx_dir: String::new(),
            codex_skills_dir: String::new(),
            codex_agents_dir: String::new(),
            scope_file: String::new(),
            error: Some(format!(
                "vendored OMX not found at {}: run vendor setup first",
                omx_js.display()
            )),
        };
        let out = if json {
            serde_json::to_string_pretty(&report).map_err(|e| e.to_string())?
        } else {
            format!(
                "ERROR: vendored OMX not found at {}\n  Run: bash tools/omx/setup-project.sh",
                omx_js.display()
            )
        };
        return Ok(out);
    }

    let codex_root = repo_root.join(".codex");
    let omx_dir = repo_root.join(".omx");

    let codex_skills = codex_root.join("skills");
    let codex_agents = codex_root.join("agents");

    for dir in [&codex_skills, &codex_agents, &omx_dir] {
        fs::create_dir_all(dir).map_err(|e| format!("failed to create {}: {e}", dir.display()))?;
    }

    // Write setup-scope.json (idempotent)
    let scope_file = omx_dir.join("setup-scope.json");
    let scope = serde_json::json!({
        "schema": "1",
        "omx_vendor_path": omx_vendor.display().to_string(),
        "omx_js": omx_js.display().to_string(),
        "target_dir": repo_root.display().to_string(),
        "installed_at": chrono_now_utc(),
    });
    fs::write(
        &scope_file,
        serde_json::to_string_pretty(&scope).map_err(|e| e.to_string())?,
    )
    .map_err(|e| format!("failed to write {}: {e}", scope_file.display()))?;

    let report = CodexInstallReport {
        status: "ready",
        omx_vendor_path: omx_vendor.display().to_string(),
        codex_root: codex_root.display().to_string(),
        omx_dir: omx_dir.display().to_string(),
        codex_skills_dir: codex_skills.display().to_string(),
        codex_agents_dir: codex_agents.display().to_string(),
        scope_file: scope_file.display().to_string(),
        error: None,
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Codex runtime ready.\n  vendor: {}\n  codex:  {}\n  scope:  {}",
            omx_vendor.display(),
            codex_root.display(),
            scope_file.display()
        ))
    }
}

// ── doctor ────────────────────────────────────────────────────────────────────

/// `epi agent codex doctor` — verify repo-local Codex runtime state.
pub fn run_doctor(json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(None)?;
    let repo_root = &layout.repo_root;

    let omx_vendor = repo_root.join("vendors/oh-my-codex/dist/cli/omx.js");
    let codex_skills = repo_root.join(".codex/skills");
    let codex_agents = repo_root.join(".codex/agents");
    let omx_scope = repo_root.join(".omx/setup-scope.json");

    let omx_vendor_present = omx_vendor.exists();
    let codex_skills_present = codex_skills.exists();
    let codex_agents_present = codex_agents.exists();
    let omx_scope_present = omx_scope.exists();

    let mut issues = Vec::new();
    if !omx_vendor_present {
        issues.push(format!(
            "vendors/oh-my-codex/dist/cli/omx.js missing — vendor OMX first"
        ));
    }
    if !codex_skills_present {
        issues.push(".codex/skills missing — run: epi agent codex install".to_string());
    }
    if !codex_agents_present {
        issues.push(".codex/agents missing — run: epi agent codex install".to_string());
    }
    if !omx_scope_present {
        issues.push(".omx/setup-scope.json missing — run: epi agent codex install".to_string());
    }

    let report = CodexDoctorReport {
        omx_vendor_present,
        codex_skills_present,
        codex_agents_present,
        omx_scope_present,
        codex_root: repo_root.join(".codex").display().to_string(),
        omx_dir: repo_root.join(".omx").display().to_string(),
        issues: issues.clone(),
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
    } else if issues.is_empty() {
        Ok("Codex runtime: OK".to_string())
    } else {
        Ok(format!("Codex runtime issues:\n{}", issues.join("\n")))
    }
}

// ── helpers ───────────────────────────────────────────────────────────────────

fn chrono_now_utc() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    // Minimal RFC3339-ish timestamp without chrono dependency
    let s = secs % 86400;
    let h = s / 3600;
    let m = (s % 3600) / 60;
    let sec = s % 60;
    let days = secs / 86400;
    // Approximate date from epoch (good enough for provenance log)
    format!("epoch+{}d {:02}:{:02}:{:02}Z", days, h, m, sec)
}
