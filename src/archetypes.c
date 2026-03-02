/**
 * archetypes.c — The .rodata Bedrock
 *
 * The six raw archetypes (#0-#5) physically woven into .rodata.
 * family = FAMILY_NONE — these are pre-categorical foundation.
 * C0-C5 are C-family manifestations and live in the arena.
 */

#include "ontology.h"
#include "archetypes.h"
#include <stdio.h>

/* Execute_Ground — #0: Initialize context_state, mark Möbius return */
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
}

void Execute_Integration(Holographic_Coordinate* self, void* ctx) {
    if (!ctx) return;
    Walk_Context* wc = (Walk_Context*)ctx;
    wc->current_position = self->ql_position;
    wc->step_count++;
}

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
