# team VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/team/SKILL.md`
**VAK agent:** Anima | CF: `(4.0/1-4.4/5)` | Complexity: HIGH

## 1. Internal Workflow Summary

tmux-based parallel execution. `omx team N:agent-type "task"`.
Worker lifecycle: init state → split panes → launch workers → mailbox coordination → shutdown.
State: `.omx/state/team/{name}/...` — config, manifest, tasks, worker identity, inbox.

## 2. VAK Seam Map

| Component | VAK Mapping |
|-----------|------------|
| Team launch decision | CPF intake gate — CFP1 vs CFP3 decision HERE |
| CFP1 P-Thread | Different tasks → N agents → independent CF frames per worker |
| CFP3 F-Thread | Same task × N agents → shared CF frame → Anima aggregates |
| Worker inbox.md | Contains assigned CF frame for that worker |
| Aggregate result | VAK block from coordinator (Anima) |

**CFP1 vs CFP3 branching trigger** (cross-skill Q2):
- If tasks are decomposed (each worker has a distinct sub-task) → CFP1 P-Thread
- If N workers pursue the same goal in parallel (different approaches / verification) → CFP3 F-Thread
- Decision is made at the pre-context intake gate based on task structure

## 3. Handoff Contract Rewrite

**OMX-native:** `omx team N:agent-type "task"` — workers receive task via inbox.md.

**VAK-native:**
- Pre-launch: run `vak-evaluate` to determine CFP1 vs CFP3
- CFP1: decompose tasks → each worker's inbox.md includes their CF frame
- CFP3: all workers get same CF frame + instructions to pursue independently; Anima aggregates
- Worker inbox.md template gains VAK header block

## 4. State Schema Delta

Add `vak` to team config:
```json
{
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf": "(4.0/1-4.4/5)",
    "agent": "anima",
    "cfp": "CFP1|CFP3",
    "thread_type": "P-Thread|F-Thread",
    "cs": "CS0",
    "mode": "Day"
  }
}
```

Worker inbox.md gains VAK frame block at top.

## 5. Output Format Delta

Team result aggregate gains VAK block:
```
VAK: team/{task-name}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.2
CF: (4.0/1-4.4/5) → Anima  CFP: CFP[1|3]  CS: CS0 / Day
```

Each worker output includes worker-local VAK sub-frame.

## 6. Constitutional Agent Binding

**Owner:** Anima orchestrates. Workers are substrate executors.
CFP1: each worker is independent; CF diverges per task.
CFP3: Anima is the convergence point; all workers report to Anima for synthesis.
Swarm is CFP3 compatibility facade only.

## Cross-skill Q2 Resolution

CFP1 vs CFP3 decided at intake gate:
- Decomposed tasks (distinct work) → CFP1
- Same task × N agents → CFP3
- Intake gate: analyze task structure → if single goal with parallel pursuit → CFP3; else CFP1
