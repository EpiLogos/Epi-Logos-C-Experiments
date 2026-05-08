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
- [[FLOW 2026 05 06 SMART ENV HEN LINK CANDIDATE POOL]] - read-only Smart Env suggestion seam for [[Hen]] wikilink selection.
- [[FLOW 2026 05 07 RUST DEPENDENCY COMPATIBILITY]] - Rust 1.89 compatibility override, portal image feature isolation, and Redis future-incompat note.

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

## [[S0']] Portal / TUI Return Surface

The [[TUI]] is not a secondary UI skin. It is the first integrated operator portal where UX and backend setup interlace before the desktop app externalises the same pattern into M-form. It should therefore be treated as an [[S0']] return surface over the whole S/S' command topology, not as a separate product ontology.

The target portal shape is threefold:

| Panel | Register | Coordinate function | Primary contents |
|---|---|---|---|
| `0` left | structural clock | [[M0']] / [[M1']] / [[M2']] / [[M3']] | clock, coordinate walk, structural dashboards, Khora/Aletheia temporal-relational awareness |
| `/` centre | command return | [[S0]] / [[S0']] over [[S1]]-[[S5]] | command palette, setup, config, readiness, service health, parity map, gateway/API methods, typed execution routes |
| `1` right | personal/world return | [[M4']] / [[M5']] | [[Nara]], [[Epii]], review inbox, Gnosis/world-return, autoresearch, user/developer position |

The centre `/` panel is the missing command and configuration organ. It should let an operator enter TUI mode and move directly through the S0-S5 command surfaces without inventing parallel logic. It must consume the same truths as the CLI and gateway: command registry, parity manifest, config schema, service readiness, envelope/API/TS method contracts, and agent capability membranes.

Required design constraints:

- `epi portal` remains the M' parent runtime, but its centre `/` panel is explicitly [[S0']] command topology and return proof.
- The shared M' portal grammar now lives at [[M'-PORTAL-SPEC]]. The TUI and desktop app should mirror that `0` / `/` / `1` logic at the contract level.
- The portal must not fork command behavior. It dispatches existing `epi` commands, gateway RPC methods, or typed service calls.
- Settings must be schema-backed and coordinate-owned: S2 graph/cache settings, S3 gateway/session settings, S4 agent permission/capability settings, and S5/Epii/Gnosis/autoresearch settings should surface through one operator grammar while preserving ownership.
- Readiness views must distinguish raw service health from agent invocation access. A live [[Neo4j]] connection, for example, does not prove [[Anima]] or [[Epii]] can use the graph.
- The right panel should mirror [[M4']] / [[M5']] rather than owning services directly: [[Nara]] and [[Epii]] invoke or observe shared S-layer services through their bounded capability envelopes.
- The future desktop app should follow [[M'-TAURI-PORT-SPEC]]: preserve the current Electron M0'-M5' renderer work and [[OmniPanel]] breadth, but replace Electron main-process authority with Tauri/Rust commands over gateway RPC, S2/S3 services, and SpaceTimeDB projection. [[OmniPanel]] is the desktop `/` surface.
- The desktop M' surface must remain full-spectrum: [[M0']] Bimba map, [[M1']] relation-walks, [[M2']] semantic/MEF/correspondence matrix, [[M3']] integrated clock/solar/kairos platform, [[M4']] Nara modalities, and [[M5']] Epii workbench. The `0` / `/` / `1` shell groups these domains; it must not erase them.
- The current Electron [[Nara]] code already contains the right M4' seed: journal/flow, selected-text highlighting, Daily Note, Dream Journal, Oracle tabs, and right-rail highlights/pending actions. The port should deepen those into real modality surfaces and typed invocation envelopes instead of preserving placeholder panels or raw slash-string sendoff as final architecture.
- [[Epii]] needs a clean M5' workbench: pedagogy, etymological archaeology, Bimba map/wisdom exploration, autoresearch, review inbox, and VAK/Anima/Epi execution. Agentic execution should expose VAK evaluation, CF routing, bounded tools/skills, session lineage, run tree, diagnostics, outputs, and inbox deposits; it should not become a flat card wall of unrelated agents.
- The live temporal surface must be one shared projection, not a clock-only side channel. [[DAY]], [[NOW]], vault root, [[Kairos]], [[Redis]] temporal keys, [[SpaceTimeDB]] projection tables, and the protected [[Pratibimba]] anchor are [[S3']] temporal/context facts which feed both the structural clock side and the [[Nara]] / [[Epii]] side. The clock reads them as M0'-M3' timing/orientation; Nara and Epii read them as M4'/M5' personal, review, inbox, and invocation context. The TUI and future Tauri app should therefore consume a shared portal runtime state over this projection rather than letting each plugin resolve vault paths or Kairos state independently.

This gives [[S0]] its first-and-last role in the operator experience: the TUI can show whether the system is merely installed, actually connected, agent-accessible, and review-governed.

## [[S3]] Gateway Session Runtime / Khora Parity

The gateway session paradigm is now a core runtime contract, not a UI convenience. [[S3]] owns the live gateway/session truth; [[S4.0']] [[Khora]] owns agent-runtime session identity and NOW write authority; [[S3']] projects safe live temporal/session facts through [[Redis]] and [[SpaceTimeDB]]; [[Graphiti]] carries episodic memory under S3 runtime architecture and S5/S5' use governance; [[S5']] [[Epii]] owns review, validation, session summarisation, and autoresearch turn-back.

Gateway sessions should be nameable from [[DAY]] / [[NOW]] context ids so human operators, TUI panels, agents, and later desktop surfaces all orient around the same temporal body. This naming is the display/session-tree grammar: canonical session keys must remain stable enough to carry main session, subagent, fork, resume, import, and branch lineage without collisions. The preferred label shape is DAY/NOW-derived, while the stored record preserves the durable key, parent key, fork/import source, timestamps, runtime cwd, vault root, and agent/client bindings.

The current Electron OmniPanel / Gateway UI must be treated as the functional-logical parity reference for this layer. The next audit should identify its actual gateway session operations and state shape before implementation changes: session list, preview/resolve, patch, reset, delete, compact, transcript/run state, channel bindings, model/provider overrides, reasoning/thinking/verbose controls, timestamps, and any tree/fork/resume/import affordances. The goal is not to preserve Electron as authority. The goal is to make the TUI, gateway RPC, future Tauri app, and PI-agent runtime expose the same logical session operations through coordinate-native contracts.

First audit result: the current Electron renderer actively exposes chat history/send/abort and session list/patch/delete; the gateway already owns the wider canonical session operation set of list, resolve, preview, patch, reset, delete, and compact. The renderer has been corrected to call patch/delete with `sessionKey`, while gateway rows now expose `sessionKey` and `canonicalKey` in addition to compatibility `key`. The frontend parity manifest now records the full session family, and the session record contract has been extended for parent/source lineage, runtime cwd, vault root, resource-loader identity, retry settlement state, and structured diagnostics.

Second implementation result: the gateway now owns the first branch/import operation set directly. `sessions.fork`, `sessions.resume`, `sessions.import`, and `sessions.tree` are advertised through the S3 gateway contract, S0 parity, and OmniPanel parity, and are proven through real WebSocket gateway tests against the real session store. `dayId` is patchable, fork/resume copy source temporal identity, imports preserve external source lineage, and tree output exposes lineage edges for portal clients. SpaceTimeDB `session_surface` now carries the same parent/source/runtime/vault/resource-loader/retry/diagnostic facts in both the local bridge payload and the live reducer argument shape. `sessions.compact` now creates the first real Aletheia-sourced Epii review inbox item with transcript/session evidence and human review required; this is the first executable close/compact handoff, not the final Graphiti + kbase + Gnosis summarisation loop.

Third implementation result: the S3 gateway-contract now exports `GatewaySessionOperationContract` and `gateway_session_operation_contracts()` as the first typed operation surface for list, resolve, preview, patch, reset, delete, compact, fork, resume, import, tree, transcript, run state, chat history/send/abort, and channel binding status/logout. The contract maps each coordinate-native operation to an already-implemented gateway method and the `session_surface` projection table, so TUI/Tauri clients can route by contract instead of copying Electron-specific assumptions. S0 parity now derives its session-surface method list from this S3 contract, and the TUI portal default registry includes `SessionOperationsProvider` surfaces with gateway method plus request/response/projection metadata.

Fourth implementation result: legacy session compatibility is now explicit at the gateway store boundary. Older rows with product-local `key`, `sessionKey`, `canonicalKey`, `displayName`, and camelCase runtime fields are normalized on read into the canonical `SessionRecord` shape, including derived workspace/bootstrap paths when missing. This preserves old data while preventing old Electron/product naming from becoming the internal authority.

Fifth implementation result: PI session startup now propagates into S3 instead of waiting for a later gateway action. `epi agent session init` still delegates to `AgentSessionRuntimeFactory`, but after the runtime is built or reused it seeds/patches the base `agent:{pi_agent}:main` gateway session record with Khora session id, DAY id, NOW path, effective cwd, vault root, PI active-agent id, resource-loader id, model override, aliases, and structured runtime diagnostics. This makes the base PI session visible to gateway health, portal readiness, SpaceTimeDB session projection, and future TUI/Tauri session surfaces as soon as Khora `session_start` runs.

The execution shape for this layer is now seven-laned in [[S-SHARDING-TASK-LIST]]: canonical operation surface, identity/lineage/labels, Khora runtime factory, S3' Redis/SpaceTimeDB projection, Graphiti/session memory and S5 summarisation, TUI/Tauri portal parity, and real-functionality test architecture. These lanes should be worked as one coherent phase. The next implementation should not stop at the current first-pass contract extension; it should close the session lifecycle across gateway operation contracts, DAY/NOW naming, runtime factory recreation, projection readiness, portal consumption, bounded agent memory tools, and Epii-governed close/compact summarisation.

The recent PI runtime direction should be ported as [[Khora]] / [[S3]] convergence rather than copied blindly:

- A session-runtime factory recreates cwd-bound services and session config for startup, `/new`, `/resume`, `/fork`, and imports through one path.
- Resource loading and `session_start` must be idempotent so extensions do not double-load, Khora does not create duplicate NOW writes, and singleton-style resources remain coherent.
- Diagnostics are structured facts from arg parsing, resource loading, service creation, session option resolution, retries, and runtime settlement. The app/TUI chooses presentation and exit behavior; creation logic should not log-and-exit internally.
- Session records should preserve smart timestamps, branch/fork/import lineage, retry/idle settlement state, resource-loader identity, and the DAY/NOW temporal context that named the session.

Current implementation note: the first Rust `AgentSessionRuntimeFactory` now exists as the base Pi session primitive rather than a side helper. It recreates effective-cwd-bound DAY/NOW, vault, bootstrap, env, managed agent runtime paths, plugin runtime path, models/auth/settings surfaces, gate state root, resource-loader id, default model, NOW write state, and diagnostics. `epi agent session init` delegates to this primitive, so Khora `session_start` no longer owns a separate session law.

This also becomes the bridge between session UI and memory. Gateway compact/close/session-summary operations should feed a governed pipeline: NOW + transcript + session tree + Graphiti session episodes + kbase/Gnosis high-signal retrieval -> [[Aletheia]] crystallisation -> [[Epii]] review inbox / autoresearch evidence. [[S4]] and [[S5]] agents need bounded tools to search and write session memory, but S5' governs interpretation, disclosure, promotion, and user validation.

Current implementation note: the first bounded Graphiti memory gateway methods now exist as `s5.episodic.search` and `s5.episodic.deposit`. They intentionally report `S3'` as runtime owner and `S5/S5'` as invocation/governance owner, carry the protected-local episodic privacy boundary, refuse identity mutation, and return honest runtime availability if the compatibility Graphiti adapter is not running. The live runtime proof now drives `s5.episodic.deposit` and `s5.episodic.search` through the gateway into the running Graphiti adapter, with Graphiti using Gemini LLM, Gemini embeddings, Gemini reranking, shared Docker Neo4j, and shared Docker Redis. Canonical Pi session keys remain unchanged at the gateway boundary; the adapter maps them to Graphiti-safe `group_id` values only at the storage boundary. Direct Neo4j verification confirms the inserted proof episode under the sanitized live namespace without deleting useful graph data. This is a completion gate, not an optional proof: any tranche touching Graphiti session memory must pass `make verify-graphiti-live`, which starts the Docker Neo4j/Redis/Graphiti stack and runs the live gateway round trip.

## The Two System Spines

### [[S1']] Compiler Spine

The compiler spine is the artifact/residency/schema spine. It turns envelope facts, frontmatter law, CT types, source coordinates, graduation paths, and vault placements into executable constraints.

Its build purpose:

- Establish [[Hen]] / [[S1']] as authority for frontmatter, CT, residency, and graduation.
- Compile envelope layers into typed ledger channels, compiler passes, and return types.
- Ensure every artifact can be born, validated, placed, promoted, and linked without ad hoc per-agent rules.

This spine is meaningful only through the actual [[S4]] PI agent runtime and [[S4']] ta-onta inhabitation. The compiler spine must be accessible to the agents that write, review, and promote artifacts. The canonical compiler invocation should therefore be backend-aware: `pi_agent` is the target executor, while the vendor [[Claude Agent SDK]] path is a compatibility backend for Claude Code style sessions. The canonical contract home is Rust: `Body/S/S1/hen-compiler-core`. The Python vendor/compiler files remain useful compatibility and enrichment-backend material, but they do not own S1' law.

In practice [[Hen]] defines source paths, target residency, ledger channel, CT/frontmatter law, expected artifact contract, and review requirements. The current Rust contract now validates compiled artifact frontmatter against the residency plan and invocation kind, so an output can prove it came from the Day/T-lane/agent contract that claims it. [[Anima]] or [[Epii]] then performs or requests the enrichment through its bounded tools/skills. Hen remains the law; the agent runtime performs the work.

One concrete S1' subthread should now be carried inside this spine rather than spun out as a separate graph track: [[FLOW 2026 05 06 SMART ENV HEN LINK CANDIDATE POOL]]. The rule is simple. [[Hen]] may read [[Smart Env]] as a generated suggestion pool for ranked existing-note targets, but [[Hen]] remains the only authority that chooses and writes `[[wikilinks]]`, and the normal [[S2]] sync path remains the only canonical node/edge update path.

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
- Live Docker-backed Neo4j proof now covers S2/S5 namespace isolation without destructive graph cleanup: canonical `:Bimba`, legacy `:BimbaCoordinate`, and `:gnostic` nodes carrying S5 ownership as properties are test-created under a test-owned label, cross-linked deliberately, checked for label separation, and removed without changing pre-existing counts.
- `Body/S/S3/epi-app`, `Body/S/S3/gateway-contract`, and `Body/S/S3/epi-spacetime-module` exist. The app is currently Electron + Vite + React with a live S3 gateway client and M-domain renderer. Its future Tauri v2 port should preserve useful renderer/domain work but replace Electron main-process authority with Rust Tauri commands over gateway RPC and SpaceTimeDB subscriptions. The SpaceTimeDB module now declares the S3/S3' registration and live projection schema for gateway, agent, client, session, global temporal, temporal-event, and Kairos surfaces in one deployment; current S0 gateway wiring can register and publish against that plane. `global_temporal_surface` is the safe shared DAY/NOW/Kairos/Redis/Graphiti/Pratibimba-anchor projection that any TUI, desktop, gateway, or PI-agent client can subscribe to without crossing into protected local graph truth. `Body/S/S3/gateway-contract` owns the projection plan, `SubscribeMulti` message shape, projection table list, and subscription row-decoding contract. The TUI can hydrate the shared temporal projection through HTTP SQL polling by default, or through the native `v1.json.spacetimedb` WebSocket subscription loop when `EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket` is set. The remaining upgrade is mirroring this same subscription reader in the future Tauri app.
- `Body/S/S4/pi-agent`, `Body/S/S4/ta-onta`, and `Body/S/S4/plugins/pleroma` exist as S4/S4' source and package surfaces.
- `Body/S/S4/plugins/pleroma/capability-matrix.json` now gives the first machine-checkable Anima capability membrane: constitutional agents, real skill files, hooks, Anima authority, and Epii handoff boundaries.
- `Body/S/S5/epi-gnostic` exists with real [[RAG-Anything]], [[LightRAG]], [[Neo4j]], embeddings, and temporary [[Graphiti]] wrapper code.
- `Body/S/S5/epii-agent/agent-contract.json` now gives the first machine-checkable Epii PI-agent contract: epi-logos resource target, autoresearch spine, review inbox spine, accepted Anima deposits, and bounded Epii -> Anima requests.
- [[Gnosis]] now exposes a first source-selection/disclosure report over real local ingested documents, explicitly marking itself as [[S5]] world-return over [[S2]] storage substrate with [[S5']] governance. `s5'.epii.status` carries the same S5/S2/S5' service contract for Epii observation.
- `Body/S/S0/epi-cli/src/portal` exists as the current terminal portal foundation, with M0-M5 plugins, clock state/rendering, persisted workspace state, and an existing config TUI surface. It now has a shared `PortalRuntimeState`: the existing shared clock state plus a shared temporal projection over DAY/NOW, vault root, Kairos validity/freshness, Redis temporal key hydration state, SpaceTimeDB projection tables/source, and protected Pratibimba anchor. On startup the runtime hydrates this projection from configured SpaceTimeDB `session_surface` / `kairos_surface` / `global_temporal_surface` SQL reads when available, falls back to the same local gateway session-store context used by `s3'.temporal.context`, and then falls back to clock/session state. A background projection sync keeps the portal surface aligned. The centre `/` panel, `m4.pratibimba`, and `m5.chat` consume this same projection, making the clock and Nara/Epii sides share one live orientation surface.
- `Body/S/S0/epi-cli/src/portal/topology.rs` now gives the first executable S0' portal topology contract for the `0` / `/` / `1` domains, S/S' stack coordinates, M/M' visualisation coordinates, editable config-field metadata, and interactive slash command-surface actions. `s0.command` is registered as the first TUI-facing command/config centre plugin.
- `Body/S/S0/epi-cli/src/portal/surfaces.rs` now gives the first provider-backed S0' portal surface registry. The centre `/` panel no longer depends only on a hand-authored slash list: it aggregates topology seeds, gateway parity records, S4/S5 extension `tools.json` manifests, `.claude-plugin` package manifests, the Epii PI-agent contract, Pleroma capability gates, and Ratatui/Hypertile plugin registrations. This is the shared source the TUI and later desktop portal should mirror for command/config/readiness semantics.
- The S/S' specs, shard indexes, and source traceability indexes exist.

Not yet built in the right way:

- [[S2]] graph schema/services are no longer wholly hidden inside `Body/S/S0/epi-cli/src/graph`: `Body/S/S2/graph-schema` owns schema constants, and `Body/S/S2/graph-services` now owns Neo4j client authority, coordinate parser, GraphRAG query grammar, retrieval result/mode/disclosure contracts, and Redis semantic-cache contracts. RedisVL bridge scripts now live under `Body/S/S3/redis-context`, because S3 owns Redis runtime residency while S2 owns graph semantic-cache law. Remaining S2 extraction debt is retrieval execution, seed/sync/enrichment, Redis hot/warm graph cache semantics, and S5 Gnosis graph support boundaries.
- [[S3]] gateway/runtime is still physically hidden inside `Body/S/S0/epi-cli/src/gate`, though `Body/S/S3/gateway-contract` now owns the first shared protocol/key/method constants.
- [[S3]] SpaceTimeDB schema has been re-centred from anonymous presence/oracle/logos into a shared gateway/client/agent/session/global-temporal/Kairos projection surface. The current S0-hosted gateway can now register gateway, heartbeat, client, agent, session, Kairos, and global temporal surfaces against that schema when configured. `health.snapshot` and the S0' portal registry expose registration readiness separately from projection-readiness, and readiness now includes a native WebSocket projection plan when `EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket` is set. The TUI now hydrates the shared portal temporal projection from SpaceTimeDB via HTTP SQL polling by default and via native WebSocket subscription in native mode, while preserving local gateway context as fallback. What is not yet built is the future desktop/Tauri mirror over the same projection shape.
- [[S3']] Redis temporal context now has a distinct S3 key law and live hydration path under `s3:gateway:temporal:*`, verified against Docker Redis on 2026-05-07. `Body/S/S3/redis-context` now owns the Redis runtime/RedisVL bridge residency contract, while S2 graph semantic cache remains a separate namespace/API over that runtime. Remaining work is extracting more live S3 Redis/gateway bodies out of the S0 CLI package.
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

### DAY/NOW Kairos And PersonalNexus Harmonisation

The temporal identity surface is now a first-class build thread. [[DAY]] / [[NOW]] should not be treated as vault-folder convenience alone. They are the [[S3']] temporal body through which [[Kairos]], session identity, Redis hot context, SpaceTimeDB live projection, Graphiti episodic arc handles, and protected [[M4.4.4.4]] [[PersonalNexus]] references become coherent.

The target split is:

- [[SpacetimeDB]] stores safe live projections only: gateway, agent, client, session, `global_temporal_surface`, DAY/NOW, public-current-transit [[Kairos]], Redis key refs, Graphiti arc/namespace refs, and protected Pratibimba anchor refs. One deployment can host many gateway/agent/user/session instances.
- [[Redis]] stores hot local [[S3']] context with TTL: NOW markdown, DAY context, DAY Kairos, session Kairos, agent orientation, and personal orientation refs.
- Local [[Neo4j]] / [[Graphiti]] stores protected personal truth: [[PersonalNexus]], journal-derived aspects, identity evolution, and episodic memory namespaces.
- [[Epii]] / [[S5']] is the steward of user-position access and validation. [[Anima]] / [[S4']] may read orientation and deposit review requests, but must not mutate identity or journal-derived PersonalNexus state directly.

Current implementation state:

- Done: `s3'.temporal.context` and `epi gate temporal context` expose DAY/NOW/session/history/Redis/SpaceTimeDB/Graphiti/Kairos/Pratibimba orientation.
- Done: S3 Redis key law and temporal hydration are proven against live Docker Redis with `EPILOGOS_REDIS_URI=redis://127.0.0.1:6379`.
- Done: safe Kairos and protected Pratibimba anchor refs are projected through the SpaceTimeDB bridge/session surface and the shared `global_temporal_surface`.
- Done: `s5'.epii.user.orientation`, `s5'.epii.pratibimba.status`, and `s5'.epii.kairos.context` expose read-only Epii orientation over the same temporal identity substrate.
- Done: gateway SpaceTimeDB readiness now includes a native WebSocket projection subscription plan over `gateway_instance`, `agent_instance`, `client_registration`, `session_surface`, `kairos_surface`, `global_temporal_surface`, and `temporal_event`; the TUI can now use that plan for a native `SubscribeMulti` projection loop while preserving `http-sql-poll` as fallback/default.
- Done: the S0' portal live readiness result state now renders raw service readiness separately from agent-access readiness across Neo4j, Redis cache, gateway, SpaceTimeDB registration/subscription, Graphiti runtime, PI agent access, Gnosis, Nara, Epii review, and autoresearch.
- Done: PI/Khora runtime identity now propagates into S3 gateway session truth through `agent::session_propagation`, including `session_start`, `new`, `resume`, `fork`, and `import` command paths.
- Done: the local gateway context, S0 portal runtime state, and SpaceTimeDB projection hydration now preserve S4/S5 agent-access fields: canonical session key, active agent id, runtime cwd, resource-loader id, source lineage, Graphiti session arc id, and the global DAY/NOW projection surface consumed by portal/agent clients.
- Done: RedisVL bridge residency is now S3-owned through `Body/S/S3/redis-context`, while S2 graph semantic-cache contracts keep `s2:graph:semantic` separate from S3' temporal keys.
- Next: mirror the same SpaceTimeDB projection reader in the future desktop/Tauri app, extract the S3 Redis/gateway module bodies, and replace old Graphiti sidecar-shaped Pratibimba calls with local graph/runtime contracts.

### Envelope Corrections

- Move live temporal/session/context Redis authority to [[S3']] fields.
- Keep S2 Redis fields only for graph semantic-cache law and graph-context semantics; Redis runtime/RedisVL bridge residency belongs to S3.
- Move [[Graphiti]] architecture/runtime handles to [[S3']] where they describe temporal episodic runtime.
- Keep [[Graphiti]] search, arc policy, disclosure, and reflective meaning under [[S5]] / [[S5']].
- Add [[Kairos]] fields to the [[S3']] temporal envelope: freshness, source, active decan, dominant sign/element, active tattva, planet degrees/anchors, and privacy class.
- Add protected [[Pratibimba]] anchor fields to the temporal envelope: [[M4.4.4.4]] coordinate, anchor id, Graphiti namespace ref, layer presence summary, stewardship owner, and mutation boundary.
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
- Neo4j client and schema tests. Current state: the live Neo4j config/client now lives in `Body/S/S2/graph-services` and `Body/S/S0/epi-cli/src/graph/client.rs` is only the S0 mirror re-export.
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
3. Establish [[S1']] compiler spine contracts and tests, including the read-only [[Smart Env]] link-candidate seam for [[Hen]].
4. Establish [[S5']] review/autoresearch/Epii contracts and tests.
5. Extract [[S2]] graph schema/services from S0 package residency; live Neo4j client, coordinate/query grammar, retrieval result/mode contracts, and semantic-cache contracts are now Body-native, with RedisVL runtime residency corrected to S3. Retrieval execution, seed, sync, enrichment, and Redis hot/warm graph cache semantics still remain.
6. Extract [[S3]] gateway/redis-context/graphiti-runtime from S0 package residency, including the SpaceTimeDB registration plane as the live gateway/client/agent projection surface.
7. Stabilise [[S4]] agent invocation/access architecture.
8. Stabilise [[S5]] Gnosis/Nara/Epii world-return architecture.
9. Build the [[S0']] portal/TUI centre `/` command/config/readiness surface so `epi portal` becomes the operator mirror of the same S0-S5 topology.
10. Specify and then port the current Electron `epi-app` to Tauri v2 as the desktop mirror of the TUI portal: left `0`, centre `/`, right `1`, backed by the same portal surface registry, gateway RPC, and SpaceTimeDB live projection contracts.
11. Return to [[S0]] with `epi up` as full-stack build proof.
12. Final non-negotiable cleanup gate: after all build/extraction/readiness tasks are complete, run full depwire dead-symbol cleanup and full `.worktrees/*` harvest/retire cleanup as one terminal consolidation step. Do not let either cleanup stream interrupt the build-order work before the S/S' system is coherent, but do not treat the build as complete until both are resolved with tests and git history clean.

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
