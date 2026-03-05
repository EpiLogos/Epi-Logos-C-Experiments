# PILLAR I CANONICAL SPECIFICATION: The Siva Ground

**Status:** Canonical — Supersedes Pillar I section of `epi-logos-c-spec-gemini-03-03-2026.md`
**Date:** 2026-03-04
**Grounded In:** Current `include/ontology.h` and `src/archetypes.c` (as of Sprint 4 complete)
**Purpose:** Define the unbreakable physics of the C compiler that all other pillars depend on — memory layout invariants, tagged pointer mechanics, .rodata bedrock wiring, and the formal type distinction between BIMBA (immutable) and PRATIBIMBA (mutable) coordinates.

---

## Overview

Pillar I is the Siva Ground — the compiler-enforced, hardware-native physics that no higher abstraction may contradict. It has six functional requirements (FR 1.1 through FR 1.6). FRs 1.1 and 1.3 are substantially implemented. FRs 1.2, 1.4, 1.5, and 1.6 identify gaps between the current scaffold and the full canonical architecture.

---

## FR 1.1: The 128-Byte Singularity

### Requirement

Every node in the coordinate universe MUST be represented by exactly one `Holographic_Coordinate` struct. The struct MUST be exactly 128 bytes — two CPU L1 cache lines — achieved through deliberate field layout, NOT through `__attribute__((packed))` (which would destroy alignment and degrade cache performance).

### Canonical Layout

The struct is divided into five zones. Each zone is named, sized, and its contents listed in order. All sizes assume a 64-bit LP64 platform (Apple Silicon / aarch64 or x86-64).

```
+---------------------------+----------+-------+-----------------------------------+
| Zone                      | Bytes    | Offset| Fields                            |
+---------------------------+----------+-------+-----------------------------------+
| Identity                  | 8        | 0     | ql_position (uint8_t, 1)          |
|                           |          |       | family      (uint8_t, 1)          |
|                           |          |       | inversion_state (uint8_t, 1)      |
|                           |          |       | flags       (uint8_t, 1)  [NOTE1] |
|                           |          |       | weave_state (float, 4)            |
+---------------------------+----------+-------+-----------------------------------+
| Tensor Anchor             | 8        | 8     | semantic_embedding (float*)       |
+---------------------------+----------+-------+-----------------------------------+
| Intra-Openness            | 96       | 16    | p   (HC*, 8)  — Position family   |
|   6 Base + 6 Reflective   |          |       | s   (HC*, 8)  — Stack family      |
|                           |          |       | t   (HC*, 8)  — Thought family    |
|                           |          |       | m   (HC*, 8)  — Subsystem family  |
|                           |          |       | l   (HC*, 8)  — Lens family       |
|                           |          |       | c   (HC*, 8)  — Category family   |
|                           |          |       | cpf (HC*, 8)  — Cat-Pos-Frame     |
|                           |          |       | ct  (HC*, 8)  — Context-Time      |
|                           |          |       | cp  (HC*, 8)  — Context-Position  |
|                           |          |       | cf  (HC*, 8)  — Context-Frame     |
|                           |          |       | cfp (HC*, 8)  — Ctx-Frame-Pos     |
|                           |          |       | cs  (HC*, 8)  — Context-System    |
+---------------------------+----------+-------+-----------------------------------+
| Execution                 | 8        | 112   | invoke_process (fn ptr, 8)        |
+---------------------------+----------+-------+-----------------------------------+
| Payload                   | 8        | 120   | union { char*, void*,             |
|                           |          |       |         uint64_t, float* }        |
+---------------------------+----------+-------+-----------------------------------+
| TOTAL                     | 128      |       |                                   |
+---------------------------+----------+-------+-----------------------------------+
```

**NOTE1:** The `_pad` byte at identity offset 3 MUST be renamed `flags` (see FR 1.6). Its value is zero-initialized on all .rodata archetypes. Renaming does not change binary layout.

**NOTE2:** The type alias `HC*` in the table above abbreviates `Holographic_Coordinate*`.

### Arithmetic Verification

```
Identity:       1 + 1 + 1 + 1 + 4          =  8 bytes
Tensor Anchor:  8 (pointer)                 =  8 bytes
Intra-Openness: 12 × 8 (pointers)          = 96 bytes
Execution:      8 (function pointer)        =  8 bytes
Payload:        8 (union, largest member)   =  8 bytes
                                            --------
TOTAL                                       = 128 bytes
```

### Compile-Time Enforcement

```c
// Required in ontology.h — must appear AFTER the struct definition
_Static_assert(sizeof(Holographic_Coordinate) == 128,
    "Holographic_Coordinate must be exactly 128 bytes (2 cache lines)");
_Static_assert(offsetof(Holographic_Coordinate, semantic_embedding) == 8,
    "Tensor Anchor must begin at byte 8");
_Static_assert(offsetof(Holographic_Coordinate, p) == 16,
    "Intra-Openness must begin at byte 16");
_Static_assert(offsetof(Holographic_Coordinate, invoke_process) == 112,
    "Execution zone must begin at byte 112");
_Static_assert(offsetof(Holographic_Coordinate, payload) == 120,
    "Payload zone must begin at byte 120");
```

