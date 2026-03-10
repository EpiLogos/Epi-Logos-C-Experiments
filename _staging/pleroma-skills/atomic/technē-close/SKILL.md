---
name: "techn\u0113-close"
description: "Gracefully close workshop windows. Commit OneContext milestones, capture final output. Graceful and force branches. Summary handoff for Night' extraction. True port from upstream."
port_type: true-port
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-close

**Type:** Atomic skill (CT2 Operational, CP 4.2)
**Agent Affinity:** Eros -- operative exchange, chreia mode

## Purpose

Gracefully shut down an agent window spawned by `techne-spawn`. Signals completion, runs `oc_commit` to persist the session milestone, captures final state, and closes the window.

**Close sequence:** Signal completion -> oc_commit -> capture final state -> kill window

## Invocation

```bash
techne-close --window-name <name> [--commit-message <msg>] [--force] [--skip-commit]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--window-name` | Yes | -- | Window name in aletheia-workshop |
| `--commit-message` | No | `"{window-name} session complete"` | Milestone message for oc_commit |
| `--force` | No | `false` | Force close without waiting for graceful shutdown |
| `--skip-commit` | No | `false` | Skip oc_commit (use when already committed) |

## Close Sequence

### 1. Verify Window Exists

```bash
tmux list-windows -t aletheia-workshop | grep -q "{window-name}"
```

### 2. Check Agent Status

Determine if agent is still running. If active and not force-closing, wait for graceful completion.

### 3. Signal Completion

```bash
# Send Ctrl+C to gracefully stop the agent
tmux send-keys -t aletheia-workshop:{window-name} C-c

# Wait up to 5 seconds for agent to stop
sleep 5
```

### 4. Run oc_commit

```bash
if [ "$skip_commit" != "true" ]; then
  msg="${commit_message:-${window-name} session complete}"
  oc_commit "$msg"
fi
```

### 5. Capture Final State

```bash
final_output=$(tmux capture-pane -t aletheia-workshop:{window-name} -p -S -1000)
echo "$final_output" > /tmp/aletheia-workshop/{window-name}/final-output.txt
```

### 6. Close Window

```bash
tmux kill-window -t aletheia-workshop:{window-name}
```

### 7. Return Confirmation

```json
{
  "status": "closed",
  "windowName": "{window-name}",
  "commitMessage": "{commit-message}",
  "ocCommitSuccess": true,
  "finalOutputLines": 123,
  "elapsed": 45678
}
```

## Graceful vs Force Shutdown

**Graceful (default):**
1. Send Ctrl+C
2. Wait 5 seconds for clean exit
3. If still running, force kill

**Force (`--force`):**
1. Send Ctrl+C immediately
2. Wait 2 seconds max
3. Kill window

## OneContext Integration

```
Agent completes -> oc_commit(milestone) -> OneContext auto-summary
                                                    |
                                         Night' Atropos reads summary
                                                    |
                                         P5' Insight -> Mobius return
```

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `window_not_found` | Window doesn't exist | Return error |
| `commit_failed` | oc_commit fails | Log error, continue with close |
| `force_close_failed` | Window won't die | Log error |
| `final_output_missing` | No output captured | Log warning, continue |

## Example Invocations

**Normal close with default commit message:**
```bash
techne-close --window-name claude-eros-verify
```

**Close with custom commit message:**
```bash
techne-close \
  --window-name gemini-nous-clear \
  --commit-message "Nous fresh perspective complete: assumptions surfaced"
```

**Force close hung agent:**
```bash
techne-close --window-name codex-s2-infra --force
```

## Constraints

- Window must exist
- Graceful timeout: 5 seconds max
- OneContext dependency: oc_commit requires watcher
- No automatic relay: use `techne-relay` first
