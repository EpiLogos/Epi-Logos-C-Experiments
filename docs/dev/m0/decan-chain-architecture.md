# M0→M1→M2 Zodiacal Decan Chain — Developer Reference

**Subsystem:** Cross-branch chain: M0 (Anuttara) → M1 (Paramasiva) → M2 (Parashakti)
**Source file:** `epi-cli/src/nara/medicine.rs`
**Context Frame:** CF_FRACTAL (4.0/1-4.4/5) — activated from M4 Nara (Kairos/Medicine)

---

## 1. Purpose

`ZodiacDecanEntry` and `ZODIAC_DECAN_TABLE[36]` are the canonical bridge struct
connecting three subsystems that would otherwise remain parallel but unlinked:

- **M0 Anuttara** (`epi-lib/src/m0.c`): defines the 12-fold zodiacal positional language via
  `ZODIACAL_LUT[12]`. Each entry encodes element (`ZOD_ELEM_*`) and mode (`ZOD_MODE_*`) for
  one zodiac sign. This is the lowest-level positional resonance — the sign index IS the M0
  archetypal position for that band of the ecliptic.

- **M1 Paramasiva** (`epi-lib/src/m1.c`): defines `ANANDA_BIMBA`, a 12×12 nibble-packed
  digital-root multiplication table. Row = zodiac sign (0-11); column = planet index (0-11).
  Each cell stores `DR(row × col)` where DR is the digital root (sum digits until single digit,
  9 → 9). This is the mathematical substrate beneath all decan vibration — not a label but
  the irreducible harmonic of a (sign, planet) meeting.

- **M2 Parashakti** (`docs/datasets/parashakti-deep/`): the 36 decan nodes (coordinates
  `#2-3-x-y-z`), each carrying concrete material data: `zodiacSign`, `planetaryRuler`,
  `bodyPart`, `herbalism_herbs`, `element`.

The decan chain makes these three layers co-present in a single zero-cost struct held in
`.rodata`. Any code path that resolves a decan index — whether from a live ecliptic degree
(M4 Kairos), a Tarot pip card (M3 oracle), or direct index — gets the full M0→M1→M2
chain in one lookup. No chain-walking at runtime.

---

## 2. ZodiacDecanEntry Struct

Defined at the top of `epi-cli/src/nara/medicine.rs`:

```rust
pub struct ZodiacDecanEntry {
    pub sign:            u8,
    pub decan_in_sign:   u8,
    pub ruling_planet:   u8,
    pub element:         u8,
    pub mode:            u8,
    pub ananda_harmonic: u8,
    pub body_part:       &'static str,
    pub herb:            &'static str,
}
```

### Field-by-field

| Field | Type | Source | Meaning |
|-------|------|--------|---------|
| `sign` | `u8` | M0 `ZODIACAL_LUT` index | Zodiac sign: 0=Aries … 11=Pisces. Also the row index into M1 `ANANDA_BIMBA`. |
| `decan_in_sign` | `u8` | Decan ordering | Position within the sign: 0=first 10°, 1=second 10°, 2=third 10°. |
| `ruling_planet` | `u8` | M2 dataset `planetaryRuler`; Chaldean system | Planet_Id: SUN=0, EARTH=1 (unused in decan assignments), VENUS=2, MERCURY=3, MOON=4, SATURN=5, JUPITER=6, MARS=7. Also the column index into M1 `ANANDA_BIMBA`. |
| `element` | `u8` | M0 `ZOD_GET_ELEMENT(zodiacal_quality)` | Tattva element of the sign: 0=Akasha, 1=Air, 2=Fire, 3=Water, 4=Earth. Follows the repeating Fire/Earth/Air/Water cycle across the 12 signs. |
| `mode` | `u8` | M0 `ZOD_GET_MODALITY(zodiacal_quality)` | Cardinal=0, Fixed=1, Mutable=2. See section 7. |
| `ananda_harmonic` | `u8` | M1 `ANANDA_BIMBA[sign][ruling_planet]` | Digital root of (sign × ruling_planet). The vibrational resonance of this (sign, planet) pairing in Paramasiva's mathematical substrate. NOT a label — a computed mathematical property. |
| `body_part` | `&'static str` | M2 dataset `bodyPart` property of decan node | Anatomical region governed by this decan. From `parashakti-deep/nodes-full-detail.json`. |
| `herb` | `&'static str` | M2 dataset `herbalism_herbs` (first entry) | Primary herb associated with this decan's planetary and elemental signature. |

### Philosophical ground of each field

