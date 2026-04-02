# Cosmic Clock Unified Scene — Design Specification

**Status:** Approved design, ready for implementation planning
**Date:** 2026-04-02
**Coordinate:** #3-5 (Synthesis Wheel) rendered as Hopf fibration torus
**Depends on:** HOPF-INTEGRATION-READ.md (v2.0), cosmic-clock-full-architecture.md, 00-canonical-invariants.md
**Supersedes:** Current multi-plugin Tab 1 layout (clock.cosmic + m3.knowing + m1.walk)

---

## 0. Problem Statement

The Cosmic Clock data layer is a genuine Hopf fibration dynamical system: quaternion composition, 4 walk modes, bifurcation cascade, codon bridge, 360-degree LUT with 27 fields per node, planetary aspects, and resolution-aware state. None of this is reflected in the TUI.

The current CosmicClockPlugin renders a braille point-cloud torus with a flat dot ring and a text side panel. It does not display the backbone ring system, zodiac arcs, decan bands, resolution cascade, or aspect geometry. The kerykeion pipeline is severed (planet degrees computed but never delivered to the portal). The M1WalkPlugin is a pre-Hopf fossil. The Tab 1 layout splits the clock across three panes when it should be one unified scene.

This spec defines the replacement: a single full-screen plugin rendering a high-quality offscreen-composed clock via tiny-skia + ratatui-image, with live kerykeion data, and correct structural representation of the Hopf fibration topology.

---

## 1. Rendering Stack

### 1.1 Pipeline

```
tiny-skia (CPU 2D rasterizer, pure Rust)
    → renders clock to offscreen RGBA Pixmap
ab_glyph (glyph rasterizer)
    → burns text labels into the Pixmap (planet symbols, zodiac glyphs, degree numbers, codon sequences)
image crate (format bridge)
    → Pixmap bytes → RgbaImage → DynamicImage
ratatui-image (terminal image widget, v10+)
    → auto-detects protocol: Kitty > Sixel > iTerm2 > HalfBlock fallback
    → StatefulImage widget displays the composed frame
ratatui (TUI framework)
    → data panel as standard Paragraph widget in adjacent Rect
```

### 1.2 Resolution

The offscreen buffer targets the actual terminal pixel area:
- `width_px = rect.width_cells × font_width_px`
- `height_px = rect.height_cells × font_height_px`
- Font dimensions detected by `Picker::from_query_stdio()`
- Typical: 600×400 for 80×25 terminal with 8×16 font
- Cap at 800×800 to bound encoding time

### 1.3 Terminal Compatibility

| Terminal | Protocol | Quality |
|----------|----------|---------|
| Kitty | Kitty graphics | Excellent (native bitmap) |
| Ghostty | Kitty graphics | Excellent |
| iTerm2 | iTerm2 inline | Excellent |
| WezTerm | iTerm2 | Good |
| Foot | Sixel | Good |
| Alacritty | HalfBlock fallback | Acceptable |
| macOS Terminal.app | HalfBlock fallback | Acceptable |

HalfBlock fallback uses `▀`/`▄` characters with fg/bg color per cell. With `chafa-dyn` feature enabled, ratatui-image uses libchafa for enhanced dithering. Design the clock with bold colors and thick strokes so it remains recognizable even at HalfBlock resolution.

### 1.4 New Dependencies

```toml
[dependencies]
tiny-skia = "0.12"
ratatui-image = { version = "10", features = ["crossterm"] }
image = "0.25"
ab_glyph = "0.2"
```

---

## 2. What the Clock Renders

The torus IS the clock. θ (major circle, 0–360°) = ecliptic degree position. φ (minor circle, 0–11) = spanda fiber tick. The torus surface is the total space S³ of the Hopf fibration projected into R³.

The dual clock nature: Clock A (degree/decan/codon, spatial, the θ circle) and Clock B (hexagram/codon, evaluative, the φ circle) are the two orthogonal projections of the same quaternionic state. They meet on the torus surface.

### 2.1 Layer 1 — Torus Surface (the 360×12 state space)

