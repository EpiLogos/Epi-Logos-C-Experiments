/**
 * test_m2_aspects.c — Aspect Computation Verification Suite
 *
 * Tests m2_aspect_between() for all major aspects, orbs,
 * wrap-around, and no-aspect cases.
 */

#include <stdio.h>
#include <math.h>
#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m1.h"
#include "m2.h"

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
 * Exact aspects
 * =================================================================== */

static void test_exact_aspects(void) {
    Aspect_Result r;

    /* Exact conjunction: 0° - 0° */
    r = m2_aspect_between(0.0f, 0.0f);
    TEST("exact conjunction type", r.aspect_type == ASPECT_CONJUNCTION);
    TEST("exact conjunction orb = 0", approxf(r.orb, 0.0f));

    /* Exact sextile: 120° - 60° = 60° */
    r = m2_aspect_between(120.0f, 60.0f);
    TEST("exact sextile type", r.aspect_type == ASPECT_SEXTILE);
    TEST("exact sextile orb = 0", approxf(r.orb, 0.0f));

    /* Exact square: 0° - 90° */
    r = m2_aspect_between(0.0f, 90.0f);
    TEST("exact square type", r.aspect_type == ASPECT_SQUARE);
    TEST("exact square orb = 0", approxf(r.orb, 0.0f));

    /* Exact trine: 0° - 120° */
    r = m2_aspect_between(0.0f, 120.0f);
    TEST("exact trine type", r.aspect_type == ASPECT_TRINE);
    TEST("exact trine orb = 0", approxf(r.orb, 0.0f));

    /* Exact opposition: 0° - 180° */
    r = m2_aspect_between(0.0f, 180.0f);
    TEST("exact opposition type", r.aspect_type == ASPECT_OPPOSITION);
    TEST("exact opposition orb = 0", approxf(r.orb, 0.0f));
}


/* ===================================================================
 * Near conjunction (within orb)
 * =================================================================== */

static void test_near_conjunction(void) {
    Aspect_Result r;

    /* 5° apart — within conjunction orb (10°) */
    r = m2_aspect_between(10.0f, 15.0f);
    TEST("near conjunction (5°) type", r.aspect_type == ASPECT_CONJUNCTION);
    TEST("near conjunction (5°) orb ≈ 5", approxf(r.orb, 5.0f));

    /* 9° apart — still within orb */
    r = m2_aspect_between(0.0f, 9.0f);
    TEST("near conjunction (9°) type", r.aspect_type == ASPECT_CONJUNCTION);

    /* 10° apart — at edge of orb */
    r = m2_aspect_between(0.0f, 10.0f);
    TEST("conjunction at edge (10°) type", r.aspect_type == ASPECT_CONJUNCTION);
}


/* ===================================================================
 * No aspect (45° — not a major aspect)
 * =================================================================== */

static void test_no_aspect(void) {
    Aspect_Result r;

    /* 45° — not near any major aspect within orb */
    r = m2_aspect_between(0.0f, 45.0f);
    TEST("45° → no aspect", r.aspect_type == ASPECT_NONE);
    TEST("45° angle = 45", approxf(r.angle, 45.0f));

    /* 30° — nearest is conjunction(10° orb) at 30° dev and sextile(6° orb) at 30° dev */
    r = m2_aspect_between(0.0f, 30.0f);
    TEST("30° → no aspect", r.aspect_type == ASPECT_NONE);

    /* 150° — not near opposition(180±10) or trine(120±8) */
    r = m2_aspect_between(0.0f, 150.0f);
    TEST("150° → no aspect", r.aspect_type == ASPECT_NONE);
}


/* ===================================================================
 * Wrap-around tests (350° and 10° should be 20° = conjunction)
 * =================================================================== */

