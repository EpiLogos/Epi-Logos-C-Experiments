/**
 * test_pillar1_gaps.c — Pillar I Gap Closure Tests
 *
 * Comprehensive compile-time and runtime verification for all 4 gaps:
 *   Gap 1 (FR 1.2c): Psychoid_Hash boundary psychoid
 *   Gap 2 (FR 1.2d): 7 CF roots in .rodata
 *   Gap 3 (FR 1.3c/d): FAMILY_BITS and ARCH_BITS macros
 *   Gap 4 (FR 1.4): BEDROCK macro + flags byte (FR 1.5, 1.6)
 *
 * Compile & run:
 *   clang -std=c11 -Wall -Wextra -I include -fsanitize=address,undefined \
 *     src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
 *     src/test_pillar1_gaps.c -o test_pillar1 && ./test_pillar1
 */

#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>
#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"

/* =============================================================================
 * COMPILE-TIME ASSERTIONS (FR 1.1 + layout invariants)
 * ============================================================================= */

_Static_assert(sizeof(Holographic_Coordinate) == 128,
    "Holographic_Coordinate must be exactly 128 bytes");
_Static_assert(offsetof(Holographic_Coordinate, semantic_embedding) == 8,
    "Tensor Anchor must begin at byte 8");
_Static_assert(offsetof(Holographic_Coordinate, p) == 16,
    "Intra-Openness must begin at byte 16");
_Static_assert(offsetof(Holographic_Coordinate, invoke_process) == 112,
    "Execution zone must begin at byte 112");
_Static_assert(offsetof(Holographic_Coordinate, payload) == 120,
    "Payload zone must begin at byte 120");

/* Verify flags byte is at offset 3 (same position as old _pad) */
_Static_assert(offsetof(Holographic_Coordinate, flags) == 3,
    "flags byte must be at offset 3 in Identity zone");

/* =============================================================================
 * TEST HARNESS
 * ============================================================================= */

static int tests_run = 0;
static int tests_passed = 0;

#define CHECK(cond, msg) do { \
    tests_run++; \
    if (!(cond)) { \
        fprintf(stderr, "  FAIL: %s\n", msg); \
    } else { \
        tests_passed++; \
    } \
} while(0)

/* =============================================================================
 * GAP 1 TESTS: Psychoid_Hash (FR 1.2c)
 * ============================================================================= */

static void test_gap1_psychoid_hash(void) {
    printf("[gap1] Testing Psychoid_Hash (# boundary psychoid)...\n");

    CHECK(Psychoid_Hash.ql_position == 0xFF,
        "Psychoid_Hash.ql_position must be 0xFF");
    CHECK(Psychoid_Hash.family == FAMILY_NONE,
        "Psychoid_Hash.family must be FAMILY_NONE");
    CHECK(Psychoid_Hash.inversion_state == 0,
        "Psychoid_Hash.inversion_state must be 0 (the act itself is neutral)");
    CHECK(Psychoid_Hash.weave_state == 0.0f,
        "Psychoid_Hash.weave_state must be 0.0f (anchored to Ground)");

    CHECK(GET_PTR(Psychoid_Hash.c) == &Psychoid_0,
        "Psychoid_Hash.c must point to Psychoid_0 (returns to ground)");
    CHECK(GET_PTR(Psychoid_Hash.cf) == &Psychoid_4,
        "Psychoid_Hash.cf must point to Psychoid_4 (Lemniscate domain)");

    CHECK(Psychoid_Hash.invoke_process == Execute_Hash,
        "Psychoid_Hash.invoke_process must be Execute_Hash");

    /* Test Execute_Hash actually toggles inversion_state */
    Holographic_Coordinate test_target = {0};
    test_target.inversion_state = 0;
    Execute_Hash((Holographic_Coordinate*)&Psychoid_Hash, &test_target);
    CHECK(test_target.inversion_state == 1,
        "Execute_Hash must toggle 0 -> 1");
    Execute_Hash((Holographic_Coordinate*)&Psychoid_Hash, &test_target);
    CHECK(test_target.inversion_state == 0,
        "Execute_Hash must toggle 1 -> 0 (## = identity)");

    /* NULL safety */
    Execute_Hash((Holographic_Coordinate*)&Psychoid_Hash, NULL);
    /* No crash = pass */
    tests_run++;
    tests_passed++;

    printf("[gap1] Done.\n");
}

