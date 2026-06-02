# vendor/legacy/epi-tauri — DEPRECATED MIGRATION BASELINE

**Status:** Frozen 2026-06-01; relocated to `vendor/legacy/` 2026-06-02 — migration-source-only.
**Previous path:** `Body/M/epi-tauri/` (do not recreate)
**Current runtime:** [`Body/M/epi-theia/`](../../../Body/M/epi-theia/)
**Design surface:** [`Idea/Pratibimba/System/`](../../../Idea/Pratibimba/System/) (docs + Subsystems)
**Authority chain:** Track 05 plan body + `m5-prime-system-shape-and-tauri-ide-canon.md` §2-§3 (Theia-only revision) + the 2026-06-02 relocation decision (Pratibimba/System narrowed to design; runtime moved into `Body/M/epi-theia`).

> ## Do not extend this tree.
>
> The Theia canon recast retired the Tauri wrapper. The 2026-06-02 reorg
> then narrowed `Idea/Pratibimba/System/` to a **design surface** (docs/
> + Subsystems/) and moved the executable Theia/Electron application to
> `Body/M/epi-theia/`. Tauri Rust commands either lift into
> `Body/S/S3/gateway` or drop entirely (see migration inventory).
>
> The tests in this directory remain valid as a migration-baseline
> snapshot (`vitest 21/21`, `cargo 49/49` at commit `dd985f7`). They are
> not the working substrate of the application going forward.

## Migration destinations (post-2026-06-02 reorg)

| Source area | Theia destination | Migration disposition |
|---|---|---|
| `src/services/*.ts` (12 files) | `Body/M/epi-theia/extensions/shared-services/` | Tauri-invoke calls → Theia DI service calls against gateway WS/JSON-RPC. |
| `src/stores/*.ts` (7 files) | DI-scoped Theia frontend services / `PreferenceService` / `WorkspaceStorage` | Theia conventions split state by lifetime. |
| `src/components/OmniPanel.tsx` | `Body/M/epi-theia/extensions/omnipanel-shell/` | Port from the deeper Electron source (~960 LOC) at `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx`. |
| `src/components/CommandPalette.tsx` | folded into `Body/M/epi-theia/extensions/omnipanel-shell` commands | Theia's `CommandRegistry` + `QuickInputService` replace it. |
| `src/domains/M{0..5}_*/*` | `Body/M/epi-theia/extensions/m{0..5}-*/src/browser/*` | M-extension wholesale ports, T6. |
| `src/domains/MPrime_Subsystems/*` | `Body/M/epi-theia/extensions/integrated-composition/` | Conversational 4+2 profile surface, T7. |
| `src/domains/ClockCosmos.tsx` | `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/` | Cosmos visualization is a Mahamaya-codon rhythm surface. |
| `src/shell/Shell.tsx`, `WorkspacePanel.tsx`, `src/App.tsx`, `src/main.tsx`, `src/global.d.ts` | DROP | Theia `ApplicationShell` + `LayoutRestorer` + `WorkspaceService` replace them. The two Pratibimba workspace layouts (`daily-0-1`, `ide-deep`) land in `Body/M/epi-theia/extensions/pratibimba-layouts/`. |
| `src/utils/hotkeys.ts` | `Body/M/epi-theia/extensions/shared-services/src/browser/hotkey-bindings.ts` | Becomes Theia `KeybindingContribution`. |
| `src-tauri/src/commands/*.rs` (15 modules, 62 commands) | LIFT TO `Body/S/S3/gateway` | Gateway becomes the substrate-owned authority; Theia consumes via JSON-RPC. |
| `src-tauri/src/{state,events,gateway,graph,temporal,vault,agents,atelier,clock,library,oracle}/*.rs` | LIFT or DROP per inventory | See inventory for per-module disposition. |
| `src-tauri/src/commands/pratibimba.rs` | DROP | Tauri-summon path obsoleted by canon §2-§3. |
| `src-tauri/src/vault/*.rs` (7 files) | DROP — replaced by `s1'.vault.*` over Hen | Per IOD-19; wikilink-integrity logic lives in `Body/S/S1/hen-compiler-core/src/wikilinks.rs`. |
| `decisions/*.{md,json}` | preserved here as historical record | Original Track-05-T0 ADRs (001/002/003) bridged by [ADR-05-009](../../../Idea/Pratibimba/System/docs/decisions/adr-05-009-recast-001-002-003.md). |

## Why this directory still exists

1. The tests (`tests/e2e/*.spec.ts`, `src-tauri/tests/*.rs`, `src/**/*.test.{ts,tsx}`) lock the per-file contract behavior the migration inventory references. Removing them removes the verification evidence the migration relies on.
2. `Body/S/S0/epi-cli/tests/kernel_api_envelope_contract.rs` still reads `src/services/types.ts` here as the canonical envelope-shape mirror.
3. Hard deletion is reserved until the kernel-envelope-mirror reference is re-pointed at a `Body/M/epi-theia` location AND the Theia Electron target is verified runnable end-to-end.

## Next steps for any agent reading this

1. **Do not add code here.** Add it to `Body/M/epi-theia/` per the inventory.
2. **Do not bump dependencies here.** The Tauri build's package versions are frozen at the migration baseline (commit `dd985f7`).
3. **If you need vault read/write/semantic-neighbour functionality**, consume the gateway methods `s1'.vault.*` and `s1'.semantic.*` via the `vault-bridge` Theia extension. Do not extend the `src-tauri/src/vault/` modules here.

## Final removal trigger

This directory becomes a candidate for hard removal when:

1. `Body/S/S0/epi-cli/tests/kernel_api_envelope_contract.rs` has moved its `types.ts` mirror reference to a `Body/M/epi-theia` location (or a portal-core schema export) and the test passes.
2. The Theia Electron target at `Body/M/epi-theia/electron-app/` produces a runnable bundle and the Track 05 T9 acceptance harness has passed with the Theia shell as the sole user-facing app.

Until both conditions are met, this directory persists as migration-source-only.
