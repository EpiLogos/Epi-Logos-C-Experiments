/* test_m0_tick12.c — Canonical tick12 field export in Unified_Clock_State
 *
 * Verifies that Unified_Clock_State exposes tick12 (not m1_torus_stage or
 * spanda_stage) as the canonical discrete clock position (0–11).
 * Source: 00-canonical-invariants.md §3
 */
#include "m0.h"
#include "arena.h"
#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <stdint.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 tick12 Canonical Export Tests ===\n");

    /* T1: Unified_Clock_State exposes tick12 — must compile and assign */
    TEST(unified_clock_state_has_tick12) {
        Unified_Clock_State cs;
        memset(&cs, 0, sizeof(cs));
        cs.tick12 = 7u;
        assert(cs.tick12 == 7u);
    } PASS;

    /* T2: tick12 range 0–11 inclusive — all values round-trip */
    TEST(tick12_range_0_to_11) {
        Unified_Clock_State cs;
        memset(&cs, 0, sizeof(cs));
        for (uint8_t t = 0; t < 12u; t++) {
            cs.tick12 = t;
            assert(cs.tick12 == t);
            assert(cs.tick12 < 12u);
        }
    } PASS;

    /* T3: cf_substage6 derivable from tick12 via mod-6
     * tick12=9 → cf6 = 9 % 6 = 3 */
    TEST(cf_substage6_derivable_from_tick12) {
        Unified_Clock_State cs;
        memset(&cs, 0, sizeof(cs));
        cs.tick12 = 9u;
        uint8_t cf6 = cs.tick12 % 6u;
        assert(cf6 == 3u);
    } PASS;

    /* T4: m0_read_cosmic_clock populates tick12 correctly
     * degree 155 → base=155 → tick12 = 155/30 = 5 */
    TEST(read_cosmic_clock_populates_tick12) {
        Unified_Clock_State cs = m0_read_cosmic_clock(155u);
        assert(cs.tick12 == 5u);
        assert(!cs.is_implicate_phase);
    } PASS;

    /* T5: tick12 at degree 0 is 0 */
    TEST(tick12_at_degree_0_is_0) {
        Unified_Clock_State cs = m0_read_cosmic_clock(0u);
        assert(cs.tick12 == 0u);
    } PASS;

    /* T6: tick12 at degree 330 is 11 (last stage before wrap) */
    TEST(tick12_at_degree_330_is_11) {
        Unified_Clock_State cs = m0_read_cosmic_clock(330u);
        assert(cs.tick12 == 11u);
    } PASS;

    /* T7: tick12 at degree 360 (shadow layer) is 0 — modulo resets */
    TEST(tick12_at_degree_360_is_0_shadow) {
        Unified_Clock_State cs = m0_read_cosmic_clock(360u);
        assert(cs.tick12 == 0u);
        assert(cs.is_implicate_phase);
    } PASS;

    /* T8: tick12 at degree 180 is 6 */
    TEST(tick12_at_degree_180_is_6) {
        Unified_Clock_State cs = m0_read_cosmic_clock(180u);
        assert(cs.tick12 == 6u);
    } PASS;

    /* T9: compute-path sweep — all 12 ticks via m0_read_cosmic_clock
     * degree = tick * 30 must always yield tick12 == tick */
    TEST(compute_path_all_12_ticks) {
        for (uint8_t tick = 0; tick < 12u; tick++) {
            uint16_t degree = (uint16_t)(tick * 30u);
            Unified_Clock_State cs = m0_read_cosmic_clock(degree);
            assert(cs.tick12 == tick);
        }
    } PASS;

    printf("\n=== M0 tick12: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