`sign` and `element`/`mode` are M0 Anuttara's 12-fold positional language: the ground
before differentiation into planets or body parts. `ruling_planet` is M2 Parashakti's
concrete assignment from the Chaldean system — the specific creative force presiding over
that 10° band. `ananda_harmonic` is M1 Paramasiva's commentary on their meeting: the
digital root distills the numerical resonance of (sign × planet) to its irreducible seed.
`body_part` and `herb` are M2 material: the sympathetic correspondences that make the
abstract chain clinically actionable.

---

## 3. ZODIAC_DECAN_TABLE[36]

```rust
pub static ZODIAC_DECAN_TABLE: [ZodiacDecanEntry; 36] = [ ... ];
```

The 36-decan master table. Resides in `.rodata` — immutable, zero allocation cost.

**Index ordering:** strictly zodiacal.

```
Index  0- 2: Aries (sign 0) decans 0/1/2
Index  3- 5: Taurus (sign 1) decans 0/1/2
Index  6- 8: Gemini (sign 2) decans 0/1/2
Index  9-11: Cancer (sign 3) decans 0/1/2
Index 12-14: Leo (sign 4) decans 0/1/2
Index 15-17: Virgo (sign 5) decans 0/1/2
Index 18-20: Libra (sign 6) decans 0/1/2
Index 21-23: Scorpio (sign 7) decans 0/1/2
Index 24-26: Sagittarius (sign 8) decans 0/1/2
Index 27-29: Capricorn (sign 9) decans 0/1/2
Index 30-32: Aquarius (sign 10) decans 0/1/2
Index 33-35: Pisces (sign 11) decans 0/1/2
```

### Accessor functions

```rust
/// Canonical decan entry for a decan index (0-35).
/// Returns None only if index >= 36.
pub fn zodiac_decan(decan_index: u8) -> Option<&'static ZodiacDecanEntry>

/// Decan index for a live ecliptic degree (0.0–360.0).
/// 360° / 36 decans = 10° per decan.  rem_euclid handles negative input gracefully.
pub fn decan_for_degree(degree: f32) -> u8

/// Decan index for a given sign (0-11) and position within sign (0-2).
pub fn decan_for_sign_pos(sign: u8, pos_in_sign: u8) -> u8
```

`decan_for_degree` is the Kairos entry point. `decan_for_sign_pos` is the oracle/tarot
entry point (sign and decan position are already known from `PIP_DECAN_MAP`). Both funnel
into `zodiac_decan()` which is the single authoritative read path for the full struct.

---

## 4. Ananda Harmonic Patterns

The `ananda_harmonic` field carries the full character of M1 `ANANDA_BIMBA`. Because
`ANANDA_BIMBA` is the digital-root multiplication table, rows and columns have known
mathematical shapes. The decans expose a subset of those shapes — three decans per sign
hit three columns (the three Chaldean planets ruling that sign's decans), producing
three consecutive cells of the row.

### Notable rows in ANANDA_BIMBA (as they appear in ZODIAC_DECAN_TABLE)

**Aries (sign=0) — row 0: all zeros**

`DR(0 × anything) = 0`. Aries is pre-numerical: the void-ground of pure initiatory
fire before any harmonic differentiation. All three Aries decans carry `ananda_harmonic:
0` regardless of their ruling planets (Mars=7, Sun=0, Venus=2). This is not absence but
the ground state — Anuttara's silence prior to vibration.

**Cancer (sign=3) — row 3: the {3,6,9} tripling ring**

Row 3 of `ANANDA_BIMBA` is `{0,3,6,9,3,6,9,3,6,9,3,6}`. The three Cancer decans
use planets Venus=2, Mercury=3, Moon=4, giving harmonics `DR(3×2)=6`, `DR(3×3)=9`,
`DR(3×4)=12→3`. Result: `{6,9,3}` — the Parashakti tripling ring (`DR_RING_PARASHAKTI`
in `m1.c`) expressed directly in body-sympathy space. Cancer is Water/Cardinal: the
initiatory emotional ground where Parashakti's tripling pattern first becomes material.

**Libra (sign=6) — row 6: {3,6,9} ring again, as Air reflection of Cancer**

Row 6 gives `{0,6,3,9,6,3,9,6,3,9,6,3}`. Libra's three decans (Moon=4, Saturn=5,
Jupiter=6) yield `DR(6×4)=6`, `DR(6×5)=3`, `DR(6×6)=9`. Again `{6,3,9}` — the tripling
ring rotating phase. Libra is Air/Cardinal: the relational pivot of the zodiac mirrors
Cancer's emotional structure in the mental-relational domain. The `DR(6×6)=36→9` cell
(Libra decan 3, Jupiter) carries a comment in source: "alchemical saturation in the
relational pivot."

