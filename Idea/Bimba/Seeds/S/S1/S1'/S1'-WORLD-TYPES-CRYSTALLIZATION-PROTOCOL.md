---
coordinate: "S1'"
c_4_artifact_role: "crystallization-protocol"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1'-SPEC]]"
  - "[[S1-0'-SPEC]]"
  - "[[World-Ontology]]"
  - "[[World Types Mirror]]"
  - "[[TYPE-REGISTRY]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S1' World/Types Crystallization Protocol

## Purpose

This protocol makes [[Hen]] operationally literate in the existing [[World]] / [[World/Types]] / [[Seeds]] canon. It defines how architecture moves from live development evidence into durable world knowledge without collapsing diagrams, plans, MOCs, and graph promotion into one folder.

## Residency Classes

| Class | Path | Authority |
| --- | --- | --- |
| Seed evidence | `Idea/Bimba/Seeds/**` | Specs, plans, architecture packs, traceability, migrated legacy material |
| Flat crystallisation | `Idea/Bimba/World/{Name}.md` | Stable definitions, reusable forms, synthesis docs, architecture-as-documentation |
| Type incubation / MOC | `Idea/Bimba/World/Types/**` | Type indexes, coordinate mirrors, semantic MOCs, canvases, graph-type evidence |
| Temporal work | `Idea/Empty/Present/**` | Session/day/FLOW/NOW work before promotion |
| Runtime reflection | `Idea/Pratibimba/**` | System/self reflective runtime surfaces |

[[World/Forms]] remains obsolete.

## Operating Loop

Use this loop for architecture and development documentation:

1. Capture live evidence in [[FLOW]], [[NOW]], code review notes, tests, or implementation artifacts.
2. Update the owning [[Seeds]] spec, shard, traceability index, and diagram anchor.
3. Run or simulate `s1'.residency.resolve` to decide whether the artifact remains Seed evidence, becomes a flat [[World]] crystallisation, or updates a [[World/Types]] MOC.
4. If type-local structure is affected, update or create the same-name `{Type}.md` and `{Type}.canvas` pair under [[World/Types]].
5. If the definition stabilises, crystallise the durable definition into flat [[World]] and backlink the Seed evidence and type MOC.
6. Hen emits graph-promotion intent with path, wikilinks, frontmatter, source hashes, type ancestry, sibling canvas evidence, and requested label/property hints.
7. [[S2]] validates labels, properties, and relationships before Neo4j materialisation.
8. [[M']] consumers read through [[S1]] / [[S2]] provenance, not renderer-local registries.

## Required Hen Surfaces

These surfaces are required by the protocol. Some are target-state and must be tracked honestly until implemented:

| Surface | Role | Current Status |
| --- | --- | --- |
| `s1'.residency.resolve` | Classifies target residency before write | Specified; not yet visible as a discrete public gateway method |
| `s1'.type.index` | Plans or audits a type-index MOC | Target-state |
| `s1'.moc.ensure` | Ensures same-name `.md` / `.canvas` pair for a type authority | Target-state |
| `s1'.canvas.create_or_update` | Creates or updates Obsidian canvas MOCs with source backlinks | Target-state |
| `s1'.graph.intent.world_types` | Emits [[World/Types]] ancestry evidence for [[S2]] | Target-state over existing `GraphPromotionIntent` substrate |

## MOC Index Rule

Every type-authority folder under [[World/Types]] should contain:

- `{FolderName}.md` as textual MOC/type index.
- `{FolderName}.canvas` as visual MOC.
- Explicit scope, exclusions, coordinate crosswalk, Seed evidence, graph-label intent, and open gaps.

Container-only folders should be marked as containers in [[TYPE-REGISTRY]] or a local README. Silent container/type ambiguity is not allowed.

## Diagram Rule

Diagrams are architecture evidence, not decoration:

- Whole-system diagrams live in [[ARCHITECTURE-DIAGRAM-PACK]] while architecture is live.
- Specs must link diagram heading anchors explicitly.
- Stable MOC canvases live under [[World/Types]].
- A changed ownership/API/residency flow requires either a diagram update or an explicit `no diagram delta` note in the owning Seed spec.

## Folder-To-Graph Rule

Folder hierarchy is graph-significant, but not arbitrary label authority.

Hen should extract:

- `type_family`
- `type_path`
- `type_coordinate`
- `sibling_canvas_path`
- `crystallisation_state`
- source/backlink evidence

S2 decides what becomes registered Neo4j labels, properties, and relationships. Desired labels such as `WorldType`, `CoordinateType`, `SemanticType`, `MocIndex`, or `CanvasMoc` require explicit graph-schema registration before use.

## Agent Workflow

Agents working on architecture or documentation should:

1. Read [[World-Ontology]] and [[World Types Mirror]].
2. Read [[ARCHITECTURE-DIAGRAM-PACK]].
3. Read the owning Seed spec/shards.
4. Use `epi vault` discovery where configured; if the vault is not configured, run the local fallback search and record the CLI gap.
5. Update Seeds first when the architecture is still live.
6. Update [[World/Types]] MOCs when type topology changes.
7. Update flat [[World]] only when the definition is stable enough to crystallise.

## Open Gaps

- `epi vault` discovery needs a default-vault/doctor/timeout workflow before it can be treated as mandatory in all sessions.
- Hen does not yet produce complete [[World/Types]] ancestry evidence in `GraphPromotionIntent`.
- S2 does not yet register all desired type/MOC labels.
- Coordinate family MOCs outside [[S]] remain mostly scaffolded.
