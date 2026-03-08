---
name: tmux
description: "Terminal multiplexer session management for aletheia-workshop. Port-and-refine from upstream epi-claw tmux skill."
port_type: port-and-refine
ct: CT2
cp: "4.2"
agent_affinity: eros
requires:
  bins: ["tmux"]
  os: ["darwin", "linux"]
---

# tmux — Terminal Multiplexer Skill

Remote-control tmux sessions for interactive CLIs by sending keystrokes and scraping pane output. This is the substrate layer for the aletheia-workshop session where external agents run.

Use tmux only when you need an interactive TTY. Prefer direct execution for non-interactive tasks.

## Socket Convention

Use isolated sockets for session management:

```bash
SOCKET_DIR="${PLEROMA_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/pleroma-tmux-sockets}"
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/pleroma.sock"
SESSION=aletheia-workshop
```

## Quickstart

### Create Session

```bash
tmux -S "$SOCKET" new-session -d -s "$SESSION" -n shell -c "$PROJECT_DIR"
```

After starting a session, always print monitor commands:

```
To monitor:
  tmux -S "$SOCKET" attach -t "$SESSION"
  tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION":0.0 -S -200
```

### Window Management

```bash
# Create a new window
tmux -S "$SOCKET" new-window -t "$SESSION" -n "{window-name}"

# List windows
tmux -S "$SOCKET" list-windows -t "$SESSION"

# Select a window
tmux -S "$SOCKET" select-window -t "$SESSION:{window-name}"
```

### Pane Splitting

```bash
# Horizontal split
tmux -S "$SOCKET" split-window -h -t "$SESSION:{window-name}"

# Vertical split
tmux -S "$SOCKET" split-window -v -t "$SESSION:{window-name}"
```

### Sending Input

```bash
# Send literal text (preferred for safety)
tmux -S "$SOCKET" send-keys -t "$SESSION:{window-name}" -l -- "$cmd"

# Send with Enter
tmux -S "$SOCKET" send-keys -t "$SESSION:{window-name}" "$cmd" Enter

# Send control keys
tmux -S "$SOCKET" send-keys -t "$SESSION:{window-name}" C-c
```

### Capturing Output

```bash
# Capture recent pane history (last 200 lines)
tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION:{window-name}" -S -200

# Capture full pane buffer
tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION:{window-name}" -S -10000
```

## Targeting Panes

- Target format: `session:window.pane` (defaults to `:0.0`).
- Keep names short; avoid spaces.
- Inspect: `tmux -S "$SOCKET" list-sessions`, `tmux -S "$SOCKET" list-panes -a`.

## Finding Sessions

```bash
# List sessions on socket
tmux -S "$SOCKET" list-sessions

# Check if session exists
tmux -S "$SOCKET" has-session -t "$SESSION" 2>/dev/null && echo "Active" || echo "Not running"
```

## Safety Rules

1. **Never run `tmux kill-server`** -- this kills ALL tmux sessions on the socket, including other users' work.
2. **Always check session exists** before sending keys: `tmux -S "$SOCKET" has-session -t "$SESSION" 2>/dev/null`.
3. **Use isolated sockets** -- never use the default tmux socket for workshop sessions.
4. **Prefer `send-keys -l`** (literal mode) over raw `send-keys` to avoid shell injection.
5. **Always verify window exists** before targeting: `tmux -S "$SOCKET" list-windows -t "$SESSION" | grep -q "{window-name}"`.

## Orchestrating Multiple Agents

tmux excels at running multiple coding agents in parallel:

```bash
SOCKET="${TMPDIR:-/tmp}/pleroma-workshop.sock"

# Create sessions for each agent
for i in 1 2 3; do
  tmux -S "$SOCKET" new-window -t aletheia-workshop -n "agent-$i"
done

# Launch agents in different contexts
tmux -S "$SOCKET" send-keys -t aletheia-workshop:agent-1 "claude 'Fix bug X'" Enter
tmux -S "$SOCKET" send-keys -t aletheia-workshop:agent-2 "codex 'Fix bug Y'" Enter

# Poll for completion
for win in agent-1 agent-2; do
  if tmux -S "$SOCKET" capture-pane -p -t "aletheia-workshop:$win" -S -3 | grep -q '\$'; then
    echo "$win: DONE"
  else
    echo "$win: Running..."
  fi
done
```

## Cleanup

```bash
# Kill a specific window
tmux -S "$SOCKET" kill-window -t "$SESSION:{window-name}"

# Kill the session
tmux -S "$SOCKET" kill-session -t "$SESSION"

# Remove all sessions on socket (use with care)
tmux -S "$SOCKET" list-sessions -F '#{session_name}' | xargs -r -n1 tmux -S "$SOCKET" kill-session -t
```

## Wait-for-Text Pattern

Poll a pane for expected output:

```bash
timeout=15
interval=0.5
pattern="\\$"
target="$SESSION:0.0"
elapsed=0

while [ "$(echo "$elapsed < $timeout" | bc)" -eq 1 ]; do
  if tmux -S "$SOCKET" capture-pane -p -t "$target" -S -5 | grep -qE "$pattern"; then
    echo "Pattern found"
    break
  fi
  sleep "$interval"
  elapsed=$(echo "$elapsed + $interval" | bc)
done
```
