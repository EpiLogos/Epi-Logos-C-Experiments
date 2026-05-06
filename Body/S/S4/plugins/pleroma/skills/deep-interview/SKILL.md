---
name: deep-interview
description: Socratic deep interview with mathematical ambiguity gating before execution. Nous modality — CPF (00/00) dialogical. Produces execution-ready specs via vak-evaluate handoff.
argument-hint: "[--quick|--standard|--deep] [--autoresearch] <idea or vague description>"
---

<VAK_Frame>
CPF: (00/00)  CT: CT0  CP: 4.0
CF: (00/00) → Nous  CFP: CFP0  CS: CS0 / Day→Night′
</VAK_Frame>

<Purpose>
Deep Interview is a Nous modality — the Socratic face of Ouroboros. It turns vague ideas into execution-ready specifications by applying targeted questioning pressure: why the user wants a change, how far it should go, what should stay out of scope, and what the agent may decide without confirmation.

This is a dialogical mode (CPF `(00/00)`). No mechanistic execution occurs inside deep-interview. On completion, the crystallized spec is handed to `vak-evaluate` which assigns coordinates and routes to the correct constitutional agent via `anima-orchestration`.
</Purpose>

<Use_When>
- The request is broad, ambiguous, or missing concrete acceptance criteria
- The user says "deep interview", "interview me", "ask me everything", "don't assume", or "ouroboros"
- The user wants to avoid misaligned implementation from underspecified requirements
- You need a requirements artifact before handing off to `ralplan`, `pipeline`, `ralph`, or `team`
- CPF is `(00/00)` — ambiguity gate triggered by `vak-evaluate`
</Use_When>

<Do_Not_Use_When>
- The request already has concrete file/symbol targets and clear acceptance criteria
- The user explicitly asks to skip planning/interview and execute immediately
- A complete PRD/plan already exists and execution should start
- CPF is `(4.0/1-4.4/5)` — mechanistic work already scoped
</Do_Not_Use_When>

<Depth_Profiles>
- **Quick (`--quick`)**: fast pre-PRD pass; target threshold `<= 0.30`; max rounds 5
- **Standard (`--standard`, default)**: full requirement interview; target threshold `<= 0.20`; max rounds 12
- **Deep (`--deep`)**: high-rigor exploration; target threshold `<= 0.15`; max rounds 20
- **Autoresearch (`--autoresearch`)**: interview for `omx autoresearch` launch readiness

If no flag is provided, use **Standard**.
</Depth_Profiles>

<Execution_Policy>
- Ask ONE question per round (never batch)
- Ask about intent and boundaries before implementation detail
- Target the weakest clarity dimension each round
- Treat every answer as a claim to pressure-test: demand evidence, expose hidden assumption, force tradeoff
- Stay on the same thread until one layer deeper, one assumption clearer, or one boundary tighter
- Before crystallizing, complete at least one explicit pressure pass revisiting an earlier answer
- Gather codebase facts via `explore` before asking user about internals
- Always run a preflight context intake before the first interview question
- Re-score ambiguity after each answer and show progress transparently
- Do not hand off to execution while ambiguity remains above threshold unless user explicitly opts to proceed with warning
- `Non-goals` and `Decision Boundaries` are mandatory readiness gates
</Execution_Policy>

<Steps>

## Phase 0: Preflight Context Intake

1. Parse `{{ARGUMENTS}}` and derive a short task slug.
2. Attempt to load the latest relevant context snapshot from `.omx/context/{slug}-*.md`.
3. If no snapshot exists, create a minimum context snapshot with:
   - Task statement
   - Desired outcome
   - Stated solution
   - Probable intent hypothesis
   - Known facts/evidence
   - Constraints
   - Unknowns/open questions
   - Decision-boundary unknowns
   - Likely codebase touchpoints
4. Save snapshot to `.omx/context/{slug}-{timestamp}.md` (UTC `YYYYMMDDTHHMMSSZ`).

## Phase 1: Initialize

1. Parse `{{ARGUMENTS}}` and depth profile.
2. Detect brownfield/greenfield via `explore`.
3. Initialize state via `state_write(mode="deep-interview")`:

```json
{
  "active": true,
  "current_phase": "deep-interview",
  "state": {
    "interview_id": "<uuid>",
    "profile": "quick|standard|deep",
    "type": "greenfield|brownfield",
    "initial_idea": "<user input>",
    "rounds": [],
    "current_ambiguity": 1.0,
    "threshold": 0.3,
    "max_rounds": 5,
    "challenge_modes_used": [],
    "current_stage": "intent-first",
    "current_focus": "intent",
    "context_snapshot_path": ".omx/context/<slug>-<timestamp>.md",
    "vak": {
      "cpf": "(00/00)",
      "ct": "CT0",
      "cp": "4.0",
      "cf": "(00/00)",
      "agent": "nous",
      "cfp": "CFP0",
      "cs": "CS0",
      "mode": "Day"
    }
  }
}
```

