# Ratatui Startup Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a viewport-adaptive Ratatui startup screen with responsive ASCII, semantic theme tokens, config-driven theming, and graceful terminal capability fallback for `epi-cli`.

**Architecture:** Build this as a shared TUI foundation inside `epi-cli/src/tui/` rather than a one-off splash patch. Keep the terminal/event-loop code in [`epi-cli/src/tui/mod.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/mod.rs), but move all testable logic into pure modules: viewport classification, ASCII asset selection, semantic theme resolution, layout helpers, and splash rendering. Resolve theme values from built-in defaults, then config, then environment, then clamp them based on terminal capability and `NO_COLOR`.

**Tech Stack:** Rust 2021, ratatui 0.29, crossterm 0.28, serde, dirs, toml, optional `palette` for RGB interpolation if truecolor gradients are kept.

**Scope Assumptions:**
- First shipping target is `epi core dashboard`; the primitives are reusable by `run_walk`, `run_families`, `run_m5`, and `agent/chat` afterward.
- Config file path is `~/.config/epi/theme.toml`.
- `NO_COLOR=1` disables gradients, glow, and non-essential modifiers.
- Skip animation in the first pass except for a static glow/shadow toggle. Add pulsing only if the splash is stable and cheap to render.

**Recommendation:** Implement the middle path.
- Option A: patch a splash straight into [`epi-cli/src/tui/mod.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/mod.rs). Fastest, but it hardcodes more colors and is hard to test.
- Option B: create shared theme/ascii/layout/splash modules and integrate the startup screen into the dashboard first. Best balance of reuse, testability, and delivery speed.
- Option C: introduce a full TUI scene manager covering every Ratatui surface now. Cleanest long-term, but too much scope for the current change.

---

## Phase 1: Shared TUI Foundation

### Task 1: Create the TUI startup-screen module boundaries

**Files:**
- Create: `epi-cli/src/tui/ascii.rs`
- Create: `epi-cli/src/tui/theme.rs`
- Create: `epi-cli/src/tui/layout.rs`
- Create: `epi-cli/src/tui/splash.rs`
- Modify: `epi-cli/src/tui/mod.rs`

**Step 1: Write the failing module-level tests**

Add `#[cfg(test)]` tests in the new files for:

```rust
#[test]
fn picks_mini_logo_for_short_viewports() {
    let area = Rect::new(0, 0, 80, 18);
    assert_eq!(AsciiSize::from_viewport(area), AsciiSize::Mini);
}

#[test]
fn centers_child_rect_without_overflow() {
    let area = Rect::new(0, 0, 80, 24);
    let child = centered_rect(area, 20, 5);
    assert_eq!(child.width, 20);
    assert_eq!(child.height, 5);
    assert!(child.x >= area.x);
    assert!(child.y >= area.y);
}
```

**Step 2: Run the new tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi picks_mini_logo_for_short_viewports -- --exact`
Expected: FAIL because the new modules and functions do not exist yet.

**Step 3: Add the module declarations**

Update [`epi-cli/src/tui/mod.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/mod.rs) to declare:

```rust
mod ascii;
mod layout;
mod splash;
mod theme;
```

Add minimal skeletons for:
- `AsciiSize`
- `centered_rect`
- `SplashWidget`
- `Theme`

Keep them pure and free of terminal I/O.

**Step 4: Re-run the tests until the skeleton compiles**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi picks_mini_logo_for_short_viewports -- --exact`
Expected: PASS with minimal logic in place.

**Step 5: Commit**

```bash
git add epi-cli/src/tui/mod.rs epi-cli/src/tui/ascii.rs epi-cli/src/tui/layout.rs epi-cli/src/tui/splash.rs epi-cli/src/tui/theme.rs
git commit -m "feat(tui): scaffold startup screen modules"
```

---

### Task 2: Implement semantic theme tokens and configuration resolution

**Files:**
- Modify: `epi-cli/Cargo.toml`
- Create: `epi-cli/src/tui/theme.rs`

**Step 1: Write failing tests for theme resolution**

In [`epi-cli/src/tui/theme.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/theme.rs), add tests for:

```rust
#[test]
fn no_color_disables_decorative_effects() {
    let env = ThemeEnv {
        no_color: true,
        colorfgbg: None,
        term_program: None,
    };
    let theme = Theme::resolve(ThemeConfig::default(), env);
    assert_eq!(theme.logo_gradient.len(), 1);
    assert!(!theme.glow_effect);
}

#[test]
fn config_hex_values_override_builtin_palette() {
    let config = ThemeConfig {
        colors: ThemeColorConfig {
            primary: Some("#cba6f7".into()),
            text: Some("#f5e0dc".into()),
            logo_gradient: vec!["#f5c2e7".into(), "#89dceb".into()],
            ..Default::default()
        },
        ascii: AsciiConfig::default(),
    };
    let theme = Theme::resolve(config, ThemeEnv::default());
    assert_eq!(theme.primary, Color::Rgb(203, 166, 247));
    assert_eq!(theme.logo_gradient.len(), 2);
}
```

