/* src/test_m0_init.c — M0 init/teardown + VAK integration */
#include "m0.h"
#include "arena.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M0 Init Tests ===\n");

    /* Setup arena and mirrors */
    Coordinate_Arena arena;
    assert(arena_init(&arena, 64) == 0);

    Holographic_Coordinate* mirrors[6];
    const Holographic_Coordinate* raw[] = {
        &Psychoid_0, &Psychoid_1, &Psychoid_2,
        &Psychoid_3, &Psychoid_4, &Psychoid_5
    };
    for (int i = 0; i < 6; i++) {
        mirrors[i] = arena_alloc(&arena);
        mirrors[i]->ql_position = raw[i]->ql_position;
        mirrors[i]->family = FAMILY_NONE;
        mirrors[i]->weave_state = raw[i]->weave_state;
        mirrors[i]->invoke_process = raw[i]->invoke_process;
    }

    /* T1: m0_init creates a valid M0_Root */
    TEST(m0_init_creates_root) {
        M0_Root* root = m0_init(&arena, mirrors[0]);
        assert(root != NULL);
        assert(root->hc == mirrors[0]);
        assert(mirrors[0]->payload.process_state == root);
        assert(root->active_cf == cf_get(CF_VOID));
    } PASS;

    /* T2: m0_init rejects wrong ql_position */
    TEST(m0_init_rejects_wrong_position) {
        M0_Root* bad = m0_init(&arena, mirrors[3]); /* #3, not #0 */
        assert(bad == NULL);
    } PASS;

    /* T3: Holographic registry verification */
    TEST(holographic_registry) {
        assert(m0_verify_holographic_registry());
    } PASS;

    /* T4: VAK handlers registered (unimplemented families return stub) */
    TEST(vak_handler_registered) {
        VAK_Instruction instr = { .vak_family = VAK_FAMILY_CPF, .vak_index = 0 };
        int result = execute_vak_instruction(mirrors[0], instr);
        /* After m0_init, CPF handler should be registered and return success */
        assert(result == VAK_SUCCESS || result == VAK_ERR_INDEX);
    } PASS;

    /* T5: m0_teardown clears HC link */
    TEST(m0_teardown) {
        M0_Root* root = (M0_Root*)mirrors[0]->payload.process_state;
        m0_teardown(root);
        assert(mirrors[0]->payload.process_state == NULL);
    } PASS;

    arena_destroy(&arena);

    printf("\n=== M0 Init: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