**Capricorn (sign=9) — row 9: all 9s (after position zero)**

`DR(9 × n) = 9` for all n ≠ 0, and `DR(9 × 0) = 0`. Row 9 is `{0,9,9,9,9,9,9,9,9,9,9,9}`.
The three Capricorn decans use Jupiter=6, Mars=7, Sun=0, giving `{9,9,0}`. The first two
are full saturation — 9 is the digital-root fixed point of all multiples of 9. The third
(Sun at Capricorn decan 3, `ananda_harmonic: 0`) is the solstice return: the solar
maximum returns to void, beginning the Möbius cycle back to Aries.

**Aquarius (sign=10) — row 10: shadow of row 1 (Taurus)**

Rows 10 and 11 in `ANANDA_BIMBA` are explicitly declared as shadow extensions of rows 1
and 2. Row 10 = row 1 = `{0,1,2,3,4,5,6,7,8,9,1,2}`. Aquarius (Air/Fixed) is the
night-mirror of Taurus (Earth/Fixed): same modal energy, complementary element.
Aquarius decan harmonics for Venus=2, Mercury=3, Moon=4 are `{2,3,4}` — the identity
row expressing undifferentiated sequential numerals, fitting Aquarius's archetype of
abstract universality.

**Pisces (sign=11) — row 11: shadow of row 2 (Gemini), Möbius return**

Row 11 = row 2 = `{0,2,4,6,8,1,3,5,7,9,2,4}`. Pisces (Water/Mutable) is the
night-mirror of Gemini (Air/Mutable). Pisces decan harmonics for Saturn=5, Jupiter=6,
Mars=7 are `{1,3,5}` — the source comment reads "unity from dissolution" for the first
and "synthesis before Möbius return" for the third. After Pisces decan 3, the cycle
returns to Aries decan 0 (harmonic 0) — the Möbius fold from #5 (Integration/Pratibimba)
back to #0 (Ground/Bimba).

---

## 5. Call Chains

Three primary entry points feed the decan chain from different M-subsystems.

### 5a. Kairos live degree → body zones (M4 path)

```
M4 Kairos: planet_degrees[planet_id]  (f32, 0.0–360.0 ecliptic degree)
    │
    ▼
decan_for_degree(degree: f32) -> u8
    │  floor(degree / 10.0)  →  decan index 0-35
    ▼
zodiac_decan(decan_index) -> Option<&ZodiacDecanEntry>
    │
    ├─► entry.ruling_planet  → planet_id (u8)
    │       │
    │       ▼
    │   PLANET_CHAKRA[planet_id]  → chakra_id (u8)
    │       │
    │       ▼
    │   CHAKRA_BODY_ZONES[chakra_id]  → &[&str]  (anatomical zones)
    │
    ├─► entry.body_part   (specific decan body part from M2 dataset)
    ├─► entry.herb        (materia medica for this decan)
    ├─► entry.element     (tattva, for elemental prescriptions)
    └─► entry.ananda_harmonic  (M1 vibrational resonance for this moment)
```

This path is triggered when Kairos resolves the user's current planetary positions.
The live Sun degree, for instance, enters `decan_for_degree()` and produces the active
solar decan, which then carries the full body and herb chain for the present moment.

### 5b. Oracle cast → Tarot pip → body zones (M3 path)

```
M3 Oracle: cast tarot pip card (suit: 0-3, value: 2-10)
    │
    ▼
oracle.rs: pip_decan_lookup(suit, value) -> Option<PipDecanEntry>
    │  PIP_DECAN_MAP[suit][value - 2]
    │  returns { zodiac_sign, decan, ruling_planet }
    ▼
decan_for_sign_pos(sign: u8, pos_in_sign: u8) -> u8
    │  sign * 3 + pos_in_sign
    ▼
zodiac_decan(decan_index) -> Option<&ZodiacDecanEntry>
    │
    └─► (same downstream as 5a)
```

`PIP_DECAN_MAP` in `oracle.rs` uses Golden Dawn / Thoth Tarot decan assignments.
Every pip card 2-10 maps to a specific decan of its elemental triplicity (Cups=Water,
Wands=Fire, Pentacles=Earth, Swords=Air). The resulting `PipDecanEntry.zodiac_sign`
and `PipDecanEntry.decan` feed directly into `decan_for_sign_pos()`.

