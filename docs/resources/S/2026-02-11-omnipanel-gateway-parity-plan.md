# Electron OmniPanel Gateway Parity + Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver full OpenClaw gateway control parity in Electron OmniPanel with a mature navigation model, modernized panel UX, and strict domain/UI separation while preserving OmniPanel as the top-level parent.

**Architecture:** Keep `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx` as orchestration shell, extract panel/view modules under `components/omni/*`, and retain all gateway behavior in `epiClawGatewayStore.ts` + `controllers/epi-claw/*`. Replace icon-strip navigation with primary text tabs + full-mode advanced drawer. Execute panel-by-panel vertical slices with TDD and explicit RPC parity checklist.

**Tech Stack:** Electron, React 18, TypeScript, Zustand, TailwindCSS, Framer Motion, Playwright, Vitest + Testing Library (to be added for renderer unit/integration tests).

---

### Task 1: Establish Test Harness + Parity Checklist (Foundation)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/vitest.config.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/setup-vitest.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/parity-matrix.test.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/package.json`

**Step 1: Write the failing parity matrix test**

```ts
// /src/tests/omni/parity-matrix.test.ts
import { describe, it, expect } from 'vitest';
import { PANEL_RPC_PARITY } from '../../renderer/components/omni/contracts/panelRpcParity';

describe('panel rpc parity matrix', () => {
  it('declares all gateway panels and required rpc methods', () => {
    expect(PANEL_RPC_PARITY.chat.required).toContain('chat.send');
    expect(PANEL_RPC_PARITY.sessions.required).toContain('sessions.list');
    expect(PANEL_RPC_PARITY.channels.required).toContain('channels.status');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/parity-matrix.test.ts`
Expected: FAIL (`Cannot find module ...panelRpcParity`)

**Step 3: Add minimal test harness + matrix contract module**

- Add Vitest config + setup file.
- Add initial `panelRpcParity.ts` with all panel-to-RPC mappings.

**Step 4: Run tests to verify pass**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/parity-matrix.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/vitest.config.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/setup-vitest.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/parity-matrix.test.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/package.json
git commit -m "test: add omnipanel parity harness and rpc checklist"
```

### Task 2: OmniPanel Shell Refactor (Parent retained, icon strip removed)

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/layout/OmniPanelHeader.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/layout/PrimaryTabs.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/layout/AdvancedDrawer.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/contracts/panels.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/layout-shell.test.tsx`

**Step 1: Write failing shell navigation test**

```tsx
it('shows primary tabs in minimal mode and hides advanced panels', async () => {
  render(<OmniPanel state="minimal" onClose={() => {}} />);
  expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'Config' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/layout-shell.test.tsx`
Expected: FAIL (legacy icon-strip UI does not expose expected tab semantics)

**Step 3: Implement minimal shell extraction + primary-first IA**

- Keep `OmniPanel` as parent coordinator.
- Replace emoji strip with text primary tabs.
- Add advanced drawer for non-primary panels in fullscreen.

**Step 4: Re-run tests and type checks**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/layout-shell.test.tsx && npm run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/layout/OmniPanelHeader.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/layout/PrimaryTabs.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/layout/AdvancedDrawer.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/contracts/panels.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/layout-shell.test.tsx
git commit -m "feat: refactor omnipanel shell to primary-first navigation"
```

### Task 3: Chat Panel Parity + Redesign (highest priority)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/ChatPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/messageNormalizer.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/attachments.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/chat-panel.test.tsx`

**Step 1: Write failing chat parity tests**

```tsx
it('renders streaming assistant message and allows abort', async () => {
  // seed store with chatRunId + chatStream
  // assert stream visible and abort button enabled
});

it('supports queued messages and image attachments in composer', async () => {
  // assert attachments can be added/removed and queued badge appears
});
```

**Step 2: Run tests to verify fail**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/chat-panel.test.tsx`
Expected: FAIL

**Step 3: Implement minimal chat panel parity**

- Move chat UI into `ChatPanel` module.
- Port key UX behavior from legacy OpenClaw chat (stream, queue, stop/new session ergonomics, attachments).
- Keep RPC path through `epiClawGatewayStore` actions only.

**Step 4: Verify pass + no regressions**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/chat-panel.test.tsx && npm run typecheck && npm run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/ChatPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/messageNormalizer.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/chat/attachments.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/chat-panel.test.tsx
git commit -m "feat: port legacy chat parity into redesigned omnipanel chat"
```

### Task 4: Overview + Sessions parity slice

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/OverviewPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SessionsPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/overview-sessions.test.tsx`

**Step 1: Write failing tests for session filters/patch/delete and overview auth hints**

**Step 2: Run and confirm fail**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/overview-sessions.test.tsx`
Expected: FAIL

**Step 3: Implement minimal behavior-complete panel modules**

- Preserve session patch semantics and delete confirmation.
- Add mature cards/grid layout for overview metrics.

**Step 4: Verify pass**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/overview-sessions.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/OverviewPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SessionsPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/overview-sessions.test.tsx
git commit -m "feat: complete overview and sessions parity panels"
```

### Task 5: Channels parity slice

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ChannelsPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/channels-panel.test.tsx`

**Step 1: Write failing tests for refresh/probe, WhatsApp start/wait/logout, account rendering**

