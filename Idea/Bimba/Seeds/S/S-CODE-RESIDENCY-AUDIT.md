---
coordinate: "S/S'"
c_4_artifact_role: "audit"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-27T00:00:00Z"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[S-CODE-RESIDENCY-PLAN]]"
---

# S/S' Code Residency Audit

## Purpose

This audit records the current pre-development repo state for the active code roots. It is an observation and move-readiness artifact, not a directory move.

Scope constraints:

- `/docs`, `vendor/`, and `vendors/` are out of picture as movement candidates for this pass.
- Runtime/generated state is classified, but not proposed for movement until its source-of-truth path is proven.
- The target is implementation clarity: every root needs an [[S]] / [[S']] home, source/runtime status, schema authority, and real test requirement before code is moved.
- Update note: the first Body-native move has now happened. Root package shims such as `epi-cli`, `epi-lib`, `epi-app`, `bimba-mcp`, `epi-gnostic`, `.pi`, and `plugins` should not be treated as active source roots. Their source homes are under `Body/`; any remaining root references are compatibility debt or stale documentation.

## Executive Verdict

The design decisions are locked more strongly than the first pass stated. The remaining problem is not conceptual indecision; it is code conformance and repo residency.

The target facts now treated as settled:

- Canonical graph node label is `:Bimba`.
- Canonical embedding space is 3072-dim, using the current Gnosis/Gemini direction unless a future spec supersedes it explicitly.
- Canonical frontmatter/envelope key law is `{family}_{n}_{semantic}`, with only deliberately named exemptions such as `coordinate`.
- Redis-backed live context is [[S3']] temporal/contextual infrastructure. S2 may consume graph/cache handles, but S3 owns Redis as the living session, NOW, Day, kairos, arc, and context-continuity substrate.
- `_staging/` is not a residency anchor. It is salvage/retire material, not an organizing center for the system.

The strongest immediate conformance gaps are:

- [[Neo4j]] implementation drift: `Body/S/S0/epi-cli/src/graph/schema.rs` still creates an old 768-dim `coord_embedding` vector index and multiple Rust graph modules still query old properties/labels, while the target is `:Bimba` with 3072-dim canonical embedding/schema law.
- Frontmatter implementation drift: `Body/S/S4/ta-onta/S4-1p-hen/S1'/frontmatter_schema.ts` expresses the locked schema law, while `Body/S/S0/epi-cli/src/vault/frontmatter.rs` still accepts older bare keys as canonical-looking fields. Rust should become a mirror/compatibility layer, not a second schema authority.
- Plugin/source/runtime ambiguity: `Body/S/S4/pi-agent` is the repo-native PI source tree today, `.epi` is synced managed runtime state, and `Body/S/S4/plugins/pleroma` is a packaged plugin bundle. The target source residency should separate embodied code from vault reflection while preserving required tool shims.
- [[Graphiti]] still has sidecar-first code paths: `Body/S/S5/epi-gnostic` exposes `epi-graphiti`, and `Body/S/S0/epi-cli/src/gate/graphiti.rs` manages a compatibility wrapper. Specs now say target architecture is [[S3']] library/runtime integration with [[S5]] / [[S5']] usage governance.
- The review inbox, [[Psyche]] state, and permission schema remain designed in the S specs but are not yet canonical in the live envelope/API/TypeScript implementation.
- [[SpaceTimeDB]] has advanced past the earlier presence-shaped audit: `Body/S/S3/epi-spacetime-module` now declares gateway, agent, client, session, temporal event, and Kairos surface contracts, and the current S0-hosted gateway can register gateway/client/agent/session/heartbeat/Kairos surfaces against those reducers when configured. Gateway health and the portal registry now distinguish registration readiness from projection-subscription readiness. The remaining residency gap is Body-native extraction and actual TUI/desktop subscription usage.
- [[Redis]] now has a proven S3' temporal key law and live hydration path under `s3:gateway:temporal:*`, verified against Docker Redis on 2026-05-07. The remaining gap is package extraction into `Body/S/S3/redis-context`, plus keeping S2 graph/cache Redis behind separate APIs.

See [[S-CODE-RESIDENCY-PLAN]] for the target residency law and repo layout proposal.

## Active Code Foundation Inventory

| Current path | Current role | Apparent coordinate | Intended residency stance | Move readiness |
|---|---|---|---|---|
| `Body/S/S0/epi-cli/` | Rust `epi` binary, command tree, gateway, vault, graph, agent, nara, gnosis bridges | [[S0]] / [[S0']] returning through all levels | Source home is now Body-native; modules retain coordinate namespaces internally | Must keep build/tests path-clean without root `epi-cli` shim |
| `Body/S/S0/epi-lib/` | C/M-family engine material and headers | [[S0]] ground for [[M']] body | Source home is now Body-native; BLAKE3 C vendor lives at `Body/S/S0/vendor/blake3` | Must keep Makefile and generated LUT paths Body-native |
| `Body/S/S1/hen-compiler/` | Python compiler/vendor-style knowledge-base package | [[S1']] compiler vendor basis | Source home is now Body-native, but package identity still needs Hen/compiler naming cleanup | Must be raised from vendor package identity into Hen compiler spine |
| `Body/S/S5/epi-gnostic/` | Python [[Gnosis]], [[RAG-Anything]], [[LightRAG]], [[Neo4j]], embeddings, temporary Graphiti wrapper | [[S5]] world-return service using [[S2]] graph substrate | Source home is now Body-native; S2 schema pieces must be extracted or imported from S2 authority | Must conform to `:Bimba`/3072 and shed Graphiti sidecar authority |
| `Body/S/S2/external/bimba-mcp/` | External MCP server for graph/coordinate access | [[S2']] external graph interface | Source home is now Body-native | Must become external adapter over canonical schema, not schema source and not PI-agent internals |
| `Body/S/S3/epi-spacetime-module/` | SpacetimeDB module declaring gateway, agent, client, session, temporal event, and Kairos projection contracts | [[S3]] / [[S3']] live registration and projection plane | Source home is now Body-native | Live gateway/client/agent/session/heartbeat wiring exists in the current S0-hosted gateway; readiness is visible through health/portal surfaces; next wire actual TUI/desktop subscriptions and extract the S3 runtime body |
| `Body/S/S3/epi-app/` | Electron app, S3 gateway client, M-domain UI, capability envelopes | [[S3.5]] / [[S4]] app bridge and inhabitation surface | Source home is now Body-native; future Tauri v2 port should preserve useful renderer/domain work while replacing Electron main authority | Must mirror TUI portal layout and consume gateway RPC plus SpaceTimeDB projection rather than inventing a parallel settings/state model |
| `Body/S/S4/pi-agent/` and `Body/S/S4/ta-onta/` | Repo-native PI source tree synced by `epi agent`; contains [[ta-onta]] | [[S4]] runtime source today; [[ta-onta]] is [[S4']] API/base surface | Source home is now Body-native; ta-onta modules are `S4-0p-khora` through `S4-5p-aletheia`; root `.pi` shim has been removed | Must preserve `epi agent` sync/install/spawn behavior and S4.0'-S4.5' internal structure |
| `.epi/` | Managed runtime state, gate state, synced agent copies, logs/sessions | [[S3]] / [[S4]] runtime output | Runtime state, not source. Future conceptual home: `Run/epi` or hidden compatibility root | Do not treat as code residency |
| `Body/S/S4/plugins/` | Plugin registry and packaged `pleroma` bundle | Package/install boundary for [[S4']] and later [[S5']] plugins | Package home is now Body-native for Pleroma; `Body/S/S5/plugins/epi-logos` is the planned Epii plugin lane | Must define source -> package -> runtime lifecycle |
| `tools/` | Helper scripts for LUT, E2E, GitNexus, OMX setup | [[S0']] support | Target home: `Body/S/S0/tools` or per-level `Body/S/Sx/tools` if owned by a level | Must be assigned by owner |
| `src/` | Single `qv_data.c` root file | [[S0]] / [[C]] legacy data | Target: `Body/S/S0/epi-lib` or retired into Seeds as data artifact | Must not remain root ambiguity |
| `_staging/` | Old fragments: plugin sketch, hooks, skills, evals, root commands, retired NotebookLM | No canonical residency | Salvage/retire only after plan; not a source home | Red herring, not an organizing target |
| `_tmp_taonta_analysis/` | Temporary analysis reports | No active code coordinate | Archive or delete after confirming absorbed into specs | Red herring, not an organizing target |
| `Idea/` | Vault, specs, flows, seeds, runtime reflections | [[S1]] self-grounding | Keep as vault authority for markdown/canvas/reflection, not active package source | Code leaves vault except deliberate examples/fixtures |

## Residency Matrix

| Coordinate | Source/root evidence | Current mismatch | Required clarification |
|---|---|---|---|
| [[S0]] / [[S0']] | `Body/S/S0/epi-cli`, `tools`, `src/qv_data.c`, Khora shell helpers in `Body/S/S4/ta-onta/S4-0p-khora` | Command structure mirrors the full S/S' and M/M' systems, but not every command's ontology matches its nesting | Add API/CLI parity manifest before moving command code |
| [[S1]] / [[S1']] | `Idea`, `Body/S/S1/hen-compiler`, Hen templates/frontmatter in `Body/S/S4/ta-onta/S4-1p-hen` | Compiler vendor basis is present but not yet named cleanly in code/package identity | Decide final package identity for the S1' compiler |
| [[S2]] / [[S2']] | `Body/S/S0/epi-cli/src/graph`, `Body/S/S5/epi-gnostic/cypher`, `Body/S/S2/external/bimba-mcp` | Live graph code is physically inside the S0 CLI package and still carries old labels/properties/vector dimensions; Redis code is mixed into graph modules where S3 owns live context | Conform graph code to `:Bimba`/3072; establish `Body/S/S2/graph-schema` / graph-service authority before extraction |
| [[S3]] / [[S3']] | `Body/S/S0/epi-cli/src/gate`, `.epi/gate`, `Body/S/S3/gateway-contract`, `Body/S/S3/epi-spacetime-module`, `Body/S/S3/epi-app/main/s3-gateway-client.ts` | Gateway state is real but physically inside the S0 CLI package; the first S3' temporal context surface now exists at `gate/temporal.rs`; SpaceTimeDB schema and current gateway registration wiring exist, but TUI/desktop subscription usage is not complete; Graphiti sidecar management and temporal library target still conflict | Keep current wrapper as compatibility only; extract `Body/S/S3/gateway`, `Body/S/S3/redis-context`, `Body/S/S3/graphiti-runtime`, then wire live SpaceTimeDB subscription/readiness paths |
| [[S4]] / [[S4']] | `Body/S/S4/pi-agent`, `.epi/agents`, `Body/S/S0/epi-cli/src/agent`, full `Body/S/S4/ta-onta` tree, VAK/Anima/Aletheia tests | `.epi` contains synced copies and transcripts; `Body/S/S4/pi-agent` is source; `Body/S/S4/plugins/pleroma` packages overlapping material; earlier audit language underplayed Khora-Hen-Pleroma-Chronos-Aletheia as internal S4' carriers | Formalise S4 runtime plus S4' ta-onta API/base: Khora=S4.0', Hen=S4.1', Pleroma=S4.2', Chronos=S4.3', Anima=S4.4', Aletheia=S4.5' |
| [[S5]] / [[S5']] | `Body/S/S5/epi-gnostic`, `Body/S/S0/epi-cli/src/nara`, `Body/S/S0/epi-cli/src/vimarsa`, `Body/S/S5/plugins/epi-logos`, `Body/S/S4/plugins/pleroma` skills | Epii separate PI runtime is not yet fully embodied; review inbox, autoresearch spine, and epi-logos plugin scaffold now have local canonical code | Expand S5 plugin resources and Epii runtime binding before moving deeper world-return code |

## Schema Authority Matrix

| Schema | Current authorities | Gap | Proposed authority |
|---|---|---|---|
| Frontmatter | `Body/S/S4/ta-onta/S4-1p-hen/S1'/frontmatter_schema.ts`; `Body/S/S0/epi-cli/src/vault/frontmatter.rs` | TS enforces strict coordinate-key law; Rust accepts old bare metadata keys | Hen S1' schema should be canonical; Rust should become a tested mirror or compatibility layer |
| Envelope | [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]; `Body/S/S3/epi-app/shared/capabilities/envelope.ts` | App envelope only carries version/capability/payload/session/causality/timestamp | Canonical envelope fields belong in FLOW/TS, then app/gateway implement the routed subset |
| TypeScript API | [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]; `Body/S/S0/epi-cli/schemas`; `Body/S/S3/epi-app/shared/capabilities` | Runtime shared types do not yet cover all S5 review/Psyche/permission deltas | Promote accepted deltas into shared package before gateway work |
| Neo4j/vector | `Body/S/S0/epi-cli/src/graph/schema.rs`; `Body/S/S5/epi-gnostic/cypher/00-bootstrap.cypher`; `Body/S/S5/epi-gnostic/config.py`; migration scripts | Live code still contains `:BimbaNode`, `:BimbaCoordinate`, and 768-dim paths | Conform to locked `:Bimba` + 3072 schema; migration code handles historical labels only |
| Redis | `Body/S/S0/epi-cli/src/graph/redis_cache.rs`; `Body/S/S0/epi-cli/src/gate/temporal.rs`; semantic cache tests; Graphiti wrapper Redis cache; gateway/session state | Redis graph cache code is still implemented in graph paths, while S3' now owns the live temporal key law and hydration path under `s3:gateway:temporal:*`, including DAY/NOW, DAY Kairos, session Kairos, agent orientation, and personal orientation refs. Live Docker Redis hydration passed on 2026-05-07. | S3' owns Redis-backed live context; S2 consumes graph/cache handles through explicit APIs; extraction target is `Body/S/S3/redis-context` |
| Graphiti | `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`; `Body/S/S0/epi-cli/src/gate/graphiti.rs`; Aletheia tools | Current HTTP sidecar contradicts target library/runtime architecture | S3' owns runtime integration; S5/S5' owns invocation/search/arc governance |
| Review inbox | S5 specs only | No canonical live envelope/API/TS implementation found | Add `s5'.review.*` methods and `s_5_review_*` fields before implementation |
| Psyche/permission | S4/S5 specs; agent permission fields in `.pi` | No unified API schema for `s4'.psyche.*` / `s4'.permission.get` | Promote into API/TS/envelope as S4' authority |

## Path Dependency Findings

- `Body/S/S4/pi-agent/README.md` explicitly defines the repo-native PI source of truth and `.epi/agents/<agent-id>/agent` as synced managed runtime. This is the cleanest current source/runtime boundary.
- `Body/S/S0/epi-cli` tests now point at `Body/S/S4/plugins/pleroma`, `Body/S/S4/ta-onta`, `.epi/gate`, and `vendors/oh-my-codex`; movement of any of those roots needs targeted tests first.
- The Pleroma packaged plugin is now `Body/S/S4/plugins/pleroma`; packaged plugin movement must keep registry and tests together.
- `Body/S/S4/plugins/pleroma/.claude-plugin/plugin.json` describes Pleroma as an S4' executive layer, while `Body/S/S4/ta-onta/S4-2p-pleroma/CONTRACT.md` describes Pleroma as S2 execution substrate registry. This is a naming/coordinate drift that must be resolved before packaging work.
- `Body/S/S4/ta-onta/S4-2p-pleroma/CONTRACT.md` already contains a useful staging disposition table, but it is internally stale in places: it says 7 bounded primitives while an invariant still says all 9 primitives.
- `Body/S/S0/epi-cli/src/gate/graphiti.rs` searches for `docker-compose.epi-s2.yml` and expects a `graphiti` service. This is compatibility debt now that S2 compose is Neo4j/Redis only and Graphiti target architecture is S3' library/runtime integration.
- `Body/S/S3/epi-app/shared/capabilities/contracts.ts` has a useful capability envelope, but it is not the full system envelope defined by [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]].

## Target Layout Proposal

This is a conservative target stance, not a command list.

| Current path | Target stance | Rationale | Pre-move proof |
|---|---|---|---|
| `_tmp_taonta_analysis/` | Archive or graduate into `Idea/Bimba/Seeds` | Temporary analysis should not remain as active code root | Search proves no runtime imports; useful facts are linked into specs |
| `_staging/epi-logos-plugin/` | Promote only after S5 plugin contract is written | Likely seed for [[epi-logos plugin]], but current plugin is not canonical | Compare with S5/S5' specs and external plugin plan |
| `_staging/pleroma-*` | Split by owner: Anima, Aletheia, Khora, Pleroma | Existing Pleroma contract already says staged content is mixed | Validate `.pi` target folders and plugin packaging tests |
| `src/qv_data.c` | Classify under `epi-lib`, `epi-cli`, or archive | Lone root source file obscures ownership | `rg qv_data` and build proof show true dependency |
| `Body/S/S4/plugins/pleroma` | Keep as package surface; derive from source roots | Plugin bundle should be installable output/source package, not a second ontology | `Body/S/S0/epi-cli` plugin tests pass after any source-package clarification |
| `.pi` | Keep as source root | It is explicitly synced into managed agents | `epi agent doctor`, sync, and spawn tests pass |
| `.epi` | Keep as runtime state or ignore generated copies | Contains logs, sessions, synced agent copies | Gate/agent runtime tests keep using clean temp homes where possible |
| `epi-cli`, `epi-gnostic`, `epi-app`, `bimba-mcp` | Keep roots during schema/API parity work | These are high-blast-radius active packages | Build/test/parity matrices exist first |

## Movement Batches

### Batch 0 - Residency law

- Create [[S-CODE-RESIDENCY-PLAN]] as the target law.
- Treat existing roots as current implementation state, not target design.
- Do not let `_staging` drive the plan.

### Batch 1 - Source/residency skeleton

- Establish the `Body/S/S0` through `Body/S/S5` target tree as the source-code embodiment map.
- Decide which root compatibility shims remain: `.pi`, `.epi`, `plugins`, and package roots.
- Keep `Idea/` as vault/spec/reflection, not active package source.

### Batch 2 - High-pressure conformance

- S3 Redis/context ownership: move/rename APIs and docs around temporal context law.
- S2 graph schema conformance: `:Bimba`, 3072, canonical properties/index names.
- S1 frontmatter conformance: Rust validator mirrors Hen schema law.

### Batch 3 - PI/plugin embodiment

- Define `.pi` source compatibility over `Body/S/S4/pi-agent` and `Body/S/S4/ta-onta`.
- Preserve ta-onta as S4' internally articulated from S4.0' through S4.5'.
- Define `Body/S/S4/plugins/pleroma` as package/install surface, not separate ontology.
- Define `.epi` as runtime state only.

### Batch 4 - S5 spine embodiment

- Locate or import the [[epi-logos plugin]] source under `Body/S/S5/plugins/epi-logos`.
- Locate [[autoresearch]] as the [[Epii]] improvement spine under S5.
- Implement review inbox/API/envelope as Epii-facing return infrastructure.

## Depwire Refresh - 2026-05-07

Depwire docs were regenerated at `docs/dev/architecture/depwire` against the Body-native core profile, excluding vendors, worktrees, docs, caches, targets, and Smart Env generated state.

Current depwire snapshot:

- Files parsed: 632.
- Symbols: 11,252.
- Edges: 3,846.
- Health score: 64/100, grade D.
- Orphan files: 251.
- Potentially dead symbols: 7,008 high-confidence candidates.
- TODOs: 8.

Interpretation rule: depwire dead-code output is a triage surface, not a deletion order. It flags entrypoint scripts, public schemas, exported contracts, and generated-facing surfaces as unreferenced when they may still be runtime/API authorities. Use it to focus review, then prove deletability with search, tests, and runtime checks before removal.

Standalone `depwire dead-code --stats` over the wider tree reported 24,538 high-confidence candidates because that command does not accept the same vendor/worktree excludes used by the docs pass. Treat the vendor-excluded docs snapshot above as the actionable project audit, and use the wider number only as evidence that vendor and public-API noise must be filtered before deletion work.

High-signal depwire audit candidates:

1. `Body/S/S2/external/bimba-mcp/src/index.ts` still contains TODOs for Neo4j connection/query, semantic search/embeddings, context retrieval, and coordinate listing. Because `bimba-mcp` is external S2' only, these should become adapters over canonical S2 services, not PI-agent internals.
2. `Body/S/S3/epi-app/renderer/domains/M5_Epii/core/useEpii.ts` and `Body/S/S3/epi-app/renderer/stores/epiClawStore.ts` still contain gateway/session TODOs that should be resolved through S3 gateway RPC and SpaceTimeDB projection, especially before the Tauri v2 spec/port.
3. `Body/S/S0/epi-cli/src/portal/plugins/clock.rs` is marked deprecated in favor of `unified_clock.rs`; confirm no registry/runtime path still needs it, then delete or quarantine with tests.
4. `epi_logos.c` still carries a TODO for inversion; classify under S0/M-family engine work or retire it if superseded by `Body/S/S0/epi-lib`.

## Next Concrete Task List

1. Wire actual TUI/desktop subscription usage over the live SpaceTimeDB projection now that gateway/client/agent/session/heartbeat/Kairos registration and readiness surfacing exist.
2. Extract the S3 gateway and Redis temporal-context bodies out of `Body/S/S0/epi-cli/src/gate` into Body-native `Body/S/S3/gateway` and `Body/S/S3/redis-context`, while preserving `epi gate` as the S0 mirror.
3. Replace Pratibimba/Graphiti sidecar-shaped paths with the local S3' graph/runtime contract and keep S5/S5' invocation, search, disclosure, and arc governance above it.
4. Work the high-signal depwire debt: `bimba-mcp` TODOs, Epi app gateway/Tauri TODOs, deprecated portal `clock.rs`, and `epi_logos.c` classification.
5. Continue S0' portal readiness so raw-service state, agent invocation/access state, and human-gated review state are visibly distinct.
6. Prepare the Tauri v2 desktop migration spec from the current `Body/S/S3/epi-app` state, mirroring the TUI `0` / `/` / `1` portal and consuming gateway RPC plus SpaceTimeDB subscriptions.
7. Keep older staging/qv/plugin-pipeline cleanup as secondary residency debt; do not let it displace the gateway/Redis/SpaceTimeDB/Graphiti extraction line.
