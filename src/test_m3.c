/**
 * test_m3.c — M3 (Mahamaya) Verification Suite
 *
 * Tests all FRs from M3-mahamaya-symbolic-transcription.md.
 * Build: clang -std=c11 -Wall -Wextra -I include -fsanitize=address,undefined \
 *        src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
 *        src/m0.c src/m1.c src/m2.c src/m3.c src/test_m3.c -o test_m3
 */

#include <stdio.h>
#include <string.h>
#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m0.h"
#include "m1.h"
#include "m2.h"
#include "m3.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; } \
    else { fail_count++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)

/* ===================================================================
 * FR 2.3.12: NUCLEOTIDE_ICHING_VALUE
 * =================================================================== */

static void test_nucleotide_iching(void) {
    TEST("A I-Ching = 6", NUCLEOTIDE_ICHING_VALUE[M3_NUC_A] == 6);
    TEST("T I-Ching = 9", NUCLEOTIDE_ICHING_VALUE[M3_NUC_T] == 9);
    TEST("C I-Ching = 7", NUCLEOTIDE_ICHING_VALUE[M3_NUC_C] == 7);
    TEST("G I-Ching = 8", NUCLEOTIDE_ICHING_VALUE[M3_NUC_G] == 8);
    TEST("NUC sum = 30", NUCLEOTIDE_ICHING_VALUE[0] + NUCLEOTIDE_ICHING_VALUE[1] +
                          NUCLEOTIDE_ICHING_VALUE[2] + NUCLEOTIDE_ICHING_VALUE[3] == 30);

    TEST("get_iching_value(0) = 6", get_iching_value(0) == 6);
    TEST("get_iching_value(3) = 8", get_iching_value(3) == 8);
}

/* ===================================================================
 * FR 2.3.1: 2-BIT NUCLEOTIDE LOGIC
 * =================================================================== */

static void test_nucleotide_logic(void) {
    /* Polarity: bit 0 */
    TEST("A polarity = Yin(0)",  GET_POLARITY(M3_NUC_A) == 0);
    TEST("T polarity = Yang(1)", GET_POLARITY(M3_NUC_T) == 1);
    TEST("C polarity = Yin(0)",  GET_POLARITY(M3_NUC_C) == 0);
    TEST("G polarity = Yang(1)", GET_POLARITY(M3_NUC_G) == 1);

    /* Mobility: bit 1 */
    TEST("A mobility = Moving(0)",  GET_MOBILITY(M3_NUC_A) == 0);
    TEST("T mobility = Moving(0)",  GET_MOBILITY(M3_NUC_T) == 0);
    TEST("C mobility = Resting(1)", GET_MOBILITY(M3_NUC_C) == 1);
    TEST("G mobility = Resting(1)", GET_MOBILITY(M3_NUC_G) == 1);

    /* Base pairing: XOR 0x01 */
    TEST("A pairs T", get_base_pair(M3_NUC_A) == M3_NUC_T);
    TEST("T pairs A", get_base_pair(M3_NUC_T) == M3_NUC_A);
    TEST("C pairs G", get_base_pair(M3_NUC_C) == M3_NUC_G);
    TEST("G pairs C", get_base_pair(M3_NUC_G) == M3_NUC_C);

    /* Codon encoding */
    TEST("AAA = 0x00", encode_codon(0, 0, 0) == 0x00);
    TEST("TTT = 0x15", encode_codon(1, 1, 1) == 0x15);
    TEST("ATG = 0x07", encode_codon(0, 1, 3) == 0x07);
    TEST("GGG = 0x3F", encode_codon(3, 3, 3) == 0x3F);

    /* Codon decomposition */
    TEST("outer(ATG) = A", codon_outer(0x07) == M3_NUC_A);
    TEST("middle(ATG) = T", codon_middle(0x07) == M3_NUC_T);
    TEST("inner(ATG) = G", codon_inner(0x07) == M3_NUC_G);
}