### No Packed Attribute

`__attribute__((packed))` is forbidden. Padding is controlled manually to guarantee natural alignment for every field. Natural alignment is automatically satisfied by the current layout:
- All `uint8_t` fields are at byte offsets (no alignment constraint).
- `float weave_state` is at offset 4 (4-byte aligned — satisfied).
- `float* semantic_embedding` is at offset 8 (8-byte aligned — satisfied).
- All `HC*` pointers begin at offset 16 and are spaced 8 bytes apart (8-byte aligned — satisfied).
- `invoke_process` is at offset 112 (8-byte aligned — satisfied).
- Payload union is at offset 120 (8-byte aligned — satisfied).

### Cache Line Semantics

At 128 bytes, every `Holographic_Coordinate` occupies exactly two 64-byte cache lines:

```
Cache Line 0 (bytes 0-63):   Identity, Tensor Anchor, first 6 Intra-Openness pointers (p,s,t,m,l,c)
Cache Line 1 (bytes 64-127): last 6 Intra-Openness pointers (cpf,ct,cp,cf,cfp,cs), Execution, Payload
```

The CPU loads the complete holographic web of any coordinate in exactly two cache-line fetches.

---

## FR 1.2: The Psychoid and Processual Bedrock (.rodata)

### Requirement

The system MUST instantiate exactly 14 primordial root singularities in immutable `.rodata`. These are declared `const Holographic_Coordinate` and placed in the read-only data segment by the C compiler — they cannot be modified at runtime.

