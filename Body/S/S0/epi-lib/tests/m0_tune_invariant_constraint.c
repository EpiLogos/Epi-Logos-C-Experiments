#include "m0.h"
#include <assert.h>
#include <string.h>

int main(void) {
    M0_TuneProposal proposal;
    memset(&proposal, 0, sizeof(proposal));
    strncpy(proposal.knob_key, "m3.tarot_codon_map", sizeof(proposal.knob_key) - 1u);
    proposal.target_structural_invariant = 1;

    M0_VerifierVerdict verdict =
        m0_check_tune_structural_invariant_compliance(&proposal);
    assert(verdict.violation == 1);
    assert(strstr(verdict.violation_name, "structural-invariant-violation") != NULL);

    M0_TuneProposal ok;
    memset(&ok, 0, sizeof(ok));
    strncpy(
        ok.knob_key,
        "mythos.symbolic_protein_reading.cosmic_weather_weights",
        sizeof(ok.knob_key) - 1u
    );
    ok.target_structural_invariant = 0;
    verdict = m0_check_tune_structural_invariant_compliance(&ok);
    assert(verdict.violation == 0);

    M0_TuneProposal privacy;
    memset(&privacy, 0, sizeof(privacy));
    strncpy(
        privacy.dispatch_purpose,
        "tuning-calibration",
        sizeof(privacy.dispatch_purpose) - 1u
    );
    strncpy(
        privacy.tuning_target_knob_privacy_class,
        "local-only",
        sizeof(privacy.tuning_target_knob_privacy_class) - 1u
    );
    strncpy(
        privacy.actual_resolved_slot_state,
        "cloud-opt-in",
        sizeof(privacy.actual_resolved_slot_state) - 1u
    );
    privacy.evidence_window_pasu_count = 1u;
    verdict = m0_check_slot_privacy_boundary_compliance(&privacy);
    assert(verdict.violation == 1);
    assert(strcmp(verdict.violation_name, "privacy-boundary-violation") == 0);

    strncpy(
        privacy.actual_resolved_slot_state,
        "local-default",
        sizeof(privacy.actual_resolved_slot_state) - 1u
    );
    privacy.evidence_window_pasu_count = 2u;
    verdict = m0_check_slot_privacy_boundary_compliance(&privacy);
    assert(verdict.violation == 1);

    privacy.evidence_window_pasu_count = 1u;
    verdict = m0_check_slot_privacy_boundary_compliance(&privacy);
    assert(verdict.violation == 0);

    strncpy(
        privacy.tuning_target_knob_privacy_class,
        "vector-derived",
        sizeof(privacy.tuning_target_knob_privacy_class) - 1u
    );
    strncpy(
        privacy.actual_resolved_slot_state,
        "cloud-opt-in",
        sizeof(privacy.actual_resolved_slot_state) - 1u
    );
    privacy.evidence_window_pasu_count = 4u;
    verdict = m0_check_slot_privacy_boundary_compliance(&privacy);
    assert(verdict.violation == 0);

    return 0;
}
