# M4 Nara Design Document

**Status:** Approved Design
**Date:** 2026-03-06
**Module:** M4 (Nara) — The Personal Dialogical Interface
**Coordinate:** #4 — Lemniscate anchor, CF_FRACTAL (4.0/1-4.4/5)
**Canonical Spec:** `docs/specs/M/M4-nara-personal-interface.md` (FR 2.4.0-2.4.10)
**Architecture Plan:** `docs/plans/M4-C-architecture.md`

---

## I. Design Summary

M4 Nara is the personal dialogical interface — the Lemniscate point (#4) where universal structures from M0-M3 fold inward to become someone's structures. It implements:

- **Symbol DNA Profile** — user's coordinates within M3's universal space
- **BLAKE3 Quintessence** — archetypal synthesis hash (not mere privacy)
- **6-Lens Vtable Dispatch** — indexed interpretation, never switch/case
- **12x3x24 Transformation Engine** — modulo cascade cycle
- **Oracle Primitives** — consent-gated true random for Tarot + I-Ching
- **Temporal "Now" Paradigm** — unified M1/M2/M3 clock with planetary preemption
- **Personal Pratibimba** (#4.4.4.4) — three-layer convergence hub
- **PCO** — all mutable personal state on heap, privacy by architecture

---

## II. Spec Patch: Three New FRs

These extend the canonical spec (FR 2.4.0-2.4.10) based on deep dataset analysis and architectural integration work.

### FR 2.4.11: M4_Temporal_Now — The Lived Moment

**Gap addressed:** Spec defines `read_cosmic_clock(degree)` but never specifies where the degree comes from or how to preempt real-time planetary data from Kerykeion (S4' agent layer).

```c
typedef struct {
    Unified_Clock_State clock;       // M1/M2/M3 concentric state (from m0.h)
    uint16_t            degree;      // 0-719 (SU(2) double cover)
    uint32_t            chronos_epoch; // Unix seconds — sequential time (Chronos)

    // Planetary operator slots (preempting Kerykeion at S4')
    // When S4' agent fills these, planets become live operators
    // acting on the M3 wheel positions as the clock's "bodies"
    uint16_t planet_degrees[7];      // Sun/Moon/Merc/Venus/Mars/Jup/Sat (0-719 each)
    uint8_t  planet_valid;           // Bitmask: which planets have real data
                                     // 0x00 = stub mode (degree-only clock)
                                     // 0x7F = all 7 planets populated
} M4_Temporal_Now;
```

**Three temporal modes:**
- **Natal:** `degree = sun_degree_anchor` from birth data — "what was the cosmic state at birth"
- **Real-time:** `degree` from current time mapping — "what is the cosmic state now"
- **Kairotic:** `degree` at moment of oracle consultation — the pregnant moment

**Graceful scaling:** Works at 0 planets (pure degree clock). Each planet that comes online via S4'/Kerykeion enriches the clock without requiring any structural change.

### FR 2.4.12: BLAKE3 Quintessence as Archetypal Synthesis

**Gap addressed:** Spec frames BLAKE3 as privacy hashing. Dataset analysis reveals it's the archetypal coordinate address — #4.0-5 (Integration) synthesizing the 5 prior identity layers into a single position in universal space.

**Implementation:**
- Vendor BLAKE3 single-file C reference (`blake3.c` + `blake3.h` + `blake3_dispatch.c` + `blake3_portable.c`)
- The hash IS the user's archetypal address, not merely a privacy mechanism
- Quintessence hash participates in Mobius return: `quintessence_hash ^= wisdom_delta`
- Hash feeds into `M4_Personal_Pratibimba.synthesizedSignature` (dataset `f_stateProperties`)
- `_Static_assert(sizeof(uint64_t) == 8)` — the 64-bit truncation fits exactly

**Flow:**
```
#4.0-0 Birthdate → numerological_key
#4.0-1 Natal Chart → sun/moon_degree_anchor (0-719)
#4.0-2 Jungian Type → nucleotide_balance (A/T/C/G weights)
#4.0-3 Gene Keys → M3 bitboard mask (uint64_t)
#4.0-4 Human Design → stub
       ↓ ALL bytes fed to BLAKE3
#4.0-5 → blake3_hasher_finalize(8 bytes) → uint64_t quintessence_hash
       ↓ memset(input, 0) — raw data destroyed
```

### FR 2.4.13: Oracle Casting Primitives

**Gap addressed:** Spec defines vtable dispatch and magic-number type safety but lacks leaf casting functions, true random source, and canonical tag emission format.

```c
// True random source — consent-gated, no PRNG state
typedef struct {
    bool     consent_granted;   // User MUST consent per invocation
    uint64_t session_nonce;     // Unique per-session (prevents replay)
} M4_Sacred_Random;

// I-Ching cast result
// Line values 6/7/8/9 map to M3 NUCLEOTIDE_ICHING_VALUE[4] = {6,9,7,8}
typedef struct {
    uint8_t  lines[6];          // Line values (6/7/8/9), bottom to top
    uint8_t  hexagram_id;       // 6-bit: resulting hexagram (0-63)
    uint8_t  changing_mask;     // 6-bit: which lines are changing
    uint8_t  result_hexagram;   // Hexagram after changes applied
    uint16_t cast_degree;       // M3 wheel degree at moment of casting (Kairos)
} M4_IChing_Cast;

// Tarot draw result
typedef struct {
    uint8_t  cards[78];         // Full deck (Fisher-Yates shuffled)
    uint8_t  drawn[12];         // Drawn cards (max spread size)
    uint8_t  draw_count;        // How many drawn
    uint8_t  spread_type;       // Spread ID
    uint16_t cast_degree;       // Kairos moment
} M4_Tarot_Draw;

// Universal emission format — bridges oracle → medicine → transformation
typedef struct {
    uint16_t tag_id;            // Universal symbol identifier
    uint8_t  tradition;         // 0=Tarot, 1=I-Ching, 2=custom
    uint8_t  nucleotide;        // A/T/C/G via Elemental Throughline
    uint8_t  element;           // Fire/Earth/Air/Water/Akasha
    uint16_t degree;            // Position on M3 wheel (0-719)
} M4_Canonical_Tag;
```

**Implementation:** `arc4random_buf()` on macOS (cryptographic quality, no seeding needed). Every oracle emission captures `cast_degree` via `m4_snapshot_now()` — the Kairotic moment is always recorded.

---

## III. Architecture Overview

### Dispatch Model
- **Vtable[6]** indexed dispatch for all lenses — never switch/case
- **Magic-number type safety** for oracle tradition structs (first field `uint32_t magic`)
- **Function pointer tables** for alchemical operations (7 canonical verbs)

### Memory Model
| Domain | Contents | C Pattern |
|--------|----------|-----------|
| **.rodata** | Protocol library (36 recipe cards), Lens vtable[6], Container LUT[3], Voice config, MEF thresholds, Elemental Throughline constants | `static const` |
| **Heap (PCO)** | Identity matrix, Sympathetic medicine, Divination state, Cycle engine, Phase history, Lenses state, Pratibimba, Integration | `arena_alloc()` or `malloc()` |
| **Transient** | `M4_Input_Data` — exists only during `m4_identity_compute()`, then memset to 0 | Stack frame |

### Float Boundary Rule (FR 2.4.5)
Floats permitted ONLY in `M4_Jung_Complex.charge` and `M4_Jung_Complex.autonomy`. Never for array indices. Threshold checks and Pi Agent reporting only.

### Cross-M Dependencies
| Dependency | Source | Used for |
|-----------|--------|----------|
| `Unified_Clock_State` | `include/m0.h` | `m0_read_cosmic_clock()` |
| `MEF_Condition` | `include/m2.h` | Active epistemic lens pointer into M2 .rodata |
| M3 nucleotide/codon types | `include/m3.h` | `M3_Matrix_Word`, `NUCLEOTIDE_ICHING_VALUE`, hexagram ops |
| `HC_LINK`, `GET_PTR`, `CF_TABLE` | `include/ontology.h` + `include/psychoid_numbers.h` | HC anchoring |

### Context Frame
`CF_FRACTAL` — the `(4.0/1-4.4/5)` frame. Accessed via `CF_TABLE[CF_FRACTAL]` or `cf_get(CF_FRACTAL)`.

---

## IV. Component Breakdown

### Phase 1: Header (`include/m4.h`)
Public API contract. All types, enums, inline functions, extern declarations. Self-describing in first 40 lines per M-branch prompt protocol.

**Public API (6 functions max):**
- `m4_init(arena, hc)` — allocate and HC-link M4_Root
- `m4_identity_compute(id, input)` — compute-once Symbol DNA + BLAKE3 quintessence
- `m4_snapshot_now(degree, epoch)` — create M4_Temporal_Now
- `m4_advance_transformation(engine)` — modulo cascade
- `m4_teardown(root)` — release heap state
- `m4_cli_dispatch(argc, argv, root)` — CLI entry point

### Phase 2: .rodata Constants (`src/m4.c` top)
- `M4_PROTOCOL_LIBRARY[12][3]` — 36 decan recipe cards
- `M4_LENS_REGISTRY[6]` — lens vtable
- `M4_CONTAINER_LUT[3]` — dialogical containers
- `M4_ALCHEMY_OPS[7]` — alchemical operation function pointers
- `M4_LENS_MEF_THRESHOLD[6]` — MEF gates per lens
- `M4_VOICE_CONFIG` — Epi-Logos voice (.rodata)
- _Static_asserts for all size claims

### Phase 3: init + teardown
- Assert HC has correct family (M) and position (4)
- Allocate `M4_Root` on heap
- `HC_LINK(hc, root)`
- Set `active_cf = cf_get(CF_FRACTAL)`
- Zero-initialize PCO
- Teardown: `HC_UNLINK`, free heap, never free HC itself

### Phase 4: Core Operations
1. **Identity compute** — derive Symbol DNA, BLAKE3 hash, memset input
2. **Temporal Now** — compose `M4_Temporal_Now` from degree + epoch
3. **Oracle casting** — consent gate → true random → I-Ching lines / Tarot shuffle → canonical tag emission
4. **Transformation advance** — modulo cascade (stroke%24 → storey%12 → decan%3)
5. **Safety checks** — MEF threshold, arousal gate, contraindication, consent

### Phase 5: CLI Dispatch
```
./epi-logos m4 info              — HC anchoring + module state
./epi-logos m4 identity          — print Symbol DNA profile
./epi-logos m4 now <degree>      — snapshot temporal Now at degree
./epi-logos m4 cast iching       — I-Ching casting (consent-gated)
./epi-logos m4 cast tarot <n>    — Tarot draw of n cards
./epi-logos m4 advance           — advance transformation cycle
./epi-logos m4 lens <0-5>        — activate lens by index
./epi-logos m4 pratibimba        — print Pratibimba convergence state
```

---

## V. Data Flow

```
SESSION START
    ↓
User provides M4_Input_Data (raw: birthdate, natal, MBTI, etc.)
    ↓
m4_identity_compute() — ONCE per session
    ├─ derive_gene_keys() → M3 bitboard mask
    ├─ derive_nucleotide_balance() → A/T/C/G weights
    ├─ derive_sun/moon_degree() → 0-719 anchors
    ├─ blake3_hash_64() → quintessence_hash (archetypal address)
    ├─ memset(input, 0) — raw data DESTROYED
    └─ computed = true
    ↓
m4_snapshot_now(degree, epoch) → M4_Temporal_Now
    ├─ m0_read_cosmic_clock(degree) → Unified_Clock_State
    └─ planet_degrees[] (stub or S4'-populated)
    ↓
Oracle operations (consent-gated):
    ├─ m4_cast_iching() → M4_IChing_Cast → M4_Canonical_Tag
    └─ m4_draw_tarot(n) → M4_Tarot_Draw → M4_Canonical_Tag[]
    ↓
Transformation:
    ├─ m4_advance_transformation() — modulo cascade
    ├─ Protocol library selection via Temporal Now
    └─ Phase history logging → Pratibimba
    ↓
Lens dispatch:
    └─ M4_LENS_REGISTRY[lens_id].translate() — vtable indexed
    ↓
Pratibimba convergence (#4.4.4.4):
    ├─ const user_dna (frozen Symbol DNA)
    ├─ current_body_state (live medicine)
    ├─ active_epistemic_lens → M2 .rodata pointer
    ├─ active_complexes[6] (float charge/autonomy)
    └─ synthesizedSignature (quintessence in action)
    ↓
Epii Integration (#4.5):
    ├─ Logos Cycle 0→5
    └─ Mobius return: quintessence_hash ^= wisdom_delta → reseeds #4.0
    ↓
SESSION END (or next cycle from enriched ground)
```

---

## VI. BLAKE3 Vendoring Strategy

Vendor the BLAKE3 C reference implementation as a build dependency:
- Source: https://github.com/BLAKE3-team/BLAKE3/tree/master/c
- Files needed: `blake3.h`, `blake3.c`, `blake3_dispatch.c`, `blake3_portable.c`
- Place in: `vendor/blake3/`
- Build integration: add to clang command line
- No SIMD acceleration needed (portable C fallback sufficient for compute-once identity hash)

---

## VII. Kerykeion Integration Strategy

**NOT a C dependency.** Kerykeion is a Python library for astrological computation.

**C module receives pre-computed data:**
- `M4_Input_Data.sun_degree_anchor` and `.moon_degree_anchor` populated externally
- `M4_Temporal_Now.planet_degrees[7]` populated externally when available
- `planet_valid` bitmask tracks which planets have real data

**S4' agent layer (future):**
- PI agent calls Kerykeion → gets planetary positions
- Passes degree values to C engine via CLI or FFI
- `epi agent` orchestrates: Kerykeion invocation → M4_Input_Data population → m4_identity_compute()

**Graceful degradation:** All M4 operations work without Kerykeion. Clock functions use degree-only mode. Identity compute uses whatever layers are available (minimum 1 system per spec).

---

## VIII. Design Rules Summary

1. All dispatch = indexed vtable[6]. Never switch/case.
2. All tradition state structs: `uint32_t magic` as first field.
3. All personal/mutable state = heap (PCO). Nothing personal in .rodata.
4. PCO Privacy Hash: `m4_identity_compute()` destroys raw input immediately.
5. Identity computed once and cached. Symbol DNA Profile immutable for session.
6. All medicinal/ritual ops MUST query `m4_snapshot_now()` first.
7. `m4_advance_transformation()` uses modulo cascade only.
8. Float isolation: ONLY `M4_Jung_Complex.charge` and `.autonomy`.
9. Elemental Throughline consistency: A=Water=Cups=Feeling, T=Fire=Wands=Intuition, C=Earth=Pentacles=Sensation, G=Air=Swords=Thinking.
10. `active_epistemic_lens` = direct pointer into M2 .rodata. Never copied.
11. `gene_keys_activation` IS an `M3_Matrix_Word`. Not a separate structure.
12. All cycle indices = `uint8_t`. Atomic load.
13. MEF threshold gates activation: `if (mef < threshold) return -EPERM`.
14. 12x3 = 36 recipe cards in .rodata. Active recipe is heap state.
15. #4.4.4.4 is the convergence hub — 23 relations, highest density.
16. 67 cross-M edges ALL through #4.4.
17. Mobius return (#4.5 → #4.0) closes session loop.
18. Safety gates at every layer.
19. Oracle emissions always produce `M4_Canonical_Tag` with nucleotide + degree.
20. `M4_Temporal_Now` works at 0-7 planets. Kerykeion is S4' concern.

---

*Design Version: 1.0*
*Approved: 2026-03-06*
*Next Step: Implementation plan via writing-plans skill*