### 5c. Direct decan index (reference/diagnostic path)

```
decan_index: u8  (0-35, e.g. from a stored oracle result or CLI argument)
    │
    ▼
zodiac_decan(decan_index) -> Option<&ZodiacDecanEntry>
    │
    └─► full entry: sign, decan_in_sign, ruling_planet, element, mode,
                    ananda_harmonic, body_part, herb
```

Use this for display commands, serialisation, or any case where the index is already
known (e.g. when serialising an oracle history entry that stored the decan index at
cast time).

---

## 6. Deprecated Items: DECAN_BODY_PARTS and DECAN_HERBS

Prior to the introduction of `ZodiacDecanEntry`, body and herb data were held in two
flat arrays:

```rust
#[deprecated(note = "Use ZODIAC_DECAN_TABLE[i].body_part — canonical M0→M1→M2 struct")]
pub static DECAN_BODY_PARTS: [&str; 36] = [ ... ];

#[deprecated(note = "Use ZODIAC_DECAN_TABLE[i].herb — canonical M0→M1→M2 struct")]
pub static DECAN_HERBS: [&str; 36] = [ ... ];
```

Both arrays are still present and their data is identical to the corresponding struct
fields. They are kept temporarily to avoid breaking any callers that were written against
the flat-array API before the struct was introduced.

**Migration:** replace all reads of `DECAN_BODY_PARTS[i]` and `DECAN_HERBS[i]` with
calls to `zodiac_decan(i as u8)` and access of `.body_part` / `.herb`. The flat arrays
will be removed once all call sites are migrated. The Rust `#[deprecated]` attribute
will produce compiler warnings at call sites to track this.

**Reason for the change:** flat arrays break the chain. A caller holding `DECAN_BODY_PARTS[i]`
has the M2 data but none of the M0 element/mode context or the M1 ananda_harmonic —
they must separately consult `ZODIACAL_LUT` or `ANANDA_BIMBA` or reconstruct the sign
from `i / 3`. The struct enforces co-presence: all three layers travel together.

---

## 7. Mode Field: Cardinal, Fixed, Mutable

The `mode` field in `ZodiacDecanEntry` comes from M0 `ZOD_GET_MODALITY(zodiacal_quality)`.

| Value | Name | Signs | Significance |
|-------|------|-------|--------------|
| 0 | Cardinal | Aries, Cancer, Libra, Capricorn | Initiating force. The four Cardinal signs open the seasonal quarters. In the decan chain, Cardinal decans are entry points — new processes beginning. |
| 1 | Fixed | Taurus, Leo, Scorpio, Aquarius | Stabilising force. Fixed decans consolidate and crystallise what Cardinal initiated. Alchemically: fixatio. |
| 2 | Mutable | Gemini, Virgo, Sagittarius, Pisces | Transforming force. Mutable decans dissolve and prepare transition to the next Cardinal. Alchemically: solutio. |

Mode is significant in three contexts:

1. **Prescription emphasis**: Cardinal = acute/initiating treatment; Fixed = tonic/sustaining
   treatment; Mutable = cleansing/transitional treatment.

2. **Ananda_harmonic texture**: Cardinal signs 0, 3, 6, 9 carry the most
   structurally distinctive ANANDA_BIMBA rows (all-zero, tripling ring, tripling ring,
   all-nine). The Mutable signs 2, 5, 8, 11 carry rows with strong alternating or
   descending patterns. Fixed signs 1, 4, 7, 10 and their shadows run the identity
   sequences and complementary inversions.

3. **Cosmic clock integration**: `m0_read_cosmic_clock(degree)` (from `m0.h`) decomposes
   a degree into `m2_decan_phase` (0-71, covering both explicate and implicate hemispheres).
   The modality of the active decan anchors that cosmic clock reading to the
   initiating/stabilising/transforming quality of that moment.

---

## 8. Element Encoding Correspondence

The `element` field uses the same encoding as M2 parashakti and M0 ZODIACAL_LUT:

| Value | Name | Signs | CHAKRA_BODY_ZONES via ELEMENT_CHAKRA |
|-------|------|-------|---------------------------------------|
| 0 | Akasha/Ether | (none in standard zodiac) | Vishuddha (5) |
| 1 | Air | Gemini, Libra, Aquarius | Anahata (4) |
| 2 | Fire | Aries, Leo, Sagittarius | Manipura (3) |
| 3 | Water | Cancer, Scorpio, Pisces | Svadhisthana (2) |
| 4 | Earth | Taurus, Virgo, Capricorn | Muladhara (1) |

