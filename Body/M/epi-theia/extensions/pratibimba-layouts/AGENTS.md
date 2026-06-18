# AGENTS.md — pratibimba-layouts

## Purpose
The `@pratibimba/pratibimba-layouts` Theia extension — "Workspace-layout contributions for the Pratibimba System Theia shell. Provides daily-0-1.layout (first-mounted lean free-flow layout) and ide-deep.layout (summoned heavy IDE workbench) plus a LayoutSwitcher service" (per `package.json` description). Track 05 T2/T5 deliverable.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]].

## Ownership
- `package.json` — `@pratibimba/pratibimba-layouts` workspace package; declares the `frontend` Theia extension (`lib/browser/frontend-module`).
- `src/common/layout-types.ts` — canonical layout ids (`daily-0-1`, `ide-deep`) and descriptor types.
- `src/common/cross-layout-intent.ts` — `CrossLayoutIntent` payload, routing rules, and browser telemetry event (Track 05 T5).
- `src/common/index.ts` — package barrel (re-exports common + browser surface).
- `src/browser/layout-switcher.ts` — `PratibimbaLayoutSwitcher` service; toggles layouts via Theia `ApplicationShell`/`LayoutRestorer`/`PreferenceService`.
- `src/browser/layout-commands.ts` — `pratibimba.layout.*` command + menu contributions.
- `src/browser/cross-layout-intent-dispatcher.ts` — routes intents through Theia `CommandRegistry`.
- `src/browser/session-state-service.ts` — cross-layout state preservation landing-zone.
- `src/browser/{frontend-module,tokens,index}.ts` — DI wiring, hoisted tokens, browser barrel.
- `lib/` — compiled `tsc -b` output (build artifact).
- Does NOT own: concrete widget materialisation (deferred to each owning M-extension via `onLayoutChange`), bridge subscription identity (held by `kernel-bridge` DI singletons), or gateway runtime ([[S3-SPEC]] gate at port 18794).

## Local Contracts
- Coordinate Header: `src/common/layout-types.ts` and `src/common/cross-layout-intent.ts` `//**...*/` doc-headers (canon §2-§3 single-process / single-renderer law; intent routing rules; CrossLayoutIntent telemetry publication).
- Owning spec: [[M'-SYSTEM-SPEC]].
- (No local CONTRACT.md — see parent `../AGENTS.md` + Canon.)

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol (`PratibimbaLayoutSwitcher`, `CrossLayoutIntent`, layout ids); honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Layout switching must preserve selected-coordinate / session-key / bridge-connection identity via `PreservedLayoutState` — do not open a second bridge subscription on switch.
- Keep DI tokens in `src/browser/tokens.ts` (no-import file) to avoid undefined-token circular-import decoration bugs.

## Verification
`pnpm --filter @pratibimba/pratibimba-layouts test` (which runs `pnpm build` / `tsc -b`); cross-extension contract suite via `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
