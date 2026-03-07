# Plan: Topological Mode Flags + Spanda Chain Derivation

**Status:** Ready for execution
**Date:** 2026-03-06
**Scope:** 3 files — `ontology.h`, `m1.h`, `families.c`
**Goal:** Make the four topological modalities first-class in the HC flags byte;
document the Spanda chain derivation; annotate the P0/P5/P0'/P5'/C0/C5 seed totalization.

No struct size changes. No new allocations. No breaking changes to existing tests.

---

## Background — Topological Modes as Inner Reality of P / P'

The four topological modalities are not external classifications — they ARE the inner structure
of the Position (P) coordinate family and its inversion (P'):

| Mode | Coordinates | What it is |
|------|-------------|-----------|
| **Torus (T²)** | P (inversion_state=0) | genus-1, outward 6-position walk, 4g+2g=6 |
| **Klein Bottle** | P' (inversion_state=1) | P + P' = full 12-position double-cover; P' completes it |
| **Lemniscate (T² g=2)** | P at #4 specifically | genus-2 nesting at the #4 anchor; links to C'/cf chain |
| **Zero-Sphere (S⁰)** | Spanda seed (P0/P5/P0'/P5'/C0/C5) | pre-differential (0/1) fused; the totalizing boundary |

**Key corrections from canvas/docs:**
- **Torus = P alone** (the first 6 outward positions, single cover)
- **Klein = P + P' together** (Torus + its inversion = double cover). P' individually IS the
  Klein-completing return phase. Klein is not a separate topology — it's the Torus that has
  traversed its own inversion.
- **Lemniscate** is already in the pointer logic (`cf → &Psychoid_4` for all family coords,
  HAS_NESTING_ACCESS at ql_position==4). The addition is making it explicit in TOPO_MODE and
  annotating the link to C' (the reflective coordinate series: cpf/ct/cp/cf/cfp/cs = VAK language).
- **Zero-Sphere (S⁰)** = the Spanda seed = the six boundary coordinates P0, P5, P0', P5', C0, C5
  held in a fused (0/1) unity. "0 and 1 are equal to 5 and 0": the binary seed IS the P0↔P5
  oscillation which IS the C0↔C5 (Bimba↔Pratibimba) equivalence.

---

## Change 1 — `include/ontology.h`

### Location
After the `STATUS / FLAGS BYTE DEFINITIONS` section (section VIII), before the `BEDROCK ACCESSOR`.

### What to add
Four TOPO_MODE constants using **flags bits 7-6** (currently reserved/0):

```c
/* =============================================================================
 * IX-A. TOPOLOGICAL MODALITY — bits 7-6 of flags byte
 *
 * The inner reality of the P-family (Position) coordinate family and its
 * inversion P'. These four modes ARE the HC's topological self-understanding:
 *
 *   TOPO_TORUS       — P (inversion_state=0), outward 6-position walk.
 *                      Genus-1 surface: 4g+2g=6, χ=0, π₁=Z⊕Z (abelian),
 *                      orientable, 4-colour map. The single Torus cover.
 *
 *   TOPO_KLEIN       — P' (inversion_state=1), inward return phase.
 *                      P + P' together = full Klein double-cover (12 positions,
 *                      720°). P' completes the Klein topology. Non-orientable,
 *                      6-colour map (Heawood) = the 6 QL positions.
 *
 *   TOPO_LEMNISCATE  — P at ql_position==4 specifically (genus-2 incubation).
 *                      The figure-eight nesting anchor at #4. Already embedded
 *                      in pointer logic (cf → &Psychoid_4, HAS_NESTING_ACCESS).
 *                      Also the entry-point to C' (reflective coordinates:
 *                      cpf/ct/cp/cf/cfp/cs — the VAK language / context frames).
 *
 *   TOPO_ZERO_SPHERE — The Spanda seed: S⁰ = two disconnected points = (0/1)
 *                      as pre-differential binary ground. Applies to the six
 *                      boundary/seed coordinates: P0, P5, P0', P5', C0, C5.
 *                      "0 and 1 = 5 and 0" — the binary poles ARE the ground
 *                      and synthesis of the Torus, which ARE Bimba and Pratibimba.
 *                      See SPANDA_SEED_TOTALIZATION_INVARIANT in m1.h.
 *
 * Bits 5-0 of flags are unchanged (ELEMENT_ID, PROVISIONAL, CANONICAL, BIMBA).
 * ============================================================================= */

#define TOPO_MODE_SHIFT       6u
#define TOPO_MODE_MASK        0xC0u

#define TOPO_MODE_TORUS       0x00u   /* T² genus-1: P outward phase (default)          */
#define TOPO_MODE_LEMNISCATE  0x40u   /* T² genus-2: P at #4, cf-chain entry            */
#define TOPO_MODE_KLEIN       0x80u   /* Klein: P' return phase, completes double-cover  */
#define TOPO_MODE_ZERO_SPHERE 0xC0u   /* S⁰: Spanda seed, P0/P5/P0'/P5'/C0/C5 boundary */

#define GET_TOPO_MODE(coord) \
    ((coord)->flags & TOPO_MODE_MASK)

#define SET_TOPO_MODE(coord, mode) \
    ((coord)->flags = (uint8_t)(((coord)->flags & ~TOPO_MODE_MASK) | (uint8_t)(mode)))
```

### Verify
- `BIMBA_FLAGS = FLAG_STATUS_CANONICAL | FLAG_BIMBA = 0x01 | 0x20 = 0x21` — bits 7-6 are 00
  → BIMBA entities get TOPO_MODE_TORUS (0x00) by default. Correct for raw psychoids.
- No existing flag values conflict with bits 7-6 (currently reserved as 0).
- `_Static_assert(sizeof(Holographic_Coordinate) == 128)` is unaffected — no struct change.

---

## Change 2 — `include/m1.h`

### Location A — Spanda chain derivation comment
**Immediately above** `#define SPANDA_BIT_POLE_A` in section `FR 2.1.2`.

### What to add

```c
/* -------------------------------------------------------------------
 * SPANDA CHAIN — how binary non-dual generates the 6-state system
 * and the complete 36+64=100% QL field:
 *
 * STEP 0 — S⁰ Seed (SPANDA_SEED_BITS = 0x03, TOPO_ZERO_SPHERE):
 *   The (0/1) binary as two disconnected poles, not yet connected.
 *   Both SPANDA_BIT_POLE_A and SPANDA_BIT_POLE_B are simultaneously
 *   active. This is the non-dual ground — "0 and 1 are equal to 5 and 0."
 *   Maps to: P0/P5 (ground and synthesis of the Torus) and
 *             C0/C5 (Bimba/Pratibimba — source and reflection).
 *   See SPANDA_SEED_TOTALIZATION_INVARIANT below.
 *
 * STEP 1 — Differentiation (SPANDA_POLE_A / SPANDA_POLE_B):
 *   Pole A (0x01): (0/1) outward = Mahamaya track {1,2,4,8,7,5}, 64-bit
 *   Pole B (0x02): (1/0) return  = Parashakti track {3,6,9,3,6,9}, 72-bit
 *   Pole A → P (Torus outward). Pole B → P' (Klein return).
 *
 * STEP 2 — Trika (SPANDA_TRIKA):
 *   (0/1)+(1/0) = (0/1/2) — the first stable genus-1 torus.
 *   The two punctures = the two generators of π₁(T²) = Z⊕Z.
 *
 * STEP 3 — Torus arithmetic (4g+2g = 6 positions, QL_POSITIONS):
 *   4g = 4 edges of the fundamental polygon (positions 1-4: the explicates)
 *   2g = 2 identification vertices (positions 0 and 5: ground and synthesis)
 *   Total: 4(1) + 2(1) = 6 [QL_POSITIONS]
 *
 * STEP 4 — Complete QL field:
 *   P × P' = 6 × 6 = 36 [M2_TATTVA]  — all position-inversion combinations
 *   P / P' = 2^6    = 64 [M3_WORD]   — all 6-bit binary sequences
 *   36 + 64 = 100% — the complete QL field
 *
 * STEP 5 — Klein double-cover:
 *   P (outward 0-5) + P' (return 0'-5') = 12 positions [RING_SIZE]
 *   Klein bottle needs 6 colours (Heawood) = the 6 QL positions.
 *   P alone IS the Torus. P + P' IS the Klein. P' COMPLETES the Klein.
 * ------------------------------------------------------------------- */
```

### Location B — Spanda seed totalization invariant
**After** the `Spanda_Stage` enum and **before** the `Trika_Position` enum in section `FR 2.1.2`.

### What to add

```c
/* -------------------------------------------------------------------
 * SPANDA_SEED_TOTALIZATION_INVARIANT
 *
 * The six coordinates forming the complete boundary of the QL field:
 *
 *   P0  — Position ground (Torus outward start)    TOPO_TORUS
 *   P5  — Position synthesis (Torus return point)  TOPO_TORUS
 *   P0' — Position ground inverted (Klein start)   TOPO_KLEIN
 *   P5' — Position synthesis inverted (Klein end)  TOPO_KLEIN
 *   C0  — Bimba (categorical ground / source)      TOPO_ZERO_SPHERE
 *   C5  — Pratibimba (categorical synthesis/refl.) TOPO_ZERO_SPHERE
 *
 * Invariant: (0/1) seed = P0 ↔ P5 = C0 ↔ C5
 *   The binary poles (0 and 1) ARE the ground and synthesis of the Torus
 *   (P0 and P5), which ARE the Bimba and Pratibimba (C0 and C5).
 *   "0 and 1 are equal to 5 and 0" — they are the same oscillation at
 *   different ontological registers. The Spanda seed totalizes the system
 *   by simultaneously encapsulating both registers.
 *
 * These six coordinates are the only ones that can validly claim
 * TOPO_ZERO_SPHERE (C0/C5) or serve as the seed boundary (P0/P5/P0'/P5').
 * All other coordinates are TOPO_TORUS (P normal), TOPO_KLEIN (P'),
 * or TOPO_LEMNISCATE (P4 specifically).
 * ------------------------------------------------------------------- */
```

---

## Change 3 — `src/families.c`

### Location
Inside the `families_init()` loop, **after** the `coord->cf` assignment (line 48).

### What to add
A TOPO_MODE assignment block for each coordinate, based on family + position + (eventually) inversion:

```c
/* Set topological modality — inner reality of P/P' families.
 * For now, inversion_state is always 0 at init (PRATIBIMBA copies;
 * P' coordinates are created separately when # is applied).
 * P-family gets the canonical topological modes; all others TOPO_TORUS
 * by default (inherit by resonance through the P crosslink). */
if (families[f] == FAMILY_P) {
    if (pos == 4) {
        /* #4 is the Lemniscate anchor: genus-2 nesting, cf-chain entry,
         * C' (reflective coords: cpf/ct/cp/cf/cfp/cs) gateway.
         * Already embedded in pointer logic — made explicit here. */
        SET_TOPO_MODE(coord, TOPO_MODE_LEMNISCATE);
    } else {
        /* P outward phase = Torus single-cover */
        SET_TOPO_MODE(coord, TOPO_MODE_TORUS);
    }
} else if (families[f] == FAMILY_C && (pos == 0 || pos == 5)) {
    /* C0 (Bimba) and C5 (Pratibimba): the Spanda seed boundary poles.
     * These are the categorical registration of the (0/1) seed:
     * C0 = source ground, C5 = reflection synthesis.
     * P0/P5 are their positional counterparts. Together: the totalizing
     * encapsulation of the Spanda oscillation across both registers. */
    SET_TOPO_MODE(coord, TOPO_MODE_ZERO_SPHERE);
} else {
    /* All other coordinates default to Torus modality.
     * When # (inversion) is applied to create P' coordinates,
     * SET_TOPO_MODE(coord, TOPO_MODE_KLEIN) must be called there. */
    SET_TOPO_MODE(coord, TOPO_MODE_TORUS);
}
```

### Note on P' (Klein) assignment
P' coordinates (inversion_state=1) do not exist at `families_init()` time — they are created
when the `#` operator is applied to a P coordinate. The site that flips `inversion_state` (the
Execute_Hash function or equivalent) must also call `SET_TOPO_MODE(coord, TOPO_MODE_KLEIN)`.
This is a **deferred** assignment — noted here for when # operator execution is implemented.

---

## Change 4 — `docs/dev/core/ql-bimba-seed-map.json` (documentation)

Update the `topology` section to correct the Klein description and add the seed totalization:

```json
"klein_bottle": {
    "note_correction": "Klein = P + P' combined (NOT P' alone). P alone IS the Torus. P' COMPLETES the Klein.",
    "p_prime_role": "Each P' coordinate IS in Klein mode — it is the return/inward phase that, together with P, forms the non-orientable double-cover surface."
},
"spanda_seed_totalization": {
    "six_boundary_coords": ["P0", "P5", "P0'", "P5'", "C0", "C5"],
    "invariant": "(0/1) seed = P0 ↔ P5 = C0 ↔ C5: the binary poles ARE the torus boundary AND the Bimba/Pratibimba pair",
    "topo_modes": {
        "P0": "TOPO_TORUS (boundary: outward ground)",
        "P5": "TOPO_TORUS (boundary: outward synthesis / Möbius return)",
        "P0'": "TOPO_KLEIN (boundary: inward ground)",
        "P5'": "TOPO_KLEIN (boundary: inward synthesis — the Klein twist)",
        "C0": "TOPO_ZERO_SPHERE (Bimba: categorical source)",
        "C5": "TOPO_ZERO_SPHERE (Pratibimba: categorical reflection)"
    }
}
```

---

## Execution Order

```
1. include/ontology.h   — add TOPO_MODE_* macros + GET/SET (no struct change)
2. include/m1.h         — add Spanda chain comment + totalization invariant
3. src/families.c       — add SET_TOPO_MODE block inside init loop
4. docs/dev/core/ql-bimba-seed-map.json — update topology section
5. Build + run test_pillar1 — verify no regressions
```

---

## What is NOT changing

| Thing | Status | Why |
|-------|--------|-----|
| HC struct size (128 bytes) | Unchanged | Only flags bits 7-6 used — already in flags byte |
| `cf → &Psychoid_4` | Already correct | Lemniscate link already in families.c:48 |
| `HAS_NESTING_ACCESS(coord)` | Already correct | #4 nesting already enforced in ontology.h |
| C' (cpf/ct/cp/cf/cfp/cs) fields | Already in HC | Reflective coordinate slots exist |
| RING_SIZE=12, QL_POSITIONS=6 | Already correct | Klein/Torus math already in m1.h |
| SPANDA_SEED_BITS=0x03 | Already correct | Both-poles fused already correct |
| `_Static_assert` checks | Unaffected | No struct layout changes |
| Existing test_pillar1 tests | Should pass | Only additive changes |

---

## Build Verification

```bash
clang -std=c11 -Wall -Wextra -I include \
    -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c \
    src/families.c src/test_pillar1_gaps.c \
    -o test_pillar1 && ./test_pillar1

# Expected: all 109 tests pass, no new warnings
```

---

*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/`
*Implements:* Pillar I topological mode extension (post FR 1.6)
*Prerequisite:* All Pillar I FRs (1.1–1.6) complete ✓
