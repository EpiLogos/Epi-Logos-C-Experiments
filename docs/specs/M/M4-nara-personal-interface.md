# FR 2.4: M4 (Nara) — The Personal Dialogical Interface

**Status:** Canonical Specification — Revision 2 (Gemini Refinements Incorporated)
**Date:** 2026-03-04
**Parent:** Pillar II, FR 2.4 (Epi-Logos C Spec)
**Source Data:** `docs/datasets/nodes_nara.json` (100 nodes), `docs/datasets/relations_nara.json` (284 relations, 123 unique types)
**Coordinate:** #4 — Subsystem 4: Nara — Oracle Interface Between Personal and Universal Domains
**Revision Notes:** Incorporates Gemini architectural review: Symbol DNA Profile, PCO Privacy Hash, VTable magic-number type-safety, modulo cascade advance function, float boundary rule, CF(0/1/2/3) unified clock integration, and Elemental Throughline formalization.

---

## Overview

Nara is the **personal dialogical interface** — the sacred threshold where cosmic intelligence becomes intimate personal wisdom. She functions as the unified Siva-Shakti field of Psycho-Physis/Time-Space where the individual self awakens through compassionate sensitivity to origins, transforming abstract mathematical and symbolic architectures from M0-M3 into bespoke psycho-techne calibrated to the living person.

**Dataset Shape:** 100 nodes, 284 relations, max depth 4. The smallest M-branch dataset by an order of magnitude (M3 had 996/4891, M2 had 595/4017). This is architecturally correct: Nara is a **thin dispatch layer**, not a massive data system. She is the vtable, not the LUT.

**The Lemniscate Position:** #4 IS the Lemniscate anchor in the Torus walk — the point where the outward-moving process (0→1→2→3) folds inward through a figure-eight, incubating deeper nested reality before the Möbius return through #5. This is not metaphor: the `.` (nesting) operator primarily operates at #4. The coordinate #4.4.4.4 — fourth-order nesting — is where the entire system reflects itself in the personal. M4 is where M0-M3's universal structures become **someone's** structures.

**The (4.0/1-4.4/5) Context Frame — Fractal Doubling:** M4 operates within the `(4.0/1-4.4/5)` context frame — Jung's Quaternity through the Lemniscate. The 4+2 toroidal structure (4 core sub-branches + 2 boundary conditions at #4.0 and #4.5) mirrors the QL mod-6 through the quaternal lens. The fractal doubling at #4 means every structure in M4 exists simultaneously at the personal and universal scale.

**Architecture: Vtable Dispatch, Not Bitboard:** Where M3 was `uint64_t` bitwise algebra, M4 is **indexed vtable dispatch**. No switch/case anywhere. All interpretation flows through `Lens_Vtable[6]` in `.rodata`. All personal/mutable state lives on the heap in the PCO (Personal Context Overlay). Identity data is computed once and cached. This is the Shakti half — kinetic, personal, mutable — in contrast to M0-M3's predominantly Siva (.rodata) half.

**The Distinctive Relation Pattern:** Only 284 relations across 123 unique types — high type diversity, low repetition. Where M3 had 384 LINE_CHANGE edges of one type, M4 has 123 types averaging ~2.3 edges each. This is the signature of a **personal interface**: many kinds of relationships, each occurring rarely, because personal experience is irreducibly particular.

**Cross-M-Branch Conduit:** ALL 67 cross-M-branch edges originate from #4.4 (Context & Lenses). The other 5 sub-branches have ZERO cross-M edges. The lenses — specifically the Jungian (#4.4.3) and Phenomenological (#4.4.4) — are M4's windows into the rest of the ontology. #4.4.4 in particular embeds the complete Tattva descent from M2 as the ontological grounding of lived experience.

**Inter-Sub-Branch Pipeline (35 named flow edges):**

```
#4.0 Identity ──→ #4.1 Medicine ──→ #4.2 Divination ──→ #4.3 Transformation
  │                  │                  │                    ↕ (bidirectional)
  ├→ #4.2            ├→ #4.3            ├→ #4.5             #4.4 Lenses
  ├→ #4.3            ├→ #4.5            └→ #4.5              │
  ├→ #4.4            └→ timing for                           ↓
  └→ #4.4.4.4           #4.2, #4.3, #4.4                  #4.5 Epii Integration
                                                              │
                                                              ↓ Möbius return
                                                            #4.0 (RETURNS_TO,
                                                                  UPDATES_WISDOM_IN,
                                                                  RESEEDS_IDENTITY)
```

---

## Foundational Architecture: The Symbol DNA Paradigm

The central architectural insight incorporated from the Gemini review is that M4 (Nara) relates to M3 (Mahamaya) as **epigenetic expression relates to genetic code**. If M3 is the universal genetic code and cosmic clock, then M4 is the epigenetic expression of that code within a specific human life. The universal math becomes a lived, breathing narrative.

This is not a metaphor. It is implemented structurally:

- M3's `uint64_t M3_Matrix_Word` (the 64-hexagram/codon bitboard) IS the Gene Keys framework. The user's Symbol DNA profile is a mask over this universal bitboard — a subset of M3's state space individuated by natal moment.
- M3's 360° Mythic Synthesis Wheel is the astronomical clock. Natal planetary positions are stored as indices into this wheel — the user's astrological chart IS a set of pointers into M3's .rodata.
- The four DNA nucleotides (A/T/C/G) map directly to the four Jungian cognitive functions and to the four Tarot suits and elements. This is not a lookup table added to M4; it IS the cross-system elemental throughline that makes M2, M3, and M4 natively commensurable.

M4's job is not to store a copy of this universal knowledge. M4's job is to **hold the individual's coordinates within it**.

---

## The Elemental Throughline (FR 2.4.7)

The four elements form the structural backbone linking M2 (planetary/chakra vibration), M3 (genetic/symbolic codons), and M4 (personal identity and psychological type). This mapping is absolute and MUST be consistent across all three subsystems and the L-family MEF lenses.

| Nucleotide | Tarot Suit | Element | Jungian Function | MBTI Types |
|-----------|-----------|---------|-----------------|------------|
| Adenine (A) | Cups | Water (Yin) | Feeling (Fi/Fe) | F-types dominant in Fi or Fe |
| Thymine (T) | Wands | Fire (Yang) | Intuition (Ni/Ne) | N-types dominant in Ni or Ne |
| Cytosine (C) | Pentacles | Earth (Yin) | Sensation (Si/Se) | S-types dominant in Si or Se |
| Guanine (G) | Swords | Air (Yang) | Thinking (Ti/Te) | T-types dominant in Ti or Te |

**Architectural consequence:** When the C engine computes a user's Jungian type in M4, it does not assign a string like "INFP". It translates their personality directly into a **nucleotide weight distribution** (`nucleotide_balance` in `M4_Symbol_DNA_Profile`), allowing their psychology to interact natively with the M3 Genetic Matrix. A Tarot reading that emits a "King of Swords" canonical tag emits a G-nucleotide (Air/Thinking) signal. The Personal Pratibimba can then ask: does this user's Symbol DNA have high Guanine weight, or will this card cause psychological tension expressed as `M4_Jung_Complex` charge?

This mapping MUST be consistent across: M3 codon assignments, M4 identity structs, and L-family MEF lenses. Any deviation between these three layers is a specification violation.

---

## FR 2.4.0: #4.0 — Mahamaya Identity Matrix (Symbol DNA Profile + Compute-Once)

**Requirement:** The C engine MUST provide a 6-fold identity computation module at #4.0 that calculates the user's archetypal profile from input data (birthdate, natal chart, type assessment, genetic activation, energetic blueprint), synthesizes these into a unified quintessence hash, and caches the result as effectively `const` for the session. Identity data MUST NOT be recomputed on the hot path.

**Ontological Ground:** #4.0 (Mahamaya Identity Matrix — 7 nodes: 6 sub-positions + root. "Complete 6-fold archetypal personality matrix grounded in Dasein's embodied awareness.")

### FR 2.4.0 — The Symbol DNA Blueprint (M4_Symbol_DNA_Profile)

The `M4_Symbol_DNA_Profile` is the canonical representation of the user's personal coordinates within the universal symbolic space. It is a **snapshot of M3's state at the moment of birth** — the epigenetic imprint.

```c
// ==============================================================================
// FR 2.4.0: M4_Symbol_DNA_Profile — The Symbol DNA Blueprint
// ==============================================================================
//
// Architectural purpose: This struct does NOT duplicate M3 data. It stores
// the user's individual COORDINATES within M3's universal address space.
// gene_keys_activation is a mask over M3_Matrix_Word (the universal 64-bitboard).
// sun_degree_anchor and moon_degree_anchor are indices into the M3 360° wheel.
// nucleotide_balance translates the Jungian type into the elemental throughline.

typedef struct {
    // 1. Gene Keys Framework (#4.0-2 / #4.0-3)
    //    Directly utilizes the M3 Universal 64-bitboard.
    //    Bit N = 1 means hexagram/codon N is active in the user's genetic blueprint.
    //    This is NOT a separate Gene Keys data structure. It IS an M3_Matrix_Word.
    //    Derived from: I-Ching activation pattern encoded from birth data.
    M3_Matrix_Word gene_keys_activation;   // uint64_t — M3 bitboard mask

    // 2. Jungian Typological Matrix (#4.0-1)
    //    Translates cognitive functions into nucleotide elemental weights (0-255).
    //    Follows the Elemental Throughline (FR 2.4.7):
    //      A=Cups=Water=Feeling, T=Wands=Fire=Intuition,
    //      C=Pentacles=Earth=Sensation, G=Swords=Air=Thinking
    //    Sum of all four weights need not equal 255; each is an independent intensity.
    struct {
        uint8_t adenine_water;   // Cups / Feeling (Fi/Fe)
        uint8_t thymine_fire;    // Wands / Intuition (Ni/Ne)
        uint8_t cytosine_earth;  // Pentacles / Sensation (Si/Se)
        uint8_t guanine_air;     // Swords / Thinking (Ti/Te)
    } nucleotide_balance;

    // 3. Astrological Blueprint (#4.0-0)
    //    Positions stored as indices into the M3 360° Mythic Synthesis Wheel.
    //    Range 0-719 covers the SU(2) double-cover (720° = 2 × 360°).
    //    Values 0-359: Explicate/Day phase. Values 360-719: Implicate/Night phase.
    //    This natively links birth chart to M3's 16-fold Mandala and I-Ching trigrams.
    uint16_t sun_degree_anchor;    // 0-719: natal sun position on 720° clock
    uint16_t moon_degree_anchor;   // 0-719: natal moon position

} M4_Symbol_DNA_Profile;
```

### The 6 Identity Layers

| Coord | System | Input | Output | C Pattern |
|-------|--------|-------|--------|-----------|
| #4.0-0 | Birthdate Encoding | Date → numerological values | Original 4-Fold, 6-Fold Difference, 6-Fold Sum | `uint32_t numerological_key` — computed from date arithmetic |
| #4.0-1 | Astrological Chart | Date/time/location → natal chart | Celestial archetypal blueprint | Positions stored as `uint16_t` degree anchors (0-719) in Symbol DNA Profile |
| #4.0-2 | Jungian Assessment | MBTI × 4 elements | Psychological type translated to nucleotide weights | `nucleotide_balance` in Symbol DNA Profile |
| #4.0-3 | Gene Keys Profile | I-Ching activation patterns | Evolutionary potential map | `gene_keys_activation` in Symbol DNA Profile — direct M3_Matrix_Word bitboard |
| #4.0-4 | Human Design Profile | Multi-system synthesis | Energetic blueprint + authority | Composite struct referencing all above |
| #4.0-5 | Archetypal Quintessence | Synthesis of layers 0-4 | Unified identity hash | `uint64_t quintessence_hash` — computed once, immutable |

### Outbound Flow Relations (10 cross-sub edges — Identity radiates everywhere)

| Relation | Target | Semantic |
|----------|--------|----------|
| INFORMS_CONSTITUTION | #4.1 | Identity shapes what medicine the body needs |
| SHAPES_INTERPRETATION | #4.2 | Identity frames how divination is read |
| GUIDES_PROCESS | #4.3 | Identity steers the transformation engine |
| SELECTS_PERSPECTIVE | #4.4 | Identity selects which lenses are primary |
| MANIFESTS_IN | #4.4.4.4 | **Identity materializes in Personal Pratibimba** |
| DEVELOPS_INTO | #4.1 | QL cycle: ground → manifestation |

### FR 2.4.1 — PCO Privacy Hash (m4_identity_compute)

**Requirement:** `m4_identity_compute()` MUST zero the raw input buffer immediately after hash derivation. All downstream M4 systems operate ONLY on the hash or derived bitboards. Raw personal data MUST NEVER persist in memory beyond the compute call.