**Step 2: Run a focused failure**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi no_color_disables_decorative_effects -- --exact`
Expected: FAIL because config parsing and token resolution are incomplete.

**Step 3: Add the minimal dependency surface**

Update [`epi-cli/Cargo.toml`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/Cargo.toml) to add:

```toml
toml = "0.8"
```

Only add `palette` if you keep truecolor interpolation in the first pass:

```toml
palette = "0.7"
```

Avoid `figment` for now; simple source precedence is sufficient and keeps the startup path small.

**Step 4: Implement semantic tokens and resolver**

Implement in [`epi-cli/src/tui/theme.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/theme.rs):
- `Theme` with semantic tokens:
  - `primary`
  - `secondary`
  - `accent`
  - `surface`
  - `text`
  - `muted`
  - `logo_gradient`
  - `glow_effect`
- `ThemeConfig` and nested config structs using `serde::Deserialize`
- `ThemeEnv` for `NO_COLOR`, `COLORFGBG`, and `TERM_PROGRAM`
- `Theme::builtin_dark()` and `Theme::builtin_light()`
- `Theme::resolve(config, env)`
- `load_theme_config()` using `dirs::config_dir()`
- `detect_dark_background()` with conservative parsing of `COLORFGBG`

Clamp behavior:
- If `NO_COLOR` is present, return a single-color theme with no glow and no gradient.
- If the config provides invalid hex, return an error instead of silently defaulting.
- If terminal background cannot be detected, use the dark built-in theme.

**Step 5: Verify with real tests**

Run:
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi config_hex_values_override_builtin_palette -- --exact`
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi no_color_disables_decorative_effects -- --exact`

Expected: PASS, with no filesystem mocking required for the pure resolver tests.

**Step 6: Commit**

```bash
git add epi-cli/Cargo.toml epi-cli/src/tui/theme.rs
git commit -m "feat(tui): add semantic theme tokens and config resolution"
```

---

## Phase 2: Responsive ASCII and Rendering

### Task 3: Build the responsive ASCII asset model

**Files:**
- Create: `epi-cli/src/tui/ascii.rs`

**Step 1: Write failing tests for asset selection and integrity**

Add tests for:

```rust
#[test]
fn full_logo_is_used_for_tall_viewports() {
    let area = Rect::new(0, 0, 120, 42);
    assert_eq!(AsciiSize::from_viewport(area), AsciiSize::Full);
}

#[test]
fn every_logo_variant_has_stable_line_widths() {
    for variant in [AsciiSize::Mini, AsciiSize::Small, AsciiSize::Full] {
        let lines = variant.lines();
        let max = lines.iter().map(|line| line.text.chars().count()).max().unwrap();
        assert!(max > 0);
        assert!(lines.iter().all(|line| line.text.chars().count() <= max));
    }
}
```

