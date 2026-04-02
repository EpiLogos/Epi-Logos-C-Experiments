/**
 * test_engine_walk_mode.c — Walk_Mode Verification Suite
 *
 * Tests walk_mode_from_quaternion, bifurcation parameter,
 * resolution levels, and engine_walk_by_mode() dispatcher.
 */

#include <stdio.h>
#include <math.h>
#include "ontology.h"
#include "psychoid_numbers.h"
#include "engine.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; } \
    else { fail_count++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)

static int approxf(float a, float b) {
    float diff = a - b;
    return (diff < 0.01f) && (diff > -0.01f);
}

/* ===================================================================
 * walk_mode_from_quaternion — argmax of absolutes
 * =================================================================== */

static void test_walk_mode_selection(void) {
    /* w dominant → WALK_GROUND */
    TEST("w dominant → WALK_GROUND",
         walk_mode_from_quaternion(1.0f, 0.0f, 0.0f, 0.0f) == WALK_GROUND);

    /* x dominant → WALK_TORUS */
    TEST("x dominant → WALK_TORUS",
         walk_mode_from_quaternion(0.0f, 1.0f, 0.0f, 0.0f) == WALK_TORUS);

    /* y dominant → WALK_FIBER */
    TEST("y dominant → WALK_FIBER",
         walk_mode_from_quaternion(0.0f, 0.0f, 1.0f, 0.0f) == WALK_FIBER);

    /* z dominant → WALK_SPANDA */
    TEST("z dominant → WALK_SPANDA",
         walk_mode_from_quaternion(0.0f, 0.0f, 0.0f, 1.0f) == WALK_SPANDA);

    /* Negative values — absolute used */
    TEST("negative w dominant → WALK_GROUND",
         walk_mode_from_quaternion(-5.0f, 1.0f, 2.0f, 3.0f) == WALK_GROUND);

    TEST("negative x dominant → WALK_TORUS",
         walk_mode_from_quaternion(0.1f, -0.9f, 0.2f, 0.3f) == WALK_TORUS);

    /* Mixed — z dominant by small margin */
    TEST("z barely dominant → WALK_SPANDA",
         walk_mode_from_quaternion(0.49f, 0.49f, 0.49f, 0.50f) == WALK_SPANDA);
}


/* ===================================================================
 * Bifurcation parameter
 * =================================================================== */

static void test_bifurcation_param(void) {
    /* Ground quaternion: (1,0,0,0) → lambda = 0 */
    TEST("ground quaternion bifurcation = 0",
         approxf(walk_bifurcation_param(1.0f, 0.0f, 0.0f, 0.0f), 0.0f));

    /* Equal xyz components: (0, 1/sqrt3, 1/sqrt3, 1/sqrt3) → lambda = 1 */
    float c = 1.0f / sqrtf(3.0f);
    TEST("equal xyz components bifurcation ≈ 1",
         approxf(walk_bifurcation_param(0.0f, c, c, c), 1.0f));

    /* Pure x: (0, 0.5, 0, 0) → lambda = 0.5 */
    TEST("pure x=0.5 bifurcation = 0.5",
         approxf(walk_bifurcation_param(0.0f, 0.5f, 0.0f, 0.0f), 0.5f));

    /* w is ignored in bifurcation */
    TEST("w does not affect bifurcation",
         approxf(walk_bifurcation_param(999.0f, 0.3f, 0.4f, 0.0f), 0.5f));
}


/* ===================================================================
 * Resolution levels
 * =================================================================== */

static void test_resolution_levels(void) {
    TEST("lambda=0.0 → level 0", walk_resolution_level(0.0f) == 0);
    TEST("lambda=0.1 → level 0", walk_resolution_level(0.1f) == 0);
    TEST("lambda=0.24 → level 0", walk_resolution_level(0.24f) == 0);
    TEST("lambda=0.25 → level 1", walk_resolution_level(0.25f) == 1);
    TEST("lambda=0.49 → level 1", walk_resolution_level(0.49f) == 1);
    TEST("lambda=0.50 → level 2", walk_resolution_level(0.50f) == 2);
    TEST("lambda=0.74 → level 2", walk_resolution_level(0.74f) == 2);
    TEST("lambda=0.75 → level 3", walk_resolution_level(0.75f) == 3);
    TEST("lambda=1.0 → level 3", walk_resolution_level(1.0f) == 3);
}


