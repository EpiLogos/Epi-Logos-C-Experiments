---
coordinate: "S/S'"
c_4_artifact_role: "technical-capability-freeze"
c_1_ct_type: "CT1"
c_3_created_at: "2026-08-17"
c_0_source_coordinates:
  - "[[AUTHORITATIVE-SOURCE-MANIFEST]]"
  - "[[S-SYSTEM-INDEX]]"
---

# RECON-R1 S / S' Technical Capability Matrix

Pinned source head: `8608648f33e697dd5a8c5f499492619a02259af5`.

This matrix is intentionally **not** a second six-domain naming scheme. Current active repository law places Anuttara→Epii on the M/M' family. S/S' describes the technical/runtime strata and their Epi-Logos-aware conjugate/augmentation laws.

## 1. Stack-level freeze

| S/S' | Base technical body | Prime / conjugate law | Current implementation authority | Material providers / adapters | Principal M' consumers |
|---|---|---|---|---|---|
| `S0/S0'` | CLI, shell/process ground, executable discovery, build/bootstrap, local command/materialisation layer. | Reflective CLI/tool/environment/terminal contract; command shape, runtime method, bootstrap and audit return. | `Body/S/S0/epi-cli`, `epi-lib`, `portal-core`; spec `Idea/Bimba/Seeds/S/S0/S0-SPEC.md` blob `8c25e45ec071d91c59198c80d8d4bf49424efa7e`. | OS shell, tmux/cmux, preferred CLI tools, package/build toolchains. | All M' surfaces indirectly; especially M1–M4 kernel/profile substrate and M5 developer/operator reflection. |
| `S1/S1'` | Local vault/filesystem/markdown/frontmatter/wikilink/canvas residency. | Hen compiler/residency/content law: CT templates, frontmatter validation, write/move integrity, compile/query/inject and crystallisation. | `Body/S/S1/hen-compiler-core` is canonical law; `hen-compiler` vendor-derived compatibility/probe body. Spec blob `177b9fe9145ef881087425e5daa8100ec7f73746`. | Obsidian, `obsidian-cli`, vendor compiler substrate, filesystem. | M4 protected artifacts, M5 canon/philosophy, M0 source/MOC navigation. |
| `S2/S2'` | Graph body: Neo4j persistence, schema, seed/import, raw Cypher, coordinate sync, graph semantic-cache use. | Coordinate-aware graph law: relation registry, pointer law, resolve/retrieve/rerank/enrich, GDS/ontology, disclosure and context-pool assembly. | `Body/S/S2/graph-schema`, `graph-services`, `ontology`; spec blob `e8738138907b5711e5bafa13fcfb7223a890856c`. | Neo4j; Redis runtime consumed for graph cache; external `Body/S/S2/external/bimba-mcp` adapter. | M0 graph field; M1 traversal; M2 correspondences; M3 symbolic graph metadata; M4 public anchors; M5 graph/RAG retrieval. |
| `S3/S3'` | Gateway control plane: WebSocket/RPC, request routing, sessions/channels/config/cron/events and app/device/node control surfaces. | Shared temporal/state law: DAY/NOW/Kairos, session truth, Redis live context, Graphiti temporal episodic runtime, presence/subscriptions, SpaceTimeDB projection. | `Body/S/S3/{gateway,gateway-contract,epi-spacetime-module,graphiti-runtime,redis-context}`; spec blob `33a6f9eed0a867684f8f693fe63c4c8253cac7c4`. | WebSocket/JSON-RPC; ACP additive protocol; Redis/RedisVL; SpaceTimeDB; Graphiti library/runtime. | M2/M3/M4/M5 live temporal state; M4 episodic context; M0 active-now overlay. |
| `S4/S4'` | Harness-agnostic agent runtime: managed PI body, agent/model/provider/auth profiles, spawning, skills, teams/subagents and bounded execution. | ta-onta inhabitation law: Khora/Hen/Pleroma/Chronos/Anima/Aletheia internal carriers; VAK dispatch; capability governance; constitutional actor mediation. | `Body/S/S4/{pi-agent,ta-onta,plugins}`; Pleroma capability matrix is executable governance authority. Spec blob `62ecb0c4e9f8d267ce60700624928197430b3631`. | PI/harness providers, model/provider/auth backends, local coding-agent lanes. | M5 control room and governed operations; M4 sendoff/review pathways; cross-M agent mediation. |
| `S5/S5'` | Integral world-boundary: Gnosis/RAG corpus, kbase, external knowledge return, M' function exposure and outward/inward exchange. | Epii return law: deep knowledge, review, pedagogy, Graphiti usage governance, autoresearch, keep/discard/promotion, Möbius return and user-position stewardship. | `Body/S/S5/{epi-gnostic,epi-kbase(-core),epii-review-core,epii-autoresearch-core,epii-agent-core,epii-agent}`; spec blob `067d0deb1dfa054b4500468c2e7ee194c7a9297d`. | RAG-Anything/LightRAG stack, external source providers, NotebookLM/Vimarsa/kbase integrations. | M4 review/promotion and M5 Epii workbench directly; safe traces from M1–M3 may enter as evidence. |

