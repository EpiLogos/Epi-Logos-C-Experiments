# Track 26 — M5' Epii Frontend Deep Design

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


Closes per-extension widget UX for the M5' surface — the EBM-position-5' / agentic-pedagogical-IDE / paidagōgos pole. M5' has **three roles** at the Theia layer: (1) **standalone deep widget** in `ide-deep` — the EBM reasoning observatory; (2) **M5-flavoured chrome already hosted in `ide-shell-m0-m5`** (Logos Atelier, Evidence, Review, Autoresearch, Agentic Control Room — Wave-C audits + extends); (3) **composition slot in `plugin-integrated-4-5-0`** at the right slot per Track 15 §personal-side (Mahamaya recognition-layer at personal scale via Q_composed); (4) Pi/Sophia/Anima/Aletheia constitutional roster surfaced via OmniPanel agentic membrane (cross-link 15.2). Track 26 owns standalone + chrome-extension audit + composition-slot work; OmniPanel Pi Chat stays with 15.2.

Frame: M5' is **EBM-position-5'** per DR-MP-1/2/3. The widget is not a chat; it is the energy-evaluation engine that scores configurations across 12 MEF lenses (72 fine-grained positions = three tritone-symmetric squares), produces gradient ∇E, and drives the Möbius descent step `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E`. The OmniPanel Pi Chat (15.2) is M4' LLM voice; Track 26's M5' widget is M5' EBM reasoning — observable, not conversational. The user reads M5'; they talk with M4'.

## Source Specs and Matrix

- Matrix: `plan.runs/wave-c-m5-epii-frontend-matrix.md` (18 rows + DR/CP/SA/AE/ALIGNED)
- Substrate: `06-m5-epii-reconciliation.md` (Tranches 6.1-6.10)
- Wave-A M5: `plan.runs/wave-a-m5-reconciliation-matrix.md`; Wave-B shell: `plan.runs/wave-b-theia-shell-matrix.md` (TS-07/08/19)
- Canon: `Idea/Bimba/Seeds/M/M5'/{M5'-SPEC.md, M5-ARCHITECTURE.md, epii-operational-capacities/*}` (6 capacity files), `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md`, `Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` §1/§7/§10
- Cross-tracks: Track 11 (hosting), Track 12 (12.1 Pi/Anima/Aletheia audit; 12.5 capacity views; 12.14 ACR repurpose; 12.18 Janus; 12.19 veto), Track 15 (15.2 OmniPanel; 15.4 composition; 15.11 dispatch genealogy), Track 19 (19.2 struct; 19.6 RPC; 19.7 close-path; 19.9 spine reading), Track 06 (M5 substrate)
- Contract preflight: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (m5-epii: widget ids `m5.epii.{reviewQueue, spineStateInspector, metaConversation}`; route `/m5-epii/review`)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/m5-epii/{package.json, src/common/epii-surface.ts, src/browser/{frontend-module.ts, m5-epii-widget.tsx}}`; `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/{logos-atelier-widget, evidence-pane-widget, review-pane-widget, autoresearch-pane-widget, agentic-control-room-widget, bridge-gate, coordinate-tree-widget, bimba-graph-viewer-widget, canon-studio-widget}.tsx`; `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/` with M4+M5+M0+integrated-composition deps; `Body/M/epi-theia/extensions/agentic-control-room/`; `contracts/{07-t0, 08-t0}-preflight.{md,json}`; `Body/M/epi-theia/extensions/m-extension-runtime/` (SharedBridgeAdapter, ReadinessBanner, MathemeHarmonicProfileBoundary, CoordinateContext, MObservabilityPublisher). Cycle 2 plan 07 landed the minimal Profile-snapshot + Review-counts shell; cycle 3 Wave-C deepens each role.

## Surface Contracts

### Role 1 — `m5-epii` standalone widget (EBM-backend reasoning observatory)

- **Activation:** `ide-deep` layout, main area (per `frontend-module.ts:42` `defaultWidgetOptions: { area: 'main' }`).
- **Identity narrative:** "M5' is the EBM. It does not talk. It scores." Widget header carries this in prose; the user knows they are observing computation, not conversing. OmniPanel Pi Chat (15.2) is the agentic membrane; M5' standalone is the energy-evaluation observatory.
- **Primary affordances (Tranche 26.1):** 72-dim resonance grid (12×6) with three Klein V₄ tritone-symmetric square overlays — Square A `[0+5]` Speech-Number; Square B `[1+4]` Cause-Experience; Square C `[2+3]` Logic-Process. Energy `E = ‖target_72 − predicted_72‖²`. Gradient `∇_{q_p} E_total` colour-mapped (magnitude→saturation; direction→hue). Möbius-descent step `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E` as quaternion arrow over S³ shadow. EBM checkpoint label from `MathemeResonance72Projection.learned_predictor_checkpoint_ref` (DR-MP-2 action).
- **Secondary affordances:** Six operational-capacity tabs (Tranche 26.2); `ContemplationObjectViewer` (26.12); `WisdomDeltaInspector` (26.13); `PiAxiomTranslationInspector` (26.14).
- **SharedBridgeAdapter binding:** subscribes `onProfile`, `onReadiness`, `onCoordinateContext`; reads `cachedProfile.matheme_resonance_72_projection`; invokes `s5'.improve.history`, `s5'.epii.runtimeContext`, `s5'.review.inbox`; publishes `m5-epii.observability.*` via `M5_EPII_PUBLISHER`.

