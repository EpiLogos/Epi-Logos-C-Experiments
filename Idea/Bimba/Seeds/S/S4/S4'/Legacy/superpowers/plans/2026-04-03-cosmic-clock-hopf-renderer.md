# Cosmic Clock Hopf Fibration Renderer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the cosmic clock renderer as a proper Hopf fibration visualization with geocentric Earth-centered model, real kerykeion planet data, smooth 30fps interaction, camera controls, and a data panel showing planet positions/time/controls.

**Architecture:** The torus IS the Hopf fiber bundle: θ (major circle) = ecliptic degree (base space S²), φ (minor circle) = spanda substage 0–11 (fiber S¹). R/r = 16/9 (epogdoon ratio). Earth at center. Rendering uses back-to-front painter's algorithm (no z-buffer) for speed. Plugin splits area into 75% torus view + 25% data panel. The data panel is a standard ratatui widget rendered directly into the buffer (no offscreen rendering needed).

**Tech Stack:** Rust (epi-cli), tiny-skia 0.12, ratatui-image 10, ab_glyph 0.2, image 0.25, ratatui 0.30

**Spec:** `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-03-cosmic-clock-hopf-renderer-design.md`

**Parallel execution:** Tasks 0-1 are sequential (foundation). Tasks 2-3 can be parallelized (renderer + panel). Task 4 is integration. Task 5 is final verification.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `epi-cli/src/portal/clock_renderer.rs` | **Rewrite** | Hopf-correct torus geometry, back-to-front rendering, all overlays |
| `epi-cli/src/portal/plugins/unified_clock.rs` | **Rewrite** | Split layout (torus+panel), camera state, controls, adaptive FPS, data panel widget |
| `epi-cli/src/portal/clock_state.rs` | Minor modify | Add `auto_rotate: bool` field |
| `epi-cli/src/portal/mod.rs` | No change | Tab structure already correct |

---

## Task 0: Camera State and Clock State Additions

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs`

- [ ] **Step 1: Add zoom_level field to PortalClockState**

After the `generation` field (line ~485), add:

```rust
    /// Perspective zoom level. 1.0 = default, <1 = zoomed in, >1 = zoomed out.
    pub zoom_level:              f32,
```

In the `Default` impl, add before the closing brace:

```rust
            zoom_level:              1.0,
```

- [ ] **Step 2: Build to verify**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished`

- [ ] **Step 3: Run existing tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state 2>&1 | tail -5`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): add zoom_level to PortalClockState"
```

---

## Task 1: Rewrite clock_renderer.rs — Hopf-Correct Torus

**Files:**
- Rewrite: `epi-cli/src/portal/clock_renderer.rs`

This is the core task. The renderer must model the actual Hopf fibration geometry with back-to-front rendering for 30fps.

- [ ] **Step 1: Write the complete rewritten clock_renderer.rs**

The file keeps: `FONT_BYTES`, `ELEMENT_COLORS`, `PLANET_COLORS`, `ZODIAC_GLYPHS`, `PLANET_GLYPHS`, `ASPECT_COLORS`, quaternion helpers (`quat_mul_norm`, `quat_from_axis_angle`, `quat_rotate`), draw primitives (`put_pixel`, `paint_dot`, `draw_line`, `burn_char`).

**Changes to make:**

**A) Fix `sign_to_element` — current implementation is wrong:**
```rust
/// Map zodiac sign (0-11) to element index.
/// Fire signs: Aries(0), Leo(4), Sagittarius(8)
/// Earth signs: Taurus(1), Virgo(5), Capricorn(9)
/// Air signs: Gemini(2), Libra(6), Aquarius(10)
/// Water signs: Cancer(3), Scorpio(7), Pisces(11)
fn sign_to_element(sign: u8) -> u8 {
    match sign % 12 {
        0 | 4 | 8  => 0, // Fire
        1 | 5 | 9  => 1, // Earth
        2 | 6 | 10 => 2, // Air
        3 | 7 | 11 => 3, // Water
        _ => 0,
    }
}
```

