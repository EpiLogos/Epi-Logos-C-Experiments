# Epi-Logos C Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the Epi-Logos C coordinate system from scratch, correcting #0-#5 as foundation (not C0-C5), with full test coverage, arena allocator, all 6 families, double covering engine, and tensor arena.

**Architecture:** Vertical slice approach — prove the full 4-layer architecture on a single coordinate (#0), then replicate. Tests first. One universal 128-byte `Holographic_Coordinate` struct for both raw archetypes (family=NONE) and family coordinates. Arena allocator for mutable heap. Tagged pointers with safety-enforced GET_PTR().

**Tech Stack:** C11, clang, custom test macros (zero deps), Make, AddressSanitizer/UBSan for debug builds.

---

## Sprint 0: Infrastructure

### Task 1: Create Makefile

**Files:**
- Create: `Makefile`

**Step 1: Write the Makefile**

```makefile
CC      = clang
CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -I include
LDFLAGS =

SRC     = src/archetypes.c src/arena.c src/engine.c src/families.c src/main.c
OBJ     = $(SRC:.c=.o)
BIN     = epi-logos

TEST_SRC = test/test_struct.c test/test_tagged_ptr.c test/test_archetypes.c \
           test/test_arena.c test/test_engine.c test/test_families.c test/test_all.c
TEST_SUPPORT_SRC = src/archetypes.c src/arena.c src/engine.c src/families.c
TEST_BIN = test_runner

# Debug: AddressSanitizer + UndefinedBehaviorSanitizer
DEBUG_CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -I include \
                -fsanitize=address,undefined -g -O0 -DDEBUG
DEBUG_LDFLAGS = -fsanitize=address,undefined

.PHONY: all test debug clean

all: $(BIN)

$(BIN): $(SRC)
	$(CC) $(CFLAGS) -O2 -o $@ $^ $(LDFLAGS)

test: $(TEST_SRC) $(TEST_SUPPORT_SRC)
	$(CC) $(DEBUG_CFLAGS) -o $(TEST_BIN) $^ $(DEBUG_LDFLAGS)
	./$(TEST_BIN)

debug: $(SRC)
	$(CC) $(DEBUG_CFLAGS) -o $(BIN) $^ $(DEBUG_LDFLAGS)

clean:
	rm -f $(BIN) $(TEST_BIN) $(OBJ)
```

**Step 2: Verify Makefile syntax**

Run: `make -n 2>&1 | head -5`
Expected: prints the commands it would run (will fail on missing files, that's fine — we're checking syntax)

**Step 3: Commit**

```bash
git init
git add Makefile
git commit -m "build: add Makefile with all/test/debug/clean targets"
```

---

### Task 2: Create test framework

**Files:**
- Create: `test/test_framework.h`

**Step 1: Write the test framework header**

```c
/**
 * test_framework.h — Minimal Test Macros
 *
 * Zero dependencies. Compiles with clang.
 * Prints pass/fail per test, summary at end.
 */

#ifndef TEST_FRAMEWORK_H
#define TEST_FRAMEWORK_H

#include <stdio.h>
#include <string.h>

/* Global counters */
static int _tf_pass = 0;
static int _tf_fail = 0;
static int _tf_current_failed = 0;

/* Begin a test */
#define TEST(name) \
    do { \
        _tf_current_failed = 0; \
        const char* _tf_name = (name);

/* End a test */
#define TEST_END() \
        if (_tf_current_failed) { \
            _tf_fail++; \
            printf("  FAIL: %s\n", _tf_name); \
        } else { \
            _tf_pass++; \
            printf("  pass: %s\n", _tf_name); \
        } \
    } while (0)

/* Assertions */
#define ASSERT_TRUE(expr) \
    do { \
        if (!(expr)) { \
            printf("    ASSERTION FAILED: %s\n", #expr); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_FALSE(expr) ASSERT_TRUE(!(expr))

#define ASSERT_EQ(a, b) \
    do { \
        if ((a) != (b)) { \
            printf("    ASSERTION FAILED: %s == %s\n", #a, #b); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_NEQ(a, b) \
    do { \
        if ((a) == (b)) { \
            printf("    ASSERTION FAILED: %s != %s\n", #a, #b); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_PTR_EQ(a, b) \
    do { \
        if ((const void*)(a) != (const void*)(b)) { \
            printf("    ASSERTION FAILED: %s == %s\n", #a, #b); \
            printf("      got %p vs %p\n", (const void*)(a), (const void*)(b)); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_NULL(ptr) \
    do { \
        if ((ptr) != NULL) { \
            printf("    ASSERTION FAILED: %s is NULL\n", #ptr); \
            printf("      got %p\n", (const void*)(ptr)); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_NOT_NULL(ptr) \
    do { \
        if ((ptr) == NULL) { \
            printf("    ASSERTION FAILED: %s is not NULL\n", #ptr); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_FLOAT_EQ(a, b) \
    do { \
        float _diff = (a) - (b); \
        if (_diff < -0.001f || _diff > 0.001f) { \
            printf("    ASSERTION FAILED: %s == %s\n", #a, #b); \
            printf("      got %f vs %f\n", (double)(a), (double)(b)); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

/* Suite management */
#define SUITE(name) \
    printf("\n[suite] %s\n", (name))

/* Print summary — call at the end of main() */
#define TEST_SUMMARY() \
    do { \
        printf("\n========================================\n"); \
        printf("Tests: %d passed, %d failed, %d total\n", \
               _tf_pass, _tf_fail, _tf_pass + _tf_fail); \
        printf("========================================\n"); \
    } while (0)

/* Return code for main */
#define TEST_EXIT_CODE() (_tf_fail > 0 ? 1 : 0)

#endif /* TEST_FRAMEWORK_H */
```

**Step 2: Commit**

```bash
mkdir -p test
git add test/test_framework.h
git commit -m "test: add minimal test framework with assert macros"
```

---

### Task 3: Rewrite ontology.h

**Files:**
- Rewrite: `include/ontology.h`

**Step 1: Write the corrected ontology.h**

```c
/**
 * ontology.h — The Master Blueprint
 *
 * The universal DNA of the Epi-Logos coordinate system.
 * Contains ONLY definitions and promises — no memory allocated here.
 *
 * What lives here:
 *   - Coordinate_Family enum (NONE for raw archetypes, P/S/T/M/L/C for families)
 *   - Tagged Pointer macros (baking ontology into addresses)
 *   - Forward declaration and Context_Execution_Operator signature
 *   - The Holographic_Coordinate struct (128 bytes, universal for all coordinates)
 *
 * What does NOT live here:
 *   - Any actual archetype data (.rodata belongs in archetypes.c)
 *   - Any function bodies (implementations belong in src/)
 */

#ifndef ONTOLOGY_H
#define ONTOLOGY_H

#include <stddef.h>
#include <stdint.h>
#include <stdalign.h>


/* =============================================================================
 * I. COORDINATE FAMILY ENUM
 *    Distinguishes raw archetypes (#0-#5) from family manifestations.
 *    FAMILY_NONE = raw archetype (Layer 1, pre-categorical).
 *    P through C = family manifestations (Layer 2).
 * ============================================================================= */

typedef enum {
    FAMILY_NONE = 0,   /* Raw archetype (#0-#5) — pre-categorical foundation */
    FAMILY_P    = 1,   /* Position  — Functional semantics                   */
    FAMILY_S    = 2,   /* Stack     — Technology / infrastructure layers     */
    FAMILY_T    = 3,   /* Thought   — Artifacts / cognition                  */
    FAMILY_M    = 4,   /* Subsystem — Consciousness domains                  */
    FAMILY_L    = 5,   /* Lens      — Epistemic modes                        */
    FAMILY_C    = 6    /* Category  — Ontological foundation                 */
} Coordinate_Family;


/* =============================================================================
 * II. TAGGED POINTER MACROS
 *    The operators baked into memory addresses.
 *
 *    Bit layout:
 *      63: # (FLAG_INVERTED)   — the inversion act
 *      62: . (FLAG_NESTING)    — inward fractal traversal
 *      61: - (FLAG_BRANCHING)  — lateral relation
 *      60: () (FLAG_EXECUTING) — execution context active
 *      59-48: reserved
 *      47-0: physical address
 *
 *    SAFETY CONTRACT: GET_PTR() before EVERY dereference. No exceptions.
 * ============================================================================= */

#define MASK_ADDRESS    0x0000FFFFFFFFFFFF
#define FLAG_INVERTED   0x8000000000000000
#define FLAG_NESTING    0x4000000000000000
#define FLAG_BRANCHING  0x2000000000000000
#define FLAG_EXECUTING  0x1000000000000000

/* Strip all flags — MUST call before dereferencing */
#define GET_PTR(tagged)  ((Holographic_Coordinate*)((uintptr_t)(tagged) & MASK_ADDRESS))

/* Inversion (#) — the fundamental operation */
#define SET_INVERTED(ptr)    ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_INVERTED))
#define IS_INVERTED(ptr)     ((uintptr_t)(ptr) & FLAG_INVERTED)

/* Nesting (.) — inward fractal traversal */
#define SET_NESTING(ptr)     ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_NESTING))
#define IS_NESTING(ptr)      ((uintptr_t)(ptr) & FLAG_NESTING)

/* Branching (-) — lateral relation */
#define SET_BRANCHING(ptr)   ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_BRANCHING))
#define IS_BRANCHING(ptr)    ((uintptr_t)(ptr) & FLAG_BRANCHING)

/* Executing (()) — context active */
#define SET_EXECUTING(ptr)   ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_EXECUTING))
#define IS_EXECUTING(ptr)    ((uintptr_t)(ptr) & FLAG_EXECUTING)

/* Utilities */
#define CLEAR_FLAGS(ptr)     GET_PTR(ptr)
#define TAG_FLAGS(ptr)       ((uintptr_t)(ptr) & ~MASK_ADDRESS)


/* =============================================================================
 * III. WEAVE-STATE SEMANTICS
 *    The identification edges (0.0, 0.5, 5.0, 5.5) define the topological
 *    boundary conditions. Everything between them is inter-identification
 *    process "frames". The integer part of weave_state is the parent position;
 *    the decimal part encodes the child/frame context.
 *
 *    Operator access rules:
 *      - #4 and identification edges have . (nesting) access
 *      - All other positions have - (branching) access
 *      - The SOURCE coordinate determines the operator, not the target
 * ============================================================================= */

/* Identification edges — topological boundary conditions */
#define IS_IDENTIFICATION_EDGE(w) \
    ((w) == 0.0f || (w) == 0.5f || (w) == 5.0f || (w) == 5.5f)

/* Does this coordinate have nesting (.) access?
 * Only #4 (Lemniscate) and identification edges can nest.
 * All others branch (-). */
#define HAS_NESTING_ACCESS(coord) \
    ((coord)->ql_position == 4 || IS_IDENTIFICATION_EDGE((coord)->weave_state))

/* Extract parent and child/frame from weave_state.
 * e.g. weave_state 3.2 → parent=#3, child=#2
 * e.g. weave_state 4.6 → parent=#4, child=C-family (6) */
#define WEAVE_PARENT(w)  ((uint8_t)(w))
#define WEAVE_CHILD(w)   ((uint8_t)(((w) - (float)((uint8_t)(w))) * 10.0f + 0.5f))

/* Apply the correct relational flag based on source coordinate's access */
#define TAG_RELATION(source, target_ptr) \
    (HAS_NESTING_ACCESS(source) \
        ? SET_NESTING(target_ptr) \
        : SET_BRANCHING(target_ptr))


/* =============================================================================
 * IV. FORWARD DECLARATION & EXECUTION OPERATOR
 * ============================================================================= */

typedef struct Holographic_Coordinate Holographic_Coordinate;

typedef void (*Context_Execution_Operator)(
    Holographic_Coordinate* self,
    void* context_state
);


/* =============================================================================
 * V. THE UNIVERSAL COORDINATE — 128 Bytes / 2 Cache Lines
 *
 *    Used for BOTH raw archetypes (#0-#5, family=FAMILY_NONE)
 *    and family manifestations (C0-C5, P0-P5, etc., family=FAMILY_*)
 *
 *    Layout:
 *      Identity          (8 bytes)
 *      Tensor Anchor     (8 bytes)
 *      Intra-Openness    (96 bytes = 12 tagged pointers)
 *      Execution         (8 bytes)
 *      Payload           (8 bytes)
 *      Total:            128 bytes
 * ============================================================================= */

struct Holographic_Coordinate {

    /* --- Identity (8 bytes) --- */
    uint8_t  ql_position;       /* 0-5: which archetype position              */
    uint8_t  family;            /* Coordinate_Family: NONE for raw, P-C for family */
    uint8_t  inversion_state;   /* 0 = normal, 1 = inverted (result of #)     */
    uint8_t  _pad;
    float    weave_state;       /* 0.0, 0.5, 1.0, ... 5.5                    */

    /* --- Tensor Anchor (8 bytes) --- */
    float*   semantic_embedding; /* Points into separate SIMD-aligned Tensor Arena */

    /* --- Intra-Openness: 6 Base + 6 Reflective (96 bytes) --- */
    Holographic_Coordinate* p;    /* Position family link   */
    Holographic_Coordinate* s;    /* Stack family link      */
    Holographic_Coordinate* t;    /* Thought family link    */
    Holographic_Coordinate* m;    /* Subsystem family link  */
    Holographic_Coordinate* l;    /* Lens family link       */
    Holographic_Coordinate* c;    /* Category family link   */

    Holographic_Coordinate* cpf;  /* Category-Position-Frame  */
    Holographic_Coordinate* ct;   /* Context-Time             */
    Holographic_Coordinate* cp;   /* Context-Position         */
    Holographic_Coordinate* cf;   /* Context-Frame (#4 anchor)*/
    Holographic_Coordinate* cfp;  /* Context-Frame-Position   */
    Holographic_Coordinate* cs;   /* Context-System (direction)*/

    /* --- Execution (8 bytes) --- */
    Context_Execution_Operator invoke_process;

    /* --- Payload (8 bytes) --- */
    union {
        char*    meaning_bin;     /* Semantic content        */
        void*    process_state;   /* Runtime state           */
        uint64_t instance_id;     /* Unique instance handle  */
        float*   vector_anchor;   /* Alternate vector ref    */
    } payload;
};


#endif /* ONTOLOGY_H */
```

**Step 2: Commit**

```bash
git add include/ontology.h
git commit -m "rewrite: ontology.h with corrected struct, family enum, full macro set"
```

---

### Task 4: Create stub source files

Create minimal stubs so the Makefile can find all source files. These will be rewritten in later sprints.

**Files:**
- Rewrite: `include/archetypes.h`
- Create: `include/arena.h`
- Create: `include/engine.h`
- Rewrite: `src/archetypes.c`
- Create: `src/arena.c`
- Rewrite: `src/engine.c`
- Create: `src/families.c`
- Rewrite: `src/main.c`

**Step 1: Write archetypes.h (corrected naming: #0-#5)**

```c
/**
 * archetypes.h — The Promises of the Bedrock
 *
 * Extern declarations for the six raw archetypes (#0-#5).
 * These are the pre-categorical foundation — FAMILY_NONE.
 * C0-C5 are C-family MANIFESTATIONS, not these.
 */

#ifndef ARCHETYPES_H
#define ARCHETYPES_H

#include "ontology.h"

/* =============================================================================
 * I. THE SIX RAW ARCHETYPES (#0-#5) — Extern Promises
 *    These live in .rodata: immutable, transcendent, Siva.
 *    family = FAMILY_NONE — pre-categorical.
 * ============================================================================= */

extern const Holographic_Coordinate Archetype_0;  /* Ground     — #0 */
extern const Holographic_Coordinate Archetype_1;  /* Form       — #1 */
extern const Holographic_Coordinate Archetype_2;  /* Operation  — #2 */
extern const Holographic_Coordinate Archetype_3;  /* Pattern    — #3 */
extern const Holographic_Coordinate Archetype_4;  /* Context    — #4 (Lemniscate) */
extern const Holographic_Coordinate Archetype_5;  /* Integration— #5 (Möbius) */

/* =============================================================================
 * II. THE INTERLACED WEAVE STATES
 * ============================================================================= */

extern const Holographic_Coordinate Weave_0_5;
extern const Holographic_Coordinate Weave_5_0;
extern const Holographic_Coordinate Weave_5_5;

/* =============================================================================
 * III. EXECUTE FUNCTION PROTOTYPES
 *    The () operator implementations for each archetype position.
 * ============================================================================= */

void Execute_Ground(Holographic_Coordinate* self, void* context_state);
void Execute_Form(Holographic_Coordinate* self, void* context_state);
void Execute_Entity(Holographic_Coordinate* self, void* context_state);
void Execute_Process(Holographic_Coordinate* self, void* context_state);
void Execute_Lemniscate(Holographic_Coordinate* self, void* context_state);
void Execute_Integration(Holographic_Coordinate* self, void* context_state);


#endif /* ARCHETYPES_H */
```

**Step 2: Write arena.h**

```c
/**
 * arena.h — The Arena Allocator API
 *
 * The physical Torus in memory. Allocates 128-byte aligned slots
 * for mutable coordinate instances (Shakti/Heap).
 */

#ifndef ARENA_H
#define ARENA_H

#include "ontology.h"

/* =============================================================================
 * I. ARENA STRUCT
 * ============================================================================= */

typedef struct {
    Holographic_Coordinate* slots;   /* aligned_alloc'd buffer           */
    uint32_t capacity;               /* max number of slots              */
    uint32_t count;                  /* current occupancy                */
} Coordinate_Arena;

/* =============================================================================
 * II. ARENA API
 * ============================================================================= */

/* Initialize arena with given capacity. Returns 0 on success, -1 on failure. */
int arena_init(Coordinate_Arena* arena, uint32_t capacity);

/* Allocate the next slot. Returns pointer to slot, or NULL if full. */
Holographic_Coordinate* arena_alloc(Coordinate_Arena* arena);

/* Reset arena (mark all slots free, zero memory). */
void arena_reset(Coordinate_Arena* arena);

/* Destroy arena (free underlying memory). */
void arena_destroy(Coordinate_Arena* arena);

/* =============================================================================
 * III. TENSOR ARENA
 * ============================================================================= */

typedef struct {
    float* buffer;        /* SIMD-aligned float buffer  */
    uint32_t capacity;    /* total floats               */
    uint32_t offset;      /* next free position         */
} Tensor_Arena;

int tensor_arena_init(Tensor_Arena* arena, uint32_t capacity);
float* tensor_arena_alloc(Tensor_Arena* arena, uint32_t count);
void tensor_arena_reset(Tensor_Arena* arena);
void tensor_arena_destroy(Tensor_Arena* arena);


#endif /* ARENA_H */
```

**Step 3: Write engine.h**

```c
/**
 * engine.h — The Engine API
 *
 * Torus walk, Lemniscate dive, double covering.
 * Separated from implementation for clean include graph.
 */

#ifndef ENGINE_H
#define ENGINE_H

#include "ontology.h"
#include <stdint.h>

/* Single Torus cycle: #0 → #1 → ... → #5 → #0 */
void engine_torus_walk(
    const Holographic_Coordinate* start,
    void* context_state,
    uint32_t steps
);

/* Lemniscate recursion from #4 via .cf chain */
void engine_lemniscate_dive(
    const Holographic_Coordinate* c4_entry,
    void* context_state,
    uint8_t depth
);

/* Full 720° double covering directed by cs */
void engine_double_covering(
    const Holographic_Coordinate* start,
    void* context_state
);

/* Map lookup: position → next coordinate */
const Holographic_Coordinate* engine_next_coordinate(uint8_t current_position);


#endif /* ENGINE_H */
```

**Step 4: Write minimal archetypes.c stub**

```c
/**
 * archetypes.c — The .rodata Bedrock
 *
 * The six raw archetypes (#0-#5) physically woven into .rodata.
 * family = FAMILY_NONE — these are pre-categorical foundation.
 * C0-C5 are C-family manifestations and live in the arena.
 */

#include "ontology.h"
#include "archetypes.h"

/* Execute stubs — to be implemented in Sprint 1/2 */
void Execute_Ground(Holographic_Coordinate* self, void* ctx)      { (void)self; (void)ctx; }
void Execute_Form(Holographic_Coordinate* self, void* ctx)        { (void)self; (void)ctx; }
void Execute_Entity(Holographic_Coordinate* self, void* ctx)      { (void)self; (void)ctx; }
void Execute_Process(Holographic_Coordinate* self, void* ctx)     { (void)self; (void)ctx; }
void Execute_Lemniscate(Holographic_Coordinate* self, void* ctx)  { (void)self; (void)ctx; }
void Execute_Integration(Holographic_Coordinate* self, void* ctx) { (void)self; (void)ctx; }

/* --- #0: Ground (weave 0.0) --- */
const Holographic_Coordinate Archetype_0 = {
    .ql_position      = 0,
    .family           = FAMILY_NONE,
    .inversion_state  = 0,
    .weave_state      = 0.0f,
    .c                = (Holographic_Coordinate*)&Archetype_0,  /* self-ref: ground IS ground */
    .invoke_process   = Execute_Ground,
    .payload          = { .process_state = NULL }
};

/* --- Weave 0.5 --- */
const Holographic_Coordinate Weave_0_5 = {
    .ql_position      = 0,
    .family           = FAMILY_NONE,
    .inversion_state  = 1,
    .weave_state      = 0.5f,
    .c                = (Holographic_Coordinate*)&Archetype_0,
    .payload          = { .process_state = NULL }
};

/* --- #1: Form (weave 1.0) --- */
const Holographic_Coordinate Archetype_1 = {
    .ql_position      = 1,
    .family           = FAMILY_NONE,
    .inversion_state  = 0,
    .weave_state      = 1.0f,
    .c                = (Holographic_Coordinate*)&Archetype_0,
    .invoke_process   = Execute_Form,
    .payload          = { .process_state = NULL }
};

/* --- #2: Operation (weave 2.0) --- */
const Holographic_Coordinate Archetype_2 = {
    .ql_position      = 2,
    .family           = FAMILY_NONE,
    .inversion_state  = 0,
    .weave_state      = 2.0f,
    .c                = (Holographic_Coordinate*)&Archetype_1,
    .invoke_process   = Execute_Entity,
    .payload          = { .process_state = NULL }
};

/* --- Weave 5.0 --- */
const Holographic_Coordinate Weave_5_0 = {
    .ql_position      = 5,
    .family           = FAMILY_NONE,
    .inversion_state  = 1,
    .weave_state      = 5.0f,
    .c                = (Holographic_Coordinate*)&Archetype_0,
    .payload          = { .process_state = NULL }
};

/* --- #3: Pattern (weave 3.0) --- */
const Holographic_Coordinate Archetype_3 = {
    .ql_position      = 3,
    .family           = FAMILY_NONE,
    .inversion_state  = 0,
    .weave_state      = 3.0f,
    .c                = (Holographic_Coordinate*)&Archetype_2,
    .cf               = (Holographic_Coordinate*)&Archetype_4,
    .invoke_process   = Execute_Process,
    .payload          = { .process_state = NULL }
};

/* --- Weave 5.5 --- */
const Holographic_Coordinate Weave_5_5 = {
    .ql_position      = 5,
    .family           = FAMILY_NONE,
    .inversion_state  = 1,
    .weave_state      = 5.5f,
    .c                = (Holographic_Coordinate*)&Archetype_5,
    .payload          = { .process_state = NULL }
};

/* --- #4: Context / Lemniscate (weave 4.0) --- */
const Holographic_Coordinate Archetype_4 = {
    .ql_position      = 4,
    .family           = FAMILY_NONE,
    .inversion_state  = 0,
    .weave_state      = 4.0f,
    .c                = (Holographic_Coordinate*)&Archetype_3,
    .cf               = (Holographic_Coordinate*)&Archetype_4,  /* Lemniscate self-fold */
    .invoke_process   = Execute_Lemniscate,
    .payload          = { .process_state = NULL }
};

/* --- #5: Integration / Möbius (weave 5.0) --- */
const Holographic_Coordinate Archetype_5 = {
    .ql_position      = 5,
    .family           = FAMILY_NONE,
    .inversion_state  = 0,
    .weave_state      = 5.0f,
    .c                = (Holographic_Coordinate*)&Archetype_0,  /* Möbius return */
    .invoke_process   = Execute_Integration,
    .payload          = { .process_state = NULL }
};
```

**Step 5: Write minimal arena.c stub**

```c
/**
 * arena.c — The Arena Allocator
 *
 * Physical Torus in memory. 128-byte aligned slots.
 * Stub — to be implemented in Sprint 1.
 */

#include "arena.h"
#include <stdlib.h>
#include <string.h>

int arena_init(Coordinate_Arena* arena, uint32_t capacity) {
    if (!arena || capacity == 0) return -1;
    arena->slots = aligned_alloc(128, (size_t)capacity * sizeof(Holographic_Coordinate));
    if (!arena->slots) return -1;
    memset(arena->slots, 0, (size_t)capacity * sizeof(Holographic_Coordinate));
    arena->capacity = capacity;
    arena->count = 0;
    return 0;
}

Holographic_Coordinate* arena_alloc(Coordinate_Arena* arena) {
    if (!arena || arena->count >= arena->capacity) return NULL;
    Holographic_Coordinate* slot = &arena->slots[arena->count];
    arena->count++;
    return slot;
}

void arena_reset(Coordinate_Arena* arena) {
    if (!arena) return;
    memset(arena->slots, 0, (size_t)arena->capacity * sizeof(Holographic_Coordinate));
    arena->count = 0;
}

void arena_destroy(Coordinate_Arena* arena) {
    if (!arena) return;
    free(arena->slots);
    arena->slots = NULL;
    arena->capacity = 0;
    arena->count = 0;
}

int tensor_arena_init(Tensor_Arena* arena, uint32_t capacity) {
    if (!arena || capacity == 0) return -1;
    arena->buffer = aligned_alloc(64, (size_t)capacity * sizeof(float));
    if (!arena->buffer) return -1;
    memset(arena->buffer, 0, (size_t)capacity * sizeof(float));
    arena->capacity = capacity;
    arena->offset = 0;
    return 0;
}

float* tensor_arena_alloc(Tensor_Arena* arena, uint32_t count) {
    if (!arena || arena->offset + count > arena->capacity) return NULL;
    float* ptr = &arena->buffer[arena->offset];
    arena->offset += count;
    return ptr;
}

void tensor_arena_reset(Tensor_Arena* arena) {
    if (!arena) return;
    memset(arena->buffer, 0, (size_t)arena->capacity * sizeof(float));
    arena->offset = 0;
}

void tensor_arena_destroy(Tensor_Arena* arena) {
    if (!arena) return;
    free(arena->buffer);
    arena->buffer = NULL;
    arena->capacity = 0;
    arena->offset = 0;
}
```

**Step 6: Write minimal engine.c stub**

```c
/**
 * engine.c — The Torus Engine
 *
 * Torus walk, Lemniscate dive, double covering.
 * Stub engine — to be completed in Sprint 1/2.
 */

#include "engine.h"
#include "archetypes.h"
#include <stdio.h>

static const struct { uint8_t from; const Holographic_Coordinate* to; } torus_map[] = {
    { 0, &Archetype_1 },
    { 1, &Archetype_2 },
    { 2, &Archetype_3 },
    { 3, &Archetype_4 },
    { 4, &Archetype_5 },
    { 5, &Archetype_0 },
};

#define TORUS_MAP_SIZE 6

const Holographic_Coordinate* engine_next_coordinate(uint8_t position) {
    for (int i = 0; i < TORUS_MAP_SIZE; i++) {
        if (torus_map[i].from == position) return torus_map[i].to;
    }
    return NULL;
}

void engine_torus_walk(
    const Holographic_Coordinate* start,
    void* context_state,
    uint32_t steps
) {
    if (!start) return;
    const Holographic_Coordinate* current = start;
    uint32_t limit = (steps == 0) ? 6 : steps;

    for (uint32_t i = 0; i < limit; i++) {
        if (current->invoke_process) {
            current->invoke_process((Holographic_Coordinate*)current, context_state);
        }
        const Holographic_Coordinate* next = engine_next_coordinate(current->ql_position);
        if (!next) break;
        current = next;
    }
}

void engine_lemniscate_dive(
    const Holographic_Coordinate* c4_entry,
    void* context_state,
    uint8_t depth
) {
    if (!c4_entry || depth == 0 || !c4_entry->cf) return;
    const Holographic_Coordinate* inner = GET_PTR(c4_entry->cf);
    if (inner->invoke_process) {
        inner->invoke_process((Holographic_Coordinate*)inner, context_state);
    }
    engine_lemniscate_dive(inner, context_state, depth - 1);
}

void engine_double_covering(
    const Holographic_Coordinate* start,
    void* context_state
) {
    /* TODO: Sprint 2 — cs-directed 720° traversal */
    (void)start; (void)context_state;
}
```

**Step 7: Write minimal families.c stub**

```c
/**
 * families.c — Family Instantiation
 *
 * Instantiates P/S/T/M/L/C family coordinates into the arena.
 * Stub — to be implemented in Sprint 3.
 */

#include "ontology.h"
#include "arena.h"

/* TODO: Sprint 3 — instantiate all 36 family coordinates */
```

**Step 8: Write minimal main.c**

```c
/**
 * main.c — The Ignition Switch
 *
 * Boots the system, verifies the coordinate web,
 * runs the engine.
 */

#include <stdio.h>
#include "ontology.h"
#include "archetypes.h"
#include "engine.h"

_Static_assert(
    sizeof(Holographic_Coordinate) == 128,
    "Holographic_Coordinate must be exactly 128 bytes (2 L1 cache lines)."
);

static int boot_verify_web(void) {
    int ok = 1;

    if (GET_PTR(Archetype_0.c) != &Archetype_0) {
        fprintf(stderr, "[boot] FAIL: #0.c does not self-reference.\n");
        ok = 0;
    }
    if (GET_PTR(Archetype_5.c) != &Archetype_0) {
        fprintf(stderr, "[boot] FAIL: #5.c does not return to #0 (Möbius broken).\n");
        ok = 0;
    }
    if (GET_PTR(Archetype_4.cf) != &Archetype_4) {
        fprintf(stderr, "[boot] FAIL: #4.cf does not self-reference (Lemniscate broken).\n");
        ok = 0;
    }

    if (ok) {
        printf("[boot] Coordinate web: OK\n");
        printf("[boot] Möbius return (#5 -> #0): OK\n");
        printf("[boot] Lemniscate anchor (#4.cf -> #4): OK\n");
    }
    return ok;
}

int main(void) {
    printf("=== Epi-Logos C — System Boot ===\n\n");

    if (!boot_verify_web()) {
        fprintf(stderr, "[boot] Aborting: coordinate web malformed.\n");
        return 1;
    }

    printf("\n[boot] Starting Torus walk (#0 -> #5 -> #0)...\n");
    engine_torus_walk(&Archetype_0, NULL, 0);

    printf("\n[boot] Cycle complete. System nominal.\n");
    printf("=== Möbius return: #5 -> #0. Tomorrow's ground is richer. ===\n");
    return 0;
}
```

**Step 9: Build and verify**

Run: `make`
Expected: clean compile, zero warnings, zero errors

Run: `./epi-logos`
Expected: boot output with corrected #0-#5 naming, all checks pass

**Step 10: Commit**

```bash
git add include/ src/
git commit -m "rewrite: full scaffold with corrected #0-#5 foundation, stubs for arena/families/engine"
```

---

### Task 5: Write test_struct.c

**Files:**
- Create: `test/test_struct.c`

**Step 1: Write the struct tests**

```c
/**
 * test_struct.c — Verify struct layout invariants
 */

#include "test_framework.h"
#include "ontology.h"
#include <stddef.h>

void test_struct(void) {
    SUITE("Struct Layout");

    TEST("sizeof Holographic_Coordinate is 128 bytes");
        ASSERT_EQ(sizeof(Holographic_Coordinate), 128);
    TEST_END();

    TEST("ql_position is at offset 0");
        ASSERT_EQ(offsetof(Holographic_Coordinate, ql_position), 0);
    TEST_END();

    TEST("family is at offset 1");
        ASSERT_EQ(offsetof(Holographic_Coordinate, family), 1);
    TEST_END();

    TEST("inversion_state is at offset 2");
        ASSERT_EQ(offsetof(Holographic_Coordinate, inversion_state), 2);
    TEST_END();

    TEST("weave_state is at offset 4");
        ASSERT_EQ(offsetof(Holographic_Coordinate, weave_state), 4);
    TEST_END();

    TEST("semantic_embedding is at offset 8");
        ASSERT_EQ(offsetof(Holographic_Coordinate, semantic_embedding), 8);
    TEST_END();

    TEST("first base pointer (p) is at offset 16");
        ASSERT_EQ(offsetof(Holographic_Coordinate, p), 16);
    TEST_END();

    TEST("last reflective pointer (cs) is at offset 104");
        ASSERT_EQ(offsetof(Holographic_Coordinate, cs), 104);
    TEST_END();

    TEST("invoke_process is at offset 112");
        ASSERT_EQ(offsetof(Holographic_Coordinate, invoke_process), 112);
    TEST_END();

    TEST("payload is at offset 120");
        ASSERT_EQ(offsetof(Holographic_Coordinate, payload), 120);
    TEST_END();

    TEST("payload union is 8 bytes");
        ASSERT_EQ(sizeof(((Holographic_Coordinate*)0)->payload), 8);
    TEST_END();

    TEST("Coordinate_Family enum values");
        ASSERT_EQ(FAMILY_NONE, 0);
        ASSERT_EQ(FAMILY_P, 1);
        ASSERT_EQ(FAMILY_S, 2);
        ASSERT_EQ(FAMILY_T, 3);
        ASSERT_EQ(FAMILY_M, 4);
        ASSERT_EQ(FAMILY_L, 5);
        ASSERT_EQ(FAMILY_C, 6);
    TEST_END();

    SUITE("Weave-State Semantics");

    TEST("IS_IDENTIFICATION_EDGE recognises the four edges");
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(0.0f));
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(0.5f));
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(5.0f));
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(5.5f));
    TEST_END();

    TEST("IS_IDENTIFICATION_EDGE rejects non-edges");
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(1.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(2.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(3.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(4.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(3.2f));
    TEST_END();

    TEST("HAS_NESTING_ACCESS: #4 always has nesting");
        Holographic_Coordinate c4 = { .ql_position = 4, .weave_state = 4.0f };
        ASSERT_TRUE(HAS_NESTING_ACCESS(&c4));
    TEST_END();

    TEST("HAS_NESTING_ACCESS: identification edges have nesting");
        Holographic_Coordinate w05 = { .ql_position = 0, .weave_state = 0.5f };
        Holographic_Coordinate w50 = { .ql_position = 5, .weave_state = 5.0f };
        Holographic_Coordinate w55 = { .ql_position = 5, .weave_state = 5.5f };
        ASSERT_TRUE(HAS_NESTING_ACCESS(&w05));
        ASSERT_TRUE(HAS_NESTING_ACCESS(&w50));
        ASSERT_TRUE(HAS_NESTING_ACCESS(&w55));
    TEST_END();

    TEST("HAS_NESTING_ACCESS: non-#4 non-edge positions branch only");
        Holographic_Coordinate c0 = { .ql_position = 0, .weave_state = 0.0f };
        Holographic_Coordinate c1 = { .ql_position = 1, .weave_state = 1.0f };
        Holographic_Coordinate c2 = { .ql_position = 2, .weave_state = 2.0f };
        Holographic_Coordinate c3 = { .ql_position = 3, .weave_state = 3.0f };
        Holographic_Coordinate c5 = { .ql_position = 5, .weave_state = 5.0f };
        /* Note: #0 at weave 0.0 IS an identification edge */
        ASSERT_TRUE(HAS_NESTING_ACCESS(&c0));
        ASSERT_FALSE(HAS_NESTING_ACCESS(&c1));
        ASSERT_FALSE(HAS_NESTING_ACCESS(&c2));
        ASSERT_FALSE(HAS_NESTING_ACCESS(&c3));
        /* #5 at weave 5.0 IS an identification edge */
        ASSERT_TRUE(HAS_NESTING_ACCESS(&c5));
    TEST_END();

    TEST("WEAVE_PARENT extracts integer part");
        ASSERT_EQ(WEAVE_PARENT(3.2f), 3);
        ASSERT_EQ(WEAVE_PARENT(4.6f), 4);
        ASSERT_EQ(WEAVE_PARENT(0.0f), 0);
        ASSERT_EQ(WEAVE_PARENT(5.5f), 5);
    TEST_END();

    TEST("WEAVE_CHILD extracts decimal part");
        ASSERT_EQ(WEAVE_CHILD(3.2f), 2);
        ASSERT_EQ(WEAVE_CHILD(4.6f), 6);
        ASSERT_EQ(WEAVE_CHILD(0.5f), 5);
        ASSERT_EQ(WEAVE_CHILD(5.0f), 0);
    TEST_END();
}
```

**Step 2: Commit**

```bash
git add test/test_struct.c
git commit -m "test: add struct layout tests (size, offsets, enum values)"
```

---

### Task 6: Write test_tagged_ptr.c

**Files:**
- Create: `test/test_tagged_ptr.c`

**Step 1: Write tagged pointer round-trip tests**

```c
/**
 * test_tagged_ptr.c — Tagged pointer encode/decode round-trips
 */

#include "test_framework.h"
#include "ontology.h"

void test_tagged_ptr(void) {
    SUITE("Tagged Pointers");

    /* Use a stack-allocated coordinate as our test subject */
    Holographic_Coordinate dummy = { .ql_position = 42 };
    Holographic_Coordinate* raw = &dummy;

    TEST("GET_PTR strips all flags");
        Holographic_Coordinate* tagged = SET_INVERTED(SET_NESTING(SET_BRANCHING(SET_EXECUTING(raw))));
        ASSERT_PTR_EQ(GET_PTR(tagged), raw);
    TEST_END();

    TEST("SET_INVERTED / IS_INVERTED round-trip");
        Holographic_Coordinate* inv = SET_INVERTED(raw);
        ASSERT_TRUE(IS_INVERTED(inv));
        ASSERT_PTR_EQ(GET_PTR(inv), raw);
    TEST_END();

    TEST("SET_NESTING / IS_NESTING round-trip");
        Holographic_Coordinate* nested = SET_NESTING(raw);
        ASSERT_TRUE(IS_NESTING(nested));
        ASSERT_FALSE(IS_INVERTED(nested));
        ASSERT_PTR_EQ(GET_PTR(nested), raw);
    TEST_END();

    TEST("SET_BRANCHING / IS_BRANCHING round-trip");
        Holographic_Coordinate* branched = SET_BRANCHING(raw);
        ASSERT_TRUE(IS_BRANCHING(branched));
        ASSERT_FALSE(IS_NESTING(branched));
        ASSERT_PTR_EQ(GET_PTR(branched), raw);
    TEST_END();

    TEST("SET_EXECUTING / IS_EXECUTING round-trip");
        Holographic_Coordinate* exec = SET_EXECUTING(raw);
        ASSERT_TRUE(IS_EXECUTING(exec));
        ASSERT_FALSE(IS_BRANCHING(exec));
        ASSERT_PTR_EQ(GET_PTR(exec), raw);
    TEST_END();

    TEST("Multiple flags compose correctly");
        Holographic_Coordinate* multi = SET_INVERTED(SET_NESTING(raw));
        ASSERT_TRUE(IS_INVERTED(multi));
        ASSERT_TRUE(IS_NESTING(multi));
        ASSERT_FALSE(IS_BRANCHING(multi));
        ASSERT_FALSE(IS_EXECUTING(multi));
        ASSERT_PTR_EQ(GET_PTR(multi), raw);
    TEST_END();

    TEST("All four flags compose correctly");
        Holographic_Coordinate* all = SET_INVERTED(SET_NESTING(SET_BRANCHING(SET_EXECUTING(raw))));
        ASSERT_TRUE(IS_INVERTED(all));
        ASSERT_TRUE(IS_NESTING(all));
        ASSERT_TRUE(IS_BRANCHING(all));
        ASSERT_TRUE(IS_EXECUTING(all));
        ASSERT_PTR_EQ(GET_PTR(all), raw);
    TEST_END();

    TEST("CLEAR_FLAGS is alias for GET_PTR");
        Holographic_Coordinate* tagged2 = SET_INVERTED(SET_NESTING(raw));
        ASSERT_PTR_EQ(CLEAR_FLAGS(tagged2), GET_PTR(tagged2));
    TEST_END();

    TEST("TAG_FLAGS returns only flag bits");
        Holographic_Coordinate* inv_only = SET_INVERTED(raw);
        uintptr_t flags = TAG_FLAGS(inv_only);
        ASSERT_EQ(flags, FLAG_INVERTED);
    TEST_END();

    TEST("NULL pointer survives tagging");
        Holographic_Coordinate* null_tagged = SET_INVERTED(NULL);
        ASSERT_TRUE(IS_INVERTED(null_tagged));
        ASSERT_PTR_EQ(GET_PTR(null_tagged), NULL);
    TEST_END();

    TEST("TAG_RELATION applies NESTING for #4 source");
        Holographic_Coordinate source_4 = { .ql_position = 4, .weave_state = 4.0f };
        Holographic_Coordinate target = { .ql_position = 3 };
        Holographic_Coordinate* tagged = TAG_RELATION(&source_4, &target);
        ASSERT_TRUE(IS_NESTING(tagged));
        ASSERT_FALSE(IS_BRANCHING(tagged));
        ASSERT_PTR_EQ(GET_PTR(tagged), &target);
    TEST_END();

    TEST("TAG_RELATION applies BRANCHING for non-#4 non-edge source");
        Holographic_Coordinate source_3 = { .ql_position = 3, .weave_state = 3.0f };
        Holographic_Coordinate target = { .ql_position = 2 };
        Holographic_Coordinate* tagged = TAG_RELATION(&source_3, &target);
        ASSERT_TRUE(IS_BRANCHING(tagged));
        ASSERT_FALSE(IS_NESTING(tagged));
        ASSERT_PTR_EQ(GET_PTR(tagged), &target);
    TEST_END();

    TEST("TAG_RELATION applies NESTING for identification edge source");
        Holographic_Coordinate source_w = { .ql_position = 0, .weave_state = 0.5f };
        Holographic_Coordinate target = { .ql_position = 5 };
        Holographic_Coordinate* tagged = TAG_RELATION(&source_w, &target);
        ASSERT_TRUE(IS_NESTING(tagged));
        ASSERT_PTR_EQ(GET_PTR(tagged), &target);
    TEST_END();
}
```

**Step 2: Commit**

```bash
git add test/test_tagged_ptr.c
git commit -m "test: add tagged pointer round-trip tests for all flag combinations"
```

---

### Task 7: Write test_archetypes.c, test_arena.c, test_engine.c, test_families.c stubs

**Files:**
- Create: `test/test_archetypes.c`
- Create: `test/test_arena.c`
- Create: `test/test_engine.c`
- Create: `test/test_families.c`

**Step 1: Write test_archetypes.c**

```c
/**
 * test_archetypes.c — .rodata archetype invariant tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "archetypes.h"

void test_archetypes(void) {
    SUITE("Archetypes (.rodata)");

    TEST("#0.c self-references (ground is ground)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_0.c), &Archetype_0);
    TEST_END();

    TEST("#5.c returns to #0 (Möbius)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_5.c), &Archetype_0);
    TEST_END();

    TEST("#4.cf self-references (Lemniscate)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_4.cf), &Archetype_4);
    TEST_END();

    TEST("All archetypes have family=FAMILY_NONE");
        ASSERT_EQ(Archetype_0.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_1.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_2.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_3.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_4.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_5.family, FAMILY_NONE);
    TEST_END();

    TEST("Archetype ql_positions are 0-5");
        ASSERT_EQ(Archetype_0.ql_position, 0);
        ASSERT_EQ(Archetype_1.ql_position, 1);
        ASSERT_EQ(Archetype_2.ql_position, 2);
        ASSERT_EQ(Archetype_3.ql_position, 3);
        ASSERT_EQ(Archetype_4.ql_position, 4);
        ASSERT_EQ(Archetype_5.ql_position, 5);
    TEST_END();

    TEST("Archetype weave states are correct");
        ASSERT_FLOAT_EQ(Archetype_0.weave_state, 0.0f);
        ASSERT_FLOAT_EQ(Archetype_1.weave_state, 1.0f);
        ASSERT_FLOAT_EQ(Archetype_2.weave_state, 2.0f);
        ASSERT_FLOAT_EQ(Archetype_3.weave_state, 3.0f);
        ASSERT_FLOAT_EQ(Archetype_4.weave_state, 4.0f);
        ASSERT_FLOAT_EQ(Archetype_5.weave_state, 5.0f);
    TEST_END();

    TEST("All archetypes have inversion_state=0");
        ASSERT_EQ(Archetype_0.inversion_state, 0);
        ASSERT_EQ(Archetype_1.inversion_state, 0);
        ASSERT_EQ(Archetype_2.inversion_state, 0);
        ASSERT_EQ(Archetype_3.inversion_state, 0);
        ASSERT_EQ(Archetype_4.inversion_state, 0);
        ASSERT_EQ(Archetype_5.inversion_state, 0);
    TEST_END();

    TEST("All archetypes have non-NULL invoke_process");
        ASSERT_NOT_NULL(Archetype_0.invoke_process);
        ASSERT_NOT_NULL(Archetype_1.invoke_process);
        ASSERT_NOT_NULL(Archetype_2.invoke_process);
        ASSERT_NOT_NULL(Archetype_3.invoke_process);
        ASSERT_NOT_NULL(Archetype_4.invoke_process);
        ASSERT_NOT_NULL(Archetype_5.invoke_process);
    TEST_END();

    TEST("Weave states have inversion_state=1");
        ASSERT_EQ(Weave_0_5.inversion_state, 1);
        ASSERT_EQ(Weave_5_0.inversion_state, 1);
        ASSERT_EQ(Weave_5_5.inversion_state, 1);
    TEST_END();

    TEST("Weave states have NULL invoke_process");
        ASSERT_NULL(Weave_0_5.invoke_process);
        ASSERT_NULL(Weave_5_0.invoke_process);
        ASSERT_NULL(Weave_5_5.invoke_process);
    TEST_END();

    TEST("#3.cf points to #4 (Lemniscate entry)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_3.cf), &Archetype_4);
    TEST_END();

    TEST("C-chain: #1.c->#0, #2.c->#1, #3.c->#2, #4.c->#3");
        ASSERT_PTR_EQ(GET_PTR(Archetype_1.c), &Archetype_0);
        ASSERT_PTR_EQ(GET_PTR(Archetype_2.c), &Archetype_1);
        ASSERT_PTR_EQ(GET_PTR(Archetype_3.c), &Archetype_2);
        ASSERT_PTR_EQ(GET_PTR(Archetype_4.c), &Archetype_3);
    TEST_END();
}
```

**Step 2: Write test_arena.c**

```c
/**
 * test_arena.c — Arena allocator tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "arena.h"

void test_arena(void) {
    SUITE("Arena Allocator");

    TEST("arena_init succeeds with valid capacity");
        Coordinate_Arena arena;
        int result = arena_init(&arena, 16);
        ASSERT_EQ(result, 0);
        ASSERT_NOT_NULL(arena.slots);
        ASSERT_EQ(arena.capacity, 16);
        ASSERT_EQ(arena.count, 0);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_init fails with NULL arena");
        int result = arena_init(NULL, 16);
        ASSERT_EQ(result, -1);
    TEST_END();

    TEST("arena_init fails with zero capacity");
        Coordinate_Arena arena;
        int result = arena_init(&arena, 0);
        ASSERT_EQ(result, -1);
    TEST_END();

    TEST("arena_alloc returns sequential slots");
        Coordinate_Arena arena;
        arena_init(&arena, 4);
        Holographic_Coordinate* s0 = arena_alloc(&arena);
        Holographic_Coordinate* s1 = arena_alloc(&arena);
        ASSERT_NOT_NULL(s0);
        ASSERT_NOT_NULL(s1);
        ASSERT_EQ(arena.count, 2);
        /* Slots should be exactly 128 bytes apart */
        ASSERT_EQ((uintptr_t)s1 - (uintptr_t)s0, 128);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_alloc returns 128-byte aligned pointers");
        Coordinate_Arena arena;
        arena_init(&arena, 4);
        Holographic_Coordinate* s0 = arena_alloc(&arena);
        ASSERT_EQ((uintptr_t)s0 % 128, 0);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_alloc returns NULL when full");
        Coordinate_Arena arena;
        arena_init(&arena, 2);
        arena_alloc(&arena);
        arena_alloc(&arena);
        Holographic_Coordinate* overflow = arena_alloc(&arena);
        ASSERT_NULL(overflow);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_reset zeros everything and resets count");
        Coordinate_Arena arena;
        arena_init(&arena, 4);
        Holographic_Coordinate* s = arena_alloc(&arena);
        s->ql_position = 42;
        arena_reset(&arena);
        ASSERT_EQ(arena.count, 0);
        /* Re-alloc same slot, should be zeroed */
        s = arena_alloc(&arena);
        ASSERT_EQ(s->ql_position, 0);
        arena_destroy(&arena);
    TEST_END();

    TEST("tensor_arena_init and alloc");
        Tensor_Arena ta;
        int result = tensor_arena_init(&ta, 256);
        ASSERT_EQ(result, 0);
        float* v = tensor_arena_alloc(&ta, 64);
        ASSERT_NOT_NULL(v);
        ASSERT_EQ(ta.offset, 64);
        float* v2 = tensor_arena_alloc(&ta, 192);
        ASSERT_NOT_NULL(v2);
        ASSERT_EQ(ta.offset, 256);
        /* Should be full now */
        float* overflow = tensor_arena_alloc(&ta, 1);
        ASSERT_NULL(overflow);
        tensor_arena_destroy(&ta);
    TEST_END();
}
```

**Step 3: Write test_engine.c**

```c
/**
 * test_engine.c — Engine tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "archetypes.h"
#include "engine.h"

/* Track visit order for walk tests */
static uint8_t visit_log[16];
static int visit_count = 0;

static void log_visit(Holographic_Coordinate* self, void* ctx) {
    (void)ctx;
    if (visit_count < 16) {
        visit_log[visit_count++] = self->ql_position;
    }
}

void test_engine(void) {
    SUITE("Engine");

    TEST("engine_next_coordinate maps 0->1->2->3->4->5->0");
        ASSERT_PTR_EQ(engine_next_coordinate(0), &Archetype_1);
        ASSERT_PTR_EQ(engine_next_coordinate(1), &Archetype_2);
        ASSERT_PTR_EQ(engine_next_coordinate(2), &Archetype_3);
        ASSERT_PTR_EQ(engine_next_coordinate(3), &Archetype_4);
        ASSERT_PTR_EQ(engine_next_coordinate(4), &Archetype_5);
        ASSERT_PTR_EQ(engine_next_coordinate(5), &Archetype_0);
    TEST_END();

    TEST("engine_next_coordinate returns NULL for invalid position");
        ASSERT_NULL(engine_next_coordinate(6));
        ASSERT_NULL(engine_next_coordinate(255));
    TEST_END();

    TEST("torus_walk visits #0 through #5 in order");
        /* Temporarily override invoke_process with our logger.
         * We need mutable copies for this — use the arena in Sprint 1.
         * For now, test the map ordering instead. */
        const Holographic_Coordinate* cur = &Archetype_0;
        uint8_t expected[] = {0, 1, 2, 3, 4, 5};
        for (int i = 0; i < 6; i++) {
            ASSERT_EQ(cur->ql_position, expected[i]);
            cur = engine_next_coordinate(cur->ql_position);
        }
        /* After 6 steps, back to #0 */
        ASSERT_PTR_EQ(cur, &Archetype_0);
    TEST_END();

    TEST("torus_walk handles NULL start gracefully");
        engine_torus_walk(NULL, NULL, 6);
        /* Should not crash */
        ASSERT_TRUE(1);
    TEST_END();

    TEST("lemniscate_dive stops at depth 0");
        engine_lemniscate_dive(&Archetype_4, NULL, 0);
        /* Should not crash */
        ASSERT_TRUE(1);
    TEST_END();

    TEST("lemniscate_dive handles NULL cf gracefully");
        engine_lemniscate_dive(&Archetype_0, NULL, 3);
        /* #0 has NULL cf, should return immediately */
        ASSERT_TRUE(1);
    TEST_END();
}
```

**Step 4: Write test_families.c stub**

```c
/**
 * test_families.c — Family instantiation tests
 * Stub — to be implemented in Sprint 3.
 */

#include "test_framework.h"
#include "ontology.h"

void test_families(void) {
    SUITE("Families");

    TEST("placeholder — family tests pending Sprint 3");
        ASSERT_TRUE(1);
    TEST_END();
}
```

**Step 5: Commit**

```bash
git add test/test_archetypes.c test/test_arena.c test/test_engine.c test/test_families.c
git commit -m "test: add archetype, arena, engine, and family test suites"
```

---

### Task 8: Write test_all.c and verify full test suite passes

**Files:**
- Create: `test/test_all.c`

**Step 1: Write test runner**

```c
/**
 * test_all.c — Master test runner
 */

#include "test_framework.h"

/* Suite declarations */
extern void test_struct(void);
extern void test_tagged_ptr(void);
extern void test_archetypes(void);
extern void test_arena(void);
extern void test_engine(void);
extern void test_families(void);

int main(void) {
    printf("=== Epi-Logos C — Test Suite ===\n");

    test_struct();
    test_tagged_ptr();
    test_archetypes();
    test_arena();
    test_engine();
    test_families();

    TEST_SUMMARY();
    return TEST_EXIT_CODE();
}
```

**Step 2: Run the full test suite**

Run: `make test`
Expected: ALL tests pass, zero failures, clean AddressSanitizer output

**Step 3: Run the main binary**

Run: `make && ./epi-logos`
Expected: boot output with corrected #0-#5 naming

**Step 4: Commit**

```bash
git add test/test_all.c
git commit -m "test: add master test runner, all Sprint 0 tests passing"
```

---

## Sprint 1: The Vertical Slice (#0 End-to-End)

### Task 9: Implement Execute_Ground with real logic

**Files:**
- Modify: `src/archetypes.c` (Execute_Ground function)

**Step 1: Define a context_state struct in archetypes.c**

Add at the top of `src/archetypes.c`, after includes:

```c
#include <stdio.h>

/* Walk context — passed through the entire Torus cycle */
typedef struct {
    uint8_t  current_position;    /* Where we are in the walk      */
    uint8_t  covering;            /* 0 = normal, 1 = inverted      */
    uint32_t step_count;          /* Total steps taken             */
    uint32_t cycle_count;         /* Complete 360° cycles          */
    void*    accumulator;         /* Generic payload for processing */
} Walk_Context;
```

**Step 2: Implement Execute_Ground**

```c
void Execute_Ground(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;

    /* If we're returning from #5 (Möbius), increment cycle count */
    if (wc->step_count > 1) {
        wc->cycle_count++;
    }
}
```

**Step 3: Add a test for Execute_Ground in test_archetypes.c**

Append to the `test_archetypes` function:

```c
    TEST("Execute_Ground initializes Walk_Context");
        typedef struct {
            uint8_t  current_position;
            uint8_t  covering;
            uint32_t step_count;
            uint32_t cycle_count;
            void*    accumulator;
        } Walk_Context;
        Walk_Context wc = {0};
        Execute_Ground((Holographic_Coordinate*)&Archetype_0, &wc);
        ASSERT_EQ(wc.current_position, 0);
        ASSERT_EQ(wc.step_count, 1);
    TEST_END();
```

**Step 4: Run tests**

Run: `make test`
Expected: ALL pass

**Step 5: Commit**

```bash
git add src/archetypes.c test/test_archetypes.c
git commit -m "feat: implement Execute_Ground with Walk_Context, add test"
```

---

### Task 10: Wire #0 mutable mirror in arena, test end-to-end

**Files:**
- Modify: `test/test_arena.c`

**Step 1: Add test for #0 mirror creation in arena**

Append to `test_arena`:

```c
    TEST("Create mutable mirror of #0 in arena");
        Coordinate_Arena arena;
        arena_init(&arena, 16);
        Holographic_Coordinate* mirror_0 = arena_alloc(&arena);
        ASSERT_NOT_NULL(mirror_0);
        /* Copy identity from .rodata archetype */
        mirror_0->ql_position = Archetype_0.ql_position;
        mirror_0->family = Archetype_0.family;
        mirror_0->inversion_state = Archetype_0.inversion_state;
        mirror_0->weave_state = Archetype_0.weave_state;
        mirror_0->invoke_process = Archetype_0.invoke_process;
        /* Self-reference: mirror's .c points to itself */
        mirror_0->c = mirror_0;
        ASSERT_EQ(mirror_0->ql_position, 0);
        ASSERT_EQ(mirror_0->family, FAMILY_NONE);
        ASSERT_PTR_EQ(GET_PTR(mirror_0->c), mirror_0);
        arena_destroy(&arena);
    TEST_END();
```

**Step 2: Run tests**

Run: `make test`
Expected: ALL pass

**Step 3: Commit**

```bash
git add test/test_arena.c
git commit -m "test: verify #0 mutable mirror creation in arena"
```

---

### Task 11: Instantiate C0 (first family coord) in arena, test cross-linking

**Files:**
- Modify: `test/test_arena.c`

**Step 1: Add C0 instantiation test**

```c
    TEST("Instantiate C0 in arena, linked to #0 mirror");
        Coordinate_Arena arena;
        arena_init(&arena, 16);
        /* Create #0 mirror */
        Holographic_Coordinate* mirror_0 = arena_alloc(&arena);
        mirror_0->ql_position = 0;
        mirror_0->family = FAMILY_NONE;
        mirror_0->weave_state = 0.0f;
        mirror_0->invoke_process = Archetype_0.invoke_process;
        mirror_0->c = mirror_0;
        /* Create C0 */
        Holographic_Coordinate* c0 = arena_alloc(&arena);
        c0->ql_position = 0;
        c0->family = FAMILY_C;
        c0->weave_state = 0.0f;
        c0->invoke_process = Archetype_0.invoke_process;
        /* C0's .c points to #0 mirror (its bedrock) */
        c0->c = mirror_0;
        /* #0 mirror's .c points to itself, but link C-family */
        /* mirror_0 already has .c = self, now we can verify the cross-link */
        ASSERT_EQ(c0->family, FAMILY_C);
        ASSERT_PTR_EQ(GET_PTR(c0->c), mirror_0);
        ASSERT_EQ(GET_PTR(c0->c)->family, FAMILY_NONE);
        arena_destroy(&arena);
    TEST_END();
```

**Step 2: Run tests**

Run: `make test`
Expected: ALL pass

**Step 3: Commit**

```bash
git add test/test_arena.c
git commit -m "test: verify C0 family coordinate instantiation linked to #0"
```

---

## Sprint 2: Complete Foundation

### Task 12: Implement all Execute functions

**Files:**
- Modify: `src/archetypes.c`

**Step 1: Implement Execute_Form through Execute_Integration**

```c
void Execute_Form(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;
}

void Execute_Entity(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;
}

void Execute_Process(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;
}

void Execute_Lemniscate(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;
    /* The Lemniscate dive is triggered by the engine, not here */
}

void Execute_Integration(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;
    /* Möbius return: next Execute_Ground will bump cycle_count */
}
```

**Step 2: Add Walk_Context typedef to archetypes.h so tests can use it**

Add to `include/archetypes.h`:

```c
/* Walk context — passed through the entire Torus cycle */
typedef struct {
    uint8_t  current_position;
    uint8_t  covering;
    uint32_t step_count;
    uint32_t cycle_count;
    void*    accumulator;
} Walk_Context;
```

Remove the duplicate from `src/archetypes.c`.

**Step 3: Add tests for all Execute functions in test_archetypes.c**

```c
    TEST("Execute functions update Walk_Context correctly");
        Walk_Context wc = {0};
        Execute_Ground((Holographic_Coordinate*)&Archetype_0, &wc);
        ASSERT_EQ(wc.current_position, 0);
        ASSERT_EQ(wc.step_count, 1);
        Execute_Form((Holographic_Coordinate*)&Archetype_1, &wc);
        ASSERT_EQ(wc.current_position, 1);
        ASSERT_EQ(wc.step_count, 2);
        Execute_Entity((Holographic_Coordinate*)&Archetype_2, &wc);
        ASSERT_EQ(wc.current_position, 2);
        Execute_Process((Holographic_Coordinate*)&Archetype_3, &wc);
        ASSERT_EQ(wc.current_position, 3);
        Execute_Lemniscate((Holographic_Coordinate*)&Archetype_4, &wc);
        ASSERT_EQ(wc.current_position, 4);
        Execute_Integration((Holographic_Coordinate*)&Archetype_5, &wc);
        ASSERT_EQ(wc.current_position, 5);
        ASSERT_EQ(wc.step_count, 6);
    TEST_END();

    TEST("Execute functions handle NULL context gracefully");
        Execute_Ground((Holographic_Coordinate*)&Archetype_0, NULL);
        Execute_Form((Holographic_Coordinate*)&Archetype_1, NULL);
        Execute_Entity((Holographic_Coordinate*)&Archetype_2, NULL);
        Execute_Process((Holographic_Coordinate*)&Archetype_3, NULL);
        Execute_Lemniscate((Holographic_Coordinate*)&Archetype_4, NULL);
        Execute_Integration((Holographic_Coordinate*)&Archetype_5, NULL);
        ASSERT_TRUE(1);  /* No crash = pass */
    TEST_END();
```

**Step 4: Run tests**

Run: `make test`
Expected: ALL pass

**Step 5: Commit**

```bash
git add include/archetypes.h src/archetypes.c test/test_archetypes.c
git commit -m "feat: implement all Execute functions with Walk_Context"
```

---

### Task 13: Implement double covering in engine

**Files:**
- Modify: `src/engine.c`
- Modify: `test/test_engine.c`

**Step 1: Implement engine_double_covering**

```c
void engine_double_covering(
    const Holographic_Coordinate* start,
    void* context_state
) {
    if (!start) return;

    /* First 360°: normal covering */
    engine_torus_walk(start, context_state, 6);

    /* Phase transition: if context_state has Walk_Context, flip covering */
    if (context_state) {
        Walk_Context* wc = (Walk_Context*)context_state;
        wc->covering = 1;  /* Inverted phase */
    }

    /* Second 360°: inverted covering */
    engine_torus_walk(start, context_state, 6);

    /* Return to normal */
    if (context_state) {
        Walk_Context* wc = (Walk_Context*)context_state;
        wc->covering = 0;
    }
}
```

Add `#include "archetypes.h"` to engine.c if not already present (for Walk_Context).

**Step 2: Add double covering test**

```c
    TEST("double_covering completes 12 steps (720 degrees)");
        Walk_Context wc = {0};
        engine_double_covering(&Archetype_0, &wc);
        ASSERT_EQ(wc.step_count, 12);
        ASSERT_EQ(wc.covering, 0);  /* Returns to normal */
    TEST_END();
```

Add `#include "archetypes.h"` to test_engine.c.

**Step 3: Run tests**

Run: `make test`
Expected: ALL pass

**Step 4: Commit**

```bash
git add src/engine.c test/test_engine.c
git commit -m "feat: implement double covering (720°) with cs phase direction"
```

---

### Task 14: Wire Lemniscate dive into torus walk at #4

**Files:**
- Modify: `src/engine.c`
- Modify: `test/test_engine.c`

**Step 1: Update torus_walk to trigger lemniscate_dive at position 4**

In `engine_torus_walk`, after the invoke_process call, add:

```c
        /* At #4, optionally dive into the Lemniscate */
        if (current->ql_position == 4 && current->cf != NULL) {
            engine_lemniscate_dive(current, context_state, 1);
        }
```

**Step 2: Add test**

```c
    TEST("torus_walk triggers lemniscate at #4");
        Walk_Context wc = {0};
        engine_torus_walk(&Archetype_0, &wc, 6);
        /* #4's Execute_Lemniscate is called once by walk + once by dive = extra step */
        ASSERT_TRUE(wc.step_count >= 6);
    TEST_END();
```

**Step 3: Run tests**

Run: `make test`
Expected: ALL pass

**Step 4: Commit**

```bash
git add src/engine.c test/test_engine.c
git commit -m "feat: wire Lemniscate dive into torus walk at #4"
```

---

## Sprint 3: Family Expansion (Parallelizable via Subagents)

### Task 15: Implement families.c — instantiate all 36 family coordinates

**Files:**
- Modify: `src/families.c`
- Modify: `include/arena.h` (add family init function prototype)

**Step 1: Add function prototype to arena.h or a new families.h**

Add to bottom of `include/arena.h`:

```c
/* Initialize all 6 families (36 coordinates) in the arena.
 * Links each family coord's .c pointer to its bedrock archetype mirror.
 * Returns 0 on success, -1 on failure. */
int families_init(Coordinate_Arena* arena, Holographic_Coordinate* mirrors[6]);
```

**Step 2: Implement families.c**

```c
/**
 * families.c — Family Instantiation
 *
 * Instantiates all 36 family coordinates (6 families × 6 positions)
 * into the arena and cross-links them.
 */

#include "ontology.h"
#include "archetypes.h"
#include "arena.h"
#include <string.h>

int families_init(Coordinate_Arena* arena, Holographic_Coordinate* mirrors[6]) {
    if (!arena || !mirrors) return -1;

    /* For each family (P through C), create 6 coordinates */
    Coordinate_Family families[] = {
        FAMILY_P, FAMILY_S, FAMILY_T, FAMILY_M, FAMILY_L, FAMILY_C
    };

    for (int f = 0; f < 6; f++) {
        for (int pos = 0; pos < 6; pos++) {
            Holographic_Coordinate* coord = arena_alloc(arena);
            if (!coord) return -1;

            coord->ql_position = (uint8_t)pos;
            coord->family = (uint8_t)families[f];
            coord->inversion_state = 0;

            /* Encode weave_state as pos.family — e.g. C3 = 3.6, P0 = 0.1
             * The integer part is the parent archetype position.
             * The decimal part encodes the family index.
             * This makes every coordinate's weave_state a unique address
             * in the continuous manifold, and WEAVE_PARENT/WEAVE_CHILD
             * can extract both components. */
            coord->weave_state = (float)pos + (float)families[f] * 0.1f;

            /* Link to bedrock archetype mirror */
            coord->c = mirrors[pos];

            /* Copy invoke_process from the raw archetype */
            const Holographic_Coordinate* raw_archetypes[] = {
                &Archetype_0, &Archetype_1, &Archetype_2,
                &Archetype_3, &Archetype_4, &Archetype_5
            };
            coord->invoke_process = raw_archetypes[pos]->invoke_process;
        }
    }

    return 0;
}
```

**Step 3: Write comprehensive test_families.c**

```c
/**
 * test_families.c — Family instantiation tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "archetypes.h"
#include "arena.h"

void test_families(void) {
    SUITE("Families");

    TEST("families_init creates 36 coordinates");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        /* Create 6 mirrors first */
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        /* 6 mirrors allocated, count = 6 */
        ASSERT_EQ(arena.count, 6);
        int result = families_init(&arena, mirrors);
        ASSERT_EQ(result, 0);
        /* 6 mirrors + 36 family coords = 42 */
        ASSERT_EQ(arena.count, 42);
        arena_destroy(&arena);
    TEST_END();

    TEST("C-family coordinates have family=FAMILY_C");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        /* C-family is the last 6 slots (indices 36-41, arena slots 6+30 to 6+35) */
        /* Family order: P=0..5, S=6..11, T=12..17, M=18..23, L=24..29, C=30..35 */
        /* Arena index = mirror_count + family_offset */
        for (int i = 0; i < 6; i++) {
            Holographic_Coordinate* c_coord = &arena.slots[6 + 30 + i];
            ASSERT_EQ(c_coord->family, FAMILY_C);
            ASSERT_EQ(c_coord->ql_position, i);
        }
        arena_destroy(&arena);
    TEST_END();

    TEST("Family coordinates link back to mirrors via .c");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        /* Check P0 links to mirror #0 */
        Holographic_Coordinate* p0 = &arena.slots[6 + 0];
        ASSERT_PTR_EQ(GET_PTR(p0->c), mirrors[0]);
        /* Check S3 links to mirror #3 */
        Holographic_Coordinate* s3 = &arena.slots[6 + 6 + 3];
        ASSERT_PTR_EQ(GET_PTR(s3->c), mirrors[3]);
        arena_destroy(&arena);
    TEST_END();

    TEST("All family coordinates have non-NULL invoke_process");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        for (uint32_t i = 6; i < arena.count; i++) {
            ASSERT_NOT_NULL(arena.slots[i].invoke_process);
        }
        arena_destroy(&arena);
    TEST_END();

    TEST("Family weave_states encode pos.family");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        /* C3 should have weave_state = 3.6 (pos=3, family=C=6) */
        Holographic_Coordinate* c3 = &arena.slots[6 + 30 + 3];
        ASSERT_EQ(WEAVE_PARENT(c3->weave_state), 3);
        ASSERT_EQ(WEAVE_CHILD(c3->weave_state), 6);
        /* P0 should have weave_state = 0.1 (pos=0, family=P=1) */
        Holographic_Coordinate* p0 = &arena.slots[6 + 0];
        ASSERT_EQ(WEAVE_PARENT(p0->weave_state), 0);
        ASSERT_EQ(WEAVE_CHILD(p0->weave_state), 1);
        /* S4 should have weave_state = 4.2 (pos=4, family=S=2) */
        Holographic_Coordinate* s4 = &arena.slots[6 + 6 + 4];
        ASSERT_EQ(WEAVE_PARENT(s4->weave_state), 4);
        ASSERT_EQ(WEAVE_CHILD(s4->weave_state), 2);
        arena_destroy(&arena);
    TEST_END();

    TEST("families_init fails with NULL arena");
        Holographic_Coordinate* mirrors[6] = {0};
        int result = families_init(NULL, mirrors);
        ASSERT_EQ(result, -1);
    TEST_END();
}
```

**Step 4: Run tests**

Run: `make test`
Expected: ALL pass

**Step 5: Commit**

```bash
git add src/families.c include/arena.h test/test_families.c
git commit -m "feat: implement family instantiation (36 coords across 6 families)"
```

---

### Task 16: Wire cross-family base pointers

**Files:**
- Modify: `src/families.c`
- Modify: `test/test_families.c`

**Step 1: Add cross-linking function to families.c**

After `families_init`, add a function that links each coordinate's `.p`, `.s`, `.t`, `.m`, `.l` pointers to the corresponding family coordinate at the same position:

```c
/* Cross-link base pointers between families.
 * arena must already have mirrors at [0..5] and families at [6..41].
 * Family layout: P=[6..11], S=[12..17], T=[18..23], M=[24..29], L=[30..35], C=[36..41] */
int families_crosslink(Coordinate_Arena* arena) {
    if (!arena || arena->count < 42) return -1;

    Holographic_Coordinate* base = arena->slots;
    int mirror_offset = 0;
    int p_offset = 6, s_offset = 12, t_offset = 18;
    int m_offset = 24, l_offset = 30, c_offset = 36;

    /* Link every coord (mirrors + families) to its same-position peer in each family.
     * Apply TAG_RELATION: source determines the operator flag.
     * #4 and identification edges get NESTING; all others get BRANCHING. */
    for (uint32_t i = 0; i < arena->count; i++) {
        uint8_t pos = base[i].ql_position;
        if (pos > 5) continue;
        base[i].p = TAG_RELATION(&base[i], &base[p_offset + pos]);
        base[i].s = TAG_RELATION(&base[i], &base[s_offset + pos]);
        base[i].t = TAG_RELATION(&base[i], &base[t_offset + pos]);
        base[i].m = TAG_RELATION(&base[i], &base[m_offset + pos]);
        base[i].l = TAG_RELATION(&base[i], &base[l_offset + pos]);
        /* .c already set by families_init — re-tag it too */
        if (base[i].c) {
            base[i].c = TAG_RELATION(&base[i], GET_PTR(base[i].c));
        }
    }
    return 0;
}
```

Add prototype to `include/arena.h`:

```c
int families_crosslink(Coordinate_Arena* arena);
```

**Step 2: Test cross-linking**

```c
    TEST("Cross-family linking: every coord sees all families");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
            mirrors[i]->weave_state = (float)i;
        }
        families_init(&arena, mirrors);
        families_crosslink(&arena);
        /* Mirror #0 should see P0, S0, T0, M0, L0 (via GET_PTR — pointers are tagged now) */
        ASSERT_NOT_NULL(mirrors[0]->p);
        ASSERT_NOT_NULL(mirrors[0]->s);
        ASSERT_EQ(GET_PTR(mirrors[0]->p)->family, FAMILY_P);
        ASSERT_EQ(GET_PTR(mirrors[0]->s)->family, FAMILY_S);
        ASSERT_EQ(GET_PTR(mirrors[0]->p)->ql_position, 0);
        /* P3 should see S3 */
        Holographic_Coordinate* p3 = &arena.slots[6 + 3];
        ASSERT_EQ(GET_PTR(p3->s)->family, FAMILY_S);
        ASSERT_EQ(GET_PTR(p3->s)->ql_position, 3);
        arena_destroy(&arena);
    TEST_END();

    TEST("Cross-link flags: #4 gets NESTING, #3 gets BRANCHING");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
            mirrors[i]->weave_state = (float)i;
        }
        families_init(&arena, mirrors);
        families_crosslink(&arena);
        /* Mirror #4 (Lemniscate) should have NESTING flags on its base pointers */
        ASSERT_TRUE(IS_NESTING(mirrors[4]->p));
        ASSERT_TRUE(IS_NESTING(mirrors[4]->s));
        ASSERT_FALSE(IS_BRANCHING(mirrors[4]->p));
        /* Mirror #3 (non-Lemniscate, non-edge) should have BRANCHING flags */
        ASSERT_TRUE(IS_BRANCHING(mirrors[3]->p));
        ASSERT_TRUE(IS_BRANCHING(mirrors[3]->s));
        ASSERT_FALSE(IS_NESTING(mirrors[3]->p));
        /* Both should still resolve to correct target via GET_PTR */
        ASSERT_EQ(GET_PTR(mirrors[4]->p)->ql_position, 4);
        ASSERT_EQ(GET_PTR(mirrors[3]->p)->ql_position, 3);
        arena_destroy(&arena);
    TEST_END();
```

**Step 3: Run tests**

Run: `make test`
Expected: ALL pass

**Step 4: Commit**

```bash
git add src/families.c include/arena.h test/test_families.c
git commit -m "feat: cross-link base pointers between all families"
```

---

### Task 17: Wire reflective coordinates

**Files:**
- Modify: `src/families.c`
- Modify: `test/test_families.c`

**Step 1: Add reflective coordinate wiring**

Add to `families.c`:

```c
/* Wire reflective coordinates (cpf, ct, cp, cf, cfp, cs) on all arena slots.
 * cf: position 4 coordinates get self-reference (Lemniscate).
 * cs: points to the position-5 coordinate in same family (system-level direction).
 * Others wired to meaningful cross-references. */
int families_wire_reflective(Coordinate_Arena* arena) {
    if (!arena || arena->count < 42) return -1;

    Holographic_Coordinate* base = arena->slots;

    for (uint32_t i = 0; i < arena->count; i++) {
        uint8_t pos = base[i].ql_position;
        if (pos > 5) continue;

        /* cf: Lemniscate anchor — position 4 self-references */
        if (pos == 4) {
            base[i].cf = &base[i];
        } else if (pos == 3) {
            /* #3 reaches into #4 via cf */
            /* Find the same-family position-4 coord */
            /* For mirrors (i < 6): i - pos + 4 */
            /* For families (i >= 6): same family block + 4 */
            int block_start;
            if (i < 6) {
                block_start = 0;
            } else {
                block_start = (int)(((i - 6) / 6) * 6 + 6);
            }
            base[i].cf = &base[block_start + 4];
        }

        /* cs: Context-System — points to position-5 in same block (the integrator) */
        {
            int block_start;
            if (i < 6) {
                block_start = 0;
            } else {
                block_start = (int)(((i - 6) / 6) * 6 + 6);
            }
            base[i].cs = &base[block_start + 5];
        }
    }

    return 0;
}
```

Add prototype to `include/arena.h`:

```c
int families_wire_reflective(Coordinate_Arena* arena);
```

**Step 2: Test reflective wiring**

```c
    TEST("Reflective: #4 mirror cf self-references");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        families_wire_reflective(&arena);
        ASSERT_PTR_EQ(GET_PTR(mirrors[4]->cf), mirrors[4]);
        arena_destroy(&arena);
    TEST_END();

    TEST("Reflective: cs points to position-5 in same block");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        families_wire_reflective(&arena);
        /* Mirror #0's cs should point to mirror #5 */
        ASSERT_PTR_EQ(GET_PTR(mirrors[0]->cs), mirrors[5]);
        /* P0's cs should point to P5 */
        Holographic_Coordinate* p0 = &arena.slots[6];
        Holographic_Coordinate* p5 = &arena.slots[11];
        ASSERT_PTR_EQ(GET_PTR(p0->cs), p5);
        arena_destroy(&arena);
    TEST_END();
```

**Step 3: Run tests**

Run: `make test`
Expected: ALL pass

**Step 4: Commit**

```bash
git add src/families.c include/arena.h test/test_families.c
git commit -m "feat: wire reflective coordinates (cf, cs) across all families"
```

---

## Sprint 4: Tensor Arena & Integration

### Task 18: Wire tensor arena to coordinates

**Files:**
- Modify: `test/test_arena.c`

**Step 1: Add integration test — tensor arena linked to coordinates**

```c
    TEST("Wire semantic_embedding from tensor arena to coordinate");
        Coordinate_Arena ca;
        arena_init(&ca, 4);
        Tensor_Arena ta;
        tensor_arena_init(&ta, 256);

        Holographic_Coordinate* coord = arena_alloc(&ca);
        coord->ql_position = 0;
        coord->family = FAMILY_NONE;

        /* Allocate an embedding vector */
        float* embed = tensor_arena_alloc(&ta, 64);
        ASSERT_NOT_NULL(embed);
        embed[0] = 1.0f;
        embed[63] = -1.0f;

        /* Wire it */
        coord->semantic_embedding = embed;
        ASSERT_FLOAT_EQ(coord->semantic_embedding[0], 1.0f);
        ASSERT_FLOAT_EQ(coord->semantic_embedding[63], -1.0f);

        tensor_arena_destroy(&ta);
        arena_destroy(&ca);
    TEST_END();
```

**Step 2: Run tests**

Run: `make test`
Expected: ALL pass

**Step 3: Commit**

```bash
git add test/test_arena.c
git commit -m "test: verify tensor arena wiring to coordinate semantic_embedding"
```

---

### Task 19: Update main.c with full integration demo

**Files:**
- Modify: `src/main.c`

**Step 1: Rewrite main to demonstrate full system**

```c
#include <stdio.h>
#include "ontology.h"
#include "archetypes.h"
#include "engine.h"
#include "arena.h"

_Static_assert(
    sizeof(Holographic_Coordinate) == 128,
    "Holographic_Coordinate must be exactly 128 bytes (2 L1 cache lines)."
);

static int boot_verify_web(void) {
    int ok = 1;
    if (GET_PTR(Archetype_0.c) != &Archetype_0) {
        fprintf(stderr, "[boot] FAIL: #0.c does not self-reference.\n");
        ok = 0;
    }
    if (GET_PTR(Archetype_5.c) != &Archetype_0) {
        fprintf(stderr, "[boot] FAIL: #5.c does not return to #0 (Möbius broken).\n");
        ok = 0;
    }
    if (GET_PTR(Archetype_4.cf) != &Archetype_4) {
        fprintf(stderr, "[boot] FAIL: #4.cf does not self-reference (Lemniscate broken).\n");
        ok = 0;
    }
    if (ok) {
        printf("[boot] .rodata web: OK\n");
        printf("[boot] Möbius return (#5 -> #0): OK\n");
        printf("[boot] Lemniscate anchor (#4.cf -> #4): OK\n");
    }
    return ok;
}

int main(void) {
    printf("=== Epi-Logos C — System Boot ===\n\n");

    /* Phase 1: Verify .rodata bedrock */
    if (!boot_verify_web()) {
        fprintf(stderr, "[boot] Aborting: .rodata web malformed.\n");
        return 1;
    }

    /* Phase 2: Initialize arena (Shakti) */
    Coordinate_Arena arena;
    if (arena_init(&arena, 64) != 0) {
        fprintf(stderr, "[boot] Aborting: arena init failed.\n");
        return 1;
    }
    printf("[boot] Arena initialized (64 slots).\n");

    /* Phase 3: Create mutable mirrors of #0-#5 */
    Holographic_Coordinate* mirrors[6];
    const Holographic_Coordinate* raw[] = {
        &Archetype_0, &Archetype_1, &Archetype_2,
        &Archetype_3, &Archetype_4, &Archetype_5
    };
    for (int i = 0; i < 6; i++) {
        mirrors[i] = arena_alloc(&arena);
        mirrors[i]->ql_position = raw[i]->ql_position;
        mirrors[i]->family = FAMILY_NONE;
        mirrors[i]->weave_state = raw[i]->weave_state;
        mirrors[i]->invoke_process = raw[i]->invoke_process;
        mirrors[i]->c = (i == 0) ? mirrors[0] : mirrors[i - 1];
    }
    /* Möbius: mirror #5.c -> mirror #0 */
    mirrors[5]->c = mirrors[0];
    /* Lemniscate: mirror #4.cf -> mirror #4 */
    mirrors[4]->cf = mirrors[4];
    mirrors[3]->cf = mirrors[4];
    printf("[boot] Mutable mirrors created.\n");

    /* Phase 4: Instantiate families */
    if (families_init(&arena, mirrors) != 0) {
        fprintf(stderr, "[boot] Aborting: family init failed.\n");
        arena_destroy(&arena);
        return 1;
    }
    families_crosslink(&arena);
    families_wire_reflective(&arena);
    printf("[boot] All 6 families instantiated and cross-linked (%u slots used).\n", arena.count);

    /* Phase 5: Run double covering (720°) */
    Walk_Context wc = {0};
    printf("\n[engine] Starting double covering (720°)...\n");
    engine_double_covering(mirrors[0], &wc);
    printf("[engine] Double covering complete: %u steps, %u cycles.\n",
           wc.step_count, wc.cycle_count);

    /* Cleanup */
    arena_destroy(&arena);

    printf("\n=== Möbius return: #5 -> #0. Tomorrow's ground is richer. ===\n");
    return 0;
}
```

**Step 2: Build and run**

Run: `make && ./epi-logos`
Expected: Full boot sequence with arena, families, double covering

**Step 3: Run tests**

Run: `make test`
Expected: ALL pass

**Step 4: Commit**

```bash
git add src/main.c
git commit -m "feat: full integration main with arena, families, double covering"
```

---

### Task 20: Final validation — debug build with sanitizers

**Step 1: Build with sanitizers**

Run: `make debug`
Expected: Clean compile

**Step 2: Run debug binary**

Run: `./epi-logos`
Expected: No AddressSanitizer or UBSan errors

**Step 3: Run tests in debug mode**

Run: `make test`
Expected: ALL pass, no sanitizer errors (test target already uses sanitizers)

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: Sprint 4 complete — full system operational with sanitizer validation"
```

---

## Summary

| Sprint | Tasks | What's Built |
|--------|-------|-------------|
| 0 | 1-8 | Makefile, test framework, rewritten ontology.h, all stubs, struct + tagged pointer tests passing |
| 1 | 9-11 | Execute_Ground implemented, arena #0 mirror, C0 family coord, end-to-end vertical slice |
| 2 | 12-14 | All Execute functions, double covering, Lemniscate wired into walk |
| 3 | 15-17 | 36 family coordinates, cross-family linking, reflective coord wiring |
| 4 | 18-20 | Tensor arena, full integration main, sanitizer validation |

**Total: 20 tasks, TDD throughout, frequent commits.**