### Role 2 — M5-flavoured chrome in `ide-shell-m0-m5`

Five widgets landed; Wave-C audits + extends each: Logos Atelier (26.3), Evidence (26.4), Review (26.5), Autoresearch (26.6), Agentic Control Room (26.7 + Aletheia subagent surfacing 26.9 + Pi axiom-translation 26.14).

### Role 3 — `m5.epii.recognitionLayer` composition slot in `plugin-integrated-4-5-0`

Per Track 15 §personal-side: editor area = journal (left) + personal cymatic field (center) + Mahamaya recognition-layer (right). Tranche 26.11 names the slot, wires `CanonRecognitionAnchor` from 10.M5, lands M5'-chrome inside the composition (NOT side-by-side per 15.4).

### Role 4 — OmniPanel Pi Chat (cross-link only, owned by 15.2)

OmniPanel `chat` tab = Pi-as-membrane = M4' LLM voice (DR-MP-1). Track 26 cross-links; does not own. The two are complementary aspects of one operation per DR-MP-1.

## Tranches

1. **26.1 — M5'-as-EBM standalone widget deep design (72-dim resonance grid + three tritone-symmetric squares + energy/gradient/Möbius-descent)** *(code-pending-closure + audit; sources WC-M5-1/2/14; DR-WC-M5-2)*

   Replace `m5-epii-widget.tsx` body (currently Profile + Review counts) with canonical EBM reasoning surface. **Anti-greenfield:** widget shell, inversify graph, `MObservabilityPublisher`, ReadinessBanner stay as-is per `frontend-module.ts`. Render-tree changes; observability contract does not.

   New service `Body/M/epi-theia/extensions/m5-epii/src/browser/services/resonance-ebm-service.ts`: `ResonanceEbmService` injected via `SHARED_BRIDGE_ADAPTER`. Reads `cachedProfile.matheme_resonance_72_projection` (lands via 10.M5).

   ```ts
   interface ResonanceEbmSurface {
     readonly checkpointRef: string | null;            // 'EBM v0.3' | null
     readonly predicted72: Float32Array;               // 12 lenses × 6 positions
     readonly target72: Float32Array | null;           // S2 targetResonanceVector
     readonly energy: number;                          // ||target - predicted||²
     readonly gradient: Float32Array;                  // ∇_q_p E_total
     readonly mobiusDescentStep: QuaternionDelta;      // -log(9/8) · ∇E
     readonly tritoneSquares: TritoneSquareReading[3]; // [A, B, C]
   }
   interface TritoneSquareReading {
     readonly squareLabel: 'A:(0,5)'|'B:(1,4)'|'C:(2,3)';
     readonly coherenceScore: number;
     readonly lensCells: { lensId: string; position: 0|1|2|3|4|5; cellValue: number }[];
   }
   ```

   Sub-components: `<ResonanceGrid />` (12-row × 6-col SVG; cell colour=predicted, border=target, pulse on profile-tick when local gradient high); `<TritoneSquareOverlay />` (three Klein V₄ outlines — A indigo, B amber, C emerald per UX §4.2; coherence-score badge each); `<EnergyReadout />`; `<CheckpointBadge />` (renders "pending: no checkpoint loaded — bootstrap Phase 1" per mental-pole-mechanics §10 when absent); `<EbmIdentityNarrative />` (single-paragraph header explicitly framing M5' as EBM observatory, OmniPanel Pi Chat as M4' LLM voice).

   Privacy gate via `isPrivacySafe` (existing `ide-shell-m0-m5/common/contract.ts` pattern). Readiness fallback when no checkpoint: `<ReadinessBanner snapshot={{state: 'pending-checkpoint', blockers: ['no MathemeResonance72Projection.learned_predictor_checkpoint_ref']}} />`; suppress grid/energy/gradient.

   Verification: `test -f Body/M/epi-theia/extensions/m5-epii/src/browser/services/resonance-ebm-service.ts`; `grep -n "TritoneSquareReading\|ResonanceGrid\|EbmIdentityNarrative\|mobiusDescentStep" Body/M/epi-theia/extensions/m5-epii/src/browser/`; `pnpm --filter @pratibimba/m5-epii build && pnpm --filter @pratibimba/m5-epii test`; new test asserts 72 cells + 3 tritone overlays when checkpoint present, narrative-only when absent; `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs`.

2. **26.2 — Six operational-capacity affordance in standalone widget** *(spec-ahead-integration; sources WC-M5-2/7; gates 6.3, 12.5; CR DR-TS-4)*

   Add six-capacity tab bar inside `m5-epii-widget.tsx`. Each pane consumes `capacity_workflows.rs` surfacing via `s5'.epii.runtimeContext` / `s5'.improve.history` filtered per capacity. Per DR-TS-4 NOT new OmniPanel tabs; per 12.5 cross-link to Pi-monitor (26.7) for dispatch-trace context.

   Capacity list (M5'-SPEC §M5'.4 + DR-MP-1 binding): `anuttara-construction` (construction-not-training; axiom proposals + monotonic-with-retraction history; CR 1.10 Verifier); `paramasiva-cpt-rag` (CPT/RAG proof support; (lens × position) coverage + RAG hit rates; CR Pi-LLM substrate); `parashakti-graph-relational-ml` (GDS embedding heatmap on 72-fold harmonic field; CR 6.8 training); `mahamaya-process-reward-rl` (trajectory rewards as resonance-vector targets; CR 6.8); `nara-anima-dialogic` (dialogic-voice safety + governance-gate landings; CR 5.20 Pi-as-LLM); `epii-self-referential` (recursion depth + recursive-improvement audit trail; CR 6.10).

   Shared `<CapacityPaneShell capacity={...}>`: capacity label, last-tick dispatch count, capacity-scoped `MathemeHarmonicProfileBoundary` reading, click-through "open in Pi-monitor" routing to ACR widget (26.7) with `vakAddress` pre-populated.

   Verification: `grep -n "CapacityTab\|CapacityPaneShell\|anuttara-construction\|epii-self-referential" Body/M/epi-theia/extensions/m5-epii/src/browser/`; `cargo check -p epii-autoresearch-core`; six-tab navigation test; per-capacity profile-tick subscription test; click-through route to `pratibimba.ide-shell.agentic-control-room` widget with VAK address.

