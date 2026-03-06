# Epi-Logos Skills, Commands, and Hooks System Design

## Design Checklist

- [x] Skill discovery works from repo-local assets before agent-local overrides.
- [x] Required local metadata stays lightweight: markdown frontmatter for skills, markdown body for commands, JSON plus shell entrypoints for hooks.
- [x] Commands remain text assets, not Rust feature creep.
- [x] Hooks stay explicit, observable, and opt-in through a manifest.
- [x] Multi-agent layouts isolate runtime state while sharing repo-authored assets.
- [x] Override rules are deterministic and auditable.
- [x] Inheritance boundaries prevent one agent from mutating another agent's runtime.

## Source Patterns Borrowed From `epi-claw`

`epi-claw` shows three patterns worth keeping:

1. Skills are directory-first assets with a stable `SKILL.md` entrypoint and optional `scripts/` or `references/` siblings.
2. Commands are split into small, named surfaces rather than one monolithic dispatcher file.
3. Hooks use discovery plus explicit registration, with loader/config logic separating "found on disk" from "enabled at runtime."

Epi-Logos should copy those structural ideas, not the runtime coupling. We do not import `epi-claw` state directories, gateway daemons, or app-specific command handlers. The sovereign runtime remains `epi-cli` plus PI-native assets in this repo.

## Discovery Rules

Discovery order is:

1. Repo-local assets under `skills/`, `commands/`, and `hooks/`
2. Managed agent-local runtime copies under `.epi/agents/<id>/agent/...`
3. No fallback into `epi-claw` or any external repo at runtime

Repo-local content is the authored source of truth. Agent-local copies exist only so PI sessions can run against a stable, isolated runtime tree. `epi agent extensions sync` may materialize repo assets into an agent directory, but discovery always records the original repo path and the synced target path together.

## Override and Inheritance Boundaries

Overrides are narrow on purpose:

1. Repo assets define the baseline behavior for every agent.
2. Agent-local overrides may shadow repo assets only inside that agent's managed directory.
3. Overrides never flow sideways across agents.
4. A sync from repo to agent replaces the agent's copied baseline, but must not overwrite explicit agent-only override files unless the command is invoked with a future force flag.

This keeps inheritance one-way: repo to agent baseline, then agent-local divergence for that agent only. No shared mutable state lives inside `.pi/`, and no agent writes back into repo-authored markdown or hook scripts.

## Execution Rules

Skills are PI-facing markdown assets. PI or future `epi-citta` tooling can read them directly, while Rust only inventories and syncs them.

Commands are also PI-facing text assets. Their job is to describe reusable workflows such as model inspection or graph context requests. Rust should expose indexing, sync, doctor, and execution metadata, but not re-encode every markdown command as a bespoke subcommand.

Hooks are Rust-aware because they affect process lifecycle. Even so, the rule is explicit registration:

1. `hooks/manifest.json` names the supported hook surfaces.
2. Shell entrypoints remain observable files on disk.
3. Rust may report, install, or invoke them, but the existence of a hook must remain inspectable without reading compiled code.

## PI-Facing vs Rust-Facing Responsibilities

PI-facing assets:

- `.pi/extensions/*.ts`
- `.pi/prompts/*.md`
- `skills/**/*.md`
- `commands/**/*.md`
- `hooks/*.sh`

Rust-facing responsibilities:

- resolve managed agent directories
- sync repo assets into agent-local runtime trees
- manage models/auth/agent registries
- expose `doctor`, `install`, `spawn`, and future hook execution entrypoints

The boundary is intentional: Rust manages lifecycle and integrity; PI consumes the assets that shape behavior inside a session.

## Multi-Agent Safety Model

Each agent gets isolated runtime state under `.epi/agents/<id>/agent/`:

- `models.json`
- `auth-profiles.json`
- synced `.pi` runtime tree
- future agent-local skill, command, and hook overrides

Repo-local assets are shared by authorship, not by mutable runtime state. That means two agents can share the same repo-authored skill definitions while using different model defaults, auth profiles, or override files. Hook execution must always resolve through the selected agent id so logs, side effects, and diagnostics stay attributable to one agent at a time.

## Epi-Logos Variant

The Epi-Logos variant stays smaller than `epi-claw`:

- no gateway-runtime dependency tree
- no hidden cross-repo asset loading
- no command explosion inside Rust for markdown-described behaviors
- no implicit hook activation

Instead, we keep a compact contract:

1. Repo authors create and review the canonical assets.
2. `epi-cli` inventories, syncs, and validates those assets.
3. PI sessions load the synced runtime through `epi-citta`.
4. Multi-agent isolation is enforced at the directory and config level.
