---
coordinate: "S5.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5-TRACEABILITY-INDEX]]"
  - "[[S5-2'-SPEC]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-2]]"
---

# S5.2 Shard: Exchange Operation, Gnosis, And Kbase

## Canonical Role

[[S5.2]] is the [[P2]] / [[CT2]] operation layer of [[S5]]. It owns world-return exchange: ingesting documents and text, querying [[Gnosis]], binding kbase/Vimarsa project context, and returning corpus evidence into [[Epii]] review or [[M']] use. It consumes [[S2]] graph/vector substrate but owns the service semantics of corpus return.

## Source And Diagram Anchors

Read [[S5-SPEC]], [[S5-SHARD-INDEX]], [[S5-TRACEABILITY-INDEX]], [[S5-2'-SPEC]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[S5]], `Idea/Bimba/World/Types/Coordinates/S/S5/S5.canvas`, legacy [[S5-2]], [[2026-02-21-epii-corpus-ingestion-design]], [[2026-02-21-epii-corpus-ingestion-plan]], and [[S5-S5i-SYNC]].

## Current Body Reality

The concrete implementation is `Body/S/S5/epi-gnostic/epi_gnostic/cli.py`, `wrapper.py`, `config.py`, `storage/neo4j_vector.py`, and `enrichment/coordinator.py`, with tests in `Body/S/S5/epi-gnostic/tests/`. `GnosticRAG` uses [[RAG-Anything]], [[LightRAG]], Gemini embeddings, and [[Neo4j]] vector storage. Kbase surfaces live in `Body/S/S5/epi-kbase-core/src/*.rs` and `Body/S/S5/epi-kbase/src/*.ts`, with S0 mirrors for operator commands.

## Build Contract

`s5.gnostic.*` and kbase operations must report source ids, namespace/workspace, coordinate/family when supplied, storage backend, and retrieval mode. Ingestion must exercise real parser/chunking/embedding/storage paths. Query results must link back to source artifacts so [[S5.4]] review and [[S5.5]] promotion can inspect evidence.

## Test Obligations

Run real Python tests in `Body/S/S5/epi-gnostic/tests`, especially config, wrapper, enrichment, cross-namespace, and Neo4j vector tests. Rust kbase changes should run `cargo test --manifest-path Body/S/S5/epi-kbase-core/Cargo.toml`; TypeScript kbase changes should add/run package tests rather than relying on shape-only exports.

## Open Gaps

Gnosis still has local JSON/Python/Neo4j pathways that need one production pipeline. Current operator surfaces include `epi techne gnosis`, `epi book`, `epi notebook`, `epi vimarsa`, and S0 kbase wrappers, not a unified `epi gnostic`.

## Boundaries

[[S2]] owns graph/vector persistence; [[S3']] owns temporal session context; [[S5.3]] owns episodic usage patterns; [[S5.2']] owns retrieval/disclosure governance; [[S1']] owns vault mutation.
