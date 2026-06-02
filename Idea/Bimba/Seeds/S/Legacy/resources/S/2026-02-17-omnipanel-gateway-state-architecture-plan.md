# OmniPanel Gateway State Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate perceived lag and unreliable save/edit behavior in OmniPanel gateway settings/config/chat by clarifying state ownership bottom-up and enforcing domain-driven mutation lifecycles.

**Architecture:** Refactor OmniPanel from broad store subscription + panel-triggered side effects into domain-first slices with selector-based subscriptions, explicit command/mutation state machines, and cache-aware data loaders. Preserve decoupled business logic in controllers/services so UI shells remain replaceable.

**Tech Stack:** Electron, React 18, TypeScript, Zustand, Vitest, Playwright.

---

## Scope and Success Criteria

1. Chat input remains responsive during typing and panel switches.
2. Switching tabs/panel states no longer reloads history/config unnecessarily.
3. Editable settings/config fields are deterministic (no blur-loss, no hidden resets).
4. Save/apply/update operations show explicit lifecycle and trustworthy outcome.
5. State ownership is explicit: `server snapshot`, `draft`, `mutation status`, `derived view`.
6. Domain logic stays UI-agnostic and test-first.

---

### Task 1: Establish Baseline Performance + Behavior Evidence

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/omnipanel-performance-baseline.test.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-gateway.spec.ts`
- Create: `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-17-omnipanel-baseline-observations.md`

**Step 1: Add render-count instrumentation test for OmniPanel chat typing**
- Assert typing 20 chars into chat composer does not re-render unrelated panels/components beyond threshold.

**Step 2: Add e2e case for panel switching without redundant chat/config reload**
- Capture request/event counts while toggling `chat -> settings -> chat -> channels -> chat`.

**Step 3: Record current baseline metrics**
- Include render counts, `chat.history` call counts, and perceived input latency observations.

**Step 4: Run tests to verify baseline captures current regressions**
- Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System && pnpm vitest src/tests/omni/omnipanel-performance-baseline.test.tsx -r verbose`
- Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System && pnpm playwright test src/tests/e2e/omnipanel-gateway.spec.ts --grep "reload|switch|chat"`

---

### Task 2: Split and Normalize Gateway Store by Domain Slices

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayStore.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewaySelectors.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayTypes.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/settings-store.test.ts`

**Step 1: Introduce explicit state sections**
- `connection`, `ui`, `chatDomain`, `configDomain`, `channelsDomain`, `mutationStatus`.

**Step 2: Separate `server snapshot` and `draft` models**
- For config/settings fields, stop overloading single values for both persisted and draft semantics.

**Step 3: Add selector module**
- Export fine-grained selectors (and shallow-composed selectors where needed) for each panel.

**Step 4: Keep actions colocated per slice**
- Scope actions so each domain slice mutates only its own slice + explicit cross-domain coordination events.

**Step 5: Run store unit tests**
- Add assertions that unrelated selectors do not change when chat draft mutates.

---

### Task 3: Convert OmniPanel to Selector-Based Subscription (No Broad Destructure)

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/ChatPanel.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/layout-shell.test.tsx`

**Step 1: Replace `const { ... } = useEpiClawGatewayStore()` with selector subscriptions**
- Subscribe per panel concern only.

**Step 2: Memoize handler props passed to panel components**
- Avoid recreating closures for every keystroke.

**Step 3: Keep chat draft local while typing**
- Commit to store only at explicit boundaries (`send`, `blur`, `panel exit`) or throttled with minimal scope.

**Step 4: Verify reduced re-render blast radius**
- Update tests to assert that chat input updates do not force full `OmniPanel` tree churn.

---

### Task 4: Replace Implicit Panel Effect Reloads with Loader Policy

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/domain/panelDataLoaderPolicy.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/overview-sessions.test.tsx`

**Step 1: Remove monolithic `useEffect` switch-based loading**
- Replace with `ensureLoaded(panel, freshnessPolicy)` calls.

**Step 2: Add freshness timestamps per resource**
- Example: `chatHistoryLoadedAt`, `channelsLoadedAt`, `configLoadedAt`.

**Step 3: Add explicit invalidation triggers**
- Save/apply/update success invalidates only impacted resources.

**Step 4: Add lifecycle rules**
- `enter panel` loads only if stale/missing, not on every switch.

**Step 5: Verify no redundant loads in panel switch tests**
- Ensure `chat.history` is not called repeatedly on quick return when cache is fresh.

---

