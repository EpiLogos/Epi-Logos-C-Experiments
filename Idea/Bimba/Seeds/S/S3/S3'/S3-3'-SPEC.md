---
coordinate: "S3.3'"
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

# S3.3' Shard: State Projection And Broadcast

## Canonical Role

[[S3.3']] is the [[P3']] / [[CT3]] projection pattern for [[S3']]. It owns state projection, broadcast semantics, [[SpaceTimeDB]] reducer boundaries, subscription lifecycle envelopes, shared-current visibility strategy, and the distinction between local gateway events and the [[Universal NOW]] live-state plane.

## Source And Diagram Anchors

Use [[S3'-SPEC]], [[S3-SPEC]], [[S3'-TRACEABILITY-INDEX]], [[S3-S3i-GATEWAY]], [[S3']], and the S3' canvas. Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]]. Migrated sources include [[2026-03-07-s3-universal-now-bridge-notes]], [[2026-03-10-nara-runtime-full-plan]], and historical [[S3-3']] Chronos/Kairos source material.

## Current Body Reality

`Body/S/S3/epi-spacetime-module/src/lib.rs` defines public tables and reducers for gateway/client/agent registration, `SessionSurface`, `KairosSurface`, `GlobalTemporalSurface`, `TemporalEvent`, `WorldClock`, `PratibimbaPresence`, `SharedArchetypeEvent`, `Coincidence`, and `ModuleVersion`. Reducers include `register_gateway`, `heartbeat_gateway`, `register_agent`, `register_client`, and temporal binding/publication reducers. `Body/S/S3/gateway-contract/src/lib.rs` mirrors projection schema/reducer ABI constants and projection table lists. Gateway tests cover subscription lifecycle and silent-fallback refusal.

## Build Contract

Projection must be reducer-owned where [[SpaceTimeDB]] is active and must not silently downgrade native subscriptions to HTTP polling. One SpaceTimeDB deployment may hold many gateway, agent, and client instances; isolation belongs in installation, workspace, gateway id, agent id, client id, and session key. Projection surfaces must carry public-current or protected-reference data only.

## API / Envelope / Implementation Hooks

APIs include `s3'.temporal.subscribe`, `s3'.spacetime.subscribe`, `SpacetimeProjectionPlan`, `S3SubscriptionRegistryFacts`, `SpacetimeSubscriptionLifecycleEnvelope`, `register_gateway`, `heartbeat_gateway`, `register_agent`, `register_client`, `bind_session_temporal_context`, `bind_kairos_surface`, `bind_global_temporal_surface`, and `publish_temporal_event`.

## Test Obligations

Gateway-contract and gateway runtime tests must verify identical envelope key sets for both subscribe methods, projection schema version agreement, native/fallback lifecycle events, and refusal of silent HTTP fallback. SpaceTimeDB module tests should validate reducer invariants and table shapes against real compiled module code when available.

## Open Gaps

Native networked SpaceTimeDB integration is still partially target state; HTTP SQL polling and file/test bridges exist. Shards must mark unproven network paths as active gaps rather than fulfilled runtime.

## Boundaries

[[S3.3']] projects state. [[S3.3]] routes events, [[S3.4']] names temporal law, [[S1]] owns vault artifacts, [[S4']] owns agent participation, and [[S5']] owns interpretive overlays.
