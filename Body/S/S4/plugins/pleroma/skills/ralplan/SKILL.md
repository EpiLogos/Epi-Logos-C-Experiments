---
name: ralplan
description: Consensus planning via constitutional agent triad — Logos (plan) → Mythos (architecture review) → Eros (quality critique). CFP2 C-Thread. Routes through vak-evaluate on approval.
---

<VAK_Frame>
CPF: (4.0/1-4.4/5)  CT: CT1,CT4  CP: 4.1
CF: (0/1) → Logos  CFP: CFP2 C-Thread  CS: CS0 / Day
Thread: Logos(4.1) → Mythos(4.3) → Eros(4.2)
</VAK_Frame>

# Ralplan — VAK Consensus Planning

Ralplan triggers consensus planning through the constitutional agent triad: **Logos** creates the plan, **Mythos** reviews architectural soundness, **Eros** critiques quality. This is a CFP2 C-Thread — sequential, full accumulated context passed to each agent.

This is the `$plan --consensus` path. For lightweight planning without the full triad, use `$plan` directly.

## Flags

- `--interactive`: User prompts at draft review (step 2) and final approval (step 6)
- `--deliberate`: High-risk mode — adds pre-mortem (3 scenarios) + expanded test plan

Auto-enables deliberate mode when task signals high risk: auth/security, migrations, destructive changes, production incidents, compliance/PII, public API breakage.

## Pre-context Intake

Before consensus planning:
1. Derive task slug from the request
2. Reuse latest snapshot in `.omx/context/{slug}-*.md` when available
3. If none exists, create `.omx/context/{slug}-{timestamp}.md`:
   - Task statement, desired outcome, known facts/evidence, constraints, unknowns, codebase touchpoints
4. If ambiguity remains high → run `$deep-interview --quick <task>` first (Nous gate)

## Initialize State

```json
{
  "mode": "ralplan",
  "active": true,
  "current_phase": "planner",
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf_thread": [
      {"step": "logos/planner", "cf": "(0/1)", "agent": "logos", "cp": "4.1"},
      {"step": "mythos/architect", "cf": "(0/1/2/3)", "agent": "mythos", "cp": "4.3"},
      {"step": "eros/critic", "cf": "(0/1/2)", "agent": "eros", "cp": "4.2"}
    ],
    "cfp": "CFP2",
    "cs": "CS0",
    "mode": "Day"
  }
}
```

## Consensus Workflow

### Step 1: Logos / Planner

**Agent: Logos `(0/1)` — CP 4.1 Definition**

Creates initial plan and a compact **RALPLAN-DR summary**:
- **Principles** (3-5)
- **Decision Drivers** (top 3)
- **Viable Options** (≥2) with bounded pros/cons
- If only one viable option: explicit invalidation rationale for alternatives
- Deliberate mode: pre-mortem (3 failure scenarios) + expanded test plan (unit/integration/e2e/observability)

Plan saved to `.omx/plans/{slug}-draft.md`.

### Step 2: User Feedback *(--interactive only)*

Use `AskUserQuestion` to present draft plan + RALPLAN-DR summary. Options:
- **Proceed to review** → continue to Mythos
- **Request changes** → return to Step 1 with feedback
- **Skip review** → proceed to final approval

Without `--interactive`: automatically proceed to Mythos.

### Step 3: Mythos / Architect

**Agent: Mythos `(0/1/2/3)` — CP 4.3 Pattern**

Reviews for architectural soundness. **Await completion before Step 4 — do NOT parallel.**

Mythos review MUST include:
- Strongest steelman counterargument (antithesis) against the favored option
- At least one meaningful tradeoff tension
- Synthesis path when possible
- Deliberate mode: explicit flag of principle violations

### Step 4: Eros / Critic

**Agent: Eros `(0/1/2)` — CP 4.2 Operation**

Run only after Step 3 completes. Eros MUST verify:
- Principle-option consistency
- Fair alternative exploration
- Risk mitigation clarity
- Testable acceptance criteria (90%+ concrete)
- Concrete verification steps
- Deliberate mode: reject missing/weak pre-mortem or expanded test plan

Verdict: `APPROVE` | `ITERATE` | `REJECT`

### Step 5: Re-review Loop (max 5 iterations)

Any non-`APPROVE` verdict triggers closed loop:
1. Collect Mythos + Eros feedback
2. Logos revises plan with accumulated feedback
3. Return to Step 3 (Mythos)
4. Return to Step 4 (Eros)
5. Repeat until `APPROVE` or 5 iterations → present best version

### Step 6: Final Approval *(--interactive only)*

Eros approves → apply all accepted improvements. Final plan MUST include:
- **ADR section**: Decision / Drivers / Alternatives considered / Why chosen / Consequences / Follow-ups
- VAK topology header (see output format below)

Use `AskUserQuestion` to present final plan. Options:
- **Approve → vak-evaluate + Anima/ralph** — sequential execution
- **Approve → vak-evaluate + Anima/team** — parallel coordinated execution
- **Request changes** → return to Step 1
- **Reject** → discard

Without `--interactive`: output final plan and stop. Do NOT auto-execute.

### Step 7: VAK-Native Execution Handoff

On user approval: run `vak-evaluate` on the approved plan.
Then invoke `anima-orchestration` with the CF code → Anima dispatches `ralph` or `team`.

**MUST NOT implement directly in the planning step. Anima handles execution.**

## Output Format

Final plan artifact (`.omx/plans/{slug}-final.md`) includes VAK topology header:

```
VAK Topology: ralplan/{slug}
CPF: (4.0/1-4.4/5)  CFP: CFP2 C-Thread
Thread: Logos(CP 4.1) → Mythos(CP 4.3) → Eros(CP 4.2)
CS: CS0 / Day
Iterations: {n}
```

## Enforcement

> Steps 3 and 4 MUST run sequentially. Do NOT issue Mythos and Eros calls in parallel. Always await Mythos result before invoking Eros.
