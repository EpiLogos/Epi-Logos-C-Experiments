# M4 (Nara) -- Developer Reference

**Subsystem:** M4 (#4) in the Epi-Logos coordinate system
**Context Frame:** CF_FRACTAL (4.0/1-4.4/5) -- Fractal Doubling
**Anchor:** Psychoid_4 (ql_position == 4, Layer 1 .rodata)
**Primary Invariant:** Vtable[6] dispatch -- never switch/case
**Floats:** ONLY in `M4_Jung_Complex.charge` and `.autonomy` (DR 8)

---

## 1. Overview

M4 is the Nara subsystem -- the Personal Dialogical Interface. It is Subsystem #4
in the M-family (Consciousness Domains), corresponding to the raw archetype #4
(Context/Type) and the Lemniscate anchor where the system folds inward. M4 provides
identity synthesis, oracle casting, sympathetic medicine, alchemical transformation,
and a 6-lens phenomenological framework for personal engagement with the coordinate
system.

M4 is governed by the **Vtable Dispatch** pattern: all lens operations are indexed
lookups into a 6-entry function pointer table. No switch/case statements appear
anywhere in M4. Type safety is enforced through magic-number constants (`M4_MAGIC_TAROT`,
`M4_MAGIC_ICHING`).

M4 receives input from M1 (torus clock), M2 (vibrational state, MEF), and M3 (codons,
hexagrams, tarot) via the Unified Cosmic Clock and feeds forward into M5 (Epii/Logos
FSM) via the Mobius return mechanism.

All personal/mutable state lives on the heap inside the **Personal Context Overlay
(PCO)**. Identity is computed once via BLAKE3 hash synthesis; raw input data is
memset to zero immediately after computation (architectural privacy).

### Source Files

| File | Role |
|------|------|
| `include/m4.h` | All M4 types, enums, inline functions, extern .rodata promises, public API |
| `src/m4.c` | All .rodata LUT definitions, BLAKE3 integration, init/teardown, verify, CLI dispatch |
| `src/test_m4.c` | 401 tests validating M4 integrity |
| `vendor/blake3/` | Vendored BLAKE3 C reference (portable, no SIMD) |

---

## 2. Architecture -- Connection to Pillar I

### M4_Root Struct

```c
typedef struct {
    Holographic_Coordinate*       hc;         /* FIRST FIELD -- HC_LINK'd to Psychoid_4 mirror */
    const Holographic_Coordinate* active_cf;  /* CF_TABLE[CF_FRACTAL] */
    M4_PersonalContextOverlay     pco;        /* All mutable personal state */
} M4_Root;
```

The `hc` field is always the first field. This is a structural invariant enforced
across all M-branch modules so that `HC_LINK` and `HC_UNLINK` work uniformly.

### HC_LINK / HC_UNLINK

Defined in `psychoid_numbers.h`:

- `HC_LINK(hc, m_struct)` -- Sets `hc->payload.process_state = m_struct` and
  `m_struct->hc = hc`. Bidirectional binding.
- `HC_UNLINK(hc)` -- Sets `hc->payload.process_state = NULL`. Called during teardown.

### CF_TABLE Integration

M4 references context frames via the canonical `CF_TABLE` lookup:

```c
root->active_cf = cf_get(CF_FRACTAL);  /* CF_TABLE[4] */
```

The `CF_Id` enum provides indices: CF_VOID=0, CF_BINARY=1, CF_TRIKA=2, CF_QUATERNAL=3,
CF_FRACTAL=4, CF_SYNTHESIS=5, CF_MOBIUS=6.

CF_FRACTAL represents the (4.0/1-4.4/5) fractal doubling -- Jung's Quaternity
through the #4 Lemniscate, where outward Torus process incubates deeper nested reality.

---

## 3. The Elemental Throughline (FR 2.4.7)

The four-element backbone linking M2 (vibration), M3 (codons), and M4 (identity):

| Element | Nucleotide | Tarot Suit | Jung Function | Polarity |
|---------|-----------|------------|---------------|----------|
| **Water** | A (Adenine) | Cups | Feeling (Fi/Fe) | Yin |
| **Fire** | T (Thymine) | Wands | Intuition (Ni/Ne) | Yang |
| **Earth** | C (Cytosine) | Pentacles | Sensation (Si/Se) | Yin |
| **Air** | G (Guanine) | Swords | Thinking (Ti/Te) | Yang |

```c
#define M4_ELEM_WATER   0   /* == M3_NUC_A */
#define M4_ELEM_FIRE    1   /* == M3_NUC_T */
#define M4_ELEM_EARTH   2   /* == M3_NUC_C */
#define M4_ELEM_AIR     3   /* == M3_NUC_G */
```

Compile-time asserted: `M3_NUC_A == M4_ELEM_WATER`, etc. This identity is the
bridge that connects M3's universal genetic/symbolic encoding with M4's personal
Jungian typology.

---

## 4. Identity System (FR 2.4.0, FR 2.4.1)

### M4_Symbol_DNA_Profile

The user's personal coordinates within M3's universal address space:

```c
typedef struct {
    uint64_t gene_keys_activation;  /* M3_Matrix_Word -- M3 bitboard mask */
    struct {
        uint8_t adenine_water;      /* Cups / Feeling */
        uint8_t thymine_fire;       /* Wands / Intuition */
        uint8_t cytosine_earth;     /* Pentacles / Sensation */
        uint8_t guanine_air;        /* Swords / Thinking */
    } nucleotide_balance;
    uint16_t sun_degree_anchor;     /* 0-719: natal sun position */
    uint16_t moon_degree_anchor;    /* 0-719: natal moon position */
} M4_Symbol_DNA_Profile;
```

### M4_Input_Data (Transient)

Raw birth data + MBTI code. **Zeroed immediately after identity computation** --
architectural privacy enforced at the C level with `memset(input, 0, sizeof(...))`.

### M4_Identity_Matrix (Compute-Once)

```c
typedef struct {
    M4_Symbol_DNA_Profile dna_profile;
    uint32_t numerological_key;     /* Birthdate encoding */
    uint64_t quintessence_hash;     /* BLAKE3 truncated to 64 bits */
    uint8_t  jung_type;             /* 4-bit MBTI composite */
    bool     computed;              /* Compute-once guard */
} M4_Identity_Matrix;
```

The `computed` flag prevents re-computation. `m4_identity_ready()` inline checks it.

### BLAKE3 Quintessence Hash

The entire `M4_Input_Data` struct is hashed via BLAKE3 (vendored in `vendor/blake3/`,
portable C, no SIMD). The resulting 256-bit hash is truncated to 64 bits for the
quintessence -- the archetypal identity synthesis.

```c
blake3_hasher hasher;
blake3_hasher_init(&hasher);
blake3_hasher_update(&hasher, input, sizeof(M4_Input_Data));
blake3_hasher_finalize(&hasher, hash_out, 8);  /* 8 bytes = 64 bits */
```

Build flag required: `-DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0`

---

## 5. Temporal System (FR 2.4.11)

### M4_Temporal_Now

The lived moment, composing all M-branch clocks:

```c
typedef struct {
    Unified_Clock_State clock;          /* M1/M2/M3 concentric state */
    uint16_t            degree;         /* 0-719 (SU(2) double cover) */
    uint32_t            chronos_epoch;  /* Unix seconds */
    uint16_t planet_degrees[7];         /* Sun/Moon/Merc/Venus/Mars/Jup/Sat */
    uint8_t  planet_valid;              /* Bitmask: which planets have data */
} M4_Temporal_Now;
```

`m4_snapshot_now(degree, epoch)` is an inline that creates a snapshot at any
given degree. Planets default to 0 with `planet_valid = 0x00` (stub mode).
Full planetary data (7 planets) can be injected when available.

---

## 6. Oracle Primitives (FR 2.4.13)

### Sacred Random

All randomness is consent-gated via `M4_Sacred_Random`:

```c
typedef struct {
    bool     consent_granted;       /* User MUST consent per invocation */
    uint64_t session_nonce;         /* Unique per-session */
} M4_Sacred_Random;
```

`m4_sacred_random(rng, buf, len)` returns `false` if consent is not granted.
On macOS, uses `arc4random_buf()` for true randomness. Non-macOS falls back to
zero-fill (stub, not cryptographic).

### I-Ching Casting

3-coin method from random bytes. Each line is 6 (Old Yin), 7 (Young Yang),
8 (Young Yin), or 9 (Old Yang):

```c
int m4_cast_iching(M4_Sacred_Random* rng, uint16_t cast_degree, M4_IChing_Cast* out);
```

Output includes `hexagram_id` (6-bit), `changing_mask` (6-bit), and
`result_hexagram` (after changes applied via XOR).

### Tarot Draw

Fisher-Yates shuffle of the 78-card deck, then draw top N (1-12):

```c
int m4_draw_tarot(M4_Sacred_Random* rng, uint8_t count, uint16_t cast_degree,
                  M4_Tarot_Draw* out);
```

The deck is a permutation -- all 78 cards appear exactly once (verified by tests).

### Magic-Number Type Safety (FR 2.4.3)

Oracle states carry magic numbers as their first field for runtime type verification:

| Constant | Value | ASCII |
|----------|-------|-------|
| `M4_MAGIC_TAROT` | `0x5441524Fu` | 'TARO' |
| `M4_MAGIC_ICHING` | `0x49434847u` | 'ICHG' |

---

## 7. Sympathetic Medicine (FR 2.4.1)

### M4_Sympathetic_Medicine

```c
typedef struct {
    M4_Elemental_Balance elements;      /* fire/earth/air/water/quintessence */
    M4_Chakra_State chakras[7];         /* 7 energy centers */
    void* pharmacopeia;                 /* extensible */
    Alchemical_Op ops[7];              /* 7 canonical alchemical verbs */
    uint8_t  planetary_hour;
    uint16_t current_degree;
    uint8_t  lunar_phase;               /* 0-27 sidereal */
    uint8_t  safety_level;              /* 0=blocked, 255=clear */
    bool     contraindicated;           /* Emergency brake */
} M4_Sympathetic_Medicine;
```

`m4_medicine_safe()` returns true only if `!contraindicated && safety_level > 0`.

### 7 Alchemical Operations (.rodata)

```c
const Alchemical_Op M4_ALCHEMY_OPS[7];
```

| Index | Operation |
|-------|-----------|
| 0 | Calcination |
| 1 | Dissolution |
| 2 | Separation |
| 3 | Conjunction |
| 4 | Fermentation |
| 5 | Distillation |
| 6 | Coagulation |

Currently stub implementations (`m4_op_stub`). Each is a function pointer
`int (*)(void* state, const void* reagent)`.

---

## 8. Cycle Engine (FR 2.4.4)

### Modulo Cascade

The transformation cycle advances via a strict modulo cascade with no nested
if/else:

```c
static inline void m4_advance_transformation(M4_Cycle_Engine* engine) {
    engine->current_stroke = (engine->current_stroke + 1) % 24;
    if (engine->current_stroke % 2 == 0) {
        engine->current_storey = (engine->current_storey + 1) % 12;
        if (engine->current_storey % 4 == 0) {
            engine->current_decan = (engine->current_decan + 1) % 3;
        }
    }
}
```

- `stroke` advances every tick (mod 24)
- `storey` advances every 2 strokes (mod 12)
- `decan` advances every 8 strokes (mod 3)

### Protocol Library (.rodata)

```c
const M4_Decan_Recipe_Card M4_PROTOCOL_LIBRARY[12][3];  /* 36 recipe cards */
```

Each recipe card specifies:
- `storey` (0-11), `decan` (0-2) -- indexing coordinates
- `ops[7]` -- indices into the 7 alchemical verbs
- `optimal_degree` -- M3 wheel position (0-719)
- `element_focus` -- which element is primary (0-3)
- `chakra_focus` -- which chakra is primary (0-6)

### Safety

`m4_transformation_safe(engine)` checks `arousal_level <= safety_threshold`.
The default threshold is 200.

---

## 9. Safety Governor (FR 2.4.9)

```c
M4_Safety_Governor m4_safety_check(
    const M4_Cycle_Engine* engine,
    const M4_Sympathetic_Medicine* med,
    const M4_Sacred_Random* rng);
```

Priority-ordered stall conditions:

| Priority | Stall Type | Trigger | Severity |
|----------|-----------|---------|----------|
| 1 | `STALL_CONTRAINDICATED` | `med->contraindicated == true` | 255 |
| 2 | `STALL_AROUSAL` | `arousal > threshold` | overflow amount |
| 3 | `STALL_CONSENT` | `rng->consent_granted == false` | 128 |
| 4 | `STALL_MEF_LOW` | MEF below lens threshold | variable |

Returns `STALL_NONE` with severity 0 if all checks pass.

---

## 10. Lens System (FR 2.4.4)

### 6-Lens Vtable Registry (.rodata)

```c
const M4_Lens_Vtable M4_LENS_REGISTRY[6];
```

| Index | Lens Name | Domain |
|-------|-----------|--------|
| 0 | Gebser | Integral consciousness structures |
| 1 | Ontological | Being and existence |
| 2 | Epistemological | Knowledge and knowing |
| 3 | Jungian Depth | Unconscious dynamics |
| 4 | Phenomenological | Lived experience |
| 5 | Trika/Kashmir | Non-dual Shaivism |

Each vtable entry provides:
- `translate(lens_id, input, context, output, len)`
- `activate(lens_id, phenom_state)`
- `deactivate(lens_id, phenom_state)`
- `annotate(lens_id, experience, annotation, len)`

Currently stub implementations. Full implementations will be wired when M5
(Logos FSM) provides the interpretive engine.

### MEF Thresholds (.rodata)

```c
const uint8_t M4_LENS_MEF_THRESHOLD[6] = {20, 40, 60, 80, 100, 120};
```

Monotonically increasing. A lens can only activate when the MEF (Meta-Epistemic
Frequency from M2) exceeds its threshold.

---

## 11. Jungian Psychology (FR 2.4.5)

### M4_Jung_Complex -- THE ONLY FLOATS

```c
typedef struct {
    uint8_t archetype_id;
    float   charge;                 /* Emotional intensity */
    float   autonomy;               /* Autonomous operation (0.0-1.0) */
    bool    conscious;              /* Made conscious? */
} M4_Jung_Complex;
```

**DR 8: Floats exist ONLY in `charge` and `autonomy`.** No other field in M4 uses
floating-point. Never used for array indices. Used only for threshold checks and
Pi Agent reporting.

### Jung Type Encoding

6-bit encoding: 2 attitude bits + 4 function bits:

```c
#define JUNG_INTROVERT  0x00
#define JUNG_EXTRAVERT  0x20
#define JUNG_THINKING   0x02        /* -> Guanine/Air */
#define JUNG_FEELING    0x04        /* -> Adenine/Water */
#define JUNG_SENSATION  0x08        /* -> Cytosine/Earth */
#define JUNG_INTUITION  0x10        /* -> Thymine/Fire */
```

### Alchemical Stage State Machine

Linear progression with reset capability:

```
PRIMA_MATERIA -> NIGREDO -> ALBEDO -> CITRINITAS -> RUBEDO -> TRANSCENDENT
       ^                                                           |
       +-----------------------------------------------------------+
                          (reset to Prima Materia)
```

`m4_alchemy_can_advance(current, target)` returns true only for `target == current + 1`
or `target == ALCH_PRIMA_MATERIA` (reset).

---

## 12. Dialogical Containers (FR 2.4.8)

```c
const M4_Container_Entry M4_CONTAINER_LUT[3];
```

| Index | Type | Capacity | Use |
|-------|------|----------|-----|
| 0 | Circle | 1 | Solo inquiry |
| 1 | Temenos | 2 | Dyadic dialogue |
| 2 | Vessel | 6 | Group process |

Each entry is exactly 4 bytes (`_Static_assert` verified).

---

## 13. Voice Configuration (FR 2.4.10)

### M4_Voice_Config (.rodata, 8 bytes)

```c
const M4_Voice_Config M4_VOICE_CONFIG = {
    .formality        = 128,
    .warmth           = 192,
    .directness       = 160,
    .depth            = 200,
    .metaphor_density = 180,
    .humor            = 80,
    .challenge        = 100,
    ._pad             = 0
};
```

7 uint8_t parameters + 1 pad byte = 8 bytes (`_Static_assert` verified).
Each parameter ranges 0-255, representing a spectrum between two poles.

### Transparency Record

```c
typedef struct {
    uint32_t timestamp;
    uint8_t  storey, decan, stroke;
    uint8_t  operation, outcome;
    uint8_t  _pad[3];
} M4_Transparency_Record;
```

Phase history is stored in a dynamically allocated array within the PCO.

---

## 14. Mobius Return (FR 2.4.5)

The mechanism by which M4 feeds wisdom back into the identity cycle:

```c
static inline void m4_mobius_return(M4_Epii_Integration* epii,
                                     M4_Identity_Matrix* identity) {
    identity->quintessence_hash ^= epii->wisdom_delta;
    identity->computed = false;     /* RESEEDS IDENTITY */
    epii->return_ready = false;
    epii->logos.position = 0;
    epii->logos.cycle_count++;
}
```

Key effects:
- Quintessence hash XOR'd with accumulated wisdom delta
- `computed` flag reset to `false` -- identity can be re-derived
- Logos position reset to 0
- Cycle count incremented

This is the #5 -> #0 Mobius return at the personal level.

---

## 15. Personal Context Overlay (PCO)

The complete heap-allocated mutable state:

```c
typedef struct {
    M4_Identity_Matrix identity;
    M4_Sympathetic_Medicine medicine;
    M4_Cycle_Engine cycle;
    M4_Context_Lenses lenses;
    M4_Epii_Integration epii;
    struct {
        M4_Transparency_Record* records;
        uint32_t count;
        uint32_t capacity;
    } phase_history;
    M4_Sacred_Random rng;
    M4_Temporal_Now last_now;
} M4_PersonalContextOverlay;
```

Everything personal is here. The M4_Root struct is just `hc` + `active_cf` + `pco`.

---

## 16. Public API

```c
/* Allocate and HC-link M4_Root; hc must have ql_position == 4.
 * Returns NULL if arena/hc is NULL or position != 4. */
M4_Root* m4_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Compute-once identity: derives Symbol DNA, BLAKE3 quintessence.
 * Zeroes input immediately after compute. No-op if already computed. */
void m4_identity_compute(M4_Identity_Matrix* id, M4_Input_Data* input);

/* Release M4_Root heap state (phase_history, complexes, HC_UNLINK).
 * Does not free the HC itself. Safe to call with NULL. */
void m4_teardown(M4_Root* root);

/* Boot-time .rodata verification: voice config, containers, MEF thresholds,
 * protocol library, elemental throughline, lens registry, alchemy ops. */
bool m4_verify(void);

/* CLI entry point. argv[0] = "m4". */
int m4_cli_dispatch(int argc, char** argv, M4_Root* root);

/* Oracle casting (consent-gated). */
int m4_cast_iching(M4_Sacred_Random* rng, uint16_t cast_degree, M4_IChing_Cast* out);
int m4_draw_tarot(M4_Sacred_Random* rng, uint8_t count, uint16_t cast_degree,
                  M4_Tarot_Draw* out);

/* Consent-gated true random bytes. */
bool m4_sacred_random(M4_Sacred_Random* rng, uint8_t* buf, size_t len);
```

---

## 17. CLI Commands

Invoked as `epi-logos m4 <subcommand>`:

| Command | Description |
|---------|-------------|
| `info` | Print M4 summary: CF, lens count, protocol count, cycle state, safety, alchemy stage |
| `identity` | Show identity matrix (quintessence hash, numerological key, nucleotide balance) |
| `now <degree>` | Temporal snapshot at degree (0-719): M1/M2/M3 clock positions, layer, planets |
| `cast iching` | Cast I-Ching (6 lines, hexagram, changing lines, result hexagram) |
| `cast tarot [N]` | Draw N tarot cards (default 3, max 12) |
| `advance` | Advance transformation cycle by one stroke |
| `lens [N]` | Show or set active lens (0-5) |
| `pratibimba` | Show Personal Pratibimba state: complexes, signature, telemetry |

---

## 18. Build and Test

All commands should be run from the project root (`Epi-Logos C Experiments/`).

### Full Binary

```
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0 \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    src/main.c -o epi-logos
```

```
./epi-logos              # Full boot (M0-M4)
./epi-logos m4 info      # M4 state summary
./epi-logos m4 cast iching    # I-Ching oracle
./epi-logos m4 cast tarot 5   # 5-card tarot draw
./epi-logos m4 now 360        # Shadow layer snapshot
./epi-logos m4 lens 3         # Activate Jungian Depth lens
```

### Test Suite (401 tests)

```
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 \
    -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0 \
    -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
    vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
    src/test_m4.c -o test_m4 -lm && ./test_m4
```

Expected output: 401/401 tests passed.

### Test Coverage

| Area | Tests | What It Verifies |
|------|-------|-----------------|
| Elemental throughline | 8 | A=Water, T=Fire, C=Earth, G=Air, nucleotide identity |
| Symbol DNA profile | 4 | Zero-init, balance size |
| Identity compute | 12 | Compute-once guard, input zeroing, BLAKE3 hash, nucleotide balance |
| BLAKE3 determinism | 3 | Same input = same hash, different input = different hash |
| Temporal Now | 10 | Degree, epoch, planet slots, clock delegation, shadow layer |
| Sacred random | 5 | Consent gating, NULL checks, zero-length rejection |
| I-Ching casting | 9 | Line ranges (6-9), hexagram < 64, changing mask 6-bit, consent rejection |
| Tarot draw | 9 | Deck permutation, draw count, card range, edge cases (0, 13) |
| Magic numbers | 4 | TARO/ICHG constants, first-field placement |
| Modulo cascade | 7 | Stroke/storey/decan wrap, safety threshold |
| Protocol library | ~144 | All 36 cards: storey/decan match, element/chakra valid |
| Safety governor | 8 | STALL_NONE/CONTRAINDICATED/AROUSAL/CONSENT, medicine_safe inline |
| Container LUT | 8 | 3 entries, types 0-2, capacities 1/2/6, 4-byte size |
| Jung complex | 9 | Float values, type encoding, alchemy stage transitions |
| Voice config | 8 | 8-byte size, default .rodata values |
| Mobius return | 5 | Hash XOR, reseeding, position reset, cycle increment |
| Lens registry | ~32 | 6 names, 4 function pointers each, stub output |
| M4 API | 10 | init/teardown lifecycle, HC link, CF wiring, PCO defaults, NULL safety |
| MEF thresholds | 7 | Monotonic increase, boundary values |

---

## 19. Key Invariants

1. **M4_Root.hc is ALWAYS the first field.** All M-branch structs follow this convention
   so that `HC_LINK` and `HC_UNLINK` work generically.

2. **M4 anchors to ql_position == 4 only.** `m4_init` returns NULL if the provided HC
   has any other position. This enforces that M4 is bound to Psychoid_4 (Context/Type).

3. **Vtable dispatch, never switch/case.** All lens operations go through the
   `M4_LENS_REGISTRY[6]` function pointer table, indexed by lens_id.

4. **Floats ONLY in M4_Jung_Complex.** The `charge` and `autonomy` fields are the
   only floating-point values in the entire M4 subsystem. Never used for array indices.

5. **Compute-once identity.** `m4_identity_compute()` checks `id->computed` and returns
   immediately if already set. Raw input is zeroed after computation.

6. **Consent-gated randomness.** `m4_sacred_random()` returns false if
   `rng->consent_granted` is not set. All oracle operations are built on this gate.

7. **MEF thresholds are monotonically increasing.** Verified at boot time by
   `m4_verify()`. Higher lenses require stronger epistemic signal.

8. **Protocol library indices match.** Every `M4_PROTOCOL_LIBRARY[s][d]` entry has
   `storey == s` and `decan == d`. Verified at boot time.

9. **Container entries are 4 bytes.** `_Static_assert(sizeof(M4_Container_Entry) == 4)`.

10. **Voice config is 8 bytes.** `_Static_assert(sizeof(M4_Voice_Config) == 8)`.

11. **Magic numbers are first fields.** `M4_Tarot_State.magic` and `M4_IChing_State.magic`
    are the first field in their respective structs for safe type-punning verification.

12. **GET_PTR before every dereference.** Tagged pointers must be stripped via `GET_PTR()`
    before dereferencing, as the upper bits carry ontological metadata.

---

## 20. Design Rules (DR 1-25)

The 25 Design Rules from the M4 design document (`Idea/Bimba/Seeds/M/M4'/Legacy/plans/2026-03-06-m4-nara-design.md`)
govern all implementation decisions. Key rules:

| DR | Rule | Enforcement |
|----|------|-------------|
| 1 | HC-first-field | `M4_Root.hc` is first member |
| 2 | CF_FRACTAL only | `cf_get(CF_FRACTAL)` at init |
| 3 | Vtable[6], no switch | `M4_LENS_REGISTRY[6]` function pointers |
| 4 | PCO = heap | `malloc` in `m4_init`, `free` in `m4_teardown` |
| 5 | Compute-once identity | `computed` guard in `m4_identity_compute` |
| 6 | BLAKE3 quintessence | Vendored in `vendor/blake3/` |
| 7 | Input zeroing | `memset(input, 0, ...)` after compute |
| 8 | Float-only rule | Only `M4_Jung_Complex.charge/.autonomy` |
| 9 | Magic-number safety | `M4_MAGIC_TAROT`, `M4_MAGIC_ICHING` |
| 10 | Consent-gated random | `M4_Sacred_Random.consent_granted` |
| 11 | arc4random_buf | macOS native true random |
| 12 | Modulo cascade | stroke%24 -> storey%12 -> decan%3 |
| 13 | Protocol .rodata | 12x3 = 36 recipe cards in `M4_PROTOCOL_LIBRARY` |
| 14 | 7 alchemy ops | `M4_ALCHEMY_OPS[7]` function pointers |
| 15 | Safety governor | Priority-ordered stall conditions |
| 16 | Container LUT | 3 entries, 4 bytes each |
| 17 | Voice config | 8 bytes, .rodata |
| 18 | Transparency records | Dynamic array in PCO |
| 19 | Mobius return | XOR wisdom, reseed identity |
| 20 | Fisher-Yates shuffle | Tarot deck permutation |
| 21 | 3-coin I-Ching | Lines 6/7/8/9 from random bytes |
| 25 | R-factor ascending | ROUTE_NARA = 0x14E4u |

---

## 21. Cross-Branch Connections

| Direction | Target | Mechanism |
|-----------|--------|-----------|
| M4 <- M3 | Codon/hexagram state for DNA profile | `M4_Symbol_DNA_Profile.gene_keys_activation` |
| M4 <- M3 | Nucleotide-element identity | Elemental Throughline (A=Water, T=Fire, C=Earth, G=Air) |
| M4 <- M2 | MEF condition for lens thresholds | `MEF_Condition` from m2.h, `M4_LENS_MEF_THRESHOLD[6]` |
| M4 <- M2 | Planetary operators (stub) | `planet_degrees[7]` in `M4_Temporal_Now` |
| M4 <- M1 | Torus stage in cosmic clock | `Unified_Clock_State.m1_torus_stage` |
| M4 <- M0 | Unified cosmic clock definition | `Unified_Clock_State` struct in m0.h |
| M4 <- M0 | Archetypal number resolution | `m0_resolve_archetypal_number()` (future) |
| M4 -> M5 | Mobius return with wisdom delta | `m4_mobius_return()` XORs quintessence hash |
| M4 -> M5 | Curriculum and integration state | `M4_Epii_Integration` struct |
| M4 <- Pillar I | HC struct, tagged pointers, CF_TABLE | `ontology.h`, `psychoid_numbers.h` |
| M4 <- Arena | Memory allocation for mirrors | `arena.h` (init only, PCO is malloc'd) |
| M4 <- BLAKE3 | Identity hash | `vendor/blake3/blake3.h` |

---

## 22. BLAKE3 Vendor Details

Location: `vendor/blake3/`

Files:
- `blake3.h` -- Public API header
- `blake3.c` -- Core hasher logic
- `blake3_dispatch.c` -- Platform dispatch (SIMD detection)
- `blake3_portable.c` -- Portable C implementation
- `blake3_impl.h` -- Internal implementation header

Build: Always use `-DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0`
to force portable-only mode. This avoids linker errors from missing SIMD intrinsic
implementations and ensures cross-platform compatibility.

Source: BLAKE3 C reference implementation (public domain / Apache 2.0 / CC0).
