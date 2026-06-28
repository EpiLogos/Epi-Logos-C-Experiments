# AGENTS.md — epi-app

## Purpose
**DEPRECATED / RETIRING — do not build on this.** `epi-electron` — legacy "M' Domain Electron Shell for Epi-Logos" (per `package.json` `description`); an Electron + React/Vite renderer shell superseded by the [[M'-SYSTEM-SPEC]] / `Body/M/epi-theia` direction. New M' UI work belongs in `Body/M/epi-theia`, not here.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[M'-SYSTEM-SPEC]], [[S-SYSTEM-INDEX]])

## Ownership
- `package.json` — `epi-electron` package root / scripts (dev, build, start, test, test:e2e).
- `main/` — Electron main process: `main.ts`, `preload.ts`, `s3-gateway-client.ts`, `epi-claw-client.ts`, `epi-claw-rpc.ts`, `repo-paths.ts`, `ws-wrapper.ts`.
- `renderer/` — React renderer: `App.tsx`, `index.tsx`, plus `components/`, `controllers/`, `domain(s)/`, `stores/`, `providers/`, `powers/`, `theme/`.
- `shared/` — cross-process types/config: `types.ts`, `innerStrata.ts`, `navigationConfig.ts`, `s4ObservableTypes.ts`, `capabilities/`.
- `src/` — `components/`, `lib/` (OmniPanel + shadcn UI surface, per `components.json` / lint target).
- `tests/` — `main/` Vitest specs + `setup-vitest.ts`; e2e via `playwright.local.config.ts`.
- Build/config: `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `index.html`, `public/`.
- Decommission status: legacy parity reference only. Preserve any still-unique gateway or renderer invariants by extracting them to `Body/S/S3/gateway*/tests` or `Body/M/epi-theia` tests before archival/deletion.
- Does NOT own gateway runtime, protocol, or domain law — those live at [[S3-SPEC]] crates (`gateway/`, `gateway-contract/`); this shell is only a client of the S3 gateway (`main/s3-gateway-client.ts`).

## Local Contracts
- No CONTRACT.md and no `src/lib.rs //!` header here (TypeScript package; description is `package.json` `description`).
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]]; M' domain canon: [[M'-SYSTEM-SPEC]].

## Work Guidance
- RETIRING surface — prefer redirecting M' UI work to `Body/M/epi-theia`; do not extend this shell without an explicit decision.
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.

## Verification
- `npm test` (`vitest run`) from this directory; e2e: `npm run test:e2e`; types: `npm run typecheck`.

## Child DOX Index
- (leaf)
