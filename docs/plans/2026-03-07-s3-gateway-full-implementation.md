# S3 Gateway Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full Rust S3 gateway in `epi-cli` with complete `epi-claw` method parity, the full `epi gate` operator command base including configuration setup/augmentation and an interactive config TUI, subagent-ready session/bootstrap/workspace semantics for the planned VAK system, Electron OmniPanel compatibility on a dedicated test port, and a first real bridge into the future SpaceTimeDB-hosted Universal NOW.

**Architecture:** The gateway remains the imperative control plane and must preserve the `epi-claw` protocol, method surface, and operator affordances. `epi gate` is the full operator surface for configuration, inspection, setup, augmentation, and live control, including an interactive TUI path for gateway configuration comparable to the current `epi-claw`/OpenClaw operator workflow. The Universal NOW remains a separate declarative state plane; this plan only builds the first one-way bridge into that plane after gateway parity and Electron verification are complete. Session identity keeps an `epi-claw`-compatible canonical key while layering NOW/VAK aliases, sub-session metadata, active-agent binding, bootstrap scope, and workspace scope.

**Tech Stack:** Rust (`clap`, `serde`, `serde_json`, `color-eyre`, `tokio`, `tokio-tungstenite` or `axum`, `uuid`, `tempfile`, `rcgen`, `ed25519-dalek`, `sha1`, `subtle`), cargo integration tests, real filesystem fixtures, WebSocket protocol tests, Electron app tests in `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src`, Vitest, Playwright, and a later SpaceTimeDB Rust/TypeScript pilot.

---

## Locked Decisions

- Full `epi-claw` gateway parity is required. There is no "OmniPanel-only" reduced implementation target.
- The Rust gateway is sovereign. Existing `epi-claw` code is a reference authority, not a runtime dependency.
- The gateway must stay open to PI/VAK evolution: active agent switching, subagent invocation, session aliases, session-scoped bootstrap, and session-scoped workspace roots are day-one requirements.
- Canonical session keys remain wire/storage-native in the `epi-claw` style for the first implementation. NOW/VAK naming is added as alias and metadata, not as a replacement.
- `epi gate` is the canonical operator surface for this tranche. Config setup, augmentation, inspection, and application must be available through CLI commands and an interactive TUI flow inside `epi-cli`.
- The Electron app in `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src` is a first-class compatibility target and must be used for end-to-end verification.
- Implementation changes for this tranche land in `epi-cli`. The Electron app is treated as a compatibility harness and verification target rather than an implementation repo unless a later verified blocker proves that impossible.
- Gateway development and Electron gateway verification use a dedicated S3 test port: `8421`.
- SpaceTimeDB is future-facing but not optional. The bridge into the Universal NOW is part of this plan, though it lands after gateway parity and Electron verification.

## No-Hidden-Losses Scope Rule

The implementation is not complete until every method group below has:

1. a Rust handler,
2. a method-level parity test,
3. at least one higher-level workflow test where relevant,
4. explicit inclusion in the Electron parity matrix if the Electron app consumes or may consume it,
5. operator-surface coverage where relevant through `epi gate` CLI/TUI flows, especially for configuration, setup, and augmentation.

### Canonical Method Inventory

