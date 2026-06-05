---
title: "S3 Gateway Control Plane Architecture — Gateway, Temporal, Runtime: Total Shape, Substrate Map, Contract Surface, Cleanup Plan"
label_correction: "Working title used 'PAI' (now retired per S3 canon at Idea/Bimba/World/Types/Coordinates/S/S3/S3.md). Canonical label is Gateway Control Plane. All substrate findings, file:line citations, LOC counts, refactor proposals in this doc remain valid. PAI = genealogy of coordinate, not target shape."
substrate_residency_note: "Body/S/S3/graphiti-runtime/ physically lives under S3 but conceptually actualises S5 (Integral World Boundary, via Aletheia world-return). redis-context shares between S2 (raw substrate) and S3' (SpacetimeDB-presence). Cycle-3 cleanup tranches in Tranche 17 group by physical residency for refactor scope; conceptual S-coordinate is the canon authority."
coordinate: "S3 / S3'"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the S3 PAI gateway/temporal/runtime layer. [[S3-SPEC]] and [[S3'-SPEC]] cross-reference this document. Where they disagree, this document is authoritative for substrate file:line citations and for cleanup/modularisation scope; the SPECs remain authoritative for ontological law and prose framing."
depends_on:
  - "[[S3-SPEC]]"
  - "[[S3'-SPEC]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/phase-b-verification-report.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md"
related_tranches:
  - "03 — S3' SpaceTimeDB / Graphiti / kernel-envelope closure"
  - "05.3 — Graphiti runtime episode insertion (M4' consumer)"
  - "12.2 — M5' s5'.gnostic.* gateway registration"
  - "13 — S3 route ownership extraction from S0 gateway server"
  - "13.T4 — explicit fallback policy + silent-fallback sentinel"
---

# S3 PAI Architecture — Gateway, Temporal, Runtime

## 0. Frame

**S3 is the gateway/temporal/runtime layer of the Epi-Logos C stack.** Position 3 within the S-family (operation / pattern / "How is the request routed and the temporal projection kept live?"). It owns the imperative gateway control plane (S3) and the shared temporal/state contract (S3'). Every agentic dispatch from the operator membrane (S0) into Anima/Epii (S4/S5), every M' shell read of harmonic profile / kernel envelope / world clock, every Graphiti episodic deposit, and every SpaceTimeDB projection delta routes through the substrate documented here.

The S3 stack as it stands today (2026-06-03) has six landed crates plus one app-shell carry-over:

- `Body/S/S3/gateway` (1,765 + 504 + 514 + 316 + 148 + 147 + 133 + 124 + 89 + 32 + 32 + 16 ≈ 3,820 LOC) — runtime primitives, dispatch routing, durable session storage, transcript & subagent law, **spacetime bridge** (the canonical 13.T4 extraction from S0), chat-run registry, subscription registry
- `Body/S/S3/gateway-contract` (4,883 LOC in `lib.rs`) — the typed method registry, dispatch-plan, projection schema, kernel-bridge stream contract, privacy gates, session record/patch shape
- `Body/S/S3/graphiti-runtime` (788 LOC in `lib.rs`) — episode envelope construction, provenance fire, deposit/search payload builders, kernel-resonance + kernel-profile-observation deposit law
- `Body/S/S3/epi-spacetime-module` (820 LOC in `lib.rs`) — the SpaceTimeDB 2.x WASM module: 14 typed tables, 9 reducers (register_gateway, heartbeat_gateway, register_agent, register_client, bind_session_temporal_context, bind_kairos_surface, bind_global_temporal_surface, publish_temporal_event, advance_world_clock, bind_pratibimba_presence, publish_shared_archetype_event, detect_coincidences, publish_module_version)
- `Body/S/S3/redis-context` (47 + 139 LOC) — Redis runtime residency, RedisVL bridge path contract, tiered cache (hot/warm/cold) primitives
- `Body/S/S3/epi-app` (legacy electron carry-over; not the M' shell of record — that role moved to `Body/M/epi-theia` per the memory invariant; this stays for parity reference and will be migrated/decommissioned under a later tranche)

This document gives the **total shape**: the six sub-coordinates verified against actual substrate layout, file:line citations for every load-bearing structure, the M' dependency map, the contract surface gap list, and a prioritised cleanup/modularisation programme. The seed specs at [[S3-SPEC]] (`Idea/Bimba/Seeds/S/S3/S3-SPEC.md:30-188`) and [[S3'-SPEC]] (`Idea/Bimba/Seeds/S/S3/S3'/S3'-SPEC.md`) defer to this file for code-level facts.

---

## 1. The Six Sub-Coordinates

Bimba (S3) / Pratibimba (S3') mapping verified against actual crate layout (`ls Body/S/S3/`):

| Sub | Concern | S3 surface | S3' surface | Primary substrate |
|---|---|---|---|---|
| **S3-0 / S3-0'** | Protocol / connection ground | Hello-ok, JSON-RPC frame, METHOD/EVENT advertisement | Live-state ground, connection error law, shared-field root | `gateway/src/protocol.rs`, `gateway-contract/src/lib.rs:115-271, 289-388` |
| **S3-1 / S3-1'** | Sessions / channels / chat | SessionStore CRUD, chat run registry, channel binding | Identity & presence law, method/reducer definition | `gateway/src/session_store.rs`, `gateway/src/sessions.rs`, `gateway/src/chat.rs`, `gateway/src/transcripts.rs` |
| **S3-2 / S3-2'** | Redis temporal context | n/a (cross-process, not gateway-internal) | DAY/NOW/Kairos/agent-orientation Redis keys; RedisVL bridge residency | `redis-context/src/lib.rs`, `redis-context/src/redis_cache.rs`, `gateway-contract/src/lib.rs:3343-3389` |
| **S3-3 / S3-3'** | SpaceTimeDB projection | n/a (no S3 base-surface) | Native WS subscription, HTTP SQL fallback, reducer client, lifecycle envelopes | `gateway/src/spacetime.rs` (1,765 LOC), `epi-spacetime-module/src/lib.rs` (820 LOC), `gateway-contract/src/lib.rs:1853-2333` |
| **S3-4 / S3-4'** | Graphiti runtime / dispatch routing | Dispatch route classifier, anima-invoke law | Graphiti runtime adapter, episodic deposit payload builders, provenance fire | `gateway/src/dispatch.rs` (504 LOC), `graphiti-runtime/src/lib.rs` (788 LOC), `gateway-contract/src/lib.rs:2415-2480, 3513-3546` |
| **S3-5 / S3-5'** | Runtime state / app bridge / return | Event broadcast, run snapshot cache, subscription registry | Kernel envelope publication, portal events, M' kernel-bridge stream | `gateway/src/runtime.rs` (316 LOC), `gateway-contract/src/lib.rs:2335-2786 (kernel-bridge), 504-537 (kernel-envelope), 299-348 (portal events)` |

**Reading note**: the S3-0..S3-5 axis is QL-positional (ground / definition / operation / pattern / context / integration); the prime axis (S3-0'..S3-5') is the inverted *contract* law that gateway endpoints conform to. Both axes are co-owned in the substrate — the **`gateway-contract` crate is the materialisation of the entire S3' inversion**, while the `gateway` crate is the runtime that consumes it.

---

## 2. Substrate Map

### 2.1 S3-0 / S3-0' — Protocol & Contract Ground

**Crate**: `gateway-contract` (4,883 LOC; the single largest file in S3, almost a full third of the layer).

| Public surface | Location | Purpose |
|---|---|---|
| `PROTOCOL_VERSION = 3`, `PROTOCOL_DEV_VERSION = "s3-gateway-dev"`, `DEFAULT_GATEWAY_PORT = 18794` | `gateway-contract/src/lib.rs:15-18` | The S3 protocol identity constants |
| `METHOD_NAMES: &[&str]` (134 entries) | `gateway-contract/src/lib.rs:115-271` | The single source of truth for gateway method names |
| `EVENT_NAMES`, `PORTAL_EVENT_NAMES`, `COMMAND_METHOD_NAMES`, `SPACETIME_PROJECTION_TABLES` (14 entries), `SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS` (7 entries) | `gateway-contract/src/lib.rs:54-113` | Channel/event/table identity constants |
| `PortalEventContract` + `PORTAL_EVENT_CONTRACTS[6]` | `gateway-contract/src/lib.rs:289-352` | Per-event consumer surface declaration (epi portal / OmniPanel etc.) |
| `GatewayProtocolFamily { JsonRpc, Acp }` + `GATEWAY_PROTOCOL_CONTRACTS` | `gateway-contract/src/lib.rs:354-387` | JSON-RPC + ACP protocol family declaration |
| `PlatformAdapterContract`, `SubjectCoordinateResolverContract`, `CronContract`, `McpEventCursorContract`, `KernelEnvelopeContract` | `gateway-contract/src/lib.rs:389-537` | The five Hermes-parity contracts |

**Runtime protocol surface** lives in `gateway/src/protocol.rs:1-89` — `RequestFrame`, `ResponseFrame`, `GatewayError`, `HelloOkFrame`, `HelloFeatures`, `hello_ok()`, `success(id, result)`, `error(id, code, msg)`, `connect_result()`. Protocol v3 is the load-bearing wire format; the test surface is `gateway/tests/protocol_contract.rs` (33 LOC).

### 2.2 S3-1 / S3-1' — Sessions, Channels, Chat

**Crate**: `gateway/src/session_store.rs` (514 LOC) + `sessions.rs` (148 LOC) + `chat.rs` (133 LOC) + `transcripts.rs` (124 LOC) + `subagents.rs` (147 LOC) + `bootstrap.rs` (32 LOC) + `workspace.rs` (32 LOC) = 1,130 LOC.

| Public surface | Location | Purpose |
|---|---|---|
| `SessionStore { gate_root: PathBuf }` + 30+ methods | `gateway/src/session_store.rs:20-514` | Durable session storage; the canonical session authority |
| `CreateSessionContext { session_id, day_id, vault_now_path, runtime_cwd, vault_root }` | `gateway/src/session_store.rs:11-18` | Externally-injected context S0 must supply when creating sessions |
| `SessionRecord` (53 fields) + `SessionPatch` (33 fields) | `gateway-contract/src/lib.rs:3225-3340` | The full session storage contract; consumed by OmniPanel via `OMNIPANEL_SESSION_METADATA` |
| `ChatRunRegistry::{add, pop, list, remove_run}` | `gateway-contract/src/lib.rs:3443-3488` | Per-session FIFO queue of active chat run IDs |
| `TranscriptEntry` + `append_message`/`append_abort`/`read_entries` | `gateway/src/transcripts.rs` (re-exported via `gateway/src/lib.rs:16`) | Transcript persistence law |
| `SubagentLaunchContext`, `resolve_agent_launch_context`, `is_subagent_session_key`, `parse_agent_session_key` | `gateway/src/subagents.rs:1-147` | Subagent dispatch identity law (lineage, parent inheritance, no-recursion guard at `subagents.rs:96-98`) |
| Workspace scope / bootstrap scope derivation | `gateway/src/workspace.rs`, `gateway/src/bootstrap.rs` | Filesystem-scope derivation per session-key |
| `validate_spawned_by_patch` | `gateway/src/subagents.rs:41-68` | Patch-time invariant: `spawnedBy` is only valid for `subagent:*` keys, set-once, cannot clear |

Sub-coordinate **S3-1** has the densest test surface: `gateway/tests/session_store_contract.rs` (154 LOC) + the omnipanel-metadata round-trip test at `gateway-contract/src/lib.rs:3732-3805`. The session record carries 22 OmniPanel-visible storage fields, asserted by the test.

### 2.3 S3-2 / S3-2' — Redis Temporal Context

**Crate**: `redis-context` (186 LOC total — by far the smallest S3 crate, deliberately minimal).

| Public surface | Location | Purpose |
|---|---|---|
| `RedisRuntimeRole { runtime_owner, redisvl_bridge_owner, graph_semantic_namespace, temporal_namespace, description }` | `redis-context/src/lib.rs:18-39` | The S3-owns-Redis residency declaration; S2 owns `s2:graph:semantic`, S3' owns `s3:gateway:temporal` |
| `REDIS_RUNTIME_OWNER = "S3"`, `S2_GRAPH_SEMANTIC_NAMESPACE = "s2:graph:semantic"`, `S3_TEMPORAL_NAMESPACE = "s3:gateway:temporal"` | `redis-context/src/lib.rs:9-12` | Namespace constants |
| `REDISVL_SERVICE_RELATIVE_PATH`, `REDISVL_SETUP_RELATIVE_PATH` + `redisvl_service_script(repo_root)`, `redisvl_setup_script(repo_root)` | `redis-context/src/lib.rs:13-16, 41-47` | The RedisVL bridge path resolution helpers |
| `CacheTier { Hot=300s, Warm=3600s, Cold=86400s }` + `ttl_seconds`, `prefix` | `redis-context/src/redis_cache.rs:3-26` | Three-tier TTL classifier |
| `RedisCache::{connect, health_check, search_indexes, get, set_tiered, set_with_ttl, delete, cache_coordinate}` | `redis-context/src/redis_cache.rs:41-99` | Async multiplexed Redis client; `cache_coordinate` keys to `coord:{bimba_coordinate}` |

**Critical**: the *temporal key law* — `session_now_key`, `day_context_key`, `day_kairos_key`, `session_kairos_key`, `personal_orientation_key`, `agent_orientation_key` — is NOT in this crate. It lives in `gateway-contract/src/lib.rs:3343-3389` on `RedisTemporalContextRole`. This split is correct: `redis-context` owns the runtime + tier law; `gateway-contract` owns the namespace key format. The seed spec validates this at `S3-SPEC.md:159-167`.

### 2.4 S3-3 / S3-3' — SpaceTimeDB Projection (the heaviest sub-coordinate)

**Crates**: `gateway/src/spacetime.rs` (1,765 LOC — the single largest gateway file) + `epi-spacetime-module/src/lib.rs` (820 LOC, the WASM module) + ~480 LOC of contract types in `gateway-contract`.

#### 2.4.1 Module crate: `epi-spacetime-module/src/lib.rs`

Declares 14 typed tables (one per `SPACETIME_PROJECTION_TABLES` entry) and 13 reducers:

| Table | Decl | Role |
|---|---|---|
| `ModuleVersion` | `epi-spacetime-module/src/lib.rs:58-67` | Carries `clock_protocol_version`, `projection_schema_version`, `reducer_abi_version` — observable drift between gateway-contract and the deployed WASM module |
| `GatewayInstance`, `AgentInstance`, `ClientRegistration` | `epi-spacetime-module/src/lib.rs:69-108` | Gateway-process + PI-agent + client registration plane |
| `SessionSurface`, `KairosSurface`, `GlobalTemporalSurface`, `TemporalEvent` | `epi-spacetime-module/src/lib.rs:110-195` | Per-session / per-day temporal projection surfaces |
| `WorldClock`, `WorldClockTick` | `epi-spacetime-module/src/lib.rs:481-516` | 1 Hz global clock + audit log per `advance_world_clock` tick |
| `PratibimbaPresence` | `epi-spacetime-module/src/lib.rs:517-531` | RLS-filtered personal-pole presence row |
| `SharedArchetypeEvent` | `epi-spacetime-module/src/lib.rs:536-555` | Opt-in shared archetype event publication |
| `Coincidence`, `CoincidenceTick` | `epi-spacetime-module/src/lib.rs:557-582` | Cross-presence coincidence detection + tick audit log |

**Reducers** (`#[reducer]` attribute) at `epi-spacetime-module/src/lib.rs:197-820`:
1. `register_gateway` (197-222)
2. `heartbeat_gateway` (223-233)
3. `register_agent` (234-263)
4. `register_client` (264-289)
5. `bind_session_temporal_context` (290-346)
6. `bind_kairos_surface` (347-386)
7. `bind_global_temporal_surface` (387-439)
8. `publish_temporal_event` (440-472)
9. `advance_world_clock` (593-637) — 1 Hz
10. `bind_pratibimba_presence` (638-681)
11. `publish_shared_archetype_event` (684-725)
12. `detect_coincidences` (732-796) — 1/min
13. `publish_module_version` (797-820) — surfaces `REDUCER_ABI_VERSION` for drift detection

Build target: `wasm32-unknown-unknown`, pinned to `spacetimedb = "=2.2.0"` (`epi-spacetime-module/Cargo.toml:29`), `crate-type = ["cdylib"]`.

#### 2.4.2 Gateway bridge: `gateway/src/spacetime.rs`

The 1,765-LOC file extracted from S0 per Tranche 13.T4. Major regions (verified via grep `^// ===` and `^pub fn`):

| Region | Lines | Function |
|---|---|---|
| Silent-fallback sentinel + policy derivation | `spacetime.rs:42-68` | `silent_fallback_refused()`, `fallback_policy_for_plan(plan)` — the contract-named refuse gate |
| Connection state + resync tracker | `spacetime.rs:70-189` | `SpacetimeProjectionConnectionState`, `SpacetimeProjectionUpdate`, `SpacetimeProjectionResyncTracker` (mark_connection_lost / mark_reconnecting / mark_degraded_but_subscribable / observe_context) |
| `SpacetimeRegistration` (the env-config layer) | `spacetime.rs:191-491` | `from_env`, `readiness_value`, `subscription_plan`, `register_gateway`, `register_client`, `register_agent`, `subscribe_projection`, `client()` — the principal entry point S0 invokes |
| `SpacetimeProjectionSubscription` | `spacetime.rs:403-491` | The live WS subscription wrapper with resync tracker |
| Standalone readiness functions | `spacetime.rs:493-575` | `readiness_value(port, state_root)` (non-method), `readiness_value_default(state_root)` |
| `SpacetimePresence` (the HTTP reducer client) | `spacetime.rs:577-1141` | All 13 reducers invoked via HTTP POST against `/v1/database/{db}/call/{reducer}`; SQL polling helpers; presence/agent/session/world-clock helpers |
| `ReducerRetryPolicy` | `spacetime.rs:1142-1173` | Backoff config: `max_attempts`, `base_delay_ms`, `max_delay_ms` |
| Projection context decoder | `spacetime.rs:1174-1490` | `projection_context_from_sql_result`, `projection_context_from_subscription_message` — turn raw SpaceTimeDB rows into `Value` consumer payloads |
| Helper utilities | `spacetime.rs:1491-1648` | `agent_instance_id`, `global_temporal_surface_key`, `redis_global_context_key`, `day_wikilink`, `capability_surface_hash`, `agent_kind`, `kairos_snapshot_id`, `quintessence_hash_blake3`, `identity_handle_blake3`, `kernel_projection_from_rows` |
| Lifecycle envelope helpers | `spacetime.rs:1649-1762` | `lifecycle_envelope_from_update`, `fallback_active_envelope`, `assert_no_silent_fallback_in_value`, recursive walk |
| Public readiness re-exports | `spacetime.rs:1763+` | `readiness_value_for_state_root` |

#### 2.4.3 Contract types in `gateway-contract`

`SpacetimeProjectionPlan` (`gateway-contract/src/lib.rs:1853-1869`), `SpacetimeProjectionRows` (1871-1876), `SpacetimeReadinessContract` (1878-1889), `SpacetimeSubscriptionLifecycleEnvelope` (1891-1900), `SpacetimeFallbackPolicy { NativeWebsocket, FallbackActive, Disabled }` (2070-2091), `S3SubscriptionRegistryFacts` (2108-2132), `SpacetimeMessageKind` (2174-2180), `SpacetimeTableDelta` (with 14 typed-table variants) (2185-2234), `SpacetimeProjectionDelta` (2241-2319).

The `from_subscription_message` decoder at `gateway-contract/src/lib.rs:2263-2308` and the `classify_subscription_message` at `2321-2333` are pure functions consumed identically by gateway crate AND kernel-bridge TypeScript via JSON.

### 2.5 S3-4 / S3-4' — Dispatch Routing + Graphiti Runtime

**Crates**: `gateway/src/dispatch.rs` (504 LOC) + `graphiti-runtime` (788 LOC).

#### 2.5.1 Dispatch routing

`gateway/src/dispatch.rs:200-471` is the giant `classify_method(method) -> Option<GatewayDispatchRoute>` match block. It dispatches all 134 method names from `METHOD_NAMES` (plus the `nara.*` prefix alternative at `dispatch.rs:376-383`) to one of 11 `GatewayDispatchOwner` variants × 21 `GatewayDispatchClass` categories (declared at `dispatch.rs:143-187`).

Top-of-file re-exports `MethodDispatchKind` and `MethodDispatchPlanEntry` (`dispatch.rs:34-38`) so consumers reach the executable dispatch plan through the gateway crate alone, never through `gateway-contract` directly. This is the **route-ownership-singleton invariant** that the test `s0_gate_server_dispatches_only_via_s3_route_metadata` (in `Body/S/S0/epi-cli/tests/gate_full_parity_contract.rs`) enforces — S0 may NOT carry a parallel route table.

Cross-check surfaces: `methods_in_route_table_missing_from_dispatch_plan()` (`dispatch.rs:69-77`) and `methods_in_dispatch_plan_missing_from_route_table()` (`dispatch.rs:83-89`) — these are the regression-test "two surfaces agree 1:1" helpers consumed by `gateway/tests/dispatch_contract.rs` (527 LOC).

`AnimaInvokeRequest` / `AnimaInvokeResponse` / `route_anima_invoke(store, req)` (`dispatch.rs:95-141`) — the multi-session constitutional-agent dispatch. Used by Anima and (per Concern 2 in the seed spec) Epii.

#### 2.5.2 Executable dispatch plan

`METHOD_DISPATCH_PLAN: &[MethodDispatchPlanEntry]` at `gateway-contract/src/lib.rs:895-1833` is the canonical 7-kind classification (S3NativeHandler, S2GraphServiceAdapter, S4OrchestrationAdapter, S5GovernanceAdapter, S0ProductAdapter, S1HenAdapter, Missing) of every method. Lookup `method_dispatch_plan_entry(method)` at `gateway-contract/src/lib.rs:1847-1851`.

**Audit finding**: every method in `METHOD_NAMES` has a corresponding `MethodDispatchPlanEntry` with `kind != Missing`. There are no current `Missing` entries — the dispatch surface is closed at 134 methods, which is the integrity test that `gateway/tests/dispatch_contract.rs` enforces.

#### 2.5.3 Graphiti runtime adapter

`graphiti-runtime/src/lib.rs:1-788`. Structure:

| Public surface | Location | Purpose |
|---|---|---|
| `EpisodeAttrs`, `EpisodeInsert`, `GraphitiRuntimeConfig`, `GraphitiStatus` | `graphiti-runtime/src/lib.rs:18-92` | Typed envelope shapes for episode insertion |
| `fire_provenance(ProvenanceEvent)` | `graphiti-runtime/src/lib.rs:94-104` | Async fire-and-forget POST to `/provenance` (3s timeout) |
| `provenance_from_record` | `graphiti-runtime/src/lib.rs:106-123` | Build `ProvenanceEvent` from session metadata |
| `session_memory_envelope(access)` | `graphiti-runtime/src/lib.rs:125-136` | Build the canonical S5-coordinate envelope JSON |
| `session_memory_deposit_payload` | `graphiti-runtime/src/lib.rs:139-163` | Build deposit payload; refuses identity-mutating writes (line 150-152) |
| `kernel_resonance_deposit_payload` | `graphiti-runtime/src/lib.rs:166-221` | The S5 episodic kernel-resonance deposit builder |
| `kernel_profile_observation_deposit_payload` | `graphiti-runtime/src/lib.rs:223-332` | M1' Paramaśiva profile-to-performance stream deposit builder; validates `protected_kernel_state_key` denylist |
| `compose_file_path` | `graphiti-runtime/src/lib.rs:333-355` | Docker-compose path resolution (parity carry-over) |
| `start(json_output)`, `stop(json_output)` | `graphiti-runtime/src/lib.rs:356-end` | Operator-side runtime lifecycle (parity carry-over) |

**Architectural status** (per `gateway-contract/src/lib.rs:3513-3546`): the `GraphitiAdapterContract::native_library()` declares the target shape as `NativeLibrary` with `compatibility_mode: Some(HttpCompatibility)`. The HTTP FastAPI sidecar at port 37778 is the CURRENT compatibility mode; the architecture commitment is library-backed.

### 2.6 S3-5 / S3-5' — Runtime State, Subscription Registry, Kernel-Bridge Stream

**Crate**: `gateway/src/runtime.rs` (316 LOC) + 25% of `gateway-contract/src/lib.rs` (the kernel-bridge contract region at lines 2335-2786 + the kernel-envelope contract at 504-537).

`GatewayRuntimeState` at `gateway/src/runtime.rs:9-316` owns the entire in-process runtime mutable state:

| Field | Type | Purpose |
|---|---|---|
| `runs` | `Mutex<HashMap<String, RunContext>>` | Per-run identity |
| `seq_by_run` | `Mutex<HashMap<String, u64>>` | Monotonic event sequence per run |
| `snapshots` | `Mutex<HashMap<String, RunSnapshot>>` | Cached terminal state per run |
| `listeners` | `Mutex<HashMap<u64, UnboundedSender<GatewayEvent>>>` | Subscribed event sinks (broadcast fanout) |
| `next_listener_id` | `AtomicU64` | Monotonic listener ID allocator |
| `chat_runs` | `Mutex<ChatRunRegistry>` | Per-session FIFO chat run queue |
| `chat_processes` | `Mutex<HashMap<String, Arc<AsyncMutex<tokio::process::Child>>>>` | Tokio child-process handles for chat runs |
| `aborted_chat_runs` | `Mutex<HashSet<String>>` | Abort-already-requested set |
| `subscriptions` | `Mutex<HashMap<String, GatewaySubscriptionRecord>>` | Per-auth-bound live subscription identity |

`GatewaySubscriptionRecord` at `runtime.rs:37-58` is the 13.T4 subscription identity envelope: `subscription_id`, `method`, `connection_id`, `session_key`, `agent_id`, `scope`, `query_id`, `privacy_class`, `source` (`websocket-multiplex` | `http-sql-fallback`), `day_id`, `vault_now_path`, `graphiti_namespace_ref`, `graphiti_arc_id`, `projection_source`, `opened_at_ms`.

`GatewayEventSubscription` at `runtime.rs:60-73` is the per-listener handle (`id`, `receiver`).

**Kernel-bridge stream contract** at `gateway-contract/src/lib.rs:2335-2786`:

| Type | Location | Purpose |
|---|---|---|
| `KernelBridgeConnectionState`, `KernelBridgeConnectionStatus` | `gateway-contract/src/lib.rs:2350-2373` | Kernel-bridge connection lifecycle envelope (carries `graphiti_runtime_status`) |
| `GraphitiRuntimeStatus { Available, Degraded, Unavailable }` | `gateway-contract/src/lib.rs:2383-2389` | Health flag surfaced on EVERY subscription envelope so consumers know whether `s5.episodic.*` will succeed before invoking |
| `KernelBridgeSubscriptionStatus` | `gateway-contract/src/lib.rs:2395-2408` | Per-subscription lifecycle row |
| `GraphitiInvocationEnvelope` | `gateway-contract/src/lib.rs:2417-2427` | Typed envelope for routing S5 Graphiti invocations through gateway |
| `GraphitiPrivacyClass` | `gateway-contract/src/lib.rs:2429+` | `ProtectedEpisodic` etc. |
| `assert_no_graphiti_body_in_row` | `gateway-contract/src/lib.rs:2452+` | Privacy filter at row level |
| `KernelBridgePrivacyClass`, `KernelBridgeCachedSurface`, `KernelBridgeLatestRowCache`, `KernelBridgeDelta`, `KernelBridgeResync`, `KernelBridgeProtocolMismatch`, `KernelBridgeStreamEvent`, `KernelBridgeApiRequest` | `gateway-contract/src/lib.rs:2481-2600` | Full kernel-bridge stream contract surface |
| `surface_privacy_class(surface)`, `privacy_filter_table_delta(delta)`, `detect_protocol_mismatch`, `detect_production_fallback_policy`, `scan_for_forbidden_privacy_fields` | `gateway-contract/src/lib.rs:2602-2882` | Privacy + protocol-drift detection helpers |
| `PRIVACY_FORBIDDEN_FIELD_NAMES` | `gateway-contract/src/lib.rs:2850+` | The denylist consumed by `scan_for_forbidden_privacy_fields` |
| `Track03ReleaseGateReport` | `gateway-contract/src/lib.rs:2899+` | The cycle-3 03.T-series release-gate aggregator |
| `S1VaultPathPrivacyClass`, `classify_vault_path_privacy`, `S1WikilinkReference`, `S1VaultRenameReceipt`, `S1VaultRenameRefusal`, `S1SemanticCandidate`, `S1SemanticResponse` | `gateway-contract/src/lib.rs:2941-3220` | S1 Hen vault gatekeeper types reached through `s1'.vault.*` and `s1'.semantic.*` |

---

## 3. M' Dependency Map

This section answers: **which M' surfaces consume which S3 sub-coordinates?** Cross-referenced against the cycle-3 M' architecture docs.

| M' Surface | S3 Sub-coordinate | Consumption pattern | Authority anchor |
|---|---|---|---|
| **M'-Theia kernel-bridge** (`Body/M/epi-theia/extensions/kernel-bridge/`) | S3-0, S3-3, S3-4, S3-5 | Opens ONE WebSocket via `createGatewayWebSocket(EPI_GATEWAY_URL)`; performs `connect`; subscribes session+kairos+global temporal surfaces; subscribes world_clock + pratibimba_presence + shared_archetype_event | `S3-SPEC.md:62-79` (M' shell consumed closure) |
| **OmniPanel** (M' agentic sidebar) | S3-1, S3-5 | Reads sessions via `sessions.list/resolve/preview/run-state/tree`; chat via `chat.history/send/abort`; channels via `channels.status/logout`; consumes `OMNIPANEL_SESSION_METADATA` 13-field set | `gateway-contract/src/lib.rs:38-52, 575-769` |
| **M3' Mahamaya clock + day-now ambient** | S3-3, S3-5 | Subscribes `kairos_surface` + `global_temporal_surface` for Day/Kairos projection; Tauri-M3 clock per `PortalEventContract::portal.kairos_shift` consumer list (`gateway-contract/src/lib.rs:341-347`) | `Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md` |
| **M4' Nara — Graphiti episode insertion** | S3-4 | Calls `s5.episodic.deposit`, `s5.episodic.kernel_profile_observation.deposit` through the gateway; payloads built by `graphiti-runtime::kernel_profile_observation_deposit_payload` | Tranche 05.3, `S3-SPEC.md` §A |
| **M5' Epii — review inbox + gnostic gateway** | S3-4, S3-5 | Calls `s5'.review.{inbox,submit,resolve,history}`, `s5'.epii.{status,deposit,runtime.context}`, `s5'.gnosis.context.retrieve`; the kernel-bridge fans out `portal.review_deposit` events | Tranche 12.2 (`s5'.gnostic.*` gateway registration) — see §4.2 for the gap |
| **M1' Paramaśiva played-torus** | S3-5 | Receives safe public-current kernel envelope via `s3'.kernel.envelope.publish` → kernel-bridge → renderer; profile-to-performance stream documented in `graphiti-runtime/src/lib.rs:280-330` | `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` §4.1 |
| **Cycle-3 `/body` lite-surface** | S3-3, S3-5 | Reads `BODY_DEEP_LINK_CONTEXT_FIELDS` (8 fields: `sessionKey`, `dayNow`, `profileGeneration`, `coordinate`, `reviewId`, `improvementId`, `artifactUri`, `privacyClass`); the 23/23 boundary tests verify | `S3-SPEC.md:75-79` |
| **Epi portal `/`, `0`, `1`** | S3-1, S3-5 | Subscribes the six portal events (`PORTAL_EVENT_CONTRACTS[6]` at `gateway-contract/src/lib.rs:299-348`); the events are typed per-surface — `portal.token` and `portal.tool_call` for `/`, `portal.lens_pressure` and `portal.review_deposit` for `0/1`, `portal.kairos_shift` for both | Cycle-3 Tranche 11.3 (portal vocabulary) |
| **Integrated 1-2-3 cosmic engine plugin** | S3-3 (heaviest) | Renders SpaceTimeDB-delivered K² + 72-resonance + 64-Mahamaya state without re-derivation; subscribes `global_temporal_surface` + `kairos_surface` | `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/07-integrated-1-2-3-cosmic-engine-reconciliation.md` |

**Universal rule** (per the cycle-3 plan): **every** M-extension that touches the gateway does so through the single `KernelBridgeAPI` singleton fanned out by `SharedBridgeAdapter`. No M-extension may open its own gateway socket or import `gateway-contract` directly (Track 07 T0 contract preflight, asserted by `extensions/test/kernel-bridge-theia-boundary.test.mjs` and `extensions/test/shared-bridge-fan-out.test.mjs`).

---

## 4. Contract Surface

### 4.1 What S3 produces

| Surface | Carrier | Shape |
|---|---|---|
| 134 typed method names | `METHOD_NAMES` at `gateway-contract/src/lib.rs:115-271` | `&[&str]` |
| 7-kind dispatch plan | `METHOD_DISPATCH_PLAN` at `gateway-contract/src/lib.rs:895-1833` | `&[MethodDispatchPlanEntry]` (one row per method, no `Missing`) |
| Session record + patch | `SessionRecord`, `SessionPatch` at `gateway-contract/src/lib.rs:3225-3340` | 53-field record, 33-field patch |
| 14 typed table deltas | `SpacetimeTableDelta` at `gateway-contract/src/lib.rs:2185-2234` | Tagged enum |
| 7 lifecycle events | `SPACETIME_SUBSCRIPTION_LIFECYCLE_EVENTS` at `gateway-contract/src/lib.rs:105-113` | `requested`, `applied`, `delta`, `resync`, `error`, `closed`, `fallback-active` |
| 6 portal events | `PORTAL_EVENT_CONTRACTS` at `gateway-contract/src/lib.rs:299-348` | `portal.token`, `portal.tool_call`, `portal.lens_pressure`, `portal.vak_eval`, `portal.review_deposit`, `portal.kairos_shift` |
| Kernel envelope publish | `KernelEnvelopeContract` at `gateway-contract/src/lib.rs:504-537` + `s3'.kernel.envelope.publish` method | Typed `KernelTickEnvelope` re-exported from `epi-kernel-contract` |
| Fallback policy + sentinel | `SpacetimeFallbackPolicy` + `SPACETIME_SILENT_HTTP_FALLBACK_FORBIDDEN` at `gateway-contract/src/lib.rs:2070-2101` | Explicit refuse-to-fall-back-silently gate |
| Cron contract | `CronContract` at `gateway-contract/src/lib.rs:458-477` | Delivery target syntax + output writes (Graphiti episodic + DAY/NOW vault) |
| Platform adapter contract | `PlatformAdapterContract` at `gateway-contract/src/lib.rs:389-421` | The Rust async trait shape for channel adapters |
| Subject coordinate resolver | `SubjectCoordinateResolverContract` at `gateway-contract/src/lib.rs:423-454` | Pre-agent identity → subject coordinate mapping |

### 4.2 What's exposed but should be — current gaps

**Gap 1 (load-bearing): the `s5'.gnostic.*` method family** Tranche 12.2 names. Search of `METHOD_NAMES` shows `s5'.gnosis.context.retrieve` (line 217) exists, but the *family* (`s5'.gnostic.search`, `s5'.gnostic.synthesise`, `s5'.gnostic.deposit_chrysolite` etc.) implied by the M5' architecture docs is NOT registered. Surfaced as a cycle-3 ledger action in §10.

**Gap 2: subscription registry facts surface.** `S3SubscriptionRegistryFacts` (`gateway-contract/src/lib.rs:2108-2132`) is declared but there is no `s3'.subscription.registry` gateway method exposing it. M' consumers would benefit from a typed readiness query.

**Gap 3: `s3'.kernel.envelope.publish` carries `KernelTickEnvelope` but there is no inverse `s3'.kernel.envelope.subscribe`.** The kernel envelope is currently read via the session/kairos/global SpaceTimeDB rows (`kernel_projection_json` column). A typed subscription would be cleaner — surfaced as part of the kernel-bridge contract gap.

**Gap 4: portal event publish surface is missing.** `PORTAL_EVENT_NAMES` enumerates 6 events, but there is no `s3.portal.publish` method. Currently events fanout through `GatewayRuntimeState::broadcast` directly; consumers cannot subscribe selectively. A `portal.subscribe { event_name }` would let M-extensions filter at the gateway boundary instead of at the renderer.

**Gap 5: Track 13.T3 channel/chat runtime extraction.** Six methods (`channels.{status,send,files.list,logout}`, `chat.{history,abort,send,inject}`, plus `send`) are tagged `planned 13.T3 extraction` in `gateway-contract/src/lib.rs:925-979`. The plan says "(channel runtime, planned 13.T3 extraction)" — the work has NOT landed and is the next dispatch-extraction tranche.

### 4.3 Profile-bus integration

S3 does NOT carry harmonic profile fields directly (those live in `Body/S/S0/portal-core/src/kernel.rs` per the M1' architecture). What S3 DOES carry is the *publication* law via `s3'.kernel.envelope.publish` and the *projection* row via `kernel_projection_json` on `session_surface`/`kairos_surface`/`global_temporal_surface`.

The cycle-3 invariant "windows onto writes, never re-derived" (per the cycle-3 plan §10) means: M' renderers MUST read `MathemeHarmonicProfile` via the kernel-bridge subscription, never re-compute. S3's role is to ensure the SpaceTimeDB projection delivers the latest `kernel_projection_json` within bounded latency (the 03.T3 verification rider names ≤100 ms round-trip for `bind_kairos_surface` → `KairosSurface` delta).

---

## 5. Code Cleanup + Modularisation Findings

Concrete proposals, prioritised by blast radius. Each finding gives: **location**, **current shape**, **proposed refactor**, **benefit**, **blast radius**.

### 5.1 [HIGH] Split `gateway-contract/src/lib.rs` (4,883 LOC) into a module tree

**Location**: `Body/S/S3/gateway-contract/src/lib.rs` (4,883 LOC — the single largest file in S3 and one of the largest in the whole repo).

**Current shape**: a monolithic `lib.rs` carrying constants, METHOD_NAMES, 18+ named contract structs, the executable dispatch plan (4-row × ~135 methods ≈ 940 LOC of repetition), all SpaceTime projection types, the kernel-bridge stream contract, the privacy gates, the session record + patch shapes, and 500+ LOC of tests. Read-flow is impossible without `grep`.

**Proposed refactor**: extract into submodules per concern:
```
gateway-contract/src/
├── lib.rs              (re-exports only)
├── protocol.rs         (PROTOCOL_VERSION, EVENT_NAMES, METHOD_NAMES,
│                        PORTAL_EVENT_NAMES, COMMAND_METHOD_NAMES)
├── dispatch_plan.rs    (MethodDispatchKind, MethodDispatchPlanEntry,
│                        METHOD_DISPATCH_PLAN, lookup helpers)
├── session.rs          (SessionRecord, SessionPatch, GatewaySessionOperation*,
│                        ChatRunRegistry, RunContext, RunSnapshot, GatewayEvent,
│                        ProvenanceEvent, default_session_id)
├── portal_events.rs    (PortalEventContract, PORTAL_EVENT_CONTRACTS)
├── platform_adapter.rs (PlatformAdapterContract, SubjectCoordinateResolverContract)
├── temporal.rs         (RedisTemporalContextRole, TEMPORAL_REDIS_NAMESPACE)
├── spacetime/
│   ├── mod.rs          (re-exports)
│   ├── projection.rs   (SpacetimeProjectionPlan, Rows, Readiness, lifecycle envelopes)
│   ├── delta.rs        (SpacetimeMessageKind, SpacetimeTableDelta,
│   │                    SpacetimeProjectionDelta, decoders)
│   ├── fallback.rs     (SpacetimeFallbackPolicy, sentinels, S3SubscriptionRegistryFacts)
│   └── tables.rs       (SPACETIME_PROJECTION_TABLES, lifecycle event names)
├── kernel_bridge.rs    (KernelBridgeConnectionState/Status, KernelBridgePrivacyClass,
│                        KernelBridge*Delta/Resync/Stream/Api, privacy filters)
├── kernel_envelope.rs  (KernelEnvelopeContract, re-exports from epi-kernel-contract)
├── graphiti.rs         (GraphitiAdapterContract, GraphitiAdapterMode,
│                        GraphitiInvocationEnvelope, GraphitiPrivacyClass,
│                        GraphitiRuntimeStatus, assert_no_graphiti_body_in_row)
├── cron.rs             (CronContract, CRON_CONTRACT)
├── mcp.rs              (McpEventCursorContract)
├── privacy.rs          (PRIVACY_FORBIDDEN_FIELD_NAMES, scan_for_forbidden_privacy_fields)
├── s1_vault.rs         (S1VaultPathPrivacyClass, classify_vault_path_privacy,
│                        S1Wikilink*, S1VaultRename*, S1SemanticCandidate, S1SemanticResponse)
└── release.rs          (Track03ReleaseGateReport, detect_production_fallback_policy)
```

**Benefit**: `grep`-able boundaries; type review can be scoped; test files can mirror the module tree; new fields go to one place.

**Blast radius**: HIGH. Every consumer of `epi_s3_gateway_contract::...` keeps working because we keep `lib.rs` as re-export-only (`pub use protocol::*; pub use session::*; ...`). But the file-count delta is significant. Recommend doing this as ONE PR with mechanical splits, no semantic changes.

### 5.2 [HIGH] Split `gateway/src/spacetime.rs` (1,765 LOC) into a submodule directory

**Location**: `Body/S/S3/gateway/src/spacetime.rs` (1,765 LOC).

**Current shape**: ten distinct concerns in one file (per §2.4.2 above): fallback policy, connection state + resync tracker, `SpacetimeRegistration` (env-config + readiness), `SpacetimeProjectionSubscription` (WS wrapper), `SpacetimePresence` (HTTP reducer client, ~560 LOC by itself), retry policy, projection context decoder, helpers (Blake3 hashes, agent IDs), lifecycle envelope builders, public readiness re-exports.

**Proposed refactor**:
```
gateway/src/spacetime/
├── mod.rs              (re-exports + top-level Region 1/2 comments)
├── fallback.rs         (silent_fallback_refused, fallback_policy_for_plan,
│                        ~50 LOC from spacetime.rs:42-68)
├── resync.rs           (SpacetimeProjectionConnectionState,
│                        SpacetimeProjectionUpdate,
│                        SpacetimeProjectionResyncTracker,
│                        ~120 LOC from spacetime.rs:70-189)
├── registration.rs     (SpacetimeRegistration, SpacetimeProjectionSubscription
│                        constructors, env-config + readiness,
│                        ~290 LOC from spacetime.rs:191-491)
├── presence.rs         (SpacetimePresence — the HTTP reducer client surface,
│                        all 13 reducer-call methods, ~560 LOC
│                        from spacetime.rs:577-1141)
├── retry.rs            (ReducerRetryPolicy, ~30 LOC from spacetime.rs:1142-1173)
├── projection.rs       (projection_context_from_sql_result,
│                        projection_context_from_subscription_message,
│                        kernel_projection_from_rows, ~310 LOC
│                        from spacetime.rs:1174-1490 + 1603-1626)
├── identity.rs         (agent_instance_id, global_temporal_surface_key,
│                        redis_global_context_key, day_wikilink,
│                        capability_surface_hash, agent_kind, kairos_snapshot_id,
│                        quintessence_hash_blake3, identity_handle_blake3,
│                        ~160 LOC from spacetime.rs:1491-1648)
└── lifecycle.rs        (lifecycle_envelope_from_update, fallback_active_envelope,
                         assert_no_silent_fallback_in_value,
                         readiness_value, readiness_value_default,
                         readiness_value_for_state_root,
                         ~250 LOC from spacetime.rs:1649-end)
```

**Benefit**: each region is independently reviewable; the `SpacetimePresence` reducer client (the largest concentration) can grow per-reducer test coverage without diluting the file; the fallback discipline (sentinel, refuse gate, lifecycle) becomes a single ~250-LOC review target rather than scattered.

**Blast radius**: MEDIUM. `gateway/src/lib.rs:8` re-exports the spacetime module; downstream consumers go through `epi_s3_gateway::spacetime::...` and remain stable. The internal `pub(crate) use` chain needs minor updates.

### 5.3 [HIGH] The dispatch routing has two parallel sources — collapse to one

**Location**: `gateway/src/dispatch.rs:200-471` (`classify_method` — 270 LOC giant `match`) AND `gateway-contract/src/lib.rs:895-1833` (`METHOD_DISPATCH_PLAN` — 940 LOC).

**Current shape**: the two surfaces enumerate the same 134 methods and the integrity test `methods_in_route_table_missing_from_dispatch_plan()` (`dispatch.rs:69-77`) guards that they agree. But they DUPLICATE the method list — every addition requires touching both.

**Proposed refactor**: make `METHOD_DISPATCH_PLAN` the canonical source. Derive `classify_method` by lookup:
```rust
pub fn classify_method(method: &str) -> Option<GatewayDispatchRoute> {
    let entry = method_dispatch_plan_entry(method)?;
    // Translate MethodDispatchKind → (GatewayDispatchOwner, GatewayDispatchClass)
    // via a single lookup table, mapping authority_path → route metadata.
    Some(GatewayDispatchRoute {
        method: entry.method,
        owner: owner_for_kind(entry.kind, entry.authority_path),
        class: class_for_kind(entry.kind, entry.authority_path),
        coordinate_owner: coordinate_for_kind(entry.kind),
        agent_access_owner: agent_for_kind(entry.kind),
        route_id: route_id_for_authority(entry.authority_path),
    })
}
```

Add a "category" field to `MethodDispatchPlanEntry` (or have a per-kind default + per-method override table) so the route_id / class / coordinate_owner derive deterministically.

**Benefit**: a new method gets added in ONE place. The integrity test becomes a "no derivation hole" test rather than a "two-list reconciliation" test.

**Blast radius**: MEDIUM. The 7-kind dispatch shape is stable. The 21-class enumeration may need consolidation (some classes are 1-method-only and could fold into adjacents).

### 5.4 [MEDIUM] `SessionRecord` is a 53-field bag — apply Default + extract sub-records

**Location**: `gateway-contract/src/lib.rs:3225-3301` (`SessionRecord`).

**Current shape**: 53 `#[serde(default)]` fields covering: identity (canonical_key, aliases, label, session_id), parent/source (parent_session_key, source_session_key, source_session_kind, spawned_by), temporal (day_id, vault_now_path, runtime_cwd, vault_root, updated_at_ms), runtime (resource_loader_id, retry_settlement_state, diagnostics, delivery_context), channel (channel, thread_id, group_id, group_channel, group_space, team_id, team_role), orchestration (orchestration_kind, cmux_workspace, cmux_surface, cmux_pane_id), agent identity (active_agent_id, subagent_lineage, workspace_root, bootstrap_scope), CLI hints (thinking_level, verbose_level, reasoning_level, model_override, provider_override, cli_session_ids), VAK address.

`SessionPatch` mirrors with 33 fields of `Option<Option<T>>` (the doubly-optional dance to distinguish "leave alone" from "set to null").

**Proposed refactor**: extract semantic sub-records:
```rust
pub struct SessionRecord {
    pub identity: SessionIdentity,
    pub lineage: SessionLineage,
    pub temporal: SessionTemporal,
    pub runtime: SessionRuntime,
    pub channel: Option<ChannelBinding>,
    pub orchestration: Option<OrchestrationContext>,
    pub agent: AgentIdentity,
    pub cli_hints: CliHints,
    pub vak_address: Option<VakAddress>,
    pub updated_at_ms: u128,
}
```

And replace `SessionPatch`'s `Option<Option<T>>` with a typed `Patch<T>` enum (`Leave`, `Set(T)`, `Unset`).

**Benefit**: serde round-trip is more disciplined; OmniPanel consumers can pattern-match on `record.orchestration.is_some()` etc.; the omnipanel-metadata test (lines 3732-3805) becomes per-sub-record.

**Blast radius**: HIGH for consumers. Migration must preserve the wire format via `#[serde(flatten)]` so existing JSON keeps working. Defer to a dedicated tranche; do NOT bundle with §5.1/§5.2.

### 5.5 [MEDIUM] `GatewayRuntimeState` uses 9 `Mutex`/`AtomicU64` fields — consolidate locks

**Location**: `gateway/src/runtime.rs:9-25`.

**Current shape**: nine independent locks (`runs`, `seq_by_run`, `snapshots`, `listeners`, `next_listener_id`, `chat_runs`, `chat_processes`, `aborted_chat_runs`, `subscriptions`). Every method takes one lock, expects it not to poison ("gateway runtime X lock should not poison"). Cross-lock invariants (e.g. when removing a run, also clear its snapshot) are not enforced — they're convention.

**Proposed refactor**: introduce two consolidated locks:
- `runtime_state: Mutex<RuntimeState>` containing `runs`, `seq_by_run`, `snapshots`, `chat_runs`, `chat_processes`, `aborted_chat_runs` (the per-run identity + ID + state cluster)
- `subscriptions_state: Mutex<SubscriptionState>` containing `listeners`, `next_listener_id`, `subscriptions` (the event-fanout + auth cluster)

This reduces contention (fewer locks taken per operation), enforces cross-field invariants in `impl RuntimeState { fn cleanup_run(&mut self, run_id: &str) }`, and lets us add a single `lock_poisoned()` health probe instead of nine "should not poison" call sites.

**Benefit**: clearer concurrency story; testable invariants ("after `cleanup_run`, no snapshot exists, no process child, no aborted flag"); fewer 50%-of-line "expect" boilerplate.

**Blast radius**: LOW (the public API stays the same — internal lock count is hidden). Worth doing in a dedicated PR with `dispatch_contract.rs` regression coverage.

### 5.6 [MEDIUM] `epi-app` legacy carry-over should be migrated/decommissioned

**Location**: `Body/S/S3/epi-app/` — an Electron+Vite app with `package.json` referencing `react`, `vite`, `playwright`. Last `main/` modification 2026-03-11.

**Current shape**: a parallel app shell that pre-dates the M' Theia migration. Per the memory invariant, the Theia shell now lives at `Body/M/epi-theia`. `epi-app` is stale legacy.

**Proposed refactor**:
1. Audit which (if any) S3-level invariants `epi-app` still validates (e.g. integration tests). Extract those to `gateway/tests/` or `epi-theia/extensions/.../test/`.
2. Move `epi-app` to a `Body/S/S3/legacy/epi-app/` folder OR `Idea/Pratibimba/Self/Action/History/epi-app-pre-cycle-3/`.
3. Update `S3-SPEC.md:147` ("`Body/S/S3` currently also holds `epi-app`...") to reflect deprecation.

**Benefit**: removes ambiguity for new contributors; aligns Body/S/S3 with the Cycle-3 invariant that M' shell authority is `Body/M/epi-theia`.

**Blast radius**: LOW if there are no live consumers (need to check). MEDIUM if anyone still runs the Electron app for testing — surface as a "carry forward to a named tranche" rather than a silent move.

### 5.7 [MEDIUM] `dispatch_contract.rs` test surface (527 LOC) needs region headers

**Location**: `gateway/tests/dispatch_contract.rs` (527 LOC — the largest test file in S3).

**Current shape**: a single test file covering: METHOD_NAMES sanity, dispatch plan / route table 1:1 agreement, S3' temporal routing, S1 Hen vault routing, S5 governance routing, S0 product membrane routing, kernel-envelope publish routing, channel/chat routing, the contract-level dispatch-plan kind classification, nara prefix handling.

**Proposed refactor**: split into per-region files OR add prominent `// =========== REGION: ... ===========` headers, with one `mod region_name { ... }` per concern. Pair each region with the corresponding contract surface (e.g. region `s5_governance_routing` matches the S5GovernanceAdapter entries in `METHOD_DISPATCH_PLAN`).

**Benefit**: when a new method is added, the test file change is localised; reviewers can see which contract surface a new test exercises.

**Blast radius**: NONE (test-only).

### 5.8 [LOW] Graphiti runtime — the HTTP-FastAPI dependency is a known compatibility-mode

**Location**: `graphiti-runtime/src/lib.rs:94-104` (`fire_provenance`), `:333-end` (`compose_file_path`, `start`, `stop`).

**Current shape**: `fire_provenance` makes a 3-second timeout POST to `http://127.0.0.1:37778/provenance`. This is the FastAPI sidecar pattern. Per `GraphitiAdapterContract::native_library()` at `gateway-contract/src/lib.rs:3530-3546` and per `S3-SPEC.md:54`, the architecture-of-record is `NativeLibrary` with `HttpCompatibility` as fallback — but the code is HTTP-only today.

**Proposed refactor**: introduce a `GraphitiClient` trait with two implementations:
- `HttpCompatibilityClient` — current FastAPI POST behaviour
- `NativeLibraryClient` — calls `graphiti-core` (Python) via PyO3 OR a Rust-native episodic store

Inject the choice through `GraphitiRuntimeConfig` (`graphiti-runtime/src/lib.rs:66-86`). Gate the native client behind a Cargo feature flag (`native-library`) so consumers can opt in without breaking the current HTTP path.

**Benefit**: explicit migration path matching the contract; M4'/M5' consumers can audit which mode is active via `GraphitiRuntimeStatus`.

**Blast radius**: HIGH if native client is wired in fast; LOW if we just introduce the trait + ship `HttpCompatibilityClient` first. Recommend the latter, then add the native client in a Tranche 03.T7 follow-up.

### 5.9 [LOW] `redis-context` is minimal — that's correct, but `RedisCache` lacks per-tier API methods

**Location**: `redis-context/src/redis_cache.rs:41-99`.

**Current shape**: `RedisCache::set_tiered(key, value, tier)` is the only tiered method. There is no `get_tiered(key, tier)` (the caller must construct `{tier.prefix()}:{key}` manually). `cache_coordinate` is the only convenience method.

**Proposed refactor**: add `get_tiered(key, tier)`, `exists_tiered(key, tier)`, `clear_tier(tier)` (FLUSHDB-scoped to the tier prefix) — symmetric with `set_tiered`.

**Benefit**: callers do not reach into `CacheTier::prefix()` directly; tier discipline is enforced at the API boundary.

**Blast radius**: NONE (additive).

### 5.10 [LOW] `epi-spacetime-module` lacks per-reducer unit tests

**Location**: `epi-spacetime-module/` — has no `tests/` directory.

**Current shape**: the 13 reducers are validated only through the gateway-side `SpacetimePresence` HTTP calls (e.g. `gateway/tests/runtime_state_contract.rs`). There is no in-module test that, say, `advance_world_clock` correctly increments the tick or `detect_coincidences` correctly identifies presence overlaps.

**Proposed refactor**: add a `epi-spacetime-module/tests/` directory with reducer-level unit tests (without standing up SpaceTimeDB — using mock `ReducerContext`). At least cover: `advance_world_clock` tick monotonicity, `bind_pratibimba_presence` RLS field shape, `detect_coincidences` participant filter, `publish_module_version` ABI version constant agreement with `gateway-contract::SPACETIME_REDUCER_ABI_VERSION`.

**Benefit**: drift detection at module level; catches the case where module crate and gateway-contract drift apart.

**Blast radius**: NONE (test-only).

### 5.11 [LOW] Contract version constants are duplicated across crates

**Location**: `gateway-contract/src/lib.rs:28-36` (`SPACETIME_CLOCK_PROTOCOL_VERSION`, `SPACETIME_PROJECTION_SCHEMA_VERSION`, `SPACETIME_REDUCER_ABI_VERSION`) AND `epi-spacetime-module/src/lib.rs:55` (`REDUCER_ABI_VERSION` only).

**Current shape**: the gateway crate names three version constants; the module crate names ONE (the reducer ABI). They are wired manually — drift is observable via the `module_version` row but not enforced at compile time.

**Proposed refactor**: extract the three constants into a tiny shared crate `epi-s3-contract-versions` (~30 LOC) consumed by both. Or: have `epi-spacetime-module/Cargo.toml` add `epi-s3-gateway-contract` as a dev-dependency just for the constant import (currently impossible because the WASM module can't pull the full contract crate).

**Benefit**: compile-time drift detection.

**Blast radius**: LOW. WASM build constraints need testing — that's why a tiny dedicated crate is preferable.

### 5.12 [LOW] `transcripts.rs` (124 LOC) inlines path construction — wrap in a `TranscriptPath` type

**Location**: `gateway/src/transcripts.rs`.

**Current shape**: transcript files at `{gate_root}/transcripts/{canonical_key}.jsonl`; path constructed inline per call.

**Proposed refactor**: a `TranscriptPath::new(gate_root, canonical_key)` newtype with `path() -> &Path`, `append(entry)`, `read_entries()` methods.

**Benefit**: tests can inject a `TranscriptPath::in_memory(...)` for unit testing; the `.jsonl` extension and directory law are enforced.

**Blast radius**: NONE (additive newtype).

---

## 6. Boundary Contracts

### 6.1 What S3 produces (downstream)

- To **S0** (`Body/S/S0/epi-cli/src/gate/`): `MethodDispatchPlanEntry` lookup table, `GatewayDispatchRoute` resolver, protocol frame builders (`hello_ok`, `success`, `error`, `connect_result`), `GatewayRuntimeState`. S0 hosts the WS listener but consults S3 for route ownership. Rule: **S0 MUST NOT maintain a parallel route table** (enforced by `s0_gate_server_dispatches_only_via_s3_route_metadata` in `Body/S/S0/epi-cli/tests/gate_full_parity_contract.rs`).
- To **S4** (`Body/S/S4/ta-onta/`): `route_anima_invoke(store, AnimaInvokeRequest)` (`gateway/src/dispatch.rs:119-141`), `SessionPatch` for VAK address mutation, `AnimaInvokeRequest` envelope. The `s4.agent.*` and `s4'.*` methods all route through `S4OrchestrationAdapter` (per `METHOD_DISPATCH_PLAN`).
- To **S5** (`Body/S/S5/epii-*`): the `S5GovernanceAdapter` method-family routes plus the Graphiti runtime adapter surface (`graphiti-runtime::session_memory_deposit_payload`, `kernel_resonance_deposit_payload`, `kernel_profile_observation_deposit_payload`, `provenance_from_record`). S5 owns Graphiti *invocation*; S3 owns Graphiti *runtime*.
- To **M' Theia** (`Body/M/epi-theia/extensions/kernel-bridge/`): the full kernel-bridge stream contract (`KernelBridgeConnectionStatus`, `KernelBridgeStreamEvent`, `KernelBridgeSubscriptionStatus`, `privacy_filter_table_delta`); the SpaceTimeDB projection (`SpacetimeProjectionDelta`, `SpacetimeTableDelta`); the six portal events.

### 6.2 What S3 consumes (upstream)

- From **S0** (`Body/S/S0/portal-core/`): `VakAddress` (`gateway-contract/src/lib.rs:13`), `KernelTickEnvelope`, `KernelProjection`, `KernelTemporalProjection`, `AnuttaraDiagnostic`, the entire `epi-kernel-contract` surface (re-exported at `gateway-contract/src/lib.rs:7-12`).
- From **S0** (the gateway *process* host): the runtime cwd, vault root, session id, day id, NOW path passed into `CreateSessionContext` (`gateway/src/session_store.rs:11-18`). The `gate_root` PathBuf is rooted at an S0-derived path.
- From **S1** (`Body/S/S1/hen-compiler-core`): the `s1'.vault.*` and `s1'.semantic.suggest_links` adapter — S3 dispatches but Hen owns the law.
- From **S2** (`Body/S/S2/graph-services`): the `s2.graph.*` and `s2'.coordinate.*` methods — S3 dispatches via `S2GraphServiceAdapter` (per `METHOD_DISPATCH_PLAN:1099-1206`).

### 6.3 The S0 / S3 extraction boundary

Per `gateway/src/dispatch.rs:30-38` and `S3-SPEC.md:136-147`: S0 currently runs the Tokio WS listener and the per-frame dispatch loop in `gate::server::dispatch_rpc`, but it MUST consult `epi_s3_gateway::dispatch::classify_method` for route ownership and `epi_s3_gateway::dispatch::dispatch_plan_entry` for the executable plan. The plan for full S3-native dispatch hosting is Track 13's later tranches.

**Verifier**: the dispatch_contract.rs 527-LOC test (`gateway/tests/dispatch_contract.rs`) asserts the 1:1 agreement between `classify_method` and `METHOD_DISPATCH_PLAN`; the `gate_full_parity_contract.rs` test in S0 asserts S0 consults S3.

---

## 7. Theia Integration Points

The Theia kernel-bridge extension (`Body/M/epi-theia/extensions/kernel-bridge/`) consumes the S3 surface through its `kernel-bridge-backend-service.ts`. Key integration points:

### 7.1 Current bridge methods (consumed)

Per `S3-SPEC.md:62-79`:
1. `createGatewayWebSocket(EPI_GATEWAY_URL)` — single WebSocket; S3 returns `HelloOkFrame` (`gateway/src/protocol.rs:31-44`).
2. `connect` RPC → `connect_result()` (`gateway/src/protocol.rs:79-89`) returning `{protocol, version, features: {methods, events}}`.
3. `KernelBridgeAPI.invokeCapability(request)` — generic RPC; S3 routes via `classify_method` and dispatches to the appropriate substrate.
4. `subscribeWorldClock`, `subscribePratibimbaPresence`, `subscribeSharedArchetypeEvents` — SpaceTimeDB `SubscribeMulti` over `world_clock`, `pratibimba_presence`, `shared_archetype_event`.
5. `cachedProfile` + `onProfile` events → `KernelBridgeCachedSurface` (`gateway-contract/src/lib.rs:2492-2501`) carrying safe-public-current kernel projection.
6. `connectionStatus` + `onConnectionChange` → `KernelBridgeConnectionStatus` (`gateway-contract/src/lib.rs:2361-2373`) with embedded `GraphitiRuntimeStatus`.

### 7.2 Bridge methods NEEDED (proposed)

Surfacing the §4.2 gaps as concrete kernel-bridge API extensions:

| Proposed method | S3 surface to expose | Consumer |
|---|---|---|
| `KernelBridgeAPI.subscribeKernelEnvelope(sessionKey)` | New `s3'.kernel.envelope.subscribe` method; carries `KernelTickEnvelope` deltas | M1' Paramaśiva played-torus (replaces the current pattern of parsing `kernel_projection_json` rows) |
| `KernelBridgeAPI.subscribeRegistry()` | New `s3'.subscription.registry` method exposing `S3SubscriptionRegistryFacts` | OmniPanel runtime monitoring (the agentic sidebar runtime page) |
| `KernelBridgeAPI.subscribePortalEvent(eventName)` | New `s3.portal.subscribe(eventName)` method; per-event sub instead of broadcast-then-filter-at-renderer | Six M-extensions consuming portal events |
| `KernelBridgeAPI.invokeGnostic({method, params})` | New `s5'.gnostic.*` method family registration in `METHOD_NAMES` + `METHOD_DISPATCH_PLAN` | M5' Epii (Tranche 12.2) |
| `KernelBridgeAPI.invokeChannelExtraction(...)` | The Tranche 13.T3 extraction work — once channel/chat runtime is S3-native, the kernel-bridge method becomes redundant; today it's still S0-hosted | OmniPanel chat surface |

### 7.3 Privacy contract enforcement at the Theia boundary

`privacy_filter_table_delta(delta)` at `gateway-contract/src/lib.rs:2633+` is the canonical filter. The `compiled KernelBridgeAPI drops forbidden private stream row bodies` test (per `S3-SPEC.md:74`) asserts that protected `M4.4.4.4` / journal / oracle row bodies never reach the renderer. New M-extensions MUST consume the typed `KernelBridgeStreamEvent` (`gateway-contract/src/lib.rs:2553+`) rather than raw rows so the filter is type-enforced.

---

## 8. Anti-Greenfield Audit

Per the binding rule: substrate is consumed as-is, audited, extended, or refactored — never rebuilt.

### 8.1 Landed (consume as-is)

- ✅ `Body/S/S3/gateway-contract` — METHOD_NAMES, METHOD_DISPATCH_PLAN, SessionRecord/Patch, all SpaceTime projection types, kernel-bridge stream contract.
- ✅ `Body/S/S3/gateway` — SessionStore, GatewayRuntimeState, classify_method, route_anima_invoke, the 1,765-LOC spacetime bridge (extracted from S0 per 13.T4).
- ✅ `Body/S/S3/graphiti-runtime` — episode envelopes, deposit payload builders, provenance fire.
- ✅ `Body/S/S3/epi-spacetime-module` — 14 tables, 13 reducers, WASM-targeted, pinned `spacetimedb = "=2.2.0"`.
- ✅ `Body/S/S3/redis-context` — Redis residency declaration, tiered cache, RedisVL path resolution.

### 8.2 Pending (extend / refactor with named scope)

- 🔧 **5.1**: split `gateway-contract/src/lib.rs` into module tree (refactor, NOT rebuild — pure file motion).
- 🔧 **5.2**: split `gateway/src/spacetime.rs` into `spacetime/` submodule directory (refactor).
- 🔧 **5.3**: collapse `classify_method` and `METHOD_DISPATCH_PLAN` to one canonical source (refactor).
- 🔧 **5.4**: extract `SessionRecord` sub-records (refactor with migration discipline).
- 🔧 **5.5**: consolidate `GatewayRuntimeState` locks (refactor).
- 🔧 **5.6**: migrate/decommission `Body/S/S3/epi-app` (cleanup with named scope: move to `legacy/` OR archive to `Idea/Pratibimba/Self/Action/History/`).
- 🔧 **5.7**: split `gateway/tests/dispatch_contract.rs` into regions (refactor test).
- 🔧 **5.8**: introduce `GraphitiClient` trait + `HttpCompatibilityClient` impl, gate `NativeLibraryClient` behind a Cargo feature (extend with named scope).
- 🔧 **5.10**: add `epi-spacetime-module/tests/` reducer-level unit tests (extend with named scope).
- 🔧 **5.11**: extract version constants to `epi-s3-contract-versions` shared crate (extend).

### 8.3 Net-new (genuine first-build)

- 🆕 **Gap 1**: `s5'.gnostic.*` method family registration in `METHOD_NAMES` + `METHOD_DISPATCH_PLAN` (named integration blocker for Tranche 12.2).
- 🆕 **Gap 4**: `s3.portal.publish` / `s3.portal.subscribe` method pair (named carrier for the six portal events).
- 🆕 **§7.2 Bridge methods NEEDED**: `subscribeKernelEnvelope`, `subscribeRegistry`, `subscribePortalEvent`, `invokeGnostic` (each is a typed kernel-bridge method backed by a named S3 RPC).

Nothing else is net-new. The S3 substrate is overwhelmingly landed.

---

## 9. Test Criteria

### 9.1 Per sub-coordinate acceptance commands

```bash
# S3-0 / S3-0' protocol + dispatch plan
cargo test -p epi-s3-gateway-contract --test hermes_inspired_contracts
cargo test -p epi-s3-gateway --test protocol_contract
cargo test -p epi-s3-gateway --test dispatch_contract

# S3-1 / S3-1' sessions + chat + subagents
cargo test -p epi-s3-gateway --test session_store_contract
cargo test -p epi-s3-gateway --test anima_invoke_contract

# S3-2 / S3-2' redis
cargo test -p epi-s3-redis-context
# Note: the live-Redis tests are #[ignore] — they require Docker.
# To run: docker run -p 6379:6379 redis/redis-stack && cargo test -- --ignored

# S3-3 / S3-3' SpaceTimeDB projection
cargo test -p epi-s3-gateway --test runtime_state_contract
# Module-level tests do not exist yet (5.10 finding); add once landed.
cargo build -p epi-spacetime-module --target wasm32-unknown-unknown

# S3-4 / S3-4' graphiti runtime + dispatch
cargo test -p epi-s3-graphiti-runtime
cargo test -p epi-s3-gateway --test graphiti_runtime_contract

# S3-5 / S3-5' runtime state + smoke
cargo test -p epi-s3-gateway --test runtime_state_contract
cargo test -p epi-s3-gateway --test live_gateway_smoke
```

### 9.2 Acceptance criteria

- **Dispatch integrity**: `methods_in_route_table_missing_from_dispatch_plan().is_empty()` AND `methods_in_dispatch_plan_missing_from_route_table().is_empty()` for all product methods.
- **Privacy floor**: `scan_for_forbidden_privacy_fields(payload).is_empty()` for every outbound stream payload.
- **Silent fallback refused**: `assert_no_silent_fallback_in_value(readiness_value)` returns `Ok(())` for every readiness emission.
- **Subscription registry**: every `subscribe_projection` call results in exactly one `register_subscription` and exactly one `unregister_subscription` over the connection lifetime.
- **WASM module build**: `cargo build -p epi-spacetime-module --target wasm32-unknown-unknown` succeeds; the `module_version` row's `reducer_abi_version` equals `gateway-contract::SPACETIME_REDUCER_ABI_VERSION` at deploy time.
- **Kernel-bridge 6/6 boundary tests**: `node --test extensions/test/kernel-bridge-theia-boundary.test.mjs extensions/test/shared-bridge-fan-out.test.mjs` (run from the Theia extension root) passes.

---

## 10. Cross-Cutting Findings (Cycle-3 Ledger Actions)

This section names the actions to propose for the cycle-3 ledger harmonisation (Phase D), expressed as enrichments to existing tranches or new tranches.

### 10.1 Enrich existing tranches

| Tranche | Enrichment |
|---|---|
| **03.T2-T6** (S3' SpaceTimeDB / Graphiti / kernel-envelope closure) | Add deliverables: (a) split `gateway/src/spacetime.rs` per §5.2; (b) add `epi-spacetime-module/tests/` per §5.10; (c) extract version constants per §5.11 |
| **13.T2** (S3 route ownership extraction) | Add deliverable: collapse `classify_method` and `METHOD_DISPATCH_PLAN` per §5.3 — single source of truth |
| **13.T3** (channel/chat runtime extraction) | Confirm scope: the six methods tagged `planned 13.T3 extraction` in `gateway-contract/src/lib.rs:925-979` ARE the extraction surface |
| **13.T4** (explicit fallback policy) | Already landed; no enrichment needed |
| **10.10** (profile-bus extensions) | Cross-reference: S3 does not own profile-bus directly; the `s3'.kernel.envelope.publish` method is the publishing carrier — note the §7.2 subscription pair gap |
| **12.2** (M5' s5'.gnostic.* gateway registration) | This is the §4.2 Gap 1 / §8.3 net-new entry; concrete deliverable: add `s5'.gnostic.{search,synthesise,deposit_chrysolite,...}` to `METHOD_NAMES` AND `METHOD_DISPATCH_PLAN` with `kind: S5GovernanceAdapter` and `authority_path: "Body/S/S5/epi-gnostic"` |

### 10.2 Propose new tranches

| Proposed tranche | Scope | Estimated LOC delta |
|---|---|---|
| **15.S3.A — `gateway-contract` module-tree refactor** (§5.1) | Pure file motion; `lib.rs` becomes re-export-only | -4,800 LOC from lib.rs + 4,800 LOC across submodules + ~150 LOC of `pub use` boilerplate |
| **15.S3.B — `SessionRecord` sub-record extraction** (§5.4) | Add `SessionIdentity`, `SessionLineage`, `SessionTemporal`, `SessionRuntime`, `ChannelBinding`, `OrchestrationContext`, `AgentIdentity`, `CliHints`; `Patch<T>` typed enum | ~300 LOC added in `session.rs`; wire-format preservation via `#[serde(flatten)]` |
| **15.S3.C — `epi-app` legacy migration / decommission** (§5.6) | Move to `legacy/` or archive; update `S3-SPEC.md:147` | n/a (cleanup) |
| **15.S3.D — Graphiti `NativeLibraryClient` Cargo feature** (§5.8) | Trait + HTTP impl now; native impl in follow-up | +200 LOC |
| **15.S3.E — Kernel-bridge subscription pair surfaces** (§7.2) | Add `s3'.kernel.envelope.subscribe`, `s3'.subscription.registry`, `s3.portal.subscribe(eventName)` methods and kernel-bridge client methods | +400 LOC contract + +200 LOC runtime + +300 LOC kernel-bridge backend |
| **15.S3.F — `s5'.gnostic.*` family registration** (§8.3 / Tranche 12.2 dependency) | METHOD_NAMES additions + METHOD_DISPATCH_PLAN entries + S5GovernanceAdapter wiring | +100 LOC contract + downstream S5 work |

### 10.3 Decisions to record in the cycle-3 ledger

| Decision | Rationale |
|---|---|
| **DR-S3-1**: `Body/S/S3/epi-app` is deprecated; M' shell authority is `Body/M/epi-theia` | Memory invariant `project_theia_shell_moved_to_epi_theia`; aligns with cycle-3 |
| **DR-S3-2**: Graphiti adapter ships as `NativeLibrary` target with `HttpCompatibility` current mode; the FastAPI sidecar is NOT the architectural target | `gateway-contract/src/lib.rs:3530-3546`; `S3-SPEC.md:54` |
| **DR-S3-3**: `METHOD_DISPATCH_PLAN` becomes the canonical dispatch source; `classify_method` derives from it | §5.3 refactor |
| **DR-S3-4**: `gateway-contract/src/lib.rs` is split into a module tree before any further contract additions | §5.1 — additions are easier in the split form |
| **DR-S3-5**: every new S3-owned RPC method is registered in BOTH `METHOD_NAMES` and `METHOD_DISPATCH_PLAN` in the same PR; no method may land in one alone | Enforced by `methods_in_*_missing_from_*` regression tests |

### 10.4 Open orphans to surface

- **Orphan O-S3-1**: `Body/S/S3/epi-app` substantively predates the M' Theia migration; no current tranche owns its disposition.
- **Orphan O-S3-2**: `S3-SPEC.md:147` still says "Body/S/S3 currently also holds epi-app and epi-spacetime-module; the next S3 extraction step is the live dispatch/server adapter" — the `epi-spacetime-module` part is now wrong (the module IS the live SpaceTimeDB module, not an extraction target), and `epi-app` should be removed from the sentence.
- **Orphan O-S3-3**: the `nara.*` prefix in `dispatch.rs:376-383` is handled by `S4S5DomainAdapter` but doesn't appear in `METHOD_NAMES` (it's a *prefix*, not a fixed method). The integrity test special-cases it; this is fragile. Surface to Tranche 13's follow-up.

---

## Appendix A: File:Line Citation Index

For grep-friendly cross-reference:

- `Body/S/S3/gateway/src/lib.rs:1-16` — module declarations + re-exports
- `Body/S/S3/gateway/src/protocol.rs:1-89` — protocol frames
- `Body/S/S3/gateway/src/dispatch.rs:34-38` — re-exports from gateway-contract
- `Body/S/S3/gateway/src/dispatch.rs:69-89` — drift-test helpers
- `Body/S/S3/gateway/src/dispatch.rs:95-141` — anima invoke
- `Body/S/S3/gateway/src/dispatch.rs:143-198` — owner/class/route enums
- `Body/S/S3/gateway/src/dispatch.rs:200-471` — `classify_method` match
- `Body/S/S3/gateway/src/runtime.rs:9-25` — `GatewayRuntimeState` (9 locks)
- `Body/S/S3/gateway/src/runtime.rs:37-58` — `GatewaySubscriptionRecord`
- `Body/S/S3/gateway/src/runtime.rs:75-316` — `impl GatewayRuntimeState`
- `Body/S/S3/gateway/src/session_store.rs:11-18` — `CreateSessionContext`
- `Body/S/S3/gateway/src/session_store.rs:20-514` — `SessionStore`
- `Body/S/S3/gateway/src/subagents.rs:18-39` — `parse_agent_session_key`
- `Body/S/S3/gateway/src/subagents.rs:41-68` — `validate_spawned_by_patch`
- `Body/S/S3/gateway/src/subagents.rs:70-117` — `resolve_agent_launch_context`
- `Body/S/S3/gateway/src/spacetime.rs:42-68` — fallback sentinel + policy
- `Body/S/S3/gateway/src/spacetime.rs:70-189` — resync tracker
- `Body/S/S3/gateway/src/spacetime.rs:191-491` — `SpacetimeRegistration`
- `Body/S/S3/gateway/src/spacetime.rs:577-1141` — `SpacetimePresence`
- `Body/S/S3/gateway/src/spacetime.rs:1142-1173` — `ReducerRetryPolicy`
- `Body/S/S3/gateway/src/spacetime.rs:1174-1490` — projection context decoders
- `Body/S/S3/gateway/src/spacetime.rs:1491-1648` — identity helpers (Blake3 etc.)
- `Body/S/S3/gateway/src/spacetime.rs:1649-1762` — lifecycle envelopes
- `Body/S/S3/gateway-contract/src/lib.rs:15-114` — version constants + table lists
- `Body/S/S3/gateway-contract/src/lib.rs:115-271` — METHOD_NAMES (134 entries)
- `Body/S/S3/gateway-contract/src/lib.rs:289-388` — portal events + protocol contracts
- `Body/S/S3/gateway-contract/src/lib.rs:389-537` — Hermes-parity contracts
- `Body/S/S3/gateway-contract/src/lib.rs:539-783` — `GatewaySessionOperation*`
- `Body/S/S3/gateway-contract/src/lib.rs:828-1833` — dispatch plan
- `Body/S/S3/gateway-contract/src/lib.rs:1853-2333` — SpaceTime projection types
- `Body/S/S3/gateway-contract/src/lib.rs:2335-2786` — kernel-bridge stream contract
- `Body/S/S3/gateway-contract/src/lib.rs:2899-3220` — privacy + S1 vault types
- `Body/S/S3/gateway-contract/src/lib.rs:3225-3340` — SessionRecord + SessionPatch
- `Body/S/S3/gateway-contract/src/lib.rs:3343-3389` — RedisTemporalContextRole
- `Body/S/S3/gateway-contract/src/lib.rs:3392-3500` — RunContext/RunSnapshot/ChatRunRegistry/GatewayEvent
- `Body/S/S3/gateway-contract/src/lib.rs:3502-3546` — Graphiti adapter contract
- `Body/S/S3/gateway-contract/src/lib.rs:3577-end` — tests
- `Body/S/S3/graphiti-runtime/src/lib.rs:18-92` — typed shapes
- `Body/S/S3/graphiti-runtime/src/lib.rs:94-136` — provenance + envelope
- `Body/S/S3/graphiti-runtime/src/lib.rs:139-332` — deposit payload builders
- `Body/S/S3/graphiti-runtime/src/lib.rs:333-end` — runtime lifecycle (HTTP)
- `Body/S/S3/epi-spacetime-module/src/lib.rs:40-65` — version constants
- `Body/S/S3/epi-spacetime-module/src/lib.rs:58-195` — table declarations (14)
- `Body/S/S3/epi-spacetime-module/src/lib.rs:197-472` — base reducers (8)
- `Body/S/S3/epi-spacetime-module/src/lib.rs:481-582` — shared-cosmos tables
- `Body/S/S3/epi-spacetime-module/src/lib.rs:593-820` — shared-cosmos reducers (5)
- `Body/S/S3/redis-context/src/lib.rs:1-47` — residency contract
- `Body/S/S3/redis-context/src/redis_cache.rs:1-99` — tiered cache client
- `Body/S/S3/gateway/tests/dispatch_contract.rs:1-527` — dispatch regression
- `Body/S/S3/gateway/tests/session_store_contract.rs:1-154` — session-store regression
- `Body/S/S3/gateway/tests/runtime_state_contract.rs:1-309` — runtime + subscription regression
- `Body/S/S3/gateway/tests/graphiti_runtime_contract.rs:1-251` — Graphiti regression
- `Body/S/S3/gateway/tests/anima_invoke_contract.rs:1-83` — anima invoke regression
- `Body/S/S3/gateway/tests/live_gateway_smoke.rs:1-163` — live smoke
- `Body/S/S3/gateway-contract/tests/hermes_inspired_contracts.rs:1-176` — Hermes parity

---

*Document Version:* 1.0 (cycle-3 Phase A — S3 PAI)
*Author:* S3 architecture agent (cycle-3 controller spawn)
*Cross-references:* [[S3-SPEC]], [[S3'-SPEC]], [[Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE]] (kernel-bridge consumer), [[Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE]] (kernel-envelope consumer), [[Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/00-overview-and-design-reconciliation]]
