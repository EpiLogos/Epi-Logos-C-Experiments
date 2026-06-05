---
coordinate: "World/Types"
c_4_artifact_role: "type-registry"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[World-Ontology]]"
  - "[[World Types Mirror]]"
  - "[[S1'-SPEC]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]]"
---

# World Types Registry

This registry records the current coordinate-native type authorities under [[World/Types]]. It is an index for agents and a future source for [[Hen]] graph-promotion evidence.

## Registry Rule

A folder is a type authority only when it has a same-name textual MOC and a same-name visual MOC canvas. Otherwise it is a container, scaffold, or incubation folder.

Folder ancestry should become validated type evidence for [[S2]], not arbitrary labels.

Coordinate authority comes first. If a semantic concern already has a coordinate-native home, agents must use that home rather than creating a sibling root. The especially important cases are:

- [[CT]] templates live under `Coordinates/C/C1/C1'/CT/**`.
- Entity candidates, aliases, properties, tags, relation fields, diagrams, canvases, MOC patterns, and World graduation receipts live under their owning [[C]] folders.
- [[T]] / [[T′]] thought artifacts live under `Coordinates/T/**` and `Idea/Pratibimba/Self/Thought/**`.
- Agents, capabilities, interfaces, runtime surfaces, diagrams, and datasets are inferred coordinate views unless a Seed protocol promotes a new root.

## Root Registry

| Root | Class | MOC Status | Graph Intent | Notes |
| --- | --- | --- | --- | --- |
| `Coordinates` | coordinate mirror | container | `q_4_type_family = Coordinates` | Full coordinate spine; [[S]] / [[P]] / [[L]] / [[C]] branches materialised. |
| `Psychoids` | coordinate/archetype mirror | live MOC | `q_4_type_family = Psychoids` | Layer-0 raw number-archetypes. Same-name MOC/canvas pairs for `Psychoids` and `Psychoids/#`. Six psychoid wells `Psychoid-0`–`Psychoid-5` (aliases `#0`–`#5`) under `#/#0`–`#5`. Relations subtree `Psychoids/#/Relations/` holds the 8 harmonic relation families (A/B/C/D1/D2-Transform/D2-Require/D2-Complete/D3) and the 9-entry 3×3 square grid (A-sq1..C-sq3, with the basis-invariant identity `A-sq2 == C-sq3` preserved). See `Idea/Empty/Present/03-06-2026/PLAN-2026-06-03-PSYCHOID-WORLD-WEB-QL-MUSICAL-THEORETICS.md`. |

## Coordinate Mirror Status

