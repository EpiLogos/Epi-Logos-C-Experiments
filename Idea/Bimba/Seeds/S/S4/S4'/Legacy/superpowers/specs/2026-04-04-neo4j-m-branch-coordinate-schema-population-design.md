# Neo4j M-Branch Coordinate Schema Population Design

**Date:** 2026-04-04
**Status:** Canonical
**Scope:** Conversion of `#X`-notation JSON datasets into coordinate-forward HCNode schema in Neo4j S2' — populating the full M-branch tree via an idempotent Ralph loop pipeline.

---

## 1. Problem Statement

The existing JSON datasets (`docs/datasets/*/nodes-full-detail.json`) contain ~2,444 coordinate nodes using the old Bimba `#X-Y-Z` notation, with richly varied but inconsistent property names and types across subsystems. The target is Neo4j S2' populated with the full M-branch coordinate tree, where:

- Property keys follow the coordinate system itself (`{family}_{n}_{semantic}`)
- Canonical core properties are ubiquitous and strictly typed
- Harmonizable properties are normalized across subsystems
- Subsystem-specific properties are retained with coordinate-prefixed naming
- Relation properties follow the same schema convention as node properties (parity)
- The 18-fold pointer web is expressed in both pointer properties and driving property development

---

## 2. Coordinate-Forward Property Naming Convention

The coordinate system is the schema. Property keys follow the established `{family}_{n}_{semantic}` pattern, where:

- `family` ∈ `{c, p, l, s, t, m}` — the six coordinate families
- `n` ∈ `{0, 1, 2, 3, 4, 5}` — QL position
- `semantic` — snake_case descriptor

The C-family is the ontological default. All universal structural properties use C-family keys. Subsystem-specific properties use their natural family (M for M-branch subsystem data, etc.).

`coordinate` is the single exempt key — it IS the Bimba ground reference, not a property.

---

## 3. The 18-Fold Pointer Web

The pointer web has three groups of six, totalling 18:

| Group | Members | Role |
|-------|---------|------|
| **Direct families** | `c`, `p`, `l`, `s`, `t`, `m` | Six coordinate family cross-references |
| **Reflective coords** | `cpf`, `ct`, `cp`, `cf`, `cfp`, `cs` | Execution matrix (Layer 3) |
| **Inverted families** | `c'`, `p'`, `l'`, `s'`, `t'`, `m'` | Phase-inverted counterparts via `#` operation |

In Neo4j these are stored as both:
- **Relationship edges** — the actual graph traversal paths
- **String reference properties** — `c_ref`, `p_ref`, ... `c_inv_ref`, `p_inv_ref`, ... for fast lookup without traversal

Inverted pointers (`c'`–`m'`) are not cosmetic — they extend the property-generative space. Where a node has meaningful inverted-coordinate data (e.g., the `#` applied state, the complementary phase), those properties use `c_Xi_*` notation.

---

## 4. Node Property Schema

### 4.1 Canonical Core (all BimbaNode instances)

Strictly enforced. All nodes carry these regardless of M-branch.

```
coordinate          (string, PK — exempt key, not prefixed)
c_0_essence         (string — harmonized from: operationalEssence > essence > coreNature)
c_1_name            (string)
c_1_description     (string)
c_1_form            (string — internalStructure: how the coordinate manifests structurally)
c_2_uuid            (string — UUID v5 derived deterministically from coordinate)
c_3_updated_at      (ISO 8601 string — harmonized from: updated_at > lastUpdated > updatedAt)
c_3_context_frame   (string — canonical enum value, harmonized from contextFrame variants)
c_4_family          (enum: C | P | L | S | T | M | NONE)
c_4_ql_position     (int 0–5 — coerced from float 0.0 in source)
c_4_layer           (enum: PSYCHOID | WEAVE | CONTEXT_FRAME | COORDINATE | VAK)
c_4_topo_mode       (enum: ZERO_SPHERE | TORUS | LEMNISCATE | KLEIN)
c_4_access_level    (string — accessLevel)
c_4_ql_category     (enum: implicate | explicate | both)
c_4_ql_operator_types (string[] — always array, coerced from string if needed)
c_5_resonances      (string[] — always array, harmonized from string | array)
c_5_embedding       (float[] — 3072-dim Gemini embedding, populated in Stage 5)
```

### 4.2 Harmonizable Properties (present in multiple subsystems, typed inconsistently in source)

These exist across branches but with different names or types. The pipeline normalizes them to canonical keys:

