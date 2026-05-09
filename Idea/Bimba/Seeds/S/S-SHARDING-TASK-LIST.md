---
coordinate: "S/S'"
c_4_artifact_role: "task-list"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-CODE-RESIDENCY-AUDIT]]"
  - "[[S-CODE-RESIDENCY-PLAN]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S4-SHARD-INDEX]]"
  - "[[S5-SHARD-INDEX]]"
---

# S/S' Build Execution Task List

## Purpose

This is the execution rail for moving from specification to build. It is intentionally more operational than [[S-AD-HOC-ROADMAP]] and more implementation-facing than [[S-SYSTEM-INDEX]].

The rule for the next runs: do not stop after one small correction. Work phase by phase until a real blocker appears. A blocker is a failing dependency, missing design decision, unsafe migration, or test failure that changes the architecture. Ordinary doc cleanup, obvious path updates, and small compatibility fixes are not blockers.

## Completed Foundation

- [x] Re-home master specs from the top `S/` folder into per-level folders.
- [x] Keep [[S-SYSTEM-INDEX]] at the top as the global harmonisation map.
- [x] Create shard indexes for [[S0]], [[S1]], [[S2]], [[S3]], [[S4]], and [[S5]].
- [x] Create base shard seeds `Sx-0` through `Sx-5` for every S-level.
- [x] Create prime shard seeds `Sx-0'` through `Sx-5'` for every S-level.
- [x] Move active package roots into `Body/`.
- [x] Remove root source shims for `epi-cli`, `epi-lib`, `epi-app`, `bimba-mcp`, `epi-gnostic`, `.pi`, and `plugins`.
- [x] Correct S-level docs for Body-native residency, S2/S3 package-residency gaps, Graphiti wrapper demotion, and S5/Epii/autoresearch spine.
- [x] Harmonise canonical [[Envelope]], [[API]], and [[TypeScript]] docs for S3' Redis/Graphiti ownership, S5' Epii review fields/methods, and field/method counts.
- [x] Add first-pass family-level implementation parity matrix to [[S-SYSTEM-INDEX]].

## Execution Rules

- Right design beats old code shape. Existing code is evidence and reusable material, not authority.
- Prefer moving authority to the correct S-level module over adding new logic inside `Body/S/S0/epi-cli`.
- Preserve S0 command mirrors. `epi graph`, `epi gate`, `epi agent`, `epi nara`, and `epi techne gnosis` remain return surfaces even when authority moves elsewhere.
- Every production-facing task needs real-functionality tests. Mock-only tests can support edge cases, but cannot be the proof.
- Before each new implementation unit, inspect the relevant existing tests first, update stale or misleading tests first, then change code against that clarified proof surface.
- Distinguish raw client/service tests from agent invocation/access tests. A Redis/Neo4j/gateway health check does not prove Anima or Epii can use the system.
- Treat [[Anima]] and [[Epii]] as distinct spine-bearing PI agents. Do not give them identical tool/skill authority.
- Treat [[Pleroma]] as Anima's executive capability membrane: extension primitives, skills, agents, hooks, and bounded tools must be apportioned deliberately.
- Treat the [[epi-logos plugin]] plus [[autoresearch]] as Epii's resource/return body: review, gnosis, Nara, QL/MEF, pedagogy, and improvement must be Epii-governed.
- Treat [[Pleroma]] and the [[epi-logos plugin]] as parallel capability membranes over shared S-layer services, not separate service stacks. [[ta-onta]] / [[Anima]] invokes the shared services for dispatch/execution; [[Epii]] invokes and governs the same services for review, meaning, research, promotion, and return.
- Treat human judgement as human-gated. Automation may create, route, persist, and resolve review states, but it does not pretend to replace validation.
- Keep `Idea/` mostly vault/spec/runtime markdown. Put source code and packages under `Body/`.
- Treat Docker-backed Neo4j/Redis as stateful, useful data unless proven otherwise. Use `docker compose -f docker-compose.epi-s2.yml up -d neo4j redis`; do not use `down -v`, prune, or teardown tests that delete `:Bimba`, `:GraphMeta`, or Redis indexes without explicit approval.

## Testing Layers

Use these labels in every implementation task:

- Raw connectivity / service: proves a real client can reach a real local service, file, process, or package surface.
- Module-level contract: proves a module obeys its API/schema without requiring a full agent run.
- Agent invocation / access: proves the PI agent or ta-onta path can actually call or receive the capability.
- Human-gated review: proves review state and approval/denial transitions, while preserving human judgement.
- Full-stack proof: proves S0 can report the status of the whole S/S' circuit.

## Phase 0. Pre-Run Hygiene

Goal: make each run start from the actual repo state, not stale mental residue.

Do every time before code movement:

- [ ] Run `git status --short` and identify unrelated user changes.
- [ ] Confirm active roots are under `Body/S/...`; do not revive root source shims.
- [ ] Read [[S-SYSTEM-INDEX]] Implementation Parity Matrix.
- [ ] Read the relevant level spec and shard index before touching that level.
- [ ] Search code with `rg` before moving or renaming anything.
- [ ] If editing a Rust symbol, check current call sites before extraction.
- [ ] If changing a tested behavior, identify the existing test file first.
- [ ] Before worktree cleanup, inspect every `.worktrees/*` status and branch ancestry. Remove only non-git stray folders or explicitly retired clean worktrees; harvest or abandon dirty worktrees deliberately after checkpointing main.

Output:

- A short working note in chat naming the phase being executed, the files/modules in scope, and the tests that will prove it.

## Phase 1. Executable Parity Manifest

Status: first implementation pass complete. `Body/S/S0/epi-cli/src/gate/parity.rs` now carries coordinate parity records and product-to-coordinate mappings; tests guard unmapped product methods and explicit S5' missing targets.

Goal: turn the parity matrix from guidance into an executable contract.

Why first: until method families, gateway methods, command mirrors, Body paths, and tests are machine-checkable, every extraction risks drifting away from the coordinate system.

Files/code areas:

- Read: `Idea/Empty/Present/FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md`
- Read: `Idea/Empty/Present/FLOW-2026-04-24-PI-AGENT-API-v0.1.md`
- Read/modify: `Body/S/S0/epi-cli/src/gate/parity.rs`
- Create/modify only if useful: `Body/S/S0/epi-cli/src/gate/coordinate_parity.rs`
- Test: `Body/S/S0/epi-cli/tests/gate_parity_manifest.rs`
- Test: `Body/S/S0/epi-cli/tests/gate_full_parity_contract.rs`

Checklist:

- [ ] Extract the canonical method list from the TS method table.
- [ ] Compare canonical coordinate-native methods against product gateway methods in `gate/parity.rs`.
- [ ] Define status values: `native`, `mirror`, `compatibility`, `missing`, `retired`.
- [ ] Add a parity record shape with method, owner coordinate, live gateway method if any, CLI mirror if any, Body path, test evidence, and status.
- [ ] Seed records for all method families, at minimum family-level if row-per-method generation is too large for the first pass.
- [ ] Add a test that fails if the manifest lacks any accepted `s0.*` through `s5'.*` family.
- [ ] Add a test that fails if a product-native gateway method has no coordinate mapping or explicit compatibility status.
- [ ] Add a test that fails if `s5'.review.*` or `s5'.improve.*` are not represented with explicit native/missing implementation status.
- [ ] Update [[S-SYSTEM-INDEX]] only if the executable manifest changes the family-level matrix.

Verification:

- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`
- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_full_parity_contract`

Exit condition:

- The repo has one checked parity source that implementation tasks can use, and tests fail on unmapped method drift.

## Phase 2. S2 Graph Schema / Services Extraction

Status: service contract boundary advanced. `Body/S/S2/graph-schema` owns the S2 graph schema contract, and `Body/S/S2/graph-services` owns Neo4j primary graph role, the live Neo4j config/client, schema creation, coordinate seed entrypoints, Redis semantic-cache role/config/payload/health/client contracts, retrieval query semantics, tokenization, and pure hybrid fusion/ranking law. S0 graph code imports/re-exports these S2 contracts so `epi graph` remains the command mirror while S2 becomes the client-service authority; S0 mirrors must stay passthrough/adapters, not copies of S2 service law. The remaining S2 work is not "move the same code around"; it is the deeper service/API extraction for sync/import/enrichment and the coordinate-native gateway/API surface. A first live namespace-isolation proof now verifies canonical `:Bimba`, legacy `:BimbaCoordinate`, and `:gnostic` nodes carrying S5 ownership as properties can coexist in one real Neo4j instance without label overlap or destructive cleanup.

Live Docker note: `docker compose -f docker-compose.epi-s2.yml up -d neo4j redis` starts existing stateful containers with named volumes. On 2026-05-02, read-only checks showed Redis healthy with `epi_semantic_cache` and `epi_semantic_cache_test` indexes, Neo4j healthy with 96 legacy `:BimbaCoordinate` nodes and zero canonical `:Bimba` nodes. Do not run destructive ignored graph tests until migration/backup policy is explicit.

Goal: make [[S2]] graph authority Body-native while preserving `epi graph` as the S0 command mirror.

Why now: S2 is a real foundation, but its authority is hidden in `Body/S/S0/epi-cli/src/graph`. Moving it clarifies Neo4j, Redis graph cache, 3072 embeddings, GraphRAG, and external MCP boundaries.

Files/code areas:

- Source: `Body/S/S0/epi-cli/src/graph/`
- Source moved/corrected this tranche: `Body/S/S0/epi-cli/scripts/redisvl_cache_service/` -> `Body/S/S3/redis-context/scripts/redisvl_cache_service/`
- Source: `Body/S/S5/epi-gnostic/cypher/`
- External interface: `Body/S/S2/external/bimba-mcp/`
- Target: `Body/S/S2/graph-schema`
- Target: `Body/S/S2/graph-services`
- S0 mirror: `Body/S/S0/epi-cli/src/graph/`
- Tests: `Body/S/S0/epi-cli/tests/graph_*.rs`
- Tests: `Body/S/S0/epi-cli/tests/redis_cache.rs`
- Tests: `Body/S/S0/epi-cli/tests/semantic_cache_contract.rs`