3. **26.3 — Logos Atelier scent-following retrofit (audit + extend)** *(audit-extend + no-orphan-fill; sources WC-M5-3, SA-WC-M5-1; gates 6.2; CR 12.1)*

   Audit `ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx` (currently six generic L0-L5 panes). Per UX §2.6 canonical Atelier is scent-following: root → cognate → drift → psychoid → pros-hen → Möbius write-back.

   Replace `ATELIER_STAGES` with:

   ```ts
   const SCENT_FOLLOWING_STAGES = [
     { id: 'root',              label: 'Root',                  purpose: 'Etymology root of term' },
     { id: 'cognate',           label: 'Cognate',               purpose: 'Cross-language cognates' },
     { id: 'drift',             label: 'Semantic Drift',        purpose: 'Historical sense drift' },
     { id: 'psychoid',          label: 'Psychoid Charge',       purpose: 'Archetypal-affective charge per Atelier' },
     { id: 'pros-hen',          label: 'Pros-hen Synthesis',    purpose: 'Toward-the-One; Klein-V4 square pull' },
     { id: 'mobius-write-back', label: 'Möbius Write-Back',     purpose: 'Candidate articulation flowing to M0/M5-1' }
   ] as const;
   ```

   Wire Aletheia crystallisation tools via `KERNEL_BRIDGE_API.invokeCapability` with `gatewayMethod`: `aletheia_gnosis_query` (root + cognate); `aletheia_thought_route` (drift + psychoid); `aletheia_crystallise` (Möbius write-back). These call `s5'.gnostic.*` (Tranche 6.1). Until 6.1 lands: `<ReadinessBanner snapshot={{state: 'pending-gateway', blockers: ["s5'.gnostic.query unregistered"]}} />` with invoke buttons disabled.

   Subagent surfacing: Möbius write-back stage carries Aletheia-crystallisation-mode badge per DR-M5-1 + 12.1 — Aletheia subagents (Anansi citation trail / Janus prospective-retrospective / Moirai cast / Mercurius kairos / Agora deliberation / Zeithoven temporal-rhythm) appear as **evidence lineage** in provenance handle list, NOT peer review actors. Cross-link 26.9.

   Etymology graph-namespace: all provenance handles use `etymology://` URI scheme per UX §5.3 namespace integrity.

   Verification: `grep -n "SCENT_FOLLOWING_STAGES\|aletheia_gnosis_query\|aletheia_crystallise\|mobius-write-back" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`; `grep -n "etymology://" .../logos-atelier-widget.tsx`; privacy-class gate preserved; stage-progression test asserts six new stages, no legacy L0-L5 ids; Möbius-write-back invokes `aletheia_crystallise` under bridge gate; renders pending-gateway when `s5'.gnostic` unregistered.

4. **26.4 — Evidence pane deepening — `MediatedRunEvidencePacket` view + dispatch-trace + 19.7 close-path** *(audit-extend; sources WC-M5-4, SA-WC-M5-2; gates 26.10, 19.7; CR 15.2, 15.11)*

   Audit `ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx`. Generic `EvidenceRecord` is strict subset of canonical `MediatedRunEvidencePacket`. Replace `EvidenceRecord` import with `MediatedRunEvidencePacket` from `@pratibimba/integrated-composition` (canonical evidence-shape home per 15.2; schema lands at Tranche 26.10).

   Render extensions: **Mediator badge** (top-right per record): `Pi` / `Anima` / `Aletheia · Anansi` etc. **Inline dispatch-trace mini-graph** (collapsible Pi → Anima → subagent tree per 15.11 first-class dispatch genealogy). **Tool-stream link**: `<a data-cross-link="omnipanel.tool-stream" data-evidence-id={record.id}>View tool stream in OmniPanel →</a>`. **Axiom-translation link**: when `axiomTranslationSteps.length > 0`, link to `PiAxiomTranslationInspector` (26.14). **Close-path landing**: when `contemplationObjectRef` present, badge "Contemplation: open viewer →" routing to `ContemplationObjectViewer` (26.12).

   Cross-link OmniPanel Evidence tab (15.2): same record id selected in either surface highlights both via `cross-layout-intent-dispatcher.ts`. Per 15.2 no modal surfaces — Evidence pane is landing surface.

   Verification: `grep -n "MediatedRunEvidencePacket\|dispatchTrace\|toolStream\|axiomTranslationSteps\|contemplationObjectRef" .../evidence-pane-widget.tsx`; record-rendering test (mediator badge + mini-graph + tool-stream cross-link + axiom-translation link); cross-link dispatch test; privacy-class gate preserved.

