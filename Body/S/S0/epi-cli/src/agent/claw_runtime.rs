//! Claw runtime control-plane surface — experimental native substrate lane.
//!
//! The vendored claw runtime lives at `vendors/claw-code-parity/`.
//! This module is additive: it never modifies PI configuration or tracked files.
//! The PI default path (`epi agent doctor`) remains intact and unaffected.

use crate::agent::AgentLayout;
use serde::Serialize;
use std::fs;

// ── Public report types ───────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClawDoctorReport {
    pub claw_vendor_present: bool,
    pub parity_doc_present: bool,
    pub vendor_root: String,
    pub status: &'static str,
    pub issues: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClawVerifyReport {
    pub status: &'static str,
    pub vendor_root: String,
    pub parity_doc_present: bool,
    pub parity_status: String,
}

// ── doctor ────────────────────────────────────────────────────────────────────

/// `epi agent claw doctor` — report health of the vendored claw runtime.
pub fn run_doctor(json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(None)?;
    let repo_root = &layout.repo_root;

    let vendor_root = repo_root.join("vendors/claw-code-parity");
    let parity_doc = vendor_root.join("PARITY.md");

    let claw_vendor_present = vendor_root.exists();
    let parity_doc_present = parity_doc.exists();

    let mut issues = Vec::new();
    if !claw_vendor_present {
        issues.push("vendors/claw-code-parity/ missing — vendor claw first".to_string());
    }
    if !parity_doc_present {
        issues.push("vendors/claw-code-parity/PARITY.md missing".to_string());
    }

    let status = if issues.is_empty() { "ok" } else { "missing" };

    let report = ClawDoctorReport {
        claw_vendor_present,
        parity_doc_present,
        vendor_root: vendor_root.display().to_string(),
        status,
        issues: issues.clone(),
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
    } else if issues.is_empty() {
        Ok("Claw runtime: OK".to_string())
    } else {
        Ok(format!("Claw runtime issues:\n{}", issues.join("\n")))
    }
}

// ── verify-runtime ────────────────────────────────────────────────────────────

/// `epi agent claw verify-runtime` — non-destructive smoke path through claw runtime.
///
/// Resolves the vendor root, reads the parity status document, and reports status
/// without modifying any tracked files. Exits cleanly whether vendor is present or not.
pub fn run_verify_runtime(json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(None)?;
    let repo_root = &layout.repo_root;

    let vendor_root = repo_root.join("vendors/claw-code-parity");
    let parity_doc = vendor_root.join("PARITY.md");

    let parity_doc_present = parity_doc.exists();
    let parity_status = if parity_doc_present {
        fs::read_to_string(&parity_doc)
            .ok()
            .and_then(|text| {
                text.lines()
                    .find(|l| l.starts_with("# Parity Status") || l.starts_with("status:"))
                    .map(|l| l.trim().to_string())
            })
            .unwrap_or_else(|| "present".to_string())
    } else {
        "absent".to_string()
    };

    let status = if vendor_root.exists() {
        "ok"
    } else {
        "missing"
    };

    let report = ClawVerifyReport {
        status,
        vendor_root: vendor_root.display().to_string(),
        parity_doc_present,
        parity_status,
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Claw verify-runtime: {} (vendor: {})",
            status,
            vendor_root.display()
        ))
    }
}
