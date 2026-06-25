# AGENTS.md — Map

## Purpose
`Idea/Bimba/Map` is the **M0–M5 ontological map made navigable at repo level**: a pithy,
wikilink-open *reflection* of the Bimba graph (Neo4j→repo projection), plus the raw datasets
that are the graph's import provenance. It is the **downward / reflection** tree of the
wikilink↔Neo4j system, complementing the **upward / crystallisation** trees (`World/`, `Seeds/`)
— it never re-promotes data the graph already holds.
Canon: [[World-Ontology]] -> [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M-SYSTEM-INDEX]]; design + rules: [[45-bimba-map-indexing-and-dox-okf-unification]].

## Ownership
- `M0/` … `M5/` — **generated** `map-index` projection: one `{coord}.md` per coordinate
  (tree-depth ≤ 3 from each branch, ~996 nodes) + a per-branch `AGENTS.md` index node. **The file
  tree mirrors the children relation** — parent comes from the structural containment edges
  (`HAS_INTERNAL_COMPONENT` + the `HAS_*`/`CONTAINS_*` family; not semantic verbs), so e.g.
  `M0-(4.0/1)` sits **under `M0-4`**. A coord with children is a folder with a `{coord}.md`
  folder-note; leaves are files. Each node = lead essence + a `## Detail` block (description,
  operationalEssence, symbol, completeFormulation, internalStructure, keyPrinciples, …) + `Contains`
  + a full `Relations` index + a Neo4j pointer; **not the raw dataset**. Do NOT hand-edit — re-run the projector.
- Coordinate notation matches the migrated graph (`#` legacy → `M`; context frames in parens, e.g.
  `M2-5-(0/1)`). `/` is illegal in filenames, so file/wikilink names render it `∕` (U+2215); the
  `coordinate:` frontmatter + `c_4_graph_node` keep the true `/`. Node prose stays verbatim.
- `datasets/` — raw per-branch dataset JSON (`{anuttara,paramasiva,…,epii}-deep/`, `low-detail/`),
  enrichment docs, and build/fetch/cypher scripts. This is the **import provenance + full-detail
  source**, not a navigation surface; the graph (and `*-deep/`) hold full node detail.
- `Map-Aggregate-Browser.base` — zone-level `base-view` reflection for coarse aggregate browsing and
  card/image entry over `map-index` frontmatter; it feeds curated canvas/Theia views and does not
  replace Neo4j typed-edge traversal.
- Does NOT own canon meaning — that is each [[M0]]…[[M5]] World Form + its `Seeds/` specs. Domain
  law stays in the owning coordinate module, never relocated here.

## What Belongs Here
- Authored branch indexes remain the navigation law for `/Map`; the embedded [[Map-Aggregate-Browser.base]]
  is the computed reflection over current `map-index` frontmatter.

![[Map-Aggregate-Browser.base]]

## Open Gaps
- This local base block surfaces projected `/Map` files that are missing the minimum reflection
  frontmatter required to remain navigable. Repair the projection/source, then re-run the projector;
  do not let the base become the authored index.

```base
filters:
  and:
    - 'file.path.startsWith("Bimba/Map")'
    - or:
        - 'coordinate == null'
        - 'c_4_artifact_role == null'
        - 'c_4_graph_node == null'
        - 'c_0_source_coordinates == null'
views:
  - type: table
    name: "Map reflection gaps"
    order:
      - file
      - coordinate
      - c_4_artifact_role
      - c_4_graph_node
      - c_0_source_coordinates
```

## Local Contracts
- Projector: `datasets/scripts/project-map-index.mjs` (Neo4j-shape JSON → pithy index; idempotent).
- Sync direction (operative, L2): `graph_sync neo4j_to_obsidian` scoped to `map-index`; full
  cross-namespace `M↔S` reflections fill from the live graph as that lands (Track 45 §6).
- No `CONTRACT.md` / crate here — knowledge tree.

## Work Guidance
- The `M0/`–`M5/` trees are **generated projection artifacts** (`c_4_artifact_role: "map-index"`),
  not Hen-crystallised canon — they do not round-trip through the Rust compiler. To change a node,
  change the graph/source and re-run the projector; do not hand-edit.
- `[[wikilink]]` is the navigation contract: every projected coordinate is a resolvable page, so
  the `S/S'`↔`M/M'` reflective web is navigable in-repo (the point — see Track 45 §1, §6).
- Enrichment docs in `datasets/*-deep/` (e.g. [[anuttara-language-map]],
  [[fibonacci-60-pisano-integration]], [[Spanda_Genesis_100_Percent]]) are **canonical overrides** —
  linked as "See also", never overwritten by the projector.

## Verification
- `bimba-vault-validate` over `Map/` (recognises the `map-index` role + `Map/**` residency +
  full-depth coordinate grammar — see the skill).
- Re-run `node datasets/scripts/project-map-index.mjs --max-dashes 2` and confirm a clean diff.

## Child DOX Index (= OKF concept index)
- `M0/AGENTS.md` … `M5/AGENTS.md` — generated per-branch pithy index of M0–M5 descendants.
- `datasets/` — (leaf) raw provenance datasets + scripts; no nested AGENTS.md.
