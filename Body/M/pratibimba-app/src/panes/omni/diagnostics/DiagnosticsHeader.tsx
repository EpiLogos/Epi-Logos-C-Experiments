/**
 * Coordinate: M' `/` membrane (Diagnostics header — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's overall-health summary (27.8).
 * Actualises: the green/amber/red health light + summary phrase the spec's
 *   <DiagnosticsHeader /> declares — derived ONLY from the live connection
 *   (useProvenanceStore) and the readiness ledger (useReadinessStore), never a
 *   fabricated status. Carries the last profile tick (the 15.6 UI clock) as the
 *   honest "last tick" marker.
 * Public surface: DiagnosticsHeader, deriveDiagnosticsHealth.
 * Does NOT own: the readiness taxonomy (ui/bridgeReadiness), the tick store law
 *   (state/stores), the connection transport (bridge/gatewayClient).
 */

import { useProfileTick } from '../../../state/useProfileTick';
import { useProvenanceStore, useTickStore } from '../../../state/stores';
import { useReadinessStore } from '../../../state/readinessStore';
import { readinessTier } from '../../../ui/bridgeReadiness';
import type { ReportedBinding } from '../../../ui/bridgeReadiness';

export type DiagnosticsHealthLight = 'green' | 'amber' | 'red';

export interface DiagnosticsHealth {
    readonly light: DiagnosticsHealthLight;
    readonly phrase: string;
}

/**
 * Derive the overall health light + phrase from the two ground-truth threads:
 * the WebSocket connection and the per-binding readiness ledger. No datum is
 * invented — a green light with zero bindings is reported honestly as
 * "awaiting readiness reports", never "all systems ready".
 */
export function deriveDiagnosticsHealth(
    connected: boolean,
    bindings: Readonly<Record<string, ReportedBinding>>
): DiagnosticsHealth {
    if (!connected) {
        return { light: 'red', phrase: 'Gateway blocked — WebSocket disconnected' };
    }
    const entries = Object.entries(bindings);
    const worstRed = entries.find(([, binding]) => readinessTier(binding.state) === 'red');
    if (worstRed) {
        const [key, binding] = worstRed;
        return { light: 'red', phrase: `Bridge blocked — ${key} (${binding.state})` };
    }
    const worstAmber = entries.find(([, binding]) => readinessTier(binding.state) === 'amber');
    if (worstAmber) {
        const [key, binding] = worstAmber;
        return { light: 'amber', phrase: `Bridge degraded — ${key} (${binding.state})` };
    }
    if (entries.length === 0) {
        return { light: 'green', phrase: 'Connected — awaiting readiness reports' };
    }
    return { light: 'green', phrase: 'All systems ready' };
}

export function DiagnosticsHeader() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const bindings = useReadinessStore(s => s.bindings);
    const tick = useProfileTick();
    const cachedAtMs = useTickStore(s => s.profile?.cachedAtMs ?? null);

    const health = deriveDiagnosticsHealth(connected, bindings);

    return (
        <header className="diagnostics-header" data-testid="diagnostics-header">
            <div className="diagnostics-health">
                <span
                    className={`diagnostics-health-light diagnostics-health-${health.light}`}
                    data-testid="diagnostics-health-light"
                    data-light={health.light}
                    role="img"
                    aria-label={`health ${health.light}`}
                />
                <strong className="diagnostics-health-phrase" data-testid="diagnostics-health-phrase">
                    {health.phrase}
                </strong>
            </div>
            <div className="diagnostics-header-tick" data-testid="diagnostics-last-tick">
                <span className="diagnostics-tick-label">last tick</span>
                <span className="diagnostics-tick-generation" data-testid="diagnostics-tick-generation">
                    {tick.generation === null ? 'no tick yet' : `#${tick.generation}`}
                </span>
                {cachedAtMs !== null && (
                    <span className="diagnostics-tick-at" data-testid="diagnostics-tick-at">
                        {new Date(cachedAtMs).toISOString()}
                    </span>
                )}
            </div>
        </header>
    );
}
