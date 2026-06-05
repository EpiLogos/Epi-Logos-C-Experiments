---
title: "M1-2 Ananda Vortex Architecture — Total Shape, Substrate Map, Profile-Bus Contract, Visual Rendering & Tick Choreography"
coordinate: "M1-2 / M1-2'"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for the M1-2 ananda vortex. M1'-SPEC §X cross-references this document. Where they disagree, this document is authoritative for M1-2 specifically; M1'-SPEC is authoritative for the broader M1' instrument."
depends_on:
  - "[[M1'-SPEC]]"
  - "[[m1-prime-paramasiva-instrument]]"
  - "[[physical-pole-stack-architecture]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m1-prime-audio-generative-research]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/15-m1-2-ananda-vortex-research.md"
decisions:
  - "DR-M1-2 (VALIDATED 2026-06-02): full 3D Bevy/wgpu extension `m1-paramasiva-played-torus`"
related_tranches:
  - "02.6 — K² played-torus 3D surface (M1 domain)"
  - "07.1 / 07.3 — integrated 1-2-3 plugin composition"
  - "10.10 — `ananda_vortex` profile-bus field"
  - "15.4 — editor-area composition pattern"
  - "15.8 — M1-2 ananda vortex visual rendering on K²"
  - "15.9 — tick choreography across the six matrices"
---

# M1-2 Ananda Vortex Architecture

## 0. Frame

**M1-2 is the 12-fold harmonic-vortex layer of Paramaśiva.** Position 2 within the M1 ring (operational / dynamis / "How?"). The "ananda vortices" are not a separate substrate — they are **six canonical Ananda matrix families**, and each family has two inseparable derivation faces:

```text
raw / no-digi-root face   = affine Paramasiva arithmetic before reduction
digit-root face           = recursive vortex reduction used by the runtime surface
```

The Vortex Modulae CSV carries both faces explicitly: first the six "No digi-rooting" blocks, then the same six "Digi-rooting" blocks. The current C `.rodata` at [`Body/S/S0/epi-lib/src/m1.c:22-114`](Body/S/S0/epi-lib/src/m1.c) stores the digit-root face of the first, second, third, and quintessence families; the raw/no-DR face is still under-surfaced in C and must be compiled or formula-derived from the same canonical CSV before Tranche 10.10 is considered complete. The matrix family **is** the harmonic vortex; the quaternionic ring at M1-5 is its **rotational embedding**; the Spanda parallel-track at M1-3 is its **tick advance**.

