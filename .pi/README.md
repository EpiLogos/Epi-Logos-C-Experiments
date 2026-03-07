# PI Agent Foundation

This directory is the repo-native PI surface for Epi-Logos.
It is the source of truth that `epi agent` syncs into each managed PI agent directory under `~/.epi/agents/<agent-id>/agent`.

## What lives here

- `composite-entry.ts`: curated PI entrypoint that composes the repo extension set.
- `extensions/`: repo-owned PI extensions that are copied into each managed agent.
- `prompts/`: system and help prompts passed into managed PI sessions.
- `agents/`: shared agent topology and team definitions used by the foundation.

## Managed runtime layout

`epi agent install` prepares a managed runtime with this shape:

```text
~/.epi/
  agents/
    <agent-id>/
      agent/
        auth-profiles.json
        models.json
        composite-entry.ts
        prompts/
        extensions/
        extensions-sync-state.json
```

The repo `.pi` tree is never edited in place by PI. Instead, `epi agent extensions sync` copies this directory into the selected managed agent and records the sync hash in `extensions-sync-state.json`.

## Primary commands

Use the `epi` CLI as the control plane:

```bash
epi agent install --agent main
epi agent doctor --json
epi agent extensions sync --agent main
epi agent agents add anima
epi agent models add-provider kimi --agent main
epi agent auth set glm --api-key "$GLM_API_KEY" --agent main
epi agent spawn --agent main
```

## Operational notes

- `epi agent doctor --json` reports whether the repo foundation is complete, whether the `pi` binary is available locally, and whether the selected managed agent has synced extensions, models, and auth profiles.
- `epi agent spawn`, `attach`, and `run` always sync the repo `.pi` assets first, then launch `pi` with `PI_CODING_AGENT_DIR`, `EPI_AGENT_DIR`, and `EPI_AGENT_PROMPTS_DIR` pointed at the managed agent directory.
- Provider configuration currently supports `kimi`, `minimax`, and `glm`.

Treat this directory as production runtime configuration. Changes here should be reviewed the same way we review CLI code, because every managed PI agent inherits these assets.
