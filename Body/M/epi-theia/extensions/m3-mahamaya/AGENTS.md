# AGENTS.md — m3-mahamaya

## Purpose
The [[M3']] Mahamaya Theia extension — "m3-mahamaya M-extension scaffold. First-slice priority: 64/472 wheel with backend-provided codon projection, provenance, and trace overlay only" (per `package.json` description). Package `@pratibimba/m3-mahamaya`.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M3'-SPEC]] (architecture: [[M3-ARCHITECTURE]]; parent: [[M'-SYSTEM-SPEC]]).

## Ownership
- `package.json` — workspace package manifest; `theiaExtensions` -> `lib/browser/frontend-module`; `test` script + dependency surface.
- `src/common/index.ts` — public contract surface: `EXTENSION_ID`, view/command/route IDs, `PRIVACY_CLASS`, `TRACK_08_CONTRIBUTION` (generated from `contracts/07-t0-extension-contract-preflight.json`).
- `src/common/codon-wheel.ts` — codon-wheel contract constants (64 codons = 40 non-dual + 24 dual; 472 rotational states) over `@pratibimba/kernel-bridge` types.
- `src/browser/` — frontend module, `empty-state.tsx`, cosmic-wheel widget, composition projection, components (inspectors, lens aperture, I-Ching cast ribbon, clock-field edge overlay, quintessence indicator, pentadic relation inspector), renderer service/protocol, pentadic trace service, React contexts.
- `style/index.css` — extension stylesheet. `lib/`, `tsconfig.tsbuildinfo` — build artifacts (do not hand-edit).
- Does NOT own: domain law (lives in [[M3'-SPEC]] / [[M3-ARCHITECTURE]], not here); gateway/runtime data (consumed via `@pratibimba/kernel-bridge` `KernelBridgeAPI`); shared M-runtime (`@pratibimba/m-extension-runtime`); cross-extension contract suite (parent `../test/`). `compositionBoundary.forbiddenImports` bars `Body/S/S0`, `S2`, `S3`, `portal-core`, spacetimedb SDK.

## Local Contracts
- Coordinate Header: `package.json` description + `src/common/index.ts` contract exports (`M3_CODON_WHEEL_CONTRACT_VERSION`, generated from `contracts/07-t0-extension-contract-preflight.json`).
- Owning spec: [[M3'-SPEC]]; architecture [[M3-ARCHITECTURE]]; cross-extension preflight in parent `contracts/`.
- No local CONTRACT.md (see parent [[AGENTS.md]] + Canon).

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- `src/common/index.ts` is generated ("Do not hand-edit") — change the source contract JSON in parent `contracts/` and regenerate.
- Consume gateway data only through `KernelBridgeAPI` (no direct `fetch`/WebSocket); respect `compositionBoundary.forbiddenImports`.

## Verification
`pnpm --filter @pratibimba/m3-mahamaya test` (runs `tsc -b` then `node --test` over the six `m3-mahamaya-*` suites in parent `../test/`), or `pnpm --dir Body/M/epi-theia test:contracts` for the full cross-extension suite.

## Child DOX Index
- (leaf)
