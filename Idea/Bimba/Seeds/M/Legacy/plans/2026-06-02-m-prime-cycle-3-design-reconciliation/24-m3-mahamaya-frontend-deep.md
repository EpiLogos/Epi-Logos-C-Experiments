# Track 24 — M3' Mahāmāyā Frontend Deep Design

Closes the per-extension widget UX for the **M3' Mahāmāyā** surface — the alive-and-tarot-like Mahāmāyā wheel as it must actually appear, render, and behave inside Theia. The substrate (Tranche 04 / Wave-A M3) and the shell hosting (Tranche 11 / Wave-B Theia shell) and the foundation principles + composition contract (Tranche 15 / Wave-C Theia shell) are landed; this tranche closes the **depth** of what M3' shows and how it shows it.

Two surface roles must close in lock-step:

1. **Standalone Mahāmāyā wheel widget** in `ide-deep` — the "active Mn extension widget" per Tranche 15 surface contracts. The full wheel + 385-node cosmic clock + 16 apertures + 9 walks + 64-hexagram browser + 22+56 tarot wheel + decan-chain breadcrumb + per-hexagram body dynamics + Quintessence indicator + Third-Spanda matheme proof panel + 3-coin cast ribbon. The "alive & tarot-like" default surface (UX §0, §7.5).
2. **M3 codon-rotation composed onto K² torus lens-ring** within `cosmic-1-2-3` plugin per Tranche 15.4 — a **reads-only** named export the composition consumes; the M3 widget itself never renders K² geometry, never mutates `m1-paramasiva-played-torus`, never touches M2 cymatic substrate. Composition contract honored both directions.

Anti-greenfield posture is absolute. The `m3-mahamaya` extension (contract `2026-06-01.07-T6`) is landed at `Body/M/epi-theia/extensions/m3-mahamaya/`. The `M3ProjectionSurface` builder (`buildM3ProjectionSurface`) and the privacy-class guard (`resolveM3ScalarOracleRef`) and the `ReadinessBanner` and the `TRACK_08_CONTRIBUTION` are landed. Every tranche below either consumes those as-is, extends them, or names a Wave-B handoff. No parallel rendering pipeline. No bypass of `SharedBridgeAdapter`. No reach into `Body/S/S0` / `portal-core` / `oracle.rs` / `medicine.rs` / `m3.c` — `forbiddenImports` in 07-T0 is enforced renderer-side.

## Source Specs and Matrix

- Canonical UX: `Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md` (§0 axiom, §3 integrated parser, §4 clock-field as live data structure, §4.1 Lens Annulus, §7.5 alive-and-tarot-like default, §8 read-only trace, §9 inspectors, §10.1 open questions).
- Canonical seed: `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` (§7 bidirectional projection, §7.5 surface-philosophy, §8.4 Cl(4,2) at four scales, §8.6 384 = 64 × 6 line-change, §8.7 56+8 exact cover, §8.9 SU(2) double-cover, §8.10 16+1 lens-stack, §8.12 M3-0 reception, §8.13 M3-5 double-torus, §8.14 integrated 1-2-3, §9 inspectors).
- Canonical architecture: `Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md` (Third Spanda Equation canonical five forms; execution-order trace; 7-8-9 spine; translation rule `9_{M_2} = 8_{M_3} + 1_{M_1}`).
- Canonical clock spec: `docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md` (per CLAUDE.md MEMORY COSMIC CLOCK SPEC 2026-03-12 — 385 nodes = 360 degree + 24 amino backbone + 1 Axis Mundi; supersedes FR 2.3.5 stub; 16 lenses = simultaneous static apertures; 9 walks = sequential traversal paths DISTINCT; `WALK_TORUS` renamed `WALK_SPANDA`; structural law `360 + 24 == 64 × 6`).
- Wave-A substrate: `04-m3-mahamaya-reconciliation.md` (tranches 4.1–4.12, DR-M3-1 / DR-M3-2 / DR-M3-3 / DR-M3-4 / DR-M3-5 / DR-M3-6).
- Wave-B shell hosting: `11-theia-shell-surface-hosting.md` (11.1 daily-0-1 ↔ ide-deep, 11.2 cross-layout intent, 11.6 state-identity across toggle).
- Wave-C foundation: `15-ui-design-foundations.md` (Principles 1–9, Surface Contracts §"ide-deep", Surface Contracts §"Cosmic-side of daily-0-1", Tranches 15.4 / 15.6 / 15.7 / 15.8 / 15.9 / 15.10).
- Wave-C contemplation integration: `19-contemplation-surface-integration.md` (19.5 `m3_major_arcana_from_codon` substrate utility; 19.9 7-8-9 spine reading on M3 axis).
- Extension contract: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (m3-mahamaya entry L321-383; `bridge.requiredCapabilities`, `methodFamilies.{s2,s3,s5}`, `forbiddenDirectImports`, `track08Exports`).
- Composition contract: `Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.{md,json}` (consumed by 24.13).
- Full row-level evidence: `plan.runs/wave-c-m3-mahamaya-frontend-matrix.md`.

## Cycle 2 Substrate Inheritance

Consume as-is (no rebuild):

- `Body/M/epi-theia/extensions/m3-mahamaya/src/common/index.ts` — `EXTENSION_ID`, `PRIMARY_VIEW_ID`, `ALL_VIEW_IDS`, `PRIVACY_CLASS`, `OBSERVABILITY_EVENT_TYPES`, `DECLARED_BLOCKERS`, `TRACK_08_EXPORTS`, `TRACK_08_CONTRIBUTION` — landed at contract `07-t0` parity.
- `Body/M/epi-theia/extensions/m3-mahamaya/src/common/codon-wheel.ts` — `M3_CODON_WHEEL_CONTRACT_VERSION = '2026-06-01.07-T6'`, `M3_EXPECTED_NON_DUAL_CODONS = 40`, `M3_EXPECTED_DUAL_CODONS = 24`, `M3_EXPECTED_ROTATIONAL_STATES = 472`, the `M3ProjectionSurface` builder, `M3ScalarOracleRef`, `resolveM3ScalarOracleRef` privacy-class guard, `validateM3LibrarySummary`, `buildWheelSummary`, `activeProjectionFacts`, `buildM30Provenance`, `buildDepthViews`, `buildWorldClockBinding`, `surfacePendingFields`, `surfaceBlockers`, `provenanceHandles`.
- `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/m3-mahamaya-widget.tsx` — `M3MahamayaWidget` ReactWidget class, `SharedBridgeAdapter` injection, `bridge.onReadiness` / `bridge.onProfile` / `bridge.onCoordinateContext` subscriptions, `ReadinessBanner` chrome. Wave-C extends the `render()` body and adds child components, never replaces the class.
- `Body/M/epi-theia/extensions/m-extension-runtime/src/common/*` — `SharedBridgeAdapter`, `SHARED_BRIDGE_ADAPTER` Inversify symbol, `MathemeHarmonicProfileBoundary`, `MExtensionReadinessSnapshot`, `MExtensionReadinessState`, `MObservabilityEvent`, `CoordinateContext`, `EMPTY_COORDINATE_CONTEXT`, `PENDING_M_READINESS`, `ReadinessBanner`, `MExtensionContributionContract`, `MExtensionMiniMode`, `CROSS_EXTENSION_ROUTE_CONTRACTS`, `REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS`.
- `Body/S/S0/epi-cli/schemas/src/kernel-bridge.ts::MathemeHarmonicProfile` — Zod schema; the payload-pocket entries Wave-C consumes (`mahamaya`, `codonRotationProjection`, `lensMode`, `tick`, `degree720`, `resonance72`).
- `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` — m3-mahamaya entry as the authoritative contract. Wave-C names Wave-B handoffs (new method-family entries `s5.oracle.iching.cast`, `s5.oracle.tarot.cast` for 24.14) but does NOT amend the contract — that's a Wave-B kernel-bridge job.

Extend, do NOT rebuild:

- The `render()` body of `M3MahamayaWidget` — replace the flat `<dl>` table with the `<M3CosmicWheelRenderService>` composite.
- The `buildDepthViews` records — extend from three (`flatClock` / `doubleTorusWorldClock` / `janusOverlay`) to the four canonical depth modes named in M3'-SPEC §8.13 (Flat Clock Debug / Lens Annulus / Toroidal/World / Hopf Identity), but as labelled depth-record extensions, not as a parallel registry.
- The `pendingFields[]` and `blockers[]` accumulator — extend with the new pending profile-fields named in WC-M3-SA-1..6.

