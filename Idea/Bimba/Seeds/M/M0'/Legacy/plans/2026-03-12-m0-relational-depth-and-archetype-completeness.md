# M0 Relational Depth & Archetype Completeness Plan

**Date:** 2026-03-12
**Status:** Active
**Companion:** `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-11-m-branch-nara-integration-clarity.md`
**Audit source:** `docs/dev/m0/dataset-audit.md`

---

## PREREQUISITE P-1: Global Inversion Routing via COORD_REGISTRY (MUST BE CLEAR BEFORE IMPL)

**Status:** CLARIFIED 2026-03-12 — no code yet; governs Sprint 1 struct work

### The Pattern

Bit 63 on a pointer is **execution logic** — it signals to runtime traversal code "apply the # operation here." The actual routing target must be resolvable globally, which requires a flat coordinate registry:

```c
// Global coordinate registry — all 84 instances (72 family coords + 12 raw archetypes)
// Indexed by [family_enum][raw_archetype_0_5][inversion_0_1]
// NONE family (index 6) holds the 6 raw archetypes (#0-#5) at inversion=0
// and their inverses (#0'-#5') at inversion=1
extern Coordinate* COORD_REGISTRY[7][6][2];

// The # operation as a global function — canonical routing
static inline Coordinate* coord_invert(Coordinate* c) {
    uint8_t fam = c->family;      // 0-6
    uint8_t pos = c->raw_archetype; // 0-5
    uint8_t inv = c->inversion_state;
    return COORD_REGISTRY[fam][pos][1 - inv];  // flip inversion index
}

// Execution-time resolution of a tagged pointer
#define GET_INVERSE(ptr)  coord_invert(GET_PTR(ptr))
#define IS_INVERTED(ptr)  ((uintptr_t)(ptr) >> 63)
```

The bit 63 tag on a stored pointer means: "this link itself is the # operation." At traversal time, `IS_INVERTED(ptr)` tells the execution logic to call `coord_invert()` to reach the actual target. This separates:
- **What the pointer says** (bit 63 = "# was applied in arriving here")
- **Where to go** (COORD_REGISTRY lookup = canonical routing, not pointer arithmetic)

### Primordial Instantiation: # and #0-#5

The COORD_REGISTRY is first populated at the `NONE` family level — the raw archetypes themselves:

```
COORD_REGISTRY[NONE][0][0] = &#0    (raw archetype, normal)
COORD_REGISTRY[NONE][0][1] = &#0'   (raw archetype, inverted)
...
COORD_REGISTRY[NONE][5][0] = &#5
COORD_REGISTRY[NONE][5][1] = &#5'
```

These 12 entries form the **primordial context frame relational web** — the # operation instantiated between the archetypes themselves before any family coordinate exists. Each raw archetype `#n` relates to its inverse `#n'` through the # operation, and each pair encapsulates the psychoid number of its position:

| Archetype pair | Psychoid number | Context frame encapsulated | Primordial meaning |
|----------------|-----------------|----------------------------|--------------------|
| #0 / #0' | 0 (Mod %) | `(00/00)` — Receptive Dynamism | Ground / Groundlessness |
| #1 / #1' | 1 (Mod 1) | `(0/1)` — Non-dual binary | Form / Formlessness |
| #2 / #2' | 2 (Mod 2) | `(0/1/2)` — Trika | Operation / Its shadow |
| #3 / #3' | 3 (Mod 3) | `(0/1/2/3)` — Quaternity | Pattern / Counter-pattern |
| #4 / #4' | 4 (Mod 4/6) | `(4.0/1-4.4/5)` — Fractal doubling | Context / Lemniscate |
| #5 / #5' | 5 (Mod 6) | `(5/0)` — Möbius return | Synthesis / Dissolution |

The context frame each archetype pair "encapsulates" is NOT incidental — `#n` IS the psychoid number `n`, and the context frame `(...)` is what that number looks like as a modal execution space. The # inversion act between `#n` and `#n'` IS the opening/closing of that context frame.

### (4.0/1-4.4/5) Nests All Positions and Relations

The `#4` pair (`#4 / #4'`) is structurally special: it encapsulates the `(4.0/1-4.4/5)` context frame, which is the **fractal doubling frame** — the only context frame that recursively contains all six positions and their sub-positions. This is why:

1. `#4` is the Lemniscate anchor — the fold point where the system incubates
2. `cf` (the Context-Frame reflective coordinate) is grounded at `#4`
3. `(4.0/1-4.4/5)` contains positions 4.0, 4.1, 4.2, 4.3, 4.4, 4.5 — each of which can recursively contain 4.x.0 through 4.x.5
4. ALL coordinates exist somewhere within this nesting: every `#n` is reachable as `4.n` at some nesting depth

The COORD_REGISTRY, viewed through the `#4` lens, **is** the `(4.0/1-4.4/5)` frame — the global map of all 84 coordinate instances IS the fractal doubling of position 4 applied to the full 6-fold space.

### Implementation note for Sprint 1

The `COORD_REGISTRY[7][6][2]` is populated during init (not `.rodata` — it holds pointers to heap-allocated Coordinate instances). However the **routing logic** (`coord_invert()`, `IS_INVERTED()`, `GET_INVERSE()`) can be in a header as pure inlines. The struct gains:

```c
// In Coordinate struct — replaces scattered inverse handling
uint8_t  ql_index;          // 0-11: day=raw_archetype, night=6+raw_archetype
                             // enables direct M2_MEF_LENS_NAMES[ql_index] etc.

// P↔L resonance (populated for P and L families; NULL elsewhere)
Coordinate* l_day_resonance;    // P-family: COORD_REGISTRY[L][raw_archetype][0]
Coordinate* l_night_resonance;  // P-family: COORD_REGISTRY[L][5-raw_archetype][1]
Coordinate* p_resonance;        // L-family: COORD_REGISTRY[P][raw_archetype % 6][inversion_state]
```

