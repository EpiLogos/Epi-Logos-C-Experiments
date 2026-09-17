# AGENTS.md — M

## Purpose
`Body/M` is the implementation home for the M' (Pratibimba System) layer.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (see its Carrier Decision 2026-07-02) -> [[M'-SURFACE-REENVISIONING-2026-07-01]] (ratified).

## Ownership
- `pratibimba-app/` — the **active carrier**: one Tauri v2 binary supervising the `epi` gateway; the M' face. All new M'-surface work lands here.
- `epi-theia/` — **frozen parts warehouse and porting source** (per DR-FACE-4, 2026-07-02; supersedes Tranche 11.7's Theia-only recast): it received the cycle-2/3 sublimation — OmniPanel, kernel-bridge types, m4-nara canvas, models. No new investment; do not add extensions or tasks here. (Older carriers `epi-tauri`/`epi-app` live in git history — `git show ad60bdf5^:Body/M/epi-tauri/<file>` — reference only, no absorption mandate.)
- Does NOT own: M-branch domain law (lives in the C library `Body/S/S0/epi-lib` m0–m5 and the canonical M' specs under `Idea/Bimba/Seeds/M/`); UX-facing canon and subsystem docs; Hen-governed MOCs/type canvases (`Idea/Bimba/World/Types/**`). Domain law stays in its owning coordinate module — not duplicated here by convenience.

## Local Contracts
- No `CONTRACT.md` at this level.
- Owning specs: [[M'-SYSTEM-SPEC]] (system shape + carrier decision); per-subsystem [[M0'-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], [[M5'-SPEC]] under `Idea/Bimba/Seeds/M/`.
- Active plan: [[2026-07-02-pratibimba-app-phase-1]] — its Binding protocol (verifier ≠ closer; behavioral proof for surface tasks; drivable-loop sprint gates) governs all `Body/M` work.

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; report blast radius.
- [[wikilink]] all entity references (coordinates, specs, carriers, agents) in agent-authored artifacts.
- Use coordinate-prefixed `c_n_*` frontmatter for any vault writes (C-family default; `coordinate` is the one exempt key).
- Do not place design/canon docs here (implementation-local READMEs only); do not treat `node_modules`/bundles/coverage as vault material.
- Ports out of `epi-theia/` carry a provenance line naming the source file.

## Verification
- Active carrier: `pnpm --dir Body/M/pratibimba-app typecheck && pnpm --dir Body/M/pratibimba-app test && pnpm --dir Body/M/pratibimba-app smoke`; `cargo test` in `pratibimba-app/src-tauri/`.
- Frozen warehouse (only when verifying a port source): `pnpm --dir Body/M/epi-theia test:contracts`.

## Child DOX Index
- `pratibimba-app/AGENTS.md` — `@pratibimba/app`: the active Tauri v2 M' carrier (supervised gateway + 0/1 face + four stores).
- `epi-theia/AGENTS.md` — `@pratibimba/system`: FROZEN Theia-based IDE surface; parts warehouse for ports into `pratibimba-app`.
