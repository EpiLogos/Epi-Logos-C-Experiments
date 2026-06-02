---
coordinate: "M4'-0"
c_0_source_coordinates: ["/docs/prompts/m4-nara-full-impl-handoff.md"]
c_4_artifact_role: "prompt"
c_3_created_at: "2026-03-11"
c_5_reflection_complete: true
---

# M4 Nara — Full Implementation Handoff

**Session type:** Full implementation from scratch to live tested system
**Date written:** 2026-03-11
**Completed:** 2026-03-12
**Working directory:** `/Users/admin/Documents/Epi-Logos\ C\ Experiments/`
**Build commands:** `make test` (C), `make rust-test` (Rust), `cargo build --bin epi` (CLI binary)

> **Implementation status:** ✅ Fully Complete (2026-03-12). All 13 phases done including Phase 9 and Phase 11.
> - Phase 9 (Neo4j body zone seeding): `epi graph seed-nara` added — seeds 7 ChakralCenter nodes with `body_zones` arrays + 36 Decan nodes with `bodyPart`/`herbalism_herbs`
> - Phase 11 (SpacetimeDB WASM): rustc upgraded to 1.94.0; real spacetimedb 2.x WASM module compiles for `wasm32-unknown-unknown`; `spacetime build && spacetime publish epi-logos-presence` ready to deploy

---

## INVOCATION

Implement the full M4 Nara system for Epi-Logos — all CLI commands, all gateway RPC methods, all C struct expansions, all TUI portal plugins, and the SpacetimeDB module — working from the canonical planning documents. Every phase. No stubs. Live-tested at each phase before moving to the next.

---

## READ THESE DOCUMENTS FIRST (in order)

Do not write a single line of code before you have read all of these:

```
CANONICAL PLANS:
1.  Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-11-m-branch-nara-integration-clarity.md   ← MASTER plan, all 14 parts
2.  Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md              ← backend v2.1, all phases + structs
3.  Idea/Bimba/Seeds/M/Legacy/specs/M/2026-03-11-hypertile-portal-design.md           ← TUI portal spec, 17 plugins

IMPLEMENTATION PROMPTS (treat as concrete spec, not suggestions):
4.  docs/prompts/nara-runtime-impl.md                             ← architectural invariants, file structure
5.  docs/prompts/nara-subtle-body-impl.md                         ← subtle body frontend spec

C HEADERS (the authoritative types — Rust must mirror these exactly):
6.  epi-lib/include/m4.h    ← M4_Identity_Matrix, Oracle, Medicine, Transform
7.  epi-lib/include/m1.h    ← M1_Root, Spanda_Engine, QL_Tick, DR_Matrix_12x12
8.  epi-lib/include/m2.h    ← M2_Vibrational_72_Space, Planet_Operator, Element_Id
9.  epi-lib/include/m3.h    ← M3 Tarot/codon map, NUCLEOTIDE_ICHING_VALUE, quaternionic

EXISTING CLI PATTERNS (mirror exactly, no inventing new patterns):
10. epi-cli/src/main.rs             ← Commands enum and dispatch root
11. epi-cli/src/gate/mod.rs         ← GateCmd pattern (this is what NaraCmd must look like)
12. epi-cli/src/vault/mod.rs        ← subcommand pattern
13. epi-cli/src/ffi/mod.rs          ← existing FFI bindings, HolographicCoordinate
14. epi-cli/src/graph/client.rs     ← async gateway client pattern

ALREADY IMPLEMENTED (do NOT duplicate, just integrate):
15. epi-cli/src/nara/oracle.rs      ← PIP_DECAN_MAP, COURT_SIGN_MAP, ACE_ELEMENT_MAP ALREADY HERE
16. epi-cli/src/nara/mod.rs         ← check what NaraCmd already has
17. epi-cli/src/nara/kairos.rs      ← Kerykeion subprocess wrapper (check state)
18. epi-cli/src/nara/clock.rs       ← M1 torus FFI (check state)

DATASETS (needed for medicine/graph seeding — read schema before writing Cypher):
19. Idea/Bimba/Map/datasets/nara-deep/nodes-full-detail.json      ← 99 M4 nodes
20. Idea/Bimba/Map/datasets/nara-deep/relations.json              ← 169 relation types
21. Idea/Bimba/Map/datasets/parashakti-deep/parashakti-planets.json  ← planet nodes
22. Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-11-m-branch-nara-integration-clarity.md  ← Part XIV has the Parashakti
                                                                    schema + correct Cypher
```

