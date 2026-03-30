// Layout persistence — save/load workspace state to disk

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceState {
    pub tabs: Vec<TabState>,
    pub active_tab: usize,
    pub saved_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabState {
    pub label: String,
    pub panes: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub layout_bsp: Option<serde_json::Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pane_map: Option<HashMap<String, String>>,
}

impl WorkspaceState {
    pub fn default_layout() -> Self {
        Self {
            tabs: vec![
                TabState {
                    label: "M4'-M5' Personal".to_string(),
                    panes: vec!["m4.identity".into(), "m4.flow".into(), "m4.oracle".into()],
                    layout_bsp: None,
                    pane_map: None,
                },
                TabState {
                    label: "M0'-M3' Structural".to_string(),
                    panes: vec![
                        "clock.cosmic".into(),
                        "m3.knowing".into(),
                        "m1.walk".into(),
                    ],
                    layout_bsp: None,
                    pane_map: None,
                },
            ],
            active_tab: 0,
            saved_at: Utc::now(),
        }
    }

    pub fn portal_dir() -> std::path::PathBuf {
        dirs::home_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .join(".epi-logos")
            .join("portal")
    }

    pub fn workspace_path() -> std::path::PathBuf {
        Self::portal_dir().join("workspace.json")
    }
}

pub fn save_workspace(path: &Path, state: &WorkspaceState) -> color_eyre::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let json = serde_json::to_string_pretty(state)?;
    std::fs::write(path, json)?;
    Ok(())
}

pub fn load_workspace(path: impl AsRef<Path>) -> Option<WorkspaceState> {
    let data = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&data).ok()
}

/// Extract the live workspace state (BSP trees + pane→plugin maps) from a running workspace.
pub fn capture_workspace(
    workspace: &mut ratatui_hypertile_extras::WorkspaceRuntime,
) -> WorkspaceState {
    let original_tab = workspace.active_tab_index();
    let mut tabs = Vec::new();

    for i in 0..workspace.tab_count() {
        workspace.go_to_tab(i);
        let rt = workspace.active_runtime();
        let label = workspace.tab_labels()[i].0.to_string();

        // Serialize the BSP tree
        let root = rt.core().state().root();
        let layout_bsp = serde_json::to_value(root).ok();

        // Build pane→plugin-type map
        let pane_ids = rt.core().state().pane_ids();
        let mut pane_map = HashMap::new();
        let mut pane_names = Vec::new();
        for pid in &pane_ids {
            if let Some(pt) = rt.registry().plugin_type_for(*pid) {
                pane_map.insert(pid.get().to_string(), pt.to_string());
                pane_names.push(pt.to_string());
            }
        }

        tabs.push(TabState {
            label,
            panes: pane_names,
            layout_bsp,
            pane_map: Some(pane_map),
        });
    }

    workspace.go_to_tab(original_tab);

    WorkspaceState {
        tabs,
        active_tab: original_tab,
        saved_at: Utc::now(),
    }
}

/// Apply a saved workspace state to a running workspace, restoring BSP trees and plugin assignments.
pub fn apply_workspace_state(
    workspace: &mut ratatui_hypertile_extras::WorkspaceRuntime,
    state: &WorkspaceState,
) -> color_eyre::Result<()> {
    use ratatui_hypertile::raw::Node;

    for (i, tab_state) in state.tabs.iter().enumerate() {
        if i >= workspace.tab_count() {
            break;
        }
        workspace.go_to_tab(i);
        workspace.rename_tab(i, tab_state.label.clone());

        // Restore BSP tree if we have one
        if let Some(ref bsp_val) = tab_state.layout_bsp {
            if let Ok(node) = serde_json::from_value::<Node>(bsp_val.clone()) {
                let _ = workspace.active_runtime_mut().set_root(node);
            }
        }

        // Restore pane→plugin assignments
        if let Some(ref pane_map) = tab_state.pane_map {
            for (pane_id_str, plugin_type) in pane_map {
                if let Ok(id) = pane_id_str.parse::<u64>() {
                    let pid = ratatui_hypertile::PaneId::new(id);
                    let _ = workspace
                        .active_runtime_mut()
                        .replace_pane_plugin(pid, plugin_type);
                }
            }
        }
    }

    workspace.go_to_tab(
        state
            .active_tab
            .min(workspace.tab_count().saturating_sub(1)),
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn workspace_state_roundtrip() {
        let state = WorkspaceState {
            tabs: vec![
                TabState {
                    label: "M4'-M5' Personal".to_string(),
                    panes: vec!["m4.identity".into(), "m4.flow".into(), "m4.oracle".into()],
                    layout_bsp: None,
                    pane_map: None,
                },
                TabState {
                    label: "M0'-M3' Structural".to_string(),
                    panes: vec![
                        "clock.cosmic".into(),
                        "m3.knowing".into(),
                        "m1.walk".into(),
                    ],
                    layout_bsp: None,
                    pane_map: None,
                },
            ],
            active_tab: 0,
            saved_at: chrono::Utc::now(),
        };
        let json = serde_json::to_string_pretty(&state).unwrap();
        let restored: WorkspaceState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.tabs.len(), 2);
        assert_eq!(restored.tabs[0].label, "M4'-M5' Personal");
        assert_eq!(restored.active_tab, 0);
    }

    #[test]
    fn load_returns_none_for_missing_file() {
        let result = load_workspace("/tmp/nonexistent-epi-portal-test-xyz/workspace.json");
        assert!(result.is_none());
    }

    #[test]
    fn save_and_load_roundtrip_to_disk() {
        let dir = std::env::temp_dir().join("epi-portal-test-persist");
        let _ = std::fs::remove_dir_all(&dir);
        let path = dir.join("workspace.json");

        let state = WorkspaceState::default_layout();
        save_workspace(&path, &state).unwrap();
        let loaded = load_workspace(&path).unwrap();
        assert_eq!(loaded.tabs.len(), state.tabs.len());

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn default_layout_has_correct_structure() {
        let state = WorkspaceState::default_layout();
        assert_eq!(state.tabs.len(), 2);
        assert_eq!(state.tabs[0].label, "M4'-M5' Personal");
        assert_eq!(
            state.tabs[0].panes,
            vec!["m4.identity", "m4.flow", "m4.oracle"]
        );
        assert_eq!(state.tabs[1].label, "M0'-M3' Structural");
        assert_eq!(
            state.tabs[1].panes,
            vec!["clock.cosmic", "m3.knowing", "m1.walk"]
        );
        assert_eq!(state.active_tab, 0);
    }
}