**B) Add sign name tables:**
```rust
const SIGN_NAMES: [&str; 12] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const PLANET_NAMES: [&str; 10] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];
```

**C) Replace `render_clock` signature — add `view_q` and `zoom`:**
```rust
pub fn render_clock(
    width: u32,
    height: u32,
    state: &crate::portal::clock_state::PortalClockState,
    view_q: [f32; 4],
    zoom: f32,
) -> Option<Pixmap> {
```

**D) Fix torus geometry — R/r = 16/9 epogdoon ratio:**
```rust
    let scale = w.min(h) * 0.5 * 0.85;
    let r_maj = scale * (16.0 / 25.0);  // R: 16 parts of 25
    let r_min = scale * (9.0 / 25.0);   // r: 9 parts of 25 → R/r = 16/9
    let dist = scale * 3.5 * zoom;      // perspective distance, zoom-adjustable
```

**E) Compose view quaternion with clock state quaternion:**
```rust
    let q = quat_mul_norm(view_q, state.composed_quaternion);
```

**F) Back-to-front rendering for speed — replace z-buffer with sorted rendering:**

Instead of iterating theta 0→360 and using z-buffer, sort by depth:

```rust
    // Back-to-front rendering: compute depth for each theta, sort, render back first
    let theta_steps = 360u32;
    let phi_steps = 36u32; // 36 = 3× per spanda tick, good density

    // Pre-compute depth for each theta to sort back-to-front
    let mut theta_order: Vec<u32> = (0..theta_steps).collect();
    theta_order.sort_by(|&a, &b| {
        let ta = (a as f32) * std::f32::consts::TAU / theta_steps as f32;
        let tb = (b as f32) * std::f32::consts::TAU / theta_steps as f32;
        // Depth of equator point at this theta
        let (_, _, za) = quat_rotate(q, r_maj * ta.cos(), r_maj * ta.sin(), 0.0);
        let (_, _, zb) = quat_rotate(q, r_maj * tb.cos(), r_maj * tb.sin(), 0.0);
        za.partial_cmp(&zb).unwrap_or(std::cmp::Ordering::Equal)
    });

    for &ti in &theta_order {
        let theta = (ti as f32) * std::f32::consts::TAU / theta_steps as f32;
        let degree = ti as u16;
        let sign = (degree / 30) as u8 % 12;
        let elem = sign_to_element(sign);

        for pi_step in 0..phi_steps {
            let phi = (pi_step as f32) * std::f32::consts::TAU / phi_steps as f32;
            let tick = ((pi_step * 12) / phi_steps) as u8;

            let x0 = (r_maj + r_min * phi.cos()) * theta.cos();
            let y0 = (r_maj + r_min * phi.cos()) * theta.sin();
            let z0 = r_min * phi.sin();
            let (rx, ry, rz) = quat_rotate(q, x0, y0, z0);

            // Perspective
            let w_proj = dist / (dist - rz);
            let sx = (cx + rx * w_proj) as i32;
            let sy = (cy - ry * w_proj) as i32;
            if sx < 0 || sy < 0 || sx >= width as i32 || sy >= height as i32 { continue; }

            // Normal for Lambertian shading
            let nx0 = theta.cos() * phi.cos();
            let ny0 = theta.sin() * phi.cos();
            let nz0 = phi.sin();
            let (_, _, nrz) = quat_rotate(q, nx0, ny0, nz0);
            let illum = (nrz * 0.7 + 0.4).clamp(0.0, 1.0);

            let color = surface_color(elem, tick, tick12, resolution_level, illum);
            put_pixel(pixmap.data_mut(), width, height, sx, sy, color[0], color[1], color[2]);
        }
    }
```

This eliminates the z-buffer allocation and per-pixel depth test entirely.

**G) Scale all overlay elements proportionally:**

