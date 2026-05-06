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
#include <math.h>
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

static int approxf(float a, float b) {
    float diff = a - b;
    return diff < 0.001f && diff > -0.001f;
}

static uint8_t pair_idx(uint8_t n1, uint8_t n2) {
    return (uint8_t)((n1 << 2) | n2);
}

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
    TEST("A+T = 15", NUCLEOTIDE_ICHING_VALUE[M3_NUC_A] + NUCLEOTIDE_ICHING_VALUE[M3_NUC_T] == 15);
    TEST("C+G = 15", NUCLEOTIDE_ICHING_VALUE[M3_NUC_C] + NUCLEOTIDE_ICHING_VALUE[M3_NUC_G] == 15);

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
    static const struct {
        uint8_t idx;
        int8_t sum_value;
        int8_t difference_value;
    } expected_pairs[] = {
        { 0, 12,  0 }, /* AA */
        { 1, 15, -3 }, /* AT */
        { 2, 13, -1 }, /* AC */
        { 3, 14,  2 }, /* AG */
        { 4, 15,  3 }, /* TA */
        { 5, 18,  0 }, /* TT */
        { 6, 16, -2 }, /* TC */
        { 7, 17,  1 }, /* TG */
        { 8, 13,  1 }, /* CA */
        { 9, 16, -2 }, /* CT */
        { 10,14,  0 }, /* CC */
        { 11,15,  1 }, /* CG */
        { 12,14,  2 }, /* GA */
        { 13,17, -1 }, /* GT */
        { 14,15, -1 }, /* GC */
        { 15,16,  0 }, /* GG */
    };

    for (size_t i = 0; i < sizeof(expected_pairs) / sizeof(expected_pairs[0]); i++) {
        TEST("pair sumValue matches dataset", M3_PAIR_MATRIX[expected_pairs[i].idx].sum_value == expected_pairs[i].sum_value);
        TEST("pair differenceValue matches dataset", M3_PAIR_MATRIX[expected_pairs[i].idx].difference_value == expected_pairs[i].difference_value);
    }

    /* Homogeneous pairs: differenceValue=0, shared across all 3 matrices */
    TEST("AA sumValue=12", M3_PAIR_MATRIX[0].sum_value == 12);
    TEST("TT sumValue=18", M3_PAIR_MATRIX[5].sum_value == 18);
    TEST("CC sumValue=14", M3_PAIR_MATRIX[10].sum_value == 14);
    TEST("GG sumValue=16", M3_PAIR_MATRIX[15].sum_value == 16);
    TEST("AA differenceValue=0", M3_PAIR_MATRIX[0].difference_value == 0);
    TEST("TT differenceValue=0", M3_PAIR_MATRIX[5].difference_value == 0);
    TEST("CC differenceValue=0", M3_PAIR_MATRIX[10].difference_value == 0);
    TEST("GG differenceValue=0", M3_PAIR_MATRIX[15].difference_value == 0);

    /* Matrix 1 (Watson-Crick): all sumValue=15 */
    TEST("AT sumValue=15", M3_PAIR_MATRIX[1].sum_value == 15);
    TEST("TA sumValue=15", M3_PAIR_MATRIX[4].sum_value == 15);
    TEST("CG sumValue=15", M3_PAIR_MATRIX[14].sum_value == 15);
    TEST("GC sumValue=15", M3_PAIR_MATRIX[11].sum_value == 15);

    /* Watson-Crick differenceValue symmetry: AT = -TA */
    TEST("AT/TA differenceValue antisymmetric", M3_PAIR_MATRIX[1].difference_value == -M3_PAIR_MATRIX[4].difference_value);
    TEST("CG/GC differenceValue antisymmetric", M3_PAIR_MATRIX[14].difference_value == -M3_PAIR_MATRIX[11].difference_value);

    /* Matrix 2 (Cross-complementary): dataset uses class-stable differenceValues */
    TEST("AG sumValue=14", M3_PAIR_MATRIX[3].sum_value == 14);
    TEST("GA sumValue=14", M3_PAIR_MATRIX[12].sum_value == 14);
    TEST("TC sumValue=16", M3_PAIR_MATRIX[6].sum_value == 16);
    TEST("CT sumValue=16", M3_PAIR_MATRIX[9].sum_value == 16);
    TEST("AG differenceValue=+2", M3_PAIR_MATRIX[3].difference_value == 2);
    TEST("GA differenceValue=+2", M3_PAIR_MATRIX[12].difference_value == 2);
    TEST("TC differenceValue=-2", M3_PAIR_MATRIX[6].difference_value == -2);
    TEST("CT differenceValue=-2", M3_PAIR_MATRIX[9].difference_value == -2);

    /* Matrix 3 (Cross-diagonal): AC/CA sumValue=13, TG/GT sumValue=17 */
    TEST("AC sumValue=13", M3_PAIR_MATRIX[2].sum_value == 13);
    TEST("CA sumValue=13", M3_PAIR_MATRIX[8].sum_value == 13);
    TEST("TG sumValue=17", M3_PAIR_MATRIX[7].sum_value == 17);
    TEST("GT sumValue=17", M3_PAIR_MATRIX[13].sum_value == 17);

    /* TT is MAX sumValue (18) */
    for (int i = 0; i < 16; i++) {
        TEST("TT is max sumValue", M3_PAIR_MATRIX[i].sum_value <= 18);
    }
    /* AA is MIN sumValue (12) */
    for (int i = 0; i < 16; i++) {
        TEST("AA is min sumValue", M3_PAIR_MATRIX[i].sum_value >= 12);
    }
}

