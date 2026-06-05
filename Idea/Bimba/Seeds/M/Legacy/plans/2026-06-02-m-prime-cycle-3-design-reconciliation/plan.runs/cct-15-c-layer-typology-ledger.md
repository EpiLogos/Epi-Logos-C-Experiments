# CCT-15 Ledger — C-Layer Typology And MOC Maintenance

## Finding

World/Types had the right coordinate-first instinct, but semantic categories were still at risk of becoming either top-level peer roots or vague query views. The C layer already exists as the categorical coordinate family, so it should become the primary semantic typology for World/Types.

## Canonical Resolution

`Idea/Bimba/World/Types/Coordinates/C/**` is the semantic authority:

- C0: source / ground roots.
- C1: forms, definitions, ideal markdown forms, and CT template law.
- C2: entity candidates, entities, aliases, properties, tags, relation-field evidence.
- C3: MOC canvas forms, architecture diagram forms, workflow patterns, process canvases, ideal canvas/diagram templates.
- C4: type authorities, context frames, folder MOC patterns, Dataview/query indexes, residency classes.
- C5: World-form graduation, integration forms, graduation receipts, Pratibimba/archive handoff.

## Spec Anchors

- `Idea/Bimba/Seeds/S/S1/S1'/FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW.md`
- `Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md`
- `Idea/Bimba/Seeds/S/S1/S1'/S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL.md`
- `Idea/Bimba/Seeds/S/S4/S4'/S4-1'-SPEC.md`
- `Idea/Bimba/World/Types/README.md`
- `Idea/Bimba/World/Types/TYPE-REGISTRY.md`

## Base Structure Landed

- `World/Types/Coordinates/C/C.md` and `C.canvas`.
- Same-name MOC/canvas pairs for C0-C5.
- Semantic leaf folders under C0-C5 for source roots, templates, entities/properties/tags, canvases/diagrams, MOC/type authorities, and graduation/reflection.
- CT same-name MOC/canvas pairs for CT and CT0-CT5.

## Implementation Targets

- `s1'.type.classify_c_layer`
- `s1'.type.validate_authority_moc_pair`
- `s1'.type.audit_c_prime_ancestry`
- `GraphPromotionIntent.semantic_authority`
- `GraphPromotionIntent.c_layer_path`
- `GraphPromotionIntent.type_family`
- `GraphPromotionIntent.type_path`
- `GraphPromotionIntent.type_coordinate`
- `GraphPromotionIntent.crystallisation_state`
- `CoordinateSearchScope::TypeOntology` or equivalent C-layer scope in S2 GraphRAG
- S2 graph migration from C0-C5 to `World/Types/Coordinates/C/**` authority paths
- C-prime ancestry audit for CPF/CT/CP/CF/CFP/CS.

## Cycle 3 Integration Contract

This CCT closes only when C is operationally used as the first semantic typology pass across Hen and GraphRAG. C must answer "what kind of thing is this?" before S/M/P/L/T qualifiers are applied.

### S1 Hen Surfaces

Hen classification becomes C-first:

- `s1'.type.classify_c_layer`: classifies an artifact into C0-C5 from path ancestry, frontmatter, artifact kind, and MOC/canvas authority evidence.
- `s1'.type.validate_authority_moc_pair`: verifies a type-authority folder has same-name `.md` and `.canvas` before that folder ancestry becomes graph-authoritative.
- `s1'.type.audit_c_prime_ancestry`: verifies C-prime folder order against `CPF -> CT -> CP -> CF -> CFP -> CS` before C-prime paths can promote graph labels.
- `s1'.entity.promote_to_type`: consumes CCT-14 entity candidates and routes them to C2 incubation unless a more specific C authority is proven.
- `s1'.world.graduate`: emits C5 graduation receipts that leave a type-local MOC/source pointer.

Hen promotion evidence must include:

- `type_family`: C authority family, e.g. `C2.Entities`.
- `type_path`: concrete World/Types authority path.
- `type_coordinate`: C0-C5 coordinate.
- `semantic_authority`: same-name MOC/canvas authority identifier.
- `crystallisation_state`: `candidate`, `incubating_type_index`, `authority_moc`, `graduated_world_form`, or `pratibimba_handoff`.
- `c_layer_path`: path relative to `World/Types/Coordinates/C`.

### S2 Graph Schema And Parser Surfaces

S2 must make C semantics machine-readable:

- `CoordinateArrayParser` retains ordinary C coordinate parsing but enriches C0-C5 with C-layer roles.
- `coordinate_semantic_family_specs()` must describe C as semantic typology, not generic category.
- C-prime mapping is fixed to the audited VAK order before graph-label promotion consumes folder ancestry.
- Graph properties for `semantic_authority`, `c_layer_path`, `type_coordinate`, `type_path`, and `crystallisation_state` are registered or admitted as coordinate-prefixed C properties.
- C0-C5 authority nodes link to their `.md` and `.canvas` MOC evidence under `Idea/Bimba/World/Types/Coordinates/C/**`.

### GraphRAG Retrieval Surfaces

GraphRAG gains a C-layer/type-ontology scope:

- Triggered by explicit C mentions or type-language: `type`, `kind`, `entity`, `property`, `tag`, `alias`, `relation field`, `template`, `form`, `canvas`, `diagram`, `MOC`, `context`, `World graduation`, `Pratibimba handoff`.
- Filters first by `coordinate STARTS WITH 'C'` and C-authority properties.
- Boosts C2 for entity/property/tag/relation queries.
- Boosts C3 for process/canvas/diagram queries.
- Boosts C4 for type/context/MOC queries.
- Boosts C5 for graduation, crystallisation, and Pratibimba handoff queries.
- Widens only after the C authority pass to related S/M/P/L/T qualifiers.

### Gateway / Surface Hooks

S3/S4/S5 surfaces should consume C classification without bypassing Hen:

- S3 exposes read-only classification receipts for M' surfaces.
- S4 agents use C classification in dispatch prompts so entity capture, diagram reasoning, and type-authority work route correctly.
- S5 review checks that graph-promoted artifacts carry a C authority when they claim to be templates, entities, diagrams, MOCs, relation fields, or graduation receipts.
- Theia surfaces show C authority badges alongside coordinate badges but do not mutate C classification directly.

## Cross-Track Integration

- Track 09.11: parser, retrieval, graph migration.
- Track 09.12: Hen graph-promotion evidence.
- CCT-14: entity-candidate lifecycle feeding C2 and C5.
- Track 14 G10: release gate fails if CCT-15 lacks C-aware Hen and GraphRAG tests.

## Verification Shape

Future implementation should add real fixture tests for:

- template/prompt artifacts classify to C1/CT;
- dangling entities after Empty capture classify to C2;
- ideal canvas and diagram forms classify to C3;
- same-name type folders classify to C4;
- flat World graduation receipts classify to C5;
- top-level semantic roots are refused while C-native homes exist.
- C-prime ancestry audit refuses graph-label promotion until the VAK order is verified.
- GraphRAG `entity property alias relation field` hits C2 authority before general Bimba map results.
- GraphRAG `architecture diagram canvas MOC` hits C3/C4 authorities before S/M qualifiers.
- Graph-promotion fixtures carry `type_family`, `type_path`, `type_coordinate`, `semantic_authority`, `crystallisation_state`, and `c_layer_path`.
