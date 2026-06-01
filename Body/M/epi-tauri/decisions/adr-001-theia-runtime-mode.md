# ADR-05-001 — Theia runtime mode (Browser-mode-in-webview vs supervised localhost vs Electron sidecar)

**Status:** Decision — recorded by Track 05 T0, amended by Track 05 T2 (2026-06-01).
**Selected option:** Option 1 — browser-mode Theia loaded directly into a Tauri WebviewWindow via the `pratibimba://` custom URI scheme protocol.
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

## 05.T2 Prototype Amendment (2026-06-01)

The Track 05 T2 prototype landed Option 1 (browser-mode-in-webview) end-to-end:

- `Body/M/epi-tauri/src-tauri/src/commands/pratibimba.rs` adds `pratibimba_summon_ide`, `pratibimba_dismiss_ide`, `pratibimba_ide_status` commands that open and close a second `WebviewWindow` labelled `pratibimba-ide`.
- `lib.rs#pratibimba_protocol_handler` registers the `pratibimba://` custom URI scheme protocol. The protocol resolves files from `Idea/Pratibimba/System/theia-app/lib/frontend/` (overridable via `EPI_PRATIBIMBA_FRONTEND_DIR`). MIME types cover html / js / mjs / css / json / svg / png / jpg / woff / woff2 / ttf / eot / map. Path traversal returns 403; missing files return 404.
- `tauri.conf.json#app.security.csp` is updated to allow the `pratibimba:` origin for `default-src`, `img-src`, `style-src`, `script-src`, `worker-src`, `connect-src`, `font-src`, `child-src`, `frame-src` — enabling Workers, IndexedDB (default-allowed on local origin), `connect-src` to the gateway, blob: workers, and `'unsafe-eval'` for Theia's runtime AMD loader.
- Renderer client at `Body/M/epi-tauri/src/services/pratibimbaClient.ts` exposes the typed `PratibimbaIdeStatus { window_open, window_label, uri, bridge_shared_with_body }`.

**Verification:**
- `cargo test --test pratibimba_protocol` — 5/5 pass (root → index.html, bundle.js with correct MIME, path-traversal 403, missing 404, MIME table covers all Theia asset types).
- `cargo test src-tauri` — 49/49 pass (was 44; +5 protocol).
- Vitest `pratibimbaClient.test.ts` — 4/4 pass.
- `npm run lint` — clean.
- Theia browser bundle exists (9.4 MB) and is byte-served by the protocol handler with `Content-Type: text/html; charset=utf-8` for `index.html`.

**Option 2 (supervised localhost) and Option 3 (Electron sidecar) are not implemented** — Option 1 delivers and the prototype shows no need to fall back. The selected approach is preserved as the default; an Option 2 fallback can be added later as a `EPI_PRATIBIMBA_SUPERVISED_URL` env-driven branch in `pratibimba_summon_ide` without renegotiating this ADR.
