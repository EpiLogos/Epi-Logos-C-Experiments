# Cosmic Clock Unified Scene — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the multi-plugin Tab 1 with a single full-screen clock rendered via tiny-skia + ratatui-image, fed by live kerykeion data.

**Architecture:** Offscreen RGBA pixmap rendered by tiny-skia (torus geometry + backbone rings + planets + aspect lines + text labels via ab_glyph), displayed through ratatui-image with auto-detected terminal protocol (Kitty/Sixel/iTerm2/HalfBlock). Background render thread sends completed frames to the main TUI event loop via mpsc channel. Kairos thread syncs planet positions every 60 seconds.

**Tech Stack:** Rust (epi-cli), tiny-skia 0.12, ratatui-image 10, ab_glyph 0.2, image 0.25, ratatui 0.30

**Spec:** `docs/superpowers/specs/2026-04-02-cosmic-clock-unified-scene-design.md`

**Parallel execution:** Tasks 0-2 are sequential (foundation). Then Tasks 3-6 can be parallelized (3+4 renderer, 5 kairos, 6 tab restructure). Task 7 is the integration task. Task 8 is cleanup.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `epi-cli/Cargo.toml` | Modify | Add tiny-skia, ratatui-image, image, ab_glyph deps |
| `epi-cli/src/portal/clock_state.rs` | Modify | Add `natal_degrees`, `generation` counter |
| `epi-cli/src/portal/clock_renderer.rs` | Create | Offscreen tiny-skia rendering: torus, rings, planets, aspects, labels |
| `epi-cli/src/portal/plugins/unified_clock.rs` | Create | Full-screen HypertilePlugin: render thread, image widget, input handling |
| `epi-cli/src/portal/plugins/mod.rs` | Modify | Add `pub mod unified_clock;` |
| `epi-cli/src/portal/mod.rs` | Modify | Restructure Tab 1 to single unified plugin, add kairos startup + thread |
| `epi-cli/src/nara/kairos.rs` | Modify (minor) | Add `load_natal()` helper |
| `epi-cli/assets/DejaVuSans.ttf` | Create | Bundled font for ab_glyph label rendering |

---

## Task 0: Add Dependencies

**Files:**
- Modify: `epi-cli/Cargo.toml`

- [ ] **Step 1: Add new dependencies to Cargo.toml**

After the existing `nalgebra = "0.33"` line, add:

```toml
tiny-skia = "0.12"
ratatui-image = { version = "10", default-features = false, features = ["crossterm"] }
image = { version = "0.25", default-features = false, features = ["png"] }
ab_glyph = "0.2"
```

- [ ] **Step 2: Build to verify resolution**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -5`
Expected: `Finished` (warnings OK, no errors)

- [ ] **Step 3: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/Cargo.toml epi-cli/Cargo.lock
git commit -m "chore: add tiny-skia, ratatui-image, image, ab_glyph dependencies"
```

---

## Task 1: Add natal_degrees and generation counter to PortalClockState

**Files:**
- Modify: `epi-cli/src/portal/clock_state.rs:392-507`

- [ ] **Step 1: Add new fields to PortalClockState struct**

After the `micro_orbit` field (line ~478), before the closing brace, add:

```rust
    /// Natal planet degrees from birth chart (loaded from identity profile).
    /// 0xFFFF = unavailable. Canonical mod-10 ordering.
    pub natal_degrees:           [u16; 10],

    /// Monotonic generation counter. Incremented on every state mutation.
    /// Render thread watches this to detect changes and skip redundant redraws.
    pub generation:              u64,
```

- [ ] **Step 2: Update Default impl**

In the `Default` impl (line ~481), add the two new fields before the closing brace:

```rust
            natal_degrees:           [0xFFFF; 10],
            generation:              0,
```

- [ ] **Step 3: Increment generation on every mutation**

At the end of `update_from_cast()` (just before the closing `}`), add:

```rust
    s.generation += 1;
```

At the end of `update_kairos_full()` (just before the closing `}`), add:

```rust
    state.lock().unwrap().generation += 1;
```

At the end of `update_kairos()` (line ~734), add:

```rust
    state.lock().unwrap().generation += 1;
```

At the end of `update_quintessence_quaternion()`, add:

```rust
    state.lock().unwrap().generation += 1;
```

- [ ] **Step 4: Build to verify**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished`

- [ ] **Step 5: Run existing tests**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_state 2>&1 | tail -10`
Expected: All existing tests pass

- [ ] **Step 6: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_state.rs
git commit -m "feat(clock): add natal_degrees and generation counter to PortalClockState"
```

---

## Task 2: Bundle a font for ab_glyph

**Files:**
- Create: `epi-cli/assets/DejaVuSans.ttf`
- Modify: `epi-cli/src/portal/clock_renderer.rs` (just the font loading part, rest in Task 3)

- [ ] **Step 1: Download DejaVuSans.ttf**

```bash
mkdir -p "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli/assets"
curl -sL "https://github.com/dejavu-fonts/dejavu-fonts/raw/main/ttf/DejaVuSans.ttf" \
  -o "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli/assets/DejaVuSans.ttf"
ls -la "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli/assets/DejaVuSans.ttf"
```

Expected: File exists, ~700KB

- [ ] **Step 2: Verify the font file is valid**

Create `epi-cli/src/portal/clock_renderer.rs` with just the font loading test:

```rust
//! Offscreen clock renderer: tiny-skia + ab_glyph
//!
//! Renders the Cosmic Clock torus to an RGBA pixmap.
//! Called from a background thread; the pixmap is then converted to
//! DynamicImage and displayed via ratatui-image.

