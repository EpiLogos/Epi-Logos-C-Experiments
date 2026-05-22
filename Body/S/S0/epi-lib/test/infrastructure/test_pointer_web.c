/**
 * test_pointer_web.c -- Real C contract tests for the harmonic pointer web.
 */

#include "pointer_web.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>

static int tests_run = 0;
static int tests_passed = 0;

#define RUN_TEST(name) \
    do { \
        tests_run++; \
        printf("  [%d] %s... ", tests_run, #name); \
        name(); \
        tests_passed++; \
        printf("OK\n"); \
    } while (0)

static void setup_arena(Coordinate_Arena* arena, Holographic_Coordinate* mirrors[6]) {
    const Holographic_Coordinate* raw[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };

    assert(arena_init(arena, 64u) == 0);
    for (uint8_t i = 0u; i < 6u; i++) {
        mirrors[i] = arena_alloc(arena);
        assert(mirrors[i] != NULL);
        mirrors[i]->ql_position = raw[i]->ql_position;
        mirrors[i]->family = FAMILY_NONE;
        mirrors[i]->inversion_state = 0;
        mirrors[i]->flags = 0;
        mirrors[i]->weave_state = raw[i]->weave_state;
        mirrors[i]->invoke_process = raw[i]->invoke_process;
    }
    assert(families_init(arena, mirrors) == 0);
    assert(families_crosslink(arena) == 0);
    assert(families_wire_reflective(arena) == 0);
}

static Holographic_Coordinate* family_coord(Coordinate_Arena* arena, Coordinate_Family family, uint8_t pos) {
    assert(family <= FAMILY_M);
    assert(pos < 6u);
    return &arena->slots[6u + ((uint32_t)family * 6u) + pos];
}

static void test_keeps_hot_coordinate_128_bytes(void) {
    assert(sizeof(Holographic_Coordinate) == 128u);
}

static void test_bedrock_web_exposes_hash_and_six_raw_psychoids(void) {
    HC_BedrockWeb7 web;
    assert(hc_bedrock_web7_fill(&web) == 0);

    assert(web.hash.target == &Psychoid_Hash);
    assert(web.hash.bedrock_role == HC_BEDROCK_HASH_OPERATOR);
    assert(web.hash.relation_role == HC_REL_INVERSION_SPANDA);
    assert(web.hash.ql_position == 0xFFu);

    const Holographic_Coordinate* expected[6] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };
    for (uint8_t q = 0u; q < 6u; q++) {
        assert(web.psychoid[q].target == expected[q]);
        assert(web.psychoid[q].bedrock_role == HC_BEDROCK_PSYCHOID_NUMBER);
        assert(web.psychoid[q].ql_position == q);
        assert(web.psychoid[q].pitch_class == hc_bimba_pitch_class(q));
        assert(web.psychoid[q].relation_role == HC_REL_POSITION_IDENTITY);
    }
}

static void test_bedrock_web_declares_kernel_successor_and_inversion_law(void) {
    HC_BedrockWeb7 web;
    assert(hc_bedrock_web7_fill(&web) == 0);

    for (uint8_t q = 0u; q < 5u; q++) {
        assert(web.successor[q].target == web.psychoid[q + 1u].target);
        assert(web.successor[q].relation_role == HC_REL_EPOGDOON_TICK);
        assert(web.successor[q].interval_role == HC_INTERVAL_WHOLE_TONE);
        assert(web.successor[q].ratio_role == HC_RATIO_EPOGDOON);
    }

    assert(web.successor[5].target == &Psychoid_0);
    assert(web.successor[5].relation_role == HC_REL_MOBIUS_RETURN);
    assert(web.successor[5].interval_role == HC_INTERVAL_OCTAVE);
    assert(web.successor[5].ratio_role == HC_RATIO_OCTAVE);

    for (uint8_t q = 0u; q < 6u; q++) {
        assert(web.inversion[q].target == web.psychoid[q].target);
        assert(web.inversion[q].bedrock_role == HC_BEDROCK_INVERTED_PSYCHOID);
        assert(web.inversion[q].relation_role == HC_REL_INVERSION_SPANDA);
        assert(web.inversion[q].interval_role == HC_INTERVAL_SEMITONE);
        assert(web.inversion[q].pitch_class == hc_pratibimba_pitch_class(q));
    }
}

