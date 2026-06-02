---
coordinate: "World/Types/Capabilities"
c_4_artifact_role: "type-moc-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[World-Ontology]]"
  - "[[S4-SPEC]]"
  - "[[S4'-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# Capabilities Type MOC

## Scope

[[Capabilities]] indexes tools, skills, plugins, hooks, permission gates, capability-matrix entries, and gateway-exposed powers.

## What Belongs Here

- [[Pleroma]] skill/plugin surfaces and [[Capability Matrix]] entries.
- [[Anima]] dispatch capabilities, permissions, and tool-routing constraints.
- Gateway methods and capability boundaries that are documented by Seed specs.

## What Does Not Belong Here

- Product feature wishes with no coordinate owner.
- Raw implementation paths without Seed evidence.

## Coordinate Crosswalk

| Capability Class | Coordinate Pressure | Owning Specs |
| --- | --- | --- |
| Runtime tools | [[S0]] / [[S0']] | [[S0-SPEC]], [[S0'-SPEC]] |
| Gateway methods | [[S3]] / [[S3']] | [[S3-SPEC]], [[S3'-SPEC]] |
| Skills/plugins | [[S4.2']], [[Pleroma]] | [[S4-2'-SPEC]], [[S4'-SPEC]] |
| Review/promote powers | [[S5]] / [[S5']] | [[S5-SPEC]], [[S5'-SPEC]] |

## Flat World Forms

Capability definitions should crystallise flat in [[World]] only when the Seed spec and runtime implementation agree.

## Seed Evidence

Use [[S-SYSTEM-INDEX]], [[S4-SPEC]], [[S4'-SPEC]], and [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]].

## MOC/Canvas Rule

This file is the textual MOC. [[Capabilities.canvas]] is the visual MOC. Capability subfolders must declare their owning coordinate and permission boundary.

## Graph Label Intent

Capabilities should become validated graph properties/relationships tied to agents, plugins, and interfaces. They must not become arbitrary labels just because a folder exists.

## Open Gaps

- Public capability registration is still split across Seed specs, plugin contracts, and runtime code.
- Permission evidence needs a later Hen/S2 graph-promotion tranche.