```
c_1_key_principles          (string[] — always array; source: keyPrinciples)
c_3_practical_applications  (string[] — always array; source: practicalApplications)
c_0_consciousness_structure (string — source: consciousnessStructure)
c_0_anuttara_languification (string — source: anuttaraLanguification, present M2–M5)
c_3_related_coordinates     (string — source: relatedCoordinates)
c_1_architectural_function  (string — source: architecturalFunction)
c_1_operational_symbolics   (string — source: operationalSymbolics)
c_3_developmental_stages    (string[] — source: *DevelopmentalStages variants, always array)
c_3_void_relationship       (string — source: *VoidRelationship variants)
c_1_void_grammar_structure  (string — source: voidGrammarStructure)
```

**Timestamp harmonization priority**: `updated_at` > `lastUpdated` > `updatedAt`
**Resonances harmonization**: if string → wrap in array; deduplicate.
**Notion IDs**: `notionPageId` is dropped — not carried into new schema.

### 4.3 Subsystem-Specific Properties (genuine to branch or node cluster)

Prefixed with `m_{n}_` where `n` is the subsystem position. Retained as-is from source, with snake_case normalization of key names.

**M0 (Anuttara):**
```
m_0_lacanian_mapping        (string — lacanianTriadicMapping)
m_0_resonance_traditions    (string — resonances string variant at root level)
```

**M1 (Paramasiva):**
```
m_1_clifford_signature      (string — Clifford Cl(4,2) encoding)
m_1_spanda_tick             (int — tick12, 0–11)
m_1_trigram_basis           (string — spinor/trigram mapping)
m_1_ananda_matrix_row       (string — which Ananda matrix row governs)
```

**M2 (Parashakti):**
```
m_2_decan_signature         (string — decanSignature)
m_2_tattva_mapping          (string — tattvaMapping: descent/ascent)
m_2_vibrational_ratio       (string — coreVibrationalRatio)
m_2_trinity_operations      (string — trinityOperations: +, ×, /)
m_2_absent_operation        (string — absentOperation)
m_2_name_matrix             (string — nameMatrix: 72 divine names)
m_2_void_query              (string — parashaktiVoidRelationship)
```

**M3 (Mahamaya):**
```
m_3_quaternionic_signature  (string — quaternionicSignature)
m_3_matrix_symmetry         (string — matrixSymmetry: SU(3))
m_3_rotational_dynamics     (string — rotationalDynamics: SU(2))
m_3_non_dual_anchors        (int — nonDualAnchors: 40)
m_3_seed_ratio              (string — seedRatio: 41:43)
m_3_core_ratio              (string — coreRatio: 64:8:40)
m_3_harmonic_ratio          (string — harmonicRatio: 360:40:9)
m_3_universal_grammar       (string — universalGrammar)
m_3_prime_stabilization     (string — primeStabilization)
m_3_axiological_framework   (string — axioLogicalFramework)
m_3_environmental_conducting (string — environmentalConducting)
```

**M4 (Nara):**
```
m_4_eve_numbers_path        (string — eveNumbersPath)
m_4_eve_numbers_dynamic     (string — eveNumbersDynamic)
m_4_archetypal_family       (string — archetypalFamilyStructure)
m_4_oceanic_metaphor        (string — oceanicMetaphor)
m_4_siva_shakti_dynamics    (string[] — sivaShaktiDynamics)
m_4_two_stroke_doctrine     (string — twoStrokeDoctrine)
m_4_dialogical_containers   (string — dialogicalContainers)
m_4_temporal_layer          (string — temporalIntelligenceLayer)
m_4_epistemic_separation    (string — epistemicSeparation)
m_4_nara_coordinate_system  (string — naraCoordinateSystem)
m_4_transformational_tech   (string[] — naraTransformationalTechnologies)
m_4_personal_pratibimba     (string — personalPratibimbaArchitecture)
m_4_spanda_coordinate_entry (string — spandaCoordinateEntry)
```

**M5 (Epii):**
```
m_5_logos_cycle             (string — f_logos_cycle_capability_cycle_structure)
m_5_logos_grounding         (string — f_logos_cycle_capability_philosophical_grounding)
m_5_archaeology_method      (string — f_etymological_archaeology_capability_method)
m_5_archaeology_namespaces  (string[] — f_contemplative_synthesis_requires_namespaces)
m_5_contemplative_modes     (string[] — f_contemplative_synthesis_modes)
m_5_geometric_epistemology  (string — geometricEpistemologyParadigm)
m_5_conscire_structure      (string — conScire_dialogical_structure)
m_5_lacanian_interface      (string — lacanianPublicInterface)
m_5_whitehead_lacanian      (string — whiteheadLacanSynthesis)
m_5_next_evolution          (string[] — nextEvolutionPhase)
m_5_namespaces              (string[] — references to active knowledge namespaces)
```

