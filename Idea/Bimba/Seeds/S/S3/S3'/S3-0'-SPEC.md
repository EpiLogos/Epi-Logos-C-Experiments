---
coordinate: "S3.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.0' Shard: Protocol Contract Ground

## Intent

Own protocol versioning, hello-ok/connect-first invariant, session key return, and canonical error shape.

## Build Scope

- Reject non-connect traffic before connect.
- Version frames and errors.
- Preserve `s_3_agent_id` in connection state.

## API / Envelope / TS

- Owns connect contract and protocol fields.

## Implementation Hooks

- gateway protocol layer.

## Test Obligations

- Pre-connect request denied.
- Protocol version mismatch handled.

## Boundaries

Protocol law is transport law, not agent law.
