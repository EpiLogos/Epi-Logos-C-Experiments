/**
 * Coordinate: M' M5' chrome (Pi-monitor reframe banner — 28.T28.5 (c))
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): the first thing the deep control room says about itself.
 * Actualises: 28.5 (c). The surface is NOT a room where an agent is controlled;
 *   it is where the ONE Pi harness is monitored and its dispatch genealogy
 *   audited. The banner states the DR-M5-1 shape in the same breath — single
 *   harness, Anima dispatches, Aletheia surfaces in crystallisation-mode — so a
 *   reader who never opens the roster below still has the correct model. The
 *   widget id is unchanged and is rendered, because the reframe is a rename of
 *   the LABEL, not of the surface identity saved layouts and intents address.
 * Public surface: PiRuntimeMonitorBanner.
 * Does NOT own: the copy (`acrGovernance.ts::PI_RUNTIME_MONITOR_BANNER`).
 */

import { ACR_PANE_TITLE, ACR_WIDGET_ID, PI_RUNTIME_MONITOR_BANNER } from './acrGovernance';

export function PiRuntimeMonitorBanner() {
    return (
        <header
            className="acr-monitor-banner"
            data-testid="pi-runtime-monitor-banner"
            data-widget-id={ACR_WIDGET_ID}
        >
            <h3 className="acr-monitor-title" data-testid="acr-pane-title">
                {ACR_PANE_TITLE}
            </h3>
            <p className="acr-monitor-copy">{PI_RUNTIME_MONITOR_BANNER}</p>
        </header>
    );
}
