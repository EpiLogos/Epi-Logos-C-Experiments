---
coordinate: "S0.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.3 Shard: Workflow Patterns

## Intent

Own repeatable local workflow patterns: scripts, wrappers, cmux/tmux layouts, and small command compositions.

## Build Scope

- Define which workflows deserve `epi` commands versus scripts.
- Keep terminal topology visible to agents and humans.
- Preserve two-agent Anima/Epii bootstrap layout as a target surface.

## API / Envelope / TS

- Supports `s0'.cmux.*`.
- Populates `s_0_terminal_substrate`.

## Implementation Hooks

- cmux/tmux integration.
- `epi up` layout flow.
- Existing helper scripts under `epi-cli/scripts`.

## Test Obligations

- List topology when available.
- Return a typed empty surface when cmux/tmux is unavailable.
- Verify layouts do not require interactive-only state for headless tests.

## Boundaries

Workflow patterns are substrate. Team composition and constitutional routing belong to [[S4']].