---

## CURRENT STATE (as of this handoff)

**Already done:**
- `epi-lib/`: M0–M5 all implemented in C, 401+ M4 tests passing, BLAKE3 vendored
- `epi-cli/src/nara/oracle.rs`: has `PIP_DECAN_MAP[9][4]`, `COURT_SIGN_MAP[16]`, `ACE_ELEMENT_MAP[4]` with `pip_decan_lookup()` helper AND `HEXAGRAM_BODY_DYNAMICS[64]` with `HexagramBodyEntry` per hexagram (primary/secondary chakra, body_zones array, dynamics summary) derived from M3 Mahamaya dataset
- `epi-cli/src/nara/medicine.rs`: **FULLY IMPLEMENTED WITH REAL DATASET DATA** — contains:
  - `CHAKRA_BODY_ZONES[8]`: real body zone arrays per chakra from parashakti-deep dataset
  - `DECAN_BODY_PARTS[36]`: actual `bodyPart` strings for all 36 decans from dataset
  - `DECAN_HERBS[36]`: herbalism_herbs per decan
  - `PLANET_CHAKRA[8]`: planet→chakra from PLANETARY_RESONANCE relations
  - `ELEMENT_CHAKRA[5]`, `SIGN_ELEMENT[12]`: element/sign derivation tables
  - `body_zones_for_chakra()`, `body_zones_for_planet()`, `body_zones_for_decan()`, `body_zones_for_elem_sig()`, `herb_for_decan()`, `chakra_for_element()` — full accessor suite
  - `balance()`, `chakra()`, `materia()`, `prescribe()`, `safety()` — all wired to real LUTs
- `epi-cli/src/gate/spacetimedb_bridge.rs`: bridge pattern exists
- Part XIV of master plan has the discovered Parashakti Neo4j schema and correct Cypher for body zone augmentation (Option A Cypher ready to run)

**Needs implementing (everything below):**
- Phase 0: C struct expansion in m4.h + m4.c (prerequisite, do first)
- Phase 1–6: Full CLI + gateway + FFI backend
- Phase 7+: ratatui-hypertile portal (17 plugins, 2 tabs)
- SpacetimeDB WASM module (`epi-spacetime-module/` separate crate)
- Parashakti body zone Neo4j population (use Part XIV Cypher, Option A)
- NaraWeights config system (Part XIII of master plan)

---

## ARCHITECTURAL INVARIANTS — ENFORCED, NO EXCEPTIONS

### 1. Existing module pattern — mirror exactly

Every module: `epi-cli/src/<name>/mod.rs` exports a `<Name>Cmd` enum dispatched from `main.rs`.
Pattern = `epi-cli/src/gate/mod.rs`. NaraCmd must look identical in structure. Read it first.

### 2. C FFI — repr(C) field-for-field mirrors, static_assertions on every struct

Every C struct in `epi-cli/src/ffi/nara.rs` MUST exactly mirror `epi-lib/include/m4.h` — same field order, same padding. Add `static_assertions::assert_eq_size!()` for each struct where C size is known (comments in the header state the byte sizes).

### 3. PCO Privacy Law — zeroize immediately

Any Rust struct holding natal data (birth date, lat/lon, nucleotide weights before hashing) MUST implement `zeroize::Zeroize`. Call `.zeroize()` immediately after the FFI compute call returns. The quintessence hash is the ONLY artifact that persists. Raw personal data never touches the network.

### 4. #4.1-4 Temporal authority — hard error, no bypass

Oracle cast, medicine prescription, alchemical transformation: ALL must read kairos state before proceeding. If `kairos/current.json` is absent or older than 24h:
```
Err("temporal authority unavailable: run 'epi nara kairos sync' first")
```
Hard error. No `--force`. No degraded mode. No silent default. Planetary hour is non-negotiable.

