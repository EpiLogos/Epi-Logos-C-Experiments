/**
 * test_m4.c — M4 (Nara) Verification Suite
 *
 * Tests all FRs from M4-nara-personal-interface.md.
 * Build: clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 \
 *        -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0 \
 *        -fsanitize=address,undefined \
 *        src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
 *        src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
 *        vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
 *        src/test_m4.c -o test_m4
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
#include "m4.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; } \
    else { fail_count++; fprintf(stderr, "FAIL: %s\n", name); } \
} while(0)


/* ===================================================================
 * FR 2.4.7: ELEMENTAL THROUGHLINE
 * =================================================================== */

static void test_elemental_throughline(void) {
    /* Nucleotide-to-element identity */
    TEST("A == Water(0)", M4_ELEM_WATER == M3_NUC_A);
    TEST("T == Fire(1)",  M4_ELEM_FIRE  == M3_NUC_T);
    TEST("C == Earth(2)", M4_ELEM_EARTH == M3_NUC_C);
    TEST("G == Air(3)",   M4_ELEM_AIR   == M3_NUC_G);

    /* Four elements cover 0-3 */
    TEST("Water=0", M4_ELEM_WATER == 0);
    TEST("Fire=1",  M4_ELEM_FIRE  == 1);
    TEST("Earth=2", M4_ELEM_EARTH == 2);
    TEST("Air=3",   M4_ELEM_AIR   == 3);
}


/* ===================================================================
 * FR 2.4.0: SYMBOL DNA PROFILE
 * =================================================================== */

static void test_symbol_dna_profile(void) {
    M4_Symbol_DNA_Profile dna = {0};
    TEST("dna zero gene_keys", dna.gene_keys_activation == 0);
    TEST("dna zero sun", dna.sun_degree_anchor == 0);
    TEST("dna zero moon", dna.moon_degree_anchor == 0);

    /* Nucleotide balance is 4 bytes */
    TEST("dna balance size", sizeof(dna.nucleotide_balance) == 4);
}


/* ===================================================================
 * FR 2.4.1: INPUT DATA + IDENTITY MATRIX
 * =================================================================== */

static void test_identity_compute(void) {
    M4_Identity_Matrix id = {0};
    TEST("id not computed initially", !m4_identity_ready(&id));

    M4_Input_Data input = {0};
    input.birth_year = 1990;
    input.birth_month = 6;
    input.birth_day = 15;
    input.birth_hour = 12;
    input.birth_minute = 30;
    input.mbti_raw = 0xAB;

    m4_identity_compute(&id, &input);
    TEST("id computed after call", m4_identity_ready(&id));

    /* Input zeroed after compute (architectural privacy) */
    TEST("input zeroed: year", input.birth_year == 0);
    TEST("input zeroed: month", input.birth_month == 0);
    TEST("input zeroed: day", input.birth_day == 0);
    TEST("input zeroed: mbti", input.mbti_raw == 0);

    /* Quintessence hash is non-zero (BLAKE3 of non-trivial input) */
    TEST("quintessence non-zero", id.quintessence_hash != 0);

    /* Numerological key derived from birthdate */
    TEST("numerological key set", id.numerological_key != 0);

    /* Nucleotide balance derived from mbti_raw */
    TEST("nucleotide A set", id.dna_profile.nucleotide_balance.adenine_water > 0);
    TEST("nucleotide T set", id.dna_profile.nucleotide_balance.thymine_fire > 0);

    /* Compute-once guard: second call is no-op */
    uint64_t first_hash = id.quintessence_hash;
    M4_Input_Data input2 = {0};
    input2.birth_year = 2000;
    input2.mbti_raw = 0xFF;
    m4_identity_compute(&id, &input2);
    TEST("compute-once: hash unchanged", id.quintessence_hash == first_hash);
}


/* ===================================================================
 * FR 2.4.1: BLAKE3 DETERMINISM
 * =================================================================== */

