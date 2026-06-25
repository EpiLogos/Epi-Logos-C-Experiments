# Track 45 — Bimba Map Repo-Level Indexing + DOX/OKF Unification

> **Status / how to read this file.** Design + scoping tranche, authored 2026-06-17.
> Two layers, explicitly separated: **(L1) immediate, this-session work** — pure markdown
> projection + DOX nodes, no core-code risk; **(L2) operative / code-reality work** — the
> Hen + S2 changes that make the projection a maintained sync direction. L1 is done in the
> session that authored this; L2 is named here and flagged to its owning specs. This is an
> *alignment contemplation* with Google's Open Knowledge Format (OKF, v0.1), not an adoption
> plan: the finding is that the Hen vault already realises ~80% of OKF (and more), so OKF is
> used as a lens for the few genuine gaps, and as the format the system stays *extensible into*.

Canon route: [[World-Ontology]] → [[ARCHITECTURE-DIAGRAM-PACK]] → [[S-SYSTEM-INDEX]] (S1' Hen,
S2 graph) + [[M-SYSTEM-INDEX]] (the M0–M5 map). DOX rail: root `AGENTS.md`.

---

## 1. Problem

Three coupled symptoms:

1. **`/map` is a dataset dumping ground.** `Idea/Bimba/Map/` is 58 files, ~280k lines of raw
   per-branch JSON (`datasets/{anuttara,paramasiva,parashakti,mahamaya,nara,epii}-deep/`,
   plus `low-detail/`), with **no frontmatter, no wikilinks, no index, and no `AGENTS.md`**.
   The data is already imported to Neo4j; the folder is the *import provenance*, not a
   navigable surface.
2. **The DOX chain dead-ends at `Idea/Bimba/`.** `Idea/Bimba/AGENTS.md` marks `World/`,
   `Seeds/`, `Map/` as `(leaf) — content subtrees with no nested AGENTS.md`. So an agent
   working a coordinate has no in-repo navigation contract for those trees.
3. **Modularity drift between `S/S'` and `M/M'` coordinates.** Agents violate repo modularity
   because the relations between coordinates are *not legible in-repo* — they live only in
   Neo4j, which agents rarely consult. With nothing local to reflect the lattice, an agent
   guesses placement instead of reading how a coordinate reflects across the system.

The fix for all three is the same move: **make the bimba map a first-class, pithy,
wikilink-open index at repo level**, so the lattice is navigable and reflective without
duplicating the database, and give the vault trees their missing DOX/OKF navigation nodes.

---

## 2. OKF alignment finding (the lens)

OKF v0.1 = a directory of markdown concept files; one required frontmatter field (`type`)
plus recommended `title`/`description`/`resource`/`tags`/`timestamp`; concepts cross-link
via markdown links so *the directory becomes a graph*; reserved filenames `index.md`
(progressive-disclosure navigation) and `log.md` (change history); consumers tolerate unknown
fields; **the format is the contract, tooling is swappable.**

The Hen vault independently converged on a *superset*:

| OKF construct | Epi-Logos equivalent | State |
|---|---|---|
| concept = markdown file | `World/`, `Seeds/` files (Map excepted) | native |
| `type` (only required field) | `c_4_artifact_role` | richer (typed roles + residency) |
| `title`/`description`/`tags`/`timestamp` | `title`, `c_1_*`, `c_3_created_at`/`updated_at` | present |
| links → directory-as-graph | `[[wikilinks]]` + typed `p0_adjacencies`/`p5_integrations` | more typed |
| `index.md` (progressive disclosure) | DOX `AGENTS.md` + named indexes (`S-SYSTEM-INDEX`) | parallel — **unify (this track)** |
| `log.md` (per-concept history) | git history; `plan.state.json` for plans | gap (deferred, low value) |
| consumers tolerate unknown fields | Hen treats unknown keys as **ERRORS** | deliberate canon-strictness; relax only at export |
| static graph visualizer | Neo4j + `bimba-mcp graph_sync` | exceeds OKF |
| enrichment agent drafts docs | `bimba-populate`; Hen `GraphPromotionIntent` | partial |

