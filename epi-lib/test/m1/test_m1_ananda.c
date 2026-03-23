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
 * Tests
 * ------------------------------------------------------------------ */

static void test_ananda_axiom_pratibimba_minus_bimba_equals_one(void) {
    /* M1[i][j] - M0[i][j] == 1 (mod 10) everywhere */
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            uint8_t m0 = m1_ananda_get(0, (uint8_t)i, (uint8_t)j);
            uint8_t m1v = m1_ananda_get(1, (uint8_t)i, (uint8_t)j);
            uint8_t diff = (uint8_t)((m1v - m0 + 10) % 10);
            TEST_ASSERT_EQUAL_UINT8(1, diff);
        }
    }
}

static void test_m3_is_constant_nine(void) {
    for (int i = 0; i < 10; i++)
        for (int j = 0; j < 10; j++)
            TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_get(3, (uint8_t)i, (uint8_t)j));
}

static void test_m4_is_constant_one(void) {
    for (int i = 0; i < 10; i++)
        for (int j = 0; j < 10; j++)
            TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_get(4, (uint8_t)i, (uint8_t)j));
}

static void test_m0_spot_check(void) {
    /* M0[3][4] = 3*4 % 10 = 2 */
    TEST_ASSERT_EQUAL_UINT8(2, m1_ananda_get(0, 3, 4));
}

static void test_m1_spot_check(void) {
    /* M1[3][4] = (3*4+1) % 10 = 3 */
    TEST_ASSERT_EQUAL_UINT8(3, m1_ananda_get(1, 3, 4));
}

static void test_dr_m0_row9_col1(void) {
    /* M0[9][1] = 9*1 %10 = 9; dr(9) = 9 */
    TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(0, 9, 1));
}

static void test_ananda_verify_axiom_function(void) {
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_verify_axiom());
}

int main(void) {
    TEST_SUITE_BEGIN("M1 Ananda #1-2 Matrices");
    RUN_TEST(test_ananda_axiom_pratibimba_minus_bimba_equals_one);
    RUN_TEST(test_m3_is_constant_nine);
    RUN_TEST(test_m4_is_constant_one);
    RUN_TEST(test_m0_spot_check);
    RUN_TEST(test_m1_spot_check);
    RUN_TEST(test_dr_m0_row9_col1);
    RUN_TEST(test_ananda_verify_axiom_function);
    TEST_SUITE_END();
    return (_suite_fail > 0) ? 1 : 0;
}
