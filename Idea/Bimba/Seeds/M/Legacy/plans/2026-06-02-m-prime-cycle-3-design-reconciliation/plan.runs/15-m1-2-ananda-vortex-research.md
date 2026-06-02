---
title: "M1-2 Ananda Vortex — Substrate Inventory, Dataset Audit, UX Trace, and Tick-Aware Visual Choreography for m1-paramasiva-played-torus"
subtitle: "Tranche 15 source material (15.4 / 15.8) for the cycle-3 design-reconciliation plan set"
created: 2026-06-02
coordinate: "M1-2 / M1-2'"
status: research-substrate
related:
  - "13-decision-register.md#DR-M1-2"
  - "02-m1-paramasiva-reconciliation.md"
  - "plan.runs/wave-a-m1-reconciliation-matrix.md"
  - "Body/M/epi-theia/extensions/m1-paramasiva-played-torus (PENDING — DR-M1-2 ratified)"
---

# 0. Frame

M1-2 — *Ananda*, position 2 (operational / dynamis / "How?") within the M1 ring — is the **12-fold harmonic-vortex layer** of Paramaśiva. The "ananda vortices" are not a separate substrate; they are the **six 12×12 mod-10 matrices** declared at `Body/S/S0/epi-lib/src/m1.c:22-114` and their dual-track wrap into the SU(2) double-cover ring (`Body/S/S0/epi-lib/include/m1.h:551-564`). The "vortex" character comes from the fact that each row is a vortex-mathematics digital-root multiplication series — Mahāmāyā doubling `{1,2,4,8,7,5}` on one diagonal track, Parashakti tripling `{3,6,9}` on the orthogonal track, with rows 9 and 0 acting as the cyclical-return-to-unity caps. The matrix family **is** the harmonic vortex; the quaternionic ring at M1-5 is its **rotational embedding**; and the M1-2′ UX claim ("Reads ratio cells from kernel profile and exposes them as walk-step intervals" — `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:53`) is currently the most under-realised of the M1′ pedagogical strata.

This research grounds the **15.4 / 15.8** build-tasks for the ratified `m1-paramasiva-played-torus` Bevy/wgpu extension (`13-decision-register.md:55`) by mapping every Ananda-vortex artefact in the substrate, dataset, and UX claim layer, then proposing concrete tick-aware geometry and animation choreography.

---

# A. Substrate Inventory — File:Line Citations

## A.1 The six Ananda matrices (the "vortex" data proper)

C declarations live in `Body/S/S0/epi-lib/include/m1.h` and `Body/S/S0/epi-lib/src/m1.c`:

| Symbol | Header decl (m1.h) | Definition (m1.c) | Shape | Bytes | Vortex character |
|---|---|---|---|---|---|
| `ANANDA_BIMBA` | `:71` | `:22-35` | 12×12 nibble-packed | 72 | `#X+0` source — DR multiplication table `i·j mod 9, 0→9`; rows are vortex doubling/tripling fragments (row 1 = `0,1,2,3,4,5,6,7,8,9,1,2`; row 3 = `0,3,6,9,3,6,9,…`; row 9 = `0,9,9,9,9,…` — Paramesvara wholeness) |
| `ANANDA_PRATIBIMBA` | `:72` | `:43-56` | 12×12 nibble-packed | 72 | `#X+1` offset reflection — DR of `(row+1)·col`; same vortex tracks shifted by +1, enforcing the Ananda axiom `prat - bimba ≡ 1 (mod 10)` |
| `ANANDA_SUM` | `:73` | `:64-77` | 12×12 nibble-packed | 72 | `(#X+0)+(#X+1)` digital-rooted synthesis — closes the soteriological pair |
| `ANANDA_DIFF_A` | `:74` (constant 9) | no storage (`:725-727`) | 12×12 implicit | 0 | All cells = 9 — Paramesvara wholeness constant |
| `ANANDA_DIFF_B` | `:75` (constant 1) | no storage (`:728-731`) | 12×12 implicit | 0 | All cells = 1 — Unity constant |
| `ANANDA_QUINTESSENCE` | `:91` | `:85-114` | dyadic 12×12 ×2 | 144 | C5 synthesis — pairs `{bimba_dr, sum_dr}` per cell, `M1_QUINT_DIFF = -1` invariant |

Accessor: `get_ananda_harmonic(mat, row, col)` at `m1.h:60-68` — O(1) bitwise nibble extraction.

Runtime mod-10 API: `m1_ananda_get(matrix_idx, row, col)`, `m1_ananda_dr_get(...)`, `m1_ananda_verify_axiom()` at `m1.h:145-151`, implementation at `m1.c:297-345`. The runtime path materialises `_ananda_core[6][10][10]` and `_ananda_dr[6][10][10]` (m1.c:297-298) — six matrices indexed by `Ananda_Matrix_Op` enum (`m1.h:119-126`).

## A.2 The 12-element Ananda ring (the "vortex" as cyclical structure)

