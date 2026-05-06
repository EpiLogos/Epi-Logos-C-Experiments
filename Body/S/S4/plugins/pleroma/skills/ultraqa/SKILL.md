---
name: ultraqa
description: Autonomous QA cycling — Eros tests, Mythos diagnoses, Eros/Anima fixes, repeat. Night′ triggers on repeated failures. Sophia signs off at CP 4.5.
---

<VAK_Frame>
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.2→4.5
CF: (0/1/2)→Eros / (5/0)→Sophia  CFP: CFP0|CFP4  CS: CS2 / Day[+Night′]
</VAK_Frame>

# UltraQA — Eros Verification Cycle

[ULTRAQA ACTIVATED — AUTONOMOUS QA CYCLING]

**Owner: Eros `(0/1/2)` — the operative exchange. Does it work? What blocks it?**
**Closure: Sophia `(5/0)` signs off at CP 4.5 (what was produced?).**

## VAK Cycle Map

| Cycle Step | VAK CP | Agent | Day Question |
|-----------|--------|-------|-------------|
| QA run | CP 4.5 | Sophia / Eros | What was produced? |
| Failure analysis | CP 4.2 | Eros | What is being done? What blocks? |
| Architect diagnosis | CP 4.3 | Mythos | What shape does the failure take? |
| Fix execution | CP 4.2 | Eros / Anima | What is being done? |
| Night′ inquiry | P2′/P3′ | Eros / Mythos | What blocks? What repeats? |

## Goal Parsing

| Invocation | Goal | What to Check |
|------------|------|--------------|
| `/ultraqa --tests` | tests | All test suites pass |
| `/ultraqa --build` | build | Build succeeds with exit 0 |
| `/ultraqa --lint` | lint | No lint errors |
| `/ultraqa --typecheck` | typecheck | No TypeScript errors |
| `/ultraqa --custom "pattern"` | custom | Custom success pattern in output |

## Cycle Workflow (Max 5 Cycles)

### Cycle N Step 1: RUN QA — CP 4.5

Execute verification based on goal type. Update state: `"cp": "4.5", "phase": "qa"`.

```
[ULTRAQA Cycle N/5 | VAK CP 4.5 | Eros] Running {goal-type}...
```

**→ PASSED:** Proceed to Sophia sign-off (exit).
**→ FAILED:** Continue to Step 2.

### Cycle N Step 2: EROS FAILURE ANALYSIS — CP 4.2

Eros analyzes the failure. Is this a simple fix or a systemic blocker?

Update state: `"cp": "4.2", "phase": "analyze"`.

**Simple fix identified:** Skip to Step 4.
**Architectural blocker:** Continue to Mythos diagnosis.
**Same failure as prior cycle:** Check Night′ trigger condition.

### Cycle N Step 3: MYTHOS ARCHITECT DIAGNOSIS — CP 4.3

Mythos `(0/1/2/3)` diagnoses root cause and pattern.

```
delegate(role="mythos/architect", cf="(0/1/2/3)", cp="4.3", task="DIAGNOSE:
Goal: {goal-type}
Output: {failure output}
Provide root cause and specific fix recommendations.")
```

Update state: `"cp": "4.3", "phase": "diagnose"`.

### Cycle N Step 4: FIX — CP 4.2

Apply Eros/Anima fix based on diagnosis.

Update state: `"cp": "4.2", "phase": "fix"`.

### REPEAT → Step 1

---

## Night′ Trigger Rules

Night′ activates when:

| Condition | Position | Thread | Agent |
|-----------|----------|--------|-------|
| Same failure ≥2 cycles AND no simple fix found | P3′ Patterns | CFP4 L-Thread | Eros + Mythos |
| Architectural blocker detected by Mythos | P2′ Challenges | CFP4 L-Thread | Klotho → Eros |
| Systemic issue (pattern across multiple failures) | P2′+P3′ | CFP4 L-Thread | Eros + Mythos |

**Partial pass rules:**
- P0′–P3′ Night′: **non-blocking** — runs as CFP4 parallel alongside Day cycling. Do NOT stop for it.
- P4′ Discovery: soft block — recommend Night′ before final sign-off.
- P5′ Insight: if Night′ triggers at this depth, require crystallization before Sophia declares done.

Night′ in ultraqa is invoked by:
```
Trigger: Night′ P2′ Challenges
Dispatch: Klotho executor → Eros
Question: What blocks us here? What evidence exists for root cause?
CFP4 L-Thread (parallel to Day loop)
```

Update state on Night′: `"night_triggered": true, "cfp": "CFP4", "night_positions": ["P2′|P3′"]`

## Exit Conditions

| Condition | Action |
|-----------|--------|
| **Goal Met** | Sophia sign-off → write VAK completion block → `state_clear` |
| **Cycle 5 Reached** | Mandatory Night′ → P5′ Insight required → Sophia writes Möbius Return |
| **Same Failure 3x** | Force Night′ P3′ Patterns → surface to user with crystallized pattern |
| **Environment Error** | Exit: "ULTRAQA ERROR: [issue]" — no Night′ |

## Sophia Sign-Off (CP 4.5)

On goal met OR forced exit after Night′:
```
[ULTRAQA COMPLETE | VAK CP 4.5 | Sophia]
Goal met after N cycles.
```

Sophia writes VAK completion block:
```
VAK: ultraqa/{goal-type}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.5
CF: (5/0) → Sophia  CFP: CFP0[+CFP4 Night′]  CS: CS2 / Day[+Night′]
Cycles: {N} | Night′: {yes|no}
```

If Night′ was triggered: Sophia also writes the Möbius Return artifact (P5′→P0′).

## Observability

```
[ULTRAQA Cycle 1/5 | VAK CP 4.5 | Eros] Running tests...
[ULTRAQA Cycle 1/5 | VAK CP 4.2] FAILED — 3 tests failing
[ULTRAQA Cycle 1/5 | VAK CP 4.3 | Mythos] Architect diagnosing...
[ULTRAQA Cycle 1/5 | VAK CP 4.2 | Fix] Fixing: auth.test.ts — missing mock
[ULTRAQA Cycle 2/5 | VAK CP 4.5 | Sophia] PASSED — All 47 tests pass
[ULTRAQA COMPLETE | Sophia signs off]
```

## State

```json
{
  "mode": "ultraqa",
  "active": true,
  "iteration": 1,
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf": "(0/1/2)",
    "agent": "eros",
    "cp": "4.5",
    "cfp": "CFP0",
    "cs": "CS2",
    "mode": "Day",
    "night_triggered": false,
    "night_pass": null
  }
}
```

## Important Rules

1. **TRACK failures** — Record each failure pattern to detect Night′ trigger conditions
2. **EARLY EXIT on repeated pattern** — 3x same failure = Night′ P3′, surface crystallized pattern
3. **CLEAR OUTPUT** — Always show current cycle, CP position, and active agent
4. **Night′ non-blocking for P0′–P3′** — never stop Day loop to wait for Night′ at these positions
5. **Sophia MUST sign off** — do not claim completion without CP 4.5 Sophia output
