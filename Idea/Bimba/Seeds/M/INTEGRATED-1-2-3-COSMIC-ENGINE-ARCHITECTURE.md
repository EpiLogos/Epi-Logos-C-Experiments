---
title: "Integrated 1-2-3 Cosmic Engine Architecture — Composition Shape, Substrate Map, Profile-Bus Contract, Tri-Pole Rendering & Tick Choreography"
coordinate: "Integrated 1-2-3 / cosmic-engine.integrated"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for the integrated 1-2-3 cosmic engine composition surface. Cross-references M1', M2', M3' architecture docs for per-pole specifics. Where the integrated plugin and the underlying M-extension specs disagree on composition seams, this document is authoritative for the composition; the per-M architecture docs remain authoritative for their poles individually."
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M1-ARCHITECTURE]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"
  - "[[M2-ARCHITECTURE]]"
  - "[[M3-ARCHITECTURE]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
cross_references:
  - "Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md"
related_tranches:
  - "Cycle-2 Tranche 08 — integrated 1-2-3 cosmic engine plugin scaffold"
  - "Cycle-3 Tranche 02.6 — m1-paramasiva-played-torus build"
  - "Cycle-3 Tranche 07 — integrated 1-2-3 plugin composition"
  - "Cycle-3 Tranche 10.10 — ananda_vortex profile-bus field"
  - "Cycle-3 Tranche 15.4 — composition-over-juxtaposition editor-area pattern"
  - "Cycle-3 Tranche 15.6 — profile-tick clock + readiness inline"
  - "Cycle-3 Tranche 15.8 — M1-2 vortex visual rendering on K²"
  - "Cycle-3 Tranche 15.9 — tick choreography across the six matrices"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m1-reconciliation-matrix.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-theia-shell-matrix.md"
---

# Integrated 1-2-3 Cosmic Engine Architecture

## 0. Frame

**The Integrated 1-2-3 Cosmic Engine is the composition surface of the M' stack at cosmic scale.** It is not a sixfold subsystem. It is the place where the matheme's three constitutive cosmic poles — **M1 Paramaśiva** (engine: ring, tick, K² topology, Cl(4,2)), **M2 Paraśakti** (correspondence-tree: 72-axis, cymatic surface, planetary-chakral, klein flip), **M3 Mahāmāyā** (codon-rotation: 64-cell tarot wheel, I-Ching) — compose *geometrically* over a single shared Klein-double-cover-of-the-chromatic-fifths torus surface (K²), driven by a single shared `MathemeHarmonicProfile` tick.

The substrate authority for "K² as the shared topology of all M' surfaces" lives at [`M'-SYSTEM-SPEC.md:296-306`](Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md). The composition principle that binds these three poles into one surface — **composition over juxtaposition** — is the load-bearing UI invariant declared at [`15-ui-design-foundations.md:21`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md), reified as a contract test at [`integrated-composition/src/common/composition-pattern.md`](Body/M/epi-theia/extensions/integrated-composition/) (Tranche 15.4 landing target). The current Cycle-2 widget at [`plugin-integrated-1-2-3/src/browser/cosmic-engine-panes.tsx:101-172`](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-panes.tsx) violates this invariant — three side-by-side `<PaneShell>` blocks rendered via `cosmic-engine-layout` flex — and is the **central artefact this architecture document obsolesces**.

This document gives the **total composition shape**: the bimba↔pratibimba semantics of 1-2-3, the substrate map of the three composed extensions plus the composition coordinator and kernel-bridge, the dataset map across Vortex Modulae, parashakti-deep, and the m3-prime corpus, the profile-bus contract (what 137 = 64 + 72 + 1 looks like as a single struct), the tri-pole rendering contract (the K² torus carrying all three layers simultaneously), the tick choreography that advances all three in lock-step, the boundary contracts that police composition-over-juxtaposition, and the IDE integration discipline that places this surface as the cosmic-side editor-area of `daily-0-1`.