**Conclusion:** OKF is not adopted wholesale. Its genuine leverage is exactly the gaps that
land on this track: the `index.md` pattern (→ `/map` navigability + DOX unification), and the
recognition that our frontmatter law *is* an OKF profile, so the system can export to / federate
with the OKF ecosystem via a thin adapter (§7).

---

## 3. Architecture: one sync system, two directions

The wikilink↔Neo4j system has two flows. They must not be conflated (conflating them is what
made "promote `/map` to the graph" sound reasonable — it is not):

- **Crystallisation (repo → Neo4j), upward.** Authoring. Hen promotes crystallised
  Forms/Types from `World/` (and specs from `Seeds/`) into the graph. This is what *Hen
  promotion is for*. Owned by [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]] + S2 sync.
- **Reflection / projection (Neo4j → repo), downward.** Navigation. The graph's nodes are
  projected *down* into a pithy, wikilink-open `/map` index. **Never re-promotes the data** —
  the data already lives in the graph; this is its navigable surface. Rides the existing
  `neo4j_to_obsidian` direction of `bimba-mcp graph_sync` / `graph_context`.

`/map` is the **downward / reflection** tree. `/world` + `/seeds` are the **upward /
crystallisation** trees. This resolves the category error and gives the projection a clean home.

---

## 4. The `/map` projection (L1 — immediate)

### 4.1 Artifact class

`/map` index nodes are a **projection artifact class**, `c_4_artifact_role: "map-index"`.
They are *not* Hen-crystallised canon — like `datasets/`, they do not round-trip through the
Rust compiler. They must be: (a) wikilink-open, (b) structurally sound, (c) carry clear node
content (essence + a curated `## Detail` block) + the full relation index — but **not** the entire
raw dataset; full props stay in Neo4j. Residency: `Idea/Bimba/Map/**`.

### 4.2 Node format

Projected from the **rich deep dataset** `datasets/{branch}-deep/` — node content from
`nodes-full-detail.json` (`filteredProps`), relations from `relations.json` (`relProperties`).
Each node carries: a lead essence; a `## Detail` block (description, operationalEssence, symbol,
completeFormulation, internalStructure, keyPrinciples, architecturalFunction, philosophicalFoundation,
resonances, qlCategory/qlPosition/…); structural `Contains`; and the full `Relations` index.

```markdown
---
coordinate: "M2-5"
c_4_artifact_role: "map-index"
title: "Planetary Harmonic Integration"
c_0_source_coordinates: ["[[M2]]"]
c_0_related_coordinates: ["[[M2-5-(0∕1)]]","[[M2-5-2]]","[[M2-0]]","[[M3]]", …]
c_3_projected_from: "Idea/Bimba/Map/datasets/parashakti-deep"
c_3_projected_at: "2026-06-17"
c_4_graph_node: "neo4j://Bimba/M2-5"
---
# M2-5 · Planetary Harmonic Integration

> The sacred heptarchy where celestial harmonics function as living quantum operators…

## Detail
- **Description:** …
- **Operational essence:** …
- **Internal structure:** …
- **Key principles:** …
- **Architectural function:** … | **QL category:** Bridge-Explicate | **QL position:** 2.5

## Contains
[[M2-5-(0∕1)]] · [[M2-5-2]] · … (structural children — the containment relation)

## Relations (N)   ← the MAIN benefit: the S/S'↔M/M' relational web, legible in-repo
- [[M2-5]] - [[HAS_INTERNAL_COMPONENT]] - [[M2-5-2]]
  - nature: SU(3) λ₃ Diagonal Beauty
  - quantumRole: Aesthetic phase coherence in ternary space
- [[M2-5]] - [[QUANTUM_TRANSLATION_BRIDGE]] - [[M3]]   ← cross-branch reflection, now in-repo
*Every dataset edge (source OR target = this node) is indexed as `[[source]] - [[relation_type]] - [[target]]` with key relation properties; relation types are wikilinks, so their backlinks index every edge of a type across the map.*

## Full node
`graph_context M2-5` · backing data: [[parashakti-deep]]
```

