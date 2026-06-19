# AGENTS.md — agentic-control-room

## Purpose
Theia extension `@pratibimba/agentic-control-room`: "Track 05 T8 — Agentic Run/Review/Autoresearch E2E. Builds the full run flow inside the Agentic Control Room shell (provided by ide-shell-m0-m5/T4): VAK evaluation, route + actor selection, capability tree, run tree, tool stream, diagnostics, abort/retry/continue, evidence deposition, and review decision controls. Enforces the human-required gate at the UI parallel to the gateway-side enforcement (IOD-17 three-way parity)." (per `package.json`)
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M5'-SPEC]] / [[M5-ARCHITECTURE]] (see also [[M'-SYSTEM-SPEC]]).

## Ownership
- `src/common/index.ts` — common barrel; `EXTENSION_ID`, `ACR_WIDGET_IDS` (run-tree / tool-stream / diagnostics / pi-runtime-monitor).
- `src/common/run-model.ts` — run model: canonical actor/route types (`pi` / `anima` / `aletheia`, with guardian specificity carried by `AletheiaTechneClass` / `techneClass`), human-gate (`enforceHumanGate`), evidence envelope (`buildEvidenceEnvelope`, `missingEvidenceFields`), review transitions; routes via `KERNEL_BRIDGE_API.invokeCapability`.
- `src/common/parity.ts` — IOD-17 three-way `assertCapabilityParity` (UI vs gateway capability set).
- `src/browser/frontend-module.ts` — Theia frontend module: widget factory, view contribution, intent-target registration.
- `src/browser/run-flow-widget.tsx` — run-tree/tool-stream/diagnostics + abort/retry/continue + evidence + review controls.
- `src/browser/pi-runtime-monitor-view.tsx` — PI runtime monitor view.
- `src/browser/acr-runtime-service.ts` — runtime service consuming kernel-bridge events.
- `tests/` — `node --test` suites: run-flow, human-gate, evidence-envelope, pi-runtime-monitor.
- `style/acr.css` — extension styles.
- `12.13-shared-intelligence-seam-runtime-audit.md` — [[S4]] <-> [[S5]] shared-intelligence seam audit for 3072-dimensional [[Bimba]]/[[Gnosis]], cross-namespace edge naming, `resonance72`, and [[Pi]]-monitor framing.
- Does NOT own: the agentic shell chrome / VAK + capability tree (delegated to [[ide-shell-m0-m5]]'s T4 shell host); gateway runtime + gateway-side gate enforcement (delegated to [[S3-SPEC]] gate via `@pratibimba/kernel-bridge`); M5 domain law (lives in the M5' coordinate extension, not centralised here).

## Local Contracts
- Coordinate Header: `src/common/run-model.ts` and `src/common/parity.ts` `//!`-style header doc-comments.
- Audit artifact: `12.13-shared-intelligence-seam-runtime-audit.md` (flags [[M5'-SPEC]] / [[M5-ARCHITECTURE]] follow-up for the Pi-runtime-monitor contract surface).
- Owning spec: [[M5'-SPEC]] / [[M5-ARCHITECTURE]] (IOD-17 parity + S5 review/improve loop).
- No local CONTRACT.md (see parent `../AGENTS.md` and Canon).

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- All gateway access flows through `KERNEL_BRIDGE_API.invokeCapability` — no direct `fetch`/WebSocket from this extension.
- Preserve the IOD-17 three-way parity: UI-enforced human gate MUST mirror gateway-side enforcement (`assertCapabilityParity`).

## Verification
`pnpm test` from this directory (runs `tsc -b` then `node --test tests/run-flow.test.mjs tests/human-gate.test.mjs tests/evidence-envelope.test.mjs tests/pi-runtime-monitor.test.mjs`); workspace-wide `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
