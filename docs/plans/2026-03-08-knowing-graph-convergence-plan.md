# Knowing + Graph Convergence Plan (v2)

**Date:** 2026-03-08
**Goal:** Get `epi core knowing` and `epi graph` fully working end-to-end with proper 96-coordinate coverage, rich quintessence packs, holographic seed topology, and integrated Vimarsa/Graph facets.

---

## Overview: Four Parallel Streams

```
Stream A: Holographic Seed Topology (Neo4j label architecture + relationships)
Stream B: Knowing Quality (96-coord coverage + QV content + dynamic relations)
Stream C: Vimarsa Integration (curiosity-driven coordinate exploration)
Stream D: Dataset Validation (TS Zod schemas — core structural set only)

Key Decision: NO automated M-branch data import.
  Data import is a present, intentional process done with running system agent.
  We focus on the seed structure that organizes everything else.
```

---

## Stream A: Holographic Seed Topology

### A1. Docker + Compilation Verification
**Status:** NOT STARTED
**Parallel-safe:** Yes

1. Start Docker stack:
   ```bash
   docker compose -f docker-compose.epi-s2.yml up -d
   ```
2. Verify Neo4j at `localhost:7474` (browser) + `bolt://localhost:7687`
3. Verify Redis at `localhost:6379`
4. Verify Cargo.toml graph deps compile: `neo4rs`, `redis`, `tokio`, `reqwest`
5. `cargo check` — all graph modules compile
6. `cargo test --lib graph` — unit tests green

**Output:** Docker running, graph code compiling.

### A2. Schema + Seed — The True QL Seed
**Status:** IN PROGRESS (seed.rs rewrite dispatched)
**Depends on:** A1 for runtime testing; code changes independent

#### Neo4j Label Architecture (Multi-Label)

Every node gets `Bimba` as implicit namespace label + type label:

| Labels | Nodes | Count |
|--------|-------|-------|
| `Bimba:Root` | # (The Inversion Act) | 1 |
| `Bimba:Psychoid` | #0-#5 (Raw Archetypes) | 6 |
| `Bimba:Weave` | Weave_0_0, Weave_0_5, Weave_5_0, Weave_5_5 | 4 |
| `Bimba:ContextFrame` | CF_VOID through CF_MOBIUS | 7 |
| `Bimba:Family` | Family_C, Family_P, Family_L, Family_S, Family_T, Family_M | 6 |
| `Bimba:Coordinate` | C0-C5, P0-P5, L0-L5, S0-S5, T0-T5, M0-M5 (base+inv) | 72 |
| `Bimba:Vak` | CPF, CT, CP, CF, CFP, CS | 6 |
| **Total** | | **102** |

Property key: `coordinate` (not `bimbaCoordinate`).

#### Relationship Structure — Full Ontological Topology

| Type | From → To | Count | Meaning |
|------|-----------|-------|---------|
| `GENERATES` | # → #0-#5 | 6 | Root emanation |
| `ENTANGLES` | #N ↔ CF (bidirectional) | ~18 | Position-specific psychoid↔CF mutual implication |
| `INTERLEAVES` | Weave ↔ #/Psychoid (bidirectional) | ~16 | Memory arena weaving pattern |
| `MANIFESTS` | #N → family coords | 72 | Archetype becomes family instance |
| `BEDROCK` | coord → #N | 72 | Family coord's archetypal ground |
| `INVERTS_TO` | X → X' | 36 | Phase inversion |
| `FAMILY_CONTAINS` | Family_X → coords | 72 | Organizational grouping |
| `REFLECTS_AS` | C0'-C5' → VAK | 6 | Category inversion = reflective operator |
| `OPERATES_IN` | VAK → CF | 6 | Execution context binding |
| `MOBIUS_RETURN` | #5 → #0 | 1 | Cycle closure |
| `ANCHORED_TO` | CF_FRACTAL → #4 | 1 | Primary Lemniscate anchor |
| **Total** | | **~306** |

