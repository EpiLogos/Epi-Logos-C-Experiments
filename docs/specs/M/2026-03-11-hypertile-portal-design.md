# `epi portal` — M' Hypertile TUI Portal

> **Status:** ✅ Implemented (2026-03-12) — all 17 plugins in 2 tabs, layout persistence, `epi portal` live.
> **For agentic workers:** Implementation complete. This spec is now a reference document.

**Goal:** Composable tiled TUI portal that provides the terminal-native experiential interface for all M' (consciousness subsystem) domains. The portal is to the terminal what the Electron app is to the desktop — the user-facing M' layer, while S-level CLI commands remain unchanged.

**Architecture:** Single ratatui application using `ratatui-hypertile` (BSP tiling engine) and `ratatui-hypertile-extras` (plugin runtime, workspace tabs, keymaps, command palette). Two workspace tabs: M4'-M5' (personal/experiential) and M0'-M3' (structural/visualization). Each pane is a `HypertilePlugin` wrapping existing CLI module logic. Layout state persisted to JSON between sessions.

**Tech Stack:** Rust, ratatui 0.29, ratatui-hypertile 0.1.0, ratatui-hypertile-extras 0.1.0, crossterm 0.28, serde/serde_json (layout persistence), chrono, tokio (optional async gateway bridge)

---

## 1. Conceptual Model

### 1.1 S-Stack vs M-Stack Interface Split

The Epi-Logos CLI has two fundamentally different interface concerns:

| Stack | Domain | Interface Mode | User Posture |
|-------|--------|---------------|--------------|
| **S/S'** (Stack) | Infrastructure, configuration, data | CLI commands, flags, JSON output | Administrative — setting up, querying, managing |
| **M/M'** (Consciousness) | Experience, visualization, dialogue | TUI portal, composable panes, live state | Experiential — using, witnessing, interacting |

**S-level commands stay as-is:** `epi vault`, `epi gate`, `epi graph`, `epi agent`, `epi core`, `epi sync`, `epi nara`, `epi flow` — all continue working as standalone CLI commands. Nothing changes.

**The portal is the M' experiential layer on top.** It calls into the same Rust modules that the CLI commands use. No business logic lives in the portal — it is purely render + event handling + composition.

### 1.2 The M' Domain Map

Each M-level corresponds to a consciousness subsystem with its own visualization and interaction needs:

| M-Level | Name | Domain | Portal Plugins |
|---------|------|--------|---------------|
| **M0'** | Anuttara | Ground/Void, coordinate space | Coordinate dashboard, family explorer |
| **M1'** | Paramasiva | Mathematical DNA, torus topology | Torus walk, spanda state |
| **M2'** | Parashakti | Vibrational architecture | Vibrational matrix viewer (future) |
| **M3'** | Mahamaya | Symbolic transcription | Knowing dossier browser, symbolic map (future) |
| **M4'** | Nara | Personal dialogical interface | Identity dashboard, flow writer, oracle, medicine, transform, lens, pratibimba |
| **M5'** | Epii | Holographic integration | Logos cycle, agent chat, integration status |

### 1.3 Two-Tab Workspace Split

The M' levels split into two natural groups reflecting the distinction between the impersonal structural layers and the personal experiential layers:

| Tab | Levels | Character | Default |
|-----|--------|-----------|---------|
| **Personal** | M4'-M5' | Dialogical, journaling, oracle, synthesis | **Yes** (home tab) |
| **Structural** | M0'-M3' | Visualization, topology, coordinates, vibration | Secondary |

This mirrors the M-branch architecture: M0-M3 are the transpersonal computational substrate; M4-M5 are the personal-dialogical and integrative layers.

---

## 2. Hypertile Integration

### 2.1 Library Architecture

`ratatui-hypertile` provides:
- **BSP tree** — Binary Space Partitioning for pane layout. Split any pane horizontally or vertically.
- **`Hypertile`** struct — Core layout state. Methods: `split_focused(direction)`, `close_focused()`, `focus_pane(id)`, `compute_layout(area)`, `set_gap()`, `set_resize_step()`.
- **`PaneId`** — Stable identifiers across layout modifications.
- **`HypertileAction`** — Split, focus, resize, move operations.
- **Serde feature** — Optional serialization of the BSP tree (enables persistence).

`ratatui-hypertile-extras` provides:
- **`HypertileRuntime`** — Manages plugins, modal input, command palette.
- **`WorkspaceRuntime`** — Multiple `HypertileRuntime` tabs. Methods: `new_tab()`, `close_tab()`, `next_tab()`, `prev_tab()`, `rename_tab()`, `tab_labels()`.
- **`HypertilePlugin` trait** — The pane interface:
  ```rust
  trait HypertilePlugin {
      fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool);  // Required
      fn on_event(&mut self, event: HypertileEvent) -> EventOutcome;     // Optional
      fn on_mount(&mut self, ctx: PluginContext);                         // Optional
      fn on_unmount(&mut self, ctx: PluginContext);                       // Optional
  }
  ```
