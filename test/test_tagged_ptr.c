/**
 * test_tagged_ptr.c — Tagged pointer encode/decode round-trips
 */

#include "test_framework.h"
#include "ontology.h"

void test_tagged_ptr(void) {
    SUITE("Tagged Pointers");

    /* Use a stack-allocated coordinate as our test subject */
    Holographic_Coordinate dummy = { .ql_position = 42 };
    Holographic_Coordinate* raw = &dummy;

    TEST("GET_PTR strips all flags");
        Holographic_Coordinate* tagged = SET_INVERTED(SET_NESTING(SET_BRANCHING(SET_EXECUTING(raw))));
        ASSERT_PTR_EQ(GET_PTR(tagged), raw);
    TEST_END();

    TEST("SET_INVERTED / IS_INVERTED round-trip");
        Holographic_Coordinate* inv = SET_INVERTED(raw);
        ASSERT_TRUE(IS_INVERTED(inv));
        ASSERT_PTR_EQ(GET_PTR(inv), raw);
    TEST_END();

    TEST("SET_NESTING / IS_NESTING round-trip");
        Holographic_Coordinate* nested = SET_NESTING(raw);
        ASSERT_TRUE(IS_NESTING(nested));
        ASSERT_FALSE(IS_INVERTED(nested));
        ASSERT_PTR_EQ(GET_PTR(nested), raw);
    TEST_END();

    TEST("SET_BRANCHING / IS_BRANCHING round-trip");
        Holographic_Coordinate* branched = SET_BRANCHING(raw);
        ASSERT_TRUE(IS_BRANCHING(branched));
        ASSERT_FALSE(IS_NESTING(branched));
        ASSERT_PTR_EQ(GET_PTR(branched), raw);
    TEST_END();

    TEST("SET_EXECUTING / IS_EXECUTING round-trip");
        Holographic_Coordinate* exec = SET_EXECUTING(raw);
        ASSERT_TRUE(IS_EXECUTING(exec));
        ASSERT_FALSE(IS_BRANCHING(exec));
        ASSERT_PTR_EQ(GET_PTR(exec), raw);
    TEST_END();

    TEST("Multiple flags compose correctly");
        Holographic_Coordinate* multi = SET_INVERTED(SET_NESTING(raw));
        ASSERT_TRUE(IS_INVERTED(multi));
        ASSERT_TRUE(IS_NESTING(multi));
        ASSERT_FALSE(IS_BRANCHING(multi));
        ASSERT_FALSE(IS_EXECUTING(multi));
        ASSERT_PTR_EQ(GET_PTR(multi), raw);
    TEST_END();

    TEST("All four flags compose correctly");
        Holographic_Coordinate* all = SET_INVERTED(SET_NESTING(SET_BRANCHING(SET_EXECUTING(raw))));
        ASSERT_TRUE(IS_INVERTED(all));
        ASSERT_TRUE(IS_NESTING(all));
        ASSERT_TRUE(IS_BRANCHING(all));
        ASSERT_TRUE(IS_EXECUTING(all));
        ASSERT_PTR_EQ(GET_PTR(all), raw);
    TEST_END();

    TEST("CLEAR_FLAGS is alias for GET_PTR");
        Holographic_Coordinate* tagged2 = SET_INVERTED(SET_NESTING(raw));
        ASSERT_PTR_EQ(CLEAR_FLAGS(tagged2), GET_PTR(tagged2));
    TEST_END();

    TEST("TAG_FLAGS returns only flag bits");
        Holographic_Coordinate* inv_only = SET_INVERTED(raw);
        uintptr_t flags = TAG_FLAGS(inv_only);
        ASSERT_EQ(flags, FLAG_INVERTED);
    TEST_END();

    TEST("NULL pointer survives tagging");
        Holographic_Coordinate* null_tagged = SET_INVERTED(NULL);
        ASSERT_TRUE(IS_INVERTED(null_tagged));
        ASSERT_PTR_EQ(GET_PTR(null_tagged), NULL);
    TEST_END();

    TEST("TAG_RELATION applies NESTING for #4 source");
        Holographic_Coordinate source_4 = { .ql_position = 4, .weave_state = 4.0f };
        Holographic_Coordinate target = { .ql_position = 3 };
        Holographic_Coordinate* tagged3 = TAG_RELATION(&source_4, &target);
        ASSERT_TRUE(IS_NESTING(tagged3));
        ASSERT_FALSE(IS_BRANCHING(tagged3));
        ASSERT_PTR_EQ(GET_PTR(tagged3), &target);
    TEST_END();

    TEST("TAG_RELATION applies BRANCHING for non-#4 non-edge source");
        Holographic_Coordinate source_3 = { .ql_position = 3, .weave_state = 3.0f };
        Holographic_Coordinate target2 = { .ql_position = 2 };
        Holographic_Coordinate* tagged4 = TAG_RELATION(&source_3, &target2);
        ASSERT_TRUE(IS_BRANCHING(tagged4));
        ASSERT_FALSE(IS_NESTING(tagged4));
        ASSERT_PTR_EQ(GET_PTR(tagged4), &target2);
    TEST_END();

    TEST("TAG_RELATION applies NESTING for identification edge source");
        Holographic_Coordinate source_w = { .ql_position = 0, .weave_state = 0.5f };
        Holographic_Coordinate target3 = { .ql_position = 5 };
        Holographic_Coordinate* tagged5 = TAG_RELATION(&source_w, &target3);
        ASSERT_TRUE(IS_NESTING(tagged5));
        ASSERT_PTR_EQ(GET_PTR(tagged5), &target3);
    TEST_END();
}
