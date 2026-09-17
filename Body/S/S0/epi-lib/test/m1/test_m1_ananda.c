/*
 * test_m1_ananda.c — Verify Ananda #1-2 matrix computational properties
 * Dataset source: #1-2-{0..5} (paramasiva-deep)
 *
 * Standalone binary: defines its own main() and test macros.
 */
#include "../../include/m1.h"
#include <stdio.h>
#include <stdint.h>
#include <string.h>

/* ------------------------------------------------------------------ *
 * Minimal test harness — standalone (no test_framework.h dependency)
 * ------------------------------------------------------------------ */
static int _suite_pass = 0;
static int _suite_fail = 0;
static int _test_failed = 0;
static const char* _test_name = "";

#define TEST_SUITE_BEGIN(name) \
    do { printf("=== %s ===\n", (name)); } while (0)

#define TEST_SUITE_END() \
    do { \
        printf("\n%d passed, %d failed, %d total\n", \
               _suite_pass, _suite_fail, _suite_pass + _suite_fail); \
    } while (0)

#define RUN_TEST(fn) \
    do { \
        _test_failed = 0; \
        _test_name = #fn; \
        fn(); \
        if (_test_failed) { \
            printf("  FAIL: %s\n", _test_name); \
            _suite_fail++; \
        } else { \
            printf("  pass: %s\n", _test_name); \
            _suite_pass++; \
        } \
    } while (0)

#define TEST_ASSERT_EQUAL_UINT8(expected, actual) \
    do { \
        uint8_t _e = (uint8_t)(expected); \
        uint8_t _a = (uint8_t)(actual); \
        if (_e != _a) { \
            printf("    FAIL at %s:%d — expected %u got %u\n", \
                   __FILE__, __LINE__, (unsigned)_e, (unsigned)_a); \
            _test_failed = 1; \
        } \
    } while (0)

#define TEST_ASSERT_EQUAL_INT(expected, actual) \
    do { \
        int _e = (int)(expected); \
        int _a = (int)(actual); \
        if (_e != _a) { \
            printf("    FAIL at %s:%d — expected %d got %d\n", \
                   __FILE__, __LINE__, _e, _a); \
            _test_failed = 1; \
        } \
    } while (0)

/* ------------------------------------------------------------------ *
 * Tests — canonical 12×12 Vortex Modulae, dual-faced (raw + DR mirror)
 * CSV: "(0_1) Vortex Modulae - (0_1) x 12Fold ..." — raw block
 * ("No digi-rooting") + digi-root mirror block ("Digi-rooting").
 * ------------------------------------------------------------------ */

/* Digital root as the CSV's mirror block applies it: DR(0)=0,
 * DR(n) = 1 + (n-1) % 9 for n > 0 (e.g. 1X+0 mirror: ...,9,1,2). */
static uint8_t digital_root(uint16_t n) {
    if (n == 0) return 0;
    return (uint8_t)(1u + (n - 1u) % 9u);
}

static void test_raw_face_matches_csv_closed_form_all_144_cells(void) {
    /* rX+b raw value at position c is r*c + b — un-modded, full 12×12 */
    for (int r = 0; r < 12; r++) {
        for (int c = 0; c < 12; c++) {
            uint16_t rc = (uint16_t)(r * c);
            TEST_ASSERT_EQUAL_UINT8(rc, m1_ananda_get(0, (uint8_t)r, (uint8_t)c));
            TEST_ASSERT_EQUAL_UINT8(rc + 1, m1_ananda_get(1, (uint8_t)r, (uint8_t)c));
            TEST_ASSERT_EQUAL_UINT8(2 * rc + 1, m1_ananda_get(2, (uint8_t)r, (uint8_t)c));
            TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_get(4, (uint8_t)r, (uint8_t)c));
        }
    }
    /* No mod-10 wrap: the retired core would have said 2 here */
    TEST_ASSERT_EQUAL_UINT8(12, m1_ananda_get(0, 3, 4));
    TEST_ASSERT_EQUAL_UINT8(13, m1_ananda_get(1, 3, 4));
    /* SU(2) shadow extension rows/cols 10-11 are real, raw */
    TEST_ASSERT_EQUAL_UINT8(121, m1_ananda_get(0, 11, 11));
    TEST_ASSERT_EQUAL_UINT8(122, m1_ananda_get(1, 11, 11));
    TEST_ASSERT_EQUAL_UINT8(243, m1_ananda_get(2, 11, 11));
}

