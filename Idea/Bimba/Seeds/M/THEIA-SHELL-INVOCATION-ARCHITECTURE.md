---
title: "Theia Shell Invocation & Operation Architecture — How the M' Operational System Lives, Invokes, Persists, Renders"
coordinate: "M5-3 / M5-3' (shell-of-shells)"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the Body/M/epi-theia shell as the M' operational system. Cycle-2 plan 01 (Electron/Theia shell + OmniPanel) and cycle-3 Tranche 11 (theia-shell-surface-hosting) + Tranche 15 (UI-design-foundations) defer to this document for the operational wiring. Where they disagree, this document is authoritative for the shell's invocation/operation grammar; the tranche docs remain authoritative for their specific landings."
depends_on:
  - "[[Body/M/epi-theia substrate (cycle-2 landed)]]"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md"
  - "Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md"
deprecates_in_part:
  - "Body/M/epi-tauri — migration-source only per `project_theia_shell_moved_to_epi_theia` memory; do not invoke against."
related_tranches:
  - "11.x — theia-shell-surface-hosting (cycle-3)"
  - "12.14 — repurposed-ACR → OmniPanel"
  - "15.1 — foundation-principles registry"
  - "15.2 — OmniPanel agentic-membrane spec"
  - "15.3 — left-sidebar activity-bar system"
  - "15.4 — editor-area composition pattern"
  - "15.5 — 0/1 toggle + lemniscate transition"
  - "15.6 — profile-tick clock + readiness inline"
  - "15.7 — bimba/pratibimba state-persistence"
  - "15.8 / 15.9 — ananda-vortex K² + tick choreography"
  - "15.10 — status bar discipline"
  - "15.11 — dispatch-genealogy primitive"
  - "10.x — kernel-bridge profile-tick spine"
---

# Theia Shell Invocation & Operation Architecture

## 0. Frame — The Shell IS the M' Operational System

`Body/M/epi-theia` is not "a UI for Epi-Logos." It is the operational embodiment of M' — the place where Pi runs, where Anima dispatches, where the kernel-bridge profile-tick crosses substrate into render, where the 0/1 cosmic/personal toggle and the 4+2 ide-deep depth meet at one persistent right-sidebar `/` membrane.

Five load-bearing claims this document makes operational:

1. **The shell is a single Theia process with a single renderer.** Both `daily-0-1` and `ide-deep` layouts run inside it. `ApplicationShell.setLayoutData` switches layout; nothing about session, kernel-bridge subscription, OmniPanel state, day-now anchor, or active coordinate is rebuilt by the switch. The DI singletons at [`pratibimba-layouts/src/browser/session-state-service.ts:52-113`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/session-state-service.ts) and [`kernel-bridge/src/browser/kernel-bridge-api.ts:127-352`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts) carry the identity contract.
2. **OmniPanel is the agentic right-sidebar membrane**, replacing the standalone Agentic Control Room per DR-M5-1 / Tranche 12.14. ACR's substrate (`run-model.ts`, `acr-runtime-service.ts`, `parity.ts`) is repurposed as the OmniPanel content model, never as a competing widget shell.
3. **Left-sidebar modes are activity-bar-switched**, not stacked. The "thousand panels" trap (UI foundation principle 7) is closed by Theia's existing application-shell-left activity-bar contribution system. No parallel mode panel.
4. **Composition over juxtaposition** is the editor-area discipline. Integrated plugins (`plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`) compose three M-extensions onto a single geometric surface (K² torus, dipyramid + Hopf-linked tori), never three side-by-side widgets.
5. **The profile-tick is the global UI clock.** Every widget subscribes via `KernelBridgeAPI.onProfile` ([`kernel-bridge-api.ts:205-212`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts)). User input is not the clock; gateway profile generation advance is. Pause/scrub/replay are first-class affordances built on top.

What this document does that the existing tranche docs do not: it walks the actual invocation paths — keystroke to widget to dispatcher to gateway and back — and names the persistence surfaces that have to survive transitions. The tranches name what; this names how.

---

## 1. Layout Grammar — Two Layouts, One Right-Side `/`

### 1.1 The two named layouts

Canonical identifiers at [`pratibimba-layouts/src/common/layout-types.ts:13-19`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts):

```ts
PRATIBIMBA_LAYOUT_DAILY_0_1 = 'daily-0-1'
PRATIBIMBA_LAYOUT_IDE_DEEP  = 'ide-deep'
```

Both layouts are *materialisations of the same Theia ApplicationShell*. The switch is intra-process — `PratibimbaLayoutSwitcher.switchTo` at [`layout-switcher.ts:95-114`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-switcher.ts) fires `onLayoutChange`; each owning extension reveals or hides its widgets per `descriptor.expectedWidgets`. No window reload. No second renderer. No second kernel-bridge subscription (Track 03 verification line).

| Layout | Editor area | Left sidebar (activity-bar modes) | Right sidebar | Bottom |
|---|---|---|---|---|
| **`daily-0-1`** | Integrated 1-2-3 (cosmic side) **OR** integrated 4-5-0 (personal side) per `cmd-period` toggle | Day Calendar · Journal Entries · Personal Coordinate | OmniPanel | profile-tick · readiness · day-now |
| **`ide-deep`** | Active Mn extension widget (single pole at a time; tab/split allowed across multiple ide-deep openings) | Coordinate Tree · Bimba Graph Viewer · Canon Studio · Backend Studio · Smart Connections | OmniPanel | Evidence pane · Review pane · Autoresearch pane · kernel-bridge readiness |

The five existing IDE-shell widgets are landed at [`ide-shell-m0-m5/src/browser/*-widget.tsx`](../../../../Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/) and registered as `AbstractViewContribution` instances in [`ide-shell-m0-m5/src/browser/frontend-module.ts`](../../../../Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/frontend-module.ts). The architecture below is consumed against this substrate, not against greenfield.

### 1.2 Intra-layout gesture vs cross-layout intent

The 0/1 toggle inside `daily-0-1` is **intra-layout** — same Theia layout, the editor area cross-fades cosmic↔personal via the lemniscate animation. No `ApplicationShell.setLayoutData` call. Only the active editor widget swaps.

The `daily-0-1` ↔ `ide-deep` switch is **cross-layout** — full `ApplicationShell.setLayoutData` invocation, full reveal/hide of the expected-widget set, full fan-out of the `onLayoutChange` event. Persistence contract (§3.4) survives both.

The grammar invariant:

- `cmd-period`     → intra-layout 0/1 toggle (cosmic↔personal in `daily-0-1`; in `ide-deep` it is interpreted as "swap the active Mn pole to its dual" — m1↔m4, m2↔m5, m3↔m0)
- `cmd-shift-/`    → cross-layout switch (toggle between `daily-0-1` and `ide-deep`)
- `cmd-shift-{0..5}` → cross-layout switch to `ide-deep` + open Mn directly
- `cmd-shift-O`    → OmniPanel toggle (does not affect layout)

