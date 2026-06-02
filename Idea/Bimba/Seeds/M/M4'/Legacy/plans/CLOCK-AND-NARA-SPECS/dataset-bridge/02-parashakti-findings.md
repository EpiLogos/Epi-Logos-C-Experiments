# Parashakti M2 Dataset Bridge — Findings

**Status:** Complete (2026-03-19)
**Dataset:** `docs/datasets/parashakti-deep/nodes-full-detail.json` + `relations.json` + `parashakti-planets.json`

---

## §1 X-Formula Nodes

X-formulas exist as **semantic/conceptual references embedded in node descriptions**, not as
discrete labeled nodes with explicit "X5" naming.

Key finding: The 9:8 ratio IS explicit in the dataset at **`#2-5`** (Planetary Harmonic Integration):
> "4/5 interpenetration via 8×9=72 ↔ 9:8 ratio"

The wholeness/9 count emerges from the (8+1) split: 8 spinor dimensions + 1 scalar identity = 9.
This is the Parashakti expression of what the computation files call X5.

**Implication for specs:** X-formula node coordinates are not discretely addressable in the
current dataset. The 9:8 ratio lives at `#2-5`. A dedicated `#2-5-X5` node should be formally
created or the formula should be attributed to `#2-5` directly.

---

## §2 Element System and Quaternion Mapping

Element nodes exist in the dataset but the canonical quaternion component assignments
(`[w=EARTH, x=FIRE, y=WATER, z=AIR]`) are **specification-level design choices**, not
properties instantiated on dataset nodes.

Element nodes found (under parashakti, astrological element system):
- Fire Element Decans
- Water Element Decans
- Earth Element Decans
- Air Element Decans
- Quintessence Element (5th = U in transcriptional bridge — confirms U-as-Akasha mapping)

**Status:** The quaternion mapping is architecturally correct per spec 00 §3 and spec 12.
It does not need to be in the dataset — it belongs in implementation specs.

---

## §3 Element ↔ Nucleotide Mapping

**No explicit node-level mapping found** for FIRE=A, WATER=G, EARTH=T, AIR=C.

The bridge lives at the **M2→M3 boundary**: Parashakti holds the element/planet/chakra
system; Mahamaya holds the codon/nucleotide system. The element-nucleotide correspondence
emerges from the crossing of these two branches, not from within either branch alone.

**Implication:** The canonical mapping (FIRE=A(nn), WATER=G(np), EARTH=T(pp), AIR=C(pn))
should be documented in the cross-layer bridge spec (`04-cross-layer-addressibility.md`)
as a **junction property** between M2 and M3 coordinates — not expected to appear in
either dataset in isolation.

---

## §4 Planet Nodes (Mod-10 System)

### CRITICAL DISCREPANCY

The `parashakti-planets.json` dataset contains **7 classical planets + Earth + 8 chakras**,
NOT the canonical 10-fold system.

Full structure of `parashakti-planets.json`:

| Index | Name | Bimba Coordinate |
|-------|------|-----------------|
| 0 | Planetary Harmonic Integration | `#2-5` |
| 1 | Sun | `#2-5-0/1` |
| 2 | Venus | `#2-5-2` |
| 3 | Mercury | `#2-5-3` |
| 4 | Moon | `#2-5-4` |
| 5 | Saturn | `#2-5-5` |
| 6 | Jupiter | `#2-5-6` |
| 7 | Mars | `#2-5-7` |
| 8 | Planet Earth | `#2-5-0/1-0` |
| 9–15 | Mūlādhāra–Sahasrāra (7 chakras) | `#2-5-0/1-1` through `#2-5-0/1-7` |

**Missing:** Uranus (`#2-5-8`?), Neptune (`#2-5-9`?), Pluto (`#2-5-10`?) — the three
transpersonal outer planets required for the canonical mod-10 system.