static void test_blake3_determinism(void) {
    /* Same input -> same hash */
    M4_Identity_Matrix id1 = {0};
    M4_Identity_Matrix id2 = {0};

    M4_Input_Data in1 = {0};
    in1.birth_year = 1985; in1.birth_month = 3; in1.birth_day = 22;
    in1.mbti_raw = 0x55;

    M4_Input_Data in2 = {0};
    in2.birth_year = 1985; in2.birth_month = 3; in2.birth_day = 22;
    in2.mbti_raw = 0x55;

    m4_identity_compute(&id1, &in1);
    m4_identity_compute(&id2, &in2);
    TEST("blake3 deterministic", id1.quintessence_hash == id2.quintessence_hash);

    /* Different input -> different hash */
    M4_Identity_Matrix id3 = {0};
    M4_Input_Data in3 = {0};
    in3.birth_year = 1985; in3.birth_month = 3; in3.birth_day = 23;
    in3.mbti_raw = 0x55;
    m4_identity_compute(&id3, &in3);
    TEST("blake3 distinct", id1.quintessence_hash != id3.quintessence_hash);
}


/* ===================================================================
 * FR 2.4.11: TEMPORAL NOW
 * =================================================================== */

static void test_temporal_now(void) {
    M4_Temporal_Now now = m4_snapshot_now(0, 1000);
    TEST("now degree=0", now.degree == 0);
    TEST("now epoch=1000", now.chronos_epoch == 1000);
    TEST("now planet_valid=0", now.planet_valid == 0);
    TEST("now clock torus=0", now.clock.m1_torus_stage == 0);
    TEST("now clock explicate", !now.clock.is_implicate_phase);

    /* Degree 360 = shadow layer */
    M4_Temporal_Now shadow = m4_snapshot_now(360, 2000);
    TEST("shadow implicate", shadow.clock.is_implicate_phase);
    TEST("shadow degree=360", shadow.degree == 360);

    /* All 7 planet slots zeroed */
    for (int i = 0; i < 7; i++) {
        TEST("planet slot zero", now.planet_degrees[i] == 0);
    }
}


/* ===================================================================
 * FR 2.4.13: SACRED RANDOM — consent gating
 * =================================================================== */

static void test_sacred_random(void) {
    M4_Sacred_Random rng = {0};
    uint8_t buf[8] = {0};

    /* Without consent: must fail */
    rng.consent_granted = false;
    TEST("no consent -> false", !m4_sacred_random(&rng, buf, 8));

    /* With consent: must succeed */
    rng.consent_granted = true;
    TEST("consent -> true", m4_sacred_random(&rng, buf, 8));

    /* NULL checks */
    TEST("null rng -> false", !m4_sacred_random(NULL, buf, 8));
    TEST("null buf -> false", !m4_sacred_random(&rng, NULL, 8));
    TEST("zero len -> false", !m4_sacred_random(&rng, buf, 0));
}


/* ===================================================================
 * FR 2.4.13: I-CHING CASTING
 * =================================================================== */

static void test_iching_cast(void) {
    M4_Sacred_Random rng = { .consent_granted = true, .session_nonce = 42 };
    M4_IChing_Cast cast;

    int rc = m4_cast_iching(&rng, 180, &cast);
    TEST("iching cast ok", rc == 0);
    TEST("iching degree=180", cast.cast_degree == 180);
    TEST("iching hex < 64", cast.hexagram_id < 64);
    TEST("iching result < 64", cast.result_hexagram < 64);

    /* All lines must be 6, 7, 8, or 9 */
    for (int i = 0; i < 6; i++) {
        TEST("line in range", cast.lines[i] >= 6 && cast.lines[i] <= 9);
    }

    /* Changing mask only uses low 6 bits */
    TEST("changing mask 6-bit", (cast.changing_mask & 0xC0) == 0);

    /* Without consent: must fail */
    M4_Sacred_Random no_consent = {0};
    M4_IChing_Cast cast2;
    int rc2 = m4_cast_iching(&no_consent, 0, &cast2);
    TEST("iching no consent -> fail", rc2 != 0);
}


