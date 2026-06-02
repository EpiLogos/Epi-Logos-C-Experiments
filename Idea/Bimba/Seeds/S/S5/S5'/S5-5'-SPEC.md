---
coordinate: "S5.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5'-SPEC]]"
  - "[[S5-SPEC]]"
  - "[[S5-SHARD-INDEX]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S5-5']]"
---

# S5.5' Shard: Return-To-Ground Law

## Canonical Role

[[S5.5']] is the [[P5']] / [[CT5]] return law of [[S5']]. It owns keep/discard, reviewed promotion, [[Seed]] generation, [[QL]] schema evolution, and the opening of next-cycle ground. It is [[Epii]] deciding what the system has learned and what is allowed to become canon.

## Source And Diagram Anchors

Read [[S5'-SPEC]], [[S5-SPEC]], [[S5'-TRACEABILITY-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[S5']], `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.canvas`, legacy [[S5-5']], [[S5'Cx]], and [[M5-epii-holographic-integration]].

## Current Body Reality

Return-to-ground is implemented as guarded dry-run promotion in `Body/S/S5/epii-autoresearch-core/src/lib.rs` and M5 workbench promotion DTOs in `Body/S/S5/epii-agent-core/src/lib.rs`. `Body/S/S5/plugins/epi-logos` is the promoted local resource body for skills/resources. [[Hen]] dry-run planning is invoked from autoresearch through S1' compiler core; S0 gateway mirrors expose `s5'.improve.promote`.

## Build Contract

Keep/discard decisions must be durable, sourced, review-linked, and destination-aware. [[Seed]] generation must include review/improvement provenance, source refs, privacy class, target coordinate, and rollback posture. [[QL]] schema evolution must version the schema and cannot bypass [[S5.4']] review or [[S1']] compiler law.

## Test Obligations

Run autoresearch promotion tests and add end-to-end checks that a seed/promotion plan includes review resolution, source artifacts, dry-run result, and version/rollback metadata. Future `s5'.seed.generate` and `s5'.ql.schema` methods need real compiler/vault tests.

## Open Gaps

Non-dry-run promotion is intentionally guarded. `s5'.seed.generate`, `s5'.ql.schema`, and public publication returns are designed but incomplete. The old Möbius API remains genealogy, not implemented authority.

## Boundaries

[[S5.5]] prepares base-side return; [[S5.4']] evaluates; [[S1']] mutates vault canon; [[S0]] verifies executability; [[World]] receives only crystallised definitions, not raw review drafts.
