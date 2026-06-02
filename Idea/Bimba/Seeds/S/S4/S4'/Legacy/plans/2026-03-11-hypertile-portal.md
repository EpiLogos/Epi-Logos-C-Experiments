# Hypertile Portal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `epi portal` — a composable tiled TUI portal using `ratatui-hypertile` that provides the terminal-native experiential interface for all M' consciousness subsystem domains.

**Architecture:** Single ratatui application using `ratatui-hypertile` (BSP tiling engine) and `ratatui-hypertile-extras` (plugin runtime, workspace tabs, keymaps, command palette). Two workspace tabs: M4'-M5' (personal/experiential) and M0'-M3' (structural/visualization). Each pane is a `HypertilePlugin` wrapping existing CLI module logic. Layout state persisted to JSON between sessions.

**Tech Stack:** Rust, ratatui 0.29, ratatui-hypertile 0.1.0, ratatui-hypertile-extras 0.1.0, crossterm 0.28, serde/serde_json, chrono, tokio

**Spec:** `Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-11-hypertile-portal-design.md`

---

## Important Notes

### API Discovery Required
The `ratatui-hypertile` and `ratatui-hypertile-extras` crates are at 0.1.0. The spec describes expected APIs (e.g., `HypertilePlugin` trait, `WorkspaceRuntime`, `Registry`), but the actual APIs may differ slightly. **Each task must verify the actual crate API** by checking `cargo doc --open` output or reading the crate source after adding dependencies. If APIs differ from the spec, adapt the implementation to match the actual crate while preserving the spec's intent.

### Existing Code Patterns
- All existing TUI apps in `epi-cli/src/tui/mod.rs` follow: `App struct` + `run_X()` (terminal lifecycle) + `draw_X()` (render functions)
- Event loops use `crossterm::event::poll(50ms)` + `event::read()`
- Colors: Green=#0, Cyan=#4/lemniscate, Magenta=#5/weave, Yellow=CF, Red=inverted, White=normal
- FFI bridge: `ffi::EpiLib` initialized in `main.rs`, passed by reference

### Missing Module: Flow
The spec references `crate::flow::parse_entries()` and `crate::flow::append()`, but no `flow` module exists yet. Flow is currently managed through vault templates (`vault/templates.rs` renders FLOW.md). The M4FlowPlugin will use a minimal flow parsing approach reading the FLOW.md file directly.

### Nara Module json: bool Convention
Most nara submodule functions (e.g., `nara::logos::status()`, `nara::oracle::show_history()`) take a `json: bool` parameter. Portal plugins should call these with `json: true` and parse the JSON output into structured data for rendering, rather than rendering the human-readable string output. This gives plugins structured access to field values.

### M3 KnowingPlugin Data Dependency
The M3 KnowingPlugin depends on `KnowingDossier` from `core/knowing/types.rs`. For v1, the plugin is a stub directing users to `epi core knowing <coord>`. Full integration with `KnowingDossier` is deferred to a future task.

---

## File Structure

### New Files
```
epi-cli/src/portal/
  mod.rs                    — PortalCmd struct, launch(), event loop, terminal lifecycle
  persist.rs                — Layout save/restore (JSON to ~/.epi-logos/portal/)
  registry.rs               — Plugin registry setup (build_registry())
  theme.rs                  — Portal-specific color tokens and M-level accent colors
  plugins/
    mod.rs                  — Re-exports all plugin modules
    shared.rs               — HelpPlugin (render-only keybinding reference), StatusPlugin
    m0.rs                   — M0' Anuttara: DashboardPlugin, FamiliesPlugin
    m1.rs                   — M1' Paramasiva: WalkPlugin
    m2.rs                   — M2' Parashakti: VibrationalPlugin (stub)
    m3.rs                   — M3' Mahamaya: KnowingPlugin (stub for now)
    m4.rs                   — M4' Nara: IdentityPlugin, FlowPlugin, OraclePlugin,
                              MedicinePlugin, TransformPlugin, LensPlugin, PratibimbaPlugin
    m5.rs                   — M5' Epii: LogosPlugin, ChatPlugin, M5FsmPlugin
```

### Modified Files
```
epi-cli/Cargo.toml                     — Add hypertile crates
epi-cli/src/lib.rs                     — Add pub mod portal
epi-cli/src/main.rs                    — Add Portal command variant + dispatch
```

---

## Chunk 1: Foundation

### Task 1: Add Hypertile Dependencies

**Files:**
- Modify: `epi-cli/Cargo.toml`

- [ ] **Step 1: Add hypertile crates to Cargo.toml**

Add after the existing `ratatui` line in `[dependencies]`:

```toml
ratatui-hypertile = { version = "0.1", features = ["serde"] }
ratatui-hypertile-extras = { version = "0.1", features = ["crossterm", "serde"] }
```

- [ ] **Step 2: Verify dependencies resolve**

Run: `cd epi-cli && cargo check 2>&1 | head -20`
Expected: Dependencies download and resolve. If feature flags don't match the actual crate, adjust accordingly. Check `cargo doc -p ratatui-hypertile -p ratatui-hypertile-extras --no-deps --open` to inspect the actual public API.

- [ ] **Step 3: Document actual API surface**

After `cargo doc`, record the actual trait/struct names in a comment at the top of the plan for reference. Key things to verify:
- Does `HypertilePlugin` trait exist? What are its methods?
- Does `WorkspaceRuntime` exist? Or is it called something else?
- Does `Registry` exist for plugin registration?
- What is the `HypertileEvent` / `EventOutcome` type?
- How does `InputMode` (Layout vs PluginInput) work?

If APIs differ from the spec, note the mapping and adapt all subsequent tasks.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/Cargo.toml epi-cli/Cargo.lock
git commit -m "deps: add ratatui-hypertile and ratatui-hypertile-extras"
```

---

### Task 2: Portal Module Skeleton + CLI Wiring

**Files:**
- Create: `epi-cli/src/portal/mod.rs`
- Create: `epi-cli/src/portal/plugins/mod.rs`
- Modify: `epi-cli/src/lib.rs`
- Modify: `epi-cli/src/main.rs`

- [ ] **Step 1: Create portal/mod.rs with PortalCmd and minimal launch()**

```rust
// epi-cli/src/portal/mod.rs
use crate::ffi::EpiLib;
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::prelude::*;
use std::io::stdout;

pub mod plugins;
mod persist;
mod registry;
mod theme;

pub fn launch(epi: &EpiLib, reset: bool, tab: Option<&str>) -> color_eyre::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;

    let mut should_quit = false;

    while !should_quit {
        terminal.draw(|frame| {
            let area = frame.area();
            let block = ratatui::widgets::Block::default()
                .title(" epi portal — M' Hypertile TUI ")
                .borders(ratatui::widgets::Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan));
            frame.render_widget(block, area);
        })?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => should_quit = true,
                        _ => {}
                    }
                }
            }
        }
    }

    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}