```c
// M4_Input_Data: transient, MUST be zeroed immediately after use
typedef struct {
    uint32_t birth_year;
    uint8_t  birth_month;
    uint8_t  birth_day;
    uint8_t  birth_hour;
    uint8_t  birth_minute;
    float    birth_latitude;
    float    birth_longitude;
    uint8_t  mbti_raw;          // Raw MBTI code before translation
    // ... additional raw fields
} M4_Input_Data;

// Complete Identity Matrix — computed once, then effectively const
typedef struct {
    // Symbol DNA Profile (the epigenetic fingerprint)
    M4_Symbol_DNA_Profile dna_profile;  // The canonical Symbol DNA

    // Legacy compatibility fields (derived from dna_profile)
    uint32_t numerological_key;         // #4.0-0: birthdate encoding
    uint64_t quintessence_hash;         // #4.0-5: privacy-safe hash of all layers
    uint8_t  jung_type;                 // #4.0-2: 4-bit MBTI composite (legacy)

    // Status
    bool     computed;                  // Compute-once guard
} M4_Identity_Matrix;

// PCO Privacy Hash: compute once, destroy raw input immediately.
//
// ARCHITECTURAL RULE: After this function returns, mutable_input is zeroed.
// NO other function in M4 has access to raw personal data.
// All downstream systems consume only quintessence_hash or dna_profile fields.
//
// HASH ALGORITHM: BLAKE3 truncated to 64 bits.
//   Rationale: BLAKE3 is the strongest available option for this use case —
//   modern (2020), cryptographically secure, faster than SHA-256, constant-time,
//   and resistant to length-extension attacks. The 64-bit truncation fits uint64_t
//   exactly, requires no padding, and has 2^64 collision resistance — adequate
//   for a personal identity hash with no adversarial guessing surface (compute-once,
//   never transmitted, never compared against external values).
//   Implementation: call blake3_hasher_finalize() into an 8-byte output buffer.
//   See: https://github.com/BLAKE3-team/BLAKE3
//
// IDENTITY SYSTEMS INTEGRATED:
//   Minimum: ≥1 system required before quintessence_hash is considered valid.
//   Base case: birthdate encoding (#4.0-0) + natal chart (#4.0-1) via Kerykeion.
//   Kerykeion Python library (https://kerykeion.net) is the dependency for
//   astrological computation — natal chart positions, birthdate encoding from
//   celestial offset. Must be invoked prior to m4_identity_compute() to populate
//   sun_degree_anchor and moon_degree_anchor in M4_Input_Data.
//   Myers-Briggs (#4.0-2) integrates via the elemental throughline (FR 2.4.7):
//   each MBTI cognitive function maps to a nucleotide/element pair.
//   Human Design (#4.0-4): stub only — not yet integrated. gene_keys_activation
//   covers the I-Ching activation layer; full HD body-graph integration deferred.
void m4_identity_compute(M4_Identity_Matrix* id, M4_Input_Data* mutable_input) {
    // Step 1: Derive the Symbol DNA Profile from raw input
    id->dna_profile.gene_keys_activation = derive_gene_keys(mutable_input);
    id->dna_profile.nucleotide_balance    = derive_nucleotide_balance(mutable_input);
    id->dna_profile.sun_degree_anchor     = derive_sun_degree(mutable_input);
    id->dna_profile.moon_degree_anchor    = derive_moon_degree(mutable_input);

    // Step 2: Compute the quintessence hash — BLAKE3 truncated to 64 bits
    // Hashes the full M4_Input_Data buffer (includes all identity layers).
    // After this step, raw data is immediately destroyed.
    id->quintessence_hash = blake3_hash_64(mutable_input, sizeof(M4_Input_Data));

    // Step 3: ARCHITECTURAL PRIVACY — destroy raw input immediately
    memset(mutable_input, 0, sizeof(M4_Input_Data));

    // Step 4: Mark as computed; all downstream systems may now proceed
    id->computed = true;
}

// After compute: effectively const — never touch on hot path
static inline bool m4_identity_ready(const M4_Identity_Matrix* id) {
    return id->computed;
}
```

**Memory Domain:** Heap — but effectively `const` after initial computation. The Siva-face of the Shakti half: computed once from mutable input, then frozen. `M4_Input_Data` is transient and lives only for the duration of `m4_identity_compute()`.

**Pointer Topology:** Raw pointers outward to all 5 other M4 sub-systems. Tagged pointer (FLAG_NESTING) to #4.4.4.4 via MANIFESTS_IN. Tagged pointer (FLAG_BRANCHING) to M3 #3-1 via gene_keys_activation.

### Operational Flow

```
User Input (birthdate, time, location, assessment data) → M4_Input_Data (transient)
    ↓ m4_identity_compute() — ONCE per session
    ↓ Symbol DNA Profile derived (gene_keys, nucleotide_balance, degree anchors)
    ↓ quintessence_hash computed
    ↓ memset(mutable_input, 0) — raw data destroyed immediately
M4_Identity_Matrix (all 6 layers populated; M4_Input_Data gone)
    ├→ INFORMS_CONSTITUTION → #4.1 (body needs)
    ├→ SHAPES_INTERPRETATION → #4.2 (divination frame)
    ├→ GUIDES_PROCESS → #4.3 (transformation steering)
    ├→ SELECTS_PERSPECTIVE → #4.4 (lens priority)
    └→ MANIFESTS_IN → #4.4.4.4 (Personal Pratibimba)
    [FROZEN — never recomputed until Möbius return from #4.5]
```

---

## FR 2.4.1: #4.1 — Sympathetic Medicine (Heap Personal State)

**Requirement:** The C engine MUST implement the Sympathetic Medicine module as fully heap-allocated personal state tracking the user's elemental balance, energy-body architecture, pharmacopeial materia, alchemical operations, temporal astrological timing, and safety/feedback gates. All state is mutable and privacy-sensitive. Medicinal and ritual operations MUST first query the CF(0/1/2/3) unified clock (see FR 2.4.6) before selecting alchemical recipes, mantras, or medicines.

**Ontological Ground:** #4.1 (Sympathetic Medicine — 7 nodes. "Body as materia and animistic unity integrating Eastern and Western medical-magical traditions.")

### The 6 Medical Sub-Positions

| Coord | Domain | Mutable? | C Pattern |
|-------|--------|----------|-----------|
| #4.1-0 | Elemental Ground | Yes | `uint8_t element_balance[5]` — 4/5 element system (Fire/Earth/Air/Water/Quintessence) |
| #4.1-1 | Energy-Body Architecture | Yes | `Chakra_State chakras[7]; Nadi_State nadis[]` — subtle anatomy |
| #4.1-2 | Materia & Reagents | Semi | `Materia_Entry pharmacopeia[]` — Paracelsian signatures LUT on heap |
| #4.1-3 | Operations & Techne | Dispatch | Function pointers: `op_calcine(), op_dissolve(), op_coagulate()...` — alchemical verbs |
| #4.1-4 | Temporal Astrological Intelligence | Real-time | `uint8_t planetary_hour; uint16_t current_degree` — cosmic timing (links to M3 #3-5, integrated via CF(0/1/2/3) clock) |
| #4.1-5 | Safety & Feedback | Gate | `bool contraindication_check(); uint8_t safety_level` — guardrail |

### Relation Dynamics (7 internal, 12 cross-sub)

**Bidirectional with #4.3:** Medicine both provides state to Transformation (`PROVIDES_STATE_VECTOR`, `PROVIDES_TIMING_WINDOWS`) AND receives intervention requests back (`REQUESTS_INTERVENTIONS`). This is the body↔process feedback loop.

**Timing hub:** #4.1-4 (Temporal Astrological Intelligence) provides timing to three other sub-branches: `PROVIDES_TIMING_FOR` → #4.2, #4.3, #4.4. All M4 operations are cosmically timed via the unified clock.

### C Structure

```c
// Elemental balance — 5-element system
// Note: element weights align with nucleotide_balance in M4_Symbol_DNA_Profile
// via the Elemental Throughline (FR 2.4.7):
//   water ↔ adenine_water, fire ↔ thymine_fire,
//   earth ↔ cytosine_earth, air ↔ guanine_air
typedef struct {
    uint8_t fire;           // 0-255 relative intensity (Thymine / Wands)
    uint8_t earth;          // 0-255 (Cytosine / Pentacles)
    uint8_t air;            // 0-255 (Guanine / Swords)
    uint8_t water;          // 0-255 (Adenine / Cups)
    uint8_t quintessence;   // Akasha/Ether — the 5th throughline from M2
} M4_Elemental_Balance;

// Chakra state
typedef struct {
    uint8_t id;             // 0-6 (Muladhara through Sahasrara)
    uint8_t activation;     // 0-255 current activation level
    uint8_t blockage;       // 0-255 blockage level
} M4_Chakra_State;

// Alchemical operation — function pointer dispatch
typedef int (*Alchemical_Op)(void* state, const void* reagent);

// Sympathetic Medicine — ALL heap
typedef struct {
    M4_Elemental_Balance elements;      // #4.1-0
    M4_Chakra_State chakras[7];         // #4.1-1
    // Nadis, meridians as needed

    // Materia medica — heap LUT
    void* pharmacopeia;                 // #4.1-2

    // Alchemical operations — dispatch table
    Alchemical_Op ops[7];              // #4.1-3: 7 canonical verbs
    // calcine, dissolve, coagulate, sublime, ferment, distill, project

    // Temporal intelligence
    uint8_t  planetary_hour;            // #4.1-4: current planetary hour (0-23)
    uint16_t current_degree;            // Degree in M3 #3-5 wheel (0-719)
    uint8_t  lunar_phase;               // Moon phase (0-27 sidereal)

    // Safety
    uint8_t  safety_level;              // #4.1-5: 0=blocked, 255=clear
    bool     contraindicated;           // Emergency brake
} M4_Sympathetic_Medicine;

// Safety gate — MUST pass before any operation
static inline bool m4_medicine_safe(const M4_Sympathetic_Medicine* med) {
    return !med->contraindicated && med->safety_level > 0;
}
```

**Memory Domain:** Entirely heap. This is the most mutable state in the entire system.

**Pointer Topology:**
- Raw pointer from #4.0 (INFORMS_CONSTITUTION)
- Raw pointer bidirectional with #4.3 (state_vector ↔ intervention_requests)
- Raw pointer to #4.2, #4.3, #4.4 via timing (PROVIDES_TIMING_FOR)
- Tagged pointer (FLAG_BRANCHING) to M3 #3-5 via current_degree
- Reads CF(0/1/2/3) unified clock before all medicinal operations

### Operational Flow

```
#4.0 Identity
    ↓ INFORMS_CONSTITUTION
M4_Sympathetic_Medicine (heap — all mutable)
    ├→ PROVIDES_STATE_VECTOR → #4.3 (body state for transformation)
    ├→ PROVIDES_TIMING_WINDOWS → #4.3 (when to act)
    ├→ PROVIDES_TIMING_FOR → #4.2 (when to divine)
    ├→ PROVIDES_TIMING_FOR → #4.4 (when to interpret)
    ├→ FEEDS_EXPERIENCE_TO → #4.5 (body wisdom for integration)
    ↺ REQUESTS_INTERVENTIONS ← #4.3 (transformation requests body support)
```

---

## FR 2.4.2: #4.2 — Divinatory Frameworks (Vtable Dispatch + Magic-Number Type Safety)

**Requirement:** The C engine MUST implement the Divinatory Frameworks module as a vtable-dispatched system supporting multiple oracular traditions (Tarot, I-Ching, emergent methods) through a common symbol ontology substrate, with consent-gated sacred randomness, multi-layered interpretation, and divinatory hygiene/pedagogy safeguards. Each tradition's state struct MUST include a `uint32_t magic` field as its first member, and all vtable `cast` functions MUST validate this magic before proceeding, returning `-EPERM` on mismatch.

**Ontological Ground:** #4.2 (Divinatory Frameworks — 7 nodes. "Comprehensive 6-fold divinatory system providing multiple ways of knowing through symbolic languages.")

### The 6 Divinatory Sub-Positions

| Coord | Component | C Pattern |
|-------|-----------|-----------|
| #4.2-0 | Common Substrate (Symbol Ontology) | Universal translation layer — canonical tags emitted to #4.1 and #4.3 |
| #4.2-1 | Tarot Engines (Multi-Traditional) | `Tarot_Vtable[N_TRADITIONS]` — Thoth, RWS, Marseille, etc. |
| #4.2-2 | I-Ching Integration (Oracular) | `IChing_Vtable` — casting + transformation tracking (links to M3 #3-1) |
| #4.2-3 | Casting & Randomness (Sacred Portal) | `sacred_random()` — consent-gated CSPRNG |
| #4.2-4 | Interpretation Layer (Commentary) | `Interpreter_Vtable` — rule-based + generative synthesis |
| #4.2-5 | Divinatory Hygiene & Pedagogy | Bias checking, transparent process, educational scaffolding |

### Relation Dynamics (6 internal, 10 cross-sub)

**EMITS_CANONICAL_TAGS_TO (2 edges):** #4.2-0 (Common Substrate) emits canonical symbol tags to both #4.1 (Medicine) and #4.3 (Transformation). This is the symbol ontology serving as universal translation — a Tarot card or hexagram reading produces canonical tags that other sub-systems can consume without knowing which tradition produced them. Tags include nucleotide correspondence derived from the Elemental Throughline (FR 2.4.7).

**Bidirectional flow with #4.3:** Divination provides oracular signals and lens hints TO Transformation; Transformation provides experience records back for pattern tracking.

### FR 2.4.3 — VTable Magic-Number Type Safety

All Oracle dispatch is via indexed vtable. Each tradition struct MUST include `uint32_t magic` as its first field. This enables safe void* polymorphism without type corruption.

