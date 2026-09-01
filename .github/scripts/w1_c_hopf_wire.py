from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected source fragment missing in {path}: {old!r}")
    p.write_text(text.replace(old, new, 1))


header = "Body/S/S0/epi-lib/include/m1_ananda_projection.h"
replace_once(
    header,
    " * Hopf/SU(2)/degree720 remains a neighbouring state relation. It is not\n * folded into this address until the existing C/Rust degree-per-tick\n * discrepancy is resolved by the native owner rather than guessed here.\n */\ntypedef struct {\n    uint8_t tick12;\n    uint8_t position6;\n",
    " * Hopf/SU(2) is an independent coordinate over the same 12-step base walk:\n *   degree360 = tick12 * 30\n *   hopf_fiber = cycle parity\n *   degree720 = degree360 + hopf_fiber * 360\n * Direct/prime therefore remains a relation of tick12 while Hopf fibre is a\n * relation of cycle; all four combinations are first-class.\n */\ntypedef struct {\n    uint64_t cycle;\n    uint8_t tick12;\n    uint16_t degree360;\n    uint8_t hopf_fiber;\n    uint16_t degree720;\n    uint8_t position6;\n",
)
replace_once(
    header,
    "/*\n * Generate the deterministic direct/prime + conjugate address fixed by the\n * native M1 correction lock. Returns 1 on success, 0 for invalid tick/output.\n */\nint m1_ananda_oscillatory_address_from_tick12(\n        uint8_t tick12,\n        M1_Ananda_Oscillatory_Address* out);\n",
    "/*\n * Generate the complete temporal address. `tick12` owns the 30-degree base\n * traversal and direct/prime phase; `cycle` parity owns Hopf fibre.\n */\nint m1_ananda_oscillatory_address_from_clock(\n        uint64_t cycle,\n        uint8_t tick12,\n        M1_Ananda_Oscillatory_Address* out);\n\n/*\n * Compatibility constructor for callers that only possess tick12. It is the\n * explicit cycle-0 / first-Hopf-layer projection, never an inference of fibre.\n */\nint m1_ananda_oscillatory_address_from_tick12(\n        uint8_t tick12,\n        M1_Ananda_Oscillatory_Address* out);\n",
)

source = "Body/S/S0/epi-lib/src/m1_ananda_projection.c"
old_constructor = '''int m1_ananda_oscillatory_address_from_tick12(
        uint8_t tick12,
        M1_Ananda_Oscillatory_Address* out)
{
    uint8_t position6;
    M1_Ananda_Direct_Prime_Phase phase;

    if (!out || tick12 >= 12u) return 0;

    position6 = (uint8_t)(tick12 % 6u);
    phase = tick12 < 6u ? M1_ANANDA_DIRECT_PHASE : M1_ANANDA_PRIME_PHASE;

    out->tick12 = tick12;
    out->position6 = position6;
    out->phase = phase;

    out->conjugate_tick12 = (uint8_t)((tick12 + 6u) % 12u);
    out->conjugate_position6 = position6;
    out->conjugate_phase = phase == M1_ANANDA_DIRECT_PHASE
        ? M1_ANANDA_PRIME_PHASE
        : M1_ANANDA_DIRECT_PHASE;

    /* Ananda family position and Spanda stage are a compile-time 1:1 track. */
    out->spanda_stage = ANANDA_TO_SPANDA_STAGE((Ananda_Matrix_Op)position6);
    return 1;
}
'''
new_constructor = '''int m1_ananda_oscillatory_address_from_clock(
        uint64_t cycle,
        uint8_t tick12,
        M1_Ananda_Oscillatory_Address* out)
{
    uint8_t position6;
    uint8_t fiber;
    uint16_t degree360;
    M1_Ananda_Direct_Prime_Phase phase;

    if (!out || tick12 >= 12u) return 0;

    position6 = (uint8_t)(tick12 % 6u);
    phase = tick12 < 6u ? M1_ANANDA_DIRECT_PHASE : M1_ANANDA_PRIME_PHASE;
    degree360 = (uint16_t)((uint16_t)tick12 * (uint16_t)DEGREE_PER_TICK);
    fiber = (uint8_t)(cycle & 1u);

    out->cycle = cycle;
    out->tick12 = tick12;
    out->degree360 = degree360;
    out->hopf_fiber = fiber;
    out->degree720 = (uint16_t)(degree360 + ((uint16_t)fiber * (uint16_t)FULL_CYCLE_DEG));
    out->position6 = position6;
    out->phase = phase;

    out->conjugate_tick12 = (uint8_t)((tick12 + 6u) % 12u);
    out->conjugate_position6 = position6;
    out->conjugate_phase = phase == M1_ANANDA_DIRECT_PHASE
        ? M1_ANANDA_PRIME_PHASE
        : M1_ANANDA_DIRECT_PHASE;

    /* Ananda family position and Spanda stage are a compile-time 1:1 track. */
    out->spanda_stage = ANANDA_TO_SPANDA_STAGE((Ananda_Matrix_Op)position6);
    return 1;
}

int m1_ananda_oscillatory_address_from_tick12(
        uint8_t tick12,
        M1_Ananda_Oscillatory_Address* out)
{
    return m1_ananda_oscillatory_address_from_clock(0u, tick12, out);
}
'''
replace_once(source, old_constructor, new_constructor)
replace_once(
    source,
    "    if (!m1_ananda_oscillatory_address_from_tick12(osc->tick12, &expected)) return 0;\n\n    return osc->position6 == expected.position6\n",
    "    if (!m1_ananda_oscillatory_address_from_clock(\n            osc->cycle, osc->tick12, &expected)) return 0;\n\n    return osc->cycle == expected.cycle\n        && osc->degree360 == expected.degree360\n        && osc->hopf_fiber == expected.hopf_fiber\n        && osc->degree720 == expected.degree720\n        && osc->position6 == expected.position6\n",
)

