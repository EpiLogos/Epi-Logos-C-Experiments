# AGENTS.md — epi-theia

> **FROZEN — parts warehouse (2026-07-02, DR-FACE-4 per [[M'-SURFACE-REENVISIONING-2026-07-01]], ratified; supersedes Tranche 11.7).** The active M' carrier is `Body/M/pratibimba-app/`. Do not add extensions, tasks, or fixes here. This tree remains readable as the source of ports — React component internals, `src/common` model layers, kernel-bridge types, design patterns — each port carries a provenance line back to its file here. Archive alongside `epi-tauri`/`epi-app` once port parity is reached.

## Purpose
The `@pratibimba/system` pnpm workspace: "Pratibimba System — Theia-based IDE surface for the Epi-Logos M5-3 layer. Hosts the six individual M-extensions, two integrated plugins (1-2-3 and 4/5/0), and the foundational kernel-bridge." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M5'-SPEC]]

## Ownership
- `package.json` — root workspace manifest (`@pratibimba/system`), build/test/start/lint scripts; declares the `test:contracts` suite
- `extensions/` — Theia extensions for M' subsystems, layouts, bridge, plugins, and acceptance harness (own AGENTS.md — see Child DOX Index)
- `electron-app/` — canonical full-fidelity Electron application target
- `theia-app/` — browser-mode target derived from the same extensions for gateway/remote use
- `shared/` — contract-pointer artifacts for shared composition shapes that are not standalone workspace packages, including `mono-poly-state.d.ts` (`MonoPolyState`, shared by [[M0']] and [[M2']]); `shared/m-extension-runtime/` remains the shared runtime code consumed by the M' extensions
- `scripts/` — build/verify tooling (`smoke-build.sh`, `ensure-electron-dist.mjs`, `verify-*.mjs`)
- `patches/`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `.npmrc` — workspace + build configuration
- Does NOT own UX/canon docs (live in `Idea/Pratibimba/System` and `Idea/Bimba/Seeds/M/**`); does NOT own the M0-M5 C runtime law (that resides in its owning M-subsystem modules, not here by convenience).

## Local Contracts
- `README.md` — implementation-home overview, M' extension map, target discipline, residency guardrails
- `package.json` `description` — the code Coordinate Header / public surface declaration
- Owning specs: [[M'-SYSTEM-SPEC]], [[M5'-SPEC]], [[M5-ARCHITECTURE]]
- (no local CONTRACT.md — per-extension contracts live under `extensions/`)

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour HIGH/CRITICAL warnings.
- [[wikilink]] all coordinate/spec/agent references in any authored doc or vault write; coordinate-prefixed `c_n_*` frontmatter for vault writes.
- Residency: do not place design/canon docs here (only implementation-local READMEs); do not treat `node_modules`, bundles, or coverage as vault material; keep paths repo-local (no legacy absolute paths).
- Electron is the primary development/acceptance surface; browser mode is the derived gateway-mediated profile and must not be the only target carrying a Pratibimba surface package.
- Electron app startup scripts must run `scripts/ensure-electron-dist.mjs` and `scripts/ensure-electron-native-modules.mjs` before `theia start` so missing Electron dist artifacts and Electron-ABI native backend modules are repaired before launch.

## Verification
`pnpm --dir "Body/M/epi-theia" test` (runs `pnpm -r test` plus `pnpm test:contracts`); contract/acceptance set only: `pnpm --dir "Body/M/epi-theia" test:contracts`.

## Child DOX Index
- `extensions/AGENTS.md` — Theia extensions for the six M' subsystems, integrated plugins, kernel-bridge, layouts, and acceptance/contract harness.
