/**
 * main.c — The Ignition Switch
 *
 * Boots the system, verifies the coordinate web,
 * runs the engine.
 */

#include <stdio.h>
#include "ontology.h"
#include "archetypes.h"
#include "engine.h"

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
        printf("[boot] Coordinate web: OK\n");
        printf("[boot] Möbius return (#5 -> #0): OK\n");
        printf("[boot] Lemniscate anchor (#4.cf -> #4): OK\n");
    }
    return ok;
}

int main(void) {
    printf("=== Epi-Logos C — System Boot ===\n\n");

    if (!boot_verify_web()) {
        fprintf(stderr, "[boot] Aborting: coordinate web malformed.\n");
        return 1;
    }

    printf("\n[boot] Starting Torus walk (#0 -> #5 -> #0)...\n");
    engine_torus_walk(&Archetype_0, NULL, 0);

    printf("\n[boot] Cycle complete. System nominal.\n");
    printf("=== Möbius return: #5 -> #0. Tomorrow's ground is richer. ===\n");
    return 0;
}
