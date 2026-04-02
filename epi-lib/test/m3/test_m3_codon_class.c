/**
 * test_m3_codon_class.c — Codon Classification Verification Suite
 *
 * Tests FR 2.3.17b: Codon_Class system, M3_CODON_CLASS[64] LUT,
 * rotational state counts, palindromic properties, boolean accessors.
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
 * Class distribution counts across M3_CODON_CLASS[64]
 * =================================================================== */

static void test_class_distribution(void) {
    unsigned perfect = 0, imperfect = 0, non_pal_nd = 0, dual = 0;

    for (int i = 0; i < 64; i++) {
        switch (M3_CODON_CLASS[i].cls) {
            case CODON_PERFECT_PALINDROMIC:     perfect++;     break;
            case CODON_IMPERFECT_PALINDROMIC:   imperfect++;   break;
            case CODON_NON_PALINDROMIC_NONDUAL: non_pal_nd++;  break;
            case CODON_DUAL:                    dual++;        break;
        }
    }

    TEST("4 perfect palindromic codons",     perfect    == 4);
    TEST("12 imperfect palindromic codons",  imperfect  == 12);
    TEST("24 non-palindromic nondual codons", non_pal_nd == 24);
    TEST("24 dual codons",                   dual       == 24);
    TEST("total = 64",                       perfect + imperfect + non_pal_nd + dual == 64);
}


/* ===================================================================
 * Total rotational states = 472 (40x7 + 24x8)
 * =================================================================== */

static void test_rotational_state_total(void) {
    unsigned total_states = 0;

    for (int i = 0; i < 64; i++) {
        total_states += M3_CODON_CLASS[i].rotational_state_count;
    }

    TEST("total rotational states = 472", total_states == 472);

    /* Also verify nondual codons have 7 states, dual have 8 */
    int all_nondual_7 = 1;
    int all_dual_8 = 1;
    for (int i = 0; i < 64; i++) {
        if (M3_CODON_CLASS[i].cls != CODON_DUAL) {
            if (M3_CODON_CLASS[i].rotational_state_count != 7) all_nondual_7 = 0;
        } else {
            if (M3_CODON_CLASS[i].rotational_state_count != 8) all_dual_8 = 0;
        }
    }
    TEST("all nondual codons have 7 rotational states", all_nondual_7);
    TEST("all dual codons have 8 rotational states", all_dual_8);
}


/* ===================================================================
 * XyX codons (outer==inner) are all palindromic
 * =================================================================== */

static void test_xyx_are_palindromic(void) {
    int all_palindromic = 1;

    for (uint8_t i = 0; i < 64; i++) {
        uint8_t n1 = (i >> 4) & 0x03;
        uint8_t n3 = i & 0x03;
        if (n1 == n3) {
            /* This is an XyX codon — must be palindromic */
            if (!codon_is_palindromic(M3_CODON_CLASS[i].cls)) {
                all_palindromic = 0;
                fprintf(stderr, "  XyX codon 0x%02X not palindromic\n", i);
            }
        }
    }

    TEST("all XyX codons (outer==inner) are palindromic", all_palindromic);

    /* Count XyX codons: should be 16 (4 outers x 4 middles) */
    unsigned xyx_count = 0;
    for (uint8_t i = 0; i < 64; i++) {
        uint8_t n1 = (i >> 4) & 0x03;
        uint8_t n3 = i & 0x03;
        if (n1 == n3) xyx_count++;
    }
    TEST("XyX codon count = 16", xyx_count == 16);
}


/* ===================================================================
 * M3_NONDUAL_CODONS[16] entries are all palindromic (class <= 1)
 * =================================================================== */

static void test_nondual_codons_palindromic(void) {
    int all_palindromic = 1;

    for (int i = 0; i < 16; i++) {
        uint8_t c = M3_NONDUAL_CODONS[i];
        Codon_Class cls = M3_CODON_CLASS[c].cls;
        if (!codon_is_palindromic(cls)) {
            all_palindromic = 0;
            fprintf(stderr, "  M3_NONDUAL_CODONS[%d] = 0x%02X not palindromic (cls=%d)\n",
                    i, c, cls);
        }
    }

    TEST("all M3_NONDUAL_CODONS[16] are palindromic", all_palindromic);

    /* Also verify they are all XyX (outer == inner) */
    int all_xyx = 1;
    for (int i = 0; i < 16; i++) {
        uint8_t c = M3_NONDUAL_CODONS[i];
        if (!is_nondual_codon(c)) {
            all_xyx = 0;
        }
    }
    TEST("all M3_NONDUAL_CODONS[16] pass is_nondual_codon()", all_xyx);
}


/* ===================================================================
 * Boolean accessors
 * =================================================================== */

