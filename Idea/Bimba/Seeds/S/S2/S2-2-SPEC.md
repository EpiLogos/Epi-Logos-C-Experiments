---
coordinate: "S2.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2-SPEC]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S2-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S2]]"
---

# S2.2 Shard: Ingestion And Reconcile

## Canonical Role

[[S2.2]] is the [[P2]] / [[CT2]] / [[L2]] operation shard of [[S2]]: it moves vault/dataset/code evidence into the graph substrate, reconciles changed source state, tracks provenance, and prevents stale graph state from masquerading as living canon. It owns substrate ingestion mechanics; [[S2.2']] owns semantic lifecycle law over those mechanics.

## Source And Diagram Anchors

Primary anchors: [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2-TRACEABILITY-INDEX]], [[S2]], [[S1]], [[S1']], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC references: `Idea/Bimba/World/Types/Coordinates/S/S2/S2.md` and `S2.canvas`. Migrated source anchors: [[S2-2]], [[2026-03-07-s1-s2-implementation-plan]], [[2026-03-10-semantic-graph-lifecycle]], [[2026-05-19-s0-pi-boundary-and-s1-s2-graph-task-ledger]], and [[2026-05-17-bimba-map-ingestion-plan]].

## Current Body Reality

`Body/S/S2/graph-services/src/dataset_import.rs` imports the actual Bimba corpus from `docs/datasets/low-detail/`, handles BOM/control-character cleanup, maps legacy `bimbaCoordinate` / `#` to M-family coordinates, records branch provenance, skips missing endpoints, and reports imported/skipped nodes and relations. `Body/S/S2/graph-services/src/sync_coordinator.rs` defines `S2GraphPromotionIntent`, `PromotionPlan`, frontmatter evidence, link evidence, property proposals, Graphiti episode plans, and promotion policy. [[S0]] mirrors graph sync through `Body/S/S0/epi-cli/src/graph/sync*` and tests such as `graph_sync.rs`.

## Build Contract

[[S2.2]] must ingest only through explicit promotion/import plans: identity property, vault path, content hash, markdown body hash, source family, relation candidates, and skipped-count reporting must be visible. Changed source material must generate changed graph intent; unchanged material must not create silent duplicate nodes. Destructive migrations require an explicit policy gate and must never be hidden in a convenience command.

## Test Obligations

Use `Body/S/S2/graph-services/tests/dataset_import_live_contract.rs`, `graph_promotion_contract.rs`, `promotion_policy_contract.rs`, `frontmatter_property_rules_contract.rs`, `hen_promotion_lifecycle.rs`, and `Body/S/S0/epi-cli/tests/graph_sync.rs`. Tests must exercise real parsing/import/promotion logic, not mocked success envelopes.

## Open Gaps

The [[S1]] -> [[S2]] queue drain is still not fully canonical: direct `epi graph sync <path>` exists, while `s1.sync.flush` remains a known architecture gap. The dataset importer is concrete but still bridges old corpus layout into new [[Bimba]]/[[M]] coordinate law.

## Boundaries

[[S1]] and [[S1']] produce vault-resident artifacts and Hen-governed promotion intent. [[S2.1]] validates schema. [[S2.2']] decides semantic freshness over extracted documents. [[S5]] owns world-return corpus meaning; [[S2.2]] owns graph ingestion mechanics and provenance only.
