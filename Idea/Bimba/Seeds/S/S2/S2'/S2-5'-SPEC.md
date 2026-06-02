---
coordinate: "S2.5'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2'-SPEC]]"
  - "[[S2-SPEC]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S2'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S2']]"
---

# S2.5' Shard: Graph Interface Parity And Handoff

## Canonical Role

[[S2.5']] is the [[P5']] / [[CT5]] / [[L5']] integration-return law of [[S2']]: parity between graph-services, [[S0]] CLI mirrors, [[S3]] gateway routes, external MCP tools, [[M']] consumers, and [[S5]] review/evidence handoff. It keeps all graph interfaces accountable to one coordinate law.

## Source And Diagram Anchors

Primary anchors: [[S2'-SPEC]], [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2'-TRACEABILITY-INDEX]], [[S2']], [[S5']], [[M'-SYSTEM-SPEC]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC: `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.canvas`. Migrated anchors: [[S2-5']], [[S2']], [[S2'Cx]], [[S2-S2i-GRAPH]], and [[2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones]].

## Current Body Reality

`Body/S/S2/graph-services/src/graph_api.rs` defines contract payloads for `s2.graph.query`, `s2.graph.node`, `s2.graph.traverse`, pointer-web refresh, and kernel-resonance observation plans. `Body/S/S2/graph-services/src/consumption.rs` and `tests/m5_handoff_contract.rs` cover [[M5']] / review handoff expectations. `Body/S/S2/external/bimba-mcp/src/index.ts` exposes many graph tools for external consumers. [[S0]] mirrors graph commands in `Body/S/S0/epi-cli/src/graph/*`; [[S3]] gateway contract is adjacent for route ownership.

## Build Contract

Every public graph surface must map to canonical S2/S2' owner, method name, parameter shape, result shape, provenance, and privacy/disclosure policy. Interface parity reports must show which MCP/CLI/gateway methods are canonical, mirrored, deprecated, or external-only. [[M']] and [[Epii]] handoffs must receive handles and evidence, not raw database internals.

## Test Obligations

Use `Body/S/S2/graph-services/tests/graph_api_contract.rs`, `m5_handoff_contract.rs`, `graph_runtime_extraction_contract.rs`, `doctor_plugin_readiness_contract.rs`, and S0 CLI graph tests. Parity tests must fail when an exposed graph tool lacks coordinate owner, provenance, or mapped canonical method.

## Open Gaps

The route table is still partly distributed across graph-services, [[S0]] CLI, external MCP, and gateway contract language. The canonical `s2'.enrich` and `s2'.coordinate.resolve` gateway shape needs final consolidation. MCP remains useful but must not be confused with PI's internal graph organ.

## Boundaries

[[S2.5]] exposes raw substrate surfaces. [[S2.5']] governs lawful parity and handoff. [[S3]] transports gateway/API calls. [[S4']] governs capability access. [[S5']] interprets and reviews graph-derived evidence. [[M']] consumes only documented graph contracts through [[KernelBridge]]/gateway paths.
