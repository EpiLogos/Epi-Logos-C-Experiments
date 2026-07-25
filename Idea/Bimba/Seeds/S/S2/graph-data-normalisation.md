---
coordinate: "S2"
c_0_source_coordinates: ["S2", "S2'"]
c_1_name: "Bimba Graph Data Normalisation — Property-Key Hygiene"
c_3_updated_at: "2026-07-25"
c_4_artifact_role: "definition"
t_0_thought_type: "audit"
---

# Bimba Graph Data Normalisation — Property-Key Hygiene

**Sibling of:** [[relation-family-derivation]] (same corpus, same session lineage)
**Substrate:** the live Neo4j Bimba graph — 2,098 `:Bimba` nodes, 11,295 `:Bimba→:Bimba` edges
**Executed:** 2026-07-25 · **Direction:** Architect (two normalisations: collision keys to majority; retire migration-artefact aliases in favour of the better names)
**Decisions ratified in this pass:** [[DR-S2-ALIAS-1]], [[DR-S2-LAYER-1]], [[DR-S2-TIME-1]]

> **Headline finding.** Of the three keys reported as "type collisions", only **one** was a collision. `c_4_subsystem` was a genuine lossless cast. `c_4_layer` is **two different properties sharing one key name** — normalising it "to majority" would have written `"0"` into a controlled vocabulary of `COORDINATE`/`PSYCHOID`/`VAK`. `c_3_updated_at`'s majority type is the **legacy** type; its only live writer emits the minority type, so normalising to majority would have normalised away from the producer and the next vault sync would have re-split the column. And of the alias pairs, two of the candidates were **not aliases at all** — dropping them would have destroyed 378 + 16 real, differing values.

---

## 0. Ground truth

All figures from read-only Cypher, 2026-07-25, re-measured in this session rather than inherited.

| Key | Types found | Verdict |
|---|---|---|
| `c_4_layer` | STRING 1956 · INTEGER 84 | **not a collision** — two semantics, one name (§2) |
| `c_4_subsystem` | INTEGER 1827 · STRING 38 · LIST<STRING> 1 | genuine collision, lossless cast (§1) |
| `c_3_updated_at` | STRING 1108 · ZONED DATETIME 6 | collision, but majority is the *legacy* side (§3) |

Node count 2,098 and edge count 11,295 were identical before and after every write below.

---

## 1. `c_4_subsystem` → INTEGER (landed)

The M-subsystem index. All three types carried the **same** semantic:

- INTEGER `0`–`5` — 1,827 nodes (majority, canonical)
- STRING `"4"` — 38 nodes, all `M4.x` (`NaraIdentityElement`, `NaraMedicalElement`, `NaraDivinatoryElement`)
- LIST<STRING> `["4","4"]` — 1 node, `M4.4.3` — a double-write of one value, both elements identical

Cast to INTEGER: **39 nodes**, fully lossless. Guarded so only numeric strings and single-valued uniform lists convert.

**Result:** `c_4_subsystem` is now single-typed — `INTEGER × 1866`.

**No producer conflict:** `c_4_subsystem` has **zero** references anywhere in the repo — no reader, no writer, no vault frontmatter. It is pure imported data.

---

## 2. `c_4_layer` — left mixed by decision ([[DR-S2-LAYER-1]])

This is the finding that made "to majority" the wrong instruction.

**STRING (1956) is a controlled node-kind vocabulary,** and it is exactly the vocabulary `seed.rs` writes:
`COORDINATE` (1917) · `CONTEXT_FRAME` (7) · `PSYCHOID` (7) · `FAMILY_META` (6) · `LENS` (6) · `VAK` (6) · `WEAVE` (4) · `FAMILY_ROOT` (1) · `S-root` (1) · `S-prime-root` (1).

