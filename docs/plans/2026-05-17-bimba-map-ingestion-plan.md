---
coordinate: "S2"
c_4_artifact_role: "plan"
c_3_created_at: "2026-05-17T00:00:00Z"
---

# Bimba Map Ingestion: Task Plan (v2)

**Goal:** Ingest low-detail M-branch datasets (~1,880 nodes, ~10,550 relations) into Neo4j as `:Bimba` nodes via `epi graph import low-detail`. ALL properties coordinate-driven (`{family}_{n}_{semantic}`). All coordinates converted from `#` notation to `M` family. Every canonical property scaffolded even if empty. Migrate existing `BimbaCoordinate` scaffold into `:Bimba` with property renaming.

**Surface:** `epi graph import` (Rust CLI graph commands)

---

## 1. Current State

| Item | State |
|------|-------|
| Docker (epi-neo4j) | Running, healthy, no auth |
| `:Bimba` label | 2 test nodes (graph method test stubs) |
| `:BimbaCoordinate` label | 96 nodes — scaffold with bare property names (`name`, `family`, `ql_position`, `layer`, `topo_mode`, `weave_state`, `inversion_state`, `flags`) |
| `graph-schema` crate | Label `Bimba`, but property names are MIXED — some bare (`name`, `family`), some prefixed (`c_1_ct_type`). **This is the schema failure to fix.** |
| `coordinate.rs` parser | Only handles 2-char family coords (`M0`, `C5`), psychoids (`#`, `#0`-`#5`), CF_*, VAK, Weave. **Cannot parse sub-coordinates** (`M0-2-4`, `M4.0-0`). |
| `dataset_import.rs` | Maps only `name`, `description`, `essence`, `core_nature`. Missing `formulation`, `structure`, computed metadata, null scaffolding, `# → M` conversion. |
| Low-detail datasets | `docs/datasets/low-detail/` — all coords in `#` notation |
| Relations | 12+17+1024+234+4017+4891+284+71 = ~10,550 (null targets already filtered) |

---

## 2. The `# → M` Coordinate Conversion

The dataset coordinates use `#` prefix because they represent the M-branch (Bimba Map subsystem). This is legacy notation from before the six-family coordinate system was established.

### Conversion rule

Replace leading `#` with `M`:

| Dataset coord | Converted coord | Notes |
|---------------|-----------------|-------|
| `#` | `M` | M-family root |
| `#0` | `M0` | Merges into existing scaffold M0 |
| `#0-0` | `M0-0` | Sub-coordinate of M0 |
| `#0-0-1` | `M0-0-1` | Deeper sub-coordinate |
| `#0-2-4` | `M0-2-4` | Three levels deep |
| `#-0` ... `#-5` | `M-0` ... `M-5` | Lens coordinates on M root |
| `#4.0` | `M4.0` | Nara lemniscate notation (dot preserved) |
| `#4.0-0` | `M4.0-0` | Nara sub-coordinate |

### Layer interaction

The existing scaffold has BOTH:
- `#0`-`#5` as PSYCHOID layer (raw archetypes) — these STAY as `#0`-`#5`
- `M0`-`M5` as COORDINATE layer (family manifestations) — dataset content MERGES here

The conversion places dataset content where it belongs: into the M-family coordinate space. The scaffold's `#0` PSYCHOID nodes remain as the Layer 1 archetypes that M0 manifests.

### Implementation

In `dataset_import.rs`, convert coordinates before MERGE:

```rust
fn convert_hash_to_m_family(coord: &str) -> String {
    if coord.starts_with('#') {
        format!("M{}", &coord[1..])
    } else {
        coord.to_string()
    }
}
```

Relations also need both source and target converted before MATCH.

---

## 3. Property Schema: Full `{family}_{n}_{semantic}` Conversion

**Rule:** Every property except the exempt `coordinate` PK must follow `{family}_{n}_{semantic}`.

### 3A. Property Rename Map

| Current (bare) | Canonical | C-position rationale |
|----------------|-----------|---------------------|
| `coordinate` | `coordinate` | **Exempt** — ground reference |
| `uuid` | `c_2_uuid` | C2 = Entity (unique identity) |
| `name` | `c_1_name` | C1 = Form (essential presentation) |
| `description` | `c_1_description` | C1 = Form |
| `family` | `c_4_family` | C4 = Type (categorization) |
| `ql_position` | `c_4_ql_position` | C4 = Type |
| `layer` | `c_4_layer` | C4 = Type |
| `topo_mode` | `c_4_topo_mode` | C4 = Type |
| `vault_path` | `s_1_vault_path` | S1 = Obsidian (vault layer) |
| `semantic_embedding` | `c_5_embedding` | C5 = Pratibimba (integration/reflection) |
| `essence` | `c_0_essence` | C0 = Bimba (ground/essential nature) |
| `core_nature` | `c_0_core_nature` | C0 = Bimba |
| `formulation` | `c_1_form` | C1 = Form (structural expression) |
| `structure` | `c_1_structure` | C1 = Form |
| `source_dataset` | `c_3_source_dataset` | C3 = Process (provenance) |
| `dataset_branch` | `c_3_dataset_branch` | C3 = Process |
| `dataset_branch_label` | `c_3_dataset_branch_label` | C3 = Process |
| `weave_state` | `c_4_weave_state` | C4 = Type |
| `inversion_state` | `c_4_inversion_state` | C4 = Type |
| `flags` | `c_4_flags` | C4 = Type |

