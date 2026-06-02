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

This registry records the current coordinate-native type authorities under [[World/Types]]. It is an index for agents and a future source for [[Hen]] graph-promotion evidence.

## Registry Rule

A folder is a type authority only when it has a same-name textual MOC and a same-name visual MOC canvas. Otherwise it is a container, scaffold, or incubation folder.

Folder ancestry should become validated type evidence for [[S2]], not arbitrary labels.

Coordinate authority comes first. If a semantic concern already has a coordinate-native home, agents must use that home rather than creating a sibling root. The especially important cases are:

- [[CT]] templates live under `Coordinates/C/C1/C1'/CT/**`.
- [[T]] / [[T′]] thought artifacts live under `Coordinates/T/**` and `Idea/Pratibimba/Self/Thought/**`.
- Agents, capabilities, interfaces, runtime surfaces, diagrams, and datasets are inferred coordinate views unless a Seed protocol promotes a new root.

## Root Registry

| Root | Class | MOC Status | Graph Intent | Notes |
| --- | --- | --- | --- | --- |
| `Coordinates` | coordinate mirror | container | `q_4_type_family = Coordinates` | Full coordinate spine; [[S]] branch is most materialised. |
| `Psychoids` | coordinate/archetype mirror | container | `q_4_type_family = Psychoids` | Root psychoid sequence under `#/#0`-`#5`. |

## Coordinate Mirror Status

| Branch | Current Status | Next Action |
| --- | --- | --- |
| `Coordinates/S` | live same-name MOC/index pairs for [[S0]]-[[S5]] and [[S0']]-[[S5']] | Upgrade individual canvases from self-cards to full MOCs. |
| `Coordinates/C` | scaffold plus paired reflective CT/CF law | Materialise [[CT]] MOCs under `C/C1/C1'/CT/**` before any template registry is added elsewhere. |
| `Coordinates/P` | scaffold | Add family MOC after P flat forms are cross-linked. |
| `Coordinates/L` | scaffold | Add family MOC after L flat forms are cross-linked. |
| `Coordinates/T` | scaffold | Materialise [[T]] / [[T′]] MOCs and connect to `Idea/Pratibimba/Self/Thought/**`; do not use a separate artifact root. |
| `Coordinates/M` | scaffold | Add family MOC after M/M' Seed and World-form audit. |

## Semantic View Crosswalk

| View | Coordinate-Native Source |
| --- | --- |
| Templates | `Coordinates/C/C1/C1'/CT/**`, flat [[World]] CT forms, [[Hen]] contracts |
| Artifacts | `Coordinates/T/**`, `Idea/Pratibimba/Self/Thought/**`, CT-specific output paths |
| Agents | `Coordinates/S/S4/**`, `Coordinates/S/S'/S4'/**`, [[M5]] / [[M5']] |
| Capabilities | [[S4]] / [[S4']] capability law, plugin/skill specs, permission gates |
| Interfaces | [[S0]], [[S3]], [[S4]], [[S5]], and [[M']] gateway/UX specs |
| Runtime surfaces | [[S3]] sessions/stores, [[S4]] agent homes, [[S0]] CLI runtime |
| Diagrams | [[ARCHITECTURE-DIAGRAM-PACK]] plus coordinate `.canvas` MOCs |
| Datasets | [[S2]] graph/cache/corpus specs and [[S5]] review/corpus evidence |

## Deferred Roots

| Root | Reason Deferred |
| --- | --- |
| `Workflows` | Workflow truth still belongs primarily in [[Seeds]] plans/specs until Hen crystallisation workflow is implemented. |
| `Properties` | Should wait for [[S2]] property registry alignment. |
| `Relations` | Should wait for relation inference and graph-schema relationship registry closure. |

## Verification Queries

Use these as lightweight checks until Hen exposes a proper tool:

- Every coordinate type authority has `{Root}.md` and `{Root}.canvas`.
- No `World/Forms` path is introduced.
- No standalone `World/Types/Artifacts` or `World/Types/Templates` authority is reintroduced while [[T]] and [[CT]] homes exist.
- Every graduated flat [[World]] form links its type-source MOC/canvas and Seed evidence.
- Every canvas is valid JSON.
