/**
 * engine.c — The Torus Engine
 *
 * Torus walk, Lemniscate dive, double covering.
 */

#include "engine.h"
#include "psychoid_numbers.h"
#include <stdio.h>

static const struct { uint8_t from; const Holographic_Coordinate* to; } torus_map[] = {
    { 0, &Psychoid_1 },
    { 1, &Psychoid_2 },
    { 2, &Psychoid_3 },
    { 3, &Psychoid_4 },
    { 4, &Psychoid_5 },
    { 5, &Psychoid_0 },
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
        /* At #4, optionally dive into the Lemniscate */
        if (current->ql_position == 4 && current->cf != NULL) {
            engine_lemniscate_dive(current, context_state, 1);
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


/* =============================================================================
 * VAK INSTRUCTION DISPATCH — operates on the 6 reflective coordinates
 * ============================================================================= */

#include "vak.h"

/* Default handler table — all return VAK_ERR_FAMILY until M-branches register */
static int vak_default_handler(Holographic_Coordinate* s, VAK_Instruction i) {
    (void)s; (void)i;
    return VAK_ERR_FAMILY;
}

static VAK_Handler vak_handlers[VAK_FAMILY_COUNT] = {
    vak_default_handler, vak_default_handler, vak_default_handler,
    vak_default_handler, vak_default_handler, vak_default_handler
};

void vak_register_handler(uint8_t family, VAK_Handler handler) {
    if (family < VAK_FAMILY_COUNT && handler) {
        vak_handlers[family] = handler;
    }
}

int execute_vak_instruction(Holographic_Coordinate* session,
                            VAK_Instruction instr) {
    if (instr.vak_family >= VAK_FAMILY_COUNT) return VAK_ERR_FAMILY;
    if (!session) return VAK_ERR_SESSION;
    return vak_handlers[instr.vak_family](session, instr);
}
