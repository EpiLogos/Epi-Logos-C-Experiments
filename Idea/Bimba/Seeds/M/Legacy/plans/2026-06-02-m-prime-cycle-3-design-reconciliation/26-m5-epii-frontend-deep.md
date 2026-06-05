# Track 26 — M5' Epii Frontend Deep Design

Closes per-extension widget UX for the M5' surface — the EBM-position-5' / agentic-pedagogical-IDE / paidagōgos pole of the M-stack. The M5' surface has **three roles** at the Theia layer: (1) **standalone deep widget** in `ide-deep` for the Epii agentic IDE (the EBM reasoning backend); (2) **M5-flavoured chrome already hosted in `ide-shell-m0-m5`** — Logos Atelier, Evidence pane, Review pane, Autoresearch pane, Agentic Control Room — Wave-C audits + extends; (3) **composition slot in `plugin-integrated-4-5-0`** at the right composition slot per Track 15 §"Personal-side of daily-0-1" (Mahamaya recognition-layer at personal scale via Q_composed); (4) Pi / Sophia / Anima / Aletheia constitutional roster surfaced via OmniPanel agentic membrane (cross-link 15.2). **Track 26 owns standalone + chrome-extension audit + composition-slot work; OmniPanel Pi Chat itself stays with 15.2.**

The frame: M5' is **EBM-position-5'** per DR-MP-1/2/3. The widget is not a chat; it is the **energy-evaluation engine** that scores configurations across the 12 MEF lenses (72 fine-grained positions = three tritone-symmetric squares), produces the gradient ∇E, and drives the Möbius descent step q_p^(n+1) = q_p^(n) − log(9/8) · ∇E. The OmniPanel Pi Chat (15.2) is the M4' LLM voice; Track 26's M5' widget is the M5' EBM reasoning surface — observable, not conversational. The user reads M5'; they talk with M4'.

## Source Specs and Matrix

- **Matrix:** `plan.runs/wave-c-m5-epii-frontend-matrix.md` (row-level reconciliation; 18 claims + 3 DR + 5 CP + 5 SA + 5 AE + 5 ALIGNED)
- **Substrate reconciliation:** `06-m5-epii-reconciliation.md` (Tranches 6.1-6.10)
- **Wave-A M5 matrix:** `plan.runs/wave-a-m5-reconciliation-matrix.md`
- **Wave-B Theia shell matrix:** `plan.runs/wave-b-theia-shell-matrix.md` (TS-07, TS-08, TS-19)
- **Canonical:** `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, `Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md`, `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md`
- **Operational capacities:** `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-{anuttara-language-development,paramasiva-ql-cpt-and-rag,parashakti-graph-relational-ml,mahamaya-process-reward-rl,nara-qlora-dialogic-voice,epii-self-referential-capacity}.md`
- **Mental-pole substrate:** `Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` §1 (72-dim atom), §7 (per-element-tick invocation), §10 (phase markers)
- **Cross-tracks:** Track 11 (shell hosting), Track 12 (agentic layer — 12.1 architecture audit, 12.5 six capacity views, 12.14 ACR repurpose, 12.18 Janus, 12.19 Aletheia veto), Track 15 (UI foundations — 15.2 OmniPanel, 15.4 composition, 15.11 dispatch genealogy), Track 19 (contemplation — 19.2 struct, 19.6 RPC, 19.7 close-path, 19.9 spine reading), Track 06 (M5 substrate)
- **Contract preflight:** `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (m5-epii entry: widget ids `m5.epii.reviewQueue`, `m5.epii.spineStateInspector`, `m5.epii.metaConversation`; routePath `/m5-epii/review`)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/m5-epii/{package.json, src/common/epii-surface.ts, src/browser/{frontend-module.ts, m5-epii-widget.tsx}}`; `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/{logos-atelier-widget,evidence-pane-widget,review-pane-widget,autoresearch-pane-widget,agentic-control-room-widget,bridge-gate,coordinate-tree-widget,bimba-graph-viewer-widget,canon-studio-widget}.tsx`; `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/` extension with `m4-nara + m5-epii + m0-anuttara + integrated-composition` deps; `Body/M/epi-theia/extensions/agentic-control-room/` extension; `Body/M/epi-theia/extensions/contracts/{07-t0,08-t0}-*preflight.{md,json}`; `Body/M/epi-theia/extensions/m-extension-runtime/` with `SharedBridgeAdapter`, `ReadinessBanner`, `MathemeHarmonicProfileBoundary`, `CoordinateContext`, `MObservabilityPublisher`. Cycle 2 plan 07 named the M5' widget surface but landed only the minimal Profile-snapshot + Review-counts shell; cycle 3 Wave-C deepens each role.

## Surface Contracts

### Role 1 — `m5-epii` standalone widget (the EBM-backend reasoning surface)

- **Activation:** `ide-deep` layout, main editor area (per `frontend-module.ts:42` `defaultWidgetOptions: { area: 'main' }`).
- **Identity narrative:** "M5' is the EBM. I do not talk. I score." The widget header carries this in plain prose so the user understands they are observing computation, not conversing with an agent. The OmniPanel Pi Chat (15.2) is the agentic membrane; the M5' standalone is the energy-evaluation observatory.
- **Primary affordances** (Tranche 26.1):
  - **72-dim resonance grid** (12 lenses × 6 positions = 72 cells) with three Klein V₄ tritone-symmetric squares overlaid: Square A `[0+5]` Speech-Number (L0·L5·L5'·L0'); Square B `[1+4]` Cause-Experience (L1·L4·L4'·L1'); Square C `[2+3]` Logic-Process (L2·L3·L3'·L2').
  - **Energy readout** `E = ‖target_72 − predicted_72‖²` per current coordinate.
  - **Gradient render** `∇_{q_p} E_total` colour-mapped (magnitude = saturation; direction = hue rotation around the lens-ring).
  - **Möbius-descent step indicator** `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E` rendered as a quaternion arrow over the S³ shadow.
  - **EBM checkpoint label** consuming `MathemeResonance72Projection.learned_predictor_checkpoint_ref` (per DR-MP-2 action; pending until 6.8 lands).
- **Secondary affordances** (Tranches 26.2, 26.12, 26.13, 26.14):
  - Six operational-capacity tabs (Anuttara-construction / Paramaśiva-CPT-RAG / Paraśakti-graph-relational / Mahāmāyā-process-reward / Nara-Anima-dialogic / Epii-on-Epii).
  - `ContemplationObjectViewer` for session-close `M5_ContemplationObject` rendering.
  - `WisdomDeltaInspector` for the 4'-5'-0' joint-composition trace + XOR-fold animation + 7-8-9 spine reading.
  - `PiAxiomTranslationInspector` for Pi tool-surface axiom-translation steps (DR-B-2 surface).
- **SharedBridgeAdapter binding:** subscribes to `onProfile`, `onReadiness`, `onCoordinateContext`; reads `cachedProfile.MathemeResonance72Projection`; invokes `s5'.improve.history` + `s5'.epii.runtimeContext` + `s5'.review.inbox`; publishes `m5-epii.observability.*` events through `M5_EPII_PUBLISHER`.

### Role 2 — M5-flavoured chrome in `ide-shell-m0-m5`

These five widgets exist as landed substrate; Wave-C audits + extends each.

