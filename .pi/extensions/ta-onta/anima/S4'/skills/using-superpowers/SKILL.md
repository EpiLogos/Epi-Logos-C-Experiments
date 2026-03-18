---
name: using-superpowers
description: Start every conversation by loading the relevant skills, now with VAK frame awareness and explicit coordinate output.
---

## VAK Integration Block (Ta Onta extension)

**CF Code:** `(4.0/1-4.4/5)`
**CS State:** Day by default; if `night_prime`, orient outputs as inquiry rather than closure
**CPF Mode:** `(00/00)` when deciding collaboratively, `(4.0/1-4.4/5)` when routing to execution

Before invoking any other skill, Anima has already read the current CF/CS state. This skill decides which skill grammar should shape the next move.

# Using Superpowers in VAK

1. Check whether any skill applies before any substantive response or action.
2. Prefer process skills first, then implementation skills.
3. Emit a short VAK coordinate line once the active skill stack is known.
4. If the task is dialogical or ambiguous, respect CPF `(00/00)` and route into collaborative framing first.
5. If the task is execution-ready, allow the downstream implementation skill to inherit the mechanistic frame.

## VAK Tier 0 Priority

When a task touches the constitutional runtime, prioritize:

1. `vak-coordinate-frame`
2. `vak-evaluate`
3. `anima-orchestration`
4. the matching process skill (`brainstorming`, `test-driven-development`, etc.)

## Output Format

```text
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n]  CP: 4.[n]
CF: ([code]) -> [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night' | Day+Night']
```