/* ===================================================================
 * Walk dispatcher tests — callback counting
 * =================================================================== */

static uint32_t cb_count;
static uint8_t  cb_positions[64];

static void counting_callback(uint8_t position, void* ctx) {
    (void)ctx;
    if (cb_count < 64) {
        cb_positions[cb_count] = position;
    }
    cb_count++;
}

static void test_walk_ground_dispatch(void) {
    cb_count = 0;
    engine_walk_by_mode(WALK_GROUND, &Psychoid_0, NULL, counting_callback, 0);
    TEST("WALK_GROUND emits exactly 1 callback", cb_count == 1);
    TEST("WALK_GROUND emits start position (0)", cb_positions[0] == 0);

    /* With a different start */
    cb_count = 0;
    engine_walk_by_mode(WALK_GROUND, &Psychoid_3, NULL, counting_callback, 0);
    TEST("WALK_GROUND emits position 3", cb_positions[0] == 3);
}

static void test_walk_spanda_dispatch(void) {
    cb_count = 0;
    engine_walk_by_mode(WALK_SPANDA, NULL, NULL, counting_callback, 12);
    TEST("WALK_SPANDA(12) emits 12 callbacks", cb_count == 12);

    /* Verify tick sequence: 0,1,2,...,11 */
    int sequence_ok = 1;
    for (uint8_t i = 0; i < 12 && i < cb_count; i++) {
        if (cb_positions[i] != i) { sequence_ok = 0; break; }
    }
    TEST("WALK_SPANDA ticks are 0-11 in order", sequence_ok);

    /* Default steps = 12 */
    cb_count = 0;
    engine_walk_by_mode(WALK_SPANDA, NULL, NULL, counting_callback, 0);
    TEST("WALK_SPANDA(0) defaults to 12 ticks", cb_count == 12);
}

static void test_walk_torus_dispatch(void) {
    cb_count = 0;
    engine_walk_by_mode(WALK_TORUS, &Psychoid_0, NULL, counting_callback, 6);
    TEST("WALK_TORUS(6) emits 6 callbacks", cb_count == 6);

    /* Verify positions: 0,1,2,3,4,5 */
    int sequence_ok = 1;
    for (uint8_t i = 0; i < 6 && i < cb_count; i++) {
        if (cb_positions[i] != i) { sequence_ok = 0; break; }
    }
    TEST("WALK_TORUS positions are 0-5 in order", sequence_ok);
}

static void test_null_callback_safety(void) {
    /* Should not crash */
    engine_walk_by_mode(WALK_GROUND, &Psychoid_0, NULL, NULL, 0);
    engine_walk_by_mode(WALK_TORUS, &Psychoid_0, NULL, NULL, 6);
    engine_walk_by_mode(WALK_FIBER, &Psychoid_4, NULL, NULL, 4);
    engine_walk_by_mode(WALK_SPANDA, NULL, NULL, NULL, 12);
    TEST("null callback does not crash", 1);
}

static void test_zero_steps_safety(void) {
    /* WALK_GROUND always emits 1 regardless of steps */
    cb_count = 0;
    engine_walk_by_mode(WALK_GROUND, &Psychoid_0, NULL, counting_callback, 0);
    TEST("WALK_GROUND with steps=0 still emits 1", cb_count == 1);

    /* WALK_TORUS with steps=0 defaults to 6 */
    cb_count = 0;
    engine_walk_by_mode(WALK_TORUS, &Psychoid_0, NULL, counting_callback, 0);
    TEST("WALK_TORUS with steps=0 defaults to 6", cb_count == 6);
}


int main(void) {
    test_walk_mode_selection();
    test_bifurcation_param();
    test_resolution_levels();
    test_walk_ground_dispatch();
    test_walk_spanda_dispatch();
    test_walk_torus_dispatch();
    test_null_callback_safety();
    test_zero_steps_safety();

    printf("\n=== test_engine_walk_mode: %d passed, %d failed ===\n",
           pass_count, fail_count);
    return fail_count > 0 ? 1 : 0;
}
