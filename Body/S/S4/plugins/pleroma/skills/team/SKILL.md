---
name: team
description: N coordinated agents on shared task list via tmux-based orchestration. Anima CF (4.0/1-4.4/5). CFP1 for decomposed tasks, CFP3 for same-task fusion. VAK frame injected per worker inbox.
---

<VAK_Frame>
CPF: (4.0/1-4.4/5)  CT: CT2,CT4  CP: 4.2
CF: (4.0/1-4.4/5) → Anima  CFP: CFP1|CFP3  CS: CS0 / Day
</VAK_Frame>

# Team Skill — Anima / Parallel Execution

`$team` is the tmux-based parallel execution mode for Pleroma. It starts worker sessions and coordinates them through shared state files. Anima is the coordinator.

**CFP1 P-Thread** (different tasks → N agents) and **CFP3 F-Thread** (same task × N agents → merge) both live in this skill. The mode is decided at the pre-context intake gate.

This skill is operationally sensitive. Treat it as an operator workflow, not a generic prompt pattern.

## Team vs Native Subagents

- Use **native subagents** for bounded, in-session parallelism with a few independent subtasks
- Use **`$team`** when you need durable workers, shared task state, mailbox coordination, worktrees, or long-running execution

## CFP1 vs CFP3 Decision

**Resolved at pre-context intake gate:**

| Task Structure | CFP | Thread |
|----------------|-----|--------|
| Work decomposes into N distinct sub-tasks (each worker does different work) | CFP1 | P-Thread |
| N agents pursue the same goal independently (different approaches or verification) | CFP3 | F-Thread |

**CFP1 P-Thread:** Each worker receives a unique CF frame in their inbox.md reflecting their sub-task.
**CFP3 F-Thread:** All workers share the same CF frame; Anima aggregates results.

## Pre-context Intake Gate

Before launching `$team`:
1. Derive task slug
2. Reuse latest snapshot in `.omx/context/{slug}-*.md` when available
3. If none: create `.omx/context/{slug}-{timestamp}.md`
4. **CFP decision:** Analyze task structure → determine CFP1 or CFP3
5. If ambiguity high → run `explore` for brownfield facts, then `$deep-interview --quick <task>`

## Invocation Contract

```bash
omx team [N:agent-type] "<task description>"
```

Examples:
```bash
omx team 3:executor "analyze feature X and report flaws"   # CFP1 — different sub-tasks
omx team 2:executor "implement feature X"                  # CFP3 — same goal, 2 agents
```

## State

```json
{
  "mode": "team",
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

## Worker Inbox VAK Frame

Each worker's `inbox.md` receives a VAK frame block at the top:

**CFP1 (per-worker unique frame):**
```
VAK Frame: team/{task}/worker-{n}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.2
CF: (4.0/1-4.4/5) → Anima  CFP: CFP1 (P-Thread)
Sub-task: [specific task for this worker]
```

**CFP3 (shared frame):**
```
VAK Frame: team/{task}/worker-{n}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.2
CF: (4.0/1-4.4/5) → Anima  CFP: CFP3 (F-Thread — fusion)
Goal: [shared goal — pursue independently, Anima aggregates]
```

## Required Lifecycle

1. Start team and verify startup evidence (team line, tmux target, panes, ACK mailbox)
2. Monitor progress with runtime tools (`omx team status <team>`, mailbox/state files)
3. Wait for terminal task state: `pending=0, in_progress=0, failed=0`
4. Run `omx team shutdown <team>` only after terminal completion
5. Verify shutdown evidence and state cleanup

## Operational Commands

```bash
omx team status <team-name>
omx team resume <team-name>
omx team shutdown <team-name>
```

## Message Dispatch Policy (CLI-first, state-first)

- **MUST NOT** use `tmux send-keys` as primary mechanism to deliver instructions
- **MUST** prefer `omx team api ...` for machine-readable mutation/reads
- Verify delivery via mailbox/state evidence before claiming delivery

## Worker Commit Protocol

After completing task work, workers MUST commit:
```bash
git add -A && git commit -m "task: <task-subject>"
```

## Aggregate Output Format

Team result includes VAK block:
```
VAK: team/{task-name}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.2→4.5
CF: (4.0/1-4.4/5) → Anima  CFP: CFP[1|3]  CS: CS0 / Day
Workers: {N} | Thread: [P-Thread|F-Thread]
```

CFP3 result includes Anima's synthesis of all worker outputs.

## Claude Teammates (v0.6.0+)

```bash
OMX_TEAM_WORKER_CLI=claude omx team 2:executor "task"
```

## MCP Job Lifecycle Tools (Programmatic)

| Tool | Description |
|------|-------------|
| `omx_run_team_start` | Spawn workers; returns `jobId` |
| `omx_run_team_status` | Non-blocking status check |
| `omx_run_team_wait` | Block until job completes |
| `omx_run_team_cleanup` | Kill worker panes (early stop only) |
