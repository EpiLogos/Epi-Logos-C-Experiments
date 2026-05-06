---
name: tdd
description: Test-Driven Development via Eros. RED=CP 4.1 (define expected), GREEN=CP 4.2 (make it work), REFACTOR=CP 4.3 (find the pattern). Night′ triggers on repeated failures.
---

<VAK_Frame>
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.1→4.2→4.3
CF: (0/1/2) → Eros  CFP: CFP0  CS: CS2 / Day[+Night′]
</VAK_Frame>

# TDD Mode — Eros / Operative Exchange

[TDD MODE ACTIVATED]

**Owner: Eros `(0/1/2)` — the chreia, the moment of operative exchange. Tests ARE the need. Failing tests ARE the blocked desire.**

## The Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST**

Write code before test? DELETE IT. Start over. No exceptions.

## VAK Red-Green-Refactor Mapping

| Phase | VAK CP | Day Question | Eros Role |
|-------|--------|-------------|-----------|
| **RED** — Write failing test | CP 4.1 Definition | What must be true? | Define expected behaviour via test |
| **GREEN** — Minimal implementation | CP 4.2 Operation | What is being done? | Make the test pass with minimum code |
| **REFACTOR** — Clean up | CP 4.3 Pattern | What shape does it take? | Find the form; Mythos available for pattern review |

## Cycle

### 1. RED Phase — CP 4.1 Definition

Write test for the NEXT piece of functionality.
Run test — MUST FAIL. If it passes, the test is wrong.

Update state: `"vak.cp": "4.1", "vak.phase": "RED"`

Output:
```
## TDD Cycle: [Feature Name]

VAK: tdd/[feature] | CP: 4.1 | Eros | Day: What must be true?

### RED Phase
Test: [test code]
Expected failure: [what error you expect]
Actual: [run result showing failure]
```

### 2. GREEN Phase — CP 4.2 Operation

Write ONLY enough code to pass the test. No extras. No "while I'm here."
Run test — MUST PASS.

Update state: `"vak.cp": "4.2", "vak.phase": "GREEN"`

Output:
```
### GREEN Phase
VAK: tdd/[feature] | CP: 4.2 | Eros | Day: What is being done?

Implementation: [minimal code]
Result: [run result showing pass]
```

### 3. REFACTOR Phase — CP 4.3 Pattern

Improve code quality. Run tests after EVERY change. Must stay green.
If structural pattern questions arise → consult Mythos `(0/1/2/3)`.

Update state: `"vak.cp": "4.3", "vak.phase": "REFACTOR"`

Output:
```
### REFACTOR Phase
VAK: tdd/[feature] | CP: 4.3 | Eros→Mythos | Day: What shape does it take?

Changes: [what was cleaned up]
Result: [tests still pass]
```

### 4. REPEAT

Next failing test. Continue cycle. Increment `vak.cycle`.

## Enforcement Rules

| If You See | Action |
|------------|--------|
| Code written before test | STOP. Delete code. Write test first. |
| Test passes on first run | Test is wrong. Fix it to fail first. |
| Multiple features in one cycle | STOP. One test, one feature. |
| Skipping refactor | Go back. Clean up before next feature. |

## Night′ Trigger Conditions

Night′ enters the TDD cycle when:

| Condition | Night′ Position | Action |
|-----------|----------------|--------|
| Same test failure ≥2 cycles AND no simple fix | P3′ Patterns | Eros + Mythos: what repeats? CFP4 L-Thread |
| Architectural blocker identified at REFACTOR | P2′ Challenges | Klotho → Eros: what blocks us? |
| Systemic issue (pattern across multiple tests) | P2′+P3′ | Partial Night′ (non-blocking) |

Night′ is non-blocking for P0′–P3′: run as CFP4 parallel, continue Day cycling.

Update state on Night′ trigger: `"vak.night_triggered": true, "vak.night_positions": ["P2′", "P3′"]`

## State

```json
{
  "mode": "tdd",
  "active": true,
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf": "(0/1/2)",
    "agent": "eros",
    "cycle": 1,
    "phase": "RED|GREEN|REFACTOR",
    "cp": "4.1|4.2|4.3",
    "cfp": "CFP0",
    "cs": "CS2",
    "mode": "Day",
    "night_triggered": false
  }
}
```

## Completion Handoff

On cycle complete (all features RED→GREEN→REFACTOR):
1. Run `vak-evaluate` with CP 4.5 (what was produced?)
2. Invoke `anima-orchestration` → Sophia `(5/0)` for closure
3. Or: invoke `ultraqa` for verification before completion

## External Model Consultation (Optional)

Consult Codex/Mythos for test strategy validation when:
- Complex domain logic requiring comprehensive coverage
- Edge case identification for critical paths
- Test architecture for large features

Protocol:
1. Form your OWN test strategy first
2. Consult for validation — cross-check coverage strategy
3. Critically evaluate — never blindly adopt suggestions
4. Graceful fallback — never block if tools unavailable
