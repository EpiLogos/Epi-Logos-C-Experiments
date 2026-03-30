# M3' Knowing Dossier — Portal Plugin TUI Specification

**Coordinate:** M3' — Mahamaya / Symbolic Transcription
**Status:** Canonical specification
**Date:** 2026-03-30
**Portal tab:** Tab 1 "M0'-M3' Structural"
**Replaces:** stub in `epi-cli/src/portal/plugins/m3.rs`

---

## 1. Role and Purpose

The M3' Knowing Dossier plugin is the interactive epistemic browser for the Mahamaya symbolic layer. It brings `epi core knowing <coord>` into the portal as a live, navigable pane — every coordinate in the six-family space becomes immediately inspectable without leaving the TUI.

On mount, the plugin reads `SharedClockState.current_degree` to suggest a starting coordinate: `tick12 % 6` maps to the C-family archetype position, giving a clock-grounded entry point into symbolic space.

---

## 2. Dependencies

| Module | Item used |
|--------|-----------|
| `epi-cli/src/core/knowing/mod.rs` | `build_family_dossier_with_mode()` |
| `epi-cli/src/core/knowing/types.rs` | `KnowingDossier`, `QvFacet` |
| `epi-cli/src/core/overlay.rs` | `QvOverlay`, `QvEntry` (5 fields) |
| `epi-cli/src/portal/clock_state.rs` | `SharedClockState`, `PortalClockState.current_degree` |

---

## 3. State Struct

```rust
pub struct M3KnowingPlugin {
    /// Raw text in the coordinate input bar
    coordinate_input: String,
    /// Whether the user is actively typing in the input bar
    input_mode: bool,
    /// Currently loaded dossier (None = not yet loaded or loading)
    dossier: Option<KnowingDossier>,
    /// QV overlay entry for the current coordinate
    qv_entry: Option<QvEntry>,
    /// Background fetch in progress
    loading: bool,
    /// Error from last fetch attempt
    error: Option<String>,
    /// Which panel has keyboard focus
    focus: PanelFocus,
    /// Selected row in Structural Correspondences panel
    struct_selected: usize,
    /// Selected row in Graph Relations panel
    relations_selected: usize,
    /// Selected row in Vimarsa Hits panel
    vimarsa_selected: usize,
    /// Scroll offset in Essence panel
    essence_scroll: usize,
    /// Selected row in Action bar
    actions_selected: usize,
    /// Navigation history (coordinate strings, LIFO)
    history: Vec<String>,
    /// Shared clock reference for tick12 → coordinate suggestion
    shared_clock: Option<SharedClockState>,
}

pub enum PanelFocus {
    CoordinateInput,
    Essence,
    QvFacets,
    Structural,
    Relations,
    Vimarsa,
    Actions,
}
```

---

## 4. Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Row 0: Length(3) — Coordinate Input Bar                              │
├──────────────────────────────────────────────────────────────────────┤
│ Row 1: Min(1) — Main Content                                         │
│  ┌──────────────────────────────────────┬─────────────────────────┐  │
│  │ Left 60%                             │ Right 40%               │  │
│  │  ┌───────────────────────────────┐   │  ┌───────────────────┐  │  │
│  │  │ Top 35%: Essence              │   │  │ Top 50%: QV Facets│  │  │
│  │  └───────────────────────────────┘   │  └───────────────────┘  │  │
│  │  ┌───────────────────────────────┐   │  ┌───────────────────┐  │  │
│  │  │ Bottom 65%: Structural        │   │  │ Bot 50%: Relations│  │  │
│  │  │             Correspondences   │   │  │         + Vimarsa │  │  │
│  │  └───────────────────────────────┘   │  └───────────────────┘  │  │
│  └──────────────────────────────────────┴─────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ Row 2: Length(3) — Action Bar                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### ratatui constraint definition

```rust
let rows = Layout::vertical([
    Constraint::Length(3),   // Row 0: coordinate input
    Constraint::Min(1),      // Row 1: main content
    Constraint::Length(3),   // Row 2: action bar
]).split(area);

let cols = Layout::horizontal([
    Constraint::Percentage(60),  // left: essence + structural
    Constraint::Percentage(40),  // right: qv + relations/vimarsa
]).split(rows[1]);

let left = Layout::vertical([
    Constraint::Percentage(35),  // essence
    Constraint::Percentage(65),  // structural correspondences
]).split(cols[0]);

let right = Layout::vertical([
    Constraint::Percentage(50),  // qv facets
    Constraint::Percentage(50),  // relations + vimarsa (split further if needed)
]).split(cols[1]);
```