/* ===================================================================
 * FR 2.4.13: TAROT DRAW
 * =================================================================== */

static void test_tarot_draw(void) {
    M4_Sacred_Random rng = { .consent_granted = true, .session_nonce = 99 };
    M4_Tarot_Draw draw;

    int rc = m4_draw_tarot(&rng, 3, 90, &draw);
    TEST("tarot draw ok", rc == 0);
    TEST("tarot count=3", draw.draw_count == 3);
    TEST("tarot degree=90", draw.cast_degree == 90);

    /* Drawn cards must be in range 0-77 */
    for (int i = 0; i < 3; i++) {
        TEST("drawn card < 78", draw.drawn[i] < 78);
    }

    /* All 78 cards in deck (Fisher-Yates permutation) */
    uint8_t seen[78] = {0};
    for (int i = 0; i < 78; i++) {
        TEST("card in range", draw.cards[i] < 78);
        seen[draw.cards[i]] = 1;
    }
    int distinct = 0;
    for (int i = 0; i < 78; i++) {
        if (seen[i]) distinct++;
    }
    TEST("deck permutation complete", distinct == 78);

    /* Edge: count > 12 rejected */
    M4_Tarot_Draw draw2;
    TEST("tarot count>12 rejected", m4_draw_tarot(&rng, 13, 0, &draw2) != 0);

    /* Edge: count 0 rejected */
    TEST("tarot count=0 rejected", m4_draw_tarot(&rng, 0, 0, &draw2) != 0);
}


/* ===================================================================
 * FR 2.4.3: MAGIC-NUMBER TYPE SAFETY
 * =================================================================== */

static void test_magic_numbers(void) {
    TEST("MAGIC_TAROT = 'TARO'", M4_MAGIC_TAROT == 0x5441524Fu);
    TEST("MAGIC_ICHING = 'ICHG'", M4_MAGIC_ICHING == 0x49434847u);

    M4_Tarot_State ts = { .magic = M4_MAGIC_TAROT };
    M4_IChing_State is = { .magic = M4_MAGIC_ICHING };
    TEST("tarot magic first field", ts.magic == M4_MAGIC_TAROT);
    TEST("iching magic first field", is.magic == M4_MAGIC_ICHING);
}


/* ===================================================================
 * FR 2.4.4: MODULO CASCADE (Cycle Engine)
 * =================================================================== */

static void test_modulo_cascade(void) {
    M4_Cycle_Engine eng = {0};
    eng.safety_threshold = 200;

    /* Initial state */
    TEST("cycle init stroke=0", eng.current_stroke == 0);
    TEST("cycle init storey=0", eng.current_storey == 0);
    TEST("cycle init decan=0", eng.current_decan == 0);

    /* Advance 24 times = 1 full stroke cycle */
    for (int i = 0; i < 24; i++) {
        m4_advance_transformation(&eng);
    }
    TEST("24 strokes -> stroke wraps to 0", eng.current_stroke == 0);

    /* After 24 strokes, storey should have advanced 12 times (every even stroke) */
    TEST("24 strokes -> storey wraps to 0", eng.current_storey == 0);

    /* Decan advances when storey % 4 == 0 */
    TEST("24 strokes -> decan advanced 3 times", eng.current_decan == 0);

    /* Single advance check */
    m4_advance_transformation(&eng);
    TEST("stroke 1 after wrap", eng.current_stroke == 1);

    /* Safety check */
    TEST("safe when arousal < threshold", m4_transformation_safe(&eng));
    eng.arousal_level = 250;
    TEST("unsafe when arousal > threshold", !m4_transformation_safe(&eng));
}


/* ===================================================================
 * FR 2.4.4: PROTOCOL LIBRARY (.rodata)
 * =================================================================== */