Cycle 2 Track 05 named the substrate; cycle 3 Track 04 closes substrate reconciliation; cycle 3 Track 24 (here) closes the **rendering depth**.

## Surface Contracts

### Standalone widget surface — `ide-deep` editor area (per 15-foundation §"ide-deep")

- **Editor area host:** `m3.mahamaya.cosmicWheel` (`PRIMARY_VIEW_ID`) widget. Single pole at a time. Full-screen Mahāmāyā wheel.
- **Top zone:** existing `ReadinessBanner` (consumed as-is from runtime).
- **Center / dominant zone:** `<M3CosmicWheelRenderService mode="full" />` — the alive-and-tarot-like wheel.
- **Overlay zones:** the four named depth-view modes (Flat Clock Debug / Lens Annulus / Toroidal-World / Hopf Identity) as toggle-able overlays, NOT parallel widgets.
- **Right-side inspectors panel:** summonable per Tranche 4.2 — dinucleotide-matrix inspector, charge-quaternion display, 24-spoke lattice + 12-deep ring-buffer, Major-Arcana / chromosome panel, DNA/RNA phase toggle, per-suit integral display, Third-Spanda matheme proof panel.
- **Bottom zone:** provenance strip (`m30ProvenanceStrip`); kernel-trace overlay (read-only).
- **Activity-bar discipline:** the M3 widget never owns the left activity bar (Coordinate Tree / Bimba Graph Viewer / Canon Studio / Backend Studio / Smart Connections are left-sidebar modes per 15-foundation, consumed by the shell — NOT by the M3 widget).
- **Right-sidebar discipline:** OmniPanel is the right sidebar (Tranche 15.2) — NOT inside the M3 widget.

### Compact / mini-mode surface — cosmic-side of `daily-0-1` and Track-08 mini-modes

- **`M3CodonChip`** (badge | mini-view) — bound to `m3.mahamaya.cosmicWheel`; renders a tiny rotating chip showing current `(codon, rotation)` with the Quintessence/Akasha balance indicator as a sparkline. Mini-mode = small wheel slice with active cell highlighted; badge mode = numeric `codon` string with `rotation/N` denominator.
- **`M3WheelMiniView`** (badge | mini-view) — bound to `m3.mahamaya.codonNavigator`; renders the cosmic wheel at quarter scale with the 22-major-arcana labels visible only at hover. Both consume the SAME `M3CosmicWheelRenderService` component, parametrized by `miniMode` prop.

### Composition surface — `plugin-integrated-1-2-3` cosmic-1-2-3 plugin (per 15.4)

- **What composes:** `m1-paramasiva-played-torus` carries the K² torus geometry; M2 cymatic engine renders frequencies on its surface; M3 codon-rotation projects onto the lens-ring cells of the K² torus. One surface, three poles, one composition driven by profile-tick.
- **What M3 supplies:** a **reads-only** named export `M3CodonRotationProjectionForLensRing` (Track-08 contract extension) returning the per-tick `(codon, rotation) × (lens, mode)` projection state as a Cl(4,2) cell descriptor array. The cosmic-1-2-3 composition pulls this; the M3 widget itself is invisible inside the composition.
- **What M3 NEVER does:** mutate K² geometry, render M1 SU(2) ring, render M2 cymatic field, write to `m1-paramasiva-played-torus` state, render its own widget inside the composition editor area.
- **What the composition NEVER does:** write to M3 substrate, invent codon mapping locally, bypass the `SharedBridgeAdapter`.

### Privacy / readiness / tick discipline (binding for every widget in this tranche)

- **Privacy class:** `public_current_with_scalar_oracle_refs_only` (inherited from `index.ts::PRIVACY_CLASS`). Every named service consumed by every Wave-C widget routes through `resolveM3ScalarOracleRef` for any reach beyond `MathemeHarmonicProfile.payload`. NO raw bioquaternion, NO journal, NO unreconciled Graphiti, NO protected-artifact bodies.
- **Profile-tick:** every widget re-renders on `bridge.onProfile(profile => …)` — NO internal RAF, NO setInterval, NO timer-driven animation. The Klein-flip choreography at tick 5→6 (per 15.9 / DR-IG-3) is consumed as a profile-bus event, never re-derived.
- **Readiness:** every datum binding renders inline readiness state (border-colour `ready` / `pending` / `blocked`; pending badge; blocked overlay). The top-level `ReadinessBanner` consumes `surfaceBlockers` + `surfacePendingFields`; sub-widgets inherit via a React context provider `M3ReadinessContext.Provider` that wraps the wheel.
- **Coordinate as primary navigation:** every widget reads `bridge.onCoordinateContext(context => …)`; the active `coordinate` field is global state; the URL deep-link encodes `coordinate=M3'&codonId=<>&rotation=<>&lens=<>&mode=<>`.
- **Bimba / Pratibimba toggle:** the same widget renders both faces; the `(0/1)` toggle is the face switch, NOT a separate widget invocation. State preserved per Tranche 15.7 (DR-TS-1 ratified).

## Tranches

### 24.1 — `M3CosmicWheelRenderService`: the alive-and-tarot-like default surface *(doc-ahead-landing; first-build of named component, no new contract)*

Replace the flat `<dl>` render in `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/m3-mahamaya-widget.tsx::render()` with `<M3CosmicWheelRenderService mode="full" surface={surface} />`. The new component is the single source of wheel rendering for ALL three Track-08 modes (`badge` | `mini-view` | `full`).

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3CosmicWheelRenderService.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:cosmic-wheel` (sub-widget of `m3.mahamaya.cosmicWheel`).
- **Type signature:**
  ```ts
  export interface M3CosmicWheelRenderServiceProps {
      readonly surface: M3ProjectionSurface;
      readonly mode: 'badge' | 'mini-view' | 'full';
      readonly tickHandler?: (tick: number, degree720: number) => void;
  }
  export const M3CosmicWheelRenderService: React.FC<M3CosmicWheelRenderServiceProps>;
  ```
- **Visual contract:**
  - **64-cell ring** at the outer radius, one cell per codon (0x00..0x3F). Cell colour: derived from `codonClass` (`Perfect` | `Imperfect` | `NonPalindromicNonDual` | `Dual`). Cell label visible only at `mode === 'full'`.
  - **Active cell:** the codon at `surface.activeProjection.codonId` luminous, with rotation arrow indicating `surface.activeProjection.rotation` over `surface.activeProjection.rotationalStateCount`.
  - **Inner ring:** the 22 Major Arcana cards keyed by `mahamaya.tarotMajorArcanaCardId` (WC-M3-SA-2 pending); shown only at `mode === 'full'` and `mode === 'mini-view'`.
  - **Center:** Quintessence/Akasha indicator (`<QuintessenceIndicator surface={surface} />` — see 24.11).
  - **Inheritance:** `surface.activeProjection` IS the binding. No local LUT. No hardcoded codon strings. The component is a **pure function of `surface`**.
- **Data bindings:** `M3ProjectionSurface.activeProjection.codonId`, `codon`, `codonClass`, `rotation`, `rotationalStateCount`, `rotationDegrees`, `hexagram`, `hexagramId`, `tarotMinorId`, `tarotShadowCodon`, `datasetLutState`.
- **Composition guard:** the component MUST refuse to render if `surface.readiness.surfaceReady === false`; falls through to `ReadinessBanner` (already top-level).
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3CosmicWheelRenderService.tsx`
  - `grep -n "M3CosmicWheelRenderService" Body/M/epi-theia/extensions/m3-mahamaya/src/browser/m3-mahamaya-widget.tsx` returns the import + render-call.
  - `pnpm --filter @pratibimba/m3-mahamaya test` (typecheck-clean + component render test asserts: 64-cell ring renders at `mode === 'full'`; active cell highlighted at `codonId === surface.activeProjection.codonId`; readiness fallback when blocked).
  - `grep -rn "Body/S/S0\|portal-core" Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns nothing (forbidden-import discipline holds).

### 24.2 — `CosmicClockRenderService`: 385-node cosmic clock + angular/hop edge overlay *(doc-ahead-landing; depends on 24.1 cell layout)*

Land the 360-degree + 24-amino + 1-Axis Mundi cosmic clock as a depth-overlay component layered over the 24.1 wheel. Per CLAUDE.md MEMORY COSMIC CLOCK SPEC: "385 nodes total: 360 degree nodes + 24 amino acid backbone + 1 Axis Mundi/Quintessence". Replaces (in M3-domain) the CosmicClockPlugin role that supersedes M0Dashboard+M1Walk+M2Vibrational stubs (per MEMORY) — but only the M3 face of it; the cross-Mn `CosmicClockPlugin` is a separate concern.

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/CosmicClockRenderService.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:cosmic-clock`.
- **Type signature:**
  ```ts
  export interface CosmicClockRenderServiceProps {
      readonly surface: M3ProjectionSurface;
      readonly degreeNodes: readonly CosmicClockDegreeNode[];   // 360 entries
      readonly aminoBackbone: readonly CosmicClockAminoNode[];  // 24 entries
      readonly axisMundi: CosmicClockAxisMundi;                  // 1 entry
      readonly aspectEdges: readonly AspectEdge[];               // angular relations
      readonly hopEdges: readonly LineChangeHopEdge[];           // 384 line-change graph hops
      readonly mode: 'flat-clock-debug' | 'toroidal-world' | 'lens-annulus' | 'hopf-identity';
  }
  ```
