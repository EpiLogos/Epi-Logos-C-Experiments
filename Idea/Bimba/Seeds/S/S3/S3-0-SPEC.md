---
coordinate: "S3.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.0 Shard: Transport Ground

## Intent

Own gateway transport ground: WebSocket lifecycle, `connect`, auth, lock/TLS stance, health, and status.

## Build Scope

- Establish session key and protocol version.
- Return Day/NOW temporal ground on connect.
- Keep transport facts free of ontology.

## API / Envelope / TS

- Owns `connect`.
- Populates Layer 1 transport fields.

## Implementation Hooks

- gateway server.
- auth handshake.
- health endpoints.

## Test Obligations

- Connect returns session ids and temporal state.
- Bad auth fails with typed error.

## Boundaries

Transport carries requests; [[S4']] interprets task meaning.
