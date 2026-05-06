---
name: mprocs
description: "Multi-process workshop manager for aletheia-workshop. Manages agent windows, process registration, status monitoring, and output capture. Port-and-refine from upstream epi-claw mprocs skill."
port_type: port-and-refine
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# mprocs -- Multi-Process Workshop Manager

Manage agent windows in the aletheia-workshop tmux session. Project dir as cwd, environment variables pre-loaded, OneContext watcher active. Invoked by techne-spawn and techne-close; not for direct agent use.

## When to Invoke

- Via `techne-spawn` before launching an external agent window
- Via `techne-list` to query active window status
- Via `techne-relay` to pull results from a window
- Via `techne-close` to shutdown a window and commit session

## aletheia-workshop Session

The workshop is a named tmux session that persists across invocations. It is the single place where external agent processes live.

### Start the Workshop Session

If the workshop is not running, start it with:

```bash
tmux new-session -d -s aletheia-workshop -c "$PROJECT_DIR"
tmux set-environment -t aletheia-workshop ONECONTEXT_PROJECT "epi-logos"
tmux set-environment -t aletheia-workshop ONECONTEXT_WATCHER "true"
```

### Verify Workshop is Running

```bash
tmux has-session -t aletheia-workshop 2>/dev/null && echo "Workshop active" || echo "Workshop not running"
```

### Attach to Workshop (Manual Debugging)

```bash
tmux attach-session -t aletheia-workshop
```

Detach with `Ctrl+b` then `d`.

## Window Naming Convention

All windows in aletheia-workshop follow this pattern:

```
{agent-type}-{task-slug}
```

Examples:
- `gemini-khora-classify` -- Gemini CLI agent classifying Khora content
- `claude-eros-verify` -- Claude Code agent running Eros verification
- `codex-s2-infra` -- Codex agent working on S2 infrastructure

Valid agent-type prefixes: `gemini`, `claude`, `codex`.

## Adding Windows

```bash
tmux new-window -t aletheia-workshop -n "{window-name}"
tmux send-keys -t aletheia-workshop:{window-name} "{agent-command}" Enter
```

The window name must follow the `{agent-type}-{task-slug}` convention.

## Querying Window Status

```bash
tmux list-windows -t aletheia-workshop -F "#{window_name}: #{window_status} #{pane_pid}"
```

Returns format:
```
gemini-khora-classify: active 12345
claude-eros-verify: waiting 12346
```

Status values:
- `active` -- process is running
- `waiting` -- process completed, awaiting output retrieval
- `dead` -- process exited

## Removing Windows

```bash
tmux kill-window -t aletheia-workshop:{window-name}
```

Graceful shutdown via `techne-close` will:
1. Signal completion to the agent
2. Capture final state via OneContext
3. Run `oc_commit` with milestone message
4. Kill the window

## mprocs Config

When using mprocs to manage workshop windows (the preferred method):

### mprocs.yaml

```yaml
cwd: ${PROJECT_DIR}
env:
  ONECONTEXT_PROJECT: epi-logos
  ONECONTEXT_WATCHER: "true"

procs:
  - name: gemini-example
    command: gemini-cli
    args: ["--task", "example"]
    env:
      CF_IDENTITY: "(0/1/2)"

  - name: claude-example
    command: claude
    args: ["--task", "example"]
    env:
      CF_IDENTITY: "(0/1/2)"
```

### Starting mprocs in Workshop Mode

```bash
mprocs -c plugins/pleroma/skills/atomic/mprocs/mprocs.yaml --server 127.0.0.1:4050
```

The `--server` flag enables the control server for techne skills to interact programmatically.

## Window Health Check

```bash
tmux run-shell -t aletheia-workshop:{window-name} 'echo ok'
```

## Process Budget

Budget is configured via `ALETHEIA_WORKSHOP_MAX_WINDOWS` (default: 5):

```bash
ALETHEIA_WORKSHOP_MAX_WINDOWS=${ALETHEIA_WORKSHOP_MAX_WINDOWS:-5}
current_windows=$(tmux list-windows -t aletheia-workshop 2>/dev/null | wc -l)

if [ $current_windows -ge $ALETHEIA_WORKSHOP_MAX_WINDOWS ]; then
  echo "{\"status\":\"budget-ceiling-reached\",\"current\":$current_windows,\"ceiling\":$ALETHEIA_WORKSHOP_MAX_WINDOWS}"
  exit 1
fi
```

## Constraints

- All agent windows must follow the `{agent-type}-{task-slug}` naming convention
- Do NOT exceed `ALETHEIA_WORKSHOP_MAX_WINDOWS` without approval
- OneContext watcher must be active for all spawned agents
- cwd is always the project dir -- never spawn agents in arbitrary directories
- Graceful shutdown via `techne-close` is required -- do NOT kill windows directly without committing