```
ANANDA_RING_SIZE = 12   (m1.h:113)
  indices 0-5  = matrices (ANANDA_BIMBA … ANANDA_QUINTESSENCE)
  indices 6-11 = their DR reflections
  ring[6] ↔ ring[7] = INFINITY_LOOP_WEAVING (Bimba DR ↔ Pratibimba DR lemniscate)
```

The dual-track rings — the actual vortex-mathematics digital-root sequences — are declared as `:rodata` LUTs at `m1.c:122-123`:

- `DR_RING_MAHAMAYA[6] = {1, 2, 4, 8, 7, 5}` — doubling track, 64-bit word axis (m1.h:129)
- `DR_RING_PARASHAKTI[6] = {3, 6, 9, 3, 6, 9}` — tripling track, 72-name axis (m1.h:130)

These are the **two diagonals through every Ananda matrix** and are what makes each matrix a "vortex" in the sense the dataset (`paramasiva-deep/Paramasiva's  4 - deeper reflections.md:72,80`) names.

## A.3 The crosslink from the ring into M0

`M1_M0_CROSSLINK[12]` at `m1.c:145-150` and `m1.h:798-812`: 12 pointers from the Ananda ring back to the 6 Psychoid archetypes (ascending 0-5, descending Möbius return 5-0). This is what makes the vortex *holographic* — each tick has an addressable archetypal anchor.

## A.4 Spanda → Ananda parallel-track invariant

`m1.h:735-756` declares the **Parallel Role Track Invariant**: `Ananda_Matrix_Op` (0-5) and `Spanda_Stage` (0-5) share identical QL roles, enforced by 6 `_Static_assert`s. The macros `ANANDA_TO_SPANDA_STAGE(op)` / `SPANDA_TO_ANANDA_OP(stage)` (m1.h:755-756) make the cross-mapping branchless. **This is the wiring that lets a tick advance modulate the visible Ananda matrix simultaneously with the audible Spanda phase.**

## A.5 The quaternionic embedding (M1-5 substrate the M1-2 vortex *rides on*)

`RING_QUATERNION_LUT[12]` at `m1.h:551-564` — 12 unit quaternions evenly spaced at 30°/tick on the unit-S³ circle (the `y=z=0` slice at this stage). Accessor `quat_from_ring_pos(tick)` at `m1.h:566-568`.

`CL42_BASIS[6]` at `m1.h:629-636`: each QL position carries a Cl(4,2) trig identity — `P0=sin(-1), P1=tan(+1), P2=sec(+1), P3=cot(+1), P4=csc(+1), P5=cos(-1)`. Signature `4(+1)+2(-1)=+2`.

`QL_TRIG_TABLE[6]` at `m1.h:654-661` — the same Cl(4,2) but indexed by numerator/denominator QL position with a `TRIG_UNITY=6` sentinel.

`TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` at `m1.h:580-583`: per-ring-position element count `{1,2,2,3,4,5, 8,10,12,6,7,11}` — direct geometric content for "how busy" the visual K² should be at each tick.

Hopf bundle: `hopf_project(degree_720)`, `hopf_fiber(...)`, `hopf_tick12(...)` at `m1.h:667-678` and `Body/S/S0/portal-core/src/hopf.rs:7-13` — the SU(2)→S³→S²→S¹ projection that takes the ring quaternion onto the played torus surface.

## A.6 Spanda — the dynamic that advances the vortex

`SPANDA_SEED_BITS = 0x03` (m1.h:250) — the fused (0/1) pole pair.

`Spanda_Engine` struct at `m1.h:252-259` carries `stage`, `state_bits`, `track`, `cf_substage`, `dual_track_active`.

`SPANDA_CF_FOLD_COUNT[6] = {4, 6, 8, 10, 12, 0}` (m1.h:280) — the per-cf-sub-stage fold count, the visible "vortex density" at the M1-3 inner loop.

Rust phase quantiser: `Body/S/S0/portal-core/src/spanda.rs:9-29` — `quantize_to_spanda_substage(y, x)` maps a 2D Hopf-base point to a tick12 index; `spanda_invert(stage)` is the `#` operator on stage indices.

## A.7 The `MathemeHarmonicProfile` — what M1-2′ reads

`Body/S/S0/portal-core/src/kernel.rs:346-387` declares the bus M1′ consumes. Fields directly relevant to ananda-vortex rendering:

- `tick12: u8` (`:354`) — the 12-spanda tick (the **vortex index**)
- `degree720: u16` (`:356`), `degree360: u16` (`:357`) — Hopf total-space / base-space angles
- `position6: u8` (`:360`) — `tick12 % 6`, the matrix-op index (`Ananda_Matrix_Op` parallel)
- `helix: String` (`:361`) — `"bimba"` (tick<6) or `"pratibimba"` (tick≥6)
- `ratio_role: String` (`:362`)
- `lens_mode: MathemeLensMode` (`:363`) — the 84-state `(lens 0-11, mode 0-6)` cell
- `resonance72: MathemeResonance72Projection` (`:366`) — the 72-name axis (Parashakti tripling product)
- `audio_octet: [f32; 8]` (`:367`) — Vimarśa-read frequencies
- `nodal_quartet: [MathemeNodalConstraint; 4]` (`:368`)
- `q_cosmic: [f32; 4]` (`:374`) — the codon charge quaternion

