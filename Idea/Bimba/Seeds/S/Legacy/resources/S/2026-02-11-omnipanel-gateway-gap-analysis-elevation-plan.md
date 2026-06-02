# OmniPanel Gateway Gap Analysis + Elevation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reach functional 1:1 parity between Electron OmniPanel and OpenClaw/Epi-Claw gateway UI, while upgrading OmniPanel visuals toward the Discause-style system shown in `/Users/admin/pencil-new.pen`.

**Architecture:** Keep `OmniPanel.tsx` as host shell, but move chat/settings/config behavior into parity-faithful modules adapted from `Idea/epi-claw/ui/src/ui/*`. Preserve Electron IPC/S4 bridge ownership in main process, but make renderer behavior contract-compatible with gateway UI state machine and event handling.

**Tech Stack:** Electron, React 18, TypeScript, Zustand, Tailwind + CSS variables, Vitest, Playwright.

---

## Gap Analysis (Current Code vs Gateway UI)

### 1) Chat runtime parity is incomplete (high risk)
- Electron chat sends then immediately reloads history (`OmniPanel.tsx:370-371`), creating race/flicker risk versus stream lifecycle.
- Electron chat lacks queue/flush behavior used by gateway UI (`ui/src/ui/app-chat.ts:71-151`).
- Gateway supports stop/new-session command flow (`ui/src/ui/app-chat.ts:33-55`, `ui/src/ui/app-render.ts:482`), Electron exposes only direct abort/history controls (`ChatPanel.tsx:203-206`).
- Gateway chat supports focus mode, queue UI, compaction indicator, resizable sidebar split (`ui/src/ui/views/chat.ts:31,45,50,261,333,399-402`), Electron chat does not.

### 2) “Settings” parity is split and currently under-ported (high risk)
- Electron `SettingsPanel` is connection-only (`SettingsPanel.tsx:15-58`).
- Gateway settings surface includes persisted UI behavior (`ui/src/ui/storage.ts:11-14,30-33,62-75`) plus richer overview auth/insecure-context guidance (`ui/src/ui/views/overview.ts:31-116,126-164`).
- Electron persists only gateway URL/token + session key (`epiClawGatewayStore.ts:757-772`), missing focus/theme/nav/split settings parity.

### 3) Config editor parity is shallow (high risk)
- Electron config is raw textarea + schema/version badges (`ConfigPanel.tsx:17-52`).
- Gateway config is schema-analyzed, sectioned, searchable form/raw dual-mode with diffs and guided metadata (`ui/src/ui/views/config.ts:3,19,22,23,386-705`).

### 4) Transport/handshake behavior drift (medium-high risk)
- Gateway web UI performs explicit `connect` handshake with challenge/device identity, seq gap tracking (`ui/src/ui/gateway.ts:199-263`).
- Electron renderer client uses `status.summary` to synthesize hello and sets `reconnect: false` (`renderer/controllers/epi-claw/gateway-client.ts:86,132-134`), with a narrow passthrough event set (`:46-53`).
- This mismatch likely explains brittle edge behavior under reconnect/auth/event-order pressure.

### 5) Verification depth is still too shallow for parity confidence (medium risk)
- Omni tests pass but mostly smoke/contract assertions (`tests/omni/parity-matrix.test.ts`, `tests/omni/advanced-panels.test.tsx`).
- E2E coverage validates shell navigation more than real chat/settings parity (`tests/e2e/omnipanel-gateway.spec.ts`).

### 6) Visual direction drift from your Pencil designs (medium risk)
- `/Users/admin/pencil-new.pen` frames (`C572l`, `wKqMI`, `mITpl`, `TQKa2`) establish a calm, low-chroma Discause system with explicit shells and consistent spacing.
- Current OmniPanel token system is glass/dark-first with JetBrains Mono global body font (`renderer/index.css`), not aligned with the shown Discause reference.

---

## Elevation Plan (Phased, Reversible)

### Task 1: Lock parity contract + baseline evidence
**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md`
- Create: `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-11-omnipanel-parity-baseline.md`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/parity-matrix.test.ts`

**Steps:**
1. Expand parity matrix beyond method names to behavioral clauses (queueing, stop/new session, config form mode, reconnect semantics).
2. Add explicit fail/pass baseline entries from current code state.
3. Add failing parity assertions for missing behaviors (not just RPC names).