### Already correct (keep as-is)

| Property | Status |
|----------|--------|
| `c_0_source_coordinates` | Correct |
| `c_1_ct_type` | Correct |
| `c_4_artifact_role` | Correct |
| `c_3_created_at` | Correct |

### Relationship properties

| Current | Canonical | Status |
|---------|-----------|--------|
| `c_0_source_coordinate` | `c_0_source_coordinate` | Correct |
| `c_0_target_coordinate` | `c_0_target_coordinate` | Correct |
| `c_1_relation_family` | `c_1_relation_family` | Correct |
| `c_2_relation_type` | `c_2_relation_type` | Correct |
| `c_3_created_at` | `c_3_created_at` | Correct |
| `c_4_provenance` | `c_4_provenance` | Correct |

### Compatibility shim

The `bimbaCoordinate` compat property stays as `compatibility: true` in the spec — it's only for reading old data, never written to new nodes.

---

## 4. Coordinate Parser Extension

**File:** `Body/S/S2/graph-services/src/coordinate.rs`

The parser currently only handles flat coordinates. It must support the fractal sub-coordinate structure.

### New coordinate grammar

```
coordinate := family_coord | psychoid | context_frame | vak | weave
family_coord := FAMILY DIGIT sub_coords? inversion?
sub_coords := (SEPARATOR DIGIT)+
SEPARATOR := '-' | '.'
FAMILY := 'C' | 'P' | 'L' | 'S' | 'T' | 'M'
DIGIT := '0'..'9'
inversion := "'"

Examples:
  M0       → family=M, ql_position=0, depth=0
  M0-2     → family=M, ql_position=0, depth=1
  M0-2-4   → family=M, ql_position=0, depth=2
  M4.0     → family=M, ql_position=4, depth=1 (lemniscate notation)
  M4.0-0   → family=M, ql_position=4, depth=2
  M-0      → family=M, ql_position=none (lens coord), depth=0
  M        → family=M, ql_position=none (family root), depth=-1
```

### ParsedCoordinate struct extension

```rust
pub struct ParsedCoordinate {
    pub raw: String,
    pub coordinate: String,    // the full canonical form
    pub layer: CoordLayer,
    pub family: Option<String>,
    pub ql_position: Option<u8>,
    pub inverted: bool,
    pub sub_positions: Vec<u8>, // NEW: sub-coordinate path [2, 4] for M0-2-4
    pub depth: i8,              // NEW: -1=root, 0=base, 1+=sub-coords
    pub separator: Option<char>,// NEW: '-' or '.' (lemniscate)
}
```

### Why this matters for Rust

The Rust layer needs clean family-level delineation so that:
1. Graph queries can filter by family prefix efficiently (`WHERE n.coordinate STARTS WITH 'M'`)
2. The coordinate parser can validate incoming data
3. Retrieval can traverse the sub-coordinate tree (`M0` → `M0-0` → `M0-0-1`)
4. Future families (P, S, T, L, C branches) follow the same pattern

---

## 5. Files to Edit — Complete List

### Core schema (must change FIRST — everything depends on this)

| File | Changes |
|------|---------|
| `Body/S/S2/graph-schema/src/lib.rs` | Rename all bare properties to `{family}_{n}_{semantic}`. Add `c_0_essence`, `c_0_core_nature`, `c_1_form`, `c_1_structure`, `c_3_source_dataset`, `c_3_dataset_branch`. Update CONSTRAINTS and INDEXES to use new property names. Move old bare names to COMPAT. |

### Coordinate parser

| File | Changes |
|------|---------|
| `Body/S/S2/graph-services/src/coordinate.rs` | Extend `parse_one()` to handle sub-coordinates (`M0-2-4`, `M4.0-0`), family root (`M`), lens coords (`M-0`). Add `sub_positions`, `depth`, `separator` to `ParsedCoordinate`. |

### Dataset importer