## 2. S0/S0' — command/runtime materialisation

Frozen responsibilities:

- `S0-COMMAND`: canonical local command/process execution surface and command tree.
- `S0-KERNEL-BODY`: current C/Rust kernel materialisation for M0–M5 computational invariants and shared profile.
- `S0-ENV`: cwd/env/executable discovery and provider/tool resolution.
- `S0-BOOTSTRAP`: build/install/up/verify/bootstrap return surface.
- `S0-TERMINAL`: terminal/session body such as tmux/cmux; this is persistence/UI body, not semantic session authority.
- `S0P-CLI-LAW`: coordinate-native command/API mirror and audit-return law.

Explicit correction retained from the master spec: the old S0' reading as a Pydantic-style QL enforcement API is superseded. Current type/runtime law is distributed across shared typed contracts, S1' content schema, S4' VAK/governance and S5' evaluation.

Source/write boundary: S0 executes; it does **not** become owner of vault, graph, gateway, agent or world-return semantics merely because their commands are mirrored under `epi`.

## 3. S1/S1' — vault body and Hen law

Frozen responsibilities:

- `S1-FILES`: material local file/markdown/canvas/attachment storage.
- `S1-FRONTMATTER`: parsed YAML/frontmatter and coordinate metadata representation.
- `S1-WRITE`: authorised local content mutation path.
- `S1P-RESIDENCY`: canonical source/form/type/day/thought residency resolution.
- `S1P-HEN-COMPILER`: CT-aware compile/query/inject/ledger spine and `CompilerInvocation` contract.
- `S1P-WIKILINK-INTEGRITY`: rename/move/write protection preserving graphable source links.
- `S1P-GRAPH-PROMOTION-INTENT`: pure intent/request contract toward S2; S1' does not directly assume graph write authority.

Current canonical implementation: `hen-compiler-core` is authoritative S1' law. The Python `hen-compiler` fork remains useful compatibility/probe material but is not the target authority.

## 4. S2/S2' — graph body and coordinate-aware graph law

Frozen responsibilities:

- `S2-SCHEMA`: canonical `:Bimba` graph schema, coordinate properties, relationship/property registry and index intent.
- `S2-IMPORT`: deterministic checked-in Bimba corpus import, including six deep map branches and compatibility parsing.
- `S2-RAW-GRAPH`: Neo4j connection/query/seed/sync primitives.
- `S2-CACHE-LAW`: graph semantic-cache contract over Redis runtime hosted under S3.
- `S2P-COORDINATE`: canonical coordinate parsing/resolution, including legacy `#`→M compatibility.
- `S2P-RELATIONS`: typed relation/pointer law and distinction among canonical, kernel-core, inferred, dataset, sync and compatibility relation facts.
- `S2P-RETRIEVAL`: coordinate-aware retrieve/rerank/enrich/GraphRAG/hybrid/context-pool assembly.
- `S2P-ONTOLOGY-GDS`: n10s/OWL/SHACL/GDS projection and provenance-bearing inference overlays.
- `S2-EXTERNAL-BIMBA-ADAPTER`: `Body/S/S2/external/bimba-mcp` exposes S2 graph functions to external MCP clients.

Critical boundary: **Bimba ≠ Neo4j ≠ MCP**. Neo4j is the current graph store/body; MCP is an external adapter/protocol surface. M/Bimba coordinate semantics and kernel relation law remain independently authoritative where the current specs assign them.

## 5. S3/S3' — gateway and temporal/state law

Frozen responsibilities:

- `S3-GATEWAY`: connection handshake, RPC/request routing, channels, chat, config, cron, devices/nodes/browser/approval/log controls.
- `S3-SESSION`: gateway session identity and durable session store.
- `S3-EVENTS`: typed portal/event fan-out and subscription transport.
- `S3P-DAY-NOW`: DAY/NOW/Kairos temporal projection and safe current context.
- `S3P-REDIS-CONTEXT`: Redis-backed live temporal/session/context key law.
- `S3P-GRAPHITI-RUNTIME`: Graphiti as temporal episodic architecture/library runtime.
- `S3P-SPACETIME`: shared live-state projection/presence/world-clock streams.
- `S3P-SUBJECT-RESOLUTION`: safe subject-coordinate resolution before agent dispatch.

