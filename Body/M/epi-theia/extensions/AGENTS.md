# AGENTS.md — extensions

## Purpose
The pnpm-workspace of Theia extensions for the Pratibimba System — "Theia extensions for M' subsystems, layouts, bridge, plugins, and acceptance harness" (per `../README.md`). Hosts the six M' subsystem extensions, two integrated plugins, the kernel-bridge, IDE shell, layouts, and the acceptance/release-gate harness.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (per-coordinate: [[M0'-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M5'-SPEC]]).

## Ownership
- `test/` — cross-extension contract + acceptance test suite driven by `../package.json`'s `test:contracts` script (`node --test`).
- `scripts/` — workspace tooling: `scaffold-m-extensions.mjs`, `scaffold-integrated-plugins.mjs`, design-token generation/validation, `eslint-rules/`, contract preflight validators.
- `contracts/` — implementation-control contract artifacts (extension/composition preflight JSON+MD, `ui-design-tokens.{ts,json,md}`, `ui-typography.{ts,md}`, UI foundation/composition rules). No package — pure contract docs.
- `MIGRATION-SOURCES.md` — operational index mapping each extension to its legacy `epi-tauri`/`epi-app` migration sources.
- Each subdirectory listed below — its own `@pratibimba/*` workspace package with local `package.json`, `src/`, `tests/`.
- Does NOT own: domain law (lives in each owning M' coordinate extension, not centralised here), gateway runtime (delegated to [[S3-SPEC]] gate at port 18794 via `kernel-bridge`), or Electron/browser app targets (sibling `../electron-app`, `../theia-app`).

## Local Contracts
- `contracts/07-t0-extension-contract-preflight.{json,md}` — six M-extension boundary contract against `KernelBridgeAPI`.
- `contracts/08-t0-composition-contract-preflight.{json,md}` — Track 08 integrated-plugin composition contract.
- `contracts/ui-design-tokens.ts` + `ui-typography.ts` — binding UI token/typography surface.
- Owning spec: [[M'-SYSTEM-SPEC]] and the per-coordinate M' specs above.

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- All surfaces consume gateway data through `KERNEL_BRIDGE_API.invokeCapability` — no direct `fetch`/WebSocket from extensions.
- New scaffolded extensions must add a row to `MIGRATION-SOURCES.md` and pass the contract-preflight validators in `scripts/`.

## Verification
`pnpm test:contracts` from `Body/M/epi-theia` (runs the full `node --test` suite in `test/`); per-package `pnpm -r test`; `pnpm -r lint`.

## Child DOX Index
- `m0-anuttara/AGENTS.md` — [[M0']] Anuttara extension: language-map browser + OWL/SHACL provenance inspector over bridge-mediated S2 graph queries.
- `m1-paramasiva/AGENTS.md` — [[M1']] Paramasiva extension: profile clock instrument with 84-state walk and exact audio bus consumption.
- `m1-paramasiva-played-torus/AGENTS.md` — RETIRING — do not build on this. M1-2/M1-5 played K2 torus Bevy/wgpu renderer surface; consult before extending.
- `m2-parashakti/AGENTS.md` — [[M2']] Parashakti extension: M2PrimeMeaningPacket viewer + deterministic cymatic renderer.
- `m3-mahamaya/AGENTS.md` — [[M3']] Mahamaya extension: 64/472 wheel with backend codon projection, provenance, and trace overlay.
- `m4-nara/AGENTS.md` — [[M4']] Nara extension: protected Nara DayContainer + Graphiti browser with consent/privacy gates.
- `m5-epii/AGENTS.md` — [[M5']] Epii extension: review queue + spine-state inspector over real S5 review/improve DTOs.
- `m-extension-runtime/AGENTS.md` — shared runtime adapter for the six M-extensions (single `KernelBridgeAPI` consumer, CoordinateContext, readiness banner).
- `ide-shell-m0-m5/AGENTS.md` — M0/M5 IDE chrome: Bimba graph viewer, Canon Studio host, Agentic Control Room shell host; ide-deep layout only.
- `agentic-control-room/AGENTS.md` — Agentic Run/Review/Autoresearch E2E shell with human-required gate (IOD-17 parity).
- `kernel-bridge/AGENTS.md` — first-loaded extension bridging the frontend to the `Body/S/S0/epi-cli` gate (port 18794) via WebSocket/JSON-RPC; publishes `KernelBridgeAPI`.
- `kernel-bridge-readiness/AGENTS.md` — diagnostic readiness view over the real epi gate kernel-bridge endpoint.
- `omnipanel-shell/AGENTS.md` — the canonical `/` command membrane wrapping Theia's CommandRegistry into the OmniPanel surface.
- `pratibimba-layouts/AGENTS.md` — workspace-layout contributions: `daily-0-1.layout` + `ide-deep.layout` + LayoutSwitcher.
- `integrated-composition/AGENTS.md` — shared composition coordinator (LayoutClaim arbitration, IntegratedReadiness) for the Track 08 integrated plugins.
- `plugin-integrated-1-2-3/AGENTS.md` — Cosmic Engine integrated plugin (M1/M2/M3 spine, 137 = 64 + 72 + 1).
- `plugin-integrated-4-5-0/AGENTS.md` — Jiva-Siva integrated plugin (M4 protected-local + M5 review/consent + M0 prior-ground).
- `canon-studio/AGENTS.md` — Monaco markdown editing with QL/Bimba decorations, Smart Connections, Hen vault writes via `s1'.vault.*`.
- `logos-atelier/AGENTS.md` — standalone Logos Atelier etymology surface via Anima-dispatched Aletheia crystallisation mode.
- `backend-studio/AGENTS.md` — LSP contributions (rust-analyzer, clangd, pylsp) with provenance for epi-lib, portal-core, S1-S5 cores.
- `body-lite-surface/AGENTS.md` — `/body` lite-surface mediation: review-alert badge, agent check-in, deep-link intents; 0/1 daily layout only.
- `pi-runtime-monitor/AGENTS.md` — read-only terminal-backed execution observability (see local TERMINAL-OBSERVABILITY-CONTRACT.md).
- `acceptance-harness/AGENTS.md` — full Theia-shell acceptance harness + release gate (Track 05 T9, ADR-05-011).
- `contracts/AGENTS.md` — implementation-control contract artifacts and UI design-token/typography source (no runtime package).
