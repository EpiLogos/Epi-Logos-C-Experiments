# Runtime And Startup Audit

## Canonical Contract

The carrier contract says:

- one Tauri v2 binary;
- gateway and face form one supervised organism;
- boot equals supervise;
- the face cannot open without the organism;
- one singleton gateway is adopted if live and spawned only if absent;
- one shared profile heartbeat drives the product.

Sources: `Body/M/pratibimba-app/AGENTS.md` (line 4), [[M'-SYSTEM-SPEC]] (lines 611-635), and [[2026-07-02-pratibimba-app-phase-1]] (lines 29-63).

## Observed Native Failure

The local saved config is:

```json
{
  "vaultRoot": "/Users/admin/Documents/Epi-Logos C Experiments/Idea",
  "epiBin": "/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-cli/target/debug/epi"
}
```

The repository now uses the shared Cargo pool. The real binary is:

```text
/Users/admin/Documents/Epi-Logos C Experiments/target/debug/epi
```

The configured per-workspace binary no longer exists.

`supervisor::epi_binary()` resolves in this order (`supervisor.rs:84-100`):

1. `EPI_BIN` environment variable;
2. saved `~/.epi/app/config.json` `epiBin` string;
3. literal `epi` on PATH.

It does not validate that the saved path exists, is executable, reports a compatible version, or can satisfy `gate start`. A stale non-empty config therefore blocks both the repository binary and the valid `/Users/admin/.cargo/bin/epi` PATH fallback.

Observed result after `pnpm tauri dev`:

- the native app process opened;
- port 18794 remained closed;
- no `.epi/gate/up/gateway-process.json` was created;
- the face remained available in a degraded/pending state.

This directly violates "the face cannot open without the organism."

## Why The Boot Gate Passes Anyway

`pnpm smoke` runs three sequential stages:

1. `scripts/tauri-boot-smoke.mjs`;
2. `scripts/boot-smoke.mjs`;
3. `gatewayClient.live.test.ts`.

The first stage launches the native app but passes as soon as the renderer reports a non-zero FlexLayout receipt. It does not require:

- supervisor state `supervised|external`;
- port 18794 open;
- a profile generation received by that native renderer;
- the gateway PID or binary selected by the supervisor;
- required service readiness.

Observed native receipt:

```text
[tauri-boot-smoke] READY {"face":"1","layout":"daily-0-1","width":1261,"height":715}
[tauri-boot-smoke] PASS native shell committed ...
```

Immediately after that pass, port 18794 was closed and the process record was absent.

The second stage independently launches `repoRoot/target/debug/epi` on test port 18797. It does not exercise the native supervisor's saved-binary resolution. That independent stage passed with generations `2 -> 3 -> 4`.

The suite therefore proves two disconnected facts:

- a native shell can mount;
- a separately launched correct gateway binary can tick.

It does not prove the product organism boots.

## Startup Ownership Map

| Runtime dependency | Normal native startup | E2E harness | Product status |
|---|---|---|---|
| Tauri shell | Starts | Replaced by browser preview | Live |
| Vault watcher | Starts when root resolves | Real filesystem sidecar | Live, but different path in E2E |
| Gateway | Supervisor attempts spawn/adopt | Global setup launches known binary | Broken locally by stale binary config |
| Kernel/profile | Reached through gateway | Reached through spawned gateway | Live when gateway is correct |
| Redis | Connected if available; file fallback | Not product-supervised | External/optional |
| Neo4j | Probed by gateway | Harness-dependent | External; no owned startup |
| Graphiti | Separate explicit Docker command | Not normal app boot | External; no owned startup |
| SpaceTimeDB | Environment-discovered registration | Harness/environment-dependent | External; no owned startup |
| Agent workers | Separate CLI/runtime actions | Fixtures or gateway paths by suite | Not product-supervised |
| [[S5]] review/improve stores | Reached by gateway methods when present | Often seeded for tests | No unified startup receipt |

Normal `pnpm dev` is renderer-only and correctly should not be confused with product startup. The problem is that native startup also lacks an owned readiness graph beyond one gateway process attempt.

## Additional Runtime Risks

### Face Opens Before Minimum Readiness

`src-tauri/src/lib.rs:17-56` starts the supervisor asynchronously in `setup()` and immediately continues shell construction. There is no pre-window readiness barrier. The canonical phrase "face cannot open without organism" is not implemented as control flow.

### Singleton Lifecycle Contradiction

The phase plan states that the singleton gateway must never be killed implicitly, while `supervisor::shutdown()` kills the child the app spawned on every Tauri exit (`supervisor.rs:260-269`). Earlier task prose also says the supervised child is killed on app exit. This lifecycle policy is internally contradictory and must be decided explicitly:

- app-owned child with app-owned lifetime; or
- system singleton with independent lifetime and adoption.

The current code and docs claim both.

### No Stale-Config Migration

The root Cargo pool migration is a known repository-wide decision, but the carrier has no migration from old per-workspace `epiBin` paths. A product update can therefore invalidate its own saved launcher path permanently.

### TCP-Open Is Too Weak As Readiness

The supervisor classifies a gateway as healthy when the TCP port accepts connections. It does not verify protocol, version, capability manifest, profile stream, or required service state. An unrelated listener or a partially initialized gateway can be classified `external`/`supervised`.

### Optional And Required Services Are Not Distinguished Product-Wide

The app has many local readiness badges, but no single typed startup contract tells the user which services are:

- required for the shell;
- required for a selected workspace;
- optional/degraded;
- unavailable with a repair action;
- blocked by privacy or governance rather than infrastructure.

### Harness State Is Stronger Than Product State

Playwright global setup builds the correct CLI, starts a dedicated gateway, starts a filesystem sidecar, seeds a temporary vault, and injects browser-only endpoints. Those are valuable UI-flow tests, but they create a healthier environment than normal native startup.

## Required Runtime Architecture

### One Desktop Runtime Profile

Introduce one owned runtime entrypoint, for example:

```text
epi app up --profile desktop --json
```

It should resolve, start/adopt, and report the dependency graph. Tauri should supervise that one contract rather than independently knowing how each service starts.

### Validated Binary Resolution

Resolution should be:

1. explicit `EPI_BIN` if executable and compatible;
2. saved config path if executable and compatible;
3. repo-root shared `target/debug/epi` or release bundle when running a source checkout;
4. PATH `epi` if executable and compatible;
5. actionable blocked state.

On a stale saved path, the app should migrate or offer a one-click repair. It must not silently stop at the broken string.

### Typed Startup State Machine

```text
resolving_runtime
-> starting_gateway
-> protocol_handshake
-> awaiting_profile
-> probing_required_services
-> ready | degraded | blocked
```

Each service receipt should carry:

```text
id, owner, requiredFor, state, since, detail, version,
capabilities, recoveryAction, evidenceHandle
```

### Window Gate

Do not reveal the normal workbench until the minimum contract is met:

- runtime resolved;
- gateway protocol handshake succeeds;
- first valid profile generation arrives;
- vault root resolves or the user selects one.

Show a compact startup/repair surface meanwhile. Optional Neo4j, Graphiti, SpaceTimeDB, Redis, and external providers may produce a clearly named degraded state after the minimum contract is live.

### Product-Native Verification

Replace the disconnected smoke proof with a native receipt that includes:

- binary path and version selected by the supervisor;
- gateway PID/lifecycle mode;
- port and protocol version;
- first profile generation observed by the native renderer;
- required-service summary;
- mounted workbench dimensions;
- failure when stale config prevents supervision.

The separate gateway smoke remains useful as a gateway test. It must no longer be described as proof that the native organism booted.

## Runtime Verdict

Current state: **P0 production blocker**.

The gateway and profile substrate can run. The app's normal startup path cannot currently be trusted to start it, and the existing native boot gate gives a false positive for exactly this failure.