All frontmatter keys are inside the validator's prefix law (`coordinate`, `c_4_artifact_role`,
`title`, `c_0_*`, `c_3_*`, `c_4_*`). OKF aliases: `type`≈`c_4_artifact_role`,
`resource`≈`c_4_graph_node`, `timestamp`≈`c_3_projected_at`.

### 4.3 Layout & depth

The file tree **mirrors the coordinate hierarchy** (this is central): a coordinate with children is
a folder with a `{coord}.md` **folder-note** (so `[[M2-5]]` resolves) holding its children; a leaf
is `{coord}.md`. Each branch dir (`M0/`…`M5/`) carries an `AGENTS.md` — the unified DOX contract +
OKF `index.md` for that branch. The hand-written `Map/AGENTS.md` is the root DOX/OKF node.

```
Map/
  AGENTS.md                       # hand-written DOX+OKF root over the whole projection
  M2/  AGENTS.md                  # generated branch DOX/OKF index
    M2-5/  M2-5.md                # folder-note (so [[M2-5]] resolves) + children:
      M2-5-2.md … M2-5-7.md       # leaf nodes
      M2-5-(0∕1)/  M2-5-(0∕1).md  # context-frame node: folder-note + its own children
        M2-5-(0∕1)-0.md … -7.md
  datasets/                       # unchanged — import provenance / full-detail source
```

