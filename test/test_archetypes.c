/**
 * test_archetypes.c — .rodata archetype invariant tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "archetypes.h"

void test_archetypes(void) {
    SUITE("Archetypes (.rodata)");

    TEST("#0.c self-references (ground is ground)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_0.c), &Archetype_0);
    TEST_END();

    TEST("#5.c returns to #0 (Möbius)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_5.c), &Archetype_0);
    TEST_END();

    TEST("#4.cf self-references (Lemniscate)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_4.cf), &Archetype_4);
    TEST_END();

    TEST("All archetypes have family=FAMILY_NONE");
        ASSERT_EQ(Archetype_0.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_1.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_2.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_3.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_4.family, FAMILY_NONE);
        ASSERT_EQ(Archetype_5.family, FAMILY_NONE);
    TEST_END();

    TEST("Archetype ql_positions are 0-5");
        ASSERT_EQ(Archetype_0.ql_position, 0);
        ASSERT_EQ(Archetype_1.ql_position, 1);
        ASSERT_EQ(Archetype_2.ql_position, 2);
        ASSERT_EQ(Archetype_3.ql_position, 3);
        ASSERT_EQ(Archetype_4.ql_position, 4);
        ASSERT_EQ(Archetype_5.ql_position, 5);
    TEST_END();

    TEST("Archetype weave states are correct");
        ASSERT_FLOAT_EQ(Archetype_0.weave_state, 0.0f);
        ASSERT_FLOAT_EQ(Archetype_1.weave_state, 1.0f);
        ASSERT_FLOAT_EQ(Archetype_2.weave_state, 2.0f);
        ASSERT_FLOAT_EQ(Archetype_3.weave_state, 3.0f);
        ASSERT_FLOAT_EQ(Archetype_4.weave_state, 4.0f);
        ASSERT_FLOAT_EQ(Archetype_5.weave_state, 5.0f);
    TEST_END();

    TEST("All archetypes have inversion_state=0");
        ASSERT_EQ(Archetype_0.inversion_state, 0);
        ASSERT_EQ(Archetype_1.inversion_state, 0);
        ASSERT_EQ(Archetype_2.inversion_state, 0);
        ASSERT_EQ(Archetype_3.inversion_state, 0);
        ASSERT_EQ(Archetype_4.inversion_state, 0);
        ASSERT_EQ(Archetype_5.inversion_state, 0);
    TEST_END();

    TEST("All archetypes have non-NULL invoke_process");
        ASSERT_NOT_NULL(Archetype_0.invoke_process);
        ASSERT_NOT_NULL(Archetype_1.invoke_process);
        ASSERT_NOT_NULL(Archetype_2.invoke_process);
        ASSERT_NOT_NULL(Archetype_3.invoke_process);
        ASSERT_NOT_NULL(Archetype_4.invoke_process);
        ASSERT_NOT_NULL(Archetype_5.invoke_process);
    TEST_END();

    TEST("Weave states have inversion_state=1");
        ASSERT_EQ(Weave_0_5.inversion_state, 1);
        ASSERT_EQ(Weave_5_0.inversion_state, 1);
        ASSERT_EQ(Weave_5_5.inversion_state, 1);
    TEST_END();

    TEST("Weave states have NULL invoke_process");
        ASSERT_NULL(Weave_0_5.invoke_process);
        ASSERT_NULL(Weave_5_0.invoke_process);
        ASSERT_NULL(Weave_5_5.invoke_process);
    TEST_END();

    TEST("#3.cf points to #4 (Lemniscate entry)");
        ASSERT_PTR_EQ(GET_PTR(Archetype_3.cf), &Archetype_4);
    TEST_END();

    TEST("C-chain: #1.c->#0, #2.c->#1, #3.c->#2, #4.c->#3");
        ASSERT_PTR_EQ(GET_PTR(Archetype_1.c), &Archetype_0);
        ASSERT_PTR_EQ(GET_PTR(Archetype_2.c), &Archetype_1);
        ASSERT_PTR_EQ(GET_PTR(Archetype_3.c), &Archetype_2);
        ASSERT_PTR_EQ(GET_PTR(Archetype_4.c), &Archetype_3);
    TEST_END();

    TEST("Execute_Ground initializes Walk_Context");
        Walk_Context wc = {0};
        Execute_Ground((Holographic_Coordinate*)&Archetype_0, &wc);
        ASSERT_EQ(wc.current_position, 0);
        ASSERT_EQ(wc.step_count, 1);
    TEST_END();
}