- **`Registry`** — Plugin factory. Register pane types by name, instantiate on demand.
- **`InputMode`** — `Layout` (tiling operations) vs `PluginInput` (keys forwarded to focused plugin).
- **`TabBar`** / **`PaneBar`** — Built-in UI widgets for tab and pane navigation.
- **`MoveBindings`** — Vi-style movement presets.

### 2.2 How We Use It

```
WorkspaceRuntime
  ├── Tab 0: "M4'-M5' Personal" (HypertileRuntime)
  │     ├── Pane: M4IdentityPlugin (identity/kairos dashboard)
  │     ├── Pane: M4FlowPlugin (CT0 flow writer)
  │     └── Pane: M4OraclePlugin (oracle history + cast)
  │
  └── Tab 1: "M0'-M3' Structural" (HypertileRuntime)
        ├── Pane: M0DashboardPlugin (coordinate inspector)
        └── Pane: M1WalkPlugin (torus walk)
```

Users can:
- Split any pane further (add medicine, transform, lens, etc.)
- Close panes they don't need
- Resize panes with keyboard shortcuts
- Switch between tabs
- Open the command palette to add any registered plugin to any pane

### 2.3 Crate Dependencies

Add to `epi-cli/Cargo.toml`:
```toml
ratatui-hypertile = { version = "0.1", features = ["serde"] }
ratatui-hypertile-extras = { version = "0.1", features = ["crossterm", "serde"] }
```

Existing deps already satisfied: `ratatui = "0.29"`, `crossterm = "0.28"`, `serde`, `serde_json`.

---

## 3. Plugin Architecture

### 3.1 Module Organization (by M-Level)

```
epi-cli/src/portal/
  mod.rs                    — PortalCmd enum, launch(), event loop
  persist.rs                — Layout save/restore (JSON)
  registry.rs               — Plugin registry setup
  theme.rs                  — Portal-specific theming (extends tui/theme.rs when it exists)
  plugins/
    mod.rs                  — Re-exports all plugin modules
    m0.rs                   — M0' Anuttara: DashboardPlugin, FamiliesPlugin
    m1.rs                   — M1' Paramasiva: WalkPlugin, SpandaPlugin (stub)
    m2.rs                   — M2' Parashakti: VibrationalPlugin (stub)
    m3.rs                   — M3' Mahamaya: KnowingPlugin, SymbolicPlugin (stub)
    m4.rs                   — M4' Nara: IdentityPlugin, FlowPlugin, OraclePlugin,
                              MedicinePlugin, TransformPlugin, LensPlugin, PratibimbaPlugin
    m5.rs                   — M5' Epii: LogosPlugin, ChatPlugin, M5FsmPlugin
    shared.rs               — StatusPlugin (cross-M overview), HelpPlugin
```

**Naming convention:** Files named by M-level. Plugin structs named `M{n}{Feature}Plugin`:
- `M0DashboardPlugin`, `M0FamiliesPlugin`
- `M1WalkPlugin`
- `M4IdentityPlugin`, `M4FlowPlugin`, `M4OraclePlugin`, `M4MedicinePlugin`, etc.
- `M5LogosPlugin`, `M5ChatPlugin`

### 3.2 Plugin Implementation Pattern

Every plugin follows the same structure:

```rust
pub struct M4FlowPlugin {
    // Render state (what's currently displayed)
    entries: Vec<FlowEntry>,
    scroll_offset: usize,
    input_buffer: String,
    input_mode: bool,  // reading vs writing

    // Cached data
    day_id: String,
    entry_count: usize,
}

impl HypertilePlugin for M4FlowPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        // Render flow entries + input line using ratatui primitives
        // Highlight border if is_focused
    }

    fn on_event(&mut self, event: HypertileEvent) -> EventOutcome {
        // In input_mode: capture keystrokes for flow entry
        // Otherwise: scroll, navigate entries
        // On Enter (input_mode): call crate::flow::append() then refresh
    }

    fn on_mount(&mut self, _ctx: PluginContext) {
        // Load today's flow entries via crate::flow::parse_entries()
        self.refresh();
    }
}
```

**Key principle:** Plugins call into existing CLI modules for all business logic:
- `M4FlowPlugin` → `crate::flow::parse_entries()`, `crate::flow::append()`
- `M4OraclePlugin` → `crate::nara::oracle::cast()`, `crate::nara::oracle::show_history()`
- `M4IdentityPlugin` → `crate::nara::identity::show()`, `crate::nara::kairos::load_current()`
- `M0DashboardPlugin` → `crate::core::EpiLib` FFI for coordinate data
- `M1WalkPlugin` → `crate::core::EpiLib` FFI for torus operations

