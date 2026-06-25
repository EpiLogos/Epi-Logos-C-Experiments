/**
 * m0_verifier.c -- Verifier at position 0'/Anuttara.
 *
 * Substrate-context citation: the symbolic-coordinate-string vocabulary is
 * bound to Body/S/S5/epii-operational-capacities/
 * m5-prime-epii-on-anuttara-language-development.md as the canon-corpus
 * source named by DR-MP-1/DR-MP-3. The live Seed mirror of that document
 * carries the Anuttara language-development vocabulary; this module keeps the
 * kernel-side question namespace aligned to it.
 */

#include "m0_verifier.h"
#include <stdio.h>
#include <string.h>

static float clamp01(float value) {
    if (value < 0.0f) return 0.0f;
    if (value > 1.0f) return 1.0f;
    return value;
}

static uint16_t committed_mask(const KernelState* state) {
    uint16_t mask = state->committed_virtue_mask & 0x01FFu;
    return mask == 0u ? 0x01FFu : mask;
}

static uint8_t syntax_layer_for_virtue(uint8_t virtue_index) {
    if (virtue_index <= 2u) return 3u;
    if (virtue_index <= 4u) return 5u;
    if (virtue_index <= 7u) return 7u;
    return 9u;
}

static char syntax_code_for_layer(uint8_t layer) {
    switch (layer) {
        case 3u: return 'S';
        case 5u: return 'R';
        case 7u: return 'A';
        case 9u: return 'A';
        default: return 'X';
    }
}

static uint8_t virtue_r_factor(uint8_t virtue_index) {
    if (virtue_index < M0_VERIFIER_VIRTUE_COUNT &&
        VIRTUE_LUT[virtue_index].r_factor != 0xFFu) {
        return VIRTUE_LUT[virtue_index].r_factor;
    }
    return virtue_index;
}

static void add_constraint(
    M0VerifierReport* out,
    uint8_t r_factor,
    char syntax_code,
    uint8_t syntax_layer
) {
    if (out->unsatisfied_count >= M0_VERIFIER_MAX_UNSATISFIED) return;

    char* dst = out->unsatisfied_constraints[out->unsatisfied_count];
    (void)snprintf(
        dst,
        M0_VERIFIER_COORDINATE_MAX,
        "#R%u-0/1/%c-T%u-pending?",
        (unsigned)r_factor,
        syntax_code,
        (unsigned)syntax_layer
    );
    out->unsatisfied_count++;
}

static void add_literal_constraint(M0VerifierReport* out, const char* coordinate) {
    if (out->unsatisfied_count >= M0_VERIFIER_MAX_UNSATISFIED) return;

    char* dst = out->unsatisfied_constraints[out->unsatisfied_count];
    (void)snprintf(dst, M0_VERIFIER_COORDINATE_MAX, "%s", coordinate);
    out->unsatisfied_count++;
}

static void copy_coordinate(char dst[M0_VERIFIER_COORDINATE_MAX], const char* src) {
    (void)snprintf(dst, M0_VERIFIER_COORDINATE_MAX, "%s", src);
}

static uint8_t count_syntax_witnesses(uint16_t mask) {
    uint8_t count = 0u;
    if (mask & M0_VERIFIER_SYNTAX_SPEECH) count++;
    if (mask & M0_VERIFIER_SYNTAX_RELATIONSHIP) count++;
    if (mask & M0_VERIFIER_SYNTAX_ACTION) count++;
    if (mask & M0_VERIFIER_SYNTAX_COMPLETION) count++;
    return count;
}

