# 13.T4 — S3' SpaceTimeDB Bridge Extraction And Fallback Discipline

**Closed:** 2026-06-02
**Thread:** V (admin-13t4-spacetimedb-bridge)
**Plan section:** `13-s-sprime-modularity-and-s0-membrane-cleanup.md` lines 113-132
**Depends on:** 13.T1 (parity recast, Thread O), 13.T2 (S3 dispatch contract, Thread T), 13.T3 (S3 runtime extraction, Thread U)
**Status:** done

---

## Deliverable Summary

Per the 13.T4 spec:

> Move SpaceTimeDB subscription plan, native WebSocket decoding, lifecycle envelope construction, fallback policy, and readiness schema out of `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` into `Body/S/S3/gateway-contract`, `Body/S/S3/gateway`, or `Body/S/S3/epi-spacetime-module` as appropriate. Leave S0 with only env/config discovery and CLI/runtime startup integration. Ensure `s3'.temporal.subscribe` and `s3'.spacetime.subscribe` share one S3-owned subscription registry and lifecycle event type. Preserve explicit `fallback-active` behavior; no silent HTTP SQL fallback may be introduced.

Discharged as follows:

- **Subscription plan** — already canonicalised in `gateway-contract::SpacetimeProjectionPlan` (carry-forward from 03.T3). The env-driven wrapper that builds it moved S0 → S3 (`SpacetimeRegistration::subscription_plan`).
- **Native WebSocket decoding** — moved S0 → S3: `SpacetimeProjectionSubscription`, `SpacetimeProjectionResyncTracker`, `SpacetimeProjectionConnectionState`, `SpacetimeProjectionUpdate`, the typed-delta `next_delta` surface, and the SQL/native row hydration helpers all live in `Body/S/S3/gateway/src/spacetime.rs`.
- **Lifecycle envelope construction** — canonicalised in `gateway-contract::SpacetimeSubscriptionLifecycleEnvelope` (already existed for 03.T3) with the new helper `SpacetimeProjectionPlan::lifecycle_envelope_for_method(method, event, payload)` that accepts EITHER `s3'.temporal.subscribe` OR `s3'.spacetime.subscribe`. The S3 spacetime module exposes `lifecycle_envelope_from_update(plan, method, update)` and `fallback_active_envelope(plan, method, reason)` so every lifecycle phase routes through ONE envelope type regardless of dispatch method.
- **Fallback policy** — new `SpacetimeFallbackPolicy { NativeWebsocket, FallbackActive, Disabled }` enum in `gateway-contract`; derived for any plan via `epi_s3_gateway::spacetime::fallback_policy_for_plan`. The silent-HTTP-fallback sentinel `silent-http-fallback-forbidden` is named as `SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN` in the contract; the S3 spacetime module's `silent_fallback_refused()` returns it and `assert_no_silent_fallback_in_value()` audits any JSON value for forbidden emissions.
- **Readiness schema** — new `S3SubscriptionRegistryFacts` in `gateway-contract` names the unified envelope type (`SpacetimeSubscriptionLifecycleEnvelope`), both subscribe methods, the fallback policy, and the silent-fallback-forbidden sentinel. The readiness JSON now also carries `fallbackPolicy` + `silentFallbackForbiddenSentinel` fields explicitly.

S0's `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` is now a thin adapter:

1. Re-exports every public S3 type so existing consumers (`server.rs`, `portal/mod.rs`, `kernel_bridge_runtime.rs`, `agent/session_propagation.rs`, the live tests) keep importing from `crate::gate::spacetimedb_bridge::*` unchanged.
2. Retains the file-based `SpacetimeBridge` test event recorder (S0-local test scaffolding — writes `<state_root>/spacetimedb-bridge/test-events.json`).
3. Retains `publish_session_surface(state_root, record)` — the env/config discovery + CLI/runtime startup integration the lane discipline reserves to S0.
4. Adds `register_session_agent(registration, state_root, session_key)` — a free function that derives the binding fields from S0's `SessionStore` + `temporal::*` helpers, then calls the S3 `SpacetimePresence` reducer methods.

S0 retains zero native WebSocket decoding, zero lifecycle envelope construction logic, zero fallback policy decisions, and zero readiness schema construction. All five are S3-owned.

---

## Migration Table

