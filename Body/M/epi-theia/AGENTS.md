# AGENTS.md — epi-theia

## Purpose
The `@pratibimba/system` pnpm workspace: "Pratibimba System — Theia-based IDE surface for the Epi-Logos M5-3 layer. Hosts the six individual M-extensions, two integrated plugins (1-2-3 and 4/5/0), and the foundational kernel-bridge." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M5'-SPEC]]

## Ownership
- `package.json` — root workspace manifest (`@pratibimba/system`), build/test/start/lint scripts; declares the `test:contracts` suite
- `extensions/` — Theia extensions for M' subsystems, layouts, bridge, plugins, and acceptance harness (own AGENTS.md — see Child DOX Index)
- `electron-app/` — canonical full-fidelity Electron application target
- `theia-app/` — browser-mode target derived from the same extensions for gateway/remote use
- `shared/m-extension-runtime/` — shared runtime code consumed by the M' extensions
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

## Verification
`pnpm --dir "Body/M/epi-theia" test` (runs `pnpm -r test` plus `pnpm test:contracts`); contract/acceptance set only: `pnpm --dir "Body/M/epi-theia" test:contracts`.

## Child DOX Index
- `extensions/AGENTS.md` — Theia extensions for the six M' subsystems, integrated plugins, kernel-bridge, layouts, and acceptance/contract harness.
