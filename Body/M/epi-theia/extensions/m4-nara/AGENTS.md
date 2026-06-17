# AGENTS.md — m4-nara

## Purpose
The `@pratibimba/m4-nara` Theia M-extension — "m4-nara M-extension scaffold. First-slice priority: Protected Nara DayContainer and Graphiti browser with handle-only deep links and explicit consent/privacy gates." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M4'-SPEC]] (and [[M'-SYSTEM-SPEC]]).

## Ownership
- `src/common/index.ts` — public surface + frozen `TRACK_08_CONTRIBUTION` contract (generated from `contracts/07-t0-extension-contract-preflight.json` — do not hand-edit); declares `EXTENSION_ID`, view IDs, `PRIVACY_CLASS = 'protected_local'`.
- `src/common/{nara-surface,oracle-frame,deck-context,symbolic-protein}.ts` — common types/guards (NaraArtifact surface, OracleFrame, DeckContext, SymbolicProtein).
- `src/browser/` — frontend: `frontend-module.ts`, `m4-nara-widget.tsx`, `canvas-editor.tsx`, `widgets/` (kairos-display, logos-cycle, medicine-view, lens-application, pratibimba-coordinate, transform-containers, mercurius-relay-indicator, day-calendar, ambient-state-strip, tuning-bar), `onboarding/identity-wizard.tsx`, `editor/`, `services/`.
- `style/` — `index.css`, `highlights.css`.
- `lib/` — compiled `tsc -b` output (not source).
- Does NOT own: domain law (lives in [[M4'-SPEC]], not here), gateway runtime / S0–S5 access (forbidden imports per `compositionBoundary.forbiddenImports`: `Body/S/S0`, `S2`, `S3`, `S5`, `neo4j-driver`); all data flows via the shared `@pratibimba/m-extension-runtime` bridge.

## Local Contracts
- Code Coordinate Surface: `src/common/index.ts` (`TRACK_08_CONTRIBUTION`, `M4_NARA_CONTRACT_VERSION` in `nara-surface.ts`).
- Generated from `../contracts/07-t0-extension-contract-preflight.{json,md}` (sibling, owned by parent).
- Owning spec: [[M4'-SPEC]] / [[M'-SYSTEM-SPEC]].
- No local CONTRACT.md (see parent + Canon).

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- Do NOT hand-edit `src/common/index.ts` — it is generated from the contract preflight JSON.
- Respect `compositionBoundary.forbiddenImports`: no direct S0/S2/S3/S5 or `neo4j-driver` imports; consume only the shared bridge.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.

## Verification
`pnpm --dir Body/M/epi-theia/extensions/m4-nara test` (runs `pnpm build` then `node --test` over `../test/m4-nara-canvas-editor.test.mjs`, `m4-nara-kairos-display.test.mjs`, `m4-nara-mercurius-relay-indicator.test.mjs`). Full suite: `pnpm --dir Body/M/epi-theia test:contracts`.

## Child DOX Index
- (leaf)