### 1.3 The right-sidebar `/` is the only thing that is identical across both layouts

The OmniPanel widget — [`omnipanel-shell/src/browser/omnipanel-widget.tsx:29-58`](../../../../Body/M/epi-theia/extensions/omnipanel-shell/src/browser/omnipanel-widget.tsx) — is mounted by both layout descriptors (`pratibimba.omnipanel.shell` appears in both `DAILY_0_1_DESCRIPTOR.expectedWidgets` and `IDE_DEEP_DESCRIPTOR.expectedWidgets` per [`layout-types.ts:51-89`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts)). The same widget instance is alive across the cross-layout switch — Theia's view contribution lifecycle re-reveals it; it is not torn down.

This is what makes Pi continuous. Session-key, dispatch genealogy, chat scrollback, capability list — all live in the OmniPanel widget's React state + DI singletons, and they survive every transition because the widget itself survives.

---

## 2. Extension Invocation Model — How A User Opens A Surface

### 2.1 The five invocation paths

| # | Path | Trigger | Resolves to |
|---|---|---|---|
| 1 | **Activity-bar click** | User clicks an activity-bar icon in the left sidebar | Reveals the named left-sidebar widget; updates active activity-bar mode |
| 2 | **Editor area open via intent** | OmniPanel suggestion, command palette, or graph node click fires a `CrossLayoutIntent` | Layout materialises if needed; target command opens the editor widget |
| 3 | **Command palette** | `cmd-shift-P` → typed command name | Theia `CommandRegistry` lookup; capability-aware visibility |
| 4 | **Keybinding chord** | `cmd-period`, `cmd-shift-{0..5}`, `cmd-shift-O`, etc. | Direct command invocation (see §10) |
| 5 | **OmniPanel typed input** | User types in Pi Chat | Pi dispatch → Anima → subagent → tool stream surfaces in OmniPanel inline |

