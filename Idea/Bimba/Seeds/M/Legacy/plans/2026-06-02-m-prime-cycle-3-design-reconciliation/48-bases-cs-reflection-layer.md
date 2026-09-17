# Track 48 — Obsidian Bases as the C5/CS Reflection Layer (Hen-Emitted `.base` Triad over CTx + MOC)

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


> **Status / how to read this file.** Design + scoping tranche, authored 2026-06-25. **Future-dev
> (post-cycle-3) — NOT part of the cycle-3 landed release set or its release gate (Track 14 /
> Track 43).** Released into future-development needs. It **extends [[45-bimba-map-indexing-and-dox-okf-unification]]**
> (the downward-reflection / DOX-OKF tree) and **consumes the CTX contract from
> [[44-pratibimba-surface-standard]]**; it reopens no landed tranche and introduces no DR gate.
> Like Track 45, it is split into **(L1) immediate, markdown/config-level work** — pure `.base`
> files + validator teaching, no core-code risk; and **(L2) operative / code-reality work** — the
> Hen tool surface and the Theia data layer, named here and flagged to their owning specs.

Canon route: [[World-Ontology]] → [[ARCHITECTURE-DIAGRAM-PACK]] → [[S-SYSTEM-INDEX]] (S1' Hen,
S2 graph) + [[M-SYSTEM-INDEX]] (the M0–M5 map). DOX rail: root `AGENTS.md`; nearest index is this
folder's `plan.index.json`. Owning specs flagged for L2: [[S1-SPEC]] (Hen), the M5' seed
[[m5-prime-pratibimba-surface-standard]].

---

## 1. Why this track exists

The vault already runs **five coupled representational layers** over one coordinate substrate —
the Neo4j graph (relational authority), frontmatter (typed properties), wikilinks (associative
navigation), MOC canvases (spatial index), and the folder hierarchy (coordinate-native order).
What it has **no technology for is the *query view*** — the live, filtered, computed slice over
frontmatter. `World/Types/README.md` reaches for exactly this and cannot land it: it repeatedly
says a semantic view "should be a **query**, index, or C-native view" (§Coordinate-Native Type
Roots), that `SemanticType` is "a **derived/query label**, not a folder authority" (§Folder-To-Graph
Law). The query-view is named in the negative across the canon and has never had a surface.

Obsidian **Bases** (core plugin since v1.9, Aug 2025) is precisely that surface: a `.base` file —
YAML, stored in-vault — filters / groups / sorts / computes over note frontmatter and renders it as
**table, cards, list, or map** views (cards carry **cover images**). It stores no data; the notes
and their frontmatter remain the source of truth. In a generic LLM-wiki this is "a dashboard over
loose tags." Here it is far stronger, because our frontmatter is not loose: it is a **validated
coordinate algebra** (`{family}_{n}_{semantic}`, C-family default, integer ranges enforced,
`c_0_source_coordinates` always `string[]`, unknown keys a hard Hen **ERROR** —
`Body/S/S1/hen-compiler-core/src/frontmatter.rs`). Every column a base can render is a
contract-guaranteed, typed property. **A `.base` filter is a coordinate query.**

This track lands the `.base` as a first-class, Hen-emitted reflection layer, integrated with the
CTx content-type contracts and the MOC indexing function rather than competing with them.

---

## 2. The binding reframe — a base is the C5/CS reflection of a CT-form (correction binding on this track)

A base is **not** a generic dashboard bolted on. It has an exact home in the C-ladder and the VAK
reflective calculus, and that home dictates its residency, its authority, and its relationship to
the MOC. Three settled positions fix it (per `World/Types/README.md` §C-Layer Typology Authority +
the C-reflective ladder, and the `vak-coordinate-frame` law):

