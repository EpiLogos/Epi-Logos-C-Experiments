# Full Gateway Functionality Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current file-backed gateway stub with a production-ready Rust gateway that actually owns PI-agent execution, streaming, session lineage, control-plane parity, and startup orchestration in the same way Epi-Claw/OpenClaw does.

**Architecture:** Port the Epi-Claw gateway as a parity-first execution spine, not as a UI-facing facade. The Rust gateway must become the authority for request validation, session mutation, run registration, background agent execution, event emission, chat streaming, abort/wait semantics, and subagent spawning. Repo-specific Khora/Hen/vault/graph/app integration should layer on top of that parity spine rather than replacing it.

**Tech Stack:** Rust (`tokio`, `tokio_tungstenite`, `serde_json`, `clap`), existing `epi-cli` gateway/session/agent modules, PI CLI process execution, Electron app (`Idea/Pratibimba/System/epi-app`), Rust integration tests in `epi-cli/tests`, Node/Vitest tests in the app where needed.

---

## Scope Assumption

This plan assumes the non-negotiable target is:

1. Exact behavioral parity with the real Epi-Claw gateway execution model for the shared gateway surface.
2. No fake “accepted” runs that do not own real PI execution.
3. Khora/vault/day/NOW, graph health, app passthrough, tmux/cmux, and `epi up` are layered after the execution spine is real.

## Canonical Source Authority

Treat these as the behavioral authority while implementing:

- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods/agent.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods/chat.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-chat.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server.impl.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/infra/agent-events.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/tools/sessions-spawn-tool.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/server-methods-list.ts`
- `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/gateway/protocol/schema/protocol-schemas.ts`

Do not invent alternate semantics if the Epi-Claw authority already defines the behavior.

## Task 1: Freeze the Parity Contract in Tests

**Files:**
- Create: `epi-cli/tests/gate_full_parity_contract.rs`
- Create: `epi-cli/tests/gate_agent_runtime_contract.rs`
- Create: `epi-cli/tests/gate_chat_runtime_contract.rs`
- Modify: `epi-cli/tests/gate_omnipanel_contract.rs`
- Modify: `epi-cli/src/gate/parity.rs`

**Step 1: Write failing parity-manifest tests**

Add assertions that the Rust method list covers the current Epi-Claw authority surface:

- `agent`
- `agent.wait`
- `chat.send`
- `chat.abort`
- `chat.history`
- `sessions.resolve`
- `send`
- `health`
- `status`
- `wake`

**Step 2: Write failing protocol/event tests**

Add tests asserting the Rust gateway contract exposes:

- `hello-ok` with protocol version `3`
- event channels for `agent`, `chat`, `tick`, `health`, `heartbeat`
- per-run sequence expectations for streamed events

**Step 3: Run the failing tests**

Run: `cargo test -p epi-logos gate_full_parity_contract gate_agent_runtime_contract gate_chat_runtime_contract gate_omnipanel_contract`

Expected: FAIL because the Rust gateway currently lacks `agent`, `wake`, `health`, real chat streaming, and matching event declarations.

**Step 4: Update the parity manifest minimally**

Modify `epi-cli/src/gate/parity.rs` so the method and event declarations match the plan target, but do not implement handlers yet.

**Step 5: Re-run contract tests**

Run: `cargo test -p epi-logos gate_full_parity_contract gate_omnipanel_contract`

Expected: method-manifest tests pass; runtime-contract tests still fail.

**Step 6: Commit**

```bash
git add epi-cli/src/gate/parity.rs epi-cli/tests/gate_full_parity_contract.rs epi-cli/tests/gate_agent_runtime_contract.rs epi-cli/tests/gate_chat_runtime_contract.rs epi-cli/tests/gate_omnipanel_contract.rs
git commit -m "test: freeze full gateway parity contract"
```

## Task 2: Build a Real Gateway Runtime State Core

**Files:**
- Create: `epi-cli/src/gate/runtime.rs`
- Create: `epi-cli/src/gate/events.rs`
- Create: `epi-cli/src/gate/runs.rs`
- Create: `epi-cli/tests/gate_runtime_state.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Modify: `epi-cli/src/gate/mod.rs`