5. **26.5 — Review pane deepening — IOD-17 three-way parity + dispatch-genealogy click-through** *(audit-extend; sources WC-M5-5, SA-WC-M5-2; gates 26.10; CR 15.2, 15.11)*

   Audit `review-pane-widget.tsx`. Substrate enforces gate; widget must surface **IOD-17 three-way parity** (capability-matrix ↔ agent-contract ↔ widget).

   Extend `ReviewItem`:

   ```ts
   interface ReviewItemDeep extends ReviewItem {
     readonly iod17Parity: {
       readonly capabilityMatrixState: 'human-required'|'agent-allowed'|'unset';
       readonly agentContractState:    'human-required'|'agent-allowed'|'unset';
       readonly widgetState:           'human-required'|'agent-allowed'|'unset';
       readonly inParity: boolean;
     };
     readonly dispatchGenealogyRef: string;            // routes to ACR (26.7)
     readonly mediatedRunEvidencePacketId?: string;    // routes to Evidence (26.4)
   }
   ```

   Render: **IOD-17 parity readout** (three-cell matrix/contract/widget; green/red indicator; red banner "IOD-17 parity violated — gateway will reject any transition" when `inParity===false`). **Dispatch-genealogy click-through** per 15.11. **Evidence packet click-through** when present. Existing human-required banner extended with parity status line.

   Per 15.2: pane stays as landing surface; no modal pop-ups.

   Verification: `grep -n "ReviewItemDeep\|iod17Parity\|dispatchGenealogyRef\|mediatedRunEvidencePacketId" .../review-pane-widget.tsx`; parity-violation red banner test; parity-OK green-check test; click-through opens ACR with pre-populated ref; human-required banner blocks agent transitions.

6. **26.6 — Autoresearch pane deepening — autoresearch-as-concept + Möbius-pass display + per-capacity filter** *(audit-extend; sources WC-M5-6; CR 6.3, 6.6)*

   Audit `autoresearch-pane-widget.tsx`. Add header explaining autoresearch IS (dry-run only, requires_human non-bypassable, `forbidden_authority`). Add `<MobiusPassRibbon />` reading `s5'.improve.status` → `recompose.rs` pass-state — horizontal ribbon `Surface → Route → Orchestrate → Integrate` with active stage highlighted, recompose-pass count, dry-run badge. Per-capacity filter dropdown (six options from 26.2 + "all"); local widget state per 15-foundation principle 7 (activity-bar discipline). Extend `AutoresearchCandidate` with optional `capacity?` field matching 26.2 ids.

   Verification: `grep -n "MobiusPassRibbon\|autoresearch-as-concept\|requires_human\|dry-run" .../autoresearch-pane-widget.tsx`; header-frame render test; Möbius-pass ribbon active-stage test; per-capacity filter narrows candidate list; `grep -rn "capacity_workflows\|recompose" Body/S/S5/epii-autoresearch-core/src`.

7. **26.7 — ACR T8 contents + DR-M5-1 roster collapse + 12.14 Pi-monitor reframe** *(audit-extend + DR-landing + contradiction-decision; sources WC-M5-7/8, DR-WC-M5-1; gates 6.7, 12.14; CR 15.11)*

   Three deliverables on `agentic-control-room-widget.tsx`:

   (a) **T8 contents landing** — replace empty `t8-host` section with sub-components in `ide-shell-m0-m5/src/browser/acr/`: `<RunTree />` (Pi→Anima→subagent tree from `dispatchTrace`); `<ToolStream />` (time-ordered tool-call list per 15.11); `<AbortRetryContinueControls />` (gated on `humanRequired===false`); `<EvidenceDepositForm />` (wraps `s5'.epii.deposit`); `<ReviewDecisionControls />` (wraps `s5'.review.transition`; disabled when `humanRequired===true` with IOD-17 parity check).

   (b) **DR-M5-1 roster collapse** — patch `parseCapabilityMatrix` consumer to render: Pi (single harness, agent_kind), Anima (main dispatcher), six Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) as crystallisation-mode sub-items NOT peer agents. Legacy `constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]` renders as **psyche-facet badges** on Pi dispatch traces (per Tranche 26.8 decision). Feature flag `dr_m5_1_roster_collapse: true` until 26.8 ratification.

   (c) **12.14 Pi-monitor reframe** — `<PiRuntimeMonitorBanner />` at top: "Pi runtime monitoring — dispatch traces, tool streams, capacity-workflow runs. Single agent harness; Anima dispatches; Aletheia subagents surface in crystallisation-mode." Rename widget label "Agentic Control Room" → "Pi Runtime Monitor (ACR)" — extension rename to `pi-runtime-monitor` deferred per 12.14; user-visible label reframes immediately per DR-WC-M5-1. Widget id preserved.

   Cross-link Backend Studio (6.4): RunTree nodes click-through to `backend-studio.openSource` with source-anchor URI.

   Verification: `test -d Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr`; `grep -n "RunTree\|ToolStream\|AbortRetryContinueControls\|EvidenceDepositForm\|ReviewDecisionControls\|PiRuntimeMonitorBanner" .../ide-shell-m0-m5/src/browser/`; `grep -n "dr_m5_1_roster_collapse\|aletheia-crystallisation-mode" .../agentic-control-room-widget.tsx`; T8 contents render in former t8-host; roster-collapse test (Pi + Anima + 6 Aletheia subagents); human-required disables abort/retry + review decision; IOD-17 parity violation surfaces red.