**Depth:** **tree-depth** (hops from the branch along the parent chain) is a script arg, **default 3**
(`--max-depth N`); deeper coords stay in Neo4j, referenced by wikilink. ~996 nodes at depth 3
(Mahamaya's `#3-3-3-*` tarot/codon region dominates).

**Coordinate algebra** (matches the migrated graph, verified against Neo4j; the `#` form is a
**legacy tag** migrated to `M`):
- `#`→`M`; a context-frame segment (contains `/`) is parenthesised — but a **position-N frame keeps
  its `N.` OUTSIDE** the parens via dot-notation: `#0-3-0/1` → `M0-3-(0/1)` (simple), `#0-4.0/1/2/3`
  → `M0-4.(0/1/2/3)`, `#0-4.5/0` → `M0-4.(5/0)`. The QL fractal-doubling frame `(4.0/1-4.4/5)` spans
  a `-` (dataset-encoded as `4.4.0-4.4/5`) and is kept intact → `M0-4.(4.0/1-4.4/5)`. **Fixed at the
  generator:** the Rust importer normaliser `wrap_context_frames`
  ([coordinate.rs](Body/S/S2/graph-services/src/coordinate.rs), used by node/edge import) now emits
  this canonical form (+ tests). The live graph still holds the older whole-segment form
  `M0-(4.0/1)` (40 nodes); a **surgical, idempotent rename** is staged at
  [2026-06-17-position4-frame-coordinate-canon.cypher](Idea/Bimba/Map/datasets/migrations/2026-06-17-position4-frame-coordinate-canon.cypher)
  — **DONE**: applied to the live graph (40 nodes renamed, verified, prior backed up).
  - **Cross-language parity (DONE).** The same canonical-normalisation algorithm now lives in 5
    implementations that MUST stay in sync — each cross-references the others in a comment:
    Rust `wrap_context_frames` ([coordinate.rs](Body/S/S2/graph-services/src/coordinate.rs), importer);
    TS `wrapContextFrames` ([syntax.ts](Body/S/S2/external/bimba-mcp/src/coordinates/syntax.ts), applied in
    `parser.ts` + `api/graph.ts`); JS `wrapContextFrames` ([generate-deep-regional-cypher.mjs](Idea/Bimba/Map/datasets/scripts/generate-deep-regional-cypher.mjs),
    + its broken `docs/datasets` path fixed); the projector `canonical()`; and Python
    `_normalise_coordinate` ([coordinator.py](Body/S/S5/epi-gnostic/epi_gnostic/enrichment/coordinator.py),
    applied at all 3 gnostic coordinate sites). All four non-projector impls pass a shared test vector;
    Rust/TS have unit tests. Also fixed: the hardcoded `'#4'` → `'M4'` in `graphiti_service.py`.
    Out of scope (verified, intentionally different): the epi-app `coordinate.ts` UI domain-link
    *classifier* (only matches top-level `M0–M5`), and the `epii-autoresearch-core` resonance-corpus
    seed coords (`#2-1-0`, …) — flagged for that module's owner if it queries the live graph.
- **Hierarchy = the children relation, not a string guess.** Parent comes from the structural
  **containment** edges — `HAS_INTERNAL_COMPONENT` (canonical) + the explicit `HAS_*`/`CONTAINS_*`
  family; SEMANTIC verbs (`PROVIDES_*`, `GENERATES`, `INITIATES`, `DEVELOPS_INTO`) are excluded
  (they connect nested coords but aren't containment — including them over-nests the frames). String
  nearest-ancestor is fallback only. This places `M0-(4.0/1)` (and its sibling frames) **under
  `M0-4`** per `#0-4 -HAS_INTERNAL_COMPONENT-> #0-4.0/1`, not at the `M0` root.
- `/` is illegal in filenames, so file/wikilink names render it `∕` (U+2215); `coordinate:` + the
  `c_4_graph_node` pointer keep the **true `/`**. Node prose stays verbatim (symbolic `#` untouched).

### 4.4 Enrichment-file safety

Seven enrichment docs in the deep folders are **canonical overrides, never overwritten** —
the projector links to them ("See also") instead of regenerating their content:
`hashtag_node_data.md` (`#`), `anuttara-language-map.md` (`#0`),
`fibonacci-60-pisano-integration.md` (`#2-0`→`#3-5`), `Spanda_Genesis_100_Percent.md` (`#1`),
the Paramasiva QL essays (`#1`), `13-03-2026-claude-nara-thinking-marketing.md` (`#4`),
`deep-property-map.md` (all). The projector flags any coordinate with enrichment for review.

### 4.5 Projector

`Idea/Bimba/Map/datasets/scripts/project-map-index.mjs` — idempotent, re-runnable. Node content
(`nodes-full-detail.json` `filteredProps`) and the **Relations** index (`relations.json`
`relProperties`, incl. the containment edges that build the tree) both come from the rich
`datasets/{branch}-deep/`, read with a tolerant loader (those files are BOM'd + carry raw control
chars). It is the **operative seed**: L2 graduates it from a vault script into a Hen/S2 sync
direction sourced from the live graph.

---

## 5. DOX / OKF unification (L1 — immediate)

The DOX `AGENTS.md` "Child Doc Shape" gains an explicit OKF reading: a directory's `AGENTS.md`
*is* its OKF `index.md` (the `c_4_artifact_role` is the OKF `type`; the Child DOX Index is the
OKF concept listing). One navigation file per directory, serving agents and OKF consumers — not
two protocols side by side. This track creates the missing nodes:

- `Idea/Bimba/World/AGENTS.md`, `Idea/Bimba/Seeds/AGENTS.md`, `Idea/Bimba/Map/AGENTS.md`
  (+ per-branch `Map/M*/AGENTS.md` emitted by the projector).
- `Idea/Bimba/AGENTS.md` Child DOX Index updated from `(leaf)` to name the three real children.
- Root `AGENTS.md` "Child Doc Shape" gains a one-paragraph "OKF profile" note.

---

## 6. The drift fix (why this matters)

The `Reflects / Resonates` section is the payoff. Today an agent placing code for, say,
`M2-5` has no in-repo signal of which `S`/`S'` coordinate it actualises, so it improvises and
violates modularity. With the projected index, the coordinate's reflections are a wikilink
click away. **Sourcing of that section:**

- **Now (L1):** structural hierarchy + non-null intra-`M` relations from the dataset
  (`MAPS_TO_ONTOLOGY_LAYER`, `RESONATES_WITH_*`, `BIMBA_ORIGINAL_FOUNDATION`,
  `PRATIBIMBA_REFLECTION_FOUNDATION`, …); branch-top `M↔S` reflections curated from the
  ta-onta carrier ↔ S-layer actualisation map in [[CLAUDE.md]] / the S specs.
- **Later (L2):** full `M↔S`/`M'↔S'` cross-namespace edges (`MAPS_TO_COORDINATE`,
  `RESONATES_WITH`) read from the live graph by the sync. We do **not** fabricate cross-links
  the data can't support; the slot exists now and fills as the sync matures.

---

## 7. Coordinate-grammar gap + wikilink stance

**Gap (real, latent):** Hen `is_valid_coordinate()` ([coordinate.rs](Body/S/S1/hen-compiler-core/src/coordinate.rs))
accepts only depth 0–1 (`#`, `M2`, `M2-5`) and **rejects the ontology's own deep coordinates**
(`M2-5-0`, `#0-2-9` — it parses the post-`#` remainder as a single `u8`). So `/map` nodes at
depth ≥ 2 cannot round-trip through the Rust compiler today.

- **L1:** `/map` nodes are projection artifacts, not compiled — generation needs no Rust edit.
  The `bimba-vault-validate` skill is taught the `map-index` role + `Map/**` residency +
  full-depth coordinate grammar (markdown-level).
- **L2 (owning spec: [[S1-SPEC]] / Hen):** extend `is_valid_coordinate` /
  `is_valid_family_coordinate_base` to the full multi-level grammar (`MX-Z-Y-A`, deep `#…`,
  primes at any level) **+ tests**, so the Neo4j→repo sync can round-trip deep coordinates.
  Central function — requires `gitnexus_impact` before editing and a DOX/spec flag.

**Wikilinks stay native.** `[[wikilinks]]` are the authoring contract (Obsidian graph, Hen
parser, sync all depend on them). OKF's plain `[text](path)` links are produced only by a
**bundle-export adapter** at the boundary — never in source. (L2, low priority.)

---

## 8. Deliverables

**L1 — this session (markdown only, no core-code risk):**
1. This design tranche (+ `plan.index.json` registration).
2. `Idea/Bimba/{World,Seeds,Map}/AGENTS.md` unified DOX+OKF nodes; `Idea/Bimba/AGENTS.md`
   leaf-marker replaced; root `AGENTS.md` OKF-profile note.
3. `project-map-index.mjs` projector + generated `Map/M0..M5/` pithy index tree (depth ≤ 2).
4. `bimba-vault-validate` skill updated (`map-index` role, `Map/**` residency, deep-coordinate grammar).

**L2 — operative / code reality (named, flagged to owning specs):**
1. Extend Hen coordinate grammar to full depth + tests ([[S1-SPEC]]).
2. Promote the projector into a maintained Neo4j→repo sync direction in S2 / `bimba-mcp`
   (`graph_sync neo4j_to_obsidian` scoped to `map-index`), keeping `/map` fresh.
3. Populate `M↔S` reflections from live cross-namespace edges.
4. OKF bundle-export adapter (wikilink → markdown-link) at the export boundary.

**Cycle-3 touch points:** [[40-bimba-canon-update-ledger]] (the map index is a read surface for
canon-change review), [[43-end-of-cycle-3-audit-protocol]] (DOX coverage of `Idea/Bimba/*` is an
audit item this closes), and the S1'/S2 sync tracks. **Extended by [[48-bases-cs-reflection-layer]]** — the `.base` query-view / C5·CS reflection layer over this projection (the MOC `.md` + `.canvas` + `.base` triad; one coordinate-keyed Bases data layer behind both the `/map` and the views).

---

## 9. Verification

- L1: `bimba-vault-validate` over `Idea/Bimba/Map/` and the three new `AGENTS.md`; DOX chain
  walk from root to `Map/M2/M2-5/` returns an unbroken contract chain; spot-check that
  `[[M2-5-0]]` resolves to a generated page; confirm no enrichment doc was overwritten.
- L2: `cargo test -p` the Hen crate for the extended coordinate grammar; round-trip a deep
  coordinate through `graph_sync` both directions.