##### Entanglement Detail (Psychoid ↔ CF)
- #0 ↔ CF_VOID (00/00)
- #1 ↔ CF_BINARY (0/1)
- #2 ↔ CF_TRIKA (0/1/2)
- #3 ↔ CF_QUATERNAL (0/1/2/3)
- #4 ↔ CF_FRACTAL (4.0/1-4.4/5)
- #4 ↔ CF_SYNTHESIS (4/5/0) — spans 4-5-0
- #5 ↔ CF_SYNTHESIS (4/5/0) — second leg
- #0 ↔ CF_SYNTHESIS (4/5/0) — third leg (the return)
- #5 ↔ CF_MOBIUS (5/0)

##### Weave Interleaving Detail (from C memory arena)
- Weave_0_0 ↔ # (root implicate) + ↔ #0 (pure ground)
- Weave_0_5 ↔ #0 (ground reaching) + ↔ #5 (toward instance)
- Weave_5_0 ↔ #5 (instance reaching) + ↔ #0 (back to ground)
- Weave_5_5 ↔ # (root implicate) + ↔ #5 (pure instance)

##### C' → VAK Reflection
- C0' → CPF, C1' → CT, C2' → CP, C3' → CF, C4' → CFP, C5' → CS

##### VAK → CF Operational Binding
- CPF → CF_BINARY, CT → CF_TRIKA, CP → CF_FRACTAL
- CF → CF_MOBIUS, CFP → CF_FRACTAL, CS → CF_VOID

### A3. Schema Updates (schema.rs)
**Status:** IN PROGRESS (dispatched with seed rewrite)

1. Update constraint: `coordinate` on `Bimba` (was `bimbaCoordinate` on `BimbaCoordinate`)
2. Update indexes: label references from `BimbaCoordinate` → `Bimba`
3. Keep vector index (768-dim cosine)

### A4. Integration Test Harness
**Depends on:** A1 (Docker running) + A2 (seed complete)

1. Un-ignore `#[ignore]` tests with Docker availability check
2. Update assertions: 102 nodes, ~306 rels, `coordinate` property name
3. Verify via Cypher: `MATCH (n:Bimba) RETURN labels(n), count(n)`

**Output:** Green integration tests with Docker.

### A-FUTURE: Data Import (DEFERRED — Manual Process)
NOT automated. M-branch data import is a present, intentional process done with
the human and a running system agent. The seed topology provides the structural
skeleton. Eventually managed via neosemantics (n10s) ontologies.

---

## Stream B: Knowing Quality — 96-Coord Coverage + Rich QV Content

### B1. Expand Coverage from 89 → 96
**Status:** DONE

