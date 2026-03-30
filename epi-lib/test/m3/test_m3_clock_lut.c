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

    printf("\n=== M3 CLOCK_DEGREE_LUT: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
