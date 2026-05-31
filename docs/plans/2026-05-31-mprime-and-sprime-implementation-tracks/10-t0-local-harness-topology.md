# Track 10 T0 Local Harness Topology

This topology is the common local-service contract consumed by Tracks 01, 02, 03, 04, 05, and 09 before UI or agentic milestones can claim integration readiness. The machine-readable source is [[10-t0-local-harness-topology.json]].

## Operating Rule

A service is never silently assumed. Each service must be one of:

- `ready`: required paths exist and the readiness command is available.
- `skipped`: the operator intentionally set `EPI_T10_SKIP_<SERVICE_ID>` to a non-empty reason.
- `blocked`: an owner-track decision or command is not available yet.
- `missing-command`: the service cannot be started or tested because the required executable is unavailable.
- `missing-path`: the repository path needed for the service is absent.
- `not-configured`: a decision-gated service has not resolved its ADR.

Run:

```bash
node docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-validate.mjs --readiness
```

## Service Topology

| Service | Owner | Start or skip contract | First consuming tracks |
| --- | --- | --- | --- |
| Tauri app and `/body` renderer | 05 | `pnpm --dir Body/M/epi-tauri dev:renderer`; skip with `EPI_T10_SKIP_TAURI_APP=<reason>`. | 05, 06, 07, 08, 10 |
| Theia `/pratibimba/system` runtime | 05 | Decision-gated by `ADR-T10-PRD-01`; skip with `EPI_T10_SKIP_THEIA_RUNTIME=<reason>`. | 05, 07, 08, 10 |
| S3 gateway | 03 | `epi gate start --port 18794`; skip with `EPI_T10_SKIP_S3_GATEWAY=<reason>`. | 01, 03, 05, 06, 07, 08, 10 |
| SpaceTimeDB module | 03 | `cd Body/S/S3/epi-spacetime-module && spacetime publish epi-logos-runtime`; skip with `EPI_T10_SKIP_SPACETIMEDB_MODULE=<reason>`. | 01, 03, 05, 06, 08, 10 |
| S2 Neo4j, Redis, and Graphiti | 02 | `docker compose -f docker-compose.epi-s2.yml up -d --build neo4j redis graphiti`; skip with `EPI_T10_SKIP_S2_NEO4J_REDIS=<reason>`. | 02, 05, 06, 07, 08, 10 |
| S5 review and agent stores | 04 | Track 04 owns persisted runner; skip with `EPI_T10_SKIP_S5_REVIEW_STORES=<reason>` while only crate tests exist. | 04, 05, 06, 07, 08, 09, 10 |
| Vault fixture area | 05 | No daemon; run-specific folders under `Idea/Empty/Present`; skip with `EPI_T10_SKIP_VAULT_FIXTURE_AREA=<reason>`. | 05, 06, 08, 10 |

## Existing Command Anchors

Use these checked-in commands before inventing new harness wrappers:

```bash
epi graph bootstrap-dev
epi graph doctor
docker compose -f docker-compose.epi-s2.yml up -d --build neo4j redis graphiti
make verify-graphiti-live
epi gate start --port 18794
pnpm --dir Body/M/epi-tauri test
pnpm --dir Body/M/epi-tauri test:e2e
cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml
npm --prefix Body/S/S3/epi-app run test
npm --prefix Body/S/S5/epi-kbase test
```

## Reset Policy

- Tauri renderer state resets through the Track 05 e2e fixture harness; tests must not rely on user-local application state.
- Gateway and SpaceTimeDB tests reset by run/session key and must not delete unrelated rows.
- Neo4j and Redis reset through Track 02 graph-services fixtures or explicit Docker volume policy; a test must not pass against stale graph state.
- S5 tests reset by review/evidence id and must prove persisted reload, not in-memory counts.
- Vault tests may delete only the run-specific session folder under `Idea/Empty/Present/{DD-MM-YYYY}/{session}`.

## Shared Identifier Contract

Every milestone that crosses a track boundary must carry these identifiers, even if some values are typed blockers before their owner track is ready:

| Identifier | Owner | Required from | Consumer rule |
| --- | --- | --- | --- |
| `profile_generation` | 01 | 10.T1 | Same id in S0/CLI, gateway, bridge, `/body`, Theia, and M5-4 evidence. |
| `selected_coordinate` | 02 | 10.T2 | Canonical S2 coordinate plus alias/provenance; no renderer-local coordinate law. |
| `session_key` | 03 | 10.T1 | One live run identity across gateway, bridge, `/body`, Theia, and agent readers. |
| `day_now` | 05 | 10.T4 | Path-safe DAY/NOW handle only; protected body text remains local. |
| `privacy_class` | 03 | 10.T1 | Applied to rows, events, profile fields, evidence, and UI read models. |
| `s2_anchor` | 02 | 10.T2 | Graph provenance anchor for graph UI and review evidence. |
| `s3_deposition_handle` | 03 | 10.T1 | Gateway or SpaceTimeDB handle; no private content in shared rows. |
| `s5_review_evidence_id` | 04 | 10.T2 | Persisted id for S5 review/evidence/governance state. |
| `bridge_readiness` | 01 | 10.T3 | Typed bridge connectivity and upstream readiness state. |

## Required First Consumers

- Track 05 T0/T2 must consume Theia runtime, webview persistence, and local service readiness.
- Track 03 T1/T3 must consume gateway, SpaceTimeDB, privacy, and stream topology readiness.
- Track 01 T5/T6 must consume profile versioning, bridge host, and fanout readiness.
- Track 02 T0/T3 must consume graph root mapping and S2 service readiness.
- Track 04 T0/T2 must consume S5 persisted-state and evidence readiness.
