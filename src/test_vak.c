/* src/test_vak.c — VAK instruction infrastructure tests */
#include "ontology.h"
#include "psychoid_numbers.h"
#include "vak.h"
#include <stdio.h>
#include <assert.h>

static int tests_passed = 0;
static int tests_run = 0;

#define TEST(name) do { tests_run++; printf("  [%d] %s... ", tests_run, #name);
#define PASS tests_passed++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== VAK Infrastructure Tests ===\n");

    /* T1: VAK_Instruction struct size and field access */
    TEST(vak_instruction_size) {
        VAK_Instruction instr = {
            .vak_family = VAK_FAMILY_CF,
            .vak_index = 3,
            .target_branch = 2,
            .target_pos = 4,
            .is_inverted = 0
        };
        assert(sizeof(VAK_Instruction) == 5);
        assert(instr.vak_family == VAK_FAMILY_CF);
        assert(instr.vak_index == 3);
        assert(instr.target_branch == 2);
        assert(instr.target_pos == 4);
    } PASS;

    /* T2: VAK family constants map to reflective coordinates */
    TEST(vak_family_constants) {
        assert(VAK_FAMILY_CPF == 0);  /* cpf */
        assert(VAK_FAMILY_CT  == 1);  /* ct  */
        assert(VAK_FAMILY_CP  == 2);  /* cp  */
        assert(VAK_FAMILY_CF  == 3);  /* cf  */
        assert(VAK_FAMILY_CFP == 4);  /* cfp */
        assert(VAK_FAMILY_CS  == 5);  /* cs  */
        assert(VAK_FAMILY_COUNT == 6);
    } PASS;

    /* T3: VAK_FAMILY_NAME macro gives correct string */
    TEST(vak_family_names) {
        assert(VAK_FAMILY_NAMES[0][0] == 'C'); /* "CPF" */
        assert(VAK_FAMILY_NAMES[5][0] == 'C'); /* "CS" */
    } PASS;

    /* T4: execute_vak_instruction rejects invalid family */
    TEST(vak_reject_invalid_family) {
        VAK_Instruction bad = { .vak_family = 9 };
        int result = execute_vak_instruction(NULL, bad);
        assert(result == VAK_ERR_FAMILY);
    } PASS;

    /* T5: execute_vak_instruction rejects NULL session for valid families */
    TEST(vak_reject_null_session) {
        VAK_Instruction instr = { .vak_family = VAK_FAMILY_CPF };
        int result = execute_vak_instruction(NULL, instr);
        assert(result == VAK_ERR_SESSION);
    } PASS;

    printf("\n=== VAK Tests: %d/%d passed ===\n", tests_passed, tests_run);
    return (tests_passed == tests_run) ? 0 : 1;
}