static void populate_unified_act_metadata(
    const KernelState* state,
    M0VerifierReport* out
) {
    out->act_face = (uint8_t)(state->active_tct_position % 6u);
    out->witness_face = (uint8_t)(state->active_archetype % 6u);

    const uint16_t query_limit =
        out->unsatisfied_count < M0_VERIFIER_MAX_TYPED_QUERIES
            ? out->unsatisfied_count
            : M0_VERIFIER_MAX_TYPED_QUERIES;
    out->typed_query_count = query_limit;
    for (uint16_t i = 0u; i < query_limit; i++) {
        copy_coordinate(out->typed_queries[i], out->unsatisfied_constraints[i]);
    }

    out->backing_chain_count = 3u;
    copy_coordinate(out->backing_chain[0], "M0'-verifier");
    copy_coordinate(out->backing_chain[1], "R_FACTOR_DISTRIBUTION");
    copy_coordinate(out->backing_chain[2], "M0_CORE_RELATIONS");
}

int m0_verifier_check_state(const KernelState* state, M0VerifierReport* out) {
    if (!state || !out) return -1;

    memset(out, 0, sizeof(*out));

    const uint16_t mask = committed_mask(state);
    float virtue_total = 0.0f;
    uint8_t committed = 0u;

    for (uint8_t i = 0u; i < M0_VERIFIER_VIRTUE_COUNT; i++) {
        const float score = clamp01(state->virtue_evidence[i]);
        out->virtue_scores[i] = score;

        if ((mask & (uint16_t)(1u << i)) == 0u) {
            continue;
        }

        committed++;
        virtue_total += score;

        if (score >= M0_VERIFIER_VIRTUE_THRESHOLD) {
            out->virtue_witness_vector |= (uint16_t)(1u << i);
        } else {
            const uint8_t layer = syntax_layer_for_virtue(i);
            add_constraint(
                out,
                virtue_r_factor(i),
                syntax_code_for_layer(layer),
                layer
            );
        }
    }

    const float virtue_score = committed == 0u ? 1.0f : virtue_total / (float)committed;

    const float relation_score =
        state->observed_core_relation_count >= M0_CORE_RELATIONS_COUNT
            ? 1.0f
            : (float)state->observed_core_relation_count / (float)M0_CORE_RELATIONS_COUNT;
    if (state->observed_core_relation_count != M0_CORE_RELATIONS_COUNT) {
        add_constraint(out, 0u, 'R', 5u);
    }

    const uint16_t syntax_mask = state->syntax_layer_mask;
    if ((syntax_mask & M0_VERIFIER_SYNTAX_SPEECH) == 0u) {
        add_constraint(out, 0u, 'S', 3u);
    }
    if ((syntax_mask & M0_VERIFIER_SYNTAX_RELATIONSHIP) == 0u) {
        add_constraint(out, 1u, 'R', 5u);
    }
    if ((syntax_mask & M0_VERIFIER_SYNTAX_ACTION) == 0u) {
        add_constraint(out, 2u, 'A', 7u);
    }
    if ((syntax_mask & M0_VERIFIER_SYNTAX_COMPLETION) == 0u) {
        add_constraint(out, 5u, 'A', 9u);
    }

    const float syntax_score = (float)count_syntax_witnesses(syntax_mask) / 4.0f;
    out->slot_privacy_boundary_compliance =
        state->slot_privacy_boundary_compliance != 0u ? 1u : 0u;
    if (out->slot_privacy_boundary_compliance == 0u) {
        add_literal_constraint(out, "#R0-0/1/P-T0-slot-privacy-boundary?");
    }

    const float privacy_score =
        out->slot_privacy_boundary_compliance == 1u ? 1.0f : 0.0f;
    out->coherence_score =
        (virtue_score + relation_score + syntax_score + privacy_score) / 4.0f;
    populate_unified_act_metadata(state, out);

    return 0;
}

int m0_verifier_emit_question(
    const M0VerifierReport* report,
    char* out_buf,
    size_t buf_len
) {
    if (!report || !out_buf || buf_len == 0u) return -1;

    const char* question = "#R0-0/1/S-T3-pending?";
    if (report->unsatisfied_count > 0u &&
        report->unsatisfied_constraints[0][0] != '\0') {
        question = report->unsatisfied_constraints[0];
    }

    const int written = snprintf(out_buf, buf_len, "%s", question);
    if (written < 0 || (size_t)written >= buf_len) return -1;
    return 0;
}
