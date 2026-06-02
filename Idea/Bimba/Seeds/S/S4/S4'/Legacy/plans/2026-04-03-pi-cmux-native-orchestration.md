# PI-First cmux Native Orchestration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Execution Guardrails:** Also use superpowers:test-driven-development, superpowers:systematic-debugging, superpowers:verification-before-completion, and superpowers:requesting-code-review during implementation.

**Goal:** Make OMX and the repo plugin bundle model first-class as the transportable operative surface, while making PI-native subagent and agent-team orchestration first-class in `epi`, with `cmux` as the visible operator home and any claw-code Rust harness port deferred.

**Architecture:** Keep `epi` + gateway state as the source of truth for runtime state, lineage, and observability. Make the transportable `plugins/pleroma/` bundle the operative skill matrix that can be installed into PI, Codex/OMX, and external coding agents. Anima stays PI-native and sovereign: it owns constitutional agents, teams, and orchestration semantics. Pleroma/Techne own the portable mechanical execution layer, especially `cmux`, tmux/worktree operations, gateway ergonomics, and plugin-operability skills. `cmux` reflects persisted team/session state and provides the operator home, but it must never become the only authority for lineage or recovery.

**Tech Stack:** Rust CLI/gateway (`clap`, `serde`, `tokio`), PI CLI, TypeScript PI extensions under `.pi/`, `cmux`/`tmux`, existing gateway/OmniPanel contracts, Rust integration tests.

---

## Architecture Decision

### Recommended path: Rust runtime authority + PI extension adapters + cmux projection

This is the path to implement.

- Runtime authority lives in Rust under `epi-cli/src/gate/` and `epi-cli/src/agent/`.
- OMX/plugin packaging is first-class, not an afterthought: `plugins/pleroma/` is the portable ground package.
- Anima registers orchestration tools, but those tools call real `epi` command surfaces instead of shelling out to ad hoc `epi agent run` loops.
- Pleroma/Techne remain the owners of `cmux` mechanics and portable operative skills, but `cmux` becomes a projection target and operator surface for team state that already exists in the gateway.
- Gateway and OmniPanel gain explicit team/session metadata so subagents and team workers are visible even if `cmux` is closed or needs to be rebuilt.

Why this is the right path:

- The repo already has real subagent lineage and parent inheritance in Rust.
- The repo already has a real plugin manifest, discovery, runtime index, and hook bridge substrate in place.
- The current Anima S4 orchestration files are placeholders, so there is no mature TypeScript runtime to preserve.
- `cmux` already exists in the product as an operator surface, but only as a passthrough; we can deepen it without making it the authority.
- This copies the good part of OMX/claw thinking: explicit runtime contracts, durable state, operator visibility, and testable lifecycle boundaries.

### Rejected path: extension-only orchestration

Do not make the TypeScript extensions the primary runtime authority.

- It would duplicate session and lineage logic that already exists in the gateway.
- It would be much harder to test honestly.
- It would keep team/subagent visibility implicit and fragile.

### Rejected path: cmux as authority

Do not infer truth from tmux panes/windows alone.

- Pane state is a great operator surface, not a reliable recovery substrate.
- Recovery, audits, and OmniPanel visibility need durable records even when `cmux` is absent.

## Objective Findings

1. The current Anima S4 orchestration files are placeholders.
   - Evidence: `.pi/extensions/ta-onta/anima/S4/agent-team.ts`, `.pi/extensions/ta-onta/anima/S4/agent-chain.ts`, `.pi/extensions/ta-onta/anima/S4/cross-agent.ts`, `.pi/extensions/ta-onta/anima/S4/subagent-widget.ts`
   - Impact: there is no production team/subagent orchestration layer to preserve yet.

2. The Rust gateway already has real subagent lineage semantics.
   - Evidence: `epi-cli/src/gate/subagents.rs`, `epi-cli/src/gate/session_store.rs`, `epi-cli/src/gate/server.rs`, `epi-cli/tests/gate_subagent_spawn.rs`, `epi-cli/tests/gate_lineage_contract.rs`
   - Impact: new orchestration work should extend this contract, not bypass it.

3. Session visibility is real but shallow.
   - Evidence: `epi-cli/src/gate/sessions.rs`, `epi-cli/src/gate/parity.rs`, `epi-cli/src/gate/spacetimedb_bridge.rs`, `epi-cli/tests/gate_omnipanel_contract.rs`
   - Impact: OmniPanel can already see sessions, but not team topology or `cmux` placement.