**Step 2: Run the failure**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi full_logo_is_used_for_tall_viewports -- --exact`
Expected: FAIL until the ASCII catalog exists.

**Step 3: Implement the asset catalog**

In [`epi-cli/src/tui/ascii.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/ascii.rs), add:

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AsciiSize {
    Mini,
    Small,
    Full,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StyleToken {
    Primary,
    Accent,
    Muted,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AsciiLine {
    pub text: &'static str,
    pub style_mask: &'static [StyleToken],
}
```

Provide:
- `AsciiSize::from_viewport(area: Rect) -> Self`
- `AsciiSize::lines(&self) -> &'static [AsciiLine]`
- `AsciiSize::dimensions(&self) -> (u16, u16)`

Rules:
- Keep logo lines stored as arrays, not a single `&str`.
- Keep `style_mask` optional in practice by allowing empty slices for now.
- Make each variant visually distinct but semantically identical.
- Do not introduce per-character rainbow logic in the first pass.

**Step 4: Verify the asset model**

Run:
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi full_logo_is_used_for_tall_viewports -- --exact`
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi every_logo_variant_has_stable_line_widths -- --exact`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/tui/ascii.rs
git commit -m "feat(tui): add responsive ascii catalog"
```

---

### Task 4: Render the splash widget into a real Ratatui buffer

**Files:**
- Create: `epi-cli/src/tui/layout.rs`
- Create: `epi-cli/src/tui/splash.rs`

**Step 1: Write failing render-buffer tests**

Use Ratatui’s real `Buffer` and `TestBackend` instead of mocks:

```rust
#[test]
fn renders_mini_logo_inside_small_viewport() {
    let area = Rect::new(0, 0, 40, 12);
    let theme = Theme::builtin_dark();
    let widget = SplashWidget::new(theme);
    let mut buffer = Buffer::empty(area);

    widget.render(area, &mut buffer);

    let rendered = buffer
        .content()
        .iter()
        .map(|cell| cell.symbol())
        .collect::<String>();
    assert!(rendered.contains("┬"));
}

#[test]
fn no_color_theme_renders_without_shadow_offset() {
    let area = Rect::new(0, 0, 80, 24);
    let theme = Theme::builtin_dark().without_color();
    let widget = SplashWidget::new(theme);
    let mut buffer = Buffer::empty(area);

    widget.render(area, &mut buffer);

    // Assert that only the centered logo cells are styled, with no duplicate shadow glyphs.
    assert!(!buffer.content().iter().any(|cell| cell.modifier.contains(Modifier::DIM)));
}
```

**Step 2: Run a focused failure**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi renders_mini_logo_inside_small_viewport -- --exact`
Expected: FAIL because the widget does not exist yet.

**Step 3: Implement layout helpers**

In [`epi-cli/src/tui/layout.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/layout.rs), add:
- `centered_rect(parent: Rect, width: u16, height: u16) -> Rect`
- `stacked_centered_rect(parent: Rect, content_height: u16, footer_height: u16) -> (Rect, Rect)`

Clamp width/height so the centered rect never exceeds the viewport.

**Step 4: Implement `SplashWidget`**

In [`epi-cli/src/tui/splash.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/splash.rs), add:
- `SplashWidget`
- `StyledAscii`
- line-level color selection from `Theme::logo_gradient`
- optional single-cell shadow/glow using `theme.muted`
- optional subtitle and version line when viewport height allows

Keep this renderer pure:
- input: `Rect`, `Theme`, ASCII lines, optional frame tick
- output: `Buffer` mutations only

Do not read environment variables from the render path.

**Step 5: Verify with render tests**

Run:
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi renders_mini_logo_inside_small_viewport -- --exact`
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi no_color_theme_renders_without_shadow_offset -- --exact`

Expected: PASS with real Ratatui buffer inspection.

**Step 6: Commit**

```bash
git add epi-cli/src/tui/layout.rs epi-cli/src/tui/splash.rs
git commit -m "feat(tui): render responsive startup splash widget"
```

---

## Phase 3: Integration Into the Existing App

### Task 5: Add startup-screen state to the dashboard event loop

**Files:**
- Modify: `epi-cli/src/tui/mod.rs`

**Step 1: Write a failing state-transition test**

Add a test for the splash gate:

```rust
#[test]
fn splash_gate_expires_after_timeout() {
    let gate = SplashGate::new(Duration::from_millis(1200));
    assert!(gate.is_visible_at(Duration::from_millis(0)));
    assert!(!gate.is_visible_at(Duration::from_millis(1300)));
}
```

Keep the gate time-based and deterministic so it can be tested without sleeping.

**Step 2: Run the failure**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi splash_gate_expires_after_timeout -- --exact`
Expected: FAIL because `SplashGate` does not exist.

**Step 3: Integrate the splash state**

In [`epi-cli/src/tui/mod.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/mod.rs):
- add `SplashGate` state to the dashboard app
- resolve the theme once during startup
- render the splash screen before the dashboard body while the gate is visible
- allow dismissal on any navigation key, `Enter`, `Space`, `Esc`, or timeout

Recommended first-pass behavior:
- show the splash for up to 1200 ms
- allow immediate skip by input
- do not block event polling

Keep the event loop ownership unchanged:
- `run_dashboard()` still owns raw mode and alternate screen
- the splash is just another render state, not a separate terminal mode

**Step 4: Verify in a real terminal**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo run --bin epi -- core dashboard`
Expected:
- startup splash appears centered
- short terminals show the mini/small logo instead of clipping
- after timeout or keypress, the normal dashboard appears
- quitting still restores the terminal cleanly

**Step 5: Commit**

```bash
git add epi-cli/src/tui/mod.rs
git commit -m "feat(tui): add startup splash to dashboard"
```

---

### Task 6: Replace hardcoded TUI colors with semantic tokens where the splash touches shared chrome

**Files:**
- Modify: `epi-cli/src/tui/mod.rs`
- Modify: `epi-cli/src/agent/chat.rs`

**Step 1: Write a failing token-mapping test**

Add a focused style test around a small helper:

```rust
#[test]
fn selected_row_uses_theme_accent_tokens() {
    let theme = Theme::builtin_dark();
    let style = theme.selected_style();
    assert_eq!(style.bg, Some(theme.accent));
}
```

**Step 2: Run the failure**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi selected_row_uses_theme_accent_tokens -- --exact`
Expected: FAIL until style helpers exist.

**Step 3: Apply semantic styles**

Replace direct `Color::Cyan`, `Color::Green`, `Color::Magenta`, `Color::DarkGray`, and similar hardcoded values in the startup-adjacent chrome with helper methods from [`epi-cli/src/tui/theme.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/tui/theme.rs):
- selected rows
- borders
- muted labels
- headers
- footer hints

Also update [`epi-cli/src/agent/chat.rs`](/Users/admin/Documents/Epi-Logos%20C%20Experiments/epi-cli/src/agent/chat.rs) to use the same theme tokens for header, user messages, and body text. This proves the theme system is shared instead of splash-only.

Do not try to convert every TUI surface in one commit. Touch the surfaces that share the startup-screen look and leave the rest for a follow-up.

**Step 4: Verify visually and by test**

Run:
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test --bin epi selected_row_uses_theme_accent_tokens -- --exact`
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo run --bin epi -- core dashboard`
- `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo run --bin epi -- agent chat --help`

Expected: PASS, and the dashboard/chat chrome no longer depends on direct color constants for the touched areas.

**Step 5: Commit**

```bash
git add epi-cli/src/tui/mod.rs epi-cli/src/agent/chat.rs
git commit -m "refactor(tui): replace startup-adjacent hardcoded colors with theme tokens"
```

---

## Phase 4: Verification and Hardening

### Task 7: Run the full verification matrix

**Files:**
- No new files unless verification reveals gaps

**Step 1: Run targeted unit and render tests**

Run:

```bash
cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli
cargo test --bin epi picks_mini_logo_for_short_viewports -- --exact
cargo test --bin epi config_hex_values_override_builtin_palette -- --exact
cargo test --bin epi renders_mini_logo_inside_small_viewport -- --exact
cargo test --bin epi splash_gate_expires_after_timeout -- --exact
```

Expected: PASS.

**Step 2: Run the entire Rust test suite**

Run: `cd /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli && cargo test`
Expected: PASS. If unrelated graph tests already fail in the branch, document that clearly and re-run `cargo test --bin epi` plus the targeted startup-screen tests.

**Step 3: Run the manual terminal matrix**

Run these manual checks:
- `TERM=xterm-256color cargo run --bin epi -- core dashboard`
- `TERM=xterm cargo run --bin epi -- core dashboard`
- `NO_COLOR=1 cargo run --bin epi -- core dashboard`

Expected:
- `xterm-256color`: semantic colors render, gradient collapses cleanly if unsupported
- `xterm`: splash still renders legibly without relying on truecolor assumptions
- `NO_COLOR=1`: monochrome logo, no glow, still centered and readable

**Step 4: Document any terminal-specific caveats**

If `COLORFGBG` is unreliable on the current machine, record the fallback behavior in code comments or follow-up notes. Do not add terminal-specific hacks without a real failing case.

**Step 5: Commit**

```bash
git add epi-cli/Cargo.toml epi-cli/src/tui/mod.rs epi-cli/src/tui/ascii.rs epi-cli/src/tui/layout.rs epi-cli/src/tui/splash.rs epi-cli/src/tui/theme.rs epi-cli/src/agent/chat.rs
git commit -m "test(tui): verify responsive startup screen across terminal modes"
```

---

## Implementation Notes

### Recommended type boundaries

```rust
pub struct Theme {
    pub primary: Color,
    pub secondary: Color,
    pub accent: Color,
    pub surface: Color,
    pub text: Color,
    pub muted: Color,
    pub logo_gradient: Vec<Color>,
    pub glow_effect: bool,
}

pub struct ThemeEnv {
    pub no_color: bool,
    pub colorfgbg: Option<String>,
    pub term_program: Option<String>,
}

pub struct SplashWidget {
    theme: Theme,
    frame_tick: Option<u64>,
}
```

### Explicit non-goals for the first pass

- Full per-character rainbow mode
- Animation tied to wall-clock time inside the widget
- Converting every existing TUI surface to the new theme system immediately
- Auto-detecting every terminal emulator under the sun

### Risk controls

- Keep render code pure and environment-free.
- Keep config loading outside the render loop.
- Fail loudly on invalid config rather than silently corrupting theme output.
- Use Ratatui buffer assertions for layout and style checks, not string-only snapshot tests.

Plan complete and saved to `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-ratatui-startup-screen-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
