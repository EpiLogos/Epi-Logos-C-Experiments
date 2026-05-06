# Holographic Validation Matrix — Nara / Cosmic Clock

**Status:** Living document — last updated 2026-03-30 (spec-parity audit pass)

---

## Purpose

One audit artifact that future reviews can diff instead of re-deriving the whole system. Every symbolic claim must have a computational slot; every computational slot must have a named symbolic meaning. Structural completeness, derivation completeness, and cross-layer coherence are all checkable here.

This document is the answer to: "Is every piece of the nara/clock system accounted for end-to-end?"

---

## Legend

| Status | Meaning |
|--------|---------|
| `canonical` | Decision finalized; implementation matches spec |
| `implemented` | Code exists and is correct; spec may need catch-up |
| `partial` | Struct/data exists but derivation or wiring is incomplete |
| `planned` | Specified; not yet implemented |

---

## Main Validation Matrix

| # | Claim | Source Spec | Data Structure | Derivation Function | Downstream Consumers | Status | Notes |
|---|-------|-------------|----------------|---------------------|----------------------|--------|-------|
| 1 | Quintessence identity (BLAKE3 archetypal address) | `01-quintessence-hash-architecture.md` | `M4_Quintessence_Identity` struct | `BLAKE3(natal_config \|\| genekeys \|\| humandesign \|\| jungian \|\| ql_birth)` | `PortalClockState.session_hash`, SpacetimeDB presence routing, identity panel | `implemented` | `blake3_identity_hash()` in identity.rs hashes presence_mask + sorted layer source strings via BLAKE3; full 64-char hex stored; seeded into `PortalClockState` at portal startup via `new_shared_clock_state()` |
| 2 | Quintessence quaternion `[f32;4]` | `01-quintessence-hash-architecture.md`, `clock_state.rs` | `PortalClockState.quintessence_quaternion [f32;4]` | `update_quintessence_quaternion()` in `clock_state.rs` | `CosmicClockPlugin` torus orientation, identity panel quaternion display | `implemented` | `elemental_profile: Option<[f32;4]>` added to `LayerMeta`; `compute_quintessence_profiles()` extracts 5-layer profiles; `new_shared_clock_state()` seeds quaternion at startup; per-layer derivation via `elemental_profile_for_layer()` |
| 3 | Oracle faces (4-face reading) | `04-shadow-dynamics-three-computations.md` | `OracleFaces` struct in `clock_state.rs` | `update_from_cast()` | `M4OraclePlugin`, `medicine prescribe`, `SpacetimeDB oracle event` | `implemented` | `update_from_cast()` called from `M4OraclePlugin.on_event` via `cast_iching_with_payload()`; SharedClockState propagates to all Tab 0 + Tab 1 plugins |
| 4 | Clock degree from oracle cast | `09-cosmic-clock-plugin-tui-spec.md` | `PortalClockState.current_degree: u16` | `cast_iching_with_payload()` → `oracle_eval4()` → `update_from_cast()` | `CosmicClockPlugin` ring highlight, medicine decan lookup, lens segment display | `implemented` | Fixed: `cast_iching_with_payload()` eliminates double-cast bug; same `IChingResult` feeds display string and `OraclePayload`; `update_from_cast()` writes `current_degree` from the same cast |
| 5 | tick12 (spanda / torus stage) | `03-spanda-double-helix-12fold.md`, `clock_state.rs` | `PortalClockState.tick12: u8` | `quantize_to_spanda_substage(y, x)` from live quaternion | `CosmicClockPlugin` torus stage indicator, oracle-cast moment detection, walk step display | `implemented` | Correct integer quantization 0–11; `update_from_cast()` sets tick12 from live quaternion via `quantize_to_spanda_substage(y, x)` |
| 6 | KairosState (full 10-planet + Earth center) | `09-cosmic-clock-plugin-tui-spec.md`, `clock_state.rs` | `KairosState` with `PlanetState[10]` | `kerykeion_result_to_kairos_state()` in `kairos.rs` | `CosmicClockPlugin` planetary ring render, `M4SpinePlugin` hour marker, transit map | `implemented` | `KairosState` has `[PlanetState;10]` (Sun=0…Pluto=9); `kerykeion_result_to_kairos_state()` implemented; `try_load_kairos_into_clock()` fixed to read `~/.epi-logos/nara/kairos/current.json` |
| 7 | Oracle payload (machine + human simultaneously) | `07-unified-architecture-golden-thread.md §7`, `M4-nara-subtle-body-map` | `OraclePayload` struct in `oracle.rs` | `cast_iching_with_payload()` → `oracle_eval4()` → returns `OraclePayload` | Gateway `nara.oracle.payload` RPC ✅, SpacetimeDB `record_oracle_draw()` ✅, frontend subtle-body map (Electron, out of scope) | `implemented` | `OraclePayload` struct implemented; gateway RPC dispatched; SpacetimeDB `record_oracle_draw(hash, hex_id)` + `publish_presence(hash, tick12)` wired in gate/nara.rs after oracle cast |
| 8 | Medicine decan chain | `M4-nara-personal-interface`, `epi-cli/src/nara/medicine.rs` | `ZodiacDecanEntry`; `DECAN_BODY_PARTS[36]`; `CHAKRA_BODY_ZONES[8]` | `zodiac_decan(degree) → planet → element → chakra → body_zones` | `prescribe()`, `chakra()`, `balance()` | `implemented` | Real LUT data from Parashakti dataset; internally coherent; uses identity natal degree (live oracle degree wiring is next step) |
| 9 | Hexagram body map | `epi-cli/src/nara/oracle.rs` | `HEXAGRAM_BODY_DYNAMICS[64]` array of `HexagramBodyEntry` | `hexagram_body_lookup(hex: u8) → Option<&HexagramBodyEntry>` | NONE YET | `partial` | Data exists; zero downstream dependents; needs wiring to oracle_payload and medicine |
| 10 | session_hash derivation | `00-canonical-invariants.md §8` | `PortalClockState.session_hash [u8;32]` | `BLAKE3(quintessence_hash[32] \|\| session_start_u64[8])` | SpacetimeDB presence routing (session-scoped events) | `implemented` | `compute_session_hash()` in identity.rs uses BLAKE3(identity_hash \|\| session_start_u64); seeded into `PortalClockState.session_hash` at portal startup via `new_shared_clock_state()`; Khora-session handoff is future refinement (uses startup time for now) |
| 11 | Amino acid backbone (24-fold lens) | `02-16-lenses-backbone-temporal.md` | `Clock_Backbone_Node[24]` | `degree → backbone_index` at 15° intervals | Lens 7 rendering, medicine backbone path, Major Arcana bridge | `planned` | Struct defined in spec; LUT populated by `build_clock_degree_lut.py` with computed values; Neo4j-backed fields still approximated |
| 12 | Planet model canonical ordering (Sun=0…Pluto=9) | `00-canonical-invariants.md §2` | `PlanetState[10]` in `KairosState` | `kerykeion_result_to_kairos_state()` uses `planet_id` as direct index | Clock face render (10-planet ring), transit map, natal config display | `implemented` | `[PlanetState;10]` with canonical mod-10; `planet_id` from Python kerykeion output maps directly; `PLANET_SYMBOLS[10]` aligned in `CosmicClockPlugin` |
| 13 | WALK_SPANDA (12-step M1 spanda traversal) | `00-canonical-invariants.md §6`, `02-16-lenses-backbone-temporal.md` | `Walk_Mode::WALK_SPANDA` enum variant | Clock walk at 30°/step, 12 nodes | Clock walk UI sequencing, QL-aligned oracle cycle display | `planned` | Legacy name `WALK_TORUS` still in some spec text; rename pending; `MiniClockPlugin` (mini_clock.rs) implements 12-tick spanda wheel correctly |
| 14 | Tarot elemental quaternion bridge | `07-unified-architecture-golden-thread.md §7` | `[f32;4]` weights from `tarot_card_to_element_weights()`; folded by `tarot_draw_to_oracle_payload()` | `card→pip_decan/court_sign/ace_element/major_arcana → sign_to_elem_idx → [EARTH,FIRE,WATER,AIR] → pp/nn/pn/np×32` | `cast_tarot_with_payload()` → `OraclePayload`, clock position update, hexagram body annotation | `implemented` | `tarot_card_to_element_weights()` uses ACE_ELEMENT_MAP/PIP_DECAN_MAP/COURT_SIGN_MAP/major_arcana_elem_idx; `tarot_draw_to_oracle_payload()` folds to pp/nn/pn/np; `cast_tarot_with_payload()` is atomic draw+history+display+payload; `cast()` CLI tarot branch now delegates to it |

