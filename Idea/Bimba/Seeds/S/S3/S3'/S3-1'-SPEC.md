---
coordinate: "S3.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.1' Shard: Method Manifest and Parity

## Intent

Own coordinate-native method manifest and the bridge from product/runtime RPC names to S/S' API names.

## Build Scope

- Maintain manifest for `s3.*`, `s3'.*`, and product RPC.
- Mark current, alias, missing, and retired methods.
- Add app-facing expectations like `status.summary`, `health.snapshot`, and `presence.list` if accepted.

## API / Envelope / TS

- Feeds global parity manifest.

## Implementation Hooks

- Rust gateway manifest.
- API/TS definitions.

## Test Obligations

- Manifest includes all accepted coordinate methods.
- Product RPC mapping is explicit.

## Boundaries

S3.1' maps gateway names; owning S-levels define method semantics.