- **Visual contract:**
  - **Flat Clock Debug mode** — 2D polar projection; 360 degree nodes as small circles at `θ = degree`, radius = constant; 24 amino backbone nodes at four nested rings (4-fold/seasonal · 12-fold/zodiac · 24-fold/amino · outer 360-fold/degree per MEMORY); 1 Axis Mundi at center.
  - **Toroidal-World mode** — 3D torus renderer (Three.js / WebGL); `θ = degree_node_360 (0..360)`, `φ = torus_stage (M1, 0..12)`, 4320 total node positions across stages, Braille-canvas-style fallback for non-WebGL contexts.
  - **Lens Annulus mode** — 16+1 lens-stack rendered as concentric annular sectors (see 24.3).
  - **Hopf Identity mode** — Hopf-fibre projection (deferred to Tranche 15.9 choreography; M3 face only consumes profile bus, never re-computes).
- **Angular / hop edge overlay (UX §4):**
  - **Aspect edges** (`<AspectEdgeLayer>`): cross-clock angular relations (`aspect` / `opposition` / `trine` / `square`); rendered as chords inside the 360-ring; colours per Golden Dawn elemental temperament (consumed via `TarotDecanService.elementForAspect(aspect)` — see 24.7).
  - **Hop edges** (`<LineChangeHopLayer>`): the 384 line-change graph (per `epi-lib/src/m3_clock_lut.c` + structural law `360 + 24 == 64 × 6`); rendered as arcs along the 64-cell ring's edges, weighted by line-change operator.
  - **Tick advance:** ALL edges advance one position per profile-tick; consumed from `surface.activeProjection.tick` and `surface.activeProjection.degree720`. No internal timer.
- **Data bindings:** `surface.activeProjection.tick`, `surface.activeProjection.degree720`, `surface.activeProjection.lineChangeOperator`, `surface.depthViews.flatClock`, `surface.depthViews.doubleTorusWorldClock`, the (new) `payload.cosmicClock.degreeNodes[]`, `payload.cosmicClock.aminoBackbone[]`, `payload.cosmicClock.axisMundi`, `payload.cosmicClock.aspectEdges[]`, `payload.cosmicClock.hopEdges[]` profile-fields.
- **Wave-B handoff:** these profile-fields are upstream of Wave-C. Until they land, the widget renders the substrate-derived skeleton (the 360-ring + the 24-spoke positions from `surface.activeProjection`) and badges the angular/hop overlays as `pending-profile-field:cosmicClock.aspectEdges` / `…hopEdges`.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/CosmicClockRenderService.tsx`
  - `grep -rn 'aspectEdge\|hopGraph\|lineChangeEdge\|spokeLattice' Body/M/epi-theia/extensions/m3-mahamaya/src/` returns matches in the new file.
  - Component render test: degree-tick advance redraws node positions; aspect-edge layer renders honest-pending when `payload.cosmicClock.aspectEdges` absent.
  - `grep -rn "import.*portal-core\|Body/S/S0" Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns nothing.

### 24.3 — 16-lens aperture switcher (`M3LensApertureSwitcher`) *(spec-ahead-integration; depends on Wave-B kernel-bridge field WC-M3-SA-1)*

Land the 16+1 Lens Annulus aperture switcher per M3'-SPEC §8.10 (the 16+1 Mahāmāyā lens-stack). The 16 lenses are simultaneous static apertures over the 360° clock (per CLAUDE.md MEMORY: "16 lenses = 16 sacred circle divisions (NOT pair matrix) mirroring Anuttara 16-fold void"). The +1 is the Level-0 meta-position (per §8.10).

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3LensApertureSwitcher.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:m3-lens-stack-aperture`.
- **Type signature:**
  ```ts
  export interface MahamayaLensStackBoundary {
      readonly activeLensId: number;                      // 0..16 (16 = Level-0 meta)
      readonly lenses: readonly MahamayaLensApertureDescriptor[];  // length === 17
  }
  export interface MahamayaLensApertureDescriptor {
      readonly id: number;
      readonly label: string;
      readonly degreeSpan: readonly [number, number];     // start, end (mod 360)
      readonly sacredDivisionIndex: number;               // 0..15; 16 = meta
  }
  export interface M3LensApertureSwitcherProps {
      readonly surface: M3ProjectionSurface;
      readonly lensStack?: MahamayaLensStackBoundary;     // from payload.mahamayaLensStack
      readonly onActivate: (lensId: number) => void;      // dispatched via SharedBridgeAdapter
  }
  ```
- **Visual contract:** 17 concentric annular sectors (16 sacred-circle divisions as outer ring; +1 Level-0 meta-position as inner ring). Active aperture luminous; non-active apertures dimmed; hover surfaces the `degreeSpan`. Clicking an aperture dispatches `bridge.invokeGatewayRpc('s3.world_clock.aperture.activate', { lensId })` (named Wave-B method-family addition WC-M3-SA-6 sibling) — renderer never mutates locally.
- **Namespace discipline (DR-WC-M3-2):** this switcher's data binding is `payload.mahamayaLensStack` (the M3 aperture lane); MUST NOT be conflated with `payload.codonRotationProjection.lens` (the M1' chromatic-lens lane, count 12). The component refuses to render if `lensStack === undefined` — falls through to a `pending-profile-field:mahamayaLensStack` badge. See 24.10 for the dual-lane discipline.
- **Data bindings:** `payload.mahamayaLensStack.activeLensId`, `payload.mahamayaLensStack.lenses[].id`, `.label`, `.degreeSpan`, `.sacredDivisionIndex`.
- **Wave-B handoff:** WC-M3-SA-1 names `mahamayaLensStack` as a required profile-field. Until it lands, the switcher renders honest-pending badge with the kernel-bridge readiness ledger surfacing the gap.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3LensApertureSwitcher.tsx`
  - `grep -n 'M3LensApertureSwitcher\|mahamayaLensStack' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns matches.
  - Render test: 17 apertures render when `lensStack` provided; honest-pending badge when absent.
  - Namespace test: component never reads `payload.codonRotationProjection.lens` (the M1' chromatic-lens lane).

### 24.4 — 9-walk traversal navigator (`M3WalkNavigator`) *(spec-ahead-integration; depends on Wave-B kernel-bridge field WC-M3-SA-4)*

Land the 9 sequential traversal-path walks distinct from the 16 simultaneous apertures (per CLAUDE.md MEMORY: "9 walks (sequential traversal paths) vs 16 lenses (simultaneous static apertures) — DISTINCT"). Per MEMORY, named walks include `WALK_SPANDA` (renamed from `WALK_TORUS`, M1 Paramasiva, 12-step/30°), `WALK_HEXAGRAM`, `WALK_LINE_CHANGE` (2^6 binary).

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3WalkNavigator.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:walk-navigator`.
- **Type signature:**
  ```ts
  export interface CosmicClockWalkDescriptor {
      readonly id: number;                                // 0..8
      readonly name: 'WALK_SPANDA' | 'WALK_HEXAGRAM' | 'WALK_LINE_CHANGE'
                  | 'WALK_DECAN' | 'WALK_AMINO' | 'WALK_ARCANA'
                  | 'WALK_CHAKRA' | 'WALK_DEGREE' | 'WALK_AXIS_MUNDI';
      readonly stepCount: number;                          // 12 for WALK_SPANDA, 64 for WALK_HEXAGRAM, etc.
      readonly stepDegrees: number;                        // 30 for WALK_SPANDA
      readonly currentStep: number;
  }
  export interface M3WalkNavigatorProps {
      readonly surface: M3ProjectionSurface;
      readonly walks?: readonly CosmicClockWalkDescriptor[];  // length === 9; from payload.cosmicClock.walks
      readonly onAdvance: (walkId: number, direction: 'forward' | 'backward') => void;
  }
  ```