/* =============================================================================
 * GAP 2 TESTS: 7 CF Roots (FR 1.2d)
 * ============================================================================= */

static void test_gap2_cf_roots(void) {
    printf("[gap2] Testing 7 Context Frame roots...\n");

    const Holographic_Coordinate* cf_roots[] = {
        &CF_0000, &CF_01, &CF_012, &CF_0123, &CF_4x, &CF_450, &CF_50
    };
    const char* cf_names[] = {
        "CF_0000", "CF_01", "CF_012", "CF_0123", "CF_4x", "CF_450", "CF_50"
    };

    for (int i = 0; i < 7; i++) {
        char buf[128];

        /* All CF roots must anchor to Psychoid_4 via .cf */
        snprintf(buf, sizeof(buf), "%s.cf must == &Psychoid_4", cf_names[i]);
        CHECK(GET_PTR(cf_roots[i]->cf) == &Psychoid_4, buf);

        /* All must be FAMILY_NONE */
        snprintf(buf, sizeof(buf), "%s.family must be FAMILY_NONE", cf_names[i]);
        CHECK(cf_roots[i]->family == FAMILY_NONE, buf);

        /* All must have BIMBA_FLAGS */
        snprintf(buf, sizeof(buf), "%s.flags must have BIMBA_FLAGS", cf_names[i]);
        CHECK(cf_roots[i]->flags == BIMBA_FLAGS, buf);

        /* All must have an invoke_process */
        snprintf(buf, sizeof(buf), "%s must have invoke_process", cf_names[i]);
        CHECK(cf_roots[i]->invoke_process != NULL, buf);

        /* sizeof must be 128 for each */
        snprintf(buf, sizeof(buf), "sizeof(%s) must be 128", cf_names[i]);
        CHECK(sizeof(*cf_roots[i]) == 128, buf);
    }

    /* Specific wiring checks from the canonical spec */
    CHECK(GET_PTR(CF_0000.c) == &Psychoid_0,
        "CF_0000.c must point to Psychoid_0");
    CHECK(GET_PTR(CF_4x.c) == &Psychoid_4,
        "CF_4x.c must point to Psychoid_4 (self-fold)");
    CHECK(GET_PTR(CF_450.c) == &Psychoid_5,
        "CF_450.c must point to Psychoid_5");
    CHECK(GET_PTR(CF_50.c) == &Psychoid_0,
        "CF_50.c must point to Psychoid_0");

    /* Distinct weave_state values for each CF root */
    CHECK(CF_0000.weave_state == 0.0f, "CF_0000.weave_state == 0.0f");
    CHECK(CF_01.weave_state == 0.1f, "CF_01.weave_state == 0.1f");

    printf("[gap2] Done.\n");
}

/* =============================================================================
 * GAP 3 TESTS: FAMILY_BITS and ARCH_BITS (FR 1.3c/d)
 * ============================================================================= */

