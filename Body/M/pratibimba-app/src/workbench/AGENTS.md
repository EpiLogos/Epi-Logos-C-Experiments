# AGENTS.md — workbench

## Purpose
`src/workbench` supplies the stable [[M']] frame and typed workspace/activity navigation over the carrier's existing functional surfaces. Canon: [[ARCHITECTURE-DIAGRAM-PACK]] → [[M'-SYSTEM-SPEC]].

## Ownership
- `workbenchModel.ts` owns Home plus [[M0']]-[[M5']] workspace declarations and activity destinations.
- `WorkbenchFrame.tsx` owns title/workspace chrome, activity rail, editor host, bottom operational panel, and status host.
- The frame reads live events, readiness, session/coordinate/profile evidence, and runtime provenance; it does not produce or reinterpret them.
- Does not own pane bodies, FlexLayout models, commands, [[OmniPanel]] state, coordinate domain law, or the complete [[M5']] agent loop.

## Local Contracts
- [[M'-SYSTEM-SPEC]] — stable workbench and one-shell/two-face law.
- [[CHROME-CONTRACT]] — carrier surface and command registration contract.
- [[06-redesign-brief]] — Phase B geometry and migration direction.
- [[13-phase-a-b-foundation-receipt]] — current foundation and open boundary.

## Work Guidance
- Route every activity to a landed command, store, or pane destination; no placeholder targets.
- Preserve functional bodies during migration and move ownership only through the applicable [[M0']]-[[M5']] spec.
- Keep the bottom panel operational and evidence-bearing. Explanatory product copy does not substitute for a real event, readiness report, diff, test, or provenance receipt.

## Verification
- `pnpm vitest run src/workbench/workbenchModel.test.ts src/workbench/WorkbenchFrame.test.tsx src/App.test.tsx`
- `pnpm typecheck && pnpm build`
- Visual inspection at the configured 1280 × 840 default and 900 × 600 minimum native window sizes.

## Child DOX Index
- (leaf)
