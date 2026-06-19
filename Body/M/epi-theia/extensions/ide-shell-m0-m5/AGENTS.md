# AGENTS.md — ide-shell-m0-m5

## Purpose
The `@pratibimba/ide-shell-m0-m5` Theia extension — "M0/M5 IDE chrome (Track 05 T4). Bimba graph viewer, Canon Studio markdown editor (vault-bridge-routed saves), Agentic Control Room shell host, Bimba coordinate tree, Logos Atelier, evidence + review + autoresearch panes." All surfaces consume gateway data through `KERNEL_BRIDGE_API.invokeCapability`; activates only in the `ide-deep` layout.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (per-coordinate: [[M0'-SPEC]], [[M5'-SPEC]]).

## Ownership
- `CHROME-CONTRACT.md` — single source of truth for the M0'/M5'/shared chrome partition (audit-extend, never rebuild).
- `package.json` — workspace package + Theia frontend module (`lib/browser/frontend-module`).
- `src/browser/` — frontend widgets: `bimba-graph-viewer`, `canon-studio`, `coordinate-tree` (M0' chrome); `logos-atelier`, `evidence-pane`, `review-pane`, `autoresearch-pane`, `agentic-control-room` (M5' chrome); `acr/PiAxiomTranslationInspector` as an ACR sub-pane; `activity-bar/` left-sidebar mode contribution; `bridge-gate` (shared readiness); plus `frontend-module.ts` (DI wiring), first-build stubs `backend-studio/`, `smart-connections/`, and services `privacy-drop-feed.ts` / `pi-axiom-translation-service.ts`.
- `src/common/` — Node-safe barrel (`index.ts`) re-exporting `contract.ts`, `capability-matrix-types.ts`, `graph-types.ts`, `decorations.ts`, `vault-bridge-gate.ts`.
- `tests/` — contract tests (`contract.test.mjs`, `canon-studio-save-routing.test.mjs`, `privacy-drop-feed.test.mjs`).
- `style/ide-shell.css` — chrome styling.
- Does NOT own: gateway runtime (delegated via `@pratibimba/kernel-bridge`), graph canon mutation (`mutatesGraphCanon: false` — renderers request governed actions only), or M' domain law (lives in each owning M' coordinate extension, not here by convenience).

## Local Contracts
- `CHROME-CONTRACT.md` — partition table, per-widget slot assignment, SharedBridgeAdapter-only network rule, nine-id readiness taxonomy, privacy/profile-tick discipline, DR cross-reference (DR-M0-1, DR-M5-1, DR-MP-1/2/3, DR-WC-IS-1/2/3, DR-IG-1, DR-TS-1).
- `src/common/contract.ts` — Coordinate Header for owned contribution/widget ids.
- `CHROME-CONTRACT.md` also pins `CHROME-CONTRACT.md`; owning specs: [[M0'-SPEC]], [[M5'-SPEC]], [[M'-SYSTEM-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Cite the relevant `CHROME-CONTRACT.md` section before adding chrome; preserve `SharedBridgeAdapter` as the only network primitive and `kernel-bridge` readiness as the only readiness primitive. No direct `fetch`/WebSocket; route all gateway calls through `KERNEL_BRIDGE_API.invokeCapability`.
- Every payload must pass `isPrivacySafe()` before any state/render/persist/bridge-emit.

## Verification
`pnpm test` (runs `pnpm build` then `node --test tests/contract.test.mjs tests/canon-studio-save-routing.test.mjs tests/privacy-drop-feed.test.mjs`); or `pnpm --dir Body/M/epi-theia test:contracts` for the full cross-extension suite.

## Child DOX Index
- (leaf)
