# Track 03 - S3/S3' Gateway and SpaceTimeDB Implementation Plan

This track builds the M5-2 live gateway/time/event substrate: S3 remains the imperative gateway and RPC control plane, while S3' becomes the SpaceTimeDB-backed Universal NOW plane that M5-3 Tauri/Theia surfaces and M5-4 agents consume from the first integration phases. This is an implementation track, not a canon rewrite: the work is to finish the live WebSocket, reducer, subscription, Graphiti compatibility, and verification path needed for production readiness.

## Goal

Deliver the first production-grade S3/S3' runtime slice where gateway actions, SpaceTimeDB native WebSocket subscriptions, Graphiti temporal references, and frontend/agent consumers form one observable pipeline:

- Gateway WebSocket clients keep full S3 RPC parity for commands, sessions, auth, events, and operational control.
- Gateway-owned state changes call real SpaceTimeDB reducers and publish safe S3' projection rows.
- Native SpaceTimeDB subscriptions replace HTTP polling for live shared state in the target path.
- `/body` Tauri and the future Theia kernel-bridge consume live `session_surface`, `kairos_surface`, `global_temporal_surface`, and `world_clock` deltas early, without fixture-only state.
- M5-4 agents operate through durable session state, temporal subscriptions, Graphiti runtime handles, and explicit RPC bridges rather than hidden local process assumptions.
- The first alpha milestone is proven: a Tauri consumer receives a `KairosSurface` update within 100 ms of the gateway calling `bind_kairos_surface`.

## Source Specs

