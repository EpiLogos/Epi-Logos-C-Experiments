# AGENTS.md — m-extension-runtime

## Purpose
`@pratibimba/m-extension-runtime` — "Shared runtime adapter for the six M-extensions. Owns the single KernelBridgeAPI consumer, late-subscriber cache, CoordinateContext model, readiness banner, and observability publisher base. Track 07 T1." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]].

## Ownership
- `src/common/index.ts` — package root / public surface (re-exports common + browser helpers).
- `src/common/` — `shared-bridge.ts`, `bridge-api.ts` (KernelBridgeAPI boundary), `coordinate-context.ts`, `readiness.ts` (nine-state taxonomy), `empty-state-registry.ts` (per-extension empty-state registry), `observability.ts`, `profile.ts` (MathemeHarmonicProfile boundary), `preferences-schema.ts`, `recursive-self-review-gate.ts`, `route.ts`, `bridge-readiness.ts`, `contribution-contracts.ts`.
- `src/browser/` — `frontend-module.ts` (Theia frontend), `readiness-banner.tsx`, `cold-start-orchestrator.ts`, `cold-start-splash.tsx`, `intent-target-registration.ts`; plus `status-bar/`, `onboarding/`, `settings/` UI.
- `tests/` — `node --test` `.mjs` suites (bridge-readiness, empty-state-registry, kairos-enablement-step, reset-section, settings-page, cold-start-pasu-gate).
- `style/`, `package.json`, `tsconfig.json`.
- Does NOT own: domain law (lives in each owning M' coordinate extension); the bridge runtime itself (sibling `kernel-bridge`); gateway/gate (delegated to [[S3-SPEC]] / `Body/S/S0/epi-cli`); authoritative profile + readiness schema (Rust in `Body/S/S0/epi-cli`).

## Local Contracts
- Code Coordinate Headers: `src/common/bridge-api.ts`, `coordinate-context.ts`, `readiness.ts`, `profile.ts`, `observability.ts`, `route.ts` (`//**` doc-comments cite 07.T0/07.T1 and the upstream contract files).
- Boundary contract: `../contracts/07-t0-extension-contract-preflight.{json,md}` (consumed, not owned here).
- Owning spec: [[M'-SYSTEM-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule (this is the shared surface for all six M-extensions).
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Extensions consume gateway data only through the `KernelBridgeAPI` boundary — never collapse the nine readiness states to binary; never derive harmonic/profile law locally.

## Verification
`pnpm --dir Body/M/epi-theia/extensions/m-extension-runtime test` (runs `tsc -b` then the `node --test` suites); workspace-wide `pnpm --dir Body/M/epi-theia test:contracts`.

## Child DOX Index
- (leaf)
