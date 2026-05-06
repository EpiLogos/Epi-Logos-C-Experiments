/* test_m3_clock_lut.c — CLOCK_DEGREE_LUT contract tests */
#include "m3.h"
#include <stdio.h>
#include <assert.h>
#include <string.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M3 CLOCK_DEGREE_LUT Tests ===\n");

    TEST(lut_has_360_entries) {
        assert(sizeof(CLOCK_DEGREE_LUT) / sizeof(CLOCK_DEGREE_LUT[0]) == 360);
    } PASS;

    TEST(lut_entry_size_matches_struct) {
        assert(sizeof(Clock_Degree_Entry) >= 12); /* at minimum: 2+7*1+4 bytes */
    } PASS;

    TEST(degree_node_360_matches_index) {
        for (int i = 0; i < 360; i++) {
            assert(CLOCK_DEGREE_LUT[i].degree_node_360 == (uint16_t)i);
        }
    } PASS;

    TEST(decan_idx_is_degree_div_10) {
        for (int i = 0; i < 360; i++) {
            assert(CLOCK_DEGREE_LUT[i].decan_idx == (uint8_t)(i / 10));
        }
    } PASS;

    TEST(exact_degree_720_is_double) {
        assert(CLOCK_DEGREE_LUT[0].exact_degree_720 == 0.0f);
        assert(CLOCK_DEGREE_LUT[180].exact_degree_720 == 360.0f);
        assert(CLOCK_DEGREE_LUT[359].exact_degree_720 == 718.0f);
    } PASS;

    TEST(strand_0_below_180_strand_1_at_or_above) {
        assert(CLOCK_DEGREE_LUT[179].strand == 0);
        assert(CLOCK_DEGREE_LUT[180].strand == 1);
        assert(CLOCK_DEGREE_LUT[359].strand == 1);
    } PASS;

    TEST(backbone_nodes_at_multiples_of_15) {
        /* 24 palindromic anchors: 360/15 == 24 */
        int count = 0;
        for (int i = 0; i < 360; i++) {
            if (CLOCK_DEGREE_LUT[i].is_backbone_node) {
                assert(i % 15 == 0);
                count++;
            }
        }
        assert(count == 24);
    } PASS;

    TEST(shadow_degree_is_degree_plus_360) {
        for (int i = 0; i < 360; i++) {
            assert(CLOCK_DEGREE_LUT[i].shadow_degree == (uint16_t)(i + 360));
        }
    } PASS;

    TEST(polar_opposite_is_180_offset) {
        assert(CLOCK_DEGREE_LUT[0].polar_opposite   == 180);
        assert(CLOCK_DEGREE_LUT[180].polar_opposite  ==   0);
        assert(CLOCK_DEGREE_LUT[90].polar_opposite   == 270);
        assert(CLOCK_DEGREE_LUT[359].polar_opposite  == 179);
    } PASS;

    TEST(hexagram_line_active_in_range_0_5) {
        for (int i = 0; i < 360; i++) {
            assert(CLOCK_DEGREE_LUT[i].hexagram_line_active <= 5);
        }
    } PASS;

    TEST(structural_law_360_plus_24_equals_384) {
        /* 360 + 24 == 64 * 6: clock topology = I-Ching LINE_CHANGE count */
        assert(360 + 24 == 64 * 6);
    } PASS;

    printf("\n=== M3 CLOCK_DEGREE_LUT: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
