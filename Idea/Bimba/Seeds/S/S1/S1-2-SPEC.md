---
coordinate: "S1.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.2 Shard: Template and Form

## Intent

Own template resolution, CT4a/CT4b split, named runtime forms, and world-root precedence.

## Build Scope

- Resolve templates in order: Obsidian config, `Idea/Bimba/World`, overrides, builtins.
- Cover `Daily-Note`, `NOW`, `Prompt`, `Task-Spec`, `Pattern-Note`, and `Thought`.
- Preserve CT lineage in generated artifacts.

## API / Envelope / TS

- Supports `s1.template.render`.
- Feeds `s_1_artifact_ct_type`.

## Implementation Hooks

- `.obsidian/templates.json`.
- `docs/resources/CT4b-MASTER-TEMPLATE.md`.
- Hen template registry.

## Test Obligations

- Render a real template with variables.
- Verify fallback order.

## Boundaries

Templates give form; compiler ledgers belong to [[S1.3']].
