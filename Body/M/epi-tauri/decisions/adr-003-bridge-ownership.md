# ADR-05-003 — Kernel-bridge host boundary (Theia / Tauri Rust / hybrid singleton)

**Status:** Open — recorded by Track 05 T0 (2026-06-01).
**Decision register link:** `PRD-03` in `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`.
**Affected tracks:** 01, 03, 05, 06, 07, 08.

## Context

The long-lived shared `KernelBridgeAPI` instance (the one all six M-extensions, both integrated plugins, and `/body` lite mode consume) must live somewhere. Canon simultaneously names `kernel-bridge` as a first-loaded Theia extension AND requires `/body` lite mode to share the same instance. These cannot both be true under a pure Theia-owned model.

## Options

1. **Pure Theia extension host** — Bridge lives as a Theia DI singleton, exposed to `/body` via a Tauri command bridge.
2. **Tauri-owned service** — Bridge lives as a Tauri Rust service exposed to both Theia (via WebSocket/IPC adapter) and `/body` (via Tauri invoke).
3. **Hybrid Tauri singleton + Theia-native `KernelBridgeAPI` adapter** — One Rust singleton in Tauri owns the upstream S0/S2/S3/S5 subscriptions; Theia consumes it via a typed `KernelBridgeAPI` adapter contributed at Theia DI level; `/body` consumes the same singleton via Tauri invoke.

## Recommended default if safe

Option 3 (hybrid). It best satisfies:

- **One-app shared instance** — single source of truth for profile generation, session, observability stream.
- **`/body` lite mode** — Tauri invoke is already wired (see existing `gatewayClient.ts`, `temporalClient.ts`).
- **Theia DI consumption** — extensions get the API the same way they would in pure Option 1.
- **Background lifecycle** — Tauri owns the long-lived process; webviews can come and go without dropping the bridge.

## Prototype acceptance criteria

Track 05 T3 (Shared Kernel-Bridge Adapter) must, before being marked unblocked:

- Implement contract tests against the Track 01 `KernelBridgeAPI` from `07-t0-extension-contract-preflight.json#sharedBridgeAdapter.requiredCapabilities`.
- Prove **one** S3/SpaceTimeDB subscription fans out to both `/body` and Theia (`subscribeRunEvents`, `onMathemeHarmonicProfile`, `onConnectionStatusChange`, `onObservabilityEvent`).
- Test background/foreground upgrade-downgrade cycles (Theia closed → bridge state preserved → Theia reopened → no duplicate subscriptions).
- Record this ADR closure before downstream extension APIs freeze.

## Hard dependencies

This ADR is GATED on:

- Track 01 T5 `kernel-bridge` contract package landing.
- Track 03 T1–T5 gateway/SpaceTimeDB readiness.
- ADR-05-001 (Theia runtime mode) — if Option 1 wins (browser-mode in webview), Tauri-native singleton needs IPC bridge; if Option 3 wins (Electron sidecar), bridge ownership becomes a process-boundary question rather than an in-process one.

## Consequence of delaying

Tracks 06–08 can define against an API seam but cannot finalize subscription economy, background behavior, or performance/privacy claims. Track 09 (Mediation) cannot bind real `invokeGatewayRpc` capabilities until this lands.

## Cross-references

- `07-t0-extension-contract-preflight.json#sharedBridgeAdapter` — the API shape this ADR is choosing a host for.
- `08-t0-composition-contract-preflight.json#sharedRules` — both integrated plugins consume the same bridge declared by 07.T0.
- `Body/S/S5/epii-agent/contract-ledger/track-09-preflight.json` — Track 09 mediation consumes `invokeGatewayRpc` and `subscribeRunEvents` through this seam.