Checklist:

- [ ] Inventory `src/graph` modules into schema, client, retrieval, cache, seed, sync, doctor, and CLI-only buckets.
- [ ] Identify public functions used by `epi graph` commands.
- [x] Create Body-native S2 package/module boundary without changing behavior.
- [x] Move or expose schema constants so `:Bimba` and 3072 dimensions are owned by S2.
- [x] Move schema creation and coordinate seed entrypoints into S2 graph-services.
- [x] Mark `:BimbaNode`, `:BimbaCoordinate`, `bimbaCoordinate`, old `#` coordinate syntax, and 768-dim vectors as compatibility/migration concerns.
- [ ] Keep `bimba-mcp` explicitly external-facing and not PI-internal authority.
- [x] Point the S0 Neo4j graph client mirror at the S2 graph-services client authority instead of defining that client locally.
- [x] Point S0 coordinate parser, GraphRAG query grammar, retrieval mode/result/disclosure contracts, and semantic-cache law at S2 graph-services authority.
- [x] Keep S0 graph schema/seed/client/parser/cache mirrors as direct S2 passthroughs; S0 may keep command presentation and live runtime adapters, but not duplicated S2 service definitions.
- [x] Move RedisVL semantic-cache bridge scripts out of S0 and into `Body/S/S3/redis-context/scripts/redisvl_cache_service/`; remove the stale generated S0 `.venv` cache.
- [x] Add S3 `redis-context` crate so Redis runtime/RedisVL bridge residency is S3-owned while S2 keeps the graph semantic-cache namespace and payload contract.
- [x] Update tests to import/call S2 services where possible.
- [x] Add or keep raw Neo4j connectivity/schema/index tests.
- [x] Add live Neo4j namespace-isolation proof for canonical `:Bimba`, legacy `:BimbaCoordinate`, and `:gnostic` graph nodes carrying S5 ownership as properties, using test-owned labels only.
- [x] Add read-only live Docker health checks for Neo4j/Redis/Redis Stack/semantic cache.
- [x] Add or keep Redis graph semantic cache tests.
- [x] Add module-level retrieval tests that exercise real retrieval logic.
- [x] Add module-level schema and seed ownership tests.
- [ ] Update [[S-CODE-RESIDENCY-PLAN]] or [[S-SYSTEM-INDEX]] only if actual residency changes require it.

Verification:

- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client`
- [x] `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml`
- [x] `cargo test --manifest-path Body/S/S3/redis-context/Cargo.toml`
- [x] `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml --test semantic_cache_contract semantic_cache_local_dev_uses_s3_redisvl_runtime_bridge`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test coordinate_parser`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_commands bootstrap_dev_dry_run_reports_paths_and_env_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_commands graphrag_classifies_and_extracts_coordinate_queries`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client test_neo4j_connect_and_health -- --ignored --exact`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client test_neo4j_run_query -- --ignored --exact`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-neo4j-namespace cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client test_live_neo4j_namespaces_isolate_bimba_legacy_and_gnosis -- --ignored --exact --nocapture`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_commands`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_retrieval` - contract harness builds; live retrieval suite remains ignored until a deliberate destructive Neo4j seed run is chosen.
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_seed` - contract harness builds; live seed test remains ignored because it mutates canonical `:Bimba`.
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test redis_cache`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test redis_cache test_redis_connect_and_health -- --ignored --exact`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test semantic_cache_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test semantic_cache_contract semantic_cache_python_bridge_health -- --ignored --exact`

Exit condition:

- S2 owns schema, seed entrypoints, query grammar, retrieval contracts, fusion law, and semantic-cache contracts; S0 owns the `epi graph` command surface and live adapter wiring only. Any remaining S0 graph implementation must either be command presentation/runtime plumbing or an explicitly tracked extraction target for S2 services.

- S2 schema/service authority is Body-native or extraction is test-guarded with explicit remaining steps, and `epi graph` remains a working mirror.

## Phase 3. S3 Gateway / Redis Context / Graphiti Runtime Extraction