static void test_gap3_family_arch_bits(void) {
    printf("[gap3] Testing FAMILY_BITS and ARCH_BITS macros...\n");

    Holographic_Coordinate dummy = {0};
    Holographic_Coordinate* ptr = &dummy;

    /* FAMILY_BITS: set and get each family value */
    for (int fam = 0; fam <= 6; fam++) {
        Holographic_Coordinate* tagged = SET_FAMILY_BITS(ptr, fam);
        Coordinate_Family got = GET_FAMILY_BITS(tagged);
        char buf[128];
        snprintf(buf, sizeof(buf), "SET/GET_FAMILY_BITS roundtrip for family %d", fam);
        CHECK((int)got == fam, buf);

        /* GET_PTR must still recover the physical address */
        snprintf(buf, sizeof(buf), "GET_PTR after SET_FAMILY_BITS(%d)", fam);
        CHECK(GET_PTR(tagged) == ptr, buf);
    }

    /* ARCH_BITS: set and get each position value */
    uint8_t test_positions[] = {0, 1, 2, 3, 4, 5, 0xFF};
    for (int i = 0; i < 7; i++) {
        Holographic_Coordinate* tagged = SET_ARCH_BITS(ptr, test_positions[i]);
        uint8_t got = GET_ARCH_BITS(tagged);
        char buf[128];
        snprintf(buf, sizeof(buf), "SET/GET_ARCH_BITS roundtrip for position 0x%02X",
                 test_positions[i]);
        CHECK(got == test_positions[i], buf);

        /* GET_PTR must still recover the physical address */
        snprintf(buf, sizeof(buf), "GET_PTR after SET_ARCH_BITS(0x%02X)", test_positions[i]);
        CHECK(GET_PTR(tagged) == ptr, buf);
    }

    /* Combined: set all bits at once */
    {
        Holographic_Coordinate* tagged = ptr;
        tagged = SET_INVERTED(tagged);
        tagged = SET_FAMILY_BITS(tagged, FAMILY_C);
        tagged = SET_ARCH_BITS(tagged, 3);

        CHECK(IS_INVERTED(tagged), "Combined: IS_INVERTED");
        CHECK(GET_FAMILY_BITS(tagged) == FAMILY_C, "Combined: GET_FAMILY_BITS == FAMILY_C");
        CHECK(GET_ARCH_BITS(tagged) == 3, "Combined: GET_ARCH_BITS == 3");
        CHECK(GET_PTR(tagged) == ptr, "Combined: GET_PTR recovers address");
    }

    /* Verify masks don't overlap */
    CHECK((FAMILY_BITS_MASK & ARCH_BITS_MASK) == 0,
        "FAMILY_BITS_MASK and ARCH_BITS_MASK must not overlap");
    CHECK((FAMILY_BITS_MASK & FLAG_INVERTED) == 0,
        "FAMILY_BITS_MASK must not overlap FLAG_INVERTED");
    CHECK((FAMILY_BITS_MASK & FLAG_EXECUTING) == 0,
        "FAMILY_BITS_MASK must not overlap FLAG_EXECUTING");
    CHECK((ARCH_BITS_MASK & MASK_ADDRESS) == 0,
        "ARCH_BITS_MASK must not overlap MASK_ADDRESS");

    printf("[gap3] Done.\n");
}

/* =============================================================================
 * GAP 4 TESTS: BEDROCK macro + flags byte (FR 1.4, 1.5, 1.6)
 * ============================================================================= */