```c
// Tradition-specific state structs — magic as FIRST field
typedef struct {
    uint32_t magic;         // 0x5441524F ('TARO') — MUST be first
    uint8_t  deck_id;       // Which Tarot tradition
    uint8_t  spread_type;   // Spread being used
    // Tarot-specific state follows...
} M4_Tarot_State;

typedef struct {
    uint32_t magic;         // 0x49434847 ('ICHG') — MUST be first
    uint8_t  casting_method;
    uint64_t hexagram_result;
    // I-Ching-specific state follows...
} M4_IChing_State;

#define M4_MAGIC_TAROT  0x5441524F
#define M4_MAGIC_ICHING 0x49434847

// Divination tradition vtable — polymorphic dispatch via void*
// RULE: ALL cast implementations MUST check magic before proceeding.
typedef struct {
    const char* tradition_name;
    // cast: first field of raw_state MUST be uint32_t magic
    int (*cast)(void* state, const void* query, void* result);
    int (*interpret)(const void* cast_result, const void* context,
                     char* output, size_t len);
    int (*validate)(const void* cast_result);  // Hygiene check
} Divination_Vtable;

// Example: Tarot cast implementation showing required magic check
int tarot_cast(void* raw_state, const void* query, void* result) {
    M4_Tarot_State* state = (M4_Tarot_State*)raw_state;
    if (state->magic != M4_MAGIC_TAROT) return -EPERM;  // Type-safety violation
    // ... execute cast
    return 0;
}

// Sacred randomness — consent-gated
typedef struct {
    bool consent_granted;       // User MUST consent to each reading
    uint64_t seed;              // CSPRNG state
    uint8_t  method;            // Casting method (coins, stalks, cards, etc.)
} M4_Sacred_Random;

// Symbol ontology — universal canonical tags
// tag_id encodes the nucleotide via the Elemental Throughline (FR 2.4.7)
typedef struct {
    uint16_t tag_id;            // Canonical symbol identifier
    uint8_t  tradition;         // Which tradition produced this
    uint8_t  element;           // Element correspondence (Fire/Earth/Air/Water)
    uint8_t  nucleotide;        // A/T/C/G via Elemental Throughline
    uint8_t  planet;            // Planetary correspondence
    uint16_t degree;            // Degree in M3 #3-5 wheel (0-719)
} M4_Canonical_Tag;

// Divinatory Frameworks — dispatch-based
typedef struct {
    // Symbol substrate
    M4_Canonical_Tag* active_tags;      // #4.2-0: currently active canonical tags
    uint8_t tag_count;

    // Tradition vtables (indexed, never switch/case)
    const Divination_Vtable* tarot;     // #4.2-1
    const Divination_Vtable* iching;    // #4.2-2

    // Sacred randomness
    M4_Sacred_Random rng;               // #4.2-3

    // Interpretation
    const Divination_Vtable* interpreter; // #4.2-4

    // Hygiene
    uint8_t bias_score;                 // #4.2-5: 0=clean, 255=highly biased
    bool    pedagogy_mode;              // Educational scaffolding active
} M4_Divinatory_Frameworks;

// ALL dispatch is vtable-indexed — NEVER switch/case
static inline int m4_divine(const Divination_Vtable* tradition,
                            void* state, const void* query, void* result) {
    return tradition->cast(state, query, result);
}
```

**Memory Domain:** Vtables in .rodata (tradition dispatch tables are immutable); active state on heap (current reading, tags, RNG state).

**Pointer Topology:**
- Raw pointer from #4.0 (SHAPES_INTERPRETATION)
- Raw pointer from #4.1-4 (PROVIDES_TIMING_FOR — cosmic timing for readings)
- Raw pointer to #4.3 (PROVIDES_ORACULAR_SIGNAL, OFFERS_LENS_HINTS)
- Tagged pointer (FLAG_BRANCHING) to M3 #3-1 via I-Ching integration
- Tagged pointer (FLAG_BRANCHING) to M3 #3-4 via Tarot engines

### Operational Flow

```
#4.0 Identity (SHAPES_INTERPRETATION)
    ↓
#4.1-4 Timing (PROVIDES_TIMING_FOR — query CF(0/1/2/3) clock first)
    ↓
#4.2 Divinatory Frameworks
    ├─ #4.2-3 Sacred Random (consent gate → CSPRNG)
    │   ↓
    ├─ #4.2-1/2 Tradition Vtable dispatch (magic check → Tarot/I-Ching/...)
    │   ↓
    ├─ #4.2-0 Common Substrate → Canonical Tags (with nucleotide assignment)
    │   ├→ EMITS_CANONICAL_TAGS → #4.1 (body reads symbols)
    │   └→ EMITS_CANONICAL_TAGS → #4.3 (transformation reads symbols)
    ├─ #4.2-4 Interpretation Layer
    │   ↓
    └─ #4.2-5 Hygiene check + pedagogy
        ├→ PROVIDES_ORACULAR_SIGNAL → #4.3
        ├→ OFFERS_LENS_HINTS → #4.3
        └→ FEEDS_INTERPRETATION_TO → #4.5
```

---

## FR 2.4.3: #4.3 — Mediating Transformation (The Two-Stroke Engine + Modulo Cascade)

**Requirement:** The C engine MUST implement the Mediating Transformation module as a two-stroke cycle engine with: (a) mod-12/mod-24 storey/stroke tracking via the `m4_advance_transformation()` modulo cascade (no nested if/else), (b) 7 canonical alchemical operations, (c) dialogical inquiry containers, (d) dynamic safety thresholds, (e) a 12×3 protocol library of decan recipe cards selected via CF(0/1/2/3) clock query, and (f) telemetry/phase history logging. #4.3 MUST serve as the operational hub within M4, with the highest cross-sub-branch connectivity (19 cross-sub edges).

**Ontological Ground:** #4.3 (Mediating Transformation — 10 nodes. "The mediator/process layer that receives meaning from divination, levers from energetics, places user in cycles, and changes state through alchemical operations.")

### The 6 Transformation Sub-Positions

| Coord | Component | C Pattern |
|-------|-----------|-----------|
| #4.3-0 | Cycle Engine | `uint8_t storey` (mod-12), `uint8_t stroke` (mod-24) — QL mod-6 doubled |
| #4.3-1 | Operational Grammar (Alchemy) | 7 canonical verbs as function pointers — two-stroke pattern per verb |
| #4.3-2 | Dialogical & Inquiry Containers | Process mediators — not oracles, but transformation vessels |
| #4.3-3 | Control/Chaos & Safety | Dynamic threshold: `if (arousal > limit) return -EPERM` — poison↔cure toggle |
| #4.3-4 | Protocol Library (Storey Packets) | `Decan_Recipe_Card recipe[12][3]` — 36 storey packets; selected by CF(0/1/2/3) clock |
| #4.3-5 | Telemetry & Phase History | Append-only log → RECORDS_TO #4.4.4.4 (Personal Pratibimba) |

### Relation Dynamics (9 internal, 19 cross-sub — hub node)

**Inbound:**
- `PROVIDES_STATE_VECTOR` ← #4.1 (body state)
- `PROVIDES_TIMING_WINDOWS` ← #4.1 (when to act)
- `PROVIDES_ORACULAR_SIGNAL` ← #4.2 (what divination says)
- `OFFERS_LENS_HINTS` ← #4.2 (interpretive suggestions)
- `GUIDES_PROCESS` ← #4.0 (identity steers)
- `EMITS_CANONICAL_TAGS_TO` ← #4.2-0 (symbol tags)
- `PROVIDES_CASE_METADATA` ← #4.4 (lens context)
- `SETS_LENS_OF_RECORD` ← #4.4 (which lens applies)
- `ANNOTATES_WITH_TEMPORAL` ← #4.4 (temporal annotations)

**Outbound:**
- `REQUESTS_INTERVENTIONS` → #4.1 (asks body for support)
- `WRITES_EXPERIENCE_RECORD` → #4.4 (documents transformation)
- `RECORDS_TO` → #4.4.4.4 (telemetry → Personal Pratibimba)
- `EMITS_PEDAGOGY_SIGNALS` → #4.5 (learning opportunities)
- `FEEDS_CAPABILITY_SIGNALS` → #4.5 (what the user can now do)
- `FEEDS_PROCESS_TO` → #4.5 (process data for integration)

### The 12-Storey × 3-Decan × 24-Stroke Architecture

