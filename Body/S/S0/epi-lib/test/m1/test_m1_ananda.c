/*
 * test_m1_ananda.c — Verify Ananda #1-2 matrix computational properties
 * Dataset source: #1-2-{0..5} (paramasiva-deep)
 *
 * Standalone binary: defines its own main() and test macros.
 */
#include "../../include/m1.h"
#include <stdio.h>
#include <stdint.h>

/* ------------------------------------------------------------------ *
 * Minimal test harness — standalone (no test_framework.h dependency)
 * ------------------------------------------------------------------ */
static int _suite_pass = 0;
static int _suite_fail = 0;
static int _test_failed = 0;
static const char* _test_name = "";

#define TEST_SUITE_BEGIN(name) \
    do { printf("=== %s ===\n", (name)); } while (0)

#define TEST_SUITE_END() \
    do { \
        printf("\n%d passed, %d failed, %d total\n", \
               _suite_pass, _suite_fail, _suite_pass + _suite_fail); \
    } while (0)

#define RUN_TEST(fn) \
    do { \
        _test_failed = 0; \
        _test_name = #fn; \
        fn(); \
        if (_test_failed) { \
            printf("  FAIL: %s\n", _test_name); \
            _suite_fail++; \
        } else { \
            printf("  pass: %s\n", _test_name); \
            _suite_pass++; \
        } \
    } while (0)

#define TEST_ASSERT_EQUAL_UINT8(expected, actual) \
    do { \
        uint8_t _e = (uint8_t)(expected); \
        uint8_t _a = (uint8_t)(actual); \
        if (_e != _a) { \
            printf("    FAIL at %s:%d — expected %u got %u\n", \
                   __FILE__, __LINE__, (unsigned)_e, (unsigned)_a); \
            _test_failed = 1; \
        } \
    } while (0)

#define TEST_ASSERT_EQUAL_INT(expected, actual) \
    do { \
        int _e = (int)(expected); \
        int _a = (int)(actual); \
        if (_e != _a) { \
            printf("    FAIL at %s:%d — expected %d got %d\n", \
                   __FILE__, __LINE__, _e, _a); \
            _test_failed = 1; \
        } \
    } while (0)

/* ------------------------------------------------------------------ *
 * Tests — canonical 12×12 Vortex Modulae, dual-faced (raw + DR mirror)
 * CSV: "(0_1) Vortex Modulae - (0_1) x 12Fold ..." — raw block
 * ("No digi-rooting") + digi-root mirror block ("Digi-rooting").
 * ------------------------------------------------------------------ */

/* Digital root as the CSV's mirror block applies it: DR(0)=0,
 * DR(n) = 1 + (n-1) % 9 for n > 0 (e.g. 1X+0 mirror: ...,9,1,2). */
static uint8_t digital_root(uint16_t n) {
    if (n == 0) return 0;
    return (uint8_t)(1u + (n - 1u) % 9u);
}

static void test_raw_face_matches_csv_closed_form_all_144_cells(void) {
    /* rX+b raw value at position c is r*c + b — un-modded, full 12×12 */
    for (int r = 0; r < 12; r++) {
        for (int c = 0; c < 12; c++) {
            uint16_t rc = (uint16_t)(r * c);
            TEST_ASSERT_EQUAL_UINT8(rc, m1_ananda_get(0, (uint8_t)r, (uint8_t)c));
            TEST_ASSERT_EQUAL_UINT8(rc + 1, m1_ananda_get(1, (uint8_t)r, (uint8_t)c));
            TEST_ASSERT_EQUAL_UINT8(2 * rc + 1, m1_ananda_get(2, (uint8_t)r, (uint8_t)c));
            TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_get(4, (uint8_t)r, (uint8_t)c));
        }
    }
    /* No mod-10 wrap: the retired core would have said 2 here */
    TEST_ASSERT_EQUAL_UINT8(12, m1_ananda_get(0, 3, 4));
    TEST_ASSERT_EQUAL_UINT8(13, m1_ananda_get(1, 3, 4));
    /* SU(2) shadow extension rows/cols 10-11 are real, raw */
    TEST_ASSERT_EQUAL_UINT8(121, m1_ananda_get(0, 11, 11));
    TEST_ASSERT_EQUAL_UINT8(122, m1_ananda_get(1, 11, 11));
    TEST_ASSERT_EQUAL_UINT8(243, m1_ananda_get(2, 11, 11));
}

static void test_ananda_axiom_raw_pratibimba_minus_bimba_is_exactly_one(void) {
    for (int i = 0; i < 12; i++) {
        for (int j = 0; j < 12; j++) {
            int m0 = (int)m1_ananda_get(0, (uint8_t)i, (uint8_t)j);
            int m1v = (int)m1_ananda_get(1, (uint8_t)i, (uint8_t)j);
            TEST_ASSERT_EQUAL_INT(1, m1v - m0);
        }
    }
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_verify_axiom());
}

static void test_dr_mirror_equals_digital_root_of_raw_all_144_cells(void) {
    /* The DR face (canonical nibble-packed .rodata matrices) must be the
     * digi-root mirror of the raw face, cell for cell, three stored families */
    for (int m = 0; m <= 2; m++) {
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++) {
                uint16_t rc = (uint16_t)(r * c);
                uint16_t raw = (m == 0) ? rc : (m == 1) ? (uint16_t)(rc + 1) : (uint16_t)(2 * rc + 1);
                TEST_ASSERT_EQUAL_UINT8(digital_root(raw),
                    m1_ananda_dr_get((uint8_t)m, (uint8_t)r, (uint8_t)c));
            }
        }
    }
}

static void test_dr_mirror_csv_spot_checks(void) {
    /* CSV digi-root block, 1X+0 row: 0,1,2,...,9 then 1,2 at cols 10,11 */
    TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(0, 9, 1));
    TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_dr_get(0, 1, 10));
    TEST_ASSERT_EQUAL_UINT8(2, m1_ananda_dr_get(0, 1, 11));
    /* CSV digi-root block, 3X+0 row: 0,3,6,9,3,6,9,... */
    TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(0, 3, 3));
    TEST_ASSERT_EQUAL_UINT8(3, m1_ananda_dr_get(0, 3, 4));
}

static void test_diff_families_dr_constants(void) {
    /* DiffA (rX+0)-(rX+1) = -1 constant: DR face 9 (FR 2.1.9); raw face
     * is signed, not representable in the uint8_t raw getter → 0 sentinel */
    for (int i = 0; i < 12; i++) {
        for (int j = 0; j < 12; j++) {
            TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(3, (uint8_t)i, (uint8_t)j));
            TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(3, (uint8_t)i, (uint8_t)j));
            TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_dr_get(4, (uint8_t)i, (uint8_t)j));
        }
    }
}

static void test_bounds_are_12x12(void) {
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(0, 12, 0));
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(0, 0, 12));
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_dr_get(0, 12, 0));
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(6, 0, 0));
}

int main(void) {
    TEST_SUITE_BEGIN("M1 Ananda #1-2 Matrices — 12x12 Vortex Modulae");
    RUN_TEST(test_raw_face_matches_csv_closed_form_all_144_cells);
    RUN_TEST(test_ananda_axiom_raw_pratibimba_minus_bimba_is_exactly_one);
    RUN_TEST(test_dr_mirror_equals_digital_root_of_raw_all_144_cells);
    RUN_TEST(test_dr_mirror_csv_spot_checks);
    RUN_TEST(test_diff_families_dr_constants);
    RUN_TEST(test_bounds_are_12x12);
    TEST_SUITE_END();
    return (_suite_fail > 0) ? 1 : 0;
}