/* ===================================================================
 * FR 2.3.3: Rotational State
 * =================================================================== */

static void test_rotational_state(void) {
    /* AA + TT = (12+18, 0+0) = (30, 0) */
    Rotational_State rs = compute_rotational_state(0, 5);
    TEST("RS(AA,TT) total sumValue=30", rs.total_sum_value == 30);
    TEST("RS(AA,TT) total differenceValue=0", rs.total_difference_value == 0);

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
 * Quaternion overlay support
 * =================================================================== */

static void test_quaternion_overlay_foundations(void) {
    TEST("matrix enum count = 3", M3_MATRIX_COUNT == 3);
    TEST("complementary matrix maps A->T", M3_MATRIX_PAIR[M3_MATRIX_COMPLEMENTARY][M3_NUC_A] == M3_NUC_T);
    TEST("moving/resting matrix maps A->G", M3_MATRIX_PAIR[M3_MATRIX_MOVING_RESTING][M3_NUC_A] == M3_NUC_G);
    TEST("same-quality matrix maps A->C", M3_MATRIX_PAIR[M3_MATRIX_SAME_QUALITY][M3_NUC_A] == M3_NUC_C);
    TEST("matrix i axis", approxf(M3_MATRIX_QUATERNION_AXIS[M3_MATRIX_COMPLEMENTARY].x, 1.0f));
    TEST("matrix j axis", approxf(M3_MATRIX_QUATERNION_AXIS[M3_MATRIX_MOVING_RESTING].y, 1.0f));
    TEST("matrix k axis", approxf(M3_MATRIX_QUATERNION_AXIS[M3_MATRIX_SAME_QUALITY].z, 1.0f));
}

static void test_codon_quaternions(void) {
    uint8_t aaa = encode_codon(M3_NUC_A, M3_NUC_A, M3_NUC_A);
    Quaternion q = m3_quat_from_codon(aaa);
    TEST("AAA quaternion sum on w", approxf(q.w, 18.0f));
    TEST("AAA quaternion diff on x", approxf(q.x, 0.0f));
    TEST("AAA quaternion mod on z", approxf(q.z, 0.0f));

    Quaternion rot = m3_quat_codon_state(aaa, 2u);
    TEST("rotated quaternion preserves norm", approxf(quat_norm_sq(rot), quat_norm_sq(q)));

    uint8_t state = m3_quat_active_state(quat_from_ring_pos(3u), aaa);
    TEST("active state is in range", state < 8u);
}

static void test_prime_attractors_and_eval_mapping(void) {
    uint8_t aca = encode_codon(M3_NUC_A, M3_NUC_C, M3_NUC_A);
    uint8_t act = encode_codon(M3_NUC_A, M3_NUC_C, M3_NUC_T);
    uint8_t acg = encode_codon(M3_NUC_A, M3_NUC_C, M3_NUC_G);
    TEST("ACA+ACT hits prime attractor", m3_is_prime_attractor(aca, act));
    TEST("ACG+ACT hits prime attractor", m3_is_prime_attractor(acg, act));

    M3_CodonEvaluation eval = evaluate_codon(encode_codon(M3_NUC_A, M3_NUC_T, M3_NUC_G));
    Quaternion q = m3_eval_to_quat(eval);
    M3_CodonEvaluation roundtrip = m3_quat_to_eval(q);
    TEST("eval->quat->eval pp", roundtrip.pp == eval.pp);
    TEST("eval->quat->eval mm", roundtrip.mm == eval.mm);
    TEST("eval->quat->eval mp", roundtrip.mp == eval.mp);
    TEST("eval->quat->eval pm", roundtrip.pm == eval.pm);

    {
        int8_t pp, nn, np, pn;
        m3_compute_charges(encode_codon(M3_NUC_A, M3_NUC_T, M3_NUC_G), &pp, &nn, &np, &pn);
        TEST("evaluate_codon pp matches inner charge", eval.pp == pp);
        TEST("evaluate_codon mm matches inner charge", eval.mm == nn);
        TEST("evaluate_codon mp matches inner charge", eval.mp == np);
        TEST("evaluate_codon pm matches inner charge", eval.pm == pn);
    }
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
    TEST("clock(0) torus=0", cs.tick12 == 0);
    TEST("clock(0) decan=0", cs.m2_decan_phase == 0);
    TEST("clock(0) hex=0", cs.m3_hexagram_id == 0);
    TEST("clock(0) explicate", !cs.is_implicate_phase);

    cs = read_cosmic_clock(360);
    TEST("clock(360) implicate", cs.is_implicate_phase);

    cs = read_cosmic_clock(180);
    TEST("clock(180) torus=6", cs.tick12 == 6);
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
 * FR 2.3.14 / dataset rotational protocol
 * =================================================================== */

static void test_rotational_protocol_generation(void) {
    M3_Rotational_Generation states[M3_ROTATIONAL_TABLE_ENTRIES];
    uint8_t codon = encode_codon(M3_NUC_A, M3_NUC_T, M3_NUC_G);
    size_t count = m3_generate_rotational_states(codon, states);

    TEST("ATG raw rotational count = 8", count == 8u);

    for (size_t i = 0; i < 4; i++) {
        TEST("ATG negative pair1 fixed to first pair",
             states[i].pair1_idx == pair_idx(M3_NUC_A, M3_NUC_T));
        TEST("ATG negative polarity bucket",
             states[i].polarity == M3_ROTATIONAL_NEGATIVE);
    }

    TEST("ATG neg[0] pair2 = AG", states[0].pair2_idx == pair_idx(M3_NUC_A, M3_NUC_G));
    TEST("ATG neg[1] pair2 = TG", states[1].pair2_idx == pair_idx(M3_NUC_T, M3_NUC_G));
    TEST("ATG neg[2] pair2 = CG", states[2].pair2_idx == pair_idx(M3_NUC_C, M3_NUC_G));
    TEST("ATG neg[3] pair2 = GG", states[3].pair2_idx == pair_idx(M3_NUC_G, M3_NUC_G));

    for (size_t i = 4; i < 8; i++) {
        TEST("ATG positive pair2 fixed to last pair",
             states[i].pair2_idx == pair_idx(M3_NUC_T, M3_NUC_G));
        TEST("ATG positive polarity bucket",
             states[i].polarity == M3_ROTATIONAL_POSITIVE);
    }

    TEST("ATG pos[0] pair1 = AA", states[4].pair1_idx == pair_idx(M3_NUC_A, M3_NUC_A));
    TEST("ATG pos[1] pair1 = AT", states[5].pair1_idx == pair_idx(M3_NUC_A, M3_NUC_T));
    TEST("ATG pos[2] pair1 = AC", states[6].pair1_idx == pair_idx(M3_NUC_A, M3_NUC_C));
    TEST("ATG pos[3] pair1 = AG", states[7].pair1_idx == pair_idx(M3_NUC_A, M3_NUC_G));

    TEST("ATG negative value AG = 17", states[0].rotational_value == 17);
    TEST("ATG negative value TG = 16", states[1].rotational_value == 16);
    TEST("ATG positive value AA = 17", states[4].rotational_value == 17);
    TEST("ATG positive value AT = 14", states[5].rotational_value == 14);

    TEST("ATG lowest value ranks first", states[5].rotation_slot == 0u && states[5].rotation_degrees == 0u);
    TEST("ATG negative ties rank before positive tie", states[1].rotation_slot < states[6].rotation_slot && states[2].rotation_slot < states[6].rotation_slot);
    TEST("ATG highest value ranks last", states[7].rotation_slot == 7u && states[7].rotation_degrees == 315u);
}

static void test_rotational_profiles(void) {
    const M3_Rotational_Profile* aaa = m3_get_rotational_profile(encode_codon(M3_NUC_A, M3_NUC_A, M3_NUC_A));
    const M3_Rotational_Profile* ata = m3_get_rotational_profile(encode_codon(M3_NUC_A, M3_NUC_T, M3_NUC_A));
    const M3_Rotational_Profile* atg = m3_get_rotational_profile(encode_codon(M3_NUC_A, M3_NUC_T, M3_NUC_G));
    const M3_Rotational_Profile* acg = m3_get_rotational_profile(encode_codon(M3_NUC_A, M3_NUC_C, M3_NUC_G));
    const M3_Rotational_Profile* agc = m3_get_rotational_profile(encode_codon(M3_NUC_A, M3_NUC_G, M3_NUC_C));
    const M3_Rotational_Profile* tct = m3_get_rotational_profile(encode_codon(M3_NUC_T, M3_NUC_C, M3_NUC_T));

    TEST("AAA profile present", aaa != NULL);
    TEST("AAA state count = 7", aaa->state_count == 7u);
    TEST("AAA type = non-dual initiated", aaa->state_type == M3_ROTATIONAL_NON_DUAL_INITIATED);
    TEST("AAA anchor pair = AA+AA",
         aaa->anchor_pair_a == pair_idx(M3_NUC_A, M3_NUC_A) &&
         aaa->anchor_pair_b == pair_idx(M3_NUC_A, M3_NUC_A));
    TEST("AAA has no paired codon", aaa->paired_codon == M3_ROTATIONAL_NO_PAIRING);

    TEST("ATA state count = 7", ata->state_count == 7u);
    TEST("ATA anchor pair = AT+TA",
         ata->anchor_pair_a == pair_idx(M3_NUC_A, M3_NUC_T) &&
         ata->anchor_pair_b == pair_idx(M3_NUC_T, M3_NUC_A));

    TEST("ATG state count = 8", atg->state_count == 8u);
    TEST("ATG type = full rotational", atg->state_type == M3_ROTATIONAL_FULL_ROTATIONAL);
    TEST("ATG has no non-dual anchor",
         atg->anchor_pair_a == M3_ROTATIONAL_NO_PAIR &&
         atg->anchor_pair_b == M3_ROTATIONAL_NO_PAIR);

    TEST("ACG paired with AGC", acg->paired_codon == encode_codon(M3_NUC_A, M3_NUC_G, M3_NUC_C));
    TEST("AGC paired with ACG", agc->paired_codon == encode_codon(M3_NUC_A, M3_NUC_C, M3_NUC_G));

    /* TCT is imperfect palindromic (T_C_T, XyX): non-dual, 7 states */
    TEST("TCT is non-dual initiated", tct->state_type == M3_ROTATIONAL_NON_DUAL_INITIATED);
    TEST("TCT state count = 7", tct->state_count == 7u);

    {
        int seven_count = 0;
        int eight_count = 0;
        int paired_count = 0;
        int anchored_count = 0;

        for (int codon = 0; codon < 64; codon++) {
            const M3_Rotational_Profile* profile = m3_get_rotational_profile((uint8_t)codon);
            TEST("profile lookup never null", profile != NULL);
            if (profile->state_count == 7u) seven_count++;
            if (profile->state_count == 8u) eight_count++;
            if (profile->paired_codon != M3_ROTATIONAL_NO_PAIRING) paired_count++;
            if (profile->anchor_pair_a != M3_ROTATIONAL_NO_PAIR) anchored_count++;

            TEST("profile state count is 7 or 8",
                 profile->state_count == 7u || profile->state_count == 8u);
            TEST("profile anchored iff non-dual initiated",
                 (profile->state_type == M3_ROTATIONAL_NON_DUAL_INITIATED) ==
                 (profile->anchor_pair_a != M3_ROTATIONAL_NO_PAIR));
        }

        TEST("dataset seven-state reflections = 40", seven_count == 40);
        TEST("dataset eight-state reflections = 24", eight_count == 24);
        TEST("dataset paired codons = 16", paired_count == 16);
        TEST("dataset non-dual anchors = 40", anchored_count == 40);
    }
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

    uint64_t functional = M3_RNA_FUNCTIONAL_MASK;
    uint64_t dark = M3_RNA_DARK_MASK;
    int functional_count = 0;
    int dark_count = 0;
    for (int codon = 0; codon < 64; codon++) {
        functional_count += (functional >> codon) & 1ULL;
        dark_count += (dark >> codon) & 1ULL;
        TEST("RNA mask agrees with T-presence",
             (((functional >> codon) & 1ULL) != 0ULL) == m3_codon_is_rna_capable((uint8_t)codon));
    }
    TEST("RNA functional count = 37", functional_count == 37);
    TEST("RNA dark count = 27", dark_count == 27);
    TEST("RNA masks partition codon space", (functional & dark) == 0ULL && (functional | dark) == 0xFFFFFFFFFFFFFFFFULL);
}

/* ===================================================================
 * FR 2.3.16: Tarot-Codon LUT
 * =================================================================== */

static void test_tarot(void) {
#define COD(a,b,c) ((uint8_t)((M3_NUC_##a << 4) | (M3_NUC_##b << 2) | M3_NUC_##c))
    /* Dataset-backed codon reflections from Mahamaya node + relation data:
     * mahamaya-deep/nodes-full-detail.json and relations_mahamaya.json */
    static const uint8_t expected_codons[4][14][2] = {
        /* Cups */
        {
            { COD(A,A,A), M3_TAROT_SINGLE_CODON },
            { COD(A,A,G), M3_TAROT_SINGLE_CODON },
            { COD(A,A,T), M3_TAROT_SINGLE_CODON },
            { COD(A,C,C), M3_TAROT_SINGLE_CODON },
            { COD(A,T,G), M3_TAROT_SINGLE_CODON },
            { COD(A,G,A), M3_TAROT_SINGLE_CODON },
            { COD(A,G,T), M3_TAROT_SINGLE_CODON },
            { COD(A,G,G), M3_TAROT_SINGLE_CODON },
            { COD(A,T,T), M3_TAROT_SINGLE_CODON },
            { COD(A,T,A), M3_TAROT_SINGLE_CODON },
            { COD(A,C,A), M3_TAROT_SINGLE_CODON },
            { COD(A,C,G), COD(A,G,C) },
            { COD(A,A,C), M3_TAROT_SINGLE_CODON },
            { COD(A,C,T), COD(A,T,C) },
        },
        /* Wands */
        {
            { COD(T,T,T), M3_TAROT_SINGLE_CODON },
            { COD(T,T,A), M3_TAROT_SINGLE_CODON },
            { COD(T,T,C), M3_TAROT_SINGLE_CODON },
            { COD(T,G,G), M3_TAROT_SINGLE_CODON },
            { COD(T,A,C), M3_TAROT_SINGLE_CODON },
            { COD(T,C,A), M3_TAROT_SINGLE_CODON },
            { COD(T,C,C), M3_TAROT_SINGLE_CODON },
            { COD(T,A,A), M3_TAROT_SINGLE_CODON },
            { COD(T,C,T), M3_TAROT_SINGLE_CODON },
            { COD(T,A,T), M3_TAROT_SINGLE_CODON },
            { COD(T,A,G), COD(T,G,A) },
            { COD(T,G,T), M3_TAROT_SINGLE_CODON },
            { COD(T,C,G), COD(T,G,C) },
            { COD(T,T,G), M3_TAROT_SINGLE_CODON },
        },
        /* Pentacles */
        {
            { COD(C,C,C), M3_TAROT_SINGLE_CODON },
            { COD(C,C,G), M3_TAROT_SINGLE_CODON },
            { COD(C,C,T), M3_TAROT_SINGLE_CODON },
            { COD(C,A,A), M3_TAROT_SINGLE_CODON },
            { COD(C,G,C), M3_TAROT_SINGLE_CODON },
            { COD(C,G,G), M3_TAROT_SINGLE_CODON },
            { COD(C,G,T), M3_TAROT_SINGLE_CODON },
            { COD(C,T,G), M3_TAROT_SINGLE_CODON },
            { COD(C,T,T), M3_TAROT_SINGLE_CODON },
            { COD(C,T,C), M3_TAROT_SINGLE_CODON },
            { COD(C,C,A), M3_TAROT_SINGLE_CODON },
            { COD(C,A,G), COD(C,G,A) },
            { COD(C,A,C), M3_TAROT_SINGLE_CODON },
            { COD(C,A,T), COD(C,T,A) },
        },
        /* Swords */
        {
            { COD(G,G,G), M3_TAROT_SINGLE_CODON },
            { COD(G,G,A), M3_TAROT_SINGLE_CODON },
            { COD(G,G,C), M3_TAROT_SINGLE_CODON },
            { COD(G,T,T), M3_TAROT_SINGLE_CODON },
            { COD(G,A,C), M3_TAROT_SINGLE_CODON },
            { COD(G,A,G), M3_TAROT_SINGLE_CODON },
            { COD(G,C,A), M3_TAROT_SINGLE_CODON },
            { COD(G,C,C), M3_TAROT_SINGLE_CODON },
            { COD(G,A,A), M3_TAROT_SINGLE_CODON },
            { COD(G,C,G), M3_TAROT_SINGLE_CODON },
            { COD(G,C,T), COD(G,T,C) },
            { COD(G,G,T), M3_TAROT_SINGLE_CODON },
            { COD(G,A,T), COD(G,T,A) },
            { COD(G,T,G), M3_TAROT_SINGLE_CODON },
        },
    };

    /* All 64 codons must appear exactly once across the 4 suits × 14 cards */
    uint8_t codon_count[64] = {0};
    for (int s = 0; s < 4; s++) {
        for (int r = 0; r < 14; r++) {
            const M3_TarotCodonEntry* e = &M3_TAROT_CODON_MAP[s][r];
            TEST("tarot suit matches", e->suit == (uint8_t)s);
            TEST("dataset primary codon match", e->codon_a == expected_codons[s][r][0]);
            TEST("dataset secondary codon match", e->codon_b == expected_codons[s][r][1]);
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

    TEST("tarot quaternion table has 80 entries", M3_TAROT_QUATERNION_COUNT == 80u);
    TEST("major arcana count = 22", M3_MAJOR_ARCANA_COUNT == 22u);
    TEST("minor arcana count = 56", M3_MINOR_ARCANA_COUNT == 56u);
    TEST("major 0 maps to chromosome pair 1", M3_MAJOR_ARCANA[0].chromosome_pair == 1u);
    TEST("major 21 maps to chromosome pair 22", M3_MAJOR_ARCANA[21].chromosome_pair == 22u);
    TEST("major 0 maps to amino acid 0", M3_MAJOR_ARCANA[0].amino_acid_index == 0u);
    TEST("major 21 maps to amino acid 21", M3_MAJOR_ARCANA[21].amino_acid_index == 21u);
    TEST("tarot translation stays in codon space", m3_tarot_translate(0u, encode_codon(0,0,0), 1) < 64u);
    TEST("tarot major translation stays in codon space", m3_tarot_translate(56u, encode_codon(0,1,3), 1) < 64u);
#undef COD
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
    TEST("non_dual_mask 40 bits", bitcount == 40);

    /* Wrong position should fail */
    Holographic_Coordinate* wrong = arena_alloc(&arena);
    wrong->ql_position = 0;
    TEST("m3_init rejects pos!=3", m3_init(&arena, wrong) == NULL);

    Coordinate_Arena m2_arena;
    TEST("m2 arena_init", arena_init(&m2_arena, 64) == 0);
    Holographic_Coordinate* m2_hc = arena_alloc(&m2_arena);
    m2_hc->ql_position = 2;
    m2_hc->family = FAMILY_NONE;
    M2_Root* m2 = m2_init(&m2_arena, m2_hc);
    TEST("m2_init not null", m2 != NULL);

    M3_DET_Overlay_Result overlay = m3_det_with_quaternion(m2, root, 3u, M3_MATRIX_COMPLEMENTARY);
    TEST("overlay torus tick preserved", overlay.torus_tick == 3u);
    TEST("overlay active mask nonzero", overlay.active_mask != 0ULL);
    TEST("overlay composed quaternion nonzero", !approxf(quat_norm_sq(overlay.composed_q), 0.0f));

    for (int codon = 0; codon < 64; codon++) {
        if ((overlay.active_mask >> codon) & 1ULL) {
            TEST("active codon state bucketed", overlay.codon_states[codon] < 8u);
        }
    }

    m2_teardown(m2);
    arena_destroy(&m2_arena);

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
    test_quaternion_overlay_foundations();
    test_su2();
    test_epogdoon();
    test_cosmic_clock();
    test_rotational_composition();
    test_rotational_protocol_generation();
    test_rotational_profiles();
    test_codon_quaternions();
    test_prime_attractors_and_eval_mapping();
    test_rna();
    test_tarot();
    test_m3_api();
    test_det_coverage();

    printf("\n=== Results: %d passed, %d failed (of %d) ===\n",
           pass_count, fail_count, pass_count + fail_count);

    return fail_count > 0 ? 1 : 0;
}
