---
coordinate: "S1.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.2' Shard: Form Birth and Graduation

## Intent

Own CT authority templates, form birth, form listing, and graduation prerequisites.

## Build Scope

- Create lawful forms from CT templates.
- Track birth source, residency, and graduation target.
- Keep World templates ahead of builtins.

## API / Envelope / TS

- Supports `s1'.form.birth`, `s1'.form.list`, `s1'.form.graduate`.

## Implementation Hooks

- Hen form registry.
- vault templates.

## Test Obligations

- Birth a form from a real template.
- Graduate only when residency conditions are met.

## Boundaries

Graduation prepares return; S5 decides reflective promotion meaning.
