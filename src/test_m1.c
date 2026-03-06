/**
 * test_m1.c — Pillar II M1 verification tests
 * Tests: matrix spot-checks, ring checks, static_asserts, API lifecycle.
 */

#include "m1.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

static int passed = 0, failed = 0;

#define EXPECT(cond, msg) \
    do { if (cond) { passed++; } \
         else { fprintf(stderr, "FAIL: %s\n", msg); failed++; } } while(0)

int main(void) {
    printf("=== test_m1: M1 Paramasiva Verification ===\n\n");

    /* --- ANANDA_BIMBA spot-checks --- */
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 0, 0) == 0u,  "BIMBA[0][0] == 0");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 1, 1) == 1u,  "BIMBA[1][1] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 1, 9) == 9u,  "BIMBA[1][9] == 9");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 8, 8) == 1u,  "BIMBA[8][8] == 1 (DR(64)=1)");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 9, 1) == 9u,  "BIMBA[9][1] == 9");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 3, 3) == 9u,  "BIMBA[3][3] == 9 (DR(9)=9)");
    EXPECT(get_ananda_harmonic(&ANANDA_BIMBA, 7, 7) == 4u,  "BIMBA[7][7] == 4 (DR(49)=4)");

    /* --- ANANDA_PRATIBIMBA spot-checks --- */
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 0, 0) == 1u, "PRAT[0][0] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 1, 2) == 3u, "PRAT[1][2] == 3");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 3, 3) == 1u, "PRAT[3][3] == 1 (DR(10)=1)");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 9, 5) == 1u, "PRAT[9][5] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_PRATIBIMBA, 8, 1) == 9u, "PRAT[8][1] == 9");

    /* --- ANANDA_SUM spot-checks --- */
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 0, 0) == 1u,  "SUM[0][0] == 1");
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 1, 2) == 5u,  "SUM[1][2] == 5 (BIMBA=2+PRAT=3)");
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 3, 1) == 7u,  "SUM[3][1] == 7 (BIMBA=3+PRAT=4)");
    EXPECT(get_ananda_harmonic(&ANANDA_SUM, 9, 9) == 1u,  "SUM[9][9] == 1");

    /* --- SUM coherence: SUM[r][c] == DR(BIMBA[r][c] + PRAT[r][c]) --- */
    for (int r = 0; r < 10; r++) {
        for (int c = 0; c < 10; c++) {
            uint8_t b = get_ananda_harmonic(&ANANDA_BIMBA, (uint8_t)r, (uint8_t)c);
            uint8_t p = get_ananda_harmonic(&ANANDA_PRATIBIMBA, (uint8_t)r, (uint8_t)c);
            uint8_t s = get_ananda_harmonic(&ANANDA_SUM, (uint8_t)r, (uint8_t)c);
            uint8_t expected = (uint8_t)((b + p) % 9u);
            if (expected == 0u && (b + p) > 0) expected = 9u;
            if (b == 0 && p == 0) expected = 0u;
            if (s != expected) {
                fprintf(stderr, "FAIL: SUM[%d][%d]: got %u, expected %u (b=%u p=%u)\n",
                        r, c, s, expected, b, p);
                failed++;
            } else {
                passed++;
            }
        }
    }

    /* --- QUINTESSENCE consistency --- */
    EXPECT(get_quint_bimba(1, 1) == get_ananda_harmonic(&ANANDA_BIMBA, 1, 1),
           "QUINT.bimba[1][1] == BIMBA[1][1]");
    EXPECT(get_quint_sum(1, 2) == get_ananda_harmonic(&ANANDA_SUM, 1, 2),
           "QUINT.sum[1][2] == SUM[1][2]");
    EXPECT(get_quint_bimba(9, 1) == get_ananda_harmonic(&ANANDA_BIMBA, 9, 1),
           "QUINT.bimba[9][1] == BIMBA[9][1]");

    /* --- Constant matrix helpers --- */
    EXPECT(get_ananda_diff_a(0, 0) == 9u,  "DIFF_A constant == 9");
    EXPECT(get_ananda_diff_a(5, 7) == 9u,  "DIFF_A constant == 9 (any cell)");
    EXPECT(get_ananda_diff_b(0, 0) == 1u,  "DIFF_B constant == 1");

    /* --- DR rings --- */
    EXPECT(DR_RING_MAHAMAYA[0] == 1u, "Mahamaya[0] == 1");
    EXPECT(DR_RING_MAHAMAYA[1] == 2u, "Mahamaya[1] == 2");
    EXPECT(DR_RING_MAHAMAYA[3] == 8u, "Mahamaya[3] == 8");
    EXPECT(DR_RING_MAHAMAYA[4] == 7u, "Mahamaya[4] == 7");
    EXPECT(DR_RING_MAHAMAYA[5] == 5u, "Mahamaya[5] == 5");
    EXPECT(DR_RING_PARASHAKTI[0] == 3u, "Parashakti[0] == 3");
    EXPECT(DR_RING_PARASHAKTI[2] == 9u, "Parashakti[2] == 9");
    EXPECT(DR_RING_PARASHAKTI[3] == 3u, "Parashakti[3] == 3 (cycle repeats)");

    /* --- Ring arithmetic macros --- */
    EXPECT(RING_WRAP(12u) == 0u,        "RING_WRAP(12) == 0");
    EXPECT(RING_WRAP(7u)  == 7u,        "RING_WRAP(7)  == 7");
    EXPECT(IS_SHADOW_PHASE(6u)  == true,  "IS_SHADOW_PHASE(6)  == true");
    EXPECT(IS_SHADOW_PHASE(5u)  == false, "IS_SHADOW_PHASE(5)  == false");
    EXPECT(GET_BASE_QL_POS(7u)  == 1u,   "GET_BASE_QL_POS(7)  == 1");
    EXPECT(GET_BASE_QL_POS(11u) == 5u,   "GET_BASE_QL_POS(11) == 5");

    /* --- QL tick helpers --- */
    EXPECT(ql_get_stage(0u)  == 0u,  "ql_get_stage(0)  == 0");
    EXPECT(ql_get_stage(5u)  == 5u,  "ql_get_stage(5)  == 5");
    EXPECT(ql_get_stage(6u)  == 5u,  "ql_get_stage(6)  == 5 (descending)");
    EXPECT(ql_get_stage(11u) == 0u,  "ql_get_stage(11) == 0 (Mobius return)");
    EXPECT(ql_is_ascending(3u) == true,  "ql_is_ascending(3)  == true");
    EXPECT(ql_is_ascending(6u) == false, "ql_is_ascending(6)  == false");

    /* --- VALID_FOLDS --- */
    EXPECT(is_valid_fold(0u)  == true,  "is_valid_fold(0)  == true");
    EXPECT(is_valid_fold(24u) == true,  "is_valid_fold(24) == true");
    EXPECT(is_valid_fold(7u)  == false, "is_valid_fold(7)  == false");
    EXPECT(is_valid_fold(11u) == false, "is_valid_fold(11) == false");

    /* --- QL_FLOWERING ring integrity --- */
    for (int i = 0; i < 6; i++) {
        EXPECT(QL_FLOWERING[i].stage == (uint8_t)i,      "QL_FLOWERING stage index");
        EXPECT(QL_FLOWERING[i].next  == (uint8_t)((i+1)%6), "QL_FLOWERING next = (i+1)%6");
        EXPECT(QL_FLOWERING[i].inverse == (uint8_t)(5-i),   "QL_FLOWERING inverse = 5-i");
    }

    /* --- M1_M0_CROSSLINK --- */
    EXPECT(verify_m1_m0_crosslink(), "M1_M0_CROSSLINK all non-null");
    EXPECT(M1_M0_CROSSLINK[0]  == &Psychoid_0, "CROSSLINK[0]  == Psychoid_0");
    EXPECT(M1_M0_CROSSLINK[5]  == &Psychoid_5, "CROSSLINK[5]  == Psychoid_5");
    EXPECT(M1_M0_CROSSLINK[6]  == &Psychoid_5, "CROSSLINK[6]  == Psychoid_5 (shadow)");
    EXPECT(M1_M0_CROSSLINK[11] == &Psychoid_0, "CROSSLINK[11] == Psychoid_0 (Mobius)");

    /* --- m1_init / m1_verify lifecycle --- */
    Coordinate_Arena arena;
    arena_init(&arena, 16);
    Holographic_Coordinate* hc = arena_alloc(&arena);
    hc->ql_position = 1;

    M1_Root* m1 = m1_init(&arena, hc);
    EXPECT(m1 != NULL,                            "m1_init returns non-null");
    EXPECT(m1->hc == hc,                          "m1->hc linked to arena coord");
    EXPECT(m1->active_cf != NULL,                 "m1->active_cf set (CF_BINARY)");
    EXPECT(m1->spanda.stage == SPANDA_SEED,        "spanda.stage == SPANDA_SEED");
    EXPECT(m1->torus_pos == 0u,                   "torus_pos == 0");
    EXPECT(m1->ananda == &ANANDA_BIMBA,           "ananda defaults to ANANDA_BIMBA");
    EXPECT(m1_verify(),                           "m1_verify() passes");

    m1_teardown(m1);
    EXPECT(hc->payload.process_state == NULL, "HC_UNLINK on teardown");
    arena_destroy(&arena);

    /* --- Topological element count LUT --- */
    EXPECT(get_topological_element_count(0u) == 1u,  "TOPO_LUT[0] == 1");
    EXPECT(get_topological_element_count(5u) == 5u,  "TOPO_LUT[5] == 5");
    EXPECT(get_topological_element_count(6u) == 8u,  "TOPO_LUT[6] == 8");
    EXPECT(get_topological_element_count(12u) == 1u, "TOPO_LUT[12] wraps to 0 -> 1");

    printf("\n=== Results: %d passed, %d failed ===\n", passed, failed);
    return failed > 0 ? 1 : 0;
}