- [[alpha_quaternionic_integration_across_M_stack.md]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, Section 11 "Shared cosmos hosting at S3' via SpaceTimeDB", especially Section 11.1 existing repo decision, Section 11.3 WebSocket-shared gateway and SpaceTimeDB surface, Section 11.5 shared-cosmos tables, Section 11.7 milestone 1, and Section 11.8 integration gotchas.
- [[S3-SPEC.md]] - `Idea/Bimba/Seeds/S/S3/S3-SPEC.md`, "Current code reality", "Planning consequence", "A. S3 - Gateway Control Plane Base Technology", "B. S3' - Temporal State Law", "Gaps", and "D. Key Architectural Decisions".
- [[S3-S3i-GATEWAY.md]] - `docs/specs/S/S3-S3i-GATEWAY.md`, Section III Two-Plane Model, Section IV parity requirement, Section VII immediate Rust architecture, Section VIII SpaceTimeDB as Universal NOW, Section XII implementation sequence, and Section XIII verification requirements.
- [[m5-prime-system-shape-and-tauri-ide-canon.md]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, Section 1.2 M5-2/M5-3/M5-4 mapping, Section 2.3 one Tauri app with shared gateway/SpaceTimeDB access, Section 5.2 kernel-bridge contribution, and Section 8 milestone 2.
- [[spacetimedb_bridge.rs]] - `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, current REST plus native WebSocket bridge, especially `subscribe_projection` around lines 603-641 and `SpacetimeProjectionSubscription::next_context` around lines 648-668.
- [[lib.rs]] - `Body/S/S3/gateway-contract/src/lib.rs`, `SpacetimeProjectionPlan` and `SubscribeMulti` construction around lines 727-822, subscription row decoding around lines 824-988, and `GraphitiAdapterContract` around lines 1299-1332.
- [[lib.rs]] - `Body/S/S3/epi-spacetime-module/src/lib.rs`, current SpaceTimeDB module tables and reducers for gateway/client/agent registration plus `SessionSurface`, `KairosSurface`, `GlobalTemporalSurface`, and `TemporalEvent`.
- [[lib.rs]] - `Body/S/S3/graphiti-runtime/src/lib.rs`, current S3 Graphiti runtime compatibility adapter, VAK episode attributes, provenance, and protected-memory payload constraints.
- [[spacetime.rs]] - `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs`, current Tauri polling path and `SpacetimeMode::NativeWebSocket` stub.

## Architectural Keystones

- **One client-facing S3 WebSocket, two runtime planes.** Gateway clients should consume one S3 WebSocket surface for imperative RPC and declarative SpaceTimeDB deltas. The gateway may hold an internal upstream native WebSocket to SpaceTimeDB, but `/body`, Theia, and agents must not reconcile unrelated app-level transports.
- **Reducer-first Universal NOW.** Gateway actions commit state through SpaceTimeDB reducers first; subscribers render committed rows. File-backed bridge events and HTTP SQL polling remain compatibility aids, not completion evidence.
- **Contract-owned projection law.** `Body/S/S3/gateway-contract` owns subscription plans, table names, delta envelope schemas, row decoders, privacy labels, and compatibility modes so S0, S3 crates, Tauri, and Theia do not drift.
- **Durable identity and isolation.** One SpaceTimeDB deployment may host many gateway, agent, and client instances. Isolation belongs to installation id, workspace hash, gateway id, client id, agent instance id, session key, and sender identity, not per-process databases.
- **Safe temporal projection only.** SpaceTimeDB may carry public current transit data, safe kernel tick/pulse/energy, quaternionic canonical bytes or hashes where explicitly allowed, and opaque references. It must not carry raw birth data, journal bodies, protected profile details, Graphiti episode bodies, or Personal Pratibimba contents.
- **Graphiti as S3/S3' runtime compatibility, not state-plane replacement.** Graphiti runtime remains S3/S3' temporal episodic infrastructure with S5/S5' invocation governance. SpaceTimeDB carries Graphiti namespace and arc references, not Graphiti memory bodies.
- **Frontend consumption is a backend acceptance gate.** The native subscription milestone is not complete until `/body` Tauri consumes a live row update. The Theia kernel-bridge contract must be stable enough for M5-3 work before shared-cosmos expansion begins.
- **Mock-free completion.** Unit and decoder tests are useful, but every tranche must end with a real gateway, real WebSocket, real local SpaceTimeDB module, and real subscriber verification path.

## Tranches

**Tranche 1 - Projection contract freeze and readiness surface.**

Deliverables:

- Extend `Body/S/S3/gateway-contract` projection contracts to cover both current projection rows and alpha Section 11.5 shared-cosmos rows: `world_clock`, `pratibimba_presence`, `shared_archetype_event`, and `coincidence`.
- Define the client-facing gateway event envelopes for SpaceTimeDB subscription lifecycle: requested, applied, delta, resync, error, closed, and fallback-active.
- Add or finalize the gateway method contract for live subscriptions, either `s3'.temporal.subscribe` with SpaceTimeDB scopes or a narrower `s3'.spacetime.subscribe` alias that delegates to the same handler.
- Make readiness explicitly report gateway WebSocket health, SpaceTimeDB reducer registration health, native subscription readiness, active fallback mode, Graphiti runtime compatibility mode, and projection schema version.
- Add schema-version fields to contract output so Tauri/Theia can gate UI on `clock_protocol_version` and projection compatibility.

Verification:

- Run `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml`.
- Run the existing `gate_spacetimedb_bridge` projection-plan tests, then add contract tests proving the new shared-cosmos table list and envelopes are produced from real contract code, not copied JSON.
- Contract tests alone do not close the tranche; close only after readiness can be queried from a running `epi gate` process with SpaceTimeDB env configured.

**Tranche 2 - Gateway WebSocket multiplexer and RPC parity guard.**

Deliverables:

- Complete the client-facing S3 WebSocket path so one connection can carry ordinary gateway `req`/`res`/`event` frames plus SpaceTimeDB subscription lifecycle and delta events.
- Preserve `connect`-first protocol v3 behavior, event sequence numbers, heartbeat behavior, reconnect/gap detection, and OmniPanel-compatible method names.
- Add a gateway-side subscription registry keyed by connection id, session key, agent id, subscription scope, and SpaceTimeDB query id.
- Ensure subscription events are bounded by gateway auth/session identity before any upstream SpaceTimeDB subscription is opened.
- Keep HTTP SQL polling as an explicit fallback mode with warning/readiness visibility; do not silently fall back in native mode.
- Emit stream metadata needed by M5-4 agents: session key, day id, NOW path, agent id, Graphiti namespace ref, Graphiti arc id, projection source, and privacy class.

Verification:

- Start a real gateway on the S3 test port and connect with a real WebSocket client; verify `hello-ok`, `connect`, a normal RPC, and a SpaceTimeDB subscribe request all travel over the same client-facing socket.
- Run gateway protocol/session parity tests, including `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_connect_protocol`, `--test gate_protocol`, and `--test gate_spacetimedb_bridge`.
- Add an integration test that launches the gateway process, not an in-test fake server, then proves an authenticated subscription request produces gateway subscription lifecycle events.

**Tranche 3 - Native SpaceTimeDB WebSocket subscription completion.**

Deliverables:

- Finish `SpacetimeRegistration::subscribe_projection` and `SpacetimeProjectionSubscription` so they decode `InitialSubscription`, `SubscribeMultiApplied`, `TransactionUpdate`, `TransactionUpdateLight`, inserts, deletes, and resync states.
- Expose a typed delta stream, not only `next_context`, so gateway, Tauri, and Theia can distinguish session, Kairos, global temporal, world clock, presence, and coincidence updates.
- Wire reducer calls for `register_gateway`, `register_agent`, `register_client`, `bind_session_temporal_context`, `bind_kairos_surface`, and `bind_global_temporal_surface` into the gateway publish path with idempotent retry and observable failure.
- Replace `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` native mode stub in the consuming implementation track with a real native subscription consumer that updates runtime state and emits Tauri events.
- Preserve the S0 bridge while making the S3 crate contract the source of subscription shapes.

Verification:

- From `Body/S/S3/epi-spacetime-module`, build and publish the module to a local `spacetime start` instance.
- Run a live integration test that starts local SpaceTimeDB, starts the gateway, opens a Tauri or Tauri-compatible native subscriber, calls `bind_kairos_surface`, and asserts the subscriber receives the `KairosSurface` delta within 100 ms.
- The current synthetic WebSocket test in `gate_spacetimedb_bridge.rs` remains useful as a decoder regression test, but it must not be counted as milestone completion.

**Tranche 4 - Shared-cosmos tables and scheduled reducers.**

Deliverables:

- Extend `Body/S/S3/epi-spacetime-module/src/lib.rs` with `world_clock`, `world_clock_tick`, `pratibimba_presence`, `shared_archetype_event`, `coincidence`, and `coincidence_tick`.
- Implement reducers for `advance_world_clock`, `bind_pratibimba_presence`, `publish_shared_archetype_event`, and `detect_coincidences`.
- Encode quaternionic identity rules from alpha Section 11.4: `quintessence_hash` is a BLAKE3 indexing fingerprint over canonical quaternionic bytes and caps, not the identity object itself.
- Store only protected references or canonical public/projection bytes. Journal text, dream bodies, raw birth data, profile hash previews, layer masks, Graphiti bodies, and PersonalNexus graph contents remain outside SpaceTimeDB.
- Add module protocol versioning: `clock_protocol_version`, `kerykeion_version`, projection schema version, and reducer ABI version.
- Decide and implement the deterministic clock input path: either scheduled reducer over a gateway-fed authoritative clock-source table, or gateway-triggered reducer cadence if SpaceTimeDB WASM cannot host the required Kerykeion calculation directly.

Verification:

- `spacetime build` passes from `Body/S/S3/epi-spacetime-module`.
- A live local SpaceTimeDB test runs `advance_world_clock` at 1 Hz and verifies 10 simultaneous subscribers see the same `world_clock` tick within +/-30 ms.
- A live 50-user harness publishes opt-in archetype events and verifies a `coincidence` row appears only for qualifying same-or-neighboring transit grid cells.
- Visibility tests prove participants see only their own `pratibimba_presence` row and only coincidences in which their daily identity hash participates, subject to the final RLS/auth decision.

**Tranche 5 - `/body` and Theia kernel-bridge consumption slice (coordinated with M5-3).**

Deliverables:

- Provide a stable TypeScript-facing stream contract for `/body` and Theia kernel-bridge consumers: connection status, subscription status, latest row cache, delta event, resync event, and protocol mismatch event.
- Make `/body` Tauri native mode consume live gateway/SpaceTimeDB deltas for at least `KairosSurface`, `GlobalTemporalSurface`, and `world_clock`.
- Provide a minimal kernel-bridge API contract for Theia: subscribe world clock, subscribe Pratibimba presence, subscribe shared archetype events, invoke gateway RPC, and observe connection state.
- Ensure M5-3 surfaces do not read SpaceTimeDB directly unless the gateway-shared transport decision explicitly changes; they consume the S3 stream contract.
- Add frontend-safe privacy mappers so protected-reference-only rows cannot accidentally render hidden identity detail.

Verification:

- Run `npm run test --prefix Body/M/epi-tauri` and add tests around the real stream reducer/store behavior.
- Run a live app or headless Tauri-compatible subscriber against local gateway plus SpaceTimeDB and assert visible state changes come from live deltas, not fixture injection.
- Add an end-to-end check proving `/body` can reconnect, resubscribe, and recover the latest `world_clock` and `KairosSurface` state without stale polling.

**Tranche 6 - Graphiti runtime compatibility and temporal reference bridge.**

Deliverables:

- Keep `Body/S/S3/graphiti-runtime` as the compatibility boundary for Graphiti deposit/search/provenance while native-library runtime shape remains unresolved.
- Ensure gateway session and global temporal SpaceTimeDB rows carry only `graphiti_namespace_ref` and `graphiti_session_arc_id`.
- Surface Graphiti runtime status through S3 readiness and subscription metadata so agents know whether episodic operations are available.
- Route S5/S5' Graphiti invocation through gateway RPC with explicit session, day, NOW, namespace, and privacy envelopes.
- Prevent SpaceTimeDB reducers or rows from storing Graphiti episode bodies or private memory contents.

Verification:

- Run `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml` and `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml --test graphiti_runtime_contract`.
- Promote or add a live Graphiti compatibility test lane that starts the real Graphiti runtime, deposits a unique proof token through gateway RPC, searches it back, and verifies SpaceTimeDB projection rows contain only the namespace/arc references.
- Agents must be able to read readiness and decline Graphiti-dependent operations when the runtime is unavailable.

**Tranche 6.5 - S1 vault gateway surface (`s1'.vault.*` + `s1'.semantic.*`) over Hen substrate.** (per IOD-18, IOD-19)

Deliverables:

- Add `s1'.vault.{read_file, write_file, move_file, rename_file, append_block, update_frontmatter, list_dir, watch}` gateway methods. Writes delegate to Hen — Theia and agents must NEVER write directly to the vault filesystem; the gateway is the only sanctioned write path. Reads may be either gateway-mediated (for governed/protected paths) or direct-FS via Theia's provider (for ordinary read; the gateway still owns the read contract definition).
- Add `s1'.semantic.{suggest_links, neighbors_of, search, by_block}` gateway methods wrapping [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] `suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse`. The response carries typed candidates: `ExplicitOutlink`, `SemanticSource`, `SemanticBlock` with cosine scores + evidence + staleness markers.
- The `s1'.vault.write_file` / `move_file` / `rename_file` paths must invoke Hen's wikilink-integrity reconciliation: parse referring documents with [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] `parse_wikilinks`; for renames/moves, atomically update all referring `[[X]]` to `[[Y]]` across the vault; reject writes that would orphan headings or break Bimba-coordinate-anchored crossreferences with explicit error states for Theia to surface.
- Surface staleness on `s1'.semantic.*` responses: if `<vault>/.smart-env/multi/*.ajson` is older than the underlying note's mtime, mark `staleness: stale` and let consumers decide. (Future capability per IOD-18: optional Theia-side re-embedding via transformers.js or Ollama writing to the same `.smart-env/` format.)
- Privacy class enforcement: `protected` paths (e.g., raw Nara journal bodies under `Idea/Pratibimba/Nara/<day>/protected/`) are inaccessible via `s1'.vault.*` unless caller carries a governed protected capability per IOD-17 + UFV-01. Same for `s1'.semantic.*` neighbour responses — protected paths excluded from candidate lists by default.

Verification:

- Live integration test against a real fixture vault: rename a file with 5+ inbound wikilinks; assert all referring `[[X]]` updated to `[[Y]]` atomically; assert no orphaned link remains.
- Move a file across folders; assert path updates propagate; assert block-id-anchored references preserved.
- Direct-Theia-FS-write attempt against `Idea/` (bypassing gateway) must be detectable in a privacy/integrity audit run (e.g., comparing FS-mtime + git-tracked-mtime + Hen's last-write-ledger entries; surfaces unsanctioned write as a finding).
- Semantic test: call `s1'.semantic.suggest_links` for a known vault note; assert the returned candidates include known explicit outlinks plus N nearest semantic neighbours by cosine score; assert staleness flag fires when fixture `.smart-env/` is artificially aged.
- Privacy test: call `s1'.semantic.search` over a query that would match a protected Nara journal; assert protected-path candidates are excluded unless caller carries governed-protected capability.

**Tranche 7 - Multi-client soak, privacy audit, and release gate.**

Deliverables:

- Build a repeatable live harness that starts local SpaceTimeDB, gateway, Redis where required, Graphiti where required, one `/body` subscriber, and multiple lightweight native subscriber clients.
- Exercise gateway RPC, reducer publication, native subscription fanout, reconnect/resync, world clock cadence, coincidence detection, and Graphiti reference propagation under load.
- Add metrics for reducer latency, gateway relay latency, subscriber lag, reconnect time, dropped/resynced events, and fallback activation.
- Document operator runbooks for local development, CI, and first hosted deployment.
- Mark HTTP SQL polling as fallback only and require explicit operator opt-in for production fallback.

Verification:

- 10 simultaneous subscribers hold `world_clock` within +/-30 ms for a sustained 10-minute run.
- Gateway `bind_kairos_surface` to Tauri delta remains under 100 ms p95 on local development hardware.
- A 50-user coincidence harness passes with no private bodies or raw identity material in SpaceTimeDB.
- Reconnect tests kill and restart the gateway and SpaceTimeDB process independently; subscribers recover to the latest committed row without duplicate user-visible actions.
- A privacy audit searches live SpaceTimeDB rows and Graphiti projection payloads for forbidden fields: raw birth data, journal text, dream content, profile hash preview, layer mask, Graphiti episode body, and PersonalNexus body.

## Dependencies

- SpaceTimeDB 2.2.0-compatible CLI/runtime and a local `spacetime start` test instance for live integration and soak lanes.
- `Body/S/S3/epi-spacetime-module` must remain the Rust SpaceTimeDB module authority unless a later decision deliberately splits module crates.
- `Body/S/S3/gateway-contract` changes must land before S0 bridge, gateway crate, Tauri, or Theia consumer changes that depend on new row/event shapes.
- S0-hosted `epi gate` remains the live server adapter during this track; extraction into Body-native S3 crates must not break current parity clients.
- Redis temporal context and Khora/NOW session metadata are required for full `session_surface` and `global_temporal_surface` projections.
- Graphiti live compatibility requires Neo4j/Graphiti runtime availability for the promoted test lane; otherwise readiness must report unavailable and Graphiti-dependent agent actions must decline safely.
- M5-3 `/body` and Theia work depends on a stable stream contract by the end of Tranche 3 and should not wait for all shared-cosmos tables.
- M5-4 agentic mediation depends on durable gateway session state, subscription readiness, and explicit RPC bridges before agents consume SpaceTimeDB rows as operational truth.
- Kerykeion/Nara clock integration must provide deterministic inputs to `world_clock`; the exact reducer input path is an open decision.
- CI needs a real SpaceTimeDB service lane. Mocked WebSocket frames can guard decoders, but cannot be the only merge gate for native subscription work.

## Open Decisions

- **Client-facing single WebSocket implementation.** Confirm whether the gateway must physically multiplex SpaceTimeDB deltas over the existing S3 WebSocket, or whether a single app-level connection manager may open a direct SpaceTimeDB socket internally. The alpha spec argues for one client-facing surface; current code still has separate gateway and SpaceTimeDB connection paths.
- **SpaceTimeDB auth and RLS mapping.** Decide how gateway auth/session identity maps to SpaceTimeDB `Identity` and `:sender` for local development, hosted deployment, Tauri desktop, and future mobile clients. RLS is experimental, so privacy cannot depend on RLS alone.
- **World clock source of truth.** Decide whether `advance_world_clock` is truly scheduled inside SpaceTimeDB from a gateway-fed source cache, or whether the gateway calls a reducer every tick after Kerykeion/Nara computes the authoritative state.
- **Clock cadence.** Alpha names 1 Hz as baseline and 250 ms as possible animation cadence. The implementation should choose the initial production cadence and define when surfaces may request higher-frequency interpolation.
- **Graphiti native runtime boundary.** Current code is an HTTP compatibility adapter around Graphiti. Decide whether "native/library" means embedded Python library supervision, a Rust FFI boundary, or a managed local service with a stricter S3 runtime contract.
- **Schema migration procedure.** Define how SpaceTimeDB module migrations are versioned, tested, rolled back, and gated by Tauri/Theia clients.
- **Table naming compatibility.** Decide whether legacy `m1_clock_state` or `identity_presence` remain as compatibility projections over `world_clock` and `pratibimba_presence`, or are deferred until consumers require them.
- **Subscription ownership for Theia.** Decide whether the Theia kernel-bridge owns its own S3 subscription client or receives a stream from the shared Tauri backend process.
- **Production fallback policy.** Decide whether HTTP SQL polling is ever allowed in production, and if so under what visible degraded-mode constraints.

## Success Criteria

- A running `/body` Tauri or equivalent native subscriber receives a live `KairosSurface` row update within 100 ms of gateway `bind_kairos_surface` against a real local SpaceTimeDB instance.
- Native WebSocket mode uses SpaceTimeDB subscriptions and does not silently fall back to HTTP polling.
- Gateway RPC parity tests continue passing while SpaceTimeDB subscription events share the same client-facing S3 WebSocket surface.
- `world_clock` advances through a real reducer path and 10 subscribers observe the same tick within +/-30 ms.
- `shared_archetype_event` and `coincidence` work through live reducers with a 50-user harness, including participant visibility checks.
- Graphiti deposit/search compatibility remains available through S3/S5 RPC boundaries, while SpaceTimeDB rows carry only Graphiti references.
- `/body` and Theia kernel-bridge consumers have a stable stream contract before broader M5-3 UI work depends on live state.
- M5-4 agents can inspect readiness, subscribe to durable temporal state, route RPCs through gateway, and decline unavailable Graphiti/SpaceTimeDB capacities safely.
- Live tests prove forbidden private material is absent from SpaceTimeDB rows and subscription payloads.
- No tranche is marked complete based only on mocked servers, fixture JSON, or placeholder tests.
