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

## API / Envelope / Implementation Hooks

- `hen_template_invoke`, `hen_frontmatter_validate`, `hen_status`, `hen_hybrid_retrieve`, and `graph_query` are the named Hen surfaces.
- `S1'/frontmatter_schema.ts` is the schema authority for canonical keys.
- Template resolution order: user custom, Hen templates, flat `Idea/Bimba/World/{Form}.md`, then fallback scaffold.
- Agent prompt and task artifacts must include coordinate, source, temporal, session, and conceptual breadcrumbs as wikilinks where semantic.

## Test Obligations

- `template_vak.test.ts` must pass against the real renderer.
- Frontmatter validation must reject banned fields such as `bimbaCoordinate`, `ql_position`, and `pos_*`.
- Residency tests should verify architecture diagrams/specs are linked from Seeds and MOC canvases from World/Types.
- Vault discovery guidance should be exercised through real `epi vault` command surfaces when available.

## Open Gaps

- `spine-contribution.ts` still shells to `obsidian-cli` for search; robust fallback through `epi vault search` should become the preferred agent path.
- Graph sync is still stubbed at the Hen/Khora/S2 boundary.
- Some historical docs still imply direct `/docs` use; current Hen law requires Seed mirrors and wikilinks from the vault root.

## Boundaries

[[S4.1']] defines form, residency, templates, and wikilinks inside the agent runtime. [[S1]] / [[S1']] owns the wider vault system, [[S4.0']] writes, [[S4.4']] dispatches, [[S2]] materialises graph state, and [[S5']] reviews/promotes lasting meaning.
