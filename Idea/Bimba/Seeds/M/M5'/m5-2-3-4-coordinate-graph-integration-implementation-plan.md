# M5-2/3/4 Coordinate Graph Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the governed S/S', M', and agentic-protocol graph integration for M5-2, M5-3, and M5-4 without collapsing direct M identity into M' IDE affordance labels.

**Architecture:** Use `coordinate` as the canonical graph discriminator, enrich existing nodes through S2 promotion/update law, and expose bounded GraphRAG/search scopes before any broad vector rerank. Source mapping is parallel and read-only; implementation and live Neo4j mutation are serialized behind dry-run, export, test, and review gates.

**Tech Stack:** Neo4j `:Bimba`, Rust S2 graph-schema and graph-services, S0 graph CLI mirrors, TypeScript `bimba-mcp`, Theia/M' design specs, S/S' seed/world canon, Epi-Logos QL/MEF resources.

---

## 0. Canonical Invariants

This work implements [[m5-2-3-4-coordinate-graph-integration-spec]]. It must preserve these identities:

| Direct coordinate | Direct M name | Direct scope | M' affordance label |
|---|---|---|---|
| [[M5-2]] | Siva- / Prakrti | all [[S]] and [[S']] nodal structure | Backend Studio |
| [[M5-3]] | -Shakti / Purusha | all [[M']] coordinates and rendered Pratibimba/Theia expression | Frontend Studio |
| [[M5-4]] | Siva-Shakti / Purusha-Prakrti | agentic protocols mediating S4/S5, S/S', M', review, runtime agency | Agentic Control Room |

Hard rules:

- Do not rename direct M nodes to IDE-facing labels.
- Do not delete and recreate existing Neo4j nodes.
- Do not query family scope by label when `coordinate` can express the scope.
- Do not treat `coordinate_axis` as canonical identity; it is derived metadata.
- Do not apply live Neo4j writes before dry-run output, export/snapshot instructions, and real-functionality tests exist.
- Do not start code edits without GitNexus impact analysis for touched symbols.

## 1. Source Authority Order

Read in this order when executing or reviewing:

1. `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md`
2. `Body/S/S5/plugins/epi-logos/resources/updated-ql-mef/epi_logos_coordinate_system.md`
3. `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
4. `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
5. `Idea/Bimba/Seeds/M/M-M-prime-coordinate-mapping-inaugural.md`
6. `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md`
7. `Idea/Bimba/World/Types/Coordinates/S/**`
8. `Idea/Bimba/World/Types/Coordinates/L/**`
9. `Idea/Bimba/World/Types/Coordinates/P/**`
10. `Idea/Pratibimba/System/Subsystems/**`
11. `Body/S/S2/graph-schema/src/lib.rs`
12. `Body/S/S2/graph-services/src/sync_coordinator.rs`
13. `Body/S/S2/graph-services/src/retrieval/hybrid.rs`
14. `Body/S/S0/epi-cli/src/graph/**`
15. `Body/S/S2/external/bimba-mcp/src/**`

## 2. Subagent Fan-Out

The source-mapping stage uses read-only subagents. Their outputs become evidence for Tasks 1 and 2; they do not write code or graph data.

| Lane | Scope | Required output |
|---|---|---|
| S/S' spine | M5-2 parent and child coverage for `S`, `S'`, `S0..S5`, `S0'..S5'` | source files, node fields, relation targets, risks, tests |
| M' expression | M5-3 parent and child coverage for `M'`, `M0'..M5'`, Theia/Pratibimba surfaces | source files, node fields, rendered affordance properties, risks, tests |
| MEF/L-P canon | M2-1 12fold MEF, L/L', P/P' parent coverage | canonical inventory, stale sixfold sources, properties, relations, tests |
| Graph/schema seams | S2 schema, retrieval, promotion, CLI/MCP seams | files to modify, symbols needing GitNexus impact, live Neo4j constraints, tests |

Subagent status:

- S/S' spine: completed read-only inventory.
- M' expression: completed read-only inventory.
- MEF/L-P canon: completed read-only inventory.
- Graph/schema seams: pending report from Halley; do not treat graph-service symbol-level seams as final until integrated.

## 2.1 Source Matrix

### M5-2 S/S' Spine

| Coordinate | Parent coordinate | Source path | Node enrichment fields | Relationship targets | Test evidence |
|---|---|---|---|---|---|
| `M5-2` | `M5` | `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md`; `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` | Preserve `c_1_name = "Siva-"` or upgrade to `Siva- / Prakrti`; add rendered alias `Backend Studio` separately; add `coordinate_parent`, `coordinate_axis`, `c_1_description`, `c_1_structure`, `s_0_owned_by_coordinate` | `S`, `S'`, `S0..S5`, `S0'..S5'` | Query mode `stack_system` must compile to `coordinate STARTS WITH "S"`; parent names must not collapse to Backend Studio |
| `S` | root | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md`; `Idea/Bimba/World/Types/Coordinates/S/**` | `coordinate`, `coordinate_prefix`, `coordinate_depth`, `coordinate_parent`, `c_1_name`, `c_1_description`, `c_4_family`, `sync_status`, `sync_version` | `S0..S5`, `M5-2` | Coverage check for `S` root plus six base children |
| `S'` | root | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md`; `Idea/Bimba/World/Types/Coordinates/S/S'/**` | `coordinate`, `coordinate_axis = "prime"`, `coordinate_parent`, `c_1_name`, `c_1_description`, `c_4_inversion_state`, `sync_status`, `sync_version` | `S0'..S5'`, `M5-2` | Coverage check for `S'` root plus six prime children |
| `S0` / `S0'` | `S` / `S'` | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S0/**`; `Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.csv` | `s_0_repo_path`, `s_0_component`, `s_0_symbol_refs`, `s_0_execution_flow_refs`, `s_0_owned_by_coordinate` | CLI/kernel/membrane code paths; S1/S2 handoff | Real graph/schema tests must verify S0 is membrane/adaptor, not downstream law owner |
| `S1` / `S1'` | `S` / `S'` | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S1/**`; `Idea/Bimba/Seeds/S/S-SOURCE-TRACEABILITY-INDEX.md` | vault/compiler fields, source traceability, Hen write-law references, wikilink/frontmatter evidence | vault files, Hen compiler, S2 promotion | Tests must keep vault writes S1/Hen-governed |
| `S2` / `S2'` | `S` / `S'` | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S2/**`; `Body/S/S2/graph-schema/src/lib.rs`; `Body/S/S2/graph-services/src/**` | graph schema, coordinate-aware retrieval, relationship evidence, Neo4j/Redis roles | graph-schema, graph-services, S0 graph mirrors | Coordinate uniqueness, evidence-bearing relations, no unreviewed dynamic property keys |
| `S3` / `S3'` | `S` / `S'` | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S3/**`; `Body/S/S3/**`; S0 gateway mirrors | gateway/session/temporal fields, API method namespace, DAY/NOW/Kairos handles | S0 CLI mirror, S4 agent runtime, S5 world-return | Gateway methods preserve owner coordinates and temporal authority |
| `S4` / `S4'` | `S` / `S'` | `CLAUDE.md`; `Idea/Bimba/World/Types/Coordinates/S/S4/**`; `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/**`; `Body/S/S4/ta-onta/**` | agent runtime fields, VAK/Anima/Sophia/Aletheia/Moirai affordances, capability refs | `M5-4`, `S5`, `S5'`, VAK/CPF/CT/CP/CF/CFP/CS anchors | Agent protocol tests must validate bounded authority and VAK route metadata |
| `S5` / `S5'` | `S` / `S'` | `CLAUDE.md`; `Idea/Bimba/Seeds/S/S5/**`; `Idea/Bimba/World/Types/Coordinates/S/S5/**`; `Body/S/S5/**` | review/autoresearch/gnosis/kbase/Graphiti fields, promotion gate refs, human-validation refs | `M5-4`, S4/S4', Epii/Sophia/Aletheia, Graphiti/kbase | Non-dry-run graph promotion remains gated; S5/S5' review tests must cover human-required decisions |
| `Sx.y` / `Sx.y'` | owning `Sx` / `Sx'` | `Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.md`; CSV scaffold | per-coordinate shard role, source/body reality, tests, gaps, boundaries | owning parent, sibling shards, implementation evidence | Coverage check for 72 subcoordinates: 6 levels x 6 base plus 6 levels x 6 prime |

### M5-3 M' Expression

| Coordinate | Parent coordinate | Source path | Node enrichment fields | Relationship targets | Test evidence |
|---|---|---|---|---|---|
| `M5-3` | `M5` | `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md` | Preserve direct name `-Shakti` or upgrade to `-Shakti / Purusha`; add `Frontend Studio` only as rendered affordance; add `m_3_rendered_affordance`, `m_3_diagram_anchor`, `coordinate_parent` | `M'`, `M0'..M5'`, Theia shell, Pratibimba subsystem docs | Query mode `m_prime_expression` returns primed `M*` and excludes direct unprimed `M*` |
| `M'` | root | `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`; `Idea/Pratibimba/System/README.md`; `Body/M/epi-theia/README.md` | `coordinate`, `coordinate_axis = "prime"`, `c_1_description`, `m_0_repo_path`, `m_3_layout_modes`, `m_3_kernel_bridge_consumer` | `M0'..M5'`, Theia runtime, kernel bridge | Decision Required: verify whether live Neo4j has an `M'` root node; create via governed promotion if missing |
| `M0'` | `M'` | `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`; M0 architecture docs; `Body/M/epi-theia/extensions/m0-*` | playable Bimba graph field, graph/source/route surface, widget/component ids | S2 graph, pointer web, source traceability, M5-3 | Filesystem-backed extension path tests and bridge-consumer tests |
| `M1'` | `M'` | `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`; `Body/M/epi-theia/extensions/m1-*` | relation walk, torus/path/clock surface, M1 engine references | S0 kernel, M1 direct subsystem, M5-3 | Extension depends on shared bridge; no raw S0/S2 imports |
| `M2'` | `M'` | `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`; MEF source docs; `Body/M/epi-theia/extensions/m2-*` | harmonic/correspondential surface, 72-space/cymatic renderer, MEF refs | `M2-1`, `L/L'`, kernel bridge, M5-3 | 12fold MEF and 72-address tests; not six-lens-only |
| `M3'` | `M'` | `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`; Mahamaya subsystem docs; `Body/M/epi-theia/extensions/m3-*` | clock/cosmos, codon rotation, wheel surface, timing/cymatic fields | S0 harmonic pulse, S3 temporal, M5-3 | Must not conflate M2-1 MEF with M3-5 16/16+1 clock aperture namespace |
| `M4'` | `M'` | `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`; `Idea/Pratibimba/System/Subsystems/Nara/**`; `Body/M/epi-theia/extensions/m4-*` | protected personal/Nara handles, layout route, privacy boundary | S5 Nara/Gnosis, protected Graphiti handles, M5-3 | Privacy tests store handles/status only, not raw journals/dreams/identity bodies |
| `M5'` | `M'` | `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`; `Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md`; `Body/M/epi-theia/extensions/m5-*` | Epii IDE/review/return surface, M5-0'..M5-5' affordances, agentic workbench handles | `M5-2`, `M5-3`, `M5-4`, S4/S5, review/autoresearch | M5 UI labels remain rendered affordances, not direct M names |

### M5-4 Agentic Protocols

| Coordinate | Parent coordinate | Source path | Node enrichment fields | Relationship targets | Test evidence |
|---|---|---|---|---|---|
| `M5-4` | `M5` | `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md`; `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md` | Preserve direct name `Siva-Shakti` or upgrade to `Siva-Shakti / Purusha-Prakrti`; add `Agentic Control Room` as rendered affordance; add agent role, VAK binding, capability gates, review authority, human-validation fields | `S4`, `S4'`, `S5`, `S5'`, M5 operational capacities, M' agentic surfaces | M5-4 neighborhood query must return S4/S5/VAK anchors without requiring label-only scope |
| `S4` / `S4'` | `S` / `S'` | S4 world/seed specs; `Body/S/S4/ta-onta/**`; Moirai dispatch module | Anima/VAK/agent runtime properties, Moirai mode affordances, capability refs | `M5-4`, `S5/S5'`, VAK/CPF/CT/CP/CF/CFP/CS | Moirai cluster-mode tests and VAK route tests |
| `S5` / `S5'` | `S` / `S'` | S5 seed/world specs; `Body/S/S5/**` | review/autoresearch/gnosis/kbase/Graphiti promotion gates | `M5-4`, Epii, Aletheia, Sophia, Graphiti/kbase | Review/autoresearch tests; non-dry-run mutation blocked without human validation |
| VAK anchors | `S4'` / `C'` | `CLAUDE.md`; S4/S4' specs; ta-onta modules | CPF, CT, CP, CF, CFP, CS fields; constitutional agent mapping | Anima, Sophia, Psyche, Nous, Logos, Eros, Mythos | Tests preserve VAK metadata in run/review envelopes |
| Moirai modes | `S4'` | `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts` | `cluster_trace`, `property_audit`, `relation_evidence_audit`, `diagram_coherence_audit`, `technical_stack_distillation`, `m_prime_surface_distillation`, `agentic_protocol_distillation` | Klotho, Lachesis, Atropos; M5-2/M5-3/M5-4 clusters | Mode tests keep Klotho/Lachesis/Atropos Night' mapping intact |

### MEF / P Branch Matrix

| Index | Coordinate | Name | Parent | M2-1 relation | Test evidence |
|---:|---|---|---|---|---|
| 0 | `L0` | Quaternal | `L` | M2-1 full lens branch; Square A | `L0.0..L0.5`; `flat = lens * 6 + position` |
| 1 | `L1` | Causal | `L` | M2-1 full lens branch; Square B | `L1.0..L1.5`; 12 x 6 = 72 addressing |
| 2 | `L2` | Logical | `L` | M2-1 full lens branch; Square C | `L2.0..L2.5`; 12fold runtime constants |
| 3 | `L3` | Processual | `L` | M2-1 full lens branch; Square C | `L3.0..L3.5`; Klein square routing |
| 4 | `L4` | Phenomenological | `L` | M2-1 full lens branch; Square B | `L4.0..L4.5`; P4 lived aperture relation |
| 5 | `L5` | Para Vak | `L` | M2-1 full lens branch; Square A | `L5.0..L5.5`; Mobius return relation |
| 6 | `L0'` | Archetypal-Numerical | `L'` | M2-1 full prime lens branch; Square A | `L0'.0..L0'.5`; prime/inversion relation |
| 7 | `L1'` | Phenomenal | `L'` | M2-1 full prime lens branch; Square B | `L1'.0..L1'.5`; P4 Night complement |
| 8 | `L2'` | Alchemical-Elemental | `L'` | M2-1 full prime lens branch; Square C | `L2'.0..L2'.5`; Day/night partner relation |
| 9 | `L3'` | Chronological | `L'` | M2-1 full prime lens branch; Square C | `L3'.0..L3'.5`; Day/night partner relation |
| 10 | `L4'` | Scientific | `L'` | M2-1 full prime lens branch; Square B | `L4'.0..L4'.5`; L4' verification loop relation |
| 11 | `L5'` | Divine Logos | `L'` | M2-1 full prime lens branch; Square A | `L5'.0..L5'.5`; P0 Night/Logos relation |
| parent | `P` | Day positions `P0..P5` with implicit Night inversion | `#` | `#` generates P through inversion; `P` carries P' implicitly | P/P' coverage under hash/inversion operator |
| parent | `P'` | Night positions `P0'..P5'` | `P` / inversion of `P` | `P'` is the Klein/inverted arc held within P-family topology | P Night arc coverage; not a separate unrelated root |

Decision Required:

- Verify whether live Neo4j has parent roots `M'`, `L`, `L'`, `P`, and `P'`; if missing, create only through governed S2 promotion.
- Add or normalize `Square C` as a first-class World/graph node because the current World Squares set may include Square A and Square B but not Square C.
- Treat stale six-lens or 36-position language as compatibility/history for M2-1, not current canon.
- Keep M2-1 12fold MEF separate from M3-5 16/16+1 clock aperture namespace.
- Resolve Thought-family folder mismatches by treating `epi_logos_coordinate_system.md` as canonical unless deliberately revising World nodes.
- Ensure each L/L' lens is represented as a full six-node branch, not merely as one of twelve flat coordinates.
- Keep `#` as the parent/source condition for P-family emergence; `P` and `P'` are a day/night double-cover, not peer root systems floating without the inversion operator.

## 3. Task 1: Consolidate Subagent Findings Into A Source Matrix

**Files:**

- Modify: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-implementation-plan.md`
- Read: all files listed in Section 1

**Steps:**

1. Integrate the pending graph/schema seam report when Halley returns.
2. Add concrete graph-service symbols, files, and test commands from the graph/schema report.
3. Reconcile the source matrices above against graph/schema constraints.
4. Mark unresolved contradictions as `Decision Required`, not as silent assumptions.

**Verification:**

Run:

```bash
rg -n "Source Matrix|MEF 12fold Matrix|Decision Required" "Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-implementation-plan.md"
```

Expected: all three headings or markers are present after agent integration.

## 4. Task 2: Graph Schema Contract For Coordinate-Family Runtime Properties

**Files:**

- Modify: `Body/S/S2/graph-schema/src/lib.rs`
- Test: `Body/S/S2/graph-schema/tests/property_registry.rs`
- Test: `Body/S/S2/graph-schema/tests/coordinate_prefix_properties.rs`
- Test: add `Body/S/S2/graph-schema/tests/m5_coordinate_family_schema.rs`

**Pre-edit GitNexus:**

Run impact analysis on at least:

```text
coordinate_prefix_property_key
coordinate_prefix_property_key_for_axis
validate_coordinate_prefix_property
node_property_spec
property_spec
coordinate_prefix_family_spec
labels_for_coordinate_node
```

**Implementation requirements:**

- Ensure registered/query-grade properties cover useful runtime fields for S/S' nodes: repo path, component, symbol refs, execution-flow refs, CRUD owner, gateway/API methods, runtime boundary, promotion gate, diagram anchor.
- Ensure registered/query-grade properties cover M' nodes: repo path, component, Theia extension/component identity, rendered affordance, UI route, kernel-bridge dependency, diagram anchor.
- Ensure protocol nodes can carry agent role, VAK binding, capability gates, review authority, allowed/forbidden actions, and human-validation requirements.
- Preserve dynamic `i` segment law for prime/inversion properties.
- Preserve `coordinate` as canonical identity and labels as descriptive/rendering metadata.

**Tests:**

Add tests that assert:

- `s_0_repo_path`, `s_0_component`, `m_0_repo_path`, and `m_0_component` remain registered.
- New or existing keys for CRUD owner, gateway methods, runtime boundary, promotion gate, rendered affordance, and diagram anchor validate through the registry or dynamic coordinate-prefix law.
- Prime examples such as `s_4_i_runtime_boundary` and `m_3_i_rendered_affordance` validate, while `_prime_` variants fail.
- Direct M names and M' affordance labels remain separate property concepts.

**Verification:**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml
```

Expected: all graph-schema tests pass.

## 5. Task 3: Bounded GraphRAG Query Modes

**Files:**

- Modify: `Body/S/S2/graph-services/src/retrieval/hybrid.rs`
- Modify: `Body/S/S2/graph-services/src/retrieval/coordinate.rs`
- Modify: `Body/S/S2/graph-services/src/retrieval_query.rs`
- Modify if needed: `Body/S/S0/epi-cli/src/graph/retrieval/hybrid.rs`
- Modify if needed: `Body/S/S0/epi-cli/src/graph/retrieval/coordinate.rs`
- Test: `Body/S/S2/graph-services/tests/retrieval_fusion_contract.rs`
- Test: add `Body/S/S2/graph-services/tests/bounded_query_modes_contract.rs`
- Test if S0 mirror changes: `Body/S/S0/epi-cli/tests/graph_retrieval.rs`

**Pre-edit GitNexus:**

Run impact analysis on the concrete retrieval symbols identified by the graph/schema subagent before editing.

**Implementation requirements:**

Add bounded query modes that compile to coordinate filters before vector search/rerank:

| Mode | Coordinate filter |
|---|---|
| `bimba_map` | direct `M*` without prime, plus optional C/P/L/T inclusion |
| `stack_system` | `coordinate STARTS WITH "S"` |
| `m_prime_expression` | `coordinate STARTS WITH "M"` and prime detection |
| `agentic_protocols` | `M5-4` neighborhood plus S4/S4'/S5/S5'/VAK anchors |
| `mef_lenses` | `coordinate STARTS WITH "L"` or `coordinate STARTS WITH "M2-1"` |
| `world_return` | S5/S5', gnosis, Graphiti, kbase, review/promotion coordinates |

**Tests:**

Use real query compilation and filtering functions. Do not mock ranking. Assert the generated Cypher/filter plan includes the coordinate predicates before any vector clause.

**Verification:**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml retrieval
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test graph_retrieval
```

Expected: bounded modes compile and existing retrieval behavior remains compatible.

## 6. Task 4: Promotion And CRUD Validation For M5-2/3/4 Node Enrichment

**Files:**

- Modify: `Body/S/S2/graph-services/src/sync_coordinator.rs`
- Modify if needed: `Body/S/S2/graph-services/src/graph_api.rs`
- Modify if needed: `Body/S/S2/graph-services/src/relationship_manager.rs`
- Test: `Body/S/S2/graph-services/tests/promotion_policy_contract.rs`
- Test: `Body/S/S2/graph-services/tests/property_proposal_contract.rs`
- Test: `Body/S/S2/graph-services/tests/graph_promotion_contract.rs`
- Test: add `Body/S/S2/graph-services/tests/m5_coordinate_enrichment_contract.rs`

**Pre-edit GitNexus:**

Run impact analysis on at least:

```text
SyncCoordinator::classify_source_path
SyncCoordinator::plan_promotion
SyncCoordinator::promote_intent
PropertyProposal
S2GraphPromotionIntent
RelationshipWritePlan
```

**Implementation requirements:**

- Promotion intents must reject graph mutations without canonical `coordinate`.
- S/S' enrichment should lead with `s_*` plus `c_*` fields.
- M' enrichment should lead with `m_*` plus `c_*` fields.
- M5-4 enrichment may braid `s_*`, `m_*`, `c_*`, and `t_*`.
- Existing values must be preserved unless the update packet explicitly supplies a higher-confidence replacement with evidence.
- Legacy `bimbaCoordinate` and `bimba_coordinate` must be compatibility-only and converge to `coordinate`.

**Tests:**

Add tests using real `S2GraphPromotionIntent` and `PropertyProposal` values for:

- `M5-2` keeps direct name while adding M' affordance alias separately.
- `M5-3` scopes to M' nodes and does not admit direct M children without prime.
- `M5-4` accepts agentic protocol properties only with review/capability evidence.
- Missing `coordinate`, parent mismatch, or source/target mismatch fails.

**Verification:**

Run:

```bash
cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml promotion
```

Expected: promotion planning rejects unsafe mutations and accepts evidence-backed coordinate updates.

## 7. Task 5: Dry-Run Neo4j Enrichment Plan For Parent Nodes

**Files:**

- Create: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-node-enrichment-dry-run.cypher`
- Create: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-node-enrichment-ledger.md`

**Implementation requirements:**

Produce dry-run Cypher and ledger entries for parent coverage only first:

- `M5-2`, `S`, `S'`, `S0..S5`, `S0'..S5'`
- `M5-3`, `M'`, `M0'..M5'`
- `M5-4`, `S4`, `S4'`, `S5`, `S5'`, VAK/agent anchors if present
- `M2-1`, `L`, `L'`, `L0..L5`, `L0'..L5'`, `P`, `P'`, `P0..P5`, `P0'..P5'`

Dry-run Cypher must return the before/after projection and must not write. The ledger must record source paths and proposed property keys.

**Verification:**

Run read-only cypher through the existing graph client or Neo4j browser equivalent:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate IN ["M5-2", "M5-3", "M5-4", "S", "S'", "M'", "M2-1", "L", "L'", "P", "P'"]
RETURN n.coordinate, n.c_1_name, keys(n)
ORDER BY n.coordinate
```

Expected: parent nodes are present or explicitly listed as missing in the ledger.

## 8. Task 6: Live Neo4j Migration Apply Gate

**Files:**

- Modify after approval: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-node-enrichment-dry-run.cypher`
- Create after approval: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-node-enrichment-apply.cypher`
- Modify: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-node-enrichment-ledger.md`

**Gate requirements before apply:**

- Dry-run output reviewed.
- Current graph export/snapshot command recorded.
- Tests from Tasks 2-4 pass.
- Human approval for live Neo4j write.
- Apply Cypher uses `MATCH`/`MERGE` by `coordinate`, never by labels alone.
- Apply Cypher sets only missing or evidence-upgraded fields.
- Apply Cypher records `sync_status`, `sync_version`, `promotion_source`, and source evidence.

**Verification:**

Run read queries after apply:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "S"
RETURN count(n) AS stack_system_count
```

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "M" AND n.coordinate CONTAINS "'"
RETURN count(n) AS m_prime_count
```

```cypher
MATCH (m:Bimba {coordinate: "M5-4"})-[r*1..2]-(n:Bimba)
WHERE n.coordinate STARTS WITH "S4"
   OR n.coordinate STARTS WITH "S5"
   OR n.coordinate STARTS WITH "M5-4"
RETURN count(DISTINCT n) AS agentic_protocol_count
```

Expected: counts are non-zero and parent nodes retain direct M names.

## 9. Task 7: M2-1 MEF 12fold Alignment

**Files:**

- Modify if needed: `Body/S/S0/epi-cli/src/nara/lens.rs`
- Modify if needed: `Body/S/S0/epi-lib/src/m2.c`
- Modify if needed: `Body/S/S0/epi-lib/include/m2.h`
- Modify if needed: `Body/S/S2/graph-services/src/pointers.rs`
- Modify docs only if stale: M2/M2' seed and world files identified by the MEF subagent
- Test: existing M2/lens/kernel tests identified by the MEF subagent
- Test: add graph/schema or CLI test if no current test asserts all 12 lenses

**Pre-edit GitNexus:**

Run impact analysis on any touched M2/lens/kernel symbols before editing.

**Implementation requirements:**

The canonical lens set is:

```text
L0 Quaternal
L1 Causal
L2 Logical
L3 Processual
L4 Phenomenological
L5 Para Vak
L0' Archetypal-Numerical
L1' Phenomenal
L2' Alchemical-Elemental
L3' Chronological
L4' Scientific
L5' Divine Logos
```

Tests must assert the 12fold inventory and the `12 x 6 = 72` MEF addressing surface.

**Verification:**

Run the exact Rust/C test commands identified during source mapping. At minimum, run any existing lens tests and relevant S0 CLI tests.

## 10. Task 8: Moirai Coordinate-Cluster Modes

**Files:**

- Modify: `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts`
- Test: existing Moirai or ta-onta tests if present
- Add tests under the local ta-onta test harness if no coverage exists

**Pre-edit GitNexus:**

Run impact analysis on Moirai dispatch symbols before editing.

**Implementation requirements:**

Add or expose coordinate-cluster modes:

- `cluster_trace`
- `property_audit`
- `relation_evidence_audit`
- `diagram_coherence_audit`
- `technical_stack_distillation`
- `m_prime_surface_distillation`
- `agentic_protocol_distillation`

Keep the Night' mapping intact:

- Klotho: traces and threads
- Lachesis: sources, measures, provenance
- Atropos: crystallizations, cuts, retained insight

**Verification:**

Run the real ta-onta test command identified by repository scripts or the graph/schema subagent.

## 11. Task 9: Diagram-First Anchors

**Files:**

- Modify schema/tests only if diagram fields are not already supported.
- Create or update ledger: `Idea/Bimba/Seeds/M/M5'/m5-2-3-4-diagram-anchor-ledger.md`
- Read: `Idea/Bimba/World/**.canvas`
- Read: `Idea/Bimba/World/Types/**.canvas`

**Implementation requirements:**

For each parent surface, record diagram anchors before code/source links:

- coordinate shown in diagram
- canvas path
- canvas node id if available
- relation visualized
- status: draft, canonical, deprecated, superseded

Graph nodes should use registered/dynamic diagram anchor properties, not decorative notes.

**Verification:**

Run:

```bash
rg -n "diagram_anchor|canvas|M5-2|M5-3|M5-4" "Idea/Bimba/Seeds/M/M5'/m5-2-3-4-diagram-anchor-ledger.md"
```

Expected: M5-2, M5-3, and M5-4 each have at least one diagram/source-status entry or an explicit gap.

## 12. Final Verification Gate

Before claiming completion:

1. Run all tests changed or added in graph-schema, graph-services, S0 graph CLI mirrors, M2 lens code, and Moirai.
2. Run `gitnexus_detect_changes()` and confirm only expected symbols/flows changed.
3. Run live Neo4j read-only acceptance queries for `stack_system`, `m_prime_expression`, `agentic_protocols`, and `mef_lenses`.
4. Confirm parent-level coordinates are covered: `S`, `S'`, `M'`, `L`, `L'`, `P`, `P'`, `M2-1`, `M5-2`, `M5-3`, `M5-4`.
5. Confirm direct M names remain direct names and M' IDE labels are stored separately.

## 13. Execution Mode

Use subagents for read-only discovery and bounded reviews. Do not use parallel implementation agents against overlapping write sets.

Recommended serialized execution:

1. Controller integrates source-mapping reports.
2. Worker implements graph-schema properties and tests.
3. Spec reviewer checks direct M vs M' register law.
4. Code reviewer checks schema quality.
5. Worker implements bounded retrieval modes and tests.
6. Spec reviewer checks coordinate-scope law.
7. Code reviewer checks retrieval quality.
8. Worker implements promotion/CRUD validation and tests.
9. Spec reviewer checks upgrade-not-overwrite law.
10. Code reviewer checks mutation safety.
11. Controller prepares dry-run Cypher and ledgers.
12. Human reviews dry-run and authorizes or blocks live write.
13. Controller applies live graph changes only after approval.
