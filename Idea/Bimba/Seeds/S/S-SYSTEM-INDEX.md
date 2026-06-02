---
coordinate: "S/S'"
c_4_artifact_role: "index"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-26T00:00:00Z"
c_0_source_coordinates:
  - "[[PROTOCOL S COORDINATE MODULE SPEC BUILD]]"
  - "[[S0-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S2-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[S-CODE-RESIDENCY-AUDIT]]"
  - "[[S-CODE-RESIDENCY-PLAN]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
---

# S/S' System Index: Core Dynamics and Data Architecture

## Status

This is the central index for the six consolidated S/S' specifications:

- [[S0-SPEC]]
- [[S1-SPEC]]
- [[S2-SPEC]]
- [[S3-SPEC]]
- [[S4-SPEC]]
- [[S5-SPEC]]

The six level specs remain the build references for their own coordinates. This index is the cross-level harmonisation artifact: it shows how the [[API]], [[Envelope]], [[TypeScript]] interfaces, command surfaces, ta-onta modules, and data architecture fit together so there is minimal ambiguity about what ought to be built next.

The shard execution queue is [[S-SHARDING-TASK-LIST]]. Each level folder now contains its local master spec, shard index, six base shard specs, and six prime shard specs.

The active-code residency and move-readiness map is [[S-CODE-RESIDENCY-AUDIT]]. The target source-residency law is [[S-CODE-RESIDENCY-PLAN]], which defines the `Idea/` vault plane, `Body/` code plane, and runtime/tool plane before any directory movement.

Current residency correction: the first Body-native move has happened. Active package roots now live under `Body/S/Sx/...`; root entries such as `epi-cli`, `epi-lib`, `epi-app`, `bimba-mcp`, `epi-gnostic`, `.pi`, and `plugins` are no longer source authorities. Implementation agents should start from the Body paths and treat any remaining root-path assumptions as migration debt.

The canonical source-routing map is [[S-SOURCE-TRACEABILITY-INDEX]]. It links the current S/S' specs to older `/docs` plans, resources, and specs so implementation agents can recover deeper planning detail without treating current code drift as authority.

The current whole-system diagram pack is [[ARCHITECTURE-DIAGRAM-PACK]]. Use it before implementation planning when work crosses S/S', M', `/pratibimba/system`, or the M-dev track set. It records the current architecture invariant that [[S0]] is the command membrane and return surface, while coordinate-domain law belongs in the owning [[S1]]-[[S5]] modules.

The flat [[World]] nexus for this architecture is [[World-Ontology]]. It should be read before treating any seed spec as a standalone plan, because it records the central distinction between [[World]] crystallisations, [[World/Types]] MOC/canvas surfaces, and [[Seeds]] planning/spec/source artifacts.

Architecture residency is now explicit: [[World]] is the crystallised architecture surface, while [[Seeds]] is the planning/spec/source surface. Stable coordinate definitions, synthesis documents, and type/MOC canvases belong under `Idea/Bimba/World/**`; shard specs, traceability indexes, architecture packs, and promoted `/docs` material belong under `Idea/Bimba/Seeds/**`. Agents should use `epi core knowing` and `epi vault read/search/search-content/link-suggest` to discover these surfaces before falling back to raw filesystem search.

The system image is: [[S0]] makes the system executable; [[S1]] makes it resident and typed in the vault; [[S2]] makes it graph/vector/cache real; [[S3]] makes it temporal and routed; [[S4]] makes it agentically inhabited; [[S5]] makes it world-facing and reflective. The prime branch makes each base technology carry [[Epi-Logos]] ontology.

The agent image is now twofold. [[Anima]] is the dispatch spine of Epi-Logos in operation; [[Epii]] is the return spine of Epi-Logos in reflection. Both are PI-agent embodiments using the same spine grammar, but they are not the same agent and must not receive the same tool/skill permission surface.

## Level Map

