# Deep Bimba Regional Property Update Protocol

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans before mutating importer/runtime code from this protocol.

**Goal:** Update the deep Bimba map with coordinate-forward properties across all coordinate families, not only `c_*` and M-derived fields.

**Architecture:** Treat properties as regional coordinate structures. Universal ontology stays in `c_*`; family-specific content uses `p_*`, `l_*`, `s_*`, `t_*`, `q_*`, or the serialized M-prime property surface when the content belongs to that coordinate family. Batch generation is allowed when multiple source nodes share an identical regional property structure.

**Tech Stack:** Deep JSON datasets in `docs/datasets/*-deep`, S2 graph schema in `Body/S/S2/graph-schema`, importer support in `Body/S/S2/graph-services`, reviewable Cypher patches, live Neo4j verification.

---

## Core Correction

The prior shorthand "C plus M" is insufficient. The naming law is:

```text
{family}_{n}[_{sub_n}]*_{semantic}
```

where `family` is any approved property family such as `c`, `p`, `l`, `s`, `t`, `q`, or the serialized M-prime property surface.

The `c_*` family is still the universal ontological layer, but it is not the dumping ground for every reusable property. If the content is positional, lens-based, system-layer, thought-plane, quick-view/quintessential, or M-prime expressive, it should be addressed by that family.

M needs one extra guardrail: M coordinates are the Bimba nodes themselves. They are not ordinary properties of the node. Therefore M-derived property keys describe the M-prime/Pratibimba expression surface of an M node: the operational, reflected, or usable aspect exposed by the dataset. If the content is simply "this node is M2", that belongs in `coordinate`/computed metadata, not an `m_*` property.

M-prime serialized property keys must use the coordinate-slot form:

```text
m_{n}_{i?}_{semantic}
```

where `n` is the M-root coordinate and optional `i` is the owning node's immediate sub-coordinate slot. This means `M2-4-*` name-matrix surfaces use keys such as `m_2_4_abjad_value`; root `M5` surfaces may use `m_5_lacanian_interface`. Do not use loose global keys when a sub-coordinate slot is present.

## Property Regions

### Universal C Region

Use `c_*` for properties that every Bimba node can carry regardless of coordinate family:

- `c_0_*`: ground, source, essence, provenance.
- `c_1_*`: form, name, description, structure, designation.
- `c_2_*`: identity, UUID, instance facts.
- `c_3_*`: process, update time, operations, lifecycle.
- `c_4_*`: type, coordinate family, QL position, access, category.
- `c_5_*`: integration, resonances, embeddings, pointer summaries.

Batch rule: universal source keys such as `name`, `primaryDesignation`, `description`, `coreNature`, `operationalEssence`, `contextFrame`, `qlCategory`, `qlOperatorTypes`, `resonances`, and `relatedCoordinates` can be mapped once and reused across all branches.

### P Region

Use `p_*` when content describes QL positional meaning rather than this node's general category.

Candidate source families:

- `qlPosition`, `qlVariant`, `qlPositionWeave`.
- `positionId`, `stageId`, position-specific sequence fields.
- fields whose meaning is "this is what P0/P1/P2/P3/P4/P5 does here."

Batch rule: build six positional templates, one per P position. Every branch can reuse these when source keys express position rather than subsystem.

### L Region

Use `l_*` when content describes lens stance, epistemic mode, element, interpretation, or MEF/Klein-square resonance.

Candidate source families:

- `elementalNature`, `seasonalPosition`, `modality`.
- `mefCondition`, `interpretiveRole`, `reflectionTable`.
- `therapeuticProperties`, `temperamentBalance`, `healingSpecialty` when functioning as lens/diagnostic stance rather than M2-only content.
- alchemical, phenomenological, causal, logical, processual, chronological, archetypal, or logos-oriented keys.

Batch rule: create reusable lens blocks for the twelve L/L' lenses, but emit only `l_0_*` through `l_5_*` until the graph schema explicitly accepts prime-lens key encoding.

### S Region

Use `s_*` when content belongs to system stack, runtime layer, agent protocol, gateway, vault, graph, session, or tool boundary.

Candidate source families:

- `subsystem`, `architecturalFunction`, `accessLevel`.
- `f_inputContracts`, `f_outputContracts`, `f_queryableProperties`, `f_translationSchema`.
- `f_agent`, `f_tool_affinity`, `f_system_prompt`, `f_capabilities`.
- gateway/session/runtime orientation fields.

Batch rule: S-region content can be grouped by system layer (`S0` through `S5`) and by inversion when it describes an operational API rather than canonical architecture.

### T Region