- **CT = C1' (Content-Types).** The CTx family (`Coordinates/C/C1/C1'/CT/**`, [[CT0]]–[[CT5]]) is the
  **write-form**: a frozen-process template that types content *forward*, `#0→#n`. This is what a
  CTx already is.
- **MOC = C4 (Types / Contexts / MOCs).** The MOC is the **curated type-authority and index** — the
  *intension*: what belongs here, what does not, the crosswalk, the open gaps. Two authored
  modalities exist today: `{Name}.md` (textual) + `{Name}.canvas` (spatial).
- **CS = C5' (Context-Sequences) / C5 Pratibimba.** A base is a saved **path / filter / sort /
  group** through content — a context-sequence — and residency-wise a **C5 Pratibimba reflection**
  (`Coordinates/C/C5/Crystallisations-Pratibimba/**`). It is the **extension**: what actually *is*
  here, computed live from frontmatter.

So the spine of this track is one line:

> **Template (C1 · CT) → MOC (C4 · type-authority) → Base (C5 · CS · Pratibimba) → Möbius to C0.**

"The other side of the CTx" is precise: CT (C1) composes the form forward; the base (C5/CS) is the
**reflected return-traversal** of that same content law. And because a base is structurally a
*reflection*, it is **incapable of writing canon** — which keeps Hen's sole-write-authority intact
for free. A base rides the **downward / reflection** direction Track 45 already named (Neo4j→repo
navigation), never the upward / crystallisation direction (Hen→graph authoring).

This also resolves the MOC relationship without demoting it. The MOC stays **the** index — the
master-of-contents (C4). The base is its **computed reflection** (C5), the next rung down. C4→C5 is
intension→extension, law→membership. They do not compete; they compose.

---

## 3. The MOC pattern becomes a triad (pair → triad)

`World/Types/README.md` §MOC Index Rule defines a type-authority folder as a **pair**: `{Name}.md`
(textual MOC) + `{Name}.canvas` (visual MOC). This track adds the third modality:

| Modality | File | C-position | Index character | Authoring |
|---|---|---|---|---|
| **Textual** | `{Name}.md` | C4 | narrated law: scope, belonging, crosswalk | authored |
| **Spatial** | `{Name}.canvas` | C4 | meaning arranged by hand; semantic edges | authored |
| **Computed** | `{Name}.base` | **C5** | live membership / extension, by query | **emitted (reflection)** |

They interlock rather than rank:

- The base **feeds the MOC's living sections**. "What Belongs Here" becomes an embedded base filter
  (the live extension of the belonging-law the `.md` states); "Open Gaps" becomes a base over notes
  *missing* required frontmatter (a live orphan/lint detector — Track 14 no-orphan posture).
- A `.base` can sit **as a node inside the `.canvas`** (a canvas node is a file; a base file as a
  canvas card = a live query panel placed in the spatial index).
- The `.md` narrates, the `.canvas` arranges, the `.base` enumerates — three faces of one
  master-of-contents.

**This never lets a base supersede the MOC.** The MOC authors the belonging-law; the base only
reflects who currently satisfies it.

---

## 4. CTx ↔ Base, as general types (not file instances)

Each CTx is a content-type **class**, not a single file. Its base is the CS-reflection that
collects and views *all* artifacts of that paradigm. The classes form a torus (CT0 capture → CT5
synthesis → Möbius → CT0); CT4b is the master **container** (its 4.0–4.5 hold CT0–CT5 fractally),
so its base's columns are themselves the CT0–CT5 sub-states. Because CS carries direction, most
classes cast a **Day** base (forward synthesis) and a **Night′** base (backward `P0'–P5'` analysis).

| CTx (CF) | General content class | VAK-CT paradigm | The base it casts (CS reflection) |
|---|---|---|---|
| **CT0** `(0000)` | raw capture, adjacency, the not-yet-differentiated | Relational | **intake stream** — fresh captures by time |
| **CT1** `(0/1)` | definitions, meanings, raw data, research reports, source material | Definitional | **substance library** — the "concept wiki" stratum, by subject/coordinate |
| **CT2** `(0/1/2)` | methods, workflows, analyses, procedures | Operational | **operations register** — process by domain/status |
| **CT3** `(0/1/2/3)` | structural forms, recurring patterns, archetypes | Pattern | **pattern atlas** — by archetype/structure |
| **CT4a** `(4.5/0)` | transient previews, contextual snapshots (non-cumulative) | Contextual | **preview shelf** — live context, not retained |
| **CT4b** `(4.0/1-4.4/5)` | temporal/contextual containers: day, now, session, sprint, project | Contextual | **period console** — the master base; columns = CT0–CT5 sub-states |
| **CT5** `(5/0)` | crystallised insight, synthesis, Thought artifacts; "the Vāk-code lens itself" | Integrative | **insight crystal** — by `t_0_thought_type`; Day = what crystallised, Night′ = `P0'` questions |

The base's columns/filters are **derived from the CTx frontmatter contract** Hen already owns — the
read-shape falls out of the write-shape. Concrete (CT4b period console):

```yaml
# CT4b.base  — derived from the CT4b frontmatter contract (c_1_ct_type: "CT4b")
filters:
  and:
    - 'c_1_ct_type == "CT4b"'
views:
  - type: table
    name: NOW sessions (open)
    filters: { and: [ 'c_4_artifact_role == "now"', 'c_5_reflection_complete == false' ] }
    group_by: c_3_day_id
    order: [coordinate, c_3_tranche_mode, c_3_response_orbit, c_3_created_at]
    sort: [ { property: c_3_created_at, direction: DESC } ]
```

---

## 5. The four zones — how a base works in each

The four vault zones are stages of the crystallisation loop (`Present → Seed → World/Types →
World`, with Map the downward graph reflection). One base mechanism, four functional roles:

| Zone | Loop stage | What the base reflects, functionally |
|---|---|---|
| **`/World` (+`/Types`)** | crystallisation / graduation | the **type-membership & pipeline tracker** — group `World/Types/Coordinates/**` by `c_5_crystallisation_state` (`incubating_type_index → crystallised_world_form → type_moc_pointer`). The README §Graduation table, made live; the extension of each MOC's belonging-law. |
| **`/Map`** | downward graph projection | the **aggregate browser + data-entry surface** — slice the projection by family, depth, `c_4_artifact_role`, relation-count; **card/image views** over symbol/diagram properties. Coarse navigation only: typed-edge traversal (`[[src]]-[[rel]]-[[tgt]]`) stays in Neo4j. |
| **`/Seeds`** | spec / evidence | the **provenance ledger** — by coordinate, by `seed_evidence_paths → world_form_path` linkage, by track status. This folder's `plan.state.json` is itself a base-shaped worklist. |
| **`Empty/Present`** | lived day/now | the **operational present-console** — open NOWs, `c_5_reflection_complete` gating before `chronos_archive_day`, tranche/orbit state. Highest churn; where Day/Night′ bases are most alive. |

**The `/Map` zone is the high-leverage case** (and the reason the differentiation matters). A base
over a coordinate's children is a *clean, complete, image-capable entry into the data* that then
**propagates to curated views**. Example — the full **[[M2-1]] MEF lens set**: a `cards` base
filtered to `coordinate.startsWith("M2-1")` surfaces every lens node with its essence and a cover
image, exhaustively and live; a human (or the M-extension) then lifts the meaningful ones into a
**curated** canvas MOC or a Theia panel. The base is the raw data-representation intake; the
curated view is the downstream selection. Bases give curation a complete, fresh source to draw from
instead of a hand-maintained list.

```yaml
# Map/M2/M2-1.base  — clean entry into the M2-1 MEF lenses, with cover images
filters:
  and:
    - 'coordinate.startsWith("M2-1")'
    - 'c_4_artifact_role == "map-index"'
views:
  - type: cards
    name: M2-1 MEF Lenses
    image: c_1_symbol_image     # card cover from a frontmatter image/asset property
    order: [coordinate, title]
    sort: [ { property: coordinate, direction: ASC } ]
```

---

## 6. Hen + CTx contract integration

A base is a C5 reflection, so it belongs to the **same Hen S1' type-index surface the README
already specs but has not built**. `World/Types/README.md` §Operational Gaps lists
`s1'.residency.resolve`, `s1'.type.index`, `s1'.moc.ensure`, and `s1'.canvas.create_or_update` as
specified-not-yet-public. This track adds one sibling:

- **`s1'.base.ensure`** — emits/refreshes `{Name}.base` as the third MOC modality, idempotently,
  whenever Hen stamps a type authority. Its column/filter set is **derived from the CTx frontmatter
  contract** (CT0–CT5) that Hen already validates — no new schema is invented; the base mirrors the
  contract. It writes **only** into reflection residency (beside the MOC it reflects, or the zone
  root it indexes), **never canon, never a Hen canon-write** — exactly the boundary
  [[44-pratibimba-surface-standard]] DR-PSS-4 draws for CTX templates.

This is the **read-side of the CTX contract Track 44 renders as blocks**. Track 44 builds the
*app-native* renderer of CTX-typed content (the `data-model` / `table` block types in Theia); Track
48 builds the *Obsidian-native* renderer (the `.base`) of the same CTX-typed substrate. One
contract, two renderers; CTX-typing (Hen, C1') is the shared write-authority, the base (C5') and
the block are two reflections of it. CTX-template *authoring authority stays Hen's* (DR-PSS-4); the
base is generated from it.

**Coordinate as the universal join key.** The `coordinate` is the one frontmatter key that *is* the
Bimba ground reference, and it is shared verbatim across (a) vault frontmatter `coordinate:`, (b) the
Neo4j node `coordinate` property, (c) the projected Map node's `c_4_graph_node`, and (d) a `.base`
filter. A base keyed on coordinate therefore **joins vault ⋈ graph ⋈ map ⋈ view** with no adapter —
the coordinate is already first-class across all four. This is what lets the Bimba Map data layer
(§7) back a base view directly.

---

## 7. Theia surfacing — static + dynamic, backed by the Bimba Map data layer (L2)

The `.base` is the Obsidian-side surface; the same coordinate-keyed aggregation surfaces in the
**epi-theia** app through patterns that already exist — the net-new work is the *view layer*
(filter/group/sort/view-mode over a coordinate-keyed record set), plus optionally one list-by-filter
RPC. (Confirmed by an app survey of epi-theia; concrete paths inline below.)

**The "Bimba Map data layer" is a projection/data layer, not a Theia extension.** Three
coordinate-keyed faces: (i) the **1018 git-tracked Map node files** (`Idea/Bimba/Map/**/*.md`) —
already a versioned static snapshot of the graph, regenerated by `Idea/Bimba/Map/datasets/fetch_bimba.py`
+ the `bimba-vault-map` skill, each node carrying `coordinate` + `c_4_graph_node: "neo4j://Bimba/…"`;
(ii) **`Body/S/S2/graph-services`** (`CoordinateRetrieval::{query_by_coordinate,query_by_family,query_by_cf}`,
`HybridRetriever`) — the runtime store; (iii) **bimba-mcp** (`list_coordinates`, `graph_search`) — the
dev/agent surface. All three reach Theia over the gateway RPC surface (`s2.graph.query`,
`s2'.retrieve`, `s2'.coordinate.cypher`, `s1'.vault.read_file`).

