# Epi Theia

`Body/M/epi-theia` is the implementation home for the Pratibimba System Theia application.

UX-facing architecture and subsystem documentation lives in `Idea/Pratibimba/System`. Canonical M' specs and architecture evidence live in `Idea/Bimba/Seeds/M/**`. Hen-governed MOCs and type canvases live in `Idea/Bimba/World/Types/**`.

## Contents

| Path | Role |
| --- | --- |
| `electron-app/` | Canonical full-fidelity Electron application target |
| `theia-app/` | Browser-mode target derived from the same extensions for gateway/remote use |
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

`pnpm start` launches the Electron target. Use `pnpm start:browser` when
testing the gateway-served browser-mode target.

Use `pnpm test:contracts` for the contract and acceptance test set declared in `package.json`.

## Target Discipline

Electron is the primary development and acceptance surface for the full
Pratibimba System. It carries both layouts: `daily-0-1` for the first-mounted
0/1 Nara/body surface and `ide-deep` for the summoned 4+2 workbench. Browser
mode is derived from the same source tree and must not become the only target
that carries a Pratibimba surface package; it is the gateway-mediated remote
profile for hosted, mobile, or on-the-go access.

## Residency Guardrails

- Do not place design/canon documents here unless they are implementation-local READMEs.
- Do not move `Idea/Pratibimba/System/Subsystems` back into `Body`.
- Do not treat generated files, bundles, coverage, or `node_modules` as vault material.
- Keep implementation paths repo-local and avoid legacy absolute paths.
