/**
 * test_arena.c — Arena allocator tests
 */

#include "test_framework.h"
#include "ontology.h"
#include "arena.h"

void test_arena(void) {
    SUITE("Arena Allocator");

    TEST("arena_init succeeds with valid capacity");
        Coordinate_Arena arena;
        int result = arena_init(&arena, 16);
        ASSERT_EQ(result, 0);
        ASSERT_NOT_NULL(arena.slots);
        ASSERT_EQ(arena.capacity, 16);
        ASSERT_EQ(arena.count, 0);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_init fails with NULL arena");
        int result = arena_init(NULL, 16);
        ASSERT_EQ(result, -1);
    TEST_END();

    TEST("arena_init fails with zero capacity");
        Coordinate_Arena arena;
        int result = arena_init(&arena, 0);
        ASSERT_EQ(result, -1);
    TEST_END();

    TEST("arena_alloc returns sequential slots");
        Coordinate_Arena arena;
        arena_init(&arena, 4);
        Holographic_Coordinate* s0 = arena_alloc(&arena);
        Holographic_Coordinate* s1 = arena_alloc(&arena);
        ASSERT_NOT_NULL(s0);
        ASSERT_NOT_NULL(s1);
        ASSERT_EQ(arena.count, 2);
        /* Slots should be exactly 128 bytes apart */
        ASSERT_EQ((uintptr_t)s1 - (uintptr_t)s0, 128);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_alloc returns 128-byte aligned pointers");
        Coordinate_Arena arena;
        arena_init(&arena, 4);
        Holographic_Coordinate* s0 = arena_alloc(&arena);
        ASSERT_EQ((uintptr_t)s0 % 128, 0);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_alloc returns NULL when full");
        Coordinate_Arena arena;
        arena_init(&arena, 2);
        arena_alloc(&arena);
        arena_alloc(&arena);
        Holographic_Coordinate* overflow = arena_alloc(&arena);
        ASSERT_NULL(overflow);
        arena_destroy(&arena);
    TEST_END();

    TEST("arena_reset zeros everything and resets count");
        Coordinate_Arena arena;
        arena_init(&arena, 4);
        Holographic_Coordinate* s = arena_alloc(&arena);
        s->ql_position = 42;
        arena_reset(&arena);
        ASSERT_EQ(arena.count, 0);
        /* Re-alloc same slot, should be zeroed */
        s = arena_alloc(&arena);
        ASSERT_EQ(s->ql_position, 0);
        arena_destroy(&arena);
    TEST_END();

    TEST("tensor_arena_init and alloc");
        Tensor_Arena ta;
        int result = tensor_arena_init(&ta, 256);
        ASSERT_EQ(result, 0);
        float* v = tensor_arena_alloc(&ta, 64);
        ASSERT_NOT_NULL(v);
        ASSERT_EQ(ta.offset, 64);
        float* v2 = tensor_arena_alloc(&ta, 192);
        ASSERT_NOT_NULL(v2);
        ASSERT_EQ(ta.offset, 256);
        /* Should be full now */
        float* overflow = tensor_arena_alloc(&ta, 1);
        ASSERT_NULL(overflow);
        tensor_arena_destroy(&ta);
    TEST_END();
}
