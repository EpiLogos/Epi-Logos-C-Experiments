---
coordinate: "S4.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.2 Shard: Skills, Plugins, Tools

## Intent

Own skill/plugin/subagent/hook validation, tool capability registry, and write surface.

## Build Scope

- Treat `plugins/pleroma` as source-of-truth where applicable.
- Keep `.pi` runtime compatibility from drifting.
- Expose capability and permission status.

## API / Envelope / TS

- Supports `s4'.permission.get` and skill/tool status surfaces.
- Populates `s_4_permission_boundary`.

## Implementation Hooks

- skills/plugins directories.
- permission registry.
- hook runtime.

## Test Obligations

- Permission surface blocks unauthorized write.
- Plugin/skill registry reports real installed state.

## Boundaries

S4.2 grants tool authority; S0 executes commands.
