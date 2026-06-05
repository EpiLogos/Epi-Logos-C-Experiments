# Track 22 — M1' Paramaśiva Frontend Deep Design

Closes per-extension widget UX for the M1' Paramaśiva surface (`Body/M/epi-theia/extensions/m1-paramasiva/` + `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/`) beyond what Tracks 15.8 and 15.9 already contract for the played-torus ananda vortex visual. Track 22 does NOT reproduce the K² + ananda heatmap + DR streamlines + Cl(4,2) colour-binary visual rendering contract (15.8) or the `quat_slerp` tick-choreography animation primitive (15.9) or the Kaprekar 6174 LEAN pedagogy seed (19.8) or the 7-8-9 spine + Mersenne reading (19.9); those tranches are cross-linked as authorities. Track 22 owns the rest of the M1' frontend surface: the **Spanda walk navigator** that gives the user the matheme as a walkable instrument; the **Cl(4,2) signature inspector** that surfaces the position-by-position trig identity beneath the played K² halo colour-binary; the **Klein-flip event-strip** that chronographs the bus event 02.2 lands as the user-visible affordance; the **7-8-9 spine reader** at session close (placed inside the OmniPanel Review tab per 19.6 / 19.7 / 19.9); the **Mersenne / 137 additive proof overlay** in developer-mode reading the substrate's matheme proof structure; the **Kaprekar 6174 inspector** as the minimal pedagogy-link surface that cross-references 19.8 without reproducing its treatment; the **vortex matrices browser** as the 2D selector that pairs with the played-torus 3D perspex cross-fade; the **audio_octet / nodal_quartet companion view body** that finally fills the third reserved view id `m1.paramasiva.audioBusInspector`; the **m1-paramasiva-played-torus extension scaffold first-build** under DR-M1-2 ratification (package + src/browser + wgpu/Cargo.toml + ReactWidget mount only — Bevy/wgpu renderer engine stays 15.8 + 15.9 authority); the **standalone vs composed dispatch contract** that lets the same `M1ProfileClockModel` drive both the cosmic-1-2-3 composition pole AND the standalone `ide-deep` `m1-paramasiva` deep page; the **Coordinate Tree M1 contribution** that surfaces M1's internal coordinate structure as walkable sub-nodes inside the existing `ide-shell-m0-m5` Coordinate Tree widget; and the **Backend Studio M1 pack manifest** that, when Backend Studio lands per Wave-B TS-23 gating, exposes the curated source pack (`m1.h`, `m1.c`, `kernel.rs`, `hopf.rs`, `quaternion.rs`, `spanda.rs`, `vimarsha_reading.rs`, `codon_rotation_projection.rs`) for rust-analyzer / clangd navigation.

The M1' substrate is substrate-rich and surface-shallow (Wave-A closing note). The M1' UX doc (`Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md`) is the largest single-subsystem UX document at 253 LOC with §5b alone running ten subsections on the ananda vortex visible-heartbeat. The depth standard for Track 22 is the depth Wave-A found in M1's substrate matched against the depth UX §5b articulates at user-visible level — the played K² torus + the diamond at centre + the Cl(4,2) halo colour-binary + the gold/emerald DR streamlines + the Klein-flip self-interpenetration + the Möbius-return bloom are 15.8's authority; the *per-widget UX scaffold around them* is Track 22's authority. The thirteen tranches below land that scaffold.

## Source Specs and Matrix

