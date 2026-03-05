/**
 * test_framework.h — Minimal Test Macros
 *
 * Zero dependencies. Compiles with clang.
 * Prints pass/fail per test, summary at end.
 */

#ifndef TEST_FRAMEWORK_H
#define TEST_FRAMEWORK_H

#include <stdio.h>
#include <string.h>

/* Global counters — defined in test_all.c, shared across all test TUs */
extern int _tf_pass;
extern int _tf_fail;
extern int _tf_current_failed;

/* Begin a test */
#define TEST(name) \
    do { \
        _tf_current_failed = 0; \
        const char* _tf_name = (name);

/* End a test */
#define TEST_END() \
        if (_tf_current_failed) { \
            _tf_fail++; \
            printf("  FAIL: %s\n", _tf_name); \
        } else { \
            _tf_pass++; \
            printf("  pass: %s\n", _tf_name); \
        } \
    } while (0)

/* Assertions */
#define ASSERT_TRUE(expr) \
    do { \
        if (!(expr)) { \
            printf("    ASSERTION FAILED: %s\n", #expr); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_FALSE(expr) ASSERT_TRUE(!(expr))

#define ASSERT_EQ(a, b) \
    do { \
        if ((a) != (b)) { \
            printf("    ASSERTION FAILED: %s == %s\n", #a, #b); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_NEQ(a, b) \
    do { \
        if ((a) == (b)) { \
            printf("    ASSERTION FAILED: %s != %s\n", #a, #b); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_PTR_EQ(a, b) \
    do { \
        if ((const void*)(a) != (const void*)(b)) { \
            printf("    ASSERTION FAILED: %s == %s\n", #a, #b); \
            printf("      got %p vs %p\n", (const void*)(a), (const void*)(b)); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_NULL(ptr) \
    do { \
        if ((ptr) != NULL) { \
            printf("    ASSERTION FAILED: %s is NULL\n", #ptr); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_NOT_NULL(ptr) \
    do { \
        if ((ptr) == NULL) { \
            printf("    ASSERTION FAILED: %s is not NULL\n", #ptr); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

#define ASSERT_FLOAT_EQ(a, b) \
    do { \
        float _diff = (a) - (b); \
        if (_diff < -0.001f || _diff > 0.001f) { \
            printf("    ASSERTION FAILED: %s == %s\n", #a, #b); \
            printf("      got %f vs %f\n", (double)(a), (double)(b)); \
            printf("      at %s:%d\n", __FILE__, __LINE__); \
            _tf_current_failed = 1; \
        } \
    } while (0)

/* Suite management */
#define SUITE(name) \
    printf("\n[suite] %s\n", (name))

/* Print summary — call at the end of main() */
#define TEST_SUMMARY() \
    do { \
        printf("\n========================================\n"); \
        printf("Tests: %d passed, %d failed, %d total\n", \
               _tf_pass, _tf_fail, _tf_pass + _tf_fail); \
        printf("========================================\n"); \
    } while (0)

/* Return code for main */
#define TEST_EXIT_CODE() (_tf_fail > 0 ? 1 : 0)

#endif /* TEST_FRAMEWORK_H */
