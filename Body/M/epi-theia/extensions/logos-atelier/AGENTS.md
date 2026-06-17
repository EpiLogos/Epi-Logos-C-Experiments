# AGENTS.md — logos-atelier

## Purpose
The `@pratibimba/logos-atelier` Theia extension: "Standalone Logos Atelier Theia surface for etymology scent-following through Anima-dispatched Aletheia crystallisation mode" (per `package.json` `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (Aletheia crystallisation / world-return: [[M5'-SPEC]]).

## Ownership
- `package.json` — `@pratibimba/logos-atelier` workspace package; `theiaExtensions` frontend = `lib/browser/atelier-widget`.
- `src/common/atelier-surface.ts` — common surface: widget/command ids, etymology namespace + URI scheme, Anima/Aletheia constants, `ALETHEIA_TOOL_GUARDIANS`, `ScentFollowingStageId`, `s5'.gnostic.*` method types, and helpers (`buildAtelierGatewayParams`, `buildMobiusWriteBackProposal`, `etymologyUriFor`, `isAtelierPrivacySafe`).
- `src/browser/atelier-widget.tsx` — browser `ReactWidget` + view/command contribution; consumes `KERNEL_BRIDGE_API` and the `m-extension-runtime` `BridgeReadinessBadge`.
- `tests/atelier-surface.test.mjs` — `node --test` unit suite over the common surface.
- Does NOT own: gateway runtime (delegated to the [[S3-SPEC]] gate via `@pratibimba/kernel-bridge` → port 18794), shared bridge/readiness adapter (`@pratibimba/m-extension-runtime`), or canon promotion (Gnostic write-back proposals route through Aletheia mode, not direct vault writes). Domain law lives in [[M5'-SPEC]], not here.

## Local Contracts
- Code Coordinate Header: `src/common/atelier-surface.ts` (the exported surface IS the binding interface — no `//!`/header doc-comment present).
- No local `CONTRACT.md` or `README.md`.
- Owning spec: [[M'-SYSTEM-SPEC]] -> [[M5'-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol in `atelier-surface.ts` (it is consumed by `atelier-widget.tsx` and the test suite); honour the d=1 WILL-BREAK rule.
- Reach the gateway only through `KERNEL_BRIDGE_API` — no direct `fetch`/WebSocket from this extension.
- [[wikilink]] all coordinate/spec/carrier/agent references in any authored artifact.

## Verification
`pnpm --filter @pratibimba/logos-atelier test` (runs `pnpm build` then `node --test tests/atelier-surface.test.mjs`); workspace-wide `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