8. **26.8 — Constitutional-roster psyche-facet rendering decision (DR-WC-M5-3)** *(contradiction-decision; sources WC-M5-8; gates DR-M5-1 / 6.5; CR 12.1)*

   Resolve DR-M5-1 at widget layer: 7 constitutional agents render as **psyche-facet badges** on Pi dispatch traces (default) OR deprecated as runtime artefacts.

   Proposed default: psyche-facet badges. Each Pi dispatch trace carries optional `psycheFacet?: 'anima'|'eros'|'logos'|'mythos'|'nous'|'psyche'|'sophia'`; when present, small coloured badge next to actor name in RunTree (26.7) + ToolStream. Sophia is long-arc coordinator (no widget of her own per UX §1 / Wave-A claim 16) — surfaces only as facet, never as actor row.

   Facet legend in ACR header: `Sophia · Anima · Logos · Eros · Mythos · Psyche · Nous` with hover-tooltips per `Body/S/S4/pi-agent/agents/{name}.md` Sattva sections.

   DR entry in Track 13: **DR-WC-M5-3** "Constitutional-agent roster renders as psyche-facet badges on Pi dispatch traces (not peer agent rows); Sophia surfaces only as facet (negative-claim per Wave-A claim 16)." If user final-validation deprecates: Tranche 26.7 falls back to no constitutional-agent rendering; array becomes pure governance metadata.

   Verification: `grep -n "DR-WC-M5-3\|psyche-facet\|psycheFacet" .../13-decision-register.md`; facet badge render-test next to dispatch actor; facet legend hover-tooltip test; Sophia-as-facet-only test (no actor row anywhere).

