---
coordinate: "S4.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4'-SPEC]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]]"
  - "[[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]]"
---

# S4.1' Shard: Agent Definition Law

## Canonical Role

[[S4.1']] is the [[Hen]] carrier of [[S4']]: [[P1]] / [[CT1]] form law for agent artifacts, prompts, templates, frontmatter, wikilinks, vault topology, and the [[World]] / [[Seeds]] / [[World/Types]] residency rule that lets architecture-as-documentation be consumed and produced without split provenance.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4'-SPEC]], [[S4-SPEC]], [[S4'-TRACEABILITY-INDEX]], [[S4-1-SPEC]], [[S1-SPEC]], [[S1'-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]], [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]].
- World/MOC anchors: [[S4']], [[Hen]], `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`, `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`.
- Migrated sources: [[S4-EXTENSION-ARCHITECTURE]], [[S4-TA-ONTA-EXTENSION-SPEC]], [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]], [[2026-05-19-hen-coordinate-graph-promotion]], [[2026-05-21-agent-led-coordinate-promotion-policy]].

## Current Body Reality

The live Hen carrier is `Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md`, `extension.ts`, `modules/template-vak.ts`, `S1'/frontmatter_schema.ts`, templates under `S1'/templates/**`, and `spine-contribution.ts`. The contract explicitly states the residency rule: `Idea/Bimba/World` is for crystallised flat forms and stable architecture-as-documentation; `Idea/Bimba/Seeds` is for planning/spec/source material and migrated `/docs` mirrors; `Idea/Bimba/World/Types` is the ordered ontology mirror and MOC/canvas residency surface.

`renderTemplateWithVak` renders `cpf`, `ct`, `cp`, `cf`, `cfp`, `cs_code`, and `cs_direction` into markdown frontmatter. `template_vak.test.ts` verifies multi-CT arrays, `Night'`, omission of empty `day_id`, and YAML-safe escaping.

## Build Contract

Hen must make agents use the vault as an intelligent discovery surface: `epi core knowing <coordinate> --json`, `epi vault read`, `epi vault search`, `epi vault search-content`, and `epi vault link-suggest` come before raw filesystem grep when planning or harmonising canonical Epi-Logos material. Seed specs and migrated Seed Legacy files are the planning/source truth; crystallised definitions and durable architecture state live in flat [[World]]; MOC/canvas surfaces live in [[World/Types]].

Architecture diagrams remain Seed CT1 artifacts unless crystallised into World definitions. A shard or MOC that consumes a diagram must link the heading anchor explicitly; Mermaid labels are not backlinks.

## Entity Capture And Empty Residency

Hen must not let agents leave new entities as loose root notes, unowned graph placeholders, or ad hoc semantic folder roots. When an agent encounters a dangling `[[wikilink]]`, an unresolved Smart Connections suggestion, or an Obsidian-created loose note, [[S4.1']] routes the operation through the S1' lifecycle in [[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]]:

1. capture or move the note into [[Empty]] as `c_4_artifact_role: "entity-candidate"`;
2. preserve aliases, source coordinates, temporal provenance, and candidate state with coordinate-lawful frontmatter;
3. use Smart Env only for read-only link evidence and ranking;
4. classify the candidate against coordinate, CT, wikilink, and source evidence;
5. promote reviewed candidates into coordinate-native [[World/Types]] incubation;
6. graduate stable definitions into flat [[World]], leaving type-local files as MOC/source pointers.

The agent-facing rule is simple: Seeds hold planning and specs, Empty holds unresolved/live candidates, World/Types holds coordinate/type incubation and MOC topology, and flat World holds crystallised architecture-as-documentation. SwarmVault is a development-ledger sidecar for Codex/Claude work, not the Pi/Hen canonical entity compiler.

## C-Layer Typology Routing

Hen agents must treat `World/Types/Coordinates/C/**` as the semantic type authority:

- templates and markdown forms route to [[C1]] / [[CT]];
- entity candidates, entities, aliases, tags, properties, and relation fields route to [[C2]];
- MOC canvases, ideal canvas forms, architecture diagram forms, and process diagrams route to [[C3]];
- type authority folders, context views, Dataview indexes, and residency classes route to [[C4]];
- flat World graduation and Pratibimba/archive handoff route to [[C5]].

Agents should not create top-level semantic peers under [[World/Types]] while a C-native home exists. The C-layer workflow is [[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]].

## API / Envelope / Implementation Hooks

- `hen_template_invoke`, `hen_frontmatter_validate`, `hen_status`, `hen_hybrid_retrieve`, and `graph_query` are the named Hen surfaces.
- `S1'/frontmatter_schema.ts` is the schema authority for canonical keys.
- Template resolution order: user custom, Hen templates, flat `Idea/Bimba/World/{Form}.md`, then fallback scaffold.
- Agent prompt and task artifacts must include coordinate, source, temporal, session, and conceptual breadcrumbs as wikilinks where semantic.
- Target S1' entity surfaces for Hen carriers: `s1'.entity.capture`, `s1'.entity.classify`, `s1'.entity.promote_to_type`, plus `s1'.world.graduate` and deeper Smart Env reads through `s1'.semantic.neighbors_of` / `by_block` / `search`.
- Target C-layer surface: `s1'.type.classify_c_layer` before semantic folder placement.

## Test Obligations

- `template_vak.test.ts` must pass against the real renderer.
- Frontmatter validation must reject banned fields such as `bimbaCoordinate`, `ql_position`, and `pos_*`.
- Residency tests should verify architecture diagrams/specs are linked from Seeds and MOC canvases from World/Types.
- Entity lifecycle tests should verify dangling/root-created notes move into Empty candidate residency before type/world promotion.
- C-layer tests should verify templates route to C1/CT, entities/properties/tags route to C2, canvases/diagrams route to C3, type/MOC authority routes to C4, and graduation routes to C5.
- Vault discovery guidance should be exercised through real `epi vault` command surfaces when available.

## Open Gaps

- `spine-contribution.ts` still shells to `obsidian-cli` for search; robust fallback through `epi vault search` should become the preferred agent path.
- Hen carrier does not yet expose the S1' entity-capture surfaces in runtime command envelopes.
- Hen carrier does not yet expose `s1'.type.classify_c_layer`.
- Graph sync is still stubbed at the Hen/Khora/S2 boundary.
- Some historical docs still imply direct `/docs` use; current Hen law requires Seed mirrors and wikilinks from the vault root.

## Boundaries

[[S4.1']] defines form, residency, templates, and wikilinks inside the agent runtime. [[S1]] / [[S1']] owns the wider vault system, [[S4.0']] writes, [[S4.4']] dispatches, [[S2]] materialises graph state, and [[S5']] reviews/promotes lasting meaning.
