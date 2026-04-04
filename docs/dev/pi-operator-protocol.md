# PI Operator Protocol

**Status:** Compatibility substrate — secondary to claw-rust
**Date:** 2026-04-02 (cutover: 2026-04-04)
**Scope:** `epi agent`, repo-local PI runtime layout, shared gateway preflight, repo-local skill loading, and ta-onta extension launch rules

> **Compatibility note:** PI is now the secondary/compatibility runtime substrate. The default
> `interactiveLaunchMode` reported by `epi agent doctor` and `epi agent install` is `"claw"`.
> PI remains available for explicit compat use while claw parity reaches FULL. See
> `docs/dev/claw-operator-protocol.md` for the primary runtime contract.

---

## Canonical Operator Contract

`epi` is the control plane. `pi` is the operator plane.

That means:

- `epi agent` with no subcommand launches the native `pi` experience directly.
- `epi agent spawn` and `epi agent chat` are interactive aliases over the same native PI launch contract.
- `epi agent run <args...>` forwards real PI flags on top of the managed Epi runtime contract.
- `epi agent attach <session>` re-enters PI interactively.
- Gateway-owned background jobs keep using the captured prompt path; interactive operator entrypoints do not capture stdout/stderr.

There is no custom Epi chat TUI in the operator path anymore. PI owns stdin/stdout/stderr for interactive sessions.

---

## Repo-Local Runtime Rule

The managed runtime is repo-local by default. The canonical managed home is:

```text
<repo>/.epi/
  gate/
  agents/<agent-id>/
    agent/
      extensions/
      prompts/
      plugin-runtime.json
      settings.json
      auth.json
      models.json
      auth-profiles.json
      compat/
        codex-home/
          skills/
          superpowers/skills/
        .agents/
          skills/
          agents/
```

This is the operational fix for the previous ambient-home problem:

- repo-authored skills and subagents remain the source of truth
- PI gets stable compatibility projections inside the repo-local managed runtime
- `epi agent` does not need to depend on `~/.agents` or a user-global `CODEX_HOME`
- ta-onta and Pleroma content can live in the repo instead of being forced into the user home

`EPI_AGENT_HOME` may still override the home root when explicitly set, but the default runtime for this repo is `<repo>/.epi`, not `~/.epi`.

---

## Skill and Subagent Loading Contract

Interactive PI launches are explicit and repo-first:

- pass `--no-extensions`
- pass explicit `--extension` entries for the synced composite entry and `epi-citta`
- pass `--no-skills`
- pass explicit `--skill` roots for repo-local capability surfaces

Current repo-first skill roots are:

- `<repo>/skills`
- `<repo>/.pi/extensions/ta-onta/pleroma/S2'/skills`
- `<repo>/.pi/extensions/ta-onta/anima/S4'/skills`
- `<repo>/.pi/extensions/ta-onta/aletheia/S5'/skills`

Current repo-first subagent roots are projected from:

- `<repo>/.pi/extensions/ta-onta/anima/S4'/agents`
- `<repo>/.pi/extensions/ta-onta/aletheia/S5'/agents`

Ambient user-home discovery is intentionally disabled for interactive PI launches. If compatibility with Codex or existing `.agents` consumers is needed, `epi agent` projects repo content into the repo-local compatibility directories under `compat/` and exports those paths to PI.

---

## Gateway Preflight Contract

Interactive operator launches must prove the gateway is available before PI takes the terminal.

Shared rules:

- gateway state root is repo-local at `<repo>/.epi/gate`
- `epi up` and `epi agent` use the same gateway readiness routine
- if the gateway is already answering on the configured port, reuse it
- otherwise spawn `epi gate start --port <port>` and wait for a real WebSocket `hello-ok`
- persist process metadata under `<repo>/.epi/gate/up/gateway-process.json`

Environment exported to PI includes:

- `EPI_REPO_ROOT`
- `PI_CODING_AGENT_DIR`
- `EPI_AGENT_DIR`
- `EPI_AGENT_HOME`
- `EPI_AGENT_PROMPTS_DIR`
- `EPI_AGENT_PLUGIN_RUNTIME_PATH`
- `EPI_GATE_STATE_ROOT`
- `EPI_AGENT_GATEWAY_PORT`
- `EPI_AGENT_GATEWAY_URL`
- `CODEX_HOME`
- `EPI_GATE_SKILLS_PATHS`

The gateway preflight is part of the operator contract, not an optional extra.

---

## Extension Invocation Rules

ta-onta extensions must use real CLI surfaces only.

Required rules:

- never shell out to GUI `obsidian`
- use `obsidian-cli` for lowest-level vault contact
- prefer `epi vault ...` when a real CLI surface exists
- do not reference nonexistent `epi` subcommands or flags
- fail honestly when a capability does not yet exist instead of inventing a fake call path

This keeps PI, the gateway, and the extension layer aligned with the same production runtime contract.

---

## Verification Surfaces

Use these commands to validate the live contract:

```bash
epi agent doctor --json
epi up --json
epi gate status --json
epi agent verify-runtime --prompt "Reply with a single line confirming runtime verification."
```

These checks cover the managed runtime layout, repo-local gateway state, and the isolated captured verification lane separately from the native interactive operator lane.