Use `t_*` when content describes thought-plane, learning, insight, trace, challenge, pattern, or reflective artifact lifecycle.

Candidate source families:

- fields describing questions, traces, challenges, patterns, discoveries, insights.
- `developmentalStage`, `nextEvolutionPhase`, `epistemicFunction`.
- archive/classification fields for Thought/Pratibimba material.

Batch rule: T-region templates should mirror the six T buckets. They are not the same as C process fields; T describes the mode of thought, not merely the existence of an update process.

### Q Region

Use `q_*` for quintessential quick-view properties: compact, high-signal detail surfaces that feed the pithy node views exposed through the core knowing CLI.

Candidate source families:

- `q_*` source keys from Epii/deep datasets.
- short theoretical theses, dialectical movements, integration templates, and instantiation summaries.
- pithy/summary fields intended for fast node orientation rather than exhaustive content storage.

Format:

```text
q_{n}_{semantic}
```

where `n` follows the same 0-5 coordinate semantics. These fields are the durable graph-side detail layer behind quick-view output. The generated C quick-view data in `src/qv_data.c` is baked by `epi core knowing --bake`; updates flow through `epi core knowing <COORD> --update "pithy"`. The Q-region should therefore be treated as the evolving source surface for future QV/pithy refreshes, not as Epii-only branch data.

Batch rule: Q-region fields can be batched wherever the source explicitly marks `q_*`, but they must remain concise and quick-look oriented. Long prose belongs in C/T/S/M-prime regions, not Q.

### M-Prime Region

Use the serialized M-prime property surface only when content belongs to the reflected/operational expression of a specific M subsystem.

Examples:

- M0: Anuttara, void grammar, consciousness ground, Lacanian/Vedantic mappings.
- M1: Paramasiva, QL topology, Clifford/spanda/math generation.
- M2: Parashakti, vibrational ratios, names, planets, dhikr, therapeutic matrices.
- M3: Mahamaya, codons, quaternionics, degrees, trigrams, tarot/I Ching symbolic transcription.
- M4: Nara, personal interface, formats, transformation tech, dialogical containers.
- M5': Epii, logos cycle, archaeology, agent governance, gnosis synthesis as exposed for use.

Batch rule: M-prime properties are branch-local by default. Only batch across branches after proving the semantic key means the same thing in both places. Do not create properties for bare M identity; M identity is the node coordinate itself.

Prefix rule: derive the `m_{n}_{i?}` prefix from each target node coordinate during import/review generation. The source key decides the semantic tail; the node coordinate decides the M-prime address.

## Regional Batching Strategy

1. Run a source-key census per deep branch.
2. Classify every recurring key into one of seven regions: C, P, L, S, T, Q, M-prime.
3. For each region, create a property map table with:
   - source key
   - target property key
   - value type
   - coordinate home
   - batch scope
   - review status
4. Batch by identical regional structure, not by file.
5. Generate Cypher patch files per batch:
   - `c-universal.cypher`
   - `p-position-batches.cypher`
   - `l-lens-batches.cypher`
   - `s-system-batches.cypher`
   - `t-thought-batches.cypher`
   - `q-quickview-batches.cypher`
   - `m0-prime` through `m5-prime` branch-local Cypher
6. Mark any unregistered property as `// PROPOSED` and do not execute until approved.

## Initial Batch Shapes From Dataset Census

Universal C shape:

- Present across all branches: `coordinate`, `bimbaCoordinate`, `name`, `primaryDesignation`, `description`, `coreNature`, `operationalEssence`, `lastUpdated`, `updatedAt`, `contextFrame`, `qlCategory`, `qlOperatorTypes`, `resonances`, `relatedCoordinates`, `accessLevel`.

P shape:

- Present in multiple branches: `qlPosition`, `qlVariant`, `qlPositionWeave`, `positionId`, `stageId`, `sequence`.

L shape:

- Present or strongly implied: `elementalNature`, `seasonalPosition`, `modality`, `mefCondition`, `interpretiveRole`, `reflectionTable`, `therapeuticProperties`, `temperamentBalance`, `healingSpecialty`, `chakraCorrespondence`, `breathPattern`.

S shape:

- Present in system-facing branches: `subsystem`, `architecturalFunction`, `accessLevel`, `f_role`, `f_inputContracts`, `f_outputContracts`, `f_queryableProperties`, `f_translationSchema`, `f_agent`, `f_tool_affinity`, `f_system_prompt`, `f_capabilities`.

T shape:

- Present or implied: `developmentalStage`, `nextEvolutionPhase`, `epistemicFunction`, `practicalApplications`, reflective process descriptors.

Q shape:

- Present in M5/Epii deep data: `q_theoreticalThesis`, `q_sophiaLogosDialectic`, `q_integrationTemplate`, `q_instantiationMode`, `q_historicalDiagnosis`, `q_dialecticalMovement`, `q_conjunctiveThreshold`.

M-prime branch-local shape:

- M0: `consciousnessOperation`, `grammaticalFunction`, `spandaRelationship`, `metaphysicalNames`.
- M1: `topologicalSignificance`, `topologicalFormula`, `processualTopologyRole`, `matrixType`, `constructionPhase`.
- M2: `abjadValue`, `arabicText`, `trilateralRoot`, `dhikrApplication`, `recitationCount`, `zodiacalInfluence`, `therapeuticCluster`.
- M3: `degree`, `quadrant`, `rotationalPhase`, `yinYangBalance`, `aminoAcidCode`, codon binaries, tarot/I Ching fields.
- M4: `f_role`, `f_inputContracts`, `f_outputContracts`, `twoStrokeDoctrine`, `temporalStructure`, `safetyClass`, `eligibleFormats`.
- M5': `f_agent`, `f_tool_affinity`, `f_system_prompt`, archaeology/logos/interface fields. Explicit `q_*` fields belong to Q-region.

## Execution Protocol

### Task 1: Create Property Map

Create `docs/datasets/deep-property-map.md`.

Populate it with one table per region. Include every recurring source key with target property proposal and batch scope.

### Task 2: Add Schema Registry Entries

Before executable writes, update `Body/S/S2/graph-schema/src/lib.rs` with approved non-C property specs.

Tests must prove:

- each approved key exists in `coordinate_node_property_specs()`;
- no arbitrary unregistered key passes validation;
- `coordinate` remains the only unprefixed node key;
- `bimbaCoordinate` remains compatibility-only.

### Task 3: Generate Review Cypher

Generate targeted Cypher files from the property map. Use `MATCH (n:Bimba { coordinate })` and `SET n += { ... }` so a review/import batch can update existing Bimba nodes but cannot create new coordinates by accident.

Never execute generated Cypher in the same step that creates it.

### Task 4: Human Review

Review by batch region:

1. C universal
2. P positional
3. L lens
4. S system
5. T thought
6. Q quick-view/quintessential
7. M-prime branch-local, M0' through M5'

Review may approve, reject, rename, or split properties.

### Task 5: Execute Approved Batches

Execute approved Cypher against live Neo4j only after review.

Verify with real graph queries:

```cypher
MATCH (n:Bimba)
WHERE n.<property> IS NOT NULL
RETURN count(n), collect(n.coordinate)[0..10]
```

### Task 6: Detect Drift

After execution, run graph schema drift detection:

```cypher
MATCH (n:Bimba)
UNWIND keys(n) AS key
RETURN key, count(*) AS uses
ORDER BY key
```

Compare returned keys against the approved registry. Any unapproved key is a defect.

## Guardrails

- Do not flatten all content into `c_*`.
- Do not use `MERGE` in generated property-review patches; missing target nodes are graph-coverage defects, not import-time creation opportunities.
- Do not promote branch-local M-prime content into global schema just because it repeats within one branch.
- Do not turn M coordinate identity into an `m_*` property; M coordinates are the Bimba nodes.
- Do not bury `q_*` fields under `m_5_*`; Q is its own quick-view/quintessential surface.
- Do not invent content for empty slots.
- Do not execute proposed properties before registry approval.
- Do not treat source key names as authoritative. Classify by semantic function.
- Do not use mocks for verification. Use real dataset files and live or test-owned Neo4j nodes.

## Implementation Result, 2026-05-19

The first generator-hardening tranche is in place:

- `docs/datasets/scripts/generate-deep-regional-cypher.mjs` now exposes pure helpers for direct test coverage and only writes generated review files when invoked as a CLI script.
- Generated executable blocks use `MATCH`, never `MERGE`, and unregistered targets remain `// PROPOSED_REVIEW` comments outside `SET n +=`.
- Cypher string literals now escape quotes, backslashes, newlines, carriage returns, and tabs.
- `docs/datasets/scripts/generate-deep-regional-cypher.test.mjs` exercises the real deep dataset reader, generated block semantics, P-region non-executability, and literal escaping with Node's built-in test runner.

Verified:

```bash
node --test docs/datasets/scripts/generate-deep-regional-cypher.test.mjs
node docs/datasets/scripts/generate-deep-regional-cypher.mjs
```

The generated `Body/S/S5/epi-gnostic/cypher/generated/*.cypher` files remain ignored review artifacts. They are regenerable and should not be treated as applied migrations until schema review and live Neo4j verification complete.