**Step 1: Write failing runtime-state tests**

Cover:

- registering a run context by `run_id`
- mapping `run_id -> session_key`
- monotonic `seq` generation per run
- listener subscription/unsubscription
- cached run lifecycle snapshots for `wait`

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_runtime_state`

Expected: FAIL because no shared runtime state core exists.

**Step 3: Implement minimal runtime types**

Add Rust equivalents of the Epi-Claw runtime spine:

- `GatewayRuntimeState`
- `RunContext`
- `AgentEvent`
- `RunSnapshot`
- `ChatRunRegistry`

Keep these process-local and concurrency-safe with `Arc<Mutex<...>>` or `Arc<RwLock<...>>`.

**Step 4: Thread runtime state into the server**

Update `server.rs` so all connections share one runtime state instance instead of rebuilding handler-local state on each request.

**Step 5: Re-run tests**

Run: `cargo test -p epi-logos gate_runtime_state`

Expected: PASS.

**Step 6: Commit**

```bash
git add epi-cli/src/gate/runtime.rs epi-cli/src/gate/events.rs epi-cli/src/gate/runs.rs epi-cli/src/gate/server.rs epi-cli/src/gate/mod.rs epi-cli/tests/gate_runtime_state.rs
git commit -m "feat: add shared gateway runtime state core"
```

## Task 3: Replace Stub Session Storage with Real Session Authority

**Files:**
- Modify: `epi-cli/src/gate/sessions.rs`
- Create: `epi-cli/src/gate/session_store.rs`
- Create: `epi-cli/src/gate/transcripts.rs`
- Create: `epi-cli/tests/gate_session_store_contract.rs`
- Modify: `epi-cli/tests/gate_sessions.rs`

**Step 1: Write failing session-authority tests**

Cover:

- canonical key resolution
- alias resolution
- label resolution
- persisted `session_id`
- persisted `spawned_by`
- persisted `vault_now_path`
- persisted `group/channel/thread` delivery metadata
- persisted `model_override`, `provider_override`, `thinking`, `verbose`, `reasoning`
- transcript path resolution per session

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_session_store_contract gate_sessions`

Expected: FAIL because the current `SessionRecord` shape is too shallow.

**Step 3: Expand the session model**

Add missing parity fields and keep backward compatibility for existing rows where possible.

At minimum add:

- `session_id`
- `display_name` or `label`
- `spawned_by`
- `vault_now_path`
- `delivery_context`
- `channel`
- `thread_id`
- `group_id`
- `group_channel`
- `group_space`
- `model_override`
- `provider_override`
- `cli_session_ids`

**Step 4: Move transcript logic into a dedicated module**

Create JSONL-compatible transcript helpers instead of the current simple JSON array transcript file.

**Step 5: Re-run tests**

Run: `cargo test -p epi-logos gate_session_store_contract gate_sessions`

Expected: PASS.

**Step 6: Commit**

```bash
git add epi-cli/src/gate/sessions.rs epi-cli/src/gate/session_store.rs epi-cli/src/gate/transcripts.rs epi-cli/tests/gate_session_store_contract.rs epi-cli/tests/gate_sessions.rs
git commit -m "feat: expand gateway session authority and transcript store"
```

## Task 4: Port the `agent` RPC into a Real Background PI Run Lane

