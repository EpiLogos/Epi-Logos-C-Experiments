/*
 * test_m1_ananda_projection.c — W1 typed Ananda substrate acceptance
 *
 * Verifies canonical 12x12 raw arithmetic, true DR12, explicit decimal10
 * aperture, Quintessence tuple preservation and Spanda-address passthrough.
 */

#include "../../include/m1_ananda_projection.h"
#include <stdio.h>
#include <stdint.h>

static int suite_pass = 0;
static int suite_fail = 0;
static int test_failed = 0;

#define ASSERT_TRUE(expr) \
    do { if (!(expr)) { \
        printf("    FAIL %s:%d: %s\n", __FILE__, __LINE__, #expr); \
        test_failed = 1; \
    } } while (0)

#define ASSERT_EQ_INT(expected, actual) \
    do { int e_ = (int)(expected), a_ = (int)(actual); if (e_ != a_) { \
        printf("    FAIL %s:%d: expected %d got %d\n", \
               __FILE__, __LINE__, e_, a_); \
        test_failed = 1; \
    } } while (0)

#define RUN_TEST(fn) \
    do { \
        test_failed = 0; \
        fn(); \
        if (test_failed) { printf("  FAIL: %s\n", #fn); ++suite_fail; } \
        else { printf("  pass: %s\n", #fn); ++suite_pass; } \
    } while (0)

static M1_Ananda_Oscillatory_Address address_fixture(void) {
    M1_Ananda_Oscillatory_Address a;
    a.tick12 = 7u;
    a.position6 = 4u;
    a.conjugate_position6 = 1u;
    a.phase = M1_ANANDA_PRIME_PHASE;
    a.spanda_stage = SPANDA_FLOWERING;
    return a;
}

static M1_Ananda_Cell_Projection project(
        Ananda_Matrix_Op family,
        uint8_t row,
        uint8_t col)
{
    M1_Ananda_Cell_Projection p;
    M1_Ananda_Oscillatory_Address a = address_fixture();
    ASSERT_TRUE(m1_ananda_project_cell(family, row, col, &a, &p));
    return p;
}

static void test_true_digit_root(void) {
    ASSERT_EQ_INT(0, m1_ananda_true_digit_root(0));
    ASSERT_EQ_INT(9, m1_ananda_true_digit_root(9));
    ASSERT_EQ_INT(1, m1_ananda_true_digit_root(10));
    ASSERT_EQ_INT(9, m1_ananda_true_digit_root(72));
    ASSERT_EQ_INT(8, m1_ananda_true_digit_root(71));
}

static void test_dr12_luts_match_canonical_formula(void) {
    ASSERT_TRUE(m1_ananda_verify_dr12_luts());
}

static void test_raw12_affine_families_exhaustive(void) {
    for (uint8_t r = 0; r < 12u; ++r) {
        for (uint8_t c = 0; c < 12u; ++c) {
            int kp = (int)r * (int)c;
            M1_Ananda_Cell_Projection b = project(MATRIX_BIMBA, r, c);
            M1_Ananda_Cell_Projection p = project(MATRIX_PRATIBIMBA, r, c);
            M1_Ananda_Cell_Projection s = project(MATRIX_SUM, r, c);
            M1_Ananda_Cell_Projection da = project(MATRIX_DIFF_A, r, c);
            M1_Ananda_Cell_Projection db = project(MATRIX_DIFF_B, r, c);

            ASSERT_EQ_INT(kp, b.raw12_value);
            ASSERT_EQ_INT(kp + 1, p.raw12_value);
            ASSERT_EQ_INT((2 * kp) + 1, s.raw12_value);
            ASSERT_EQ_INT(-1, da.raw12_value);
            ASSERT_EQ_INT(1, db.raw12_value);
            ASSERT_EQ_INT(9, da.digit_root12_value);
            ASSERT_EQ_INT(1, db.digit_root12_value);
        }
    }
}

static void test_source_spots_expose_36_64_72(void) {
    /* CSV 7X+1: col5=36, col8=57; Bimba col8=56; col9=63. */
    M1_Ananda_Cell_Projection p75 = project(MATRIX_PRATIBIMBA, 7u, 5u);
    M1_Ananda_Cell_Projection p78 = project(MATRIX_PRATIBIMBA, 7u, 8u);
    M1_Ananda_Cell_Projection b88 = project(MATRIX_BIMBA, 8u, 8u);
    M1_Ananda_Cell_Projection b89 = project(MATRIX_BIMBA, 8u, 9u);

    ASSERT_EQ_INT(36, p75.raw12_value);
    ASSERT_EQ_INT(57, p78.raw12_value);
    ASSERT_EQ_INT(64, b88.raw12_value);
    ASSERT_EQ_INT(72, b89.raw12_value);
    ASSERT_EQ_INT(1, b88.digit_root12_value);
    ASSERT_EQ_INT(9, b89.digit_root12_value);
}

static void test_source_rows_10_11_are_full_raw12_not_shadow_rows(void) {
    /*
     * Canonical CSV source rows 10 and 11 continue the affine raw field:
     *   10X+0 col11=110, 10X+1 col11=111, sum=221
     *   11X+0 col11=121, 11X+1 col11=122, sum=243
     * The packed DR table may recur mod 9, but raw12 identity must not.
     */
    M1_Ananda_Cell_Projection b10 = project(MATRIX_BIMBA, 10u, 11u);
    M1_Ananda_Cell_Projection p10 = project(MATRIX_PRATIBIMBA, 10u, 11u);
    M1_Ananda_Cell_Projection s10 = project(MATRIX_SUM, 10u, 11u);
    M1_Ananda_Cell_Projection b11 = project(MATRIX_BIMBA, 11u, 11u);
    M1_Ananda_Cell_Projection p11 = project(MATRIX_PRATIBIMBA, 11u, 11u);
    M1_Ananda_Cell_Projection s11 = project(MATRIX_SUM, 11u, 11u);

    ASSERT_EQ_INT(110, b10.raw12_value);
    ASSERT_EQ_INT(111, p10.raw12_value);
    ASSERT_EQ_INT(221, s10.raw12_value);
    ASSERT_EQ_INT(2, b10.digit_root12_value);
    ASSERT_EQ_INT(3, p10.digit_root12_value);
    ASSERT_EQ_INT(5, s10.digit_root12_value);

    ASSERT_EQ_INT(121, b11.raw12_value);
    ASSERT_EQ_INT(122, p11.raw12_value);
    ASSERT_EQ_INT(243, s11.raw12_value);
    ASSERT_EQ_INT(4, b11.digit_root12_value);
    ASSERT_EQ_INT(5, p11.digit_root12_value);
    ASSERT_EQ_INT(9, s11.digit_root12_value);

    ASSERT_TRUE(!b10.decimal10_valid);
    ASSERT_TRUE(!p10.decimal10_valid);
    ASSERT_TRUE(!s10.decimal10_valid);
    ASSERT_TRUE(!b11.decimal10_valid);
    ASSERT_TRUE(!p11.decimal10_valid);
    ASSERT_TRUE(!s11.decimal10_valid);
}

static void test_decimal10_is_explicit_legacy_aperture(void) {
    M1_Ananda_Oscillatory_Address a = address_fixture();

    for (uint8_t f = (uint8_t)MATRIX_BIMBA;
         f <= (uint8_t)MATRIX_DIFF_B;
         ++f)
    {
        for (uint8_t r = 0; r < 10u; ++r) {
            for (uint8_t c = 0; c < 10u; ++c) {
                M1_Ananda_Cell_Projection p;
                ASSERT_TRUE(m1_ananda_project_cell(
                    (Ananda_Matrix_Op)f, r, c, &a, &p));
                ASSERT_TRUE(p.decimal10_valid);
                ASSERT_EQ_INT(m1_ananda_get(f, r, c), p.decimal10_value);
            }
        }
    }

    /* Canonical DR12 is deliberately not DR(decimal10). */
    {
        M1_Ananda_Cell_Projection p = project(MATRIX_BIMBA, 3u, 4u);
        ASSERT_EQ_INT(12, p.raw12_value);
        ASSERT_EQ_INT(3, p.digit_root12_value);
        ASSERT_EQ_INT(2, p.decimal10_value);
        ASSERT_EQ_INT(2, m1_ananda_dr_get(0u, 3u, 4u));
    }

    {
        M1_Ananda_Cell_Projection p = project(MATRIX_BIMBA, 10u, 4u);
        ASSERT_TRUE(!p.decimal10_valid);
    }
}

static void test_quintessence_preserves_source_tuple(void) {
    M1_Ananda_Cell_Projection q = project(MATRIX_QUINTESSENCE, 7u, 5u);

    ASSERT_TRUE(!q.scalar_valid);
    ASSERT_EQ_INT(35, q.quintessence.bimba_raw);
    ASSERT_EQ_INT(36, q.quintessence.pratibimba_raw);
    ASSERT_EQ_INT(71, q.quintessence.sum_raw);
    ASSERT_EQ_INT(-1, q.quintessence.difference_a_raw);
    ASSERT_EQ_INT(1, q.quintessence.difference_b_raw);
    ASSERT_EQ_INT(8, q.quintessence.bimba_dr);
    ASSERT_EQ_INT(9, q.quintessence.pratibimba_dr);
    ASSERT_EQ_INT(8, q.quintessence.sum_dr);
    ASSERT_EQ_INT(9, q.quintessence.difference_a_dr);
    ASSERT_EQ_INT(1, q.quintessence.difference_b_dr);
    ASSERT_TRUE(q.quintessence.decimal10_valid);
    ASSERT_EQ_INT(5, q.quintessence.bimba_decimal10);
    ASSERT_EQ_INT(6, q.quintessence.pratibimba_decimal10);
    ASSERT_EQ_INT(1, q.quintessence.sum_decimal10);
}

static void test_oscillatory_address_is_carried_not_inferred(void) {
    M1_Ananda_Cell_Projection p = project(MATRIX_SUM, 2u, 11u);
    ASSERT_EQ_INT(7, p.oscillatory.tick12);
    ASSERT_EQ_INT(4, p.oscillatory.position6);
    ASSERT_EQ_INT(1, p.oscillatory.conjugate_position6);
    ASSERT_EQ_INT(M1_ANANDA_PRIME_PHASE, p.oscillatory.phase);
    ASSERT_EQ_INT(SPANDA_FLOWERING, p.oscillatory.spanda_stage);
}

static void test_invalid_addresses_rejected(void) {
    M1_Ananda_Cell_Projection p;
    M1_Ananda_Oscillatory_Address a = address_fixture();

    ASSERT_TRUE(!m1_ananda_project_cell(MATRIX_BIMBA, 12u, 0u, &a, &p));
    a.tick12 = 12u;
    ASSERT_TRUE(!m1_ananda_project_cell(MATRIX_BIMBA, 0u, 0u, &a, &p));
}

int main(void) {
    printf("=== M1 Ananda typed projection / Wayfinder W1 ===\n");
    RUN_TEST(test_true_digit_root);
    RUN_TEST(test_dr12_luts_match_canonical_formula);
    RUN_TEST(test_raw12_affine_families_exhaustive);
    RUN_TEST(test_source_spots_expose_36_64_72);
    RUN_TEST(test_source_rows_10_11_are_full_raw12_not_shadow_rows);
    RUN_TEST(test_decimal10_is_explicit_legacy_aperture);
    RUN_TEST(test_quintessence_preserves_source_tuple);
    RUN_TEST(test_oscillatory_address_is_carried_not_inferred);
    RUN_TEST(test_invalid_addresses_rejected);
    printf("\n%d passed, %d failed, %d total\n",
           suite_pass, suite_fail, suite_pass + suite_fail);
    return suite_fail ? 1 : 0;
}