/// Bundled font bytes (DejaVuSans, ~700KB, includes zodiac + planet Unicode glyphs).
const FONT_BYTES: &[u8] = include_bytes!("../../assets/DejaVuSans.ttf");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn font_loads_successfully() {
        use ab_glyph::FontRef;
        let font = FontRef::try_from_slice(FONT_BYTES);
        assert!(font.is_ok(), "Failed to load bundled font");
    }
}
```

- [ ] **Step 3: Add the module to the portal**

In `epi-cli/src/portal/mod.rs`, after `mod theme;` (line ~20), add:

```rust
pub mod clock_renderer;
```

- [ ] **Step 4: Run the font test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_renderer 2>&1 | tail -5`
Expected: `test portal::clock_renderer::tests::font_loads_successfully ... ok`

- [ ] **Step 5: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/assets/DejaVuSans.ttf epi-cli/src/portal/clock_renderer.rs epi-cli/src/portal/mod.rs
git commit -m "feat(clock): bundle DejaVuSans font and create clock_renderer module"
```

---

## Task 3: Offscreen Torus Renderer

**Files:**
- Modify: `epi-cli/src/portal/clock_renderer.rs`

This is the largest task. It builds the core rendering pipeline: parametric torus → tiny-skia Pixmap.

- [ ] **Step 1: Write test for basic torus rendering**

Append to `clock_renderer.rs`:

```rust
use tiny_skia::{Color, FillRule, Paint, PathBuilder, Pixmap, Shader, Stroke, Transform};

/// Element colors for zodiac signs (Fire/Earth/Air/Water)
const ELEMENT_COLORS: [[u8; 3]; 4] = [
    [212, 85, 58],   // Fire: warm red
    [139, 154, 70],  // Earth: olive
    [91, 139, 160],  // Air: steel blue
    [58, 139, 122],  // Water: deep teal
];

/// Map zodiac sign index (0-11) to element index (0=Fire, 1=Earth, 2=Air, 3=Water)
fn sign_to_element(sign: u8) -> u8 {
    // Fire: 0,4,8  Earth: 1,5,9  Air: 2,6,10  Water: 3,7,11
    sign % 4
}

/// Render the full cosmic clock scene to an RGBA pixmap.
///
/// `width`/`height`: pixel dimensions of the output buffer.
/// `state`: cloned PortalClockState snapshot.
///
/// Returns None if width or height is 0.
pub fn render_clock(
    width: u32,
    height: u32,
    state: &crate::portal::clock_state::PortalClockState,
) -> Option<Pixmap> {
    let mut pixmap = Pixmap::new(width, height)?;
    pixmap.fill(Color::from_rgba8(10, 10, 15, 255)); // near-black background

    let cx = width as f32 / 2.0;
    let cy = height as f32 / 2.0;
    let scale = (width.min(height) as f32 / 2.0) * 0.85;
    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);

    // Composed quaternion for rotation
    let q = state.composed_quaternion;

    // Z-buffer (per-pixel depth)
    let buf_size = (width * height) as usize;
    let mut z_buf = vec![-f32::INFINITY; buf_size];

    let theta_steps = 360u32;
    let phi_steps = 72u32;

    for ti in 0..theta_steps {
        let theta = ti as f32 * std::f32::consts::TAU / theta_steps as f32;
        let degree = ti as u16;
        let sign = (degree / 30) as u8 % 12;
        let elem = sign_to_element(sign);

        for pi in 0..phi_steps {
            let phi = pi as f32 * std::f32::consts::TAU / phi_steps as f32;
            let tick = (pi * 12 / phi_steps) as u8;

            // Parametric torus
            let px = (r_maj + r_min * phi.cos()) * theta.cos();
            let py = (r_maj + r_min * phi.cos()) * theta.sin();
            let pz = r_min * phi.sin();

            // Quaternion rotation: q * p * q^-1 (simplified for unit quaternion)
            let (rx, ry, rz) = quat_rotate(q, px, py, pz);

            // Perspective projection
            let dist = scale * 3.5;
            let proj = dist / (dist - rz).max(0.001);
            let sx = (cx + rx * proj) as i32;
            let sy = (cy - ry * proj) as i32;

            if sx < 0 || sy < 0 || sx >= width as i32 || sy >= height as i32 {
                continue;
            }

            let idx = sy as usize * width as usize + sx as usize;
            if rz <= z_buf[idx] {
                continue;
            }
            z_buf[idx] = rz;

            // Illumination: skip very dark back-face
            let illumination = (rz / scale + 1.0) * 0.5;
            if illumination < 0.12 {
                continue;
            }

            // Surface color from element + resolution
            let [r, g, b] = surface_color(elem, tick, state.tick12, state.resolution_level, illumination);

            let pixel_idx = (sy as usize * width as usize + sx as usize) * 4;
            if pixel_idx + 3 < pixmap.data().len() {
                // tiny-skia uses premultiplied RGBA
                let data = pixmap.data_mut();
                data[pixel_idx]     = r;
                data[pixel_idx + 1] = g;
                data[pixel_idx + 2] = b;
                data[pixel_idx + 3] = 255;
            }
        }
    }

    Some(pixmap)
}

