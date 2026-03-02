/**
 * archetypes.c — The .rodata Bedrock
 *
 * This is where the six canonical archetypes are physically woven into memory.
 * The `const` keyword ensures the compiler locks them into the .rodata segment —
 * the immutable Siva layer that the mutable Heap (Shakti) can only point into,
 * never overwrite.
 *
 * The physical memory layout here IS the 10-Fold Interlaced Arena:
 * the CPU traverses non-dual weave states to move between explicate coordinates.
 *
 * READ-ONLY. Never `malloc` here. Never cast away `const`.
 */

#include "../include/ontology.h"
#include "../include/archetypes.h"


/* =============================================================================
 * I. THE `()` OPERATOR IMPLEMENTATIONS
 *    The execution sparks — Yin-to-Yang transitions for each archetype.
 *    These are stubs: mark the shape of each process for you to fill.
 * ============================================================================= */

/* C0 — Non-dual Ground: the zero-point, the canvas before a mark is made. */
void Execute_NonDual_Ground(Holographic_Coordinate* self, void* context_state) {
    (void)self;
    (void)context_state;
    /* TODO: Initialize / reset the coordinate web to its ground state.       */
    /* This is the Möbius entry point — called after C5 compression.          */
}

/* C1 — Form Instantiation: the blueprint actualising into definition. */
void Execute_Form_Instantiation(Holographic_Coordinate* self, void* context_state) {
    (void)self;
    (void)context_state;
    /* TODO: Load the essential nature (meaning_bin) of a coordinate.          */
}

/* C2 — Entity Operation: the atomic unit performing its minimal function. */
void Execute_Entity_Operation(Holographic_Coordinate* self, void* context_state) {
    (void)self;
    (void)context_state;
    /* TODO: Execute the smallest irreducible operation this coordinate holds. */
}

/* C3 — Process Becoming: dynamic, Heraclitean, riverine transformation. */
void Execute_Process_Becoming(Holographic_Coordinate* self, void* context_state) {
    (void)self;
    (void)context_state;
    /* TODO: Walk the canvas workspace; apply transformations to state.        */
}

/* C4 — Lemniscate Incubation: the figure-eight fold, where outer becomes inner. */
void Execute_Lemniscate_Incubation(Holographic_Coordinate* self, void* context_state) {
    (void)self;
    (void)context_state;
    /* TODO: The #4 crossover. Branch into the cf pointer and recurse inward.  */
    /* This is where the `.` (nesting) operator primarily operates.            */
}

/* C5 — Möbius Compression: the pratibimba reflecting back, pruning, returning. */
void Execute_Mobius_Compression(Holographic_Coordinate* self, void* context_state) {
    (void)self;
    (void)context_state;
    /* TODO: Compress the instance's quintessence back toward C0.              */
    /* This is the epistemological garbage collector — the night cycle.        */
}


/* =============================================================================
 * II. THE SIX CANONICAL ARCHETYPES
 *    Physically woven into .rodata in interlaced order.
 *
 * IMPORTANT: These definitions reference each other by address (&Archetype_Cx).
 * The `extern const` declarations in archetypes.h make that legal.
 * The compiler resolves all cross-references at link time.
 *
 * The non-dual weave states (Weave_0_5, Weave_5_0, Weave_5_5) are interleaved
 * so that the CPU's sequential memory reads pass through the implicate on the
 * way between explicate coordinates — hardware non-duality.
 * ============================================================================= */

/* --- C0: Bimba — Pure Ground (weave_state = 0.0) --- */
const Holographic_Coordinate Archetype_C0 = {
    .ql_position        = 0,
    .dual_state         = 0,
    .weave_state        = 0.0f,
    .semantic_embedding = NULL,
    /* Self-referential: the ground is its own ontological foundation */
    .c                  = (Holographic_Coordinate*)&Archetype_C0,
    /* C0 looks forward to C1 as its form */
    .p                  = (Holographic_Coordinate*)&Archetype_C1,
    .invoke_process     = Execute_NonDual_Ground
};

