---
coordinate: "S/S'"
c_4_artifact_role: "roadmap"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[S-CODE-RESIDENCY-AUDIT]]"
  - "[[S-CODE-RESIDENCY-PLAN]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
---

# S/S' Build Readiness Roadmap

## Status

This roadmap supersedes the earlier pre-move roadmap. The first Body-native package move has happened. Active source roots now live under `Body/`; root package shims such as `epi-cli`, `epi-lib`, `epi-app`, `bimba-mcp`, `epi-gnostic`, `.pi`, and `plugins` are no longer source authorities.

The current work is no longer "decide whether to move code." The current work is to make the post-move system buildable from the specs, with correct module boundaries, correct contracts, and tests that prove real behavior.

Canonical orientation:

- [[Idea]] is the vault/spec/reflection plane.
- [[Body]] is the source-code embodiment plane.
- `.epi`, `.codex`, `.omx`, local caches, and future `Run/` are runtime/tool planes.
- [[S0]] remains the executable return surface, even when S2, S3, S4, or S5 code is still physically inside the S0 CLI package.

## Build Aim

The aim is full S/S' build-out across the board. Agents should be able to implement directly from the S specs without guessing which layer owns a fact, which API method carries it, which envelope field persists it, or which test proves it.

The build must prioritize architectural solidity over preserving old code shape. Existing code is valuable evidence and often a useful implementation basis, but it is not authority when it conflicts with the locked S/S' architecture.

## Ground Documents

- [[S-SYSTEM-INDEX]] - cross-level system image and harmonisation map.
- [[S-CODE-RESIDENCY-AUDIT]] - current code foundation and drift map.
- [[S-CODE-RESIDENCY-PLAN]] - Body/source, Idea/vault, runtime/tool residency law.
- [[S-SHARDING-TASK-LIST]] - current execution queue.
- [[S0-SHARD-INDEX]] through [[S5-SHARD-INDEX]] - implementation seed maps per level.
- [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] - 12-layer envelope and compiler spine mapping.
- [[FLOW 2026 04 24 PI AGENT API v0.1]] - coordinate-native API target.
- [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] - shared typed contract.

## Core Build Principle

The base S levels own raw connectivity, client services, storage, runtime, and domain bodies. The prime S' levels own the protocols, laws, interpretation, and governance that make those bodies coordinate-native.