**Files:**
- Create: `epi-cli/src/gate/agent.rs`
- Create: `epi-cli/src/gate/agent_job.rs`
- Create: `epi-cli/src/gate/agent_events.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Modify: `epi-cli/src/agent/spawn.rs`
- Modify: `epi-cli/src/agent/mod.rs`
- Create: `epi-cli/tests/gate_agent_rpc.rs`
- Create: `epi-cli/tests/gate_agent_wait.rs`

**Step 1: Write failing `agent` RPC tests**

Cover:

- invalid request validation
- `agent` returns immediate accepted response with `runId`
- session store is patched before execution starts
- run context is registered with `session_key`
- background PI process is launched
- second wait/terminal response is persisted for later lookup

**Step 2: Write failing `agent.wait` tests**

Cover:

- waiting on completed run returns `ok`
- waiting on failed run returns `error`
- waiting on unknown run times out cleanly

**Step 3: Run the failing tests**

Run: `cargo test -p epi-logos gate_agent_rpc gate_agent_wait`

Expected: FAIL because Rust gateway has no `agent` handler.

**Step 4: Implement the real run lane**

Port the Epi-Claw behavior:

- validate request
- normalize session key
- mutate session store
- register run context
- emit lifecycle `start`
- spawn `pi` in background
- cache completion snapshot
- expose `agent.wait`

Do not shell out through `epi agent spawn` as a text-only wrapper. Extract a reusable Rust function so both `epi agent spawn` and gateway `agent` use the same lower-level PI launch primitive.

**Step 5: Re-run tests**

Run: `cargo test -p epi-logos gate_agent_rpc gate_agent_wait`

Expected: PASS.

**Step 6: Commit**

```bash
git add epi-cli/src/gate/agent.rs epi-cli/src/gate/agent_job.rs epi-cli/src/gate/agent_events.rs epi-cli/src/gate/server.rs epi-cli/src/agent/spawn.rs epi-cli/src/agent/mod.rs epi-cli/tests/gate_agent_rpc.rs epi-cli/tests/gate_agent_wait.rs
git commit -m "feat: port real agent rpc execution lane into gateway"
```

## Task 5: Make `chat.send` a Real Streaming Chat Lane

**Files:**
- Rewrite: `epi-cli/src/gate/chat.rs`
- Create: `epi-cli/src/gate/chat_abort.rs`
- Create: `epi-cli/tests/gate_chat_send.rs`
- Create: `epi-cli/tests/gate_chat_abort.rs`
- Create: `epi-cli/tests/gate_chat_events.rs`
- Modify: `epi-cli/src/gate/server.rs`

**Step 1: Write failing chat runtime tests**

Cover:

- `chat.send` returns started/accepted run id
- assistant deltas stream as `chat` events with monotonic `seq`
- final event includes assistant message
- error event is emitted on failure
- `/stop` and `chat.abort` cancel the in-flight run
- transcript history reflects final assistant output

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_chat_send gate_chat_abort gate_chat_events`

Expected: FAIL because current `chat.send` only appends a transcript row.

**Step 3: Port the execution model**

Implement `chat.send` as a wrapper over the same real PI run spine, with:

- abort controller registration
- per-run chat buffer
- throttled delta broadcast
- final transcript append
- final/error/aborted event emission

Preserve attachment normalization and `thinking` injection behavior.

**Step 4: Re-run tests**

Run: `cargo test -p epi-logos gate_chat_send gate_chat_abort gate_chat_events`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/gate/chat.rs epi-cli/src/gate/chat_abort.rs epi-cli/src/gate/server.rs epi-cli/tests/gate_chat_send.rs epi-cli/tests/gate_chat_abort.rs epi-cli/tests/gate_chat_events.rs
git commit -m "feat: port real streaming chat execution lane"
```

## Task 6: Port Event Broadcasting, Tick, Health, and Connection Semantics

**Files:**
- Modify: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/src/gate/maintenance.rs`
- Create: `epi-cli/src/gate/health.rs`
- Create: `epi-cli/tests/gate_connect_protocol.rs`
- Create: `epi-cli/tests/gate_tick_health.rs`

**Step 1: Write failing protocol tests**

Cover:

- challenge/hello/connect sequence
- `tick` broadcasts at configured interval
- health snapshots are versioned
- `agent` and `chat` events reach all subscribed clients
- gap detection can be derived from `seq`

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_connect_protocol gate_tick_health`

Expected: FAIL because Rust gateway currently only sends `hello-ok` and direct RPC responses.

**Step 3: Implement maintenance/event plumbing**

Add:

- gateway maintenance timers
- tick broadcaster
- health/presence versioning
- event fanout for `agent`, `chat`, `tick`, `health`, `heartbeat`

**Step 4: Re-run tests**

Run: `cargo test -p epi-logos gate_connect_protocol gate_tick_health`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/gate/server.rs epi-cli/src/gate/maintenance.rs epi-cli/src/gate/health.rs epi-cli/tests/gate_connect_protocol.rs epi-cli/tests/gate_tick_health.rs
git commit -m "feat: add gateway event broadcast and maintenance loop"
```

## Task 7: Port Subagent Spawning Through the Gateway Lane

**Files:**
- Create: `epi-cli/src/gate/subagents.rs`
- Modify: `epi-cli/src/gate/agent.rs`
- Modify: `epi-cli/src/gate/sessions.rs`
- Create: `epi-cli/tests/gate_subagent_spawn.rs`
- Create: `epi-cli/tests/gate_lineage_contract.rs`

**Step 1: Write failing subagent tests**

Cover:

- child session keys under `agent:<id>:subagent:<id>`
- requester/main-session restrictions
- `spawned_by` linkage
- lineage persistence
- child session wait and transcript lookup

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_subagent_spawn gate_lineage_contract`

Expected: FAIL because no gateway-owned subagent lane exists.

**Step 3: Implement subagent parity**

Port the `sessions_spawn` semantics into Rust by routing all subagent launches through the gateway-owned `agent` runtime, not direct CLI wrappers.

Persist:

- `spawned_by`
- parent session key
- child session key
- label
- inherited delivery/group context
- NOW/vault lineage metadata

**Step 4: Re-run tests**

Run: `cargo test -p epi-logos gate_subagent_spawn gate_lineage_contract`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/gate/subagents.rs epi-cli/src/gate/agent.rs epi-cli/src/gate/sessions.rs epi-cli/tests/gate_subagent_spawn.rs epi-cli/tests/gate_lineage_contract.rs
git commit -m "feat: add gateway-owned subagent spawn lineage"
```

## Task 8: Bring the Remaining Gateway Method Surface to Real Parity

**Files:**
- Modify: `epi-cli/src/gate/models.rs`
- Modify: `epi-cli/src/gate/skills.rs`
- Modify: `epi-cli/src/gate/config.rs`
- Modify: `epi-cli/src/gate/system.rs`
- Modify: `epi-cli/src/gate/logs.rs`
- Modify: `epi-cli/src/gate/cron.rs`
- Modify: `epi-cli/src/gate/nodes.rs`
- Modify: `epi-cli/src/gate/devices.rs`
- Modify: `epi-cli/src/gate/approvals.rs`
- Modify: `epi-cli/src/gate/browser.rs`
- Modify: `epi-cli/src/gate/update.rs`
- Modify: `epi-cli/src/gate/wizard.rs`
- Create: `epi-cli/tests/gate_method_parity.rs`

**Step 1: Write failing method-parity tests**

Cover each handler at least once with real behavior assertions, not just method existence:

- models reflect real configured provider/model defaults
- skills reflect real installed skill inventory
- config get/set/apply/schema round-trip
- logs tail returns actual log lines
- cron add/list/run/remove persists correctly
- nodes/devices/approvals mutate backing state and emit events
- browser/update/wizard methods return structured responses

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_method_parity`

Expected: FAIL in multiple areas because current implementations are placeholders.

**Step 3: Implement each remaining surface**

Important rule: remove placeholders. If a method cannot be production-real yet, mark it explicitly unsupported and keep it out of the parity-complete milestone.

**Step 4: Re-run tests**

Run: `cargo test -p epi-logos gate_method_parity`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/gate/models.rs epi-cli/src/gate/skills.rs epi-cli/src/gate/config.rs epi-cli/src/gate/system.rs epi-cli/src/gate/logs.rs epi-cli/src/gate/cron.rs epi-cli/src/gate/nodes.rs epi-cli/src/gate/devices.rs epi-cli/src/gate/approvals.rs epi-cli/src/gate/browser.rs epi-cli/src/gate/update.rs epi-cli/src/gate/wizard.rs epi-cli/tests/gate_method_parity.rs
git commit -m "feat: complete remaining gateway method parity surfaces"
```