### 5. Oracle consent gate — hard, no bypass

`epi nara oracle cast` without `--yes` / `-y` MUST prompt:
```
"Cast oracle? This is a sacred portal. [y/N]: "
```
`nara.oracle.cast` gateway method requires `"consent": true` in payload. Missing → error.

### 6. Encryption — ChaCha20-Poly1305 + Argon2id, nothing else

Identity layer files: `chacha20poly1305` crate. Key via `argon2` crate. Key NEVER stored on disk. Derived on demand from passphrase (`rpassword`). Nonce = first 12 bytes of `.enc` file.

### 7. Gateway methods NEVER return raw personal data

`nara.identity.get` returns: `{ layer_presence, quintessence_hash, nucleotide_balance, dominant_element, hash_preview, layer_count }`. Never: birth date, birth location, natal chart raw degrees, MBTI string.

### 8. C is authoritative — Rust is a thin FFI wrapper

M1_Root, M2_Root, M4_Identity_Matrix live in C. The clock ticks in C. The hash is computed in C. Rust wraps and exposes. Never reimplement C logic in Rust.

### 9. Thoth deck, Golden Dawn — no RWS

All Tarot is Thoth deck. Court cards are Princess/Prince/Queen/Knight (confirmed in m3.h: `M3_TAROT_PIP_PRINCESS=10`, `M3_TAROT_PIP_PRINCE=11`). Decan assignments from Golden Dawn (already in oracle.rs as `PIP_DECAN_MAP`).

### 10. Body zones via element→chakra chain — not direct lookup

Planet → `elem_sig` → `(elem_sig >> 2) & 0b111` → `chakra_id` → `CHAKRA_BODY_ZONES[chakra_id]`. The derivation is in master plan Part III.3 and Part XIV. One LUT, mathematically grounded.

---

## IMPLEMENTATION SEQUENCE

Work through these phases in order. Run tests before advancing to the next phase.

### Phase 0 — ✅ C struct expansion in epi-lib (do first, everything depends on this)

Implement exactly as specified in `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` Section II:

1. Add `M4_Numerological_Layer` (8 bytes) to `epi-lib/include/m4.h`
2. Add `M4_Astrological_Layer` (28 bytes)
3. Add `M4_Jungian_Layer` (12 bytes)
4. Add `M4_GeneKeys_Layer` (40 bytes)
5. Add `M4_HumanDesign_Layer` (20 bytes)
6. Expand `M4_Identity_Matrix` with 6-layer slots + `layer_presence` bitmask + `quintessence_hash` (uint64_t) + `computed` bool. Keep `M4_Symbol_DNA_Profile` for legacy compatibility.
7. Declare `m4_identity_hash_compute()`, `m4_identity_augment()` in the header
8. Implement them in `epi-lib/src/m4.c`:
   - `m4_identity_hash_compute()`: BLAKE3 input = `layer_presence (1 byte) || each PRESENT layer's raw bytes in order`. Absent layers contribute 0 bytes.
   - `m4_identity_augment()`: copy layer, set presence bit, call hash_compute
9. Add `M4_Medicine_Triage` (16 bytes), `M4_Transform_State` (16 bytes), `M4_Oracle_Draw` (40 bytes)

**Verify:** `make test` passes all existing M4 tests before proceeding. New structs must have `_Static_assert` size checks.

### Phase 1 — ✅ `epi nara` CLI scaffold

Implement exactly as in `docs/prompts/nara-runtime-impl.md` Phase 1 section:

- `epi-cli/src/nara/mod.rs`: full `NaraCmd` enum covering ALL subcommands:
  ```
  wind, clock, kairos (sync|show|status|fetch), identity (show|set|augment),
  oracle (cast|history|tags), medicine (triage|prescribe),
  transform (begin|commit|recipe), lens (apply|synthesize),
  pratibimba (search|map|atlas), logos (begin|advance|complete),
  weights (show|set|reset|calibrate)
  ```
- Add `Nara` variant to `Commands` enum in `main.rs` and dispatch
- Wire up `identity show` end-to-end: reads `~/.epi-logos/identity/profile.json`, displays layer presence summary

