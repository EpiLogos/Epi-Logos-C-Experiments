# AGENTS.md — m5-epii

## Purpose
The `@pratibimba/m5-epii` Theia M-extension — "m5-epii M-extension scaffold. First-slice priority: Review queue and spine-state inspector over real S5 review/improve DTOs with dry-run-only governance" (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M5'-SPEC]] (see also [[M5-ARCHITECTURE]]).

## Ownership
- `src/common/index.ts` — generated contract surface (`MExtensionContributionContract`, view IDs, command IDs, Track 08 exports); re-exports `epii-surface`. Generated from `contracts/07-t0-extension-contract-preflight.json` — do not hand-edit.
- `src/common/epii-surface.ts` — review/improve DTO domain types (`ReviewStatus`, `ReviewDisposition`, `GovernanceCategory`, `ArtifactUri`) and `M5_EPII_CONTRACT_VERSION`.
- `src/browser/frontend-module.ts`, `m5-epii-widget.tsx` — Theia frontend module + review-queue widget.
- `src/browser/services/` — `contemplation-object-service.ts`, `contemplation-object-components.tsx`, `resonance-ebm-service.ts`.
- `tests/contemplation-object-viewer.test.mjs` — node `--test` contract test.
- `style/index.css`, `lib/` (build output), `package.json`, `tsconfig.json`.
- Does NOT own: gateway runtime data (reached only via `m-extension-runtime`'s `KernelBridgeAPI`); cross-extension composition (Track 08 / `integrated-composition`); domain law lives in [[M5'-SPEC]], not duplicated here.

## Local Contracts
- Coordinate Header / contract surface: `src/common/index.ts` + `src/common/epii-surface.ts` (`M5_EPII_CONTRACT_VERSION`, `compositionBoundary.forbiddenImports`).
- Owning spec: [[M5'-SPEC]] / [[M5-ARCHITECTURE]]. Parent boundary contracts: `../contracts/07-t0-extension-contract-preflight.{json,md}` and `../contracts/08-t0-composition-contract-preflight.{json,md}`.
- No local CONTRACT.md (none yet — see parent + Canon).

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Do not hand-edit `src/common/index.ts` — regenerate from the contract preflight JSON in `../contracts/`.
- Respect `compositionBoundary.forbiddenImports` (`Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `Body/S/S5`, `epii-review-core`); consume gateway data only through `KERNEL_BRIDGE_API.invokeCapability` via `@pratibimba/m-extension-runtime`.
- Governance is dry-run-only for this first slice; honour `PRIVACY_CLASS = 'governed_review_metadata_only'`.

## Verification
`pnpm --dir Body/M/epi-theia/extensions/m5-epii test` (runs `tsc -b` then `node --test tests/contemplation-object-viewer.test.mjs`). Workspace-wide: `pnpm --dir Body/M/epi-theia test:contracts`.

## Child DOX Index
- (leaf)
