# Cosmic Clock Hopf Fibration Renderer — Design Spec

**Date:** 2026-04-03
**Status:** Canonical
**Supersedes:** 2026-04-02-cosmic-clock-unified-scene-design.md (naive torus)

---

## Problem

The current renderer draws a parametric torus with dots painted on. It doesn't model what the data layer actually IS: a discretized Hopf fibration S³→S² with the user (Earth) at the center. Planets aren't loading (kerykeion was uninstalled), FPS is too low for interactive use, there are no useful controls, and the visualization doesn't represent the mathematical structures already implemented in the clock state.

## What This IS

A **geocentric Hopf fibration viewer**. Earth/user at center. The torus is the fiber bundle: θ (major circle) = ecliptic longitude (base space S²), φ (minor circle) = spanda substage (fiber S¹). The quaternion [w,x,y,z] = [EARTH,FIRE,WATER,AIR] is the point in S³ that projects to a position on this torus.

---

## Architecture

### 1. Geometry: The Hopf Torus

The torus IS the Hopf fibration's natural visualization:

```
Base space (S²) → θ: ecliptic degree 0°–359° (major circle)
Fiber (S¹)      → φ: spanda substage 0–11 (minor circle, 12-fold)
Total space (S³)→ unit quaternion [w, x, y, z]

Projection: tick12 = quantize_to_spanda_substage(y, x)
          = round(((atan2(y, x) + π) / τ) × 12) % 12

Parametric surface:
  x = (R + r·cos(φ)) · cos(θ)
  y = (R + r·cos(φ)) · sin(θ)
  z = r · sin(φ)

Where:
  R/r = 16/9 (epogdoon squared-fourth ratio)
  θ = degree × τ / 360
  φ = tick × τ / 12
```

**720° double-cover (SU(2)):** The torus surface encodes Strand A (explicate, 0–359°). Strand B (implicate, 360–719°) is the same surface with inverted phase — rendered as a dimmed/ghosted duplicate at resolution ≥ 1.

**385 nodes:** 360 degree nodes + 24 backbone nodes + 1 central node (Axis Mundi at Earth/origin).

### 2. Geocentric Frame

Earth IS the center of the torus. The user's identity quaternion (quintessence) places them ON Earth at the origin. Everything orbits around this center:

- **Axis Mundi** rendered as a subtle marker at the torus center (0,0,0)
- **9 planets** (Sun through Pluto, mod-10 minus Earth) rendered at their real ecliptic degrees from kerykeion, positioned on the torus equator (φ=0)
- **Zodiac signs** divide the major circle into 12×30° segments
- **User identity** shown as a highlighted position at (identity_degree, identity_tick12)

### 3. Quaternion Dynamics

Three quaternions compose to drive the view:

| Quaternion | Source | Updates | Role |
|---|---|---|---|
| `quintessence_quaternion` | Identity profile (birth chart + augments) | On `epi nara identity augment` | Stable orientation — WHO you are |
| `transit_quaternion` | Kerykeion planet element distribution | Every 60s kairos sync | Current sky — WHEN it is |
| `live_quaternion` | Oracle cast charges (pp/nn/np/pn) | On every cast | Active engagement — WHAT you're doing |

Composition: `composed = quintessence ⊗ transit ⊗ live` (normalized).

The composed quaternion tilts the torus view — your elemental balance determines how you SEE the cosmic clock. The **view quaternion** (camera, user-controlled) is applied ON TOP of composed.

### 4. Walk Modes as Quaternion Generators

The four walk modes map directly to quaternion components:

