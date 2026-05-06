---
coordinate: "S3.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.1 Shard: Message Form

## Intent

Own wire frame shape, request/response/event conventions, request ids, requester/channel/thread metadata, and routing acknowledgements.

## Build Scope

- Maintain stable frame schema.
- Record requester, target agent, channel, and thread scope.
- Return async ack shape consistently.

## API / Envelope / TS

- Supports all async gateway methods.
- Populates `s_3_request_id`, `s_3_requester`, `s_3_channel`, `s_3_thread_scope`, `s_3_target_agent`.

## Implementation Hooks

- gateway frame parser.
- method manifest.

## Test Obligations

- Invalid frame yields typed error.
- Async method returns ack before final event.

## Boundaries

S3.1 defines message form; method semantics belong to owning S-level.
