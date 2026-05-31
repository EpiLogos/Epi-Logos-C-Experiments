# ADR-05-001 — Theia runtime mode (Browser-mode-in-webview vs supervised localhost vs Electron sidecar)

**Status:** Open — recorded by Track 05 T0 (2026-06-01).
**Decision register link:** `PRD-01` in `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`.
**Affected tracks:** 01, 05, 06, 07, 08.

## Context

Can Theia browser-mode run directly inside Tauri v2 Wry/WebKit with required workers, IndexedDB, asset paths, CSP, extension-host behavior, WebSockets, and IPC — or does production require a Tauri-supervised localhost Theia server, or a Tauri-spawned Theia Electron sidecar?

This decides bundle shape, security review, offline behavior, startup time, port management, process supervision, and whether the IDE is truly one Tauri product or a second app.

## Options

1. **Bundled browser-mode-in-webview** — Theia browser-mode assets bundled into the Tauri build and loaded via `frontendDist`/`asset://` protocol.
2. **Tauri-supervised localhost Theia server** — Tauri spawns a local Theia browser-mode server and the webview navigates to it.
3. **Tauri-spawned Theia Electron sidecar** — Treat Theia as a separate Electron app the Tauri app launches.

## Recommended default if safe

Prototype Option 1 first. Fallback to Option 2 if direct asset loading fails (workers, IndexedDB, CSP). Treat Option 3 as last resort because it loses the one-Tauri-product property.

## Prototype commands and acceptance criteria

The Track 05 T2 prototype must:

- Launch Tauri.
- Open `/body` (existing Vite+React).
- Summon a real Theia workbench (any configuration of the three options).
- Activate a readiness contribution.
- Exercise: Workers, IndexedDB, CSP, WebSocket (against `epi gate`), Tauri IPC.
- Record results as an ADR amendment with concrete `pass`/`fail` per behavior.
- Persist port choices and CSP shape as repository config (not ad hoc).

## Consequence of delaying

Build scripts, CSP, deep-link verification, Theia version pin, and extension test harnesses remain unstable. Tracks 06–08 cannot finalize subscription economy, background behavior, or performance/privacy claims.

## Cross-references

- `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md` sections 1, 9.
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` sections 3, 4, 5.
- `Body/M/epi-tauri/contract-inventory/track-06-baseline.json` (current renderer baseline).
- `Idea/Pratibimba/System/extensions/contracts/07-t0-extension-contract-preflight.json` (downstream extension shape).
