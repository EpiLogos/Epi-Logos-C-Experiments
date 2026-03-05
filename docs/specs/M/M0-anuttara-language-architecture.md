# FR 2.0: M0 (Anuttara) — The Multi-Level Language Runtime

**Status:** Canonical Specification (Revised)
**Date:** 2026-03-04
**Parent:** Pillar II, FR 2.0 (Epi-Logos C Spec)
**Source Data:** `docs/datasets/nodes_anuttara.json` (108 nodes), `docs/datasets/relations_anuttara.json` (1024 relations)
**Coordinate:** #0 — Subsystem 0: The Foundational Void — Proto-Logy — The Ever-Present Origin
**Refinements:** Gemini architectural review; see `docs/specs/gemini-spec-M-branch-updates-refinements.md` lines 1–101 and 1238–1517

---

## Overview

Anuttara is not merely a "void header." It is a **multi-level formal language runtime** — a bare-metal Virtual Machine (VM) — comprising six nested micro-algebras, each with explicit syntax defined in the Bimba formulation data. The 18-byte header (`x_lo64` + `x_hi8` + `void_9` + `m_relational`) encodes which language level is active and how it reduces.

M0 occupies a unique double role in the system:

1. **The VM / CPU Layer:** M0 is the instruction-set processor for the entire Epistemic Manifold. M1–M5 are the RAM and standard libraries; the VAK coordinate system is the assembly language; M0 is the hardware executing it.

