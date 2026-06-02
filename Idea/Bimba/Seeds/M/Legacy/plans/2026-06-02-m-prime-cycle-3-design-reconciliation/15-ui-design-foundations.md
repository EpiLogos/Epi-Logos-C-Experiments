# Track 15 — UI Design Foundations

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

8. **15.8 — M1-2 ananda vortex visual rendering on K²** *(spec-ahead-integration; consumes subagent research at `plan.runs/15-m1-2-ananda-vortex-research.md`)*

   The Bevy/wgpu `m1-paramasiva-played-torus` extension (DR-M1-2 ratified; build pending — directory does not yet exist) renders the **six 12×12 mod-10 Ananda vortex matrices** (`ANANDA_BIMBA`, `ANANDA_PRATIBIMBA`, `ANANDA_SUM`, two `_DIFF`, `ANANDA_QUINTESSENCE` at `Body/S/S0/epi-lib/src/m1.c:22-114`) as a load-bearing component of the cosmic-1-2-3 composition surface. Concrete visual contract:

   - **K² as the texture surface** carrying the active Ananda matrix as a 12×12 heatmap. Chromatic-longitude U = `position6`; fifths-meridian V = `tick12`. One luminous cell jumps per tick.
   - **Six matrices stacked as a perspex cross-fade** keyed off `Ananda_Matrix_Op` (0-5 per `m1.h:735-756` Spanda↔Ananda parallel-track invariant). Each matrix is a glass layer; the active one is opaque, the others are translucent.
   - **The two DR rings rendered as flow-streamlines on the torus surface**: `DR_RING_MAHAMAYA = {1,2,4,8,7,5}` (doubling) in gold ascending half; `DR_RING_PARASHAKTI = {3,6,9,3,6,9}` (tripling) in emerald descending half. The vortex literally *moves* as two diagonal sweeps — the substrate at `m1.c:122-123` IS the streamline data.
   - **Cl(4,2) signature as colour-binary**: P0/P5 (sin/cos, signature -1) cool indigo halos; P1-P4 (tan/sec/cot/csc, +1) warm amber-vermilion. The +2 net signature becomes the over-cycle colour balance.
   - **Reads-only contract**: the vortex matrices are `.rodata`; the renderer never mutates. Heatmap state derives entirely from `(tick12, position6, lens_mode, Ananda_Matrix_Op)`.

   Verification: `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus`; `grep -rn 'ANANDA_BIMBA\|ANANDA_PRATIBIMBA\|DR_RING_MAHAMAYA\|DR_RING_PARASHAKTI' Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/`; render-test asserts active-matrix heatmap binds to `Ananda_Matrix_Op`; flow-streamline test asserts gold/emerald rings advance with tick.

9. **15.9 — Tick choreography across the six matrices** *(spec-ahead-integration; depends on 15.8 and 10.10)*

   The profile-tick crosses six matrices simultaneously: `CL42_BASIS[6]` · `RING_QUATERNION_LUT[12]` · `QL_TRIG_TABLE[6]` · the six Ananda vortex matrices · `audio_octet[8]` · `nodal_quartet[4]`. **Single animation primitive carries the tick honestly**: `quat_slerp` of K² orientation across `RING_QUATERNION_LUT[12]` (`m1.h:493-523, 551-564`). One full 360° SO(3) revolution per 12 ticks; Hopf-fibre flag flips at tick 5→6 (Klein crossing; cross-link Tranche 02.2 `klein_flip` field landing); second 360° returns identity at tick 11→0 — the 720° SU(2) recognition (the `DOUBLE_COVER_DEG=720` invariant becomes visible).

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

12. **15.12 — Visual-regression harness for the 0/1 toggle + tick choreography** *(spec-ahead-integration)*

    Extend `acceptance-harness` with a visual-regression suite covering: the lemniscate transition (15.5), the tick choreography across the six matrices (15.9), the integrated 1-2-3 composition (15.4 + 07), the integrated 4-5-0 composition (15.4 + 08). Frame-by-frame baselines stored in `acceptance-harness/fixtures/visual-regression/`.

    Verification: `pnpm --filter @pratibimba/acceptance-harness test:visual` passes; baseline images committed; diff threshold documented.

## Cycle 2 Substrate Inheritance

Consume as-is — Theia activity-bar contribution slots; `application-shell` widget areas; `StatusBarContribution`; `KeybindingContribution`; `MenuContribution`. Repurpose — `agentic-control-room` substrate (`run-model.ts`, `acr-runtime-service.ts`, `parity.ts`) into `omnipanel-shell` / `omnipanel-runtime`. Cycle 2 Tracks 01 (Electron/Theia shell + OmniPanel) and 11 (Theia shell hosting) closed the substrate; Tranche 15 closes the UI grammar that uses it.

## Anti-Greenfield Posture

All work in Tranche 15 either:
- Consumes Theia platform conventions (activity-bar, status-bar, keybindings)
- Repurposes ACR substrate (`run-model.ts` → `omnipanel-runtime.ts`)
- Extends landed extensions (`omnipanel-shell`, `pratibimba-layouts`, `acceptance-harness`)
- First-builds against M' product surface owners (the `m1-paramasiva-played-torus` Bevy/wgpu extension owns the M1-2 ananda vortex rendering; that first-build was already ratified by DR-M1-2 — Tranche 15 only consumes its surface, not its renderer engine)

No greenfield UI framework. No competing widget shell. The OmniPanel becomes what it always wanted to be; the ACR substrate becomes what it always was.
