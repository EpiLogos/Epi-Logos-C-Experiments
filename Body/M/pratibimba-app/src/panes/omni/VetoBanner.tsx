/**
 * Coordinate: M' `/` membrane (Aletheia veto banner — Track 27.T27.3 / 12.T12.19)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the non-blocking veto surface. When an Aletheia subagent returns a
 *   veto (12.19), the affected dispatch node shows a RED banner naming the
 *   reason + what was missed. Per 12.19 the veto does NOT block the human gate —
 *   it surfaces as evidence. Renders nothing for a disclosure return.
 * Public surface: VetoBanner.
 * Does NOT own: the facet-return datum (omnipanelRuntime.ts), dispatch structure.
 */

import type { AletheiaFacetReturn } from './omnipanelRuntime';

export function VetoBanner({ facetReturn }: { readonly facetReturn: AletheiaFacetReturn }) {
    if (facetReturn.kind !== 'veto') {
        return null;
    }
    return (
        <div className="aletheia-veto-banner" data-testid="aletheia-veto-banner" role="status">
            <strong className="veto-label">Aletheia veto</strong>
            <span className="veto-reason">{facetReturn.reason}</span>
            {facetReturn.whatIsMissed && (
                <span className="veto-missed">missed: {facetReturn.whatIsMissed}</span>
            )}
            <span className="veto-nonblocking">non-blocking — the human gate still decides</span>
        </div>
    );
}