/* ===================================================================
 * FR 2.3.2: PAIR_MATRIX — 3-Matrix System
 * =================================================================== */

static void test_pair_matrix(void) {
    /* Homogeneous pairs: diff=0, shared across all 3 matrices */
    TEST("AA sum=12", M3_PAIR_MATRIX[0].sum == 12);
    TEST("TT sum=18", M3_PAIR_MATRIX[5].sum == 18);
    TEST("CC sum=14", M3_PAIR_MATRIX[10].sum == 14);
    TEST("GG sum=16", M3_PAIR_MATRIX[15].sum == 16);
    TEST("AA diff=0", M3_PAIR_MATRIX[0].diff == 0);
    TEST("TT diff=0", M3_PAIR_MATRIX[5].diff == 0);
    TEST("CC diff=0", M3_PAIR_MATRIX[10].diff == 0);
    TEST("GG diff=0", M3_PAIR_MATRIX[15].diff == 0);

    /* Matrix 1 (Watson-Crick): all sum=15 */
    TEST("AT sum=15", M3_PAIR_MATRIX[1].sum == 15);
    TEST("TA sum=15", M3_PAIR_MATRIX[4].sum == 15);
    TEST("CG sum=15", M3_PAIR_MATRIX[14].sum == 15);
    TEST("GC sum=15", M3_PAIR_MATRIX[11].sum == 15);

    /* Watson-Crick diff symmetry: AT.diff = -TA.diff */
    TEST("AT/TA diff antisymmetric", M3_PAIR_MATRIX[1].diff == -M3_PAIR_MATRIX[4].diff);
    TEST("CG/GC diff antisymmetric", M3_PAIR_MATRIX[14].diff == -M3_PAIR_MATRIX[11].diff);

    /* Matrix 2 (Cross-complementary): AG/GA sum=14, TC/CT sum=16 */
    TEST("AG sum=14", M3_PAIR_MATRIX[3].sum == 14);
    TEST("GA sum=14", M3_PAIR_MATRIX[12].sum == 14);
    TEST("TC sum=16", M3_PAIR_MATRIX[6].sum == 16);
    TEST("CT sum=16", M3_PAIR_MATRIX[9].sum == 16);

    /* Matrix 3 (Cross-diagonal): AC/CA sum=13, TG/GT sum=17 */
    TEST("AC sum=13", M3_PAIR_MATRIX[2].sum == 13);
    TEST("CA sum=13", M3_PAIR_MATRIX[8].sum == 13);
    TEST("TG sum=17", M3_PAIR_MATRIX[7].sum == 17);
    TEST("GT sum=17", M3_PAIR_MATRIX[13].sum == 17);

    /* TT is MAX sum (18) */
    for (int i = 0; i < 16; i++) {
        TEST("TT is max sum", M3_PAIR_MATRIX[i].sum <= 18);
    }
    /* AA is MIN sum (12) */
    for (int i = 0; i < 16; i++) {
        TEST("AA is min sum", M3_PAIR_MATRIX[i].sum >= 12);
    }
}

/* ===================================================================
 * FR 2.3.3: Rotational State
 * =================================================================== */

static void test_rotational_state(void) {
    /* AA + TT = (12+18, 0+0) = (30, 0) */
    Rotational_State rs = compute_rotational_state(0, 5);
    TEST("RS(AA,TT) sum=30", rs.total_sum == 30);
    TEST("RS(AA,TT) diff=0", rs.total_diff == 0);

    /* Safe version with gap */
    uint32_t flags = 0;
    bool ok = compute_rotational_state_safe(0, M3_RESONANCE_GAP, &rs, &flags);
    TEST("RS safe rejects gap", !ok);
    TEST("RS safe sets PROVISIONAL", (flags & STATUS_PROVISIONAL_BIT) != 0);
}

/* ===================================================================
 * FR 2.3.1: Hexagram Operations
 * =================================================================== */

