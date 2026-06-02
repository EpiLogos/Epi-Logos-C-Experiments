# Epi-Logos C — Full Implementation Design

**Date:** 2026-03-02
**Approach:** Vertical Slice (Option B) — prove architecture on one coordinate, then replicate
**Scope:** Full CLAUDE.md spec, all 4 layers

---

## Decisions Locked

1. **One universal struct** — `Holographic_Coordinate` at 128 bytes for everything (#0-#5 raw archetypes AND family coordinates). Distinguished by `family` field (`FAMILY_NONE` for raw archetypes).
2. **Rewrite in-place** — same file structure (include/, src/), contents rewritten to match corrected spec.
3. **Minimal assert macros** — custom `test_framework.h`, zero external dependencies.
4. **#0-#5 are the foundation** — C0-C5 are C-family manifestations, not top-level. Current code naming is wrong and gets corrected.
5. **Tests first** — test infrastructure is Sprint 0 before any feature work.
6. **Weave-state semantics** — The four values 0.0, 0.5, 5.0, 5.5 are identification edges (topological boundary conditions). All other weave_state values (including decimals like 3.2, 4.6) are inter-identification process frames. The integer part = parent position, decimal part = child/frame context. For family coordinates, the decimal encodes the family index (e.g. C3 = 3.6, P0 = 0.1). Only #4 and identification edges have `.` (nesting) access; all other positions use `-` (branching). The SOURCE coordinate determines the operator, not the target. This is enforced via `TAG_RELATION()` macro when wiring pointers.

---

## The Struct (128 bytes)

```
Holographic_Coordinate (128 bytes)
├── Identity (8 bytes)
│   ├── ql_position      (uint8)  — 0-5, which archetype position
│   ├── family           (uint8)  — enum: FAMILY_NONE=0, P=1, S=2, T=3, M=4, L=5, C=6
│   ├── inversion_state  (uint8)  — 0=normal, 1=inverted (result of # applied)
│   ├── _pad             (uint8)
│   └── weave_state      (float)  — 0.0, 0.5, 1.0, ... 5.5
├── Tensor Anchor (8 bytes)
│   └── semantic_embedding (float*)
├── Intra-Openness (96 bytes = 12 tagged pointers)
│   ├── 6 base:       p, s, t, m, l, c
│   └── 6 reflective: cpf, ct, cp, cf, cfp, cs
├── Execution (8 bytes)
│   └── invoke_process (function pointer)
└── Payload (8 bytes)
    └── union { char* meaning_bin; void* process_state;
                uint64_t instance_id; float* vector_anchor; }
```

---

## Tagged Pointers

```
Bit 63: # (FLAG_INVERTED)   — the inversion act
Bit 62: . (FLAG_NESTING)    — inward fractal traversal
Bit 61: - (FLAG_BRANCHING)  — lateral relation
Bit 60: () (FLAG_EXECUTING) — execution context active
Bits 59-48: reserved
Bits 47-0: physical address
```

Complete macro set: GET_PTR, SET/IS_INVERTED, SET/IS_NESTING, SET/IS_BRANCHING, SET/IS_EXECUTING, CLEAR_FLAGS, TAG_FLAGS.

**Safety contract:** `GET_PTR(ptr)` before EVERY dereference. No exceptions. AddressSanitizer catches violations.

---

## Arena Allocator

- `aligned_alloc(128, capacity * 128)` — each slot on 128-byte boundary
- 10-fold interlaced region (slots 0-9) mirrors the philosophical weave order
- Family regions allocated on demand (6 slots per family)
- Bulk-free only — no individual slot deallocation
- .rodata archetypes remain immutable; arena holds mutable mirrors
- Möbius return (#5 → #0) signals cycle completion / harvest point

**Tensor Arena** — separate `float*` buffer, SIMD-aligned, referenced by `semantic_embedding` pointers.

---

## Engine

**Torus Walk:** #0 → #1 → #2 → #3 → #4 → #5 → #0. Walks arena mirrors, calls `invoke_process(self, context_state)`. Never mutates archetypes.

**Lemniscate Dive:** At #4, follows `.cf` chain inward, depth-bounded. Exercises nesting flags.

**Double Covering (720°):** Two full Torus traversals = 12 steps. `cs` (Context-System) governs which covering (normal/inverted) is active. Klein bottle topology — spinor, not simple rotation.

**Execute functions:** Phase-sensitive via `cs`. Six contracts:
- `Execute_Ground` (#0) — initialize context_state
- `Execute_Form` (#1) — define structure
- `Execute_Entity` (#2) — instantiate from form
- `Execute_Process` (#3) — transform; branching
- `Execute_Lemniscate` (#4) — fold inward; recursive incubation
- `Execute_Integration` (#5) — compress/synthesize; Möbius return prep

---

## File Structure

```
include/
  ontology.h        — struct, enums, full macro set, forward declarations
  archetypes.h      — extern #0-#5, weave states, Execute prototypes
  arena.h           — arena allocator API
  engine.h          — engine API (torus_walk, lemniscate_dive, double_covering)
src/
  archetypes.c      — #0-#5 in .rodata, Execute implementations
  arena.c           — arena allocator
  engine.c          — torus walk, lemniscate, double covering, cs direction
  families.c        — P/S/T/M/L/C family instantiation into arena
  main.c            — boot, verify, full double covering demo
test/
  test_framework.h  — TEST, ASSERT_*, runner with pass/fail summary
  test_struct.c     — size, offsets, alignment
  test_tagged_ptr.c — round-trip all flag combinations
  test_archetypes.c — .rodata invariants, pointer web
  test_arena.c      — allocation, alignment, bounds, slot layout
  test_engine.c     — walk order, lemniscate depth, double covering
  test_families.c   — all 6 families, cross-linking
  test_all.c        — runner calling all suites
```

## Build

```makefile
make        — build epi-logos (clang -std=c11 -Wall -Wextra -Werror -pedantic -O2)
make test   — build + run all tests
make debug  — -fsanitize=address,undefined -g -O0
make clean  — remove artifacts
```

---

## Sprint Sequence (Vertical Slice)

**Sprint 0: Infrastructure**
- test_framework.h, Makefile, rewritten ontology.h
- test_struct.c + test_tagged_ptr.c pass (no archetypes needed)

**Sprint 1: Vertical Slice (#0)**
- Archetype_0 in .rodata
- Arena allocator — place #0 mirror in slot 0
- C0 instantiated on heap via arena
- One reflective coord wired
- Execute_Ground with real logic
- Engine: single-step torus walk
- Tests: end-to-end #0 coverage

**Sprint 2: Complete Foundation**
- #1-#5 archetypes, full 10-fold arena layout
- Complete Torus walk, all Execute functions
- Lemniscate dive from #4
- cs wired, double covering operational

**Sprint 3: Family Expansion (parallelizable via subagents)**
- All 6 families instantiated into arena
- Cross-family base pointer wiring
- All reflective coords wired
- test_families.c full coverage

**Sprint 4: Tensor Arena & Integration**
- Tensor arena, semantic_embedding wired
- Payload union exercised
- QL variant switching (Mod 2/3/4/6)
- Full integration: double covering + families + Lemniscate + state mutation

---

## C Safety Enforcement

- `-Wall -Wextra -Werror -pedantic` — compiler catches everything
- `-fsanitize=address,undefined` — runtime memory/UB detection
- `_Static_assert` on struct size and field offsets
- `GET_PTR()` before every tagged pointer dereference
- `const` .rodata archetypes — OS page-faults on mutation attempts
- Arena bulk-free only — no dangling pointers
- `context_state` is what gets mutated, never archetypes
