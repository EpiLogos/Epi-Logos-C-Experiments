# M-Branch Implementation Prompt

**Use:** Drop this prompt into any session. Fill in `[M_TARGET]` and the implementation
runs according to the architecture established in Pillar I and the target M-spec.

---

## INVOCATION

```
Implement M[M_TARGET] ([subsystem name]) as a C library module within the Epi-Logos
C codebase at /Users/admin/Documents/Epi-Logos\ C\ Experiments/.
```

Replace `[M_TARGET]` with: `0` / `1` / `2` / `3` / `4` / `5`

---

## CONTEXT TO LOAD FIRST

Before any implementation, read these files in full:

```
1. CLAUDE.md                                     — canonical architecture (the onto-code)
2. include/ontology.h                            — HC struct, tagged pointers, flags, BEDROCK
3. include/psychoid_numbers.h                    — Psychoid_0-5, CF_TABLE, HC_LINK macro
4. include/arena.h                               — Arena allocator API
5. docs/specs/PILLAR-I-CANONICAL.md             — 128-byte invariant, all Pillar I FRs
6. docs/specs/M/M[N]-[name]-[topic].md          — target M-branch spec (all FRs)
7. src/psychoid_numbers.c                        — .rodata bedrock (read for patterns)
8. src/families.c                                — family instantiation (read for patterns)
```

Also read the gold standard reference implementation if available:
- M3: `docs/specs/M/M3-mahamaya-symbolic-matrix.md`

---

## ARCHITECTURAL INVARIANTS (non-negotiable)

These apply to ALL M-branch implementations. Never deviate.

### 1. Every M-branch struct is HC-anchored

Every M-branch root struct MUST declare `Holographic_Coordinate* hc;` as its first field.
It MUST be bound bidirectionally using `HC_LINK(hc, m_struct)` from `psychoid_numbers.h`.

```c
typedef struct {
    Holographic_Coordinate* hc;   // ← FIRST FIELD. Always. Points to the HC that carries this.
    // ... M-branch specific fields ...
} M2_Vibrational_72_Space;       // example

// Binding:
HC_LINK(hc_ptr, &m2_instance);
// Result: hc_ptr->payload.process_state == &m2_instance
//         m2_instance.hc == hc_ptr
```

**Why:** M-coordinates are sub-branches of the M (Subsystem) family, which IS IN the
Holographic_Coordinate base. The data is not standalone — it is a PRATIBIMBA of Psychoid_[N].
Without the HC anchor, the struct floats outside the coordinate system entirely.

### 2. Context frames via CF_TABLE, never by direct name

M-branch code that references context frames MUST use `CF_TABLE[CF_*]` or `cf_get(CF_*)`.

```c
// CORRECT:
const Holographic_Coordinate* trika = cf_get(CF_TRIKA);   // (0/1/2) context
const Holographic_Coordinate* mobius = CF_TABLE[CF_MOBIUS]; // (5/0) context

// WRONG (not portable, breaks CLI dispatch):
const Holographic_Coordinate* trika = &CF_012;
```

CF_Id values:
| CF_Id | Context Frame | Used by |
|-------|--------------|---------|
| CF_VOID | (00/00) | M0 ground operations |
| CF_BINARY | (0/1) | M1 non-dual operations |
| CF_TRIKA | (0/1/2) | M2 vibrational mediation |
| CF_QUATERNAL | (0/1/2/3) | M3/M4 clock operations |
| CF_FRACTAL | (4.0/1-4.4/5) | M4 Lemniscate/personal |
| CF_SYNTHESIS | (4.5/0) | M5 agent synthesis |
| CF_MOBIUS | (5/0) | M5 Möbius write-back |

### 3. BIMBA in .rodata, PRATIBIMBA on heap

