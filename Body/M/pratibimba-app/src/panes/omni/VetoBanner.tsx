/**
 * Coordinate: M' `/` membrane (Aletheia veto banner — Track 27.T27.3 / 12.T12.19 / 26.T26.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the non-blocking veto surface. When an Aletheia subagent returns a
 *   veto (12.19), the affected dispatch node shows a RED banner naming the
 *   reason + what was missed. Per 12.19 the veto does NOT block the human gate —
 *   it surfaces as evidence. Renders nothing for a disclosure return.
 *
 *   26.T26.9 — THE BANNER NAMES THE SUBAGENT. 26.9 specifies the line verbatim:
 *   "Aletheia subagent {name} veto — {reason}". This banner rendered an
 *   anonymous "Aletheia veto" because the carrier's facet-return type had
 *   dropped the `facet` field the substrate contract carries on both variants
 *   (`gateway-contract/src/aletheia.rs::FacetReturn`). The field is restored and
 *   required, so the name is a compile-time guarantee rather than a hope; and
 *   `data-blocking` now states the 12.19 claim on the element itself, off the
 *   ONE shared constant the Atelier banner also reads — the two surfaces cannot
 *   disagree about whether a veto blocks.
 * Public surface: VetoBanner.
 * Does NOT own: the facet-return datum (omnipanelRuntime.ts), the veto law or
 *   the banner text (aletheiaSubagents.ts), dispatch structure.
 */

import {
    ALETHEIA_VETO_BLOCKS_HUMAN_GATE,
    vetoBannerText
} from './aletheiaSubagents';
import type { AletheiaFacetReturn } from './omnipanelRuntime';

export function VetoBanner({ facetReturn }: { readonly facetReturn: AletheiaFacetReturn }) {
    if (facetReturn.kind !== 'veto') {
        return null;
    }
    return (
        <div
            className="aletheia-veto-banner"
            data-testid="aletheia-veto-banner"
            data-facet={facetReturn.facet}
            data-blocking={String(ALETHEIA_VETO_BLOCKS_HUMAN_GATE)}
            role="status"
        >
            <strong className="veto-label">
                {vetoBannerText(facetReturn.facet, facetReturn.reason)}
            </strong>
            {facetReturn.whatIsMissed && (
                <span className="veto-missed">missed: {facetReturn.whatIsMissed}</span>
            )}
            <span className="veto-nonblocking">non-blocking — the human gate still decides</span>
        </div>
    );
}