| Branch | Current Status | Next Action |
| --- | --- | --- |
| `Coordinates/S` | live same-name MOC/index pairs for [[S0]]-[[S5]] and [[S0']]-[[S5']] | Upgrade individual canvases from self-cards to full MOCs. |
| `Coordinates/C` | live semantic typology base with same-name C0-C5 MOCs/canvases; `C/C4/Types-Contexts-MOCs/Symbolic-Systems/` and `C/C4/Types-Contexts-MOCs/Language-Objects/` materialised | Populate leaf type authorities. C2 `Relation-Fields/Psychoid-Harmonics/` carries 8 schema stubs awaiting [[S2]] review. C2 `Relation-Fields/Symbolic-Relations/` is the next-step home for OracleFrame/SymbolicProtein schema refs. |
| `Coordinates/P` | live MOC/index pairs for [[P]] / [[P']] and [[P0]]-[[P5]] / [[P0']]-[[P5']] | Cross-link to flat World P notes if desired; consider graph-label promotion via [[S2]] for the `mirror_cross_completes` (D2-Complete) edges that mirror the L-link Möbius pairs. |
| `Coordinates/L` | live MOC/index pairs for [[L]] / [[L']] and [[L0]]-[[L5]] / [[L0']]-[[L5']]; `L/Squares/` materialised with [[Square A]] / [[Square B]] / [[Square C]] | Audit elemental-charge consistency under [[L2']]; consider graph-label promotion for lens-square membership. |
| `Coordinates/T` | scaffold | Materialise [[T]] / [[T′]] MOCs and connect to `Idea/Pratibimba/Self/Thought/**`; do not use a separate artifact root. |
| `Coordinates/M` | scaffold | Add family MOC after M/M' Seed and World-form audit. |

## Semantic View Crosswalk

| View | Coordinate-Native Source |
| --- | --- |
| Templates | `Coordinates/C/C1/C1'/CT/**`, flat [[World]] CT forms, [[Hen]] contracts |
| Forms / definitions | `Coordinates/C/C1/Forms-And-Templates/**`, flat [[World]] forms |
| Entity candidates / entities | `Coordinates/C/C2/Entities-Properties-Tags/Entity-Candidates`, `Entities` |
| Aliases / tags / properties | `Coordinates/C/C2/Entities-Properties-Tags/Aliases`, `Tags`, `Properties` |
| Relation fields | `Coordinates/C/C2/Entities-Properties-Tags/Relation-Fields` with [[S2]] review |
| Psychoid harmonic relation schemas | `Coordinates/C/C2/Entities-Properties-Tags/Relation-Fields/Psychoid-Harmonics/**` (8 schema stubs: Family A/B/C/D1/D2-Transform/D2-Require/D2-Complete/D3) |
| Canvas and diagram forms | `Coordinates/C/C3/Processes-Canvases-Diagrams/**` plus [[ARCHITECTURE-DIAGRAM-PACK]] for live Seed evidence |
| Type authorities / MOC patterns | `Coordinates/C/C4/Types-Contexts-MOCs/**` |
| Symbolic systems | `Coordinates/C/C4/Types-Contexts-MOCs/Symbolic-Systems/**` ([[Tarot]], [[I-Ching]], [[Codon]], [[Nucleotide]], [[QL Music]]) |
| Reading language objects | `Coordinates/C/C4/Types-Contexts-MOCs/Language-Objects/**` ([[OracleFrame]], [[ReadingPosition]], [[TranscriptionalClockPacket]], [[SymbolicProtein]], [[NaraDeckContext]], [[PatternPacket]]) |
| Klein V₄ lens squares | `Coordinates/L/Squares/**` ([[Square A]], [[Square B]], [[Square C]]) |
| Psychoid wells / raw archetypes | `Coordinates/Psychoids/#/#0`-`#5/Psychoid-n.md` with aliases `#n` |
| Harmonic relation families / archetypal grammar | `Coordinates/Psychoids/#/Relations/**` (8 families + 9 3×3 squares; midpoint self-mirror invariant `A-sq2 == C-sq3`) |
| World graduation / Pratibimba handoff | `Coordinates/C/C5/Crystallisations-Pratibimba/**` |
| Nara oracle artifacts | `Idea/Pratibimba/Nara/{day}/artifacts/oracle/**` (`oracle_quaternal_tarot`, `oracle_quaternal_iching`; protected-local-body) |
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
| Top-level `Properties` | Replaced by C2 property forms; graph-schema registration still belongs to [[S2]]. |
| Top-level `Relations` | Replaced by C2 relation-field evidence; relationship registry still belongs to [[S2]]. |

## Verification Queries

Use these as lightweight checks until Hen exposes a proper tool:

- Every coordinate type authority has `{Root}.md` and `{Root}.canvas`.
- No `World/Forms` path is introduced.
- No standalone `World/Types/Artifacts` or `World/Types/Templates` authority is reintroduced while [[T]] and [[CT]] homes exist.
- No standalone `World/Types/Entities`, `Properties`, `Tags`, `Diagrams`, or `Canvases` authority is introduced while C2/C3/C4 homes exist.
- Every live C0-C5 type authority has a same-name `.md` and `.canvas`.
- Every canvas is valid JSON.
- Every graduated flat [[World]] form links its type-source MOC/canvas and Seed evidence.