- Compile-time constants (LUTs, archetypal matrices, enum tables) → `static const` in `.c` → BIMBA
- Runtime state (session data, mutable counters, user context) → `arena_alloc()` or heap → PRATIBIMBA
- The HC backing a BIMBA entity has `FLAG_BIMBA | FLAG_STATUS_CANONICAL` in its `flags` byte.

### 4. Tagged pointers: always GET_PTR() before deref

```c
// ALWAYS:
const Holographic_Coordinate* target = GET_PTR(some_hc->m);
if (target) { ... }

// NEVER:
const Holographic_Coordinate* target = some_hc->m;  // may have tag bits set
```

### 5. _Static_assert every size claim

Every struct whose size is architecturally significant MUST have a `_Static_assert`:

```c
_Static_assert(sizeof(MEF_Condition) == 1, "MEF_Condition must be 1 byte");
_Static_assert(sizeof(M2_Vibrational_72_Space) == 72, "72-invariant must hold");
```

---

## IMPLEMENTATION PROTOCOL (header-first, deep module)

### Phase 1: Write the header (mN.h)

The header IS the module's contract. It must be fully self-describing in the first 40 lines.

**Required header structure:**

```c
/**
 * mN.h — [Subsystem Name]: [Domain] (Subsystem #N)
 *
 * Implements: M[N] (#[N]) = [one-line philosophical description]
 * Context frame: ([frame notation]) — [frame name]
 * Anchored to: Psychoid_[N] in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h (HC struct), [dependencies]
 * Feeds into: [downstream module] (via [bridge function])
 *
 * ARCHITECTURE RULE: All M[N] data structs have Holographic_Coordinate* hc
 * as their first field. Bind with HC_LINK(). Never access without GET_PTR().
 *
 * Public interface — all consumers need only:
 *   m[n]_init(arena, hc)      — allocate and HC-link the M[N] root struct
 *   m[n]_[primary_op]()       — [one-line description]
 *   m[n]_[secondary_op]()     — [one-line description]
 *   m[n]_teardown(m[n]_ptr)   — release heap state (not the HC itself)
 *   m[n]_cli_dispatch(cmd, args) — CLI entry point for this module
 */
```

Keep the public API to ≤6 functions. Everything else is internal (`static`).

### Phase 2: Write the .rodata section (mN.c top)

Before any runtime logic, define all compile-time constants:
- Lookup tables (`static const TYPE NAME[N]`)
- Enum→string maps (for CLI display)
- _Static_asserts to verify all sizes and invariants

Reference the spec FRs by number in comments: `/* FR 2.N.M: ... */`

### Phase 3: Write init + teardown

```c
// Allocate and HC-link the M-branch root struct
M[N]_Root* m[n]_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    // 1. Assert the HC has the correct family and position
    // 2. Allocate root struct on heap
    // 3. HC_LINK(hc, root)
    // 4. Set the M-branch context frame: root->active_cf = cf_get(CF_[FRAME])
    // 5. Return root (or NULL on failure)
}

void m[n]_teardown(M[N]_Root* root) {
    // 1. HC_UNLINK(root->hc)
    // 2. Free heap allocations (NOT the HC itself — arena owns that)
}
```

### Phase 4: Write core operations

Implement the spec FRs in order. Each function:
- Takes `const M[N]_Root*` for read-only operations
- Takes `M[N]_Root*` for state mutations
- Returns a typed result, never `void*` (use typed structs or enums)
- Uses `CF_TABLE[CF_*]` for any context frame reference

### Phase 5: Write the CLI dispatch function

Every M-branch module MUST expose a CLI entry point callable from `main.c`:

```c
/**
 * m[n]_cli_dispatch — CLI entry point for M[N] module.
 *
 * Called from main.c with: epi-logos m[n] <command> [args...]
 *
 * Commands:
 *   info          — Print HC anchoring info and module state
 *   [op1] [args]  — [description]
 *   [op2] [args]  — [description]
 *
 * Returns 0 on success, -1 on error.
 */
int m[n]_cli_dispatch(int argc, char** argv, M[N]_Root* root);
```