- Canonical: `Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md` (§§0–12 + §5b.1–5b.10), `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` (§§0–11)
- Companions: `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md`, `Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md`, `Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md`, `Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md`, `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`
- IDE-side contract: `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` (DR-M1-2 ratified scaffold contract); existing `Body/M/epi-theia/extensions/m1-paramasiva/src/{common,browser}/*` substrate (clock-instrument scaffold)
- Contract preflight: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` L190-252 (m1-paramasiva entry — view ids, capability/subscription/forbidden-import set)
- Full row-level wave-C reconciliation: `plan.runs/wave-c-m1-paramasiva-frontend-matrix.md` (20-row four-way matrix)
- Cross-references: Track 02 (M1 substrate reconciliation — 02.1 contradiction-decision, 02.2 klein_flip, 02.3 kleinTopology view wiring, 02.4 MPrimePerformanceEvent, 02.5 # carrier, 02.6 played-torus scaffold), Track 10 (kernel-bridge 10.2 / 10.10 ananda_vortex + klein_flip), Track 11 (Theia shell — 11.5 forbidden-import lint, 11.6 cross-layout state-identity, TS-23 Backend Studio gating), Track 15 (15.4 composition pattern, 15.6 profile-tick clock + inline readiness, 15.7 BimbaPratibimbaUiState, 15.8 ananda vortex visual rendering, 15.9 tick choreography, 15.12 visual-regression harness), Track 18 (typed kernel-bridge JSON edge — 18.2 shared three-variant KleinFlipEvent), Track 19 (19.6 contemplation RPC, 19.8 Kaprekar LEAN seed, 19.9 7-8-9 spine + Mersenne)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/m1-paramasiva/src/common/{index.ts, clock-instrument.ts}` (EXTENSION_ID, PRIMARY_VIEW_ID, ALL_VIEW_IDS=`[clockInstrument, kleinTopology, audioBusInspector]`, M1ProfileClockModel, buildM1ProfileClockModel, buildM1RelationWalkStep, relationWalkBlockers); `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/{m1-paramasiva-widget.tsx, m1-paramasiva-extension-body.tsx, frontend-module.ts}` (ReactWidget host with `onProfile` / `onReadiness` / `onCoordinateContext` subscriptions, five-section render, M1ParamasivaPublisher with observability event whitelist, route handler for `epi-logos://ide/m1-paramasiva/walk`); contract preflight m1-paramasiva entry at `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` L190-252 (view ids, observability event types, blockers, track-08 exports). Cycle 2 Track 03 (M1-paramasiva extension scaffold + clock instrument + 84-state landscape + topology slots + audio-bus model) closed the scaffold substrate; cycle 3 Wave-A Tranche 02 closed the substrate-level pendings (klein_flip, ananda_vortex, # carrier, played-torus first-build ratification); cycle 3 Track 15 closed the played-torus vortex visual + tick choreography contracts; cycle 3 Track 22 closes the per-widget UX around them. Inherit, do not re-author, the kernel-bridge SharedBridgeAdapter contract (07-t0 sharedBridgeAdapter), the readiness taxonomy (07-t0 readinessTaxonomy 9 ids), the route convention (07-t0 routeConvention `epi-logos://ide/<extension>/<surface>`), and the Theia ReactWidget / ContainerModule / ViewContribution / @postConstruct lifecycle pattern.

## Surface Contracts

### M1' as the played-K² substrate of cosmic-1-2-3 composition + standalone deep widget at `ide-deep`

M1' has three surface-mode contexts:

1. **Standalone `ide-deep` `m1-paramasiva` editor-area page (the 4+2 depth)** — the full M1' frontend lands here. Editor area: the 3D played-torus from `m1-paramasiva-played-torus` extension (15.8 / 15.9) renders as the centrepiece editor-area widget; the 2D `m1-paramasiva` extension contributes the Spanda walk navigator (22.1) + Cl(4,2) signature inspector (22.3) + Klein-flip event-strip (22.4) + vortex matrices browser (22.8) + audio-bus inspector (22.9) + existing 5-section layout (profile-clock / 84-state landscape / audio-bus summary / topology / relation-walk-readiness). Left sidebar: Coordinate Tree (with M1 contribution 22.11 expanding the M1 sub-tree to M1-0' through M1-5' + matrix families + ring positions) + Bimba Graph Viewer + Canon Studio + Backend Studio (when landed; 22.12 contributes the M1 pack manifest). Right sidebar: OmniPanel (identical content across layouts per 15.0 principle 5). Bottom: profile-tick status + readiness ledger summary + day-now anchor (15.0 principle 9; 15.10 status bar discipline).

2. **Composed cosmic-1-2-3 plugin in `daily-0-1` cosmic-side** — the played-torus from `m1-paramasiva-played-torus` is the centrepiece of the composition surface (15.0 Surface Contracts cosmic-side; 15.4 composition-over-juxtaposition); the 2D `m1-paramasiva` extension contributes compact `M1WalkStrip` + `M1TopologyMiniView` (existing track-08 exports declared in `src/common/index.ts` TRACK_08_EXPORTS) as overlay strips on the played-torus surface; M2 cymatic engine renders frequencies on the K² surface (not in a separate pane); M3 codon-rotation projects onto the lens-ring cells. One surface, three poles, one composition driven by profile-tick.

3. **Compact track-08 contribution in any non-cosmic composition** — `M1WalkStrip` + `M1TopologyMiniView` only, per existing TRACK_08_CONTRIBUTION declaration; no Wave-C surfaces appear in this mode.

The 22.10 dispatch contract is what lets all three contexts read the same `M1ProfileClockModel` without state divergence: kernel-bridge DI singleton owns `(coordinate, lens, mode, profileGeneration, tick12, position6, active_matrix_op, k2_orientation_q)`; both surfaces are pure views; the standalone-vs-composed routing is a typed `M1SurfaceMode` discriminator on `M1ParamasivaExtensionBody`.

### What M1' IS at the level of named contributions

- **Editor-area widgets:** `pratibimba.m1.paramasiva` (existing — clock-instrument primary), `m1.paramasiva.kleinTopology` (02.3 wiring), `m1.paramasiva.audioBusInspector` (22.9 body), `m1.paramasiva.cl42SignatureInspector` (22.3 new), `m1.paramasiva.kleinFlipEventStrip` (22.4 new), `m1.paramasiva.vortexMatricesBrowser` (22.8 new), `pratibimba.m1.paramasiva.played-torus` (22.2 scaffold)
- **OmniPanel Review-tab contribution:** `m1.paramasiva.spineReader789` (22.5; mounted inside Review tab via 19.6 / 19.7 contemplation flow, NOT in `m1-paramasiva` editor-area)
- **Coordinate Tree contribution:** M1 sub-tree manifest (22.11; lands in `ide-shell-m0-m5` Coordinate Tree widget)
- **Backend Studio contribution:** M1 backend pack manifest (22.12; gated on Backend Studio extension)
- **Compact track-08 contributions:** `M1WalkStrip`, `M1TopologyMiniView` (existing — unchanged)
- **Observability events:** `m1.walk.step` (existing), `m1.klein_flip.source` (existing; consumes shared variant at 18.2), `m1.played-torus.tick` (22.2 new), `m1.played-torus.klein-flip` (22.2 new), `m1.played-torus.mobius-return` (22.2 new), `m1.vortex.family_pinned` (22.8 new)

### How M1 composes with 15.8 / 15.9 played-torus

The played-torus extension `m1-paramasiva-played-torus` is the 3D Bevy/wgpu rendering surface; the 2D `m1-paramasiva` extension is the inspector/instrument/standalone-IDE surface. They are companion surfaces, distinct extensions, both landed in M1' frontend deep design. Their composition is:

- The played-torus subscribes to `MathemeHarmonicProfile` via `kernel-bridge` (15.8 / 15.9 + ARCHITECTURE.md §8.3 profile-tick clock as global UI clock); the 2D `m1-paramasiva` extension subscribes through the same `SharedBridgeAdapter`. State is identical — both read the singleton.
- Selection in 2D pins the family in 3D — vortex matrices browser (22.8) emits `m1.vortex.family_pinned` observability event; played-torus extension subscribes and locks the perspex cross-fade in 3D to the pinned family.
- Klein-flip event on the profile bus (02.2 / 10.2 / 18.2) routes simultaneously to the played-torus (15.9 Klein-flip self-interpenetration animation) AND the 2D Klein-flip event-strip widget (22.4 user-visible chronograph) AND the 2D vortex matrices browser (22.8 dual matrix cross-fade).
- Spanda walk navigator (22.1) pause/scrub affordance commands the played-torus through the kernel-bridge `requestScrubToTick(tick)` capability (added through 15.9 if not already there) — the slerp is deterministic under replay (15.9 verification) so pausing the navigator pauses the played-torus surface in sync.
- State persistence (15.7 + 22.13) preserves the same `(tick12, position6, lens_mode, active_matrix_op, k2_orientation_q)` tuple across `daily-0-1` ⇄ `ide-deep` toggle for BOTH surfaces.

## Tranches

1. **22.1 — Spanda walk navigator widget** *(code-pending-consumer / spec-ahead; consumes 15.6 / 15.9 / 02.5)*

   New widget `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-spanda-walk-navigator.tsx` rendered inside the existing `m1.paramasiva.clockInstrument` view body. The current static Profile-clock `<dl>` section in `m1-paramasiva-extension-body.tsx` L36-68 is replaced with a tick-by-tick frame navigator + the `<dl>` retained below as the slow-data readout. The navigator carries: a horizontal scrub bar with twelve tick stops (0–11), the current `tick12` highlighted (read from `M1ProfileClockModel.tick12`); a play/pause toggle binding to `bridge.requestScrubToTick(tick)` (capability added through 15.9 if not already landed); a live readout `tick12 / 11 → degree720 / 720°` updating with profile-tick advance per 15.6 global UI clock; a slerp-fraction live progress bar showing where within the current 30° SO(3) substep the K² orientation has reached; a next-tick-event preview that reads ahead (Klein-flip at 5→6, Möbius-return at 11→0); an **invert `#` button** placed adjacent to the current tick stop that publishes the 02.5 single session-held Inversion_Operator round-trip when clicked. The widget extends `M1ProfileClockModel` with `tick_projection: { slerpFraction: number | null; nextTickEventKind: 'klein_flip' | 'mobius_return' | null; isAtKleinBoundary: boolean }` via a new helper `buildTickProjection(payload)` in `clock-instrument.ts`. **Pedagogy contract** per UX §0 / §1: this widget IS the matheme as a playable instrument; the user walks the engine. Honour 15.0 foundation principle 2 (profile-tick as primary clock — widget re-renders on bridge tick advance, not user input). **Privacy:** `public_current_audio_metadata_only` — no protected-local data crosses the navigator.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-spanda-walk-navigator.tsx`; `pnpm --filter @pratibimba/m1-paramasiva test` passes; widget test asserts `data-test='m1-walk-navigator-tick'` reads the current `tick12` from bridge through `M1ProfileClockModel`; scrub test asserts the scrub bar position drives the profile-bus replay through `bridge.requestScrubToTick(tick)`; invert test asserts the `#` button publishes a 02.5 contract round-trip event and the next profile generation reflects the inversion; `grep -n 'tick_projection\|buildTickProjection' Body/M/epi-theia/extensions/m1-paramasiva/src/common/clock-instrument.ts` shows the new projection helper; forbidden-import lint (11.5) asserts no `Body/S/S0`, `portal-core`, `RING_QUATERNION_LUT` local fork in the navigator src.

2. **22.2 — `m1-paramasiva-played-torus` extension scaffold first-build** *(code-pending-first-build; DR-M1-2 ratified; consumes 15.8 / 15.9 for renderer authority)*

   First-build the Bevy/wgpu extension scaffold under DR-M1-2 ratification. The ARCHITECTURE.md contract at `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` is the IDE-side authority; 22.2 lands the package shape and the Theia-side mount points only — the Bevy/wgpu renderer engine (k2_mesh.rs, ananda_heatmap.rs, dr_streamlines.rs, cl42_colour.rs, hopf_shadow.rs, diamond_centre.rs, tick_choreography.rs, k2_surface.wgsl, ananda_heatmap.wgsl, streamlines.wgsl, cl42_halo.wgsl) is **15.8 + 15.9 authority** and lands when those tranches execute.

   Files created:
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/package.json` — `@pratibimba/m1-paramasiva-played-torus` v0.1.0; deps `@theia/core 1.56.0`, `@pratibimba/m-extension-runtime workspace:*`, `react ^18.3.1`, `react-dom ^18.3.1`; `theiaExtensions.frontend = "lib/browser/played-torus-frontend-module"`; description matches ARCHITECTURE.md L7
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/common/played-torus-surface.ts` — extension surface contract: `EXTENSION_ID = 'm1-paramasiva-played-torus'`, `PRIMARY_VIEW_ID = 'pratibimba.m1.paramasiva.played-torus'`, `PRIVACY_CLASS = 'public_current_audio_metadata_only'`, `OBSERVABILITY_EVENT_TYPES = ['m1.played-torus.tick', 'm1.played-torus.klein-flip', 'm1.played-torus.mobius-return'] as const`, `DECLARED_BLOCKERS = ['Tranche 10.10 ananda_vortex profile field', 'Tranche 02.2 klein_flip profile field', 'Tranche 15.8 / 15.9 Bevy/wgpu renderer engine']`, `OPEN_COMMAND_ID = 'm1.openPlayedTorus'`, `ROUTE_PATH = '/m1-paramasiva-played-torus/k2'`, exported `TRACK_07_CONTRIBUTION` placeholder
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/common/vortex-renderer-handle.ts` — opaque renderer handle interface:
     ```ts
     export interface VortexRendererHandle {
         readonly subscribe: (canvas: OffscreenCanvas) => Disposable;
         readonly setProfile: (profile: MathemeHarmonicProfileBoundary) => void;
         readonly setPaused: (paused: boolean) => void;
         readonly requestScrubToTick: (tick: number) => Promise<void>;
         readonly getCurrentSurfaceState: () => { tick12: number; degree720: number; active_matrix_op: number; k2_orientation_q: readonly [number, number, number, number] };
         readonly pinMatrixFamily: (op: number) => void;
     }
     ```
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/browser/played-torus-widget.tsx` — ReactWidget hosting the wgpu canvas (mirrors `m1-paramasiva-widget.tsx` pattern):
     - `@postConstruct` init subscribes to `bridge.onReadiness`, `bridge.onProfile`, `bridge.onCoordinateContext`
     - Renders `<canvas data-test='m1-played-torus-canvas' ref={canvasRef} />`; on mount, transfers `canvasRef.current.transferControlToOffscreen()` to the renderer handle via `vortexRenderer.subscribe(offscreen)`
     - When `profile?.payload.ananda_vortex` is `null | undefined`, renders `<ReadinessBanner />` with `pending-ananda-vortex` per ARCHITECTURE.md §8.4
     - When `klein_flip` field is missing, renders inline `pending-klein-flip` badge per ARCHITECTURE.md §8.4
     - On dispose, releases the renderer handle and disposes the canvas
     - Subscribes to `m1.vortex.family_pinned` observability events from 22.8 vortex matrices browser; calls `vortexRenderer.pinMatrixFamily(op)` on event
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/browser/played-torus-frontend-module.ts` — ContainerModule binding `PlayedTorusWidget`, `WidgetFactory`, `PlayedTorusContribution extends AbstractViewContribution` (mirrors `m1-paramasiva` frontend-module.ts); route handler for `epi-logos://ide/m1-paramasiva-played-torus/k2`; intent target registration with `'k2-played-torus'` kind
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu/Cargo.toml` — Rust crate declaration (toolchain only):
     ```toml
     [package]
     name = "m1-paramasiva-played-torus-wgpu"
     version = "0.1.0"
     edition = "2021"

     [lib]
     crate-type = ["cdylib", "rlib"]

     [dependencies]
     bevy = { version = "0.13", default-features = false, features = ["bevy_render", "bevy_winit"] }
     wgpu = "0.19"
     glam = "0.27"
     bytemuck = { version = "1.16", features = ["derive"] }
     ```
     **The `src/lib.rs` and individual renderer modules are NOT created by 22.2** — they are created by 15.8 (visual rendering contract) and 15.9 (tick choreography). 22.2 lands the Cargo.toml so the toolchain manifest is verifiable.
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/style/played-torus.css` — canvas sizing (`width: 100%; height: 100%;`), readiness-overlay styling (semi-transparent grey scrim with centred provenance text)
   - `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/tsconfig.json` mirrors `m1-paramasiva/tsconfig.json`

   Update `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` to add `m1-paramasiva-played-torus` as the seventh extension entry (after `m1-paramasiva`) with its viewIds, capability set (`readCurrentProfile`, `readReadiness`, `subscribeObservability`), required subscriptions (`profile`, `connection_status`, `observability`), method families (`s2.pointer.walk.read`), forbidden-direct-imports (the standard 10-entry list per 07-t0 sharedBridgeAdapter), and blockers.

   Verification: `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/browser`; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/package.json`; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/browser/played-torus-widget.tsx`; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/browser/played-torus-frontend-module.ts`; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu/Cargo.toml`; `grep -nE '"bevy"|"wgpu"' Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu/Cargo.toml` matches; `pnpm --filter @pratibimba/m1-paramasiva-played-torus build` succeeds; widget mount test asserts ReactWidget instantiates without errors when wgpu renderer is stubbed; ReadinessBanner renders with `pending-ananda-vortex` provenance when `MathemeHarmonicProfile.ananda_vortex` is `None` per ARCHITECTURE.md §8.4; forbidden-import lint (11.5) passes — no `Body/S/S0`, `portal-core`, `neo4j-driver`, `@clockworklabs/spacetimedb-sdk` in extension src; ARCHITECTURE.md boundary audit `! grep -rn 'T2_Mahamaya\|double_torus\|m3_torus_outer' Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/` passes (M3-5 territory honoured); contract preflight `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` passes with the new entry.

3. **22.3 — Cl(4,2) signature inspector view body** *(spec-ahead-integration; consumes 10.10 + 15.8)*

   New view body `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-cl42-signature-inspector.tsx` + new view id `m1.paramasiva.cl42SignatureInspector` added to `ALL_VIEW_IDS` in `src/common/index.ts` and to the contract preflight JSON at L194-196. Renders a six-column position matrix `P0 P1 P2 P3 P4 P5` showing for each position:

   - Position index (0–5)
   - Trig function (`sin`, `tan`, `sec`, `cot`, `csc`, `cos`) — labels lifted from `QL_TRIG_TABLE[6]` via `bridge.payload.ananda_vortex.cl42_signature_at_position` (read-through; NO local fork of `CL42_BASIS[6]`)
   - Signature `−1` for P0/P5, `+1` for P1/P2/P3/P4
   - Numerator QL position / denominator QL position (the `[n]/[d]` pair from `QL_TRIG_TABLE` per ARCHITECTURE.md §5.4: e.g. `tan = [0]/[5]` to remind the learner sin/cos generators sit at P0/P5)
   - Halo colour-binary swatch: cool indigo for `−1`, warm amber-vermilion for `+1` (matching 15.8 K² halo rendering at the position level)
   - Active-position highlight at current `position6` from `M1ProfileClockModel.position6`

   Below the six-column matrix, a **9/8 self-derivation panel** lands per Wave-A row 2 / WC-M1-02 DOC-AHEAD: live readout showing `(4/3) × (3/2) = 2/1` (octave) and `(3/2) ÷ (4/3) = 9/8` (epogdoon-tick) with the current `tick12` highlighted indicating which 9/8 step the user is at in the cycle. The derivation chain is rendered as static text but the highlight is profile-driven. Below the derivation panel, the developer-mode `MersenneProofOverlay` from 22.6 mounts as a sub-component (gated to `ide-deep` + developer-mode preference).

   The widget is the inspector that 15.8 cannot be (15.8 renders the colour-binary on K² as a 3D rendering property; 22.3 reads the per-position breakdown as a 2D analytical surface). Subscribes through `SharedBridgeAdapter`'s `onProfile`. Renders inside `m1.paramasiva.cl42SignatureInspector` view body via Theia view-routing. **Privacy:** `public_current_audio_metadata_only` (the matheme structure is public data).

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-cl42-signature-inspector.tsx`; `grep -n 'm1.paramasiva.cl42SignatureInspector' Body/M/epi-theia/extensions/m1-paramasiva/src/common/index.ts` matches; widget test asserts each of the six positions renders with correct trig label + signature; halo swatch test asserts indigo class for `position6 ∈ {0,5}` and warm class for `position6 ∈ {1,2,3,4}`; 9/8 derivation test asserts the chain text reads `(4/3) × (3/2) = 2/1` and `(3/2) ÷ (4/3) = 9/8` AND that the current-tick highlight position is driven by `M1ProfileClockModel.tick12` (not a local timer); substrate-derivation audit `! grep -nE 'CL42_BASIS\s*=\s*\[|QL_TRIG_TABLE\s*=\s*\[' Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-cl42-signature-inspector.tsx` passes (no local fork); contract preflight regen `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` asserts the new view id is registered.

4. **22.4 — Klein-flip event-strip widget** *(code-pending-consumer; consumes 02.2 / 10.2 / 18.2)*

   New widget `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-klein-flip-event-strip.tsx` + new view id `m1.paramasiva.kleinFlipEventStrip` added to `ALL_VIEW_IDS` and contract preflight. Renders a chronograph component as the user-visible event-strip for Klein-flip events. The widget is distinct from 02.3 `m1.paramasiva.kleinTopology` (which renders the K² topology slot values like `doubleCoverDeg`, `hopfIdentity`, `m1OriginKleinFlip` per the existing `M1ProfileClockModel.topology` model) — 22.4 specifically owns the **event-trail UI** showing klein_flip event arrivals over time.

   Surface elements:
   - Horizontal scroll-strip with time axis (left = past, right = future-projection from slerp); when 22.1 Spanda walk navigator is paused, the strip is scrollable; when playing, the strip auto-scrolls
   - On each `m1.klein_flip.source` observability event arrival, renders a glyph at the strip's current scroll position. Glyph kind by the shared three-variant `KleinFlipEvent` enum from Tranche 18.2:
     - `M1TritoneCrossing` — bright gold glyph (M1' is the origin per UX §5b.5); annotated `from_lens → to_lens` (e.g. `Lens 2 → Lens 5` for a tritone crossing)
     - `M2CymaticValenceInvert` — secondary indigo glyph beneath the M1 glyph at lower intensity (M2' echo per UX §5b.5)
     - `M3CodonRotationCross` — tertiary emerald glyph at lowest intensity (M3 codon-rotation echo)
   - **Hopf-fibre flag visual:** a small Hopf-bundle icon at the strip's right edge that visibly inverts on every flip event (the SU(2) double-cover identity-return becomes visible at strip level, not only on the played K² surface per 15.8 / 15.9)
   - Tick anchor: each glyph carries its `tick12` value visible on hover; the strip highlights the canonical tick 5→6 boundary distinctly from other transitions (per M1'-SPEC §6: Klein-flip is supposed to fire only at Lens N ↔ Lens N+3 tritone crossings; if a flip fires at a non-tritone tick, it is rendered with a `unexpected-flip` warning badge consuming 02.2 detector's false-positive rejection contract)
   - Filter dropdown: variant subset (M1 only / M1+M2 / all three)

   Subscribes to `bridge.onObservabilityEvent` filtered on `OBSERVABILITY_EVENT_TYPES`. Reads the shared `KleinFlipEvent` shape (NOT a local M1-specific string slot) — the 18.2 typed variant contract is the source of truth. 22.4 surfaces the variant kind, the lens transition, and the tick anchor.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-klein-flip-event-strip.tsx`; widget test asserts an M1TritoneCrossing event at tick 5→6 renders a gold glyph; M2CymaticValenceInvert event renders the secondary indigo glyph beneath; Hopf-flag icon inversion test asserts the icon flips on event arrival; data-test `m1-klein-event-strip-current-tick` is bound to `M1ProfileClockModel.tick12`; scroll test asserts horizontal scroll affordance when paused; filter test asserts variant subset filtering works; unexpected-flip test asserts a synthetic flip at tick 3→4 (not a tritone crossing) renders the `unexpected-flip` warning badge; contract preflight regen passes.

5. **22.5 — 7-8-9 spine reader at session close** *(doc-ahead-landing; consumes 19.6 / 19.7 / 19.9)*

   New widget `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-spine-789-reader.tsx` rendering the 7-8-9 spine completion arithmetic at session close per Tranche 19.9. **Surface placement contract:** the widget code lives in `m1-paramasiva` because the matheme of 7-8-9 is M1's closing arithmetic (the M1 ring's prime-index ground per `alpha_quaternionic_integration_across_M_stack.md` execution-order); but the widget MOUNTS inside the **OmniPanel Review tab** at session close (via the integrated-composition contract that the 4-5-0 plugin owns per 19.6 / 19.7 contemplation flow). View id `m1.paramasiva.spineReader789` is registered in `ALL_VIEW_IDS` + contract preflight but does NOT appear in `m1-paramasiva` editor-area body — Review-tab is where session-close reflection happens (15.0 Surface Contracts OmniPanel §"Review — human-required gate landings; never modals").

   Three vertically-stacked rows per 19.9 canonical reading:

   - **The 7 register row** (actional contraction, `8n − n`, harmonic-seventh `7/4 = (72 − 9)/36` revealed by 9-cancellation; `127 = 2^7 − 1 = M_7` as Mersenne-substrate ground): renders the canonical question *"Did the session's action-generator traverse all twelve positions (fifth-generator +7 mod 12 closure)?"* alongside the substrate readout `127 = 2^7 − 1 = M_7` and the closure indicator (lit if the session's M1 ring traversal closed; dim if it cut early)
   - **The 8 register row** (octave-field, return; `128 = 2^7` binary-closure; 8 explicate `audio_octet` positions): renders *"Did the session return through octave-closure rather than premature contraction?"* alongside `128 = 2^7` and the eight-`audio_octet` traversal indicator
   - **The 9 register row** (wholeness, epogdoon-extension `9/8`; `137 = 128 + 9`; 9 Parameśvara virtues at `VIRTUE_LUT[9]`): renders *"Did wholeness witness all nine virtue-poles, or did virtues go unwitnessed?"* alongside `137 = 128 + 9` and the 9-bit witness-vector visualisation

   The 9-bit witness vector renders as a 9-position pip-strip with each pip's virtue label on hover (read from the contemplation RPC's `M0VerifierReport.virtue_witness_vector` per 19.6 third position). Per-virtue witness scores aggregate into a single completion percentage.

   **Privacy contract:** reads aggregate witness-vector ONLY — no per-event journal correlation, no Graphiti episode reads, no protected-local journal payload. The widget's data binding is restricted to `M0VerifierReport.virtue_witness_vector` (9-bit) + `M0VerifierReport.coherence_score` (single scalar). The 19.6 contemplation flow handles the protected-local Q_composed trajectory upstream; 22.5 only reads the aggregate output.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-spine-789-reader.tsx`; widget test asserts the three rows render with correct canonical questions per 19.9; mock contemplation `virtue_witness_vector = 0b101101011` renders 6 lit + 3 dark pips with correct virtue labels (from the substrate `VIRTUE_LUT[9]` lifted via bridge); privacy audit asserts the widget never reads `journal_payload`, `graphiti_episode`, `q_composed_trajectory`, or any protected-local field (`! grep -n 'journal_payload\|graphiti_episode\|q_composed_trajectory\|protected_local' Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-spine-789-reader.tsx` passes); Review-tab mount integration test (via 19.7 contemplation flow) asserts the widget renders at session close in the OmniPanel Review tab, NOT in `m1-paramasiva` editor-area body.

