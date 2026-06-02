# Epi Theia

`Body/M/epi-theia` is the implementation home for the Pratibimba System Theia application.

UX-facing architecture and subsystem documentation lives in `Idea/Pratibimba/System`. Canonical M' specs and architecture evidence live in `Idea/Bimba/Seeds/M/**`. Hen-governed MOCs and type canvases live in `Idea/Bimba/World/Types/**`.

## Contents

| Path | Role |
| --- | --- |
| `theia-app/` | The Theia application host |
| `electron-app/` | Electron packaging/runtime shell |
| `extensions/` | Theia extensions for M' subsystems, layouts, bridge, plugins, and acceptance harness |
| `patches/`, `scripts/`, package manifests | Build and workspace tooling |
| `node_modules/` | Local dependency install; runtime artifact, not vault knowledge |

## M' Extension Map

| Coordinate | Subsystem | Extension |
| --- | --- | --- |
| [[M0']] | Anuttara | `extensions/m0-anuttara` |
| [[M1']] | Paramasiva | `extensions/m1-paramasiva` |
| [[M2']] | Parashakti | `extensions/m2-parashakti` |
| [[M3']] | Mahamaya | `extensions/m3-mahamaya` |
| [[M4']] | Nara | `extensions/m4-nara` |
| [[M5']] | Epii | `extensions/m5-epii` |

The integrated plugin packages `plugin-integrated-1-2-3` and `plugin-integrated-4-5-0` compose those subsystem surfaces; they do not replace the individual M' coordinate extensions.

## Commands

Run from this directory:

```bash
pnpm install
pnpm build
pnpm test
pnpm start
```

Use `pnpm test:contracts` for the contract and acceptance test set declared in `package.json`.

## Residency Guardrails

- Do not place design/canon documents here unless they are implementation-local READMEs.
- Do not move `Idea/Pratibimba/System/Subsystems` back into `Body`.
- Do not treat generated files, bundles, coverage, or `node_modules` as vault material.
- Keep implementation paths repo-local and avoid legacy absolute paths.
