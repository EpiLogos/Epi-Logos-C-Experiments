---
coordinate: "S5.3'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5'-SPEC]]"
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-3']]"
---

# S5.3' Shard: Episodic Pattern Governance

## Canonical Role

[[S5.3']] is the [[P3']] / [[CT3]] pattern-governance layer of [[S5']]. It decides when [[Graphiti]] should record, search, open/close arcs, surface prior episodes, or feed memory-weave evidence into review. It governs use and meaning; [[S3']] owns runtime.

## Source And Diagram Anchors

Read [[S5'-SPEC]], [[S5-SPEC]], [[S5'-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S5']], `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.canvas`, legacy [[S5-3']], [[2026-04-04-graphiti-unified-temporal-context-service]], and [[S5-S5i-SYNC]].

## Current Body Reality

Prime-side episodic governance appears indirectly in `Body/S/S5/epii-agent-core/src/lib.rs` orientation/status DTOs, `Body/S/S5/epii-autoresearch-core/src/lib.rs` kernel trajectory refs and evidence source refs, and `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`. The S5 spec states that `s5'.epii.status` observes Graphiti runtime status read-only through S0 gateway code; direct S3' runtime ownership remains elsewhere.

## Build Contract

An episodic governance request must include arc/time filters, disclosure class, coordinate, source agent, and whether the result is evidence-only or review-promotable. Prior-episode surfacing must not leak protected personal material; it should expose handles/counts/summaries unless review opens deeper context.

## Test Obligations

Add tests for arc/time filters, protected-material redaction, and evidence-handle versus promoted-artifact behavior. Existing wrapper tests are necessary but insufficient; S3' adapter tests should run when runtime integration changes.

## Open Gaps

Graphiti canonicality is resolved at architecture level, but live S5' policy fixtures are thin. Memory-weave/Moirai language is target grammar rather than complete Body-native implementation.

## Boundaries

[[S3']] owns [[Graphiti]] runtime; [[S5.3]] owns base invocation surfaces; [[S5.4']] evaluates whether episodic evidence changes the improvement/review state; [[S1']] owns any vault write that follows.