static void test_hexagram_ops(void) {
    /* Complement: all 6 lines inverted */
    TEST("complement(0) = 63", m3_complement(0) == 63);
    TEST("complement(63) = 0", m3_complement(63) == 0);
    TEST("complement(21) = 42", m3_complement(21) == 42);

    /* Line change */
    TEST("line_change(0, 0) = 1", m3_line_change(0, 0) == 1);
    TEST("line_change(0, 5) = 32", m3_line_change(0, 5) == 32);

    /* Trigram composition */
    TEST("compose(0,0) = 0", compose_hexagram(0, 0) == 0);
    TEST("compose(7,7) = 63", compose_hexagram(7, 7) == 63);
    TEST("compose(3,5) = 29", compose_hexagram(3, 5) == 29);
    TEST("upper(29) = 3", upper_trigram(29) == 3);
    TEST("lower(29) = 5", lower_trigram(29) == 5);

    /* Hexagram LUT */
    TEST("HEX[0] complement = 63", M3_HEXAGRAM_LUT[0].complement_id == 63);
    TEST("HEX[63] complement = 0", M3_HEXAGRAM_LUT[63].complement_id == 0);

    for (int i = 0; i < 64; i++) {
        TEST("HEX double complement", M3_HEXAGRAM_LUT[M3_HEXAGRAM_LUT[i].complement_id].complement_id == (uint8_t)i);
    }
}

/* ===================================================================
 * FR 2.3.17: Non-Dual Codons
 * =================================================================== */

static void test_nondual(void) {
    /* Exactly 16 non-dual codons */
    int ndc = 0;
    for (int i = 0; i < 64; i++) {
        if (is_nondual_codon((uint8_t)i)) ndc++;
    }
    TEST("16 non-dual codons", ndc == 16);

    /* All entries in M3_NONDUAL_CODONS pass the check */
    for (int i = 0; i < 16; i++) {
        TEST("NONDUAL_CODONS[i] is nondual", is_nondual_codon(M3_NONDUAL_CODONS[i]));
    }

    /* XyX pattern: outer == inner */
    for (int i = 0; i < 16; i++) {
        uint8_t c = M3_NONDUAL_CODONS[i];
        TEST("nondual outer==inner", codon_outer(c) == codon_inner(c));
    }
}

/* ===================================================================
 * FR 2.3.18: Inner Charge Closed-Form
 * =================================================================== */

static void test_charges(void) {
    /* AAA: pp=18, nn=-12, np=6, pn=0 */
    int8_t pp, nn, np, pn;
    m3_compute_charges(encode_codon(0,0,0), &pp, &nn, &np, &pn);
    TEST("AAA pp=18", pp == 18);
    TEST("AAA nn=6-6-6=-6", nn == -6);

    /* TTT: pp=27, nn=9-9-9=-9, np=9, pn=9 */
    m3_compute_charges(encode_codon(1,1,1), &pp, &nn, &np, &pn);
    TEST("TTT pp=27", pp == 27);
    TEST("TTT nn=-9", nn == -9);
    TEST("TTT np=9", np == 9);
    TEST("TTT pn=9", pn == 9);

    /* 4X invariant: pp+nn+np+pn = 4*outer for every codon */
    for (int c = 0; c < 64; c++) {
        m3_compute_charges((uint8_t)c, &pp, &nn, &np, &pn);
        uint8_t outer_val = NUCLEOTIDE_ICHING_VALUE[(c >> 4) & 0x03];
        TEST("4X invariant", pp + nn + np + pn == (int)(4 * outer_val));
    }
}

/* ===================================================================
 * FR 2.3.15: 360 Integral Invariant
 * =================================================================== */