static void test_wrap_around(void) {
    Aspect_Result r;

    /* 350° and 10° → angular diff = 20° across 0° boundary */
    r = m2_aspect_between(350.0f, 10.0f);
    TEST("wrap 350°/10° angle = 20", approxf(r.angle, 20.0f));
    /* 20° is outside conjunction orb (10°), so no aspect */
    /* Wait — let me check: diff = |350-10| = 340 > 180 → 360-340 = 20. Correct. */

    /* 355° and 5° → angular diff = 10° → conjunction */
    r = m2_aspect_between(355.0f, 5.0f);
    TEST("wrap 355°/5° = conjunction", r.aspect_type == ASPECT_CONJUNCTION);
    TEST("wrap 355°/5° angle = 10", approxf(r.angle, 10.0f));

    /* 170° and 350° → diff = 180° = opposition */
    r = m2_aspect_between(170.0f, 350.0f);
    TEST("wrap 170°/350° = opposition", r.aspect_type == ASPECT_OPPOSITION);
    TEST("wrap 170°/350° angle = 180", approxf(r.angle, 180.0f));

    /* 5° and 355° → same as 355°/5° (commutative) */
    r = m2_aspect_between(5.0f, 355.0f);
    TEST("wrap 5°/355° = conjunction (commutative)", r.aspect_type == ASPECT_CONJUNCTION);

    /* 1° and 359° → diff = 2° → conjunction */
    r = m2_aspect_between(1.0f, 359.0f);
    TEST("wrap 1°/359° = conjunction (2°)", r.aspect_type == ASPECT_CONJUNCTION);
    TEST("wrap 1°/359° orb ≈ 2", approxf(r.orb, 2.0f));
}


/* ===================================================================
 * Tightest aspect selection
 * =================================================================== */

static void test_tightest_aspect(void) {
    Aspect_Result r;

    /* 55° — near sextile (60° ± 6°). Dev from sextile = 5°. */
    r = m2_aspect_between(0.0f, 55.0f);
    TEST("55° → sextile", r.aspect_type == ASPECT_SEXTILE);
    TEST("55° sextile orb ≈ 5", approxf(r.orb, 5.0f));

    /* 85° — near square (90° ± 8°). Dev = 5°. */
    r = m2_aspect_between(0.0f, 85.0f);
    TEST("85° → square", r.aspect_type == ASPECT_SQUARE);

    /* 125° — near trine (120° ± 8°). Dev = 5°. */
    r = m2_aspect_between(0.0f, 125.0f);
    TEST("125° → trine", r.aspect_type == ASPECT_TRINE);
}


/* ===================================================================
 * Aspect constants sanity
 * =================================================================== */

static void test_aspect_constants(void) {
    TEST("MAJOR_ASPECT_ANGLE[0] = 0",   MAJOR_ASPECT_ANGLE[0] == 0);
    TEST("MAJOR_ASPECT_ANGLE[1] = 60",  MAJOR_ASPECT_ANGLE[1] == 60);
    TEST("MAJOR_ASPECT_ANGLE[2] = 90",  MAJOR_ASPECT_ANGLE[2] == 90);
    TEST("MAJOR_ASPECT_ANGLE[3] = 120", MAJOR_ASPECT_ANGLE[3] == 120);
    TEST("MAJOR_ASPECT_ANGLE[4] = 180", MAJOR_ASPECT_ANGLE[4] == 180);

    TEST("MAJOR_ASPECT_ORB[0] = 10", MAJOR_ASPECT_ORB[0] == 10);
    TEST("MAJOR_ASPECT_ORB[1] = 6",  MAJOR_ASPECT_ORB[1] == 6);
    TEST("MAJOR_ASPECT_ORB[2] = 8",  MAJOR_ASPECT_ORB[2] == 8);
    TEST("MAJOR_ASPECT_ORB[3] = 8",  MAJOR_ASPECT_ORB[3] == 8);
    TEST("MAJOR_ASPECT_ORB[4] = 10", MAJOR_ASPECT_ORB[4] == 10);

    TEST("ASPECT_COUNT = 5", ASPECT_COUNT == 5);
    TEST("ASPECT_NONE = 0xFF", ASPECT_NONE == 0xFF);
}


int main(void) {
    test_exact_aspects();
    test_near_conjunction();
    test_no_aspect();
    test_wrap_around();
    test_tightest_aspect();
    test_aspect_constants();

    printf("\n=== test_m2_aspects: %d passed, %d failed ===\n",
           pass_count, fail_count);
    return fail_count > 0 ? 1 : 0;
}
