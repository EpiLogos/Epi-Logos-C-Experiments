---
coordinate: "World/Types/Interfaces"
c_4_artifact_role: "type-moc-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[World-Ontology]]"
  - "[[S0-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
---

# Interfaces Type MOC

## Scope

[[Interfaces]] indexes callable surfaces: CLI commands, RPC methods, gateway methods, UI bridges, envelopes, request/response contracts, and product-facing seams.

## What Belongs Here

- `epi` CLI and gateway method families.
- [[KernelBridge]], [[Theia]], and [[M']] consumer seams.
- Envelope/API contracts that are owned by Seed specs.

## What Does Not Belong Here

- Internal implementation details with no public or cross-system boundary.
- Renderer-local registries that bypass [[S1]] / [[S2]] provenance.

## Coordinate Crosswalk

| Interface Class | Coordinate Pressure | Owning Specs |
| --- | --- | --- |
| CLI/runtime commands | [[S0]] / [[S0']] | [[S0-SPEC]], [[S0'-SPEC]] |
| Gateway/session bridge | [[S3]] / [[S3']] | [[S3-SPEC]], [[S3'-SPEC]] |
| Agent RPC/control | [[S4]] / [[S4']] | [[S4-SPEC]], [[S4'-SPEC]] |
| Review/world-return APIs | [[S5]] / [[S5']] | [[S5-SPEC]], [[S5'-SPEC]] |

## Flat World Forms

Stable interface definitions may crystallise flat into [[World]] after Seed specs, tests, and current runtime surfaces converge.

## Seed Evidence

Read [[S-SYSTEM-INDEX]], [[M'-SYSTEM-SPEC]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] before changing an interface type.

## MOC/Canvas Rule

This file is the textual MOC. [[Interfaces.canvas]] is the visual MOC. Interface subfolders must name owning coordinate, consumer, and test obligation.

## Graph Label Intent

Interface ancestry should produce validated interface-type evidence for [[S2]] graph promotion. Method names alone are not ontology.

## Open Gaps

- API names, gateway parity, and Theia/M′ consumption are still distributed across several specs.
- More contract tests are needed before these interface types become graph-authoritative.