static void test_integral_invariant(void) {
    int32_t total = 0;
    int32_t suit_totals[4] = {0};

    for (int c = 0; c < 64; c++) {
        int8_t pp, nn, np, pn;
        m3_compute_charges((uint8_t)c, &pp, &nn, &np, &pn);
        total += pp;
        suit_totals[(c >> 4) & 0x03] += pp;
    }

    TEST("raw total = 1440", total == 1440);
    TEST("1440/4 = 360", total / 4 == 360);
    TEST("Cups raw = 336",      suit_totals[0] == 336);
    TEST("Wands raw = 384",     suit_totals[1] == 384);
    TEST("Pentacles raw = 352", suit_totals[2] == 352);
    TEST("Swords raw = 368",    suit_totals[3] == 368);
    TEST("Cups/4 = 84",         suit_totals[0] / 4 == (int)M3_SUIT_A_INTEGRAL);
    TEST("Wands/4 = 96",        suit_totals[1] / 4 == (int)M3_SUIT_T_INTEGRAL);
    TEST("Pentacles/4 = 88",    suit_totals[2] / 4 == (int)M3_SUIT_C_INTEGRAL);
    TEST("Swords/4 = 92",       suit_totals[3] / 4 == (int)M3_SUIT_G_INTEGRAL);
}

/* ===================================================================
 * FR 2.3.9: Three Matrix Operators
 * =================================================================== */

static void test_matrices(void) {
    /* Complementarity: i ^ 0x3F */
    for (int i = 0; i < 64; i++) {
        TEST("comp[i] = i^0x3F", M3_COMP_MATRIX[i] == (uint8_t)(i ^ 0x3F));
    }

    /* Movement: swap trigrams */
    for (int i = 0; i < 64; i++) {
        uint8_t expected = (uint8_t)(((i & 0x07) << 3) | ((i >> 3) & 0x07));
        TEST("move[i] = swap trigrams", M3_MOVE_MATRIX[i] == expected);
    }

    /* Resonance: 56 valid + 8 gaps */
    int gaps = 0;
    for (int i = 0; i < 64; i++) {
        if (M3_RES_MATRIX[i] == M3_RESONANCE_GAP) gaps++;
    }
    TEST("resonance 8 gaps", gaps == 8);
}

/* ===================================================================
 * FR 2.3.7: SU(2) Polar Opposite
 * =================================================================== */

static void test_su2(void) {
    TEST("polar_opp(0) = 180", polar_opposite_su2(0) == 180);
    TEST("polar_opp(180) = 0", polar_opposite_su2(180) == 0);
    TEST("polar_opp(90) = 270", polar_opposite_su2(90) == 270);

    /* Shadow layer preserved */
    TEST("polar_opp(360) = 540", polar_opposite_su2(360) == 540);
    TEST("polar_opp(540) = 360", polar_opposite_su2(540) == 360);

    /* Double application = identity */
    for (int d = 0; d < 720; d++) {
        TEST("polar_opp(polar_opp(d)) = d",
             polar_opposite_su2(polar_opposite_su2((uint16_t)d)) == (uint16_t)d);
    }
}

/* ===================================================================
 * FR 2.3.6: Epogdoon Bridge
 * =================================================================== */

static void test_epogdoon(void) {
    /* 72 * 8/9 = 64 */
    int distinct = 0;
    uint8_t seen[64] = {0};
    for (int i = 0; i < 72; i++) {
        uint8_t compressed = apply_epogdoon_compression((uint8_t)i);
        TEST("epogdoon < 64", compressed < 64);
        if (!seen[compressed]) {
            seen[compressed] = 1;
            distinct++;
        }
    }
    TEST("epogdoon covers all 64", distinct == 64);

    /* 72 - 64 = 8 collisions (multiple M2 indices map to same M3 index) */
    TEST("epogdoon 72-64 = 8 collisions", 72 - distinct == 8);
}

/* ===================================================================
 * FR 2.3.5: Cosmic Clock
 * =================================================================== */

