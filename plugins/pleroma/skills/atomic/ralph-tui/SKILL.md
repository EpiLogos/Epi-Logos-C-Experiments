---
name: ralph-tui
description: "Task orchestration TUI. PRD creation, interactive/headless execution, checkpoint management, iteration tracking. Port-and-refine from upstream ouroboros/ralph references."
port_type: port-and-refine
ct: CT2, CT4
cp: "4.2"
agent_affinity: psyche
---

# ralph-tui -- Task Orchestration TUI

Ralph is the task orchestration interface for structured, multi-phase development work. It combines PRD (Product Requirements Document) creation with execution tracking, checkpoint management, and iteration cycles.

The Ralph Loop is an L-Thread (CFP4): high-autonomy, long-duration execution with self-validation via stop hooks.

## Commands

### create-prd

Create a structured PRD for a development task:

```bash
ralph-tui create-prd --title "<title>" --scope "<scope-description>" [--template <template>]
```

#### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--title` | Yes | -- | PRD title |
| `--scope` | Yes | -- | Scope description |
| `--template` | No | `standard` | PRD template: `standard`, `minimal`, `comprehensive` |

#### Output

Creates a structured PRD file at `./plans/{date}-{slug}.md` with:
- Problem statement
- Success criteria
- Implementation phases
- Checkpoint definitions
- Iteration budget

### run

Execute a PRD with checkpoint tracking:

```bash
ralph-tui run --prd <path> [--mode interactive|headless] [--max-iterations <n>]
```

#### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--prd` | Yes | -- | Path to PRD file |
| `--mode` | No | `interactive` | Execution mode |
| `--max-iterations` | No | `10` | Maximum iteration count |

#### Interactive Mode

In interactive mode, Ralph pauses at each checkpoint for review:

1. Execute current phase
2. Run phase validation checks
3. Present checkpoint summary
4. Wait for approval to proceed
5. Record checkpoint result

#### Headless Mode

In headless mode, Ralph runs continuously with self-validation:

1. Execute current phase
2. Run phase validation checks
3. If validation passes: proceed to next phase
4. If validation fails: record failure, attempt retry (up to 3)
5. If retries exhausted: pause and request human review

### checkpoint

Manage checkpoints within a running execution:

```bash
ralph-tui checkpoint --prd <path> --action <list|save|restore>
```

- `list`: Show all checkpoints with status
- `save`: Save current state as named checkpoint
- `restore`: Restore to a previous checkpoint

### iterate

Track iteration count and budget:

```bash
ralph-tui iterate --prd <path> --action <status|increment|reset>
```

- `status`: Show current iteration count vs budget
- `increment`: Record a new iteration
- `reset`: Reset iteration counter (requires confirmation)

## Checkpoint Structure

Each checkpoint records:

```json
{
  "id": "cp-001",
  "phase": "Phase 1: Foundation",
  "timestamp": "2026-03-08T10:30:00Z",
  "status": "passed",
  "validationResults": [
    {"check": "tests-pass", "result": true},
    {"check": "no-regressions", "result": true}
  ],
  "artifacts": ["src/auth.rs", "tests/auth_test.rs"],
  "notes": "Auth module foundation complete"
}
```

## Iteration Tracking

The iteration budget prevents runaway execution:

| Budget | Use Case |
|--------|----------|
| 3 | Simple bug fixes |
| 5 | Standard feature development |
| 10 | Complex multi-phase work |
| 20 | Architecture refactoring |

When iteration budget is exceeded, execution pauses with a summary of all iterations and a recommendation.

## Integration with VAK

Ralph maps to the VAK coordinate system:

- **CFP4 L-Thread**: Ralph is the canonical L-Thread executor
- **CS0 Full Traverse**: Comprehensive PRDs use CS0 sequencing
- **Day+Night'**: Each iteration can include a Night' pass for validation

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `prd_not_found` | PRD file does not exist | Fail with path suggestion |
| `checkpoint_corrupt` | Checkpoint data unreadable | Skip checkpoint, log warning |
| `budget_exceeded` | Iteration count exceeds budget | Pause execution, request review |
| `validation_failed` | Phase validation checks fail | Retry up to 3 times, then pause |