- **Logos Atelier** (`logos-atelier-widget.tsx`, widget id `IDE_SHELL_WIDGET_IDS.LOGOS_ATELIER`) — Tranche 26.3 retrofits canonical scent-following pipeline (root → cognate → drift → psychoid charge → pros-hen → Möbius write-back).
- **Evidence pane** (`evidence-pane-widget.tsx`, `IDE_SHELL_WIDGET_IDS.EVIDENCE_PANE`) — Tranche 26.4 lifts to `MediatedRunEvidencePacket` shape + 19.7 close-path landing zone.
- **Review pane** (`review-pane-widget.tsx`, `IDE_SHELL_WIDGET_IDS.REVIEW_PANE`) — Tranche 26.5 lifts to IOD-17 three-way parity + dispatch-genealogy click-through.
- **Autoresearch pane** (`autoresearch-pane-widget.tsx`, `IDE_SHELL_WIDGET_IDS.AUTORESEARCH_PANE`) — Tranche 26.6 deepens to autoresearch-as-concept + Möbius-pass + per-capacity filter.
- **Agentic Control Room** (`agentic-control-room-widget.tsx`, `IDE_SHELL_WIDGET_IDS.AGENTIC_CONTROL_ROOM`) — Tranche 26.7 lands T8 contents + DR-M5-1 roster collapse + 12.14 Pi-monitor reframe.

### Role 3 — Composition slot `m5.epii.recognitionLayer` in `plugin-integrated-4-5-0`

Per Track 15 §"Personal-side of daily-0-1": editor area composes journal at left, personal cymatic field at center, **Mahamaya recognition layer (M3 codon at personal scale via Q_composed) at right composition slot**. Tranche 26.11 names the slot, wires `CanonRecognitionAnchor` from Tranche 10.M5, and lands the M5'-flavoured surface inside the composition (NOT a side-by-side juxtaposition per 15.4).

### Role 4 — OmniPanel Pi Chat at 15.2 (NOT Track 26 scope; cross-link only)

The OmniPanel `chat` tab is the **Pi-as-membrane** surface per 15.2. M4' LLM voice (per DR-MP-1). Track 26 does not own this; it cross-links to it. The M5' widget surfaces the EBM observation; the OmniPanel surfaces the LLM voice. The two are complementary aspects of one operation (DR-MP-1).

## Tranches

