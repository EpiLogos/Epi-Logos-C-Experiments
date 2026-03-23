/**
 * test_m4_oracle_faces.c — The four oracle face derivations
 *
 * Source: 00-canonical-invariants.md §7
 * Face 1 Primary:   CLOCK_DEGREE_LUT[d]               — expressed codon
 * Face 2 Deficient: CLOCK_DEGREE_LUT[(d + 180) % 360]  — polar complement
 * Face 3 Implicate: exact_degree_720 = d + 360          — Strand B, π phase-shift
 * Face 4 Temporal:  primary_hex XOR changing_lines      — live cast
 *
 * These tests verify the ARITHMETIC only, not LUT contents.
 */

#include <stdio.h>
#include <stdint.h>

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; printf("  pass: %s\n", name); } \
    else { fail_count++; fprintf(stderr, "  FAIL: %s\n", name); } \
} while(0)


/* T1: deficient face is (d + 180) % 360 */
static void test_deficient_face_is_d_plus_180_mod360(void) {
    uint16_t d, deficient_degree;

    /* d=45 → 225 (no wrap) */
    d = 45;
    deficient_degree = (uint16_t)((d + 180u) % 360u);
    TEST("deficient(45) == 225", deficient_degree == 225);

    /* d=270 → (270+180)%360 = 450%360 = 90 (wraps) */
    d = 270;
    deficient_degree = (uint16_t)((d + 180u) % 360u);
    TEST("deficient(270) == 90 (wraps)", deficient_degree == 90);
}


/* T2: implicate face is d + 360 (Strand B) */
static void test_implicate_face_is_d_plus_360(void) {
    float implicate_720;

    implicate_720 = 45.0f + 360.0f;
    TEST("implicate(45) == 405.0", implicate_720 == 405.0f);

    implicate_720 = 0.0f + 360.0f;
    TEST("implicate(0) == 360.0 (first shadow position)", implicate_720 == 360.0f);
}


/* T3: deficient and implicate are distinct concepts
 *
 * CRITICAL: (d+180)%360 ≠ d+360 for any d.
 * Deficient = opposite pole SAME strand (Strand A, 360 span).
 * Implicate = same pole OPPOSITE strand (Strand B, offset +360).
 */
static void test_deficient_and_implicate_are_distinct_concepts(void) {
    uint16_t d = 90;

    uint16_t deficient_degree   = (uint16_t)((d + 180u) % 360u);   /* 270 */
    float    implicate_720      = (float)d + 360.0f;                /* 450 */

    /* deficient is the antipodal degree in [0,360) */
    TEST("deficient(90) == 270", deficient_degree == 270);

    /* implicate is in Strand B range [360,720) */
    TEST("implicate(90) == 450.0", implicate_720 == 450.0f);

    /* They refer to different torus positions:
     * deficient_degree lives in [0,360); implicate_720 - 360 gives the Strand-B
     * ring position which equals d, NOT deficient_degree. */
    uint16_t implicate_ring_position = (uint16_t)(implicate_720 - 360.0f); /* 90 */
    TEST("deficient(270) != implicate_ring_pos(90)",
         deficient_degree != implicate_ring_position);
}


/* T4: temporal face is XOR of primary hexagram and changing lines mask */
static void test_temporal_face_is_xor_of_primary_and_changing_lines(void) {
    uint8_t primary      = 0x3Fu; /* hexagram 63, all 6 lines solid */
    uint8_t mask         = 0x01u; /* one changing line */
    uint8_t temporal     = primary ^ mask;

    TEST("temporal == 0x3E (one line flipped)", temporal == 0x3Eu);
}


/* T5: temporal XOR is reversible */
static void test_temporal_xor_is_reversible(void) {
    uint8_t primary  = 0x2Au;
    uint8_t mask     = 0x15u;
    uint8_t temporal = primary ^ mask;

    TEST("(primary ^ mask) ^ mask == primary", (temporal ^ mask) == primary);
}


/* T6: deficient of deficient is primary (polar complement applied twice) */
static void test_deficient_of_deficient_is_primary(void) {
    uint16_t d = 45;
    uint16_t double_deficient = (uint16_t)(((uint32_t)d + 180u + 180u) % 360u);

    TEST("deficient(deficient(45)) == 45", double_deficient == d);

    /* Verify the arithmetic in one step: (d+360) % 360 == d */
    uint16_t d2 = 200;
    uint16_t dd2 = (uint16_t)(((uint32_t)d2 + 360u) % 360u);
    TEST("deficient(deficient(200)) == 200", dd2 == d2);
}


/* T7: implicate_720 stays in valid Strand B range [360, 720) */
static void test_implicate_720_stays_in_valid_range(void) {
    /* d=0 → 360 (first Strand B position) */
    float impl_min = 0.0f + 360.0f;
    TEST("implicate(0) >= 360", impl_min >= 360.0f);
    TEST("implicate(0) < 720",  impl_min < 720.0f);

    /* d=359 → 719 (last Strand B position) */
    float impl_max = 359.0f + 360.0f;
    TEST("implicate(359) >= 360", impl_max >= 360.0f);
    TEST("implicate(359) < 720",  impl_max < 720.0f);
}


int main(void) {
    printf("=== M4 Oracle Four Faces ===\n\n");

    test_deficient_face_is_d_plus_180_mod360();
    test_implicate_face_is_d_plus_360();
    test_deficient_and_implicate_are_distinct_concepts();
    test_temporal_face_is_xor_of_primary_and_changing_lines();
    test_temporal_xor_is_reversible();
    test_deficient_of_deficient_is_primary();
    test_implicate_720_stays_in_valid_range();

    printf("\n=== Results: %d passed, %d failed (of %d) ===\n",
           pass_count, fail_count, pass_count + fail_count);

    return fail_count > 0 ? 1 : 0;
}
