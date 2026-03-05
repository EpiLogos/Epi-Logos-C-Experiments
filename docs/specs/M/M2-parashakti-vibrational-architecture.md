# FR 2.2: M2 (Parashakti) — The Vibrational Architecture

**Status:** Canonical Specification — Revision 2 (Gemini Review Applied)
**Date:** 2026-03-04
**Parent:** Pillar II, FR 2.2 (Epi-Logos C Spec)
**Source Data:** `docs/datasets/nodes_parashakti.json` (595 nodes), `docs/datasets/relations_parashakti.json` (4,017 relations, 748 unique types)
**Coordinate:** #2 — Subsystem 2: Parashakti — Self-Reflective Vibrational Mediation / Cosmic Imagination
**Refinement Source:** `docs/specs/gemini-spec-M-branch-updates-refinements.md` lines 253–481

---

## Overview

Parashakti is the **vibrational processing layer** — the self-reflective power of consciousness (Vimarsa) that creates infinite vibrational templates through 72-bit double-covering architecture. She mediates between Paramasiva's structural foundations (M1) and Mahamaya's symbolic integrations (M3) through trinitarian dynamics operating in the (0/1/2) context-frame.

**Dataset Shape:** 595 nodes, 4,017 relations, max depth 5. Six top-level sub-branches (#2-0 through #2-5) with dramatically unequal size: #2-4 (Vibrational Arena) alone contains 365 nodes (61% of all M2 data). The remaining five branches total 230 nodes.

**The 72 Invariant (FR 2.2.0 — The Law):** Every major structure in M2 resolves to exactly 72 — the canonical array dimension. This MUST be enforced at compile time via `_Static_assert`. This is not coincidence; it is the architectural fingerprint of the 72-bit double-covering: 36 base positions × 2 phases (descent/ascent, light/shadow, active/passive). The factorings differ — `[12][6]`, `[36][2]`, `[4][3][3][2]`, `[8][9]`, `[9][8]` — but all collapse to 72 bytes when element types are 1 byte each. The 100-fold systems (#2-4.0 Asma, #2-4.1 Mantras) operate on their own LUT dimensions with a **36:64 internal dynamic** (see FR 2.2.4).

**Revision 2 Corrections:**
1. The MEF is **12 lenses** (6 base + 6 inverted), NOT a 3D `[6][6][2]` array. The array is `[12][6]`. This natively expresses the # Inversion Operator on the full epistemic frame.
2. The MEF `.rodata` IS the **Bimba for the L (Lens) coordinate family**. Every L-family coordinate carries an `L_Family_State` payload anchored to the 12×6 matrix.
3. The `M2_Vibrational_72_Space` union is the **single canonical memory block** for all 72-fold systems.
4. 128-bit routing masks replace index arrays for O(1) ASMA 36:64 lookup.
5. 64-bit causal resonance masks replace the 3D resonance graph for O(1) MEF cross-weave.
6. `Element_Id` is embedded in the `Holographic_Coordinate` flags byte for M2 instances.
7. `M2_TO_M3_CYMATIC_PROJECTION[72]` is the Discrete Epistemic Transform (DET) bridging M2 vibration to M3 symbol space.

**The 100-Fold / Mod-10 Connection:** The two 100-fold systems (99+1 Names, 50+50 Mantras) are not anomalies — they are the **mod-10 face** of the Ananda Vortex matrices from M1 (#1-2). The Ananda matrices operate on a 10×12 grid; 10² = 100 is the square of the mod-10 base. The internal decomposition 100 = 36 + 64 mirrors the Spanda→QL generative coupling from M1 (#1-3/#1-4): 36 = MEF base conditions (Parashakti's own epistemic ground), 64 = Mahamaya's target bitboard space. The 100-fold systems contain the FULL vibrational spectrum: 36% remains as M2-internal template, 64% projects forward into M3.

**The Element Throughline:** Five elements (Fire, Earth, Air, Water, Quintessence/Akasha) constitute a structural spine that runs through the Tattvas (#2-2, Mahabhutas at #2-2-2-5), the Decans (#2-3, organized by element), the Mantras (#2-4.1, consonant groups by articulation/element), and the Planets (#2-5, elemental correspondences through chakras). This throughline is the connective tissue linking all M2 sub-systems.

**Key Relation: CAUSAL_RESONANCE (336 edges):** The most frequent relation type in the entire dataset, functioning as the MEF internal cross-weaving mechanism (294 edges within #2-1, plus 7 edges from each sub-branch into #2-1). This makes the MEF the causal hub through which all M2 sub-systems resonate.

**Cross-Boundary Function:** The 9:8 epogdoon transform at #2-5 compresses 72-space to 64-space, bridging M2 to M3's opening position (#3-0). The `M2_TO_M3_CYMATIC_PROJECTION[72]` table is the target structure for this transform. The actual projection values develop in operation from dataset correspondences — they are not pre-specified compile-time constants but are derived from the live graph as the system builds understanding of M2→M3 mappings.

**M2-M3 Interoperability (HMS Heritage):** M2 (Parashakti) and M3 (Mahamaya) together constitute the Vimarsa-Prakasa dyad — the Wave-Particle duality of the system. M2 holds the "Chord" (continuous vibrational state across 72 conditions). M3 is the "Cymatic Plate" (the 64-bit bitboard). When M2 vibrates, it excites specific bits on the M3 bitboard via the DET, forming Hexagram/Codon patterns. The Discrete Epistemic Transform replaces literal FFT (which requires floating-point) with a `.rodata` lookup that achieves the same wave-superposition semantics through bitwise OR.

---

## FR 2.2.0 (Revised): The 72-Invariant Law

**Requirement:** The C engine MUST enforce, at compile time, that the `M2_Vibrational_72_Space` union is exactly `72 * sizeof(MEF_Condition)` bytes. Every member of the union must decompose to exactly 1 byte per cell. Any deviation is a hard compile-time error.

**Ontological Ground:** The 72 Invariant is the architectural fingerprint of M2. It is the law that unifies the MEF, Tattvas, Decans, and Shem into a single contiguous block of memory — a true Vibrational Signal Processor. All 72-fold systems share the same 72 bytes viewed through different lenses.

**The Union as Invariant Enforcement:**

```c
// All member element types must compile to exactly 1 byte each.
// This is the precondition for the union to hold.
_Static_assert(sizeof(MEF_Condition) == 1,  "MEF_Condition must be 1 byte");
_Static_assert(sizeof(Tattva_Entry)  == 1,  "Tattva_Entry must be 1 byte");
_Static_assert(sizeof(Decan_Face)    == 1,  "Decan_Face must be 1 byte");
_Static_assert(sizeof(Shem_Name)     == 1,  "Shem_Name must be 1 byte");

// The Canonical 72-Space Union — the single contiguous memory block
// for all M2 vibrational structures.
typedef union {
    // 12 Lenses × 6 Positions = 72 (Revision 2: correct MEF shape)
    MEF_Condition    mef_lenses[12][6];

    // 36 Principles × 2 Phases = 72
    Tattva_Entry     tattvas[36][2];

    // 4 Elements × 3 Signs × 3 Decans × 2 Phases = 72
    Decan_Face       decans[4][3][3][2];

    // 8 Choirs × 9 Names = 72
    Shem_Name        shem_names[8][9];

    // Flat canonical access — byte-level vibration index
    uint8_t          raw_vibration[72];
} M2_Vibrational_72_Space;

// THE 72-INVARIANT LAW — compile-time enforcement
_Static_assert(
    sizeof(M2_Vibrational_72_Space) == 72 * sizeof(MEF_Condition),
    "M2 72-Space Violation: union size does not resolve to exactly 72 cells"
);
```

**Design Constraint:** Because the union requires all members to share the same byte footprint, the rich semantic payload of each entry (meaning strings, gematria values, etc.) MUST be stored externally in separate `.rodata` tables indexed by the flat byte value. The union itself holds only the 72-byte coordinate geometry. Payload tables are accessed via the `meaning_id` field or equivalent index.

---

## FR 2.2.0 (sub): #2-0 — Archetypal Numerical Ground

**Requirement:** The C engine MUST provide a seed-constant structure at #2-0 that grounds all M2 vibrational mathematics in the golden ratio and the Spanda-Ananda-Pi triad inherited from M1.

**Ontological Ground:** #2-0 (Archetypal Numerical Ground — The Manifestational-Imaginal Potentiation Matrix)

### The Golden Ratio Seed

#2-0 is a **leaf node** — no sub-branches, because it IS the mathematical seed from which all M2 structures crystallize. It holds the only formulation in the entire M2 dataset:

> **x² - x - 1 = 0** (where x = φ, the golden ratio)

This is the characteristic polynomial of φ. The formulation encodes Parashakti's imaginal potential: the X# system's eternal exploration at the threshold of void, containing infinite creative potential through golden ratio structuring.

**The Trika Bridge:** #2-0 operates as the spinorial-epistemological bridge where the sacred Trika (Anuttara-Paramasiva-Parashakti) achieves its first stable mathematical expression:
- **Spanda** (M1 #1-3) → generates π through oscillatory dynamics
- **Ananda** (M1 #1-2) → structures harmonic relationships via pentadic golden ratio
- **Pi-oscillation** → the engine that drives all 72-bit rotational manifestations

**Key Relations:**
- `SPANDA_ANANDA_SYNTHESIS`: #2-0 receives from M1's generative machinery
- `BIMBA_ORIGINAL_FOUNDATION`: #2-0 → #2-4 (grounds the vibrational arena)
- `PRATIBIMBA_REFLECTION_FOUNDATION`: #2-0 → #2-4 (reflection pair)
- `O_SYSTEM_ZERO_LOGIC_BRIDGE`: #2-0 → M0 connection
- `X_SYSTEM_COSMIC_IMAGINATION_BRIDGE`: #2-0 → M0 connection

**Formal System Type:** Algebraic identity / characteristic polynomial
**Cardinality:** Singular (seed) — no odd/even heuristic needed

**C Structure:**
```c
// Golden ratio seed constants — .rodata
// These are compile-time foundations for all M2 matrix construction
#define M2_PHI           1.6180339887f   // Golden ratio
#define M2_PHI_SQUARED   2.6180339887f   // φ² = φ + 1
#define M2_PHI_INVERSE   0.6180339887f   // 1/φ = φ - 1
#define M2_PI            3.1415926536f   // Spanda oscillation constant
#define M2_SQRT5         2.2360679775f   // √5 (φ = (1+√5)/2)

// The seed structure anchoring all vibrational mathematics
typedef struct {
    float phi;              // Golden ratio
    float pi;               // Spanda oscillation
    float sqrt5;            // Pentadic root
    uint8_t trika[3];       // {ANUTTARA, PARAMASIVA, PARASHAKTI} indices
} M2_Seed_Constants;

static const M2_Seed_Constants M2_SEED = {
    .phi   = M2_PHI,
    .pi    = M2_PI,
    .sqrt5 = M2_SQRT5,
    .trika = {0, 1, 2}     // The sacred Trika
};
```

---

## FR 2.2.1 (Revised): #2-1 — MEF Meta-Logikon — 12-Lens Architecture

**Requirement:** The C engine MUST implement the Meta-Epistemic Framework as a `[12][6]` matrix of 72 vibrational conditions. Rows 0–5 are the six base lenses. Rows 6–11 are the six inverted (') lenses — the result of applying the # Inversion Operator to the entire epistemic frame. The `get_mef_condition()` function MUST route to the correct half using the `Holographic_Coordinate`'s `inversion_state` bit. Each lens MUST maintain a direct structural linkage to the L coordinate family (L0–L5).

**Ontological Ground:** #2-1 (MEF — Meta-Logikon — The Complete 12×6 Vibrational Template)

### Revision 2: Why 12 Lenses, Not [6][6][2]

The original `[6][6][2]` structure treated the inversion phase as a generic binary toggle. This was architecturally imprecise. The MEF has **12 full lenses**: the six epistemic lenses each exist in two complete modes — their standard (base) orientation and their fully inverted (') orientation produced by applying # to the lens itself. This is not a phase flag; it is the # Inversion Operator operating at the lens level, which is exactly what that operator does throughout the entire coordinate system.

Mathematical equivalence: `[6][6][2]` = `[12][6]` = 72 cells. The 72-Invariant is preserved perfectly.

The `[12][6]` shape makes the inversion structure explicit and native to the array index, removing any ambiguity about what "phase" means.

### The 12 MEF Lenses

| Lens Row | Coordinate | Name | L-Family Link | Mode |
|----------|-----------|------|---------------|------|
| 0 | #2-1-0 | Archetypal-Numerical | L0 (Literal) | Base |
| 1 | #2-1-1 | Causal | L1 (Functional) | Base |
| 2 | #2-1-2 | Logical (Tetralemma) | L2 (Structural) | Base |
| 3 | #2-1-3 | Processual | L3 (Archetypal) | Base |
| 4 | #2-1-4 | Meta-Epistemic | L4 (Paradigmatic) | Base |
| 5 | #2-1-5 | Divine-Scalar (Vak) | L5 (Integral) | Base |
| 6 | #2-1-0' | Archetypal-Numerical Inverted | L0' | Inverted (#) |
| 7 | #2-1-1' | Causal Inverted | L1' | Inverted (#) |
| 8 | #2-1-2' | Logical Inverted | L2' | Inverted (#) |
| 9 | #2-1-3' | Processual Inverted | L3' | Inverted (#) |
| 10 | #2-1-4' | Meta-Epistemic Inverted | L4' | Inverted (#) |
| 11 | #2-1-5' | Divine-Scalar Inverted | L5' | Inverted (#) |

**Routing law:** `actual_lens = is_inverted ? (lens_0_to_5 + 6) : lens_0_to_5`

### Sub-Positions (y-axis, shared across all 12 lenses)

| y | Position | Nature |
|---|----------|--------|
| 0 | Originating potential | Ground/void (implicate) |
| 1 | Material grounding | What (first explicate) |
| 2 | Active process | How |
| 3 | Mediating identity | Who |
| 4 | Contextual field | When/where |
| 5 | Purpose | Why (integration) |

### FR 2.2.2 (sub): L-Family Bimba Link

**The MEF `.rodata` IS the Bimba for the L coordinate family.** The L-family is one of the six core grammatical families (P, S, T, M, L, C). When the system instantiates an L-family coordinate on the Heap, that instance is not an isolated semantic token — it physically embodies an MEF lens. The MEF matrix is the `.rodata` foundation; the L-family coordinate is the Pratibimba.

**L_Family_State Payload:**

Every L-family `Holographic_Coordinate` instance on the Heap MUST carry this struct as its `payload_extension`:

```c
// Mutable Heap payload for L (Lens) coordinate family instances
// This struct anchors each L-coordinate instance to its exact
// 1-byte MEF condition in .rodata and accumulates session state.
typedef struct {
    // The exact 1-byte copy of the MEF Condition from .rodata
    // Points into the [12][6] matrix at (actual_lens, position)
    MEF_Condition active_mef_bimba;

    // Mutable semantic density accumulated during the active session
    // Represents "lens tension" — how strained or relaxed this lens is
    float lens_tension;

    // Neo4j Node ID for this contextual lens instantiation
    uint32_t semantic_vector_id;
} L_Family_State;
```

**Type-Safe Ontological Bridge:** If the C engine encounters an L-family coordinate, it inherently knows to validate it against the 12×6 MEF matrix. It uses the same `inversion_state` bit that governs the entire coordinate system to select the correct inverted lens row. The philosophy and hardware execution are structurally identical.

### CAUSAL_RESONANCE: The MEF Internal Weave

The CAUSAL_RESONANCE relation (336 edges, 294 internal to #2-1) is the cross-weaving mechanism between lenses. Additionally, 7 CAUSAL_RESONANCE edges connect from each top-level sub-branch (#2-0 through #2-5) into #2-1, making the MEF the **causal hub** through which all M2 sub-systems resonate.

### FR 2.2.5: Causal Resonance Masks — O(1) Cross-Weave

**Requirement:** The 3D `uint8_t M2_MEF_RESONANCE[6][6][6]` graph traversal MUST be replaced with 36 `uint64_t` bitmasks — one per base MEF condition. Bit `N` set in mask `K` means: base condition `K` causally resonates with base condition `N`. The query "what resonates with lens L, position P?" is a single array lookup plus no iteration.

```c
// CAUSAL_RESONANCE cross-weave data is resolved from the Neo4j graph at runtime.
// The 336 CAUSAL_RESONANCE edges within #2-1 constitute the MEF's internal weave.
// These are NOT pre-specified as C constants — they are graph data.
// At runtime: query Neo4j for (MEF_Condition)-[:CAUSAL_RESONANCE]->(MEF_Condition) edges
// and build the resonance bitmask dynamically from the live graph.
// O(1) access after initial build; the pattern is: 64-bit mask per MEF condition.
```

**Performance:** Reduces a 3D graph traversal (iterating up to 216 bytes) to a single array lookup and a bitwise mask check. For the M4 Oracle Dispatcher querying MEF resonances on the hot path, this is critical.

### Lens Internal Structures

Each lens contains 6 sub-positions (43 total nodes including #2-1 root):

**#2-1-0 Archetypal-Numerical:** Psychoid numbers as Jung-Pauli entities. Zero as dual value/position → fused ground at position 0.

**#2-1-1 Causal Lens:** Aristotelian four causes (material, efficient, formal, final) expanded to 6 positions. Position 0 = primordial undifferentiated causation. Positions 1–4 = four causes. Position 5 = bifurcated final cause (will as quintessence).

**#2-1-2 Logical Lens (Tetralemma):** Nagarjuna's catuskoti: Is / Is-Not / Both / Neither. Position 0 = Question (pre-logical potential). Positions 1–4 = four lemmas. Position 5 = synthesized response (beyond logic).

**#2-1-3 Processual Lens:** Whiteheadian concrescence as organic cycle: Soil → Seeding → Sprouting → Cultivation → Harvest → Composting.

**#2-1-4 Meta-Epistemic Lens:** Husserlian Institution-Constitution-Lifeworld, with the Heidegger Turn at position 4. Position 0 = Ajnana (implicit unknowing). Position 5 = Jnana (wholistic knowing).

**#2-1-5 Divine-Scalar Lens (Vak Cosmology):** Reality as Divine Speech: Anuttara → Para Vak → Pasyanti → Madhyama → Vaikhari → Siva-Sakti.

**Other Key Relations:**
- `HAS_SUB_LENS`: 36 edges (parent → child lens positions)
- `HARMONIZED_IN`: 36 edges (positions harmonized within their lens context)
- `HOLOGRAPHIC_RESONANCE`: 24 edges (cross-lens holographic patterning)
- `DIVINE_SPEECH_RESONANCE`: 24 edges (Vak lens radiating into other lenses)
- `IS_ILLUMINATED_BY`: 23 edges (epistemic illumination chains)
- `PERMEATES_AS_*`: 5 modalities × ~4 edges each
- `WEAVES_*_THREAD`: 6 edges (void/unity/duality/synthesis/completion/transcendence threads)

**C Structure:**
```c
// MEF condition descriptor — MUST compile to exactly 1 byte
// (required for M2_Vibrational_72_Space union correctness)
// Semantic payload is stored in an external table indexed by a flat index.
typedef uint8_t MEF_Condition;  // Flat index: (lens_0_to_11 * 6) + position_0_to_5

// MEF condition semantic descriptor — external payload table (NOT in the union)
typedef struct {
    uint8_t lens;           // 0-11 (0-5 = base, 6-11 = inverted)
    uint8_t position;       // 0-5 (sub-position)
    uint8_t is_inverted;    // 0 = base, 1 = inverted (#-applied)
    uint8_t l_family_link;  // L-coordinate index 0-5 (lens % 6 for direct mapping)
    uint16_t meaning_id;    // Semantic payload index into external string table
} MEF_Condition_Desc;

// External semantic table — indexed by flat MEF byte value (0-71)
static const MEF_Condition_Desc M2_MEF_DESC[72] = { /* ... */ };

// O(1) routing into the 12×6 matrix
// Returns the flat MEF_Condition byte value
static inline MEF_Condition get_mef_condition(
        uint8_t lens_0_to_5,
        uint8_t pos_0_to_5,
        bool is_inverted) {
    uint8_t actual_lens = is_inverted ? (lens_0_to_5 + 6) : lens_0_to_5;
    // The M2_Vibrational_72_Space instance is accessed via the .rodata archetype
    // (extern const M2_Vibrational_72_Space M2_ARCHETYPES — declared elsewhere)
    return M2_ARCHETYPES.mef_lenses[actual_lens][pos_0_to_5];
}

// L-family structural linkage macro
// MEF lens index 0-5 maps directly to L0-L5
#define MEF_TO_L_FAMILY(lens_0_to_5)     (lens_0_to_5)
// For inverted lenses (rows 6-11), the base L family index is: lens - 6
#define MEF_INVERTED_TO_L_FAMILY(lens_6_to_11)  ((lens_6_to_11) - 6)
```

---

## FR 2.2.2 (Revised): #2-2 — 36 Tattvas System (The Metaphysical Gradient)

**Requirement:** The C engine MUST implement the 36 Tattvas as a `[36][2]` lookup table (72 total states) organized in three divisions (5/7/24), with the Mahabhutas (#2-2-2-5) serving as the element throughline anchor. The `Tattva_Entry` type MUST compile to exactly 1 byte per cell to satisfy the 72-space union.

**Ontological Ground:** #2-2 (36 Tattvas System — Progressive Manifestation and Reabsorption of Supreme Consciousness)

### The Trinitarian Split: 5/7/24

| Division | Coordinate | Name | Count | Tattvas | Array Range |
|----------|-----------|------|-------|---------|-------------|
| **Pure** | #2-2-0 | Shuddha | 5 | Shiva, Shakti, Sadashiva, Ishvara, Shuddha Vidya | `[0..4]` |
| **Pure-Impure** | #2-2-1 | Shuddhashuddha | 7 | Maya + 5 Kanchukas + Purusha | `[5..11]` |
| **Impure** | #2-2-2 | Ashuddha | 24 | Prakriti → Mahabhutas | `[12..35]` |

**The 5/7 Resonance:** 5+7=12 resonates with Ficino's planetary musicality (pentatonic/heptatonic duality). The 24 Ashuddha tattvas: 24 = 4! = all permutations of a quaternity, linking material tattvas to the fourfold structure of manifest reality.

### FR 2.2.6: Element Throughline as Flags Byte Embedding

**Requirement:** The `Element_Id` (0–4: Akasha/Vayu/Agni/Apas/Prithvi) MUST be embedded directly in the `flags` byte of the `Holographic_Coordinate` whenever an M2 family instance is loaded onto the Heap. This allows the M4 Oracle Dispatcher to read the elemental nature of any vibration without querying `.rodata` LUTs.

```c
// Element enumeration — the five-fold throughline spine
typedef enum {
    ELEMENT_AKASHA  = 0,  // Space/Ether/Quintessence
    ELEMENT_VAYU    = 1,  // Air
    ELEMENT_AGNI    = 2,  // Fire
    ELEMENT_APAS    = 3,  // Water
    ELEMENT_PRITHVI = 4   // Earth
} Element_Id;

// Flags byte bit layout for M2 Holographic_Coordinate instances
// Bits [2:0] hold the Element_Id (0-4, so 3 bits suffice)
// The remaining bits carry other M2-specific flags
#define M2_FLAGS_ELEMENT_MASK   0x07u   // bits [2:0]
#define M2_FLAGS_ELEMENT_SHIFT  0

// Embed element into flags byte
#define M2_FLAGS_SET_ELEMENT(flags, elem_id) \
    (((flags) & ~M2_FLAGS_ELEMENT_MASK) | \
     (((uint8_t)(elem_id)) << M2_FLAGS_ELEMENT_SHIFT))

// O(1) read of element from flags — no .rodata lookup required
#define M2_FLAGS_GET_ELEMENT(flags) \
    (((flags) & M2_FLAGS_ELEMENT_MASK) >> M2_FLAGS_ELEMENT_SHIFT)
```

### Element Throughline: The Mahabhutas

| Element | Tattva Index | Decan Link (#2-3) | Mantra Link (#2-4.1) | Chakra Link (#2-5) |
|---------|-------------|-------------------|---------------------|-------------------|
| **Akasha** (Space) | 32 | #2-3-5/0 Quintessence | Visarga group | Vishuddha (#2-5-0/1-5) |
| **Vayu** (Air) | 33 | #2-3-3 Air Decans | Palatal consonants | Anahata (#2-5-0/1-4) |
| **Agni** (Fire) | 34 | #2-3-1 Fire Decans | Retroflex consonants | Manipura (#2-5-0/1-3) |
| **Apas** (Water) | 35 | #2-3-4 Water Decans | Dental consonants | Svadhisthana (#2-5-0/1-2) |
| **Prithvi** (Earth) | 36 | #2-3-2 Earth Decans | Labial consonants | Muladhara (#2-5-0/1-1) |

**Key Relations:** `HAS_INTERNAL_COMPONENT`, `GENERATES_KANCHUKA`, `BINDS`, `KOSHA_DESCENT`, `KOSHA_INTEGRATION`, `KOSHA_RETURN`, `CORRESPONDS_TO_ELEMENT`

**C Structure:**
```c
// Tattva division enumeration
typedef enum {
    TATTVA_SHUDDHA        = 0,  // Pure (indices 0-4)
    TATTVA_SHUDDHASHUDDHA = 1,  // Pure-Impure (indices 5-11)
    TATTVA_ASHUDDHA       = 2   // Impure (indices 12-35)
} Tattva_Division;

#define TATTVA_PURE_START    0
#define TATTVA_PURE_END      4    // 5 tattvas
#define TATTVA_MIXED_START   5
#define TATTVA_MIXED_END     11   // 7 tattvas
#define TATTVA_IMPURE_START  12
#define TATTVA_IMPURE_END    35   // 24 tattvas

// Tattva_Entry — MUST compile to exactly 1 byte per cell for the 72-space union
// Semantic payload is stored externally, indexed by flat_idx = (tattva_idx * 2 + phase)
typedef uint8_t Tattva_Entry;  // Encoded: bits[5:0] = tattva index (0-35), bit[6] = phase

// External semantic descriptor (NOT in the union)
typedef struct {
    uint8_t index;          // 0-35
    uint8_t division;       // Tattva_Division
    uint8_t element_id;     // Element_Id (0xFF if not a Mahabhuta)
    uint8_t kanchuka_mask;  // For Shuddhashuddha: which kanchukas bind
    uint16_t meaning_id;    // Semantic payload
} Tattva_Entry_Desc;

static const Tattva_Entry_Desc M2_TATTVA_DESC[36][2] = { /* ... */ };

// Element throughline: maps Element_Id to cross-system indices
typedef struct {
    uint8_t tattva_idx;     // Index in M2_TATTVA_DESC
    uint8_t decan_element;  // Index in Decan element array (0=Fire,1=Earth,2=Air,3=Water,4=Quint)
    uint8_t mantra_group;   // Matrika consonant group index
    uint8_t chakra_idx;     // Index in #2-5 chakra array
} Element_Throughline;

static const Element_Throughline M2_ELEMENTS[5] = {
    { 32, 4, /* visarga  */ 0, 5 },  // Akasha → Quintessence → Vishuddha
    { 33, 2, /* palatal  */ 1, 4 },  // Vayu   → Air          → Anahata
    { 34, 0, /* retroflex*/ 2, 3 },  // Agni   → Fire         → Manipura
    { 35, 3, /* dental   */ 3, 2 },  // Apas   → Water        → Svadhisthana
    { 36, 1, /* labial   */ 4, 1 },  // Prithvi → Earth       → Muladhara
};
```

---

## FR 2.2.3 (Revised): #2-3 — Decans System (The 36×2 Archetypal Faces)

**Requirement:** The C engine MUST implement the Decan system as a `[4][3][3][2]` array (= 72), organized by the four classical elements plus a Quintessence sentinel. The `Decan_Face` type MUST compile to exactly 1 byte per cell to satisfy the 72-space union.

**Ontological Ground:** #2-3 (Decans System — Ancient Egyptian-Hermetic Zodiacal Energy Mapping)

### The Elemental Architecture

126 nodes organized as 4 elements × 3 zodiacal signs × 3 decans × 2 faces (light/shadow) + Quintessence:

| Element | Coordinate | Signs | Array Index |
|---------|-----------|-------|-------------|
| **Fire** | #2-3-1 | Aries, Leo, Sagittarius | `decan[0][sign][decan][face]` |
| **Earth** | #2-3-2 | Taurus, Virgo, Capricorn | `decan[1][sign][decan][face]` |
| **Air** | #2-3-3 | Gemini, Libra, Aquarius | `decan[2][sign][decan][face]` |
| **Water** | #2-3-4 | Cancer, Scorpio, Pisces | `decan[3][sign][decan][face]` |
| **Quintessence** | #2-3-5/0 | Unified field | Sentinel / synthesis |

**The Quintessence Sentinel (#2-3-5/0):** Uses the 5/0 fused coordinate — transcendent unity of all four elements AND the return to ground. Sits outside the 4-element indexing as a synthesis accessor.

**Key Relations:** `HAS_DECAN` (252 edges), `RULED_BY` (47 edges), `DOMINANT_PLANETARY_RESONANCE` (65 edges), `TONIC_PLANETARY_RESONANCE` (62 edges), `HAS_ZODIAC_SIGN` (12 edges), `MIRROR_COMPLEMENT_CORRESPONDENCE` (98 edges), `PLANETARY_SPIRITUAL_CORRESPONDENCE` (68 edges)

**C Structure:**
```c
// Decan_Face — MUST compile to exactly 1 byte per cell for the 72-space union
// Semantic payload is stored externally indexed by flat index
typedef uint8_t Decan_Face;
// Encoding: bits[4:3] = element (0-3), bits[2:1] = sign (0-2),
//           bit[0] = face (0=light, 1=shadow)
// Decan within sign can be recovered from flat index: (flat >> 1) % 3

// External semantic descriptor (NOT in the union)
typedef struct {
    uint8_t element;        // Element_Id (0-4)
    uint8_t sign;           // Zodiacal sign (0-2 within element)
    uint8_t decan;          // Decan within sign (0-2)
    uint8_t face;           // 0 = light, 1 = shadow
    uint8_t ruling_planet;  // Planet index (from #2-5)
    uint16_t meaning_id;    // Semantic payload
} Decan_Face_Desc;

static const Decan_Face_Desc M2_DECAN_DESC[4][3][3][2] = { /* ... */ };

// Flat accessor for 72-indexed operations
#define DECAN_FLAT_IDX(elem, sign, decan, face) \
    ((elem)*18 + (sign)*6 + (decan)*2 + (face))

// Quintessence sentinel (outside the 4-element array, not in the union)
static const Decan_Face_Desc M2_QUINTESSENCE_DECAN = {
    .element = ELEMENT_AKASHA,
    .sign = 0xFF,           // Transcendent — no specific sign
    .decan = 0xFF,
    .face = 0xFF,           // Beyond light/shadow
    .ruling_planet = 0xFF,  // Sun as implicit ruler
    .meaning_id = 0xFFFF    // Synthesis payload
};
```

---

## FR 2.2.4 (Revised): #2-4 — Vibrational Arena (The Living LUT Complex)

**Requirement:** The C engine MUST implement the Vibrational Arena as a collection of independent LUTs, each maintaining its own internal dynamics. The 72-fold systems use the canonical `[8][9]` / `[9][8]` shape within the `M2_Vibrational_72_Space` union. The 100-fold systems use their own LUT dimensions with the 36:64 internal decomposition. The 36:64 routing MUST use 128-bit bitmasks for O(1) lookup.

**Ontological Ground:** #2-4 (Vibrational Arena of Archetypal Powers — 365 nodes, 61% of M2)

### FR 2.2.4 (sub): Routing_Mask_128 — O(1) ASMA 36:64 Lookup

**Requirement:** Replace the `M2_ASMA_36_INTERNAL[36]` and `M2_ASMA_64_PROJECT[63]` index arrays with 128-bit bitmasks. Since the 100-fold systems have at most 100 entries (< 128), a two-`uint64_t` struct provides an O(1) bit-check for any index.

```c
// 128-bit Routing Mask
// Bit N set means index N belongs to this space.
// Covers indices 0-99 within two uint64_t words.
typedef struct {
    uint64_t low_64;   // bits for indices 0-63
    uint64_t high_64;  // bits for indices 64-99 (upper 28 bits unused)
} Routing_Mask_128;

// Static const masks in .rodata — set at compile time to reflect
// the canonical 36:64 decomposition of the Asma ul-Husna
static const Routing_Mask_128 ASMA_36_INTERNAL_MASK = {
    /* low_64: bits for Asma indices 0-35 belonging to M2-internal template */
    /* high_64: 0 (all M2-internal names fit in first 36 indices) */
    0, 0  /* populated by architect — placeholder */
};

static const Routing_Mask_128 ASMA_64_PROJECTIVE_MASK = {
    /* low_64: bits for Asma indices 36-63 belonging to M3-projective space */
    /* high_64: bits for Asma indices 64-98 belonging to M3-projective space */
    0, 0  /* populated by architect — placeholder */
};

// O(1) Check: Does Asma Name at 'asma_index' project into M3?
// Single bitshift, no loop, no branch table.
static inline bool is_projective(uint8_t asma_index) {
    if (asma_index < 64) {
        return (bool)((ASMA_64_PROJECTIVE_MASK.low_64 >> asma_index) & 1ULL);
    } else {
        return (bool)((ASMA_64_PROJECTIVE_MASK.high_64 >> (asma_index - 64)) & 1ULL);
    }
}

// O(1) Check: Is Asma Name at 'asma_index' M2-internal (does NOT project)?
static inline bool is_internal(uint8_t asma_index) {
    if (asma_index < 64) {
        return (bool)((ASMA_36_INTERNAL_MASK.low_64 >> asma_index) & 1ULL);
    } else {
        return (bool)((ASMA_36_INTERNAL_MASK.high_64 >> (asma_index - 64)) & 1ULL);
    }
}
```

### The Five Sub-Systems

| System | Coordinate | Count | Shape | Internal Dynamic |
|--------|-----------|-------|-------|------------------|
| Asma ul-Husna | #2-4.0 | 99+1 | `[3][33] + 1` | 36:64 (36 MEF-internal + 64 M3-projective) |
| Shaivite Mantras | #2-4.1 | 50+50 | `[2][50]` | 36:64 (Matrika/Malini dual) |
| Spiritual Maqamat | #2-4.2 | 8×3 | `[8][3]` | 24 stations, 3 levels each |
| Musical Maqamat | #2-4.3 | 9 families | `[9][~8]` | 72 modes across 9 ajnas |
| 72 Names of God | #2-4.5 | 8×9 | `[8][9]` | 8 choirs × 9 names = 72 |

### The 36:64 Dynamic (100-Fold Systems)

The two 100-fold systems maintain LUT dimensions at **100 = 10²**, the square of the mod-10 Ananda Vortex base from M1 (#1-2). The internal decomposition is **36:64**:

- **36** positions remain as **M2-internal** vibrational template (MEF-resonant, 36 base conditions).
- **64** positions **project forward** into Mahamaya's 64-space bitboard operations.
- **+1** (in the Asma) is Al-Ism al-A'zham (the 100th Hidden Name) — non-dual completion outside both subsets.

This 36:64 split mirrors the Spanda→QL generative coupling (M1 #1-3/#1-4): 36% template, 64% projection, 100% total. Also: 72 × (8/9) = 64, and 72 - 64 = 8, where 36 = 72/2 (base before doubling) and 64 = 8² (destination space).

### #2-4.0: Asma ul-Husna (99 Names of Allah + Hidden Name)

103 nodes. Three groups (Jalal/Majesty 33, Kamal/Perfection 33, Jamal/Beauty 33) plus Al-Ism al-A'zham. **Key Relations:** `CONTAINS_DIVINE_NAME` (72 edges), `EXPRESSES_SPIRITUAL_STATION` (76 edges), `BELONGS_TO_AJNAS_FAMILY` (81 edges), `FINITE_MANIFESTATION_OF_INFINITE` (102 edges).

### #2-4.1: Shaivite Mantras (50+50)

62 nodes. Matrika System (#2-4.1-0): 16 Siva vowels + 34 Shakti consonants organized by articulation (element throughline). Malini System (#2-4.1-1): 50 consciousness-mantras (esoteric reordering).

### #2-4.2: Spiritual Maqamat (8×3 = 24)

32 nodes. La Maqam (meta-station at position 0, fused ground) + 7 classical stations (Tawba through Rida), each with 3 developmental levels (Awam, Khawas, Khawas al-Khawas).

### #2-4.3: Musical Maqamat (9 Families × ~8 = 72)

82 nodes. Nine ajnas generating 72 complete maqamat. Total across all families = 72.

| Family | Count | Characteristic Interval | Ratio | Cents |
|--------|-------|------------------------|-------|-------|
| Independent | 9 | Various (hybrid forms) | — | — |
| Rast | 8 | Neutral third | ~27:22 | ~350¢ |
| Bayati | 8 | Neutral second | ~12:11 | ~150¢ |
| Sikah | 5 | Quarter-tone tonic | ~24:23 | ~75¢ |
| Hijaz | 7 | Augmented second | ~75:64 | ~274¢ |
| Nahawand | 8 | Minor third (natural) | 6:5 | ~316¢ |
| Ajam | 6 | Major third | 5:4 | ~386¢ |
| Kurd | 7 | Minor second (Phrygian) | 16:15 | ~112¢ |
| Saba | 9 | Lowered second + diminished | ~13:12 | ~139¢ |
| Nawa Athar | 5 | Raised fourth (harmonic minor) | ~45:32 | ~590¢ |

### #2-4.5: 72 Names of God (Shem HaMephorash)

80 nodes. Exact `[8][9]` structure — 8 angelic choirs × 9 names per choir = 72 names = 216 letters (72×3). The `[8][9]` IS the canonical M2 factoring for the `.rodata` LUT shape. The `shem_names[8][9]` member of the `M2_Vibrational_72_Space` union uses this directly.

**C Structure (Revised — 1-byte cell types for the union):**
```c
// Shem_Name — MUST compile to exactly 1 byte per cell for the 72-space union
typedef uint8_t Shem_Name;  // Flat index into M2_SHEM_DESC[8][9]

// External semantic descriptor (NOT in the union)
typedef struct {
    char     trigram[4];    // 3-letter Hebrew name + null
    uint8_t  choir;         // Angelic choir index (0-7)
    uint8_t  position;      // Position within choir (0-8)
    uint16_t gematria;      // Numerical value
    uint16_t meaning_id;
} Shem_Name_Desc;

static const Shem_Name_Desc M2_SHEM_DESC[8][9] = { /* ... */ };

// Harmonic ratio (kept as separate .rodata, not in union)
typedef struct {
    uint8_t num;
    uint8_t den;
} Harmonic_Ratio;

static const Harmonic_Ratio M2_AJNA_RATIOS[10] = {
    {  0,  0 },  // Independent
    { 27, 22 },  // Rast
    { 12, 11 },  // Bayati
    { 24, 23 },  // Sikah
    { 75, 64 },  // Hijaz
    {  6,  5 },  // Nahawand
    {  5,  4 },  // Ajam
    { 16, 15 },  // Kurd
    { 13, 12 },  // Saba
    { 45, 32 },  // Nawa Athar
};

// Musical Maqam entry (separate .rodata LUT, not in union)
typedef struct {
    uint8_t family;
    uint8_t mode_in_family;
    uint8_t intervals[7];   // Interval pattern (quarter-tone units, 24-TET)
    uint8_t planet_ruler;
    uint16_t meaning_id;
} Maqam_Musical_Desc;

static const Maqam_Musical_Desc M2_MAQAM_DESC[72] = { /* ... */ };

// 100-fold systems (own LUT dimensions, not in the 72-space union)
typedef struct {
    uint8_t group;          // 0=Jalal, 1=Kamal, 2=Jamal
    uint8_t index_in_group; // 0-32
    uint8_t ql_72_map;      // Index into 72-space (0xFF if transcendent/hidden)
    uint16_t gematria;
    uint16_t meaning_id;
} Asma_Name_Desc;

static const Asma_Name_Desc M2_ASMA_LUT[99] = { /* ... */ };
static const uint16_t       M2_ASMA_HIDDEN_GEMATRIA = 0xFFFF; // Al-Ism al-A'zham

typedef struct {
    uint8_t system;         // 0=Matrika, 1=Malini
    uint8_t index;
    uint8_t is_vowel;
    uint8_t element_id;
    uint8_t tattva_idx;
    uint16_t meaning_id;
} Mantra_Entry_Desc;

static const Mantra_Entry_Desc M2_MANTRA_LUT[2][50] = { /* ... */ };

typedef struct {
    uint8_t station;        // 0=La Maqam, 1-7=classical
    uint8_t level;          // 0=Awam, 1=Khawas, 2=Khawas al-Khawas
    uint16_t meaning_id;
} Maqam_Spiritual_Desc;

static const Maqam_Spiritual_Desc M2_MAQAM_SPIRITUAL[8][3] = { /* ... */ };
```

---

## FR 2.2.5: #2-5 — Planetary Harmonic Integration (The Epogdoon Bridge)

**Requirement:** The C engine MUST implement the planetary system as 9 quantum operators (7 classical + Neptune + Pluto) plus the Sun as SU(2) identity element, with the 7 chakras as a sub-system under Sun, and MUST provide the epogdoon transform function that compresses M2's 72-space to M3's 64-space at the #2-5 → #3-0 boundary. The `M2_TO_M3_CYMATIC_PROJECTION[72]` DET table is the primary expression of this transform.

**Ontological Ground:** #2-5 (Planetary Harmonic Integration — The Ennead as Living Quantum Operators)

### The Planetary Architecture

| Planet | Coordinate | Quantum Role | Group Theory | Spanda Principle |
|--------|-----------|-------------|-------------|-----------------|
| **Sun** | #2-5-0/1 | SU(2) identity | Identity element | Prakasa (illumination) |
| **Venus** | #2-5-2 | SU(3) λ₃ diagonal | Harmonic beauty | Aesthetic coherence |
| **Mercury** | #2-5-3 | Gauge boson SU(2)↔SU(3) | Translation protocol | Temporal mediation |
| **Moon** | #2-5-4 | U(1) phase factor | Phase cycling | Rhythmic pulsation |
| **Saturn** | #2-5-5 | Prime 43 fixed point | Topological constraint | Concealment |
| **Jupiter** | #2-5-6 | Prime 41 expander | Wisdom elaboration | Grace |
| **Mars** | #2-5-7 | Catalytic operator | Breakthrough | Harmonic integration |
| **Neptune** | #2-5-8 | Transpersonal dissolver | Boundary dissolution | Vimarsa (dissolution into cosmic imagination) |
| **Pluto** | #2-5-9 | Transpersonal transformer | Death/rebirth cycle | Pralaya (dissolution and regeneration) |

**The 9:8 Embodiment:** 9 planets (excluding Sun-as-identity) : 8 angelic choirs (Shem) IS the epogdoon ratio made flesh in the planetary/angelic architecture. Also: 9 maqam families mirror the planetary ennead.

### The Chakra Sub-System (Under Sun)

| Chakra | Coordinate | Element | Shakti | Principle |
|--------|-----------|---------|--------|-----------|
| Earth (ground) | #2-5-0/1-0 | All | Bhumi | Grounding potential |
| Muladhara | #2-5-0/1-1 | Prithvi | Sthapana | Structure/stability |
| Svadhisthana | #2-5-0/1-2 | Apas | Sarga | Flow/generation |
| Manipura | #2-5-0/1-3 | Agni | Kriya | Dynamic transformation |
| Anahata | #2-5-0/1-4 | Vayu | Sanghata | Relational harmony |
| Vishuddha | #2-5-0/1-5 | Akasha | Akasha | Vibrational expression |
| Ajna | #2-5-0/1-6 | Beyond | Jnana | Pure perception |
| Sahasrara | #2-5-0/1-7 | Beyond | Cit | Undifferentiated consciousness |

### The Epogdoon Transform: #2-5 → #3-0

The **9:8 epogdoon ratio** is THE cross-boundary compression function: **72 × (8/9) = 64**. Places at #2-5 bridging to #3-0. Maps Parashakti's vibrational templates to Mahamaya's bitboard operations.

### FR 2.2.7: M2_TO_M3_CYMATIC_PROJECTION — The Discrete Epistemic Transform (DET)

**Requirement:** The C engine MUST provide a 72-element `uint64_t` array in `.rodata` that maps each of the 72 M2 vibrational states (flat indices 0–71 into `M2_Vibrational_72_Space`) to its corresponding 64-bit M3 bitmask. The `transduce_vibration_to_symbol()` function MUST use bitwise OR to accumulate masks, which implements wave superposition (constructive interference) without any floating-point arithmetic.

**Rationale:** M2 (Parashakti) and M3 (Mahamaya) constitute the Wave-Particle dyad — Vimarsa and Prakasa. A literal Fast Fourier Transform (FFT) would require floating-point arithmetic on the hot path, which is prohibited. The DET is the integer-native substitute: a `.rodata` lookup table that encodes the Fourier relationships at compile time. Each M2 vibrational index is a "frequency bin" that excites one or more bits on the M3 64-bit "cymatic plate." When multiple M2 states are active simultaneously, their masks are OR'd together — exactly the constructive interference of a wave superposition.

**The DET as Epogdoon Encoding:** The 9:8 compression is encoded in the structure of the projection masks. All 72 states must project into 64 bits, so the mapping is many-to-one at the bit level: on average, 72/64 = 1.125 M2 states share each M3 bit. The specific assignment of which M2 states map to which M3 bits develops in operation as the system accumulates correspondence data.

**The Elemental Throughline as Foundational Connective Tissue:** The 4+1 elements (Fire, Earth, Air, Water, Quintessence/Akasha) running through Tattvas (#2-2) → Decans (#2-3) → Mantras (#2-4.1) → Planets (#2-5) → and into Tarot / I-Ching in M3 is the *structural spine* of the DET. This elemental correspondence is the foundational connective tissue that makes the M2→M3 projection coherent. The `M2_TO_M3_CYMATIC_PROJECTION` table ultimately encodes this elemental throughline.

```c
// The Discrete Epistemic Transform (DET) — .rodata
// Maps each of the 72 M2 vibrational states (flat index 0-71)
// to its corresponding M3 64-bit bitmask.
//
// This is the Cymatic Projection Matrix:
//   M2 = continuous vibrational domain (Vimarsa/Parashakti)
//   M3 = discrete symbolic domain (Prakasa/Mahamaya)
//
// Flat index N corresponds to M2_Vibrational_72_Space.raw_vibration[N]
// and its associated MEF, Tattva, Decan, or Shem coordinate.
//
// extern declaration — defined in archetypes_m2.c
extern const uint64_t M2_TO_M3_CYMATIC_PROJECTION[72];

// Compile-time enforcement: array must have exactly 72 entries
_Static_assert(
    sizeof(M2_TO_M3_CYMATIC_PROJECTION) == 72 * sizeof(uint64_t),
    "M2_TO_M3_CYMATIC_PROJECTION must have exactly 72 entries"
);

// Transduce a set of active M2 vibrational states into a single M3 bitboard.
// Bitwise OR implements wave superposition (constructive interference).
// This is the primary M2→M3 bridge function.
//
// @param m2_active_indices  Array of flat M2 indices (0-71) that are currently active
// @param count              Number of active indices
// @return                   M3 64-bit bitboard representing the composite symbolic state
static inline uint64_t transduce_vibration_to_symbol(
        const uint8_t m2_active_indices[],
        uint8_t count) {
    uint64_t m3_bitboard = 0;
    for (uint8_t i = 0; i < count; i++) {
        // Bitwise OR = wave superposition / constructive interference
        m3_bitboard |= M2_TO_M3_CYMATIC_PROJECTION[m2_active_indices[i]];
    }
    return m3_bitboard;
}
```

**Usage Example:**

```c
// Example: Translate an active vibrational state in M2 to an M3 symbolic reading
// Suppose the MEF condition "Causal Lens, position 3, base mode" (flat index = 1*6+3 = 9)
// and the corresponding Tattva (flat index = 14*2+0 = 28) are active:
uint8_t active[2] = { 9, 28 };
uint64_t m3_mask = transduce_vibration_to_symbol(active, 2);
// m3_mask now encodes the I-Ching hexagram / DNA codon pattern that
// "cures" or represents this vibrational state in M3's symbolic space.
```

### The SO(3) → SU(2) Double Covering

All planetary operations inherit the double-covering from #2-0: a 720° rotation in quantum spin space required for identity return. Every planetary operator acts on PAIRS of states (the [2] phase dimension), not individual states.

**Key Relations:** `PLANETARY_SPIRITUAL_DEVELOPMENT` (69 edges), `PLANETARY_SPIRITUAL_CORRESPONDENCE` (68 edges), `DOMINANT_PLANETARY_RESONANCE` (65 edges), `TONIC_PLANETARY_RESONANCE` (62 edges), `RULED_BY` (47 edges), `GROUNDS_CHAKRAL_PATHWAY`, `FEEDS_EARTH_ELEMENT`

**C Structure:**
```c
typedef enum {
    PLANET_SUN     = 0,  // SU(2) identity (0/1 dual)
    PLANET_VENUS   = 2,  // SU(3) λ₃
    PLANET_MERCURY = 3,  // Gauge boson
    PLANET_MOON    = 4,  // U(1) phase
    PLANET_SATURN  = 5,  // Prime 43 constraint
    PLANET_JUPITER = 6,  // Prime 41 expander
    PLANET_MARS    = 7,  // Catalytic operator
    PLANET_NEPTUNE = 8,  // Transpersonal dissolver
    PLANET_PLUTO   = 9   // Transpersonal transformer
} Planet_Id;
// 9 operators (indices 2-9) : 8 choirs = 9:8 epogdoon

typedef enum {
    CHAKRA_EARTH        = 0,
    CHAKRA_MULADHARA    = 1,  // Prithvi
    CHAKRA_SVADHISTHANA = 2,  // Apas
    CHAKRA_MANIPURA     = 3,  // Agni
    CHAKRA_ANAHATA      = 4,  // Vayu
    CHAKRA_VISHUDDHA    = 5,  // Akasha
    CHAKRA_AJNA         = 6,  // Beyond elements
    CHAKRA_SAHASRARA    = 7   // Beyond elements
} Chakra_Id;

typedef struct {
    Planet_Id id;
    uint8_t group_type;     // 0=SU(2), 1=SU(3), 2=U(1), 3=catalytic
    uint8_t prime;          // Associated prime (41, 43, etc.; 0 if none)
    uint8_t element_id;     // Primary element correspondence
    uint8_t chakra_link;    // Chakra_Id (0xFF if no direct link)
    uint16_t meaning_id;
} Planet_Operator;

static const Planet_Operator M2_PLANET_LUT[10] = { /* ... */ };

typedef struct {
    Chakra_Id id;
    uint8_t element_id;     // Element_Id (0xFF for Ajna, Sahasrara)
    uint8_t tattva_idx;
    uint16_t meaning_id;
} Chakra_Entry;

static const Chakra_Entry M2_CHAKRA_LUT[8] = { /* ... */ };

// The Epogdoon integer transform
// Maps 72-space to 64-space via 9:8 ratio
// This is the arithmetic expression of the M2→M3 boundary
static inline uint8_t m2_epogdoon_compress(uint8_t val_72) {
    return (val_72 * 8) / 9;
}

// Inverse: approximate 64-space back to 72-space
static inline uint8_t m3_epogdoon_expand(uint8_t val_64) {
    return (val_64 * 9) / 8;
}
```

---

## Complete _Static_assert Block

The following block MUST appear in the M2 implementation file to guarantee all invariants at compile time:

```c
// ============================================================
// M2 COMPILE-TIME INVARIANT ENFORCEMENT
// ============================================================

// FR 2.2.0: Union cell types must be exactly 1 byte
_Static_assert(sizeof(MEF_Condition) == 1,
    "MEF_Condition must be 1 byte (required for 72-space union)");
_Static_assert(sizeof(Tattva_Entry)  == 1,
    "Tattva_Entry must be 1 byte (required for 72-space union)");
_Static_assert(sizeof(Decan_Face)    == 1,
    "Decan_Face must be 1 byte (required for 72-space union)");
_Static_assert(sizeof(Shem_Name)     == 1,
    "Shem_Name must be 1 byte (required for 72-space union)");

// FR 2.2.0: The 72-Invariant Law
_Static_assert(
    sizeof(M2_Vibrational_72_Space) == 72 * sizeof(MEF_Condition),
    "M2 72-Space Violation: union size does not resolve to exactly 72 cells");

// FR 2.2.7: DET projection table must have exactly 72 entries
_Static_assert(
    sizeof(M2_TO_M3_CYMATIC_PROJECTION) == 72 * sizeof(uint64_t),
    "M2_TO_M3_CYMATIC_PROJECTION must have exactly 72 entries");

// FR 2.2.4: Routing mask struct must be exactly 16 bytes (two uint64_t)
_Static_assert(sizeof(Routing_Mask_128) == 16,
    "Routing_Mask_128 must be exactly 16 bytes");

```

---

## Cross-Branch Interface Summary

### Imports from M0 and M1

| Source | What | Used By |
|--------|------|---------|
| M0 #0-3-0/1 | The Frame `()` operator | All M2 execution contexts |
| M0 R-Factor system | Dynamic weaving across QL frames | MEF lens interweaving |
| M1 #1-2 (Ananda) | Harmonic matrices, DR rings | #2-0 seed constants |
| M1 #1-3 (Spanda) | Generative state machine | All planetary operators (Spanda principles) |
| M1 #1-4 (QL Flowering) | #define cascade, system constants | All M2 array dimensions (72, 36, etc.) |
| M1 #1-5 (Toroidal) | 4g+2g=6, double covering | SO(3)→SU(2) structure in #2-5 |

### Exports to M3-M5

| Destination | What | Source |
|-------------|------|--------|
| **M3 #3-0** | 64-space via epogdoon + DET | #2-5 (epogdoon), `M2_TO_M3_CYMATIC_PROJECTION` |
| M3 | Vibrational template LUTs | All of #2-4 (arena systems) |
| M3 | Element correspondence table | `M2_ELEMENTS` throughline |
| M4 | L-family structural linkage via `L_Family_State` | #2-1 MEF (12-lens Bimba) |
| M4 | Element_Id in flags byte | FR 2.2.6 embedding |
| M4 | Chakra pathway | #2-5 chakra system |
| M5 | Complete 72-fold synthesis | All M2 arrays as integration substrate |

### Deferred Relations (for future integration)

| Relation Type | Count | Target | Notes |
|---------------|-------|--------|-------|
| DIGITAL_ARCHETYPAL_RESONANCE | 99 | Cross-branch | M0/M1 numerical resonances |
| SPECIFICALLY_MANIFESTS | 37 | Cross-branch | Archetypal instantiation |
| HARMONIZED_IN | 36 | Cross-branch | Harmonic correspondences |
| BROADLY_CHANNELS | 12 | Cross-branch | Channeling relationships |
| CHANNELS_MONOPOLY_PRINCIPLE | 9 | M3? | Game-theoretic shadow |
| ~650 unique relation types | ~1,150 | Internal #2-4 | Ultra-specific divine name, angel choir, maqam family operations — content for LUT values, not structural relations |

---

## Operational Flow: The M2 Internal Torus

```
#2-0 (Archetypal Numerical Ground)
  │  φ, π, √5 seed constants from M1
  │  Golden ratio characteristic: x² - x - 1 = 0
  ↓
#2-1 (MEF [12][6] = 72 vibrational conditions — REVISED)
  │  6 base epistemic lenses + 6 inverted (#) lenses
  │  12 rows × 6 positions = 72 (72-Invariant preserved)
  │  L-family Bimba linkage: MEF IS the .rodata for L0-L5 + L0'-L5'
  │  L_Family_State payload on every L-coordinate instance
  │  CAUSAL_RESONANCE cross-weave: 336 edges resolved from Neo4j graph at runtime
  │  get_mef_condition(lens, pos, is_inverted) → O(1) routing
  ↓
#2-2 (36 Tattvas × 2 = 72 metaphysical principles)
  │  Trinitarian split: 5 pure / 7 limiting / 24 material
  │  5/7 Ficino resonance: pentatonic/heptatonic duality
  │  24 = 4! permutations of quaternity
  │  Mahabhutas (5 elements) → ELEMENT THROUGHLINE anchor
  │  Element_Id embedded in Holographic_Coordinate flags byte (FR 2.2.6)
  ↓
#2-3 (36 Decans × 2 = 72 archetypal faces)
  │  [4 elements][3 signs][3 decans][2 faces]
  │  Elements connect to Mahabhutas via throughline
  │  Quintessence (#2-3-5/0) as transcendent sentinel
  │  Planetary rulership → #2-5
  ↓
#2-4 (Vibrational Arena — 365 nodes, 5 sub-systems)
  │  72-fold: Musical Maqamat (9 families), 72 Names (Shem [8][9])
  │  100-fold: Asma ul-Husna, Mantras
  │    36:64 split via Routing_Mask_128 — O(1) bitwise (FR 2.2.4)
  │    36 = M2-internal template, 64 = M3-projective
  │  24-fold: Spiritual Maqamat (8×3)
  │  All 72-fold members share M2_Vibrational_72_Space union
  ↓
#2-5 (Planetary Harmonics — 9 operators + Sun identity)
  │  Sun (SU(2) identity) + 9 planets (the ennead)
  │  9 planets : 8 choirs = 9:8 epogdoon embodied
  │  7 chakras under Sun = element throughline terminal
  │  SO(3) → SU(2) double covering from #2-0
  │  EPOGDOON: 72 × (8/9) = 64
  │  DET: M2_TO_M3_CYMATIC_PROJECTION[72] — wave superposition via OR
  ↓
  → M3 #3-0 (Mahamaya's 64-space ground)
     transduce_vibration_to_symbol() bridges the boundary
```

**The Element Throughline woven through the flow:**
```
Mahabhutas (#2-2-2-5)  ←→  Decan Elements (#2-3-{1-4,5/0})
       ↕                            ↕
Matrika Groups (#2-4.1-0-1)  ←→  Chakras (#2-5-0/1-{1-5})
```

Five elements, four sub-systems, one structural spine — the connective tissue of M2's vibrational architecture.

---

*"All roads lead to 72. This is the M2 invariant."*

---

*Document Version:* 2.0 (Revision 2 — Gemini Review Applied 2026-03-04)
*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/M/M2-parashakti-vibrational-architecture.md`
*Refinement Source:* `docs/specs/gemini-spec-M-branch-updates-refinements.md` lines 253–481
*Related Specifications:* `CLAUDE.md`, `M1-paramasiva-mathematical-dna.md`, `M3-mahamaya-symbolic-transcription.md`

---

## SPEC PATCH — Cross-M Harmonisation (2026-03-05)

**Source:** Cross-M Harmonisation Agent — Task #7
**Gaps Addressed:** FR 2.2.8 through FR 2.2.12 from M2 dataset review

---

### NEPTUNE AND PLUTO — ANALYTICALLY PREEMPTED

**Neptune (#2-5-8) and Pluto (#2-5-9) are absent from `nodes_parashakti.json` but are
structurally preempted in C code.** They are required for the 9:8 epogdoon to be real:
9 planets (indices 1–9, Sun excluded as identity) : 8 angelic choirs = 9:8 exactly.
Without Neptune and Pluto in the LUT, the epogdoon ratio collapses to 7:8 — architecturally
untenable. Their C values are derived analytically (Cousto cosmic octave + QL-positional
resonance), not from Neo4j data. Dataset nodes should be added in a future Neo4j sprint.

**Derivation method — Hans Cousto cosmic octave:**
Each planet's orbital period is octave-shifted into the audible range by successive doubling
(× 2^n until 20–20,000 Hz). This is the same method used for the existing mantra frequencies.

| Planet | Orbital period | Raw freq | Audible (octave-shifted) | Digital root |
|--------|---------------|----------|--------------------------|--------------|
| Neptune | 164.79 yr | 1.93 × 10⁻¹⁰ Hz | **211 Hz** | DR(211) = **4** ← Lemniscate |
| Pluto | 248.09 yr | 1.28 × 10⁻¹⁰ Hz | **140 Hz** | DR(140) = **5** ← Möbius return |

**The digital root convergences are architecturally constitutive, not incidental:**
Neptune's vibrational signature (DR=4) places it at the #4 Lemniscate/Context archetype —
the liminal boundary of the visible solar system, the fold-point where the outer incubates
the inner. Pluto's signature (DR=5) places it at the #5 Integration/Pratibimba archetype —
the transformer/mortality/rebirth planet, the ultimate Möbius return of solar-system energy
back to its ground. These are the two transpersonal planets, and they land on the two
synthesis positions of the QL cycle by acoustic necessity, not editorial choice.

**Abjad-analog values (structurally derived, not traditional Arabic gematria):**
The M2 architecture requires a numerical identity for each planet that participates in the
Asma cross-linking. Neptune's frequency integer (211) and Pluto's frequency integer (140)
serve as their abjad-analogs in the QL vibrational system:
- Neptune abjad-analog = **211** (prime; DR=4; encodes the epogdoon-nine in its digital root)
- Pluto abjad-analog = **140** = 4 × 5 × 7 (composite; DR=5; encodes the synthesis return)

```c
// ==============================================================================
// NEPTUNE AND PLUTO — ANALYTICALLY PREEMPTED CONSTANTS
// Derived from Hans Cousto cosmic octave (orbital period → audible range via ×2ⁿ)
// These values ARE valid for hot-path use. Dataset nodes TBD in future sprint.
// ==============================================================================

// Fundamental frequencies (Hz) — Cousto cosmic octave
#define PLANET_FREQ_NEPTUNE     211u    // DR(211)=4 — Lemniscate/Context archetype
#define PLANET_FREQ_PLUTO       140u    // DR(140)=5 — Integration/Möbius archetype

// Abjad-analog values (numerical identity in the M2 vibrational system)
// These are the frequency integers used as cross-reference anchors to the Asma system
#define PLANET_ABJAD_NEPTUNE    211u    // same as freq — prime, DR=4
#define PLANET_ABJAD_PLUTO      140u    // same as freq — 4×5×7, DR=5

// Keplerian daily motion (same units as FR 2.2.11 table, arcsec/day × 10)
// Derived: Saturn_velocity × (Saturn_period / Planet_period)
// Saturn = 120u; Neptune period = 164.79yr; Pluto period = 248.09yr
// Neptune: 120 × (29.46/164.79) ≈ 21u
// Pluto:   120 × (29.46/248.09) ≈ 14u
#define PLANET_KEPLERIAN_NEPTUNE_PREEMPT   21u   // arcsec/day × 10; DR(21)=3 (Process)
#define PLANET_KEPLERIAN_PLUTO_PREEMPT     14u   // arcsec/day × 10; DR(14)=5 (Integration)

// Group types: both transpersonal — 4 = dissolution/transformation beyond individual
// element_id: Neptune=3 (Water/Pisces), Pluto=1 (Earth/chthonic/Scorpio deep)
// primes: Neptune=47, Pluto=53 (next two primes after Jupiter=41, Saturn=43)
// chakra: Neptune=6 (Sahasrara — transcendence), Pluto=0 (Muladhara — root/void)

// Full preempted LUT entries — ready for M2_PLANET_LUT[10]
// .meaning_id = 0xFFFE (analytically preempted, dataset pending; ≠ 0xFFFF sentinel)
#define MEANING_ID_PREEMPTED  0xFFFEu   // Distinct from 0xFFFF (fully absent/unknown)

static inline bool m2_planet_is_preempted(Planet_Id id) {
    return (id == PLANET_NEPTUNE || id == PLANET_PLUTO);
}
// Note: m2_planet_is_preempted() does NOT block hot-path access.
// These entries carry real frequencies and are valid for epogdoon computation.
// Use for dataset-completeness checks only, not as an access guard.
```

---

### FR 2.2.8: Mantra Fundamental Frequency LUT

**Requirement:** The `Mantra_Entry_Desc` struct MUST include a `fundamental_frequency` field (in Hz, stored as `uint16_t`) encoding the foundational vibrational frequency for each of the 100 Mantra entries. Frequencies range from 144 Hz to 432 Hz based on dataset observations.

**Gap addressed:** Missing `fundamentalFrequency` property in `Mantra_Entry_Desc`; dataset contains Hz values for each mantra position.

```c
// ==============================================================================
// FR 2.2.8: MANTRA FUNDAMENTAL FREQUENCY LUT
// ==============================================================================
// Each of the 100 Mantra entries (50 Bimba + 50 Pratibimba) carries
// a fundamental frequency in Hz. Range: 144-432 Hz.
// Stored as uint16_t (sufficient for 0-65535 Hz range).
// This field supplements the existing mantra struct without overflow.

typedef struct {
    uint8_t  mantra_idx;           // 0-99 flat index (50 Bimba + 50 Pratibimba)
    uint8_t  matrika_group;        // consonant articulation group (0-7)
    uint8_t  element_id;           // Element_Id correspondence (0-4)
    uint8_t  phase;                // 0=Bimba/Descent, 1=Pratibimba/Ascent
    uint16_t fundamental_frequency; // Hz — range 144-432 Hz
    uint16_t meaning_id;           // external string table index
} Mantra_Entry_Desc;

// Frequency range constants
#define M2_MANTRA_FREQ_MIN  144u   // Hz — lowest mantra fundamental
#define M2_MANTRA_FREQ_MAX  432u   // Hz — highest mantra fundamental (A=432)
#define M2_MANTRA_FREQ_BASE 256u   // Hz — mid-range base frequency

_Static_assert(sizeof(Mantra_Entry_Desc) == 8,
    "Mantra_Entry_Desc must be 8 bytes for cache alignment");
```

---

### FR 2.2.9: Asma Numerical Identity (Abjad + Digital Root + Mirror Index)

**Requirement:** The `Asma_Name_Desc` struct MUST include `abjad_value`, `digital_root`, and `mirror_idx` fields encoding the numerical identity of each of the 99+1 Divine Names. These fields establish the numerical-vibrational correspondence that links the Asma system to M0's archetypal number language.

**Gap addressed:** Missing `abjad_value`, `digital_root`, and `mirror_idx` in `Asma_Name_Desc`; these are present in the dataset.

```c
// ==============================================================================
// FR 2.2.9: ASMA NUMERICAL IDENTITY
// ==============================================================================

typedef struct {
    uint8_t  name_idx;          // 0-99 (99 names + 1 transcendent anchor)
    uint8_t  routing_mask;      // 128-bit routing mask index (from FR 2.2.4)
    uint8_t  element_id;        // Element_Id (0-4)
    uint8_t  digital_root;      // Digital root of abjad_value (0-9)
    uint16_t abjad_value;       // Abjad numerical value of the name (0-65535)
    uint8_t  mirror_idx;        // Index of mirror-pair name (0xFF if none)
    uint8_t  phase;             // 0=36-base, 1=64-extension (36:64 dynamic)
    uint16_t meaning_id;        // External string table index
    uint8_t  _pad[2];           // Alignment pad to 12 bytes
} Asma_Name_Desc;

_Static_assert(sizeof(Asma_Name_Desc) == 12,
    "Asma_Name_Desc must be 12 bytes");

// Accessors
#define ASMA_GET_DR(name_desc)    ((name_desc)->digital_root)
#define ASMA_GET_MIRROR(name_desc) ((name_desc)->mirror_idx)
#define ASMA_HAS_MIRROR(name_desc) ((name_desc)->mirror_idx != 0xFFu)
```

---

### FR 2.2.10: Shem Extended Angelic Hierarchy Positions

**Requirement:** The `Shem_Name_Desc` struct MUST include an `angelic_rank` field encoding the position within the 8-choir angelic hierarchy for each of the 72 Shem Ha-Mephorash names. The 8×9 choir-position matrix from the dataset MUST be accessible via a flat index.

**Gap addressed:** Missing angelic hierarchy positions matrix in `Shem_Name_Desc`; the dataset shows each of the 72 Shem names belongs to one of 8 angelic choirs (Seraphim, Cherubim, Thrones, Dominions, Virtues, Powers, Principalities, Archangels).

```c
// ==============================================================================
// FR 2.2.10: SHEM EXTENDED — ANGELIC HIERARCHY POSITIONS
// ==============================================================================

// 8 angelic choirs (rows 0-7 of the 8×9 Shem matrix)
typedef enum : uint8_t {
    ANGEL_SERAPHIM       = 0,
    ANGEL_CHERUBIM       = 1,
    ANGEL_THRONES        = 2,
    ANGEL_DOMINIONS      = 3,
    ANGEL_VIRTUES        = 4,
    ANGEL_POWERS         = 5,
    ANGEL_PRINCIPALITIES = 6,
    ANGEL_ARCHANGELS     = 7,
} Angelic_Choir;

typedef struct {
    uint8_t       shem_idx;       // 0-71 flat index (= row*9 + col in 8×9 matrix)
    Angelic_Choir choir;          // Which of the 8 angelic choirs
    uint8_t       choir_position; // Position within choir (0-8)
    uint8_t       element_id;     // Element_Id (0-4)
    uint16_t      meaning_id;     // External string table index
    uint8_t       _pad[2];        // Alignment pad to 8 bytes
} Shem_Name_Desc;

_Static_assert(sizeof(Shem_Name_Desc) == 8, "Shem_Name_Desc must be 8 bytes");

// Matrix accessor: flat_idx = choir * 9 + position_in_choir
static inline uint8_t shem_flat_index(Angelic_Choir choir, uint8_t pos_in_choir) {
    return (uint8_t)((choir * 9u) + pos_in_choir);
}

_Static_assert(7u * 9u + 8u == 71u, "8×9 Shem matrix: max flat index must be 71");
```

---

### FR 2.2.11: Planetary Keplerian Velocity

**Requirement:** The `Planet_Operator` struct MUST include a `keplerian_velocity` field (stored as a fixed-point `uint16_t` in arcseconds/day × 10, i.e., 0.1 arcsec/day resolution) encoding each planet's mean daily motion. This field connects the M2 planetary system to M3's 360° Mythic Synthesis Wheel via degree-per-day progression.

**Gap addressed:** Missing `keplerianVelocity` field in `Planet_Operator`; the dataset records mean daily motion for each planet.

```c
// ==============================================================================
// FR 2.2.11: PLANETARY KEPLERIAN VELOCITY
// ==============================================================================
// Stored as arcseconds/day × 10 (fixed-point, 0.1 arcsec/day resolution).
// Sun = 3600" × 10 = 36000 (exactly 1°/day × 3600"/° × 10 scale).
// Moon ≈ 472200 raw arcsec/day — scaled down: use uint32_t for Moon.

// Augmented Planet_Operator with Keplerian velocity
typedef struct {
    Planet_Id id;
    uint8_t   group_type;          // 0=SU(2), 1=SU(3), 2=U(1), 3=catalytic
    uint8_t   prime;               // Associated prime (0 if none)
    uint8_t   element_id;          // Primary element correspondence
    uint8_t   chakra_link;         // Chakra_Id (0xFF if no direct link)
    uint16_t  meaning_id;          // External string table
    uint16_t  keplerian_velocity;  // arcsec/day × 10 (0.1 arcsec resolution)
                                   // 0xFFFF = STATUS_PROVISIONAL (Neptune, Pluto)
} Planet_Operator;

// Mean daily motions (arcseconds/day × 10):
// Sun: 35999 (≈3599.9"/day), Venus: 3600 (variable), Mercury: 14739
// Moon: 47,270 (stored in separate uint32_t — overflows uint16_t)
// Mars: 1886, Jupiter: 299, Saturn: 120
// Neptune/Pluto: analytically preempted (Cousto + Kepler 3rd law from Saturn baseline)

#define PLANET_KEPLERIAN_SUN      35999u
#define PLANET_KEPLERIAN_MERCURY  14739u
#define PLANET_KEPLERIAN_VENUS     3600u
#define PLANET_KEPLERIAN_MOON     0x0000u // Special: stored as uint32_t separately
#define PLANET_KEPLERIAN_MARS      1886u
#define PLANET_KEPLERIAN_JUPITER    299u
#define PLANET_KEPLERIAN_SATURN     120u
#define PLANET_KEPLERIAN_NEPTUNE     21u  // PREEMPTED: 120×(29.46/164.79)≈21; DR(21)=3
#define PLANET_KEPLERIAN_PLUTO       14u  // PREEMPTED: 120×(29.46/248.09)≈14; DR(14)=5

// Cross-check: Neptune freq=211Hz (DR=4), Pluto freq=140Hz (DR=5)
// Neptune keplerian DR=3 + freq DR=4 = position 3→4 (Pattern→Context, the liminal step)
// Pluto keplerian DR=5 = same as freq DR=5 (pure Integration — consistent convergence)

_Static_assert(sizeof(Planet_Operator) == 12,
    "Planet_Operator must be 12 bytes after Keplerian augment");
```

---

### FR 2.2.12: MEF Topological Constants

**Requirement:** The C engine MUST provide compile-time `#define` constants for the MEF's topological properties: genus, Euler characteristic, and the dual-covering factor. These constants formalize the 72-space's topological identity as a genus-6 surface, complementary to M1's genus-1 torus.

**Gap addressed:** MEF topological constants are implied by the `[12][6]` MEF shape but not explicitly defined; they are needed to validate the 72-invariant from topological first principles.

```c
// ==============================================================================
// FR 2.2.12: MEF TOPOLOGICAL CONSTANTS
// ==============================================================================
// The 12×6 MEF matrix encodes a genus-6 surface:
//   - 6 base lenses + 6 inverted = 12 rows (double-covering of epistemic frame)
//   - 6 sub-positions per lens (the QL mod-6 positions)
//   - Genus g = 6: Euler characteristic χ = 2 - 2g = 2 - 12 = -10
//   - This contrasts with M1's genus-1 torus (χ = 0)
//   - The MEF is topologically MORE complex than the Torus — it is the Torus
//     "squared" by the # Inversion Operator (6 → 12 = 6 × MEF_INV_FACTOR)

#define M2_MEF_TOPOLOGICAL_GENUS             6   // genus of the 12×6 MEF surface
#define M2_MEF_EULER_CHARACTERISTIC        (-10) // χ = 2 - 2×6 = -10
#define M2_MEF_DUAL_COVERING_FACTOR          2   // # Inversion Operator doubles lenses
#define M2_MEF_BASE_LENSES                   6   // lenses before inversion
#define M2_MEF_TOTAL_LENSES                 12   // 6 base + 6 inverted
#define M2_MEF_POSITIONS_PER_LENS            6   // sub-positions (QL mod-6)
#define M2_MEF_TOTAL_CONDITIONS             72   // 12 × 6 = 72 (the invariant)

// Compile-time verification: MEF shape must produce exactly 72 conditions
_Static_assert(
    M2_MEF_TOTAL_LENSES * M2_MEF_POSITIONS_PER_LENS == M2_MEF_TOTAL_CONDITIONS,
    "MEF topological invariant: 12 × 6 must equal 72");

// Cross-check with M1: MEF genus = M1 QL_PROCESSUAL = 6
_Static_assert(
    M2_MEF_TOPOLOGICAL_GENUS == QL_PROCESSUAL,
    "MEF topological genus must equal M1 QL_PROCESSUAL (both = 6)");

// Tattva Phase enum — encodes the descent/ascent directionality in [36][2] matrix
typedef enum : uint8_t {
    TATTVA_PHASE_DESCENT = 0,  // Manifestation downward (Shiva → matter)
    TATTVA_PHASE_ASCENT  = 1,  // Reabsorption upward (matter → Shiva)
} Tattva_Phase;

// Verify Tattva phases map correctly to [36][2] column indices
_Static_assert((int)TATTVA_PHASE_DESCENT == 0 && (int)TATTVA_PHASE_ASCENT == 1,
    "Tattva_Phase values must match [36][2] array column indices");
```

---

*Patch Version:* 1.0
*Applied:* 2026-03-05 by Cross-M Harmonisation Agent
*Addresses:* Neptune/Pluto STATUS_PROVISIONAL, FR 2.2.8, FR 2.2.9, FR 2.2.10, FR 2.2.11, FR 2.2.12
