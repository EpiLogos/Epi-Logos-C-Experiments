# AGENTS.md — body-lite-surface

## Purpose
The `@pratibimba/body-lite-surface` Theia extension — "Track 09 T9b — /body lite-surface mediation contributions" (per `package.json`): review-alert badge, agent check-in widget, safe-source-handle row, and four typed deep-link intent commands that punch from the 0/1 daily layout into the deep IDE via the OmniPanel CrossLayoutIntentDispatcher; activates only in the 0/1 daily layout with safe-handle-only privacy discipline.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (per-coordinate: [[M4'-SPEC]], [[M5'-SPEC]]).

## Ownership
- `src/common/` — DI-free contract layer: `lite-surface-types.ts` (handle-only shapes), `deep-link-intents.ts` (four typed `/body` → deep-IDE punch-through commands), `snapshot.ts` (pure synthesisers with defensive privacy filter), `index.ts` (common barrel, `EXTENSION_ID`).
- `src/browser/` — Theia frontend: `frontend-module.ts` (DI bindings, daily-0/1-only widget factories), `body-lite-runtime-service.ts` (kernel-bridge subscription + session state), `deep-link-commands.ts` (CommandContribution), and the three `*-widget.tsx` React surfaces.
- `tests/body-lite-surface.test.mjs` — contract tests: daily-layout-only contribution, deep-link payload preservation, idempotent kernel-bridge subscription, forbidden-fields privacy scan.
- `style/body-lite-surface.css`, `package.json`, `tsconfig.json`; `lib/` is build output.
- Does NOT own: the deep half — the Agentic Control Room review/run surface (sibling `../agentic-control-room`); the bridge/gateway runtime (delegated to `../kernel-bridge` -> [[S3-SPEC]] gate); layout definitions (`../pratibimba-layouts`). M4/M5 domain law lives in its owning M' coordinate spec, not here.

## Local Contracts
- Code Coordinate Headers: the `//!`-style doc-comments atop `src/common/{deep-link-intents,lite-surface-types,snapshot}.ts` and the `index.ts` barrel header.
- Workspace boundary: `package.json` `dependencies` (kernel-bridge, pratibimba-layouts, m-extension-runtime, omnipanel-shell, agentic-control-room, ide-shell-m0-m5).
- Owning spec: [[M'-SYSTEM-SPEC]], [[M4'-SPEC]], [[M5'-SPEC]] (no local CONTRACT.md — see parent + Canon).

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Preserve the privacy invariant: never widen lite-surface payloads to carry raw bodies/protected text — `snapshot.ts` is the final defensive filter and tests assert the forbidden-fields scan.
- Keep widgets contributing to the 0/1 daily layout ONLY (no `ide-deep`); route deep access through deep-link intents.

## Verification
`pnpm test` from this directory (`pnpm build && node --test tests/body-lite-surface.test.mjs`); or `pnpm test:contracts` from `Body/M/epi-theia` for the full suite.

## Child DOX Index
- (leaf)
