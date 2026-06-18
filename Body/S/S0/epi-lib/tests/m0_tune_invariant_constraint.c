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

    return 0;
}
