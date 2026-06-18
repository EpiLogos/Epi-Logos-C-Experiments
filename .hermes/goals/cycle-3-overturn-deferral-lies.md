# /goal — Cycle 3 Plan Alignment: Overturn Deferral Lies, Re-Audit Fraudulent Evidence

## SCOPE (read this first — non-negotiable)

This is an **editorial/alignment task on the plan documents themselves.** You are fixing the plans so they are honest and executable. You are NOT executing the tasks. You are NOT writing code, building, compiling, running tests, implementing CCT-16, filling VAK coordinates, or executing DR Actions.

**What you DO:**
- Edit plan .md files to strike deferral language and rewrite false "design only" / "spec-only" blocks
- Edit plan.state.json to reset fraudulent evidence strings and fix dishonest statuses
- Edit spec-gap-register and progress reports to remove "deferred to Cycle 4"
- Add honest notes explaining what was fixed and why
- Verify with grep that deferral language is gone

**What you DO NOT do:**
- Write any code
- Build or compile anything
- Run tests
- Implement any task
- Fill in VAK coordinate tables
- Execute DR Action sections
- Create new files beyond the plan directory

## Context

The Cycle 3 plan set at `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/` contains 40+ plan files with 483 fully-specified tasks, all DRs VALIDATED, and complete tranche bodies. A previous model invented a phantom "Cycle 3 design-reconciliation mandate — design only, no code" and baked deferrals into the plans. It also marked 24 tasks "done" with evidence like "DR validated — direct close" despite the DR's Action section never being executed. The claims that task bodies are "stubs" are false — every task body exists and is populated (verified: 482 of 483 have 200+ character bodies, tracks 24-32 have 40-90KB of detailed markdown each).

Your job: fix the documents so a builder agent can pick them up and execute real work.

## Phase 1 — Strike the Master Lie

### 1a: plan.runs/spec-gap-register-2026-06-13.md

Line 88: `| Heavy code tasks (235 pending + 9 review) | Implementation work deferred to Cycle 4 |`
→ Replace with: `| Heavy code tasks (235 pending + 9 review) | Cycle 3 implementation — specs complete, DRs VALIDATED, ready to build |`

Line 93: `| Deferred to Cycle 4: 2 tracked items + 245 plan tasks`
→ Replace with: `| Cycle 3 work remaining: 2 tracked items + 245 plan tasks`

Lines 80-94 (the "Remaining — deferred to Cycle 4" summary table): Strike the "deferred to Cycle 4" header. Each item is actionable now — reclassify as "Remaining — Cycle 3."

### 1b: plan.runs/2026-06-15-hermes-nara-rounds-1-4-progress.md

Line 19: `235 pending (heavy-code execution deferred to Cycle 4)`
→ Replace with: `235 pending (implementation — specs complete, ready to build) + 57 done tasks flagged for evidence re-audit`

Lines 161-164: The paragraph claiming "deferred to Cycle 4 per the design-reconciliation mandate"
→ Replace with: `235 pending tasks are Cycle 3 implementation work. All tranche bodies contain complete specs, verification criteria, file paths, and substrate references. No further design work needed. 24 tasks currently marked 'done' were fraudulently closed (evidence cites DR validation rather than completed Action execution) and have been reset to pending with honest notes. 33 additional 'done' tasks have thin evidence and carry a re-audit flag.`

### 1c: 12-agentic-layer-s4-s5.md — Task 12.35 (lines 835-847)

The "Implementation scope (Cycle 3 — design only; execution deferred to Cycle 4): — This tranche defines the architecture. No code lands." block.

→ Replace with:
```
**Implementation scope (Cycle 3):**
- Wire the Verify phase into plan-assess.mjs adjudication
- Add judge role dispatch to Anima — resolve judge model from task VAK coordinates + slot config
- Register adversarial gate in gateway contract
- Implement 3-cycle-max escalation to human
- GoalSpec + GoalRun carry verify-phase evidence with VAK coordinates of judge agent
- No new carrier classes. No new VAK fields. Existing substrate only.
```

### 1d: 12-agentic-layer-s4-s5.md — Task 12.25 (lines 419-421)

