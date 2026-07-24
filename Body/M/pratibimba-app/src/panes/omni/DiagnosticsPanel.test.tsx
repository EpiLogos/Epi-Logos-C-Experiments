/**
 * Coordinate: M' `/` membrane (Diagnostics tab body tests — Track 27.T27.8)
 * Actualises: the Diagnostics tab is the telemetry fold — it renders LOCAL
 *   telemetry (readiness ledger, connection, tick, layout, intent log) even
 *   while disconnected (showing the disconnect, not blanking), derives an
 *   honest green/amber/red health light from real store state, switches +
 *   persists its sub-section, and renders honest ReadinessBanners for the two
 *   feeds absent from the wire (subscriber count, S2 ping).
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { useProvenanceStore, useTickStore } from '../../state/stores';
import { useReadinessStore } from '../../state/readinessStore';
import type { ReportedBinding } from '../../ui/bridgeReadiness';
import { hydrateOmniPanelSessionState, readOmniPanelSessionState } from './omnipanelSessionState';

function connect(connected: boolean, state: 'connected' | 'disconnected' = connected ? 'connected' : 'disconnected') {
    const prev = useProvenanceStore.getState().connection;
    useProvenanceStore.setState({ connection: { ...prev, connected, state } });
}

function seedReadiness(bindings: Record<string, ReportedBinding>) {
    useReadinessStore.setState({ bindings });
}

function seedTick(generation: number) {
    useTickStore.setState({
        generation,
        profile: {
            generation,
            cachedAtMs: generation * 1000,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'public',
            profile: { harmonicProfile: { tick12: generation % 12, degree720: 0 } }
        }
    });
}

const diagState = () => readOmniPanelSessionState().perTabState.diagnostics;

beforeEach(() => {
    hydrateOmniPanelSessionState(null);
    seedReadiness({});
    useTickStore.setState({ profile: null, generation: null });
    connect(false);
});
afterEach(() => cleanup());

describe('DiagnosticsPanel — the telemetry fold', () => {
    it('renders the panel + header even while disconnected, and shows the disconnect honestly', () => {
        connect(false);
        render(<DiagnosticsPanel />);
        expect(screen.getByTestId('diagnostics-panel')).toBeTruthy();
        expect(screen.getByTestId('diagnostics-header')).toBeTruthy();
        // red health light + the disconnect phrase — the fold SHOWS the disconnect.
        expect(screen.getByTestId('diagnostics-health-light').getAttribute('data-light')).toBe('red');
        expect(screen.getByTestId('diagnostics-health-phrase').textContent).toContain('WebSocket disconnected');
        // overview surfaces the gateway-ws state reading connected: no.
        expect(screen.getByTestId('gateway-ws-connected').textContent).toBe('no');
    });

    it('derives a green health light + "All systems ready" when connected and every binding is green', () => {
        connect(true);
        seedReadiness({
            's2.graph.node': { state: 'ready_public_current' },
            's5.review.inbox': { state: 'degraded_but_readable' }
        });
        seedTick(7);
        render(<DiagnosticsPanel />);
        expect(screen.getByTestId('diagnostics-health-light').getAttribute('data-light')).toBe('green');
        expect(screen.getByTestId('diagnostics-health-phrase').textContent).toBe('All systems ready');
        expect(screen.getByTestId('diagnostics-tick-generation').textContent).toBe('#7');
    });

    it('derives an amber health light when connected but a dimensional block is present', () => {
        connect(true);
        seedReadiness({ 's3.subscription': { state: 'profile_missing_field', reason: 'tick12 pending' } });
        render(<DiagnosticsPanel />);
        expect(screen.getByTestId('diagnostics-health-light').getAttribute('data-light')).toBe('amber');
        expect(screen.getByTestId('diagnostics-health-phrase').textContent).toContain('Bridge degraded');
    });

    it('passes the controller layout through, and reports (unbound) when none is passed', () => {
        connect(true);
        const { rerender } = render(<DiagnosticsPanel activeLayout="ide-deep" />);
        expect(screen.getByTestId('active-layout-value').textContent).toBe('ide-deep');
        rerender(<DiagnosticsPanel />);
        expect(screen.getByTestId('active-layout-value').textContent).toBe('(unbound)');
    });

    it('switches + persists the active sub-section', () => {
        connect(true);
        render(<DiagnosticsPanel />);
        // default renders the overview.
        expect(screen.getByTestId('diagnostics-body').getAttribute('data-active-section')).toBe('overview');
        fireEvent.click(screen.getByTestId('diagnostics-subsection-intent-log'));
        expect(diagState().activeSubSection).toBe('intent-log');
        expect(screen.getByTestId('cross-layout-intent-log')).toBeTruthy();
    });

    it('is honest about the subscriber-count feed absent from the wire (profile section)', () => {
        connect(true);
        render(<DiagnosticsPanel />);
        fireEvent.click(screen.getByTestId('diagnostics-subsection-profile'));
        const banner = screen.getByTestId('profile-tick-subscription-pending');
        expect(banner.getAttribute('data-state')).toBe('s3_subscription_blocked');
        expect(banner.textContent).toContain('subscriberCount');
    });

    it('is honest about the missing S2 ping method (s2-graph section)', () => {
        connect(true);
        render(<DiagnosticsPanel />);
        fireEvent.click(screen.getByTestId('diagnostics-subsection-s2-graph'));
        expect(screen.getByTestId('s2-graph-reachability')).toBeTruthy();
        const banner = screen.getByTestId('s2-graph-reachability-pending');
        expect(banner.getAttribute('data-state')).toBe('s2_graph_blocked');
        expect(banner.textContent).toContain('no s2 graph ping method on the wire');
    });
});
