/**
 * test_families.c — Family instantiation tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "archetypes.h"
#include "arena.h"

void test_families(void) {
    SUITE("Families");

    TEST("families_init creates 36 coordinates");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        ASSERT_EQ(arena.count, 6);
        int result = families_init(&arena, mirrors);
        ASSERT_EQ(result, 0);
        ASSERT_EQ(arena.count, 42);
        arena_destroy(&arena);
    TEST_END();

    TEST("C-family coordinates have family=FAMILY_C");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        for (int i = 0; i < 6; i++) {
            Holographic_Coordinate* c_coord = &arena.slots[6 + 30 + i];
            ASSERT_EQ(c_coord->family, FAMILY_C);
            ASSERT_EQ(c_coord->ql_position, i);
        }
        arena_destroy(&arena);
    TEST_END();

    TEST("Family coordinates link back to mirrors via .c");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        Holographic_Coordinate* p0 = &arena.slots[6 + 0];
        ASSERT_PTR_EQ(GET_PTR(p0->c), mirrors[0]);
        Holographic_Coordinate* s3 = &arena.slots[6 + 6 + 3];
        ASSERT_PTR_EQ(GET_PTR(s3->c), mirrors[3]);
        arena_destroy(&arena);
    TEST_END();

    TEST("All family coordinates have non-NULL invoke_process");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        for (uint32_t i = 6; i < arena.count; i++) {
            ASSERT_NOT_NULL(arena.slots[i].invoke_process);
        }
        arena_destroy(&arena);
    TEST_END();

    TEST("Family weave_states encode pos.family");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        Holographic_Coordinate* c3 = &arena.slots[6 + 30 + 3];
        ASSERT_EQ(WEAVE_PARENT(c3->weave_state), 3);
        ASSERT_EQ(WEAVE_CHILD(c3->weave_state), 6);
        Holographic_Coordinate* p0_2 = &arena.slots[6 + 0];
        ASSERT_EQ(WEAVE_PARENT(p0_2->weave_state), 0);
        ASSERT_EQ(WEAVE_CHILD(p0_2->weave_state), 1);
        Holographic_Coordinate* s4 = &arena.slots[6 + 6 + 4];
        ASSERT_EQ(WEAVE_PARENT(s4->weave_state), 4);
        ASSERT_EQ(WEAVE_CHILD(s4->weave_state), 2);
        arena_destroy(&arena);
    TEST_END();

    TEST("families_init fails with NULL arena");
        Holographic_Coordinate* mirrors[6] = {0};
        int result = families_init(NULL, mirrors);
        ASSERT_EQ(result, -1);
    TEST_END();

    TEST("Cross-family linking: every coord sees all families");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
            mirrors[i]->weave_state = (float)i;
        }
        families_init(&arena, mirrors);
        families_crosslink(&arena);
        ASSERT_NOT_NULL(mirrors[0]->p);
        ASSERT_NOT_NULL(mirrors[0]->s);
        ASSERT_EQ(GET_PTR(mirrors[0]->p)->family, FAMILY_P);
        ASSERT_EQ(GET_PTR(mirrors[0]->s)->family, FAMILY_S);
        ASSERT_EQ(GET_PTR(mirrors[0]->p)->ql_position, 0);
        Holographic_Coordinate* p3 = &arena.slots[6 + 3];
        ASSERT_EQ(GET_PTR(p3->s)->family, FAMILY_S);
        ASSERT_EQ(GET_PTR(p3->s)->ql_position, 3);
        arena_destroy(&arena);
    TEST_END();

    TEST("Cross-link flags: #4 gets NESTING, #3 gets BRANCHING");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
            mirrors[i]->weave_state = (float)i;
        }
        families_init(&arena, mirrors);
        families_crosslink(&arena);
        ASSERT_TRUE(IS_NESTING(mirrors[4]->p));
        ASSERT_TRUE(IS_NESTING(mirrors[4]->s));
        ASSERT_FALSE(IS_BRANCHING(mirrors[4]->p));
        ASSERT_TRUE(IS_BRANCHING(mirrors[3]->p));
        ASSERT_TRUE(IS_BRANCHING(mirrors[3]->s));
        ASSERT_FALSE(IS_NESTING(mirrors[3]->p));
        ASSERT_EQ(GET_PTR(mirrors[4]->p)->ql_position, 4);
        ASSERT_EQ(GET_PTR(mirrors[3]->p)->ql_position, 3);
        arena_destroy(&arena);
    TEST_END();

    TEST("Reflective: #4 mirror cf self-references");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        families_wire_reflective(&arena);
        ASSERT_PTR_EQ(GET_PTR(mirrors[4]->cf), mirrors[4]);
        arena_destroy(&arena);
    TEST_END();

    TEST("Reflective: cs points to position-5 in same block");
        Coordinate_Arena arena;
        arena_init(&arena, 64);
        Holographic_Coordinate* mirrors[6];
        for (int i = 0; i < 6; i++) {
            mirrors[i] = arena_alloc(&arena);
            mirrors[i]->ql_position = (uint8_t)i;
            mirrors[i]->family = FAMILY_NONE;
        }
        families_init(&arena, mirrors);
        families_wire_reflective(&arena);
        ASSERT_PTR_EQ(GET_PTR(mirrors[0]->cs), mirrors[5]);
        Holographic_Coordinate* p0 = &arena.slots[6];
        Holographic_Coordinate* p5 = &arena.slots[11];
        ASSERT_PTR_EQ(GET_PTR(p0->cs), p5);
        arena_destroy(&arena);
    TEST_END();
}
