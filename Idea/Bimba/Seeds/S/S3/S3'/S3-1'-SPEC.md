---
coordinate: "S3.1'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3'-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.1' Shard: Method Manifest And Parity

## Canonical Role

[[S3.1']] is the [[P1']] / [[CT1]] definition law for method-manifest truth. It maps product/runtime RPC names to coordinate-native owners and prevents gateway parity from becoming either a stale legacy list or an S0-centric dumping ground.

## Source And Diagram Anchors

Use [[S3'-SPEC]], [[S3-SPEC]], [[S3-SHARD-INDEX]], [[S3'-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3']], and the S3' World/Types canvas. Diagram anchors are [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Legacy sources include [[2026-03-10-gateway-verification-matrix]], [[2026-03-07-s3-gateway-parity-discharge]], and historical [[S3-1']] Hen/state coordination, now demoted from module ownership to manifest/coherence genealogy.

## Current Body Reality

`Body/S/S3/gateway-contract/src/lib.rs` carries `METHOD_NAMES`, `COMMAND_METHOD_NAMES`, `PORTAL_EVENT_NAMES`, subscription method names, Graphiti method ownership constants, and route-visible coordinate method families. `Body/S/S3/gateway/src/dispatch.rs` turns this list into executable dispatch-plan entries. `Body/S/S3/epi-app/renderer/components/omni/contracts/panelRpcParity.ts` and `tests/main/gateway-parity.test.ts` show app-side parity pressure for session operations.

## Build Contract

Every accepted method must have an owner, dispatch kind, and parity status. Coordinate-native families such as `s3'.temporal.*`, `s2'.retrieve`, `s4'.vak.evaluate`, and `s5'.review.*` can be advertised by the gateway only when the owner remains visible. Product RPC aliases such as `status.summary`, `health.snapshot`, and `presence.list` must be mapped rather than allowed to form a second ontology.

## API / Envelope / Implementation Hooks

The core hooks are `METHOD_NAMES`, `method_names()`, `dispatch_plan()`, `dispatch_plan_entry()`, `MethodDispatchKind`, `GatewayDispatchOwner`, `GatewayDispatchClass`, `PANEL_RPC_PARITY`, and app gateway parity helpers.

## Test Obligations

`Body/S/S3/gateway/tests/dispatch_contract.rs` must fail on manifest/route drift. `Body/S/S3/epi-app/tests/main/gateway-parity.test.ts` must keep app-required session operations aligned with S3. Gateway-contract tests must prove command/event contracts are first-class.

## Open Gaps

Some advertised methods are adapters over S0, S2, S4, or S5 rather than native S3 handlers. This is permitted only while the manifest distinguishes native, adapter, missing, alias, and retired status.

## Boundaries

[[S3.1']] maps names and owners. [[S3.1]] defines frame form, [[S3.3]] dispatches, [[S2]] / [[S4]] / [[S5]] own domain semantics, and [[S0]] remains command membrane rather than method-law owner.