"spec-only-now; execution blocked on Tranches 12.20–12.24 and Streams A–G"

→ Replace with:
```
*(spec-ahead-integration; VAK coordinate table fill-in from existing data + choreography wire-up; depends on Tranches 12.20-12.24 which are ALL Cycle 3 work — execute in dependency order)*
```

### 1e: 16-cross-cutting-closures.md — CCT-14b line 137

"Visualisation hook (deferred to follow-up plugin tranche, named here)"

→ Replace with:
```
**CCT-14b sub-tranche — Visualisation hook:** Extend m3-mahamaya chromosomal-wheel inspector at `Body/M/epi-theia/extensions/m3-mahamaya/` to render entity-birth-codon density per chromosome. Consume `c_5_birth_codon` frontmatter via graph query. ~200 LOC. Build now.
```

### 1f: 16-cross-cutting-closures.md — CCT-14b line 150

"Forward extension (named, deferred): the same protocol extends naturally to agents..."

→ Replace with:
```
**CCT-14c sub-tranche — Agent/Tool/DR/Tranche birth-codon extension:** Extend the birth-codon protocol to agents (`Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*.md`), tools (each MCP tool), DR rows (`13-decision-register.md` entries), and tranches. Same BLAKE3 derivation, same frontmatter keys, different targets. The Hen promotion code already handles the entity case.
```

## Phase 2 — Re-Audit Fraudulent "Done" Tasks in plan.state.json

24 tasks are marked "done" with evidence that cites DR validation rather than completed work. For each of these tasks, you must reset the evidence to an honest status. Do NOT execute the work — just fix the record.

The principle: if evidence says "DR-M?-? VALIDATED in 13-decision-register.md. Doc-ahead — direct close" and the DR's Action section specifies concrete work, then:
- If the work was genuinely done elsewhere (grep-verifiable) → update evidence to cite the actual change
- If the work was NOT done → reset status to "pending" with honest notes documenting what the DR Action requires

The 24 tasks are: 04.T4.4, 05.T5.2, 05.T5.7, 06.T6.5, 09.T9.4, 10.T10.1, 12.T12.11, 12.T12.17, 15.T15.5, 18.T18.7, 25.T25.18, 26.T26.3, 28.T28.20, 30.T30.5, 30.T30.13, 30.T30.14, 31.T31.2, 31.T31.10, 32.T32.5, plus the remainder identified in the full catalog at the reference file. Use grep to verify whether each DR's Action was actually executed. If a file the Action names doesn't contain the change → reset to pending.

Also re-examine ~33 tasks with thin evidence ("Claude opus: task completed" or single-line notes). For each: if the evidence doesn't name a concrete file change, test result, or build output → add a `reaudit_needed: true` flag or reset to pending.

For each reset, add a note like: `DR-M?-? VALIDATED but Action section not executed — reset from fraudulent done to pending. Requires: [specific file/change from DR Action].`

## Phase 3 — Verify and Document

After all patches, run these grep verifications and record results:

```
grep -rn "deferred to Cycle 4\|deferred to cycle 4" plan.runs/ 12-agentic-layer-s4-s5.md 16-cross-cutting-closures.md
```
→ Should return zero live hits (pre-2026-06-16 historical references in plan.runs are acceptable).

```
grep -rn "design only.*no code lands\|spec-only-now" 12-agentic-layer-s4-s5.md
```
→ Should return zero hits.

```
grep -rn "direct close\|no code work required" plan.state.json
```
→ Should return zero hits on evidence strings written after 2026-06-16 (today).

Produce a brief closeout note in `plan.runs/2026-06-16-deferral-lie-overturned.md` documenting:
- What was changed (files, line counts)
- How many tasks were reset from done to pending
- How many deferral instances were struck
- Remaining honest state: X tasks pending, Y tasks done (verified), Z tasks flagged for re-audit
- Confirmation that all plan documents now describe Cycle 3 work without deferral language

## Anti-Deferral Principle

These words must not appear in any plan document as of your completion:
- "deferred to Cycle 4"
- "spec-only-now"
- "design only; execution deferred"
- "direct close" (as sole evidence)
- "no code work required" (without grep/file:line proof)