All `paint_dot` radius values and `burn_char` font sizes must scale with `r_min`:
```rust
let dot_scale = (r_min * 0.05) as i32;  // base dot size
let glyph_size = (r_min * 0.35).max(12.0).min(48.0);
```

**H) Add `equator_project` helper with back-face culling return:**
```rust
fn equator_project(
    degree: f32, q: [f32; 4], r_maj: f32, r_min_scale: f32,
    cx: f32, cy: f32, dist: f32,
) -> (i32, i32, f32) {
    let theta = degree * std::f32::consts::PI / 180.0;
    let r = r_maj * r_min_scale;  // r_min_scale is a multiplier, not r_min itself
    let (rx, ry, rz) = quat_rotate(q, r * theta.cos(), r * theta.sin(), 0.0);
    let w = dist / (dist - rz);
    ((cx + rx * w) as i32, (cy - ry * w) as i32, rz)
}
```

Wait — the current `equator_project` passes `r_min * factor` as `r_min` param but uses it as `r_maj + r_min`. Let me check and fix. The correct equator_project for a point ON the torus equator (φ=0) should use `r_maj + r_min` as the radius:

```rust
fn equator_project(
    degree: f32, q: [f32; 4], r_maj: f32, r_min: f32,
    r_offset: f32, // multiplier: 1.0 = equator, 1.25 = outside, 0.75 = inside
    cx: f32, cy: f32, dist: f32,
) -> (i32, i32, f32) {
    let theta = degree * std::f32::consts::PI / 180.0;
    let r = r_maj + r_min * r_offset;
    let (rx, ry, rz) = quat_rotate(q, r * theta.cos(), r * theta.sin(), 0.0);
    let w = dist / (dist - rz);
    ((cx + rx * w) as i32, (cy - ry * w) as i32, rz)
}
```

**I) Update all overlay functions to use the new equator_project signature** and pass `r_offset` correctly:
- Backbone rings: `r_offset = 1.0` (on equator)
- Planet markers: `r_offset = 1.3` (outside)
- Natal ghosts: `r_offset = 0.7` (inside)
- Zodiac glyphs: `r_offset = 1.8` (well outside)
- Planet glyphs: `r_offset = 1.5` (between planets and zodiac)
- Oracle markers: `r_offset = 1.15` (just outside)

**J) Keep all existing overlay functions** (`render_backbone_rings`, `render_planets`, `render_aspect_lines`, `render_oracle_markers`, `burn_labels`) but update their signatures to match the new `equator_project`. Scale dot sizes and glyph sizes proportionally to `r_min`.

- [ ] **Step 2: Update tests for new signature**

```rust
    #[test]
    fn render_clock_produces_non_empty_pixmap() {
        use crate::portal::clock_state::PortalClockState;
        let state = PortalClockState::default();
        let identity_q = [1.0f32, 0.0, 0.0, 0.0];
        let pixmap = render_clock(400, 400, &state, identity_q, 1.0);
        assert!(pixmap.is_some(), "render_clock returned None");
        let pixmap = pixmap.unwrap();
        let data = pixmap.data();
        let non_bg = data.chunks(4).any(|px| !(px[0] == 10 && px[1] == 10 && px[2] == 15));
        assert!(non_bg, "All pixels are background color");
    }
```

- [ ] **Step 3: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_renderer 2>&1 | tail -10`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_renderer.rs
git commit -m "feat(clock): Hopf-correct torus renderer with back-to-front painting, epogdoon ratio"
```

---

## Task 2: Data Panel Widget

**Files:**
- Modify: `epi-cli/src/portal/plugins/unified_clock.rs` (add panel rendering function)

The data panel is a plain ratatui widget that renders into a `Rect` on the right side. No offscreen rendering — it writes directly to the ratatui `Buffer`.

- [ ] **Step 1: Add the data panel render function**

Add this function to `unified_clock.rs`:

```rust
use ratatui::widgets::{Block, Borders, Paragraph};

fn render_data_panel(
    area: Rect,
    buf: &mut Buffer,
    state: &crate::portal::clock_state::PortalClockState,
    auto_rotate: bool,
) {
    let sign_names = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];
    let planet_glyphs = ['☉','☽','☿','♀','♂','♃','♄','♅','♆','♇'];
    let planet_names = [
        "Sun", "Moon", "Mercury", "Venus", "Mars",
        "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    ];
    let zodiac_glyphs = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

    let mut lines: Vec<Line> = Vec::new();

    // Title
    lines.push(Line::from(Span::styled(
        " Cosmic Clock",
        Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(""));

    // Timestamp
    if state.kairos.valid {
        let ts = state.kairos.timestamp;
        if ts > 0 {
            lines.push(Line::from(Span::styled(
                format!(" Kairos: synced"),
                Style::default().fg(Color::Green),
            )));
        }
    } else {
        lines.push(Line::from(Span::styled(
            " Kairos: no data",
            Style::default().fg(Color::Red),
        )));
    }
    lines.push(Line::from(""));

    // Planet positions
    lines.push(Line::from(Span::styled(
        " Planets",
        Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
    )));
    for i in 0..10usize {
        let ps = &state.kairos.planets[i];
        if ps.degree == 0xFFFF {
            lines.push(Line::from(format!(" {} {} --", planet_glyphs[i], planet_names[i])));
        } else {
            let sign_idx = (ps.degree / 30) as usize % 12;
            let sign_deg = ps.degree % 30;
            let retro = if ps.is_retrograde { " ℞" } else { "" };
            lines.push(Line::from(vec![
                Span::styled(
                    format!(" {} ", planet_glyphs[i]),
                    Style::default().fg(Color::White),
                ),
                Span::styled(
                    format!("{:<9}", planet_names[i]),
                    Style::default().fg(Color::Gray),
                ),
                Span::styled(
                    format!("{:>3}° {} {}{}", ps.degree, zodiac_glyphs[sign_idx], sign_names[sign_idx], retro),
                    Style::default().fg(Color::White),
                ),
            ]));
        }
    }
    lines.push(Line::from(""));

    // Clock state
    lines.push(Line::from(Span::styled(
        " State",
        Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(format!(
        " Walk: {:8} QL: {}",
        state.walk_mode.label(), state.ql_position
    )));
    lines.push(Line::from(format!(
        " Tick: {}/11     Res: {}-fold",
        state.tick12,
        match state.resolution_level {
            0 => 6, 1 => 12, 2 => 36, 3 => 72, _ => 6,
        }
    )));
    if state.current_degree < 360 {
        let sign_idx = (state.current_degree / 30) as usize % 12;
        lines.push(Line::from(format!(
            " Degree: {}° {}",
            state.current_degree, sign_names[sign_idx]
        )));
    }
    lines.push(Line::from(""));

    // Controls
    lines.push(Line::from(Span::styled(
        " Controls",
        Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(" ←→↑↓  rotate view"));
    lines.push(Line::from(" +/-   zoom in/out"));
    let auto_label = if auto_rotate { "ON" } else { "OFF" };
    lines.push(Line::from(format!(" Space  auto-rotate [{}]", auto_label)));
    lines.push(Line::from(" r      reset view"));
    lines.push(Line::from(" k      sync kairos"));

    let block = Block::default()
        .borders(Borders::LEFT)
        .border_style(Style::default().fg(Color::DarkGray));

    let paragraph = Paragraph::new(lines).block(block);
    ratatui::widgets::Widget::render(paragraph, area, buf);
}
```

- [ ] **Step 2: Build to verify**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished`

- [ ] **Step 3: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/plugins/unified_clock.rs
git commit -m "feat(clock): data panel widget showing planets, state, controls"
```

---

## Task 3: Rewrite Unified Clock Plugin — Layout, Controls, Adaptive FPS

**Files:**
- Rewrite: `epi-cli/src/portal/plugins/unified_clock.rs`

