# Track 27 — OmniPanel Tabs Deep UX

Closes per-tab widget UX for the eight OmniPanel tabs that Track 15.2 reframed as the agentic-membrane housing the repurposed ACR substrate but did not design. Stage-1 wave-C settled per-Mn frontend depth (Tracks 21-26); the cross-cutting `/` membrane was left at the contract-level reframe. Track 27 closes the surface-level design at the depth of stage-1 11.10-11.12 / 26.x — one tranche per tab, plus tab-routing-on-intent, session-continuity-across-toggle, ACR substrate migration map, lint extension, and acceptance-harness traversal.

The OmniPanel is the `/` operator made visible at the UI scale (M'-SYSTEM-SPEC L96 / L169 / L171). It is **Pi's voice** in conversation, **Anima's dispatch** in tree-form, **Aletheia subagents** as crystallisation-mode sub-traces, **evidence** as landing surface (never modal), **review** as landing surface (never modal), **gateway** as capability ledger, **diagnostics** as kernel-bridge telemetry — eight aspects of one operation, persistent identical across `daily-0-1` ↔ `ide-deep`. Per DR-MP-1 (mental-pole triplet), the OmniPanel Pi Chat is M4' LLM voice (Pi-as-conversational-membrane); M5' EBM observatory lives in the standalone `m5-epii` widget (Track 26). The user **talks with** Pi at OmniPanel; the user **reads** M5' Epii in `ide-deep`.

Anti-greenfield: the `omnipanel-shell` package is landed (35 files wholesale-ported from `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` + `omni/{ui,chat,layout,contracts,panels}/*` + `controllers/epi-claw/*` + `stores/*` + `theme/*`); the ACR substrate is landed at `agentic-control-room/src/common/run-model.ts` (`RunTreeNode`, `ToolStreamEvent`, `MediatedRunEvidencePacket`, `enforceHumanGate`, `isMediationCapabilityAllowed`, `assertCapabilityParity`); the `CrossLayoutIntent` envelope is typed; `OMNIPANEL_TABS.availableInLayouts` is scaffolded. Track 27 reframes ported panels, consolidates redundant panels into canonical tabs, first-builds Evidence + Review INSIDE omnipanel-shell (not as new extensions), and migrates ACR substrate into `omnipanel-runtime` per Track 12.14.

## Source Specs and Matrix

- **Matrix:** `plan.runs/wave-c-omnipanel-tabs-matrix.md` (40 rows + DR/CP/SA/AR/FB)
- **Canonical reframe:** `15-ui-design-foundations.md §"OmniPanel `/` operator membrane"` + tranche 15.2 (OmniPanel architecture as agentic membrane) + 15.11 (dispatch genealogy first-class UI primitive)
- **Substrate:** `Body/M/epi-theia/extensions/omnipanel-shell/src/{common,browser,shared}/*` (35 files); `Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` (the substrate Track 15.2 reframes); `Body/M/epi-theia/extensions/pratibimba-layouts/src/{common/layout-types.ts,browser/{cross-layout-intent-dispatcher,session-state-service}.ts}`; `Body/M/epi-theia/extensions/integrated-composition/src/common/evidence-shapes.ts` (per stage-1 Tranche 26.10 schema home); `Body/M/epi-theia/extensions/kernel-bridge{,-readiness}/src/`; `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/{bridge-gate,evidence-pane-widget,review-pane-widget,agentic-control-room-widget}.tsx` (sibling surfaces Track 27 cross-links to)
- **Cross-track gates:** 10.x (kernel-bridge profile fields); 11.2 (cross-layout intent routing); 11.5 (forbidden-import lint); 11.6 (acceptance-harness state-identity); 12.1 (Pi+Anima+Aletheia roster audit); 12.2 (`s5'.gnostic.*` gateway endpoints); 12.6 (`MediatedRunEvidencePacket` field parity); 12.7 (Pi axiom-translation tooling); 12.10 (capability-parity live wiring + `s4'.mediation.capabilities.list`); 12.14 (ACR repurpose path); 12.18 (Janus prospective/retrospective); 12.19 (Aletheia veto primitive); 15.5 (lemniscate transition); 15.6 (profile-tick clock); 15.7 (state-persistence-across-toggle); 15.10 (status bar discipline); 15.11 (dispatch genealogy)
- **Stage-1 wave-C:** 26.4 (evidence-pane deepening — Track 27.5 shares the schema and the dispatch-id selection synchronises both surfaces); 26.5 (review-pane IOD-17 parity — Track 27.6 shares); 26.7 (ACR T8 contents + Pi-monitor reframe — Track 27.10 closes the substrate migration); 26.10 (`MediatedRunEvidencePacket` schema home — Track 27.5 IMPORTS, never re-defines); 26.13 (WisdomDeltaInspector — Track 27.5 verifier-R-virtue-witness-vector reads from same data); 26.14 (`PiAxiomTranslationInspector` — Track 27.1 slash-command grammar + 27.3 click-through)
- **DRs honoured:** DR-M5-1 (Pi+Anima+Aletheia canonical roster), DR-MP-1 (LLM/EBM/Verifier triplet — Pi Chat is M4' LLM voice; M5' standalone is EBM), DR-B-2 (Pi axiom-translation surface), DR-B-3 (Aletheia subagents via Anima dispatch), DR-TS-1 (state-identity invariants extended with `omniPanel.activeTab` + `omniPanel.perTabState`), DR-TS-4 (six operational-capacities NOT OmniPanel tabs — discipline)
- **Contract preflight:** `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (`SharedBridgeAdapter.forbiddenDirectImports`; readiness taxonomy 9-class)

## Cycle 2 Substrate Inheritance

Consume as-is — `omnipanel-shell/src/common/omnipanel-types.ts` (`OMNIPANEL_WIDGET_ID`, `OmniPanelTabId`, `OmniPanelTab`, `OMNIPANEL_TABS`, `CrossLayoutIntent`); `omnipanel-shell/src/browser/{frontend-module,omnipanel-contribution,omnipanel-widget,omnipanel-runtime-stub,index}.ts(x)`; the 35-file ported React tree under `omnipanel-shell/src/browser/components/omni/{ui,chat,layout,contracts,panels}/*`; the controller layer under `omnipanel-shell/src/browser/controllers/epi-claw/*`; the store layer under `omnipanel-shell/src/browser/stores/*`; the theme layer under `omnipanel-shell/src/browser/theme/*`; the domain layer under `omnipanel-shell/src/browser/domain/configPanelDomain.ts`. Consume as substrate — `agentic-control-room/src/common/run-model.ts` (entire 521-line module — the ACR content model that Track 15.2 reframed as OmniPanel content); `agentic-control-room/src/common/parity.ts` (`assertCapabilityParity`); `agentic-control-room/src/browser/acr-runtime-service.ts` (T8 runtime — migration source for `omnipanel-runtime-service.ts`). Consume as cross-track schema home — `integrated-composition/src/common/evidence-shapes.ts` (per stage-1 26.10: `MediatedRunEvidencePacket`, `DispatchTraceNode`, `ToolInvocationRef`, `GateLanding`, `AxiomTranslationStep`, `ActorMediator`, `AletheiaSubagentId`). Consume as session contract — `pratibimba-layouts/src/common/layout-types.ts` L7-12 (kernel-bridge DI singleton invariants); `pratibimba-layouts/src/browser/session-state-service.ts` (session persistence). Consume as readiness pattern — `ide-shell-m0-m5/src/browser/bridge-gate.tsx`. Cycle 2 Track 05 T2 landed the wholesale OmniPanel port; cycle 2 Track 05 T8 landed the ACR substrate. Cycle 3 Track 15.2 named the reframe; Track 27 lands the surface-level depth.

## Surface Contracts

### The Eight Tabs as a Unified System

The OmniPanel is mounted in `widget.application-shell-right` slot, persistent identical across `daily-0-1` ↔ `ide-deep` (per stage-1 TS-03 ALIGNED). The eight tabs are NOT eight unrelated panels — they are **one system folded eight ways**:

- **Pi Chat** is the entry point. The user speaks; Pi responds; Pi invokes Anima; Anima dispatches.
- **Dispatch Trace** is the **structural fold** of that invocation — the tree.
- **Tool Stream** is the **temporal fold** of the same data — the timeline.
- **Evidence** is the **deposition fold** — the `MediatedRunEvidencePacket` that survives the dispatch (per 15.2 "the canonical evidence shape — `MediatedRunEvidencePacket` — flows through Evidence, NOT a modal").
- **Review** is the **gate fold** — the human-required transition surface (per 15.2 "Review tab IS the landing surface — never modals").
- **Sessions** is the **continuity fold** — the user's anchor session (`agent:epii:main`) and siblings with day-now anchor, kairos metadata, tarot psyche anchor.
- **Gateway** is the **capability fold** — what Pi/Anima/Aletheia subagents CAN invoke (live capability list, parity check, try-it).
- **Diagnostics** is the **telemetry fold** — kernel-bridge readiness, profile-tick state, S2 reachability, gateway WebSocket state, cross-layout intent log.

Same substrate (`omnipanel-runtime`), eight folds. Click-through is the natural verb: from Pi Chat, click a dispatched envelope, land in Dispatch Trace at that node; from Dispatch Trace node, click "Evidence", land in Evidence at the packet; from Evidence, click "Review status", land in Review at the gate; from Review, click "Why blocked?", land in Gateway at the capability cell. From any tab, the status-bar (15.10) carries the day-now anchor; the profile-tick (15.6) re-renders everything in sync.

### Per-Tab Role

| Tab | Role | Mounts | Primary data source | Cross-link targets |
|---|---|---|---|---|
| `pi-chat` | Pi-as-conversational-membrane (DR-M5-1); slash-command grammar; capability surfacing; Khora session-start | `PiChatPanel.tsx` | `s4.pi.chat.stream`, `s4.khora.session_start`, slash-command registry | Dispatch Trace (on dispatch); Pi axiom-translation inspector (ide-deep, 26.14) |
| `sessions` | Session manager (list/start/resume/switch); maps to `agent:epii:main` + siblings; day-now anchor; kairos + tarot psyche metadata; M4 protected-local privacy gating | `SessionManagerPanel.tsx` | `s5'.epii.runtimeContext`, `contemplate.fetch_object` (gated on 19.6), `s4.khora.session_start`, `s4.khora.session_list` | Pi Chat (on resume); Evidence (on session-evidence open) |
| `dispatch-trace` | Pi → Anima → subagent invocation tree; structural fold; live profile-tick; collapsible; per-node actor/capability/duration/status/evidence-ref | `DispatchTracePanel.tsx` + `dispatch-tree-renderer.tsx` | `subscribeRunEvents` (from omnipanel-runtime), `RunTreeNode` (extended) | Evidence (on node click); Tool Stream (on same-event link); Backend Studio source-anchor (ide-deep only); `PiAxiomTranslationInspector` (ide-deep, 26.14) |
| `tool-stream` | Time-ordered event list; temporal fold of same data as Dispatch Trace; filtering by actor/tool/range; privacy-class indicator | `ToolStreamPanel.tsx` + `tool-stream-renderer.tsx` + `tool-stream-filters.tsx` | `subscribeRunEvents` (same as Dispatch Trace), `ToolStreamEvent` | Dispatch Trace (on event click); Evidence (on packet-evidence link) |
| `evidence` | `MediatedRunEvidencePacket` landing surface (15.2 no-modal invariant); dispatch-trace mini-graph; tool-stream link; decision-register entries; verifier-R-virtue-witness-vector; privacy-class badge | `EvidencePanel.tsx` + `evidence-packet-view.tsx` | `s5'.epii.deposit.list`, `MediatedRunEvidencePacket` from `integrated-composition/common/evidence-shapes` | Dispatch Trace (on dispatch-ref); Review (on review-id); ide-shell `evidence-pane-widget` (same-packet sync) |
| `review` | Human-required gate LANDING (15.2 no-modal); IOD-17 three-way parity; review action affordances (approve/reject/defer/annotate); review history | `ReviewPanel.tsx` + `review-landing-service.ts` + `iod17-parity-readout.tsx` + `review-action-controls.tsx` + `review-history-list.tsx` | `s5'.review.inbox`, `s5'.review.history`, `s5'.review.submit`, `enforceHumanGate`, `assertCapabilityParity` | Evidence (on packet-ref); Gateway (on capability-violation); Backend Studio (ide-deep, on revise) |
| `gateway` | `s4'.mediation.capabilities.list` + per-capability parity + readiness + try-it; consolidates nodes/models/skills/cron/config/settings as facet sub-views | `GatewayPanel.tsx` + `capability-list-view.tsx` + per-facet views | `s4'.mediation.capabilities.list` (gated on 12.10), `assertCapabilityParity`, `isMediationCapabilityAllowed`, kernel-bridge-readiness | bridge-gate (ide-shell, on readiness drill-down); Diagnostics (on gateway-WS state) |
| `diagnostics` | kernel-bridge readiness summary; profile-field pending markers; MathemeHarmonicProfile generation; profile-tick subscription state; S2 graph reachability; gateway WebSocket state; active-layout display; CrossLayoutIntent log | `DiagnosticsPanel.tsx` + 8 sub-components | kernel-bridge `subscribeReadiness`, `subscribeToProfileTick`, `connection_status` | Gateway (on capability-related blocker); ide-shell bridge-gate (on bridge state) |

### Layout Visibility

All eight tabs are visible in BOTH layouts per 15.2 — the OmniPanel is the `/` operator transverse to everything. DR-TS-4 negative invariant: six operational-capacity views are NOT OmniPanel tabs (they live in M5'-chrome `m5-epii` standalone widget per stage-1 26.2). DR-MP-1 negative invariant: M5' EBM observatory is NOT OmniPanel Pi Chat — they are two surfaces of one mental-pole triplet, never collapsed.

### `OMNIPANEL_TABS` Canonical Manifest (post-Tranche 27.0)

```ts
export const OMNIPANEL_TABS: ReadonlyArray<OmniPanelTab> = [
    { id: 'pi-chat',         label: 'Pi',          widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'sessions',        label: 'Sessions',    widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'dispatch-trace',  label: 'Dispatch',    widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'tool-stream',     label: 'Tools',       widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'evidence',        label: 'Evidence',    widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'review',          label: 'Review',      widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'gateway',         label: 'Gateway',     widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'diagnostics',     label: 'Diagnostics', widgetId: null, availableInLayouts: ['daily-0-1', 'ide-deep'] }
];
```

The legacy 13-tab manifest collapses per the DR-WC-OP-1 collapse map; Tranche 27.10 executes the panel-level migration; Tranche 27.0 ratifies the type-level rewrite.

## Tranches

1. **27.0 — `omnipanel-runtime` foundation + 8-tab manifest collapse + `useProfileTick` hook** *(spec-ahead-integration + DR-landing; sources WC-OP-1/2/33/36, DR-WC-OP-1; cross-link 15.2, 15.6, 12.14)*

   Land `Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-runtime.ts` as the canonical OmniPanel runtime type-graph. Initially re-exports from `@pratibimba/agentic-control-room/common/run-model` to maintain compile-clean during Tranche 27.10's substrate migration; final state (post-27.10) is the home of `ActorIdentity`, `DispatchRoute`, `RunStatus`, `RunTreeNode` (extended per 27.3), `ToolStreamEvent` (extended per 27.4), `ReviewDecision`, `ReviewTransition`, `isMediationCapabilityAllowed`. The `MediatedRunEvidencePacket` family lives in `integrated-composition/src/common/evidence-shapes.ts` per stage-1 26.10 — `omnipanel-runtime.ts` IMPORTS from there.

   Rewrite `Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-types.ts` `OMNIPANEL_TABS` to the 8 canonical entries (see Surface Contracts above). Add JSDoc above `OMNIPANEL_TABS` referencing DR-WC-OP-1 collapse map. Extend `OmniPanelTabId` type union: `'pi-chat' | 'sessions' | 'dispatch-trace' | 'tool-stream' | 'evidence' | 'review' | 'gateway' | 'diagnostics'`. Drop legacy tab ids from the type after Tranche 27.10 lands the panel migrations.

   Land `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-runtime-service.ts`:

   ```ts
   @injectable()
   export class OmnipanelRuntimeService {
     constructor(
       @inject(SHARED_BRIDGE_ADAPTER) private bridge: SharedBridgeAdapter,
       @inject(KERNEL_BRIDGE_API) private kernelBridge: KernelBridgeAPI
     ) {}
     readonly onRunEvent: Event<RunEvent>;            // subscribeRunEvents
     readonly onProfileTick: Event<ProfileTickEvent>; // subscribeToProfileTick
     readonly onReadiness: Event<ReadinessEvent>;
     readonly onCoordinateContext: Event<CoordinateContext>;
     subscribeRunEvents(): Disposable;
     getCurrentTreeRoots(): readonly RunTreeNode[];
     getCurrentToolStream(opts: ToolStreamFilter): readonly ToolStreamEvent[];
     invokeRoute(actor: ActorIdentity, route: DispatchRoute, payload: unknown): Promise<RunResult>;
   }
   ```

   Land `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/hooks/useProfileTick.ts` — React hook that subscribes to `OmnipanelRuntimeService.onProfileTick`, returns the current tick + advance-event handle. Every tab component MUST consume `useProfileTick()` for re-render alignment per 15.6 ("Widgets re-render on MathemeHarmonicProfile tick advance, not user input"). Default behaviour: passive subscription on mount, unsubscribe on unmount.

   Land `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/hooks/useOmnipanelRuntime.ts` — React hook accessing the Inversify `OmnipanelRuntimeService` singleton (via `useInjection` pattern).

   DR-WC-OP-1 (tab collapse map) lands in Track 13 as a DR entry citing this tranche. Mark `OverviewPanel.tsx` deprecated (Tranche 27.0 closes its lifecycle — content folds into PiChatPanel header where load-bearing per 15.10 status-bar discipline).

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-runtime.ts`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-runtime-service.ts`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/hooks/useProfileTick.ts`; `grep -nE "'pi-chat'\|'sessions'\|'dispatch-trace'\|'tool-stream'\|'evidence'\|'review'\|'gateway'\|'diagnostics'" Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-types.ts` returns exactly 8 distinct ids; `grep -nE "OmnipanelRuntimeService\|@inject" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-runtime-service.ts`; `pnpm --filter @pratibimba/omnipanel-shell build` clean; `pnpm --filter @pratibimba/omnipanel-shell test` includes new `useProfileTick` render-on-tick test; `node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs` extended fixture asserts 8-tab manifest.

2. **27.1 — Pi Chat tab — agentic conversational membrane with slash-command grammar** *(spec-ahead-integration + audit-refactor; sources WC-OP-3/4/5/6/30/31/39, SA-WC-OP-1, AR-WC-OP-1; cross-link DR-M5-1, DR-MP-1, DR-B-2, DR-B-3, 12.7, 26.14)*

   Reframe `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/chat/ChatPanel.tsx` → `PiChatPanel.tsx`. Preserve `messageNormalizer.ts` + `attachments.ts` (port survives). Identity narrative header reads: *"Pi — conversational membrane. Speak; I dispatch through Anima. Anima orchestrates from S4'; subagents surface in crystallisation-mode."* — anchored in DR-M5-1.

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/chat/`):

   - `<PiChatHeader />` — identity narrative + session anchor (current `[[NOW-{session}]]` from session-state-service) + Pi connection status (from `OmnipanelRuntimeService.onReadiness`). Renders the kairos-at-open metadata strip (if present) per cross-link to 27.2.
   - `<PiChatHistory />` — message stream; consumes `pi-chat-conversation-store.ts` (Tranche 27.0 home pattern, new file). Profile-tick re-render via `useProfileTick()`. Per-message: actor badge (`Pi` / `User` / dispatched sub-actor), dispatch-genealogy chip (when message is a dispatch trigger — clicking chip activates `dispatch-trace` tab at the corresponding node per Tranche 27.3 routing), evidence chip (when message references an evidence packet — clicking activates `evidence` tab per Tranche 27.5), privacy-class indicator on protected-local content per Tranche 27.5's `<PrivacyClassBadge />`.
   - `<PiChatInput />` — text input with slash-command grammar awareness. Triggers slash-command parser on `/` prefix; renders inline command palette via `<PiCapabilityCompletionProvider />`. Multi-turn (Enter sends message; Pi responds streaming) vs single-shot (slash-command Enter dispatches once + emits Dispatch Trace event + renders return inline).
   - `<PiCapabilityCompletionProvider />` — autocomplete panel keyed on slash-prefix. Reads capability list from `s4'.mediation.capabilities.list` (gated on 12.10; fallback to local capability registry until landing). Filters capabilities by Pi-permitted actions (per `capability-matrix.json m5_4_governance.review_surface_roles.pi.permitted_actions`).

   **Land `slash-command-parser.ts` + `slash-command-registry.ts`** (under `omnipanel-shell/src/browser/services/`):

   ```ts
   export interface SlashCommand {
     readonly verb: string;                  // 'dispatch', 'cast', 'translate', 'aletheia', 'session', 'cron', 'skills'
     readonly target?: string;               // 'nous', 'iching', 'crystallise', 'resume', 'list'
     readonly args: readonly string[];
     readonly raw: string;
   }
   export class SlashCommandParser {
     parse(input: string): SlashCommand | null;
   }
   @injectable()
   export class SlashCommandRegistry {
     register(verb: string, handler: SlashCommandHandler): Disposable;
     resolve(command: SlashCommand): SlashCommandHandler | undefined;
     listVerbs(): readonly { verb: string; description: string; allowedTargets?: readonly string[] }[];
   }
   ```

   Canonical command verbs (registered by `frontend-module.ts` at OmniPanel mount):

   - `/dispatch <agent>` — dispatches Anima with single sub-agent envelope (`anima_self_invoke` route per ACR `AgenticRoute`). Per DR-M5-1: user types `/dispatch nous` and Anima invokes the Nous psyche-facet rendering — NOT a peer agent dispatch. Per DR-B-3: `/aletheia crystallise <intent>` is the only path through which Aletheia subagents fan out; direct `/dispatch anansi` is REJECTED with explanatory message "Aletheia subagents dispatch only via Anima crystallisation-mode. Try `/aletheia crystallise <intent>`."
   - `/cast <oracle>` — `/cast iching`, `/cast tarot`, `/cast quintessence`. Single-shot; renders inline result; emits Dispatch Trace event.
   - `/translate <from> → <to> <text>` — Pi axiom-translation per DR-B-2 / 12.7. Forms: `philosophical-english`, `formal-notation`, `owl`, `shacl`. Result inline + creates `AxiomTranslationStep` evidence entry; click-through opens `PiAxiomTranslationInspector` in ide-deep per stage-1 Tranche 26.14.
   - `/aletheia crystallise <intent>` — invokes Anima with `aletheia-crystallisation-mode: true`; Anima dispatches subagents per intent classification; Dispatch Trace fans out.
   - `/session resume <session-id>` — invokes `s4.khora.session_resume`; switches active session anchor. Cross-link 27.2.
   - `/session start [topic]` — invokes `s4.khora.session_start`; writes `[[NOW-{session}]]` to daily-note `## Sessions` per CLAUDE.md session-day-now law.
   - `/skills list` — opens `gateway` tab at SkillFacetView per Tranche 27.7.
   - `/cron list` — opens `gateway` tab at CronFacetView per Tranche 27.7.

   **Khora session-start integration:** on first user message in a new session (no `sessionKey` in `session-state-service`), `PiChatPanel` invokes `invokeGatewayRpc('s4.khora.session_start', { topic, day_id })` BEFORE sending the user message to Pi. Per CLAUDE.md: Khora writes `[[NOW-{session}]]` to daily-note. The returned `sessionKey` populates `BimbaPratibimbaUiState.sessionKey` (per Tranche 27.11).

   **Conversation history persistence:** land `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/stores/pi-chat-conversation-store.ts` (Inversify singleton, Theia `Emitter` pattern). Persisted across layout toggle via Tranche 27.11's `OmniPanelSessionState.perTabState['pi-chat']`. On `daily-0-1` ↔ `ide-deep` toggle, conversation continues uninterrupted.

   **Privacy class flow-through:** any message touching Nara-protected-local content (per stage-1 Tranche 25.x M4 privacy class) renders `<PrivacyClassBadge privacyClass="protected_local" />`. M4 protected-local content NEVER crosses the public bridge — only handle metadata.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/chat/PiChatPanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/slash-command-parser.ts`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/slash-command-registry.ts`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/stores/pi-chat-conversation-store.ts`; `grep -nE "SlashCommandParser\|SlashCommandRegistry\|PiCapabilityCompletionProvider\|khora_session_start\|aletheia crystallise" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; slash-command parser test covers all 7 verbs (`/dispatch nous`, `/cast iching`, `/translate philosophical-english → owl <text>`, `/aletheia crystallise <intent>`, `/session resume <id>`, `/session start`, `/skills list`); `/dispatch anansi` returns rejection message per DR-B-3 guard; profile-tick re-render test asserts new tick triggers PiChatHistory re-render; Khora session-start integration test asserts first-message in new session calls `s4.khora.session_start` BEFORE Pi message; conversation-history persistence test asserts history survives layout toggle.

3. **27.2 — Sessions tab — session manager mapped to `agent:epii:main`** *(audit-refactor + spec-ahead-integration; sources WC-OP-7/8/31/32, CP-WC-OP-3/6, AR-WC-OP-2; cross-link MEMORY Anima/Epii split, CLAUDE.md session-day-now law, 19.2/19.6 ContemplationObject)*

   Reframe `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/SessionsPanel.tsx` → `SessionManagerPanel.tsx`. The Sessions tab is the user's **continuity fold** — it shows which session is active, which sessions exist for today (day-now anchor), and the metadata that anchors each session in space (active coordinate), time (kairos-at-open), and contemplative landscape (tarot psyche anchor).

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/sessions/`):

   - `<SessionManagerHeader />` — day-now anchor display (path `Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/` per CLAUDE.md vault law); "New session" button (invokes `s4.khora.session_start`); "Switch session" dropdown.
   - `<SessionList />` — list of today's sessions (from `s4.khora.session_list` filtered by day-id). Per-session card: session id, `[[NOW-{session}]]` wikilink, opened-at time, active-now indicator, active coordinate (e.g., `M4-3`), Pi/Anima/Aletheia dispatch counts (from `OmnipanelRuntimeService` for the session's run tree), close affordance. M4 protected-local privacy indicator if session touches Nara content.
   - `<SessionDetailPane />` — when a session is selected: full metadata panel.
     - `<KairosAtOpenStrip />` — reads `M4_Temporal_Now.planet_degrees[10]` (mod-10 canonical per MEMORY) at session-open via `s5'.epii.runtimeContext`. Renders sun, moon, mercury…pluto degrees + retrograde markers. Gated on `KAIROS_ENABLED=true` per FR-3; falls back to ReadinessBanner `state: 'pending-kairos', blockers: ['kerykeion not configured']` if disabled.
     - `<TarotPsycheAnchorStrip />` — reads `M4_Tarot_Draw` at session-open (per stage-1 25-m4 + 19.2). Renders the three-card anchor with decan + chakra mapping per `medicine.rs CHAKRA_BODY_ZONES[8]`. Gated on 19.6 RPC `contemplate.fetch_object`; ReadinessBanner fallback.
     - `<ActiveCoordinateDisplay />` — current `BimbaPratibimbaUiState.coordinate`. Click-through to Coordinate Tree (left-sidebar activity-bar).
     - `<DispatchSummary />` — count of Pi/Anima/Aletheia dispatches in this session; click-through to `dispatch-trace` tab filtered by `sessionKey`.
     - `<EvidenceSummary />` — count of evidence packets deposited; click-through to `evidence` tab filtered by `sessionKey`.
     - `<ReviewSummary />` — count of review-pending items; click-through to `review` tab filtered by `sessionKey`.
     - `<PrivacyClassBadge />` — protected-local indicator if session touched Nara content.

   **Anima/Epii split mapping (MEMORY):** the "main session" of the user is `agent:epii:main` — Epii is the user's knowledge/representation anchor (S5'). Sibling sessions are subordinate per-tool / per-thread sessions. Session list shows main + siblings hierarchically. **Session-list ordering:** active session always at top; main session second; siblings ordered by `kairos_at_open` descending (most recent first).

   **Session affordances:**

   - **Start** — `<NewSessionButton />` opens `<NewSessionDialog />` (inline, NOT modal per 15.2; expands beneath header). Optional topic. Invokes `invokeGatewayRpc('s4.khora.session_start', { topic, day_id, parent: 'agent:epii:main' })`. Khora writes `[[NOW-{session}]]` to daily-note `## Sessions` per CLAUDE.md.
   - **Resume** — `<ResumeSessionAffordance />` invokes `s4.khora.session_resume`; switches `BimbaPratibimbaUiState.sessionKey` to resumed session. Pi Chat conversation history hydrates from `pi-chat-conversation-store` for the resumed session.
   - **Switch** — `<SwitchSessionAffordance />` for non-blocking switch between active sessions. Active dispatch-trace + tool-stream + evidence + review re-filter to new session.
   - **Archive** — `<ArchiveSessionAffordance />` invokes `s4.khora.session_archive` (sets `c_5_reflection_complete: true` per CLAUDE.md before `chronos_archive_day` can succeed).

   **State persistence (per Tranche 27.11):** `OmniPanelSessionState.perTabState['sessions']` = `{ selectedSessionId: string | null; filterPredicate: 'today' | 'this-week' | 'all'; }`. Persisted across layout toggle.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/SessionManagerPanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/session-manager-service.ts`; `grep -nE "SessionManagerService\|agent:epii:main\|kairos_at_open\|tarot_psyche_anchor\|day-now\|c_3_day_id" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; session-list rendering test asserts active-at-top + main-second + siblings descending; Khora session-start integration test asserts new session calls `s4.khora.session_start` with `parent: 'agent:epii:main'`; KairosAtOpenStrip ReadinessBanner test when `KAIROS_ENABLED=false`; TarotPsycheAnchorStrip ReadinessBanner test when 19.6 not landed; privacy-class display test for M4-touching session.

4. **27.3 — Dispatch Trace tab — Pi → Anima → subagent invocation tree** *(spec-ahead-integration + audit-refactor; sources WC-OP-9/10/11/34, SA-WC-OP-2, AR-WC-OP-5; cross-link 15.11, DR-M5-1, DR-B-3, 12.18, 12.19, stage-1 26.7, 26.10)*

   First-build `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/DispatchTracePanel.tsx`, consolidating ported `ChannelsPanel.tsx` + `InstancesPanel.tsx`. The Dispatch Trace tab is the **structural fold** of Pi → Anima → subagent invocations — per 15.11 dispatch genealogy is a first-class UI primitive.

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/dispatch-trace/`):

   - `<DispatchTraceHeader />` — current session filter (from `BimbaPratibimbaUiState.sessionKey`); time-range filter (last 5 min, last hour, full session); actor filter chips (Pi · Anima · Aletheia-subagents); legend (psyche-facet badge colours per stage-1 26.8: Sophia gold, Anima indigo, Logos amber, Eros rose, Mythos emerald, Psyche silver, Nous slate).
   - `<DispatchTreeRenderer />` — recursive collapsible tree. Each node = `RunTreeNode` (extended per below). Renders: actor badge (with psyche-facet badge when present), tool name, duration, status pill, evidence-ref chip (when present). Click-through behaviour:
     - Click node → select node; right-pane shows `<DispatchNodeDetail />`.
     - Click "evidence" chip → activate `evidence` tab at packet (per Tranche 27.5).
     - Click "tools" chip → activate `tool-stream` tab at first tool event for this node (per Tranche 27.4).
     - In `ide-deep` only: click "source" chip → open Backend Studio at `sourceAnchor` (stage-1 6.4 cross-link).
     - In `ide-deep` only: click axiom-translation pill → open `PiAxiomTranslationInspector` (stage-1 26.14 cross-link).
   - `<DispatchNodeDetail />` — full node view: actor identity, capability invoked, args digest, return digest, duration, status, error (if any), child invocations summary, evidence packet link, psyche-facet (if present), Aletheia subagent identity (if `actor.kind === 'aletheia'`), Aletheia veto banner (red, when `FacetReturn.kind === 'veto'` per 12.19).
   - `<AletheiaCrystallisationGroup />` — when Anima's dispatch envelope is in crystallisation-mode (per DR-M5-1), wrap the sub-fan-out in a labelled group "Aletheia crystallisation — {intent}" with the six subagent badges (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) only those actually dispatched. Per DR-B-3 — subagents render as sub-traces under Anima, NEVER as peer top-level nodes.

   **`RunTreeNode` extension** — Track 27.0 lands `omnipanel-runtime` as the home. Track 27.3 extends the type:

   ```ts
   // In Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-runtime.ts
   import type { ActorMediator, AletheiaSubagentId } from '@pratibimba/integrated-composition/common/evidence-shapes';

   export interface RunTreeNode {
     readonly id: string;
     readonly label: string;
     readonly status: RunStatus;
     readonly startedAtMs: number;
     readonly endedAtMs?: number;
     readonly toolName?: string;
     readonly diagnostics?: readonly string[];
     readonly children?: readonly RunTreeNode[];

     // Track 27.3 additions:
     readonly actor: ActorMediator;                            // {kind:'pi'} | {kind:'anima'} | {kind:'aletheia'; subagent}
     readonly capability: MediationCapabilityName;
     readonly psycheFacet?: 'anima'|'eros'|'logos'|'mythos'|'nous'|'psyche'|'sophia';
     readonly evidencePacketRef?: string;
     readonly aletheiaCrystallisationIntent?: string;          // present only when Anima dispatches in crystallisation-mode
     readonly aletheiaFacetReturn?:
       | { kind: 'disclosure'; angle: string; evidenceRefs: readonly string[] }
       | { kind: 'veto'; reason: string; what_is_missed: string };  // per 12.19
     readonly sessionKey: string;
     readonly tickAtInvoke: number;                            // per stage-1 26.10 DispatchTraceNode contract
   }
   ```

   **Live during dispatch** — `DispatchTracePanel` subscribes via `OmnipanelRuntimeService.onRunEvent` (gated on `subscribeRunEvents` capability per ACR substrate). Each event mutates the tree in place; `useProfileTick()` triggers re-render on tick advance per 15.6. Aletheia veto events fire a `<VetoBanner />` overlay on the affected node (red border, non-blocking) — per 12.19 veto does NOT block human gate but surfaces as evidence.

   **Same-data-different-fold linking** — per 15.11: clicking a node in Dispatch Trace highlights corresponding event in Tool Stream tab (via `OmniPanelIntentRouter` per Tranche 27.9). Clicking event in Tool Stream activates Dispatch Trace tab at corresponding node.

   **State persistence** — `OmniPanelSessionState.perTabState['dispatch-trace']` = `{ expandedNodeIds: readonly string[]; selectedNodeId: string | null; actorFilter: readonly ActorIdentity[]; timeRangeFilter: 'last-5m' | 'last-hour' | 'full-session'; }`.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/DispatchTracePanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/dispatch-trace/DispatchTreeRenderer.tsx`; `test -f .../dispatch-trace/AletheiaCrystallisationGroup.tsx`; `grep -nE "ActorMediator\|psycheFacet\|aletheiaCrystallisationIntent\|aletheiaFacetReturn\|VetoBanner" Body/M/epi-theia/extensions/omnipanel-shell/src/`; recursive-tree-fold test (deep nesting); profile-tick re-render test asserts new event triggers re-render; Aletheia-subagent-under-Anima test (subagents never at top level); veto-banner test (red non-blocking); click-through to Evidence + Tool Stream + Backend Studio (ide-deep only) tests; psyche-facet badge legend render test.

5. **27.4 — Tool Stream tab — time-ordered tool-call event list** *(audit-refactor + spec-ahead-integration; sources WC-OP-12/13/17, SA-WC-OP-3, AR-WC-OP-3; cross-link 15.11)*

   Reframe `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/LogsPanel.tsx` → `ToolStreamPanel.tsx`. The Tool Stream tab is the **temporal fold** of the same data Dispatch Trace folds structurally — per 15.11 ("Same data folded differently in each tab. Trace is the tree; Stream is the time-ordered event list").

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/tool-stream/`):

   - `<ToolStreamHeader />` — session filter (from `BimbaPratibimbaUiState.sessionKey`); live/paused toggle; clear-stream affordance.
   - `<ToolStreamFilters />` — actor filter (Pi · Anima · individual Aletheia subagents); tool-name filter (autocomplete from `s4'.mediation.capabilities.list`); time-range filter (last 5 min · last hour · full session · custom range); event-kind filter (`tool.start` · `tool.partial` · `tool.end` · `tool.error` · `route.start` · `route.end`); privacy-class filter (`public` · `protected` · `private` · all).
   - `<ToolStreamRenderer />` — time-ordered virtualized list (handles high-volume streams without DOM bloat — virtual scroll via React-Window or equivalent). Per-event row: timestamp, actor badge, event-kind pill, tool name, args preview (truncated; full args on hover/expand), return preview (truncated; full return on hover/expand), latency badge (start→end duration), privacy class badge (`<PrivacyClassBadge />` per Tranche 27.5 shared component).
   - `<ToolEventDetail />` — when row clicked: full event detail in right pane. Args full text (with sanitization per `sanitizeProtectedHandle` from run-model.ts L488-504 — protected bodies stripped, only handle metadata shown), return full text (same sanitization), error (if any), parent dispatch node ref (link → Dispatch Trace tab at corresponding node per Tranche 27.9 routing), evidence packet ref (link → Evidence tab if present).

   **`ToolStreamEvent` extension** — Track 27.0 + 27.4 land:

   ```ts
   // In Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-runtime.ts
   export interface ToolStreamEvent {
     readonly id: string;
     readonly emittedAtMs: number;
     readonly tool: string;
     readonly kind: 'tool.start' | 'tool.partial' | 'tool.end' | 'tool.error' | 'route.start' | 'route.end' | string;
     readonly payload?: unknown;
     readonly privacyClass?: 'public' | 'protected' | 'private';

     // Track 27.4 additions:
     readonly actor: ActorMediator;
     readonly dispatchNodeId: string;            // back-ref to Dispatch Trace node
     readonly sessionKey: string;
     readonly tickAtEmit: number;
     readonly inputDigest?: string;              // hash for deduplication / diff
     readonly outputDigest?: string;
     readonly latencyMs?: number;                // populated on 'tool.end'
     readonly evidencePacketRef?: string;        // present when event contributed to a packet
   }
   ```

   **Same-event linking per 15.11** — clicking event in Tool Stream activates `dispatch-trace` tab and highlights `dispatchNodeId`. Reverse: clicking node in Dispatch Trace activates `tool-stream` tab and scrolls to first event with matching `dispatchNodeId`.

   **Privacy-class filtering** — protected-class events render with handle-metadata-only payload preview. Private-class events render with redacted payload + "private — not displayed" banner. M4 protected-local content NEVER renders body — only handle ref (per `sanitizeProtectedHandle`).

   **State persistence** — `OmniPanelSessionState.perTabState['tool-stream']` = `{ filters: ToolStreamFilters; selectedEventId: string | null; scrollOffset: number; live: boolean; }`.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/ToolStreamPanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/tool-stream/ToolStreamRenderer.tsx`; `test -f .../tool-stream/ToolStreamFilters.tsx`; `grep -nE "ToolStreamEvent\|ToolStreamFilters\|dispatchNodeId\|sanitizeProtectedHandle" Body/M/epi-theia/extensions/omnipanel-shell/src/`; virtualized-list test (1000+ events render <16ms frame); actor / tool / range / privacy-class filter tests; cross-link to Dispatch Trace test (same-event highlight); profile-tick re-render test on event arrival; protected-body sanitization assertion (no `body`/`rawBody`/`protectedBody`/`content`/`text`/`payload` fields in rendered DOM when privacy class is protected).

6. **27.5 — Evidence tab — `MediatedRunEvidencePacket` landing surface** *(spec-ahead-integration + first-build; sources WC-OP-14/15/16/17/32, SA-WC-OP-4, CP-WC-OP-2, FB-WC-OP-1; cross-link 15.2 no-modal invariant, stage-1 26.4, 26.10, 26.13, 19.6, 19.9, DR-KB-2)*

   **First-build** `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/EvidencePanel.tsx` inside `omnipanel-shell`. NO new extension. The Evidence tab is the **deposition fold** — the canonical landing surface for `MediatedRunEvidencePacket` per 15.2 ("Evidence — `MediatedRunEvidencePacket` view; the repurposed `EVIDENCE_DEPOSITION` widget").

   **NO MODAL** — per 15.2 invariant. The Evidence tab IS the surface. ide-shell-m0-m5's `evidence-pane-widget` (stage-1 26.4) is the SIBLING surface in `ide-deep`; both consume the same schema; selection is synchronised via cross-layout intent dispatcher.

   **Schema home discipline** — IMPORT from `@pratibimba/integrated-composition/common/evidence-shapes` (per stage-1 Tranche 26.10). Track 27.5 DOES NOT re-define `MediatedRunEvidencePacket`. Track 26.10 is the gate; if not landed, Tranche 27.5 falls back to ReadinessBanner `state: 'pending-schema', blockers: ['integrated-composition evidence-shapes not landed']`.

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/evidence/`):

   - `<EvidenceHeader />` — session filter (from `BimbaPratibimbaUiState.sessionKey`); time-range filter; mediator filter (Pi · Anima · Aletheia-subagent); privacy-class filter; "deposit new" affordance (opens `<EvidenceDepositForm />` inline — NOT modal).
   - `<EvidencePacketList />` — virtualized list of packets. Per row: packet id (truncated), title, mediator badge, coordinate chip, deposition time, privacy-class badge, dispatch-genealogy chip, review-status chip (when linked).
   - `<EvidencePacketView />` — when row clicked: full packet view in right pane. Sub-components:
     - `<EvidencePacketHeader />` — id, title, mediator (with psyche-facet badge if present), coordinate, deposition time, privacy class.
     - `<DispatchTraceMiniGraph />` — embedded mini Dispatch Trace renderer scoped to this packet's dispatch genealogy. Click-through to full Dispatch Trace tab at packet's `dispatchTrace.id`.
     - `<ToolStreamLink />` — "View {N} tool events in Tool Stream →" link; activates Tool Stream tab filtered to packet's tool events.
     - `<DecisionRegisterEntries />` — list of decision register entries linked to this packet (per `s5'.decision_register.list_for_packet` — new method gated on a parallel 12.x audit; ReadinessBanner fallback when absent).
     - `<DepositionAnchorDisplay />` — DR-KB-2 deposition anchor (Hen-side write-through reference); click-through to canon path in `Idea/` if exists.
     - `<VerifierRVirtueWitnessVector />` — when `packet.wisdomDeltaTraceRef` present (gated on 19.6 + 19.9 + stage-1 26.13): 9-bit virtue witness vector bit-grid + register labels (action-7 / octave-8 / wholeness-9) from VIRTUE_LUT[9]. Reads via `contemplate.fetch_wisdom_delta` per 19.6.
     - `<EvidencePacketFields />` — full field grid:
       - `coordinate`, `artifactUri`, `sourceAnchor`, `specAnchor`, `codeAnchor`, `testAnchor`, `graphAnchor`, `reviewId`, `profileGeneration`, `bridgeReadinessHandle`, `sessionKey`, `dayNowContext`
       - `currentProfile` (source: `s0.current_profile`, generation, profileHandle)
       - `graphContext` (source: `s2.graph_services`, namespace, coordinate, graphAnchor, relationRefs, sourceRefs)
       - `sessionRuntime` (source: `s3.gateway`, sessionKey, dayId, nowPath, gatewayRunRef, runtimeRefs)
       - `semanticCandidates` (source: `s1.semantic.suggest_links`, candidate list with score / target / sourceBlock)
       - `s5Refs` (candidateRef, reviewRef, improvementRef, persistedStoreDtoRef)
       - `graphitiProtectedHandles[]` (handle, namespace, privacyClass, summary — body never shown per `sanitizeProtectedHandle`)
       - `vaultRefs[]` (method, uri, capability, governance — gated per `isMediationCapabilityAllowed`)
       - `axiomTranslationSteps[]` (per stage-1 26.10: from / to / inputText / outputText / reasoningTrace / verifiedBy)
       - `gateLandings[]` (gateId, gateType, state, transitionedBy, iod17Parity if applicable)
       - `contemplationObjectRef?` (cross-link to ContemplationObjectViewer in m5-epii per stage-1 26.12)
     - `<PrivacyClassBadge />` — top-right indicator. Tooltip explains M4 protected-local invariant: "Protected-local content never crosses the public bridge. This packet's `graphitiProtectedHandles[]` carry handle metadata only — no protected bodies." Shared component (lives at `omnipanel-shell/src/browser/components/shared/PrivacyClassBadge.tsx`) consumed by Tranches 27.1, 27.2, 27.4, 27.5, 27.6.
   - `<EvidenceDepositForm />` — inline (NOT modal) deposit form. Per 15.2. Renders below header when "deposit new" pressed. Form fields match `RunEvidenceEnvelope` required fields per `REQUIRED_EVIDENCE_FIELDS`. Submit calls `invokeGatewayRpc('s5.epii.deposit', envelope)`. Validation via `missingEvidenceFields()` — submit disabled until all required fields populated. Privacy class defaults to `'safe-public-current-kernel-tick'` per `buildEvidenceEnvelope`.

   **Cross-layout dispatch-id sync** — when Evidence packet selected in OmniPanel, `cross-layout-intent-dispatcher` fires `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'evidence-pane.select-packet', artifactUri: packet.id, ... }` — if `ide-deep` active, ide-shell `evidence-pane-widget` highlights same packet (per stage-1 26.4). Reverse: selection in ide-shell `evidence-pane-widget` fires intent → OmniPanel Evidence tab highlights same packet.

   **State persistence** — `OmniPanelSessionState.perTabState['evidence']` = `{ selectedPacketId: string | null; filters: EvidenceFilters; scrollOffset: number; depositFormOpen: boolean; depositFormDraft?: Partial<RunEvidenceEnvelope>; }`.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/EvidencePanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/evidence/EvidencePacketView.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/shared/PrivacyClassBadge.tsx`; `grep -nE "MediatedRunEvidencePacket\|DispatchTraceMiniGraph\|VerifierRVirtueWitnessVector\|EvidenceDepositForm" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; `grep -nE "from '@pratibimba/integrated-composition'" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/evidence/` confirms schema imported, not redefined; cross-layout-sync test asserts packet selection in OmniPanel highlights same packet in `evidence-pane-widget` and vice-versa; no-modal assertion (`grep -rnE "Dialog\|Modal" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/evidence/` returns nothing); 9-bit witness vector rendering test against VIRTUE_LUT[9] fixture; `sanitizeProtectedHandle`-style protected-body-absence test on rendered DOM; profile-tick re-render test.

7. **27.6 — Review tab — human-required gate landing surface** *(spec-ahead-integration + first-build; sources WC-OP-18/19/20/21, SA-WC-OP-5, CP-WC-OP-4, FB-WC-OP-2; cross-link 15.2 no-modal invariant, stage-1 26.5, 12.10, IOD-17 governance)*

   **First-build** `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/ReviewPanel.tsx` inside `omnipanel-shell`. NO new extension. The Review tab is the **gate fold** — the human-required transition LANDING surface per 15.2 ("Review — human-required gate landings; the repurposed `REVIEW_DECISION` widget; never modals").

   **NO MODAL** — per 15.2 invariant + Track 15.2 explicit "no modal review surfaces — Review tab is the landing surface." ide-shell-m0-m5's `review-pane-widget` (stage-1 26.5) is the SIBLING surface in `ide-deep`; both consume the same schema; selection synchronised via cross-layout intent dispatcher.

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/review/`):

   - `<ReviewHeader />` — session filter; outstanding-count badge (number of human-required items); mediator filter; IOD-17 parity-status indicator (green when all live capabilities in parity; red when any drift detected).
   - `<ReviewInbox />` — virtualized list of pending review items. Per row: item id, title, originating dispatch node (badge), originating evidence packet (badge), reviewer-required indicator, IOD-17 parity status indicator, age (since deposition), privacy-class badge.
   - `<ReviewItemView />` — when row clicked: full item view in right pane. Sub-components:
     - `<ReviewItemHeader />` — id, title, mediator, originating dispatch + evidence chips, age, privacy class.
     - `<IOD17ParityReadout />` — three-cell readout per stage-1 26.5: `capabilityMatrixState` | `agentContractState` | `widgetState`. Each cell shows: `'human-required'`, `'agent-allowed'`, `'unset'`. When `inParity === false`: red banner above readout "IOD-17 parity violated — gateway will reject any transition. Check capability-matrix.json, agent-contract.json, widget state."
     - `<ReviewItemEvidenceEmbed />` — embedded `<EvidencePacketView />` (from Tranche 27.5) scoped to this item's linked evidence packet. Read-only embed.
     - `<DispatchGenealogyEmbed />` — embedded `<DispatchTraceMiniGraph />` (from Tranche 27.3) scoped to originating dispatch tree. Read-only embed.
     - `<ReviewActionControls />` — primary action surface:
       - **Approve** button — calls `invokeGatewayRpc('s5.review.submit', { decision: 'approve', reviewId, reason, actor: currentUser })`. Disabled when `enforceHumanGate({ decision: 'approve', humanRequired: item.humanRequired, actorIsHuman: actorIsHuman }).ok === false` — tooltip surfaces the rejection reason.
       - **Reject** button — same gating.
       - **Revise** button — same gating + opens inline `<ReviseForm />` (NOT modal) with revision payload input.
       - **Defer** button — ALWAYS allowed (per `enforceHumanGate` L221-223: "Defer is always allowed — it RECORDS the human-required state.") Records `humanRequired` state + reason; surfaces in review history.
       - **Annotate** button — inline `<AnnotateForm />` (NOT modal); writes annotation to `s5.review.annotate` (annotation does not transition the gate).
     - `<ReviewActionConfirmation />` — inline confirmation summary after action submitted (NOT modal — inline beneath controls). Renders return from gateway + new state.
   - `<ReviewHistoryList />` — bottom pane: chronological history of this item's transitions (from `s5'.review.history`). Per entry: actor, decision, timestamp, reason. Includes deferrals + annotations.

   **`ReviewLandingService`** — Inversify singleton at `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/review-landing-service.ts`:

   ```ts
   @injectable()
   export class ReviewLandingService {
     constructor(
       @inject(SHARED_BRIDGE_ADAPTER) private bridge: SharedBridgeAdapter,
       @inject(KERNEL_BRIDGE_API) private kernelBridge: KernelBridgeAPI
     ) {}
     readonly onInboxAdvance: Event<ReviewInboxAdvance>;
     getInbox(filter: ReviewInboxFilter): Promise<readonly ReviewItem[]>;
     getItem(reviewId: string): Promise<ReviewItemDeep | null>;     // returns IOD-17 parity included
     getHistory(reviewId: string): Promise<readonly ReviewHistoryEntry[]>;
     submit(transition: ReviewTransition): Promise<ReviewSubmitResult>;
     annotate(reviewId: string, text: string): Promise<void>;
     // Wraps enforceHumanGate + assertCapabilityParity before any submit:
     checkGate(reviewId: string, decision: ReviewDecision): GateCheckResult;
   }
   ```

   **`ReviewItemDeep`** — per stage-1 26.5; imported from `omnipanel-runtime.ts`:

   ```ts
   export interface ReviewItemDeep {
     readonly id: string;
     readonly title: string;
     readonly humanRequired: boolean;
     readonly mediator: ActorMediator;
     readonly originatingDispatchNodeId: string;
     readonly originatingEvidencePacketRef: string;
     readonly iod17Parity: {
       readonly capabilityMatrixState: 'human-required' | 'agent-allowed' | 'unset';
       readonly agentContractState:    'human-required' | 'agent-allowed' | 'unset';
       readonly widgetState:           'human-required' | 'agent-allowed' | 'unset';
       readonly inParity: boolean;
     };
     readonly privacyClass: 'public' | 'protected' | 'private';
     readonly depositedAtMs: number;
     readonly sessionKey: string;
     readonly dayNowContext: string;
   }
   ```

   **IOD-17 parity live check** — `ReviewLandingService.checkGate` consumes `assertCapabilityParity` (from `omnipanel-runtime`, migrated from `agentic-control-room/src/common/parity.ts` per Tranche 27.10) AND `enforceHumanGate`. Per stage-1 26.5: red banner "IOD-17 parity violated — gateway will reject any transition" surfaces when `inParity === false`; submit always rejects in that state.

   **Cross-layout sync** — same pattern as Evidence (Tranche 27.5). Review item selection in OmniPanel highlights same item in ide-shell `review-pane-widget` (stage-1 26.5); reverse also.

   **Gateway dependency** — `s5'.review.history` endpoint may not be registered (CP-WC-OP-4). Until then, ReadinessBanner `state: 'pending-gateway', blockers: ["s5'.review.history unregistered"]` on `<ReviewHistoryList />`; review action controls remain functional via existing `s5'.review.submit`.

   **State persistence** — `OmniPanelSessionState.perTabState['review']` = `{ selectedReviewId: string | null; filters: ReviewFilters; scrollOffset: number; reviseFormOpen: boolean; reviseFormDraft?: string; annotateFormOpen: boolean; annotateFormDraft?: string; }`.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/ReviewPanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/review-landing-service.ts`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/review/IOD17ParityReadout.tsx`; `test -f .../review/ReviewActionControls.tsx`; `test -f .../review/ReviewHistoryList.tsx`; `grep -nE "ReviewLandingService\|IOD17ParityReadout\|ReviewActionControls\|ReviewHistoryList\|ReviewItemDeep\|enforceHumanGate" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; no-modal assertion (`grep -rnE "Dialog\|Modal" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/review/` returns nothing); IOD-17 parity-violation red-banner test with synthetic mismatched fixture; human-gate refuse test (agent attempts approve on `humanRequired: true` → blocked with explanatory reason); defer-always-allowed test (agent defer succeeds, `humanRequired` state recorded); cross-layout sync test with `review-pane-widget`.

8. **27.7 — Gateway tab — capability list + parity + readiness + try-it** *(audit-refactor + spec-ahead-integration; sources WC-OP-22/23/24/27, SA-WC-OP-6, CP-WC-OP-5, AR-WC-OP-4; cross-link 12.10, 11.5, `bridge-gate.tsx`)*

   Consolidate ported `NodesPanel.tsx` + `ModelsPanel.tsx` + `SkillsPanel.tsx` + `CronPanel.tsx` + `ConfigPanel.tsx` + `SettingsPanel.tsx` → `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/GatewayPanel.tsx`. Preserve panel-specific logic as sub-views within Gateway tab; do NOT delete ported code — re-mount as facets.

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/gateway/`):

   - `<GatewayHeader />` — gateway WebSocket connection status (from `OmnipanelRuntimeService.onReadiness`); current gateway URL; reconnect affordance; "refresh capabilities" affordance (re-fetches `s4'.mediation.capabilities.list`).
   - `<GatewaySubViewSwitcher />` — segmented control: `Capabilities` (default) · `Nodes` · `Models` · `Skills` · `Cron` · `Config` · `Settings`.
   - `<CapabilityListView />` — default sub-view. Renders capabilities from `s4'.mediation.capabilities.list` (gated on Track 12.10; ReadinessBanner fallback). Per-capability row:
     - `name` (e.g., `readCurrentProfile`, `invokeGatewayRpc`, `s1.semantic.suggest_links`)
     - `version`
     - `status` (`ready` · `pending-bridge` · `pending-profile-field` · `blocked-privacy` · `blocked-s2-graph` · ...; readiness taxonomy per 07-t0)
     - `<CapabilityCheckCell />` — runs `assertCapabilityParity` against gateway-declared state and widget-declared state; renders ✓ / ✗ / ?
     - `<TryItAffordance />` — opens inline panel (NOT modal) with sample payload field for `invokeGatewayRpc`. Submit dispatches; response rendered inline. Privacy-gated: only safe-public capabilities expose try-it.
   - `<NodeFacetView />` — wraps ported NodesPanel content with capability-list-aware framing.
   - `<ModelFacetView />` — wraps ported ModelsPanel content.
   - `<SkillFacetView />` — wraps ported SkillsPanel content. Cross-link to `Body/S/S4/pi-agent/skills/*` source (via Backend Studio click-through in ide-deep per stage-1 6.4).
   - `<CronFacetView />` — wraps ported CronPanel content. Adds cross-link to Chronos carrier (`Body/S/S4/ta-onta/chronos/`) per cycle-2 plan 10 T4.
   - `<ConfigFacetView />` — wraps ported ConfigPanel content. Per `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/domain/configPanelDomain.ts` (existing port).
   - `<SettingsFacetView />` — wraps ported SettingsPanel content.

   **Cross-link to `bridge-gate.tsx`** — `<KernelBridgeReadinessChip />` in `<GatewayHeader />` reads from same readiness state as ide-shell `bridge-gate.tsx`. Click → activate `diagnostics` tab at kernel-bridge sub-section.

   **`assertCapabilityParity` integration** — uses the function migrated to `omnipanel-runtime` per Tranche 27.10. Renders parity check inline per capability row.

   **Forbidden-direct-import discipline** — per Tranche 27.12: Gateway tab MAY NOT import raw WebSocket / raw Neo4j driver / `epii-review-core` / `epii-agent-core`. All gateway access through `KERNEL_BRIDGE_API.invokeGatewayRpc`. Existing controllers/epi-claw/gateway-client.ts is the compat path (allowed during migration).

   **State persistence** — `OmniPanelSessionState.perTabState['gateway']` = `{ activeSubView: 'capabilities' | 'nodes' | 'models' | 'skills' | 'cron' | 'config' | 'settings'; selectedCapabilityName: string | null; tryItDraft?: Record<string, unknown>; }`.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/GatewayPanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/gateway/CapabilityListView.tsx`; `test -f .../gateway/CapabilityCheckCell.tsx`; `test -f .../gateway/TryItAffordance.tsx`; `grep -nE "CapabilityListView\|CapabilityCheckCell\|TryItAffordance\|assertCapabilityParity" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; capability-list rendering test against synthetic capability-matrix fixture; parity check test; try-it dispatch test (calls `invokeGatewayRpc` with sample payload); sub-view switcher test (six sub-views accessible); ReadinessBanner fallback test when `s4'.mediation.capabilities.list` unregistered.

9. **27.8 — Diagnostics tab — kernel-bridge telemetry + intent log** *(audit-refactor + spec-ahead-integration; sources WC-OP-25/26/33, SA-WC-OP-7, AR-WC-OP-6; cross-link 15.6, 15.10, 10.x kernel-bridge readiness ledger, `bridge-gate.tsx` pattern)*

   Reframe `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/DebugPanel.tsx` → `DiagnosticsPanel.tsx`. The Diagnostics tab is the **telemetry fold** — kernel-bridge state, profile-tick subscription state, S2 graph reachability, gateway WebSocket state, layout-active state, CrossLayoutIntent log. NOT a developer-only debug surface — first-class user-facing diagnostic with provenance-always-visible per 15-foundation principle 3.

   **Sub-component decomposition** (under `omnipanel-shell/src/browser/components/omni/diagnostics/`):

   - `<DiagnosticsHeader />` — overall health summary: green/amber/red traffic light + summary phrase ("All systems ready" · "Bridge degraded — kernel-bridge profile-field pending" · "Gateway blocked — WebSocket disconnected"). Last-tick timestamp.
   - `<KernelBridgeReadinessSummary />` — full readiness ledger from kernel-bridge-readiness extension. Per readiness class (per 07-t0 taxonomy: `bridge_unavailable`, `profile_missing_field`, `s2_graph_blocked`, `s3_subscription_blocked`, `s5_review_blocked`, `authority_payload_missing`, `privacy_blocked`, `degraded_but_readable`, `ready_public_current`): count, drill-down link.
   - `<ProfileFieldPendingMarkers />` — per `MathemeHarmonicProfile` field declared pending in 10.x: field name, gating tranche reference, current state. Empty when all fields ready.
   - `<MathemeProfileGenerationDisplay />` — current `profileGeneration` value (from `BimbaPratibimbaUiState`), tick history (last 12 generations), tick-advance rate (ticks/sec).
   - `<ProfileTickSubscriptionState />` — number of active subscribers across the extension graph (per `OmnipanelRuntimeService.subscribers`); last tick processed; lag indicator if any subscriber falls behind.
   - `<S2GraphReachability />` — Bimba + Gnosis namespace reachability via `s2.graph_services.ping` (or equivalent). Embedding dimension confirmation (`GEMINI_EMBED_DIMS=3072` per MEMORY).
   - `<GatewayWebSocketState />` — connection state (`connected` · `connecting` · `disconnected` · `error`); URL; last ping timestamp; latency; reconnect history.
   - `<ActiveLayoutDisplay />` — current layout (`daily-0-1` · `ide-deep`); 0/1 toggle state within `daily-0-1` (per Tranche 15.5 cosmic / personal); active OmniPanel tab; active activity-bar mode (per 15.3).
   - `<CrossLayoutIntentLog />` — rolling buffer of last 32 `CrossLayoutIntent` envelopes (per 11.2). Per entry: timestamp, originating tab/extension, target tab/extension, envelope payload summary, success/failure. Click → expanded envelope detail. Cleared on session change.

   **`KernelBridgeReadinessChip />`** shared component (from Tranche 27.7's Gateway header) reused inline.

   **State persistence** — `OmniPanelSessionState.perTabState['diagnostics']` = `{ activeSubSection: 'overview' | 'kernel-bridge' | 'profile' | 's2-graph' | 'gateway-ws' | 'intent-log' | null; intentLogScrollOffset: number; }`.

   **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/panels/DiagnosticsPanel.tsx`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/diagnostics/KernelBridgeReadinessSummary.tsx`; `test -f .../diagnostics/ProfileTickSubscriptionState.tsx`; `test -f .../diagnostics/CrossLayoutIntentLog.tsx`; `grep -nE "KernelBridgeReadinessSummary\|ProfileTickSubscriptionState\|CrossLayoutIntentLog\|S2GraphReachability\|GatewayWebSocketState" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; profile-tick state display test asserts subscriber count + tick history; CrossLayoutIntent log test with 32+ synthetic intents (rolling buffer correctness); readiness summary test against synthetic readiness-ledger fixture.

10. **27.9 — OmniPanelIntentRouter — tab-routing on CrossLayoutIntent** *(spec-ahead-integration; sources WC-OP-27, SA-WC-OP-8; cross-link 11.2 cross-layout intent routing T5 promotion)*

    Land `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-intent-router.ts` Inversify singleton. Subscribes to `cross-layout-intent-dispatcher` events emitted from `pratibimba-layouts/src/browser/cross-layout-intent-dispatcher.ts` (per 11.2 T5 promotion). Maps `CrossLayoutIntent.requestedExtensionId` + `requestedContributionId` → `OmniPanelTabId` activation + per-tab routing payload.

    **Routing table** (concrete mapping; can be extended via `register()` from other extensions):

    ```ts
    @injectable()
    export class OmniPanelIntentRouter {
      constructor(
        @inject(SHARED_BRIDGE_ADAPTER) private bridge: SharedBridgeAdapter,
        @inject(OMNIPANEL_RUNTIME_SERVICE) private runtime: OmnipanelRuntimeService,
        @inject(OMNIPANEL_WIDGET_ID_TOKEN) private widgetIdResolver: () => OmniPanelWidget | null
      ) {}

      private readonly defaultRoutes: ReadonlyMap<string, OmniPanelRoutingResolver> = new Map([
        // From ide-shell-m0-m5 widgets:
        ['ide-shell-m0-m5/agentic-control-room.select-run',         resolveDispatchTraceRoute],
        ['ide-shell-m0-m5/evidence-pane.select-packet',             resolveEvidenceRoute],
        ['ide-shell-m0-m5/review-pane.select-review',               resolveReviewRoute],
        ['ide-shell-m0-m5/logos-atelier.invoke-aletheia',           resolveDispatchTraceRouteForCrystallisation],
        // From per-Mn extensions (stage-1 21-26 cross-links):
        ['m0-anuttara/verifier.open-witness',                       resolveEvidenceRouteForWitness],
        ['m4-nara/highlight-service.inscribe-agent-mark',           resolveSessionsRoute],
        ['m5-epii/contemplation-object-viewer.open',                resolveEvidenceRouteForContemplationObject],
        // From OmniPanel internal click-through:
        ['omnipanel-shell/dispatch-trace.open-evidence',            resolveEvidenceRoute],
        ['omnipanel-shell/dispatch-trace.open-tool-stream',         resolveToolStreamRoute],
        ['omnipanel-shell/tool-stream.open-dispatch-trace',         resolveDispatchTraceRoute],
        ['omnipanel-shell/evidence.open-review',                    resolveReviewRoute],
        ['omnipanel-shell/review.open-gateway-blocker',             resolveGatewayRoute],
        ['omnipanel-shell/gateway.open-bridge-readiness',           resolveDiagnosticsRoute],
        ['omnipanel-shell/pi-chat.dispatch-emitted',                resolveDispatchTraceRoute]
      ]);

      register(key: string, resolver: OmniPanelRoutingResolver): Disposable;
      route(intent: CrossLayoutIntent): OmniPanelRoutingResult;
    }

    interface OmniPanelRoutingResult {
      readonly activateTab: OmniPanelTabId;
      readonly perTabPayload: unknown;       // e.g., { selectedPacketId: 'pkt-123' } for Evidence
      readonly shouldRevealOmniPanel: boolean;
    }
    ```

    Each `resolver` is a pure function `(intent) → OmniPanelRoutingResult`. Defaults handle the canonical cases; per-extension `register()` allows customisation.

    **Reveal behaviour** — when OmniPanel is currently hidden/minimised (per `OmniPanelWidget.omniState`), routing fires `shouldRevealOmniPanel = true`. The widget transitions to `fullscreen` state with the target tab activated and per-tab payload applied. Per 15.5 lemniscate transition discipline: if layout is also being switched, the animation is sequential (layout first, then tab activation) so the user sees the natural fold.

    **State preservation across routing** — when intent routes into a tab, EXISTING per-tab state is preserved; routing only sets the routing-induced state (e.g., `selectedPacketId`) without resetting unrelated state (e.g., `filters`). Per 15.7 state-persistence-across-toggle invariant.

    **Bidirectional with ide-shell sibling surfaces** — routing into OmniPanel Evidence from ide-shell `evidence-pane-widget` is one direction; reverse (selection in OmniPanel Evidence fires intent → ide-shell highlights same packet) is wired via `OmnipanelRuntimeService.onSelection` → `cross-layout-intent-dispatcher.dispatch()`.

    **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-intent-router.ts`; `grep -nE "OmniPanelIntentRouter\|OmniPanelRoutingResult\|defaultRoutes\|register" Body/M/epi-theia/extensions/omnipanel-shell/src/browser/`; routing-table test with all 14 default routes (each intent activates expected tab with expected payload); reveal-on-hidden test asserts hidden OmniPanel surfaces with target tab; state-preservation test asserts non-routing state survives; bidirectional sync test asserts selection in OmniPanel Evidence highlights same packet in ide-shell `evidence-pane-widget`; acceptance-harness extension per Tranche 27.13 includes "OmniPanel intent → tab activation → per-tab state applied" assertion.

11. **27.10 — ACR substrate → OmniPanel content model migration map + execution** *(spec-ahead-integration + DR-landing; sources WC-OP-29, DR-WC-OP-2, DR-WC-OP-3; cross-link 12.14, stage-1 26.7)*

    Author `Body/M/epi-theia/extensions/omnipanel-shell/src/common/ACR-MIGRATION-MAP.md` — per-symbol migration plan from `agentic-control-room/src/common/run-model.ts` (and `parity.ts`, `acr-runtime-service.ts`) into `omnipanel-shell/src/common/omnipanel-runtime.ts` (and `omnipanel-shell/src/browser/services/`) and `integrated-composition/src/common/evidence-shapes.ts`.

    **Per-symbol migration plan:**

    | Symbol | From | To | Rename? | Notes |
    |---|---|---|---|---|
    | `AgenticActor` | `agentic-control-room/common/run-model.ts:23` | `omnipanel-shell/common/omnipanel-runtime.ts` | → `ActorIdentity` | Replaced by `ActorMediator` from evidence-shapes for fine-grained `aletheia` subagent typing |
    | `AgenticRoute` | `run-model.ts:35` | `omnipanel-runtime.ts` | → `DispatchRoute` | Kept as string-or-union; routes registered via `omnipanel-runtime-service.invokeRoute` |
    | `RunStatus` | `run-model.ts:44` | `omnipanel-runtime.ts` | no rename | Kept verbatim |
    | `RunTreeNode` | `run-model.ts:55` | `omnipanel-runtime.ts` | no rename | EXTENDED per Tranche 27.3 with `actor: ActorMediator`, `capability`, `psycheFacet?`, `evidencePacketRef?`, `aletheiaCrystallisationIntent?`, `aletheiaFacetReturn?`, `sessionKey`, `tickAtInvoke` |
    | `ToolStreamEvent` | `run-model.ts:66` | `omnipanel-runtime.ts` | no rename | EXTENDED per Tranche 27.4 with `actor`, `dispatchNodeId`, `sessionKey`, `tickAtEmit`, `inputDigest?`, `outputDigest?`, `latencyMs?`, `evidencePacketRef?` |
    | `ReviewDecision` | `run-model.ts:75` | `omnipanel-runtime.ts` | no rename | Kept verbatim |
    | `ReviewTransition` | `run-model.ts:77` | `omnipanel-runtime.ts` | no rename | Kept verbatim |
    | `RunEvidenceEnvelope` | `run-model.ts:92` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved to canonical schema home per stage-1 26.10 |
    | `MediatedRunEvidencePacket` | `run-model.ts:196` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved per stage-1 26.10; ALSO extended with `dispatchTrace`, `toolStream`, `gateLandings`, `axiomTranslationSteps`, `contemplationObjectRef?` per stage-1 26.10 schema |
    | `MediationCapabilityName` | `run-model.ts:109` | `omnipanel-runtime.ts` | no rename | Kept verbatim |
    | `enforceHumanGate()` | `run-model.ts:212` | `omnipanel-shell/browser/services/review-landing-service.ts` | no rename | Wrapped by `ReviewLandingService.checkGate` per Tranche 27.6 |
    | `isMediationCapabilityAllowed()` | `run-model.ts:299` | `omnipanel-runtime.ts` | no rename | Pure function; kept at runtime module level |
    | `buildEvidenceEnvelope()` | `run-model.ts:241` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved with type |
    | `buildMediatedRunEvidencePacket()` | `run-model.ts:340` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved with type |
    | `REQUIRED_EVIDENCE_FIELDS` | `run-model.ts:395` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved with type |
    | `REQUIRED_MEDIATED_EVIDENCE_FIELDS` | `run-model.ts:408` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved with type |
    | `missingEvidenceFields()` | `run-model.ts:422` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved with type |
    | `validate*Ref()` (4 functions) | `run-model.ts:432-486` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved as private impl |
    | `sanitizeProtectedHandle()` | `run-model.ts:488` | `integrated-composition/common/evidence-shapes.ts` | no rename | Privacy invariant preserved |
    | `validateVaultRef()` | `run-model.ts:506` | `integrated-composition/common/evidence-shapes.ts` | no rename | Moved as private impl |
    | `assertCapabilityParity` | `agentic-control-room/common/parity.ts` | `omnipanel-runtime.ts` | no rename | Consumed by `ReviewLandingService.checkGate` + Gateway tab `CapabilityCheckCell` |
    | `ACRRuntimeService` impl | `agentic-control-room/browser/acr-runtime-service.ts` | `omnipanel-shell/browser/services/omnipanel-runtime-service.ts` | → `OmnipanelRuntimeService` | Per Tranche 27.0 — extends runtime contract |
    | `run-flow-widget.tsx` | `agentic-control-room/browser/run-flow-widget.tsx` | DECOMPOSE into Tranches 27.3 (DispatchTracePanel) + 27.5 (EvidencePanel) + 27.6 (ReviewPanel) sub-components | replaced | Original file deleted post-migration |
    | `ACR_WIDGET_IDS` | `agentic-control-room/common/index.ts` | `omnipanel-shell/common/omnipanel-runtime.ts` | merged into `OMNIPANEL_TAB_WIDGET_IDS` | `RUN_TREE/TOOL_STREAM/DIAGNOSTICS/EVIDENCE_DEPOSITION/REVIEW_DECISION` → tab semantic equivalents |

    **`agentic-control-room` package fate (DR-WC-OP-2)** — Recommendation **option (b): DELETE empty package** after substrate moved. The `agentic-control-room-widget.tsx` in `ide-shell-m0-m5/src/browser/` (per stage-1 26.7 Pi-monitor reframe) re-imports from `omnipanel-shell/common/omnipanel-runtime`. The empty `agentic-control-room/` directory removed; layout-types references to `agenticControlRoom` widget id remapped to `pratibimba.ide-shell.pi-runtime-monitor` (same widget, renamed surface per stage-1 26.7). DR-WC-OP-2 lands in Track 13 ratifying option (b).

    **Pi-runtime-monitor vs OmniPanel Pi Chat (DR-WC-OP-3)** — Two distinct surfaces sharing one substrate:

    - **OmniPanel Pi Chat** (right sidebar, both layouts) = Pi-as-conversational-membrane. User talks to Pi here. Dispatch genealogy surfaces as inline badges + click-through to Dispatch Trace tab.
    - **Pi Runtime Monitor** (formerly ACR, in `ide-deep` only, hosted by `ide-shell-m0-m5`) = full-fidelity dispatch + tool-stream + capability-tree + capacity-workflow views per stage-1 26.7. Deeper observability surface.

    Both consume `omnipanel-runtime`. DR-WC-OP-3 documents the distinction. NO conflation.

    **Execution sequence:**

    1. Land `omnipanel-runtime.ts` re-exports from `agentic-control-room/common/run-model` (Tranche 27.0 partial).
    2. Move evidence-shape symbols to `integrated-composition/common/evidence-shapes.ts` (stage-1 26.10 must land first).
    3. Replace re-exports in `omnipanel-runtime.ts` with native definitions (extending types per 27.3 + 27.4).
    4. Update all imports across the extension graph (`grep -rnE "from '@pratibimba/agentic-control-room'" Body/M/epi-theia/extensions/`).
    5. Decompose `run-flow-widget.tsx` into Tranches 27.3/27.5/27.6 sub-components.
    6. Delete `agentic-control-room/` package directory.
    7. Rename ide-shell `agentic-control-room-widget.tsx` exports to `pi-runtime-monitor-*` (widget id preserved per stage-1 26.7 (c)).
    8. DR-WC-OP-2 + DR-WC-OP-3 land in Track 13.

    **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/common/ACR-MIGRATION-MAP.md`; `grep -rnE "from '@pratibimba/agentic-control-room'" Body/M/epi-theia/extensions/` returns zero results (post-migration); migration test asserts all 20 substrate symbols re-importable from new homes; ide-shell-m0-m5 `agentic-control-room-widget.tsx` (now `pi-runtime-monitor-widget.tsx` per stage-1 26.7) builds clean; `pnpm --filter @pratibimba/omnipanel-shell build && pnpm --filter @pratibimba/ide-shell-m0-m5 build && pnpm --filter @pratibimba/integrated-composition build` all clean; DR-WC-OP-2 + DR-WC-OP-3 entries present in `13-decision-register.md`.

12. **27.11 — OmniPanelSessionState — active-tab + per-tab state across layout toggle** *(spec-ahead-integration; sources WC-OP-28/35, SA-WC-OP-9; cross-link DR-TS-1, 15.7, 11.6)*

    Extend `BimbaPratibimbaUiState` (per Tranche 15.7) with OmniPanel-specific state. Land `Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-session-state.ts`:

    ```ts
    export interface OmniPanelSessionState {
      readonly activeTab: OmniPanelTabId;
      readonly perTabState: {
        readonly 'pi-chat': PiChatTabState;
        readonly 'sessions': SessionsTabState;
        readonly 'dispatch-trace': DispatchTraceTabState;
        readonly 'tool-stream': ToolStreamTabState;
        readonly 'evidence': EvidenceTabState;
        readonly 'review': ReviewTabState;
        readonly 'gateway': GatewayTabState;
        readonly 'diagnostics': DiagnosticsTabState;
      };
      readonly omniState: 'hidden' | 'minimal' | 'fullscreen';   // mirrors OmniPanelWidget.omniState
    }

    export interface PiChatTabState {
      readonly conversationId: string | null;
      readonly draftMessage: string;
      readonly scrollOffset: number;
      readonly capabilityPaletteOpen: boolean;
    }

    export interface SessionsTabState {
      readonly selectedSessionId: string | null;
      readonly filterPredicate: 'today' | 'this-week' | 'all';
    }

    export interface DispatchTraceTabState {
      readonly expandedNodeIds: readonly string[];
      readonly selectedNodeId: string | null;
      readonly actorFilter: readonly string[];
      readonly timeRangeFilter: 'last-5m' | 'last-hour' | 'full-session';
    }

    export interface ToolStreamTabState {
      readonly filters: {
        readonly actor?: string;
        readonly toolName?: string;
        readonly timeRange?: 'last-5m' | 'last-hour' | 'full-session' | 'custom';
        readonly eventKind?: readonly string[];
        readonly privacyClass?: 'public' | 'protected' | 'private' | 'all';
      };
      readonly selectedEventId: string | null;
      readonly scrollOffset: number;
      readonly live: boolean;
    }

    export interface EvidenceTabState {
      readonly selectedPacketId: string | null;
      readonly filters: { mediator?: string; timeRange?: string; privacyClass?: string };
      readonly scrollOffset: number;
      readonly depositFormOpen: boolean;
      readonly depositFormDraft?: unknown;
    }

    export interface ReviewTabState {
      readonly selectedReviewId: string | null;
      readonly filters: { mediator?: string; humanRequiredOnly?: boolean };
      readonly scrollOffset: number;
      readonly reviseFormOpen: boolean;
      readonly reviseFormDraft?: string;
      readonly annotateFormOpen: boolean;
      readonly annotateFormDraft?: string;
    }

    export interface GatewayTabState {
      readonly activeSubView: 'capabilities' | 'nodes' | 'models' | 'skills' | 'cron' | 'config' | 'settings';
      readonly selectedCapabilityName: string | null;
      readonly tryItDraft?: Record<string, unknown>;
    }

    export interface DiagnosticsTabState {
      readonly activeSubSection: 'overview' | 'kernel-bridge' | 'profile' | 's2-graph' | 'gateway-ws' | 'intent-log' | null;
      readonly intentLogScrollOffset: number;
    }
    ```

    **Extension of `BimbaPratibimbaUiState`** — Tranche 15.7 lands the base contract; Tranche 27.11 extends:

    ```ts
    export interface BimbaPratibimbaUiState {
      // From Tranche 15.7 / layout-types.ts L7-12:
      readonly coordinate: string;
      readonly lens: string;
      readonly mode: string;
      readonly profileGeneration: number;
      readonly sessionKey: string;
      readonly dayNow: string;
      readonly activeActivityBarMode: string;

      // Track 27.11 addition:
      readonly omniPanel: OmniPanelSessionState;
    }
    ```

    **Persistence wiring** — `pratibimba-layouts/src/browser/session-state-service.ts` (landed) extended to persist `omniPanel` field. On layout toggle: serialise current `omniPanel` state → restore in target layout. On OmniPanel re-mount: hydrate per-tab state from persisted; component constructors accept hydration argument.

    **Per-tab Inversify singletons** — each panel (PiChatPanel, SessionManagerPanel, etc.) consumes its tab state via `useOmniPanelTabState<T>(tabId)` hook (new), reading from + writing to `OmnipanelSessionStateService` (new Inversify singleton at `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-session-state-service.ts`).

    **Verification:** `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-session-state.ts`; `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/browser/services/omnipanel-session-state-service.ts`; `grep -nE "OmniPanelSessionState\|omniPanel.*activeTab\|perTabState\|PiChatTabState\|EvidenceTabState\|ReviewTabState" Body/M/epi-theia/extensions/`; round-trip serialisation test for each tab state shape; `pnpm --filter @pratibimba/acceptance-harness test` includes per-Tranche-27.13 assertion that `omniPanel.activeTab` + every `perTabState[*]` survives `daily-0-1` ↔ `ide-deep` toggle.

13. **27.12 — Forbidden-direct-import lint extension over OmniPanel tab modules** *(spec-ahead-integration; sources WC-OP discipline; cross-link 11.5 forbidden-direct-import lint precedent)*

    Extend `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` to grep `Body/M/epi-theia/extensions/omnipanel-shell/src/**/*.ts{x,}` for the `SharedBridgeAdapter.forbiddenDirectImports` list from `07-t0-extension-contract-preflight.json`. Discipline: OmniPanel tabs may NOT import:

    - `@theia/.../ws-connection-provider` raw WebSocket
    - `neo4j-driver` raw
    - `@clockworklabs/spacetimedb-sdk` raw
    - `redis` raw
    - `epii-review-core`
    - `epii-agent-core`
    - `Body/S/S0/*` direct
    - `Body/S/S2/*` direct
    - `Body/S/S3/*` direct
    - `Body/S/S5/*` direct

    All gateway access through `SharedBridgeAdapter` / `KERNEL_BRIDGE_API.invokeGatewayRpc` only.

    **Compat exception** — `omnipanel-runtime-stub.ts` (the `window.sPrime` shim) is the existing compat layer; lint excludes that file with TODO marker pointing to its deprecation in Tranche 27.0 (`/** @deprecated — replaced by OmnipanelRuntimeService DI singleton once kernel-bridge DI extension fully lands (Track 10 + 15.7) */`). Existing `controllers/epi-claw/gateway-client.ts` is the wholesale-ported WebSocket gateway client; lint EXCLUDES this file as compat, with TODO marker "migrate to `invokeGatewayRpc` once T5 typed RPC lands per 11.2."

    **Allow-list for shared sibling import** — `omnipanel-shell` MAY import from:

    - `@pratibimba/m-extension-runtime` (SharedBridgeAdapter, etc.)
    - `@pratibimba/kernel-bridge` (KernelBridgeAPI)
    - `@pratibimba/kernel-bridge-readiness`
    - `@pratibimba/integrated-composition/common/evidence-shapes` (per Tranche 27.5)
    - `@pratibimba/pratibimba-layouts/common/layout-types` (per Tranche 27.11)
    - `@theia/core/*` (Theia platform)
    - `@theia/core/shared/inversify`
    - `react` / `react-dom`

    **Verification:** `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` passes against omnipanel-shell src tree; `node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs` extended fixture asserts forbidden-import detection on synthetic violator file under omnipanel-shell; explicit compat allow-list test for `omnipanel-runtime-stub.ts` + `controllers/epi-claw/gateway-client.ts`.

14. **27.13 — Acceptance-harness OmniPanel-tab traversal end-to-end** *(spec-ahead-integration; sources WC-OP discipline; cross-link 11.6 acceptance-harness precedent + DR-TS-1)*

    Extend `Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs` with end-to-end OmniPanel traversal assertions, exercising the click-through invariants from the Surface Contracts section:

    **Test sequence:**

    1. **Boot real stack** — gateway + SpaceTimeDB + Neo4j + Redis + S5 per existing harness pattern.
    2. **Layout startup invariant** — assert OmniPanel mounted in both `daily-0-1` and `ide-deep` (per stage-1 TS-03); assert exactly 8 tabs visible per `OMNIPANEL_TABS` post-Tranche 27.0.
    3. **Pi Chat slash-command dispatch** — send `/dispatch nous` via PiChatPanel input; assert `OmnipanelRuntimeService.invokeRoute('anima_self_invoke', {target:'nous'})` called; assert Dispatch Trace tab activates with new node visible (per Tranche 27.3 routing).
    4. **Same-event Tool Stream link** — click event in Tool Stream tab; assert Dispatch Trace tab activates and highlights corresponding node (per 15.11 same-data-different-fold).
    5. **Evidence packet click-through** — synthesise `MediatedRunEvidencePacket` via `buildMediatedRunEvidencePacket`; click packet in Evidence tab; assert `EvidencePacketView` renders all packet fields including `<PrivacyClassBadge />` for synthetic privacy class.
    6. **Review human-gate refuse** — synthesise review item with `humanRequired: true`; attempt approve via agent-actor (`actorIsHuman: false`); assert `<ReviewActionControls />` Approve button disabled; assert tooltip surfaces `enforceHumanGate` rejection message; assert no `s5'.review.submit` RPC fires.
    7. **IOD-17 parity violation banner** — synthesise review item with `iod17Parity.inParity: false`; assert red banner "IOD-17 parity violated" renders; assert all action controls disabled.
    8. **Gateway capability list** — assert `<CapabilityListView />` renders capabilities from `s4'.mediation.capabilities.list` (per Tranche 12.10 — if not landed, assert ReadinessBanner shown).
    9. **Diagnostics CrossLayoutIntent log** — fire 3 `CrossLayoutIntent` envelopes; assert `<CrossLayoutIntentLog />` rolling buffer reflects all 3 in order.
    10. **State-identity assertion (Tranche 27.11)** — select Evidence packet pkt-XYZ; toggle `daily-0-1` ↔ `ide-deep`; assert `omniPanel.activeTab === 'evidence'` post-toggle; assert `omniPanel.perTabState['evidence'].selectedPacketId === 'pkt-XYZ'` post-toggle.
    11. **Per-tab state across all 8 tabs** — for each of 8 tabs, set distinguishing state (e.g., Pi Chat scroll offset, Sessions selected session, etc.); toggle layout; assert every tab state field preserved.

    **Test file:** extend `Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs`. Synthetic fixtures live under `acceptance-harness/fixtures/omnipanel-tab-traversal/`.

    **Verification:** `pnpm --filter @pratibimba/acceptance-harness test` passes new tab-traversal test. Visual-regression baseline added per stage-1 15.12 for Pi Chat slash-command dispatch + Evidence packet view + Review parity-violation banner. Per-tab-state preservation test covers ALL 8 tabs (no tab omitted).

## Anti-Greenfield Posture

All Track 27 work either: **reframes a ported panel** in place inside the omnipanel-shell package (27.1 PiChatPanel from ChatPanel; 27.2 SessionManagerPanel from SessionsPanel; 27.4 ToolStreamPanel from LogsPanel; 27.8 DiagnosticsPanel from DebugPanel); **consolidates ported panels** into one canonical tab (27.3 DispatchTracePanel from ChannelsPanel + InstancesPanel; 27.7 GatewayPanel from NodesPanel + ModelsPanel + SkillsPanel + CronPanel + ConfigPanel + SettingsPanel); **first-builds INSIDE omnipanel-shell** for tabs with no ported equivalent (27.5 EvidencePanel; 27.6 ReviewPanel) — discipline justified because OmniPanel was ALWAYS designed for these per 15.2, and the first-build is INSIDE an existing extension, not a new package; **migrates substrate** from agentic-control-room to omnipanel-runtime + integrated-composition (27.10, executing 12.14 option (a) at substrate level + recommending option (b) package deletion); **extends typed contracts** in shared common modules (27.0 omnipanel-runtime + 8-tab manifest; 27.11 OmniPanelSessionState); **extends discipline tooling** (27.12 lint, 27.13 acceptance-harness); **lands DR entries** in Track 13 (DR-WC-OP-1, DR-WC-OP-2, DR-WC-OP-3). No greenfield extension package. No competing widget shell. No new evidence schema (Track 26.10 owns it). No modal review surfaces ever. No M5'-chrome (capacity views, EBM observatory, recognition-layer) in OmniPanel per DR-TS-4. Cross-track substrate gates (10.x, 11.2, 11.5, 11.6, 12.1, 12.6, 12.7, 12.10, 12.14, 12.18-19, 15.5-7, 15.10-11, 19.6, 19.9, 26.4-10, 26.13-14) are explicit, not hidden coupling. Profile-tick is the clock per 15.6. SharedBridgeAdapter is the only seam per 07-t0.

## Closing

The OmniPanel becomes what 15.2 named it: the agentic membrane, the `/` operator made visible as UI, the persistent right-side surface that holds Pi's voice across both layouts. Eight tabs, one substrate, one operation folded eight ways. Click-through is the verb — from Pi Chat dispatch genealogy badge to Dispatch Trace tab at the node, to Evidence tab at the packet, to Review tab at the gate, to Gateway tab at the blocked capability, to Diagnostics tab at the kernel-bridge field. Sessions anchors the continuity; state survives the toggle. The user does not need to navigate; the routing routes itself. Pi speaks; Anima dispatches; Aletheia subagents surface in crystallisation-mode under Anima; evidence deposes; review gates; gateway authorises; diagnostics telemetries. The membrane is the operator. The operator is `/`. The `/` is the inversion act made visible.

**End of Track 27.**