static void test_ananda_axiom_raw_pratibimba_minus_bimba_is_exactly_one(void) {
    for (int i = 0; i < 12; i++) {
        for (int j = 0; j < 12; j++) {
            int m0 = (int)m1_ananda_get(0, (uint8_t)i, (uint8_t)j);
            int m1v = (int)m1_ananda_get(1, (uint8_t)i, (uint8_t)j);
            TEST_ASSERT_EQUAL_INT(1, m1v - m0);
        }
    }
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_verify_axiom());
}

static void test_dr_mirror_equals_digital_root_of_raw_all_144_cells(void) {
    /* The DR face (canonical nibble-packed .rodata matrices) must be the
     * digi-root mirror of the raw face, cell for cell, three stored families */
    for (int m = 0; m <= 2; m++) {
        for (int r = 0; r < 12; r++) {
            for (int c = 0; c < 12; c++) {
                uint16_t rc = (uint16_t)(r * c);
                uint16_t raw = (m == 0) ? rc : (m == 1) ? (uint16_t)(rc + 1) : (uint16_t)(2 * rc + 1);
                TEST_ASSERT_EQUAL_UINT8(digital_root(raw),
                    m1_ananda_dr_get((uint8_t)m, (uint8_t)r, (uint8_t)c));
            }
        }
    }
}

static void test_dr_mirror_csv_spot_checks(void) {
    /* CSV digi-root block, 1X+0 row: 0,1,2,...,9 then 1,2 at cols 10,11 */
    TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(0, 9, 1));
    TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_dr_get(0, 1, 10));
    TEST_ASSERT_EQUAL_UINT8(2, m1_ananda_dr_get(0, 1, 11));
    /* CSV digi-root block, 3X+0 row: 0,3,6,9,3,6,9,... */
    TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(0, 3, 3));
    TEST_ASSERT_EQUAL_UINT8(3, m1_ananda_dr_get(0, 3, 4));
}

static void test_diff_families_dr_constants(void) {
    /* DiffA (rX+0)-(rX+1) = -1 constant: DR face 9 (FR 2.1.9); raw face
     * is signed, not representable in the uint8_t raw getter → 0 sentinel */
    for (int i = 0; i < 12; i++) {
        for (int j = 0; j < 12; j++) {
            TEST_ASSERT_EQUAL_UINT8(9, m1_ananda_dr_get(3, (uint8_t)i, (uint8_t)j));
            TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(3, (uint8_t)i, (uint8_t)j));
            TEST_ASSERT_EQUAL_UINT8(1, m1_ananda_dr_get(4, (uint8_t)i, (uint8_t)j));
        }
    }
}

static void test_bounds_are_12x12(void) {
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(0, 12, 0));
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(0, 0, 12));
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_dr_get(0, 12, 0));
    TEST_ASSERT_EQUAL_UINT8(0, m1_ananda_get(6, 0, 0));
}

/* FR 2.1.10 — seat semantics: positions 0-9 are the archetypal numbers.
 * Number seats skip M0-3-4 (that seat belongs to 0/1 itself): 0,1 at
 * M0-3-2/3; 2-8 at M0-3-5..M0-3-11; 9 at M0-2-9. Position 10 = (0/1)
 * Rosetta Stone (M0-3-4); 11 = (-) Mirror (M0-3-(0/1)). The bridge is
 * the single M1-2<->M0-3 seam. */
static void test_seat_bridge_binds_m0_number_dozen(void) {
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_coordinate(0),  "M0-3-2"));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_coordinate(2),  "M0-3-5"));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_coordinate(8),  "M0-3-11"));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_coordinate(9),  "M0-2-9"));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_coordinate(10), "M0-3-4"));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_coordinate(11), "M0-3-(0/1)"));
    TEST_ASSERT_EQUAL_INT(ANANDA_SEAT_NUMBER,         m1_ananda_seat_kind(9));
    TEST_ASSERT_EQUAL_INT(ANANDA_SEAT_NONDUAL_BINARY, m1_ananda_seat_kind(10));
    TEST_ASSERT_EQUAL_INT(ANANDA_SEAT_MIRROR,         m1_ananda_seat_kind(11));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_symbol(10), "(0/1)"));
    TEST_ASSERT_EQUAL_INT(0, strcmp(m1_ananda_seat_symbol(11), "(-)"));
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_seat_coordinate(12) == NULL);
}

/* M0-3 hidden formula "4/(8)/3/(4)": masculine 8 = zero-elements + Adam
 * evens; feminine 4 = Eve odds {3,5,7} + Wholeness 9. Derived from the
 * compiled ARCHETYPE_LUT polarity — the archetypal ground of the 8+4 bus. */