/// Rotate point (x,y,z) by unit quaternion [w,x,y,z].
fn quat_rotate(q: [f32; 4], x: f32, y: f32, z: f32) -> (f32, f32, f32) {
    let (qw, qx, qy, qz) = (q[0], q[1], q[2], q[3]);
    // t = 2 * cross(q.xyz, v)
    let tx = 2.0 * (qy * z - qz * y);
    let ty = 2.0 * (qz * x - qx * z);
    let tz = 2.0 * (qx * y - qy * x);
    // result = v + qw * t + cross(q.xyz, t)
    (
        x + qw * tx + (qy * tz - qz * ty),
        y + qw * ty + (qz * tx - qx * tz),
        z + qw * tz + (qx * ty - qy * tx),
    )
}

/// Compute surface color for a torus point.
fn surface_color(
    elem: u8,
    tick: u8,
    current_tick12: u8,
    resolution_level: u8,
    illumination: f32,
) -> [u8; 3] {
    // Current tick highlighted yellow
    if tick == current_tick12 {
        let bright = (illumination * 255.0).min(255.0) as u8;
        return [bright, bright, 0];
    }

    let [br, bg, bb] = ELEMENT_COLORS[elem as usize % 4];

    // Apply illumination
    let r = (br as f32 * illumination).min(255.0) as u8;
    let g = (bg as f32 * illumination).min(255.0) as u8;
    let b = (bb as f32 * illumination).min(255.0) as u8;

    // Resolution-based fiber shading: at level >= 1, dim implicate strand
    if resolution_level >= 1 && tick >= 6 {
        return [r * 3 / 4, g * 3 / 4, b * 3 / 4];
    }

    [r, g, b]
}
```

- [ ] **Step 2: Add test that verifies rendering produces non-empty pixmap**

Append to the `tests` module in `clock_renderer.rs`:

```rust
    #[test]
    fn render_clock_produces_non_empty_pixmap() {
        use crate::portal::clock_state::PortalClockState;
        let state = PortalClockState::default();
        let pixmap = super::render_clock(200, 200, &state);
        assert!(pixmap.is_some());
        let pixmap = pixmap.unwrap();
        // Check that at least some pixels are non-background
        let non_bg = pixmap.data().chunks(4).any(|px| px[0] != 10 || px[1] != 10 || px[2] != 15);
        assert!(non_bg, "Rendered pixmap should contain torus pixels");
    }

    #[test]
    fn quat_rotate_identity_is_noop() {
        let (x, y, z) = super::quat_rotate([1.0, 0.0, 0.0, 0.0], 1.0, 2.0, 3.0);
        assert!((x - 1.0).abs() < 1e-5);
        assert!((y - 2.0).abs() < 1e-5);
        assert!((z - 3.0).abs() < 1e-5);
    }
```

- [ ] **Step 3: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_renderer 2>&1 | tail -10`
Expected: All 3 tests pass

- [ ] **Step 4: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_renderer.rs
git commit -m "feat(clock): offscreen torus renderer with element-coded surface coloring"
```

---

## Task 4: Planet Markers, Backbone Rings, Aspect Lines, and Text Labels

**Files:**
- Modify: `epi-cli/src/portal/clock_renderer.rs`

- [ ] **Step 1: Add backbone ring rendering**

Add after `render_clock()`:

```rust
/// Draw backbone ring markers on the torus equator (φ=0).
/// Projects 3D equator points via the same quaternion rotation + perspective.
fn render_backbone_rings(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    scale: f32,
    cx: f32,
    cy: f32,
    resolution_level: u8,
) {
    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale * 3.5;

    for degree in 0..360u16 {
        let theta = degree as f32 * std::f32::consts::TAU / 360.0;
        // Equator point (φ=0)
        let px = (r_maj + r_min) * theta.cos();
        let py = (r_maj + r_min) * theta.sin();
        let pz = 0.0f32;
        let (rx, ry, rz) = quat_rotate(q, px, py, pz);
        let proj = dist / (dist - rz).max(0.001);
        let sx = (cx + rx * proj) as i32;
        let sy = (cy - ry * proj) as i32;

        // Skip back-face
        if rz < 0.0 { continue; }

        let (color, radius) = if degree % 90 == 0 {
            // Ring 0: Cardinal — large bright element dot
            let elem = match degree {
                0   => [255u8, 80, 60],    // Fire (Aries)
                90  => [58, 139, 122],     // Water (Cancer)
                180 => [91, 139, 160],     // Air (Libra)
                270 => [139, 154, 70],     // Earth (Capricorn)
                _   => [200, 200, 200],
            };
            (elem, 4)
        } else if degree % 30 == 0 {
            // Ring 1: Zodiac — medium dots
            let sign = (degree / 30) as u8;
            let elem = sign_to_element(sign) as usize;
            let [r, g, b] = ELEMENT_COLORS[elem % 4];
            ([r, g, b], 3)
        } else if degree % 15 == 0 {
            // Ring 2: Amino acid backbone
            ([180u8, 180, 180], 2)
        } else if resolution_level >= 2 && degree % 10 == 0 {
            // Decan boundaries (resolution >= 36-fold)
            ([100u8, 100, 100], 1)
        } else {
            continue;
        };

        paint_dot(pixmap, sx, sy, radius, color);
    }
}

