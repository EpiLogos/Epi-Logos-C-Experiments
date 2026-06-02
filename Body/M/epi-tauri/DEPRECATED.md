# Body/M/epi-tauri — DEPRECATED

**Status:** Deprecated 2026-06-01 (evening) — migration-source-only.
**Authority:** [Track 05 plan body](../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md) + [m5-prime-system-shape-and-tauri-ide-canon.md §2-§3](../../../Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md) (Theia-only revision).
**Migration inventory:** [Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/migration-inventory.md](../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/migration-inventory.md)

> ## Do not extend this tree.
>
> The Theia-only canon recast retired the Tauri wrapper entirely. The
> destination Theia shell at [`Idea/Pratibimba/System/`](../../../Idea/Pratibimba/System/)
> absorbs all renderer content, typed services, M-domain widgets, and
> OmniPanel logic. Tauri Rust commands either lift into the external
> `Body/S/S3/gateway` Rust process or drop entirely (see migration
> inventory for the per-file disposition).
>
> The tests in this directory remain valid as a migration-baseline
> snapshot (`vitest 21/21`, `cargo 49/49` at commit `dd985f7`). They are
> not the working substrate of the application going forward.

## Migration destinations

| Source area | Lines of code | Theia destination | Migration disposition |
|---|---|---|---|
| `src/services/*.ts` (12 files) | ~1.5 kLOC | `Idea/Pratibimba/System/extensions/shared-services/` (forward) | Tauri-invoke calls → Theia DI service calls against gateway WS/JSON-RPC. |
| `src/stores/*.ts` (7 files) | ~0.8 kLOC | DI-scoped Theia frontend services / `PreferenceService` / `WorkspaceStorage` | Theia conventions split state by lifetime. |
| `src/components/OmniPanel.tsx` | 281 | superseded by `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` (~960 LOC) | Use Electron source's depth, port into `extensions/omnipanel-shell/`. |
| `src/components/CommandPalette.tsx` | — | folded into `extensions/omnipanel-shell` commands | Theia's `CommandRegistry` + `QuickInputService` replace it. |
| `src/domains/M{0..5}_*/*` | per M-domain | `extensions/m{0..5}-*/src/browser/*` | M-extension wholesale ports, T6. |
| `src/domains/MPrime_Subsystems/*` | — | `extensions/integrated-composition/` | Conversational 4+2 profile surface, T7. |
| `src/domains/ClockCosmos.tsx` | — | `extensions/m3-mahamaya/src/browser/` | Cosmos visualization is a Mahamaya-codon rhythm surface. |
| `src/shell/Shell.tsx`, `WorkspacePanel.tsx`, `src/App.tsx`, `src/main.tsx`, `src/global.d.ts` | — | DROP | Theia `ApplicationShell` + `LayoutRestorer` + `WorkspaceService` replace them. The two Pratibimba workspace layouts (`daily-0-1`, `ide-deep`) land in `extensions/pratibimba-layouts/`. |
| `src/utils/hotkeys.ts` | — | `extensions/shared-services/src/browser/hotkey-bindings.ts` | Becomes Theia `KeybindingContribution`. |
| `src-tauri/src/commands/*.rs` (15 modules, 62 commands) | ~6 kLOC | LIFT TO `Body/S/S3/gateway` (dependencies on active thread) | Gateway becomes the substrate-owned authority; Theia consumes via JSON-RPC. |
| `src-tauri/src/{state,events,gateway,graph,temporal,vault,agents,atelier,clock,library,oracle}/*.rs` | ~5 kLOC | LIFT or DROP per inventory | See inventory for per-module disposition. |
| `src-tauri/src/commands/pratibimba.rs` | — | DROP | Tauri-summon path obsoleted by canon §2-§3. |
| `src-tauri/src/vault/*.rs` (7 files) | — | DROP — replaced by `s1'.vault.*` over Hen | Per IOD-19; wikilink-integrity logic lives in `Body/S/S1/hen-compiler-core/src/wikilinks.rs`. |
| `decisions/*.{md,json}` | — | preserved as historical record | Original Track-05-T0 ADRs (001/002/003) bridged by [ADR-05-009](../../../Idea/Pratibimba/System/docs/decisions/adr-05-009-recast-001-002-003.md) at the new home. |

## Why this directory still exists

1. The tests (`tests/e2e/*.spec.ts`, `src-tauri/tests/*.rs`, `src/**/*.test.{ts,tsx}`) lock the per-file contract behavior the migration inventory references. Removing them removes the verification evidence the migration relies on.
2. `Body/S/S0/epi-cli/src/app/mod.rs` still routes `epi app {launch,dev,build}` here pending the cross-cutting re-wiring task — flagged in the migration inventory under "Cross-cutting finding: `epi app` and `epi up` need re-wiring".
3. Hard deletion is reserved until the active-thread re-wiring lands AND the Theia Electron target is verified runnable.

## Next steps for any agent reading this

1. **Do not add code here.** Add it to the Theia destination per the inventory.
2. **Do not bump dependencies here.** The Tauri build's package versions are frozen at the migration baseline.
3. **If you need vault read/write/semantic-neighbour functionality**, consume the gateway methods `s1'.vault.*` and `s1'.semantic.*` via the future `vault-bridge` Theia extension (Track 05 T4.5, gated on Track 03 T6.5). Do not extend the `src-tauri/src/vault/` modules here.

## Final removal trigger

This directory becomes a candidate for hard removal when:

1. `Body/S/S0/epi-cli/src/app/mod.rs` has flipped its `app_source_dir` to `Idea/Pratibimba/System/theia-app/electron-app` and the locked tests have been renamed/updated.
2. The Theia Electron target produces a runnable bundle (Track 05 T1-amendment or T2 extension if needed).
3. Track 05 T9 acceptance harness has passed with the Theia shell as the sole user-facing app.

Until all three conditions are met, this directory persists as migration-source-only.