| File | Changes |
|------|---------|
| `Body/S/S2/graph-services/src/dataset_import.rs` | 1) Add `# → M` coordinate conversion. 2) Map all properties to `{family}_{n}_{semantic}` names. 3) Add `c_1_form` and `c_1_structure` mapping. 4) Add computed `c_4_family`, `c_4_ql_position`, `c_4_layer`, `c_2_uuid`. 5) Add null-scaffold for ALL canonical properties. |

### Consumers (cascading updates from schema rename)

| File | Changes |
|------|---------|
| `Body/S/S0/epi-cli/src/graph/seed.rs` | Update all property references to prefixed names |
| `Body/S/S0/epi-cli/src/graph/schema.rs` | Update `create_schema()` constraint/index names |
| `Body/S/S0/epi-cli/src/graph/sync.rs` | Property name references |
| `Body/S/S0/epi-cli/src/graph/sync_coordinator.rs` | Property name references |
| `Body/S/S0/epi-cli/src/graph/meta.rs` | May reference bare names |
| `Body/S/S0/epi-cli/src/graph/semantic.rs` | `semantic_embedding` → `c_5_embedding` |
| `Body/S/S0/epi-cli/src/graph/doctor.rs` | Property name references |
| `Body/S/S0/epi-cli/src/graph/retrieval/` | All retrieval queries use property names |
| `Body/S/S0/epi-cli/tests/graph_commands.rs` | Update test assertions |
| `Body/S/S0/epi-cli/tests/graph_seed.rs` | Update test assertions |
| `Body/M/epi-tauri/src-tauri/src/commands/graph.rs` | Tauri commands referencing bare names |
| `Body/M/epi-tauri/src/services/graphClient.ts` | Frontend graph client |
| `Body/M/epi-tauri/src/stores/graphStore.ts` | Frontend store |

### Python (gnostic layer — separate namespace but references)

| File | Changes |
|------|---------|
| `Body/S/S5/epi-gnostic/cypher/00-bootstrap.cypher` | Update or deprecate (uses `:BimbaNode` + old names) |
| `Body/S/S5/epi-gnostic/cypher/03-pointers-resolve.cypher` | References old property names |

---

## 6. BimbaCoordinate → Bimba Migration

### Step 1: Migrate scaffold data into `:Bimba` with coordinate-driven properties

```cypher
// Merge scaffold data into :Bimba, converting properties to {family}_{n}_{semantic}
MATCH (old:BimbaCoordinate)
MERGE (new:Bimba {coordinate: old.bimbaCoordinate})
SET new.c_4_layer = COALESCE(new.c_4_layer, old.layer),
    new.c_4_topo_mode = COALESCE(new.c_4_topo_mode, old.topo_mode),
    new.c_4_weave_state = COALESCE(new.c_4_weave_state, old.weave_state),
    new.c_4_inversion_state = COALESCE(new.c_4_inversion_state, old.inversion_state),
    new.c_4_flags = COALESCE(new.c_4_flags, old.flags),
    new.c_4_family = COALESCE(new.c_4_family, old.family),
    new.c_4_ql_position = COALESCE(new.c_4_ql_position, old.ql_position),
    new.c_2_uuid = COALESCE(new.c_2_uuid, old.uuid),
    new.c_1_name = COALESCE(new.c_1_name, old.name)
```

### Step 2: Transfer relationships

```cypher
// For each relationship type on BimbaCoordinate, recreate on :Bimba
CALL {
  MATCH (s_old:BimbaCoordinate)-[r:MANIFESTS]->(t_old:BimbaCoordinate)
  MATCH (s_new:Bimba {coordinate: s_old.bimbaCoordinate})
  MATCH (t_new:Bimba {coordinate: t_old.bimbaCoordinate})
  MERGE (s_new)-[:MANIFESTS]->(t_new)
} IN TRANSACTIONS OF 100 ROWS

// Repeat for: BEDROCK, INVERTS_TO, ANCHORED_TO, POS5_INTEGRATES_INTO
```

### Step 3: Verify parity

```cypher
// Count check before removal
MATCH (old:BimbaCoordinate)
WITH count(old) AS old_count
MATCH (new:Bimba) WHERE new.c_4_layer IS NOT NULL
WITH old_count, count(new) AS new_count
RETURN old_count, new_count, old_count = new_count AS parity_ok
```

### Step 4: Remove old nodes (HUMAN REVIEW REQUIRED)

```cypher
// ONLY after human confirms parity:
// MATCH (old:BimbaCoordinate) DETACH DELETE old
```

### Key merges

The scaffold's M0-M5 will merge with the dataset's (converted) M0-M5. The scaffold contributes structural properties (`c_4_layer`, `c_4_topo_mode`, etc.) while the dataset contributes content properties (`c_0_essence`, `c_1_description`, `c_1_form`, etc.). COALESCE ensures neither overwrites the other.

