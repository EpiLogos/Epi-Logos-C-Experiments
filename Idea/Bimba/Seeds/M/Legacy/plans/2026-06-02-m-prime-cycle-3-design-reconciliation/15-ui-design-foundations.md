# Track 15 — UI Design Foundations

> **⚑ ONTOLOGY SUPERSEDED (2026-07-11, DR-FACE-7)** — The widget/registration framing
> below is the dead Theia paradigm. Before executing ANY tranche in this file, read
> [[M'-ENGINE-FACES-ONTOLOGY-2026-07-11]] and enter its frame: the carrier is one
> playing organism (two poles — 1-2-3 cosmic instrument, 4-5-0 lived return — over
> one kernel spine); the unit is the stateless **face**, not the widget. Sort every
> tranche through the ontology §2 fate algorithm (carried-by-integration / face-gap /
> spine-gap) and close per fate. The CONTENT-LAW below (data shapes, field lists,
> pedagogy contracts, privacy rules) remains binding; the Theia nouns (WidgetFactory,
> frontend-module, contributions, shell slots, "exactly six" chrome enumerations) do not.


<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Cycle 3 routed the substrate cleanly but said nothing about how the system shows up to the user. That silence is what drove the ACR-vs-OmniPanel confusion: real substrate (run-model, tool-stream, dispatch traces) was built without a UI grammar that knew where it belonged. This tranche grounds the cycle in foundational UI principles, anchors them in the Theia substrate the project has already chosen, and names how each load-bearing surface (cosmic-1-2-3, personal-4-5-0, ide-deep, OmniPanel, left-sidebar-system) consumes those principles.

The OmniPanel is the load-bearing reframe: it is the agentic sidebar — a persistent right-side panel that hosts Pi as the conversational membrane, surfaces session continuity, shows dispatch genealogy, and exposes the gateway state. It is the `/` operator as a UI surface. The repurposed-ACR substrate (Tranche 12.14) becomes the OmniPanel's underlying content model, NOT a standalone extension.

## Foundation Principles (binding)

These are not preferences. They are the contract every M' surface honors.

1. **Coordinate as primary navigation.** Every surface roots in a coordinate. The active coordinate is global state; every sidebar reads it; every URL / deep-link encodes it.

2. **Profile-tick as primary clock.** Widgets re-render on `MathemeHarmonicProfile` tick advance, not user input. The system is alive whether you touch it or not. The kernel-bridge profile-tick event (Tranche 10) IS the UI clock.

3. **Provenance always visible.** Every datum shows its readiness state — `ready` / `pending-*` / `blocked`. The kernel-bridge readiness ledger (Tranche 10) IS the foundation. UI surfaces it inline as border colour, pending badge, blocked-overlay — never as a separate "errors" panel.

4. **Bimba / Pratibimba as UI dial.** The 0/1 toggle is a face switch, not an app switch. Same data, opposite presentation. The persistence of state across the toggle is the contract. Coordinate, lens, mode, session, day-now all survive the inversion.

5. **OmniPanel as `/` operator membrane.** Pi's voice. Sessions. Dispatch genealogy. Review gates. Capability-list. Persistent identical across layouts. No modals.

6. **Composition over juxtaposition.** Integrated plugins (`1-2-3` cosmic, `4-5-0` personal) compose three M-extensions into one coherent surface — never three side-by-side widgets. Three-pane juxtaposition is the antipattern.

7. **Activity-bar discipline.** Left-sidebar modes are activity-bar-switched (Theia's `widget.application-shell-left` slot), not stacked. The "thousand panels" trap kills lived IDE use.

8. **Theia conventions where they fit.** Status bar, breadcrumbs, command palette, keybinding chords, contributions — consume the platform. Don't reinvent what Theia gives free.

9. **Day-now as ambient thread.** The day-now / session anchor at `Idea/Empty/Present/{day_id}/` (DR-M4-1 ratified) is a thread surfaces read; it doesn't own UI real estate. Status bar surfaces it; widgets consume it; no widget owns it.

## Surface Contracts

### Cosmic-side of `daily-0-1` (integrated 1-2-3)

- **Editor area:** integrated 1-2-3 composition rendering — the played K² 3D torus (`m1-paramasiva-played-torus`, Bevy/wgpu per DR-M1-2) holds the lens-ring; M2 cymatic engine renders frequencies on its surface; M3 codon-rotation projects onto the lens-ring cells. One surface, three poles, one composition driven by profile-tick.
- **Left sidebar (activity-bar):** Coordinate Tree · Bimba Graph Viewer (one-substrate/three-rendering, solar anchor) · Canon Studio
- **Right sidebar:** OmniPanel (consistent across layouts)
- **Bottom:** profile-tick status, readiness ledger summary, day-now anchor

### Personal-side of `daily-0-1` (integrated 4-5-0)

- **Editor area:** integrated 4-5-0 composition — Nara journal at left composition slot, personal cymatic field (Hopf-linked tori at personal scale, M4 psychoid renderer) at center, Mahamaya recognition layer (M3 codon at personal scale via Q_composed) at right composition slot. Same composition principle.
- **Left sidebar (activity-bar):** Day Calendar (Empty/Present nav) · Journal Entries · Personal Coordinate (Q_personal current state)
- **Right sidebar:** OmniPanel (identical content, identical session as cosmic-side)
- **Bottom:** same status bar (state persists across toggle per DR-TS-1)

### `ide-deep` (the 4+2 depth)

- **Editor area:** active Mn extension widget (single pole at a time — m0-anuttara reader, m1-paramasiva instrument, m2-parashakti cymatic engine, m3-mahamaya wheel, m4-nara journal/identity, m5-epii agentic IDE)
- **Left sidebar (activity-bar):** Coordinate Tree · Bimba Graph Viewer · Canon Studio · Backend Studio · Smart Connections
- **Right sidebar:** OmniPanel (identical)
- **Bottom:** evidence pane · review pane · autoresearch pane · kernel-bridge readiness panel

### OmniPanel (`/` operator membrane)

The right sidebar. Persistent across all layouts. Tabs (consume `OMNIPANEL_TABS.availableInLayouts`):

- **Pi Chat** — agentic conversation; canonical agentic surface; capability-aware
- **Sessions** — session manager (start, resume, switch); maps to `agent:epii:main` and siblings
- **Dispatch Trace** — Pi → Anima → subagent invocation tree; the repurposed `RUN_TREE` widget
- **Tool Stream** — what subagents called what tools; the repurposed `TOOL_STREAM` widget
- **Evidence** — `MediatedRunEvidencePacket` view; the repurposed `EVIDENCE_DEPOSITION` widget
- **Review** — human-required gate landings; the repurposed `REVIEW_DECISION` widget; never modals
- **Gateway** — `s4'.mediation.capabilities.list` + capability-parity check + readiness
- **Diagnostics** — `kernel-bridge-readiness` summary, profile-field pending markers

### Left-sidebar-system (the bimba / canonical face)

Activity-bar-switched. Same slots in both layouts; what populates each slot scales to depth needs.

- **Coordinate Tree** — every surface roots here; the tree IS the navigation backbone
- **Bimba Graph Viewer** — visual graph; `ide-deep` enables full 4+2 lattice view; `daily-0-1` shows solar-anchor view only
- **Canon Studio** — markdown editor with QL/bimba decoration + Smart Connections autocomplete via `s1'.semantic.*`
- **Backend Studio** (`ide-deep` only) — LSP contributions (rust-analyzer, clangd, pylsp); navigates `epi-lib`, `portal-core`, S1–S5 cores
- **Smart Connections** (`ide-deep` only) — `s1'.semantic.*` surface

## Tranches

1. **15.1 — Foundation principles registry** *(doc-ahead-landing)*

   Author `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md` enumerating the nine principles above as binding contracts. Every M-extension package.json references it via `contributes.uiFoundationPrincipleAdherence: true`.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md`; package-json validator extended to require the principle-adherence flag for any extension contributing to `widget.application-shell-{left,right,bottom}`.

2. **15.2 — OmniPanel architecture as agentic membrane** *(spec-ahead-integration; consolidates Tranche 12.14)*

   Reframe `omnipanel-shell` extension as the agentic sidebar housing. Author the OmniPanel content model from the repurposed ACR substrate: `run-model.ts` → `omnipanel-runtime.ts`; ACR widgets → OmniPanel tabs (Pi Chat, Sessions, Dispatch Trace, Tool Stream, Evidence, Review, Gateway, Diagnostics). Sessions persist across `daily-0-1` ↔ `ide-deep` toggle. No modal review surfaces — Review tab is the landing surface.

   Verification: `test -d Body/M/epi-theia/extensions/omnipanel-shell`; `grep -n 'omnipanel-runtime\|PiChat\|DispatchTrace' Body/M/epi-theia/extensions/omnipanel-shell/src/`; session-continuity test asserts session id and capability list survive the 0/1 ↔ 4+2 transitions.

   > **⚑ FATE-SORTED (2026-07-12, DR-FACE-7): carried-by-integration — law landed as 27.T27.0; the one unproven clause UF-proven by 15.T15.2.** Sort rationale: not face-gap (the membrane content model already exists on the rerun carrier: `Body/M/pratibimba-app/src/panes/omni/omnipanelRuntime.ts` carries the canonical 8-fold `OMNIPANEL_TABS` manifest — Pi Chat/Sessions/Dispatch/Tools/Evidence/Review/Gateway/Diagnostics, DR-WC-OP-1 collapse — plus the repurposed run-model type-graph `ActorIdentity`/`DispatchRoute`/`RunStatus`/`RunTreeNode`/`ToolStreamEvent`/`ReviewDecision`/`ReviewTransition`, i.e. the `run-model.ts → omnipanel-runtime.ts` reframe verbatim in carrier form); not spine-gap (App.tsx derives ONE `OMNI_BORDER` from the manifest and mounts it on BOTH faces, per this tranche's "identical on both layouts" law; Review is a border tab, never a modal — the no-modal clause holds structurally). The `omnipanel-shell` extension itself is FROZEN with epi-theia (CHARTER); the carrier translation IS the reframe. **The proof this close adds:** `Body/M/pratibimba-app/tests/e2e/session-continuity.spec.ts` — a REAL gateway session record (`sessions.import` over the raw wire via the extracted house helper `tests/e2e/gateway-rpc.ts`), bound at the rendered surface, proven to survive the carrier's `daily-0-1` ↔ `ide-deep` transition (the ⌘. 0/1 face toggle) in BOTH directions at the real surface: exact status-strip identity string unchanged, and each face's OWN SessionsPane instance (two flexlayout models, two pane instances over the module-scope zustand session store) shows the same `session-bound` record. Follows the 15.12 suite-order determinism law (border-tab analogue of `ensureTabSelected`; pinned unique session target; passes in FULL-SUITE order — 23/23 — and isolation). **Capability-list gap, honestly named:** 15.2's "capability list survives" clause has NO real UI surface yet — the Gateway fold (designated surface for `s4'.mediation.capabilities.list` + parity) is `landed: false` in the manifest (body = 27.7's lane) and the pi-permitted matrix is 12.10's (`isMediationCapabilityAllowed` takes a caller-supplied permit list; no hidden registry). The spec asserts what IS real on both faces: the 8-fold border manifest + the Gateway fold's honest pending body (`pending-tranche-27.7`) reading identically across the toggle; it fabricates no capability list. When 27.7/12.10 land, extend the spec's `assertCapabilitySurface` to read the real list.

3. **15.3 — Left-sidebar activity-bar system** *(spec-ahead-integration)*

   Wire activity-bar mode-switching for the left sidebar across both layouts. Modes for `daily-0-1`: Coordinate Tree · Bimba Graph Viewer · Canon Studio. Modes for `ide-deep`: add Backend Studio + Smart Connections. Theia's activity-bar contribution is the consumption path; no parallel widget shell.

   Verification: `pnpm --filter @pratibimba/pratibimba-layouts test` asserts activity-bar registers exactly the named modes per layout; cross-layout state-identity preserves active activity-bar mode where the mode exists in both.

4. **15.4 — Editor-area composition pattern for integrated plugins** *(spec-ahead-integration; cross-link to Tranches 07, 08)*

   Author `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-pattern.md` documenting the composition-over-juxtaposition contract: integrated plugins compose three M-extensions into one editor surface, never three side-by-side panes. Geometric composition (cosmic 1-2-3 over the K² torus; personal 4-5-0 over the psychoid field) is normative. Subagent research (Tranche 15.8) feeds the M1-2 ananda vortex composition specifics.

   Verification: `grep -rn 'composition-pattern\|composition-contract' Body/M/epi-theia/extensions/plugin-integrated-{1-2-3,4-5-0}/src/`; integrated-composition contract test asserts side-by-side widget contributions are rejected at composition load.

5. **15.5 — 0/1 toggle gesture + lemniscate transition** *(no-orphan-fill; new affordance)*

   Implement the cosmic ↔ personal toggle in `daily-0-1`:
   - Keystroke: `cmd-period` (honours `.` as nesting operator — the toggle nests one face into the other)
   - Title-bar affordance: small coin-flip icon at the layout chrome
   - Transition: lemniscate animation — cosmic composition folds inward; personal composition emerges from the same fold. The `#` operator made visible as UI.
   - State preservation: coordinate, lens, mode, session, day-now ALL survive the toggle (per DR-TS-1 ratification).

   Verification: integration test asserts `cmd-period` triggers the toggle; visual-regression test confirms the lemniscate transition primitive; state-preservation test asserts six globals survive.

6. **15.6 — Profile-tick clock + readiness inline rendering** *(spec-ahead-integration; consumes Tranche 10)*

   Wire `MathemeHarmonicProfile` tick-advance event as the global UI clock. Every widget subscribes via the kernel-bridge profile subscription. Readiness state from the kernel-bridge readiness ledger renders inline on every data binding (border colour, pending badge, blocked overlay). No separate "errors" panel — provenance lives where the datum lives.

   Verification: `grep -rn 'subscribeToProfileTick\|onProfileAdvance' Body/M/epi-theia/extensions/`; profile-tick-driven render test asserts widget re-renders on tick advance with stable input; provenance-state inline rendering test passes for each readiness class.

7. **15.7 — Bimba/Pratibimba state-persistence across toggle** *(spec-ahead-integration; consumes DR-TS-1)*

   Define and enforce the state contract that survives the 0/1 toggle and the `daily-0-1` ↔ `ide-deep` layout switch: `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)` plus active OmniPanel tab plus active activity-bar mode. The kernel-bridge DI singleton (per `layout-types.ts:7-12`) IS this contract; surface it in `omnipanel-runtime` + `pratibimba-layouts` as a typed `BimbaPratibimbaUiState`.

   Verification: extension of `acceptance-harness/tests/topology.test.mjs` asserts every named state field survives both the 0/1 toggle AND the layout switch.

8. **15.8 — M1-2 ananda vortex visual rendering on K²** *(spec-ahead-integration; canonical contract at `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §5; IDE contract at `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md`; full evidence at `plan.runs/15-m1-2-ananda-vortex-research.md`)*

   The Bevy/wgpu `m1-paramasiva-played-torus` extension (DR-M1-2 ratified; build pending — directory does not yet exist) renders the **six canonical Ananda matrix families** from the Vortex Modulae CSV as a load-bearing component of the cosmic-1-2-3 composition surface. Each family has a raw/no-digi-root affine face and a digit-root recursive face. Current `Body/S/S0/epi-lib/src/m1.c:22-114` stores the digit-root face for the primary families; Tranche 10.10 must surface both faces through `ananda_vortex.active_cell_value` before the renderer claims full fidelity. Concrete visual contract:

   - **K² as the texture surface** carrying the active Ananda family as a 12×12 dual-register heatmap. Chromatic-longitude U = `position6`; fifths-meridian V = `tick12`. One luminous cell jumps per tick.
   - **Six matrices stacked as a perspex cross-fade** keyed off `Ananda_Matrix_Op` (0-5 per `m1.h:735-756` Spanda↔Ananda parallel-track invariant). Each matrix is a glass layer; the active one is opaque, the others are translucent.
   - **Raw/DR proof overlay**: default colour/intensity reads the digit-root face, while developer/proof mode overlays raw affine values from `AnandaVortexCell`. The renderer must show `7X+1` p=5/p=9 as `36/64 -> 16/9` and `8X+0` p=8/p=9 as `64/72`; `64+72+1=137` appears only when the profile's skeleton event says `Additive137`.
   - **The two DR rings rendered as flow-streamlines on the torus surface**: `DR_RING_MAHAMAYA = {1,2,4,8,7,5}` (doubling) in gold ascending half; `DR_RING_PARASHAKTI = {3,6,9,3,6,9}` (tripling) in emerald descending half. The vortex literally *moves* as two diagonal sweeps — the substrate at `m1.c:122-123` IS the streamline data.
   - **Cl(4,2) signature as colour-binary**: P0/P5 (sin/cos, signature -1) cool indigo halos; P1-P4 (tan/sec/cot/csc, +1) warm amber-vermilion. The +2 net signature becomes the over-cycle colour balance.
   - **Reads-only contract**: the vortex matrices/families are backend/profile facts; the renderer never mutates and never recomputes raw affine or digit-root values locally. Heatmap state derives entirely from `(tick12, position6, lens_mode, Ananda_Matrix_Op, AnandaVortexCell)`.

   Verification: `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus`; `grep -rn 'ANANDA_BIMBA\|ANANDA_PRATIBIMBA\|DR_RING_MAHAMAYA\|DR_RING_PARASHAKTI' Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/`; render-test asserts active-matrix heatmap binds to `Ananda_Matrix_Op`; proof-overlay test asserts `36/64`, `64/72`, and `64+72+1` are displayed only from `AnandaVortexCell`; flow-streamline test asserts gold/emerald rings advance with tick.

9. **15.9 — Tick choreography across the six matrices** *(spec-ahead-integration; canonical contract at `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §6; depends on 15.8 and 10.10)*

   The profile-tick crosses six matrix families simultaneously: `CL42_BASIS[6]` · `RING_QUATERNION_LUT[12]` · `QL_TRIG_TABLE[6]` · the six raw+digit-root Ananda vortex families · `audio_octet[8]` · `nodal_quartet[4]`. **Single animation primitive carries the tick honestly**: `quat_slerp` of K² orientation across `RING_QUATERNION_LUT[12]` (`m1.h:493-523, 551-564`). One full 360° SO(3) revolution per 12 ticks; Hopf-fibre flag flips at tick 5→6 (Klein crossing; cross-link Tranche 02.2 `klein_flip` field landing); second 360° returns identity at tick 11→0 — the 720° SU(2) recognition (the `DOUBLE_COVER_DEG=720` invariant becomes visible).

   > **⚑ ANCHOR-CONSUMING (2026-07-11, DR-M1-5)** — the slerp primitive stands; its phase input is now the kernel-owned `SpandaPhaseAnchor` evaluated locally (one clock read at any grain), never a renderer-invented animation variable. The "scrub capability added through 15.9" rider is superseded: transport is the `m1.spanda.*` walk family per [[M1-3-SPANDA-TRANSPORT-ARCHITECTURE]].

   Every other surface element derives from or rides on the slerp:
   - Luminous Ananda cell jumps on each tick advance (Tranche 15.8)
   - Gold/emerald DR streamlines advance one position per tick
   - Cl(4,2) signature halos recolour as `position6` cycles
   - Hopf-shadow phase tracks the slerp's S² projection
   - Audio_octet[8] particle emitters fire at their indexed frequencies (windows onto M2-1' Vimarśa writes — never re-derived locally, see 02.X update)
   - Nodal_quartet[4] satellites orbit the four nodal stress-points

   At tick 5→6 the Klein-flip event fires on the profile bus (Tranche 02.2 landing); M2' cymatic surface subscribes (`M1'-SPEC.md:108`). UI choreography honors the event: Hopf-fibre flag flips visibly, the K² orientation transitions through its dimensional self-crossing, and the active Ananda matrix may cross-fade to its dual (`BIMBA ↔ PRATIBIMBA`) if the lens crossing aligns with `Ananda_Matrix_Op` advance.

   Verification: profile-tick replay test produces deterministic visual state at any given `(tick12, degree720, lens_mode, Ananda_Matrix_Op)`; slerp-as-single-primitive audit confirms no parallel animation timer competes; Klein-flip test asserts tick 5→6 fires the bus event AND the visual flag flip; accessibility test allows pause/scrub of the tick for slow inspection.

10. **15.10 — Status bar discipline** *(doc-ahead-landing)*

    Status bar surfaces: profile-tick state, day-now anchor, session id, gateway readiness, profile generation, active coordinate. Nothing else. No widget owns the day-now / session anchor — they consume it from the status bar's state thread. Day-now anchor follows the DR-M4-1 path `Idea/Empty/Present/{day_id}/`.

    Verification: `grep -rn 'statusBarEntry\|StatusBarContribution' Body/M/epi-theia/extensions/`; status-bar contribution audit confirms exactly the named six entries; no widget reads day-now / session except via the status-bar state thread.

11. **15.11 — Dispatch genealogy as a first-class UI primitive** *(spec-ahead-integration; consumes Tranche 12.1)*

    The OmniPanel Dispatch Trace and Tool Stream tabs render Pi → Anima → subagent invocation trees with provenance, timing, and capability gates. Same data folded differently in each tab (Trace is the tree; Stream is the time-ordered event list). Selectable nodes deep-link to evidence (Evidence tab) and to source (Backend Studio in `ide-deep`).

    Verification: integration test asserts a synthetic Pi → Anima → Moirai dispatch renders correctly in both tabs with consistent ids; click-through from Trace → Evidence → Source works in `ide-deep`.

    > **⚑ FATE-SORTED (2026-07-12, DR-FACE-7): face-gap — primitive landed on the rerun carrier.** Sort rationale: not carried-by-integration (the carrier's Dispatch tab is the honest pending pane and `LogsPane` folds the raw gateway ring, not genealogy); not spine-gap (the data contract types cleanly from the landed 27.T27.0 run-model type-graph — `RunTreeNode`/`ToolStreamEvent`/`ActorIdentity`/`DispatchRoute` in `src/panes/omni/omnipanelRuntime.ts` — and `s4'.mediation.route`/`s4'.mediation.capabilities.list` are registered gateway methods). The PRIMITIVE law is closed as `Body/M/pratibimba-app/src/panes/omni/dispatchGenealogy.ts` (one flat `DispatchGenealogyRecord` dataset — provenance, timing, capability-gate outcome; pure structural fold → `RunTreeNode` trees; pure temporal fold → `DispatchStreamEvent` rows carrying the SAME node ids) + the two reusable foldings `DispatchGenealogyTree.tsx` / `DispatchGenealogyStream.tsx` + the synthetic Pi → Anima → Moirai fixture proof (`dispatchGenealogy.fixture.ts`; both foldings render with consistent ids, selection + deep-link descriptors to `omniEvidence`/`backendStudio` per CHROME-CONTRACT §2). Remaining lanes, honestly named: **27.3** owns mounting the Dispatch tab body (fold the live track-12 `s4'.mediation.*`/ta-onta feed into records; `omniDispatchTrace` stays `pending-fold`); **27.4** owns composing the stream folding into the Tools tab; the wire→record producer is track-12's data seam; Trace → Evidence → Source click-through *routing* rides 28.14's intent registration (the descriptors exist).

12. **15.12 — Visual-regression harness for the 0/1 toggle + tick choreography** *(spec-ahead-integration)*

    Extend `acceptance-harness` with a visual-regression suite covering: the lemniscate transition (15.5), the tick choreography across the six matrices (15.9), the integrated 1-2-3 composition (15.4 + 07), the integrated 4-5-0 composition (15.4 + 08). Frame-by-frame baselines stored in `acceptance-harness/fixtures/visual-regression/`.

    Track 44.9 extends this G7/G8 closure through the [[m5-prime-pratibimba-surface-standard]]: `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md` now carries the Surface-Standard section, and `acceptance-harness/fixtures/visual-regression/block-host-widget/` commits the `BlockHostWidget` baseline family.

    Verification: `pnpm --filter @pratibimba/acceptance-harness test:visual` passes; baseline images committed; diff threshold documented.

    > **⚑ FATE-SORTED (2026-07-12, DR-FACE-7): face-gap — harness built on the rerun carrier.** Sort rationale: not carried-by-integration (no visual-regression capture existed anywhere in the carrier — zero `toHaveScreenshot` before this tranche); not spine-gap (everything the harness observes is landed: the 0/1 faces, the engine's §8.8 pause/scrub ring, both compositions). The carrier equivalent of the frozen `acceptance-harness` is the app's own Playwright e2e suite: `Body/M/pratibimba-app/tests/e2e/visual-regression.spec.ts` + committed baselines in `tests/e2e/fixtures/visual-regression/` (`face-toggle-mid-crossing`, `composition-1-2-3-cosmic`, `composition-4-5-0-personal`, `-darwin` suffixed). Coverage: (a) the lemniscate 0/1 crossing — DR-UI-4 400ms asserted on real computed style, mid-crossing frozen at fraction 0.5 via WAAPI over a slowed same-easing transition; (b) tick choreography — in-run frozen-tick proofs over the scrub ring (pause ⇒ pixel-static across a live tick; step-back ⇒ different record ⇒ visibly different pixels; step-forward ⇒ same record ⇒ same pixels; resume ⇒ flow); (c) the integrated 1-2-3 cosmic composition full-face baseline at a frozen tick; (d) the 4-5-0 personal composition. **Thresholds (documented here + spec header + playwright.config.ts):** committed baselines use per-pixel YIQ 0.2 + `maxDiffPixels: 400` (≈0.04% of the fixed 1280×800 viewport; measured cross-run drift on the masked compositions is 0 px on the darwin/swiftshader rig, so 400 is antialias headroom while the smallest guarded chrome unit ≥ ~1200 px cannot hide); in-run canvas proofs use a pixel-ratio comparator, FROZEN_MAX 0.002 / STEPPED_MIN 0.004 (measured: frozen pairs 0.00018, adjacent-record step 0.00956, resumed ~1.0). **Design law learned:** live-profile/lived-vault regions (canvas hosts, engine strip, status strip, vault tree, now-pane) are HIDDEN at capture time as whole rows/panels via Playwright `stylePath` (`visual-regression.hide.css`, visibility:hidden preserves layout boxes) — mask BOXES were abandoned after the close-gate re-run caught a 1px bounding-box-rounding sliver of live canvas escaping a mask at the pane edge (1913 px diff); whole rows because kernel readouts change text width every tick and shift flex siblings; committed RAW canvas baselines are refused as dishonest (tick12/degree720/kairos sky are real and differ across runs/days) — the canvas is proven by the in-run class instead. **Suite-order determinism (close-gate fix, 2026-07-12):** the e2e harness shares ONE sidecar vault per run and earlier specs anchor today's day (`beginToday`), so the personal face boots ANCHORED in suite order and PRISTINE in isolation — the spec now anchors the day itself (journal.spec house idiom over the idempotent `begin_today`) and pins target tabs explicitly (`ensureTabSelected`) before capture; layout/tab persistence was verified NOT to be a channel (the e2e sidecar pins `ui_state_load → null` for deterministic boots). Proof is the full `pnpm test:e2e` suite in order (22 passed), not isolation alone; the three baselines were regenerated accordingly. **Gaps + findings, honestly named:** (1) no dedicated composed 4-5-0 layout exists in the carrier — (d) baselines the honest current surface (personal face default: Now + M1 Deep over Vault/Journal/Calendar/Oracle border + shared `/` membrane), it does not fabricate a composition; (2) easing deviation — DR-UI-4 says 400ms **cubic-out**, `src/styles.css` ships `400ms ease` (duration conforms; easing does not; src untouched by this harness tranche, owner: track 15.5/30); (3) target-stability finding — the engine strip's 1 Hz readout reflow can shift transport buttons between mousedown/mouseup so a real mouse click dissolves into the strip container (verified empirically); the harness drives the keyboard/`engine.*` command surface, and the pointer-target instability is left to the strip's owner (15.9/30) as a UX defect; (4) the 4.3 clock-field overlay rides the live bus inside the same scene by design, so "frozen" is a noise floor (0.018%), never byte equality.

## Cycle 2 Substrate Inheritance

Consume as-is — Theia activity-bar contribution slots; `application-shell` widget areas; `StatusBarContribution`; `KeybindingContribution`; `MenuContribution`. Repurpose — `agentic-control-room` substrate (`run-model.ts`, `acr-runtime-service.ts`, `parity.ts`) into `omnipanel-shell` / `omnipanel-runtime`. Cycle 2 Tracks 01 (Electron/Theia shell + OmniPanel) and 11 (Theia shell hosting) closed the substrate; Tranche 15 closes the UI grammar that uses it.

## Anti-Greenfield Posture

All work in Tranche 15 either:
- Consumes Theia platform conventions (activity-bar, status-bar, keybindings)
- Repurposes ACR substrate (`run-model.ts` → `omnipanel-runtime.ts`)
- Extends landed extensions (`omnipanel-shell`, `pratibimba-layouts`, `acceptance-harness`)
- First-builds against M' product surface owners (the `m1-paramasiva-played-torus` Bevy/wgpu extension owns the M1-2 ananda vortex rendering; that first-build was already ratified by DR-M1-2 — Tranche 15 only consumes its surface, not its renderer engine)

No greenfield UI framework. No competing widget shell. The OmniPanel becomes what it always wanted to be; the ACR substrate becomes what it always was.