static void test_family_ring_is_six_plus_six_prime(void) {
    Coordinate_Arena arena;
    Holographic_Coordinate* mirrors[6];
    setup_arena(&arena, mirrors);

    Holographic_Coordinate* source = family_coord(&arena, FAMILY_M, 2u);
    HC_PointerWeb36 web;
    assert(hc_pointer_web36_fill(&arena, source, &web) == 0);

    for (uint8_t i = 0u; i < 6u; i++) {
        assert(web.family[i].ring == HC_POINTER_RING_FAMILY);
        assert(web.family[i].helix == HC_HELIX_BIMBA);
        assert(web.family[i].ql_position == 2u);
        assert(web.family[i].relation_role == HC_REL_FAMILY_LINK);
        assert(GET_PTR(web.family[i].target)->family == i);
        assert(GET_PTR(web.family[i].target)->ql_position == 2u);

        uint8_t prime_index = (uint8_t)(i + 6u);
        assert(web.family[prime_index].ring == HC_POINTER_RING_FAMILY);
        assert(web.family[prime_index].helix == HC_HELIX_PRATIBIMBA);
        assert(web.family[prime_index].relation_role == HC_REL_INVERSION_SPANDA);
        assert(web.family[prime_index].interval_role == HC_INTERVAL_SEMITONE);
        assert(IS_INVERTED(web.family[prime_index].target));
        assert(GET_PTR(web.family[prime_index].target)->family == i);
        assert(GET_PTR(web.family[prime_index].target)->ql_position == 2u);
    }

    arena_destroy(&arena);
}

static void test_position_ring_separates_inversion_mirror_tick_and_return(void) {
    Coordinate_Arena arena;
    Holographic_Coordinate* mirrors[6];
    setup_arena(&arena, mirrors);

    HC_PointerWeb36 web;

    assert(hc_pointer_web36_fill(&arena, family_coord(&arena, FAMILY_M, 2u), &web) == 0);
    assert(web.position[2].relation_role == HC_REL_POSITION_IDENTITY);
    assert(web.position[2].pitch_class == 4u);
    assert(GET_PTR(web.position[2].target) == family_coord(&arena, FAMILY_M, 2u));

    assert(web.position[8].relation_role == HC_REL_INVERSION_SPANDA);
    assert(web.position[8].interval_role == HC_INTERVAL_SEMITONE);
    assert(web.position[8].pitch_class == 5u);
    assert(IS_INVERTED(web.position[8].target));
    assert(GET_PTR(web.position[8].target) == family_coord(&arena, FAMILY_M, 2u));

    assert(web.position[3].relation_role == HC_REL_MIRROR_XY5);
    assert(web.position[3].interval_role == HC_INTERVAL_WHOLE_TONE);
    assert(web.position[3].ratio_role == HC_RATIO_EPOGDOON);

    assert(hc_pointer_web36_fill(&arena, family_coord(&arena, FAMILY_M, 0u), &web) == 0);
    assert(web.position[1].relation_role == HC_REL_EPOGDOON_TICK);
    assert(web.position[1].interval_role == HC_INTERVAL_WHOLE_TONE);
    assert(web.position[5].relation_role == HC_REL_MIRROR_XY5);
    assert(web.position[5].interval_role == HC_INTERVAL_TOTALITY_16_9);
    assert(web.position[5].ratio_role == HC_RATIO_TOTALITY);

    assert(hc_pointer_web36_fill(&arena, family_coord(&arena, FAMILY_M, 1u), &web) == 0);
    assert(web.position[4].relation_role == HC_REL_MIRROR_XY5);
    assert(web.position[4].interval_role == HC_INTERVAL_TRITONE);

    assert(hc_pointer_web36_fill(&arena, family_coord(&arena, FAMILY_M, 5u), &web) == 0);
    assert(web.position[6].relation_role == HC_REL_MOBIUS_RETURN);
    assert(web.position[6].interval_role == HC_INTERVAL_OCTAVE);
    assert(IS_INVERTED(web.position[6].target));
    assert(GET_PTR(web.position[6].target) == family_coord(&arena, FAMILY_M, 0u));

    arena_destroy(&arena);
}