No business logic in plugins. They are render + event adapters only.

### 3.3 Plugin Registry

At startup, register all available plugins by name:

```rust
pub fn build_registry() -> Registry {
    let mut reg = Registry::new();
    reg.register("m0.dashboard", || Box::new(M0DashboardPlugin::new()));
    reg.register("m0.families", || Box::new(M0FamiliesPlugin::new()));
    reg.register("m1.walk", || Box::new(M1WalkPlugin::new()));
    reg.register("m2.vibrational", || Box::new(M2VibrationalPlugin::stub()));
    reg.register("m3.knowing", || Box::new(M3KnowingPlugin::new()));
    reg.register("m4.identity", || Box::new(M4IdentityPlugin::new()));
    reg.register("m4.flow", || Box::new(M4FlowPlugin::new()));
    reg.register("m4.oracle", || Box::new(M4OraclePlugin::new()));
    reg.register("m4.medicine", || Box::new(M4MedicinePlugin::new()));
    reg.register("m4.transform", || Box::new(M4TransformPlugin::new()));
    reg.register("m4.lens", || Box::new(M4LensPlugin::new()));
    reg.register("m4.pratibimba", || Box::new(M4PratibimbaPlugin::new()));
    reg.register("m5.logos", || Box::new(M5LogosPlugin::new()));
    reg.register("m5.chat", || Box::new(M5ChatPlugin::new()));
    reg.register("m5.fsm", || Box::new(M5FsmPlugin::new()));
    reg.register("shared.status", || Box::new(StatusPlugin::new()));
    reg.register("shared.help", || Box::new(HelpPlugin::new()));
    reg
}
```

The command palette (from hypertile-extras) lets users type a plugin name to open it in the focused pane.

### 3.4 Refactoring Existing TUI Code

The existing 5 dashboards in `tui/mod.rs` + `tui/knowing.rs` contain render logic and state management that must be extracted into plugins:

| Existing Function | Becomes Plugin | Extraction |
|-------------------|---------------|------------|
| `run_dashboard()` (1208 lines, shared) | `M0DashboardPlugin` | Extract `draw_entity_list`, `draw_detail`, `draw_torus_strip` and `App` state |
| `run_walk()` | `M1WalkPlugin` | Extract `WalkContext`, `draw_walk_torus`, `draw_walk_state`, `draw_walk_history` |
| `run_families()` | `M0FamiliesPlugin` | Extract family list + detail rendering |
| `run_m5()` | `M5FsmPlugin` | Extract `M5LogosState`, sub-branch rendering, logos strip |
| `run_knowing()` (697 lines) | `M3KnowingPlugin` | Extract `KnowingTuiState`, facet tab system, all draw functions |
| `chat::run()` (148 lines) | `M5ChatPlugin` | Extract message buffer, input line, scroll |

**The existing `run_X()` functions remain as standalone entry points** — they continue to work for `epi core dashboard`, `epi core walk`, etc. The portal plugins reuse their internal render/state logic but implement `HypertilePlugin` instead of owning the terminal lifecycle.

**Refactoring strategy:**
1. Extract render functions and state structs from `tui/mod.rs` into `tui/widgets/` (shared between standalone and portal modes)
2. Portal plugins compose these extracted widgets within `HypertilePlugin::render()`
3. Standalone `run_X()` functions use the same extracted widgets within their own event loop

This avoids code duplication while keeping both entry points working.

---

## 4. Default Layouts

### 4.1 M4'-M5' Personal Tab (Home)

The default layout when the portal first launches:

```
┌──────────────────────────┬─────────────────────────┐
│                          │                         │
│   M4 Identity/Kairos     │   M4 Flow Writer        │
│                          │   (CT0 append mode)     │
│   Today's astro timing   │                         │
│   Wound status           │   Recent entries shown  │
│   Active decan + chakra  │   Input line at bottom  │
│   Kairos freshness       │                         │
│                          ├─────────────────────────┤
│                          │                         │
│                          │   M4 Oracle             │
│                          │   Recent casts, hygiene │
│                          │   Cast output display   │
│                          │                         │
└──────────────────────────┴─────────────────────────┘
 [M4'-M5' Personal*]  [M0'-M3' Structural]      tabs
```

**Split structure:** Root splits vertical 45/55. Right side splits horizontal 60/40.

### 4.2 M0'-M3' Structural Tab

