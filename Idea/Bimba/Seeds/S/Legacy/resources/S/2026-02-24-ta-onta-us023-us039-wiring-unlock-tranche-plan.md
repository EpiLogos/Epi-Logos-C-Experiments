# ta-onta US-023..US-039 Wiring Unlock Tranche Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the dependency-unlock wiring tranche foundations (starting with native session identity/lifecycle spine) and classify remaining target stories with exact blockers/evidence.

**Architecture:** Deep-wrapper-first. Extract shared session identity mechanics into Quaternal Logic, then rewire Khora/Anima runtime paths to consume them so native hook/session seams and lineage correlation stop relying on module-local string handling. Keep ta-onta semantics (CT/CTX/task-lane doctrine) plugin-local.

**Tech Stack:** TypeScript, Vitest, OpenClaw plugin hooks/tools, ta-onta runtime modules, Quaternal Logic deep primitives

---

### Task 1: Precondition Gate Evidence (US-017/021/022)

**Files:**
- Verify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/native-runtime-seam-contracts.test.ts`
- Verify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/taonta-runtime-observability-contracts.test.ts`
- Verify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/orchestration/agent-spawner.test.ts`
- Verify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/events.test.ts`
- Verify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/chronos/hooks.test.ts`
- Verify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/conformance/e2e-01-08.test.ts`

**Step 1: Run precondition bundle**

Run:
`pnpm vitest run src/agents/quaternal-logic/native-runtime-seam-contracts.test.ts src/agents/quaternal-logic/taonta-runtime-observability-contracts.test.ts extensions/ta-onta/modules/anima/orchestration/agent-spawner.test.ts extensions/ta-onta/modules/anima/events.test.ts extensions/ta-onta/modules/chronos/hooks.test.ts extensions/ta-onta/conformance/e2e-01-08.test.ts`

**Step 2: Record result in tranche grounding record**

Expected: all pass, otherwise stop tranche and report blockers.

### Task 2: US-031 Deep Session Identity Primitive (TDD)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/taonta-session-identity-contracts.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/taonta-session-identity-contracts.test.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/cache.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/now/coordinator.ts`

**Step 1: Write failing deep tests for session normalization/parsing**
- Native main/subagent session key parsing
- Canonical safe-id normalization for cache/path keys
- Mixed ingress normalization (`sessionId` + `sessionKey`)

**Step 2: Run deep tests and confirm RED**

**Step 3: Implement minimal deep primitive**
- Fail-fast parsing helpers
- Canonical/safe cache token derivation
- Native-compatible session key classification

**Step 4: Rewire Khora/Anima consumers to helper**

**Step 5: Run touched tests and confirm GREEN**

### Task 3: US-032 Khora Lifecycle Identity + Idempotent Finalization (TDD)

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/session.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/session-stop-hook.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/index.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/session.test.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/khora/session-stop-hook.test.ts`

**Step 1: Write failing tests**
- Mixed `sessionId` / `sessionKey` hook ingress normalization
- Duplicate end-signal idempotency (no duplicate finalize/queue writes)

**Step 2: Run target tests and confirm RED**

**Step 3: Implement runtime alias/canonical identity handling + finalization dedupe**

**Step 4: Verify Khora hook/native paths use shared helper**

**Step 5: Run target tests and confirm GREEN**

### Task 4: Story Audit / Classification for US-023/024/025/026/033/034/036/037/039

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US023-US039-WIRING-UNLOCK.md` (new tranche grounding record)

**Step 1: Classify each target story**
- `verify` / `backfill-doc` / `redo` / `defer-blocked`
- list exact file/interface gaps for deferred stories

**Step 2: Map deep extraction candidates**
- US-031/032/034 session identity/propagation
- US-037 cron delivery envelope/channel adapter seam
- US-039 declarative file-set contract
- US-025 credential boundary wrapper
- US-026 external-runtime invocation policy wrapper

**Step 3: Record integration points (US-043/045/047/049/050/051) + remaining plugin-local semantics**

### Task 5: Verification + Discharge Evidence

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US023-US039-WIRING-UNLOCK.md`

**Step 1: Run focused verification bundle**
- Deep session identity tests
- Khora runtime/hook tests
- Precondition seam tests (if re-touched)

**Step 2: Capture exact commands/results**

**Step 3: Record remaining blocker map for US-018/019/020 follow-on**
