---
name: writing-plans
description: Produce implementation plans with explicit VAK topology headers and task-by-task test-first execution guidance.
---

## VAK Integration Block (Ta Onta extension)

**CF Code:** `(0/1)`
**CS State:** Day planning, with Night' verification hooks noted for closure work
**CPF Mode:** `(00/00)` when planning with the user, `(4.0/1-4.4/5)` when preparing autonomous execution

# Writing Plans with VAK

1. Start every plan with a VAK header summarizing CPF, CT, CP, CF, CFP, and CS assumptions.
2. Break work into bite-sized test-first tasks.
3. Name exact files to create or modify.
4. Include concrete verification commands and expected outcomes.
5. Keep upstream obra-superpowers discipline: DRY, YAGNI, TDD, and explicit checkpoints.

## Required Header Addition

```markdown
**VAK Topology:** CPF=(xx/xx) | CT=CT[n] | CP=4.[n] | CF=([code]) -> [Agent] | CFP=CFP[n] | CS=CS[n]
```

## Output Format

```text
VAK: [task-short-name]
CPF: (xx/xx)  CT: CT[n]  CP: 4.[n]
CF: ([code]) -> [Agent]  CFP: CFP[n]  CS: CS[n] / Day
```
