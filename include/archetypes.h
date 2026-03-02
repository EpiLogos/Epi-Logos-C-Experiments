/**
 * archetypes.h — The Promises of the Bedrock
 *
 * This file contains ONLY `extern` declarations — promises to the compiler
 * that the six canonical archetypes (C0–C5) and their execution functions
 * exist somewhere in the universe of compiled objects.
 *
 * The actual memory for these archetypes is allocated once, immutably,
 * in src/archetypes.c and locked into the .rodata segment at link time.
 *
 * Any .c file that needs to REFERENCE an archetype includes this header.
 * Only archetypes.c provides the DEFINITION.
 */

#ifndef ARCHETYPES_H
#define ARCHETYPES_H

#include "ontology.h"


/* =============================================================================
 * I. THE SIX CANONICAL ARCHETYPES (Extern Promises)
 *    The Bimba-Pratibimba Lifecycle — C0 through C5
 *
 * These live in .rodata: immutable, transcendent, Siva.
 * Never copy them. Always access them via pointer (&Archetype_Cx).
 * ============================================================================= */

extern const Holographic_Coordinate Archetype_C0;  /* Bimba       — Ground, canonical source     */
extern const Holographic_Coordinate Archetype_C1;  /* Morphe      — Essential form, definition   */
extern const Holographic_Coordinate Archetype_C2;  /* Entity      — Atomic unit, operation       */
extern const Holographic_Coordinate Archetype_C3;  /* Process     — Dynamic becoming, pattern    */
extern const Holographic_Coordinate Archetype_C4;  /* Type        — Formal pattern, context      */
extern const Holographic_Coordinate Archetype_C5;  /* Pratibimba  — Instance, Möbius return      */


/* =============================================================================
 * II. THE INTERLACED WEAVE STATES (The 10-Fold Arena Midpoints)
 *
 * These represent the non-dual states that incubate between the explicate
 * coordinates. The CPU passes through them physically in memory.
 *   Weave_0_5  : Ground reaching toward Instance (0.0 → 0.5)
 *   Weave_5_0  : Instance reaching back to Ground (5.0)
 *   Weave_5_5  : Pure Instance midpoint (5.5)
 * ============================================================================= */

extern const Holographic_Coordinate Weave_0_5;  /* Between C0 and C2 — implicate incubation  */
extern const Holographic_Coordinate Weave_5_0;  /* Between C2 and C3 — instance rising       */
extern const Holographic_Coordinate Weave_5_5;  /* Between C4 and C5 — pure synthesis        */


/* =============================================================================
 * III. THE EXECUTION FUNCTION PROTOTYPES
 *    These are the `()` operator implementations for each archetype.
 *    Bodies live in src/archetypes.c.
 * ============================================================================= */

void Execute_NonDual_Ground(Holographic_Coordinate* self, void* context_state);
void Execute_Form_Instantiation(Holographic_Coordinate* self, void* context_state);
void Execute_Entity_Operation(Holographic_Coordinate* self, void* context_state);
void Execute_Process_Becoming(Holographic_Coordinate* self, void* context_state);
void Execute_Lemniscate_Incubation(Holographic_Coordinate* self, void* context_state);
void Execute_Mobius_Compression(Holographic_Coordinate* self, void* context_state);


#endif /* ARCHETYPES_H */