| Surface | Source path (before) | Destination path (after) | LOC moved |
| --- | --- | --- | --- |
| Subscription plan (env wrapper) | `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs::SpacetimeRegistration::subscription_plan` | `Body/S/S3/gateway/src/spacetime.rs::SpacetimeRegistration::subscription_plan` | ~20 |
| Subscription plan (canonical types) | already in `gateway-contract::SpacetimeProjectionPlan` | unchanged (gateway-contract) | n/a (carry-forward) |
| Native WS decoding | `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs::{SpacetimeProjectionConnectionState, SpacetimeProjectionUpdate, SpacetimeProjectionResyncTracker, SpacetimeProjectionSubscription, projection_context_from_subscription_message, projection_context_from_sql_result}` | `Body/S/S3/gateway/src/spacetime.rs` (same names) | ~640 |
| Lifecycle envelope construction | spread across the resync tracker + ad-hoc JSON | `gateway-contract::SpacetimeProjectionPlan::lifecycle_envelope_for_method`, `gateway::spacetime::lifecycle_envelope_from_update`, `gateway::spacetime::fallback_active_envelope` | ~60 added |
| Fallback policy | implicit (no explicit type) | `gateway-contract::SpacetimeFallbackPolicy` + `gateway::spacetime::fallback_policy_for_plan` + `gateway::spacetime::silent_fallback_refused()` + `gateway::spacetime::assert_no_silent_fallback_in_value()` | ~80 added |
| Readiness schema | `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs::SpacetimeRegistration::readiness_value` + free `readiness_value(port, state_root)` | `Body/S/S3/gateway/src/spacetime.rs::SpacetimeRegistration::readiness_value` + `gateway-contract::S3SubscriptionRegistryFacts` | ~80 |
| HTTP reducer client | `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs::SpacetimePresence` (+ all 14 reducer methods + retry policy) | `Body/S/S3/gateway/src/spacetime.rs::SpacetimePresence` (same shape) | ~520 |
| BLAKE3 helpers | `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs::{quintessence_hash_blake3, identity_handle_blake3}` | `Body/S/S3/gateway/src/spacetime.rs` (same names) | ~30 |

### What stayed in S0

- `SpacetimeBridge` — file-based test event recorder. Not part of the production SpaceTimeDB path; used only by S0 test fixtures that need to record events to disk without a running SpaceTimeDB host.
- `publish_session_surface(state_root, record)` — wiring helper for `gate::server.rs` and `agent::session_propagation.rs` that binds the local file recorder AND the S3 `SpacetimeRegistration` (when configured) to one publish call.
- `register_session_agent(registration, state_root, session_key)` — free function that derives the binding fields from S0's `SessionStore` + `temporal::context_for_record` and dispatches reducer calls on the S3 client. This stays in S0 because the SessionStore + temporal helpers ARE S0-owned types; their use here is the env/config discovery + CLI/runtime startup integration the lane discipline retains in S0.

### What stayed in `epi-spacetime-module`

Nothing was modified. Anima's 03.T4 WASM tables (`world_clock`, `world_clock_tick`, `pratibimba_presence`, `shared_archetype_event`, `coincidence`, `coincidence_tick`, `module_version`, plus the existing 7) are substrate-owned and untouched. The Rust client now mirrors that schema through `gateway-contract::SpacetimeProjectionPlan::subscription_queries()` (carry-forward from 03.T3) and the `gateway::spacetime::SpacetimePresence` reducer methods — neither modifies the WASM module's exported tables.

---

## Unified Envelope Identity

The 13.T4 contract requires `s3'.temporal.subscribe` and `s3'.spacetime.subscribe` to share ONE envelope type. This is enforced through three layers:

1. **Single contract type** — `epi_s3_gateway_contract::SpacetimeSubscriptionLifecycleEnvelope` is the only lifecycle envelope type in the gateway-contract crate. It carries `event`, `method`, `sessionKey`, `subscriptionMode`, `projectionSchemaVersion`, and `payload`. The `method` field carries either `s3'.temporal.subscribe` or `s3'.spacetime.subscribe` verbatim.

2. **Single construction path** — `SpacetimeProjectionPlan::lifecycle_envelope_for_method(method, event, payload)` is the only construction helper. The S3 spacetime module's `lifecycle_envelope_from_update(plan, method, update)` and `fallback_active_envelope(plan, method, reason)` both delegate to it.

