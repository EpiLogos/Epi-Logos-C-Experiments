# World Types Mirror

`Idea/Bimba/World/Types` is the ordered ontology mirror, MOC/canvas residency surface, and pre-sync graph-type incubation layer for [[World]].

Flat `Idea/Bimba/World/*.md` remains the crystallised form library. [[Seeds]] remains the planning/spec/source layer. `World/Types` is the place where type context, canvases, coordinate mirrors, and semantic indexing make those forms navigable before [[Hen]] emits graph-promotion evidence and [[S2]] validates it into graph state.

## Residency Rule

| Surface | Authority | Examples |
| --- | --- | --- |
| [[World]] | Crystallised definitions, reusable forms, stable architecture-as-documentation | [[World-Ontology]], [[CT0]], [[NOW]], [[Seed]], [[Task-Spec]] |
| [[World/Types]] | Type-local MOCs, canvases, coordinate mirrors, semantic typology, incubation evidence | [[Types.canvas]], `Coordinates/S/S1/S1.canvas`, [[Artifacts]], [[Templates]], [[Diagrams]] |
| [[Seeds]] | Specs, plans, diagram packs, traceability, migrated legacy source evidence | [[ARCHITECTURE-DIAGRAM-PACK]], [[S-SYSTEM-INDEX]], [[S-SHARD-HARMONIZATION-PROTOCOL]] |

`World/Forms/` is obsolete and must not be revived.

## MOC Index Rule

Every type-authority folder that can classify or incubate forms should contain:

- `{FolderName}.md` as the textual MOC/type index.
- `{FolderName}.canvas` as the visual MOC.
- A clear `Scope`, `What Belongs Here`, `What Does Not Belong Here`, `Coordinate Crosswalk`, `Seed Evidence`, `Graph Label Intent`, and `Open Gaps`.

Container-only folders are allowed, but they should be explicit containers rather than silent half-MOCs. A container becomes a type authority only after it has the same-name `.md` and `.canvas` pair.

## Coordinate Mirror

The coordinate mirror follows the core coordinate sequence under `Coordinates/{C,P,L,S,T,M}`. The [[S]] / [[S']] branch is currently the most materialised branch, with same-name `.md` and `.canvas` pairs for [[S0]]-[[S5]] and [[S0']]-[[S5']].

The C-reflective ladder follows the paired-branch law in the current Hen contract:

- `Coordinates/C/C1/C1'/CT` for [[CT]] law.
- `Coordinates/C/C3/C3'/CF` for [[CF]] and context-frame law.

Older references to a top-level `Root/#` or `Coordinates/C/C'/CT` should be read as historical shorthand unless those folders are explicitly created and linked by a later coordinate-completion pass. Current root psychoid ordering lives under `Psychoids/#/#0` through `#5`.

Prime S-family MOCs are canonical under `Coordinates/S/S'/S0'` through `S5'`. Any nested `Coordinates/S/S1/S1'`-style branch is an alias or scaffold until a Seed protocol explicitly promotes it.

## Semantic Type Roots

Semantic roots complement the coordinate mirror; they do not replace coordinate authority.

| Root | Purpose |
| --- | --- |
| [[Artifacts]] | Reusable artifact forms and artifact-family classification |
| [[Templates]] | [[CT]] forms and Hen template resolution |
| [[Agents]] | Constitutional agents, ta-onta carriers, and return agents |
| [[Capabilities]] | Tools, skills, plugins, permissions, and capability matrix entries |
| [[Interfaces]] | CLI, RPC, gateway, UI, envelope, and API surfaces |
| [[Runtime-Surfaces]] | Live processes, stores, bridges, sessions, and managed agent homes |
| [[Diagrams]] | Seed diagram packs and World/Types MOC/canvas governance |
| [[Datasets]] | Graph, corpus, cache, source, and contract-ledger datasets |

Deferred roots such as `Workflows`, `Properties`, and `Relations` should wait until the first semantic roots and the [[Hen]] / [[S2]] graph-promotion law are verified.

## Folder-To-Graph Law

The old canon says folder hierarchy is graph-significant. The current code is more conservative and should remain so: folder ancestry is evidence, not arbitrary label authority.

The lawful flow is:

1. [[Hen]] reads `World/Types` path ancestry, sibling MOC/canvas evidence, frontmatter, headings, wikilinks, and source hashes.
2. Hen emits graph-promotion intent with type-family, type-path, coordinate, canvas, and requested-label evidence.
3. [[S2]] validates labels, properties, and relationships against graph-schema registries.
4. Only registered labels/properties/relationships become Neo4j state.

Useful target properties include `q_4_type_family`, `q_4_type_path`, `q_3_canvas_path`, `q_5_crystallisation_state`, `coordinate_parent`, and `coordinate_axis`. Useful target labels such as `WorldType`, `CoordinateType`, `SemanticType`, `MocIndex`, or `CanvasMoc` require explicit [[S2]] schema registration before use.

## Crystallisation Loop

Use this loop for architecture work:

`FLOW/Present evidence -> Seed spec/diagram update -> Hen residency resolve -> World/Types incubation/MOC update -> flat World crystallisation -> Hen graph promotion intent -> S2 promotion/validation -> M' consumption`

Diagrams remain in [[Seeds]] while architecture is live. Stable definitions crystallise into flat [[World]]. MOC canvases and type-local topology live here.

## Operational Gaps

- `s1'.residency.resolve`, `s1'.type.index`, `s1'.moc.ensure`, and `s1'.canvas.create_or_update` are specified by the workflow but not yet complete as public gateway/tool surfaces.
- Hen promotion intent does not yet expose full `World/Types` ancestry evidence.
- S2 schema does not yet register all desired type/MOC labels.
- Non-S coordinate family MOCs are still mostly scaffolded.