This document gives the **total shape**: substrate map, dataset map, profile-bus contract, visual rendering contract, tick choreography, cross-extension boundaries, and IDE integration. It is the canonical reference both [[M1'-SPEC]] and `paramasiva-ux-full-m1-branch.md` defer to for M1-2 specifics.

---

## 1. Why M1-2 Carries the Vortex

| Layer | Owns | Provides |
|---|---|---|
| **M1-2 Content** (this layer) | the six 12×12 Ananda matrices; the two diagonal DR rings | the *what* the vortex IS |
| **M1-5 Rotational Form** | the 12 unit quaternions on S³; the K² topology; the Hopf bundle | the *form* the vortex moves through |
| **M1-3 Spanda Tick** | the 12-spanda phase accumulator; the (0/1) inversion-act binding | the *act* that advances the vortex |

The bimba↔pratibimba dynamic at every scale: **content (M1-2) + form (M1-5) + tick (M1-3) = the playable instrument**. The played K² torus is M1-5's geometry **carrying** M1-2's data, **advanced** by M1-3's tick. Rendering all three on one surface is the M' product surface DR-M1-2 ratified.

---

## 2. Substrate Map

### 2.1 The six Ananda matrix families (the vortex data)

C declarations in `Body/S/S0/epi-lib/include/m1.h` and `Body/S/S0/epi-lib/src/m1.c`:

| Symbol | Header decl | Definition | Shape | Bytes | Vortex character |
|---|---|---|---|---|---|
| `ANANDA_BIMBA` | `m1.h:71` | `m1.c:22-35` | 12×12 nibble-packed | 72 | Digit-root face of `#X+0`. Raw face is `k·p`, e.g. row `8X+0`: `0,8,16,24,32,40,48,56,64,72,80,88`; DR face is `0,8,7,6,5,4,3,2,1,9,8,7`. |
| `ANANDA_PRATIBIMBA` | `m1.h:72` | `m1.c:43-56` | 12×12 nibble-packed | 72 | Digit-root face of `#X+1`. Raw face is `k·p+1`, e.g. row `7X+1`: `1,8,15,22,29,36,43,50,57,64,71,78`; DR face is `1,8,6,4,2,9,7,5,3,1,8,6`. |
| `ANANDA_SUM` | `m1.h:73` | `m1.c:64-77` | 12×12 nibble-packed | 72 | Digit-root face of `(#X+0)+(#X+1)`. Raw face is `(k·p)+(k·p+1)=2kp+1`. |
| `ANANDA_DIFF_A` | `m1.h:74` | implicit (`m1.c:725-727`) | 12×12 implicit | 0 | Digit-root face of `(#X+0)-(#X+1)`. Raw face is constant `-1`; DR face is held as the Paramesvara wholeness constant `9`. |
| `ANANDA_DIFF_B` | `m1.h:75` | implicit (`m1.c:728-731`) | 12×12 implicit | 0 | Digit-root face of `(#X+1)-(#X+0)`. Raw face is constant `+1`; DR face is the unity constant `1`. |
| `ANANDA_QUINTESSENCE` | `m1.h:91` | `m1.c:85-114` | dyadic 12×12 ×2 | 144 | Current dyadic digit-root storage `{bimba_dr, sum_dr}`. The CSV's sixth family `(#X+0/1)+/-(#X+0/1)` is the full rule face and must remain representable as a rule/tuple cell, not collapsed to a single scalar. |

**Current stored DR total: 432 bytes of `.rodata`.** Accessor: `get_ananda_harmonic(mat, row, col)` at `m1.h:60-68` (O(1) bitwise nibble extraction). Runtime API: `m1_ananda_get(matrix_idx, row, col)`, `m1_ananda_dr_get(...)`, `m1_ananda_verify_axiom()` at `m1.h:145-151`, implementation at `m1.c:297-345`.

**Correction / implementation gap:** the runtime API currently builds a separate 10×10 `%10` core at `m1.c:297-345`, while the canonical CSV is 12×12 and carries raw/no-digi-root and digit-root sections. `gen_ananda_luts.py` likewise generates `%mod` fixtures rather than compiling the CSV's affine raw face plus digit-root face. Future C work must replace this drift with a single canonical Ananda source path:

```text
Vortex Modulae CSV or exact formula
  -> six 12×12 raw/no-DR family faces
  -> six 12×12 digit-root family faces
  -> typed C accessors + tests against CSV spot rows
  -> Rust/profile `AnandaVortexProjection`
```

### 2.2 The 12-element Ananda ring (the vortex as cyclical structure)

```
ANANDA_RING_SIZE = 12   (m1.h:113)
  indices 0-5  = matrices (ANANDA_BIMBA … ANANDA_QUINTESSENCE)
  indices 6-11 = their DR reflections
  ring[6] ↔ ring[7] = INFINITY_LOOP_WEAVING (Bimba DR ↔ Pratibimba DR lemniscate)
```

### 2.3 The two DR rings — the vortex spins proper

The dual-track digital-root sequences live as `.rodata` LUTs at `m1.c:122-123`:

- **`DR_RING_MAHAMAYA[6] = {1, 2, 4, 8, 7, 5}`** — doubling track, 64-bit word axis (m1.h:129). The Mahāmāyā vortex spin.
- **`DR_RING_PARASHAKTI[6] = {3, 6, 9, 3, 6, 9}`** — tripling track, 72-name axis (m1.h:130). The Paraśakti vortex spin.

**These are the two diagonals through every Ananda matrix.** They are the substrate's own streamline data — what the visual layer renders as flow-lines, not what the visual layer invents.

### 2.4 Crosslink from the ring into M0

`M1_M0_CROSSLINK[12]` at `m1.c:145-150` and `m1.h:798-812`: 12 pointers from the Ananda ring back to the 6 Psychoid archetypes (ascending 0-5, descending Möbius return 5-0). Every tick has an addressable archetypal anchor — the vortex is **holographic**, not merely cyclical.

### 2.5 Spanda ↔ Ananda parallel-track invariant

`m1.h:735-756` declares the **Parallel Role Track Invariant**: `Ananda_Matrix_Op` (0-5) and `Spanda_Stage` (0-5) share identical QL roles, enforced by 6 `_Static_assert`s. Macros `ANANDA_TO_SPANDA_STAGE(op)` and `SPANDA_TO_ANANDA_OP(stage)` (m1.h:755-756) make the cross-mapping branchless.

**This is the deepest finding of the M1-2 substrate**: the visible Ananda matrix advance and the audible Spanda phase advance are **not two channels being synced** — they are *one motion expressed in two registers*. Static-asserts at compile time guarantee they cannot drift. The harmonic principle of the entire project is wired into C at this row.

### 2.6 The quaternionic embedding (M1-5 substrate the M1-2 vortex rides on)

- **`RING_QUATERNION_LUT[12]`** at `m1.h:551-564` — 12 unit quaternions evenly spaced at 30°/tick on the unit-S³ circle (`y=z=0` slice at this stage). Accessor `quat_from_ring_pos(tick)` at `m1.h:566-568`.
- **`CL42_BASIS[6]`** at `m1.h:629-636` — each QL position carries a Cl(4,2) trig identity: `P0=sin(-1), P1=tan(+1), P2=sec(+1), P3=cot(+1), P4=csc(+1), P5=cos(-1)`. Signature `4(+1)+2(-1)=+2`.
- **`QL_TRIG_TABLE[6]`** at `m1.h:654-661` — same Cl(4,2) indexed by numerator/denominator QL position with `TRIG_UNITY=6` sentinel.
- **`TOPOLOGICAL_ELEMENT_COUNT_LUT[12]`** at `m1.h:580-583` — per-ring-position element count `{1,2,2,3,4,5, 8,10,12,6,7,11}` — direct visual-density input.
- **Hopf bundle**: `hopf_project(degree_720)`, `hopf_fiber(...)`, `hopf_tick12(...)` at `m1.h:667-678` and [`Body/S/S0/portal-core/src/hopf.rs:7-13`](Body/S/S0/portal-core/src/hopf.rs).

### 2.7 Spanda — the dynamic

- `SPANDA_SEED_BITS = 0x03` (m1.h:250) — the fused (0/1) pole pair.
- `Spanda_Engine` struct at `m1.h:252-259`.
- `SPANDA_CF_FOLD_COUNT[6] = {4, 6, 8, 10, 12, 0}` (m1.h:280) — per-cf-sub-stage fold count.
- Rust quantiser: [`Body/S/S0/portal-core/src/spanda.rs:9-29`](Body/S/S0/portal-core/src/spanda.rs) — `quantize_to_spanda_substage(y, x)` maps Hopf-base point to tick12; `spanda_invert(stage)` is `#` on stage indices.

---

## 3. Dataset Map

### 3.1 Canonical numerical source: the Vortex Modulae CSV

`Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv`

This CSV is the canonical source for the six Ananda matrix families — the same `#X+0`, `#X+1`, `(#X+0)+(#X+1)`, `(#X+0)-(#X+1)`, `(#X+1)-(#X+0)`, `(#X+0/1)+/-(#X+0/1)` block structure. It has two explicit derivation sections:

- **No digi-rooting** — raw affine arithmetic, where `7X+1` exposes `36` and `64`, `8X+0` exposes `64` and `72`, and the raw additive skeleton can surface `64+72+1=137`.
- **Digi-rooting** — recursive reduction, where the same families become the operational vortex values currently stored in `m1.c:22-114`.

The CSV is therefore not merely "what the `.rodata` compiled from"; it is the **two-register authority** the `.rodata`, runtime API, profile bus, and renderer must preserve.

Column structure (header rows 3-5):
- `Vortex ID` (rows: `0X+1`, `1X+1`, … `11X+1`) — 12-position vortex row indices
- `Fractions and fraction inner sums` — `n/9` rational form + integer sum
- `Position` 0-9 with shadow extension at 10-11 — the column indices that become `12×12` matrix cells
- Per-row totals at columns 14, 16 — drive `VORTEX_5X_CEILING=24` (m1.h:425) and `VORTEX_6X_STRUCTURE=8` (m1.h:426)

Spot citations:
- CSV row 5 `(0X+1 = 1/1, sum=2)` ↔ `m1.c:23` row 0 of `ANANDA_PRATIBIMBA` (all 1s) and `ANANDA_BIMBA` (all 0s)
- CSV row 6 `(1X+1 = 10/9, sum=19)` ↔ `m1.c:44` row 1 of `ANANDA_PRATIBIMBA` (`1,2,3,4,5,6,7,8,9,1,2,3`)
- CSV row `7X+1` raw face: `1,8,15,22,29,36,43,50,57,64,71,78`; DR face: `1,8,6,4,2,9,7,5,3,1,8,6`. This is the direct `36/64 -> 16/9 -> (4/3)^2` vortex event.
- CSV row `8X+0` raw face: `0,8,16,24,32,40,48,56,64,72,80,88`; DR face: `0,8,7,6,5,4,3,2,1,9,8,7`. This is the direct `64+72+1=137` vortex event when read with the parent `+1`.
- CSV row 10 `(5X+1, sum=24)` ↔ `VORTEX_5X_CEILING=24` (Spanda completion ceiling)
- CSV row 11 `(6X+0/1)` ↔ `VORTEX_6X_STRUCTURE=8`

### 3.2 Narrative dataset: `paramasiva-deep/`

`Idea/Bimba/Map/datasets/paramasiva-deep/` — the M1-2-relevant files:

- `Paramasiva's 4 - deeper reflections.md:59` — "9 (3²) … vortex dynamics … 'infinite interiority' revealed in vortex mathematics"
- `Paramasiva's 4 - deeper reflections.md:72` — Mahāmāyā doubling-track DR pattern `1,2,4,8,7,5`
- `Paramasiva's 4 - deeper reflections.md:80` — Paraśakti 3-6-9 track DR pattern
- `Paramasiva's 4 - deeper reflections.md:95` — vortex inner-sum table driving `VORTEX_5X_CEILING / VORTEX_6X_STRUCTURE`
- `Paramasiva's 4 - deeper reflections.md:693, 776, 828` — "Ananda vortex" named directly
- `13-03-2026-gemini-paramasiva-maths.md:187-232` — "Ananda Torus: 4g sides + 2g loops"
- `Spanda_Genesis_100_Percent.md:22-26` — genus-0 sphere puncture (the moment the vortex begins to rotate)

### 3.3 Graph-relational form

`Idea/Bimba/Map/datasets/low-detail/nodes_paramasiva.json`, `relations_paramasiva.json`, and `paramasiva-deep/relations.json:155-285` — `ENABLES_ANANDA`, `Matrix 0 baseline establishment`, etc. Bimba-map nodes the M' Theia surfaces address. No per-position numerical vortex state here.

---

## 4. Profile-Bus Contract

### 4.1 What `MathemeHarmonicProfile` already exposes for M1-2

[`Body/S/S0/portal-core/src/kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs):

- `tick12: u8` — the 12-spanda tick (the vortex index)
- `degree720: u16` — Hopf total-space angle
- `degree360: u16` — Hopf base-space angle
- `position6: u8` — `tick12 % 6`, the matrix-op index (`Ananda_Matrix_Op` parallel)
- `helix: String` — `"bimba"` (tick<6) or `"pratibimba"` (tick≥6)
- `lens_mode: MathemeLensMode` — 84-state `(lens 0-11, mode 0-6)` cell
- `resonance72: MathemeResonance72Projection` — 72-name axis (Paraśakti tripling product)
- `audio_octet: [f32; 8]` — Vimarśa-read frequencies (the M2-1' write M1' consumes)
- `nodal_quartet: [MathemeNodalConstraint; 4]` — Vimarśa-read nodal constraints
- `q_cosmic: [f32; 4]` — codon charge quaternion

Constructor `from_tick(tick)` at `kernel.rs:389-465` — `degree720 = tick12 * 60` (each tick is exactly 60° of Hopf total space = 2 × `DEGREE_PER_TICK=30°` per `m1.h:537, 548`); `position = tick12 % 6`.

### 4.2 What the profile-bus is missing — the load-bearing gap

**No `vortex_*` field exists on `MathemeHarmonicProfile`.** The vortex is implicit via `tick12 + position6 + helix + lens_mode` and IS read by M2 (`m2.h:307`) and M3 (`m3.h:966`), but is NOT surfaced through the profile bus. The played-torus renderer would have to reconstruct vortex state from raw coordinates, violating the "windows onto writes, never re-derived" pattern.

### 4.3 The `ananda_vortex` projection (per Tranche 10.10)

Add `pub ananda_vortex: AnandaVortexProjection` to `MathemeHarmonicProfile`:

```rust
pub struct AnandaVortexProjection {
    /// The current Ananda_Matrix_Op (0-5 per m1.h:735-756 Spanda↔Ananda
    /// parallel-track invariant). Equals `position6` at non-boundary ticks;
    /// transitions across the 5→6 and 11→0 boundaries follow the Klein-flip.
    pub active_matrix_op: AnandaMatrixOp,

    /// The luminous cell on the active 12×12 matrix at this tick.
    /// row = tick12, col = position6 (the substrate's own indexing per m1.h:60-68).
    pub active_cell: (u8, u8),

    /// The full dual-register cell at the active address. This is the load-bearing
    /// correction: every Ananda family has a raw/no-digi-root face and a digit-root
    /// face. Renderers may emphasize one face, but the profile bus must carry both.
    pub active_cell_value: AnandaVortexCell,

    /// Phase indices into the two DR rings (m1.c:122-123).
    /// mahamaya_idx = DR_RING_MAHAMAYA[tick12 % 6]
    /// parashakti_idx = DR_RING_PARASHAKTI[tick12 % 6]
    pub dr_ring_phase: DrRingPhase,

    /// The Cl(4,2) signature at the current position6, lifted from CL42_BASIS[6]
    /// (m1.h:629-636). -1 for P0/P5 (sin/cos implicate generators); +1 for P1-P4.
    pub cl42_signature_at_position: i8,

    /// The quaternionic ring orientation for this tick — RING_QUATERNION_LUT[tick12]
    /// (m1.h:551-564). Surfaced so the renderer never re-derives from m1.h.
    pub ring_quaternion: [f32; 4],

    /// The Hopf fibre flag — 0 for degree720 < 360 (helix sheet 0, bimba),
    /// 1 for degree720 >= 360 (helix sheet 1, pratibimba). Mirror of `helix`
    /// field but typed.
    pub helix_sheet: u8,

    /// True when this tick crosses the Klein-flip boundary at tick 5→6
    /// (Lens N ↔ Lens N+3 in the lens domain, per M1'-SPEC §6).
    pub klein_flip_at_this_tick: bool,
}

pub struct AnandaVortexCell {
    pub family: AnandaMatrixOp,
    pub row_k: u8,
    pub position_p: u8,

    /// Raw/no-digi-root affine value where the family is scalar. Diff/rule families
    /// can carry signed or tuple/rule values through `rule_value`.
    pub raw_value: Option<i16>,
    pub raw_bimba: i16,       // k*p
    pub raw_pratibimba: i16,  // k*p + 1
    pub raw_sum: i16,         // 2*k*p + 1
    pub raw_delta: i8,        // +1 invariant for pratibimba-bimba

    /// Digit-root operational value where the family is scalar.
    pub dr_value: Option<u8>,
    pub dr_bimba: u8,
    pub dr_pratibimba: u8,
    pub dr_sum: u8,

    /// Sixth-family cells such as "-1/1/57" are rule/tuple values, not scalars.
    pub rule_value: Option<String>,

    /// Optional semantic event emitted only when the raw face hits a skeleton marker.
    pub skeleton_event: Option<AnandaSkeletonEvent>,
}

#[repr(u8)]
pub enum AnandaSkeletonEvent {
    Hit36 = 0,
    Hit64 = 1,
    Hit72 = 2,
    Ratio64Over36 = 3,
    Additive137 = 4,
    IdentityReturn4Plus2 = 5,
}

pub struct DrRingPhase {
    pub mahamaya_idx: u8,    // 0..5 — the {1,2,4,8,7,5} doubling track
    pub parashakti_idx: u8,  // 0..5 — the {3,6,9,3,6,9} tripling track
}

#[repr(u8)]
pub enum AnandaMatrixOp {
    Bimba = 0,
    Pratibimba = 1,
    Sum = 2,
    DiffA = 3,
    DiffB = 4,
    Quintessence = 5,
}
```

**Anti-greenfield with correction:** the digit-root face is already present in `.rodata`, but the raw/no-digi-root face is canonical in the CSV and not yet faithfully surfaced by the C API. Tranche 10.10 therefore has two steps: first align the C Ananda API/generator with the CSV's six 12×12 raw+DR family faces, then route `AnandaVortexProjection` through the profile bus. The renderer must not reconstruct either face locally.

---

## 5. Visual Rendering Contract

The DR-M1-2-ratified Bevy/wgpu extension `m1-paramasiva-played-torus` consumes the `ananda_vortex` profile field (§4.3) and renders the K² topology with the vortex visibly riding on its surface.

### 5.1 K² mesh — base geometry

- Bevy `Mesh3d` for the chromatic-fifths torus `T² = S¹_chromatic × S¹_fifths`.
- **Major radius `R`** along chromatic-longitude (12-stack of `9/8` epogdoon ticks).
- **Minor radius `r`** along fifths-meridian (`3/2` leaps).
- **Aspect `R/r = 9/8`** — the epogdoon-tick encoded directly as torus geometry (`physical-pole-stack-architecture.md:110`).
- **Klein identification** rendered via parameter `helix_sheet ∈ {0, 1}` from `ananda_vortex.helix_sheet` — an SO(3) rotation applied to the torus's binormal frame, computed from `ring_quaternion` via `quat_rotate`.

### 5.2 Ananda vortex placement on K² — the texture parameterisation

The vortex is **not** a separate object hovering off the torus — it IS the texture parameterisation of K² itself.

- **Texture U** = chromatic-longitude `φ`, sampled from `position6` → column index of active matrix
- **Texture V** = fifths-meridian `θ`, sampled from `tick12 / 6 × 6 + (current Vimarśa lens-anchor row)` → row index
- At each tick, K² displays the **active Ananda family** as a 12×12 dual-register heatmap laid over the torus surface, one cell luminous at `(active_cell.0, active_cell.1)`. Default colour/intensity reads the digit-root face; developer/proof mode overlays the raw/no-DR value so `36`, `64`, `72`, `16/9`, and `137` events are visible without re-derivation.
- **Six matrices stacked as perspex cross-fade** keyed off `active_matrix_op` — each matrix is a glass layer; the active one opaque at 100%; predecessor/successor at ~20% opacity; six-layer perspex stack effect.
- **Skeleton-event glyphs** appear only from `ananda_vortex.active_cell_value.skeleton_event`: `7X+1` p=5/p=9 marks `36/64`; `8X+0` p=8/p=9 marks `64/72`; the additive parent marker displays `64+72+1=137`.

### 5.3 The two DR rings as flow-streamlines

Overlay two animated streamlines on the K² surface, traced through the matrix cells:

- **Mahāmāyā streamline** (`DR_RING_MAHAMAYA = {1,2,4,8,7,5}`): 6-vertex polyline in **gold** — the 64-bit doubling axis. One full pass per ascending half-tick (tick12 0→5). Advances one vertex per tick using `ananda_vortex.dr_ring_phase.mahamaya_idx`.
- **Paraśakti streamline** (`DR_RING_PARASHAKTI = {3,6,9,3,6,9}`): 6-vertex polyline in **emerald** — the 72-name tripling axis. One full pass per descending half-tick (tick12 6→11). Advances one vertex per tick using `dr_ring_phase.parashakti_idx`.

These streamlines ARE the literal vortex. The two diagonals of the matrix are the two vortex spins; seeing them sweep is seeing the vortex move.

### 5.4 Cl(4,2) basis as colour-binary

- **Implicate positions (signature -1):** P0 (sin) and P5 (cos) — render in **cool indigo** (the generator poles)
- **Explicate positions (signature +1):** P1 (tan), P2 (sec), P3 (cot), P4 (csc) — render in **warm amber-through-vermilion gradient** (the derived ratios)
- The colour key paints the **active cell halo** at each tick, driven by `ananda_vortex.cl42_signature_at_position`. P0/P5 ticks have indigo halos; P1-P4 have warm halos.
- The +2 net signature of Cl(4,2) becomes literally visible as the colour-balance over a cycle.

`QL_TRIG_TABLE[6]` (m1.h:654-661) gives the numerator/denominator QL position per trig function — render as a paired-glyph above each active cell (e.g. `tan` shows `[0]/[5]` indicating sin/cos generator-decomposition).

### 5.5 Hopf fibre as the second sheet

`hopf_fiber(degree_720)` returns 0 for `degree<360` and 1 for `degree≥360`. Render the second 360° as a **phase-shifted second torus** at 30% opacity, concentric with the first — the SU(2) shadow phase that has to complete before the system re-identifies.

The tritone-mirror **Klein flip** at Lens N ↔ Lens N+3 (`M1'-SPEC §6`) is rendered as the moment the two concentric tori briefly **interpenetrate** — the played torus visibly folds through itself. Triggered by `ananda_vortex.klein_flip_at_this_tick`.

### 5.6 Diamond at centre

The QL geometric object (`paramasiva-ux-full-m1-branch.md §5`) sits at the torus centre — a small octahedron (6 vertices = 6 QL positions) whose vertex colours mirror the Cl(4,2) signature. Its rotation rate is identical to K² precession but its axis is the Möbius identification axis. When K² Klein-flips, the diamond stays still — visible proof of the matheme's self-identity through inversion.

---

## 6. Tick Choreography — The Animation Primitive

### 6.1 The carry-the-tick primitive: `quat_slerp` of K² orientation

**Single load-bearing animation primitive:** quaternionic slerp of K² orientation through `RING_QUATERNION_LUT[12]`. This is the only animation honest to the substrate.

```rust
on tick_advance(t, t+1, dt):
    let q_from = ananda_vortex.ring_quaternion;
    // Renderer reads the NEXT tick's profile when advancing — or interpolates
    // locally via quat_slerp(LUT[t], LUT[(t+1) % 12], dt / TICK_PERIOD)
    K².orientation = quat_slerp(q_from, q_to, dt / TICK_PERIOD);
    K².helix_sheet = ananda_vortex.helix_sheet;
```

12-keyframe slerp → one full 360° SO(3) revolution per 12 ticks. Hopf bundle structure means this 360° leaves the helix-sheet flag flipped; **a second 360° returns identity at tick 11→0** — the **720° SU(2) recognition** is *seeable* as the moment the helix-stripe matches its original orientation.

### 6.2 What changes simultaneously on tick advance

| Surface element | Change | Source field |
|---|---|---|
| K² orientation | Slerps 30° of SO(3) | `ring_quaternion` |
| Active Ananda family | Cross-fade old→new (50%→100%) | `active_matrix_op` |
| Luminous dual-register cell | Jumps `(t, t%6) → (t+1, (t+1)%6)` with 200ms exponential decay trail; DR face is primary, raw face visible in proof overlay | `active_cell` + `active_cell_value` |
| Mahāmāyā streamline | Pulses next gold vertex; previous dims | `dr_ring_phase.mahamaya_idx` |
| Paraśakti streamline | Pulses next emerald vertex; previous dims | `dr_ring_phase.parashakti_idx` |
| Cl(4,2) halo | Recolours (indigo if P0/P5; warm if P1-P4) | `cl42_signature_at_position` |
| Audio-octet shimmer | 8 particle emitters around diamond pulse at `audio_octet[0..8]` Hz | `audio_octet` (Vimarśa-window) |
| Nodal quartet | 4 S² satellite glyphs orbit diamond at radii `~ nodal_quartet[i].m/n` | `nodal_quartet` (Vimarśa-window) |
| Hopf shadow torus | Phase rotates 30° (lags primary by half-tick) | `helix_sheet` + degree720 |

### 6.3 What stays still on tick advance

- **Diamond at torus centre** — only precesses at the slow rate, never jumps per tick. Matheme's still-point.
- **K² mesh texture UV mapping** — only orientation rotates; matrix grid never swims across surface.
- **Cl(4,2) basis legend** — static glyph-strip at viewport bottom showing `P0=sin … P5=cos` with current `position6` highlighted.

### 6.4 Where the eye goes per tick

- **Default focus:** the luminous Ananda cell on K² (the bright pulse jumping cell-to-cell along matrix diagonals)
- **Peripheral motion:** SO(3) precession of K² (torus tumbles gently)
- **Foveated highlight on cross-matrix transitions:** on every tick crossing `t%6 → (t+1)%6`, render with a soft "lens swipe" wipe — the matrix swap is the most semantically loaded event.

### 6.5 What happens at the 5→6 boundary (bimba/pratibimba flip)

- `helix_sheet` toggles 0→1
- K² torus **folds through itself** for ~200ms (Klein-flip animation; chromatic and fifths circles briefly cross)
- Matrix cells re-read with `+1` Ananda axiom offset visible — every cell increments by 1 mod 10 in a wave from P0 to P5
- Mahāmāyā streamline retreats (it ran 0→5); Paraśakti streamline activates (it runs 6→11 = descending Möbius)
- Audio-octet octave-lift: eight emitters' colour-temperature shifts toward blue (Vimarśa `octave_lift = 12.0` at `parashakti/vimarsha_reading.rs:52`)
- **`klein_flip_at_this_tick = true`** on the bus; M2' cymatic surface subscribes (`M1'-SPEC §6`)

### 6.6 What happens at the 11→0 boundary (full Möbius return)

- K² has completed 720° of SO(3) precession; `helix_sheet` returns to 0
- **QL Möbius-return indicator** fires — brief whole-surface bloom in the colour of current lens-anchor
- Diamond at centre emits one bright pulse (the 100% percentile identity return; `m1.h:408, 415`)
- **720° SU(2) recognition is visibly recognised** without explanation — the identity-return IS the recognition

### 6.7 Simultaneous vs sequential rendering layers

| Layer | Render cadence |
|---|---|
| K² mesh + orientation, diamond + nodal quartet, Cl(4,2) legend, audio-octet emitters | Every frame |
| Active Ananda matrix cross-fade, luminous cell jump, DR streamlines advance, Hopf shadow phase | Tick-quantised |
| Klein-flip self-interpenetration, Möbius-return bloom | Boundary-quantised (5→6, 11→0) |
| Chromatic-substrate hue retune | Lens-anchored (only on `lens_mode` change) |

---

## 7. Boundary Contracts

### 7.1 M1↔M2 Vimarśa-window contract (load-bearing)

`audio_octet[8]` particle emitters and `nodal_quartet[4]` satellite glyphs in the played-torus are **windows onto M2-1' Vimarśa's writes**, never locally re-derived.

- **Vimarśa writes** at [`Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-93`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs)
- **M1' subscribes** via the profile bus; reads `audio_octet`, `nodal_quartet`
- **M1' never** invokes a synthesiser, never indexes `m2.h` LUTs locally for octave-lift, never computes intervals from M1-side state

This is the central M1↔M2 contract for cycle-3 and beyond. It is the bimba/pratibimba dial at the engine layer: M1 walks the matheme, M2 reads it, M1 hears what M2 read.

### 7.2 K²-only / M3-5 double-torus boundary

The played-torus renders a **single K² only**. The downstream `K² × T²_Mahāmāyā` double-torus belongs to **M3-5** (`M1'-SPEC §1, §13.6`; `M3'-SPEC`). The Bevy/wgpu build must NOT cross that boundary — any double-torus rendering is M3-5's authority.

### 7.3 M1 ↔ M2 ↔ M3 composition (integrated 1-2-3 plugin)

Per Tranche 07 (integrated 1-2-3 cosmic engine plugin):

- M1 ring + M1-2 ananda vortex + M1-5 K² → the played topology
- M2 cymatic engine renders frequencies on K² surface (consumes Vimarśa writes)
- M3 codon-rotation projection lights up cells in response to active profile tick

**Composition over juxtaposition**: one surface, three poles, one composition. Not three side-by-side widgets. The cosmic-1-2-3 editor-area composition (Tranche 15.4) is the surface; the played-torus is its M1 pole.

---

## 8. IDE Integration (Theia / `m1-paramasiva-played-torus`)

### 8.1 Extension placement

- **New extension** (DR-M1-2 ratified, build pending): `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/`
- Bevy/wgpu toolchain in `package.json`
- Architecture skeleton at `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` (this document's IDE-mirror)
- Existing extension `Body/M/epi-theia/extensions/m1-paramasiva/` (2D React clock-instrument) is **distinct** — it stays as the inspector/instrument surface; the played-torus is the 3D rendering surface

### 8.2 Surface placement in the IDE

- **Cosmic-side of `daily-0-1`** (integrated 1-2-3 composition): played-torus is the centrepiece, with M2 cymatic engine and M3 codon-rotation composing on its surface
- **`ide-deep` `m1-paramasiva` view**: played-torus is the editor-area widget; the 2D `m1-paramasiva` extension provides the clock-instrument + audioBusInspector chrome
- **OmniPanel (right sidebar):** Pi runtime monitoring; dispatch trace; capability list. NO M1-2 visualisation in the OmniPanel — the played-torus is the editor surface, not a sidebar tool.

### 8.3 Profile-tick clock as global UI clock (Tranche 15.6)

The played-torus subscribes to the kernel-bridge profile-tick event. Every tick advance is a render frame for the slerp + vortex update. No local clock. No animation-frame-count fallback.

### 8.4 Provenance inline rendering (Tranche 15.6)

When `ananda_vortex` is missing or pending (e.g. before Tranche 10.10 lands), the played-torus renders with the **`pending-ananda-vortex` overlay** — the K² mesh shows but the matrix heatmap, streamlines, and cell-jump animation are blocked-overlay, with the kernel-bridge readiness reason visible inline. No silent degradation.

### 8.5 Bimba/Pratibimba state persistence (Tranche 15.7)

When the user toggles `daily-0-1` ↔ `ide-deep`, or 0/1 cosmic/personal:

- The played-torus's current `(tick12, position6, lens_mode, active_matrix_op)` state survives
- The K² orientation survives (resumes mid-slerp at the same `degree720`)
- Session continuity is preserved through the kernel-bridge DI singleton

### 8.6 Accessibility — pause/scrub

The played-torus accepts a `pause` and `scrub_to_tick(t)` affordance. Scrubbing replays the deterministic state at `(tick12, degree720, lens_mode, active_matrix_op)`. The animation primitive (slerp) is deterministic under replay per Tranche 15.9 verification.

---

## 9. Anti-Greenfield Audit

### 9.1 Landed in code (consume, do not re-invent)

| Asset | Location |
|---|---|
| Digit-root Ananda `.rodata` face (432 bytes) | `Body/S/S0/epi-lib/src/m1.c:22-114` |
| Current Ananda runtime API (`m1_ananda_get`, `_dr_get`, `_verify_axiom`) | `m1.c:297-345`, `m1.h:145-151` — drift noted: 10×10 `%10` core, not full CSV raw+DR 12×12 authority |
| DR rings (Mahāmāyā + Paraśakti) | `m1.c:122-123` |
| Ring quaternion LUT (12 unit quaternions, 30° spacing) | `m1.h:551-564` |
| Cl(4,2) basis + trig table | `m1.h:629-661` |
| Topological element count LUT | `m1.h:580-583` |
| Hopf bundle projection | `Body/S/S0/portal-core/src/hopf.rs:7-54`, `m1.h:667-678` |
| Spanda quantiser | `Body/S/S0/portal-core/src/spanda.rs:9-29` |
| Spanda↔Ananda parallel-track invariant | `m1.h:735-756` |
| `MathemeHarmonicProfile` struct | `Body/S/S0/portal-core/src/kernel.rs:346-465` |
| Vimarśa audio_octet/nodal_quartet writer | `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-93` |
| Quaternion math (mul, slerp, rotate, normalise, conj) | `m1.h:454-523`, `Body/S/S0/portal-core/src/quaternion.rs` |
| Existing 2D M1 extension (clock-instrument) | `Body/M/epi-theia/extensions/m1-paramasiva/` |
| Source dataset (Vortex Modulae CSV) | `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - … .csv` |

### 9.2 Pending (cycle-3 deliverables)

- **Tranche 10.10** — `ananda_vortex: AnandaVortexProjection` field on `MathemeHarmonicProfile`
- **Tranche 10.10a** — align C generator/API with Vortex Modulae CSV raw/no-DR + digit-root 12×12 faces before exposing the profile field
- **Tranche 02.6** — `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` directory + Bevy/wgpu toolchain
- **Tranche 15.8** — concrete K² + matrix-heatmap + DR-streamlines + Cl(4,2) colour-binary visual implementation
- **Tranche 15.9** — `quat_slerp` tick choreography + Klein-flip + Möbius-return events

### 9.3 Net-new (M' product surface, anti-greenfield exception)

- **Diamond/octahedron centre object** — claimed by UX `paramasiva-ux-full-m1-branch.md §5`; no substrate geometry exists; purely aesthetic addition
- **Klein-flip self-interpenetration animation** — substrate gives `hopf_fiber` toggle; visual fold is renderer-side choreography
- **Möbius-return bloom** at tick 11→0 — substrate gives the topology; bloom is renderer choreography
- **`pending-ananda-vortex` overlay** — provenance rendering primitive consistent with Tranche 15.6

### 9.4 Forbidden (do not invent)

- Local pitch synthesis (`M1'-SPEC §13.5`)
- Local clock (`paramasiva-ux-full-m1-branch.md §10`)
- Local forking of `m1.h` constants into TS/wgsl tables (`M1'-SPEC §13.3, §13.5`)
- Local graph relation inference (`M1'-SPEC §3`)
- Double-torus rendering (`M1'-SPEC §1` — that's M3-5's territory)

---

## 10. Test Criteria

The played-torus extension is acceptance-ready when:

1. `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus` succeeds
2. Bevy/wgpu toolchain declared in `package.json`
3. Render-test: `DOUBLE_COVER_DEG = 720` and `TORUS_GENUS = 1` derived from substrate (no local fork)
4. Render-test: cell heatmap values match the profile-bus `AnandaVortexCell` for ≥6 `(tick12, position6)` pairs, including both raw and digit-root values
4a. CSV-fidelity test: `7X+1` raw p=5/p=9 exposes `36/64`, `8X+0` raw p=8/p=9 exposes `64/72`, and their digit-root faces match `m1.c` `.rodata`
5. Animation-test: a 12-tick capture shows monotonic SO(3) precession (angle increases by 30°/tick) and matrix-foreground rotates through 6 `Ananda_Matrix_Op` values
6. Klein-flip test: tick crossings 5→6 and 11→0 produce non-trivial mesh self-intersection frame; `helix_sheet` matches `hopf_fiber(degree720)`
7. Cl(4,2) colour test: halo hues at `position6 ∈ {0, 5}` within indigo band; `position6 ∈ {1..4}` within warm band
8. Audio-octet test: 8 particle emitters' positions match `MathemeHarmonicProfile.audio_octet[i]` (no local pitch)
9. Replay test: deterministic `MPrimePerformanceEvent` stream produces same orientation/cell trajectory across two runs
10. Privacy test: no private journal/Graphiti payload appears in the rendered surface
11. Boundary test: no `T²_Mahāmāyā` rendering primitive in extension src (M3-5 territory)
12. Vimarśa-window audit: `audio_octet`/`nodal_quartet` consumed via profile-bus subscription, not derived from local LUT lookups

---

## 11. Closing — Why M1-2 Is the Right Place to Put the Vortex

The current UX docs put "the vortex" semantically at M1-2 but visually at M1-5. The substrate agrees: the **data** of the vortex (the six matrices) is M1-2; the **rotational embedding** of the vortex (the 12 ring quaternions, the Hopf bundle, K² topology) is M1-5. The played-torus is M1-5's geometry **carrying** M1-2's data — exactly the bimba↔pratibimba dynamic the system insists on at every scale:

> **Form (M1-5) is the rotation; content (M1-2) is what rotates; tick (M1-3) is the act that binds them. Rendering all three on one surface as one playable instrument is the M' product surface DR-M1-2 ratified.**

The Ananda axiom (`prat - bimba ≡ +1 mod 10`) is the visible heartbeat — every tick, every cell, every K² fold carries that same +1. The matheme's own pulse, finally seeable.

---

*Companion research with full file:line evidence: [`plan.runs/15-m1-2-ananda-vortex-research.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/15-m1-2-ananda-vortex-research.md). Cross-references: `M1'-SPEC §1` (six strata table), `§6` (Klein-flip + visual/audio model), `§13` (canon deltas including `audio_octet` ownership), `paramasiva-ux-full-m1-branch.md §5` (toroidal-diamond), `§6` (QL music-theoretics curriculum).*