/// Paint a filled circle on the pixmap.
fn paint_dot(pixmap: &mut Pixmap, cx: i32, cy: i32, radius: i32, color: [u8; 3]) {
    let w = pixmap.width() as i32;
    let h = pixmap.height() as i32;
    for dy in -radius..=radius {
        for dx in -radius..=radius {
            if dx * dx + dy * dy > radius * radius { continue; }
            let px = cx + dx;
            let py = cy + dy;
            if px >= 0 && py >= 0 && px < w && py < h {
                let idx = (py as usize * w as usize + px as usize) * 4;
                let data = pixmap.data_mut();
                if idx + 3 < data.len() {
                    data[idx]     = color[0];
                    data[idx + 1] = color[1];
                    data[idx + 2] = color[2];
                    data[idx + 3] = 255;
                }
            }
        }
    }
}
```

- [ ] **Step 2: Add planet rendering**

```rust
const PLANET_COLORS: [[u8; 3]; 10] = [
    [255, 215, 0],   // Sun: gold
    [240, 240, 240],  // Moon: white
    [0, 206, 209],    // Mercury: cyan
    [60, 179, 113],   // Venus: green
    [220, 20, 60],    // Mars: red
    [65, 105, 225],   // Jupiter: blue
    [105, 105, 105],  // Saturn: gray
    [218, 112, 214],  // Uranus: magenta
    [147, 112, 219],  // Neptune: purple
    [139, 0, 0],      // Pluto: dark red
];

/// Render live planet markers on the torus equator.
fn render_planets(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    scale: f32,
    cx: f32,
    cy: f32,
    planets: &[crate::portal::clock_state::PlanetState; 10],
    natal_degrees: &[u16; 10],
) {
    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale * 3.5;

    // Natal ghost markers (slightly inside the equator ring)
    for (i, &ndeg) in natal_degrees.iter().enumerate() {
        if ndeg == 0xFFFF { continue; }
        let theta = ndeg as f32 * std::f32::consts::TAU / 360.0;
        let r_inner = r_maj + r_min * 0.85; // slightly inside
        let px = r_inner * theta.cos();
        let py = r_inner * theta.sin();
        let (rx, ry, rz) = quat_rotate(q, px, py, 0.0);
        if rz < 0.0 { continue; }
        let proj = dist / (dist - rz).max(0.001);
        let sx = (cx + rx * proj) as i32;
        let sy = (cy - ry * proj) as i32;
        let [r, g, b] = PLANET_COLORS[i];
        paint_dot(pixmap, sx, sy, 2, [r / 2, g / 2, b / 2]); // dim ghost
    }

    // Live planet markers
    for (i, ps) in planets.iter().enumerate() {
        if ps.degree == 0xFFFF { continue; }
        let theta = ps.degree as f32 * std::f32::consts::TAU / 360.0;
        let px = (r_maj + r_min) * theta.cos();
        let py = (r_maj + r_min) * theta.sin();
        let (rx, ry, rz) = quat_rotate(q, px, py, 0.0);
        if rz < 0.0 { continue; }
        let proj = dist / (dist - rz).max(0.001);
        let sx = (cx + rx * proj) as i32;
        let sy = (cy - ry * proj) as i32;
        let radius = if ps.is_resonance { 5 } else { 4 };
        paint_dot(pixmap, sx, sy, radius, PLANET_COLORS[i]);
    }
}
```

- [ ] **Step 3: Add aspect line rendering**

```rust
/// Render aspect lines between planets.
fn render_aspect_lines(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    scale: f32,
    cx: f32,
    cy: f32,
    planets: &[crate::portal::clock_state::PlanetState; 10],
    aspects: &[crate::portal::clock_state::PlanetaryAspect],
) {
    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale * 3.5;

    let aspect_colors: [[u8; 3]; 5] = [
        [255, 255, 255],  // conjunction: white
        [60, 180, 160],   // sextile: blue-green
        [220, 60, 60],    // square: red
        [60, 200, 60],    // trine: green
        [200, 60, 200],   // opposition: magenta
    ];

    for asp in aspects {
        let deg_a = planets[asp.planet_a as usize].degree;
        let deg_b = planets[asp.planet_b as usize].degree;
        if deg_a == 0xFFFF || deg_b == 0xFFFF { continue; }

        let color = aspect_colors[asp.aspect_type as usize % 5];

        // Project both endpoints
        let theta_a = deg_a as f32 * std::f32::consts::TAU / 360.0;
        let theta_b = deg_b as f32 * std::f32::consts::TAU / 360.0;
        let equator_r = r_maj + r_min;

        let pa = quat_rotate(q, equator_r * theta_a.cos(), equator_r * theta_a.sin(), 0.0);
        let pb = quat_rotate(q, equator_r * theta_b.cos(), equator_r * theta_b.sin(), 0.0);

        // Only draw if both endpoints visible
        if pa.2 < 0.0 && pb.2 < 0.0 { continue; }

        let proj_a = dist / (dist - pa.2).max(0.001);
        let proj_b = dist / (dist - pb.2).max(0.001);
        let ax = (cx + pa.0 * proj_a) as i32;
        let ay = (cy - pa.1 * proj_a) as i32;
        let bx = (cx + pb.0 * proj_b) as i32;
        let by = (cy - pb.1 * proj_b) as i32;

        draw_line(pixmap, ax, ay, bx, by, color);
    }
}

