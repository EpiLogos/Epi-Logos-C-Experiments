---
coordinate: "S5.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-3]]"
---

# S5.3 Shard: Integration Pattern And Episodic Usage

## Canonical Role

[[S5.3]] is the [[P3]] / [[CT3]] pattern layer of [[S5]]. It governs how world-return becomes navigable pattern: [[Graphiti]] record/search/arc usage, timeline/report surfaces, ingress-egress loops, and episodic evidence handles. It does not own the [[S3']] runtime; it owns the S5 meaning of invoking that runtime.

## Source And Diagram Anchors

Read [[S5-SPEC]], [[S5-SHARD-INDEX]], [[S5-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S5]], `Idea/Bimba/World/Types/Coordinates/S/S5/S5.canvas`, legacy [[S5-3]], [[2026-04-04-graphiti-unified-temporal-context-service]], and [[S5-S5i-SYNC]].

## Current Body Reality

S5 evidence appears in `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`, `graphiti_config.py`, `wrapper.py`, and wrapper/cross-namespace tests. The umbrella spec also cites S0/S4 mirrors: `Body/S/S0/epi-cli/src/gate/epii.rs` observes Graphiti status, while `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` registers Aletheia tools for episodic operations. Canonical runtime remains [[S3']] / `Body/S/S3/graphiti-runtime` when present.

## Build Contract

Every S5 episodic operation must identify source content, agent/user context, coordinate, arc/episode handle, disclosure class, and review/promotability. `s5.episodic.*` methods must call S3' runtime adapters rather than recreating storage here. Search and arc summaries are evidence until [[S5']] review promotes them.

## Test Obligations

Run `Body/S/S5/epi-gnostic/tests/test_wrapper.py` and cross-namespace tests for invocation behavior, plus S3' Graphiti runtime tests when the adapter boundary changes. Add tests that distinguish a Graphiti evidence handle from a canon-promoted artifact.

## Open Gaps

Some paths still use a temporary HTTP wrapper, while target architecture is S3' library/runtime integration with S5 governance. Arc taxonomy, disclosure policy, and review routing need stronger fixtures.

## Boundaries

[[S3']] owns Redis, session, [[SpaceTimeDB]], [[Kairos]], and [[Graphiti]] runtime. [[S5.3']] owns episodic pattern governance on the prime side. [[S5.4]] owns policy/review context after an episode becomes decision-bearing.