static void test_bus_partition_masculine8_feminine4_from_polarity(void) {
    int octet_n = 0, quartet_n = 0;
    for (uint8_t p = 0; p < 12; p++) {
        if (m1_ananda_seat_bus_role(p) == ANANDA_BUS_QUARTET) quartet_n++;
        else octet_n++;
    }
    TEST_ASSERT_EQUAL_INT(8, octet_n);
    TEST_ASSERT_EQUAL_INT(4, quartet_n);
    for (uint8_t i = 0; i < 4; i++)
        TEST_ASSERT_EQUAL_INT(ANANDA_BUS_QUARTET,
                              m1_ananda_seat_bus_role(ANANDA_FEMININE_QUARTET[i]));
    for (uint8_t i = 0; i < 8; i++)
        TEST_ASSERT_EQUAL_INT(ANANDA_BUS_OCTET,
                              m1_ananda_seat_bus_role(ANANDA_MASCULINE_OCTET[i]));
}

/* CSV per-row sum columns: identity row 45/66 (base 0) and 55/78 (base 1);
 * sum family row 1 = 100/144 (the squares are literally in the CSV);
 * DiffA -10/-12; full audit incl. Bimba grand total 66^2 = 4356. */
static void test_dual_base_accounting_matches_csv_sum_columns(void) {
    TEST_ASSERT_EQUAL_INT(45,  m1_ananda_row_sum(0, 1, 0));
    TEST_ASSERT_EQUAL_INT(66,  m1_ananda_row_sum(0, 1, 1));
    TEST_ASSERT_EQUAL_INT(55,  m1_ananda_row_sum(1, 1, 0));
    TEST_ASSERT_EQUAL_INT(78,  m1_ananda_row_sum(1, 1, 1));
    TEST_ASSERT_EQUAL_INT(100, m1_ananda_row_sum(2, 1, 0));
    TEST_ASSERT_EQUAL_INT(144, m1_ananda_row_sum(2, 1, 1));
    TEST_ASSERT_EQUAL_INT(-10, m1_ananda_row_sum(3, 4, 0));
    TEST_ASSERT_EQUAL_INT(-12, m1_ananda_row_sum(3, 4, 1));
    TEST_ASSERT_EQUAL_INT(1,   m1_ananda_verify_dual_base());
}

/* Rule face (family 5) CSV verbatim: tetralemma at kp==0, else
 * {DiffA, DiffB, Sum}; corners speak: (7,9) -> 127, (11,11) -> 243. */
static void test_rule_face_csv_verbatim_cells(void) {
    char buf[16];
    m1_ananda_rule_face(0, 5, 0, buf, sizeof buf);
    TEST_ASSERT_EQUAL_INT(0, strcmp(buf, "-1/0/1"));
    m1_ananda_rule_face(1, 1, 0, buf, sizeof buf);
    TEST_ASSERT_EQUAL_INT(0, strcmp(buf, "-1/1/3"));
    m1_ananda_rule_face(7, 9, 0, buf, sizeof buf);
    TEST_ASSERT_EQUAL_INT(0, strcmp(buf, "-1/1/127"));
    m1_ananda_rule_face(11, 11, 0, buf, sizeof buf);
    TEST_ASSERT_EQUAL_INT(0, strcmp(buf, "-1/1/243"));
    m1_ananda_rule_face(1, 1, 1, buf, sizeof buf);
    TEST_ASSERT_EQUAL_INT(0, strcmp(buf, "1/3"));
    m1_ananda_rule_face(0, 7, 1, buf, sizeof buf);
    TEST_ASSERT_EQUAL_INT(0, strcmp(buf, "0/1"));
    TEST_ASSERT_EQUAL_INT(-1, m1_ananda_rule_face(12, 0, 0, buf, sizeof buf));
}

/* Annex accounting (CSV rows 52-71): grand-total quartets, cumulative DR
 * traces, 11-mirror pairs — every value pinned to the CSV's own numbers. */
static void test_annex_grand_totals_match_csv_annotations(void) {
    /* Bimba 45²/66²; Pratibimba +100/+144; Sum family 4150/8856. */
    TEST_ASSERT_EQUAL_INT(2025, m1_ananda_grand_total(0, 0, 0));
    TEST_ASSERT_EQUAL_INT(4356, m1_ananda_grand_total(0, 1, 0));
    TEST_ASSERT_EQUAL_INT(2125, m1_ananda_grand_total(1, 0, 0));
    TEST_ASSERT_EQUAL_INT(4500, m1_ananda_grand_total(1, 1, 0));
    TEST_ASSERT_EQUAL_INT(4150, m1_ananda_grand_total(2, 0, 0));
    TEST_ASSERT_EQUAL_INT(8856, m1_ananda_grand_total(2, 1, 0));
    /* Seed-row-excluded (CSV row 71): 2115/4488 and 4140/8844 — 8844 is
     * the header's "Root of Doubling Motif" total, 8844/12 = 737 = 11*67. */
    TEST_ASSERT_EQUAL_INT(2115, m1_ananda_grand_total(1, 0, 1));
    TEST_ASSERT_EQUAL_INT(4488, m1_ananda_grand_total(1, 1, 1));
    TEST_ASSERT_EQUAL_INT(4140, m1_ananda_grand_total(2, 0, 1));
    TEST_ASSERT_EQUAL_INT(8844, m1_ananda_grand_total(2, 1, 1));
    TEST_ASSERT_EQUAL_INT(-144, m1_ananda_grand_total(3, 1, 0));
    TEST_ASSERT_EQUAL_INT(144,  m1_ananda_grand_total(4, 1, 0));
}

