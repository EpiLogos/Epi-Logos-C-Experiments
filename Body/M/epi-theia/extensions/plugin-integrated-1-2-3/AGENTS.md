# AGENTS.md — plugin-integrated-1-2-3

## Purpose
`@pratibimba/plugin-integrated-1-2-3` — "Cosmic Engine integrated plugin — Cosmic Engine composition slice — single profile stream, Anuttara prior-ground reference, integrated 1-2-3 cosmic spine carrying 137 = 64 + 72 + 1 only at M1/M2/M3 (NOT M0)" (per `package.json`). A Theia frontend extension that composes the M1/M2/M3 panes into one Cosmic Engine surface.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (contributors: [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]]).

## Ownership
- `src/common/index.ts` — common entry / re-export surface (`PLUGIN_ID`, `RANGE_ID 1-2-3`, `CONTRIBUTOR_IDS = m1/m2/m3`, `NAMED_LAYOUT_ID cosmic-engine.integrated`).
- `src/common/composition-contract.ts` — B-8/B-9/B-12 composition-seam contract (solar anchor, planetary placement, edit propagation) — declares shape only, no local tables.
- `src/common/third-spanda-composition.ts` — 137 = 64 + 72 + 1 Third Spanda Equation as overlay strings, register-labelled (`symbolic_skeleton` / `measurement_face` / `physics_reference`).
- `src/common/s2-correspondence.ts`, `src/common/wave-a-markers.ts` — S2 correspondence + Wave-A marker definitions.
- `src/browser/frontend-module.ts` — Theia `ContainerModule` (the `theiaExtensions.frontend` entry); `cosmic-engine-composition.tsx`, `cosmic-engine-panes.tsx`, `plugin-integrated-1-2-3-widget.tsx`, `third-spanda-overlay.tsx`, `matheme-137-overlay.tsx` — the composed geometry, mini-inspector panes, widget shell, and Third Spanda / 137 overlays.
- `src/browser/*.test.mjs`, `tests/*.test.mjs` — package-local and slice-level render/contract tests for the integrated 1-2-3 surface.
- `style/index.css`, `package.json`, `tsconfig.json`; `lib/` is the `tsc -b` build output.
- Does NOT own: the per-extension UI internals / individual command-palette entries / readiness micro-states of [[M1']]/[[M2']]/[[M3']] (out of scope per `TRACK_07_OUT_OF_SCOPE_FIELDS`); composition arbitration (delegated to `@pratibimba/integrated-composition`); bridge runtime (delegated to `m-extension-runtime` / kernel-bridge). Domain law lives in each owning M' coordinate extension, not here.

## Local Contracts
- No `CONTRACT.md` here. The binding seam is `src/common/composition-contract.ts` + `src/common/third-spanda-composition.ts` (generated from `contracts/08-t0-composition-contract-preflight.json` — do not hand-edit `index.ts` / `frontend-module.ts`).
- Owning specs: [[M'-SYSTEM-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- No local lookup tables: every concrete codon/correspondence/topology/planetary value flows from the backend `MathemeHarmonicProfile` profile bus, never a table held in this plugin.
- Do not open profile subscriptions in plugin browser code; composition and mini-inspector renders consume `CompositionProfileProvider` / `useCompositionProfile()` from `@pratibimba/integrated-composition`.
- Files marked "Generated from contracts/... Do not hand-edit" must be regenerated via the parent `scripts/` scaffolder, not edited by hand.

## Verification
`pnpm test:contracts` from `Body/M/epi-theia` (full `node --test` contract suite). Local package check: `pnpm test` (= `pnpm build`, i.e. `tsc -b`).

## Child DOX Index
- (leaf)
