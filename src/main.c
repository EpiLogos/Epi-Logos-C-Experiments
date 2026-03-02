/**
 * main.c — The Ignition Switch
 *
 * The very first piece of code the computer runs.
 * Its job is to boot the universe: initialize the archetypes,
 * verify the web is coherent, then hand off to the engine.
 *
 * Think of this file as the "morning" in the daily Möbius cycle —
 * C0 (Ground) igniting the first step toward C5 (Instance).
 *
 * As the system grows, main.c stays thin. It never implements logic;
 * it only composes and launches the modules that do.
 */

#include <stdio.h>
#include <stdint.h>
#include "../include/ontology.h"
#include "../include/archetypes.h"


/* =============================================================================
 * I. SANITY CHECK — Verify Struct Size
 *
 * The 128-byte rule is not aesthetic; it is architectural.
 * Two L1 cache lines = the entire holographic universe in one hardware breath.
 * If this assertion fires, something has bloated the struct.
 * ============================================================================= */

_Static_assert(
    sizeof(Holographic_Coordinate) == 128,
    "Holographic_Coordinate must be exactly 128 bytes (2 L1 cache lines)."
);


/* =============================================================================
 * II. BOOT SEQUENCE — Verify the Coordinate Web
 *
 * Before the engine runs, confirm that the .rodata bedrock is coherent:
 *   - C0's `.c` pointer self-references (ground is its own foundation)
 *   - C5's `.c` pointer returns to C0 (the Möbius twist is in place)
 *   - C4's `.cf` pointer self-references (the Lemniscate folds on itself)
 * ============================================================================= */

static int boot_verify_web(void) {
    int ok = 1;

    if (GET_PTR(Archetype_C0.c) != &Archetype_C0) {
        fprintf(stderr, "[boot] FAIL: C0.c does not self-reference.\n");
        ok = 0;
    }

    if (GET_PTR(Archetype_C5.c) != &Archetype_C0) {
        fprintf(stderr, "[boot] FAIL: C5.c does not return to C0 (Möbius broken).\n");
        ok = 0;
    }

    if (GET_PTR(Archetype_C4.cf) != &Archetype_C4) {
        fprintf(stderr, "[boot] FAIL: C4.cf does not self-reference (Lemniscate broken).\n");
        ok = 0;
    }

    if (ok) {
        printf("[boot] Coordinate web: OK\n");
        printf("[boot] Möbius return (C5 → C0): OK\n");
        printf("[boot] Lemniscate anchor (C4.cf → C4): OK\n");
    }

    return ok;
}


/* =============================================================================
 * III. PRINT ARCHETYPE — Debug helper
 * ============================================================================= */

static void print_archetype(const char* name, const Holographic_Coordinate* a) {
    printf("  %-20s  ql=%u  weave=%.1f  invoke=%s\n",
        name,
        a->ql_position,
        a->weave_state,
        a->invoke_process ? "yes" : "null"
    );
}


/* =============================================================================
 * IV. MAIN — The Ignition Switch
 * ============================================================================= */

int main(void) {
    printf("=== Epi-Logos C — System Boot ===\n\n");

    /* 1. Verify the .rodata web is coherent before the engine runs */
    if (!boot_verify_web()) {
        fprintf(stderr, "[boot] Aborting: coordinate web is malformed.\n");
        return 1;
    }

    printf("\n[boot] Archetype roster:\n");
    print_archetype("C0 (Bimba/Ground)",    &Archetype_C0);
    print_archetype("C1 (Morphe/Form)",     &Archetype_C1);
    print_archetype("C2 (Entity)",          &Archetype_C2);
    print_archetype("C3 (Process)",         &Archetype_C3);
    print_archetype("C4 (Type/Lemniscate)", &Archetype_C4);
    print_archetype("C5 (Pratibimba)",      &Archetype_C5);

    printf("\n[boot] Starting Torus walk (one full cycle, C0 → C5 → C0)...\n");

    /*
     * The engine is declared here and implemented in engine.c.
     * We declare it extern rather than including a separate engine.h
     * to keep the include graph minimal at this stage.
     */
    extern void engine_torus_walk(
        const Holographic_Coordinate* start,
        void* context_state,
        uint32_t steps
    );

    engine_torus_walk(&Archetype_C0, NULL, 0);  /* 0 = one full cycle */

    printf("\n[boot] Cycle complete. System nominal.\n");
    printf("=== Möbius return: C5 → C0. Tomorrow's ground is richer. ===\n");

    return 0;
}
