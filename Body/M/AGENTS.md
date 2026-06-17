# AGENTS.md — M

## Purpose
`Body/M` is the implementation home for the M' (Pratibimba System) layer — the Theia/Electron IDE surface and its M0'–M5' subsystem extensions.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]]

## Ownership
- `epi-theia/` — the only child: the Pratibimba System Theia/Electron application (see Child DOX Index).
- Does NOT own: M-branch domain law (lives in the C library `Body/S/S0/epi-lib` m0–m5 and the canonical M' specs under `Idea/Bimba/Seeds/M/`); UX-facing canon and subsystem docs (live in `Idea/Pratibimba/System`); Hen-governed MOCs/type canvases (`Idea/Bimba/World/Types/**`). Domain law stays in its owning coordinate module — not duplicated here by convenience.

## Local Contracts
- No `CONTRACT.md` at this level.
- Owning specs: [[M'-SYSTEM-SPEC]] (system shape); per-subsystem [[M0'-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], [[M5'-SPEC]] under `Idea/Bimba/Seeds/M/`.
- The binding interface for this tree is the child workspace manifest `epi-theia/package.json` (`@pratibimba/system`) and its contract test set.

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; report blast radius.
- [[wikilink]] all entity references (coordinates, specs, carriers, agents) in agent-authored artifacts.
- Use coordinate-prefixed `c_n_*` frontmatter for any vault writes (C-family default; `coordinate` is the one exempt key).
- Do not place design/canon docs here (implementation-local READMEs only); do not treat `node_modules`/bundles/coverage as vault material.

## Verification
- `pnpm --dir Body/M/epi-theia test` (per-package tests + `test:contracts`)
- Contract/acceptance suite only: `pnpm --dir Body/M/epi-theia test:contracts`

## Child DOX Index
- `epi-theia/AGENTS.md` — `@pratibimba/system`: Theia-based IDE surface for the Epi-Logos M5-3 layer; hosts the six M-extensions, two integrated plugins (1-2-3 and 4/5/0), and the kernel-bridge.