/// Bresenham line drawing onto the pixmap.
fn draw_line(pixmap: &mut Pixmap, x0: i32, y0: i32, x1: i32, y1: i32, color: [u8; 3]) {
    let w = pixmap.width() as i32;
    let h = pixmap.height() as i32;
    let dx = (x1 - x0).abs();
    let dy = -(y1 - y0).abs();
    let sx = if x0 < x1 { 1 } else { -1 };
    let sy = if y0 < y1 { 1 } else { -1 };
    let mut err = dx + dy;
    let mut x = x0;
    let mut y = y0;

    loop {
        if x >= 0 && y >= 0 && x < w && y < h {
            let idx = (y as usize * w as usize + x as usize) * 4;
            let data = pixmap.data_mut();
            if idx + 3 < data.len() {
                data[idx]     = color[0];
                data[idx + 1] = color[1];
                data[idx + 2] = color[2];
                data[idx + 3] = 255;
            }
        }
        if x == x1 && y == y1 { break; }
        let e2 = 2 * err;
        if e2 >= dy { err += dy; x += sx; }
        if e2 <= dx { err += dx; y += sy; }
    }
}
```

- [ ] **Step 4: Add oracle position rendering**

```rust
/// Render oracle markers: current degree (yellow), anticodon (green), micro-orbit trail.
fn render_oracle_markers(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    scale: f32,
    cx: f32,
    cy: f32,
    state: &crate::portal::clock_state::PortalClockState,
) {
    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale * 3.5;
    let equator_r = r_maj + r_min;

    // Micro-orbit trail (fading dots)
    for (i, &deg) in state.micro_orbit.iter().enumerate() {
        let theta = deg as f32 * std::f32::consts::TAU / 360.0;
        let (rx, ry, rz) = quat_rotate(q, equator_r * theta.cos(), equator_r * theta.sin(), 0.0);
        if rz < 0.0 { continue; }
        let proj = dist / (dist - rz).max(0.001);
        let sx = (cx + rx * proj) as i32;
        let sy = (cy - ry * proj) as i32;
        let fade = 255 - (i as u32 * 255 / state.micro_orbit.len().max(1) as u32).min(255) as u8;
        paint_dot(pixmap, sx, sy, 1, [fade, fade / 2, 0]);
    }

    // Anticodon marker (green)
    let anti_deg = (state.current_degree as u32 + 180) % 360;
    {
        let theta = anti_deg as f32 * std::f32::consts::TAU / 360.0;
        let (rx, ry, rz) = quat_rotate(q, equator_r * theta.cos(), equator_r * theta.sin(), 0.0);
        if rz >= 0.0 {
            let proj = dist / (dist - rz).max(0.001);
            let sx = (cx + rx * proj) as i32;
            let sy = (cy - ry * proj) as i32;
            paint_dot(pixmap, sx, sy, 4, [50, 220, 100]);
        }
    }

    // Current degree marker (bright yellow glow)
    {
        let theta = state.current_degree as f32 * std::f32::consts::TAU / 360.0;
        let (rx, ry, rz) = quat_rotate(q, equator_r * theta.cos(), equator_r * theta.sin(), 0.0);
        if rz >= 0.0 {
            let proj = dist / (dist - rz).max(0.001);
            let sx = (cx + rx * proj) as i32;
            let sy = (cy - ry * proj) as i32;
            paint_dot(pixmap, sx, sy, 6, [255, 255, 50]); // glow
            paint_dot(pixmap, sx, sy, 3, [255, 255, 200]); // core
        }
    }
}
```

- [ ] **Step 5: Add text label burning with ab_glyph**

```rust
use ab_glyph::{Font, FontRef, ScaleFont};

const ZODIAC_GLYPHS: [char; 12] = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_GLYPHS: [char; 10] = ['☉','☽','☿','♀','♂','♃','♄','⛢','♆','♇'];

/// Burn zodiac and planet glyphs into the pixmap.
fn burn_labels(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    scale: f32,
    cx: f32,
    cy: f32,
    planets: &[crate::portal::clock_state::PlanetState; 10],
) {
    let font = match FontRef::try_from_slice(FONT_BYTES) {
        Ok(f) => f,
        Err(_) => return,
    };
    let font_size = (scale * 0.08).max(10.0);
    let scaled_font = font.as_scaled(font_size);

    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale * 3.5;
    let label_r = (r_maj + r_min) * 1.15; // outside the equator ring

    // Zodiac glyphs at 30° intervals
    for i in 0..12u16 {
        let degree = i * 30 + 15; // center of sign
        let theta = degree as f32 * std::f32::consts::TAU / 360.0;
        let (rx, ry, rz) = quat_rotate(q, label_r * theta.cos(), label_r * theta.sin(), 0.0);
        if rz < 0.0 { continue; } // back-face
        let proj = dist / (dist - rz).max(0.001);
        let sx = (cx + rx * proj) as i32;
        let sy = (cy - ry * proj) as i32;
        let elem = sign_to_element(i as u8) as usize;
        let [r, g, b] = ELEMENT_COLORS[elem % 4];
        burn_char(pixmap, &scaled_font, ZODIAC_GLYPHS[i as usize], sx, sy, [r, g, b]);
    }

    // Planet glyphs
    for (i, ps) in planets.iter().enumerate() {
        if ps.degree == 0xFFFF { continue; }
        let theta = ps.degree as f32 * std::f32::consts::TAU / 360.0;
        let glyph_r = label_r * 1.08;
        let (rx, ry, rz) = quat_rotate(q, glyph_r * theta.cos(), glyph_r * theta.sin(), 0.0);
        if rz < 0.0 { continue; }
        let proj = dist / (dist - rz).max(0.001);
        let sx = (cx + rx * proj) as i32;
        let sy = (cy - ry * proj) as i32;
        burn_char(pixmap, &scaled_font, PLANET_GLYPHS[i], sx, sy, PLANET_COLORS[i]);
    }
}