static void test_protocol_library(void) {
    /* 12x3 = 36 entries */
    for (int s = 0; s < 12; s++) {
        for (int d = 0; d < 3; d++) {
            const M4_Decan_Recipe_Card* card = &M4_PROTOCOL_LIBRARY[s][d];
            TEST("card storey matches", card->storey == (uint8_t)s);
            TEST("card decan matches", card->decan == (uint8_t)d);
            TEST("card element valid", card->element_focus <= 3);
            TEST("card chakra valid", card->chakra_focus <= 6);
        }
    }
}


/* ===================================================================
 * FR 2.4.9: SAFETY GOVERNOR
 * =================================================================== */

static void test_safety_governor(void) {
    M4_Cycle_Engine eng = { .arousal_level = 50, .safety_threshold = 200 };
    M4_Sympathetic_Medicine med = { .safety_level = 128, .contraindicated = false };
    M4_Sacred_Random rng = { .consent_granted = true };

    /* Normal: no stall */
    M4_Safety_Governor gov = m4_safety_check(&eng, &med, &rng);
    TEST("gov normal = STALL_NONE", gov.type == STALL_NONE);

    /* Contraindicated -> STALL_CONTRAINDICATED */
    med.contraindicated = true;
    gov = m4_safety_check(&eng, &med, &rng);
    TEST("gov contraindicated", gov.type == STALL_CONTRAINDICATED);
    TEST("gov severity=255", gov.severity == 255);
    med.contraindicated = false;

    /* Arousal overflow -> STALL_AROUSAL */
    eng.arousal_level = 250;
    gov = m4_safety_check(&eng, &med, &rng);
    TEST("gov arousal stall", gov.type == STALL_AROUSAL);
    eng.arousal_level = 50;

    /* No consent -> STALL_CONSENT */
    rng.consent_granted = false;
    gov = m4_safety_check(&eng, &med, &rng);
    TEST("gov consent stall", gov.type == STALL_CONSENT);

    /* NULL rng -> no consent stall */
    gov = m4_safety_check(&eng, &med, NULL);
    TEST("gov null rng = STALL_NONE", gov.type == STALL_NONE);

    /* Medicine safe inline */
    TEST("medicine safe normal", m4_medicine_safe(&med));
    med.contraindicated = true;
    TEST("medicine unsafe contraindicated", !m4_medicine_safe(&med));
    med.contraindicated = false;
    med.safety_level = 0;
    TEST("medicine unsafe level=0", !m4_medicine_safe(&med));
}


/* ===================================================================
 * FR 2.4.8: CONTAINER LUT
 * =================================================================== */

static void test_container_lut(void) {
    TEST("container count=3", M4_CONTAINER_COUNT == 3);
    TEST("container entry size=4", sizeof(M4_Container_Entry) == 4);

    /* Types: circle=0, temenos=1, vessel=2 */
    TEST("circle type=0",  M4_CONTAINER_LUT[0].container_type == 0);
    TEST("temenos type=1", M4_CONTAINER_LUT[1].container_type == 1);
    TEST("vessel type=2",  M4_CONTAINER_LUT[2].container_type == 2);

    /* Capacities */
    TEST("circle cap=1",  M4_CONTAINER_LUT[0].capacity == 1);
    TEST("temenos cap=2", M4_CONTAINER_LUT[1].capacity == 2);
    TEST("vessel cap=6",  M4_CONTAINER_LUT[2].capacity == 6);
}


/* ===================================================================
 * FR 2.4.5: JUNG COMPLEX — float-only rule
 * =================================================================== */

