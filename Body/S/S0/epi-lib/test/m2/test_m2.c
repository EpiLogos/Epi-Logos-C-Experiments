/**
 * test_m2.c — M2 (Parashakti) Verification Suite
 *
 * 11 tests covering:
 *   1. 72-Invariant (union size)
 *   2. Union cell sizes (all == 1 byte)
 *   3. Planet data (10 entries, identity pair, Cousto freqs)
 *   4. Elemental_Signature round-trip (pack/unpack)
 *   5. Routing mask popcount (internal==36, projective==64, no overlap)
 *   6. DET coherence (popcount(OR of all 72) == 64)
 *   7. Shem bounds (choir<8, position<9, decan_link<72)
 *   8. MEF accessor spot-checks
 *   9. MEF lens identity (canonical names from canvas)
 *  10. Epogdoon (compress(72)==64, expand(64)==72)
 *  11. m2_init/teardown lifecycle
 */

#include "m2.h"
#include "arena.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

/* Portable popcount for uint64_t */
static int popcnt64(uint64_t x) {
    int c = 0;
    while (x) { c += (int)(x & 1); x >>= 1; }
    return c;
}

/* Count set bits across a Routing_Mask_128 */
static int popcnt128(Routing_Mask_128 m) {
    return popcnt64(m.low_64) + popcnt64(m.high_64);
}


