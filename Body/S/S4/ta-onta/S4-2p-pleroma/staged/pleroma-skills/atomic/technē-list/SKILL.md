---
name: "techn\u0113-list"
description: "Enumerate workshop windows, statuses, elapsed time, budget. Format/filter options. Returns JSON array of window states. True port from upstream."
port_type: true-port
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-list

**Type:** Atomic skill (CT2 Operational, CP 4.2)
**Agent Affinity:** Eros -- operative exchange, chreia mode

## Purpose

Enumerate all active windows in the aletheia-workshop tmux session. Returns agent type, task slug, elapsed time, and status for each window.

## Invocation

```bash
techne-list [--format <format>] [--filter <status>]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--format` | No | `json` | Output format: `json`, `table`, or `compact` |
| `--filter` | No | `all` | Filter by status: `running`, `waiting`, `complete`, `all` |

## Output Formats

### json Format (default)

```json
{
  "workshop": "aletheia-workshop",
  "totalWindows": 3,
  "budgetLimit": 5,
  "budgetRemaining": 2,
  "windows": [
    {
      "windowName": "claude-eros-verify",
      "agentType": "claude",
      "taskSlug": "eros-verify",
      "status": "running",
      "pid": 12345,
      "elapsed": 12345,
      "elapsedHuman": "12.3s",
      "cfIdentity": "(0/1/2)"
    }
  ]
}
```

### table Format

```
aletheia-workshop (2/5 windows used, 3 remaining)

Window                Agent    Task             Status     Elapsed    CF
---------------------------------------------------------------------
claude-eros-verify    claude   eros-verify      running    12.3s      (0/1/2)
gemini-khora-classify gemini   khora-classify   waiting    45.7s      (0000)
```

### compact Format

```
claude-eros-verify:claude:eros-verify:running:12.3s:(0/1/2)
gemini-khora-classify:gemini:khora-classify:waiting:45.7s:(0000)
```

## Status Values

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `running` | Agent process is active | Wait for completion |
| `waiting` | Agent completed, awaiting retrieval | Use `techne-relay` |
| `complete` | Output retrieved, session committed | Use `techne-close` |
| `unknown` | Window state unclear | Check workshop health |

## Budget Information

```json
{
  "totalWindows": 3,
  "budgetLimit": 5,
  "budgetRemaining": 2,
  "budgetStatus": "available"
}
```

Budget limit from `ALETHEIA_WORKSHOP_MAX_WINDOWS` env var (default: 5).

## CF Identity Detection

```bash
cf_identity=$(tmux show-environment -t aletheia-workshop:{window-name} CF_IDENTITY 2>/dev/null | sed 's/CF_IDENTITY=//')
```

If not set, returns `"unknown"`.

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `workshop_not_running` | `tmux has-session` fails | Return error |
| `no_windows` | Workshop exists but empty | Return empty windows array |
| `query_failed` | `tmux list-windows` fails | Return error with debug output |

## Usage Patterns

### Before Spawn (Budget Check)

```bash
remaining=$(techne-list --format json | jq '.budgetRemaining')
echo "Windows available: $remaining"
```

### Monitoring Active Agents

```bash
techne-list --filter running --format table
```

## Constraints

- Read-only operation: does NOT modify workshop state
- No side effects: safe to call frequently
- Fast operation: completes in <100ms
- Real-time snapshot: reflects state at call time
