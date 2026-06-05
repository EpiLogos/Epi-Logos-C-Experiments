# World Types Mirror

`Idea/Bimba/World/Types` is the ordered ontology mirror, MOC/canvas residency surface, and pre-sync graph-type incubation layer for [[World]].

Flat `Idea/Bimba/World/*.md` remains the crystallised form library. [[Seeds]] remains the planning/spec/source layer. `World/Types` is the place where type context, canvases, coordinate mirrors, and semantic indexing make those forms navigable before [[Hen]] emits graph-promotion evidence and [[S2]] validates it into graph state.

## Residency Rule

| Surface | Authority | Examples |
| --- | --- | --- |
| [[World]] | Crystallised definitions, reusable forms, stable architecture-as-documentation | [[World-Ontology]], [[CT0]], [[NOW]], [[Seed]], [[Task-Spec]] |
| [[World/Types]] | Type-local MOCs, canvases, coordinate mirrors, and incubation evidence | [[Types.canvas]], `Coordinates/S/S1/S1.canvas`, `Coordinates/C/C1/C1'/CT/**`, `Coordinates/T/**` |
| [[Seeds]] | Specs, plans, diagram packs, traceability, migrated legacy source evidence | [[ARCHITECTURE-DIAGRAM-PACK]], [[S-SYSTEM-INDEX]], [[S-SHARD-HARMONIZATION-PROTOCOL]] |

`World/Forms/` is obsolete and must not be revived.

## MOC Index Rule

Every type-authority folder that can classify or incubate forms should contain:

- `{FolderName}.md` as the textual MOC/type index.
- `{FolderName}.canvas` as the visual MOC.
- A clear `Scope`, `What Belongs Here`, `What Does Not Belong Here`, `Coordinate Crosswalk`, `Seed Evidence`, `Graph Label Intent`, and `Open Gaps`.

Container-only folders are allowed, but they should be explicit containers rather than silent half-MOCs. A container becomes a type authority only after it has the same-name `.md` and `.canvas` pair.

## Coordinate Mirror

