/**
 * test_all.c — Master test runner
 */

#include "test_framework.h"

/* Define the shared test counters */
int _tf_pass = 0;
int _tf_fail = 0;
int _tf_current_failed = 0;

/* Suite declarations */
extern void test_struct(void);
extern void test_tagged_ptr(void);
extern void test_archetypes(void);
extern void test_arena(void);
extern void test_engine(void);
extern void test_families(void);

int main(void) {
    printf("=== Epi-Logos C — Test Suite ===\n");

    test_struct();
    test_tagged_ptr();
    test_archetypes();
    test_arena();
    test_engine();
    test_families();

    TEST_SUMMARY();
    return TEST_EXIT_CODE();
}