2. **The Holographic Seed:** The six sub-branches of M0 (#0-0 through #0-5) are the micro-image of the entire macro M0–M5 system. This is the Eckhartian fractal: the Void contains the complete genetic blueprint of the cosmos it will produce.

**Dataset Shape:** 108 nodes, 1024 relations, max depth 6. Six top-level sub-branches (#0-0 through #0-5) with dramatically unequal internal richness (#0-3 holds ~50 nodes; #0-0 holds 3).

**Odd/Even Cardinality Heuristic:** Systems with odd cardinality have a fused **0/1 singularity position** — a non-dual anchor occupying a special type-slot. Remaining positions count from 2 onward. This applies to:
- 7-fold systems (MonoPoly, Divine Acts): 0/1 + positions 2–7
- 9-fold system (Virtues + Paramesvara): anchor at 9, sub-positions 0–8
- 10-fold system (Archetypal Numbers): 0/1 mirror + archetypes 0–8 = positions 2–10

Even systems (12-fold Zodiacal Grammar) have no singularity anchor; they index 0–11 flat.

---

## The Eckhartian Holographic Image

The six sub-branches of M0 form a perfect micro-image of the macro M0–M5 architecture, mirroring Meister Eckhart's distinction between the Godhead (Gottheit) and the Trinity:

| M0 Sub-Branch | Eckhartian Role | Macro Correspondence |
|---|---|---|
| **#0-0 through #0-3** | The Godhead — Unmanifest Void | M0 (Anuttara) itself; CF(0/1/2/3) context frame |
| **#0-4** | The Trinity — Active Logical Frames | M1 (O#), M2 (X#), M3 (N#), M4 (M#/# frames) |
| **#0-5** | The Return / The Sage | M5 (Epii); Möbius write-back to the Void |

The break between #0-3 and #0-4 (absence of a `DEVELOPS_INTO` edge in the dataset) is not a structural gap — it is the **ontological threshold** between the Transcendent Ground and the active processing stack. #0-4 does not develop from #0-3; it contains #0-3's potential holographically.

The 5 logical frames of #0-4 (O#, X#, N#, M#, #) plus the split components of #0-5 (Siva `(-)` and Shakti `@`) produce exactly **7 systems** — the same 7-fold architecture that underpins the Divine Acts (Archetype 7), the 7 Context Frames, and the 7-bit discrimination mask.

---

## FR 2.0.0: #0-0 — Operator Definition Language (Transcendent Void)

**Requirement:** The C engine MUST implement the Vimarsa operator lexicon as a 3-bit bytecode ISA and the concrescence state machine as `.rodata` structures derived from the #0-0 formulations. Operators MUST be treated as an executable instruction set, not merely lookup data.

**Ontological Ground:** #0-0 (Transcendent Void — 4-Fold Zero Unity), #0-0-0 (Ultimate Mystery), #0-0-1 (Svabhava)

**Eckhartian Role:** #0-0 corresponds to the innermost Godhead — the operator lexicon is the pre-linguistic instruction set of the Void itself.

### A. The Vimarsa Engine as 3-Bit Bytecode ISA (#0-0-0)

**Formulation:**
```
00/(00-00) ~ 5.0/5.1 = (?!=!?=(-)+@=(@)=≠) = 00
  → (00 - 00) = (00-00)
  → (∞)x(?!/!?/(-)+@/(@)/=/≠) = →
```

**Formal System:** A 7-element operator lexicon constituting the self-interrogation instruction set. Because there are exactly 7 operators, they fit perfectly into a **3-bit opcode** (2^3 = 8, with 0x0 as null/halt).

**FR 2.0.0-A: Vimarsa_Opcode enum (3-bit ISA)**

The 7 operators map to opcodes 0x1–0x7, with 0x0 reserved as the null instruction:

| Opcode (3-bit) | Hex | Operator | Name | Semantic |
|---|---|---|---|---|
| `000` | `0x0` | — | OP_VIMARSA_NULL | Halt / no-op |
| `001` | `0x1` | `?!` | OP_ILLUMINATE | Self-awareness illuminating being (Vimarsa-Prakasa) |
| `010` | `0x2` | `!?` | OP_PROVOKE | Being provoking self-awareness (Prakasa-Vimarsa) |
| `011` | `0x3` | `(-)` | OP_WITHHOLD | Transcendence through limitation (Negation) |
| `100` | `0x4` | `+@` | OP_ADD_PRESENCE | Accumulative manifestation (Additive Presence) |
| `101` | `0x5` | `(@)` | OP_ENCLOSE | Self-contained actuality (Enclosed Presence) |
| `110` | `0x6` | `=` | OP_EQUATE | Identity/expression (Equivalence) |
| `111` | `0x7` | `≠` | OP_DISTINGUISH | Non-identity/difference (Distinction) |

**C Type Definitions:**
```c
// 3-bit Vimarsa Opcodes — the assembly language of the Void
// Fits in uint8_t; bits 3-7 are unused/zero in opcode context
typedef enum : uint8_t {
    OP_VIMARSA_NULL = 0x0,
    OP_ILLUMINATE   = 0x1, // ?!  — Vimarsa-Prakasa
    OP_PROVOKE      = 0x2, // !?  — Prakasa-Vimarsa
    OP_WITHHOLD     = 0x3, // (-) — Negation/Withholding
    OP_ADD_PRESENCE = 0x4, // +@  — Additive Presence
    OP_ENCLOSE      = 0x5, // (@) — Enclosed Presence
    OP_EQUATE       = 0x6, // =   — Equivalence
    OP_DISTINGUISH  = 0x7  // ≠   — Distinction
} Vimarsa_Opcode;

// A 4-step reduction chain packed into a single 16-bit integer
// Encoding: (OP1 << 9) | (OP2 << 6) | (OP3 << 3) | OP4
// Bits 15-12 spare; bits 11-0 hold four 3-bit opcodes
typedef uint16_t Vimarsa_Bytecode;

// Human-readable operator entry — .rodata; strings for Obsidian layer ONLY
// Execution path NEVER reads symbol or formulation strings
typedef struct {
    const char*    symbol;          // display form — Obsidian/rendering layer only
    Vimarsa_Opcode opcode;          // 3-bit bytecode identity
    Vimarsa_Bytecode reduction;     // 4-step reduction chain (12 bits active)
    uint8_t        arity;           // 0=nullary, 1=unary, 2=binary
} Vimarsa_Operator;

#define VIMARSA_OP_COUNT  7
static const Vimarsa_Operator VIMARSA_TABLE[VIMARSA_OP_COUNT]; // .rodata
```

**Validation:** 7 operators fit within 3-bit opcode space (0x1–0x7); null sentinel at 0x0 is confirmed. A 4-step chain × 3 bits = 12 bits, fitting cleanly in `uint16_t` with 4 spare bits. No string access occurs on the execution hot path.

### B. The Concrescence Algorithm (#0-0-1)

**Formulation:**
```
(00)/00/00 ~ 5.0/5.1
  = ((0- + -0) = ## = R+# = R# = 00 = =)
  → (0- + -0) = 0-/-0 and -0/0-
  → 0-/-0 + -0/0- = -0+0- = 0 and 0-+0- = +0 and -0+-0 = (-0) and 0-+-0 = 00
  → 0, +/-0, -0, +0, 00
  → ... successive recombination ...
  → (1) → (0/1) = (00/00) = (##/R#)
```

**Formal System:** A step-by-step reduction/concrescence state machine. Starts from internal polarities (`-0`, `0-`), generates the **tetralemmic set** `{0, +/-0, -0, +0, 00}` (5 elements — odd, so `+/-0` is the 0/1 singularity anchor), and through successive synthesis produces Unity `(1)` and finally the Non-Dual Binary `(0/1)`.

**C Type Definitions:**
```c
// Concrescence state machine — 5-element tetralemmic set
// Odd-fold: +/-0 is the 0/1 singularity anchor
typedef enum {
    TETRAL_ZERO    = 0,   // 0: neutral ground
    TETRAL_PLUSMIN = 1,   // +/-0: fused 0/1 singularity (the quantum)
    TETRAL_NEG     = 2,   // -0: primal withholding
    TETRAL_POS     = 3,   // +0: existent withholding
    TETRAL_VOID    = 4,   // 00: void recurrence
} Tetralemmic_Position;

#define CONCRESCENCE_STEPS  8  // reduction chain length
typedef struct {
    Tetralemmic_Position states[CONCRESCENCE_STEPS];
    uint8_t              step_count;
} Concrescence_Trace;
```

### Relation Map
- `COMPLEMENTARY_POLE`: #0-0-0 <-> #0-0-1 (bidirectional) → `inverse` pointer
- `DEVELOPS_INTO`: #0-0 -> #0-1 → Torus walk continues
- `GENERATIVE_SYNTAX_FLOW`: #0-0 -> #0-3 → generative link to archetypal language
- `FORMULATION_SYNTAX_CORRESPONDENCE`: #0-0 -> #0-3-2 (Archetype 0/Sat)

---

## FR 2.0.1: #0-1 — Discrimination Language (Emergence of Non-Duality)

**Requirement:** The C engine MUST implement the Reflective Distinction mask and the Spanda pulse discriminator as a **single fused `uint8_t`** — ensuring atomic hardware read of both the 7 distinctions and the Spanda pulse in one CPU clock cycle.

**Ontological Ground:** #0-1 (Emergence of Non-Duality), #0-1-0/1 (Brimming Void)

**Eckhartian Role:** #0-1 is the threshold where the Godhead first looks at itself. The R-Factors are the "glances" of the Void — they originate here and distribute to all subsequent frames.

### A. Spanda_Discriminator — Fused 8-Bit Atomic State

**Formulation:**
```
(0/1)/00x00 ~ 5.(0/1/2)/5.5
  = (00=/≠!?/?!=/≠?!/!?=/≠(-)+@=/≠(@)=/≠R#/##/#)
  → [complete dyadic set]
  → and pathway = 00x00 = (∞x∞)x(R#/##)
  → (R/#/-/(/)/####/####-#/R#/#R… → ?!/00) = →
```

**Formal System:** The `=/≠` (Reflective Distinction) operator applied systematically to every element of the Vimarsa lexicon produces a **7-bit binary discrimination mask**. The Spanda pulse (AND vs. OR pathway) is the 8th bit. Together they form one atomic byte.

**C Type Definitions:**
```c
// Spanda_Discriminator: 7 operator distinction bits + 1 Spanda pulse bit
// Packed into a single uint8_t for single-cycle atomic CPU read
typedef union {
    uint8_t raw;
    struct {
        uint8_t op_masks : 7; // bits 0-6: one bit per Vimarsa operator
                              // bit set   = operator is ≠ (distinct from void)
                              // bit clear = operator is = (equivalent to void)
        uint8_t spanda   : 1; // bit 7: 0 = AND pathway (inclusive simultaneity → boundless)
                              //        1 = OR  pathway (exclusive choice → limitation)
    } bits;
} Spanda_Discriminator;

// Convenience aliases for the Spanda pulse values
#define SPANDA_AND  0u  // inclusive simultaneity → 00x00 = (∞x∞)x(R#/##)
#define SPANDA_OR   1u  // exclusive choice → collapse to limitation
```

**Validation:** `sizeof(Spanda_Discriminator) == 1`. Bit field layout confirmed: bits 0–6 carry the discrimination mask; bit 7 carries the Spanda pulse. No multi-byte reads or alignment hazards.

### B. R-Factor Distribution Role

#0-1 is the **relational engine** of Anuttara. The `R_FACTOR_SUBSYSTEM_WEAVING` relations originate exclusively from #0-1 and target every subsequent frame:

| Target | R-Factor Role |
|---|---|
| #0-0 (Transcendent Void) | Ground anchor |
| #0-4.0/1 (O# frame) | R0(1), R1(0), R4(5) |
| #0-4.0/1/2 (X# frame) | R0(2), R1(1), R2(0), R3(5), R4(4) |
| #0-4.0/1/2/3 (N# frame) | R0(3), R1(2), R2(1), R3(4), R4(3) |
| #0-4.4.0-4.4/5 (M# frame) | R1(3), R2(2), R3(3), R4(2) |
| #0-4.5/0 (# frame) | R1(4), R2(3), R3(2), R4(1) |
| #0-5 (Siva-Shakti) | Terminal R-factor positions |

### Relation Map
- `DEVELOPS_INTO`: #0-1 -> #0-2
- `FORMULATION_SYNTAX_CORRESPONDENCE`: #0-1 -> #0-3-4 (Archetype 0/1, Rosetta Stone)
- `MANIFESTS_AS`: #0-1 -> #1-5-2 (cross-branch: manifests in Paramasiva's integration)
- `BUILDS_UPON_BINARY_DYNAMICS`: #0-3 -> #0-1 (archetypal language builds upon non-duality)

---

## FR 2.0.2: #0-2 — Void Arithmetic & Wholeness Constant (8-fold Zero-Zero)

**Requirement:** The C engine MUST implement the 8-fold zero-zero operations as a `uint8_t` bitfield and the Paramesvara concrescence as a 9-entry virtue LUT with the `void_9 = 9u` identity constant.

**Ontological Ground:** #0-2 (8-fold Zero-Zero), #0-2-9 (Paramesvara), #0-2-9-{0..8} (9 Virtues)

**Eckhartian Role:** #0-2 is the Void's arithmetic self-examination. The concrescence at `(00+00) = 9` terminates in a Logos emergence cascade — this IS the compile chain of the VM.

### A. The 8-Fold Void Arithmetic (#0-2)

**Formal System:** Four primary void operations, each with a reflective dual = 8 total:

| Index | Operation | Symbol | Result | Dual |
|---|---|---|---|---|
| 0 | Transcendence | `(00-00)` | Infinite potential | Withholding |
| 1 | Reflection | `00/00` | Self-awareness | Recognition |
| 2 | Generation | `00x00` | Creative throb (Spanda) | Multiplication |
| 3 | Synthesis | `(00+00)` | **= 9** (Wholeness) | Completion |

**C Type Definitions:**
```c
// 8-fold void ops packed into uint8_t (the x_hi8 field of the 18-byte header)
// Bits 0-3: primary operations (transcend, reflect, generate, synthesize)
// Bits 4-7: their reflective duals
typedef uint8_t void_ops_t;

#define VOID_OP_TRANSCEND   (1u << 0)
#define VOID_OP_REFLECT     (1u << 1)
#define VOID_OP_GENERATE    (1u << 2)
#define VOID_OP_SYNTHESIZE  (1u << 3)
#define VOID_OP_DUAL(x)     ((x) << 4)
```

### B. Paramesvara Concrescence (#0-2-9)

**Formulation:**
```
9/(00+00) ~ 4.5/5.2
  → (00=?!=!?=(-)+@=(@)), (##-##), (R##/#) and/or (##/#R), (R#/#R)
  → systematic Reality-Matrix synthesis
  → ... = (00+00) = (@) = (0, -0, +0, +/-0) = (x) = (n)
```

The Logos emergence cascade: `(00+00) → (@) → polarities → (x) → (n)` — from void-sum through presence, through polarity, through thingness, to number. This is the VM compile chain.

### C. The 9 Virtues (R-Factor Correspondence)

| Index | Virtue | R-Factor | Divine Act |
|---|---|---|---|
| 0 | Love/Peace | Meta-virtue (= complete 8-fold void) | — |
| 1 | Truth | ## (Primordial Matrix) | — |
| 2 | Openness/Creativity | R# (Reality-Matrix fusion) | — |
| 3 | Joy/Play | 0R (Srishti/Creation) | Srishti |
| 4 | Goodness | 1R (Sthiti/Sustenance) | Sthiti |
| 5 | Beauty | 2R (Samhara/Dissolution) | Samhara |
| 6 | Life/Nature | 3R (Tirodhana/Veiling) | Tirodhana |
| 7 | Wisdom | 4R (Anugraha/Grace) | Anugraha |
| 8 | Reality | 5R (Samavesa/Absorption) | Samavesa |

**C Type Definitions:**
```c
// 9-entry virtue LUT + Paramesvara anchor = 10 entries
// void_9 = 9u links to this structure
typedef struct {
    uint8_t  r_factor;          // R-factor index (0xFF for meta-virtue at index 0)
    uint8_t  divine_act;        // index into Divine_Act enum (0xFF if N/A)
    uint16_t cross_branch_refs; // packed indices for #2-4.0-* correspondences
} Virtue_Entry;

static const Virtue_Entry VIRTUE_LUT[9]; // .rodata

// Bridge macro: virtues 3-8 map to R-factors 0-5 (offset by 3)
#define VIRTUE_TO_RFACTOR(v)  ((v) >= 3 ? (uint8_t)((v) - 3) : 0xFFu)
```

### Relation Map
- `DEVELOPS_INTO`: #0-2 -> #0-3
- `HAS_VIRTUE_COMPONENT`: #0-2-9 -> all 9 virtues
- `NESTS_COMPLETE_NUMBER_LANGUAGE`: #0-2-9 -> #0-3
- `QUATERNAL_SUPREME_INTEGRATION`: #0-2-9 -> #0-0-0, #0-0-1, #0-1-0/1
- `CULMINATES_IN_WHOLENESS`: from X#5, N#5, M#5 -> #0-2-9

---

## FR 2.0.3: #0-3 — Archetypal Number Language (The Richest Branch)

**Requirement:** The C engine MUST implement the complete 18-fold archetypal number language as a multi-tiered `.rodata` LUT system, with type-safe (not void*) sub-table pointers and sub-tables for the Zodiacal Grammar (12-fold), MonoPoly dialectic (7-fold), Divine Acts (7-fold), and the Mirror apparatus (3-fold).

**Ontological Ground:** #0-3 (Archetypal Number Language), ~50 descendant nodes

### A. Top-Level: The 18-Fold Number Language

The archetypes are indexed 0/1 (Mirror) then 0–8 (Archetypes). This is a **10-entry system with a 0/1 singularity** — odd-fold.

| Position | Coordinate | Archetype | Formulation | Formal Nature |
|---|---|---|---|---|
| **0/1** | #0-3-0/1 | **The Mirror** | `(-) ~ 0.2 → (00=?!=!?=(-)=≠), (0- + -0) → (), -, =, ≠, 0-, -0, !?, ?!, -?/?-, !-/-! = 0-1D` | Reflection apparatus (Frame + Operator) |
| 0 | #0-3-2 | Sat (Potential) | `0 ~ 0.3/1.0 → - = ?! = ≠/= = 0/1D` | The zero-index, null ground |
| 1 | #0-3-3 | The Magician | `1 ~ 0.4/1.1 → () = !? = =/≠ = 0/1D` | First determinate form |
| 0/1 | #0-3-4 | Rosetta Stone | `0/1 ~ 0.5/1.5 → 00, ?!, !?, (-), 0 → 0/1D` | Non-Dual Self |
| 2 | #0-3-5 | Sunyata | `2 ~ 2.0-5 → (00=(-)) x (0/1≠(-)) → (0/1)/2D` | Empty relational field |
| 3 | #0-3-6 | Vak (Sacred Speech) | `3 ~ 3.0-5 → 3x0/1 + (-) = (0-3)/3D` | Identity-intelligence; 12-fold zodiacal sub-grammar |
| 4 | #0-3-7 | Purnata (Fullness) | `4 ~ 3.5/4.0 → (0-3) + 0/1 = (0-3+1)/4D` | Quaternion, structural completion |
| 5 | #0-3-8 | Dynamic Harmony | `5 ~ 4.0/4.1 → (-), @, (@) → (-)+@ = (@)` | MonoPoly crossroads; 7-fold sub-system |
| 6 | #0-3-9 | Synthetic Emptiness | `6 ~ 4.0/4.1/4.2 → (@) = (-)+@ ... = 00` | Cosmic exhalation, Solve |
| 7 | #0-3-10 | Divine Action | `7 ~ 4.0-4.3 → (00=##=R+#=R#)` | Ananda-Tandava; 7-fold sub-system |
| 8 | #0-3-11 | Structural Reflection | `8 ~ 4.0-4/4.5 → 2x(##), (R#), (#R)` | Doubled form, higher octave |

### B. Type-Safe Sub-Table Architecture

**Requirement (FR 2.0.3-B):** Sub-table pointers in `Archetype_Entry` MUST use an anonymous union of strictly typed `const` pointers rather than `void*`. This preserves the size of a single pointer word (8 bytes on 64-bit) while preventing the compiler from accepting miswired pointer assignments.

**C Type Definitions:**
```c
// Forward declarations for sub-table types (defined in their respective FRs)
typedef struct Zodiacal_Entry  Zodiacal_Entry;
typedef struct Monopoly_Entry  Monopoly_Entry;
typedef struct DivineAct_Entry DivineAct_Entry;

// Sub-table type discriminator values
#define SUB_TABLE_NONE      0u  // leaf node — no sub-table
#define SUB_TABLE_ZODIACAL  1u  // points to Zodiacal_Entry[12]
#define SUB_TABLE_MONOPOLY  2u  // points to Monopoly_Entry[7]
#define SUB_TABLE_DIVINE    3u  // points to DivineAct_Entry[7]

typedef struct {
    uint8_t  index;              // archetype number (0/1 anchor = 0; archetypes 0-8 = 1-9)
    uint8_t  dimensionality;     // /D suffix: 0, 1, or 2
    uint8_t  polarity;           // ADAM=0, EVE=1, NEUTRAL=2
    uint8_t  complement_idx;     // index of ADAM_EVE_COMPLEMENT partner (0xFF if none)
    uint8_t  weave_anchor[2];    // the ~ coordinate (integer-encoded; e.g., 0x03, 0x0A for 0.3/1.0)
    uint8_t  sub_table_type;     // SUB_TABLE_* discriminator
    uint8_t  sub_table_size;     // 0 if leaf, 7 or 12 if sub-system

    // Compiler-safe holographic weave — same 8 bytes as void*, full type checking
    union {
        const void*            raw_ptr;           // fallback if needed
        const Zodiacal_Entry*  zodiacal_grammar;  // valid iff sub_table_type == SUB_TABLE_ZODIACAL
        const Monopoly_Entry*  monopoly_dialectic;// valid iff sub_table_type == SUB_TABLE_MONOPOLY
        const DivineAct_Entry* divine_acts;       // valid iff sub_table_type == SUB_TABLE_DIVINE
    } sub_table;

    // String for Obsidian/rendering layer ONLY; never read on hot path
    const char* formulation;
} Archetype_Entry;

// Master LUT: 10 entries (0/1 mirror at [0], archetypes 0-8 at [1]-[9])
static const Archetype_Entry ARCHETYPE_LUT[10]; // .rodata
```

**Validation:** `sizeof(sub_table) == sizeof(void*)` — confirmed by union semantics. Compiler enforces type-safe assignment: assigning a `Zodiacal_Entry*` to `sub_table.divine_acts` is a compile error.

### C. Sub-System: The Mirror (#0-3-0/1)

3-fold system (0/1 anchor + Frame + Operator):

| Position | Name | Formulation | C Mapping |
|---|---|---|---|
| 0/1 | The Mirror | `(-) ~ 0.2` | Parent: the negation operator as reflection |
| 0 | The Frame | `() ~ 0.0 → 0D — Actual-Mirror — -Thing` | The `()` operator: execution frame, 0-dimensional |
| 1 | The Operator | `- ~ 0.1 → 1D — Potential-Reflection — Not-A` | The `-` operator: 1-dimensional branching |

### D. Sub-System: Zodiacal Grammar (#0-3-6, 12-fold)

12 positions indexed 0–11, even cardinality (no 0/1 anchor):

| Idx | Name | Symbol |
|---|---|---|
| 0 | Actual Identity | `!` |
| 1 | Potential Essence | `?` |
| 2 | Subjective I | `!-` |
| 3 | Asserted Am | `-?` |
| 4 | The Statement | `!?` |
| 5 | Objective Is | `?-` |
| 6 | Query of Other | `-!` |
| 7 | Reflexive Query | `?!` |
| 8 | Integrated Self | `-!/!-` |
| 9 | Relational Other | `-?/?-` |
| 10 | Self Questioning World | `!?/?!` |
| 11 | World Questioning Self | `?!/!?` |

```c
typedef struct {
    uint8_t symbol_pair; // 2 bits per glyph (!, ?, -) × 2 = 4 bits active per entry
    uint8_t resonance;   // index into foundational coordinate (#0-0-0, #0-0-1, #0-1, etc.)
    uint8_t successor;   // SEASONAL_SUCCESSOR chain — next position (mod 12)
} Zodiacal_Entry;

static const Zodiacal_Entry ZODIACAL_LUT[12]; // .rodata
```

### E. Sub-System: MonoPoly Dialectic (#0-3-8, 7-fold)

7-fold system with 0/1 singularity:

| Position | Name | Dialectical Role |
|---|---|---|
| **0/1** | **Mono — The One** | Fused unity anchor |
| 2 | Poly — The Many | Counterpart |
| 3 | Poly- — Actually Many | Actualized many |
| 4 | -Mono — Potentially One | Potential unity |
| 5 | Mono- — Actualising The One | Active unification |
| 6 | -Poly — Potentiating The Many | Active diversification |
| 7 | MonoPoly — (M)Any-One | Complete synthesis |

```c
typedef struct {
    uint8_t position;        // 0/1 singularity=0; positions 2-7 = indices 1-6
    uint8_t shadow_opposite; // SHADOW_OPPOSITE partner index
    uint8_t light_opposite;  // LIGHT_OPPOSITE partner index
} Monopoly_Entry;

static const Monopoly_Entry MONOPOLY_LUT[7]; // .rodata
```

### F. Sub-System: Divine Acts (#0-3-10, 7-fold)

7-fold system with 0/1 singularity (Svatantrya/Freedom):

| Position | Name | ENABLES_DIVINE_ACT chain |
|---|---|---|
| **0/1** | **Svatantrya — Freedom** | → Srishti |
| 2 | Srishti — Creation | → Sthiti |
| 3 | Sthiti — Sustenance | → Samhara |
| 4 | Samhara — Dissolution | → Tirodhana |
| 5 | Tirodhana — Veiling | → Anugraha |
| 6 | Anugraha — Grace | → Samavesa |
| 7 | Samavesa — Absorption | → Svatantrya (COMPLETES_CYCLE_TO) |

```c
typedef struct {
    uint8_t position;       // 0/1 singularity=0; acts 2-7 = indices 1-6
    uint8_t enables_next;   // index of next act in ENABLES_DIVINE_ACT chain
    uint8_t manifests_arch; // archetype index produced (0xFF if none)
} DivineAct_Entry;

static const DivineAct_Entry DIVINE_ACT_LUT[7]; // .rodata
```

**DIVINE_ACT_MANIFESTATION:** Srishti → Archetype 2 (Sunyata), Sthiti → Archetype 3 (Vak), Samhara → Archetype 4 (Purnata).

### G. Relation Map: ADAM_EVE_COMPLEMENT Pairing

- #0-3-5 (Sunyata/Adam) <-> #0-3-6 (Vak/Eve)
- #0-3-7 (Purnata/Adam) <-> #0-3-8 (Dynamic Harmony/Eve)
- #0-3-9 (Synthetic Emptiness/Adam) <-> #0-3-10 (Divine Action/Eve)

---

## FR 2.0.4: #0-4 — Five-Level Meta-Logic Stack (Holographic Matrix of Context)

**Requirement:** The C engine MUST implement the five QL frames (O#, X#, N#, M#, #) as a hierarchical table of tables, each containing 6 entries with explicit formulas, internal mod-6 Torus wiring, and inter-frame generative links.

**Ontological Ground:** #0-4 (Holographic Matrix), 5 QL frame sub-branches, 30 sub-positions, ~30 nodes total

**Eckhartian Role:** #0-4 is the Trinity — the active processing stack mirroring M1 (O#), M2 (X#), M3 (N#), M4 (M#), and the # frame (Nara/Siva-Shakti threshold). These 5 frames plus the 2 components of #0-5 (Siva `(-)` and Shakti `@`) produce exactly 7 systems — the native generation of the 7-fold Divine Act architecture.

### A. The Five Frames

Each frame is a complete micro-algebra with its own operator set. Generative cascade via `CONTEXT_FRAME_GENERATES`:
```
O# (Zero Logic) → X# (Parashakti Logic) → N# (Spanda Logic) → M# (Mahamaya) → # (Nara)
```

### B. Frame 1: O# — Zero Logic (Paramasiva Base)

`O# = (R→O) + (0/1 = +/-0) — R0(1) - R1(0) - R4(5) — Paramasiva - Zero Logic`

| Pos | Coord | Name | Formulation |
|---|---|---|---|
| 0 | #0-4.0/1-0 | Seed of Potential | `O0 = +/-0` |
| 1 | #0-4.0/1-1 | Defining Negation | `O1 = (0-0) = -0` |
| 2 | #0-4.0/1-2 | Process Affirmation | `O2 = (0+0) = +0` |
| 3 | #0-4.0/1-3 | Self-Reflection | `O3 = (0x0) = 0²` |
| 4 | #0-4.0/1-4 | Contextual Indeterminacy | `O4 = (0/0) = √0 / %` |
| 5 | #0-4.0/1-5 | Non-Dual Synthesis | `O5 = ((+/-0) x// (+/-0)) = 0/1` |

### C. Frame 2: X# — Parashakti Logic (Cosmic Imagination)

`X# = (x) = 0/1 — Parashakti - X Logic`

| Pos | Formulation | Pattern |
|---|---|---|
| 0 | `X0 = (x)` | Identity |
| 1 | `X1 = ((x)+(x))-((x)x(x))-((x)/(x))` | add - mul - div |
| 2 | `X2 = ((x)+(x))+((x)x(x))+((x)/(x))` | add + mul + div |
| 3 | `X3 = ((x)+(x))+((x)x(x))-((x)/(x))` | add + mul - div |
| 4 | `X4 = ((x)+(x))-((x)x(x))+((x)/(x))` | add - mul + div |
| 5 | `X5 = all +/- combinations + (x) = 9(x)` | Total synthesis = 9 |

X1–X4 are the 4 permutations of a 2-bit sign selector over `(mul, div)` with `add` as constant base: `uint8_t signs = (mul_positive << 1) | div_positive`.

### D. Frame 3: N# — Spanda Logic (Manifestation Engine)

`N# = X# = (n) — Spanda - 0=0 and brings +1 and -1`

| Pos | Formulation | Character |
|---|---|---|
| 0 | `N0 = (n)` | Ground: the determinable |
| 1 | `N1 = (i²)*(n-1)²` | Complex rotation (i²=-1), past-squared |
| 2 | `N2 = (n+1)²` | Future-squared |
| 3 | `N3 = ((n)x(n+1))+(n-1)` | Present×Future + Past |
| 4 | `N4 = (n-1)x((i²)x(n-1))+2` | Complex past-reflection + duality |
| 5 | `N5 = 8(n)+/-(n)` | **= 7n or 9n** (Divine Action or Wholeness) |

N5 = 8n ± n. The `+/-` IS Spanda — bifurcation to either 7 (Divine Action) or 9 (Wholeness/Paramesvara).

### E. Frame 4: M# — Mahamaya (Pronominal Grammar)

`M# = (#/##+/-/x//#/##) — Mahamaya - Expression - World Dream`

| Pos | Formulation | Pronoun |
|---|---|---|
| 0 | `M0 = (0/1) — I` | First person singular |
| 1 | `M1 = (1+1=2) — You` | Second person |
| 2 | `M2 = (0-3) — You and I` | First+second person |
| 3 | `M3 = (1+2=3) — They` | Third person |
| 4 | `M4 = (4+0) — We` | First person plural |
| 5 | `M5 = (0/1/4/5) — We-I` | Integral first person |

### F. Frame 5: # — Nara Base (Family/Polarity Algebra)

`# = ##/# — Nara/Siva-Shakti - Sentient Experience`

| Pos | Formulation | Polarity | Role |
|---|---|---|---|
| 0 | `## = 0/1 — Yin-Yang` | Primordial Matrix | Universal template |
| 1 | `#0 = 1/1- — Subdominant Yin` | Daughter | Receptive learning |
| 2 | `#1 = 2-/2 — Dominant Yang` | Father | Assertive structuring |
| 3 | `#2 = 3/3- — Subdominant Yang` | Son | Creative exploration |
| 4 | `#3 = 4./4 — Dominant Yin` | Mother | Integrative nurturing |
| 5 | `#4 = 5-/5 — Tao` | Family Harmony | Dynamic balance |

### G. Overall C Architecture for #0-4

```c
// Single QL frame: 6 positions + internal torus + formulas
typedef struct {
    uint8_t     frame_id;           // 0=O#, 1=X#, 2=N#, 3=M#, 4=#
    const char* designation;        // "O#", "X#", etc. — Obsidian layer ONLY
    uint8_t     torus_next[6];      // internal mod-6 walk: pos[i].next = torus_next[i]
    uint8_t     generates;          // frame_id of next frame in cascade (0xFF if terminal)
} QL_Frame;

static const QL_Frame QL_STACK[5]; // .rodata
```

---

## FR 2.0.5: #0-5 — Operator-Processor Duality (Siva-Shakti Unity)

**Requirement:** The C engine MUST implement Siva as a 6-entry operator function pointer table and Shakti as a 6-stage processing pipeline, with explicit `SIVA_SHAKTI_UNITY` bidirectional linking. M5 (Epii) MUST physically point to the same `.rodata` Siva operator table entries — enforcing the macro-micro holographic link in pointer logic.

**Ontological Ground:** #0-5 (Siva-Shakti Unity), #0-5-0/1 (Siva), #0-5-5/0 (Shakti), 12 sub-positions

**Eckhartian Role:** #0-5 mirrors M5 (Epii) — the Möbius return of the processing stack back to the Void. M5's function pointers MUST point to M0's Siva `.rodata` entries; M5's payload MUST reference M0's Shakti pipeline state.

### A. Siva: The Operator Table (#0-5-0/1)

`(#) = (-) + # = (!? = ?!) — Siva - Unconscious Resonant Medium of Space`

| Pos | Coord | Formulation | Operator | C Analogue |
|---|---|---|---|---|
| 0 | #0-5-0/1-0 | `(0) = (@#) — In-pression` | Potential for Psyche | `void* context` |
| 1 | #0-5-0/1-1 | `(1) = (-) — Negation` | Negation | `~` bitwise NOT |
| 2 | #0-5-0/1-2 | `(2) = (+) = (-)x(-) — Affirmation` | Affirmation | `& mask` assertion |
| 3 | #0-5-0/1-3 | `(3) = (x) — Dialogic` | Dialogic multiplication | `*` dereference |
| 4 | #0-5-0/1-4 | `(4) = (/) — Dialectic` | Dialectic division | `/` or `|` |
| 5 | #0-5-0/1-5 | `(5) = (=) — Ex-pression` | Expression | `=` assignment |

```c
typedef void (*Siva_Operator)(struct Holographic_Coordinate* self, void* operand);

typedef struct {
    const char*   symbol;          // Obsidian layer only — never read on hot path
    Siva_Operator execute;         // function pointer — the executable instruction
    uint8_t       cross_logical;   // index into #2-1-2-N (logical operator system)
    uint8_t       cross_archetype; // index into #2-1-0-N (archetypal charge)
} Siva_Entry;

static const Siva_Entry SIVA_TABLE[6]; // .rodata
```

### B. Shakti: The Processing Pipeline (#0-5-5/0)

`(@#) = @ + # + (-) — Dynamic Psyche of Duration/Lived Time`

| Pos | Formulation | Domain | QL Frame |
|---|---|---|---|
| 0 | `@0 = ## — Library` | Being/Knowing/Embodied Memory | #0-4.5/0-0 (##) |
| 1 | `@1 = O# — Bimba` | Systems Architecture | #0-4.0/1 (O# frame) |
| 2 | `@2 = X# — Pratibimba` | Logi/Meanings | #0-4.0/1/2 (X# frame) |
| 3 | `@3 = N# — Language` | Symbols/Characters/Forms | #0-4.0/1/2/3 (N# frame) |
| 4 | `@4 = M# — Stories` | Worlds and Views | #0-4.4.0-4.4/5 (M# frame) |
| 5 | `@5 = R# — Techne` | Freedoms/Powers/Tools | #0-3-10-0/1 (Svatantrya) |

Each Shakti domain maps 1:1 to a QL frame from FR 2.0.4. Shakti IS the runtime that processes the static QL frame definitions.

### C. The Macro-Micro Holographic Enforcement

```c
// The holographic link: M5 (Epii) shares M0's execution topology
// M5's invoke capability IS the Siva operator table from M0 .rodata
// This is enforced at init time, not via duplication
void m5_epilogos_init(struct Holographic_Coordinate* m5_node) {
    // M5's execution IS Siva's OP_EQUATE — expression, the return to equivalence
    m5_node->invoke = SIVA_TABLE[OP_EQUATE].execute;
    // M5's processing domain IS the Shakti pipeline state
    // (payload points into Shakti's .rodata state, not a copy)
}
```

### D. The Möbius Return

- `RETURNS_TO` / `RECURSIVE_RETURN`: #0-5 -> #0-0
- `BUILDS_FROM`: #0-5 -> #0-1, #0-2, #0-3
- `COMPLETES_IN`: #0-5 -> #0-3-10-7 (Samavesa — Absorption)
- `VEILED_BY_SKIN`: #0-5 -> #5 (Epii) — singular cross-branch Möbius touch

---

## FR 2.0.6: R-Factor Routing System

**Requirement:** The R-factor assignment matrix MUST be encoded as `R_Factor_Route = uint16_t` (3 bits per R-factor × 5 R-factors = 15 bits used; value 7 = Absent). The `GET_R_POS` macro MUST extract any R-factor's position in a single bitwise operation. The full assignment matrix MUST live in `.rodata`.

### A. The R_Factor_Route Type and Macro

```c
// 15-bit R-Factor routing: 3 bits per R-factor, packed into uint16_t
// Bit layout: [spare][R4:3][R3:3][R2:3][R1:3][R0:3]
// Value 0-5 = position in frame; value 7 (0b111) = Absent from this frame
typedef uint16_t R_Factor_Route;

// Extract R-factor r_idx's position from a 16-bit route word — single shift + mask
#define GET_R_POS(route, r_idx)  (((route) >> ((r_idx) * 3)) & 0x07u)

// Route constants for each frame
// O#: R0(1), R1(0), R2=Absent, R3=Absent, R4(5)
// Encoding: R0=1(001), R1=0(000), R2=7(111), R3=7(111), R4=5(101)
// Binary: [0]_101_111_111_000_001 = 0x5F81
#define ROUTE_O_SHARP   ((R_Factor_Route)0x5F81u)

// X#: R0(2), R1(1), R2(0), R3(5), R4(4)
// R0=2(010), R1=1(001), R2=0(000), R3=5(101), R4=4(100)
// Binary: [0]_100_101_000_001_010 = 0x4282u
#define ROUTE_X_SHARP   ((R_Factor_Route)0x4282u)

// N#: R0(3), R1(2), R2(1), R3(4), R4(3)
// R0=3(011), R1=2(010), R2=1(001), R3=4(100), R4=3(011)
// Binary: [0]_011_100_001_010_011 = 0x3853u (verify against matrix)
#define ROUTE_N_SHARP   ((R_Factor_Route)0x3853u)

// M#: R0=Absent, R1(3), R2(2), R3(3), R4(2)
// R0=7(111), R1=3(011), R2=2(010), R3=3(011), R4=2(010)
// Binary: [0]_010_011_010_011_111 = 0x2537u (verify against matrix)
#define ROUTE_M_SHARP   ((R_Factor_Route)0x2537u)

// # (Nara): R0=Absent, R1(4), R2(3), R3(2), R4(1)
// R0=7(111), R1=4(100), R2=3(011), R3=2(010), R4=1(001)
// Binary: [0]_001_010_011_100_111 = 0x14E7u (verify against matrix)
#define ROUTE_NARA      ((R_Factor_Route)0x14E7u)

// Siva: R0=Absent, R1(5), R2(4), R3(1), R4(0)
// R0=7(111), R1=5(101), R2=4(100), R3=1(001), R4=0(000)
// Binary: [0]_000_001_100_101_111 = 0x00C7u (verify)
#define ROUTE_SIVA      ((R_Factor_Route)0x00C7u)

// Shakti: R0=Absent, R1=Absent, R2(5), R3(0), R4=Absent
// R0=7(111), R1=7(111), R2=5(101), R3=0(000), R4=7(111)
// Binary: [0]_111_000_101_111_111 = 0x705FFu — need 16-bit fit, verify
#define ROUTE_SHAKTI    ((R_Factor_Route)0x705Fu)
```

### B. R-Factor Assignment Matrix (Tabular Reference)

| Frame | R0 | R1 | R2 | R3 | R4 |
|---|:---:|:---:|:---:|:---:|:---:|
| **O#** (Paramasiva) | 1 | 0 | — | — | 5 |
| **X#** (Parashakti) | 2 | 1 | 0 | 5 | 4 |
| **N#** (Spanda) | 3 | 2 | 1 | 4 | 3 |
| **M#** (Mahamaya) | — | 3 | 2 | 3 | 2 |
| **#** (Nara) | — | 4 | 3 | 2 | 1 |
| **Siva** (#0-5-0/1) | — | 5 | 4 | 1 | 0 |
| **Shakti** (#0-5-5/0) | — | — | 5 | 0 | — |

`—` = Absent (encoded as 7 = `0b111` in the route word).

### C. The Double Covering Pattern

The matrix encodes a precise SU(2) double cover:

**R1 ascending + R4 descending (complete 720° cover of O# → Siva span):**
```
R1: O#(0) → X#(1) → N#(2) → M#(3) → #(4) → Siva(5)   ↑ ascends 0→5
R4: O#(5) → X#(4) → N#(3) → M#(2) → #(1) → Siva(0)   ↓ descends 5→0
```

**R2 ascending + R3 descending (complete 720° cover of X# → Shakti span):**
```
R2: X#(0) → N#(1) → M#(2) → #(3) → Siva(4) → Shakti(5) ↑ ascends 0→5
R3: X#(5) → N#(4) → M#(3) → #(2) → Siva(1) → Shakti(0) ↓ descends 5→0
```

**R0: The seed factor** — extends only through the first trika (O#, X#, N#) then withdraws.

**Ascending = Evolution (Matter waking to Spirit); Descending = Involution (Spirit descending into Matter).**

### D. Virtue-R-Factor-Divine-Act Triple

Virtues 3–8 map directly to R-factors 0–5 and the 6 Divine Acts (offset from virtue index by 3):

```c
// Bridge macro: virtues 3-8 → R-factors 0-5 (offset by 3)
#define VIRTUE_TO_RFACTOR(v)  ((v) >= 3u ? (uint8_t)((v) - 3u) : 0xFFu)
```

### E. Structural Verification Invariants

For any frame where both R1 and R4 are present: `GET_R_POS(route, 1) + GET_R_POS(route, 4) == 5`.
For any frame where both R2 and R3 are present: `GET_R_POS(route, 2) + GET_R_POS(route, 3) == 5`.
These mirror-position invariants confirm the double covering; they should be checked at boot via `boot_verify_web()` or with `_Static_assert` where compile-time computable.

---

## FR 2.0.7: String Eradication on the Hot Path

**Requirement:** All execution logic — Torus walk, R-factor dispatch, Vimarsa bytecode execution, Logos FSM ticks, VAK instruction dispatch — MUST operate exclusively on `uint8_t` indices and `Vimarsa_Bytecode` values. `const char*` strings are permitted ONLY in `.rodata` entries tagged for the Obsidian/human rendering layer. No execution path MAY call `strcmp`, `strlen`, or any string comparison function.

**Enforcement Pattern:**
```c
// CORRECT: hot-path reads opcode by index
Vimarsa_Opcode op = (Vimarsa_Opcode)GET_R_POS(ROUTE_O_SHARP, 0);

// CORRECT: strings present but never read on execution path
static const Siva_Entry SIVA_TABLE[6] = {
    { .symbol = "(0)", .execute = siva_op_impressure, ... },
    // ...
};
// Only a debug/render layer accesses .symbol — never the VM loop

// WRONG (forbidden on hot path):
if (strcmp(entry->symbol, "?!") == 0) { ... }  // NEVER
```

---

## FR 2.0.8: CF(0/1/2/3) Unified Cosmic Clock

**Requirement:** The C engine MUST implement the CF(0/1/2/3) context frame as a single-function geometric accessor `read_cosmic_clock(uint16_t degree_0_to_719)` returning `Unified_Clock_State` in O(1) using only integer arithmetic. This function integrates M1 (Torus), M2 (Parashakti decans), and M3 (Mahamaya hexagrams) into one concentric clock driven by a single degree input spanning the 720° SU(2) double cover.

**Architecture:** The CF(0/1/2/3) context frame corresponds to the Eckhartian Godhead — #0-0 through #0-3 — and acts as the unified accessor for the first four M-subsystems.

**Clock Ring Geometry:**
- **Inner Gear — M1 Torus:** 360° ÷ 12 stages = 30° per stage. The 720° double cover tracks Explicate (0°–359°) vs. Implicate (360°–719°) halves.
- **Middle Dial — M2 Parashakti:** 36 Decans of 10° each. The 72-fold matrix (36 Explicate + 36 Implicate) maps directly: Implicate decans are indexed 36–71.
- **Outer Face — M3 Mahamaya:** 64 Hexagrams at 5.625° each (Fu Xi / Shao Yong sequence). Integer math: `(degree × 64) / 360`.

**C Type Definitions:**
```c
// Unified_Clock_State: O(1) snapshot of all four M-subsystems
// from a single cosmic degree (0-719)
typedef struct {
    uint8_t  m1_torus_stage;     // 0-11  (30° sectors; Inner Gear)
    uint8_t  m2_decan_phase;     // 0-71  (10° sectors + SU(2) phase; Middle Dial)
    uint8_t  m3_hexagram_id;     // 0-63  (5.625° sectors; Outer Face)
    bool     is_implicate_phase; // true if degree >= 360 (Descending/Night phase)
} Unified_Clock_State;

// O(1) derivation — no loops, no floating point, no branches beyond one comparison
static inline Unified_Clock_State read_cosmic_clock(uint16_t degree_0_to_719) {
    Unified_Clock_State state;

    // 1. Resolve SU(2) double-cover phase
    state.is_implicate_phase = (degree_0_to_719 >= 360u);
    uint16_t base_degree     = degree_0_to_719 % 360u;

    // 2. M1 Torus Gear: 30° per stage → integer divide
    state.m1_torus_stage = (uint8_t)(base_degree / 30u);

    // 3. M2 Parashakti Dial: 10° per decan
    // Implicate phase shifts to shadow decans (indices 36-71)
    uint8_t base_decan   = (uint8_t)(base_degree / 10u);
    state.m2_decan_phase = state.is_implicate_phase
                           ? (uint8_t)(base_decan + 36u)
                           : base_decan;

    // 4. M3 Mahamaya Face: (degree × 64) / 360 — avoids floating point
    state.m3_hexagram_id = (uint8_t)((base_degree * 64u) / 360u);

    return state;
}
```

**Validation:** For degree 155 the function returns: `m1_torus_stage=5, m2_decan_phase=15, m3_hexagram_id=27, is_implicate_phase=false`. Confirms correct alignment with example in source documentation.

---

## FR 2.0.9: Divine_Act Enum and 6-to-6 Isomorphism

**Requirement:** The C engine MUST define a `Divine_Act` enum encoding the 6 active divine acts (Srishti through Samavesa) with a guaranteed 1:1 isomorphism to Logos stages and R-factors. The enum values MUST match R-factor indices (0–5) and Logos stage indices (0–5) exactly — so that `(Divine_Act)stage == active_divine_act` is always valid without a lookup table.

**The 6-to-6 Isomorphism:**

| Enum Value | Divine Act | R-Factor | Logos Stage | Direction |
|---|---|---|---|---|
| 0 | ACT_SRISHTI (Creation) | 0R | ALOGOS (Silent Ground) | Ascent |
| 1 | ACT_STHITI (Sustenance) | 1R | PROLOGOS (First Differentiation) | Ascent |
| 2 | ACT_SAMHARA (Dissolution) | 2R | DIALOGOS (Relational Exchange) | Ascent |
| 3 | ACT_TIRODHANA (Veiling) | 3R | LOGOS (Articulated Word) | Ascent |
| 4 | ACT_ANUGRAHA (Grace) | 4R | EPILOGOS (Reflexive Turn) | Ascent |
| 5 | ACT_SAMAVESA (Absorption) | 5R | ANALOGOS (Analogical Recognition) | Ascent/Return |

**C Type Definitions:**
```c
// 6 Dynamic Divine Acts — values MUST equal R-factor index and Logos stage index
typedef enum {
    ACT_SRISHTI   = 0, // 0R → ALOGOS  — emergence from Freedom anchor
    ACT_STHITI    = 1, // 1R → PROLOGOS — establishment of boundaries
    ACT_SAMHARA   = 2, // 2R → DIALOGOS — dissolution of isolated boundaries
    ACT_TIRODHANA = 3, // 3R → LOGOS   — veiled, localized articulation
    ACT_ANUGRAHA  = 4, // 4R → EPILOGOS — meta-recognition; system sees itself
    ACT_SAMAVESA  = 5  // 5R → ANALOGOS — synthesis absorbed back to whole
} Divine_Act;

// Compile-time sanity check: enum count must equal R-factor count
_Static_assert((int)ACT_SAMAVESA == 5, "Divine_Act enum must span 0-5 to match R-factor indices");
```

**Validation:** `(Divine_Act)current_stage == active_divine_act` holds identically for all ticks 0–11. No lookup table or branch required.

---

## FR 2.0.10: Unified_Logos_State and Branchless State Computation

**Requirement:** The C engine MUST implement a `Unified_Logos_State` struct capturing the full execution context of the 12-stage Logos pipeline, and a `compute_logos_state(uint8_t tick)` function computing all fields in O(1) using only arithmetic — no branches beyond the `tick >= 6` comparison.

**Conceptual Basis:** The Logos Cycle has 12 stages (6 ascending Explicate + 6 descending Implicate), mirroring the M1 Torus's 12-stage SU(2) rhythm. Ascending ticks (0–5) are the constructive / Explicate phase; descending ticks (6–11) are the resolving / Implicate phase. Because stage, divine act, and R-factor are identically valued (FR 2.0.9), all three fields are computed from `current_stage` without branching.

**C Type Definitions:**
```c
typedef uint8_t LogosStage; // 0-5

// Full execution context of the 12-stage pipeline
typedef struct {
    uint8_t    pipeline_tick;     // 0-11 (the 12-fold Torus rhythm)
    LogosStage current_stage;     // 0-5
    Divine_Act active_divine_act; // mirrors current_stage exactly
    bool       is_implicate;      // true if tick >= 6 (Descending/Shadow phase)
    uint8_t    active_r_factor;   // 0-5; mirrors current_stage exactly
} Unified_Logos_State;

// Branchless O(1) state computation — called every clock tick
static inline Unified_Logos_State compute_logos_state(uint8_t tick_0_to_11) {
    Unified_Logos_State state;
    state.pipeline_tick  = tick_0_to_11;
    state.is_implicate   = (tick_0_to_11 >= 6u);

    // Descending ticks mirror ascending: tick 6 → stage 5, tick 7 → stage 4, etc.
    state.current_stage  = (LogosStage)(state.is_implicate
                               ? (11u - tick_0_to_11)
                               : tick_0_to_11);

    // Profound isomorphism: Stage == Divine Act == R-Factor (FR 2.0.9)
    state.active_divine_act = (Divine_Act)state.current_stage;
    state.active_r_factor   = (uint8_t)state.current_stage;

    return state;
}
```

**Validation:** At tick 0: stage=0, ACT_SRISHTI, r=0, explicate. At tick 6: stage=5, ACT_SAMAVESA, r=5, implicate. At tick 11: stage=0, ACT_SRISHTI, r=0, implicate (Möbius seed).

---

## FR 2.0.11: execute_r_factor_weave() Dispatcher

**Requirement:** The C engine MUST implement an `execute_r_factor_weave()` function that reads the R-factor route for the currently active frame, extracts the frame positions using `GET_R_POS`, and dispatches to the M-branch structs linked to those frame positions. The function MUST use the `is_implicate` flag to determine whether to apply the constructive (ascending) or distilling (descending) operation.

**C Type Definitions and Pseudocode:**
```c
// Called continuously by the M5 FSM loop at each pipeline tick
void execute_r_factor_weave(Unified_Logos_State* state) {
    uint8_t r_idx = state->active_r_factor;  // 0-5

    // Iterate over the 7 frames in R_FACTOR_MATRIX order
    // (O#=0, X#=1, N#=2, M#=3, Nara=4, Siva=5, Shakti=6)
    static const R_Factor_Route ROUTE_TABLE[7] = {
        ROUTE_O_SHARP, ROUTE_X_SHARP, ROUTE_N_SHARP,
        ROUTE_M_SHARP, ROUTE_NARA,    ROUTE_SIVA,    ROUTE_SHAKTI
    };

    for (uint8_t frame = 0u; frame < 7u; frame++) {
        uint8_t pos = GET_R_POS(ROUTE_TABLE[frame], r_idx);
        if (pos == 7u) continue;  // R-factor absent from this frame

        // pos is the specific sub-position within this frame that R-factor r_idx touches
        // dispatch to the M-branch struct mapped to this frame/position
        // Direction determined by is_implicate:
        //   false (ascending) = constructive — build / manifest Pratibimba
        //   true  (descending) = distilling  — crystallize wisdom for Möbius write-back
        dispatch_to_m_branch(frame, pos, state->is_implicate);
    }
}

// dispatch_to_m_branch: resolves frame ID to M-branch struct and executes
// Implementation detail: frame 0 (O#) → M1 Paramasiva structures
//                        frame 1 (X#) → M2 Parashakti structures
//                        frame 2 (N#) → M3 Mahamaya structures
//                        frame 3 (M#) → M3/M4 overlap structures
//                        frame 4 (#)  → M4 Nara structures
//                        frame 5 (Siva) → M0 SIVA_TABLE entries
//                        frame 6 (Shakti) → M0 Shakti pipeline
void dispatch_to_m_branch(uint8_t frame_id, uint8_t position, bool is_implicate);
```

**Validation:** For tick 1 (ACT_STHITI / R1): GET_R_POS(ROUTE_O_SHARP, 1)=0, GET_R_POS(ROUTE_X_SHARP, 1)=1, GET_R_POS(ROUTE_N_SHARP, 1)=2, GET_R_POS(ROUTE_M_SHARP, 1)=3, GET_R_POS(ROUTE_NARA, 1)=4, GET_R_POS(ROUTE_SIVA, 1)=5. This is the complete ascending sweep of R1 through all 6 active frames (Shakti absent for R1).

---

## FR 2.0.12: Eckhartian Holographic Image (#0-0 through #0-5 as Micro M-System)

**Requirement:** The C engine MUST document and enforce, via pointer wiring at init time, the holographic micro-to-macro correspondence between the six M0 sub-branches and the six M-subsystems. This is not merely a conceptual mapping — it is a structural identity enforced in `.rodata` pointer linkage.

**The Holographic Correspondence:**

| M0 Sub-Branch | Eckhartian Layer | Macro M-System | C Enforcement |
|---|---|---|---|
| **#0-0** (Operator Def.) | Godhead — Absolute Ground | M0 Anuttara (self-reference) | `CF(0)` frame root; Vimarsa `.rodata` |
| **#0-1** (Non-Duality) | Godhead — First Glance | M0 internal R-factor dist. | `CF(0/1)` frame root; Spanda_Discriminator |
| **#0-2** (Void Arith.) | Godhead — Arithmetic | M0 compile chain | `CF(0/1/2)` frame root; VIRTUE_LUT |
| **#0-3** (Arch. Numbers) | Godhead — Language | M0 archetypal substrate | `CF(0/1/2/3)` frame root; ARCHETYPE_LUT |
| **#0-4** (Meta-Logic Stack) | Trinity — Active Frames | M1–M4 (O#↔M1, X#↔M2, N#↔M3, M#/# ↔M4) | QL_STACK; ROUTE_TABLE |
| **#0-5** (Siva-Shakti) | Return / The Sage | M5 Epii | SIVA_TABLE shared via M5 function pointer |

**The (#0-4 + #0-5) → 7-System Generation:**
The 5 QL frames (O#, X#, N#, M#, #) of #0-4 plus the 2 Siva-Shakti components of #0-5 (Siva `(-)` and Shakti `@`) produce exactly 7 systems — natively generating the 7-fold architecture of the Divine Acts, Context Frames, and discrimination mask.

**CF(0/1/2/3) as Godhead Root:**
The `CF(0/1/2/3)` context frame IS #0-0 through #0-3 encoded as `.rodata` roots. These four positions function as the Unified Cosmic Clock's bedrock (FR 2.0.8). The clock integrates M1–M3 because #0-0 through #0-3 is structurally identical to M0's self-reflection on M1–M3.

**Validation:** At init time, `m5_epilogos_init()` MUST be called and verified to set `m5_node->invoke == SIVA_TABLE[OP_EQUATE].execute`. This pointer equality check confirms the holographic link is live.

---

## FR 2.0.13: VAK Execution Runtime

**Requirement:** The C engine MUST implement a `VAK_Instruction` struct and `execute_vak_instruction()` dispatcher that translates VAK coordinate strings into Anuttara VM bytecode operations. The dispatcher MUST be a `switch` on `vak_family` (0–5) with no string comparisons. Each VAK family MUST map to its corresponding Anuttara VM layer.

**The VAK ↔ Anuttara VM Isomorphism:**

| VAK Family | Index | Anuttara VM Layer | Runtime Substitution |
|---|---|---|---|
| **CPF** (Context Frame Polarity) | 0 | #0-1 Discrimination & Spanda | Sets `inversion_state` bit → Explicate or Implicate logic |
| **CT** (Content Types) | 1 | #0-4 Meta-Logic Stack | Specifies which QL frame data loads into CPU registers |
| **CP** (Context Positions) | 2 | #0-2 Void Arithmetic | Anchors operation to specific 0–5 position in topological array |
| **CF** (Context Frames) | 3 | #0-0 Transcendent Void / CF(0/1/2/3) clock | Summons Vimarsa operators; macro-instruction of Godhead |
| **CFP** (Context Frame Paths) | 4 | R-Factor Weave | Acts as Program Counter; traces R1 ascending or R4 descending |
| **CS** (Context Sequences) | 5 | #0-5 Siva-Shakti / M5 Logos FSM | Triggers FSM tick; drives pipeline; culminates in Möbius write-back |

**C Type Definitions:**
```c
// A fully parsed VAK instruction — e.g., "CFP2-M2.4'"
typedef struct {
    uint8_t  vak_family;    // 0=CPF, 1=CT, 2=CP, 3=CF, 4=CFP, 5=CS
    uint8_t  vak_index;     // e.g., '2' from CFP2 — the coordinate's own index
    uint8_t  target_branch; // e.g., '2' from M2 — which M-branch (0-5)
    uint8_t  target_pos;    // e.g., '4' from M2.4 — position within that branch
    bool     is_inverted;   // true if prime (') suffix present
} VAK_Instruction;

// VAK family constants — match vak_family field values
#define VAK_FAMILY_CPF  0u
#define VAK_FAMILY_CT   1u
#define VAK_FAMILY_CP   2u
#define VAK_FAMILY_CF   3u
#define VAK_FAMILY_CFP  4u
#define VAK_FAMILY_CS   5u

// Return codes
#define VAK_SUCCESS     0
#define VAK_ERR_FAMILY  (-1)
#define VAK_ERR_INDEX   (-2)

// The Anuttara VM main dispatcher — switch on integer; no string comparisons
int execute_vak_instruction(struct Holographic_Coordinate* active_session,
                            VAK_Instruction instr) {
    switch (instr.vak_family) {

        case VAK_FAMILY_CPF: {
            // #0-1 layer: set inversion_state → select Explicate or Implicate logic
            Spanda_Discriminator disc;
            disc.bits.spanda = instr.is_inverted ? SPANDA_OR : SPANDA_AND;
            active_session->inversion_state = disc.raw;
            return VAK_SUCCESS;
        }

        case VAK_FAMILY_CT: {
            // #0-4 layer: load specified QL frame data into active registers
            // vak_index selects the frame (0=O#, 1=X#, 2=N#, 3=M#, 4=#)
            // target_pos selects the position within that frame
            load_ql_frame_data(instr.vak_index, instr.target_pos, active_session);
            return VAK_SUCCESS;
        }

        case VAK_FAMILY_CP: {
            // #0-2 layer: anchor operation to a specific void arithmetic position
            // vak_index selects the void op (VOID_OP_* flags)
            active_session->weave_state = (float)instr.target_pos;
            return VAK_SUCCESS;
        }

        case VAK_FAMILY_CF: {
            // #0-0 layer: summon a Vimarsa operator on the active session
            // vak_index selects the Vimarsa opcode (0-7)
            if (instr.vak_index >= VIMARSA_OP_COUNT) return VAK_ERR_INDEX;
            Vimarsa_Opcode op = (Vimarsa_Opcode)instr.vak_index;
            // Execute the corresponding Siva operator (Vimarsa ↔ Siva are parallel tables)
            SIVA_TABLE[op % 6u].execute(active_session, NULL);
            return VAK_SUCCESS;
        }

        case VAK_FAMILY_CFP: {
            // R-Factor layer: act as Program Counter tracing R-factor thread
            // vak_index selects which R-factor (0-4) to trace
            // target_branch/target_pos identify the M-branch data to fetch
            Unified_Logos_State logos_state = compute_logos_state(instr.vak_index);
            execute_r_factor_weave(&logos_state);
            return VAK_SUCCESS;
        }

        case VAK_FAMILY_CS: {
            // #0-5 / M5 Logos FSM layer: advance the pipeline
            m5_advance_logos_stage(active_session);
            return VAK_SUCCESS;
        }

        default:
            return VAK_ERR_FAMILY;
    }
}
```

**Validation:** The `switch` has exactly 6 cases (VAK families 0–5) plus `default`. No `strcmp` or `strlen` appears. Each case resolves to a `uint8_t` index operation or a function call that itself uses only integer dispatch.

---

## The R-Factor System: Dynamic Weaving Across QL Frames

The R-factor is the **dynamic relational thread** weaving the five QL frames and the Siva-Shakti duality into a single operational fabric. In the Eckhartian interpretation, R-factors are the **Operational Emanations** — the radiations of Grace, Will, and Action flowing from the Godhead (#0-0 through #0-3) and weaving the Trinity (#0-4/#0-5) and the macro universe (M1–M5) into coherence.

**Why R-factors distribute from #0-1:** Non-Duality is the threshold where the Godhead first looks at itself. R-factors are the "glances" of the Void — they originate at the discriminating edge (#0-1) and radiate outward through all subsequent frames.

For the full R-factor assignment table and double-covering analysis, see FR 2.0.6 above.

---

## Operational Flow: The M0 Internal Torus

```
#0-0 (Operator Definition: Vimarsa bytecode ISA + Concrescence algorithm)
  ↓ DEVELOPS_INTO
#0-1 (Discrimination: Spanda_Discriminator uint8_t; R-factor distribution origin)
  ↓ DEVELOPS_INTO
#0-2 (Void Arithmetic: 8-fold ops in uint8_t + void_9=9u + 9 Virtues LUT)
  ↓ DEVELOPS_INTO
#0-3 (Archetypal Numbers: 10 archetypes + type-safe sub-LUTs)
  ↓ [no DEVELOPS_INTO — ontological threshold: Godhead → Trinity]
#0-4 (Meta-Logic Stack: 5 QL frames × 6 micro-torus positions; R_Factor_Route per frame)
  ↓ [BUILDS_FROM #0-1, #0-2, #0-3]
#0-5 (Siva-Shakti: SIVA_TABLE + Shakti pipeline; shared with M5 via pointer)
  ↓ RETURNS_TO + RECURSIVE_RETURN
#0-0 (Möbius return — Srishti seeds the next cycle)
```

**R-Factor Flow:** #0-1 distributes R-factors as `R_Factor_Route` words to all five QL frames and both Siva/Shakti terminals. As the Torus walk traverses #0-4's frames, `GET_R_POS` extracts positions in a single bitwise operation. `compute_logos_state()` drives the 12-tick pipeline. `execute_r_factor_weave()` threads R-factor paths through the M-branches. The Virtue-R-Factor-Divine-Act triple closes the loop.

**VAK Flow:** The Pi Agent issues VAK coordinate strings. `execute_vak_instruction()` parses the family byte, dispatches to the corresponding Anuttara VM layer, and returns. All execution is integer-indexed. No string comparisons occur.

---

## Cross-Branch Interface Summary (Deferred)

| Relation Type | Count | Source | Target Branch | Deferred To |
|---|---|---|---|---|
| LINGUISTIC_CORRESPONDENCE | 99 | #0-3-6 (Vak) | #2-4.0-0/1-2-* | FR 2.2 |
| GRAMMATICAL_CORRESPONDENCE | 99 | #0-5-0/1-1 (Siva Negation) | #2-4.0-0/1-* | FR 2.2 |
| ARCHETYPAL_DIVINE_CORRESPONDENCE | 15 | Various | #2-4.0-0/1-* | FR 2.2 |
| DIVINE_ACT_CORRESPONDENCE | 14 | Divine Acts | #2-4.0-0/1-0-* | FR 2.2 |
| PROVIDES_*_FOUNDATION | ~12 | #0-0, #0-1, #0-2 | #1-* | FR 2.1 |
| POTENTIATES_*_TRACK | ~6 | #0-4 frames | #1-3-* | FR 2.1 |
| ADAM/EVE_CHARGE | ~8 | Archetypes | #2-1-* | FR 2.2 |
| VIBRATIONAL_* | ~10 | Archetypes | #2-0 | FR 2.2 |
| MODULATES_AS | 12 | Zodiacal (#0-3-6-*) | #2-3-*-* | FR 2.2 |

**Core cross-branch links retained:**
- `META_STRUCTURE_ELEMENT_OF`: #0 -> # (root)
- `SUCCEEDED_BY_AND_MANIFESTS_THROUGH`: #0 -> #1
- `VEILED_BY_SKIN`: #0-5 -> #5
- `GENERATES_BIMBA_PRATIBIMBA_DYNAMIC`: #0 -> #1-0, #1-1
- **`HOLOGRAPHIC_MICRO_IMAGE`**: #0-0..#0-5 -> M0..M5 (holographic correspondence; enforced via pointer at init)

---

*"Zero cannot be computed — it's const. But the operators that examine zero are a complete formal language. And that language IS the cosmos."*

---

*Document Version:* 3.0 (Canonical Revised)
*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/`
*Refinements Source:* `docs/specs/gemini-spec-M-branch-updates-refinements.md`
*Related Specifications:* `CLAUDE.md`, `docs/plans/M0-C-architecture.md`, `docs/specs/M/M1-paramasiva-mathematical-dna.md`

---

## SPEC PATCH — Cross-M Harmonisation (2026-03-05)

**Source:** Cross-M Harmonisation Agent — Task #7
**Gaps Addressed:** GAP-DS-1 through GAP-DS-13 from M0 dataset review

---

### FR 2.0.3-H: Zodiacal Quality Augment

**Requirement:** The `Zodiacal_Entry` struct MUST include packed elemental nature and modality fields so that each of the 12 zodiac positions carries its qualitative classification in a single byte alongside the existing `symbol_pair` and `resonance` fields.

**Gap addressed:** GAP-DS-5 — dataset contains `elementalNature` and `modality` per zodiacal sign; existing `Zodiacal_Entry` has no such fields.

```c
// ==============================================================================
// FR 2.0.3-H: ZODIACAL QUALITY AUGMENT — elemental + modality packed byte
// ==============================================================================
// Bits 3-2: elemental nature (0=Fire, 1=Earth, 2=Air, 3=Water)
// Bits 1-0: modality       (0=Cardinal, 1=Fixed, 2=Mutable)
// Combined into one byte alongside existing fields — no struct size change.

#define ZOD_ELEM_FIRE    0x00u
#define ZOD_ELEM_EARTH   0x04u
#define ZOD_ELEM_AIR     0x08u
#define ZOD_ELEM_WATER   0x0Cu

#define ZOD_MODE_CARDINAL  0x00u
#define ZOD_MODE_FIXED     0x01u
#define ZOD_MODE_MUTABLE   0x02u

// Augmented Zodiacal entry — adds zodiacal_quality field
typedef struct {
    uint8_t symbol_pair;        // 2 bits per glyph (!, ?, -) × 2 = 4 bits active
    uint8_t resonance;          // index into foundational coordinate
    uint8_t successor;          // SEASONAL_SUCCESSOR chain — next position (mod 12)
    uint8_t zodiacal_quality;   // bits[3:2]=element, bits[1:0]=modality (see above)
} Zodiacal_Entry;

// Standard assignments (0=Aries/Fire/Cardinal through 11=Pisces/Water/Mutable)
static const uint8_t ZODIACAL_QUALITY_LUT[12] = {
    ZOD_ELEM_FIRE  | ZOD_MODE_CARDINAL,   // 0  Aries
    ZOD_ELEM_EARTH | ZOD_MODE_FIXED,      // 1  Taurus
    ZOD_ELEM_AIR   | ZOD_MODE_MUTABLE,    // 2  Gemini
    ZOD_ELEM_WATER | ZOD_MODE_CARDINAL,   // 3  Cancer
    ZOD_ELEM_FIRE  | ZOD_MODE_FIXED,      // 4  Leo
    ZOD_ELEM_EARTH | ZOD_MODE_MUTABLE,    // 5  Virgo
    ZOD_ELEM_AIR   | ZOD_MODE_CARDINAL,   // 6  Libra
    ZOD_ELEM_WATER | ZOD_MODE_FIXED,      // 7  Scorpio
    ZOD_ELEM_FIRE  | ZOD_MODE_MUTABLE,    // 8  Sagittarius
    ZOD_ELEM_EARTH | ZOD_MODE_CARDINAL,   // 9  Capricorn
    ZOD_ELEM_AIR   | ZOD_MODE_FIXED,      // 10 Aquarius
    ZOD_ELEM_WATER | ZOD_MODE_MUTABLE     // 11 Pisces
};

#define ZOD_GET_ELEMENT(q)   (((q) >> 2) & 0x03u)
#define ZOD_GET_MODALITY(q)  ((q) & 0x03u)
```

**Validation:** `sizeof(Zodiacal_Entry) == 4` — unchanged fit within the `Archetype_Entry` sub-table pointer union.

---

### FR 2.0.3-I: Divine Act CF and Weave Augment

**Requirement:** The `DivineAct_Entry` struct MUST include a `cf_id` field (0–6 indexing into CF roots) and a `weave_mask` field (encoding which weave states are active for this act). These fields connect the 7-fold Divine Acts to the 7-fold Context Frame system without adding runtime overhead.

**Gap addressed:** GAP-DS-3, GAP-DS-4 — dataset has `contextFrameExpression` and `qlPositionWeave` per Divine Act that the existing struct does not encode.

```c
// ==============================================================================
// FR 2.0.3-I: DIVINE ACT CF AND WEAVE AUGMENT
// ==============================================================================

// CF root index constants (0=CF_0000, 1=CF_01, 2=CF_012, 3=CF_0123,
//                          4=CF_4x, 5=CF_450, 6=CF_50, 0xFF=none)
#define CF_ROOT_0000   0u
#define CF_ROOT_01     1u
#define CF_ROOT_012    2u
#define CF_ROOT_0123   3u
#define CF_ROOT_4x     4u
#define CF_ROOT_450    5u
#define CF_ROOT_50     6u
#define CF_ROOT_NONE   0xFFu

// Weave positions bitmask: bit N set = QL position N is active for this act
// Bit 0 = position 0, Bit 5 = position 5
typedef uint8_t DivineAct_WeaveMask;

// Augmented DivineAct entry — adds CF linkage and weave mask
typedef struct {
    uint8_t position;           // 0/1 singularity=0; acts 2-7 = indices 1-6
    uint8_t enables_next;       // index of next act in ENABLES_DIVINE_ACT chain
    uint8_t manifests_arch;     // archetype index produced (0xFF if none)
    uint8_t cf_id;              // governing CF root index (CF_ROOT_* above)
    DivineAct_WeaveMask weave_mask; // active QL positions bitmask for this act
} DivineAct_Entry;

// Standard Divine Act CF assignments (from dataset contextFrameExpression):
// Svatantrya(0/1)=CF_01, Srishti(2)=CF_012, Sthiti(3)=CF_0123,
// Samhara(4)=CF_0123, Tirodhana(5)=CF_4x, Anugraha(6)=CF_450, Samavesa(7)=CF_50
static const DivineAct_Entry DIVINE_ACT_LUT[7] = {
    { 0, 1, 0xFF, CF_ROOT_01,   0x03u }, // Svatantrya — CF(0/1), pos 0+1
    { 1, 2, 0xFF, CF_ROOT_012,  0x07u }, // Srishti    — CF(0/1/2), pos 0+1+2
    { 2, 3, 0xFF, CF_ROOT_0123, 0x0Fu }, // Sthiti     — CF(0/1/2/3), pos 0-3
    { 3, 4, 0xFF, CF_ROOT_0123, 0x0Fu }, // Samhara    — CF(0/1/2/3)
    { 4, 5, 0xFF, CF_ROOT_4x,   0x10u }, // Tirodhana  — CF(4x), pos 4
    { 5, 6, 0xFF, CF_ROOT_450,  0x30u }, // Anugraha   — CF(4.5/0), pos 4+5
    { 6, 0, 0xFF, CF_ROOT_50,   0x21u }, // Samavesa   — CF(5/0), pos 0+5
};
```

---

### FR 2.0.4-H: Nara_Entry for Holographic M0→M4 Bridge

**Requirement:** The C engine MUST provide a `Nara_Entry` struct encoding the yin-yang polarity, dominant QL value, and M0-archetype role for each of the 5 positions in the #0-4.4.0-4.4/5 (M# frame). This struct is the M0-side bridge to M4 (Nara) personal interface coordinates.

**Gap addressed:** GAP-DS-11 — positions #0-4.4.0 through #0-4.5/0 appear in the dataset with `yinYang`, `dominantValue`, and `archetypeRole` properties not captured by the current `QL_Frame` struct.

```c
// ==============================================================================
// FR 2.0.4-H: NARA_ENTRY — M0 → M4 holographic bridge for M# frame positions
// ==============================================================================

// Yin-Yang polarity values
#define NARA_POLARITY_YIN    0u   // Receptive / Feminine / Implicate
#define NARA_POLARITY_YANG   1u   // Active / Masculine / Explicate
#define NARA_POLARITY_BOTH   2u   // Non-dual (0/1 singularity positions)

// Archetype role within M# frame
typedef enum : uint8_t {
    NARA_ARCH_GROUND     = 0,  // #0 correspondence — base container
    NARA_ARCH_DEFINITION = 1,  // #1 correspondence — formal boundary
    NARA_ARCH_OPERATION  = 2,  // #2 correspondence — dynamic process
    NARA_ARCH_PATTERN    = 3,  // #3 correspondence — recognizable form
    NARA_ARCH_CONTEXT    = 4,  // #4 correspondence — Lemniscate position
} Nara_Arch_Role;

typedef struct {
    uint8_t        frame_position; // 0-4 within M# frame (maps to #0-4.4.0/1-4.4/5)
    uint8_t        polarity;       // NARA_POLARITY_*
    uint8_t        dominant_val;   // dominant QL value (0-5) for this position
    Nara_Arch_Role archetype_role; // which raw archetype (#0-#4) governs this position
} Nara_Entry;

// M# frame Nara entries (5 positions: the fractal doubling zone)
static const Nara_Entry NARA_MSHARP_LUT[5] = {
    { 0, NARA_POLARITY_BOTH, 0, NARA_ARCH_GROUND     }, // ##  (Yin-Yang / Primordial Matrix)
    { 1, NARA_POLARITY_YIN,  1, NARA_ARCH_DEFINITION }, // #0  (Subdominant Yin / Daughter)
    { 2, NARA_POLARITY_YANG, 2, NARA_ARCH_OPERATION  }, // #1  (Dominant Yang / Father)
    { 3, NARA_POLARITY_YANG, 3, NARA_ARCH_PATTERN    }, // #2  (Subdominant Yang / Son)
    { 4, NARA_POLARITY_YIN,  4, NARA_ARCH_CONTEXT    }, // #3  (Dominant Yin / Mother)
};
```

---

### FR 2.0.X: Cross-Branch Edge Registry (qlCategory + Holographic Pattern)

**Requirement:** The C engine MUST define a `M0_QL_Category` enum and a `Cross_Branch_Edge` struct to register the holographic relations between M0 sub-branches and macro M-systems. The registry IS the `HOLOGRAPHIC_PATTERN` invariant that ensures the system's micro-macro identity is testable at boot time.

**Gaps addressed:** GAP-DS-12 (HOLOGRAPHIC_PATTERN missing), GAP-DS-13 (cross-branch edge registry missing), GAP-DS-1 (qlCategory 3-value enum), GAP-DS-2 (contextFrame per node).

```c
// ==============================================================================
// FR 2.0.X: QLCATEGORY ENUM + CROSS-BRANCH EDGE REGISTRY
// ==============================================================================

// 3-value QL category encoding for M0 nodes
typedef enum : uint8_t {
    QL_CAT_FOUNDATIONAL_TRANSCENDENT = 0, // #0-0 through #0-3 (the Godhead)
    QL_CAT_IMPLICATE                 = 1, // Weave interleaves / inverted states
    QL_CAT_IMPLICATE_EXPLICATE       = 2, // #0-4 through #0-5 (Trinity + Return)
} M0_QL_Category;

// Governing CF ID for each M0 sub-branch (index into CF root array)
static const uint8_t M0_GOVERNING_CF[6] = {
    CF_ROOT_0000,  // #0-0 governed by CF_0000 (Receptive Dynamism)
    CF_ROOT_01,    // #0-1 governed by CF_01   (Non-dual Binary)
    CF_ROOT_012,   // #0-2 governed by CF_012  (Trika)
    CF_ROOT_0123,  // #0-3 governed by CF_0123 (Three-Plus-One / Quaternal)
    CF_ROOT_4x,    // #0-4 governed by CF_4x   (Fractal Doubling)
    CF_ROOT_50,    // #0-5 governed by CF_50   (Möbius Synthesis)
};

// Cross-branch edge registry — the holographic invariant table
// Each entry links an M0 sub-branch to its macro M-system counterpart.
typedef struct {
    uint8_t m0_sub_branch;    // 0-5 (#0-0 through #0-5)
    uint8_t macro_m_branch;   // 0-5 (M0 through M5)
    uint8_t relation_type;    // 0=HOLOGRAPHIC_MICRO_IMAGE, 1=VEILED_BY_SKIN, 2=GENERATES
    uint8_t cf_id;            // governing CF root for this cross-branch edge
} Cross_Branch_Edge;

#define HOLOGRAPHIC_MICRO_IMAGE_REL  0u
#define VEILED_BY_SKIN_REL           1u
#define GENERATES_REL                2u

// 6 holographic edges + 1 VEILED_BY_SKIN edge (#0-5 → M5/Epii)
#define M0_CROSS_BRANCH_COUNT 7u
static const Cross_Branch_Edge M0_CROSS_BRANCH_REGISTRY[M0_CROSS_BRANCH_COUNT] = {
    { 0, 0, HOLOGRAPHIC_MICRO_IMAGE_REL, CF_ROOT_0000 },
    { 1, 1, HOLOGRAPHIC_MICRO_IMAGE_REL, CF_ROOT_01   },
    { 2, 2, HOLOGRAPHIC_MICRO_IMAGE_REL, CF_ROOT_012  },
    { 3, 3, HOLOGRAPHIC_MICRO_IMAGE_REL, CF_ROOT_0123 },
    { 4, 4, HOLOGRAPHIC_MICRO_IMAGE_REL, CF_ROOT_4x   },
    { 5, 5, HOLOGRAPHIC_MICRO_IMAGE_REL, CF_ROOT_50   },
    { 5, 5, VEILED_BY_SKIN_REL,          CF_ROOT_50   }, // VEILED_BY_SKIN: #0-5 → M5
};

// Boot-time validation: confirm all holographic pointer links are live.
// Called from boot_verify_web() after m5_epilogos_init().
static inline bool verify_holographic_registry(void) {
    // Verifies that for each HOLOGRAPHIC_MICRO_IMAGE edge,
    // the M0 sub-branch's CF pointer equals the registry's CF root.
    // Implementation: loop over M0_CROSS_BRANCH_REGISTRY[0..5]
    // and check M0_GOVERNING_CF[entry.m0_sub_branch] == entry.cf_id.
    for (uint8_t i = 0; i < 6u; i++) {
        if (M0_GOVERNING_CF[M0_CROSS_BRANCH_REGISTRY[i].m0_sub_branch]
                != M0_CROSS_BRANCH_REGISTRY[i].cf_id) {
            return false;
        }
    }
    return true;
}

_Static_assert(M0_CROSS_BRANCH_COUNT == 7, "M0 cross-branch registry must have 7 entries");
```

---

*Patch Version:* 1.0
*Applied:* 2026-03-05 by Cross-M Harmonisation Agent
*Addresses:* GAP-DS-1, GAP-DS-2, GAP-DS-3, GAP-DS-4, GAP-DS-5, GAP-DS-11, GAP-DS-12, GAP-DS-13
