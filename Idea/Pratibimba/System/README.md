---
coordinate: "M'"
c_4_artifact_role: "system-architecture-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[World-Ontology]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# Pratibimba System

`Idea/Pratibimba/System` is the UX-facing architecture and subsystem documentation surface for [[M']]. Runtime code for the Theia application lives under `Body/M/epi-theia`; this folder should stay light, link-rich, and architectural.

## Residency Rule

| Surface | Role |
| --- | --- |
| `Idea/Pratibimba/System` | UX/system architecture notes, subsystem maps, diagrams, and operator-facing design context |
| `Idea/Pratibimba/System/Subsystems` | One documentation home per M' subsystem from [[M0']] through [[M5']] |
| `Body/M/epi-theia` | Theia application, extensions, package manifests, tests, generated/runtime artifacts |
| `Idea/Bimba/Seeds/M/**` | Canonical M' specs, plans, traceability, and architecture diagram packs |
| `Idea/Bimba/World/Types/**` | Hen-governed MOCs and type/canvas topology |

Do not reintroduce app source, `node_modules`, build output, or generated files here.

## Subsystems

| Folder | Coordinate | System Face | Runtime Code |
| --- | --- | --- | --- |
| [[Anuttara]] | [[M0']] | ground language, verifier, symbolic coordinate diagnostics | `Body/M/epi-theia/extensions/m0-anuttara` |
| [[Paramasiva]] | [[M1']] | mathematical generativity, relation-walk, clock/instrument ground | `Body/M/epi-theia/extensions/m1-paramasiva` |
| [[Parashakti]] | [[M2']] | resonance, correspondence, cymatic/meaning packet surfaces | `Body/M/epi-theia/extensions/m2-parashakti` |
| [[Mahamaya]] | [[M3']] | codon wheel, clock, transcriptional/visual expression | `Body/M/epi-theia/extensions/m3-mahamaya` |
| [[Nara]] | [[M4']] | personal traversal, day container, journal, protected context | `Body/M/epi-theia/extensions/m4-nara` |
| [[Epii]] | [[M5']] | review, autoresearch, agentic IDE, return governance | `Body/M/epi-theia/extensions/m5-epii` |

## Architecture Diagram Flow

Architecture diagrams are Seed evidence first. Use [[ARCHITECTURE-DIAGRAM-PACK]] for cross-system maps and the owning `Idea/Bimba/Seeds/M/Mx'/**` specs for subsystem-level architecture. This System folder should link to those diagrams and add UX-facing interpretation, not fork canonical diagram truth.

When a subsystem diagram stabilises:

1. Update the owning M' Seed spec/diagram pack.
2. Reflect UX-facing implications here.
3. Update any matching [[World/Types]] MOC/canvas through [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]].
4. Keep implementation changes in `Body/M/epi-theia`.

## Local Documentation Shape

Each subsystem folder should keep:

- `README.md` as the subsystem index.
- `ARCHITECTURE.md` only when there is enough subsystem-specific architecture to avoid bloating the README.
- `UX.md` only when the user-facing interaction model needs separate treatment.
- `DIAGRAMS.md` only when the subsystem has multiple diagram anchors to track.

Prefer links to canonical Seeds over copied spec text.