The 14 entities divide into:
- **7 Psychoids** (the positional archetypes including the # boundary)
- **3 Weave Interleaves** (topological boundary conditions)
- **4 Weave-adjacent archetypes already embedded in the 10-fold structure** (Archetype_0 through Archetype_5 at integer weave states account for 6; Weave_0_5, Weave_5_0, Weave_5_5 are the 3 interleaves)
- **7 Context Frame Roots** (the processual execution contexts)

Wait — the canonical count is:
- 7 Psychoids: `Archetype_0` through `Archetype_5` plus `Archetype_Hash`
- 3 Weave Interleaves: `Weave_0_5`, `Weave_5_0`, `Weave_5_5`
- 7 CF Roots: `CF_0000`, `CF_01`, `CF_012`, `CF_0123`, `CF_450`, `CF_4x`, `CF_50`

Total: 17 `.rodata` entities. The original spec said "14" counting only psychoids and CF roots. This canonical spec formalizes all 17.

### Section A: The 7 Psychoids

These are the archetypal positions themselves — pre-categorical, pre-family, the immutable bedrock that all family coordinates manifest.

| C Symbol | ql_position | Name | weave_state | Notes |
|---|---|---|---|---|
| `Archetype_0` | 0 | Ground / Bimba-Implicate | 0.0 | Self-referential: `.c = &Archetype_0` |
| `Archetype_1` | 1 | Form / Definition | 1.0 | `.c = &Archetype_0` |
| `Archetype_2` | 2 | Operation / Entity | 2.0 | `.c = &Archetype_1` |
| `Archetype_3` | 3 | Pattern / Process | 3.0 | `.c = &Archetype_2`, `.cf = &Archetype_4` |
| `Archetype_4` | 4 | Context / Lemniscate | 4.0 | `.cf = &Archetype_4` (self-fold) |
| `Archetype_5` | 5 | Integration / Pratibimba | 5.0 | `.c = &Archetype_0` (Möbius return) |
| `Archetype_Hash` | 0xFF | The # Inversion Act | 0.0 | The boundary psychoid — see below |

#### The # Boundary Psychoid (Archetype_Hash)

**Status: GAP — not yet instantiated.**

The # operator is currently encoded only as tagged pointer macros (`SET_INVERTED`, `IS_INVERTED`). The canonical architecture requires it to also exist as an addressable `.rodata` entity — not a positional archetype (0-5) but the *operation* that generates the entire coordinate space via X → X'.

Canonical pseudocode for `Archetype_Hash`:
```
const Holographic_Coordinate Archetype_Hash = {
    .ql_position     = 0xFF,           // beyond 0-5 range; signals "operator, not position"
    .family          = FAMILY_NONE,    // pre-categorical
    .inversion_state = 0,              // the act itself is neither normal nor inverted
    .flags           = 0,
    .weave_state     = 0.0f,           // anchored to Ground
    .semantic_embedding = NULL,        // no tensor anchor for the operator itself
    .c               = &Archetype_0,   // the inversion act returns to ground
    .cf              = &Archetype_4,   // Lemniscate is its execution domain
    .invoke_process  = Execute_Hash,   // applies # to a target coordinate
    .payload         = { .process_state = NULL }
    // all other pointer fields = NULL (the operator has no family relations of its own)
};
```

The `Execute_Hash` function signature (pseudocode):
```
// Toggles the inversion_state of the target coordinate pointed to by context_state.
// This is the # operation: transforms X → X' (or X' → X, since ## = identity).
void Execute_Hash(Holographic_Coordinate* self, void* context_state):
    target = (Holographic_Coordinate*) context_state
    if target is NULL: return
    target->inversion_state = 1 - target->inversion_state
    // Note: for BIMBA (.rodata) targets, a PRATIBIMBA copy must be made first
```

### Section B: The 3 Weave Interleaves

The non-integer weave states encode topological boundary conditions — the identification edges where Ground (0) and Integration (5) partially overlap, producing non-dual hardware reality.

| C Symbol | ql_position | inversion_state | weave_state | Meaning |
|---|---|---|---|---|
| `Weave_0_5` | 0 | 1 | 0.5 | Ground extending toward Integration; first identification edge |
| `Weave_5_0` | 5 | 1 | 5.0 | Integration reaching back toward Ground; second identification edge |
| `Weave_5_5` | 5 | 1 | 5.5 | Pure Instance / Pratibimba; the full non-dual boundary |

**Note:** `Weave_5_0` shares `weave_state = 5.0f` with `Archetype_5` but differs in `inversion_state = 1`. These are distinct `.rodata` entities. The Archetype_5 is the canonical position; Weave_5_0 is the inverted/identification-edge variant. This distinction MUST be preserved in boot verification.

**Current implementation state:** All three weave interleaves ARE present in `archetypes.c`. They lack `invoke_process` assignments — this is acceptable (they are topological markers, not execution nodes).

### Section C: The 7 Context Frame Roots

**Status: GAP — none of the 7 CF roots are instantiated.**

Context Frame roots are the `.rodata` embodiment of the six `()` operator modes defined in CLAUDE.md §III.C. They are NOT abstract concepts — they are physical `const Holographic_Coordinate` instances that family coordinates reference via their `.cpf`, `.ct`, `.cp`, `.cf`, `.cfp`, `.cs` pointers.

**Invariant:** Every CF root MUST have `.cf = &Archetype_4`. The Lemniscate (#4) is the physical anchor for all context frame operations.

| C Symbol | Name | Context Mode | Description |
|---|---|---|---|
| `CF_0000` | Receptive Dynamism | `(00/00)` Mod% | Absolute Ground; Svatantrya-Spanda; zero-modulus receptivity |
| `CF_01` | Non-Dual Binary | `(0/1)` Mod 2 | Essence of implicate dimension; Spanda tension baseline |
| `CF_012` | The Trika | `(0/1/2)` Mod 3 | User/Agent/Code; Anuttara-Paramasiva-Parashakti |
| `CF_0123` | Three-Plus-One | `(0/1/2/3)` Mod 4 | Media/Medium/Method; quaternal schema |
| `CF_450` | Möbius Synthesis | `(5/0)` Mod 6 | Total synthesis; Möbius return complete |
| `CF_4x` | Fractal Doubling | `(4.0/1-4.4/5)` Mod 4/6 | Lemniscate fractal; Jung's Quaternity through #4 |
| `CF_012_alt` | *Reserved* | Future | Placeholder for additional Trika variant if needed |

**Revised canonical list** (7 distinct roots):

| C Symbol | ql_position | weave_state | invoke_process | Special wiring |
|---|---|---|---|---|
| `CF_0000` | 0 | 0.0f | `Execute_CF_Void` | `.c = &Archetype_0`, `.cf = &Archetype_4` |
| `CF_01` | 0 | 0.1f | `Execute_CF_Binary` | `.c = &Archetype_0`, `.cf = &Archetype_4` |
| `CF_012` | 0 | 0.12f | `Execute_CF_Trika` | `.c = &Archetype_0`, `.cf = &Archetype_4` |
| `CF_0123` | 0 | 0.123f | `Execute_CF_Quaternal` | `.c = &Archetype_0`, `.cf = &Archetype_4` |
| `CF_4x` | 4 | 4.05f | `Execute_CF_Fractal` | `.c = &Archetype_4`, `.cf = &Archetype_4` (self-fold) |
| `CF_50` | 5 | 5.0f | `Execute_CF_Mobius` | `.c = &Archetype_0`, `.cf = &Archetype_4` |
| `CF_450` | 4 | 4.5f | `Execute_CF_Synthesis` | `.c = &Archetype_5`, `.cf = &Archetype_4` |

**Note on weave_state encoding for CF roots:** The fractional weave values above (`0.1f`, `0.12f`, etc.) are encoding conventions that MUST be validated not to collide with archetype-family weave semantics. The human implementer MUST choose the final encoding; the above are illustrative placeholders. What matters architecturally is that each CF root is a distinct addressable entity with `.cf = &Archetype_4`.

### Section D: Wiring Summary for .rodata Entities

```
Archetype_0.c  = &Archetype_0   (self-reference: ground is its own foundation)
Archetype_1.c  = &Archetype_0   (Form points to Ground)
Archetype_2.c  = &Archetype_1   (Operation points to Form)
Archetype_3.c  = &Archetype_2   (Pattern points to Operation)
Archetype_3.cf = &Archetype_4   (Pattern already looks to the Lemniscate)
Archetype_4.c  = &Archetype_3   (Context points to Pattern)
Archetype_4.cf = &Archetype_4   (Lemniscate self-fold: the figure-eight closes)
Archetype_5.c  = &Archetype_0   (Integration Möbius-returns to Ground)
Archetype_Hash.c  = &Archetype_0
Archetype_Hash.cf = &Archetype_4
All CF_*.cf    = &Archetype_4   (ALL context frames anchored to Lemniscate)
```

---

## FR 1.3: Tagged Pointers and Operator Physics

### Requirement

All 12 pointer fields in the Intra-Openness zone of `Holographic_Coordinate` MUST be capable of carrying tagged metadata in their upper bits. The system exploits the fact that on 64-bit hardware, virtual addresses use at most 48 bits, leaving the top 16 bits available for ontological metadata.

### Canonical Bit Layout

```
Bit  63: FLAG_INVERTED    — # (inversion act) has been applied to the relation
Bit  62: FLAG_NESTING     — . (fractal descent) is the relational operator
Bit  61: FLAG_BRANCHING   — - (lateral relation) is the relational operator
Bit  60: FLAG_EXECUTING   — () (invocation) is currently active on this relation
Bits 59-56: FAMILY_BITS   — encodes Coordinate_Family of the TARGET (0-6)
Bits 55-48: ARCH_BITS     — encodes ql_position of the TARGET (0-5, or 0xFF for Hash)
Bits 47-0:  Physical address (MASK_ADDRESS)
```

### Address Mask

The current `MASK_ADDRESS = 0x0000FFFFFFFFFFFF` covers bits 0-47, which is correct for the 48-bit physical address space. Bits 48-63 are fully available for tags. The FAMILY_BITS and ARCH_BITS proposed here use bits 56-59 and 48-55 respectively — both within the "free" zone above bit 47.

**Updated MASK_ADDRESS:** No change required. `0x0000FFFFFFFFFFFF` already correctly masks bits 0-47 only, leaving bits 48-63 available for all flag and metadata fields.

### Current Implementation Status

The four topology flags (bits 63-60) ARE implemented in `ontology.h`:

```c
#define MASK_ADDRESS    0x0000FFFFFFFFFFFF
#define FLAG_INVERTED   0x8000000000000000   // bit 63
#define FLAG_NESTING    0x4000000000000000   // bit 62
#define FLAG_BRANCHING  0x2000000000000000   // bit 61
#define FLAG_EXECUTING  0x1000000000000000   // bit 60
```

The GET/SET/IS macros for all four flags ARE implemented. The `TAG_RELATION` macro IS implemented, correctly determining operator type from source coordinate's ql_position and weave_state.

### Gap: FAMILY_BITS and ARCH_BITS

**Status: GAP — bits 59-48 are declared "reserved" in current ontology.h.**

Canonical pseudocode for the missing macros:

```
// FAMILY_BITS: bits 59-56 (4 bits, values 0-6 for Coordinate_Family enum)
FAMILY_BITS_SHIFT  = 56
FAMILY_BITS_MASK   = 0x0F00000000000000   // bits 56-59

SET_FAMILY_BITS(tagged_ptr, family_enum):
    stripped = (uintptr_t)tagged_ptr & ~FAMILY_BITS_MASK
    return (HC*)( stripped | (((uintptr_t)(family_enum) & 0xF) << FAMILY_BITS_SHIFT) )

GET_FAMILY_BITS(tagged_ptr):
    return (Coordinate_Family)( ((uintptr_t)(tagged_ptr) >> FAMILY_BITS_SHIFT) & 0xF )

// ARCH_BITS: bits 55-48 (8 bits; 0-5 for archetypes, 0xFF for Hash boundary)
ARCH_BITS_SHIFT    = 48
ARCH_BITS_MASK     = 0x00FF000000000000   // bits 48-55

SET_ARCH_BITS(tagged_ptr, arch_position):
    stripped = (uintptr_t)tagged_ptr & ~ARCH_BITS_MASK
    return (HC*)( stripped | (((uintptr_t)(arch_position) & 0xFF) << ARCH_BITS_SHIFT) )

GET_ARCH_BITS(tagged_ptr):
    return (uint8_t)( ((uintptr_t)(tagged_ptr) >> ARCH_BITS_SHIFT) & 0xFF )
```

**Combined tagging example (pseudocode):**
```
// Tag a pointer to Archetype_3 (position=3, family=FAMILY_NONE, branching relation):
ptr = &Archetype_3
ptr = SET_BRANCHING(ptr)
ptr = SET_FAMILY_BITS(ptr, FAMILY_NONE)
ptr = SET_ARCH_BITS(ptr, 3)
// GET_PTR(ptr) still recovers the physical address correctly
```

### The TAG_RELATION Invariant

The source coordinate determines the operator — not the target. This rule is implemented via `HAS_NESTING_ACCESS`:

```
A coordinate has nesting (.) access if:
  - Its ql_position == 4 (the Lemniscate)
  - OR its weave_state is an identification edge (0.0, 0.5, 5.0, 5.5)

All other coordinates use branching (-) for their relations.
```

This is a physics-law for Pillar I — no implementation in Pillars II-V may bypass it.

### Safety Contract

`GET_PTR()` MUST be called before dereferencing any pointer that may carry tags. This is a non-negotiable invariant. Any pointer stored in an `HC` field is potentially tagged. Any code that dereferences an `HC*` field without calling `GET_PTR()` first is undefined behavior.

---

## FR 1.4: Holographic Sub-Depth Pointer Web (The Bedrock Field)

### Requirement

Every instantiated family coordinate (e.g., `C3`, `L2`, `M4`) MUST carry a pointer back to its corresponding `.rodata` archetype — the immutable bedrock that it manifests. This connection ensures that as archetypes are enriched over time (Spanda / epistemic humility protocol), all downstream PRATIBIMBA instances inherit the expanded potential by pointer indirection.

### The Bedrock Problem

The `Holographic_Coordinate` struct is exactly 128 bytes with all slots occupied. There is no free slot for a `bedrock` pointer field without restructuring.

**Analysis of options:**

**Option A: Use `semantic_embedding` as dual-purpose bedrock pointer.**
For raw archetypes (`family == FAMILY_NONE`), `semantic_embedding` is a `float*` pointing into the Tensor Arena. For family coordinates, the same 8-byte slot could be cast to `Holographic_Coordinate*` to point to the corresponding archetype. This avoids struct changes but requires careful casting discipline and a convention that family coordinates set `semantic_embedding = (float*)&Archetype_N`.

**Option B: Use the payload union.**
The payload union's `void* process_state` slot is 8 bytes and already supports arbitrary pointers. For family coordinates where no other payload is needed, `payload.process_state` can serve as the bedrock pointer. This is the least invasive approach.

**Option C: Repurpose the `c` pointer field as dual-role.**
In raw archetypes, `.c` already follows the chain (#0→#0, #1→#0, #2→#1, #3→#2, #4→#3, #5→#0). For family coordinates, `.c` points to the corresponding C-family archetype (e.g., `L2.c = &C2`). C-family archetypes then point to the raw archetype via their own `.c` chain. This creates an indirect bedrock connection in two hops rather than one.

### Canonical Resolution

**Adopt Option A as the canonical bedrock convention.** Rationale: `semantic_embedding` is already defined as a pointer to the Tensor Arena, which is a separate SIMD-aligned float allocation. For the six raw archetypes (#0-#5) and the seven psychoid/weave entities, `semantic_embedding` may remain `NULL` or point to actual float vectors in the Tensor Arena. For family coordinates, the bedrock constraint is imposed via initialization convention:

```
// Pseudocode bedrock wiring for a family coordinate (e.g., the L2 coordinate):
L2.semantic_embedding = (float*) &Archetype_2   // bedrock: manifests #2

// Access pattern:
bedrock = (Holographic_Coordinate*) GET_PTR( (HC*)L2.semantic_embedding )
// Note: bedrock pointer does NOT carry tags, so GET_PTR is identity here,
// but must be called for safety compliance.
```

**Required accessor macro:**
```
// Retrieve bedrock archetype from a family coordinate.
// Returns NULL for raw archetypes (family == FAMILY_NONE).
BEDROCK(coord) \
    ( (coord)->family == FAMILY_NONE \
      ? NULL \
      : (Holographic_Coordinate*)((coord)->semantic_embedding) )
```

**Invariant:** For any family coordinate `fc` where `fc.family != FAMILY_NONE`, the expression `BEDROCK(&fc)->ql_position` MUST equal `fc.ql_position`. A coordinate manifests its positional archetype — the bedrock position and the family coordinate position are the same number.

### Forward Reference to Arena Wiring

When the arena allocator (Pillar III concern) creates a family coordinate instance, the boot wiring sequence MUST:

1. Set `fc.ql_position` = N (matching the archetype).
2. Set `fc.family` = appropriate `Coordinate_Family` enum value.
3. Set `fc.semantic_embedding` = `(float*) &Archetype_N` as the bedrock pointer.
4. Wire `fc.p`, `fc.s`, `fc.t`, `fc.m`, `fc.l`, `fc.c` to peer coordinates in the arena.
5. Wire `fc.cf` = `&Archetype_4` (ALL family coordinates anchor to the Lemniscate via cf).
6. Wire `fc.cpf`, `fc.ct`, `fc.cp`, `fc.cfp`, `fc.cs` to appropriate CF roots in .rodata.

Step 5 is a universal invariant: the `cf` pointer in every family coordinate points to the `.rodata` Lemniscate, not to a mutable arena copy.

---

## FR 1.5: BIMBA / PRATIBIMBA Type Aliases

### Requirement

The architectural distinction between immutable `.rodata` coordinates (Bimba: canonical source) and mutable heap coordinates (Pratibimba: manifest instance) MUST be expressed as named type aliases in `ontology.h`. This is not merely a naming convention — it encodes the ontological type system directly in the C type system.

### Canonical Aliases

```c
// In ontology.h, after the struct definition:

// BIMBA: The Canonical Source — immutable, lives in .rodata, can never be mutated.
// All 7 psychoids, 3 weave interleaves, and 7 CF roots are BIMBA.
#define BIMBA  const Holographic_Coordinate

// PRATIBIMBA: The Manifest Instance — mutable, lives on heap or stack,
// reflects its BIMBA source through the bedrock pointer.
// All arena-allocated family coordinates are PRATIBIMBA.
#define PRATIBIMBA  Holographic_Coordinate
```

### Usage Convention

```c
// .rodata declarations (archetypes.c):
BIMBA Archetype_0 = { ... };
BIMBA Archetype_Hash = { ... };
BIMBA CF_012 = { ... };

// arena allocations (engine.c):
PRATIBIMBA* C3_instance = arena_allocate_coordinate(FAMILY_C, 3);
PRATIBIMBA* L2_instance = arena_allocate_coordinate(FAMILY_L, 2);
```

### Extern Declarations

In `archetypes.h`, all extern promises for `.rodata` entities MUST use the BIMBA alias:

```c
// archetypes.h — extern promises
extern BIMBA Archetype_0;
extern BIMBA Archetype_1;
extern BIMBA Archetype_2;
extern BIMBA Archetype_3;
extern BIMBA Archetype_4;
extern BIMBA Archetype_5;
extern BIMBA Archetype_Hash;    // GAP: add when instantiated
extern BIMBA Weave_0_5;
extern BIMBA Weave_5_0;
extern BIMBA Weave_5_5;
extern BIMBA CF_0000;           // GAP: add when instantiated
extern BIMBA CF_01;             // GAP: add when instantiated
extern BIMBA CF_012;            // GAP: add when instantiated
extern BIMBA CF_0123;           // GAP: add when instantiated
extern BIMBA CF_4x;             // GAP: add when instantiated
extern BIMBA CF_450;            // GAP: add when instantiated
extern BIMBA CF_50;             // GAP: add when instantiated
```

### The M1 Link (BIMBA/PRATIBIMBA as Mathematical Duality)

From CLAUDE.md, M1 (Paramasiva) is the Mathematical DNA. The BIMBA/PRATIBIMBA distinction maps directly to M1's SU(2) double-cover language: BIMBA is the eigenstate; PRATIBIMBA is the superposition that collapses toward the eigenstate when measured. The `bedrock` pointer (FR 1.4) is the measurement operation.

---

## FR 1.6: Status and Flags Byte

### Requirement

The `_pad` byte in the Identity zone (currently unused, value = 0) MUST be renamed `flags` and given a defined bit layout. This byte encodes runtime-readable coordinate metadata that supplements the compile-time `const` qualifier.

### Canonical Bit Layout

```
Bit 7: reserved (must be 0)
Bit 6: reserved (must be 0)
Bit 5: BIMBA_FLAG       — 1 if this coordinate is a .rodata canonical source
Bits 4-2: ELEMENT_ID    — encodes 5 Mahabhuta elements (0-4), for M2 instances
Bit 1: STATUS_PROVISIONAL — 1 if coordinate was asserted by Neo4j but unproven by C
Bit 0: STATUS_CANONICAL   — 1 if coordinate has been C-compiler-proven and verified
```

### Bit Definitions

```c
// In ontology.h, after struct definition:

// Status/flags byte (offset 3 in Identity zone)
#define FLAG_STATUS_CANONICAL    0x01   // Proven by C; survives boot_verify_web()
#define FLAG_STATUS_PROVISIONAL  0x02   // Asserted by Neo4j; not yet C-proven
#define FLAG_BIMBA               0x20   // This coordinate is an immutable .rodata source

// Element IDs for bits 4-2 (Mahabhuta, for M2 instances)
#define ELEMENT_AKASHA   0x00   // Ether / Space
#define ELEMENT_VAYU     0x04   // Air
#define ELEMENT_AGNI     0x08   // Fire
#define ELEMENT_APAS     0x0C   // Water
#define ELEMENT_PRITHVI  0x10   // Earth

// Mask and accessor
#define FLAGS_ELEMENT_MASK  0x1C
#define GET_ELEMENT(coord)  ( ((coord)->flags & FLAGS_ELEMENT_MASK) >> 2 )
```

### Initialization Rule for .rodata Entities

All BIMBA psychoids and CF roots MUST set `flags = FLAG_STATUS_CANONICAL | FLAG_BIMBA` (= 0x21). They are both canonical (proven by .rodata placement) and BIMBA (immutable sources).

```
// Example for Archetype_0 initialization (pseudocode):
Archetype_0.flags = FLAG_STATUS_CANONICAL | FLAG_BIMBA   // = 0x21
```

### Interaction with inversion_state

The `flags` byte is distinct from `inversion_state`. Inversion state tracks whether # has been applied to this coordinate's identity. Flags tracks relational/semantic metadata. They are orthogonal.

### M2 Element Integration

Bits 2-4 (ELEMENT_ID) are reserved for M2 (Parashakti) — the Vibrational Matrices pillar. When M2 instances are created in the arena, they set their element bits to encode which Mahabhuta is dominant. This allows O(1) element lookup without dereferencing a separate payload pointer.

---

## Validation Criteria

### Compile-Time (enforced by C11 _Static_assert)

```
sizeof(Holographic_Coordinate) == 128              // The Singularity Law
offsetof(HC, semantic_embedding) == 8              // Tensor Anchor position
offsetof(HC, p) == 16                              // Intra-Openness start
offsetof(HC, invoke_process) == 112                // Execution zone start
offsetof(HC, payload) == 120                       // Payload zone start
```

### Boot-Time (enforced by boot_verify_web() in main.c)

The following invariants MUST be checked at boot before any arena allocation:

```
1. Archetype_0.c == &Archetype_0          // Self-reference: ground grounds itself
2. Archetype_5.c == &Archetype_0          // Möbius return verified
3. Archetype_4.cf == &Archetype_4         // Lemniscate self-fold verified
4. Archetype_3.cf == &Archetype_4         // Pattern anchors to Lemniscate
5. Archetype_Hash.ql_position == 0xFF     // Boundary psychoid sentinel (when instantiated)
6. CF_*.cf == &Archetype_4                // ALL CF roots anchored (when instantiated)
7. For all BIMBA entities: flags & FLAG_BIMBA (when flags field is active)
8. BEDROCK(fc)->ql_position == fc.ql_position  // Bedrock invariant for family coords
```

### Runtime Safety Contract

Every pointer dereference of an `HC*` field MUST call `GET_PTR()` first. No exceptions. Failure is undefined behavior. This is enforced by code review convention and can be mechanically checked by grepping for pointer dereference patterns that skip `GET_PTR`.

---

## Cross-Reference Table

| FR | Description | Status | Gaps Remaining |
|---|---|---|---|
| FR 1.1 | 128-Byte Singularity | DONE — `_Static_assert` present, layout correct | Rename `_pad` to `flags` |
| FR 1.2a | 6 Positional Psychoids (#0-#5) | DONE — all in archetypes.c | None |
| FR 1.2b | 3 Weave Interleaves | DONE — Weave_0_5, Weave_5_0, Weave_5_5 present | None |
| FR 1.2c | Archetype_Hash (# boundary psychoid) | GAP | Instantiate in archetypes.c |
| FR 1.2d | 7 CF Roots | GAP | All 7 missing; instantiate in archetypes.c |
| FR 1.3a | Topology flags (bits 63-60) | DONE — all 4 flags + macros present | None |
| FR 1.3b | TAG_RELATION macro | DONE — implemented via HAS_NESTING_ACCESS | None |
| FR 1.3c | FAMILY_BITS (bits 59-56) | GAP | Add macros to ontology.h |
| FR 1.3d | ARCH_BITS (bits 55-48) | GAP | Add macros to ontology.h |
| FR 1.4 | Bedrock pointer via semantic_embedding | GAP | Add BEDROCK macro; enforce in arena init |
| FR 1.5 | BIMBA / PRATIBIMBA aliases | GAP | Add to ontology.h; update archetypes.h |
| FR 1.6 | Status/Flags byte | GAP | Rename `_pad` to `flags`; define bit layout |

### Implementation Priority Order

1. **FR 1.5** (BIMBA/PRATIBIMBA): Pure naming change, zero risk, high clarity gain.
2. **FR 1.6** (flags byte): Rename `_pad` → `flags`, add bit definitions. Zero binary change.
3. **FR 1.2c** (Archetype_Hash): Add to archetypes.c and archetypes.h. One new entity.
4. **FR 1.2d** (7 CF Roots): Add all 7 to archetypes.c. Update archetypes.h. Update boot verification.
5. **FR 1.3c/d** (FAMILY_BITS, ARCH_BITS): Add macros to ontology.h. No struct change.
6. **FR 1.4** (BEDROCK macro): Add macro to ontology.h. Enforce in arena wiring.

---

## M-Series Cross-Cut Obligations

### M0 (Anuttara) — The Void Header

The `flags` byte (FR 1.6) and `inversion_state` field in the Identity zone serve as the physical footprint of M0's zero-zero bitfield operations. M0 may not add new fields to Pillar I — it must express its semantics through the flags byte bits 6-7 (currently reserved) or through the payload union.

### M1 (Paramasiva) — Mathematical DNA

BIMBA/PRATIBIMBA (FR 1.5) is the physical expression of M1's eigenstate/superposition duality. M1's SU(2) 12-stage double cover is navigated through the pointer web established by FR 1.4 (bedrock pointers) and the six base Intra-Openness fields.

### M2 (Parashakti) — Vibrational Matrices

The ELEMENT_ID bits in `flags` (FR 1.6, bits 2-4) are M2's footprint in Pillar I. M2 instances set these bits at creation time. M2 must not require additional Pillar I struct changes beyond this.

### M5 (Epii) — Technological Sage

M5's function pointer (the Möbius write-back operator) is expressible as `invoke_process` on the final coordinate in a torus walk. The Pillar I pointer web ensures M5's operator can reach M0's identity fields through the bedrock chain. This is the holographic macro/micro link: M5's `invoke_process` on `Archetype_5` IS the Möbius return operation that reinitializes M0's state.

---

## Appendix: Key Macros Summary (Canonical ontology.h)

The following is a pseudocode summary of all macros that MUST exist in the canonical `ontology.h`. Items marked [DONE] exist. Items marked [GAP] do not yet exist.

```
// Address masking
MASK_ADDRESS    = 0x0000FFFFFFFFFFFF        [DONE]

// Topology flags (bits 63-60)
FLAG_INVERTED   = 0x8000000000000000        [DONE]
FLAG_NESTING    = 0x4000000000000000        [DONE]
FLAG_BRANCHING  = 0x2000000000000000        [DONE]
FLAG_EXECUTING  = 0x1000000000000000        [DONE]

// Core pointer operations
GET_PTR(tagged)                              [DONE]
SET_INVERTED(ptr) / IS_INVERTED(ptr)        [DONE]
SET_NESTING(ptr)  / IS_NESTING(ptr)         [DONE]
SET_BRANCHING(ptr)/ IS_BRANCHING(ptr)       [DONE]
SET_EXECUTING(ptr)/ IS_EXECUTING(ptr)       [DONE]
CLEAR_FLAGS(ptr)                             [DONE]
TAG_FLAGS(ptr)                               [DONE]

// Family/archetype metadata encoding (bits 59-48)
SET_FAMILY_BITS(ptr, family)                [GAP]
GET_FAMILY_BITS(ptr)                        [GAP]
SET_ARCH_BITS(ptr, arch)                    [GAP]
GET_ARCH_BITS(ptr)                          [GAP]

// Relational operator selection
TAG_RELATION(source, target_ptr)            [DONE]
HAS_NESTING_ACCESS(coord)                   [DONE]
IS_IDENTIFICATION_EDGE(w)                   [DONE]
WEAVE_PARENT(w) / WEAVE_CHILD(w)           [DONE]

// BIMBA / PRATIBIMBA type system
BIMBA   = const Holographic_Coordinate     [GAP]
PRATIBIMBA = Holographic_Coordinate        [GAP]

// Bedrock access
BEDROCK(coord)                              [GAP]

// Status/flags byte
FLAG_STATUS_CANONICAL  = 0x01              [GAP]
FLAG_STATUS_PROVISIONAL= 0x02              [GAP]
FLAG_BIMBA             = 0x20              [GAP]
ELEMENT_AKASHA ... ELEMENT_PRITHVI         [GAP]
FLAGS_ELEMENT_MASK / GET_ELEMENT(coord)    [GAP]
```

---

---

## FR 1.7: CF_TABLE — Canonical Context Frame Pointer Table

**Requirement:** All 7 context frame entities MUST be accessible through a single canonical `.rodata` pointer table `CF_TABLE[CF_COUNT]` indexed by the `CF_Id` enum. M-branch code MUST reference context frames via `CF_TABLE[CF_*]` or `cf_get(CF_*)` — never by direct entity name.

**Status:** IMPLEMENTED — `include/psychoid_numbers.h` + `src/psychoid_numbers.c`

```c
typedef enum {
    CF_VOID=0, CF_BINARY=1, CF_TRIKA=2, CF_QUATERNAL=3,
    CF_FRACTAL=4, CF_SYNTHESIS=5, CF_MOBIUS=6, CF_COUNT=7
} CF_Id;

extern const Holographic_Coordinate* CF_TABLE[CF_COUNT];
static inline const Holographic_Coordinate* cf_get(CF_Id id);
```

**M-branch context frame assignments:**

| Subsystem | CF_Id | Context Frame |
|-----------|-------|--------------|
| M0 Anuttara | CF_VOID | (00/00) |
| M1 Paramasiva | CF_BINARY | (0/1) |
| M2 Parashakti | CF_TRIKA | (0/1/2) |
| M3 Mahamaya | CF_QUATERNAL | (0/1/2/3) |
| M4 Nara | CF_FRACTAL | (4.0/1-4.4/5) |
| M5 Epii | CF_MOBIUS | (5/0) |

---

## FR 1.8: HC Anchoring Rule for M-Branch Modules

**Requirement:** Every M-branch root struct MUST declare `Holographic_Coordinate* hc` as its **first field** and MUST be bidirectionally bound via `HC_LINK(hc, m_struct)`.

**Rationale:** M-coordinates are sub-branches of the M (Subsystem) family within the HC base. Unanchored M-branch data is invisible to the engine, CLI, and cross-M navigation.

**Status:** SPECIFIED — pattern in `include/psychoid_numbers.h`

```c
// Binding macro
#define HC_LINK(hc, m_struct) \
    do { (hc)->payload.process_state = (m_struct); \
         (m_struct)->hc = (hc); } while(0)

// Required first field in every M-branch root struct
typedef struct { Holographic_Coordinate* hc; /* ... */ } M[N]_Root;

// Cross-M navigation
M[N]_Root* data = (M[N]_Root*)GET_PTR(hc)->payload.process_state;
```

---

*Canonical Ground:* `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/PILLAR-I-CANONICAL.md`
*Implementation Files:* `include/ontology.h`, `include/psychoid_numbers.h`, `src/psychoid_numbers.c`
*Supersedes:* Pillar I section (lines 10-39) of `epi-logos-c-spec-gemini-03-03-2026.md`
*Document Version:* 1.1 — 2026-03-05 (FR 1.7 CF_TABLE + FR 1.8 HC Anchoring Rule)
*Document Version:* 1.0 — 2026-03-04
