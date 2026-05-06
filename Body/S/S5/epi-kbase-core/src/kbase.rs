use std::process::Command;

use crate::parse::extract_path_candidate;
use crate::project::DEFAULT_PROJECT;
use crate::script::resolve_kbase_script;
use crate::types::{FacetItem, KbaseFieldFacet};

/// Build a kbase search facet for a given coordinate.
///
/// Calls `kbase.sh search <coord>` with the given project scope.
/// Returns a structured facet with search hits, summary, and source metadata.
pub fn build_kbase_field(coord: &str, project: Option<&str>, limit: usize) -> KbaseFieldFacet {
    let project_scope = project.map(str::to_string);

    let script = match resolve_kbase_script() {
        Some(s) => s,
        None => {
            return KbaseFieldFacet {
                source: "kbase-unavailable".to_string(),
                project_scope,
                summary: Some("kbase.sh script not found".to_string()),
                items: Vec::new(),
            };
        }
    };

    let effective_project = project.unwrap_or(DEFAULT_PROJECT);

    let output = match Command::new("bash")
        .arg(&script)
        .args(["search", coord])
        .env("BKMR_PROJECT", effective_project)
        .output()
    {
        Ok(output) => output,
        Err(error) => {
            return KbaseFieldFacet {
                source: "kbase-error".to_string(),
                project_scope,
                summary: Some(format!("Failed to run kbase.sh search: {}", error)),
                items: Vec::new(),
            };
        }
    };

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return KbaseFieldFacet {
            source: "kbase-error".to_string(),
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
        format!("KBase search returned no hits for {}", query_display)
    } else {
        format!(
            "KBase search returned {} hit(s) for {}",
            items.len(),
            query_display
        )
    };

    KbaseFieldFacet {
        source: "kbase".to_string(),
        project_scope: Some(effective_project.to_string()),
        summary: Some(summary),
        items,
    }
}

/// Get the file path of a selected kbase search result.
pub fn selected_item_path(field: &KbaseFieldFacet, selection_index: usize) -> Option<&str> {
    field
        .items
        .get(selection_index)
        .and_then(|item| item.detail.as_deref())
}
