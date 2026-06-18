# AGENTS.md — omnipanel-shell

## Purpose
`@pratibimba/omnipanel-shell` — "The canonical `/` command membrane for the Pratibimba System Theia shell. Wraps Theia's CommandRegistry into the OmniPanel surface — summons commands across both workspace layouts, routes layout-summon intents, and shows kernel-bridge readiness inline." (per `package.json`). Migration target for `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` + `omni/*` and the `epi-tauri` slim port. Track 05 T2 scaffold; T5 promotes to full cross-layout intent routing.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M'-PORTAL-SPEC]].

## Ownership
- `src/common/` — shared runtime contracts: `omnipanel-types.ts` (`OMNIPANEL_WIDGET_ID`, tab ids, `CrossLayoutIntent`), `omnipanel-runtime.ts`, `omnipanel-session-state.ts`, `dispatch-genealogy.ts`, `index.ts` barrel; plus `ACR-MIGRATION-MAP.md`.
- `src/browser/` — Theia frontend: `frontend-module.ts` (DI binding), `omnipanel-contribution.ts` / `dispatch-trace-contribution.ts` (command + widget contributions), `omnipanel-widget.tsx` (ReactWidget host), `omnipanel-runtime-service.ts`, `slash-command-registry/parser`, stores (zustand), controllers (`epi-claw/`), theme/domain helpers.
- `src/browser/components/omni/` — the ported React tree: `panels/` (Overview, Sessions, Channels, Nodes, Models, Skills, Cron, Logs, Config, Settings, Instances, Diagnostics, Evidence, ReviewPanel, GatewayPanel, ToolStream, DispatchTrace/Evidence, PrivacyDropDiagnostics), `diagnostics/` (kernel-bridge telemetry fold, profile tick/readiness/S2/gateway/layout/intent-log subcomponents), `gateway/` (Gateway tab header, capability list, parity cell, Try-It affordance, and facet wrappers), `chat/`, `layout/`, `ui/`, `sessions/`, `review/`, `tool-stream/`, `contracts/`.
- `tests/` — `node --test` contract suites (session-manager, tool-stream, omnipanel-session-state, dispatch-genealogy, review-panel, gateway-panel, pi-chat, evidence-panel).
- `style/index.css` — extension styles.
- Does NOT own: layout definitions (re-summons commands from `@pratibimba/pratibimba-layouts`), gateway/kernel data (consumed via the kernel-bridge `KernelBridgeAPI`, not direct fetch/WebSocket), or M' subsystem domain law (lives in each owning M' coordinate extension).

## Local Contracts
- No local `CONTRACT.md`. Code Coordinate Header: `src/common/omnipanel-types.ts` `//!`-style doc-comment (DR-WC-OP-1 collapse map) + `src/browser/components/omni/contracts/{panels,modelCatalog,panelRpcParity}.ts`.
- Migration map: `src/common/ACR-MIGRATION-MAP.md`; full port checklist in `README.md`.
- Owning spec: [[M'-PORTAL-SPEC]] (OmniPanel parity) under [[M'-SYSTEM-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Consume gateway/session/readiness data through the kernel-bridge DI services — no direct `fetch`/WebSocket from this extension.
- Per-panel content lands as wholesale port from `Body/S/S3/epi-app/renderer/components/omni/*` (adapt Tauri-invoke/Electron-IPC to Theia DI) — preserve the React tree, do not rewrite.

## Verification
`pnpm test` (runs `pnpm build && node --test tests/*.test.mjs`); or `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