### Task 5: Add Mutation State Machine for Save/Apply/Update/Connect

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/controllers/epi-claw/controllers.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayStore.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/domain/mutationStateMachine.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/config-panel.test.tsx`

**Step 1: Replace booleans with finite status enum per operation**
- `idle | validating | pending | success | error | conflict`.

**Step 2: Track operation metadata**
- `startedAt`, `finishedAt`, `requestId`, `errorCode`, `errorMessage`, `ackVersion/hash`.

**Step 3: Wire status transitions through controllers**
- Actions must validate current state transition legality.

**Step 4: Add structured result object returns**
- `saveConfig`/`applyConfig` return typed results, not side effects only.

**Step 5: Add tests for impossible-state prevention**
- Example: cannot transition `idle -> success` without `pending`.

---

### Task 6: Make Config + Channel Editing Deterministic and Durable

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ConfigPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ChannelsPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/domain/configPanelDomain.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/config-panel.test.tsx`

**Step 1: Remove uncontrolled `defaultValue` usage in JSON entry editors**
- Convert to controlled state with explicit parse/validation feedback.

**Step 2: Replace blur-only commit for channel drafts**
- Add explicit `Apply Draft` + `Revert Draft` actions and dirty marker.

**Step 3: Add draft conflict handling**
- If server snapshot changes while editing, surface conflict state and offer merge/reload.

**Step 4: Standardize validation output model**
- Field-level issues, section-level issues, and blocking/non-blocking classification.

**Step 5: Extend tests**
- Verify edits survive panel switch, refresh, and failed save.

---

### Task 7: Centralize Settings Surface with Registry-Driven Ownership

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/domain/settingsRegistry.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SettingsPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/OverviewPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`

**Step 1: Define canonical setting metadata**
- `key`, `ownerDomain`, `storageTarget`, `validator`, `default`, `uiGroup`.

**Step 2: Keep one writable canonical settings surface**
- Overview becomes summary/quick actions, not duplicate full editor.

**Step 3: Introduce harmonized save semantics**
- Same lifecycle/feedback pattern as config.

**Step 4: Add migration for persisted local settings shape**
- Preserve backward compatibility with existing persisted keys.

---

### Task 8: Chat Responsiveness + Session Workflow Clarification

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/ChatPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/stores/epiClawGatewayStore.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/controllers/epi-claw/controllers.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/chat-panel.test.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/omni/chat-controller.test.ts`

**Step 1: Separate `chatInputDraft` from session/history state**
- No history reload coupling to draft edits.

**Step 2: Make session key editing explicit**
- Optional “Apply Session Key” action instead of immediate destructive reset on every keystroke.

**Step 3: Preserve local composer state across non-destructive panel switches**
- Avoid reinitializing draft unless session actually changes.

**Step 4: Validate send queue + history refresh strategy**
- Only refresh history on terminal run events, not tab navigation.

---

### Task 9: Verification + Discharge

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-gateway.spec.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-settings-config-flow.spec.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md`
- Create: `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-17-omnipanel-state-architecture-discharge.md`

**Step 1: Add end-to-end functional flows**
- `edit -> validate -> save/apply -> reload -> persisted`.

**Step 2: Add responsiveness assertions**
- Typing remains responsive while heavy panels/state updates happen in background.

**Step 3: Confirm no redundant request loops**
- Panel switch should not trigger fresh history/config loads if policy marks data fresh.

**Step 4: Publish discharge evidence**
- Remaining risks, unresolved deltas, and next bounded slice.

---

## Recommended Execution Order

1. Task 1 (baseline evidence)
2. Task 2 + Task 3 (state topology + selector subscription)
3. Task 4 + Task 8 (panel load policy + chat responsiveness)
4. Task 5 + Task 6 (mutation lifecycle + deterministic editing)
5. Task 7 (settings centralization)
6. Task 9 (verification + discharge)

---

## Key Risks and Mitigations

1. **Risk:** Regressions while splitting store shape.
- **Mitigation:** Keep adapter selectors backward-compatible during migration window.
2. **Risk:** Hidden coupling between panel effect loading and business logic.
- **Mitigation:** Introduce loader policy layer before removing existing effect paths.
3. **Risk:** Persistence schema breakage.
- **Mitigation:** Add explicit migration/merge function tests for persisted state versions.

---

## Source Notes (Primary References)

1. React controlled input rules and caveats: [react.dev input docs](https://react.dev/reference/react-dom/components/input)
2. React deferred rendering for typing responsiveness: [react.dev useDeferredValue](https://react.dev/reference/react/useDeferredValue)
3. Zustand selector-based rerender control: [Zustand useShallow guide](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
4. Zustand modular store composition: [Zustand slices pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern)
5. State-machine-oriented async status modeling: [Redux Style Guide](https://redux.js.org/style-guide/)
6. Mutation lifecycle semantics: [TanStack Query mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)

