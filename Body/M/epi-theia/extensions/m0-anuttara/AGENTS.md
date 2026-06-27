# AGENTS.md — m0-anuttara

## Purpose
`@pratibimba/m0-anuttara` Theia extension — "m0-anuttara M-extension scaffold. First-slice priority: Anuttara language-map browser plus OWL/SHACL provenance inspector backed by bridge-mediated S2 graph queries." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M0'-SPEC]] (architecture: [[M0-ARCHITECTURE]]).

## Ownership
- `src/common/index.ts` — public surface / Track-08 contribution contract (`EXTENSION_ID`, view ids, `TRACK_08_CONTRIBUTION`); generated from the parent `contracts/07-t0-extension-contract-preflight.json`.
- `src/common/cross-layout-intent.ts`, `src/common/m0-inspector.ts`, `src/common/m0-layers.ts` — cross-layout intent payload, inspector layer model (including `MONOPOLY_LUT` rows typed by shared `MonoPolyState`), and `s2.graph.query` route types.
- `src/browser/frontend-module.ts` — Theia frontend module (widget factory, commands, empty-state registration).
- `src/browser/m0-anuttara-widget.tsx`, `src/browser/empty-state.tsx` — root widget and first-render empty-state surface.
- `src/browser/components/`, `src/browser/panels/` (incl. `panels/syntax-layers/`), `src/browser/state/` — React UI (layer-selector, mode-toggle, void-structure-ring, contemplation-prompt footer, lazy-node-browser, parity-bridge-reader, ql-structure-layer (M0-1' QL reader), virtue-witness, syntax-layer panels) and M0' surface-state codecs persisted through the shared bridge.
- `style/index.css`, `style/provenance-pills.css` — extension styling. `lib/` — compiled `tsc -b` output.
- Does NOT own: M0' domain law (lives in [[M0'-SPEC]] / [[M0-ARCHITECTURE]], not here); graph runtime / bridge (delegated via `@pratibimba/m-extension-runtime` + the gateway bridge; `forbiddenImports` bars `Body/S/S0`,`S2`,`S3`,`S5` and `neo4j-driver`); the contract source + shared test suite (parent `extensions/`).

## Local Contracts
- (no local CONTRACT.md) Binding contract = parent `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{json,md}` (sources are "Generated from" it).
- Code Coordinate Header: `src/common/index.ts` (`TRACK_08_CONTRIBUTION`, `PRIVACY_CLASS = 'public_current_with_graph_provenance'`).
- Owning spec: [[M0'-SPEC]] / [[M0-ARCHITECTURE]]; system: [[M'-SYSTEM-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol (d=1 = WILL-BREAK; update those callers).
- Do NOT hand-edit `src/common/index.ts` or `src/browser/frontend-module.ts` — regenerate from the parent contract preflight (they carry the "Do not hand-edit" header).
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Respect `forbiddenImports`: no direct `Body/S/*` or `neo4j-driver` imports — graph access goes through the shared bridge adapter.

## Verification
`pnpm test` in this dir (builds, then runs the five `../test/m0-anuttara-*.test.mjs` node suites), or `pnpm test:contracts` from `Body/M/epi-theia` for the full suite.

## Child DOX Index
- (leaf)