Explicit correction: current `epi-graphiti` FastAPI sidecar/wrapper is integration scaffolding, not target architectural identity. Graphiti's temporal runtime belongs here; S5/S5' owns how it is searched, governed, interpreted and returned into knowledge/review.

## 6. S4/S4' — agent runtime and inhabitation law

Frozen responsibilities:

- `S4-AGENT-BODY`: managed/harness-agnostic agent process/session body and provider/model/auth profile binding.
- `S4-SKILL-TOOLS`: plugin/skill/tool loading and bounded primitives.
- `S4-TEAMS`: subagent/team/thread/runtime task-world composition.
- `S4P-KHORA`: session ground/write authority/visibility inside the agent.
- `S4P-HEN`: agent artifact/prompt/content form law.
- `S4P-PLEROMA`: executive capability membrane and tool/skill permission surface.
- `S4P-CHRONOS`: DAY/NOW/Kairos runtime condition inside the agent.
- `S4P-ANIMA`: VAK evaluation, CF routing, team composition and dispatch spine.
- `S4P-ALETHEIA`: thought route/crystallisation trigger/disclosure/Epii handoff.
- `S4P-HUMAN-GATE`: human-required candidates cannot auto-resolve through non-human actors.

Ta-onta carriers are **not** the six VAK dimensions. VAK is vertical dispatch grammar; ta-onta is the horizontal operational body in which that grammar acts.

## 7. S5/S5' — world boundary and Epii return law

Frozen responsibilities:

- `S5-GNOSIS`: local/world-return corpus ingest/query/enrichment and RAG service body.
- `S5-KBASE`: source-pool/bookmark/semantic research corpus access.
- `S5-EXTERNAL`: outward/inward publication, notebook and external connector bodies.
- `S5P-EPII-AGENT`: separate Epii PI embodiment / user-position deep oracle.
- `S5P-REVIEW`: durable review inbox, approve/reject/revise/defer, human-required guard and evidence lineage.
- `S5P-AUTORESEARCH`: baseline/challenger/evaluation/keep-discard and dry-run promotion planning.
- `S5P-GRAPHITI-USAGE`: invocation/search/arc/disclosure governance over S3' Graphiti runtime.
- `S5P-PEDAGOGY`: Bimba/MEF/QL/knowledge explanation and disclosure surfaces.
- `S5P-MOBIUS-RETURN`: reviewed promotion/crystallisation/seed-generation return toward lower-layer authorities.

Autoresearch is not free-running self-promotion. It can surface/evaluate candidates; accepted mutation still crosses review and the owning write surface (for example S1'/Hen for canon files).

## 8. Cross-stack authority rules

1. **Execution mirror is not ownership.** `epi` commands may execute S1–S5 operations without making S0 semantic owner.
2. **Storage is not semantic ownership.** Neo4j, Redis, SpaceTimeDB, files and Graphiti store different materialisations; none automatically becomes domain canon.
3. **Protocol is not semantic ownership.** WebSocket/RPC/MCP/ACP expose operations; they do not define Bimba or M-domain identity.
4. **Shared runtime context has one temporal owner.** S3/S3' owns live session/DAY/NOW/Kairos state; consumers carry handles rather than fork clocks/sessions.
5. **Agent runtime is governed.** S4/S4' owns bounded execution and mediation; review/promotion meaning crosses into S5/S5'.
6. **Knowledge return does not bypass source owners.** S5' may evaluate/promote only through the owning S1/S2/M-domain mutation path and review law.
7. **Prime subtrees are substantive.** The top-level `S/S'` placeholder directory is empty by design; current Sx' specs live under each `Sx/Sx'` tree and are the material used here.

## 9. Verification evidence frozen from current specs/code

- S0 master spec records 29/29 shell/kernel-bridge/lite-surface contract passes at its consumed boundary.
- S3 master spec records 6/6 bridge/gateway fan-out and 23/23 lite-surface temporal/privacy tests for its consumed boundary.
- S4 master spec records 8/8 ACR contract tests and one known stale-fixture-path failure in the broader 18/19 mediation suite; that failure is test-harness path debt, not ownership ambiguity.
- `Body/S/S2/graph-schema/tests/*` includes coordinate-prefix, relationship/property/label registry and provenance tests.
- `Body/S/S2/graph-services/tests/*` includes coordinate query, dataset import, GDS/plugin readiness and graph-service contract tests.
- `Body/S/S5/tests` and the S5 core crates are retained as current verification surfaces for review/autoresearch/agent contracts.

These are frozen as current evidence references, not re-run claims from this documentation-only R1 branch.