```
┌──────────────────────────┬─────────────────────────┐
│                          │                         │
│   M0 Coordinate          │   M0 Detail Pane        │
│   Dashboard              │   (HC snapshot,         │
│   (entity list,          │    16-fold pointers,    │
│    psychoid numbers)     │    tagged pointer info)  │
│                          │                         │
├──────────────────────────┴─────────────────────────┤
│                                                     │
│   M1 Torus Walk                                     │
│   (torus strip + walk state + history)              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Split structure:** Root splits horizontal 55/45. Top side splits vertical 40/60.

### 4.3 Saved Default Layouts

```
~/.epi-logos/portal/
  workspace.json                — last session state (auto-saved on exit)
  defaults/
    m4m5-personal.json          — factory default for M4'-M5' tab
    m0m3-structural.json        — factory default for M0'-M3' tab
```

Layout JSON schema (using hypertile's serde feature):
```json
{
  "tabs": [
    {
      "label": "M4'-M5' Personal",
      "layout": { /* serialized BSP tree from hypertile */ },
      "panes": {
        "pane_id_1": "m4.identity",
        "pane_id_2": "m4.flow",
        "pane_id_3": "m4.oracle"
      }
    },
    {
      "label": "M0'-M3' Structural",
      "layout": { /* serialized BSP tree */ },
      "panes": {
        "pane_id_4": "m0.dashboard",
        "pane_id_5": "m0.families",
        "pane_id_6": "m1.walk"
      }
    }
  ],
  "active_tab": 0,
  "saved_at": "2026-03-11T14:30:00Z"
}
```

**On launch:**
1. If `workspace.json` exists and is < 24h old → restore last state
2. Otherwise → load factory defaults
3. `epi portal --reset` → force factory defaults

**On exit:**
- Auto-save current layout to `workspace.json`
- Plugin state (scroll positions, input buffers) is NOT persisted — only layout structure and pane-to-plugin mapping

---

## 5. Event Handling & Keybindings

### 5.1 Input Mode Model

Hypertile-extras provides two input modes:

| Mode | Active When | Keys Do |
|------|------------|---------|
| **Layout** | No pane has input focus | Split, resize, move, focus, tab switch, command palette |
| **PluginInput** | A pane is capturing input (e.g., flow writer, chat) | All keys forwarded to focused plugin's `on_event()` |

**Mode switching:**
- `Enter` on a pane → switch to PluginInput (pane captures keys)
- `Escape` → return to Layout mode (pane releases keys)
- This is critical for the Flow writer — user presses Enter to start typing, Escape to return to layout navigation

### 5.2 Layout Mode Keybindings

Using hypertile-extras `MoveBindings` with vi-style defaults, plus custom portal bindings:

| Key | Action | Notes |
|-----|--------|-------|
| `Alt+h/j/k/l` | Move focus between panes | Vi directional, Alt modifier avoids tmux conflicts |
| `Alt+H/J/K/L` | Move pane in direction | Swap pane positions |
| `Alt+s` | Split focused pane (horizontal) | |
| `Alt+v` | Split focused pane (vertical) | |
| `Alt+w` | Close focused pane | |
| `Alt+[/]` | Resize focused pane smaller/larger | |
| `Alt+1-9` | Focus pane by index | Quick jump |
| `Tab` / `Shift+Tab` | Next/previous workspace tab | M4'-M5' ↔ M0'-M3' |
| `Alt+n` | New tab | For custom workspace layouts |
| `Alt+p` | Command palette | Type plugin name to open in focused pane |
| `Alt+r` | Reset to default layout | Current tab only |
| `q` (Layout mode) | Quit portal | Saves workspace.json |

### 5.3 PluginInput Mode Conventions

Each plugin defines its own key handling, but conventions should be consistent:

| Key | Convention |
|-----|-----------|
| `Escape` | Always returns to Layout mode |
| `↑/↓` or `j/k` | Scroll/navigate within plugin |
| `Enter` | Confirm / submit / execute action |
| `?` | Show plugin-specific help overlay |

### 5.4 tmux Compatibility

Designed for scenario (A): portal runs inside a tmux pane.

**Key conflict avoidance:**
- Portal uses `Alt+` prefix for all layout keys
- tmux default prefix is `Ctrl+b` — no collision
- tmux vi-mode uses raw `h/j/k/l` — no collision (portal requires Alt modifier)
- `Escape` has a tmux delay (`escape-time`) — recommend `set -sg escape-time 10` in docs

**Future scenario (C) — pane ejection:**
- `Alt+e` could eject focused pane's command to a new tmux split: `tmux split-window "epi nara oracle cast ..."`
- Not in v1 — noted as future enhancement

---

## 6. Plugin Specifications

### 6.1 M0' Plugins (Anuttara — Ground)

**M0DashboardPlugin** (`m0.dashboard`)
- Renders: Entity list (psychoid numbers, CF roots) + detail pane (HC snapshot, 16-fold pointers)
- Data source: `EpiLib::all_bimba()` + `ffi::read_coord()`
- Events: ↑/↓ navigate list, Enter to inspect
- Refactored from: `tui::run_dashboard()` draw functions

**M0FamiliesPlugin** (`m0.families`)
- Renders: 36 family coordinates (P/S/T/M/L/C × 0-5) + detail pane
- Data source: `EpiLib` arena init + families crosslink
- Events: ↑/↓ navigate, color-coded by family
- Refactored from: `tui::run_families()` draw functions

### 6.2 M1' Plugin (Paramasiva — Mathematical)

**M1WalkPlugin** (`m1.walk`)
- Renders: Torus position strip + walk state + history
- Data source: In-memory walk state (position, covering, step/cycle counts)
- Events: Space (step), c (double-cover), r (reset)
- Refactored from: `tui::run_walk()` draw functions

### 6.3 M2' Plugin (Parashakti — Vibrational) — Stub

**M2VibrationalPlugin** (`m2.vibrational`)
- Renders: Placeholder text — "M2' Vibrational Matrix — requires M0-M3 visualiser implementation"
- Stub for future vibrational architecture visualization
- Will connect to M2 FFI when available

### 6.4 M3' Plugin (Mahamaya — Symbolic)

**M3KnowingPlugin** (`m3.knowing`)
- Renders: Multi-facet epistemic browser (7 tabs: Essence, Structural, Relational, Vimarsa, Notebook, Snapshot, Actions)
- Data source: `KnowingDossier` struct
- Events: Tab navigation (←/→), selection (↑/↓), action execution (Enter)
- Refactored from: `tui::knowing::run_knowing()` draw functions

### 6.5 M4' Plugins (Nara — Personal)

**M4IdentityPlugin** (`m4.identity`)
- Renders: Identity wound status, kairos temporal state, active decan, dominant element, chakra, planet positions
- Data source: `crate::nara::kairos::load_current()`, `crate::nara::identity::load_profile()`
- Events: r (refresh kairos), p (show planets toggle)
- Auto-refreshes kairos data on mount

**M4FlowPlugin** (`m4.flow`)
- Renders: Today's flow entries (scrollable, most recent at bottom) + input line
- Data source: `crate::flow::parse_entries()` (from the epi-flow spec)
- Events:
  - Enter → switch to input mode, show cursor in input line
  - In input mode: type entry text, Enter to submit (calls `crate::flow::append()`), Escape to cancel
  - ↑/↓ → scroll through entries
  - t → cycle entry type flag (*personal*, *dream*, *dev*, etc.)
  - / → search mode (delegates to `crate::flow::search()`)
- The primary "home" pane — most-used daily interaction

**M4OraclePlugin** (`m4.oracle`)
- Renders: Oracle history (last 5 casts), hygiene status, active cast output
- Data source: `crate::nara::oracle::show_history()`, `crate::nara::oracle::show_hygiene()`
- Events:
  - c → initiate cast (prompts for system + question in plugin input mode)
  - h → toggle hygiene display
  - ↑/↓ → scroll history
- Consent gate: cast operation shows confirmation prompt within the pane before proceeding

**M4MedicinePlugin** (`m4.medicine`)
- Renders: Elemental balance, active chakra, current prescription
- Data source: `crate::nara::medicine::balance()`, `::chakra()`, `::prescribe()`
- Events: p (new prescription with context prompt), s (safety check)

**M4TransformPlugin** (`m4.transform`)
- Renders: Open cycles, recipe for current decan, recent history
- Data source: `crate::nara::transform::status()`, `::recipe()`, `::history()`
- Events: w (write new cycle), r (reflect on selected cycle), c (commit operation)

**M4LensPlugin** (`m4.lens`)
- Renders: 6 wisdom lenses with germane indicator, selected lens detail
- Data source: `crate::nara::lens::list()`, `::jungian()`, `::trika()`, `::phenomenal()`
- Events: ↑/↓ navigate lenses, Enter to view detail, a (apply to target)

**M4PratibimbaPlugin** (`m4.pratibimba`)
- Renders: Pratibimba stats, recent activity
- Data source: `crate::nara::pratibimba::stats()`, `::recent()`
- Events: e (excavate term), r (record observation), s (atlas sync)
- Neo4j-dependent features show stub messages until connection available

### 6.6 M5' Plugins (Epii — Integration)

**M5LogosPlugin** (`m5.logos`)
- Renders: Today's logos cycle status (6 stages with completion markers), stage output preview
- Data source: `crate::nara::logos::status()`, `::stage()`
- Events: r (run next stage), ↑/↓ (navigate stages), Enter (view stage output)

**M5ChatPlugin** (`m5.chat`)
- Renders: Agent chat messages (scrollable) + input line
- Data source: Pi agent subprocess (refactored from `agent/chat.rs`)
- Events: Enter (send message), ↑/↓ (scroll), PageUp/PageDown
- Subprocess management: spawns `pi spawn` on mount, kills on unmount

**M5FsmPlugin** (`m5.fsm`)
- Renders: M5 Logos FSM state, sub-branch lookups, pipeline tick
- Data source: `EpiLib` M5 FFI (`m5_advance_logos`, `m5_lookup`)
- Events: → (advance logos), ↑/↓ (navigate sub-branches)
- Refactored from: `tui::run_m5()` draw functions

### 6.7 Shared Plugins

**StatusPlugin** (`shared.status`)
- Renders: Cross-M overview — wound status, kairos freshness, flow entry count, open transform cycles, logos progress, gateway status
- Data source: Aggregates from multiple nara/flow/gate modules
- Events: Enter on any section → opens the relevant M-level plugin in a new pane split

**HelpPlugin** (`shared.help`)
- Renders: Keybinding reference, available plugins, portal usage guide
- Events: Read-only, scroll only

---

## 7. Portal Lifecycle

### 7.1 Launch

```
epi portal                    # Launch with last state or defaults
epi portal --reset            # Force factory default layout
epi portal --tab personal     # Launch directly into M4'-M5' tab
epi portal --tab structural   # Launch directly into M0'-M3' tab
epi portal --layout <name>    # Load a named saved layout
```

**Startup sequence:**
1. Initialize `EpiLib` (C FFI bridge) — same as existing TUI dashboards
2. Build plugin registry (`registry::build_registry()`)
3. Load workspace state (`persist::load_workspace()`)
4. Construct `WorkspaceRuntime` with loaded/default tab layouts
5. Enter terminal raw mode + alternate screen (crossterm)
6. Event loop: `WorkspaceRuntime::handle_event()` + `WorkspaceRuntime::render()`
7. On quit: save workspace state, restore terminal

### 7.2 Event Loop

```rust
pub fn launch(epi: &EpiLib) -> color_eyre::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;

    let registry = build_registry(epi);
    let workspace = load_or_default_workspace(&registry)?;

    while !should_quit {
        terminal.draw(|frame| {
            workspace.render(frame.area(), frame.buffer_mut());
        })?;

        if event::poll(Duration::from_millis(50))? {
            let ev = event::read()?;
            let ht_event = event_from_crossterm(ev);
            workspace.handle_event(ht_event);
        }
    }

    save_workspace(&workspace)?;
    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}
