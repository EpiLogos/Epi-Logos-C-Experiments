---
coordinate: "S0.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.0' Shard: Khora Tool Law

## Intent

Own [[Khora]] preferred-tool declarations and resolver law.

## Build Scope

- Treat capability names as the contract.
- Resolve tools honestly with declared fallbacks only.
- Keep `.pi` and `.epi/agents/*` materialisations from drifting.

## API / Envelope / TS

- Implements `s0.tool_surface`.
- Populates `s_0_tool_surface`.

## Implementation Hooks

- `.pi/extensions/ta-onta/khora/S0/cli/preferred-tools.json`
- `.pi/extensions/ta-onta/khora/S0/cli/resolve.sh`

## Test Obligations

- Preferred tools resolve to real paths or explicit unresolved status.
- Missing no-fallback tools are reported honestly.

## Boundaries

Tool choice is runtime law, not agent ontology.
