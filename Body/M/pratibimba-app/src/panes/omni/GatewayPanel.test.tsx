/**
 * Coordinate: M' `/` membrane (Gateway tab body tests — Track 27.T27.7)
 * Actualises: the Gateway tab folds the REAL `s4'.mediation.capabilities.list`
 *   snapshot into a capability list (parity + privacy-gated try-it), persists
 *   its sub-view + selection, renders the honest `bridge_unavailable` banner on
 *   disconnect/parse-error, and renders the honest feed-gated pending banner
 *   for the six un-ported facets. No capability datum is ever fabricated.
 */

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../state/stores';
import { useReadinessStore } from '../../state/readinessStore';
import { GatewayPanel } from './GatewayPanel';
import {
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    S4_MEDIATION_ROUTE_METHOD
} from './omnipanelCapabilities';
import { hydrateOmniPanelSessionState, readOmniPanelSessionState } from './omnipanelSessionState';

const SNAPSHOT = {
    owner: "S4'",
    method: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    routesThrough: S4_MEDIATION_ROUTE_METHOD,
    dispatchTools: ['dispatch_agent', 'dispatch_moirai_night_pass'],
    aletheiaModeInternalTools: ['dispatch_moirai_night_pass', 'aletheia_crystallise'],
    capabilities: [
        { name: 'dispatch_agent', entitlementClass: 'standard' },
        { name: 'dispatch_moirai_night_pass', entitlementClass: 'aletheia-mode-internal' },
        { name: 'aletheia_crystallise', entitlementClass: 'aletheia-mode-internal' }
    ]
};

beforeEach(() => {
    hydrateOmniPanelSessionState(null);
    useReadinessStore.getState().clear();
});
afterEach(() => {
    cleanup();
    setGateway(null);
    useProvenanceStore.setState({ connection: { ...useProvenanceStore.getState().connection, connected: false } });
});

function connect(connected: boolean) {
    const prev = useProvenanceStore.getState().connection;
    useProvenanceStore.setState({ connection: { ...prev, connected } });
}

function mockCapabilities(artifact: unknown) {
    const invoke = vi.fn().mockImplementation(async (method: string) =>
        method === S4_MEDIATION_CAPABILITIES_LIST_METHOD ? { artifact } : { artifact: null }
    );
    setGateway({ invoke } as never);
    return invoke;
}

const gatewayState = () => readOmniPanelSessionState().perTabState.gateway;

describe('GatewayPanel — capability list + parity + readiness + try-it', () => {
    it('folds the live S4 capability snapshot into per-capability rows', async () => {
        mockCapabilities(SNAPSHOT);
        connect(true);
        render(<GatewayPanel />);

        await screen.findByTestId('capability-list-view');
        const rows = screen.getAllByTestId('capability-row');
        expect(rows).toHaveLength(3);
        expect(rows.map(row => row.getAttribute('data-capability'))).toEqual([
            'dispatch_agent',
            'dispatch_moirai_night_pass',
            'aletheia_crystallise'
        ]);
    });

    it('privacy-gates try-it: only standard capabilities expose the affordance', async () => {
        mockCapabilities(SNAPSHOT);
        connect(true);
        render(<GatewayPanel />);
        await screen.findByTestId('capability-list-view');

        const standardRow = screen.getByText('dispatch_agent').closest('[data-testid="capability-row"]')!;
        const internalRow = screen.getByText('aletheia_crystallise').closest('[data-testid="capability-row"]')!;
        expect(within(standardRow as HTMLElement).queryByTestId('try-it-affordance')).toBeTruthy();
        expect(within(internalRow as HTMLElement).queryByTestId('try-it-affordance')).toBeNull();
    });

    it('persists the selected capability when a row is chosen', async () => {
        mockCapabilities(SNAPSHOT);
        connect(true);
        render(<GatewayPanel />);
        await screen.findByTestId('capability-list-view');

        fireEvent.click(screen.getByText('dispatch_moirai_night_pass'));
        expect(gatewayState().selectedCapabilityName).toBe('dispatch_moirai_night_pass');
    });

    it('is honest when disconnected — bridge_unavailable naming the method, no list', () => {
        connect(false);
        render(<GatewayPanel />);
        const banner = screen.getByTestId('gateway-capabilities-unavailable');
        expect(banner.getAttribute('data-state')).toBe('bridge_unavailable');
        expect(banner.textContent).toContain(S4_MEDIATION_CAPABILITIES_LIST_METHOD);
        expect(screen.queryByTestId('capability-list-view')).toBeNull();
    });

    it('renders the honest feed-gated pending banner for an un-ported facet + persists the sub-view', async () => {
        mockCapabilities(SNAPSHOT);
        connect(true);
        render(<GatewayPanel />);
        await screen.findByTestId('capability-list-view');

        fireEvent.click(screen.getByTestId('gateway-subview-nodes'));
        const banner = screen.getByTestId('gateway-facet-pending-nodes');
        expect(banner.textContent).toContain('no carrier port yet');
        expect(screen.queryByTestId('capability-list-view')).toBeNull();
        expect(gatewayState().activeSubView).toBe('nodes');
    });

    it('is honest on a malformed snapshot — bridge_unavailable, never a synthesized list', async () => {
        mockCapabilities({ owner: 'not-s4', garbage: true });
        connect(true);
        render(<GatewayPanel />);

        const banner = await screen.findByTestId('gateway-capabilities-error');
        expect(banner.getAttribute('data-state')).toBe('bridge_unavailable');
        expect(screen.queryByTestId('capability-list-view')).toBeNull();
    });

    it('re-invokes the capability loader on refresh', async () => {
        const invoke = mockCapabilities(SNAPSHOT);
        connect(true);
        render(<GatewayPanel />);
        await screen.findByTestId('capability-list-view');
        const callsAfterMount = invoke.mock.calls.length;

        fireEvent.click(screen.getByTestId('gateway-refresh'));
        await screen.findByTestId('capability-list-view');
        expect(invoke.mock.calls.length).toBeGreaterThan(callsAfterMount);
    });
});