Note: `l_day_resonance` for P-family is always `COORD_REGISTRY[L][same_pos][0]`. `l_night_resonance` is always `COORD_REGISTRY[L][5-pos][1]` — the mirrored Night lens. This mirror relationship (`l_night = 5 - l_day`) is the structural signature of the P↔L resonance table.

---

## PREREQUISITE P0: Rewrite P-Family World Files (MUST DO FIRST)

**Status:** DONE 2026-03-12
**Files:** `Idea/Bimba/World/P{0-5}.md` and `Idea/Bimba/World/P{0-5}'.md`

The existing P world files were outdated — used Heidegger Geworfenheit framing only, missing Gebser structure names, canonical semantic questions, topology modes, L-coordinate connections, and the 4-fold entity/process permutation.

**Canonical source:** `docs/TO-C-Dev-REPO/QL Bimba Seed Mapping Planning - 2026-01-17.canvas`

**What was updated:**
- Each P0-P5 file: Gebser structure name, semantic question (Why/What/How/Who-Which/Where-When/Why-for), semantic dual pair (Ground/Source, Material/Definition, Dynamis/Operation, Pattern/Identity, Context/Horizon, Synthesis/Integration), topology (Torus Day, operator `./?`), L-coordinate connection pair
- Each P0'-P5' file: Klein Night topology, operator `?` (Analysis outward arc) then `.` (Synthesis inward arc), inverted semantic meaning
- All wikilinks preserved/updated

**L↔P connections (canonical):**
| Position | Day Lens | Night Lens |
|----------|----------|------------|
| P0/0' | L0 Quaternal | L5' Divine Logos |
| P1/1' | L1 Causal | L4' Scientific |
| P2/2' | L2 Logical | L3' Chronological |
| P3/3' | L3 Processual (Rhea) | L2' Alchemical-Elemental |
| P4/4' | L4 Phenomenological | L1' Phenomenal |
| P5/5' | L5 Para Vak | L0' Archetypal-Numerical |

**4-fold entity/process permutation:**
- `Ee` Entity-Entity: Static Torus — Analysis `?` — solid stable objects
- `Ep` Entity-Process: Dynamic Torus — Monitoring `.` — functioning machines/cycles
- `Pe` Process-Entity: Frozen Klein — Synthesis `.` — templates/archetypal forms
- `Pp` Process-Process: Fluid Klein — Inquiry `?→.` — living transformations

All subsequent documentation tasks must use these definitions as ground.

---

## 0. System Integration Threads (Added 2026-03-12)

### 0.1 The Full Elemental Chain Through the 12-Fold