All data the module manages — its BIMBA tables, its PRATIBIMBA instances, its
context frame, its cross-M links — must be inspectable and triggerable via this
function. The CLI is the proof of integrability.

---

## SPEC FIDELITY CHECKLIST

After implementation, verify against the target M-spec:

- [ ] All FRs in the spec have a corresponding function or constant in the code
- [ ] Every struct mentioned in an FR has its `_Static_assert`
- [ ] The root struct's `hc` field is present and `HC_LINK`'d
- [ ] Context frame is referenced via `CF_TABLE[CF_*]`
- [ ] All BIMBA LUTs are `static const` (not heap)
- [ ] All PRATIBIMBA instances are arena-allocated or heap (not stack for long-lived)
- [ ] `m[n]_cli_dispatch` covers all public operations
- [ ] `boot_verify_web()` in `main.c` has been extended with M[N]-specific checks

---

## CLI INTEGRATION (main.c extension)

After implementing mN.h / mN.c, extend `main.c` with:

```c
#include "m[n].h"

// In main():
// Phase N+4: Initialize M[N] and attach to its HC mirror
M[N]_Root* m[n] = m[n]_init(&arena, mirrors[N]);
if (!m[n]) { /* handle */ }
printf("[boot] M[N] ([name]) initialized.\n");

// CLI dispatch block (add after boot sequence):
if (argc > 1 && strcmp(argv[1], "m[n]") == 0) {
    return m[n]_cli_dispatch(argc - 1, argv + 1, m[n]);
}
```

The CLI invocation pattern becomes:
```
./epi-logos m0 info
./epi-logos m2 mef 3 1          # MEF[lens=3][position=1]
./epi-logos m4 identity         # print Symbol DNA profile
./epi-logos m5 logos-tick 7     # advance Logos FSM to tick 7
```

---

## CROSS-M LINKS

M-branch modules that reference other M-branches do so via the `m` family pointer:

```c
// From any HC instance, navigate to its M-subsystem sibling:
const Holographic_Coordinate* m2_hc = GET_PTR(hc->m);
// Then: GET_PTR(m2_hc->payload.process_state) gives the M2_Root*

// For specific cross-M functions (e.g. M5 calling M2's DET):
m3_bitboard = m2_apply_det(m2_root, active_conditions, n_conditions);
```

Never pass M-branch structs by value across module boundaries. Always pass the
HC pointer and let the receiving module extract via `GET_PTR(hc->payload.process_state)`.

---

## BUILD COMMAND

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
clang -std=c11 -Wall -Wextra -Iinclude \
    src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
    src/m[n]_[name].c src/main.c \
    -o epi-logos
./epi-logos
```

The build MUST produce zero warnings. `./epi-logos` MUST print all `[boot] ... OK` lines.

---

## IMPLEMENTATION ORDER (full system)

If implementing from scratch: M0 → M1 → M2 → M4 → M5 (M3 is gold standard, read-only).

| Step | Module | Context Frame | Key output |
|------|--------|--------------|------------|
| 1 | M0 Anuttara | (00/00) | DR_Matrix, divine acts, language layer |
| 2 | M1 Paramasiva | (0/1) | QL_Matrix, ANANDA constants, quaternions |
| 3 | M2 Parashakti | (0/1/2) | MEF[12][6], 72-space, epogdoon DET |
| 4 | M4 Nara | (4.0/1-4.4/5) | Symbol DNA, vtable dispatch, PCO |
| 5 | M5 Epii | (5/0) | Logos FSM, Möbius write-back, agent registry |

Each step must pass `boot_verify_web()` before the next begins.

---

*Prompt Version: 1.0 — 2026-03-05*
*Canonical ground: CLAUDE.md + PILLAR-I-CANONICAL.md + docs/specs/M/M[N]-*.md*
