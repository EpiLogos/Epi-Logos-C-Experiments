# ta-onta US-017..US-022 Deep-Grounding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the next ta-onta readiness tranche by implementing dependency-satisfied stories (`US-021`, `US-022`, `US-017`) in deep-grounding order and explicitly classifying `US-018..US-020` blockers.

**Architecture:** Extract mechanics-first primitives into Quaternal Logic deep layer (native runtime seam helper(s), observability adapter/validators, conformance harness runner/assertion primitives), then rewire ta-onta modules/tests to consume them while preserving ta-onta/VAK semantics and doctrine. Use native OpenClaw hook/invocation surfaces only (no plugin-local bypass routes).

**Tech Stack:** TypeScript, Vitest, Epi-claw/OpenClaw plugin hooks + tools, Quaternal Logic deep substrate helpers

---

### Task 1: Tranche Audit and Story Classification (`US-017..US-022`)

**Files:**
- Read/Update: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US017-US022.md` (new grounding record)
- Read: `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json`
- Read: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/PLAN.md`
- Read: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-DEEP-TRANCHE-1.md`
- Read: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-DEEP-TRANCHE-2.md`
- Read: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US003-US010.md`
- Read: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US011-US016.md`

**Step 1: Record hard-gate verification evidence (Tranche A + B)**

Run the tranche-gate Vitest subset and capture pass/fail counts in the grounding record.

**Step 2: Classify each story before implementation**

Record `verify`, `backfill-doc`, `redo`, or `defer-blocked` for `US-017..US-022` with:
- deep extraction candidate(s)
- deep-wrapper integration points (`US-043/045/047/049/050/051`) touched
- plugin-local semantics retained
- external PI pattern provenance (`pi-vs-claude-code` path+ref or `none`)
- exact blockers for any deferred story

### Task 2: US-021 Native Runtime Seam (Deep Helper + ta-onta Rewire)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/native-runtime-seam-contracts.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/native-runtime-seam-contracts.test.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/orchestration/agent-spawner.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/events.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/orchestration/agent-spawner.test.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/aletheia/day-phase-listener.test.ts`

**Step 1: Write failing deep seam tests**

Assert:
- native sessions_spawn helper only dispatches via provided `invokeTool`
- direct gateway URL / fetch style payload inputs are rejected or not part of helper API
- normalized response parsing fails fast on malformed native results

**Step 2: Implement minimal deep seam helper**

Implement mechanics-only helper(s) for native sessions_spawn invocation routing + response normalization.

**Step 3: Rewire ta-onta Anima spawner**

Replace direct `/gateway/agent` fetch with native `api.invokeTool("sessions_spawn", ...)` through the deep helper.

**Step 4: Rewire Anima event emission onto native internal hook surface**

Keep `onAnimaEvent/offAnimaEvent/emitAnimaEvent` API stable, but back it with native internal hooks instead of plugin-local event bus.

**Step 5: Run targeted tests**

Run:
- `pnpm vitest run src/agents/quaternal-logic/native-runtime-seam-contracts.test.ts`
- `pnpm vitest run extensions/ta-onta/modules/anima/orchestration/agent-spawner.test.ts`
- `pnpm vitest run extensions/ta-onta/modules/aletheia/day-phase-listener.test.ts`

### Task 3: US-022 Hook/Lifecycle Observability Contract (Deep Adapter + ta-onta Wiring)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/taonta-runtime-observability-contracts.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/taonta-runtime-observability-contracts.test.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/hooks/internal-hooks.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/chronos/hooks.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/hooks/internal-hooks.test.ts`
- Create/Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/chronos/hooks.test.ts`

**Step 1: Write failing observability adapter tests**

Assert stable telemetry shape includes:
- event/hook id
- module
- phase
- status
- duration or timing fields
- session/day/now lineage (when present)
- invocation surface

**Step 2: Implement deep observability adapter/validator**

Build mechanics-only adapter that composes `US-045` unified envelope with ta-onta runtime surface fields.

**Step 3: Wire ta-onta runtime surfaces**

Add structured telemetry to:
- Anima spawn/internal-hook path
- Chronos lifecycle hook tracking path

**Step 4: Run targeted tests**

Run:
- `pnpm vitest run src/agents/quaternal-logic/taonta-runtime-observability-contracts.test.ts`
- `pnpm vitest run src/hooks/internal-hooks.test.ts`
- `pnpm vitest run extensions/ta-onta/modules/chronos/hooks.test.ts`
- `pnpm vitest run extensions/ta-onta/modules/anima/orchestration/agent-spawner.test.ts extensions/ta-onta/modules/aletheia/day-phase-listener.test.ts`

### Task 4: US-017 Conformance Harness E2E-01..E2E-08 (Deep Harness + ta-onta Scenarios)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/conformance-harness.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/conformance-harness.test.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/conformance/e2e-01-08.test.ts`
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/conformance/E2E-01-08.md`

**Step 1: Write failing deep harness tests**

Assert:
- scenario registration is deterministic
- failures are surfaced as contract assertion failures with scenario IDs
- scenario result summary is stable for CI/local assertions

**Step 2: Implement deep harness runner/assertion primitives**

Mechanics only: scenario runner, assertion helpers, result aggregation.

**Step 3: Implement ta-onta semantic scenarios E2E-01..E2E-08**

Scenario semantics remain plugin-local; use existing ta-onta modules/contracts and mocks to assert wiring outcomes.

**Step 4: Add scenario fixture/service assumptions doc**

Document Redis/Neo4j/native lifecycle surface assumptions and what is mocked vs real.

**Step 5: Run targeted tests**

Run:
- `pnpm vitest run src/agents/quaternal-logic/conformance-harness.test.ts`
- `pnpm vitest run extensions/ta-onta/conformance/e2e-01-08.test.ts`

### Task 5: Final Tranche Verification + Grounding Record

**Files:**
- Update: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US04X-TA-ONTA-TRANCHE-US017-US022.md`

**Step 1: Run dependency-aware verification bundle**

Include:
- Tranche A/B hard-gate subset (spot-check or full referenced subset)
- new deep helper tests
- ta-onta rewire tests (`Chronos`, `Anima`, `Aletheia`)
- conformance harness tests (`E2E-01..08`)

**Step 2: Record exact classifications for `US-017..US-022`**

Explicitly document `US-018..US-020` blockers (story IDs + interface/file gaps) without fake completion claims.

**Step 3: Record exact changed files + commands + results**

Capture command list, pass counts, and any deferred risk/next actions.