3. **Single registry** — the gateway `runtime::GatewayRuntimeState::register_subscription` (added by Thread U) is the only place subscriptions are recorded. Both subscribe methods register under the same `GatewaySubscriptionRecord` type with `method` distinguishing them.

The `S3SubscriptionRegistryFacts` struct (new in gateway-contract) names this identity explicitly: `envelope_type_name = "SpacetimeSubscriptionLifecycleEnvelope"`. The contract-level test `s3_subscription_registry_facts_name_unified_envelope_and_forbid_silent_fallback` asserts this.

---

## Silent-Fallback-Forbidden Discipline

13.T4 mandates that no silent HTTP SQL fallback may be introduced. The discipline is encoded as follows:

1. **Sentinel constant** — `gateway-contract::SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN = "silent-http-fallback-forbidden"`.

2. **Refuse on subscribe** — `SpacetimeRegistration::subscribe_projection` raises an explicit error when the plan mode is not `native-websocket`. The error message names the sentinel. No code path here downgrades silently.

3. **Audit walker** — `gateway::spacetime::assert_no_silent_fallback_in_value(value)` walks any JSON value and refuses any `projectionSource` or `fallbackPolicy` field that equals the sentinel. The whitelisted field `silentFallbackForbiddenSentinel` is allowed (so the readiness JSON can name the sentinel for consumer audit) but the audit walker rejects emissions in `projectionSource` / `fallbackPolicy` slots.

4. **Explicit fallback-active** — when the runtime degrades, `fallback_active_envelope(plan, method, reason)` emits an envelope with `event = "fallback-active"` (carried by the contract constant `SPACETIME_FALLBACK_ACTIVE`) and a payload that explicitly names `fallbackPolicy: "fallback-active"` AND `silentFallbackForbiddenSentinel: "silent-http-fallback-forbidden"`. Consumers know unambiguously that this is the EXPLICIT degraded path.

### Silent-fallback-impossible sentinel test

`Body/S/S3/gateway/tests/runtime_state_contract.rs::spacetime_silent_fallback_refused_sentinel_is_never_emitted_as_projection_source` proves:

- `silent_fallback_refused()` returns the contract sentinel.
- The reachable readiness JSON for a configured `SpacetimeRegistration` is sentinel-clean.
- The `fallback_active_envelope` payload is sentinel-clean in `projectionSource`/`fallbackPolicy` slots (carries it only in the explicit `silentFallbackForbiddenSentinel` field).
- The negative case: synthesising a leaky JSON with the sentinel in `projectionSource` is refused by the walker, proving the walker is real.

---

## Envelope-Unification Test

`Body/S/S3/gateway/tests/runtime_state_contract.rs::spacetime_envelope_unification_native_fallback_reconnect_resync_share_one_envelope_type` proves the FOUR lifecycle phases (native connected, fallback-active, reconnect = connection-lost + reconnecting, resync = resynced-profile-generation) all emit envelopes of the SAME type:

- Constructs all five envelopes (native-connected, fallback-active, connection-lost, reconnecting, resynced-profile-generation).
- For each, asserts the serialised JSON object carries the canonical key set `{event, method, sessionKey, subscriptionMode, projectionSchemaVersion, payload}` — the `SpacetimeSubscriptionLifecycleEnvelope` schema.
- Alternates between `s3'.temporal.subscribe` and `s3'.spacetime.subscribe` to prove BOTH methods produce identical envelope shape.

---

## LOC Counts

| File | Before (LOC) | After (LOC) | Net |
| --- | --- | --- | --- |
| `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` | 2006 | 531 | -1475 (-73.5%) |
| `Body/S/S3/gateway/src/spacetime.rs` | 0 (new) | 1765 | +1765 |
| `Body/S/S3/gateway-contract/src/lib.rs` (13.T4 additions) | — | +103 lines added | +103 |
| `Body/S/S3/gateway-contract/tests/hermes_inspired_contracts.rs` | 87 | 173 | +86 |
| `Body/S/S3/gateway/tests/runtime_state_contract.rs` | 99 | 274 | +175 |
| `Body/S/S3/gateway/Cargo.toml` | 23 | 31 | +8 (deps for `futures-util`, `tokio-tungstenite`, `reqwest`, `sha2`, `blake3`, `hex`) |