Status: extraction boundary advanced. `Body/S/S3/gateway-contract` owns gateway product constants, method names, event names, ports, omnipanel metadata, session record/patch contracts, run/event contracts, chat-run registry, S3 temporal Redis role/key contract, SpaceTimeDB projection plan/message/row-decoding contracts, Graphiti runtime constants, Graphiti adapter mode contract, and the S3-runtime/S5-invocation Graphiti separation. `Body/S/S3/gateway` now owns gateway protocol frame construction, durable session store, runtime run/event/chat state, session record creation with injected runtime context, patch/delete/resolve/list authority, legacy OmniPanel row normalization, transcript paths, workspace/bootstrap scope derivation, and subagent launch validation. S0 gate code is now the runtime/server adapter: it injects live Pi/Khora cwd, vault root, NOW path, day id, and session id into S3 session creation, reuses the S3 store/runtime/protocol for persistence and wire behavior, and still hosts the live WebSocket dispatch body while domain handlers remain S0-resident. `Body/S/S0/epi-cli/src/gate/temporal.rs` gives the live S3' temporal context report over DAY/NOW/session/history/Redis/SpacetimeDB/Graphiti/Kairos/Pratibimba orientation, exposed as both `epi gate temporal context` and `s3'.temporal.context` for S4/S5 agent access. Live gateway dispatch/server extraction remains next, but protocol, runtime, and session-store extraction are no longer pending. S4 invocation tests prove real gateway agent RPC and subagent session persistence through the current S0-hosted server/S3-backed store. SpaceTimeDB declares the shared gateway/client/agent/session/global-temporal/Kairos projection schema, and the current S0-hosted gateway can register gateway, client, agent, session, heartbeat, Kairos, and global temporal surfaces against that schema when `SPACETIMEDB_URL` / `EPI_GATE_SPACETIME_URL` is configured. `global_temporal_surface` is the safe shared DAY/NOW/Kairos/Redis/Graphiti/Pratibimba-anchor row for portal and agent clients; it is not the protected PersonalNexus/Graphiti truth store. `health.snapshot` and the S0' portal readiness registry surface registration readiness separately from projection-readiness. The TUI can hydrate the shared temporal projection from SpaceTimeDB through HTTP SQL polling by default; when `EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket` is set, it opens the native SpaceTimeDB WebSocket subscription and decodes `session_surface` / `kairos_surface` / `global_temporal_surface` updates through the S3-owned row contract. The future desktop mirror remains next.

Goal: make [[S3]] runtime authority Body-native and separate live temporal/session context from S2 graph cache.

Why now: the gateway is the future API host, and Redis has two different roles. This phase prevents S3 temporal context, S2 graph cache, and Graphiti runtime from collapsing into one vague service layer.

Files/code areas:

- Source: `Body/S/S0/epi-cli/src/gate/`
- Source: `Body/S/S3/epi-app/`
- Source: `Body/S/S3/epi-spacetime-module/`
- Source: `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`
- Target: `Body/S/S3/gateway`
- Target: `Body/S/S3/redis-context`
- Target: `Body/S/S3/graphiti-runtime`
- Tests: `Body/S/S0/epi-cli/tests/gate_*.rs`
- Tests: `Body/S/S0/epi-cli/tests/session_lifecycle.rs`

Checklist:

- [x] Inventory `src/gate` modules into protocol, server, sessions, channels, chat, runtime, parity, auth, approvals, devices, subagents, Graphiti, and CLI-only buckets.
- [x] Decide the first extraction boundary: pure S3 gateway contract data first; keep live S0 server/store adapters until their dependency edges are tested.
- [x] Keep product-native gateway methods through explicit coordinate parity, not implicit ontology.
- [x] Create or prepare S3 gateway module boundary.
- [x] Move gateway protocol frame construction and runtime run/event/chat state into S3 gateway.
- [x] Create or prepare S3 Redis context boundary distinct from S2 Redis graph semantic cache.
- [x] Add first S3' temporal context access surface for S4/S5 agents: `s3'.temporal.context` and `epi gate temporal context` report DAY/NOW wikilinks, history archive path, Redis keys, SpacetimeDB projection table, and Graphiti arc orientation.
- [x] Hydrate S3' Redis temporal context from real NOW content under `s3:gateway:temporal:*` when requested, without treating Redis as S2 graph cache.
- [x] Project the same DAY/NOW/Redis/history/Graphiti temporal facts through the SpaceTimeDB bridge session surface and shared `global_temporal_surface`.
- [x] Project safe Kairos and protected Pratibimba anchor references through the same S3/S3' temporal context and SpaceTimeDB bridge.
- [x] Replace the older `epi-spacetime-module` presence/oracle/logos centre with a gateway-client registration schema: `gateway_instance`, `agent_instance`, `client_registration`, `session_surface`, `kairos_surface`, `global_temporal_surface`, and `temporal_event`.
- [x] Add reducer contracts for `register_gateway`, `heartbeat_gateway`, `register_agent`, `register_client`, `bind_session_temporal_context`, `bind_kairos_surface`, `bind_global_temporal_surface`, and `publish_temporal_event`.
- [x] Wire the current S0-hosted gateway start/test-server path to register and heartbeat against the SpaceTimeDB registration plane when configured.
- [x] Wire gateway `connect` client registration and session/agent surface publishing to SpaceTimeDB reducers when configured.
- [x] Surface SpaceTimeDB registration readiness through `health.snapshot` without folding it into session/vault/graph health success.
- [x] Add separate S0' portal readiness surfaces for SpaceTimeDB registration and TUI/desktop projection subscription.
- [x] Make the TUI consume the shared SpaceTimeDB projection shape when configured by reading `session_surface`, `kairos_surface`, and `global_temporal_surface` through the gateway registration client.
- [x] Add the native SpaceTimeDB projection subscription plan to the gateway registration readiness contract, including endpoint, tables, S3'/S4/S5 owner semantics, HTTP SQL fallback mode, `SubscribeMulti` message shape, and subscription row decoding.
- [x] Upgrade the TUI projection reader to native SpaceTimeDB WebSocket subscription when `EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket`, while retaining HTTP SQL polling as fallback/default until deployment config flips.
- [ ] Make the future desktop/Tauri client consume the same SpaceTimeDB projection shape instead of inventing a desktop-local temporal state model.
- [x] Move Graphiti runtime adapter target to S3' design language; demote wrapper/sidecar paths to compatibility.
- [x] Keep S5 invocation/search/arc governance out of S3 runtime code.
- [x] Add product-to-coordinate parity tests for at least one `s3.*` family and one `s3'.*` family.
- [x] Add raw gateway session tests after extraction.
- [x] Add module-level Redis temporal context tests.
- [x] Add a Graphiti runtime adapter test that does not assume sidecar architecture.

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_connect_protocol`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_runtime_state`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_method_parity`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_full_parity_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge`
- [x] `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml`
- [x] `cargo test --manifest-path Body/S/S3/gateway/Cargo.toml`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_full_parity_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test portal_surfaces_contract`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-spacetime cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge gateway_registers_live_spacetimedb_gateway_client_and_agent_surfaces_when_configured -- --exact --nocapture`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-spacetime cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge --test portal_surfaces_contract --test gate_agent_runtime_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_temporal_context`
- [x] Live Redis hydration against Docker `epi-redis` on 2026-05-07: `EPILOGOS_REDIS_URI=redis://127.0.0.1:6379 CARGO_TARGET_DIR=/tmp/epi-cargo-target-kairos cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_temporal_context -- --ignored --nocapture`
- [x] Live Neo4j Graphiti temporal substrate proof: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client test_live_neo4j_graphiti_temporal_episode_keeps_s3_architecture_and_s5_usage_clear -- --ignored --exact --nocapture`

Exit condition:

- S3 owns gateway protocol/session/runtime/temporal context architecture, S0 remains a live server/domain adapter/mirror, and Redis/Graphiti roles are not ambiguous. S0 gateway support modules such as protocol, runtime state, transcripts, bootstrap scope, workspace derivation, subagent launch context, parity records, run records, and session-store contracts must passthrough to S3/S3' crates rather than carry copied definitions. Remaining work is live dispatch/server extraction, graphiti-runtime extraction, S2 sync/import/enrichment extraction, and future Tauri projection consumption.

## Phase 3A. Gateway Session Runtime / Khora Parity

Status: first audit/contract pass complete, and the S3 gateway-contract now owns the first typed session operation surface consumed by S0 parity and the portal. The gateway session paradigm should now be treated as the shared S3/S4.0' runtime contract: S3 owns live session truth, Khora owns agent runtime identity and NOW write authority, S3' projects temporal/session facts through Redis and SpaceTimeDB, and S5' governs session summarisation, review, and autoresearch use. The existing Electron OmniPanel / Gateway UI has now been checked as the functional-logical parity reference for the first pass: the renderer actively exposes chat history/send/abort and session list/patch/delete, while the gateway already owns resolve, preview, reset, and compact as canonical operations. The renderer now uses `sessionKey` for patch/delete calls, gateway session rows expose `sessionKey` and `canonicalKey` alongside compatibility `key`, and the frontend parity manifest declares the full session operation family. Session records now have homes for parent/source lineage, runtime cwd, vault root, resource-loader identity, retry settlement state, and structured diagnostics. Remaining implementation should keep the logic in gateway/portal contracts rather than preserving Electron-local authority.

Goal: make gateway sessions operate consistently across CLI, TUI, future Tauri app, PI-agent runtime, Khora session_start, SpaceTimeDB projection, Graphiti memory, and Epii review/summarisation.

Why here: DAY/NOW context ids now give the correct session naming paradigm, but naming alone is not enough. The system needs one canonical session lifecycle for create, list, resolve, preview, patch, reset, delete, compact, fork, resume, import, transcript/run state, resource loading, diagnostics, and session memory.

Files/code areas:

- Source/parity reference: current Electron OmniPanel / Gateway UI session code in `Body/S/S3/epi-app`
- Source: `Body/S/S0/epi-cli/src/gate/session_store.rs`
- Source: `Body/S/S0/epi-cli/src/gate/sessions.rs`
- Source: `Body/S/S0/epi-cli/src/gate/temporal.rs`
- Source: `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`
- Source: `Body/S/S0/epi-cli/src/portal`
- Source: `Body/S/S4/ta-onta/S4-0p-khora`
- Source: `Body/S/S5/epi-kbase`
- Target: `Body/S/S3/gateway`
- Target: `Body/S/S3/gateway-contract`
- Target: `Body/S/S3/redis-context`
- Target: `Body/S/S3/graphiti-runtime`

Full shape:

The session runtime has seven work lanes. They should be executed as one phase, but each lane needs its own proof so the build does not collapse UI parity, gateway storage, Khora runtime, temporal projection, memory, and review into one vague "session" feature.

Execution tranche - real PI session propagation:

This tranche is the next non-negotiable work set. It should be run as one coherent implementation pass, not as isolated fixes. The intent is to make PI session identity propagate from the PI/Khora runtime into S3 gateway truth, S3' live projection, S4/S5 agent access, and S5' review/summarisation without product-local gaps.

Task group A - centralize the runtime-to-gateway write path:

- [x] Add the first direct propagation from `epi agent session init` into the S3 gateway session store.
- [x] Extract the propagation logic from `Body/S/S0/epi-cli/src/agent/session.rs` into a reusable runtime propagation function/module with a narrow API: input `AgentSessionRuntime`, output canonical `SessionRecord` plus diagnostics.
- [x] Make the reusable propagation function derive the canonical gateway key from PI agent identity and operation kind without hardcoding only `agent:{pi_agent}:main`.
- [x] Ensure the propagation function accepts explicit operation context: `session_start`, `new`, `resume`, `fork`, `import`, `resource_reload`, and `close/compact`.
- [x] Make the propagation function write only S3-owned fields through `SessionStore` and preserve Khora-owned fields as values supplied by the runtime, not recomputed in the gateway layer.
- [x] Add tests proving repeated propagation for the same runtime is idempotent: no duplicate aliases, no new NOW path, no lost diagnostics, and stable canonical key.
- [ ] Add tests proving propagation for a different effective cwd recreates cwd-bound paths, vault root, gate root, plugin runtime path, and resource-loader id.

Task group B - make later PI lifecycle operations use the same runtime factory:

- [ ] Identify the actual PI command/event surfaces for `/new`, `/resume`, `/fork`, import, resource reload, retry, compact, and close in the current PI/Khora/VAK code.
- [ ] Add operation-specific `AgentSessionRuntimeRequest` fields where needed: operation kind, source session key, target session key, parent session key, source kind, imported source handle, branch label, and expected agent id.
- [x] Implement `epi agent session new` or the existing equivalent command path so it calls `AgentSessionRuntimeFactory` with `force_new=true`, writes a new NOW, and propagates the new record to S3.
- [ ] Implement/route `epi agent session resume` so it resolves a source gateway session, recreates effective-cwd-bound PI runtime state, preserves DAY/NOW identity where appropriate, and propagates S3 lineage.
- [x] Implement/route `epi agent session fork` so it creates a new target gateway session with parent/source lineage, new runtime identity when requested, inherited agent/resource context, and explicit `sourceSessionKind=fork`.
- [x] Implement/route `epi agent session import` so external Claude/PI/Codex runs enter through the same runtime factory and store imported source handles without pretending they are native Khora starts.
- [ ] Ensure gateway RPC methods `sessions.fork`, `sessions.resume`, and `sessions.import` either call the shared runtime propagation path or explicitly document/test why they are storage-only compatibility operations.
- [ ] Add real gateway RPC tests proving fork/resume/import records include runtime cwd, vault root, resource-loader id, DAY/NOW identity, diagnostics, and correct lineage after propagation.

Implementation result, 2026-05-08:

- `Body/S/S0/epi-cli/src/agent/session_propagation.rs` now owns the shared PI-runtime-to-S3-session propagation path for `session_start`, `new`, `resume`, `fork`, `import`, `resource_reload`, and `close_compact`.
- `epi agent session init`, `new`, `resume`, `fork`, and `import` now call `AgentSessionRuntimeFactory` and propagate the resulting Khora/PI runtime into the gateway session store.
- Gateway `SessionPatch` now carries `session_id`, so the S3 record can preserve the actual PI/Khora runtime id rather than falling back to compatibility defaults.
- S0 portal runtime and SpaceTimeDB projection hydration now preserve the agent access fields needed by S4/S5: canonical session key, active PI agent id, runtime cwd, resource-loader id, source lineage, and Graphiti session arc id.
- PI runtime propagation now calls the shared S3 SpaceTimeDB session-surface publisher after each S3 session-store write, so `session_start`, `new`, `resume`, `fork`, and `import` no longer wait for a later gateway RPC touch before appearing in the projection stream.
- PI runtime propagation can now hydrate the S3' Redis temporal keyset during the same session-surface publish when `EPI_GATE_SESSION_REDIS_HYDRATION=required` or `best-effort`: session NOW markdown, DAY context, session Kairos, agent orientation, and personal orientation where the Pratibimba anchor is available.

Task group C - resource loading and singleton idempotency:

- [ ] Audit current resource loading paths for plugins, skills, prompts, themes, settings, model config, auth profiles, and extension manifests.
- [ ] Add structured diagnostics for missing explicit resource paths (`-e`, `--skill`, `--prompt-template`, theme/config paths) without log-and-exit in creation logic.
- [ ] Add a resource-loader identity contract that is stable per effective cwd + agent id + plugin runtime path and changes when those inputs change.
- [ ] Ensure startup, `/new`, `/resume`, `/fork`, and import do not double-load singleton-style extensions or duplicate Khora `session_start` side effects.
- [ ] Add tests that run the runtime factory twice for the same cwd/day and prove only one NOW/session_start write occurs while diagnostics report reuse.
- [ ] Add tests that run the runtime factory for two cwd roots and prove each gets distinct cwd-bound resource-loader ids and session state paths.
- [ ] Add tests that simulate a missing resource path and assert a structured diagnostic appears in the gateway session record rather than process exit text.

Task group D - retry/idle/run-state settlement:

- [ ] Locate the PI/gateway retry and idle settlement paths for agent runs and chat runs.
- [ ] Define the S3 session record fields that represent run state: active run ids, last run id, retry settlement state, idle state, abort state, and diagnostics.
- [ ] Preserve retry-settlement semantics so a retried agent run does not mark the session idle until the full retry cycle completes.
- [ ] Add gateway tests that simulate transient retry state and prove `sessions.resolve` / `sessions.run-state` exposes pending, retrying, settled, and aborted states truthfully.
- [ ] Ensure TUI/portal readiness uses run-state facts from gateway records, not locally inferred UI state.

Task group E - projection into S3' and portal consumption:

- [x] Ensure every propagation write publishes or schedules `session_surface` updates through the existing SpaceTimeDB bridge.
- [x] Ensure Redis S3' temporal keys are hydrated for the propagated PI base session: NOW markdown key, day context key, session Kairos key, and agent orientation key where available.
- [x] Add projection tests proving PI-propagated records appear in `session_surface` with session id, DAY id, NOW path, runtime cwd, vault root, resource-loader id, diagnostics, and active agent id.
- [x] Add portal runtime tests proving the centre `/` command panel, left clock side, and right Nara/Epii side all read the same propagated session identity.
- [x] Add health/readiness tests proving gateway health reports the propagated PI session without requiring a later manual `SessionStore::create`.

Task group F - S4/S5 agent access and memory:

- [x] Add bounded S4/S5 tools to resolve current session runtime context from gateway: session identity, NOW path, DAY id, active PI agent, resource-loader id, and projection readiness.
- [x] Add bounded S4/S5 tools for Graphiti session-memory search/deposit that require propagated session identity and protected-local namespace facts.
- [x] Add kbase/Gnosis session-context retrieval to the same bounded pattern, with distinct capability envelopes for Anima and Epii.
- [x] Ensure Anima/Aletheia can deposit outputs and requests but cannot promote identity-affecting interpretation without Epii/human review.
- [x] Extend compact/close so the summarisation pipeline consumes propagated runtime identity, NOW, transcript, session tree, Graphiti episodes, and kbase/Gnosis retrieval.

Implementation result, 2026-05-08:

- `s5'.epii.runtime.context` now resolves the active gateway session into an S4/S5-safe runtime context envelope with canonical session key, PI/Khora runtime id, DAY/NOW identity, runtime cwd, resource-loader id, SpaceTimeDB readiness, and non-mutating access flags.
- `s5.episodic.search` and `s5.episodic.deposit` now require propagated `sessionKey`, `dayId`, and `namespaceRef`; both return explicit `S3'` runtime owner / `S5/S5'` invocation owner envelopes, protected-local privacy boundary, method identity, and no identity-mutation authority.
- `s5'.gnosis.context.retrieve` now reads the local Gnosis/kbase document store through the bounded S5' gateway surface and returns separate Anima/Aletheia versus Epii capability envelopes: Anima/Aletheia can retrieve and request review, while Epii can promote interpretation only with human review for identity mutation.
- `sessions.compact` now deposits an Aletheia-to-Epii review item with a real evidence bundle covering session record, NOW/temporal context, transcript, session tree, Graphiti search evidence, and Gnosis retrieval evidence.
- `epi agent session close` now propagates `close_compact` through the PI runtime-to-gateway session path before local session-state removal, preserving the close/compact diagnostic and gateway session key for S3/S3' projection.
- S3 gateway contract and S0 parity manifest now expose `s5'.epii.runtime.context` and `s5'.gnosis.context.retrieve` as native S5' methods rather than hidden server-only dispatch.