`ELEMENT_CHAKRA[element]` gives the associated chakra id; `CHAKRA_BODY_ZONES[chakra_id]`
gives the full anatomical zone set. This element→chakra path is secondary to the
ruling_planet→chakra path; it is used when elemental prescription takes priority over
planetary (e.g. elemental balancing from `SIGN_ELEMENT` + `ELEMENT_CHAKRA`).

---

## 9. Planet_Id and Chakra Mapping

Complete planet→chakra mapping via `PLANET_CHAKRA[8]` (from M2 `PLANETARY_RESONANCE`
relations in `relations.json`):

| Planet_Id | Name | Chakra_Id | Chakra Name | Dataset coordinate |
|-----------|------|-----------|-------------|--------------------|
| 0 | Sun | 7 | Sahasrara | `#2-5-0/1` → `#2-5-0/1-7` |
| 1 | Earth | 0 | Physical Ground | `#2` ChakralGrounding |
| 2 | Venus | 4 | Anahata | `#2-5-2` → `#2-5-0/1-4` |
| 3 | Mercury | 5 | Vishuddha | `#2-5-3` → `#2-5-0/1-5` |
| 4 | Moon | 6 | Ajna | `#2-5-4` → `#2-5-0/1-6` |
| 5 | Saturn | 1 | Muladhara | `#2-5-5` → `#2-5-0/1-1` |
| 6 | Jupiter | 2 | Svadhisthana | `#2-5-6` → `#2-5-0/1-2` |
| 7 | Mars | 3 | Manipura | `#2-5-7` → `#2-5-0/1-3` |

Earth (Planet_Id=1) has no role in the Chaldean decan system — it appears in
`ruling_planet` only in error. `PLANET_CHAKRA[1] = 0` maps it to the physical ground
chakra as a safe fallback.

---

## 10. Source Files

| File | Role |
|------|------|
| `epi-cli/src/nara/medicine.rs` | `ZodiacDecanEntry`, `ZODIAC_DECAN_TABLE[36]`, `CHAKRA_BODY_ZONES[8]`, `PLANET_CHAKRA[8]`, `ELEMENT_CHAKRA[5]`, `SIGN_ELEMENT[12]`, all accessor functions |
| `epi-cli/src/nara/oracle.rs` | `PipDecanEntry`, `PIP_DECAN_MAP[4][9]` — Tarot→decan bridge |
| `epi-lib/src/m0.c` | `ZODIACAL_LUT[12]` — sign element and mode encoding |
| `epi-lib/include/m0.h` | `ZOD_ELEM_*`, `ZOD_MODE_*`, `ZOD_GET_ELEMENT()`, `ZOD_GET_MODALITY()` macros |
| `epi-lib/src/m1.c` | `ANANDA_BIMBA` 12×12 digital-root matrix; `DR_RING_PARASHAKTI[6]`, `DR_RING_MAHAMAYA[6]` |
| `docs/datasets/parashakti-deep/nodes-full-detail.json` | M2 source: decan `bodyPart`, `herbalism_herbs`, `planetaryRuler`, `zodiacSign` |
| `docs/datasets/parashakti-deep/relations.json` | M2 source: `PLANETARY_RESONANCE` edges → `PLANET_CHAKRA` |

---

## 11. Key Invariants

1. **Decan index = sign × 3 + decan_in_sign.** This is the canonical bijection and is
   maintained by `decan_for_sign_pos()`. Do not compute decan indices any other way.

2. **`ananda_harmonic` must equal `DR(sign × ruling_planet)`.** This is not validated at
   runtime (the table is `.rodata`) but is verified by the comment on each entry. Any
   future modification to ruling planet assignments must recompute all affected harmonics.

3. **Rows 10-11 of ANANDA_BIMBA are shadows of rows 1-2.** Aquarius (sign=10) and Pisces
   (sign=11) therefore share their harmonic pattern with Taurus and Gemini respectively.
   This is intentional and architecturally meaningful (see section 4 Möbius return).

4. **DECAN_BODY_PARTS and DECAN_HERBS are deprecated.** Their data is identical to the
   corresponding struct fields. New code must not use the flat arrays.

5. **`decan_for_degree` uses `rem_euclid` to handle wraparound.** Input degrees outside
   0.0–360.0 are normalised. The result is always in 0-35.

6. **PLANET_CHAKRA[1] (Earth) = 0 (Ground).** Earth is not a Chaldean decan ruler;
   this entry exists as a safe fallback and should never appear as a `ruling_planet`
   in a `ZodiacDecanEntry`.
