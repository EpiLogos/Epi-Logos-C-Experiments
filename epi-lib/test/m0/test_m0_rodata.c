/* src/test_m0_rodata.c — M0 .rodata LUT validation tests */
#include "m0.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 .rodata Tests ===\n");

    /* T1: VIMARSA_TABLE has 7 entries, all non-null opcodes */
    TEST(vimarsa_table_count) {
        for (int i = 0; i < VIMARSA_OP_COUNT; i++) {
            assert(VIMARSA_TABLE[i].opcode >= OP_ILLUMINATE);
            assert(VIMARSA_TABLE[i].opcode <= OP_DISTINGUISH);
            assert(VIMARSA_TABLE[i].symbol != NULL);
        }
    } PASS;

    /* T2: ARCHETYPE_LUT has 12 entries */
    TEST(archetype_lut_12fold) {
        /* Index 0: (-) mirror */
        assert(ARCHETYPE_LUT[0].index == 0);
        /* Index 1: 0/1 singularity */
        assert(ARCHETYPE_LUT[1].index == 1);
        /* Indices 2-11: numbers 0-9 */
        for (int i = 2; i < 12; i++) {
            assert(ARCHETYPE_LUT[i].index == (uint8_t)i);
        }
    } PASS;

    /* T3: Zodiacal sub-table is wired to Archetype 3 (Vak) = index 5 */
    TEST(zodiacal_wiring) {
        assert(ARCHETYPE_LUT[5].sub_table_type == SUB_TABLE_ZODIACAL);
        assert(ARCHETYPE_LUT[5].sub_table_size == 12);
        assert(ARCHETYPE_LUT[5].sub_table.zodiacal_grammar == ZODIACAL_LUT);
    } PASS;

    /* T4: MonoPoly sub-table wired to Archetype 5 (Dynamic Harmony) = index 7 */
    TEST(monopoly_wiring) {
        assert(ARCHETYPE_LUT[7].sub_table_type == SUB_TABLE_MONOPOLY);
        assert(ARCHETYPE_LUT[7].sub_table_size == 7);
    } PASS;

    /* T5: Divine Acts sub-table wired to Archetype 7 (Divine Action) = index 9 */
    TEST(divine_acts_wiring) {
        assert(ARCHETYPE_LUT[9].sub_table_type == SUB_TABLE_DIVINE);
        assert(ARCHETYPE_LUT[9].sub_table_size == 7);
    } PASS;

    /* T5b: Virtue sub-table wired to Archetype 9 (Paramesvara) = index 11 */
    TEST(virtue_wiring) {
        assert(ARCHETYPE_LUT[11].sub_table_type == SUB_TABLE_VIRTUE);
        assert(ARCHETYPE_LUT[11].sub_table_size == 9);
        assert(ARCHETYPE_LUT[11].sub_table.virtue_entries == VIRTUE_LUT);
    } PASS;

    /* T5c: Polarity fixes — [2] and [3] are NEUTRAL, [8] is ADAM, [11] is EVE */
    TEST(polarity_fixes) {
        assert(ARCHETYPE_LUT[2].polarity == 2);  /* Sat: NEUTRAL */
        assert(ARCHETYPE_LUT[3].polarity == 2);  /* Magician: NEUTRAL */
        assert(ARCHETYPE_LUT[8].polarity == 0);  /* Synthetic Emptiness: ADAM */
        assert(ARCHETYPE_LUT[11].polarity == 1); /* Paramesvara: EVE */
    } PASS;

    /* T5d: Complement pair symmetry — [8]<->[9] and [10]<->[11] */
    TEST(complement_symmetry) {
        assert(ARCHETYPE_LUT[8].complement_idx == 9);
        assert(ARCHETYPE_LUT[9].complement_idx == 8);
        assert(ARCHETYPE_LUT[10].complement_idx == 11);
        assert(ARCHETYPE_LUT[11].complement_idx == 10);
    } PASS;

    /* T6: VIRTUE_LUT[0] is meta-virtue (r_factor=0xFF) */
    TEST(virtue_lut_anchor) {
        assert(VIRTUE_LUT[0].r_factor == 0xFF);
        assert(VIRTUE_TO_RFACTOR(3) == 0);
        assert(VIRTUE_TO_RFACTOR(8) == 5);
        assert(VIRTUE_TO_RFACTOR(0) == 0xFF);
    } PASS;

    /* T7: QL_STACK has 5 frames, cascade wired */
    TEST(ql_stack_cascade) {
        assert(QL_STACK[0].frame_id == 0); /* O# */
        assert(QL_STACK[0].generates == 1); /* -> X# */
        assert(QL_STACK[4].frame_id == 4); /* # (Nara) */
        assert(QL_STACK[4].generates == 0xFF); /* terminal */
    } PASS;

    /* T8: SIVA_TABLE has 6 entries with non-NULL execute ptrs */
    TEST(siva_table_entries) {
        for (int i = 0; i < 6; i++) {
            assert(SIVA_TABLE[i].execute != NULL);
        }
    } PASS;

    /* T9: R-factor complementarity: Rx + Ry = 5 */
    TEST(r_factor_complementarity) {
        /* R1 + R4 = 5 for O#, X#, N#, Nara, Siva (where both present) */
        for (int f = 0; f < 6; f++) {
            uint8_t r1 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 1);
            uint8_t r4 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 4);
            if (r1 < 7 && r4 < 7) {
                assert(r1 + r4 == 5);
            }
        }
        /* R2 + R3 = 5 for X#, N#, Nara, Siva (where both present) */
        for (int f = 1; f < 6; f++) {
            uint8_t r2 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 2);
            uint8_t r3 = GET_R_POS(R_FACTOR_ROUTE_TABLE[f], 3);
            if (r2 < 7 && r3 < 7) {
                assert(r2 + r3 == 5);
            }
        }
    } PASS;

    /* T10: Cross-branch registry has 7 entries */
    TEST(cross_branch_registry) {
        assert(M0_CROSS_BRANCH_COUNT == 7);
        for (uint8_t i = 0; i < 6; i++) {
            assert(M0_CROSS_BRANCH_REGISTRY[i].relation_type == HOLOGRAPHIC_MICRO_IMAGE_REL);
            assert(M0_GOVERNING_CF[M0_CROSS_BRANCH_REGISTRY[i].m0_sub_branch]
                   == M0_CROSS_BRANCH_REGISTRY[i].cf_id);
        }
    } PASS;

    /* T11: Cosmic clock at degree 155 */
    TEST(cosmic_clock_155) {
        Unified_Clock_State c = m0_read_cosmic_clock(155);
        assert(c.m1_torus_stage == 5);
        assert(c.m2_decan_phase == 15);
        assert(c.m3_hexagram_id == 27);
        assert(!c.is_implicate_phase);
    } PASS;

    /* T12: Logos state at tick 0 and tick 6 */
    TEST(logos_state) {
        Unified_Logos_State s0 = m0_compute_logos_state(0);
        assert(s0.current_stage == 0);
        assert(s0.active_divine_act == ACT_SRISHTI);
        assert(!s0.is_implicate);

        Unified_Logos_State s6 = m0_compute_logos_state(6);
        assert(s6.current_stage == 5);
        assert(s6.active_divine_act == ACT_SAMAVESA);
        assert(s6.is_implicate);
    } PASS;

    /* T13: Every Compiled_Formulation in ARCHETYPE_LUT has a source string */
    TEST(formulation_sources) {
        for (int i = 0; i < ARCHETYPE_LUT_SIZE; i++) {
            assert(ARCHETYPE_LUT[i].formulation.source != NULL);
        }
    } PASS;

    /* T14: Compiled_Formulation signatures are non-zero for non-ground elements */
    TEST(formulation_signatures) {
        /* The mirror (-) should have OP_WITHHOLD in its signature */
        assert(ARCHETYPE_LUT[0].formulation.signature & (1u << (OP_WITHHOLD - 1)));
    } PASS;

    printf("\n=== M0 .rodata: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
