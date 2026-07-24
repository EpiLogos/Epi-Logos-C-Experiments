/**
 * Coordinate: M' `/` membrane (Gateway tab — sub-view switcher — Track 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni/gateway
 * Position (#n): the segmented control that folds the Gateway tab's facets.
 * Actualises: the spec's `<GatewaySubViewSwitcher />` (27.7) — a segmented
 *   control over the seven facets (Capabilities · Nodes · Models · Skills ·
 *   Cron · Config · Settings). Only `capabilities` is live in this tranche;
 *   the six ported-panel facets have no carrier port yet, so the tab body
 *   renders their honest feed-gated pending banner. The active facet is
 *   persisted by the tab body via `patchTab('gateway', { activeSubView })`.
 * Public surface: GatewaySubViewSwitcher, GATEWAY_SUB_VIEWS.
 * Does NOT own: the facet bodies, state persistence (omnipanelSessionState),
 *   or the capability feed.
 */

import type { GatewayTabState } from '../omnipanelSessionState';

export type GatewaySubView = GatewayTabState['activeSubView'];

export const GATEWAY_SUB_VIEWS: readonly { readonly id: GatewaySubView; readonly label: string }[] =
    Object.freeze([
        { id: 'capabilities', label: 'Capabilities' },
        { id: 'nodes', label: 'Nodes' },
        { id: 'models', label: 'Models' },
        { id: 'skills', label: 'Skills' },
        { id: 'cron', label: 'Cron' },
        { id: 'config', label: 'Config' },
        { id: 'settings', label: 'Settings' }
    ]);

export function GatewaySubViewSwitcher({
    activeSubView,
    onSelect
}: {
    readonly activeSubView: GatewaySubView;
    readonly onSelect: (id: GatewaySubView) => void;
}) {
    return (
        <div
            className="gateway-subview-switcher"
            data-testid="gateway-subview-switcher"
            role="tablist"
            aria-label="gateway sub-view"
        >
            {GATEWAY_SUB_VIEWS.map(view => {
                const active = view.id === activeSubView;
                return (
                    <button
                        key={view.id}
                        type="button"
                        role="tab"
                        className={`gateway-subview${active ? ' active' : ''}`}
                        data-testid={`gateway-subview-${view.id}`}
                        aria-selected={active}
                        onClick={() => onSelect(view.id)}
                    >
                        {view.label}
                    </button>
                );
            })}
        </div>
    );
}
