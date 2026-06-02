# M4 Epistemic Map → C Memory Architecture
## Nara → Dispatch Architecture / Personal State Layer

**Status:** Canonical Specification
**Date:** 2026-03-02
**Coordinate:** #4 — Subsystem 4: Oracle Interface Between Personal and Universal Domains

---

## I. C Architecture Enforcement

**Numerical nature:** 4+2 torus, 12-storey x 3 decans = 36 recipe cards, 24-stroke traversal, 6-lens vtable

M4's 6-lens vtable IS the system's dispatch mechanism:

```c
typedef struct {
    int (*translate)(Lens_ID, const char*, const char*, char*, size_t);
    int (*activate)(Lens_ID, M4_Phenom_State*);
    int (*deactivate)(Lens_ID, M4_Phenom_State*);
} Lens_Vtable;

extern const Lens_Vtable M4_LENS_REGISTRY[6];  // .rodata, indexed by Lens_ID
```

**Design Rules:**
- All dispatch = indexed `vtable[6]` — never switch/case
- All personal/mutable state = heap (the PCO / Personal Context Overlay)
- Identity data computed once and cached
- All cycle indices = `uint8_t` (fits single byte, atomic load)
- MEF threshold gates activation: `if (mef < threshold) return -EPERM;`
- The 12-storey × 3-decan = 36 recipe cards → `Decan_Recipe_Card[12][3]`
- The 24-stroke traversal → `uint8_t stroke24 ∈ [0,23]`
- Jung_Complex[] = heap array with `charge: float` and `autonomy: float` = the only floats in the hot path

---

## II. Complete Branch Structure

### Root: #4 — Nara

**Primary Designation:** Oracle Interface Between Personal and Universal Domains

**Core Nature:** Dialogical interface facilitating sacred conversation between universal archetypal patterns and particular manifestation. Functions as unified Siva-Shakti field of Psycho-Physis/Time-Space where individual self awakens through compassionate sensitivity to origins.

---

## III. Branch Tabulation

