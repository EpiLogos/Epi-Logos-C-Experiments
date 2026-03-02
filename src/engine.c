/**
 * engine.c — The Torus Engine
 *
 * This is the kinetic heart of the Epi-Logos system.
 * It contains two primary mechanisms:
 *
 *   1. The Torus Walk — the cyclic traversal of the coordinate web.
 *      The CPU's electrical signals run in a physical circle through
 *      the coordinate arc C0 → C1 → C2 → C3 → C4 → C5 → C0.
 *
 *   2. The Coordinate Map — a hash table that routes a (ql_position, weave_state)
 *      key to the next coordinate in the walk, implementing the non-linear
 *      jumps the Lemniscate and Möbius return require.
 *
 * This file knows HOW to move. archetypes.c knows WHAT the coordinates are.
 */

#include <stddef.h>
#include <stdio.h>
#include "../include/ontology.h"
#include "../include/archetypes.h"


/* =============================================================================
 * I. THE COORDINATE MAP (Hash Table Routing)
 *
 * A simple lookup table that maps each archetype's ql_position to the
 * next coordinate in the Torus walk.
 *
 * This is the "Hash Table Map" described in the onto-code blueprint.
 * It encodes the non-linear topology: C3 → C4 (Lemniscate branch),
 * C5 → C0 (Möbius return), and the standard sequential steps.
 * ============================================================================= */

typedef struct {
    uint8_t                  from_position;
    const Holographic_Coordinate* next_coordinate;
} Coordinate_Map_Entry;

static const Coordinate_Map_Entry coordinate_map[] = {
    { 0, &Archetype_C1 },  /* C0 (Ground)   → C1 (Form)         */
    { 1, &Archetype_C2 },  /* C1 (Form)     → C2 (Entity)       */
    { 2, &Archetype_C3 },  /* C2 (Entity)   → C3 (Process)      */
    { 3, &Archetype_C4 },  /* C3 (Process)  → C4 (Type/Lemni.)  */
    { 4, &Archetype_C5 },  /* C4 (Type)     → C5 (Instance)     */
    { 5, &Archetype_C0 },  /* C5 (Instance) → C0 (Möbius return)*/
};

#define MAP_SIZE (sizeof(coordinate_map) / sizeof(coordinate_map[0]))


/* =============================================================================
 * II. MAP LOOKUP
 *    Given the current position, return the next coordinate on the Torus.
 *    Returns NULL if position is out of range (should never happen in a
 *    well-formed web, but we check rather than crash).
 * ============================================================================= */

const Holographic_Coordinate* engine_next_coordinate(uint8_t current_position) {
    for (size_t i = 0; i < MAP_SIZE; i++) {
        if (coordinate_map[i].from_position == current_position) {
            return coordinate_map[i].next_coordinate;
        }
    }
    return NULL;  /* Position outside the Mod 6 arc — topological error */
}


/* =============================================================================
 * III. THE TORUS WALK
 *    The cyclic traversal engine — the physical Torus in motion.
 *
 *    Each step:
 *      1. Invokes the current coordinate's `()` operator (if present).
 *      2. Looks up the next coordinate in the map.
 *      3. Advances the pointer.
 *      4. Loops back to C0 after C5 (the Möbius return).
 *
 *    `steps` controls how many coordinates to visit (0 = run one full cycle).
 *    `context_state` is passed through to each invoke_process call.
 * ============================================================================= */

void engine_torus_walk(
    const Holographic_Coordinate* start,
    void* context_state,
    uint32_t steps
) {
    if (start == NULL) return;

    const Holographic_Coordinate* current = start;
    uint32_t count = 0;
    uint32_t limit = (steps == 0) ? 6 : steps;  /* Default: one full cycle */

    while (count < limit) {
        /* Invoke the coordinate's execution context if it has one */
        if (current->invoke_process != NULL) {
            /*
             * Cast away const for the call: invoke_process may mutate
             * an external context_state, but must not write back to
             * the const archetype itself.
             */
            current->invoke_process((Holographic_Coordinate*)current, context_state);
        }

        /* Follow the Torus map to the next coordinate */
        const Holographic_Coordinate* next = engine_next_coordinate(current->ql_position);

        if (next == NULL) {
            fprintf(stderr, "[engine] Torus walk broken at position %u\n",
                    current->ql_position);
            break;
        }

        current = next;
        count++;
    }
}


/* =============================================================================
 * IV. THE LEMNISCATE DIVE
 *    When the walk reaches C4 (the #4 Lemniscate anchor), it can optionally
 *    recurse inward via the `cf` pointer — the figure-eight fold where the
 *    outward process incubates a deeper nested reality.
 *
 *    This is where the `.` (nesting) operator primarily operates.
 *    `depth` limits the inward recursion to prevent infinite loops.
 * ============================================================================= */

void engine_lemniscate_dive(
    const Holographic_Coordinate* c4_entry,
    void* context_state,
    uint8_t depth
) {
    if (c4_entry == NULL || depth == 0) return;
    if (c4_entry->cf == NULL)           return;

    const Holographic_Coordinate* inner = GET_PTR(c4_entry->cf);

    if (inner->invoke_process != NULL) {
        inner->invoke_process((Holographic_Coordinate*)inner, context_state);
    }

    /* Recurse inward — the Lemniscate folds upon itself */
    engine_lemniscate_dive(inner, context_state, depth - 1);
}
