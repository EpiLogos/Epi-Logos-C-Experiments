# Cosmic Clock Immediate Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the three most impactful issues: performance (halve render resolution), planet visibility (bigger dots, always-visible glyphs), zoom feel (scale torus, not perspective).

**Architecture:** Three targeted edits to existing files. No new files. No structural changes.

**Tech Stack:** Rust, tiny-skia, ratatui-image

**Spec:** `docs/superpowers/specs/2026-04-03-cosmic-clock-immediate-fixes.md`

---

## File Map

| File | Action | Changes |
|---|---|---|
| `epi-cli/src/portal/plugins/unified_clock.rs` | Modify | Halve pixel dimensions in render_loop |
| `epi-cli/src/portal/clock_renderer.rs` | Modify | Planet dot sizing, backbone filtering, glyph backface removal, zoom-as-scale |

---

## Task 0: Halve Render Resolution

**Files:**
- Modify: `epi-cli/src/portal/plugins/unified_clock.rs`

- [ ] **Step 1: Change pixel dimension computation in render_loop**

In `render_loop()`, find these lines:
```rust
        let w = (cols * fw).max(200).min(2400);
        let h = (rows * fh).max(200).min(1600);
```

Replace with:
```rust
        let w = ((cols * fw) / 2).max(200).min(1200);
        let h = ((rows * fh) / 2).max(150).min(800);
```

- [ ] **Step 2: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo build 2>&1 | tail -3`
Expected: `Finished`

- [ ] **Step 3: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/plugins/unified_clock.rs
git commit -m "perf(clock): halve render resolution for 4x speedup, ratatui-image upscales"
```

---

## Task 1: Planet Markers Visually Distinct

**Files:**
- Modify: `epi-cli/src/portal/clock_renderer.rs`

- [ ] **Step 1: Make planet dots 3x bigger with white outline**

In `render_planets()`, replace the planet dot rendering:
```rust
        let dot_scale = ((r_min * 0.05) as i32).max(2).min(10);
        let dot_r = dot_scale + 1;

        // Live marker — outside equator
        let (sx, sy, _) = equator_project(deg as f32, q, r_maj, r_min, 1.3, cx, cy, dist);
        paint_dot(pixmap, sx, sy, dot_r, color);
```

With:
```rust
        let dot_scale = ((r_min * 0.05) as i32).max(2).min(10);
        let dot_r = (dot_scale * 3).max(5).min(14);

        // Live marker — outside equator, with white outline for visibility
        let (sx, sy, _) = equator_project(deg as f32, q, r_maj, r_min, 1.3, cx, cy, dist);
        paint_dot(pixmap, sx, sy, dot_r + 2, [255, 255, 255]); // white outline
        paint_dot(pixmap, sx, sy, dot_r, color);                // planet color fill
```

- [ ] **Step 2: Remove backface culling from planet glyphs**

In `burn_labels()`, find the planet glyph loop:
```rust
        let (px, py, rz) = equator_project(deg as f32, q, r_maj, r_min, 1.5, cx, cy, dist);
        if rz < -r_min * 0.3 { continue; }
```

Remove the backface culling line so planets are ALWAYS labeled:
```rust
        let (px, py, _rz) = equator_project(deg as f32, q, r_maj, r_min, 1.5, cx, cy, dist);
        // No backface cull — planets must always be labeled
```

- [ ] **Step 3: Filter backbone dots at resolution 0 — only cardinal+zodiac**

In `render_backbone_rings()`, change the amino acid condition from unconditional to resolution-gated:
```rust
        } else if deg % 15 == 0 {
            // Amino backbone — gray dot
            paint_dot(pixmap, sx, sy, dot_scale, [100, 100, 110]);
```

Change to:
```rust
        } else if resolution_level >= 1 && deg % 15 == 0 {
            // Amino backbone — gray dot (visible at resolution ≥ 1 only)
            paint_dot(pixmap, sx, sy, dot_scale, [100, 100, 110]);
```

- [ ] **Step 4: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_renderer 2>&1 | tail -5`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_renderer.rs
git commit -m "fix(clock): planet markers 3x larger with white outline, backbone filtered by resolution"
```

---

## Task 2: Zoom Controls Torus Scale

**Files:**
- Modify: `epi-cli/src/portal/clock_renderer.rs`

- [ ] **Step 1: Change zoom to scale the torus, not perspective distance**

In `render_clock()`, find:
```rust
    let scale = w.min(h) * 0.5 * 0.88; // leave margin

    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale * 3.5 * zoom; // perspective distance
```

Replace with:
```rust
    let scale_base = w.min(h) * 0.5 * 0.88;
    let scale = scale_base / zoom.max(0.1); // zoom < 1 = bigger, > 1 = smaller

    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale_base * 3.5; // perspective distance stays fixed
```

- [ ] **Step 2: Build and test**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib portal::clock_renderer 2>&1 | tail -5`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
git add epi-cli/src/portal/clock_renderer.rs
git commit -m "fix(clock): zoom scales torus size directly instead of perspective distance"
```

---

## Task 3: Install and Verify

- [ ] **Step 1: Full test suite**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo test --lib 2>&1 | tail -5`

- [ ] **Step 2: Install**

Run: `cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli" && cargo install --path . 2>&1 | tail -3`

---

## Self-Review Checklist

- [x] Halve render resolution — Task 0
- [x] Planet dots 3x bigger with white outline — Task 1 Step 1
- [x] Planet glyphs always visible (no backface cull) — Task 1 Step 2
- [x] Backbone amino dots gated by resolution ≥ 1 — Task 1 Step 3
- [x] Zoom scales torus, not perspective — Task 2
- [x] Install fresh binary — Task 3
