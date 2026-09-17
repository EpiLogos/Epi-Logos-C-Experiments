# AGENTS.md — kernel-bridge-readiness

## Purpose
`@pratibimba/kernel-bridge-readiness` (v0.1.0) — "Diagnostic readiness view that reads the real epi gate kernel-bridge endpoint and renders typed readiness states. First non-placeholder Theia contribution per Track 05 T1." (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (gate runtime: [[S3-SPEC]] / [[S3-ARCHITECTURE]]).

## Ownership
- `package.json` — `@pratibimba/*` workspace package; `theiaExtensions` frontend entry `lib/browser/frontend-module`.
- `src/browser/frontend-module.ts` — Inversify `ContainerModule`; binds `KernelBridgeReadinessContribution`, command `pratibimba.kernel-bridge-readiness.open`, widget factory.
- `src/browser/readiness-widget.tsx` — `KernelBridgeReadinessWidget` (React view) + `KERNEL_BRIDGE_READINESS_SOURCE` token.
- `src/browser/gateway-readiness-source.ts` — `GatewayReadinessSource`: reads the real `epi gate` `${baseUrl}/health` JSON (mirrors `epi graph doctor --json`); no mock branch.
- `src/browser/minimal-quick-input.ts` — local `MinimalQuickAccessRegistry` / `MinimalQuickInputService`.
- `src/common/readiness-types.ts` — `KernelBridgeReadinessState` (nine-state taxonomy), `KernelBridgeReadinessSnapshot`, `KernelBridgeReadinessSource`; re-exported via `src/common/index.ts`.
- `style/index.css` — widget styling.
- Does NOT own: the gateway runtime itself (delegated to the [[S3-SPEC]] gate at port 18794 via sibling `kernel-bridge`), nor the readiness taxonomy source-of-truth (lives in `../contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`).

## Local Contracts
- Coordinate Header: `src/common/readiness-types.ts` doc-comment — readiness contract mirrors `../contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy`; `state` is never derived from free-text `reason`.
- `src/browser/gateway-readiness-source.ts` doc-comment — canonical gateway-JSON signal; unreachable resolves to `bridge_unavailable`, never a fake `ready` state.
- Owning spec: [[M'-SYSTEM-SPEC]]; gate delegation [[S3-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Render the typed nine-state taxonomy with explicit blockers — never collapse to a binary ready/not-ready fallback.

## Verification
`pnpm test` here (runs `pnpm build && node ../../scripts/verify-kernel-bridge-readiness-source.mjs`); or `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
