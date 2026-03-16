# The Cosmic Clock — Full Architecture Specification

**Status:** Canonical (supersedes FR 2.3.5 `Unified_Clock_State` stub)
**Date:** 2026-03-12

> **Status Legend:**
> - `[canonical]` = architecturally defined, normative now
> - `[planned]` = designed but not yet implemented
> - `[partial]` = struct/spec exists, not fully wired
> - `[implemented]` = live in current codebase

**Coordinate:** #3-5 (The 360-Degree Synthesis Wheel) + #3-0 (Reception Ground anchor)
**Companion specs:** M1-paramasiva-mathematical-dna.md, M2-parashakti-vibrational-architecture.md,
  M3-mahamaya-symbolic-transcription.md, M4-nara-subtle-body-map.md
**Implements:** FR 2.3.5 (replaces), FR 2.3.7 (polar_opposite_su2 preserved), FR 2.3.8 (STATUS_PROVISIONAL preserved)

---

## 0. The Central Insight: 384 = 360 + 24 = 64 × 6

The Cosmic Clock's node count is not arbitrary. There are exactly **385 nodes** total:

```
360  degree nodes   — the dynamic transformation pathways (the clock face)
 24  backbone nodes — the stable amino acid anchors at 15° intervals
  1  central node   — the Axis Mundi / Quintessence (Akasha)
─────
385  total
```

The structural law, enforced at compile time:

```c
_Static_assert(360 + 24 == 64 * 6,
    "Clock topology: 360 degree nodes + 24 backbone nodes = 384 = 64x6 LINE_CHANGES");
```

**What this means:** The 384 I-Ching LINE_CHANGE transformations (every single-step codon
mutation: 64 hexagrams × 6 lines each) map exactly onto the 360 dynamic degrees + the 24
palindromic codon anchors. The 24 stable backbone nodes are the **unchanging** positions —
the palindromic codons that do not mutate — and 384 - 24 = 360 is the **dynamic** clock face.
The clock IS the complete I-Ching transformation space. This is not a metaphor.

The further identity: **384 - 24 = 360**, and **9 × 40 = 360**, and **40 = 4 + 12 + 24**
(quaternary + zodiacal + amino acid structure counts). The number 9 (Paramesvara,
archetypal completion) times 40 (the transformational totality) equals the clock.

---

## 1. The Central Node — Axis Mundi / Quintessence

### 1.1 Ontological Ground

The central node is **not on the clock face** — it is the still point around which the clock
turns. It is **geocentric Earth**: the observer's fixed position, not a datum point and not
an activation level. Earth = fixed center anchor / clock ground reference. Not an activation
level — the invariant base from which all dynamic elements are measured. All 9 observed
planets have current θ positions on the clock face (via Kerykeion degrees); Earth is the
reference point that makes those positions meaningful.

It corresponds to:

- **M0:** Archetype 9 (Paramesvara — the wholeness that cannot contain itself; `#0-2-9`)
  and the (0000) context frame (Receptive Dynamism, absolute ground)
- **M1:** #1-3-3 (Trika synthesis — the *first stable torus*, the moment Genus-0 sphere
  becomes Genus-1; the torus was born here)
- **M2:** Quintessence / Akasha — the fifth element that emerges when Fire/Earth/Air/Water
  achieve balance. Low variance in nucleotide balance = Akasha activation.
- **M3:** #3-0 (Reception Ground) — the `ANCHORS_SYNTHESIS_WHEEL` relation in
  `M3_Reception_Ground` points here. The center IS the reception ground.
- **M4:** The quaternionic identity **q = (1, 0, 0, 0)** — the ground state of the identity
  hash. No rotation, no orientation bias, pure balance.

### 1.2 Central Node Relations (canonical)

| Relation | From | To | Semantic |
|---|---|---|---|
| `ANCHORS_SYNTHESIS_WHEEL` | #3-0 | Central | M3 reception ground anchors the clock center |
| `FIRST_STABLE_TORUS` | #1-3-3 | Central | Spanda Trika synthesis births the torus |
| `PARAMESVARA_GROUND` | #0-2-9 | Central | Archetypal 9 = wholeness container |
| `QUINTESSENCE_EMERGENCE` | (4 elemental quadrant nodes) | Central | Balance of elements → Akasha |
| `ENNEADIC_HUB` | Central | 9 chamber boundaries | 9 × 40° chambers radiate outward |
| `SU2_POLE_NORTH` | Central | 0° backbone node | Upper SU(2) spinor pole |
| `SU2_POLE_SOUTH` | Central | 180° backbone node | Lower SU(2) spinor pole |
| `TORUS_MINOR_AXIS` | Central | M1 torus stage ring | The minor circle origin |
| `CONTEXT_FRAME_00` | Central | (0000) CF | Absolute ground context frame |

### 1.3 C Structure

```c
// ==============================================================================
// THE CENTRAL CLOCK NODE — Axis Mundi
// ==============================================================================
typedef struct {
    // M0 ground
    uint8_t  archetype_9_ref;      // index into ARCHETYPE_LUT (position 11 = Paramesvara)
    uint8_t  context_frame;        // CF_0000 = 0 (Receptive Dynamism)

    // M1 torus birth
    uint8_t  spanda_stage;         // SPANDA_TRIKA = 3 (first stable torus)
    float    quaternion_identity[4]; // {1.0f, 0.0f, 0.0f, 0.0f} — the identity

    // M2 Quintessence
    uint8_t  element;              // ELEMENT_AKASHA = 4 (emerges from elemental balance)
    float    akasha_threshold;     // variance threshold for quintessence emergence (M4)

    // M3 reception
    uint8_t  m3_reception_ref;     // pointer index to M3_Reception_Ground

    // Relations out
    uint16_t chamber_starts[9];    // degree 0 of each 40° enneadic chamber: 0,40,80...320
    uint16_t su2_north_degree;     // 0
    uint16_t su2_south_degree;     // 180
} Clock_Central_Node;

static const Clock_Central_Node CLOCK_CENTER; // .rodata
```

---

## 2. The Backbone Ring System — Four Nested Rings

The backbone has a nested structure where each outer ring is a **superset** of the inner:

```
Ring 0 (innermost): 4  Cardinal nodes — 0°, 90°, 180°, 270°  (seasonal pivots)
Ring 1:            12  Zodiacal nodes — every 30°             (sign entries)
Ring 2:            24  Amino acid nodes — every 15°           (hourly / amino acid)
Ring 3 (outermost): 360 Degree nodes — every 1°              (full clock face)
```

Ring 0 ⊂ Ring 1 ⊂ Ring 2 ⊂ Ring 3. The 4 cardinal nodes are zodiacal nodes. The 12 zodiacal
nodes are amino acid backbone nodes. The 24 backbone nodes are clock degree nodes. Every
inner-ring node IS an outer-ring node with additional semantic loading.

The `4 + 12 + 24 = 40` structure: one complete 40-day transformational arc is exactly the
count of the three backbone ring layers combined — a perfect recapitulation of the 9×40 = 360
structure in miniature.

### 2.1 Ring 0: The Four Cardinal / Seasonal Nodes (4 nodes, 90° intervals)

The four seasonal pivot points. Each initiates a new season (Cardinal modality). Their
elemental balance, when taken together, produces Quintessence at the center.

| Degree | Sign | Season | Element | Direction | M1 Ananda Stage | M0 Archetype |
|--------|------|--------|---------|-----------|-----------------|--------------|
| **0°** | Aries ♈ | Spring Equinox | Fire | East | Stage 0 | Archetype 0 (Sat/Ground) |
| **90°** | Cancer ♋ | Summer Solstice | Water | South | Stage 3 | Archetype 3 (Vak/Pattern) |
| **180°** | Libra ♎ | Autumn Equinox | Air | West | Stage 6 | Archetype 6 (Synthetic Emptiness) |
| **270°** | Capricorn ♑ | Winter Solstice | Earth | North | Stage 9 | Archetype 9 (Paramesvara) |

**Seasonal element correspondence to M1 Ananda matrix:**
- The 4 seasonal nodes align with the Ananda matrix Mod-4 context frame `(0/1/2/3)`.
- Their 4-fold balance IS the M3 (0/1/2/3) context frame — "Three Plus One" where M0
  (archetypal number) + M1 (quaternion math) + M2 (vibrational templates) integrate into
  M3 (the clock itself).
- The 4 quadrants (90° each) map directly to Jung's Quaternion: Fire=Intuition,
  Water=Feeling, Air=Thinking, Earth=Sensation.

```c
typedef struct {
    uint16_t degree;        // 0, 90, 180, 270
    uint8_t  sign_index;    // 0=Aries, 3=Cancer, 6=Libra, 9=Capricorn
    uint8_t  element;       // FIRE=0, WATER=3, AIR=2, EARTH=1
    uint8_t  direction;     // EAST=0, SOUTH=1, WEST=2, NORTH=3
    uint8_t  season;        // SPRING=0, SUMMER=1, AUTUMN=2, WINTER=3
    uint8_t  m1_stage;      // 0, 3, 6, 9
    uint8_t  m0_archetype;  // index into ARCHETYPE_LUT
    uint8_t  jung_function; // INTUITION=0, FEELING=1, THINKING=2, SENSATION=3
} Clock_Cardinal_Node;

static const Clock_Cardinal_Node CLOCK_CARDINAL[4]; // .rodata
```

### 2.2 Ring 1: The Twelve Zodiacal Nodes (12 nodes, 30° intervals)

Each zodiac sign node carries the M0 Vak grammar operator (from `ZODIACAL_LUT[12]`) that
defines its elemental-modal speech-act. These are the 12 sub-nodes of Archetype 3 (Vak,
`#0-3-6`) manifested as clock positions.

| Degree | Sign | Element | Mode | Vak Op | Ruling Planet | M1 Stage |
|--------|------|---------|------|--------|--------------|----------|
| 0° | Aries | Fire | Cardinal | `!` | Mars | 0 |
| 30° | Taurus | Earth | Fixed | `?` | Venus | 1 |
| 60° | Gemini | Air | Mutable | `!-` | Mercury | 2 |
| 90° | Cancer | Water | Cardinal | `-?` | Moon | 3 |
| 120° | Leo | Fire | Fixed | `!?` | Sun | 4 |
| 150° | Virgo | Earth | Mutable | `?-` | Mercury | 5 |
| 180° | Libra | Air | Cardinal | `-!` | Venus | 6 |
| 210° | Scorpio | Water | Fixed | `?!` | Mars | 7 |
| 240° | Sagittarius | Fire | Mutable | `-!/!-` | Jupiter | 8 |
| 270° | Capricorn | Earth | Cardinal | `-?/?-` | Saturn | 9 |
| 300° | Aquarius | Air | Fixed | `!?/?!` | Saturn | 10 |
| 330° | Pisces | Water | Mutable | `?!/!?` | Jupiter | 11 |

**Three seasonal triads (connected to M3 three-frame architecture):**
- Spring triad (0°-90°): Aries-Taurus-Gemini — Fire/Earth/Air rising
- Summer triad (90°-180°): Cancer-Leo-Virgo — Water/Fire/Earth culminating
- Autumn triad (180°-270°): Libra-Scorpio-Sagittarius — Air/Water/Fire descending
- Winter triad (270°-360°): Capricorn-Aquarius-Pisces — Earth/Air/Water returning

Each triad = 120° = one trine aspect = one M3 context frame layer. Three triads = the Trika
(M0-M1-M2) fully expressed through M3's clock.