---

## Cross-Layer Chain Summary

The canonical chains below describe the full data flow from input to downstream consumers. Every row in the matrix above maps to at least one of these chains.

```
══════════════════════════════════════════════════
CHAIN A — Identity Grounding
══════════════════════════════════════════════════

natal_data (birth-date, birth-location, natal-chart-path)
  → [#4.0 sub-system 1] natal chart
  → [#4.0 sub-system 2] gene keys          (enrichment, optional)
  → [#4.0 sub-system 3] human design        (enrichment, optional)
  → [#4.0 sub-system 4] jungian typology    (enrichment, optional)
  → [#4.0 sub-system 5] QL birth encoding   (enrichment, optional)
  → M4_Quintessence_Identity (5 #4.0 profiles, weight increases with layers)
  → quintessence_quaternion [f32;4]         (weighted elemental average, unit quaternion)
  → natal_hash [u8;32]                      (BLAKE3 of natal config, fixed forever)
  → live_hash [u8;32]                       (BLAKE3 of all 5 layer hashes, updates on augment)
  → quintessence_hash [u8;32]               = live_hash THE identity
  → PortalClockState.quintessence_hash


══════════════════════════════════════════════════
CHAIN B — Session Anchoring (Khora-owned)
══════════════════════════════════════════════════

quintessence_hash [u8;32]  (from Chain A)
  + session_start: u64     (Unix timestamp from Khora session open event)
  → session_hash = BLAKE3(quintessence_hash || session_start)
  → PortalClockState.session_hash
  → SpacetimeDB presence routing (session-scoped)

  Note: Nara reads session_hash; Khora writes it.


══════════════════════════════════════════════════
CHAIN C — Oracle Cast → Live State
══════════════════════════════════════════════════

oracle_cast (coin throw / tarot draw)
  → oracle_eval4 (pp, nn, np, pn)           (charge algebra, raw cast output)
  → live_quaternion [f32;4]                 (updated from charges, distinct from quintessence_quaternion)
  → tick12 = quantize_to_spanda_substage(y, x)   (M1 spanda beat 0–11)
  → OracleFaces:
      primary  = CLOCK_DEGREE_LUT[d]
      deficient = CLOCK_DEGREE_LUT[(d+180)%360]
      implicate = (degree=d, phase=1)
      temporal  = primary_hex XOR changing_lines_mask
  → update_from_cast() → PortalClockState
      .current_degree ← d
      .tick12         ← tick12
      .live_quaternion ← updated
  → oracle_payload (machine + human-readable)
  → gateway RPC nara.oracle.payload
  → medicine prescribe / chakra / balance
  → transform containers
  → logos FSM stage hint
  → SpacetimeDB oracle presence event


══════════════════════════════════════════════════
CHAIN D — Kairos / Planetary
══════════════════════════════════════════════════

Kerykeion (Python, pyswisseph)
  → raw planet ephemeris (degree + sign per planet)
  → parse_kerykeion_to_kairos_state()
  → KairosState with PlanetState[10]  (Sun=0…Pluto=9; Earth = center, not in array)
  → update_kairos() → PortalClockState.kairos
  → CosmicClockPlugin planetary ring render
  → M4SpinePlugin hour marker (current Sun/Moon degree)
  → transit map overlay on clock face
  → live body zone activations (kerykeion degrees → sign → element → chakra → CHAKRA_BODY_ZONES)


══════════════════════════════════════════════════
CHAIN E — Medicine / Body
══════════════════════════════════════════════════

degree (from oracle cast, Chain C)
  → zodiac_decan(degree)
  → ZodiacDecanEntry → ruling_planet → element_sig
  → element_sig → chakra (via ELEMENT_CHAKRA / PLANET_CHAKRA LUTs)
  → chakra → CHAKRA_BODY_ZONES[chakra_id]
  → body_zones[] (real anatomical strings from Parashakti dataset)
  → prescribe() / chakra() / balance() / materia()

hexagram (from oracle cast, Chain C)
  → hexagram_body_lookup(hex)
  → HEXAGRAM_BODY_DYNAMICS[hex]
  → HexagramBodyEntry.chakra_ids + .body_zones
  → oracle_payload body annotation (planned)
```