Task group G - Tauri/desktop parity after backend truth is settled:

- [ ] Mark the Electron OmniPanel behavior as parity evidence, not runtime authority.
- [ ] Specify the Tauri v2 client contract against `GatewaySessionOperationContract`, `session_surface`, readiness facts, and portal runtime state.
- [ ] Ensure desktop session/chat/model controls, skill surfacing, VAK/Anima/Epi execution, inbox, Nara journal/flow, and Epii workbench route through the shared session/runtime contracts.
- [ ] Add a Tauri planning/spec checkpoint only after groups A-F have passing backend and portal contract tests.

Task group H - verification gate for this tranche:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_khora_integration`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test session_lifecycle`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_chat`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_temporal_context`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test portal_surfaces_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_agent_runtime_contract`
- [x] `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml`
- [x] Run live Redis hydration proof when touching S3' temporal keys.
- [x] Run live Neo4j/Graphiti namespace proof when touching episodic memory.
- [ ] Run Electron/Tauri parity tests only after backend/session contracts are stable.

Verification note, 2026-05-08: Task F passed the focused gateway/session/S5' suites, SpaceTimeDB projection suite, S3 gateway-contract suite, and the live Redis hydration proofs against the local Docker `epi-redis` container. The live Graphiti runtime proof is now the completion gate for any tranche touching episodic memory: `make verify-graphiti-live`. That command starts Docker Neo4j, Docker Redis, and the Docker Graphiti adapter, then runs the real-service gateway round trip `live_graphiti_runtime_round_trips_session_memory_through_gateway`. It deposits through `s5.episodic.deposit`, searches through `s5.episodic.search`, preserves S3' runtime/S5 invocation ownership, and verifies against real Neo4j/Redis/Gemini-backed Graphiti rather than mocked or manually started state.

Lane 1 - Canonical operation surface:

- [x] Audit the current Electron OmniPanel / Gateway UI session surface for actual functional operations and state shape before changing gateway implementation.
- [x] First parity correction: the renderer now calls session patch/delete with canonical `sessionKey`, gateway rows expose `sessionKey` / `canonicalKey`, and the frontend parity manifest declares list, resolve, preview, patch, reset, delete, and compact.
- [x] Define typed request/response contracts for the full gateway session operation family: list, resolve, preview, patch, reset, delete, compact, fork, resume, import, tree/branch, transcript, run state, chat history/send/abort, and channel binding. First code landing: `GatewaySessionOperationContract` in `Body/S/S3/gateway-contract` maps the canonical operation ids to implemented gateway methods and `session_surface` projection ownership.
- [x] First operation extension: `sessions.fork`, `sessions.resume`, `sessions.import`, and `sessions.tree` are in gateway-contract method names, S0 parity, OmniPanel parity, and real gateway RPC tests.
- [x] Keep compatibility aliases accepted at the gateway edge (`key`, `session`, `sessionKey`) while emitting `sessionKey` / `canonicalKey` as the canonical portal/app/client shape.
- [x] Extend product-to-coordinate parity so every current product-native session/chat method maps to `s3.*`, `s3'.*`, `s4.*`, `s4'.*`, `s5.*`, or `s5'.*`, or is explicitly marked compatibility/retired.
- [x] Include model/provider override, reasoning/thinking/verbose controls, abort/retry/idle settlement, timestamps, and diagnostics in the contract rather than leaving them as Electron-local UI state.

Lane 2 - Identity, lineage, and labels:

- [x] Preserve DAY/NOW-derived session labels while keeping stable canonical session keys for main sessions, subagents, branches, forks, resumes, and imports.
- [x] Define durable identity fields separately from display labels: record id, canonical key, session key, DAY id, NOW id, alias/display name, created/updated/last-active timestamps, and client/agent bindings.
- [x] Define lineage fields for parent session, source session, source kind, branch/fork/resume/import relation, run-tree position, and subagent ownership.
- [ ] Extend session records/contracts as needed for parent/source lineage, timestamps, runtime cwd, vault root, resource-loader identity, retry/idle settlement state, diagnostics, agent/client bindings, and temporal context ids.
- [x] First session-record extension: parent/source lineage, runtime cwd, vault root, resource-loader identity, retry settlement state, and structured diagnostics have storage, patch, row, and renderer type support.
- [x] Second session-record extension: `dayId` can be patched, fork/resume copy root temporal identity, import records source lineage, and `sessions.tree` returns lineage edges.
- [x] Add explicit migration/compatibility rules for older session rows that only have `key` or product-local labels. First code landing: `SessionStore` normalizes legacy `key` / `sessionKey` / `canonicalKey`, `displayName`, and camelCase runtime fields at the read edge while keeping the in-memory `SessionRecord` canonical.

Lane 3 - Khora runtime factory:

- [ ] Port the PI `AgentSessionRuntime` pattern as a Khora/S3 runtime factory: startup, `/new`, `/resume`, `/fork`, and imports must recreate cwd-bound services and session config through one path. Startup/session_start is now propagated into the S3 gateway session store directly by `epi agent session init`; later `/new`/`/resume`/`/fork`/import propagation still needs the same runtime-factory path.
- [x] First runtime-factory pass: `AgentSessionRuntimeFactory` now creates the base Pi session surface from effective cwd, including DAY/NOW context, vault root, bootstrap, env, managed agent id/dir, plugin runtime path, models/auth/settings paths, gate state root, resource-loader id, default model, and structured diagnostics; `epi agent session init` is now a wrapper over this base runtime.
- [x] First S3 propagation pass: `epi agent session init` now seeds/patches the base `agent:{pi_agent}:main` gateway session record with Khora session id, DAY id, NOW path, effective cwd, vault root, PI resource-loader id, active PI agent id, model override, aliases, and structured runtime diagnostics.
- [ ] Make the runtime factory close over process-global fixed inputs while recreating effective-cwd-bound services, vault root resolution, config, resource loading, permissions, provider/model options, and session store access.
- [x] Make Khora `session_start` idempotent against duplicate DAY/NOW writes for first startup and repeated same-day extension startup.
- [ ] Extend the same idempotency through later `/new`, `/resume`, `/fork`, import, and resource loading so singleton resources do not double-load.
- [ ] Replace log-and-exit service/session creation paths with structured diagnostics that the CLI/TUI/app layer presents.
- [ ] Preserve retry-settlement semantics so a retried agent run does not declare idle until the full retry cycle completes.
- [ ] Make explicit which fields are Khora-owned (`now_path`, cwd-bound runtime identity, session_start write authority) and which are S3-owned (gateway key, connection, transcript/run state).

Lane 4 - S3' projection through Redis and SpaceTimeDB:

- [x] Project session labels, tree lineage, timestamps, runtime state, diagnostics, DAY/NOW ids, vault root, runtime cwd, client/agent bindings, Kairos/Pratibimba anchors, and the shared DAY/NOW row through the SpaceTimeDB `session_surface` / `kairos_surface` / `global_temporal_surface` shape.
- [x] Expose a native SpaceTimeDB projection subscription plan from the same S3' registration object consumed by gateway health and portal readiness.
- [x] Upgrade the current TUI projection reader to native SpaceTimeDB WebSocket subscription under explicit native mode, using the same projection context shape and local fallback.
- [x] Keep Redis temporal session keys in S3' as hot local DAY/NOW/session/Kairos orientation, separate from S2 Redis graph semantic cache.
- [x] Add explicit readiness states for registration, projection-read, projection-subscription, Redis hydration, and local fallback so the portal can explain partial connectivity without pretending all layers are healthy.
- [x] Ensure one SpaceTimeDB deployment can hold many gateway/client/agent/session/user projections while protected personal truth remains local Neo4j/Graphiti.

Lane 5 - Memory, Graphiti, and summarisation:

- [x] Keep Graphiti architecture at S3/S3' runtime and invocation/interpretation governance at S5/S5'; do not reintroduce sidecar-shaped ownership.
- [x] Add first S4/S5 bounded tools for Graphiti session-memory search/deposit: `s5.episodic.search` and `s5.episodic.deposit` expose S3' runtime owner, S5/S5' invocation owner, protected-local privacy boundary, agent/source capability envelopes, and no identity mutation.
- [x] Add live Graphiti runtime proof through the gateway: Graphiti now uses Gemini LLM, Gemini embeddings, Gemini reranking, storage-safe group ids derived from canonical Pi session keys, and real Neo4j/Redis state. This proof is mandatory via `make verify-graphiti-live` before closing episodic-memory work.
- [ ] Add kbase/Gnosis session-context retrieval to the same bounded memory/access pattern, with different capability envelopes for Anima and Epii.
- [x] Define first Graphiti episodic namespace rules in the gateway envelope: session key, DAY id, Pratibimba namespace ref, source agent, protected-local privacy boundary, and Epii-review requirement for promotion/identity-affecting interpretation.
- [ ] Build the S5 session close/compact summarisation pipeline: NOW + transcript + session tree + Graphiti episodes + kbase/Gnosis retrieval -> Aletheia crystallisation -> Epii review inbox / autoresearch evidence.
- [x] First compact handoff: `sessions.compact` creates a real Aletheia-sourced Epii review inbox item with transcript/session evidence and human review required.
- [ ] Preserve human validation gates: Anima/Aletheia may deposit outputs and requests, but Epii/human review governs interpretation, promotion, and identity-affecting changes.

Lane 6 - Portal, TUI, and future Tauri parity:

- [x] Bind the TUI portal session surface to the same gateway operations and projection records; it must not keep local-only session truth. First code landing: `SessionOperationsProvider` renders S3 gateway session contracts as portal surfaces with gateway method, request/response keys, and `session_surface` metadata.
- [x] Make the centre `/` panel surface session operations as coordinate-owned commands, not product-specific Electron affordances. First code landing: default portal surfaces now include `session-op.*` entries sourced from `GatewaySessionContract`.
- [x] Make the left `0` clock side and right `1` Nara/Epii side consume the same portal runtime state: DAY/NOW, Kairos, vault root, session identity, Redis hydration, SpaceTimeDB projection, and protected Pratibimba anchor.
- [ ] Make the future desktop/Tauri client consume the same SpaceTimeDB projection shape and gateway operation contracts instead of inventing desktop-local temporal/session state.
- [ ] Preserve OmniPanel breadth in the future app: session/chat/model controls, skill surfacing/management, VAK/Anima/Epi execution, inbox, Nara journal/flow, and Epii workbench all route through shared S-layer service contracts.

Lane 7 - Test architecture and execution order:

- [x] Start each subtask by checking the closest existing test, then write or correct the failing proof before implementation.
- [x] Prove raw gateway/session/Redis/SpaceTimeDB connectivity separately from agent invocation and review-governed summarisation.
- [x] Add gateway-contract tests before moving more fields across Rust/TS/app boundaries.
- [x] Add portal contract tests before changing the TUI layout so data authority is locked before rendering polish.
- [x] Add Graphiti/Neo4j tests using real local services and test-owned namespaces; never delete useful existing data. Current proof runs against live Docker Neo4j, writes only `EpiGraphitiTemporalTest` nodes, and deletes that test namespace after asserting S3'/S5 ownership.
- [ ] Continue by executing the "Execution tranche - real PI session propagation" task groups A-H above in order, only moving to Tauri/desktop parity after backend session propagation, projection, portal, and agent-memory proofs are green.

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_khora_integration`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test session_lifecycle`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_chat`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_temporal_context`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test portal_surfaces_contract`
- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_agent_runtime_contract`
- [x] Add gateway session runtime parity tests for DAY/NOW labels, canonical keys, fork/resume/import lineage, diagnostics, and SpaceTimeDB projection.
- [x] Add Graphiti/session-memory tests that use real local Neo4j/Graphiti-compatible substrate under test-owned namespaces: live Neo4j S3'/S5 episode ownership proof plus gateway `s5.episodic.search` / `s5.episodic.deposit` bounded-runtime envelopes.
- [x] Add S5 close/compact summarisation tests proving review-inbox evidence creation without mutating protected user identity.
- [x] Add portal contract tests proving the TUI session surface uses gateway operations/projection facts rather than local-only state.
- [x] After the UI audit, add frontend or contract tests covering the Electron parity operations that must survive the Tauri migration.
- [x] `npm test -- --run tests/main/gateway-parity.test.ts` in `Body/S/S3/epi-app`
- [x] `npx tsc --noEmit` in `Body/S/S3/epi-app`
- [x] `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml`

Exit condition:

- Gateway sessions have one coordinate-native lifecycle across CLI, TUI, SpaceTimeDB, Khora, Graphiti memory, and Epii review, with the existing OmniPanel behavior accounted for as parity evidence rather than left as hidden product logic.

## Phase 4. S1' Compiler Spine Enforcement

Status: first canonical Rust compiler invocation and frontmatter enforcement passes complete. S2/S3 substrate is now verified against the existing Docker compose services. Neo4j currently has useful legacy `:BimbaCoordinate` data and zero canonical `:Bimba` nodes, so compiler/residency work must preserve compatibility and route promotions through migration-aware S2 contracts. `Body/S/S1/hen-compiler-core` now owns the dry-run `CompilerInvocation` contract with `pi_agent` as canonical executor and `vendor_claude_sdk` as compatibility-only. It also owns compiled-artifact frontmatter validation against residency and invocation law, and S0 vault frontmatter mirrors this exact Hen contract. The earlier Python `hen_*` planners remain compatibility/probe material over the vendor-shaped compiler substrate.

