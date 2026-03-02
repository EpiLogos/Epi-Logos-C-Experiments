/**
 * test_engine.c — Engine tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "archetypes.h"
#include "engine.h"

void test_engine(void) {
    SUITE("Engine");

    TEST("engine_next_coordinate maps 0->1->2->3->4->5->0");
        ASSERT_PTR_EQ(engine_next_coordinate(0), &Archetype_1);
        ASSERT_PTR_EQ(engine_next_coordinate(1), &Archetype_2);
        ASSERT_PTR_EQ(engine_next_coordinate(2), &Archetype_3);
        ASSERT_PTR_EQ(engine_next_coordinate(3), &Archetype_4);
        ASSERT_PTR_EQ(engine_next_coordinate(4), &Archetype_5);
        ASSERT_PTR_EQ(engine_next_coordinate(5), &Archetype_0);
    TEST_END();

    TEST("engine_next_coordinate returns NULL for invalid position");
        ASSERT_NULL(engine_next_coordinate(6));
        ASSERT_NULL(engine_next_coordinate(255));
    TEST_END();

    TEST("torus_walk visits #0 through #5 in order");
        const Holographic_Coordinate* cur = &Archetype_0;
        uint8_t expected[] = {0, 1, 2, 3, 4, 5};
        for (int i = 0; i < 6; i++) {
            ASSERT_EQ(cur->ql_position, expected[i]);
            cur = engine_next_coordinate(cur->ql_position);
        }
        /* After 6 steps, back to #0 */
        ASSERT_PTR_EQ(cur, &Archetype_0);
    TEST_END();

    TEST("torus_walk handles NULL start gracefully");
        engine_torus_walk(NULL, NULL, 6);
        /* Should not crash */
        ASSERT_TRUE(1);
    TEST_END();

    TEST("lemniscate_dive stops at depth 0");
        engine_lemniscate_dive(&Archetype_4, NULL, 0);
        /* Should not crash */
        ASSERT_TRUE(1);
    TEST_END();

    TEST("lemniscate_dive handles NULL cf gracefully");
        engine_lemniscate_dive(&Archetype_0, NULL, 3);
        /* #0 has NULL cf, should return immediately */
        ASSERT_TRUE(1);
    TEST_END();

    TEST("double_covering completes 12 steps (720 degrees)");
        Walk_Context wc = {0};
        engine_double_covering(&Archetype_0, &wc);
        ASSERT_EQ(wc.step_count, 12);
        ASSERT_EQ(wc.covering, 0);  /* Returns to normal */
    TEST_END();
}
