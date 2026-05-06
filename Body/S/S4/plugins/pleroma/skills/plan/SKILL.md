---
name: plan
description: "Strategic planning with optional consensus mode. Auto-detects interview (Nous gate) vs direct (Logos). Consensus mode uses CFP2 C-Thread: Logos → Mythos → Eros triad."
---

<VAK_Frame>
CPF: (00/00)|(4.0/1-4.4/5)  CT: CT1,CT4  CP: 4.0→4.1
CF: (00/00)→Nous [intake] | (0/1)→Logos [plan]  CFP: CFP0|CFP2  CS: CS0 / Day
</VAK_Frame>

# Plan — VAK Strategic Planning

Plan creates comprehensive work plans. It auto-detects whether to route through Nous `(00/00)` for interview (broad requests) or proceed as Logos `(0/1)` for direct planning (detailed requests). Consensus mode uses the CFP2 C-Thread: Logos → Mythos → Eros.

## Mode Selection

| Mode | Trigger | Behavior |
|------|---------|----------|
| Interview | Default for broad requests | CPF `(00/00)` intake → Nous dialogical → then Logos plan |
| Direct | `--direct`, or detailed request | CPF `(4.0/1-4.4/5)` → Logos generates plan |
| Consensus | `--consensus`, "ralplan" | CFP2 C-Thread: Logos→Mythos→Eros (see `ralplan` skill) |
| Review | `--review`, "review this plan" | Eros evaluates existing plan (Night′ P2′ framing) |

**Interview mode CPF rule:** Broad/vague request → `(00/00)` dialogical (Nous). One question at a time, gather codebase facts via `explore` first before asking user. On "create the plan" signal → switch to Logos `(0/1)` mechanistic.

**Consensus mode:** Equivalent to `$ralplan`. See `ralplan` skill for full CFP2 C-Thread workflow.

## Execution Policy

- Auto-detect interview vs direct from request specificity
- Ask one question at a time during interviews — never batch
- Gather codebase facts via `explore` before asking user about them (brownfield: prefer `omx explore` for narrow concrete lookups)
- Plans must meet quality standards: 80%+ claims cite file/line, 90%+ criteria testable
- Consensus mode: Logos→Mythos→Eros MUST be sequential; never parallel
- Consensus mode outputs final plan by default; add `--interactive` for execution handoff

## State

```json
{
  "mode": "plan",
  "plan_mode": "interview|direct|consensus|review",
  "vak": {
    "cpf_intake": "(00/00)",
    "cpf_plan": "(4.0/1-4.4/5)",
    "cf": "(0/1)",
    "agent": "logos",
    "cp": "4.1",
    "cfp": "CFP0|CFP2",
    "cs": "CS0",
    "mode": "Day"
  }
}
```

## Interview Mode

1. **Classify request**: Broad (vague verbs, no specific files, 3+ areas) → interview mode
2. **Explore first**: Before asking "what patterns does your code use?", spawn `explore` to find out
3. **Ask one focused question** via `AskUserQuestion` — preference, scope, constraints
4. **Build on answers**: Each question builds on prior answer
5. **Create plan** when user signals readiness: "create the plan", "I'm ready"

Question classification:

| Type | Action |
|------|--------|
| Codebase Fact (where is X?) | Explore first, do not ask user |
| User Preference | Ask user |
| Scope Decision | Ask user |
| Requirement | Ask user |

## Direct Mode

1. Quick analysis (optional Mythos consultation for large scope)
2. Generate comprehensive work plan immediately
3. Optional Eros review if `--review` requested

## Review Mode (`--review`)

Eros `(0/1/2)` Night′ framing — P2′ Challenges. Evaluates existing plan for:
- Cleanup plans, regression tests, smell-by-smell passes, quality gates
- Verdict: APPROVED / REVISE (specific feedback) / REJECT (replanning required)

**Note:** Context that authored the plan MUST NOT be the context that approves it.

## Plan Output Format

Every plan includes:
- Requirements Summary
- Acceptance Criteria (testable, 90%+ concrete)
- Implementation Steps (with file references, adaptive count to actual scope)
- Risks and Mitigations
- Verification Steps
- VAK topology header:

```
VAK Topology: plan/{slug}
CPF: (4.0/1-4.4/5)  CT: CT1  CP: 4.1
CF: (0/1) → Logos  CFP: CFP0|CFP2  CS: CS0 / Day
```

Consensus mode adds: RALPLAN-DR summary + ADR + available-agent-types roster.

Plans saved to `.omx/plans/`. Drafts to `.omx/drafts/`.

## Execution Handoff

Consensus mode with `--interactive`: on approval, run `vak-evaluate` → `anima-orchestration`.
Direct mode: user can invoke `$ralplan`, `$ralph`, `$team` after reviewing the plan.

**MUST invoke `anima-orchestration` for execution — NEVER implement directly in planning.**