Goal: make [[S1']] compiler/residency/frontmatter law executable and reachable by agents.

Why here: after S2/S3 boundaries are clearer, vault writes and artifact promotion need a real compiler authority rather than scattered frontmatter helpers.

Files/code areas:

- `Body/S/S1/hen-compiler-core`
- `Body/S/S1/hen-compiler` vendor compatibility substrate
- `Body/S/S4/ta-onta/S4-1p-hen`
- `Body/S/S0/epi-cli/src/vault/`
- `Idea/Empty/Present/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md`
- Tests: `Body/S/S0/epi-cli/tests/vault_*.rs`
- Tests: future Hen/compiler tests under the S1 package

Checklist:

- [ ] Before edits, run existing `vault_frontmatter` and `vault_commands` tests and classify stale tests vs real compiler proof.
- [x] Confirm package identity and command/API role of `Body/S/S1/hen-compiler`.
- [x] Read `Body/S/S1/hen-compiler/AGENTS.md` as the compiler-vendor basis before designing Hen behavior.
- [ ] Inventory current S1 package files, current S0 vault/frontmatter helpers, and S4 Hen extension stubs.
- [x] Define executable frontmatter schema for `{family}_{n}_{semantic}` keys and accepted exemptions.
- [x] Move first executable frontmatter validation schema into canonical Rust Hen core and make S0 vault frontmatter delegate to it.
- [x] Define the first compiler input/output residency record: canonical Day source, T-lane artifact destination, vendor `daily/`/`knowledge/` compatibility aliases, and diagnostics.
- [x] Define first `CompilerInvocation` contract with executor kind (`pi_agent`, `service`, `vendor_claude_sdk`), target agent, required plugin/skill body, tool boundary, review policy, dry-run/mutation mode, and residency target.
- [x] Port the `CompilerInvocation` / residency / ledger-channel planner from Python probe to canonical Rust crate with fidelity.
- [x] Make Rust vault/frontmatter code a mirror or compatibility layer, not a second authority.
- [x] Add compiled-artifact frontmatter validation against Hen residency and `CompilerInvocation` law.
- [x] Map envelope compiler spine rows to ledger channel, compiler pass, and return type, with QL first in compile order.
- [x] Preserve S0 real vault/frontmatter tests while delegating validation authority to S1 Hen core.
- [ ] Add rejection tests for stale canonical bare keys where appropriate.
- [ ] Add compatibility tests for legacy frontmatter that must be read but not emitted by new compiler output.
- [x] Add first dry-run compile-planning tests that do not mutate the real vault by default; use temp fixtures and explicit dry-run output.
- [x] Harmonise S0 thought path helpers with canonical `Pratibimba/Self/Thought/T/Tn` residency; `epi vault thought-route` now rejects positions outside T0-T5 rather than silently clamping.
- [x] Add S2 graph-sync intent tests so compiler output can request `:BimbaCoordinate` -> `:Bimba` migration or canonical write without directly touching live Neo4j.
- [x] Add first agent-access design hook so Anima/Epii compile plans declare required plugin/skill body before writing.
- [x] Make `pi_agent` the canonical compiler-enrichment executor and keep `vendor_claude_sdk` as a compatibility backend for the original compiler-vendor flow.
- [ ] Update API/TS only if new compiler methods or return types are required.

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_frontmatter`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_commands`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-hen-core cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_frontmatter`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-hen-core cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_commands`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-paths cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_paths_templates`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-paths cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_commands`
- [x] `python3 -m unittest discover -s Body/S/S1/hen-compiler/tests`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-hen-core cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test compile_plan`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-hen-core cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --test graph_sync_intent`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-compiler cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-compiler cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s1-hen-core cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`
- [x] Dry-run compiler planner proof over temp vault fixtures.

Exit condition:

- Vault writes and generated artifacts can be validated against S1' law, and future agents know how to ask Hen before writing.

## Phase 5. S4 Agent Invocation / Access Architecture

Status: first invocation/access pass complete. `Body/S/S4/plugins/registry.jsonl` is now the canonical repo plugin registry, with `plugins/registry.jsonl` retained only as a compatibility registry. `epi agent plugins list`, runtime plugin resolution, and PI launch planning discover `Body/S/S4/plugins/pleroma` directly. The Pleroma capability matrix now machine-checks the critical VAK skill bodies (`vak-evaluate`, `anima-orchestration`, `vak-coordinate-frame`, `day-night-pass`) alongside constitutional ANIMA definitions, hooks, authority boundaries, and Anima -> Epii handoff/deposit shapes. Gateway `s4'.vak.evaluate` and `s4'.orchestrate` now expose first callable Anima/Pleroma access: real Pleroma skill paths, constitutional agent routing, and Epii authority boundaries. Real gateway tests prove S4 agent RPC and subagent persistence; live provider-backed PI worker verification remains explicitly ignored until local provider auth/bootstrap is present.

Goal: prove [[S4]] and [[S4']] are inhabitable by real PI agents, not merely configured by CLI helpers.

Why here: the two spines only matter if actual agents can use them. Compiler law and autoresearch are dead architecture unless Anima/Epii can invoke them.

Files/code areas:

- `Body/S/S4/pi-agent`
- `Body/S/S4/ta-onta`
- `Body/S/S4/plugins/pleroma`
- `Body/S/S0/epi-cli/src/agent/`
- `Body/S/S0/epi-cli/src/gate/subagents.rs`
- Tests: `Body/S/S0/epi-cli/tests/agent_*.rs`
- Tests: `Body/S/S0/epi-cli/tests/gate_agent_*.rs`

Checklist:

- [x] Separate source package, runtime sync target, and installed agent state in docs/code: source packages live under `Body/S/S4/pi-agent`, `Body/S/S4/ta-onta`, and `Body/S/S4/plugins/pleroma`; managed runtime state lives under `.epi/agents/<id>/agent`; installed Codex/OMX projection lives under `.codex/` / `.omx/`.
- [x] Confirm `Body/S/S4/pi-agent` lineage from `pi-vs-claude-code` and note remaining fork gaps: `agent-team.ts`, `agent-chain.ts`, `subagent-widget.ts`, `child-extension-propagation.ts`, `prompt-url-widget.ts`, and `tilldone.ts` are now covered by executable lineage tests as fidelity ports, Epi-Logos/VAK adaptations, or intentionally deferred pieces.
- [ ] Confirm Pleroma oh-my-codex lineage and keep package/install surface distinct from ta-onta Pleroma module.
- [x] Add executable lineage tests for Disler-vendor PI primitives: teams, chains, subagent surfaces, child extension propagation, and TillDone execution discipline.
- [x] Decide and wire the `tilldone` role for Anima execution runs. Target achieved: TillDone is a fidelity port from Disler, registered by Pleroma only when `EPI_AGENT_NAME=anima`, `EPI_AGENT_MODE=anima|execution`, or `EPI_TILLDONE_MODE=on`, with `EPI_TILLDONE_MODE=off` as the explicit escape hatch.
- [x] Add a capability/permission contract for gated tool and skill lists: `Body/S/S4/plugins/pleroma/capability-matrix.json` now declares `agent_capability_gates`, and Anima's PI frontmatter/extension active-tool surface explicitly exposes VAK, team, chain, subagent, and TillDone tools.
- [x] Audit first [[Pleroma]] capability matrix for Anima's capability membrane: skill workflows, ANIMA definitions, hooks, and bounded authority are machine-checked in `Body/S/S4/plugins/pleroma/capability-matrix.json`.
- [x] Define first Anima authority split from Epii review authority: Anima can dispatch/deposit/request; Epii review gates are forbidden to Anima.
- [x] Prove source-to-runtime sync for `.epi/agents/<id>/agent` with `agent_extensions` and `agent_spawn` tests.
- [x] Prove real spawn/session/invocation path or clearly name the missing runtime piece: launch contract, runtime plugin indexing, session state, gateway RPC, and subagent persistence are tested; provider-backed live PI worker boot remains the missing external-auth/runtime piece.
- [x] Make `s4.agent.query/notify/status` reachable through gateway parity or explicit CLI mirror: gateway methods now persist S4 agent query/notify receipts and expose status through `gate_s4_coordinate_surfaces.rs`.
- [x] Make `s4'.vak.evaluate` and `s4'.orchestrate` callable through gateway-backed Anima/Pleroma access: the first pass returns real Pleroma skill paths, deterministic VAK routing, constitutional agent mapping, and Epii authority boundaries. Full provider-backed PI extension execution remains the later live-worker proof.
- [x] Persist or expose Psyche state, goal state, and permission boundary: `s4'.psyche.state`, `s4'.psyche.update`, and `s4'.permission.get` now expose the first persisted Psyche state and explicit permission boundary; richer goal-state semantics remain future `s4'.goal.*`.
- [ ] Add reviewable approval state for human-gated actions.
- [x] Add first typed Anima -> Epii handoff/deposit shape in the Pleroma capability matrix without giving Anima Epii's review authority.

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_plugin_install`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_extensions`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_spawn`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_session_commands`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_vak`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_agent_rpc`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_subagent_spawn`
- [x] `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s4-anima cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_anima_pleroma_access`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test real_pi_claude_mem` - passes with the real live-worker test ignored until provider auth/local claude-mem bootstrap exists.
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test ta_onta_cli_contract`
- [x] `python3 -m unittest discover -s Body/S/S4/plugins/pleroma/tests`

Exit condition:

- A real agent path can invoke or receive S4/S4' capabilities, and tests clearly distinguish agent access from raw service checks.

## Phase 6. S5' Epii Review / Autoresearch Spine

Status: first review-inbox, autoresearch-core, Epii agent-access, read-only world-return access, source-referenced evaluation, accepted-review promotion-gating, and epi-logos plugin binding passes complete. `Body/S/S5/epii-review-core` owns durable Epii review inbox state, open/deferred/resolved transitions, approve/reject/revise/defer decisions, and the guard that agent actors cannot approve/reject/revise items marked `requires_human`. `Body/S/S5/epii-autoresearch-core` now generalises the vendor ML autoresearch shape into an Epii self-improvement state machine: baseline/challenger proposals, weighted evidence evaluation with `kind` / `uri` / coordinate / summary source references, keep/discard decisions, status/history, and dry-run promotion planning through S1' [[Hen]] compiler law. `Body/S/S5/epii-agent-core` gives Epii an access layer over both stores so Anima/Aletheia can deposit review/improvement requests and Epii can query review/autoresearch status through `s5'.epii.*`. `Body/S/S5/plugins/epi-logos` is now the local canonical S5/S5' resource/skill scaffold, promoted from the earlier sketch, with plugin manifest, `epi-knowing` skill, and QV resources. S0 plugin discovery includes S5 plugins so Epii's resource spine can be loaded by the PI runtime path. The `s5'.epii.status` gateway response now also includes read-only [[Gnosis]], [[Nara]], and [[Graphiti]] world-return status. Gateway promotion now requires an approved Epii review resolution before returning even a dry-run Hen plan. Non-dry-run promotion remains blocked until compiler mutation law is wired.

Goal: build Epii's review inbox and autoresearch loop as real S5' capabilities.

Why here: Epii is the user-position and developer portal. It is where Anima/Aletheia outputs, human validation gates, Gnosis/Nara/Graphiti returns, and autoresearch proposals become meaningful.

Files/code areas:

- Target: `Body/S/S5/epii-autoresearch-core`
- Target: `Body/S/S5/epii-agent-core`
- Target: Epii review module under `Body/S/S5`
- Target: `Body/S/S5/plugins/epi-logos`
- Existing service: `Body/S/S5/epi-gnostic`
- Existing S4 handoff: `Body/S/S4/ta-onta/S4-5p-aletheia`
- S0 mirrors: `Body/S/S0/epi-cli/src/techne/gnosis`, `Body/S/S0/epi-cli/src/nara`, `Body/S/S0/epi-cli/src/vimarsa`

Checklist:

- [ ] Before edits, inspect existing S5, Nara, Gnosis, gate parity, and agent invocation tests; update stale path or mock-only tests before implementation.
- [ ] Inventory `vendors/autoresearch`, `Body/S/S5/plugins/epi-logos*`, S5 specs, M4/M5 docs, and current S0 mirrors.
- [x] Define review inbox persistence shape matching `s_5_review_inbox_item` and `s_5_review_resolution`.
- [x] Define first Epii inbox origin model: `human_gate`, `anima`, `aletheia`, and `autoresearch`; later passes must add richer Nara/Gnosis/Graphiti/compiler diagnostic origin detail.
- [x] Implement review state transitions: open, deferred, resolved.
- [x] Implement decisions: approve, reject, revise, defer.
- [x] Add gateway handoff path for Anima/Aletheia to submit review items via `s5'.review.submit`.
- [x] Preserve human validation when `requires_human` is true: agent actors may defer but cannot approve/reject/revise human-gated items.
- [x] Define autoresearch run shape: baseline, challenger, evaluation, decision, promotion destination.
- [x] Define first evaluation evidence shape: named dimension, baseline score, challenger score, weight, notes, and source references with `kind`, `uri`, optional coordinate, and optional summary. Later passes must add richer graph/Redis/Graphiti context, reviewer position, pass/fail criteria, and uncertainty fields.
- [x] Implement keep/discard/dry-run-promote state transitions.
- [x] Route accepted dry-run promotions through S1' compiler law.
- [x] Require an approved Epii review resolution before the gateway returns a dry-run promotion plan.
- [x] Ensure promotions are dry-run first and never mutate `Idea/` or live Neo4j without explicit accepted review state.
- [x] Make Epii able to query review and improvement status through an agent-access layer.
- [x] Make Epii able to query Gnosis, Nara, and Graphiti usage/status through the same gateway-backed agent-access surface.
- [x] Add S5 gateway parity records/routes for `s5'.review.*` as implemented/native.
- [x] Add S5 gateway parity records/routes for `s5'.improve.*` as implemented/native.
- [x] Add S5 gateway parity records/routes for `s5'.epii.*` as implemented/native.
- [x] Bind epi-logos plugin resources/skills as the planned S5/S5' resource spine: canonical local scaffold lives at `Body/S/S5/plugins/epi-logos`, with manifest, `epi-knowing` skill, QV resources, and S0 plugin discovery coverage.
- [x] Specify Epii as a distinct PI-agent embodiment with bounded authority in `Body/S/S5/epii-agent/agent-contract.json`, not as an Anima subagent.
- [x] Define first Epii -> Anima request shape for bounded implementation, dispatch, validation, and runtime action.

Verification:

- [x] Module-level review state-machine tests: `cargo test --manifest-path Body/S/S5/epii-review-core/Cargo.toml --test review_inbox`
- [x] Module-level autoresearch state-machine tests: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --test improvement_loop`
- [x] Gateway/API access test for Anima/Aletheia -> Epii inbox handoff: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_review`
- [x] Gateway-backed agent access test for Anima/Aletheia -> Epii review/autoresearch deposits: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_agent_access`
- [ ] Full installed PI runtime invocation test for Anima/Aletheia -> Epii inbox handoff.
- [ ] Agent invocation/access test for Epii -> Anima bounded dispatch request.
- [x] Human-gated review test proving state transitions without automating judgement.
- [x] Promotion test proving accepted output routes through S1' compiler/residency law in dry-run mode: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --test improvement_loop`
- [x] Epii agent/plugin contract proof: `python3 -m unittest Body/S/S5/tests/test_epii_agent_contract.py`
- [x] S0 plugin discovery proof for S5 epi-logos resource spine: `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s5-plugin cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test agent_plugins plugin_discovery_lists_s5_epi_logos_resource_spine`
- [x] Direct plugin validation proof: `CARGO_TARGET_DIR=/tmp/epi-cargo-target-s5-plugin cargo run --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml -- agent plugin validate Body/S/S5/plugins/epi-logos --json`
- [x] Gateway promotion test proving approved Epii review state is required before dry-run promotion: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_improve`
- [x] S0 parity test proving `s5'.review.*` is no longer a missing target.
- [x] S0 parity test proving `s5'.improve.*` is no longer only a missing target: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`
- [x] S0 parity test proving `s5'.epii.*` is native: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_parity_manifest`
- [x] Read-only live substrate proof: Epii can see Gnosis local-store/Neo4j config, Nara status, and Graphiti runtime status without destructive graph/cache operations.
- [x] Contract-level Epii agent embodiment proof: `python3 -m unittest discover -s Body/S/S5/tests`

Exit condition:

- Epii has a real inbox and improvement loop, and S5' is no longer only an API/TS spec.

## Phase 7. S5 World-Return Services

Goal: stabilize [[S5]] services and make them usable by Epii without conflating storage substrate, temporal runtime, and reflective meaning.

Files/code areas:

- `Body/S/S5/epi-gnostic`
- `Body/S/S0/epi-cli/src/techne/gnosis`
- `Body/S/S0/epi-cli/src/nara`
- `Body/S/S0/epi-cli/src/vimarsa`
- `Body/S/S0/epi-cli/src/book`
- `Body/S/S0/epi-cli/src/notebook`
- `Body/S/S0/epi-lib`

Checklist:

- [x] Confirm Gnosis/RAG-Anything uses S2 substrate but remains S5 world-return service: `query_local_report` and `s5'.epii.status` now expose `coordinate=S5`, `storage_substrate=S2`, and `governance_owner=S5'`.
- [ ] Decide `epi gnostic` vs `epi techne gnosis` alias/promotion.
- [ ] Decide `epi kbase` vs `epi vimarsa` command status.
- [ ] Keep Nara as M4/PASU operator surface under S5/M integration.
- [ ] Make Graphiti usage/search/arc governance consume S3' runtime rather than own runtime architecture.
- [x] Add raw service proof for Gnosis ingestion/query where dependencies are available: deterministic local-store ingestion/query proof remains in `gnosis_commands.rs`, and the Python package smoke subset passes without live Neo4j/Gemini.
- [x] Add module-level source selection/disclosure tests: `gnosis_query_report_proves_s5_world_return_over_s2_substrate` proves notebook/source-type filtering and source-summary disclosure over real local ingested documents.
- [x] Add Epii access proof for review/autoresearch surfaces.
- [x] Add Epii access proof for Gnosis, Nara, and Graphiti usage/status surfaces: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_agent_access`

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gnosis_commands`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_e2e_smoke`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_oracle_payload`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_identity_contract`
- [ ] Run `Body/S/S5/epi-gnostic` full Python tests with the package's configured test runner once the Body-native Python environment is repaired. Current checked-in `.venv` has stale root-path shebangs, and system Python collection is blocked by an x86_64 NumPy wheel on arm64; the non-NumPy smoke subset passes.
- [ ] Run `Body/S/S0/epi-lib` C tests/build command once active build command is confirmed.

Exit condition:

- S5 services are real, S5' governs their meaning/use, and Epii can access the relevant surfaces.

## Phase 8. S0 Full-Stack Return Proof

Goal: make [[S0]] prove the full circuit with `epi up` or an equivalent command.

Why last: S0 is first and last. It should report the actual state of the system after the architecture has returned to executable form.

Files/code areas:

- `Body/S/S0/epi-cli/src/up.rs`
- `Body/S/S0/epi-cli/src/main.rs`
- `Body/S/S0/epi-cli/tests/up_command.rs`
- The parity manifest from Phase 1

Checklist:

- [ ] Report S1' compiler readiness.
- [ ] Report S2 graph/cache readiness.
- [ ] Report S3 gateway/session/temporal readiness.
- [ ] Report S4 agent invocation/access readiness.
- [ ] Report S5 Gnosis/Nara/world-return readiness.
- [ ] Report S5' review/autoresearch readiness.
- [ ] Map output to envelope/API/TS fields where applicable.
- [ ] Ensure failures correspond to real missing service/module/contract state, not mocked flags.
- [ ] Add a full-stack proof test that checks both success and meaningful failure paths.

Verification:

- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test up_command`
- [ ] Run the smallest real local `epi up` proof command available after implementation.
- [ ] Run targeted tests from phases touched by the final integration.

Exit condition:

- One S0 command can report the status of every S/S' layer, and its output is contractually tied to the envelope/API/TS architecture.

## Phase 9. S0' Portal / TUI Command Centre

Goal: make `epi portal` the first integrated operator surface for the whole command/config/readiness topology.

Why here: the portal is where UX and backend setup meet. Before the desktop app mirrors the system externally, the TUI should already expose the real S0-S5 command surfaces, settings, service health, agent access state, and review/governance status in one coordinate-native terminal portal.

Target three-panel topology:

- Left `0` panel: [[M0']] / [[M1']] / [[M2']] / [[M3']] structural clock, coordinate walk, Khora/Aletheia temporal-relational views.
- Centre `/` panel: [[S0']] command return, setup, config, readiness, gateway/API method palette, service health, parity map, and typed execution routes across [[S0]]-[[S5]].
- Right `1` panel: [[M4']] / [[M5']] Nara/Epii, review inbox, Gnosis/world-return, autoresearch, and user/developer position.

Shared M' spec anchors:

- [[M'-PORTAL-SPEC]] defines the shared TUI/desktop `0` / `/` / `1` grammar.
- [[M'-TAURI-PORT-SPEC]] defines the Tauri v2 desktop port target. The current Electron [[OmniPanel]] is the desktop `/` surface and must preserve its wider usage: chat, sessions, skills, models, cron, config, logs, debug, nodes/devices, channels, and gateway settings.
- The M' desktop target is full-domain, not just three panels: [[M0']] Bimba map, [[M1']] relation-walks, [[M2']] semantic/MEF/correspondence matrix, [[M3']] integrated clock/solar/kairos platform, [[M4']] Nara modalities, and [[M5']] Epii workbench.
- Current Electron Nara code is the M4' parity seed for journal/flow, selected-text highlighting, Daily Note, Dream Journal, Oracle, highlights, and pending actions. Placeholder modality panels must become real surfaces during porting.
- The M5' desktop target must include pedagogy, etymological archaeology, Bimba/wisdom exploration, autoresearch, review inbox, and VAK/Anima/Epi execution with typed routing, bounded tools/skills, run tree, diagnostics, and completion evidence.
- For the desktop app, `0` is the structural [[Bimba]] map entry with routes into M1'-M3'; the clock is an M3' structural visualisation, not the whole `0` surface.

Shared temporal-state rule: the portal must treat [[DAY]], [[NOW]], vault root, [[Kairos]], [[Redis]] temporal key state, [[SpaceTimeDB]] projection tables/source, and protected [[Pratibimba]] anchor as one [[S3']] projection consumed by both sides of the TUI. The structural clock reads this projection as M0'-M3' timing/orientation. [[Nara]] and [[Epii]] read the same projection as M4'/M5' personal context, review/inbox context, and agent invocation orientation. Plugin-specific vault or Kairos resolution is transitional only; the durable contract is a shared portal runtime state fed by configured SpaceTimeDB projection reads, falling back to the local gateway session-store temporal context and then clock/session state, with native SpaceTimeDB subscription and the Tauri mirror feeding the same shape.

Files/code areas:

- `Body/S/S0/epi-cli/src/portal/`
- `Body/S/S0/epi-cli/src/portal/plugins/unified_clock.rs`
- `Body/S/S0/epi-cli/src/portal/registry.rs`
- `Body/S/S0/epi-cli/src/portal/persist.rs`
- `Body/S/S0/epi-cli/src/gate/config_tui.rs`
- `Body/S/S0/epi-cli/src/up.rs`
- Gateway parity manifest and method registry tests
- Relevant S2/S3/S4/S5 readiness and agent-access tests

Checklist:

- [x] Define the centre `/` panel contract as S0' command topology, not a new product ontology.
- [x] Add first portal layout/plugin state so the TUI can represent the centre `/` command/config domain without breaking existing M0-M5 plugins.
- [x] Source first command entries from explicit CLI/gateway/config command intents in the shared topology model.
- [x] Replace the static slash-only backing list with a provider-backed portal surface registry over topology seeds, gateway parity records, extension tools, plugin package manifests, Epii agent contract methods, Pleroma capability gates, and registered TUI plugin IDs.
- [x] Add shared portal runtime state so DAY/NOW/vault/Kairos/Redis/SpaceTimeDB/Pratibimba projection can feed both the clock and Nara/Epii sides instead of remaining clock-plugin-local.
- [x] Hydrate the shared portal temporal projection from the same local gateway session-store context used by `s3'.temporal.context`, with clock/session fallback when no gateway session exists.
- [x] Hydrate the shared portal temporal projection from configured SpaceTimeDB `session_surface` / `kairos_surface` reads before falling back to local gateway context.
- [x] Wire `/`, `m4.pratibimba`, and `m5.chat` to consume the shared temporal projection.
- [ ] Surface setup/readiness paths: graph Docker state, Neo4j, Redis, gateway, Graphiti runtime, PI agent install/sync, Gnosis, Nara, Epii review/autoresearch.
- [x] Separate raw service health from agent invocation/access state in the topology model.
- [x] Separate raw service health from agent invocation/access state in the live UI result state for Neo4j, Redis cache, gateway, SpaceTimeDB registration/subscription, Graphiti runtime, PI agent access, Gnosis, Nara, Epii review, and autoresearch.
- [x] Add first editable settings metadata for S3 gateway config fields.
- [ ] Add schema-backed settings views for S2 graph/cache, S3 gateway/session, S4 agent permissions/capabilities, and S5/Epii/Gnosis/autoresearch.
- [ ] Add command execution result state with meaningful failure display, logs, and next-step affordances.
- [ ] Ensure the future desktop app can mirror the TUI's command/config semantics instead of inventing a parallel settings model.
- [x] Specify the Tauri v2 desktop migration against the current `Body/S/S3/epi-app` state in [[M'-TAURI-PORT-SPEC]]: preserve the React/M-domain renderer and [[OmniPanel]] where useful, replace Electron main-process authority with Rust Tauri commands, use gateway RPC plus SpaceTimeDB subscriptions for live state, and mirror the shared [[M'-PORTAL-SPEC]] `0` / `/` / `1` grammar.
- [x] Extend M' desktop specification with full M0'-M5' domain mapping, current Electron Nara parity sources, old canonical Epii/VAK/Nara source traceability, agentic execution, inbox, and integrated clock-platform requirements.
- [ ] Implement the Tauri v2 port after Phase 3A session parity is corrected, including typed renderer clients replacing `window.sPrime` preload assumptions.
- [ ] Replace Nara raw slash-string sendoff with typed VAK/Anima/Epii invocation payloads that preserve selected text, modality, source file, DAY/NOW, session, and coordinate lineage.
- [ ] Build real M4' modality surfaces for Daily Note, Dream Journal, and Oracle over the same flow/highlight/session substrate.
- [ ] Build the M5' Epii workbench surface for pedagogy, etymological archaeology, Bimba/wisdom exploration, autoresearch, review inbox, and agentic execution.
- [ ] Build the desktop M3' integrated clock platform as a visual enlargement of the TUI clock/Kairos specs, routeable from M0' structural exploration and into Nara walkabouts.

Verification:

- [x] Portal topology tests prove the three-domain `0` / `/` / `1` model and slash command-surface catalog.
- [x] Portal topology tests prove interactive action kinds, editable config metadata, and S/S' plus M/M' coordinate catalogs.
- [x] Portal surface registry tests prove gateway parity, extension `tools.json`, `.claude-plugin` manifests, Epii agent contract methods, Pleroma capability gates, and registered TUI plugin IDs are discoverable without TUI-specific duplication.
- [x] Portal runtime tests prove gateway temporal context hydration, local session-store temporal refresh, and Nara/Epii plugin consumption of the shared projection.
- [ ] Portal layout/state tests prove the rendered three-panel domain model.
- [ ] Config/settings tests prove schema-backed values are read/written through existing config authority.
- [ ] Command palette tests prove entries map to real CLI/gateway methods.
- [x] Readiness tests prove service checks and agent-access checks are reported separately.
- [x] Session/Khora tests prove explicit `EPILOGOS_VAULT` roots are authoritative before the directory exists, preventing NOW path fallback drift.
- [ ] Manual TUI smoke with real local services once the panel is implemented.
- [x] Current app checkup baseline: `npm run typecheck` in `Body/S/S3/epi-app` exits cleanly before Tauri v2 spec work.

Exit condition:

- `epi portal` gives an operator a coordinate-native terminal cockpit for setup, command execution, settings, readiness, Nara/Epii surfaces, and S0-S5 status without forking backend command logic.

## Development Readiness Gates

- [ ] Phase 1 parity manifest is executable and tested.
- [x] S2 graph schema/services are Body-native or extraction is test-guarded with explicit remaining steps.
- [ ] S3 gateway/redis-context/graphiti-runtime are Body-native or extraction is test-guarded with explicit remaining steps.
- [x] S1' compiler spine has real file/schema tests and is reachable before vault writes.
- [ ] S4 agent invocation/access tests distinguish raw service checks from actual PI-agent runtime access.
- [x] S5' review/autoresearch spine has state-machine, human-gated, and gateway-backed agent-access tests.
- [x] S5 Gnosis/Nara/Epii tests distinguish raw client/service behavior from gateway-backed Epii observation/governance.
- [ ] S0' portal/TUI has a real three-panel command/config/readiness contract over existing CLI/gateway/service truth.
- [ ] `epi up` or equivalent full-stack proof has a real failure/success contract.
- [ ] Final non-negotiable cleanup/harmonisation gate, only after all other build tasks: run full depwire dead-symbol resolution and full `.worktrees/*` harvest/retire cleanup as one terminal step, then review [[FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX]] for agent/tool/skill compatibility implications before Tauri execution. Deletions, moves, and parity-driven changes must be proven by tests and git history clean.

## Preferred Next Run

Continue the current spine progression:

1. Extract the live S3 gateway server/runtime adapter body next, using `Body/S/S3/gateway` as the session/session-scope authority and keeping S0 as CLI/bootstrap mirror.
2. Complete the S2 graph command/service extraction for seed/sync/retrieval APIs: S2 owns graph service law, S0 owns command presentation, and destructive live Neo4j tests require an explicit seed/migration run.
3. Extract/demote the current Graphiti HTTP wrapper into the planned S3 graphiti-runtime shape while preserving S5/S5' invocation/search/arc governance.
4. Mirror the native SpaceTimeDB projection reader in the future desktop/Tauri client, using the same TUI portal registry and gateway/SpaceTimeDB contracts.
5. Continue Phase 9 readiness work by making Neo4j, Redis, gateway, SpaceTimeDB, Graphiti runtime, PI-agent access, Gnosis, Nara, Epii review, and autoresearch render as distinct raw-service vs agent-access states in the live UI result state.
6. After the S2/S3 extraction/readiness work is complete, run the terminal cleanup/harmonisation gate: depwire dead-symbol resolution, `.worktrees/*` harvest/retire, and Hermes parity matrix review via [[FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX]] before Tauri implementation begins.

Do not start non-dry-run Epii/autoresearch mutation until S1' compiler invocation, Anima/Pleroma capability boundaries, and Epii review gates are testable.
