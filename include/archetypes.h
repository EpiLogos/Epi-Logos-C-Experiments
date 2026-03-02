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
 * III. WALK CONTEXT — Passed through the entire Torus cycle
 * ============================================================================= */

typedef struct {
    uint8_t  current_position;    /* Where we are in the walk      */
    uint8_t  covering;            /* 0 = normal, 1 = inverted      */
    uint32_t step_count;          /* Total steps taken             */
    uint32_t cycle_count;         /* Complete 360° cycles          */
    void*    accumulator;         /* Generic payload for processing */
} Walk_Context;

/* =============================================================================
 * IV. EXECUTE FUNCTION PROTOTYPES
 *    The () operator implementations for each archetype position.
 * ============================================================================= */

void Execute_Ground(Holographic_Coordinate* self, void* context_state);
void Execute_Form(Holographic_Coordinate* self, void* context_state);
void Execute_Entity(Holographic_Coordinate* self, void* context_state);
void Execute_Process(Holographic_Coordinate* self, void* context_state);
void Execute_Lemniscate(Holographic_Coordinate* self, void* context_state);
void Execute_Integration(Holographic_Coordinate* self, void* context_state);


#endif /* ARCHETYPES_H */
