/* src/test_m0_rfactor.c — R-factor weave + CLI dispatch tests */
#include "m0.h"
#include "arena.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 R-Factor + CLI Tests ===\n");

    /* T1: R-factor weave dispatch doesn't crash for all 12 ticks */
    TEST(r_factor_weave_all_ticks) {
        for (uint8_t tick = 0; tick < 12; tick++) {
            Unified_Logos_State s = m0_compute_logos_state(tick);
            m0_execute_r_factor_weave(&s);  /* must not crash */
        }
    } PASS;

    /* T2: R1 ascending sweep — positions 0,1,2,3,4,5 across O#..Siva */
    TEST(r1_ascending_sweep) {
        assert(GET_R_POS(ROUTE_O_SHARP, 1) == 0);
        assert(GET_R_POS(ROUTE_X_SHARP, 1) == 1);
        assert(GET_R_POS(ROUTE_N_SHARP, 1) == 2);
        assert(GET_R_POS(ROUTE_M_SHARP, 1) == 3);
        assert(GET_R_POS(ROUTE_NARA, 1) == 4);
        assert(GET_R_POS(ROUTE_SIVA, 1) == 5);
    } PASS;

    /* T3: R4 descending sweep — positions 5,4,3,2,1,0 */
    TEST(r4_descending_sweep) {
        assert(GET_R_POS(ROUTE_O_SHARP, 4) == 5);
        assert(GET_R_POS(ROUTE_X_SHARP, 4) == 4);
        assert(GET_R_POS(ROUTE_N_SHARP, 4) == 3);
        assert(GET_R_POS(ROUTE_M_SHARP, 4) == 2);
        assert(GET_R_POS(ROUTE_NARA, 4) == 1);
        assert(GET_R_POS(ROUTE_SIVA, 4) == 0);
    } PASS;

    /* T3b: R0 upper-triad confinement (DR-R0, dataset authoritative) —
     * Creation acts only at O#/X#/N# (positions 1/2/3); absent below Spanda. */
    TEST(r0_upper_triad_confinement) {
        assert(GET_R_POS(ROUTE_O_SHARP, 0) == 1);
        assert(GET_R_POS(ROUTE_X_SHARP, 0) == 2);
        assert(GET_R_POS(ROUTE_N_SHARP, 0) == 3);
        assert(GET_R_POS(ROUTE_M_SHARP, 0) == 7);  /* absent */
        assert(GET_R_POS(ROUTE_NARA, 0) == 7);     /* absent */
        assert(GET_R_POS(ROUTE_SIVA, 0) == 7);     /* absent */
        assert(GET_R_POS(ROUTE_SHAKTI, 0) == 7);   /* absent */
    } PASS;

    /* T3c: R2/R3 counter-flow double-course — R2 ascends X#..Shakti,
     * R3 descends; per-fret complementarity R2+R3 = 5 throughout.
     * Shakti carries the (@#) band-turn: R2@5 (Beauty ends) / R3@0 (Life begins). */
    TEST(r2_r3_counterflow_and_turn) {
        assert(GET_R_POS(ROUTE_X_SHARP, 2) == 0 && GET_R_POS(ROUTE_X_SHARP, 3) == 5);
        assert(GET_R_POS(ROUTE_N_SHARP, 2) == 1 && GET_R_POS(ROUTE_N_SHARP, 3) == 4);
        assert(GET_R_POS(ROUTE_M_SHARP, 2) == 2 && GET_R_POS(ROUTE_M_SHARP, 3) == 3);
        assert(GET_R_POS(ROUTE_NARA, 2) == 3 && GET_R_POS(ROUTE_NARA, 3) == 2);
        assert(GET_R_POS(ROUTE_SIVA, 2) == 4 && GET_R_POS(ROUTE_SIVA, 3) == 1);
        assert(GET_R_POS(ROUTE_SHAKTI, 2) == 5 && GET_R_POS(ROUTE_SHAKTI, 3) == 0);
    } PASS;

    /* T3d: Tier 1 — the principle triad (##, #R, R#). Divine Action's
     * compiled terminal form reduces to (##) and (R#) and (#R). */
    TEST(principle_triad_symbols) {
        assert(R_TRIAD_COUNT == 3u);
        assert(R_TRIAD_TABLE[R_TRIAD_TRUTH].symbol[0] == '#' && R_TRIAD_TABLE[R_TRIAD_TRUTH].symbol[1] == '#');
        assert(R_TRIAD_TABLE[R_TRIAD_LIGHT].symbol[0] == '#' && R_TRIAD_TABLE[R_TRIAD_LIGHT].symbol[1] == 'R');
        assert(R_TRIAD_TABLE[R_TRIAD_LIFE].symbol[0]  == 'R' && R_TRIAD_TABLE[R_TRIAD_LIFE].symbol[1]  == '#');
        /* macro-constant symbols agree with the table */
        assert(R_TRIAD_TRUTH_SYMBOL[0] == '#' && R_TRIAD_LIGHT_SYMBOL[1] == 'R' && R_TRIAD_LIFE_SYMBOL[0] == 'R');
    } PASS;

    /* T3e: Tier 2 — distribution matrix agrees with the route table for
     * R0..R4, and R5 is positionless (== 7) across every base. */
    TEST(distribution_matrix_consistency) {
        const R_Factor_Route routes[R_FACTOR_BASE_COUNT] = {
            ROUTE_O_SHARP, ROUTE_X_SHARP, ROUTE_N_SHARP,
            ROUTE_M_SHARP, ROUTE_NARA, ROUTE_SIVA, ROUTE_SHAKTI
        };
        for (uint8_t base = 0; base < R_FACTOR_BASE_COUNT; base++) {
            for (uint8_t r = 0; r < 5u; r++) {  /* R0..R4 encodable in u16 */
                assert(R_FACTOR_DISTRIBUTION[base][r] == GET_R_POS(routes[base], r));
            }
            /* R5 (Samavesa) is positionless everywhere */
            assert(R_FACTOR_DISTRIBUTION[base][5] == R5_POSITIONLESS);
        }
    } PASS;

    /* T3f: base→M column map pre-threads the metastructure (O#→M1 … Sakti→M5). */
    TEST(base_m_column_map) {
        assert(R_BASE_M_COLUMN[R_BASE_O_SHARP] == 1u);
        assert(R_BASE_M_COLUMN[R_BASE_X_SHARP] == 2u);
        assert(R_BASE_M_COLUMN[R_BASE_N_SHARP] == 3u);
        assert(R_BASE_M_COLUMN[R_BASE_M_SHARP] == 4u);
        assert(R_BASE_M_COLUMN[R_BASE_NARA]    == 4u);
        assert(R_BASE_M_COLUMN[R_BASE_SIVA]    == 5u);
        assert(R_BASE_M_COLUMN[R_BASE_SHAKTI]  == 5u);
    } PASS;

    /* T3g: Tier 3 — nR chirality. Rn (operator) and nR (witness) are
     * enantiomers; partnering twice is the identity (Law-1 polarity). */
    TEST(nr_chirality_involution) {
        assert(r_factor_chiral_partner(R_HAND_OPERATOR) == R_HAND_WITNESS);
        assert(r_factor_chiral_partner(R_HAND_WITNESS)  == R_HAND_OPERATOR);
        for (int h = 0; h < 2; h++) {
            R_Chirality_Hand hand = (R_Chirality_Hand)h;
            assert(r_factor_chiral_partner(r_factor_chiral_partner(hand)) == hand);
        }
    } PASS;

    /* T3h: the (@#) band-turn — Pravritti (descent) flips to Nivritti
     * (ascent) at the Sakti seed; RFactorPathStep carries the marker. */
    TEST(at_sharp_band_turn) {
        assert(R_BAND_TURN_SYMBOL[0] == '(' && R_BAND_TURN_SYMBOL[1] == '@' && R_BAND_TURN_SYMBOL[2] == '#');
        /* Beauty (2R) ends at Sakti R2@5; Life (3R) begins at Sakti R3@0 */
        RFactorPathStep beauty_end = { .r_factor = 2, .base_route = R_BASE_SHAKTI,
                                       .band = R_BAND_PRAVRITTI, .position = R_FACTOR_DISTRIBUTION[R_BASE_SHAKTI][2] };
        RFactorPathStep turn       = { .r_factor = 2, .base_route = R_BASE_SHAKTI,
                                       .band = R_BAND_TURN, .position = R5_POSITIONLESS };
        RFactorPathStep life_begin = { .r_factor = 3, .base_route = R_BASE_SHAKTI,
                                       .band = R_BAND_NIVRITTI, .position = R_FACTOR_DISTRIBUTION[R_BASE_SHAKTI][3] };
        assert(beauty_end.position == 5);   /* R2@5 */
        assert(life_begin.position == 0);    /* R3@0 */
        assert(turn.band == R_BAND_TURN);
    } PASS;

    /* T4: CLI dispatch with "info" command */
    TEST(cli_info_command) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 64) == 0);
        Holographic_Coordinate* hc = arena_alloc(&arena);
        hc->ql_position = 0;
        hc->family = FAMILY_NONE;
        M0_Root* root = m0_init(&arena, hc);
        assert(root != NULL);

        char* argv[] = {"m0", "info"};
        int rc = m0_cli_dispatch(2, argv, root);
        assert(rc == 0);

        m0_teardown(root);
        arena_destroy(&arena);
    } PASS;

    /* T5: CLI dispatch with "clock" command */
    TEST(cli_clock_command) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 64) == 0);
        Holographic_Coordinate* hc = arena_alloc(&arena);
        hc->ql_position = 0;
        hc->family = FAMILY_NONE;
        M0_Root* root = m0_init(&arena, hc);

        char* argv[] = {"m0", "clock", "155"};
        int rc = m0_cli_dispatch(3, argv, root);
        assert(rc == 0);

        m0_teardown(root);
        arena_destroy(&arena);
    } PASS;

    /* T6: CLI dispatch with "logos" command */
    TEST(cli_logos_command) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 64) == 0);
        Holographic_Coordinate* hc = arena_alloc(&arena);
        hc->ql_position = 0;
        hc->family = FAMILY_NONE;
        M0_Root* root = m0_init(&arena, hc);

        char* argv[] = {"m0", "logos", "7"};
        int rc = m0_cli_dispatch(3, argv, root);
        assert(rc == 0);

        m0_teardown(root);
        arena_destroy(&arena);
    } PASS;

    printf("\n=== M0 R-Factor + CLI: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