**Planet ordering discrepancy:** Current dataset has classical order (Venus=2, Mercury=3,
Moon=4, Saturn=5, Jupiter=6, Mars=7). Canonical spec 00 §2 requires Sun(0), Moon(1),
Mercury(2), Venus(3), Mars(4), Jupiter(5), Saturn(6), Uranus(7), Neptune(8), Pluto(9).

**This is the known migration issue noted in spec 00 §2** (the `m2.h` `Planet_Id` enum
non-canonical ordering). The dataset confirms the legacy ordering. Adding the three
outer planets and reordering to canonical requires Parashakti dataset reconciliation —
as flagged, this is a **FUTURE TASK** but now has a specific coordinate path.

**Earth position:** `#2-5-0/1-0` — confirmed as the geocentric center/observer, distinct
from the 7 chakra nodes. EarthBody is at the root of the chakra sub-tree, not a planet peer.

---

## §5 Chakra ↔ Planet Mapping

**Confirmed from dataset with coordinates:**

| Bimba Coordinate | Chakra | Anatomical Location (from dataset) |
|---|---|---|
| `#2-5-0/1-0` | CHAKRA_EARTH / EarthBody | Geocentric center / observer |
| `#2-5-0/1-1` | Mūlādhāra (Root) | Lower abdomen, sacral region, reproductive organs |
| `#2-5-0/1-2` | Svādhiṣṭhāna (Sacral) | Solar plexus, upper abdomen, digestive system |
| `#2-5-0/1-3` | Maṇipūra (Solar Plexus) | Heart region, chest center, cardiac plexus |
| `#2-5-0/1-4` | Anāhata (Heart) | Throat region, thyroid, vocal apparatus |
| `#2-5-0/1-5` | Viśuddha (Throat) | Between eyebrows, pineal gland, third eye |
| `#2-5-0/1-6` | Ājñā (Third Eye) | Crown of head, fontanelle, cerebral cortex |
| `#2-5-0/1-7` | Sahasrāra (Crown) | (exact anatomical strings in dataset) |

The `PLANETARY_RESONANCE` relation type is specified in computation files. Present as
a relation type in `relations.json` — exact source/target node pairing needs confirmation
from Mahamaya subagent (which bridges planets to decan/tarot correspondences).

---

## §6 Chakra Body Zones

Dataset contains **qualitative anatomical location strings** on each chakra node, not
pre-structured arrays. Our `CHAKRA_BODY_ZONES[8]` C LUT was correctly built from these
`anatomicalLocation` properties.

Canonical source: `#2-5-0/1-0` through `#2-5-0/1-7` — 8 nodes, indexed 0 (EarthBody)
through 7 (Sahasrāra). The existing LUT implementation is correct.

---

## §7 Decan Body Parts

### Important Discovery: Shadow Decans Already in M2

The dataset has **36 decans × 3 variants = 108 total decan nodes** under `#2-3`:
- **36 primary decan nodes** (12 zodiac signs × 3 decans each)
- **36 Light decan nodes**
- **36 Shadow decan nodes**

Each carries a `bodyPart` property (e.g., "Eyes and sinuses — the vision centers").

**Coordinate path:** `#2-3-{sign}-{decan_within_sign}` and variants for light/shadow.

**Implication for spec 13:** The shadow decan double-cover exists NATIVELY in M2 as
dedicated shadow decan nodes — not just as `reversedMeaning` on Mahamaya pip cards.
This means:
- M2 (`#2-3`) carries the structural decan polarity (archetypal light/shadow)
- M3 (`#3-4`) carries the tarot expression of that polarity (upright/reversed pip)
- Both point to the same body zone — but from different levels of integration

`DECAN_BODY_PARTS[36]` should reference `#2-3` coordinates. A full `DECAN_TABLE[72]`
(36 light + 36 shadow) should reference `#2-3` light/shadow variant nodes directly.

---

## §8 Relations Structure

**60+ unique relation types found** in `relations.json`. Key categories:

**Astronomical/Elemental:**
- `PLANETARY_RESONANCE` (planets→chakras — spec prediction confirmed)
- `elemental_precipitation`, `consciousness_polarity`, `archetypal_embodiment`

**Structural/Mathematical:**
- `sacred_trika_foundation`, `mathematical_expression`, `computational_operationalization`

**Vibrational/Bridge:**
- `vibrational_animation`, and 50+ others

**Cross-branch relations (M2 ↔ M3):**
- `#2` ↔ `#3`: "Mahamaya Systems — 3-letter genetic codons" (explicit cross-branch link)
- `#2-5` ↔ `#2-3`: "72 Names provide dual correspondence to each 10° decan segment (72÷36=2 names per decan)"

The 72 Names / 72 divine names (M0-4 layer) provide **2 names per decan** — confirming
the 72-fold decan double-cover from the M0 perspective as well.

---

## §9 Epogdoon / 9:8 Ratio

**Explicitly present in dataset at `#2-5`:**
> "Planetary Harmonic Integration — 4/5 interpenetration via 8×9=72 ↔ 9:8 ratio"

Mathematical derivation in dataset:
- 9 = full spinor space (8 dimensions) + scalar identity (1)
- 8 = trigrams / chakra sites / spinor basis vectors
- 9:8 = non-Sun planets : chakra/trigram sites
- This ratio emerges from the split quaternion eigenstructure (Clifford computation)

**Canonical address for epogdoon:** `#2-5` (Planetary Harmonic Integration).

---

## §10 Vibrational Template (72-Fold)

Partially present in dataset:

**Present:**
- Spanda sequence at `#2-5`: 2, 3, 6, 9, 18, 36, 72 (vortex mathematics progression)
- 72 Names system: provides "dual correspondence to each 10° decan segment"
- 72-bit framework referenced in `#2-5` vibrational architecture

**Not yet instantiated:**
- No `VIBRATIONAL_TEMPLATE[72]` array in current dataset
- Construction path: 36 decan light nodes + 36 decan shadow nodes (already in M2 at `#2-3`)

---

## §11 Gaps and Discrepancies with Current Specs

| Gap | Location | Required Action |
|-----|----------|-----------------|
| Missing Uranus/Neptune/Pluto | `parashakti-planets.json` | Add `#2-5-8`, `#2-5-9`, `#2-5-10` (future task) |
| Legacy planet ordering | `parashakti-planets.json` | Reorder to canonical mod-10 (known migration) |
| Shadow decan nodes already in M2 | Spec 13 didn't reference M2 | Update spec 13 to reference `#2-3` shadow nodes |
| X-formula nodes not discrete | Computation files | Note X5 lives at `#2-5` as integrated property |
| Element-nucleotide bridge at M2/M3 junction | No spec covers this | Document in cross-layer bridge spec |
| 72-fold template buildable from `#2-3` | No build script yet | Script: extract 36 light + 36 shadow decan nodes |

---

## §12 Proposed Spec Additions

1. **`#2-5` = canonical coordinate for epogdoon and Planetary Harmonic Integration** — all
   references to the 9:8 ratio should cite `#2-5`.

2. **`#2-5-0/1-{0-7}` = canonical chakra coordinate addresses** — these should be the
   source coordinates for `CHAKRA_BODY_ZONES[8]` LUT in implementation.

3. **`#2-3-{sign}-{decan}` = canonical decan coordinate** — the `DECAN_TABLE` in both C
   and Rust should reference these addresses. Light/shadow variants are distinct coordinate
   nodes, not just properties.

4. **72-fold template path:** `VIBRATIONAL_TEMPLATE[72]` = 36 light decan nodes (`#2-3-...-light`)
   + 36 shadow decan nodes (`#2-3-...-shadow`) — same body part coordinate, different
   expression polarity.

5. **Outer planet migration task:** Add `#2-5-8` (Uranus), `#2-5-9` (Neptune), `#2-5-10`
   (Pluto) as transpersonal planet nodes to complete canonical mod-10 system.
