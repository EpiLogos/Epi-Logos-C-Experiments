---
coordinate: "S3.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.1 Shard: Message Form

## Canonical Role

[[S3.1]] is the [[P1]] / [[CT1]] definition layer of [[S3]] message law. It owns wire-frame shape, request ids, response/error conventions, route-visible method names, event names, requester/channel/session metadata, and the acknowledgement shape that lets clients distinguish accepted transport from completed domain work.

## Source And Diagram Anchors

Use [[S3-SPEC]], [[S3-SHARD-INDEX]], [[S3-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3]], and the S3 MOC canvas at `Idea/Bimba/World/Types/Coordinates/S/S3/S3.canvas`. Diagram links: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Legacy anchors include [[2026-03-07-s3-gateway-full-implementation]], [[2026-03-07-s3-gateway-parity-discharge]], and [[2026-03-10-gateway-verification-matrix]].

## Current Body Reality

`Body/S/S3/gateway/src/protocol.rs` defines `RequestFrame { type, id, method, params }`, `ResponseFrame { type, id, result, error }`, and `GatewayError { code, message }`. `Body/S/S3/gateway-contract/src/lib.rs` is the broad method/event authority, including product RPC names, coordinate-native names, [[S0]] command pass-through, [[S1']] vault methods, [[S2]] graph methods, [[S4']] orchestration methods, [[S5]] governance methods, portal events, and [[SpaceTimeDB]] subscription methods. `Body/S/S3/gateway/src/dispatch.rs` classifies each method into owner/class/route information.

## Build Contract

Every request must carry a stable id and method. Every response must either carry `result` or typed `error`, never informal text-only failures. `METHOD_NAMES` is not a vanity manifest: if a method appears there it must be classified by S3 dispatch law and either handled natively or routed to the owning coordinate. Product names such as `sessions.list` and coordinate names such as `s3'.temporal.context` may coexist, but their owner must remain explicit.

## API / Envelope / Implementation Hooks

The core hooks are `RequestFrame`, `ResponseFrame`, `GatewayError`, `METHOD_NAMES`, `PORTAL_EVENT_NAMES`, `COMMAND_METHOD_NAMES`, `classify_method`, `dispatch_plan_entry`, and `MethodDispatchKind`. Event vocabulary includes `agent`, `chat`, `tick`, `health`, `heartbeat`, plus portal events such as `portal.vak_eval` and `portal.kairos_shift`.

## Test Obligations

Run the dispatch/protocol contract tests in `Body/S/S3/gateway/tests/dispatch_contract.rs`, `Body/S/S3/gateway/tests/protocol_contract.rs`, and `Body/S/S3/gateway-contract/tests/hermes_inspired_contracts.rs`. These tests must catch unclassified methods, route-table drift, missing dispatch-plan entries, and inconsistent envelope shape.

## Open Gaps

The method list is ahead of some extracted native implementations; this is acceptable only if route ownership and unsupported states remain truthful. No S0-only method should appear without S3 dispatch-plan recognition.

## Boundaries

[[S3.1]] defines gateway form. [[S3.2]] owns session state, [[S3.3]] owns routing/fanout, [[S3']] owns projection, and the domain coordinates own method semantics after dispatch.