**Step 2: Run fail check**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/channels-panel.test.tsx`
Expected: FAIL

**Step 3: Implement channels panel parity**

- Display channel order/labels/accounts from snapshot.
- Keep channel controls in primary surface (not advanced).

**Step 4: Verify pass**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/channels-panel.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ChannelsPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/channels-panel.test.tsx
git commit -m "feat: complete channels parity in primary omnipanel"
```

### Task 6: Advanced drawer panel set A (Instances, Skills, Cron)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/InstancesPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SkillsPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/CronPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/advanced-a.test.tsx`

**Step 1: Write failing tests for list/refresh/mutations in all three panels**

**Step 2: Confirm fail**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/advanced-a.test.tsx`
Expected: FAIL

**Step 3: Implement minimal modules + hook into advanced drawer routes**

**Step 4: Verify pass + lint**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/advanced-a.test.tsx && npm run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/InstancesPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SkillsPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/CronPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/advanced-a.test.tsx
git commit -m "feat: add advanced drawer panels for instances skills cron"
```

### Task 7: Advanced drawer panel set B (Nodes, Config, Debug, Logs, Settings)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/NodesPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ConfigPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/DebugPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/LogsPanel.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SettingsPanel.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/advanced-b.test.tsx`

**Step 1: Write failing tests for each panel’s key actions and error states**

**Step 2: Confirm fail**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/advanced-b.test.tsx`
Expected: FAIL

**Step 3: Implement minimal behavior-complete modules**

- Include config hash conflict UX (`reload and retry`).
- Include logs cursor behavior + refresh limit.
- Keep connection settings in buried settings panel.

**Step 4: Verify pass**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/advanced-b.test.tsx && npm run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/NodesPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/ConfigPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/DebugPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/LogsPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/panels/SettingsPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/advanced-b.test.tsx
git commit -m "feat: complete advanced drawer panel parity set"
```

### Task 8: Theme-System Integration + shadcn-style UI layer

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/button.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/input.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/tabs.tsx`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/card.tsx`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/index.css`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/theme-integration.test.tsx`

**Step 1: Write failing theme token test**

```tsx
it('applies data-theme and data-accent driven styles to omni ui primitives', () => {
  // render button/input tabs and assert class usage/token var usage
});
```

**Step 2: Run fail check**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/theme-integration.test.tsx`
Expected: FAIL

**Step 3: Implement minimal primitive layer mapped to existing tokens**

- Reuse `--bg-*`, `--text-*`, `--border-*`, accent tokens.
- Replace raw repetitive classes in panel modules with primitives.

**Step 4: Verify pass**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run src/tests/omni/theme-integration.test.tsx && npm run lint`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/button.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/input.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/tabs.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/ui/card.tsx /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/index.css /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/src/tests/omni/theme-integration.test.tsx
git commit -m "feat: add token-driven omnipanel ui primitives"
```

### Task 9: E2E integration coverage for minimal/full/advanced workflows

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/app.spec.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-gateway.spec.ts`

**Step 1: Write failing e2e scenarios**

- Minimal mode shows primary tabs only.
- Full mode advanced drawer opens and navigates to config/logs/debug.
- Chat send flow + session selection + channels probe visible states.

**Step 2: Run fail check**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx playwright test tests/e2e/omnipanel-gateway.spec.ts`
Expected: FAIL (before implementation complete)

**Step 3: Implement missing selectors/stability hooks only**

- Add `data-testid` on key nav and panel roots where needed.

**Step 4: Verify pass**

Run: `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx playwright test tests/e2e/omnipanel-gateway.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/app.spec.ts /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/tests/e2e/omnipanel-gateway.spec.ts
git commit -m "test: add omnipanel gateway e2e coverage"
```

### Task 10: Final hardening + discharge checks

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/EPI_CLAW_OMNIPANEL_IMPLEMENTATION.md`
- Modify: `/Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md`

**Step 1: Run full verification suite**

Run:
```bash
cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src
npm run typecheck
npm run lint
npx vitest run
npx playwright test tests/e2e/omnipanel-gateway.spec.ts
```
Expected: all PASS

**Step 2: Verify live gateway smoke**

Run:
```bash
cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw
pnpm gateway run --port 18790
```
Then in Electron validate connect/chat/sessions/config read/logs read manually.
Expected: successful RPC round-trips in all primary panels + advanced drawer.

**Step 3: Update parity checklist with final status**

- Mark each panel’s required RPC path complete.
- Note unsupported methods/fallbacks explicitly.

**Step 4: Final docs update**

- Capture navigation IA decisions (primary-first, advanced drawer).
- Capture known limitations and follow-ups.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/EPI_CLAW_OMNIPANEL_IMPLEMENTATION.md /Users/admin/Documents/Epi-Logos/docs/plans/omnipanel-rpc-parity-checklist.md
git commit -m "docs: finalize omnipanel parity and discharge notes"
```

## Global Quality Gates (run at end of each panel slice)

- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npm run typecheck`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npm run lint`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx vitest run <targeted-test-file>`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npx playwright test tests/e2e/omnipanel-gateway.spec.ts` (for integration checkpoints)

## Integration Rules for this implementation

- Keep `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/OmniPanel.tsx` as root orchestrator.
- No direct RPC in panel components; use store/controller actions only.
- Maintain full panel scope; only move advanced panels behind full-mode drawer (not removed).
- Do not alter gateway method contracts without matching parity checklist updates.
- Any new behavior must be consumed by live UI path before task closure.
