/**
 * Coordinate: M' `/` membrane (Dispatch Trace tab body tests — Track 27.T27.3)
 * Actualises: the anti-bypass guarantee — the Dispatch tab renders the real
 *   Pi -> subagent genealogy tree as its PRIMARY body (subagents nested under
 *   their dispatcher), with composition observability retained only as a
 *   subordinate section. It never renders a genealogy-blind composition
 *   timeline as the dispatch trace.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../state/stores';
import { DispatchTracePanel } from './DispatchTracePanel';

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

        // The genealogy tree — not a composition timeline — is the body.
        expect(await screen.findByTestId('dispatch-genealogy-tree')).toBeTruthy();
        const nodes = await screen.findAllByTestId('dispatch-tree-node');
        const nodeIds = nodes.map(n => n.getAttribute('data-node-id'));
        expect(nodeIds).toContain('agent:anima:main');
        expect(nodeIds).toContain('agent:anima:subagent:moirai');
        // The subagent renders INSIDE its dispatcher's subtree, never as a root peer.
        const root = nodes.find(n => n.getAttribute('data-node-id') === 'agent:anima:main')!;
        expect(root.querySelector('[data-node-id="agent:anima:subagent:moirai"]')).toBeTruthy();
    });

    it('keeps composition observability as a subordinate section (29.11 preserved, not the dispatch trace)', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main' }]);
        connect(true);

        render(<DispatchTracePanel />);
        await screen.findByTestId('dispatch-genealogy-tree');

        const subordinate = screen.getByTestId('dispatch-composition-observability');
        // The composition pane lives strictly INSIDE the subordinate <details>.
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