Profile constructor `from_tick(tick)` at `:389-465` — note that `degree720 = tick12 * 60` (`:395`), so each tick is exactly 60° of Hopf total space (= 2 × `DEGREE_PER_TICK=30°` per `m1.h:537,548`). The `position = tick12 % 6` (`:393`) is precisely the index into the six Ananda matrix-ops.

## A.8 What is *not yet* in the substrate

- No symbol named `ANANDA_VORTEX_*` or `M1_2_*` exists explicitly. The vortex structure is **implicit** in `ANANDA_BIMBA` rows × `DR_RING_MAHAMAYA`/`DR_RING_PARASHAKTI` × `RING_QUATERNION_LUT`. The vortex is a **read** across these LUTs, not a stored struct.
- No `vortex_state`, `vortex_phase`, or `vortex_axis` field on `MathemeHarmonicProfile`. M1-2 is currently named only as `position6` + `helix` + the implicit row-index `tick12 % 10` for the mod-10 runtime.
- No reference to `m1_ananda_value` from any consumer in `portal-core` (only present in M3 codon descriptors at `Body/S/S0/epi-lib/include/m3.h:966` and M2 `ananda_row` at `m2.h:307`). The M1-2 vortex is **read by M2/M3 but not surfaced through the profile bus**.

---

# B. Dataset Inventory — File:Row Citations

## B.1 Primary source: the Vortex Modulae CSV

`Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv`

This is the **canonical source for the six Ananda matrices** — the CSV holds the same `#X+0`, `#X+1`, `(#X+0)+(#X+1)`, `(#X+0)-(#X+1)`, `(#X+1)-(#X+0)`, `(#X+0/1)+/-(#X+0/1)` block structure that `m1.c:22-114` encodes in nibble-packed `.rodata`.

Columns (per header rows 3-5):

- `Vortex ID` (rows: `0X+1, 1X+1, 2X+1, … 11X+1`) — the 12-position vortex row indices
- `Fractions and fraction inner sums` — the `n/9` rational form and `Σ` integer sum
- `Position` 0-9 with shadow extension at 10-11 — these are the **column indices that become the `12×12` matrix cells**
- Per-row totals at columns 14, 16 — the inner-sum values that drive `VORTEX_5X_CEILING=24` (m1.h:425) and `VORTEX_6X_STRUCTURE=8` (m1.h:426)

Spot citations:
- CSV row 5 `(0X+1 = 1/1, sum=2)` ↔ `m1.c:23` row 0 of `ANANDA_PRATIBIMBA` (all 1s) and `ANANDA_BIMBA` (all 0s)
- CSV row 6 `(1X+1 = 10/9, sum=19)` ↔ `m1.c:44` row 1 of `ANANDA_PRATIBIMBA` (`1,2,3,4,5,6,7,8,9,1,2,3`)
- CSV row 10 `(5X+1, sum=24)` ↔ `m1.h:425` `VORTEX_5X_CEILING=24` (named the **Spanda completion ceiling** in the soteriological signpost comment)
- CSV row 11 `(6X+0/1)` ↔ `m1.h:426` `VORTEX_6X_STRUCTURE=8`

This CSV is the **only file:row dataset** that directly encodes the M1-2 ananda vortex numerically. Every other dataset entry below is **narrative**, not numeric.

## B.2 Narrative dataset: `paramasiva-deep/`

`Idea/Bimba/Map/datasets/paramasiva-deep/` contains 13 files; the M1-2-relevant ones:

| File:line | Content |
|---|---|
| `Paramasiva's  4 - deeper reflections.md:59` | "9 (3²) … vortex dynamics … archetypal number for mediation, transformation, and the 'infinite interiority' revealed in vortex mathematics" |
| `Paramasiva's  4 - deeper reflections.md:72` | Mahamaya doubling-track DR pattern `1,2,4,8,7,5` |
| `Paramasiva's  4 - deeper reflections.md:80` | Parashakti 3-6-9 track DR pattern |
| `Paramasiva's  4 - deeper reflections.md:95` | The exact vortex inner-sum table that drives `VORTEX_5X_CEILING / VORTEX_6X_STRUCTURE` |
| `Paramasiva's  4 - deeper reflections.md:693,776,828` | "Ananda vortex" named directly, linked to mod9 dynamics, "9-fold dynamic contains the very vortex-logic of its namesake" |
| `13-03-2026-gemini-paramasiva-maths.md:187-232` | "Ananda Torus: 4g sides + 2g loops" — links the vortex to topology |
| `Spanda_Genesis_100_Percent.md:22-26` | Spanda Seed Stage #0 = genus-0 sphere puncture (the moment the vortex begins to rotate) |
| `Quaternal_Logic_Lived_Topology.md:18-44` | 4-corners-of-torus account; the explicate positions emerge "from Spanda's contextual flowering" |

