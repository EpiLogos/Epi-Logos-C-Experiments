---
coordinate: "World/Types"
c_4_artifact_role: "type-registry"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[World-Ontology]]"
  - "[[World Types Mirror]]"
  - "[[S1'-SPEC]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# World Types Registry

This registry records the current type-authority roots under [[World/Types]]. It is an index for agents and a future source for [[Hen]] graph-promotion evidence.

## Registry Rule

A folder is a type authority only when it has a same-name textual MOC and a same-name visual MOC canvas. Otherwise it is a container, scaffold, or incubation folder.

Folder ancestry should become validated type evidence for [[S2]], not arbitrary labels.

## Root Registry

| Root | Class | MOC Status | Graph Intent | Notes |
| --- | --- | --- | --- | --- |
| `Coordinates` | coordinate mirror | container | `q_4_type_family = Coordinates` | Full coordinate spine; [[S]] branch is most materialised. |
| `Psychoids` | coordinate/archetype mirror | container | `q_4_type_family = Psychoids` | Root psychoid sequence under `#/#0`-`#5`. |
| [[Artifacts]] | semantic type | live MOC | `q_4_type_family = Artifacts` | Flat form/artifact families. |
| [[Templates]] | semantic type | live MOC | `q_4_type_family = Templates` | [[CT]] and Hen template resolution. |
| [[Agents]] | semantic type | live MOC | `q_4_type_family = Agents` | Constitutional agents and ta-onta carriers. |
| [[Capabilities]] | semantic type | live MOC | `q_4_type_family = Capabilities` | Tools, skills, plugins, permissions. |
| [[Interfaces]] | semantic type | live MOC | `q_4_type_family = Interfaces` | CLI/RPC/gateway/UI/API surfaces. |
| [[Runtime-Surfaces]] | semantic type | live MOC | `q_4_type_family = Runtime-Surfaces` | Processes, stores, bridges, sessions. |
| [[Diagrams]] | semantic type | live MOC | `q_4_type_family = Diagrams` | Seed diagram packs and MOC/canvas governance. |
| [[Datasets]] | semantic type | live MOC | `q_4_type_family = Datasets` | Graph, corpus, cache, and source datasets. |

## Coordinate Mirror Status

| Branch | Current Status | Next Action |
| --- | --- | --- |
| `Coordinates/S` | live same-name MOC/index pairs for [[S0]]-[[S5]] and [[S0']]-[[S5']] | Upgrade individual canvases from self-cards to full MOCs. |
| `Coordinates/C` | scaffold plus paired reflective CT/CF law | Add same-name family MOCs after C mirror audit. |
| `Coordinates/P` | scaffold | Add family MOC after P flat forms are cross-linked. |
| `Coordinates/L` | scaffold | Add family MOC after L flat forms are cross-linked. |
| `Coordinates/T` | scaffold | Add family MOC after artifact/T-family audit. |
| `Coordinates/M` | scaffold | Add family MOC after M/M' Seed and World-form audit. |

## Deferred Roots

| Root | Reason Deferred |
| --- | --- |
| `Workflows` | Workflow truth still belongs primarily in [[Seeds]] plans/specs until Hen crystallisation workflow is implemented. |
| `Properties` | Should wait for [[S2]] property registry alignment. |
| `Relations` | Should wait for relation inference and graph-schema relationship registry closure. |

## Verification Queries

Use these as lightweight checks until Hen exposes a proper tool:

- Every semantic root has `{Root}.md` and `{Root}.canvas`.
- No `World/Forms` path is introduced.
- Every semantic MOC links [[World-Ontology]], at least one owning [[S]] spec, and a graph-label intent section.
- Every canvas is valid JSON.