---

## 5. Panel Specifications

### 5.1 Coordinate Input Bar (Row 0)

Single-line bordered block. Shows:

```
┌─ M3' Knowing Dossier ────────────────────────────────────────────────┐
│ Coord: [C3_______]   M3 · Mahamaya · degree 90   [↑/↓] history      │
└──────────────────────────────────────────────────────────────────────┘
```

- When `input_mode = true`: cursor visible, input highlighted in yellow border
- When `input_mode = false`: input text shown in cyan, border normal
- Status text (right of input): family name + degree from last loaded dossier
- `[↑/↓] history`: shows last `history.len()` coords available for recall
- Accepted formats: `C3`, `M4'`, `p2` — normalized via `parse_coordinate()` (see §8)
- On mount: auto-populated by `on_mount()` (see §7)

### 5.2 Essence Panel (Left 35%)

Block title: `Essence`. Border color: Yellow (M3' color).

Renders `KnowingDossier` fields:

```
branch_name: "Mahamaya"                        (bold, yellow)
phase:       "Pratibimba Mirror"               (if Some — italic, dim)

<essence.text, word-wrapped to panel width>    (normal white)

· · ·                                          (separator)
<notebook_pulse.text>                          (dim, gray — secondary text)
```

- `essence_scroll` tracks vertical scroll offset for long texts
- If `loading = true`: replace content with spinner `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` cycling in panel title: `Essence ⠸`
- If `error = Some(msg)`: show `[Error: <msg>]` in red

### 5.3 QV Facets Panel (Right 40%, top half)

Block title: `QV Facets`. No focus highlight (read-only).

Renders all 5 `QvEntry` fields in a fixed 2-column label:value layout:

```
QUADRATIC VIEW FACETS
──────────────────────────────────────────
essence:       "pithy one-line capture"
q_nature:      "ontological nature text"   (or · if None)
q_essence:     "essence text"
q_formulation: "formulation text"
q_structure:   "structure text"
```

- `·` (U+00B7 MIDDLE DOT) rendered in dim gray for None fields
- Label column: fixed 14 chars, right-padded
- Value column: wraps within remaining panel width
- Alt+q toggles this panel hidden on narrow terminals (< 80 columns)

### 5.4 Structural Correspondences Panel (Left 65%)

Block title: `Structural`. Focusable — `►` row cursor active.

Shows 6 rows, one per family, all at the same archetype position as the loaded coordinate:

```
  #  Family   Coordinate   Domain
  ─────────────────────────────────────────────
     C        C3           Process / Canvas
  ►  P        P3           Pattern
     S        S3           PAI
     T        T3           Process
     M        M3           Mahamaya
     L        L3           Archetypal
```

- `►` marks the currently selected row (navigated with ↑/↓)
- **Current family** (the loaded coordinate's family) shown with bold border on its row
- Family colors:
  - P → `Color::Magenta`
  - S → `Color::Cyan`
  - T → `Color::White`
  - M → `Color::Red`
  - L → `Color::Yellow`
  - C → `Color::Green`
- Enter on a row: navigate to that coordinate (push current to history, trigger load)
- Shows `Domain` text from the six-family table in CLAUDE.md

### 5.5 Graph Relations Panel (Right 40%, bottom quarter)

Block title: `Relations`. Focusable.

Shows Neo4j edges from `dossier.relational_field.items`:

```
→ MANIFESTS_AS   C3  (Process archetype)
← GROUNDS        M3  (Mahamaya root)
→ MIRRORS        C5  (Pratibimba)
```

- `→` outbound edge (green), `←` inbound edge (cyan)
- When Neo4j unavailable or `relational_field.items` empty:
  ```
  [Graph unavailable — Neo4j not connected]
  ```
  Shown in dim yellow, non-fatal.
- Navigate with ↑/↓ within this panel

### 5.6 Vimarsa Hits Panel (Right 40%, bottom quarter)

Block title: `Vimarsa`. Focusable.

Shows `dossier.vimarsa_field.items`, each as a single line:

```
  ► [0] "The mirror reflects without distortion..."
    [1] "Symbolic encoding precedes semantic..."
    [2] "Mahamaya as structured illusion..."
```

- Navigate with ↑/↓ or j/k
- Enter selects item for `o` (open) or `g` (glow) action
- Shows item index `[N]` in dim, text truncated to panel width

### 5.7 Action Bar (Row 2)

```
[r] Refresh   [o] Open   [g] Glow   [←] Back   [c] Copy   [?] Help
```

- Each action shown in brackets: enabled = white, disabled = dim gray
- Enabled states respect `KnowingDossier.actions` flags:
  - `o` (Open): enabled when vimarsa item selected
  - `g` (Glow preview): enabled when vimarsa item selected
  - `←` (Back): enabled when `history.len() > 0`
  - `c` (Copy): always enabled when coordinate loaded
  - `r` (Refresh): enabled when not already loading

---

## 6. Keyboard Map

| Key | Action |
|-----|--------|
| `i` or `/` | Enter input mode (focus CoordinateInput, set `input_mode = true`) |
| `Enter` | In input mode: load dossier for typed coordinate. In Structural panel: navigate to selected row. In Vimarsa: select item. |
| `Escape` | Cancel input mode without loading; return focus to last content panel |
| `Tab` | Cycle focus forward: Essence → QvFacets → Structural → Relations → Vimarsa → Actions → Essence |
| `Shift+Tab` | Cycle focus backward |
| `↑` / `k` | Navigate up within focused panel |
| `↓` / `j` | Navigate down within focused panel |
| `←` / `Backspace` | Pop `history` stack, navigate to previous coordinate |
| `r` | Refresh: re-trigger `build_family_dossier_with_mode()` for current coordinate in background |
| `o` | Open selected vimarsa item (external action) |
| `g` | Glow preview for selected vimarsa item |
| `Alt+q` | Toggle QV Facets panel visibility (for narrow terminals) |
| `c` | Copy current coordinate string to system clipboard |
| `?` | Show help overlay (keybindings summary) |

---

## 7. On-Mount and Clock Integration

```rust
fn on_mount(&mut self) {
    if self.coordinate_input.is_empty() {
        if let Some(ref clock) = self.shared_clock {
            let state = clock.lock().unwrap();
            let cf_sub = state.tick12 % 6;
            let suggested = format!("C{}", cf_sub);
            self.coordinate_input = suggested.clone();
            self.trigger_load(suggested);
        }
    }
    // Fallback if no clock state available
    if self.coordinate_input.is_empty() {
        self.coordinate_input = "C0".to_string();
        self.trigger_load("C0".to_string());
    }
}
```

**Rationale:** `tick12 % 6` maps the 12-position spanda ring to the 6 archetypal positions of the C-family. At `tick12 = 0`, the clock is at C0 (Bimba/Ground). At `tick12 = 7`, `7 % 6 = 1`, so C1 (Form) is suggested. This grounds the epistemic browser in the present moment of the cosmic clock.

---

## 8. Background Loading

Dossier fetches run in a background thread to avoid blocking the TUI event loop:

```rust
fn trigger_load(&mut self, coordinate: String) {
    self.loading = true;
    self.error = None;
    self.dossier = None;
    self.qv_entry = None;

    let tx = self.result_tx.clone();
    std::thread::spawn(move || {
        match build_family_dossier_with_mode(&coordinate, DossierMode::Full) {
            Ok(dossier) => { let _ = tx.send(LoadResult::Ok(dossier)); }
            Err(e)      => { let _ = tx.send(LoadResult::Err(e.to_string())); }
        }
    });
}

fn poll_load_result(&mut self) {
    if let Ok(result) = self.result_rx.try_recv() {
        self.loading = false;
        match result {
            LoadResult::Ok(dossier) => {
                self.qv_entry = overlay_entry(&dossier.coordinate);
                self.dossier = Some(dossier);
            }
            LoadResult::Err(msg) => { self.error = Some(msg); }
        }
    }
}
```

**Loading spinner:** While `loading = true`, the Essence panel title cycles through `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` at 100ms intervals driven by `HypertileEvent::Tick`.

---

## 9. Coordinate Parser

```rust
/// Returns (family_id, archetype_pos, is_inverted)
/// family_id: C=0, P=1, L=2, S=3, T=4, M=5
fn parse_coordinate(input: &str) -> Option<(u8, u8, bool)> {
    let s = input.trim().to_uppercase();
    let inverted = s.ends_with('\'');
    let s = s.trim_end_matches('\'');
    if s.len() < 2 { return None; }
    let family = match s.chars().next()? {
        'C' => 0,
        'P' => 1,
        'L' => 2,
        'S' => 3,
        'T' => 4,
        'M' => 5,
        _   => return None,
    };
    let pos: u8 = s[1..].parse().ok()?;
    if pos > 5 { return None; }
    Some((family, pos, inverted))
}
```

Valid inputs: `C3`, `c3`, `M4'`, `m4'`, `P5'`, `p5`. Invalid: `X9`, `C6`, `M`, ``.

---

## 10. Registry Wiring

In `epi-cli/src/portal/mod.rs`:

```rust
let clock_ref = clock.clone();
runtime.register_plugin_type("m3.knowing", move || {
    m3::M3KnowingPlugin::new_with_clock(clock_ref.clone())
});
```

Plugin must implement:
```rust
impl M3KnowingPlugin {
    pub fn new_with_clock(clock: SharedClockState) -> Self { ... }
}
```

---

## 11. Minimum Terminal Size

The plugin must degrade gracefully at 60×20 (columns × rows):
- QV facets panel hidden by default below 80 columns (same behavior as `Alt+q`)
- Structural correspondences collapses to 2 columns (coordinate + family letter)
- Action bar abbreviates: `[r][o][g][←][?]`
- Essence panel uses single-line truncation below 10 rows

---

## 12. Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn coordinate_parser_handles_inverted_and_lowercase() {
        assert_eq!(parse_coordinate("c3"),   Some((0, 3, false)));
        assert_eq!(parse_coordinate("M4'"),  Some((5, 4, true)));
        assert_eq!(parse_coordinate("P5'"),  Some((1, 5, true)));
        assert_eq!(parse_coordinate("X9"),   None);
        assert_eq!(parse_coordinate("C6"),   None);  // pos > 5
        assert_eq!(parse_coordinate(""),     None);
        assert_eq!(parse_coordinate("C"),    None);  // no pos digit
        assert_eq!(parse_coordinate("S0"),   Some((3, 0, false)));
        assert_eq!(parse_coordinate("l2'"),  Some((2, 2, true)));
    }

    #[test]
    fn on_mount_uses_clock_tick12_mod6() {
        let clock = SharedClockState::new_with_tick12(7);
        let mut plugin = M3KnowingPlugin::new_with_clock(clock);
        // tick12=7, 7%6=1, should suggest C1
        plugin.on_mount();
        assert_eq!(plugin.coordinate_input, "C1");
    }

    #[test]
    fn on_mount_falls_back_to_c0_without_clock() {
        let mut plugin = M3KnowingPlugin::new_bare();
        plugin.on_mount();
        assert_eq!(plugin.coordinate_input, "C0");
    }

    #[test]
    fn history_push_and_pop() {
        let mut plugin = M3KnowingPlugin::new_bare();
        plugin.history.push("C0".to_string());
        plugin.history.push("C3".to_string());
        let prev = plugin.history.pop().unwrap();
        assert_eq!(prev, "C3");
        assert_eq!(plugin.history.len(), 1);
    }
}
```

---

## 13. Success Criteria

1. Coordinate input bar renders with `Coord: [...]` prefix and live status text
2. Enter triggers background dossier load; spinner shows in Essence panel title during fetch
3. All 6 structural correspondences display with correct family colors
4. QV facets panel shows all 5 fields; `·` rendered (not empty string) for None fields
5. Selecting a structural row with Enter navigates to that coordinate and pushes history
6. `←` / Backspace navigates back through history stack
7. Clock auto-suggests `C{tick12%6}` on mount when SharedClockState available
8. Neo4j unavailable renders `[Graph unavailable]` gracefully — no panic, no blank pane
9. Plugin renders without panic at 60×20 minimum terminal size
10. `r` refreshes in background without freezing the TUI event loop

---

*Spec version: 1.0 — Canonical for M3' plugin implementation.*
