/**
 * test_m5.c — M5 (Epii) Verification Suite
 *
 * Tests all FRs from M5-epii-holographic-integration.md.
 * Build: clang -std=c11 -Wall -Wextra -Iinclude -Ivendor/blake3 \
 *        -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0 \
 *        -fsanitize=address,undefined \
 *        src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
 *        src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c \
 *        vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
 *        src/test_m5.c -o test_m5
 */

#include <stdio.h>
#include <string.h>
#include <stddef.h>
#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m0.h"
#include "m1.h"
#include "m2.h"
#include "m3.h"
#include "m4.h"
#include "m5.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; } \
    else { fail_count++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)


/* ===================================================================
 * TEST ARENA SETUP
 * =================================================================== */

static Coordinate_Arena test_arena;
static Holographic_Coordinate* test_mirrors[6];

static void setup_test_arena(void) {
    arena_init(&test_arena, 64);
    const Holographic_Coordinate* raw[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };
    for (int i = 0; i < 6; i++) {
        test_mirrors[i] = arena_alloc(&test_arena);
        test_mirrors[i]->ql_position = raw[i]->ql_position;
        test_mirrors[i]->family = FAMILY_NONE;
        test_mirrors[i]->weave_state = raw[i]->weave_state;
        test_mirrors[i]->invoke_process = raw[i]->invoke_process;
        test_mirrors[i]->c = (i == 0) ? test_mirrors[0] : test_mirrors[i - 1];
    }
    test_mirrors[5]->c = test_mirrors[0];
    test_mirrors[4]->cf = test_mirrors[4];
    test_mirrors[3]->cf = test_mirrors[4];
    families_init(&test_arena, test_mirrors);
    families_crosslink(&test_arena);
    families_wire_reflective(&test_arena);
}

static void teardown_test_arena(void) {
    arena_destroy(&test_arena);
}


/* ===================================================================
 * FR 2.5.5: LOGOS FSM TYPES
 * =================================================================== */

static void test_logos_fsm_types(void) {
    /* LogosStage enum values */
    TEST("ALOGOS == 0",   ALOGOS   == 0);
    TEST("PROLOGOS == 1", PROLOGOS == 1);
    TEST("DIALOGOS == 2", DIALOGOS == 2);
    TEST("LOGOS_STAGE == 3", LOGOS_STAGE == 3);
    TEST("EPILOGOS == 4", EPILOGOS == 4);
    TEST("ANALOGOS == 5", ANALOGOS == 5);

    /* m0_compute_logos_state — ascending */
    for (uint8_t t = 0; t < 6; t++) {
        Unified_Logos_State s = m0_compute_logos_state(t);
        TEST("ascending tick", s.pipeline_tick == t);
        TEST("ascending not implicate", !s.is_implicate);
        TEST("ascending stage == tick", (uint8_t)s.current_stage == t);
        TEST("ascending r_factor == stage", s.active_r_factor == (uint8_t)s.current_stage);
    }

    /* m0_compute_logos_state — descending */
    for (uint8_t t = 6; t < 12; t++) {
        Unified_Logos_State s = m0_compute_logos_state(t);
        TEST("descending tick", s.pipeline_tick == t);
        TEST("descending is implicate", s.is_implicate);
        TEST("descending stage == 11-tick", (uint8_t)s.current_stage == (11 - t));
        TEST("descending r_factor == stage", s.active_r_factor == (uint8_t)s.current_stage);
    }

    /* Boundary: tick 0 = ALOGOS ascending */
    Unified_Logos_State s0 = m0_compute_logos_state(0);
    TEST("tick0 = ALOGOS", s0.current_stage == ALOGOS);
    TEST("tick0 ascending", !s0.is_implicate);

    /* Boundary: tick 11 = ALOGOS descending (Mobius) */
    Unified_Logos_State s11 = m0_compute_logos_state(11);
    TEST("tick11 = ALOGOS", s11.current_stage == ALOGOS);
    TEST("tick11 descending", s11.is_implicate);

    /* Symmetry: tick 5 and tick 6 both = ANALOGOS */
    Unified_Logos_State s5 = m0_compute_logos_state(5);
    Unified_Logos_State s6 = m0_compute_logos_state(6);
    TEST("tick5 = ANALOGOS", s5.current_stage == ANALOGOS);
    TEST("tick6 = ANALOGOS", s6.current_stage == ANALOGOS);
    TEST("tick5 ascending", !s5.is_implicate);
    TEST("tick6 descending", s6.is_implicate);

    /* Stage names */
    TEST("stage name ALOGOS", strcmp(M5_LOGOS_STAGE_NAMES[ALOGOS], "A-logos") == 0);
    TEST("stage name ANALOGOS", strcmp(M5_LOGOS_STAGE_NAMES[ANALOGOS], "An-a-logos") == 0);
    TEST("stage name LOGOS", strcmp(M5_LOGOS_STAGE_NAMES[LOGOS_STAGE], "Logos") == 0);
}


