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
