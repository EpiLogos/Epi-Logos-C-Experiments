# PI Agent Layer (S4')

This document lives under `docs/dev/S3` by request, but it describes the **current S4/S4' PI agent layer** as implemented on `main` on **2026-03-07**.

It is intended to be a versioned implementation-state document, not a speculative design note.

---

## Status

**Current state:** merged into `main`, implemented, tested at the `epi-cli` layer.

**Primary surfaces:**
- `epi agent` in Rust under `epi-cli/src/agent/`
- repo-native PI runtime assets under `.pi/`
- repo-local PI surfaces under `skills/`, `commands/`, and `hooks/`

**External runtime dependency:**
- the `pi` binary is still an external prerequisite; the repo does not vendor it

**Verified on 2026-03-07:**
- `cargo fmt --check`
- `cargo check`
- `cargo test -- --nocapture` in `epi-cli/`

---

## What This Layer Is

The PI agent layer is the repo's managed orchestration surface for PI sessions.

The key architectural choice now implemented is:

1. The repository owns the authoritative PI configuration and extension assets.
2. `epi agent` materializes that repo-owned state into managed per-agent runtime directories.
3. PI sessions are launched against those managed directories rather than against ad hoc local files.

In practice, S4' is no longer just "planned." It now exists as a concrete bridge between:

- repo-owned prompts, extensions, and agent topology in `.pi/`
- managed agent state under `~/.epi/agents/<agent-id>/agent`
- the `pi` executable at runtime
- repo-local operational surfaces in `skills/`, `commands/`, and `hooks/`

---

## Source Of Truth

### Rust CLI

The active command surface is implemented in:

- `epi-cli/src/agent/mod.rs`
- `epi-cli/src/agent/agent_dirs.rs`
- `epi-cli/src/agent/install.rs`
- `epi-cli/src/agent/doctor.rs`
- `epi-cli/src/agent/extensions.rs`
- `epi-cli/src/agent/agents.rs`
- `epi-cli/src/agent/models.rs`
- `epi-cli/src/agent/auth.rs`
- `epi-cli/src/agent/spawn.rs`

### Repo-Native PI Assets

The repo-owned PI layer lives in:

- `.pi/README.md`
- `.pi/composite-entry.ts`
- `.pi/prompts/`
- `.pi/agents/`
- `.pi/extensions/`

### Repo-Local PI Surfaces

The doctor command also treats these as part of the PI agent layer:

- `skills/`
- `commands/`
- `hooks/`

---

## CLI Surface

The current `epi agent` command tree is:

```bash
epi agent install [--agent <id>]
epi agent doctor [--agent <id>] [--json]
epi agent extensions sync|status|list [--agent <id>]
epi agent agents init|add|list|inspect
epi agent models init|add-provider|set-default|status [--agent <id>]
epi agent auth set|status [--agent <id>]
epi agent spawn [--agent <id>] [prompt]
epi agent attach [--agent <id>] <session-id>
epi agent run [--agent <id>] <args...>
```

### What Each Command Owns

**`install`**
- creates the managed agent directory layout
- initializes empty `models.json` and `auth-profiles.json` if missing
- reports whether the external `pi` binary is present

**`doctor`**
- verifies required repo assets
- reports whether `pi` is installed
- reports selected agent directory status
- reports extension sync state
- enumerates repo-local `skills`, `commands`, and `hooks`

**`extensions`**
- copies the repo `.pi/` tree into the selected managed agent directory
- records a source hash in `extensions-sync-state.json`
- reports `synced`, `drifted`, or `not-synced`

**`agents`**
- manages the repo-local registry of named managed agents
- stores registry data under `~/.epi/agents/registry.json`

**`models`**
- manages provider/model definitions in `models.json`
- currently supports `kimi`, `minimax`, and `glm`

**`auth`**
- stores provider API keys in `auth-profiles.json`
- status output is redacted

**`spawn` / `attach` / `run`**
- always sync `.pi/` first
- then launch `pi` against the selected managed agent directory

---

## Managed Runtime Layout

By default, agent state resolves under:

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

### Resolution Rules

The current resolution logic is:

1. If `PI_CODING_AGENT_DIR` or `EPI_AGENT_DIR` is set, that explicit directory wins.
2. Otherwise, the default home is:

```text
$EPI_AGENT_HOME/agents/<agent-id>/agent
```

3. If `EPI_AGENT_HOME` is not set, the default home becomes:

```text
$HOME/.epi/agents/<agent-id>/agent
```

The default agent id is `main`.

---

## Required Repo Assets

The doctor/install logic currently treats the following as required foundation assets:

- `.pi/README.md`
- `.pi/composite-entry.ts`
- `.pi/prompts/epi-system.md`
- `.pi/prompts/epi-agent-help.md`
- `.pi/agents/teams.yaml`
- `.pi/agents/agent-chain.yaml`
- `skills/README.md`
- `commands/README.md`
- `hooks/README.md`
- `hooks/manifest.json`

If any of these are missing, `epi agent doctor --json` reports them explicitly in `missingRepoAssets`.

---

## Current `.pi` Asset Set

### Entrypoint

- `.pi/composite-entry.ts`

This is the curated repo entrypoint that imports the repo extension set.

### Prompts

- `.pi/prompts/epi-system.md`
- `.pi/prompts/epi-agent-help.md`

### Agent Topology

- `.pi/agents/teams.yaml`
- `.pi/agents/agent-chain.yaml`

### Extensions

The current extension set on `main` is:

- `agent-chain.ts`
- `agent-team.ts`
- `child-extension-propagation.ts`
- `cross-agent.ts`
- `epi-citta.ts`
- `prompt-url-widget.ts`
- `redraws.ts`
- `subagent-widget.ts`
- `themeMap.ts`

`epi-citta.ts` is the repo's current Epi bridge extension.

The other files are curated PI extension assets that are now copied into each managed agent during sync.

---

## Provider And Auth State

### Supported Providers

The provider registry currently supports:

- `kimi`
  - provider: `moonshot`
  - api base: `https://api.moonshot.ai/v1`
  - models: `kimi-k2`, `kimi-latest`
- `minimax`
  - provider: `minimax`
  - api base: `https://api.minimax.chat/v1`
  - models: `minimax-m1`
- `glm`
  - provider: `zai`
  - api base: `https://open.bigmodel.cn/api/paas/v4`
  - models: `glm-4.5`

### Storage

- model/provider definitions live in `models.json`
- provider secrets live in `auth-profiles.json`
- auth status is intentionally redacted on read

---

## Spawn Semantics

The current runtime behavior for PI launches is:

1. Resolve the managed agent directory.
2. Sync the repo `.pi/` tree into that managed directory.
3. Invoke `pi` with managed paths and environment.

Current env propagation:

- `PI_CODING_AGENT_DIR`
- `EPI_AGENT_DIR`
- `EPI_AGENT_PROMPTS_DIR`

Current launch behavior:

- `spawn` injects the managed `composite-entry.ts`
- `spawn` also injects `extensions/epi-citta.ts`
- `spawn` passes the managed `prompts/epi-system.md` as the system prompt
- `attach` and `run` also execute through the managed agent directory

This means the repo is already acting as a controlled PI harness rather than as a loose set of prompts.

---

## Repo-Local Operational Surfaces

The PI layer now includes repo-local operational surfaces outside `.pi/`:

### `skills/`

Current repo-local PI skills:

- `skills/epi-cli/SKILL.md`
- `skills/graph/SKILL.md`
- `skills/vault/SKILL.md`

### `commands/`

Current repo-local command docs:

- `commands/core-verify.md`
- `commands/graph-context.md`
- `commands/model-status.md`

### `hooks/`

Current repo-local hooks:

- `hooks/pre-agent-run.sh`
- `hooks/post-agent-run.sh`
- `hooks/pre-epi-command.sh`
- `hooks/post-epi-command.sh`
- `hooks/manifest.json`

These are surfaced by `epi agent doctor --json` and are now part of the repo's declared PI runtime shape.

---

## Testing And Verification State

The merged `main` branch includes real integration coverage for the PI agent layer under:

- `epi-cli/tests/agent_dirs.rs`
- `epi-cli/tests/agent_install.rs`
- `epi-cli/tests/agent_extensions.rs`
- `epi-cli/tests/agent_agents.rs`
- `epi-cli/tests/agent_models.rs`
- `epi-cli/tests/agent_auth.rs`
- `epi-cli/tests/agent_spawn.rs`
- `epi-cli/tests/common/mod.rs`

These tests verify real filesystem behavior and CLI outcomes, not mocked shell-only stubs.

Verified during the 2026-03-07 merge cleanup:

- `cargo fmt --check`
- `cargo check`
- `cargo test -- --nocapture`

---

## Current Gaps

This layer is now real, but it is not finished.

### Implemented Now

- repo-native PI asset tree
- managed per-agent directory layout
- extension sync
- agent registry
- provider/model/auth state
- managed PI spawn/attach/run
- doctor/install surface
- repo-local skill/command/hook inventory

### Not Yet Implemented

- PI-native orchestration through `epi techne wt ...`
- PI-native multi-agent workspace/window control through `epi techne cmux ...`
- richer repo-authored PI extensions beyond the current curated set
- deeper ta-onta / orchestration semantics in the agent layer
- first-class agent delegation APIs above the current `spawn` / `attach` / `run` surface

### Important Adjacent State

`epi techne` now already exposes direct wrapper commands for:

- `epi techne wt ...`
- `epi techne cmux ...`

Those wrappers are adjacent groundwork, not yet integrated into the PI agent layer itself.

---

## Relationship To Older Docs

`docs/specs/S/S4-S4i-PI-AGENT.md` should now be read carefully as a mixed document:

- parts of it are still useful as architectural intent
- parts of it are stale because they describe the PI layer as merely planned

For implementation state on `main`, this README is the more accurate source.

For repo-native PI runtime details, also see:

- `.pi/README.md`
- `docs/plans/2026-03-06-s4-pi-agent-foundation.md`
- `docs/plans/2026-03-06-epi-skills-system-design.md`

---

## Practical Commands

```bash
# inspect current repo/runtime state
epi agent doctor --json

# initialize managed default agent
epi agent install --agent main

# create another managed agent
epi agent agents add anima

# sync repo-owned PI assets into selected managed agent
epi agent extensions sync --agent main

# register a provider and set auth
epi agent models add-provider kimi --agent main
epi agent auth set glm --api-key "$GLM_API_KEY" --agent main

# launch PI through the managed harness
epi agent spawn --agent main
```

---

## Bottom Line

The PI agent layer is now a live, repo-native managed runtime.

The repository owns:

- the PI extension tree
- the prompts
- the team/chain topology assets
- the repo-local skills/commands/hooks surfaces
- the Rust control plane that syncs and launches managed agents

What it does **not** own yet is the next orchestration tier:

- Worktrunk-mediated execution as an agent skill
- `cmux`-mediated multi-agent workspace/window management

That is the next layer of work, not the current state.