**Verify:** `epi nara identity show` runs without panic, prints "No identity profile found — run 'epi nara identity set'" if profile absent.

### Phase 2 — ✅ C FFI for M4 structs

- Create `epi-cli/src/ffi/nara.rs` — mirror all M4 C structs with `#[repr(C)]`
- Create `epi-cli/src/ffi/m1.rs` — mirror M1_Root, QL_Tick, Spanda_Stage, DR_Matrix_12x12, TOPOLOGICAL_ELEMENT_COUNT_LUT
- Create `epi-cli/src/ffi/m2.rs` — mirror Planet_Id, Element_Id, Chakra_Id, Elemental_Signature, Planet_Operator, M2_Vibrational_72_Space
- Add `static_assertions::assert_eq_size!()` for every struct that has a byte-size comment in the C header
- Wire `extern "C"` declarations for: `m4_identity_compute`, `m4_identity_hash_compute`, `m4_identity_augment`, `m1_get_root`, `m2_get_planet_lut`, `m0_read_cosmic_clock`, `m0_compute_logos_state`

**Verify:** `cargo build --bin epi` compiles cleanly. Run `cargo test` in epi-cli/

### Phase 3 — ✅ Identity full implementation (#4.0)

- `epi-cli/src/nara/identity.rs`:
  - `NaraIdentityMatrix` Rust struct with serde, zeroize
  - `load_profile() / save_profile()` — reads/writes `~/.epi-logos/identity/profile.json`
  - `load_layer_encrypted(layer_idx, passphrase)` / `save_layer_encrypted()` — ChaCha20-Poly1305 + Argon2id
  - `compute_from_input()` — calls `m4_identity_compute()` via FFI, zeroes input immediately
  - `augment(layer_idx, data)` — calls `m4_identity_augment()` via FFI
  - `display_summary()` — shows layer presence, quintessence hash preview, nucleotide balance, dominant element
- CLI commands wired: `identity show`, `identity set birth-date|birth-location|natal-chart-path|jungian|gene-keys|human-design`, `identity augment`
- PASU.md integration: `epi vault pasu show/get/set` reads/writes to `Idea/Pratibimba/Self/PASU.md`; `identity set` sources from PASU when available

**Verify:** `epi nara identity set birth-date 1990-06-15` stores encrypted layer, `epi nara identity show` displays summary with quintessence hash.

### Phase 4 — ✅ Clock + Kairos (#4.1-4 temporal authority)

- `epi-cli/src/nara/clock.rs`:
  - `NaraClock` — wraps `M1_Root` via FFI
  - `torus_position()`, `spanda_stage()`, `ql_tick()`, `spread_size()` (from TOPOLOGICAL_ELEMENT_COUNT_LUT)
  - `display_clock()` — torus wheel visualization in terminal, current stage, spread size
- `epi-cli/src/nara/kairos.rs`:
  - `KairosState` — wraps M4_Temporal_Now with planet_degrees[10]
  - `sync()` — spawns Python `kerykeion` subprocess, parses JSON output, writes `~/.epi-logos/kairos/current.json`
  - `load_current()` — reads cache, checks freshness (<24h), errors if stale
  - Feature-flagged: `KAIROS_ENABLED` env var; graceful stub when kerykeion not installed
  - CLI: `kairos sync`, `kairos show`, `kairos status`, `kairos fetch`

**Verify:** `epi nara clock show` displays torus state. `epi nara kairos sync` calls kerykeion (or returns feature-disabled message). `epi nara oracle cast` without sync returns temporal authority error.

### Phase 5 — ✅ Oracle full implementation (#4.2)