static void test_jung_complex(void) {
    M4_Jung_Complex c = { .archetype_id = 3, .charge = 0.75f, .autonomy = 0.5f, .conscious = false };
    TEST("complex arch=3", c.archetype_id == 3);
    TEST("complex charge", fabsf(c.charge - 0.75f) < 0.001f);
    TEST("complex autonomy", fabsf(c.autonomy - 0.5f) < 0.001f);
    TEST("complex not conscious", !c.conscious);

    /* Jungian type bit encoding */
    M4_Jung_Type introvert_thinker = JUNG_INTROVERT | JUNG_THINKING;
    TEST("introvert thinker = 0x02", introvert_thinker == 0x02);

    M4_Jung_Type extravert_feeler = JUNG_EXTRAVERT | JUNG_FEELING;
    TEST("extravert feeler = 0x24", extravert_feeler == 0x24);

    /* Alchemy stage transitions */
    TEST("prima->nigredo ok", m4_alchemy_can_advance(ALCH_PRIMA_MATERIA, ALCH_NIGREDO));
    TEST("nigredo->albedo ok", m4_alchemy_can_advance(ALCH_NIGREDO, ALCH_ALBEDO));
    TEST("skip stage fail", !m4_alchemy_can_advance(ALCH_PRIMA_MATERIA, ALCH_ALBEDO));
    TEST("reset to prima ok", m4_alchemy_can_advance(ALCH_RUBEDO, ALCH_PRIMA_MATERIA));
    TEST("transcendent->prima ok", m4_alchemy_can_advance(ALCH_TRANSCENDENT, ALCH_PRIMA_MATERIA));
}


/* ===================================================================
 * FR 2.4.10: VOICE CONFIG
 * =================================================================== */

static void test_voice_config(void) {
    TEST("voice config size=8", sizeof(M4_Voice_Config) == 8);

    /* Default config values from .rodata */
    TEST("voice formality=128", M4_VOICE_CONFIG.formality == 128);
    TEST("voice warmth=192", M4_VOICE_CONFIG.warmth == 192);
    TEST("voice directness=160", M4_VOICE_CONFIG.directness == 160);
    TEST("voice depth=200", M4_VOICE_CONFIG.depth == 200);
    TEST("voice metaphor=180", M4_VOICE_CONFIG.metaphor_density == 180);
    TEST("voice humor=80", M4_VOICE_CONFIG.humor == 80);
    TEST("voice challenge=100", M4_VOICE_CONFIG.challenge == 100);
}


/* ===================================================================
 * FR 2.4.5: MOBIUS RETURN
 * =================================================================== */

static void test_mobius_return(void) {
    M4_Identity_Matrix id = {0};
    id.quintessence_hash = 0xDEADBEEFCAFEBABEULL;
    id.computed = true;

    M4_Epii_Integration epii = {0};
    epii.wisdom_delta = 0x0000000000000042ULL;
    epii.return_ready = true;
    epii.logos.position = 4;
    epii.logos.cycle_count = 2;

    m4_mobius_return(&epii, &id);

    /* Hash XOR'd with wisdom delta */
    TEST("mobius hash mutated", id.quintessence_hash == (0xDEADBEEFCAFEBABEULL ^ 0x42ULL));
    /* Identity reseeded (computed = false) */
    TEST("mobius reseeds identity", !id.computed);
    /* Return ready cleared */
    TEST("mobius return_ready cleared", !epii.return_ready);
    /* Position reset to 0 */
    TEST("mobius position=0", epii.logos.position == 0);
    /* Cycle count incremented */
    TEST("mobius cycle_count=3", epii.logos.cycle_count == 3);
}


/* ===================================================================
 * FR 2.4.4: LENS REGISTRY
 * =================================================================== */