```
#4 (NARA — Personal Dialogical Interface)
├── #4.0 (Mahamaya Identity Matrix)
│   ├── #4.0-0 (Birthdate Encoding — Numerological)
│   ├── #4.0-1 (Astrological Chart — Celestial Blueprint)
│   ├── #4.0-2 (Jungian Assessment — Functions/Archetypes)
│   ├── #4.0-3 (Gene Keys Profile — Genetic Wisdom)
│   ├── #4.0-4 (Human Design Profile — Energetic Blueprint)
│   └── #4.0-5 (Archetypal Quintessence — Synthesis)
├── #4.1 (Sympathetic Medicine)
│   ├── #4.1-0 (Elemental Ground — 4/5 Elements)
│   ├── #4.1-1 (Energy-Body Architecture — Subtle Anatomy)
│   ├── #4.1-2 (Materia & Reagents — Pharmacopeia)
│   ├── #4.1-3 (Operations & Techne — Alchemical Verbs)
│   ├── #4.1-4 (Temporal Astrological Intelligence)
│   └── #4.1-5 (Integration, Safety & Feedback)
├── #4.2 (Divinatory Frameworks)
│   ├── #4.2-0 (Common Substrate — Symbol Ontology)
│   ├── #4.2-1 (Tarot Engines — Multi-Traditional)
│   ├── #4.2-2 (I-Ching Integration — Oracular)
│   ├── #4.2-3 (Casting & Randomness — Sacred Portal)
│   ├── #4.2-4 (Interpretation Layer — Commentary)
│   └── #4.2-5 (Divinatory Hygiene & Pedagogy)
├── #4.3 (Mediating Transformation)
│   ├── #4.3-0 (Cycle Engine — QL mod-6 → 12/24)
│   ├── #4.3-1 (Operational Grammar — Alchemy)
│   ├── #4.3-2 (Dialogical & Inquiry Containers)
│   ├── #4.3-3 (Control/Chaos & Safety)
│   ├── #4.3-4 (Protocol Library — Storey Packets)
│   └── #4.3-5 (Telemetry & Phase History)
├── #4.4 (Context & Lenses)
│   ├── #4.4.0 (Gebser Lens)
│   ├── #4.4.1 (Ontological Lens)
│   ├── #4.4.2 (Epistemological Lens)
│   ├── #4.4.3 (Jungian Depth Psychology Lens)
│   │   ├── #4.4.3-0 (Archetypal Foundation)
│   │   │   ├── #4.4.3-0-0 (Jung-Freud Relation)
│   │   │   ├── #4.4.3-0-1 (Collective Unconscious)
│   │   │   ├── #4.4.3-0-2 (Psychoid Numbers)
│   │   │   ├── #4.4.3-0-3 (Archetypes-as-Such)
│   │   │   ├── #4.4.3-0-4 (Instincts)
│   │   │   └── #4.4.3-0-5 (Jung Personal Synthesis)
│   │   ├── #4.4.3-1 (Psychological Typology)
│   │   │   ├── #4.4.3-1-0 (Introversion)
│   │   │   ├── #4.4.3-1-1 (Thinking Function)
│   │   │   ├── #4.4.3-1-2 (Feeling Function)
│   │   │   ├── #4.4.3-1-3 (Sensation Function)
│   │   │   ├── #4.4.3-1-4 (Intuition Function)
│   │   │   └── #4.4.3-1-5 (Extraversion)
│   │   ├── #4.4.3-2 (Psychodynamics & Synchronicity)
│   │   ├── #4.4.3-3 (Alchemical Transformation)
│   │   │   ├── #4.4.3-3-0 (Prima Materia)
│   │   │   ├── #4.4.3-3-1 (Nigredo — Blackening)
│   │   │   ├── #4.4.3-3-2 (Albedo — Whitening)
│   │   │   ├── #4.4.3-3-3 (Citrinitas — Yellowing)
│   │   │   ├── #4.4.3-3-4 (Rubedo — Reddening)
│   │   │   └── #4.4.3-3-5 (Transcendent Function)
│   │   ├── #4.4.3-4 (Self-Expression / Telos)
│   │   └── #4.4.3-5 (Transcendent Integration / Gnosis)
│   ├── #4.4.4 (Phenomenological Lens)
│   │   ├── #4.4.4.0 (Pre-Categorical Ground)
│   │   ├── #4.4.4.1 (Primordial Differentiation)
│   │   ├── #4.4.4.2 (Temporal Sedimentation)
│   │   ├── #4.4.4.3 (Symbolic Body / Institution)
│   │   ├── #4.4.4.4 (Personal Pratibimba — Lived Integration Hub)
│   │   └── #4.4.4.5 (Pratyabhijna — Soteriological Recognition)
│   └── #4.4.5 (Trika/Kashmir Saivism Lens)
└── #4.5 (Epii Integration)
    ├── #4.5-0 (Curriculum Map)
    ├── #4.5-1 (Core Epi-Logos Voice)
    ├── #4.5-2 (Method Transparency Lab)
    ├── #4.5-3 (Integration Lab)
    ├── #4.5-4 (Pedagogy Lab)
    └── #4.5-5 (Logos Cycle Engine)
```

**Total Coordinates:** ~73 nodes (6 depth levels)

---

## IV. Detailed Coordinate Map

### #4.0 — Mahamaya Identity Matrix → Cached Computation

| Coordinate | System | Input | C Pattern |
|------------|--------|-------|-----------|
| **#4.0-0** | Birthdate Encoding | Date → numerological values | `compute_once(); cache();` — identity constant |
| **#4.0-1** | Astrological Chart | Date/time/location → natal chart | Pre-computed celestial blueprint in heap |
| **#4.0-2** | Jungian Assessment | MBTI × 4 elements | `uint8_t type_id;` — 4-bit MBTI + element |
| **#4.0-3** | Gene Keys Profile | I-Ching activation patterns | Bitboard subset of M3's `uint64_t` |
| **#4.0-4** | Human Design | Multi-system synthesis | Composite struct referencing all above |
| **#4.0-5** | Archetypal Quintessence | Synthesis of 0-4 | `identity_hash()` — computed once, cached |

**Rule:** Identity data computed once per session, then becomes effectively `const`. Never recomputed on the hot path.

### #4.1 — Sympathetic Medicine → Heap Personal State