1. **26.1 — M5'-as-EBM standalone widget deep design (72-dim resonance grid + three tritone-symmetric squares + energy/gradient/Möbius-descent)** *(code-pending-closure + audit; sources WC-M5-1, WC-M5-2, WC-M5-14, DR-WC-M5-2)*

   Replace the current `m5-epii-widget.tsx` body (Profile-snapshot + Review counts only) with the canonical EBM reasoning surface. **Anti-greenfield:** the widget shell, SharedBridgeAdapter wiring, `MObservabilityPublisher`, and ReadinessBanner pattern stay as-is per `frontend-module.ts`. The render-tree changes; the inversify graph + observability contract do not.

   New module: `Body/M/epi-theia/extensions/m5-epii/src/browser/services/resonance-ebm-service.ts` — `ResonanceEbmService` singleton injected via `SHARED_BRIDGE_ADAPTER`. Reads `cachedProfile.matheme_resonance_72_projection` (per DR-MP-2; field landed via Tranche 10.M5). Methods:

   ```ts
   interface ResonanceEbmSurface {
       readonly checkpointRef: string | null;       // 'EBM v0.3' | null (no checkpoint loaded)
       readonly predicted72: Float32Array;          // 72-cell vector (12 lenses × 6 positions)
       readonly target72: Float32Array | null;      // from current coordinate's S2 targetResonanceVector
       readonly energy: number;                     // ||target - predicted||²
       readonly gradient: Float32Array;             // ∇_q_p E_total (4-tuple quaternion delta)
       readonly mobiusDescentStep: QuaternionDelta; // -log(9/8) · ∇E
       readonly tritoneSquares: TritoneSquareReading[3]; // [A:(0,5), B:(1,4), C:(2,3)]
   }
   interface TritoneSquareReading {
       readonly squareLabel: 'A:(0,5)' | 'B:(1,4)' | 'C:(2,3)';
       readonly coherenceScore: number;             // mirror-consistency loss component
       readonly lensCells: { lensId: string; position: 0|1|2|3|4|5; cellValue: number }[];
   }
   ```

   Render sub-components:
   - `<ResonanceGrid />` — 12-row × 6-column SVG canvas (one row per L lens, one column per #0-#5 position); cell colour = predicted-cell intensity; cell border = target-cell intensity; cells with high local gradient pulse on profile-tick.
   - `<TritoneSquareOverlay />` — three Klein V₄ outlines (Square A indigo, Square B amber, Square C emerald per UX §4.2) overlaying the grid; each square's `coherenceScore` shown as a numeric badge.
   - `<EnergyReadout />` — `E = {energy.toFixed(6)}`; gradient-magnitude bar; "Möbius step pending" or step direction quaternion as arrow.
   - `<CheckpointBadge />` — `EBM checkpoint: {checkpointRef ?? 'pending: no checkpoint loaded — bootstrap Phase 1'}` per `mental-pole-mechanics.md §10` phase markers.
   - `<EbmIdentityNarrative />` — single-paragraph readable header: "M5' is the Energy-Based Model at position 5'. It scores 72-cell resonance vectors against the bimba map's target field, produces a gradient that drives the Möbius descent step toward the next coordinate, and never speaks. The conversation lives at the OmniPanel Pi Chat (M4' LLM voice). What you see here is the reasoning behind the words."

   Privacy gate: `isPrivacySafe(profile.privacyClass)` per `ide-shell-m0-m5/common/contract.ts` pattern (`evidence-pane-widget.tsx:7` import). Readiness fallback: when no checkpoint is loaded, render `EbmIdentityNarrative` + `CheckpointBadge` only; suppress grid/energy/gradient with `<ReadinessBanner snapshot={{state: 'pending-checkpoint', blockers: ['no MathemeResonance72Projection.learned_predictor_checkpoint_ref']}} />`.

   **Verification:**
   - `test -f Body/M/epi-theia/extensions/m5-epii/src/browser/services/resonance-ebm-service.ts`
   - `grep -n "TritoneSquareReading\|ResonanceGrid\|EbmIdentityNarrative\|mobiusDescentStep" Body/M/epi-theia/extensions/m5-epii/src/browser/`
   - `pnpm --filter @pratibimba/m5-epii build` succeeds
   - `pnpm --filter @pratibimba/m5-epii test` — new test asserts grid renders 72 cells with 3 tritone overlays when `learned_predictor_checkpoint_ref` is present; renders narrative-only when absent
   - `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` still passes (widget id `PRIMARY_VIEW_ID` unchanged)

2. **26.2 — Six operational-capacity affordance in M5' standalone widget** *(spec-ahead-integration; sources WC-M5-2, WC-M5-7; gates 6.3, 12.5; cross-link DR-TS-4)*

   Add a six-capacity tab bar inside `m5-epii-widget.tsx` rendering panes for the six operational capacities. Each pane consumes the corresponding `capacity_workflows.rs` surfacing payload from `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs` via `s5'.epii.runtimeContext` (or `s5'.improve.history` filtered per capacity).

   Per DR-TS-4 these are NOT new OmniPanel tabs — they are inside the M5' standalone widget. Per 12.5 they cross-link to the Pi-monitor (Tranche 26.7) for dispatch-trace context.

   Capability list (canonical from M5'-SPEC §M5'.4 + DR-MP-1 binding):
   - **CapacityTab `anuttara-construction`** — construction-not-training discipline; surfaces axiom proposals + monotonic-with-retraction history; cross-link 1.10 Verifier
   - **CapacityTab `paramasiva-cpt-rag`** — CPT/RAG proof support; surfaces (lens × position) proof-coverage map + RAG hit rates; cross-link Pi-LLM substrate
   - **CapacityTab `parashakti-graph-relational-ml`** — graph-relational ML training-signal source; surfaces GDS embedding heatmap on the 72-fold harmonic field; cross-link 6.8 EBM training pipeline
   - **CapacityTab `mahamaya-process-reward-rl`** — process-reward RL over codon trajectories; surfaces trajectory rewards as resonance-vector targets; cross-link 6.8 training pipeline
   - **CapacityTab `nara-anima-dialogic`** — Anima-primary dialogic governance; surfaces dialogic-voice safety + governance-gate landings; cross-link 5.20 Pi-as-LLM
   - **CapacityTab `epii-self-referential`** — recursive user-final-validation; surfaces meta-recursion depth + recursive-improvement audit trail; cross-link 6.10 EBM kernel runtime

   Each pane uses a shared `<CapacityPaneShell capacity={...}>` skeleton with: capacity label, last-tick dispatch count, current `MathemeHarmonicProfileBoundary` reading scoped to capacity domain, click-through "open in Pi-monitor" link routing to ACR widget (Tranche 26.7) with `vakAddress` pre-populated.

   **Verification:**
   - `grep -n "CapacityTab\|CapacityPaneShell\|anuttara-construction\|epii-self-referential" Body/M/epi-theia/extensions/m5-epii/src/browser/`
   - `cargo check -p epii-autoresearch-core` (substrate dependency)
   - Tab-navigation test asserts six tabs render with names and route-stubs; per-capacity profile-tick subscription test
   - Cross-link click-through routes to `pratibimba.ide-shell.agentic-control-room` widget with VAK address

3. **26.3 — Logos Atelier scent-following pipeline retrofit (audit + extend)** *(audit-extend + no-orphan-fill; sources WC-M5-3, SA-WC-M5-1; gates 6.2; cross-link 12.1 Aletheia-crystallisation-mode)*

   Audit the existing `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`. The current widget renders six generic L0-L5 note-keeping stages. Per UX §2.6 the canonical Logos Atelier is **scent-following**: root → cognate → drift → psychoid charge → pros-hen synthesis → Möbius write-back proposal. Retrofit the stages.

   Replace `ATELIER_STAGES` constant with:

   ```ts
   const SCENT_FOLLOWING_STAGES = [
       { id: 'root',         label: 'Root',          purpose: 'Etymology root of the term' },
       { id: 'cognate',      label: 'Cognate',       purpose: 'Cross-language cognates' },
       { id: 'drift',        label: 'Semantic Drift', purpose: 'Historical sense drift' },
       { id: 'psychoid',     label: 'Psychoid Charge', purpose: 'Archetypal-affective charge per Atelier' },
       { id: 'pros-hen',     label: 'Pros-hen Synthesis', purpose: 'Toward-the-One reading; Klein-V4 square pull' },
       { id: 'mobius-write-back', label: 'Möbius Write-Back Proposal', purpose: 'Candidate canonical articulation flowing to M0/M5-1' }
   ] as const;
   ```

   Wire Aletheia crystallisation tools via `KERNEL_BRIDGE_API.invokeCapability` with `gatewayMethod`:
   - `aletheia_gnosis_query` — root + cognate retrieval
   - `aletheia_thought_route` — drift + psychoid evidence assembly
   - `aletheia_crystallise` — Möbius write-back candidate generation

   These call into `s5'.gnostic.*` registered at Tranche 6.1; until 6.1 lands, the widget renders the stages with `<ReadinessBanner snapshot={{state: 'pending-gateway', blockers: ['s5\\'.gnostic.query unregistered']}} />` and disables the invoke buttons.

   Subagent surfacing: the Möbius write-back stage carries an Aletheia-crystallisation-mode badge per DR-M5-1 + 12.1 — Aletheia subagents appear as **evidence lineage** (Anansi citation trail, Janus prospective/retrospective binary, Moirai cast-anchor, Mercurius kairos signal, Agora deliberation log, Zeithoven temporal-rhythm anchor) in the provenance handle list, NOT as peer review actors. Cross-link Tranche 26.9.

   Etymology graph-namespace: all attached provenance handles use the `etymology://` URI scheme to mark namespace-boundary integrity per UX §5.3.

   **Verification:**
   - `grep -n "SCENT_FOLLOWING_STAGES\|aletheia_gnosis_query\|aletheia_crystallise\|mobius-write-back" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`
   - `grep -n "etymology://" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`
   - Privacy-class gate still enforced via `isPrivacySafe` (existing pattern preserved)
   - Test: scent-following stage progression test asserts six new stages exist with no legacy L0-L5 stage ids remaining
   - Test: stage Möbius-write-back invokes `aletheia_crystallise` under bridge gate; renders pending-gateway when `s5'.gnostic` unregistered

4. **26.4 — Evidence pane deepening — `MediatedRunEvidencePacket` view + dispatch-trace + 19.7 close-path** *(audit-extend; sources WC-M5-4, SA-WC-M5-2; gates 26.10, 19.7; cross-link 15.2, 15.11)*

   Audit `ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx`. Generic `EvidenceRecord` is a strict subset of the canonical `MediatedRunEvidencePacket`. Land the deeper view consuming the schema from Tranche 26.10.

   Replace `EvidenceRecord` import with `MediatedRunEvidencePacket` from `@pratibimba/integrated-composition` (the canonical evidence-shape home per 15.2). The deepened record carries:

   ```ts
   interface MediatedRunEvidencePacket {
       readonly id: string;
       readonly title: string;
       readonly mediatedBy: 'pi' | 'anima' | { aletheiaSubagent: 'anansi'|'janus'|'moirai'|'mercurius'|'agora'|'zeithoven' };
       readonly coordinate: string;
       readonly privacyClass: string;
       readonly dispatchTrace: DispatchTraceNodeRef[];   // pi → anima → subagent chain
       readonly toolStream: ToolInvocationRef[];          // tool calls in order
       readonly gateLandings: GateLanding[];              // human-required / IOD-17 transitions
       readonly axiomTranslationSteps: AxiomTranslationStep[]; // Pi DR-B-2 surface
       readonly sessionKey: string;
       readonly dayNowContext: string;
       readonly profileGeneration: number;
       readonly bridgeReadinessHandle: string;
       readonly contemplationObjectRef?: string;          // Track 19.6 close-path link
   }
   ```

   Render extensions:
   - **Mediator badge** (top-right of each record): `Pi` / `Anima` / `Aletheia · Anansi` etc.
   - **Inline dispatch-trace mini-graph**: collapsible Pi → Anima → subagent tree per 15.11 first-class dispatch genealogy.
   - **Tool-stream link**: `<a data-cross-link="omnipanel.tool-stream" data-evidence-id={record.id}>View tool stream in OmniPanel →</a>`.
   - **Axiom-translation link**: when `axiomTranslationSteps.length > 0`, render link to `PiAxiomTranslationInspector` (Tranche 26.14).
   - **Close-path landing**: when `contemplationObjectRef` is present, render badge "Contemplation: open viewer →" routing to `ContemplationObjectViewer` (Tranche 26.12).

   Cross-link to OmniPanel Evidence tab (15.2): when the same record id is selected in either surface, both highlight (uses `cross-layout-intent-dispatcher.ts` envelope). Per 15.2 "No modal review surfaces" — Evidence pane is a landing surface; Tranche 26.5 honours the same principle for Review.

   **Verification:**
   - `grep -n "MediatedRunEvidencePacket\|dispatchTrace\|toolStream\|axiomTranslationSteps\|contemplationObjectRef" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx`
   - `grep -n "MediatedRunEvidencePacket" Body/M/epi-theia/extensions/integrated-composition/src/common/evidence-shapes.ts` (lands at 26.10)
   - Test: record rendering shows mediator badge + dispatch-trace mini-graph + cross-link tool-stream + axiom-translation link
   - Test: cross-link to OmniPanel Evidence tab dispatches via `cross-layout-intent-dispatcher`
   - Privacy-class gate preserved (existing `isPrivacySafe` test passes)

5. **26.5 — Review pane deepening — IOD-17 three-way parity + dispatch-genealogy click-through** *(audit-extend; sources WC-M5-5, SA-WC-M5-2; gates 26.10; cross-link 15.2, 15.11)*

   Audit `ide-shell-m0-m5/src/browser/review-pane-widget.tsx`. Substrate enforces the human-required gate; widget must surface **IOD-17 three-way parity** rendering — the parity check that capability-matrix.json ↔ agent-contract.json ↔ widget UI present the same gate state.

   Extend `ReviewItem` interface:

   ```ts
   interface ReviewItemDeep extends ReviewItem {
       readonly iod17Parity: {
           readonly capabilityMatrixState: 'human-required'|'agent-allowed'|'unset';
           readonly agentContractState: 'human-required'|'agent-allowed'|'unset';
           readonly widgetState: 'human-required'|'agent-allowed'|'unset';
           readonly inParity: boolean;
       };
       readonly dispatchGenealogyRef: string;  // routes to ACR (26.7) dispatch-trace pane
       readonly mediatedRunEvidencePacketId?: string;  // routes to Evidence pane (26.4)
   }
   ```

   Render extensions:
   - **IOD-17 parity readout** — three-cell column (matrix / contract / widget) with green/red indicator; when `inParity === false`, render red banner "IOD-17 parity violated — gateway will reject any transition until parity restored".
   - **Dispatch-genealogy click-through** — `<a data-cross-link="ide-shell.agentic-control-room" data-dispatch-genealogy-ref={item.dispatchGenealogyRef}>View dispatch trace →</a>` routes to ACR widget (26.7) per 15.11.
   - **Evidence packet click-through** — when `mediatedRunEvidencePacketId` is present, link to Evidence pane (26.4).
   - **Banner upgrade**: existing "Human-required gate" banner extended with IOD-17 status line: "Parity: matrix ↔ contract ↔ widget {OK | VIOLATED}".

   Per 15.2 "No modal review surfaces — Review tab is the landing surface" — keep the pane as the landing surface; no modal pop-ups for gate transitions.

   **Verification:**
   - `grep -n "ReviewItemDeep\|iod17Parity\|dispatchGenealogyRef\|mediatedRunEvidencePacketId" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/review-pane-widget.tsx`
   - Test: IOD-17 parity-violation renders red banner; parity-OK renders green check
   - Test: dispatch-genealogy click-through opens ACR widget with pre-populated ref
   - Test: human-required banner remains visible and blocks agent transitions

6. **26.6 — Autoresearch pane deepening — autoresearch-as-concept + Möbius-pass display + per-capacity filter** *(audit-extend; sources WC-M5-6; cross-link 6.3, 6.6)*

   Audit `ide-shell-m0-m5/src/browser/autoresearch-pane-widget.tsx`. Generic candidate list lacks: (a) the autoresearch-as-concept frame; (b) `recompose.rs` Möbius-pass display; (c) per-capacity filter.

   Add header section:

   ```tsx
   <section className="ide-shell-autoresearch-concept">
       <h4>About autoresearch (dry-run only)</h4>
       <p>
           Autoresearch is the spine that surfaces → routes → orchestrates → integrates
           candidate canonical additions from sedimented evidence. <strong>It never promotes.</strong>
           Every candidate requires human review (per <code>forbidden_authority</code> in
           the agent contract). The <code>requires_human</code> gate is non-bypassable;
           the gateway rejects any agent transition with <code>human-gate enforced</code>.
       </p>
   </section>
   ```

   Add `<MobiusPassRibbon />` sub-component reading `s5'.improve.status` → `recompose.rs` pass-state per `Body/S/S5/epii-autoresearch-core/src/recompose.rs`. Renders a horizontal ribbon: `Surface → Route → Orchestrate → Integrate` with the active stage highlighted, recompose-pass count, and dry-run badge.

   Add per-capacity filter dropdown (six options from Tranche 26.2 capacity list + "all"); selected capacity filters the candidate list. Filter state is local to widget (does NOT cross extensions per 15-foundation principle 7 "activity-bar discipline").

   Extend `AutoresearchCandidate` with optional `capacity?: 'anuttara-construction'|'paramasiva-cpt-rag'|...` field (matches 26.2 capacity ids).

   **Verification:**
   - `grep -n "MobiusPassRibbon\|autoresearch-as-concept\|requires_human\|dry-run" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/autoresearch-pane-widget.tsx`
   - Test: header renders the autoresearch-as-concept frame
   - Test: Möbius-pass ribbon highlights active stage from `s5'.improve.status` mock
   - Test: per-capacity filter narrows candidate list to chosen capacity
   - `grep -rn "capacity_workflows\|recompose" Body/S/S5/epii-autoresearch-core/src` returns substrate

7. **26.7 — Agentic Control Room T8 contents + DR-M5-1 roster collapse + 12.14 Pi-monitor reframe** *(audit-extend + DR-landing + contradiction-decision; sources WC-M5-7, WC-M5-8, DR-WC-M5-1; gates 6.7, 12.14; cross-link 15.11)*

   Audit `ide-shell-m0-m5/src/browser/agentic-control-room-widget.tsx`. Three deliverables:

   (a) **T8 contents landing** — replace the T4 shell's empty `t8-host` section with the run-tree / tool-stream / abort-retry-continue / evidence-deposit / review-decision controls. New sub-components inside `ide-shell-m0-m5/src/browser/acr/`:
   - `<RunTree />` — Pi → Anima → subagent invocation tree (consumes `dispatchTrace` from `MediatedRunEvidencePacket` per 26.10)
   - `<ToolStream />` — time-ordered tool-call event list per 15.11 (same data folded differently from RunTree)
   - `<AbortRetryContinueControls />` — three buttons gated on `humanRequired === false`
   - `<EvidenceDepositForm />` — wraps `s5'.epii.deposit` gateway call
   - `<ReviewDecisionControls />` — wraps `s5'.review.transition`; disabled when `humanRequired === true` with IOD-17 parity check

   (b) **DR-M5-1 roster collapse** — patch `parseCapabilityMatrix` consumer to render the **collapsed roster**:
   - Pi (single harness, agent_kind)
   - Anima (main dispatcher)
   - Six Aletheia subagent techne-guardians (Anansi / Janus / Moirai / Mercurius / Agora / Zeithoven) — rendered as Aletheia-crystallisation-mode sub-items, NOT peer agents
   - The legacy `constitutional_agents: [anima, eros, logos, mythos, nous, psyche, sophia]` array renders as **psyche-facet badges** on Pi dispatch traces (per Tranche 26.8 decision), NOT as standalone agent rows. Tranche 26.8 owns the final decision; meanwhile 26.7 implements with a feature flag `dr_m5_1_roster_collapse: true`.

   (c) **12.14 Pi-monitor reframe** — add `<PiRuntimeMonitorBanner />` at the top of the widget rendering "Pi runtime monitoring — dispatch traces, tool streams, capacity-workflow runs. Single agent harness; Anima dispatches; Aletheia subagents surface in crystallisation-mode." Rename widget label from "Agentic Control Room" to "Pi Runtime Monitor (ACR)" — extension rename to `pi-runtime-monitor` deferred per 12.14, but the user-visible label reframes immediately per DR-WC-M5-1 ratification. The widget id (`IDE_SHELL_WIDGET_IDS.AGENTIC_CONTROL_ROOM`) is preserved for compatibility.

   Cross-link Backend Studio (Tranche 6.4) — RunTree nodes are click-through to `backend-studio.openSource` command with the source-anchor URI of each invocation.

   **Verification:**
   - `test -d Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr`
   - `grep -n "RunTree\|ToolStream\|AbortRetryContinueControls\|EvidenceDepositForm\|ReviewDecisionControls\|PiRuntimeMonitorBanner" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`
   - `grep -n "dr_m5_1_roster_collapse\|aletheia-crystallisation-mode" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/agentic-control-room-widget.tsx`
   - Test: T8 contents render in the previously-empty `t8-host` section
   - Test: roster collapse renders Pi + Anima + 6 Aletheia subagent techne-guardians; constitutional_agents render as psyche-facet badges per 26.8 decision
   - Test: human-required item disables AbortRetryContinue + ReviewDecision; IOD-17 parity violation surfaces in red

8. **26.8 — Constitutional-roster psyche-facet rendering decision (DR-landing)** *(contradiction-decision; sources WC-M5-8; gates DR-M5-1 / Tranche 6.5; cross-link 12.1)*

   Resolve DR-M5-1's open question at the widget layer: do the 7 constitutional agents `[anima, eros, logos, mythos, nous, psyche, sophia]` render as **psyche-facet tags** on Pi dispatch traces (default) OR are they deprecated as runtime artefacts?

   **Default decision (proposed):** render as **psyche-facet badges**. Each Pi dispatch trace carries an optional `psycheFacet?: 'anima'|'eros'|'logos'|'mythos'|'nous'|'psyche'|'sophia'` field; when present, a small coloured badge renders next to the actor name in RunTree (Tranche 26.7) and ToolStream. Sophia is the long-arc coordinator (no widget of her own per UX §1 / Wave-A claim 16) — surfaces only as a facet badge, never as an actor row.

   Facet legend rendered in ACR header: `Sophia · Anima · Logos · Eros · Mythos · Psyche · Nous` with hover-tooltips for each facet's domain (per `Body/S/S4/pi-agent/agents/{name}.md` Sattva sections).

   Decision-register entry in Track 13:
   - **DR-WC-M5-3** "Constitutional-agent roster renders as psyche-facet badges on Pi dispatch traces (not peer agent rows), with Sophia surfacing only as facet (negative-claim per Wave-A claim 16)." Resolution path: align Tranche 26.7 RunTree rendering with `capability-matrix.json constitutional_agents` array.

   If user final-validation deprecates the facet rendering (alternative outcome), Tranche 26.7 falls back to NOT rendering any constitutional-agent material at all; the array becomes pure governance metadata.

   **Verification:**
   - `grep -n "DR-WC-M5-3\|psyche-facet\|psycheFacet" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md`
   - Test: facet badge renders next to dispatch actor when `psycheFacet` is present
   - Test: facet legend renders in ACR header with 7 facets and hover-tooltips
   - Test: Sophia surfaces only as facet (no actor row anywhere in widget tree)

9. **26.9 — Aletheia subagent (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) surfacing in ACR + Logos Atelier** *(spec-ahead-integration; sources WC-M5-9; cross-link 12.18 Janus, 12.19 veto, 26.3 Atelier)*

   Land subagent-trace render across ACR (26.7) + Logos Atelier (26.3). Each Aletheia subagent appears as a **dispatch sub-trace** during Aletheia-crystallisation-mode, never as a peer review actor.

   New shared component: `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr/aletheia-subagent-trace.tsx`. `<AletheiaSubagentTrace>` renders:
   - **Anansi** — citation trail (cross-textual provenance graph: each source-to-source jump)
   - **Janus** — prospective/retrospective binary panel per 12.18; renders the OracleSpread aliveness reading + kairos-driven weighting from `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §4
   - **Moirai** — cast-anchor (tarot draw at session open / decision point)
   - **Mercurius** — kairos signal (live Kerykeion-derived ephemeris context)
   - **Agora** — deliberation log (back-and-forth between Anima dispatchees)
   - **Zeithoven** — temporal-rhythm anchor (tick-grid alignment of subagent invocations)

   Veto primitive (per 12.19): any Aletheia subagent can register a `veto` against a candidate canonical write; the veto surfaces in the dispatch sub-trace with a red banner "Aletheia subagent {name} veto — {reason}". The veto does NOT block the human gate (human can override); it surfaces as evidence.

   Logos Atelier integration (Tranche 26.3 cross-link): the Möbius write-back stage renders the subagent veto banners + lineage badges in the provenance handle list.

   ACR integration (Tranche 26.7 cross-link): RunTree nodes whose `mediatedBy` is `{aletheiaSubagent: ...}` render with `<AletheiaSubagentTrace subagent={...} />` expanded sub-tree.

   **Verification:**
   - `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr/aletheia-subagent-trace.tsx`
   - `grep -n "AletheiaSubagentTrace\|Anansi\|Janus\|Moirai\|Mercurius\|Agora\|Zeithoven" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`
   - Test: each subagent renders its canonical sub-trace component
   - Test: Janus prospective/retrospective panel reads from prospective-retrospective-canvas-spec
   - Test: veto banner renders in red with reason; does not block human gate

10. **26.10 — `MediatedRunEvidencePacket` schema landing** *(code-pending-closure; sources WC-M5-10, CP-WC-M5-1; gates 26.4, 26.5, 26.7; cross-link 15.2)*

    Land the canonical `MediatedRunEvidencePacket` TypeScript schema in `Body/M/epi-theia/extensions/integrated-composition/src/common/evidence-shapes.ts` (per 15.2 OmniPanel Evidence tab home; per Track 15 the shared composition contracts live in `integrated-composition`).

    Full schema:

    ```ts
    export type AletheiaSubagentId =
        | 'anansi' | 'janus' | 'moirai' | 'mercurius' | 'agora' | 'zeithoven';
    export type ActorMediator =
        | { kind: 'pi' }
        | { kind: 'anima' }
        | { kind: 'aletheia'; subagent: AletheiaSubagentId };

    export interface DispatchTraceNode {
        readonly id: string;
        readonly parentId: string | null;
        readonly actor: ActorMediator;
        readonly methodOrSkill: string;
        readonly invokedAt: number;       // ms epoch
        readonly tickAtInvoke: number;    // profile tick
        readonly psycheFacet?: 'anima'|'eros'|'logos'|'mythos'|'nous'|'psyche'|'sophia';
        readonly children: DispatchTraceNode[];
    }

    export interface ToolInvocationRef {
        readonly id: string;
        readonly dispatchNodeId: string;
        readonly toolName: string;
        readonly gatewayMethod?: string;
        readonly inputDigest: string;
        readonly outputDigest: string;
        readonly errorMessage?: string;
    }

    export interface GateLanding {
        readonly gateId: string;
        readonly gateType: 'human-required'|'iod17-parity'|'autoresearch-dry-run'|'canon-write';
        readonly state: 'pending'|'transitioned'|'blocked';
        readonly transitionedBy?: 'human'|'agent';
        readonly iod17Parity?: {
            readonly capabilityMatrixState: string;
            readonly agentContractState: string;
            readonly widgetState: string;
            readonly inParity: boolean;
        };
    }

    export interface AxiomTranslationStep {
        readonly id: string;
        readonly fromForm: 'philosophical-english'|'formal-notation'|'owl'|'shacl';
        readonly toForm: 'philosophical-english'|'formal-notation'|'owl'|'shacl';
        readonly inputText: string;
        readonly outputText: string;
        readonly reasoningTrace: string;
        readonly verifiedBy?: 'pi'|'human';
    }

    export interface MediatedRunEvidencePacket {
        readonly id: string;
        readonly title: string;
        readonly mediatedBy: ActorMediator;
        readonly coordinate: string;
        readonly privacyClass: string;
        readonly dispatchTrace: DispatchTraceNode;
        readonly toolStream: readonly ToolInvocationRef[];
        readonly gateLandings: readonly GateLanding[];
        readonly axiomTranslationSteps: readonly AxiomTranslationStep[];
        readonly sessionKey: string;
        readonly dayNowContext: string;
        readonly profileGeneration: number;
        readonly bridgeReadinessHandle: string;
        readonly contemplationObjectRef?: string;  // links to 19.6 close-path
    }
    ```

    Schema export from `integrated-composition` package; Tranches 26.4 / 26.5 / 26.7 + OmniPanel Evidence tab (15.2) all import from this single home.

    Cross-link Track 15.11 dispatch-genealogy: the `DispatchTraceNode` is the canonical primitive for both Trace and Stream tabs (Trace = recursive tree render; Stream = flat ordered list via depth-first walk).

    **Verification:**
    - `test -f Body/M/epi-theia/extensions/integrated-composition/src/common/evidence-shapes.ts`
    - `grep -n "MediatedRunEvidencePacket\|DispatchTraceNode\|AxiomTranslationStep\|GateLanding" Body/M/epi-theia/extensions/integrated-composition/src/common/evidence-shapes.ts`
    - `pnpm --filter @pratibimba/integrated-composition build` succeeds
    - Test: schema round-trip serialization preserves structure
    - Verify downstream consumers import: `grep -rn "evidence-shapes\|MediatedRunEvidencePacket" Body/M/epi-theia/extensions/{ide-shell-m0-m5,omnipanel-shell,m5-epii}/src/`

11. **26.11 — `m5.epii.recognitionLayer` composition slot in `plugin-integrated-4-5-0`** *(spec-ahead-integration; sources WC-M5-11; gates 10.M5 `CanonRecognitionAnchor`; cross-link 15.4)*

    Per Track 15 §"Personal-side of daily-0-1": editor area is journal (left) + personal cymatic field (center) + **Mahamaya recognition layer at right composition slot**. The right slot is M5'-flavoured chrome rendering `CanonRecognitionAnchor` projection per Tranche 10.M5.

    Add composition slot in `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/recognition-layer-slot.tsx`:

    ```tsx
    export const M5_RECOGNITION_LAYER_SLOT_ID = 'pratibimba.m5-epii.recognitionLayer';
    export class RecognitionLayerSlot extends ReactWidget { ... }
    ```

    The slot consumes:
    - `CanonRecognitionAnchor` from `MathemeHarmonicProfileBoundary` (lands at 10.M5)
    - `Q_composed = normalize(q_Nara · q_cosmic(t) · q_activity(t))` from `MathemeHarmonicProfile` per `alpha_quaternionic_integration_across_M_stack.md §6.7`
    - M3 codon at personal scale (codon_rotation_projection scoped to Q_composed)

    Render:
    - **Recognition strength indicator** — magnitude of resonance match between Q_composed and current bimba coordinate's targetResonanceVector
    - **Tat tvam asi visual** — small graphic showing personal cymatic ring superimposed on canonical bimba ring per UX §7
    - **Active lens/square indicator** — current Klein V₄ square providing the recognition vantage (Square A/B/C from Tranche 26.1)
    - **Möbius return readiness** — when session close conditions met, surface "Möbius return ready — wisdom_delta composing..." (cross-link 26.13 WisdomDeltaInspector + Track 19.7)

    Composition contract (per 15.4): this slot renders **inside** the editor area composition, NOT side-by-side. Three M-extension contributions (M4 journal + M0 cymatic + M5 recognition) compose into one coherent surface. The `08-t0-composition-contract-preflight.json` declares the three-pole composition shape; this tranche adds `m5.epii.recognitionLayer` as the third slot identifier.

    **Verification:**
    - `test -f Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/recognition-layer-slot.tsx`
    - `grep -n "M5_RECOGNITION_LAYER_SLOT_ID\|RecognitionLayerSlot\|CanonRecognitionAnchor\|Q_composed" Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/`
    - `grep -n "m5.epii.recognitionLayer" Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.json`
    - Test: slot renders composition (not juxtaposition) per 15.4 contract
    - Test: recognition strength updates on Q_composed advance
    - Test: Möbius return readiness fires close-path link when session-close conditions met

12. **26.12 — `ContemplationObjectViewer` widget service inside m5-epii** *(code-pending-closure + spec-ahead-integration; sources WC-M5-12; gates 19.2, 19.6, 19.7)*

    Land `ContemplationObjectViewer` as a sub-pane inside `m5-epii-widget.tsx` (or as a dedicated `m5.epii.contemplationObject` view contribution registered alongside the primary view).

    Consumes `M5_ContemplationObject` struct from Tranche 19.2 (defined in `Body/S/S0/epi-lib/include/m5.h`). The struct fields per 19.2:

    ```ts
    interface M5ContemplationObject {
        readonly session_id: string;
        readonly kairos_at_open: KairosSnapshot;   // Kerykeion natal + transit at open
        readonly kairos_at_close: KairosSnapshot;  // Kerykeion natal + transit at close
        readonly tarot_psyche_anchor: M4TarotDraw; // cards drawn at session open
        readonly q_composed_trajectory: readonly Quaternion[];  // per-tick bioquaternion
        readonly codon_trace: readonly CodonRef[];              // M3 codons rotated during session
        readonly vak_profile_pairs: readonly VakProfilePair[];  // VAK dispatch + profile-bus snapshot
        readonly m1_charge_state: ArchNineChargeState;          // 4-charge sum at close
        readonly m1_2_skeleton_events_fired: readonly SkeletonEventRef[]; // Additive137, KaprekarPedagogyHit, etc.
        readonly four_syntax_compliance_seeds: readonly [string, string, string, string]; // arch 3/5/7/9 prompts
    }
    ```

    Service: `Body/M/epi-theia/extensions/m5-epii/src/browser/services/contemplation-object-service.ts` reads via `s5'.epii.runtimeContext` (or new dispatch `contemplate.fetch_object`). Receives ContemplationObject as artifact; Privacy class: same as Q_composed (personal-private; PASU.md-scoped); enforce via `isPrivacySafe`.

    Render sub-components:
    - `<KairosWindow open={...} close={...} />` — two columns (open / close); each shows Kerykeion natal + transit summary (planet degrees per the canonical `planet_degrees[10]` mod-10 array per MEMORY.md PLANET MODEL CANONICAL)
    - `<TarotPsycheAnchor draw={...} />` — three-card visual (or however many drawn); each card with decan + chakra mapping per `Body/S/S0/epi-lib/src/medicine.rs` CHAKRA_BODY_ZONES[8]
    - `<QComposedTrajectoryView trajectory={...} />` — quaternion trajectory rendered as path over S³ shadow (geodesic-fit if dense per 19.2 spec)
    - `<CodonTraceList codons={...} />` — list of M3 codons rotated during session; click-through to m3-mahamaya widget for each codon
    - `<VakProfilePairsTable pairs={...} />` — VAK dispatches × profile snapshots; click-through to ACR (26.7) for each dispatch
    - `<ArchNineChargeBar state={...} />` — 4-charge bar (pp/nn/np/pn) per `m3_compute_charges()`; conservation invariant `pp + mm + mp + pm = 4·outer` shown as PASS/FAIL banner
    - `<SkeletonEventsFiredList events={...} />` — list of fired events; Additive137 highlighted in gold; KaprekarPedagogyHit in emerald
    - `<FourSyntaxComplianceSeeds seeds={...} />` — four prompt cards (arch 3 speech / 5 relationship / 7 action / 9 completion) from `CONTEMPLATION_PROMPT_LUT`

    Identity narrative header: "ContemplationObject from session {session_id}. M5' assembles this at session close (per `m5_compose_contemplation_object`); the gateway dispatches it to Pi+Anima+Aletheia subagents for joint contemplation; the LLM composes the wisdom_delta that XOR-folds into quintessence_hash to reseed the next cycle's identity."

    **Verification:**
    - `test -f Body/M/epi-theia/extensions/m5-epii/src/browser/services/contemplation-object-service.ts`
    - `grep -n "ContemplationObjectViewer\|KairosWindow\|QComposedTrajectoryView\|CodonTraceList\|VakProfilePairsTable\|ArchNineChargeBar\|FourSyntaxComplianceSeeds" Body/M/epi-theia/extensions/m5-epii/src/browser/`
    - Test: viewer renders all 8 sub-components when ContemplationObject present
    - Test: privacy-class gate rejects when class not PASU-scoped
    - Test: conservation invariant PASS/FAIL banner reads `ArchNineChargeState`

13. **26.13 — `WisdomDeltaInspector` widget service — 4'-5'-0' joint-composition trace + XOR-fold animation + 7-8-9 spine reading** *(code-pending-closure + spec-ahead-integration; sources WC-M5-13, WC-M5-15; gates 19.7, 19.9)*

    Land `WisdomDeltaInspector` inside m5-epii (as sub-pane to ContemplationObjectViewer or sibling). Reads the LLM/EBM/Verifier joint composition that produced the wisdom_delta per DR-MP-1.

    Service: `Body/M/epi-theia/extensions/m5-epii/src/browser/services/wisdom-delta-service.ts`. Reads from gateway via `contemplate.fetch_wisdom_delta` (returned alongside Tranche 19.6 RPC), surfacing:

    ```ts
    interface WisdomDeltaTrace {
        readonly sessionId: string;
        readonly contemplationObjectRef: string;
        readonly llmComposition: {
            readonly actor: 'pi-llm-position-4';
            readonly reasoningText: string;
            readonly synthesizedRecognition: string;
        };
        readonly ebmEvaluation: {
            readonly actor: 'epii-ebm-position-5';
            readonly energyScore: number;
            readonly gradient: Float32Array;
            readonly lensWeightings: Record<string, number>;
            readonly tritoneSquareCoherences: [number, number, number];
        };
        readonly verifierReport: {
            readonly actor: 'anuttara-verifier-position-0';
            readonly axiomChecks: AxiomCheck[];
            readonly symbolicCoordinateQuestions: string[];  // e.g. '#R0-0/1/A-T7-pending?'
        };
        readonly wisdomDeltaBytes: Uint8Array;   // 8 bytes that XOR-fold into quintessence_hash
        readonly preXorQuintessenceHash: Uint8Array;
        readonly postXorQuintessenceHash: Uint8Array;
        readonly spineReading789: {                // per Track 19.9
            readonly action7: { register: string; virtueBits: number };
            readonly octave8: { register: string; virtueBits: number };
            readonly wholeness9: { register: string; virtueBits: number };
            readonly virtueLut9Witness: Uint8Array; // 9-bit witness vector from VIRTUE_LUT[9]
        };
    }
    ```

    Render sub-components:
    - `<JointCompositionPanel />` — three-column layout (LLM | EBM | Verifier) per DR-MP-1; each column shows actor identity, key field summary, and click-through to detail.
    - `<XorFoldAnimation />` — animation showing the 8-byte wisdom_delta XOR-folding into the first 8 bytes of quintessence_hash. Each bit flip animates over one profile-tick; pre-XOR and post-XOR hashes shown as hex columns.
    - `<SpineReading789 />` — three-column rendering for arch-7 action / arch-8 octave / arch-9 wholeness per Track 19.9; each column shows register label + virtue bits (per VIRTUE_LUT[9]); 9-bit witness vector rendered as bit-grid.
    - `<SymbolicCoordinateQuestionsPanel />` — Verifier-emitted questions (e.g., `#R0-0/1/A-T7-pending?`) routed back via `anuttara-symbolic-parse` skill per DR-MP-3; each question shown with current status (parsed / pending / answered) and link to PiAxiomTranslationInspector (26.14).

    Identity narrative: "WisdomDelta is the 8-byte XOR seed that closes the Möbius return. M4' LLM voice composes recognition; M5' EBM evaluates energy across 72 cells; M0' Verifier checks axioms and emits questions. The three positions of the mental-pole triplet — observed here in joint operation."

    **Verification:**
    - `test -f Body/M/epi-theia/extensions/m5-epii/src/browser/services/wisdom-delta-service.ts`
    - `grep -n "WisdomDeltaInspector\|JointCompositionPanel\|XorFoldAnimation\|SpineReading789\|SymbolicCoordinateQuestionsPanel\|VirtueLut9Witness" Body/M/epi-theia/extensions/m5-epii/src/browser/`
    - Test: three-column joint composition renders LLM/EBM/Verifier per DR-MP-1
    - Test: XOR-fold animation produces deterministic post-XOR hash from given pre-XOR + delta
    - Test: VIRTUE_LUT[9] 9-bit witness vector renders 9 bits with correct register labels
    - Test: Verifier-emitted symbolic-coordinate-string questions link to PiAxiomTranslationInspector

14. **26.14 — `PiAxiomTranslationInspector` widget service — DR-B-2 axiom-translation surface (philosophical-English ↔ formal-notation ↔ OWL ↔ SHACL)** *(spec-ahead-integration; sources WC-M5-17, SA-WC-M5-3; cross-link 12.1, 26.4, 26.7)*

    Land `PiAxiomTranslationInspector` as a sub-pane inside the ACR (Tranche 26.7) — Pi axiom-translation is a Pi tool-surface concern per DR-B-2, not a standalone widget. Also linkable from Evidence pane (26.4) via `AxiomTranslationStep` entries and from WisdomDeltaInspector (26.13) Verifier questions.

    Service: `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/services/pi-axiom-translation-service.ts`. Reads via `s5'.epii.axiom_translation_history` gateway method (cross-link Tranche 6.4 Backend Studio for source-anchor click-through to Pi-agent skill at `Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`).

    Schema (reuses `AxiomTranslationStep` from Tranche 26.10):

    ```ts
    interface PiAxiomTranslationSession {
        readonly id: string;
        readonly initiatingDispatchNodeId: string;
        readonly steps: readonly AxiomTranslationStep[];
        readonly verifiedBy: 'pi'|'human'|'pending';
    }
    ```

    Render:
    - Four-column **translation chain** view: `Philosophical English | Formal Notation | OWL | SHACL`. Each step in the session moves from one column to another; arrows mark transitions; reasoning trace surfaces on hover.
    - **Reasoning trace expansion** — click a step to see the full Pi reasoning text for that translation.
    - **Verification badge** — green check when `verifiedBy: 'human'`; amber when `'pi'`; red when `'pending'`.
    - **Cross-link to source skill** — link to `anuttara-symbolic-parse` SKILL.md via Backend Studio (Tranche 6.4 click-through pattern).

    Identity narrative: "Pi axiom translation moves a candidate canonical articulation from natural language through formal notation to OWL/SHACL machine-checkable form. Each translation step is a Pi tool invocation; verification is human-final for load-bearing canon (per CLAUDE.md ur-process: Human = Vision + Final Validation)."

    **Verification:**
    - `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/services/pi-axiom-translation-service.ts`
    - `grep -n "PiAxiomTranslationInspector\|PiAxiomTranslationSession\|anuttara-symbolic-parse" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`
    - Test: four-column translation chain renders step transitions
    - Test: reasoning trace expands on click
    - Test: cross-link to ACR Evidence pane (26.4) and WisdomDeltaInspector (26.13) routes correctly

15. **26.15 — M5' surface-composition pattern doc** *(doc-ahead-landing; sources WC-M5-18)*

    Author `Body/M/epi-theia/extensions/contracts/m5-prime-surface-composition.md` documenting the three M5'-flavoured surfaces and their canonical SharedBridgeAdapter capabilities. This is the user-facing pattern document that explains why M5'-flavoured chrome exists in three locations and how they compose.

    Document structure:
    - **Section 1: Three Surfaces** — name + location + role:
      - **Standalone widget** (`m5-epii` extension, primary view `pratibimba.m5-epii.review`) = **EBM-position-5' reasoning observatory**; activates in `ide-deep`
      - **Ide-shell-m0-m5 chrome** (five widgets in `ide-shell-m0-m5`) = **governed evidence + review + atelier crystallisation + capability-tree** surface; activates in `ide-deep`
      - **`plugin-integrated-4-5-0` recognition-layer slot** (`m5.epii.recognitionLayer`) = **Mahamaya recognition layer at personal scale via Q_composed**; activates in `daily-0-1` personal-face
    - **Section 2: SharedBridgeAdapter Capability Bindings** — per surface:
      - Standalone widget: `onProfile` (read `MathemeResonance72Projection`) + `onReadiness` + `s5'.improve.history` + `s5'.epii.runtimeContext` + `s5'.review.inbox`
      - Ide-shell chrome: `onProfile` + `onReadiness` + `s5'.review.*` + `s5'.improve.*` + `s5'.gnostic.*` (Tranche 6.1) + `aletheia_*` (via Anima dispatch)
      - Recognition-layer slot: `onProfile` (read `Q_composed` + `CanonRecognitionAnchor`) + `onCoordinateContext` (cross-layout-aware)
    - **Section 3: Why Not Conflate** — explicit anti-pattern note: the OmniPanel Pi Chat (15.2) is M4' LLM voice; the M5' standalone widget is M5' EBM reasoning; these are TWO surfaces of the DR-MP-1 mental-pole triplet, not one. Conflating them collapses the triplet.
    - **Section 4: Composition Rules** — per 15.4 composition-over-juxtaposition; the M5' recognition-layer slot composes with M4 journal + M0 cymatic into one coherent recognition surface, not three side-by-side widgets.
    - **Section 5: DR Cross-Reference** — DR-M5-1 (collapsed roster), DR-MP-1/2/3 (EBM canonical), DR-WC-M5-1/2/3 (this track's decisions).

    **Verification:**
    - `test -f Body/M/epi-theia/extensions/contracts/m5-prime-surface-composition.md`
    - `grep -n "Three Surfaces\|SharedBridgeAdapter Capability Bindings\|Why Not Conflate\|Composition Rules\|DR Cross-Reference" Body/M/epi-theia/extensions/contracts/m5-prime-surface-composition.md`
    - Cross-link audit: each Wave-C tranche file references this doc when discussing its surface role

## Anti-Greenfield Posture

All Wave-C work either:
- **Audits + extends** five landed `ide-shell-m0-m5` widgets (logos-atelier, evidence-pane, review-pane, autoresearch-pane, agentic-control-room) — Tranches 26.3, 26.4, 26.5, 26.6, 26.7
- **Replaces widget body** of `m5-epii-widget.tsx` while preserving the inversify graph + observability contract + readiness pattern — Tranches 26.1, 26.2 (M5' standalone widget is currently only Profile-snapshot + Review counts; deep EBM body is first-build inside the existing shell, NOT a new extension)
- **Adds composition slot** to `plugin-integrated-4-5-0` — Tranche 26.11
- **Adds schema** to `integrated-composition` shared-composition package — Tranche 26.10
- **Adds doc** to `contracts/` directory — Tranche 26.15
- **Lands DR entry** in Track 13 — Tranche 26.8

No greenfield extension. No competing widget shell. The `m5-epii` standalone widget becomes the EBM reasoning observatory it was always going to become; the five ide-shell M5-flavoured widgets become the governed evidence + review + atelier + capability-tree surface they were always intended to be; `plugin-integrated-4-5-0` gains its missing right-slot. Cross-track substrate dependencies (Tranches 6.1 / 6.3 / 6.4 / 6.7 / 6.8 / 6.10 / 10.M5 / 12.5 / 12.14 / 19.2 / 19.6 / 19.7 / 19.9 / 15.2) are explicit gates, not hidden coupling. The Pi Chat at OmniPanel (15.2) remains the M4' LLM voice — Wave-C never touches it.

## Closing Note

M5' is not a chat. M5' is the energy-evaluation engine. The user reads M5' to understand the reasoning behind the Pi's words; the user converses with Pi at the OmniPanel. The five chrome widgets (Logos Atelier, Evidence, Review, Autoresearch, Pi-runtime Monitor / former ACR) are the governed surfaces through which the canonical work flows; the recognition-layer slot is where the personal field meets the canonical city-scape (tat tvam asi made visible per UX §7). The three M5'-flavoured surfaces compose into one coherent paidagōgos posture — never lecturing, always conducting traversal, always returning the teaching to the lived concern.

**End of Track 26.**