/* ===================================================================
 * QUINTESSENTIAL VIEW SYSTEM
 * =================================================================== */

static void test_quintessential_view(void) {
    M5_Quintessential_View qv = {0};
    TEST("qv zero coord_id", qv.coord_id == 0);
    TEST("qv zero register_count", qv.register_count == 0);
    TEST("qv zero refinement_cycle", qv.refinement_cycle == 0);
    TEST("qv null pithy", qv.pithy == NULL);

    /* Populated view */
    qv.coord_id = M5_COORD_ID(FAMILY_M, 0, 0);
    qv.register_count = 1;
    qv.pithy = "Anuttara: bare-metal VM of six nested micro-algebras";
    TEST("qv has pithy", qv.pithy != NULL);
    TEST("qv register_count", qv.register_count == 1);

    /* Coord ID packing/unpacking */
    uint16_t cid = M5_COORD_ID(FAMILY_M, 3, 2);
    TEST("coord family M", M5_COORD_FAMILY(cid) == FAMILY_M);
    TEST("coord position 3", M5_COORD_POSITION(cid) == 3);
    TEST("coord branch 2", M5_COORD_BRANCH(cid) == 2);

    /* All families roundtrip */
    for (uint8_t f = 0; f < 6; f++) {
        for (uint8_t p = 0; p < 6; p++) {
            uint16_t id = M5_COORD_ID(f, p, 0);
            TEST("roundtrip family", M5_COORD_FAMILY(id) == f);
            TEST("roundtrip pos", M5_COORD_POSITION(id) == p);
        }
    }

    /* Granularity hook */
    M5_Granularity_Hook gh = {0};
    gh.s0_pithy = "M0: void arithmetic";
    TEST("gh s0 present", gh.s0_pithy != NULL);
    TEST("gh s1 null", gh.s1_obsidian_path == NULL);
    TEST("gh s2 null", gh.s2_neo4j_query == NULL);
}


/* ===================================================================
 * SUB-BRANCH STRUCTS
 * =================================================================== */

