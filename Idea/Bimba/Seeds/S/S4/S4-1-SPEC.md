---
coordinate: "S4.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S4.1 Shard: Agent Identity

## Intent

Own agent identity, provider/model/auth registry, roster, and runtime persona boundaries.

## Build Scope

- Define Anima vs Epii runtime identity.
- Register provider/model/auth without leaking secrets.
- Track connected agents and capabilities.

## API / Envelope / TS

- Supports `s4.agent.status`, `agent.capabilities`.
- Feeds `s_3_agent_id` and capability discovery.

## Implementation Hooks

- provider config.
- auth storage.
- gateway connect.

## Test Obligations

- Agent identity is stable across connect/status.
- Secret values are not surfaced.

## Boundaries

S4.1 identifies agents; [[S5']] defines Epii return law.