## Task 9: Align the Electron App to the Real Gateway Contract

**Files:**
- Modify: `Idea/Pratibimba/System/epi-app/main/main.ts`
- Modify: `Idea/Pratibimba/System/epi-app/main/epi-claw-client.ts`
- Modify: `Idea/Pratibimba/System/epi-app/main/s3-gateway-client.ts`
- Modify: `Idea/Pratibimba/System/epi-app/renderer/controllers/epi-claw/gateway-client.ts`
- Modify: `Idea/Pratibimba/System/epi-app/renderer/controllers/epi-claw/controllers.ts`
- Modify: `Idea/Pratibimba/System/epi-app/renderer/stores/epiClawGatewayStore.ts`
- Create: `Idea/Pratibimba/System/epi-app/tests/main/gateway-parity.test.ts`

**Step 1: Write failing app parity tests**

Cover:

- app calls real `agent` and `chat.send`
- app handles `chat.delta`, `chat.final`, `chat.error`, `chat.aborted`
- app loads real skills/models/session metadata from gateway instead of hardcoded lists
- session default is resolved from gateway, not hardcoded `agent:main:main` assumptions where avoidable

**Step 2: Run the failing tests**

Run: `npm test -- --runInBand gateway-parity`

Expected: FAIL because app still contains hardcoded placeholder skills and mismatched assumptions.

**Step 3: Remove hardcoded placeholder surfaces**

Replace:

- hardcoded skill list in `main.ts`
- fake session assumptions that bypass gateway state
- passive fallback logic that tolerates missing runtime semantics

**Step 4: Re-run tests**

Run: `npm test -- --runInBand gateway-parity`

Expected: PASS.

**Step 5: Commit**

```bash
git add Idea/Pratibimba/System/epi-app/main/main.ts Idea/Pratibimba/System/epi-app/main/epi-claw-client.ts Idea/Pratibimba/System/epi-app/main/s3-gateway-client.ts Idea/Pratibimba/System/epi-app/renderer/controllers/epi-claw/gateway-client.ts Idea/Pratibimba/System/epi-app/renderer/controllers/epi-claw/controllers.ts Idea/Pratibimba/System/epi-app/renderer/stores/epiClawGatewayStore.ts Idea/Pratibimba/System/epi-app/tests/main/gateway-parity.test.ts
git commit -m "feat: align app with real gateway parity contract"
```

## Task 10: Bind Gateway Sessions to Khora/Vault/Graph Reality

**Files:**
- Modify: `epi-cli/src/agent/session.rs`
- Modify: `epi-cli/src/sesh/session.rs`
- Modify: `epi-cli/src/gate/sessions.rs`
- Modify: `epi-cli/src/gate/system.rs`
- Create: `epi-cli/tests/gate_khora_integration.rs`

**Step 1: Write failing cross-layer tests**

Cover:

- `epi agent session init` produces `vault_now_path`
- gateway session rows persist the same NOW path and day/session identity
- gateway health includes graph doctor summary and vault/session health

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos gate_khora_integration`

Expected: FAIL because the gateway session model is not yet wired to Khora session state.

**Step 3: Implement session binding**

Bind gateway sessions to:

- Khora session id
- day id
- NOW path
- workspace root
- bootstrap scope
- graph health snapshot summary

**Step 4: Re-run tests**

Run: `cargo test -p epi-logos gate_khora_integration`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/agent/session.rs epi-cli/src/sesh/session.rs epi-cli/src/gate/sessions.rs epi-cli/src/gate/system.rs epi-cli/tests/gate_khora_integration.rs
git commit -m "feat: bind gateway sessions to khora and graph state"
```