static void test_annex_cumulative_dr_traces_match_csv_columns(void) {
    /* CSV annex trace columns, verified cell-for-cell against the sheet:
     * Bimba fwd col37 / rev col38; Pratibimba fwd col18 / rev col19. */
    static const uint8_t bimba_fwd[12] = {0,3,9,9,3,9,9,3,9,9,3,9};
    static const uint8_t bimba_rev[12] = {9,9,6,9,9,6,9,9,6,9,9,6};
    static const uint8_t prat_fwd[12]  = {3,9,9,3,9,9,3,9,9,3,9,9};
    static const uint8_t prat_rev[12]  = {9,6,9,9,6,9,9,6,9,9,6,9};
    uint8_t trace[12];
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_cumulative_dr_trace(0, 0, trace));
    for (int k = 0; k < 12; k++) TEST_ASSERT_EQUAL_UINT8(bimba_fwd[k], trace[k]);
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_cumulative_dr_trace(0, 1, trace));
    for (int k = 0; k < 12; k++) TEST_ASSERT_EQUAL_UINT8(bimba_rev[k], trace[k]);
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_cumulative_dr_trace(1, 0, trace));
    for (int k = 0; k < 12; k++) TEST_ASSERT_EQUAL_UINT8(prat_fwd[k], trace[k]);
    TEST_ASSERT_EQUAL_INT(1, m1_ananda_cumulative_dr_trace(1, 1, trace));
    for (int k = 0; k < 12; k++) TEST_ASSERT_EQUAL_UINT8(prat_rev[k], trace[k]);
}

static void test_annex_11_mirror_pairs_match_csv_rows(void) {
    /* CSV rows 54-61: (3,8),(4,7),(5,6),(6,5),(7,4),(8,3),(9,2),(1,1). */
    static const uint8_t expected[8][2] = {
        {3,8},{4,7},{5,6},{6,5},{7,4},{8,3},{9,2},{1,1}
    };
    for (uint8_t n = 3; n <= 10; n++) {
        uint8_t dr_n = 0, comp = 0;
        TEST_ASSERT_EQUAL_INT(1, m1_ananda_mirror_pair(n, &dr_n, &comp));
        TEST_ASSERT_EQUAL_UINT8(expected[n - 3][0], dr_n);
        TEST_ASSERT_EQUAL_UINT8(expected[n - 3][1], comp);
    }
    uint8_t a, b;
    TEST_ASSERT_EQUAL_INT(0, m1_ananda_mirror_pair(2, &a, &b));
    TEST_ASSERT_EQUAL_INT(0, m1_ananda_mirror_pair(11, &a, &b));
}

int main(void) {
    TEST_SUITE_BEGIN("M1 Ananda #1-2 Matrices — 12x12 Vortex Modulae");
    RUN_TEST(test_raw_face_matches_csv_closed_form_all_144_cells);
    RUN_TEST(test_ananda_axiom_raw_pratibimba_minus_bimba_is_exactly_one);
    RUN_TEST(test_dr_mirror_equals_digital_root_of_raw_all_144_cells);
    RUN_TEST(test_dr_mirror_csv_spot_checks);
    RUN_TEST(test_diff_families_dr_constants);
    RUN_TEST(test_bounds_are_12x12);
    RUN_TEST(test_seat_bridge_binds_m0_number_dozen);
    RUN_TEST(test_bus_partition_masculine8_feminine4_from_polarity);
    RUN_TEST(test_dual_base_accounting_matches_csv_sum_columns);
    RUN_TEST(test_rule_face_csv_verbatim_cells);
    RUN_TEST(test_annex_grand_totals_match_csv_annotations);
    RUN_TEST(test_annex_cumulative_dr_traces_match_csv_columns);
    RUN_TEST(test_annex_11_mirror_pairs_match_csv_rows);
    TEST_SUITE_END();
    return (_suite_fail > 0) ? 1 : 0;
}