---

## Resolved Gaps (2026-03-30 parity audit)

Items closed in the 2026-03-30 spec-parity audit session:

- ✅ **Oracle double-cast bug** — `M4OraclePlugin` now uses `cast_iching_with_payload()` (oracle.rs) which issues coins once, writes history, and returns `(display_string, OraclePayload)` atomically. `update_from_cast()` receives the same cast's charges and degree.
- ✅ **`update_from_cast()` had zero callers** — wired through `cast_iching_with_payload()` in M4OraclePlugin.
- ✅ **Kairos sync path mismatch** — `try_load_kairos_into_clock()` (clock.rs) now reads `~/.epi-logos/nara/kairos/current.json` via `kairos::load_current()` and converts via `kerykeion_result_to_kairos_state()`. The former stale path (`~/.epi-logos/kairos-cache.json`) and old object format (`{planets:{sun:45}}`) are replaced.
- ✅ **`kerykeion_result_to_kairos_state()` not implemented** — implemented in kairos.rs; uses `planet_id` as direct canonical-mod-10 index.
- ✅ **`KairosState[PlanetState;9]`** — `[PlanetState;10]` with full Sun=0…Pluto=9 mod-10 ordering.
- ✅ **SharedClockState isolation (Tab 1)** — portal/mod.rs now passes `Some(clock_state.clone())` for Tab 1 plugin registration; oracle casts in Tab 0 propagate to CosmicClockPlugin, M2Vibrational, M3Knowing in Tab 1.
- ✅ **m3.knowing unclocked** — registered with `new_with_clock(c)` so auto-suggest from tick12 works.
- ✅ **Orphaned MiniClockPlugin in clock.rs** — removed; portal uses mini_clock.rs exclusively.