This task rewrites the plugin to:
1. Split the render area 75/25 (torus image | data panel)
2. Data panel renders directly to ratatui buffer (no offscreen)
3. Camera controls with auto-rotate toggle (off by default)
4. Zoom controls (+/-)
5. Adaptive frame timing targeting 30fps
6. Initial kairos sync on startup

- [ ] **Step 1: Rewrite the complete unified_clock.rs**

The full rewritten file:

```rust
//! Full-screen Cosmic Clock plugin.
//!
//! Renders the Hopf fibration torus via tiny-skia offscreen → ratatui-image (left 75%)
//! with a data panel rendered directly to the ratatui buffer (right 25%).

use std::cell::RefCell;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::mpsc;
use std::sync::{Arc, Mutex};

use ratatui::prelude::*;
use ratatui::widgets::{Block, Borders, Paragraph};
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;
use ratatui_image::picker::Picker;
use ratatui_image::protocol::StatefulProtocol;
use ratatui_image::{Resize, StatefulImage};

use crate::portal::clock_renderer::{quat_from_axis_angle, quat_mul_norm};
use crate::portal::clock_state::SharedClockState;

struct RenderSize {
    cols: AtomicU32,
    rows: AtomicU32,
}

type SharedViewQ = Arc<Mutex<[f32; 4]>>;

pub struct UnifiedClockPlugin {
    clock: SharedClockState,
    frame_rx: mpsc::Receiver<StatefulProtocol>,
    current_frame: RefCell<Option<StatefulProtocol>>,
    render_size: Arc<RenderSize>,
    view_q: SharedViewQ,
    auto_rotate: Arc<AtomicBool>,
    zoom: Arc<Mutex<f32>>,
    _render_thread: Option<std::thread::JoinHandle<()>>,
}

impl UnifiedClockPlugin {
    pub fn new(clock: SharedClockState) -> Self {
        let (tx, rx) = mpsc::channel::<StatefulProtocol>();

        let picker = Picker::from_query_stdio().unwrap_or_else(|_| Picker::halfblocks());
        let font_size = picker.font_size();

        let render_size = Arc::new(RenderSize {
            cols: AtomicU32::new(60),
            rows: AtomicU32::new(24),
        });

        // Initial view: tilted ~30° for 3D perspective
        let initial_view = quat_from_axis_angle([1.0, 0.0, 0.0], 0.5);
        let view_q: SharedViewQ = Arc::new(Mutex::new(initial_view));
        let auto_rotate = Arc::new(AtomicBool::new(false)); // OFF by default
        let zoom = Arc::new(Mutex::new(1.0f32));

        let render_clock_state = clock.clone();
        let render_size_ref = render_size.clone();
        let render_view_q = view_q.clone();
        let render_auto = auto_rotate.clone();
        let render_zoom = zoom.clone();
        let handle = std::thread::Builder::new()
            .name("clock-render".into())
            .spawn(move || {
                render_loop(
                    render_clock_state, picker, font_size,
                    render_size_ref, render_view_q, render_auto, render_zoom, tx,
                );
            })
            .ok();

        // Kairos init sync
        {
            let sync_clock = clock.clone();
            std::thread::Builder::new()
                .name("kairos-init".into())
                .spawn(move || {
                    if !crate::nara::kairos::is_current_fresh() {
                        let _ = crate::nara::kairos::sync_current();
                    }
                    if let Ok(Some(kr)) = crate::nara::kairos::load_current() {
                        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&kr);
                        crate::portal::clock_state::update_kairos_full(&sync_clock, kairos);
                    }
                })
                .ok();
        }

        UnifiedClockPlugin {
            clock,
            frame_rx: rx,
            current_frame: RefCell::new(None),
            render_size,
            view_q,
            auto_rotate,
            zoom,
            _render_thread: handle,
        }
    }
}

fn render_loop(
    clock: SharedClockState,
    picker: Picker,
    font_size: (u16, u16),
    render_size: Arc<RenderSize>,
    view_q: SharedViewQ,
    auto_rotate: Arc<AtomicBool>,
    zoom: Arc<Mutex<f32>>,
    tx: mpsc::Sender<StatefulProtocol>,
) {
    let mut frame_count = 0u64;
    let target_frame_ms = 33u64; // ~30fps

    loop {
        let frame_start = std::time::Instant::now();

        let state = clock.lock().unwrap().clone();
        let cols = render_size.cols.load(Ordering::Relaxed);
        let rows = render_size.rows.load(Ordering::Relaxed);

        let (fw, fh) = (font_size.0.max(1) as u32, font_size.1.max(1) as u32);
        let w = (cols * fw).max(200).min(2400);
        let h = (rows * fh).max(200).min(1600);

        // Auto-rotation: gentle yaw drift when enabled
        let user_q = *view_q.lock().unwrap();
        let final_view = if auto_rotate.load(Ordering::Relaxed) {
            let auto_angle = (frame_count as f32) * 0.005;
            let auto_q = quat_from_axis_angle([0.0, 1.0, 0.0], auto_angle);
            quat_mul_norm(user_q, auto_q)
        } else {
            user_q
        };

        let z = *zoom.lock().unwrap();

        if let Some(pixmap) = crate::portal::clock_renderer::render_clock(w, h, &state, final_view, z) {
            let data = pixmap.data().to_vec();
            if let Some(img_buf) = image::RgbaImage::from_raw(w, h, data) {
                let dyn_img: image::DynamicImage = img_buf.into();
                let protocol = picker.new_resize_protocol(dyn_img);
                if tx.send(protocol).is_err() {
                    return;
                }
            }
        }

        frame_count += 1;

        // Adaptive frame timing: aim for 30fps
        let elapsed = frame_start.elapsed().as_millis() as u64;
        if elapsed < target_frame_ms {
            std::thread::sleep(std::time::Duration::from_millis(target_frame_ms - elapsed));
        }
    }
}

const ROT_STEP: f32 = 0.087; // ~5°
const ZOOM_STEP: f32 = 0.1;

impl HypertilePlugin for UnifiedClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, _is_focused: bool) {
        // Split: 75% torus image, 25% data panel
        let panel_width = (area.width as u32 * 25 / 100).max(28).min(40) as u16;
        let torus_width = area.width.saturating_sub(panel_width);

        let torus_area = Rect {
            x: area.x,
            y: area.y,
            width: torus_width,
            height: area.height,
        };
        let panel_area = Rect {
            x: area.x + torus_width,
            y: area.y,
            width: panel_width,
            height: area.height,
        };

        // Tell render thread the torus area size (not full area)
        self.render_size.cols.store(torus_area.width as u32, Ordering::Relaxed);
        self.render_size.rows.store(torus_area.height as u32, Ordering::Relaxed);

        // Drain channel, keep latest frame
        while let Ok(frame) = self.frame_rx.try_recv() {
            *self.current_frame.borrow_mut() = Some(frame);
        }

        // Render torus image
        let mut frame_ref = self.current_frame.borrow_mut();
        if let Some(ref mut protocol) = *frame_ref {
            let image = StatefulImage::default().resize(Resize::Scale(None));
            StatefulWidget::render(image, torus_area, buf, protocol);
        } else {
            let block = Block::default()
                .title(" Cosmic Clock — rendering... ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan));
            ratatui::widgets::Widget::render(block, torus_area, buf);
        }

        // Render data panel directly to buffer
        let state = self.clock.lock().unwrap().clone();
        let auto = self.auto_rotate.load(Ordering::Relaxed);
        render_data_panel(panel_area, buf, &state, auto);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Left => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([0.0, 1.0, 0.0], -ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Right => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([0.0, 1.0, 0.0], ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Up => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([1.0, 0.0, 0.0], -ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Down => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([1.0, 0.0, 0.0], ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Char('+') | KeyCode::Char('=') => {
                    let mut z = self.zoom.lock().unwrap();
                    *z = (*z - ZOOM_STEP).max(0.3);
                    EventOutcome::Consumed
                }
                KeyCode::Char('-') => {
                    let mut z = self.zoom.lock().unwrap();
                    *z = (*z + ZOOM_STEP).min(3.0);
                    EventOutcome::Consumed
                }
                KeyCode::Char(' ') => {
                    let prev = self.auto_rotate.load(Ordering::Relaxed);
                    self.auto_rotate.store(!prev, Ordering::Relaxed);
                    EventOutcome::Consumed
                }
                KeyCode::Char('r') => {
                    *self.view_q.lock().unwrap() = quat_from_axis_angle([1.0, 0.0, 0.0], 0.5);
                    *self.zoom.lock().unwrap() = 1.0;
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    EventOutcome::Consumed
                }
                KeyCode::Char('k') => {
                    let clock = self.clock.clone();
                    std::thread::spawn(move || {
                        let _ = crate::nara::kairos::sync_current();
                        if let Ok(Some(result)) = crate::nara::kairos::load_current() {
                            let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
                            crate::portal::clock_state::update_kairos_full(&clock, kairos);
                        }
                    });
                    EventOutcome::Consumed
                }
                _ => EventOutcome::Ignored,
            }
        } else {
            EventOutcome::Ignored
        }
    }
}

// [render_data_panel function from Task 2 goes here]

#[cfg(test)]
mod tests {
    use super::*;
    use crate::portal::clock_state::new_shared_clock_state;

    #[test]
    fn unified_clock_plugin_creates_without_panic() {
        let clock = new_shared_clock_state();
        let _plugin = UnifiedClockPlugin::new(clock);
    }
}
```