- **Visual contract:** 9 horizontal walk-lanes stacked vertically in a side panel; each lane shows `currentStep / stepCount` as a progress bar with `stepDegrees` cell width. Lane glyphs reflect the walk type (12-spoke wheel for `WALK_SPANDA`; 6-bit binary for `WALK_HEXAGRAM` / `WALK_LINE_CHANGE`). Advance dispatches `bridge.invokeGatewayRpc('s3.world_clock.walk.advance', { walkId, direction })` — renderer never advances locally.
- **Discipline:** the walks are SEQUENTIAL traversal paths — at any tick exactly one step per walk is active. The 16 apertures (24.3) are SIMULTANEOUS — at any tick all 16 apertures expose their `degreeSpan` of the clock. The two MUST NOT be conflated.
- **Data bindings:** `payload.cosmicClock.walks[].id`, `.name`, `.stepCount`, `.stepDegrees`, `.currentStep`.
- **Wave-B handoff:** WC-M3-SA-4 names `cosmicClock.walks` as a required profile-field.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3WalkNavigator.tsx`
  - `grep -n 'WALK_SPANDA\|WALK_HEXAGRAM\|WALK_LINE_CHANGE' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3WalkNavigator.tsx` returns three name-string matches.
  - Render test: 9 lanes rendered when `walks` provided.

### 24.5 — 64-codon hexagram browser with line-change projection (`M3HexagramBrowser`) *(doc-ahead-landing; landed substrate fully sufficient)*

Land the 64-hexagram browser. Each hexagram is a selectable 6-line glyph; selection updates `bridge.invokeGatewayRpc('s2.codon.scalar_ref.read', { refKind: 'i-ching', scalarRef: hexagramId })`. Line-change projection rendered as transitions over the 384-graph (per M3'-SPEC §8.6 `384 = 64 × 6 line-change graph`).

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3HexagramBrowser.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:hexagram-browser`.
- **Type signature:**
  ```ts
  export interface M3HexagramBrowserProps {
      readonly surface: M3ProjectionSurface;
      readonly onSelect: (hexagramId: number) => void;
      readonly onLineChange: (fromHexagramId: number, lineIndex: 0|1|2|3|4|5) => void;
  }
  ```
- **Visual contract:** 8×8 grid of hexagrams (King Wen ordering). Each hexagram drawn as 6 horizontal lines (solid / broken / changing). Active hexagram (`surface.activeProjection.hexagramId`) luminous. Clicking a line toggles to the line-change derived hexagram via `onLineChange`. Hexagram body dynamics (24.8) sub-panel attached to the right; opens when a hexagram is selected.
- **Data bindings:** `surface.activeProjection.hexagram`, `.hexagramId`, `.upperTrigram`, `.lowerTrigram`, `.lineChangeOperator`.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3HexagramBrowser.tsx`
  - Render test: 64 hexagrams rendered; line-change toggle dispatches to bridge.

### 24.6 — Tarot wheel (`M3TarotWheel`): 22 major arcana + 56 minor arcana *(doc-ahead-landing; depends on 19.5 substrate utility + Wave-B field WC-M3-SA-2)*

Land the tarot wheel — the surface UX §1 axiom ("turning the card *is* changing the mode") needs.

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3TarotWheel.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:tarot-wheel`.
- **Type signature:**
  ```ts
  export interface M3TarotWheelProps {
      readonly surface: M3ProjectionSurface;
      readonly majorArcanaCardId?: number;        // 0..21; from payload.mahamaya.tarotMajorArcanaCardId
      readonly tarotMinorId?: TarotMinorRef;      // { suit, rank } from payload.mahamaya.tarotMinorId
      readonly onTurn: (cardKey: TarotCardKey) => void;
  }
  export interface TarotMinorRef { readonly suit: 'wands'|'cups'|'swords'|'pentacles'; readonly rank: 1|2|3|4|5|6|7|8|9|10|11|12|13|14; }
  export type TarotCardKey =
      | { readonly kind: 'major'; readonly id: number }
      | { readonly kind: 'minor'; readonly suit: TarotMinorRef['suit']; readonly rank: TarotMinorRef['rank'] };
  ```
- **Visual contract:** 22 major arcana inner ring + 56 minor arcana outer ring (4 suits × 14 ranks). Active major arcana (`majorArcanaCardId`) and active minor (`tarotMinorId`) luminous. Suits coloured by element (Wands=fire, Cups=water, Swords=air, Pentacles=earth — consistent with `oracle.rs::ACE_ELEMENT_MAP` via bridge). Turning a card dispatches `bridge.invokeGatewayRpc('s2.codon.scalar_ref.read', { refKind: 'tarot', scalarRef: cardKey })`.
- **Major-arcana ↔ codon mapping:** consumed from Tranche 19.5 substrate utility `m3_major_arcana_from_codon(uint8_t codon) → uint8_t card_id` (returns 0xFF on STOP codons). The bridge surfaces the result as `mahamaya.tarotMajorArcanaCardId`; renderer NEVER calls the utility directly (forbidden import). Renderer renders honest-pending for STOP-codon active state.
- **Minor-arcana addressing:** card → suit (ACTG / wands-cups-swords-pentacles) → codon → decan → planet → element → chakra → body zone. The chain is consumed in 24.7. Here only the visual position of the active card matters.
- **Wave-B handoff:** WC-M3-SA-2 names `mahamaya.tarotMajorArcanaCardId`. Depends on 19.5 substrate utility AND on the bridge mirror.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3TarotWheel.tsx`
  - `grep -n 'tarotMajorArcanaCardId\|tarotMinorId' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns matches in the component.
  - Render test: 22 + 56 cards rendered; STOP-codon honest-pending; suit-element colouring matches `ACE_ELEMENT_MAP` (consumed via `TarotDecanService` — see 24.7).
  - Forbidden-import test: NO direct import of `m3.c`, `oracle.rs`, `medicine.rs`, `m3_major_arcana_from_codon`.

### 24.7 — Decan-tarot addressing chain breadcrumb (`M3DecanChainBreadcrumb`) + `TarotDecanService` *(doc-ahead-landing; depends on Wave-B `s2.codon.scalar_ref.read` returning chain elements)*

Land the full chain breadcrumb panel: card → suit → codon → decan → planet → element → chakra → body zone. Per CLAUDE.md MEMORY master-clarity-plan: "ONE LUT: CHAKRA_BODY_ZONES[8] indexed by Chakra_Id. All routes (planet/decan/tarot) arrive here."