The coordinate mirror follows the core coordinate sequence under `Coordinates/{C,P,L,S,T,M}`. The [[S]] / [[S']] branch is the most system-architecture-materialised branch; the [[C]] branch is now the primary semantic typology branch.

## C-Layer Typology Authority

`Coordinates/C/**` is where coordinate becomes language, type, and semantic category. Other coordinate families qualify a thing; the C layer says what kind of thing it is.

| C coordinate | Semantic authority | Base home |
| --- | --- | --- |
| [[C0]] | Source / Ground | `Coordinates/C/C0/Source-Ground/**` |
| [[C1]] | Forms / Templates | `Coordinates/C/C1/Forms-And-Templates/**` and `Coordinates/C/C1/C1'/CT/**` |
| [[C2]] | Entities / Properties / Tags | `Coordinates/C/C2/Entities-Properties-Tags/**` |
| [[C3]] | Processes / Canvases / Diagrams | `Coordinates/C/C3/Processes-Canvases-Diagrams/**` |
| [[C4]] | Types / Contexts / MOCs | `Coordinates/C/C4/Types-Contexts-MOCs/**` |
| [[C5]] | Crystallisations / Pratibimba | `Coordinates/C/C5/Crystallisations-Pratibimba/**` |

Semantic view roots such as `Templates`, `Entities`, `Properties`, `Tags`, `Diagrams`, `Canvases`, or `Artifacts` should be C-native folders or query views, not top-level `World/Types` peers.

The C-reflective ladder follows the paired-branch law in the current Hen contract:

- `Coordinates/C/C1/C1'/CT` for [[CT]] law.
- `Coordinates/C/C3/C3'/CF` for [[CF]] and context-frame law.
- `Coordinates/C/C0/C0'/CPF`, `C2/C2'/CFP`, `C4/C4'/CP`, and `C5/C5'/CS` exist as current scaffolds but require a Cycle 3 C-prime audit before their folder ancestry is graph-authoritative.

Older references to a top-level `Root/#` or `Coordinates/C/C'/CT` should be read as historical shorthand unless those folders are explicitly created and linked by a later coordinate-completion pass. Current root psychoid ordering lives under `Psychoids/#/#0` through `#5`.

Prime S-family MOCs are canonical under `Coordinates/S/S'/S0'` through `S5'`. Any nested `Coordinates/S/S1/S1'`-style branch is an alias or scaffold until a Seed protocol explicitly promotes it.

## Coordinate-Native Type Roots

Semantic categories must not become parallel folder authorities when a canonical coordinate system already owns them.

| Concern | Canonical Type Home | Notes |
| --- | --- | --- |
| Hen templates and CT artifacts | `Coordinates/C/C1/C1'/CT/**` | [[CT0]]-[[CT5]] and their concrete families are the template law. Do not create a sibling `Templates` root. |
| Entity candidates, aliases, properties, tags, relation fields | `Coordinates/C/C2/Entities-Properties-Tags/**` | C2 is the semantic home for entity articulation after Empty capture. Do not create sibling `Entities` or `Properties` roots. |
| Ideal canvas forms and architecture diagram forms | `Coordinates/C/C3/Processes-Canvases-Diagrams/**` | Live diagrams remain Seed evidence; reusable canvas/diagram forms are C3 type forms. |
| Type authorities and MOC patterns | `Coordinates/C/C4/Types-Contexts-MOCs/**` | C4 decides whether a folder is a type authority, container, or incubation surface. |
| World graduation / Pratibimba handoff | `Coordinates/C/C5/Crystallisations-Pratibimba/**` | C5 records graduation and reflection/archive forms. |
| Thought artifacts and T/T' records | `Coordinates/T/**` plus `Idea/Pratibimba/Self/Thought/**` | [[T-family]] names living planes of thought; [[T′-family]] names instantiated artifacts. Do not create a sibling `Artifacts` root. |
| Agents and capabilities | `Coordinates/S/S4/**`, `Coordinates/S/S'/S4'/**`, and [[M5]] / [[M5']] routes | Constitutional agents, [[VAK]], tools, plugins, and permissions are coordinate views over S4/S4' and M' surfaces. |
| Interfaces and runtime surfaces | `Coordinates/S/S0/**`, `S3/**`, `S4/**`, `S5/**`, and [[M']] routes | CLI, gateway, sessions, stores, envelopes, and bridges should be inferred from owning coordinates and code evidence. |
| Diagrams and MOCs | [[Seeds]] diagram packs plus same-name `.canvas` files under coordinate MOCs | Live architecture diagrams remain Seed evidence; stable type canvases live here. |
| Datasets and graph surfaces | `Coordinates/S/S2/**`, `S5/**`, and graph-schema Seeds | Graph, corpus, cache, source, and ledger datasets require [[S2]] schema validation before labels become graph state. |

If a useful semantic view such as `Interfaces` or `Agents` is needed, make it a query, index, C-native type view, or flat [[World]] synthesis that links back to the owning coordinates. Do not mint a new top-level `World/Types/{SemanticRoot}` unless a Seed protocol proves that no coordinate-native home exists.

## Graduation To Flat World

Coordinate crystallisation starts in [[World/Types]] and graduates into flat [[World]] only when the definition becomes stable enough to serve as canonical architecture-as-documentation.

| State | Location | Rule |
| --- | --- | --- |
| `incubating_type_index` | `World/Types/Coordinates/**/{Name}/{Name}.md` and `{Name}.canvas` | Type-local MOC, canvas, crosswalk, and graph-evidence gathering. |
| `crystallised_world_form` | `World/{Name}.md` | Stable canonical definition with source coordinates, Seed evidence, type-source backlink, canvas backlink, and related World links. |
| `type_moc_pointer` | Original `World/Types/**/{Name}.md` | Remains as MOC/topology pointer after graduation; it should not duplicate the flat World definition. |
| `seed_evidence` | `Seeds/**` | Plans, specs, diagrams, traces, and migrated legacy files that justify the crystallisation. |

Hen should prioritise the flat [[World]] file for canonical meaning after graduation, then use the type-local MOC/canvas for coordinate ancestry and visual topology.

## Folder-To-Graph Law

The old canon says folder hierarchy is graph-significant. The current code is more conservative and should remain so: folder ancestry is evidence, not arbitrary label authority.

The lawful flow is:

1. [[Hen]] reads `World/Types` path ancestry, sibling MOC/canvas evidence, frontmatter, headings, wikilinks, and source hashes.
2. Hen emits graph-promotion intent with type-family, type-path, coordinate, canvas, and requested-label evidence.
3. [[S2]] validates labels, properties, and relationships against graph-schema registries.
4. Only registered labels/properties/relationships become Neo4j state.

Useful target properties include `q_4_type_family`, `q_4_type_path`, `q_3_canvas_path`, `q_5_crystallisation_state`, `coordinate_parent`, `coordinate_axis`, `world_form_path`, `type_source_path`, and `seed_evidence_paths`. Useful target labels such as `WorldType`, `CoordinateType`, `MocIndex`, or `CanvasMoc` require explicit [[S2]] schema registration before use. `SemanticType` should be treated as a derived/query label, not a folder-authority label, unless [[S2]] explicitly registers it.

## Crystallisation Loop

Use this loop for architecture work:

`FLOW/Present evidence -> Seed spec/diagram update -> Hen residency resolve -> World/Types incubation/MOC update -> flat World crystallisation -> Hen graph promotion intent -> S2 promotion/validation -> M' consumption`

Diagrams remain in [[Seeds]] while architecture is live. Stable definitions crystallise into flat [[World]]. MOC canvases and type-local topology live here.

Use [[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]] for C-layer classification and MOC maintenance. Use [[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]] for Empty entity capture.

## Operational Gaps

- `s1'.residency.resolve`, `s1'.type.index`, `s1'.moc.ensure`, and `s1'.canvas.create_or_update` are specified by the workflow but not yet complete as public gateway/tool surfaces.
- Hen promotion intent does not yet expose full `World/Types` ancestry evidence or flat-World graduation evidence.
- S2 schema does not yet register all desired type/MOC labels.
- C-prime folder ancestry needs audit before [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] can be treated as graph-authoritative from folders alone.
- P/L/T/M coordinate family MOCs are still mostly scaffolded.
