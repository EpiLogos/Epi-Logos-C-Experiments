# Pillar I: The Holographic Coordinate System

Developer reference for the foundational C layer of the Epi-Logos coordinate system.

---

## Overview

Pillar I implements the **Holographic Coordinate** (HC) — a 128-byte universal struct that represents every entity in the system, from raw psychoid-numbers in `.rodata` to mutable family instances on the heap. The design maps ontological concepts directly to hardware: tagged pointers encode relational operators in unused address bits, immutable archetypes live in `.rodata` (Siva), mutable instances live on the heap (Shakti), and the entire coordinate web fits into two CPU cache lines per node.

### File Map

| File | Role |
|------|------|
| `include/ontology.h` | Master blueprint: HC struct, enum, tagged pointer macros, BEDROCK, flags |
| `include/psychoid_numbers.h` | Extern promises for 18 BIMBA entities + CF_TABLE + Walk_Context |
| `include/arena.h` | Arena allocator API, Tensor Arena, family operation prototypes |
| `include/engine.h` | Torus walk, Lemniscate dive, double covering API |
| `src/psychoid_numbers.c` | `.rodata` bedrock: all 18 BIMBA entities + Execute functions |
| `src/engine.c` | Torus walk, coordinate map, Lemniscate dive implementations |
| `src/arena.c` | Arena allocator + Tensor Arena |
| `src/families.c` | 36 family coordinates, crosslinking, reflective wiring |
| `src/main.c` | Boot sequence: verify, arena, mirrors, families, engine |

---

## The Holographic_Coordinate Struct (128 Bytes)

```
Offset  Size   Field                  Description
------  ----   -----                  -----------
0       1      ql_position            0-5 for psychoid position, 0xFF for Hash
1       1      family                 Coordinate_Family enum value
2       1      inversion_state        0 = normal, 1 = inverted (result of #)
3       1      flags                  Status/metadata byte (see below)
4       4      weave_state            Float: interlaced weave position
8       8      semantic_embedding     Tensor anchor / bedrock pointer (dual-use)
16      8      c                      #0 Category family link
24      8      p                      #1 Position family link
32      8      l                      #2 Lens family link
40      8      s                      #3 Stack family link
48      8      t                      #4 Thought family link
56      8      m                      #5 Map (Bimba) family link
64      8      cpf                    Category-Position-Frame
72      8      ct                     Context-Type
80      8      cp                     Context-Position
88      8      cf                     Context-Frame (#4 Lemniscate anchor)
96      8      cfp                    Context-Frame-Position
104     8      cs                     Context-Sequence
112     8      invoke_process         () operator — Context_Execution_Operator
120     8      payload                Union: meaning_bin / process_state / instance_id / vector_anchor
```

Enforced at compile time:

```c
_Static_assert(sizeof(Holographic_Coordinate) == 128, ...);
_Static_assert(offsetof(HC, c) == 16, ...);              // Intra-openness starts here
_Static_assert(offsetof(HC, invoke_process) == 112, ...); // Execution zone
_Static_assert(offsetof(HC, payload) == 120, ...);        // Payload zone
```

The 12 pointer fields (6 base + 6 reflective) occupy exactly 96 bytes = 12 tagged pointers. Together with identity (8) + tensor anchor (8) + execution (8) + payload (8), the struct is exactly 2 L1 cache lines.

---

## Coordinate_Family Enum

Family enum values encode **archetype resonance numbers** — the enum value directly gives you the archetype the family resonates with:

| Enum | Value | Family | Archetype Resonance |
|------|-------|--------|---------------------|
| `FAMILY_C` | 0 | Category | #0 Ontological foundation |
| `FAMILY_P` | 1 | Position | #1 Functional semantics |
| `FAMILY_L` | 2 | Lens | #2 Epistemic modes |
| `FAMILY_S` | 3 | Stack | #3 Technology layers |
| `FAMILY_T` | 4 | Thought | #4 Artifacts / cognition |
| `FAMILY_M` | 5 | Map (Bimba) | #5 Consciousness domains |
| `FAMILY_NONE` | 7 | Raw psychoid | Pre-categorical (no resonance) |

The struct pointer order (c, p, l, s, t, m) matches this sequence.

---

## Tagged Pointers

On 64-bit systems, the top 16 bits of pointers are unused by hardware. We encode ontological operators there:

