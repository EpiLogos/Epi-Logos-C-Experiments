import * as React from 'react';
import {
    buildPiRuntimeMonitorProjection,
    type GatewayResolvedSessionSurface,
    type PortalTemporalSurfaceContract
} from '../common/run-model';

export interface PiRuntimeMonitorPanelProps {
    readonly portalTemporalSurface: PortalTemporalSurfaceContract;
    readonly resolvedSession: GatewayResolvedSessionSurface;
}

/**
 * Read-only Pi runtime observability view. It renders gateway and temporal
 * metadata only; raw terminal scrollback remains behind bounded capture tools.
 */
export function PiRuntimeMonitorPanel(props: PiRuntimeMonitorPanelProps): React.ReactElement {
    const projection = buildPiRuntimeMonitorProjection(props);
    return (
        <section
            className="acr-pi-runtime-monitor"
            data-test="pi-runtime-monitor"
            data-terminal-status={projection.terminalStatus}
            data-terminal-backed={projection.terminalBacked ? 'true' : 'false'}
        >
            <header className="acr-pi-runtime-monitor__header">
                <h4>Pi Runtime Monitor</h4>
                <span data-test="pi-runtime-session-key">{projection.sessionKey}</span>
            </header>
            <dl>
                <dt>Active agent</dt>
                <dd data-test="pi-runtime-active-agent">{projection.activeAgent}</dd>
                <dt>Role</dt>
                <dd data-test="pi-runtime-role">{projection.role}</dd>
                <dt>Team / chain lineage</dt>
                <dd data-test="pi-runtime-lineage">{projection.teamChainLineage.join(' > ') || 'none'}</dd>
                <dt>NOW / day</dt>
                <dd data-test="pi-runtime-now-day">{projection.nowDayLink}</dd>
                <dt>cmux projection</dt>
                <dd data-test="pi-runtime-cmux-projection">{projection.cmuxProjection}</dd>
                <dt>Terminal provider</dt>
                <dd data-test="pi-runtime-terminal-provider">{projection.terminalProvider}</dd>
                <dt>terminalStatus</dt>
                <dd data-test="pi-runtime-terminal-status">{projection.terminalStatus}</dd>
                <dt>leaseExpires</dt>
                <dd data-test="pi-runtime-lease-expires">{projection.leaseExpires}</dd>
                <dt>Last observed tick</dt>
                <dd data-test="pi-runtime-last-observed-tick">{projection.lastObservedTick}</dd>
                <dt>Capture availability</dt>
                <dd data-test="pi-runtime-capture-availability">{projection.captureAvailability}</dd>
                <dt>Capture handle</dt>
                <dd data-test="pi-runtime-capture-handle">{projection.captureHandleRef ?? 'none'}</dd>
                <dt>Last-run handle</dt>
                <dd data-test="pi-runtime-last-run-handle">{projection.redactedLastRunHandle}</dd>
            </dl>
            <ul data-test="pi-runtime-diagnostics-links">
                {projection.diagnosticsDeepLinks.map(link => (
                    <li key={link}>
                        <code>{link}</code>
                    </li>
                ))}
            </ul>
        </section>
    );
}