4. `cmux` is already part of the product surface, but only as a mechanical passthrough.
   - Evidence: `epi-cli/src/techne/mod.rs`, `epi-cli/src/up.rs`, `epi-cli/tests/up_command.rs`, `.pi/extensions/ta-onta/pleroma/S2'/skills/cmux/SKILL.md`
   - Impact: we can deepen `cmux` without inventing a new operator home.

5. Pleroma already owns the primitive boundary and Anima already owns orchestration semantically.
   - Evidence: `.pi/extensions/ta-onta/pleroma/CONTRACT.md`, `.pi/extensions/ta-onta/anima/CONTRACT.md`, `.pi/extensions/ta-onta/pleroma/extension.ts`, `.pi/extensions/ta-onta/anima/extension.ts`
   - Impact: the authority split is correct already; the implementation just has not caught up.

6. The plugin substrate exists, but it is not first-class enough yet.
   - Evidence: `epi-cli/src/agent/plugins.rs`, `epi-cli/src/agent/plugin_manifest.rs`, `epi-cli/src/agent/runtime.rs`, `.pi/extensions/ta-onta/plugin-runtime-bridge.ts`
   - Impact: plugin bundles already validate, discover, join PI skill loading, and run hooks, but there is no real install/enable path yet and plugin `agents/` are not yet projected into runtime as first-class subagents.

7. The best OMX/claw ideas are worth borrowing, but not the substrate swap yet.
   - Evidence: `vendors/oh-my-codex/src/team/runtime.ts`, `vendors/oh-my-codex/src/team/tmux-session.ts`, `vendors/oh-my-codex/src/team/contracts.ts`, `vendors/claw-code-parity/PARITY.md`, `vendors/claw-code-parity/rust/crates/runtime/src/team_cron_registry.rs`
   - Impact: copy durable state, operator contracts, and tmux-backed runtime patterns; avoid in-memory-only team lifecycle and avoid port churn right now.

## Hard Rules For This Slice

- Keep PI as the harness.
- Make the plugin surface first-class before deepening orchestration semantics.
- Do not port to claw-code Rust in this slice.
- Do not treat `cmux` as the only source of truth.
- Do not add mock team/subagent state; persist real runtime records under `.epi/gate/`.
- Do not leave Anima orchestration as shell loops over `epi agent run`.
- Do not ship without real integration tests for lineage, team visibility, and `cmux` projection.

## Layer Clarification

### OMX / plugin surface

This is the transportable package layer.

- `plugins/pleroma/` is the portable operative bundle.
- It should be installable into Codex/OMX, into managed PI runtime, and into external coding agents.
- This is where the reusable operative skill matrix lives.
- External agents should be able to use this layer without inheriting the full ta-onta sovereign stack.

### Pleroma

Pleroma has two connected realizations:

- the transportable plugin package: `plugins/pleroma/`
- the repo-local PI extension/module layer: `.pi/extensions/ta-onta/pleroma/`

The package is the portable body. The PI extension/module layer is the repo’s substrate binding and ta-onta realization seam.

### Techne

Techne is the operational/mechanical aspect inside Pleroma.

- owns `cmux`
- owns tmux/worktree/gateway operational skills
- owns plugin-operability and workshop management skills
- is the natural place for the visible operator home

### Anima

Anima is not the portable ground plugin.

- Anima is PI-native and sovereign.
- It owns constitutional agents, teams, chains, and orchestration semantics.
- It should consume Pleroma as the operative skill matrix.
- External agents can use Pleroma without receiving Anima and the wider ta-onta sovereignty layer.

## Target Runtime Model

### Runtime authority

- `epi-cli/src/gate/session_store.rs` remains the owner of session records.
- Add a durable team store under `epi-cli/src/gate/team_store.rs`.
- Add a JSON-facing team surface under `epi-cli/src/gate/teams.rs`.
- Team records live under `<repo>/.epi/gate/teams/`.
- Session records keep ownership of per-session lineage; team records own group membership and `cmux` placement.

### Session metadata additions

Add these nullable fields to `SessionRecord` and session JSON surfaces:

- `team_id`
- `team_role`
- `orchestration_kind`
- `cmux_workspace`
- `cmux_surface`
- `cmux_pane_id`

Keep existing fields (`spawned_by`, `group_id`, `group_channel`, `group_space`, `subagent_lineage`) intact.