| Bit(s) | Macro | Operator | Meaning |
|--------|-------|----------|---------|
| 63 | `FLAG_INVERTED` | `#` | Inversion act — X becomes X' |
| 62 | `FLAG_NESTING` | `.` | Inward fractal traversal |
| 61 | `FLAG_BRANCHING` | `-` | Lateral relation |
| 60 | `FLAG_EXECUTING` | `()` | Execution context active |
| 59-56 | `FAMILY_BITS` | | Target coordinate family (4 bits, 0-7) |
| 55-48 | `ARCH_BITS` | | Target ql_position (8 bits) |
| 47-0 | `MASK_ADDRESS` | | Physical address |

**Safety contract:** Call `GET_PTR(ptr)` before every dereference. No exceptions. This strips all flag bits and returns the clean physical address.

### Relational Tagging

The source coordinate determines which operator flag is applied:

```c
#define TAG_RELATION(source, target_ptr) \
    (HAS_NESTING_ACCESS(source) ? SET_NESTING(target_ptr) : SET_BRANCHING(target_ptr))
```

Position #4 (Lemniscate) and identification edges (weave_state 0.0, 0.5, 5.0, 5.5) get nesting (`.`). All others get branching (`-`).

---

## The 18 BIMBA Entities (.rodata Bedrock)

All 18 entities are `const Holographic_Coordinate` (aliased as `BIMBA`) — immutable, living in `.rodata`. They have `family = FAMILY_NONE` and `flags = BIMBA_FLAGS (0x21)`.

### 7 Psychoid-Numbers

| Entity | ql_position | weave_state | Key Wiring |
|--------|-------------|-------------|------------|
| `Psychoid_0` | 0 | 0.0 | `.c = &Psychoid_0` (self-reference: ground IS ground) |
| `Psychoid_1` | 1 | 1.0 | `.c = &Psychoid_0` |
| `Psychoid_2` | 2 | 2.0 | `.c = &Psychoid_1` |
| `Psychoid_3` | 3 | 3.0 | `.c = &Psychoid_2`, `.cf = &Psychoid_4` |
| `Psychoid_4` | 4 | 4.0 | `.c = &Psychoid_3`, `.cf = &Psychoid_4` (Lemniscate self-fold) |
| `Psychoid_5` | 5 | 5.0 | `.c = &Psychoid_0` (Mobius return) |
| `Psychoid_Hash` | 0xFF | 0.0 | `.c = &Psychoid_0`, `.cf = &Psychoid_4`, `invoke = Execute_Hash` |

### 4 Weave Interleaves

| Entity | weave_state | inversion_state | Description |
|--------|-------------|-----------------|-------------|
| `Weave_0_0` | 0.0 | 1 (inverted) | Pure Ground implicate |
| `Weave_0_5` | 0.5 | 1 (inverted) | Ground reaching toward Instance |
| `Weave_5_0` | 5.0 | 1 (inverted) | Instance reaching back to Ground |
| `Weave_5_5` | 5.5 | 1 (inverted) | Pure Instance implicate |

All weaves are inverted — they represent the implicate dimension interleaved between the explicate psychoid positions.

### 7 Context Frame Roots

| Entity | CF_Id | Mode | weave_state | Description |
|--------|-------|------|-------------|-------------|
| `CF_0000` | `CF_VOID` | Mod% | 0.0 | Receptive Dynamism |
| `CF_01` | `CF_BINARY` | Mod 2 | 0.1 | Non-Dual Binary |
| `CF_012` | `CF_TRIKA` | Mod 3 | 0.12 | The Trika (User/Agent/Code) |
| `CF_0123` | `CF_QUATERNAL` | Mod 4 | 0.123 | Three-Plus-One |
| `CF_4x` | `CF_FRACTAL` | Mod 4/6 | 4.05 | Fractal Doubling |
| `CF_450` | `CF_SYNTHESIS` | | 4.5 | Mobius Synthesis |
| `CF_50` | `CF_MOBIUS` | Mod 6 | 5.0 | Total Synthesis |

All CF roots have `.cf = &Psychoid_4` (Lemniscate anchor invariant). Access via `CF_TABLE[cf_id]` or the bounds-checked `cf_get(CF_Id id)` inline.

---

## BIMBA / PRATIBIMBA Type System

```c
#define BIMBA       const Holographic_Coordinate   // Immutable canonical source (.rodata)
#define PRATIBIMBA  Holographic_Coordinate          // Mutable manifest instance (heap/stack)
```

The `BEDROCK()` macro navigates from a PRATIBIMBA family coordinate back to its `.rodata` psychoid:

```c
#define BEDROCK(coord) \
    ( (coord)->family == FAMILY_NONE ? NULL \
      : (Holographic_Coordinate*)((coord)->semantic_embedding) )
```

