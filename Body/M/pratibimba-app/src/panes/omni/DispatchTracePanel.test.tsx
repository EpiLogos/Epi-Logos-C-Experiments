/**
 * Coordinate: M' `/` membrane (Dispatch Trace tab body tests — Track 27.T27.3)
 * Actualises: the anti-bypass guarantee + the full 27.3 surface — the Dispatch
 *   tab renders the real Pi -> subagent genealogy tree as its PRIMARY body
 *   (subagents nested under their dispatcher; Aletheia fan-outs grouped in
 *   crystallisation-mode; psyche-facet legend + badges; non-blocking veto
 *   banner; evidence deep-link activates the Evidence tab; actor/time-range
 *   filters + selection persist), with composition observability only as a
 *   subordinate section. It never renders a genealogy-blind composition timeline.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../state/stores';
import { DispatchTracePanel } from './DispatchTracePanel';
import {
    hydrateOmniPanelSessionState,
    readOmniPanelSessionState
} from './omnipanelSessionState';

beforeEach(() => hydrateOmniPanelSessionState(null));
afterEach(() => {
    cleanup();
    setGateway(null);
});

function connect(connected: boolean) {
    const prev = useProvenanceStore.getState().connection;
    useProvenanceStore.setState({ connection: { ...prev, connected } });
}

function mockSessions(items: Record<string, unknown>[]) {
    const invoke = vi.fn().mockImplementation(async (method: string) =>
        method === 'sessions.list' ? { artifact: { items } } : { artifact: null }
    );
    setGateway({ invoke } as never);
    return invoke;
}

describe('DispatchTracePanel — Pi → subagent is the tab body', () => {
    it('renders the genealogy tree as the primary body, subagent nested under its dispatcher', async () => {
        mockSessions([
            { sessionKey: 'agent:anima:main' },
            { sessionKey: 'agent:anima:subagent:moirai', spawnedBy: 'agent:anima:main' }
        ]);
        connect(true);
        render(<DispatchTracePanel />);

        expect(await screen.findByTestId('dispatch-genealogy-tree')).toBeTruthy();
        const nodes = await screen.findAllByTestId('dispatch-tree-node');
        const nodeIds = nodes.map(n => n.getAttribute('data-node-id'));
        expect(nodeIds).toContain('agent:anima:main');
        expect(nodeIds).toContain('agent:anima:subagent:moirai');
        const root = nodes.find(n => n.getAttribute('data-node-id') === 'agent:anima:main')!;
        expect(root.querySelector('[data-node-id="agent:anima:subagent:moirai"]')).toBeTruthy();
    });

    it('keeps composition observability as a subordinate <details> (29.11 preserved)', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main' }]);
        connect(true);
        render(<DispatchTracePanel />);
        await screen.findByTestId('dispatch-genealogy-tree');

        const subordinate = screen.getByTestId('dispatch-composition-observability');
        expect(subordinate.tagName.toLowerCase()).toBe('details');
        expect(subordinate.querySelector('[data-testid="composition-dispatch-trace"]')).toBeTruthy();
    });

    it('is honest when disconnected — no genealogy to fold, nothing faked', () => {
        connect(false);
        render(<DispatchTracePanel />);
        expect(screen.getByTestId('dispatch-trace-disconnected')).toBeTruthy();
        expect(screen.queryByTestId('dispatch-genealogy-tree')).toBeNull();
    });
});

describe('DispatchTracePanel — full 27.3 surface', () => {
    it('renders the 7-facet psyche legend', () => {
        connect(false);
        render(<DispatchTracePanel />);
        expect(screen.getByTestId('dispatch-psyche-legend')).toBeTruthy();
        for (const facet of ['sophia', 'anima', 'logos', 'eros', 'mythos', 'psyche', 'nous']) {
            expect(screen.getByTestId(`psyche-legend-${facet}`)).toBeTruthy();
        }
    });

    it('groups an Aletheia crystallisation fan-out under Anima with subagent badges (DR-B-3)', async () => {
        mockSessions([
            { sessionKey: 'agent:anima:main' },
            { sessionKey: 'agent:anima:subagent:moirai', spawnedBy: 'agent:anima:main' },
            { sessionKey: 'agent:anima:subagent:anansi', spawnedBy: 'agent:anima:main' }
        ]);
        connect(true);
        render(<DispatchTracePanel />);

        const group = await screen.findByTestId('aletheia-crystallisation-group');
        expect(group).toBeTruthy();
        expect(screen.getByTestId('subagent-badge-moirai')).toBeTruthy();
        expect(screen.getByTestId('subagent-badge-anansi')).toBeTruthy();
        // The subagents remain nested inside Anima's subtree, never top-level.
        const anima = screen
            .getAllByTestId('dispatch-tree-node')
            .find(n => n.getAttribute('data-node-id') === 'agent:anima:main')!;
        expect(anima.contains(group)).toBe(true);
    });

    it('renders a psyche-facet badge for a constitutional register', async () => {
        mockSessions([{ sessionKey: 'agent:sophia:main' }]);
        connect(true);
        render(<DispatchTracePanel />);
        const badge = await screen.findByTestId('dispatch-psyche-badge');
        expect(badge.textContent).toBe('Sophia');
    });

    it('fires a non-blocking veto banner when a dispatch returns a veto (12.19)', async () => {
        mockSessions([
            { sessionKey: 'agent:anima:subagent:janus', spawnedBy: 'agent:anima:main', vetoReason: 'facets not converging' }
        ]);
        connect(true);
        render(<DispatchTracePanel />);
        const banner = await screen.findByTestId('aletheia-veto-banner');
        expect(banner.textContent).toContain('facets not converging');
        expect(banner.textContent).toContain('non-blocking');
    });

    it('activates the Evidence tab when a node evidence deep-link is clicked (15.11)', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main', evidenceRef: 'evidence://run-1' }]);
        connect(true);
        render(<DispatchTracePanel />);
        const chip = await screen.findByTestId('dispatch-link-omniEvidence');
        fireEvent.click(chip);
        expect(readOmniPanelSessionState().activeTab).toBe('evidence');
    });

    it('persists the time-range filter selection into the tab state', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main' }]);
        connect(true);
        render(<DispatchTracePanel />);
        await screen.findByTestId('dispatch-genealogy-tree');
        fireEvent.click(screen.getByTestId('dispatch-timerange-last-5m'));
        expect(readOmniPanelSessionState().perTabState['dispatch-trace'].timeRangeFilter).toBe('last-5m');
    });

    it('cross-highlights the Tool Stream event when a tree node is selected (15.11)', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main' }]);
        connect(true);
        render(<DispatchTracePanel />);
        const row = (await screen.findAllByTestId('dispatch-tree-node-row'))[0];
        fireEvent.click(row);
        expect(readOmniPanelSessionState().perTabState['tool-stream'].selectedEventId).toBe('agent:pi:main');
    });
});
