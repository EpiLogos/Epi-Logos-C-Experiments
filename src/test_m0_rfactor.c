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