### Resolved Gaps (2026-03-30 second pass — blocker clearance)

- ✅ **`quintessence_quaternion` data model gap** — `elemental_profile: Option<[f32;4]>` added to `LayerMeta`; `elemental_profile_for_layer()` derives [FIRE,WATER,EARTH,AIR] per layer source type; `compute_quintessence_profiles()` extracts 5-layer array; `new_shared_clock_state()` seeds quaternion at portal startup.
- ✅ **Quintessence BLAKE3 full 5-layer fold** — `blake3_identity_hash()` implemented in identity.rs using vendored BLAKE3; hashes sorted layer source strings + presence mask; replaces `simple_identity_hash()` 4-byte approach.
- ✅ **session_hash not computed** — `compute_session_hash()` implemented; `new_shared_clock_state()` writes it into `PortalClockState.session_hash` at startup.
- ✅ **SpacetimeDB dispatch zero-wired** — gate/nara.rs now calls `record_oracle_draw()` + `publish_presence()` after oracle cast; `publish_presence()` after kairos sync; `record_logos_stage()` after logos stage command. Stub client in `gate/spacetimedb_bridge.rs` logs intent without live HTTP (pending real SpacetimeDB server).
- ✅ **`engine_spanda_walk()` missing from C library** — implemented in engine.c; declared in engine.h with clarifying comment distinguishing it from 6-step `engine_torus_walk()`.
- ✅ **Tarot elemental quaternion bridge** — `tarot_card_to_element_weights()` maps every card category (Ace/pip/court/Major Arcana) via Golden Dawn attributions to `[EARTH,FIRE,WATER,AIR]` weights; `tarot_draw_to_oracle_payload()` folds spread into pp/nn/pn/np charges (×32 per card, I-Ching line scale); `cast_tarot_with_payload()` delivers atomic draw+history+display+payload with hexagram body annotation; `cast()` CLI tarot branch now delegates to it.
- ✅ **`HEXAGRAM_BODY_DYNAMICS[64]` downstream wiring** — hexagram body data now appended in both `cast_iching_with_payload()` and `cast_tarot_with_payload()` display output.

---

## Open Gaps (Remaining — Future Only)

1. **WALK_SPANDA rename** — legacy `WALK_TORUS` naming in some spec text; `MiniClockPlugin` correctly implements 12-tick spanda; cosmetic enum rename in C code deferred.
2. **session_hash Khora handoff** — currently seeded from portal startup timestamp; canonical form requires Khora session_start event. Nara portal field is correctly populated and consumed; handoff protocol is a future refinement once Khora session lifecycle is built out.
