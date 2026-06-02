---
coordinate: "S3/S3'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_0_source_coordinates:
  - "[[PROTOCOL S COORDINATE MODULE SPEC BUILD]]"
  - "[[S0-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S2-SPEC]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[S3]]"
  - "[[S3']]"
  - "[[S3'Cx]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
---

# S3/S3' Specification: Gateway Control and Temporal State Law

## Status

This is the consolidated S3-level master specification. It replaces the older scattered [[S3]], [[S3']], [[S3'Cx]], and S3-y/S3-y' files as the build reference for the gateway/runtime layer.

Architecture diagrams consumed by this spec and its shards are [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. Shard-level work must follow [[S-SHARD-HARMONIZATION-PROTOCOL]] and keep the S3/S3' canvases under `Idea/Bimba/World/Types/Coordinates/S/**` as MOC/type surfaces rather than Seed substitutes.

S3 is the imperative gateway control plane: [[WebSocket]] / [[RPC]] transport, protocol handshake, request/response frames, session authority, channel routing, chat/agent/config/cron/skills/device/node/browser/approval/log surfaces, event fanout, and [[OmniPanel]] / [[Epi-Claw Parity]] pressure.

S3' is the shared temporal/state contract: [[Chronos]] grounding, [[Day]], [[NOW]], [[Kairos]], Redis-backed temporal context, [[Graphiti]] temporal episodic architecture, presence, subscriptions, [[SpacetimeDB]] live-state projection, session close/arc timing, and the [[Universal NOW]] field where gateway consequences become shared state.

The Hermes parity pass adds a set of contract-level gateway refinements, all implemented as Epi-Logos-native S3/S3' surfaces rather than vendor product inheritance:

- `s0.command.exec` and `s0.command.completion` are S0' command-centre methods over the existing portal surface registry. The TUI and future OmniPanel/Tauri command bar should call these contracts instead of inventing a second settings/command model.
- Portal event vocabulary is typed at the gateway-contract level: `portal.token`, `portal.tool_call`, `portal.lens_pressure`, `portal.vak_eval`, `portal.review_deposit`, and `portal.kairos_shift`.
- Gateway protocol families are explicit: JSON-RPC for current stdio/WebSocket style clients and ACP as an additive editor/agent protocol family. Both derive session identity from DAY/NOW plus subject-coordinate resolution.
- Platform adapters should be shaped as a Rust async trait (`BasePlatformAdapter`) with connect/disconnect/send/media/typing/handler methods. Platform-specific message chunking/truncation is implementation-internal, not part of the trait authority.
- Subject-coordinate resolution is a gateway pre-agent step. Inbound platform identities resolve to a safe subject coordinate/identity ref before Anima or Epii fires.
- Cron keeps the useful file-locked tick and target syntax (`origin`, `local`, `platform`, `platform:chat_id`) but writes outputs as Graphiti episodic records plus DAY/NOW vault artifacts under Hen/Khora law, not a flat product ledger.
- The future S5' MCP event stream uses cursor methods (`events_poll(after_cursor)`, `events_wait(after_cursor, timeout)`) over Epii inbox, autoresearch, and Aletheia events.

Redis ownership must be clear here: S3 owns the Redis runtime substrate and RedisVL bridge residency. S2 owns graph semantic-cache law and namespace use over that runtime, while S3' owns Redis-backed temporal contextual grounding because live context is time-bound before it is graph-bound. Session continuity, NOW linkage, kairos state, active arc handles, episode handles, Graphiti search/result cache keys, and shared Day context belong under [[Chronos]] key law.

Graphiti placement is likewise explicit: architecturally, [[Graphiti]] belongs at S3/S3' as the temporal episodic memory architecture. S5/S5' owns how Graphiti is invoked, searched, governed, reflected, and used by [[Aletheia]] / [[Epii]]. The current `epi-graphiti` FastAPI process is a wrapper around the `graphiti-core` Python library for Rust/HTTP/Docker convenience; it is not a necessary architectural sidecar and should not be preserved as the target shape.

## M' Consumer Surfaces

S3/S3' is the temporal/runtime substrate behind [[M'-SYSTEM-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], and [[M5'-SPEC]]. The most direct anchors back into those consumers are [[Body/S/S3/gateway/src/lib.rs]], [[Body/S/S3/gateway/src/session_store.rs]], [[Body/S/S3/gateway-contract/src/lib.rs]], [[Body/S/S3/epi-spacetime-module/src/lib.rs]], [[Body/S/S3/graphiti-runtime/src/lib.rs]], and [[Body/S/S3/redis-context/src/lib.rs]].

### M' Shell Consumed Contract Closure - Cycle 2 T12.T0

This closure narrows the M' surface to **only what the M'-Theia shell, `/body` lite-surface, OmniPanel, and M3/M4/M5 extensions actually consume** from S3/S3'. It is not a re-statement of the full S3 method manifest; it pins the consumed boundary so cycle 2 work stays subordinate to substrate already landed in `Body/S/S3` (and the live S0-hosted gateway dispatch that consults S3 route ownership).

**Consumption pattern.** All M' shell consumption flows through the single S3 gateway WebSocket bound by [[Idea/Pratibimba/System/extensions/kernel-bridge]]'s backend service (`createGatewayWebSocket` against `EPI_GATEWAY_URL`). M-extensions receive S3 state through the single `KernelBridgeAPI` singleton fanned out by `SharedBridgeAdapter` to six subscribers (Track 07 T1 verification). No M-extension may open its own gateway socket or import raw `gateway-contract` clients (Track 07 T0 contract preflight).

**Closed S3/S3' surfaces.**

| Surface | M'-shell consumer | S3/S3' authority | Verification |
|---|---|---|---|
| Gateway handshake | `kernel-bridge-backend-service` opens one WebSocket, performs `connect`, receives `session_key` / `session_id` / `day_id` / `now_id` / `now_path` / `workspace_root` / `temporal_state` | `Body/S/S3/gateway` `connect` (§A.connect, protocol v3) backed by `Body/S/S3/gateway/src/session_store.rs` | `kernel-bridge declares a Theia frontend and backend extension boundary` (asserts `createGatewayWebSocket` + `EPI_GATEWAY_URL` + `notifyConnectionStatus` / `notifyProfile` in backend source) |
| Capability dispatch | `KernelBridgeAPI.invokeCapability(request)` carrying `{method, params}` | Gateway routes `request.method` against the parity manifest (`agent.capabilities`, `s3.session.*`, `s3.channel.*`, `s3.message.route`, plus delegated S0/S1/S2/S4/S5 method families) | `compiled KernelBridgeAPI exposes frontend-safe S3 stream subscriptions`; receipt shape coerced through `coerceCapabilityReceipt` |
| Bridge status mirror | `connectionStatus` + `onConnectionChange` re-emit `KernelBridgeConnectionStatus` to renderer | `Body/S/S3/gateway` protocol frames + heartbeat plus backend `notifyConnectionStatus` | `single SharedBridgeAdapter fans out one upstream subscription to six extensions` + `observability publish propagates through one fan-out point` |
| Profile mirror | `cachedProfile` + `onProfile` carry `KernelBridgeCachedProfile` (`s5'.harmonic_profile` snapshot + `portal-core::KernelTemporalProjection` safe public-current tick/pulse/energy) | Gateway routes `s5'.harmonic_profile` reads against S5 authority; safe kernel projection comes from `Body/S/S0/portal-core/src/kernel.rs` through `s3'.temporal.context` | `backend-pushed events drive the compiled KernelBridgeAPI singleton` |
| SpaceTimeDB shared-cosmos subscriptions | `subscribeWorldClock`, `subscribePratibimbaPresence`, `subscribeSharedArchetypeEvents` | `Body/S/S3/gateway` opens one `v1.json.spacetimedb` `SubscribeMulti` loop against the projection tables `world_clock`, `pratibimba_presence` (RLS-filtered), `shared_archetype_event` (opt-in); 1 Hz `advance_world_clock`; per-instance reducers in `Body/S/S3/epi-spacetime-module` | `compiled KernelBridgeAPI drops forbidden private stream row bodies` (negative test: protected M4.4.4.4 / journal / oracle row bodies cannot leak through stream deltas to the renderer) |
| Temporal context for `/body` and shell `1` | `s3'.temporal.context` resolves DAY/NOW/Kairos/Redis/SpaceTimeDB projection + history archive placement; consumed by body-lite-surface to anchor `sessionKey`, `dayNow`, `profileGeneration`, `coordinate` in `CrossLayoutIntent` payloads | `Body/S/S0/epi-cli/src/gate/temporal.rs` (live `epi gate temporal context`) + S3' contract in §B.temporal | `body-lite-surface.test.mjs` proves `BODY_DEEP_LINK_CONTEXT_FIELDS` enumerates the 8 contract fields and intent dispatch preserves the full payload list across the cross-layout switch |

**Reconnect / resubscribe lifecycle.** The kernel-bridge backend owns reconnect after gateway restart; the renderer-side `KernelBridgeAPI` singleton replays cached profile + connection status to late subscribers with `stale: true` until the next live observation. The single fan-out point ensures one upstream resubscribe regardless of how many M-extensions are mounted (Track 01 T5 background lifecycle deliverable depends on this contract).

**Verification evidence (2026-06-02).** `node --test extensions/test/kernel-bridge-theia-boundary.test.mjs extensions/test/shared-bridge-fan-out.test.mjs` returns 6/6 pass for the gateway-handshake, capability-dispatch, bridge-status, profile-mirror, and stream-subscription contracts. `body-lite-surface.test.mjs` (23/23) confirms the temporal-context payload preservation across the deep-link switch and the privacy floor blocking forbidden stream-row bodies.

**Still-missing integration blockers.** None at this tranche scope from the M' consumption side. Open items remain at S3 dispatch home extraction (the live server still hosted in `Body/S/S0/epi-cli/src/gate` while consulting S3 route ownership), live SpaceTimeDB reducer registration outside test fixtures, and Graphiti runtime promotion - those are S3 dispatch/extraction tasks (Track 13 or a future S3 closure tranche), not M' consumption blockers.

## VAK Gate

- CPF: `(4.0/1-4.4/5)` - full reflective lattice held as one dispatch field.
- CT: `CT1` - specification / form-giving law.
- CP: `4.1 Definition` moving toward `4.2 Operation`.
- CF: `(0/1)` primary [[Logos]] with [[Eros]] implementation/test reality.
- CFP: S-family, S3/S3' gateway and temporal runtime.
- CS: `CS3` with dependency on [[S0]], [[S1]], and [[S2]].

Manual dispatch result: [[Logos]] owns the command/state distinction; [[Eros]] owns the live gateway and parity-test implications; [[Chronos]] is the named S3' augmentation module; [[Anima]] and [[Psyche]] consume S3/S3' as runtime inhabitation substrate.

## Preflight. Derivation Notes

### Old S-file carry-forward

The older [[S3]] files correctly preserve the loop intuition: observe, think, plan, build, execute, verify/learn. That is still useful as a runtime-cycle image, especially for gateway event flow and session learning. The older [[S3']] files correctly identify infrastructure concerns such as hooks, plugin lifecycle, temporal context, agent execution, and reflection.

The old base sequence survives only as genealogy, not as final ownership:

| Old base coordinate | Carry-forward intuition |
|---|---|
| [[S3.0]] Observe | Connection/perception ground, input reception, status/health |
| [[S3.1]] Think | Request/message form, requester identity, channel definition |
| [[S3.2]] Plan | Session operations, history windows, patch/reset lineage |
| [[S3.3]] Build | Routing patterns, agent/channel dispatch, event fanout |
| [[S3.4]] Execute | Presence/runtime context, action consequences, shared state |
| [[S3.5]] Verify/Learn | Integration surface, app bridge, telemetry, history return |

The old prime sequence names ta-onta modules at S3', but current architecture re-homes most of those modules to [[S4]] / [[S4']]. What remains at S3' is the temporal/state contract, primarily [[Chronos]]:

| Old prime coordinate | Current expression |
|---|---|
| [[S3.0']] Khora/plugin ground | Gateway contract ground: protocol v3, hello-ok, session invariants |
| [[S3.1']] Hen/state coordination | Gateway form law: method manifest, channel schemas, parity naming |
| [[S3.2']] Pleroma/skills | Gateway operation contract: SessionStore, cron, config, command/state mutation |
| [[S3.3']] Chronos/Kairos | Shared state patterns: subscriptions, broadcast, SpacetimeDB projection |
| [[S3.4']] Anima/agent runtime | Temporal surfacing: Day/NOW/Kairos/Redis context/presence |
| [[S3.5']] Aletheia/learning | Gateway return law: history, close, arc timing, event delivery |

### Corrections / re-homing

Older PAI/plugin readings are not the target shape. Current architecture settles the split:

- [[S3]] is gateway control plane, not general agent cognition.
- [[S3']] is temporal/state law, not the whole ta-onta plugin system.
- [[S4]] / [[S4']] owns agent runtime, [[Anima]], [[VAK]], constitutional dispatch, and inhabitation law.
- [[S3]] / [[S3']] owns [[Graphiti]] as temporal episodic architecture. [[S5]] / [[S5']] owns Graphiti invocation, usage, search strategy, arc governance, reflection, and world-return meaning through [[Aletheia]] / [[Epii]].
- Redis-backed live context is S3' when it grounds temporal continuity, NOW linkage, kairos state, and active episode/arc handles.

### Current code reality

The live implementation is broad but not yet coordinate-native:

- `Body/S/S0/epi-cli/src/gate/` implements gateway commands, live WebSocket server dispatch, parity manifest, sessions/chat/config/cron/channels/logs/models/skills/nodes/devices/browser/approvals/TLS/lock/subagents/team store, Graphiti compatibility controls, and SpacetimeDB bridge. Protocol frames, runtime state, and durable session storage now delegate to Body-native S3 modules; future work should thin the live dispatch/domain handlers into S3 wrappers without losing product parity.
- `Body/S/S0/epi-cli/src/gate/temporal.rs` now provides the first live S3' temporal context surface. It resolves a gateway session into DAY/NOW identity, date and NOW wikilinks, `Idea/Pratibimba/Self/Action/History` archive placement, S3 Redis temporal keys, SpaceTimeDB projection metadata, safe current kernel tick/pulse/energy through `portal-core::KernelTemporalProjection`, and Graphiti session-arc orientation. It is exposed as `epi gate temporal context` for CLI use and `s3'.temporal.context` for S4/S5 agent/tool access, and S5's `s5'.epii.runtime.context` now passes the same safe kernel projection into PI-agent orientation.
- `epi gate methods` returns a product/RPC-native manifest: `connect`, `chat.send`, `sessions.list`, `cron.add`, `node.invoke`, `exec.approval.request`, `models.list`, `skills.status`, `wizard.start`, and related methods.
- Current canonical FLOW API wants coordinate-native methods: `s3.session.*`, `s3.channel.*`, `s3.message.route`, `s3'.temporal.*`, `s3'.day.*`, `s3'.kairos.*`, `s3'.presence.*`, and `s3'.context.*`.
- `Body/S/S3/gateway-contract` owns the pure gateway/projection contract: product method names, event names, session record/patch shape, SpaceTimeDB projection table list, native/HTTP modes, `SubscribeMulti` message shape, S3'/S4/S5 owner fields, subscription row decoding for `session_surface` / `kairos_surface` / `global_temporal_surface` including `kernel_projection_json`, and route ownership for `s2.graph.kernel_resonance.record` / `s5.episodic.kernel_resonance.deposit`.
- `Body/S/S3/gateway` owns gateway protocol frame construction, runtime run/event/chat state, and the durable gateway session store: record creation with externally injected Pi/Khora runtime context, list/resolve/patch/delete authority, legacy OmniPanel row normalization, transcript path law, workspace/bootstrap scope derivation, and subagent launch validation. S0 remains the live server/runtime adapter that supplies cwd, vault root, session id, day id, and NOW path from the active Pi session and hosts domain-specific dispatch while it is being extracted.
- `Body/S/S3/redis-context` owns Redis runtime residency and the RedisVL bridge path contract. It keeps `s2:graph:semantic` and `s3:gateway:temporal` as distinct namespaces over the same local Redis Stack substrate.
- `spacetimedb_bridge.rs` is currently a file-backed/test event bridge plus a live reducer client for the S3/S3' SpaceTimeDB registration/projection plane. The current S0-hosted gateway can register gateway, client, agent, session, heartbeat, Kairos, safe kernel projection, global temporal, and temporal event surfaces when configured, and it can read the `session_surface` / `kairos_surface` / `global_temporal_surface` projection through HTTP SQL polling. Gateway readiness now also exposes the native WebSocket subscription plan over the same projection tables, and `epi portal` can use that S3-owned plan to open a `v1.json.spacetimedb` `SubscribeMulti` loop for `session_surface`, `kairos_surface`, and `global_temporal_surface` updates. The target remains one SpaceTimeDB deployment holding many gateway, agent, and client instances for the same installation/workspace.
- The 2026-05-30 shared-cosmos contract adds the first native SpaceTimeDB world-plane tables and reducers to the S3/S3' law: `world_clock`, RLS-filtered `pratibimba_presence`, opt-in `shared_archetype_event`, and participant-filtered `coincidence`; reducers `advance_world_clock` at 1 Hz, `bind_pratibimba_presence`, and `detect_coincidences` at 1/min; quaternionic identity signatures where `quintessence_hash = BLAKE3(canonical_bytes(q_Nara) || caps)` is an indexing fingerprint over canonical quaternionic bytes, not the ontological identity itself.
- `Body/S/S3/epi-spacetime-module` now carries the gateway-client registration module shape: gateway instances, PI-agent instances, TUI/desktop/browser clients, session temporal surfaces, global temporal surfaces, Kairos surfaces, and temporal activity events keyed by installation/workspace and instance identity.
- `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` currently wraps the `graphiti-core` library in a FastAPI service on port `37778`. This proves Graphiti can be used as a Python library; the HTTP sidecar is only the current integration wrapper for Rust gateway/Nara callers and is now demoted behind `Body/S/S3/graphiti-runtime`.
- There are now dedicated `Body/S/S3/redis-context`, `Body/S/S3/gateway`, and `Body/S/S3/graphiti-runtime` modules for Redis runtime residency, gateway protocol/session/runtime residency, and Graphiti runtime adapter law. The live gateway dispatch/server body is still S0-hosted, but it consults S3 route ownership and passes Graphiti envelope/provenance/deposit/search law through the S3 crate rather than owning it locally. `Body/S/S3` currently also holds `epi-app` and `epi-spacetime-module`; the next S3 extraction step is the live dispatch/server adapter.

### Planning consequence

The S3 shard/build pass must reconcile three surfaces:

- Product/RPC parity manifest required by [[OmniPanel]] and Epi-Claw-shaped clients.
- Coordinate-native `s3.*` / `s3'.*` API contracts required by the FLOW architecture.
- Actual process/state implementation: Rust gateway, SessionStore, Redis temporal context, SpacetimeDB live-state plane, and Graphiti-as-library integration currently hidden behind an HTTP wrapper.

The immediate S3' context contract is now:

| Surface | Role |
|---|---|
| `s3'.temporal.context` | Gateway RPC method for [[Anima]], [[Epii]], and other S4/S5 agents to orient to the current DAY/NOW/session/history/Redis/Graphiti temporal ground |
| `epi gate temporal context` | S0 CLI mirror over the same report for operator use and testing |
| `s3:gateway:temporal:session:{session_id}:now:md` | Redis hot key for session NOW markdown |
| `s3:gateway:temporal:day:{day_id}:context` | Redis hot key for day-level temporal context |
| `s3:gateway:temporal:day:{day_id}:kairos` | Redis hot key for safe DAY-level public-current-transit [[Kairos]] projection |
| `s3:gateway:temporal:session:{session_id}:kairos` | Redis hot key for session-bound Kairos orientation |
| `s3:gateway:temporal:agent:{agent_id}:session:{session_id}:orientation` | Redis hot key for agent-specific temporal orientation |
| `s3:gateway:temporal:personal:{anchor_id}:orientation` | Redis hot key for protected-reference-only [[PersonalNexus]] orientation |
| `gateway_instance` / `agent_instance` SpaceTimeDB tables | Live registration plane for many gateway and PI-agent processes in one SpaceTimeDB deployment |
| `client_registration` SpaceTimeDB table | Live registration plane for TUI, desktop, browser, external, and agent clients, with scope/capability ownership explicit |
| `session_surface` / `kairos_surface` / `global_temporal_surface` / `temporal_event` SpaceTimeDB tables | Live-state projection carrying canonical session, DAY/NOW, history, Redis, Graphiti orientation, safe Kairos transit facts, safe kernel tick/pulse/energy, protected Pratibimba refs, shared portal/agent temporal orientation, and activity facts |

The registration invariant is: **one SpaceTimeDB can hold any number of gateway and agent instances**. Isolation belongs in installation/workspace identity, gateway instance id, agent instance id, client id, and session key. It does not belong in multiplying databases per process.

Target reducer surface:

| Reducer | Role |
|---|---|
| `register_gateway` | Insert or update a gateway process with endpoint, protocol version, workspace root hash, service ports, and started/last-seen timestamps |
| `heartbeat_gateway` | Keep gateway process liveness current without mutating session facts |
| `register_agent` | Insert or update an Anima/Epii/subagent process with bounded capability surface, plugin/skill hash, owning gateway, and active session where applicable |
| `register_client` | Insert or update TUI, desktop, browser, external, or agent clients with requested scopes and access status |
| `bind_session_temporal_context` | Project the same DAY/NOW/history/Redis/Graphiti/kernel temporal facts exposed by `s3'.temporal.context` |
| `bind_kairos_surface` | Project safe public-current-transit Kairos facts for DAY/session subscriptions without raw personal identity or journal data |
| `bind_global_temporal_surface` | Project the safe shared DAY/NOW/Kairos/kernel/Redis/Graphiti/Pratibimba-anchor surface consumed by TUI, desktop, gateway, and PI-agent clients |
| `publish_temporal_event` | Append live activity/event facts for subscribers without treating SpaceTimeDB as the historical graph |

Privacy invariant: [[Kairos]] transit data can be projected through SpaceTimeDB because it is public-current-time context, and kernel tick/pulse/energy can be projected when computed from the shared kernel clock as `safe-public-current-kernel-tick` without publishing protected bioquaternion or resonance-vector detail. [[PASU]], raw birth data, journal text, personal chart detail, profile hash previews, layer masks, and [[PersonalNexus]] graph contents must remain local/protected. SpaceTimeDB may carry only stable protected references such as a Pratibimba anchor id, Graphiti namespace ref, and count-only/projection-only layer-presence summary.

## A. S3 - Gateway Control Plane Base Technology

### What It Is

S3 is the objective gateway transport/control technology. It is the place where commands enter, are authenticated or accepted, routed, persisted, emitted, and returned to clients.

Current canonical S3 base technology:

- Rust gateway server under `Body/S/S0/epi-cli/src/gate/` until extracted to a Body-native S3 gateway module.
- WebSocket protocol v3, `hello-ok` frame, method/event advertisement.
- Gateway runtime state and event fanout.
- SessionStore and transcript state.
- Channel, chat, agent, config, cron, logs, skills, models, nodes, devices, browser, approvals, update, and wizard RPC surfaces.
- OmniPanel/Epi-Claw parity contract.

### Services, Binaries, Processes

| Component | Coordinate | Language | Runtime / Port | Role |
|---|---:|---|---|---|
| `epi gate start` | [[S3.0]] | Rust | WebSocket, default `18794` | Gateway control-plane server |
| Gateway method manifest | [[S3.1]] / [[S3.1']] | Rust | `gate/parity.rs` | Product/RPC compatibility surface |
| SessionStore | [[S3.2]] / [[S3.2']] | `Body/S/S3/gateway` Rust/files, S0 Pi adapter | `.epi/gate/sessions` | Session identity and patch authority with Pi/Khora context injected at creation |
| GatewayRuntimeState | [[S3.3]] | Rust memory | Process-local | Run registry, event listeners, chat process tracking |
| OmniPanel / app bridge | [[S3.5]] | Current Electron/React app side; future Tauri v2 shell | Client process | Human-facing gateway client and eventual desktop mirror of the TUI portal |
| Graphiti runtime | [[S3.4']] / [[S3.5']] | Rust adapter over current Python library wrapper, target native library runtime | Current compatibility wrapper port `37778` | Temporal episodic architecture; `Body/S/S3/graphiti-runtime` owns envelope/provenance/deposit/search law, including kernel resonance deposition |

### Desktop App / Tauri V2 Direction

Current checkup: `Body/S/S3/epi-app` is an Electron + Vite + React app. It already contains a gateway WebSocket client, Epi-Claw-compatible RPC client, shared capability/envelope types, and M0-M5 renderer domains. It currently also has Electron main-process filesystem and Neo4j access. The Tauri v2 migration should be specified before porting code.

Target shape:

| Layer | Current state | Tauri v2 target |
|---|---|---|
| Renderer | React M-domain shell, M0-M5 domain components, OmniPanel, command palette | Preserve useful renderer/domain components, but reshape primary layout to mirror the TUI `0` / `/` / `1` topology |
| Main process | Electron IPC, direct filesystem helpers, direct Neo4j driver, gateway WebSocket client | Rust Tauri command layer that prefers gateway RPC and SpaceTimeDB subscriptions; direct filesystem access only through explicit S1/Hen/vault commands |
| Live state | Gateway WebSocket plus local stores | Gateway RPC for commands and SpaceTimeDB registration/projection for gateway/agent/client/session liveness |
| Settings | App-local config and UI panels | Same S0' portal surface registry/config ownership used by the TUI; no parallel desktop-only settings ontology |
| Desktop role | M-domain exploration shell | External M-form mirror of the TUI portal: left `0` structural clock, centre `/` command/config/readiness, right `1` Nara/Epii/review/autoresearch |

The app port must not make Electron-to-Tauri a mechanical shell swap. The port is an architectural promotion: desktop state should be driven by the same gateway parity, SpaceTimeDB registration, and portal surface registry contracts used by `epi portal`.

### API Methods Homed Here

#### `connect`

Initial gateway handshake after socket open.

Request type: `ConnectRequest`

```typescript
interface ConnectRequest {
  agent_id: AgentId;
  agent_version: string;
  capabilities: string[];
  subscriptions: string[];
  auth: { nonce: string; token: string };
}
```

Response type: `ConnectResponse`

```typescript
interface ConnectResponse {
  session_key: string;
  session_id: string;
  day_id: string;
  group_id: string;
  now_id: string | null;
  now_path: string | null;
  workspace_root: string;
  temporal_state: TemporalState;
  protocol_version: 3;
  peer_agents: AgentSummary[];
}
```

Build implications:

- Must include NOW identity and path; the API audit marks these hot fields as critical.
- Must populate `s_3_session_key`, `s_3_session_id`, `s_3_day_id`, `s_3_agent_id`, and workspace root.
- Product-level `connect` remains compatible with protocol v3 while coordinate-native fields are added.

#### `agent.capabilities`

Lists connected/known agent capabilities.

Request type: `AgentCapabilitiesRequest`

```typescript
interface AgentCapabilitiesRequest {
  agent_id?: AgentId;
}
```

Response type: `AgentCapabilitiesResponse`

```typescript
interface AgentCapabilitiesResponse {
  agents: AgentSummary[];
}
```

#### `s3.session.list` / `s3.session.get` / `s3.session.patch`

Coordinate-native session management.

Request/response types:

```typescript
interface S3SessionListRequest {
  agent_id?: AgentId;
  day_id?: string;
  group_id?: string;
}

interface S3SessionGetRequest {
  session_key: string;
}

interface S3SessionPatchRequest {
  session_key: string;
  patch: SessionPatch;
}
```

Build implications:

- Live gateway currently exposes product names `sessions.list`, `sessions.resolve`, `sessions.patch`, `sessions.reset`, `sessions.delete`, and `sessions.compact`.
- S3 spec must preserve parity while adding/aliasing coordinate-native names.
- Session identity includes canonical key, aliases, day id, NOW path, active agent, subagent lineage, workspace root, bootstrap scope, team/cmux metadata, and model/provider overrides.

#### `s3.channel.register` / `s3.channel.list` / `s3.channel.send`

Channel registry and delivery.

Request/response types:

```typescript
interface S3ChannelRegisterRequest {
  name: string;
  handler_agent: AgentId;
  config?: ChannelConfig;
}

interface S3ChannelSendRequest {
  channel: string;
  message: string;
  thread?: string;
  metadata?: Record<string, unknown>;
}
```

Build implications:

- Existing `channels.status` / `channels.logout` are not enough for the target channel registry.
- Telegram, WhatsApp, Slack, and web channels need real registration/delivery surfaces or explicit unsupported status.

#### `s3.message.route`

Async inter-agent or inter-surface message routing.

Request type: `S3MessageRouteRequest`

```typescript
interface S3MessageRouteRequest {
  target_agent: AgentId;
  method: string;
  params: Record<string, unknown>;
  callback_channel?: string;
}
```

Response type: `AsyncAck`

```typescript
interface AsyncAck {
  ack_id: string;
  status: "routed" | "queued" | "rejected";
}
```

Build implications:

- The result returns through event channel `agent.result.{ack_id}`.
- Routing authority belongs here; agent reasoning belongs to [[S4]] / [[S4']].

### Envelope Fields Populated

S3 populates Transport and part of Runtime:

| Envelope field | Coordinate home | Producer | Notes |
|---|---:|---|---|
| `s_3_session_key` | [[S3.0]] | Gateway connect/session store | Canonical wire/session key |
| `s_3_session_id` | [[S3.0]] | Gateway + session bootstrap | Stable session id |
| `s_3_request_id` | [[S3.1]] | Gateway request frame | Request/response correlation |
| `s_3_requester` | [[S3.1]] | Gateway/auth/channel | Who sent the request |
| `s_3_channel` | [[S3.1]] | Gateway channel layer | terminal/app/Telegram/etc. |
| `s_3_thread_scope` | [[S3.1]] | Gateway channel/thread | Delivery thread context |
| `s_3_target_agent` | [[S3.3]] | Gateway routing | Agent target for command/message |
| `s_3_history_limit` | [[S3.2]] | Gateway session/history | Audit marks API coverage gap |
| `s_3_patch_lineage` | [[S3.2]] | Gateway session patch/reset | Session mutation ancestry |
| `s_3_protocol_version` | [[S3.0']] | Protocol v3 hello-ok | Handshake contract |
| `s_3_session_store_handle` | [[S3.2']] | SessionStore | Runtime/session handle |
| `s_3_agent_id` | [[S3']] | connect agent_id | Added by API audit as field 116 |
| `s_3_app_surface` | [[S3.5]] | App bridge | OmniPanel / app surface |

### CLI Commands

S3/S3' is currently surfaced through `epi gate`.

| Live command | Primary coordinate home | Notes |
|---|---:|---|
| `epi gate status` | [[S3.0]] | Gateway health/status |
| `epi gate start --port` | [[S3.0]] | Starts WebSocket gateway |
| `epi gate stop` | [[S3.0]] | Stops gateway |
| `epi gate methods` | [[S3.1']] | Product/RPC method manifest |
| `epi gate config` | [[S3.2]] | Config get/schema/set/patch/apply/TUI |
| `epi gate cron` | [[S3.4']] / [[Chronos]] | Persistent cron jobs; API parity name gap around toggle/update |
| `epi gate inspect` | [[S3.5]] | Runtime inspection |
| `epi gate graphiti` | Compatibility control for [[S3']] Graphiti runtime | Starts/stops/status-checks the temporary HTTP wrapper through the S3 runtime adapter while native Graphiti library integration remains target |
| `epi gate subscribe` / `pair` / `bootstrap` / `workspace` | Intended [[S3]] surfaces | Currently not implemented in CLI dispatch |

### Current Implementation State

Current Rust files include:

- `gate/mod.rs` - command tree and dispatch.
- `gate/server.rs`, `protocol.rs`, `parity.rs`, `runtime.rs`, `events.rs` - gateway server/protocol/method/event/runtime surfaces.
- `Body/S/S3/gateway/src/{session_store,transcripts,workspace,bootstrap,subagents}.rs` - durable session identity, lineage, transcript pathing, bootstrap/workspace scope, and subagent validation.
- `gate/session_store.rs`, `sessions.rs`, `team_store.rs` - S0 runtime/CLI adapter over the S3 session authority plus team-specific state not yet extracted.
- `gate/chat.rs`, `runs.rs`, `channels.rs`, `cron.rs`, `config.rs`, `logs.rs`, `models.rs`, `skills.rs`, `nodes.rs`, `devices.rs`, `browser.rs`, `approvals.rs`, `system.rs`, `wizard.rs`, `update.rs` - product/RPC domains.
- `gate/spacetimedb_bridge.rs` - bridge/test event projection and stub SpacetimeDB client.
- `gate/graphiti.rs` - current HTTP-wrapper lifecycle and provenance forwarding for Graphiti; useful evidence, but not target architecture.
- `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` - current FastAPI wrapper around the `graphiti-core` library; should be treated as adapter scaffolding, not the architectural boundary.

Current test evidence:

- `gate_method_parity.rs`, `gate_full_parity_contract.rs`, `gate_parity_manifest.rs` cover real method surface/parity expectations.
- `gate_connect_protocol.rs`, `gate_protocol.rs`, `gate_auth.rs` cover protocol/handshake/auth behavior.
- `gate_sessions.rs`, `gate_session_store_contract.rs`, `gate_lineage_contract.rs`, `session_lifecycle.rs` cover session identity and mutation.
- `gate_chat_*`, `gate_agent_*`, `gate_subagent_spawn.rs`, `gate_team_runtime_contract.rs` cover chat/agent runtime behavior.
- `gate_spacetimedb_bridge.rs` proves gateway mutations emit bridge events into a file-backed SpacetimeDB test queue.
- `gate_channels_cron_voice.rs`, `gate_nodes_devices_browser.rs`, `gate_config_system.rs`, `gate_config_tui.rs`, `gate_lock_tls.rs` cover specific gateway domains.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S3.0]] Gateway primitive ground | WebSocket server, port, raw connection, hello frame, status/health |
| [[S3.1]] Gateway message form | Request/response frames, method names, channel types, event envelopes |
| [[S3.2]] Gateway session operations | SessionStore, list/get/patch/reset/delete/compact, history and transcript windows |
| [[S3.3]] Gateway routing patterns | Agent/channel routing, run registry, event fanout, callback channels |
| [[S3.4]] Gateway presence/context | Runtime presence, cron/kairos-adjacent scheduling, action consequences |
| [[S3.5]] Gateway integration surface | OmniPanel/app bridge, nodes/devices/browser/approvals/logs/update/wizard, cross-system broadcast |

## B. S3' - Temporal State Law

### What It Is

S3' is [[Chronos]] as shared temporal runtime. It turns gateway consequences into lawful time/state: Day opens and closes, NOW identity is surfaced, kairos is fetched and cached, context keys are temporally grounded, presence is projected, and session/arc events become subscribable.

S3' is not simply "state storage." It is temporal contextual grounding. A context value is S3' when its validity depends on Day, NOW, session, kairos, active arc, presence, subscription, or short-lived continuity.

### Ta-onta Module

S3' module: [[Chronos]].

Responsibilities:

- Day/NOW temporal state.
- Kairos and decan state.
- Redis-backed live context keys.
- Graphiti temporal episodic runtime architecture.
- SpacetimeDB shared-state projection.
- Presence and subscription state.
- Session close and arc lifecycle timing.
- Gateway event channels for temporal changes.

### API Methods Homed Here

#### `s3'.temporal.state` / `subscribe` / `unsubscribe`

Reads and subscribes to temporal runtime state.

Response/request types:

```typescript
type S3PrimeTemporalStateResponse = TemporalState;

interface S3PrimeTemporalSubscribeRequest {
  events: string[];
}

interface S3PrimeTemporalSubscribeResponse {
  subscription_id: string;
  active_subscriptions: string[];
}
```

Build implications:

- Must return `now_id`, `now_path`, `archive_status`, and `continuation_status`.
- Event channels include `temporal.day.*`, `temporal.kairos.*`, `temporal.arc.*`, `temporal.session.*`, and `temporal.presence.update`.

#### `s3'.day.open` / `close` / `status`

Day lifecycle.

Request/response types:

```typescript
interface S3PrimeDayOpenRequest {
  day_id: string;
  seed_content?: string;
  kairos_snapshot?: KairosSnapshot;
}

interface S3PrimeDayCloseRequest {
  day_id: string;
  crystallisation?: string;
  force?: boolean;
}

interface S3PrimeDayStatusResponse {
  day_id: string;
  open: boolean;
  session_count: number;
  agents_active: AgentId[];
  arcs: ArcSummary[];
}
```

Build implications:

- Material Day files are anchored in [[S1]], but temporal open/close truth is S3'.
- `s_5_session_close` should be re-homed to S3' because session close is temporal.

#### `s3'.kairos.fetch` / `status` / `natal`

Kairos temporal state.

Request/response types:

```typescript
interface S3PrimeKairosFetchResponse {
  planet_degrees: number[];
  sun_decan: DecanInfo;
  moon_decan: DecanInfo;
  sun_degree: number;
  moon_degree: number;
  mode: "natal" | "realtime" | "kairotic";
  timestamp: number;
}

interface S3PrimeKairosNatalRequest {
  birth_date: string;
  birth_location: string;
}
```

Build implications:

- [[Kerykeion]]/pyswisseph supplies the calculation path.
- Kairos cache keys belong to S3' temporal context, even if stored in Redis.

#### `s3'.presence.state` / `update`

Presence state for the shared field.

Request/response types:

```typescript
interface S3PrimePresenceStateResponse {
  agents: PresenceEntry[];
}

interface S3PrimePresenceUpdateRequest {
  torus_position: number;
  hexagram: number;
  hash?: string;
}
```

Build implications:

- SpacetimeDB is the target shared-state host.
- Current Rust client is a stub; file-backed bridge events are test evidence, not final live reducer integration.
- `world_clock` is the canonical shared pulse table for graph/clock surfaces. Existing `m1_clock_state` or global temporal rows should be compatibility projections over that pulse unless a later spec deliberately separates them.
- Native WebSocket subscription parity is the first shared-cosmos milestone; HTTP SQL polling remains fallback, not the target live UX.

#### `s3'.context.get` / `set` / `shared.get` / `shared.set` / `pool`

Redis-backed temporal context.

Request/response types:

```typescript
interface S3PrimeContextGetRequest {
  key: string;
}

interface S3PrimeContextSetRequest {
  key: string;
  value: unknown;
  ttl_seconds?: number;
}

interface S3PrimeContextPoolRequest {
  keys: string[];
  include_shared?: boolean;
}
```

Build implications:

- Agent-scoped keys auto-prefix with `{agent_id}:{session_id}`.
- Shared keys auto-prefix with `{day_id}:shared`.
- This is the batch assembly surface for [[Psyche]] session context packs.
- `s_4_run_local_continuity` should use this surface.

### Envelope Fields Populated

S3' populates Temporal and Context-Economy runtime fields:

| Envelope field | Coordinate home | S3' role |
|---|---:|---|
| `s_3_day_id` | [[S3.4']] | Day identity |
| `s_4_now_id` | [[S4.1']] with S3' surfacing | NOW identity in connect/temporal state |
| `s_4_now_path` | [[S1]] + [[S3']] surfacing | Material NOW path |
| `s_3_session_start` | [[S3.4']] | Session start time |
| `s_3_kairos_tick` | [[S3.4']] | Kairos/planet/decan tick |
| `s_3_context_key` | [[S3']] | Renamed from `s_2_redis_context_key` |
| `s_3_episodic_handles` | [[S3']] | Renamed from `s_2_episodic_handles`; temporal handles for Graphiti episodic arcs |
| `s_5_session_close` | Re-home to [[S3']] | Session close is temporal |
| `s_5_arc_membership` | Re-home to [[S3']] | Arc membership is temporal |
| `s_5_graphiti_node_ids` | Re-home to [[S3']] as `s_3_graphiti_node_ids` for handle surfacing | Graphiti node ids are temporal artifacts; invocation/use semantics remain S5/S5' |

### S3'Cx Projection

The corrected C-family projection:

| C coordinate | S3'Cx meaning | Runtime manifestation |
|---|---|---|
| C0 | Gateway contract ground | protocol v3, hello-ok, session invariants |
| C1 | Message form | method manifest, request/response schema, channel form |
| C2 | Operation | session mutations, cron/config/chat/node/device operations |
| C3 | Process/pattern | routing patterns, subscriptions, broadcast, SpacetimeDB reducers |
| C4 | Context/type | Day/NOW/Kairos/presence/Redis temporal context |
| C5 | Pratibimba/return | history, close, arcs, activity events, shared-state projection |

Decision: S3'Cx no longer means generic plugin folders. It means the temporal/shared-state projection of gateway consequences.

### Current Implementation State

S3' is partially embodied in:

- `spacetimedb_bridge.rs` bridge events for presence, session surface, activity, and M-clock placeholders.
- `system.rs` heartbeats and presence-like state.
- `cron.rs` scheduling state.
- `session_store.rs` day/NOW/session metadata capture.
- Gateway events and runtime subscriptions.
- `graphiti_service.py` currently as an HTTP wrapper around a library that should be S3-integrated directly.

S3' is not yet complete:

- Full SpacetimeDB reducer calls are stubbed/logged.
- `s3'.context.*` is not yet a full Redis API family, but `s3'.temporal.context` now gives the first coordinate-native gateway method for reading and optionally hydrating the S3' temporal Redis context.
- `s3'.temporal.state` target fields exist in TS but are only partially represented by the live `s3'.temporal.context` report.
- `s3'.day.*` and `s3'.kairos.*` are designed, with related CLI/vault/nara surfaces elsewhere, but not cleanly unified under S3' gateway methods.
- Graphiti is unnecessarily isolated behind the current FastAPI sidecar; target work should make it an S3 runtime/library component and leave S5/S5' to decide when and how to use it.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S3.0']] Gateway contract ground | Protocol v3, hello-ok, session invariants, connect response law |
| [[S3.1']] Gateway form law | Method contracts, parity manifest, channel schemas, stable API names |
| [[S3.2']] Gateway operation contract | SessionStore source of truth, Redis-backed temporal metadata target, config/cron mutations |
| [[S3.3']] Shared state patterns | Subscriptions, event bus, SpacetimeDB projection, multi-session coordination |
| [[S3.4']] Temporal surfacing | Day/NOW/Kairos/decan/presence/context key law, Graphiti episode timing |
| [[S3.5']] Gateway return law | Session close, Graphiti arc tracking handles, history, activity events, runtime yield |

## C. Cross-References

### Depends On

- [[S0]] / [[S0']] for `epi gate`, process execution, ports, and local command lifecycle.
- [[S1]] / [[S1']] for Day/NOW material paths and vault-backed session artifacts.
- [[S2]] / [[S2']] for graph/cache health and context source pools.
- [[Khora]] for bootstrap/session identity sequence.
- [[Hen]] for vault/material anchoring of temporal facts.

### Consumed By

- [[S4]] / [[S4']] consumes S3 transport/session state for [[Anima]], [[Psyche]], and agent execution.
- [[S5]] / [[S5']] consumes S3' Graphiti/temporal grounding for [[Aletheia]] and [[Epii]] world-return invocation and governance.
- [[Nara]] and [[M']] consume S3' presence, kairos, oracle, and shared-state surfaces.
- [[OmniPanel]] and app clients consume S3 gateway RPC and S3' shared state projections.

### Envelope Layers Served

S3/S3' serves these [[Envelope]] layers:

- Transport Layer
- Temporal Layer
- Runtime Layer, through session store handles
- [[Context Economy]], through S3' Redis context surfaces
- [[Execution Layer]], through routing and message delivery
- [[Episodic Layer]], through Graphiti temporal architecture, handles, and arc timing; usage/governance remains S5/S5'

### Gaps

- Add coordinate-native aliases or methods for `s3.session.*`, `s3.channel.*`, `s3.message.route`, `s3'.temporal.*`, `s3'.day.*`, `s3'.kairos.*`, `s3'.presence.*`, and `s3'.context.*`.
- Preserve product/RPC parity names needed by OmniPanel while exposing coordinate-native method names.
- Implement real `s3'.context.*` Redis temporal-context API with key namespace law.
- Implement full SpacetimeDB reducer integration beyond file-backed test bridge/stub logging.
- Ensure `connect` and `s3'.temporal.state` return NOW identity/path, archive status, continuation status, and `s_3_agent_id`.
- Retire the Graphiti sidecar as canonical architecture: use `graphiti-core` as an S3/S3' runtime/library component; keep any HTTP wrapper only as a temporary compatibility adapter.
- Add or explicitly reject Telegram/web channel registration.
- Resolve cron parity naming (`cron.toggle` versus `cron.update`) by alias or compatibility layer.

## D. Key Architectural Decisions

1. S3 is gateway control plane; S3' is temporal/shared-state law.
2. Old PAI/plugin readings are genealogy. Current target is gateway plus [[Chronos]] temporal runtime.
3. Redis-backed live context belongs to S3' because it is temporally grounded in session, Day, NOW, kairos, and arc continuity.
4. Product/RPC names and coordinate-native names must coexist until parity clients migrate.
5. [[SpacetimeDB]] is the target Universal NOW shared-state host; current bridge code is not full live integration yet.
6. [[Graphiti]] is architecturally S3/S3' temporal episodic memory; S5/S5' owns invocation, usage, search, governance, and reflective meaning.
7. Session identity is a gateway authority, while session inhabitation and reasoning are S4/S4'.

## Canonical Source Lock - 2026-06-02

S3 owns the gateway control plane; S3' owns temporal/shared state, Day/NOW/Kairos projections, SpaceTimeDB subscription law, and Graphiti runtime boundary. Product RPC names may remain live, but coordinate ownership is canonical here and in [[ARCHITECTURE-DIAGRAM-PACK]].

| Required coverage | Canonical citations |
|---|---|
| World ontology | `Idea/Bimba/World/Types/Coordinates/S/S3/S3.md` mtime 2026-04-10 21:43:47; `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.md` mtime 2026-04-10 17:52:42; `Idea/Bimba/World/NOW.md` and `Daily-Note.md` for S3' temporal artifact semantics |
| docs/specs | `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md` mtime 2026-05-31 16:35:19; `Idea/Bimba/Seeds/S/Legacy/specs/S/S-STACK-INTEGRATION.md` mtime 2026-03-07 01:51:35 |
| docs/plans | `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md` mtime 2026-06-01 18:27:27; `10-cross-cutting-integration-and-milestones.md` mtime 2026-06-02 00:17:57; `11-open-architectural-decisions.md` mtime 2026-06-02 00:14:24; `13-s-sprime-modularity-and-s0-membrane-cleanup.md` mtime 2026-06-01 23:57:36 |
| Body substrate | `Body/S/S3/gateway-contract/**`, `Body/S/S3/gateway/**`, `Body/S/S3/redis-context/**`, `Body/S/S3/epi-spacetime-module/**`, `Body/S/S3/graphiti-runtime/**`, `Body/S/S3/epi-app/**`, `Body/S/S0/epi-cli/src/gate/**` |
| sibling seeds | `S3-0-SPEC.md`..`S3-5-SPEC.md`, `S3'/S3'-SPEC.md`, `S3'/S3-0'-SPEC.md`..`S3'/S3-5'-SPEC.md`, `S3-SHARD-INDEX.md`, `S3-TRACEABILITY-INDEX.md`, `S3'/S3'-TRACEABILITY-INDEX.md` |
| nominal tracks | Track 03 owns gateway/SpaceTimeDB; Track 13 owns later S0 membrane extraction; Track 10 owns integration gates |
| open decisions | WebSocket surface, SpaceTimeDB auth/RLS, world-clock cadence, Graphiti runtime boundary, Theia subscription ownership, production fallback |

Supersession rule: older plugin-loader readings of S3' are genealogy. Current canon is gateway plus live shared temporal state.
