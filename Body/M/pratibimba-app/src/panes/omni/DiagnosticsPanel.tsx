/**
 * Coordinate: M' `/` membrane (Diagnostics tab body — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the omniDiagnostics fold body (27.8 owns it).
 * Actualises: the Diagnostics tab IS the telemetry fold (spec 27.8) — a
 *   first-class, provenance-always-visible diagnostic (15-foundation §3), not a
 *   developer-only debug surface. It composes the overall-health header,
 *   kernel-bridge readiness ledger, matheme profile-generation readout,
 *   profile-tick subscription state, S2 graph reachability, gateway WebSocket
 *   state, active-layout display, and the cross-layout intent log. Unlike the
 *   genealogy folds it reads LOCAL telemetry stores, so it renders even while
 *   the gateway is disconnected — the disconnect is SHOWN (red health light +
 *   GatewayWebSocketState), never blanked. The sub-section selection persists in
 *   the OmniPanel session store (DiagnosticsTabState.activeSubSection). Every
 *   absent feed (subscriber count, S2 ping) renders an honest ReadinessBanner.
 * Public surface: DiagnosticsPanel.
 * Does NOT own: the readiness/tick/provenance stores, the intent-log buffer
 *   (state/crossLayoutIntentLog), session authority (S3), intent routing (27.9).
 */

import { useOmniPanelSessionStore, useOmniPanelTabState } from './omnipanelSessionState';
import { DiagnosticsHeader } from './diagnostics/DiagnosticsHeader';
import { KernelBridgeReadinessSummary } from './diagnostics/KernelBridgeReadinessSummary';
import { MathemeProfileGenerationDisplay } from './diagnostics/MathemeProfileGenerationDisplay';
import { ProfileTickSubscriptionState } from './diagnostics/ProfileTickSubscriptionState';
import { GatewayWebSocketState } from './diagnostics/GatewayWebSocketState';
import { ActiveLayoutDisplay } from './diagnostics/ActiveLayoutDisplay';
import { S2GraphReachability } from './diagnostics/S2GraphReachability';
import { CrossLayoutIntentLog } from './diagnostics/CrossLayoutIntentLog';

type DiagnosticsSubSection =
    | 'overview'
    | 'kernel-bridge'
    | 'profile'
    | 's2-graph'
    | 'gateway-ws'
    | 'intent-log';

const SUB_SECTIONS: readonly { readonly id: DiagnosticsSubSection; readonly label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'kernel-bridge', label: 'Kernel bridge' },
    { id: 'profile', label: 'Profile' },
    { id: 's2-graph', label: 'S2 graph' },
    { id: 'gateway-ws', label: 'Gateway WS' },
    { id: 'intent-log', label: 'Intent log' }
];

export interface DiagnosticsPanelProps {
    /** The active shell layout the controller passes in; unbound → "(unbound)". */
    readonly activeLayout?: 'daily-0-1' | 'ide-deep';
}

export function DiagnosticsPanel({ activeLayout }: DiagnosticsPanelProps = {}) {
    const tab = useOmniPanelTabState('diagnostics');
    const patchTab = useOmniPanelSessionStore(s => s.patchTab);
    // null persists as "default view"; the overview is the default rendering.
    const active: DiagnosticsSubSection = tab.activeSubSection ?? 'overview';

    const setSection = (id: DiagnosticsSubSection) =>
        patchTab('diagnostics', { activeSubSection: id });

    return (
        <section className="diagnostics-panel" data-testid="diagnostics-panel">
            <DiagnosticsHeader />

            <nav className="diagnostics-subsection-nav" role="group" aria-label="diagnostics section">
                {SUB_SECTIONS.map(section => (
                    <button
                        key={section.id}
                        type="button"
                        className={`diagnostics-subsection${active === section.id ? ' active' : ''}`}
                        data-testid={`diagnostics-subsection-${section.id}`}
                        aria-pressed={active === section.id}
                        onClick={() => setSection(section.id)}
                    >
                        {section.label}
                    </button>
                ))}
            </nav>

            <div className="diagnostics-body" data-testid="diagnostics-body" data-active-section={active}>
                {active === 'overview' && (
                    <>
                        <KernelBridgeReadinessSummary />
                        <GatewayWebSocketState />
                        <ActiveLayoutDisplay activeLayout={activeLayout} />
                    </>
                )}
                {active === 'kernel-bridge' && <KernelBridgeReadinessSummary />}
                {active === 'profile' && (
                    <>
                        <MathemeProfileGenerationDisplay />
                        <ProfileTickSubscriptionState />
                    </>
                )}
                {active === 's2-graph' && <S2GraphReachability />}
                {active === 'gateway-ws' && <GatewayWebSocketState />}
                {active === 'intent-log' && <CrossLayoutIntentLog />}
            </div>
        </section>
    );
}
