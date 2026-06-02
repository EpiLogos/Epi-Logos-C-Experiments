# S3/S3' Gateway and Universal NOW

This document describes the current S3/S3' gateway layer as implemented on `main` on 2026-03-11.

It is an implementation-state note for the live Rust gateway, not a speculative design document.

---

## Status

Current state: merged into `main`, implemented, and verified against the real repo/runtime.

Primary surfaces:
- `epi gate` in Rust under `epi-cli/src/gate/`
- gateway-aware app clients under `Idea/Pratibimba/System/epi-app`
- session/Khora binding through `.epi/session.json`
- parity contract and runtime tests under `epi-cli/tests/`

Verified on 2026-03-11:
- `cargo test -p epi-logos`
- `npm test` in `Idea/Pratibimba/System/epi-app`
- live PI check: `pi --version`
- live gateway smoke on the default S3' port `18794` with `connect -> agent -> agent.wait`

---

## What This Layer Is

S3 is the gateway control plane.

It owns:
- websocket connection lifecycle
- request/response RPC
- session registry and transcript access
- agent and chat run orchestration
- health, heartbeat, and presence events
- config, node, device, skills, cron, and wizard surfaces
- Electron OmniPanel compatibility

S3' is the live state plane.

It owns:
- shared runtime state and event fanout
- session authority and alias resolution
- per-run sequencing and reconnect-safe terminal snapshots
- Khora/NOW binding into session identity and health
- the bridge surface for future collective/world-state infrastructure

The practical rule is:
- imperative command execution lives in the gateway plane first
- shared synchronized state lives in the S3' plane first

---

## Source Of Truth

### Rust Gateway

The active gateway surface is implemented in:

- `epi-cli/src/gate/server.rs`
- `epi-cli/src/gate/protocol.rs`
- `epi-cli/src/gate/runtime.rs`
- `epi-cli/src/gate/sessions.rs`
- `epi-cli/src/gate/session_store.rs`
- `epi-cli/src/gate/transcripts.rs`
- `epi-cli/src/gate/system.rs`
- `epi-cli/src/gate/parity.rs`

### App Compatibility Surface

The active Electron compatibility surface lives in:

- `Idea/Pratibimba/System/epi-app/main/epi-claw-client.ts`
- `Idea/Pratibimba/System/epi-app/main/s3-gateway-client.ts`
- `Idea/Pratibimba/System/epi-app/renderer/controllers/epi-claw/gateway-client.ts`
- `Idea/Pratibimba/System/epi-app/renderer/stores/epiClawGatewayStore.ts`

### Canonical Specification

The canonical architecture and parity contract is tracked in:

- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`

---

## CLI Surface

The current `epi gate` command surface is:

```bash
epi gate status
epi gate start [--port 18794]
epi gate stop
epi gate methods
epi gate inspect
```

### What These Commands Own

**`status`**
- reports whether the gateway is configured/running
- reports bind address, port, and readiness information

**`start`**
- starts the live Rust websocket gateway
- supports explicit port override
- is what `epi up` uses for gateway bring-up

**`stop`**
- shuts down the managed gateway process

**`methods`**
- exposes the implemented RPC manifest for parity inspection

**`inspect`**
- surfaces runtime/session-level gateway state for operator debugging

---

## Protocol and Runtime Contract

The current live gateway contract is:

- connections receive `hello-ok` with protocol version `3`
- open sockets then receive `connect.challenge`
- the first client RPC must be `connect`
- request/response frames use `req`, `res`, and `event`
- event streams use monotonic per-run `seq`
- `agent.wait` resolves from cached terminal snapshots rather than ad hoc process polling
- transcript persistence is real JSONL storage, not an in-memory-only shim

Implemented and verified runtime lanes:

- `health`
- `status`
- `wake`
- `agent`
- `agent.wait`
- `chat.send`
- `chat.abort`
- `chat.history`

Implemented and verified parity/state surfaces also include:

- config/model/log usage mutation paths
- node/device/browser/approval state
- channels/cron/voice surfaces
- OmniPanel/Electron method compatibility
- heartbeat/tick/health event fanout

---

## Session Model

The implemented gateway session authority now includes:

- canonical `epi-claw`-compatible session keys
- alias and label-based resolution
- `sessionId`
- `dayId`
- `vaultNowPath`
- delivery metadata such as channel/thread/group fields
- model/provider overrides
- subagent lineage via `spawnedBy`

Important session rules:

- the canonical wire/storage key remains the compatible session key
- aliases and labels are first-class lookup surfaces
- `spawnedBy` is only valid for subagent session keys
- nested subagent spawning is rejected
- once set, subagent lineage is immutable

Khora integration:

- gateway session creation binds to active `.epi/session.json` state when present
- health/system surfaces inherit that binding so session identity and NOW context stay aligned

---

## PI Relationship

The gateway is PI-open, but PI is not the gateway.

Current behavior:

- the gateway owns validation, session mutation, run registration, event emission, transcript writes, and terminal snapshot caching
- the PI runtime is invoked as the execution engine behind `agent` and chat flows
- one-shot PI execution now follows the real current CLI contract using `pi -p ...`
- `epi agent install` now attempts a real npm install of `@mariozechner/pi-coding-agent` when `pi` is missing

This means the S3 runtime is no longer a facade around hoped-for agent behavior. It is the real execution spine, with PI attached as a live runtime dependency where appropriate.

---

## App and Infra Alignment

The current repo now aligns on the real S3' default port:

- default gateway port: `18794`

That port is the one used for the live smoke verification, not a synthetic alternate test port.

`epi up` now coordinates the real startup order:

1. load repo env
2. initialize or reuse Khora session state
3. verify NOW/vault path readiness
4. optionally start and verify graph services
5. start the gateway and probe websocket readiness
6. optionally bootstrap tmux
7. optionally launch the app
8. optionally attach cmux

Supported `epi up` flags:

- `--no-app`
- `--no-graph`
- `--no-tmux`
- `--attach`
- `--json`

---

## Verification Snapshot

The current evidence for S3/S3' on `main` is:

- full Rust suite passes with `cargo test -p epi-logos`
- Electron tests pass with `npm test`
- the installed PI binary is live and reports `0.57.1`
- a real websocket smoke on port `18794` completed the `connect -> agent -> agent.wait` flow with terminal `status: ok`

The relevant contract coverage includes:

- full parity manifest tests
- OmniPanel/Electron compatibility tests
- runtime state tests
- session authority/store contract tests
- chat send/abort/history tests
- agent lane and wait-path tests
- tick/health/heartbeat fanout tests
- Khora integration tests

---

## Bottom Line

S3/S3' is now a real gateway runtime in this repo.

It is no longer a stub, no longer a placeholder facade, and no longer documented as if it were still waiting on future architecture. The live Rust gateway, the app client compatibility surface, the real PI-backed execution lane, and the default-port verification path are all now part of the implemented system on `main`.