int main(void) {
    printf("=== M2 (Parashakti) Test Suite ===\n");

    /* T1: 72-Invariant */
    TEST(seventy_two_invariant) {
        assert(sizeof(M2_Vibrational_72_Space) == 72);
        assert(sizeof(M2_ARCHETYPES) == 72);
    } PASS;

    /* T2: Union cell sizes — all views use 1-byte cells */
    TEST(union_cell_sizes) {
        assert(sizeof(MEF_Condition) == 1);
        assert(sizeof(Tattva_Entry) == 1);
        assert(sizeof(Decan_Face) == 1);
        assert(sizeof(Shem_Name) == 1);
    } PASS;

    /* T3: Planet data — canonical mod-10 order, all freqs non-zero
     * Canonical order: Sun=0,Moon=1,Mercury=2,Venus=3,Mars=4,
     *                  Jupiter=5,Saturn=6,Uranus=7,Neptune=8,Pluto=9
     * Source: 00-canonical-invariants.md §2 */
    TEST(planet_data) {
        /* Canonical LUT order */
        assert(M2_PLANET_LUT[0].id == PLANET_SUN);
        assert(M2_PLANET_LUT[1].id == PLANET_MOON);
        assert(M2_PLANET_LUT[4].id == PLANET_MARS);
        assert(M2_PLANET_LUT[7].id == PLANET_URANUS);
        assert(M2_PLANET_LUT[9].id == PLANET_PLUTO);
        /* Personal/transpersonal groupings */
        assert(PLANET_IS_PERSONAL(M2_PLANET_LUT[0].id));   /* Sun */
        assert(PLANET_IS_PERSONAL(M2_PLANET_LUT[6].id));   /* Saturn */
        assert(!PLANET_IS_PERSONAL(M2_PLANET_LUT[7].id));  /* Uranus — transpersonal */
        assert(PLANET_IS_TRANSPERSONAL(M2_PLANET_LUT[7].id)); /* Uranus */
        /* All Cousto frequencies non-zero */
        for (int i = 0; i < 10; i++) {
            assert(M2_PLANET_LUT[i].cousto_freq > 0);
            assert(M2_PLANET_LUT[i].id == (uint8_t)i);
        }
        /* Key frequency checks */
        assert(M2_PLANET_LUT[PLANET_SUN].cousto_freq == 126);   /* 126 Hz, DR=9 */
        assert(M2_PLANET_LUT[PLANET_MOON].cousto_freq == 210);  /* 210 Hz, DR=3 */
        assert(M2_PLANET_LUT[PLANET_URANUS].cousto_freq == 207); /* 207 Hz, DR=9 */
        /* Digital root checks */
        assert(M2_PLANET_LUT[PLANET_SUN].digital_root == 9);
        assert(M2_PLANET_LUT[PLANET_MOON].digital_root == 3);
    } PASS;

    /* T4: Elemental_Signature round-trip */
    TEST(elem_sig_roundtrip) {
        for (uint8_t elem = 0; elem < 5; elem++) {
            for (uint8_t chakra = 0; chakra < 8; chakra++) {
                for (uint8_t phase = 0; phase < 4; phase++) {
                    Elemental_Signature sig = ELEM_SIG_PACK(elem, chakra, phase);
                    assert(ELEM_SIG_GET_ELEMENT(sig) == elem);
                    assert(ELEM_SIG_GET_CHAKRA(sig) == chakra);
                    assert(ELEM_SIG_GET_PHASE(sig) == phase);
                }
            }
        }
    } PASS;

    /* T5: Routing mask popcount */
    TEST(routing_mask_popcount) {
        int internal_count = popcnt128(ASMA_36_INTERNAL_MASK);
        int projective_count = popcnt128(ASMA_64_PROJECTIVE_MASK);
        assert(internal_count == 36);
        assert(projective_count == 64);
        /* No overlap: internal AND projective == 0 */
        uint64_t overlap_lo = ASMA_36_INTERNAL_MASK.low_64 & ASMA_64_PROJECTIVE_MASK.low_64;
        uint64_t overlap_hi = ASMA_36_INTERNAL_MASK.high_64 & ASMA_64_PROJECTIVE_MASK.high_64;
        assert(overlap_lo == 0);
        assert(overlap_hi == 0);
    } PASS;

    /* T6: DET coherence — popcount(OR of all 72 masks) == 64 */
    TEST(det_coherence) {
        uint64_t det_or = 0;
        for (int i = 0; i < 72; i++) {
            det_or |= M2_TO_M3_CYMATIC_PROJECTION[i];
        }
        int det_popcount = popcnt64(det_or);
        assert(det_popcount == 64);

        /* First 64 states should each have exactly 1 bit (unique) */
        for (int i = 0; i < 64; i++) {
            assert(popcnt64(M2_TO_M3_CYMATIC_PROJECTION[i]) == 1);
        }
        /* States 64-71 fold back (epogdoon tax) — also 1 bit each */
        for (int i = 64; i < 72; i++) {
            assert(popcnt64(M2_TO_M3_CYMATIC_PROJECTION[i]) == 1);
        }
    } PASS;

    /* T7: Shem bounds — choir<8, position<9, decan_link<72 */
    TEST(shem_bounds) {
        for (int i = 0; i < 72; i++) {
            assert(M2_SHEM_DESC[i].choir < 8);
            assert(M2_SHEM_DESC[i].position < 9);
            assert(M2_SHEM_DESC[i].decan_link < 72);
            assert(M2_SHEM_DESC[i].element_id < 5);
            /* Verify flat index = i */
            assert(shem_flat_index(M2_SHEM_DESC[i].choir,
                                   M2_SHEM_DESC[i].position) == (uint8_t)i);
        }
    } PASS;

    /* T8: MEF accessor spot-checks */
    TEST(mef_accessor) {
        /* Lens 0, position 0 → flat index 0 */
        MEF_Condition c00 = get_mef_condition(0, 0, false);
        assert(c00 == M2_ARCHETYPES.raw_vibration[0]);

        /* Lens 2, position 3 → flat index 2*6+3 = 15 */
        MEF_Condition c23 = get_mef_condition(2, 3, false);
        assert(c23 == M2_ARCHETYPES.raw_vibration[15]);

        /* Inverted lens 0 → row 6, position 0 → flat index 36 */
        MEF_Condition c00i = get_mef_condition(0, 0, true);
        assert(c00i == M2_ARCHETYPES.raw_vibration[36]);

        /* Inverted lens 5 → row 11, position 5 → flat index 71 */
        MEF_Condition c55i = get_mef_condition(5, 5, true);
        assert(c55i == M2_ARCHETYPES.raw_vibration[71]);

        /* Descriptor lens links match */
        assert(M2_MEF_DESC[0].lens == 0);
        assert(M2_MEF_DESC[0].position == 0);
        assert(M2_MEF_DESC[36].lens == 6);
        assert(M2_MEF_DESC[71].lens == 11);
        assert(M2_MEF_DESC[71].position == 5);
    } PASS;

    /* T9: MEF lens identity — canonical names from canvas */
    TEST(mef_lens_identity) {
        /* Base lenses */
        assert(strcmp(M2_MEF_LENS_NAMES[0],  "Quaternal") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[1],  "Causal") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[2],  "Logical") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[3],  "Processual") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[4],  "Phenomenological") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[5],  "Para Vak") == 0);
        /* Inverted lenses — DISTINCT identities, NOT "X Inverted" */
        assert(strcmp(M2_MEF_LENS_NAMES[6],  "Archetypal-Numerical") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[7],  "Phenomenal") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[8],  "Alchemical-Elemental") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[9],  "Chronological") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[10], "Scientific") == 0);
        assert(strcmp(M2_MEF_LENS_NAMES[11], "Divine Logos") == 0);
    } PASS;

    /* T10: Epogdoon — 9:8 compression/expansion */
    TEST(epogdoon) {
        assert(m2_epogdoon_compress(72) == 64);
        assert(m3_epogdoon_expand(64) == 72);
        assert(m2_epogdoon_compress(36) == 32);
        assert(m3_epogdoon_expand(32) == 36);
        assert(m2_epogdoon_compress(9) == 8);
        assert(m3_epogdoon_expand(8) == 9);
        /* Round-trip identity */
        assert(m3_epogdoon_expand(m2_epogdoon_compress(72)) == 72);
    } PASS;

    /* T11: m2_init/teardown lifecycle */
    TEST(lifecycle) {
        Coordinate_Arena arena;
        assert(arena_init(&arena, 16) == 0);

        /* Create a minimal HC for position #2 */
        Holographic_Coordinate* hc = arena_alloc(&arena);
        assert(hc != NULL);
        hc->ql_position = 2;
        hc->family = FAMILY_NONE;
        hc->cf = (Holographic_Coordinate*)&Psychoid_4;

        M2_Root* root = m2_init(&arena, hc);
        assert(root != NULL);
        assert(root->hc == hc);
        assert(root->active_cf == cf_get(CF_TRIKA));

        /* Teardown should not crash */
        m2_teardown(root);
        arena_destroy(&arena);
    } PASS;

    /* Summary */
    printf("\n=== M2 Results: %d / %d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
