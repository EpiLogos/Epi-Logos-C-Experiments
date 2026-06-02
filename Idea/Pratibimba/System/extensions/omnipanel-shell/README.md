# `@pratibimba/omnipanel-shell`

**Track 05 T2 scaffold; T5 promotes to canonical `/` command membrane.**

The OmniPanel is the canonical `/` command membrane for the Pratibimba System Theia shell. It wraps Theia's `CommandRegistry` into a tabbed surface that summons commands across both workspace layouts and routes layout-summon intents.

## Migration source

This extension is the destination for **two source-A artifacts** and **one source-B sub-tree**:

| Source | LOC | Theia destination | Disposition |
|---|---|---|---|
| `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` | ~960 | `src/browser/omnipanel-widget.tsx` | **Wholesale port — adapted, not rewritten.** Tauri-invoke calls become Theia DI service calls; Electron IPC becomes Theia frontend↔backend module pattern; the React tree itself is preserved. |
| `Body/S/S3/epi-app/renderer/components/omni/{chat,contracts,layout,panels,ui}/` | ~26 files | `src/browser/{chat,layout,panels,ui}/` and `src/common/contracts/` | **Wholesale port.** 12 sub-panels (Overview, Chat, Channels, Sessions, Nodes, Models, Skills, Cron, Logs, Config, Settings, Instances, Debug) + 3 layout components + 3 chat files + 3 contracts + 4 UI primitives. |
| `Body/M/epi-tauri/src/components/OmniPanel.tsx` | 281 | — superseded by source-B | The Tauri slim port is shallower than the Electron source. Drop the Tauri version; use the source-B port. |
| `Body/M/epi-tauri/src/components/CommandPalette.tsx` | — | folded into OmniPanel commands | Theia's built-in `CommandRegistry` + `QuickInputService` provide the palette UX; this extension contributes only the Pratibimba command set. |

The T2 scaffold lands the structural skeleton (widget id, tabbed layout, layout-aware tab visibility, layout-switch buttons wired to `@pratibimba/pratibimba-layouts` commands). Per-panel content arrives as wholesale port from `Body/S/S3/epi-app/renderer/components/omni/panels/*` across T2 → T5.

## Tabs at this scaffold

`OMNIPANEL_TABS` (in `src/common/omnipanel-types.ts`) declares the 13 production tabs and which workspace layouts surface each one. Tabs that exist only in the deep IDE layout hide automatically in the 0/1 daily layout via the `availableInLayouts` filter — the OmniPanel re-renders whenever `PratibimbaLayoutSwitcher.onLayoutChange` fires.

## Commands

| Command id | Label |
|---|---|
| `pratibimba.omnipanel.open` | Pratibimba: Open OmniPanel |
| `pratibimba.omnipanel.toggle` | Pratibimba: Toggle OmniPanel |

Plus the layout commands from `@pratibimba/pratibimba-layouts` are re-summoned from the OmniPanel header buttons:

| Command id (re-summoned) | Source |
|---|---|
| `pratibimba.layout.switch-to-daily` | `@pratibimba/pratibimba-layouts` |
| `pratibimba.layout.switch-to-ide-deep` | `@pratibimba/pratibimba-layouts` |
| `pratibimba.layout.toggle` | `@pratibimba/pratibimba-layouts` |

## What lands next (T5)

Per Track 05 T5 deliverables:

1. **Cross-layout intent envelope.** `CrossLayoutIntent` is declared in `src/common/omnipanel-types.ts`; T5 implements routing via Theia's Command Registry with the requested layout materialised before the contribution opens.
2. **Electron menu/tray/dock integration** (when the Electron target lands — see ADR-05-004; flagged as forward work).
3. **Optional `epi-logos://` URL scheme** for external invocation.
4. **OS-level wake/sleep handling** so the bridge can mark subscriptions stale during sleep.

## Tests

T2 verification lines this extension addresses (deferred to actual install/build):

- "The omni-panel summons commands registered by both layouts; commands registered by the deep IDE layout remain invokable from the 0/1 layout where appropriate." — OmniPanelWidget filters tabs by `availableInLayouts` but the underlying commands stay registered, so command-palette invocation works across layouts.

T5 verification lines this extension will fully address:

- "OmniPanel parity tests call gateway/session/readiness methods through the kernel-bridge DI services, not separate command shims."

## Per-panel wholesale-port checklist (T2 → T5)

When the source-B port executes:

- [ ] `src/browser/chat/ChatPanel.tsx` ← `omni/chat/ChatPanel.tsx`
- [ ] `src/browser/chat/attachments.ts` ← `omni/chat/attachments.ts`
- [ ] `src/browser/chat/message-normalizer.ts` ← `omni/chat/messageNormalizer.ts`
- [ ] `src/common/contracts/model-catalog.ts` ← `omni/contracts/modelCatalog.ts`
- [ ] `src/common/contracts/panel-rpc-parity.ts` ← `omni/contracts/panelRpcParity.ts`
- [ ] `src/common/contracts/panels.ts` ← `omni/contracts/panels.ts`
- [ ] `src/browser/layout/AdvancedDrawer.tsx` ← `omni/layout/AdvancedDrawer.tsx`
- [ ] `src/browser/layout/OmniPanelHeader.tsx` ← `omni/layout/OmniPanelHeader.tsx`
- [ ] `src/browser/layout/PrimaryTabs.tsx` ← `omni/layout/PrimaryTabs.tsx`
- [ ] `src/browser/panels/{Channels,Config,Cron,Debug,Instances,Logs,Models,Nodes,Overview,Sessions,Settings,Skills}Panel.tsx` ← `omni/panels/*Panel.tsx`
- [ ] `src/browser/panels/panel-utils.ts` ← `omni/panels/panelUtils.ts`
- [ ] `src/browser/ui/{button,card,input,tabs}.tsx` ← `omni/ui/{button,card,input,tabs}.tsx`
