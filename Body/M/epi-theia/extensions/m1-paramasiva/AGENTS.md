# AGENTS.md — m1-paramasiva

## Purpose
The [[M1']] Paramasiva Theia M-extension — "m1-paramasiva M-extension scaffold. First-slice priority: Profile clock instrument with 84-state walk, exact audio bus consumption, and typed relation-walk evidence." (per `package.json` / `README.md`). Workspace package `@pratibimba/m1-paramasiva`.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M1'-SPEC]] (see also [[M1-ARCHITECTURE]]).

## Ownership
- `src/common/index.ts` — generated contract barrel (EXTENSION_ID, view IDs, commands, `TRACK_08_CONTRIBUTION`); regenerated from `../contracts/07-t0-extension-contract-preflight.json`, do not hand-edit.
- `src/common/extension-constants.ts` — node-test-safe mirror of EXTENSION_ID + PRIVACY_CLASS (kept in lock-step with `index.ts`).
- `src/common/clock-instrument.ts` — pure clock/topology profile model (`M1ProfileClockModel`, lens/mode cells); requireable under plain `node --test`.
- `src/common/{surface-dispatch,m1-backend-studio-pack,deep-widget-ui-state}.ts` — shared dispatch/state surface.
- `src/browser/` — Theia frontend: `frontend-module.ts` (entry), `m1-paramasiva-widget.tsx`, clock/Klein-topology/spanda-walk/CL42-signature/Klein-flip views, coordinate-tree contribution.
- `style/index.css`, `package.json`, `tsconfig.json`, `lib/` (build output).
- Does NOT own: shared runtime (delegated to `@pratibimba/m-extension-runtime`), composition arbitration ([[M'-SYSTEM-SPEC]] Track 08 / `@pratibimba/integrated-composition`), gateway runtime (S0/S2/S3 are forbidden imports per `compositionBoundary.forbiddenImports`). M1' domain law lives in [[M1'-SPEC]], not here.

## Local Contracts
- Code Coordinate Header: `src/common/clock-instrument.ts` model types + `src/common/index.ts` `TRACK_08_CONTRIBUTION` (`MExtensionContributionContract`).
- Parent contract artifacts: `../contracts/07-t0-extension-contract-preflight.{json,md}` (extension boundary), `../contracts/08-t0-composition-contract-preflight.{json,md}` (Track 08).
- Owning spec: [[M1'-SPEC]] / [[M1-ARCHITECTURE]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- `index.ts` is generated — edit the source contract under `../contracts/`, not the barrel; keep `extension-constants.ts` literals in sync.
- Respect `compositionBoundary.forbiddenImports` (no `Body/S/S0`, `S2`, `S3`, spacetimedb-sdk, portal-core); consume bridge data via the shared runtime, not direct fetch/WebSocket.

## Verification
`pnpm --filter @pratibimba/m1-paramasiva test` (runs `tsc -b`); contract suite via `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