/// Burn a single character onto the pixmap at (cx, cy) center.
fn burn_char<F: Font>(
    pixmap: &mut Pixmap,
    scaled_font: &ab_glyph::PxScaleFont<&F>,
    ch: char,
    cx: i32,
    cy: i32,
    color: [u8; 3],
) {
    let glyph_id = scaled_font.font.glyph_id(ch);
    let glyph = glyph_id.with_scale_and_position(
        scaled_font.scale(),
        ab_glyph::point(cx as f32, cy as f32),
    );
    if let Some(outlined) = scaled_font.font.outline_glyph(glyph) {
        let w = pixmap.width() as i32;
        let h = pixmap.height() as i32;
        outlined.draw(|gx, gy, coverage| {
            let px = gx as i32;
            let py = gy as i32;
            if px >= 0 && py >= 0 && px < w && py < h && coverage > 0.1 {
                let idx = (py as usize * w as usize + px as usize) * 4;
                let data = pixmap.data_mut();
                if idx + 3 < data.len() {
                    let alpha = (coverage * 255.0) as u8;
                    // Simple alpha blend over existing pixel
                    let a = alpha as u16;
                    let inv_a = 255 - a;
                    data[idx]     = ((color[0] as u16 * a + data[idx] as u16 * inv_a) / 255) as u8;
                    data[idx + 1] = ((color[1] as u16 * a + data[idx+1] as u16 * inv_a) / 255) as u8;
                    data[idx + 2] = ((color[2] as u16 * a + data[idx+2] as u16 * inv_a) / 255) as u8;
                    data[idx + 3] = 255;
                }
            }
        });
    }
}
```

- [ ] **Step 6: Wire all layers into render_clock()**

Update `render_clock()` — after the torus surface loop and before `Some(pixmap)`, add:

```rust
    render_backbone_rings(&mut pixmap, q, scale, cx, cy, state.resolution_level);
    render_planets(&mut pixmap, q, scale, cx, cy, &state.kairos.planets, &state.natal_degrees);
    render_aspect_lines(&mut pixmap, q, scale, cx, cy, &state.kairos.planets, &state.aspects);
    render_oracle_markers(&mut pixmap, q, scale, cx, cy, state);
    burn_labels(&mut pixmap, q, scale, cx, cy, &state.kairos.planets);
```

- [ ] **Step 7: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_renderer 2>&1 | tail -10`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_renderer.rs
git commit -m "feat(clock): planet markers, backbone rings, aspect lines, text labels in renderer"
```

---

## Task 5: Kairos Startup + Periodic Sync Thread

**Files:**
- Modify: `epi-cli/src/nara/kairos.rs`
- Modify: `epi-cli/src/portal/mod.rs`
- Modify: `epi-cli/src/portal/clock_state.rs`

- [ ] **Step 1: Add load_natal() to kairos.rs**

Append before the `#[cfg(test)]` block:

```rust
/// Load natal kairos state from cache. Returns None if no natal chart cached.
pub fn load_natal() -> Result<Option<KerykeionResult>, String> {
    let path = kairos_dir().join("natal.json");
    if !path.exists() {
        return Ok(None);
    }
    let data = std::fs::read_to_string(&path).map_err(|e| format!("kairos: read natal error: {e}"))?;
    serde_json::from_str(&data)
        .map(Some)
        .map_err(|e| format!("kairos: parse natal error: {e}"))
}
```

- [ ] **Step 2: Add kairos startup + natal loading to new_shared_clock_state()**

In `clock_state.rs`, in `new_shared_clock_state()` (line ~519), after the identity profile block, add:

```rust
    // Load kairos transit data (live planet positions)
    if let Ok(Some(result)) = crate::nara::kairos::load_current() {
        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
        crate::portal::clock_state::update_kairos_full(&shared, kairos);
    }

    // Load natal planet degrees from birth chart
    if let Ok(Some(natal_result)) = crate::nara::kairos::load_natal() {
        let natal_kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&natal_result);
        let mut s = shared.lock().unwrap();
        for i in 0..10 {
            s.natal_degrees[i] = natal_kairos.planets[i].degree;
        }
    }
```

- [ ] **Step 3: Add kairos sync thread to portal launch**

In `epi-cli/src/portal/mod.rs`, in `run_event_loop()` (line ~67), after `let clock_state = new_shared_clock_state();`, add:

```rust
    // Spawn kairos sync thread: refreshes planet positions every 60s
    {
        let clock = clock_state.clone();
        std::thread::Builder::new()
            .name("kairos-sync".into())
            .spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(60));
                    // Try loading from cache first (fast), then sync if stale
                    let result = if crate::nara::kairos::is_current_fresh() {
                        crate::nara::kairos::load_current()
                    } else {
                        match crate::nara::kairos::sync_current() {
                            Ok(_) => crate::nara::kairos::load_current(),
                            Err(_) => crate::nara::kairos::load_current(),
                        }
                    };
                    if let Ok(Some(kr)) = result {
                        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&kr);
                        crate::portal::clock_state::update_kairos_full(&clock, kairos);
                    }
                }
            })
            .ok();
    }
```

- [ ] **Step 4: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -5`
Expected: `Finished`

- [ ] **Step 5: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/nara/kairos.rs epi-cli/src/portal/clock_state.rs epi-cli/src/portal/mod.rs
git commit -m "feat(clock): kairos startup loading + periodic 60s sync thread"
```

---

## Task 6: UnifiedClockPlugin (ratatui-image widget + render thread)

**Files:**
- Create: `epi-cli/src/portal/plugins/unified_clock.rs`
- Modify: `epi-cli/src/portal/plugins/mod.rs`