### Task 2: Port chat orchestration parity (logic first, UI second)
**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/controllers/epi-claw/controllers.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayStore.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/ChatPanel.tsx`
- Add tests: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/chat-controller.test.ts`, `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/chat-panel.test.tsx`

**Steps:**
1. Add queue + busy gating + flush semantics equivalent to gateway (`app-chat.ts` behavior).
2. Remove immediate `loadChatHistory()` after `sendMessage()` in panel flow; rely on event/final lifecycle.
3. Implement stop/new-session action model and command normalization.
4. Add focus/split/compaction-capable chat state fields in store (even if initial UI toggles are minimal).
5. Extend tests to cover queue ordering, stop/new flow, run overlap, and stream/history race cases.

### Task 3: Unify settings surface and persistence model
**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayStore.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SettingsPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/OverviewPanel.tsx`

**Steps:**
1. Introduce a `uiSettings` slice mirroring gateway fields (theme, focus, showThinking, splitRatio, nav collapse groups).
2. Merge duplicate connection controls: keep them in one canonical place and keep the other as summary/shortcut.
3. Add URL bootstrap behavior parity (token/password/session/gatewayUrl hydration + cleanup) adapted for Electron deep-link paths.
4. Add auth-failure and insecure-context guidance parity text where relevant.

### Task 4: Port config UX parity (schema-guided form + raw mode)
**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/config/*`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ConfigPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/controllers/epi-claw/controllers.ts`
- Add tests: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/config-panel.test.tsx`

**Steps:**
1. Port/adapt gateway config form analyzer + section metadata + search behavior.
2. Keep raw mode, but enforce consistent dirty-state and change-diff semantics.
3. Add explicit save/apply/update button enablement rules to match gateway behavior.

### Task 5: Harden transport/connection parity
**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/controllers/epi-claw/gateway-client.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/main/epi-claw-client.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/main/s4-websocket-client.ts`
- Add tests: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/gateway-client-parity.test.ts`

**Steps:**
1. Define canonical handshake contract for Electron bridge (challenge/hello/event sequencing equivalent guarantees).
2. Add reconnect/backoff behavior and event-gap observability parity (or explicit documented deltas).
3. Expand event passthrough and subscription lifecycle resilience.

### Task 6: Visual elevation to Discause system from Pencil references
**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/index.css`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/**/*`

**Steps:**
1. Add a Discause token theme derived from `pencil-new.pen` frames (surface tiers, spacing rhythm, borders, typography).
2. Match layout primitives from Pencil references:
   - Chat shell (`C572l`): tabs, thread/main split, compose zone rhythm.
   - Gateway connection (`wKqMI`): dual-column access/snapshot cards.
   - Channels (`mITpl`) and Sessions (`TQKa2`): shell + right rail patterns.
3. Keep uniqueness by preserving OmniPanel context (host embedding/motion) while adopting Discause visual grammar.

### Task 7: Verification and discharge
**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-gateway.spec.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-chat-settings-parity.spec.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md`

**Steps:**
1. Add live-flow E2E: connect, chat send/stream/abort/new-session, queue behavior, settings persistence, config form edits.
2. Run unit + integration + e2e against both mocked and live gateway.
3. Publish discharge report with remaining deltas and explicit follow-ups.

---

## Execution Order Recommendation
1. Task 1 + Task 2 (chat parity first; this is the brittleness center).
2. Task 3 + Task 4 (settings/config parity).
3. Task 5 (transport hardening once behavior surface is aligned).
4. Task 6 (visual system pass mapped to Pencil).
5. Task 7 (final parity validation and discharge).

## Primary Risks
- Hidden coupling between S4 shared socket and gateway event semantics.
- UI-level parity work without transport parity will keep failures latent.
- Visual redesign before behavior parity can mask regressions and slow debugging.

## Definition of Done
1. Chat and settings/config behaviors match gateway UI intent and pass parity tests.
2. Transport layer has explicit handshake/reconnect/event-order guarantees.
3. OmniPanel visuals align with the Discause-style references in `/Users/admin/pencil-new.pen`.
4. E2E parity suite passes and checklist is updated with no unresolved critical deltas.