| Coordinate | Domain | C Pattern |
|------------|--------|-----------|
| **#4.1-0** | Elemental Ground | `uint8_t element_balance[5];` — 4/5 element system |
| **#4.1-1** | Energy-Body | `Nadi_State nadis[]; Chakra_State chakras[7];` — heap |
| **#4.1-2** | Materia & Reagents | `Materia_Entry pharmacopeia[];` — heap LUT |
| **#4.1-3** | Operations (Alchemy) | Function pointers: `op_calcine(), op_dissolve()...` |
| **#4.1-4** | Temporal Intelligence | Real-time cosmic timing: `uint8_t planetary_hour;` |
| **#4.1-5** | Safety & Feedback | `Contraindication_Check safety_gate();` — guardrail |

### #4.2 — Divinatory Frameworks → Dispatch via Vtable

| Coordinate | Framework | C Pattern |
|------------|-----------|-----------|
| **#4.2-0** | Common Substrate | `Symbol_Ontology` — universal translation layer |
| **#4.2-1** | Tarot Engines | `Tarot_Vtable[N_TRADITIONS]` — multi-tradition dispatch |
| **#4.2-2** | I-Ching Integration | `IChing_Vtable` — casting + transformation tracking |
| **#4.2-3** | Casting & Randomness | `sacred_random()` — consent-gated RNG |
| **#4.2-4** | Interpretation Layer | `Interpreter_Vtable` — rule-based + generative |
| **#4.2-5** | Hygiene & Pedagogy | `bias_check(); education_support();` |

**All dispatch is vtable-indexed.** No switch/case anywhere in M4.

### #4.3 — Mediating Transformation → Two-Stroke Engine

| Coordinate | Component | C Pattern |
|------------|-----------|-----------|
| **#4.3-0** | Cycle Engine | `uint8_t storey; uint8_t stroke;` — mod-12/mod-24 |
| **#4.3-1** | Operational Grammar | `AlchemicalOp ops[7];` — 7 canonical verbs |
| **#4.3-2** | Dialogical Containers | `DialogContainer* container;` — process mediators |
| **#4.3-3** | Control/Chaos & Safety | `threshold_gate(arousal, limit);` — dynamic safety |
| **#4.3-4** | Protocol Library | `Decan_Recipe_Card recipe[12][3];` — 36 storey packets |
| **#4.3-5** | Telemetry | `Phase_History log[];` — transformation tracking |

```c
// The 12-storey × 3-decan recipe card system
typedef struct {
    uint8_t storey;        // 0-11 (mod-12)
    uint8_t decan;         // 0-2 (trinitarian sub-position)
    AlchemicalOp* ops;     // operation sequence
    Timing_Gate* timing;   // astrological window
    Somatic_Support* body; // embodied support
} Decan_Recipe_Card;

Decan_Recipe_Card protocol_library[12][3];  // 36 total recipes

// 24-stroke traversal counter
uint8_t stroke24;  // 0-23, atomic load
```

### #4.4 — Context & Lenses → The 6-Lens Vtable

| Coordinate | Lens | Interpretation Domain | Vtable Index |
|------------|------|-----------------------|-------------|
| **#4.4.0** | Gebser | Consciousness structures | `M4_LENS_REGISTRY[0]` |
| **#4.4.1** | Ontological | Being frameworks | `M4_LENS_REGISTRY[1]` |
| **#4.4.2** | Epistemological | Ways of knowing | `M4_LENS_REGISTRY[2]` |
| **#4.4.3** | Jungian Depth | Archetypes/individuation | `M4_LENS_REGISTRY[3]` |
| **#4.4.4** | Phenomenological | First-person experience | `M4_LENS_REGISTRY[4]` |
| **#4.4.5** | Trika/KS | Tantric alchemical | `M4_LENS_REGISTRY[5]` |

```c
// THE dispatch mechanism — no switch/case, ever
extern const Lens_Vtable M4_LENS_REGISTRY[6];  // .rodata

// Usage:
int result = M4_LENS_REGISTRY[lens_id].translate(
    lens_id, input, context, output, output_size
);
```

### #4.4.3 — Jungian Depth Psychology (Deep Nesting)