### Team record shape

Add a durable `TeamRecord` roughly like:

```rust
pub struct TeamRecord {
    pub team_id: String,
    pub parent_session_key: String,
    pub strategy: String, // parallel | chain | fusion | background
    pub label: Option<String>,
    pub task: String,
    pub status: String,   // pending | running | completed | failed | stopped
    pub cmux_workspace: String,
    pub cmux_surface: Option<String>,
    pub members: Vec<TeamMemberRecord>,
    pub created_at_ms: u128,
    pub updated_at_ms: u128,
}

pub struct TeamMemberRecord {
    pub session_key: String,
    pub agent_id: String,
    pub role: String, // leader | worker | reviewer | subagent
    pub status: String,
    pub worker_index: Option<u32>,
    pub cmux_pane_id: Option<String>,
}
```

### `cmux` role

- `cmux` is the operator home for team and subagent sessions.
- `cmux` receives deterministic workspace/surface names from Rust.
- `cmux` pane placement is written back into session/team state.
- If `cmux` is unavailable, orchestration may still run, but the runtime must record that projection is degraded rather than silently pretending it exists.

### PI extension role

- Anima tools become thin adapters to `epi agent team`, `epi agent chain`, and `epi agent subagent`.
- Pleroma/Techne expose bounded `cmux` management, plugin-operability, and visibility helpers.
- Interactive pane work still belongs in `cmux` itself, not inside PI tool invocations.

### Plugin/runtime role

- `plugins/pleroma/` becomes the canonical operative bundle.
- `epi` must support real plugin install/enable/projection behavior for managed PI runtime, not only validation/discovery and ad hoc `--plugin-dir`.
- Plugin `skills/` and `agents/` must both project into runtime.
- `.pi/extensions/ta-onta/plugin-runtime-bridge.ts` remains the bridge that turns runtime plugin selection into real PI lifecycle behavior.

## Borrow From OMX and claw

Take these ideas:

- explicit runtime contracts and state objects
- deterministic tmux/session naming
- durable worker/team state, not inferred state
- operator-visible worker placement and leader/worker distinction
- heartbeat and stale-worker visibility

Do not take these ideas in this slice:

- substrate replacement
- in-memory-only team registry
- pretending task/team tooling is “good enough” without recovery-grade persistence

## Deliberately Out Of Scope

- Full claw-code harness port
- OMX fork rebase work
- Ralph task model redesign
- Scheduler/cron redesign beyond whatever team runtime needs for visibility

## Task 0: Make the plugin surface first-class for PI and external agents

**Files:**
- Modify: `epi-cli/src/agent/plugins.rs`
- Modify: `epi-cli/src/agent/runtime.rs`
- Modify: `epi-cli/src/agent/agent_dirs.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Modify: `.pi/extensions/ta-onta/plugin-runtime-bridge.ts`
- Create: `epi-cli/tests/agent_plugin_install.rs`
- Modify: `epi-cli/tests/agent_native_pi_contract.rs`

**Step 1: Write the failing test**

Add tests that prove:

- a repo plugin can be discovered and selected without passing `--plugin-dir` every time
- plugin `skills/` are projected into PI runtime roots
- plugin `agents/` are projected into PI runtime roots
- the runtime index written to `plugin-runtime.json` includes the selected plugin bundle
- PI lifecycle hooks still execute through `plugin-runtime-bridge.ts`

Use a real temp plugin bundle with:

- `.claude-plugin/plugin.json`
- `skills/.../SKILL.md`
- `agents/...md`
- `hooks/hooks.json`

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test agent_plugin_install --test agent_native_pi_contract -v
```

Expected: FAIL because plugin bundles are not yet first-class installed/runtime-projected products, especially for plugin `agents/`.

**Step 3: Write minimal implementation**

