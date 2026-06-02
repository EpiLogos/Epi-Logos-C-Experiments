---
coordinate: "S5.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5-TRACEABILITY-INDEX]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-4]]"
---

# S5.4 Shard: Contextual Governance And Review Visibility

## Canonical Role

[[S5.4]] is the [[P4]] / [[CT4]] governance layer of [[S5]]. It owns contextual policy for world-return: lineage, privacy, consent, review visibility, human-required gates, canon-recognition, and whether an external-facing or system-changing act is advisory, blocking, or promotion-ready.

## Source And Diagram Anchors

Read [[S5-SPEC]], [[S5-SHARD-INDEX]], [[S5-TRACEABILITY-INDEX]], [[S5'-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[S5]], `Idea/Bimba/World/Types/Coordinates/S/S5/S5.canvas`, legacy [[S5-4]], and [[S5-S5i-SYNC]].

## Current Body Reality

The durable governance body is `Body/S/S5/epii-review-core/src/lib.rs`: `ReviewCategory`, `GateKind`, `GovernanceLevel`, `GovernanceProfile`, `ReviewSubmission`, `ReviewInboxItem`, `ReviewResolveRequest`, and `KernelReviewVisibility`. `Body/S/S5/epii-autoresearch-core/src/lib.rs` adds review-gated promotion, source refs, advisory kernel evidence, and privacy boundaries. `Body/S/S5/epii-agent-core/src/lib.rs` exposes pending human validations and gate summaries.

## Build Contract

Governance-bearing returns must be durable records, not transient messages. Any claim that can affect publication, recursive self-modification, deployment, user-final validation, protected [[Nara]] material, or canon promotion must carry category, gate kind, governance level, required actor(s), source refs, and decision history. Kernel/musical/visual readiness can inform review but remains advisory unless a human/Epii gate resolves it.

## Test Obligations

Run `Body/S/S5/epii-review-core/tests/review_governance.rs`, `review_inbox.rs`, and autoresearch tests such as `m5_4_acceptance_release_gate.rs`. Add regression tests for `requires_human`, publication blocking, recursive self-modification, and failure to promote without an approved review resolution.

## Open Gaps

Origin semantics for Nara/Gnosis/Graphiti/compiler diagnostic deposits need richer fixtures. Human/Epii review is durable, but live provider-backed cross-agent invocation into Epii remains incomplete.

## Boundaries

[[S5.1']] receives synthesis into review form; [[S5.4']] evaluates improvement; [[S5.5]] / [[S5.5']] own promotion return; [[Consent]] and privacy rules must be visible to M' but not weakened by display concerns.