| Branch | Coordinate | Domain | C Pattern |
|--------|------------|--------|-----------|
| **Foundation** | #4.4.3-0 | Collective Unconscious, Psychoid Numbers, Archetypes | `.rodata` constants — the psychic bedrock |
| **Typology** | #4.4.3-1 | 4 Functions + 2 Attitudes | `uint8_t type = (attitude << 2) \| function;` |
| **Psychodynamics** | #4.4.3-2 | Libido, Compensation, Synchronicity | `Jung_Complex[] { float charge; float autonomy; }` — the only floats |
| **Alchemy** | #4.4.3-3 | Prima Materia → Nigredo → Albedo → Citrinitas → Rubedo → Transcendent Function | State machine: `enum AlchemicalStage { PRIMA, NIGREDO, ALBEDO, CITRINITAS, RUBEDO, TRANSCENDENT };` |
| **Self** | #4.4.3-4 | Telos — wholeness as goal | `Self_State { bool individuated; }` |
| **Transcendent** | #4.4.3-5 | Psychology → theology | Bridge to #4.4.5 (Trika lens) |

### #4.4.4 — Phenomenological Lens (Institution-Constitution-Lifeworld)

| Coordinate | Layer | Husserlian | C Pattern |
|------------|-------|-----------|-----------|
| **#4.4.4.0** | Pre-Categorical | Groundless ground | `void* pre_predicative;` — typeless |
| **#4.4.4.1** | Primordial Differentiation | Urstiftung | First type assignment |
| **#4.4.4.2** | Temporal Sedimentation | Sedimentierung | Cache/memoization pattern |
| **#4.4.4.3** | Symbolic Body | Institution | Established struct definitions |
| **#4.4.4.4** | Personal Pratibimba | Lifeworld | **Integration hub — 18+ incoming relationships** |
| **#4.4.4.5** | Pratyabhijna | Recognition | `pratyabhijna()` — seeing what always was |

**#4.4.4.4 (Personal Pratibimba)** is the phenomenological convergence point where all layers meet in the living individual. It has the highest relationship density in the entire #4 branch.

### #4.5 — Epii Integration → Recursive Synthesis

| Coordinate | Function | C Pattern |
|------------|----------|-----------|
| **#4.5-0** | Curriculum Map | Dynamic learning curation based on identity |
| **#4.5-1** | Epi-Logos Voice | Style guide — consistent communication |
| **#4.5-2** | Method Transparency | Process documentation generator |
| **#4.5-3** | Integration Lab | Cross-system synthesis engine |
| **#4.5-4** | Pedagogy Lab | Learning design based on readiness |
| **#4.5-5** | Logos Cycle Engine | Executes complete 0→5 cycle on each case |

---

## V. PCO (Personal Context Overlay) — The Shakti Half

Everything in M4 that is user-specific, session-mutable, and privacy-sensitive lives on the heap:

```c
typedef struct {
    // Identity (computed once, cached)
    Identity_Matrix identity;       // #4.0
    uint64_t identity_hash;         // privacy: hashed, never raw

    // Health state (mutable)
    Sympathetic_State health;       // #4.1

    // Divination history (mutable)
    Divination_Log divination[];    // #4.2

    // Transformation state (mutable)
    uint8_t current_storey;         // #4.3 — mod-12
    uint8_t current_stroke;         // #4.3 — mod-24
    Decan_Recipe_Card* active_recipe;

    // Psychological complexes (THE ONLY FLOATS)
    Jung_Complex complexes[];       // charge: float, autonomy: float

    // Phase history (append-only)
    Phase_History history[];        // #4.3-5

    // MEF threshold (gates all activation)
    uint8_t mef_level;              // if < threshold → -EPERM
} M4_PersonalContextOverlay;  // ALL heap-allocated
```

---

## VI. Operational Flow

```
#4.0 (Identity: computed once, cached — effectively const)
  ↓ provides context to
#4.1 (Medicine: heap personal state — what the body needs)
  ↓ informs
#4.2 (Divination: vtable dispatch — how to receive guidance)
  ↓ feeds into
#4.3 (Transformation: 12-storey × 3-decan × 24-stroke engine)
  ↓ interpreted through
#4.4 (Lenses: vtable[6] dispatch — making sense of transformation)
  ↓ synthesized by
#4.5 (Epii Integration: Logos Cycle 0→5 on each episode)
  ↓ Möbius return to
#4.0 (Updated identity for next session)
```

---

*"All dispatch = indexed vtable[6]. All personal/mutable state = heap. Identity data computed once and cached. All cycle indices = uint8_t. MEF threshold gates activation."*
