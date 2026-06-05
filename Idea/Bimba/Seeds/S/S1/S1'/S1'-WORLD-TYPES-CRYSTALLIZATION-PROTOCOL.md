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
  - "[[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]]"
  - "[[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]]"
---

# S1' World/Types Crystallization Protocol

## Purpose

This protocol makes [[Hen]] operationally literate in the existing [[World]] / [[World/Types]] / [[Seeds]] canon. It defines how architecture moves from live development evidence into durable world knowledge without collapsing diagrams, plans, MOCs, and graph promotion into one folder.

## Residency Classes

| Class | Path | Authority |
| --- | --- | --- |
| Seed evidence | `Idea/Bimba/Seeds/**` | Specs, plans, architecture packs, traceability, migrated legacy material |
| Flat crystallisation | `Idea/Bimba/World/{Name}.md` | Stable definitions, reusable forms, synthesis docs, architecture-as-documentation |
| Type incubation / MOC | `Idea/Bimba/World/Types/**` | Coordinate mirrors, same-name MOCs, canvases, graph-type evidence |
| Entity candidate inbox | `Idea/Empty/**` | Dangling wikilink and root-created note capture before coordinate/type classification |
| Temporal work | `Idea/Empty/Present/**` | Session/day/FLOW/NOW work before promotion |
| Runtime reflection | `Idea/Pratibimba/**` | System/self reflective runtime surfaces |

[[World/Forms]] remains obsolete.

## Operating Loop

Use this loop for architecture and development documentation:

1. Capture live evidence in [[FLOW]], [[NOW]], code review notes, tests, or implementation artifacts.
2. Update the owning [[Seeds]] spec, shard, traceability index, and diagram anchor.
3. Run or simulate `s1'.residency.resolve` to decide whether the artifact remains Seed evidence, becomes a flat [[World]] crystallisation, or updates a coordinate-native [[World/Types]] MOC.
4. Classify the artifact through [[C]] before any semantic folder placement: [[C1]] for forms/templates, [[C2]] for entities/properties/tags, [[C3]] for canvases/diagrams/processes, [[C4]] for type/MOC/context authority, and [[C5]] for graduation/reflection.
5. If type-local structure is affected, update or create the same-name `{Type}.md` and `{Type}.canvas` pair under [[World/Types]].
6. If the definition stabilises, crystallise the durable definition into flat [[World]] and backlink the Seed evidence and type MOC.
7. Hen emits graph-promotion intent with path, wikilinks, frontmatter, source hashes, C-layer semantic authority, type ancestry, sibling canvas evidence, and requested label/property hints.
8. [[S2]] validates labels, properties, and relationships before Neo4j materialisation.
9. [[M']] consumers read through [[S1]] / [[S2]] provenance, not renderer-local registries.

## C-Layer Typology Rule

The primary semantic typology inside [[World/Types]] is `Coordinates/C/**`.

| C coordinate | Owns |
| --- | --- |
| [[C0]] | Source/ground roots, ontology roots, source namespaces. |
| [[C1]] | Forms, definitions, ideal markdown forms, and [[CT]] template law. |
| [[C2]] | Entity candidates, entities, aliases, properties, tags, relation-field evidence. |
| [[C3]] | MOC canvas forms, architecture diagram forms, workflow patterns, ideal canvas/diagram templates. |
| [[C4]] | Type authorities, context frames, folder MOC patterns, Dataview indexes, residency classes. |
| [[C5]] | World-form graduation, integration forms, graduation receipts, reflection/archive handoff. |

Semantic top-level roots are prohibited while C-native homes exist. A useful semantic grouping should be a C-layer type folder, a query view, or a flat [[World]] synthesis linked back to C.

## Entity Candidate Loop

Use this loop for loose Obsidian entities, dangling wikilinks, and root-created notes:

1. Detect `[[Missing Entity]]`, an unresolved Smart Env target, or a loose vault-root note created by Obsidian.
2. Create or move the note through Hen into `Idea/Empty/` or `Idea/Empty/Present/{DD-MM-YYYY}/entities/` with `c_4_artifact_role: "entity-candidate"` and temporal/source breadcrumbs.
3. Preserve aliases and human-facing names as frontmatter such as `c_1_aliases`, plus ordinary body wikilinks. Do not use tags as primary entity identity.
4. Run `s1'.semantic.suggest_links` and the target-state `s1'.semantic.neighbors_of` / `by_block` surfaces against `Idea/.smart-env/multi/*.ajson` to gather evidence. Smart Env remains read-only and cannot create nodes, edges, or canonical relations.
5. Classify the candidate through [[C2]] using coordinate frontmatter, wikilinks, source coordinates, aliases, and relation/property intelligence.
6. Promote review-approved candidates into coordinate-native `World/Types/Coordinates/C/C2/Entities-Properties-Tags/**` or the relevant cross-qualified coordinate home with a same-name `.md` / `.canvas` MOC pair when the candidate has become type-significant.
7. Graduate only stable definitions into flat `World/{Name}.md`; leave the type-local file as a `type_moc_pointer` backlinking the Empty candidate, Seed evidence, canvas path, aliases, related World forms, and graph-promotion intent.
8. Emit S2 graph-promotion evidence after Hen writes the accepted wikilinks and frontmatter. S2 materialises graph state from accepted vault state, not from Smart Env suggestions alone.

## Required Hen Surfaces

These surfaces are required by the protocol. Some are target-state and must be tracked honestly until implemented:

| Surface | Role | Current Status |
| --- | --- | --- |
| `s1'.residency.resolve` | Classifies target residency before write | Specified; not yet visible as a discrete public gateway method |
| `s1'.entity.capture` | Creates or moves dangling/root-created entity notes into Empty candidate residency | Target-state |
| `s1'.entity.classify` | Proposes coordinate, CT type, aliases, related links, and promotion state from vault evidence | Target-state |
| `s1'.entity.promote_to_type` | Moves reviewed candidates from Empty into coordinate-native World/Types incubation | Target-state |
| `s1'.type.classify_c_layer` | Determines the owning C-layer semantic authority before type placement | Target-state |
| `s1'.type.index` | Plans or audits a type-index MOC | Target-state |
| `s1'.moc.ensure` | Ensures same-name `.md` / `.canvas` pair for a type authority | Target-state |
| `s1'.canvas.create_or_update` | Creates or updates Obsidian canvas MOCs with source backlinks | Target-state |
| `s1'.world.graduate` | Promotes a stable coordinate crystallisation into flat [[World]] | Target-state |
| `s1'.world.link_infer` | Infers related [[World]] links from source coordinates, wikilinks, Seeds, and type ancestry | Target-state |
| `s1'.graph.intent.world_types` | Emits [[World/Types]] ancestry evidence for [[S2]] | Target-state over existing `GraphPromotionIntent` substrate |

## MOC Index Rule

Every type-authority folder under [[World/Types]] should contain:

- `{FolderName}.md` as textual MOC/type index.
- `{FolderName}.canvas` as visual MOC.
- Explicit scope, exclusions, coordinate crosswalk, Seed evidence, graph-label intent, and open gaps.

Container-only folders should be marked as containers in [[TYPE-REGISTRY]] or a local README. Silent container/type ambiguity is not allowed.

Do not use the MOC rule to create parallel roots for concerns already owned by coordinates. [[CT]] template law lives under `Coordinates/C/C1/C1'/CT/**`; entity/property/tag law lives under `Coordinates/C/C2/Entities-Properties-Tags/**`; canvas/diagram/process forms live under `Coordinates/C/C3/Processes-Canvases-Diagrams/**`; type/MOC authority lives under `Coordinates/C/C4/Types-Contexts-MOCs/**`; [[T]] / [[T′]] artifact law lives under `Coordinates/T/**` and `Idea/Pratibimba/Self/Thought/**`. Semantic views such as agents, capabilities, interfaces, runtime surfaces, diagrams, and datasets should be inferred from owning coordinates unless a Seed protocol explicitly promotes a new root.

## Crystallisation States

| State | Location | Meaning |
| --- | --- | --- |
| `seed_evidence` | `Idea/Bimba/Seeds/**` | Plans, specs, diagrams, source traces, and migrated legacy evidence. |
| `entity_candidate` | `Idea/Empty/**` or `Idea/Empty/Present/{day}/entities/**` | Loose or dangling concept captured before coordinate/type classification. |
| `incubating_type_index` | `Idea/Bimba/World/Types/Coordinates/**/{Name}/{Name}.md` plus `{Name}.canvas` | Coordinate-local MOC/canvas topology and graph-promotion evidence. |
| `crystallised_world_form` | `Idea/Bimba/World/{Name}.md` | Stable canonical architecture-as-documentation. |
| `type_moc_pointer` | Original `World/Types/**/{Name}.md` after graduation | Thin coordinate pointer, topology map, and evidence index, not a duplicate definition. |

A flat [[World]] crystallisation must include source coordinates, Seed evidence links, type-source path, canvas path, and related World wikilinks. Hen should use those fields plus wikilinks/frontmatter/source hashes to infer discoverable links across `/World`.

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
- `semantic_authority`
- `c_layer_path`
- `sibling_canvas_path`
- `crystallisation_state`
- `world_form_path`
- `type_source_path`
- `seed_evidence_paths`
- source/backlink evidence

S2 decides what becomes registered Neo4j labels, properties, and relationships. Desired labels such as `WorldType`, `CoordinateType`, `MocIndex`, or `CanvasMoc` require explicit graph-schema registration before use. `SemanticType` is a derived/query view unless [[S2]] explicitly registers it.

## Agent Workflow

Agents working on architecture or documentation should:

1. Read [[World-Ontology]] and [[World Types Mirror]].
2. Read [[ARCHITECTURE-DIAGRAM-PACK]].
3. Read the owning Seed spec/shards.
4. Use `epi vault` discovery where configured; if the vault is not configured, run the local fallback search and record the CLI gap.
5. Update Seeds first when the architecture is still live.
6. Update [[World/Types]] MOCs when type topology changes.
7. Update flat [[World]] only when the definition is stable enough to crystallise.
8. When graduating from [[World/Types]] to flat [[World]], keep the type-local file as a MOC/source pointer and add enough backlinks for inference across `/World`.
9. When encountering unresolved wikilinks or root-created notes, route them through the Entity Candidate Loop instead of leaving them loose or inventing a semantic folder root.

## Open Gaps

- `epi vault` discovery needs a default-vault/doctor/timeout workflow before it can be treated as mandatory in all sessions.
- Hen does not yet expose `s1'.entity.capture`, `s1'.entity.classify`, or `s1'.entity.promote_to_type` as public gateway methods.
- Hen does not yet expose `s1'.type.classify_c_layer` as a public gateway method.
- Hen does not yet produce complete [[World/Types]] ancestry evidence or flat-World graduation evidence in `GraphPromotionIntent`.
- S2 does not yet register all desired type/MOC labels.
- C-prime folder ancestry needs audit before [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths become graph-authoritative.
