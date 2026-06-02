---
coordinate: "S5.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5'-SPEC]]"
  - "[[S5-SPEC]]"
  - "[[S5-2-SPEC]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-2']]"
---

# S5.2' Shard: Retrieval Governance And Bounded Resource Context

## Canonical Role

[[S5.2']] is the [[P2']] / [[CT2]] governance layer for retrieval, [[Gnosis]], [[RAG-Anything]], kbase/Vimarsa, disclosure density, and bounded resource context. [[S5.2]] owns ingest/query substrate; S5.2' decides which sources enter which run, how far context widens, and what may be disclosed.

## Source And Diagram Anchors

Read [[S5'-SPEC]], [[S5-SPEC]], [[S5-2-SPEC]], [[S5'-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[S5']], `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.canvas`, legacy [[S5-2']], [[2026-02-21-epii-corpus-ingestion-design]], [[2026-02-21-epii-corpus-ingestion-plan]], and [[S5-S5i-SYNC]].

## Current Body Reality

The bounded context body is `Body/S/S5/epi-kbase-core/src/{kbase,project,script,types,vimarsa}.rs` and `Body/S/S5/epi-kbase/src/{project-scope,envelope-metadata,sem-search,skill-search}.ts`. It defines project scoping, metadata propagation, semantic search, and skill search. `Body/S/S5/epi-gnostic` supplies Gnosis/RAG substrate; S0 mirrors expose current operator commands.

## Build Contract

Run-scoped kbase must bind a project such as `epi-logos:{day_id}:{session_id}`, carry fallback, and propagate through orchestration envelope metadata. Retrieval responses must keep source set, retrieval mode, project scope, coordinate, and disclosure boundary. Scope widening from run to day to corpus must be explicit and auditable.

## Test Obligations

Rust kbase changes require `cargo test --manifest-path Body/S/S5/epi-kbase-core/Cargo.toml`. TypeScript kbase changes need tests over project binding, metadata propagation, and high-relevance gating. Gnosis retrieval governance should be tested against real indexed sources.

## Open Gaps

The source spec describes Psyche/Lachesis/Sophia resource choreography, but not all orchestration hooks are implemented in this lane. Dynamic scope widening and envelope propagation need fuller end-to-end tests.

## Boundaries

[[S5.2]] owns ingestion/retrieval substrate; [[S4']] / [[Psyche]] coordinates run context; [[S2]] owns graph/vector persistence; [[S5.4']] decides whether retrieved evidence is actionable.