static void test_gap4_bedrock_and_flags(void) {
    printf("[gap4] Testing BEDROCK macro, BIMBA/PRATIBIMBA, flags byte...\n");

    /* BEDROCK on raw psychoids returns NULL */
    CHECK(BEDROCK(&Psychoid_0) == NULL,
        "BEDROCK(Psychoid_0) must be NULL (raw psychoid)");
    CHECK(BEDROCK(&Psychoid_Hash) == NULL,
        "BEDROCK(Psychoid_Hash) must be NULL (raw psychoid)");
    CHECK(BEDROCK(&CF_012) == NULL,
        "BEDROCK(CF_012) must be NULL (raw psychoid)");

    /* BEDROCK on family coordinates: allocate a test family coord */
    Coordinate_Arena arena;
    if (arena_init(&arena, 8) != 0) {
        fprintf(stderr, "  FAIL: arena_init failed\n");
        tests_run++;
        return;
    }

    PRATIBIMBA* fc = arena_alloc(&arena);
    fc->ql_position = 3;
    fc->family = (uint8_t)FAMILY_L;
    fc->semantic_embedding = (float*)&Psychoid_3;  /* bedrock wiring */

    Holographic_Coordinate* bedrock = BEDROCK(fc);
    CHECK(bedrock == (Holographic_Coordinate*)&Psychoid_3,
        "BEDROCK(L3) must point to Psychoid_3");
    CHECK(bedrock->ql_position == fc->ql_position,
        "BEDROCK->ql_position must match fc->ql_position");

    /* Flags byte: BIMBA_FLAGS = 0x21 */
    CHECK(BIMBA_FLAGS == 0x21, "BIMBA_FLAGS must be 0x21");
    CHECK((BIMBA_FLAGS & FLAG_BIMBA) != 0, "BIMBA_FLAGS must include FLAG_BIMBA");
    CHECK((BIMBA_FLAGS & FLAG_STATUS_CANONICAL) != 0,
        "BIMBA_FLAGS must include FLAG_STATUS_CANONICAL");

    /* All 7 psychoids + 3 weaves must have BIMBA_FLAGS */
    const Holographic_Coordinate* psychoids[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5,
        &Psychoid_Hash
    };
    for (int i = 0; i < 7; i++) {
        char buf[128];
        snprintf(buf, sizeof(buf), "Psychoid_%d flags == BIMBA_FLAGS",
                 psychoids[i]->ql_position);
        CHECK(psychoids[i]->flags == BIMBA_FLAGS, buf);
    }

    CHECK(Weave_0_5.flags == BIMBA_FLAGS, "Weave_0_5.flags == BIMBA_FLAGS");
    CHECK(Weave_5_0.flags == BIMBA_FLAGS, "Weave_5_0.flags == BIMBA_FLAGS");
    CHECK(Weave_5_5.flags == BIMBA_FLAGS, "Weave_5_5.flags == BIMBA_FLAGS");

    /* Element macros sanity */
    PRATIBIMBA* m2 = arena_alloc(&arena);
    m2->flags = ELEMENT_AGNI;  /* Fire */
    CHECK(GET_ELEMENT(m2) == 2, "GET_ELEMENT with ELEMENT_AGNI must return 2");
    m2->flags = ELEMENT_PRITHVI;  /* Earth */
    CHECK(GET_ELEMENT(m2) == 4, "GET_ELEMENT with ELEMENT_PRITHVI must return 4");

    /* Bedrock invariant: for family coords from families_init */
    Holographic_Coordinate* mirrors[6];
    const Holographic_Coordinate* raw[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };
    Coordinate_Arena arena2;
    arena_init(&arena2, 64);
    for (int i = 0; i < 6; i++) {
        mirrors[i] = arena_alloc(&arena2);
        mirrors[i]->ql_position = raw[i]->ql_position;
        mirrors[i]->family = FAMILY_NONE;
        mirrors[i]->weave_state = raw[i]->weave_state;
        mirrors[i]->invoke_process = raw[i]->invoke_process;
        mirrors[i]->c = (i == 0) ? mirrors[0] : mirrors[i - 1];
    }
    mirrors[5]->c = mirrors[0];

    families_init(&arena2, mirrors);

    /* Check bedrock wiring for all 36 family coords */
    int bedrock_ok = 1;
    for (uint32_t i = 6; i < arena2.count; i++) {
        Holographic_Coordinate* coord = &arena2.slots[i];
        if (coord->family == FAMILY_NONE) continue;
        Holographic_Coordinate* br = BEDROCK(coord);
        if (!br || br->ql_position != coord->ql_position) {
            fprintf(stderr, "  FAIL: BEDROCK invariant broken at slot %u "
                    "(family=%d, pos=%d)\n", i, coord->family, coord->ql_position);
            bedrock_ok = 0;
        }
    }
    tests_run++;
    if (bedrock_ok) tests_passed++;

    /* Check cf wiring: all family coords must anchor to Psychoid_4 */
    int cf_ok = 1;
    for (uint32_t i = 6; i < arena2.count; i++) {
        Holographic_Coordinate* coord = &arena2.slots[i];
        if (coord->family == FAMILY_NONE) continue;
        if (GET_PTR(coord->cf) != &Psychoid_4) {
            fprintf(stderr, "  FAIL: family coord slot %u cf != &Psychoid_4\n", i);
            cf_ok = 0;
        }
    }
    tests_run++;
    if (cf_ok) tests_passed++;

    arena_destroy(&arena);
    arena_destroy(&arena2);

    printf("[gap4] Done.\n");
}

/* =============================================================================
 * MAIN
 * ============================================================================= */

int main(void) {
    printf("=== Pillar I Gap Closure Tests ===\n\n");

    test_gap1_psychoid_hash();
    test_gap2_cf_roots();
    test_gap3_family_arch_bits();
    test_gap4_bedrock_and_flags();

    printf("\n=== Results: %d/%d tests passed ===\n", tests_passed, tests_run);

    if (tests_passed == tests_run) {
        printf("ALL TESTS PASSED.\n");
        return 0;
    } else {
        fprintf(stderr, "%d TESTS FAILED.\n", tests_run - tests_passed);
        return 1;
    }
}
