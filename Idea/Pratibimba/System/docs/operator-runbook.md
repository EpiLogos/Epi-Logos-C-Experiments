# Pratibimba System Operator Runbook

**Status:** Canonical (Track 05 T9)
**Audience:** Developers + operators running the Theia-based Pratibimba System locally, in CI, or in Docker.
**Authoritative ADR:** [ADR-05-011 — Track 05 release gate close](./decisions/adr-05-011-release-gate-close.md)

## Quick reference

| Task | Command |
|------|---------|
| Install workspace dependencies | `cd Idea/Pratibimba/System && pnpm install` |
| Build everything | `cd Idea/Pratibimba/System && pnpm -r build` |
| Smoke-build the Theia bundle | `bash Idea/Pratibimba/System/scripts/smoke-build.sh` |
| Run all package tests | `cd Idea/Pratibimba/System && pnpm test` |
| Start Theia in browser mode | `cd Idea/Pratibimba/System && pnpm --dir theia-app start` |
| Start Theia in Electron mode (canonical user-facing build) | `cd Idea/Pratibimba/System && pnpm --filter @pratibimba/electron-app start` |
| Run acceptance harness (dry-run) | `node Idea/Pratibimba/System/extensions/acceptance-harness/scripts/acceptance.mjs --dry-run` |
| Run acceptance harness (live, browser) | Start services per §2; then `node ...acceptance.mjs --browser` |
| Run acceptance harness (live, Electron) | Start services per §2; then `node ...acceptance.mjs --electron` |

## 1. Development workflow

### Workspace layout

```
Idea/Pratibimba/System/
  theia-app/                     # Browser-mode entry (CI + Docker headless)
  electron-app/                  # Electron entry (canonical user-facing)
  extensions/
    kernel-bridge/               # KERNEL_BRIDGE_API + runtime adapter (T3)
    kernel-bridge-readiness/     # Readiness diagnostic pane
    m-extension-runtime/         # Shared SharedBridgeAdapter + contracts
    pratibimba-layouts/          # daily-0-1 + ide-deep layout switcher
    omnipanel-shell/             # OmniPanel canonical command membrane (T5)
    m0..m5/                      # Individual M-extension widgets (T6)
    integrated-composition/      # Layout claim + composition coordinator
    plugin-integrated-1-2-3/     # Anuttara+Paramasiva+Parashakti integrated plugin
    plugin-integrated-4-5-0/     # Nara+Epii+0/1 integrated plugin
    ide-shell-m0-m5/             # M0/M5 IDE chrome (T4) — graph, Canon Studio, etc.
    agentic-control-room/        # Run flow (T8) — VAK, run tree, evidence, review
    acceptance-harness/          # T9 acceptance harness + release gate
    contracts/                   # 07.T0 / 08.T0 contract preflight files
    test/                        # Cross-extension tests (Thread C's lane)
    scripts/                     # Smoke build + verification scripts
```

### Common development commands

```bash
# Install (top-level — uses pnpm workspaces)
cd Idea/Pratibimba/System
pnpm install

# Build a single extension
pnpm --filter @pratibimba/ide-shell-m0-m5 build

# Watch + rebuild on file changes
pnpm --filter @pratibimba/ide-shell-m0-m5 watch

# Test a single extension
pnpm --filter @pratibimba/agentic-control-room test

# Build everything
pnpm -r build

# Run the cross-extension contract test suite (Thread C surface)
pnpm test:contracts
```

## 2. Local service topology

The Pratibimba System depends on the following external services. Per
`Body/M/epi-tauri/decisions/track-05-t0-runtime-baseline.json` and the
acceptance harness plan (`extensions/acceptance-harness/src/common/acceptance-plan.ts`):

| Service | Purpose | Start command | Default endpoint | Required for |
|---------|---------|---------------|------------------|--------------|
| gateway | S3 gateway RPC + event multiplexer | `cargo run --manifest-path Body/S/S3/gateway/Cargo.toml` | `ws://127.0.0.1:18794` (kernel-bridge), `http://127.0.0.1:18794/_health` | All Theia surfaces |
| spacetimedb | Native presence + world_clock subscription | `docker compose -f docker-compose.epi-s2.yml up -d spacetimedb` | per compose file | T3+ |
| neo4j | S2 bimba graph | `docker compose -f docker-compose.epi-s2.yml up -d neo4j` | `bolt://127.0.0.1:7687` | Bimba graph viewer, coordinate tree |
| redis | S2 semantic cache + S3 redis-context | `docker compose -f docker-compose.epi-s2.yml up -d redis` | `redis://127.0.0.1:6379` | Semantic search surfaces |
| graphiti | Protected episode/memory boundary | `docker compose -f docker-compose.epi-s2.yml up -d graphiti` | per compose file | M4 surfaces (gated) |
| s5_persisted_stores | Real S5 review/autoresearch persistence | (Track 04 harness — not yet a single command) | filesystem persistence | Review pane, autoresearch pane |

Environment variables the live build respects:

| Variable | Default | Purpose |
|----------|---------|---------|
| `EPILOGOS_NEO4J_URI` | `bolt://127.0.0.1:7687` | S2 graph backend |
| `EPILOGOS_SEMANTIC_CACHE_REDIS_URL` | `redis://127.0.0.1:6379` | Semantic cache |
| `EPI_GRAPH_LIVE` | unset | Set to enable live-Neo4j gated integration tests |
| `KERNEL_BRIDGE_GATEWAY_URL` | `ws://127.0.0.1:18794` | Kernel-bridge upstream |