- [ ] **Step 2: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -5`
Expected: `Finished`

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal 2>&1 | tail -10`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/plugins/unified_clock.rs
git commit -m "feat(clock): split layout, camera controls, zoom, auto-rotate toggle, adaptive 30fps"
```

---

## Task 4: Install Binary and Verify

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib 2>&1 | tail -10`
Expected: All tests pass (245+)

- [ ] **Step 2: Install fresh binary**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo install --path . 2>&1 | tail -3`
Expected: `Installed package`

- [ ] **Step 3: Verify kairos data exists**

Run: `cat ~/.epi-logos/nara/kairos/current.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d[\"planets\"])} planets loaded')" 2>&1`
Expected: `10 planets loaded`

- [ ] **Step 4: Commit any remaining changes**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add -A
git status
# Only commit if there are changes
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Hopf fibration geometry: θ=ecliptic (base S²), φ=spanda (fiber S¹) — Task 1
- [x] R/r = 16/9 epogdoon ratio — Task 1 Step 1D
- [x] Geocentric Earth at center — Task 1 (no Earth marker on torus)
- [x] Real kerykeion planet data — already working (kerykeion installed), Task 3 kairos init
- [x] Back-to-front rendering for speed — Task 1 Step 1F
- [x] 30fps target — Task 3 adaptive frame timing
- [x] Camera controls (←→↑↓) — Task 3
- [x] Zoom (+/-) — Task 3
- [x] Auto-rotation toggle (Space), OFF by default — Task 3
- [x] Reset (r) — Task 3
- [x] Kairos sync (k) — Task 3
- [x] 75/25 split layout — Task 3 render()
- [x] Data panel: planets with degrees/signs — Task 2
- [x] Data panel: walk mode, QL position, tick12, resolution — Task 2
- [x] Data panel: controls legend — Task 2
- [x] Arrow keys disable auto-rotation — Task 3 on_event
- [x] Proportional scaling of dots/glyphs — Task 1 Step 1G
- [x] sign_to_element corrected — Task 1 Step 1A
- [x] Identity position shown if loaded — renderer overlay (existing)
- [x] Install binary — Task 4

**Type consistency:** `render_clock(width, height, state, view_q, zoom)` — signature consistent across Task 1 definition and Task 3 render_loop call. `equator_project` signature with `r_offset` param consistent across all overlay callers.
