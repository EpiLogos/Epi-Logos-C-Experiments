use crate::ffi::EpiLib;
use crate::portal::clock_state::{new_shared_clock_state, SharedClockState};
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::prelude::*;
use ratatui_hypertile::SplitPolicy;
use ratatui_hypertile_extras::{
    event_from_crossterm, HypertileRuntimeBuilder, InputMode, MoveBindings, SplitBehavior, TabBar,
    WorkspaceRuntime,
};
use std::io::stdout;

pub mod clock_state;
pub mod persist;
pub mod plugins;
pub mod registry;
mod theme;

/// Launch the portal TUI with a two-tab workspace.
pub fn launch(
    _epi: &EpiLib,
    reset: bool,
    tab: Option<&str>,
    layout: Option<&str>,
) -> color_eyre::Result<()> {
    // Handle --layout: load a named saved layout
    if let Some(name) = layout {
        let path = persist::WorkspaceState::portal_dir()
            .join("defaults")
            .join(format!("{}.json", name));
        if !path.exists() {
            eprintln!("Layout not found: {}", path.display());
            std::process::exit(1);
        }
    }

    // Handle --reset: ignore saved state (build_workspace always creates fresh default)
    if reset {
        let ws_path = persist::WorkspaceState::workspace_path();
        let _ = std::fs::remove_file(&ws_path);
    }

    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;

    let layout_path = layout.map(|name| {
        persist::WorkspaceState::portal_dir()
            .join("defaults")
            .join(format!("{}.json", name))
    });

    let result = run_event_loop(&mut terminal, tab, layout_path.as_deref());

    // Always restore terminal, even on error
    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;

    result
}

/// Build the workspace and run the main event loop.
fn run_event_loop(
    terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>,
    tab: Option<&str>,
    layout_path: Option<&std::path::Path>,
) -> color_eyre::Result<()> {
    let clock_state = new_shared_clock_state();
    let mut workspace = build_workspace(clock_state)?;

    // Apply a named layout if provided
    if let Some(path) = layout_path {
        if let Some(state) = persist::load_workspace(path) {
            persist::apply_workspace_state(&mut workspace, &state)?;
        }
    }

    // Handle --tab flag
    if let Some(tab_name) = tab {
        match tab_name {
            "personal" | "0" => workspace.go_to_tab(0),
            "structural" | "1" => workspace.go_to_tab(1),
            _ => {}
        }
    }

    let mut should_quit = false;

    while !should_quit {
        terminal.draw(|frame| {
            let area = frame.area();
            // Reserve top 3 lines for tab bar (has borders)
            let chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([Constraint::Length(3), Constraint::Min(0)])
                .split(area);

            // Render tab bar
            let tab_bar = TabBar::from_workspace(&workspace);
            frame.render_widget(tab_bar, chunks[0]);

            // Render active tab's runtime into remaining space
            workspace.render(chunks[1], frame.buffer_mut());
        })?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind != KeyEventKind::Press {
                    continue;
                }

                // Global quit: q in Layout mode
                if key.code == KeyCode::Char('q')
                    && key.modifiers.is_empty()
                    && workspace.active_runtime().mode() == InputMode::Layout
                {
                    should_quit = true;
                    continue;
                }

                // Tab switching (workspace-level, always active)
                match (key.code, key.modifiers) {
                    (KeyCode::Tab, KeyModifiers::NONE) => {
                        workspace.next_tab();
                        continue;
                    }
                    (KeyCode::BackTab, _) => {
                        workspace.prev_tab();
                        continue;
                    }
                    _ => {}
                }

                // Forward to hypertile runtime
                if let Some(ht_event) = event_from_crossterm(key) {
                    workspace.handle_event(ht_event);
                }
            }
        }
    }

    // Save actual workspace state (BSP trees + pane assignments) on exit
    let ws_state = persist::capture_workspace(&mut workspace);
    let ws_path = persist::WorkspaceState::workspace_path();
    let _ = persist::save_workspace(&ws_path, &ws_state);

    Ok(())
}

/// Register all portal plugin types on a given runtime.
fn register_all_plugins(
    runtime: &mut ratatui_hypertile_extras::HypertileRuntime,
    clock_state: Option<SharedClockState>,
) {
    use plugins::{m0, m1, m2, m3, m4, m5, shared};

    // Shared
    runtime.register_plugin_type("shared.help", || shared::HelpPlugin::new());
    runtime.register_plugin_type("shared.status", || shared::StatusPlugin::new());

    // M0
    runtime.register_plugin_type("m0.dashboard", || m0::M0DashboardPlugin::new());
    runtime.register_plugin_type("m0.families", || m0::M0FamiliesPlugin::new());

    // M1
    runtime.register_plugin_type("m1.walk", || m1::M1WalkPlugin::new());

    // M2
    runtime.register_plugin_type("m2.vibrational", || m2::M2VibrationalPlugin::new());

    // M3
    runtime.register_plugin_type("m3.knowing", || m3::M3KnowingPlugin::new());

    // M4
    runtime.register_plugin_type("m4.identity", || m4::M4IdentityPlugin::new());
    runtime.register_plugin_type("m4.flow", || m4::M4FlowPlugin::new());
    // M4 Oracle: wire SharedClockState so every cast updates portal clock state.
    {
        let cs = clock_state.clone();
        runtime.register_plugin_type("m4.oracle", move || {
            let plugin = m4::M4OraclePlugin::new();
            if let Some(ref c) = cs {
                plugin.with_clock_state(c.clone())
            } else {
                plugin
            }
        });
    }
    runtime.register_plugin_type("m4.medicine", || m4::M4MedicinePlugin::new());
    runtime.register_plugin_type("m4.transform", || m4::M4TransformPlugin::new());
    runtime.register_plugin_type("m4.lens", || m4::M4LensPlugin::new());
    runtime.register_plugin_type("m4.pratibimba", || m4::M4PratibimbaPlugin::new());

    // M5
    runtime.register_plugin_type("m5.logos", || m5::M5LogosPlugin::new());
    runtime.register_plugin_type("m5.chat", || m5::M5ChatPlugin::new());
    runtime.register_plugin_type("m5.fsm", || m5::M5FsmPlugin::new());
}

