# Publishing Model

How packages flow from source → built artifact → runtime in `/pratibimba/system`.

## In-tree only — no public npm

Packages under `@pratibimba/` are **never** pushed to the public npm registry. They live in this monorepo and are resolved via pnpm workspace links.

## Build artifacts

| Source | Build | Output |
| --- | --- | --- |
| `extensions/*/src/**` | `tsc -b` | `extensions/*/lib/**` (committed to git for downstream consumers; ignored only at the root level via `.gitignore` once stabilised) |
| `theia-app/src-gen/**` | `theia build` | `theia-app/lib/frontend/` (real browser bundle), `theia-app/lib/backend/` (Node server) |

`theia-app/src-gen/` is **generated** by `@theia/cli` and not authored by hand — it is recreated on every `theia build`.

## Runtime composition

Two delivery modes, decided by ADR-05-001:

1. **Browser-mode-in-Tauri-webview** (recommended default). Tauri serves `theia-app/lib/frontend/` from a local origin via `tauri-plugin-fs` or a tiny Tauri-side static server. The backend service runs out-of-process; the webview connects to it via a known port or socket.
2. **Supervised localhost Theia server**. Tauri spawns `node theia-app/lib/backend/main.js` and the webview navigates to `http://127.0.0.1:3000`. Same artifacts, different orchestration.

`/body` (the Tauri renderer) is summoned alongside Theia, not instead of it — see ADR-05-002.

## Version pin

All `@theia/*` packages are pinned to **`1.56.0`** at the workspace root. Override or upgrade is a coordinated change: bump every package in lockstep, run `pnpm install`, run `pnpm build`, smoke-test the readiness contribution.

## Known native-module gaps (Node 24 host)

These dependencies have native build steps that fail under Node 24 in the dev environment:

- `keytar@7.2.0` — secret storage (used by `@theia/keymaps`, `@theia/userstorage`, etc.). Skipped via `pnpm onlyBuiltDependencies` allowlist.
- `node-pty@0.11.0-beta24` — terminal pty. Skipped; `@theia/terminal` and `@theia/process` removed from `theia-app` deps until upstream node-pty supports Node ≥ 22.
- `drivelist@9.2.4` — drive enumeration (used by `@theia/core/lib/node/env-variables`). Skipped; backend bundle has a missing-module warning on `drivelist/js/index.js`. The frontend bundle builds and renders correctly; the backend startup needs a Node 20/22 host (or these modules patched away) for full dev-server start.

Mitigations:

- Pin Node 22 for backend startup in CI.
- Or apply a webpack alias that maps `drivelist` to a stub (Track 05 T2 work).

The browser bundle (the canonical 05.T1 verification artifact) is unaffected.

## Patches

Two patches against `@theia/application-manager@1.56.0` are committed to
`patches/@theia__application-manager@1.56.0.patch` (referenced from
`package.json#pnpm.patchedDependencies`):

1. `spawn()` quotes the command so paths with spaces don't trigger
   `/bin/sh` word-splitting under `{ shell: true }`. Upstream Theia
   assumes whitespace-free repo paths; this repo lives at
   `/Users/admin/Documents/Epi-Logos C Experiments/...` which breaks the
   default behaviour.
2. `resolveBin()` walks up the directory tree to find
   `node_modules/.bin/<command>` instead of looking only inside
   `binProjectPath/node_modules/.bin`. pnpm hoists binaries to the
   workspace root rather than nesting them under each package, which the
   default lookup misses.

Both patches are self-contained; an upstream Theia release that fixes
either can drop the corresponding hunk.