static void test_cosmic_clock(void) {
    Unified_Clock_State cs;

    cs = read_cosmic_clock(0);
    TEST("clock(0) torus=0", cs.m1_torus_stage == 0);
    TEST("clock(0) decan=0", cs.m2_decan_phase == 0);
    TEST("clock(0) hex=0", cs.m3_hexagram_id == 0);
    TEST("clock(0) explicate", !cs.is_implicate_phase);

    cs = read_cosmic_clock(360);
    TEST("clock(360) implicate", cs.is_implicate_phase);

    cs = read_cosmic_clock(180);
    TEST("clock(180) torus=6", cs.m1_torus_stage == 6);
    TEST("clock(180) hex=32", cs.m3_hexagram_id == 32);
}

/* ===================================================================
 * FR 2.3.14: Rotational Composition
 * =================================================================== */

static void test_rotational_composition(void) {
    /* Non-dual detection: y == Z */
    TEST("nondual(AT, TG) = true", is_nondual_composition(
        (uint8_t)((M3_NUC_A << 2) | M3_NUC_T),
        (uint8_t)((M3_NUC_T << 2) | M3_NUC_G)
    ));
    TEST("nondual(AT, AG) = false", !is_nondual_composition(
        (uint8_t)((M3_NUC_A << 2) | M3_NUC_T),
        (uint8_t)((M3_NUC_A << 2) | M3_NUC_G)
    ));
}

/* ===================================================================
 * FR 2.3.20: DNA/RNA Superposition
 * =================================================================== */

static void test_rna(void) {
    TEST("AAA not RNA-capable", !m3_codon_is_rna_capable(encode_codon(0,0,0)));
    TEST("ATG is RNA-capable", m3_codon_is_rna_capable(encode_codon(0,1,3)));
    TEST("TTT is RNA-capable", m3_codon_is_rna_capable(encode_codon(1,1,1)));
    TEST("CCC not RNA-capable", !m3_codon_is_rna_capable(encode_codon(2,2,2)));
    TEST("GGG not RNA-capable", !m3_codon_is_rna_capable(encode_codon(3,3,3)));
}

/* ===================================================================
 * FR 2.3.16: Tarot-Codon LUT
 * =================================================================== */

static void test_tarot(void) {
    /* All 64 codons must appear exactly once across the 4 suits × 14 cards */
    uint8_t codon_count[64] = {0};
    for (int s = 0; s < 4; s++) {
        for (int r = 0; r < 14; r++) {
            const M3_TarotCodonEntry* e = &M3_TAROT_CODON_MAP[s][r];
            TEST("tarot suit matches", e->suit == (uint8_t)s);
            if (e->codon_a < 64) codon_count[e->codon_a]++;
            if (e->codon_b < 64) codon_count[e->codon_b]++;
        }
    }
    /* All 64 codons covered */
    int covered = 0;
    for (int i = 0; i < 64; i++) {
        if (codon_count[i] > 0) covered++;
    }
    TEST("tarot covers all 64 codons", covered == 64);

    /* No codon appears more than once */
    int duplicates = 0;
    for (int i = 0; i < 64; i++) {
        if (codon_count[i] > 1) duplicates++;
    }
    TEST("tarot no duplicate codons", duplicates == 0);

    /* Yin suits (Cups=0, Pentacles=2): Knight+King dual-codon */
    TEST("Cups Knight dual", M3_TAROT_CODON_MAP[0][M3_TAROT_PIP_PRINCE].codon_b != M3_TAROT_SINGLE_CODON);
    TEST("Cups King dual", M3_TAROT_CODON_MAP[0][M3_TAROT_PIP_KING].codon_b != M3_TAROT_SINGLE_CODON);
    TEST("Pent Knight dual", M3_TAROT_CODON_MAP[2][M3_TAROT_PIP_PRINCE].codon_b != M3_TAROT_SINGLE_CODON);
    TEST("Pent King dual", M3_TAROT_CODON_MAP[2][M3_TAROT_PIP_KING].codon_b != M3_TAROT_SINGLE_CODON);

    /* Yang suits (Wands=1, Swords=3): Page+Queen dual-codon */
    TEST("Wands Page dual", M3_TAROT_CODON_MAP[1][M3_TAROT_PIP_PRINCESS].codon_b != M3_TAROT_SINGLE_CODON);
    TEST("Wands Queen dual", M3_TAROT_CODON_MAP[1][M3_TAROT_PIP_QUEEN].codon_b != M3_TAROT_SINGLE_CODON);
    TEST("Swords Page dual", M3_TAROT_CODON_MAP[3][M3_TAROT_PIP_PRINCESS].codon_b != M3_TAROT_SINGLE_CODON);
    TEST("Swords Queen dual", M3_TAROT_CODON_MAP[3][M3_TAROT_PIP_QUEEN].codon_b != M3_TAROT_SINGLE_CODON);

    /* Ace codons are homogeneous (AAA, TTT, CCC, GGG) */
    TEST("Cups Ace = AAA", M3_TAROT_CODON_MAP[0][0].codon_a == encode_codon(0,0,0));
    TEST("Wands Ace = TTT", M3_TAROT_CODON_MAP[1][0].codon_a == encode_codon(1,1,1));
    TEST("Pent Ace = CCC", M3_TAROT_CODON_MAP[2][0].codon_a == encode_codon(2,2,2));
    TEST("Swords Ace = GGG", M3_TAROT_CODON_MAP[3][0].codon_a == encode_codon(3,3,3));
}

