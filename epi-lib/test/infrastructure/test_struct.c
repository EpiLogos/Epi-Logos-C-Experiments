/**
 * test_struct.c — Verify struct layout invariants
 */

#include "test_framework.h"
#include "ontology.h"
#include <stddef.h>

void test_struct(void) {
    SUITE("Struct Layout");

    TEST("sizeof Holographic_Coordinate is 128 bytes");
        ASSERT_EQ(sizeof(Holographic_Coordinate), 128);
    TEST_END();

    TEST("ql_position is at offset 0");
        ASSERT_EQ(offsetof(Holographic_Coordinate, ql_position), 0);
    TEST_END();

    TEST("family is at offset 1");
        ASSERT_EQ(offsetof(Holographic_Coordinate, family), 1);
    TEST_END();

    TEST("inversion_state is at offset 2");
        ASSERT_EQ(offsetof(Holographic_Coordinate, inversion_state), 2);
    TEST_END();

    TEST("weave_state is at offset 4");
        ASSERT_EQ(offsetof(Holographic_Coordinate, weave_state), 4);
    TEST_END();

    TEST("semantic_embedding is at offset 8");
        ASSERT_EQ(offsetof(Holographic_Coordinate, semantic_embedding), 8);
    TEST_END();

    TEST("first base pointer (p) is at offset 16");
        ASSERT_EQ(offsetof(Holographic_Coordinate, p), 16);
    TEST_END();

    TEST("last reflective pointer (cs) is at offset 104");
        ASSERT_EQ(offsetof(Holographic_Coordinate, cs), 104);
    TEST_END();

    TEST("invoke_process is at offset 112");
        ASSERT_EQ(offsetof(Holographic_Coordinate, invoke_process), 112);
    TEST_END();

    TEST("payload is at offset 120");
        ASSERT_EQ(offsetof(Holographic_Coordinate, payload), 120);
    TEST_END();

    TEST("payload union is 8 bytes");
        ASSERT_EQ(sizeof(((Holographic_Coordinate*)0)->payload), 8);
    TEST_END();

    TEST("Coordinate_Family enum values");
        ASSERT_EQ(FAMILY_NONE, 0);
        ASSERT_EQ(FAMILY_P, 1);
        ASSERT_EQ(FAMILY_S, 2);
        ASSERT_EQ(FAMILY_T, 3);
        ASSERT_EQ(FAMILY_M, 4);
        ASSERT_EQ(FAMILY_L, 5);
        ASSERT_EQ(FAMILY_C, 6);
    TEST_END();

    SUITE("Weave-State Semantics");

    TEST("IS_IDENTIFICATION_EDGE recognises the four edges");
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(0.0f));
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(0.5f));
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(5.0f));
        ASSERT_TRUE(IS_IDENTIFICATION_EDGE(5.5f));
    TEST_END();

    TEST("IS_IDENTIFICATION_EDGE rejects non-edges");
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(1.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(2.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(3.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(4.0f));
        ASSERT_FALSE(IS_IDENTIFICATION_EDGE(3.2f));
    TEST_END();

    TEST("HAS_NESTING_ACCESS: #4 always has nesting");
        Holographic_Coordinate c4 = { .ql_position = 4, .weave_state = 4.0f };
        ASSERT_TRUE(HAS_NESTING_ACCESS(&c4));
    TEST_END();

    TEST("HAS_NESTING_ACCESS: identification edges have nesting");
        Holographic_Coordinate w05 = { .ql_position = 0, .weave_state = 0.5f };
        Holographic_Coordinate w50 = { .ql_position = 5, .weave_state = 5.0f };
        Holographic_Coordinate w55 = { .ql_position = 5, .weave_state = 5.5f };
        ASSERT_TRUE(HAS_NESTING_ACCESS(&w05));
        ASSERT_TRUE(HAS_NESTING_ACCESS(&w50));
        ASSERT_TRUE(HAS_NESTING_ACCESS(&w55));
    TEST_END();

    TEST("HAS_NESTING_ACCESS: non-#4 non-edge positions branch only");
        Holographic_Coordinate c0 = { .ql_position = 0, .weave_state = 0.0f };
        Holographic_Coordinate c1 = { .ql_position = 1, .weave_state = 1.0f };
        Holographic_Coordinate c2 = { .ql_position = 2, .weave_state = 2.0f };
        Holographic_Coordinate c3 = { .ql_position = 3, .weave_state = 3.0f };
        Holographic_Coordinate c5 = { .ql_position = 5, .weave_state = 5.0f };
        /* Note: #0 at weave 0.0 IS an identification edge */
        ASSERT_TRUE(HAS_NESTING_ACCESS(&c0));
        ASSERT_FALSE(HAS_NESTING_ACCESS(&c1));
        ASSERT_FALSE(HAS_NESTING_ACCESS(&c2));
        ASSERT_FALSE(HAS_NESTING_ACCESS(&c3));
        /* #5 at weave 5.0 IS an identification edge */
        ASSERT_TRUE(HAS_NESTING_ACCESS(&c5));
    TEST_END();

    TEST("WEAVE_PARENT extracts integer part");
        ASSERT_EQ(WEAVE_PARENT(3.2f), 3);
        ASSERT_EQ(WEAVE_PARENT(4.6f), 4);
        ASSERT_EQ(WEAVE_PARENT(0.0f), 0);
        ASSERT_EQ(WEAVE_PARENT(5.5f), 5);
    TEST_END();

    TEST("WEAVE_CHILD extracts decimal part");
        ASSERT_EQ(WEAVE_CHILD(3.2f), 2);
        ASSERT_EQ(WEAVE_CHILD(4.6f), 6);
        ASSERT_EQ(WEAVE_CHILD(0.5f), 5);
        ASSERT_EQ(WEAVE_CHILD(5.0f), 0);
    TEST_END();
}
