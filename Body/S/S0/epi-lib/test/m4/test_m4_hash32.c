/**
 * test_m4_hash32.c — M4 Quintessence Hash 32-Byte Contract Tests
 *
 * Verifies that quintessence_hash is exactly 32 bytes (full BLAKE3 output)
 * and that quintessence_preview is a derived hex string, not the identity.
 *
 * Canonical: 00-canonical-invariants.md §1
 */

#include <stdio.h>
#include <string.h>
#include "../../include/m4.h"

static int pass_count = 0;
static int fail_count = 0;

#define TEST(name, expr) do { \
    if (expr) { pass_count++; printf("  pass: %s\n", name); } \
    else { fail_count++; fprintf(stderr, "  FAIL: %s\n", name); } \
} while(0)


/* quintessence_hash must be exactly 32 bytes */
static void test_quintessence_hash_is_32_bytes(void) {
    M4_Identity_Matrix id;
    memset(&id, 0, sizeof(id));
    TEST("quintessence_hash is 32 bytes",
         (int)sizeof(id.quintessence_hash) == 32);
}

/* Preview buffer must exist and hold >= 64 chars + null */
static void test_hash_preview_is_derived_not_primary(void) {
    M4_Identity_Matrix id;
    memset(&id, 0, sizeof(id));
    TEST("quintessence_preview >= 65 bytes",
         (int)sizeof(id.quintessence_preview) >= 65);
}

/* After compute, preview must be exactly 64 hex chars */
static void test_preview_is_64_hex_chars_after_compute(void) {
    M4_Identity_Matrix id;
    memset(&id, 0, sizeof(id));

    M4_Input_Data input = {0};
    input.birth_year  = 1990;
    input.birth_month = 6;
    input.birth_day   = 15;
    input.mbti_raw    = 0xAB;

    m4_identity_compute(&id, &input);

    TEST("preview length == 64",
         (int)strlen(id.quintessence_preview) == 64);

    /* All chars must be lowercase hex [0-9a-f] */
    int all_hex = 1;
    for (int i = 0; i < 64; i++) {
        char c = id.quintessence_preview[i];
        if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))) {
            all_hex = 0;
            break;
        }
    }
    TEST("preview contains only lowercase hex chars", all_hex);
}

/* Preview must be consistent with hash bytes */
static void test_preview_matches_hash_bytes(void) {
    M4_Identity_Matrix id;
    memset(&id, 0, sizeof(id));

    M4_Input_Data input = {0};
    input.birth_year  = 2000;
    input.birth_month = 1;
    input.birth_day   = 1;
    input.mbti_raw    = 0x55;

    m4_identity_compute(&id, &input);

    /* Recompute expected preview from hash bytes */
    char expected[65];
    for (int i = 0; i < 32; i++) {
        snprintf(expected + i * 2, 3, "%02x", (unsigned)id.quintessence_hash[i]);
    }
    expected[64] = '\0';

    TEST("preview matches hash bytes",
         memcmp(id.quintessence_preview, expected, 64) == 0);
}


int main(void) {
    printf("=== M4 Quintessence Hash 32-Byte Contract ===\n\n");

    test_quintessence_hash_is_32_bytes();
    test_hash_preview_is_derived_not_primary();
    test_preview_is_64_hex_chars_after_compute();
    test_preview_matches_hash_bytes();

    printf("\n=== Results: %d passed, %d failed (of %d) ===\n",
           pass_count, fail_count, pass_count + fail_count);

    return fail_count > 0 ? 1 : 0;
}