```

- [ ] **Step 2: Create empty submodule files**

```rust
// epi-cli/src/portal/plugins/mod.rs
pub mod shared;

// epi-cli/src/portal/persist.rs
// Layout persistence — populated in Task 4

// epi-cli/src/portal/registry.rs
// Plugin registry — populated in Task 5

// epi-cli/src/portal/theme.rs
// Portal theme tokens — populated in Task 6

// epi-cli/src/portal/plugins/shared.rs
// Shared plugins — populated in Task 3
```

- [ ] **Step 3: Wire portal module in lib.rs**

Add to `epi-cli/src/lib.rs`:
```rust
pub mod portal;
```

- [ ] **Step 4: Add Portal command to main.rs**

Add `portal` to the import line at the top of main.rs:
```rust
use epi_logos::{
    agent, app, book, code, core, ffi, gate, graph, nara, notebook, portal, sesh, sync, techne, up, vault,
    vimarsa,
};
```

In the `Commands` enum (after `Nara`):
```rust
/// M' experiential TUI portal
Portal {
    /// Force factory default layout
    #[arg(long)]
    reset: bool,
    /// Launch directly into a tab (personal, structural)
    #[arg(long)]
    tab: Option<String>,
},
```

In the `match` dispatch block:
```rust
Commands::Portal { reset, tab } => {
    let epi = ffi::EpiLib::new();
    portal::launch(&epi, *reset, tab.as_deref())?;
}
```

- [ ] **Step 5: Verify it compiles and runs**

Run: `cd epi-cli && cargo build 2>&1 | tail -5`
Expected: Compiles without errors.

Run: `cd epi-cli && cargo run -- portal` (press `q` to quit)
Expected: Blank bordered window with title " epi portal — M' Hypertile TUI ", quit on q.

- [ ] **Step 6: Commit**

```bash
git add epi-cli/src/portal/ epi-cli/src/lib.rs epi-cli/src/main.rs
git commit -m "feat: wire epi portal command with minimal launch skeleton"
```

---

### Task 3: HelpPlugin — Simplest Plugin

**Files:**
- Create/modify: `epi-cli/src/portal/plugins/shared.rs`

This task implements the simplest possible plugin to validate the `HypertilePlugin` trait integration. It's render-only — no event handling beyond scroll.

- [ ] **Step 1: Write the HelpPlugin test**

Add to `epi-cli/src/portal/plugins/shared.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::buffer::Buffer;
    use ratatui::layout::Rect;

    #[test]
    fn help_plugin_renders_keybinding_reference() {
        let plugin = HelpPlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        // Check that the buffer contains keybinding text
        let content: String = (0..area.height)
            .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
            .collect();
        assert!(content.contains("Alt"), "Should contain Alt keybinding references");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd epi-cli && cargo test portal::plugins::shared::tests::help_plugin_renders_keybinding_reference 2>&1 | tail -5`
Expected: FAIL — `HelpPlugin` not defined.

- [ ] **Step 3: Implement HelpPlugin**

**IMPORTANT:** Adapt this to the actual `HypertilePlugin` trait API discovered in Task 1 Step 3. The below uses the spec's expected API — adjust method signatures to match reality.

```rust
// epi-cli/src/portal/plugins/shared.rs
use ratatui::prelude::*;
use ratatui::widgets::*;

pub struct HelpPlugin {
    scroll: usize,
}

impl HelpPlugin {
    pub fn new() -> Self {
        Self { scroll: 0 }
    }

    pub fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_color = if is_focused { Color::Cyan } else { Color::DarkGray };

        let lines = vec![
            Line::from(Span::styled("Portal Keybindings", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))),
            Line::from(""),
            Line::from(vec![
                Span::styled("  Alt+h/j/k/l  ", Style::default().fg(Color::Yellow)),
                Span::raw("Move focus between panes"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+H/J/K/L  ", Style::default().fg(Color::Yellow)),
                Span::raw("Move pane in direction"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+s        ", Style::default().fg(Color::Yellow)),
                Span::raw("Split horizontal"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+v        ", Style::default().fg(Color::Yellow)),
                Span::raw("Split vertical"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+w        ", Style::default().fg(Color::Yellow)),
                Span::raw("Close focused pane"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+[/]      ", Style::default().fg(Color::Yellow)),
                Span::raw("Resize pane"),
            ]),
            Line::from(vec![
                Span::styled("  Tab/S-Tab    ", Style::default().fg(Color::Yellow)),
                Span::raw("Switch workspace tab"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+p        ", Style::default().fg(Color::Yellow)),
                Span::raw("Command palette"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+r        ", Style::default().fg(Color::Yellow)),
                Span::raw("Reset layout"),
            ]),
            Line::from(vec![
                Span::styled("  Enter        ", Style::default().fg(Color::Yellow)),
                Span::raw("Enter pane input mode"),
            ]),
            Line::from(vec![
                Span::styled("  Escape       ", Style::default().fg(Color::Yellow)),
                Span::raw("Return to layout mode"),
            ]),
            Line::from(vec![
                Span::styled("  q            ", Style::default().fg(Color::Yellow)),
                Span::raw("Quit portal"),
            ]),
            Line::from(""),
            Line::from(Span::styled("Available Plugins", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))),
            Line::from(""),
            Line::from("  m0.dashboard    Coordinate inspector"),
            Line::from("  m0.families     36-family explorer"),
            Line::from("  m1.walk         Torus walk"),
            Line::from("  m2.vibrational  Vibrational matrix (stub)"),
            Line::from("  m3.knowing      Epistemic browser"),
            Line::from("  m4.identity     Identity/kairos dashboard"),
            Line::from("  m4.flow         CT0 flow writer"),
            Line::from("  m4.oracle       Oracle cast + history"),
            Line::from("  m4.medicine     Elemental balance"),
            Line::from("  m4.transform    Transformation cycles"),
            Line::from("  m4.lens         Wisdom lenses"),
            Line::from("  m4.pratibimba   Personal graph stats"),
            Line::from("  m5.logos        Logos cycle status"),
            Line::from("  m5.chat         Agent chat"),
            Line::from("  m5.fsm          M5 Logos FSM"),
            Line::from("  shared.status   Cross-M overview"),
            Line::from("  shared.help     This help"),
        ];

        let para = Paragraph::new(lines)
            .scroll((self.scroll as u16, 0))
            .block(
                Block::default()
                    .title(" Help ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(border_color)),
            );
        Widget::render(para, area, buf);
    }

    pub fn scroll_down(&mut self) {
        self.scroll = self.scroll.saturating_add(1);
    }

    pub fn scroll_up(&mut self) {
        self.scroll = self.scroll.saturating_sub(1);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd epi-cli && cargo test portal::plugins::shared::tests::help_plugin_renders_keybinding_reference 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/plugins/shared.rs
git commit -m "feat(portal): add HelpPlugin with keybinding reference"
```

---

### Task 4: Layout Persistence

**Files:**
- Modify: `epi-cli/src/portal/persist.rs`

- [ ] **Step 1: Write the persistence roundtrip test**

```rust
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
                },
                TabState {
                    label: "M0'-M3' Structural".to_string(),
                    panes: vec!["m0.dashboard".into(), "m0.families".into(), "m1.walk".into()],
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
        let result = load_workspace("/tmp/nonexistent-epi-portal-test/workspace.json");
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
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd epi-cli && cargo test portal::persist::tests 2>&1 | tail -10`
Expected: FAIL — types not defined.

- [ ] **Step 3: Implement persistence module**

```rust
// epi-cli/src/portal/persist.rs
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
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
    pub panes: Vec<String>, // plugin names like "m4.identity"
    /// Opaque BSP tree layout from hypertile's serde serialization.
    /// None = use default splits. Populated after hypertile integration (Task 8).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub layout_bsp: Option<serde_json::Value>,
    /// Map from pane ID (string) to plugin name. Populated after hypertile integration.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pane_map: Option<std::collections::HashMap<String, String>>,
}

impl WorkspaceState {
    pub fn default_layout() -> Self {
        Self {
            tabs: vec![
                TabState {
                    label: "M4'-M5' Personal".to_string(),
                    panes: vec![
                        "m4.identity".into(),
                        "m4.flow".into(),
                        "m4.oracle".into(),
                    ],
                },
                TabState {
                    label: "M0'-M3' Structural".to_string(),
                    panes: vec![
                        "m0.dashboard".into(),
                        "m0.families".into(),
                        "m1.walk".into(),
                    ],
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

pub fn load_workspace(path: &impl AsRef<Path>) -> Option<WorkspaceState> {
    let data = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&data).ok()
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd epi-cli && cargo test portal::persist::tests 2>&1 | tail -10`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/persist.rs
git commit -m "feat(portal): add workspace layout persistence"
```

---

### Task 5: Theme Module

**Files:**
- Modify: `epi-cli/src/portal/theme.rs`

- [ ] **Step 1: Write theme test**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::style::Color;

    #[test]
    fn m_level_colors_are_distinct() {
        let colors: Vec<Color> = (0..=5).map(|m| m_level_color(m)).collect();
        // All 6 should be different
        for i in 0..colors.len() {
            for j in (i + 1)..colors.len() {
                assert_ne!(colors[i], colors[j], "M{} and M{} should have different colors", i, j);
            }
        }
    }

    #[test]
    fn pane_border_color_changes_with_focus() {
        assert_ne!(pane_border(true), pane_border(false));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd epi-cli && cargo test portal::theme::tests 2>&1 | tail -5`
Expected: FAIL

- [ ] **Step 3: Implement theme module**

```rust
// epi-cli/src/portal/theme.rs
use ratatui::style::{Color, Modifier, Style};

/// M-level accent colors (from spec section 9.2)
pub fn m_level_color(m: u8) -> Color {
    match m {
        0 => Color::Green,    // M0' Ground
        1 => Color::Cyan,     // M1' Mathematical
        2 => Color::Magenta,  // M2' Vibrational
        3 => Color::Yellow,   // M3' Symbolic
        4 => Color::Red,      // M4' Personal
        5 => Color::White,    // M5' Integration
        _ => Color::DarkGray,
    }
}

pub fn pane_border(focused: bool) -> Color {
    if focused { Color::Cyan } else { Color::DarkGray }
}

pub fn tab_style(active: bool) -> Style {
    if active {
        Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(Color::DarkGray)
    }
}

pub fn status_ok() -> Style {
    Style::default().fg(Color::Green)
}

pub fn status_warn() -> Style {
    Style::default().fg(Color::Yellow)
}

pub fn status_error() -> Style {
    Style::default().fg(Color::Red)
}

pub fn input_cursor() -> Style {
    Style::default().fg(Color::Yellow)
}

pub fn pane_title(m_level: u8) -> Style {
    Style::default()
        .fg(m_level_color(m_level))
        .add_modifier(Modifier::BOLD)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd epi-cli && cargo test portal::theme::tests 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/theme.rs
git commit -m "feat(portal): add theme module with M-level accent colors"
```

---

### Task 6: Plugin Registry

**Files:**
- Modify: `epi-cli/src/portal/registry.rs`

The registry maps plugin names (strings) to factory closures. This is a simple map — the hypertile-extras `Registry` may provide this, but we implement our own to stay decoupled from the crate's exact API.

- [ ] **Step 1: Write registry test**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn registry_has_all_expected_plugins() {
        let reg = build_registry();
        let expected = vec![
            "shared.help", "shared.status",
            "m0.dashboard", "m0.families",
            "m1.walk",
            "m2.vibrational",
            "m3.knowing",
            "m4.identity", "m4.flow", "m4.oracle",
            "m4.medicine", "m4.transform", "m4.lens", "m4.pratibimba",
            "m5.logos", "m5.chat", "m5.fsm",
        ];
        for name in &expected {
            assert!(reg.contains(name), "Registry missing plugin: {}", name);
        }
    }

    #[test]
    fn registry_returns_none_for_unknown_plugin() {
        let reg = build_registry();
        assert!(!reg.contains("nonexistent.plugin"));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd epi-cli && cargo test portal::registry::tests 2>&1 | tail -5`
Expected: FAIL

- [ ] **Step 3: Implement registry**

```rust
// epi-cli/src/portal/registry.rs
use std::collections::HashMap;
use ratatui::prelude::*;

/// Trait for all portal plugins
pub trait PortalPlugin {
    /// Render the plugin content into the given area
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool);
    /// Handle a key event. Returns true if the event was consumed.
    fn on_key(&mut self, key: crossterm::event::KeyEvent) -> bool { false }
    /// Called when the plugin is mounted into a pane
    fn on_mount(&mut self) {}
    /// Called when the plugin is unmounted from a pane
    fn on_unmount(&mut self) {}
    /// Human-readable name for the pane title bar
    fn title(&self) -> &str;
    /// M-level (0-5) for accent coloring
    fn m_level(&self) -> u8;
}

type PluginFactory = Box<dyn Fn() -> Box<dyn PortalPlugin>>;

pub struct PluginRegistry {
    factories: HashMap<String, PluginFactory>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self {
            factories: HashMap::new(),
        }
    }

    pub fn register(&mut self, name: &str, factory: impl Fn() -> Box<dyn PortalPlugin> + 'static) {
        self.factories.insert(name.to_string(), Box::new(factory));
    }

    pub fn create(&self, name: &str) -> Option<Box<dyn PortalPlugin>> {
        self.factories.get(name).map(|f| f())
    }

    pub fn contains(&self, name: &str) -> bool {
        self.factories.contains_key(name)
    }

    pub fn plugin_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self.factories.keys().map(|s| s.as_str()).collect();
        names.sort();
        names
    }
}

pub fn build_registry() -> PluginRegistry {
    use super::plugins::*;

    let mut reg = PluginRegistry::new();

    // Shared
    reg.register("shared.help", || Box::new(shared::HelpPlugin::new()));
    reg.register("shared.status", || Box::new(shared::StatusPlugin::new()));

    // M0' Anuttara
    reg.register("m0.dashboard", || Box::new(m0::M0DashboardPlugin::new()));
    reg.register("m0.families", || Box::new(m0::M0FamiliesPlugin::new()));

    // M1' Paramasiva
    reg.register("m1.walk", || Box::new(m1::M1WalkPlugin::new()));

    // M2' Parashakti (stub)
    reg.register("m2.vibrational", || Box::new(m2::M2VibrationalPlugin::new()));

    // M3' Mahamaya
    reg.register("m3.knowing", || Box::new(m3::M3KnowingPlugin::new()));

    // M4' Nara
    reg.register("m4.identity", || Box::new(m4::M4IdentityPlugin::new()));
    reg.register("m4.flow", || Box::new(m4::M4FlowPlugin::new()));
    reg.register("m4.oracle", || Box::new(m4::M4OraclePlugin::new()));
    reg.register("m4.medicine", || Box::new(m4::M4MedicinePlugin::new()));
    reg.register("m4.transform", || Box::new(m4::M4TransformPlugin::new()));
    reg.register("m4.lens", || Box::new(m4::M4LensPlugin::new()));
    reg.register("m4.pratibimba", || Box::new(m4::M4PratibimbaPlugin::new()));

    // M5' Epii
    reg.register("m5.logos", || Box::new(m5::M5LogosPlugin::new()));
    reg.register("m5.chat", || Box::new(m5::M5ChatPlugin::new()));
    reg.register("m5.fsm", || Box::new(m5::M5FsmPlugin::new()));

    reg
}
```

**NOTE:** This task will not compile until all plugin modules exist. The test will be deferred until after Chunk 2-4 create all plugin structs. For now, create stubs in each plugin module (see Task 7).

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/registry.rs
git commit -m "feat(portal): add plugin registry with factory pattern"
```

---

### Task 7: Plugin Module Stubs (All M-levels)

**Files:**
- Create: `epi-cli/src/portal/plugins/m0.rs`
- Create: `epi-cli/src/portal/plugins/m1.rs`
- Create: `epi-cli/src/portal/plugins/m2.rs`
- Create: `epi-cli/src/portal/plugins/m3.rs` (empty — knowing deferred)
- Create: `epi-cli/src/portal/plugins/m4.rs`
- Create: `epi-cli/src/portal/plugins/m5.rs`
- Modify: `epi-cli/src/portal/plugins/mod.rs`
- Modify: `epi-cli/src/portal/plugins/shared.rs` (add StatusPlugin stub)

Every plugin struct gets `new()`, `title()`, `m_level()`, and a stub `render()` that shows placeholder text. This lets the registry compile and the portal launch with any plugin.

- [ ] **Step 1: Update plugins/mod.rs to declare all submodules**

```rust
// epi-cli/src/portal/plugins/mod.rs
pub mod shared;
pub mod m0;
pub mod m1;
pub mod m2;
pub mod m3;
pub mod m4;
pub mod m5;
```

- [ ] **Step 2: Create stub plugins for each M-level**

Each file follows this pattern (example for m2.rs — the simplest stub):

```rust
// epi-cli/src/portal/plugins/m2.rs
use crate::portal::registry::PortalPlugin;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;

pub struct M2VibrationalPlugin;

impl M2VibrationalPlugin {
    pub fn new() -> Self { Self }
}

impl PortalPlugin for M2VibrationalPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M2' Vibrational Matrix — requires M0-M3 visualiser implementation")
            .block(Block::default()
                .title(" M2' Vibrational ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
    fn title(&self) -> &str { "M2' Vibrational" }
    fn m_level(&self) -> u8 { 2 }
}
```

For m0.rs, create stubs: `M0DashboardPlugin`, `M0FamiliesPlugin`
For m1.rs, create stub: `M1WalkPlugin`
For m3.rs, create stub: `M3KnowingPlugin` (renders "M3' Knowing Dossier — open with `epi core knowing <coord>`". Data dep: `KnowingDossier` from `core/knowing/types.rs` — deferred.)
For m4.rs, create stubs: `M4IdentityPlugin`, `M4FlowPlugin`, `M4OraclePlugin`, `M4MedicinePlugin`, `M4TransformPlugin`, `M4LensPlugin`, `M4PratibimbaPlugin`
For m5.rs, create stubs: `M5LogosPlugin`, `M5ChatPlugin`, `M5FsmPlugin`
For shared.rs, add: `StatusPlugin` stub

Each stub follows the same pattern: renders its name + "stub — not yet implemented" as placeholder text.

- [ ] **Step 3: Make HelpPlugin implement PortalPlugin trait directly**

The `PortalPlugin` trait is defined in `registry.rs` (Task 6). Since Task 6 comes before Task 7, the trait already exists. HelpPlugin should implement it directly — no separate `render` method needed. The `render` method in the HelpPlugin code above (Task 3 Step 3) becomes the `PortalPlugin::render` implementation. Add `on_key` for scrolling:

```rust
impl PortalPlugin for HelpPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        // ... (the render code from Task 3 Step 3)
    }
    fn on_key(&mut self, key: crossterm::event::KeyEvent) -> bool {
        use crossterm::event::KeyCode;
        match key.code {
            KeyCode::Down | KeyCode::Char('j') => { self.scroll_down(); true }
            KeyCode::Up | KeyCode::Char('k') => { self.scroll_up(); true }
            _ => false,
        }
    }
    fn title(&self) -> &str { "Help" }
    fn m_level(&self) -> u8 { 255 } // no M-level accent
}
```

**Note:** Task 3 (HelpPlugin) and Task 6 (Registry/PortalPlugin trait) should be implemented together since the trait must exist before HelpPlugin can implement it. The task ordering is: Task 1 → Task 2 → Task 6 → Task 3 → Task 5 → Task 4 → Task 7 → Task 8/8b/8c/8d.

- [ ] **Step 4: Verify everything compiles**

Run: `cd epi-cli && cargo build 2>&1 | tail -10`
Expected: Compiles. All stubs are minimal but satisfy the `PortalPlugin` trait.

- [ ] **Step 5: Run registry test**

Run: `cd epi-cli && cargo test portal::registry::tests 2>&1 | tail -10`
Expected: Both tests PASS.

- [ ] **Step 6: Commit**

```bash
git add epi-cli/src/portal/plugins/
git commit -m "feat(portal): add stub plugins for all M-levels and registry"
```

---

### Task 8: PortalApp State + Hypertile Adapter

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Write integration tests for workspace state**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_workspace_has_two_tabs() {
        let state = persist::WorkspaceState::default_layout();
        assert_eq!(state.tabs.len(), 2);
        assert_eq!(state.tabs[0].label, "M4'-M5' Personal");
        assert_eq!(state.tabs[1].label, "M0'-M3' Structural");
    }

    #[test]
    fn default_personal_tab_has_three_panes() {
        let state = persist::WorkspaceState::default_layout();
        assert_eq!(state.tabs[0].panes.len(), 3);
        assert!(state.tabs[0].panes.contains(&"m4.identity".to_string()));
        assert!(state.tabs[0].panes.contains(&"m4.flow".to_string()));
        assert!(state.tabs[0].panes.contains(&"m4.oracle".to_string()));
    }
}
```

- [ ] **Step 2: Create PortalApp struct**

```rust
pub struct PortalApp {
    registry: registry::PluginRegistry,
    workspace: persist::WorkspaceState,
    tabs: Vec<PortalTab>,
    active_tab: usize,
    input_mode: InputMode,
    should_quit: bool,
}

pub struct PortalTab {
    label: String,
    // Use hypertile's Hypertile struct for BSP layout
    // layout: ratatui_hypertile::Hypertile,
    panes: Vec<PortalPane>,
    focused: usize,
}

pub struct PortalPane {
    plugin: Box<dyn registry::PortalPlugin>,
    plugin_name: String,
}

#[derive(PartialEq)]
pub enum InputMode {
    Layout,      // Keys go to layout operations
    PluginInput, // Keys forwarded to focused plugin
}
```

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): add PortalApp state struct"
```

---

### Task 8b: Hypertile Trait Adapter

**Files:**
- Modify: `epi-cli/src/portal/mod.rs` (or create `epi-cli/src/portal/adapter.rs`)

If hypertile-extras expects its own `HypertilePlugin` trait for pane contents, we need an adapter. If the crate uses a simpler callback/render approach, this task adapts accordingly.

- [ ] **Step 1: Inspect actual hypertile-extras API**

Run: `cd epi-cli && cargo doc -p ratatui-hypertile -p ratatui-hypertile-extras --no-deps --open`

Determine: Does the crate have a `HypertilePlugin` trait? What methods? If yes, write an adapter:

```rust
/// Adapter that bridges our PortalPlugin trait to hypertile-extras' HypertilePlugin trait.
/// If hypertile-extras uses a different trait name, rename accordingly.
pub struct PluginAdapter {
    inner: Box<dyn registry::PortalPlugin>,
}

impl PluginAdapter {
    pub fn new(plugin: Box<dyn registry::PortalPlugin>) -> Self {
        Self { inner: plugin }
    }
}

// impl HypertilePlugin for PluginAdapter { ... }
// Delegate render() → inner.render(), on_event() → inner.on_key(), etc.
```

If hypertile-extras does NOT have a plugin trait (e.g., it only provides BSP layout computation and expects the caller to render), then skip the adapter and use `Hypertile::compute_layout(area)` directly in the render loop to get `Vec<(PaneId, Rect)>`, then render each PortalPlugin into its Rect.

- [ ] **Step 2: Commit**

```bash
git add epi-cli/src/portal/
git commit -m "feat(portal): add hypertile trait adapter"
```

---

### Task 8c: Wire Render Loop with BSP Layout

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Wire render loop**

Update `launch()` to:
1. Build `PluginRegistry` via `registry::build_registry()`
2. Load or create `WorkspaceState` via `persist::load_workspace()` / `default_layout()`
3. Construct `PortalApp` with tabs populated from workspace state (each pane created from registry)
4. In the render loop: use hypertile's `compute_layout(area)` to get pane rects, then call each `plugin.render(rect, buf, is_focused)` for the active tab
5. Render tab bar at top or bottom

- [ ] **Step 2: Verify portal launches with real panes**

Run: `cd epi-cli && cargo run -- portal`
Expected: See stub panes rendered in BSP layout with borders.

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): wire BSP render loop with plugin panes"
```

---

### Task 8d: Wire Event Dispatch (Layout + PluginInput Modes)

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Implement event dispatch**

In Layout mode: handle Alt+h/j/k/l (focus), Alt+s/v (split), Alt+w (close), Tab/S-Tab (tab switch), q (quit + save).
In PluginInput mode: forward all key events to `focused_plugin.on_key()`. Escape returns to Layout mode. Enter on a pane enters PluginInput mode.

- [ ] **Step 2: Wire shutdown sequence (on_unmount + save)**

On quit:
1. Call `on_unmount()` on every plugin in every tab — this is required for subprocess cleanup (e.g., M5ChatPlugin killing child processes). Iterate all tabs, all panes, call `plugin.on_unmount()`.
2. Serialize current layout to `~/.epi-logos/portal/workspace.json` via `persist::save_workspace()`. Populate `TabState.layout_bsp` with the hypertile BSP tree serialization if the crate supports it.

- [ ] **Step 3: Manual test**

Run: `cd epi-cli && cargo run -- portal`
Expected: Two-tab portal with panes. Tab/S-Tab switches tabs. Alt+h/j/k/l moves focus. q quits. Layout saves to `~/.epi-logos/portal/workspace.json`.

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): wire event dispatch with layout/plugin input modes"
```

---

## Chunk 2: M0'-M1' Structural Plugins

### Task 9: M0DashboardPlugin — Coordinate Inspector

**Files:**
- Modify: `epi-cli/src/portal/plugins/m0.rs`

Extracts render logic from `tui/mod.rs:draw_entity_list()` (line 112) and `draw_detail()` (line 152) into the plugin.

**Key data source:** `ffi::EpiLib::all_bimba()` returns `Vec<(&'static str, *const HolographicCoordinate)>`. The plugin needs an `EpiLib` reference at construction time.

- [ ] **Step 1: Write render test**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::buffer::Buffer;
    use ratatui::layout::Rect;

    #[test]
    fn m0_dashboard_renders_entity_list() {
        // Uses real EpiLib — requires C library linked
        let epi = crate::ffi::EpiLib::new();
        let plugin = M0DashboardPlugin::with_epi(&epi);
        let area = Rect::new(0, 0, 80, 24);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content: String = (0..area.height)
            .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
            .collect();
        assert!(content.contains("Psychoid"), "Should render psychoid entity list");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd epi-cli && cargo test portal::plugins::m0::tests::m0_dashboard_renders_entity_list 2>&1 | tail -5`
Expected: FAIL — `with_epi` not defined.

- [ ] **Step 3: Implement M0DashboardPlugin**

Extract the state (`entries`, `selected`) and render functions (`draw_entity_list`, `draw_detail`) from `tui/mod.rs` into the plugin. The plugin holds its own `entries` vec populated from `EpiLib::all_bimba()`.

```rust
pub struct M0DashboardPlugin {
    entries: Vec<(&'static str, *const crate::ffi::HolographicCoordinate)>,
    selected: usize,
}

impl M0DashboardPlugin {
    pub fn new() -> Self {
        Self { entries: vec![], selected: 0 }
    }

    pub fn with_epi(epi: &crate::ffi::EpiLib) -> Self {
        Self { entries: epi.all_bimba(), selected: 0 }
    }
}
```

Render: Split area horizontally 35/65. Left = entity list (adapted from `draw_entity_list`). Right = detail view (adapted from `draw_detail`).

Key events: j/k or Up/Down navigate the entity list.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd epi-cli && cargo test portal::plugins::m0::tests 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add epi-cli/src/portal/plugins/m0.rs
git commit -m "feat(portal): implement M0DashboardPlugin with coordinate inspector"
```

---

### Task 10: M0FamiliesPlugin — 36-Coordinate Explorer

**Files:**
- Modify: `epi-cli/src/portal/plugins/m0.rs`

Extracts from `tui/mod.rs` `run_families()` (line 667) and its draw functions. Shows all 36 coordinates (6 families x 6 positions) with color-coded family identification.

- [ ] **Step 1: Write test**

```rust
#[test]
fn m0_families_renders_family_grid() {
    let epi = crate::ffi::EpiLib::new();
    let plugin = M0FamiliesPlugin::with_epi(&epi);
    let area = Rect::new(0, 0, 80, 24);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let content: String = (0..area.height)
        .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
        .collect();
    assert!(content.contains("Families"), "Should show families title");
}
```

- [ ] **Step 2: Implement M0FamiliesPlugin**

State: arena + family_coords array + selected index (adapted from `FamilyApp`).
Render: Left list of 36 coords, right detail. Color by family letter.
Events: j/k navigate.

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
git add epi-cli/src/portal/plugins/m0.rs
git commit -m "feat(portal): implement M0FamiliesPlugin with 36-coordinate explorer"
```

---

### Task 11: M1WalkPlugin — Torus Walk

**Files:**
- Modify: `epi-cli/src/portal/plugins/m1.rs`

Extracts from `tui/mod.rs` `WalkApp` (line 328) and `draw_walk` functions.

- [ ] **Step 1: Write test**

```rust
#[test]
fn m1_walk_renders_torus_position() {
    let epi = crate::ffi::EpiLib::new();
    let plugin = M1WalkPlugin::with_epi(&epi);
    let area = Rect::new(0, 0, 80, 24);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let content: String = (0..area.height)
        .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
        .collect();
    assert!(content.contains("#0"), "Should show torus position #0");
}
```

- [ ] **Step 2: Implement M1WalkPlugin**

State: `WalkContext` + history (from `WalkApp`).
Render: torus strip (from `draw_walk_torus`) + state (from `draw_walk_state`) + history (from `draw_walk_history`). Layout: top=torus strip, bottom split = state + history.
Events: Space=step, c=double-cover, r=reset.

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
git add epi-cli/src/portal/plugins/m1.rs
git commit -m "feat(portal): implement M1WalkPlugin with torus walk"
```

---

## Chunk 3: M4' Core Plugins

### Task 12: M4IdentityPlugin — Identity/Kairos Dashboard

**Files:**
- Modify: `epi-cli/src/portal/plugins/m4.rs`

Data sources: `crate::nara::identity::load_profile()` (returns `NaraIdentityMatrix`), `crate::nara::kairos::load_current()` (returns kairos temporal state).

- [ ] **Step 1: Write test**

```rust
#[test]
fn m4_identity_renders_title() {
    let plugin = M4IdentityPlugin::new();
    let area = Rect::new(0, 0, 60, 20);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let content: String = (0..area.height)
        .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
        .collect();
    assert!(content.contains("Identity"), "Should show identity title");
}
```

- [ ] **Step 2: Implement M4IdentityPlugin**

State: cached identity profile + kairos state. Loaded on mount.
Render: wound status, active decan, dominant element, chakra, planet positions (if loaded). If no profile exists, show "Run `epi nara wind` to initialize identity".
Events: r=refresh kairos, p=toggle planet display.

Call `nara::identity::load_profile()` and `nara::kairos::load_current()` — both return JSON strings or structured data. Parse and cache.

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
git add epi-cli/src/portal/plugins/m4.rs
git commit -m "feat(portal): implement M4IdentityPlugin with kairos dashboard"
```

---

### Task 13: M4FlowPlugin — CT0 Flow Writer

**Files:**
- Modify: `epi-cli/src/portal/plugins/m4.rs`

Since no `crate::flow` module exists, this plugin reads/writes the FLOW.md file directly using vault paths.

- [ ] **Step 1: Write test**

```rust
#[test]
fn m4_flow_renders_input_line() {
    let plugin = M4FlowPlugin::new();
    let area = Rect::new(0, 0, 60, 20);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let content: String = (0..area.height)
        .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
        .collect();
    assert!(content.contains("Flow"), "Should show flow title");
}
```

- [ ] **Step 2: Implement M4FlowPlugin**

State: `entries: Vec<String>` (parsed from FLOW.md), `scroll_offset`, `input_buffer: String`, `input_mode: bool`.
Render: scrollable list of entries (most recent at bottom) + input line at bottom.
Events:
- Enter → toggle input_mode
- In input_mode: type text, Enter to append (write to FLOW.md), Escape to cancel
- j/k or Up/Down → scroll
- t → cycle entry type flag

Flow file path: `vault::paths::flow_path()` or construct from day folder pattern.

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
git add epi-cli/src/portal/plugins/m4.rs
git commit -m "feat(portal): implement M4FlowPlugin with CT0 flow writer"
```

---

### Task 14: M4OraclePlugin — Oracle Cast + History

**Files:**
- Modify: `epi-cli/src/portal/plugins/m4.rs`

Data sources: `crate::nara::oracle::show_history()`, `crate::nara::oracle::show_hygiene()`, `crate::nara::oracle::cast()`.

- [ ] **Step 1: Write test**

```rust
#[test]
fn m4_oracle_renders_title() {
    let plugin = M4OraclePlugin::new();
    let area = Rect::new(0, 0, 60, 20);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let content: String = (0..area.height)
        .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
        .collect();
    assert!(content.contains("Oracle"), "Should show oracle title");
}
```

- [ ] **Step 2: Implement M4OraclePlugin**

State: history entries, hygiene status, active cast output, consent_pending flag.
Render: history list + hygiene status + cast output area.
Events: c=initiate cast (shows consent prompt), h=toggle hygiene, j/k=scroll history.
Consent gate: when c pressed, show "Confirm cast? [y/n]" before proceeding.

- [ ] **Step 3: Run tests, verify pass, commit**

```bash
git add epi-cli/src/portal/plugins/m4.rs
git commit -m "feat(portal): implement M4OraclePlugin with oracle cast and history"
```

---

## Chunk 4: Remaining M4' + M5' + Shared Plugins

### Task 15: M4 Medicine, Transform, Lens, Pratibimba Plugins

**Files:**
- Modify: `epi-cli/src/portal/plugins/m4.rs`

Each of these is a simpler plugin wrapping existing nara submodule calls.

- [ ] **Step 1: Implement M4MedicinePlugin**

State: balance data, chakra, prescription. Render: elemental balance display + chakra + active prescription.
Events: p=new prescription, s=safety check.
Data: `nara::medicine::balance()`, `::chakra()`, `::prescribe()`.

- [ ] **Step 2: Implement M4TransformPlugin**

State: open cycles, recipe, history. Render: cycle list + recipe for current decan + history.
Events: w=write cycle, r=reflect, c=commit.
Data: `nara::transform::status()`, `::recipe()`, `::history()`.

- [ ] **Step 3: Implement M4LensPlugin**

State: 6 lenses + selected + detail. Render: lens list with germane indicator + detail pane.
Events: j/k=navigate, Enter=view detail, a=apply.
Data: `nara::lens::list()`, `::jungian()`, `::trika()`, `::phenomenal()`.

- [ ] **Step 4: Implement M4PratibimbaPlugin**

State: stats, recent activity. Render: stats display + recent activity list.
Events: e=excavate, r=record, s=atlas sync.
Data: `nara::pratibimba::stats()`, `::recent()`. Show stub for Neo4j-dependent features.

- [ ] **Step 5: Write tests for each, run, verify pass**

Each plugin gets a basic render test verifying title appears.

- [ ] **Step 6: Commit**

```bash
git add epi-cli/src/portal/plugins/m4.rs
git commit -m "feat(portal): implement M4 medicine, transform, lens, pratibimba plugins"
```

---

### Task 16: M5 Plugins — Logos, FSM, Chat (stub)

**Files:**
- Modify: `epi-cli/src/portal/plugins/m5.rs`

- [ ] **Step 1: Implement M5LogosPlugin**

State: logos cycle status (6 stages), stage output. Render: 6-stage progress bar + stage output preview.
Events: r=run next stage, j/k=navigate stages, Enter=view stage output.
Data: `nara::logos::status()`, `::stage()`.

- [ ] **Step 2: Implement M5FsmPlugin**

State: M5LogosState from FFI, sub-branch data. Render: FSM state display + sub-branch list.
Events: →=advance logos, j/k=navigate sub-branches.
Data: `ffi::m5_advance_logos()`, `ffi::m5_lookup()`.

- [ ] **Step 3: Create M5ChatPlugin (stub)**

Chat requires subprocess management (spawning `pi spawn`). For v1, make this a functional stub that shows "Agent chat — use `epi agent chat` for full experience" with planned subprocess integration noted.

- [ ] **Step 4: Tests + commit**

```bash
git add epi-cli/src/portal/plugins/m5.rs
git commit -m "feat(portal): implement M5 logos, fsm plugins and chat stub"
```

---

### Task 17: StatusPlugin — Cross-M Overview

**Files:**
- Modify: `epi-cli/src/portal/plugins/shared.rs`

- [ ] **Step 1: Implement StatusPlugin**

State: aggregated status from multiple modules — wound status, kairos freshness, flow entry count, open transform cycles, logos progress.
Render: multi-section overview with status indicators (green/yellow/red).
Events: Enter on section → no action in v1 (future: open relevant plugin in split).

Collect status from:
- `nara::identity::load_profile()` → wound status
- `nara::kairos::load_current()` → kairos freshness
- FLOW.md line count → flow entry count (read file, count non-empty non-frontmatter lines)
- `nara::transform::status()` → open cycles
- `nara::logos::status()` → logos progress
- Gateway status: attempt TCP connect to `127.0.0.1:18794`, show "connected" / "offline"

Gracefully handle missing data (show "—" if a module returns error).

- [ ] **Step 2: Write StatusPlugin test**

```rust
#[test]
fn status_plugin_renders_sections() {
    let plugin = StatusPlugin::new();
    let area = Rect::new(0, 0, 60, 20);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let content: String = (0..area.height)
        .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
        .collect();
    assert!(content.contains("Status"), "Should show status title");
    assert!(content.contains("Wound") || content.contains("Identity"), "Should show identity section");
    assert!(content.contains("Flow"), "Should show flow section");
}
```

- [ ] **Step 2: Test + commit**

```bash
git add epi-cli/src/portal/plugins/shared.rs
git commit -m "feat(portal): implement StatusPlugin with cross-M overview"
```

---

### Task 18: M3 KnowingPlugin (stub) + M2 Vibrational (already done)

**Files:**
- Create: `epi-cli/src/portal/plugins/m3.rs` (if not already)
- Modify: `epi-cli/src/portal/plugins/mod.rs`

- [ ] **Step 1: Create M3KnowingPlugin stub**

```rust
pub struct M3KnowingPlugin;
// Renders: "M3' Knowing Dossier — open with `epi core knowing <coord>`"
// Future: extract from tui/knowing.rs (697 lines)
```

- [ ] **Step 2: Register m3.knowing in registry if needed**

- [ ] **Step 3: Commit**

```bash
git add epi-cli/src/portal/plugins/m3.rs epi-cli/src/portal/plugins/mod.rs epi-cli/src/portal/registry.rs
git commit -m "feat(portal): add M3 knowing plugin stub"
```

---

## Chunk 5: Polish + Integration Testing

### Task 19: Default Layout Construction

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Implement default tab layouts using hypertile BSP splits**

Personal tab (M4'-M5'): Root splits vertical 45/55. Right side splits horizontal 60/40.
Structural tab (M0'-M3'): Root splits horizontal 55/45. Top splits vertical 40/60.

- [ ] **Step 2: Write test for default layout pane count**

```rust
#[test]
fn personal_tab_default_has_three_panes() {
    // Verify BSP tree produces 3 panes after the splits
}

#[test]
fn structural_tab_default_has_three_panes() {
    // Verify BSP tree produces 3 panes after the splits
}
```

- [ ] **Step 3: Verify save/restore roundtrip preserves layout**

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): implement default BSP layouts for both tabs"
```

---

### Task 20: Keybinding Integration

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Wire all layout-mode keybindings**

| Key | Action |
|-----|--------|
| Alt+h/j/k/l | Move focus |
| Alt+s/v | Split horizontal/vertical |
| Alt+w | Close pane |
| Alt+[/] | Resize |
| Tab/S-Tab | Switch tab |
| Alt+p | Command palette (type plugin name) |
| Alt+r | Reset layout |
| q | Quit (saves workspace) |
| Enter | Enter PluginInput mode |
| Escape | Return to Layout mode |

- [ ] **Step 2: Wire PluginInput mode forwarding**

When in PluginInput mode, forward all key events to `focused_plugin.on_key()`. Escape always returns to Layout mode.

- [ ] **Step 3: Manual test in tmux**

Verify: Alt+ prefix doesn't conflict with tmux Ctrl+b prefix. Vi-mode h/j/k/l don't conflict (require Alt).

- [ ] **Step 4: Commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): wire all keybindings with layout/plugin input modes"
```

---

### Task 21: Command Palette

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Implement minimal command palette**

Alt+p opens a text input overlay. User types a plugin name (e.g., "m4.medicine"). On Enter, replace the focused pane's plugin with the named plugin from the registry. On Escape, close palette.

Simple fuzzy match: filter `registry.plugin_names()` by typed prefix.

- [ ] **Step 2: Test + commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): add command palette for plugin switching"
```

---

### Task 22: Portal Reset + Tab CLI Flags

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Implement --reset flag**

When `reset` is true, ignore `workspace.json` and use `WorkspaceState::default_layout()`.

- [ ] **Step 2: Implement --tab flag**

When `tab` is `Some("personal")`, set `active_tab = 0`. When `Some("structural")`, set `active_tab = 1`.

- [ ] **Step 3: Implement --layout flag**

When `layout` is `Some(name)`, look for `~/.epi-logos/portal/defaults/{name}.json` and load it instead of `workspace.json` or the hardcoded default. If the file doesn't exist, print error and exit. Add the `layout` field to the Portal command:
```rust
/// Load a named saved layout
#[arg(long)]
layout: Option<String>,
```
Update `launch()` signature to accept it and pass through to `persist::load_workspace()`.

- [ ] **Step 4: Test + commit**

```bash
git add epi-cli/src/portal/mod.rs
git commit -m "feat(portal): implement --reset and --tab CLI flags"
```

---

### Task 23: Final Integration Test

**Files:**
- Create: `epi-cli/tests/portal_integration.rs` (or add to existing test file)

- [ ] **Step 1: Write integration tests**

```rust
#[test]
fn portal_registry_creates_all_plugins() {
    let reg = epi_logos::portal::registry::build_registry();
    for name in reg.plugin_names() {
        let plugin = reg.create(name);
        assert!(plugin.is_some(), "Failed to create plugin: {}", name);
    }
}

#[test]
fn portal_workspace_persistence_roundtrip() {
    let state = epi_logos::portal::persist::WorkspaceState::default_layout();
    let json = serde_json::to_string(&state).unwrap();
    let restored: epi_logos::portal::persist::WorkspaceState = serde_json::from_str(&json).unwrap();
    assert_eq!(state.tabs.len(), restored.tabs.len());
}

#[test]
fn m1_walk_plugin_step_advances_position() {
    use crossterm::event::{KeyCode, KeyEvent, KeyModifiers, KeyEventKind, KeyEventState};
    let epi = epi_logos::ffi::EpiLib::new();
    let mut plugin = epi_logos::portal::plugins::m1::M1WalkPlugin::with_epi(&epi);
    // Press space to step
    let key = KeyEvent::new(KeyCode::Char(' '), KeyModifiers::NONE);
    let consumed = plugin.on_key(key);
    assert!(consumed, "Space key should be consumed by walk plugin");
    // Verify position advanced (render should show different state)
}

#[test]
fn m4_oracle_plugin_consent_gate_blocks_cast() {
    use crossterm::event::{KeyCode, KeyEvent, KeyModifiers};
    let mut plugin = epi_logos::portal::plugins::m4::M4OraclePlugin::new();
    // Press 'c' to initiate cast — should enter consent pending state
    let key = KeyEvent::new(KeyCode::Char('c'), KeyModifiers::NONE);
    plugin.on_key(key);
    // Plugin should now be in consent_pending state, not have cast yet
    // (exact assertion depends on plugin internals — check render shows "Confirm cast?")
}

#[test]
fn help_plugin_scrolls_on_j_k() {
    use crossterm::event::{KeyCode, KeyEvent, KeyModifiers};
    let mut plugin = epi_logos::portal::plugins::shared::HelpPlugin::new();
    let key_j = KeyEvent::new(KeyCode::Char('j'), KeyModifiers::NONE);
    let consumed = plugin.on_key(key_j);
    assert!(consumed, "j key should be consumed by help plugin");
}
```

- [ ] **Step 2: Run all portal tests**

Run: `cd epi-cli && cargo test portal 2>&1 | tail -20`
Expected: All tests pass.

- [ ] **Step 3: Run full test suite**

Run: `cd epi-cli && cargo test 2>&1 | tail -20`
Expected: No regressions. All existing tests still pass.

- [ ] **Step 4: Final commit**

```bash
git add epi-cli/tests/ epi-cli/src/portal/
git commit -m "feat(portal): final integration tests and polish"
```

---

## Success Criteria (from spec section 13)

1. `epi portal` launches in < 500ms and shows default M4' layout
2. Tab switching between Personal and Structural is instant
3. Flow writer pane accepts input and appends to FLOW.md
4. Oracle pane can cast (with consent gate) and display results
5. Identity pane shows current kairos state and refreshes on demand
6. Layout changes persist across portal sessions
7. All existing `epi core`, `epi nara`, `epi flow` CLI commands continue working unchanged
8. Portal renders correctly inside tmux with no key conflicts (Alt+ prefix)
9. Plugin render tests pass with ratatui Buffer assertions
10. Portal works at minimum terminal size 80x24