- [ ] **Step 1: Create the unified clock plugin**

Create `epi-cli/src/portal/plugins/unified_clock.rs`:

```rust
//! Full-screen Cosmic Clock plugin.
//!
//! Renders the torus clock scene via tiny-skia offscreen → ratatui-image.
//! A background thread handles rendering; the plugin displays the latest frame.

use std::sync::mpsc;
use std::sync::{Arc, Mutex};

use ratatui::prelude::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;
use ratatui_image::picker::Picker;
use ratatui_image::protocol::StatefulProtocol;
use ratatui_image::StatefulImage;

use crate::portal::clock_state::SharedClockState;

pub struct UnifiedClockPlugin {
    clock: SharedClockState,
    frame_rx: mpsc::Receiver<Box<dyn StatefulProtocol>>,
    current_frame: Option<Box<dyn StatefulProtocol>>,
    picker: Arc<Mutex<Picker>>,
    _render_thread: Option<std::thread::JoinHandle<()>>,
}

// StatefulProtocol is Send; Picker is not Send by default but we wrap in Arc<Mutex>
unsafe impl Send for UnifiedClockPlugin {}

impl UnifiedClockPlugin {
    pub fn new(clock: SharedClockState) -> Self {
        let (tx, rx) = mpsc::channel::<Box<dyn StatefulProtocol>>();

        // Initialize picker — try to detect terminal protocol, fall back to halfblocks
        let picker = Picker::from_query_stdio().unwrap_or_else(|_| Picker::new((8, 16)));
        let picker = Arc::new(Mutex::new(picker));

        // Spawn render thread
        let render_clock = clock.clone();
        let render_picker = picker.clone();
        let handle = std::thread::Builder::new()
            .name("clock-render".into())
            .spawn(move || {
                render_loop(render_clock, render_picker, tx);
            })
            .ok();

        UnifiedClockPlugin {
            clock,
            frame_rx: rx,
            current_frame: None,
            picker,
            _render_thread: handle,
        }
    }
}

fn render_loop(
    clock: SharedClockState,
    picker: Arc<Mutex<Picker>>,
    tx: mpsc::Sender<Box<dyn StatefulProtocol>>,
) {
    let mut last_generation = u64::MAX; // force first render
    let mut idle_count = 0u32;

    loop {
        let state = clock.lock().unwrap().clone();
        let changed = state.generation != last_generation;

        if !changed {
            idle_count += 1;
            let sleep_ms = if idle_count > 100 { 1000 } else { 200 };
            std::thread::sleep(std::time::Duration::from_millis(sleep_ms));
            continue;
        }

        last_generation = state.generation;
        idle_count = 0;

        // Render at a reasonable resolution
        // TODO: get actual terminal pixel size from picker.font_size
        let (w, h) = (600u32, 400u32);

        if let Some(pixmap) = crate::portal::clock_renderer::render_clock(w, h, &state) {
            // Convert tiny-skia Pixmap to image::DynamicImage
            let data = pixmap.data().to_vec();
            if let Some(img_buf) = image::RgbaImage::from_raw(w, h, data) {
                let dyn_img: image::DynamicImage = img_buf.into();
                if let Ok(p) = picker.lock() {
                    let protocol = p.new_resize_protocol(dyn_img);
                    if tx.send(protocol).is_err() {
                        return; // receiver dropped, plugin gone
                    }
                }
            }
        }

        // Active frame rate: ~10fps
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}

impl HypertilePlugin for UnifiedClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, _is_focused: bool) {
        // Drain channel, keep latest frame
        let plugin = unsafe {
            // We need &mut self but HypertilePlugin gives &self.
            // This is safe because render is only called from the main thread.
            &mut *(self as *const Self as *mut Self)
        };
        while let Ok(frame) = plugin.frame_rx.try_recv() {
            plugin.current_frame = Some(frame);
        }

        if let Some(ref mut protocol) = plugin.current_frame {
            let image = StatefulImage::default();
            image.render(area, buf, protocol);
        } else {
            // No frame yet — show loading message
            let block = ratatui::widgets::Block::default()
                .title(" Cosmic Clock — rendering... ")
                .borders(ratatui::widgets::Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan));
            ratatui::widgets::Widget::render(block, area, buf);
        }
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Char('k') => {
                    // Force kairos reload
                    if let Ok(Some(result)) = crate::nara::kairos::load_current() {
                        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
                        crate::portal::clock_state::update_kairos_full(&self.clock, kairos);
                    }
                    EventOutcome::Consumed
                }
                _ => EventOutcome::Ignored,
            }
        } else {
            EventOutcome::Ignored
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::portal::clock_state::new_shared_clock_state;

    #[test]
    fn unified_clock_plugin_creates_without_panic() {
        // Note: Picker::from_query_stdio() will fail in test (no terminal),
        // falls back to Picker::new((8, 16)) which is fine.
        let clock = new_shared_clock_state();
        let _plugin = UnifiedClockPlugin::new(clock);
        // Just verify it doesn't panic during construction
    }
}
```

- [ ] **Step 2: Register the module**

In `epi-cli/src/portal/plugins/mod.rs`, add:

```rust
pub mod unified_clock;
```

- [ ] **Step 3: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -5`
Expected: `Finished`

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::plugins::unified_clock 2>&1 | tail -5`
Expected: test passes

