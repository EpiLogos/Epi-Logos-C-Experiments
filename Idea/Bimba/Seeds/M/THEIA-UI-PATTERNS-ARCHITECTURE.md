---
title: "Theia UI Patterns Architecture — Bimba Graph Viewer, Stacked-Tabs, Provenance Overlay, Lemniscate Transition, Dispatch Genealogy, Composition Mount-Points"
coordinate: "M' / Theia-UI-Patterns"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the UI primitives shared across M' surfaces. Where Track 15 (UI Design Foundations) names a principle, this document supplies its concrete pattern, contract, and implementation siting. Track 15 owns the law; this document owns the lattice that carries it."
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md"
related_decisions:
  - "DR-TS-1 (VALIDATED): 0/1 daily + 4+2 ide-deep + / OmniPanel"
  - "DR-M1-2 (VALIDATED): m1-paramasiva-played-torus Bevy/wgpu first-build"
  - "DR-IG-1 (VALIDATED): c_1_relation_family enum {structural, correspondential, kernel_core, inferred, sync, compatibility}"
  - "DR-M0-1 (VALIDATED): M0' graph is read-only; canon mutation routed via M5 Atelier"
  - "DR-M4-2 clause 5 (VALIDATED): 0 = cosmic, 1 = personal"
  - "DR-M4-3 (PROPOSED): PersonalPoleProjection exposes OpaqueProtectedHandle only"
  - "DR-M5-3 (PROPOSED): library-pane is left-sidebar activity-bar mode in ide-deep"
  - "DR-B-3 (VALIDATED): Aletheia subagents are dispatched specialists, not peer agents"
related_tranches:
  - "11.x — Theia shell hosting (this doc consumes layouts + OmniPanel substrate)"
  - "15.1 — Foundation principles registry"
  - "15.2 — OmniPanel architecture (Dispatch Trace, Tool Stream, Evidence, Review)"
  - "15.3 — Left-sidebar activity-bar system (Coordinate Tree, Bimba Graph Viewer, Canon Studio, Backend Studio, Smart Connections)"
  - "15.4 — Editor-area composition pattern"
  - "15.5 — 0/1 toggle gesture + lemniscate transition"
  - "15.6 — Profile-tick clock + readiness inline rendering"
  - "15.10 — Status bar discipline (day-now thread)"
  - "15.11 — Dispatch genealogy as first-class UI primitive"
  - "15.12 — Visual-regression harness"
---

# Theia UI Patterns Architecture

## 0. Frame

Track 15 (`Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md:7-28`) lands nine foundation principles as binding contracts. Track 11 (`11-theia-shell-surface-hosting.md:1-13`) names the landed Theia substrate: six M-extensions, two integrated plugins, `omnipanel-shell`, `pratibimba-layouts`, `kernel-bridge`, `kernel-bridge-readiness`, `acceptance-harness`, `m-extension-runtime`, `integrated-composition`. The two are necessary but not sufficient: principles + substrate do not yet define the **primitives** the surfaces must compose to honor the principles.

This document defines those primitives — the UI patterns that recur across every M' surface and that do not fit Theia's default widget vocabulary. These are not "components" in the React sense. They are **contracts**: each pattern names what it consumes from the kernel-bridge, what it exposes to widgets, how it survives the 0/1 toggle, and how it renders provenance.

There are **eight patterns** in this lattice. Two are full Theia widgets with their own extension homes (Bimba Graph Viewer; Coordinate Tree). One is a Theia tab-bar mode extending an existing platform primitive (Stacked Tabs). Five are **visual primitives** that show up across multiple widgets (Provenance Overlay, Lemniscate Transition, Dispatch Genealogy Renderer, Composition Mount-Point, Day-Now Thread). One is a placement-decision-with-consumer-contract (Smart Connections).

The unifying claim: every widget that renders bimba data, dispatch evidence, day-now anchor, or 0/1 transitions consumes the **same** primitive — no widget invents its own provenance rendering, its own tick-driven re-render, its own transition animation, its own genealogy view. The pattern library IS the contract.

### 0.1 Cross-cut against Cycle-2 substrate

What this document **does not** propose to first-build:

- **Theia activity-bar contribution slots** (`widget.application-shell-left/right/bottom`) — consumed as-is from `@theia/core`.
- **Theia `StatusBarContribution`** — consumed for §7 day-now thread.
- **Theia `KeybindingContribution`** — consumed for cmd-period + cmd-K palette.
- **Theia `TabBar` / `PanelLayout`** — consumed for §2 stacked-tabs (extended via class override, not replaced).
- **`omnipanel-shell` extension** (`Body/M/epi-theia/extensions/omnipanel-shell/`) — extended for §5 dispatch genealogy tabs; OmniPanel architecture itself is Track 15.2's deliverable.
- **`kernel-bridge` extension** (`Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts:91-103, 174-188`) — consumed for profile-tick subscription, readiness ledger, capability invocation. No bridge contract changes proposed here.

What this document **does** first-build (each named with concrete owner + scope):

1. Existing M0' graph chrome wiring (§1) — NOT a new `bimba-graph-viewer` extension. Owner: `ide-shell-m0-m5` / M0' chrome; consumes S2 via `kernel-bridge` `s2.graph.query` + `s2.graph.traverse` and wires the M0'↔M5-0' Klein seam per DR-TUI-1.
2. `coordinate-tree` extension (§8) — new extension, owner: shell-foundation team; consumes the bimba namespace at `Body/S/S2/graph-schema/src/lib.rs:1-9` (`:Bimba` label + `coordinate` property).
3. `theia-stacked-tabs` extension (§2) — new extension extending `TabBar`/`PanelLayout`; owner: shell-foundation team.
4. `epi-ui-primitives` shared package (§3, §4, §5, §6, §7) — new shared TS package providing the five visual primitives consumed by all widgets; owner: shell-foundation team.

The first-build proposals are honest first-builds: no current owner exists for these surfaces; they are M' product material; each names a concrete consumer ledger.

---

## 1. The M0' Bimba Graph Chrome — Obsidian-style Passthrough Widget

### 1.1 Why this widget exists

Track 09 (`09-integrated-bimba-graph-reconciliation.md:3`) records the live contradiction: S2 substrate is mature (Neo4j + n10s + GDS + OWL/SHACL + `RelationshipManager` writes + `PromotionPlan` + the 109-node Anuttara language map at `Body/S/S2/graph-schema/src/lib.rs:3072` LOC, `Body/S/S2/graph-services/src/` 25 modules), but the existing M0' chrome needs its graph canvas and Klein-seam wiring completed. The integrated 1-2-3 plugin needs the graph as a live surface; the M5 Logos Atelier needs to see what it is about to scent-follow; M0' needs Obsidian-style overview. One existing chrome surface serves all three.

Per DR-TUI-1, this is the existing M0' graph chrome in the IDE shell, not a standalone extension to first-build. M5-0' library material surfaces under traversed coordinates via `bimba_coordinate` and `bimba_resonances`; the user traverses the map and the library appears underfoot.

The viewer is **not** the M1-paramasiva-played-torus (DR-M1-2 ratified; `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` first-build) — the played K² is the M1-domain instrument and renders the *mathematical* topology. The Bimba Graph Viewer renders the **ontological graph** — coordinate nodes, family relations, namespace structure. Both consume the same substrate; they are different projections of one corpus.

### 1.2 Substrate dependencies

The viewer consumes (no first-builds against S2):