/// Build a two-tab workspace with default pane layouts.
///
/// Tab 0 ("M4'-M5' Personal"):  m4.identity | m4.flow / m4.oracle
/// Tab 1 ("M0'-M3' Structural"): m0.dashboard / m0.families | m1.walk
fn build_workspace(clock_state: SharedClockState) -> color_eyre::Result<WorkspaceRuntime> {
    let mut workspace = WorkspaceRuntime::new(|| {
        HypertileRuntimeBuilder::default()
            .with_focus_highlight(true)
            .with_gap(1)
            .with_resize_step(0.05)
            .with_split_policy(SplitPolicy::Half)
            .with_move_bindings(MoveBindings::Vim)
            .with_split_behavior(SplitBehavior::PromptPalette)
            .with_default_split_plugin("shared.help")
    });

    // --- Tab 0: M4'-M5' Personal ---
    // WorkspaceRuntime::new() already created tab 0 with one root pane (block placeholder).
    workspace.rename_tab(0, "M4'-M5' Personal".to_string());

    // Register all plugin types on tab 0's runtime (oracle plugin gets the clock state)
    register_all_plugins(workspace.active_runtime_mut(), Some(clock_state.clone()));

    // Replace the root pane's placeholder with m4.identity
    workspace
        .active_runtime_mut()
        .replace_focused_plugin("m4.identity")
        .map_err(|e| color_eyre::eyre::eyre!("tab 0 replace root: {e}"))?;

    // Split root vertically: left = m4.identity (already), right = new pane with m4.flow
    workspace
        .active_runtime_mut()
        .split_focused(Direction::Vertical, "m4.flow")
        .map_err(|e| color_eyre::eyre::eyre!("tab 0 split V: {e}"))?;

    // Focus is now on the new right pane (m4.flow). Split it horizontally for m4.oracle below.
    workspace
        .active_runtime_mut()
        .split_focused(Direction::Horizontal, "m4.oracle")
        .map_err(|e| color_eyre::eyre::eyre!("tab 0 split H: {e}"))?;

    // --- Tab 1: M0'-M3' Structural ---
    workspace.new_tab();
    workspace.rename_tab(1, "M0'-M3' Structural".to_string());

    // Register all plugin types on tab 1's runtime (no clock state needed for structural tab)
    register_all_plugins(workspace.active_runtime_mut(), None);

    // Replace root placeholder with m0.dashboard
    workspace
        .active_runtime_mut()
        .replace_focused_plugin("m0.dashboard")
        .map_err(|e| color_eyre::eyre::eyre!("tab 1 replace root: {e}"))?;

    // Split horizontally: top = m0.dashboard, bottom = m1.walk
    workspace
        .active_runtime_mut()
        .split_focused(Direction::Horizontal, "m1.walk")
        .map_err(|e| color_eyre::eyre::eyre!("tab 1 split H: {e}"))?;

    // Focus is on bottom (m1.walk). Go back to top (m0.dashboard) to split it vertically.
    // We need to focus the m0.dashboard pane. The root pane is PaneId::ROOT.
    workspace
        .active_runtime_mut()
        .focus_pane(ratatui_hypertile::PaneId::ROOT)
        .map_err(|e| color_eyre::eyre::eyre!("tab 1 focus root: {e}"))?;

    // Split m0.dashboard vertically: left = m0.dashboard, right = m0.families
    workspace
        .active_runtime_mut()
        .split_focused(Direction::Vertical, "m0.families")
        .map_err(|e| color_eyre::eyre::eyre!("tab 1 split V: {e}"))?;

    // Switch back to tab 0 as default
    workspace.go_to_tab(0);

    Ok(workspace)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_workspace() -> color_eyre::Result<WorkspaceRuntime> {
        build_workspace(new_shared_clock_state())
    }

    #[test]
    fn default_workspace_state_has_two_tabs() {
        let state = persist::WorkspaceState::default_layout();
        assert_eq!(state.tabs.len(), 2);
        assert_eq!(state.tabs[0].label, "M4'-M5' Personal");
        assert_eq!(state.tabs[1].label, "M0'-M3' Structural");
    }

    #[test]
    fn build_workspace_creates_two_tabs() {
        let ws = test_workspace().expect("build_workspace failed");
        assert_eq!(ws.tab_count(), 2);

        let labels = ws.tab_labels();
        assert_eq!(labels[0].0, "M4'-M5' Personal");
        assert_eq!(labels[1].0, "M0'-M3' Structural");
    }

    #[test]
    fn tab_0_has_three_panes() {
        let ws = test_workspace().expect("build_workspace failed");
        assert_eq!(ws.active_tab_index(), 0);
        // pane_ids() walks the BSP tree directly (no layout computation needed)
        let count = ws.active_runtime().core().state().pane_ids().len();
        assert_eq!(count, 3, "Tab 0 should have 3 panes, got {}", count);
    }

    #[test]
    fn tab_1_has_three_panes() {
        let mut ws = test_workspace().expect("build_workspace failed");
        ws.go_to_tab(1);
        let count = ws.active_runtime().core().state().pane_ids().len();
        assert_eq!(count, 3, "Tab 1 should have 3 panes, got {}", count);
    }
}
