# AGENTS.md — block-kit

## Purpose
The `@pratibimba/block-kit` Theia extension: native Pratibimba block registry, block host, release-gate ownership catalog, gateway-method contract catalog, Human-Gate verdict operation helpers, and markdown/MDX block-doc round-trip utilities.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M5'-SPEC]]

## Ownership
- `src/common/` — `registry.ts` (core block specs, no-orphan owner registrations, gateway-method contract entries), `block-doc.ts` (`toDoc`/`fromDoc` plus markdown/MDX persisted block-doc serializer/parser and `Idea/Empty/Present/{day_id}/` path guard), `verdict-loop.ts` (Human-Gate `blocks.annotate` / `blocks.verdict` session-op helpers and `s4'.psyche.update` renderer patch request), `selection-context.ts` (selection → `s2'.coordinate.context_xray` / `s4'.context.assemble` bridge helper, Psyche context-handle injection, M4-Nara highlight-back port), and `index.ts` public surface.
- `src/browser/` — `BlockHost` React renderer and `BlockHostWidget` Theia widget.
- `tests/` — `node --test` suites for no-orphan ownership, gateway contract ownership, verdict-loop round-trip, block-doc round-trips, and persisted block-doc path residency.
- Does NOT own: block wire types (owned by `@pratibimba/m-extension-runtime`), gateway runtime ([[S3-SPEC]]), review law ([[M5'-SPEC]] / `agentic-control-room` Human Gate), or domain widgets in the six M' extensions.

## Local Contracts
- `src/common/registry.ts` — Coordinate Header for the block-kit public registry and release-gate catalogs.
- `src/common/selection-context.ts` — Coordinate Header for the Track 44.6 selection-to-context seam.
- Parent contract artifact: `../contracts/block-kit-release-gate.json`.
- Owning specs: [[M'-SYSTEM-SPEC]], [[M5'-SPEC]], and Track 44 (`[[44-pratibimba-surface-standard]]`).

## Work Guidance
- Run `gitnexus_impact` before editing exported symbols with existing callers.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Keep core block type ownership one-to-one with `CORE_BLOCK_TYPES`; no test-only owner rows.
- Do not bypass `assertBlockAcceptedByCatalog`; the block host must reject unknown or parity-split block types before render.

## Verification
`pnpm --filter @pratibimba/block-kit test`; closure harness: `pnpm --filter @pratibimba/acceptance-harness test`.

## Child DOX Index
- (leaf)
