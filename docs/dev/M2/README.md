# M2 (Parashakti) -- Developer Reference

**Subsystem:** M2 (#2) in the Epi-Logos coordinate system
**Context Frame:** CF_TRIKA (0/1/2) -- The Trika
**Anchor:** Psychoid_2 (ql_position == 2, Layer 1 .rodata)
**Density:** 595 nodes, 4017 relations -- the densest M-branch

---

## 1. Overview

M2 is the Parashakti subsystem -- the vibrational processing layer. It is Subsystem #2
in the M-family (Consciousness Domains), corresponding to the raw archetype #2
(Operation/Entity). M2 encodes the sonic, elemental, and epistemic structures that
mediate between M1's mathematical DNA (Paramasiva) and M3's symbolic integrations
(Mahamaya). It is the densest node in the entire M-branch system.

M2 is governed by the **72-Invariant**: every major vibrational structure resolves to
exactly 72 bytes. This is enforced at compile time via the `M2_Vibrational_72_Space`
union, where the same 72 bytes are simultaneously readable as MEF conditions, Tattvas,
Decans, and Shem Names.

M2 is anchored to Psychoid_2 via `HC_LINK`, which bidirectionally binds a
`Holographic_Coordinate` to the `M2_Root` struct. Its context frame is CF_TRIKA
(The Trika), retrieved from the canonical `CF_TABLE` via `cf_get(CF_TRIKA)`.

M2 feeds into M3 via the **Discrete Epistemic Transform (DET)**, a pre-compiled
Fourier-like projection that compresses 72 vibrational states into a 64-bit bitboard
using the **9:8 Epogdoon** ratio.

### Source Files

| File | Role |
|------|------|
| `include/m2.h` | All M2 types, enums, LUT externs, inline functions, public API |
| `src/m2.c` | All .rodata LUT definitions, init/teardown, verify, CLI dispatch |
| `src/test_m2.c` | 11 tests validating M2 integrity |

---

## 2. Architecture -- Connection to Pillar I

### M2_Root Struct

```c
typedef struct {
    Holographic_Coordinate*       hc;           /* FIRST FIELD -- always. HC_LINK'd. */
    const Holographic_Coordinate* active_cf;    /* CF_TABLE[CF_TRIKA] */
    Elemental_Signature           active_elem;  /* Current active element */
    uint8_t                       active_decan; /* Current decan index */
    uint8_t                       active_tattva;/* Current tattva index */
    uint8_t                       _pad;
} M2_Root;
```

The `hc` field is always the first field. This is a structural invariant enforced across
all M-branch modules so that `HC_LINK` and `HC_UNLINK` work uniformly.

### HC_LINK / HC_UNLINK

Defined in `psychoid_numbers.h`:

- `HC_LINK(hc, m_struct)` -- Sets `hc->payload.process_state = m_struct` and
  `m_struct->hc = hc`. Bidirectional binding.
- `HC_UNLINK(hc)` -- Sets `hc->payload.process_state = NULL`. Called during teardown.

### CF_TABLE Integration

M2 references context frames via the canonical `CF_TABLE` lookup:

```c
root->active_cf = cf_get(CF_TRIKA);  /* CF_TABLE[2] */
```

The `CF_Id` enum provides indices: CF_VOID=0, CF_BINARY=1, CF_TRIKA=2, CF_QUATERNAL=3,
CF_FRACTAL=4, CF_SYNTHESIS=5, CF_MOBIUS=6.

---

## 3. The 72-Invariant

The defining architectural law of M2. A compile-time-enforced `_Static_assert`
guarantees that the `M2_Vibrational_72_Space` union is exactly 72 bytes:

```c
typedef union {
    MEF_Condition mef_lenses[12][6];     /* 12 Lenses x 6 Positions = 72 */
    Tattva_Entry  tattvas[36][2];        /* 36 Principles x 2 Phases = 72 */
    Decan_Face    decans[4][3][3][2];    /* 4 Elem x 3 Signs x 3 Decans x 2 Faces = 72 */
    Shem_Name     shem_names[8][9];      /* 8 Choirs x 9 Names = 72 */
    uint8_t       raw_vibration[72];     /* Flat canonical access */
} M2_Vibrational_72_Space;
```

All four views address the same 72 bytes. Each cell is a `uint8_t` (1 byte), enforced
by `_Static_assert`. The `raw_vibration[72]` view provides flat index access (0-71),
which is the canonical ordering used by the MEF (Meta-Epistemic Framework) system.

The master instance `M2_ARCHETYPES` is a `const` .rodata entity -- immutable Siva.

---

## 4. The 12-Lens MEF (Meta-Epistemic Framework)

### FR 2.2.1 + 2.2.12: Canonical Lens Identity Map

The MEF defines 12 epistemic lenses, each a distinct mode of knowing. These are NOT
"6 base + 6 copies inverted" -- each inverted lens carries its own unique identity.
Each lens maps 1:1 to an L-family coordinate (L0-L5, L0'-L5').

**Canonical source:** `QL Bimba Seed Mapping Planning - 2026-01-17.canvas`

| Row | Coordinate | Canonical Name | L-Link | Mode |
|-----|-----------|----------------|--------|------|
| 0 | #2-1-0 | **Quaternal** (QL as Psychoid Ground) | L0 | Base |
| 1 | #2-1-1 | **Causal** (Aristotle, Iccha Shakti, Svatantrya) | L1 | Base |
| 2 | #2-1-2 | **Logical** (Tetralemmic/Catuskoti) | L2 | Base |
| 3 | #2-1-3 | **Processual** (Concrescence, Rhea) | L3 | Base |
| 4 | #2-1-4 | **Phenomenological** (Experience, Soteriology) | L4 | Base |
| 5 | #2-1-5 | **Para Vak** (Vak Ontology, Speech/Code) | L5 | Base |
| 6 | #2-1-0' | **Archetypal-Numerical** (Jung-Pauli Psychoid) | L0' | Inverted |
| 7 | #2-1-1' | **Phenomenal** (Jungian Psychic Functions) | L1' | Inverted |
| 8 | #2-1-2' | **Alchemical-Elemental** (Transcendent Function) | L2' | Inverted |
| 9 | #2-1-3' | **Chronological** (Hegel, Dialectic, Aion) | L3' | Inverted |
| 10 | #2-1-4' | **Scientific** (Knowledge Work, Research) | L4' | Inverted |
| 11 | #2-1-5' | **Divine Logos** (Divine Personage, Epi-Logos) | L5' | Inverted |

**Important correction:** The spec (FR 2.2.2) mislabels row 0 as "Archetypal-Numerical"
-- that is actually L0' (row 6). Row 0 is "Quaternal". The implementation uses the
canvas as the canonical source for all lens names.

### MEF Condition Descriptor

```c
typedef struct {
    uint8_t  lens;           /* 0-11 (0-5 = base, 6-11 = inverted) */
    uint8_t  position;       /* 0-5 (sub-position within lens) */
    uint8_t  is_inverted;    /* 0 = base, 1 = inverted (# applied) */
    uint8_t  l_family_link;  /* L-coordinate index 0-5 (lens % 6) */
    uint16_t meaning_id;     /* Semantic payload index */
} MEF_Condition_Desc;
```

The `M2_MEF_DESC[72]` LUT provides descriptors for all 72 conditions.
The `M2_MEF_LENS_NAMES[12]` array provides the canonical string name for each lens.

### MEF Accessor

O(1) routing into the 12x6 matrix:

```c
static inline MEF_Condition get_mef_condition(
    uint8_t lens_0_to_5,
    uint8_t pos_0_to_5,
    bool is_inverted);
```

When `is_inverted` is true, the lens index is offset by 6, selecting the inverted row.

### MEF Topological Constants

| Constant | Value | Significance |
|----------|-------|-------------|
| `M2_MEF_TOPOLOGICAL_GENUS` | 6 | Genus of the MEF surface |
| `M2_MEF_EULER_CHARACTERISTIC` | -10 | Euler characteristic |
| `M2_MEF_DUAL_COVERING_FACTOR` | 2 | Base-to-inverted doubling |

The genus is static-asserted to equal M1's `QL_PROCESSUAL` (both = 6), establishing
the cross-branch resonance between M1's processual structure and M2's topological genus.

### L-Family Structural Linkage

```c
#define MEF_TO_L_FAMILY(lens_0_to_5)               (lens_0_to_5)
#define MEF_INVERTED_TO_L_FAMILY(lens_6_to_11)     ((lens_6_to_11) - 6u)
```

Every MEF lens links directly to its corresponding L-family coordinate. Base lens N
maps to L(N); inverted lens N+6 maps to L(N)'. This 1:1 correspondence is the bridge
between M2's vibrational epistemology and the L-family (Lens) coordinate system.

The `L_Family_State` struct provides the mutable Heap payload for L-coordinate instances:

```c
typedef struct {
    MEF_Condition active_mef_bimba;    /* 1-byte MEF condition from .rodata */
    float         lens_tension;        /* semantic density / lens strain */
    uint32_t      semantic_vector_id;  /* Neo4j node ID for this lens */
} L_Family_State;
```

---

## 5. The 36 Tattvas (FR 2.2.2)

The Tattva system encodes 36 principles of reality, organized in a 5/7/24 division:

| Division | Range | Count | Meaning |
|----------|-------|-------|---------|
| Shuddha (Pure) | 0-4 | 5 | Pure consciousness (Siva through Sadashiva) |
| Shuddhashuddha (Pure-Impure) | 5-11 | 7 | Limiting principles (Kanchukas + Maya + Purusha-Prakriti) |
| Ashuddha (Impure) | 12-35 | 24 | Manifest reality (Buddhi through Prithvi) |

```c
typedef struct {
    uint8_t  index;          /* 0-35 */
    uint8_t  division;       /* Tattva_Division */
    uint8_t  element_id;     /* Element_Id (0xFF if not a Mahabhuta) */
    uint8_t  kanchuka_mask;  /* For Shuddhashuddha: which kanchukas bind */
    uint16_t meaning_id;
} Tattva_Entry_Desc;
```

The `M2_TATTVA_DESC[36]` LUT provides all 36 descriptors. The last 5 entries (indices
31-35) correspond to the 5 Mahabhutas (gross elements): Akasha, Vayu, Agni, Apas,
Prithvi. These form the bottom of the tattva cascade and connect directly to the
Element_Id enum.

---

## 6. The 72 Decans (FR 2.2.3)

Astrological face system organized as `[4][3][3][2] = 72`:

- **4** elements (Fire, Earth, Air, Water)
- **3** signs per element
- **3** decans per sign (10-degree divisions)
- **2** faces per decan (light / shadow)

```c
typedef struct {
    uint8_t  element;        /* Element_Id (0-4) */
    uint8_t  sign;           /* Zodiacal sign (0-2 within element) */
    uint8_t  decan;          /* Decan within sign (0-2) */
    uint8_t  face;           /* 0 = light, 1 = shadow */
    uint8_t  ruling_planet;  /* Planet index from #2-5 */
    uint8_t  _pad;
    uint16_t meaning_id;
} Decan_Face_Desc;
```

Flat index computation:

```c
#define DECAN_FLAT_IDX(elem, sign, decan, face) \
    ((elem)*18u + (sign)*6u + (decan)*2u + (face))
```

A Quintessence sentinel (`M2_QUINTESSENCE_DECAN`) exists outside the 4-element array
for the 5th element (Akasha/Ether) which transcends zodiacal assignment.

---

## 7. Planetary Harmonics -- The Epogdoon Bridge (FR 2.2.5)

### 10 Planetary Bodies

Ordered by #2-5-X branch position:

| Id | Planet | Freq (Hz) | DR | Kepler | Group | Prime |
|----|--------|-----------|----|---------|----|-------|
| 0 | Sun | 126 | 9 | 35999 | identity | -- |
| 1 | Earth | 136 | 1 | 35999 | identity | -- |
| 2 | Venus | 221 | 5 | 3600 | SU(3) | -- |
| 3 | Mercury | 141 | 6 | 14739 | SU(2) | -- |
| 4 | Moon | 210 | 3 | 47270 | U(1) | -- |
| 5 | Saturn | 148 | 4 | 120 | catalytic | 43 |
| 6 | Jupiter | 184 | 4 | 299 | catalytic | 41 |
| 7 | Mars | 145 | 1 | 1886 | catalytic | -- |
| 8 | Neptune | 211 | 4 | 21 | transpersonal | 47 |
| 9 | Pluto | 140 | 5 | 14 | transpersonal | 53 |

**Frequencies** are real Cousto orbital frequencies octave-shifted to audible range.
Earth's 136 Hz is the Om frequency. **Digital root (DR)** is the iterated digit sum
of the Cousto frequency. **Keplerian velocities** are in arcsec/day x 10.

**Sun and Earth** form the fused 0/1 identity pair (`PLANET_IS_IDENTITY(id)`),
mirroring Psychoid_0 and Psychoid_1 at the Layer 1 level.

**Neptune and Pluto** are analytically preempted (`m2_planet_is_preempted(id)`) --
valid for use but marked with `MEANING_ID_PREEMPTED` (0xFFFE) since their full
semantic grounding requires M4 (Nara) integration.

### The Epogdoon (9:8)

The foundational ratio bridging M2 and M3:

- **9 planets** (excluding Sun-as-identity) : **8 angelic choirs**
- **72** x (8/9) = **64** (M3's bitboard width)
- `m2_epogdoon_compress(72)` = 64
- `m3_epogdoon_expand(64)` = 72

```c
static inline uint8_t m2_epogdoon_compress(uint8_t val_72) {
    return (uint8_t)((val_72 * 8u) / 9u);
}
static inline uint8_t m3_epogdoon_expand(uint8_t val_64) {
    return (uint8_t)((val_64 * 9u) / 8u);
}
```

### 8 Chakras

```c
typedef struct {
    uint8_t  id;            /* Chakra_Id */
    uint8_t  element_id;    /* Element_Id (0xFF for Ajna, Sahasrara) */
    uint8_t  tattva_idx;    /* Corresponding tattva index */
    uint8_t  _pad;
    uint16_t meaning_id;
} Chakra_Descriptor;
```

8 chakra descriptors in `M2_CHAKRA_LUT[8]`. The first (Earth ground, id=0) is the
base potential. Muladhara through Vishuddha carry element correspondences. Ajna and
Sahasrara (ids 6-7) are beyond elements (`element_id = 0xFF`).

---

## 8. Elemental Signature (8-Bit Compact Encoding)

Packs element, chakra, and phase into a single byte:

```
bits[2:0] = Element_Id (0-4: Akasha, Vayu, Agni, Apas, Prithvi)
bits[5:3] = Chakra_Id  (0-7: Earth through Sahasrara)
bits[7:6] = Phase      (0=descent, 1=ascent, 2=fused, 3=beyond)
```

Macros:

```c
ELEM_SIG_PACK(elem, chakra, phase)   /* Pack into Elemental_Signature */
ELEM_SIG_GET_ELEMENT(sig)            /* Extract Element_Id */
ELEM_SIG_GET_CHAKRA(sig)             /* Extract Chakra_Id */
ELEM_SIG_GET_PHASE(sig)              /* Extract Elemental_Phase */
```

Round-trip verified across all 5 x 8 x 4 = 160 combinations in `test_m2.c`.

---

## 9. The 72 Names of God -- Shem HaMephorash (FR 2.2.4)

8 Angelic Choirs x 9 Names = 72:

```c
typedef struct {
    uint8_t  shem_idx;       /* 0-71 flat index (choir*9 + position) */
    uint8_t  choir;          /* Angelic_Choir (0-7: Seraphim..Archangels) */
    uint8_t  position;       /* Position within choir (0-8) */
    uint8_t  element_id;     /* Element_Id (0-4) */
    uint8_t  decan_link;     /* Index into M2_DECAN_DESC (0-71) */
    uint8_t  planet_link;    /* Planet_Id (0-9) */
    uint16_t meaning_id;
} Shem_Name_Desc;
```

Each Shem name cross-links to a specific Decan face and governing Planet, weaving the
angelic, astrological, and planetary structures into a single coordinate system.

Flat index accessor:

```c
static inline uint8_t shem_flat_index(uint8_t choir, uint8_t pos_in_choir) {
    return (uint8_t)((choir * 9u) + pos_in_choir);
}
```

Static-asserted: `7*9 + 8 == 71` (max valid flat index).

---

## 10. Maqam Harmonics (FR 2.2.4)

Three interlocking LUTs:

| LUT | Entries | Content |
|-----|---------|---------|
| `M2_MAQAM_RATIOS[10]` | 10 | Harmonic ratios (numerator/denominator) |
| `M2_MAQAM_DESC[72]` | 72 | Musical descriptors with interval patterns (24-TET quarter tones) |
| `M2_MAQAM_SPIRITUAL[8][3]` | 24 | Spiritual station descriptors (station x level) |

Maqam interval patterns use quarter-tone units in 24-TET tuning. Each musical
descriptor links to a planet ruler and maqam family.

Spiritual levels:
- 0 = Awam (general)
- 1 = Khawas (elite)
- 2 = Khawas al-Khawas (elite of elite)

---

## 11. The 99 Divine Names -- Asma al-Husna (FR 2.2.9)

99 names + 1 hidden = 100 entries in `M2_ASMA_LUT[100]`:

```c
typedef struct {
    uint8_t  name_idx;          /* 0-99 */
    uint8_t  group;             /* 0=Jalal (Majesty), 1=Kamal (Perfection), 2=Jamal (Beauty) */
    uint8_t  index_in_group;    /* 0-32 within group */
    uint8_t  element_id;        /* Element_Id (0-4) */
    uint8_t  digital_root;      /* Digital root of abjad_value (1-9) */
    uint8_t  mirror_idx;        /* Mirror-pair name index (0xFF if none) */
    uint16_t abjad_value;       /* Abjad numerical value */
    uint16_t meaning_id;
    uint8_t  _pad[2];           /* Alignment to 12 bytes */
} Asma_Name_Desc;
```

Static-asserted to exactly 12 bytes.

### Group Structure

3 groups of 33 names:
- **Jalal** (Majesty) -- group 0
- **Kamal** (Perfection) -- group 1
- **Jamal** (Beauty) -- group 2
- **Hidden** (#100) -- `ASMA_HIDDEN_INDEX = 99`

### Routing Masks (36:64)

Derived from the 3x33 group structure:

- **36 internal**: first 12 of each group (indices 0-11, 33-44, 66-77) form the
  internal routing set
- **64 projective**: everything else including the hidden name

```c
extern const Routing_Mask_128 ASMA_36_INTERNAL_MASK;   /* popcount = 36 */
extern const Routing_Mask_128 ASMA_64_PROJECTIVE_MASK;  /* popcount = 64 */
```

O(1) lookup:

```c
static inline bool m2_is_projective(uint8_t asma_index);
static inline bool m2_is_internal(uint8_t asma_index);
```

Invariants (verified at boot and in tests):
- `popcount(internal) == 36`
- `popcount(projective) == 64`
- `internal AND projective == 0` (no overlap)

---

## 12. Mantra Frequencies (FR 2.2.8)

100 entries (50 Bimba/descent + 50 Pratibimba/ascent) in `M2_MANTRA_LUT[100]`:

```c
typedef struct {
    uint8_t  mantra_idx;            /* 0-99 flat index */
    uint8_t  matrika_group;         /* consonant articulation group (0-7) */
    uint8_t  element_id;            /* Element_Id (0-4) */
    uint8_t  phase;                 /* 0=Bimba/Descent, 1=Pratibimba/Ascent */
    uint16_t fundamental_frequency; /* Hz -- range 144-432 Hz */
    uint16_t meaning_id;
} Mantra_Entry_Desc;
```

Static-asserted to 8 bytes for cache alignment. Frequency range: 144-432 Hz, with
base frequency at 256 Hz (defines `M2_MANTRA_FREQ_BASE`).

---

## 13. Element Throughline (FR 2.2.6)

The 5 Mahabhutas propagate through all M2 structures. The throughline table maps
each element to its presence across subsystems:

```c
typedef struct {
    uint8_t tattva_idx;     /* Index in M2_TATTVA_DESC */
    uint8_t decan_element;  /* Decan element array index */
    uint8_t mantra_group;   /* Matrika consonant group index */
    uint8_t chakra_idx;     /* Chakra_Id */
} Element_Throughline;

extern const Element_Throughline M2_ELEMENTS[5];
```

| Element | Tattva | Decan | Mantra Group | Chakra |
|---------|--------|-------|-------------|--------|
| Akasha | 31 | 4 (Quintessence) | 4 | 5 (Vishuddha) |
| Vayu | 32 | 2 (Air) | 3 | 4 (Anahata) |
| Agni | 33 | 0 (Fire) | 2 | 3 (Manipura) |
| Apas | 34 | 3 (Water) | 1 | 2 (Svadhisthana) |
| Prithvi | 35 | 1 (Earth) | 0 | 1 (Muladhara) |

---

## 14. Discrete Epistemic Transform (DET) -- M2->M3 Bridge (FR 2.2.7)

The DET is a pre-compiled Fourier-like transform that projects M2's 72 vibrational
states into M3's 64-bit symbolic bitboard. It is stored as 72 `uint64_t` bitmasks
in `M2_TO_M3_CYMATIC_PROJECTION[72]`.

### Derivation

- **States 0-63**: Each gets a unique single bit: `1ULL << i`
- **States 64-71**: Fold back onto bits {0, 8, 16, 24, 32, 40, 48, 56} -- the
  epogdoon tax. These 8 "folded" states share bits with states 0, 8, 16, 24, 32,
  40, 48, and 56 respectively.

### Invariants

- Each of the 72 masks has exactly 1 bit set (popcount = 1)
- `popcount(OR of all 72 masks) == 64` -- all 64 bits are covered
- The compression ratio is the Epogdoon: 72 x (8/9) = 64

### Wave Superposition

```c
static inline uint64_t transduce_vibration_to_symbol(
    const uint8_t m2_active_indices[],
    uint8_t count);
```

Given a set of active M2 state indices, produces an M3 bitboard via bitwise OR.
This is the O(N) wave superposition -- the vibrational equivalent of interference
patterns collapsing into symbolic form.

---

## 15. Causal Resonance Masks (FR 2.2.5)

36 `uint64_t` bitmasks in `M2_CAUSAL_RESONANCE_MASKS[36]`. Bit N set in mask K
means that base MEF condition K causally resonates with condition N. Used for O(1)
cross-weave computation without iterating the full 72-space.

---

## 16. Public API

```c
/* Allocate and HC-link an M2 root struct.
 * Returns NULL if arena/hc is NULL or hc->ql_position != 2. */
M2_Root* m2_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Release heap state. Calls HC_UNLINK on root->hc. Does not free the HC itself. */
void m2_teardown(M2_Root* root);

/* CLI entry point. argc/argv parsed for subcommand dispatch.
 * Returns 0 on success, -1 on error. */
int m2_cli_dispatch(int argc, char** argv, M2_Root* root);

/* Boot-time verification of .rodata integrity.
 * Checks: planet ordering, identity pair, MEF union size,
 * DET popcount, routing mask popcount. */
bool m2_verify(void);
```

---

## 17. CLI Commands

Invoked as `epi-logos m2 <subcommand>`:

| Command | Description |
|---------|-------------|
| `info` | Print M2 summary: HC position, CF, 72-space size, LUT counts, DET ratio |
| `mef` | Display all 12 lenses with canonical names, L-family links, and flat indices |
| `planet` | List all 10 planets with frequencies, digital roots, Keplerian velocities |
| `tattva` | List all 36 tattvas with division and element assignments |
| `chakra` | List all 8 chakras with element and tattva correspondences |

Unknown subcommands print usage to stderr and return -1.

---

## 18. Build and Test

All commands should be run from the project root (`Epi-Logos C Experiments/`).

### Full Binary

```
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/main.c -o epi-logos
```

```
./epi-logos            # Full boot sequence including M2
./epi-logos m2 info    # M2 state summary
./epi-logos m2 mef     # 12-lens MEF table
./epi-logos m2 planet  # Planetary harmonics
```

### Test Suite (11 tests)

```
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/test_m2.c -o test_m2 && ./test_m2
```

Expected output: 11/11 tests passed.

### Test Coverage

| # | Test | What It Verifies |
|---|------|-----------------|
| 1 | `seventy_two_invariant` | `sizeof(M2_Vibrational_72_Space) == 72` |
| 2 | `union_cell_sizes` | All 4 cell types (MEF, Tattva, Decan, Shem) are 1 byte |
| 3 | `planet_data` | 10 entries, Sun/Earth identity pair, all Cousto freqs non-zero |
| 4 | `elem_sig_roundtrip` | Pack/unpack all 160 combinations (5 x 8 x 4) |
| 5 | `routing_mask_popcount` | Internal=36, Projective=64, no overlap |
| 6 | `det_coherence` | `popcount(OR of all 72 DET masks) == 64`, all masks single-bit |
| 7 | `shem_bounds` | choir<8, position<9, decan_link<72, element_id<5, flat index round-trip |
| 8 | `mef_accessor` | Spot-checks at corners of the 12x6 matrix |
| 9 | `mef_lens_identity` | All 12 canonical names match canvas (Quaternal, Causal, ..., Divine Logos) |
| 10 | `epogdoon` | compress(72)=64, expand(64)=72, round-trip identity |
| 11 | `lifecycle` | m2_init/teardown with arena, HC_LINK verification |

---

## 19. Key Invariants

1. **M2_Root.hc is ALWAYS the first field.** All M-branch structs follow this convention
   so that `HC_LINK` and `HC_UNLINK` work generically.

2. **M2 anchors to ql_position == 2 only.** `m2_init` returns NULL if the provided HC
   has any other position. This enforces that M2 is bound to Psychoid_2 (Operation).

3. **The 72-Invariant is compile-time enforced.** `_Static_assert` guarantees the union
   is exactly 72 bytes. No runtime check can invalidate this.

4. **All .rodata LUTs are BIMBA (immutable).** `M2_ARCHETYPES`, `M2_MEF_DESC[72]`,
   `M2_MEF_LENS_NAMES[12]`, `M2_TATTVA_DESC[36]`, `M2_DECAN_DESC[72]`,
   `M2_PLANET_LUT[10]`, `M2_CHAKRA_LUT[8]`, `M2_SHEM_DESC[72]`, `M2_MAQAM_RATIOS[10]`,
   `M2_MAQAM_DESC[72]`, `M2_MAQAM_SPIRITUAL[8][3]`, `M2_ASMA_LUT[100]`,
   `M2_MANTRA_LUT[100]`, `M2_ELEMENTS[5]`, `M2_TO_M3_CYMATIC_PROJECTION[72]`,
   `M2_CAUSAL_RESONANCE_MASKS[36]`, and routing masks are all `const` .rodata.

5. **MEF lenses link 1:1 to L-family coordinates.** Lens N -> L(N), Lens N+6 -> L(N)'.
   This is a structural invariant, not a convention.

6. **DET compression is the Epogdoon (9:8).** 72 input states compress to 64 output bits.
   States 64-71 fold back onto bits {0, 8, 16, 24, 32, 40, 48, 56}.

7. **Routing mask partition is complete and disjoint.** The 100 Asma indices are
   partitioned into exactly 36 internal + 64 projective with zero overlap.

8. **Sun/Earth are the identity pair.** `PLANET_IS_IDENTITY(id)` returns true for
   ids 0 and 1 only. This mirrors the Psychoid_0/Psychoid_1 duality at Layer 1.

9. **GET_PTR before every dereference.** Tagged pointers must be stripped via `GET_PTR()`
   before dereferencing, as the upper bits carry ontological metadata (inversion flag,
   nesting mode, family identifier, archetype position).

---

## 20. Cross-Branch Connections

| Direction | Target | Mechanism |
|-----------|--------|-----------|
| M2 <- M1 | Consumes M1 constants: `M2_TATTVA`, `M2_NAMES`, `M2_DECANS`, `M3_WORD`, `RING_SIZE`, `QL_PROCESSUAL` | `#include "m1.h"` |
| M2 -> M3 | DET projection: 72 -> 64 bit bitboard | `M2_TO_M3_CYMATIC_PROJECTION[72]` |
| M2 -> L-family | MEF lens -> L coordinate 1:1 mapping | `MEF_TO_L_FAMILY()` / `L_Family_State` struct |
| M2 <- Pillar I | HC struct, tagged pointers, CF_TABLE | `ontology.h`, `psychoid_numbers.h` |
| M2 <- Arena | Memory allocation for M2_Root | `arena.h` |