6. **22.6 — Mersenne / 137 additive proof overlay** *(doc-ahead-landing; consumes 02.1 + 15.8; gated ide-deep + developer-mode)*

   Extend the 22.3 Cl(4,2) signature inspector body with a developer-mode `MersenneProofOverlay` sub-component (lives in same `.tsx` file or split as `src/browser/m1-mersenne-proof-overlay.tsx`). The overlay shows the additive proof structure per Tranche 02.1 synthesis paragraph and `alpha_quaternionic_integration_across_M_stack.md` execution-order:

   - Line 1: `M_5 = 2^5 − 1 = 31` (the prime-index of M_7) — annotation: *"prime-index of M_7 is itself a Mersenne prime; actional-Archetype-7 grounding at the Mersenne layer"*
   - Line 2: `M_7 = 2^7 − 1 = 127` (Mersenne ground exposed by 9-gap withdrawal `136 − 9 = 127`) — annotation: *"the additive substrate `64 + 72 = 136` minus 9-gap = 127 exposes the Mersenne prime"*
   - Line 3: `+1 → 128 = 2^7` (the parent-seal effecting binary closure of 127 into 128) — annotation: *"the M1-5 +1 parent — this is the +1 attribution operationally decisive per Tranche 02.1"*
   - Line 4: `+9 → 137` (atomic dressing; wholeness restored) — annotation: *"+9 restores wholeness — 137 is the atomically-dressed return"*

   Active line highlights based on which `AnandaSkeletonEvent` last fired on the profile bus (read via `bridge.onObservabilityEvent` filtered on event-kind):
   - `Additive137 = 4` lights line 4
   - `IdentityReturn4Plus2 = 5` lights line 3 (the `+1 → 128 = 2^7` parent-seal is the identity-return)
   - `KaprekarPedagogyHit = 6` lights line 2 (Kaprekar's archetype-7 binding sits at the Mersenne-7 row)
   - `Hit36`, `Hit64`, `Hit72`, `Ratio64Over36` (events 0–3) light the additive substrate sub-line above line 2

   **Gating:** the overlay renders ONLY when the active layout is `ide-deep` AND the preference `epi-logos.ui.developerMode` is true. On `daily-0-1` (lay-mode) the overlay is hidden — the matheme proof is developer-only and stays out of the user's primary surface. The preference is consumed through `@theia/core/lib/browser/preferences` PreferenceService.

   Verification: developer-mode toggle test asserts the overlay only renders when both `ide-deep` and `developerMode` are true; skeleton-event filter test asserts `Additive137` event lights line 4; `IdentityReturn4Plus2` lights line 3; `KaprekarPedagogyHit` lights line 2; line-by-line text content matches Tranche 02.1 synthesis paragraph verbatim (`grep -n "M_5 = 2\\^5\\|M_7 = 2\\^7\\|+1 → 128\\|+9 → 137" Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-mersenne-proof-overlay.tsx` matches all four).

7. **22.7 — Kaprekar 6174 inspector** *(doc-ahead-landing; cross-links 19.8 LEAN seed; does NOT reproduce)*

   New widget `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-kaprekar-inspector.tsx`. Minimal pedagogy-link surface. Renders a compact 4-line panel ONLY when the active tick lights the 7-row of `ANANDA_BIMBA` (per `Body/S/S0/epi-lib/src/m1.c:30` — the 7-row of the Bimba matrix is where `7X+0` raw face produces `0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77` and the `7² × 9 × 14` factorisation lives) OR when `AnandaSkeletonEvent::KaprekarPedagogyHit = 6` fires on the profile bus per Tranche 19.8 enum addition. The trigger is read from `M1ProfileClockModel.position6` matching the 7-row index plus the skeleton-event observability filter.

   Four lines:
   - Line 1: `6174 = 7² × 9 × 14 = 18 × 7³` (the factorisation per 19.8 LEAN seed)
   - Line 2: digits `{1, 4, 6, 7}` annotated as kernel-primitive names per 19.8: digit `1` = DIFF_B axiom (the `+1 mod 10` Ananda axiom delta); digit `4` = DIFF_A matrix idx (the fourth matrix family); digit `6` = six matrix families (the Ananda matrix-op enum cardinality); digit `7` = 7-row producing `16/9` (the `QL_DIVINE_ACT_RATIO 16/9` at m1.h:417-422 substrate)
   - Line 3: archetype-7 binding via `QL_DIVINE_ACT_RATIO 16/9` at `m1.h:417-422` (substrate citation; reads through bridge, no local fork)
   - Line 4: cross-link button **"Read the pedagogy seed"** — click action opens `Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md` in Canon Studio (`ide-deep` layout only via Theia command `canon-studio:openMarkdownFile`); on `daily-0-1` layout the cross-link renders as a tooltip with the file path

   **LEAN discipline per 19.8:** the widget does NOT carry the full four-register-law freight (Kaprekar 7-step / parent-as-7th / Cl(4,2)+2 / Möbius twist). That freight lives in `alpha_quaternionic_integration_across_M_stack.md` per 19.8 verification rule `grep -n "137 = 64 + 72 + 1\|four-register law" Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md` returns NO matches. The widget mirrors that discipline — the four-register-law strings must NOT appear in the widget src.

   Widget mounts inline within the Spanda walk navigator (22.1) when the trigger fires, rendered as a collapsible 4-line panel that the user can expand for more context.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-kaprekar-inspector.tsx`; widget test asserts the panel renders only when the 7-row trigger fires (synthetic `position6 = 4` matching the 7-row index produces the panel; `position6 = 0` does not); line 4 click test asserts navigation to `Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md` via Canon Studio command; LEAN audit `! grep -n "four-register law\|Möbius twist\|parent-as-7th\|Cl(4,2)+2" Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-kaprekar-inspector.tsx` returns no matches (freight stays out per 19.8 discipline); 7-row substrate citation test asserts the substrate citation `m1.h:417-422` renders correctly.

8. **22.8 — Vortex matrices browser** *(doc-ahead-landing + spec-ahead; consumes 10.10 + 15.8)*

   New widget `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-vortex-matrices-browser.tsx` plus view-model `Body/M/epi-theia/extensions/m1-paramasiva/src/common/vortex-matrices-model.ts`. New view id `m1.paramasiva.vortexMatricesBrowser` registered in `ALL_VIEW_IDS` + contract preflight.

   Surface elements:
   - **Six-tab selector** across the six matrix families:
     - Tab 0: `Bimba` (`#X+0` family; raw face `k*p`)
     - Tab 1: `Pratibimba` (`#X+1` family; raw face `k*p+1`)
     - Tab 2: `Sum` (`(#X+0) + (#X+1)` family; raw face `2*k*p + 1`)
     - Tab 3: `DiffA` (`(#X+0) − (#X+1)` family; raw face constant `−1`; DR face constant `9`)
     - Tab 4: `DiffB` (`(#X+1) − (#X+0)` family; raw face constant `+1`; DR face constant `1`)
     - Tab 5: `Quintessence` (sixth-family rule/tuple cells per ANANDA §4.3 `rule_value: Option<String>`)
     - Tab values read from `MathemeHarmonicProfile.ananda_vortex.active_matrix_op` (`AnandaMatrixOp` enum 0–5 per ARCHITECTURE.md §4.3); the active tab follows the profile-tick-driven family
   - **12×12 cell grid** for the selected family: rows = `tick12` (0–11); cols = `position6` (0–11 with shadow extension per CSV column 0-9 + shadow 10-11 per ARCHITECTURE.md §3.1); cell rendering depends on face-mode toggle:
     - **Digit-root face mode** (default): heatmap reading `MathemeHarmonicProfile.ananda_vortex.active_cell_value.dr_bimba` / `dr_pratibimba` / `dr_sum`; cells in DR-ring values `{1,2,4,8,7,5}` highlighted gold (Mahāmāyā streamline cells); cells in `{3,6,9}` highlighted emerald (Paraśakti streamline cells)
     - **Raw / no-DR face mode** (proof mode): cells render the `raw_value` / `raw_bimba` / `raw_pratibimba` / `raw_sum` from `AnandaVortexCell`; `7X+1` row 7 cells `p=5/p=9` highlight `36/64`; `8X+0` row 8 cells `p=8/p=9` highlight `64/72`; rule cells in Quintessence family render `rule_value` strings
   - **Face-mode toggle** at top: `[Digit-root face] [Raw / no-DR face]` — user toggle changes both this widget AND the played-torus 3D surface (15.8 raw proof overlay) via shared preference `epi-logos.m1.vortex.faceMode`
   - **Active cell highlight** follows `(M1ProfileClockModel.tick12, position6)` — the cell at the current profile-tick has a bright halo using the Cl(4,2) signature colour at the position
   - **Family-pinned indicator:** when user clicks a tab (NOT the auto-following-profile tab), the widget pins to that family and renders a small pin icon; pinning emits observability event `m1.vortex.family_pinned` with payload `{ pinned_op: AnandaMatrixOp, ts: emittedAt, source: 'user-selection' }`; the played-torus extension (22.2) subscribes and locks its perspex cross-fade to the pinned family
   - **Dual-matrix projection** (`dualOf(matrix_op): AnandaMatrixOp`): view-model adds the dual-mapping projection. NOT a local LUT — the mapping is built up by observing post-Klein-flip transitions of `active_matrix_op` on the profile bus; the view-model caches what flipped to what when `klein_flip_at_this_tick = true`. Initial mapping (before observations) reads from a single bridge call `bridge.invokeGatewayRpc('s2.relation.dual_matrix_pair.read')` per the typed S2 relation descriptor contract (Tranche 02.X). On Klein-flip event arrival (from 22.4 subscribing to `m1.klein_flip.source`), the widget visually cross-fades the active matrix tab to its dual; if the user-pinned matrix has a dual, the dual-pin appears as a secondary glow

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-vortex-matrices-browser.tsx`; `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/common/vortex-matrices-model.ts`; six-tab test asserts each family tab renders correctly; raw/DR toggle test asserts `7X+1 raw` row exposes `36, 64` in cells `(7, 5)` and `(7, 9)` AND `8X+0 raw` row exposes `64, 72` in cells `(8, 8)` and `(8, 9)`; DR-mode test asserts heatmap reads from `dr_*` fields with gold/emerald streamline cells highlighted; dual matrix test asserts Klein-flip event triggers cross-fade to dual family; observability test asserts `m1.vortex.family_pinned` event fires on user tab change with correct payload shape; substrate-derivation audit `! grep -nE 'ANANDA_BIMBA\s*=|ANANDA_PRATIBIMBA\s*=|DR_RING_MAHAMAYA\s*=|DR_RING_PARASHAKTI\s*=|"7X\+1"|"8X\+0"' Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-vortex-matrices-browser.tsx Body/M/epi-theia/extensions/m1-paramasiva/src/common/vortex-matrices-model.ts` passes (no local fork of substrate values).

9. **22.9 — Audio_octet / Nodal_quartet companion view body** *(code-pending-consumer; consumes 15.8 + Vimarśa-window contract)*

   Land the view body for the reserved view id `m1.paramasiva.audioBusInspector` (third entry in `ALL_VIEW_IDS` per `Body/M/epi-theia/extensions/m1-paramasiva/src/common/index.ts:11`). New widget `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-audio-bus-inspector-view.tsx`. The view id is already declared in contract preflight L194-196; 22.9 lands the body that fills it.

   Two sub-sections:

   - **`audio_octet[8]` table:** Eight rows, each showing position index (0..7), Hz value (from `MathemeHarmonicProfile.audio_octet[i]`), ratio role (from `MathemeHarmonicProfile.ratio_role` per position — the harmonic ratio role like `4/3`, `3/2`, `9/8`, etc.), and a `Vimarśa M2-1' authority` badge on every row carrying the citation `vimarsha_reading.rs:17-93` per `parashakti/vimarsha_reading.rs::vimarsha_read_profile`. Sortable by Hz / position / ratio role. Renders the **cymatic-source provenance** — every row carries the M2-1' source attribution, making explicit per UX §4 / M1'-SPEC §0/1 that M1' is the consumer and M2-1' is the writer.

   - **`nodal_quartet[4]` table:** Four rows, each showing nodal index (0..3), `m/n` ratio (from `MathemeNodalConstraint` per `kernel.rs:511`), constraint-kind (e.g. `cymatic_boundary`), and the cymatic boundary-condition role. Same Vimarśa-authority badge.

   - **Reads-only contract banner** at top: *"M1' is the consumer; M2-1' is the writer. To change a value, route through M2."* — explicit per UX §10 "no renderer-local source-of-truth". The banner reinforces the M1↔M2 boundary contract that ARCHITECTURE.md §7.1 names as load-bearing.

   The widget is rendered as the alternative body of `M1ParamasivaWidget` when the active view is `m1.paramasiva.audioBusInspector`. Uses Theia view-routing via `OPEN_COMMAND_ID + '?view=audioBusInspector'`. Reuses the existing `M1ParamasivaWidget` lifecycle (subscriptions to `onProfile`, `onReadiness`, `onCoordinateContext`) — no new widget class needed; the body is a sibling to `m1-paramasiva-extension-body.tsx` that the widget renders based on the active view id.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-audio-bus-inspector-view.tsx`; widget test asserts 8 + 4 rows render with Vimarśa badges (`grep -c 'data-test="m1-audio-octet-row"' rendered HTML returns 8; `grep -c 'data-test="m1-nodal-quartet-row"' returns 4`); Vimarśa-attribution test asserts every row has the `vimarsha_reading.rs:17-93` citation; reads-only contract banner test asserts the banner text matches the UX §10 wording exactly; substrate-derivation audit `! grep -n 'computeHz\|deriveOctet\|local_pitch\|synthesise' Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-audio-bus-inspector-view.tsx` passes; view-routing test asserts `OPEN_COMMAND_ID + '?view=audioBusInspector'` opens the body.