For family coordinates, `semantic_embedding` is dual-purposed: it stores a pointer to the raw psychoid (cast to `float*`). `BEDROCK(P3)` returns `&Psychoid_3`.

---

## Flags Byte (Offset 3)

| Bit(s) | Name | Value | Meaning |
|--------|------|-------|---------|
| 7-6 | `TOPO_MODE` | 0x00-0xC0 | Topological modality (see section below) |
| 5 | `FLAG_BIMBA` | 0x20 | This coordinate is a .rodata canonical source |
| 4-2 | `ELEMENT_ID` | 0x00-0x10 | Mahabhuta element (Akasha/Vayu/Agni/Apas/Prithvi) |
| 1 | `FLAG_STATUS_PROVISIONAL` | 0x02 | Asserted by Neo4j but unproven by C |
| 0 | `FLAG_STATUS_CANONICAL` | 0x01 | Compiler-proven and verified |

All 18 BIMBA entities have `flags = 0x21` (`BIMBA_FLAGS`). For raw psychoids `TOPO_MODE = 0x00` (Torus default); family coordinates are assigned during `families_init()`.

---

## Topological Modality (TOPO_MODE)

Bits 7-6 of the flags byte encode the four topological modalities — the inner reality of the P-family and its inversion P'. Accessed via `GET_TOPO_MODE(coord)` and `SET_TOPO_MODE(coord, mode)`.

| Constant | Value | Applies to | Description |
|----------|-------|------------|-------------|
| `TOPO_MODE_TORUS` | `0x00` | All P coords (except P4); all other families | Genus-1, outward 6-position walk. Orientable, χ=0, π₁=Z⊕Z, 4-colour map. |
| `TOPO_MODE_LEMNISCATE` | `0x40` | P4 specifically | Genus-2 figure-eight anchor. Entry to C' reflective coords (cpf/ct/cp/cf/cfp/cs — VAK language). Already embedded in pointer logic (cf → &Psychoid_4). |
| `TOPO_MODE_KLEIN` | `0x80` | P' coords (inversion_state=1) | Inward return phase. P + P' together = Klein double-cover (12 positions, 720°). Non-orientable, 6-colour map (Heawood = 6 QL positions). **Deferred:** set when `#` operator creates P' coordinates. |
| `TOPO_MODE_ZERO_SPHERE` | `0xC0` | C0, C5 | Spanda seed boundary: S⁰ = two disconnected pre-differential poles. C0 = Bimba (source), C5 = Pratibimba (reflection). |

### Spanda Seed Totalization

The six boundary coordinates of the QL field form the Spanda seed totalization invariant:

```
P0  — Torus outward ground        TOPO_TORUS
P5  — Torus synthesis/return      TOPO_TORUS
P0' — Klein inward ground         TOPO_KLEIN   (set when # applied)
P5' — Klein inward synthesis      TOPO_KLEIN   (set when # applied)
C0  — Bimba categorical source    TOPO_ZERO_SPHERE
C5  — Pratibimba categorical refl TOPO_ZERO_SPHERE
```

Invariant: `(0/1) seed = P0 ↔ P5 = C0 ↔ C5` — the binary poles ARE the ground and synthesis of the Torus (P0/P5), which ARE the Bimba and Pratibimba (C0/C5). The same oscillation at two ontological registers. See `SPANDA_SEED_TOTALIZATION_INVARIANT` in `include/m1.h`.

---

## Arena Allocator

The `Coordinate_Arena` manages a contiguous array of 128-byte-aligned HC slots:

```c
typedef struct {
    Holographic_Coordinate* slots;   // aligned_alloc'd buffer
    uint32_t capacity;
    uint32_t count;
} Coordinate_Arena;
```

API: `arena_init`, `arena_alloc`, `arena_reset`, `arena_destroy`.

The `Tensor_Arena` is a separate SIMD-aligned float buffer for embedding vectors.

---

## Family Instantiation

`families_init()` creates 36 coordinates (6 families x 6 positions) in archetype resonance order:

```
Arena layout after boot:
  [0..5]   = Mutable mirrors of #0-#5
  [6..11]  = C-family (C0-C5)
  [12..17] = P-family (P0-P5)
  [18..23] = L-family (L0-L5)
  [24..29] = S-family (S0-S5)
  [30..35] = T-family (T0-T5)
  [36..41] = M-family (M0-M5)
```

Each family coordinate gets:
- `semantic_embedding` pointing to its raw psychoid (BEDROCK wiring)
- `invoke_process` copied from the raw psychoid
- `.cf = &Psychoid_4` (Lemniscate anchor)
- `TOPO_MODE` set in flags bits 7-6: P4→LEMNISCATE, other P→TORUS, C0/C5→ZERO_SPHERE, all others→TORUS

