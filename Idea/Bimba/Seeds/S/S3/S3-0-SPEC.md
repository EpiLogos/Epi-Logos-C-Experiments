---
coordinate: "S3.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.0 Shard: Transport Ground

## Canonical Role

[[S3.0]] is the [[P0]] / [[CT0]] transport ground of [[S3]]: the first lawful contact between client and gateway. It owns [[WebSocket]] opening, `hello-ok`, `connect`, protocol version advertisement, local auth stance, health/readiness signalling, and the boundary that keeps transport facts from becoming agent interpretation. [[S3.0]] carries command into the stack; [[S4']] and [[S5']] decide what the command means.

## Source And Diagram Anchors

Load [[S3-SPEC]], [[S3'-SPEC]], [[S3-SHARD-INDEX]], [[S3-TRACEABILITY-INDEX]], [[S3]], and `Idea/Bimba/World/Types/Coordinates/S/S3/S3.canvas` before changing this shard. The diagram anchors are [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. Migrated sources include [[S3-S3i-GATEWAY]], [[2026-03-07-s3-gateway-full-implementation]], [[2026-03-09-s3-gateway-merge-cleanup]], and [[2026-03-10-gateway-verification-matrix]].

## Current Body Reality

The transport contract is split across `Body/S/S3/gateway-contract/src/lib.rs` and `Body/S/S3/gateway/src/protocol.rs`. The contract crate fixes `DEFAULT_GATEWAY_PORT = 18794`, `PROTOCOL_VERSION = 3`, `PROTOCOL_DEV_VERSION`, `METHOD_NAMES`, `EVENT_NAMES`, and portal event vocabulary. The gateway protocol crate constructs `HelloOkFrame`, `RequestFrame`, `ResponseFrame`, `GatewayError`, `hello_ok()`, `success()`, `error()`, and `connect_result()`. The app consumer is `Body/S/S3/epi-app/main/s3-gateway-client.ts`, which defaults to `ws://localhost:18794`, handles reconnect/ping stability, and sends JSON frames.

## Build Contract

`hello-ok` must advertise the canonical method/event surface from [[S3]] rather than a local product subset. `connect` must remain the first-class handshake and return enough session/feature information for [[OmniPanel]], [[M']], and future [[KernelBridge]] consumers to orient. Error frames must be typed, serialisable, and stable enough for reconnecting clients. Transport may carry [[Day]] / [[NOW]] identifiers received from the Pi adapter, but it must not fabricate vault state or [[Chronos]] meaning.

## API / Envelope / Implementation Hooks

Primary hooks are `connect`, `hello-ok`, `RequestFrame`, `ResponseFrame`, `GatewayError`, `method_names()`, `event_names()`, and the app-side `S3GatewayClient.connect()`. The envelope keys belong to S3 transport until a route table hands the method to [[S2]], [[S4]], or [[S5]].

## Test Obligations

Real tests are `Body/S/S3/gateway-contract/tests/hermes_inspired_contracts.rs`, `Body/S/S3/gateway/tests/protocol_contract.rs`, `Body/S/S3/gateway/tests/live_gateway_smoke.rs`, and `Body/S/S3/epi-app/tests/main/gateway-parity.test.ts`. They must verify protocol versioning, connect-first behavior, advertised methods/events, handler ownership, and app parity without mocks that bypass the gateway.

## Open Gaps

Some live server behavior is still hosted by `Body/S/S0/epi-cli/src/gate`, so [[S3.0]] is not yet the only executable gateway entry. The shard should keep this as an extraction gap, not disguise it as complete native residency.

## Boundaries

[[S0]] launches and mirrors commands; [[S3.0]] owns transport law. [[S3.1]] owns frame/form semantics beyond the opening handshake. [[S3']] owns temporal projection once connection facts become shared state. [[S4']] owns [[Anima]] / [[VAK]] routing, and [[S5']] owns reflective return.
