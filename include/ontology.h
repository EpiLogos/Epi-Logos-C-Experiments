/**
 * ontology.h — The Master Blueprint
 *
 * This is the universal DNA of the Epi-Logos coordinate system.
 * It contains ONLY definitions and promises — no memory is allocated here.
 *
 * What lives here:
 *   - The Tagged Pointer operator macros (baking ontology into addresses)
 *   - The forward declaration (the promise of intra-openness)
 *   - The Context_Execution_Operator signature (the `()` spark)
 *   - The Holographic_Coordinate struct (the 128-byte universal unit)
 *
 * What does NOT live here:
 *   - Any actual archetype data (.rodata belongs in archetypes.c)
 *   - Any function bodies (implementations belong in src/)
 */

#ifndef ONTOLOGY_H
#define ONTOLOGY_H

#include <stddef.h>   /* NULL */
#include <stdint.h>
#include <stdalign.h>


/* =============================================================================
 * I. THE TAGGED POINTER ABSTRACTIONS
 *    The Operators Baked Into Memory
 *
 * On 64-bit systems, only 48 bits are used for physical RAM addresses.
 * The top 16 bits are ignored by the hardware — we commandeer them
 * to store the philosophical state of a relation.
 *
 * The CPU knows the ontological mode BEFORE it opens the memory door.
 * ============================================================================= */

#define MASK_ADDRESS    0x0000FFFFFFFFFFFF  /* The physical RAM location         */
#define FLAG_INVERTED   0x8000000000000000  /* The `'` or `i` phase-shift        */
#define FLAG_NESTING    0x4000000000000000  /* The `.` operator — inward fractal  */
#define FLAG_BRANCHING  0x2000000000000000  /* The `-` operator — lateral spread  */
#define FLAG_EXECUTING  0x1000000000000000  /* The `()` operator — context active */

/* Strip all flags to recover the real pointer before dereferencing */
#define GET_PTR(tagged)  ((Holographic_Coordinate*)((uintptr_t)(tagged) & MASK_ADDRESS))

/* Apply / read individual flags */
#define SET_INVERTED(ptr)    ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_INVERTED))
#define IS_INVERTED(ptr)     ((uintptr_t)(ptr) & FLAG_INVERTED)
#define SET_NESTING(ptr)     ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_NESTING))
#define IS_NESTING(ptr)      ((uintptr_t)(ptr) & FLAG_NESTING)
#define SET_BRANCHING(ptr)   ((Holographic_Coordinate*)((uintptr_t)(ptr) | FLAG_BRANCHING))
#define IS_BRANCHING(ptr)    ((uintptr_t)(ptr) & FLAG_BRANCHING)


/* =============================================================================
 * II. THE FORWARD DECLARATION
 *    The Promise of Intra-Openness
 *
 * We announce the struct's existence before defining it.
 * This allows the struct to legally hold pointers to its own kind —
 * the holographic self-reference that makes the web possible.
 * ============================================================================= */

typedef struct Holographic_Coordinate Holographic_Coordinate;


/* =============================================================================
 * III. THE `()` OPERATOR SIGNATURE
 *    The Execution Spark — Yin-to-Yang Transition
 *
 * A function pointer type. Any function matching this shape can be
 * attached to a coordinate, turning static data into living process.
 *
 * When invoked:
 *   - The immutable .rodata blueprint loads into CPU registers
 *   - The coordinate ignites — Siva becomes Shakti
 *   - The Stack Frame is born: the () execution context
 * ============================================================================= */

typedef void (*Context_Execution_Operator)(Holographic_Coordinate* self, void* context_state);