**INTEGER (84) is the S-stack layer index** `0`–`5`, exactly 14 nodes per layer (`S{n}`, `S{n}'`, and `S{n}-{0..5}` ± prime), every one labelled `:Bimba:Coordinate:Stack`, every one stamped `sync_version: m5-s-lattice-migration-…`. They came from the S/S′ lattice CSV import, which used its own conventions — the same import that left the bespoke unprefixed vocabulary (`coordinate_axis`, `coordinate_kind`, `coordinate_namespace`, `coordinate_parent`, `coordinate_prefix`, `vault_path`, `artifact_kind`, `content_hash`, `promotion_source`, `sync_status`, `sync_version`) on those nodes.

Casting `0` → `"0"` would inject non-vocabulary values into a closed column. The seeder itself never does this: `merge_node(layer: &str)` (`seed.rs:200-245`) only ever writes a vocabulary string.

**Decision: leave the 84; make readers tolerate both types.** The integer is a second semantic, not a bad cast.

### 2.1 The reader defect this exposed (fixed)

`graph_api.rs::bimba_node_row` read `row.get::<String>("layer").unwrap_or_default()`. For the 84 integer nodes `get::<String>` returns `Err`, and `unwrap_or_default()` silently turned that into `""`. **Every S-stack coordinate served `layer: ""` through `s2.graph.node`.** This is the same silent-empty-string failure mode that commit `a8cb2862` fixed for the RETURN projection — a second instance of it, on the typed projector.

Fixed by `string_or_int_field`, which renders the integer as its decimal string, so the JSON wire type stays `string` and no consumer shape changes. Proven by `tests/mixed_type_layer_projection_live.rs` against the real corpus: `S3` → `"3"` (was `""`), `M3` → `"COORDINATE"`. The test was confirmed to fail before the fix (`left: ""`, `right: "3"`), so it is not vacuous.

### 2.2 Consequences recorded, not silently patched

- **`seed.rs` baseline undercount.** `seed_node_group_counts` counts `n.c_4_layer = 'COORDINATE'`. The 12 S-family roots (`S0`…`S5'`) are seeded with `'COORDINATE'` but were later overwritten to INTEGER by the lattice migration, so they no longer answer that counter. The snapshot is a diagnostic, not an assertion, so nothing breaks — but `family_coordinates` reads 12 low. Teaching the seeder that "INTEGER layer also means COORDINATE" would encode this drift as semantics, which is a canon question, so it is left as a recorded fact.
- **`constraints.rs:9`** (`CREATE INDEX coord_layer … ON (n.c_4_layer)`) is a plain range index; Neo4j indexes mixed types without complaint. No action.

---

## 3. `c_3_updated_at` → ZONED DATETIME ([[DR-S2-TIME-1]], landed)

Majority was STRING (1,108) against ZONED DATETIME (6) — but **the only live writer emits the minority type**:

```rust
// Body/S/S2/graph-services/src/sync/coordinator.rs:350
SET n.s_1_vault_path = '{}', n.c_3_updated_at = datetime()
```

The 1,108 strings are the legacy dataset-import corpus (`property_mapping.rs:330` maps `lastUpdated`/`updatedAt`/`updated_at` → `c_3_updated_at` from JSON text). Normalising to the STRING majority would have obeyed the letter of the instruction and re-split the column on the very next vault sync. **Direction reversed deliberately.**

Cast STRING → ZONED DATETIME: **1,108 nodes**, lossless.

- All 1,108 matched strict `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$` — nothing ambiguous, every value explicitly UTC.
- Pre-flight fidelity gate: 1108/1108 seconds preserved **and** 1108/1108 nanoseconds preserved; the script refuses to write otherwise.
- Post-verify read back out of the graph against the snapshot: 1108/1108 equal to `datetime(original)`.
- The only change is that redundant zero-padding stops being stored: `.979000000Z` → `.979Z`, same `epochMillis`, same `nanosecond`. The strings carried **fake** nanosecond precision — three of them were second-precision and one millisecond-precision, all padded to nine digits.

**Result:** `c_3_updated_at` is now single-typed — `ZONED DATETIME × 1114` — and matches its producer, so it stays that way.

---

