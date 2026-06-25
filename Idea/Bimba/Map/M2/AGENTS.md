# AGENTS.md — Map / M2 Parashakti

## Purpose
Generated pithy index of the M2 Parashakti graph branch — a Neo4j→repo *reflection* (Track 45), not crystallised canon. The self-reflective power of consciousness (Vimarśa) that creates infinite vibrational templates through 72-bit double-covering architecture, embodying the cosmic imagination that dreams all possibilities while remaining eternally suspende…
Canon: [[M2]] (World Form) -> [[M-SYSTEM-INDEX]]; design: [[45-bimba-map-indexing-and-dox-okf-unification]].

## Ownership
- Pithy `map-index` nodes for M2 descendants, tree-depth ≤ 3 (134 nodes). **The folder tree mirrors the children relation** (containment edges, e.g. HAS_INTERNAL_COMPONENT) — a coord with children is a folder + `{coord}.md` folder-note. Each node = content detail + `Contains` + a full `Relations` index + a Neo4j pointer.
- `M2-1/M2-1.base` — `base-view` card/table reflection for the [[M2-1]] MEF lens set; it reads the generated node frontmatter and is not itself graph canon.
- Context-frame coords (e.g. `M2-(0/1)`) render `/` as `∕` in file/link names; `coordinate:` + the graph pointer keep the true `/`. Nest under their containment parent (e.g. `M0-(4.0/1)` lives under `M0-4`).
- Does NOT own canon meaning — that is the [[M2]] Form + its [[Seeds]] specs. Full detail lives in Neo4j + `datasets/parashakti-deep/` (legacy `#`-tagged source).

## What Belongs Here
- This authored branch index states the [[M2]] navigation law; the embedded [[M2-1.base]] is the live [[C5]] / [[CS]] reflection for the worked [[M2-1]] MEF lens set.

![[M2-1.base]]

## Open Gaps
- This local base block surfaces [[M2]] branch projection files whose required `map-index`
  frontmatter is missing or orphaned. Fix the graph/source projection rather than hand-editing
  generated nodes.

```base
filters:
  and:
    - 'file.path.startsWith("Bimba/Map/M2")'
    - or:
        - 'coordinate == null'
        - 'c_4_artifact_role == null'
        - 'c_4_graph_node == null'
        - 'c_0_source_coordinates == null'
views:
  - type: table
    name: "M2 reflection gaps"
    order:
      - file
      - coordinate
      - c_4_artifact_role
      - c_4_graph_node
      - c_0_source_coordinates
```

## Local Contracts
- Projector: `Idea/Bimba/Map/datasets/scripts/project-map-index.mjs`. Source: `datasets/parashakti-deep/` (nodes + relations). Graph: `neo4j://Bimba/M2`.

## Work Guidance
- Generated — do NOT hand-edit nodes; change the graph/source and re-run the projector.
- `[[wikilink]]` is the navigation contract; every coordinate node is a resolvable page.

## Verification
- `bimba-vault-validate` over this directory (map-index role, Map/** residency).

## Child DOX Index (= OKF concept index)
- Entry coordinates: [[M2-0]] · [[M2-1]] · [[M2-2]] · [[M2-3]] · [[M2-4]] · [[M2-5]]