### 4.4 Inverted-Coordinate Properties (18-fold extension)

Where a node has meaningful phase-inverted state (the `#` operation applied), properties use:
```
c_Xi_*   — C-family inverted (e.g., c_0i_inverted_essence)
m_Xi_*   — M-family inverted (e.g., m_3i_shadow_signature)
```

These are populated when the source data contains explicitly inverted/shadow coordinate content (e.g., shadow decans at `#2-3`, reversed Tarot meanings). Not fabricated — only populated from confirmed source data.

### 4.5 18-Fold Pointer Reference Properties

```
c_ref, p_ref, l_ref, s_ref, t_ref, m_ref       (string — direct family cross-refs)
cpf_ref, ct_ref, cp_ref, cf_ref, cfp_ref, cs_ref (string — reflective coord refs)
c_inv_ref, p_inv_ref, l_inv_ref,
s_inv_ref, t_inv_ref, m_inv_ref                 (string — inverted family refs)
```

All are coordinate strings (e.g., `"#3-1-0"`). Populated in Stage 6 after the full tree exists.

---

## 5. Relation Property Schema (parity with nodes)

Relation properties follow the same `{family}_{n}_{semantic}` convention. This gives structural parity between node and relation schemas — both are coordinate-forward.

### 5.1 Canonical Relation Core (all edges)

```
c_3_created_at      (ISO 8601 — when relation was established)
c_4_confidence      (float 0.0–1.0 — certainty of relation)
c_4_method          (enum: direct | llm_classified | inferred | structural)
c_5_source_ref      (string — which dataset file or process asserted this relation)
```

Note: relation type identity is carried by the Neo4j relationship label itself (e.g. `CONTAINS`, `RESONATES_WITH`). `c_4_relation_type` as a property is not added — it would be redundant.

### 5.2 Subsystem-Contextual Relation Properties

Where a relation carries domain-specific context, the same `m_{n}_*` prefix applies:

```
m_3_decan_context   (string — which decan governs a M3 symbolic relation)
m_3_hexagram_pair   (string — complementarity/movement/resonance pairing matrix ID)
m_2_element_bridge  (string — which Mahabhuta element mediates a M2 vibrational relation)
m_4_oracle_moment   (string — kairos timestamp when relation was oracle-cast)
```

---

## 6. Node Labels

No subsystem-specific labels (`:M3Node`, etc.). Nodes carry:
- `:BimbaNode` — all M-branch coordinate nodes
- Any existing labels already in the graph are preserved

The coordinate-forward property naming makes subsystem filtering trivially possible in Cypher without label proliferation:
```cypher
MATCH (n:BimbaNode) WHERE n.c_4_family = "M" AND n.c_4_ql_position = 3
```

---

## 7. Canonical Relation Types

The 34+ relation types already documented are largely correct. The coordinate-forward schema extends them via relation properties (above), not by multiplying relation type names.

Key canonical types used in M-branch population:
```
CONTAINS              — hierarchical subsumption (#3 CONTAINS #3-1)
HAS_SUBSYSTEM         — top-level branch relationships (# HAS_SUBSYSTEM #3)
HAS_INTERNAL_COMPONENT — sub-branch components
HAS_LENS              — epistemic lens annotations
MAPS_TO_COORDINATE    — cross-namespace entity → BimbaNode (confidence 1.0)
RESONATES_WITH        — softer coordinate resonance (confidence < 1.0)
REFLECTS_DNA_FORM     — M3 codon → hexagram
GOVERNS_TAROT_EXPRESSION — M3 decan → Tarot card
TRANSLATES_TO         — M3 symbolic chain steps
EXHIBITS_META_PATTERN — meta-relational cross-branch
ZERO_ONE_UNITY        — non-dual pairing
POLAR_OPPOSITE        — inverted coordinate relationships
ANCHORED_BY           — topological anchor (e.g. M4 ANCHORED_BY lemniscate)
FLOWS_CLOCKWISE       — M2/M3 clock-walk sequence
```

---

## 8. Source Data → Schema Mapping

### 8.1 Coordinate Address Mapping

Source JSON `coordinate` field maps directly to the new `coordinate` key. The `#X` prefix IS the M-branch address:

```
#0    → M0 (Anuttara),   c_4_ql_position: 0
#1    → M1 (Paramasiva), c_4_ql_position: 1
#2    → M2 (Parashakti), c_4_ql_position: 2
#3    → M3 (Mahamaya),   c_4_ql_position: 3
#4    → M4 (Nara),       c_4_ql_position: 4
#5    → M5 (Epii),       c_4_ql_position: 5
#3-1-0-0 → sub-branch at M3, c_4_ql_position = 3 (M-family position, always the first digit — not sub-branch depth)
```

`c_4_ql_position` always encodes the M-branch position (0–5), not internal sub-branch depth. Sub-branch depth is encoded in the `coordinate` string itself.

`c_4_layer` assignment by depth:
- Depth 1 (`#0`–`#5`): `PSYCHOID`
- Depth 2–3 (`#3-1`, `#3-1-0`): `COORDINATE`
- Context frame nodes: `CONTEXT_FRAME`
- VAK execution nodes: `VAK`

`c_4_topo_mode` assignment by subsystem:
- M0: `ZERO_SPHERE` (void ground, disconnected)
- M1: `TORUS` (12-tick spanda, cyclical)
- M2: `TORUS` (72-invariant vibrational template)
- M3: `LEMNISCATE` (figure-eight pairing matrices, #4 anchor)
- M4: `LEMNISCATE` (personal fractal doubling, cf anchor)
- M5: `KLEIN` (inside/outside one, Möbius return)

### 8.2 Property Harmonization Rules

| Source variants | Canonical key | Transform |
|-----------------|---------------|-----------|
| `updated_at`, `lastUpdated`, `updatedAt` | `c_3_updated_at` | Take first non-null in priority order |
| `operationalEssence`, `essence`, `coreNature` | `c_0_essence` | Take first non-null in priority order |
| `resonances` (string or array) | `c_5_resonances` | Wrap string in `[]`; deduplicate |
| `practicalApplications` (string or array) | `c_3_practical_applications` | Wrap string in `[]` |
| `keyPrinciples` (string or array) | `c_1_key_principles` | Wrap string in `[]` |
| `contextFrame` (string), `contextFrames` (array) | `c_3_context_frame` | If string: use directly. If array: take first element. Normalize to canonical enum string (e.g. `"(0/1/2)"`) |
| `qlPosition` (float 0.0) | `c_4_ql_position` | `Math.floor()` → int |
| `subsystem`, `id` (int) | *dropped* | Redundant with `c_4_ql_position` for M-branch nodes; not carried forward |
| `*DevelopmentalStages` (array) | `c_3_developmental_stages` | Direct, strip subsystem prefix |
| `*VoidRelationship` (string) | `c_3_void_relationship` | Direct, strip subsystem prefix |
| `notionPageId` | *dropped* | Not carried forward |

---

## 9. Pipeline: 6-Stage Ralph Loop

Each stage is independently re-runnable (idempotent). Ralph workers operate per M-branch file.

### Stage 0: Schema Bootstrap (once, DDL)
```cypher
CREATE CONSTRAINT bimba_coordinate_unique IF NOT EXISTS
  FOR (n:BimbaNode) REQUIRE n.coordinate IS UNIQUE;

CREATE INDEX bimba_family IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_family);

CREATE INDEX bimba_ql_position IF NOT EXISTS
  FOR (n:BimbaNode) ON (n.c_4_ql_position);

CREATE VECTOR INDEX bimba_embedding IF NOT EXISTS
  FOR (n:BimbaNode) ON n.c_5_embedding
  OPTIONS { indexConfig: {
    `vector.dimensions`: 3072,
    `vector.similarity_function`: 'cosine'
  }};
```

### Stage 1: Extract + Normalize (per M-branch JSON file)
- Read `nodes-full-detail.json` for each subsystem
- Apply harmonization rules (Section 8.2)
- Coerce property types (arrays, ints, ISO dates)
- Build canonical HCNode record + subsystem extension properties
- Emit normalized node records for Stage 3

### Stage 2: Coordinate Enrichment (per node)
- Parse `coordinate` string → extract `c_4_ql_position`, depth, subsystem
- Assign `c_4_layer` by depth rule
- Assign `c_4_topo_mode` by subsystem rule
- Generate `c_2_uuid` = UUID v5(coordinate)
- Set `c_4_family = "M"`

### Stage 3: Neo4j MERGE (idempotent node upsert)
```cypher
UNWIND $batch AS node
MERGE (n:BimbaNode { coordinate: node.coordinate })
SET n += node.canonicalProps
SET n += node.subsystemProps
ON CREATE SET n.c_3_created_at = $now
```
Batch size: 500 nodes per transaction.

### Stage 4: Relationship Population (per relations JSON)
- Read `relations.json` per subsystem
- Map source `relType` to canonical relation type
- Add canonical relation properties (`c_4_method: "structural"`, `c_4_confidence: 1.0`)
- Add any subsystem-contextual relation properties
- **Dynamic rel types require APOC** — Cypher `MERGE` does not support dynamic relationship type labels. Use `apoc.merge.relationship` or generate per-type Cypher batches:
```cypher
// Pattern per relation type (one batch per canonical rel type):
UNWIND $batch AS rel
MATCH (a:BimbaNode { coordinate: rel.source })
MATCH (b:BimbaNode { coordinate: rel.target })
CALL apoc.merge.relationship(a, rel.relType, {}, rel.props, b) YIELD rel AS r
RETURN count(r)
```

### Stage 5: Embedding Generation (async, re-runnable)
- Batch nodes lacking `c_5_embedding`
- Call Gemini `gemini-embedding-2-preview` (3072-dim)
- Input text: `"{coordinate}: {c_1_name}. {c_0_essence}. {c_1_description}"`
- `SET n.c_5_embedding = $embedding`
- Batch size: 100 nodes per API call

### Stage 6: 18-Fold Pointer Resolution (after full tree exists)
- For each node, resolve cross-family references
- Populate `c_ref`, `p_ref`, `l_ref`, `s_ref`, `t_ref`, `m_ref`
- Populate `cpf_ref`, `ct_ref`, `cp_ref`, `cf_ref`, `cfp_ref`, `cs_ref`
- Populate `c_inv_ref`–`m_inv_ref` for confirmed inverted states
- Create corresponding RELATIONSHIP edges alongside the string props

---

## 10. Gaps and Provisional Nodes

Not all coordinates have complete source data. Known gaps handled as:

| Gap | Handling |
|-----|---------|
| M1 Clifford sigs (`#1-0`–`#1-5`) | Stub nodes with `c_4_layer: COORDINATE`, populate m_1_* when confirmed |
| M2 outer planets (`#2-5-7/8/9`) | Stub nodes; flag `c_4_access_level: "provisional"` |
| M3 pairing matrices (`#3-2-matrix-{1,2,3}`) | Not yet discrete; skip until nodes confirmed in dataset |
| M1 trigram nodes (`#1-5-trigram-{0..7}`) | Implicit only; generate from Ananda matrix when confirmed |
| Rotational state nodes (M3) | Generate via `rotational_state_protocol.txt`; not from JSON |

Provisional nodes are tagged `c_4_access_level: "provisional"` and excluded from embedding generation until confirmed.

---

## 11. Information Fidelity Guarantee

The pipeline is designed to lose nothing from source data:

1. **All canonical properties** are mapped explicitly to `c_*` keys
2. **All harmonizable properties** are normalized but retained (not merged-and-lost)
3. **All subsystem-specific properties** are retained under `m_{n}_*` prefixes
4. **The original `coordinate` string** is the PK — no information loss in the address
5. **Dropped fields** are only: `notionPageId` (Notion artifact, not semantic)
6. **Source files are not modified** — pipeline reads only

---

## 12. Ralph Loop Configuration

The pipeline runs as a Ralph task sequence, one worker per M-branch:

```yaml
# ralph task definition (per-branch)
- id: populate-m{n}-branch
  stages:
    - extract-normalize    # Stage 1
    - enrich-coordinates   # Stage 2
    - neo4j-merge          # Stage 3
    - populate-relations   # Stage 4
  depends_on: schema-bootstrap

- id: generate-embeddings
  stages:
    - embed-batch
  depends_on: [populate-m0-branch, populate-m1-branch, populate-m2-branch, populate-m3-branch, populate-m4-branch, populate-m5-branch]

- id: resolve-pointers
  stages:
    - wire-18fold-pointers
  depends_on: generate-embeddings
```

M-branch workers (`m0`–`m5`) run in parallel. Embedding and pointer resolution run sequentially after all branches are populated.

---

*Spec version: 1.0*
*Ground: CLAUDE.md §II–III (coordinate system), MEMORY.md (M-branch status, HC struct, frontmatter key law)*
*Related: Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-hc-zod-schema-design.md, Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-03-gnostic-rag-anything-migration-design.md*
