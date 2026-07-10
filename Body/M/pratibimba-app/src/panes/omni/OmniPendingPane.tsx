/**
 * Coordinate: M' `/` membrane (pending fold pane — Track 27.T27.0)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the honest pending body for OmniPanel folds whose panels
 *   have not landed yet — names the fold and its owning tranche, renders
 *   the live clock alignment (useProfileTick, 15.6) so the pending pane
 *   itself proves the re-render seam. Absence is pending, never faked.
 * Does NOT own: the manifest (omnipanelRuntime.ts) or any fold body.
 */

import { ProvenanceBadge } from '../../ui/primitives';
import { useProfileTick } from '../../state/useProfileTick';
import { omniPanelTabForComponent } from './omnipanelRuntime';

export function OmniPendingPane({ componentKey }: { readonly componentKey: string }) {
    const tab = omniPanelTabForComponent(componentKey);
    const tick = useProfileTick();

    return (
        <div
            className="pane-message"
            data-testid="omni-pending-pane"
            data-tab={tab?.id ?? 'unknown'}
            data-generation={tick.generation ?? 'none'}
        >
            <ProvenanceBadge
                state="pending"
                reason={tab ? `pending-tranche-${tab.owningTranche}` : 'unknown-fold'}
            />
            {tab ? (
                <>
                    {tab.label} fold — one substrate, eight ways. This fold's panel lands
                    with Tranche {tab.owningTranche}; until then the manifest names it and
                    nothing here is synthesised.
                </>
            ) : (
                <>unknown OmniPanel fold: {componentKey}</>
            )}
        </div>
    );
}
