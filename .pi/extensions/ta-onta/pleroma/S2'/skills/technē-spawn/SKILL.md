---
name: "techn\u0113-spawn"
description: "Launch external CLI coding agent in aletheia-workshop tmux session. Invokes pleroma-skill-proxy first, then sets OneContext context, then opens tmux window via tmux new-window. Returns window handle for relay/close. True port from upstream."
port_type: true-port
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# techne-spawn

**Type:** Atomic skill (CT2 Operational, CP 4.2)
**Agent Affinity:** Eros -- operative exchange, chreia mode

## Purpose

The `techne-spawn` skill launches external CLI coding agents (gemini-cli, claude-code, codex) in the aletheia-workshop tmux session. Each spawned agent becomes a **constitutional progeny** -- sharing canonical SKILL.md files, carrying CF identity, and captured by OneContext for Night' extraction.

**Spawn sequence:** pleroma-skill-proxy -> OneContext context -> mprocs window launch -> return window handle

## Invocation

```bash
techne-spawn --agent <type> --task "<task-string>" [--cf-identity <CF-code>] [--window-name <name>]
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--agent` | Yes | CLI provider: `gemini-cli`, `claude-code`, or `codex` |
| `--task` | Yes | Task description for the agent (quoted string) |
| `--cf-identity` | No | CF code for constitutional role (e.g., `(0/1/2)` for Eros, `(0000)` for Nous) |
| `--window-name` | No | Window name (default: `{agent-type}-{task-slug}`) |

## Spawn Sequence

### 1. Invoke pleroma-skill-proxy

Configure the agent with canonical skill files and CF identity:

```bash
pleroma-skill-proxy --agent-type <agent-type> --cf-identity <CF-code> --window-name <window-name>
```

Returns JSON confirmation with status, provider, cfIdentity, sessionRegistration, skillPath.

### 2. Set OneContext Context

```bash
export ONECONTEXT_PROJECT=epi-logos
export ONECONTEXT_WATCHER=true
export ONECONTEXT_DB_PATH="$PWD/.onecontext"
```

All spawned agents share the same OneContext project db for cross-session retrieval.

### 3. Check Process Budget

```bash
ALETHEIA_WORKSHOP_MAX_WINDOWS=${ALETHEIA_WORKSHOP_MAX_WINDOWS:-5}
current_windows=$(tmux list-windows -t aletheia-workshop 2>/dev/null | wc -l)

if [ $current_windows -ge $ALETHEIA_WORKSHOP_MAX_WINDOWS ]; then
  echo "{\"status\":\"budget-ceiling-reached\",\"current\":$current_windows,\"ceiling\":$ALETHEIA_WORKSHOP_MAX_WINDOWS}"
  exit 1
fi
```

### 4. Launch Agent via tmux

```bash
# Create window
tmux new-window -t aletheia-workshop -n "{window-name}"

# Set CF_IDENTITY environment variable
tmux set-environment -t aletheia-workshop:{window-name} CF_IDENTITY "{cf-identity}"

# Start agent with task
tmux send-keys -t aletheia-workshop:{window-name} "{agent-command} {task}" Enter
```

### 5. Return Window Handle

```json
{
  "status": "spawned",
  "windowName": "{window-name}",
  "agentType": "{agent-type}",
  "cfIdentity": "{cf-identity}",
  "taskId": "{generated-task-id}",
  "sessionKey": "{onecontext-session-id}"
}
```

### Budget Ceiling Reached

```json
{
  "status": "budget-ceiling-reached",
  "current": 5,
  "ceiling": 5
}
```

## Agent Commands

| Provider | Command | Notes |
|----------|---------|-------|
| `claude-code` | `claude` | Uses Claude Code CLI |
| `gemini-cli` | `gemini-cli` | Uses Gemini CLI |
| `codex` | `codex` | Uses OpenAI Codex CLI |

## Window Naming Convention

```
{agent-type}-{task-slug}
```

- `agent-type`: `claude`, `gemini`, `codex`
- `task-slug`: URL-safe slug derived from task string (max 30 chars)

Examples:
- `claude-eros-verify` -- Claude Code running Eros verification
- `gemini-khora-classify` -- Gemini CLI classifying Khora content
- `codex-s2-infra` -- Codex working on S2 infrastructure

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `workshop_not_running` | `tmux has-session -t aletheia-workshop` fails | Start workshop: `tmux new-session -d -s aletheia-workshop` |
| `skill_proxy_failed` | pleroma-skill-proxy returns non-zero | Abort spawn -- agent not properly configured |
| `budget-ceiling-reached` | Window count >= MAX_WINDOWS | Return status; queue work or request budget extension |
| `invalid_window_name` | Name doesn't match convention | Reject and require valid name |
| `onecontext_missing` | ONECONTEXT_PROJECT not set | Configure OneContext first |

## Graceful Degradation

If OneContext is unavailable:
- Log warning: "OneContext unavailable -- spawning without session capture"
- Proceed with spawn (agent runs, but no Night' extraction possible)
- Session history NOT captured -- Night' Atropos cannot read summary

## Example Invocations

**Spawn Claude Code as Eros for verification:**
```bash
techne-spawn \
  --agent claude-code \
  --task "Verify Khora module session contracts per test-driven-development" \
  --cf-identity "(0/1/2)" \
  --window-name "claude-eros-verify"
```

**Spawn Gemini CLI as Nous for fresh perspective:**
```bash
techne-spawn \
  --agent gemini-cli \
  --task "Surface assumptions in this implementation: what don't we know?" \
  --cf-identity "(0000)" \
  --window-name "gemini-nous-clear"
```

**Spawn Codex for pattern recognition (default CF):**
```bash
techne-spawn \
  --agent codex \
  --task "Identify repeating patterns in error logs"
```