- **Component file:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3DecanChainBreadcrumb.tsx`
- **Service file:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/TarotDecanService.ts`
- **Widget id:** `pratibimba.m3-mahamaya:decan-chain-breadcrumb`.
- **Type signature:**
  ```ts
  export interface TarotDecanChain {
      readonly card: TarotCardKey;
      readonly suit: 'wands'|'cups'|'swords'|'pentacles';
      readonly codonId: number;                            // 0..63
      readonly decanIndex: number;                          // 0..35; matches DECAN_BODY_PARTS[36] index
      readonly zodiacSign: number;                          // 0..11
      readonly rulingPlanet: number;                        // 0..9 (per CLAUDE.md mod-10 planet model)
      readonly elementId: number;                           // 0..4 (earth/fire/water/air/akasha)
      readonly chakraId: number;                            // 0..7
      readonly bodyZones: readonly string[];                // from CHAKRA_BODY_ZONES[chakraId]
      readonly decanBodyPart: string;                       // from DECAN_BODY_PARTS[decanIndex]
      readonly decanHerbs: readonly string[];               // from DECAN_HERBS[decanIndex]
  }
  @injectable() export class TarotDecanService {
      constructor(@inject(SHARED_BRIDGE_ADAPTER) private readonly bridge: SharedBridgeAdapter) {}
      async resolveChain(card: TarotCardKey): Promise<TarotDecanChain | { pending: 's2-decan-chain' }>;
      elementForAspect(aspect: 'aspect'|'opposition'|'trine'|'square'): number;
  }
  ```
- **Visual contract:** breadcrumb chain rendered horizontally: `[Card] → [Suit] → [Codon 0x##] → [Decan ##] → [Sign] → [Planet] → [Element] → [Chakra] → [Body Zones]`. Each chip clickable; clicking surfaces the corresponding sub-panel (e.g. body-zone chip opens the hexagram body-dynamics viewer 24.8). Honest-pending state shown per chip when the bridge response is partial.
- **Substrate canonical reference (NOT direct import):** the chain elements correspond to `Body/S/S0/epi-cli/src/nara/oracle.rs::pip_decan_for_card` + `court_for_card` + `ace_element_for_card` and `Body/S/S0/epi-cli/src/nara/medicine.rs::PLANET_CHAKRA` + `SIGN_ELEMENT` + `CHAKRA_BODY_ZONES` + `DECAN_BODY_PARTS` + `DECAN_HERBS`. The bridge method `s2.codon.scalar_ref.read` returns the resolved chain; the M3 renderer never reaches across `forbiddenImports`.
- **Wave-B handoff:** the `s2.codon.scalar_ref.read` method (already in 07-T0 m3-mahamaya method-families) must return a structured `TarotDecanChain` payload, not just a scalar ref. Wave-C names the type shape; Wave-B closes the method-family return-shape contract.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3DecanChainBreadcrumb.tsx`
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/TarotDecanService.ts`
  - `grep -rn 'oracle.rs\|medicine.rs\|portal-core\|Body/S/S0' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns nothing (forbidden-import discipline holds).
  - `grep -n 'CHAKRA_BODY_ZONES\|DECAN_BODY_PARTS\|PLANET_CHAKRA\|SIGN_ELEMENT' Body/M/epi-theia/extensions/m3-mahamaya/src/` returns nothing (no renderer-local LUT; consumed via service).
  - Render test: chain breadcrumb renders fully when service resolves; honest-pending chips when partial.

### 24.8 — Hexagram body dynamics viewer (`M3HexagramBodyDynamicsViewer`) + `HexagramBodyDynamicsService` *(doc-ahead-landing; depends on Wave-B `s2.codon.scalar_ref.read` returning `HexagramBodyEntry`)*

Land the per-hexagram chakra-IDs + body-zones viewer. Per MEMORY: "HEXAGRAM_BODY_DYNAMICS[64]: HexagramBodyEntry per hexagram with chakra IDs + body_zones array".

- **Component file:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3HexagramBodyDynamicsViewer.tsx`
- **Service file:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/HexagramBodyDynamicsService.ts`
- **Widget id:** `pratibimba.m3-mahamaya:hexagram-body-dynamics`.
- **Type signature:**
  ```ts
  export interface HexagramBodyEntry {
      readonly hexagramId: number;             // 1..64 (King Wen)
      readonly primaryChakraId: number;        // 0..7
      readonly secondaryChakraIds: readonly number[];
      readonly bodyZones: readonly string[];   // resolved via CHAKRA_BODY_ZONES through TarotDecanService
      readonly dynamic: string;                 // e.g. 'rising', 'descending', 'still'
  }
  @injectable() export class HexagramBodyDynamicsService {
      constructor(@inject(SHARED_BRIDGE_ADAPTER) private readonly bridge: SharedBridgeAdapter) {}
      async lookup(hexagramId: number): Promise<HexagramBodyEntry | { pending: 's2-hexagram-body' }>;
  }
  ```
- **Visual contract:** sub-panel attached to 24.5 hexagram browser. Top zone: human-body silhouette with chakra-points lit by `primaryChakraId` + `secondaryChakraIds`; bottom zone: body-zones list + dynamic descriptor. Suit-element halo around the silhouette derived from the active hexagram's coupling to the codon-cell colour.
- **Substrate canonical reference:** `Body/S/S0/epi-cli/src/nara/oracle.rs::HEXAGRAM_BODY_DYNAMICS[64]` + `hexagram_body_lookup`. Renderer NEVER imports; service routes through `bridge.invokeGatewayRpc('s2.codon.scalar_ref.read', { refKind: 'i-ching', scalarRef: hexagramId })`.
- **Wave-B handoff:** bridge method-family return-shape extension named under 24.7 / WC-M3-SA-6.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3HexagramBodyDynamicsViewer.tsx`
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/HexagramBodyDynamicsService.ts`
  - Render test: silhouette + chakra-lights render when service resolves; honest-pending when not.

### 24.9 — TCT / Nine-of-Wands renderer-side surfacing rule + test fixture *(contradiction-downstream; closes DR-WC-M3-1; cross-link DR-M3-1)*

Renderer-side assertion: when `surface.activeProjection.codonId === 0x35` (TCT / Nine of Wands), `surface.activeProjection.rotationalStateCount` MUST equal 7. Per DR-M3-1: runtime authority is 7 non-dual (`classify_codon(0x35) → ImperfectPalindromic`); dataset reconciliation moves 8→7, NOT a code change. Wave-C extends `surfaceBlockers` to add `'tct-rotational-state-count-mismatch'` when the constraint is violated.

- **File patches:**
  - `Body/M/epi-theia/extensions/m3-mahamaya/src/common/codon-wheel.ts::surfaceBlockers`: add the TCT-7 invariant check.
  - `Body/M/epi-theia/extensions/m3-mahamaya/test/codon-wheel.test.ts` (new): fixture asserting TCT-7 invariant and TCT-8 rejection.
  - `Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs`: extend with m3-mahamaya TCT fixture.
- **Verification:**
  - `pnpm --filter @pratibimba/m3-mahamaya test` (TCT-7 fixture passes; TCT-8 fixture fails with `tct-rotational-state-count-mismatch`).
  - `cargo test -p portal-core::codon::tests classify` (substrate-side sanity: `classify_codon(0x35) == ImperfectPalindromic` — confirms substrate alignment with renderer-side rule).

### 24.10 — `M1_LENS` vs `M3_LENS_STACK` namespace discipline *(contradiction-downstream; closes DR-WC-M3-2; cross-link DR-M3-3)*

Per DR-M3-3 ratified in Tranche 4.6: the M1' chromatic lens namespace (12 anchors, `LENS_COUNT = 12`) and the M3 Mahāmāyā lens-stack namespace (16+1 apertures) MUST NOT silently merge. Renderer-side, two distinct widget IDs coexist:

- **`pratibimba.m3-mahamaya:m1-chromatic-lens-consumer`** — consumes `surface.activeProjection.lens` (the M1' chromatic-lens lane sourced from `projection.lens`); rendered as a small chromatic-lens chip inside the wheel center (24.1 inner ring slot).
- **`pratibimba.m3-mahamaya:m3-lens-stack-aperture`** — the 24.3 widget. Consumes `payload.mahamayaLensStack.activeLensId` (the M3 aperture lane).
- **File patches:**
  - `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M1ChromaticLensConsumer.tsx` (new) — pure consumer of `surface.activeProjection.lens` with explicit label "M1' chromatic lens (12)".
  - `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3LensApertureSwitcher.tsx` (24.3) — labelled "M3 lens-stack aperture (16+1)" prominently.
  - The M3 wheel (24.1) renders BOTH widgets side-by-side in the inspector zone, never as one merged "lens" control.
- **Lint rule:** add a renderer-side ESLint rule (or test-only grep) rejecting any usage of `payload.codonRotationProjection.lens` outside `M1ChromaticLensConsumer` and any usage of `payload.mahamayaLensStack` outside `M3LensApertureSwitcher`.
- **Verification:**
  - `grep -n 'M1 chromatic lens\|M3 lens-stack aperture' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/` returns two distinct labels.
  - `grep -rn 'lensCount.*17\|LENS_COUNT.*17\|M3_LENS_STACK_COUNT' Body/M/epi-theia/extensions/m3-mahamaya/src/` returns nothing (no silent 17-table introduced).
  - Namespace test: `M1ChromaticLensConsumer` refuses to read `payload.mahamayaLensStack`; `M3LensApertureSwitcher` refuses to read `payload.codonRotationProjection.lens`.

### 24.11 — Quintessence / Akasha emergent balance indicator (`QuintessenceIndicator`) *(spec-ahead-integration; depends on Wave-B field WC-M3-SA-3 `mahamaya.chargeQuaternion`)*

Per CLAUDE.md MEMORY master-clarity-plan: "Quintessence/Akasha emerges from balance of 4 elements (low variance in nucleotide_balance)". Per M3'-SPEC §8.4 + §9 charge-quaternion display: codon = `{w=pp(Earth), x=mm(Fire), y=mp(Water), z=pm(Air)}` with invariant `pp+mm+mp+pm = 4X`. The Quintessence indicator IS the runtime visual audit of the invariant.

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/QuintessenceIndicator.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:quintessence-indicator`.
- **Type signature:**
  ```ts
  export interface ChargeQuaternionBoundary {
      readonly pp: number;            // Earth
      readonly mm: number;            // Fire
      readonly mp: number;            // Water
      readonly pm: number;            // Air
      readonly chargeQuaternionInvariant: boolean;     // pp+mm+mp+pm === 4X
      readonly fourX: number;                          // 4X reference
  }
  export interface QuintessenceIndicatorProps {
      readonly surface: M3ProjectionSurface;
      readonly chargeQuaternion?: ChargeQuaternionBoundary;  // from payload.mahamaya.chargeQuaternion
  }
  ```
