# Cosmic Clock — Immediate Fixes + Future Task Registry

**Date:** 2026-04-03

---

## IMMEDIATE (this session)

### Fix 1: Halve Render Resolution for 4x Speedup

The biggest perf killer is `picker.new_resize_protocol()` which re-encodes the full pixmap every frame. At terminal-pixel resolution (e.g. 1200×800) this is 50-100ms alone.

**Fix:** Render at half the terminal pixel dimensions. `ratatui-image` with `Resize::Scale` will upscale to fill. Visual quality barely changes (torus is smooth geometry) but encode cost drops 4x.

```rust
// In render_loop: halve pixel dimensions
let w = ((cols * fw) / 2).max(200).min(1200);
let h = ((rows * fh) / 2).max(150).min(800);
```

### Fix 2: Planet Markers Visually Distinct from Backbone

Planets are currently `dot_scale + 1` — same visual weight as backbone dots. They're invisible in the noise.

**Fix:**
- Planet dots: 3x the backbone dot size, with a bright white outline ring
- Planet glyphs: always render (remove backface culling for planet glyphs — they're too important to hide)
- Backbone dots at resolution_level 0: only render cardinal (4) and zodiac (12) markers, NOT every 15° amino dot. Amino dots appear at resolution ≥ 1.

### Fix 3: Zoom Controls Torus Scale, Not Just Perspective

Currently zoom only changes `dist` (perspective distance), which is visually subtle. Users expect zoom to make the torus bigger/smaller.

**Fix:** Zoom should scale the torus itself:
```rust
let scale = w.min(h) * 0.5 * 0.88 * (1.0 / zoom); // zoom < 1 = bigger torus
```
Keep `dist` fixed at `scale_base * 3.5` (not affected by zoom). This way +/- directly changes torus size on screen.

---

## FUTURE (separate sessions, ordered by priority)

### Future 1: Nara Tab UX — Identity Onboarding Gate

**Problem:** Tab 2 (Personal) shows plugins that need identity data (oracle, medicine, transform) but there's no flow ensuring PASU data exists first.

**Design:** On portal launch, check if `~/.epi-logos/nara/identity/profile.json` exists. If not, Tab 0 shows a single full-screen onboarding plugin that walks the user through setting birth date, birth location, and optional augments. Once profile exists, Tab 0 shows the normal plugin layout.

**Scope:** New plugin (`m4.onboarding`), modify `build_workspace()` to conditionally gate Tab 0 layout.

### Future 2: Walk Visualization on Torus

**Problem:** Walk modes (Ground/Torus/Fiber/Spanda) are computed but not visualized. The clock walks are the traversal paths through the Hopf fibration — they should be visible as animated trails.

**Design:** When a walk is active, render the walk path as a colored trail on the torus surface. WALK_TORUS traces the major circle. WALK_FIBER traces the minor circle at a degree. WALK_SPANDA traces the double-helix. Trail fades over time.

**Scope:** Modify `clock_renderer.rs` to add `render_walk_trail()`. Needs walk step history in `PortalClockState`.

### Future 3: Lens Overlay System

**Problem:** 16 sacred lenses are computed per degree but not visualized.

**Design:** Togglable lens overlay divides the torus into N segments with boundaries drawn as lines/arcs. Active lens shown in panel. Cycle with `l` key. Each segment colored by its M-layer.

**Scope:** Modify `clock_renderer.rs` to add `render_lens_overlay()`. Add `active_lens: u8` to state.

### Future 4: Identity Position Anchor

**Problem:** User's identity quaternion → clock position is computed but not shown.

**Design:** Render a distinctive marker (diamond/star) at the user's identity position on the torus: `(identity_degree, identity_tick12)`. This is WHERE YOU ARE on the clock. Derived from `quintessence_hash → degree` mapping.

**Scope:** Add `identity_degree: u16, identity_tick12: u8` to `PortalClockState`, compute in `new_shared_clock_state()`.

### Future 5: Oracle Cast Integration with Clock

**Problem:** Oracle casts update quaternions and degree but the visual response is minimal.

**Design:** On cast, animate: the torus rotates to the cast's composed quaternion, the current-degree marker moves, the four oracle faces (primary/deficient/implicate/temporal) pulse briefly. Micro-orbit trail shows recent cast history.

**Scope:** Modify render_loop to detect generation changes and trigger animation interpolation.

### Future 6: Fiber Phase Visualization

**Problem:** The 720° SU(2) double-cover (Strand A/B) isn't visualized. The minor circle shows spanda ticks but doesn't distinguish explicate/implicate phase.

**Design:** At resolution ≥ 1, render Strand B as a ghosted/dimmed duplicate of the torus surface. The # operator (spanda_invert) flips between strands. Phase indicator in panel.

**Scope:** Modify torus surface loop to render two passes at resolution ≥ 1.

### Future 7: Real-Time Kerykeion (Current Time, Not Just Date)

**Problem:** `run_kerykeion_current()` uses Greenwich noon — not the user's actual location or current time.

**Design:** Use PASU birth location for coordinates. Use actual current time (not noon). Refresh every 60s for slowly-moving outer planets, every 5min for Moon.

**Scope:** Modify `run_kerykeion_current()` to accept lat/lon/time parameters. Read from PASU.

### Future 8: Performance — GPU Acceleration or Raymarching

**Problem:** Even at half-resolution, CPU rendering + terminal protocol encoding limits FPS.

**Design options:**
- A) wgpu compute shader for torus rendering → readback → encode
- B) Signed distance field raymarching (GPU or SIMD CPU)
- C) Accept CPU limits, optimize encode path (incremental Sixel updates)

**Scope:** Major architecture change. Evaluate after other UX priorities.