| Level | Base body | Prime protocol |
|---|---|---|
| [[S0]] | CLI, shell, process, command execution, test harness | [[S0']] tool resolution, bootstrap law, command topology, return proof |
| [[S1]] | vault files, artifacts, templates, filesystem residency | [[S1']] compiler, frontmatter, CT, residency, graduation |
| [[S2]] | Neo4j, Redis graph cache, embeddings, GraphRAG clients | [[S2']] graph law, retrieval, rerank, enrichment, coordinate resolution |
| [[S3]] | gateway, WebSocket, sessions, app bridge, presence | [[S3']] Day/NOW/Kairos, temporal context, Redis session context, Graphiti runtime protocol |
| [[S4]] | PI agent runtime, providers, auth, skills, teams | [[S4']] Anima, VAK, Psyche, permission, constitutional dispatch |
| [[S5]] | Gnosis, RAG-Anything, Nara, Vimarsa, epi-logos plugin bodies | [[S5']] Epii, review inbox, autoresearch, MEF/QL governance, promotion |

This distinction must drive code layout, API naming, envelope field homes, and tests.

## The Two Spine-Bearing PI Agents

The build should now be steered by two actual PI-agent embodiments rather than by abstract subsystem names.

| PI agent | Coordinate | Spine mode | Primary package body | Primary relation |
|---|---|---|---|---|
| [[Anima]] | [[S4]] / [[S4']] | Dispatch spine | [[Pleroma]] / ta-onta VAK plugin body | Invokes bounded S-layer capabilities for execution and deposits review/validation products to [[Epii]] |
| [[Epii]] | [[S5]] / [[S5']] | Return spine | [[epi-logos plugin]] plus [[autoresearch]] | Receives review, governs meaning/improvement, and invokes [[Anima]] for dispatch/implementation |

Both agents use the same four-seam spine grammar inherited from the compiler vendor pattern:

1. hook / invocation event
2. append-safe ledger or canonical source
3. compile / enrich / evaluate
4. inject / query / review / return

But they receive different capabilities, tools, skills, and permission envelopes. [[Anima]] is allowed to act, route, compose teams, and execute bounded workflows. [[Epii]] is allowed to review, research, explain, govern promotion, and improve the system. Cross-agent calls should be typed requests, not shared ambient authority.

They do not own separate copies of the substrate services. [[Pleroma]] and the planned [[epi-logos plugin]] are parallel capability membranes over the same S-layer service field: [[S1']] compiler law, [[S2]] graph/embedding substrate, [[S3]] gateway/session/temporal runtime, [[S3']] Graphiti temporal architecture, [[S5]] Gnosis/Nara/world-return services, and [[S5']] review/autoresearch governance. [[ta-onta]] plugs [[Anima]] into these services for dispatch and execution; [[Epii]] plugs into the same services for review, interpretation, research, promotion, and return. The difference is not which services exist, but which agent may invoke which capability, under which coordinate method, with which review gate.

This makes the testing distinction sharper:

- service automation proves a substrate can run,
- agent invocation proves [[Anima]] or [[Epii]] can use it,
- human-gated review proves the system can route judgement without pretending to automate judgement itself.

## The Two System Spines

### [[S1']] Compiler Spine

The compiler spine is the artifact/residency/schema spine. It turns envelope facts, frontmatter law, CT types, source coordinates, graduation paths, and vault placements into executable constraints.

Its build purpose:

- Establish [[Hen]] / [[S1']] as authority for frontmatter, CT, residency, and graduation.
- Compile envelope layers into typed ledger channels, compiler passes, and return types.
- Ensure every artifact can be born, validated, placed, promoted, and linked without ad hoc per-agent rules.

This spine is meaningful only through the actual [[S4]] PI agent runtime and [[S4']] ta-onta inhabitation. The compiler spine must be accessible to the agents that write, review, and promote artifacts. The canonical compiler invocation should therefore be backend-aware: `pi_agent` is the target executor, while the vendor [[Claude Agent SDK]] path is a compatibility backend for Claude Code style sessions. The canonical contract home is Rust: `Body/S/S1/hen-compiler-core`. The Python vendor/compiler files remain useful compatibility and enrichment-backend material, but they do not own S1' law.

In practice [[Hen]] defines source paths, target residency, ledger channel, CT/frontmatter law, expected artifact contract, and review requirements. The current Rust contract now validates compiled artifact frontmatter against the residency plan and invocation kind, so an output can prove it came from the Day/T-lane/agent contract that claims it. [[Anima]] or [[Epii]] then performs or requests the enrichment through its bounded tools/skills. Hen remains the law; the agent runtime performs the work.

### [[S5']] Autoresearch / Epii Spine

The autoresearch spine is Epii's reflective self-improvement spine. It observes outputs, receives review gates, compares baseline and challenger artifacts, governs promotion decisions, and turns system output back into system development.

Its build purpose:

- Scaffold [[Epii]] as the S5' user-position and developer portal.
- Bind [[autoresearch]] to real improvement loops, not ambient background automation.
- Route human validation gates and [[Anima]] / [[Aletheia]] work products into an Epii-accessible review inbox.
- Promote accepted improvements through [[S1']] compiler law.

This spine is meaningful only through actual [[S5]] / [[S5']] agent access. It is not just a vendor folder or script runner. It needs a real PI-agent invocation/access architecture. [[autoresearch]] supplies the keep/discard/challenger/evaluation discipline; [[Epii]] supplies the user-position, review authority, QL/MEF interpretation, and promotion law.

The [[epi-logos plugin]] is the planned resource and skill body for this agent. It should hold the philosophy, [[Nara]] / [[Epii]] workflows, M' affordances, pedagogical surfaces, and knowledge resources that autoresearch can evaluate and improve.

## Current Built State

Built enough to serve as substrate:

- `Body/S/S0/epi-cli` exists and builds as the S0 command return surface.
- `Body/S/S0/epi-lib` exists as the M-family C engine foundation.
- `Body/S/S1/hen-compiler-core` exists as the canonical Rust S1' compiler contract crate, and `Body/S/S1/hen-compiler` remains the compiler-vendor compatibility basis.
- `Body/S/S2/external/bimba-mcp` exists as the S2' external graph interface.
- `Body/S/S3/epi-app` and `Body/S/S3/epi-spacetime-module` exist.
- `Body/S/S4/pi-agent`, `Body/S/S4/ta-onta`, and `Body/S/S4/plugins/pleroma` exist as S4/S4' source and package surfaces.
- `Body/S/S4/plugins/pleroma/capability-matrix.json` now gives the first machine-checkable Anima capability membrane: constitutional agents, real skill files, hooks, Anima authority, and Epii handoff boundaries.
- `Body/S/S5/epi-gnostic` exists with real [[RAG-Anything]], [[LightRAG]], [[Neo4j]], embeddings, and temporary [[Graphiti]] wrapper code.
- `Body/S/S5/epii-agent/agent-contract.json` now gives the first machine-checkable Epii PI-agent contract: epi-logos resource target, autoresearch spine, review inbox spine, accepted Anima deposits, and bounded Epii -> Anima requests.
- [[Gnosis]] now exposes a first source-selection/disclosure report over real local ingested documents, explicitly marking itself as [[S5]] world-return over [[S2]] storage substrate with [[S5']] governance. `s5'.epii.status` carries the same S5/S2/S5' service contract for Epii observation.
- The S/S' specs, shard indexes, and source traceability indexes exist.

Not yet built in the right way:

- [[S2]] graph schema/services are still physically hidden inside `Body/S/S0/epi-cli/src/graph` and S5 Gnosis support files.
- [[S3]] gateway/runtime is still physically hidden inside `Body/S/S0/epi-cli/src/gate`.
- [[S3']] Redis temporal context is not yet separated from S2 graph/cache Redis.
- [[Graphiti]] still has sidecar/wrapper compatibility paths; target is S3' library/runtime integration with S5/S5' usage governance.
- [[S1']] compiler spine has a first canonical Rust dry-run `CompilerInvocation` contract and S0 parity hook, but it is not yet the enforced schema authority across frontmatter, envelope, API, and code.
- [[S5']] Epii/autoresearch spine now has durable review inbox state, autoresearch run state, gateway routes, first Epii agent-access state, read-only world-return observation, source-referenced evaluation evidence, and accepted-review gating before dry-run promotion planning. Full installed PI-agent invocation and non-dry-run promotion remain unbuilt.
- [[Envelope]], [[API]], and [[TypeScript]] contracts are not fully harmonised with current locked decisions.

## First Build Priority

Harmonise [[Envelope]], [[API]], and [[TypeScript]] first.

Reason: module extraction before contract harmonisation would only move ambiguity into cleaner folders. The contract must say what facts exist, who owns them, how agents access them, which envelope fields carry them, and which tests prove them.

This harmonisation must not be abstract. It must be tied to:

- Actual [[S4]] PI agent invocation/access.
- Actual [[S5]] / [[S5']] Epii review/autoresearch access.
- Actual gateway routing or explicit product-to-coordinate parity.
- Actual service/client raw checks for Neo4j, Redis, gateway, Graphiti runtime, Gnosis, and compiler/vault paths.

## Contract Harmonisation Targets

### Envelope Corrections

- Move live temporal/session/context Redis authority to [[S3']] fields.
- Keep S2 Redis fields only for graph semantic cache, RedisVL, and graph-context substrate.
- Move [[Graphiti]] architecture/runtime handles to [[S3']] where they describe temporal episodic runtime.
- Keep [[Graphiti]] search, arc policy, disclosure, and reflective meaning under [[S5]] / [[S5']].
- Add or confirm review inbox fields for Epii-accessible human validation and meaning review.
- Add or confirm autoresearch/improvement fields as [[S5']] cold/deep-work fields.
- Ensure compiler spine mapping names [[S1']] ledger channel, compiler pass, and return type for every layer.

### API Corrections

- Build coordinate-native parity for `s0.*` through `s5'.*`.
- Preserve product/RPC gateway methods only through an explicit parity map.
- Add or promote `s5'.review.*` methods.
- Add or promote `s5'.improve.*` / autoresearch methods.
- Add or promote `s4'.psyche.*` and `s4'.permission.*`.
- Clarify `s5.gnosis.*`, `s5.episodic.*`, `s5.m.*`, and `s5'.ql.*`.

### TypeScript Corrections

- Ensure request/response types exist for all accepted methods.
- Ensure envelope field types exist for every durable/routed/reviewed/promoted fact.
- Keep the TS package as the executable schema target for agents and gateway clients.
- Prefer deletion or explicit historical marking over preserving stale types.

## Modular Refactor Targets

### [[S2]] Graph Modules

Create or prepare:

- `Body/S/S2/graph-schema`
- `Body/S/S2/graph-services`

Move toward:

- `:Bimba` label authority.
- 3072-dim embedding authority.
- Migration compatibility for `:BimbaNode`, `:BimbaCoordinate`, `bimbaCoordinate`, and old `#` syntax into the [[M]] branch.
- Neo4j client and schema tests.
- Redis graph semantic cache and RedisVL tests.
- GraphRAG retrieval tests with real behavior where services are available.

`epi graph` remains the S0 command mirror. It should call S2 services, not define S2 authority.

### [[S3]] Runtime Modules

Create or prepare:

- `Body/S/S3/gateway`
- `Body/S/S3/redis-context`
- `Body/S/S3/graphiti-runtime`

Move toward:

- Gateway product-to-coordinate parity manifest.
- Session, channel, temporal context, presence, and app bridge tests.
- Redis temporal/session context separated from S2 graph cache.
- Graphiti as library/runtime adapter, with any HTTP wrapper demoted to compatibility.

`epi gate` remains the S0 command mirror. It should call S3 services, not define S3 authority.

### [[S4]] Agent Access Modules

Clarify:

- Actual PI agent invocation/access architecture.
- `Body/S/S4/pi-agent` source to `.epi/agents/<id>/agent` runtime sync.
- [[ta-onta]] as S4' API/base surface.
- [[Anima]] VAK gate, [[Psyche]] state, permission boundary, teams, skills, and constitutional dispatch.

Testing must distinguish:

- raw CLI/service checks,
- agent runtime sync/install checks,
- actual PI/agent invocation/access checks,
- human review gates that cannot be fully automated.

### [[S5]] / [[S5']] Agent and World-Return Modules

Create or prepare:

- `Body/S/S5/plugins/epi-logos`
- `Body/S/S5/autoresearch`
- eventual Epii PI-agent source/capability package

Move toward:

- [[Epii]] as review recipient and developer/reflection portal.
- [[Nara]] as M4/PASU evolution surface.
- [[Gnosis]] / [[RAG-Anything]] as real world-return corpus service over S2 substrate.
- [[Graphiti]] invocation/search/arc governance over S3' temporal runtime.
- Autoresearch loops with baseline/challenger/evaluation/promotion tests.

## Testing Architecture

Testing must be layered. Not everything should be tested through an agent, and not everything can be reduced to raw service checks.

### Raw Connectivity / Service Tests

Use for:

- Neo4j connection, schema, indexes, seed, query.
- Redis ping, namespace, cache set/get, RedisVL where available.
- Gateway connect/session/method manifest.
- Graphiti runtime adapter health/library behavior.
- Gnosis ingestion/query over real local services where possible.
- Compiler/frontmatter validation over real files.

These tests prove clients and services work.

### Module-Level Contract Tests

Use for:

- S2 graph schema and retrieval law.
- S3 temporal/session context rules.
- S4 VAK/Psyche/permission transitions.
- S5 review/autoresearch state machines.
- Envelope/API/TS type conformance.

These tests prove the module obeys its coordinate contract.

### Agent Invocation / Access Tests

Use for:

- PI source sync into `.epi`.
- Agent capability registration.
- VAK gate and constitutional routing.
- Epii review inbox access.
- Anima/Aletheia to Epii handoff.
- Autoresearch invocation through Epii capability.

These tests prove the system can be inhabited by the actual agents.

### Human-Gated Review Tests

Use for:

- Human validation thresholds.
- Review inbox item creation and resolution.
- Approval/denial consequences.
- Promotion decisions where user validation is required.

Automation should prove state transitions and persistence. It should not pretend to replace human judgement.

### Full-Stack Proof Tests

Use for:

- `epi up` readiness report.
- Gateway plus agent plus graph plus vault path smoke.
- One real round trip from request to envelope fields to review/promotion artifact.

These tests prove the circuit returns to S0.

## Development Rules

- Contract harmonisation precedes modular extraction.
- Modular extraction precedes broad feature work.
- Old code is guidance, not authority.
- Right design outranks compatibility when the two conflict, but compatibility debt must be named.
- No mock-only proof for production-facing behavior.
- No conflation of S2 graph/cache Redis with S3' temporal/session Redis.
- No conflation of [[Aletheia]] with [[Epii]].
- No preservation of [[Graphiti]] sidecar architecture as canonical.
- No command-nesting ontology: CLI mirrors coordinate ownership but does not decide it.

## Build Execution Order

1. Harmonise [[Envelope]], [[API]], and [[TypeScript]] against locked S/S' decisions.
2. Build global API/CLI/envelope parity matrix.
3. Establish [[S1']] compiler spine contracts and tests.
4. Establish [[S5']] review/autoresearch/Epii contracts and tests.
5. Extract [[S2]] graph schema/services from S0 package residency.
6. Extract [[S3]] gateway/redis-context/graphiti-runtime from S0 package residency.
7. Stabilise [[S4]] agent invocation/access architecture.
8. Stabilise [[S5]] Gnosis/Nara/Epii world-return architecture.
9. Return to [[S0]] with `epi up` as full-stack build proof.

## Handoff Reading Order

A fresh build session should read:

1. [[S-SYSTEM-INDEX]]
2. this roadmap
3. [[S-SHARDING-TASK-LIST]]
4. [[S-CODE-RESIDENCY-AUDIT]]
5. [[S-CODE-RESIDENCY-PLAN]]
6. [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]
7. [[FLOW 2026 04 24 PI AGENT API v0.1]]
8. [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]
9. the relevant [[Sx-SHARD-INDEX]]

Then it should work the task list in order, with real tests at every layer.