The scaffold's `#0`-`#5` PSYCHOID nodes stay — they are Layer 1 archetypes. They get migrated from `:BimbaCoordinate` to `:Bimba` but keep their `#n` coordinate form and PSYCHOID layer.

Non-M scaffold nodes (`C0`-`C5`, `P0`-`P5`, `S0`-`S5`, `T0`-`T5`, `L0`-`L5`, CF_*, VAK, Weave) also migrate to `:Bimba` — they already have correct family coordinates.

---

## 7. Cypher Safety Protocols

1. **MERGE only** — never CREATE for nodes (idempotent re-runs)
2. **MATCH both endpoints** before creating relationships
3. **String escaping** — all values through `escape_cypher()` (handles `'` and `\`)
4. **Truncation** — text fields capped at 2000 chars
5. **One node per transaction** (current pattern, acceptable for ~1,880 nodes)
6. **No DETACH DELETE without human review**
7. **IF NOT EXISTS** on all DDL (constraints, indexes)
8. **COALESCE** when merging with existing data (scaffold enrichment, never overwrite)
9. **Property null-scaffolding** — every canonical property SET even if null
10. **Transaction batching** for relationship migration (`IN TRANSACTIONS OF 100 ROWS`)

---

## 8. Execution Order

```
Phase A — Schema & Parser (prerequisite for everything)
  A1. Update graph-schema crate: all properties → {family}_{n}_{semantic}
  A2. Extend coordinate parser for sub-coordinates and family roots
  A3. Update dataset_import.rs: # → M conversion, new property names, null scaffolding
  A4. Update all consumer files (seed, sync, retrieval, tests, tauri)
  A5. Build and run tests: cargo test -p epi-s2-graph-schema -p epi-s2-graph-services
  A6. Build CLI: cargo build -p epi-logos (or epi-cli manifest)

Phase B — BimbaCoordinate Migration
  B1. Run scaffold migration cypher (Step 1: property rename + merge into :Bimba)
  B2. Run relationship transfer cypher (Step 2)
  B3. Verify parity (Step 3)
  B4. Human review → remove old nodes (Step 4)

Phase C — Dataset Import
  C1. epi graph reconcile (apply updated schema/indexes with new property names)
  C2. epi graph import low-detail (ingests ~1,880 M-branch nodes with # → M conversion)
  C3. Verify: node counts per family, property completeness, relation counts

Phase D — Index Refresh
  D1. Drop old bare-name indexes that no longer match properties
  D2. Verify new coordinate-driven indexes are active
  D3. Confirm vector index on c_5_embedding (currently empty, ready for future embedding)
```

### Why B before C

The scaffold migration must happen first so that when `M0` is MERGEd by the dataset import, it enriches the already-migrated scaffold M0 node (which now has `c_4_layer`, `c_4_topo_mode`, etc.) rather than creating a new bare node.

---

## 9. Verification Queries

```cypher
-- Node counts by family
MATCH (n:Bimba)
RETURN n.c_4_family AS family, count(n) AS count
ORDER BY count DESC

-- Property completeness (all nodes should have c_1_name even if null)
MATCH (n:Bimba) WHERE NOT EXISTS(n.c_1_name) AND NOT EXISTS {(n) WHERE n.c_1_name IS NULL}
RETURN count(n) AS missing_scaffold

-- M-branch depth distribution
MATCH (n:Bimba) WHERE n.coordinate STARTS WITH 'M'
RETURN size(split(n.coordinate, '-')) - 1 AS depth, count(n) AS count
ORDER BY depth

-- Relation counts by type
MATCH (:Bimba)-[r]->(:Bimba)
RETURN type(r) AS rel_type, count(r) AS count
ORDER BY count DESC LIMIT 20

-- Confirm no bare property names remain
MATCH (n:Bimba) WHERE n.name IS NOT NULL OR n.family IS NOT NULL OR n.description IS NOT NULL
RETURN count(n) AS nodes_with_bare_props
-- Should be 0 after full migration
```

---

## 10. Scope Boundary

**In scope (this plan):**
- Property schema conversion to `{family}_{n}_{semantic}` everywhere
- `# → M` coordinate conversion in dataset import
- BimbaCoordinate scaffold migration into `:Bimba`
- Coordinate parser extension for sub-coordinates
- Low-detail dataset import
- All Rust consumer updates

**Out of scope (future work):**
- Deep dataset import (full-detail M-branch data)
- Semantic embeddings (c_5_embedding generation)
- 18-fold pointer resolution
- Ingestion of non-M families (P, S, T, L, C branch datasets)
- Python gnostic layer alignment (separate namespace)