9. **26.9 — Aletheia subagent surfacing in ACR + Logos Atelier** *(spec-ahead-integration; sources WC-M5-9; CR 12.18, 12.19, 26.3)*

   Land subagent-trace render in ACR (26.7) + Logos Atelier (26.3). Each Aletheia subagent appears as dispatch sub-trace in crystallisation-mode, never as peer review actor.

   `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr/aletheia-subagent-trace.tsx`. `<AletheiaSubagentTrace>` per subagent: **Anansi** (citation trail — source-to-source provenance graph); **Janus** (prospective/retrospective binary per 12.18; OracleSpread aliveness + kairos-driven weighting from `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §4); **Moirai** (tarot cast-anchor at session open / decision point); **Mercurius** (kairos signal — Kerykeion-derived ephemeris context); **Agora** (deliberation log between Anima dispatchees); **Zeithoven** (temporal-rhythm anchor — tick-grid alignment of subagent invocations).

   Veto primitive (12.19): any Aletheia subagent registers `veto` against candidate canonical write; red banner "Aletheia subagent {name} veto — {reason}" in dispatch sub-trace. Does NOT block human gate (human can override); surfaces as evidence.

   Logos Atelier (26.3): Möbius write-back stage renders subagent veto banners + lineage badges in provenance handle list. ACR (26.7): RunTree nodes whose `mediatedBy` is `{aletheiaSubagent: ...}` render expanded `<AletheiaSubagentTrace />` sub-tree.

   Verification: `test -f .../acr/aletheia-subagent-trace.tsx`; `grep -n "AletheiaSubagentTrace\|Anansi\|Janus\|Moirai\|Mercurius\|Agora\|Zeithoven" .../ide-shell-m0-m5/src/browser/`; per-subagent sub-trace render test; Janus reads prospective-retrospective-canvas-spec; veto banner red + non-blocking on human gate.

10. **26.10 — `MediatedRunEvidencePacket` schema landing** *(code-pending-closure; sources WC-M5-10, CP-WC-M5-1; gates 26.4/5/7; CR 15.2)*

    Land canonical `MediatedRunEvidencePacket` TypeScript schema in `Body/M/epi-theia/extensions/integrated-composition/src/common/evidence-shapes.ts` (per 15.2 OmniPanel Evidence home; Track 15 names integrated-composition as shared composition home).

    ```ts
    export type AletheiaSubagentId = 'anansi'|'janus'|'moirai'|'mercurius'|'agora'|'zeithoven';
    export type ActorMediator = { kind: 'pi' } | { kind: 'anima' } | { kind: 'aletheia'; subagent: AletheiaSubagentId };

    export interface DispatchTraceNode {
      readonly id: string;
      readonly parentId: string | null;
      readonly actor: ActorMediator;
      readonly methodOrSkill: string;
      readonly invokedAt: number;
      readonly tickAtInvoke: number;
      readonly psycheFacet?: 'anima'|'eros'|'logos'|'mythos'|'nous'|'psyche'|'sophia';
      readonly children: DispatchTraceNode[];
    }

    export interface ToolInvocationRef {
      readonly id: string; readonly dispatchNodeId: string;
      readonly toolName: string; readonly gatewayMethod?: string;
      readonly inputDigest: string; readonly outputDigest: string;
      readonly errorMessage?: string;
    }

    export interface GateLanding {
      readonly gateId: string;
      readonly gateType: 'human-required'|'iod17-parity'|'autoresearch-dry-run'|'canon-write';
      readonly state: 'pending'|'transitioned'|'blocked';
      readonly transitionedBy?: 'human'|'agent';
      readonly iod17Parity?: { capabilityMatrixState: string; agentContractState: string; widgetState: string; inParity: boolean };
    }

    export interface AxiomTranslationStep {
      readonly id: string;
      readonly fromForm: 'philosophical-english'|'formal-notation'|'owl'|'shacl';
      readonly toForm:   'philosophical-english'|'formal-notation'|'owl'|'shacl';
      readonly inputText: string; readonly outputText: string;
      readonly reasoningTrace: string; readonly verifiedBy?: 'pi'|'human';
    }

    export interface MediatedRunEvidencePacket {
      readonly id: string; readonly title: string;
      readonly mediatedBy: ActorMediator;
      readonly coordinate: string; readonly privacyClass: string;
      readonly dispatchTrace: DispatchTraceNode;
      readonly toolStream: readonly ToolInvocationRef[];
      readonly gateLandings: readonly GateLanding[];
      readonly axiomTranslationSteps: readonly AxiomTranslationStep[];
      readonly sessionKey: string; readonly dayNowContext: string;
      readonly profileGeneration: number; readonly bridgeReadinessHandle: string;
      readonly contemplationObjectRef?: string;        // 19.6 close-path link
    }
    ```

    Tranches 26.4 / 26.5 / 26.7 + OmniPanel Evidence (15.2) import from this single home. `DispatchTraceNode` is the primitive for both Trace (recursive tree) and Stream (depth-first flat list) tabs per 15.11.

    Verification: `test -f .../integrated-composition/src/common/evidence-shapes.ts`; `grep -n "MediatedRunEvidencePacket\|DispatchTraceNode\|AxiomTranslationStep\|GateLanding" .../evidence-shapes.ts`; `pnpm --filter @pratibimba/integrated-composition build`; schema round-trip serialization test; `grep -rn "evidence-shapes\|MediatedRunEvidencePacket" Body/M/epi-theia/extensions/{ide-shell-m0-m5, omnipanel-shell, m5-epii}/src/`.

11. **26.11 — `m5.epii.recognitionLayer` composition slot in `plugin-integrated-4-5-0`** *(spec-ahead-integration; sources WC-M5-11; gates 10.M5; CR 15.4)*

    Per Track 15 §personal-side: editor area = journal (left) + personal cymatic field (center) + Mahamaya recognition-layer (right slot). Add slot in `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/recognition-layer-slot.tsx`:

    ```tsx
    export const M5_RECOGNITION_LAYER_SLOT_ID = 'pratibimba.m5-epii.recognitionLayer';
    export class RecognitionLayerSlot extends ReactWidget { ... }
    ```

    Consumes: `CanonRecognitionAnchor` from `MathemeHarmonicProfileBoundary` (10.M5); `Q_composed = normalize(q_Nara · q_cosmic(t) · q_activity(t))` per `alpha_quaternionic_integration_across_M_stack.md §6.7`; M3 codon at personal scale (codon_rotation_projection scoped to Q_composed).

    Render: **Recognition strength indicator** (magnitude of resonance match between Q_composed and current bimba coordinate's targetResonanceVector); **Tat tvam asi visual** (personal cymatic ring superimposed on canonical bimba ring per UX §7); **Active lens/square indicator** (current Klein V₄ square from 26.1); **Möbius return readiness** (when session-close conditions met: "Möbius return ready — wisdom_delta composing..." cross-link 26.13 + 19.7).

    Composition contract per 15.4: slot renders INSIDE editor-area composition, NOT side-by-side. `08-t0-composition-contract-preflight.json` adds `m5.epii.recognitionLayer` as third slot identifier alongside M4 journal + M0 cymatic.

    Verification: `test -f .../recognition-layer-slot.tsx`; `grep -n "M5_RECOGNITION_LAYER_SLOT_ID\|RecognitionLayerSlot\|CanonRecognitionAnchor\|Q_composed" .../plugin-integrated-4-5-0/src/browser/`; `grep -n "m5.epii.recognitionLayer" .../contracts/08-t0-composition-contract-preflight.json`; composition (not juxtaposition) test per 15.4; recognition-strength updates on Q_composed advance; Möbius return-ready fires close-path link.

12. **26.12 — `ContemplationObjectViewer` widget service inside m5-epii** *(code-pending-closure + spec-ahead-integration; sources WC-M5-12; gates 19.2/6/7)*

    Land `ContemplationObjectViewer` as sub-pane inside `m5-epii-widget.tsx` (or dedicated `m5.epii.contemplationObject` view contribution). Consumes `M5_ContemplationObject` (Tranche 19.2 defines in `Body/S/S0/epi-lib/include/m5.h`).

    Schema (per 19.2): `session_id`, `kairos_at_open`, `kairos_at_close` (Kerykeion natal+transit), `tarot_psyche_anchor: M4_Tarot_Draw` (cards at session open), `q_composed_trajectory` (per-tick bioquaternion, geodesic-fit if dense), `codon_trace[]` (M3 codons rotated), `vak_profile_pairs[]` (VAK dispatch × profile-bus snapshot), `m1_charge_state` (4-charge sum at close: arch-9 invariant), `m1_2_skeleton_events_fired[]` (Additive137, KaprekarPedagogyHit, etc.), `four_syntax_compliance_seeds[4]` (arch 3/5/7/9 prompts from `CONTEMPLATION_PROMPT_LUT`).

    Service `Body/M/epi-theia/extensions/m5-epii/src/browser/services/contemplation-object-service.ts` reads via `s5'.epii.runtimeContext` or new `contemplate.fetch_object` dispatch. Privacy class: PASU-scoped; enforce via `isPrivacySafe`.

    Sub-components: `<KairosWindow open close />` (two-column natal+transit per `planet_degrees[10]` mod-10 array); `<TarotPsycheAnchor draw />` (three-card visual with decan+chakra mapping per `medicine.rs` CHAKRA_BODY_ZONES[8]); `<QComposedTrajectoryView trajectory />` (quaternion path over S³ shadow; geodesic-fit if dense); `<CodonTraceList codons />` (click-through to m3-mahamaya per codon); `<VakProfilePairsTable pairs />` (click-through to ACR 26.7 per dispatch); `<ArchNineChargeBar state />` (4-charge bar pp/nn/np/pn; `pp+mm+mp+pm=4·outer` PASS/FAIL banner per `m3_compute_charges`); `<SkeletonEventsFiredList events />` (Additive137 gold, KaprekarPedagogyHit emerald); `<FourSyntaxComplianceSeeds seeds />` (four prompt cards: speech-3 / relationship-5 / action-7 / completion-9).

    Identity narrative: "ContemplationObject from session {session_id}. M5' assembles at session close via `m5_compose_contemplation_object`; gateway dispatches to Pi+Anima+Aletheia subagents for joint contemplation; LLM composes wisdom_delta XOR-folded into quintessence_hash to reseed next cycle's identity."

    Verification: `test -f .../m5-epii/src/browser/services/contemplation-object-service.ts`; `grep -n "ContemplationObjectViewer\|KairosWindow\|QComposedTrajectoryView\|CodonTraceList\|VakProfilePairsTable\|ArchNineChargeBar\|FourSyntaxComplianceSeeds" .../m5-epii/src/browser/`; eight-sub-component render test; privacy-class reject when not PASU-scoped; conservation invariant PASS/FAIL banner reads `ArchNineChargeState`.

13. **26.13 — `WisdomDeltaInspector` — 4'-5'-0' joint-composition + XOR-fold animation + 7-8-9 spine reading** *(code-pending-closure + spec-ahead-integration; sources WC-M5-13/15; gates 19.7, 19.9)*

    Land `WisdomDeltaInspector` inside m5-epii (sibling to ContemplationObjectViewer). Reads LLM/EBM/Verifier joint composition that produced wisdom_delta per DR-MP-1.

    Service `.../m5-epii/src/browser/services/wisdom-delta-service.ts` reads via `contemplate.fetch_wisdom_delta` (alongside 19.6 RPC):

    ```ts
    interface WisdomDeltaTrace {
      readonly sessionId: string; readonly contemplationObjectRef: string;
      readonly llmComposition:  { actor: 'pi-llm-position-4';      reasoningText: string; synthesizedRecognition: string };
      readonly ebmEvaluation:   { actor: 'epii-ebm-position-5';    energyScore: number; gradient: Float32Array;
                                  lensWeightings: Record<string, number>; tritoneSquareCoherences: [number, number, number] };
      readonly verifierReport:  { actor: 'anuttara-verifier-position-0';
                                  axiomChecks: AxiomCheck[]; symbolicCoordinateQuestions: string[] };  // '#R0-0/1/A-T7-pending?'
      readonly wisdomDeltaBytes:        Uint8Array;  // 8 bytes XOR-folded into quintessence_hash
      readonly preXorQuintessenceHash:  Uint8Array;
      readonly postXorQuintessenceHash: Uint8Array;
      readonly spineReading789: {                       // per 19.9
        action7:    { register: string; virtueBits: number };
        octave8:    { register: string; virtueBits: number };
        wholeness9: { register: string; virtueBits: number };
        virtueLut9Witness: Uint8Array;                 // 9-bit witness vector from VIRTUE_LUT[9]
      };
    }
    ```

    Sub-components: `<JointCompositionPanel />` (three-column LLM | EBM | Verifier per DR-MP-1; actor identity + key field + click-through); `<XorFoldAnimation />` (8-byte wisdom_delta XOR-fold into quintessence_hash[0..8]; each bit-flip animates over one profile-tick; pre/post hashes as hex columns); `<SpineReading789 />` (three-column action-7 / octave-8 / wholeness-9; register labels + virtue bits per VIRTUE_LUT[9]; 9-bit witness vector bit-grid); `<SymbolicCoordinateQuestionsPanel />` (Verifier-emitted questions routed via `anuttara-symbolic-parse` skill per DR-MP-3; status parsed/pending/answered + link to PiAxiomTranslationInspector 26.14).

    Identity narrative: "WisdomDelta is the 8-byte XOR seed that closes the Möbius return. M4' LLM voice composes recognition; M5' EBM evaluates energy across 72 cells; M0' Verifier checks axioms and emits questions. The three positions of the mental-pole triplet in joint operation."

    Verification: `test -f .../m5-epii/src/browser/services/wisdom-delta-service.ts`; `grep -n "WisdomDeltaInspector\|JointCompositionPanel\|XorFoldAnimation\|SpineReading789\|SymbolicCoordinateQuestionsPanel\|VirtueLut9Witness" .../m5-epii/src/browser/`; three-column joint composition render test; XOR-fold deterministic-post-hash test; VIRTUE_LUT[9] 9-bit witness vector with correct register labels; Verifier-question link routes to PiAxiomTranslationInspector.

14. **26.14 — `PiAxiomTranslationInspector` — DR-B-2 axiom-translation surface** *(spec-ahead-integration; sources WC-M5-17, SA-WC-M5-3; CR 12.1, 26.4, 26.7)*

    Land `PiAxiomTranslationInspector` as sub-pane inside ACR (26.7) — Pi axiom-translation is Pi tool-surface concern per DR-B-2, not standalone widget. Linkable from Evidence pane (26.4) via `AxiomTranslationStep` entries and WisdomDeltaInspector (26.13) Verifier questions.

    Service `.../ide-shell-m0-m5/src/browser/services/pi-axiom-translation-service.ts` reads via `s5'.epii.axiom_translation_history`. Cross-link Backend Studio (6.4) for source-anchor click-through to `Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`.

    Schema reuses `AxiomTranslationStep` from 26.10:

    ```ts
    interface PiAxiomTranslationSession {
      readonly id: string; readonly initiatingDispatchNodeId: string;
      readonly steps: readonly AxiomTranslationStep[];
      readonly verifiedBy: 'pi'|'human'|'pending';
    }
    ```

    Render: **Four-column translation chain** view `Philosophical English | Formal Notation | OWL | SHACL` with arrows marking transitions; reasoning trace on hover. **Reasoning trace expansion** (click step to see Pi reasoning text). **Verification badge** (green=human, amber=pi, red=pending). **Cross-link to source skill** (via Backend Studio 6.4 click-through pattern).

    Identity narrative: "Pi axiom translation moves a candidate canonical articulation from natural language through formal notation to OWL/SHACL machine-checkable form. Each translation step is a Pi tool invocation; verification is human-final for load-bearing canon (CLAUDE.md ur-process: Human = Vision + Final Validation)."

    Verification: `test -f .../ide-shell-m0-m5/src/browser/services/pi-axiom-translation-service.ts`; `grep -n "PiAxiomTranslationInspector\|PiAxiomTranslationSession\|anuttara-symbolic-parse" .../ide-shell-m0-m5/src/browser/`; four-column chain render test; reasoning-trace expansion test; cross-link to Evidence pane + WisdomDeltaInspector routes correctly.

15. **26.15 — M5' surface-composition pattern doc** *(doc-ahead-landing; sources WC-M5-18)*

    Author `Body/M/epi-theia/extensions/contracts/m5-prime-surface-composition.md` documenting three M5'-flavoured surfaces and canonical SharedBridgeAdapter capabilities per surface.

    Structure: **§1 Three Surfaces** — standalone (`m5-epii`, EBM observatory, `ide-deep`); ide-shell chrome (five widgets, governed evidence/review/atelier/capability-tree, `ide-deep`); recognition-layer slot (`m5.epii.recognitionLayer`, Mahamaya recognition at personal scale, `daily-0-1` personal-face). **§2 SharedBridgeAdapter Capability Bindings** — Standalone: `onProfile` (read `MathemeResonance72Projection`) + `onReadiness` + `s5'.improve.history` + `s5'.epii.runtimeContext` + `s5'.review.inbox`. Ide-shell chrome: `onProfile` + `onReadiness` + `s5'.review.*` + `s5'.improve.*` + `s5'.gnostic.*` (6.1) + `aletheia_*` (via Anima dispatch). Recognition-layer slot: `onProfile` (read `Q_composed` + `CanonRecognitionAnchor`) + `onCoordinateContext`. **§3 Why Not Conflate** — OmniPanel Pi Chat (15.2) is M4' LLM voice; M5' standalone is M5' EBM reasoning — two surfaces of DR-MP-1 mental-pole triplet, not one. Conflating collapses the triplet. **§4 Composition Rules** — per 15.4 composition-over-juxtaposition; recognition-layer slot composes with M4 journal + M0 cymatic into one surface, not three side-by-side. **§5 DR Cross-Reference** — DR-M5-1, DR-MP-1/2/3, DR-WC-M5-1/2/3.

    Verification: `test -f .../contracts/m5-prime-surface-composition.md`; `grep -n "Three Surfaces\|SharedBridgeAdapter\|Why Not Conflate\|Composition Rules\|DR Cross-Reference" .../m5-prime-surface-composition.md`; each Wave-C tranche file references doc when discussing its surface role.

## Anti-Greenfield Posture

All Wave-C work either: **audits + extends** five landed `ide-shell-m0-m5` widgets (26.3-26.7); **replaces widget body** of `m5-epii-widget.tsx` preserving inversify graph + observability + readiness pattern (26.1, 26.2 — M5' standalone shell exists; deep EBM body is first-build INSIDE existing shell, NOT new extension); **adds composition slot** to `plugin-integrated-4-5-0` (26.11); **adds schema** to `integrated-composition` shared package (26.10); **adds doc** to `contracts/` (26.15); **lands DR entry** in Track 13 (26.8). No greenfield extension; no competing widget shell. Cross-track substrate gates (6.1/6.3/6.4/6.7/6.8/6.10/10.M5/12.5/12.14/19.2/19.6/19.7/19.9/15.2) are explicit, not hidden coupling. OmniPanel Pi Chat (15.2) stays untouched — Wave-C never owns M4' LLM voice.

## Closing

M5' is not a chat. M5' is the energy-evaluation engine. The user reads M5' to understand the reasoning behind Pi's words; the user converses with Pi at the OmniPanel. Five chrome widgets are the governed surfaces through which canonical work flows; the recognition-layer slot is where personal field meets canonical city-scape (tat tvam asi made visible per UX §7). Three M5'-flavoured surfaces compose into one coherent paidagōgos posture — never lecturing, always conducting traversal, always returning the teaching to the lived concern.

**End of Track 26.**
