/**
 * Coordinate: M' `/` membrane (Evidence tail — decision register entries, 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): the `<DecisionRegisterEntries />` sub-fold of EvidencePacketView.
 * Actualises: the decision-register readout linked to an evidence packet
 *   (spec 27.5: `s5'.decision_register.list_for_packet`). That method is a
 *   parallel 12.x audit deliverable and is NOT on the carrier wire yet, so this
 *   fold renders the spec-mandated honest ReadinessBanner — nothing is
 *   synthesised. It lights up the moment the read method lands.
 * Public surface: DecisionRegisterEntries.
 * Does NOT own: the decision register (S5'), the packet schema (evidenceShapes).
 */

import { ReadinessBanner } from '../../../ui/ReadinessBanner';

const DECISION_REGISTER_METHOD = "s5'.decision_register.list_for_packet";

export function DecisionRegisterEntries({ packetId }: { readonly packetId: string }) {
    // Feed-gated: the read method is not registered on the carrier gateway
    // (parallel 12.x audit owns it). Honest pending, per 27.5 discipline.
    return (
        <section className="evidence-decision-register" data-testid="evidence-decision-register" data-packet-id={packetId}>
            <span className="evidence-list-label">decision register</span>
            <ReadinessBanner
                state="degraded_but_readable"
                reason={`${DECISION_REGISTER_METHOD} is not on the carrier wire yet — decision-register entries land with the 12.x audit`}
            />
        </section>
    );
}