All five route through Theia's standard `CommandRegistry`. The single exception is the OmniPanel typed input (path 5) which routes through `KernelBridgeAPI.invokeCapability` ([`kernel-bridge-api.ts:242-251`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts)) with method `invokeGatewayRpc` and gatewayMethod `s4'.mediation.route`.

### 2.2 The CrossLayoutIntent envelope

The cross-layout dispatcher is the spine for paths 2 and 4. Envelope at [`pratibimba-layouts/src/common/cross-layout-intent.ts`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/common/cross-layout-intent.ts):

```ts
interface CrossLayoutIntent {
  coordinate: string | null;
  artifactUri: string | null;
  reviewId: string | null;
  dayNow: string | null;
  sessionKey: string | null;
  profileGeneration: number | null;
  privacyClass: IntentPrivacyClass | null;
  requestedLayout: 'daily-0-1' | 'ide-deep';
  requestedExtensionId: string | null;
  requestedContributionId: string | null;
  reason: string;
}
```

The dispatcher at [`cross-layout-intent-dispatcher.ts:98-138`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/cross-layout-intent-dispatcher.ts) runs four steps:

1. **Snapshot session state** into `PreservedLayoutState` (selected coordinate, session key, day-now context, profile generation, bridge subscription id).
2. **Materialise the layout** via `PratibimbaLayoutSwitcher.switchTo(intent.requestedLayout, preserved)` — no-op if already active.
3. **Update session-state** from intent fields (positive SET only — null fields don't clobber).
4. **Invoke the target command** derived from `intent.requestedExtensionId.requestedContributionId.open` (intra-process; no IPC).

Seven well-known intents are pre-registered as direct commands at [`cross-layout-intent-dispatcher.ts:28-57`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/cross-layout-intent-dispatcher.ts): `open-deep-ide`, `return-to-daily-layout`, `open-review-item`, `open-graph-node`, `open-canon-studio-file`, `start-journal-entry`, `deposit-review-evidence`.

**Architectural addition this document raises** — the seven well-knowns are M-extension-shell-shaped. Add three more for the Pi/OmniPanel surface:

- `open-omnipanel-tab` (target: omnipanel widget; tab id in intent.requestedContributionId)
- `open-dispatch-trace` (target: omnipanel; deep-link to specific dispatch id via `intent.reason`)
- `open-cosmic-side` / `open-personal-side` (intra-layout — sets editor area side in daily-0-1)

### 2.3 Capability-aware command visibility

Theia `CommandRegistry` honours `isEnabled` / `isVisible` predicates. The Pi dispatch surface MUST inspect `KernelBridgeAPI.connectionStatus.state` ([`kernel-bridge-api.ts:153-155`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts)) and grey out gateway-dependent commands when state ∈ {`disconnected`, `connecting`, `protocol_mismatch`, `private_blocked`, `pending_lut`}. This is the operationalisation of UI foundation principle 3 (provenance always visible).

Concrete pattern:

```ts
commands.registerCommand(DISPATCH_PI_COMMAND, {
  execute: (...) => piDispatcher.dispatch(...),
  isEnabled: () => kernelBridge.connectionStatus.connected,
  isVisible: () => kernelBridge.connectionStatus.state !== 'private_blocked'
});
```

### 2.4 Right-click context menus are coordinate-aware

Theia `MenuModelRegistry` accepts `when` clauses. Every editor-area widget that displays content rooted at a coordinate should publish its active coordinate to a `coordinate-context` key (via `PratibimbaSessionStateService.setSelectedCoordinate`). Context menus then conditionally surface:

- `Open in Bimba Graph Viewer` — when coordinate is set
- `Open in Canon Studio` — when artifactUri is set
- `Dispatch to Anima` — when connected
- `Deposit as Review Evidence` — when humanRequired === false on the active candidate

The context-key consumer is left to each Mn extension; the shell's role is to publish.

---

## 3. System Interrelation — How Systems Wire Across The Shell

### 3.1 The kernel-bridge as the live data spine

[`kernel-bridge/src/browser/kernel-bridge-api.ts:70-108`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts) defines the **single-source-of-truth view of the kernel bridge** — every downstream extension (M0..M5, integrated plugins, OmniPanel, ACR-as-OmniPanel) reaches the gateway through this DI binding, never directly. The contract is:

- One upstream WebSocket subscription per Theia process, regardless of layout
- One `KernelBridgeAPIImpl` instance bound as singleton at the frontend module
- Lite/full subscription mode is requested; the bridge upgrades to the *maximum* requested by any consumer and never opens a second upstream
- Capability allow-list at [`kernel-bridge-api.ts:245-249`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts) rejects non-allowlisted methods before any network round-trip; allowlist is `{readCurrentProfile, readPointerAnchor, readReadiness, subscribeObservability, invokeGatewayRpc, depositKernelObservation, requestReviewEvidence}` ([`types.ts:174-188`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts))

### 3.2 Profile-tick as global clock — concrete subscription pattern

Every widget that renders profile-derived data subscribes via:

```ts
this.unsubscribeProfile = kernelBridge.onProfile(profile => this.applyProfile(profile));
```

`KernelBridgeAPIImpl.onProfile` at [`kernel-bridge-api.ts:205-212`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts) replays the cached profile via `queueMicrotask(...)` so late subscribers (a widget opening mid-stream) see the current value without waiting for the next gateway advance. This is the *deterministic replay* foundation for §7 tick choreography and §11 pause/scrub affordances.

The cached profile carries `generation: number` ([`types.ts:81-89`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts)) — monotonically advancing per gateway emission. `profileGeneration` is the contract every component compares against to detect "I'm stale; re-render now". `MathemeHarmonicProfile` (the opaque payload at [`types.ts:88`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts)) carries all 20 sub-projections from `portal-core/src/kernel.rs` — this is the *content* the widgets render against; the generation is the *tick* that gates re-render.

### 3.3 OmniPanel as dispatch-genealogy renderer

The OmniPanel's Dispatch Trace and Tool Stream tabs render `RunTreeNode` and `ToolStreamEvent` ([`agentic-control-room/src/common/run-model.ts:55-73`](../../../../Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts)) — Pi → Anima → subagent invocation trees. The dispatcher writes events; the OmniPanel reads via the same DI singleton that the (deprecated standalone) ACR widget used:

```
PI typed input
  → omnipanel.chat.onSubmit
  → kernelBridge.invokeCapability({method: 'invokeGatewayRpc', gatewayMethod: 's4'.mediation.route', ...})
  → gateway → Anima → subagent
  → gateway streams `s4'.mediation.dispatch.run` events
  → kernelBridge.fireEvent(KernelBridgeRuntimeEvent {kind: 'observability', ...})
  → acrRuntimeService.applyToolStreamEvent(...)
  → OmniPanel <DispatchTraceTab> re-renders
```

Note: `kernelBridge.fireEvent` ([`kernel-bridge-api.ts:278-281`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts)) is the single entry point. Both the runtime source (live gateway WebSocket) and test fixtures drive through it — the OmniPanel cannot distinguish live from test, which is the right property.

### 3.4 The state persistence contract — what survives every transition

From [`session-state-service.ts:13-28`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/session-state-service.ts), augmented by what this architecture document raises:

| Field | Owner | Survives 0/1 toggle | Survives layout switch | Survives window reload |
|---|---|---|---|---|
| `selectedCoordinate` | PratibimbaSessionStateService | ✓ | ✓ | partial (status-bar restores last-known via preference) |
| `sessionKey` | PratibimbaSessionStateService | ✓ | ✓ | ✓ (gateway-side session is durable) |
| `dayNow` | PratibimbaSessionStateService | ✓ | ✓ | ✓ (re-derived from system clock) |
| `profileGeneration` | KernelBridgeAPIImpl + mirror in SessionStateService | ✓ | ✓ | partial (re-synced from gateway on reconnect) |
| `artifactUri` | PratibimbaSessionStateService | ✓ | ✓ | ✓ (Theia workspace restorer) |
| `pendingReviewIds` | PratibimbaSessionStateService | ✓ | ✓ | partial (re-queried from gateway) |
| `privacyClass` | PratibimbaSessionStateService | ✓ | ✓ | partial |
| **activeOmnipanelTab** | OmniPanelWidget React state | ✓ | ✓ | partial (Theia view restorer) |
| **activeActivityBarMode** | per-layout activity-bar contribution | ✓ | ✓ (where mode exists in both) | ✓ (Theia layout preference) |
| **active editor surface** | Theia ApplicationShell | ✓ | partial (only ide-deep multi-tab restoration) | ✓ (Theia layout restorer) |
| **kernel-bridge upstream subscription** | KernelBridgeRuntimeSource | ✓ | ✓ (process-scoped) | re-opens on reload |

The contract for `activeOmnipanelTab` and `activeActivityBarMode` is **DOC-AHEAD in cycle 3** — Tranche 15.7 names the typed `BimbaPratibimbaUiState` but the code currently does not include these two fields in `PratibimbaSessionState`. **Cycle-3 ledger action this document proposes (see §12):** extend `PratibimbaSessionState` to carry them so the OmniPanel reading them is single-source.

### 3.5 Cross-extension wiring — the seven hot paths

| Hot path | Producer | Consumer | Mechanism |
|---|---|---|---|
| Coordinate selection | Coordinate Tree / Bimba Graph / status bar | All Mn widgets, OmniPanel | `PratibimbaSessionStateService.setSelectedCoordinate` → `onChange` event |
| Profile advance | KernelBridgeAPIImpl (live gateway) | All Mn widgets, OmniPanel diagnostics tab, status bar | `onProfile` event |
| Connection state | KernelBridgeRuntimeSource → KernelBridgeAPIImpl | OmniPanel Gateway tab, status bar, capability-gated commands | `onConnectionChange` event |
| Day-now advance | (gateway-side world_clock stream) → `subscribeWorldClock` | Day Calendar (left sidebar in daily-0-1), status bar | `KernelBridgeStreamDelta` deltas |
| Dispatch genealogy | s4'.mediation.* gateway events → `subscribeObservability` | OmniPanel Dispatch Trace + Tool Stream | `KernelBridgeRuntimeEvent` of kind `observability` |
| Review landing | s5'.review.* gateway events | OmniPanel Review tab, status bar pending-count, `ide-deep` review pane | event subscription + `sessionStateService.pushReview` |
| Capability list | gateway `s4'.mediation.capabilities.list` | OmniPanel Gateway tab, command-palette gating | one-shot read at startup + invalidation on reconnect |

Every entry above already has substrate in cycle-2 landed code. None require greenfield. Cycle-3 work is **wiring**: extending `PratibimbaSessionStateService` to carry the two new fields, and adding the `'awareness'` event-kind discrimination for the `KernelBridgeRuntimeEvent` so observability does not become a magic-string blob.

---

## 4. OmniPanel Deep Specification

### 4.1 The reframe — agentic membrane, not control room

Per DR-M5-1 (consolidated DR-B-1) and Tranche 12.14, the standalone Agentic Control Room (`agentic-control-room/src/browser/run-flow-widget.tsx`, 247 LOC) does not survive cycle-3 as a standalone view contribution. Its substrate — `run-model.ts` (520 LOC), `acr-runtime-service.ts` (345 LOC), `parity.ts` (42 LOC) — **continues**, but its render surface moves into the OmniPanel as one or more tabs.

The OmniPanel widget at [`omnipanel-widget.tsx`](../../../../Body/M/epi-theia/extensions/omnipanel-shell/src/browser/omnipanel-widget.tsx) is already shaped to host this — the wholesale-ported `OmniPanel.tsx` React tree (966 LOC at [`components/OmniPanel.tsx`](../../../../Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/OmniPanel.tsx)) carries Chat, Sessions, Channels, Nodes, Models, Skills, Cron, Logs, Config, Settings, Instances, Debug. Cycle-3 work is to ADD `dispatch-trace`, `tool-stream`, `evidence`, `review`, `gateway`, `diagnostics` as additional tabs by binding the ACR-side React components into the existing tab-system at [`components/omni/layout/PrimaryTabs.tsx`](../../../../Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/omni/layout/PrimaryTabs.tsx).

### 4.2 The complete tab manifest after the reframe

| Tab id | Source | Available in | Carries |
|---|---|---|---|
| `chat` | existing — ChatPanel.tsx (592 LOC) | both layouts | Pi conversational surface; cmd-K typed input |
| `dispatch-trace` | from ACR `run-flow-widget` | both layouts | Pi → Anima → subagent invocation tree |
| `tool-stream` | from ACR `run-flow-widget` (different fold) | both layouts | time-ordered tool event list |
| `evidence` | from ACR evidence-pane / from ide-shell `EvidencePaneWidget` (208 LOC) | both layouts | `MediatedRunEvidencePacket` view |
| `review` | from ide-shell `ReviewPaneWidget` (174 LOC) — same React used inline | both layouts | review-gate landings; recursive-self-review fires inline (Tranche 12.4) |
| `gateway` | NEW — reads `KernelBridgeAPI.snapshot` + `s4'.mediation.capabilities.list` | both layouts | capability list + parity check + readiness |
| `diagnostics` | NEW — reads `KernelBridgeAPI.snapshot.readiness` + `MathemeHarmonicProfile` pending markers | both layouts | kernel-bridge state, profile-field pending markers, recent dispatch latency |
| `sessions` | existing — SessionsPanel.tsx | ide-deep only | session manager (start/resume/switch) |
| `channels` | existing — ChannelsPanel.tsx (383 LOC) | ide-deep only | gateway channel manager |
| `nodes` | existing — NodesPanel.tsx | ide-deep only | gateway node inspector |
| `models` | existing — ModelsPanel.tsx (468 LOC) | ide-deep only | model catalog |
| `skills` | existing — SkillsPanel.tsx | ide-deep only | skill registry |
| `cron` | existing — CronPanel.tsx | ide-deep only | scheduled task surface |
| `logs` | existing — LogsPanel.tsx | both layouts | log stream |
| `config` | existing — ConfigPanel.tsx (360 LOC) | ide-deep only | configuration editor |
| `settings` | existing — SettingsPanel.tsx | both layouts | user settings |
| `instances` | existing — InstancesPanel.tsx | ide-deep only | gateway instance manager |
| `debug` | existing — DebugPanel.tsx | ide-deep only | low-level diagnostics |
| **`operational-{cf, cfp, ct, cs, cp, cpf}`** | from Tranche 12.5 — six operational-capacity governance panes | ide-deep only | per the six reflective coordinates that hold the QL execution matrix per CLAUDE.md §III.D — c̲p̲f̲ / c̲t̲ / c̲p̲ / c̲f̲ / c̲f̲p̲ / c̲s̲ governance lenses |

The six operational-capacity panes ARE the Layer-3 reflective-coordinate execution matrix from the project's own onto-code (CLAUDE.md §III.D). Their rendering surface needs naming explicitly because Tranche 12.5 names them without anchoring them to the existing OmniPanel tab system. **Cycle-3 ledger action (see §12):** add these six tab ids to `OmniPanelTabId` ([`omnipanel-types.ts:27-40`](../../../../Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-types.ts)) with `availableInLayouts: ['ide-deep']`.

### 4.3 No modals — the review gate fires inline

UI foundation principle 5 (and explicit Tranche 15.2 text): "No modals." Review gates surface in the `review` tab. When the recursive-self-review protocol fires (Tranche 12.4), the OmniPanel autoswitches to the review tab via `OmniPanelController.focusTab('review')` rather than overlaying a modal. The `requires_human_resolution` guard at `epii-review-core/src/lib.rs:460-489` (S5 architecture, S5-1') means UX MUST show that gate but MUST NOT permit the agent path to bypass it; the inline review tab is the only surface where the human decision happens.

### 4.4 OmniPanel state lifecycle — what is alive across what

| OmniPanel concern | Lives in | Reset by |
|---|---|---|
| Active tab | OmniPanelWidget React state (or `sessionStateService.activeOmnipanelTab` after §3.4 extension) | nothing — survives layout switch |
| Chat scrollback | `omniState.chatHistory` (Zustand store in `domainStore.ts`) | session change OR explicit clear |
| Dispatch tree | ACR-runtime-service singleton | session change |
| Tool stream buffer | ACR-runtime-service singleton (capped 1000 events; FIFO eviction) | session change |
| Capability list | bound at first connection; invalidated on `connection.state === 'reconnecting'` | reconnect |
| Pending reviews | `sessionStateService.pendingReviewIds[]` | individual review resolved |
| Diagnostics snapshot | derived from `KernelBridgeAPI.snapshot` each render (not cached) | every render |

### 4.5 Pi monitoring of substrate

The Diagnostics tab is the Pi self-observation surface (per Tranche 15.2 OmniPanel-as-Pi-monitoring). It renders:

- **Dispatch latency** — rolling 60s p50/p95/p99 derived from `ToolStreamEvent.emittedAtMs` deltas
- **Slerp drift** — current K² orientation vs ideal `quat_slerp(RING_QUATERNION_LUT, t)` per [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §6](M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) — drift means the played-torus is rendering at non-tick cadence
- **Profile-field consumption per extension** — which fields each Mn extension reads (instrumented at `MExtensionContributionContract.currentStateSelectors` at [`m-extension-runtime/src/common/contribution-contracts.ts:30-34`](../../../../Body/M/epi-theia/extensions/m-extension-runtime/src/common/contribution-contracts.ts))
- **Readiness ledger live state** — from `KernelBridgeAPI.snapshot.readiness`, surfaced as a tree (source · mode · pending · stream-tables · cache counts)
- **Session continuity audit** — count of layout switches, count of upstream subscriptions opened (should be 1 always)

This is Pi watching itself. The Diagnostics tab is read-only — no input affordances. Diagnostics-driven action (open dispatch in trace, jump to review, etc.) routes through commands, not direct widget mutation.

---

## 5. Left Sidebar Deep Specification — Activity-Bar Discipline

### 5.1 Modes per layout

The left sidebar is Theia's `widget.application-shell-left` slot, activity-bar-switched. Per UI foundation principle 7, modes are not stacked — exactly one mode panel is visible at a time.

**`daily-0-1` modes** (three; minimal, day-anchored):

| Mode | Widget id | What it shows |
|---|---|---|
| Day Calendar | `pratibimba.daily.day-calendar` | navigation across `Idea/Empty/Present/{day_id}/` (DR-M4-1 path) — yesterday/today/tomorrow + day-jump |
| Journal Entries | `pratibimba.daily.journal-list` | scrollable list of today's journal entries (M4 substrate) |
| Personal Coordinate | `pratibimba.daily.personal-coordinate` | current `Q_personal` state (M4 surface) + bimba dial |

**`ide-deep` modes** (five; full operator instrumentation):

| Mode | Widget id | Source |
|---|---|---|
| Coordinate Tree | `pratibimba.ide-shell.coordinate-tree` | [`coordinate-tree-widget.tsx`](../../../../Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/coordinate-tree-widget.tsx) (130 LOC) — landed |
| Bimba Graph Viewer | `pratibimba.ide-shell.bimba-graph-viewer` | [`bimba-graph-viewer-widget.tsx`](../../../../Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bimba-graph-viewer-widget.tsx) (151 LOC) — landed |
| Canon Studio | `pratibimba.ide-shell.canon-studio` | [`canon-studio-widget.tsx`](../../../../Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/canon-studio-widget.tsx) (211 LOC) — landed |
| Backend Studio | NEW (DOC-AHEAD) | LSP contributions for rust-analyzer / clangd / pylsp navigating `epi-lib`, `portal-core`, S1–S5 cores |
| Smart Connections | `pratibimba.smart-connections-sidebar` | landed at Track 03 T4.5; consumes `s1'.semantic.*` |

The Backend Studio is the only doc-ahead item in this section. Tranche 11.x already names "Backend Studio" but the substrate is not landed — the actual LSP contributions for the four backend languages need a tranche-action (see §12).

### 5.2 Activity-bar consumption pattern

Each mode is a Theia `AbstractViewContribution` with `defaultWidgetOptions: { area: 'left' }`. The activity-bar icon is contributed via `@theia/core/lib/browser`'s standard activity-bar wiring. Layout-conditional visibility is enforced by:

```ts
@injectable()
export class DayCalendarContribution extends AbstractViewContribution<DayCalendarWidget> implements FrontendApplicationContribution {
    @inject(LAYOUT_SWITCHER) protected switcher: PratibimbaLayoutSwitcher;
    async onStart(): Promise<void> {
        this.switcher.onLayoutChange(change => {
            if (change.currentLayout === 'daily-0-1') {
                this.openView({ activate: false, reveal: true });
            } else {
                this.closeView();
            }
        });
    }
}
```

The pattern is: each left-sidebar mode contribution subscribes to `LayoutSwitcher.onLayoutChange` and self-reveals/hides per `descriptor.expectedWidgets`. The layout switcher does NOT directly mutate widgets — it fans out events; widgets self-reconcile.

### 5.3 Each mode subscribes to the active coordinate global state

Every left-sidebar widget that displays coordinate-rooted content reads `PratibimbaSessionStateService.state.selectedCoordinate` and subscribes to `onChange`. This is the UI foundation principle 1 (coordinate as primary navigation) in concrete code.

The Coordinate Tree widget at [`coordinate-tree-widget.tsx`](../../../../Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/coordinate-tree-widget.tsx) already does this — it both publishes (on user click) and consumes (on external update) via the session state service. The pattern is the contract for every other left-sidebar widget.

---

## 6. Editor Area Deep Specification — Composition Over Juxtaposition

### 6.1 The composition contract

UI foundation principle 6: integrated plugins compose three M-extensions into one editor surface, never three side-by-side. This is operationalised by the composition-coordinator + composition-pattern.md at [`integrated-composition/src/common/composition-coordinator.ts`](../../../../Body/M/epi-theia/extensions/integrated-composition/src/common/composition-coordinator.ts) + [`composition-pattern.md` (DOC-AHEAD landing per Tranche 15.4)].

The composition contract has three slots in the cosmic plugin and three slots in the personal plugin. Each slot accepts a `CompositionMountPoint` contribution from the corresponding Mn extension.

### 6.2 Cosmic 1-2-3 composition (the K² torus as substrate)

Per DR-M1-2 ratified + [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §2.6](M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md), the cosmic integrated plugin is a single K² torus 3D surface rendered by the `m1-paramasiva-played-torus` Bevy/wgpu extension. The torus IS the surface; the three M-poles compose **into it** rather than alongside it:

| Pole | Composition into K² | Substrate |
|---|---|---|
| M1 | The played K² geometry itself + the dual quaternion ring + Hopf bundle | `m1.h:551-564` ring, `hopf.rs` projection |
| M2 | The cymatic frequencies render on the K² surface as iso-curves of `audio_octet[8]` and `nodal_quartet[4]` | M2-cymatic engine reads `MathemeHarmonicProfile.audio_octet` |
| M3 | The 64-codon array lights cells on the K² lens-ring per Cl(4,2) codon-rotation | M3 codon LUT + Cl(4,2) rotation |

There is no horizontal split. There is no "M1 widget next to M2 widget next to M3 widget." There is one K² torus with three layered renderings driven by one slerp. The slerp is the load-bearing primitive per [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §6](M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md).

### 6.3 Personal 4-5-0 composition (the dipyramid + Hopf-linked tori)

Per DR-IG-6, the personal integrated plugin is a single dipyramid-with-Hopf-linked-tori 3D surface (M4 psychoid renderer). The three poles compose:

| Pole | Composition into the dipyramid | Substrate |
|---|---|---|
| M4 | The dipyramid geometry itself + the personal cymatic field + Q_personal recognition | M4 psychoid renderer |
| M5 | The Logos Atelier composes inside the dipyramid (review state + atelier deposits render as inhabitants of the geometry) | M5 epii surface |
| M0 | The bimba-implicate ground anchors the surface (M0 reader content surfaces as the substrate texture) | M0 anuttara reader |

The personal side is the mirror of the cosmic side: same composition discipline, different geometry, different pole triad (4-5-0 vs 1-2-3). The lemniscate transition between them (§7.4) folds one into the other.

### 6.4 Composition-mount-point API

The composition-coordinator pattern is:

```ts
interface CompositionMountPoint {
  readonly slot: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm0';
  readonly mountInto: (host: CompositionHost) => MountedContribution;
}

interface CompositionHost {
  readonly geometry: 'k2-torus' | 'dipyramid-hopf-linked';
  readonly profileTick: ProfileTickStream;
  readonly readinessLedger: ReadinessLedgerView;
  readonly inject: <T>(into: GeometrySlot, contribution: T) => void;
}
```

Each Mn extension registers exactly one `CompositionMountPoint` per integrated plugin (per [`integrated-composition/src/common/composition-coordinator.ts`](../../../../Body/M/epi-theia/extensions/integrated-composition/src/common/composition-coordinator.ts) substrate). The plugin host orchestrates the geometric merge; the mount-point contributes its layer.

**The contract enforcement** — at composition load, the host audits that no contribution attempts `host.shell.addWidget(myWidget, 'main')`. Side-by-side widget contributions are rejected, per Tranche 15.4 verification line. This is the operationalisation of composition-over-juxtaposition.

### 6.5 ide-deep single-pole editor

In `ide-deep`, only one pole is active at a time. The editor area renders the Mn extension's own widget:

| Mn | Widget | LOC (landed) |
|---|---|---|
| m0-anuttara | reader surface — anuttara source navigator | (in `extensions/m0-anuttara/`) |
| m1-paramasiva | instrument + 3D played-torus (DR-M1-2 substrate; build pending per Tranche 15.8 verification) | TBD when `m1-paramasiva-played-torus/` populates |
| m2-parashakti | cymatic engine | (in `extensions/m2-parashakti/`) |
| m3-mahamaya | codon wheel | (in `extensions/m3-mahamaya/`) |
| m4-nara | journal + identity surface | (in `extensions/m4-nara/`) |
| m5-epii | agentic IDE surface | (in `extensions/m5-epii/`) |

The pole switch is `cmd-shift-{0..5}`. The currently active pole is published to `sessionStateService` as `selectedCoordinate` (the Mn coordinate the pole anchors to).

---

## 7. Profile-Tick Render Discipline

### 7.1 The tick IS the global clock (operational)

Per UI foundation principle 2, `MathemeHarmonicProfile` tick advance is the UI clock. Concrete subscription via `KernelBridgeAPI.onProfile`:

```ts
@postConstruct() init() {
  this.unsubscribe = this.kernelBridge.onProfile(profile => {
    if (profile.generation > this.lastSeenGeneration) {
      this.lastSeenGeneration = profile.generation;
      this.applyTick(profile.profile);
    }
  });
}
```

This is the **only** valid clock source. **Forbidden pattern** (UI foundation principle 11 / §11): `setInterval(...)` or `requestAnimationFrame` driving a local tick that does not derive from `profile.generation`. Local timers create slerp drift; the Diagnostics tab surfaces drift (§4.5) which means any extension that violates this is detectable at runtime.

### 7.2 Re-render cadence layers

Not every widget re-renders on every tick. Four cadence layers:

| Layer | Trigger | Examples |
|---|---|---|
| **Every-frame (60Hz)** | requestAnimationFrame within a single tick window | K² torus mesh transform interpolation (the slerp tween between ticks 4 and 5) |
| **Tick-quantised (12Hz)** | `onProfile` fire | Ananda matrix luminous-cell jump; DR streamline advance; cymatic frequency packet swap |
| **Boundary-quantised** | `tick % 6 === 0` (Spanda stage boundary) | Cl(4,2) signature recolour; Hopf-fibre flag flip at tick 5→6 |
| **Lens-anchored** | active coordinate change OR layout change | Coordinate Tree highlight; Bimba Graph viewer focus |

The four layers map onto the four-fold tick choreography from [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §6](M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md). Every widget declares its cadence layer in its contribution metadata; the host enforces (a widget claiming "every-frame" but only producing tick-quantised updates is a bug).

### 7.3 Pause + scrub-to-tick affordances

The OmniPanel Diagnostics tab includes a tick-control panel:

- **Pause** — sends `kernelBridge.requestSubscriptionMode('lite')` AND sets a local pause flag that suppresses `onProfile` fan-out (cached profile is still served; subsequent advances are queued)
- **Resume** — releases the pause flag; queued advances replay in order
- **Scrub to tick N** — requests historical profile via `kernelBridge.invokeCapability({method: 'readCurrentProfile', params: {generation: N}})` — gateway must serve from its profile-history buffer (Cycle-3 ledger action: confirm this capability surface exists on the gateway side)
- **Step (one tick)** — pause + advance one tick + pause again

This is the operational expression of "the system is alive whether you touch it or not" — you can also *stop* it being alive for inspection.

### 7.4 quat_slerp as load-bearing tick primitive (cosmic composition)

The K² orientation across `RING_QUATERNION_LUT[12]` ([`m1.h:551-564`](../../../../Body/S/S0/epi-lib/include/m1.h)) is interpolated via `quat_slerp`. Per [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §6](M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md), this is the *single* animation primitive that carries the tick. All other surface motion (luminous Ananda cell, DR streamline, Cl(4,2) halo, Hopf shadow, audio_octet emitters, nodal_quartet satellites) derives from it.

The operational discipline: the K² extension owns the slerp; every other M-extension that contributes to the cosmic composition reads `host.profileTick.currentSlerpFraction()` rather than running its own time accumulation. Diagnostics surfaces the slerp drift between consumers — any consumer whose effective time-fraction diverges from the host's is logged.

---

## 8. Tab Management & View Options — The Obsidian-Stacked-Tabs Question

### 8.1 The question

When the user opens multiple `ide-deep` Mn surfaces (e.g., m0 reader AND m2 cymatic engine AND m4 journal), how do they arrange?

### 8.2 Three options

**Option A — Theia horizontal tabs (default):** New widgets open as tabs in the main area; only one visible at a time. Pros: standard, low memory. Cons: information-dense Mn views are difficult to compare; switching costs.

**Option B — Obsidian-style stacked tabs:** Multiple widgets visible as stacked panes (vertical accordion). Pros: comparison-friendly; matches Mn information density. Cons: requires custom contribution; per-widget visible height shrinks.

**Option C — Theia split-view tiling:** User drags tabs into split panes (Theia native). Pros: full user control. Cons: discoverability; per-pane size discipline needed.

### 8.3 Recommendation

**All three, user-preference selectable. Default to Option C (Theia split-view) with Option B (Obsidian-style stacked) as an explicit "Stack Mode" preference.**

Concrete rationale:

- **Option A alone is wrong for ide-deep.** Each Mn view is information-dense (codon wheel + cymatic engine + journal each carry distinct visual + textual state). Tab-switching between them loses comparative context.
- **Option B (stacked) matches Obsidian's working ergonomic** — operators familiar with vault work expect this and it is the natural mode for comparing M-domain content.
- **Option C (split-view) is Theia native** and consumes the existing platform. No greenfield.
- **The hybrid** — default to C; offer B as a named "Stack Mode" preference at the Pratibimba menu. The status-bar "layout: ide-deep" element gets a context-menu entry "Switch to Stack Mode / Switch to Split Mode."

The implementation path:

1. Cycle-3: ship with Theia split-view default (option C). This is zero-code.
2. **Cycle-3 ledger action (DOC-AHEAD landing):** add `pratibimba.layout.ide-deep.tabMode` preference (`split | stacked`) per [`layout-types.ts:42`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts) pattern.
3. **Subsequent cycle:** implement Obsidian-style stacked-tab contribution via Theia's `DockPanel` rendering customization OR via wrapping multiple widgets in a parent "Stack" widget that materialises vertical accordion sub-panes. This is Option B's first-build — not greenfield Theia, but an additive widget pattern.

### 8.4 Tab switching affordances

| Affordance | Behaviour |
|---|---|
| `cmd-K` / `cmd-P` | Theia quick-open palette for switching between open editor widgets |
| `cmd-1..9` | Switch to tab N in the active split |
| `cmd-shift-arrow-left/right` | Switch active split |
| Tab right-click | "Stack with this tab" / "Split right" / "Split down" (Stack Mode mutation) |

---

## 9. Status Bar Specification

### 9.1 The six entries

Per Tranche 15.10 exactly six status-bar entries. No more. Each is a `StatusBarContribution`:

| Entry | Source | Click target |
|---|---|---|
| **profile-tick state** | `kernelBridge.cachedProfile.generation` + stale flag | open Diagnostics tab in OmniPanel |
| **day-now anchor** | `sessionStateService.dayNow` (DR-M4-1 path `Idea/Empty/Present/{day_id}/`) | open Day Calendar in left sidebar (or summon `daily-0-1` if in ide-deep) |
| **session id** | `sessionStateService.sessionKey` | open Sessions tab in OmniPanel |
| **gateway readiness** | `kernelBridge.connectionStatus.state` | open Gateway tab in OmniPanel |
| **profile generation** | `kernelBridge.cachedProfile.generation` | open Diagnostics tab (same target as profile-tick state but different click affordance) |
| **active coordinate** | `sessionStateService.selectedCoordinate` | open Bimba Graph viewer (or summon `ide-deep`) |

Plus the layout-indicator at [`layout-status-bar.ts:50-72`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-status-bar.ts) which is the seventh and is a layout primitive — not content. It is the cross-layout toggle, not a content readout.

### 9.2 No widget owns the day-now / session anchor

UI foundation principle 9. The day-now is published by the status bar and read by widgets via `sessionStateService.dayNow`. Widgets must not have their own day-now controls. The status bar Day Calendar entry is the single navigation surface. This is the inversion of the "every widget has its own date picker" antipattern.

### 9.3 Click-through routing

Every status-bar click routes through the cross-layout intent dispatcher (§2.2). E.g., clicking the active-coordinate entry while in `daily-0-1` fires:

```ts
intent.dispatch({
  ...
  coordinate: sessionStateService.selectedCoordinate,
  requestedLayout: 'ide-deep',
  requestedExtensionId: 'm0-anuttara',
  requestedContributionId: 'graph',
  reason: 'status-bar-click: active-coordinate'
})
```

This means **the status bar is itself a coordinate-aware navigation surface**, not just a readout. Click-targets are coordinate-rooted.

---

## 10. Accessibility + Keybinding System

### 10.1 The full keybinding spine

| Chord | Action | Layer |
|---|---|---|
| `cmd-period` | 0/1 toggle (intra-layout: cosmic↔personal in daily-0-1; pole-dual swap in ide-deep) | shell |
| `cmd-shift-/` | Cross-layout toggle (daily-0-1 ↔ ide-deep) | shell |
| `cmd-shift-0` | Open m0-anuttara in ide-deep (summons ide-deep if in daily-0-1) | M-pole |
| `cmd-shift-1` | Open m1-paramasiva in ide-deep | M-pole |
| `cmd-shift-2` | Open m2-parashakti in ide-deep | M-pole |
| `cmd-shift-3` | Open m3-mahamaya in ide-deep | M-pole |
| `cmd-shift-4` | Open m4-nara in ide-deep | M-pole |
| `cmd-shift-5` | Open m5-epii in ide-deep | M-pole |
| `cmd-shift-O` | OmniPanel toggle (does not affect layout) | shell |
| `cmd-shift-G` | Bimba Graph Viewer toggle (left sidebar in ide-deep; summons ide-deep if daily-0-1) | left-sidebar |
| `cmd-shift-C` | Canon Studio toggle (left sidebar in ide-deep) | left-sidebar |
| `cmd-shift-T` | Coordinate Tree toggle (left sidebar) | left-sidebar |
| `cmd-shift-J` | Journal entry start (left-sidebar in daily-0-1) | M4 |
| `cmd-shift-P` | Command palette (Theia default) | platform |
| `cmd-K` | Quick-open tab/widget switcher | platform |
| `cmd-,` | Open Settings tab in OmniPanel | OmniPanel |
| `spacebar` (over a tick-animated widget) | Pause/resume tick | tick-control |
| `arrow-left/right` (over a tick-animated widget when paused) | Scrub one tick back/forward | tick-control |
| `shift-arrow-left/right` | Scrub one half-cycle (6 ticks) | tick-control |
| `escape` | Close active modal-equivalent (e.g., the inline review-gate prompt; never actual modals — the gate just collapses) | platform |

### 10.2 Theia conventions consumed

Per UI foundation principle 8, we consume Theia's existing keybinding contribution system — `@theia/core/lib/browser/keybinding`. Each command above is registered with a `KeybindingContribution`. The chord system is Theia native — no parallel implementation.

### 10.3 Full keyboard navigation

All editor + left-sidebar widgets must be keyboard-traversable. The Tranche 15.12 visual-regression harness extension (the accessibility audit at `test/a11y/`) verifies coverage. The shell architecture does not add a parallel a11y layer.

---

## 11. Forbidden Patterns

The shell rejects, at code-review time, the following:

| Forbidden | Why | Detection |
|---|---|---|
| Local `setInterval` or `requestAnimationFrame` not derived from profile-tick | Creates slerp drift; loses determinism | Diagnostics tab surfaces drift; eslint rule on `setInterval` import in M-extension src |
| Modal review surfaces (`<Dialog>` with required choice) | Violates "no modals" — review must be inline | grep audit for `Dialog`, `Modal` in extension src |
| Side-by-side composition pretending to be one surface (three widget contributions to `main` from one plugin) | Violates composition-over-juxtaposition | composition-host audit at load time (Tranche 15.4 verification) |
| Competing widget shell outside Theia conventions (custom non-Theia toplevel window) | Violates UI foundation principle 8; breaks state contract | `import 'electron'.BrowserWindow` ban in extension src |
| Standalone Agentic Control Room view contribution | DR-M5-1 — ACR substrate lives in OmniPanel only | grep for `bindViewContribution(bind, AgenticControlRoomContribution)` — should not appear after Tranche 12.14 lands |
| Direct gateway WebSocket from any non-runtime-source code | Bypasses capability allow-list; opens duplicate subscriptions | grep for `new WebSocket(...)` in extension src outside `kernel-bridge-runtime-source.ts` |
| Forbidden private body fields in stream payloads | Privacy violation — `rawNaraBody`, `journalBody`, etc. | enforced at [`kernel-bridge-api.ts:42-54`](../../../../Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts) |
| Widget owning day-now date picker | Violates UI foundation principle 9 | grep for `<DatePicker>` outside `pratibimba.daily.day-calendar` |
| Per-widget clock LUT fork or local Cl(4,2) projection | Violates "one algebra at four scales" | code-review of any extension importing from `epi-lib`/`portal-core` — only via kernel-bridge profile fields |
| "Thousand panels" left sidebar (multiple modes stacked) | UI foundation principle 7 violation | activity-bar contribution audit — exactly one active widget per mode |

---

## 12. Cycle-3 Ledger Integration — Concrete Tranche Additions

### 12.1 Enrichment of Tranche 11 (theia-shell-surface-hosting)

The existing Tranche 11 names "left sidebar wiring" and "shell hosting" without operational depth. This document adds:

- **11.x.A — Backend Studio LSP contributions tranche (DOC-AHEAD landing).** Wire rust-analyzer / clangd / pylsp / typescript-language-server to navigate `epi-lib/`, `portal-core/`, S1–S5 cores. New extension `Body/M/epi-theia/extensions/backend-studio/` that registers `MonacoLanguageClientContribution` for each. Verification: `pnpm --filter @pratibimba/backend-studio test` asserts symbol-resolution on a synthetic `m1.h` file.
- **11.x.B — Cross-layout intent envelope extension (spec-ahead-integration).** Add `open-omnipanel-tab`, `open-dispatch-trace`, `open-cosmic-side`, `open-personal-side` to `WELL_KNOWN_INTENT_KINDS` at [`cross-layout-intent.ts`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/common/cross-layout-intent.ts). Verification: dispatcher test asserts each well-known fires the correct target command.
- **11.x.C — Stack-mode preference (DOC-AHEAD landing).** Add `pratibimba.layout.ide-deep.tabMode: 'split' | 'stacked'` preference. Cycle-3 ships `split` only; subsequent cycle implements stacked rendering.

### 12.2 Enrichment of Tranche 15 (UI design foundations)

- **15.7.A — Extend `PratibimbaSessionState` to carry `activeOmnipanelTab` and `activeActivityBarMode`.** Per §3.4 of this document. Current substrate at [`session-state-service.ts:13-28`](../../../../Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/session-state-service.ts) does not include them; the typed `BimbaPratibimbaUiState` Tranche 15.7 names is not landed in code.
- **15.2.A — Six operational-capacity OmniPanel tabs (cfp/ct/cp/cf/cfp/cs).** Add to `OmniPanelTabId` at [`omnipanel-types.ts:27-40`](../../../../Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-types.ts) with `availableInLayouts: ['ide-deep']`. The six reflective coordinates from CLAUDE.md §III.D are the Layer-3 execution matrix; surfacing them in OmniPanel makes the QL `()` operator visible.
- **15.2.B — Diagnostics tab spec.** Per §4.5 of this document — dispatch latency / slerp drift / per-extension profile-field consumption / readiness ledger / session-continuity audit. New panel component `components/omni/panels/DiagnosticsPanel.tsx`.

### 12.3 New tranches this design surfaces

- **NEW Tranche — "Tick-control affordances" (DOC-AHEAD landing).** Per §7.3 — pause/resume/scrub-to-tick/step controls in the Diagnostics tab; gateway-side profile-history capability surface confirmation.
- **NEW Tranche — "Forbidden-pattern audit suite" (spec-ahead-integration).** Per §11 — eslint rules + grep audits + load-time composition-host audits for each forbidden pattern. Lands in `acceptance-harness/tests/forbidden-patterns.test.mjs`.
- **NEW Tranche — "Status-bar coordinate-aware click-through" (no-orphan-fill).** Per §9.3 — wire each of the six status-bar entries to fire `CrossLayoutIntent` rather than just opening a static widget.

### 12.4 New decisions (DR-*) this design raises

- **DR-TS-2 — Stack-mode vs split-mode default for `ide-deep`.** This document recommends `split` as default with `stacked` as preference. User final-validation needed on the default.
- **DR-TS-3 — `cmd-period` in `ide-deep` semantics.** This document recommends "swap active Mn pole to its dual" (m1↔m4, m2↔m5, m3↔m0). Alternative: "no-op outside daily-0-1." User final-validation needed.
- **DR-TS-4 — Six operational-capacity OmniPanel tabs naming canon.** Should they be named by reflective coordinate (`cf`, `cp`, etc.) or by capacity (`governance-frame`, `governance-position`, etc.)? User final-validation needed.
- **DR-TS-5 — Diagnostics tab privacy class.** The diagnostics tab carries dispatch-latency data that could be private-identity-correlated. Surface privacy class — `safe-public` or `protected-with-session-correlation`? User final-validation needed.
- **DR-TS-6 — Tick-pause/scrub policy.** Should pause be permitted always, or gated on `connectionStatus.connected === true` (so pausing doesn't mask the connection state)? Recommendation: always permitted; the Diagnostics tab surfaces both state. User final-validation needed.

---

## 13. Closing Frame

The Theia shell is not a UI for Epi-Logos; it is M' enacted. Every operational invariant — coordinate-as-navigation, profile-tick-as-clock, provenance-always-visible, OmniPanel-as-`/`, composition-over-juxtaposition, activity-bar-discipline, Theia-conventions, day-now-ambient, bimba/pratibimba-as-dial — is *already* substrated in cycle-2 landed code. Cycle 3's work is **wiring discipline** and **operational depth**: the six new OmniPanel tabs, the persistence-state extension, the Backend Studio LSP, the stack-mode preference, the diagnostics surface, the forbidden-pattern audit, the status-bar click-through.

What this document does that the prior tranche specs did not: it names the actual paths from keystroke to render, the persistence guarantees that survive every transition, the antipatterns to detect, the decisions still to ratify. The shell is alive whether you touch it or not — the profile-tick proves it. The right-sidebar `/` is Pi's continuous voice — the OmniPanel widget survives every layout transition. The left sidebar is the Bimba canonical face — activity-bar-switched, never stacked. The editor area is the composition surface — three poles into one geometry, never three side-by-side.

The shell is the M' operational system, and it is already largely landed. Cycle 3 closes the operational depth that lets it run as designed.
