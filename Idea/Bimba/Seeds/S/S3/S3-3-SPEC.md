---
coordinate: "S3.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S3.3 Shard: Routing and Channels

## Intent

Own agent/channel dispatch, callback channels, run registry, event fanout, and subscription delivery.

## Build Scope

- Register and list channels.
- Route messages to target agents.
- Deliver async results to subscribers.

## API / Envelope / TS

- Owns `agent.capabilities`, `s3.channel.*`, `s3.message.route`.
- Populates target-agent transport fields.

## Implementation Hooks

- gateway router.
- channel registry.
- connected agent capability map.

## Test Obligations

- Route to connected agent.
- Unknown target returns typed error.
- Fanout reaches subscribed clients.

## Boundaries

S3 routes; [[Anima]] orchestrates.