static void test_boolean_accessors(void) {
    /* CODON_PERFECT_PALINDROMIC = 0 */
    TEST("perfect palindromic is palindromic",
         codon_is_palindromic(CODON_PERFECT_PALINDROMIC));
    TEST("perfect palindromic is perfect",
         codon_is_perfect_palindrome(CODON_PERFECT_PALINDROMIC));
    TEST("perfect palindromic is non-dual",
         codon_is_non_dual(CODON_PERFECT_PALINDROMIC));
    TEST("perfect palindromic is NOT dual",
         !codon_is_dual(CODON_PERFECT_PALINDROMIC));

    /* CODON_IMPERFECT_PALINDROMIC = 1 */
    TEST("imperfect palindromic is palindromic",
         codon_is_palindromic(CODON_IMPERFECT_PALINDROMIC));
    TEST("imperfect palindromic is NOT perfect",
         !codon_is_perfect_palindrome(CODON_IMPERFECT_PALINDROMIC));
    TEST("imperfect palindromic is non-dual",
         codon_is_non_dual(CODON_IMPERFECT_PALINDROMIC));

    /* CODON_NON_PALINDROMIC_NONDUAL = 2 */
    TEST("non-pal nondual is NOT palindromic",
         !codon_is_palindromic(CODON_NON_PALINDROMIC_NONDUAL));
    TEST("non-pal nondual is non-dual",
         codon_is_non_dual(CODON_NON_PALINDROMIC_NONDUAL));
    TEST("non-pal nondual is NOT dual",
         !codon_is_dual(CODON_NON_PALINDROMIC_NONDUAL));

    /* CODON_DUAL = 3 */
    TEST("dual is dual",
         codon_is_dual(CODON_DUAL));
    TEST("dual is NOT non-dual",
         !codon_is_non_dual(CODON_DUAL));
    TEST("dual is NOT palindromic",
         !codon_is_palindromic(CODON_DUAL));
}


/* ===================================================================
 * Anticodon (paired_codon) in range
 * =================================================================== */

static void test_anticodon_in_range(void) {
    int all_in_range = 1;

    for (int i = 0; i < 64; i++) {
        if (M3_CODON_CLASS[i].paired_codon >= 64) {
            all_in_range = 0;
            fprintf(stderr, "  codon %d: anticodon %d out of range\n",
                    i, M3_CODON_CLASS[i].paired_codon);
        }
    }

    TEST("all anticodons in range [0,63]", all_in_range);

    /* Anticodon of anticodon should return to self (involution) */
    int involutive = 1;
    for (int i = 0; i < 64; i++) {
        uint8_t ac = M3_CODON_CLASS[i].paired_codon;
        uint8_t ac_ac = M3_CODON_CLASS[ac].paired_codon;
        if (ac_ac != (uint8_t)i) {
            involutive = 0;
            fprintf(stderr, "  codon %d: anticodon(%d) = %d, expected %d\n",
                    i, ac, ac_ac, i);
        }
    }
    TEST("anticodon is involutive (ac(ac(x)) == x)", involutive);
}


/* ===================================================================
 * Known specific codons
 * =================================================================== */

static void test_known_codons(void) {
    /* AAA = 0x00 = perfect palindromic */
    TEST("AAA (0x00) is perfect palindromic",
         M3_CODON_CLASS[0x00].cls == CODON_PERFECT_PALINDROMIC);
    /* TTT = 0x15 = perfect palindromic */
    TEST("TTT (0x15) is perfect palindromic",
         M3_CODON_CLASS[0x15].cls == CODON_PERFECT_PALINDROMIC);
    /* CCC = 0x2A = perfect palindromic */
    TEST("CCC (0x2A) is perfect palindromic",
         M3_CODON_CLASS[0x2A].cls == CODON_PERFECT_PALINDROMIC);
    /* GGG = 0x3F = perfect palindromic */
    TEST("GGG (0x3F) is perfect palindromic",
         M3_CODON_CLASS[0x3F].cls == CODON_PERFECT_PALINDROMIC);

    /* ATA = 0x04 = imperfect palindromic (XyX, X!=Y) */
    TEST("ATA (0x04) is imperfect palindromic",
         M3_CODON_CLASS[0x04].cls == CODON_IMPERFECT_PALINDROMIC);
}


int main(void) {
    /* Must initialize the LUT before testing */
    m3_init_codon_class_lut();

    test_class_distribution();
    test_rotational_state_total();
    test_xyx_are_palindromic();
    test_nondual_codons_palindromic();
    test_boolean_accessors();
    test_anticodon_in_range();
    test_known_codons();

    printf("\n=== test_m3_codon_class: %d passed, %d failed ===\n",
           pass_count, fail_count);
    return fail_count > 0 ? 1 : 0;
}