## Task 11: Add `epi up` as Honest Full-Stack Orchestration

**Files:**
- Create: `epi-cli/src/up.rs`
- Modify: `epi-cli/src/main.rs`
- Modify: `epi-cli/src/app/mod.rs`
- Modify: `epi-cli/src/techne/mod.rs`
- Create: `epi-cli/tests/up_command.rs`

**Step 1: Write failing `epi up` tests**

Cover ordered startup:

- repo env load
- Khora session init
- vault path checks
- graph doctor/up
- gateway start
- gateway readiness probe
- tmux session bootstrap
- cmux surface bootstrap
- PI pane spawn/attach
- app launch/connect readiness

**Step 2: Run the failing tests**

Run: `cargo test -p epi-logos up_command`

Expected: FAIL because `epi up` does not exist.

**Step 3: Implement orchestration**

Make `epi up` a coordinator only after all core surfaces are real. It must fail fast and report exact failing layer.

Add flags such as:

- `--no-app`
- `--no-graph`
- `--no-tmux`
- `--attach`
- `--json`

**Step 4: Re-run tests**

Run: `cargo test -p epi-logos up_command`

Expected: PASS.

**Step 5: Commit**

```bash
git add epi-cli/src/up.rs epi-cli/src/main.rs epi-cli/src/app/mod.rs epi-cli/src/techne/mod.rs epi-cli/tests/up_command.rs
git commit -m "feat: add full-stack epi up orchestration"
```

## Task 12: Run the Full Verification Matrix

**Files:**
- Modify: `docs/specs/S/S3-S3i-GATEWAY.md`
- Create: `docs/plans/2026-03-10-gateway-verification-matrix.md`

**Step 1: Run the Rust gateway suite**

Run: `cargo test -p epi-logos gate_`

Expected: all gateway contract, runtime, and integration tests pass.

**Step 2: Run the full CLI suite**

Run: `cargo test -p epi-logos`

Expected: full `epi-cli` suite passes with no gateway regressions.

**Step 3: Run app tests**

Run: `cd Idea/Pratibimba/System/epi-app && npm test`

Expected: gateway-facing app tests pass.

**Step 4: Run a manual end-to-end smoke**

Run:

```bash
cargo run -p epi-logos -- gate start
cargo run -p epi-logos -- agent session init
cargo run -p epi-logos -- app dev
```

Manual checks:

- app connects to `ws://localhost:18794`
- sending chat produces streaming deltas
- final transcript persists
- `chat.abort` stops the run
- session list shows real lineage
- skills/models reflect actual gateway state

**Step 5: Update the canonical docs**

Document:

- exact gateway authority
- session identity rules
- event semantics
- `epi up` startup ordering
- parity claim with Epi-Claw authority references

**Step 6: Commit**

```bash
git add docs/specs/S/S3-S3i-GATEWAY.md docs/plans/2026-03-10-gateway-verification-matrix.md
git commit -m "docs: record full gateway verification matrix"
```

## Execution Order

Implement in this exact order:

1. Contract freeze
2. Runtime state core
3. Session authority
4. Agent lane
5. Chat lane
6. Event/maintenance layer
7. Subagent lane
8. Remaining methods parity
9. App alignment
10. Khora/vault/graph binding
11. `epi up`
12. Full verification

## Non-Negotiable Guardrails

- Do not keep any placeholder method that claims parity while skipping real execution.
- Do not let the app rely on hardcoded skills/models/session defaults once the gateway owns them.
- Do not route PI execution outside the gateway for gateway-owned RPCs.
- Do not merge `epi up` before core gateway parity is real.
- Do not claim parity until the Rust tests and the app contract tests both pass.

## Recommended First Milestone

The first milestone that makes the system honest is:

- Task 1
- Task 2
- Task 3
- Task 4
- Task 5
- Task 6

At that point the gateway truly functions as a gateway for PI-agent sessions. Everything after that broadens parity and operational completeness.