- `epi-cli/src/nara/oracle.rs` (already has decan maps — extend with full implementation):
  - `OracleHygiene` — reading frequency checks, last-cast timestamp, hygiene messages
  - `cast_iching()` — reads 6 nucleotide values from identity's nucleotide_balance, uses `NUCLEOTIDE_ICHING_VALUE` (A=6,T=9,C=7,G=8), builds hexagram via 3-coin method (lower trigram = first 3 lines = codon_a, upper = last 3 = codon_b)
  - `cast_tarot()` — consent gate first; reads torus position → TOPOLOGICAL_ELEMENT_COUNT_LUT → spread size; calls m3 codon evaluation; resonance score via quaternionic charge comparison with user identity; canonical tag emission
  - `oracle_to_medicine_tags()` — EMITS_CANONICAL_TAGS_TO pipeline to #4.1
  - `oracle_to_transform_tags()` — pipeline to #4.3
  - Vimarsa operator mapping: pp→OP_EQUATE, mm→OP_DISTINGUISH, mp→OP_ILLUMINATE, pm→OP_PROVOKE, non-dual→OP_ENCLOSE (from master plan Part XII.4)
  - CLI: `oracle cast [--yes/-y] [--iching|--tarot]`, `oracle history`, `oracle tags show`

**Verify:** `epi nara oracle cast --yes --iching` produces a hexagram reading with quaternionic analysis. `epi nara oracle cast` without `--yes` prompts consent.

### Phase 6 — ✅ Medicine (#4.1), Transform (#4.3), Lens (#4.4), Logos (#4.5)

Implement all four modules. Each is fully specified in `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` Section X-B and the master clarity plan:

- `medicine.rs`:
  - `M4MedicineTriage` — wraps `M4_Medicine_Triage` C struct
  - Element balance from identity nucleotide_balance
  - Chakra body zone lookup via `CHAKRA_BODY_ZONES[8]` (master plan Part XIV)
  - Kerykeion live planet degrees → transit body zone layer (0.4 weight)
  - Oracle canonical tags → medicine influence (0.3 weight)
  - Decan ruling planet signal (0.2 weight, from PIP_DECAN_MAP)
  - `prescribe()` → ranked list of body zones + suggested practices
  - CLI: `medicine triage`, `medicine prescribe`

- `transform.rs`:
  - `M4TransformState` — wraps `M4_Transform_State` C struct
  - Spanda stage → container selection (SEED/POLE_A→Bohmian, POLE_B/TRIKA→Talking Circle, FLOWERING/META→Diamond)
  - 7 alchemical operations: Calcinatio, Solutio, Coagulatio, Sublimatio, Mortificatio, Separatio, Coniunctio
  - Two-stroke cycle: outer stroke (writing/engagement) + inner stroke (reflection/integration), track completion
  - CLI: `transform begin <container>`, `transform commit`, `transform recipe`

