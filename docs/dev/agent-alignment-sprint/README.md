# Agent Alignment Sprint

## Scope

This folder is the bounded working set for the current PI/Pleroma/Anima alignment sprint.

The goal is to avoid plan sprawl and keep one compact reference for:

- real ta-onta authority files
- current implementation truth
- immediate architectural decisions
- `autoresearch`-style self-improvement ideas we may adapt later

## Ground Truth

### Runtime authority

These are the strongest implementation-grounded authorities today:

- `epi-cli/src/gate/`
- `epi-cli/src/agent/`
- `docs/dev/pi-operator-protocol.md`
- `docs/specs/S/S4-S4i-PI-AGENT.md`

### ta-onta PI extension authority

- `.pi/extensions/ta-onta/composite-entry.ts`
- `.pi/extensions/ta-onta/plugin-runtime-bridge.ts`
- `.pi/extensions/ta-onta/pleroma/CONTRACT.md`
- `.pi/extensions/ta-onta/anima/CONTRACT.md`
- `.pi/extensions/ta-onta/aletheia/CONTRACT.md`
- `.pi/extensions/ta-onta/pleroma/extension.ts`
- `.pi/extensions/ta-onta/anima/extension.ts`
- `.pi/extensions/ta-onta/aletheia/extension.ts`

### Plugin/package substrate

- `epi-cli/src/agent/plugins.rs`
- `epi-cli/src/agent/plugin_manifest.rs`
- `epi-cli/src/agent/runtime.rs`
- `plugins/registry.jsonl`

### Reference vendors

- `vendors/oh-my-codex`
- `vendors/claw-code-parity`
- `vendors/autoresearch`

## Current Truth

### Already real and aligned

1. PI runtime is already repo-first, not `~/.agents`-first.
   - Managed runtime lives under `<repo>/.epi/agents/<id>/agent`.
   - Repo skill roots are projected into repo-local compatibility roots under `compat/.agents` and `compat/codex-home`.
   - Interactive PI launches pass explicit `--skill` roots and export `CODEX_HOME` plus `EPI_GATE_SKILLS_PATHS`.

2. Gateway/session lineage is already real in Rust.
   - Subagent lineage, `spawnedBy`, parent inheritance, and session publication already exist in `epi-cli/src/gate/`.
   - This must remain the runtime authority for session truth.

3. Pleroma already owns the mechanical boundary in spirit and in code.
   - Primitive registration, gateway/session tools, and mechanical skills already live under `.pi/extensions/ta-onta/pleroma/`.
   - `cmux`, `tmux`, `worktrunk`, and related operational skills are already placed there.

4. Plugin substrate is real, but partial.
   - Plugin bundle validation exists.
   - Plugin discovery exists.
   - Runtime plugin index exists.
   - Hook bridge exists inside PI.
   - Plugin `skills/` join runtime loading.

### Missing or misaligned

1. `plugins/pleroma/` does not exist yet as the real transportable operative bundle.
   - The intended architecture wants it.
   - The current live implementation still sits primarily under `.pi/extensions/ta-onta/`.

2. Plugin `agents/` are not yet first-class runtime projections.
   - Plugin `skills/` are loaded.
   - Plugin `agents/` are not yet projected into the managed runtime the same way.

3. Anima sovereignty is conceptually present but materially incomplete.
   - `anima/extension.ts` exposes orchestration tools.
   - But the S4 primitives such as `agent-team.ts`, `agent-chain.ts`, and `subagent-widget.ts` are still placeholders.

4. Techne is split-brain.
   - Pleroma clearly wants Techne to own mechanical execution.
   - But Anima still carries `techne-helper` and some historical ownership residue.

## Sprint Decisions

These are the working decisions for this sprint unless displaced by stronger code/spec authority:

1. Repo-local projected roots are canonical.
   - `~/.agents`, `~/.codex`, and similar global roots are compatibility/export targets only.
   - They are not the source of truth for managed PI runtime.

2. `plugins/pleroma/` is the transportable operative package.
   - It should be installable into managed PI runtime.
   - It should be installable into Codex/OMX.
   - It should be installable into external coding agents.

3. Pleroma contains Techne.
   - Techne owns `cmux`, workshop mechanics, worktree/gateway ergonomics, and plugin-operability.
   - `cmux` is the visible operator home for teams and subagents.

4. Anima is PI-native and sovereign.
   - Anima owns constitutional agents, teams, chains, and orchestration semantics.
   - Anima consumes Pleroma as its operative skill matrix.
   - External agents may use Pleroma without receiving Anima and the full ta-onta sovereignty layer.

5. Gateway/Rust runtime remains the source of truth.
   - `cmux` is an operator surface and projection target.
   - It must not become the only authority for runtime truth.

## Immediate Work Order

1. Make the plugin surface first-class.
   - Real plugin selection/install/projection for managed PI runtime.
   - Project plugin `skills/` and plugin `agents/`.

2. Materialize Anima’s runtime surfaces.
   - Replace S4 placeholder files with real team/chain/subagent adapters over `epi`.

3. Deepen Pleroma/Techne `cmux` ownership.
   - Make team/session state visible and durable.
   - Keep `cmux` as the operator home, not the source of truth.

## `autoresearch` Adaptation

The main thing worth stealing from `vendors/autoresearch` is not “self-modifying AI,” but the evaluation discipline:

- one bounded mutable surface
- one fixed evaluator
- baseline first
- fixed-budget experiment
- keep/revert rule
- durable experiment ledger

### Good fits for Epi-Logos

- Aletheia owns the evaluation corpus and evidence packs.
- Sophia proposes bounded changes.
- Logos cycle decides keep/discard based on real eval results.

### Candidate mutable surfaces

- orchestration policy
- prompt/routing policy
- plugin projection policy
- retry/escalation behavior
- narrow runtime config slices

### Must remain fixed within one loop

- scenario pack
- evaluator logic
- success metrics
- regression gates

### Non-negotiable caution

We must not let the system mutate both the thing under test and the judge.

The equivalent of `prepare.py` must stay fixed for each improvement cycle.

## Boundaries For This Folder

- Keep this folder small.
- Prefer updating this note over creating new sprint markdown files.
- Only split out a second note if a concrete implementation artifact truly needs it.
