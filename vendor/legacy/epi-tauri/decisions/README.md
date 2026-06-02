# Track 05 Decision Harness

Implementation ADRs and runtime-baseline ledger for the Tauri IDE shell + `/pratibimba/system` track.

## Files

- [`track-05-t0-runtime-baseline.json`](./track-05-t0-runtime-baseline.json) — machine-readable runtime baseline: build topology, cross-references to sibling preflights (06/07/08/09), ADR set, tranche dependency map, local-dev topology.
- [`adr-001-theia-runtime-mode.md`](./adr-001-theia-runtime-mode.md) — PRD-01. Browser-mode-in-webview vs supervised localhost vs Electron sidecar.
- [`adr-002-single-vs-multi-webview.md`](./adr-002-single-vs-multi-webview.md) — PRD-02. Single-webview navigation vs multi-webview persistence vs tray/background.
- [`adr-003-bridge-ownership.md`](./adr-003-bridge-ownership.md) — PRD-03. Theia / Tauri Rust / hybrid singleton for the long-lived `KernelBridgeAPI` instance.

All three ADRs are **Open** at 05.T0. Track 05 T2 prototype work closes them with concrete amendments.

## Verification

- `pnpm --dir Body/M/epi-tauri test` → vitest 17/17 (verified at 06.T0).
- `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml` → 44/44 (verified at 06.T0).
- ADRs name selected prototype commands, ports, CSP requirements, service deps, pass/fail criteria.
- No downstream Theia tranche is marked unblocked unless its Track 01–04 dep is implemented or marked readiness-blocked.

## Cross-references

| Track | Artifact | Relationship |
| --- | --- | --- |
| 01.T0 | `Body/S/S0/portal-core/contract-inventory/baseline-profile.json` | Real-code-generated profile fixture this track's bridge surfaces. |
| 02.T0 | `Body/S/S2/graph-schema/contract-inventory/track-02-authority-drift.json` | Schema versions + registry/seed drift; downstream subgraph payload shape. |
| 06.T0 | `Body/M/epi-tauri/contract-inventory/track-06-baseline.json` | Renderer/command/service-client baseline inherited here. |
| 07.T0 | `Idea/Pratibimba/System/extensions/contracts/07-t0-extension-contract-preflight.json` | Six individual extension contracts over `KernelBridgeAPI`. |
| 08.T0 | `Idea/Pratibimba/System/extensions/contracts/08-t0-composition-contract-preflight.json` | Two integrated plugins composing over the same bridge. |
| 09.T0 | `Body/S/S5/epii-agent/contract-ledger/track-09-preflight.json` | Mediation surface that consumes the bridge's capabilities. |
| 10.T0 | `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-*` | Cross-cutting integration ADR bundle + local-harness topology. |
