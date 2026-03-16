# Holographic Validation Matrix — Nara / Cosmic Clock

**Status:** Living document (2026-03-16)

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
| 1 | Quintessence identity (BLAKE3 archetypal address) | `01-quintessence-hash-architecture.md` | `M4_Quintessence_Identity` struct | `BLAKE3(natal_config \|\| genekeys \|\| humandesign \|\| jungian \|\| ql_birth)` | `PortalClockState.session_hash`, SpacetimeDB presence routing, identity panel | `partial` | Struct defined; derivation function is stub only; no caller wires all 5 layers yet |
| 2 | Quintessence quaternion `[f32;4]` | `01-quintessence-hash-architecture.md`, `clock_state.rs` | `PortalClockState.quintessence_quaternion [f32;4]` | `update_quintessence_quaternion()` in `clock_state.rs` | `CosmicClockPlugin` torus orientation, identity panel quaternion display | `partial` | Function implemented; no caller invokes it on identity augment |
| 3 | Oracle faces (4-face reading) | `04-shadow-dynamics-three-computations.md` | `OracleFaces` struct in `clock_state.rs` | `update_from_cast()` | `M4OraclePlugin`, `medicine prescribe`, `SpacetimeDB oracle event` | `partial` | Struct exists; `update_from_cast()` has zero callers in the portal pipeline |
| 4 | Clock degree from oracle cast | `09-cosmic-clock-plugin-tui-spec.md` | `PortalClockState.current_degree: u16` | `cast_result → primary_hexagram → degree_node_360` | `CosmicClockPlugin` ring highlight, medicine decan lookup, lens segment display | `planned` | Not yet wired through portal; oracle cast does not update `current_degree` |
| 5 | tick12 (spanda / torus stage) | `03-spanda-double-helix-12fold.md`, `clock_state.rs` | `PortalClockState.torus_stage: u8` | `quantize_to_spanda_substage(y, x)` from live quaternion | `CosmicClockPlugin` torus stage indicator, oracle-cast moment detection, walk step display | `implemented` | Correct integer quantization 0–11 in `clock_state.rs`; rename `torus_stage` → `tick12` is pending |
| 6 | KairosState (full 10-planet + Earth center) | `09-cosmic-clock-plugin-tui-spec.md`, `clock_state.rs` | `KairosState` with `PlanetState[10]` | `parse_kerykeion_to_kairos_state()` | `CosmicClockPlugin` planetary ring render, `M4SpinePlugin` hour marker, transit map | `partial` | `KairosState` struct has `[PlanetState;9]` (legacy, no Uranus); needs update to `[PlanetState;10]`; `parse_kerykeion_to_kairos_state()` not implemented |
| 7 | Oracle payload (machine + human simultaneously) | `07-unified-architecture-golden-thread.md §7`, `M4-nara-subtle-body-map` | `oracle_payload` (type TBD) | `cast → update_from_cast() → emit oracle_payload` | Gateway `nara.oracle.payload` RPC, frontend subtle-body map, SpacetimeDB oracle presence event | `planned` | Schema not yet defined; no struct exists; blocked by §3 |
| 8 | Medicine decan chain | `M4-nara-personal-interface`, `epi-cli/src/nara/medicine.rs` | `ZodiacDecanEntry`; `DECAN_BODY_PARTS[36]`; `CHAKRA_BODY_ZONES[8]` | `zodiac_decan(degree) → planet → element → chakra → body_zones` | `prescribe()`, `chakra()`, `balance()` | `implemented` | Real LUT data from Parashakti dataset; internally coherent; no dependency on clock degree yet (uses identity natal degree only) |
| 9 | Hexagram body map | `epi-cli/src/nara/oracle.rs` | `HEXAGRAM_BODY_DYNAMICS[64]` array of `HexagramBodyEntry` | `hexagram_body_lookup(hex: u8) → Option<&HexagramBodyEntry>` | NONE YET | `partial` | Data exists; zero downstream dependents found in codebase; needs wiring to oracle_payload and medicine |
| 10 | session_hash derivation | `00-canonical-invariants.md §8` | `PortalClockState.session_hash [u8;32]` | `BLAKE3(quintessence_hash[32] \|\| session_start_u64[8])` | SpacetimeDB presence routing (session-scoped events) | `planned` | Khora owns derivation; not yet called; Nara must receive it as read-only input from Khora event |
| 11 | Amino acid backbone (24-fold lens) | `02-16-lenses-backbone-temporal.md` | `Clock_Backbone_Node[24]` | `degree → backbone_index` at 15° intervals (every 15° boundary is a backbone node) | Lens 7 rendering, medicine backbone path, Major Arcana bridge (Tarot Trumps) | `planned` | Struct defined in spec; LUT not yet built; blocked by `build_clock_degree_lut.py` script |
| 12 | Planet model canonical ordering (Sun=0…Pluto=9) | `00-canonical-invariants.md §2` | `PlanetState[10]` in `KairosState` | `parse_kerykeion_to_kairos_state()` maps Kerykeion output → canonical index | Clock face render (10-planet ring), transit map, natal config display | `partial` | `KairosState` has `[PlanetState;9]` with legacy order; Uranus missing; migration requires Parashakti dataset reconciliation |
| 13 | WALK_SPANDA (12-step M1 spanda traversal) | `00-canonical-invariants.md §6`, `02-16-lenses-backbone-temporal.md` | `Walk_Mode::WALK_SPANDA` enum variant | Clock walk at 30°/step, 12 nodes; semantics: each step = one M1 spanda beat | Clock walk UI sequencing, QL-aligned oracle cycle display, spanda phase indicator | `planned` | Currently named `WALK_TORUS` in specs and code; rename pending; semantics correct, name misleading |
| 14 | Tarot elemental quaternion bridge | `07-unified-architecture-golden-thread.md §7`, `docs/specs/M/HMS-quaternionic-overlay.md` | TBD (`TarotQuaternionBridge` struct) | `tarot_card → suit → element → quaternion_component_weight` then fold into `oracle_eval4` | `oracle_payload` quaternion field, clock position update from tarot cast | `planned` | Data exists in `oracle.rs` (ACE_ELEMENT_MAP, PIP_DECAN_MAP); quaternion bridge struct not defined; quaternion fold not wired |

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
      .torus_stage    ← tick12
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

## Open Gaps (Priority Order)

The following gaps are the highest-priority blockers for full chain coherence:

1. **`parse_kerykeion_to_kairos_state()`** — not implemented. Blocks Chain D entirely. Required for any live planetary display.
2. **`update_from_cast()` has zero callers** — oracle cast does not update `PortalClockState`. Blocks Chain C downstream consumers.
3. **`oracle_payload` type undefined** — no struct schema. Blocks gateway RPC and frontend subtle-body map.
4. **`HEXAGRAM_BODY_DYNAMICS[64]` has zero downstream consumers** — data exists, wiring absent. Connect to oracle_payload (§7) and medicine (§8).
5. **`build_clock_degree_lut.py` not built** — blocks Lens 7 backbone rendering (§11) and any degree-indexed LUT access.
6. **`KairosState[PlanetState;9]` → `[PlanetState;10]`** — Uranus missing; canonical array size is 10. Requires Parashakti dataset reconciliation.
7. **`quintessence_quaternion` has no caller** — `update_quintessence_quaternion()` is implemented but never invoked on identity augment.