/* ===================================================================
 * M3 API Tests (init/teardown/verify)
 * =================================================================== */

static void test_m3_api(void) {
    /* m3_verify should pass */
    TEST("m3_verify()", m3_verify());

    /* Init with arena */
    Coordinate_Arena arena;
    TEST("arena_init", arena_init(&arena, 64) == 0);

    /* Create mirror for position 3 */
    Holographic_Coordinate* hc = arena_alloc(&arena);
    hc->ql_position = 3;
    hc->family = FAMILY_NONE;

    M3_Root* root = m3_init(&arena, hc);
    TEST("m3_init not null", root != NULL);
    TEST("m3_init HC linked", root->hc == hc);
    TEST("m3_init CF set", root->active_cf != NULL);
    TEST("m3_init engine wired", root->engine.comp_matrix == M3_COMP_MATRIX);
    TEST("m3_init non_dual_mask nonzero", root->engine.non_dual_mask != 0);

    /* Non-dual mask should have exactly 16 bits set */
    int bitcount = 0;
    uint64_t mask = root->engine.non_dual_mask;
    while (mask) { bitcount += mask & 1; mask >>= 1; }
    TEST("non_dual_mask 16 bits", bitcount == 16);

    /* Wrong position should fail */
    Holographic_Coordinate* wrong = arena_alloc(&arena);
    wrong->ql_position = 0;
    TEST("m3_init rejects pos!=3", m3_init(&arena, wrong) == NULL);

    m3_teardown(root);
    arena_destroy(&arena);
}

/* ===================================================================
 * DET Coverage Test
 * =================================================================== */

static void test_det_coverage(void) {
    uint64_t det_union = 0;
    for (int i = 0; i < 72; i++) {
        det_union |= M2_TO_M3_CYMATIC_PROJECTION[i];
    }
    TEST("DET union = all 64 bits", det_union == 0xFFFFFFFFFFFFFFFFULL);
}

/* ===================================================================
 * Main
 * =================================================================== */

int main(void) {
    printf("=== M3 (Mahamaya) Verification Suite ===\n\n");

    test_nucleotide_iching();
    test_nucleotide_logic();
    test_pair_matrix();
    test_rotational_state();
    test_hexagram_ops();
    test_nondual();
    test_charges();
    test_integral_invariant();
    test_matrices();
    test_su2();
    test_epogdoon();
    test_cosmic_clock();
    test_rotational_composition();
    test_rna();
    test_tarot();
    test_m3_api();
    test_det_coverage();

    printf("\n=== Results: %d passed, %d failed (of %d) ===\n",
           pass_count, fail_count, pass_count + fail_count);

    return fail_count > 0 ? 1 : 0;
}