4. Announce kickoff with profile, threshold, and current ambiguity.

## Phase 2: Socratic Interview Loop

Repeat until ambiguity `<= threshold`, pressure pass complete, readiness gates explicit, user exits, or max rounds reached.

### 2a) Generate next question

Target the lowest-scoring dimension, respecting stage priority:
- **Stage 1 — Intent-first:** Intent, Outcome, Scope, Non-goals, Decision Boundaries
- **Stage 2 — Feasibility:** Constraints, Success Criteria
- **Stage 3 — Brownfield grounding:** Context Clarity (brownfield only)

Follow-up pressure ladder after each answer:
1. Ask for concrete example, counterexample, or evidence signal
2. Probe hidden assumption, dependency, or belief
3. Force boundary or tradeoff: what would you NOT do?
4. If answer describes symptoms, reframe toward essence / root cause

### 2b) Ask the question

```
Round {n} | Target: {weakest_dimension} | Ambiguity: {score}%

{question}
```

### 2c) Score ambiguity

Greenfield: `ambiguity = 1 - (intent × 0.30 + outcome × 0.25 + scope × 0.20 + constraints × 0.15 + success × 0.10)`

Brownfield: `ambiguity = 1 - (intent × 0.25 + outcome × 0.20 + scope × 0.20 + constraints × 0.15 + success × 0.10 + context × 0.10)`

Readiness gates — must be explicit before crystallizing:
- `Non-goals`
- `Decision Boundaries`
- Pressure pass complete (at least one earlier answer revisited with evidence/assumption/tradeoff probe)

### 2d) Report progress and persist state

Show weighted breakdown table, readiness-gate status, next focus. Append round result via `state_write`.

## Phase 3: Challenge Modes

Use each mode once when applicable:

- **Contrarian** (round 2+): challenge core assumptions
- **Simplifier** (round 4+ or scope expanding faster than outcome): probe minimal viable scope
- **Ontologist** (round 5+ and ambiguity > 0.25): ask for essence-level reframing

## Phase 4: Crystallize Artifacts

When threshold is met (or user exits / hard cap):

1. Write interview transcript summary to `.omx/interviews/{slug}-{timestamp}.md`
2. Write execution-ready spec to `.omx/specs/deep-interview-{slug}.md`

Spec must include:
- Metadata (profile, rounds, final ambiguity, threshold, context type)
- Context snapshot reference/path
- Clarity breakdown table
- Intent (why the user wants this)
- Desired Outcome, In-Scope, Out-of-Scope / Non-goals
- Decision Boundaries
- Constraints, Testable acceptance criteria
- Assumptions exposed + resolutions
- Pressure-pass findings
- Technical context findings

Update state: `"cp": "4.5"` (production complete).

Add VAK block to spec artifact:
```
VAK: deep-interview/{slug}
CPF: (00/00)  CT: CT0  CP: 4.0→4.5
CF: (00/00) → Nous  CFP: CFP0  CS: CS0 / Day
```

## Phase 5: VAK-Native Execution Bridge

After artifact generation, run `vak-evaluate` on the crystallized spec to assign coordinates.
Input to `vak-evaluate`: the spec's Intent + Desired Outcome (task description).

Then invoke `anima-orchestration` with the assigned CF code.

**VAK-native options (presented to user after `vak-evaluate` output):**

1. **Logos / ralplan** — CF `(0/1)` — Planner→Mythos→Eros consensus planning on the spec
2. **Anima / ralph or pipeline** — CF `(4.0/1-4.4/5)` — direct execution against the spec
3. **Anima / team** — CF `(4.0/1-4.4/5)` CFP1/CFP3 — parallel execution
4. **Nous / refine further** — CF `(00/00)` — continue interview loop

Preserve intent, non-goals, decision boundaries, acceptance criteria, and any residual-risk warnings across the handoff.

**IMPORTANT:** Deep-interview is a requirements mode. Do NOT implement directly inside deep-interview.

</Steps>

<Escalation_And_Stop_Conditions>
- User says stop/cancel/abort → persist state and stop
- Ambiguity stalls for 3 rounds (+/- 0.05) → force Ontologist mode once
- Max rounds reached → proceed with explicit residual-risk warning
- All dimensions >= 0.9 → allow early crystallization
</Escalation_And_Stop_Conditions>
