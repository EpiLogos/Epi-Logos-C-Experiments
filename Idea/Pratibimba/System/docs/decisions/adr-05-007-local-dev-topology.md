# ADR-05-007 — Local-dev topology and readiness contract

**Status:** Decided 2026-06-01
**Decision register:** DSD-01 (live local-service harness)
**Affected tracks:** 05, 01 (kernel-bridge), 03 (gateway/STDB), 02 (graph), 04 (S5)
**Predecessor:** [`Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json#local_dev_topology`](../../../../Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json) — partially captured the topology under the pre-recast assumption that Tauri owned the renderer.

## Context

Theia at `/pratibimba/system` consumes the external `Body/S/S3/gateway` Rust process via WebSocket/JSON-RPC. The gateway in turn talks to SpaceTimeDB, Neo4j, Redis, and S5 persisted stores. The recast canon places authority outside the Theia process — Theia is a thin client of substrate services.

This ADR records (a) which local services must be running for which Theia tranche to function, (b) the env-var contract that Theia uses to discover them, and (c) the readiness check the kernel-bridge runs at boot.

## Decision

### Service topology

| Service | Local-dev port | Owner | Required for tranches | Env var |
|---|---|---|---|---|
| Theia browser app (dev) | 3000 | this track | T1+ | — |
| Theia Electron app (dev) | n/a (Electron window) | this track | T1+ | — |
| `Body/S/S3/gateway` (Rust WS/JSON-RPC) | 8765 | Track 03 | T3+ | `EPI_GATEWAY_URL` (default `ws://127.0.0.1:8765`) |
| SpaceTimeDB | 3001 | Track 03 | T3+ | `EPI_SPACETIME_URL` (default `http://127.0.0.1:3001`) |
| Neo4j | 7687 (bolt) | Track 02 | T4 (M0 graph viewer) + T6 (M extensions) | `EPI_GRAPH_URL` (default `bolt://127.0.0.1:7687`) |
| Redis (semantic cache) | 6379 | Track 02/04 | T4+, optional | `EPI_SEMANTIC_CACHE_URL` (default `redis://127.0.0.1:6379`) |
| S5 persisted store (filesystem path) | n/a | Track 04 | T8 (Agentic Control Room E2E) | `EPI_S5_STATE_DIR` (default `~/.epi-logos/s5-state`) |

> **Theia does not reach these directly.** Theia talks to the gateway only. The gateway talks to STDB / Neo4j / Redis / S5. The env vars above are read by the **gateway**, not Theia. Theia reads `EPI_GATEWAY_URL` to find the gateway.

### Startup ordering

For development:

1. **Substrate first** (any order):
   - Neo4j (`neo4j start`)
   - SpaceTimeDB (`spacetime start`)
   - Redis (`redis-server`)
2. **Gateway**: `cargo run --manifest-path Body/S/S3/gateway/Cargo.toml` — must come up after substrate; reads env vars above; emits ready log when it can reach all substrate services.
3. **Theia**: `pnpm --dir Idea/Pratibimba/System start` (browser mode) or the Electron entrypoint. Reads `EPI_GATEWAY_URL`. Mounts `daily-0-1.layout` by default.

The gateway is the readiness fulcrum. Theia surfaces "gateway unreachable" / "gateway present, substrate not ready" / "ready" without trying to talk to substrate directly.

### Readiness contract (consumed by `kernel-bridge-readiness` extension)

The kernel-bridge-readiness Theia extension queries the gateway's readiness endpoint at boot. The expected response shape (subject to refinement by Track 03):

```ts
type GatewayReadiness = {
  generation: number;                  // monotonic, bumped on every substrate change
  status: 'ready' | 'degraded' | 'blocked';
  substrate: {
    spacetime: SubstrateState;
    graph: SubstrateState;
    semantic_cache?: SubstrateState;
    s5_state: SubstrateState;
  };
  blockers: string[];                  // human-readable blocker descriptions
  capability_manifest_version?: string;
};

type SubstrateState = {
  status: 'ready' | 'reconnecting' | 'unreachable' | 'protocol_mismatch';
  last_check_at: string;               // ISO-8601
  details?: string;
};
```

The existing `extensions/kernel-bridge-readiness/src/common/readiness-types.ts` is the authoritative TypeScript surface; this ADR fixes the *expected response shape from the gateway* that the readiness source consumes. Track 03 owns the gateway implementation.

### Per-tranche service requirement matrix

| Tranche | Required services | Optional services |
|---|---|---|
| T1 (Theia skeleton) | none (gateway URL config only) | — |
| T2 (migration + layouts) | none | — |
| T3 (kernel-bridge ext) | gateway, SpaceTimeDB | — |
| T4 (M0/M5 IDE chrome) | gateway, Neo4j, SpaceTimeDB | Redis |
| T5 (OmniPanel + lifecycle) | gateway | — |
| T6 (6 M extensions) | gateway, Neo4j, SpaceTimeDB | Redis |
| T7 (integrated plugins) | gateway, Neo4j, SpaceTimeDB, Track 12 cymatic substrate | Redis |
| T8 (agentic E2E) | gateway, Neo4j, SpaceTimeDB, S5 state dir | Redis |
| T9 (acceptance) | All of the above | — |

### Failure modes Theia must surface

The 0/1 daily layout's status display contribution and the kernel-bridge readiness panel must distinguish these conditions:

- **Gateway URL unset / wrong** → "Gateway URL not configured" with the env-var hint.
- **Gateway URL set, gateway not reachable** → "Gateway unreachable" with retry policy.
- **Gateway reachable, substrate not ready** → per-substrate blocker rows.
- **Protocol-version mismatch** → "Gateway version incompatible" with the expected/actual version pair.
- **Ready** → green; current generation visible.

These map to the existing `extensions/kernel-bridge-readiness/src/common/readiness-types.ts` enum, which T3 will extend if Track 03's contract diverges.

## Consequences

- T1 wires the `EPI_GATEWAY_URL` env-var read into `theia-app`'s Theia configuration.
- T3 implements the kernel-bridge backend module that uses this URL.
- T9 acceptance harness scripts assume the topology above and start services in the declared order.
- Future Docker / CI tooling (ADR-05-006) consumes the same env-var contract.

## Cross-references

- [`Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json#local_dev_topology`](../../../../Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json) — predecessor topology (Tauri-era).
- [docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md) — gateway contract source.
- [docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-local-harness-topology.{md,json}](../../../../docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-local-harness-topology.md) — cross-cutting local-harness topology.
