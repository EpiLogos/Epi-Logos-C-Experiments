---
coordinate: "S3.3"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S3.3 Shard: Routing And Channels

## Canonical Role

[[S3.3]] is the [[P3]] / [[CT3]] pattern layer of [[S3]] routing. It owns method classification, channel routing, callback delivery, run/event fanout, route-owner metadata, and the dispatch pattern that keeps [[S0]], [[S1]], [[S2]], [[S4]], and [[S5]] from being hidden inside one gateway blob.

## Source And Diagram Anchors

Use [[S3-SPEC]], [[S3-SHARD-INDEX]], [[S3-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3]], and the S3 canvas. Diagrams: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Migrated sources include [[2026-03-07-s3-gateway-full-implementation]], [[2026-03-07-s3-gateway-parity-discharge]], and [[2026-03-10-full-gateway-functionality-plan]].

## Current Body Reality

`Body/S/S3/gateway/src/dispatch.rs` classifies methods into `GatewayDispatchOwner`, `GatewayDispatchClass`, route ids, coordinate owners, and agent-access owners. `Body/S/S3/gateway/src/runtime.rs` and `chat.rs` cover process-local run/chat state; `subagents.rs` validates nested subagent constraints; `sessions.rs` bridges session methods; and `Body/S/S3/gateway-contract/src/lib.rs` supplies the routeable method set. Dispatch tests prove that `sessions.list` is [[S3]], `s3'.temporal.context` is [[S3']], S2 graph methods remain [[S2]] / [[S2']], and S5 episodic methods keep [[S3']] runtime with [[S5]] invocation.

## Build Contract

Routing must be visible, testable, and coordinate-owned. A method is not allowed to drift into S0 because the CLI hosts a server adapter. Unknown methods must fail with typed errors. Methods routed to [[S2]] graph services, [[S4']] orchestration, [[S5']] review/governance, or [[S1']] vault surfaces must preserve the owning coordinate in route metadata. Fanout events must carry enough session/run identity for subscribers to reconcile async results.

## API / Envelope / Implementation Hooks

Key hooks are `classify_method`, `dispatch_plan`, `dispatch_kind`, `methods_in_route_table_missing_from_dispatch_plan`, `methods_in_dispatch_plan_missing_from_route_table`, `agent.capabilities`, `channels.status`, `channels.send`, `chat.*`, `agent.*`, and `node.invoke`.

## Test Obligations

`Body/S/S3/gateway/tests/dispatch_contract.rs` is the contract gate. It must stay red if a method is missing classification, if route table and dispatch plan diverge, or if S0 injects an unowned method. Gateway smoke coverage should prove handler-owner sentinels through real state roots.

## Open Gaps

Some domain handlers remain S0-hosted while the S3 route table describes their owners. This is a known extraction gap and should remain called out until the live server adapter is thinned.

## Boundaries

[[S3.3]] routes and fans out. [[Anima]] orchestrates in [[S4']], [[Epii]] governs review in [[S5']], [[Graphiti]] use is governed by [[S5]], and [[S3']] only projects consequences after routing has produced state.
