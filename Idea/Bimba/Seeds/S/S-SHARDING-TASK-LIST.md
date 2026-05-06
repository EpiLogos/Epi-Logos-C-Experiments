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

Status: service contract boundary advanced. `Body/S/S2/graph-schema` owns the S2 graph schema contract, and `Body/S/S2/graph-services` owns Neo4j primary graph role plus Redis semantic-cache role/config/payload/health/client contracts. S0 graph code imports/re-exports these S2 contracts. Live Neo4j client/retrieval extraction remains next.

Live Docker note: `docker compose -f docker-compose.epi-s2.yml up -d neo4j redis` starts existing stateful containers with named volumes. On 2026-05-02, read-only checks showed Redis healthy with `epi_semantic_cache` and `epi_semantic_cache_test` indexes, Neo4j healthy with 96 legacy `:BimbaCoordinate` nodes and zero canonical `:Bimba` nodes. Do not run destructive ignored graph tests until migration/backup policy is explicit.

Goal: make [[S2]] graph authority Body-native while preserving `epi graph` as the S0 command mirror.

Why now: S2 is a real foundation, but its authority is hidden in `Body/S/S0/epi-cli/src/graph`. Moving it clarifies Neo4j, Redis graph cache, 3072 embeddings, GraphRAG, and external MCP boundaries.

Files/code areas:

- Source: `Body/S/S0/epi-cli/src/graph/`
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
- [x] Mark `:BimbaNode`, `:BimbaCoordinate`, `bimbaCoordinate`, old `#` coordinate syntax, and 768-dim vectors as compatibility/migration concerns.
- [ ] Keep `bimba-mcp` explicitly external-facing and not PI-internal authority.
- [ ] Point S0 CLI graph commands at S2 services instead of defining S2 logic locally.
- [x] Update tests to import/call S2 services where possible.
- [ ] Add or keep raw Neo4j connectivity/schema/index tests.
- [x] Add read-only live Docker health checks for Neo4j/Redis/Redis Stack/semantic cache.
- [x] Add or keep Redis graph semantic cache tests.
- [ ] Add module-level retrieval tests that exercise real retrieval logic.
- [ ] Update [[S-CODE-RESIDENCY-PLAN]] or [[S-SYSTEM-INDEX]] only if actual residency changes require it.

Verification:

- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client test_neo4j_connect_and_health -- --ignored --exact`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_client test_neo4j_run_query -- --ignored --exact`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_commands`
- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_retrieval`
- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_seed`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test redis_cache`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test redis_cache test_redis_connect_and_health -- --ignored --exact`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test semantic_cache_contract`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test semantic_cache_contract semantic_cache_python_bridge_health -- --ignored --exact`

Exit condition:

- S2 schema/service authority is Body-native or extraction is test-guarded with explicit remaining steps, and `epi graph` remains a working mirror.

## Phase 3. S3 Gateway / Redis Context / Graphiti Runtime Extraction

Status: first extraction boundary advanced. `Body/S/S3/gateway-contract` now owns gateway protocol constants, product method names, event names, ports, omnipanel metadata, session record/patch contracts, run/event contracts, chat-run registry, S3 temporal Redis role/key contract, Graphiti runtime constants, Graphiti adapter mode contract, and the S3-runtime/S5-invocation Graphiti separation. S0 gate code re-exports/uses these contracts. Live gateway/server/session-store adapter extraction remains next. S4 invocation tests now also prove real gateway agent RPC and subagent session persistence through the current S0-hosted server/store.

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
- [ ] Keep product-native gateway methods through explicit coordinate parity, not implicit ontology.
- [x] Create or prepare S3 gateway module boundary.
- [x] Create or prepare S3 Redis context boundary distinct from S2 Redis graph semantic cache.
- [x] Move Graphiti runtime adapter target to S3' design language; demote wrapper/sidecar paths to compatibility.
- [ ] Keep S5 invocation/search/arc governance out of S3 runtime code.
- [ ] Add product-to-coordinate parity tests for at least one `s3.*` family and one `s3'.*` family.
- [ ] Add raw gateway connect/session tests after extraction.
- [x] Add module-level Redis temporal context tests.
- [x] Add a Graphiti runtime adapter test that does not assume sidecar architecture.

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_connect_protocol`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_sessions`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_runtime_state`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_method_parity`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_full_parity_contract`
- [ ] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_spacetimedb_bridge`

Exit condition:

- S3 owns gateway/session/temporal context architecture, S0 remains a mirror, and Redis/Graphiti roles are not ambiguous.

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
- [ ] Make `s4.agent.query/notify/status` reachable through gateway parity or explicit CLI mirror.
- [x] Make `s4'.vak.evaluate` and `s4'.orchestrate` callable through gateway-backed Anima/Pleroma access: the first pass returns real Pleroma skill paths, deterministic VAK routing, constitutional agent mapping, and Epii authority boundaries. Full provider-backed PI extension execution remains the later live-worker proof.
- [ ] Persist or expose Psyche state, goal state, and permission boundary.
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

- [ ] Confirm Gnosis/RAG-Anything uses S2 substrate but remains S5 world-return service.
- [ ] Decide `epi gnostic` vs `epi techne gnosis` alias/promotion.
- [ ] Decide `epi kbase` vs `epi vimarsa` command status.
- [ ] Keep Nara as M4/PASU operator surface under S5/M integration.
- [ ] Make Graphiti usage/search/arc governance consume S3' runtime rather than own runtime architecture.
- [ ] Add raw service proof for Gnosis ingestion/query where dependencies are available.
- [ ] Add module-level source selection/disclosure tests.
- [x] Add Epii access proof for review/autoresearch surfaces.
- [x] Add Epii access proof for Gnosis, Nara, and Graphiti usage/status surfaces: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_epii_agent_access`

Verification:

- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gnosis_commands`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_e2e_smoke`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_oracle_payload`
- [x] `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_identity_contract`
- [ ] Run `Body/S/S5/epi-gnostic` Python tests with the package's configured test runner.
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

## Development Readiness Gates

- [ ] Phase 1 parity manifest is executable and tested.
- [ ] S2 graph schema/services are Body-native or extraction is test-guarded with explicit remaining steps.
- [ ] S3 gateway/redis-context/graphiti-runtime are Body-native or extraction is test-guarded with explicit remaining steps.
- [x] S1' compiler spine has real file/schema tests and is reachable before vault writes.
- [ ] S4 agent invocation/access tests distinguish raw service checks from actual PI-agent runtime access.
- [x] S5' review/autoresearch spine has state-machine, human-gated, and gateway-backed agent-access tests.
- [x] S5 Gnosis/Nara/Epii tests distinguish raw client/service behavior from gateway-backed Epii observation/governance.
- [ ] `epi up` or equivalent full-stack proof has a real failure/success contract.

## Preferred Next Run

Continue the current spine progression:

1. Finish the remaining S1 hardening by harmonising thought path helpers with canonical `Pratibimba/Self/Thought/T/Tn` residency and running `vault_commands` against the new Hen mirror.
2. Continue Phase 5 by proving real PI runtime/source-to-installed sync and actual Anima invocation of a bounded Pleroma skill, using the capability matrix as authority.
3. Continue Phase 6 by binding the epi-logos plugin resource/skill spine and adding full installed PI-runtime invocation for Anima/Aletheia -> Epii and Epii -> Anima.

Do not start non-dry-run Epii/autoresearch mutation until S1' compiler invocation, Anima/Pleroma capability boundaries, and Epii review gates are testable.
