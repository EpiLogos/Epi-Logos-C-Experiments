---
name: dispatching-parallel-agents
description: Coordinate independent parallel work and fusion-style parallel work with explicit CFP1 versus CFP3 distinction.
---

## VAK Integration Block (Ta Onta extension)

**CF Code:** `(4.0/1-4.4/5)`
**CS State:** Day by default; fusion results may feed Night' synthesis
**CPF Mode:** `(4.0/1-4.4/5)`

# Dispatching Parallel Agents with VAK

1. Use `CFP1` when the tasks are independent and can complete without shared state.
2. Use `CFP3` when one task should be attempted by multiple agents and aggregated by Agora.
3. Assign each parallel worker a clear CF/CT/CP frame.
4. Reconcile outputs explicitly rather than assuming parallelism implies agreement.
5. Feed aggregation results back to Psyche/Agora with a full VAK block.

## Output Format

```text
VAK: [task-short-name]
CPF: (4.0/1-4.4/5)  CT: CT2,CT4  CP: 4.4
CF: ((4.0/1-4.4/5)) -> Psyche  CFP: CFP1 or CFP3  CS: CS[n] / Day
```