- add real repo plugin selection/install semantics
- project plugin `skills/` and plugin `agents/` into managed runtime compatibility roots
- preserve the current runtime index + hook bridge behavior
- keep `.pi` as substrate, not replacement

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/plugins.rs epi-cli/src/agent/runtime.rs epi-cli/src/agent/agent_dirs.rs epi-cli/src/agent/mod.rs .pi/extensions/ta-onta/plugin-runtime-bridge.ts epi-cli/tests/agent_plugin_install.rs epi-cli/tests/agent_native_pi_contract.rs
git commit -m "feat: make plugin surface first-class in managed pi runtime"
```

## Task 1: Freeze the Gateway Team/Session Visibility Contract

**Files:**
- Create: `epi-cli/tests/gate_team_runtime_contract.rs`
- Modify: `epi-cli/src/gate/parity.rs`
- Modify: `epi-cli/src/gate/omnipanel.rs`
- Modify: `epi-cli/src/gate/sessions.rs`
- Modify: `epi-cli/src/gate/spacetimedb_bridge.rs`
- Modify: `epi-cli/tests/gate_omnipanel_contract.rs`
- Modify: `epi-cli/tests/gate_spacetimedb_bridge.rs`

**Step 1: Write the failing test**

Add contract tests that assert:

- `hello_contract().session_metadata` includes:
  - `teamId`
  - `teamRole`
  - `orchestrationKind`
  - `cmuxWorkspace`
  - `cmuxSurface`
  - `cmuxPaneId`
- `SpacetimeBridge::publish_session(...)` emits these fields when present.
- `sessions.list` and `sessions.resolve` expose these fields in their JSON payloads.

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test gate_omnipanel_contract --test gate_spacetimedb_bridge --test gate_team_runtime_contract -v
```

Expected: FAIL because the gateway session contract does not expose team or `cmux` metadata yet.

**Step 3: Write minimal implementation**

- Extend `SessionRecord` serialization surfaces to carry nullable team/`cmux` fields.
- Extend `OMNIPANEL_SESSION_METADATA`.
- Extend `publish_session()` bridge payload.
- Do not add team lifecycle logic yet; just freeze the visibility contract.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/gate/parity.rs epi-cli/src/gate/omnipanel.rs epi-cli/src/gate/sessions.rs epi-cli/src/gate/spacetimedb_bridge.rs epi-cli/tests/gate_omnipanel_contract.rs epi-cli/tests/gate_spacetimedb_bridge.rs epi-cli/tests/gate_team_runtime_contract.rs
git commit -m "test: freeze team and cmux session visibility contract"
```

## Task 2: Add a Durable Team Store and Gateway RPC Surface

**Files:**
- Create: `epi-cli/src/gate/team_store.rs`
- Create: `epi-cli/src/gate/teams.rs`
- Modify: `epi-cli/src/gate/mod.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Modify: `epi-cli/src/gate/session_store.rs`
- Modify: `epi-cli/tests/gate_team_runtime_contract.rs`
- Modify: `epi-cli/tests/gate_electron_controller_compat.rs`

**Step 1: Write the failing test**

Add tests that prove real persistence and recovery:

- `teams.create` creates a JSON record on disk under `.epi/gate/teams/`.
- `teams.list` returns the created team after a fresh store reload.
- `teams.resolve` shows team members and parent session linkage.
- `teams.stop` transitions the team status without deleting the record.

Use a real temp gate root and assert real files exist after the RPC roundtrip.

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test gate_team_runtime_contract --test gate_electron_controller_compat -v
```

Expected: FAIL because there is no durable team store or RPC surface.

**Step 3: Write minimal implementation**

- Implement `TeamStore` with create, list, resolve, update, and stop operations.
- Persist records under `<gate-root>/teams/<team-id>.json`.
- Add gateway methods:
  - `teams.create`
  - `teams.list`
  - `teams.resolve`
  - `teams.stop`
- Update Electron/gateway parity tests if the required method list expands.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/gate/team_store.rs epi-cli/src/gate/teams.rs epi-cli/src/gate/mod.rs epi-cli/src/gate/server.rs epi-cli/src/gate/session_store.rs epi-cli/tests/gate_team_runtime_contract.rs epi-cli/tests/gate_electron_controller_compat.rs
git commit -m "feat: add durable gateway team store and rpc surface"
```

## Task 3: Implement the `cmux` Projection Layer

**Files:**
- Create: `epi-cli/src/techne/cmux.rs`
- Modify: `epi-cli/src/techne/mod.rs`
- Modify: `epi-cli/src/gate/team_store.rs`
- Modify: `epi-cli/src/gate/session_store.rs`
- Modify: `epi-cli/src/up.rs`
- Create: `epi-cli/tests/techne_cmux_contract.rs`
- Modify: `epi-cli/tests/up_command.rs`

**Step 1: Write the failing test**

Add tests that assert:

- a team can derive a deterministic `cmux` workspace name from `team_id`
- worker panes receive deterministic surface/role naming
- the command builder honors `EPI_CMUX_BIN`
- successful projection writes back:
  - `cmuxWorkspace`
  - `cmuxSurface`
  - `cmuxPaneId`

Use fake shell executables the same way `up_command.rs` already does.

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test techne_cmux_contract --test up_command -v
```

Expected: FAIL because `cmux` is only a passthrough today and there is no projection/state write-back contract.

**Step 3: Write minimal implementation**

- Move `cmux` command planning into a dedicated Rust module.
- Add helpers for:
  - workspace naming
  - surface naming
  - attach/focus command construction
  - pane metadata capture
- Keep the source of truth in Rust stores, not in tmux inspection.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/techne/cmux.rs epi-cli/src/techne/mod.rs epi-cli/src/gate/team_store.rs epi-cli/src/gate/session_store.rs epi-cli/src/up.rs epi-cli/tests/techne_cmux_contract.rs epi-cli/tests/up_command.rs
git commit -m "feat: add cmux projection layer for agent teams"
```

## Task 4: Add Real `epi agent team`, `chain`, and `subagent` Runtime Surfaces

**Files:**
- Create: `epi-cli/src/agent/team.rs`
- Create: `epi-cli/src/agent/chain.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Modify: `epi-cli/src/agent/subagents.rs`
- Modify: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Modify: `epi-cli/src/gate/session_store.rs`
- Create: `epi-cli/tests/agent_team_cli_contract.rs`
- Modify: `epi-cli/tests/gate_subagent_spawn.rs`
- Modify: `epi-cli/tests/gate_lineage_contract.rs`

**Step 1: Write the failing test**

Add tests that prove:

- `epi agent team create ...` creates a durable team and worker sessions
- `epi agent chain run ...` produces ordered child sessions under one team
- `epi agent subagent run/list/continue/stop` uses the same real gateway lineage contract instead of ad hoc shell loops
- worker sessions inherit parent delivery context and keep valid `spawnedBy` semantics

Use real temp gate state and fake PI processes where needed, the same way existing gateway tests do.

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test agent_team_cli_contract --test gate_subagent_spawn --test gate_lineage_contract -v
```

Expected: FAIL because these CLI surfaces do not exist yet and Anima still shells out directly through `epi agent run`.

**Step 3: Write minimal implementation**

- Add new `AgentCmd` branches for `Team` and `Chain`.
- Expand `Subagent` from validation-only into a real runtime surface while keeping validation commands intact.
- Route orchestration through the gateway/session/team stores so lineage stays normalized.
- Reuse existing `start_agent_run` and `resolve_agent_launch_context` semantics instead of inventing a second spawn path.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/team.rs epi-cli/src/agent/chain.rs epi-cli/src/agent/mod.rs epi-cli/src/agent/subagents.rs epi-cli/src/agent/spawn.rs epi-cli/src/gate/server.rs epi-cli/src/gate/session_store.rs epi-cli/tests/agent_team_cli_contract.rs epi-cli/tests/gate_subagent_spawn.rs epi-cli/tests/gate_lineage_contract.rs
git commit -m "feat: add native epi team chain and subagent runtime surfaces"
```

## Task 5: Replace Anima Placeholder Orchestration With Thin Runtime Adapters

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/extension.ts`
- Modify: `.pi/extensions/ta-onta/anima/S4/agent-team.ts`
- Modify: `.pi/extensions/ta-onta/anima/S4/agent-chain.ts`
- Modify: `.pi/extensions/ta-onta/anima/S4/cross-agent.ts`
- Modify: `.pi/extensions/ta-onta/anima/S4/subagent-widget.ts`
- Modify: `.pi/extensions/ta-onta/pleroma/extension.ts`
- Modify: `.pi/agents/teams.yaml`
- Modify: `.pi/agents/agent-chain.yaml`
- Modify: `epi-cli/tests/agent_extensions_ta_onta.rs`
- Modify: `epi-cli/tests/ta_onta_cli_contract.rs`

**Step 1: Write the failing test**

Add tests that assert:

- the Anima S4 files are no longer placeholder string-returners
- `dispatch_agent`, `run_chain`, parallel dispatch, fusion dispatch, and subagent lifecycle tools call real `epi agent team|chain|subagent` surfaces
- Pleroma exposes bounded `cmux` visibility helpers only, not fake interactive pane execution through PI tools