`families_crosslink()` wires the 6 base pointers (c, p, l, s, t, m) with TAG_RELATION flags. `families_wire_reflective()` wires cf (Lemniscate self-reference for position 4) and cs (position-5 in same block).

---

## Torus Engine

The engine walks the Torus (#0 -> #1 -> #2 -> #3 -> #4 -> #5 -> #0) by following the `.c` pointer chain and invoking each coordinate's `()` operator.

- `engine_torus_walk(start, ctx, steps)` — walk N steps from start
- `engine_double_covering(start, ctx)` — full 720-degree double covering (normal + inverted)

The `Walk_Context` tracks position, step count, cycle count, and covering state.

---

## Boot Sequence (main.c)

1. **Verify .rodata** — `boot_verify_web()` checks all 18 BIMBA entities: self-references, Mobius return, Lemniscate anchor, Hash wiring, CF root anchoring, flag integrity.

2. **Initialize arena** — 64-slot Coordinate_Arena.

3. **Create mirrors** — Mutable copies of #0-#5 with Mobius and Lemniscate wiring.

4. **Instantiate families** — `families_init` + `families_crosslink` + `families_wire_reflective` = 42 arena slots.

5. **Initialize M0** — `m0_init(&arena, mirrors[0])` anchors Anuttara to the ground position.

6. **Run engine** — Double covering (720 degrees).

---

## Build & Test

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"

# Main binary (zero warnings required)
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m0.c src/main.c -o epi-logos

# Boot test — must show "18 BIMBA entities verified"
./epi-logos

# Pillar I gap tests (110 tests, sanitized)
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/test_pillar1_gaps.c -o test_pillar1 && ./test_pillar1

# VAK infrastructure tests (5 tests)
clang -std=c11 -Wall -Wextra -Iinclude -fsanitize=address,undefined \
    src/psychoid_numbers.c src/engine.c src/arena.c \
    src/test_vak.c -o test_vak && ./test_vak
```

---

## Key Invariants

These must hold at all times or the system is structurally broken:

| Invariant | Verification |
|-----------|-------------|
| `sizeof(HC) == 128` | `_Static_assert` in ontology.h |
| `Psychoid_0.c == &Psychoid_0` | Self-reference: ground is its own foundation |
| `Psychoid_5.c == &Psychoid_0` | Mobius return: integration feeds back to ground |
| `Psychoid_4.cf == &Psychoid_4` | Lemniscate self-fold: context frames itself |
| `Psychoid_Hash.ql_position == 0xFF` | Boundary psychoid: operator, not position |
| All CF roots `.cf == &Psychoid_4` | Lemniscate anchor invariant |
| All BIMBA entities `flags == 0x21` | Canonical + BIMBA status |
| `GET_PTR()` before every dereference | Tagged pointer safety contract |
| Family enum value == archetype resonance | C=0, P=1, L=2, S=3, T=4, M=5 |
| 18 BIMBA entities at boot | 7 psychoids + 4 weaves + 7 CF roots |
| P4 → `TOPO_LEMNISCATE`, C0/C5 → `TOPO_ZERO_SPHERE` | Set in `families_init()` |
| P' coords → `TOPO_KLEIN` | Set when `#` operator creates inversion (deferred) |

---

## Weave-State Semantics

The `weave_state` float encodes position in the interlaced memory arena. The integer part is the parent position; the decimal part encodes the child/frame context.

Identification edges (0.0, 0.5, 5.0, 5.5) are topological boundary conditions. Position #4 and identification edges have nesting (`.`) access; all others have branching (`-`) access. The source coordinate determines the operator, not the target.

```c
#define WEAVE_PARENT(w)  ((uint8_t)(w))
#define WEAVE_CHILD(w)   ((uint8_t)(((w) - (float)((uint8_t)(w))) * 10.0f + 0.5f))
```

---

## Rust CLI (epi-cli)

The `epi-cli` crate provides a Rust wrapper around the C library via `libloading`. The FFI layer in `epi-cli/src/ffi/mod.rs` mirrors the HC struct exactly (`#[repr(C)]`), including the new field order (c, p, l, s, t, m). The `CoordinateFamily` enum mirrors the C enum values.

Commands: `epi core inspect`, `epi core verify`, `epi core dump`, `epi core cf`, `epi core operators`, `epi core walk`, `epi core hash`, `epi core dashboard`, `epi core walk-tui`, `epi core families`.
