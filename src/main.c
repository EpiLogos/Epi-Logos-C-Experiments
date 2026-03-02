/**
 * main.c — The Ignition Switch
 *
 * Boots the system, verifies the coordinate web,
 * initializes arenas, instantiates families, runs the engine.
 */

#include <stdio.h>
#include "ontology.h"
#include "archetypes.h"
#include "engine.h"
#include "arena.h"

_Static_assert(
    sizeof(Holographic_Coordinate) == 128,
    "Holographic_Coordinate must be exactly 128 bytes (2 L1 cache lines)."
);

static int boot_verify_web(void) {
    int ok = 1;
    if (GET_PTR(Archetype_0.c) != &Archetype_0) {
        fprintf(stderr, "[boot] FAIL: #0.c does not self-reference.\n");
        ok = 0;
    }
    if (GET_PTR(Archetype_5.c) != &Archetype_0) {
        fprintf(stderr, "[boot] FAIL: #5.c does not return to #0 (Möbius broken).\n");
        ok = 0;
    }
    if (GET_PTR(Archetype_4.cf) != &Archetype_4) {
        fprintf(stderr, "[boot] FAIL: #4.cf does not self-reference (Lemniscate broken).\n");
        ok = 0;
    }
    if (ok) {
        printf("[boot] .rodata web: OK\n");
        printf("[boot] Möbius return (#5 -> #0): OK\n");
        printf("[boot] Lemniscate anchor (#4.cf -> #4): OK\n");
    }
    return ok;
}

int main(void) {
    printf("=== Epi-Logos C — System Boot ===\n\n");

    /* Phase 1: Verify .rodata bedrock */
    if (!boot_verify_web()) {
        fprintf(stderr, "[boot] Aborting: .rodata web malformed.\n");
        return 1;
    }

    /* Phase 2: Initialize arena (Shakti) */
    Coordinate_Arena arena;
    if (arena_init(&arena, 64) != 0) {
        fprintf(stderr, "[boot] Aborting: arena init failed.\n");
        return 1;
    }
    printf("[boot] Arena initialized (64 slots).\n");

    /* Phase 3: Create mutable mirrors of #0-#5 */
    Holographic_Coordinate* mirrors[6];
    const Holographic_Coordinate* raw[] = {
        &Archetype_0, &Archetype_1, &Archetype_2,
        &Archetype_3, &Archetype_4, &Archetype_5
    };
    for (int i = 0; i < 6; i++) {
        mirrors[i] = arena_alloc(&arena);
        mirrors[i]->ql_position = raw[i]->ql_position;
        mirrors[i]->family = FAMILY_NONE;
        mirrors[i]->weave_state = raw[i]->weave_state;
        mirrors[i]->invoke_process = raw[i]->invoke_process;
        mirrors[i]->c = (i == 0) ? mirrors[0] : mirrors[i - 1];
    }
    /* Möbius: mirror #5.c -> mirror #0 */
    mirrors[5]->c = mirrors[0];
    /* Lemniscate: mirror #4.cf -> mirror #4 */
    mirrors[4]->cf = mirrors[4];
    mirrors[3]->cf = mirrors[4];
    printf("[boot] Mutable mirrors created.\n");

    /* Phase 4: Instantiate families */
    if (families_init(&arena, mirrors) != 0) {
        fprintf(stderr, "[boot] Aborting: family init failed.\n");
        arena_destroy(&arena);
        return 1;
    }
    families_crosslink(&arena);
    families_wire_reflective(&arena);
    printf("[boot] All 6 families instantiated and cross-linked (%u slots used).\n", arena.count);

    /* Phase 5: Run double covering (720°) */
    Walk_Context wc = {0};
    printf("\n[engine] Starting double covering (720°)...\n");
    engine_double_covering(mirrors[0], &wc);
    printf("[engine] Double covering complete: %u steps, %u cycles.\n",
           wc.step_count, wc.cycle_count);

    /* Cleanup */
    arena_destroy(&arena);

    printf("\n=== Möbius return: #5 -> #0. Tomorrow's ground is richer. ===\n");
    return 0;
}