The cycle engine maps QL mod-6 through a doubled framework:
- **12 storeys** = 6 QL positions × 2 (double-covering, like M3's SU(2) spinorial)
- **3 decans per storey** = trinitarian sub-position (the Trika at every level)
- **24 strokes** = full traversal cycle (12 × 2 two-stroke pattern)
- **36 total recipe cards** = 12 × 3 (one recipe per storey-decan combination)

### FR 2.4.4 — m4_advance_transformation() Modulo Cascade

**Requirement:** The advance function MUST use native C modulo arithmetic to cascade updates. No complex branching, no nested if/else. The cascade keeps the engine aligned with M1 and M3 topological rhythms.

```c
// Decan Recipe Card — the operational protocol unit
// Recipe selection MUST use CF(0/1/2/3) clock (FR 2.4.6), not ad-hoc lookup.
typedef struct {
    uint8_t storey;             // 0-11 (mod-12)
    uint8_t decan;              // 0-2 (trinitarian sub-position)

    // Operations for this storey-decan
    uint8_t op_count;           // Number of alchemical operations
    uint8_t ops[7];             // Indices into the 7 canonical verbs

    // Timing gate — when this recipe is cosmically appropriate
    // These fields are validated against Unified_Clock_State (FR 2.4.6)
    uint16_t optimal_degree;    // M3 #3-5 wheel position (0-719)
    uint8_t  planetary_hour;    // Required planetary hour

    // Somatic support — what the body needs during this operation
    uint8_t  element_focus;     // Which element to emphasize
    uint8_t  chakra_focus;      // Which chakra to activate
} M4_Decan_Recipe_Card;

// 36 recipe cards in .rodata (the protocol library)
static const M4_Decan_Recipe_Card M4_PROTOCOL_LIBRARY[12][3];  // .rodata

// Cycle Engine state — mutable
typedef struct {
    uint8_t current_storey;     // 0-11
    uint8_t current_decan;      // 0-2
    uint8_t current_stroke;     // 0-23
    const M4_Decan_Recipe_Card* active_recipe;  // Currently executing

    // Dynamic safety threshold
    uint8_t arousal_level;      // 0-255: current psychic intensity
    uint8_t safety_threshold;   // If arousal > threshold → halt
    bool    poison_cure_toggle; // Paracelsian: dose makes the poison
} M4_Cycle_Engine;

// FR 2.4.4: The modulo cascade advance function.
// ARCHITECTURAL RULE: Use modulo arithmetic only. No nested if/else.
// Keeps transformation engine aligned with M1/M3 topological rhythms.
static inline void m4_advance_transformation(M4_Cycle_Engine* engine) {
    // Advance the stroke. Wraps at 24.
    engine->current_stroke = (engine->current_stroke + 1) % 24;

    // Every 2 strokes (a complete dual-phase), advance the storey
    if (engine->current_stroke % 2 == 0) {
        engine->current_storey = (engine->current_storey + 1) % 12;

        // Every 4 storeys (a complete elemental quarter), advance the decan
        if (engine->current_storey % 4 == 0) {
            engine->current_decan = (engine->current_decan + 1) % 3;
        }
    }
}

// The 7 canonical alchemical operations — function pointer table
typedef int (*M4_Alchemical_Op)(M4_Cycle_Engine* engine, void* material);
static const M4_Alchemical_Op M4_ALCHEMY_OPS[7] = {
    m4_op_calcine,      // 0: Calcination — burning away dross
    m4_op_dissolve,     // 1: Dissolution — dissolving structures
    m4_op_separate,     // 2: Separation — distinguishing components
    m4_op_conjoin,      // 3: Conjunction — uniting opposites
    m4_op_ferment,      // 4: Fermentation — living transformation
    m4_op_distill,      // 5: Distillation — purifying essence
    m4_op_coagulate,    // 6: Coagulation — fixing the result
};  // .rodata

// Safety gate — MUST pass before any operation
static inline bool m4_transformation_safe(const M4_Cycle_Engine* engine) {
    return engine->arousal_level <= engine->safety_threshold;
}

// Phase history — append-only telemetry
typedef struct {
    uint32_t timestamp;
    uint8_t  storey;
    uint8_t  decan;
    uint8_t  stroke;
    uint8_t  operation;         // Which alchemical op was applied
    uint8_t  outcome;           // Result code
} M4_Phase_Record;

typedef struct {
    M4_Phase_Record* records;   // Heap-allocated append-only log
    uint32_t count;
    uint32_t capacity;
} M4_Phase_History;
```

**Memory Domain:** Protocol library in .rodata (36 recipe cards are immutable); cycle engine state and phase history on heap.

**Pointer Topology:**
- Raw pointers bidirectional with #4.1 (state ↔ interventions)
- Raw pointers from #4.2 (oracular signals)
- Raw pointer from #4.0 (identity steering)
- Raw pointer to #4.4 (experience records)
- Tagged pointer (FLAG_NESTING) to #4.4.4.4 via RECORDS_TO (telemetry → Pratibimba)
- Raw pointer to #4.5 (pedagogy/capability/process signals)
- Calls `read_cosmic_clock()` (FR 2.4.6) before recipe selection

---

## FR 2.4.4: #4.4 — Context & Lenses (The 6-Lens Vtable + Cross-M Conduit)

**Requirement:** The C engine MUST implement the Context & Lenses module as a 6-lens vtable dispatch system where: (a) each lens is an indexed entry in `Lens_Vtable[6]` (.rodata), (b) the Jungian lens (#4.4.3, 35 nodes) contains the full individuation architecture from Archetypal Foundation through Transcendent Integration, (c) the Phenomenological lens (#4.4.4, 7 nodes) embeds the complete Tattva descent from M2 and contains the Personal Pratibimba convergence hub at #4.4.4.4 (updated with Symbol DNA integration), and (d) ALL 67 cross-M-branch edges originate from this module. #4.4 IS M4's window into the rest of the ontology.

**Ontological Ground:** #4.4 (Context & Lenses — 55 nodes, 132 internal relations, 67 cross-M-branch edges. "Context ledger and lens shelf that names, frames, and records transformation without performing it.")

### The 6 Lenses (Vtable[6])

| Index | Coord | Lens | Domain | Depth |
|-------|-------|------|--------|-------|
| 0 | #4.4.0 | Gebser | Consciousness structures (archaic/magic/mythic/mental/integral) | 1 node |
| 1 | #4.4.1 | Ontological | Being frameworks (process, substance, relational) | 1 node |
| 2 | #4.4.2 | Epistemological | Ways of knowing (empirical, rational, contemplative) | 1 node |
| 3 | #4.4.3 | **Jungian Depth** | Archetypes, typology, psychodynamics, alchemy, Self, gnosis | **35 nodes** |
| 4 | #4.4.4 | **Phenomenological** | Pre-categorical → Sedimentation → Pratibimba → Pratyabhijna | **7 nodes** |
| 5 | #4.4.5 | Trika/Kashmir Śaivism | Upāyas, Spanda, Pratyabhijñā, Tattvas | 1 node |

```c
// THE dispatch mechanism — no switch/case, ever
typedef struct {
    const char* lens_name;
    int (*translate)(uint8_t lens_id, const char* input,
                     const char* context, char* output, size_t len);
    int (*activate)(uint8_t lens_id, void* phenom_state);
    int (*deactivate)(uint8_t lens_id, void* phenom_state);
    int (*annotate)(uint8_t lens_id, const void* experience,
                    char* annotation, size_t len);
} M4_Lens_Vtable;

// 6 lenses in .rodata — indexed dispatch
static const M4_Lens_Vtable M4_LENS_REGISTRY[6];  // .rodata

// Usage: ALWAYS via index, never switch/case
int result = M4_LENS_REGISTRY[lens_id].translate(
    lens_id, input, context, output, output_size
);
```

### #4.4.3 — Jungian Depth Psychology Lens (35 Nodes, 6 Sub-Branches)

The deepest nested structure in M4, containing the complete Jungian individuation architecture:

#### #4.4.3-0: Archetypal Foundation (6 nodes)

| Coord | Content | Cross-M |
|-------|---------|---------|
| #4.4.3-0-0 | Jung-Freud Relation — the generative separation | — |
| #4.4.3-0-1 | Collective Unconscious — undifferentiated substrate | → COMPUTATIONALLY_INSTANTIATED_AS #4.4.4.4 |
| #4.4.3-0-2 | **Psychoid Numbers** — natural numbers as primitive archetypes | → ARCHETYPAL_SEED_FOR #1-4 (M1), → PROVIDES_ARCHETYPAL_FOUNDATION_FOR #2-1-0 (M2 MEF) |
| #4.4.3-0-3 | Archetypes-as-Such — irrepresentable organizing patterns | → COMPUTATIONALLY_INSTANTIATED_AS #4.4.4.4 |
| #4.4.3-0-4 | Instincts — somatic substrate, psyche merges with biology | — |
| #4.4.3-0-5 | Jung Personal Synthesis — life as exemplar | → METHODOLOGICAL_TEMPLATE_FOR #4.4.4.4 |

**Psychoid Numbers (#4.4.3-0-2)** is the critical cross-M bridge: it links to BOTH M1 (#1-4, where number becomes algebra) AND M2 (#2-1-0, the MEF's archetypal-numerical foundation). This node asserts that **natural numbers are the most primitive archetypes** — the psychoid entities where mathematics and psyche are undifferentiated. This grounds M0's number language in Jung's psychology.

#### #4.4.3-1: Psychological Typology (6 nodes)

| Coord | Function | Attitude | Elemental Throughline | Cross-M |
|-------|----------|----------|-----------------------|---------|
| #4.4.3-1-0 | Introversion | Transcendent, inward | — | — |
| #4.4.3-1-1 | Thinking | Rational judgment | Guanine/Air/Swords | — |
| #4.4.3-1-2 | Feeling | Value assessment | Adenine/Water/Cups | → RESONATES_WITH #1-2, PSYCHOLOGICAL_MANIFESTATION_OF #1-2 (M1 Ananda) |
| #4.4.3-1-3 | Sensation | Direct perception | Cytosine/Earth/Pentacles | — |
| #4.4.3-1-4 | Intuition | Unconscious perception | Thymine/Fire/Wands | — |
| #4.4.3-1-5 | Extraversion | Immanent, outward | — | — |

The nucleotide assignments in this table ARE the Elemental Throughline (FR 2.4.7) expressed in the Jungian domain. `nucleotide_balance` in `M4_Symbol_DNA_Profile` is the direct computational encoding of these assignments.

```c
// Jungian type: 4 functions + 2 attitudes in 6 bits
// Introversion/Extraversion as attitude (bit 5/0)
// Thinking/Feeling/Sensation/Intuition as function (bits 1-4)
typedef uint8_t M4_Jung_Type;
#define JUNG_INTROVERT   0x00
#define JUNG_EXTRAVERT   0x20
#define JUNG_THINKING    0x02   // → Guanine/Air
#define JUNG_FEELING     0x04   // → Adenine/Water
#define JUNG_SENSATION   0x08   // → Cytosine/Earth
#define JUNG_INTUITION   0x10   // → Thymine/Fire

// FR 2.4.5: THE float BOUNDARY RULE
// Floats are PERMITTED ONLY in M4_Jung_Complex.charge and M4_Jung_Complex.autonomy.
// Floats MUST NEVER be used to calculate array indices.
// Only permitted uses: threshold checks (charge > 0.5f) and Pi Agent data reporting.
typedef struct {
    uint8_t archetype_id;       // Which archetype this complex constellates
    float   charge;             // Emotional charge (positive/negative intensity)
                                // PERMITTED: threshold checks only
    float   autonomy;           // Degree of autonomous operation (0.0-1.0)
                                // PERMITTED: threshold checks only
    bool    conscious;          // Has this complex been made conscious?
} M4_Jung_Complex;
```

**Feeling (#4.4.3-1-2) → M1 Ananda (#1-2):** The psychological function of feeling IS the Ananda (bliss) principle at the human level. This is the deepest cross-M bridge in the typology.

#### #4.4.3-2: Psychodynamics & Synchronicity (6 nodes)

| Coord | Content | Cross-M |
|-------|---------|---------|
| #4.4.3-2-0 | Libido — generalized psychic energy | → RESONATES_WITH #1-3 (Spanda) |
| #4.4.3-2-1 | Opposites — tension generating energy | — |
| #4.4.3-2-2 | Compensation — unconscious corrective | — |
| #4.4.3-2-3 | Shadow — repressed/disowned aspects | — |
| #4.4.3-2-4 | Complexes — emotionally-charged autonomous cores | — |
| #4.4.3-2-5 | Synchronicity — meaningful coincidence | → RESONATES_WITH #1-3 (Spanda), EMPIRICALLY_VALIDATED_BY #3-1 (I-Ching) |

**Libido (#4.4.3-2-0) → M1 Spanda (#1-3):** Psychic energy IS Spanda (vibration) at the psychological level.
**Synchronicity (#4.4.3-2-5) → M1 Spanda + M3 I-Ching:** Synchronicity is empirically validated by the I-Ching's functioning — meaningful coincidence operating through the hexagram oracle.

#### #4.4.3-3: Alchemical Transformation (6 nodes — state machine)

| Coord | Stage | Color | Nature |
|-------|-------|-------|--------|
| #4.4.3-3-0 | Prima Materia | — | Undifferentiated chaos, starting material |
| #4.4.3-3-1 | Nigredo | Black | Confronting shadow, dissolution of ego |
| #4.4.3-3-2 | Albedo | White | Clarification, washing, moonlight |
| #4.4.3-3-3 | Citrinitas | Yellow | Solar illumination, dawning awareness |
| #4.4.3-3-4 | Rubedo | Red | Philosopher's stone, integration complete |
| #4.4.3-3-5 | Transcendent Function | — | Thesis-antithesis-synthesis enabling conscious participation |

→ `TRANSFORMATION_DOCUMENTED_IN` #4.4.4.4 (all stages documented in Personal Pratibimba)
→ `COMPUTATIONALLY_INSTANTIATED_AS` + `OPERATIONALIZED_AS` from #4.4.3-3-5 → #4.4.4.4

```c
typedef enum {
    ALCH_PRIMA_MATERIA = 0,
    ALCH_NIGREDO       = 1,
    ALCH_ALBEDO        = 2,
    ALCH_CITRINITAS    = 3,
    ALCH_RUBEDO        = 4,
    ALCH_TRANSCENDENT  = 5,
} M4_Alchemical_Stage;

static inline bool m4_alchemy_can_advance(M4_Alchemical_Stage current,
                                           M4_Alchemical_Stage target) {
    return target == current + 1 || target == ALCH_PRIMA_MATERIA;
}
```

#### #4.4.3-4: Self-Expression / Telos (6 nodes)

| Coord | Aspect | Nature |
|-------|--------|--------|
| #4.4.3-4.0 | Self as Context | The field within which all psychological life occurs |
| #4.4.3-4.1 | Self as Center | Focal organizing principle (not ego) |
| #4.4.3-4.2 | Self as Totality | Whole circumference — conscious + unconscious |
| #4.4.3-4.3 | Mandala | Spontaneous symbol of wholeness |
| #4.4.3-4.4 | Circumambulation | Movement around center, not toward it |
| #4.4.3-4.5 | Self as Actual Unity | Achieved synthesis, transcendence of ego-unconscious split |

#### #4.4.3-5: Transcendent Integration / Gnosis (6 nodes)

| Coord | Content | Cross-M |
|-------|---------|---------|
| #4.4.3-5-0 | Unus Mundus — psychophysically neutral reality | — |
| #4.4.3-5-1 | Gnostic Theology — psychology dissolves into theology | — |
| #4.4.3-5-2 | Answer to Job — God's need for incarnation | — |
| #4.4.3-5-3 | Mysterium Coniunctionis — three stages of conjunction | — |
| #4.4.3-5-4 | Eastern Convergence — Taoism, I-Ching, Kundalini | → RECOGNIZES_CONVERGENCE_WITH #3-1 (I-Ching), EMPIRICALLY_VALIDATED_BY #3-1 |
| #4.4.3-5-5 | Gnosis — direct experiential knowledge | — |

**Internal FLOWS_TO (24 edges):** The complete sequential developmental flow within #4.4.3:

```
Foundation → Typology → Psychodynamics → Alchemy → Self → Transcendent
    ↓           ↓           ↓               ↓        ↓        ↓
  #4.4.3-0  #4.4.3-1  #4.4.3-2       #4.4.3-3  #4.4.3-4  #4.4.3-5

Within each sub-branch, internal flow also sequences:
  -0 → -1 → -2 → -3 → -4 → -5 (the QL positions)
```

**MÖBIUS_RETURN (6 edges):** Six internal Möbius loops within #4.4, creating self-referential closure at each level.

### #4.4.4 — Phenomenological Lens (7 Nodes — The Meta-Method)

The Phenomenological lens is not merely one lens among others — it is the **meta-methodological framework** that enables all interpretive lenses to operate with rigor.

**6-fold toroidal structure (4+2):**

| Coord | Layer | Husserlian | C Analogue | Cross-M Count |
|-------|-------|-----------|------------|---------------|
| #4.4.4.0 | Pre-Categorical | Groundless ground | `void*` — typeless | 9 edges → M0 #0, M2 #2-2 (Tattvas) |
| #4.4.4.1 | Primordial Differentiation | Urstiftung | First type assignment | 9 edges → M1 #1, M2 #2-2 |
| #4.4.4.2 | Temporal Sedimentation | Sedimentierung | Cache/memoization | 8 edges → M2 #2, M1 #1-3 |
| #4.4.4.3 | Symbolic Body | Institution | Established struct defs | 7 edges → M3 #3, M2 #2-2-2 |
| **#4.4.4.4** | **Personal Pratibimba** | **Lifeworld** | **Integration hub** | **11 edges → M0, M2 #2-2** |
| #4.4.4.5 | Pratyabhijna | Recognition | `pratyabhijna()` | 11 edges → M5, M1, M2, M3 |

**Phenomenological Möbius:** `FLOWS_TO` #4.4.4.5 → #4.4.4.0 — the Pratyabhijna recognition flows back to the Pre-Categorical ground. You discover that what you sought was always already present.

**Cross-M Tattva Mapping — The Complete Descent Through #4.4.4:**

| Phenom Layer | Tattva Stratum | Relations |
|-------------|----------------|-----------|
| #4.4.4.0 Pre-Categorical | Shuddha Tattvas (#2-2-0) — pure principles | PARTICIPATES_IN_ESSENCE → #2-2-0-0/1 (Siva-Shakti), #2-2-0-2 (Sadashiva) |
| | Maya-Kanchuka (#2-2-1) | VEILED_BY → #2-2-1-0/1 (Maya), LIMITED_BY_ANAVA_MALA → #2-2-1-0/1 |
| | Ashuddha (#2-2-2) | COALESCES_WITH → #2-2-1-7 (Purusha), CONTAINS_UNDIFFERENTIATED → #2-2-2-1 |
| #4.4.4.1 Differentiation | Shuddha | PARTICIPATES_IN_ESSENCE → #2-2-0-3 (Ishvara), REMAINS_IN_ESSENCE → #2-2-0-0/1 |
| | Maya-Kanchuka | ENACTED_BY → #2-2-1-0/1, CONSTITUTED_BY_MALA → #2-2-1-0/1 |
| | Ashuddha | OPERATES_THROUGH_AHAMKARA → #2-2-2-1, OPERATES_THROUGH_BUDDHI → #2-2-2-1 |
| #4.4.4.2 Sedimentation | Shuddha | MANIFESTS_SHAKTI_FLOW → #2-2-0-2 (Sadashiva) |
| | Maya-Kanchuka | ENACTED_BY_KANCHUKA → #2-2-1-5, BOUND_BY_KARMA_MALA → #2-2-1-5, STRUCTURED_BY_NECESSITY → #2-2-1-6 |
| | Spanda | POWERED_BY_SPANDA → #2, RHYTHMICALLY_ENACTED_BY → #1-3 |
| #4.4.4.3 Symbolic Body | Ashuddha instruments | PERCEIVES_THROUGH_ORGANS → #2-2-2-2 (Jnanendriyas), ACTS_THROUGH_ORGANS → #2-2-2-3 (Karmendriyas) |
| | Subtle body | STRUCTURED_BY_SUBTLE_TEMPLATES → #2-2-2-4 (Tanmatras), FOUNDED_ON_SHABDA → #2-2-2-4-0/1 (Sound) |
| | Gross body | COORDINATED_BY_MANAS → #2-2-2-1, MATERIALIZES_INTO → #2-2-2-5 (Mahabhutas) |
| **#4.4.4.4 Pratibimba** | **Complete system** | **EMBODIES_COMPLETE_TATTVA_SYSTEM → #2-2 (ALL 36)** |
| | Jiva level | EXISTS_AS_JIVA → #2-2-1-7 (Purusha), LIVES_AS_MATERIAL_ELEMENTS → #2-2-2-5 |
| | Instruments | OPERATES_THROUGH_INTEGRATED_ANTAHKARANA → #2-2-2-1, PERCEIVES_AND_ACTS_THROUGH → #2-2-2-2, #2-2-2-3 |
| #4.4.4.5 Pratyabhijna | Return to Shuddha | RECOGNIZES_SELF_AS → #2-2-0-0/1 (Siva-Shakti), #2-2-0-2 (Sadashiva) |
| | Full recognition | REALIZES_COSMIC_FORMULA → #2-2-0-3, REALIZES_LORDSHIP → #2-2-0-4, ACHIEVES_PURE_KNOWLEDGE → #2-2-0-5 |
| | Completion | REALIZES_COMPLETE_PURITY → #2-2-0, USER_RECOGNIZES_SELF_AS → #0 (Anuttara) |

### #4.4.4.4 — Personal Pratibimba (THE LEMNISCATE NODE — Updated with Symbol DNA)

**The architectural centerpiece of M4.** #4.4.4.4 is where the entire system reflects itself in the individual. Its coordinate — fourth-order nesting, 4 repeated 4 times — IS the Lemniscate folding inward at maximum recursion depth.

The Personal Pratibimba is where the static identity (#4.0 Symbol DNA) collides with the active environment (#4.1 real-time body state and cosmic timing). It acts as the convergence hub and epigenetic interpreter: the Tarot Engine emits a canonical tag (e.g., King of Swords = G-nucleotide / Air / Thinking), and the Pratibimba asks whether the user's Symbol DNA has affinity for that nucleotide, or whether this will generate psychological tension recorded as `M4_Jung_Complex` charge.

**FR 2.4.2 — M4_Personal_Pratibimba (The Convergence Hub):**

```c
// ==============================================================================
// FR 2.4.2: M4_Personal_Pratibimba — The Convergence Hub
// ==============================================================================

typedef struct {
    // The immutable genetic/astrological seed of the individual.
    // Pointer to the Symbol DNA Profile computed in m4_identity_compute().
    // MUST be const — this seed never changes during a session.
    const M4_Symbol_DNA_Profile* user_dna;

    // The current lived experience and cosmic timing (mutable body/timing state).
    M4_Sympathetic_Medicine* current_body_state;

    // The active MEF Lens determining HOW the individual is processing reality.
    // ARCHITECTURAL REQUIREMENT: This field MUST link directly to the
    // M2_Vibrational_72_Space .rodata array. It is a physical pointer into
    // M2's immutable lens definitions — not a copy, not an index.
    MEF_Condition* active_epistemic_lens;

    // Active psychological tensions — the Spanda between universal DNA and lived reality.
    // FR 2.4.5: These are the ONLY structs in M4 that contain floats.
    // Floats in M4_Jung_Complex (charge, autonomy) are permitted ONLY for
    // threshold checks and Pi Agent reporting. Never for array indexing.
    M4_Jung_Complex active_complexes[6];

    // ─── Tattva embodiment (complete M2 #2-2 mapping) ───────────────────────
    const void* tattva_system;          // → M2 complete 36-Tattva .rodata
    uint8_t jiva_state;                 // Purusha (#2-2-1-7) condition
    uint8_t antahkarana_integration;    // Inner instrument (#2-2-2-1) state
    uint8_t perception_channels;        // Jnanendriyas (#2-2-2-2) active
    uint8_t action_channels;            // Karmendriyas (#2-2-2-3) active
    uint8_t elemental_body;             // Mahabhutas (#2-2-2-5) state

    // ─── Convergence state ───────────────────────────────────────────────────
    bool    identity_manifested;        // Has #4.0 MANIFESTS_IN fired?
    bool    telemetry_active;           // Is #4.3-5 RECORDS_TO connected?
    uint32_t pattern_count;             // Patterns contributed to #4.5

    // ─── Bimba layer (.rodata pointers) ─────────────────────────────────────
    const void* bimba_patterns;         // → archetype atlas in .rodata
    const void* archetype_atlas;        // → collective pattern library
} M4_Personal_Pratibimba;
```

**23 relations — highest density in ALL of M4:**

**Inbound (12):** Everything converges here:
- Identity MANIFESTS here (#4.0)
- Telemetry RECORDS here (#4.3-5)
- Jungian lens COMPUTATIONALLY_REALIZES here (#4.4.3)
- Archetypal Foundation CONVERGES here (#4.4.3-0)
- Collective Unconscious + Archetypes-as-Such + Transcendent Function INSTANTIATE here
- Jung's personal synthesis provides METHODOLOGICAL_TEMPLATE here
- Alchemical stages DOCUMENT TRANSFORMATION here
- Symbolic Body FLOWS here (#4.4.4.3)
- Parent CONTAINS_REFLECTION_SPACE here (#4.4.4)

**Outbound (11):** Here reaches everywhere:
- REFLECTS_FOUNDATION → #0 (Anuttara — the absolute ground)
- RESONATES_WITH → #4 (M-branch root self-resonance)
- FLOWS_TO → #4.4.4.5 (Pratyabhijna — recognition)
- CONTRIBUTES_PATTERNS_TO → #4.5 (Epii Integration)
- **EMBODIES_COMPLETE_TATTVA_SYSTEM → #2-2** (all 36 Tattvas)
- LIVES_AS_MATERIAL_ELEMENTS → #2-2-2-5 (Mahabhutas)
- OPERATES_THROUGH_INTEGRATED_ANTAHKARANA → #2-2-2-1
- PERCEIVES_AND_ACTS_THROUGH → #2-2-2-2 (sense organs)
- PERCEIVES_AND_ACTS_THROUGH → #2-2-2-3 (action organs)
- EXISTS_AS_JIVA → #2-2-1-7 (individual soul)
- OPERATES_IN_NARA_DOMAIN → #4

### Aggregate Lens C Structure

```c
// Complete Context & Lenses module
typedef struct {
    // 6-lens vtable dispatch (.rodata)
    const M4_Lens_Vtable* registry;     // → M4_LENS_REGISTRY[6]

    // Active lens state
    uint8_t active_lens;                // Currently selected lens (0-5)
    uint8_t lens_stack[6];              // Lens priority stack

    // Jungian state (heap)
    M4_Jung_Complex* complexes;         // Dynamic array
    uint8_t complex_count;
    M4_Alchemical_Stage alch_stage;     // Current alchemical stage
    M4_Jung_Type jung_type;             // Psychological type

    // Phenomenological state
    M4_Personal_Pratibimba pratibimba;  // THE convergence hub (updated with Symbol DNA)
    uint8_t phenom_layer;               // Current phenomenological layer (0-5)

    // Möbius tracking
    uint8_t mobius_count;               // How many times we've returned to ground
} M4_Context_Lenses;
```

**Memory Domain:** Vtable registry in .rodata; all state on heap. The Bimba layer and Archetype Atlas within Pratibimba point into .rodata; the PCO overlay is heap-private. `active_epistemic_lens` points directly into M2 .rodata — never copied.

---

## FR 2.4.5: #4.5 — Epii Integration (Recursive Synthesis + Möbius Return)

**Requirement:** The C engine MUST implement the Epii Integration module as a recursive synthesis engine that: (a) runs the complete 0→5 Logos Cycle on each transformation episode, (b) distills insights from all other M4 sub-systems, (c) develops pedagogical playbooks, and (d) executes the Möbius return to #4.0 (RETURNS_TO, UPDATES_WISDOM_IN, RESEEDS_IDENTITY), closing the session loop.

**Ontological Ground:** #4.5 (Epii Integration — 13 nodes: 6 sub-positions + 6 coordinate-notation variants + root. "Hosts epii consciousness in situ, running Logos Cycle over each Nara episode.")

### The 6 Integration Sub-Positions

| Coord | Function | C Pattern |
|-------|----------|-----------|
| #4.5-0 | Curriculum Map | Dynamic learning curation based on evolving identity — `Curriculum_Entry[]` |
| #4.5-1 | Core Epi-Logos Voice | Style guide ensuring consistent communication — `Voice_Config` (.rodata) |
| #4.5-2 | Method Transparency Lab | "Lab notes" showing all considerations — `Transparency_Log[]` |
| #4.5-3 | Integration Lab | Cross-system synthesis engine — aggregates from all sub-systems |
| #4.5-4 | Pedagogy Lab | Learning design based on user readiness — `Readiness_Assessment` |
| #4.5-5 | Logos Cycle Engine | Executes complete 0→5 QL cycle on each case — `Logos_Cycle_State` |

### Relation Dynamics (6 internal, 12 cross-sub)

**Inbound (from all other sub-systems):**
- `FEEDS_EXPERIENCE_TO` ← #4.1 (body wisdom)
- `FEEDS_INTERPRETATION_TO` ← #4.2 (divinatory insights)
- `EMITS_PEDAGOGY_SIGNALS` ← #4.3 (learning opportunities)
- `FEEDS_CAPABILITY_SIGNALS` ← #4.3 (new capabilities unlocked)
- `FEEDS_PROCESS_TO` ← #4.3 (process data)
- `FEEDS_CONTEXT_TO` ← #4.4 (lens context)
- `CONTRIBUTES_PATTERNS_TO` ← #4.4.4.4 (Pratibimba patterns)

**Outbound — THE MÖBIUS RETURN:**
- `RETURNS_TO` → #4.0 — session cycle closes
- `UPDATES_WISDOM_IN` → #4.0 — accumulated wisdom updates identity
- `RESEEDS_IDENTITY` → #4.0 — next session starts from enriched ground

### The Logos Cycle Engine (#4.5-5)

```
Position 0: Ground — what is the starting state?
Position 1: Definition — what needs to change?
Position 2: Operation — how does transformation proceed?
Position 3: Pattern — what patterns emerge?
Position 4: Context — how does this fit the larger picture? (Lemniscate!)
Position 5: Integration — what is the synthesis?
→ Möbius return to Position 0 of next cycle
```

### C Structure

```c
typedef struct {
    uint8_t position;           // 0-5 (current QL position)
    uint8_t cycle_count;        // How many complete cycles this session
    bool    complete;           // Has this episode's cycle finished?
} M4_Logos_Cycle_State;

typedef struct {
    void* curriculum;                   // #4.5-0: dynamic learning map
    const void* voice_config;           // #4.5-1: .rodata
    void* transparency_log;             // #4.5-2: lab notes
    void* integration_state;            // #4.5-3: cross-system synthesis
    uint8_t readiness_level;            // #4.5-4: user's current readiness
    void* pedagogy_state;
    M4_Logos_Cycle_State logos;          // #4.5-5: the cycle engine
    uint64_t wisdom_delta;              // What wisdom to seed back to #4.0
    bool     return_ready;              // Is the Möbius return prepared?
} M4_Epii_Integration;

void m4_mobius_return(M4_Epii_Integration* epii, M4_Identity_Matrix* identity) {
    identity->quintessence_hash ^= epii->wisdom_delta;
    identity->computed = false;         // RESEEDS_IDENTITY: mark for recomputation
    epii->return_ready = false;
    epii->logos.position = 0;
    epii->logos.cycle_count++;
}
```

---

## FR 2.4.6: CF(0/1/2/3) Unified Cosmic Clock Integration

**Requirement:** M4 medicinal, ritual, and energetic operations MUST first call `read_cosmic_clock(current_degree)` to obtain a `Unified_Clock_State` before selecting alchemical recipes, mantras, or medicines. Selection MUST derive from the clock state, NOT from ad-hoc degree lookups. This function integrates the M1 Torus (inner gear), M2 Parashakti ring (planetary/chakra dial), and M3 Mythic Synthesis Wheel (outer face) into a single O(1) accessor.

### The Concentric Clock Architecture

The CF(0/1/2/3) Context Frame is a **multi-layered astrolabe** with three concentric rings:

**Ring 1 — M1 Torus (The Inner Gear):** 12 Torus stages × 30° each = 360°. Stage N governs degrees [N×30, (N+1)×30). The 720° double-cover tracks whether the system is in the Explicate (Conscious/Day, 0-359°) or Implicate (Unconscious/Night, 360-719°) phase.

**Ring 2 — M2 Parashakti (The Planetary/Chakra Dial):** 36 Decans × 10° each = 360°. Each Decan corresponds to a classical planet and its associated Chakra. The SU(2) dual-phase extends this to 72 Decans (36 Explicate + 36 Implicate). As the clock sweeps through a 10° sector, it strikes the M2 Parashakti register, activating the specific planet and Chakra. M2 is completely implicit in the clock — no separate M2 query needed.

**Ring 3 — M3 Mahamaya (The Outer Face):** 64 Hexagrams distributed around 360° (5.625° per Hexagram, Fu Xi sequence). The visible clock face shows which mythic narrative or genetic codon is active at the current cosmic moment.

**The Planets and Chakras are implicit in M2 Decans.** When M4 checks the clock at a given degree, it receives the Decan index and from it derives the ruling planet and its Chakra correspondence — the astronomic and energetic lenses are unified in a single lookup.

### C Architecture

```c
// ==============================================================================
// FR 2.4.6: CF(0/1/2/3) UNIFIED COSMIC CLOCK
// Integrates M1 (Torus), M2 (Parashakti/Planetary), M3 (Mahamaya/Hexagram)
// into a single O(1) geometric accessor keyed by cosmic degree (0-719).
// ==============================================================================

typedef struct {
    uint8_t  m1_torus_stage;     // 0-11  (M1 Inner Gear: 30° sectors)
    uint8_t  m2_decan_phase;     // 0-71  (M2 Energetic Dial: 10° sectors + Phase)
    uint8_t  m3_hexagram_id;     // 0-63  (M3 Outer Face: 5.625° sectors)
    bool     is_implicate_phase; // true if degree >= 360 (Night/Unconscious phase)
} Unified_Clock_State;

// O(1) — derives the state of all 4 subsystem lenses from a single degree value.
// All arithmetic is integer only; the hexagram division uses an integer multiply trick.
// RULE: M4 medicinal/ritual operations call this FIRST, then index into recipe/medicine
// arrays using only the integer fields of Unified_Clock_State. NEVER use floats
// derived from degree values as array indices.
static inline Unified_Clock_State read_cosmic_clock(uint16_t current_degree_0_to_719) {
    bool is_implicate = current_degree_0_to_719 >= 360;
    uint16_t base_degree = current_degree_0_to_719 % 360;

    Unified_Clock_State state;
    state.is_implicate_phase = is_implicate;

    // M1 Torus stage: 30 degrees per stage (0-11)
    state.m1_torus_stage = (uint8_t)(base_degree / 30);

    // M2 Parashakti decan: 10 degrees per decan (0-35 Explicate, 36-71 Implicate)
    uint8_t base_decan = (uint8_t)(base_degree / 10);
    state.m2_decan_phase = is_implicate ? (uint8_t)(base_decan + 36) : base_decan;

    // M3 Mahamaya hexagram: integer multiply avoids floating-point math
    // (base_degree * 64) / 360 gives hexagram index 0-63
    state.m3_hexagram_id = (uint8_t)((base_degree * 64) / 360);

    return state;
}
```

### Example: M4 Energetic Healing at 155°

```
read_cosmic_clock(155) returns:
  m1_torus_stage  = 5   → Torus Stage 5 (Analogical Recognition)
  m2_decan_phase  = 15  → Decan 15, Mars-ruled, Manipura (Solar Plexus) Chakra
  m3_hexagram_id  = 27  → Hexagram 27 (Nourishment / Corners of the Mouth)
  is_implicate    = false → Explicate/Day phase (active transformation)

M4 consequences:
  - Alchemical recipe: protocol card for Torus Stage 5 selected from M4_PROTOCOL_LIBRARY
  - Planetary hour check: Mars hour preferred for Manipura work
  - Medicine: fire/earth balance appropriate for Decan 15 energetics
  - Mantra: Hexagram 27 nourishment archetype guides counsel content
  - Jungian lens: check active_complexes for Sensation/Thinking tension
    (Earth/Air nucleotides — Cytosine/Guanine) given Mars/Manipura activation
```

**Architectural consequence:** M1, M2, and M3 are not separate databases that M4 must query independently. They are **concentric rings of the same underlying Mod-6 geometry**, unified under the CF(0/1/2/3) context frame. The clock is the single interface.

---

## PCO: Personal Context Overlay (The Complete Heap Structure)

Everything in M4 that is user-specific, session-mutable, and privacy-sensitive lives on the heap:

```c
// THE PCO — all of Nara's mutable personal state
typedef struct {
    // Identity (computed once, cached — effectively const after m4_identity_compute)
    // Contains M4_Symbol_DNA_Profile as dna_profile member
    M4_Identity_Matrix identity;            // #4.0

    // Medicine (fully mutable)
    M4_Sympathetic_Medicine medicine;       // #4.1

    // Divination (session state)
    M4_Divinatory_Frameworks divination;    // #4.2

    // Transformation (cycle engine + history)
    M4_Cycle_Engine transformation;         // #4.3
    M4_Phase_History phase_history;         // #4.3-5

    // Lenses (complex state + Pratibimba with Symbol DNA integration)
    M4_Context_Lenses lenses;              // #4.4

    // Integration (synthesis + Möbius)
    M4_Epii_Integration integration;        // #4.5

    // MEF threshold — gates ALL activation
    uint8_t mef_level;                      // From M2 MEF assessment
    // if (mef_level < threshold) return -EPERM;
} M4_PersonalContextOverlay;

// ALL heap-allocated. NOTHING personal in .rodata.
// Privacy is architectural: raw personal data is destroyed immediately
// in m4_identity_compute() via memset. Only hash and derived bitboards persist.
```

---

## Complete M4 Pointer Topology

```
                M1 (#1-2,#1-3,#1-4)     M2 (#2-1,#2-2)      M3 (#3-1)
                        ↕                     ↕                   ↕
                    67 cross-M edges (ALL through #4.4)
                        ↕                     ↕                   ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                        M4 (Nara)                                        │
│                                                                         │
│  #4.0 Identity ──→ #4.1 Medicine ──→ #4.2 Divination                   │
│  (Symbol DNA Profile) (elem align)  (magic-check vtable)               │
│    │ (compute-once)  │ (heap mutable)  │                               │
│    │                 │ CF clock ↓      │ CF clock ↓                    │
│    │                 │                 ↓                                │
│    │                 │     ↕    #4.3 Transformation                    │
│    │                 │ (bidirectional) (modulo cascade advance)        │
│    │                 ↺←───────────────→│ (hub: 19 cross-sub)          │
│    │                   CF clock ↓       │                              │
│    │                                   ↓                               │
│    ├──────────────────────────────→ #4.4 Context & Lenses              │
│    │    MANIFESTS_IN                   │ (55 nodes, 132 internal)       │
│    │         ↓                         │ active_epistemic_lens → M2     │
│    │    #4.4.4.4 ←────────────────────←│ RECORDS_TO from #4.3-5        │
│    │    Personal Pratibimba            │ CONVERGES_IN from #4.4.3       │
│    │    (user_dna → Symbol DNA Profile)│                                │
│    │    (23 relations — max density)   │                                │
│    │         │                         │                                │
│    │         │ EMBODIES_COMPLETE_TATTVA → M2 #2-2                      │
│    │         │ EXISTS_AS_JIVA → M2 #2-2-1-7                           │
│    │         │ REFLECTS_FOUNDATION → M0 #0                             │
│    │         ↓                         ↓                                │
│    │    #4.4.4.5 Pratyabhijna    #4.5 Epii Integration                │
│    │    (recognition)              │ (Logos Cycle 0→5)                  │
│    │         │                     │                                    │
│    │         └─ Möbius → #4.4.4.0  └→ Möbius return ──→ #4.0          │
│    │            (internal)            (RETURNS_TO, UPDATES_WISDOM,      │
│    │                                   RESEEDS_IDENTITY)                │
│    ↺←──────────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────┘
                        │
                        ↓ SUCCEEDED_BY_AND_MANIFESTS_THROUGH
                       #5 (Epii)
```

---

## Complete M4 Operational Flow

```
SESSION START
    ↓
User provides M4_Input_Data (raw: birthdate, natal chart, MBTI, etc.)
    ↓
#4.0 m4_identity_compute() — ONCE per session
    ↓ Gene Keys → M3 bitboard mask (gene_keys_activation)
    ↓ MBTI → nucleotide weights (nucleotide_balance via Elemental Throughline)
    ↓ Natal chart → degree anchors (sun_degree_anchor, moon_degree_anchor 0-719)
    ↓ quintessence_hash computed
    ↓ memset(input, 0) — raw data DESTROYED immediately (PCO Privacy Hash)
    ↓ M4_Identity_Matrix.computed = true
    ↓
    ├→ INFORMS_CONSTITUTION
    │   ↓
    │   #4.1 Sympathetic Medicine (HEAP — body state)
    │   ├─ Element balance aligned with nucleotide_balance
    │   ├─ Chakra state, Pharmacopeia
    │   ├─ Temporal intelligence via read_cosmic_clock() (CF(0/1/2/3))
    │   ├─ 7 Alchemical operations (function pointers)
    │   └─ Safety gates (contraindication check)
    │       ├→ PROVIDES_STATE_VECTOR → #4.3
    │       ├→ PROVIDES_TIMING_FOR → #4.2, #4.3, #4.4
    │       └→ FEEDS_EXPERIENCE_TO → #4.5
    │
    ├→ SHAPES_INTERPRETATION
    │   ↓
    │   #4.2 Divinatory Frameworks (VTABLE + MAGIC-NUMBER TYPE SAFETY)
    │   ├─ Consent gate → Sacred random
    │   ├─ Tradition vtable dispatch (magic check → -EPERM on mismatch)
    │   ├─ Common Substrate → Canonical Tags (with nucleotide via Throughline)
    │   │   ├→ EMITS_CANONICAL_TAGS → #4.1 (body reads symbols)
    │   │   └→ EMITS_CANONICAL_TAGS → #4.3 (transformation reads symbols)
    │   ├─ Interpretation Layer + Hygiene
    │   └─ PROVIDES_ORACULAR_SIGNAL → #4.3, FEEDS_INTERPRETATION → #4.5
    │
    ├→ GUIDES_PROCESS
    │   ↓
    │   #4.3 Mediating Transformation (MODULO CASCADE ENGINE)
    │   ├─ m4_advance_transformation(): stroke%24 → storey%12 → decan%3
    │   ├─ Protocol Library selection via read_cosmic_clock()
    │   ├─ 7 Alchemical operations dispatched per recipe
    │   ├─ Safety threshold: arousal ≤ limit (or -EPERM)
    │   └─ Telemetry → RECORDS_TO #4.4.4.4
    │       ├→ WRITES_EXPERIENCE_RECORD → #4.4
    │       ├→ REQUESTS_INTERVENTIONS → #4.1 (bidirectional!)
    │       └→ EMITS_PEDAGOGY/CAPABILITY/PROCESS → #4.5
    │
    ├→ SELECTS_PERSPECTIVE + MANIFESTS_IN #4.4.4.4
    │   ↓
    │   #4.4 Context & Lenses (VTABLE[6] + CROSS-M CONDUIT)
    │   ├─ Gebser / Ontological / Epistemological (3 lightweight lenses)
    │   ├─ Jungian (35 nodes): Foundation → Typology (Elemental Throughline)
    │   │   → Psychodynamics → Alchemy (state machine) → Self → Gnosis
    │   │   Cross-M: Psychoid Numbers → M1 #1-4, M2 #2-1-0
    │   │            Feeling (Adenine/Water) → M1 #1-2 (Ananda)
    │   │            Libido/Synchronicity → M1 #1-3 (Spanda)
    │   ├─ Phenomenological (7 nodes): Pre-Categorical → ... → PERSONAL PRATIBIMBA
    │   │   #4.4.4.4: user_dna (Symbol DNA), active_epistemic_lens → M2 .rodata
    │   │             active_complexes[6] (float charge/autonomy — thresholds only)
    │   │   Cross-M: COMPLETE TATTVA DESCENT through M2 #2-2
    │   └─ Trika/KS (interpretive frame)
    │       ├→ PROVIDES_CASE_METADATA → #4.3
    │       └→ FEEDS_CONTEXT_TO → #4.5
    │
    └→ Everything flows to:
        ↓
        #4.5 Epii Integration (LOGOS CYCLE 0→5)
        ├─ Curriculum Map, Epi-Logos Voice, Transparency, Integration, Pedagogy
        └─ Logos Cycle Engine (complete 0→5 QL cycle)
            ↓
            MÖBIUS RETURN
            ├→ RETURNS_TO → #4.0
            ├→ UPDATES_WISDOM_IN → #4.0 (quintessence_hash ^= wisdom_delta)
            └→ RESEEDS_IDENTITY → #4.0 (computed = false → triggers recomputation)
            ↓
SESSION END (or next cycle begins from enriched #4.0 with updated Symbol DNA)
```

---

## M4 Design Rules Summary (Revised)

1. **All dispatch = indexed `vtable[6]`.** Never switch/case. Lenses, traditions, operations — all vtable-dispatched.

2. **All tradition state structs MUST include `uint32_t magic` as first field.** All `cast` vtable implementations MUST validate magic before proceeding. Return `-EPERM` on mismatch. This is the type-safety mechanism for void* polymorphism.

3. **All personal/mutable state = heap (PCO).** Nothing personal in .rodata. Privacy is architectural.

4. **PCO Privacy Hash: m4_identity_compute() destroys raw input immediately.** `memset(mutable_input, 0, sizeof(M4_Input_Data))` is called immediately after hash and Symbol DNA derivation. Raw personal data NEVER persists beyond this call.

5. **Identity data computed once and cached.** `m4_identity_compute()` runs once per session; result is effectively `const`. `M4_Symbol_DNA_Profile` is the canonical epigenetic fingerprint — immutable for the session.

6. **All M4 medicinal/ritual operations MUST query `read_cosmic_clock()` first.** Recipe, mantra, and medicine selection derives from `Unified_Clock_State`, not ad-hoc degree arithmetic.

7. **`m4_advance_transformation()` uses modulo cascade only.** stroke%24 → storey%12 → decan%3. No complex branching, no nested if/else.

8. **Float isolation: floats are PERMITTED ONLY in `M4_Jung_Complex.charge` and `M4_Jung_Complex.autonomy`.** Floats MUST NEVER be used to calculate array indices. Only permitted for threshold checks (`charge > 0.5f`) and Pi Agent data reporting.

9. **Elemental Throughline consistency (FR 2.4.7) is non-negotiable.** A=Cups=Water=Feeling, T=Wands=Fire=Intuition, C=Pentacles=Earth=Sensation, G=Swords=Air=Thinking. This mapping MUST be identical in M3 codon assignments, M4 `nucleotide_balance`, and L-family MEF lenses. Any inconsistency is a specification violation.

10. **`M4_Personal_Pratibimba.active_epistemic_lens` MUST be a direct pointer into M2 .rodata.** Never a copy, never an index resolved at runtime. Physical pointer into M2_Vibrational_72_Space .rodata array.

11. **`M4_Symbol_DNA_Profile.gene_keys_activation` IS an M3_Matrix_Word.** It is NOT a separate Gene Keys data structure. It is a 64-bit mask over M3's universal hexagram/codon bitboard.

12. **All cycle indices = `uint8_t`.** Fits single byte, atomic load. Storey (mod-12), decan (mod-3), stroke (mod-24).

13. **MEF threshold gates activation:** `if (mef_level < threshold) return -EPERM`. No operation proceeds without sufficient epistemic readiness.

14. **12 × 3 = 36 recipe cards in .rodata.** Protocol library is immutable; which recipe is *active* is heap state, selected via clock query.

15. **#4.4.4.4 (Personal Pratibimba) is the convergence hub** — 23 relations, highest density in M4, embodies the complete Tattva system, IS the Lemniscate node, holds the Symbol DNA pointer and active MEF lens pointer.

16. **67 cross-M edges ALL through #4.4.** The lenses are M4's sole window into the rest of the ontology.

17. **The Möbius return** (#4.5 → #4.0) closes the session loop: RETURNS_TO + UPDATES_WISDOM + RESEEDS_IDENTITY.

18. **#4 IS the Lemniscate** — where the Torus folds inward. The `.` (nesting) operator primarily operates here. M4 is where universal becomes personal. The Symbol DNA Profile is the crystallized expression of this principle: the individual IS a specific coordinate within the universal math.

19. **Safety gates at every layer:** Medicine contraindication, transformation arousal threshold, divination consent, hygiene bias check, MEF level gate, magic-number type check.

---

*Document Version:* 2.0
*Revision Date:* 2026-03-04
*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/M/M4-nara-personal-interface.md`
*Incorporates:* Gemini architectural review (lines 785-1106 of `docs/specs/gemini-spec-M-branch-updates-refinements.md`)
*Related Specifications:* CLAUDE.md, M0 through M3 specs, M5-epii spec

---

## SPEC PATCH — Cross-M Harmonisation (2026-03-05)

**Source:** Cross-M Harmonisation Agent — Task #7
**Gaps Addressed:** FR 2.4.8, FR 2.4.9, FR 2.4.10 from M4 dataset review

---

### FR 2.4.8: Dialogical Container LUT (Three Containers)

**Requirement:** The C engine MUST provide an `M4_Container_Entry` LUT with exactly 3 entries encoding the three dialogical containers from the dataset. Each entry MUST specify the safety class, phase fitness mask, and verb bias that governs operations within that container.

**Gap addressed:** Missing `M4_Container_Entry` LUT for the 3 dialogical containers observed in the dataset (#4.2 through #4.4).

```c
// ==============================================================================
// FR 2.4.8: DIALOGICAL CONTAINER LUT (3 CONTAINERS)
// ==============================================================================

// Safety classes for dialogical containers
typedef enum : uint8_t {
    CONTAINER_SAFETY_OPEN       = 0,  // No safety restrictions
    CONTAINER_SAFETY_MONITORED  = 1,  // Monitoring active; warnings issued
    CONTAINER_SAFETY_GATED      = 2,  // Explicit consent required before entry
} M4_Container_Safety_Class;

// Phase fitness mask: bit N set = this container is fit for Logos FSM stage N
typedef uint8_t M4_Phase_Fit_Mask;
#define M4_PHASE_FIT_ALL     0x3Fu  // Fits all 6 stages (bits 0-5 set)
#define M4_PHASE_FIT_OUTER   0x0Fu  // Fits stages 0-3 only (outer Torus)
#define M4_PHASE_FIT_INNER   0x30u  // Fits stages 4-5 only (Lemniscate + Integration)

// Verb bias: which alchemical operation the container prefers
typedef enum : uint8_t {
    VERB_BIAS_DISSOLVE   = 0,  // Dissolution-oriented (Samhara)
    VERB_BIAS_COAGULATE  = 1,  // Coagulation-oriented (Sthiti)
    VERB_BIAS_SUBLIME    = 2,  // Sublimation-oriented (Anugraha)
    VERB_BIAS_NEUTRAL    = 0xFFu, // No bias
} M4_Verb_Bias;

typedef struct {
    uint8_t                  container_id;   // 0-2 (three containers)
    M4_Container_Safety_Class safety_class;  // 0-2
    M4_Phase_Fit_Mask         phase_fit;     // bitmask of compatible Logos stages
    M4_Verb_Bias              verb_bias;     // preferred alchemical operation
    uint8_t                   _pad;          // alignment
} M4_Container_Entry;

// 3 dialogical containers — in .rodata
#define M4_CONTAINER_COUNT 3u
static const M4_Container_Entry M4_CONTAINER_LUT[M4_CONTAINER_COUNT] = {
    { 0, CONTAINER_SAFETY_MONITORED, M4_PHASE_FIT_OUTER, VERB_BIAS_DISSOLVE,  0 },
    { 1, CONTAINER_SAFETY_GATED,     M4_PHASE_FIT_ALL,   VERB_BIAS_COAGULATE, 0 },
    { 2, CONTAINER_SAFETY_OPEN,      M4_PHASE_FIT_INNER, VERB_BIAS_SUBLIME,   0 },
};

_Static_assert(sizeof(M4_Container_Entry) == 4, "M4_Container_Entry must be 4 bytes");
_Static_assert(sizeof(M4_CONTAINER_LUT) / sizeof(M4_CONTAINER_LUT[0]) == M4_CONTAINER_COUNT,
    "M4_CONTAINER_LUT must have exactly 3 entries");
```

---

### FR 2.4.9: Stall Types, Two-Stroke Operations, and Safety Governor

**Requirement:** The C engine MUST define an `M4_Stall_Type` enum encoding 5 distinct stall triggers observed in the dataset. The `M4_Cycle_Engine` struct MUST be augmented with `outer_action`, `inner_seal`, `stall_type`, `eligible_ops`, and `eligible_containers` fields. The safety governor struct MUST add `hysteresis_band` and `abort_op_mask` fields.

**Gap addressed:** Missing stall type enum, two-stroke operation fields, and extended safety governor fields from dataset.

```c
// ==============================================================================
// FR 2.4.9: STALL TYPES, TWO-STROKE OPS, AND SAFETY GOVERNOR EXTENSION
// ==============================================================================

// 5 stall trigger types from the dataset
typedef enum : uint8_t {
    M4_STALL_NONE           = 0,  // No stall — normal progression
    M4_STALL_MEF_THRESHOLD  = 1,  // MEF level insufficient for next stage
    M4_STALL_SAFETY_GATE    = 2,  // Safety governor blocks advancement
    M4_STALL_CONSENT_PENDING= 3,  // Waiting for explicit user consent
    M4_STALL_TIMING_LOCK    = 4,  // Cosmic clock phase not suitable
    M4_STALL_AROUSAL_HIGH   = 5,  // Arousal exceeds processing capacity
} M4_Stall_Type;

// Two-stroke alchemical operation — outer action + inner seal
typedef struct {
    Alchemical_Op  outer_action;  // The visible operation (calcine, dissolve, etc.)
    Alchemical_Op  inner_seal;    // The interior counterpart operation (subtle twin)
} M4_TwoStroke_Op;

// Eligible operations bitmask: bit N set = Alchemical_Op N is currently eligible
typedef uint8_t M4_Op_Eligibility_Mask;

// Eligible containers bitmask: bit N set = Container N is currently eligible
typedef uint8_t M4_Container_Eligibility_Mask;

// Augmented Cycle Engine — adds two-stroke and stall fields
// NOTE: This augments the existing M4_Cycle_Engine struct; do NOT redefine it.
// The fields below are NEW fields to add at the END of M4_Cycle_Engine:
//   M4_TwoStroke_Op         active_two_stroke;    // Current two-stroke operation
//   M4_Stall_Type           stall_type;           // Active stall reason (NONE = running)
//   M4_Op_Eligibility_Mask  eligible_ops;         // Which ops are currently eligible
//   M4_Container_Eligibility_Mask eligible_containers; // Which containers are eligible

// Safety governor extension
typedef struct {
    uint8_t  arousal_threshold;   // 0-255: operations blocked if current_arousal > this
    uint8_t  hysteresis_band;     // Band around threshold to prevent oscillation
                                  // Gate opens at (threshold - hysteresis_band)
                                  // Gate closes at (threshold + hysteresis_band)
    uint8_t  abort_op_mask;       // Bitmask of operations that trigger immediate abort
    uint8_t  safety_level;        // 0=blocked, 255=clear
    bool     contraindicated;     // Emergency brake
} M4_Safety_Governor;

static inline bool m4_safety_check(const M4_Safety_Governor* gov, uint8_t current_arousal,
                                    Alchemical_Op proposed_op) {
    if (gov->contraindicated) return false;
    if (gov->abort_op_mask & (1u << proposed_op)) return false;
    // Hysteresis: if within band, check if we're opening or closing
    if (current_arousal > gov->arousal_threshold + gov->hysteresis_band) return false;
    return gov->safety_level > 0;
}
```

---

### FR 2.4.10: Typed Structs for #4.5-1 (Voice Config) and #4.5-2 (Transparency Record)

**Requirement:** The C engine MUST provide typed structs `M4_Voice_Config` and `M4_Transparency_Record` for the #4.5-1 (Core Epi-Logos Voice) and #4.5-2 (Method Transparency Lab) nodes respectively. The `M4_Logos_Cycle_State` MUST be extended with `M4_Integration_Mode` and `M4_Interpretation_Mode` enum fields. The Lens Vtable MUST include `mef_threshold` and `onto_layer` fields.

**Gap addressed:** #4.5-1 and #4.5-2 are currently stored as untyped `void*`; missing `M4_Integration_Mode`, `M4_Interpretation_Mode`, and per-lens `mef_threshold`/`onto_layer`.

```c
// ==============================================================================
// FR 2.4.10: TYPED STRUCTS FOR #4.5-1 AND #4.5-2 + LENS VTABLE AUGMENT
// ==============================================================================

// Integration modes for the Logos Cycle Engine (#4.5-5)
typedef enum : uint8_t {
    M4_INTEGRATE_SEQUENTIAL  = 0,  // Step through 0→5 in strict order
    M4_INTEGRATE_RESONANT    = 1,  // Jump to resonant stage based on body state
    M4_INTEGRATE_HOLOGRAPHIC = 2,  // All stages simultaneously (implicate mode)
} M4_Integration_Mode;

// Interpretation modes for oracle/divination outputs
typedef enum : uint8_t {
    M4_INTERPRET_LITERAL     = 0,  // Face value — direct symbolic reading
    M4_INTERPRET_FUNCTIONAL  = 1,  // Operational — what does this enable?
    M4_INTERPRET_ARCHETYPAL  = 2,  // Pattern — what universal pattern does this reflect?
    M4_INTERPRET_INTEGRAL    = 3,  // Synthesis — how does this unify with session so far?
} M4_Interpretation_Mode;

// #4.5-1: Core Epi-Logos Voice Config — in .rodata (voice is immutable per session)
typedef struct {
    uint8_t tone_register;          // 0=formal, 1=conversational, 2=contemplative
    uint8_t epistemic_humility;     // 0-255: how strongly to qualify assertions
    uint8_t poetic_density;         // 0-255: metaphor frequency
    uint8_t logos_stage_default;    // Default starting logos stage (0-5)
    bool    uses_greek_etymologies; // Include etymological depth in responses?
    bool    uses_sanskrit_roots;    // Include Sanskrit technical terms?
    uint8_t _pad[2];                // alignment
} M4_Voice_Config;

_Static_assert(sizeof(M4_Voice_Config) == 8, "M4_Voice_Config must be 8 bytes");

// #4.5-2: Transparency Record — heap-allocated (accumulates during session)
typedef struct {
    uint8_t  record_count;          // Number of transparency entries logged
    uint8_t  active_logos_stage;    // Logos stage at time of last log entry
    uint8_t  active_lens;           // Lens active at time of last log entry
    uint8_t  flags;                 // Bit 0: reasoning shown; Bit 1: alternatives shown
    uint64_t session_checksum;      // Rolling checksum of all transparency entries
    void*    entry_buffer;          // Heap buffer of transparency entries
} M4_Transparency_Record;

// Lens Vtable augmentation — adds MEF threshold and ontological layer
// NOTE: These fields are added to the END of the existing M4_Lens_Vtable struct:
//   uint8_t mef_threshold;         // Min MEF level required to activate this lens
//   uint8_t onto_layer;            // Ontological layer (0=literal, 5=integral)
//   uint8_t _pad_lens[2];          // alignment

// MEF threshold values per lens (L0-L5)
static const uint8_t M4_LENS_MEF_THRESHOLD[6] = {
    20u,   // L0 Literal       — low threshold (accessible without MEF calibration)
    40u,   // L1 Functional    — requires basic MEF grounding
    60u,   // L2 Structural    — requires structural MEF competence
    80u,   // L3 Archetypal    — requires advanced MEF sensitivity
    100u,  // L4 Paradigmatic  — requires meta-epistemic awareness
    120u,  // L5 Integral      — requires full MEF integration
};

// Canonical tag fields for divinatory output (#4.2 → #4.1 → #4.3 bridge)
// These augment M4_Canonical_Tag with body, lens, and operation dimensions.
typedef struct {
    uint8_t  element;       // Element_Id (0-4: Fire/Earth/Air/Water/Akasha)
    uint8_t  lens;          // L-family index 0-5 (framing perspective)
    uint8_t  operation;     // Alchemical operation index
    uint8_t  organ;         // Body organ correspondence (0xFF if none)
    uint8_t  body_zone;     // Body zone (0xFF if none)
    uint8_t  _pad[3];       // alignment to 8 bytes
} M4_Canonical_Tag_Extended;

_Static_assert(sizeof(M4_Canonical_Tag_Extended) == 8,
    "M4_Canonical_Tag_Extended must be 8 bytes");
```

---

### Logos Cycle Naming Correction

**Two Distinct Layers — Both Valid:**

| Layer | Names | Source | Usage |
|-------|-------|--------|-------|
| **Raw QL Assignations** | Ground / Definition / Operation / Pattern / Context / Integration | CLAUDE.md (#0-#5 raw archetype positions) | Position descriptions in spec tables |
| **Actual Logos Cycle** | A-logos / Pro-logos / Dia-logos / Logos / Epi-logos / An-a-logos | M5 FR 2.5.5 (#5-5 Logos Cycle FSM) | `LogosStage` enum in C code |

The Logos Cycle belongs to M5 (#5-5). M4 **borrows** the Logos Cycle as its operational protocol (M4's transformation engine runs on the same 6 stages). The `LogosStage` enum from M5 IS the correct type for M4's position field.

```c
// CORRECTION: M4_Logos_Cycle_State.position MUST use LogosStage enum, not uint8_t
// Replace:  uint8_t position;     // 0-5 (current QL position)
// With:     LogosStage position;   // 0-5 (current Logos stage — A-logos through An-a-logos)

// The "Ground/Definition/.../Integration" labels in spec tables are the QL positional
// assignations — they describe WHAT each position IS. They are NOT enum values.
// The LogosStage enum (ALOGOS=0 through ANALOGOS=5) is the C-code representation.
// Both layers are correct; they describe the same 6 positions from different angles.

// This makes the naming consistent with FR 2.5.5 (M5 Logos Cycle) and
// FR 2.1.4 (M1 M5_Logos_Cycle FSM) across all specs.
```

---

*Patch Version:* 1.0
*Applied:* 2026-03-05 by Cross-M Harmonisation Agent
*Addresses:* FR 2.4.8, FR 2.4.9, FR 2.4.10, Logos Cycle Naming Correction

---

## SPEC PATCH — Temporal Now, BLAKE3 Quintessence, Oracle Primitives (2026-03-06)

**Source:** M4 Design Session — Deep dataset analysis + architectural integration
**Design Doc:** `docs/plans/2026-03-06-m4-nara-design.md`

---

### FR 2.4.11: M4_Temporal_Now — The Lived Moment

**Requirement:** The C engine MUST provide an `M4_Temporal_Now` struct that composes the `Unified_Clock_State` (M1/M2/M3 concentric rings) with the source degree, a chronological timestamp, and 7 planetary operator slots preempting real-time astrological data from the S4' agent layer (Kerykeion). The struct MUST function in three temporal modes: natal (birth moment), real-time (current moment), and kairotic (oracle consultation moment). All M4 operations that require temporal context MUST use `m4_snapshot_now()` rather than ad-hoc degree arithmetic.

**Gap addressed:** `read_cosmic_clock(degree)` is defined but the degree source, planetary operator preemption, and temporal mode semantics are unspecified.

```c
// ==============================================================================
// FR 2.4.11: M4_Temporal_Now — The Lived Moment
// ==============================================================================
//
// The "Now" integrates:
//   M1 heartbeat (12 Torus stages, 30 deg each) — the PULSE
//   M2 body (36 Decans + planets + chakras + elements) — the ORGANS
//   M3 face (64 Hexagrams around 360 deg) — the DISPLAY
//   M4 lived synthesis — the person experiencing all three
//
// Kerykeion (Python astrological library) is NOT a C dependency.
// It populates planet_degrees[] via S4' agent layer when available.
// planet_valid bitmask tracks which planets have real data.
// All operations work at 0 planets (degree-only mode).

typedef struct {
    Unified_Clock_State clock;          // M1/M2/M3 concentric state (from m0.h)
    uint16_t            degree;         // 0-719 (SU(2) double cover)
    uint32_t            chronos_epoch;  // Unix seconds — sequential time (Chronos)
                                        // Kairos = the degree itself: qualitative
                                        // temporal opening, not "what second" but
                                        // "what cosmic position"

    // Planetary operator slots — preempting Kerykeion at S4'
    // When S4' agent fills these, planets become live operators
    // acting on the M3 wheel as the clock's "bodies" (solar system clock)
    uint16_t planet_degrees[7];         // Sun/Moon/Merc/Venus/Mars/Jup/Sat
                                        // Each 0-719 (SU(2) double cover)
    uint8_t  planet_valid;              // Bitmask: bit N = planet N has real data
                                        // 0x00 = stub mode (degree-only clock)
                                        // 0x7F = all 7 populated by Kerykeion
} M4_Temporal_Now;

// Three temporal modes (same struct, different degree source):
//   Natal:     degree = user's sun_degree_anchor from birth data
//   Real-time: degree from current time → wheel position mapping
//   Kairotic:  degree at moment of oracle consultation (the pregnant moment)

static inline M4_Temporal_Now m4_snapshot_now(uint16_t degree, uint32_t epoch) {
    M4_Temporal_Now now;
    now.clock = m0_read_cosmic_clock(degree);
    now.degree = degree;
    now.chronos_epoch = epoch;
    memset(now.planet_degrees, 0, sizeof(now.planet_degrees));
    now.planet_valid = 0x00;  // Stub until S4' populates
    return now;
}
```

---

### FR 2.4.12: BLAKE3 Quintessence as Archetypal Synthesis

**Requirement:** The BLAKE3 hash in `m4_identity_compute()` MUST be understood and implemented as the **archetypal coordinate address** — the #4.0-5 (Integration/Quintessence) position that synthesizes the 5 prior identity layers into a single operable position in universal space. It is not merely a privacy mechanism. The hash participates in the Mobius return (`quintessence_hash ^= wisdom_delta`) and feeds into `M4_Personal_Pratibimba.synthesizedSignature`. BLAKE3 MUST be vendored as a single-file C dependency.

**Gap addressed:** Spec frames BLAKE3 as privacy hashing. Dataset `f_stateProperties` reveals `synthesizedSignature` as operational field in the Pratibimba, and the quintessence hash is the user's position in universal space.

```c
// ==============================================================================
// FR 2.4.12: BLAKE3 Quintessence — Archetypal Synthesis Hash
// ==============================================================================
//
// Vendored dependency: vendor/blake3/ (blake3.h, blake3.c, blake3_dispatch.c,
//   blake3_portable.c) from https://github.com/BLAKE3-team/BLAKE3/tree/master/c
//
// The quintessence hash IS the user's archetypal address:
//   #4.0-0 Birthdate      → numerological_key
//   #4.0-1 Natal Chart    → sun/moon_degree_anchor (0-719)
//   #4.0-2 Jungian Type   → nucleotide_balance (A/T/C/G weights)
//   #4.0-3 Gene Keys      → M3 bitboard mask (uint64_t)
//   #4.0-4 Human Design   → stub
//          ↓ ALL bytes fed to BLAKE3
//   #4.0-5 → blake3_hasher_finalize(8 bytes) → uint64_t quintessence_hash
//          ↓ memset(input, 0) — raw data destroyed immediately
//
// The hash then:
//   1. Becomes the user's "coordinate" in M3's universal space
//   2. Feeds into M4_Personal_Pratibimba.synthesizedSignature
//   3. Participates in Mobius return: quintessence_hash ^= wisdom_delta
//   4. Never leaves the C engine — compute-once, never transmitted
//
// ARCHITECTURAL NOTE: The hash is NOT a lookup key. It is the SYNTHESIS
// of the identity — the #5-position (Integration) of the #4.0 sub-branch.
// Just as Psychoid_5.c points back to Psychoid_0 (Mobius return), the
// quintessence hash cycles back into identity via wisdom_delta XOR.
```

---

### FR 2.4.13: Oracle Casting Primitives

**Requirement:** The C engine MUST provide leaf-level casting functions for I-Ching and Tarot oracles using true random generation (`arc4random_buf()` on macOS, `getrandom()` on Linux). Each casting operation MUST be consent-gated (one consent per invocation, auto-reset after use). Every oracle emission MUST produce an `M4_Canonical_Tag` containing the nucleotide correspondence (via Elemental Throughline FR 2.4.7) and the degree at the moment of casting (the Kairotic moment, captured via `m4_snapshot_now()`).

**Gap addressed:** Spec defines vtable dispatch and magic-number type safety but lacks the leaf casting functions, true random source, and canonical tag emission format that bridges oracle output to medicine (#4.1) and transformation (#4.3).

```c
// ==============================================================================
// FR 2.4.13: Oracle Casting Primitives
// ==============================================================================

// ─── TRUE RANDOM SOURCE ─────────────────────────────────────────────────
// arc4random_buf() on macOS/BSD — cryptographic quality, no seeding,
// no PRNG state to manage. Sacred randomness as portal, not noise.

typedef struct {
    bool     consent_granted;   // User MUST consent per invocation
    uint64_t session_nonce;     // Unique per-session (prevents replay)
} M4_Sacred_Random;

// Consent-gated random fill. Returns false if consent not granted.
// Consent auto-resets after each successful invocation.
static inline bool m4_sacred_random(M4_Sacred_Random* rng,
                                     void* buf, size_t len) {
    if (!rng->consent_granted) return false;
    arc4random_buf(buf, len);
    rng->consent_granted = false;  // Must re-consent for next invocation
    return true;
}

// ─── I-CHING CASTING ────────────────────────────────────────────────────
// Three-coin method: 3 coins per line, 6 lines per hexagram.
// Line values: 6 (old yin), 7 (young yin), 8 (young yang), 9 (old yang)
// These ARE M3's NUCLEOTIDE_ICHING_VALUE[4] = {6, 9, 7, 8}:
//   6 = A (Yin Moving),  9 = T (Yang Moving)
//   7 = C (Yin Resting), 8 = G (Yang Resting)

typedef struct {
    uint8_t  lines[6];          // Line values (6/7/8/9), bottom to top
    uint8_t  hexagram_id;       // 6-bit: resulting hexagram (0-63)
    uint8_t  changing_mask;     // 6-bit: which lines are changing (6 or 9)
    uint8_t  result_hexagram;   // Hexagram after changes applied
    uint16_t cast_degree;       // Kairotic moment via m4_snapshot_now()
} M4_IChing_Cast;

// ─── TAROT DRAW ─────────────────────────────────────────────────────────
// Fisher-Yates shuffle on 78-card deck, draw top N.
// 22 Major Arcana + 56 Minor Arcana (mapped to M3 codons via FR 2.3.16)

typedef struct {
    uint8_t  cards[78];         // Full deck (Fisher-Yates shuffled)
    uint8_t  drawn[12];         // Drawn cards (max spread size)
    uint8_t  draw_count;        // How many drawn
    uint8_t  spread_type;       // Spread ID (0=3-card, 1=Celtic Cross, etc.)
    uint16_t cast_degree;       // Kairotic moment
} M4_Tarot_Draw;

// ─── CANONICAL TAG ──────────────────────────────────────────────────────
// Universal emission format. Every oracle output produces one or more tags.
// Tags bridge: oracle (#4.2) → medicine (#4.1) → transformation (#4.3)
// Nucleotide assignment follows Elemental Throughline (FR 2.4.7).

typedef struct {
    uint16_t tag_id;            // Universal symbol identifier
    uint8_t  tradition;         // 0=Tarot, 1=I-Ching, 2=custom
    uint8_t  nucleotide;        // M3_NUC_A/T/C/G via Elemental Throughline
    uint8_t  element;           // Element_Id (Fire/Earth/Air/Water/Akasha)
    uint16_t degree;            // Position on M3 wheel (0-719)
} M4_Canonical_Tag;
```

---

*Patch Version:* 2.0
*Applied:* 2026-03-06 by M4 Design Session
*Addresses:* FR 2.4.11 (Temporal Now), FR 2.4.12 (BLAKE3 Quintessence), FR 2.4.13 (Oracle Primitives)
*Design Doc:* `docs/plans/2026-03-06-m4-nara-design.md`
