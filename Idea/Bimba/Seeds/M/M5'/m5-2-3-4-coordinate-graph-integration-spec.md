---
title: "M5-2/3/4 Coordinate Graph Integration Spec"
status: "draft-canon-clarification"
created: "2026-06-03"
coordinate: "M5-2/M5-3/M5-4"
scope:
  - "M5 direct ontology"
  - "M5' rendered IDE affordances"
  - "S/S' coordinate graph integration"
  - "M' coordinate graph integration"
  - "M2-1 12fold MEF lens alignment"
source_context:
  - "[[M5'-SPEC]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
  - "[[M'-SYSTEM-SPEC]]"
  - "[[S4]]"
  - "[[S4']]"
  - "[[S5]]"
  - "[[S5']]"
  - "[[epii-ux-full-m5-branch]]"
  - "[[M-M-prime-coordinate-mapping-inaugural]]"
---

# M5-2/3/4 Coordinate Graph Integration Spec

## 0. Purpose

This spec clarifies how the live Neo4j `:Bimba` graph should carry the full technical and agentic coordinate structure for the M5-2, M5-3, and M5-4 branches without collapsing direct M ontology into M' IDE surface names.

The core correction is:

- [[M5-2]] is the direct M-coordinate node for **Siva- / Prakrti**: the system spine, meaning the full [[S]] / [[S']] nodal structure.
- [[M5-3]] is the direct M-coordinate node for **-Shakti / Purusha**: the system expression, meaning the full [[M']] coordinate field as rendered Pratibimba/Electron/Theia expression.
- [[M5-4]] is the direct M-coordinate node for **Siva-Shakti / Purusha-Prakrti**: the agentic protocol and operational-capacity integration layer mediating [[S]] / [[S']], [[M']], and runtime agentic action.

Terms such as "Backend Studio", "Frontend Studio", and "Agentic Control Room" are valid **M' rendered affordance names** inside the agentic IDE. They are not the primary names of the direct [[M5-2]], [[M5-3]], and [[M5-4]] nodes. Graph enrichment must upgrade the current nodes while preserving their direct M identities.

## 1. Register Law

### 1.1 Direct M vs M' Rendered Names

The M-family without prime carries conceptual-archetypal subsystem identity. The M'-family carries rendered, playable, Pratibimba expression in the Electron/Theia shell.

Therefore, direct M node naming and M' surface naming must be held as two registers:

| Direct coordinate | Direct name | Structural role | M' rendered affordance |
|---|---|---|---|
| [[M5-2]] | Siva- / Prakrti | System spine: all [[S]] / [[S']] stack and system-layer nodes | Backend Studio |
| [[M5-3]] | -Shakti / Purusha | System expression: all [[M']] rendered Pratibimba/Theia nodes | Frontend Studio |
| [[M5-4]] | Siva-Shakti / Purusha-Prakrti | Agentic protocols: mediation of stack, expression, review, runtime agency | Agentic Control Room |

The M' names can be stored as aliases, rendered labels, UI roles, or view affordances. They must not replace `c_1_name` or direct ontology fields on M5 direct nodes unless the direct name is also preserved.

### 1.2 Upgrade, Do Not Overwrite

Existing Neo4j nodes should be upgraded by adding coordinate-driven properties and evidence-backed relations. They should not be deleted and recreated simply because older descriptions are incomplete.

For example, current graph data may hold:

- `M5-2` with `c_1_name = "Siva-"`
- `M5-3` with `c_1_name = "-Shakti"`
- `M5-4` with `c_1_name = "Siva-Shakti"`

These are structurally valuable and should remain. The missing work is to enrich them with precise role, scope, aliases, graph query affordance, code paths, diagram anchors, and relation evidence.

## 2. Graph Query Law

### 2.1 Coordinate Is The Canonical Discriminator

Cypher queries for these integrations must primarily use the `coordinate` property and coordinate prefix/prime structure.

Labels are helpful for rendering, indexing, and compatibility, but labels are not the canonical source of coordinate scope. The canonical graph identity is:

```cypher
MATCH (n:Bimba {coordinate: $coordinate})
RETURN n
```

All stack and system-layer scoping should derive from coordinate grammar:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "S"
RETURN n
ORDER BY n.coordinate
```

All direct M/Bimba-map scoping should derive from `M` coordinate prefix while distinguishing direct and primed coordinates:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "M"
  AND NOT n.coordinate CONTAINS "'"
RETURN n
ORDER BY n.coordinate
```

All M' rendered-expression scoping should derive from prime coordinates:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "M"
  AND n.coordinate CONTAINS "'"
RETURN n
ORDER BY n.coordinate
```

When `coordinate_axis` is present, query tools may use it as an optimization:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "M"
  AND n.coordinate_axis = "prime"
RETURN n
ORDER BY n.coordinate
```

But `coordinate_axis` is derived metadata. The coordinate string remains canonical.

### 2.2 M5-2 Scope Query

[[M5-2]] governs the full [[S]] / [[S']] nodal structure. The basic scope is:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "S"
RETURN n.coordinate, n.c_1_name, n.c_1_description
ORDER BY n.coordinate
```

The expected scope includes:

- `S`, `S'`
- `S0` through `S5`
- `S0'` through `S5'`
- future subcoordinates such as `S2.3`, `S2.3'`, `S4-4'`, or equivalent canonical S-family forms
- technical docs, services, protocols, CRUD affordances, gateway methods, schema laws, tests, and code provenance that belong to these coordinates

M5-2 should not be modeled as one "backend" node with incidental S-links. It is Epii's direct M view into the entire S/S' stack as nodal structure.

### 2.3 M5-3 Scope Query

[[M5-3]] governs the full [[M']] coordinate field: the rendered Pratibimba expression of the bimba map in Electron/Theia.

The basic scope is:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "M"
  AND n.coordinate CONTAINS "'"
RETURN n.coordinate, n.c_1_name, n.c_1_description
ORDER BY n.coordinate
```

This scope includes:

- `M0'` through `M5'`
- all M' subcoordinate surfaces
- `Body/M/epi-theia` extension nodes and their coordinate ownership
- the M0' graph surface, M1' played torus, M2' cymatic/MEF expression, M3' wheel/codec expression, M4' Nara field, M5' Epii IDE surface
- rendered diagram, panel, widget, extension, kernel-bridge consumer, and UI route evidence

M5-3 should not be modeled as "frontend" in a generic software sense. It is the Shakti/Purusha expression-plane: all M' coordinates as rendered system expression.

### 2.4 M5-4 Scope Query

[[M5-4]] governs agentic protocols and operational capacities. It is not merely a UI room. It is the integration layer where stack, rendered expression, and agentic governance become operationally mediable.

The basic M5-4 neighborhood should be queried by direct coordinate plus its related agent/protocol/capacity relations:

```cypher
MATCH (m:Bimba {coordinate: "M5-4"})-[r]-(n:Bimba)
RETURN type(r), n.coordinate, n.c_1_name
ORDER BY type(r), n.coordinate
```

Expected M5-4 relation targets include:

- [[S4]] / [[S4']] agent runtime, VAK, Anima, Sophia, Aletheia, Moirai, Agora, Anansi, Janus, Mercurius, Zeithoven, Techne
- [[S5]] / [[S5']] review, autoresearch, gnosis, Graphiti, kbase, promotion, world-return governance
- M5 operational-capacity siblings
- review gates, dry-run promotion plans, bounded run envelopes, agent authority registry, capability matrix, dispatch trace, tool stream, tests, and human validation gates
- M' rendered affordances that expose the above, especially the Agentic Control Room as UI projection

M5-4 is therefore the Purusha-Prakrti/Siva-Shakti protocol layer, with the Agentic Control Room as its M' face.

## 3. Node Property Schema

### 3.1 Property Families

Coordinate-driven properties should use existing prefix law:

- `c_*` for what the node is: identity, name, description, form, structure, coordinate role
- `s_*` for stack/system properties: repo paths, protocols, CRUD ownership, gateway surfaces, runtime boundaries, sync contracts
- `m_*` for M/M' properties: subsystem expression, rendered surface role, Theia extension/component identity, M' affordance
- `l_*` for lens-specific facts, especially M2-1 MEF lens integration
- `p_*` for positional movement and QL phase
- `t_*` for thought/session/crystallization artifacts
- `q_*` for template/world synthesis properties

Prime/inversion properties should use canonical `i` segments where dynamic property grammar requires prime encoding. Do not invent ad hoc suffixes such as `_prime_` when the schema expects `i`.

### 3.2 Required Useful Runtime Properties

Every technical graph node promoted into the M5-2/3/4 integration surface should carry enough information for agents to use it at runtime.

Minimum recommended fields:

| Purpose | Suggested property |
|---|---|
| Pithy runtime description | `c_1_description` |
| Structural role | `c_1_structure` or coordinate-specific dynamic key |
| Direct vs prime axis | `coordinate_axis` |
| Parent coordinate | `coordinate_parent` |
| Owning coordinate | `s_0_owned_by_coordinate` or `m_0_owned_by_coordinate` if added |
| Repo path | `s_0_repo_path` / `m_0_repo_path` |
| Component name | `s_0_component` / `m_0_component` |
| Symbol refs | `s_0_symbol_refs` / `m_0_symbol_refs` |
| Execution-flow refs | `s_0_execution_flow_refs` |
| CRUD owner | dynamic `s_2_crud_owner`, `s_2_mutation_owner`, or registered equivalent |
| Gateway/API method | dynamic `s_3_gateway_methods` or registered equivalent |
| Runtime agent affordance | dynamic `s_4_agent_affordance` or registered equivalent |
| Review/promotion law | dynamic `s_5_promotion_gate` or registered equivalent |
| Rendered M' affordance | dynamic `m_3_rendered_affordance` or registered equivalent |
| Diagram anchor | dynamic `m_3_diagram_anchor` / `s_3_diagram_anchor` or registered equivalent |
| Evidence status | `sync_status`, `sync_version`, `promotion_source`, `content_hash` |

The exact registered key set can evolve in [[S2]] graph-schema, but the schema must preserve the distinction between S-family technical stack facts and M'-family rendered expression facts.

## 4. CRUD And Promotion Protocol

### 4.1 CRUD Ownership

The CRUD path must remain layered:

- [[S1]] / [[S1']] via Hen/Khora owns vault material writes, frontmatter validation, wikilink integrity, and file residency.
- [[S2]] / [[S2']] owns Neo4j node/relation mutation, graph schema validation, coordinate-aware retrieval, semantic cache, and promotion sync.
- [[S3]] / [[S3']] owns gateway/session/transport routing.
- [[S4]] / [[S4']] owns agent runtime, VAK routing, dispatch, and tool invocation.
- [[S5]] / [[S5']] owns gnosis, review, autoresearch, promotion governance, world-return, and human validation gates.

Agents should not mutate Neo4j by direct arbitrary Cypher when performing governed updates. They should emit promotion intents, property proposals, relation candidates, and evidence packets. [[S2]] validates and applies them transactionally.

### 4.2 Promotion Intent Requirements

Promotion into the graph must include:

- canonical `coordinate`
- source path or code path
- artifact kind
- content hash or body hash where applicable
- PI-agent property reasoning for technical docs
- relation candidates with evidence text, confidence, inferred-by authority, and prompt hash
- compatibility migration notes when old properties such as `bimbaCoordinate` are encountered

For M5-2 technical-stack nodes, property proposals should usually lead with `s_*` and `c_*`.

For M5-3 rendered-expression nodes, property proposals should usually lead with `m_*` and `c_*`.

For M5-4 agentic-protocol nodes, property proposals may braid `s_*`, `m_*`, `c_*`, and `t_*`, because these nodes mediate runtime stack, rendered surface, and session/review traces.

## 5. Bounded Search And GraphRAG Modes

### 5.1 Query Modes

Bounded semantic search should expose coordinate-scope modes rather than broad undifferentiated graph search.

Recommended modes:

| Mode | Coordinate scope | Use |
|---|---|---|
| `bimba_map` | direct `M*` without prime, plus C/P/L/T as requested | General bimba-map conceptual querying |
| `stack_system` | `S*` including direct and prime | M5-2 technical stack/system querying |
| `m_prime_expression` | `M*` with prime | M5-3 rendered Theia/Electron expression querying |
| `agentic_protocols` | `M5-4` neighborhood plus S4/S4'/S5/S5' and VAK/agent nodes | M5-4 operational mediation querying |
| `mef_lenses` | `L*` plus `M2-1*` | 12fold MEF lens querying |
| `world_return` | S5/S5', gnosis, Graphiti, kbase, review/promote coordinates | S5/S5' return and governance querying |

These modes should compile to coordinate filters before vector/rerank behavior. Vector similarity should never erase coordinate scope.

### 5.2 Example Mode Compilation

For `stack_system`:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "S"
RETURN n
```

For `m_prime_expression`:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "M"
  AND n.coordinate CONTAINS "'"
RETURN n
```

For `agentic_protocols`:

```cypher
MATCH (m:Bimba {coordinate: "M5-4"})-[r*1..2]-(n:Bimba)
WHERE n.coordinate STARTS WITH "S4"
   OR n.coordinate STARTS WITH "S5"
   OR n.coordinate STARTS WITH "M5-4"
   OR n.coordinate IN ["VAK", "CPF", "CT", "CP", "CF", "CFP", "CS"]
RETURN DISTINCT n
ORDER BY n.coordinate
```

For `mef_lenses`:

```cypher
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH "L"
   OR n.coordinate STARTS WITH "M2-1"
RETURN n
ORDER BY n.coordinate
```

## 6. M2-1 MEF 12fold Update

### 6.1 Canonical Set

The M2-1 MEF lens system must align to the canonical 12fold set:

| Index | Coordinate | Name |
|---:|---|---|
| 0 | [[L0]] | Quaternal |
| 1 | [[L1]] | Causal |
| 2 | [[L2]] | Logical |
| 3 | [[L3]] | Processual |
| 4 | [[L4]] | Phenomenological |
| 5 | [[L5]] | Para Vak |
| 6 | [[L0']] | Archetypal-Numerical |
| 7 | [[L1']] | Phenomenal |
| 8 | [[L2']] | Alchemical-Elemental |
| 9 | [[L3']] | Chronological |
| 10 | [[L4']] | Scientific |
| 11 | [[L5']] | Divine Logos |

This is `12 lenses x 6 positions = 72 conditions`. The M2-1 graph surface should not preserve older six-lens language except as historical compatibility evidence.

### 6.2 Relation To M5-2/3/4

M2-1 is important for all three branches:

- In [[M5-2]], the 12fold MEF set is technical stack data: S0/S2 code and graph schema must expose the canonical lens set and test it.
- In [[M5-3]], the 12fold MEF set is rendered expression: M2' and graph UI surfaces must display all 12 lenses and their Klein-square relations.
- In [[M5-4]], the 12fold MEF set is agentic protocol context: agents should route lens-specific analysis by L-coordinate, not by legacy six-lens aliases.

## 7. Diagram-First Architecture

Architecture diagrams should be the first port of call for architectural thinking. Graph nodes provide deeper access before diving into Seeds/specs or code files.

The intended descent is:

```text
diagram / canvas
→ coordinate node
→ node properties and relation neighborhood
→ World crystallization
→ Seed/spec provenance
→ code paths and tests
```

This means graph nodes should carry diagram anchors where available:

- source diagram path
- diagram node id or canvas id
- coordinate shown in diagram
- relation visualized in diagram
- diagram status: draft, canonical, deprecated, superseded

The graph should not treat diagrams as decorative. Diagrams are architectural evidence and should participate in relation/provenance queries.

## 8. Moirai Refinement

Moirai should refine around graph-coordinate work as a set of modes, not only session-end Night' summaries.

Recommended Moirai modes:

| Mode | Function |
|---|---|
| `cluster_trace` | identify the coordinate cluster touched by a task |
| `property_audit` | inspect whether nodes carry useful runtime properties |
| `relation_evidence_audit` | inspect whether edges have evidence text, confidence, and source path |
| `diagram_coherence_audit` | compare diagram relationships against graph relations |
| `technical_stack_distillation` | summarize S/S' node clusters for M5-2 |
| `m_prime_surface_distillation` | summarize M' node clusters for M5-3 |
| `agentic_protocol_distillation` | summarize M5-4/S4/S5 agentic protocol clusters |

The three Moirai functions can retain their Night' mapping:

- Klotho: traces and threads
- Lachesis: sources, measures, and provenance
- Atropos: crystallizations, cuts, and retained insight

But their task prompts should be specialized by coordinate cluster type.

## 9. Acceptance Criteria

This spec is satisfied when:

1. `M5-2`, `M5-3`, and `M5-4` retain their direct M names (`Siva-`, `-Shakti`, `Siva-Shakti`) or upgraded equivalent direct names with Prakrti/Purusha aliases, while M' rendered names are stored separately as affordances.
2. Query tooling can fetch full M5-2 scope by `coordinate STARTS WITH "S"`.
3. Query tooling can fetch full M5-3 scope by `coordinate STARTS WITH "M"` plus prime detection.
4. Query tooling can fetch M5-4 protocol neighborhood through direct coordinate relations plus S4/S4'/S5/S5'/VAK agentic anchors.
5. S/S' nodes carry useful runtime properties: pithy descriptions, code paths, CRUD owner, gateway/API methods, tests, and promotion/evidence status where applicable.
6. M' nodes carry useful rendered-expression properties: Theia extension/component path, rendered affordance, kernel-bridge dependency, graph surface, UI route, and diagram anchors where applicable.
7. M5-4 agentic nodes carry protocol properties: agent role, VAK binding, capability gates, review authority, allowed/forbidden actions, and human-validation requirements where applicable.
8. M2-1 graph/docs/UI references align to the canonical 12fold MEF lens set.
9. Bounded semantic search exposes at least `bimba_map`, `stack_system`, `m_prime_expression`, `agentic_protocols`, and `mef_lenses` modes.
10. Diagram anchors are treated as graph evidence, not decorative metadata.

## 10. Non-Goals

This spec does not implement the graph updates. It defines the coordinate law and target schema behavior for the implementation pass.

This spec does not rename the whole M5 branch to IDE-facing product names. It explicitly prevents that collapse.

This spec does not make labels the canonical query authority. Labels may remain useful, but `coordinate` drives scope.

This spec does not replace Seeds with World files or World files with code. Seeds remain pre-development specification; World remains crystallized post-development shape tracking; code remains runtime implementation; graph nodes mediate access between them.