10. **22.10 — Standalone vs composed dispatch contract** *(spec-ahead-integration; cross-links 15.4 / 11.x / DR-WC-M1-1)*

    Author `Body/M/epi-theia/extensions/m1-paramasiva/src/common/surface-dispatch.ts` declaring the typed surface contract:

    ```ts
    export type M1SurfaceMode = 'standalone-ide-deep' | 'composed-cosmic-1-2-3' | 'compact-track-08';

    export interface M1SurfaceContext {
        readonly mode: M1SurfaceMode;
        readonly layoutId: 'daily-0-1' | 'ide-deep';
        readonly compositionPluginId?: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0';
        readonly activityBarMode?: 'coordinate-tree' | 'bimba-graph-viewer' | 'canon-studio' | 'backend-studio' | 'smart-connections';
    }

    export function selectM1Body(mode: M1SurfaceMode): React.ComponentType<M1ExtensionBodyProps>;
    ```

    The same `M1ProfileClockModel` drives all three modes; the dispatch logic chooses which view-body to render. Three sub-bodies registered in `selectM1Body`:

    - **`standalone-ide-deep` body** — composed of: existing `M1ParamasivaExtensionBody` 5-section layout + Spanda walk navigator (22.1) + Cl(4,2) signature inspector (22.3) + Klein-flip event-strip (22.4) + vortex matrices browser (22.8) + audio-bus inspector (22.9 conditional on active view). 22.5 spine reader does NOT mount here (Review-tab placement contract); 22.6 Mersenne overlay mounts inside 22.3 in this mode (gated developer-mode); 22.7 Kaprekar inspector mounts inside 22.1 when trigger fires.
    - **`composed-cosmic-1-2-3` body** — renders compact `M1WalkStrip` + `M1TopologyMiniView` (existing Track 08 exports from `TRACK_08_CONTRIBUTION.compactViews`) only; the played-torus 3D centrepiece (22.2 / 15.8 / 15.9) is the integrated-composition mount-point per 15.4 — `m1-paramasiva` does NOT render the played-torus visual here, it contributes the overlays.
    - **`compact-track-08` body** — `M1WalkStrip` + `M1TopologyMiniView` only (existing track-08 behaviour preserved for non-cosmic compositions like a hypothetical future M-only composition); identical to `composed-cosmic-1-2-3` minus the cosmic-specific cross-pole contributions.

    `M1ParamasivaExtensionBody` is refactored to accept `surfaceContext: M1SurfaceContext` as a new prop and route to `selectM1Body(surfaceContext.mode)`. `M1ParamasivaWidget` (the ReactWidget host) determines the mode from the active layout + composition plugin context read through the `SharedBridgeAdapter`'s coordinate context.

    **DR-WC-M1-1 resolution paragraph** (lands in `Body/M/epi-theia/extensions/m1-paramasiva/src/common/surface-dispatch.ts` as a top-of-file comment):

    > **DR-WC-M1-1 resolution (per 15.4 composition-pattern + 15.7 BimbaPratibimbaUiState):** kernel-bridge DI singleton owns the state tuple `(coordinate, lens, mode, profileGeneration, tick12, position6, active_matrix_op, k2_orientation_q)`. Both surfaces (composed cosmic-1-2-3 + standalone `ide-deep`) are pure views over this singleton. The Wave-C deep widgets (22.1 / 22.3 / 22.4 / 22.8 / 22.9) subscribe to the singleton through `SharedBridgeAdapter` and render purely from it. Mid-tick layout transitions preserve state because the singleton outlives any individual widget; widget mount in the new layout reads the current state and resumes rendering at that point. No state divergence is possible because both surfaces share the same data source. If a future surface needs surface-specific state (e.g. a "favourite matrix family" preference), it MUST be modelled as a typed sub-record of `BimbaPratibimbaUiState` (15.7 contract), not as widget-local React state.

    The DR-WC-M1-1 entry lands in `13-decision-register.md` with `status: ratified` referencing this paragraph and noting that no user final-validation is needed because 15.4 + 15.7 already cover the case at composition-pattern level.

    Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/common/surface-dispatch.ts`; typed dispatch test asserts `selectM1Body('standalone-ide-deep')` returns a body containing all 22.x deep widgets; `selectM1Body('composed-cosmic-1-2-3')` returns body with only `M1WalkStrip` + `M1TopologyMiniView` + cosmic cross-pole overlays; `selectM1Body('compact-track-08')` returns body with only the two track-08 exports; integration test mid-tick toggle `daily-0-1` (composed) → `ide-deep` (standalone) preserves `tick12`, `position6`, `active_matrix_op`, K² orientation across the layout switch (extends 22.13 / 11.6 acceptance harness); `grep -n 'DR-WC-M1-1' Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` returns the ratified entry.

11. **22.11 — Coordinate Tree M1 contribution** *(doc-ahead-landing; cross-links 15.3)*

    New typed contribution `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-coordinate-tree-contribution.ts` declaring the M1 sub-tree manifest consumed by the `ide-shell-m0-m5` Coordinate Tree widget (per 15.3 left-sidebar activity-bar). The contribution exposes M1's internal coordinate structure as walkable child nodes:

    ```ts
    export const M1_COORDINATE_TREE_CONTRIBUTION = Object.freeze({
        rootCoordinate: 'M1',
        children: Object.freeze([
            { coordinate: 'M1-0\'', label: 'Canonical Source (M1-0\')', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-0%27' },
            { coordinate: 'M1-1\'', label: 'Instance Manager (M1-1\')', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-1%27' },
            {
                coordinate: 'M1-2\'',
                label: 'Harmonic Engine — Ananda Vortex (M1-2\')',
                deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27&view=vortexMatricesBrowser',
                children: Object.freeze([
                    { coordinate: 'M1-2\'/Bimba', label: 'Bimba matrix family (#X+0)', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FBimba&view=vortexMatricesBrowser&family=0' },
                    { coordinate: 'M1-2\'/Pratibimba', label: 'Pratibimba matrix family (#X+1)', deepLink: '...family=1' },
                    { coordinate: 'M1-2\'/Sum', label: 'Sum matrix family', deepLink: '...family=2' },
                    { coordinate: 'M1-2\'/DiffA', label: 'DiffA matrix family', deepLink: '...family=3' },
                    { coordinate: 'M1-2\'/DiffB', label: 'DiffB matrix family', deepLink: '...family=4' },
                    { coordinate: 'M1-2\'/Quintessence', label: 'Quintessence (rule/tuple)', deepLink: '...family=5' }
                ])
            },
            {
                coordinate: 'M1-3\'',
                label: 'Spanda Core — 12-tick phase (M1-3\')',
                deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-3%27',
                children: Object.freeze(
                    Array.from({ length: 12 }, (_, t) => ({
                        coordinate: `M1-3'/tick-${t}`,
                        label: `Tick ${t} (${t * 30}° SO(3))`,
                        deepLink: `epi-logos://ide/m1-paramasiva/walk?coordinate=M1-3%27%2Ftick-${t}&scrubTo=${t}`
                    }))
                )
            },
            { coordinate: 'M1-4\'', label: 'QL Flowering — 84-state landscape (M1-4\')', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-4%27' },
            {
                coordinate: 'M1-5\'',
                label: 'Topology Analyzer — K² + Hopf (M1-5\')',
                deepLink: 'epi-logos://ide/m1-paramasiva-played-torus/k2',
                children: Object.freeze([
                    { coordinate: 'M1-5\'/TORUS_GENUS', label: 'TORUS_GENUS = 1', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-5%27%2FTORUS_GENUS' },
                    { coordinate: 'M1-5\'/DOUBLE_COVER_DEG', label: 'DOUBLE_COVER_DEG = 720', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-5%27%2FDOUBLE_COVER_DEG' },
                    { coordinate: 'M1-5\'/RING_QUATERNION_LUT', label: 'RING_QUATERNION_LUT[12]', deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-5%27%2FRING_QUATERNION_LUT' }
                ])
            }
        ])
    });
    ```

    The Coordinate Tree widget lives in `ide-shell-m0-m5` package, so this contribution is a manifest entry consumed by the host. The manifest format follows the existing `ide-shell-m0-m5` Coordinate Tree contribution API (declared in the host package's TypeScript types). 22.11 lands the M1 manifest; the host consumes it through Theia DI. Clicking a child node deep-links via `epi-logos://ide/m1-paramasiva/walk?coordinate=...` to the corresponding `m1-paramasiva` view body or `m1-paramasiva-played-torus` widget with the appropriate query parameters (active family, scrub-to-tick, view selector).

    Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-coordinate-tree-contribution.ts`; manifest test asserts 6 M1-X' strata + 6 matrix families + 12 ring positions + 3 M1-5' K² constants are declared; deep-link test asserts click on `M1-2'/Bimba` routes to `epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2'/Bimba&view=vortexMatricesBrowser&family=0` and opens the 22.8 vortex matrices browser pinned to Bimba family; Coordinate Tree host integration test (extends `ide-shell-m0-m5` tests) asserts the M1 sub-tree expansion works; deep-link for `M1-5'` routes to the `m1-paramasiva-played-torus` widget specifically (the 3D surface owns M1-5' visual).

12. **22.12 — Backend Studio M1 pack manifest** *(doc-ahead-landing; gated code-pending on Backend Studio extension per Wave-B TS-23 precedent)*

    New typed manifest `Body/M/epi-theia/extensions/m1-paramasiva/src/common/m1-backend-studio-pack.ts` declaring the curated M1 source pack that Backend Studio will consume when it lands (gated on the Backend Studio extension itself; per Wave-B TS-23 closing tranche 11.11 precedent):

    ```ts
    export interface BackendStudioSource {
        readonly path: string;
        readonly lsp: 'rust-analyzer' | 'clangd' | 'pylsp';
        readonly annotation: string;
        readonly readOnly: boolean;
    }

    export const M1_BACKEND_STUDIO_PACK = Object.freeze({
        packId: 'm1-paramasiva.backend-studio-pack',
        label: 'M1 Backend Pack — engine + harmonic profile + ring + Hopf + Vimarśa',
        owner: 'm1-paramasiva',
        sources: Object.freeze<readonly BackendStudioSource[]>([
            { path: 'Body/S/S0/epi-lib/include/m1.h', lsp: 'clangd', annotation: 'C header — RING_QUATERNION_LUT[12], CL42_BASIS[6], QL_TRIG_TABLE[6], DR_RING_MAHAMAYA[6], DR_RING_PARASHAKTI[6], ANANDA_RING_SIZE, SPANDA_SEED_BITS, TORUS_GENUS, DOUBLE_COVER_DEG, Ananda_Matrix_Op/Spanda_Stage parallel-track invariant at L735-756', readOnly: true },
            { path: 'Body/S/S0/epi-lib/src/m1.c', lsp: 'clangd', annotation: 'C source — six Ananda matrices .rodata (L22-114) + runtime API (L297-345)', readOnly: true },
            { path: 'Body/S/S0/portal-core/src/kernel.rs', lsp: 'rust-analyzer', annotation: 'MathemeHarmonicProfile struct (L346-465) + from_tick constructor', readOnly: true },
            { path: 'Body/S/S0/portal-core/src/hopf.rs', lsp: 'rust-analyzer', annotation: 'Hopf bundle S³ → S² → S¹ projection (hopf_project, hopf_fiber, hopf_tick12)', readOnly: true },
            { path: 'Body/S/S0/portal-core/src/quaternion.rs', lsp: 'rust-analyzer', annotation: 'SU(2) math — quat_mul, quat_normalize, quat_slerp, derive_walk_mode, derive_bifurcation', readOnly: true },
            { path: 'Body/S/S0/portal-core/src/spanda.rs', lsp: 'rust-analyzer', annotation: 'Spanda phase quantiser — quantize_to_spanda_substage(y, x), spanda_invert(stage)', readOnly: true },
            { path: 'Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs', lsp: 'rust-analyzer', annotation: 'Vimarśa M2-1\' writes audio_octet[8] + nodal_quartet[4] — READ-ONLY reference for M1\' (M1\' consumes; never writes)', readOnly: true },
            { path: 'Body/S/S0/portal-core/src/codon_rotation_projection.rs', lsp: 'rust-analyzer', annotation: 'M3 codon scale of Cl(4,2) — read-only reference for the four-scale Cl(4,2) identity (Tranche 02.7)', readOnly: true }
        ])
    });
    ```

    Manifest is a typed declaration. LSP wiring (rust-analyzer / clangd) is consumed by the Backend Studio extension when it lands. Per Wave-B TS-23 precedent, the manifest is annotated `gated-on-Backend-Studio` in `MIGRATION-SOURCES.md` `Forward extensions not yet scaffolded` section. Backend Studio's eventual implementation (when scaffolded) reads `M1_BACKEND_STUDIO_PACK` plus the analogous packs from M0, M2, M3, M4, M5 to render the activity-bar Backend Studio mode in `ide-deep` (per 15.0 Surface Contracts).

    Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/common/m1-backend-studio-pack.ts`; manifest test asserts 8 source entries with correct LSPs and readOnly flags; all paths in manifest exist on disk (`for p in $(jq -r '.sources[].path' < pack.json); do test -f "$p"; done` passes); gated-on marker test `grep -n 'M1_BACKEND_STUDIO_PACK\|m1-paramasiva.backend-studio-pack' Body/M/epi-theia/extensions/MIGRATION-SOURCES.md` returns the Backend-Studio gating annotation.

13. **22.13 — State persistence audit for M1' deep widgets** *(spec-ahead-integration; consumes 15.7 + 11.6)*

    Extend `Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs` with M1'-deep-widget-specific assertions mirroring 15.7 / 11.6 cross-layout state-identity test but specifically for the Wave-C widgets. The contract is `M1DeepWidgetUiState ⊆ BimbaPratibimbaUiState` (15.7 contract) — the per-widget state is a typed sub-record of the global state surfacing through `omnipanel-runtime` + `pratibimba-layouts`.

    New test cases added to topology.test.mjs:

    - `m1-deep-widget-walk-navigator-survives-toggle` — Spanda walk navigator (22.1) tick position + paused/playing state survives `daily-0-1` ⇄ `ide-deep` toggle. Synthetic setup: open M1 walk in `ide-deep`, scrub to tick 7, pause, toggle to `daily-0-1`, toggle back to `ide-deep`. Assert: tick is still 7, state is still paused.
    - `m1-deep-widget-cl42-inspector-survives-toggle` — Cl(4,2) signature inspector (22.3) active position + developer-mode toggle survives the toggle. Setup: active position 3, developer-mode enabled. Assert: position 3 highlight present after toggle round-trip; developer-mode still enabled.
    - `m1-deep-widget-klein-event-strip-survives-toggle` — Klein-flip event-strip (22.4) scroll position + filter (variant subset) survives. Setup: scroll to event 5 events back, filter to `M1TritoneCrossing` only. Assert: scroll position preserved; filter preserved.
    - `m1-deep-widget-vortex-browser-survives-toggle` — Vortex matrices browser (22.8) pinned family + raw/DR face mode survives. Setup: pin to `Pratibimba` family, set raw face mode. Assert: pin still `Pratibimba`; face mode still `raw`.
    - `m1-deep-widget-audio-bus-inspector-survives-toggle` — Audio bus inspector (22.9) active sub-section + sort order survives. Setup: `audio_octet[8]` sub-section, sort by Hz descending. Assert: same sub-section + sort order after toggle.
    - `m1-played-torus-orientation-survives-toggle` — Played-torus (22.2) K² orientation mid-slerp survives. Cross-validates ARCHITECTURE.md §8.5 contract independently. Setup: profile mid-slerp at `tick12=3.5` (interpolated). Assert: K² orientation quaternion ≈ identical (within fp tolerance) after toggle round-trip.

    Each test reads / writes through the kernel-bridge DI singleton (15.7 `BimbaPratibimbaUiState`) per the singleton contract at `pratibimba-layouts/src/common/layout-types.ts:7-12`. The tests are purely UI-state assertions; they do NOT drive the underlying `MathemeHarmonicProfile` (the bridge's stable mock profile drives the tests deterministically).

    Verification: `pnpm --filter @pratibimba/acceptance-harness test` runs the new test cases and passes; documented test names appear in test output; `grep -n 'm1-deep-widget-walk-navigator-survives-toggle\|m1-deep-widget-cl42-inspector-survives-toggle\|m1-deep-widget-klein-event-strip-survives-toggle\|m1-deep-widget-vortex-browser-survives-toggle\|m1-deep-widget-audio-bus-inspector-survives-toggle\|m1-played-torus-orientation-survives-toggle' Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs` returns six matches.

## Track 15 / Track 19 / Track 02 Cross-References

Track 15 (UI Design Foundations) is the parent authority for the played-torus visual rendering (15.8) and tick choreography (15.9) — Track 22 cross-links but never reproduces. Track 22's 22.2 scaffold consumes 15.8 / 15.9 for the renderer engine; 22.4 Klein-flip event-strip consumes 15.9's Klein-flip tick 5→6 contract; 22.8 vortex matrices browser consumes 15.8's perspex cross-fade + raw/DR proof overlay; 22.9 audio-bus inspector consumes 15.8's 8 particle emitter + 4 satellite glyph Vimarśa-window contract. Track 22 widgets re-render on profile-tick advance per 15.6 global UI clock; Track 22 widget state persists across layout toggle per 15.7 BimbaPratibimbaUiState (22.13 audit). Track 22 widgets render readiness inline per 15.6 (no separate errors panel) — every Wave-C widget exposes `pending-*` badges for missing profile fields.

Track 19 (Contemplation Surface Integration) owns the 7-8-9 spine + Mersenne pedagogy at 19.9 — Track 22's 22.5 surfaces the spine reading at session close in the OmniPanel Review tab consuming the 19.6 contemplation RPC + 19.9 virtue_witness_vector contract. Track 22's 22.6 Mersenne / 137 additive proof overlay is the matheme proof structure made visible in developer-mode (gated `ide-deep`); per Tranche 02.1 synthesis paragraph. Track 22's 22.7 Kaprekar 6174 inspector cross-links Tranche 19.8's LEAN seed without reproducing its treatment — the seed at `Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md` is the authority; 22.7 is the link surface.

Track 02 (M1 Paramaśiva Reconciliation, the substrate-side cycle-3 tranche) is the substrate-side counterpart to Track 22's frontend-side. 02.1 (CONTRADICTION-decision residual M0-witness wording) is what 22.6 surfaces as the developer-mode Mersenne proof overlay reading the corrected `M1-5 +1 parent` attribution. 02.2 (klein_flip field on MathemeHarmonicProfile) lands the substrate that 22.4 Klein-flip event-strip consumes. 02.3 (m1.paramasiva.kleinTopology view wiring) is the topology renderer that 22.4 sits alongside (22.4 is event-strip; 02.3 is topology slot rendering). 02.4 (kernel_bridge_runtime::m1_performance_event_from_profile) lands the replay path that Track 22 widgets all consume through the bridge. 02.5 (# Inversion_Operator carrier) is the substrate that 22.1 Spanda walk navigator's `#` button consumes. 02.6 (K² played-torus first-build under DR-M1-2) is the parent ratification for Track 22's 22.2 scaffold first-build. 02.7 (four-scale Cl(4,2) audit) is the substrate audit; 22.3 Cl(4,2) signature inspector consumes its outcome at view level. 02.9 (M1-2 Ananda Vortex architecture landing) is the M1-2 ARCHITECTURE.md landing that 22.8 vortex matrices browser consumes.

Tracks 10 (kernel-bridge), 11 (Theia shell), 18 (typed kernel-bridge JSON edge) own the bridge / shell / JSON contracts that Track 22 consumes through `SharedBridgeAdapter`. Track 12 (agentic-layer) owns the Pi / Anima / Aletheia dispatch tree that the OmniPanel surfaces — Track 22 does not contribute to OmniPanel except via 22.5 spine reader's Review-tab placement.

## Anti-Greenfield Posture

All Track 22 work either:

- **Consumes Theia platform conventions** — `AbstractViewContribution`, `ReactWidget`, `@postConstruct`, `ContainerModule`, `WidgetFactory`, `bindViewContribution`, `parseExtensionRoute`, `registerIntentTarget`, `PreferenceService` (22.6 developer-mode gating), Theia DI for the kernel-bridge singleton
- **Extends landed `m1-paramasiva` extension** — 22.1, 22.3, 22.4, 22.7, 22.8, 22.9, 22.10, 22.11, 22.12, 22.13 all add files under `Body/M/epi-theia/extensions/m1-paramasiva/src/` or extend existing files (`src/common/index.ts` ALL_VIEW_IDS additions; `src/common/clock-instrument.ts` `M1ProfileClockModel` extensions for `tick_projection`)
- **Consumes existing SharedBridgeAdapter contract** — every widget subscribes via `bridge.onProfile`, `bridge.onReadiness`, `bridge.onCoordinateContext`, `bridge.onObservabilityEvent` per 07-t0 sharedBridgeAdapter; no widget imports `Body/S/S0`, `portal-core`, `neo4j-driver`, `redis`, `@clockworklabs/spacetimedb-sdk` directly (Wave-B 11.5 forbidden-import lint enforces)
- **Consumes 15.8 / 15.9 / 19.x / 02.x as authority** — Track 22 cross-links, never reproduces
- **First-builds against M' product surface owners** — 22.2 played-torus scaffold is the only first-build, and it is DR-M1-2 ratified (Wave-A 2.6 ratification + Track 15 dependency); the renderer engine inside the scaffold (15.8 / 15.9) is NOT first-built by Track 22

No greenfield UI framework. No competing widget shell. No local fork of substrate values (`CL42_BASIS`, `RING_QUATERNION_LUT`, `DR_RING_MAHAMAYA`, `DR_RING_PARASHAKTI`, `QL_TRIG_TABLE`, `ANANDA_BIMBA`, `ANANDA_PRATIBIMBA` etc. — every Wave-C widget reads through the bridge). No local pitch synthesis (UX §10; ARCHITECTURE.md §9.4 forbidden list). No local clock (15.6 + UX §10). No graph-relation inference (UX §10).

The two extensions (`m1-paramasiva` 2D React + `m1-paramasiva-played-torus` 3D Bevy/wgpu) become what they always wanted to be: the inspector / instrument / standalone surface; and the played topology / cosmic-1-2-3 centrepiece. Track 22 is the design that lets them cohere as one M1' frontend deep surface.