static void test_lens_registry(void) {
    /* 6 lenses, all populated */
    const char* expected_names[] = {
        "Gebser", "Ontological", "Epistemological",
        "Jungian Depth", "Phenomenological", "Trika/Kashmir"
    };
    for (int i = 0; i < 6; i++) {
        TEST("lens name set", M4_LENS_REGISTRY[i].lens_name != NULL);
        TEST("lens name matches", strcmp(M4_LENS_REGISTRY[i].lens_name, expected_names[i]) == 0);
        TEST("lens translate set", M4_LENS_REGISTRY[i].translate != NULL);
        TEST("lens activate set", M4_LENS_REGISTRY[i].activate != NULL);
        TEST("lens deactivate set", M4_LENS_REGISTRY[i].deactivate != NULL);
        TEST("lens annotate set", M4_LENS_REGISTRY[i].annotate != NULL);
    }

    /* Stub translate produces output */
    char buf[64] = {0};
    int rc = M4_LENS_REGISTRY[0].translate(0, "test", "ctx", buf, sizeof(buf));
    TEST("lens translate stub ok", rc == 0);
    TEST("lens translate stub output", strlen(buf) > 0);
}


/* ===================================================================
 * M4 API: init / teardown / verify
 * =================================================================== */

static void test_m4_api(void) {
    /* m4_verify should pass */
    TEST("m4_verify()", m4_verify());

    /* Init with arena */
    Coordinate_Arena arena;
    TEST("arena_init", arena_init(&arena, 64) == 0);

    /* Create mirror for position 4 */
    Holographic_Coordinate* hc = arena_alloc(&arena);
    hc->ql_position = 4;
    hc->family = FAMILY_NONE;

    M4_Root* root = m4_init(&arena, hc);
    TEST("m4_init not null", root != NULL);
    TEST("m4_init HC linked", root->hc == hc);
    TEST("m4_init CF set", root->active_cf != NULL);
    TEST("m4_init CF is FRACTAL", root->active_cf == cf_get(CF_FRACTAL));

    /* PCO initialized */
    TEST("pco identity not computed", !root->pco.identity.computed);
    TEST("pco safety threshold=200", root->pco.cycle.safety_threshold == 200);
    TEST("pco medicine safety=128", root->pco.medicine.safety_level == 128);
    TEST("pco lens registry wired", root->pco.lenses.registry != NULL);
    TEST("pco voice config wired", root->pco.epii.voice_config != NULL);
    TEST("pco alchemy ops wired", root->pco.medicine.ops[0] != NULL);

    /* Wrong position should fail */
    Holographic_Coordinate* wrong = arena_alloc(&arena);
    wrong->ql_position = 0;
    TEST("m4_init rejects pos!=4", m4_init(&arena, wrong) == NULL);

    /* NULL args */
    TEST("m4_init null arena", m4_init(NULL, hc) == NULL);
    TEST("m4_init null hc", m4_init(&arena, NULL) == NULL);

    m4_teardown(root);
    arena_destroy(&arena);

    /* Teardown NULL is safe */
    m4_teardown(NULL);
}


/* ===================================================================
 * MEF THRESHOLDS — monotonically increasing
 * =================================================================== */

static void test_mef_thresholds(void) {
    for (int i = 1; i < 6; i++) {
        TEST("MEF threshold monotonic",
             M4_LENS_MEF_THRESHOLD[i] > M4_LENS_MEF_THRESHOLD[i - 1]);
    }
    TEST("MEF[0]=20", M4_LENS_MEF_THRESHOLD[0] == 20);
    TEST("MEF[5]=120", M4_LENS_MEF_THRESHOLD[5] == 120);
}


/* ===================================================================
 * Main
 * =================================================================== */

int main(void) {
    printf("=== M4 (Nara) Verification Suite ===\n\n");

    test_elemental_throughline();
    test_symbol_dna_profile();
    test_identity_compute();
    test_blake3_determinism();
    test_temporal_now();
    test_sacred_random();
    test_iching_cast();
    test_tarot_draw();
    test_magic_numbers();
    test_modulo_cascade();
    test_protocol_library();
    test_safety_governor();
    test_container_lut();
    test_jung_complex();
    test_voice_config();
    test_mobius_return();
    test_lens_registry();
    test_m4_api();
    test_mef_thresholds();

    printf("\n=== Results: %d passed, %d failed (of %d) ===\n",
           pass_count, fail_count, pass_count + fail_count);

    return fail_count > 0 ? 1 : 0;
}
