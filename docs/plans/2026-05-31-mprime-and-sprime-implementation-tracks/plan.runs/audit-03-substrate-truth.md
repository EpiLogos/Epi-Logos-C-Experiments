# Track 03 — Substrate-Truth Audit

- **Date:** 2026-06-01
- **Auditor:** `admin-audit-track03` (parallel audit Thread D)
- **Scope:** Read-only substrate-truth gate for Track 03 (S3/S3' Gateway + SpaceTimeDB) pending tranches: **T3, T4, T5, T6, T6.5, T7**.
- **Skipped:** **03.T2** — anima holds a fresh lease (`owner=anima-mdev-20260601`, expires 2026-06-01T23:39:52Z, runId `20260601T213952Z-03-T2`). Not probed, not graded.
- **Write scope honored:** This file only. No source mutated. No ledger marks applied.

---

## 1. Background — what 08.T8 evidence already proved

08.T8 ran on 2026-06-01T19:59:13Z (codex). The cited passing tests that overlap Track 03 substrate:

| Command | Result |
|---|---|
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge` | **10/10 passed** |
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_runtime_contract` | **7/7 passed** |
| `cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml` | gateway route/runtime/session/Graphiti contract tests all passed (note: cited as all-green; see §6 below — `dispatch_contract` is now **failing** after 03.T1 added two new methods, exposing the active T2 lane gap) |

03.T1 (closed 2026-06-01T21:39:44Z) added the two new s3' subscribe methods to the contract surface. The closure narrative says the live gateway subprocess **emits both methods in its features.methods catalog at WebSocket hello-ok**, and the full `gate_spacetimedb_bridge` suite (10/10) and 16/16 gateway-contract tests pass.

So as of 03.T1 closure, the **subscription contract** (table list, query plans, lifecycle envelopes, schema/reducer/protocol versions, method names) is **landed in `Body/S/S3/gateway-contract` and `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`**. The **WASM SpaceTimeDB module** (`Body/S/S3/epi-spacetime-module/src/lib.rs`) and **frontend consumers** (Theia, deprecated Tauri) **have not been extended**.

---

## 2. 03.T3 — Native SpaceTimeDB WebSocket subscription completion

### Deliverable summary (from plan)
- Finish `SpacetimeRegistration::subscribe_projection` + `SpacetimeProjectionSubscription` decoding `InitialSubscription`, `SubscribeMultiApplied`, `TransactionUpdate`, `TransactionUpdateLight`, inserts/deletes/resync.
- Expose a typed delta stream (not only `next_context`) so consumers can distinguish session / Kairos / global temporal / world clock / presence / coincidence updates.
- Wire reducer calls for `register_gateway`, `register_agent`, `register_client`, `bind_session_temporal_context`, `bind_kairos_surface`, `bind_global_temporal_surface` into the gateway publish path with idempotent retry + observable failure.
- Replace `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` `NativeWebSocket` stub with a real native subscription consumer that updates runtime state + emits Tauri events.
- Preserve the S0 bridge while making the S3 crate contract the source of subscription shapes.

### Substrate paths checked

| Path | LOC | Status |
|---|---|---|
| `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` | (large) | Carries `SpacetimeRegistration::subscribe_projection` (line 729), `SpacetimeProjectionSubscription` (line 379) with `next_update` returning `SpacetimeProjectionUpdate` (line 788) plus legacy `next_context` (line 818). Resync tracker handles connection-lost / reconnecting / stale-profile / resynced-profile-generation / degraded-but-subscribable. Reducer call wrappers all present (register_gateway L911, register_agent L940, register_client L968, bind_session_temporal_context L992, bind_kairos_surface L1050, bind_global_temporal_surface L1090). |
| `Body/S/S3/gateway-contract/src/lib.rs` | 1982 | Owns the subscription contract: `subscription_database_update` (L993) decodes `SubscribeMultiApplied`, `InitialSubscription` (snake + camel), `TransactionUpdateLight`, `TransactionUpdate.status.Committed`. Row decoders cover session/Kairos/global temporal surfaces. New shared-cosmos tables (world_clock, pratibimba_presence, shared_archetype_event, coincidence) and their SELECT queries are in the contract (L71-92, L915-923). |
| `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` | — | **`SpacetimeMode::NativeWebSocket` is STILL a stub** (L89-92: `tracing::info!("SpaceTimeDB native WebSocket mode — stub, falling back to polling"); Ok(())`). And `Body/M/epi-tauri/DEPRECATED.md` declares the entire tree migration-source-only (Theia-only canon recast 2026-06-01 evening). |

### Verification commands run

```bash
CARGO_TARGET_DIR=/tmp/epi-cargo-target-audit-03 cargo test --offline \
  --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge
```

Result: **10/10 passed** in 92.10s. Tests cover: native subscription projection plan; live gateway+SpaceTimeDB harness in-process; reducer POSTs; resync tracker stale/degraded states; lite-mode HTTP fallback; bridge events from real state changes; health snapshot reporting projection readiness.

```bash
CARGO_TARGET_DIR=/tmp/epi-cargo-target-audit-03 cargo test --offline \
  --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_runtime_contract
```

Result: **7/7 passed**. Tests cover one projection source fanning out to IDE + `/body` consumers, replay with staleness, disconnect/reconnect/stale/resync ordering, late-subscriber cache, capability/VAK invocation rejection.

```bash
CARGO_TARGET_DIR=/tmp/epi-cargo-target-audit-03 cargo test --offline \
  --manifest-path Body/S/S3/gateway-contract/Cargo.toml
```

Result: **16/16 passed**. Includes `spacetimedb_projection_contract_builds_native_subscribe_multi_and_decodes_updates`.

### 08.T8 evidence cross-reference

08.T8 explicitly cited `gate_spacetimedb_bridge` 10/10 (including native subscription projection, gateway temporal context, live gateway client registration, bridge events for real state changes) and `kernel_bridge_runtime_contract` 7/7 (including one projection source fanning out to IDE and /body consumers). All three suites still green here.

### Disposition: **Partial**

- **Landed:** S0 bridge typed delta stream + decoder for all four named message types; resync semantics; reducer-call wrappers for all six named reducers; gateway publish path emits bridge events from real state changes; the kernel-bridge runtime fans projections to IDE + /body consumer abstractions; gateway-contract owns subscription shapes (S3 crate authority).
- **Gap:** The named Tauri-side replacement — "replace `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` native-mode stub with a real native subscription consumer that updates runtime state and emits Tauri events" — has **NOT** been done; the stub still falls back to polling. Per the post-canon Track 05 recast `Body/M/epi-tauri` is now deprecated (migration-source-only), so this deliverable likely needs to be **respec'd** to the Theia kernel-bridge consumer in `Idea/Pratibimba/System` (Track 05 T2/T3 territory) — but as written in plan body T3 still owns a `/body` consumer milestone (the alpha "100 ms KairosSurface delta" success criterion).

### Recommended ledger mark (do not run)

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark 03.T3 --status review \
  --evidence "Partial. S0 bridge + gateway-contract decoder + reducer wrappers + kernel-bridge fanout landed; gate_spacetimedb_bridge 10/10 (includes native subscription, live gateway harness, bridge events from real state changes, resync tracker), kernel_bridge_runtime_contract 7/7, gateway-contract 16/16 — all on 2026-06-01 admin-audit-track03 probe. Tauri NativeWebSocket replacement deliverable is open: Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs:89-92 still logs 'stub, falling back to polling' and the entire Body/M/epi-tauri tree is now DEPRECATED (Theia-only canon recast 2026-06-01 evening); needs respec to the Theia kernel-bridge live consumer or explicit forward to Track 05. Live KairosSurface 100ms milestone has no consuming-surface substrate yet."
```

---

## 3. 03.T4 — Shared-cosmos tables and scheduled reducers

### Deliverable summary (from plan)
- Extend `Body/S/S3/epi-spacetime-module/src/lib.rs` with `world_clock`, `world_clock_tick`, `pratibimba_presence`, `shared_archetype_event`, `coincidence`, `coincidence_tick` tables.
- Implement reducers `advance_world_clock`, `bind_pratibimba_presence`, `publish_shared_archetype_event`, `detect_coincidences`.
- Encode quaternionic identity rules: `quintessence_hash` as BLAKE3 fingerprint.
- Add module protocol versioning fields.
- Decide deterministic clock-input path (scheduled reducer vs gateway-triggered cadence).

### Substrate paths checked

| Path | LOC | Status |
|---|---|---|
| `Body/S/S3/epi-spacetime-module/src/lib.rs` | **432** | Contains only `GatewayInstance`, `AgentInstance`, `ClientRegistration`, `SessionSurface`, `KairosSurface`, `GlobalTemporalSurface`, `TemporalEvent` tables and existing reducers (`register_gateway`, `heartbeat_gateway`, `register_agent`, `register_client`, `bind_session_temporal_context`, `bind_kairos_surface`, `bind_global_temporal_surface`, `publish_temporal_event`). |

```bash
grep -nE "world_clock|pratibimba_presence|shared_archetype_event|coincidence|advance_world_clock|...|quintessence_hash|clock_protocol_version|kerykeion_version" \
  Body/S/S3/epi-spacetime-module/src/lib.rs
# (no matches)
```

### Verification commands run
T4 verification is `spacetime build` + live local SpaceTimeDB harness; this audit did not invoke `spacetime` (binary not present / out of audit scope). Cargo unit-test surface is empty (cdylib, no `tests/`). Module crate type is `cdylib` for WASM deployment.

### 08.T8 evidence cross-reference
08.T8 did **NOT** cite any test against `Body/S/S3/epi-spacetime-module`. The contract-level world_clock/pratibimba_presence/shared_archetype_event/coincidence tables exist only in `Body/S/S3/gateway-contract` (as table-name string lists + SELECT queries) — **the WASM module does not implement them**.

### Disposition: **Forward**

The contract surface (gateway-contract) names the four shared-cosmos tables. The actual WASM SpaceTimeDB module does not implement them, has no reducers for them, has no protocol-version fields. No `spacetime build` evidence has been produced for this tranche.

### Recommended ledger mark (do not run)

```bash
# leave pending — substrate truly does not carry the deliverable.
# Optional record-keeping mark:
node .codex/scripts/m-dev-plan-assess.mjs --mark 03.T4 --status pending \
  --evidence "Forward as of 2026-06-01 admin-audit-track03. Body/S/S3/epi-spacetime-module/src/lib.rs (432 LOC) implements only the 03.T1-baseline tables (GatewayInstance, AgentInstance, ClientRegistration, SessionSurface, KairosSurface, GlobalTemporalSurface, TemporalEvent) and their reducers. None of world_clock / world_clock_tick / pratibimba_presence / shared_archetype_event / coincidence / coincidence_tick tables, none of advance_world_clock / bind_pratibimba_presence / publish_shared_archetype_event / detect_coincidences reducers, and no clock_protocol_version / kerykeion_version / quintessence_hash exist in the module. Gateway-contract names them at the projection-contract layer only."
```

---

## 4. 03.T5 — `/body` and Theia kernel-bridge consumption slice

### Deliverable summary (from plan)
- Stable TS-facing stream contract for `/body` and Theia: connection status, subscription status, latest-row cache, delta event, resync event, protocol-mismatch event.
- `/body` Tauri native mode consumes live deltas for `KairosSurface`, `GlobalTemporalSurface`, `world_clock`.
- Theia kernel-bridge API: subscribe world clock / Pratibimba presence / shared archetype events, invoke gateway RPC, observe connection state.
- M5-3 surfaces consume the S3 stream contract, not direct SpaceTimeDB.
- Frontend-safe privacy mappers.

### Substrate paths checked

| Path | Status |
|---|---|
| `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` | NativeWebSocket = stub (L89-92). `Body/M/epi-tauri/DEPRECATED.md` retires the tree. |
| `Idea/Pratibimba/System/extensions/m-extension-runtime/src/common/shared-bridge.ts` | Has late-subscriber cache + upstream-subscription fanout pattern; **no** `subscribeWorldClock` / `subscribePratibimbaPresence` / `subscribeSharedArchetypeEvent` methods. |
| `Idea/Pratibimba/System/extensions/integrated-composition/**` | References `KairosSurface` / `GlobalTemporalSurface` / `world_clock` in `integrated-state.ts`, `state-coordinator.ts`, but these are static-shape references (extension contract preflights), not live subscription consumers. |
| `Body/S/S0/epi-cli/src/...` (kernel-bridge runtime) | The S0 KernelBridgeRuntime fans projection updates to IDE + /body consumer types (`kernel_bridge_runtime_contract` 7/7), so the backend stream contract surface exists. |

### Verification commands run

The plan body calls for `npm run test --prefix Body/M/epi-tauri` — but `Body/M/epi-tauri` is now deprecated migration-source-only. Did not run; would be misleading evidence per current canon.

### 08.T8 evidence cross-reference
08.T8 cited `pnpm --dir Idea/Pratibimba/System test:contracts` 73/73 and "Integrated UI surfaces focused integrated tests 72/72" — but those exercise the contract shape, not live SpaceTimeDB delta consumption. 08.T9 evidence (Thread C, 99/99) names Track 03 T6.5 Hen vault-bridge as a production-blocker and Track 05 T4 ide-shell-m0-m5 chrome as a beta-blocker — i.e., release-gate substrate already knows T5/T6.5 are open.

### Disposition: **Forward**

Backend kernel-bridge fanout exists; the named consumer-surface deliverables (Tauri NativeWebSocket consumer; Theia `subscribeWorldClock` / `subscribePratibimbaPresence` / `subscribeSharedArchetypeEvent` kernel-bridge methods; live-delta `/body` consumption) do not exist in current substrate. The plan body still names Tauri as the consumer — needs respec to Theia under the post-canon Track 05 recast.

### Recommended ledger mark (do not run)

```bash
# Leave pending — needs respec + real Theia consumer.
node .codex/scripts/m-dev-plan-assess.mjs --mark 03.T5 --status pending \
  --evidence "Forward as of 2026-06-01 admin-audit-track03. Backend kernel-bridge fanout substrate landed (kernel_bridge_runtime_contract 7/7 — one projection source fans to IDE + /body consumer abstractions, late-subscriber replay, disconnect/reconnect/stale/resync ordering). But the named consumer surfaces don't exist: Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs:89-92 NativeWebSocket is still a stub and the tree is DEPRECATED (Theia-only canon recast 2026-06-01); Idea/Pratibimba/System/extensions/m-extension-runtime/src/common/shared-bridge.ts has fanout but no subscribeWorldClock/Presence/SharedArchetypeEvent methods; integrated-composition refs are static contract shapes, not live delta consumption. T5 needs respec from Tauri to Theia per canon revision before re-claim."
```

---

## 5. 03.T6 — Graphiti runtime compatibility and temporal reference bridge

### Deliverable summary (from plan)
- Keep `Body/S/S3/graphiti-runtime` as the compatibility boundary.
- Ensure gateway session + global temporal SpaceTimeDB rows carry only `graphiti_namespace_ref` and `graphiti_session_arc_id`.
- Surface Graphiti runtime status through S3 readiness + subscription metadata.
- Route S5/S5' Graphiti invocation through gateway RPC with session/day/NOW/namespace/privacy envelopes.
- Prevent SpaceTimeDB reducers/rows from storing Graphiti episode bodies.

### Substrate paths checked

| Path | LOC | Status |
|---|---|---|
| `Body/S/S3/graphiti-runtime/src/lib.rs` | 774 | Carries `EpisodeAttrs`, `episode insert payload`, `runtime_authority`, `compatibility_http_adapter` flag, runtime URL config (S3-owned), episode VAK fields. `runtimeOwner=S3'`, `runtimeAuthority=GRAPHITI_RUNTIME_AUTHORITY`, HTTP compatibility adapter clearly flagged. |
| `Body/S/S3/gateway-contract/src/lib.rs` | 1982 | Decodes `graphiti_namespace_ref` (L1115) and `graphiti_session_arc_id` (L1116) into projection rows. `GraphitiAdapterContract` lives at L1299-1332 (per plan source spec). |
| `Body/S/S3/epi-spacetime-module/src/lib.rs` | 432 | `SessionSurface.graphiti_arc_id` (string ID only, L91); `GlobalTemporalSurface.graphiti_namespace_ref` + `graphiti_session_arc_id` (L135-136). No episode-body or memory-body fields. |

### Verification commands run

```bash
CARGO_TARGET_DIR=/tmp/epi-cargo-target-audit-03 cargo test --offline \
  --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml
```

Result: **5/5 passed** (`episode_attrs_default_is_empty`, `episode_attrs_with_vak_carries_canonical_fields`, `episode_attrs_with_vak_uses_primed_night_for_pratibimba_direction`, `episode_insert_carries_vak_attrs_through_serialisation`, `episode_insert_without_vak_still_serialises_with_empty_attrs`).

```bash
CARGO_TARGET_DIR=/tmp/epi-cargo-target-audit-03 cargo test --offline \
  --manifest-path Body/S/S3/gateway/Cargo.toml --test graphiti_runtime_contract
```

Result: **6/6 passed** — exactly the verification command the plan body names. Includes:
- `graphiti_kernel_resonance_payload_keeps_s3_runtime_and_s2_graph_origin_clear`
- `graphiti_provenance_events_are_built_without_s0_gate_state`
- `graphiti_runtime_config_is_s3_owned_and_http_adapter_is_compatibility_mode`
- `graphiti_deposit_payload_rejects_identity_mutation_and_keeps_session_arc`
- `graphiti_session_memory_envelope_keeps_s3_runtime_and_s5_invocation_split`
- `graphiti_kernel_profile_observation_payload_carries_s2_anchor_without_private_state`

### 08.T8 evidence cross-reference
08.T8 cited "cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml passed all gateway route/runtime/session/Graphiti contract tests" — `graphiti_runtime_contract` 6/6 still passes here.

### Disposition: **Partial** (genuinely close to Landed; one verification missing)

- **Landed:** Graphiti runtime crate carries S3-owned compatibility boundary with HTTP-adapter flag, VAK fields, S5-invocation split clearly delineated. SpaceTimeDB tables carry only `graphiti_namespace_ref` + `graphiti_session_arc_id` (no episode bodies). Contract tests prove kernel-resonance / provenance / deposit / session-memory / kernel-profile-observation payloads all separate runtime from invocation governance and reject identity mutation. 6/6 `graphiti_runtime_contract` + 5/5 `episode_vak` pass.
- **Gap:** The plan's "promoted live Graphiti compatibility test lane" — start real Graphiti runtime, deposit unique proof token through gateway RPC, search it back, verify SpaceTimeDB projection rows contain only namespace/arc references — is not visible in current cargo evidence. There's also no readiness-surface assertion that Graphiti runtime status flows through S3 subscription metadata (only that the compatibility runtime is started via `epi gate graphiti start`).

### Recommended ledger mark (do not run)

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark 03.T6 --status review \
  --evidence "Partial - close to Landed. cargo test --offline --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml = 5/5 episode_vak; cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml --test graphiti_runtime_contract = 6/6 (exactly the plan body verification command, all six contract tests green: runtime_config S3-owned + http-adapter compatibility, kernel-resonance/kernel-profile-observation/session-memory/provenance/deposit payloads keep S3-runtime vs S5-invocation split and reject identity mutation). Body/S/S3/epi-spacetime-module SessionSurface + GlobalTemporalSurface carry only graphiti_namespace_ref + graphiti_session_arc_id, no episode bodies. Gap: live Graphiti compatibility test lane (start real Graphiti runtime, deposit unique proof token via gateway RPC, search-back, verify SpaceTimeDB rows hold only refs) and readiness/subscription-metadata exposure for Graphiti runtime status not yet evident; needs a live-lane run + readiness probe before --status done."
```

---

## 6. 03.T6.5 — S1 vault gateway surface (`s1'.vault.*` + `s1'.semantic.*`) over Hen

### Deliverable summary (from plan)
- Add `s1'.vault.{read_file, write_file, move_file, rename_file, append_block, update_frontmatter, list_dir, watch}` gateway methods. Writes through Hen; reads gateway-mediated for governed/protected, direct-FS via Theia otherwise.
- Add `s1'.semantic.{suggest_links, neighbors_of, search, by_block}` gateway methods wrapping `Body/S/S1/hen-compiler-core/src/smart_env.rs` `suggest_link_candidates`.
- Vault writes invoke Hen wikilink-integrity reconciliation via `parse_wikilinks`; renames update referring `[[X]] → [[Y]]` atomically; reject orphan-creating writes.
- Surface staleness on semantic responses.
- Privacy class enforcement: protected paths inaccessible without governed protected capability.

### Substrate paths checked

| Path | Status |
|---|---|
| `Body/S/S1/hen-compiler-core/src/smart_env.rs` (614 LOC) | **Hen substrate exists**: `LinkCandidateRequest` (L11), `LinkCandidateResponse` (L39), `suggest_link_candidates` (L109), three candidate kinds `ExplicitOutlink`/`SemanticSource`/`SemanticBlock` (L22-24), cosine ordering, candidate-ranking helpers. |
| `Body/S/S1/hen-compiler-core/src/wikilinks.rs` (163 LOC) | `parse_wikilinks` at L19. |
| `Body/S/S0/epi-cli/src` + `Body/S/S3` | **No** `s1'.vault.*` or `s1'.semantic.*` (or alt `s1.vault.*` / `s1.semantic.*`) gateway methods. `grep -rn` returned no hits. |

### Verification commands run
The plan body asks for live integration tests against a real fixture vault (rename inbound-wikilinks update, move-folder propagation, direct-Theia-FS-write detection, semantic-suggest cosine + staleness, privacy-protected-path exclusion). None are runnable yet because no gateway methods exist.

### 08.T8 evidence cross-reference
08.T8 did not cite anything Hen-related. 08.T9 evidence (Thread C, 2026-06-01T20:38:41Z) explicitly **names Track 03 T6.5 as a production-blocker** ("Track 03 T6.5 Hen vault-bridge as production-blocker for Canon Studio writes" — see plan.state.json L1166).

### Disposition: **Forward**

Hen substrate (`smart_env.rs`, `wikilinks.rs`) is present and shaped correctly for the deliverable. The actual gateway methods, write-path delegation to Hen, wikilink integrity reconciliation in the write path, staleness flags on semantic responses, and protected-capability gating are all not implemented at the gateway boundary.

### Recommended ledger mark (do not run)

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark 03.T6.5 --status pending \
  --evidence "Forward as of 2026-06-01 admin-audit-track03. Hen substrate present: Body/S/S1/hen-compiler-core/src/smart_env.rs (614 LOC, suggest_link_candidates + LinkCandidateRequest/Response + ExplicitOutlink/SemanticSource/SemanticBlock kinds with cosine ordering) and Body/S/S1/hen-compiler-core/src/wikilinks.rs (163 LOC, parse_wikilinks). But Body/S/S0/epi-cli/src and Body/S/S3 carry NO s1'.vault.* or s1'.semantic.* gateway methods (or alt s1.vault.* / s1.semantic.*) — grep returned no hits. None of the named write-path wikilink-integrity reconciliation, staleness markers on semantic responses, or protected-capability gating exist at the gateway boundary. 08.T9 release-gate evidence already names this tranche as a production-blocker."
```

---

## 7. 03.T7 — Multi-client soak, privacy audit, release gate

### Deliverable summary (from plan)
- Repeatable live harness: local SpaceTimeDB + gateway + Redis + Graphiti + `/body` subscriber + multiple lightweight native subscribers.
- Exercise gateway RPC, reducer publication, native subscription fanout, reconnect/resync, world clock cadence, coincidence detection, Graphiti reference propagation under load.
- Metrics: reducer latency, gateway relay latency, subscriber lag, reconnect time, dropped/resynced events, fallback activation.
- Operator runbooks.
- HTTP SQL polling marked fallback-only with explicit operator opt-in.

### Substrate paths checked
No multi-client soak harness exists under `Body/S/S3/**` or in test infrastructure. Track 03 has no T7 substrate.

### Verification commands run
None applicable — plan body asks for live harness metrics (`world_clock` ±30 ms across 10 subscribers, `bind_kairos_surface → Tauri delta` p95 <100 ms, 50-user coincidence harness, reconnect tests, privacy audit search across live SpaceTimeDB rows + Graphiti projections). No harness, no metrics.

### 08.T8 / 08.T9 evidence cross-reference
08.T9 evidence (Thread C release-gate suite) exhaustively covers per-domain perf / a11y / privacy / decision-tree gates (108 forbidden-key × surface placements, 7 a11y dimensions, decision-tree corners) **at the integrated-composition level**, but explicitly names Track 03 T6.5 as a production-blocker. T7 hangs on T4/T5/T6.5 substrate first.

### Disposition: **Forward**

No substrate carries the soak/harness deliverable. T7 cannot land until T4 (shared-cosmos tables + reducers in the WASM module), T5 (real Theia delta consumer), and T6.5 (Hen vault bridge) are in place — the harness has nothing to exercise.

### Recommended ledger mark (do not run)

```bash
node .codex/scripts/m-dev-plan-assess.mjs --mark 03.T7 --status pending \
  --evidence "Forward as of 2026-06-01 admin-audit-track03. No multi-client soak harness substrate under Body/S/S3 or test infrastructure. T7 cannot meet its verification (10 subscribers ±30 ms world_clock, 100 ms KairosSurface p95, 50-user coincidence harness, privacy audit across live SpaceTimeDB rows) until T4 ships shared-cosmos tables + reducers in epi-spacetime-module, T5 ships a real Theia native subscriber, and T6.5 ships the Hen vault bridge. Blocks-on: 03.T4, 03.T5, 03.T6.5."
```

---

## 8. Surprises and cross-track observations

1. **Active T2 dispatch-contract test FAILS.** `cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml --test dispatch_contract` fails on `all_contract_methods_are_classified_by_s3_gateway_route_table`:
   > `gateway methods missing S3 route ownership: ["s3'.temporal.subscribe", "s3'.spacetime.subscribe"]`

   This is **the active T2 lane gap** (anima owns it under fresh lease). 03.T1 added the methods to the contract surface; T2's job is to classify them in the gateway route table + wire the dispatch path. The other 5 dispatch_contract tests pass, plus protocol_contract 2/2, runtime_state_contract 4/4, session_store_contract 4/4, anima_invoke_contract 3/3, graphiti_runtime_contract 6/6. **No action by this audit thread.** Anima will see this as soon as it runs gateway tests.

2. **`Body/M/epi-tauri` is deprecated.** Track 05 canon recast 2026-06-01 evening made the entire tree migration-source-only. Plan body for 03.T3 + 03.T5 still names Tauri as the consumer. Either the plan markdown for those two tranches needs a small respec (point at Theia kernel-bridge), or the Theia equivalent needs to land as a Track 05 sub-deliverable that 03.T5 closes against.

3. **The contract surface vs. WASM module surface are out of sync for shared-cosmos.** `gateway-contract` knows about `world_clock`/`pratibimba_presence`/`shared_archetype_event`/`coincidence` as table-name strings and SELECT queries (added in 03.T1), but the WASM module `epi-spacetime-module/src/lib.rs` doesn't declare those tables or their reducers. If T4 is claimed but only adds the WASM-side tables, the existing 03.T1 contract queries should validate against the published module schema as part of T4 verification.

4. **Track 04 `VakAddress.to_string()` carry-forward.** 03.T1's closure narrative flagged a workspace compile break from 04.T1's dirty edit (`Body/S/S5/epii-autoresearch-core/src/lib.rs:570,582` calling `VakAddress.to_string()` without `Display`). 04.T1 has since been marked done — needs a separate audit to confirm workspace compiles clean.

---

## 9. Summary table

| Tranche | Disposition | Recommended mark |
|---|---|---|
| 03.T2 | **SKIP** | anima active lease |
| 03.T3 | **Partial** | `--status review` (S0 bridge + decoder + reducer wrappers landed; Tauri/Theia consumer side missing) |
| 03.T4 | **Forward** | leave `pending` (WASM module has none of the four shared-cosmos tables or reducers) |
| 03.T5 | **Forward** | leave `pending` (backend kernel-bridge fanout exists; no live consumer surface; needs respec from Tauri to Theia) |
| 03.T6 | **Partial** | `--status review` (graphiti-runtime + graphiti_runtime_contract 6/6 green; live Graphiti compatibility test lane + readiness/subscription-metadata exposure not yet evident) |
| 03.T6.5 | **Forward** | leave `pending` (Hen substrate present; no gateway methods, no write-path reconciliation, no protected-capability gating) |
| 03.T7 | **Forward** | leave `pending` (no soak harness; blocks on T4/T5/T6.5) |

---

**Marks NOT applied — substrate active thread (anima/codex) or user decides.**