- `connect`
- `agent.identity.get`
- `agent.wait`
- `agents.list`
- `browser.request`
- `web.login.start`
- `web.login.wait`
- `channels.status`
- `channels.logout`
- `chat.history`
- `chat.abort`
- `chat.send`
- `chat.inject`
- `config.get`
- `config.schema`
- `config.set`
- `config.patch`
- `config.apply`
- `cron.list`
- `cron.status`
- `cron.add`
- `cron.update`
- `cron.remove`
- `cron.run`
- `cron.runs`
- `device.pair.list`
- `device.pair.approve`
- `device.pair.reject`
- `device.token.rotate`
- `device.token.revoke`
- `exec.approval.request`
- `exec.approval.resolve`
- `exec.approvals.get`
- `exec.approvals.set`
- `exec.approvals.node.get`
- `exec.approvals.node.set`
- `logs.tail`
- `models.list`
- `skills.status`
- `skills.bins`
- `skills.install`
- `skills.update`
- `usage.status`
- `usage.cost`
- `node.pair.request`
- `node.pair.list`
- `node.pair.approve`
- `node.pair.reject`
- `node.pair.verify`
- `node.rename`
- `node.list`
- `node.describe`
- `node.invoke`
- `node.invoke.result`
- `node.event`
- `sessions.list`
- `sessions.preview`
- `sessions.resolve`
- `sessions.patch`
- `sessions.reset`
- `sessions.delete`
- `sessions.compact`
- `last-heartbeat`
- `set-heartbeats`
- `system-presence`
- `system-event`
- `talk.mode`
- `tts.status`
- `tts.enable`
- `tts.disable`
- `tts.convert`
- `tts.setProvider`
- `tts.providers`
- `voicewake.get`
- `voicewake.set`
- `update.run`
- `wizard.start`
- `wizard.next`
- `wizard.cancel`
- `wizard.status`

## Target File Layout

```text
epi-cli/
  Cargo.toml
  src/
    lib.rs
    main.rs
    gate/
      mod.rs
      config.rs
      protocol.rs
      server.rs
      auth.rs
      tls.rs
      lock.rs
      sessions.rs
      workspace.rs
      bootstrap.rs
      chat.rs
      channels.rs
      nodes.rs
      cron.rs
      approvals.rs
      models.rs
      skills.rs
      logs.rs
      system.rs
      update.rs
      wizard.rs
      browser.rs
      devices.rs
      omnipanel.rs
      spacetimedb_bridge.rs
      parity.rs
  tests/
    support/mod.rs
    gate_parity_manifest.rs
    gate_protocol.rs
    gate_auth.rs
    gate_lock_tls.rs
    gate_sessions.rs
    gate_chat.rs
    gate_config_system.rs
    gate_nodes_devices_browser.rs
    gate_channels_cron_voice.rs
    gate_spacetimedb_bridge.rs
    gate_electron_smoke.rs

/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/
  main/
    epi-claw-client.ts
    s4-websocket-client.ts
  renderer/
    controllers/epi-claw/
      gateway-client.ts
      controllers.ts
      types.ts
    stores/
      epiClawGatewayStore.ts
    components/
      OmniPanel.tsx
      omni/contracts/panelRpcParity.ts
  tests/
    omni/
      parity-matrix.test.ts
      gateway-client.test.ts
      gateway-client-parity.test.ts
      chat-controller.test.ts
      chat-panel.test.tsx
      overview-sessions.test.tsx
      channels-panel.test.tsx
      skills-panel.test.tsx
      session-subagent-routing.test.ts
    e2e/
      omnipanel-gateway.spec.ts
      omnipanel-gateway-rust.spec.ts
      omnipanel-session-subagent.spec.ts
```

## Testing Rules

- Prefer real filesystem, real WebSocket frames, and real spawned gateway processes over mocks.
- Use temp directories for session stores, bootstrap roots, workspace roots, TLS assets, and config fixtures.
- Treat the Electron app as a real client integration target, not as a mocked protocol consumer.
- Every method group must have both low-level Rust verification and at least one higher-level workflow test where the method participates in a user flow.
- No "parity" claims without evidence from the real method inventory and real Electron client traffic.

### Task 1: Establish the gateway parity manifest, test harness, and crate dependencies

**Files:**
- Modify: `epi-cli/Cargo.toml`
- Create: `epi-cli/src/lib.rs`
- Create: `epi-cli/src/gate/parity.rs`
- Create: `epi-cli/tests/support/mod.rs`
- Create: `epi-cli/tests/gate_parity_manifest.rs`
- Modify: `epi-cli/src/gate/mod.rs`

**Step 1: Write the failing Rust parity manifest test**

Create `epi-cli/tests/gate_parity_manifest.rs` and assert that the Rust gateway exposes the complete method inventory plus the fixed test port.