## 4. Migration-artefact aliases retired ([[DR-S2-ALIAS-1]], landed)

### 4.1 The candidate set was derived, not guessed

Grouping every `{family}_{n}_` key by its semantic suffix found **69 suffixes served by two or more keys**. Measuring value identity across all of them produced **40 pairs at exactly 100% identity** — not the five previously reported. The canonical side of each pair is decided by the target keys declared in `dataset_import/property_mapping.rs` (115 canonical keys), which is the authority for "the better name".

### 4.2 Two candidates were NOT aliases — excluded

| Pair | Co-present | Identical | Conflicting | Verdict |
|---|---|---|---|---|
| `c_3_updated_at` ← `t_3_updated_at` | 397 | 19 (4.8%) | **378** | genuinely different timestamps — **kept** |
| `c_1_description` ← `s_4_description` | 22 | 0 | **16** (+6 canon-absent) | distinct S-layer function description — **kept** |

`ROLE_RULES` in `property-roles.ts` lists `t_3_updated_at` as an `updated_at` fallback. It is not one. The mis-declaration is **latent, not live**: zero nodes carry `t_3_updated_at` without `c_3_updated_at`, so the fallback never fires today. Worth correcting before that changes.

### 4.3 What was retired — 40 keys, 2,955 property instances

Largest first. Every row measured 100% identical, 0 conflicting, 0 canonical-absent.

| Canonical (kept) | Alias (removed) | Instances |
|---|---|---|
| `c_3_updated_at` | `t_3_last_updated` | 1101 |
| `c_3_context_frame` | `c_1_context_frame` | 599 |
| `c_1_key_principles` | `c_2_key_principles` | 257 |
| `c_3_practical_applications` | `c_2_practical_applications` | 241 |
| `p_3_sequence` | `t_3_sequence` | 188 |
| `c_3_related_coordinates` | `c_2_related_coordinates` | 105 |
| `t_3_developmental_stage` | `t_2_developmental_stage` | 99 |
| `c_1_key_principles` | `c_4_key_principles` | 50 |
| `c_3_practical_applications` | `c_4_practical_applications` | 50 |
| `c_3_related_coordinates` | `c_4_related_coordinates` | 49 |
| `c_1_key_principles` | `c_3_key_principles` | 29 |
| `l_2_chakra_correspondence` | `l_3_chakra_correspondence` | 22 |
| `c_1_key_principles` | `c_0_key_principles` | 19 |
| `c_3_related_coordinates` | `c_1_related_coordinates` | 13 |
| `c_3_practical_applications` | `c_1_practical_applications` | 13 |
| `l_4_modality` | `c_0_modality` | 12 |
| `l_3_seasonal_position` | `t_0_seasonal_position` | 12 |
| `c_3_practical_applications` | `c_0_practical_applications` | 11 |
| `c_3_related_coordinates` | `c_0_related_coordinates` | 8 |
| `l_4_mef_condition` | `c_4_mef_condition` | 7 |
| `l_4_reflection_table` | `c_4_reflection_table` | 6 |
| `l_4_interpretive_role` | `c_4_interpretive_role` | 6 |
| `p_1_position_id` | `p_5_position_id` | 6 |
| `p_1_stage_id` | `t_5_stage_id` | 6 |
| `m_4_kashmir_shaivism_alignment` | `p_4_kashmir_shaivism_alignment` | 5 |
| `m_4_practical_manifestations` | `c_4_practical_manifestations` | 4 |
| `c_1_key_principles` | `c_5_key_principles` | 3 |
| `c_3_practical_applications` | `c_5_practical_applications` | 3 |
| `t_1_epistemic_function` | `c_1_epistemic_function` | 3 |
| `t_1_epistemic_function` | `c_2_epistemic_function` | 3 |
| `s_4_safety_class` | `c_4_safety_class` | 3 |
| `m_4_preferred_timing` | `c_4_preferred_timing` | 3 |
| `s_4_eligible_formats` | `c_1_eligible_formats` | 3 |
| `m_4_capability_signals` | `c_4_capability_signals` | 3 |
| `s_5_system_prompt` | `s_4_system_prompt` | 3 |
| `c_3_related_coordinates` | `c_5_related_coordinates` | 2 |
| `m_4_temporal_intelligence_layer` | `t_4_temporal_intelligence_layer` | 2 |
| `m_4_two_stroke_doctrine` | `c_4_two_stroke_doctrine` | 2 |
| `m_4_temporal_structure` | `t_4_temporal_structure` | 2 |
| `s_5_capabilities` | `s_4_capabilities` | 2 |

