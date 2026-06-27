# AGENTS.md — m2-parashakti

## Purpose
The `@pratibimba/m2-parashakti` Theia extension — "M2PrimeMeaningPacket viewer plus deterministic cymatic renderer driven by profile bus and proven correspondence payloads" (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M2'-SPEC]] (architecture: [[M2-ARCHITECTURE]]).

## Ownership
- `package.json` — `@pratibimba/m2-parashakti` workspace package manifest; `theiaExtensions.frontend` -> `lib/browser/frontend-module`.
- `src/common/index.ts` — generated public surface (view ids, command ids, route, privacy class, observability event types, Track 08 contribution/exports). Header: "Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit."
- `src/common/meaning-packet.ts` — `M2_MEANING_PACKET_CONTRACT_VERSION` packet types and selectors.
- `src/common/composition.ts` — `M2CymaticTextureContribution` data-shape builder for the Track 23.12 Cosmic Engine texture mount; also the Layer C variant registry (`M2_SURFACE_VARIANT_REGISTRY` / `M2SurfaceVariantStatus` / `m2SurfaceVariantIsDeferred`), where `'spheres' → 'deferred-23.9'` names the deferred solar-anchor carrier (23.9). Exported as `@pratibimba/m2-parashakti/common/composition`.
- `src/browser/` — frontend module + three widgets: meaning-packet, cymatic-engine, correspondence-tree; `empty-state.tsx` supplies the first-render empty-state surface; `components/` holds M2-owned React sub-surfaces used by those widgets, including the shadow-decan reveal panel, visual-only audio-bus stack, cymatic pause/scrub transport, deterministic Chladni plate canvas, `PlanetaryElementalFeed` (`kernelBridge.m2.planetaryElementalWeights()` producer surface), `CymaticMonoPolyEngine` (`kernelBridge.m2.cymaticMonoPolyState(address72)` producer surface), the deferred `CymaticSpheresSurface` (23.9 named-but-unbuilt 'spheres' carrier — renders a "pending — solar anchor variant" tile, full spherical-harmonic renderer reserved for a follow-on tranche), and inline provenance badges. Standalone browser widgets do not consume `M2CymaticTextureContribution` directly.
- `test/widget-registry.test.mjs`, `test/outer-planet-pending.test.mjs`, `test/shadow-decan.test.mjs`, `test/audio-bus-visual.test.mjs`, `test/provenance-inline.test.mjs`, `test/cymatic-transport.test.mjs`, `test/cymatic-determinism.test.mjs`, `test/cymatic-spheres-deferred.test.mjs`, `test/planetary-elemental-feed.test.mjs`, and `test/cymatic-monopoly-engine.test.mjs` — node:test suites for widget registration, pending-data honesty, the 108-cell shadow-decan surface, the no-sound audio-bus visual representation, packet-bound inline provenance badges, accessible cymatic pause/scrub replay, byte-identical cymatic wave/canvas determinism, the deferred 'spheres' variant registry + non-crashing pending tile, the planetary-elemental feed bridge projection, and the cymatic MonoPoly bridge projection.
- `style/index.css`, `tsconfig.json`, `lib/` — styling, TS project config, compiled output.
- Does NOT own: shared runtime (`@pratibimba/m-extension-runtime`), composition primitives (`@pratibimba/integrated-composition`), gateway runtime (`kernel-bridge` -> [[S3-SPEC]] gate), or M2 domain law (lives in the owning M2' coordinate, not centralised here).

## Local Contracts
- Code Coordinate Header: `src/common/index.ts` (generated from `../contracts/07-t0-extension-contract-preflight.json`) + `src/common/meaning-packet.ts` + `src/common/composition.ts`.
- Owning spec: [[M2'-SPEC]] / [[M2-ARCHITECTURE]]; workspace contract: parent `extensions/contracts/`.
- No local CONTRACT.md (see parent + Canon).

## Work Guidance
- `src/common/index.ts` is generated — do not hand-edit; change the source contract preflight in the parent `contracts/` instead.
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Consume gateway data via the shared `KernelBridgeAPI` runtime — no direct `fetch`/WebSocket from the extension.

## Verification
`pnpm --filter @pratibimba/m2-parashakti test` (runs focused node:test suites then `tsc -b build`); focused checks: `pnpm --filter @pratibimba/m2-parashakti test:outer-planet-pending`, `pnpm --filter @pratibimba/m2-parashakti test:shadow-decan`, `pnpm --filter @pratibimba/m2-parashakti test:audio-bus-visual`, `pnpm --filter @pratibimba/m2-parashakti test:provenance-inline`, `pnpm --filter @pratibimba/m2-parashakti test:cymatic-transport`, `pnpm --filter @pratibimba/m2-parashakti test:cymatic-determinism`, `pnpm --filter @pratibimba/m2-parashakti test:cymatic-spheres-deferred`, `pnpm --filter @pratibimba/m2-parashakti test:planetary-elemental-feed`, `pnpm --filter @pratibimba/m2-parashakti test:cymatic-monopoly-engine`; or `pnpm test:contracts` / `pnpm -r test` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