```rust
#[test]
fn gateway_method_manifest_is_complete() {
    let methods = epi::gate::parity::method_names();
    assert!(methods.contains(&"chat.send"));
    assert!(methods.contains(&"skills.install"));
    assert!(methods.contains(&"sessions.compact"));
    assert_eq!(epi::gate::parity::TEST_GATEWAY_PORT, 8421);
}
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_parity_manifest gateway_method_manifest_is_complete -- --exact --nocapture`
Expected: FAIL because there is no gate parity manifest and the crate does not yet expose these symbols.

**Step 3: Write minimal implementation**

- Add runtime dependencies for async server/test support.
- Add `src/lib.rs` so cargo integration tests can import crate modules directly.
- Create `src/gate/parity.rs` with:
  - `METHOD_NAMES`
  - `DEFAULT_GATEWAY_PORT = 8420`
  - `TEST_GATEWAY_PORT = 8421`
  - method-group helper functions for later tests
- Create `tests/support/mod.rs` with `TestEnv`, `spawn_epi`, and WebSocket helper scaffolding reused by later gateway tests.
- Wire `mod parity;` through `src/gate/mod.rs`
- Export a Rust-owned compatibility manifest so the Electron app can verify against the same method inventory without making this tranche depend on app-repo changes.

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_parity_manifest -- --nocapture`
Expected: PASS with the full manifest enumerated.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/Cargo.toml /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/lib.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/mod.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/parity.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/support/mod.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_parity_manifest.rs
git commit -m "test: add s3 gateway parity manifest and harness"
```

### Task 2: Add gateway CLI lifecycle, config loading, and dedicated test-port support

