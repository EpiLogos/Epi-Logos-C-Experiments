---
coordinate: "S3'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S3-SPEC]]"
  - "[[S3-SHARD-INDEX]]"
  - "[[S3-TRACEABILITY-INDEX]]"
  - "[[S3'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S3' Specification: Temporal Runtime, Gateway Projection, And Session Context

## Canonical Status

This file is the single authoritative S3' seed. S3 is the gateway/session transport; S3' is the temporal and projection runtime: Redis temporal context, DAY/NOW/session envelopes, SpaceTimeDB projection, Graphiti runtime adapter, portal events, cron/context state, runtime health, and kernel envelope publication. S3' stores and projects runtime facts; S5/S5' governs their reflective meaning.

Diagram anchors consumed here are [[ARCHITECTURE-DIAGRAM-PACK#Diagram 1 System Landscape]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 5 Implementation Reality vs Canon]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. The matching MOC/type surface is `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.canvas`; shard upkeep follows [[S-SHARD-HARMONIZATION-PROTOCOL]].

VAK gate: `CPF=(4.0/1-4.4/5)`, `CT=CT1`, `CP=4.4 context`, `CF=(4.5/0) Psyche/Chronos`, `CFP=S3'`, `CS=CS3`.

## Submodules And Subcoordinates

| Coordinate | Canonical surface | Current substrate |
|---|---|---|
| `S3.0'` | protocol/runtime identity | `Body/S/S3/gateway-contract`, `Body/S/S3/gateway` |
| `S3.1'` | sessions, channels, chat projection | `Body/S/S0/epi-cli/src/gate`, `Body/S/S3/gateway/src` |
| `S3.2'` | Redis temporal context | `Body/S/S3/redis-context`, `s3'.temporal.context` |
| `S3.3'` | SpaceTimeDB projection | `Body/S/S3/epi-spacetime-module`, projection tables |
| `S3.4'` | Graphiti runtime adapter | `Body/S/S3/graphiti-runtime`, bounded S5 invocation methods |
| `S3.5'` | portal/app runtime projection | `Body/S/S3/epi-app`, M' kernel-bridge consumers |

## Internal QL 0-5 Provenance

| Internal coordinate | QL / build function | Canonical source anchor | Derivation status |
|---|---|---|---|
| [[S3.0']] | live-state ground, connection/error law, shared-field root | `Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.md` `p0_grounds`; [[P0]], [[CT0]], [[L0]] / [[L5']] | direct World ontology |
| [[S3.1']] | protocol/method manifest, reducer-owned definition law | `S3'.md` `p1_definitions`; [[S3-SPEC]] gateway-method sections | seed-side crystallisation |
| [[S3.2']] | session lineage, identity/presence, activity surfaces | `S3'.md` table families `identity_presence`, `agent_presence`, `session_surface`, `activity_event` | direct World ontology plus seed crystallisation |
| [[S3.3']] | projection/subscription pattern and visibility strategy | `S3'.md` `p3_patterns`; [[P3]], [[CT3]], [[L3]] / [[L2']] | direct World ontology |
| [[S3.4']] | [[Day]], [[NOW]], [[Kairos]], [[Graphiti]] temporal context and runtime adapter | `S3'.md` Universal NOW prose plus `Idea/Bimba/World/NOW.md` and [[S3-SPEC]] temporal sections | seed-side crystallisation |
| [[S3.5']] | shared return, continuation, collective surface readiness, M' bridge projection | `S3'.md` `p5_integrations`; [[P5]], [[CT5]], [[L5]] / [[L0']] | direct World ontology plus seed crystallisation |

## Public APIs And Gateway Methods

| Method family | Status | Owner rule |
|---|---|---|
| `s3'.kernel.envelope.publish` | native method | S3' publishes safe kernel envelopes; S5 may use as evidence |
| `s3'.temporal.context`, `s3'.temporal.subscribe`, `s3'.spacetime.subscribe` | native method list | S3' owns temporal context and projection subscription |
| `config.*`, `cron.*`, `status`, `health`, `presence.list`, `usage.*`, `system-*`, `models.list` | gateway runtime/status families | S3' owns runtime/config projection and readiness |
| `s5.episodic.*` | S3 runtime / S5 invocation | S3' runtime adapter, S5/S5' governance |

## Lifecycle, Data Shapes, Privacy

| Shape/event | Privacy | Lifecycle |
|---|---|---|
| `global_temporal_surface` | public-current safe projection | DAY/NOW/session -> Redis -> SpaceTimeDB -> M'/portal |
| `session_surface`, `kairos_surface` | public-current/protected handles | session change -> projection row -> subscription delta |
| `KernelTickEnvelope` / `KernelTemporalProjection` | public-current; no raw bioquaternion | S0 kernel -> S3' publish -> M' observe -> S5 evidence |
| Graphiti episode handle | protected-local by default | deposit/search request -> S3 adapter -> S5-governed result |

Forbidden leakage: raw journal/dream/oracle bodies, raw identity/birth data, raw Graphiti episode body, private profile masks, and protected personal graph facts.

## Integration Seams

Calls in from S0 gateway server, M' kernel-bridge, portal runtime, S4 agents needing current context, S5 Epii review, Nara personal surfaces, cron/channel adapters, and SpaceTimeDB clients. Calls out to Redis, SpaceTimeDB, Graphiti runtime, S1 Day/NOW path material, S2 graph handles, and S5 review/invocation. The seam invariant is runtime/projection here, governance elsewhere.

## M' Shell Consumed Contract Closure - Cycle 2 T12.T0

The M'-Theia shell consumes S3/S3' through one gateway WebSocket bound by [[Idea/Pratibimba/System/extensions/kernel-bridge]]'s backend service (`createGatewayWebSocket` against `EPI_GATEWAY_URL`). M-extensions receive S3' state through the single `KernelBridgeAPI` singleton fanned out by `SharedBridgeAdapter` to six subscribers; no M-extension may open a private socket or import raw `gateway-contract` clients (Track 07 T0 preflight).

| Closed S3' surface | M' read/sub call | Authority and projection |
|---|---|---|
| Temporal context | M' `cachedProfile.temporal` + `/body` `BODY_DEEP_LINK_CONTEXT_FIELDS` (`sessionKey`, `dayNow`, `profileGeneration`, `coordinate`, `reviewId`, `improvementId`, `artifactUri`, `privacyClass`) | `s3'.temporal.context` resolves DAY / NOW / Kairos / Redis temporal keys / SpaceTimeDB projection metadata / Graphiti session-arc orientation; safe-current kernel projection delivered through `portal-core::KernelTemporalProjection` |
| World clock stream | `KernelBridgeAPI.subscribeWorldClock` | `world_clock` SpaceTimeDB table; 1 Hz `advance_world_clock` reducer |
| Presence stream | `KernelBridgeAPI.subscribePratibimbaPresence` | `pratibimba_presence` table with RLS filter; `bind_pratibimba_presence` reducer |
| Shared archetype events | `KernelBridgeAPI.subscribeSharedArchetypeEvents` | opt-in `shared_archetype_event` table; `detect_coincidences` reducer at 1/min |
| Kernel envelope mirror | profile mirror surfaces `kernel_projection_json` row content from `session_surface` / `kairos_surface` / `global_temporal_surface` SubscribeMulti rows | `s3'.kernel.envelope.publish` (safe public-current; no raw bioquaternion / resonance state) |
| Subscription mode | renderer-side `onSubscriptionModeRequest` accepting `KernelBridgeSubscriptionProfile` | M' `lite` vs `full` subscription mode owned at S3' (Cross-Cutting Participation row) |

Reconnect / resubscribe: the kernel-bridge backend owns reconnect after gateway restart; the renderer-side `KernelBridgeAPI` singleton replays cached profile + connection status to late subscribers with `stale: true` until the next live observation. One SharedBridgeAdapter fan-out means one upstream resubscribe per gateway recovery regardless of how many extensions are mounted. 6/6 boundary + fan-out tests pass; `compiled KernelBridgeAPI drops forbidden private stream row bodies` is the privacy floor preventing protected M4.4.4.4 / journal / oracle row bodies from reaching the renderer.

## Cross-Cutting Participation

S3' is the center of Day/NOW/session/Continuation, clock projection, Graphiti runtime, identity-safe temporal context, SpaceTimeDB presence, gateway event vocabulary, and M' subscription mode (`lite` vs `full`).

## Open Decisions And Resolution Status

| Decision | Status | Current resolution |
|---|---|---|
| Graphiti placement | resolved | runtime adapter in S3', invocation/arc governance in S5/S5' |
| SpaceTimeDB subscription mode | active | HTTP SQL polling default; native websocket optional |
| gateway product methods vs coordinate-native methods | active | parity map is canonical bridge; S3 route table should not erase coordinate owners |
| plan back-reference edits | blocked by scope | This seed supersedes newer plan fragments; docs/plans were not edited |

## Source Coverage

| Source | mtime | Role |
|---|---:|---|
| `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md` | 2026-05-31 16:35:19 | newest gateway formal spec |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | 2026-04-04 10:46:03 | Graphiti/temporal context source |
| `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-07-s3-gateway-full-implementation.md` | 2026-03-08 23:55:30 | historical gateway plan |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md` | 2026-06-01 18:27:27 | nominal S3/SpaceTimeDB track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md` | 2026-06-02 00:17:57 | newest integration status |

## Substrate And Sibling Seeds

Body paths: `Body/S/S3/gateway-contract`, `Body/S/S3/gateway`, `Body/S/S3/redis-context`, `Body/S/S3/epi-spacetime-module`, `Body/S/S3/graphiti-runtime`, `Body/S/S3/epi-app`, `Body/S/S0/epi-cli/src/gate`.

Sibling seeds: `S3-SPEC.md`, `S3-0-SPEC.md` through `S3-5-SPEC.md`, `S3-0'-SPEC.md` through `S3-5'-SPEC.md`, `S3-SHARD-INDEX.md`, `S3-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S3'/S3'.md` mtime 2026-04-10 17:52:42 is now cited as load-bearing S3' ontology: Universal NOW, SpacetimeDB/live-state, reducer-owned transitions, presence, and visibility strategy. `Idea/Bimba/World/Types/Coordinates/S/S3/S3.md` mtime 2026-04-10 21:43:47 is the paired gateway/control-plane ground. `Idea/Bimba/World/NOW.md` and `Daily-Note.md` remain S1 forms but are S3' temporal lifecycle surfaces.