**The one sanctioned data path (forbidden-imports compliant, Track 43.5):**
`widget → SharedBridgeAdapter.invokeGatewayRpc(method, params)` (`m-extension-runtime/src/common/shared-bridge.ts`)
`→ kernel-bridge backend socket → S3 gateway :18794 → S2 graph-services / S1 vault`. An M-stack
bases-view extension never imports an S-stack crate (`Body/S/**`, `neo4j-driver`, `redis`), per
`Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json`. This is the exact
path `journal-entries-sidebar`, `oracle-history`, `parity-bridge-reader`, and `canon-studio` already use.

**Architecture — three layers, modelled on `CosmicClockRenderService.tsx` (the repo's "model-from-data →
declarative render" template):**

1. **`.base` config** (the C5/Pratibimba artifact, §2) declares `source: static|dynamic`, `filter`
   (coordinate prefix + `c_N_*` predicates), `group_by`, `sort`, `view: table|cards|list|image`, columns.
2. **One `BasesDataSource.fetch(config)`, two adapters** selected by `source`: *static* →
   `invokeGatewayRpc('s1'.vault.read_file', {path: snapshot})` over a `.base` snapshot emitted beside
   the Map files; *dynamic* → `invokeGatewayRpc('s2.graph.query' | 's2'.retrieve' | 's2'.coordinate.cypher', …)`
   re-fired on `onCoordinateContext` / `onObservabilityEvent`. Both return the same coordinate-keyed
   `BasesRecord` — interchangeable because the coordinate is the materialized join (§6).
3. **One pure render service** `basesModelFromRecords(records, config) → BasesRenderModel`: group/sort
   client-side (the `relations-layer-panel.tsx` partition pattern); render the view mode — `table`
   (`parity-bridge-reader.tsx` dynamic `<table>`), `cards`/`list`/`image` (`journal-entries-sidebar.tsx`
   map), themed `var(--theia-*)`, honest-pending per CosmicClock. Rows click-dispatch
   `updateCoordinateContext({selectedCoordinate})`, so two base panels cross-filter through the shared
   `CoordinateContext`.

Net-new gateway work is minimal and additive — ideally one `s2.graph.list_by_filter(coordinateScope,
propertyFilters, limit)` to make the dynamic adapter clean; until it lands, `s2.graph.query` +
`s2'.coordinate.cypher` suffice. So "the Bimba Map is the data layer behind Bases views" is not a new
abstraction — it is an aggregation/render layer wired onto a coordinate join the projection pipeline
already maintains.

---

## 8. Ownership split

| Concern | Owner | Residency |
|---|---|---|
| **`.base` artifact class + CS/Pratibimba framing law** | **Bimba World/Types** | `Coordinates/C/C5/Crystallisations-Pratibimba/**` (class) + the `.base` files beside their MOCs |
| **CT-ladder base set + per-zone bases** (L1 markdown) | **Bimba World** | `World/Types/**`, `Map/**`, `Seeds/**`, `Empty/Present/**` |
| **`s1'.base.ensure` + base-schema-from-CTx-contract** (L2) | **S1' Hen** | `Body/S/S1/hen-compiler-core/` (flagged to [[S1-SPEC]]) |
| **Validator teaching** (`base-view` role, residency, deep-coordinate grammar) | **bimba-vault-validate skill** | `.claude/skills/bimba-vault-validate/` |
| **Theia BasesView render + adapters** (L2) | **M-stack epi-theia** | `Body/M/epi-theia/extensions/**` over `invokeGatewayRpc` (no S-stack import) |
| **`.base` snapshot emission + list-by-filter RPC** (L2) | **Map projection pipeline + S2/S3** | `fetch_bimba.py` / `bimba-vault-map` skill; `Body/S/S2/graph-services` + gateway dispatch |

---

## 9. Tranches

The **L1 vertical slice is 48.1 → 48.4** (pure `.base` + validator, zero core-code risk); **48.5 →
48.7 are the L2 / code-reality follow-ons**, each implementing a contract surface specified concretely in §13 (proposed for ratify-in-place), flagged to its owning spec.

### Tranche 48.1 — `.base` artifact class + the CS/Pratibimba framing law *(L1; canon/contract + bimba-vault-validate)*

Define the `.base` as a **C5/CS reflection artifact class**, `c_4_artifact_role: "base-view"`:
reflection-only residency (beside the MOC it reflects, or a zone root), generated from the MOC's
belonging-law, **never canon-write**. Record the `Template (C1·CT) → MOC (C4) → Base (C5·CS)`
ladder and the pair→triad MOC rule (§2–3) in the C5 type authority + a one-paragraph note in
`World/Types/README.md` §MOC Index Rule. Teach `bimba-vault-validate` the `base-view` role +
`.base` residency (mirrors how Track 45 taught it the `map-index` role).

**Implementation scope:** markdown/skill only — a C5 type-authority note + README addendum +
validator role registration. No core-code.

**Verification:** `bimba-vault-validate` accepts a `.base` carrying `c_4_artifact_role: "base-view"`
in reflection residency and rejects one attempting canon (`World/*.md`, `Idea/Bimba/Bimba/**`)
residency; the README MOC Index Rule names the triad.

### Tranche 48.2 — The CT-ladder base set (one CS-reflection per content type) *(L1; depends 48.1)*

Author the canonical `.base` for each content class CT0–CT5 (+ CT4a) per §4, each deriving its
columns/filters from the CTx frontmatter contract, with Day/Night′ directional views where they
apply. CT4b's base is the period console whose columns are the CT0–CT5 sub-states.

**Implementation scope:** seven `.base` files authored against the live CTx contracts; no core-code.

**Verification:** each CTx has a working base that renders its instances; the CT4b base surfaces
open vs reflection-complete NOWs grouped by day; a Night′ view renders `P0'` questions for CT5.

### Tranche 48.3 — Per-zone bases *(L1; depends 48.1)*

Author the canonical base(s) for each zone per §5: `/World`+`/Types` crystallisation-pipeline
tracker; `/Map` aggregate browser + **card/image entry** (incl. the [[M2-1]] MEF-lens cards as the
worked example); `/Seeds` provenance ledger; `Empty/Present` operational present-console. Each
`/Map` base is positioned as a **clean data-entry surface that propagates to curated canvas/Theia
views**, not a replacement for them.

**Implementation scope:** zone-level `.base` files + the M2-1 worked example; no core-code.

**Verification:** each zone has ≥1 working base in its functional role; the M2-1 cards base renders
every MEF-lens node with a cover image; the `/World` base groups types by `c_5_crystallisation_state`.

### Tranche 48.4 — MOC↔Base collaboration (embed + feed living sections) *(L1; depends 48.1–48.3)*

Wire the base into the MOC as its computed reflection: embed a base block into a MOC's "What Belongs
Here" (live membership) and "Open Gaps" (missing/orphan frontmatter) sections, and place a `.base`
node inside a representative `.canvas` MOC. Demonstrate on one `Coordinates/S/**` MOC and the `/Map`
branch MOCs.

**Implementation scope:** edits to existing MOC `.md` + one `.canvas` to host base blocks/nodes;
no core-code.

**Verification:** a MOC's "What Belongs Here" / "Open Gaps" sections render live from embedded
bases; a canvas hosts a base node; the MOC remains the authored index (no base supersedes it).

### Tranche 48.5 — `s1'.base.ensure` + base-schema-from-CTx-contract *(L2; owning spec [[S1-SPEC]] / Hen)*

Land `s1'.base.ensure` in `Body/S/S1/hen-compiler-core/` as a sibling of the specced
`s1'.moc.ensure` / `s1'.canvas.create_or_update`: idempotently emit/refresh a `{Name}.base` whose
columns/filters are **derived from the owning CTx frontmatter contract** Hen already validates.
Reflection-residency guard (reuses the DR-PSS-4 canon-write boundary). Requires `gitnexus_impact`
before editing the Hen residency/promotion surface; implement the surface specified in §13.B–C, then flag the ratified surface to [[S1-SPEC]] for canon.

**Implementation scope:** one new Hen tool + a CTx-contract→base-schema deriver + residency guard +
tests; no new package.

**Verification:** `s1'.base.ensure` over a CT4b authority emits a `.base` with the contract's p0–p5
+ `c_3_*` columns filtered on `c_1_ct_type == "CT4b"`; re-running is idempotent; a base targeting
canon residency is refused; `cargo test -p` Hen passes.

**2026-07-16 rerun audit - PARTIAL:** Hen core is present: `src/base_view.rs` emits the CT4b
base-view note, returns stable second-run output, and refuses canon residency. The focused real
filesystem suite passes 3/3 via `cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml
--test base_view`. Missing from the ratified surface:
`s1'.base.ensure` is neither advertised nor dispatched by the live gateway (`exists: false`,
`errorClass: unimplemented` in the fresh 268-method gateway audit), and the CTx columns are copied
into a private `ct_contract_columns` table rather than derived from Hen's validated frontmatter
contract. Status remains incomplete until both gaps land and receive independent verification.

### Tranche 48.6 — M-stack BasesView: render service + static/dynamic adapters *(L2; epi-theia; depends 48.2–48.3)*

A new M-stack bases-view capability implementing the API in §13.D, modelled on `CosmicClockRenderService.tsx`: a `ReactWidget` +
`AbstractViewContribution` (the `personal-cymatic-field.tsx` pattern) injecting `SHARED_BRIDGE_ADAPTER`;
a pure `basesModelFromRecords(records, config) → BasesRenderModel` render service with `table` /
`cards` / `list` / `image` view modes (group/sort client-side per `relations-layer-panel.tsx`); and a
`BasesDataSource` with two adapters — *static* (`s1'.vault.read_file` over a `.base` snapshot) and
*dynamic* (`s2.graph.query` / `s2'.retrieve` re-fired on `onCoordinateContext` / `onObservabilityEvent`).
Rows click-dispatch `updateCoordinateContext` so base panels cross-filter via the shared
`CoordinateContext`. All data over `invokeGatewayRpc` — no S-stack import.

**Implementation scope:** one M-stack extension (widget + view-contribution + render service + two
data adapters); reuses existing bridge/RPC seams; no new package beyond the extension.

**Verification:** a coordinate-scoped view renders in Theia both statically (snapshot) and dynamically
(live, updating on a vault/graph change); selecting a row updates `CoordinateContext` and cross-filters
a second panel; the extension passes `07-t0-extension-contract-preflight.json` (no forbidden S-stack
import).

### Tranche 48.7 — Data-layer completion: `.base` snapshot emission + `s2.graph.list_by_filter` *(L2; owning specs S2/S3; depends 48.6)*

Complete the coordinate-keyed data layer the BasesView reads, implementing the surface in §13.E: (a) extend the projection pipeline
(`Idea/Bimba/Map/datasets/fetch_bimba.py` + the `bimba-vault-map` skill) to emit a compact `.base`
snapshot artifact beside the 1018 Map node files (the static source — a C5 reflection at a
`c_3_projected_at` instant); (b) add the additive gateway method `s2.graph.list_by_filter(coordinateScope,
propertyFilters, limit)` over `CoordinateRetrieval` (`Body/S/S2/graph-services/src/retrieval/`) so the
dynamic adapter has a clean list-by-filter call rather than leaning on `s2'.coordinate.cypher`. Both are
additive; flag the RPC contract surface to the S2/S3 specs; `gitnexus_impact` before editing the
retrieval/dispatch surface.

**Implementation scope:** a projection-pipeline `.base`-snapshot emitter + one additive gateway method
over existing `CoordinateRetrieval` queries; no schema change.

**Verification:** the projection emits a `.base` snapshot the static adapter reads; `s2.graph.list_by_filter`
returns coordinate-keyed rows matching a `c_N_*` filter; `cargo test -p` graph-services passes; the
dynamic adapter renders identical rows whether via `list_by_filter` or the `cypher` fallback.

---

## 10. What this UNBLOCKS

- **The query-view layer the canon names but never had.** `World/Types/README.md`'s "should be a
  query/derived view" finally has a technology, without minting parallel folder authorities.
- **CTx becomes template + base** — every content type gains its read-side reflection, derived from
  the write-shape Hen already owns. The forward form and its return-traversal close the torus.
- **The MOC becomes a triad** — textual + spatial + computed — so an index's "what belongs" and
  "open gaps" are live and self-maintaining (a standing no-orphan instrument, Track 14).
- **`/Map` becomes navigable data-representation** — clean, complete, image-capable coordinate
  entry points that propagate into curated canvas/Theia views (e.g. the M2-1 MEF lenses).
- **One coordinate-keyed data layer for two surfaces** — the Bimba Map extension backs both the map
  and the base views; Obsidian and Theia render the same C5 reflections of one coordinate index.

## 11. What this is NOT

- **Not a write authority.** A base is a C5 reflection — pure read; it cannot and must not write
  canon. Hen stays the sole canon-write authority (DR-PSS-4 boundary reused).
- **Not a replacement for the MOC.** The MOC (C4) is the authored index; the base (C5) is its
  computed reflection. The base feeds the MOC's living sections; it never supersedes the
  master-of-contents.
- **Not a graph engine.** Bases slice frontmatter; typed-edge traversal stays in Neo4j. `/Map`
  bases are coarse navigation + image cards, not relation-walks.
- **Not a parallel typing system.** A base's computed/formula columns are view-time ephemera, not
  canon; the frontmatter law + Hen validation remain the only source of truth.
- **Not a reopening of landed work.** It extends Track 45 (reflection tree) and consumes Track 44's
  CTX contract; it reopens no landed tranche and introduces no DR gate.

---

## 12. Verification (track-level)

- **L1:** `bimba-vault-validate` over all authored `.base` files + the touched MOCs returns clean;
  the CT-ladder set + per-zone set each render their intended slice in Obsidian Bases; the M2-1
  MEF-lens cards base renders with cover images; no `.base` resides in or writes canon.
- **L2:** `cargo test -p` the Hen crate for `s1'.base.ensure` + the CTx-contract deriver (idempotent,
  residency-guarded); the Theia bases-view panel renders a coordinate-scoped view static + dynamic
  and passes the extension contract-preflight (no forbidden import).

**Cycle-3 touch points:** [[44-pratibimba-surface-standard]] (the CTX contract this consumes; block
vs base are two renderers of it), [[45-bimba-map-indexing-and-dox-okf-unification]] (the
downward-reflection tree + DOX/OKF this extends; the `/Map` projection it views),
[[40-bimba-canon-update-ledger]] (the CU-* ledger is a base-shaped review surface),
[[14-no-orphan-audit-and-release-gates]] ("Open Gaps" bases are a standing no-orphan instrument).

---

## 13. Contract surfaces (proposed — ratify in place)

The L2 tranches (48.5–48.7) implement bodies against these. They are shaped here from the system as
already built — the specced Hen `s1'.moc.ensure` / `s1'.canvas.create_or_update` siblings, the CTx
frontmatter contracts, the gateway `s2.*` dispatch surface, and the `CosmicClockRenderService`
render-model pattern. Adjust a signature here in the doc, not in code.

### 13.A — The base-view artifact (`base-view` role)

A standalone `.base` is pure Obsidian YAML with no frontmatter slot, so it cannot satisfy the
coordinate-frontmatter law. **Decision:** the canonical, Hen-emitted, Hen-validatable artifact is a
**markdown note** carrying C-family frontmatter with an embedded ` ```base ` block; a pure `.base`
file and a JSON snapshot are *export forms* (§13.E / 48.7) for the standalone-Obsidian and
Theia-static paths.

````md
---
coordinate: "M2-1"                 # coordinate / zone this base reflects
c_4_artifact_role: "base-view"     # NEW role; joins map-index, now, template, …
c_1_ct_type: "CT1"                 # the CTx it is the read-side of (omit for zone / MOC bases)
c_5_reflects: "[[M2-1]]"           # the MOC / coordinate whose belonging-law it extends
c_3_projected_from: "neo4j://Bimba/M2-1"   # reflection provenance (as map-index)
c_3_projected_at: "<ISO>"
c_0_source_coordinates: ["[[M2-1]]"]
---
```base
filters: { and: ['coordinate.startsWith("M2-1")', 'c_4_artifact_role == "map-index"'] }
views:
  - { type: cards, name: "M2-1 MEF Lenses", image: c_1_symbol_image, order: [coordinate, title] }
```
````

Residency law (bimba-vault-validate, 48.1): `base-view` ∈ reflection residency only — beside its MOC
under `World/Types/Coordinates/**`, or under `Map/**` / `Seeds/**` / `Empty/Present/**`. **Never**
flat `World/*.md` or `Bimba/**` canon. A `base-view` resolving into canon residency is a validation
ERROR (reuses the DR-PSS-4 boundary).

### 13.B — `s1'.base.ensure` (Hen / S1', sibling of `s1'.moc.ensure`)

```
s1'.base.ensure(params) -> result

params:
  coordinate     : string                  # type-authority / coordinate / CTx the base reflects
  ct_type?       : "CT0".."CT5"            # if deriving from a CTx contract
  scope          : "ctx" | "zone" | "moc"  # which base shape (§4 ctx / §5 zone / §3 moc-triad)
  residency      : string                  # vault path; validated reflection-only (§13.A)
  views?         : BaseViewSpec[]          # explicit override; else derived (§13.C)
result:
  path            : string                 # emitted {coord}.base-view.md
  derived_columns : string[]               # frontmatter keys surfaced
  ok              : bool

behaviour:
  1. resolve the owning CTx frontmatter contract (or the coordinate's frontmatter shape)
  2. derive columns / filters / views from that contract (§13.C) unless `views` overrides
  3. emit / refresh the base-view note idempotently (stable ordering → no-op when unchanged)
  4. residency guard: refuse if `residency` resolves into canon (reuse DR-PSS-4)
```

Lives beside `s1'.moc.ensure` / `s1'.canvas.create_or_update` in the README §Operational-Gaps
surface, emitted together so the MOC triad (`.md` + `.canvas` + `.base`) is one Hen act. Rust home:
`Body/S/S1/hen-compiler-core/`; gateway method `s1'.base.ensure` on the S1' dispatch surface.

### 13.C — CTx-contract → base-schema derivation (deterministic)

The base schema is a pure function of the CTx frontmatter contract Hen already validates:

| Element | Derivation rule |
|---|---|
| `filter` | `c_1_ct_type == "<CTx>"` (+ `coordinate.startsWith(scope)` for zone bases) |
| `columns` | the CTx's declared frontmatter keys in position order (CT4b → the `p0…p5` keys; others → their `## N` section keys), plus `coordinate`, and `c_5_reflection_complete` where the contract carries it |
| `group_by` | the contract's dominant context key — `c_3_day_id` (CT4b), `t_0_thought_type` (CT5), coordinate-family (map-index) |
| `sort` | `c_3_created_at DESC` default, else `coordinate ASC` |
| `view` | `table` default; `cards` + `image:` (first asset/symbol key) for `/Map` + MEF sets |
| Day / Night′ | Day view filters the forward fields; Night′ view filters the `P0'` / inversion + `c_5_reflection_complete == false` set |

So `s1'.base.ensure(ct_type:"CT4b")` deterministically yields the period-console columns — no schema
is invented; the read-shape is computed from the write-shape.

### 13.D — Theia BasesView API (M-stack, `m-extension-runtime`)

```ts
// bases-view.ts — contract types (no S-stack import)
export interface PropPredicate {
  property: string; op: 'eq' | 'neq' | 'startsWith' | 'lt' | 'gt' | 'exists' | 'missing'; value?: unknown;
}
export interface BaseViewConfig {
  source: 'static' | 'dynamic';
  coordinateScope: string;                 // "M2-1" prefix | "" all
  filter: PropPredicate[];
  groupBy?: string;
  sort?: { property: string; direction: 'ASC' | 'DESC' }[];
  view: 'table' | 'cards' | 'list' | 'image';
  columns: string[];
  image?: string;                          // frontmatter key for card cover
}
export interface BasesRecord { coordinate: string; [key: string]: unknown }   // coordinate = the join
export interface BasesRenderModel {
  groups: { key: string; rows: BasesRecord[] }[];
  columns: string[]; view: BaseViewConfig['view']; pendingFields: string[];
}
export interface BasesDataSource { fetch(config: BaseViewConfig): Promise<BasesRecord[]>; }

// pure render-model fn — mirrors cosmicClockModelFromProps(); group / sort applied client-side
export function basesModelFromRecords(records: BasesRecord[], config: BaseViewConfig): BasesRenderModel;
```

- `StaticBasesSource.fetch` → `invokeGatewayRpc('s1'.vault.read_file', { path })` over a `.base` snapshot.
- `DynamicBasesSource.fetch` → `invokeGatewayRpc('s2.graph.list_by_filter' | 's2.graph.query' | 's2'.retrieve', { coordinateScope, propertyFilters, limit })`; re-fired on `onCoordinateContext` / `onObservabilityEvent`.
- `BasesViewWidget extends ReactWidget` + `BasesViewContribution extends AbstractViewContribution`
  (the `personal-cymatic-field.tsx` pattern), `@inject(SHARED_BRIDGE_ADAPTER)`; rows click-dispatch
  `updateCoordinateContext({ selectedCoordinate })` so panels cross-filter via shared
  `CoordinateContext`. All data over `invokeGatewayRpc` — no `Body/S/**` import (43.5).

### 13.E — `s2.graph.list_by_filter` (gateway, additive)

```
method : "s2.graph.list_by_filter"
params : { coordinateScope: string, propertyFilters: PropPredicate[], limit?: number }
returns: { rows: BasesRecord[] }   # each row: { coordinate, c_4_*, c_5_*, title, … }
dispatch: Body/S/S3/gateway-contract/src/dispatch_plan.rs        # additive entry
impl    : Body/S/S2/graph-services/src/retrieval/coordinate.rs   # over query_by_coordinate / query_by_family + predicate filter
```

Additive only (the `HybridRetriever` Cypher already `RETURN`s the `c_4_*` columns); until it lands,
the dynamic adapter falls back to `s2.graph.query` + `s2'.coordinate.cypher`. The `.base` snapshot
emitter (static source) extends `Idea/Bimba/Map/datasets/fetch_bimba.py` + the `bimba-vault-map`
skill — same projection pipeline, new artifact.