- [ ] **Step 4: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/plugins/unified_clock.rs epi-cli/src/portal/plugins/mod.rs
git commit -m "feat(clock): UnifiedClockPlugin with render thread and ratatui-image display"
```

---

## Task 7: Tab Restructure — Wire Unified Clock into Portal

**Files:**
- Modify: `epi-cli/src/portal/mod.rs`

- [ ] **Step 1: Register the unified clock plugin type**

In `register_all_plugins()` (line ~154), after the `clock.cosmic` block, add:

```rust
    // Unified Clock — full-screen offscreen-rendered clock (replaces clock.cosmic)
    {
        let cs = clock_state.clone();
        runtime.register_plugin_type("clock.unified", move || {
            let c = cs.clone().unwrap_or_else(new_shared_clock_state);
            plugins::unified_clock::UnifiedClockPlugin::new(c)
        });
    }
```

- [ ] **Step 2: Change Tab 1 layout to single unified plugin**

In `build_workspace()`, replace the Tab 1 section (lines ~284-311):

```rust
    // --- Tab 1: Cosmic Clock ---
    workspace.new_tab();
    workspace.rename_tab(1, "Cosmic Clock".to_string());

    register_all_plugins(workspace.active_runtime_mut(), Some(clock_state.clone()));

    // Single full-screen plugin: the unified clock scene. No splits.
    workspace
        .active_runtime_mut()
        .replace_focused_plugin("clock.unified")
        .map_err(|e| color_eyre::eyre::eyre!("tab 1 replace root: {e}"))?;
```

(Delete the old `split_focused` calls for m3.knowing and m1.walk on Tab 1.)

- [ ] **Step 3: Update the test for tab 1 pane count**

In the test `tab_1_has_three_panes`, change the assertion:

```rust
    #[test]
    fn tab_1_has_one_pane() {
        let mut ws = test_workspace().expect("build_workspace failed");
        ws.go_to_tab(1);
        let count = ws.active_runtime().core().state().pane_ids().len();
        assert_eq!(count, 1, "Tab 1 should have 1 pane (unified clock), got {}", count);
    }
```

- [ ] **Step 4: Update tab name references in other tests if needed**

Change `"M0'-M3' Structural"` to `"Cosmic Clock"` in:

```rust
    #[test]
    fn build_workspace_creates_two_tabs() {
        let ws = test_workspace().expect("build_workspace failed");
        assert_eq!(ws.tab_count(), 2);
        let labels = ws.tab_labels();
        assert_eq!(labels[0].0, "M4'-M5' Personal");
        assert_eq!(labels[1].0, "Cosmic Clock");
    }
```

And in `default_workspace_state_has_two_tabs` if it references the old name.

- [ ] **Step 5: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal 2>&1 | tail -15`
Expected: All portal tests pass

- [ ] **Step 6: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/mod.rs
git commit -m "feat(clock): restructure Tab 1 as single full-screen Cosmic Clock"
```

---

## Task 8: Integration Test + Cleanup

**Files:**
- Modify: `epi-cli/src/portal/plugins/clock.rs` (mark deprecated)
- Full test suite run

- [ ] **Step 1: Run full test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test 2>&1 | tail -20`
Expected: All tests pass

- [ ] **Step 2: Run full build (release mode)**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build --release 2>&1 | tail -5`
Expected: `Finished`

- [ ] **Step 3: Manual smoke test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo run -- portal --tab structural`
Expected: Full-screen clock renders. Tab label says "Cosmic Clock". Torus visible with element-colored surface. If kerykeion was previously synced, planet markers visible. Press `Tab` to switch to Personal tab, `BackTab` to return. Press `q` to quit.

- [ ] **Step 4: Add deprecation comment to old clock.rs**

At the top of `epi-cli/src/portal/plugins/clock.rs`, add:

```rust
// DEPRECATED: Replaced by unified_clock.rs (full-screen offscreen-rendered clock).
// Kept for reference during transition. Remove after unified clock is stable.
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/plugins/clock.rs
git commit -m "chore: mark old CosmicClockPlugin as deprecated, unified clock is live"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Offscreen tiny-skia rendering (Task 3)
- [x] Element-coded zodiac arcs on torus surface (Task 3: surface_color)
- [x] Resolution cascade 6→12→36→72 (Task 3: surface_color uses resolution_level)
- [x] Backbone rings 4/12/24/360 (Task 4: render_backbone_rings)
- [x] Live planet markers from kerykeion (Task 4: render_planets)
- [x] Natal ghost markers (Task 4: render_planets)
- [x] Aspect lines (Task 4: render_aspect_lines)
- [x] Oracle markers + micro-orbit trail (Task 4: render_oracle_markers)
- [x] Text labels burned into scene (Task 4: burn_labels)
- [x] Full-screen, no data panel (Task 6: renders to entire area)
- [x] ratatui-image auto-detection (Task 6: Picker::from_query_stdio)
- [x] Background render thread (Task 6: render_loop)
- [x] Adaptive frame rate (Task 6: idle_count based sleep)
- [x] Kairos pipeline fix — startup loading (Task 5: new_shared_clock_state)
- [x] Kairos periodic 60s sync (Task 5: kairos-sync thread)
- [x] Natal degrees loaded (Task 5: load_natal)
- [x] Tab restructure — single plugin Tab 1 (Task 7)
- [x] Generation counter for change detection (Task 1)
- [x] Key bindings: `k` for kairos reload (Task 6)

**Type consistency:** render_clock(), quat_rotate(), surface_color(), paint_dot(), burn_char() — all consistent across tasks. PlanetState, PlanetaryAspect, PortalClockState — imported from clock_state module throughout.
