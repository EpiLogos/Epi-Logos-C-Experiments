# AGENTS.md — integrated-composition

## Purpose
`@pratibimba/integrated-composition` — "Shared composition coordinator for Track 08 integrated plugins. Owns LayoutClaim arbitration, named layout descriptors, IntegratedReadiness aggregation, and the empty-state contract consumed by plugin-integrated-1-2-3 and plugin-integrated-4-5-0. Track 08 T1." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (consumers: [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]], [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]]).

## Ownership
- `src/common/index.ts` — package public surface (re-exports all `common/` modules + browser helpers); compiled to `lib/common/index.js` (`main`).
- `src/common/layout-claim.ts` — `IntegratedLayoutSlot` types + LayoutClaim contract; `composition-coordinator.ts` — claim arbitration (singleton/multi slots, geometric protection).
- `src/common/integrated-state.ts` + `state-coordinator.ts` — immutable `IntegratedViewState` snapshot + coordinator both plugins consume.
- `src/common/integrated-readiness.ts` — typed `IntegratedReadiness` envelope, geometric-slot readiness folding, and composition blocker ledger consumed by the integrated plugins.
- `src/common/empty-state.ts` + `src/browser/integrated-empty-state.tsx` — degraded empty-state contract/component (08.T1 step 3).
- `src/common/profile-tick-subscription.ts` + `src/browser/composition-profile-context.tsx` — composition-scoped profile tick subscription primitive, React provider, and hook for the single-clock invariant shared by both integrated plugins.
- `src/common/{evidence-*,release-gate,recursive-self-review-gate,epii-review-*,consent-gate,privacy-scrubber,workspace-persistence}.ts` — evidence envelopes, release gate, S5 self-review, consent/privacy, persistence.
- `src/browser/design-primitives/` — shared React primitives (CoordinateString, Matheme, KaTeX, geometry) exported via `./design-primitives`.
- `tests/` — `node --test` `.mjs` contract tests; `style/index.css` — shared stylesheet.
- Does NOT own: per-plugin composition (lives in sibling `plugin-integrated-1-2-3` / `plugin-integrated-4-5-0`); the shared `KernelBridgeAPI`/readiness adapter (delegated to `@pratibimba/m-extension-runtime`); gateway runtime ([[S3-SPEC]] gate, port 18794, via `kernel-bridge`).

## Local Contracts
- Coordinate Header: `src/common/index.ts` (public exports) + per-module doc-comments in `layout-claim.ts`, `integrated-state.ts`, `empty-state.ts`.
- No local `CONTRACT.md`. Binding composition contract lives at parent `contracts/08-t0-composition-contract-preflight.{json,md}`.
- Owning spec: [[M'-SYSTEM-SPEC]]; consumer specs [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]], [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; this package is imported by both integrated plugins (honour d=1 WILL-BREAK).
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Add new public types/functions to `src/common/index.ts` so plugins can import from the package root (matches the `m-extension-runtime` pattern).
- Profile-tick consumers inside integrated compositions must use `CompositionProfileProvider` / `useCompositionProfile()` rather than direct plugin-local `SharedBridgeAdapter.onProfile()` calls.

## Verification
`pnpm test` here (runs `pnpm build && node --test tests/*.test.mjs`); or `pnpm test:contracts` from `Body/M/epi-theia` for the full cross-extension suite.

## Child DOX Index
- (leaf)