/* =============================================================================
 * IV. THE UNIVERSAL COORDINATE DNA
 *    The Holographic_Coordinate Struct — Exactly 128 Bytes / 2 Cache Lines
 *
 * Aligned to 64 bytes so the CPU L1 cache inhales the entire 16-fold
 * holographic web in a single hardware breath (two adjacent cache lines).
 *
 * Memory layout:
 *   Lens 1 — Identity & Topological Weave     (8 bytes)
 *   Lens 2 — Semantic Tensor Anchor           (8 bytes)
 *   Lens 3 — 16-Fold Intra-Openness-To        (96 bytes = 12 pointers × 8)
 *   Lens 4 — The `()` Execution Operator      (8 bytes)
 *   [compiler pads final 8 bytes to reach 128]
 * ============================================================================= */

alignas(64)
struct Holographic_Coordinate {

    /* --- LENS 1: IDENTITY & TOPOLOGICAL WEAVE (8 bytes) --- */
    uint8_t  ql_position;   /* 0–5: the Modulo Base position in the QL arc    */
    uint8_t  dual_state;    /* Mod 2 (0/1) or Mod 3 (0/1/2) resonance mode    */
    uint16_t _padding;      /* Keeps the float below on a 4-byte boundary     */
    float    weave_state;   /* 0.0, 0.5, 5.0, 5.5 — interlaced arena position */

    /* --- LENS 2: SEMANTIC TENSOR ANCHOR (8 bytes) --- */
    /*
     * Points into a SEPARATE, SIMD-aligned Tensor Arena.
     * Keeping the high-dimensional vector OUTSIDE this struct is mandatory:
     * it prevents struct bloat and keeps topology lightning-fast.
     * This 8-byte pointer is the bridge between symbolic and connectionist logic.
     */
    float* semantic_embedding;

    /* --- LENS 3: THE 16-FOLD INTRA-OPENNESS-TO (96 bytes) ---
     *
     * These are Tagged Pointers. Each address carries the `.` or `-` operator
     * in its high bits, so the relation type is known before dereferencing.
     *
     * The Base Canonical Web (6 structural pointers):
     */
    Holographic_Coordinate* p;    /* Position   — Functional semantics, QL #0–#5   */
    Holographic_Coordinate* s;    /* Stack      — Technology / infrastructure layer */
    Holographic_Coordinate* t;    /* Thought    — Artifact type, cognitive operation*/
    Holographic_Coordinate* m;    /* Subsystem  — Consciousness domain, MEF lens   */
    Holographic_Coordinate* l;    /* Lens       — Epistemic mode, way of knowing   */
    Holographic_Coordinate* c;    /* Category   — Ontological foundation (the root)*/

    /*
     * The Reflective / Contextual Web (6 processual pointers):
     */
    Holographic_Coordinate* cpf;  /* Category-Position-Frame — cross-coord mapping */
    Holographic_Coordinate* ct;   /* Context-Time            — temporal frame ops  */
    Holographic_Coordinate* cp;   /* Context-Position        — positional frame     */
    Holographic_Coordinate* cf;   /* Context-Frame           — #4 Lemniscate anchor*/
    Holographic_Coordinate* cfp;  /* Context-Frame-Position  — nested frame ops    */
    Holographic_Coordinate* cs;   /* Context-System          — system-wide state   */

    /* --- LENS 4: THE `()` OPERATOR (8 bytes) --- */
    /*
     * The execution context. When called, transitions the coordinate from
     * static Yin (data) into kinetic Yang (process).
     * NULL means this coordinate is pure data; non-NULL means it can ignite.
     */
    Context_Execution_Operator invoke_process;

    /* --- EXPLICIT CACHE-LINE PADDING (8 bytes) --- */
    /*
     * The fields above sum to 120 bytes. We add 8 bytes of explicit padding
     * to reach exactly 128 bytes — two complete L1 cache lines.
     * Do not use _cache_pad; it exists only to enforce the architectural law.
     */
    uint8_t _cache_pad[8];

    /* Total: 8 + 8 + 96 + 8 + 8 = 128 bytes. Two cache lines. Exact. */
};


#endif /* ONTOLOGY_H */