```

### 7.3 Shutdown

1. All plugins receive `on_unmount()` — cleanup opportunity
2. Workspace layout serialized to `~/.epi-logos/portal/workspace.json`
3. Terminal restored (raw mode off, alternate screen off)
4. Any subprocess plugins (M5ChatPlugin) kill child processes

---

## 8. Integration Points

### 8.1 CLI Registration

**`epi-cli/src/main.rs`:**
```rust
/// M' experiential TUI portal
Portal {
    #[arg(long)]
    reset: bool,
    #[arg(long)]
    tab: Option<String>,
    #[arg(long)]
    layout: Option<String>,
},
```

**`epi-cli/src/lib.rs`:**
```rust
pub mod portal;
```

### 8.2 Existing TUI Coexistence

The existing `epi core dashboard/walk/families/m5` and `epi core knowing` commands continue to work as standalone TUI apps. They are not removed or modified in v1.

The refactoring extracts shared render logic into `tui/widgets/` so both standalone and portal modes can use it, but the standalone `run_X()` functions keep their current terminal lifecycle.

### 8.3 Gateway Bridge (Future)

Portal plugins that need live updates (identity changes, new oracle casts, flow appends from other sources) could subscribe to gateway WebSocket events:

```rust
// Future: async event channel from gateway
let (tx, rx) = tokio::sync::mpsc::channel(32);
// Gateway listener pushes events to tx
// Portal event loop polls rx alongside crossterm events
```

Not in v1 — plugins refresh data on mount and on explicit user action.

### 8.4 Electron App Parity

The portal plugin set maps 1:1 to planned Electron app panels. The same CLI module calls power both interfaces:

| Portal Plugin | Electron Panel | Shared Module |
|---------------|---------------|---------------|
| M4FlowPlugin | Flow Editor (React) | `crate::flow::*` |
| M4OraclePlugin | Oracle Panel | `crate::nara::oracle::*` |
| M4IdentityPlugin | Identity Dashboard | `crate::nara::identity::*`, `::kairos::*` |
| M5ChatPlugin | Agent Chat | `crate::agent::chat::*` |

---

## 9. Theming

### 9.1 Portal Theme Tokens

Extend the planned semantic theme system (from the 2026-03-07 ratatui startup plan) with portal-specific tokens:

| Token | Usage | Default (256-color) |
|-------|-------|-------------------|
| `portal.tab.active` | Active tab highlight | Cyan |
| `portal.tab.inactive` | Inactive tab | DarkGray |
| `portal.pane.focused_border` | Focused pane border | Cyan |
| `portal.pane.unfocused_border` | Unfocused pane border | DarkGray |
| `portal.pane.title` | Pane title text | White Bold |
| `portal.input.cursor` | Input cursor in PluginInput mode | Yellow |
| `portal.status.ok` | Healthy status indicator | Green |
| `portal.status.warn` | Warning indicator | Yellow |
| `portal.status.error` | Error indicator | Red |

### 9.2 M-Level Color Identity

Each M-level has a characteristic color used for its pane titles and accent elements:

| M-Level | Color | Rationale |
|---------|-------|-----------|
| M0' | Green | Ground, earth, #0 archetype color in existing TUI |
| M1' | Cyan | Mathematical precision, lemniscate color |
| M2' | Magenta | Vibrational energy, Shakti |
| M3' | Yellow | Symbolic, illumination |
| M4' | Red | Personal, embodied, Nara |
| M5' | White | Integration, all-colors, Epii |

These are accent colors only — the main UI uses neutral portal theme tokens.

---

## 10. Testing Strategy

### 10.1 Plugin Unit Tests

Each plugin gets render buffer tests using ratatui's `Buffer` API:

```rust
#[test]
fn m4_identity_plugin_renders_wound_status() {
    let plugin = M4IdentityPlugin::new_with_test_data(mock_kairos(), mock_profile());
    let area = Rect::new(0, 0, 60, 20);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    // Assert buffer contains expected text
    assert!(buf_contains(&buf, "Active decan:"));
    assert!(buf_contains(&buf, "Wound: true"));
}
```

### 10.2 Layout Persistence Tests

```rust
#[test]
fn workspace_roundtrip_serialization() {
    let workspace = create_default_workspace();
    let json = persist::save_to_string(&workspace);
    let restored = persist::load_from_string(&json);
    assert_eq!(workspace.tab_count(), restored.tab_count());
    assert_eq!(workspace.active_tab_index(), restored.active_tab_index());
}
```

### 10.3 Integration Tests

```rust
#[test]
fn portal_launches_with_default_layout() {
    let registry = build_test_registry();
    let workspace = load_or_default_workspace(&registry).unwrap();
    assert_eq!(workspace.tab_count(), 2);
    assert_eq!(workspace.tab_labels()[0].0, "M4'-M5' Personal");
    assert_eq!(workspace.tab_labels()[1].0, "M0'-M3' Structural");
}
```

### 10.4 Event Handling Tests

```rust
#[test]
fn tab_switch_moves_between_personal_and_structural() {
    let mut workspace = create_default_workspace();
    assert_eq!(workspace.active_tab_index(), 0); // Personal
    workspace.next_tab();
    assert_eq!(workspace.active_tab_index(), 1); // Structural
    workspace.prev_tab();
    assert_eq!(workspace.active_tab_index(), 0); // Back to Personal
}
```

### 10.5 What This Tests Pre-Electron

The portal serves as the integration test bed for all M' domain functionality before Electron development:

| Test Concern | Portal Coverage |
|-------------|----------------|
| Flow append/parse | M4FlowPlugin exercises full flow module |
| Oracle hygiene/consent | M4OraclePlugin exercises full oracle module |
| Kairos temporal authority | M4IdentityPlugin exercises kairos module |
| Coordinate rendering | M0DashboardPlugin exercises FFI bridge |
| Agent chat subprocess | M5ChatPlugin exercises agent lifecycle |
| Layout composition | Hypertile BSP tree operations |
| Cross-module data flow | StatusPlugin aggregates from all modules |

---

## 11. Implementation Phases

### Phase 1: Foundation
- Add hypertile crates to Cargo.toml
- Create `portal/mod.rs` with launch(), event loop, terminal lifecycle
- Create `portal/persist.rs` with save/load workspace JSON
- Create `portal/registry.rs` with plugin registration
- Create `portal/plugins/shared.rs` with HelpPlugin (simplest plugin — render-only)
- Wire `epi portal` command in main.rs
- Test: portal launches, shows help pane, saves/restores layout

### Phase 2: M4' Core Plugins (Personal Home)
- Create `portal/plugins/m4.rs`: IdentityPlugin, FlowPlugin, OraclePlugin
- Build default M4'-M5' tab layout
- Test: default layout renders, flow input works, oracle cast works

### Phase 3: M0'-M1' Structural Plugins
- Extract render logic from `tui/mod.rs` into shared widgets
- Create `portal/plugins/m0.rs`: DashboardPlugin, FamiliesPlugin
- Create `portal/plugins/m1.rs`: WalkPlugin
- Build default M0'-M3' tab layout
- Test: structural tab renders, torus walk works in pane

### Phase 4: Remaining M4' + M5' Plugins
- Create remaining m4 plugins: MedicinePlugin, TransformPlugin, LensPlugin, PratibimbaPlugin
- Create `portal/plugins/m5.rs`: LogosPlugin, ChatPlugin, M5FsmPlugin
- Create `portal/plugins/shared.rs`: StatusPlugin
- Test: all plugins render, cross-M status aggregation works

### Phase 5: Polish
- Theme tokens integrated with portal
- Command palette wired to plugin registry
- M-level color identity applied to pane borders
- M2/M3 stub plugins for future visualization work
- Documentation: keybindings, plugin development guide

---

## 12. File Summary

### New Files
```
epi-cli/src/portal/mod.rs                  — PortalCmd, launch(), event loop
epi-cli/src/portal/persist.rs              — Workspace JSON save/load
epi-cli/src/portal/registry.rs             — Plugin registry builder
epi-cli/src/portal/theme.rs                — Portal theme tokens
epi-cli/src/portal/plugins/mod.rs          — Plugin re-exports
epi-cli/src/portal/plugins/m0.rs           — M0' Anuttara plugins
epi-cli/src/portal/plugins/m1.rs           — M1' Paramasiva plugins
epi-cli/src/portal/plugins/m2.rs           — M2' Parashakti stub
epi-cli/src/portal/plugins/m3.rs           — M3' Mahamaya plugins
epi-cli/src/portal/plugins/m4.rs           — M4' Nara plugins (7 plugins)
epi-cli/src/portal/plugins/m5.rs           — M5' Epii plugins
epi-cli/src/portal/plugins/shared.rs       — Cross-M plugins
```

### Modified Files
```
epi-cli/Cargo.toml                         — Add hypertile crates
epi-cli/src/lib.rs                         — Add pub mod portal
epi-cli/src/main.rs                        — Add Portal command variant
epi-cli/src/tui/mod.rs                     — Extract render logic to shared widgets (Phase 3)
epi-cli/src/tui/knowing.rs                 — Extract render logic to shared widgets (Phase 3)
```

### Storage
```
~/.epi-logos/portal/
  workspace.json                            — Auto-saved last session layout
  defaults/
    m4m5-personal.json                      — Factory default M4'-M5' tab
    m0m3-structural.json                    — Factory default M0'-M3' tab