Parametric torus with R/r = 16/9 (the epogdoon ratio):
```
x = (R + r·cos(φ)) · cos(θ)
y = (R + r·cos(φ)) · sin(θ)
z = r · sin(φ)
```

Orientation driven by the composed quaternion Q_actual = Q_natal × Q_transit × Q_oracle (Hamilton product, non-commutative). Rendered via UnitQuaternion rotation of each surface point. Z-buffered perspective projection.

**Surface coloring:**

- **Zodiac arcs (θ domain):** 12 colored bands, each 30°. Element-coded:
  - Fire signs (♈♌♐): warm red (#D4553A)
  - Earth signs (♉♍♑): olive (#8B9A46)
  - Air signs (♊♎♒): steel blue (#5B8BA0)
  - Water signs (♋♏♓): deep teal (#3A8B7A)
  - Rendered via tiny-skia SweepGradient or per-point color lookup from `CLOCK_DEGREE_LUT[θ].zodiac_sign → element`

- **Decan sub-bands:** At resolution level ≥ 2 (λ > 0.50), each zodiac arc subdivides into 3 decan strips with subtle brightness variation (±15% lightness). 36 total sub-bands.

- **Spanda fiber shading (φ domain):** Along the tube cross-section:
  - Strand A (ticks 0–5, explicate): warmer tint
  - Strand B (ticks 6–11, implicate): cooler tint
  - Current tick12 position highlighted in yellow
  - 6 phi-stage colors: DarkGray(SEED), White(POLE), Cyan(TRIKA), Green(FLOWER), Magenta(FULL), Red(META)

- **Resolution cascade (λ-driven visibility):**
  - λ < 0.25: only 6 broad QL bands (base-space only). Fiber structure collapsed to monochrome.
  - 0.25 ≤ λ < 0.50: fiber resolves → 12-fold. Both strands visible with distinct color.
  - 0.50 ≤ λ < 0.75: decans appear → 36-fold. Each zodiac arc shows 3 decan sub-bands.
  - λ ≥ 0.75: half-decan detail → 72-fold. Full epogdoon vibrational template visible.
  - This IS the Feigenbaum period-doubling cascade made visual. The bifurcation parameter determines how deeply the system has penetrated into the vibrational structure.

### 2.2 Layer 2 — Backbone Rings (structural anchors ON the torus)

Rendered as bright stroked paths on the torus equator (φ = 0):

| Ring | Count | Interval | Visual |
|------|-------|----------|--------|
| Ring 0: Cardinal | 4 | 90° | Large bright dots, element-colored (Fire-red at 0°, Water-teal at 90°, Air-blue at 180°, Earth-olive at 270°) |
| Ring 1: Zodiac | 12 | 30° | Medium dots + ♈♉♊♋♌♍♎♏♐♑♒♓ glyphs via ab_glyph |
| Ring 2: Amino acid | 24 | 15° | Smaller dots. The stable palindromic codon anchors. 24 = backbone count = hours = amino acids. |
| Ring 3: Degree ticks | 360 | 1° | Tick marks at resolution-appropriate density (all 360 only at highest λ) |

Ring 0 ⊂ Ring 1 ⊂ Ring 2 ⊂ Ring 3. Inner-ring nodes carry additional semantic loading.

Compile-time invariant: `360 + 24 == 64 × 6` (384 I-Ching LINE_CHANGE transformations = clock topology).

### 2.3 Layer 3 — Planets (live kerykeion positions)

10 planets in canonical mod-10 ordering: Sun(0), Moon(1), Mercury(2), Venus(3), Mars(4), Jupiter(5), Saturn(6), Uranus(7), Neptune(8), Pluto(9). Earth = geocentric observer (NOT in array; it is the Axis Mundi center).

Each planet rendered at its current ecliptic θ degree on the torus equator:

| Planet | Symbol | Color | Notes |
|--------|--------|-------|-------|
| Sun | ☉ | Yellow (#FFD700) | Stable root/parent. Not chakra-mapped. |
| Moon | ☽ | White (#F0F0F0) | Fastest mover. |
| Mercury | ☿ | Cyan (#00CED1) | |
| Venus | ♀ | Green (#3CB371) | |
| Mars | ♂ | Red (#DC143C) | |
| Jupiter | ♃ | Blue (#4169E1) | |
| Saturn | ♄ | DarkGray (#696969) | |
| Uranus | ⛢ | Magenta (#DA70D6) | Outer/transpersonal |
| Neptune | ♆ | Magenta (#9370DB) | Outer/transpersonal |
| Pluto | ♇ | DarkRed (#8B0000) | Outer/transpersonal |

- Colored marker dot on the equator ring
- Unicode glyph burned adjacent via ab_glyph
- Retrograde planets: marker rendered with a dimmer color or halo
- `is_resonance` (planet transiting its ruling decan): marker rendered brighter/larger
- Natal planet positions (from identity profile `natal_degrees[10]`): ghost markers on a parallel ring slightly offset in φ (dimmer, no glyph)

### 2.4 Layer 4 — Aspect Lines

Lines connecting planet pairs in Ptolemaic aspect. Rendered as tiny-skia stroked paths projected in 3D:

| Aspect | Angle | Orb | Line Color | Line Style |
|--------|-------|-----|------------|------------|
| Conjunction | 0° | ±10° | White | Short bright arc |
| Sextile | 60° | ±6° | Blue-green | Thin line through torus interior |
| Square | 90° | ±8° | Red | Medium line |
| Trine | 120° | ±8° | Green | Medium line |
| Opposition | 180° | ±10° | Magenta | Line through torus center |

Aspects computed by `compute_aspects()` from `KairosState.planets`. Stored as `Vec<PlanetaryAspect>` in `PortalClockState`.

### 2.5 Layer 5 — Oracle Position & Active Data

- **Current degree**: bright yellow marker with glow halo (3px radius)
- **Anticodon** (d+180 mod 360): green marker (the # structural complement via Watson-Crick in degree space)
- **Implicate**: magenta marker at same degree, offset in φ to Strand B (the # inversion in fiber space)
- **Micro-orbit trail**: last 24 cast positions as fading dots (most recent = bright, oldest = dim). Connected path showing the personal mandala trajectory.
- **Active codon sequence**: 3-letter codon (e.g. "AUG") burned as text near current position via ab_glyph
- **Hexagram indicator**: primary → temporal shown near oracle position

### 2.6 Layer 6 — Data Panel (ratatui text, right side)

A narrow column (24-26 cells wide) rendered as a standard ratatui `Paragraph` widget in a separate `Rect` adjacent to the image. No compositing conflict — image widget and text widget occupy different areas.

Contents:
```
φ    ▶ SEED   0°
       POLE   60°
       TRIKA  120°
       FLOWER 180°
       FULL   240°
       META   300°

deg  247°  ♐
anti 67°
impl 247° (inv)
hex  #38 → #12

walk torus
λ    0.63  36-fold

cdn  AUG perfect-palindromic 7R
orb  17 casts
asp  3 active

☉ 12° ♈  ☽ 247° ♐  ☿ 89° ♊R
♀ 315° ♒  ♂ 178° ♎  ♃ 54° ♉
♄ 341° ♓  ⛢ 27° ♈  ♆ 0° ♈
♇ 303° ♒

kairos ✓  (42s ago)
```

---

## 3. Kerykeion Pipeline Fix

### 3.1 Current State (broken)

Kerykeion is called via Python subprocess. Results saved to `~/.epi-logos/nara/kairos/current.json`. But:
- `planet_degrees[10]` in FFI struct never populated from those results
- Portal's `KairosState` has no reliable data source
- Natal planets hardcoded as `0xFFFF`
- Transit quaternion depends on kairos data that doesn't arrive

### 3.2 Fixed Flow

**On portal startup:**
1. `kairos::load_current()` reads `~/.epi-logos/nara/kairos/current.json`
2. If missing, attempt `kairos::sync_current()` (calls `python3 -c "<kerykeion script>"`) once
3. `kerykeion_result_to_kairos_state(&result)` converts to `KairosState` with all 10 `PlanetState` entries populated (degree, is_retrograde, transiting_hex, transiting_tarot, transiting_chakra)
4. `update_kairos_full(&shared_clock, kairos)` sets kairos state + computes transit quaternion from element distribution + computes aspects
5. Clock renders with live planet data

**On periodic timer (every 60 seconds):**
- Kairos thread re-runs steps 1-4
- Transit data refreshes automatically (planet positions change slowly but Moon moves ~0.5°/hour)

**Natal degrees:**
- Loaded from `~/.epi-logos/nara/kairos/natal.json` via identity profile on startup
- Stored as `natal_degrees: [u16; 10]` in `PortalClockState` (new field)
- Used for ghost markers on the torus and for quintessence quaternion computation

**Feature-gated:**
- If kerykeion not installed (Python not available or pip package missing): `KairosState.valid = false`, planet degrees remain `0xFFFF`, clock still renders (no planet markers, no aspect lines, transit quaternion = identity)
- Status shown in data panel: "kairos ---" instead of "kairos ✓"

### 3.3 New PortalClockState Field

```rust
/// Natal planet degrees from birth chart (loaded from identity profile).
/// 0xFFFF = unavailable. Canonical mod-10 ordering.
pub natal_degrees: [u16; 10],
```

Default: `[0xFFFF; 10]`.

---

## 4. Tab Restructure

### 4.1 New Layout

**Tab 0: "M4'-M5' Personal"**
- Default layout: m4.identity | m4.flow / m4.oracle (unchanged)
- ALL plugins available via palette including M0-M3 plugins that previously lived on Tab 1:
  - m0.dashboard, m0.families
  - m1.walk (fossil, available but not default)
  - m2.vibrational
  - m3.knowing
  - m4.mini_clock, m4.spine, m4.medicine, m4.transform, m4.lens, m4.pratibimba
  - m5.logos, m5.chat, m5.fsm
  - shared.help, shared.status

**Tab 1: "Cosmic Clock"**
- ONE plugin: `clock.unified` (the new unified scene)
- Full-screen, no splits
- No palette splitting allowed on this tab (the clock IS the tab)

### 4.2 Plugin Registration Changes

- New plugin type: `clock.unified` — the `UnifiedClockPlugin`
- `clock.cosmic` (old): deprecated, removed from default layout, optionally kept in palette for comparison during development
- `m1.walk`: moved to palette-only (no longer in any default layout)

---

## 5. Threading Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Main Thread (event loop + ratatui render)                │
│                                                          │
│  - Polls crossterm events (50ms timeout)                 │
│  - Reads SharedClockState for data panel text            │
│  - Receives latest StatefulProtocol from render channel  │
│  - Calls render_stateful_widget() for clock image        │
│  - Renders data panel Paragraph in adjacent Rect         │
│  - Handles input (tab switch, kairos reload, quit)       │
└─────────────┬───────────────────────────┬───────────────┘
              │ reads                     │ receives frames
              ▼                           │
┌─────────────────────────┐   ┌───────────┴───────────────┐
│ SharedClockState        │   │ Render Thread              │
│ Arc<Mutex<...>>         │   │                            │
│                         │◄──│ - Watches for state change │
│ Written by:             │   │ - tiny-skia: render torus  │
│  - M4OraclePlugin       │   │ - ab_glyph: burn labels    │
│  - Kairos thread        │   │ - Pixmap → DynamicImage    │
│  - Identity loader      │   │ - Picker → StatefulProtocol│
│                         │   │ - Sends frame via mpsc     │
│ Read by:                │   │ - Adaptive: 20fps active,  │
│  - Render thread        │   │   1fps idle                │
│  - Main thread (panel)  │   └───────────────────────────┘
│  - All plugins (read)   │
└─────────────────────────┘
              ▲
              │ writes kairos
┌─────────────┴───────────┐
│ Kairos Thread            │
│                          │
│ - Every 60s:             │
│   load_current() or      │
│   sync_current()         │
│ - Converts to KairosState│
│ - update_kairos_full()   │
│ - Computes transit_q     │
│ - Computes aspects       │
└──────────────────────────┘
```

### 5.1 Adaptive Frame Rate

- **Active** (20fps / 50ms): triggered by oracle cast, user interaction, or kairos update. Decays to idle after 5 seconds of no state change.
- **Idle** (1fps / 1000ms): planet motion is slow enough that 1fps captures it. Reduces CPU/encoding overhead.
- **State change detection**: render thread compares a generation counter on `PortalClockState` (incremented on every write). If unchanged, sleep for the idle interval.

### 5.2 Render Thread Pseudocode

```
loop {
    let state = shared_clock.lock().clone();
    if state.generation == last_generation && !force_redraw {
        sleep(1000ms);  // idle
        continue;
    }
    last_generation = state.generation;

    let (w, h) = compute_pixel_dimensions(terminal_rect, font_size);
    let mut pixmap = Pixmap::new(w, h);

    render_torus_surface(&mut pixmap, &state);
    render_backbone_rings(&mut pixmap, &state);
    render_planets(&mut pixmap, &state);
    render_aspect_lines(&mut pixmap, &state);
    render_oracle_position(&mut pixmap, &state);
    burn_text_labels(&mut pixmap, &state);  // ab_glyph

    let dyn_img = pixmap_to_dynamic_image(pixmap);
    let protocol = picker.new_resize_protocol(dyn_img);
    tx.send(protocol).ok();

    sleep(50ms);  // active rate
}
```

---

## 6. Rendering Details

### 6.1 Torus Geometry

```
R = scale × 16/25    (major radius)
r = scale × 9/25     (minor radius)
R/r = 16/9           (epogdoon ratio)

θ_steps = 360        (one per degree node)
φ_steps = 72         (maximum resolution: 12 ticks × 6 decan subdivisions)

For each (θ, φ):
  world_pt = parametric_torus(R, r, θ, φ)
  rot_pt   = quaternion_rotate(composed_quaternion, world_pt)
  screen_pt = perspective_project(rot_pt, viewer_distance)
  color    = lookup_surface_color(θ, φ, resolution_level, state)
  z_buffer_paint(screen_pt, color)
```

### 6.2 Surface Color Lookup

```
fn lookup_surface_color(θ_deg: u16, φ_tick: u8, resolution: u8, state) -> Color {
    let entry = &CLOCK_DEGREE_LUT[θ_deg % 360];

    // Base: zodiac element color
    let base = ELEMENT_COLORS[entry.decan_element];

    // Resolution refinement
    if resolution >= 2 {
        // Decan sub-band: modulate lightness by decan_position
        base = modulate_lightness(base, entry.decan_position as f32 / 10.0 * 0.3 - 0.15);
    }
    if resolution >= 1 {
        // Fiber strand: warm (Strand A) vs cool (Strand B)
        if φ_tick >= 6 { base = cool_shift(base, 0.1); }
    }

    // Highlight current tick12
    if φ_tick == state.tick12 { return YELLOW; }

    base
}
```

### 6.3 3D Projection

```
viewer_distance = scale × 3.5
proj_factor = viewer_distance / (viewer_distance - rz)
screen_x = center_x + rx × proj_factor
screen_y = center_y - ry × proj_factor × aspect_ratio
```

Where `aspect_ratio` accounts for terminal character proportions (typically ~0.5 for width/height ratio of a pixel in terminal context, but since we're rendering to a square pixmap this is 1.0).

### 6.4 Text Label Burning (ab_glyph)

Load a single font file (bundled or system font) at startup. For each label:
1. Compute screen position from the 3D projected coordinates of the label's anchor point
2. Check z-buffer: only burn if the anchor point is on the visible (front) side of the torus
3. Rasterize glyphs via `ab_glyph::Font::glyph_id() → outline() → draw()`
4. Paint each coverage pixel onto the Pixmap with the label's color

Labels to burn:
- 12 zodiac glyphs (♈-♓) at 30° intervals on the outer ring
- 10 planet symbols (☉☽☿♀♂♃♄⛢♆♇) at their degree positions
- Current codon sequence (3 chars) near oracle position
- Degree number at current position

Font size: scale proportionally to pixmap dimensions. ~12-16px for zodiac glyphs, ~10-12px for degree numbers.

---

## 7. Interaction

### 7.1 Key Bindings (when clock tab focused)

| Key | Action |
|-----|--------|
| `k` | Force kairos reload from cache (or sync if stale) |
| `r` | Reset torus orientation to identity quaternion |
| `+`/`-` | Manual zoom (adjust viewer_distance) |
| `←`/`→` | Manual θ rotation (nudge composed quaternion x-component) |
| `↑`/`↓` | Manual φ rotation (nudge composed quaternion y-component) |
| `1`-`4` | Force resolution level (override λ-derived level) |
| `0` | Return to auto (λ-derived) resolution |
| `Tab` | Switch to Personal tab |

### 7.2 State Updates from Other Plugins

Oracle cast (on Tab 0 via m4.oracle) → `update_from_cast()` → SharedClockState changes → render thread detects change → clock re-renders with new quaternion, degree, tick12, codon, hexagram.

Identity augment (on Tab 0 via m4.identity) → updates `quintessence_quaternion` → torus ground orientation shifts.

---

## 8. File Structure

### 8.1 New Files

| File | Purpose |
|------|---------|
| `epi-cli/src/portal/plugins/unified_clock.rs` | The `UnifiedClockPlugin` — single full-screen clock scene |
| `epi-cli/src/portal/clock_renderer.rs` | Offscreen tiny-skia rendering pipeline (torus, rings, planets, aspects, labels) |
| `epi-cli/src/portal/clock_text.rs` | ab_glyph text label burning |

### 8.2 Modified Files

| File | Change |
|------|--------|
| `epi-cli/src/portal/mod.rs` | Tab 1 becomes single `clock.unified` plugin, no splits. Register new plugin type. |
| `epi-cli/src/portal/clock_state.rs` | Add `natal_degrees: [u16; 10]`, `generation: u64` counter |
| `epi-cli/src/portal/plugins/mod.rs` | Export `unified_clock` module |
| `epi-cli/Cargo.toml` | Add tiny-skia, ratatui-image, image, ab_glyph dependencies |

### 8.3 Preserved Files (no changes)

| File | Why |
|------|-----|
| `epi-cli/src/portal/plugins/clock.rs` | Kept for comparison during dev, then removed |
| `epi-cli/src/portal/plugins/m1.rs` | Moved to palette-only, no code changes |
| `epi-cli/src/portal/plugins/m0.rs` | Moved to palette-only |
| `epi-cli/src/portal/plugins/m2.rs` | Moved to palette-only |
| `epi-cli/src/portal/plugins/m3.rs` | Moved to palette-only |
| `epi-cli/src/nara/kairos.rs` | Already functional — just needs to be called on startup |

---

## 9. Quality Principles

1. **The clock is a dynamical system, not a display.** Resolution cascade (6→12→36→72) is a state of the system driven by λ, not a zoom level.
2. **The torus IS the clock.** θ = ecliptic degrees (Clock A, spatial). φ = spanda ticks (Clock B, evaluative). Both projections of the same S³ quaternionic state.
3. **Planets are live.** Kerykeion provides real ephemeris data. The clock shows where planets actually are right now.
4. **Highest possible rendering quality.** tiny-skia gives anti-aliased vector paths. ratatui-image auto-detects the best available terminal protocol. Design for Kitty/Ghostty excellence with graceful HalfBlock degradation.
5. **One scene, one plugin, one tab.** No splits, no multi-pane layout. The clock deserves the full screen.

---

## 10. Success Criteria

- [ ] `epi portal --tab structural` opens a full-screen clock with a rotating torus showing zodiac-colored arcs
- [ ] Planet symbols visible at their real current positions (from kerykeion)
- [ ] Backbone rings (4/12/24/360) visible at appropriate resolution
- [ ] Oracle cast on Tab 0 updates torus orientation, degree marker, and codon display on Tab 1
- [ ] Aspect lines drawn between planets in aspect
- [ ] Resolution cascade responds to λ: cast with dominant pp → 6-fold, cast with balanced charges → 72-fold
- [ ] Kairos auto-syncs every 60s, "kairos ✓" in data panel
- [ ] Renders beautifully on Kitty/Ghostty, acceptably on Terminal.app
- [ ] No performance issues (render thread offloads encoding, main thread stays responsive)