- `lens.rs`:
  - 6 wisdom lenses: Gebser Consciousness Structures (#4.4.0), Ontological (#4.4.1), Epistemological (#4.4.2), Jungian Depth (#4.4.3), Phenomenological (#4.4.4), Trika/Kashmir Shaivism (#4.4.5)
  - `apply(lens, content)` — reframes content through the selected lens
  - `synthesize()` — meta-synthesis across active lenses
  - PHENOM_TATTVA_MAP: 14 phenomenological layers → M2 tattva correspondences
  - CLI: `lens apply <lens> [--content <text>]`, `lens synthesize`

- `logos.rs`:
  - Logos Cycle 0→5: A-Logos, Logos-A, A-Logos-A, Logos, An-a-Logos, Logos-An
  - Stage maps to M0 Divine Acts: Srishti=0, Sthiti=1, Samhara=2, Tirodhana=3, Anugraha=4, Samavesa=5
  - Stage → oracle interpretation mode (master plan Part XII.3)
  - Daily activity feed as input; reads completed NOW files from vault
  - `advance()` — moves to next stage, runs synthesis for current stage
  - `complete()` — runs full cycle 0→5 on the day's content
  - CLI: `logos begin`, `logos advance`, `logos complete`

**Verify:** `make rust-test` all pass. Each command runs end-to-end with real output.

### Phase 7 — ✅ Gateway RPC methods (nara.* namespace)

- `epi-cli/src/gate/nara.rs` — full set of RPC methods following gate/mod.rs pattern:
  ```
  nara.identity.get      → layer_presence, quintessence_hash, nucleotide_balance (NO raw data)
  nara.identity.augment  → add new layer (encrypted)
  nara.clock.state       → torus_pos, spanda_stage, spread_size
  nara.kairos.current    → planet_degrees[10], decan_phase, planetary_hour
  nara.oracle.cast       → requires consent:true in payload; returns draw + quaternionic + tags
  nara.oracle.history    → last N draws (hashes only, no raw card data)
  nara.medicine.triage   → element balance + chakra body zones + prescriptions
  nara.transform.begin   → open container with Spanda-guided selection
  nara.transform.commit  → close outer stroke, gate inner stroke
  nara.logos.state       → current stage + synthesis summary
  nara.weights.get       → current NaraWeights
  nara.weights.set       → update single weight (with sibling renormalization)
  nara.weights.calibrate → auto-calibrate from nucleotide_balance via per-suit integrals
  ```
- Wire all methods into gateway server dispatch
- OmniPanel contract: all method names match the gateway method strings exactly

**Verify:** Gateway running, `epi gate start`, then `curl -s localhost:18794` WebSocket test, then test each nara.* method with a JSON payload.

### Phase 8 — ✅ NaraWeights tunable system (master plan Part XIII)

- `~/.epi-logos/config.toml` [nara.weights] section — full schema from master plan XIII.1
- `NaraWeights` struct in Rust with serde_derive, default values matching per-suit integrals
- `epi nara weights show/set/reset/calibrate` wired to config file
- `calibrate_oracle_weights()` — maps nucleotide_balance to resonance weights via per-suit integrals (A=84→nn weight, T=96→pp weight, G=92→mp weight, C=88→pm weight, normalized)
- `set` command renormalizes sibling weights when one is changed (body temporal weights sum to 1.0, resonance weights sum to 1.0)

**Verify:** `epi nara weights calibrate` produces non-trivial weights from identity. `epi nara weights set body-oracle 0.3` updates config and renormalizes body-natal + body-transit.

### Phase 9 — ⏳ Parashakti body zone Neo4j population

- The Rust static body zone accessors are already implemented in medicine.rs
- This phase: extend `epi graph seed` to run the Option A Cypher from Part XIV of the master clarity plan
- The Cypher adds `body_zones` arrays to `ChakralCenter` nodes in Neo4j (7 MERGE+SET statements, safe to re-run)
- After seeding, add an optional Neo4j query path to `body_zones_for_chakra()` — tries Neo4j first, falls back to static `CHAKRA_BODY_ZONES[8]` when graph is offline
- Also seed the 36 decan `bodyPart` properties: for each decan node in the parashakti-deep dataset, ensure it is seeded with its `bodyPart` string and `herbalism_herbs` from the dataset JSON
- The static LUT is the always-available path; Neo4j is the live, updatable source of truth

**Verify:** `epi graph seed` runs Parashakti body zone Cypher. `epi nara medicine materia` shows decan body zone from real dataset. `epi nara medicine balance` shows chakra body zones from static LUT.

> **Current state (2026-03-12):** Static LUTs in `medicine.rs` are fully implemented with real dataset data and work without Neo4j. The `epi graph seed` Cypher extension is the only remaining piece — Cypher ready in Part XIV of master clarity plan.

### Phase 10 — ✅ Pratibimba personal subgraph (#4.4.4.4)

- `pratibimba.rs`:
  - `PratibimbaSubgraph` — personal Neo4j node operations, tenant-fenced
  - `search(term)` — etymological archaeology: traces term through personal usage + canonical Bimba
  - `map()` — visualize personal meaning map in terminal
  - `atlas_sync()` — opt-in anonymized contribution to Archetype Atlas (explicit consent required, same pattern as oracle)
  - Three-layer privacy: Bimba (shared), Pratibimba (personal), Atlas (anonymized collective)

**Verify:** `epi nara pratibimba search <term>` returns results from Neo4j. Atlas sync prompts for consent before any data leaves local graph.

### Phase 11 — ⏳ SpacetimeDB module

- Create `epi-spacetime-module/` as a separate Cargo crate (workspace member)
- Tables as specified in master clarity plan Part V:
  - `UserPresence { hash: String, torus_stage: u8, last_seen: Timestamp }` — BLAKE3 hash ONLY, no personal data
  - `OracleDraw { hash: String, hexagram_id: u8, timestamp: Timestamp }` — hash-keyed oracle events
  - `LogosPhase { hash: String, stage: u8, day_key: String }` — logos cycle presence
  - `TorusSync { hash: String, position: u8, spanda: u8 }` — torus position sync
- SpacetimeDB reducer functions for each table
- WASM compilation target: `wasm32-unknown-unknown`
- Client bridge in `epi-cli/src/gate/spacetimedb_bridge.rs` — extend existing bridge pattern

**Verify:** Module compiles to WASM. Client can subscribe and publish presence events. Privacy confirmed: no raw personal data in any table.

> **Current state (2026-03-12):** `epi-spacetime-module/` created as standalone crate. All 4 tables and 3 reducers defined with full validation. `SpacetimePresence` client added to `gate/spacetimedb_bridge.rs`. To activate real WASM: `rustup update stable` (needs ≥ 1.90), then in `epi-spacetime-module/Cargo.toml` uncomment `spacetimedb = "1.5"` dep and change `crate-type` to `["cdylib"]`, then restore `#[table]`/`#[reducer]` attributes (all documented inline in `src/lib.rs`).

### Phase 12 — ✅ ratatui-hypertile portal — structural tab (M0'–M3')

- Add `ratatui-hypertile` + `ratatui-hypertile-extras` to `epi-cli/Cargo.toml`
- Create `epi-cli/src/portal/` module with `WorkspaceRuntime`
- Two-tab workspace: Personal (M4'–M5', default) and Structural (M0'–M3')
- Implement Structural tab plugins first (lower complexity, establishes plugin pattern):
  - `M0DashboardPlugin` — coordinate space status, current position, family explorer
  - `M0FamiliesPlugin` — P/S/T/M/L/C family browser
  - `M1WalkPlugin` — torus position, spanda state, 12-position ring visualization
  - `M2VibrationalPlugin` — element/tattva viewer, planet operators
  - `M3KnowingPlugin` — knowing dossier browser
  - `StatusPlugin` — active NaraWeights, torus spread size, quintessence activation level, Ananda matrix view, any overrides flagged

- Layout persistence to `~/.epi-logos/portal/workspace.json` (serde_json)
- Keybindings: Tab = switch workspace, `|` = split vertical, `-` = split horizontal, `x` = close pane, `h/j/k/l` = vim navigation, `?` = help, `q` = quit

**Verify:** `epi portal` launches, shows two tabs, structural plugins render with real data.

### Phase 13 — ✅ ratatui-hypertile portal — personal tab (M4'–M5')

Implement the M4'–M5' personal tab plugins. These call into the nara modules from Phase 1–8:

- `M4IdentityPlugin` — identity summary, layer presence bars, quintessence hash, nucleotide balance ring
- `M4FlowPlugin` — live writing interface, wikilink support, autosave to NOW file in vault, outer/inner stroke indicator
- `M4OraclePlugin` — oracle cast interface, consent gate, spread display with quaternionic charge display per card, Vimarsa operator annotation per card
- `M4MedicinePlugin` — elemental balance display, body zone heatmap, active prescriptions, three temporal layers shown (natal/transit/oracle with weights)
- `M4TransformPlugin` — active container display, alchemical operation tracker, cycle completion state, Spanda stage indicator
- `M4LensPlugin` — active lens selector, reframed content display, synthesis view
- `M4PratibimbaPlugin` — etymology search interface, personal meaning map graph visualization
- `M5LogosPlugin` — Logos cycle stage display, synthesis output, day's completion status
- `M5ChatPlugin` — agent chat interface, Vimarsa operator annotations on agent responses
- `M5FsmPlugin` — agent FSM state display

**Verify:** All 10 personal tab plugins render with real data. Oracle cast works in-portal with consent gate. Medicine shows live Kerykeion data.

---

## TESTING REQUIREMENTS — EVERY PHASE

At the end of each phase, before moving to the next:

1. **`make test`** in `epi-lib/` — all C tests pass (including existing M4 tests)
2. **`cargo test`** in `epi-cli/` — all Rust tests pass
3. **Live CLI test** — run the actual `epi nara <command>` for every new command in that phase
4. **Integration test** — for gateway phases, start the gateway and test via WebSocket
5. **No `todo!()`, no `unimplemented!()`, no `panic!("not yet")` in any code path that the user will hit**

Tests that must pass by end of full implementation:
- `epi-cli/tests/gate_nara*.rs` — new gateway tests for all nara.* methods
- `epi-cli/tests/nara_*.rs` — unit tests for all nara module functions
- `epi-cli/tests/portal_*.rs` — portal smoke tests
- All existing tests in `epi-cli/tests/` that were passing before

---

## KEY CONSTANTS AND VALUES (from M3 C code — authoritative)

```
NUCLEOTIDE_ICHING_VALUE = {A=6, T=9, C=7, G=8}  // coin sums: 6=old-yin, 7=young-yin, 8=young-yang, 9=old-yang
Per-suit integrals: A=84 (Water/Cups), T=96 (Fire/Wands), C=88 (Earth/Pentacles), G=92 (Air/Swords)
M3_INTEGRAL_INVARIANT = 360  (_Static_assert in m3.h verifies this)
M3_TAROT_PIP_PRINCESS = 10, M3_TAROT_PIP_PRINCE = 11  // Thoth naming confirmed

Quaternionic charge profile:
  pp = (X+Y+Z, X+Y+Z) : convergent  (pure yang = Fire element)
  mm = (X-Y-Z, X-Y-Z) : shadow      (pure yin = Water element)
  mp = (X-Y+Z, ...) : ascending      (yang-stable = Air = G)
  pm = (X+Y-Z, ...) : descending     (yin-stable = Earth = C)

NaraWeights defaults (self-derived from per-suit integrals):
  oracle_resonance_pp = T/total = 96/360 ≈ 0.267 → round to 0.40 (dominant emphasis)
  oracle_resonance_nn = A/total = 84/360 ≈ 0.233 → 0.15 (receptive, de-emphasized)
  oracle_resonance_mp = G/total = 92/360 ≈ 0.256 → 0.25
  oracle_resonance_pm = C/total = 88/360 ≈ 0.244 → 0.20

Chakra IDs (from m2.h Chakra_Id enum):
  EARTH=0, MULADHARA=1, SVADHISTHANA=2, MANIPURA=3, ANAHATA=4, VISHUDDHA=5, AJNA=6, SAHASRARA=7

Elemental_Signature bit extraction (critical — wrong bit order causes silent errors):
  element  = elem_sig & 0b111          // bits [2:0]
  chakra   = (elem_sig >> 2) & 0b111   // bits [4:2]  ← USE THIS NOT >> 5
  phase    = (elem_sig >> 5) & 0b11    // bits [6:5]
```

---

## KNOWN ISSUES TO BE AWARE OF

- `/usr/local/bin/epi` shadows `~/.cargo/bin/epi` — use full path `~/.cargo/bin/epi` or fix PATH ordering when testing
- `portal/plugins/m4.rs` has a pre-existing `KeyCode::Esc` compile issue — fix it, don't work around it
- `Coordinate_Family` enum: C=0, P=1, L=2, S=3, T=4, M=5, NONE=7 (not 6)
- Tagged pointers: `GET_PTR(ptr)` before EVERY dereference in C — existing code does this; new C code must too
- SpacetimeDB WASM module is a separate crate — do not bundle it into epi-cli

---

## COMPLETION CRITERIA

The implementation is complete when:

1. `make test` in epi-lib/ passes all tests
2. `cargo test` in epi-cli/ passes all tests including new nara/portal tests
3. Every `epi nara <subcommand>` in the NaraCmd enum runs end-to-end with real output
4. `epi portal` launches the hypertile portal, both tabs load, all 17 plugins render with real data
5. The SpacetimeDB module compiles to WASM and the bridge connects
6. `epi nara oracle cast` works with consent gate, temporal authority check, quaternionic analysis, and Vimarsa semantic annotation
7. `epi nara medicine triage` shows body zones derived through the element→chakra chain with live Kerykeion transit data
8. `epi nara weights calibrate` produces identity-specific oracle weights from nucleotide_balance
9. No stub functions, no todo! macros, no unimplemented! calls anywhere in the nara/ or portal/ modules
