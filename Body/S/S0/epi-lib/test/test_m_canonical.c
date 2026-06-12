/**
 * test_m_canonical.c — L2' canonical element-ID harmonisation suite
 *
 * Verifies:
 *   1. Canonical IDs match the L2' inner-position ordering.
 *   2. OPERATIVE_QUARTET_MASK selects exactly {EARTH,WATER,AIR,FIRE}.
 *   3. Every conversion helper round-trips (canonical→legacy→canonical == id).
 *   4. Nucleotide identity (A→Water, T→Fire, C→Earth, G→Air) under new IDs.
 *
 * Header-only: links nothing from the library.
 * Build: clang -std=c11 -I include test/test_m_canonical.c -o test_m_canonical
 */

#include <stdio.h>
#include "m_canonical.h"
#include "m3.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; } \
    else { fail_count++; fprintf(stderr, "FAIL: %s\n", name); } \
} while (0)

int main(void) {
    printf("=== m_canonical — L2' Element-ID Harmonisation ===\n");

    /* 1. Canonical IDs */
    TEST("AETHER=0", ELEMENT_AETHER == 0);
    TEST("EARTH=1",  ELEMENT_EARTH  == 1);
    TEST("WATER=2",  ELEMENT_WATER  == 2);
    TEST("AIR=3",    ELEMENT_AIR    == 3);
    TEST("FIRE=4",   ELEMENT_FIRE   == 4);
    TEST("SALT=5",   ELEMENT_SALT   == 5);

    /* 2. Operative quartet mask = bits 1-4 */
    TEST("mask value", OPERATIVE_QUARTET_MASK == 0x1Eu);
    TEST("AETHER not operative", !m_canonical_is_operative(ELEMENT_AETHER));
    TEST("EARTH operative",  m_canonical_is_operative(ELEMENT_EARTH));
    TEST("WATER operative",  m_canonical_is_operative(ELEMENT_WATER));
    TEST("AIR operative",    m_canonical_is_operative(ELEMENT_AIR));
    TEST("FIRE operative",   m_canonical_is_operative(ELEMENT_FIRE));
    TEST("SALT not operative", !m_canonical_is_operative(ELEMENT_SALT));

    /* 3a. m4.h legacy round-trip over {WATER,FIRE,EARTH,AIR} */
    {
        const uint8_t canon[4] = {ELEMENT_WATER, ELEMENT_FIRE, ELEMENT_EARTH, ELEMENT_AIR};
        for (int i = 0; i < 4; i++) {
            uint8_t c = canon[i];
            uint8_t legacy = m_canonical_to_m4_h_legacy(c);
            TEST("m4_h round-trip", m_canonical_from_m4_h_legacy(legacy) == c);
        }
        /* legacy domain 0-3 round-trips too */
        for (uint8_t l = 0; l < 4; l++) {
            uint8_t c = m_canonical_from_m4_h_legacy(l);
            TEST("m4_h legacy<-", m_canonical_to_m4_h_legacy(c) == l);
        }
        /* explicit anchors */
        TEST("m4_h legacy WATER(0)->2", m_canonical_from_m4_h_legacy(0) == ELEMENT_WATER);
        TEST("m4_h legacy FIRE(1)->4",  m_canonical_from_m4_h_legacy(1) == ELEMENT_FIRE);
        TEST("m4_h legacy EARTH(2)->1", m_canonical_from_m4_h_legacy(2) == ELEMENT_EARTH);
        TEST("m4_h legacy AIR(3)->3",   m_canonical_from_m4_h_legacy(3) == ELEMENT_AIR);
    }

    /* 3b. medicine.rs legacy round-trip over {AETHER,EARTH,WATER,AIR,FIRE} */
    {
        const uint8_t canon[5] = {ELEMENT_AETHER, ELEMENT_EARTH, ELEMENT_WATER, ELEMENT_AIR, ELEMENT_FIRE};
        for (int i = 0; i < 5; i++) {
            uint8_t c = canon[i];
            uint8_t legacy = m_canonical_to_medicine_rs_legacy(c);
            TEST("medicine_rs round-trip", m_canonical_from_medicine_rs_legacy(legacy) == c);
        }
        for (uint8_t l = 0; l < 5; l++) {
            uint8_t c = m_canonical_from_medicine_rs_legacy(l);
            TEST("medicine_rs legacy<-", m_canonical_to_medicine_rs_legacy(c) == l);
        }
        /* medicine.rs legacy: AKASHA=0,AIR=1,FIRE=2,WATER=3,EARTH=4 */
        TEST("med AKASHA(0)->AETHER", m_canonical_from_medicine_rs_legacy(0) == ELEMENT_AETHER);
        TEST("med AIR(1)->AIR",       m_canonical_from_medicine_rs_legacy(1) == ELEMENT_AIR);
        TEST("med FIRE(2)->FIRE",     m_canonical_from_medicine_rs_legacy(2) == ELEMENT_FIRE);
        TEST("med WATER(3)->WATER",   m_canonical_from_medicine_rs_legacy(3) == ELEMENT_WATER);
        TEST("med EARTH(4)->EARTH",   m_canonical_from_medicine_rs_legacy(4) == ELEMENT_EARTH);
    }

    /* 3c. m2-3 branch round-trip — full bijection over 0-5 */
    {
        for (uint8_t c = 0; c < 6; c++) {
            uint8_t branch = m_canonical_to_m2_3_branch(c);
            TEST("m2_3 round-trip", m_canonical_from_m2_3_branch(branch) == c);
        }
        for (uint8_t b = 0; b < 6; b++) {
            uint8_t c = m_canonical_from_m2_3_branch(b);
            TEST("m2_3 branch<-", m_canonical_to_m2_3_branch(c) == b);
        }
        /* branch convention: 1=Fire, 2=Earth, 3=Air, 4=Water */
        TEST("branch 1->FIRE",  m_canonical_from_m2_3_branch(1) == ELEMENT_FIRE);
        TEST("branch 2->EARTH", m_canonical_from_m2_3_branch(2) == ELEMENT_EARTH);
        TEST("branch 3->AIR",   m_canonical_from_m2_3_branch(3) == ELEMENT_AIR);
        TEST("branch 4->WATER", m_canonical_from_m2_3_branch(4) == ELEMENT_WATER);
    }

    /* 4. Nucleotide identity under new IDs */
    TEST("A -> WATER", m4_nuc_to_elem(M3_NUC_A) == ELEMENT_WATER);
    TEST("T -> FIRE",  m4_nuc_to_elem(M3_NUC_T) == ELEMENT_FIRE);
    TEST("C -> EARTH", m4_nuc_to_elem(M3_NUC_C) == ELEMENT_EARTH);
    TEST("G -> AIR",   m4_nuc_to_elem(M3_NUC_G) == ELEMENT_AIR);

    printf("\n=== Results: %d passed, %d failed (of %d) ===\n",
           pass_count, fail_count, pass_count + fail_count);
    return fail_count == 0 ? 0 : 1;
}