static void test_sub_branch_structs(void) {
    /* #5-0: Identity — M+M' */
    M5_Identity id = {0};
    TEST("identity m_roots null", id.m_roots[0] == NULL);
    TEST("identity 6 m_views", sizeof(id.m_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("identity 6 m_prime", sizeof(id.m_prime) == 6 * sizeof(M5_Quintessential_View));

    /* #5-1: Theory — L+P+L'+P' */
    M5_Theory th = {0};
    TEST("theory session_depth zero", th.session_depth == 0);
    TEST("theory enrichment zero", th.enrichment_charge == 0);
    TEST("theory 36 hooks", sizeof(th.hooks) == 36 * sizeof(M5_Granularity_Hook));
    TEST("theory 6 l_views", sizeof(th.l_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("theory 6 l_prime", sizeof(th.l_prime) == 6 * sizeof(M5_Quintessential_View));
    TEST("theory 6 p_views", sizeof(th.p_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("theory 6 p_prime", sizeof(th.p_prime) == 6 * sizeof(M5_Quintessential_View));

    /* #5-2: Stack — S+S' */
    M5_Stack st = {0};
    TEST("stack 6 s_views", sizeof(st.s_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("stack 6 s_prime", sizeof(st.s_prime) == 6 * sizeof(M5_Quintessential_View));

    /* #5-3: UI — M' */
    M5_UI ui = {0};
    TEST("ui webmcp_hook null", ui.webmcp_hook == NULL);
    TEST("ui 6 m_prime_ui", sizeof(ui.m_prime_ui) == 6 * sizeof(M5_Quintessential_View));

    /* #5-4: Agents — Anima+Aletheia */
    M5_Agents ag = {0};
    TEST("agents anima_count zero", ag.anima_count == 0);
    TEST("agents aletheia_count zero", ag.aletheia_count == 0);
    TEST("agents anima_roster null", ag.anima_roster == NULL);
    TEST("agents aletheia_roster null", ag.aletheia_roster == NULL);

    /* #5-5: Logos — T+C+T'+C' */
    M5_Logos lg = {0};
    TEST("logos tick zero", lg.pipeline_tick == 0);
    TEST("logos 6 t_views", sizeof(lg.t_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("logos 6 t_prime", sizeof(lg.t_prime) == 6 * sizeof(M5_Quintessential_View));
    TEST("logos 6 c_views", sizeof(lg.c_views) == 6 * sizeof(M5_Quintessential_View));
    TEST("logos 6 c_prime", sizeof(lg.c_prime) == 6 * sizeof(M5_Quintessential_View));
    TEST("logos 6 archetype_charge", sizeof(lg.archetype_charge) == 6 * sizeof(uint64_t));
    TEST("logos 6 inverse_charge", sizeof(lg.inverse_charge) == 6 * sizeof(uint64_t));
    TEST("logos 6 frame_charge", sizeof(lg.frame_charge) == 6 * sizeof(uint64_t));
    TEST("logos mobius_write_back null", lg.mobius_write_back == NULL);

    /* Agent entry */
    M5_Agent_Entry ae = {0};
    TEST("agent entry name null", ae.name == NULL);
    TEST("agent entry id zero", ae.id == 0);
    TEST("agent entry not active", ae.active == 0);
}


/* ===================================================================
 * M5_ROOT + SUB-FSMs
 * =================================================================== */

static void test_m5_root_and_subfsms(void) {
    /* M5_Root first field is hc */
    TEST("hc is first field", offsetof(M5_Root, hc) == 0);

    /* Etymology FSM */
    M5_Etymology_FSM etym = {0};
    TEST("etym stage zero", etym.stage == ETYM_STAGE_PIE_ROOT);
    TEST("etym not ready", !etym.write_back_ready);
    m5_etymology_advance(&etym);
    TEST("etym advanced to cognate", etym.stage == ETYM_STAGE_COGNATE_MAP);
    TEST("etym still not ready", !etym.write_back_ready);
    /* Advance to write-back */
    for (int i = 0; i < 4; i++) m5_etymology_advance(&etym);
    TEST("etym at writeback", etym.stage == ETYM_STAGE_MOBIUS_WRITEBACK);
    TEST("etym ready", etym.write_back_ready);
    /* Cannot advance past writeback */
    m5_etymology_advance(&etym);
    TEST("etym stays at writeback", etym.stage == ETYM_STAGE_MOBIUS_WRITEBACK);

    /* Paradox holding */
    M5_Paradox_Hold ph = {0};
    TEST("paradox not holding", !ph.holding);
    m5_hold_paradox(&ph, 0xAA, 0x55, 3);
    TEST("paradox holding", ph.holding);
    TEST("paradox not resolved", !ph.resolved);
    TEST("paradox thesis", ph.thesis_mask == 0xAA);
    TEST("paradox antithesis", ph.antithesis_mask == 0x55);
    TEST("paradox hold_since_tick", ph.hold_since_tick == 3);
    TEST("paradox resolution_stage", ph.resolution_stage == ANALOGOS);
    uint64_t synth = m5_resolve_paradox(&ph);
    TEST("paradox synthesis XOR", synth == (0xAA ^ 0x55));
    TEST("paradox resolved", ph.resolved);
    TEST("paradox no longer holding", !ph.holding);

    /* Resolve again when not holding */
    uint64_t synth2 = m5_resolve_paradox(&ph);
    TEST("paradox re-resolve returns 0", synth2 == 0);

    /* Scent state */
    M5_Scent_State sc = {0};
    TEST("scent zero vector", sc.scent_vector == 0);
    TEST("scent zero confidence", sc.confidence == 0);
    TEST("scent zero origin", sc.m_branch_of_origin == 0);
}


/* ===================================================================
 * M5_INIT / M5_TEARDOWN
 * =================================================================== */

static void test_m5_init_teardown(void) {
    setup_test_arena();

    /* Must be #5 */
    M5_Root* bad = m5_init(&test_arena, test_mirrors[0]);
    TEST("m5_init rejects non-#5", bad == NULL);

    /* NULL args */
    TEST("m5_init rejects null arena", m5_init(NULL, test_mirrors[5]) == NULL);
    TEST("m5_init rejects null hc", m5_init(&test_arena, NULL) == NULL);

    /* Good init */
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);
    TEST("m5_init succeeds", m5 != NULL);
    TEST("m5 hc bound", m5->hc == test_mirrors[5]);
    TEST("m5 hc payload bound", test_mirrors[5]->payload.process_state == m5);
    TEST("m5 active_cf is CF_MOBIUS", m5->active_cf == cf_get(CF_MOBIUS));
    TEST("m5 logos tick zero", m5->logos.pipeline_tick == 0);
    TEST("m5 etymology at PIE_ROOT", m5->etymology.stage == ETYM_STAGE_PIE_ROOT);
    TEST("m5 paradox not holding", !m5->paradox.holding);
    TEST("m5 agents empty", m5->agents.anima_count == 0);
    TEST("m5 agents aletheia empty", m5->agents.aletheia_count == 0);

    m5_teardown(m5);
    TEST("m5 teardown clears payload", test_mirrors[5]->payload.process_state == NULL);

    /* Teardown NULL is safe */
    m5_teardown(NULL);

    teardown_test_arena();
}


/* ===================================================================
 * M5_ADVANCE_LOGOS
 * =================================================================== */

static void test_m5_advance_logos(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* Initial state */
    TEST("initial tick 0", m5->logos.pipeline_tick == 0);

    /* Advance through full 12-tick cycle */
    for (uint8_t t = 0; t < 12; t++) {
        Unified_Logos_State s = m5_advance_logos(m5);
        TEST("advance tick correct", s.pipeline_tick == t);
        if (t < 6) {
            TEST("ascending", !s.is_implicate);
        } else {
            TEST("descending", s.is_implicate);
        }
    }

    /* After 12 advances, tick wraps to 0 */
    TEST("tick wraps to 0", m5->logos.pipeline_tick == 0);

    /* Verify archetype_charge persists across ticks */
    m5->logos.archetype_charge[0] = 100;
    Unified_Logos_State s0 = m5_advance_logos(m5);
    TEST("charge persists", m5->logos.archetype_charge[0] == 100);
    (void)s0;

    /* Multiple cycles */
    for (int cycle = 0; cycle < 3; cycle++) {
        for (int t = 0; t < 12; t++) {
            m5_advance_logos(m5);
        }
    }
    /* After advancing 1 + 36 = 37 ticks from tick 1, should be at (37 % 12) = 1 */
    TEST("multi-cycle tick correct", m5->logos.pipeline_tick == 1);

    m5_teardown(m5);
    teardown_test_arena();
}


/* ===================================================================
 * M5_EXECUTE_MOBIUS_RETURN (The Sacred Violation)
 * =================================================================== */

static void test_m5_mobius_return(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    uint64_t fake_ground = 0x1234;

    /* Cannot execute at tick 0 */
    int rc = m5_execute_mobius_return(m5, &fake_ground);
    TEST("mobius rejected at tick 0", rc == -1);
    TEST("ground unchanged at tick 0", fake_ground == 0x1234);

    /* Cannot execute at tick 5 */
    for (int i = 0; i < 5; i++) m5_advance_logos(m5);
    rc = m5_execute_mobius_return(m5, &fake_ground);
    TEST("mobius rejected at tick 5", rc == -1);

    /* Advance to tick 11 (descending ALOGOS) */
    for (int i = 0; i < 6; i++) m5_advance_logos(m5);
    TEST("at tick 11", m5->logos.pipeline_tick == 11);

    /* Deposit charge */
    m5->logos.archetype_charge[5] = 0xFF00;

    /* Execute Sacred Violation */
    rc = m5_execute_mobius_return(m5, &fake_ground);
    TEST("mobius accepted at tick 11", rc == 0);
    TEST("ground XOR'd", fake_ground == (0x1234 ^ 0xFF00));

    /* Tick resets to 0 after Mobius */
    TEST("tick reset to 0", m5->logos.pipeline_tick == 0);

    /* NULL args */
    TEST("mobius null root", m5_execute_mobius_return(NULL, &fake_ground) == -1);
    TEST("mobius null ground", m5_execute_mobius_return(m5, NULL) == -1);

    m5_teardown(m5);
    teardown_test_arena();
}


/* ===================================================================
 * M5_LOOKUP (Quintessential View Self-API)
 * =================================================================== */

static void test_m5_lookup(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* Set a pithy view on M0 identity */
    m5->identity.m_views[0].coord_id = M5_COORD_ID(FAMILY_M, 0, 0);
    m5->identity.m_views[0].pithy = "Anuttara: bare-metal VM";
    m5->identity.m_views[0].register_count = 1;

    /* Lookup by coord_id at S0' granularity */
    uint16_t cid = M5_COORD_ID(FAMILY_M, 0, 0);
    const char* result = m5_lookup(m5, cid, M5_GRAN_PITHY);
    TEST("lookup M0 pithy", result != NULL);
    TEST("lookup M0 content", strcmp(result, "Anuttara: bare-metal VM") == 0);

    /* Lookup nonexistent coord */
    uint16_t bad_cid = M5_COORD_ID(FAMILY_P, 3, 7);
    const char* bad = m5_lookup(m5, bad_cid, M5_GRAN_PITHY);
    TEST("lookup unknown returns NULL", bad == NULL);

    /* Set a theory L-view */
    m5->theory.l_views[2].coord_id = M5_COORD_ID(FAMILY_L, 2, 0);
    m5->theory.l_views[2].pithy = "Structural lens";
    m5->theory.l_views[2].register_count = 1;
    uint16_t lcid = M5_COORD_ID(FAMILY_L, 2, 0);
    const char* lresult = m5_lookup(m5, lcid, M5_GRAN_PITHY);
    TEST("lookup L2 pithy", lresult != NULL);
    TEST("lookup L2 content", strcmp(lresult, "Structural lens") == 0);

    /* Set a P-view */
    m5->theory.p_views[0].coord_id = M5_COORD_ID(FAMILY_P, 0, 0);
    m5->theory.p_views[0].pithy = "Ground position";
    m5->theory.p_views[0].register_count = 1;
    uint16_t pcid = M5_COORD_ID(FAMILY_P, 0, 0);
    TEST("lookup P0", strcmp(m5_lookup(m5, pcid, M5_GRAN_PITHY), "Ground position") == 0);

    /* Set a S-view */
    m5->stack.s_views[2].coord_id = M5_COORD_ID(FAMILY_S, 2, 0);
    m5->stack.s_views[2].pithy = "Neo4j graph database";
    m5->stack.s_views[2].register_count = 1;
    uint16_t scid = M5_COORD_ID(FAMILY_S, 2, 0);
    TEST("lookup S2", strcmp(m5_lookup(m5, scid, M5_GRAN_PITHY), "Neo4j graph database") == 0);

    /* Set a T-view */
    m5->logos.t_views[0].coord_id = M5_COORD_ID(FAMILY_T, 0, 0);
    m5->logos.t_views[0].pithy = "Seed thought = A-logos";
    m5->logos.t_views[0].register_count = 1;
    uint16_t tcid = M5_COORD_ID(FAMILY_T, 0, 0);
    TEST("lookup T0", strcmp(m5_lookup(m5, tcid, M5_GRAN_PITHY), "Seed thought = A-logos") == 0);

    /* Set a C-view */
    m5->logos.c_views[0].coord_id = M5_COORD_ID(FAMILY_C, 0, 0);
    m5->logos.c_views[0].pithy = "Bimba: canonical source";
    m5->logos.c_views[0].register_count = 1;
    uint16_t ccid = M5_COORD_ID(FAMILY_C, 0, 0);
    TEST("lookup C0", strcmp(m5_lookup(m5, ccid, M5_GRAN_PITHY), "Bimba: canonical source") == 0);

    /* Obsidian granularity with no register */
    const char* obs = m5_lookup(m5, cid, M5_GRAN_OBSIDIAN);
    TEST("lookup M0 obsidian null (no register)", obs == NULL);

    /* With register set */
    m5->identity.m_views[0].register_count = 3;
    m5->identity.m_views[0].registers[1] = "docs/obsidian/m0.md";
    m5->identity.m_views[0].registers[2] = "MATCH (n:M0) RETURN n";
    const char* obs2 = m5_lookup(m5, cid, M5_GRAN_OBSIDIAN);
    TEST("lookup M0 obsidian", strcmp(obs2, "docs/obsidian/m0.md") == 0);
    const char* neo = m5_lookup(m5, cid, M5_GRAN_NEO4J);
    TEST("lookup M0 neo4j", strcmp(neo, "MATCH (n:M0) RETURN n") == 0);

    /* NULL root */
    TEST("lookup null root", m5_lookup(NULL, cid, M5_GRAN_PITHY) == NULL);

    m5_teardown(m5);
    teardown_test_arena();
}


/* ===================================================================
 * M5_VERIFY
 * =================================================================== */

static void test_m5_verify(void) {
    TEST("m5_verify passes", m5_verify());
}


/* ===================================================================
 * M5_CLI_DISPATCH
 * =================================================================== */

static void test_m5_cli_dispatch(void) {
    setup_test_arena();
    M5_Root* m5 = m5_init(&test_arena, test_mirrors[5]);

    /* "info" command */
    char* argv_info[] = {"m5", "info"};
    int rc = m5_cli_dispatch(2, argv_info, m5);
    TEST("cli info returns 0", rc == 0);

    /* "logos tick" */
    char* argv_logos[] = {"m5", "logos", "tick"};
    rc = m5_cli_dispatch(3, argv_logos, m5);
    TEST("cli logos tick returns 0", rc == 0);

    /* "logos advance" */
    char* argv_adv[] = {"m5", "logos", "advance"};
    rc = m5_cli_dispatch(3, argv_adv, m5);
    TEST("cli logos advance returns 0", rc == 0);
    TEST("cli advanced tick", m5->logos.pipeline_tick == 1);

    /* "agents list" */
    char* argv_agents[] = {"m5", "agents", "list"};
    rc = m5_cli_dispatch(3, argv_agents, m5);
    TEST("cli agents list returns 0", rc == 0);

    /* "stack" */
    char* argv_stack[] = {"m5", "stack"};
    rc = m5_cli_dispatch(2, argv_stack, m5);
    TEST("cli stack returns 0", rc == 0);

    /* "theory" */
    char* argv_theory[] = {"m5", "theory"};
    rc = m5_cli_dispatch(2, argv_theory, m5);
    TEST("cli theory returns 0", rc == 0);

    /* "lookup" with args */
    char* argv_lookup[] = {"m5", "lookup", "5", "0"};
    rc = m5_cli_dispatch(4, argv_lookup, m5);
    TEST("cli lookup returns 0", rc == 0);

    /* Unknown command */
    char* argv_bad[] = {"m5", "unknown"};
    rc = m5_cli_dispatch(2, argv_bad, m5);
    TEST("cli unknown returns -1", rc == -1);

    /* No args (help) */
    char* argv_none[] = {"m5"};
    rc = m5_cli_dispatch(1, argv_none, m5);
    TEST("cli no args returns 0 (help)", rc == 0);

    /* NULL root */
    TEST("cli null root", m5_cli_dispatch(2, argv_info, NULL) == -1);

    m5_teardown(m5);
    teardown_test_arena();
}


/* ===================================================================
 * MAIN
 * =================================================================== */

int main(void) {
    test_logos_fsm_types();
    test_quintessential_view();
    test_sub_branch_structs();
    test_m5_root_and_subfsms();
    test_m5_init_teardown();
    test_m5_advance_logos();
    test_m5_mobius_return();
    test_m5_lookup();
    test_m5_verify();
    test_m5_cli_dispatch();

    printf("\n=== M5 (Epii) Test Results: %d passed, %d failed ===\n",
           pass_count, fail_count);
    return fail_count > 0 ? 1 : 0;
}
