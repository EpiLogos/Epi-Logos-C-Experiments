use std::process::Command;
use std::time::{Duration, Instant};

use crate::parse::extract_path_candidate;
use crate::project::{aperture_project_for_coord, DEFAULT_PROJECT};
use crate::script::resolve_vimarsa_script;
use crate::types::{FacetItem, VimarsaFieldFacet};

/// Default timeout for vimarsa (bkmr) searches.
const VIMARSA_TIMEOUT: Duration = Duration::from_millis(1500);

/// Build a vimarsa search facet for a given coordinate.
///
/// Uses aperture-aware project mapping: each coordinate family maps to
/// its own bkmr project namespace (M -> "M", S -> "S", etc.).
/// Supports explicit project override and timeout handling.
pub fn build_vimarsa_field(coord: &str, project: Option<&str>, limit: usize) -> VimarsaFieldFacet {
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

    let query_display = if effective_project != DEFAULT_PROJECT {
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

/// Get the file path of a selected vimarsa search result.
pub fn selected_item_path(field: &VimarsaFieldFacet, selection_index: usize) -> Option<&str> {
    field
        .items
        .get(selection_index)
        .and_then(|item| item.detail.as_deref())
}