- **Visual contract:** four-petal indicator at the center of the wheel; petal sizes ∝ `pp`, `mm`, `mp`, `pm`. Quintessence "core" at the petal-cross center glows brighter as the variance over `(pp, mm, mp, pm)` shrinks (low variance ⇒ Akasha emergence). When `chargeQuaternionInvariant === false` (i.e. `pp+mm+mp+pm !== 4X`), the indicator badges `authority_payload_invariant_violation` and the wheel readiness state drops to `authority_payload_missing`.
- **Audit-as-visual:** the `4X` invariant audit (M3'-SPEC §9) becomes a runtime visual. The indicator NEVER recomputes the quaternion locally; consumes from the bridge field.
- **Wave-B handoff:** WC-M3-SA-3 names `mahamaya.chargeQuaternion` as a required profile-field.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/QuintessenceIndicator.tsx`
  - `grep -n 'chargeQuaternion\|pp+mm+mp+pm\|Quintessence\|Akasha' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/QuintessenceIndicator.tsx` returns matches.
  - Render test: four-petal sizes match `(pp, mm, mp, pm)`; Quintessence glow ∝ low-variance; invariant violation badge renders when `chargeQuaternionInvariant === false`.

### 24.12 — Third-Spanda matheme proof panel (`ThirdSpandaMathemeProofPanel`) *(doc-ahead-landing; closes DR-M3-6; cross-link Tranche 4.10 + 19.9 7-8-9 spine; depends on Wave-B field WC-M3-SA-5)*

Per DR-M3-6 ratified: Third Spanda canonical is `137 = 64 + 2(36) + 1`. Per M3-ARCHITECTURE.md, the five canonical forms + execution-order trace + translation rule are the canonical display. Per Tranche 4.10 coupling-flow / measurement-face inspector: source-warrant / provenance UI only — must NOT compute alpha or RG flow.

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/ThirdSpandaMathemeProofPanel.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:third-spanda-matheme-proof`.
- **Type signature:**
  ```ts
  export interface ThirdSpandaCanonicalForm {
      readonly id: 'mersenne'|'binary'|'octave-field'|'spanda-bridge'|'m-stack';
      readonly equation: string;        // e.g. "137 = (2^7 − 1) + 1 + 9"
      readonly label: string;           // e.g. "Mersenne view"
      readonly active: boolean;         // active when the matching skeleton event fires
  }
  export interface ThirdSpandaTranslationRule {
      readonly statement: string;       // "9_{M_2} = 8_{M_3} + 1_{M_1}"
      readonly qcdAnalogue: string;     // "3 ⊗ 3̄ = 8 ⊕ 1"
  }
  export interface CouplingFlowAlignmentBoundary {
      readonly thirdSpandaForms: readonly ThirdSpandaCanonicalForm[];   // length === 5
      readonly executionOrderTrace: string;                              // "64 + 72 = 136 → (−9) → 127 = M_7 → (+1) → 128 = 2^7 → (+9) → 137 → (+δ) → 137.035999…"
      readonly translationRule: ThirdSpandaTranslationRule;
      readonly sevenEightNineSpine: { readonly seven: string; readonly eight: string; readonly nine: string };
      readonly recognitionContextWarrant: string;
      readonly skeletonEventsActive: readonly ('Additive137'|'MersenneM7Ground'|'SpandaCrownBifurcation')[];
  }
  export interface ThirdSpandaMathemeProofPanelProps {
      readonly surface: M3ProjectionSurface;
      readonly couplingFlowAlignment?: CouplingFlowAlignmentBoundary;   // from payload.couplingFlowAlignment
  }
  ```
- **Visual contract:** four-lane inspector per Tranche 4.10. Lane 1 (Symbolic Skeleton): five equation cards (one per canonical form), the executionOrderTrace string rendered as a chevron flow, the translationRule + QCD analogue as a labelled pair, the 7-8-9 spine as a triad-chip row. Lane 2 (Physics Descent): `G_SM → D_mu → (g3,g2,gY) → RG → EW breaking → e(mu) → alpha_EM(mu) → alpha_EM(0)` as a labelled chevron flow (source-warrant only — NO renderer-side computation). Lane 3 (Measurement Face): caveat-text "137 is the integer skeleton; 137.035999... is the dressed low-energy measurement-face" prominently displayed. Lane 4 (Recognition Context): the recognition-context warrant text.
- **String audit:** the panel MUST display the canonical caveat language exactly. A test asserts the prose contains neither `"QL derives alpha"` nor `"electroweak mixing computed"` — only `"source-warrant"` / `"measurement-face"` / `"symbolic skeleton"` register-disciplined caveats accepted.
- **Skeleton-event highlights:** when `skeletonEventsActive` includes `'Additive137'`, the Spanda-bridge form (`137 = 64 + 2(36) + 1`) luminates; `'MersenneM7Ground'` → Mersenne form luminates; `'SpandaCrownBifurcation'` → execution-order trace's `127 = M_7 → (+1) → 128 = 2^7` segment luminates.
- **7-8-9 spine cross-link:** per 19.9 — display the triad `7 (action/generator) → 8 (octave-field/return) → 9 (wholeness/recognition)` as a chip-row at the top of Lane 1.
- **Wave-B handoff:** WC-M3-SA-5 names `couplingFlowAlignment` as a required profile-field.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/ThirdSpandaMathemeProofPanel.tsx`
  - `grep -n '137 = 64 + 2(36) + 1\|127 = 2\^7\|137\.035999\|9_{M_2} = 8_{M_3} + 1_{M_1}\|7 (action/generator)' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/ThirdSpandaMathemeProofPanel.tsx` returns matches.
  - String-audit test: panel prose does NOT contain `"QL derives alpha"`; contains `"measurement-face"` + `"source-warrant"` register-disciplined caveat language.
  - Render test: five canonical forms render; activation responds to `skeletonEventsActive`.

### 24.13 — `M3CodonRotationProjectionForLensRing`: named reads-only export for cosmic-1-2-3 composition *(spec-ahead-integration; cross-link Tranche 15.4 + 11.2)*

Per Tranche 15.4 composition-pattern contract: M3 codon-rotation projects onto the K² lens-ring cells of the played K² torus rendered by `m1-paramasiva-played-torus`. The M3 widget exports a **reads-only** named contract the cosmic-1-2-3 composition consumes. M3-side never mutates K² geometry; composition-side never writes to M3 state.

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/composition/M3CodonRotationProjectionForLensRing.ts`
- **Exported symbol (added to `TRACK_08_EXPORTS`):** `M3CodonRotationProjectionForLensRing`.
- **Type signature:**
  ```ts
  export interface K2LensRingCellDescriptor {
      readonly cellIndex: number;                          // 0..(K² ring cell count - 1)
      readonly codonId: number;                            // 0..63
      readonly rotation: number;                           // 0..(rotationalStateCount - 1)
      readonly chargeQuaternion: readonly [number, number, number, number];  // [pp, mm, mp, pm]
      readonly lineChangeOperator: string;
      readonly tick: number;
      readonly degree720: number;
  }
  export interface M3CodonRotationProjectionForLensRingExport {
      readonly contractVersion: typeof M3_CODON_WHEEL_CONTRACT_VERSION;
      readonly profileGeneration: number;
      readonly cells: readonly K2LensRingCellDescriptor[];
      readonly readiness: { readonly state: MExtensionReadinessState; readonly blockers: readonly string[] };
  }
  export function buildM3CodonRotationProjectionForLensRing(
      surface: M3ProjectionSurface
  ): M3CodonRotationProjectionForLensRingExport;
  ```
- **Reads-only discipline:** the function is a **pure projection** of `surface`. It throws if `surface.readiness.surfaceReady === false`. It does NOT subscribe to anything; the composition consumes it tick-by-tick from its own profile subscription.
- **Composition-contract update (Wave-B handoff named, not authored here):** `08-t0-composition-contract-preflight.json` must add `M3CodonRotationProjectionForLensRing` to the `plugin-integrated-1-2-3` consumed exports. Wave-C names this; Wave-B (composition-contract maintainer) closes it.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/composition/M3CodonRotationProjectionForLensRing.ts`
  - `grep -n 'M3CodonRotationProjectionForLensRing' Body/M/epi-theia/extensions/m3-mahamaya/src/common/index.ts` returns export addition.
  - `grep -rn 'M3CodonRotationProjectionForLensRing' Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/` returns at least one consumption.
  - Reads-only test: function is pure (same `surface` ⇒ same output; no side-effects; throws on unready).
  - Cross-layout state-identity test (extension of 11.6): toggle `daily-0-1` ↔ `ide-deep` with active codon — both surfaces consume `M3CodonRotationProjectionForLensRing` returning identical cell descriptors at the same profile generation.

### 24.14 — 3-coin I-Ching cast ribbon (`M3IChingCastRibbon`) *(doc-ahead-landing; depends on Wave-B method-family addition WC-M3-SA-6)*

Land the 3-coin cast UI ribbon per CLAUDE.md master-clarity-plan: A=6 (Old Yin / Cups / Water), T=9 (Old Yang / Wands / Fire), C=7 (Young Yin / Pentacles / Earth), G=8 (Young Yang / Swords / Air). Per UX §3: "the 6/9/7/8 I-Ching values are the operative arithmetic of the whole system."

- **File:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3IChingCastRibbon.tsx`
- **Widget id:** `pratibimba.m3-mahamaya:iching-cast-ribbon`.
- **Type signature:**
  ```ts
  export interface IChingCastResult {
      readonly castMethod: 'three-coin'|'yarrow';
      readonly lines: readonly (6|7|8|9)[];           // length === 6; bottom to top
      readonly primaryHexagramId: number;             // 1..64
      readonly derivedHexagramId: number | null;       // null if no changing lines
      readonly changingLineIndices: readonly (0|1|2|3|4|5)[];
  }
  export interface M3IChingCastRibbonProps {
      readonly surface: M3ProjectionSurface;
      readonly castResult?: IChingCastResult;
      readonly onCast: () => void;                    // dispatches s5.oracle.iching.cast
  }
  ```
- **Visual contract:** horizontal ribbon along the bottom of the wheel. Left: cast button + `[A=6][T=9][C=7][G=8]` legend. Center: six coins / lines drawn bottom-to-top as cast progresses; each line shows the cast value (6/7/8/9) and the line type (solid / broken / changing-old-yin / changing-old-yang). Right: primary hexagram glyph + derived hexagram glyph + arrow indicating changing-line propagation through the 384-graph (24.5 line-change projection layer).
- **Cast dispatch:** clicking the cast button dispatches `bridge.invokeGatewayRpc('s5.oracle.iching.cast', { castMethod: 'three-coin' })`. Renderer NEVER randomizes locally; cast result arrives via the bridge response + subsequent profile-tick advance carrying the new hexagram id.
- **Profile-tick freeze:** the cast animation freezes between cast click and result arrival (treated as a single profile-bus transaction); un-freezes once the response lands. NO local timer.
- **Wave-B handoff:** WC-M3-SA-6 names `s5.oracle.iching.cast` (and `s5.oracle.tarot.cast`) as a required method-family entry in 07-T0 m3-mahamaya. Current 07-T0 entry has `s5.evidence.deposit` only.
- **Verification:**
  - `test -f Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3IChingCastRibbon.tsx`
  - `grep -n 'A=6\|T=9\|C=7\|G=8\|three-coin\|s5\.oracle\.iching\.cast' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3IChingCastRibbon.tsx` returns matches.
  - Render test: 6 lines render bottom-to-top; cast button dispatches RPC; freeze-state during pending response.
  - No-local-randomization test: `grep -n 'Math.random' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3IChingCastRibbon.tsx` returns nothing.

### 24.15 — Profile-tick discipline + inline-provenance audit across 24.x *(doc-ahead-landing; consumes Tranche 15.6)*

Per Foundation Principle 2 + Tranche 15.6: every Wave-C widget re-renders on `bridge.onProfile(profile => …)`, NOT internal RAF / timer. Per Foundation Principle 3 + the existing `surfaceBlockers` / `surfacePendingFields`: every datum binding shows inline readiness state (border colour, pending badge, blocked overlay). NO separate errors panel.

- **File patches:**
  - `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/context/M3ReadinessContext.tsx` (new) — React context provider wrapping `surface.readiness` + `surface.pendingFields` so sub-widgets inherit without re-fetching.
  - `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/context/M3ProfileTickContext.tsx` (new) — React context provider broadcasting `surface.activeProjection.tick` + `.degree720` so sub-widgets re-render on advance.
  - Each Wave-C widget (24.1 – 24.14) consumes both contexts; ESLint rule enforces no `useEffect(() => { setInterval(…); }, [])` patterns; no `requestAnimationFrame` outside the `M3ProfileTickContext` provider.
- **Inline-provenance audit:** every binding renders its readiness through a small `<ReadinessChip>` helper (lives in `m-extension-runtime` or `m3-mahamaya/src/browser/components/ReadinessChip.tsx`) — border colour + pending badge + blocked-overlay tooltip. NO "errors" tab.
- **Verification:**
  - `grep -rn 'setInterval\|requestAnimationFrame' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns matches ONLY inside `M3ProfileTickContext.tsx` (the controlled point).
  - `grep -rn 'useM3ProfileTick\|useM3Readiness' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/` returns matches in every Wave-C widget.
  - `pnpm --filter @pratibimba/m3-mahamaya test` — tick-discipline test asserts widget re-render fires on profile advance; provenance-state inline test passes per readiness class.

### 24.16 — Renderer-service architecture (`services/` folder + DI symbol discipline) *(doc-ahead-landing; consumes Tranche 15-foundation forbidden-import contract)*

Per Foundation Principle 5 (OmniPanel) + Foundation Principle 8 (Theia conventions) + 07-T0 `forbiddenDirectImports` + `bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'`: every named service in this tranche lives in `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/` and consumes `SHARED_BRIDGE_ADAPTER` via Inversify `@inject(SHARED_BRIDGE_ADAPTER)`. NO direct import of `oracle.rs` / `medicine.rs` / `m3.c` / `portal-core` / `Body/S/S0`.

- **Services to land:**
  - `CosmicClockRenderService` (24.2): renders the 385-node clock.
  - `TarotDecanService` (24.7): resolves the decan-tarot chain via `s2.codon.scalar_ref.read`.
  - `HexagramBodyDynamicsService` (24.8): resolves per-hexagram body dynamics via the same bridge call.
  - `M3LensApertureService` (24.3): dispatches aperture activation via `s3.world_clock.aperture.activate`.
  - `M3WalkNavigationService` (24.4): dispatches walk advance via `s3.world_clock.walk.advance`.
  - `M3OracleCastService` (24.14): dispatches I-Ching and Tarot casts via `s5.oracle.iching.cast` / `s5.oracle.tarot.cast`.
- **Inversify binding file:** `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/frontend-module.ts` extended to bind each service.
- **DI symbol discipline:** every service constructor takes `@inject(SHARED_BRIDGE_ADAPTER) private readonly bridge: SharedBridgeAdapter`. No other transport. No global singletons. No `fetch()` calls. No `WebSocket` instantiation. No SpacetimeDB SDK imports.
- **Verification:**
  - `ls Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/` lists six service files.
  - `grep -rn '@inject(SHARED_BRIDGE_ADAPTER)' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/` returns six matches.
  - `grep -rn 'import.*portal-core\|Body/S/S0\|@clockworklabs/spacetimedb-sdk' Body/M/epi-theia/extensions/m3-mahamaya/src/` returns nothing.
  - `grep -rn 'fetch(\|new WebSocket(' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns nothing.
  - `pnpm --filter @pratibimba/m3-mahamaya test` (Inversify binding test asserts every service resolves).

### 24.17 — Parametrized renderer: one `M3CosmicWheelRenderService`, three modes (`badge` | `mini-view` | `full`) *(doc-ahead-landing; closes Track-08 mini-mode parity per `TRACK_08_CONTRIBUTION`)*

Per `index.ts::TRACK_08_CONTRIBUTION.compactViews`: both `M3CodonChip` and `M3WheelMiniView` declare `miniModes: ["badge", "mini-view"]`. Per 15-foundation Surface Contracts: the `ide-deep` editor area hosts the full wheel; the cosmic-side of `daily-0-1` hosts the mini-view; the Track-08 badge appears in the OmniPanel / context-strip / dispatch-trace genealogy.

- **Discipline:** ONE component, three modes. The `mode` prop on `M3CosmicWheelRenderService` (24.1) determines render fidelity:
  - `'badge'` → numeric `codon` + `rotation/N` denominator + Quintessence indicator dot. Single line. ~16-24px.
  - `'mini-view'` → quarter-scale wheel: 64-cell ring + active cell + Quintessence center + major-arcana labels at hover only. ~120-240px.
  - `'full'` → the full Mahāmāyā wheel + all sub-inspectors (24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.11, 24.12, 24.14). Fills the `ide-deep` editor area.
- **Track-08 export wiring:**
  - `M3CodonChip` (badge | mini-view) = `<M3CosmicWheelRenderService surface={surface} mode={miniMode} />` keyed off `m3.mahamaya.cosmicWheel`.
  - `M3WheelMiniView` (badge | mini-view) = same, keyed off `m3.mahamaya.codonNavigator`.
  - `M3MahamayaWidget.render()` = `<M3CosmicWheelRenderService surface={surface} mode="full" />`.
- **Composition handle (24.13):** the `M3CodonRotationProjectionForLensRing` reads-only export is the THIRD Track-08 contribution channel — composition consumes the projection, NOT the rendered wheel.
- **State-identity discipline:** the SAME `surface` produces the SAME visual content across all three modes (mode controls density / fidelity / sub-inspector visibility, NOT content semantics). The 0/1 toggle (Tranche 15.5) and the `daily-0-1` ↔ `ide-deep` layout switch (Tranche 11.6) preserve `(codonId, rotation, lens, mode, hexagramId, tarotMinorId)` across mode transitions — already enforced by the cross-layout state-identity test (Tranche 11.6 / 15.7).
- **Verification:**
  - `grep -n "mode: 'badge' | 'mini-view' | 'full'" Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3CosmicWheelRenderService.tsx` returns the type union.
  - `grep -rn 'M3CodonChip\|M3WheelMiniView' Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` returns at least three matches (component + two export wrappers).
  - Mini-mode render parity test: SAME `surface` produces compatible visual content at all three modes (badge active cell == mini-view active cell == full active cell).
  - Cross-layout state-identity test (extension of 11.6): toggling `daily-0-1` ↔ `ide-deep` with the same `surface` preserves all six state fields.

## Cross-cutting notes for the controller

- **Anti-greenfield posture is total.** All 17 tranches are `consume / extend / first-build-of-named-component-over-landed-contract`. No parallel runtime. No bypass of `SharedBridgeAdapter`. No reach into `Body/S/S0`. The `m3-mahamaya` extension contract `2026-06-01.07-T6` is honoured; its `buildM3ProjectionSurface` is the sole projection-builder; its `M3ScalarOracleRef` privacy guard is the sole scalar-ref resolution path.
- **Wave-B kernel-bridge handoffs (six)** named explicitly: WC-M3-SA-1 `mahamayaLensStack`, WC-M3-SA-2 `mahamaya.tarotMajorArcanaCardId`, WC-M3-SA-3 `mahamaya.chargeQuaternion`, WC-M3-SA-4 `cosmicClock.walks[]`, WC-M3-SA-5 `couplingFlowAlignment.thirdSpandaForms[]`, WC-M3-SA-6 method-family entries `s5.oracle.iching.cast` / `s5.oracle.tarot.cast` / `s3.world_clock.aperture.activate` / `s3.world_clock.walk.advance`. Until they land, Wave-C tranches render honest-pending badges through the existing readiness ledger — no parallel state.
- **DR-WC-M3-1 / DR-WC-M3-2** are renderer-side surfacing rules downstream of DR-M3-1 / DR-M3-3; closed by tests, not by spec changes. No new decision-register entries needed.
- **15.4 composition contract** is the sole compositional boundary; 24.13 honours it both ways. The M3 widget never renders K² geometry; the cosmic-1-2-3 composition never writes to M3 state.
- **Privacy discipline is binding** at every layer: every reach beyond `MathemeHarmonicProfile.payload` routes through `M3ScalarOracleRef` + `resolveM3ScalarOracleRef`; no protected-artifact bodies; no Nara / Graphiti / M4-0 identity-system fetches.
- **Profile-tick is the clock** (15.6): no internal RAF, no setInterval — except the controlled `M3ProfileTickContext` provider (24.15) which broadcasts the kernel-bridge profile-tick subscription. The Klein-flip at tick 5→6 (DR-IG-3 / 15.9) is consumed as a profile-bus event; M3 surface honours by visibly transitioning the wheel's Cl(4,2) signature halo colour (per the 15.9 single-animation-primitive `quat_slerp` discipline). The slerp itself is owned by `m1-paramasiva-played-torus` (DR-M1-2); M3 only consumes the resulting `position6` / `Ananda_Matrix_Op` advance.
- **Inline provenance and readiness** are non-negotiable: the kernel-bridge readiness ledger IS the foundation; the M3 widget's `ReadinessBanner` + the new `ReadinessChip` helper render it inline at every level.

## Anti-Greenfield Posture

All work in Track 24 either:

- Consumes Theia / Inversify / React conventions (`@injectable`, `@inject`, `ReactWidget`, `postConstruct`, `@theia/core/shared/inversify`).
- Repurposes / extends the landed `m3-mahamaya` extension (`buildM3ProjectionSurface`, `M3ScalarOracleRef`, `ReadinessBanner`, `TRACK_08_CONTRIBUTION`).
- First-builds against named, declared M' product surface owners (the 17 widget IDs / six named services named here ARE the M3' product surfaces — they don't yet exist as code, but the contract surface `M3_CODON_WHEEL_CONTRACT_VERSION` declares them; first-build is over a landed contract).
- Names Wave-B handoffs (WC-M3-SA-1..6) without authoring kernel-bridge / contract-preflight changes.

No greenfield rendering framework. No competing widget shell. No bypass of `SharedBridgeAdapter`. No reach into `Body/S/S0`. The M3' Mahāmāyā wheel becomes what UX §0 has always said it is: the alive-and-tarot-like symbolic-genetics parser, the 360° clock-field as live data structure, rendered as the matter pole of the cosmic-1-2-3 composition — over a landed contract, through the bridge, with profile-tick as the clock and inline provenance as the truth.
