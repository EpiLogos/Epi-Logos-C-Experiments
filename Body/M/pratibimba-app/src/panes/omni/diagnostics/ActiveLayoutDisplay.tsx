/**
 * Coordinate: M' `/` membrane (active layout display — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's layout-active readout (27.8; 15.5).
 * Actualises: the spec's <ActiveLayoutDisplay /> — the active shell layout
 *   (`daily-0-1` · `ide-deep`) passed from the controller shell, plus the active
 *   OmniPanel tab read live from the session store. When the controller has not
 *   bound a layout, it renders "(unbound)" honestly rather than guessing one.
 * Public surface: ActiveLayoutDisplay.
 * Does NOT own: the layout shell, the OmniPanel session store law
 *   (panes/omni/omnipanelSessionState).
 */

import { useOmniPanelSessionStore } from '../omnipanelSessionState';
import type { LayoutId } from '../../../ui/layoutId';

export interface ActiveLayoutDisplayProps {
    readonly activeLayout?: LayoutId;
}

export function ActiveLayoutDisplay({ activeLayout }: ActiveLayoutDisplayProps) {
    const activeTab = useOmniPanelSessionStore(s => s.session.activeTab);

    return (
        <section className="active-layout-display" data-testid="active-layout-display">
            <h4 className="diagnostics-section-title">Active layout</h4>
            <dl className="active-layout-fields">
                <dt>layout</dt>
                <dd data-testid="active-layout-value">{activeLayout ?? '(unbound)'}</dd>
                <dt>active OmniPanel tab</dt>
                <dd data-testid="active-layout-tab">{activeTab}</dd>
            </dl>
        </section>
    );
}
