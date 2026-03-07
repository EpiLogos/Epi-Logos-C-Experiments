# M0 (Anuttara) -- Developer Reference

**Subsystem:** M0 (#0) in the Epi-Logos coordinate system
**Context Frame:** CF_VOID (00/00) -- Receptive Dynamism
**Anchor:** Psychoid_0 (ql_position == 0, Layer 1 .rodata)

---

## 1. Overview

M0 is the Anuttara subsystem -- a bare-metal virtual machine implementing six nested
micro-algebras. It is Subsystem #0 in the M-family (Consciousness Domains), meaning
it corresponds to the raw archetype #0 (Ground/Source). M0 provides the lowest-level
computational semantics for the Epi-Logos coordinate system: a 3-bit instruction set,
tetralemmic state machines, void arithmetic, an archetypal number language, a five-level
meta-logic stack, and a complementarity-preserving routing system.

M0 is anchored to Psychoid_0 via `HC_LINK`, which bidirectionally binds a
`Holographic_Coordinate` to the `M0_Root` struct. Its context frame is CF_VOID
(Receptive Dynamism), retrieved from the canonical `CF_TABLE` via `cf_get(CF_VOID)`.

M0 feeds into M1-M5 via holographic Eckhartian correspondence, with the cross-branch
registry mapping each M0 sub-branch to its macro M-branch counterpart.

### Source Files

| File | Role |
|------|------|
| `include/m0.h` | All M0 types, enums, LUT externs, inline functions, public API |
| `include/vak.h` | VAK instruction dispatch infrastructure (shared across all M-branches) |
| `src/m0.c` | All .rodata LUT definitions, init/teardown, VAK handlers, CLI dispatch |
| `src/test_m0_rodata.c` | 14 tests validating .rodata LUT integrity |
| `src/test_m0_init.c` | 5 tests for init/teardown and VAK integration |
| `src/test_m0_rfactor.c` | 6 tests for R-factor weave dispatch and CLI commands |

---

## 2. Architecture -- Connection to Pillar I

### M0_Root Struct

```c
typedef struct {
    Holographic_Coordinate* hc;           /* FIRST FIELD -- always. HC_LINK'd. */
    const Holographic_Coordinate* active_cf;  /* CF_TABLE[CF_VOID] */
    Spanda_Discriminator spanda_state;
    void_ops_t active_void_ops;
    Unified_Logos_State logos_state;
} M0_Root;
```

The `hc` field is always the first field. This is a structural invariant enforced across
all M-branch modules so that `HC_LINK` and `HC_UNLINK` work uniformly.

### HC_LINK / HC_UNLINK

Defined in `psychoid_numbers.h`:

- `HC_LINK(hc, m_struct)` -- Sets `hc->payload.process_state = m_struct` and
  `m_struct->hc = hc`. Bidirectional binding.
- `HC_UNLINK(hc)` -- Sets `hc->payload.process_state = NULL`. Called during teardown.

### CF_TABLE Integration

M0 references context frames via the canonical `CF_TABLE` lookup:

```c
root->active_cf = cf_get(CF_VOID);  /* CF_TABLE[0] */
```

The `CF_Id` enum provides indices: CF_VOID=0, CF_BINARY=1, CF_TRIKA=2, CF_QUATERNAL=3,
CF_FRACTAL=4, CF_SYNTHESIS=5, CF_MOBIUS=6.

### VAK Registration

During `m0_init`, M0 registers semantic handlers for all 6 reflective coordinate
families using `vak_register_handler()`. These handlers define what each reflective
coordinate operation means within the Anuttara VM layer. Handlers are cleared
implicitly when the module is torn down and re-initialized.

---

## 3. The Six Micro-Algebras

### FR 2.0.0: Vimarsa Engine

A 3-bit instruction set architecture with 7 operators.

| Opcode | Symbol | Name | Arity |
|--------|--------|------|-------|
| 0x1 | `?!` | Illuminate (Vimarsa-Prakasa) | 1 |
| 0x2 | `!?` | Provoke (Prakasa-Vimarsa) | 1 |
| 0x3 | `(-)` | Withhold (Negation) | 0 |
| 0x4 | `+@` | Add Presence | 2 |
| 0x5 | `(@)` | Enclose | 2 |
| 0x6 | `=` | Equate (Equivalence) | 2 |
| 0x7 | `!=` | Distinguish (Distinction) | 2 |

Each operator has a 4-step reduction chain packed into a 16-bit `Vimarsa_Bytecode`:

```c
#define VBC_PACK(a, b, c, d) ((Vimarsa_Bytecode)(((a)<<9)|((b)<<6)|((c)<<3)|(d)))
#define VBC_STEP(bc, n)      ((Vimarsa_Opcode)(((bc) >> (9 - (n)*3)) & 0x07u))
```

The `VIMARSA_TABLE[7]` LUT stores all operators with their symbols, opcodes, reduction
chains, and arities. This table resides in .rodata.

### FR 2.0.0-B: Concrescence State Machine

Tracks tetralemmic positions through up to 8 steps:

| Position | Value | Meaning |
|----------|-------|---------|
| TETRAL_ZERO | 0 | Neutral ground |
| TETRAL_PLUSMIN | 1 | Fused 0/1 singularity |
| TETRAL_NEG | 2 | Primal withholding |
| TETRAL_POS | 3 | Existent withholding |
| TETRAL_VOID | 4 | Void recurrence |

The `Concrescence_Trace` struct holds an array of up to `CONCRESCENCE_STEPS` (8)
positions and a step count.

### FR 2.0.1: Spanda Discriminator

An 8-bit atomic state packed into a union:

```c
union Spanda_Discriminator {
    uint8_t raw;
    struct {
        uint8_t op_masks : 7;  /* bits 0-6: one bit per Vimarsa operator */
        uint8_t spanda   : 1;  /* bit 7: 0=AND (boundless), 1=OR (limitation) */
    } bits;
};
```

- Bit 7 = 0 (`SPANDA_AND`): inclusive simultaneity (boundless)
- Bit 7 = 1 (`SPANDA_OR`): exclusive choice (limitation)
- Bits 0-6: one bit per Vimarsa operator, indicating which operators are active

Static-asserted to exactly 1 byte.

### FR 2.0.2: Void Arithmetic

Operates on `void_ops_t` (uint8_t) with bit-flag operations:

| Flag | Bit | Operation |
|------|-----|-----------|
| VOID_OP_TRANSCEND | 0 | Transcendence |
| VOID_OP_REFLECT | 1 | Reflection |
| VOID_OP_GENERATE | 2 | Generation |
| VOID_OP_SYNTHESIZE | 3 | Synthesis |

`VOID_OP_DUAL(x)` shifts operations into the upper nibble for dual-mode encoding.
The wholeness constant `VOID_9` equals 9: `(00+00) = 9`.

**Virtue LUT** -- 9 entries mapping virtues to R-factors and divine acts:

| Index | Virtue | R-Factor | Divine Act |
|-------|--------|----------|------------|
| 0 | Love/Peace | 0xFF (meta) | -- |
| 1 | Truth | 0xFF (meta) | -- |
| 2 | Openness | 0xFF (meta) | -- |
| 3 | Joy | R0 | Srishti |
| 4 | Goodness | R1 | Sthiti |
| 5 | Beauty | R2 | Samhara |
| 6 | Life | R3 | Tirodhana |
| 7 | Wisdom | R4 | Anugraha |
| 8 | Reality | R5 | Samavesa |

The macro `VIRTUE_TO_RFACTOR(v)` converts a virtue index (3-8) to an R-factor (0-5).
Indices 0-2 return 0xFF (meta-virtues without direct R-factor mapping).

### FR 2.0.3: Archetypal Number Language -- 12-Fold

The `ARCHETYPE_LUT[12]` is the core number language. Its 12 entries map:

| Index | Element | Dimensionality | Polarity | Sub-table |
|-------|---------|----------------|----------|-----------|
| 0 | (-) Mirror | 0D | NEUTRAL | -- |
| 1 | 0/1 Singularity | 1D | NEUTRAL | -- |
| 2 | 0 (Sat/Potential) | 1D | ADAM | -- |
| 3 | 1 (Magician/Actual) | 1D | EVE | -- |
| 4 | 2 (Sunyata) | 2D | ADAM | -- |
| 5 | 3 (Purnata) | 2D | EVE | -- |
| 6 | 4 (Synthetic Emptiness) | 2D | ADAM | -- |
| 7 | 5 (Vak/Sacred Speech) | 2D | EVE | Zodiacal (12) |
| 8 | 6 (Structural Reflection) | 2D | NEUTRAL | -- |
| 9 | 7 (Dynamic Harmony) | 2D | EVE | Monopoly (7) |
| 10 | 8 (Wholeness Precursor) | 2D | ADAM | -- |
| 11 | 9 (Divine Action) | 2D | NEUTRAL | Divine Acts (7) |

Every entry carries a `Compiled_Formulation` (16 bytes, static-asserted):

```c
typedef struct {
    uint8_t  signature;        /* 7-bit operator mask + 1 Spanda bit */
    uint8_t  reduction_depth;  /* number of -> steps (2-8) */
    uint8_t  dimensionality;   /* terminal form: 0, 1, or 2 */
    uint8_t  terminal_opcode;  /* final Vimarsa opcode */
    uint16_t core_chain;       /* 4-step reduction (Vimarsa_Bytecode) */
    uint16_t _pad;
    const char* source;        /* human-readable formulation string */
} Compiled_Formulation;
```

**Sub-tables:**

- **Zodiacal LUT** (12 entries): Each entry has `symbol_pair`, `resonance`, `successor`,
  and `zodiacal_quality`. Quality encodes element (Fire/Earth/Air/Water, bits 3-2) and
  modality (Cardinal/Fixed/Mutable, bits 1-0). Extract with `ZOD_GET_ELEMENT(q)` and
  `ZOD_GET_MODALITY(q)`.

- **Monopoly LUT** (7 entries): Each entry has `position`, `shadow_opposite`, and
  `light_opposite`. Encodes the Mono-Poly dialectic structure.

- **Divine Act LUT** (7 entries): Each entry has `position`, `enables_next`,
  `manifests_arch`, `cf_id`, and `weave_mask`. Maps divine acts to context frames
  and weave masks.

### FR 2.0.4: Five-Level QL Meta-Logic Stack

Five frames forming a generative cascade:

| Frame | ID | Designation | Generates | Terminal Opcode |
|-------|----|-------------|-----------|-----------------|
| 0 | O# | Zero Logic | X# (1) | OP_VIMARSA_NULL |
| 1 | X# | Parashakti Logic | N# (2) | OP_ILLUMINATE |
| 2 | N# | Spanda Logic | M# (3) | OP_PROVOKE |
| 3 | M# | Mahamaya | # (4) | OP_WITHHOLD |
| 4 | # | Nara Base | terminal (0xFF) | OP_ADD_PRESENCE |

Each frame contains a `torus_next[6]` array for internal mod-6 walk and a
`Compiled_Formulation` for its reduction trace.

**Nara Bridge** (`NARA_MSHARP_LUT[5]`): Bridges QL frames to Nara (M4) with
polarity assignments (YIN/YANG/BOTH) and dominant values.

### FR 2.0.5: Siva-Shakti Operator/Processor Duality

The `SIVA_TABLE[6]` maps 6 operator entries:

| Index | Symbol | Function | Cross-Logical | Cross-Archetype |
|-------|--------|----------|---------------|-----------------|
| 0 | (0) | Impressure | 0 | 0 |
| 1 | (1) | Negation | 1 | 1 |
| 2 | (2) | Affirmation | 2 | 2 |
| 3 | (3) | Dialogic | 3 | 3 |
| 4 | (4) | Dialectic | 4 | 4 |
| 5 | (5) | Expression | 5 | 5 |

Each entry has a `Siva_Operator` function pointer (`void (*)(HC*, void*)`). Current
implementations are stubs; full semantics will be wired as M1-M5 come online.

### FR 2.0.6: R-Factor Routing

7 route words encoding R-factor positions across frames. Each route word packs
positions at 3 bits per R-factor index, extracted with:

```c
#define GET_R_POS(route, r_idx) (((route) >> ((r_idx) * 3)) & 0x07u)
```

A value of 7 means the R-factor is absent from that frame.

| Route | Constant | Value |
|-------|----------|-------|
| O# | ROUTE_O_SHARP | 0x5FC0 |
| X# | ROUTE_X_SHARP | 0x4A09 |
| N# | ROUTE_N_SHARP | 0x3852 |
| M# | ROUTE_M_SHARP | 0x269B |
| Nara | ROUTE_NARA | 0x14E4 |
| Siva | ROUTE_SIVA | 0x032D |
| Shakti | ROUTE_SHAKTI | 0x717F |

**Complementarity Law:** For any frame where both Rx and R(5-x) are present,
`Rx + R(5-x) = 5`. For example, R1 ascends (0,1,2,3,4,5) across O#..Siva while
R4 descends (5,4,3,2,1,0) -- their sum is always 5.

---

## 4. Unified Clock and Logos State (FR 2.0.8 + 2.0.10)

### Cosmic Clock

`m0_read_cosmic_clock(degree)` is an O(1) inline function that decomposes a degree
value (0-719) into three subsystem phases:

```c
Unified_Clock_State m0_read_cosmic_clock(uint16_t degree_0_to_719);
```

| Field | Derivation | Range |
|-------|------------|-------|
| m1_torus_stage | base / 30 | 0-11 |
| m2_decan_phase | base / 10 (+ 36 if implicate) | 0-71 |
| m3_hexagram_id | (base * 64) / 360 | 0-63 |
| is_implicate_phase | degree >= 360 | bool |

Degrees 0-359 are the explicate phase; 360-719 are the implicate phase.

### Logos State

`m0_compute_logos_state(tick)` is a branchless 12-stage pipeline that maps a tick
(0-11) to a complete logos state:

```c
Unified_Logos_State m0_compute_logos_state(uint8_t tick_0_to_11);
```

| Field | Derivation |
|-------|------------|
| pipeline_tick | input tick |
| is_implicate | tick >= 6 |
| current_stage | if implicate: 11 - tick, else: tick |
| active_divine_act | cast of current_stage |
| active_r_factor | same as current_stage |

Ticks 0-5 are the explicate (ascending) phase; ticks 6-11 are the implicate
(descending) phase. The stage mirrors at tick 6, creating the Torus fold-back.

---

## 5. Cross-Branch Registry (FR 2.0.X)

The registry maps M0's internal sub-branches to the macro M-branch system (M0-M5).

### M0_CROSS_BRANCH_REGISTRY (7 edges)

| Sub-Branch | Macro M-Branch | Relation Type | CF ID |
|------------|----------------|---------------|-------|
| 0 | M0 | HOLOGRAPHIC_MICRO_IMAGE | CF_VOID (0) |
| 1 | M1 | HOLOGRAPHIC_MICRO_IMAGE | CF_BINARY (1) |
| 2 | M2 | HOLOGRAPHIC_MICRO_IMAGE | CF_TRIKA (2) |
| 3 | M3 | HOLOGRAPHIC_MICRO_IMAGE | CF_QUATERNAL (3) |
| 4 | M4 | HOLOGRAPHIC_MICRO_IMAGE | CF_FRACTAL (4) |
| 5 | M5 | HOLOGRAPHIC_MICRO_IMAGE | CF_MOBIUS (6) |
| 5 | M5 | VEILED_BY_SKIN | CF_MOBIUS (6) |

Relation types:
- `HOLOGRAPHIC_MICRO_IMAGE_REL` (0): M0 sub-branch is the micro-image of the macro branch
- `VEILED_BY_SKIN_REL` (1): M0 sub-branch is veiled by the macro branch
- `GENERATES_REL` (2): M0 sub-branch generates the macro branch (not used in current registry)

### M0_GOVERNING_CF (6 entries)

Maps each sub-branch (0-5) to its governing context frame ID:

```
sub-branch 0 -> CF_VOID (0)
sub-branch 1 -> CF_BINARY (1)
sub-branch 2 -> CF_TRIKA (2)
sub-branch 3 -> CF_QUATERNAL (3)
sub-branch 4 -> CF_FRACTAL (4)
sub-branch 5 -> CF_MOBIUS (6)
```

### Verification

`m0_verify_holographic_registry()` checks at boot that the first 6 registry edges
have CF IDs consistent with `M0_GOVERNING_CF`. Returns `true` if all match.

---

## 6. VAK Integration

M0 registers semantic handlers for all 6 reflective coordinate families during
`m0_init`. These define what each VAK instruction means within the Anuttara VM layer.

### Handler Summary

| Family | Index | Handler | Semantics |
|--------|-------|---------|-----------|
| CPF | 0 | `m0_vak_cpf` | Sets Spanda discrimination state. Inversion flag selects SPANDA_OR vs SPANDA_AND. The vak_index lower 7 bits become the op_masks. Writes to `hc->inversion_state`. |
| CT | 1 | `m0_vak_ct` | Selects a QL frame (0-4). Returns `VAK_ERR_INDEX` if vak_index >= 5. Frame selection is recorded in session context. |
| CP | 2 | `m0_vak_cp` | Anchors void arithmetic position. Sets `hc->weave_state` to the instruction's `target_pos` value (cast to float). |
| CF | 3 | `m0_vak_cf` | Invokes a Vimarsa operator via the Siva table. The vak_index selects the operator (must be < 7); the Siva entry at `vak_index % 6` is executed. |
| CFP | 4 | `m0_vak_cfp` | Traces an R-factor thread. Computes logos state from `vak_index` (must be <= 11), then dispatches `m0_execute_r_factor_weave`. |
| CS | 5 | `m0_vak_cs` | M5 integration stub. Returns `VAK_SUCCESS` unconditionally. Will be wired when M5 is implemented. |

### VAK Instruction Format

```c
typedef struct {
    uint8_t vak_family;     /* 0-5: which reflective coordinate */
    uint8_t vak_index;      /* coordinate's own index within family */
    uint8_t target_branch;  /* which M-branch (0-5) to target */
    uint8_t target_pos;     /* position within that branch */
    uint8_t is_inverted;    /* 1 if prime (') suffix present */
} VAK_Instruction;
```

Static-asserted to 5 bytes. Dispatched via `execute_vak_instruction(session, instr)`.

---

## 7. Public API

```c
/* Allocate and HC-link an M0 root struct.
 * Returns NULL if arena/hc is NULL or hc->ql_position != 0. */
M0_Root* m0_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Release heap state. Calls HC_UNLINK on root->hc. Does not free the HC itself. */
void m0_teardown(M0_Root* root);

/* CLI entry point. argc/argv parsed for subcommand dispatch.
 * Returns 0 on success, -1 on error. */
int m0_cli_dispatch(int argc, char** argv, M0_Root* root);

/* Dispatch R-factor weave across all 7 route frames for the given logos state.
 * Skips frames where the active R-factor position is absent (value 7). */
void m0_execute_r_factor_weave(Unified_Logos_State* state);

/* Verify that M0_GOVERNING_CF is consistent with M0_CROSS_BRANCH_REGISTRY.
 * Returns true if all 6 primary edges match. Called at boot. */
bool m0_verify_holographic_registry(void);
```

Additionally, two inline functions are defined in the header:

```c
/* O(1) unified clock accessor. Decomposes degree (0-719) into M1/M2/M3 phases. */
static inline Unified_Clock_State m0_read_cosmic_clock(uint16_t degree_0_to_719);

/* Branchless 12-stage pipeline. Maps tick (0-11) to logos state. */
static inline Unified_Logos_State m0_compute_logos_state(uint8_t tick_0_to_11);
```

---

## 8. CLI Commands

Invoked as `epi-logos m0 <subcommand>`:

| Command | Args | Description |
|---------|------|-------------|
| `info` | -- | Print M0 summary: HC position, family, CF, Spanda state, Logos tick, LUT counts |
| `clock` | `[degree]` | Read cosmic clock at given degree (0-719, default 0). Shows M1/M2/M3 phases |
| `logos` | `[tick]` | Compute logos state at given tick (0-11, default 0). Shows stage, divine act, phase |
| `vimarsa` | -- | List all 7 Vimarsa operators with opcodes and arities |
| `archetypes` | -- | List all 12 archetypal number entries with dimensionality and sub-table info |

Unknown subcommands print usage to stderr and return -1.

---

## 9. Build and Test

All commands should be run from the project root (`Epi-Logos C Experiments/`).

### .rodata Tests (14 tests)

Validates all LUT contents: table sizes, sub-table wiring, virtue anchors, QL cascade,
Siva entries, R-factor complementarity, cross-branch registry, cosmic clock arithmetic,
logos state, formulation sources and signatures.

```
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/m0.c \
    src/test_m0_rodata.c -o test_m0_rodata && ./test_m0_rodata
```

### Init Tests (5 tests)

Validates m0_init creates a valid root, rejects wrong ql_position, verifies holographic
registry, confirms VAK handler registration, and tests teardown/HC_UNLINK.

```
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c \
    src/test_m0_init.c -o test_m0_init && ./test_m0_init
```

### R-Factor + CLI Tests (6 tests)

Validates R-factor weave dispatch across all 12 ticks, R1 ascending sweep, R4 descending
sweep, and CLI dispatch for info/clock/logos subcommands.

```
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c src/m0.c \
    src/test_m0_rfactor.c -o test_m0_rfactor && ./test_m0_rfactor
```

### Full Suite

```
./test_m0_rodata && ./test_m0_init && ./test_m0_rfactor
```

Expected output: 25/25 tests passed (14 + 5 + 6).

---

## 10. Key Invariants

1. **M0_Root.hc is ALWAYS the first field.** All M-branch structs follow this convention
   so that `HC_LINK` and `HC_UNLINK` work generically.

2. **M0 anchors to ql_position == 0 only.** `m0_init` returns NULL if the provided HC
   has any other position. This enforces that M0 is bound to Psychoid_0 (Ground).

3. **All .rodata LUTs are BIMBA (immutable).** `VIMARSA_TABLE`, `ARCHETYPE_LUT`,
   `VIRTUE_LUT`, `QL_STACK`, `NARA_MSHARP_LUT`, `SIVA_TABLE`, `R_FACTOR_ROUTE_TABLE`,
   `ZODIACAL_LUT`, `MONOPOLY_LUT`, `DIVINE_ACT_LUT`, `M0_CROSS_BRANCH_REGISTRY`, and
   `M0_GOVERNING_CF` are all declared `const` and reside in .rodata.

4. **R-factor complementarity: Rx + R(5-x) = 5.** For every route frame where both
   R-factor indices x and 5-x are present (value != 7), their positions sum to 5. This
   is verified in test T9 of `test_m0_rodata.c`.

5. **Cross-branch registry verified at boot.** `m0_verify_holographic_registry()`
   confirms that the CF ID in each of the first 6 registry edges matches the
   corresponding `M0_GOVERNING_CF` entry.

6. **VAK handlers registered during m0_init, cleared on teardown.** After `m0_init`,
   all 6 VAK families (CPF/CT/CP/CF/CFP/CS) have M0 semantic handlers installed.
   After `m0_teardown`, the HC link is cleared via `HC_UNLINK`.

7. **Compiled_Formulation is exactly 16 bytes.** Enforced by `_Static_assert`.
   Spanda_Discriminator is exactly 1 byte. VAK_Instruction is exactly 5 bytes.

8. **GET_PTR before every dereference.** Tagged pointers must be stripped via `GET_PTR()`
   before dereferencing, as the upper bits carry ontological metadata (inversion flag,
   nesting mode, family identifier, archetype position).