**Nothing consumed them.** All 40 keys were checked against the whole repo: zero code readers, zero vault-frontmatter producers. `t_3_last_updated` appears only as a read *fallback* in `property-roles.ts` (+ its test), which is harmless once the data is gone.

**Safety property of the write.** Each removal re-asserts identity inside its own `WHERE` clause:

```cypher
MATCH (n:Bimba)
WHERE n.<alias> IS NOT NULL AND n.<canon> IS NOT NULL AND n.<canon> = n.<alias>
REMOVE n.<alias>
```

So the statement **cannot** drop a property that is not a proven duplicate of its retained twin, even if the pre-measurement had gone stale between measuring and writing.

**Verified after the write:** all 40 alias keys at 0 remaining; every canonical twin's count unchanged (`c_3_context_frame` 599, `c_1_key_principles` 377, `c_3_practical_applications` 416, `c_3_related_coordinates` 198, `p_3_sequence` 188, `t_3_developmental_stage` 99, `c_3_updated_at` 1114, `l_2_chakra_correspondence` 121); both excluded keys untouched (397, 22); node and edge counts unchanged.

---

## 5. Reversal

Snapshots are committed beside this document in `normalisation-snapshots/`.

- **Aliases** — `alias-retirement-2026-07-25.json` holds the coordinate list per alias key. Values need no snapshot because each was proven identical to the retained canonical twin, so restoring one key is:
  `UNWIND $coords AS c MATCH (n:Bimba {coordinate: c}) SET n.<alias> = n.<canon>`
- **Timestamps** — `updated-at-2026-07-25.json` holds the exact original string per coordinate (values *are* needed here, because the three precision variants are not recoverable from the datetime).
- **`c_4_subsystem`** — the 39 original raw values are in the alias snapshot file under `subsystemOriginals`.

---

## 6. Open for the Architect

1. **m-family key drift — importer vs graph.** `property_mapping.rs` declares 3-part m-keys (`m_3_quadrant`, `m_2_abjad_value`, `m_0_consciousness_operation`) but the graph carries 4-part forms (`m_3_5_quadrant` 384, `m_2_4_abjad_value` 99, `m_0_3_consciousness_operation` 26) and **only** those. Because just one form exists per semantic these are not alias pairs and nothing was touched — but the importer and the corpus disagree about the key name for ~20 keys. Either the mapping table is stale or the corpus predates it.
2. **`t_3_updated_at`'s 378 differing values.** Now the only remaining `updated_at`-ish duplication. It is a *different* timestamp, not an alias — what does it mean, and should it be renamed to something that says so?
3. **`ROLE_RULES` mis-declaration** (§4.2) — remove `t_3_updated_at` from the `updated_at` fallback chain before a node appears that lacks `c_3_updated_at`.
4. **The S-lattice bespoke vocabulary** (§2) — 11 unprefixed keys on the 84 nodes (`coordinate_axis`, `coordinate_kind`, `sync_version`, …) duplicate information the canonical `c_*`/`s_*` keys carry. Retiring them is a larger pass than this one and needs the same measure-first treatment; `coordinate` itself is of course the one exempt canonical key.

---

## Provenance

Measured and executed 2026-07-25 against `bolt://127.0.0.1:7687`. Scripts were dry-run first and reproduced the measurements exactly before any write. Verification of the alias pass was performed through a **different client** (the `bimba-mcp` Cypher path) than the one that wrote it.
