/* test_kernel.c — bioquaternionic kernel mathematics */

#include "kernel.h"
#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <string.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

static int nearf(float a, float b) {
    return fabsf(a - b) < 0.0001f;
}

int main(void) {
    printf("=== Kernel Math Tests ===\n");

    TEST(epogdoon_constants_are_harmonic) {
        assert(KERNEL_EPOGDOON_NUM == 9u);
        assert(KERNEL_EPOGDOON_DEN == 8u);
        assert(nearf(kernel_epogdoon_ratio(), 1.125f));
        assert(nearf(kernel_epogdoon_log(), logf(9.0f / 8.0f)));
        assert(nearf(kernel_ratio_ascending_fourth(), 4.0f / 3.0f));
        assert(nearf(kernel_ratio_descending_fourth(), 3.0f / 4.0f));
        assert(nearf(kernel_ratio_descending_fifth(), 2.0f / 3.0f));
        assert(nearf(kernel_ratio_ascending_fifth(), 3.0f / 2.0f));
    } PASS;

    TEST(bioquaternion_init_normalizes_bimba_and_pratibimba) {
        Kernel_Bioquaternion state = kernel_bioquaternion_init(
            (Quaternion){ .w = 2.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f },
            (Quaternion){ .w = 0.0f, .x = 0.0f, .y = 3.0f, .z = 0.0f }
        );
        assert(quat_is_unit(state.q_b));
        assert(quat_is_unit(state.q_p));
        assert(nearf(state.q_b.w, 1.0f));
        assert(nearf(state.q_p.y, 1.0f));
    } PASS;

    TEST(bioquaternion_init_handles_zero_and_nonzero_tiny_axes) {
        Kernel_Bioquaternion zero_state = kernel_bioquaternion_init(
            (Quaternion){ .w = 0.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f },
            (Quaternion){ .w = 0.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f }
        );
        assert(nearf(zero_state.q_b.w, 1.0f));
        assert(nearf(zero_state.q_p.w, 1.0f));

        Kernel_Bioquaternion tiny_state = kernel_bioquaternion_init(
            (Quaternion){ .w = 0.0f, .x = 0.000001f, .y = 0.0f, .z = 0.0f },
            (Quaternion){ .w = 0.0f, .x = 0.0f, .y = 0.000001f, .z = 0.0f }
        );
        assert(nearf(tiny_state.q_b.x, 1.0f));
        assert(nearf(tiny_state.q_p.y, 1.0f));
    } PASS;

    TEST(slash_flip_conjugates_pratibimba_into_bimba_prime) {
        Kernel_Bioquaternion state = kernel_bioquaternion_init(
            (Quaternion){ .w = 1.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f },
            (Quaternion){ .w = 0.5f, .x = 0.5f, .y = 0.5f, .z = 0.5f }
        );
        Quaternion b_prime = kernel_slash_flip_bimba_prime(state);
        assert(quat_is_unit(b_prime));
        assert(nearf(b_prime.w, 0.5f));
        assert(nearf(b_prime.x, -0.5f));
        assert(nearf(b_prime.y, -0.5f));
        assert(nearf(b_prime.z, -0.5f));
    } PASS;

    TEST(quaternion_distance_energy_is_squared_latent_distance) {
        float energy = kernel_quat_distance_sq(
            (Quaternion){ .w = 1.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f },
            (Quaternion){ .w = 0.0f, .x = 1.0f, .y = 0.0f, .z = 0.0f }
        );
        assert(nearf(energy, 2.0f));
    } PASS;

    TEST(resonance_indexing_and_tritone_square_emphasis_are_72_fold) {
        assert(kernel_resonance_index(0, 0, 0) == 0u);
        assert(kernel_resonance_index(0, 1, 0) == 6u);
        assert(kernel_resonance_index(5, 1, 5) == 71u);
        assert(kernel_resonance_index(6, 0, 0) == 0xFFu);
        assert(kernel_resonance_index(0, 2, 0) == 0xFFu);
        assert(kernel_resonance_index(0, 0, 6) == 0xFFu);
        assert(kernel_tritone_square_for_lens(0) == 0u);
        assert(kernel_tritone_square_for_lens(5) == 0u);
        assert(kernel_tritone_square_for_lens(1) == 1u);
        assert(kernel_tritone_square_for_lens(4) == 1u);
        assert(kernel_tritone_square_for_lens(2) == 2u);
        assert(kernel_tritone_square_for_lens(3) == 2u);
        assert(kernel_tritone_square_for_lens(6) == 0xFFu);

        Kernel_Resonance_Vector vector;
        memset(&vector, 0, sizeof(vector));
        for (uint8_t helix = 0; helix < 2u; helix++) {
            for (uint8_t pos = 0; pos < 6u; pos++) {
                vector.values[kernel_resonance_index(0, helix, pos)] = 1.0f;
                vector.values[kernel_resonance_index(5, helix, pos)] = 1.0f;
            }
        }
        float squares[3] = {0.0f, 0.0f, 0.0f};
        kernel_resonance_square_emphasis(&vector, squares);
        assert(nearf(squares[0], 1.0f));
        assert(nearf(squares[1], 0.0f));
        assert(nearf(squares[2], 0.0f));

        squares[0] = 9.0f;
        squares[1] = 9.0f;
        squares[2] = 9.0f;
        kernel_resonance_square_emphasis(NULL, squares);
        assert(nearf(squares[0], 0.0f));
        assert(nearf(squares[1], 0.0f));
        assert(nearf(squares[2], 0.0f));
    } PASS;

    TEST(energy_decomposition_combines_latent_lens_and_r_energy) {
        Kernel_Bioquaternion state = kernel_bioquaternion_init(
            (Quaternion){ .w = 1.0f, .x = 0.0f, .y = 0.0f, .z = 0.0f },
            (Quaternion){ .w = 0.0f, .x = 1.0f, .y = 0.0f, .z = 0.0f }
        );
        Kernel_Resonance_Vector observed;
        Kernel_Resonance_Vector target;
        memset(&observed, 0, sizeof(observed));
        memset(&target, 0, sizeof(target));
        observed.values[0] = 1.0f;

        Kernel_Energy energy = kernel_energy_evaluate(state, &observed, &target, 0.25f);
        assert(nearf(energy.bimba_pratibimba_energy, 2.0f));
        assert(nearf(energy.lens_energy, 1.0f / 72.0f));
        assert(nearf(energy.r_energy, 0.25f));
        assert(nearf(energy.total_energy, 2.0f + (1.0f / 72.0f) + 0.25f));

        Kernel_Energy null_lens_energy = kernel_energy_evaluate(state, NULL, NULL, 0.25f);
        assert(nearf(null_lens_energy.lens_energy, 0.0f));
        assert(nearf(null_lens_energy.total_energy, 2.0f + 0.25f));
    } PASS;

    TEST(tick_phase_maps_12_epogdoons_to_8_elements) {
        Kernel_Tick tick0 = kernel_tick_from_epogdoon(3u, 0u);
        Kernel_Tick tick5 = kernel_tick_from_epogdoon(3u, 5u);
        Kernel_Tick tick6 = kernel_tick_from_epogdoon(3u, 6u);
        Kernel_Tick tick11 = kernel_tick_from_epogdoon(3u, 11u);

        assert(tick0.cycle == 3u);
        assert(tick0.sub_tick == 0u);
        assert(tick0.phase == KERNEL_PHASE_DESCENT);
        assert(tick0.element == KERNEL_ELEMENT_BIMBA_ENCODING);
        assert(tick5.phase == KERNEL_PHASE_DESCENT);
        assert(tick6.phase == KERNEL_PHASE_ASCENT);
        assert(tick11.element == KERNEL_ELEMENT_ENRICHED_RETURN);
        assert(kernel_tick_from_epogdoon(3u, 12u).sub_tick == 0u);
        assert(kernel_tick_from_epogdoon(3u, 23u).sub_tick == 11u);
    } PASS;

    printf("\n=== Kernel Math: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