## 3. Running the Theia shell

### Electron mode (canonical user-facing build)

```bash
cd Idea/Pratibimba/System
pnpm --filter @pratibimba/electron-app start
```

Expected behavior:
- Cold start under ~2 seconds.
- Mounts the `daily-0-1` layout by default.
- Status bar shows `KernelBridge: connected` when the gateway is reachable.
- Pressing the OmniPanel keybind summons the command membrane.

### Browser mode (CI + Docker headless parity)

```bash
cd Idea/Pratibimba/System
pnpm --dir theia-app start
```

Opens at `http://127.0.0.1:3000`. Use this for headless / CI / Docker runs.

## 4. Kernel-bridge readiness check

Open the **Kernel Bridge Readiness** pane (right area, opens by default).
The pane shows:

- Bridge subscription status (`connecting` / `connected` / `disconnected` / `reconnecting`).
- Latest profile generation and staleness.
- Active subscription mode (`lite` / `full`).
- Upstream subscription count (should be exactly 1 across layout switches).

If `Upstream subscription count` > 1 after a layout switch, the kernel-bridge
DI singleton has been duplicated — file a bug.

## 5. Native SpaceTimeDB lane

When running the Track 03 native SpaceTimeDB lane, set:

```bash
export EPI_SPACETIMEDB_NATIVE=1
docker compose -f docker-compose.epi-s2.yml up -d spacetimedb
cargo run --manifest-path Body/S/S3/gateway/Cargo.toml
```

The gateway exposes the native WebSocket subscription mode; the kernel-bridge
runtime source detects it and reports `subscriptionMode: 'native-websocket'`
in the readiness pane.

## 6. Graph lane (S2 + Neo4j)

To exercise the live Bimba graph viewer:

```bash
docker compose -f docker-compose.epi-s2.yml up -d neo4j redis
cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml
```

In the IDE, open the Bimba Graph Viewer and dispatch
`pratibimba.intent.open-graph-node` with a coordinate (e.g. `#0`, `M0`,
`M5.epii`). The viewer issues `s2.graph.node` via the kernel-bridge.

## 7. S5 persisted store lane

Track 04 owns the S5 persisted store harness. To verify the review + auto-
research surfaces with live data:

```bash
cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml
cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml
```

Both should pass 6/6 + n/n.

## 8. Acceptance harness

The acceptance harness extension (`@pratibimba/acceptance-harness`) provides:

1. **A Theia-side widget** ("Acceptance Harness" in the right area) that an
   operator opens and clicks "Run acceptance plan".
2. **A Node-driven script** at
   `extensions/acceptance-harness/scripts/acceptance.mjs` that an operator or
   CI job invokes to drive the full plan and produce a JSON receipt.

### Dry-run (CI-safe, no services required)

```bash
node Idea/Pratibimba/System/extensions/acceptance-harness/scripts/acceptance.mjs --dry-run
```

Produces a JSON receipt to stdout listing the services + steps + privacy
audit surfaces. Exits 0 if the plan parses cleanly.

### Live run (operator-driven)

1. Start the services per §2.
2. Confirm gateway health: `curl -s http://127.0.0.1:18794/_health`
3. Run the harness:

   ```bash
   node Idea/Pratibimba/System/extensions/acceptance-harness/scripts/acceptance.mjs --browser
   ```

4. The harness launches the Theia process, parses stdout for `[ACCEPTANCE:<step-id>:<key>=<value>]` handles, and writes a JSON receipt to
   `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/acceptance-receipt-<timestamp>.json`.

A passing receipt has every step recorded as `done` with the documented
handles + `bridge-subscription-stable=true`.

## 9. Privacy audit

The IDE shell's privacy audit is structural — every chrome widget refuses
forbidden privacy classes at the render gate. After a live acceptance run,
the following surfaces MUST be inspected for protected payload leakage:

- Theia widget render state (every `data-privacy-class` attribute in the
  DOM should be in `ALLOWED_PRIVACY_CLASSES`)
- SpaceTimeDB rows the renderer subscribed to (per gateway tracelog)
- Graph payloads delivered via kernel-bridge (per gateway dispatch log)
- Theia console + log output
- S5 evidence envelope persisted state
- Workspace-state file on disk

`FORBIDDEN_PRIVACY_CLASSES` (from `@pratibimba/ide-shell-m0-m5/contract.ts`):

```
private
protected
restricted-graphiti-body
protected-nara-body
private-journal
private-birth-data
private-quaternion
private-profile
```

Each chrome widget exposes `data-test="*-privacy-dropped"` showing how many
payloads were refused; expected zero after a passing acceptance run.

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `KernelBridge: disconnected (not yet connected)` | Gateway not running | Start gateway per §2 |
| `Canon Studio: no vault-bridge registered` on save | T4.5 vault-bridge not yet landed (expected) | This is the documented gate; do not bypass |
| Theia bundle missing extension chunk | Build cache stale | `pnpm -r clean && pnpm -r build && bash scripts/smoke-build.sh` |
| `cannot start run: candidate, route, actor must all be selected` | Agentic Control Room state not set | Pick a candidate, then route+actor, before clicking Start |
| Bridge subscription count > 1 after layout switch | DI singleton duplicated | File a bug; rerun smoke-build to confirm chunks didn't change |
| Privacy-dropped count > 0 after passing acceptance run | Real privacy leak — investigate immediately | Inspect the offending widget's gateway response; do not ship |
| `cargo test` fails offline | Crate registry cache missing | Run once with network: `cargo fetch --manifest-path <Cargo.toml>` |
