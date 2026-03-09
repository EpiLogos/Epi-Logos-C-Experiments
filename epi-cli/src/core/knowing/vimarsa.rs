use std::env;
use std::path::PathBuf;
use std::process::Command;
use std::time::{Duration, Instant};

use super::types::{FacetItem, VimarsaFieldFacet};

/// Default timeout for vimarsa (bkmr) searches.
const VIMARSA_TIMEOUT: Duration = Duration::from_millis(1500);

/// Resolve the bundled kbase.sh script (same logic as the vimarsa subcommand module).
fn resolve_vimarsa_script() -> Option<PathBuf> {
    // Primary env override
    if let Ok(p) = env::var("EPI_VIMARSA_SCRIPT") {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Some(pb);
        }
    }

    // Backward-compat fallback
    if let Ok(p) = env::var("EPI_KBASE_SCRIPT") {
        let pb = PathBuf::from(p);
        if pb.exists() {
            return Some(pb);
        }
    }

    if let Ok(exe) = env::current_exe() {
        if let Some(bin_dir) = exe.parent() {
            let candidate = bin_dir.join("../scripts/kbase.sh");
            if candidate.exists() {
                return Some(candidate);
            }
            let candidate = bin_dir.join("scripts/kbase.sh");
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }

    let manifest_candidate = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("scripts/kbase.sh");
    if manifest_candidate.exists() {
        return Some(manifest_candidate);
    }

    if let Some(home) = dirs::home_dir() {
        let epi_claw = home.join(".epi-claw/workspace/skills/kbase/scripts/kbase.sh");
        if epi_claw.exists() {
            return Some(epi_claw);
        }
    }

    None
}

/// Map a coordinate string to its aperture-aware bkmr project name.
///
/// Given a coordinate like "M0", detect the family letter and map:
///   M -> "M", C -> "C", P -> "P", L -> "L", S -> "S", T -> "T"
///   #, CF, W, VAK -> "root"
///   Fallback -> "epi-logos"
fn aperture_project_for_coord(coord: &str) -> &'static str {
    let trimmed = coord.trim();
    // Check for special prefixes first
    if trimmed.starts_with('#') || trimmed.starts_with("CF") || trimmed.starts_with("VAK") {
        return "root";
    }
    if trimmed.starts_with('W')
        && (trimmed.len() > 1 && trimmed.as_bytes()[1].is_ascii_digit() || trimmed == "W")
    {
        return "root";
    }
    // Family letter detection
    match trimmed.as_bytes().first() {
        Some(b'M') => "M",
        Some(b'C') => "C",
        Some(b'P') => "P",
        Some(b'L') => "L",
        Some(b'S') => "S",
        Some(b'T') => "T",
        _ => "epi-logos",
    }
}

pub fn build_vimarsa_field(
    coord: &str,
    project: Option<&str>,
    limit: usize,
) -> VimarsaFieldFacet {
    let project_scope = project.map(str::to_string);

    let script = match resolve_vimarsa_script() {
        Some(s) => s,
        None => {
            return VimarsaFieldFacet {
                source: "vimarsa-unavailable".to_string(),
                project_scope,
                summary: Some("kbase.sh script not found".to_string()),
                items: Vec::new(),
            };
        }
    };

    // Use explicit project parameter, or aperture-aware mapping, falling back to "epi-logos"
    let effective_project = project.unwrap_or_else(|| aperture_project_for_coord(coord));

    let start = Instant::now();
    let mut child = match Command::new("bash")
        .arg(&script)
        .args(["search", coord])
        .env("BKMR_PROJECT", effective_project)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
    {
        Ok(child) => child,
        Err(error) => {
            return VimarsaFieldFacet {
                source: "vimarsa-error".to_string(),
                project_scope,
                summary: Some(format!("Failed to run kbase.sh search: {}", error)),
                items: Vec::new(),
            };
        }
    };

    // Poll for completion with timeout
    let output = loop {
        if start.elapsed() >= VIMARSA_TIMEOUT {
            let _ = child.kill();
            let _ = child.wait();
            return VimarsaFieldFacet {
                source: "vimarsa-timeout".to_string(),
                project_scope,
                summary: Some(format!(
                    "Vimarsa search timed out after {}ms",
                    VIMARSA_TIMEOUT.as_millis()
                )),
                items: Vec::new(),
            };
        }
        match child.try_wait() {
            Ok(Some(_status)) => break child.wait_with_output(),
            Ok(None) => std::thread::sleep(Duration::from_millis(25)),
            Err(e) => {
                return VimarsaFieldFacet {
                    source: "vimarsa-error".to_string(),
                    project_scope,
                    summary: Some(format!("Failed to wait for kbase.sh: {}", e)),
                    items: Vec::new(),
                };
            }
        }
    };

    let output = match output {
        Ok(output) => output,
        Err(error) => {
            return VimarsaFieldFacet {
                source: "vimarsa-error".to_string(),
                project_scope,
                summary: Some(format!("Failed to collect kbase.sh output: {}", error)),
                items: Vec::new(),
            };
        }
    };

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return VimarsaFieldFacet {
            source: "vimarsa-error".to_string(),
            project_scope,
            summary: Some(if stderr.is_empty() {
                "kbase.sh search exited unsuccessfully".to_string()
            } else {
                stderr
            }),
            items: Vec::new(),
        };
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let items: Vec<FacetItem> = stdout
        .lines()
        .filter_map(|line| {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                return None;
            }
            Some(FacetItem {
                label: trimmed.to_string(),
                detail: extract_path_candidate(trimmed),
            })
        })
        .take(limit)
        .collect();

    let query_display = if effective_project != "epi-logos" {
        format!("{} (project: {})", coord, effective_project)
    } else {
        coord.to_string()
    };

    let summary = if items.is_empty() {
        format!("Vimarsa returned no hits for {}", query_display)
    } else {
        format!(
            "Vimarsa returned {} hit(s) for {}",
            items.len(),
            query_display
        )
    };

    VimarsaFieldFacet {
        source: "vimarsa".to_string(),
        project_scope: Some(effective_project.to_string()),
        summary: Some(summary),
        items,
    }
}

pub fn selected_item_path(field: &VimarsaFieldFacet, selection_index: usize) -> Option<&str> {
    field
        .items
        .get(selection_index)
        .and_then(|item| item.detail.as_deref())
}

fn extract_path_candidate(line: &str) -> Option<String> {
    line.split_whitespace()
        .map(|token| token.trim_matches(|c| matches!(c, '"' | '\'' | ',' | ';' | '(' | ')')))
        .find(|token| {
            token.starts_with('/')
                || token.ends_with(".md")
                || token.ends_with(".markdown")
                || token.ends_with(".txt")
        })
        .map(str::to_string)
}
