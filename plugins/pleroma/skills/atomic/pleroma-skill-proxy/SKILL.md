---
name: pleroma-skill-proxy
description: "Configure external CLI coding agent to use canonical skill files and constitutional CF identity. Supports claude-code, gemini-cli, codex via provider-specific config forks. True port from upstream."
port_type: true-port
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# pleroma-skill-proxy

**Type:** Atomic skill (CT2 Operational, CP 4.2)
**Agent Affinity:** Eros -- operative exchange, chreia mode

## Purpose

The `pleroma-skill-proxy` skill configures external CLI coding agents (claude-code, gemini-cli, codex) to become **constitutional progeny** of the system. By sharing canonical SKILL.md files and carrying CF constitutional identity, spawned external agents participate in the same skill grammar, Day/Night' topology, and VAK coordinate system as internal agents.

**The internal/external agent distinction collapses at the skill layer.**

## Invocation

```bash
pleroma-skill-proxy --agent-type <type> [--cf-identity <CF-code>] [--window-name <name>]
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--agent-type` | Yes | Provider: `claude-code`, `gemini-cli`, or `codex` |
| `--cf-identity` | No | CF code for constitutional role (e.g., `(0/1/2)` for Eros) |
| `--window-name` | No | Window name for mprocs session registration |

## Provider-Specific Configuration Forks

### claude-code

1. **Symlink skills directory:**
   ```bash
   ln -sf $PWD/plugins/pleroma/skills/* ~/.claude/skills/
   ```

2. **Inject CF identity into session CLAUDE.md:**
   ```bash
   echo "CF_IDENTITY=(0/1/2)" >> ~/.claude/session/CLAUDE.md
   ```

### gemini-cli

1. **Write skill loader config:**
   ```bash
   cat > ~/.gemini/skills.json <<EOF
   {
     "skillPaths": [
       "$PWD/plugins/pleroma/skills"
     ]
   }
   EOF
   ```

2. **Set CF_IDENTITY env var:**
   ```bash
   export CF_IDENTITY="(0/1/2)"
   ```

### codex

1. **Write Codex skill config:**
   ```bash
   cat > ~/.codex/skills.json <<EOF
   {
     "skillDirectories": [
       "$PWD/plugins/pleroma/skills"
     ]
   }
   EOF
   ```

2. **Set CF_IDENTITY env var:**
   ```bash
   export CF_IDENTITY="(0/1/2)"
   ```

## OneContext Registration

After provider configuration, register the agent session with OneContext watcher:

```bash
export ONECONTEXT_PROJECT=epi-logos
export ONECONTEXT_WATCHER=true
```

This ensures:
- Session history is captured for Night' extraction
- Conversations feed into the project context db
- Atropos can read committed summaries at Mobius return

## Return Value

```json
{
  "status": "configured",
  "provider": "<agent-type>",
  "cfIdentity": "<CF-code>",
  "sessionRegistration": "<onecontext-session-id>",
  "skillPath": "<canonical-skills-location>"
}
```

## Constitutional Progeny Principle

Spawned external agents are **progeny**, not subcontractors:

1. **Share canonical SKILL.md files** -- symlinked or config-referenced, not copied
2. **Carry CF identity** -- `CF_IDENTITY` env var sets constitutional role at spawn
3. **Captured by OneContext watcher** -- session history feeds into Night' extraction
4. **Can spawn further progeny** -- recursive spawning bounded by process budget and project scope

The constitutional system propagates through substrate boundaries. A Claude Code session spawned as Eros runs `test-driven-development` against the canonical SKILL.md. Its output format, VAK coordinate usage, and Night' crystallization pathway are identical to an internal Eros subagent.

## Adding a New Provider Fork

To add support for a new CLI agent:

1. Add decision branch in `--agent-type` switch
2. Document config path convention per provider
3. Register in table above

**Pattern:** Each provider has a unique config mechanism, but all three steps remain: (1) skill path config, (2) CF identity injection, (3) OneContext registration.

## Implementation Notes

- This skill is always called by `techne-spawn` before handing task to agent
- Provider-specific loader paths are resolved at integration time against each CLI tool's actual convention
- The decision fork handles all differences; no per-provider sub-skills needed
- When a new CLI tool is added, a new fork branch is added to this single skill
