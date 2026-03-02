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