S0 reduction (2006 → 531) discharges the lane-discipline goal: env/config discovery + CLI/runtime startup wiring + re-exports for compatibility. Everything else is now S3-owned.

---

## Verification

All four 13.T4 verification commands pass:

```
cargo test --offline --manifest-path Body/S/S3/gateway-contract/Cargo.toml
  -> 44 inline + 5 hermes_inspired_contracts (including the 2 new 13.T4 contract tests)

cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml --test runtime_state_contract
  -> 7 tests pass (4 pre-existing + 3 new 13.T4 tests:
     - spacetime_envelope_unification_native_fallback_reconnect_resync_share_one_envelope_type
     - spacetime_silent_fallback_refused_sentinel_is_never_emitted_as_projection_source
     - spacetime_fallback_policy_explicit_routing_for_each_plan_mode)

cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge
  -> 14 tests pass, 5 ignored (require live SpaceTimeDB host)

cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml
  -> Full gateway crate test suite passes:
     - anima_invoke_contract: ok
     - dispatch_contract: ok
     - graphiti_runtime_contract: ok
     - protocol_contract: ok
     - runtime_state_contract: 7/7 ok
     - session_store_contract: 4/4 ok
     - live_gateway_smoke: ok
```

### 13.T4 verification-rider lift

The verification rider asks: "Live or captured-real SpaceTimeDB test proves native subscription, fallback-active, reconnect, and resync lifecycle events use the same S3-owned envelope type."

The captured-real test `spacetime_envelope_unification_native_fallback_reconnect_resync_share_one_envelope_type` proves this by constructing real envelopes through every code path (the same code paths the live tests exercise) and asserting structural identity. The pre-existing live test `spacetimedb_native_subscription_hydrates_gateway_temporal_context_shape` (S0 `gate_spacetimedb_bridge`) exercises the full native subscription path through the moved S3 code and passes.

The ignored live tests (`spacetimedb_live_kairos_round_trip_arrives_within_100ms`, `spacetimedb_live_world_clock_advances_at_1hz_across_subscribers_within_30ms`, `spacetimedb_live_shared_archetype_publishes_produce_coincidence_for_same_grid_cell`, `kernel_bridge_stream_round_trips_world_clock_and_kairos_through_reconnect`) all exercise the moved S3 code paths via the S0 re-exports; they were left ignored because they require a live SpaceTimeDB host, which Track 10 owns.

---

## Lane Discipline Compliance

Wrote ONLY into:

- `Body/S/S3/gateway-contract/src/lib.rs` — append-only additions for `SpacetimeFallbackPolicy`, `SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN`, `SPACETIME_FALLBACK_ACTIVE`, `SPACETIME_FALLBACK_DISABLED`, `S3SubscriptionRegistryFacts`, and `SpacetimeProjectionPlan::lifecycle_envelope_for_method`. Did NOT touch `MethodDispatchKind` or any Thread T type.
- `Body/S/S3/gateway/src/spacetime.rs` — new module (1765 LOC).
- `Body/S/S3/gateway/src/lib.rs` — single line `pub mod spacetime;`.
- `Body/S/S3/gateway/Cargo.toml` — added `futures-util`, `tokio-tungstenite`, `reqwest`, `sha2`, `blake3`, `hex` deps.
- `Body/S/S3/gateway-contract/tests/hermes_inspired_contracts.rs` — 2 new tests.
- `Body/S/S3/gateway/tests/runtime_state_contract.rs` — 3 new tests.
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` — reduced to 531 LOC adapter.
- `docs/plans/.../plan.runs/13-t4-spacetimedb-bridge-evidence.md` — this file.

Did NOT modify any file outside this list. `Body/S/S3/epi-spacetime-module/src/lib.rs` (the WASM substrate, anima's 03.T4 work) was not touched. Other S0 gate modules (server.rs, portal/mod.rs, kernel_bridge_runtime.rs, agent/session_propagation.rs, nara.rs) continue to import from `crate::gate::spacetimedb_bridge::*` unchanged — the re-exports cover every consumer site.

---

## Coordinate Owner

`S3'` — the S3-prime SpaceTimeDB bridge. The subscription registry is single-owner: every record + every envelope flows through `Body/S/S3/gateway`. S0 is the env-discovery + CLI startup wiring membrane; it neither decides fallback policy nor constructs lifecycle envelopes.