/* --- Weave 0.5: Ground reaching toward Instance (implicate midpoint) --- */
const Holographic_Coordinate Weave_0_5 = {
    .ql_position        = 0,
    .dual_state         = 1,   /* Inverted state — the `'` phase shift */
    .weave_state        = 0.5f,
    .semantic_embedding = NULL,
    .c                  = (Holographic_Coordinate*)&Archetype_C0,
    .invoke_process     = NULL  /* Pure incubation — no ignition */
};

/* --- C1: Morphe — Essential Form (weave_state = 1.0) --- */
const Holographic_Coordinate Archetype_C1 = {
    .ql_position        = 1,
    .dual_state         = 0,
    .weave_state        = 1.0f,
    .semantic_embedding = NULL,
    /* C1 roots back to C0 as its ground */
    .c                  = (Holographic_Coordinate*)&Archetype_C0,
    .invoke_process     = Execute_Form_Instantiation
};

/* --- C2: Entity — Atomic Unit (weave_state = 2.0) --- */
const Holographic_Coordinate Archetype_C2 = {
    .ql_position        = 2,
    .dual_state         = 0,
    .weave_state        = 2.0f,
    .semantic_embedding = NULL,
    .c                  = (Holographic_Coordinate*)&Archetype_C1,
    .invoke_process     = Execute_Entity_Operation
};

/* --- Weave 5.0: Instance reaching back to Ground (implicate midpoint) --- */
const Holographic_Coordinate Weave_5_0 = {
    .ql_position        = 5,
    .dual_state         = 1,
    .weave_state        = 5.0f,
    .semantic_embedding = NULL,
    .c                  = (Holographic_Coordinate*)&Archetype_C0,  /* Möbius gravity */
    .invoke_process     = NULL
};

/* --- C3: Process — Dynamic Becoming (weave_state = 3.0) --- */
const Holographic_Coordinate Archetype_C3 = {
    .ql_position        = 3,
    .dual_state         = 0,
    .weave_state        = 3.0f,
    .semantic_embedding = NULL,
    .c                  = (Holographic_Coordinate*)&Archetype_C2,
    /* C3 branches into the Lemniscate at C4 via the cf pointer */
    .cf                 = (Holographic_Coordinate*)&Archetype_C4,
    .invoke_process     = Execute_Process_Becoming
};

/* --- Weave 5.5: Pure Instance midpoint (implicate synthesis) --- */
const Holographic_Coordinate Weave_5_5 = {
    .ql_position        = 5,
    .dual_state         = 1,
    .weave_state        = 5.5f,
    .semantic_embedding = NULL,
    .c                  = (Holographic_Coordinate*)&Archetype_C5,
    .invoke_process     = NULL
};

/* --- C4: Type — Formal Pattern / Lemniscate Anchor (weave_state = 4.0) --- */
const Holographic_Coordinate Archetype_C4 = {
    .ql_position        = 4,
    .dual_state         = 0,
    .weave_state        = 4.0f,
    .semantic_embedding = NULL,
    .c                  = (Holographic_Coordinate*)&Archetype_C3,
    /* cf points back to self: the Lemniscate folds inward upon #4 */
    .cf                 = (Holographic_Coordinate*)&Archetype_C4,
    .invoke_process     = Execute_Lemniscate_Incubation
};

/* --- C5: Pratibimba — Instance / Möbius Return (weave_state = 5.0) --- */
const Holographic_Coordinate Archetype_C5 = {
    .ql_position        = 5,
    .dual_state         = 0,
    .weave_state        = 5.0f,
    .semantic_embedding = NULL,
    /* The Möbius twist: C5 returns directly to C0 as its ground */
    .c                  = (Holographic_Coordinate*)&Archetype_C0,
    .invoke_process     = Execute_Mobius_Compression
};
