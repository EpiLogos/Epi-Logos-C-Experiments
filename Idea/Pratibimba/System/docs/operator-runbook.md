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
   `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/acceptance-receipt-<timestamp>.json`.

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

## 11. S/S' Modularity Update — 2026-06-02

**Track 13 closed (2026-06-02).** S0 is now formally **the membrane**:
operator CLI + gateway process bootstrap + named adapters into
Body-native authorities. S0 does NOT carry downstream service law
(route definitions, runtime handlers, graph mutation, governance
policy, vault writes that bypass Hen, or capability-matrix law).

### Routing rule for future work

When planning a new feature or refactor, **route to the Body-native
owner first** based on the surface:

| Surface | Body-native owner | S0 touched only if... |
|---------|-------------------|------------------------|
| Vault read / write / rename / move / frontmatter / semantic | `Body/S/S1/hen-compiler-core` (via Hen-gateway `s1'.{vault,semantic}.*`) | New gateway adapter row in `Body/S/S0/epi-cli/src/gate/s1_hen.rs` |
| Graph mutation, retrieval, semantic cache, doctor, sync | `Body/S/S2/graph-services` | New CLI parsing / render arm in `Body/S/S0/epi-cli/src/graph/mod.rs` (re-exports otherwise) |
| Sessions, chat, channels, SpaceTimeDB subscription, dispatch routes | `Body/S/S3/{gateway, gateway-contract, epi-spacetime-module}` | Process host wiring in `Body/S/S0/epi-cli/src/gate/{server, spacetimedb_bridge}.rs` |
| Anima / VAK / capability-matrix / dispatch tools / psyche | `Body/S/S4/{ta-onta, plugins/pleroma, pi-agent}` | Gateway adapter row in `Body/S/S0/epi-cli/src/gate/anima.rs` (must stamp `S4_AUTHORITY_ORIGIN`) |
| Review submit / inbox / resolve / improvement propose / promote / Epii agent access / Graphiti deposit | `Body/S/S5/{epii-review-core, epii-autoresearch-core, epii-agent-core}` + `Body/S/S3/graphiti-runtime` | Thin adapter row in `Body/S/S0/epi-cli/src/gate/{review, improve, epii, graphiti}.rs` (must delegate, must not duplicate governance policy) |
| CLI commands, device / cron / wizard / health / talk / voicewake / browser | `Body/S/S0/epi-cli` IS authority | All work lands here |

**Test gate.** Any new S0 module under a law zone (`src/gate/`,
`src/graph/`, `src/vault/`, `src/core/`) must pass the
`s0_membrane_guardrails` axis 1 scanner. The module either (a) gets
an inventory entry in
`Body/S/S0/epi-cli/contract-inventory/s0-membrane-inventory.json`, or
(b) carries a canonical `// S0 ADAPTER: Body/S/<...>` annotation, or
(c) is a pure re-export (`pub use epi_s1_…` / `epi_s2_…` /
`epi_s3_…` / `epi_s4_…` / `epi_s5_…` / `epi_kbase_…` / `epii_…` /
`portal_core::…`), or (d) is in the `baseline_cli_glue_modules()`
allowlist with a justification comment. A new law-zone module that is
none of the above fails CI.

### CI enforcement layer

The canonical CI enforcement is the **`s0_membrane_guardrails` test
suite** at `Body/S/S0/epi-cli/tests/s0_membrane_guardrails.rs` (8
tests across four guardrail axes: downstream-law scanner, S4 schema
detector, S5 schema detector, negative-fixture rejection) plus its
two appended companions in `Body/S/S3/gateway/tests/dispatch_contract.rs`
(`t9_route_ownership_cross_walk`) and
`Body/S/S2/graph-services/tests/graph_runtime_extraction_contract.rs`
(`t9_graph_law_types_do_not_resolve_to_epi_logos_graph_namespace`).

If the guardrail suite is ever marked `#[ignore]` or removed, the
entire S/S' modularity contract becomes a soft recommendation. Treat
those tests as load-bearing.

Run locally:

```bash
cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml \
    --test s0_membrane_guardrails
cargo test --offline --manifest-path Body/S/S3/gateway/Cargo.toml \
    --test dispatch_contract
cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml \
    --test graph_runtime_extraction_contract
```

### Per-family modularity ledger

For the full method-family-by-method-family ledger (current S0
responsibility, Body-native authority, remaining compatibility shims,
removal timetable), see
[`Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/13-t10-modularity-report.md`](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/13-t10-modularity-report.md).

### Follow-up backlog

Track 13 closed with 10 catalogued follow-up tranches (FU-T6-A..E,
FU-T7-A..B, FU-T8-A, FU-T9-A..B) — extractions that anima's 09.T7
lane prevented during T6/T7, deferred Track 03 T6.5 surfaces, and
inventory drift surfaced by T9. See §5 of the modularity report for
ids + blockers.

