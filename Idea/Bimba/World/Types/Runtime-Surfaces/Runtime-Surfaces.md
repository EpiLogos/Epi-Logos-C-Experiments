---
coordinate: "World/Types/Runtime-Surfaces"
c_4_artifact_role: "type-moc-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[World-Ontology]]"
  - "[[S0-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
---

# Runtime Surfaces Type MOC

## Scope

[[Runtime-Surfaces]] indexes live execution and state surfaces: processes, services, stores, bridges, managed agent homes, and session surfaces.

## What Belongs Here

- `epi-cli`, gateway, Redis, Neo4j, [[Graphiti]], PI agent runtime, [[Theia]], [[Nara]], managed agent directories, and [[NOW]] runtime state.
- Runtime surfaces with Seed specs and current [[Body]] evidence.

## What Does Not Belong Here

- Static definitions without runtime behavior.
- Unverified service claims not grounded in tests or active code.

## Coordinate Crosswalk

| Runtime Surface | Coordinate Pressure | Owning Specs |
| --- | --- | --- |
| Commands/processes | [[S0]] | [[S0-SPEC]] |
| Graph/cache stores | [[S2]] | [[S2-SPEC]] |
| Gateway/time/session | [[S3]] | [[S3-SPEC]] |
| Agent runtime | [[S4]] | [[S4-SPEC]] |
| Review/kbase/world-return | [[S5]] | [[S5-SPEC]] |

## Flat World Forms

Runtime definitions crystallise into [[World]] only after the active implementation and tests are cited by Seed specs.

## Seed Evidence

Use [[S-SYSTEM-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]], and the owning coordinate specs.

## MOC/Canvas Rule

This file is the textual MOC. [[Runtime-Surfaces.canvas]] is the visual MOC. Nested runtime folders must identify live code/test evidence.

## Graph Label Intent

Runtime folder ancestry should become validated runtime-surface evidence and relationships, not arbitrary labels.

## Open Gaps

- Some live surfaces remain partly compatibility-hosted across S0/S3/S4.
- Runtime ownership must be verified before graph promotion.