**Files:**
- Modify: `epi-cli/src/gate/mod.rs`
- Create: `epi-cli/src/gate/config.rs`
- Create: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/tests/gate_protocol.rs`
- Modify: `epi-cli/src/main.rs`

**Step 1: Write the failing lifecycle test**

Create `epi-cli/tests/gate_protocol.rs` to spawn `epi gate start --port 8421` against a temp config and assert `epi gate status` reports the port and bind mode.

```rust
#[test]
fn gate_status_reports_explicit_test_port() {
    let handle = spawn_epi(["gate", "start", "--port", "8421"], TestEnv::temp());
    let out = run_epi(["gate", "status", "--json"], handle.env());
    assert!(out.stdout.contains("\"port\":8421"));
    assert!(out.stdout.contains("\"running\":true"));
}
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_protocol gate_status_reports_explicit_test_port -- --exact --nocapture`
Expected: FAIL because `epi gate start` and structured status do not exist.

**Step 3: Write minimal implementation**

- Expand `GateCmd` to include the full operator shell for `status`, `start`, `stop`, `config`, `methods`, `inspect`, `subscribe`, `pair`, `bootstrap`, and `workspace`
- Add `GatewayConfig` with:
  - default port `8420`
  - test port override support
  - bind mode
  - auth/tls placeholders
  - bootstrap/workspace placeholders
- Implement minimal process-local server lifecycle and status reporting.
- Add the initial `epi gate config` command surface so later tasks can fill in `show`, `set`, `patch`, `apply`, and `tui` without breaking CLI shape.

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_protocol -- --nocapture`
Expected: PASS for lifecycle/status/config shape tests.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/main.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/mod.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/config.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_protocol.rs
git commit -m "feat: add s3 gateway lifecycle and config shell"
```

### Task 3: Implement the protocol kernel, `connect` handshake, and auth scaffolding

**Files:**
- Create: `epi-cli/src/gate/protocol.rs`
- Create: `epi-cli/src/gate/auth.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/tests/gate_auth.rs`

**Step 1: Write the failing protocol/auth tests**

Add Rust tests for:
- `connect` must be the first request
- server emits challenge before secure connect
- token/password/device auth validation shape
- hello response includes protocol/version/features

```rust
#[tokio::test]
async fn connect_must_be_first_request() {
    let client = TestGatewayClient::connect(TestEnv::temp(), 8421).await;
    let err = client.request("chat.history", json!({})).await.unwrap_err();
    assert!(err.message.contains("connect"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_auth connect_must_be_first_request -- --exact --nocapture`
Expected: FAIL because frame parsing and connect enforcement do not exist.

**Step 3: Write minimal implementation**

- Define frame structs for `req`, `res`, `event`, `hello-ok`
- Implement first-request enforcement for `connect`
- Add placeholder token/password/device auth validation
- Add protocol version and feature advertisement
- Keep the Rust hello/connect semantics explicit enough for the existing Electron gateway client to consume unchanged

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_auth -- --nocapture`
Expected: PASS for connect-first and hello/auth shape tests.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/protocol.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/auth.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_auth.rs
git commit -m "feat: add s3 gateway protocol and connect auth kernel"
```

### Task 4: Port gateway lock, TLS runtime, and fingerprint handling

**Files:**
- Create: `epi-cli/src/gate/lock.rs`
- Create: `epi-cli/src/gate/tls.rs`
- Modify: `epi-cli/src/gate/config.rs`
- Create: `epi-cli/tests/gate_lock_tls.rs`

**Step 1: Write the failing lock/TLS tests**

Add real filesystem tests for:
- lock acquisition on a config hash path
- stale lock cleanup
- self-signed cert generation
- TLS fingerprint computation

```rust
#[test]
fn generates_self_signed_gateway_cert_and_fingerprint() {
    let runtime = GatewayTlsRuntime::load_or_generate(TestEnv::temp()).unwrap();
    assert!(runtime.cert_path.exists());
    assert!(runtime.fingerprint_sha256.starts_with("sha256:"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_lock_tls -- --nocapture`
Expected: FAIL because lock/tls modules do not exist.

**Step 3: Write minimal implementation**

- Port single-instance lock semantics from `epi-claw`
- Port TLS asset loading and self-signed generation semantics
- Expose TLS fingerprint in `status`/`inspect`

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_lock_tls -- --nocapture`
Expected: PASS with real lock files and cert assets created in temp dirs.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/lock.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/tls.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/config.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_lock_tls.rs
git commit -m "feat: add s3 gateway lock and tls runtime"
```

### Task 5: Implement session identity, aliases, subagent activation, workspace roots, and bootstrap scope

**Files:**
- Create: `epi-cli/src/gate/sessions.rs`
- Create: `epi-cli/src/gate/workspace.rs`
- Create: `epi-cli/src/gate/bootstrap.rs`
- Create: `epi-cli/tests/gate_sessions.rs`

**Step 1: Write the failing session identity tests**

Add Rust tests that assert:
- canonical keys persist
- alias and label resolution works
- active agent id can switch within a session
- subagent lineage is persisted
- workspace root derives from session + subagent scope
- bootstrap state derives from session + subagent scope

```rust
#[test]
fn resolves_session_by_alias_without_losing_canonical_key() {
    let store = SessionStore::new(TestEnv::temp());
    let canonical = store.create("agent:main:main");
    store.add_alias(&canonical, "NOW-2026-03-07-main").unwrap();
    let resolved = store.resolve("NOW-2026-03-07-main").unwrap();
    assert_eq!(resolved.canonical_key, "agent:main:main");
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_sessions resolves_session_by_alias_without_losing_canonical_key -- --exact --nocapture`
Expected: FAIL because the session model does not exist.

**Step 3: Write minimal implementation**

- Create a session store with:
  - canonical key
  - aliases
  - label
  - active agent id
  - subagent lineage
  - workspace root
  - bootstrap scope
- Implement resolver by canonical key, alias, and label
- Keep the wire key canonical and surface NOW/VAK identity as metadata

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_sessions -- --nocapture`
Expected: PASS with real filesystem-backed store behavior.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/sessions.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/workspace.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/bootstrap.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_sessions.rs
git commit -m "feat: add s3 session alias bootstrap and workspace semantics"
```

### Task 6: Implement `sessions.*` and `chat.*` methods against real transcript/session fixtures

**Files:**
- Modify: `epi-cli/src/gate/sessions.rs`
- Create: `epi-cli/src/gate/chat.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/tests/gate_chat.rs`

**Step 1: Write the failing session/chat method tests**

Add Rust tests for:
- `sessions.list`
- `sessions.preview`
- `sessions.resolve`
- `sessions.patch`
- `sessions.reset`
- `sessions.delete`
- `sessions.compact`
- `chat.history`
- `chat.send`
- `chat.abort`
- `chat.inject`

```rust
#[tokio::test]
async fn chat_send_writes_transcript_and_returns_run_id() {
    let client = TestGatewayClient::connected_with_temp_store(8421).await;
    let res = client.request("chat.send", json!({"sessionKey":"agent:main:main","message":"hello"})).await.unwrap();
    assert!(res["runId"].is_string());
    assert_transcript_contains(client.store_path(), "hello");
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_chat -- --nocapture`
Expected: FAIL because the methods are not wired.

**Step 3: Write minimal implementation**

- Implement all `sessions.*` methods on real store/transcript fixtures
- Implement chat run creation, transcript append, history read, abort markers, and inject path
- Keep payloads extensible for future PI/VAK fields

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_chat -- --nocapture`
Expected: PASS with real transcript/session mutations.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/sessions.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/chat.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_chat.rs
git commit -m "feat: add s3 chat and session rpc methods"
```

### Task 7: Implement config, system, models, logs, usage, update, and wizard methods

**Files:**
- Create: `epi-cli/src/gate/system.rs`
- Create: `epi-cli/src/gate/models.rs`
- Create: `epi-cli/src/gate/logs.rs`
- Create: `epi-cli/src/gate/update.rs`
- Create: `epi-cli/src/gate/wizard.rs`
- Create: `epi-cli/src/gate/config_tui.rs`
- Modify: `epi-cli/src/gate/config.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/tests/gate_config_system.rs`
- Create: `epi-cli/tests/gate_config_tui.rs`

**Step 1: Write the failing operator-surface tests**

Add Rust tests covering:
- `config.get`
- `config.schema`
- `config.set`
- `config.patch`
- `config.apply`
- `epi gate config tui`
- `last-heartbeat`
- `set-heartbeats`
- `system-presence`
- `system-event`
- `models.list`
- `logs.tail`
- `usage.status`
- `usage.cost`
- `update.run`
- `wizard.start`
- `wizard.next`
- `wizard.cancel`
- `wizard.status`

```rust
#[test]
fn config_apply_persists_and_reports_new_version() {
    let out = run_gate_rpc("config.apply", json!({"patch":{"gateway":{"port":8421}}}));
    assert_eq!(out["ok"], true);
    assert!(out["version"].is_string());
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_config_system -- --nocapture`
Expected: FAIL because these handlers do not exist.

**Step 3: Write minimal implementation**

- Add config read/schema/mutation pipeline with real file persistence
- Add operator-facing config setup and augmentation flows through `epi gate config`
- Add an interactive config TUI that can browse domains, edit staged values, surface validation issues, and apply or cancel changes without leaving `epi-cli`
- Add heartbeat/presence/system event support
- Add model catalog and usage stubs backed by real config/state
- Add log tail fixture support
- Add update and wizard state machines with persisted state

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_config_system -- --nocapture`
Expected: PASS with real config file and runtime state mutations.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/system.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/models.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/logs.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/update.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/wizard.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/config.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/config_tui.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_config_system.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_config_tui.rs
git commit -m "feat: add s3 config system and operator methods"
```

### Task 8: Implement node, browser, web-login, device, and exec-approval methods

**Files:**
- Create: `epi-cli/src/gate/nodes.rs`
- Create: `epi-cli/src/gate/browser.rs`
- Create: `epi-cli/src/gate/devices.rs`
- Create: `epi-cli/src/gate/approvals.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/tests/gate_nodes_devices_browser.rs`

**Step 1: Write the failing transport-extension tests**

Add Rust tests for:
- `browser.request`
- `web.login.start`
- `web.login.wait`
- `device.pair.*`
- `device.token.*`
- `exec.approval.*`
- `exec.approvals.*`
- `node.*`

```rust
#[test]
fn node_invoke_records_result_for_later_lookup() {
    let run = run_gate_rpc("node.invoke", json!({"node":"alpha","command":"inspect"}));
    let id = run["resultId"].as_str().unwrap();
    let result = run_gate_rpc("node.invoke.result", json!({"resultId":id}));
    assert_eq!(result["ok"], true);
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_nodes_devices_browser -- --nocapture`
Expected: FAIL because the transport-extension handlers do not exist.

**Step 3: Write minimal implementation**

- Implement node registry/result cache
- Implement browser and web-login request tracking state
- Implement device pairing/token lifecycle
- Implement exec-approval stores and per-node overrides

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_nodes_devices_browser -- --nocapture`
Expected: PASS with real persisted pairing/approval/result state.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/nodes.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/browser.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/devices.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/approvals.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_nodes_devices_browser.rs
git commit -m "feat: add s3 node browser device and approval methods"
```

### Task 9: Implement channels, cron, talk, TTS, voicewake, and skill propagation for channel invocation

**Files:**
- Create: `epi-cli/src/gate/channels.rs`
- Create: `epi-cli/src/gate/cron.rs`
- Create: `epi-cli/src/gate/skills.rs`
- Modify: `epi-cli/src/gate/system.rs`
- Modify: `epi-cli/src/gate/server.rs`
- Create: `epi-cli/tests/gate_channels_cron_voice.rs`

**Step 1: Write the failing channel/skills tests**

Add Rust tests for:
- `channels.status`
- `channels.logout`
- `cron.*`
- `talk.mode`
- `tts.*`
- `voicewake.*`
- `skills.status`
- `skills.bins`
- `skills.install`
- `skills.update`

Add a workflow test asserting a channel-targeted invocation can resolve a skill/bin surface before dispatch.

```rust
#[test]
fn skill_install_updates_channel_invocation_surface() {
    run_gate_rpc("skills.install", json!({"skill":"telegram-squad"}));
    let status = run_gate_rpc("skills.status", json!({}));
    assert!(status["skills"].to_string().contains("telegram-squad"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_channels_cron_voice -- --nocapture`
Expected: FAIL because the handlers do not exist.

**Step 3: Write minimal implementation**

- Add real channel status/logout state
- Add persisted cron store and run log
- Add skills registry/bin discovery/install/update behavior
- Thread skill surfaces into channel-facing invocation metadata so Telegram/Slack style flows can resolve them cleanly

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_channels_cron_voice -- --nocapture`
Expected: PASS with real persisted state and no mock-only skill propagation.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/channels.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/cron.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/skills.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/system.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_channels_cron_voice.rs
git commit -m "feat: add s3 channels cron voice and skill propagation"
```

### Task 10: Prove Electron/OmniPanel compatibility from the Rust gateway contract

**Files:**
- Create: `epi-cli/src/gate/omnipanel.rs`
- Create: `epi-cli/tests/gate_omnipanel_contract.rs`
- Modify: `epi-cli/src/gate/parity.rs`
- Modify: `epi-cli/src/gate/server.rs`

**Step 1: Write the failing Electron contract tests**

Add Rust-side contract tests for:
- hello/connect handshake alignment
- session alias and active-agent fields
- subagent invocation metadata round-trip
- panel parity matrix against the full Rust manifest consumed by the existing Electron app

```rust
#[test]
fn omnipanel_contract_surfaces_alias_and_active_agent_metadata() {
    let hello = epi::gate::omnipanel::hello_contract();
    assert!(hello.features.methods.contains(&"sessions.resolve"));
    assert!(hello.session_metadata.contains(&"alias"));
    assert!(hello.session_metadata.contains(&"activeAgentId"));
    assert!(hello.session_metadata.contains(&"subagentLineage"));
    assert!(hello.session_metadata.contains(&"workspaceRoot"));
    assert!(hello.session_metadata.contains(&"bootstrapScope"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_omnipanel_contract -- --nocapture`
Expected: FAIL because the Rust gateway does not yet expose a compatibility contract for the Electron client.

**Step 3: Write minimal implementation**

- Export a Rust-owned compatibility manifest for the existing Electron client
- Encode hello/connect/session metadata expectations from the Rust side
- Keep the contract grounded in the full parity manifest rather than app-local duplication

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_omnipanel_contract -- --nocapture`
Expected: PASS with a stable Rust-side compatibility contract ready for the existing OmniPanel path.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/omnipanel.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/parity.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/server.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_omnipanel_contract.rs
git commit -m "test: add rust-owned omnipanel compatibility contract"
```

### Task 11: Run end-to-end Electron verification against the Rust gateway on port 8421

**Files:**
- Create: `epi-cli/tests/gate_electron_smoke.rs`
- Create: `docs/plans/2026-03-07-s3-electron-verification-notes.md`

**Step 1: Write the failing end-to-end specs**

Add Rust-owned verification helpers and a verification checklist for:
- connect to Rust gateway on `8421`
- open OmniPanel
- send chat and observe history/run state
- switch active agent within a session
- resolve a session by alias
- verify channels and skills surfaces render correctly

```rust
#[test]
fn electron_verification_targets_rust_gateway_on_8421() {
    let plan = epi::gate::omnipanel::electron_verification_plan();
    assert_eq!(plan.port, 8421);
    assert!(plan.required_flows.contains(&"session alias"));
    assert!(plan.required_flows.contains(&"subagent switch"));
    assert!(plan.required_flows.contains(&"skills surface"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_electron_smoke -- --nocapture`
Expected: FAIL because the Rust gateway does not yet define the end-to-end verification contract.

**Step 3: Write minimal implementation**

- Add a test helper that starts the Rust gateway fixture on `8421`
- Document the exact Electron verification flows against the live Rust server
- Keep the Electron app unchanged unless a later verification run proves a Rust-side contract mismatch that cannot be resolved inside `epi-cli`

**Step 4: Run tests to verify they pass**

Run:
- `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_electron_smoke -- --nocapture`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npm run test:e2e -- --grep "gateway|session|skills|channels"`

Expected: PASS with the Electron app connected to the live Rust server, or exact compatibility blockers recorded in the verification notes.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_electron_smoke.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/docs/plans/2026-03-07-s3-electron-verification-notes.md
git commit -m "test: verify electron omnipanel against rust s3 gateway"
```

### Task 12: Build the first SpaceTimeDB bridge into the Universal NOW

**Files:**
- Create: `epi-cli/src/gate/spacetimedb_bridge.rs`
- Create: `epi-cli/tests/gate_spacetimedb_bridge.rs`
- Create: `docs/plans/2026-03-07-s3-universal-now-bridge-notes.md`

**Step 1: Write the failing bridge test**

Add a Rust test that simulates gateway state changes and asserts they are transformed into bridge payloads for:
- presence
- session surface
- activity event
- M-clock placeholder state

```rust
#[test]
fn bridge_emits_session_and_presence_surfaces() {
    let bridge = SpacetimeBridge::new(TestEnv::temp());
    bridge.publish_presence("operator-1");
    bridge.publish_session("agent:main:main", Some("NOW-2026-03-07-main"));
    let events = bridge.drain_test_events();
    assert!(events.iter().any(|e| e.kind == "presence"));
    assert!(events.iter().any(|e| e.kind == "session_surface"));
}
```

**Step 2: Run tests to verify they fail**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_spacetimedb_bridge -- --nocapture`
Expected: FAIL because the bridge does not exist yet.

**Step 3: Write minimal implementation**

- Add a bridge abstraction with a no-network local test sink
- Publish session/presence/activity data from gateway events
- Document the initial table targets and reducer boundaries in the bridge notes doc

**Step 4: Run tests to verify they pass**

Run: `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_spacetimedb_bridge -- --nocapture`
Expected: PASS with deterministic bridge payload emission.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/src/gate/spacetimedb_bridge.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/epi-cli/tests/gate_spacetimedb_bridge.rs /Users/admin/Documents/Epi-Logos\ C\ Experiments/docs/plans/2026-03-07-s3-universal-now-bridge-notes.md
git commit -m "feat: add first universal now bridge from s3 gateway"
```

### Task 13: Final parity discharge, method-by-method evidence, and remaining-gap ledger

**Files:**
- Create: `docs/plans/2026-03-07-s3-gateway-parity-discharge.md`
- Modify: `docs/specs/S/S3-S3i-GATEWAY.md`
- Modify: `docs/plans/2026-03-07-s3-gateway-full-implementation.md`

**Step 1: Write the failing discharge checklist**

Create a discharge template that lists every canonical method and requires:
- Rust handler path
- low-level test name
- Electron coverage status
- known deltas

```md
| Method | Rust Handler | Rust Test | Electron Coverage | Status |
| --- | --- | --- | --- | --- |
| chat.send | gate/chat.rs | gate_chat::chat_send_writes_transcript_and_returns_run_id | omnipanel-gateway-rust.spec.ts | pending |
```

**Step 2: Run verification commands and capture results**

Run:
- `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npm run test`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npm run test:e2e`

Expected: all required suites PASS, or the discharge doc records exact blockers.

**Step 3: Write minimal implementation**

- Fill the discharge ledger with exact evidence
- Update the S3 spec only if verified implementation reality required a documented clarification
- Record any explicitly accepted non-critical follow-on work

**Step 4: Re-run the focused commands and verify no regression**

Run:
- `cd /Users/admin/Documents/Epi-Logos C Experiments/epi-cli && cargo test --test gate_parity_manifest --test gate_chat --test gate_channels_cron_voice -- --nocapture`
- `cd /Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src && npm run test -- --run tests/omni/parity-matrix.test.ts tests/omni/gateway-client-parity.test.ts`

Expected: PASS, with the discharge document matching actual evidence.

**Step 5: Commit**

```bash
git add /Users/admin/Documents/Epi-Logos\ C\ Experiments/docs/plans/2026-03-07-s3-gateway-parity-discharge.md /Users/admin/Documents/Epi-Logos\ C\ Experiments/docs/specs/S/S3-S3i-GATEWAY.md /Users/admin/Documents/Epi-Logos\ C\ Experiments/docs/plans/2026-03-07-s3-gateway-full-implementation.md
git commit -m "docs: discharge s3 gateway parity implementation"
```

## Recommended Execution Order

1. Task 1 through Task 4
2. Task 5 through Task 6
3. Task 7 through Task 9
4. Task 10 through Task 11
5. Task 12
6. Task 13

## Primary Risks

1. Session identity complexity could sprawl if alias, canonical key, active agent, bootstrap scope, and workspace scope are not centralized in one session model.
2. Electron compatibility could regress if the Rust gateway drifts from the current hello/connect/event assumptions before the client tests are expanded.
3. Skills propagation can become hand-wavy unless channel-facing invocation tests assert real skill/bin state.
4. SpaceTimeDB can prematurely swallow imperative concerns if the bridge boundary is not kept one-way in the first tranche.

## Definition of Done

1. Every canonical gateway method listed in this plan exists in the Rust S3 gateway and has explicit parity evidence.
2. Session logic supports canonical keys, aliases, active-agent switching, subagent lineage, bootstrap scope, and workspace scope without breaking the existing OmniPanel path.
3. The Electron app can connect to the live Rust gateway on port `8421` and pass real chat/session/config/channel/skills flows.
4. Skills surfaces are available to channel-oriented invocation paths without hidden scope loss.
5. A first deterministic bridge from gateway state into the future Universal NOW exists and is tested.
6. The discharge ledger names any remaining gaps explicitly. No silent omissions.