Per [[M3'/full_theoretical_alignments_ql_physics]], the integrated surface may also show a **coupling-flow / measurement-face overlay** owned by the M3 pole. This overlay is register-labelled: symbolic skeleton, physics descent, measurement face, recognition context. It is not a fourth pole, not a new dataset, and not a local physics calculator.

**The matheme:**

```
137 = 64 + 72 + 1
       │    │   │
       │    │   └─ M1-5 (the +1: K², SU(2), Hopf, ring quaternions)
       │    └──── M2 (the 72-axis: tattva·decan·Shem·maqam·MEF×QL·DET)
       └───────── M3 (the 64-cell: codons, hexagrams, tarot, T/U phase)
```

The integrated 1-2-3 plugin renders all three as **one geometric event** on **one surface** at **one tick**. Not three widgets in three panes.

---

## 1. Composition Shape — Three Poles, One K²

The integrated 1-2-3 is **not** a six-sub-coordinate subsystem. Each of the three composed poles owns its own internal six-sub-coordinate structure (M1 owns M1-0..M1-5, M2 owns M2-0..M2-5, M3 owns M3-0..M3-5). The integrated plugin owns the **seam** between them — the composition surface, the readiness aggregation, the layout claim arbitration, and the single profile subscription that fans out to all three poles.

### 1.1 The three poles and what each contributes to the shared surface

| Pole | Contributes to the shared K² | Reads from profile | Owns rendering of |
|---|---|---|---|
| **M1 Paramaśiva** (the +1) | The K² **base geometry** — the played torus itself; ring orientation; Hopf bundle structure; 84-state landscape; raw+digit-root Ananda vortex cells | `tick12`, `degree720`, `position6`, `helix`, `lens_mode`, `q_cosmic`, `ananda_vortex` (proposed), `audio_octet`, `nodal_quartet` | Torus mesh, SO(3) precession, ring-quaternion slerp, Hopf shadow, dual-register ananda-cell luminance/proof overlay, the diamond at centre |
| **M2 Paraśakti** (the 72) | The **cymatic surface texture** on K² — frequency standing-waves over the torus skin; lens/mode correspondence; klein-flip subscription | `resonance72`, `planetary_chakral`, `klein_flip` (Tranche 10.X), `audio_octet`, `lens_mode` | Cymatic Chladni-pattern texture, planetary-chakral halos on lens-ring sectors, 72-axis colour-shells, klein-flip cymatic-valence inversion |
| **M3 Mahāmāyā** (the 64) | The **codon cells** lighting up on the lens-ring sectors of K²; tarot/I-Ching wheel projected as the equatorial lens-ring | `codon_rotation_projection`, `mahamaya`, `binary` (T/U phase), `lens_mode` | 64 codon-cells around the K² lens-ring equator, tarot major/minor lit cell, I-Ching trigram glyphs, 9:8 epogdoon compression visualisation |

### 1.2 The composition arithmetic (137 = 64 + 72 + 1)

The 137-count is **not invented by the integrated plugin**. It is the load-bearing matheme spine declared at [`plugin-integrated-1-2-3/package.json` line 4](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/package.json): "*integrated 1-2-3 cosmic spine carrying 137 = 64 + 72 + 1 only at M1/M2/M3 (NOT M0)*". The integrated plugin **renders** the 137 as **three superposed visual orders on one surface**:

- **The +1 (M1-5)** is geometric — the topology itself. There is exactly one K². The "1" is its uniqueness as the parent surface.
- **The 72 (M2)** is textural — 72 frequency-named regions tile K²'s skin. Each region carries one of the six addressing-axes (`tattva · decan · Shem · maqam · MEF×QL · DET-projection`) as a per-region attribute, surfaceable as colour or glyph overlay.
- **The 64 (M3)** is annular — 64 codon cells sit on the lens-ring equator. The active codon at the current tick lights up; the others recede to ambient.

The three render layers are **stratified**, not **juxtaposed**: M1 is the surface, M2 is its texture, M3 is its annular adornment. You cannot show the texture without the surface; you cannot show the codon ring without the equator. **Composition is hierarchical containment, not horizontal arrangement.**

### 1.3 The bimba↔pratibimba semantics at cosmic scale

The integrated 1-2-3 lives on the **cosmic side** of the `daily-0-1` 0/1 toggle, per [`15-ui-design-foundations.md:31-36`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md). Its pratibimba complement is the integrated 4-5-0 (personal recognition). The 0/1 toggle is **a face switch**, not an app switch. State persists across:

| State field | Source | Survives 0/1 toggle | Survives layout switch |
|---|---|---|---|
| `coordinate` | OmniPanel + status bar | YES (DR-TS-1) | YES |
| `lens` (0-11) | `MathemeHarmonicProfile.lens_mode.lens` | YES | YES |
| `mode` (0-6) | `MathemeHarmonicProfile.lens_mode.mode` | YES | YES |
| `tick12` + ring orientation | M1 played-torus widget local state | YES (resumes mid-slerp) | YES |
| `active_codon` | M3 wheel local state | YES | YES |
| `session` | OmniPanel sessions | YES | YES |
| `day_now` | Status bar | YES | YES |

The cosmic-side composition is the **bimba face** of the daily; the personal-side (4-5-0) is the **pratibimba face**. Same data, opposite presentation. The `#` (inversion) is what fires the lemniscate transition between them.

---

## 2. Substrate Map

### 2.1 The composition coordinator (the seam-owner)

**`CompositionCoordinator`** at [`integrated-composition/src/common/composition-coordinator.ts:73-228`](Body/M/epi-theia/extensions/integrated-composition/src/common/composition-coordinator.ts).

Pure-function arbitrator. Owns three concerns:

- **`resolveClaims(contributors)`** at lines 76-174 — given each contributor's `IntegratedLayoutClaim`s and the named layout descriptor, resolves each into `granted` / `mini-mode` / `inhibited` / `blocked-conflict`. The five singleton slots (line 15-21) are `center-stage`, `side-panel`, `audio-bus`, `selection-owner`, `evidence-panel`. The sixth slot `mini-inspector` is multi-mount.
- **`aggregateReadiness(contributors)`** at lines 176-202 — collapses per-extension readiness states to a single composition-level state, taking the worst severity across contributors. This is what the readiness inline-rendering rule (Tranche 15.6) drives off.
- **`enforceProtectedLocalBoundary(contributors)`** at lines 204-227 — protected-local privacy enforcement (only applies to 4-5-0 personal composition; returns empty for cosmic-engine layout).

The cosmic-engine layout descriptor lives at [`integrated-composition/src/common/layout-claim.ts:92`](Body/M/epi-theia/extensions/integrated-composition/src/common/layout-claim.ts) as `COSMIC_ENGINE_LAYOUT`. Current declaration names `m3-mahamaya` as centerStageOwner and `m1-paramasiva` as sidePanelOwner — a **pre-composition-pattern era** decision that the present architecture **supersedes**. Under composition-over-juxtaposition the named slots `center-stage` and `side-panel` are deprecated for this layout; the new layout descriptor names one composition-mount and three geometric-mount-points (§7).

### 2.2 The plugin widget host (the React shell)

**`PluginIntegrated123Widget`** at [`plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx:31-158`](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx).

Subscribes once to `bridge.onProfile` (line 66-70) and `bridge.onReadiness` (line 63-65). Single subscription source per Tranche 07.T1 "Tests prove only one bridge subscription source fans out to three (was: six) extensions". Currently renders `<CosmicEnginePanes>` (line 144-156) — the side-by-side widget. Composition-pattern landing replaces `<CosmicEnginePanes>` with `<CosmicEngineSurface>` (new component, §5 below) that hosts the K² renderer mount-point and overlays M2/M3 contributions onto it geometrically.

### 2.3 The current (deprecated) cosmic-engine panes

**`CosmicEnginePanes`** at [`plugin-integrated-1-2-3/src/browser/cosmic-engine-panes.tsx:101-172`](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-panes.tsx).

Renders three `<PaneShell>` blocks via flex (CSS class `cosmic-engine-layout`). **This is the juxtaposition pattern Tranche 15.4 explicitly forbids.** The file's "no-local-tables discipline" comment (lines 1-13) and the `readPayloadString` helper (lines 174-195) are valuable substrate (the read-only / no-fake-data discipline is exactly right); the layout discipline is wrong.

The file's anti-greenfield contribution to the new composition is the **field-reading discipline**: every value read directly from `profile.payload` via `readPayloadString`, never derived locally. The new `<CosmicEngineSurface>` inherits this discipline literally.

### 2.4 The profile-field availability checker

**`checkCosmicEnginePanes`** at [`integrated-composition/src/common/profile-field-checker.ts:107-124`](Body/M/epi-theia/extensions/integrated-composition/src/common/profile-field-checker.ts).

Declares per-pane field groups at lines 55-70: `M3_CENTER_FIELDS = [codon_rotation_projection, mahamaya, codec_lut]`, `M2_LEFT_FIELDS = [resonance72, planetaryChakral, kleinFlipState]`, `M1_RIGHT_FIELDS = [lens, mode, audio_octet, nodal_quartet]`. These field groups remain valid under composition-over-juxtaposition — the **fields each pole needs** doesn't change; only the **rendering geometry** does. The blocker-owner mapping at lines 41-53 also remains valid.

Under the new composition: instead of three pane-level "all fields present" checks gating three pane-level renders, there is **one composition-level "all critical fields present" check** that gates the K² base render, with per-pole overlay fields gating overlay layers individually. Missing M2 fields blank the cymatic texture but keep the K² visible; missing M3 fields blank the codon ring but keep the cymatic texture and K² visible. Graceful degradation, layer by layer.

### 2.5 The Vortex Modulae substrate (the +1 / M1-5 K² geometry)

The K² topology and its 12-position ring substrate lives in:

- [`Body/S/S0/epi-lib/include/m1.h:526-551`](Body/S/S0/epi-lib/include/m1.h) — `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`.
- [`Body/S/S0/epi-lib/include/m1.h:551-564`](Body/S/S0/epi-lib/include/m1.h) — `RING_QUATERNION_LUT[12]`: 12 unit quaternions at 30°/tick.
- [`Body/S/S0/epi-lib/include/m1.h:629-636`](Body/S/S0/epi-lib/include/m1.h) — `CL42_BASIS[6]`: Cl(4,2) per-position signature.
- [`Body/S/S0/epi-lib/include/m1.h:654-661`](Body/S/S0/epi-lib/include/m1.h) — `QL_TRIG_TABLE[6]`.
- [`Body/S/S0/epi-lib/include/m1.h:667-678`](Body/S/S0/epi-lib/include/m1.h) — `hopf_project`, `hopf_fiber`, `hopf_tick12`.
- [`Body/S/S0/epi-lib/src/m1.c:22-114`](Body/S/S0/epi-lib/src/m1.c) — the six 12×12 Ananda matrices (M1-2 vortex; rendered as K² texture parameterisation per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §5.2).
- [`Body/S/S0/epi-lib/src/m1.c:122-123`](Body/S/S0/epi-lib/src/m1.c) — `DR_RING_MAHAMAYA[6] = {1,2,4,8,7,5}` and `DR_RING_PARASHAKTI[6] = {3,6,9,3,6,9}`, the two DR rings.
- [`Body/S/S0/portal-core/src/hopf.rs:7-54`](Body/S/S0/portal-core/src/hopf.rs) — Rust-side Hopf projection used by the profile builder.

### 2.6 The 72 substrate (M2 cymatic surface)

The 72-axis projection is owned by `MathemeResonance72Projection` and produced into the profile at [`Body/S/S0/portal-core/src/kernel.rs:366`](Body/S/S0/portal-core/src/kernel.rs) (`pub resonance72: MathemeResonance72Projection`) and [`Body/S/S0/portal-core/src/kernel.rs:398`](Body/S/S0/portal-core/src/kernel.rs) (`MathemeResonance72Projection::from_tick(tick12, position)`).

Vimarsha-written audio bus for the cymatic frequency input lives at [`Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-93`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs) writing `audio_octet[8]` (8 sung frequencies, the cymatic source) and `nodal_quartet[4]` (4 nodal boundary conditions).

Planetary-chakral at [`Body/S/S0/portal-core/src/kernel.rs:370`](Body/S/S0/portal-core/src/kernel.rs) (`pub planetary_chakral: MathemePlanetaryChakralProjection`) and [`Body/S/S0/portal-core/src/kernel.rs:445`](Body/S/S0/portal-core/src/kernel.rs).

`klein_flip` field is **pending** at this writing — Tranche 02.2 / Tranche 10.X owns the closure. The composition currently reads it as `kleinFlipState` from the payload best-effort.

### 2.7 The 64 substrate (M3 codon ring)

The codon rotation projection lives at [`Body/S/S0/portal-core/src/kernel.rs:373`](Body/S/S0/portal-core/src/kernel.rs) (`pub codon_rotation_projection: CodonRotationProjection`) and is computed at [`Body/S/S0/portal-core/src/kernel.rs:407-409`](Body/S/S0/portal-core/src/kernel.rs) via `codon_rotation_from_lens_mode(lens_mode.lens, lens_mode.mode)`.

`q_cosmic` (codon charge quaternion) at [`Body/S/S0/portal-core/src/kernel.rs:374`](Body/S/S0/portal-core/src/kernel.rs) and `kernel.rs:410` (`codon_charge_quaternion(codon_rotation_projection.codon_id)`).

Mahāmāyā binary projection at [`Body/S/S0/portal-core/src/kernel.rs:372`](Body/S/S0/portal-core/src/kernel.rs) (`pub mahamaya: MathemeBinaryProjection`).

The 64-codon LUT (per M3'-SPEC) lives in `portal-core/src/codon.rs` and `codon_rotation_projection.rs` (presence confirmed via the kernel.rs use). The integrated plugin **never** indexes this LUT — it consumes the projection field.

### 2.8 The kernel-bridge (single profile fan-out)

**`KernelBridgeAPI`** at [`kernel-bridge/src/common/types.ts:91-103`](Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts) (`KernelBridgeRuntimeEvent`) and runtime contract at [`Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs) (per M-spec authority).

The bridge fan-out shape:

```
Body/S/S0/portal-core::MathemeHarmonicProfile (canonical source)
  → kernel-bridge runtime (gateway)
  → SharedBridgeAdapter (Theia DI)
  → PluginIntegrated123Widget.bridge.onProfile (one subscription)
  → CompositionCoordinator + CosmicEngineSurface (downstream consumers)
    → M1 played-torus renderer (M1 fields)
    → M2 cymatic-texture renderer (M2 fields)
    → M3 codon-ring renderer (M3 fields)
```

**One subscription. Three poles.** The 07.T1 verification rule: "Tests prove only one bridge subscription source fans out to (three) extensions." Per [`plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx:62-70`](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx) this is already correctly implemented.

### 2.9 The M1 played-torus extension (the +1 renderer)

**`m1-paramasiva-played-torus`** at [`Body/M/epi-theia/extensions/m1-paramasiva-played-torus/`](Body/M/epi-theia/extensions/m1-paramasiva-played-torus/). Currently contains `ARCHITECTURE.md` and `README.md` only — DR-M1-2 ratified, build pending (Tranche 02.6). When built, this extension owns the K² Bevy/wgpu mesh and is the renderer the integrated 1-2-3 plugin embeds as its base layer. Architecture mirror at [`Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md`](Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md); canonical authority at [[M1-2-ANANDA-VORTEX-ARCHITECTURE]].

### 2.10 The M2 and M3 extensions (the 72 and 64 renderers)

**`m2-parashakti`** at [`Body/M/epi-theia/extensions/m2-parashakti/`](Body/M/epi-theia/extensions/m2-parashakti/) — owns cymatic surface rendering. Architecture authority [[M2-ARCHITECTURE]].

**`m3-mahamaya`** at [`Body/M/epi-theia/extensions/m3-mahamaya/`](Body/M/epi-theia/extensions/m3-mahamaya/) — owns codon-rotation wheel rendering. Architecture authority [[M3-ARCHITECTURE]].

Under composition-over-juxtaposition, both extensions **export a compositionMount** — a React/wgpu handle the integrated plugin embeds into a geometrically-defined region of the K² surface, not a standalone widget the integrated plugin places side-by-side with the M1 widget. The compositionMount contract is the §7.3 boundary contract.

---

## 3. Dataset Map

### 3.1 Canonical M1-5 / K² geometry datasets

- **Vortex Modulae CSV**: `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv` — the source of the six Ananda matrix families that texture-parameterise K², with explicit "No digi-rooting" raw affine blocks and matching "Digi-rooting" recursive blocks ([[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §3.1).
- **Paramasiva-deep narrative corpus**: `Idea/Bimba/Map/datasets/paramasiva-deep/` — `Paramasiva's 4 - deeper reflections.md`, `13-03-2026-gemini-paramasiva-maths.md`, `Spanda_Genesis_100_Percent.md`. Cited and indexed in [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §3.2.
- **Bimba-graph relations**: `Idea/Bimba/Map/datasets/low-detail/nodes_paramasiva.json`, `relations_paramasiva.json`, and `paramasiva-deep/relations.json` — relation surface the M1 pole consumes via S2.

### 3.2 Canonical M2 / 72-axis datasets

- **Parashakti-deep corpus**: `Idea/Bimba/Map/datasets/parashakti-deep/` — the canonical narrative source for the six addressing-axes of the 72 (`tattva · decan · Shem · maqam · MEF×QL · DET-projection`). Owns the per-axis names, glyphs, and frequencies.
- **72-axis tabular data**: typically `Idea/Bimba/Map/datasets/parashakti-deep/72-shem.csv`, `72-maqam.csv`, `72-decan.csv` (per M2'-SPEC §3); the integrated plugin reads these via the `resonance72` projection, never directly.
- **Planetary-chakral LUT**: `Idea/Bimba/Map/datasets/parashakti-deep/planetary-chakral.csv` (per M2'-SPEC); consumed via `planetary_chakral` projection field.

### 3.3 Canonical M3 / 64-cell datasets

- **m3-prime corpus**: `Idea/Bimba/Map/datasets/m3-prime-*` — the canonical narrative source for the 64 codon/hexagram/tarot correspondence and the 9:8 epogdoon compression M2→M3.
- **M3 theoretical alignment working paper**: `Idea/Bimba/Seeds/M/M3'/full_theoretical_alignments_ql_physics.md` — register-disciplined warrant for displaying `137 = 64+72+1 = 64+2(36)+1 = 128+8+1`, `0,4,2,2,9`, Standard Model coupling-flow labels, and measured low-energy face labels without collapsing them into a QL-derived physics calculation.
- **Codon LUT**: typically `Idea/Bimba/Map/datasets/m3-prime-codons.csv` — 64 codons with hexagram, tarot, T/U-phase attribution. Compiled into `portal-core/src/codon.rs` (`.rodata`); the integrated plugin reads via `codon_rotation_projection`.
- **Tarot mapping**: `Idea/Bimba/Map/datasets/m3-prime-tarot.csv` — major arcana to lens-mode mapping.

### 3.4 The composition does not have its own dataset

This is load-bearing. **There is no `integrated-1-2-3-*` dataset.** The integrated plugin owns no canonical data — it is purely a composition surface. Every datum in every visual layer originates in the M1, M2, or M3 canonical sources, surfaces through `MathemeHarmonicProfile`, and is rendered by the corresponding pole. The integrated plugin's contribution to data is **exactly zero**.

The discipline enforced by [`cosmic-engine-panes.tsx:1-13`](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-panes.tsx) ("MUST NOT contain any local codon, tarot, planetary, pitch, audio, harmonic ratio, or correspondence table") **stays binding** under the new composition. Test `cosmic-engine-no-local-tables.test.mjs` continues to gate every file in the plugin source tree.

---

## 4. Profile-Bus Contract

### 4.1 What `MathemeHarmonicProfile` already exposes for the cosmic engine

At [`Body/S/S0/portal-core/src/kernel.rs:344-387`](Body/S/S0/portal-core/src/kernel.rs):

| Field | Type | Cosmic-engine role |
|---|---|---|
| `tick12: u8` | u8 | The shared clock advancing all three poles |
| `degree720: u16` | u16 | Hopf total-space angle for M1 ring quaternion slerp |
| `degree360: u16` | u16 | Hopf base-space angle for M2 cymatic phase |
| `position6: u8` | u8 | The matrix-op index for M1-2 vortex; cl42 position for M1 |
| `helix: String` | String | bimba/pratibimba flag for M1 + M2 valence |
| `lens_mode: MathemeLensMode` | struct | 84-state cell driving M1 landscape, M2 cymatic frequency, M3 codon lookup |
| `resonance72: MathemeResonance72Projection` | struct | The 72-axis state for M2 cymatic texture |
| `audio_octet: [f32; 8]` | array | Vimarsha-written cymatic frequencies for M2 + M1 emitters |
| `nodal_quartet: [MathemeNodalConstraint; 4]` | array | Vimarsha-written cymatic boundary conditions |
| `q_cosmic: [f32; 4]` | array | Codon charge quaternion for M3 codon-rotation |
| `codon_rotation_projection: CodonRotationProjection` | struct | The 64-cell active-codon state for M3 wheel |
| `mahamaya: MathemeBinaryProjection` | struct | The Mahāmāyā binary projection (T/U phase) for M3 |
| `coupling_flow_alignment?: CouplingFlowAlignment` | optional struct | M3-owned inspector overlay for symbolic skeleton / physics descent / measurement face / recognition context; source-warrant UI only |
| `binary: MathemeBinaryProjection` | struct | The binary clock projection (helix-stripe phase) |
| `planetary_chakral: MathemePlanetaryChakralProjection` | struct | M2 planetary-chakral halo data |
| `conjugate_form_character: ConjugateFormCharacter` | struct | M1 conjugate-form (rāga ↔ tāla relation) per mode |
| `phase: KernelPhase` | enum | Kernel tick phase for sync verification |

This is the **complete cosmic-engine read surface**. The composition needs nothing else for its base render — every visual datum in §5 is a window onto one of these fields. Anti-greenfield wholly satisfied at base.

### 4.2 What the profile-bus is missing for full composition

Three gaps:

#### 4.2.1 `ananda_vortex` — M1-2 vortex matrix state (Tranche 10.10)

Already declared as a pending tranche by [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §4.3. Required so the M1 played-torus can render the active Ananda matrix family as the K² texture without reconstructing matrix state from raw coordinates. The cosmic engine consumes it via M1's pole.

Corrected composition requirement: `ananda_vortex` must carry an `active_cell_value: AnandaVortexCell` with both raw/no-digi-root and digit-root faces. This is what lets the integrated surface show the raw vortex skeleton (`7X+1` hits `36/64`, `8X+0` hits `64/72`, and the parent marker gives `64+72+1=137`) while the operational heatmap remains driven by the digit-root face. The integrated plugin must not compute those values locally; it only renders profile-provided skeleton events and values.

#### 4.2.2 `klein_flip` — boundary-quantised flip event (Tranche 02.2 / Tranche 10.X)

Per Wave A M1 matrix Row 7 (CODE-PENDING). The integrated plugin's tick choreography (§6) needs this event to fire **synchronously across all three poles**: M1 visually folds K² through itself, M2 inverts the cymatic valence (helix-stripe colour reflection), M3 may or may not re-rotate the codon ring (decision below). Without a typed `klein_flip` field the composition has to detect the boundary from `tick12 == 5 || tick12 == 11` locally — which forks logic across renderers.

Proposed field, mirroring the Ananda-vortex projection's `klein_flip_at_this_tick` boolean:

```rust
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicKleinFlip {
    /// True on the exact tick where the flip fires.
    pub at_this_tick: bool,
    /// The from-lens index (Lens N).
    pub from_lens: u8,
    /// The to-lens index (Lens N+3 mod 12).
    pub to_lens: u8,
    /// Discriminator for the kind of crossing.
    pub kind: KleinFlipKind,
}

#[repr(u8)]
pub enum KleinFlipKind {
    /// tick 5 → 6, helix 0 → 1 (bimba → pratibimba)
    BimbaToPratibimba = 0,
    /// tick 11 → 0, helix 1 → 0 (möbius return)
    MobiusReturn = 1,
}

// Added to MathemeHarmonicProfile:
//   #[serde(default)]
//   pub klein_flip: Option<CosmicKleinFlip>,
```

The composition reads `klein_flip` once per tick and dispatches the boundary-quantised render path to all three poles atomically.

#### 4.2.3 `cosmic_composition_state` — the composition's own readiness projection

The composition needs a **typed projection of its own readiness** — what M1 fields are present, what M2 fields are present, what M3 fields are present, and what overall layer-degradation level the K² render is operating at. This belongs on the profile-bus rather than as widget-local state because the OmniPanel Diagnostics tab needs to inspect it without subscribing to the widget directly.

Proposed surface — a Rust struct sketch in the style of the AnandaVortexProjection:

```rust
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CosmicCompositionState {
    /// Which poles' field groups are fully present at this generation.
    pub m1_layer_ready: bool,
    pub m2_layer_ready: bool,
    pub m3_layer_ready: bool,
    /// Per-pole missing-field list, surfaced for inline readiness rendering.
    pub m1_missing_fields: Vec<String>,
    pub m2_missing_fields: Vec<String>,
    pub m3_missing_fields: Vec<String>,
    /// Composition-level degradation level:
    ///   "ready_full"           — all three poles ready
    ///   "ready_base_only"      — M1 ready, M2/M3 not (K² visible, plain)
    ///   "ready_no_codon"       — M1 + M2 ready, M3 missing (no codon ring)
    ///   "ready_no_cymatic"     — M1 + M3 ready, M2 missing (no texture)
    ///   "blocked_base_missing" — M1 missing (no K² render at all)
    pub degradation_level: String,
}

// Added to MathemeHarmonicProfile (optional, populated by kernel-bridge runtime):
//   #[serde(default, skip_serializing_if = "Option::is_none")]
//   pub cosmic_composition_state: Option<CosmicCompositionState>,
```

This projection is **computable from the existing profile fields** — the kernel-bridge runtime can populate it during the same construction step that produces `MathemeHarmonicProfile::from_tick`. No new substrate data required.

### 4.3 The single-subscription discipline

The composition consumes the profile via **exactly one** `bridge.onProfile` subscription. No M-extension subscribes independently when running under the integrated plugin — the integrated widget host fan-outs the profile to its three pole-renderers via React props / wgpu uniforms. The 07.T1 verification (one subscription, three contributors) is the contract. Widget code at `plugin-integrated-1-2-3-widget.tsx:62-70` already correctly implements this.

---

## 5. Visual Rendering Contract

### 5.1 The composition surface and the three render layers

The integrated 1-2-3 widget renders **one canvas** containing **one K² torus** with **three render layers** stratified in z-order:

| Layer | Renderer | Owns | Profile fields |
|---|---|---|---|
| **L0 — Base geometry (M1)** | `m1-paramasiva-played-torus` Bevy/wgpu | The K² mesh, SO(3) ring precession, Hopf shadow torus, diamond at centre, ring-quaternion orientation, dual-register Ananda proof overlay | `tick12`, `degree720`, `position6`, `helix`, `lens_mode`, `ananda_vortex`, `q_cosmic`, `audio_octet`, `nodal_quartet` |
| **L1 — Cymatic surface texture (M2)** | M2 cymatic shader bound to K² UV | Chladni patterns from `audio_octet` standing waves; 72-axis colour-shells per lens-region; planetary-chakral halo on lens-ring sectors | `resonance72`, `planetary_chakral`, `audio_octet`, `lens_mode`, `klein_flip` |
| **L2 — Codon annulus (M3)** | M3 codon-ring renderer mounted on lens-ring equator | 64 codon cells around K²'s major equator; active-codon highlighted; tarot/I-Ching glyphs; T/U binary phase indicator | `codon_rotation_projection`, `mahamaya`, `binary`, `lens_mode` |

**The three layers compose as one frame.** L0 is the surface (the canvas of being); L1 is what L0 *looks like* (its texture, painted onto its skin); L2 is what circumscribes it (the codon ring around its equator). You cannot render L1 without L0; you cannot render L2 without L0; L1 and L2 are independent of each other and degrade gracefully.

### 5.2 The K² base — M1 contribution (re-stated for composition)

Per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §5.1, K² is a Bevy `Mesh3d` with:

- Major radius `R` along chromatic-longitude (12-stack of 9/8 epogdoon ticks).
- Minor radius `r` along fifths-meridian (3/2 leaps).
- Aspect `R/r = 9/8`.
- Klein identification via `helix_sheet ∈ {0, 1}` from `ananda_vortex.helix_sheet`.

In the integrated composition, the K² mesh is rendered **once**, by the M1 extension, with **two extra UV channels** exposed to L1 (M2 cymatic shader):

- `uv_chromatic ∈ [0, 1]` — chromatic-longitude angle / 2π
- `uv_fifths ∈ [0, 1]` — fifths-meridian angle / 2π

The M2 cymatic shader reads `(uv_chromatic, uv_fifths)` at each fragment, computes the standing-wave amplitude from `audio_octet[0..8]`, and outputs a Chladni-pattern colour modulation. The shader is a fragment-shader plugin into the K² material — not a separate mesh.

### 5.3 The cymatic texture — M2 contribution

Substrate read:

- `audio_octet[0..8]` provides 8 standing-wave frequencies. Per [`Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-93`](Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs) these are Vimarsha-written reads, never re-derived in the renderer.
- `nodal_quartet[0..4]` provides 4 nodal boundary conditions modulating the standing-wave at four specific points on the lens-ring.
- `resonance72.lens_anchor_index` provides the current lens-anchor index for tinting the cymatic colour-shell.
- `planetary_chakral` provides per-lens-region halo data.

Cymatic shader pseudocode:

```glsl
// Per K² fragment:
fragment_color = base_K2_color;
amplitude = 0.0;
for i in 0..8:
    omega = audio_octet[i] * 2*PI;
    amplitude += sin(omega * uv_chromatic + phase_offset[i]) *
                 sin(omega * uv_fifths + phase_offset[i]);
amplitude *= nodal_boundary_envelope(uv_chromatic, uv_fifths, nodal_quartet);
colour_shell = lens_anchor_colour(resonance72.lens_anchor_index);
chakral_halo = planetary_chakral_at(lens_mode.lens, uv_fifths);
fragment_color = mix(base_K2_color, colour_shell, amplitude) + chakral_halo;
```

The amplitude pattern is the **literal Chladni vibrational pattern** the audio bus is producing — visualised on the surface that is producing it. The cymatic surface is what K² **sounds like** painted onto K² itself.

### 5.4 The codon annulus — M3 contribution

Substrate read:

- `codon_rotation_projection.codon_id ∈ [0, 63]` — the active codon at this tick.
- `codon_rotation_projection.tarot` (major + minor) — the tarot card glyph for the active codon.
- `codon_rotation_projection.hexagram` — the I-Ching trigram pair for the active codon.
- `mahamaya.t_phase`, `mahamaya.u_phase` — the binary T/U phase for the codon's T/U dial.
- `binary.helix_stripe_value` — the helix-stripe phase used to colour-cue the active codon.

The codon annulus is a **64-cell ring** mounted on K²'s equator (the chromatic-longitude circle at the fifths-meridian midline). Each cell is an angular sector of size `2π/64`. The cells are positioned by `codon_id`:

- Cell `n` sits at angle `n * 2π/64` on the equator.
- Each cell carries the tarot-major glyph as its primary marker and the I-Ching trigram as a secondary marker.
- The active codon cell is **illuminated** at full brightness; other cells are at ambient ~15%.
- The T/U phase is rendered as a small dial in the cell's centre.
- The active codon cell projects a **vertical light beam** through the K² volume — this is what makes the codon visually "land" on the surface.

When the codon advances (`codon_id` changes), the active illumination **arc-sweeps** from the previous cell to the new cell — a single animated highlight tracing the equator, not a teleport. The arc-sweep is the M3 pole's contribution to tick choreography (§6).

### 5.5 The 137-as-one-visual-signature

The three layers together compose a single signature:

- One K² surface (the +1).
- 72 colour-shell regions painted on its skin (the 72).
- 64 codon cells around its equator (the 64).

Looking at the composition, the user sees **all three counts** at once — the matheme is **literally inscribed in the visual field**. The composition is not three widgets that "represent" 137; it is **the geometric event of 137 happening on one surface**.

When the coupling-flow overlay is enabled, this same signature gains register labels:

- `symbolic_skeleton`: `137 = 64+72+1`, `137 = 64+2(36)+1`, `137 = 128+8+1`
- `physics_reference`: `G_SM -> D_mu -> (g3,g2,gY) -> RG -> EW breaking -> alpha_EM(mu)` plus QCD `8+1`
- `measurement_face`: `alpha_EM(0)^-1 ~= 137.036`, `alpha_EM(M_Z)^-1 ~= 128`
- `recognition_context`: Nara/Epii handoff state when the active packet-chain is being read personally or reviewed canonically

The overlay never changes the geometry. There is still one K², one 72 texture, one 64 annulus, and one +1 centre. The overlay names which register is speaking.

### 5.6 Degradation behaviour (per readiness layer)

| Composition state | What renders |
|---|---|
| `ready_full` | K² + cymatic texture + codon annulus all active |
| `ready_no_cymatic` (M2 fields missing) | K² visible with plain matte material; codon annulus still active; an inline `pending-cymatic` badge on the corner of the K² with "owner: m2-parashakti / Track 01 profile" |
| `ready_no_codon` (M3 fields missing) | K² + cymatic texture both visible; codon annulus replaced by an ambient ring with `pending-codon` overlay |
| `ready_base_only` (M2 + M3 fields missing) | K² mesh visible with plain matte; both badges on; the user sees the topology and nothing else |
| `blocked_base_missing` (M1 fields missing) | Blocked overlay — "Cosmic engine cannot render: M1 fields missing. Owner: m1-paramasiva / Track 01 profile." No partial render. |

This is the **layer-by-layer graceful degradation** the existing `cosmic-engine-panes.tsx` pane-blocker pattern (lines 64-82) instantiated for three side-by-side panes. The composition pattern translates the same discipline to three stratified layers.

### 5.7 Diamond at centre — the still-point

Per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §5.6, the small octahedron at K²'s centre is the matheme's still-point. In the cosmic-engine composition it stays still while K² precesses, while the cymatic patterns ripple, while the codon arc-sweeps. It is the visible proof that the composition has a fixed point — that the 137 has a centre.

The diamond's vertices reflect Cl(4,2) signatures (per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]]). In the composition view, the diamond also **emits a vertical light column** that passes through the centre of the active codon cell (M3 pole). This column is the **geometric link between centre and circumference** — the literal axis the codon ring rotates around.

---

## 6. Tick Choreography

### 6.1 The single animation primitive

Per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.1, the load-bearing tick primitive is **`quat_slerp` of K² orientation through `RING_QUATERNION_LUT[12]`**. The composition **does not introduce a second clock**.

Every other animated element across the three layers derives from or rides on the slerp:

```rust
on tick_advance(t, t+1, dt):
    // L0 — M1 owns this primitive
    let q_from = profile.ananda_vortex.ring_quaternion;
    let q_to = next_ring_quaternion;
    K².orientation = quat_slerp(q_from, q_to, dt / TICK_PERIOD);
    K².helix_sheet = profile.ananda_vortex.helix_sheet;

    // L1 — M2 cymatic phase advances with degree360
    cymatic.phase = (profile.degree360 as f32) * 2.0 * PI / 360.0;
    cymatic.lens_colour = lens_anchor_colour(profile.resonance72.lens_anchor_index);

    // L2 — M3 codon arc-sweep
    if codon_changed_this_tick {
        codon_ring.arc_sweep(previous_codon, profile.codon_rotation_projection.codon_id, dt);
    }

    // Boundary-quantised: Klein flip
    if profile.klein_flip.map_or(false, |k| k.at_this_tick) {
        K².klein_fold_animation();
        cymatic.invert_valence();
        codon_ring.may_re_orient();  // see §6.5 decision
    }
```

### 6.2 What advances simultaneously on tick advance

| Layer | Element | Cadence | Source field |
|---|---|---|---|
| L0 | K² orientation | Every frame (slerp interpolated) | `ring_quaternion` (next via LUT) |
| L0 | Active Ananda matrix | Tick-quantised | `ananda_vortex.active_matrix_op` |
| L0 | Luminous Ananda cell | Tick-quantised (with 200ms exp decay); DR face primary, raw face in proof overlay | `ananda_vortex.active_cell` + `ananda_vortex.active_cell_value` |
| L0 | DR streamlines (gold + emerald) | Tick-quantised | `ananda_vortex.dr_ring_phase` |
| L0 | Cl(4,2) halo | Tick-quantised | `ananda_vortex.cl42_signature_at_position` |
| L0 | Audio_octet emitters | Every frame (frequency-driven shimmer) | `audio_octet` (Vimarsha-written) |
| L0 | Nodal_quartet satellites | Every frame | `nodal_quartet` (Vimarsha-written) |
| L0 | Hopf shadow torus | Every frame (phase-shifted from L0) | `helix` + `degree720` |
| L1 | Cymatic standing-wave amplitude | Every frame | `audio_octet` + `degree360` |
| L1 | 72-axis colour-shell | Tick-quantised | `resonance72.lens_anchor_index` |
| L1 | Planetary-chakral halo | Lens-anchored | `planetary_chakral` + `lens_mode.lens` |
| L2 | Active codon illumination | Tick-quantised | `codon_rotation_projection.codon_id` |
| L2 | Codon arc-sweep | On codon change | `codon_rotation_projection.codon_id` delta |
| L2 | T/U phase dial | Tick-quantised | `mahamaya.t_phase`, `mahamaya.u_phase` |
| Diamond | Centre precession | Slow continuous | `degree720 / 12` |
| Diamond | Vertical light column | Tracks active codon | `codon_rotation_projection.codon_id` |

### 6.3 What stays still on tick advance

- **Diamond at centre** — only slow precession; never per-tick jump.
- **K² mesh texture UV mapping** — only orientation rotates; the chromatic/fifths grid never swims across the surface.
- **Cl(4,2) basis legend** — static glyph-strip at viewport bottom; current `position6` highlighted.
- **64-codon ring spatial layout** — the cells stay at their fixed angular positions; only the illumination moves.
- **The 72 colour-shell regions** — the regions themselves never swim; only their colour/tint modulates.

The "what stays still vs what moves" discipline ([[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §6.3-6.4) **scales up to three layers**: the substrate of each layer (mesh, ring positions, lens regions) is static; the **state** of each layer (orientation, illumination, colour) is what advances.

### 6.4 Where the eye goes per tick

- **Default focus:** the luminous Ananda cell on K² (jumping cell-to-cell along matrix diagonals, M1's primary motion).
- **Peripheral cosmic motion:** SO(3) precession of K² (gentle tumble) + cymatic standing-wave ripple (subtle frequency pattern).
- **Bright equatorial cue:** the active codon illumination — the brightest single point in the L2 layer, visible without breaking focus on L0.
- **On codon change:** the arc-sweep momentarily takes the eye to the new codon, then returns to L0.
- **On Klein flip:** the entire surface folds through itself — the eye is taken to **the whole surface at once** for ~200ms.

### 6.5 Klein-flip choreography across the three layers (decision point)

The Klein flip fires at `tick12 == 5` (bimba → pratibimba) and at `tick12 == 11` (möbius return). Per Tranche 02.2 and 15.9 the event is broadcast via the profile bus. All three poles **must subscribe to it for cross-layer atomicity**:

| Layer | Klein-flip choreography (5 → 6) | Klein-flip choreography (11 → 0) |
|---|---|---|
| **L0 (M1)** | K² folds through itself for ~200ms; helix sheet flips 0→1; Ananda matrix re-reads with `+1` axiom offset; Mahāmāyā streamline retreats; Paraśakti streamline activates | K² completes 720°; helix returns 0; full-surface bloom in lens-anchor colour; diamond emits identity pulse |
| **L1 (M2)** | Cymatic valence inverts — peaks become troughs, colour-shell hue cycles to its complement; cymatic shimmer momentarily silver | Cymatic valence returns; colour-shell saturates back; the Möbius-return bloom from L0 colours the cymatic momentarily |
| **L2 (M3) — DECISION** | The 64-codon ring **does not re-orient** spatially (the codons stay at their fixed angular positions); the active codon illumination **stays on its current cell**; the T/U phase indicator at the active codon **briefly flickers** to signal the flip | Same as 5→6 for the ring; the active codon illumination may **arc-sweep one extra cell** if the codon advances on this tick |

**Recommended decision (DR-IG-3 candidate):** M3 codon ring is **subscribed to klein_flip** but reacts **minimally** — it does not rotate, swap, or re-shuffle. The reasoning: the 64-codon LUT is **not Klein-symmetric** the way the 12-position ring is. A Klein flip is an M1-M2 event (the helix-stripe inversion). M3's codon-ring is a downstream projection of the same lens-mode; the flip's effect on M3 is mediated through `lens_mode.lens` advancing — which it does naturally at every tick. The minimal flicker affordance is the **acknowledgement** that the codon's substrate has flipped; nothing more.

This decision differs from the M2 case (M2 cymatic surface fully inverts valence) because M2 lives **directly on K²'s skin** while M3 lives **as an annular adornment around K²**. Surface texture and annular adornment have different topological relationships to the Klein operation.

### 6.6 Layer-cadence summary

| Layer | Render cadence |
|---|---|
| K² mesh + orientation, diamond, Cl(4,2) legend, audio-octet emitters, cymatic standing-wave shader | Every frame |
| Active Ananda matrix, luminous cell, DR streamlines, Cl(4,2) halo, active codon illumination, T/U phase | Tick-quantised |
| Klein-flip K² fold, cymatic valence inversion, M3 codon flicker, Möbius-return bloom | Boundary-quantised (5→6, 11→0) |
| 72 colour-shell hue retune, planetary-chakral halo, codon arc-sweep | Lens-anchored (only on `lens_mode.lens` change or codon delta) |

### 6.7 Determinism + scrubbability

The composition is **deterministic under `(tick12, degree720, lens_mode, codon_id, ananda_vortex.active_matrix_op)`** — given those five values, the visual frame reproduces identically. The acceptance harness `acceptance-harness/tests/topology.test.mjs` (per Tranche 15.7) and the visual-regression suite (Tranche 15.12) verify this.

Scrubbing (pause + `scrub_to_tick(t)`) is supported because the slerp is the only animation primitive — every other element is a function of profile state at the scrubbed tick. The single-primitive discipline (§6.1) is what makes scrubbing tractable.

---

## 7. Boundary Contracts

### 7.1 Composition-over-juxtaposition (the binding internal contract)

Per [`15-ui-design-foundations.md:21`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md) and Tranche 15.4 the integrated 1-2-3 plugin **MUST NOT** render three side-by-side widgets. The composition pattern test asserts:

> Integrated plugins compose three M-extensions into one editor surface, never three side-by-side panes. Geometric composition (cosmic 1-2-3 over the K² torus; personal 4-5-0 over the psychoid field) is normative.

Practical contract for the integrated 1-2-3 plugin:

1. **Single rendering canvas** — one `<canvas>` (the wgpu surface) hosting all three layers, not three React panels in a flex container.
2. **Three pole-renderers, three mount-points** — M1, M2, M3 extensions each expose a `compositionMount` (see §7.3). The integrated plugin calls into these mounts; the extensions do not render their own widgets when the integrated plugin is active.
3. **Side-by-side render is a load-time error** — `composition-pattern-contract.test.mjs` asserts the cosmic-engine widget tree contains **at most one direct rendering child** beneath `<CosmicEngineSurface>`; multiple `<PaneShell>`-style siblings fail the test.

The migration from the current `CosmicEnginePanes` to the new `CosmicEngineSurface` is the **central deliverable** of Cycle-3 Tranche 07 + 15.4.

### 7.2 Single-profile-subscription contract (the cross-pole atomicity)

Per Cycle-2 Track 07.T1: "Tests prove only one bridge subscription source fans out to (three) extensions." The integrated widget host owns the single `bridge.onProfile` subscription. Each pole-renderer receives profile state via React prop / wgpu uniform / shader binding, never via its own subscription. This ensures:

- All three layers see the **same generation** of profile state at every frame.
- A Klein-flip event fires on **all three layers atomically**.
- A pole-renderer cannot drift one tick ahead or behind another.

### 7.3 The compositionMount contract (the M-extension export shape)

**Each composed M-extension exports a `compositionMount` symbol** with the shape:

```typescript
export interface CosmicEngineCompositionMount {
    /** Which layer this mount renders. */
    readonly layer: 'L0-base' | 'L1-cymatic' | 'L2-codon';
    /** The required profile fields. Composition checks before mounting. */
    readonly requiredProfileFields: readonly string[];
    /** Render entrypoint — called by the integrated widget host with current profile + the K² geometry handle. */
    readonly render: (ctx: CosmicEngineRenderContext) => void;
    /** Tick-advance hook — called once per tick with the new profile. */
    readonly onTickAdvance: (ctx: CosmicEngineRenderContext, dt: number) => void;
    /** Klein-flip event subscription — called when klein_flip.at_this_tick === true. */
    readonly onKleinFlip: (ctx: CosmicEngineRenderContext, kind: 'BimbaToPratibimba' | 'MobiusReturn') => void;
    /** Readiness reporter — used by composition for inline degradation. */
    readonly checkReadiness: (profile: MathemeHarmonicProfileBoundary) => CompositionLayerReadiness;
}

export interface CosmicEngineRenderContext {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly k2Surface: K2SurfaceHandle;  // opaque wgpu handle owned by M1
    readonly viewport: ViewportInfo;
}
```

`K2SurfaceHandle` is owned by `m1-paramasiva-played-torus` and shared via DI. M2's compositionMount receives it and binds its cymatic shader to the surface material. M3's compositionMount receives it and mounts the codon ring on the equator.

When the M-extension is loaded **standalone** (in `ide-deep` for example), its compositionMount is **not** activated — the extension's own widget renders instead. The compositionMount is only addressed when the integrated 1-2-3 plugin is the active layout.

### 7.4 Boundaries to other integrated plugins

The integrated 1-2-3 (cosmic) and integrated 4-5-0 (personal) are **two sides of the same daily**. Their boundary contract:

| Contract | Direction | Detail |
|---|---|---|
| **Shared session** | both ↔ both | `sessionKey`, `coordinate`, `dayNow` survive the 0/1 toggle |
| **Shared profile generation** | cosmic → personal | `profileGeneration` on entry from cosmic is the starting generation on personal (they share the kernel-bridge) |
| **Shared lens_mode** | cosmic → personal | Active lens persists across; `lens_mode.lens` does not reset |
| **Klein-flip pass-through** | cosmic → personal | A Klein-flip on the cosmic side fires `q_personal` resonance recompute on the personal side via shared profile |
| **Composition-pattern parity** | both | Both sides honour composition-over-juxtaposition: personal renders M4 + M5 + M3-projected-to-personal as one psychoid-field surface, NOT three panes |

Cross-reference: [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]].

### 7.5 Boundaries to the standalone M-extensions

The integrated 1-2-3 plugin **composes** M1, M2, M3. It does **not duplicate** their canon. When opened in `ide-deep`, each of M1, M2, M3 renders its **own** widget (`m1-paramasiva.clockInstrument`, `m2-parashakti` cymatic engine view, `m3-mahamaya` wheel view). The integrated plugin is the cosmic-side `daily-0-1` editor-area; the standalone extensions are the `ide-deep` editor-area.

| Surface | Cosmic-side daily | ide-deep |
|---|---|---|
| Active | Integrated 1-2-3 plugin (composition) | Single Mn extension widget (one pole at a time) |
| Editor area | One `<CosmicEngineSurface>` with three layers | One Mn widget |
| Per-pole compositionMount | ACTIVE | INACTIVE (extension's own widget instead) |
| Per-pole standalone widget | INACTIVE | ACTIVE |

The toggle between these two states is the `daily-0-1` ↔ `ide-deep` layout switch (DR-TS-1 ratified per [`15-ui-design-foundations.md`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md)).

### 7.6 Vimarsha-window contract (cross-pole audio law)

Per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §7.1, the cosmic-engine composition consumes `audio_octet[8]` and `nodal_quartet[4]` as **windows onto M2-1' Vimarsha's writes**, never locally re-derived. In the composition:

- M1 reads `audio_octet` for its 8 particle emitters (around the diamond).
- M2 reads `audio_octet` for its cymatic standing-wave amplitude calculation.
- M3 does not read `audio_octet` directly (codon-ring is not audio-driven).

This is the **central M1↔M2 audio contract** at composition scale: both poles read the same Vimarsha-write at the same generation. They cannot drift.

### 7.7 Anti-overlap with adjacent M-surfaces

The integrated 1-2-3 plugin **MUST NOT**:

- Render M0' coordinate-source content (M0 boundary; OmniPanel or left-sidebar).
- Render M4 personal-quaternion derived content (M4 boundary; personal-side composition).
- Render M5 atelier / governance content (M5 boundary; OmniPanel Review tab).
- Render the `K² × T²_Mahāmāyā` double-torus (M3-5 boundary per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §7.2).
- Render any S-stack service surface (S boundary; service shells, not M surfaces).

### 7.8 Forbidden overlaps

- **No third clock** — the kernel-bridge profile-tick is the only clock (Tranche 15.6); no animation-frame-count fallback, no widget-local interval.
- **No local pitch synthesis** — all frequencies are Vimarsha-written (Tranche 02 audio law).
- **No local codon/72/tarot LUT** — every datum read from `profile.payload`, never from a forked TS/wgsl table (`cosmic-engine-no-local-tables.test.mjs`).
- **No graph relation inference** — relation-walks consume S2 typed pointer descriptors via the bridge, never inferred locally.
- **No private/journal content** — privacy class is `public_current`; protected-local is the 4-5-0 side's concern.

---

## 8. IDE Integration

### 8.1 Extension placement

- **The integrated plugin extension:** `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/` (landed; Cycle-2 scaffold).
- **The composition library:** `Body/M/epi-theia/extensions/integrated-composition/` (landed; cross-plugin substrate).
- **The kernel-bridge:** `Body/M/epi-theia/extensions/kernel-bridge/` (landed; single profile fan-out).
- **The M-extensions composed:** `m1-paramasiva-played-torus/` (DR-M1-2 ratified, build pending under Tranche 02.6), `m1-paramasiva/` (landed, 2D companion), `m2-parashakti/` (landed), `m3-mahamaya/` (landed).
- **Architecture mirror:** `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/ARCHITECTURE.md` (this file's IDE-mirror; addition delta below).

### 8.2 Surface placement — cosmic-side daily-0-1

Per [`15-ui-design-foundations.md:31-36`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md):

- **Editor area** (cosmic-side): the integrated 1-2-3 composition — the `<CosmicEngineSurface>` widget hosting the played K² torus with cymatic surface and codon annulus, one composition driven by the profile tick.
- **Left sidebar (activity-bar):** Coordinate Tree · Bimba Graph Viewer (one-substrate/three-rendering, solar anchor) · Canon Studio.
- **Right sidebar:** OmniPanel (consistent across layouts) — Pi conversation, Sessions, Dispatch Trace, Tool Stream, Evidence, Review, Gateway, Diagnostics.
- **Bottom:** profile-tick status, readiness ledger summary, day-now anchor at `Idea/Empty/Present/{day_id}/`.

### 8.3 Surface placement — ide-deep

When the user switches from `daily-0-1` to `ide-deep`, the integrated plugin is **inactive**. The user selects an individual Mn extension (m1-paramasiva, m2-parashakti, m3-mahamaya) and that extension's standalone widget renders in the editor area. The cosmic-engine composition state survives the layout switch (per Tranche 15.7) — when the user returns to `daily-0-1`, the composition resumes at the same `(tick12, degree720, lens_mode, codon_id, ananda_vortex.active_matrix_op)`.

### 8.4 OmniPanel relation

The cosmic-engine composition is **always** rendered with the OmniPanel persistent on the right. The OmniPanel **never overlaps** the composition — it is a sidebar, not a modal. Per [`15-ui-design-foundations.md:5`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md) the OmniPanel is the agentic membrane (the `/` operator UI surface) hosting Pi conversation. The composition **deep-links into** OmniPanel tabs:

- "Open in Review" on the composition → OmniPanel Review tab landing.
- Composition readiness blocker click → OmniPanel Diagnostics tab.
- Composition codon-cell selection (proposed) → OmniPanel Evidence tab if codon has provenance handle.

### 8.5 Profile-tick clock consumption (Tranche 15.6)

The integrated widget host (`PluginIntegrated123Widget`) subscribes to the kernel-bridge profile-tick event via `bridge.onProfile`. Every tick advance is **one frame** for the composition; the widget host advances each pole's `compositionMount.onTickAdvance` in turn within a single render frame. No local clock. No animation-frame-count fallback.

When `MathemeHarmonicProfile` is pending (`bridge.onProfile` has yielded nothing yet), the composition renders the empty-state per `buildEmptyState` at [`plugin-integrated-1-2-3-widget.tsx:121-138`](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx) — naming the missing owner, not synthesising a placeholder.

### 8.6 Provenance inline rendering (Tranche 15.6)

When `cosmic_composition_state` (§4.2.3) is `ready_no_cymatic`, the composition renders a `pending-m2-cymatic` inline overlay on the corner of the K² with the missing field names and owner labels. When `ready_no_codon`, similarly for `pending-m3-codon`. When `blocked_base_missing`, the entire surface renders the blocked overlay with M1 ownership. **No silent degradation.** The blocker discipline in `cosmic-engine-panes.tsx:64-82` (per-pane) translates to per-layer.

### 8.7 Bimba/Pratibimba state persistence (Tranche 15.7)

The state that survives the 0/1 toggle (cosmic ↔ personal) and the `daily-0-1` ↔ `ide-deep` layout switch is `BimbaPratibimbaUiState` per Tranche 15.7:

```typescript
interface BimbaPratibimbaUiState {
    coordinate: CoordinateContext;
    lens: number;
    mode: number;
    profileGeneration: number;
    sessionKey: string;
    dayNow: string;
    activeOmniPanelTab: string;
    activeActivityBarMode: string;
    // Cosmic-engine-specific:
    cosmicEngineTickState: {
        tick12: number;
        degree720: number;
        activeCodonId: number;
        activeMatrixOp: number;
        ringQuaternion: [number, number, number, number];
    } | null;
}
```

The kernel-bridge DI singleton (per `layout-types.ts:7-12`) carries this. The composition's slerp-state-resumption is what allows the user to leave the cosmic side mid-tick and come back to it mid-tick later.

### 8.8 Accessibility — pause + scrub

The composition surface accepts:

- `pause` — freezes the tick advance; the slerp halts; cymatic stops; codon stays on current cell.
- `scrub_to_tick(t)` — replays deterministic state at the target tick.
- `kbd shortcuts` — `cmd-space` pause/resume; `cmd-,` step back one tick; `cmd-.` step forward one tick.

Pause is **load-bearing** for users who experience the cosmic-engine as overwhelming. The composition is alive whether you touch it or not (Tranche 15.6 principle 2); pause is the affordance for those who need it not to be.

### 8.9 Composition load order

When the cosmic-side `daily-0-1` activates:

1. Widget host instantiates `PluginIntegrated123Widget`.
2. Host calls `bridge.onProfile` subscription (single).
3. Host calls `composition coordinator.resolveClaims(contributors)` to confirm three poles are present and not in conflict.
4. Host instantiates the M1 compositionMount → K² wgpu surface created.
5. Host instantiates the M2 compositionMount → cymatic shader bound to K² material.
6. Host instantiates the M3 compositionMount → codon ring mounted on K² equator.
7. First render frame draws all three layers from current `MathemeHarmonicProfile`.
8. Subsequent frames driven by `bridge.onProfile` advances.

If any compositionMount fails to instantiate, the composition renders the blocked-overlay naming that pole as missing — never silently degrade to a two-pole composition.

---

## 9. Anti-Greenfield Audit

### 9.1 Landed in code (consume, do not re-invent)

| Asset | Location |
|---|---|
| `MathemeHarmonicProfile` struct (cosmic-engine read surface) | `Body/S/S0/portal-core/src/kernel.rs:344-387` |
| `MathemeHarmonicProfile::from_tick` constructor | `Body/S/S0/portal-core/src/kernel.rs:389-465` |
| Vimarsha audio bus writes (`audio_octet`, `nodal_quartet`) | `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:17-93` |
| K² geometry constants (`TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`) | `Body/S/S0/epi-lib/include/m1.h:526-564` |
| Cl(4,2) basis + trig table | `Body/S/S0/epi-lib/include/m1.h:629-661` |
| Hopf bundle projection | `Body/S/S0/portal-core/src/hopf.rs:7-54` |
| Six Ananda matrices (M1-2 vortex; M1 layer texture) | `Body/S/S0/epi-lib/src/m1.c:22-114` |
| DR rings (Mahāmāyā + Paraśakti) | `Body/S/S0/epi-lib/src/m1.c:122-123` |
| Codon-rotation projection (M3 layer source) | `Body/S/S0/portal-core/src/kernel.rs:373, 407-410` |
| Codon-charge quaternion | `Body/S/S0/portal-core/src/kernel.rs:374, 410` |
| Resonance72 projection (M2 layer source) | `Body/S/S0/portal-core/src/kernel.rs:366, 398` |
| Planetary-chakral projection (M2 layer source) | `Body/S/S0/portal-core/src/kernel.rs:370, 445` |
| Mahāmāyā binary projection (M3 layer T/U phase) | `Body/S/S0/portal-core/src/kernel.rs:372, 446-447` |
| Integrated plugin widget host | `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx:31-158` |
| CompositionCoordinator (claim arbitrator + readiness aggregator) | `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-coordinator.ts:73-228` |
| COSMIC_ENGINE_LAYOUT descriptor | `Body/M/epi-theia/extensions/integrated-composition/src/common/layout-claim.ts:92` |
| Per-pole profile-field availability checker | `Body/M/epi-theia/extensions/integrated-composition/src/common/profile-field-checker.ts:107-124` |
| Read-only no-local-tables discipline | `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-panes.tsx:1-13, 174-195` |
| KernelBridge runtime contract | `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts:91-211` |
| Single bridge subscription pattern | `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/plugin-integrated-1-2-3-widget.tsx:62-70` |
| M1 played-torus extension scaffold + ARCHITECTURE.md | `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` |
| M2 cymatic-engine extension | `Body/M/epi-theia/extensions/m2-parashakti/` |
| M3 wheel extension | `Body/M/epi-theia/extensions/m3-mahamaya/` |
| Vortex Modulae CSV | `Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - … .csv` |
| Paramasiva-deep narrative corpus | `Idea/Bimba/Map/datasets/paramasiva-deep/` |
| Parashakti-deep narrative corpus | `Idea/Bimba/Map/datasets/parashakti-deep/` |
| m3-prime narrative corpus | `Idea/Bimba/Map/datasets/m3-prime-*` |

### 9.2 Pending (cycle-3 deliverables, named contract, no rebuild)

- **Tranche 02.6** — Build out `m1-paramasiva-played-torus/` with the Bevy/wgpu renderer; expose `K2SurfaceHandle` and `CosmicEngineCompositionMount` for L0.
- **Tranche 02.2 / 10.X** — Land `klein_flip: Option<CosmicKleinFlip>` field on `MathemeHarmonicProfile` + emitter in `vimarsha_reading.rs`.
- **Tranche 10.10** — `ananda_vortex: AnandaVortexProjection` field on `MathemeHarmonicProfile` (per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §4.3).
- **Tranche 10.X (proposed)** — `cosmic_composition_state: Option<CosmicCompositionState>` field on `MathemeHarmonicProfile` for inline composition readiness inspection.
- **Tranche 07.X (this architecture)** — Replace `<CosmicEnginePanes>` with `<CosmicEngineSurface>` implementing composition-over-juxtaposition; add `CosmicEngineCompositionMount` exports to m1-paramasiva-played-torus, m2-parashakti, m3-mahamaya.
- **Tranche 07.X (this architecture)** — Update `COSMIC_ENGINE_LAYOUT` descriptor in `layout-claim.ts:92` to express composition mount-points instead of center-stage/side-panel.
- **Tranche 15.4 landing** — `composition-pattern.md` doc + `composition-pattern-contract.test.mjs` enforcing single-rendering-child rule.
- **Tranche 15.8 / 15.9** — Visual rendering and tick choreography for M1-2 vortex (per [[M1-2-ANANDA-VORTEX-ARCHITECTURE]]); inherited into the composition L0 layer.
- **Tranche 15.12** — Visual-regression suite covering the K² + cymatic + codon-ring frame and the Klein-flip + Möbius-return frames.

### 9.3 Net-new (M' product surface — anti-greenfield exception)

- **`<CosmicEngineSurface>` React/wgpu host** — the new composition surface that replaces `<CosmicEnginePanes>`. First-build necessary because this IS the M' cosmic editor-area product surface (Tranche 15.4 explicitly classifies it as the integrated-plugin first-build target).
- **`CosmicEngineCompositionMount` interface** — net-new contract for cross-extension geometric composition. First-build necessary because no existing analogue at this scale. Owner: `@pratibimba/integrated-composition`.
- **`K2SurfaceHandle` shared opaque handle** — the wgpu handle the M1 extension owns and shares to M2 / M3 composition mounts. First-build necessary as the technical implementation of geometric composition. Owner: `@pratibimba/m1-paramasiva-played-torus`.
- **Codon-ring vertical light column** to the centre diamond — pure aesthetic addition (M' product surface choreography); no substrate semantics; honours composition-over-juxtaposition.

### 9.4 Forbidden (do not invent)

- Local pitch synthesis ([[M1-ARCHITECTURE]] §13.5; [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §9.4).
- Local clocks ([`15-ui-design-foundations.md:13`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md)).
- Local LUT forks of codon / 72 / tarot / planetary tables (`cosmic-engine-no-local-tables.test.mjs` enforced).
- Local graph relation inference (S2 boundary).
- Side-by-side rendering of M1, M2, M3 — explicit antipattern per [`15-ui-design-foundations.md:21`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md).
- Three independent profile subscriptions — violates 07.T1.
- A four-pole or "M0-augmented" cosmic engine — the 137 is `64 + 72 + 1` only, **not** `64 + 72 + 1 + 1 (M0)`. Per [`plugin-integrated-1-2-3/package.json` line 4](Body/M/epi-theia/extensions/plugin-integrated-1-2-3/package.json) "*at M1/M2/M3 (NOT M0)*". M0 is the prior-ground reference; not a composition layer.
- A fourth "physics" pole for the coupling-flow overlay. Physics labels belong to M3's inspector overlay and must not alter the tri-pole composition.
- Personal/4-5-0 content in the cosmic composition — privacy/composition boundary.

---

## 10. Test Criteria

The integrated 1-2-3 cosmic engine composition is acceptance-ready when:

### 10.1 Substrate present

1. `test -d Body/M/epi-theia/extensions/plugin-integrated-1-2-3 && test -d Body/M/epi-theia/extensions/integrated-composition && test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus && test -d Body/M/epi-theia/extensions/m2-parashakti && test -d Body/M/epi-theia/extensions/m3-mahamaya`
2. `grep -n "ananda_vortex\|klein_flip\|cosmic_composition_state" Body/S/S0/portal-core/src/kernel.rs` shows all three proposed fields landed.

### 10.2 Composition pattern enforced

3. `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test:composition-pattern` passes — asserts widget tree has at most one direct rendering child beneath `<CosmicEngineSurface>`.
4. `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/composition-pattern.md` and references composition-over-juxtaposition contract.
5. `grep -n "PaneShell\|cosmic-engine-layout" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/` returns no matches (juxtaposition pattern removed).

### 10.3 Single subscription

6. Cycle-2 07.T1 verification continues to pass: `pnpm test:single-subscription` confirms one `bridge.onProfile` per plugin instance, three downstream `compositionMount.onTickAdvance` invocations per tick.

### 10.4 Per-pole composition mount

7. `grep -rn "CosmicEngineCompositionMount\|compositionMount" Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src Body/M/epi-theia/extensions/m2-parashakti/src Body/M/epi-theia/extensions/m3-mahamaya/src` shows all three extensions export the contract.
8. Each compositionMount.checkReadiness implementation correctly reports `ready_full / ready_no_cymatic / ready_no_codon / ready_base_only / blocked_base_missing`.

### 10.5 No local tables

9. `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test:no-local-tables` passes (extended scan of new `<CosmicEngineSurface>` source).
10. `cosmic-engine-no-local-tables.test.mjs` extended to scan all of plugin-integrated-1-2-3/src/, not just cosmic-engine-panes.tsx.

### 10.6 Tick choreography deterministic

11. Profile-tick replay: a 12-tick capture from a deterministic profile stream produces identical visual state across two runs (verified via visual-regression hash).
12. Klein-flip atomicity: at tick 5→6, M1 fold animation + M2 cymatic valence inversion + M3 minimal flicker all fire within one render frame.
13. Möbius-return: at tick 11→0, K² helix sheet returns to 0, full-surface bloom fires, diamond emits identity pulse, codon ring continues normally.

### 10.7 Layer degradation

14. Synthetic profile with M2 fields missing renders K² + codon ring + `pending-m2-cymatic` overlay (no cymatic).
15. Synthetic profile with M3 fields missing renders K² + cymatic + `pending-m3-codon` overlay (no codon ring).
15a. Synthetic profile with `coupling_flow_alignment` missing still renders the 137 visual signature and shows `pending-coupling-flow-alignment` only in the optional overlay.
16. Synthetic profile with M1 fields missing renders the `blocked_base_missing` full-surface blocker.

### 10.8 State persistence

17. `acceptance-harness/tests/topology.test.mjs` extended to cover the cosmic-engine `cosmicEngineTickState` fields surviving the 0/1 toggle and the `daily-0-1` ↔ `ide-deep` layout switch.
18. Slerp-resume test: leave cosmic at `degree720=180`, switch to `ide-deep`, return — orientation resumes at the same degree720 (no reset to identity).

### 10.9 Vimarsha-window discipline

19. Audit confirms M1 + M2 read `audio_octet` from `profile.audio_octet` (never from a local LUT or synthesiser); M3 does not read `audio_octet`.
19a. Audit confirms integrated plugin contains no RG beta-function, electroweak-mixing, QCD-correction, or measured-constant calculation code; coupling-flow values are profile/spec/citation facts only.
20. `grep -rn "synth\|generate_pitch\|new Oscillator" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src` returns no matches.

### 10.10 OmniPanel composition

21. Composition deep-links into OmniPanel Review, Diagnostics, Evidence tabs verified per Tranche 15.11.
22. OmniPanel state persists when cosmic composition is active and across the 0/1 toggle.

### 10.11 137 visual signature

23. Visual-regression baseline asserts: one K² mesh visible, 72 colour-shell regions visible at typical viewing angle, 64 codon cells visible around equator. The composition shows all three counts simultaneously.

---

## 11. Closing — Why the Integrated 1-2-3 Is What It Is

The matheme says `137 = 64 + 72 + 1`. The integrated 1-2-3 plugin is the **place where that arithmetic becomes a single visual event** instead of an addition. Three side-by-side panes would render `64`, `72`, `1` as three counts beside each other — the literal juxtaposition pattern Tranche 15.4 forbids. The composition surface renders **one K²** (the 1) **with 72 regions** (the 72) **and a 64-cell ring** (the 64) — the matheme inscribed on a single geometric event.

The bimba↔pratibimba dial at this scale: this **is** the cosmic face of the daily. The user toggles to the personal face (integrated 4-5-0) and finds the same arithmetic re-expressed at personal scale — `Q_personal` operates on the same K² substrate via M4 + M5 + M3-projected. Both sides are reflections of the same Cl(4,2) algebra at different scales (per the four-scale Cl(4,2) audit, Tranche 2.7).

The composition is **load-bearing precisely because it refuses to be three things side by side**. The discipline of composition-over-juxtaposition is not aesthetic preference; it is **the visible form of the matheme's claim that 1-2-3 is one event with three accents**. If the plugin renders three panes, the matheme's claim is contradicted by the UI. If it renders one stratified surface, the matheme's claim becomes the user's experience.

The current Cycle-2 widget violates this contract. The closure path is concrete: build the `<CosmicEngineSurface>` host; export `CosmicEngineCompositionMount` from the three pole extensions; land `klein_flip` and `cosmic_composition_state` on the profile-bus; remove `<CosmicEnginePanes>` once the new surface is verified. The substrate is rich; the surface needs to be reshaped.

> **The integrated 1-2-3 is not a composition of widgets. It is the cosmic event of M1-5 (the +1) carrying M2's 72-axis correspondence-tree as its texture and M3's 64-cell codon ring as its equator, all advancing in lock-step on the kernel-bridge profile-tick. The played K² torus is its base; the cymatic surface is its skin; the codon annulus is its horizon; the diamond at centre is its still-point. One surface, three poles, one composition, one tick.**

---

*Companion architectures: [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] (the M1-2 vortex on K²); [[M1-ARCHITECTURE]] (the M1 instrument); [[M2-ARCHITECTURE]] (the cymatic engine); [[M3-ARCHITECTURE]] (the codon-rotation wheel); [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] (the pratibimba face).*

*Substrate authorities: `Body/S/S0/portal-core/src/kernel.rs` (profile-bus); `Body/S/S0/epi-lib/include/m1.h` (K² constants + Cl(4,2)); `Body/S/S0/epi-lib/src/m1.c` (Ananda matrices + DR rings); `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` (audio bus); `Body/S/S0/portal-core/src/hopf.rs` (Hopf bundle); `Body/M/epi-theia/extensions/integrated-composition/` (composition coordinator); `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/` (widget host).*
