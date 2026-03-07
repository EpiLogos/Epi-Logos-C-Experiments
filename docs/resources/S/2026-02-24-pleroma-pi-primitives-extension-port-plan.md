# Pleroma PI Primitives Extension Port Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port the highest-value modded superpowers/ta-onta atomic capabilities into a PI-native Pleroma extension so Anima+Aletheia PI agents and team/chain subagents can invoke first-class tools with explicit agent-scope policy bindings.

**Architecture:** Add a PI extension under `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/` that exposes atomic Pleroma tools (`tmux`, `mprocs`, `bkmr/epi-kbase`, `onecontext`, `ralph`) plus a capability registry/policy surface. Patch vendored `agent-team` / `agent-chain` to propagate explicitly allowed child extensions so subagents (not only the dispatcher) can use the new primitives while preserving `--no-extensions` discovery lockout.

**Tech Stack:** TypeScript, Vitest, PI extension API (`@mariozechner/pi-coding-agent`), Node `child_process`, existing ta-onta Pleroma/Anima QL launcher surfaces.

---

### Task 1: Capability Map + Policy Surface

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-primitives.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-primitives.test.ts`

**Step 1: Write failing tests**
- Verify registry contains `tmux`, `mprocs`, `bkmr_kbase`, `onecontext`, `ralph_tui`.
- Verify agent-scope policy bindings for constitutional + Aletheia agents are explicit and fail-fast on unknown capability.

**Step 2: Run test to verify failure**
- Run: `cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw && pnpm vitest run src/agents/quaternal-logic/pleroma-pi-primitives.test.ts`

**Step 3: Implement minimal registry + policy helpers**
- Export list/query helpers + stable IDs + provenance refs.

**Step 4: Run test to verify pass**
- Same command as Step 2.

### Task 2: Pleroma PI Extension (Atomic Tools)

**Files:**
- Create: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/ta-onta-pleroma-primitives.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-extension.test.ts`

**Step 1: Write failing tests**
- Verify extension registers commands/tools for capability listing and dry-run previews.
- Verify tool handlers enforce bounded execution / fail-fast validation.

**Step 2: Run test to verify failure**
- Run: `cd /Users/admin/Documents/Epi-Logos/Idea/epi-claw && pnpm vitest run src/agents/quaternal-logic/pleroma-pi-extension.test.ts`

**Step 3: Implement minimal extension**
- Tools/commands:
  - `pleroma_caps_list`
  - `pleroma_caps_policy`
  - bounded `pleroma_exec_tmux`, `pleroma_exec_kbase`, `pleroma_exec_onecontext`, `pleroma_exec_ralph`
- Default to preview/dry-run unless explicitly requested.

**Step 4: Run test to verify pass**
- Same command as Step 2.

### Task 3: Child Extension Propagation for PI Team/Chain Subagents

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/agent-team.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/.pi/extensions/pi-vs-claude-code/agent-chain.ts`
- Test: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-launcher.test.ts` (or dedicated propagation tests)

**Step 1: Write failing tests**
- Verify child PI args include explicit `-e` entries when `PI_AGENT_CHILD_EXTENSIONS` is set.
- Verify default behavior unchanged when env var absent.

**Step 2: Run test to verify failure**
- Run targeted vitest for propagation tests.

**Step 3: Implement minimal patch**
- Parse `PI_AGENT_CHILD_EXTENSIONS` (comma/newline separated).
- Append explicit `-e` args after `--no-extensions`.
- No implicit discovery.

**Step 4: Run test to verify pass**
- Same command as Step 2.

### Task 4: Integrate QL Launcher + ta-onta Anima `/commands`

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-launcher.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/modules/anima/ql-pi-commands.ts`
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/scripts/ql-pi-launch.ts`
- Test: existing QL launcher/command tests

**Step 1: Write failing tests**
- Assert top-level PI launchers set `PI_AGENT_CHILD_EXTENSIONS` to include `ta-onta-pleroma-primitives`.
- Assert ta-onta command execution path preserves bounded invocation and explicit workflow IDs.

**Step 2: Run test to verify failure**
- Run targeted test suite.

**Step 3: Implement minimal integration**
- Inject extension env var for team/chain surfaces.
- Keep fail-fast and no-bypass guardrails.

**Step 4: Run test to verify pass**
- Same command as Step 2.

### Task 5: Validation + Record Update

**Files:**
- Modify: `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/ta-onta/QUATERNAL-LOGIC-US052-IMPLEMENTATION-RECORD.md`

**Step 1: Run verification**
- `pnpm vitest run` targeted suites
- `pnpm tsc -p tsconfig.json --noEmit --pretty false`

**Step 2: Update implementation record**
- Add Pleroma PI extension artifacts, capabilities ported, deep-wrapper integration points touched, and explicit deferred items.

**Step 3: Capture runtime proof**
- Print or run bounded `/ql-vak-pi` preview showing Pleroma child-extension propagation env.

