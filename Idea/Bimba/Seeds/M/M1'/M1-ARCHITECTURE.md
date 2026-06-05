---
title: "M1' Paramaśiva Architecture — Total Shape Across the Six Sub-Coordinates (M1-0' Canonical Source · M1-1' Instance Manager · M1-2' Harmonic Engine · M1-3' Spanda Core · M1-4' QL Flowering · M1-5' Topology Analyzer)"
coordinate: "M1' (parent of M1-0' through M1-5')"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: |
  Total-shape architectural authority for the M1' instrument across its six sub-strata.
  M1-2' is covered in depth by [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] and only summarised
  here; the other five strata (M1-0', M1-1', M1-3', M1-4', M1-5') receive their
  equivalent-depth treatment here. Where this document and [[M1'-SPEC]] disagree on
  total-shape, this document is authoritative; M1'-SPEC remains authoritative for
  domain identity, contract, and readiness law.
depends_on:
  - "[[M1'-SPEC]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"
  - "[[m1-prime-paramasiva-instrument]]"
  - "[[m1-prime-audio-generative-research]]"
  - "[[physical-pole-stack-architecture]]"
  - "[[paramasiva-ux-full-m1-branch]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m1-reconciliation-matrix.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md"
decisions_routed:
  - "DR-M1-1 (Wave A row 4) — downgrade residual M0-witness wording (+1 parent is M1-5)"
  - "DR-M1-2 (VALIDATED 2026-06-02) — Bevy/wgpu `m1-paramasiva-played-torus` is the K² renderer"
  - "DR-M1-3 (proposed) — single session-held `#` (Inversion_Operator) bridge-carrier"
  - "DR-M1-4 (proposed) — M1-1' ↔ S1/Hen vault-instance carrier contract"
related_tranches:
  - "02 (cycle-3) — M1 reconciliation tranches 2.1-2.8"
  - "10.x — profile-spine closure (`klein_flip`, `ananda_vortex`, single-# carrier)"
  - "07 — integrated 1-2-3 cosmic engine composition"
  - "15.4/15.6/15.7/15.8/15.9 — UI foundation + tick choreography + state persistence"
cross_references:
  - "Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md (prior 0/1 ground feeding M1)"
  - "Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md (Vimarśa-window write-side)"
  - "Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md (downstream double-torus K²×T²)"
  - "Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md (Cl(4,2) personal scale)"
  - "Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md (Epii corpus governance)"
  - "Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md"
---

# M1' Paramaśiva — Total Shape Architecture

## 0. Frame

**M1' is the playable instrument over the M1 engine — Paramaśiva as something the user walks, strikes, hears, and sees rather than reads about.** Where M1 is the mathematical DNA (the 12-state SU(2) ring, the six Ananda matrices, the K² topology, the Cl(4,2) Clifford algebra, the 9/8 epogdoon tick), M1' is the techne surface that makes that engine *playable and teachable*. Per [[paramasiva-ux-full-m1-branch]] §0: M1' is largely **pedagogical across its internal layers** — it is where Quaternal Logic itself is taught by being played, where the matheme content is germanely given, where the toroidal-diamond form is hosted, and where the S1/Obsidian vault becomes the instance-store of the coordinate system.

The M1' surface decomposes into six sub-coordinates, each 1:1 with its M1 bimba counterpart:

```
M1-0' Canonical Source     ←  M1-0 .rodata Bimba (immutable lesson-material)
M1-1' Instance Manager     ←  M1-1 Pratibimba +1 offset (mutable session-state, S1/vault alignment)
M1-2' Harmonic Engine      ←  M1-2 Ananda 12-matrix vortex (interval pedagogy)
M1-3' Spanda Core          ←  M1-3 Spanda rhythmic pulsation (the tick; the # binding)
M1-4' QL Flowering         ←  M1-4 Quaternal Logic 16:9 cascade (positions, lenses, scales)
M1-5' Topology Analyzer    ←  M1-5 Toroidal recognition (the +1 parent of 137=64+72+1; K², SU(2), Hopf)
```

The six positions are **the same matheme re-read as how-it-walks rather than what-it-is**. That re-reading is itself the bimba/pratibimba dial at the M1' scale: the engine read as instrument, the data read as performance.

This document gives the **total shape** across all six strata: substrate map, dataset map, profile-bus contract, visual rendering contract, tick choreography, boundary contracts, IDE integration, anti-greenfield audit, test criteria. M1-2' depth lives in the companion architecture document [[M1-2-ANANDA-VORTEX-ARCHITECTURE]]; this document covers the other five in equivalent depth and summarises M1-2' only where boundary contracts require it.

---

## 1. The Six Sub-Coordinates Table (bimba ↔ techne)

Per [[M1'-SPEC]] §1, with substrate and dataset anchors added:

| M1 (bimba) | M1' (techne) | Engine substrate | Dataset / canonical source | Pedagogical role |
|---|---|---|---|---|
| **M1-0** Bimba (original .rodata) | **M1-0' Canonical Source** | `ANANDA_BIMBA` `m1.h:71`/`m1.c:22-35`; `CL42_BASIS[6]` `m1.h:629-636`; `QL_TRIG_TABLE[6]` `m1.h:654-661`; `RING_QUATERNION_LUT[12]` `m1.h:551-564`; `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` `m1.h:580-583`; `DR_RING_MAHAMAYA[6]` / `DR_RING_PARASHAKTI[6]` `m1.c:122-123` | `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae … Sheet1.csv`; `Idea/Bimba/Map/datasets/paramasiva-deep/*.md`; `Idea/Bimba/Map/M1'.md` inner-stratum tables | Serves the matheme's fixed lesson-material as a read-only API. The `.rodata` *is* the curriculum. |
| **M1-1** Pratibimba (+1 offset, reflection that creates dynamism) | **M1-1' Instance Manager** | `M1_Root` struct `m1.h:827-833` (HC-anchored mutable session state); arena/Pratibimba pattern `m1.h:30-41`; `PortalClockState` `portal-core/src/state.rs` (live composed-quaternion state) | `Idea/Bimba/World/**` (the vault as instance-store); `Idea/Empty/Present/{day_id}/` (per DR-M4-1) | **The S1/vault alignment.** Mutable session-state — current walk, `(lens, mode)`, current coordinate, current Pratibimba mirror. Instances are walks AND, by extension, vault files. Walking the graph IS navigating the vault. |
| **M1-2** Ananda 12-matrix vortex | **M1-2' Harmonic Engine** | Six canonical Ananda matrix families, each with raw/no-digit-root and digit-root faces. Current `m1.c:22-114` `.rodata` carries the digit-root face only; `m1_ananda_get()` at `m1.c:297-345` is a 10x10 `%10` runtime core and must be corrected/extended from the CSV before it can serve the full vortex. Spanda↔Ananda parallel-track invariant `m1.h:735-756`; full per-substrate map at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §2 | `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae … Sheet1.csv` (two-register raw/no-digit-root + digit-root numerical authority); `paramasiva-deep/Paramasiva's 4 - deeper reflections.md` (narrative grounding) | Teaches *interval*. The six matrix families make the raw affine source and digit-root recursive residue audible/visible as ratios. Reads dual-register cells from kernel profile and exposes them as walk-step intervals/proof overlays; renders the matrix families + DR rings as the texture parameterisation of K² via the `m1-paramasiva-played-torus` Bevy/wgpu extension. |
| **M1-3** Spanda (rhythmic pulsation) | **M1-3' Spanda Core** | `SPANDA_SEED_BITS = 0x03` `m1.h:250` (fused (0/1) pole pair); `Spanda_Engine` struct `m1.h:253-259`; `SPANDA_CF_FOLD_COUNT[6]={4,6,8,10,12,0}` `m1.h:280`; `SPANDA_COMPILER_PASSES[6]` `m1.h:166`/`m1.c:243-250`; Rust quantiser `portal-core/src/spanda.rs:9-13`; `spanda_invert()` `spanda.rs:3-5` | `paramasiva-deep/Spanda_Genesis_100_Percent.md` (genus-0 puncture); `paramasiva-deep/Paramasiva's 3 - Spanda Seed.md` | Teaches *pulse*. Phase accumulator at settable rate bound to the kernel-tick; the single session-held `#` (`Inversion_Operator`) lives here, wired at every coordinate's `invert` field. The tick advance IS the (0/1) inversion-act made periodic. |
| **M1-4** Quaternal Logic (16:9 flowering) | **M1-4' QL Flowering** | `QL_FLOWERING[6]` `m1.c:198-205` (the six mod-6 ring stages with name/formulation/next/inverse); `QL_RATIO_NUM=16` / `QL_RATIO_DEN=9` `m1.h:351-352`; `QL_INVERT[6]={5,4,3,2,1,0}` `m1.h:360`; `MEF_DOUBLED=72` `m1.h:776`; `MathemeLensMode` (12×7 = 84) `kernel.rs:363,399-406`; `ql_get_stage()`/`ql_is_ascending()` `m1.h:329-338` | `Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/ql-musical-derivation.md` (MEF lens substrate); `Idea/Bimba/Map/M1-4'.md` and `M1-4-*` Seeds | Teaches *positions and lenses*. Position-walker + lens-as-scale-composer at the graph-traversal layer. Lens transposes chromatic substrate; mode rotates CF-progression; the 84-state `(lens, mode)` landscape is the navigable surface. |
| **M1-5** Toroidal Recognition | **M1-5' Topology Analyzer** | `TORUS_GENUS = 1` `m1.h:526`; `DOUBLE_COVER_DEG = 720` `m1.h:536`; `RING_QUATERNION_LUT[12]` `m1.h:551-564`; `quat_slerp` / `quat_mul` / `quat_normalize` `m1.h:458-523`; `hopf_project()` / `hopf_fiber()` / `hopf_tick12()` `m1.h:667-678` and Rust mirror `portal-core/src/hopf.rs:7-19`; `derive_walk_mode` / `derive_bifurcation` `portal-core/src/quaternion.rs:27-57` | `Idea/Bimba/Map/M1-5'.md`; `paramasiva-deep/13-03-2026-gemini-paramasiva-maths.md` (Ananda Torus 4g+2g) | Teaches *the shape*. Played visual K² torus; quaternionic TDA finding the shape of the active walk; Hopf / 4π identity-recognition as single-torus recognition before M3-5's downstream double-torus. **The +1 of `137 = 64 + 72 + 1`.** |

The pedagogical mantra (per [[paramasiva-ux-full-m1-branch]] §12):

> M1-0' serves the matheme's fixed lesson-material.
> M1-1' manages instances — the S1/vault alignment.
> M1-2' teaches interval; M1-3' teaches pulse (the tick).
> M1-4' teaches the positions and lenses; M1-5' teaches the shape (K², Hopf, the diamond).

---

## 2. Substrate Map (Per Sub-Coordinate)

The M1 substrate is **already landed and load-bearing** across `Body/S/S0/epi-lib/include/m1.h` (853 LOC), `Body/S/S0/epi-lib/src/m1.c` (436 LOC), and the `portal-core` runtime modules. This section maps each sub-coordinate to its actual file:line citations. Anti-greenfield rule: M1' surfaces *consume* these — they do not re-derive, fork, or duplicate.

### 2.1 M1-0' Canonical Source — the `.rodata` API

**Read-only access to the immutable lesson-material**, exposed through the kernel-bridge to the M1' Theia surface. The substrate is exhaustively present:

| Asset | Header decl | Definition | Purpose |
|---|---|---|---|
| `ANANDA_BIMBA` | `m1.h:71` | `m1.c:22-35` | The unshifted vortex (#X+0) — 12×12 nibble-packed |
| `ANANDA_PRATIBIMBA` | `m1.h:72` | `m1.c:43-56` | The +1-shifted reflection (#X+1) — enforces Ananda axiom |
| `ANANDA_SUM` | `m1.h:73` | `m1.c:64-77` | (#X+0)+(#X+1) synthesis |
| `ANANDA_DIFF_A` / `_B` | `m1.h:74-75` | implicit `m1.c:723-731` | Constant 9 / constant 1 — no storage (FR 2.1.9 optimisation) |
| `ANANDA_QUINTESSENCE` | `m1.h:91` | `m1.c:85-114` | Dyadic C5 synthesis (144 bytes) |
| `RING_QUATERNION_LUT[12]` | `m1.h:551-564` | inline | 12 unit quaternions at 30° spacing on S³ |
| `CL42_BASIS[6]` | `m1.h:629-636` | inline `m1.h:629-636` | Cl(4,2) signature `(-1,+1,+1,+1,+1,-1)` per position |
| `QL_TRIG_TABLE[6]` | `m1.h:654-661` | inline | Trig-identity per position (sin/tan/sec/cot/csc/cos) |
| `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` | `m1.h:580-583` | inline `{1,2,2,3,4,5,8,10,12,6,7,11}` | Per-ring-position element count |
| `DR_RING_MAHAMAYA[6]` | `m1.h:129` | `m1.c:122` | `{1,2,4,8,7,5}` doubling track |
| `DR_RING_PARASHAKTI[6]` | `m1.h:130` | `m1.c:123` | `{3,6,9,3,6,9}` tripling track |
| `M1_M0_CROSSLINK[12]` | `m1.h:802-812` | `m1.c:145-150` | 12 pointers from Ananda ring back to 6 Psychoid archetypes |
| `QL_FLOWERING[6]` | `m1.h:388` | `m1.c:198-205` | The six mod-6 ring stages with name+formulation |
| `M1_BRANCH_QL_CATEGORY[6]` | `m1.h:709` | `m1.c:130-137` | Per-sub-branch QL category assignments |
| `SPANDA_CF_SUBSTAGE_LUT[6]` | `m1.h:292` | `m1.c:165-190` | Per-cf-sub-stage CF notation + formulation strings |
| Per-position accessor | `get_ananda_harmonic()` `m1.h:60-68` | inline | O(1) nibble extraction |
| Runtime mod-10 API | `m1_ananda_get` / `m1_ananda_dr_get` / `m1_ananda_verify_axiom` | `m1.c:297-345` | Public mod-10 ops + axiom integrity check |
| Quaternion math | `quat_mul`/`quat_conj`/`quat_neg`/`quat_normalize`/`quat_rotate`/`quat_slerp` | `m1.h:458-523` | All inline in header — branchless |

**Boot-time verifier** at `m1.c:256-267` (`m1_verify()`) asserts: the Ananda matrices contain expected canonical cells, the DR rings carry the canonical sequences, and the M0 crosslink table is fully populated. **The M1-0' Canonical Source surface MUST never substitute its own values for these** — it surfaces them and surfaces only them.

The corresponding Rust kernel-bridge surfaces these through `MathemeHarmonicProfile` (`portal-core/src/kernel.rs:344-387`); the Rust side mirrors `RING_QUATERNION_LUT`, `TOPOLOGICAL_ELEMENT_COUNT`, `Cl(4,2)` signature, and Hopf math without duplicating the LUT values themselves (per `m1.h` reference law from [[M1'-SPEC]] §13.5).

### 2.2 M1-1' Instance Manager — mutable session-state + vault alignment

**The +1 reflection that creates dynamism becomes the runtime mutable state.** The substrate already provides this on the C side as `M1_Root` and on the Rust side as `PortalClockState`:

- `M1_Root` struct at `m1.h:827-833`:
  ```c
  typedef struct {
      Holographic_Coordinate*       hc;          /* HC-LINK'd to Psychoid_1 mirror */
      const Holographic_Coordinate* active_cf;   /* CF_TABLE[CF_BINARY] */
      Spanda_Engine                 spanda;      /* Active Spanda concrescence */
      QL_Tick                       torus_pos;   /* 0..11 — current SU(2) ring position */
      const DR_Matrix_12x12*        ananda;      /* Active Ananda matrix */
  } M1_Root;
  ```
  Constructor at `m1.c:269-285` (`m1_init`) HC-links to a mutable Pratibimba mirror, sets spanda.stage = `SPANDA_SEED` with `state_bits = SPANDA_SEED_BITS = 0x03`, `torus_pos = 0`, `ananda = &ANANDA_BIMBA`. Teardown at `m1.c:287-291` releases heap state without disturbing the HC.

- `PortalClockState` `portal-core/src/state.rs` carries the live composed quaternion, transit/quintessence/live-quaternion stack, walk-mode, bifurcation parameter, resolution level, current-degree, tick12, orbital-position, micro-orbit history, last cast. `recompute_composed_quaternion_state` `state.rs:14-22` rebuilds the composed quaternion from the three-stack on every update; `sync_kernel_projection` `state.rs:24-34` projects into `KernelProjection` for the bridge consumer.

- `MathemeHarmonicProfile::from_tick(tick)` `kernel.rs:389-465` is the canonical constructor: every field (`tick12`, `degree720`, `position6`, `helix`, `audio_octet`, `nodal_quartet`, `q_cosmic`, `codon_rotation_projection`, `lens_mode`) is derived deterministically. The M1' instance is "the current profile", refreshable per tick, route-able per session.

**S1/vault-instance alignment** is what M1-1' UX promises (`paramasiva-ux-full-m1-branch §7`): the coordinate system *is* the file structure, vault writes route through Hen (S1), `M1_Root` instance lifecycle is one side of an instance-store whose other side is the bimba vault under `Idea/Bimba/World/**`. **This contract edge is currently DOC-AHEAD** (Wave A row 10/15) — no `M1_Root ↔ Hen` carrier is landed yet. DR-M1-4 (proposed) routes this to user final-validation: either name the Hen carrier and document the contract, or downgrade the §7 claim to "navigational analogy". The matching `Idea/Empty/Present/{day_id}/` day-path (DR-M4-1 ratified) is the obvious anchor.

### 2.3 M1-2' Harmonic Engine — the vortex layer

Covered in depth at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §2. Summary:

- Six 12×12 mod-10 matrices (432 bytes `.rodata`) at `m1.c:22-114` define the vortex content.
- Two DR rings (`{1,2,4,8,7,5}` and `{3,6,9,3,6,9}`) at `m1.c:122-123` are the vortex spins.
- Spanda↔Ananda parallel-track invariant at `m1.h:735-756` (six `_Static_assert`s) wires advance-of-vortex and advance-of-tick as one motion in two registers.
- Runtime API `m1_ananda_get` / `_dr_get` / `_verify_axiom` at `m1.c:297-345`; Ananda axiom = `prat - bimba ≡ +1 (mod 10)`.
- Quaternionic embedding (`RING_QUATERNION_LUT[12]`, `CL42_BASIS[6]`, `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]`, Hopf bundle) lives at `m1.h:551-678` — the vortex content's rotational form is in M1-5' substrate but **read by** M1-2' for cell-state.

M1-2' is unique among the sub-coordinates in that it has a **dedicated 3D Bevy/wgpu rendering extension** (`m1-paramasiva-played-torus`, DR-M1-2 ratified) which carries the played K² torus + Ananda heatmap + DR streamlines + Cl(4,2) colour-binary surface. The 2D `m1-paramasiva` extension (this document's primary IDE-mirror) consumes the same profile bus for the *clock-instrument inspector* slot — they are two faces of the M1-2' rendering surface, neither replacing the other.

### 2.4 M1-3' Spanda Core — the tick and the # binding

**The phase accumulator and the single session-held `#`.** The substrate is dense:

- `SPANDA_SEED_BITS = 0x03` at `m1.h:250` is the fused (0/1) pole-pair — Pole A (Mahāmāyā, doubling, 64-bit word) | Pole B (Paraśakti, tripling, 72-name) simultaneously active at seed. Macros `SPANDA_BIT_POLE_A` (`1u<<0`) and `SPANDA_BIT_POLE_B` (`1u<<1`) at `m1.h:248-249`.

- `Spanda_Engine` struct at `m1.h:253-259`:
  ```c
  typedef struct {
      Spanda_Stage stage;          /* SEED → POLE_A → POLE_B → TRIKA → FLOWERING → META */
      uint8_t      state_bits;     /* 2-bit field per SPANDA_BIT_POLE_*  */
      uint8_t      track;          /* 0 = Mahāmāyā, 1 = Paraśakti */
      uint8_t      cf_substage;    /* 0-5 within FLOWERING */
      uint8_t      dual_track_active;
  } Spanda_Engine;
  ```

- `Spanda_Stage` enum at `m1.h:169-176`: SEED (genus-0 sphere) → POLE_A (Mahāmāyā) → POLE_B (Paraśakti) → TRIKA (first stable torus) → FLOWERING (6 CF sub-stages) → META (fold-count sieve + Möbius return).

- `SPANDA_CF_FOLD_COUNT[6] = {4, 6, 8, 10, 12, 0}` at `m1.h:280` — the fold-count per Flowering CF sub-stage, with `0` at sub-stage 5 marking Möbius return / percentile-identity return. `is_valid_fold()` validator at `m1.h:267-271` over the `VALID_FOLDS[14]` sieve `{0,1,2,3,4,5,6,8,9,10,12,16,18,24}`.

- `SPANDA_COMPILER_PASSES[6]` at `m1.h:166`, implemented `m1.c:243-250` as a `.rodata` array of `Spanda_Mutator` function pointers (`m1.h:163`). Each pass actively mutates a `PRATIBIMBA` in place — writing `weave_state` and `inversion_state` onto the HC target. This is **the Spanda passes as compiler passes** — substrate-side: each pass *is* `#` advancing on the coordinate.

- Rust quantiser at `portal-core/src/spanda.rs`:
  - `spanda_invert(stage: u8) -> u8` at lines 3-5 implements `#(n) = 11 - n` (Watson-Crick complement in 12-fold index space) — **this IS the # operator as code**, in the most condensed possible form.
  - `quantize_to_spanda_substage(y, x)` at lines 9-13 maps Hopf-base point to tick12 by `atan2 → normalize → ×12 → round → mod12`.
  - Tests at lines 19-31 verify involution (`#(#(n)) = n`) and complement (`n + #(n) = 11`).

- The "single session-held `#` (`Inversion_Operator`)" promise of [[M1'-SPEC]] §0/1 commitment 2 is **partially landed**: substrate carries the operator as `spanda_invert` and `SPANDA_SEED_BITS`. The Wave A matrix row 11 names the *remaining* gap: a runtime carrier on the kernel-bridge exposing `invert(coordinate)` as a single session operator (no per-coordinate forks). DR-M1-3 (proposed) names this contract.

- Spanda↔Ananda parallel-track invariant at `m1.h:735-756`: six `_Static_assert`s wire `MATRIX_BIMBA == SPANDA_SEED`, `MATRIX_PRATIBIMBA == SPANDA_POLE_A`, etc. Macros `ANANDA_TO_SPANDA_STAGE(op)` / `SPANDA_TO_ANANDA_OP(stage)` at `m1.h:755-756` make the cross-mapping branchless. This is the *deepest* substrate finding for M1' (per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §2.5): the Ananda matrix-op advance and the Spanda phase advance are **one motion** in two registers.

### 2.5 M1-4' QL Flowering — the 16:9 cascade + the lens/scale composer

**The position-walker + lens-as-scale-composer.** Substrate:

- The 16:9 cascade at `m1.h:348-376`:
  - `QL_RATIO_NUM = 16` / `QL_RATIO_DEN = 9` (the foundational ratio: 4²/3²)
  - `QL_EXPLICATE = 4` / `QL_PROCESSUAL = 6`
  - `FRAME_EXPLICATE = 4` / `FRAME_PROCESSUAL = 6` / `FRAME_TOTAL = 10`
  - `QL_INVERT[6] = {5, 4, 3, 2, 1, 0}` — mirror at every position
  - `VARIANT_7..VARIANT_10` (the nesting variants)
  - **Downstream cardinalities**: `M3_WORD = 64` (4²×4 Mahāmāyā 64-bit), `M2_TATTVA = 36` (6² tattvas), `M2_NAMES = 72` (Epogdoon), `COSMIC_TIME = 360`.

- Percentile-identity constants at `m1.h:408-415` with three `_Static_assert`s:
  - `QL_PERCENTILE_TOTAL = 100`
  - `QL_PERCENTILE_MAHAMAYA = 64` = M3_WORD (P/P' = 2⁶ hexagrams)
  - `QL_PERCENTILE_PARASHAKTI = 36` = M2_TATTVA (P×P' = 6² tattvas)
  - **Archetype 7 ratio** = 16/9 = QL_DIVINE_ACT_RATIO_F (the "Divine Action generative code")

- Vortex inner-sums at `m1.h:425-427`: `VORTEX_5X_CEILING = 24` (Spanda completion ceiling), `VORTEX_6X_STRUCTURE = 8` (structural perfection). These feed the M1-4' UI when surfacing vortex math to learners.

- `QL_FLOWERING[6]` at `m1.c:198-205` is the six-stage ring with name + formulation strings — the actual curriculum-text for the QL pedagogy:
  - Stage 0 "Ground" — "genus-0 sphere: (0/1) seed; 16/9 = 4²/3² generative ratio"
  - Stage 1 "Form" — "4+2 frame: 4 explicate + 2 implicate = 6-fold torus necessity"
  - Stage 2 "Entity" — "12-fold ring: P×P' = 36 (Parashakti), P/P' = 64 (Mahamaya); 100%"
  - Stage 3 "Pattern" — "bi-12 double-cover: Mahamaya 64-bit × Parashakti 72-space"
  - Stage 4 "Context" — "7/8/9/10-fold nesting variants; lemniscate CF sub-staging"
  - Stage 5 "Integration" — "1-24-fold meta-sieve; Möbius 5/0 return; ceiling = 24"

- `MathemeLensMode` at `portal-core/src/kernel.rs:363` is the canonical (lens, mode) carrier; constructor `MathemeLensMode::new(tick12, ...)` at `kernel.rs:399-406` keeps the 12×7=84 invariant. The `lens_mode` field is the runtime address of the active 84-state cell.

- `MEF_DOUBLED = 72` / `MEF_BASE_LENSES = 6` / `MEF_INV_FACTOR = 2` at `m1.h:776-778` carry the MEF lens cardinalities with `_Static_assert(MEF_BASE_LENSES * MEF_INV_FACTOR * QL_PROCESSUAL == MEF_DOUBLED, ...)` at `m1.h:780-781`.

- Epogdoon ratio at `m1.h:788-792`: `EPOGDOON_NUM = 9` / `EPOGDOON_DEN = 8` with `_Static_assert(MEF_DOUBLED * EPOGDOON_DEN == M3_WORD * EPOGDOON_NUM, "72*8 == 64*9 == 576")` — **the M2→M3 bridge constant lives at the M1 substrate**.

- Branchless QL stage derivation at `m1.h:329-338`: `ql_is_ascending(tick)` returns tick<6, `ql_get_stage(tick)` returns tick if ascending else `11-tick` (CMOV-friendly Möbius return on descending half).

The pedagogical claim of [[paramasiva-ux-full-m1-branch]] §6 ("MEF as scale-composer, not cell-annotator") is supported by [[M1'-SPEC]] §8 and lives in code as the `lens_mode` field driving `vimarsha_read_profile(tick, lens_mode)` at `kernel.rs:411` — the lens chooses which Vimarśa-reading produces the active `audio_octet`/`nodal_quartet`.

### 2.6 M1-5' Topology Analyzer — the played K², SU(2), Hopf, the +1

**The single torus and the SU(2) double-cover.** The substrate is the densest of all the sub-coordinates (per [[M1'-SPEC]] §1 sub-section "M1-5 As The +1 Of The 137 Architecture"):

- Topological constants `m1.h:526-549`:
  - `TORUS_GENUS = 1`
  - `QL_POSITIONS = 4·g + 2·g = 6` (the genus-1 necessity: 4 edges + 2 identification vertices of the fundamental polygon)
  - `EULER_CHARACTERISTIC = 2 - 2·g = 0`
  - `DOUBLE_COVER_STEPS = 2·QL_POSITIONS = 12 = RING_SIZE`
  - `PARASHAKTI_TOTAL = M2_TATTVA · 2 = 72`
  - `TRIG_STEP_DEG = 60` (360°/6), `HALF_CYCLE_DEG = 180`, `FULL_CYCLE_DEG = 360`, `DOUBLE_COVER_DEG = 720`, `DEGREE_PER_TICK = 30`
  - Seven `_Static_assert`s at `m1.h:539-549` cross-check every relation.

- `RING_QUATERNION_LUT[12]` at `m1.h:551-564` — 12 unit quaternions on S³ at 30°/tick spacing. Each entry uses `0.8660254f` ≈ √3/2 for the 30°-offset cosines. The first six (tick 0-5) span the (w,x) circle 0° to 150°; the second six (tick 6-11) span the antipodal arc — the SU(2) shadow. `quat_from_ring_pos(tick)` at `m1.h:566-568` is the constant-time accessor.

- Quaternion math at `m1.h:454-523` (all inline):
  - `quat_norm_sq` (Hopf S³ membership predicate)
  - `quat_mul` (Hamilton product)
  - `quat_conj`, `quat_neg`, `quat_normalize`
  - `quat_rotate(q, v)` = `q · v · q*` (the SO(3) rotation action of S³)
  - **`quat_slerp(a, b, t)`** at `m1.h:493-523` — the **load-bearing animation primitive for the played K² torus** per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6. Cosine-shortest-path correction at line 495-498; small-angle lerp fallback at line 499-507; canonical sin-weighted slerp at line 514-522.

- Cl(4,2) at `m1.h:594-664`:
  - `Trig_Function` enum mapping P0=SIN, P1=TAN, P2=SEC, P3=COT, P4=CSC, P5=COS
  - `Cl42_Basis_Entry { position, signature, trig_fn }` struct
  - `CL42_BASIS[6]` table — P0 and P5 carry `signature = -1` (sin, cos — the implicate generators); P1-P4 carry `signature = +1` (the explicate ratios). Net signature `4·(+1) + 2·(-1) = +2` ≡ Cl(4,2).
  - `QL_TRIG_TABLE[6]` with full numerator/denominator QL position per trig (e.g. `tan` = position 0 / position 5 = sin/cos).
  - `TRIG_UNITY = 6` sentinel for unity in numerator/denominator (no QL position).
  - Static asserts on every table at `m1.h:621, 638-639, 663-664`.

- Hopf bundle at `m1.h:666-683` and `portal-core/src/hopf.rs:7-19`:
  - `hopf_project(deg720) = deg720 % 360` (the modular reduction *is* the S³→S² projection)
  - `hopf_fiber(deg720) = 1 if deg720 >= 360 else 0` (which sheet of the SU(2) double-cover)
  - `hopf_tick12(deg720) = hopf_project(deg720) / DEGREE_PER_TICK`
  - `quat_is_unit(q)` at `m1.h:680-683` — S³ membership predicate with 1e-4 tolerance.
  - Rust mirror: `validate_quaternion_unity(&[f32;4])` at `hopf.rs:22-32` returns `Err(...)` if off S³.
  - `TOPOLOGICAL_ELEMENT_COUNT` constant array at `hopf.rs:35` mirrors C `TOPOLOGICAL_ELEMENT_COUNT_LUT[12]` byte-for-byte.

- Walk-mode derivation at `portal-core/src/quaternion.rs:27-41`: `derive_walk_mode(q)` = argmax of `|w|, |x|, |y|, |z|` → Ground/Torus/Fiber/Spanda mode. `derive_bifurcation` at `quaternion.rs:45-57` returns `lambda = sqrt(x² + y² + z²)` with bucketed resolution level. **These are the TDA primitives that "find the shape of the active walk"** per [[M1'-SPEC]] §1 stratum table.

- `PortalClockState` (in `portal-core/src/state.rs`) composes three quaternions: `quintessence_quaternion` (the lens-anchor), `transit_quaternion` (the running cosmic transit), `live_quaternion` (per-cast oracle state). `recompute_composed_quaternion_state` at `state.rs:14-22` rebuilds `composed_quaternion = normalize(quintessence · transit · live)` on every advance; this composed quaternion is the *runtime* TDA input — the shape the walk currently traces.

- `compute_orbital_position(degree, tick12)` at `state.rs:9-22` — the canonical torus parametrisation: `θ = degree·τ/360`, `φ = tick12·τ/12`, `r=0.36, R=0.64`, returns `(x, y, z) = ((R + r·cos(φ))·cos(θ), (R + r·cos(φ))·sin(θ), r·sin(φ))`. Note `R/r = 0.64/0.36 ≈ 16/9` — the 16:9 ratio appears as torus aspect.

The **+1 attribution** is wired through the Theia surface at `clock-instrument.ts:269-284` (`topologyFromPayload`) with three load-bearing string slots:
- `parentAttribution: 'M1-5 is the +1 parent / single-torus recognition site.'`
- `priorGround: 'M0 is the prior 0/1 ground that M1 receives; M0 is not the +1.'`
- `downstreamDoubleTorus: 'Double-torus rendering is delegated downstream to M3-5.'`

These are the canonical strings — they MUST appear in the rendered topology pane.

---

## 3. Dataset Map (Per Sub-Coordinate)

The matheme content was compiled from canonical datasets; M1' surfaces those datasets where pedagogically appropriate.

### 3.1 M1-0' Canonical Source

- **`Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv`** — canonical numerical source for the six Ananda matrices (full citations at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §3.1)
- **`Idea/Bimba/Map/datasets/paramasiva-deep/nodes-full-detail.json`** — bimba-graph nodes for M1' positions
- **`Idea/Bimba/Map/datasets/paramasiva-deep/relations.json`** — relation typology (used at M1-4' for relation-as-interval)
- **`Idea/Bimba/Map/M1'.md`, `M1-0'.md` … `M1-5'.md`** — inner-stratum tables (1:1 bimba↔techne mapping per sub-coordinate)
- **`Idea/Bimba/Map/datasets/paramasiva-deep/QL Essay.md`**, **`Quaternal_Logic_Geometric_Epistemology_v2.md`**, **`Quaternal_Logic_Lived_Topology.md`** — long-form QL exposition referenced by the M1-0' Canonical Source surface when learners drill into a position's curriculum

### 3.2 M1-1' Instance Manager

- **`Idea/Bimba/World/**`** — the crystallised Forms/Types/Entities folder; every walk is potentially an instance crystallised here through Hen (DR-M1-4 pending)
- **`Idea/Empty/Present/{day_id}/`** — day-now container (DR-M4-1 ratified); current-walk and current-session are anchored here
- **`Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/M1-paramasiva-mathematical-dna.md`** — mathematical-DNA spec the M1-1' surface references when persisting an instance

### 3.3 M1-2' Harmonic Engine

See [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §3 for full citations. Key sources: the Vortex Modulae CSV, `paramasiva-deep/Paramasiva's 4 - deeper reflections.md` (lines 59, 72, 80, 95, 693, 776, 828 — "Ananda vortex" + DR-ring narratives), `13-03-2026-gemini-paramasiva-maths.md:187-232` ("Ananda Torus: 4g sides + 2g loops"), `Spanda_Genesis_100_Percent.md:22-26` (genus-0 sphere puncture).

### 3.4 M1-3' Spanda Core

- **`Idea/Bimba/Map/datasets/paramasiva-deep/Spanda_Genesis_100_Percent.md`** — the genus-0 → genus-1 puncture sequence; `SPANDA_CF_FOLD_COUNT[6]` is sourced here
- **`Idea/Bimba/Map/datasets/paramasiva-deep/Paramasiva's 3 - (0-1-2-3) - (0-1) Dynamic Logic - Spanda Subsystem Development - Spanda Seed.md`** — the seed-pair derivation (`SPANDA_SEED_BITS = 0x03`)
- **`Idea/Bimba/Map/datasets/paramasiva-deep/Paramasiva's 3 - gemini additions.md`** — Spanda dual-track architectural commentary
- **`Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/`** — Spanda stage formulations for `SPANDA_CF_SUBSTAGE_LUT[6]`

### 3.5 M1-4' QL Flowering

- **`Idea/Bimba/Map/datasets/paramasiva-deep/Paramasiva's 4 - (0-1-4.0-4-5) - Quaternal logic development and mapping.md`** — the 16:9 cascade, `(4.0/1-4.4/5)` fractal doubling, lemniscate at #4 derivation
- **`Idea/Bimba/Map/datasets/paramasiva-deep/Basic and Partially Expanded Quaternal Logic.md`** — pedagogical introduction
- **`Idea/Bimba/Map/datasets/paramasiva-deep/Quaternal_Logic_Geometric_Epistemology_v2.md`** — geometric reading
- **`Idea/Bimba/Map/datasets/paramasiva-deep/Quaternal_Logic_Lived_Topology.md`** — lived/processual reading
- **`Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/ql-musical-derivation.md`** — MEF lens substrate; 84-state landscape derivation; CF1=Nous..CF7=Sophia mode names
- **`Idea/Bimba/Map/M1-4'.md`** + `M1-4-N'.md` sub-coordinate Seeds for per-position curriculum

### 3.6 M1-5' Topology Analyzer

- **`Idea/Bimba/Map/datasets/paramasiva-deep/13-03-2026-gemini-paramasiva-maths.md`** lines 187-232 — Ananda Torus (4g sides + 2g loops, genus-1 necessity)
- **`Idea/Bimba/Map/datasets/paramasiva-deep/Paramasiva's 4 - deeper reflections.md`** — Hopf bundle, K² Klein-double-cover discussion, 720° SU(2) double-cover
- **`Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md`** — the Bevy/wgpu rendering proposal that DR-M1-2 ratified
- **`Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`** §7.2 — the +1 attribution at M1-5
- **`Idea/Bimba/Seeds/M/M1'/Legacy/specs/M/2026-03-12-cosmic-clock-full-architecture.md`** — toroidal clock architecture history

---

## 4. Profile-Bus Contract (Per Sub-Coordinate)

`MathemeHarmonicProfile` at `portal-core/src/kernel.rs:344-387` carries the windows onto substrate that M1' renders. Per sub-coordinate:

### 4.1 M1-0' Canonical Source — what the bus carries from the `.rodata` API

Already exposed:
- `lens_mode: MathemeLensMode` (`kernel.rs:363`) — addresses the active 84-state cell
- `chromatic: MathemeChromaticProfile` (`kernel.rs:364`) — chromatic substrate per `MathemeChromaticProfile::from_tick(tick12, position, pitch_class)`
- `bedrock: MathemeBedrockProjection` (`kernel.rs:378`) — bedrock projection per position
- `pointer_anchor: MathemePointerAnchorProjection` (`kernel.rs:379`) — current coordinate + relation refs

**Missing (proposed in 4.1.a)**: a `canonical_source_handle: CanonicalSourceHandle` field that surfaces the `.rodata` cardinalities the M1' UI needs to display "the lesson-material" without forking constants into TS tables:

```rust
pub struct CanonicalSourceHandle {
    /// 16:9 cascade snapshot
    pub ql_ratio_num: u8,           // 16 (from QL_RATIO_NUM)
    pub ql_ratio_den: u8,           //  9 (from QL_RATIO_DEN)
    pub frame_total: u8,            // 10 (from FRAME_TOTAL)
    /// Downstream cardinalities
    pub m3_word: u16,               // 64 (from M3_WORD)
    pub m2_tattva: u8,              // 36
    pub m2_names: u8,               // 72
    /// Epogdoon
    pub epogdoon_num: u8,           //  9
    pub epogdoon_den: u8,           //  8
    /// Percentile-identity
    pub percentile_mahamaya: u8,    // 64
    pub percentile_parashakti: u8,  // 36
    pub percentile_total: u8,       // 100
    /// MEF
    pub mef_doubled: u8,            // 72
    pub mef_base_lenses: u8,        //  6
    /// Vortex inner-sums
    pub vortex_5x_ceiling: u8,      // 24
    pub vortex_6x_structure: u8,    //  8
}
```

This is **anti-greenfield**: the constants are all already in `m1.h`; the projection only routes them through the bus so the UI surface can render the curriculum without competing constants. Bound to Tranche 10 profile-spine closure.

### 4.2 M1-1' Instance Manager — what the bus carries about the active instance

Already exposed:
- `profile_provenance: MathemeProfileProvenance` (`kernel.rs:350`) — who wrote this profile
- `tick_address: MathemeTickAddress` (`kernel.rs:352`) — addressable tick coordinate
- `s2_anchor: Option<MathemeFutureAnchor>` (`kernel.rs:384`) — the S2 graph-anchor of the active coordinate (currently `Option<None>` per `from_tick`; the M1-1' Instance Manager is what populates this)
- `s3_anchor: Option<MathemeFutureAnchor>` (`kernel.rs:386`) — the S3 temporal-anchor

**Missing (proposed in 4.2.a)**: an `instance_handle: InstanceHandle` field for the M1-1' carrier:

```rust
pub struct InstanceHandle {
    /// Session-relative walk identifier
    pub walk_id: Uuid,
    /// Active (lens, mode, coordinate) tuple — already partially in lens_mode + pointer_anchor
    /// but consolidated here as the M1-1' instance-state primary key
    pub active_cell: ActiveCell,
    /// Day-now path per DR-M4-1 ratified — `Idea/Empty/Present/{day_id}/`
    pub day_now: DayNowAnchor,
    /// Vault-instance anchor (DR-M1-4 pending) — if the walk has been crystallised
    /// to a vault file via Hen, this carries the bimba-vault path; else None.
    pub vault_anchor: Option<VaultAnchor>,
}

pub struct VaultAnchor {
    pub bimba_path: PathBuf,         // e.g. `Idea/Bimba/World/Entities/M1-4-3/Form.md`
    pub hen_carrier_id: String,      // S1/Hen mediator handle
    pub crystallised_at: u64,        // unix seconds
}
```

This is the **load-bearing M1-1' surfacing** that closes the S1/vault alignment claim. Bound to DR-M1-4 user validation.

### 4.3 M1-2' Harmonic Engine — the `ananda_vortex` projection

Covered in depth at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §4. The proposed `ananda_vortex: AnandaVortexProjection` field (Tranche 10.10) carries `active_matrix_op`, `active_cell`, `active_cell_value: AnandaVortexCell`, `dr_ring_phase`, `cl42_signature_at_position`, `ring_quaternion`, `helix_sheet`, `klein_flip_at_this_tick`. **Anti-greenfield with correction:** the digit-root face is already present in `m1.c:22-114`, but `m1_ananda_get` at `m1.c:297-345` currently exposes a 10x10 `%10` core rather than the CSV's full six-family raw+digit-root 12x12 authority. The projection routes substrate truth through the bus only after the C generator/API carries both faces.

### 4.4 M1-3' Spanda Core — the tick, the # carrier, the klein_flip event

Already exposed:
- `tick: u64` (absolute tick) at `kernel.rs:353`
- `tick12: u8` at `kernel.rs:354`
- `cycle: u64` at `kernel.rs:355`
- `degree720: u16` at `kernel.rs:356`
- `degree360: u16` at `kernel.rs:357`
- `su2_layer: String` at `kernel.rs:358` ("primary" | "shadow")
- `phase: KernelPhase` at `kernel.rs:359`
- `position6: u8` at `kernel.rs:360`
- `helix: String` at `kernel.rs:361` ("bimba" | "pratibimba")

**Missing (proposed in 4.4.a)**: a `klein_flip: Option<KleinFlipEvent>` field (Wave A row 7 named blocker; cycle-3 Tranche 2.2):

```rust
pub struct KleinFlipEvent {
    pub from_lens: u8,
    pub to_lens: u8,
    pub tick: u64,
    pub kind: KleinFlipKind,
}

pub enum KleinFlipKind {
    TritoneMirror,    // Lens N ↔ Lens N+3 (the load-bearing one)
    BimbaPratibimba,  // Tick 5→6 (helix-sheet flip)
    MobiusReturn,     // Tick 11→0 (full identity return)
}
```

Detector logic lives in `parashakti/vimarsha_reading.rs` since it reads the lens-mode transition (this places the emitter exactly at the Vimarśa-window boundary, which is correct: M2 consumes the flip event).

**Missing (proposed in 4.4.b — DR-M1-3)**: an `inversion_operator: InversionOperatorHandle` field exposing the single session-held `#`:

```rust
pub struct InversionOperatorHandle {
    /// Stable identifier of the single session-held # operator.
    /// All M' surfaces requesting `invert(coordinate)` resolve through THIS id.
    /// No per-coordinate forks.
    pub operator_id: u64,
    /// Current bound state: SPANDA_SEED_BITS at seed = 0x03; updates per tick.
    pub state_bits: u8,
    /// Current track (0 = Mahāmāyā, 1 = Paraśakti) per Spanda_Engine.
    pub track: u8,
    /// Current Spanda stage and cf_substage per `Spanda_Engine` (`m1.h:253-259`).
    pub spanda_stage: u8,
    pub cf_substage: u8,
}
```

The runtime contract: the bridge resolves `invert(coordinate_X)` to `Coordinate_X'` by routing through this single operator. Substrate: `spanda_invert(stage)` at `portal-core/src/spanda.rs:3-5`.

### 4.5 M1-4' QL Flowering — the 84-state landscape + lens-as-scale-composer

Already exposed:
- `lens_mode: MathemeLensMode` at `kernel.rs:363` (the 12×7 = 84 active cell)
- `diatonic: Option<MathemeDiatonicContext>` at `kernel.rs:365` (the CF-progression anchor)
- `resonance72: MathemeResonance72Projection` at `kernel.rs:366` (Paraśakti 72-name axis)
- `context_frames: MathemeContextFrameWebProjection` at `kernel.rs:380` (CF-web projection)
- `ratio_role: String` at `kernel.rs:362` (per-position ratio role label)

**Missing (proposed in 4.5.a)**: a `ql_flowering: QlFloweringProjection` field surfacing the stage/formulation strings the M1-4' surface renders:

```rust
pub struct QlFloweringProjection {
    /// Current QL stage 0-5 per ql_get_stage(tick12)
    pub current_stage: u8,
    /// Name from QL_FLOWERING[stage] ("Ground"|"Form"|"Entity"|"Pattern"|"Context"|"Integration")
    pub stage_name: &'static str,
    /// Formulation string from QL_FLOWERING[stage]
    pub formulation: &'static str,
    /// Next position via QL_FLOWERING[stage].next
    pub next_position: u8,
    /// Inverse via QL_INVERT[stage]
    pub inverse_position: u8,
    /// Per cf_substage (when in SPANDA_FLOWERING): CF notation + formulation per
    /// SPANDA_CF_SUBSTAGE_LUT[cf_substage]
    pub cf_substage_notation: Option<&'static str>,
    pub cf_substage_formulation: Option<&'static str>,
    /// 84-state cell index = lens * 7 + mode
    pub landscape_cell_index: u8,
}
```

The strings are static-lifetime references to `m1.c:198-205` and `m1.c:165-190`. **Anti-greenfield**: the strings are already in `.rodata`; the projection only surfaces them.

### 4.6 M1-5' Topology Analyzer — the played K² + Hopf + the +1

Already exposed:
- `q_cosmic: [f32; 4]` at `kernel.rs:374` — the codon-charge quaternion (M3-bound, but a topology input)

**Missing (proposed in 4.6.a)**: a `topology: M1TopologyProjection` field — Wave A row 6 flagged the slots are present on the consumer side (`clock-instrument.ts:44-54`) but no producer wires them. Cycle-3 Tranche 2.3 names the closure:

```rust
pub struct M1TopologyProjection {
    /// Constants (mirrored once at construction, never forked)
    pub double_cover_deg: u16,                 // 720
    pub torus_genus: u8,                       //   1
    pub euler_characteristic: i8,              //   0
    /// Current Hopf bundle state
    pub hopf_project_deg: u16,                 // exact_degree_720 % 360
    pub hopf_fiber: u8,                        // 0 or 1 (which SU(2) sheet)
    /// Current ring quaternion (from RING_QUATERNION_LUT[tick12])
    pub ring_quaternion: [f32; 4],
    /// Topological element count at current ring position
    pub element_count: u8,
    /// Composed quaternion (quintessence · transit · live)
    pub composed_quaternion: [f32; 4],
    /// Walk-mode argmax (Ground/Torus/Fiber/Spanda)
    pub walk_mode: WalkMode,
    /// Bifurcation lambda and resolution level
    pub bifurcation_lambda: f32,
    pub resolution_level: u8,
    /// Identity attribution (canonical strings — render verbatim)
    pub parent_attribution: &'static str,      // "M1-5 is the +1 parent..."
    pub prior_ground: &'static str,            // "M0 is the prior 0/1 ground..."
    pub downstream_double_torus: &'static str, // "Double-torus delegated to M3-5"
}
```

This **closes** the SPEC-AHEAD gap of Wave A row 6 — the slot exists at the consumer side, the constants exist in substrate, the projection only routes them through the bus.

---

## 5. Visual Rendering Contract (Per Sub-Coordinate)

### 5.1 M1-0' Canonical Source — the lesson-material surface

**Mode**: read-only inspector pane in `ide-deep` `m1-paramasiva.canonicalSource` view (proposed; not in current `ALL_VIEW_IDS`).

- **The six matrix-family viewer**: 6-tab pane, one tab per family (`BIMBA`, `PRATIBIMBA`, `SUM`, `DIFF_A`, `DIFF_B`, `RULE/QUINTESSENCE`). Each tab shows the 12×12 cell grid as a `<table>` with digit-root-coloured backgrounds (greyscale at 0-9 luminance) and a raw/no-digit-root proof overlay. Cells come from `AnandaVortexProjection.active_cell_value` via the kernel-bridge, not from local UI recomputation.
- **DR rings viewer**: two adjacent strips for `DR_RING_MAHAMAYA` and `DR_RING_PARASHAKTI`, each rendered as a six-step horizontal "tape" with the current position highlighted (driven by `position6`).
- **Cl(4,2) table**: six-column header `P0 P1 P2 P3 P4 P5` showing trig function + signature; the current `position6` column gets a coloured border (indigo for ±1 signature, amber for +1).
- **Ring quaternion LUT viewer**: 12-row table of `(tick, w, x, y, z)` with current tick highlighted; alongside, a 2D mini-render of the (w,x) circle showing the 12 quaternion endpoints on a unit circle with the current one as a luminous dot.
- **Topological element count strip**: 12-cell horizontal strip showing `{1,2,2,3,4,5,8,10,12,6,7,11}` with current tick highlighted.
- **16:9 cascade card**: small fact-card showing the cascade `QL_RATIO_NUM / QL_RATIO_DEN = 16/9`, downstream `M3_WORD=64`, `M2_TATTVA=36`, `M2_NAMES=72`, percentile-identity `64+36=100%`. Pure read-only.

**Substrate consumed**: `canonical_source_handle` + `ananda_vortex.active_cell` + `topology.ring_quaternion`.

**Animation**: tick-quantised — the highlighted cells/positions/quaternions advance on every kernel-tick advance, no other motion.

**Colour**: all values rendered as text + sparing colour highlights; the M1-0' surface is **the data presented as data**, not as immersive performance. The performance pole is M1-2' (played-torus extension) and M1-5' (topology pane).

### 5.2 M1-1' Instance Manager — the walk-record surface

**Mode**: status-bar entry + side-panel "Active Instance" pane in both `daily-0-1` and `ide-deep`.

- **Status-bar entry**: compact `[ M1-1' | walk-{id} | lens N / mode M | {day_id} ]` chip. Click opens the side panel.
- **Active Instance side-panel** (sidebar tab "Instance" in the activity-bar per Tranche 15.3):
  - **Walk header**: walk id, creation time, current tick, current generation
  - **Active cell**: `(lens, mode)` cell tag + current coordinate + `pointer_anchor` summary
  - **Day-now anchor**: `Idea/Empty/Present/{day_id}/` path (clickable; opens the day folder in the Canon Studio view)
  - **Vault-instance section**: if the walk has been crystallised through Hen, show the vault path + crystallised-at time + a "Reveal in Bimba Graph Viewer" affordance. If not, show a "Crystallise to vault…" button (gated on DR-M1-4 ratification).
  - **Provenance bar** at the bottom: profile-generation, `profile_provenance` (who wrote this profile), readiness state.
- **Bimba-side rendering**: cosmic-side shows the walk as an abstract trajectory glow on the played-torus surface (rides on M1-2' / M1-5' rendering — does not own its own 3D surface).
- **Pratibimba-side rendering**: personal-side shows the walk as a journal-thread annotation in the Nara journal pane (M4'-bound).

**Substrate consumed**: `instance_handle` + `profile_provenance` + `tick_address` + `s2_anchor` + `s3_anchor`.

**Animation**: only the status-bar chip updates per tick; the side panel is event-driven (re-renders on `instance_handle` change or `day_now` rollover).

**Colour**: provenance state-class colours (per Tranche 15.6 readiness inline rendering): green = ready, amber = pending-*, red = blocked. The vault-anchor row pulses on first crystallisation (`crystallised_at` within last 10s).

### 5.3 M1-2' Harmonic Engine

Full contract at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §5. Summary: K² mesh with active Ananda matrix family as a 12×12 digit-root heatmap plus raw proof overlay, six families stacked as perspex cross-fade, DR rings as gold/emerald flow-streamlines, Cl(4,2) signature as cool-indigo/warm-amber colour-binary, Hopf shadow torus as concentric second sheet at 30% opacity, diamond octahedron at centre as still-point. Single load-bearing animation primitive: `quat_slerp` of K² orientation. The played-torus extension `Body/M/epi-theia/extensions/m1-paramasiva-played-torus` owns this rendering; the 2D `m1-paramasiva` extension owns the *inspector* shadow of the same data (dual-register cell-grid + DR-ring tape + Cl(4,2) glyph + skeleton-event badges) in the ide-deep `audioBusInspector` view.

### 5.4 M1-3' Spanda Core — the pulse + the #

**Mode**: status-bar entry + small "Pulse" pane in `ide-deep` `m1-paramasiva.audioBusInspector` view; rides as a tick-pulse halo on the played-torus surface in `daily-0-1`.

- **Status-bar tick chip**: `[ tick {tick12}/12 | spanda {stage} | track {Mahāmāyā|Paraśakti} ]` — single text chip, no animation other than the tick number incrementing.
- **Pulse pane** (small, embedded):
  - **Spanda state**: stage name (SEED/POLE_A/POLE_B/TRIKA/FLOWERING/META) + `state_bits` as two binary lights (Pole A / Pole B). At SEED, both lights on (`0x03`); transitions follow the substrate.
  - **CF sub-stage** (when in FLOWERING): the current `cf_substage` 0-5 + the CF notation + fold-count from `SPANDA_CF_SUBSTAGE_LUT[cf_substage]`.
  - **`#` invocation control**: a single button labelled `# (invert)` that calls the single session-held inversion-operator on the current coordinate. The button glows momentarily on invocation; the active cell's mirror (`QL_INVERT[position]`) is highlighted on the M1-0' lens-mode strip; the played-torus may reorient if the invocation crosses a Klein boundary.
- **Tick-pulse halo on played-torus**: a faint annular ring of soft luminance at the equator that pulses outward on every tick advance, matched to the `quat_slerp` animation primitive — the pulse and the slerp are visually one motion. Colour shifts indigo (P0/P5) ↔ amber (P1-P4) tracking `cl42_signature_at_position`.

**Substrate consumed**: `tick12`, `phase`, `position6`, `helix`, `inversion_operator` (proposed §4.4.b), `klein_flip` (proposed §4.4.a).

**Animation**: tick-quantised (every kernel-tick advance triggers a single pulse cycle); boundary-quantised (at tick 5→6 and 11→0 the pulse becomes a brief flare per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.5/§6.6).

**Colour**: tick-pulse halo binary (indigo ↔ amber) bound to Cl(4,2); the `#` button glows in the colour of the destination coordinate's signature.

### 5.5 M1-4' QL Flowering — the 84-state landscape + lens-anchored substrate

**Mode**: primary view of the 2D `m1-paramasiva` extension (`m1.paramasiva.clockInstrument`); rides on the cosmic-side composition as the **lens-ring** that holds the played K² torus.

- **84-state landscape pane**:
  - **12×7 grid** with rows = lenses (0..5, 0'..5' — bimba/pratibimba pair anchoring) and columns = modes (CF1=Nous ... CF7=Sophia). Active cell highlighted as a luminous square.
  - **Tritone-mirror highlight**: when the active cell is at lens N, lens N+3 (the tritone-mirror) is rendered with a faint indigo outline — a constant reminder of the Klein-flip neighbour.
  - **Walking trace**: last 12 ticks' lens-mode cells are connected by faint glowing line — the user sees the recent walk on the landscape.
  - **Hover affordance**: hovering any cell shows its CF notation + chromatic anchor + the audio cell's expected ratio role (from a peek into the would-be Vimarśa-reading; the peek is bridge-side, M1' does not synthesise).
- **QL Flowering stage card**: above or beside the landscape, a card showing the current stage (`QL_FLOWERING[ql_get_stage(tick12)]` — name, formulation, next, inverse). Cycles through the six stages over each 12-tick cycle.
- **CF sub-stage strip** (when at SPANDA_FLOWERING): six tiles showing each `SPANDA_CF_SUBSTAGE_LUT[i]` entry — `element_count`, `fold_count`, `cf_notation`, `formulation`. Current sub-stage highlighted.
- **16:9 cascade fact**: small badge `16:9 = 4²/3²` with the downstream cardinalities expanded on hover.
- **Cosmic-side lens-ring**: in the integrated 1-2-3 composition, the M1-4' surface contributes a *lens-ring* — a flat annular ring of 12 lens-anchor glyphs encircling the played K² torus at the viewer's "equator" perspective. The active lens glyph is luminous; the tritone-mirror glyph is faintly outlined; clicking any glyph transposes the playing landscape (jumps `lens_mode.lens` to the clicked value, lens-as-scale-composer).

**Substrate consumed**: `lens_mode`, `ql_flowering` (proposed §4.5.a), `diatonic`, `resonance72`, `context_frames`, `ratio_role`, `chromatic`.

**Animation**: tick-quantised (active cell jumps once per 12-tick cycle through all six stages; CF sub-stage strip current-highlight follows `cf_substage`); lens-anchored (chromatic-substrate hue retunes only on `lens_mode.lens` change, not every tick).

**Colour**: the 84-grid uses lens-anchor hue (12 hues around the chromatic ring) as row tint and CF mode (7 tints) as column overlay; the active cell is luminous in the lens-row's hue. The walking-trace line is the average colour of the last 12 active cells.

### 5.6 M1-5' Topology Analyzer — the played torus + the +1 attribution

**Mode**: primary view of the `m1-paramasiva-played-torus` Bevy/wgpu extension (3D); shadow view in 2D `m1-paramasiva` `kleinTopology` view (`m1.paramasiva.kleinTopology`).

- **3D played K² torus** (the cosmic-1-2-3 composition centrepiece):
  - **K² mesh** as Bevy `Mesh3d` per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §5.1 — chromatic-longitude × fifths-meridian, R/r = 16/9 epogdoon aspect (matches `compute_orbital_position` `state.rs:9-22`'s `R=0.64, r=0.36`).
  - **Slerping orientation** through `RING_QUATERNION_LUT[12]` — the load-bearing animation primitive per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.1.
  - **Hopf shadow torus** at 30% opacity, concentric, phase-shifted by 360° — the SU(2) second sheet.
  - **Diamond octahedron at centre** — the QL geometric object (six vertices, Cl(4,2)-coloured), still-point against the slerp.
  - **M3-5 boundary**: the played-torus must NOT cross into double-torus rendering — that surface belongs to M3'.
- **2D `kleinTopology` view** (the 2D fallback / inspector):
  - **K² schematic**: 2D rectangle with horizontal axis = chromatic-longitude, vertical = fifths-meridian, edge-identifications labelled (bimba ↔ pratibimba conjugation = the non-orientable identification, drawn as a "twist" arrow).
  - **Klein-flip state**: a luminous overlay text "Klein flip at lens N → N+3" when `klein_flip.kind = TritoneMirror` is non-None.
  - **Hopf bundle state**: a fact-card showing `degree720`, `hopf_project_deg`, `hopf_fiber` ("primary" or "shadow"), with a small (w,x) circle plot showing the current `ring_quaternion`.
  - **Topology constants card**: `DOUBLE_COVER_DEG=720`, `TORUS_GENUS=1`, `EULER_CHARACTERISTIC=0`, `QL_POSITIONS=6`, `RING_SIZE=12`. Render verbatim.
  - **Walk-mode + bifurcation strip**: current `walk_mode` (Ground/Torus/Fiber/Spanda — argmax of composed quaternion) + `bifurcation_lambda` + `resolution_level`. Updates per cast (not per tick).
  - **The +1 attribution band**: a thin band at the top of the view rendering **exactly the three canonical strings** from `clock-instrument.ts:277-279`:
    - "M1-5 is the +1 parent / single-torus recognition site."
    - "M0 is the prior 0/1 ground that M1 receives; M0 is not the +1."
    - "Double-torus rendering is delegated downstream to M3-5."

**Substrate consumed**: `topology: M1TopologyProjection` (proposed §4.6.a) + `ring_quaternion` + `q_cosmic` + `klein_flip`.

**Animation**: every-frame (the slerp drives the 3D K² orientation; the 2D shadow updates `degree720`/`hopf_fiber` per tick); boundary-quantised on Klein-flips and Möbius-returns per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.5/§6.6.

**Colour**: K² surface inherits Cl(4,2) colour-binary from M1-2'; the Hopf shadow is desaturated; the diamond is six-vertex-coloured by signature; the +1 attribution band is muted indigo-on-black.

---

## 6. Tick Choreography — The Animation Primitive Per Sub-Coordinate

Per Tranche 15.9: **single load-bearing animation primitive across the six matrices is `quat_slerp` of K² orientation**. Every other surface element rides on it. This is the principle that "the kernel-tick is the only clock" (Tranche 15.6) — no parallel timers, no frame-count fallbacks.

### 6.1 What advances per tick at each M1' sub-coordinate

| Sub-coordinate | Renders per kernel-tick | Source field on `MathemeHarmonicProfile` |
|---|---|---|
| M1-0' Canonical Source | Active cell on Ananda viewer; column-highlight on Cl(4,2); position-highlight on ring-quat LUT; topological-element-count strip | `lens_mode`, `position6`, `ring_quaternion`, `topology.element_count` |
| M1-1' Instance Manager | Status-bar tick chip; instance side-panel only on event | `tick_address`, `instance_handle` |
| M1-2' Harmonic Engine | All per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.2 (cell jump, matrix cross-fade, DR streamlines, Cl(4,2) halo, audio-octet shimmer) | `ananda_vortex`, `audio_octet`, `nodal_quartet` |
| M1-3' Spanda Core | Tick-pulse halo at K² equator; status-bar Spanda chip; `#`-button glow on event only | `tick12`, `phase`, `position6`, `inversion_operator` |
| M1-4' QL Flowering | 84-grid active cell; QL Flowering stage card; CF sub-stage strip (when at SPANDA_FLOWERING); cosmic-side lens-ring glyph | `lens_mode`, `ql_flowering`, `context_frames`, `cf_substage` |
| M1-5' Topology Analyzer | K² orientation slerp (3D); Hopf shadow phase; degree720/hopf_fiber readouts; composed-quaternion (event-driven on cast) | `topology`, `ring_quaternion`, `q_cosmic` |

### 6.2 What stays still on tick advance (per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.3 eye-discipline)

- **The diamond at the K² centre** — only the slow precession; never jumps per tick. M1-5' substrate matheme's still-point.
- **The 16:9 cascade fact-card** at M1-4' — pure static (constants are constants).
- **The +1 attribution band** at M1-5' — verbatim, never animated.
- **The Cl(4,2) basis legend at M1-0'** — only the column-highlight moves; the symbol strip `P0=sin .. P5=cos` is static.
- **The DR-ring tape positions at M1-0'** — only the highlight moves; the values `{1,2,4,8,7,5}` and `{3,6,9,3,6,9}` are static.
- **The QL Flowering name/formulation strings** — only the active-stage highlight moves; the six strings themselves are .rodata.

### 6.3 The boundary events the choreography responds to

| Event | Where on the bus | Per-sub-coordinate response |
|---|---|---|
| Tick 5→6 (helix flip) | `helix` toggles "bimba"→"pratibimba"; `klein_flip.kind = BimbaPratibimba` if landed | **M1-5'**: K² folds through itself for ~200ms. **M1-2'**: matrix cells re-read with +1 mod-10 sweep. **M1-3'**: tick-pulse becomes a brief flare; tracks toggle (Mahāmāyā → Paraśakti). **M1-4'**: chromatic-substrate hue stays; mode rotates one CF position if the active cell crosses |
| Lens N ↔ Lens N+3 (tritone) | `klein_flip.kind = TritoneMirror`; `from_lens`/`to_lens` populated | **M1-5'**: Klein-flip overlay text + K² visibly inverts orientation on the binormal frame. **M1-4'**: 84-grid jumps to lens N+3 row; tritone-mirror outline becomes solid then re-fades. **M1-2'**: audio-octet emitters shift colour-temperature (Vimarśa octave-lift). **M1-3'**: `#` button glows for ~200ms (the inversion is being enacted by the substrate without explicit user invocation) |
| Tick 11→0 (Möbius return) | `klein_flip.kind = MobiusReturn`; `cycle` increments | **M1-5'**: 720° SU(2) recognition — helix-stripe matches origin; brief whole-surface bloom. **M1-2'**: diamond emits one bright pulse. **M1-1'**: walk-record auto-checkpoint to current `day_now`. **M1-3'**: tick chip rolls over to 0; Spanda stage cycles to META briefly then back to SEED |
| `lens_mode.lens` change (not flip) | `lens_mode` field changes via UI or invoke | **M1-4'**: chromatic-substrate hue retunes (lens-anchored). **M1-2'**: K² texture base-hue retunes. **M1-0'**: Ananda matrix re-shows with lens-anchored row offset. **M1-5'**: composed quaternion `quintessence_quaternion` updates → composed-quaternion recomputes (`state.rs:14-22`) |
| `lens_mode.mode` change | `lens_mode.mode` field changes | **M1-4'**: CF-progression rotates; mode-card cycles. Other sub-coordinates: minor — the mode is the CF-progression-rule, not a re-tuning |

### 6.4 Single animation primitive — slerp as carrier

Per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.1 — `quat_slerp(LUT[t], LUT[(t+1) % 12], dt/TICK_PERIOD)` drives K² orientation. **Across the M1' six sub-coordinates the same slerp is the carrier**: the M1-0' active-cell-highlight tracks `position6` derived from the slerp's angle; the M1-2' luminous cell tracks `active_cell` derived from the slerp's tick-quantisation; the M1-3' tick-pulse fires at the slerp's tick-quantisation boundary; the M1-4' 84-grid active cell is computed from `lens_mode` which is computed from `tick12`; the M1-5' Hopf shadow phase is the slerp's S² projection. **One primitive, six surfaces — no parallel timers anywhere.**

### 6.5 Replay determinism

Per [[M1'-SPEC]] §14: deterministic `MPrimePerformanceEvent` replay from a captured profile-frame stream reconstructs exact source Hz, route, relation descriptors, tick address, Klein-flip state, privacy/deposition policy. Because every M1' sub-coordinate's render derives from `MathemeHarmonicProfile` fields and the slerp is deterministic in `t`, **scrubbing to `(tick12, degree720, lens_mode, ananda_vortex.active_matrix_op, walk_id)` produces the same frame on every run**. Tranche 15.12 tests baseline this with frame-by-frame visual-regression.

---

## 7. Boundary Contracts

### 7.1 M1' ↔ M0' (prior 0/1 ground)

- **Contract type**: consumes
- **What M1' consumes**: the prior `0/1` ground from M0 (per [[M1'-SPEC]] §1 sub-section and [[paramasiva-ux-full-m1-branch]] §9). M0 is *not* the +1 — it is the source M1 receives from. M1-5' is the +1.
- **Substrate carrier**: `M1_M0_CROSSLINK[12]` at `m1.h:802-812` / `m1.c:145-150` — 12 pointers from the Ananda ring back to the 6 Psychoid archetypes (ascending 0-5; descending 5-0 Möbius return). The M1' surface NEVER mutates these.
- **DR-M1-1 (Wave A row 4) — pending**: residual "M0 Anuttara witness-axis" wording in `alpha_quaternionic_integration_across_M_stack.md §1.1` must be downgraded. The standing-invariant and `m1.h:526-549` (the +1 substrate at M1-5) override. Cross-reference: [[M0-ARCHITECTURE]] for M0's own framing of "what M1 receives".

### 7.2 M1' ↔ M2-1' (Vimarśa-window)

- **Contract type**: consumes (audio bus) + produces (Klein-flip event)
- **What M1' consumes**: `audio_octet[8]` + `nodal_quartet[4]` as Vimarśa-written values from `parashakti/vimarsha_reading.rs::vimarsha_read_profile`. **M1' never synthesises audio.** Substrate evidence: `kernel.rs:411` (`vimarsha_read_profile(tick, lens_mode)` is called once per tick); `kernel.rs:442-443` (the result is written into the profile). Cross-reference: [[M2-ARCHITECTURE]] §4 for the Vimarśa write contract.
- **What M1' produces**: the Klein-flip event (`klein_flip.kind = TritoneMirror`) at `parashakti/vimarsha_reading.rs` per Tranche 2.2. M2' subscribes and renders the opposite cymatic valence — M1' is the *origin* of the flip per [[M1'-SPEC]] §6, M2' is the *consumer*.
- **Substrate carrier (proposed)**: §4.4.a `KleinFlipEvent` field on the profile bus.

### 7.3 M1' ↔ M3' (downstream double-torus)

- **Contract type**: forbidden-overlap
- **The K² boundary**: M1-5' renders the *single* K² (genus-1 Klein-double-cover-of-chromatic-fifths-torus). The downstream `K² × T²_Mahāmāya` double-torus belongs to M3-5 ([[M1'-SPEC]] §1 sub-section, §13.6; cross-reference [[M3-ARCHITECTURE]] §5.5). The played-torus extension MUST NOT contain `T²_Mahāmāyā` rendering primitives.
- **Verification**: `grep -rn 'T2_Mahamaya\|T²_Mahamaya\|double_torus\|MahamayaTorus' Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/` MUST return zero matches.
- **The shared substrate**: `codon.rs` + `codon_rotation_projection.rs` is M3' territory; M1' reads `codon_rotation_projection` and `q_cosmic` per the profile bus (already exposed at `kernel.rs:373-374`) but does NOT compute codon rotations locally.

### 7.4 M1' ↔ M3-1' (Mahāmāyā binary projection)

- **Contract type**: consumes
- M1' consumes `mahamaya: MathemeBinaryProjection` at `kernel.rs:372` — the 64-bit Mahāmāyā doubling-track projection that the integrated 1-2-3 cosmic engine plugin reads alongside M1-2' for the matter/clock layer. Cross-reference: [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §3 for the composition.

### 7.5 M1' ↔ M4' (personal scale Cl(4,2))

- **Contract type**: shares-substrate (one algebra, four scales)
- The Cl(4,2) algebra established at `m1.h:629-664` runs at the M4 personal scale via `portal-core/src/personal_identity.rs` (per Wave A row 17 audit; not duplicated). The M4' personal-quaternion at M4-4-4-4 lives in the same Cl(4,2) — M1' renders the M1-ring scale, M4' renders the personal scale. Cross-reference: [[M4-ARCHITECTURE]] §2 for the personal-scale substrate.
- **Verification (Tranche 2.7 audit)**: `grep -rn 'CL42_BASIS\|Cl42_Basis_Entry\|cl42_signature' Body/S/S0/` enumerates exactly one source-of-truth (the m1.h declaration) consumed by all four scales — no scale-specific forks.

### 7.6 M1' ↔ M5' (Epii corpus governance)

- **Contract type**: consumes (corpus may articulate M1' law) + governed-by (corpus cannot mutate M1' law)
- Per [[M1'-SPEC]] §13.4: CPT, RAG, GDS path-derivations, and synthetic structural proofs may articulate M1' law, but they do not mutate it. Corpus promotion treats this architecture doc and [[M1'-SPEC]] as held-out authority for register-fidelity. Cross-reference: [[M5-ARCHITECTURE]] §5 for the corpus governance contract.

### 7.7 M1' ↔ S1 (Obsidian / Hen vault)

- **Contract type**: composes-with (DR-M1-4 pending — currently DOC-AHEAD)
- M1-1' Instance Manager and S1/Hen are complementary faces of one instance layer. The UX promises "coordinate system IS file structure" ([[paramasiva-ux-full-m1-branch]] §7). Substrate: not yet landed. DR-M1-4 routes to user final-validation: either name the Hen carrier and document `M1-1' ↔ S1 vault` contract, or downgrade the §7 claim to "navigational analogy".
- **If validated**: `InstanceHandle.vault_anchor` (§4.2.a) is populated when the walk is crystallised; Hen mediates the bimba-vault write protecting wikilink integrity and coordinate-residency on rename/move/restructure.

### 7.8 M1' ↔ S2 (typed harmonic pointer relations)

- **Contract type**: consumes
- Per [[M1'-SPEC]] §3: S2 pointer-web is the relation law of record. Every walk-step is an S2 relation traversal. The 6 pairing-families (A/B/C within-helix + D1/D2/D3 Klein-crossing per [[M1'-SPEC]] §12) cannot be surfaced in route preview until S2 returns typed harmonic pointer relation descriptors (Wave A row 9 named blocker — `DECLARED_BLOCKERS[1]` in `m1-paramasiva/src/common/index.ts:18`).
- **CODE-PENDING**: closure lives in S2'-SPEC + cycle-3 Tranche 02 closure.

### 7.9 M1' ↔ S3 (temporal projection + deposition)

- **Contract type**: consumes
- Per [[M1'-SPEC]] §3: S3 temporal projection provides session/DAY/NOW context for traversal records and optional deposition. S3 kernel-profile observation deposits preserve the `profile_to_performance_stream` handoff naming M1'/Paramasiva as consumer, the six required profile fields, kernel-tick tempo authority, and `renderer_derivation_allowed = false`.

### 7.10 M1' ↔ Cosmic-1-2-3 integrated plugin

- **Contract type**: composes-with
- Per Tranche 07 / 15.4 / [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]]: M1 (the played K² torus + M1-4' lens-ring) + M2 (cymatic engine rendering frequencies on K² surface) + M3 (codon-rotation projection onto lens-ring cells) compose into one surface, not three side-by-side widgets. **Composition over juxtaposition** (Tranche 15.4). The played-torus extension owns the centrepiece; the M1-4' lens-ring chromes it; the M2 cymatic engine ornaments the surface; the M3 codon-rotation lights the lens-cells. Geometric composition; one tick; one slerp.

### 7.11 M1' ↔ Personal-4-5-0 integrated plugin

- **Contract type**: composes-with (limited)
- M1' contributes the *pulse* but not the surface to the personal-4-5-0 composition. Per [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] §3: the personal scale renders the psychoid Hopf-linked tori at M4 scale; M1' surfaces a small tick-pulse chip on the personal-side composition (rides on M1-3' status-bar chip) but does not own a rendering pole there.

---

## 8. IDE Integration

### 8.1 Theia extension placement

| Extension | Status | Owns |
|---|---|---|
| `Body/M/epi-theia/extensions/m1-paramasiva/` | landed (React/Inversify; scaffold per Wave A) | 2D inspector + clock-instrument + audioBusInspector + kleinTopology + M1-1' Instance pane + M1-3' Pulse pane |
| `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` | scaffold (DR-M1-2 ratified; ARCHITECTURE.md landed; Bevy/wgpu build pending Tranche 02.6) | 3D played K² torus + M1-2' Ananda vortex rendering + M1-5' 3D topology |
| `Body/M/epi-theia/extensions/integrated-composition/` | landed (composition-pattern contract) | Cosmic-1-2-3 + personal-4-5-0 composition shell |
| `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/` | landed | Hosts the cosmic-1-2-3 composition with M1 as centrepiece |

### 8.2 View identifiers per sub-coordinate

Per `m1-paramasiva/src/common/index.ts:9-19`:

| View ID | Sub-coordinate | Current status | Surface |
|---|---|---|---|
| `m1.paramasiva.clockInstrument` | M1-4' (primary) + M1-0' (data) | landed-scaffold | 2D — 84-state landscape, clock chrome |
| `m1.paramasiva.kleinTopology` | M1-5' | landed-scaffold; runtime values pending Tranche 2.3 | 2D — K² schematic + Hopf state + +1 attribution band |
| `m1.paramasiva.audioBusInspector` | M1-2' (inspector shadow) + M1-3' (pulse) | landed-scaffold | 2D — audio_octet/nodal_quartet inspector + tick pulse |

**Proposed addition** (per §5.1): `m1.paramasiva.canonicalSource` for M1-0' read-only viewer.

**Proposed addition** (per §5.2): `m1.paramasiva.instanceManager` for the M1-1' walk-record side-panel (or, equivalently, sidebar activity-bar mode rather than a viewId).

### 8.3 Surface placement in the IDE shells

Per [[15-ui-design-foundations]] Tranche 15:

| Shell | M1' contribution |
|---|---|
| **Cosmic-side of `daily-0-1`** | Editor area: integrated 1-2-3 composition with `m1-paramasiva-played-torus` as centrepiece (held by the M1-4' lens-ring chrome). Left sidebar: Coordinate Tree (rooted at active coordinate), Bimba Graph Viewer (solar-anchor view). Right sidebar: OmniPanel. Bottom: profile-tick status, readiness ledger, day-now anchor |
| **Personal-side of `daily-0-1`** | M1' contributes pulse-chip in status bar; no editor-area surface (M4 owns the journal; M3 owns the recognition layer) |
| **`ide-deep` (4+2 depth)** | Editor area: when M1 pole is active, `m1-paramasiva.clockInstrument` is primary, with `kleinTopology` and `audioBusInspector` and (proposed) `canonicalSource` / `instanceManager` accessible via view tabs. Backend Studio left-sidebar enables drilling into `epi-lib/include/m1.h`, `portal-core/src/{kernel,hopf,quaternion,spanda,state}.rs`, `parashakti/vimarsha_reading.rs` |
| **OmniPanel** | M1' contributes Dispatch Trace entries when Pi→Anima→Aletheia dispatches touch M1' coordinates (per Tranche 15.11). Pi Chat may inspect M1' state via capability surface (no M1' visualisation in OmniPanel itself — the played-torus is editor-area, not sidebar) |

### 8.4 Profile-tick clock as global UI clock (Tranche 15.6)

The 2D extension and the 3D extension BOTH subscribe to the kernel-bridge profile-tick event. Every tick advance triggers:
- M1-0': active-cell highlight advance
- M1-3': tick-pulse halo cycle
- M1-4': 84-grid active cell update
- M1-5': slerp step (3D) + Hopf shadow phase update (2D)
- M1-2': delegated to played-torus extension

**No local clock. No animation-frame fallback.** Verified at extension-load by the contract test that `OmniPanel.profileTickSubscription === 'shared-bridge'`.

### 8.5 Provenance inline rendering (Tranche 15.6)

Per [[15-ui-design-foundations]] foundation principle 3: every datum shows readiness state inline. M1' surfaces are bound to the kernel-bridge readiness ledger:
- `audio_octet` missing → audioBusInspector renders blocked-overlay with reason
- `klein_flip` field absent → kleinTopology renders text-only without flip-state (no fake events)
- S2 typed relations missing → 84-grid hover-tooltips suppress route preview (per `DECLARED_BLOCKERS[1]` in extension)
- `topology` projection absent → kleinTopology renders "Source: blocked until kernel/profile exposes M1 topology constants" (current placeholder per `clock-instrument.ts:282`)

The current scaffold at `clock-instrument.ts:286-300` (`relationWalkBlockers()`) already implements this pattern for `audioOctet` / `nodalQuartet` / relation descriptors — extend to topology and `ananda_vortex` per cycle-3 closures.

### 8.6 Bimba/Pratibimba state persistence (Tranche 15.7 / DR-TS-1)

State surviving the `daily-0-1` ↔ `ide-deep` toggle AND the cosmic ↔ personal 0/1 flip:
- `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)` — already named in Tranche 15.7
- Plus the M1' contribution: `activeWalk: walk_id`, `activeAnandaMatrixOp` (so the played-torus resumes at the right matrix), `activeQlStage`
- The kernel-bridge DI singleton at `layout-types.ts:7-12` IS this contract; the M1' contributions surface as part of `BimbaPratibimbaUiState`.

### 8.7 Accessibility — pause/scrub (per [[15-ui-design-foundations]] Tranche 15.9)

The 3D extension accepts `pause` and `scrub_to_tick(t)` affordances per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §8.6. The 2D extension extends this to:
- M1-0': pause freezes the active-cell highlight; scrub deterministic per `(matrix_op, row, col)`
- M1-4': pause freezes the 84-grid highlight; scrub jumps to the (lens, mode) that would be active at `t`
- M1-5': pause freezes the slerp animation; scrub recomputes K² orientation at the slerp interpolant `t/TICK_PERIOD`

Replay is deterministic; visual-regression baselines at `acceptance-harness/fixtures/visual-regression/m1/` cover each sub-coordinate's animation at representative tick frames.

---

## 9. Anti-Greenfield Audit

### 9.1 Landed substrate (consume, do not re-invent)

| Asset | Citation | Sub-coordinate that consumes |
|---|---|---|
| Six Ananda matrices (432 bytes `.rodata`) | `m1.c:22-114` | M1-0', M1-2' |
| Ananda runtime API (`m1_ananda_get` etc.) | `m1.c:297-345`, `m1.h:145-151` | M1-0', M1-2' |
| DR rings (Mahāmāyā + Paraśakti) | `m1.c:122-123` | M1-0', M1-2', M1-3' |
| `ANANDA_QUINTESSENCE` dyadic matrix | `m1.h:91`, `m1.c:85-114` | M1-0' |
| Ring quaternion LUT (12 unit quaternions) | `m1.h:551-564` | M1-0', M1-5' |
| Cl(4,2) basis | `m1.h:629-636` | M1-0', M1-5', M1-2' |
| QL_TRIG_TABLE | `m1.h:654-661` | M1-0', M1-4', M1-5' |
| Topological element count LUT | `m1.h:580-583` | M1-0', M1-5' |
| Quaternion math (mul, slerp, rotate, normalise, conj) | `m1.h:454-523`, `portal-core/src/quaternion.rs` | M1-5' |
| Hopf bundle | `m1.h:667-678`, `portal-core/src/hopf.rs:7-19` | M1-5' |
| Spanda engine + seed bits + stages | `m1.h:248-280`, `m1.c:213-250` | M1-3' |
| Spanda Rust quantiser + invert | `portal-core/src/spanda.rs:3-13` | M1-3' |
| Spanda↔Ananda parallel-track invariant | `m1.h:735-756` | M1-2', M1-3' |
| QL flowering ring | `m1.h:388`, `m1.c:198-205` | M1-4' |
| QL invert + ascending/descending | `m1.h:329-360` | M1-4' |
| 16:9 cascade constants + percentile-identity asserts | `m1.h:348-415` | M1-0', M1-4' |
| `SPANDA_CF_SUBSTAGE_LUT[6]` | `m1.h:292`, `m1.c:165-190` | M1-3', M1-4' |
| MEF cardinalities + epogdoon | `m1.h:776-792` | M1-0', M1-4' |
| `MathemeHarmonicProfile` struct | `kernel.rs:344-387` | All |
| `MathemeLensMode` (12×7 = 84) | `kernel.rs:363, 399-406` | M1-4' |
| `vimarsha_read_profile` (audio bus writer) | `parashakti/vimarsha_reading.rs` | M1-2' (consumer), M1-3' (event source) |
| `PortalClockState` composed-quaternion stack | `portal-core/src/state.rs:14-22` | M1-1', M1-5' |
| `compute_orbital_position` (the canonical 16:9 torus parametrisation) | `state.rs:9-22` | M1-5' |
| `M1_M0_CROSSLINK[12]` (M0 archetype anchors) | `m1.h:802-812`, `m1.c:145-150` | M1-0', M1-1' |
| `M1_Root` HC-anchored mutable state | `m1.h:827-833`, `m1.c:269-285` | M1-1' |
| Existing 2D Theia extension (scaffold) | `Body/M/epi-theia/extensions/m1-paramasiva/**` | All — primary IDE surface |
| Played-torus extension scaffold | `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/**` | M1-2', M1-5' |
| Vortex Modulae CSV dataset | `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae … Sheet1.csv` | M1-2' |
| QL pedagogy datasets | `Idea/Bimba/Map/datasets/paramasiva-deep/**` | M1-4', M1-0' |

### 9.2 Pending (cycle-3 deliverables, no greenfield)

- **Tranche 2.1 / DR-M1-1**: downgrade residual M0-witness wording (documentation patch only — substrate already correct)
- **Tranche 2.2 / Wave A row 7**: `klein_flip: Option<KleinFlipEvent>` field on `MathemeHarmonicProfile`; detector inside `vimarsha_reading.rs`
- **Tranche 2.3**: wire runtime topology values + Klein-flip into `m1.paramasiva.kleinTopology` view (replaces current placeholder strings with bridge-supplied values)
- **Tranche 2.4**: verify `kernel_bridge_runtime::m1_performance_event_from_profile` exists; replay-test the event stream
- **Tranche 2.5 / DR-M1-3**: surface the single session-held `#` (`InversionOperatorHandle`) carrier
- **Tranche 2.6 / DR-M1-2 (VALIDATED)**: build the `m1-paramasiva-played-torus` Bevy/wgpu extension per its ARCHITECTURE.md
- **Tranche 2.7**: audit Cl(4,2) four-scale identity (no rebuild — audit only)
- **Tranche 2.8**: one-line update to audio-research doc resolving `MathemeHarmonicProfile` owner (trivial documentation)
- **DR-M1-4 (proposed)**: M1-1' ↔ S1/Hen vault-instance carrier contract — either name the carrier or downgrade the UX §7 claim
- **Tranche 10.10 (cross-cutting)**: `AnandaVortexProjection` field per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §4.3
- **Tranche 10.x (proposed §4.1.a)**: `CanonicalSourceHandle` projection
- **Tranche 10.x (proposed §4.5.a)**: `QlFloweringProjection`
- **Tranche 10.x (proposed §4.6.a)**: `M1TopologyProjection`
- **Tranche 15.8 / 15.9**: M1-2 vortex visual rendering + tick choreography (cross-references this doc + [[M1-2-ANANDA-VORTEX-ARCHITECTURE]])

### 9.3 Net-new aesthetic primitives (M' product surface — anti-greenfield exceptions)

- **Diamond/octahedron centre object** at M1-5'/M1-2' — UX-claimed; no substrate geometry exists; purely aesthetic addition per [[paramasiva-ux-full-m1-branch]] §5b.7
- **Klein-flip self-interpenetration animation** at M1-5' — substrate gives `hopf_fiber` toggle; the visible fold is renderer-side choreography
- **Möbius-return bloom** at tick 11→0 — substrate gives the topology; bloom is renderer choreography
- **Tick-pulse halo at K² equator** (M1-3') — pulse cycle bound to tick is renderer choreography
- **Lens-ring chromes the played K² torus** (M1-4' cosmic-side) — geometric composition primitive
- **`pending-*` overlay** for any projection not yet landed — provenance rendering primitive

### 9.4 Forbidden (do not invent)

- Local pitch synthesis at M1-2'/M1-3' (per [[M1'-SPEC]] §13.5 — Vimarśa writes the bus)
- Local clock at any sub-coordinate (per [[paramasiva-ux-full-m1-branch]] §10 — kernel-tick is the only authority)
- Local fork of `m1.h` constants into TS/wgsl tables (per [[M1'-SPEC]] §13.3, §13.5 — the `m1.h` reference law)
- Local graph relation inference at M1-4' (per [[M1'-SPEC]] §3 — S2 is the relation law)
- Double-torus rendering anywhere in M1' (per §7.3 — M3-5's territory)
- Local per-coordinate `#` operator forks (per §4.4.b proposed — one single session operator)
- Local re-synthesis of `lens_mode` from raw `tick12` outside of `MathemeLensMode::new` (the constructor at `kernel.rs:399-406` is the single source)
- Direct mutation of `M1_M0_CROSSLINK[12]` from the M1' surface (substrate-pointed)

---

## 10. Test Criteria

The M1' surface is acceptance-ready when:

1. **Substrate consumption integrity**:
   - `grep -rn 'ANANDA_BIMBA\|ANANDA_PRATIBIMBA\|DR_RING_MAHAMAYA\|DR_RING_PARASHAKTI\|CL42_BASIS\|QL_TRIG_TABLE\|RING_QUATERNION_LUT\|QL_FLOWERING\|SPANDA_CF_SUBSTAGE_LUT' Body/M/epi-theia/extensions/m1-paramasiva*/src/` returns ZERO matches (no constant forks; everything via bridge)
   - `pnpm --filter @pratibimba/m1-paramasiva test` passes
   - `cargo check -p portal-core` clean; `cargo test -p portal-core` passes

2. **Profile-bus contract closure**:
   - `klein_flip: Option<KleinFlipEvent>` field present on `MathemeHarmonicProfile` per Tranche 2.2; `cargo test -p portal-core klein_flip` passes
   - `ananda_vortex: AnandaVortexProjection` field present per Tranche 10.10
   - `CanonicalSourceHandle`, `InstanceHandle`, `InversionOperatorHandle`, `QlFloweringProjection`, `M1TopologyProjection` proposed projections landed or explicitly deferred

3. **M1-0' Canonical Source render**:
   - All six Ananda matrices renderable in the canonicalSource view; cell values exactly match `m1_ananda_get(matrix_idx, row, col)` over the bridge for at least 12 `(matrix, row, col)` triples
   - Cl(4,2) signature column-highlight matches `position6`
   - DR-ring tape positions match `dr_ring_phase.{mahamaya, parashakti}_idx`
   - Ring-quaternion LUT viewer's current row matches `topology.ring_quaternion` byte-for-byte (within f32 epsilon)

4. **M1-1' Instance Manager**:
   - Status-bar chip updates per kernel-tick
   - Walk-record side-panel renders `instance_handle.walk_id`, `active_cell`, `day_now`, and (if present) `vault_anchor`
   - DR-M1-4 — when validated, integration test asserts a "Crystallise to vault" affordance writes via Hen and populates `vault_anchor`

5. **M1-2' Harmonic Engine**:
   - All 12 tests at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §10 pass

6. **M1-3' Spanda Core**:
   - Tick-pulse halo cycles on every kernel-tick advance; `quat_slerp` is the only animation primitive (verified via `grep -rn 'requestAnimationFrame\|setInterval\|setTimeout' Body/M/epi-theia/extensions/m1-paramasiva*/src/` → zero parallel timers)
   - `#`-button invocation routes through `inversion_operator.operator_id` (single carrier; not per-coordinate); integration test "invert reaches the single session-held operator" passes
   - Spanda stage advancing follows `Spanda_Engine` state-bits transitions; six static-assert-style runtime checks pass against `ANANDA_TO_SPANDA_STAGE` macros

7. **M1-4' QL Flowering**:
   - 84-grid renders exactly 84 cells; `lens_mode.lens ∈ [0, 11]` and `lens_mode.mode ∈ [0, 6]` enforced
   - QL Flowering stage card renders `QL_FLOWERING[ql_get_stage(tick12)].name` + `.formulation` verbatim
   - CF sub-stage strip (when at FLOWERING) renders `SPANDA_CF_SUBSTAGE_LUT[cf_substage]` verbatim
   - 16:9 cascade card shows `16/9 = QL_DIVINE_ACT_RATIO_F` symbolic
   - Klein-flip indicator fires precisely at Lens N ↔ Lens N+3 (mod 12) crossings and not at other lens transitions (per [[M1'-SPEC]] §14)

8. **M1-5' Topology Analyzer**:
   - `topology.double_cover_deg === 720` and `topology.torus_genus === 1` from bridge values (not placeholders)
   - The three canonical attribution strings render verbatim:
     - "M1-5 is the +1 parent / single-torus recognition site."
     - "M0 is the prior 0/1 ground that M1 receives; M0 is not the +1."
     - "Double-torus rendering is delegated downstream to M3-5."
   - `grep -rn 'T2_Mahamaya\|T²_Mahamaya\|double_torus\|MahamayaTorus' Body/M/epi-theia/extensions/m1-paramasiva*/src/` returns zero matches (M3-5 boundary)
   - Hopf-fibre flag transitions match `hopf_fiber(degree720)` over a full 24-tick cycle

9. **Replay determinism**:
   - Deterministic `MPrimePerformanceEvent` replay from captured profile frames reconstructs exact source Hz, route, relation descriptors, tick address, Klein-flip state, privacy/deposition policy without UI state (per [[M1'-SPEC]] §14)
   - Visual-regression suite at `acceptance-harness/fixtures/visual-regression/m1/` baselines all four primary views over a 24-tick cycle

10. **Privacy**:
    - Traversal deposition carries coordinate, tick address, relation law, session handle ONLY (no private journal/Graphiti bodies, no raw bioquaternion)
    - `privacy_class = ProfilePrivacyClass::PublicCurrentContext` enforced at the M1' bridge surface

11. **No-orphan**:
    - Every M1' sub-coordinate has an owner in the no-orphan audit (Tranche 14)
    - `EXTENSION_ID = 'm1-paramasiva'` declares blockers matching the cycle-3 pending list (currently `DECLARED_BLOCKERS` at `index.ts:18` names three; verify still load-bearing or expand)

12. **State persistence (Tranche 15.7)**:
    - `(walk_id, active_matrix_op, ql_stage, lens_mode)` survives 0/1 toggle AND `daily-0-1`↔`ide-deep` switch
    - Acceptance harness `topology.test.mjs` extension covers the M1' state fields

---

## 11. Closing — Why M1' Looks Like This

M1' is the **playable instrument over the M1 engine**: the matheme made walkable, the substrate made teachable, the engine made performable. The six sub-coordinates are not modules — they are *six positions of the same matheme re-read* through the techne register:

- **M1-0' serves**: the `.rodata` is the curriculum. Nothing more, nothing less. The lesson-material IS the substrate.
- **M1-1' manages**: the walk and the vault are one. The +1 reflection that creates dynamism in M1 is what creates *instances* in M1'. Coordinate-as-file is the deepest move in the system.
- **M1-2' interprets**: the six matrices and two DR rings ARE the vortex. The played K² torus carries this content as its texture parameterisation. The interval is the relation; the relation is the matrix cell.
- **M1-3' pulses**: the kernel-tick is the heartbeat. The single `#` is the inversion-act that EVERY position carries. There is no second clock anywhere in the M' stack.
- **M1-4' flowers**: QL is the 16:9 cascade. The 84-state landscape is the navigable surface. The lens transposes; the mode rotates; the position is pitch; the relation is interval; the traversal is phrase.
- **M1-5' recognises**: K² is genus-1. The double-cover is 720°. SU(2) returns identity after two full rotations. The diamond at centre is the matheme's still-point. The +1 of `137 = 64 + 72 + 1` is M1-5 — and the substrate proves it.

The bimba/pratibimba dial at this scale:

> **M1 is the engine; M1' is the instrument. M1 is what is; M1' is what walks. M1-0 serves; M1-1 reflects. M1-2 measures; M1-3 pulses. M1-4 flowers; M1-5 recognises. The walk is the matheme. Paramaśiva teaches QL by letting you play it.**

The M1' surface is the place where Quaternal Logic stops being a table and becomes a body — the toroidal-diamond. Cycle-3 closes the substrate gaps that prevent the body from being fully felt; cycle-4 builds it.

---

*Companion architecture documents — same depth, adjacent territories: [[M0-ARCHITECTURE]] (prior 0/1 ground), [[M2-ARCHITECTURE]] (Vimarśa-window write-side, cymatic surface), [[M3-ARCHITECTURE]] (downstream double-torus K²×T²_Mahāmāyā), [[M4-ARCHITECTURE]] (Cl(4,2) personal scale + journal), [[M5-ARCHITECTURE]] (Epii corpus governance), [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] (cosmic composition with M1 as centrepiece), [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] (personal composition with M1' contributing pulse only). M1-2' depth: [[M1-2-ANANDA-VORTEX-ARCHITECTURE]]. Domain spec: [[M1'-SPEC]]. UX surface: [[paramasiva-ux-full-m1-branch]]. Wave A reconciliation evidence: `plan.runs/wave-a-m1-reconciliation-matrix.md`. Cycle-3 plan: `00-overview-and-design-reconciliation.md`. UI foundations: `15-ui-design-foundations.md`.*