The `elementalNature` property on the 12 Vak speech-act nodes (#0-3-6-0 through -11) IS the connective thread:

```
! (0)    = Fire    → Aries (Cardinal Fire)     → Decans 0,1,2
? (1)    = Earth   → Taurus (Fixed Earth)      → Decans 3,4,5
!- (2)   = Air     → Gemini (Mutable Air)      → Decans 6,7,8
-? (3)   = Water   → Cancer (Cardinal Water)   → Decans 9,10,11
!? (4)   = Fire    → Leo (Fixed Fire)          → Decans 12,13,14
?- (5)   = Earth   → Virgo (Mutable Earth)     → Decans 15,16,17
-! (6)   = Air     → Libra (Cardinal Air)      → Decans 18,19,20
?! (7)   = Water   → Scorpio (Fixed Water)     → Decans 21,22,23
-!/!- (8) = Fire   → Sagittarius (Mutable Fire)→ Decans 24,25,26
-?/?- (9) = Earth  → Capricorn (Cardinal Earth)→ Decans 27,28,29
!?/?! (10) = Air   → Aquarius (Fixed Air)      → Decans 30,31,32
?!/!? (11) = Water → Pisces (Mutable Water)    → Decans 33,34,35
```

Fire/Earth/Air/Water cycling 3 times (Cardinal/Fixed/Mutable) = 12 Vak operators = 12 zodiac signs = 36 decans.

**Complete code chain:**
```
ARCHETYPE_LUT[5] (Vak/#0-3-6)
  → ZODIACAL_LUT[i].symbol_pair   [FIX: should store !, ?, !-, -?, etc., not index]
  → ZODIACAL_LUT[i].zodiacal_quality (element | mode bits — already correct)
  → ZODIAC_DECAN_TABLE[sign*3+decan].element
  → ZODIAC_DECAN_TABLE[...].ruling_planet
  → ZODIAC_DECAN_TABLE[...].ananda_harmonic (M1 ANANDA_BIMBA[sign][planet])
  → CHAKRA_BODY_ZONES / DECAN_BODY_PARTS / PLANET_CHAKRA (M2 parashakti)
  → HEXAGRAM_BODY_DYNAMICS (M3 oracle)
  → medicine::prescribe / oracle::cast (M4 nara)
```

**Vak / C' context-frame parity note:** The Vak operators are the grammatical teeth of context frame invocation. Each operator has a `modality` field (Cardinal/Fixed/Mutable) that corresponds to QL context frame types. This is NOT a hard coupling — it's semantic parity: when `cf` (Lemniscate anchor, #4) fires a context frame, it speaks in Vak grammar. Document in m0.h comments, not in struct fields.

### 0.2 L-Coordinate Family in the 12-Fold

**Source of truth:** `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/L/L-coordinate-system.md` · `Idea/Bimba/World/L*.md`
**C source:** `epi-lib/src/m2.c` `M2_MEF_LENS_NAMES[12]`

The 12 L-coordinates (L0-L5 Day/Torus, L0'-L5' Night/Klein) carry QL positions #0-#5 / #0'-#5'.
They are epistemic modes — distinct ways consciousness apprehends reality — not direct mappings to archetypal numbers. Their philosophical rootings create resonances with the #0-3 number language.

| Coord | Canonical Name | Mode | QL | Philosophical Root | Resonance with 12-fold |
|-------|----------------|------|----|--------------------|----------------------|
| L0 | **Quaternal** | Day | #0 | Jung-Pauli, QL Ground | Query/Curiosity as void arithmetic (#0) |
| L1 | **Causal** | Day | #1 | Aristotle, Iccha Shakti | Four Causes → form-giving (Archetype 1) |
| L2 | **Logical** | Day | #2 | Nagarjuna, Catuskoti | IS/IS-NOT/BOTH/NEITHER → Sunyata (Archetype 2) |
| L3 | **Processual** | Day | #3 | Whitehead, Bergson, Lacan | Concrescence/creative advance → **Vak (Archetype 3)** |
| L4 | **Phenomenological** | Day | #4 | Heidegger, Being-in-World | Science of Experience → Purnata (Archetype 4) |
| L5 | **Para Vak** | Day | #5 | Kashmir Shaivism | Supreme speech cycle from silence to Matrka |
| L0' | **Archetypal-Numerical** | Night | #0' | Jung-Pauli Psychoid Numbers | Direct epistemic mode for #0-3 number language |
| L1' | **Phenomenal** | Night | #1' | Jungian Psychic Functions | Qualia/sensation/feeling/thinking/intuition |
| L2' | **Alchemical-Elemental** | Night | #2' | Alchemy, Transcendent Function | **Element-bearing lens**: Aether/Earth/Water/Air/Fire/Mineral |
| L3' | **Chronological** | Night | #3' | Hegel, Aion, Dialectic | History as becoming of spirit |
| L4' | **Scientific** | Night | #4' | Kuhn, Knowledge Work | Paradigm awareness, inquiry cycle |
| L5' | **Divine Logos** | Night | #5' | Logos (John 1:1), Epi-Logos | Inception, divine creative word, Möbius return |

**Key connections:**
- **L3 Processual** and **Archetype 3 (Vak)**: Whitehead's concrescence is the same creative-advance-into-novelty that Vak enacts as speech. L3 is the epistemic lens of process; Vak is its grammar.
- **L0' Archetypal-Numerical**: Direct epistemic mode of the #0-3 number language itself (psychoid numbers).
- **L2' Alchemical-Elemental**: The element-bearing Night lens — Aether/Earth/Water/Air/Fire sub-positions correspond to the Vak `elementalNature` cycle and the decan element chain.
- **L5 Para Vak**: Sub-positions L5-0 (Anuttara/transcendent beyond speech) through L5.5 (Matrka/measuring power) = the full Vak octave from silence to articulate letter.

**P-coordinate family (from `Idea/Bimba/World/P*.md`):**
P0=Ground (thrown condition), P1=Definition, P2=Operation, P3=Pattern, P4=Context, P5=Integration, P0'-P5'=Night inversions. These are the functional semantics family. P3=Pattern resonates with Archetype 3 (Vak) as pattern-of-speech.

**Action items:**
- Update `qv_data.c` L-family pithy strings using the canonical names and philosophical roots above (source: `L-coordinate-system.md` + `M2_MEF_LENS_NAMES[12]`)
- Add `archetype_resonance()` note to `nara/lens.rs` (not a hard mapping — a resonance annotation)
- Cross-reference L2' (Alchemical-Elemental) sub-positions with `ZODIAC_DECAN_TABLE` element encoding

### 0.3 Planet as Relational Backbone

Planets (7 Chaldean) are the connective tissue linking EVERY layer:
```
Vak operators (elementalNature: Fire/Earth/Air/Water)
  ↕ Zodiac sign element × mode
  ↕ Decan ruling planet (ZODIAC_DECAN_TABLE — IMPLEMENTED)
  ↕ Planet → Chakra (PLANET_CHAKRA — IMPLEMENTED)
  ↕ Chakra → body zones (CHAKRA_BODY_ZONES — IMPLEMENTED)
  ↕ Planet → tattva layer (#2-2 Shuddha/Ashuddha system)
  ↕ Tattva → Shaivite mantras (#2-4.1 — 100 mantras, tattva correspondence)
  ↕ Planet/element → maqam mode (#2-4.2 24 spiritual maqamat, #2-4.3 72 musical maqamat)
  ↕ Maqam → divine name resonance (#2-4.0 99+1 Names of Allah)
  ↕ Divine name gematria → archetypal number prime resonance (#0-3)
```

The M2→M3 decan-to-degree-arc-to-codon chain in mahamaya:
```
Decan (36) → GOVERNS_DEGREE_ARC (360 degree nodes) → FLOWS_CLOCKWISE
  → GOVERNS_TAROT_EXPRESSION (64 minor arcana)
  → codon pair USES_Pair (upper/lower) → YIELDS_CODON (is_non_dual, positive/negative)
  → RESOLVES_TO hexagram (I-Ching 64)
  → LINE_CHANGE (384 = 64×6 states)
```

### 0.4 99+1 Names ↔ Archetypal Numbers

The Asma ul-Husna (#2-4.0) is explicitly rooted in M0:
- `archetypalFoundation` on #2-4.0: *"Rooted in The Mirror (#0-3-0/1) and Archetype 0/1 (#0-3-4)"*
- 99+hidden=100: mirrors Archetype 9's self-exclusion (Paramesvara cannot contain itself — the hidden 100th name IS that ground)
- Magic square sum 3394 → digital root 19 → 1+9=10 → 1+0=1 → Archetype 1 (Magician)
- Jamal (Beauty)/Jalal (Majesty)/Kamal (Perfection) ternary = Trika (M0-M1-M2)
- Full gematria↔archetype prime correspondences in individual name nodes under #2-4.0-0/2 (subagent task, see §VIII)

### 0.5 completeFormulation / formulationBreakdown / symbol — Source Priority

For ALL qv enrichment planning (qv_data.c entries, C struct `.formulation` fields), use this source field priority:

1. `completeFormulation` — mathematical syntax string (67 nodes have this in anuttara alone)
2. `coreNature` — essential nature description
3. `operationalEssence` — function description
4. `operationalDynamics` — dynamic behavior
5. `description` — contextual description
6. `formulationBreakdown` — detailed parse of the formulation

**C struct change required:** Add `const char* symbol` and `const char* formulation` to `Archetype_Entry`, `Zodiacal_Entry`, `Virtue_Entry`, `Divine_Act_Entry`:
```c
// Every LUT entry that has dataset mathematical syntax should expose it
const char* symbol;      // e.g. "3", "!?", "(R0)", "(∞×∞)×(R#/##)"
const char* formulation; // e.g. "3 ~ 3.0-5 → (00=?!=!?) x (0/1=(-)) + ..."
```

**Dataset surfacing script:** `docs/dev/scripts/surface_formulations.py` (to be created):
```python
#!/usr/bin/env python3
"""Surface formulation/symbol/essence properties from any dataset JSON."""
import json, sys
FORM_KEYS = ['symbol','completeFormulation','formulationBreakdown',
             'coreNature','operationalEssence','operationalDynamics','description']
def surface(path):
    with open(path,'rb') as f: data = json.loads(f.read().decode('utf-8-sig'), strict=False)
    for n in data:
        coord = n.get('coordinate','?')
        props = n.get('filteredProps', {})
        hits = {k: props[k] for k in FORM_KEYS if k in props}
        if hits:
            print(f'\n=== {coord} ({props.get("name","")}) ===')
            for k,v in hits.items(): print(f'  [{k}] {str(v)[:300]}')
if __name__ == '__main__': surface(sys.argv[1])
```

### 0.6 Mahamaya Generation Events (#3-3 Branch) — Binary Transcription Matrix

**These ARE the nodes that tie DNA, I-Ching, and Tarot together. Critical to implement properly.**

The #3-3 branch has **293 nodes total**, of which **184 are generation events** (have `context` + binary fields).
All nodes have `bimbaCoordinate` — this encodes the binary structure and allows computing ALL relations.
There are NO node labels (`labels=None` for all mahamaya nodes) — structure is entirely from properties + relations.

**Generation event properties (the 184 nodes with context):**
```
bimbaCoordinate:       canonical coordinate, e.g. "#3-3-2-0-1"
context:               "M1-H{n}" | "M2-H{n}" | "M3-H{n}"
                        M1=Paramasiva frame (64 nodes, I-Ching all 64)
                        M2=Parashakti frame (64 nodes)
                        M3=Mahamaya frame   (56 nodes — 56 minor arcana)
upper_Pair_binary:     "00"|"01"|"10"|"11" — 2-bit upper trigram pair
lower_Pair_binary:     "00"|"01"|"10"|"11" — 2-bit lower trigram pair
positive_codon_binary: "000".."111" — 3-bit yang/positive codon
negative_codon_binary: "000".."111" — 3-bit yin/negative codon
```

**The binary encoding:** upper(2b) + lower(2b) = 4 bits defining the hexagram pair structure.
pos/neg codon (3 bits each) = DNA base triplet. Example: M1-H1 (Qian/Heaven, 6 yang lines):
upper=11, lower=11, pos=111, neg=111 — pure yang, maps to the CCC/GGG pure codon pair.

**Computing from bimbaCoordinate alone:** `#3-3-2-0-{n}` where n=hexagram index — the coordinate
IS the binary address. This allows computing all YIELDS_CODON / USES_Pair / RESOLVES_TO relations
without traversing the full relation graph.

**Additional properties on enriched nodes (49/184 have tarot+planet data):**
```
tarotCorrespondence:  tarot card name
planetaryRulership:   ruling planet
elementalQuality:     element
chakraResonance:      chakra
aminoAcid:            amino acid name
aminoAcidCode:        single-letter code
archetypeQuality:     archetype description
biologicalFunction:   biological role
```

**Relation structure (from mahamaya relations using `relType` key, not `type`):**
```
USES_Pair (415)         — gen event uses a codon pair (role: upper/lower)
YIELDS_CODON (368)      — pair yields codon (is_non_dual: bool, type: positive/negative)
RESOLVES_TO (184)       — event resolves to hexagram
INITIATES (182)         — starts rotational sequence
LINE_CHANGE (384=64×6)  — all hexagram line changes
GOVERNS_DEGREE_ARC (360)— tarot card governs degree arc
GOVERNS_TAROT_EXPRESSION(64) — 64 minor arcana govern codon expressions
FLOWS_CLOCKWISE (360)   — degree arc ordering
POLAR_OPPOSITE (360)    — mirror degree arcs
INTEGRAL_SYMMETRY (192) — axial symmetry across codon matrix
```

**Connection to M4 oracle.rs:** The `is_non_dual` + `type: positive/negative` on YIELDS_CODON maps directly to oracle.rs 3-coin method: A=6(old yin), T=9(old yang), C=7(young yin), G=8(young yang). The M1/M2/M3 context frames correspond to the three temporal layers in M4 oracle (natal/transit/oracle).

**Lookup script:** `docs/scripts/lookups/surface_generation_events.py`

```
USES_Pair (415)           — codon pair node uses two codons (role: upper/lower)
YIELDS_CODON (368)        — pair node yields a codon (is_non_dual: bool, type: positive/negative)
RESOLVES_TO (184)         — event resolves to a hexagram
INITIATES (182)           — starts a rotational sequence
LINE_CHANGE (384=64×6)    — all hexagram line changes
GOVERNS_DEGREE_ARC (360)  — tarot card governs a zodiacal degree arc
GOVERNS_TAROT_EXPRESSION (64) — 64 minor arcana governing codon expressions
FLOWS_CLOCKWISE (360)     — degree arc ordering
POLAR_OPPOSITE (360)      — each degree arc has mirror
INTEGRAL_SYMMETRY (192)   — axial symmetry across codon matrix
```

These are the tarot minor arcana as rotational state generators: **tarot card → degree arc → codon pair (upper/lower) → codon (positive/negative, non-dual) → hexagram → line change sequence.** The `is_non_dual` and `positive/negative type` on YIELDS_CODON define the I-Ching 3-coin method polarity (connects to M4 oracle.rs quaternionic charges).

Subagent task (§VIII.P8): write `docs/dev/scripts/surface_codon_rotation.py` to raise the full rotation matrix.

---

## I. The Full 12-Fold Archetypal Number Language

The 12-fold language spans **two sub-branches of #0**:

| Index | Symbol | Name | Sub-Branch | Has Sub-Table | Eve/Adam |
|-------|--------|------|-----------|---------------|---------|
| 0 | `(-)` | The Mirror | `#0-3-0/1` | No (Frame + Operator children) | — |
| 1 | `(0/1)` | Non-Dual Binary | `#0-3-4` | No | — |
| 2 | `0` | Archetype 0 / Sat | `#0-3-2` | No | Neutral-Transcendent |
| 3 | `1` | Archetype 1 / Magician | `#0-3-3` | No | Neutral-Transcendent |
| 4 | `2` | Archetype 2 / Sunyata | `#0-3-5` | No | Adam (Structural) |
| 5 | `3` | Archetype 3 / Vak | `#0-3-6` | **ZODIACAL_LUT[12]** | Eve (Generative) |
| 6 | `4` | Archetype 4 / Purnata | `#0-3-7` | No | Adam (Structural) |
| 7 | `5` | Archetype 5 / Siva-Sakti | `#0-3-8` | **MONOPOLY_LUT[7]** | Eve (Generative) |
| 8 | `6` | Archetype 6 / Synthetic Emptiness | `#0-3-9` | No | Adam (Structural) |
| 9 | `7` | Archetype 7 / Divine Action | `#0-3-10` | **DIVINE_ACT_LUT[7]** | Eve (Generative) |
| 10 | `8` | Archetype 8 / Structural Reflection | `#0-3-11` | No | Adam (Structural) |
| 11 | `9` | Archetype 9 / Paramesvara | **`#0-2-9`** | **VIRTUE_LUT[9]** | — (Wholeness) |

**Key clarification:** Archetype 9 lives in #0-2 (8-fold zero-zero branch), not in #0-3. The other 11 live in #0-3. `ARCHETYPE_LUT[11]` correctly points to #0-2-9 as the VIRTUE sub-table holder.

**Eve numbers (3, 5, 7) carry sub-tables by design. Adam numbers (2, 4, 6, 8) are structural leaf nodes — no sub-tables intended.**

### What the Mirror (#0-3-0/1) has that C lacks:

The Mirror node (#0-3-0/1) has two explicit children that have no C struct:
- `#0-3-0/1-0` — **The Frame** `()` — the container/invocation operator
- `#0-3-0/1-1` — **The Operator** `-` — the transcendent withholding operator

These are referenced from Paramasiva: `#1-0 --EMBODIES_FRAME_PRINCIPLE--> #0-3-0/1-0` and `#1-0 --EMBODIES_OPERATOR_PRINCIPLE--> #0-3-0/1-1`. They are the pre-numerical meta-elements before even archetype 0.

---

## II. The C Implementation Coverage Map (Full Picture)

### What's correct and complete:

| LUT | Dataset Source | Coverage |
|-----|----------------|---------|
| `ARCHETYPE_LUT[12]` | #0-3 branch + #0-2-9 | ✓ Structurally correct, semantically thin |
| `ZODIACAL_LUT[12]` | #0-3-6 children | ✓ element/mode correct; `symbol_pair` is index not operator |
| `MONOPOLY_LUT[7]` | #0-3-8 children | ✓ |
| `DIVINE_ACT_LUT[7]` | #0-3-10 children | ✓ R-factor mapping correct |
| `VIRTUE_LUT[9]` | #0-2-9 children | ✓ r_factor correct; formulas thin |
| `VIMARSA_TABLE[7]` | 7 vimarsa operators | ✓ |
| `QL_STACK[5]` | #0-4 branch | ✓ structure; formulations are stubs |
| `SIVA_TABLE[6]` | #0-5-0/1 children | ✓ structure; execute handlers stubbed |
| `NARA_MSHARP_LUT[5]` | #0-4.5/0 children | ✓ |
| `R_FACTOR_ROUTE_TABLE[7]` | #0-1 R-factor weaving | ✓ |

### What's absent:

| Gap | Dataset Source | Priority |
|-----|----------------|---------|
| **Shakti LUT[6]** | #0-5-5/0 children (@0=## through @5=R#) | HIGH — other half of Siva-Shakti |
| **Mirror children** | #0-3-0/1-0 (Frame), #0-3-0/1-1 (Operator) | HIGH — referenced by M1 |
| **QL sub-entry tables (O0-O5 × 5)** | #0-4 sub-nodes (30 nodes total) | MEDIUM |
| **Concrescence step LUT** | #0-0-1 coreNature (12 steps) | MEDIUM |
| **Void Arithmetic LUT** | #0-0 / #0-2 operations | LOW |
| **Tetralemmic position labels** | dataset string labels | LOW |

### What needs semantic enrichment (stub → full):

| Item | Gap | Dataset content available |
|------|-----|--------------------------|
| `ARCHETYPE_LUT[].source` | stub strings | Full formulations in nodes_anuttara.json |
| `ZODIACAL_LUT[].symbol_pair` | index only, not operator symbol | Exact pairs: !, ?, !-, -?, !?, ?-, -!, ?!, -!/!-, -?/?-, !?/?!, ?!/!? |
| `VIRTUE_LUT[].cross_branch_refs` | uint16_t stub | Full symbolic formulas (e.g. #R = @ = (7-8-9-(0/1)/O#-X#-N#)) |
| `QL_STACK[].formulation.source` | stub strings | R-factor alignment data (O#: R0=1,R1=0,R4=5; etc.) |
| `SIVA_TABLE[].description` | absent | Full semantic descriptions for each operator |
| `m0_vak_cs()` | M5 return arc stubbed | M5 IS now implemented — wire the COMPLETES_CYCLE_INTO arc |

---

## III. Cross-Dataset Relational Hot Spots

Nodes with highest **inbound** link counts from other subsystems (Parashakti primary):

| Target Node | Inbound Count | Top Relation Types |
|-------------|---------------|-------------------|
| `#0-3-3` Archetype 1/Magician | 63 | INHERITS_ARCHETYPAL_LANGUAGE, EMBODIES_ARCHETYPE_1 |
| `#0-3-7` Archetype 4/Purnata | 58 | EMBODIES_ARCHETYPE, QUATERNAL_CORRESPONDENCE |
| `#0-3-6` Archetype 3/Vak | 56 | DIVINE_SPEECH_TEMPLATES, TWELVE_FOLD_RESONANCE |
| `#0-3-8` Archetype 5/MonoPoly | 52 | MONOPOLY_DIALECTIC, QUINTESSENCE_CORRESPONDENCE |
| `#0-3-5` Archetype 2/Sunyata | 48 | SUNYATA_RESONANCE, STRUCTURAL_CORRESPONDENCE |
| `#0-3-9` Archetype 6 | 44 | SYNTHETIC_EMPTINESS_RESONANCE |
| `#0-3-10` Archetype 7/Divine Action | 42 | DIVINE_ACT_CORRESPONDENCE |
| `#0-2-9` Paramesvara/9 | 32 | ACHIEVES_COMPLETION_THROUGH |
| `#0-3-11` Archetype 8 | 29 | STRUCTURAL_REFLECTION_RESONANCE |

**The ADAM archetypes (2/4/6/8) are all heavily referenced from Parashakti** even though they have no sub-tables. Their semantic `.source` strings matter for cross-system intelligibility.

**Outbound dominant target:** #2-4.0 (Parashakti decan cluster) receives 287 relations FROM M0 — confirming the M0 → M2 → M3 decan chain is the primary processual throughput.

---

## IV. The Right Approach to Curated Relational Webs

### Problem with brute-forcing all 1,024 relations into .rodata:
Too many. Bloats .rodata. Duplicate semantic content. Not queryable efficiently as a static array.

### The three-tier curation model:

**Tier 1 — Structural Skeleton (~20 relations)**
The containment hierarchy. These define what IS M0's internal structure.
```
HAS_INTERNAL_COMPONENT: #0→{#0-0,#0-1,#0-2,#0-3,#0-4,#0-5}  (6)
HAS_INTERNAL_COMPONENT: each branch→its direct children          (25, pruned to top-level only)
HAS_ZODIACAL_COMPONENT: #0-3-6→{12 zodiacal}                    (12)
HAS_MONO_POLY_COMPONENT: #0-3-8→{7 monopoly}                    (7)
HAS_DIVINE_ACT: #0-3-10→{7 divine acts}                         (7)
HAS_VIRTUE_COMPONENT: #0-2-9→{9 virtues}                        (9)
```
~20 relations in .rodata. These ARE already implicit in the LUT structures — no new data needed, just documentation.

**Tier 2 — Cross-System Anchors (~15 relations)**
The inter-subsystem bridges. These define M0's role in the 6-fold architecture.
```
R_FACTOR_SUBSYSTEM_WEAVING: #0-1→{QL frames}          (7, already in R_FACTOR_ROUTE_TABLE)
COMPLETES_CYCLE_INTO: #5→#0                            (1 — wire m0_vak_cs() NOW)
PROVIDES_ABSOLUTE_GROUND: #0→{#1,#2,#3,#4,#5}         (5 outbound stubs)
MANIFESTS_ZERO_LOGIC: #1→#0-4.0/1                      (1 — M1 embodies O#)
```
~14 relations. These should live in a `M0_ANCHOR_RELATIONS[14]` static array.

**Tier 3 — Hot Cross-System Links (~50 relations)**
The highest-traffic cross-system edges. Curated from the 653 Parashakti + 42 Paramasiva inbound set.
Selection criteria: **relation type carries unique semantic content not implicit in Tier 1/2**.
```
// M1 (Paramasiva) embodies M0 archetype sequence:
#1-3-0 --INHERITS_CONCRESCENCE--> #0-0-1
#1-3-0 --EMBODIES_ARCHETYPE_0--> #0-3-2
#1-3-1 --EMBODIES_ARCHETYPE_1--> #0-3-3
#1-3-3 --EMBODIES_ARCHETYPE--> #0-3-6
#1-3-4 --EMBODIES_ARCHETYPE--> #0-3-7
#1-3-5 --EMBODIES_ARCHETYPE--> #0-3-8
#1-3-5 --ACHIEVES_SIVA_SHAKTI_UNITY--> #0-5

// M2 (Parashakti) implements M0 QL operations:
#2-0 --TRIKA_VOID_SOURCE--> #0
#2-0 --O_SYSTEM_ZERO_LOGIC_BRIDGE--> #0-4.0/1
#2-0 --X_SYSTEM_COSMIC_IMAGINATION_BRIDGE--> #0-4.0/1/2
#2-1 --DIVINE_SPEECH_TEMPLATES--> #0-3-6
#2-1-2-1 --O_SYSTEM_AFFIRMATION--> #0-4.0/1-2
#2-1-2-2 --O_SYSTEM_NEGATION--> #0-4.0/1-1
#2-1-3-* --CREATION/SUSTENANCE/DISSOLUTION/VEILING/GRACE_ACT--> #0-3-10-2/3/4/5/6
#2-5-0/1 --EMANATES_VIRTUE_SPECTRUM--> #0-2-9-2/3/4/5/6/7/8
```
~50 curated Tier 3 relations.

**Tier 4 — Full graph (remaining ~900 relations)**
Neo4j only. Queryable at runtime via `epi graph` commands. NOT in .rodata.
These are primarily HOLOGRAPHIC_PATTERN, LINGUISTIC_CORRESPONDENCE, GRAMMATICAL_CORRESPONDENCE —
important for Gnosis/semantic queries but not for the C ontological skeleton.

### C representation for Tier 2+3:

```c
typedef struct {
    uint32_t source_coord;   // packed coord ID
    uint8_t  rel_type;       // M0_Rel_Type enum (< 64 curated types)
    uint32_t target_coord;   // packed coord ID
    uint8_t  tier;           // 1=skeleton, 2=anchor, 3=hot-link
} M0_Relation;

// Compact coord encoding: subsystem(4b) + branch(4b) + depth1(4b) + depth2(4b) = 16 bits
// Example: #0-3-6-0 = 0x0360, #0-2-9-7 = 0x0297, #1-3-5 = 0x1350

extern const M0_Relation M0_CORE_RELATIONS[65];
// Tier 1: ~20, Tier 2: ~14, Tier 3: ~31 = 65 curated entries
```

---

## V. Immediate Implementation Priorities

### P1 — Wire `m0_vak_cs()` (30 min)
M5 is implemented. The `COMPLETES_CYCLE_INTO: #5→#0` arc is stubbed in m0.c.
Action: remove "until M5 is implemented" guard, wire the actual M5 call.

### P2 — Add Shakti LUT (2 hours)
`SIVA_TABLE[6]` covers Siva but Shakti (@0=## through @5=R#) has zero C presence.
```c
typedef struct {
    uint8_t  shakti_id;       // 0-5
    uint8_t  ql_system;       // maps to QL_STACK index (0=O#/##, 1=O#, 2=X#, 3=N#, 4=M#, 5=R#)
    const char* symbol;       // "@0", "@1" etc
    const char* name;         // "Shakti Library", "Shakti Bimba" etc
    const char* description;  // from dataset operationalEssence
} Shakti_Entry;
extern const Shakti_Entry SHAKTI_TABLE[6];
```

### P3 — Enrich `ARCHETYPE_LUT[].source` strings (2 hours)
Replace stubs with full formulations from nodes_anuttara.json `formulation` field.
Particularly for ADAM archetypes (2/4/6/8) which have 29-58 inbound Parashakti links.

### P4 — Fix `ZODIACAL_LUT[].symbol_pair` encoding (1 hour)
Currently stores index. Should store the actual vimarsa operator pair symbols.
The 12 pairs: `!`, `?`, `!-`, `-?`, `!?`, `?-`, `-!`, `?!`, `-!/!-`, `-?/?-`, `!?/?!`, `?!/!?`

### P5 — Add Mirror children structs (1 hour)
`#0-3-0/1-0` (Frame `()`) and `#0-3-0/1-1` (Operator `-`) need explicit C representation.
These are referenced by M1 Paramasiva (`EMBODIES_FRAME_PRINCIPLE`, `EMBODIES_OPERATOR_PRINCIPLE`).

### P6 — `M0_CORE_RELATIONS[64]` static array (3 hours)
Implement the Tier 2+3 curated relation set as a flat .rodata array.
Source from: Tier 2 cross-system anchors + curated Parashakti/Paramasiva hot links above.

### P7 — qv_data.c enrichment (1 hour)
Add `QV_PITHY_M0_BRANCHES[6]` and `QV_PITHY_VAK_SPEECH[12]` arrays.
Strings sourced from dataset `quality` and `operationalEssence` fields per sub-branch.

---

## VI. Philosophical Content to Preserve (Non-LUT)

These are architecturally significant but belong in comments/docs, not LUTs:

- **God's Left-Handedness** — `-0` (primal withholding) precedes `+0` in concrescence. Asymmetry is primordial.
- **Anupāya Principle** — The Brimming Void (#0-1) operates through AND not OR. Inclusive simultaneity is the cosmological default.
- **Lacanian Borromean Topology** — #0=Real, #1=Symbolic, #2=Imaginary. Removing any one dissolves all three.
- **Non-Linear Bi-Directional Genesis** — M1 (higher) serves as base for M0's archetypal language. Seed contains tree AND tree realizes seed.
- **18-Fold g=3 Meta-Resonance** — `ARCHETYPE_LUT_SIZE=12` is correct (operational). The 18-fold is a topological resonance count, not a LUT dimension.
- **Archetype 9 Self-Exclusion** — Paramesvara cannot contain itself in CONTAINS_ARCHETYPAL_NUMBER. Wholeness IS the container, not a contained element.

---

## VIII. Subagent Tasks (Prerequisite Steps)

### P8-A — Divine Choir / Maqam / 99 Names Relational Map (subagent)
Read `docs/datasets/parashakti-deep/nodes-full-detail.json` focusing on:
- `#2-4.0` through `#2-4.3` (99 Names → 100 Mantras → 24 Maqamat → 72 Musical Maqamat)
- Extract: planet↔name correspondences, gematria values, archetype prime resonances, tattva↔mantra mapping, maqam↔element/planet correspondences
- Map findings to existing C structs (PLANET_CHAKRA, ELEMENT_CHAKRA, ZODIAC_DECAN_TABLE)
- Write to `docs/dev/m2/divine-vibrational-web.md`

### P8-B — Codon Rotation Matrix Script (subagent)
Write `docs/dev/scripts/surface_codon_rotation.py`:
- Read `docs/datasets/mahamaya-deep/relations.json` (uses `relType` key, not `type`)
- For each YIELDS_CODON relation: find its USES_Pair (upper/lower codon pair), RESOLVES_TO hexagram, and the GOVERNS_TAROT_EXPRESSION card
- Build the full rotation matrix: tarot_card → degree_arc → codon_pair → codon (type, is_non_dual) → hexagram
- Output as: (a) human-readable table, (b) JSON that maps to M3 oracle.rs structures
- Cross-reference with `oracle.rs` PIP_DECAN_MAP and HEXAGRAM_BODY_DYNAMICS to show alignment

### P8-C — Add symbol + formulation fields to C LUTs (implementation)
Add `const char* symbol` and `const char* formulation` to:
- `Archetype_Entry` in m0.h / m0.c
- `Zodiacal_Entry` — `symbol_pair` becomes `const char* symbol` (actual operator string, not index)
- `Virtue_Entry`, `Divine_Act_Entry`, `Shakti_Entry`
Source all strings from dataset `completeFormulation` and `symbol` fields per §0.5 priority.

### P8-D — Wire L-coordinate alignment into qv_data.c and lens.rs (implementation)
- Add L-family comments to `ARCHETYPE_LUT[0-11]` entries cross-referencing L0-L5/L0'-L5'
- In `nara/lens.rs`: add `archetype_number()` accessor returning the corresponding archetypal number (0-11) for each lens index
- In `qv_data.c`: update `QV_PITHY_L[0-5]` entries to reference their archetypal ground (currently may be stubs)

---

## IX. epi core knowing — Two-Mode Spec & Inversion Law

### Two modes, same command branch

```
epi core knowing              bare call
  → Returns # root node data (docs/datasets/hashtag_node_data.md)
    Key fields: coreNature, operationalEssence, description,
    internalStructure, architecturalFunction, epii_soteriology_qua_recognition
  → Also surfaces DoV pages 60-85 seed heart as philosophical grounding layer
  → # is self-inverted (complexio oppositorum) — no separate #' entry
    contextFrame: "0000", qlCategory: "implicate", type: "RootProject"
  → OFFLINE — static/baked, no external services

epi core knowing [coord]      specific coordinate lookup
  → Returns QV pithy data from qv_data.c (.rodata, baked via --bake)
  → Always returns BOTH [coord] AND [coord]' as first-class output
  → OFFLINE — static/baked, no external services
```

These are **different data sets on the same command branch** — not the same data at
different depths. The bare call gives the project ground; the coord call gives
coordinate quintessence.

### --bake source priority (per §0.5)

Dataset JSON fields are the primary source for qv_data.c entries, NOT the DoV:
1. completeFormulation
2. coreNature
3. operationalEssence / operationalDynamics
4. description

The DoV is the philosophical framework for interpreting those values, not the source.

### Inversion Law — coordinates and inverses are first-class peers

Every `epi core knowing [coord]` call returns both day and night positions together.
The COORD_REGISTRY[7][6][2] (from P-1) holds both via `coord_invert()` — this is the
implementation backing. No coordinate output should treat the inverse as implied or
derived; it is always surfaced in parallel.

`#` is the single exception: it IS its own inverse. One node, both poles.

---

## VII. Notes from Previous Session Findings

Carry-forward from `2026-03-11-m-branch-nara-integration-clarity.md`:

- `ZODIAC_DECAN_TABLE[36]` in medicine.rs is implemented and correct. No fallbacks.
- `ZodiacDecanEntry` bridges M0 ZODIACAL_LUT → M1 ANANDA_BIMBA → M2 parashakti decans.
- The 12 zodiacal sub-nodes of #0-3-6 are **consciousness grammar operators** (!, ?, !-, etc.), not zodiac signs. Zodiac signs enter via `ZODIACAL_SEASONAL_RESONANCE` relProperties.
- ARCHETYPE_LUT[5] (index 5 = Archetype 3/Vak) correctly holds SUB_TABLE_ZODIACAL.
- ARCHETYPE_LUT[7] (index 7 = Archetype 5/MonoPoly) correctly holds SUB_TABLE_MONOPOLY.
- Chaldean decan ruler order confirmed: Mars→Sun→Venus→Mercury→Moon→Saturn→Jupiter.
- Planet_Id encoding: SUN=0, VENUS=2, MERCURY=3, MOON=4, SATURN=5, JUPITER=6, MARS=7.