| Consumed | Path | Use |
|---|---|---|
| `:Bimba` label + `coordinate` property | `Body/S/S2/graph-schema/src/lib.rs:1-9` (canonical node identity, per user memory) | Node identity |
| `RELATIONSHIP_TYPE_SPECS` (25 entries) | `Body/S/S2/graph-schema/src/lib.rs:229-380` | Edge types |
| `c_1_relation_family` enum | DR-IG-1 VALIDATED; six members `{structural, correspondential, kernel_core, inferred, sync, compatibility}` | Filter palette |
| PointerWeb computation | `Body/S/S2/graph-services/src/pointers.rs` | Hover provenance |
| `gds_tangent_overlay()` | `Body/S/S2/graph-services/src/gds.rs` + `graph_api.rs` | Community/centrality overlay (M0-3' synchronic community) |
| Profile-tick events | `kernel-bridge/src/common/types.ts:91-103` `KernelBridgeRuntimeEvent` kind `'profile'` | Tick-pulse highlight |
| `s2.graph.query`, `s2.graph.traverse`, `s2.graph.node` | gateway methods registered in `Body/S/S3/gateway-contract/src/lib.rs` | Data fetch |

### 1.3 Visual contract

**Force-directed graph by default, multiple layout modes selectable**:

| Mode | Description | Default for |
|---|---|---|
| `force-d3` | D3-style force-directed simulation; springs and repulsion | `ide-deep` Bimba Graph Viewer (full lattice) |
| `solar-anchor` | Sun (M0) at centre; planetary correspondences per M0' UX §4; rotated by tick | `daily-0-1` cosmic-side view (per Track 09 tranche 9.5) |
| `radial-cluster` | Family clustering: P/S/T/M/L/C wedges (per `CLAUDE.md` §II.C) | M5 Logos Atelier inspect mode |
| `hierarchical-coord` | M0..M5 → sub-coordinates → entities; left-to-right | M0-anuttara pedagogy view |

**Colour discipline (consistent with Track 15.8 M1-2 colour-binary):**

- **Family hue (low saturation, background tier):** P=cyan, S=violet, T=teal, M=amber, L=rose, C=mint. Family is the steady backdrop.
- **Cl(4,2) signature ring (high saturation, foreground tier):** P0/P5 (signature -1) cool indigo halo; P1-P4 (+1) warm amber-vermilion halo. Matches `Body/S/S0/epi-lib/include/m1.h:629-636` `CL42_BASIS[6]`. Same colour-binary that Track 15.8 names for the K² played torus, so the same node identity carries the same visual signature whether it appears in the graph viewer or on the played torus.
- **Namespace badge (text tier):** small pill colour-keyed by namespace (`anuttara-language`, `bimba`, `mahamaya-stack`, etc.).
- **Readiness border (provenance tier):** green=ready, amber=pending-*, red=blocked. The §3 provenance overlay is the source of this border colour.

**No font hierarchy is invented**: the viewer uses Theia's `monaco-editor` monospace family for coordinate labels (consistent with Backend Studio) and Theia's default sans for human-readable labels (consistent with Canon Studio). One font system across the IDE.

### 1.4 Interaction contract

| Gesture | Effect |
|---|---|
| Hover | Tooltip shows `coordinate`, `label`, top three properties, **bedrock_link** chain (file:line → .rodata → profile field → here, per CCT-6 substrate provenance principle) |
| Click | Sets global active-coordinate state (per §8 Coordinate Tree contract); every other widget reacts |
| Double-click | Opens that coordinate in the active Mn surface (`ide-deep` opens m{n}-extension; `daily-0-1` reveals it in the composition surface) |
| Right-click | Context menu: Open in m{n}-extension, Open in Canon Studio, Open in Backend Studio (`ide-deep` only), Deposit evidence (routes to `s5.episodic.deposit` via gateway), Copy coordinate, Copy bedrock_link |
| Cmd-drag | Pan |
| Cmd-scroll | Zoom |
| Box-select | Multi-node selection; right-click on selection: Open as subgraph, Compute community (GDS overlay), Compute pointer-web (calls `pointers.rs`) |
| Cmd-F | Filter palette + search (overlay; consumes Theia's `QuickInputService`) |
| Cmd-K | Coordinate palette (jump-to-coordinate) — same palette §2 stacked-tabs uses |

### 1.5 Filter palette (the load-bearing element for large graphs)

S2 carries ~2000 bimba nodes (per the M-coordinate map at `Idea/Bimba/Map/` — per user memory the populated graph uses `:Bimba` label + `coordinate` property). Rendering all 2000 nodes is feasible at WebGL scale but unhelpful at sight. Default filters:

- **Coordinate prefix** (`M0`, `M0-1`, `M1`, …) — multi-select; shows only nodes whose `coordinate` matches the prefix set
- **Relation family** (`c_1_relation_family` six-enum per DR-IG-1: `structural | correspondential | kernel_core | inferred | sync | compatibility`) — multi-select; shows only edges in the selected families. **The `inferred` family is rendered with a dashed stroke; `sync` and `compatibility` use 40% opacity**; the visual asymmetry mirrors the ontological asymmetry.
- **Namespace** — multi-select; cuts entire subtrees
- **Pointer-web depth** — slider 1-5; how many hops to include from selected nodes
- **Readiness** — checkbox: hide blocked / show pending / show only ready
- **Search** — `Cmd-F` substring match against coordinate, label, namespace

Filter state is per-widget-instance (so two graph viewers in `ide-deep` can show different slices); the active filter set is persisted as a widget preference in `epi-logos.bimba-graph-viewer.filters.{instanceId}`.

### 1.6 Tick choreography

Subscribes to the kernel-bridge profile-tick event (`kernel-bridge/src/common/types.ts:91-103` `kind: 'profile'`). On each tick advance:

- Nodes whose `coordinate` matches the active `MathemeHarmonicProfile` coordinate pulse: 200ms scale 1.0 → 1.15 → 1.0 with an opacity flash.
- Solar-anchor mode rotates the planetary correspondences (per `M2_PLANET_LUT[10]` and the `planet_hour_ruler` in `MathemePlanetaryChakralProjection`).
- The pulse is **deterministic** — given `(profile_generation, active_coordinate)`, the visual state is reproducible (per Track 15.12 visual-regression contract).

No animation timer runs locally inside the viewer. The profile-tick event IS the clock (Track 15.6 / principle 2).

### 1.7 Implementation recommendation

**Compared three options**:

1. **Cytoscape.js** — mature, declarative, decent performance to ~5000 nodes. WebGL renderer via `cytoscape-canvas`/`cytoscape-webgl` plugin (community, less polished). Filter API is robust but layout extensibility for the solar-anchor mode is awkward.

2. **`force-graph` / `3d-force-graph` (vasturiano)** — pure WebGL via three.js; performant to ~10k nodes; excellent zoom/pan; the Obsidian-style aesthetic is exactly this library's home. Extending to a solar-anchor layout requires writing a custom layout but the API admits it cleanly.

3. **Custom Canvas/WebGL with d3-force or ngraph** — most flexible, most build cost. Required only if neither library above can hit performance targets on ~2000-node graphs.

**Recommendation: option 2** — `force-graph` (2D) for the default; `3d-force-graph` for an optional 3D pose-explore mode (off by default; toggle in widget header). The library is small (~50kb gz), MIT-licensed, single dependency tree. Custom layouts (`solar-anchor`, `radial-cluster`, `hierarchical-coord`) are added as named layout functions; the library exposes layout-engine hooks. WebGL through three.js handles the 2000-node target with ~40fps headroom; if the graph grows to 10k+ nodes the same library upgrades to its WebGL renderer without a rewrite.

If Obsidian-fidelity becomes a hard requirement (e.g., user mockups demand a specific edge-bundling algorithm or the resolve-on-hover Obsidian look), revisit Cytoscape.js with the same widget contract.

### 1.8 Theia integration

```
Body/M/epi-theia/extensions/bimba-graph-viewer/
  package.json                              # @pratibimba/bimba-graph-viewer
  src/
    common/
      bimba-graph-types.ts                  # GraphNode, GraphEdge, FilterState, LayoutMode
      bimba-graph-protocol.ts               # query envelope
    browser/
      bimba-graph-widget.tsx                # ReactWidget extending BaseWidget
      bimba-graph-renderer.ts               # force-graph wrapper; layout engines
      bimba-graph-contribution.ts           # ApplicationShell contribution
      bimba-graph-keybindings.ts            # cmd-F, cmd-K
      filter-palette.tsx
      frontend-module.ts
    node/                                   # (none — viewer is pure browser)
```

**Theia placement:**
- Activity-bar mode in left sidebar (`widget.application-shell-left`), priority after Coordinate Tree.
- Dockable to editor area for full-screen ("Open Bimba Graph Viewer in Editor Area" command).
- In `daily-0-1`: only solar-anchor mode is enabled (per Track 15 surface contract §Left sidebar daily-0-1).
- In `ide-deep`: all four layout modes available.

**No competing widget shell.** The viewer is a `ReactWidget` extending Theia's `BaseWidget` and registered as an `ApplicationShell` contribution — it lives natively inside Theia's layout system.

### 1.9 Filter-palette wiring against `c_1_relation_family`

The six-member `c_1_relation_family` enum (DR-IG-1) is rendered as a six-checkbox row in the filter palette. **Default state**: all four `structural | correspondential | kernel_core | inferred` checked; `sync` and `compatibility` unchecked (they are migration / cross-extension debt and noise in canonical view; user can enable). Filter state is part of the widget preference.

The viewer also exposes a "color edges by family" toggle (default ON) using a six-hue palette aligned with the family colour discipline §1.3 (one hue per family).

---

## 2. The Stacked-Tabs View Option (Obsidian-style)

### 2.1 Why this option exists

Theia's default tab placement is horizontal-along-top, which works for 1–4 open documents but fails for `ide-deep` with all six M-extensions + a few aux panes open. In that state, tab labels are truncated to 3-4 characters, content area scrolls horizontally, switching becomes click-hunt. Obsidian's vertical stacked-pane layout is the well-known answer: each pane gets a vertical header strip; click a header to expand that pane; the others collapse to their header strip.

This is a **placement option per dock area** (left sidebar / right sidebar / editor area / bottom panel), not a global setting. Users mix horizontal and stacked in different areas.

### 2.2 Substrate

- Consumed as-is: Theia's `TabBar`, `DockPanel`, `PanelLayout`, `Widget` from `@theia/core` (and `@phosphor/widgets` under the hood).
- Extended: a new `StackedPanelLayout` subclass extending `PanelLayout` that collapses non-active widgets to their header strip.

### 2.3 Visual contract

**Horizontal-stacked variant** (the standard Obsidian look adapted for an IDE):

- Each child widget renders as a vertical strip ~28px wide (header strip), occupying the dock area edge.
- The active widget expands to fill the remaining area.
- Strip shows: 90°-rotated widget label; small icon; readiness border tick (consumes §3 provenance overlay).
- Click strip → expand that widget; others collapse to strip.
- Optional pin: a chosen widget stays expanded across switches; new clicks open in a second slot that auto-collapses.

**Two interaction modes**:

1. **Single-expand** (default): exactly one widget expanded; others strip. Click-to-switch.
2. **Pin-to-top**: pinned widget stays expanded at top; clicked widget expands below; subsequent clicks replace the lower slot. Allows ~2 widgets visible at once.

### 2.4 User preference + cmd-K integration

- Preference key: `epi-logos.dock.{area}.layout` ∈ `{ "tabs", "stacked-single", "stacked-pin" }` for each of `left | right | editor | bottom`.
- Right-click on tab bar → context menu: "Switch to Stacked Layout", "Switch to Tab Layout", "Pin Current Widget".
- Cmd-K palette extension: "Bimba: Activate widget by coordinate" — jumps to the widget rendering the chosen coordinate (consumed across all dock areas; uses widget metadata `widget.metadata.coordinate`).
- Cmd-shift-K: "Bimba: Cycle stacked panes" — moves through stacked widgets without opening palette.

### 2.5 Implementation siting

```
Body/M/epi-theia/extensions/theia-stacked-tabs/
  package.json                       # @pratibimba/theia-stacked-tabs
  src/
    browser/
      stacked-panel-layout.ts        # extends PanelLayout; collapse logic
      stacked-tab-bar.ts             # extends TabBar; vertical render
      stacked-shell-contribution.ts  # wires preference → dock area; menu contributions
      stacked-keybindings.ts         # cmd-K, cmd-shift-K
      frontend-module.ts
```

**Scope discipline:** this extension extends Theia primitives by class subclass; it does NOT replace `ApplicationShell` or fork the layout system. If Theia upgrades, only the two extension files need a parity audit. The forbidden-direct-import lint at Tranche 11.5 keeps M-extensions from depending on `theia-stacked-tabs` internals; they consume Theia's `PanelLayout`/`TabBar` types and the new layout is hot-swappable.

### 2.6 Acceptance-harness contract

Tranche 11.6 already proves cross-layout state-identity (the kernel-bridge DI singletons preserve `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)` per `pratibimba-layouts/src/common/layout-types.ts:7-12`). Add: when `epi-logos.dock.editor.layout = "stacked-single"`, switching layouts daily-0-1 ↔ ide-deep preserves which widget is expanded vs stripped; pin state survives the toggle.

---

## 3. Provenance Overlay System (Tranche 15.6 expansion)

### 3.1 Why this primitive exists

Tranche 15.6 names the principle: "no separate errors panel — provenance lives where the datum lives". Every widget that renders bridge-sourced data has to render readiness state on the same DOM node that carries the datum. If every widget invents its own border colour scheme, badge component, and tooltip format, the principle is violated by inconsistency even when the policy is honored. This primitive is the policy made executable.

### 3.2 Substrate

- `KernelBridgeReadinessState` (`Body/M/epi-theia/extensions/kernel-bridge-readiness/src/common/readiness-types.ts:9-18`): nine-state taxonomy already canonical.
- `readinessSeverity()` (`readiness-types.ts:56-64`): three-band collapse `ok | degraded | blocked`. This is the **only** authority for collapsing nine into three for visual purposes.
- `M0ProvenanceState` (`m0-anuttara/src/common/m0-inspector.ts:9-15`): six provenance states already used by M0 inspector — `canonical | canonical_absent | derived | inferred | review_pending | blocked`. Generalised here as the canonical provenance taxonomy across all widgets.

### 3.3 The two taxonomies, how they relate, and which one the overlay binds to

Two taxonomies coexist:

1. **Bridge readiness** (`KernelBridgeReadinessState`) — about whether the *bridge can serve the datum at all*. Nine states, severity-collapsed to three.
2. **Datum provenance** (`M0ProvenanceState`) — about whether the *specific datum is canonical, derived, or absent*. Six states.

The overlay binds to a **unified `ProvenanceState`**:

```ts
type ProvenanceState =
  | 'canonical'         // value is from canonical S2/profile source
  | 'derived'           // computed locally from canonical inputs
  | 'inferred'          // GDS / autoresearch inference; lower trust
  | 'pending'           // bridge readiness blocked, value not yet available
  | 'canonical_absent'  // canonical source returned no value (not an error)
  | 'review_pending'    // human-required review per DR-M0-1 / S5 review queue
  | 'blocked'           // privacy / authority gate blocks this datum
```

The bridge readiness state is collapsed into the unified taxonomy at the widget root (via the existing M-extension runtime's `MExtensionReadinessSnapshot` per `m0-anuttara/src/common/m0-inspector.ts:1-4` import); individual fields then carry their own provenance.

### 3.4 Visual contract

Every data-bearing DOM node renders one of three border treatments + at most one badge:

| State | Border | Badge | Tooltip on hover |
|---|---|---|---|
| `canonical` | none (transparent) | none | "Canonical from {source}" |
| `derived` | none | small `Δ` glyph top-right | "Derived from {sources}" |
| `inferred` | dashed 1px amber | small `?` glyph top-right | "Inferred via {algorithm}" |
| `pending` | solid 1px amber | small `⏳` glyph top-right | "Pending: {reason}" |
| `canonical_absent` | dotted 1px gray | small `∅` glyph top-right | "Canonical absence — not a fetch failure" |
| `review_pending` | solid 1px violet | small `⚖` glyph top-right | "Awaiting review at {handle}" |
| `blocked` | solid 1px red + 15% red overlay | inline reason text | "Blocked: {reason}" |

The **bedrock_link tooltip** (per CCT-6 / cross-cutting closures principle) is appended to every tooltip: a chain `file:line → .rodata → profile field → widget render path`. Hover delay 600ms; pinned via `cmd+click`.

### 3.5 Badge component contract

Single React component `<ProvenanceBadge>`:

```ts
interface ProvenanceBadgeProps {
  state: ProvenanceState;
  sourceField: string;           // e.g. 'profile.m2_cymatic.resonance72'
  reason?: string;               // human-readable reason
  ledgerLink?: string;           // anchor into kernel-bridge readiness ledger
  bedrockLink?: BedrockLink[];   // chain back to substrate provenance
  ariaLabel?: string;            // accessibility
}

interface BedrockLink {
  layer: 'rodata' | 'profile' | 'bridge' | 'widget';
  path: string;                  // file:line or struct.field
}
```

Widgets compose `<ProvenanceBadge>` around any datum they render. No widget defines its own; the lint (Tranche 11.5 / forbidden-direct-imports) extends to ban local provenance-badge implementations.

### 3.6 Implementation siting

```
Body/M/epi-theia/packages/epi-ui-primitives/
  src/
    provenance/
      provenance-state.ts        # unified ProvenanceState type
      provenance-badge.tsx       # <ProvenanceBadge>
      provenance-border.ts       # CSS classes for the seven border treatments
      bedrock-link.ts            # BedrockLink type + tooltip composer
      readiness-collapse.ts      # KernelBridgeReadinessState → ProvenanceState
      index.ts
  package.json                   # @pratibimba/epi-ui-primitives
```

Lives in `Body/M/epi-theia/packages/` (not `extensions/`) because it is a shared package, not a Theia extension. Every M-extension and OmniPanel sub-widget depends on it.

### 3.7 Tranche 11.5 lint expansion

The forbidden-direct-import lint (`Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs`) extends:

- Ban local provenance border CSS classes (only `@pratibimba/epi-ui-primitives` may define them; pattern: `\.provenance-(canonical|derived|inferred|pending|canonical-absent|review-pending|blocked)` in any extension's CSS triggers a violation).
- Ban local readiness-state collapse logic (only `@pratibimba/epi-ui-primitives/readiness-collapse` may map `KernelBridgeReadinessState` → `ProvenanceState`).
- Require: any widget whose `package.json` declares `contributes.dataRenderingWidget = true` must import `<ProvenanceBadge>` at least once.

---

## 4. Lemniscate Transition Primitive (Tranche 15.5 expansion)

### 4.1 Why this primitive exists

Tranche 15.5 names the 0/1 toggle with a lemniscate animation as the load-bearing affordance for `cmd-period`. Track 15.8 names a Klein-flip event at tick 5→6 that also needs a transition. Track 15.9 / DR-IG-2 names a Möbius-return that needs a visual at the cycle close. Three transitions, one shape: a folded curve. Implementing three different animations is forbidden — the shape is the same; the duration and easing differ.

### 4.2 The single primitive

A reusable WebGL/Canvas shader applied as an overlay over the editor area (or the composition surface). The shader parametrises a **lemniscate of Bernoulli** in screen space and uses it as a UV-distortion mask: the content beneath is folded inward along the curve, then unfolded with the new content emerging from the same fold.

Mathematical core (the lemniscate of Bernoulli in screen-space NDC):

```
r² = a² · cos(2θ)
x = (a · cos θ) / (1 + sin² θ)
y = (a · sin θ · cos θ) / (1 + sin² θ)
```

The fold parameter `t ∈ [0, 1]` drives both the contraction of the outgoing content along the curve and the expansion of the incoming content from the same curve. The shader implementation uses a single uniform `u_t`, a single attribute `a_uv`, and reads two textures: `u_outgoing`, `u_incoming`.

### 4.3 Three uses, three configurations

| Use | Trigger | Duration | Easing | Texture-A → Texture-B |
|---|---|---|---|---|
| 0/1 toggle (Tranche 15.5) | `cmd-period` or title-bar coin-flip | 400ms | cubic-out via lemniscate parameter (t² for first half, 1-(1-t)² for second) | cosmic composition → personal composition |
| Klein-flip (Tranche 15.8 + 15.9) | profile-tick reaches 5→6 boundary | 240ms | linear t on the curve; valence-invert overlay | K² oriented up → K² oriented down (Hopf-fibre flag flip) |
| Möbius-return (Tranche 15.9 close) | profile-tick reaches 11→0 boundary | 320ms | smoothstep | active matrix → next matrix (full SU(2) 720° identity return; renders as a softer fold than the Klein-flip) |

### 4.4 State preservation contract

DR-TS-1 names the state that survives the 0/1 toggle: `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)` + active OmniPanel tab + active activity-bar mode. The lemniscate transition is **stateless**: it renders only a visual fold between two captured textures. State preservation is the kernel-bridge DI singleton's responsibility, not the transition's. Acceptance-harness `tests/topology.test.mjs` (Tranche 11.6) extends to assert the six globals survive the transition.

### 4.5 Visual-regression baseline (Tranche 15.12)

The transition's deterministic visual frames at `t ∈ {0, 0.25, 0.5, 0.75, 1.0}` are committed as baseline PNGs at `Body/M/epi-theia/extensions/acceptance-harness/fixtures/visual-regression/lemniscate/{0_1_toggle, klein_flip, mobius_return}/`. The diff threshold is documented at 0.5% pixel difference (allows GPU vendor variation).

### 4.6 Implementation siting

```
Body/M/epi-theia/packages/epi-ui-primitives/
  src/
    transitions/
      lemniscate-shader.glsl
      lemniscate-transition.ts     # texture-A + texture-B + duration + easing → animation
      transition-controller.tsx    # React wrapper hooked into Theia animation system
      index.ts
```

Consumed by:
- `pratibimba-layouts` (0/1 toggle in `daily-0-1`)
- `m1-paramasiva-played-torus` (Klein-flip and Möbius-return for K²)
- `plugin-integrated-1-2-3` (composition-wide variant; per DR-IG-2 single source of truth at kernel-bridge level)

The shader runs in a Theia overlay layer over the editor-area widget; the underlying widgets do not need to be aware. No widget invents its own transition animation.

---

## 5. Dispatch Genealogy Renderer (Tranche 15.11 expansion)

### 5.1 Why this primitive exists

DR-M5-1 / DR-B-1 (VALIDATED): Pi is the agent harness; Anima is the dispatcher; the six Aletheia subagents (Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven) are dispatched specialists. The ACR extension (`Body/M/epi-theia/extensions/agentic-control-room/`, 520 LOC in `run-model.ts:1-100`) is repurposed (Tranche 12.14) as a Pi runtime monitoring surface. OmniPanel's Dispatch Trace + Tool Stream tabs render the same data **folded differently**: Trace is the tree (genealogy), Stream is the time-ordered event list. One renderer, two projections.

### 5.2 Substrate

| Consumed | Path | Use |
|---|---|---|
| `RunTreeNode` | `agentic-control-room/src/common/run-model.ts:55-64` | Tree model |
| `ToolStreamEvent` | `run-model.ts:66-73` | Stream model |
| `AgenticActor` union (collapsed per DR-B-3) | `run-model.ts:23-33` (to-be-collapsed to `pi | anima | <aletheia subagent>` per DR-M5-1/B-3 tranche 12.12) | Actor identity |
| `RunEvidenceEnvelope` | `run-model.ts:92-100+` | Click-through to Evidence tab |
| Kernel-bridge capability stream | `kernel-bridge/src/common/types.ts:174-182` (`invokeGatewayRpc`, `subscribeObservability`) | Live event source |
| Privacy class on tool events | `run-model.ts:73` `privacyClass?: string` | DR-M4-3 protected-handle rendering |

### 5.3 Trace view (tree)

`<DispatchTrace>` renders `RunTreeNode` as a Theia `TreeWidget`:

- Root: Pi session
- Children: Anima invocations (each is a separate dispatch)
- Grandchildren: Aletheia subagent invocations (Anansi, Moirai, etc.)
- Great-grandchildren: tool calls within each subagent

Each node shows: actor icon, status badge (consuming §3 provenance overlay), elapsed time, capability gate icon (open/closed), diagnostics count.

**Privacy rendering (DR-M4-3 strict invariant):** if `privacyClass ∈ {'protected', 'private'}`, the node renders as an opaque handle: `<Protected handle abc123>`. No payload preview. The handle is clickable; clicking opens a re-keyed view in M4 Nara only if the user is the handle's owner. Cross-layout state preserves the open/closed handle set.

### 5.4 Stream view (time-ordered list)

`<DispatchStream>` renders the same data as a chronological list:

- One row per `ToolStreamEvent`
- Row shows: emitted-at, actor, tool, kind (`tool.start | tool.end | route.start | route.end | ...`), payload preview (collapsed; click to expand), privacy badge
- Filter palette: filter by actor, filter by tool kind, filter by capability gate state
- Auto-scroll on new events (toggle in header)
- Same privacy rendering as §5.3

### 5.5 Cross-deep-linking

Click on a Trace node:
- **In `ide-deep`**: deep-link routes to (a) Evidence tab in OmniPanel (jumps to the evidence packet for that invocation if landed), and (b) Backend Studio (`pratibimba.smart-connections-sidebar` / lsp-driven navigation) opens to the source file:line where the tool implementation lives.
- **In `daily-0-1`**: deep-link routes to Evidence tab only (Backend Studio is not active in `daily-0-1`); selecting source opens a cross-layout-intent envelope that switches to `ide-deep` if user confirms.

Tranche 15.11 verification asserts the click-through chain.

### 5.6 Implementation siting

```
Body/M/epi-theia/extensions/omnipanel-shell/src/browser/components/
  dispatch-trace/
    dispatch-trace-widget.tsx
    dispatch-trace-tree-model.ts
    dispatch-stream-widget.tsx
    dispatch-event-row.tsx
    privacy-handle.tsx           # opaque handle rendering
    index.ts
```

The renderer lives inside `omnipanel-shell` (not a separate extension) because the OmniPanel tabs are its only consumer per DR-M5-3 (OmniPanel is for agentic dispatch). The shared genealogy types are co-located with the renderer (they don't need to be in `epi-ui-primitives` because no other extension consumes them directly — they're scoped to OmniPanel).

---

## 6. Composition Mount-Point UI Pattern

### 6.1 Why this primitive exists

Tracks 07.3 and 08 land integrated plugins (`plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`); Tranche 15.4 names the composition-over-juxtaposition contract. But the contract needs a concrete shape: how does an M-extension declare it contributes to a composition, and how does the integrated plugin compose without becoming a juxtaposition?

The answer: **mount-points**. The integrated plugin owns a base surface (K² torus for cosmic-1-2-3; dipyramid + Hopf-linked tori for personal-4-5-0 per DR-IG-6). M-extensions register **shader contributions** to named mount-points on that surface. The integrated plugin composes the contributions inside a single render frame.

### 6.2 The contract

```ts
// Body/M/epi-theia/packages/integrated-composition-contract/
interface CompositionMountPoint {
  readonly surfaceKind: 'k2-torus' | 'dipyramid-hopf-tori';
  readonly mountPoint:
    // For cosmic 1-2-3 (K² torus)
    | 'k2.texture'              // U,V parameter texture (M1-2 ananda matrix heatmap, M2 cymatic field)
    | 'k2.streamlines'          // overlay flow-lines (M1-2 DR rings)
    | 'k2.cells'                // discrete cell renderings (M3 codon-ring cells)
    | 'k2.halos'                // QL position halos (Cl(4,2) colour-binary)
    | 'k2.particles'            // M2 audio_octet particle emitters
    // For personal 4-5-0 (dipyramid + Hopf tori)
    | 'dipyramid.vertices'      // 6 vertex renderings (M4 QL positions on personal scale)
    | 'hopf-tori.linkage'       // M4 personal-pole linkage rendering
    | 'hopf-tori.texture'       // M3 codon-rotation at personal scale via Q_composed
    | 'hopf-tori.scent-trace'   // M5 Logos Atelier scent-trace (handles only, per DR-M4-3)
    | 'dipyramid.psychoid-field' // M4 protected-handle psychoid renderer
  ;
  readonly contributionHandle: ContributionHandle;
  readonly providedBy: string;  // owning extension id
  readonly priority: number;    // composition layer ordering (lower = drawn first)
}

interface ContributionHandle {
  readonly kind: 'shader' | 'react-overlay' | 'wgpu-pass';
  // Shader: GLSL/WGSL source + uniforms map
  // React-overlay: ReactComponent + position
  // wgpu-pass: render-pass descriptor for Bevy/wgpu (M1 played-torus)
}
```

### 6.3 The integrated plugins consume mount-points

```
plugin-integrated-1-2-3/  (Tracks 07.3, 15.4)
  consumes:
    k2.texture       ← provided by m1-paramasiva-played-torus (ANANDA heatmap)
                        OR by m2-parashakti (cymatic surface, pinned to torus per DR-IG-5)
                        (composition resolves priority + cross-fade)
    k2.streamlines   ← provided by m1-paramasiva-played-torus (DR_RING_MAHAMAYA, DR_RING_PARASHAKTI)
    k2.cells         ← provided by m3-mahamaya (codon-ring cell renderer)
    k2.halos         ← provided by m1-paramasiva (Cl(4,2) signature)
    k2.particles     ← provided by m2-parashakti (audio_octet — windows onto M2-1' Vimarśa writes per Track 15.9)

plugin-integrated-4-5-0/  (Tracks 08, 15.4)
  consumes:
    dipyramid.vertices       ← provided by m4-nara (6 QL personal-pole vertices)
    hopf-tori.linkage        ← provided by m4-nara (personal Hopf linkage)
    hopf-tori.texture        ← provided by m3-mahamaya (codon-rotation projection at personal scale)
    hopf-tori.scent-trace    ← provided by m5-epii (Logos Atelier scent-trace handles)
    dipyramid.psychoid-field ← provided by m4-nara (psychoid renderer, handles per DR-M4-3)
```

### 6.4 Resolution policy

The composition contract test (Track 11.8) asserts:

1. **No mount-point has zero contributions** (composition surface is fully populated).
2. **No mount-point has overlapping contributions of the same priority** (no rendering race).
3. **No M-extension contributes to a mount-point outside its M-domain** (m2-parashakti cannot contribute to `dipyramid.psychoid-field`).
4. **The plugin contract MUST reject side-by-side widget contributions** (per Tranche 15.4 verification).

### 6.5 Implementation siting

```
Body/M/epi-theia/packages/integrated-composition-contract/
  src/
    composition-mount-point.ts     # the contract types above
    composition-resolver.ts        # collects contributions, validates, orders
    surface-kinds.ts               # 'k2-torus' | 'dipyramid-hopf-tori'
    index.ts
  package.json                     # @pratibimba/integrated-composition-contract
```

Consumed by `integrated-composition` extension (which is the existing landed package at `Body/M/epi-theia/extensions/integrated-composition/`) and by each of the two integrated-plugin extensions. M-extensions declare their contributions in `package.json` under `contributes.compositionMountPoints: CompositionMountPoint[]`.

---

## 7. Day-Now Thread Renderer (Tranche 15.10 expansion)

### 7.1 Why this primitive exists

DR-M4-1 (VALIDATED): the canonical day path is `Idea/Empty/Present/{day_id}/`. Tranche 15.10 names the discipline: status bar surfaces day-now; no widget owns the day-now anchor; widgets consume it from the status-bar state thread. This primitive is the consumer-side of that discipline.

### 7.2 Substrate

| Consumed | Path | Use |
|---|---|---|
| Day-init event | `epi vault day-init` writes to `Idea/Empty/Present/{day_id}/daily-note.md` | Trigger |
| `dayNow` in kernel-bridge profile | the `dayNow` field carried in cross-layout-intent envelope per `pratibimba-layouts/src/common/cross-layout-intent.ts` | Current value |
| Theia `StatusBarContribution` | `@theia/core/lib/browser/status-bar` | Render slot |

### 7.3 Visual contract

**Status bar entry** (one of exactly six per Tranche 15.10):

- Left-most status bar position (highest visual priority)
- Format: `📅 {day_id}` (e.g. `📅 02-06-2026`)
- Click: opens the day-note widget in editor area; `Cmd-click` opens it as a new tab; `Shift-click` opens the day's container directory in a file-explorer view.
- Hover tooltip: full path `Idea/Empty/Present/{day_id}/daily-note.md` + count of artifacts in the directory + last-modified.
- Pulsates softly on day rollover (midnight local OR external `epi vault day-init` trigger).

**Day-note widget** (the click-through target):

- Standard Theia editor widget over the `daily-note.md` file
- Decorated with day-now badge (consumes §3 provenance overlay; state `canonical`)
- Subscribes to changes via Theia's file-watch; live re-renders on external edits

### 7.4 Subscription contract

Day-now is a **thread**, not a polled value. Widgets that need day-now subscribe:

```ts
interface DayNowThread {
  readonly current: DayNowAnchor;            // current day_id + path
  readonly subscribe: (callback: (anchor: DayNowAnchor) => void) => Disposable;
}

interface DayNowAnchor {
  readonly dayId: string;             // e.g. '02-06-2026'
  readonly containerPath: string;     // 'Idea/Empty/Present/02-06-2026/'
  readonly noteFile: string;          // 'Idea/Empty/Present/02-06-2026/daily-note.md'
  readonly profileGeneration: number; // generation at subscription time
}
```

The thread is exposed via Theia DI as `@inject(DayNowThread)`. The status bar entry is the *only* widget that triggers the day-init event observation; every other widget reads through subscribe.

### 7.5 Implementation siting

```
Body/M/epi-theia/packages/epi-ui-primitives/
  src/
    day-now/
      day-now-thread.ts            # service + DI binding
      day-now-status-entry.tsx     # StatusBarContribution
      day-note-widget.tsx          # editor area widget
      index.ts
```

Tranche 15.10 verification: `grep -rn 'statusBarEntry\|StatusBarContribution' Body/M/epi-theia/extensions/` should show **exactly the six named entries** (per Tranche 15.10) — and nothing else. Day-now is one of them.

---

## 8. Coordinate Tree Widget Specification

### 8.1 Why this widget exists

Tranche 15.3 names Coordinate Tree as the first activity-bar mode in both `daily-0-1` and `ide-deep` (the only sidebar widget present in both layouts). Per principle 1, every surface roots in a coordinate, and this widget IS the navigation backbone. Currently no extension owns it.

### 8.2 Visual contract

Standard Theia `TreeWidget`:

- Root level: six families (per `CLAUDE.md` §II.C) — `P | S | T | M | L | C`. Default expanded: M only (M is the M' product surface family).
- M children: `M0 Anuttara`, `M1 Paramasiva`, ..., `M5 Epii`.
- Mn children: sub-coordinates `M0-0`..`M0-5` (the six layers) and their `'` counterparts. Loaded on expand via `s2.graph.query` filter for `coordinate STARTS WITH 'M0'`.
- Mn-x children: entities under that coordinate (loaded on expand).
- Each tree row shows: coordinate label, count of children (lazy-loaded), readiness badge (consumes §3 provenance overlay), one icon for the family.
- Right-click: context menu identical to §1.4 graph viewer right-click (Open in m{n}-extension, Open in Bimba Graph Viewer, Open in Canon Studio, Deposit evidence, Copy coordinate, Copy bedrock_link).
- Search box at top (`Cmd-F`): filters tree by coordinate substring; matched nodes are revealed with breadcrumb-expansion.

### 8.3 Active-coordinate broadcast

Selecting a tree row sets the global active-coordinate state. The state lives in the kernel-bridge DI singleton (per `pratibimba-layouts/src/common/layout-types.ts:7-12` cross-layout state contract). Every widget that subscribes via `@inject(ActiveCoordinateThread)` re-renders. The thread is the SSOT; no widget keeps its own copy.

### 8.4 Coordinate-prefixed naming enforcement (DR-M0-2)

Per DR-M0-2 (VALIDATED): coordinate-prefixed `c_{n}_*` form is always canonical. The tree displays coordinate-prefixed labels by default with an alias-label option in the gear menu. The provenance overlay marks rows whose canonical form is missing (`canonical_absent`) so the user can see the gap.

### 8.5 Implementation siting

```
Body/M/epi-theia/extensions/coordinate-tree/
  package.json                       # @pratibimba/coordinate-tree
  src/
    common/
      active-coordinate-thread.ts    # DI service + interface
      coordinate-tree-types.ts
    browser/
      coordinate-tree-widget.tsx     # TreeWidget extension
      coordinate-tree-model.ts       # lazy-loaded tree model via s2.graph.query
      coordinate-tree-contribution.ts
      frontend-module.ts
```

Activity-bar registration: priority 0 (top-most) in both `daily-0-1` and `ide-deep` per Tranche 15.3.

---

## 9. Smart Connections Sidebar Pattern

### 9.1 Decision (consolidates Tranche 11.4 + Tranche 15.3 + DR-M5-3)

Smart Connections is a **left-sidebar activity-bar mode in `ide-deep` only** (NOT a right-sidebar surface; right-sidebar is OmniPanel-only per principle 5).

The placement decision unifies three threads:

- Tranche 11.4 marks `pratibimba.smart-connections-sidebar` as code-pending (S1 Track 03 T6.5 dependency).
- Tranche 15.3 names Smart Connections as one of the `ide-deep` activity-bar modes.
- DR-M5-3 ratifies that library-pane is left-sidebar, not OmniPanel. Smart Connections is a sibling decision in the same shape.

### 9.2 Substrate consumption

| Consumed | Path | Use |
|---|---|---|
| S1 embedding service | `s1'.semantic.*` capabilities (per Tranche 15.3) | Semantic similarity computation |
| `s1.smart_env` (`.ajson` index) | S1 Track 03 T6 substrate (per S1 architecture S1-5 sub-coordinate) | Pre-computed neighbor sets |
| Active document context | Canon Studio's currently-open file | Query subject |
| Active coordinate | §8 ActiveCoordinateThread | Secondary filter |

### 9.3 Visual contract

- Activity-bar left mode (priority after Bimba Graph Viewer and Canon Studio in `ide-deep`).
- Panel shows: section header "Semantically related" + list of nodes/files ranked by similarity to the active Canon Studio document.
- Each list row shows: coordinate badge + filename + similarity score (0-1) + bedrock-link icon.
- Click row: navigates to that coordinate in the active Mn surface OR opens the file in Canon Studio (right-click distinguishes).
- Filter palette: filter by coordinate prefix, filter by similarity threshold (slider), filter by namespace.
- Tick choreography: re-ranks on profile-tick (because the embedding may change as the kernel re-projects).

### 9.4 Implementation siting

```
Body/M/epi-theia/extensions/smart-connections-sidebar/  (NEW)
  package.json                       # @pratibimba/smart-connections-sidebar
  src/
    common/
      smart-connections-types.ts
    browser/
      smart-connections-widget.tsx
      smart-connections-query.ts     # consumes s1'.semantic.* via gateway
      frontend-module.ts
```

Gated on S1 Track 03 T6.5 (smart_env / .ajson) landing per Tranche 11.4. Until then, the widget renders a `code-pending` provenance state with the blocker reason from the kernel-bridge readiness ledger.

---

## 10. Cycle-3 Ledger Integration

### 10.1 Tranche 11 additions

| New tranche | Scope | Status | Owner |
|---|---|---|---|
| **11.10 — M0' graph chrome Klein-seam wiring** | Wire existing M0' graph chrome per §1; consume S2 read paths; ide-deep + daily-0-1 (solar-anchor only) activity-bar modes; surface M5-0' library by coordinate tagging | spec-ahead-integration; existing chrome extension | shell-foundation team |
| **11.11 — Coordinate Tree extension first-build** | Land `coordinate-tree` extension per §8; ActiveCoordinateThread DI service; both layouts | spec-ahead-integration; first-build | shell-foundation team |
| **11.12 — Stacked-tabs option** | Land `theia-stacked-tabs` extension per §2; preference wiring; cmd-K integration | spec-ahead-integration; first-build | shell-foundation team |
| **11.13 — Smart Connections first-build (gated on S1 Track 03 T6.5)** | Land `smart-connections-sidebar` extension per §9; gated `code-pending` state until S1 substrate lands | spec-ahead-integration; first-build; gated | shell-foundation team |

### 10.2 Tranche 15 expansions

| Expansion | Scope | Status |
|---|---|---|
| **15.6 expansion** | Land `@pratibimba/epi-ui-primitives` package per §3; provenance overlay; bedrock-link tooltip | spec-ahead-integration; first-build (shared package, not an extension) |
| **15.5 expansion** | Lemniscate transition primitive in `epi-ui-primitives/transitions/` per §4; three configurations (toggle, Klein-flip, Möbius-return); shader committed | spec-ahead-integration |
| **15.10 expansion** | Day-Now thread in `epi-ui-primitives/day-now/` per §7; status bar entry; day-note widget | spec-ahead-integration |
| **15.11 expansion** | Dispatch Genealogy renderer in `omnipanel-shell/src/browser/components/dispatch-trace/` per §5; click-through to Evidence + Backend Studio | spec-ahead-integration |
| **15.13 — Composition mount-point contract** | Land `@pratibimba/integrated-composition-contract` package per §6; integrated plugins consume; M-extensions declare contributions; composition resolver | spec-ahead-integration; first-build (no current owner) |

### 10.3 Tranche 11.5 lint expansion

Tranche 11.5 (forbidden-direct-import lint enforcement) extends with the §3.7 rules: ban local provenance border CSS classes; ban local readiness-state collapse; require `<ProvenanceBadge>` import in data-rendering widgets.

### 10.4 New decisions surfaced

- **DR-UI-1 (PROPOSED) — Bimba Graph Viewer rendering library choice.** Recommendation: `force-graph` / `3d-force-graph` (vasturiano) per §1.7. Awaits user validation.
- **DR-UI-2 (PROPOSED) — Stacked-tabs as a per-dock-area preference.** Recommendation: preference `epi-logos.dock.{area}.layout` per §2.4. Awaits user validation.
- **DR-UI-3 (PROPOSED) — Provenance taxonomy unification.** Recommendation: unified `ProvenanceState` (seven members) collapsed from `KernelBridgeReadinessState` + `M0ProvenanceState` per §3.3. Awaits user validation.
- **DR-UI-4 (PROPOSED) — Lemniscate transition as single primitive for three uses.** Recommendation: one shader, three configurations per §4.3. Awaits user validation.
- **DR-UI-5 (PROPOSED) — Composition mount-point contract.** Recommendation: typed `CompositionMountPoint` registry per §6. Awaits user validation.

---

## 11. M' Surface Consumer Ledger

Each pattern names which M' surfaces consume it (verifies the patterns are load-bearing across surfaces, not single-consumer overhead):

| Pattern | Consumers (M' surfaces) |
|---|---|
| §1 M0' Bimba Graph Chrome | M0 Anuttara, M5 Epii (atelier inspect), integrated-1-2-3 (substrate visualization), integrated-4-5-0 (rare; on-demand) |
| §2 Stacked Tabs | All `ide-deep` users; especially when M1-M5 are open simultaneously |
| §3 Provenance Overlay | Every data-rendering widget (M0-M5 extensions, Canon Studio, Backend Studio, all OmniPanel tabs, Bimba Graph Viewer, Coordinate Tree, Smart Connections) |
| §4 Lemniscate Transition | `pratibimba-layouts` (0/1 toggle), `m1-paramasiva-played-torus` (Klein-flip), `plugin-integrated-1-2-3` + `plugin-integrated-4-5-0` (composition-wide Möbius-return) |
| §5 Dispatch Genealogy | OmniPanel (Dispatch Trace + Tool Stream tabs); evidence deep-link target across all surfaces |
| §6 Composition Mount-Point | `plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`, all six M-extensions (declare contributions) |
| §7 Day-Now Thread | Status bar (provider); M4 Nara (primary consumer for journal entries); M5 Epii (Logos Atelier scent-trace anchor); Canon Studio (day-scope filter) |
| §8 Coordinate Tree | Every layout (activity-bar mode in both `daily-0-1` and `ide-deep`); ActiveCoordinateThread consumed by every M-extension |
| §9 Smart Connections | `ide-deep` only; Canon Studio is primary consumer (semantic neighbors of active document) |

---

## 12. Verification Commands

Aggregated verification per pattern:

```bash
# §1 M0' Bimba Graph Chrome
test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bimba-graph-viewer-widget.tsx
pnpm --filter @pratibimba/ide-shell-m0-m5 test
grep -nE "c_1_relation_family|RELATIONSHIP_TYPE_SPECS|bimba_coordinate|bimba_resonances" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/

# §2 Stacked Tabs
test -d Body/M/epi-theia/extensions/theia-stacked-tabs
pnpm --filter @pratibimba/theia-stacked-tabs test
pnpm --filter @pratibimba/acceptance-harness test  # cross-layout stacked-state survival

# §3 Provenance Overlay
test -d Body/M/epi-theia/packages/epi-ui-primitives
grep -rn "ProvenanceBadge\|provenanceState" Body/M/epi-theia/extensions/  # widespread consumption
node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs  # lint rules pass

# §4 Lemniscate Transition
test -f Body/M/epi-theia/packages/epi-ui-primitives/src/transitions/lemniscate-shader.glsl
pnpm --filter @pratibimba/acceptance-harness test:visual  # frame baselines (Tranche 15.12)

# §5 Dispatch Genealogy
grep -rn "DispatchTrace\|DispatchStream" Body/M/epi-theia/extensions/omnipanel-shell/src/
pnpm --filter @pratibimba/omnipanel-shell test  # Pi → Anima → Moirai test

# §6 Composition Mount-Point
test -d Body/M/epi-theia/packages/integrated-composition-contract
pnpm --filter @pratibimba/integrated-composition test  # composition resolver rejects bad contributions

# §7 Day-Now Thread
grep -rn "statusBarEntry\|StatusBarContribution" Body/M/epi-theia/extensions/ | wc -l  # exactly 6 entries

# §8 Coordinate Tree
test -d Body/M/epi-theia/extensions/coordinate-tree
pnpm --filter @pratibimba/coordinate-tree test
grep -n "ActiveCoordinateThread" Body/M/epi-theia/extensions/  # widespread consumption

# §9 Smart Connections
test -d Body/M/epi-theia/extensions/smart-connections-sidebar
pnpm --filter @pratibimba/smart-connections-sidebar test  # may show code-pending until S1 T6.5
```

---

## 13. Anti-Greenfield Posture Audit

| Pattern | Anti-greenfield status |
|---|---|
| §1 Bimba Graph Viewer | **First-build (allowed):** no current owner; M' product surface; consumes existing S2 substrate as-is |
| §2 Stacked Tabs | **Extension of Theia primitives:** `TabBar`/`PanelLayout` subclass; no fork |
| §3 Provenance Overlay | **First-build of shared package (allowed):** consolidates existing `KernelBridgeReadinessState` + `M0ProvenanceState` — no taxonomy invention |
| §4 Lemniscate Transition | **First-build of shared primitive (allowed):** consolidates three named transitions (15.5, 15.8, 15.9) into one shader; no parallel timer competes |
| §5 Dispatch Genealogy | **Extension of `omnipanel-shell`:** consumes existing `agentic-control-room` `run-model.ts` types (now repurposed per Tranche 12.14); no greenfield model |
| §6 Composition Mount-Point | **First-build of contract package (allowed):** Tranches 07.3, 08, 15.4 name composition-over-juxtaposition; this primitive is the contract those tranches assume |
| §7 Day-Now Thread | **Consumes Theia `StatusBarContribution`** + existing `dayNow` field in cross-layout-intent; no new substrate |
| §8 Coordinate Tree | **First-build (allowed):** no current owner; foundational widget; consumes S2 query API as-is |
| §9 Smart Connections | **First-build, gated on S1 T6.5:** no current owner; renders code-pending until S1 substrate lands per Tranche 11.4 |

No pattern proposes to rebuild substrate. Every first-build names a concrete owner and a concrete consumer ledger. The four shared packages (`epi-ui-primitives`, `integrated-composition-contract`, plus the two coordinate/graph extensions) consolidate scattered patterns into single sources of truth — that consolidation is the anti-fork posture made executable.

---

## 14. Cross-Cutting Closures

### 14.1 The pattern library as a contract (Track 16 sibling)

Track 16 (cross-cutting closures) closes structural threads across the corpus. This document is its UI-side sibling: every UI primitive named here is a closure of a thread that would otherwise diverge across surfaces. The four first-build packages serve the same function as a kernel: they are the single point through which the principle flows.

### 14.2 Failure modes prevented

| Pattern | Failure mode prevented |
|---|---|
| §3 Provenance Overlay | Three widgets show three different border-color schemes for the same blocked state |
| §4 Lemniscate Transition | Three animation timers run in parallel; tick-driven transitions desync from kernel profile |
| §5 Dispatch Genealogy | Trace and Stream tabs render different actor names for the same invocation |
| §6 Composition Mount-Point | Integrated plugin renders as side-by-side widgets despite Tranche 15.4 ban |
| §7 Day-Now Thread | M4 Nara, M5 Epii, Canon Studio each compute day_id independently and drift |
| §8 Coordinate Tree | Each widget tracks its own active coordinate; cross-surface navigation desyncs |

### 14.3 Tranche 14 no-orphan audit interface

Every widget id in `pratibimba-layouts/src/common/layout-types.ts:51-90` either:
1. Has an owning extension named in this document (§1 graph viewer, §8 coordinate-tree, etc.), or
2. Is downgraded (per Tranche 11.3 ORPHAN closure path).

The §10 ledger integration table is the input to Tranche 14's surface→extension→contract ledger.

---

## 15. Conclusion

The eight patterns lattice. Two are widgets with extension homes (Bimba Graph Viewer §1, Coordinate Tree §8). One extends a Theia primitive (Stacked Tabs §2). Five are shared visual primitives in two packages (`epi-ui-primitives` carrying §3 provenance overlay, §4 lemniscate transition, §7 day-now thread; `integrated-composition-contract` carrying §6 mount-points; §5 dispatch genealogy in `omnipanel-shell`). One is a placement decision with consumer contract (§9 Smart Connections).

The principle: no widget invents its own provenance rendering, its own tick-driven re-render, its own transition animation, its own genealogy view, its own composition mount, its own day-now. The library IS the contract. Tranche 11.5's forbidden-direct-import lint enforces it.

Four first-build proposals; each names a concrete owner, consumer ledger, substrate consumption, and verification command. Five new DR rows (DR-UI-1..5) await user validation before downstream tranches act.

Track 15's nine principles become executable through these eight patterns. Track 11's landed Theia substrate carries them. The surfaces compose; the principles don't drift.