| Walk | Component | Movement | Element |
|---|---|---|---|
| GROUND | w dominant | Stay put | EARTH |
| TORUS | x dominant | Advance θ (major circle) | FIRE |
| FIBER | y dominant | Flip φ (minor circle, # operator) | WATER |
| SPANDA | z dominant | Advance θ + flip φ (double-helix) | AIR |

These aren't just labels — they're the **generators of the Hopf fibration's symmetry group**.

### 5. Data Layer

**Kerykeion → KairosState → PortalClockState pipeline:**
1. `sync_current()` → Python kerykeion subprocess → ecliptic degrees for today
2. `kerykeion_result_to_kairos_state()` → PlanetState[10] with degree, retrograde
3. `update_kairos_full()` → transit_quaternion from element distribution + aspect computation
4. `generation += 1` → render thread picks up changes

**Startup:** Sync kairos immediately on portal launch (not just cache load). If kerykeion unavailable, graceful stub (planets at 0xFFFF, transit_q = identity).

**Natal chart:** Load from `~/.epi-logos/nara/kairos/natal.json` → ghost markers at birth positions.

---

## Renderer Rewrite

### Rendering Strategy: GPU-like Scanline

Replace the current per-sample loop (360×72 = 25,920 iterations with individual pixel writes) with a scanline approach that's 10-20x faster:

1. **Pre-compute a torus distance field** at the target resolution
2. **Raycasting per-pixel:** For each screen pixel, compute ray from camera, intersect with torus analytically
3. **Normal-based shading:** Use the analytic torus normal for Lambertian + specular
4. **Single pass for surface** then overlay rings/planets/labels

Alternative (simpler, still fast): **Increase phi resolution to fill gaps, use SIMD-friendly inner loop, skip z-buffer by rendering back-to-front.** This avoids the complexity of raytracing while being fast enough for 30fps.

### Target Performance

- **30fps minimum** for smooth interaction
- **Render resolution:** Match terminal pixel area (cols × font_width, rows × font_height)
- **Adaptive quality:** If frame time > 33ms, reduce phi_steps; if < 16ms, increase

### Visual Layers (back to front)

1. **Background:** Near-black (10, 10, 15)
2. **Torus surface:** Element-coded (Fire=red, Earth=green, Air=blue, Water=indigo), Lambertian shading, current tick12 highlighted
3. **Backbone rings:** Cardinal (4), zodiac (12), amino (24), degree markers — scaled dot sizes
4. **Planet markers:** 9 planets at real ecliptic degrees, sized proportionally, with glyphs
5. **Natal ghosts:** Birth chart planet positions, dimmed
6. **Aspect lines:** Between aspecting planet pairs (conjunction/sextile/square/trine/opposition)
7. **Oracle markers:** Current degree (bright), anticodon (green), micro-orbit trail (fading)
8. **Zodiac glyphs:** At sign centers, element-colored
9. **Planet glyphs:** Near planet positions
10. **Axis Mundi:** Central point marker

### Camera Controls

| Key | Action |
|---|---|
| ← → | Yaw (rotate around vertical axis) |
| ↑ ↓ | Pitch (tilt up/down) |
| `+` `-` | Zoom in/out (adjust perspective distance) |
| `r` | Reset to default angled view |
| `Space` | Toggle auto-rotation on/off |
| `k` | Force kairos sync |

**Auto-rotation:** Gentle yaw drift when enabled. Disabled by default — the clock should be still and readable until the user chooses to spin it. Any arrow key press disables auto-rotation.

### Side Panel (Data/Legend)

Right side of screen (~25% width) showing:

```
┌─ Cosmic Clock ────────────┐
│ 2026-04-03 11:18 UTC       │
│ Location: [lat, lon]       │
│                             │
│ ☉ Sun     13° ♈ Aries     │
│ ☽ Moon   209° ♎ Libra     │
│ ☿ Mercury 345° ♓ Pisces   │
│ ♀ Venus   34° ♉ Taurus    │
│ ♂ Mars   355° ♓ Pisces    │
│ ♃ Jupiter 105° ♋ Cancer   │
│ ♄ Saturn    5° ♈ Aries    │
│ ♅ Uranus   58° ♉ Taurus   │
│ ♆ Neptune   2° ♈ Aries    │
│ ♇ Pluto  305° ♒ Aquarius  │
│                             │
│ Walk: ground │ QL: 0       │
│ Tick: 0/11   │ Res: 6-fold │
│                             │
│ ←→↑↓ rotate  r reset      │
│ +- zoom  Space auto-rotate │
│ k sync kairos              │
└─────────────────────────────┘
```

### Layout

```
┌──────────────────────────────────┬────────────────────┐
│                                  │   Cosmic Clock     │
│                                  │   data panel       │
│        3D Torus View             │   (planets, time,  │
│        (75% width)               │    controls,       │
│                                  │    legend)          │
│                                  │   (25% width)      │
│                                  │                    │
└──────────────────────────────────┴────────────────────┘
```

The torus view gets 75% of width. Data panel gets 25%. Panel is a standard ratatui widget — no offscreen rendering needed.

---

## Resolution Cascade (Bifurcation-Driven)

The fiber detail level follows the bifurcation parameter λ:

| λ range | Resolution | φ steps | What's visible |
|---|---|---|---|
| 0.00–0.25 | 6-fold | 6 | QL positions only |
| 0.25–0.50 | 12-fold | 12 | Base + fiber (full spanda) |
| 0.50–0.75 | 36-fold | 36 | Decan subdivisions |
| 0.75–1.00 | 72-fold | 72 | Full half-decan resolution |

Default: 12-fold (adequate for most views). Higher resolutions reveal more structure but cost more to render.

---

## What's NOT Changing

- `PortalClockState` struct — already correct
- `KairosState` / `PlanetState` — already correct
- Quaternion composition chain — already correct
- `update_from_cast()` — already correct
- Kairos sync thread — already correct
- Tab structure (Tab 1 = Cosmic Clock) — keep

---

## Files Affected

| File | Action |
|---|---|
| `epi-cli/src/portal/clock_renderer.rs` | **Rewrite** — Hopf-correct geometry, faster rendering, side panel |
| `epi-cli/src/portal/plugins/unified_clock.rs` | **Modify** — camera controls, auto-rotation toggle, side panel layout, adaptive FPS |
| `epi-cli/src/portal/clock_state.rs` | **Minor** — ensure generation increments on all mutations (already done) |
| `epi-cli/src/nara/kairos.rs` | **No change** — data layer is correct |

---

## Success Criteria

1. Planets visible at real ecliptic degrees from kerykeion (verifiable against any astrology app)
2. Zodiac signs correctly positioned (Aries at 0°, Taurus at 30°, etc.)
3. Torus geometry uses R/r = 16/9 epogdoon ratio
4. Fiber structure visible (12 spanda ticks around minor circle)
5. Camera rotates smoothly at ≥ 30fps
6. Side panel shows planet positions, time, controls
7. Auto-rotation off by default, toggleable with Space
8. Arrow keys rotate view, feels responsive
9. Earth implied at center (no planet marker for Earth on torus)
10. User identity position shown if profile loaded