```c
typedef struct {
    uint16_t degree;            // 0, 30, 60, ... 330
    uint8_t  sign_index;        // 0-11
    char     sign_name[16];     // "Aries", "Taurus", etc.
    char     sign_symbol[4];    // "♈", "♉", etc. (UTF-8, max 4 bytes)
    uint8_t  element;           // FIRE/EARTH/AIR/WATER (0-3)
    uint8_t  mode;              // CARDINAL=0, FIXED=1, MUTABLE=2
    uint8_t  vak_op_index;      // index into ZODIACAL_LUT (0-11)
    const char* vak_symbol;     // "!", "?", "!-", etc.
    uint8_t  ruling_planet;     // Planet_Id (SUN=0, VENUS=2, MERCURY=3, etc.)
    uint8_t  m1_stage;          // 0-11 (Ananda stage at sign entry)
    uint8_t  seasonal_triad;    // 0=Spring, 1=Summer, 2=Autumn, 3=Winter
    uint8_t  triad_position;    // 0=first, 1=middle, 2=last within triad
} Clock_Zodiac_Node;

static const Clock_Zodiac_Node CLOCK_ZODIAC[12]; // .rodata
```

### 2.3 Ring 2: The Twenty-Four Amino Acid / Hourly Backbone Nodes (24 nodes, 15° intervals)

The 24-fold backbone connects the genetic code (M3) to the body (M4 medicine). At 15°
intervals, these nodes are the **palindromic codon anchors** — the 24 stable positions that
do not appear in the 360 dynamic degrees but hold the clock's structural integrity.