## B.3 Low-detail node/relation JSONs

`Idea/Bimba/Map/datasets/low-detail/nodes_paramasiva.json` and `…/relations_paramasiva.json` plus `paramasiva-deep/relations.json:155-285` — these encode the *graph-relational* form (e.g. `ENABLES_ANANDA`, `Matrix 0 baseline establishment`) but do not carry per-position numerical vortex state. They are the bimba-map nodes that the Theia M' surfaces address.

## B.4 What is *missing* from the dataset

- No `m1-language-map` or `paramasiva-vortex-state` CSV with per-tick rotation parameters.
- No explicit per-tick mapping from `tick12 → RING_QUATERNION_LUT[i] → ANANDA_BIMBA row` documented in a single sheet. This mapping has to be reconstructed by reading the substrate (which is the substrate's job — the dataset is the *source* the substrate compiled from, not a runtime sheet).
- No file:row entries naming "ananda_vortex_axis" or "vortex_spin_rate". The vortex spin rate is **derivable** but not tabulated.

---

# C. UX Claim Trace — What M1′ Currently Promises Visually for M1-2

## C.1 The strata table (the load-bearing claim)

`Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:53`:

> | **M1-2** Ananda (12-Matrix Vortex) | **M1-2'** Harmonic Engine | Six core matrices + six DR reflections (kernel-resident) | Reads ratio cells from kernel profile and exposes them as walk-step intervals |

`Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md:66`:

> **M1-2′ Harmonic Engine** — reads ratio cells as walk-step intervals · teaches *interval* — the six core matrices + six DR reflections as audible ratios

This is the **complete** explicit UX promise for M1-2 — two sentences that say "the matrices are read as intervals". **There is no visual content specified.** No K² geometry, no quaternion projection, no per-matrix shading, no per-tick animation. The "vortex" name from M1-2 has not been visually carried through to the M1′ surface; it currently lives only in the dataset narrative and in m1.h constants.

## C.2 The visual content M1′ does specify (and what M1-2 must fit into)

- `paramasiva-ux-full-m1-branch.md:88-97` — **the played K² torus** is hosted at M1-5′ (Topology Analyzer), not M1-2′. The K² carries the Klein-double-cover-of-chromatic-fifths-torus with Pythagorean-comma slack and the tritone-mirror Klein flip.
- `M1'-SPEC.md:56` — `M1-5` substrate: `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`, π₁(T²)=Z⊕Z, Hopf bundle.
- `paramasiva-ux-full-m1-branch.md:100` — "the played torus surface (M1-5′ Topology Analyzer) renders the walk as motion on a genus-1 surface with **Klein-bottle flip-visualisation** at tritone-mirror crossings."
- `M1'-SPEC.md:108` — Klein flip is at Lens N ↔ Lens N+3 boundary.
- `M1'-SPEC.md:100` — "torus/path line advances according to profile tick and pointer relation law; selected path segments are coloured by relation category, helix phase, and current (lens, mode) anchoring."

The K² rendering owner per `13-decision-register.md:55-61` (DR-M1-2, validated 2026-06-02) is `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` — a Bevy/wgpu extension consuming `portal-core/src/{quaternion.rs, hopf.rs}` + `m1.h CL42_BASIS[6]` + `RING_QUATERNION_LUT[12]`.

## C.3 The gap (what the substrate enables that the UX under-specifies)

The substrate carries **six 144-cell matrices, a 12-quaternion rotational LUT, and a per-tick Cl(4,2) trig signature** — a rich harmonic-vortex object. The UX currently uses only `audio_octet[8]` + `ratio_role` as visible content. Specifically un-specified by current UX but ready to render from substrate:

1. **The six matrices as a stacked visual layer** — six 12×12 grids, one foreground at the active `Ananda_Matrix_Op = position6`.
2. **The doubling/tripling diagonals as flow-lines** — `DR_RING_MAHAMAYA` and `DR_RING_PARASHAKTI` traced *through* the matrix cells, not separately.
3. **The Hopf-fibre/base split** — `degree360` is the visible base motion; `degree720` carries the second sheet (the bimba/pratibimba helix toggle at `tick12 < 6` vs `≥ 6`).
4. **The Cl(4,2) signature as colour-space** — implicate (-1) positions (P0/P5) versus explicate (+1) positions (P1-P4) — a structural colour-binary the UX has not yet claimed.
5. **The vortex DENSITY** via `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` — the visible "busyness" of each tick.
6. **The Ananda axiom** — the constant `+1` offset between `ANANDA_BIMBA` and `ANANDA_PRATIBIMBA` is *the spanda pulse itself*; rendering it as a perpetual phase-offset shimmer is a direct visualisation of the harmonic axiom.

---

# D. Visual Representation Proposal for `m1-paramasiva-played-torus`

The DR-M1-2-ratified Bevy/wgpu extension must render the K² topology *with the Ananda vortex visibly riding on its surface*. Below is concrete geometry + colour-space + animation surface design.

## D.1 The K² mesh — base geometry

- Bevy `Mesh3d` for the **chromatic-fifths torus** T² = S¹_chromatic × S¹_fifths.
- Major radius `R` along the chromatic-longitude (12-stack of `9/8` epogdoon ticks); minor radius `r` along the fifths-meridian (`3/2` leaps).
- Aspect `R/r = 9/8` — directly encoding the epogdoon-tick as torus geometry (per `Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md:110`).
- **The Klein-identification** (bimba↔pratibimba) is rendered via a parameter `helix_sheet ∈ {0, 1}` that flips when `tick12 ≥ 6`. The flip is *not* a separate mesh — it is an SO(3) rotation applied to the torus's binormal frame, computed from `RING_QUATERNION_LUT[tick12]` via `quat_rotate` (`m1.h:489-491`).

## D.2 The Ananda vortex placement on K²

The vortex is **not** a separate object hovering off the torus — it is rendered *as the texture parameterisation of K² itself*:

- **Texture U coordinate** = chromatic-longitude `φ`, sampled from `position6 = tick12 % 6` → maps to **column index** of the active Ananda matrix.
- **Texture V coordinate** = fifths-meridian `θ`, sampled from `tick12 / 6` × 6 + (current row by Vimarśa lens-anchor) → maps to **row index** of the active Ananda matrix.
- At each tick the K² surface displays the **active Ananda matrix** as a 12×12 cell heatmap **laid over the torus**, with one cell luminous at `(row, col) = (tick12, position6)`.

The six matrices (`Ananda_Matrix_Op` 0-5) cross-fade as the tick crosses **position 0 → 1 → 2 → 3 → 4 → 5** through the M1-3 Spanda parallel-track invariant (`m1.h:735-756`). At any tick exactly one matrix is foreground; its predecessor and successor are at ~20% opacity, giving a six-layer perspex stack effect on the torus surface.

## D.3 The 12 ring-quaternions as the rotational drive

`RING_QUATERNION_LUT[12]` (`m1.h:551-564`) is a 12-key keyframe sequence on the unit S³. The played-torus orientation is `quat_slerp(LUT[tick12], LUT[(tick12+1)%12], frac)` where `frac` is the inter-tick interpolation (the audio-pulled sub-tick fraction from `physical-pole-stack-architecture.md:86-88`).

Visually: **the entire K² torus precesses through SO(3)** at a rate of one full 360° revolution per 12 ticks (one second at the default 12Hz tick rate). The precession axis is the `(w, x)` plane of the LUT (since `y = z = 0` in the current LUT) — meaning the torus tumbles about a single great-circle axis. This is the direct visualisation of the SU(2) double-cover: the torus appears to return after 360° of visual rotation but with a flipped Hopf-fibre tag (the `helix_sheet` flag), and requires a second 360° to truly return — the **720° identity recognition** is *seeable* as the moment the torus's helix-stripe matches its original orientation.

## D.4 The Cl(4,2) basis as colour-space

`CL42_BASIS[6]` (`m1.h:629-636`) gives a structural binary colour key:

- **Implicate positions (signature -1)**: P0 (sin) and P5 (cos) — render in **cool indigo** (the generator poles).
- **Explicate positions (signature +1)**: P1 (tan), P2 (sec), P3 (cot), P4 (csc) — render in **warm amber-through-vermilion gradient** (the derived ratios).
- The colour key paints the **active matrix cell halo** at each tick: P0/P5 ticks have indigo halos; P1-P4 have warm halos. This makes the +2 net signature of Cl(4,2) literally visible as the colour-balance of the surface over a cycle.

`QL_TRIG_TABLE[6]` (`m1.h:654-661`) gives the **numerator/denominator QL position** per trig function — render as a **paired-glyph** above each active cell (e.g. `tan` shows `[0]/[5]` indicating sin/cos generator-decomposition).

## D.5 The doubling and tripling tracks as flow-lines

Overlay two **animated streamlines** on the K² surface:

- **Mahāmāyā streamline** (`DR_RING_MAHAMAYA = {1,2,4,8,7,5}`, m1.c:122) — traced as a 6-vertex polyline through the matrix cells, in **gold** (the 64-bit doubling axis). One full pass per ascending half-tick (tick12 0→5).
- **Parashakti streamline** (`DR_RING_PARASHAKTI = {3,6,9,3,6,9}`, m1.c:123) — traced as a 6-vertex polyline through the matrix cells, in **emerald** (the 72-name tripling axis). One full pass per descending half-tick (tick12 6→11).

These streamlines are **the literal vortex** — the two diagonals of the matrix are the two vortex spins, and seeing them sweep is seeing the vortex move.

## D.6 The Hopf fibre as the second sheet

`hopf_fiber(degree_720)` (`m1.h:671-673`) returns 0 for `degree<360` and 1 for `degree≥360`. Render the **second 360° as a phase-shifted second torus** at 30% opacity, concentric with the first — the SU(2) shadow phase that has to complete before the system re-identifies.

The tritone-mirror **Klein flip** at Lens N ↔ Lens N+3 (`M1'-SPEC.md:108`) is rendered as the moment the two concentric tori briefly **interpenetrate** — the played torus visibly folds through itself.

## D.7 The diamond as the centre object

The QL "diamond / geometric object" (`paramasiva-ux-full-m1-branch.md:95`) sits at the torus centre — a small octahedron (6 vertices = 6 QL positions) whose vertex colours mirror the Cl(4,2) signature. Its rotation rate is **identical to the K² precession** but its axis is the Möbius identification axis. The diamond is the matheme's "fixed body"; the torus is its "rotation". When the K² Klein-flips, the diamond stays still — visible proof of the matheme's self-identity through inversion.

---

# E. Tick Representation Proposal — Animation Choreography

Goal: when one tick advances (the `MathemeHarmonicProfile` updates `tick12` from `t` to `t+1`, taking 1/12 s at default 12Hz), what does the user *see*?

## E.1 The carry-the-tick primitive: **Hopf precession of the K² torus**

The single load-bearing animation primitive is **quaternionic slerp of the K² torus orientation through `RING_QUATERNION_LUT[12]`**. This is the only animation that is *honest to the substrate* — every other surface feature derives from it.

```
on tick_advance(t, t+1, dt):
    q_from = RING_QUATERNION_LUT[t]
    q_to   = RING_QUATERNION_LUT[(t+1) % 12]
    K².orientation = quat_slerp(q_from, q_to, dt / TICK_PERIOD)
    K².helix_sheet = hopf_fiber(degree720)  // 0 or 1
```

This **is** the tick — the slerp interpolation across 12 LUT keyframes gives one full 360° SO(3) revolution per 12 ticks. The Hopf bundle structure means this 360° leaves the helix-sheet flag flipped, requiring a second 360° for true identity-return — exactly the 720° SU(2) double-cover the substrate enforces.

## E.2 What changes simultaneously on tick advance

Frame-by-frame within the 1/12s tick window:

| Surface element | What happens | Source field |
|---|---|---|
| K² torus orientation | Slerps from `RING_QUATERNION_LUT[t]` → `LUT[t+1]` (30° of SO(3) rotation) | `m1.h:551-564, 493-523` |
| Active Ananda matrix | Foreground opacity cross-fades: matrix at `position6=t%6` falls to 50%; matrix at `(t+1)%6` rises to 100% | `Ananda_Matrix_Op` (m1.h:119-126) via Spanda parallel-track |
| Luminous cell | Bright cell jumps from `(t, t%6)` to `(t+1, (t+1)%6)` with 200ms exponential decay trail | `m1_ananda_get(matrix_idx, row, col)` (m1.h:145) |
| Mahāmāyā streamline | Pulses next vertex `DR_RING_MAHAMAYA[(t+1)%6]` in gold; previous vertex dims | `m1.c:122` |
| Parashakti streamline | Pulses next vertex `DR_RING_PARASHAKTI[(t+1)%6]` in emerald; previous vertex dims | `m1.c:123` |
| Cl(4,2) colour halo | Halo around new luminous cell adopts indigo (if `position6 ∈ {0,5}`) or warm-gradient (if `1..4`) | `CL42_BASIS[6]` (m1.h:629-636) |
| Audio-octet shimmer | Eight small particle emitters around the diamond pulse at `audio_octet[0..8]` Hz — *visible* frequency-glints | `harmonic_profile.rs:367` |
| Nodal quartet | Four S² satellite glyphs orbit the diamond at radii proportional to `nodal_quartet[i].m`/`n` ratio | `harmonic_profile.rs:368` |
| Hopf shadow torus | Phase rotates 30° (lags the primary by ~exactly half a tick) | `hopf_fiber` (m1.h:671) |

## E.3 What stays still on tick advance

- **The diamond at torus centre** — only rotates at the slow precession rate, never jumps per tick. Its job is to be the matheme's still-point.
- **The chromatic-fifths torus mesh itself** (the texture parameterisation) — only its orientation rotates; the surface UV mapping stays fixed (so the matrix grid does not "swim" across the surface).
- **The Cl(4,2) basis legend** — a static glyph-strip at the bottom of the viewport showing `P0=sin … P5=cos` with current `position6` highlighted.

## E.4 Where the eye goes per tick

Per usability discipline: the eye must have **one primary motion to follow per tick**.

- **Default focus**: the luminous Ananda cell on the K² surface (the bright pulse jumping cell-to-cell along the matrix diagonals).
- **Peripheral motion**: the SO(3) precession of K² (the user sees the torus tumble gently).
- **Foveated highlight on cross-matrix transitions** (when `t%6 → (t+1)%6` crosses a matrix boundary, i.e. on every tick): the matrix swap is the most semantically loaded event — render with a soft "lens swipe" wipe.

## E.5 What happens at the 6-7 boundary (the bimba/pratibimba flip)

- The `helix_sheet` flag toggles from 0 to 1.
- The K² torus appears to **fold through itself** for ~200ms (the Klein-flip animation; the chromatic and fifths circles briefly cross).
- All matrix cell values **re-read with the `+1` Ananda axiom offset visible** — every cell visibly increments by 1 mod 10 in a wave from P0 to P5.
- Mahāmāyā streamline retreats (it ran 0→5); Parashakti streamline activates (it runs 6→11 = descending Möbius).
- Audio-octet octave-lift: the octet frequencies double (visible as the eight particle emitters' colour-temperature shift toward blue — encoding the Vimarśa `octave_lift = 12.0` at `parashakti/vimarsha_reading.rs:52`).

## E.6 What happens at the 11→0 boundary (full Möbius return)

- The K² has now completed **720°** of SO(3) precession; the `helix_sheet` flag returns to 0.
- The QL "Möbius-return indicator" (`paramasiva-ux-full-m1-branch.md:137`) fires — a brief **whole-surface bloom** in the colour of the user's current lens-anchor.
- The diamond at centre emits one bright pulse (the `100% percentile identity` return; `m1.h:408,415`).

## E.7 What renders **simultaneously** vs **sequentially**

**Always simultaneous (each frame, regardless of tick)**:
- K² mesh + orientation
- Diamond + nodal quartet
- Cl(4,2) legend strip
- Audio-octet particle emitters (continuous)

**Tick-quantised (per tick advance)**:
- Active Ananda matrix cross-fade
- Luminous cell jump
- Mahāmāyā/Parashakti streamline advance
- Hopf shadow phase rotation

**Boundary-quantised (only at tick crossings 5→6 or 11→0)**:
- Klein-flip self-interpenetration animation
- Möbius-return whole-surface bloom

**Lens-anchored (only on `lens_mode` change)**:
- Chromatic-substrate hue-shift (the texture base hue retunes to the lens-anchor pitch class)

---

# F. Anti-Greenfield Audit

## F.1 Landed in code (consume, do not re-invent)

| Asset | Location | Notes |
|---|---|---|
| Six Ananda matrices | `Body/S/S0/epi-lib/src/m1.c:22-114` | `.rodata`, 432 bytes total |
| Ananda runtime API | `Body/S/S0/epi-lib/src/m1.c:297-345` | `m1_ananda_get`, axiom-verify |
| DR rings | `Body/S/S0/epi-lib/src/m1.c:122-123` | Mahāmāyā + Parashakti diagonals |
| Ring quaternion LUT | `Body/S/S0/epi-lib/include/m1.h:551-564` | 12 unit quaternions, 30° spacing |
| Cl(4,2) basis + trig table | `Body/S/S0/epi-lib/include/m1.h:629-661` | per-position signature + trig identity |
| Topological element count LUT | `Body/S/S0/epi-lib/include/m1.h:580-583` | per-tick visual density |
| Hopf bundle projection | `Body/S/S0/portal-core/src/hopf.rs:7-54` + `m1.h:667-678` | S³→S²→S¹ |
| Spanda quantiser | `Body/S/S0/portal-core/src/spanda.rs:9-29` | 2D → tick12 |
| Spanda parallel-track invariant | `Body/S/S0/epi-lib/include/m1.h:735-756` | Ananda↔Spanda branchless mapping |
| `MathemeHarmonicProfile` | `Body/S/S0/portal-core/src/kernel.rs:346-465` | the bus M1-2′ reads |
| Vimarśa audio_octet + nodal_quartet writer | `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-93` | the M2-1′ writes M1′ consumes |
| Quaternion math (mul, slerp, rotate, normalise, conj) | `Body/S/S0/epi-lib/include/m1.h:454-523` + `Body/S/S0/portal-core/src/quaternion.rs` | rendering math is *already done* in C and mirrored in Rust |
| Existing M1 Theia extension (2D React shell) | `Body/M/epi-theia/extensions/m1-paramasiva/` | NOT the played-torus surface; clock instrument only |
| Source dataset | `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae … .csv` | the 12-row vortex-fraction sheet |

## F.2 Pending (DR-M1-2 ratified, not yet built)

- `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` directory does not yet exist (confirmed by `find` — no match).
- Bevy/wgpu toolchain not yet declared in any `package.json` for that path.
- No Rust crate or wgsl shader implementing K² mesh + texture sampling of Ananda matrices.

## F.3 Net-new vs extending

**Extending** (consume from substrate, no new authority):
- K² mesh, texture, and lighting in Bevy
- Slerp animation over `RING_QUATERNION_LUT`
- Cell heatmap sampling `m1_ananda_get` over FFI / kernel-bridge
- Streamline overlay for `DR_RING_MAHAMAYA` / `DR_RING_PARASHAKTI`
- Cl(4,2) colour-coding using `CL42_BASIS` signatures
- Hopf shadow torus from `hopf_fiber`
- Audio-octet particle emitters from `audio_octet[8]`

**Net-new** (must be designed in cycle-3 with care to remain renderer-local):
- The **diamond/octahedron centre object** — claimed by UX (`paramasiva-ux-full-m1-branch.md:95`) but no substrate geometry exists; this is the only purely-aesthetic addition.
- The **Klein-flip self-interpenetration animation** — substrate gives `hopf_fiber` toggle; the visual fold is renderer-side choreography only.
- The **Möbius-return bloom** at tick 11→0 — substrate gives the topology; the bloom is renderer choreography.

**Forbidden** (do not invent):
- Local pitch synthesis (must consume `audio_octet`; per `M1'-SPEC.md:319`).
- Local clock (must consume kernel-tick; per `paramasiva-ux-full-m1-branch.md:83`).
- Local forking of `m1.h` constants into TS/wgsl tables (must come through kernel-bridge; per `M1'-SPEC.md:319`).
- Local graph relation inference (must come through S2; per `M1'-SPEC.md:303`).

## F.4 Cross-cuts to other M' extensions

- **M2-1′ (Vimarśa)**: writes `audio_octet[8]` and `nodal_quartet[4]` (`vimarsha_reading.rs:17-37`); the played-torus reads them. The particle emitters and satellite glyphs in §D are *windows onto Vimarśa's writes* — M1-2′ must not re-derive frequencies.
- **M2′ cymatic surface**: per `M1'-SPEC.md:108`, M1′ is the *origin* of the Klein-flip signal; M2′ consumes the flip-signal to render opposite cymatic valence. The played-torus must emit a flip event (kernel-bridge or local pub-sub) for M2′ to subscribe to.
- **M3-5 (Mahāmāyā double-torus)**: per `M1'-SPEC.md:56,64`, M1-5 owns the **single torus** and 4π recognition; M3-5 owns the downstream `K² × T²_Mahāmāyā` double-torus. The played-torus must remain a single K² — any double-torus rendering is M3-5's authority.
- **M0′ (graph-walk)**, **M4′ (journal-context)**, **M5′ (epii corpus)**: all consume the same `lens_mode` and `tick_address`; M1-2′ played-torus is the *primary visualisation* the others reference.

---

# G. Recommended Acceptance Tests for 15.4 / 15.8

1. `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus` succeeds.
2. Bevy/wgpu toolchain declared in `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/package.json`.
3. Render-test asserts `DOUBLE_COVER_DEG = 720` and `TORUS_GENUS = 1` derived from substrate (no local fork).
4. Render-test asserts cell heatmap values match `m1_ananda_get` over FFI for at least 6 (tick12, position6) pairs.
5. Animation test: a 12-tick capture frames show monotonic SO(3) precession (angle increases by 30°/tick) and matrix-foreground rotates through the 6 `Ananda_Matrix_Op` values.
6. Klein-flip test: tick crossings 5→6 and 11→0 produce a non-trivial mesh self-intersection frame; the `helix_sheet` flag matches `hopf_fiber(degree720)`.
7. Cl(4,2) colour test: halo hues at position6=0 and =5 are within the indigo band; at position6=1-4 within the warm band.
8. Audio-octet test: 8 particle emitters have positions matching `MathemeHarmonicProfile.audio_octet[i]` values (no local pitch).
9. Replay test: deterministic `MPrimePerformanceEvent` stream produces the same orientation/cell trajectory across two runs (per `M1'-SPEC.md:339`).
10. Privacy test: no private journal/Graphiti payload appears in the rendered surface (per `M1'-SPEC.md:96`).

---

# H. Closing Note — Why M1-2 Is the Right Place to Put the Vortex

The current UX docs put "the vortex" semantically at M1-2 but visually at M1-5. The substrate agrees: the *data* of the vortex (the six matrices) is M1-2; the *rotational embedding* of the vortex (the 12 ring quaternions, the Hopf bundle, K² topology) is M1-5. The played-torus extension is M1-5's geometry **carrying M1-2's data** — and this is exactly the bimba↔pratibimba dynamic the system insists on at every scale: the rotation (M1-5) is the *form*, the matrices (M1-2) are the *content*, and the tick (M1-3 Spanda) is the *act that binds them*. Rendering all three on one surface as one playable instrument is the M' product surface DR-M1-2 ratified — and the Ananda axiom (`prat - bimba ≡ +1 mod 10`) provides the actual visible heartbeat: every tick, every cell, every K² fold carries that same +1 — the matheme's own pulse, finally seeable.
