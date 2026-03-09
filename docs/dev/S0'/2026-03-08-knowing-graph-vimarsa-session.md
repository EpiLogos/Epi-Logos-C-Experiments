# Session: Knowing + Graph + Vimarsa Convergence

**Date:** 2026-03-08/09
**Scope:** S0' CLI — epi core knowing, epi graph, epi vimarsa
**Plan:** docs/plans/2026-03-08-knowing-graph-convergence-plan.md (v2)

---

## Summary

Major restructuring session bringing three CLI subsystems toward convergence:
`epi core knowing` (coordinate self-knowledge), `epi graph` (Neo4j holographic schema),
and `epi vimarsa` (curiosity-driven exploration, renamed from kbase).

## Changes Made

### 1. Coverage Expansion: 89 → 96 Coordinates (B1 — DONE)
- `#` (inversion operation) now counted in psychoid class (7 total: # + #0-#5)
- VAK reflective coords (CPF, CT, CP, CF_R, CFP, CS) added to coverage
- `--family VAK` / `--family R` listing added
- `total_possible` updated to 96

### 2. Neo4j Holographic Seed Topology (A2 — DONE)
- **Multi-label architecture:** `Bimba` namespace + type labels (Root, Psychoid, Weave, ContextFrame, Family, Coordinate, Vak)
- **102 nodes:** original 96 + 6 Family meta-nodes (Family_C through Family_M)
- **~306 relationships** with full ontological topology:
  - GENERATES (# → #0-#5), ENTANGLES (#N ↔ CF bidirectional)
  - INTERLEAVES (Weave ↔ #/Psychoid), MANIFESTS, BEDROCK, INVERTS_TO
  - FAMILY_CONTAINS, REFLECTS_AS (C' → VAK), OPERATES_IN (VAK → CF)
  - MOBIUS_RETURN (#5 → #0), ANCHORED_TO (CF_FRACTAL → #4)
- Property key: `coordinate` (not `bimbaCoordinate`)
- CF_SYNTHESIS correctly maps to (4/5/0), spanning #4-#5-#0

### 3. Graph Schema Migration (DONE)
- All ~20 graph module files migrated: `BimbaCoordinate` → `Bimba`, `bimbaCoordinate` → `coordinate`
- Cypher queries, struct fields, JSON keys, TS schemas — all aligned
- Test files updated, `cargo check --tests` clean

### 4. Vimarsa Rename (C1 — DONE)
- `epi kbase` → `epi vimarsa` (KS: self-reflective awareness, impulse to inquire)
- Module: `src/kbase/` → `src/vimarsa/`
- Types: `KbaseFieldFacet` → `VimarsaFieldFacet`, dossier field `kbase_field` → `vimarsa_field`
- Aperture-aware project mapping: family letter → bkmr project name
  - M→M.db, C→C.db, P→P.db, etc. | #/CF/W/VAK→root.db | fallback→epi-logos.db
- KbaseHit in cache.rs kept for serialization backward compat

### 5. NotebookLM Bundling (DONE)
- Scripts bundled: `epi-cli/scripts/notebooklm/{setup.sh, query_notebook.py}`
- `epi notebook` subcommand added (ask, list, setup, raw)
- 4-step resolution: EPI_NOTEBOOKLM_BIN → installed → dev → epi-claw fallback
- `epi techne notebook` backward compatible

### 6. Dossier Parallelization (DONE)
- Graph, vimarsa, notebook facets now fetched concurrently (was serial)
- Timeouts: graph 750ms (existing), vimarsa 1500ms (new), notebook 2500ms (new)
- `--quick` mode: skips notebook + vimarsa, fast path for essence + structural + graph
- Stale-while-refresh: cached snapshot returned immediately, background refresh
- Latency: "slowest facet wins" instead of "sum of all facets"

### 7. Dataset Validation (D1 — DONE)
- `epi-cli/schemas/validate-datasets.ts` created (bun/npx tsx)
- Findings: 278 null names, zero canonical relation type overlap (S-stack vs M-branch types)
- Field naming gap documented (datasets use `coordinate`, schemas now aligned)

## Key Decisions

1. **NO automated M-branch data import** — manual process with running system agent
2. **Vimarsa apertures** = bkmr projects per coordinate family, tags as multi-coordinate breadcrumbs
3. **Neo4j labels** are layered (Bimba:Type), not flat (BimbaCoordinate)
4. **M-branch ontological relation types** deferred to n10s (neosemantics) — not canonicalized now
5. **CF_SYNTHESIS** = (4/5/0), not just (4.4/5) — spans #4, #5, #0

## Remaining Work

| Task | Status | Notes |
|------|--------|-------|
| B2: Audit hardcoded relations | NOT STARTED | Replace with dynamic overlay/graph lookup |
| B3: Generate 96 QV packs | NOT STARTED | Rich quintessence content for all coords |
| C2: Seed aperture projects | NOT STARTED | Create per-family bkmr DBs |
| C3: Populate apertures | NOT STARTED | Tag docs with coordinate breadcrumbs |
| D2: Extend Zod schemas | NOT STARTED | Add seed structural relation types |
| A1: Docker up | NOT STARTED | Neo4j + Redis stack |
| A4: Integration tests | BLOCKED | Needs Docker |
| B4: Graph facet activation | BLOCKED | Needs Docker + seed |

## File Inventory

### New files:
- `epi-cli/scripts/kbase.sh` — bundled bkmr wrapper
- `epi-cli/scripts/notebooklm/setup.sh` — venv setup
- `epi-cli/scripts/notebooklm/query_notebook.py` — query wrapper
- `epi-cli/src/vimarsa/mod.rs` — vimarsa subcommand module
- `epi-cli/src/notebook/mod.rs` — notebook subcommand module
- `epi-cli/src/core/knowing/vimarsa.rs` — vimarsa dossier facet
- `epi-cli/schemas/validate-datasets.ts` — Zod validation script
- `docs/plans/2026-03-08-knowing-graph-convergence-plan.md` — convergence plan v2

### Key modified files:
- `epi-cli/src/graph/seed.rs` — full topology rewrite (102 nodes, 306 rels)
- `epi-cli/src/graph/schema.rs` — Bimba labels
- `epi-cli/src/graph/*.rs` — schema migration (~15 files)
- `epi-cli/src/core/mod.rs` — coverage 96, --quick flag
- `epi-cli/src/core/knowing/*.rs` — vimarsa rename, parallel facets, timeouts
- `epi-cli/src/main.rs` — vimarsa + notebook subcommands
- `epi-cli/schemas/src/*.ts` — coordinate → property name alignment

### Removed:
- `epi-cli/src/kbase/` (renamed to vimarsa)
- `epi-cli/src/core/knowing/kbase.rs` (renamed to vimarsa.rs)
