# `m0-anuttara` — Extension Architecture

This document is the IDE-side mirror of the canonical M0 architecture doc at
`Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`. Where they disagree, the seed
doc is authoritative for the matheme; this doc is authoritative for the
Theia extension package shape, contributions, and IDE wiring.

## Contract Version

- Cycle-3 design-reconciliation, six-layer engagement system. Contract version `0.2.0` (proposed for tranche 01.1 / 09.1 landing).
- Extends — does not rebuild — the cycle-2 readable-graph + inspector skeleton at `0.1.0`.

## Package Shape (current + expected)

```
extensions/m0-anuttara/
  package.json                     # @pratibimba/m0-anuttara@0.1.0 (→ 0.2.0 with six-layer)
  README.md
  ARCHITECTURE.md                  # this document
  style/                           # widget styles
  src/
    common/
      index.ts                     # EXTENSION_ID, VIEW_IDS, COMMAND_IDs, TRACK_08_CONTRIBUTION
      m0-inspector.ts              # M0InspectorModel, buildM0InspectorModel, M0GatewayAction
      m0-layers.ts                 # (PROPOSED tranche 01.1): M0LayerView enum + per-layer selectors
    browser/
      frontend-module.ts
      m0-anuttara-widget.tsx       # React widget; current: single inspector; (PROPOSED): six-tab layer routing
  lib/                             # tsc output
```

## Contributions

### Current (cycle-2)
- `PRIMARY_VIEW_ID = 'm0.anuttara.languageMap'`
- `ALL_VIEW_IDS = ['m0.anuttara.languageMap', 'm0.anuttara.owlShaclInspector', 'm0.anuttara.rVirtuePanel']`
- `OPEN_COMMAND_ID = 'm0.openCoordinate'`
- `READ_ONLY_COMMAND_ID = 'm0.openCoordinate.readOnly'`
- `DEPOSIT_ONLY_COMMAND_ID = 'm0.openCoordinate.depositOnly'`
- `ROUTE_PATH = '/m0-anuttara/coordinate'`
- `PRIVACY_CLASS = 'public_current_with_graph_provenance'`

### Proposed (cycle-3, tranche 01.1 / 09.1)
- Add `m0.anuttara.communityClockOverlay` view (tranche 01.5 / 09.6) — M0-3' synchronic + diachronic
- Add per-layer routes by `M0LayerView`: `lang | ql | rel | time | pers | pedag`
- M0-4' (`pers`) and M0-5' (`pedag`) routes are **bridge-only**: surface a single deep-link action into m4-nara / m5-epii respectively; no panel rendering on the m0-anuttara side
- New command IDs (proposed): `m0.switchLayer`, `m0.openInNara`, `m0.openInEpii`

## Profile-Field Consumption

Subscribes to `MathemeHarmonicProfile` via `SHARED_BRIDGE_ADAPTER` (`@pratibimba/m-extension-runtime`):

| Field | Consumed for |
|---|---|
| `tick12` | Active-coordinate halo pulse advance; divine-act crossfade |
| `cycle` | Wholeness bloom on 11→0 boundary; cycle counter in inspector |
| `degree720` / `degree360` | Helix-sheet indicator; Möbius hue-inversion at 5→6 boundary |
| `position6` | Position-6 colour-binary on active coordinate (Cl(4,2) signature) |
| `helix` | bimba/pratibimba sheet flag |
| `lens_mode` | Active 12×7 lens-mode cell; lens-anchored re-render of GDS heatmap |
| `resonance72` | 72-cell resonance indicator |
| `pointer_anchor` | Selected coordinate + relation descriptors + family refs + mirror refs |
| `privacy_class` | Enforce `PublicCurrentContext` gate on all M0' renders |
| `s2_anchor` | M0-5' Atelier deep-link slot (currently `None`) |
| `s3_anchor` | M0-3' Graphiti episode-handle slot (currently `None`) |

### Proposed new fields (per cycle-3 tranche 10 kernel-bridge profile-contract)

- `anuttara_layer: AnuttaraLayerProjection` — active layer + relation-family partition + kernel-core audit state + asset handles. See seed doc §4.3 for the Rust struct sketch.

## Readiness Behaviour (Tranche 15.6 inline provenance)

The inspector NEVER silently degrades. Every field carries one of six provenance states declared at `src/common/m0-inspector.ts:9-15`:

- `canonical` — value present on S2 payload
- `canonical_absent` — field is canonically absent (e.g. M0 / M0' `c_1_symbol`); NOT a client extraction failure
- `derived` — value derived from graph payload by inspector logic with provenance trace
- `inferred` — value from OWL n10s inference; requires governance promotion to become canonical
- `review_pending` — sync-coordinator promotion is queued; render as amber
- `blocked` — readiness gate (GDS unavailable / kernel-bridge pending / etc.); render as grey with inline `provenance` reason

`M0GraphReadinessFact[]` carries the four upstream readiness gates:
- `owl` — n10s/OWL inference availability
- `shacl` — SHACL validation status
- `gds` — GDS Option-1 projection availability
- `kernel-core` — kernel-S2 65-relations audit result (tranche 01.7)

When all four are `canonical` the surface displays `ready_public_current`; otherwise inline provenance per blocker.

## State Persistence (Tranche 15.7)

When the user toggles `daily-0-1` ↔ `ide-deep`, or 0/1 cosmic/personal, or layer M0-0' ↔ M0-5':

- Selected coordinate persists via `pointer_anchor.coordinate`
- Active layer persists via proposed `anuttara_layer.active_layer` (until landed, persists in widget local state synced to bridge)
- Active relation-family filter persists in widget local state
- All persistence through the kernel-bridge DI singleton (`SHARED_BRIDGE_ADAPTER`); no per-widget storage

## Acceptance Tests

```bash
# Extension presence
test -d Body/M/epi-theia/extensions/m0-anuttara
test -f Body/M/epi-theia/extensions/m0-anuttara/ARCHITECTURE.md

# Six-layer enum landed (tranche 01.1)
grep -E "layer:.*'(lang|ql|rel|time|pers|pedag)'" \
  Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts
test -f Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts

# Forbidden-import audit (no direct substrate imports)
! grep -rnE "Body/S/S(0|2|3|5)|from ['\"]neo4j-driver" \
  Body/M/epi-theia/extensions/m0-anuttara/src/

# Mutation fence (until DR-M0-1 resolves)
grep -n "mutatesGraphCanon: false" \
  Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts

# Privacy fence
grep -n "M0_PRIVACY_CLASS = 'public_current_with_graph_provenance'" \
  Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts

# Canonical-absence handling
grep -n "Canonical absence from S2 graph payload" \
  Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts

# Hash-coordinate compatibility (#0 → M0 single namespace)
grep -n "normalizeM0CoordinateInput" \
  Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts

# Build
cd Body/M/epi-theia && pnpm --filter @pratibimba/m0-anuttara build
```

## Composition with the Integrated 1-2-3 Plugin (Tranche 07)

When the integrated 1-2-3 cosmic engine plugin composes M1' + M2' + M3' over the solar anchor:

- **M0' graph view is the structural pole** of the three-rendering composition
- m0-anuttara provides node positions + relation edges as overlays on the M2' solar field
- Decan seal images from `c_1_asset_uri` (pending tranche 09.3) render at planetary anchors
- m0-anuttara exports `M0CoordinateSummaryCard` (per `TRACK_08_EXPORTS` in `src/common/index.ts:21`) for composition in mini-mode
- The composition seam reads via `m0-anuttara.selection` inputKind and routes to `/m0-anuttara/coordinate`
- The integrated plugin reads the same `MathemeHarmonicProfile`; edits at M0-2' propagate to M2'/M3' on next tick (gated on DR-M0-1)

## Composition with the Integrated 4-5-0 Recognition Plugin (Tranche 08)

When the integrated 4-5-0 recognition plugin composes Nara + Epii + Anuttara as the recognition surface:

- **M0' is the structural ground** — the place coordinates live and the daimon resonates against
- M0-4' personal-bridge invokes m4-nara's protected register
- M0-5' pedagogy-bridge invokes m5-epii's Atelier + recommendations
- The recognition seam's "where am I?" answer always lands as an M0' coordinate

## OmniPanel (`/` operator membrane)

m0-anuttara exposes the **Anuttara capacity** (per Wave-B agentic-layer nomination Track 09) to the OmniPanel:
- Pi / Anima / Aletheia subagents route Anuttara graph queries through the OmniPanel's gateway-mediated method calls (`s2.graph.query`, `s2.graph.node`, `s2.graph.traverse`)
- No M0' visualisation in the OmniPanel itself — the graph is the editor surface, not a sidebar tool
- The OmniPanel may surface readiness state (kernel-core 65/65 audit) as a chip when the user requests Anuttara context

## Build Order (subordinate to cycle-3 m-dev sequence)

1. **Cycle-2 substrate landed** — `m-extension-runtime`, `kernel-bridge`, `acceptance-harness`, m0-anuttara@0.1.0 (single inspector)
2. **Tranche 10** (kernel-bridge profile-contract) — `anuttara_layer` projection added to `MathemeHarmonicProfile`; pending-dataset-lut / tarot-amino / kleinFlipState closures
3. **Tranche 09.3 / 01.6** — `c_1_asset_uri` + `c_1_asset_kind` schema slot landed; dataset_import lifts asset keys
4. **Tranche 09.2 (DR-M0-3)** — `c_1_relation_family` enum + RELATIONSHIP_PROPERTY_SPECS extension
5. **Tranche 01.1 / 09.1** — m0-layers.ts + six-tab routing in widget; bump to `0.2.0`
6. **Tranche 01.5 / 09.6** — `m0.anuttara.communityClockOverlay` view; M0-3' synchronic+diachronic surface
7. **Tranche 01.7** — kernel-core 65 audit method + readinessFact wiring
8. **Tranche 01.2 (DR-M0-1)** — CRUD-vs-governed-route decision; if (a), gateway extension + governed write path on m0-anuttara
9. **Tranche 01.3 / 09.8 (DR-M0-2)** — Anuttara source naming canon round-trip
10. **Tranche 07** — composition with integrated 1-2-3 plugin (M0' as structural pole over solar anchor)

## Authority

- Canonical seed: `Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`
- Spec: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- UX: `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md`
- Substrate authority: `Body/S/S0/epi-lib/include/m0.h`, `Body/S/S2/graph-schema/src/lib.rs`, `Body/S/S2/graph-services/src/`
- Profile-bus authority: `Body/S/S0/portal-core/src/kernel.rs:346-465`
- Cycle-3 reconciliation: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/01-m0-anuttara-reconciliation.md`, `09-integrated-bimba-graph-reconciliation.md`

This extension consumes the cycle-2 substrate as-is and is extended (never rebuilt) by cycle-3 tranches. The single largest gap is the six-layer surface contract (tranche 01.1 / 09.1); the single load-bearing decision is DR-M0-1 (CRUD vs governed-route); the single true schema-property orphan is image-assets-on-nodes (tranche 09.3 / 01.6).
