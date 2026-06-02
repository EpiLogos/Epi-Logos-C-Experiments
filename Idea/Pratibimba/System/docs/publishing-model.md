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

## Native-module policy (Node 24 host)

pnpm does not run arbitrary native build scripts by default. The Theia
browser target still pulls a few optional native integrations through
transitive packages, so the application owns explicit build-time policy for
each one:

- `keytar@7.2.0` — secret storage. The browser application does not expose
  native OS secret writes in Track 05 T1, so
  `theia-app/webpack.config.js` maps the missing native binding to a safe
  unavailable implementation.
- `drivelist@9.2.4` — drive enumeration. The browser application does not
  require host drive discovery, so the Theia native-webpack binding maps it to
  an empty drive list.
- `node-pty@0.11.0-beta24` — terminal pty. `@theia/terminal` and
  `@theia/process` are intentionally absent from `theia-app` until terminal
  support is explicitly in scope.

`pnpm --dir Body/M/epi-theia build` must compile both the frontend and
backend bundles successfully. `scripts/smoke-build.sh` fails on any non-zero
Theia build exit and verifies the readiness extension chunk is present in the
frontend artifact.

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