static void test_lens_ring_exposes_full_twelve_lens_anchors(void) {
    Coordinate_Arena arena;
    Holographic_Coordinate* mirrors[6];
    setup_arena(&arena, mirrors);

    Holographic_Coordinate* source = family_coord(&arena, FAMILY_P, 3u);
    HC_PointerWeb36 web;
    assert(hc_pointer_web36_fill(&arena, source, &web) == 0);

    const uint8_t expected_pc[12] = {0u, 2u, 4u, 6u, 8u, 10u, 1u, 3u, 5u, 7u, 9u, 11u};
    for (uint8_t i = 0u; i < 6u; i++) {
        assert(web.lens[i].ring == HC_POINTER_RING_LENS);
        assert(web.lens[i].helix == HC_HELIX_BIMBA);
        assert(web.lens[i].relation_role == HC_REL_LENS_ANCHOR);
        assert(web.lens[i].pitch_class == expected_pc[i]);
        assert(GET_PTR(web.lens[i].target) == family_coord(&arena, FAMILY_L, i));

        uint8_t prime_index = (uint8_t)(i + 6u);
        assert(web.lens[prime_index].ring == HC_POINTER_RING_LENS);
        assert(web.lens[prime_index].helix == HC_HELIX_PRATIBIMBA);
        assert(web.lens[prime_index].relation_role == HC_REL_INVERSION_SPANDA);
        assert(web.lens[prime_index].pitch_class == expected_pc[prime_index]);
        assert(IS_INVERTED(web.lens[prime_index].target));
        assert(GET_PTR(web.lens[prime_index].target) == family_coord(&arena, FAMILY_L, i));
    }

    arena_destroy(&arena);
}

static void test_context_frame_overlay_is_sevenfold_and_diatonic(void) {
    HC_ContextFrameWeb7 web;
    assert(hc_context_frame_web7_fill(&web) == 0);

    assert(web.frame[0].target == cf_get(CF_VOID));
    assert(strcmp(web.frame[0].notation, "(00/00)") == 0);
    assert(web.frame[0].diatonic_degree == 1u);
    assert(web.frame[0].ql_position == 0u);
    assert(web.frame[0].helix == HC_HELIX_BIMBA);
    assert(web.frame[0].pitch_class == 0u);

    assert(web.frame[4].target == cf_get(CF_FRACTAL));
    assert(strcmp(web.frame[4].notation, "(4.0/1-4.4/5)") == 0);
    assert(web.frame[4].diatonic_degree == 5u);
    assert(web.frame[4].ql_position == 3u);
    assert(web.frame[4].helix == HC_HELIX_PRATIBIMBA);
    assert(web.frame[4].pitch_class == 7u);

    assert(web.frame[6].target == cf_get(CF_MOBIUS));
    assert(web.frame[6].diatonic_degree == 7u);
    assert(web.frame[6].ql_position == 5u);
    assert(web.frame[6].helix == HC_HELIX_PRATIBIMBA);
    assert(web.frame[6].pitch_class == 11u);
}

static void test_harmonic_helpers_match_ql_math(void) {
    assert(hc_bimba_pitch_class(0u) == 0u);
    assert(hc_bimba_pitch_class(5u) == 10u);
    assert(hc_pratibimba_pitch_class(0u) == 1u);
    assert(hc_pratibimba_pitch_class(5u) == 11u);
    assert(hc_mirror_position(0u) == 5u);
    assert(hc_mirror_position(2u) == 3u);
    assert(hc_mirror_interval_role(2u) == HC_INTERVAL_WHOLE_TONE);
    assert(hc_mirror_interval_role(1u) == HC_INTERVAL_TRITONE);
    assert(hc_mirror_interval_role(0u) == HC_INTERVAL_TOTALITY_16_9);
    assert(hc_lens_bimba_pitch_class(6u, 3u) == 0u);
    assert(hc_lens_pratibimba_pitch_class(6u, 3u) == 1u);
}

int main(void) {
    printf("=== Harmonic Pointer Web36 Tests ===\n");

    RUN_TEST(test_keeps_hot_coordinate_128_bytes);
    RUN_TEST(test_bedrock_web_exposes_hash_and_six_raw_psychoids);
    RUN_TEST(test_bedrock_web_declares_kernel_successor_and_inversion_law);
    RUN_TEST(test_family_ring_is_six_plus_six_prime);
    RUN_TEST(test_position_ring_separates_inversion_mirror_tick_and_return);
    RUN_TEST(test_lens_ring_exposes_full_twelve_lens_anchors);
    RUN_TEST(test_context_frame_overlay_is_sevenfold_and_diatonic);
    RUN_TEST(test_harmonic_helpers_match_ql_math);

    printf("\n=== Harmonic Pointer Web36: %d/%d passed ===\n", tests_passed, tests_run);
    return (tests_passed == tests_run) ? 0 : 1;
}