- `#` counted in psychoid class (7 total: # + #0-#5)
- VAK coords (CPF, CT, CP, CF_R, CFP, CS) counted
- `--family VAK` listing added
- `total_possible` = 96

### B2. Audit + Replace Hardcoded Relations Tables
**Status:** NOT STARTED
**Parallel-safe:** Yes

**File:** `epi-cli/src/core/mod.rs`

1. Inventory all hardcoded relation data (inline `Vec<FacetItem>`, static strings)
2. Replace with dynamic lookup:
   - Structural correspondences: compute from overlay data (include pithy for each)
   - Pithy text: always check overlay first, static fallback second
3. Improve structural correspondence quality:
   - Include actual pithy/essence for each correspondence, not just coordinate name
   - Show resonance pattern across families sharing same archetype

**Output:** Dynamic content sourced from overlay + graph when available.

### B3. Generate Foundational Quintessence Packs (All 96 Coords)
**Status:** NOT STARTED
**Parallel-safe:** Yes

**Target:** `~/.epi-logos/qv/overlay.json`

For each of 96 coordinates, generate rich QV entries with 5 fields:
- `essence` — 1-2 sentence pithy
- `q_nature` — What this coordinate IS
- `q_essence` — Why it matters
- `q_formulation` — How it operates
- `q_structure` — Where it sits

| Group | Count | Source |
|-------|-------|--------|
| C-family (base+inv) | 12 | CLAUDE.md Bimba-Pratibimba definitions |
| P-family (base+inv) | 12 | CLAUDE.md Position semantics |
| L-family (base+inv) | 12 | CLAUDE.md Lens modes |
| S-family (base+inv) | 12 | S-stack specs (docs/specs/S/) |
| T-family (base+inv) | 12 | CLAUDE.md Thought artifacts |
| M-family (base+inv) | 12 | M-branch datasets + C headers (include/m0-m5.h) |
| Psychoids (#, #0-#5) | 7 | CLAUDE.md raw archetypes |
| Context Frames | 7 | CLAUDE.md execution matrix |
| Weaves | 4 | CLAUDE.md memory arena |
| VAK | 6 | CLAUDE.md reflective coordinates |

**Process:**
1. `epi core knowing --coverage` — audit current state
2. Backup: `epi core knowing --export > overlay-backup.json`
3. Generate QV entries per group
4. Write to overlay.json
5. Verify: `epi core knowing --coverage` → 96/96
6. Compile: `epi core knowing --bake`

### B4. Activate Graph Facet in Knowing Dossier
**Depends on:** A2 (seed populated)

**File:** `epi-cli/src/core/knowing/graph.rs`

1. Update graph queries for new label architecture (`Bimba` not `BimbaCoordinate`)
2. Update property references (`coordinate` not `bimbaCoordinate`)
3. With Neo4j running + seeded, the Relational Field facet auto-activates
4. Tune BEDROCK constellation + relation chain queries
5. Verify: `epi core knowing M0 --json` → populated `relational_field`

---

## Stream C: Vimarsa Integration (Curiosity-Driven Exploration)

### C1. Port kbase.sh + Rename to Vimarsa
**Status:** DONE (kbase.sh bundled) → IN PROGRESS (vimarsa rename dispatched)

- `epi kbase` → `epi vimarsa`
- Module rename: `src/kbase/` → `src/vimarsa/`
- Types rename: `KbaseFieldFacet` → `VimarsaFieldFacet`
- Dossier facet: `kbase_field` → `vimarsa_field`
- Aperture-aware project mapping: family letter → bkmr project name

### C2. Seed Aperture Projects
**Status:** NOT STARTED
**Depends on:** C1

Create bkmr projects per coordinate family (apertures):

```
~/.config/bkmr/projects/
├── C.db       # Category aperture (ontological)
├── P.db       # Position aperture (functional)
├── L.db       # Lens aperture (epistemic)
├── S.db       # Stack aperture (technology)
├── T.db       # Thought aperture (artifacts)
├── M.db       # Subsystem aperture (consciousness)
├── root.db    # Foundation (#, psychoids, CFs, weaves)
└── epi-logos.db  # Cross-project fallback
```

### C3. Populate Apertures with Tagged Docs
**Depends on:** C2

For key docs, add to appropriate aperture with multi-coordinate tags:
- `include/m0.h` → M aperture, tags: `_M _M0 _#0 _anuttara _vimarsa_engine`
- `docs/specs/S/S2-S2i-GRAPH.md` → S aperture, tags: `_S _S2 _#2 _neo4j _graph`
- Tags serve as breadcrumbs: multi-coordinate tags show cross-family connections

Agent curiosity workflow:
```
epi vimarsa M0          → open M aperture, see M0-tagged docs
  see tags: _#0 _CF_VOID _anuttara → curiosity about CF_VOID
epi vimarsa CF_VOID     → open root aperture, CF_VOID entries
  discover: files spanning M0, M1, C lib...
epi vimarsa search-all "spanda" → fuzzy across ALL apertures
```

---

## Stream D: Dataset Validation (Core Structural Set Only)

### D1. TS Zod Schema Validation Script
**Status:** DONE

- Script: `epi-cli/schemas/validate-datasets.ts` (runnable via `bun run validate`)
- Findings: 278 null names (mahamaya #3-3-2-0-*, nara #4.5.*) — data exists in deep folders
- Zero overlap between canonical relation types (S-stack operational) and dataset types (M-branch ontological)
- Field naming gap: datasets use `coordinate` not `bimbaCoordinate`

### D2. Extend Zod Schemas for Seed Relations
**Status:** NOT STARTED
**Parallel-safe:** Yes

1. Add seed structural relation types to `relations.ts`:
   - GENERATES, ENTANGLES, INTERLEAVES, MANIFESTS, BEDROCK
   - INVERTS_TO, FAMILY_CONTAINS, REFLECTS_AS, OPERATES_IN
   - MOBIUS_RETURN, ANCHORED_TO
2. Keep existing 34 S-stack types
3. Document: M-branch ontological types are per-subsystem, managed via n10s in future
4. Update `validate-datasets.ts` to distinguish seed-structural vs operational vs ontological types

### D3. Update dataset_import.rs Field Mapping
**Status:** NOT STARTED (deferred — import is manual process)

When data import eventually happens:
1. Map `coordinate` field (dataset) → `coordinate` property (Neo4j)
2. Handle the M-branch ontological relation types via n10s or explicit mapping
3. This is future work — NOT part of current execution

---

## Execution Status

| Task | Stream | Status | Agent |
|------|--------|--------|-------|
| A1 | Infra | NOT STARTED | — |
| A2 | Seed topology | IN PROGRESS | Seed rewrite agent |
| A3 | Schema updates | IN PROGRESS | Seed rewrite agent |
| A4 | Integration tests | BLOCKED (needs A1+A2) | — |
| B1 | Coverage 89→96 | DONE | Completed |
| B2 | Audit hardcoded | NOT STARTED | — |
| B3 | QV packs | NOT STARTED | — |
| B4 | Graph facet | BLOCKED (needs A2) | — |
| C1 | Vimarsa rename | IN PROGRESS | Vimarsa rename agent |
| C2 | Seed apertures | BLOCKED (needs C1) | — |
| C3 | Populate apertures | BLOCKED (needs C2) | — |
| D1 | Zod validation | DONE | Completed |
| D2 | Extend schemas | NOT STARTED | — |

---

## Success Criteria

1. `epi core knowing --coverage` → **96/96** with rich content
2. `epi core knowing M0` → all 6 facets populated (essence, structural, relational, vimarsa, notebook, snapshot)
3. `epi core knowing M0 --json` → valid JSON with graph data in relational_field
4. `epi graph seed` → 102 nodes with proper multi-label architecture
5. Neo4j Cypher: `MATCH (n:Bimba) RETURN labels(n), count(n)` shows all 7 type labels
6. Seed relationships: ~306 rels with full ontological topology
7. `epi vimarsa M0` → opens M aperture, shows tagged docs with coordinate breadcrumbs
8. `epi vimarsa search-all "lemniscate"` → cross-aperture fuzzy discovery
9. All `cargo test` green (unit + integration with Docker)
10. No hardcoded superfluous relations in knowing output — all dynamic from overlay/graph

---

## Files Modified/Created Summary

### Renamed:
- `epi-cli/src/kbase/` → `epi-cli/src/vimarsa/` (module rename)
- `epi-cli/src/core/knowing/kbase.rs` → `vimarsa.rs` (knowing integration)

### Modified:
- `epi-cli/src/core/mod.rs` — coverage 96, VAK handler, dynamic relations
- `epi-cli/src/core/knowing/types.rs` — VimarsaFieldFacet (was KbaseFieldFacet)
- `epi-cli/src/core/knowing/mod.rs` — vimarsa import
- `epi-cli/src/core/knowing/render.rs` — Vimarsa section header
- `epi-cli/src/main.rs` — Vimarsa subcommand (was Kbase)
- `epi-cli/src/graph/seed.rs` — full topology rewrite
- `epi-cli/src/graph/schema.rs` — Bimba labels, coordinate property
- `epi-cli/schemas/src/relations.ts` — seed structural types added
- `~/.epi-logos/qv/overlay.json` — 96 rich QV entries

### Created:
- `epi-cli/schemas/validate-datasets.ts` — Zod validation script (DONE)
- `epi-cli/scripts/kbase.sh` — bundled bkmr wrapper (DONE)

### Infrastructure:
- Docker: Neo4j 5-community + Redis 7-alpine via `docker-compose.epi-s2.yml`
