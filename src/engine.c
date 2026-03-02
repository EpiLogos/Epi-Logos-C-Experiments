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