test = "Body/S/S0/epi-lib/test/m1/test_m1_ananda_projection.c"
insert_before = '''static void test_projection_carries_generated_conjugate_state(void) {
'''
new_test = '''static void test_hopf_clock_is_independent_from_direct_prime_phase(void) {
    for (uint64_t cycle = 0u; cycle < 2u; ++cycle) {
        for (uint8_t tick = 0u; tick < 12u; ++tick) {
            M1_Ananda_Oscillatory_Address a;
            uint16_t degree360 = (uint16_t)((uint16_t)tick * (uint16_t)DEGREE_PER_TICK);
            uint8_t fiber = (uint8_t)(cycle & 1u);

            ASSERT_TRUE(m1_ananda_oscillatory_address_from_clock(cycle, tick, &a));
            ASSERT_EQ_INT((int)cycle, (int)a.cycle);
            ASSERT_EQ_INT(degree360, a.degree360);
            ASSERT_EQ_INT(fiber, a.hopf_fiber);
            ASSERT_EQ_INT(degree360 + (uint16_t)(fiber * FULL_CYCLE_DEG), a.degree720);
            ASSERT_EQ_INT(tick < 6u ? M1_ANANDA_DIRECT_PHASE : M1_ANANDA_PRIME_PHASE,
                          a.phase);
        }
    }

    /* Prime can live on the first Hopf layer; direct can live on the second. */
    {
        M1_Ananda_Oscillatory_Address prime_first;
        M1_Ananda_Oscillatory_Address direct_second;
        ASSERT_TRUE(m1_ananda_oscillatory_address_from_clock(0u, 7u, &prime_first));
        ASSERT_EQ_INT(M1_ANANDA_PRIME_PHASE, prime_first.phase);
        ASSERT_EQ_INT(0, prime_first.hopf_fiber);
        ASSERT_EQ_INT(210, prime_first.degree720);

        ASSERT_TRUE(m1_ananda_oscillatory_address_from_clock(1u, 0u, &direct_second));
        ASSERT_EQ_INT(M1_ANANDA_DIRECT_PHASE, direct_second.phase);
        ASSERT_EQ_INT(1, direct_second.hopf_fiber);
        ASSERT_EQ_INT(360, direct_second.degree720);
    }

    /* Legacy tick12 constructor is explicitly the cycle-0 projection. */
    {
        M1_Ananda_Oscillatory_Address legacy;
        ASSERT_TRUE(m1_ananda_oscillatory_address_from_tick12(11u, &legacy));
        ASSERT_EQ_INT(0, legacy.cycle);
        ASSERT_EQ_INT(0, legacy.hopf_fiber);
        ASSERT_EQ_INT(330, legacy.degree360);
        ASSERT_EQ_INT(330, legacy.degree720);
    }
}

''' + insert_before
replace_once(test, insert_before, new_test)
replace_once(
    test,
    "    RUN_TEST(test_generated_biphase_address_exhaustive);\n    RUN_TEST(test_projection_carries_generated_conjugate_state);\n",
    "    RUN_TEST(test_generated_biphase_address_exhaustive);\n    RUN_TEST(test_hopf_clock_is_independent_from_direct_prime_phase);\n    RUN_TEST(test_projection_carries_generated_conjugate_state);\n",
)
replace_once(
    test,
    "    ASSERT_TRUE(m1_ananda_oscillatory_address_from_tick12(7u, &a));\n    a.conjugate_phase = M1_ANANDA_PRIME_PHASE;\n    ASSERT_TRUE(!m1_ananda_project_cell(MATRIX_BIMBA, 0u, 0u, &a, &p));\n",
    "    ASSERT_TRUE(m1_ananda_oscillatory_address_from_tick12(7u, &a));\n    a.conjugate_phase = M1_ANANDA_PRIME_PHASE;\n    ASSERT_TRUE(!m1_ananda_project_cell(MATRIX_BIMBA, 0u, 0u, &a, &p));\n\n    ASSERT_TRUE(m1_ananda_oscillatory_address_from_clock(1u, 7u, &a));\n    a.hopf_fiber = 0u;\n    ASSERT_TRUE(!m1_ananda_project_cell(MATRIX_BIMBA, 0u, 0u, &a, &p));\n",
)
