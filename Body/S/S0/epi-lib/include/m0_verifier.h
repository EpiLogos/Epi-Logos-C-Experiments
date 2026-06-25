/**
 * m0_verifier.h -- M0 Anuttara structural coherence verifier.
 *
 * Position 0'/Anuttara constraint-checker over the R-virtues, M0 core
 * relation skeleton, and Track 19.9 four syntax layers.
 */

#ifndef M0_VERIFIER_H
#define M0_VERIFIER_H

#include "kernel.h"
#include "m0.h"
#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define M0_VERIFIER_VIRTUE_COUNT 9u
#define M0_VERIFIER_MAX_UNSATISFIED 80u
#define M0_VERIFIER_COORDINATE_MAX 96u
#define M0_VERIFIER_VIRTUE_THRESHOLD 0.5f
#define M0_VERIFIER_MAX_TYPED_QUERIES 6u
#define M0_VERIFIER_MAX_BACKING_CHAIN 6u

#define M0_VERIFIER_SYNTAX_SPEECH       (1u << 0) /* Track 19.9 layer 3 */
#define M0_VERIFIER_SYNTAX_RELATIONSHIP (1u << 1) /* Track 19.9 layer 5 */
#define M0_VERIFIER_SYNTAX_ACTION       (1u << 2) /* Track 19.9 layer 7 */
#define M0_VERIFIER_SYNTAX_COMPLETION   (1u << 3) /* Track 19.9 layer 9 */
#define M0_VERIFIER_SYNTAX_ALL \
    (M0_VERIFIER_SYNTAX_SPEECH | M0_VERIFIER_SYNTAX_RELATIONSHIP | \
     M0_VERIFIER_SYNTAX_ACTION | M0_VERIFIER_SYNTAX_COMPLETION)

typedef struct KernelState {
    uint16_t committed_virtue_mask; /* 0 means the canonical nine are committed. */
    float    virtue_evidence[M0_VERIFIER_VIRTUE_COUNT];
    uint16_t observed_core_relation_count;
    uint16_t syntax_layer_mask;
    uint8_t  active_archetype;
    uint8_t  active_tct_position;
    uint8_t  slot_privacy_boundary_compliance;
} KernelState;

typedef struct M0VerifierReport {
    uint16_t virtue_witness_vector;
    float    virtue_scores[M0_VERIFIER_VIRTUE_COUNT];
    uint16_t unsatisfied_count;
    char     unsatisfied_constraints[M0_VERIFIER_MAX_UNSATISFIED]
                                      [M0_VERIFIER_COORDINATE_MAX];
    float    coherence_score;
    uint8_t  slot_privacy_boundary_compliance;
    uint8_t  act_face;
    uint8_t  witness_face;
    uint16_t typed_query_count;
    char     typed_queries[M0_VERIFIER_MAX_TYPED_QUERIES]
                           [M0_VERIFIER_COORDINATE_MAX];
    uint16_t backing_chain_count;
    char     backing_chain[M0_VERIFIER_MAX_BACKING_CHAIN]
                           [M0_VERIFIER_COORDINATE_MAX];
} M0VerifierReport;

int m0_verifier_check_state(const KernelState* state, M0VerifierReport* out);
int m0_verifier_emit_question(
    const M0VerifierReport* report,
    char* out_buf,
    size_t buf_len
);

#ifdef __cplusplus
}
#endif

#endif /* M0_VERIFIER_H */