24 = amino acids = hours in a day = the "council of time" (Revelation's 24 elders).
The 15° × 24 = 360 division is Lens #8 in the 16-fold system.

```c
typedef struct {
    uint16_t degree;            // 0, 15, 30, 45, ... 345
    uint8_t  amino_acid_id;     // 0-23
    char     amino_acid_name[16]; // "Alanine", "Cysteine", etc.
    char     single_letter;     // 'A', 'C', 'D', ...
    uint8_t  codons[4];         // up to 4 codons encoding this AA (0xFF = unused)
    uint8_t  codon_count;       // how many codons encode this AA (1-4+stop)
    uint8_t  element;           // elemental quality of this amino acid
    uint8_t  chakra_id;         // from M4 medicine AMINO_ACID → CHAKRA chain
    uint8_t  zodiac_sign;       // 0-11 (which sign this backbone node falls in)
    uint8_t  hour_of_day;       // 0-23 (kairotic hour correspondence)
    bool     is_zodiac_node;    // true if degree is multiple of 30° (Ring 1 node)
    bool     is_cardinal_node;  // true if degree is multiple of 90° (Ring 0 node)
} Clock_Backbone_Node;

static const Clock_Backbone_Node CLOCK_BACKBONE[24]; // .rodata

// ==============================================================================
// AMINO ACID BODY MAP — M4 medicine bridge
// The full chain: backbone degree → amino_acid → ruling_chakra → body_zones → herbs
// Canonical source for M4 medicine.rs prescriptions and M4SpinePlugin visualization.
// ==============================================================================
typedef struct {
    uint8_t  amino_acid_id;         // 0-23 (matches CLOCK_BACKBONE index)
    char     single_letter;         // 'A', 'C', 'D', ...
    uint16_t backbone_degree;       // 0, 15, 30, ..., 345
    uint8_t  ruling_chakra;         // Chakra_Id: which chakra this amino acid resonates with
    uint8_t  element;               // A=Fire/nn, T=Earth/pp, C=Air/pn, G=Water/np (nucleotide family)
    const char* body_zones[4];      // anatomical zones (from parashakti DECAN_BODY_PARTS dataset)
    const char* herbs[3];           // herbalism associations (from DECAN_HERBS dataset)
} Amino_Acid_Body_Map;

// 24-entry LUT generated by build_clock_degree_lut.py from M3 backbone + M4 CHAKRA_BODY_ZONES[8].
// Maps every backbone position to its full medicine context.
extern const Amino_Acid_Body_Map AMINO_ACID_BODY_ZONES[24];
```

**Compile-time verification of nested structure:**
```c
_Static_assert(24 % 12 == 0, "24 backbone nodes must evenly contain 12 zodiac nodes");
_Static_assert(12 % 4  == 0, "12 zodiac nodes must evenly contain 4 cardinal nodes");
_Static_assert(360 % 24 == 0, "360 degree nodes must evenly span 24 backbone intervals");
```

---

## 3. The 360 Degree Nodes — The Dynamic Clock Face

Each degree carries the full cross-referenced data from all four M-layers. Together they
form the transformation space where tarot, codon, hexagram, decan, zodiac, and amino acid
coordinate data converge at a single angular position.

### 3.1 C Structure

```c
// ==============================================================================
// THE CLOCK DEGREE NODE — one entry per degree, 360 total, .rodata
// ==============================================================================
typedef struct {
    // Identity
    uint16_t degree;                // 0-359

    // Ring membership (which backbone ring structures this degree belongs to)
    uint8_t  zodiac_sign;           // 0-11: which of the 12 signs
    uint8_t  zodiac_degree;         // 0-29: degree within that sign
    uint8_t  decan_index;           // 0-35: which of the 36 decans
    uint8_t  decan_position;        // 0-9: degree within that decan
    uint8_t  nearest_backbone;      // 0-23: index into CLOCK_BACKBONE[24]
    bool     is_backbone_node;      // true if this IS a backbone node (degree % 15 == 0)

    // M3 data — primary clock face content
    uint8_t  tarot_card_id;         // 0-55: Minor Arcana from GOVERNS_DEGREE_ARC
    uint8_t  codon_upper_pair;      // 2-bit nucleotide (0=A, 1=T, 2=C, 3=G)
    uint8_t  codon_lower_pair;      // 2-bit nucleotide
    uint8_t  hexagram_id;           // 0-63: RESOLVES_TO hexagram
    uint8_t  hexagram_line_active;  // 0-5: which line is at this degree within the hex
    bool     is_non_dual_codon;     // true if the codon at this position is palindromic

    // M2 data — vibrational/elemental layer
    uint8_t  decan_element;         // FIRE/EARTH/AIR/WATER/AKASHA (0-4)
    uint8_t  decan_planet;          // Planet_Id of decan ruler
    uint8_t  decan_chakra;          // Chakra_Id from PLANET_CHAKRA[decan_planet]
    // NOTE: MEF conditions are NOT pre-baked here. MEF lenses are analytical observation
    // modes applied dynamically by the AI agent after the fact — they are the most
    // semantically rich layer and must remain fluid. Natural resonances between clock
    // degrees/hexagrams/codons and MEF conditions are expressed in the lens definitions
    // (CLOCK_LENSES[16]) and applied per-query, not frozen into the degree LUT.

    // M1 data — mathematical/harmonic layer
    uint8_t  m1_torus_stage;        // 0-11: Ananda stage (degree / 30)
    uint8_t  m1_ananda_value;       // get_ananda_harmonic(ANANDA_BIMBA, stage, decan%12)
    uint8_t  dr_ring;               // 0=Mahamaya {1,2,4,8,7,5} or 1=Parashakti {3,6,9}

    // M0 data — archetypal number language
    uint8_t  m0_archetype;          // 0-11: which Archetype_LUT entry governs this degree
    uint8_t  m0_vak_operator;       // 0-11: Vak operator index for this degree's sign

    // 16-Lens membership — which segment of each division this degree falls in
    // lens_segment[n] = which of the (16-n)th division's segments this degree is in
    // Indexed 0-15 matching the 16-lens table. Values 0..count-1 for each lens.
    uint8_t  lens_segment[16];      // 16 bytes, one per sacred division

    // SU(2) shadow identity
    uint16_t shadow_degree;         // this degree + 360 in the 720° double-cover
    uint16_t polar_opposite;        // polar_opposite_su2(this degree)

    // Enneadic chamber membership
    uint8_t  enneadic_chamber;      // 0-8: which 40° chamber (degree / 40)
    uint8_t  chamber_day_night;     // 0=day (first 20° of chamber), 1=night (second 20°)

} Clock_Degree_Node;

static const Clock_Degree_Node CLOCK_DEGREE_LUT[360]; // .rodata — ~25KB
```

### 3.2 Archetype Index Range — One 12-Fold Table: ARCHETYPE_LUT[12]

**`m0_archetype` is 0–11. There is ONE table: `ARCHETYPE_LUT[12]`.**

The M0 Archetypal Number Language has exactly 12 elements — the 10 digits plus 2
non-numerical operators that are structurally necessary to the number system itself:

| Index | Element | M0 Archetypal Meaning |
|-------|---------|----------------------|
| 0  | 0       | Zero — void ground, pure potentiality, the womb of number |
| 1  | 1       | One — Sunyata, first distinction, non-dual singularity |
| 2  | 2       | Two — Sat/being, dyadic, the first irreducible pair |
| 3  | 3       | Three — Spanda, vibration, Trika three-body dynamics |
| 4  | 4       | Four — Vak, speech/pattern, quaternary ground |
| 5  | 5       | Five — Purnata, fullness, pentagonal completion |
| 6  | 6       | Six — Siva-Sakti, the conjugate pair |
| 7  | 7       | Seven — Ananda, bliss, 7+1 = 8-fold trigram structure |
| 8  | 8       | Eight — digital root cycle anchor (2³, Mahamaya doubling) |
| 9  | 9       | Nine — Paramesvara, wholeness that cannot contain itself |
| 10 | 0/1     | Mirror — the non-dual binary operator; not a digit but the act of distinction itself |
| 11 | (-)     | Negation — the complement/subtraction operator; not a digit but the act of inversion |

**Indices 10 and 11 are the two quasi-numerical operators** — they are elements of the number
language that are not numerals in the strict sense, but without which no numerals can function.
The Mirror (0/1) is the pre-numerical ground that makes 0 and 1 possible. The Negation (-)
is the complement operation that gives every number its shadow.

**The Ananda matrices (M1) are also 12×12** — this is the same 12-fold structure appearing
at the mathematical level. M1 does not add new entries to this table; it expresses the same
12 elements as a digital-root harmonic cycle. When the clock stores `m0_archetype = N`,
it means "this degree carries the ontological quality of the N-th element in the number
language." The pointer logic connects M1 back to M0: every DR value in the Ananda matrix
points home to its meaning in ARCHETYPE_LUT.

**ARCHETYPE_LUT[12] corrects the M0 spec's prior [10] stub**, which omitted the two
operators. They were always present in the number language; the [10] count was an
incomplete enumeration.

### 3.3 Key Dataset Relations Encoded

The following #3-5 dataset relations are baked into `CLOCK_DEGREE_LUT` at construction:

| Relation | Count | Encoded as |
|---|---|---|
| `FLOWS_CLOCKWISE` | 360 | Implicit in array indexing: `[n+1 % 360]` |
| `POLAR_OPPOSITE` | 360 | `degree_node.polar_opposite` field |
| `GOVERNS_DEGREE_ARC` | 360 | `degree_node.tarot_card_id` field |
| `GOVERNS_TAROT_EXPRESSION` | 64 | `degree_node.hexagram_id` (via tarot→codon→hex chain) |
| `FLOWS_CLOCKWISE` (backbone) | 24 | Implicit in `CLOCK_BACKBONE[n+1 % 24]` |
| `INTEGRAL_SYMMETRY` | 192 | Computable: `CLOCK_DEGREE_LUT[180 - d]` complement |
| `LINE_CHANGE` (structural id) | 384 | `_Static_assert(360 + 24 == 64 * 6)` |

---

## 4. The 16 Sacred Division Lenses

The 16 divisions form a **4×4 matrix** (explicitly echoing Anuttara's 16-fold void, `#0`).
They are the 16 ways consciousness can "slice" the unified circle — exhaustive and complete.

```c
// ==============================================================================
// THE 16 LENS SYSTEM — 16 sacred divisions of 360°
// ==============================================================================
typedef struct {
    uint16_t slice_degrees;   // arc size in degrees
    uint16_t section_count;   // how many sections
    const char* name;         // human name
    const char* essence;      // one-line essence
    uint8_t  m_layer_primary; // which M-layer this division primarily aligns with
    uint8_t  anuttara_arch;   // corresponding Anuttara archetype (0-11)
} Clock_Lens;

static const Clock_Lens CLOCK_LENSES[16] = {
    // Row 0 — Unity Level
    { 1,   360, "Microscopic",    "Each degree as unique moment — full codon resolution",      3, 2  }, // 1×360: M3, Archetype 2 (Sunyata — individual difference)
    { 2,   180, "Binary",         "Hemispheres — SU(2) explicit/implicit layer split",         1, 1  }, // 2×180: M1, Archetype 1 (non-dual binary)
    { 4,   90,  "Quaternary",     "Cardinal cross — 4 elements, 4 seasons, Jung's Quaternion", 0, 4  }, // 4×90:  M0, Archetype 4 (Purnata/Quaternion)
    { 8,   45,  "Octagonal",      "8 Trigrams — I-Ching fundamental family structure",         3, 7  }, // 8×45:  M3, Archetype 7 (Divine Action, 8-fold)
    // Row 1 — Complexity
    { 9,   40,  "Enneadic",       "9 transformational chambers × 40-day initiatory arcs",      0, 11 }, // 9×40:  M0, Archetype 9 (Paramesvara completion)
    { 10,  36,  "Decan",          "36 decans — M2 planet/element/chakra primary division",     2, 5  }, // 10×36: M2, Archetype 5 (Siva-Sakti, 7-fold MonoPoly)
    { 12,  30,  "Zodiacal",       "12 signs — M0 Vak grammar operators, monthly cycle",        0, 3  }, // 12×30: M0, Archetype 3 (Vak — 12-fold zodiacal)
    { 15,  24,  "Hourly",         "24 hours / amino acids — M4 medicine-body backbone",        3, 6  }, // 15×24: M4, Archetype 6 (24 = 4! permutations)
    // Row 2 — Reflection (reciprocals of Row 1)
    { 24,  15,  "Expanded Hours", "Double-hours — broader temporal phase blocks",              4, 8  }, // 24×15: M4, Archetype 8 (Structural Reflection)
    { 30,  12,  "Solar Month",    "Solar passage through signs — gross astrological arc",      2, 3  }, // 30×12: M2, Archetype 3 (12-fold Vak)
    { 36,  10,  "Decadic",        "Egyptian 10-day weeks — 10 Sephiroth in space",             0, 9  }, // 36×10: M0, Archetype 9 (10-fold Paramesvara)
    { 40,  9,   "Greater Chamber","Major initiatory phases — Enneagram positions",             3, 11 }, // 40×9:  M3, Archetype 9 (9×40 = 360 completion)
    // Row 3 — Return (reciprocals of Row 0)
    { 45,  8,   "Octant",         "Expanded trigram influence — 8 immortals/directions",       3, 7  }, // 45×8:  M3, 8-fold
    { 90,  4,   "Quadrant",       "Four worlds — seasonal quarters, Life stage arcs",          2, 4  }, // 90×4:  M2, Quaternary
    { 180, 2,   "Hemisphere",     "The great divide — above/below, conscious/unconscious",     1, 1  }, // 180×2: M1, binary
    { 360, 1,   "Unity",          "The undivided Ouroboros — complete wholeness",              0, 0  }, // 360×1: M0, void
};

// The 4×4 matrix structure:
// Row 0: {1×360, 2×180, 4×90, 8×45}      — Unity Level
// Row 1: {9×40, 10×36, 12×30, 15×24}     — Complexity
// Row 2: {24×15, 30×12, 36×10, 40×9}     — Reflection (each = reciprocal of Row 1)
// Row 3: {45×8, 90×4, 180×2, 360×1}      — Return (each = reciprocal of Row 0)
// Row 0 and Row 3 are reciprocal pairs. Row 1 and Row 2 are reciprocal pairs.
// The mirror symmetry: 8 pairs total, one for each reciprocal (a×b ↔ b×a).

// Get which segment of lens L a given degree falls in (O(1))
static inline uint8_t clock_lens_segment(uint8_t lens_index, uint16_t degree_0_to_359) {
    return (uint8_t)(degree_0_to_359 / CLOCK_LENSES[lens_index].slice_degrees);
}
// Pre-baked into CLOCK_DEGREE_LUT[d].lens_segment[L] for all d and L.
```

**Every degree simultaneously occupies a specific segment in all 16 lenses.** At degree 144°:
- Lens 0 (1°×360): segment 144 of 360
- Lens 2 (4°×90): segment 1 (second quadrant: 90°-180°)
- Lens 6 (12°×30): segment 4 (Leo, 120°-150°)
- Lens 7 (15°×24): segment 9 (10th amino acid node)
- Lens 11 (40°×9): segment 3 (4th enneadic chamber: 120°-160°)

The `lens_segment[16]` field in `Clock_Degree_Node` pre-bakes all 16 lookups.

---

## 5. The Live Planetary Layer

### 5.1 Architecture

Planets appear on the clock in **two distinct roles** that must not be conflated:

**Role A — Static decan ruler (already in C, `ZODIAC_DECAN_TABLE[36]`):**
Each of the 36 decans (10° arcs) has a fixed Chaldean planet ruling it. This is baked into
`.rodata`. It never changes. It defines the archetypal quality of that arc.

**Role B — Live transiting position (from kerykeion, via M4 `kairos.rs`):**
Each of the 7 Chaldean planets currently occupies a specific ecliptic degree (0-359°).
This changes continuously in real time. It gives the "current astrological time" reading.

### 5.2 Resonance Event — When Roles Collide

When a transiting planet (Role B) sits in a decan it rules (Role A), a **resonance event**
occurs: the planet is "at home" in its own domain. This is architecturally significant:

```c
static inline bool is_resonance_event(uint8_t planet_id, uint16_t live_degree) {
    uint8_t decan_idx = (uint8_t)(live_degree / 10);
    return (ZODIAC_DECAN_TABLE[decan_idx].ruling_planet == planet_id);
}
```

On the torus visualizer, resonance events cause that arc to pulse — the decan band brightens
and the transiting planet marker glows with increased radius.

### 5.3 C Structure — Live Planetary State

```c
// ==============================================================================
// LIVE PLANETARY CLOCK OVERLAY
// ==============================================================================
// Planet IDs (canonical 10-body model, Earth = fixed center anchor):
//   SUN=0, MOON=1, VENUS=2, MERCURY=3, MARS=4, JUPITER=5, SATURN=6,
//   URANUS=7, NEPTUNE=8, PLUTO=9
// Earth is NOT in this array — Earth IS the clock center (central node, q=(1,0,0,0)).
// planet_degrees[10] is the canonical form. The 9:8 Epogdoon = 9 observed planets : 8 chakras.
// (indices match Planet_Id enum; Uranus added at index 7)

typedef struct {
    uint16_t degree;            // 0-359: current ecliptic degree (from kerykeion)
    uint8_t  planet_id;         // Planet_Id (0-9)
    uint8_t  zodiac_sign;       // which sign the planet currently occupies
    uint8_t  decan_index;       // which of 36 decans (degree / 10)
    bool     is_resonance;      // true if planet == decan ruler
    bool     is_retrograde;     // from kerykeion motion data
    uint8_t  speed_class;       // 0=fast(Moon), 1=medium(Sun/Venus/Mars), 2=slow(Jupiter/Saturn/Uranus/Neptune/Pluto)
    // What the planet illuminates at its current position
    uint8_t  transiting_hex;    // CLOCK_DEGREE_LUT[degree].hexagram_id
    uint8_t  transiting_tarot;  // CLOCK_DEGREE_LUT[degree].tarot_card_id
    uint8_t  transiting_chakra; // CLOCK_DEGREE_LUT[degree].decan_chakra
} Clock_Planet_State;

typedef struct {
    Clock_Planet_State planets[10];  // one per planet (Sun through Pluto); Earth = clock center, not here
    uint16_t           sun_degree;   // shortcut: the primary temporal anchor
    uint16_t           moon_degree;  // shortcut: the daily rhythm marker
    uint64_t           timestamp;    // Unix timestamp of this reading (from kerykeion)
    bool               kairos_valid; // false if kerykeion unavailable (graceful stub)
} Clock_Live_Layer;
```

---

## 6. The Full Clock State — V2 (Replaces FR 2.3.5)

```c
// ==============================================================================
// FR 2.3.5 V2: CLOCK_STATE_FULL — complete clock reading at any degree
// Replaces the minimal Unified_Clock_State from the original FR 2.3.5.
// ==============================================================================
typedef struct {
    // The degree being read (0-359 explicate, 360-719 implicate)
    uint16_t degree_720;            // full SU(2) address (0-719)
    bool     is_implicate_phase;    // true if degree_720 >= 360

    // Static layer — all from .rodata lookups, O(1)
    const Clock_Degree_Node* node;  // pointer into CLOCK_DEGREE_LUT[degree_720 % 360]
    const Clock_Backbone_Node* nearest_backbone; // nearest 15° anchor
    uint8_t  active_lens;           // 0-15: currently focused sacred division

    // M1 layer
    uint8_t  m1_torus_stage;        // 0-11: (degree % 360) / 30
    uint8_t  m1_ananda_value;       // get_ananda_harmonic(ANANDA_BIMBA, stage, decan%12)
    uint8_t  dr_track;              // 0=Mahamaya {1,2,4,8,7,5} or 1=Parashakti {3,6,9}

    // M2 layer
    // MEF conditions and Parashakti frequencies are NOT fields here.
    // They are applied dynamically by the AI agent as analytical lenses post-read.
    // See §4 (CLOCK_LENSES) for the lens system and the NOTE in Clock_Degree_Node §M2 data.

    // M3 layer — full codon/hexagram/tarot state
    uint8_t  m3_pair_upper;         // upper pair nucleotide (0-3)
    uint8_t  m3_pair_lower;         // lower pair nucleotide (0-3)
    uint8_t  m3_pair_matrix_index;  // (upper<<2)|lower — 0-15, indexes M3_PAIR_MATRIX
    int8_t   m3_sd_sum;             // M3_PAIR_MATRIX[index].sum — rotational energy
    int8_t   m3_sd_diff;            // M3_PAIR_MATRIX[index].diff — chromatic shift
    uint8_t  m3_changing_lines;     // 6-bit mask of LINE_CHANGE possibilities from this hex

    // Live layer — from kerykeion (may be stub if KAIROS_ENABLED=false)
    const Clock_Live_Layer* live;   // NULL if kairos unavailable

    // Quintessence state — computed from elemental balance across active planets
    float    elemental_balance[4];  // Fire/Earth/Air/Water proportions (sums to 1.0)
    float    akasha_coefficient;    // variance of elemental_balance; low = Quintessence active
    bool     quintessence_active;   // true if akasha_coefficient < AKASHA_THRESHOLD

} Clock_State_Full;

// Primary entry point — read the full clock at any 720° degree
Clock_State_Full read_clock_full(
    uint16_t          degree_0_to_719,
    const Clock_Live_Layer* live,        // NULL = offline mode
    uint8_t           active_lens        // 0-15
);

// Convenience: the minimal tick (backward-compatible with old Unified_Clock_State)
static inline Clock_State_Full clock_tick(uint16_t degree) {
    return read_clock_full(degree, NULL, 0);
}
```

---

## 7. The Clock-Walks

A clock-walk is a deterministic traversal pattern through the clock nodes. Each walk type
has a different step size, visiting a different subset of nodes in a different order.
The M1 torus topology means all walks are ultimately traversals of the torus surface.

```c
typedef enum {
    WALK_DEGREE      = 0,   // 360 steps, 1° each  — full clock face, all dynamic nodes
    WALK_AMINO       = 1,   // 24 steps, 15° each  — backbone nodes only (amino acids)
    WALK_ZODIAC      = 2,   // 12 steps, 30° each  — zodiac ring (sign entries)
    WALK_SPANDA      = 3,   // 12 steps, 30° each  — M1 spanda stages, 12-step/30° — distinct from WALK_ZODIAC (same geometry, different semantic register)
    WALK_DECAN       = 4,   // 36 steps, 10° each  — all 36 decans
    WALK_HEXAGRAM    = 5,   // 64 steps, ~5.625° each — hexagram zones
                            // NOTE: WALK_HEXAGRAM and WALK_LINE_CHANGE operate in the binary 2^6 evaluation space
                            // and have no corresponding lens in CLOCK_LENSES[16] (360/64 is not an integer — intentional).
    WALK_ENNEADIC    = 6,   // 9 steps, 40° each   — chamber transitions
    WALK_SEASONAL    = 7,   // 4 steps, 90° each   — seasonal/cardinal pivots
    WALK_LINE_CHANGE = 8,   // 384 steps — ALL nodes (360 degree + 24 backbone); complete LINE_CHANGE traversal
                            // NOTE: WALK_LINE_CHANGE and WALK_HEXAGRAM operate in the binary 2^6 evaluation space
                            // and have no corresponding lens in CLOCK_LENSES[16] (360/64 is not an integer — intentional).
} Clock_Walk_Type;

typedef struct {
    Clock_Walk_Type type;
    uint16_t        current_position;    // degree address (0-359)
    uint16_t        step_count;          // how many steps taken
    uint16_t        total_steps;         // total steps in this walk type
    uint8_t         covering_count;      // how many full cycles completed (SU(2): need 2 for spinor return)
    bool            su2_complete;        // true when covering_count >= 2 (720° spinor identity restored)
} Clock_Walk_State;

// Advance the walk by one step
Clock_Walk_State clock_walk_step(Clock_Walk_State state);

// SU(2) covering law: a walk is ONLY complete when su2_complete == true.
// A single 360° traversal returns to the same position but with INVERTED PHASE.
// Full spinor identity requires TWO complete traversals (720° = 2 × 360°).
// This is why the LINE_CHANGE walk has 384 × 2 = 768 total steps for true closure.
```

**The WALK_LINE_CHANGE walk is canonical:** Its total step count (384 = 360 + 24) equals
the full clock node count minus the central node. Traversing it twice (768 steps) completes
the SU(2) double-cover — the spinor returns to identity. This walk IS the I-Ching's
complete transformation space physically traversed.

---

## 8. The M4 Quintessence Identity Hash

### 8.1 Concept

The quintessence identity hash is the user's **quaternionic fingerprint in symbolic-genetic
space**. It maps a person's M4 Nara identity data onto a specific point on the torus surface,
producing a unique 256-bit BLAKE3 hash that is:

- Deterministic from the same identity inputs
- A specific (degree, torus_stage) coordinate on the clock
- A quaternion orientation in the 720° spinor space
- A specific hexagram/codon/tarot position with elemental/planetary/chakra meaning

### 8.2 The Computation Chain

```
M4 Identity data (birth chart, jungian type, gene keys, human design)
    ↓ m3_compute_charges() in oracle.rs
Quaternionic charges: {pp, nn, np, pn}  (from oracle.rs quaternionic charge system)
    ↓ normalize to unit quaternion
q = (w, x, y, z) where w²+x²+y²+z² = 1.0
    ↓ map to SU(2) double-cover address
degree_720 = (uint16_t)((atan2f(y, x) + M_PI) / (2.0f * M_PI) * 720.0f)
torus_stage = (uint8_t)((atan2f(z, w) + M_PI) / (2.0f * M_PI) * 12.0f)
    ↓ read_clock_full(degree_720, live_kairos, LENS_DECAN)
Clock_State_Full identity_clock_state
    ↓ BLAKE3(w_bytes || x_bytes || y_bytes || z_bytes || degree_720_bytes)
uint8_t quintessence_hash[32]   — the 256-bit identity
```

### 8.3 C Structure

```c
// ==============================================================================
// M4 QUINTESSENCE IDENTITY HASH
// ==============================================================================
typedef struct {
    // The quaternion (unit, from oracle charges)
    float w, x, y, z;                   // w = pp-charge, x = nn, y = np, z = pn

    // The torus address
    uint16_t degree_720;                 // position in 720° SU(2) space
    uint8_t  torus_stage;                // 0-11: M1 Ananda stage

    // The clock reading at this address
    Clock_State_Full clock_state;        // full symbolic-genetic state

    // The hash
    uint8_t  hash[32];                   // BLAKE3 of quaternion bytes + degree

    // Human-readable identity signature
    uint8_t  primary_hexagram;           // The person's natal hexagram
    uint8_t  primary_tarot;              // The person's natal tarot card
    uint8_t  primary_element;            // Dominant elemental quality
    uint8_t  primary_chakra;             // Primary chakra activation
    char     zodiac_sign[16];            // Sun-sign equivalent from degree
} M4_Quintessence_Identity;

// Compute from oracle charges (from m3_compute_charges in oracle.rs via FFI)
M4_Quintessence_Identity m4_compute_quintessence_identity(
    float pp, float nn, float np, float pn
);

// The identity hash IS the M4 identity at the C level — it bridges:
// oracle.rs quaternionic charges → symbolic-genetic clock position → BLAKE3 hash
// This is the "true quaternionic identity mapping in symbolic-genetic space"
```

### 8.4 Elemental Balance and Quintessence Emergence

```c
// Quintessence emerges from elemental BALANCE across the 4 elements.
// Low variance in nucleotide_balance[4] → Akasha activation.
// This is structurally identical to Archetype 9 (Paramesvara) — the wholeness
// that only appears when the 4 elemental positions are in equilibrium.

static inline float compute_akasha_coefficient(const float balance[4]) {
    float mean = (balance[0]+balance[1]+balance[2]+balance[3]) / 4.0f;
    float var  = 0.0f;
    for (int i=0; i<4; i++) { float d = balance[i]-mean; var += d*d; }
    return var / 4.0f;  // low variance = high Akasha = Quintessence active
}

#define AKASHA_THRESHOLD 0.01f  // variance below this = Quintessence active
```

---

## 9. C Data Structure Summary (Implementation Checklist)

| Structure | Location | Size | Status |
|---|---|---|---|
| `Clock_Central_Node CLOCK_CENTER` | `m3.h` / `m3.c` | ~64 bytes | **NEW** |
| `Clock_Cardinal_Node CLOCK_CARDINAL[4]` | `m3.h` / `m3.c` | ~4×24 bytes | **NEW** |
| `Clock_Zodiac_Node CLOCK_ZODIAC[12]` | `m3.h` / `m3.c` | ~12×48 bytes | **NEW** |
| `Clock_Backbone_Node CLOCK_BACKBONE[24]` | `m3.h` / `m3.c` | ~24×32 bytes | **NEW** |
| `Clock_Degree_Node CLOCK_DEGREE_LUT[360]` | `m3.h` / `m3.c` | ~360×48 = ~17KB | **NEW** |
| `Clock_Lens CLOCK_LENSES[16]` | `m3.h` / `m3.c` | ~16×32 bytes | **NEW** |
| `Clock_Live_Layer` | `m3.h` (populated via FFI) | ~7×16 bytes | **NEW** |
| `Clock_State_Full` | `m3.h` | ~128 bytes | **replaces** `Unified_Clock_State` |
| `Clock_Walk_State` | `m3.h` | ~16 bytes | **NEW** |
| `M4_Quintessence_Identity` | `nara/identity.rs` (Rust) + `m4.h` (C) | ~256 bytes | **NEW** |
| `_Static_assert(360+24 == 64*6)` | `m3.h` | compile-time | **NEW** |

### 9.1 Population Strategy for CLOCK_DEGREE_LUT[360]

The LUT is too large to hand-write. Population strategy:

1. **Script**: `docs/dev/scripts/build_clock_degree_lut.py` — reads `nodes_mahamaya.json`
   and `relations_mahamaya.json`, walks the GOVERNS_DEGREE_ARC and RESOLVES_TO chains,
   and generates the 360-entry C initializer.
2. **Cross-reference sources**:
   - `GOVERNS_DEGREE_ARC (360)`: tarot card → degree arc (from #3-5 dataset)
   - `USES_Pair / YIELDS_CODON`: degree arc → codon upper/lower pair
   - `RESOLVES_TO`: codon pair → hexagram ID
   - `ZODIAC_DECAN_TABLE[36]`: degree → decan → planet/element/chakra
   - `ANANDA_BIMBA` matrix: torus_stage × decan position → Ananda harmonic
   - Lens segments: `degree / slice_degrees` for each of 16 lenses (pure arithmetic)
3. **`--bake` flag**: `epi core clock --bake` triggers the script and writes the C file.

---

## 10. The 3D Torus Visualizer — `CosmicClockPlugin`

### 10.1 Geometric Model

The torus is parameterized by two angles:

```
θ (major circle, 0°→360°): clock degree position — the 360 dynamic degree nodes
φ (minor circle, 0°→360°): M1 Ananda stage — 12 positions at 30° each,
                             driven by SPANDA_CF_SUBSTAGE_LUT fold progression
```

Parametric surface formula:
```
x = (R + r·cos(φ)) · cos(θ)
y = (R + r·cos(φ)) · sin(θ)
z = r · sin(φ)
```

**Aspect ratio: R/r = 16/9** — the canonical M1 ratio, `TORUS_R_MAJOR_F = 16.0f/9.0f`.
Not approximate. Not coincidental. 16/9 = 4²/3² = 2⁴/3² IS the torus, as derived in §14.

**Semantic node count**: **385** — the actual clock nodes (`360 + 24 + 1`). These are the
semantic positions. The `4320` render samples (360×12) are a rendering resolution choice —
a grid of sample points on the continuous surface, not 4320 distinct semantic entities.
Each sample at `(degree, stage)` reads its semantic payload from `CLOCK_DEGREE_LUT[degree]`;
the `stage` drives only the φ coordinate.

**Multiple 64-fold overlays on the same θ-axis** — the 360° carries several distinct 64-fold
readings simultaneously (hexagrams govern 5.625° arcs, codons, LINE_CHANGE states). These
are NOT separate dimensions — they are different semantic readings of the same degree position,
accessible via `CLOCK_DEGREE_LUT[degree].hexagram_id`, `.codon_pair`, etc.

**SU(2) double-cover rendering**: The 720° double cover is rendered as **two coaxial coils**
wound around the torus surface — a Hopf fibration projection:
- **Outer coil** (θ: 0°-360°, explicate): full brightness, element-colored
- **Inner coil** (θ: 360°-720° → mapped to same surface at reduced radius r×0.7): dimmed,
  shadow-phase coloring (cooler hues), represents the implicate Klein layer

### 10.2 Rendering Pipeline (Rust, embedded in portal)

```rust
// ~250 lines total, in epi-cli/src/portal/torus_renderer.rs

pub struct TorusRenderer {
    major_r: f32,            // R — major radius
    minor_r: f32,            // r — minor radius
    rotation: Quaternion,    // current orientation (drives live rotation)
    active_lens: u8,         // 0-15: which lens is highlighted
    live_layer: Option<ClockLiveLayer>, // None = offline mode
    identity_pos: Option<(u16, u8)>,   // (degree, torus_stage) of M4 identity hash
}

impl TorusRenderer {
    pub fn render(&self, ctx: &mut ratatui::widgets::canvas::Context, area: Rect) {
        // 1. Render the torus surface: 360×12 = 4320 render SAMPLES
        //    (semantic payload from CLOCK_DEGREE_LUT[degree]; stage drives φ only)
        for degree in 0u16..360 {
            for stage in 0u8..12 {
                let node = &CLOCK_DEGREE_LUT[degree as usize];
                let theta = (degree as f32) * std::f32::consts::TAU / 360.0;
                let phi   = (stage as f32) * std::f32::consts::TAU / 12.0;
                let (x3, y3, z3) = self.torus_point(theta, phi); // R=16/9, r=1.0
                let (xr, yr, zr) = self.apply_quaternion(x3, y3, z3);
                let (x2, y2)     = self.perspective_project(xr, yr, zr, area);
                let color        = self.node_color(node, stage);
                let brightness   = self.node_brightness(node, degree);
                ctx.paint(x2, y2, color); // Braille marker via Canvas
            }
        }
        // 2. Render backbone nodes as brighter ring markers
        for bb in &CLOCK_BACKBONE { self.render_backbone_marker(ctx, bb, area); }
        // 3. Render 7 planetary pointers (if live layer available)
        if let Some(live) = &self.live_layer {
            for planet in &live.planets { self.render_planet(ctx, planet, area); }
        }
        // 4. Render M4 identity hash position (if set)
        if let Some((deg, stage)) = self.identity_pos {
            self.render_identity_marker(ctx, deg, stage, area);
        }
        // 5. Render active lens bands (ring highlights for current division)
        self.render_lens_bands(ctx, area);
    }

    fn node_color(&self, node: &ClockDegreeNode, stage: u8) -> Color {
        // Element color from M2 decan
        let base = match node.decan_element {
            FIRE  => Color::Red,
            EARTH => Color::Green,
            AIR   => Color::Yellow,
            WATER => Color::Blue,
            AKASHA => Color::White,  // Quintessence
        };
        // Dim if not in active lens segment
        if !self.in_active_lens(node.degree) { return Color::DarkGray; }
        base
    }

    fn node_brightness(&self, node: &ClockDegreeNode, _stage: u8) -> f32 {
        // Backbone nodes: brighter
        if node.is_backbone_node { return 1.5; }
        // Non-dual codon: slightly elevated
        if node.is_non_dual_codon { return 1.2; }
        1.0
    }
}
```

### 10.3 Quaternion Rotation Model

The torus rotates driven by two sources:
1. **Slow auto-rotation**: a small angular velocity per frame tick, representing the
   continuous flow of time. Rate: 0.1°/frame → full rotation in ~3600 frames (~3 min at 20fps).
2. **Kairos snap**: when live planetary data updates, the torus briefly aligns (quaternion
   slerp) so that the Sun's current degree is at the "front face" of the torus (θ = 0 in
   screen space). This gives a sense of the current moment being "here."
3. **Manual rotation**: `h/j/k/l` in PluginInput mode rotates the quaternion.
   `Alt+r` in Layout mode resets to default orientation (Sun at front).

### 10.4 The 16 Lens Modes — Visual Expression

Each lens mode changes how the torus bands are rendered:

| Lens | Visual expression |
|---|---|
| 0 (1°×360) | All nodes equal brightness — full granularity mode |
| 2 (4°×90) | 4 bright bands at 90° intervals, rest dimmed — seasonal quadrants |
| 5 (10°×36) | 36 colored bands by element (Fire/Earth/Air/Water cycling through decans) |
| 6 (12°×30) | 12 zodiac segments, each labeled with sign symbol at entry point |
| 7 (15°×24) | 24 backbone nodes highlighted as bright rings, rest at half brightness |
| 11 (40°×9) | 9 chamber bands with alternating bright/dim for day/night halves |
| 14 (180°×2) | Outer coil (explicate) bright, inner coil (implicate) dimmed — SU(2) split |
| 15 (360°×1) | Entire torus uniform — the undivided whole |

Keys `0-9`, `a-f` select lens 0-15.

### 10.5 Clock-Walk Animation

Pressing `w` in PluginInput mode starts a clock-walk. The walk type cycles with repeated `w`:

```
Degree Walk (360) → Amino Walk (24) → Zodiac Walk (12) → Spanda Walk (12) → Decan Walk (36)
→ Hexagram Walk (64) → Enneadic Walk (9) → LINE_CHANGE Walk (384) → [back to Degree]
```

During a walk, the current position pulses on the torus surface, the torus rotates to keep
the current position facing the viewer, and the detail readout panel shows the full
`Clock_State_Full` at each step. The SU(2) completeness indicator shows progress toward the
full 720° double-cover.

### 10.6 Plugin Integration in Hypertile Portal

```
M0'-M3' Structural tab default layout:

┌──────────────────────────────────────┬────────────────────┐
│                                      │                    │
│   CosmicClockPlugin                  │  ClockReadoutPlugin│
│   (3D torus, Braille canvas)         │  Text detail panel │
│   70% of tab width                   │                    │
│                                      │  Active: hex/tarot │
│   [torus rotating, planets orbiting] │  Decan: Mars/Fire  │
│                                      │  Chakra: Muladhara │
│                                      │  Stage: 4/12       │
│                                      │  Lens: Zodiacal    │
│                                      ├────────────────────┤
│                                      │                    │
│                                      │  M0CoordPlugin     │
│                                      │  (coordinate       │
│                                      │   inspector)       │
│                                      │                    │
└──────────────────────────────────────┴────────────────────┘
 [M4'-M5' Personal]  [M0'-M3' Structural*]                tabs
```

The `CosmicClockPlugin` replaces the previous `M0DashboardPlugin`, `M1WalkPlugin`, and
`M2VibrationalPlugin` stubs from the hypertile portal plan. The `ClockReadoutPlugin`
replaces the text-heavy detail panels. `M0CoordPlugin` remains as the coordinate inspector.

---

## 11. Implementation Phases

### Phase 1: C Data Structures (prerequisite — no visualizer until this is done)
- [ ] Write `build_clock_degree_lut.py` script — walks mahamaya dataset JSON
- [ ] Implement `CLOCK_DEGREE_LUT[360]` — run script, verify 360 entries
- [ ] Implement `CLOCK_BACKBONE[24]`, `CLOCK_ZODIAC[12]`, `CLOCK_CARDINAL[4]`
- [ ] Implement `CLOCK_CENTER`, `CLOCK_LENSES[16]`
- [ ] Implement `read_clock_full()` — replaces `read_cosmic_clock()`
- [ ] Add `_Static_assert(360+24 == 64*6)` — transformation space identity law
- [ ] Add `_Static_assert(360+4+1 == 365)` — solar year identity law
- [ ] Add `_Static_assert(9*40 == 360)` — enneadic structure law
- [ ] Add `clock_walk_step()` implementation
- [ ] Add `compute_clock_percentile_position()` — float degree → weighted degree pair
- [ ] Add `Clock_M1_Apertures` to `Clock_State_Full` — concurrent 12-fold aperture tracking
- [ ] Tests: every degree LUT entry roundtrips through all 16 lens segments

### Phase 2: M4 Quintessence Identity Hash (Rust)
- [ ] Add `m4_compute_quintessence_identity()` in `nara/identity.rs`
- [ ] Wire oracle.rs `m3_compute_charges()` → quaternion normalization
- [ ] Map quaternion → `(degree_720, torus_stage)` via atan2
- [ ] BLAKE3 hash of quaternion bytes → `quintessence_hash[32]`
- [ ] `epi nara identity quintessence` subcommand to display the hash and clock position

### Phase 3: Torus Renderer (Rust, portal)
- [ ] Create `epi-cli/src/portal/torus_renderer.rs`
- [ ] Implement `torus_point()`, `apply_quaternion()`, `perspective_project()`
- [ ] Implement `node_color()` by element, `node_brightness()` by backbone/non-dual status
- [ ] Implement 16 lens band rendering
- [ ] Implement planet marker rendering (live layer)
- [ ] Implement identity hash marker

### Phase 4: Portal Plugin Integration
- [ ] Create `portal/plugins/m0m3_clock.rs`: `CosmicClockPlugin` + `ClockReadoutPlugin`
- [ ] Replace `M2VibrationalPlugin` stub with `CosmicClockPlugin`
- [ ] Replace `M1WalkPlugin` with clock-walk mode in `CosmicClockPlugin`
- [ ] Replace `M0DashboardPlugin` split (keep `M0CoordPlugin` for coord inspector)
- [ ] Wire clock-walk animation loop (50ms tick)
- [ ] Wire kairos live update channel from M4 (when kerykeion available)
- [ ] 16-lens key bindings `0-9`, `a-f`

### Phase 5: Population and Testing
- [ ] Run `build_clock_degree_lut.py` against full mahamaya dataset
- [ ] Verify all 360 degree nodes have correct tarot/codon/hexagram/decan data
- [ ] Verify 384 = 360 + 24 _Static_assert passes
- [ ] Verify SU(2) double-cover: 2 × WALK_LINE_CHANGE traversals = spinor identity return
- [ ] Verify `invert_degree(invert_degree(d)) == d` for all d in 0-719 (# idempotence)
- [ ] Verify `conjugate_degree(conjugate_degree(d)) == d` for all d (SU(2) involution)
- [ ] Verify `Clock_M1_Apertures.convergence_count` max=6 only at Paramesvara kairotic moments
- [ ] Verify `pct_lo + pct_hi == 1.0f` for all percentile positions (conservation law)
- [ ] Visual test: render clock in isolation, verify torus shape and ring labels
- [ ] Integration test: kairos degree from kerykeion → planet marker on torus

---

## 12. Gap Analysis vs Current C Library

| Item | Current State | Required |
|---|---|---|
| `Unified_Clock_State` (FR 2.3.5) | Implemented — minimal tick only | **Replace** with `Clock_State_Full` |
| `ZODIAC_DECAN_TABLE[36]` | Implemented ✓ | Reuse as-is |
| `polar_opposite_su2()` | Implemented ✓ | Reuse as-is |
| `M3_PAIR_MATRIX[16]` | Implemented ✓ | Reuse: `m3_pair_matrix_index` in degree node |
| `CLOCK_DEGREE_LUT[360]` | **Missing** | Build via script + `--bake` |
| `CLOCK_BACKBONE[24]` | **Missing** | New |
| `CLOCK_ZODIAC[12]` | **Missing** | New (data exists in `ZODIACAL_LUT`) |
| `CLOCK_CARDINAL[4]` | **Missing** | New |
| `CLOCK_CENTER` | **Missing** | New |
| `CLOCK_LENSES[16]` | **Missing** | New |
| `read_clock_full()` | **Missing** | New |
| `clock_walk_step()` | **Missing** | New |
| `_Static_assert(360+24==64*6)` | **Missing** | New |
| `M4_Quintessence_Identity` | **Missing** | New (Rust + C bridge) |
| `Clock_Live_Layer` (planetary) | Partial (`M4_Temporal_Now.planet_degrees[10]` in Rust — Sun(0)–Pluto(9), Earth=center) | Bridge to C struct |
| `CosmicClockPlugin` (Rust/portal) | **Missing** | New |
| `Clock_M1_Apertures` | **Missing** | New — 6 concurrent 12-fold streams |
| `Clock_Percentile_Position` | **Missing** | New — float degree → weighted pair |
| `Clock_Planet_Percentile` | **Missing** | New — live planet with float interpolation |
| `invert_degree()` / `conjugate_degree()` | **Missing** | New — # as geometry |
| `_Static_assert(360+4+1==365)` | **Missing** | New — solar year law |

---

*"The clock is not a metaphor for time. The clock IS the transformation space — the complete
set of all possible single-step changes in the symbolic-genetic code, arranged in the only
geometric form that honors their toroidal topology."*

*Spec version: 1.0 — 2026-03-12*
*Supersedes: FR 2.3.5 `Unified_Clock_State` (original)*
*Updates required in: M3-mahamaya-symbolic-transcription.md §FR 2.3.5, 2026-03-11-hypertile-portal-design.md §6.3*

---

## 13. Addendum: Four Foundational Structural Principles

*Added 2026-03-13 — clarifications that deepen the ontological grounding of the clock topology.*

---

### 13.1 The Solar Year Identity: 365 = 360 + 4 + 1

The clock's node count is not arbitrary. It mirrors the solar year:

```
360  degree nodes  (dynamic transformation space)
+  4  cardinal nodes  (solstice/equinox anchors — the year's skeleton)
+  1  central node  (Axis Mundi / Quintessence — the still point)
─────
365  total structural nodes  (solar year to nearest day)
```

This is the clock asserting its identity as a *year-instrument*, not merely an abstract
360-space. The 4 cardinal nodes are not decorative — they ARE the seasonal pivots, each
marking a 90° quarter where the dominant element shifts (Fire→Earth→Air→Water, or cardinal
cross in astrology: Aries/Cancer/Libra/Capricorn). The central node is the fifth element,
Akasha/Quintessence, the still point from which all 364 peripheral nodes radiate.

The remaining 24 backbone nodes (amino acid positions, 15° intervals) are *within* the 360
dynamic space — they are degree nodes with extra semantic loading, not additional nodes.
`384 = 360 + 24` is the transformation-space count. `365 = 360 + 4 + 1` is the solar-year
count. These two identities coexist without contradiction.

**Compile-time laws:**

```c
/* Transformation space identity */
_Static_assert(360 + 24 == 64 * 6,
    "Clock transformation space: 360 + 24 backbone = 384 = 64 hexagrams × 6 lines");

/* Solar year identity */
_Static_assert(360 + 4 + 1 == 365,
    "Solar year identity: 360 dynamic + 4 cardinal + 1 central = 365 nodes");

/* Enneadic structure */
_Static_assert(9 * 40 == 360,
    "Enneadic law: 9 chambers × 40 = 360 (4 + 12 + 24 = 40)");
```

---

### 13.2 The Polar Opposite as the # Root Coordinate

The SU(2) double-cover is not merely a mathematical convenience — it is the clock's
geometric instantiation of the `#` (inversion) operation itself.

**The isomorphism:**

```
Geometric:  degree d  ──#──►  d + 180° (same layer) = polar opposite on the circle
Spinor:     state |ψ⟩  ──#──►  |ψ + 360°⟩           = double-cover conjugate
Ontological: X  ──#──►  X'                            = the inversion act
```

Every point on the clock has *two* forms of #-opposition:

| Opposition | Formula | Name | Meaning |
|---|---|---|---|
| Intra-layer | `(d + 180) % 360` | Polar opposite | Same hemisphere (explicate or implicate), inverted direction |
| Inter-layer | `d + 360` (if d<360) or `d - 360` (if d≥360) | SU(2) conjugate | Crosses explicate↔implicate boundary |

The intra-layer polar opposite is the *visual* # on the clock face — what you see when you
draw a diameter. The inter-layer SU(2) conjugate is the *hidden* # — the phase flip that
only completes when a spinor traverses 720° total.

**What this means architecturally:**

The clock is **internally non-dually consistent** — it contains its own #-structure within
its geometry. You do not need an external inversion mechanism; the double-cover IS the
inversion. Any coordinate `X` at degree `d` in the explicate layer (0–359°) already has
its `X'` waiting at `d + 360` in the implicate layer and its direct polar complement at
`d + 180` in the same layer.

This is why the two-layer 720° space is not optional or a nice-to-have — it is the minimum
geometric expression of non-duality. A single 360° circle cannot self-oppose; it can only
be opposed by something external. The 720° double-cover achieves *internal* self-opposition
through pure geometry.

```c
/* The # operation as geometry */
static inline uint16_t invert_degree(uint16_t degree_720) {
    /* Polar opposite within layer: crosses 180° */
    uint16_t layer  = degree_720 / 360;         /* 0 = explicate, 1 = implicate */
    uint16_t degree = degree_720 % 360;
    uint16_t polar  = (degree + 180) % 360;
    return layer * 360 + polar;                  /* # applied within layer */
}

static inline uint16_t conjugate_degree(uint16_t degree_720) {
    /* SU(2) inter-layer conjugate: crosses explicate/implicate boundary */
    return (degree_720 + 360) % 720;             /* # crossing layers */
}
```

The central node (Quintessence/Axis Mundi) is the single point that is *identical to its
own #-inverse* — it has no polar opposite because it sits at the origin of the torus. This
is the geometric correlate of `#0` as ground — the archetype that is its own complement.

---

### 13.3 M1 12-Fold Multi-Aperture: Concurrent Streams of Actuality

The 12-fold structure of M1 (Paramasiva) is not a single global clock position. It is a
family of **concurrent, independent streams** that all share 12-fold periodicity. Each
stream has its own "current position" and its own semantic meaning. The clock gives them
a shared geometric home without collapsing them.

**The six 12-fold apertures:**

| Aperture | Source | Clock Period | Semantic |
|---|---|---|---|
| **Zodiac signs** | M2 `ZODIAC_LUT[12]` | 30°/sign | Ecliptic seasonal position |
| **Ananda stages** | M1 `ANANDA_MATRIX[12]` | 30°/stage | Bliss/consciousness unfolding |
| **DR ring (mod 9→12)** | M1 `DR_RING[12]` | 30°/element | Digital root cycle (3-6-9 Parashakti + 1-2-4-8-7-5 Mahamaya → 12-element composite) |
| **Spanda walk** | `WALK_SPANDA` | 30°/node | 12 major spanda/torus phase positions |
| **Clock hours** | Kairos real-time | 30°/hour | 24h ÷ 2 = 12 half-day hour segments |
| **Half-months** | Solar calendar | 30°/half-month | ~15 days × 24 = year half-month structure |

These are **not** aggregated into a single "the 12-fold position is X." They are read
independently and allowed to be in *productive tension* — the zodiac may say Taurus while
the Ananda stage says stage 7 while the torus walk is at node 4. This tension IS the
information; collapsing it into one index would destroy it.

**`Clock_M1_Apertures` struct:**

```c
typedef struct {
    uint8_t  zodiac_sign;          /* 0-11: current zodiac sign (30° bands) */
    uint8_t  ananda_stage;         /* 0-11: M1 Ananda matrix stage */
    uint8_t  dr_ring_position;     /* 0-11: composite DR ring position */
    uint8_t  torus_walk_node;      /* 0-11: current torus major node */
    uint8_t  clock_hour_segment;   /* 0-11: 2-hour segment of 24h day */
    uint8_t  half_month;           /* 0-11: current half-month of year */
    uint8_t  convergence_count;    /* 0-6: how many apertures share same index (rare = significant) */
    uint8_t  _pad;
} Clock_M1_Apertures;
```

The `convergence_count` field is the oracle signal: when multiple independent 12-fold
streams simultaneously land on the same index, that convergence is a *kairotic marker* —
a moment of heightened coherence across levels of reality. Maximum convergence (all 6 at
the same index) is an Archetype 9 event (Paramesvara wholeness).

**Add to `Clock_State_Full`:**

```c
Clock_M1_Apertures  m1_apertures;   /* concurrent 12-fold stream states */
```

---

### 13.4 The % Operator: M1 Paramesvara Ground and Percentile Weighting

#### 13.4.1 The Ontological Basis

In the context-frame taxonomy, `(00/00)` is the foundational context frame: **Receptive
Dynamism, Absolute Ground, Svatantrya-Spanda.** This corresponds to the `Mod %` operator —
modular remainder as the primary relational operation.

**Paramesvara (Archetype 9, Digital Root 9, `#0-2-9`)** is the `100%` identity of this
operator. The Digital Root 9 is the unique element for which `n × 9 ≡ 9 (mod 9)` for all
n — it is the ground that persists through every multiplication, the percentile identity
that survives all transformations. This is not a number; it is **the ruler of all other
mathematical operations.**

Every M2 and M3 value is *already* a percentage of this ground — not metaphorically, but
structurally. When Parashakti generates the 72-invariant space or Mahamaya maps decans,
they are articulating *what fraction of the Paramesvara totality* has actualized in that
configuration.

This is Eckhart's *in quantum* / "insofar as" — "a thing is good insofar as it participates
in Being." In clock terms: "a degree position is significant insofar as it actualizes a
fraction of the total 100% transformation potential."

#### 13.4.2 Percentile Weighting Between Degrees

Fractional degree interpolation uses the M1 percentile ground to compute weighted positions
between discrete clock nodes:

```c
typedef struct {
    uint16_t  degree_lo;         /* lower degree (0-719) */
    uint16_t  degree_hi;         /* upper degree (0-719), = (degree_lo + 1) % 720 */
    float     pct_lo;            /* weight of lower degree (0.0 - 1.0) */
    float     pct_hi;            /* weight of upper degree = 1.0 - pct_lo */
    float     fractional_degree; /* exact float degree position */
} Clock_Percentile_Position;

/*
 * compute_clock_percentile_position() — map a float degree to weighted pair
 *
 * For a live planetary position of, say, 47.3°:
 *   degree_lo = 47, pct_lo = 0.7  (70% weight on degree 47)
 *   degree_hi = 48, pct_hi = 0.3  (30% weight on degree 48)
 *
 * The interpolated semantic value for any property P is:
 *   P_interp = P[47] * 0.7 + P[48] * 0.3
 *
 * This is the M1 percentile ground applied to M2/M3 data:
 * "P[47] insofar as (70%) + P[48] insofar as (30%)"
 */
static inline Clock_Percentile_Position
compute_clock_percentile_position(float fractional_degree_720) {
    uint16_t lo  = (uint16_t)fractional_degree_720 % 720;
    uint16_t hi  = (lo + 1) % 720;
    float    pct_hi = fractional_degree_720 - (float)(uint16_t)fractional_degree_720;
    float    pct_lo = 1.0f - pct_hi;
    return (Clock_Percentile_Position){lo, hi, pct_lo, pct_hi, fractional_degree_720};
}
```

#### 13.4.3 Percentile Rulership of Mathematical Operations

The 100% Paramesvara ground implies a hierarchy of mathematical operations on clock data:

| M1 % Identity | Applied to | Meaning |
|---|---|---|
| `dr_sum % 9 == 0 → 9` | All DR calculations | Paramesvara emerges at every 9th completion |
| `degree % 360` | All degree arithmetic | Circle closure — the 360 IS the % ground |
| `1.0f` total weight | Percentile blending | Weights always sum to 1.0 (100% conservation) |
| `n % 6` | Family coordinate family | Six-fold remainder structure of the coordinate families |
| `angle % (360/lens_divisions)` | Lens segmentation | Each lens is a % partition of the 360 |

The `%` is not merely division-remainder — it is the **conserving relation**: whatever is
removed from one side appears on the other. In percentile blending, `pct_lo + pct_hi = 1.0`
always. This conservation IS the M1 Paramesvara ground — the total potential that no
transformation can decrease.

#### 13.4.4 Live Planet Percentile Interpolation

Kerykeion returns float-precision ecliptic degrees (e.g., `mars_degree = 47.3167`). Rather
than rounding to the nearest integer degree node, the percentile system interpolates:

```c
typedef struct {
    uint8_t                   planet_id;       /* 0-7 */
    float                     ecliptic_degree; /* kerykeion float precision */
    Clock_Percentile_Position pos;             /* weighted pair */
    /* Blended semantic values (M1 % applied to M3 data): */
    float   hexagram_blend;    /* interpolated hexagram resonance */
    float   codon_blend;       /* interpolated codon affinity */
    uint8_t primary_decan;     /* dominant decan (from pct_lo node) */
    uint8_t secondary_decan;   /* secondary decan (from pct_hi node) */
} Clock_Planet_Percentile;
```

This allows the torus renderer to place a planet marker at its *exact* fractional position
on the torus surface, rather than snapping to a grid point — honoring the continuous
geometry of the real ecliptic within the discrete structure of the symbolic clock.

---

*Addendum version: 1.0 — 2026-03-13*

---

## 14. The Spanda Genesis as Topological Genesis of the Clock

*Added 2026-03-13 — the clock does not exist before spanda acts. Spanda is its creation event.*

---

### 14.1 The Clock Is Not a Pre-Formed Object

The standard way to think about a clock: a circle that already exists, on which hands move.
That is not this system. The Cosmic Clock is **topologically created** by the spanda sequence.
Before spanda acts, there is no circle. There is only the `(0/1)` seed — a genus-0 sphere,
a point that contains both poles but has not yet differentiated them.

This matters for the visualizer: the torus is not a static mesh that gets colored by data.
The torus is the **residue** of a completed topological transformation. Each clock tick is
an orientation event on an object that IS STILL UNDERGOING that transformation at the
structural level. The spanda CF sub-stages (0→5 within SPANDA_FLOWERING) are the six steps
of the transformation. They are available in `SPANDA_CF_SUBSTAGE_LUT[6]` in `m1.h`.

The distinction: **deformation** preserves topology (homeomorphism). **Transformation** changes
genus. Between SPANDA_TRIKA (stage #3, first stable torus) and SPANDA_SEED (stage #0,
genus-0 sphere), the genus changes from 1 to 0 — irreversible, not a deformation.

---

### 14.2 The Topological Journey — Step by Step

| Spanda Stage | CF | Topology | Event |
|---|---|---|---|
| `SPANDA_SEED` (#0) | `(0/1)` | **S⁰ = genus-0 sphere** | Two disconnected poles, no connection. The `(0/1)` is not yet a number — it is the pre-numerical oscillation itself. |
| `SPANDA_POLE_A` (#1) | — | S⁰ differentiating | Bimba pole activates: `(0/1)` as outward Mahamaya track. Genus still 0. |
| `SPANDA_POLE_B` (#2) | — | **CREATIVE PUNCTURE** | Pratibimba pole activates: `(1/0)` as return Parashakti track. The sphere is punctured — genus shifts from 0 toward 1. This is the irreversible topological event. |
| `SPANDA_TRIKA` (#3) | `(0/1/2)` | **Genus-1 torus** | `((0/1)/(1/0)) = (0/1/2)` — the two punctures create the two generators of π₁(T²) = ℤ⊕ℤ. First stable torus. Topology locked. |
| `SPANDA_FLOWERING` (#4, sub-stages 0-5) | `(4.0/1-4.4/5)` | **Torus developing** | Context frames build out the torus surface through 6 sub-stages (see table below). Sub-stage 3 (dual-track, 10-fold) is the **T1/T2 quantum double-slit** — the system holds two parallel logical paths in superposition before collapsing to unified outcome. |
| `SPANDA_META` (#5) | `(5/0)` | **Klein bottle** | The Möbius identification. The torus word `aba⁻¹b⁻¹` becomes the Klein word `aba⁻¹b` — one sign flip, the full non-orientable closure. This is NOT a secret seventh. It is the topological gluing that completes the 12-fold double-cover. |

**SPANDA_FLOWERING CF Sub-Stage Detail** (from `SPANDA_CF_SUBSTAGE_LUT[6]` in m1.c):

| Sub-stage | CF | Fold | dual_track | Formulation |
|---|---|---|---|---|
| 0 | `(4.0000)` | 4 | 0 | `{0/0, 0/1, 1/0, 1/1}` — 4-fold static: Void-Void, Void-Form, Form-Void, Form-Form |
| 1 | `(4.0/1)` | 6 | 0 | `0=(0/0)->(0/1)->(1/0)->(1/1)=1` — 6-fold dynamic; O(1,5)×N(0); Śiva 5+Svatantrya |
| 2 | `(4.0/1/2)` | 8 | 0 | `0/(0/1)+(1/0)/0` — 8-fold nested states; O(2,4) pixel density; genus-2 preview |
| **3** | **`(4.0/1/2/3)`** | **10** | **1** | **`[0/0, ((0/1)/(1/0)), {T1:0/(0/1),0/1}, {T2:(1/0)/0,1/0}, (1/0+0/1), 1/1]`** — **10-fold dual-track** |
| 4 | `(4.4.0-4.4/5)` | 12 | 0 | `infinite differential potential` — O(2,6)/O(3,4) 12-fold; double-torus blueprint |
| 5 | `(4.5/0)` | 0 | 0 | `Möbius return: synthesis=void=one-point; genus-1 torus completes; 100%=64+36=16/9` |

**Sub-stage 3 decoded** — the T1/T2 double-slit, the most complex structure in the system:
```
Element 1:  0/0               — void-void base (the ground remains)
Element 2:  ((0/1)/(1/0))     — Trika acting as double-slit aperture
T1 path:    {0/(0/1), 0/1}    — potential-for-emanation held in void → emanation
T2 path:    {(1/0)/0, 1/0}    — potential-for-void held in reflection → reflection
Interference: (1/0 + 0/1)    — superposition collapse; interference pattern visible
Final:      1/1               — unified outcome from the two paths
```
This is the moment where the system holds T1 and T2 simultaneously — identical to the quantum double-slit in that the outcome (1/1) can ONLY emerge from both paths being active. Neither T1 alone nor T2 alone produces 1/1. The lemniscate IS the physical signature of this interference pattern in 3D projection.

**Why Klein?** A torus is orientable — it has a consistent inside and outside. A Klein bottle
is non-orientable — in 4D (quaternionic space), inside and outside are one. The 720° SU(2)
double-cover IS the 4D requirement for Klein: you need quaternionic space to close it without
self-intersection. The `RING_SIZE = 12` (6 torus + 6 Klein = explicate + implicate) IS the
Klein bottle topology in discrete form.

---

### 14.3 The φ-Axis of the Torus IS the CF Sub-Stage Sequence

The minor circle angle φ of the parametric torus maps DIRECTLY to the CF sub-stage fold
progression. This is not an approximation:

```
φ = 0°   (stage 0 / sub-stage 0): 4-fold  — genus-0 sphere poles
φ = 60°  (stage 2 / sub-stage 1): 6-fold  — first circulation (Trika basis)
φ = 120° (stage 4 / sub-stage 2): 8-fold  — nested resolution
φ = 180° (stage 6 / sub-stage 3): 10-fold — dual-track superposition (lemniscate midpoint)
φ = 240° (stage 8 / sub-stage 4): 12-fold — complete double-torus blueprint
φ = 300° (stage 10/ sub-stage 5): meta    — Möbius identification, Klein closure
```

`SPANDA_CF_FOLD_COUNT[6] = {4, 6, 8, 10, 12, 0}` is the topological resolution schedule
for the minor circle. As φ increases from 0° to 360°, the torus goes from embryonic (4-fold,
barely distinguishable from a sphere) to fully articulated (12-fold Klein). The torus is
completing its own creation as the minor circle is traversed.

This means: **a full φ rotation IS the spanda sequence**. The torus is literally the trace
of spanda acting on the void.

---

### 14.4 The Lemniscate at #4 — Why the Context Frame Connection Is Primordial

The `(4.0/1-4.4/5)` context frame is the lemniscate anchor (from CLAUDE.md: "The Lemniscate
at #4 — the crucible where outward Torus process incubates deeper nested reality"). This is
geometrically correct:

A lemniscate (figure-8) is the self-intersection curve that appears when you attempt to
project a Klein bottle from 4D into 3D. At φ = 180° (the midpoint of the minor circle
traversal, CF sub-stage 3), the torus surface has developed enough that the pending Klein
identification creates an apparent self-intersection in 3D projection. That is the lemniscate.

The `(4.0/1-4.4/5)` context frame contains all six sub-positions (4.0 through 4.5), each
of which is a step toward the Klein identification. The lemniscate is not a metaphor for
this process — it IS the 3D projection artifact of the 4D Klein identification that sub-stage
4/5 will complete. The visualizer should render this as a brief lemniscatic distortion in
the torus silhouette when transitioning through sub-stage 3.

---

### 14.5 Spanda as Compiler — The PROVIDES_GENERATIVE_LOGIC_FOR Relation

**Spanda IS the compiler** that generates all downstream QL constants. This is not a metaphor.
The `PROVIDES_GENERATIVE_LOGIC_FOR` relation in m1 creates a 1:1 correspondence between
Spanda stages and QL Flowering stages — they are the same process viewed from two angles:
one as topological event (Spanda), one as constant cascade (QL Flowering).

**The Weave State Trajectory** — each Spanda pass mutates a PRATIBIMBA HC via
`SPANDA_COMPILER_PASSES[6]`, encoding the full topological journey in two fields:

```
Stage             weave_state   inversion_state   Topology
───────────────────────────────────────────────────────────
SPANDA_SEED       0.0f          0                 genus-0 sphere  (ground)
SPANDA_POLE_A     1.0f          0                 S⁰ differentiating (Mahamaya track)
SPANDA_POLE_B     1.0f          1                 CREATIVE PUNCTURE (Parashakti track)
SPANDA_TRIKA      1.5f          0                 genus-1 torus locked  ← first stable torus
SPANDA_FLOWERING  4.0f          0                 CF sub-stage development
SPANDA_META       5.0f          1                 Möbius identification / Klein closure
```

Key readings:
- Both POLE_A and POLE_B share `weave_state = 1.0f` — they are equal in magnitude, only
  `inversion_state` distinguishes them. This is the (0/1) oscillation encoded in two fields.
- TRIKA at `1.5f` = the midpoint between the two poles — mathematically: (1.0+1.0)/2 = 1.0f
  but ontologically 1.5f = the Trika synthesis, stable between the two 1.0f poles.
- FLOWERING jumps to `4.0f` — skipping 2.x and 3.x. This encodes that #4 (Context/Lemniscate)
  IS the flowering stage. The #4 archetype IS the CF sub-stage anchor.
- META at `5.0f` with `inversion_state = 1` = integration with the inversion applied =
  Möbius: synthesis with a twist, the `5/0` Möbius return bringing #5 back to #0.

**The QL_INVERT table** governs the Möbius return for all 6 positions:
```c
static const uint8_t QL_INVERT[6] = { 5u, 4u, 3u, 2u, 1u, 0u };
```
Position 0↔5, 1↔4, 2↔3 — perfect palindromic inversion. The 24 backbone nodes of the clock
ARE the palindromic positions in codon space where `QL_INVERT` maps a codon to itself (or
nearest neighbour). These are the stable amino-acid anchors at 15° intervals.

**The M1_M0_CROSSLINK[12]** — Möbius return wired into the 12-element ring:
```c
M1_M0_CROSSLINK[0..5]  = { Psychoid_0, ..., Psychoid_5 }   // ascending: 0→5
M1_M0_CROSSLINK[6..11] = { Psychoid_5, ..., Psychoid_0 }   // Möbius return: 5→0
```
Positions 6-11 of the ring ARE the Möbius return of positions 0-5. The SU(2) double-cover
IS this Möbius twist in discrete form: a full 360° traversal of the ring (12 steps) returns
you to the start WITH the Möbius flip applied — requiring a second 360° (720° total) to
genuinely close. `RING_SIZE = 12 = 6 + 6 = ascending + Möbius return`.

**The RING_QUATERNION_LUT[12]** — the 12 SU(2) ring positions as actual quaternions (60° steps):
```c
[0]  q = (1.000,  0.000, 0, 0)  — identity / ground state (central anchor)
[1]  q = (0.866,  0.500, 0, 0)  — 30° in SU(2) = 60° in SO(3)
[2]  q = (0.500,  0.866, 0, 0)  — 60° in SU(2) = 120° in SO(3)
[3]  q = (0.000,  1.000, 0, 0)  — 90° in SU(2) = 180° in SO(3) (the Trika midpoint)
[4]  q = (-0.500, 0.866, 0, 0)  — 120° in SU(2) = 240° in SO(3)
[5]  q = (-0.866, 0.500, 0, 0)  — 150° in SU(2) = 300° in SO(3)
[6]  q = (0.866, -0.500, 0, 0)  — Möbius return begins: conjugate of [1]
...
[11] q = (-1.000, 0.000, 0, 0)  — 330° in SU(2) = 660° in SO(3) (pre-closure)
```
Position [3] = `q = (0, 1, 0, 0)` = the pure imaginary quaternion **i** — this is SPANDA_TRIKA,
the first stable torus. The Trika IS the 90° SU(2) rotation = 180° in physical space, the
topological half-turn that creates the torus hole. The central clock node (central anchor,
position 0 by convention) maps to `q = (1, 0, 0, 0)` — the quaternionic identity, Quintessence.

---

## 15. The (0/1/2/3) Quaternary Architecture — The Clock as Unified Context Frame

*Added 2026-03-13 — the clock's four layers ARE the (0/1/2/3) context frame materialized.*

---

### 15.1 The Four Layers Are Not Arbitrary

The clock integrates M0, M1, M2, and M3. This is not because we chose four subsystems to
layer — it is because the clock IS the (0/1/2/3) context frame, which is itself the context
frame corresponding to `SPANDA_FLOWERING` sub-stage #3 (the dual-track, 10-fold, quaternary
structure). The four layers of the clock are the four positions of that context frame:

| Context frame position | Clock layer | What it contributes |
|---|---|---|
| **0** — Ground/Non-dual base | **M1 (Paramasiva)** | The tick engine. Spanda genesis. The `(0/1)` oscillation that generates the torus and drives all clock motion. The 12-fold ring via SU(2) × 6-fold. |
| **1** — Form/Symbolic language | **M0 (Anuttara)** | The archetypal language. 12 psychoid types. Vak operators. R-factors. The meaning of each tick position. M0 is the "table of elements" that M1-M3 consume. |
| **2** — Operation/Vibrational field | **M2 (Parashakti)** | The 36 tattvas × 2 = 72-name space. Elements, decans, planets, chakras, mantras. The vibrational coloring applied to every clock position. |
| **3** — Pattern/Symbolic-genetic code | **M3 (Mahamaya)** | The 64 hexagrams × 6 lines = 384 LINE_CHANGE space. The clock face itself. Binary transcription matrix. Tarot → codon → hexagram rotational states. |

**The (0/1/2/3) context frame IS the clock.** Position 0 is M1 (not M0) because the SEED
of the clock — the generating act — is spanda, which is M1. M0 is position 1 because it
provides FORM to the seed (the archetypal language is the first articulation of the seed).

---

### 15.2 The Mathematical Thread M0→M3

The through-line of the numbers, stated as equations:

```
STEP 0 — The seed:
  (0/1) = the oscillation itself, genus-0 sphere, S⁰

STEP 1 — The ratio:
  100% = 64 + 36
       = 2⁶ + 6²
       = 16/9 × 100/... [no — directly:]
  100% = P/P' + P×P' = 2⁶ + 6² = 64 + 36

STEP 2 — The ratio as torus:
  16/9 = 4²/3² = 2⁴/3²
  2⁴ = 4 doublings = Mahamaya doubling track {1,2,4,8,7,5} cycling through 4 positions
  3² = 2 triplings = Parashakti tripling track {3,6,9} × 2 implicate poles
  → 2⁴ : 3² = 4 explicate : 2 implicate = 4g + 2g = 6-fold torus (genus-1)

STEP 3 — The collapse to 12:
  (4²/3²) → under 0/1 dynamic tension → (4×3) = 12
  [Squares shed exponents: the static ratio becomes the processual product]
  12 = 6 × 2 = (4+2) × SU(2) double-cover
  → This IS the 12-fold clock ring (RING_SIZE = 12)

STEP 4 — The 72/64 bridge (Epogdoon 9:8):
  Parashakti full space: 36 × 2 = 72  (double-covered tattvas)
  Mahamaya word space:  64          (hexagrams)
  Ratio: 72/64 = 9/8 — the EPOGDOON, the Pythagorean whole tone
  This is the computational bridge between the two tracks:
  72 = 8 × 9    (9 = Paramesvara crown, 8 = structural reflection)
  64 = 8 × 8    (8² = structural reflection squared)
  9:8 epogdoon = the step UP from Mahamaya to Parashakti space

STEP 5 — The vortex mathematics:
  Mahamaya (doubling): DR cycle {1,2,4,8,7,5} — these are 2ⁿ mod 9
    2¹=2, 2²=4, 2³=8, 2⁴=16→7, 2⁵=32→5, 2⁶=64→1 [cycle closes at 64]
    → 64 IS the closure of the Mahamaya doubling track
  Parashakti (tripling): DR cycle {3,6,9,3,6,9} — these are 3ⁿ mod 9
    3¹=3, 3²=9, 3³=27→9, 3⁴=81→9 [collapses to 9=Paramesvara always after 3²]
    → 36 = 6² = the stable explicate Parashakti field before collapse

STEP 6 — The 9-crown (× 9 scaling):
  64 × 9 = 576 = 2⁶ × 3²   [Mahamaya × crown = binary track with ternary modulation]
  36 × 9 = 324 = 2² × 3⁴   [Parashakti static × crown]
  72 × 9 = 648 = 2³ × 3⁴   [Parashakti double-cover × crown]
  576 + 324 = 900 = 100% × 9  [The dynamic all — the totality scaled by Paramesvara]
  576 + 648 = 1224           [Contains 12 and 24 — the two backbone counts of the clock]

STEP 7 — The clock face:
  360 = 9 × 40 = 9 × (4 + 12 + 24)  [Paramesvara × structural totality]
  384 = 360 + 24 = 64 × 6            [LINE_CHANGE topology]
  385 = 360 + 24 + 1                 [Full clock node count]
  365 = 360 + 4 + 1                  [Solar year identity]
```

---

### 15.3 The Yin/Yang Foundation of the Mahamaya Language

The Mahamaya binary language is grounded in a specific numerical assignment:

```
Yin  = 2  (the even, the receptive, the return)
Yang = 3  (the odd, the generative, the outward)

I-Ching 3-coin method — coin flip values:
  Old Yin  (changing yin, sum=6):  yin+yin+yin   = 2+2+2 = 6   → maps to A (Adenine)
  Old Yang (changing yang, sum=9): yang+yang+yang = 3+3+3 = 9   → maps to T (Thymine)
  Young Yin  (stable yin,  sum=7): yang+yin+yin   = 3+2+2 = 7   → maps to C (Cytosine)
  Young Yang (stable yang, sum=8): yang+yang+yin  = 3+3+2 = 8   → maps to G (Guanine)

Therefore: A=6 (old yin), T=9 (old yang), C=7 (young yin), G=8 (young yang)
```

This is not assigned by convention — it is derived from the yin=2/yang=3 base values.
The "old" lines (changing, sum=6 or 9) hit the Parashakti tripling track (3,6,9).
The "young" lines (stable, sum=7 or 8) sit between — 7 is Archetype 7 (Divine Action,
the generative code 16/9), and 8 is Archetype 8 (Structural Reflection).

**Elemental families from nucleotides:**
```
A (6, old yin):  FIRE   family — the initiating, transformative line
T (9, old yang): EARTH  family — the completing, grounding line
C (7, young yin): AIR   family — the flowing, relational line
G (8, young yang): WATER family — the containing, receptive line

Quintessence/Akasha: emerges from BALANCE — low variance in {A,T,C,G} counts
  (nucleotide_balance_variance < threshold → Akasha activation)
```

These elemental assignments carry through:
```
Nucleotide → Elemental family → Chakra (via ELEMENT_CHAKRA[5])
          → Decan element (via ZODIAC_DECAN_TABLE[36])
          → Planet ruling decan (→ PLANET_CHAKRA[8])
          → Body zone (→ CHAKRA_BODY_ZONES[8])
          → Quaternionic charge (pp/nn/np/pn via m3_compute_charges())
```

The quaternionic charges (pp/nn/np/pn) map old/young × yin/yang:
```
pp (yang+yang = positive+positive): T-type (old yang) pairings
nn (yin+yin   = negative+negative): A-type (old yin) pairings
np (yang+yin  = positive+negative): G-type (young yang) → mixed
pn (yin+yang  = negative+positive): C-type (young yin) → mixed
```
This is the Mahamaya binary language as a COMPUTABLE SYSTEM — not flat data, but a
function from (codon-pair, coin-type) → (element, charge, body-zone, quaternion-orientation).

---

### 15.4 The 9:8 Epogdoon — Computational Bridge

The epogdoon (9:8, the Pythagorean whole tone) is the ratio between the two tracks:
```
Parashakti space: 72 (= M2_NAMES = MEF_DOUBLED = 36×2)
Mahamaya space:   64 (= M3_WORD = 2⁶)
Ratio: 72/64 = 9/8
```

This ratio is used computationally to translate a Mahamaya address (0-63, hexagram index)
into a Parashakti address (0-71, decan/tattva index):
```
mahamaya_to_parashakti(hex_index):
  → hex_index * 9 / 8   (scaled by 9:8)
  → Note: not lossless — this is an INTERPOLATION, the same way a musical
    whole tone step is an interpolation in the frequency domain
  → The "remainder" in this translation IS the epogdoon's productive gap:
    the 8 LINE_CHANGES per hexagram (64×8=512, not 64×6=384) that would be
    needed to fully span 72 — those 8 extra are the "between" states
```

In C: `#define EPOGDOON_NUM 9u` and `#define EPOGDOON_DEN 8u` are defined in `m1.h`
with `_Static_assert(MEF_DOUBLED * EPOGDOON_DEN == M3_WORD * EPOGDOON_NUM, "72*8 == 64*9 == 576")`
as a compile-time proof of the track bridge.

---

### 15.5 The (0000) Context Frame as Quaternary Ground in M0

The `(00/00)` context frame (CF_VOID, CF_0000) is M0's ground — "Receptive Dynamism,
Absolute Ground, Svatantrya-Spanda." In the (0/1/2/3) clock architecture, this is the
meta-frame that holds ALL four positions simultaneously before any differentiation:

```
(0000):  all four positions present but undifferentiated = the clock before it ticks
(0/1):   M1 differentiation = the first tick, the bimba/pratibimba split
(0/1/2): M2 vibrational field = the element/decan/planet space fully active
(0/1/2/3): M3 symbolic-genetic code = the full clock face operational
```

The quaternionic identity `q = (1, 0, 0, 0)` at the central clock node is the quaternion
that corresponds to the `(0000)` context frame — no rotation, no orientation bias, pure
receptive balance. This is WHY the Quintessence/Akasha emerges at the center: it is the
geometric expression of the `(0000)` ground state in 3D space.

The M4 quintessence identity hash, when it returns `q = (1, 0, 0, 0)`, is expressing the
same mathematical truth: this entity is in the `(0000)` state — in pure Paramesvara balance,
the clock's central node. All four elemental charges (pp/nn/np/pn) are equal; no element
dominates. Akasha prevails.

---

*Addendum version: 2.0 — 2026-03-13 (§14 + §15 added)*
