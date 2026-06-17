# AGENTS.md — m2-parashakti

## Purpose
The `@pratibimba/m2-parashakti` Theia extension — "M2PrimeMeaningPacket viewer plus deterministic cymatic renderer driven by profile bus and proven correspondence payloads" (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M2'-SPEC]] (architecture: [[M2-ARCHITECTURE]]).

## Ownership
- `package.json` — `@pratibimba/m2-parashakti` workspace package manifest; `theiaExtensions.frontend` -> `lib/browser/frontend-module`.
- `src/common/index.ts` — generated public surface (view ids, command ids, route, privacy class, observability event types, Track 08 contribution/exports). Header: "Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit."
- `src/common/meaning-packet.ts` — `M2_MEANING_PACKET_CONTRACT_VERSION` packet types and selectors.
- `src/browser/` — frontend module + three widgets: meaning-packet, cymatic-engine, correspondence-tree.
- `test/widget-registry.test.mjs` — node:test widget-registry suite.
- `style/index.css`, `tsconfig.json`, `lib/` — styling, TS project config, compiled output.
- Does NOT own: shared runtime (`@pratibimba/m-extension-runtime`), composition primitives (`@pratibimba/integrated-composition`), gateway runtime (`kernel-bridge` -> [[S3-SPEC]] gate), or M2 domain law (lives in the owning M2' coordinate, not centralised here).

## Local Contracts
- Code Coordinate Header: `src/common/index.ts` (generated from `../contracts/07-t0-extension-contract-preflight.json`) + `src/common/meaning-packet.ts`.
- Owning spec: [[M2'-SPEC]] / [[M2-ARCHITECTURE]]; workspace contract: parent `extensions/contracts/`.
- No local CONTRACT.md (see parent + Canon).

## Work Guidance
- `src/common/index.ts` is generated — do not hand-edit; change the source contract preflight in the parent `contracts/` instead.
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Consume gateway data via the shared `KernelBridgeAPI` runtime — no direct `fetch`/WebSocket from the extension.

## Verification
`pnpm --filter @pratibimba/m2-parashakti test` (runs `node --test test/widget-registry.test.mjs` then `tsc -b build`); or `pnpm test:contracts` / `pnpm -r test` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