String-level contract tests are acceptable here, but they must assert real command surfaces, not placeholder scaffolds.

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test agent_extensions_ta_onta --test ta_onta_cli_contract -v
```

Expected: FAIL because the Anima S4 files are placeholders and `extension.ts` still shells out through simplistic `epi agent run` loops.

**Step 3: Write minimal implementation**

- Turn each S4 file into a thin helper module with real command builders and argument normalization.
- Update `anima/extension.ts` so orchestration tools call the new CLI surfaces.
- Keep Pleroma as the owner of `cmux` mechanics and session visibility helpers.
- Update `.pi/agents/teams.yaml` and `.pi/agents/agent-chain.yaml` so the repo-level defaults match the new runtime model.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add .pi/extensions/ta-onta/anima/extension.ts .pi/extensions/ta-onta/anima/S4/agent-team.ts .pi/extensions/ta-onta/anima/S4/agent-chain.ts .pi/extensions/ta-onta/anima/S4/cross-agent.ts .pi/extensions/ta-onta/anima/S4/subagent-widget.ts .pi/extensions/ta-onta/pleroma/extension.ts .pi/agents/teams.yaml .pi/agents/agent-chain.yaml epi-cli/tests/agent_extensions_ta_onta.rs epi-cli/tests/ta_onta_cli_contract.rs
git commit -m "feat: wire anima and pleroma to native team orchestration"
```

## Task 6: Finish OmniPanel, Bridge, and Docs Alignment

**Files:**
- Modify: `epi-cli/tests/gate_electron_controller_compat.rs`
- Modify: `epi-cli/tests/gate_omnipanel_contract.rs`
- Modify: `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md`
- Modify: `docs/dev/pi-operator-protocol.md`
- Modify: `.pi/extensions/ta-onta/anima/CONTRACT.md`
- Modify: `.pi/extensions/ta-onta/pleroma/CONTRACT.md`

**Step 1: Write the failing test**

Add or tighten tests so they assert:

- the gateway parity list includes the final team/session methods
- the OmniPanel contract advertises the final session metadata surface
- the docs no longer describe placeholder S4 orchestration as if it were implemented

**Step 2: Run test to verify it fails**

Run:

```bash
cargo test --manifest-path epi-cli/Cargo.toml --test gate_electron_controller_compat --test gate_omnipanel_contract -v
```

Expected: FAIL until the parity and metadata lists are final and the contracts are aligned.

**Step 3: Write minimal implementation**

- Align the Rust parity lists with the final RPC surface.
- Update docs to describe:
  - PI-first orchestration
  - gate/session authority
  - `cmux` as operator home
  - claw/OMX as reference only for now

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git add epi-cli/tests/gate_electron_controller_compat.rs epi-cli/tests/gate_omnipanel_contract.rs Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md docs/dev/pi-operator-protocol.md .pi/extensions/ta-onta/anima/CONTRACT.md .pi/extensions/ta-onta/pleroma/CONTRACT.md
git commit -m "docs: align pi cmux orchestration contracts"
```

## Verification Checklist

- `cargo test --manifest-path epi-cli/Cargo.toml --test gate_team_runtime_contract -v`
- `cargo test --manifest-path epi-cli/Cargo.toml --test techne_cmux_contract -v`
- `cargo test --manifest-path epi-cli/Cargo.toml --test agent_team_cli_contract -v`
- `cargo test --manifest-path epi-cli/Cargo.toml --test gate_subagent_spawn --test gate_lineage_contract -v`
- `cargo test --manifest-path epi-cli/Cargo.toml --test gate_electron_controller_compat --test gate_omnipanel_contract -v`
- `cargo test --manifest-path epi-cli/Cargo.toml --test agent_extensions_ta_onta --test ta_onta_cli_contract -v`
- `cargo test --manifest-path epi-cli/Cargo.toml --test up_command -v`

## Expected End State

- PI remains the harness.
- OMX/plugin packaging is first-class and portable.
- `plugins/pleroma/` is the canonical operative package.
- `epi` is the orchestration control plane and runtime authority.
- Anima owns sovereignty and orchestration semantics, not shell loops.
- Pleroma/Techne own the operative skill matrix and `cmux` mechanics, not constitutional sovereignty.
- Gateway/OmniPanel can see team and subagent topology without guessing.
- `cmux` is the real operator home for teams and subagents.
- claw-code remains a reference source until the PI-first runtime is stable and trusted.
