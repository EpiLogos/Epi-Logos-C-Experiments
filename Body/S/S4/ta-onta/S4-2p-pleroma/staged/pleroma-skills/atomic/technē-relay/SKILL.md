---
name: "techn\u0113-relay"
description: "Retrieve results from workshop windows. Capture modes: stdout, file, auto-detect. Timeout handling, status branches. Returns structured output with elapsed time and capture method. True port from upstream."
port_type: true-port
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-relay

**Type:** Atomic skill (CT2 Operational, CP 4.2)
**Agent Affinity:** Eros -- operative exchange, chreia mode

## Purpose

The `techne-relay` skill retrieves output from an agent window spawned by `techne-spawn`. It captures the agent's result (stdout or shared file) and returns it to the calling skill for further processing.

**Relay pattern:** After agent completes -> retrieve output -> return to caller

## Invocation

```bash
techne-relay --window-name <name> [--timeout <ms>] [--output-mode <mode>]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--window-name` | Yes | -- | Window name in aletheia-workshop |
| `--timeout` | No | `30000` | Max wait time in milliseconds (30s default) |
| `--output-mode` | No | `stdout` | Capture mode: `stdout`, `file`, or `auto` |

## Output Modes

### stdout Mode (default)

Capture agent's stdout from the tmux pane buffer:

```bash
tmux capture-pane -t aletheia-workshop:{window-name} -p -S -10000
```

Returns the last 10,000 lines of output.

### file Mode

Read from a shared file path written by the agent:

```bash
cat /tmp/aletheia-workshop/{window-name}/result.json
```

### auto Mode

Try file first, fall back to stdout:

```bash
if [ -f "/tmp/aletheia-workshop/{window-name}/result.json" ]; then
  cat /tmp/aletheia-workshop/{window-name}/result.json
else
  tmux capture-pane -t aletheia-workshop:{window-name} -p -S -10000
fi
```

## Wait-for-Completion Logic

Before retrieving output, check if agent has completed:

```bash
max_attempts=$((timeout / 500))
attempt=0

while [ $attempt -lt $max_attempts ]; do
  status=$(tmux list-windows -t aletheia-workshop -F "#{window_name}: #{window_status}" | \
           grep "^{window-name}:" | cut -d' ' -f2)

  if [ "$status" = "waiting" ] || [ "$status" = "dead" ]; then
    break
  fi

  sleep 0.5
  attempt=$((attempt + 1))
done
```

## Return Values

### Success (agent completed)

```json
{
  "status": "completed",
  "windowName": "{window-name}",
  "output": "{captured-output-string}",
  "outputMode": "{stdout|file}",
  "exitCode": 0,
  "elapsed": 12345
}
```

### Partial (timeout reached)

```json
{
  "status": "partial",
  "windowName": "{window-name}",
  "output": "{captured-output-string}",
  "outputMode": "{stdout|file}",
  "warning": "Agent still running after timeout",
  "elapsed": 30000
}
```

### Error (window not found)

```json
{
  "status": "error",
  "windowName": "{window-name}",
  "error": "Window not found in aletheia-workshop",
  "suggestion": "Verify window was spawned successfully via techne-spawn"
}
```

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `window_not_found` | Window doesn't exist | Return error with suggestion |
| `timeout_exceeded` | Agent still running | Return partial output with warning |
| `empty_output` | No output captured | Return empty string with status "completed" |
| `file_read_error` | Shared file unreadable | Fall back to stdout mode |

## Workflow Integration

```bash
# 1. Spawn agent
spawn_result=$(techne-spawn --agent claude-code --task "...")
window_name=$(echo $spawn_result | jq -r '.windowName')

# 2. Wait for completion and retrieve output
relay_result=$(techne-relay --window-name $window_name --timeout 60000)
agent_output=$(echo $relay_result | jq -r '.output')

# 3. Process output
echo "Agent result: $agent_output"

# 4. Close session with commit
techne-close --window-name $window_name --commit-message "Complete"
```

## Constraints

- Window must exist: Relay fails if window was never spawned or already closed
- Timeout enforcement: Max wait is 300 seconds (5 minutes)
- Output size limit: stdout mode captures last 10,000 lines -- use file mode for larger results
- No automatic commit: Relay retrieves output but does NOT commit to OneContext -- use `techne-close`
