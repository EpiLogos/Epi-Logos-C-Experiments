---
coordinate: "S2'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S2-TRACEABILITY-INDEX]]"
---

# S2' Specification: Coordinate Graph Law, Retrieval, And Semantic Projection

## Canonical Status

This file is the single authoritative S2' seed. S2 is the graph substrate; S2' is coordinate graph law: canonical Bimba/M coordinate resolution, retrieval, rerank/enrich, constraint registration/testing, GraphRAG, semantic cache, pointer-web provenance, and graph-sync intent from S1. S2' does not own temporal episodes or Epii review meaning.

VAK gate: `CPF=(4.0/1-4.4/5)`, `CT=CT1`, `CP=4.2`, `CF=(0/1/2/3) Mythos pattern under Logos`, `CFP=S2'`, `CS=CS2`.

## Submodules And Subcoordinates

| Coordinate | Canonical surface | Current substrate |
|---|---|---|
| `S2.0'` | coordinate namespace and ontology import | `Body/S/S2/graph-schema`, `Body/S/S2/ontology` |
| `S2.1'` | node/edge schema, labels, constraints | `graph-schema/src`, Neo4j/neosemantics/OWL/SHACL plans |
| `S2.2'` | query/retrieval service | `Body/S/S2/graph-services/src/retrieval` |
| `S2.3'` | semantic cache and GraphRAG | Redis semantic cache, `graph-services` |
| `S2.4'` | pointer-web and kernel resonance projection | `s2.graph.pointer_web.*`, `s2.graph.kernel_resonance.record` |
| `S2.5'` | graph-sync, enrichment, M' handoff | S1 graph-sync intent, M0'/M5' graph consumers |

## Public APIs And Gateway Methods

| Method family | Status | Owner rule |
|---|---|---|
| `s2'.coordinate.cypher`, `ingest`, `analyse_resonance`, `persist_analysis`, `aggregate_resonance`, `resolve` | mirror/native mix in gateway method list | S2' owns graph law; S0/S3 may mirror transport |
| `s2'.constraint.list`, `register`, `test` | gateway method list | constraints must be real graph/schema checks |
| `s2'.retrieve`, `rerank`, `enrich` | gateway method list | retrieval uses S2 graph/vector/semantic substrate |
| `s2.graph.*` | S2 side methods | S2 substrate, not S2' law alone |

## Lifecycle, Data Shapes, Privacy

| Shape/event | Privacy | Lifecycle |
|---|---|---|
| graph node/edge envelope | public-current unless namespace protected | ingest -> validate -> index -> retrieve -> enrich |
| pointer-web summary | public-current with provenance | kernel/S0/S2 compute -> M0/M' display -> S5 evidence |
| retrieval result | varies by namespace | query -> candidate -> rerank -> enrichment -> evidence handle |
| graph-sync intent | local operational | S1 change -> S2 intent -> dry-run/mutation gate |

Namespace privacy is mandatory: `bimba` public/current, `gnosis` corpus-governed, `etymology` public/reviewed, `pratibimba` protected-reviewed handles only, Graphiti bodies protected-local.

## Integration Seams

Calls in from S0 `epi graph`, S1 graph-sync, S3 gateway route table, M0' Bimba graph, M5' review/evidence, Gnosis/RAG-Anything, and Epii/Nara graph consumers. Calls out to Neo4j, Redis semantic cache, Graphiti by handle only, S3 temporal context for session anchoring, and S5 for review/promotion. S2' may cite episodes but does not make episodic memory canonical graph truth without S5 review.

## Cross-Cutting Participation

S2' participates in Bimba coordinate identity, vault-source traceability, capability routing evidence, Graphiti handle separation, clock/profile pointer anchors, Day/NOW deposition references, and canonical seed traceability.

## Open Decisions And Resolution Status

| Decision | Status | Current resolution |
|---|---|---|
| `#` vs M coordinate namespace | resolved | legacy `#` resolves into M-family coordinate projections, not a second namespace |
| coordinate/bimbaCoordinate naming drift | open | S2' must expose provenance and validation until normalized |
| Graphiti vs graph topology | resolved | Graphiti is temporal episodic runtime; S2' graph truth changes only through reviewed promotion |
| plan back-reference edits | blocked by scope | This seed supersedes newer plan fragments; docs/plans were not edited |

## Source Coverage

| Source | mtime | Role |
|---|---:|---|
| `docs/specs/S/S2-S2i-GRAPH.md` | 2026-05-31 16:35:19 | newest formal graph spec |
| `docs/plans/2026-03-10-semantic-graph-lifecycle.md` | 2026-03-10 11:56:43 | historical lifecycle |
| `docs/plans/2026-05-17-bimba-map-ingestion-plan.md` | 2026-05-19 16:26:15 | Bimba ingestion decision |
| `docs/plans/2026-05-19-s0-pi-boundary-and-s1-s2-graph-task-ledger.md` | 2026-05-22 14:33:34 | graph task ledger pressure |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md` | 2026-05-31 20:36:57 | nominal m-dev S2 track |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md` | 2026-06-02 00:17:57 | newest cross-cutting integration status |

## Substrate And Sibling Seeds

Body paths: `Body/S/S2/graph-schema`, `Body/S/S2/graph-services`, `Body/S/S2/ontology`, `Body/S/S2/external/bimba-mcp`, `Body/S/S0/epi-cli/src/graph`, `Body/S/S3/gateway-contract`.

Sibling seeds: `S2-SPEC.md`, `S2-0-SPEC.md` through `S2-5-SPEC.md`, `S2-0'-SPEC.md` through `S2-5'-SPEC.md`, `S2-SHARD-INDEX.md`, `S2-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.md` mtime 2026-04-10 17:50:48 is now cited as load-bearing S2' ontology: QL graph, coordinate-aware retrieval, cache lineage, GraphRAG law, and Indra's Net semantics. `Idea/Bimba/World/Types/Coordinates/S/S2/S2.md` mtime 2026-04-10 17:50:14 is the paired raw graph/cache ground. Shared World `P/P'`, `CT`, and `L/L'` corpora are enumerated in [[S-SYSTEM-INDEX]].