| Level | Base technology | Prime augmentation | Primary data authority | Build reference |
|---|---|---|---|---|
| [[S0]] / [[S0']] | `epi-cli`, shell, process execution, command topology | [[Khora]] CLI law, preferred tools, cmux/tmux, runtime surface | Runtime execution facts: cwd, env, tool surface, terminal substrate | [[S0-SPEC]] |
| [[S1]] / [[S1']] | [[Obsidian]] vault, filesystem, artifacts | [[Hen]] compiler spine, frontmatter, CT/residency law | Vault residency, artifact form, CT templates, graduation path | [[S1-SPEC]] |
| [[S2]] / [[S2']] | [[Neo4j]], [[Redis]], graph/vector/cache substrate | [[Pleroma]] coordinate-aware graph law, retrieval, cache semantics | Graph nodes/edges, vector handles, retrieval/cache records | [[S2-SPEC]] |
| [[S3]] / [[S3']] | Gateway, sessions, channels, app bridge | [[Chronos]] temporal law: [[Day]], [[NOW]], [[Kairos]], presence, context | Transport, session state, temporal events, Redis session/context state, [[Graphiti]] runtime architecture | [[S3-SPEC]] |
| [[S4]] / [[S4']] | PI agent runtime, providers, auth, skills, teams, plugins | [[Anima]] VAK law, CF routing, [[Psyche]] state, constitutional agents | Agent identity, permission boundary, task state, VAK/CS/CPF/CT/CP/CF/CFP | [[S4-SPEC]] |
| [[S5]] / [[S5']] | World-boundary services: [[Gnosis]], [[RAG-Anything]], [[NotebookLM]], [[Vimarsa]], [[Nara]], [[Graphiti]] usage | [[Epii]] return law: [[MEF]], [[QL]], review inbox, autoresearch, pedagogy, promotion | World-return sources, M' function outputs, crystallisation, improvement, review, QL schema | [[S5-SPEC]] |

## Core Dynamic

The S-family is not a list of services. It is a return circuit.

1. [[S0]] grounds execution as commands, processes, streams, files, and test harnesses.
2. [[S1]] gives artifacts a lawful home: CT type, frontmatter, residency, and compiler form.
3. [[S2]] provides the substrate for graph, vector, Redis, cache, retrieval, and coordinate-aware structure.
4. [[S3]] gives the system time, routing, sessions, shared context, presence, and the temporal architecture for [[Graphiti]].
5. [[S4]] inhabits the system as [[Anima]]: VAK evaluation, agent routing, [[Psyche]] continuity, teams, tools, and permissions.
6. [[S5]] returns the system to the world and back to itself: [[Gnosis]], [[Nara]], [[Epii]], [[Aletheia]], [[Sophia]], review, autoresearch, promotion, and the [[Möbius Return]].

Then S5 returns to S0: every decision about [[Epii]], [[Nara]], [[Gnosis]], [[Graphiti]], [[autoresearch]], and review must become executable as CLI/API shape, test harness, bootstrap, and audit trail.

## Agent Spine Architecture

The four-seam compiler pattern is the common agent spine:

1. hook or invocation event,
2. append-safe ledger / canonical source,
3. compile, enrich, evaluate, or improve,
4. inject, query, review, promote, or return.

[[S1']] / [[Hen]] owns the lawful compiler/residency version of this spine. [[S4']] / [[Anima]] and [[S5']] / [[Epii]] embody it as actual PI-agent behavior.

| Spine-bearing agent | Coordinate | Package body | Canonical powers | Restricted relation |
|---|---|---|---|---|
| [[Anima]] | [[S4]] / [[S4']] | [[Pleroma]] plugin plus ta-onta modules | VAK evaluation, dispatch, team/pipeline/TDD/plan execution, bounded S-layer tool invocation, Aletheia handoff | May deposit review/inbox items to [[Epii]], but should not resolve Epii review or autoresearch decisions |
| [[Epii]] | [[S5]] / [[S5']] | [[epi-logos plugin]] plus [[autoresearch]] | Review inbox, gnosis/kbase/Nara/Graphiti meaning-use, QL/MEF governance, improvement candidates, promotion decisions | May request [[Anima]] execution, but should not directly perform arbitrary runtime dispatch outside its bounded tools |

The [[Pleroma]] package is therefore the executive capability membrane for [[Anima]], not just a skill collection. The [[epi-logos plugin]] is the philosophical/resource/workflow body for [[Epii]], not a secondary connector. Extensions expose ground-level runtime affordances; skills expose executable workflows; agents bind a bounded selection of tools and skills for focus and security.

## API / Envelope / TypeScript Harmonisation

The canonical design stack is:

| Artifact | Role | Current state | Harmonisation rule |
|---|---|---|---|
| [[FLOW 2026 04 24 PI AGENT API v0.1]] | Coordinate-native method contract | Defines the target async API by S/S' namespace | Method names are the intended ontology, even where live gateway names are product/runtime-native |
| [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] | Data architecture and field residency | Defines the envelope layer fields, coordinate homes, implementation slots, cost, and residency | Every durable or routed fact must have an envelope home before implementation |
| [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] | Shared type contract for [[Anima]] and [[Epii]] | Types 100 API methods plus 8 envelope-gap methods, with 118 envelope fields | The TypeScript package is the executable schema target; specs may propose deltas that must be promoted into this file |
| [[S0-SPEC]] through [[S5-SPEC]] | Coordinate build references | Consolidated from old files, FLOW docs, and current code reality | Each spec owns its coordinate and records API/CLI/envelope gaps without flattening them into another level |

No implementation should be considered complete until these four views agree:

- The API method exists or is explicitly deferred.
- The request/response type exists in [[TypeScript]] or is listed as a typed delta.
- The produced facts map to [[Envelope]] fields.
- The command/API/runtime surface has real-functionality tests at the coordinate that owns it.

## Envelope Layer Ownership

| Envelope layer | Meaning | Primary S authority | Notes |
|---|---|---|---|
| Layer 1 Transport | Carriage, request identity, session wire facts | [[S3]] | Gateway publishes; not meaning-bearing |
| Layer 2 Runtime | Workspace, tools, env, permissions, bootstrap | [[S0]] + [[S4]] | [[S0']] supplies tool/env substrate; [[S4']] supplies permission and bootstrap context |
| Layer 3 Temporal | [[Day]], [[NOW]], session start/close, [[Kairos]], arcs | [[S3']] | [[Hen]]/[[Khora]] anchor vault paths, but [[Chronos]] owns temporal semantics |
| Layer 4 Coordinate | C-family target, VAK, CPF/CT/CP/CF/CFP/CS | [[S4']] | [[Anima]] publishes; [[C']] validates |
| Layer 5 Residency | Vault zone, CT type, graduation path, sync destination | [[S1']] | [[Hen]] compiler/residency law gates writes |
| Layer 6 Context-Economy | Source pools, retrieval mode, context key, disclosure | [[S2']] + [[S5']] | [[Pleroma]] assembles substrate; [[Epii]] governs high-level retrieval strategy |
| Layer 7 Lived-Environs | Inhabited task-world and [[Psyche]] continuity | [[S4']] | Context becomes live agent state |
| Layer 8 Execution | Tool calls, approvals, side effects, command results | [[S0]] + [[S4']] | S0 executes; S4 approves and records task meaning |
| Layer 9 Episodic | Episode ids, arcs, linked prior episodes, reporting density | [[S3']] + [[S5]] | [[Graphiti]] architecture is S3'; invocation/governance is S5/S5' |
| Layer 10 Crystallisation | [[Aletheia]], [[Sophia]], review disclosures, return state | [[S5']] via [[S4.5']] | Aletheia triggers in S4.5'; Epii governs deep meaning |
| Layer 11 Improvement | Autoresearch, challengers, evaluations, promotions | [[S5']] | [[autoresearch]] is Epii's dynamic improvement spine |
| Layer 12 QL Process | QL schema, modal, MEF, inversion, topological interpretation | [[S5']] + [[C']] | Epii governs process evaluation; C-family holds coordinate law |

## Method Namespace Ownership

| Namespace | Owning spec | Runtime expectation |
|---|---|---|
| `s0.*`, `s0'.*` | [[S0-SPEC]] | Local execution, tool surface, env, cmux/tmux topology |
| `s1.*`, `s1'.*` | [[S1-SPEC]] | Vault read/write/search, frontmatter, compiler, residency, form birth/graduation |
| `s2.*`, `s2'.*` | [[S2-SPEC]] | Neo4j/Redis substrate, graph query/traverse, coordinate retrieval, rerank, enrich |
| `connect`, `agent.capabilities`, `s3.*`, `s3'.*` | [[S3-SPEC]] | Gateway connection, sessions, channels, routing, temporal state, Day/NOW/Kairos/presence/context |
| `s4.*`, `s4'.*` | [[S4-SPEC]] | Agent query/notify/status, VAK, team, CS, thought route, context assemble, permissions, goals |
| `s5.*`, `s5'.*` | [[S5-SPEC]] | Gnosis, episodic usage, Bimba navigation, M' functions, MEF/QL, kbase, review, improve, teach, seed |

The live gateway manifest may remain product/runtime-native during transition. The build target is coordinate-native API parity with typed CLI mirrors where local execution is appropriate.

## Product-Native Alias To Coordinate-Native Map

Track 13 T2 owns the product-name to coordinate-owner map consumed by the M' `/` surface, gateway clients, and CLI mirrors. Product-native aliases are ergonomic entrypoints only: they may select a command, panel, or RPC route, but they do not become semantic owners. When a product alias spans multiple coordinates, the transport owner, meaning owner, and human-review owner must remain visible in the envelope.

| Product-native alias | Coordinate-native owner | Client authority limit |
|---|---|---|
| `connect`, gateway overview, connection settings | `connect` / `s3.*` ([[S3]]) | Compatibility adapter for handshake and readiness; clients may display connection state but not invent capability law. |
| `sessions.*`, `session_surface`, session list/select/resolve/preview/patch/reset/delete/compact/fork/resume/import | `s3.session.*` ([[S3]]) plus `s3'.temporal.*` where DAY/NOW is involved | Session truth stays in the gateway/session store; UI aliases may request operations but must preserve session key, DAY/NOW, and branch lineage. |
| `channels.*`, external delivery, cron/automation routing | `s3.channel.*` / `s3'.temporal.*` ([[S3]]/[[S3']]) | Product schedules and delivery settings are transport/temporal surfaces, not Nara journal or Epii review authority. |
| `chat.*`, `send`, direct Pi/agent chat | `s3.message.route` for transport, `s4.agent.*` / `s4'.*` for agent execution | Chat aliases may route messages and display tool streams; agent capability, VAK routing, and permission boundaries remain S4/S4'. |
| `exec.approval.*`, `epi`, command execution, logs, raw config/readiness | `s0.exec`, `s0.tool_surface`, `s0.env` ([[S0]]/[[S0']]) | `/` may expose command/config controls, but backend behavior must route through S0 command or typed service calls. |
| `epi vault`, vault read/write/search/template/frontmatter/backlinks/sync | `s1.*` / `s1'.*` ([[S1]]/[[S1']]) | Vault aliases may offer file operations; structural write law, frontmatter, compile plans, and wikilink integrity remain Hen/S1'. |
| `epi graph`, graph explorer, coordinate lookup, pointer web | `s2.graph.*` / `s2'.*` ([[S2]]/[[S2']]) | Graph UI/CLI aliases may query and visualize; schema, coordinate resolution, retrieval, rerank, and enrichment stay S2/S2'. |
| runtime tick, temporal context, SpaceTimeDB bridge, Kairos projection | `s3'.temporal/day/kairos/presence/context` ([[S3']]) | Product surfaces consume safe temporal projection handles and must not treat local clock widgets as temporal authority. |
| `epi agent`, `skills.*`, plugin registry, agent status/query/notify | `s4.agent.*` ([[S4]]) with `s4'.*` for VAK/team/orchestration | Skill and agent aliases expose capability surfaces; they may not bypass VAK, permission, team, or Psyche state boundaries. |
| `s4'.vak.evaluate`, `s4'.orchestrate`, Anima/Pleroma routing | `s4'.*` ([[S4']]) | Product aliases may invoke deterministic routing/adapters; provider-backed execution and recursive governance remain owner-gated. |
| `epi techne gnosis`, `epi kbase`, `epi vimarsa`, Bimba meaning lookup | `s5.gnostic.*`, `s5.bimba.*`, `s5'.kbase.*`, `s5'.gnosis.*` ([[S5]]/[[S5']]) | Retrieval aliases expose handles and summaries; Epii governance owns interpretation, review, and promotion. |
| `s5.episodic.*`, Graphiti session memory search/deposit | `s5.episodic.*` with S3' runtime owner and S5/S5' invocation governance | Product aliases may search/deposit governed memory handles, not raw protected bodies or canonical graph mutations. |
| `epi nara`, portal clock/oracle/medicine, `s5.m.*` | `s5.m.*` ([[S5]]/[[M']]) with M4/M' UI ownership | Nara/M' aliases stay protected-local or handle-only unless UFV/privacy gates explicitly allow more. |
| `s5'.review.*`, `s5'.improve.*`, `s5'.epii.*` | [[S5']] Epii review/autoresearch/agent-access | Review/improve aliases may submit, defer, summarize, and expose status; human-required approval, non-dry-run mutation, and canon promotion remain gated. |

## Implementation Parity Matrix

This is the first implementation-facing parity pass. It is family-level on purpose: the canonical row-per-method table lives in [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]], while this index records where each method family currently lands in code, what proves it, and what must move before development can proceed without ambiguity.

Cycle 2 note: the parity matrix below preserves the historical status vocabulary used by the first pass. The active `COVERED` / `STUBBED` / `DEFERRED` cycle-2 classification is the register immediately after the matrix; it incorporates the later landed S5 review/autoresearch, S3/S5 Graphiti split, and gateway lifecycle evidence.

Status vocabulary:

- current: implemented close to the target coordinate.
- mirror: working code exists, but as an S0 CLI/gateway mirror rather than the final Body-native module.
- partial: some backing behavior or tests exist, but the coordinate-native API/agent path is incomplete.
- missing: specified but not yet implemented as a real service/module.
- compatibility: legacy/product surface that must be kept only through explicit mapping.

| Method family | Owner | Envelope layers | Current live surface | Current Body code path | Test evidence | Status | Required next |
|---|---|---|---|---|---|---|---|
| `connect`, `agent.capabilities` | [[S3]] | 1, 2, 3 | product gateway `connect`; capability discovery only partly expressed by product methods | `Body/S/S0/epi-cli/src/gate/protocol.rs`, `gate/server.rs`, `gate/parity.rs` | `gate_connect_protocol.rs`, `gate_full_parity_contract.rs`, `gate_parity_manifest.rs` | compatibility | Add coordinate-native capability manifest on top of product gateway methods |
| `s0.exec`, `s0.tool_surface`, `s0.env` | [[S0]] / [[S0']] | 2, 8 | `epi` command execution, env/tool inspection, `epi up` bootstrap | `Body/S/S0/epi-cli/src/main.rs`, `core/`, `up.rs`, `techne/cmux.rs` | `up_command.rs`, `core_knowing.rs`, `techne_cmux_contract.rs` | mirror | Expose typed S0 API mirror and return-audit envelope fields |
| `s1.read/write/search/template/frontmatter/backlinks/sync` | [[S1]] | 5, 8 | `epi vault`, Rust vault helpers | `Body/S/S0/epi-cli/src/vault/` | `vault_commands.rs`, `vault_frontmatter.rs`, `vault_paths_templates.rs`, `vault_cli_contact.rs` | mirror | Keep CLI as mirror; route authority to S1' compiler/frontmatter package |
| `s1'.type/form/canvas/residency/compile/ledger/query/injection` | [[S1']] | 5, 10, 11 | Hen compiler vendor plus ta-onta Hen stubs; not yet enforced as authority | `Body/S/S1/hen-compiler`, `Body/S/S4/ta-onta/S4-1p-hen`, `Body/S/S0/epi-cli/src/vault/` | vault/frontmatter tests only cover mirror behavior | partial | Build S1' compiler package contract and make vault writes call compiler law |
| `s2.graph.query/node/traverse` | [[S2]] | 6, 8 | `epi graph` over Neo4j | `Body/S/S0/epi-cli/src/graph/` | `graph_client.rs`, `graph_commands.rs`, `graph_seed.rs`, `graph_sync.rs` | mirror | Extract `Body/S/S2/graph-schema` and `Body/S/S2/graph-services` |
| `s2'.retrieve/rerank/enrich/coordinate.resolve` | [[S2']] | 6, 12 | GraphRAG/hybrid retrieval and external `bimba-mcp` interface | `Body/S/S0/epi-cli/src/graph/retrieval/`, `Body/S/S2/external/bimba-mcp` | `graph_retrieval.rs`, `semantic_cache_contract.rs`, `redis_cache.rs` | mirror | Separate PI-internal S2 service from external MCP interface; preserve `:Bimba`/3072 authority |
| `s3.session.*`, `s3.channel.*`, `s3.message.route` | [[S3]] | 1, 3, 7, 8 | product gateway sessions/channels/chat/send methods | `Body/S/S0/epi-cli/src/gate/session_store.rs`, `gate/sessions.rs`, `gate/channels.rs`, `gate/chat.rs`, `gate/server.rs` | `gate_sessions.rs`, `gate_channels_cron_voice.rs`, `gate_chat*.rs`, `session_lifecycle.rs` | compatibility | Extract S3 gateway module and map product RPC names to coordinate-native method families |
| `s3'.temporal/day/kairos/presence/context` | [[S3']] | 3, 6, 7, 9 | gate tick/session store, vault day helpers, S3 Redis temporal key law, SpaceTimeDB bridge, safe Kairos projection, protected Pratibimba anchor refs | `Body/S/S0/epi-cli/src/gate/runtime.rs`, `gate/temporal.rs`, `gate/spacetimedb_bridge.rs`, `vault/kairos.rs`, `nara/kairos.rs`, `Body/S/S3/gateway-contract`, `Body/S/S3/epi-spacetime-module` | `gate_runtime_state.rs`, `gate_tick_health.rs`, `gate_spacetimedb_bridge.rs`, `gate_temporal_context.rs`, `spacetimedb_registration_contract.rs`, `gate_epii_agent_access.rs`, live Docker Redis hydration test | partial | Extract `Body/S/S3/redis-context`; wire live SpaceTimeDB registration/subscriptions; keep S3' temporal Redis distinct from S2 cache Redis |
| `s4.agent.query/notify/status` | [[S4]] | 2, 7, 8 | `epi agent`, gateway agent/node RPC, spawn/session commands | `Body/S/S0/epi-cli/src/agent/`, `Body/S/S0/epi-cli/src/gate/agent*`, `gate/subagents.rs` | `agent_spawn.rs`, `agent_session_commands.rs`, `gate_agent_rpc.rs`, `gate_subagent_spawn.rs`, `real_pi_claude_mem.rs` | mirror | Prove actual PI invocation/access path, not just CLI config/install surfaces |
| `s4'.vak/team/cs/orchestrate/thought/crystallise/notify_user/context/psyche/goal/permission` | [[S4']] | 4, 7, 8, 10 | ta-onta Anima skills and CLI VAK/team mirrors; Psyche/permission are typed but not yet full services | `Body/S/S4/ta-onta/S4-4p-anima`, `Body/S/S0/epi-cli/src/agent/vak.rs`, `agent/team.rs`, `gate/team_store.rs` | `agent_vak.rs`, `vak_constitutional_architecture.rs`, `agent_team_cli_contract.rs`, `gate_team_runtime_contract.rs`, `ta_onta_cli_contract.rs` | partial | Make Anima API callable through actual agent runtime and persist Psyche/permission state |
| `s5.gnostic.ingest/query/status` | [[S5]] | 6, 10, 11 | `epi techne gnosis`, Python `epi-gnostic` | `Body/S/S0/epi-cli/src/techne/gnosis`, `Body/S/S5/epi-gnostic` | `gnosis_commands.rs`, `Body/S/S5/epi-gnostic/tests/*` | mirror | Decide command aliasing, keep S5 service over S2 substrate, and add real service availability checks |
| `s5.episodic.*` | [[S5]] using [[S3']] runtime | 9, 10, 11 | transitional Graphiti wrapper/gateway controls | `Body/S/S0/epi-cli/src/gate/graphiti.rs`, `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` | no stable coordinate-native test evidence yet | partial | Move runtime adapter to `Body/S/S3/graphiti-runtime`; keep S5 invocation/search/governance policy |
| `s5.bimba.*` | [[S5]] / [[S2']] | 6, 10, 12 | `epi core knowing`, graph retrieval, kbase/vimarsa helpers | `Body/S/S0/epi-cli/src/core/`, `graph/retrieval/`, `kbase/`, `vimarsa/` | `core_knowing.rs`, `graph_retrieval.rs` | mirror | Clarify Bimba navigation as S5 meaning-use over S2 graph substrate |
| `s5.m.*` | [[S5]] / [[M']] | 10, 12 | `epi nara`, FFI to `epi-lib`, portal clock/oracle/medicine surfaces | `Body/S/S0/epi-cli/src/nara/`, `ffi/`, `portal/`, `Body/S/S0/epi-lib` | `nara_*`, `portal_clock_state.rs`, C tests under `Body/S/S0/epi-lib/test` | mirror | Keep Nara as S5/M4 operator surface and expose typed PI-agent access for Epii |
| `s5'.mef.*`, `s5'.ql.*` | [[S5']] | 10, 12 | specified in API/TS; philosophy/plugin resources now have first local package scaffold | `Body/S/S5/plugins/epi-logos`, `Body/S/S0/epi-cli/src/core/knowing` | `test_epii_agent_contract.py`, `agent_plugins.rs`, `core_knowing.rs` | partial | Expand epi-logos plugin resources into QL/MEF evaluator tests and Epii runtime binding |
| `s5'.kbase.*`, `s5'.gnosis.*` | [[S5']] | 6, 10, 11 | kbase/vimarsa/gnosis surfaces; no Epii governance service yet | `Body/S/S0/epi-cli/src/kbase/`, `vimarsa/`, `techne/gnosis`, `Body/S/S5/epi-gnostic` | `gnosis_commands.rs`, graph/kbase-adjacent tests | partial | Implement Epii strategy/governance layer over raw S2/S5 retrieval services |
| `s5'.improve.*` | [[S5']] | 11, 12 | Epii autoresearch core, improvement history, dry-run promotion planning, and gateway improve routes | `Body/S/S5/epii-autoresearch-core`, `Body/S/S0/epi-cli/src/gate/improve.rs` | `epii_recursive_spine_inspector.rs`, `gate_epii_improve.rs`, `m5-epii-review-surface.test.mjs` | current | Keep non-dry-run mutation blocked until compiler mutation law and UFV gates are accepted |
| `s5'.review.*` | [[S5']] | 10, 11 | durable review inbox, resolution history, human-required guard, and gateway review routes | `Body/S/S5/epii-review-core`, `Body/S/S0/epi-cli/src/gate/review.rs` | `review_governance.rs`, `gate_epii_review.rs`, `m5-epii-review-surface.test.mjs` | current | Preserve human-required judgement gates and Anima/Aletheia handoff provenance |
| `s5'.explain`, `s5'.teach`, `s5'.seed.generate` | [[S5']] | 10, 11, 12 | specified in TS; seed generation partially mirrored by vault/templates | `Body/S/S0/epi-cli/src/vault/templates.rs`, target epi-logos/Epii package | `idea_tree_templates.rs`, `vault_paths_templates.rs` | partial | Bind pedagogy/seed generation to Epii agent and compiler-governed artifact creation |

## Cycle 2 Method Classification Register

Track 13 T1 classifies the current gateway/API method surface as `COVERED`, `STUBBED`, or `DEFERRED` for cycle 2 planning. `COVERED` means real code and tests cover the consumed M' contract even if the executable adapter is still physically hosted in S0. `STUBBED` means there is usable substrate or specification, but the coordinate-native gateway/API surface is incomplete and must remain owner-gated. `DEFERRED` means the method family is intentionally held behind a later tranche, user-final gate, provider/live-service proof, or compiler mutation law.

| Method family | Cycle 2 class | Gap owner | Classification basis |
|---|---|---|---|
| `connect`, `agent.capabilities` | `STUBBED` | 13.T2 / 13.T5 | Product gateway connect is tested, but coordinate-native capability naming and drift guard remain the Track 13 alias/backlog work. |
| `s0.exec`, `s0.tool_surface`, `s0.env` | `COVERED` | 11.T0 / 13.T5 | S0 command, env, bootstrap, cmux, and return surfaces are live CLI mirrors with tests; later Track 13 only guards newly named methods. |
| `s1.read/write/search/template/frontmatter/backlinks/sync` | `COVERED` | 11.T1 / 13.T5 | Vault read/write/search/frontmatter behavior is real through S0/S1 mirrors; Track 11 owns consumed S1 closure and Track 13 guards naming drift. |
| `s1'.type/form/canvas/residency/compile/ledger/query/injection` | `STUBBED` | 11.T1 / 11.T2 | Hen/compiler substrate exists, but full public compiler authority, CT intake, family inference, and write discipline remain Track 11 closure work. |
| `s2.graph.query/node/traverse` | `COVERED` | 11.T3 / 13.T5 | Graph query/node/traverse are real S0 mirrors over S2 services; Track 11.T3 owns consumed graph-viewer closure before this becomes final coordinate-native API. |
| `s2'.retrieve/rerank/enrich/coordinate.resolve` | `STUBBED` | 11.T3 / 13.T2 | Retrieval/rerank/enrich work exists across graph services and external MCP, but the internal coordinate-native route table is not yet a single authority. |
| `s3.session.*`, `s3.channel.*`, `s3.message.route` | `COVERED` | 12.T3 / 13.T4 | Session, channel, chat, and lifecycle tests cover the consumed contract; Track 13.T4 owns product intent routing/deep-link grammar. |
| `s3'.temporal/day/kairos/presence/context` | `COVERED` | 12.T0 / 12.T3 / 13.T4 | Temporal context, Day/NOW, Redis/runtime, SpaceTimeDB bridge, and session continuity have real tests; Track 13.T4 owns intent routing over those handles. |
| `s4.agent.query/notify/status` | `COVERED` | 12.T1 / 13.T3 | Agent query/notify/status and gateway S4 coordinate surfaces are live enough for consumed M' use; OmniPanel/operator catalog remains Track 13.T3. |
| `s4'.vak/team/cs/orchestrate/thought/crystallise/notify_user/context/psyche/goal/permission` | `STUBBED` | 12.T1 / 10.T11 / 13.T3 | VAK/team/Psyche/permission surfaces have real first-pass code, but provider-backed Anima execution and full operator catalog remain owner-gated. |
| `s5.gnostic.ingest/query/status` | `STUBBED` | 12.T2 / 13.T5 | Gnosis command/service mirrors exist, but full Body-native Python environment and service availability proof remain deferred in the S5 closure notes. |
| `s5.episodic.*` | `STUBBED` | 12.T0 / 12.T2 / 13.T4 | Graphiti runtime ownership is split correctly between S3' runtime and S5 invocation governance; live Graphiti proof and routing polish remain guarded. |
| `s5.bimba.*` | `COVERED` | 12.T2 / 13.T5 | Bimba navigation and graph/kbase meaning-use are backed by S0 core, graph retrieval, and S5 status surfaces for current consumed use. |
| `s5.m.*` | `COVERED` | 12.T2 / 14.T2 | Nara/M' operator surfaces, FFI/portal clock, and privacy/review constraints are covered for safe consumed use; UFV gates keep protected behavior blocked. |
| `s5'.mef.*`, `s5'.ql.*` | `DEFERRED` | 12.T2 / 13.T5 | Plugin resources exist, but evaluator/runtime binding and method families are deliberately future Epii pedagogy work. |
| `s5'.kbase.*`, `s5'.gnosis.*` | `STUBBED` | 12.T2 / 13.T5 | Retrieval surfaces exist, but Epii governance over kbase/gnosis strategy remains incomplete and must not be treated as a native review authority. |
| `s5'.improve.*` | `COVERED` | 12.T2 / 14.T2 | Epii autoresearch core, improvement state, dry-run promotion planning, and human-required gates are live; non-dry-run mutation remains blocked by UFV/compiler law. |
| `s5'.review.*` | `COVERED` | 12.T2 / 14.T2 | Durable review inbox, resolution history, human-required guard, M5 DTOs, and S0 gateway review routes are live and tested. |
| `s5'.explain`, `s5'.teach`, `s5'.seed.generate` | `DEFERRED` | 12.T2 / 13.T5 | Teaching/seed generation are specified and partially mirrored, but Epii runtime binding and compiler-governed artifact creation remain future-gated. |

### Parity Conclusions

1. The current gateway manifest is product-native, not coordinate-native. It is useful and tested, but it cannot serve as the final S/S' API surface without an explicit translation layer.
2. S2 and S3 are the biggest residency mismatches: both have substantial real Rust code inside `Body/S/S0/epi-cli`, and both should be extracted before new feature work deepens the wrong ownership.
3. S4 has strong CLI/runtime foundations, but actual PI-agent invocation/access must be tested separately from install/config/spawn helpers.
4. S4/S4' has enough runtime material to become [[Anima]]'s dispatch spine, but [[Pleroma]] still needs to be audited as the baseline Anima capability package: extension primitives, skills, agents, hooks, and bounded toolsets should be separated deliberately.
5. S5 has useful world-return foundations, especially Nara, Gnosis, Epii review, and autoresearch. MEF/QL governance, pedagogy, and non-dry-run seed/canon mutation still need runtime binding, compiler law, and human-final gates before they can be treated as final public authority.
6. The first executable parity artifact should be generated from the TypeScript method table plus `gate/parity.rs`, then checked by tests. Hand-maintaining two method lists will drift.

## Command Surface Reconciliation

[[S0]] records live command reality, but command nesting does not define ontology by itself.

| Live command family | Coordinate interpretation |
|---|---|
| `epi core` | Cross-family coordinate kernel and [[S0']] knowing overlay |
| `epi vault` | [[S1]] / [[S1']] vault and compiler operations, with temporal anchoring from [[S3']] |
| `epi graph` | [[S2]] / [[S2']] graph, Redis, GraphRAG, semantic cache |
| `epi gate` | [[S3]] / [[S3']] gateway, sessions, cron, channels, app bridge |
| `epi gate graphiti` | Transitional control for current wrapper; target architecture is [[Graphiti]] as [[S3']] library/runtime with [[S5]] usage governance |
| `epi agent` | [[S4]] / [[S4']] PI runtime and [[Anima]] inhabitation law |
| `epi nara` | [[M4]] / [[M']] / [[Nara]] personal operator surface, typed under [[S5.m]] |
| `epi vimarsa`, `epi book`, `epi notebook`, `epi techne gnosis` | [[S5]] / [[S5']] world-return and knowledge surfaces |
| `epi up` | [[S0.5]] / [[S0.5']] full return bootstrap, eventually proving the whole stack is executable |

## Cross-Level Decisions Now Locked

1. [[S0]] is both first and last: every higher-level design must return to executable command/API/test shape.
2. [[S1']] is the compiler spine for vault artifacts, CT types, frontmatter, residency, and graduation.
3. [[S2]] owns raw graph/vector/cache substrate; [[S2']] owns coordinate-aware retrieval and enrichment law.
4. [[Redis]] has two distinct roles: S2 graph/context cache and S3 gateway/session/temporal context. These must not be conflated.
5. [[S3]] owns gateway transport/routing; [[S3']] owns temporal runtime, [[Day]], [[NOW]], [[Kairos]], shared context, and [[Graphiti]] architecture.
6. [[Graphiti]] is not canonically a sidecar. The current HTTP wrapper is a compatibility adapter around `graphiti-core`; target architecture is library/runtime integration at [[S3']] with [[S5]] usage governance.
7. Physical package residency and coordinate ownership are temporarily different in key places: `Body/S/S0/epi-cli/src/graph` is S2-owned code inside the S0 CLI package, and `Body/S/S0/epi-cli/src/gate` is S3-owned code inside the S0 CLI package. Future extraction should make these Body-native modules without breaking the S0 command return surface.
8. [[S4]] is the PI agent runtime; [[S4']] is [[Anima]] and VAK/CF/CS orchestration.
9. [[Aletheia]] remains [[S4.5']] as UX membrane and crystallisation trigger, not the whole of S5'.
10. [[S5']] is [[Epii]] as user-position, reflective developer portal, deep oracle, review recipient, and improvement law.
11. [[S5]] / [[S5']] enacts both [[M4]] and [[M5]]: [[Nara]] carries the user's [[Pratibimba]] / [[PASU]] evolution; [[Epii]] performs [[epi-logos]] over the system.
12. [[autoresearch]] is Epii's dynamic self-improvement spine. Its whole-system effects follow from Epii's #5 return position.
13. Human validation gates and meaning-review items should route to an Epii-accessible review inbox where [[Anima]] and [[Aletheia]] work becomes intelligible.
14. [[Notion]], webhooks, external automations, and publication surfaces remain valid S5 connectors but are secondary to the [[epi-logos plugin]] and Epii/Nara spine.

## Harmonisation Deltas

These are the current known deltas between the six level specs and the canonical FLOW/API/TS documents. They are not defects in the design; they are the next precision work.

| Delta | Source spec | Canonical files needing update | Required resolution |
|---|---|---|---|
| `s5'.review.*` method family | [[S5-SPEC]] | [[FLOW 2026 04 24 PI AGENT API v0.1]], [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] | Promoted into canonical API/TS docs; implementation and parity tests remain |
| `s_5_review_inbox_item`, `s_5_review_resolution` fields | [[S5-SPEC]] | [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]], [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] | Promoted into canonical envelope/TS docs; implementation and persistence schema remain |
| Gateway product/runtime RPC vs coordinate-native API | [[S0-SPEC]], [[S3-SPEC]] | API, TS, gateway manifest | Build translation/parity manifest so live gateway names do not obscure S/S' method homes |
| `epi gnostic` / `epi techne gnosis` naming | [[S0-SPEC]], [[S5-SPEC]] | CLI docs, API parity tests | Decide alias vs promotion after S5 API stabilises |
| `epi kbase` / `epi vimarsa` naming | [[S0-SPEC]], [[S5-SPEC]] | CLI docs, API parity tests | Decide whether `epi kbase` becomes canonical alias or Vimarsa remains the operator command |
| Graphiti wrapper demotion | [[S3-SPEC]], [[S5-SPEC]] | API, CLI, tests | Replace sidecar-first language with library/runtime adapter plus S5 usage policy |
| Body-native module extraction | [[S2-SPEC]], [[S3-SPEC]], [[S-CODE-RESIDENCY-PLAN]] | Build files, CLI wrappers, tests | Extract S2 graph services and S3 gateway/runtime modules from S0 package residency while preserving `epi` command mirrors |
| S0 return audit fields | [[S0-SPEC]] | Envelope, TS | Decide whether `s_0_session_exit_code` and `s_0_tool_resolution_log` enter v0.2 |

## Build Image

The next build wave should produce a system where:

- The gateway can route coordinate-native methods or expose an explicit product-to-coordinate parity map.
- The shared [[TypeScript]] package types every accepted API method and every envelope field.
- The [[Envelope]] schema contains every fact that persists, routes, gates, reviews, or promotes work.
- The CLI exposes stable typed mirrors for local operations without pretending command nesting is ontology.
- [[Anima]] can evaluate VAK, assemble context, dispatch work, and send review/crystallisation products to [[Epii]].
- [[Epii]] can receive review inbox items, query [[Gnosis]]/[[kbase]]/[[Bimba]]/[[Graphiti]], run [[autoresearch]], and promote decisions through [[Hen]] residency law.
- Tests use real commands, real vault writes, real graph/cache services where applicable, real retrieval, real review state, and real improvement evaluations. Mock-only tests do not prove this system.

## Next Shard Order

1. Convert the parity matrix above into an executable manifest generated from [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] plus `Body/S/S0/epi-cli/src/gate/parity.rs`.
2. Extract [[S2]] graph schema/services from the S0 CLI package while preserving `epi graph` as command mirror.
3. Extract [[S3]] gateway/session/Redis-context modules and add product-to-coordinate gateway parity tests.
4. Stabilise actual [[S4]] PI-agent invocation/access so the compiler and autoresearch spines are reachable by agents.
5. Build [[S5']] review/autoresearch modules as Epii capabilities, then return to [[S0]] with full-stack bootstrap/proof tests.

## Top-Layer Crystal - S/S' Umbrella Canon - 2026-06-02

This index is the canonical umbrella seed for the whole [[S/S']] substrate. It is not a tranche plan. It is the top-layer source that prevents shared kernel/profile, coordinate-family, and cross-cutting law from being collapsed into [[S0]] merely because [[S0]] is the command membrane.

### Top-Layer Authority Boundary

| Surface | Canonical owner | Non-owner guard |
|---|---|---|
| S/S' coordinate family | this file plus `Idea/Bimba/World/Types/Coordinates/S/**` | no individual S layer may redefine the family map |
| command executability | [[S0]] / [[S0']] | S0 does not own vault, graph, gateway, agent, review, or M' domain law |
| vault/form residency | [[S1]] / [[S1']] | S1 does not own temporal semantics or graph truth |
| graph/cache topology | [[S2]] / [[S2']] | S2 does not own Day/NOW session identity or Graphiti invocation policy |
| gateway/runtime/time projection | [[S3]] / [[S3']] | S3 does not own agent reasoning or protected Nara content |
| PI/ta-onta runtime | [[S4]] / [[S4']] | S4 does not own Epii's separate S5' user-position |
| world-return/review/improvement | [[S5]] / [[S5']] | S5 does not absorb command/runtime substrate |
| kernel/profile bridge | S/S' umbrella plus [[S0']], [[S3']], [[S5']], and [[M'-SYSTEM-SPEC]] | kernel is a cross-layer profile substrate, not an S0 coordinate dumping ground |

### World Ontology Corpus Lifted Into Seed Canon

The `Idea/Bimba/World` coordinate files are canonical source material for this umbrella. They define the coordinate ontology that the specs below crystallise into buildable contracts.

| Corpus | Files | mtime signal | Canonical role |
|---|---|---:|---|
| S base ontology | `Idea/Bimba/World/Types/Coordinates/S/S0/S0.md`, `S1/S1.md`, `S2/S2.md`, `S3/S3.md`, `S4/S4.md`, `S5/S5.md` | 2026-04-10 17:50:14..21:43:47 | original S0-S5 coordinate definitions |
| S' prime ontology | `Idea/Bimba/World/Types/Coordinates/S/S'/S0'/S0'.md`, `S1'/S1'.md`, `S2'/S2'.md`, `S3'/S3'.md`, `S4'/S4'.md`, `S5'/S5'.md` | 2026-04-10 17:50:37..2026-04-24 20:31:08 | inverted/prime coordinate definitions and ta-onta/Epii law |
| P / P' positional series | `Idea/Bimba/World/P.md`, `P0.md`, `P0'.md`, `P1.md`, `P1'.md`, `P2.md`, `P2'.md`, `P3.md`, `P3'.md`, `P4.md`, `P4'.md`, `P5.md`, `P5'.md` | 2026-04-11 00:38:15..01:01:49 | QL position and inversion semantics for layer diagrams |
| CT / VAK context family | `Idea/Bimba/World/CT0.md`, `CT1.md`, `CT2.md`, `CT3.md`, `CT4a.md`, `CT4b.md`, `CT5.md` | 2026-03-10 12:24:51..2026-03-15 00:29:32 | CT0-CT5 / CT4a / CT4b context-frame law |
| L / L' lens corpus | `Idea/Bimba/World/L0.md`..`L5.md`, `L0'.md`..`L5'.md`, `L0-0.md`..`L5-5'.md`, `L0.0.md`..`L5.5.md` | 2026-03-12 02:10:36..2026-04-11 09:58:12 | lens, Night/Klein, and sublens semantics used by VAK/MEF surfaces |
| World artifact forms | `Idea/Bimba/World/Daily-Note.md`, `NOW.md`, `Thought.md`, `Task-Spec.md`, `Pattern-Note.md`, `Prompt.md`, `Seed.md`, `FLOW.md`, `Integration-Preview.md` | 2026-03-10 12:24:51..2026-04-11 | S1/S1' form residency and Day/NOW artifact law |

### Canonical Source Coverage

| Source | mtime | Status in this umbrella |
|---|---:|---|
| `Idea/Bimba/Seeds/S/Legacy/specs/S/S-STACK-INTEGRATION.md` | 2026-03-07 01:51:35 | historical S-stack synthesis, superseded by this seed/index where more specific |
| `Idea/Bimba/Seeds/S/Legacy/specs/S/S_Series_Master_CLI_Architecture.md` | 2026-03-15 00:27:10 | historical CLI bridge and parity source |
| `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-S0i-CLI-CORE.md` | 2026-05-31 16:35:19 | crystallised into [[S0-SPEC]] and [[S0'-SPEC]] |
| `Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md` | 2026-06-02 00:14:25 | crystallised into [[S1-SPEC]] and [[S1'-SPEC]]; newest S formal spec |
| `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md` | 2026-05-31 16:35:19 | crystallised into [[S2-SPEC]] and [[S2'-SPEC]] |
| `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md` | 2026-05-31 16:35:19 | crystallised into [[S3-SPEC]] and [[S3'-SPEC]] |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md` | 2026-04-04 13:46:16 | crystallised into [[S4-SPEC]] and [[S4'-SPEC]] with later ta-onta/capability updates |
| `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md` | 2026-05-31 16:35:19 | historical sync framing; current S5 canon is Epii/review/autoresearch/world-return |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/00-overview-and-sequencing.md` | 2026-06-02 00:17:08 | implementation-track orientation only; seed canon wins on architecture |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md` | 2026-05-31 20:57:23 | S0/S0' nominal track, not top-layer owner |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md` | 2026-05-31 20:36:57 | S2/S2' nominal track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md` | 2026-06-01 18:27:27 | S3/S3' nominal track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md` | 2026-05-31 20:56:45 | S5/S5' nominal track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` | 2026-06-02 00:16:51 | S4/S4' mediation and cross-agent capacity track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md` | 2026-06-02 00:17:57 | cross-cutting status, not canon |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` | 2026-06-02 00:14:24 | decision register source |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/13-s-sprime-modularity-and-s0-membrane-cleanup.md` | 2026-06-01 23:57:36 | cleanup pressure; this seed resolves ownership boundaries |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.index.json` / `plan.state.json` | 2026-06-02 11:40:41 | ledger only; cited for track ownership, not edited |

Per hard scope, the plan/spec files above were not edited during this crystallisation pass. Where a plan is newer than an older seed fragment, the load-bearing architectural decision is represented here or in the layer seed; the plan remains an implementation track artifact.

## Canonical Reading Protocol - S/S'

Before any implementation orchestrator scopes S/S' work, it must read:

1. [[ARCHITECTURE-DIAGRAM-PACK]] for the whole-system map, gateway method ownership, lifecycle seams, and cross-cutting concerns.
2. This [[S-SYSTEM-INDEX]] for top-layer [[S]] / [[S']] ownership, shared kernel/profile boundaries, source coverage, and harmonisation deltas.
3. The exact layer seed: [[S0-SPEC]], [[S1-SPEC]], [[S2-SPEC]], [[S3-SPEC]], [[S4-SPEC]], [[S5-SPEC]], [[S0'-SPEC]], [[S1'-SPEC]], [[S2'-SPEC]], [[S3'-SPEC]], [[S4'-SPEC]], or [[S5'-SPEC]].
4. The subcoordinate shard specs only after the layer seed has fixed ownership.

`docs/plans/**` and `docs/specs/**` are not first-read canon. They are cited evidence, historical fragments, or implementation tracks once the seed has named them. This is the guard against partial slices that implement whichever fragment a grep found first.

## Internal QL Breakdown Source Rule

Every S/S' internal 0-5 or QL breakdown must be traceable to one of these sources:

| Coordinate | World ontology source | Seed crystal |
|---|---|---|
| [[S0]] / [[S0']] | `Idea/Bimba/World/Types/Coordinates/S/S0/S0.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/S0'/S0'.md` | [[S0-SPEC]], [[S0'-SPEC]] |
| [[S1]] / [[S1']] | `Idea/Bimba/World/Types/Coordinates/S/S1/S1.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` | [[S1-SPEC]], [[S1'-SPEC]] |
| [[S2]] / [[S2']] | `Idea/Bimba/World/Types/Coordinates/S/S2/S2.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.md` | [[S2-SPEC]], [[S2'-SPEC]] |
| [[S3]] / [[S3']] | `Idea/Bimba/World/Types/Coordinates/S/S3/S3.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.md` | [[S3-SPEC]], [[S3'-SPEC]] |
| [[S4]] / [[S4']] | `Idea/Bimba/World/Types/Coordinates/S/S4/S4.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md` | [[S4-SPEC]], [[S4'-SPEC]] |
| [[S5]] / [[S5']] | `Idea/Bimba/World/Types/Coordinates/S/S5/S5.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.md` | [[S5-SPEC]], [[S5'-SPEC]] |

The shared QL/VAK language is sourced from [[P]], [[P0]], [[P0']], [[P1]], [[P1']], [[P2]], [[P2']], [[P3]], [[P3']], [[P4]], [[P4']], [[P5]], [[P5']], [[CT0]], [[CT1]], [[CT2]], [[CT3]], [[CT4a]], [[CT4b]], [[CT5]], [[L0]], [[L0']], [[L1]], [[L1']], [[L2]], [[L2']], [[L3]], [[L3']], [[L4]], [[L4']], [[L5]], and [[L5']]. If a future seed edit introduces a new internal breakdown term not traceable to those files or to an existing sibling seed, it must mark the term as open rather than canonical.

Row-level provenance rule: each internal S/S' 0-5 row must carry one of these derivation statuses when it is used for implementation scoping:

| Status | Meaning |
|---|---|
| `direct World ontology` | The row is explicitly named or directly implied by the matching `Idea/Bimba/World/Types/Coordinates/S/**` coordinate file. |
| `seed-side crystallisation` | The row crystallises World prose, older specs, and landed implementation contracts into a buildable S/S' surface; the owning seed must name its source coverage. |
| `historical/superseded` | The row survives as genealogy but is not current build canon. |
| `open` | The row is not settled enough for implementation authority and must not be silently promoted. |

For S base specs, the existing `Internal 0-5 Breakdown` tables plus the 2026-06-02 `Canonical Source Lock` sections are the current row-level provenance surface. For standalone S' specs, the `Internal QL 0-5 Provenance` sections carry the same role.

## Ta-Onta As S4' Rule

[[ta-onta]] is the internal [[S4']] carrier set: [[S4.0']] [[Khora]], [[S4.1']] [[Hen]], [[S4.2']] [[Pleroma]], [[S4.3']] [[Chronos]], [[S4.4']] [[Anima]], and [[S4.5']] [[Aletheia]]. Treating [[ta-onta]] as a separate system, a loose plugin collection, or a peer layer beside [[S4']] is superseded historical framing. The [[VAK]] stack [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] is the vertical dispatch grammar that moves through those carriers.
