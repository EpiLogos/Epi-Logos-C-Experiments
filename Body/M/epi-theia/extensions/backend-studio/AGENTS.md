# AGENTS.md — backend-studio

## Purpose
`@pratibimba/backend-studio` Theia extension: "Backend Studio Theia extension: LSP contributions for rust-analyzer, clangd, and pylsp with provenance for epi-lib, portal-core, and S1-S5 cores." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (surfaces backend cores indexed in [[S-SYSTEM-INDEX]]).

## Ownership
- `src/common/backend-studio.ts` — common surface: `BACKEND_STUDIO_LSP_CONTRIBUTIONS` (rust-analyzer/clangd/pylsp), `BACKEND_STUDIO_PROVENANCE_ROOTS` (epi-lib, portal-core, S1-S5), `lspContributionFor` / `provenanceRootsForCore`, and the LSP/provenance type definitions.
- `src/common/index.ts` — public re-export barrel (`main`/`types` entry).
- `src/browser/frontend-module.ts` — Theia frontend ContainerModule (command + view binding).
- `src/browser/backend-studio-language-service.ts` — `BackendStudioLanguageService` registering Monaco language contributions.
- `src/browser/backend-studio-widget.tsx` — provenance view widget (`pratibimba.backend-studio.provenance`).
- `style/index.css` — widget styling.
- `tests/backend-contract.test.mjs` — `node --test` contract test over the common LSP/provenance surface.
- Does NOT own: the actual language servers (external `rust-analyzer`/`clangd`/`pylsp` binaries), the backend cores it indexes (live under `Body/S/S0..S5`, owned by their S-coordinates), or gateway runtime (delegated to `kernel-bridge` per parent).

## Local Contracts
- Code Coordinate Header: `src/common/backend-studio.ts` (the frozen `BACKEND_STUDIO_LSP_CONTRIBUTIONS` / `BACKEND_STUDIO_PROVENANCE_ROOTS` tables; each entry carries a `provenance` string citing "system-shape canon §1.2").
- No local `CONTRACT.md` / `README.md`.
- Owning spec: [[M'-SYSTEM-SPEC]]; surfaced-core canon in [[S-SYSTEM-INDEX]] / [[S0-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol (`BACKEND_STUDIO_LSP_CONTRIBUTIONS`, `BACKEND_STUDIO_PROVENANCE_ROOTS`, `lspContributionFor`, `provenanceRootsForCore`); honour the d=1 WILL-BREAK rule (the test file asserts against these directly).
- [[wikilink]] all coordinate/spec/core references in any authored artifact.
- Keep `package.json` `backendStudio.languageServers` / `backendStudio.provenanceRoots` in sync with the frozen tables in `src/common/backend-studio.ts`.

## Verification
`pnpm --dir Body/M/epi-theia/extensions/backend-studio test` (runs `pnpm build && node --test tests/backend-contract.test.mjs`); workspace-wide via `pnpm --dir Body/M/epi-theia test:contracts`.

## Child DOX Index
- (leaf)