```

---

## 13. Success Criteria

1. `epi portal` launches in < 500ms and shows default M4' Nara layout
2. Tab switching between Personal and Structural is instant
3. Flow writer pane accepts input and appends to today's flow file
4. Oracle pane can cast (with consent gate) and display results
5. Identity pane shows current kairos state and refreshes on demand
6. Layout changes (split, resize, close) persist across portal sessions
7. All existing `epi core`, `epi nara`, `epi flow` CLI commands continue working unchanged
8. Portal renders correctly inside tmux with no key conflicts (Alt+ prefix)
9. Plugin render tests pass with ratatui Buffer assertions
10. Portal works at minimum terminal size 80×24

---

## Appendix A: Alternatives Considered

### A1: Build custom tiling from ratatui Layout primitives
- **Pro:** No new dependency, full control
- **Con:** Reimplementing BSP tree, focus management, resize, pane movement — hypertile already does this well
- **Rejected:** Not worth the effort when a purpose-built crate exists

### A2: Use zellij as the compositor
- **Pro:** Mature, battle-tested, plugin system
- **Con:** Zellij is a standalone terminal multiplexer, not an embeddable library. Would require each plugin to be a separate process, losing the in-process function call advantage.
- **Rejected:** Architectural mismatch — we need an embedded compositor, not a multiplexer

### A3: tui-realm (Elm/React-like framework)
- **Pro:** Component model, message passing, well-structured
- **Con:** Different paradigm from existing ratatui code, larger refactoring surface, no built-in tiling
- **Rejected:** Would require rewriting existing TUI code in a different paradigm

### A4: tmux session orchestration
- **Pro:** Real process isolation, can mix TUI and non-TUI tools
- **Con:** Loses composability (can't share state between panes in-process), requires tmux installation, complex subprocess management
- **Rejected for v1:** Noted as future scenario (C) for pane ejection
