/**
 * Coordinate: M' `/` membrane (Tool Stream tab body tests — Track 27.T27.4)
 * Actualises: the Tool Stream tab is the TEMPORAL fold of the same pi→subagent
 *   genealogy (invoked/settled rows), with a live/paused toggle, actor +
 *   event-kind + time-range filters, evidence deep-linking, and NO raw payload
 *   leakage — all state persisted. It never renders a body/payload.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../state/stores';
import { ToolStreamPanel } from './ToolStreamPanel';
import { hydrateOmniPanelSessionState, readOmniPanelSessionState } from './omnipanelSessionState';

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

const toolState = () => readOmniPanelSessionState().perTabState['tool-stream'];

describe('ToolStreamPanel — temporal fold of the pi→subagent genealogy', () => {
    it('renders the time-ordered stream as the body', async () => {
        mockSessions([
            { sessionKey: 'agent:anima:main', startedAtMs: 1000, endedAtMs: 1500 },
            { sessionKey: 'agent:anima:subagent:moirai', spawnedBy: 'agent:anima:main', startedAtMs: 1100 }
        ]);
        connect(true);
        render(<ToolStreamPanel />);
        expect(await screen.findByTestId('dispatch-genealogy-stream')).toBeTruthy();
        const rows = await screen.findAllByTestId('dispatch-stream-row');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('never renders a raw payload/body — protected content cannot leak through the stream', async () => {
        mockSessions([
            { sessionKey: 'agent:pi:main', startedAtMs: 1000, body: 'TOP-SECRET-BODY', payload: 'SECRET-PAYLOAD' }
        ]);
        connect(true);
        const { container } = render(<ToolStreamPanel />);
        await screen.findByTestId('dispatch-genealogy-stream');
        expect(container.textContent).not.toContain('TOP-SECRET-BODY');
        expect(container.textContent).not.toContain('SECRET-PAYLOAD');
    });

    it('toggles + persists the live/paused flag', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main' }]);
        connect(true);
        render(<ToolStreamPanel />);
        const before = toolState().live;
        fireEvent.click(screen.getByTestId('tool-stream-live-toggle'));
        expect(toolState().live).toBe(!before);
    });

    it('persists actor + event-kind + time-range filters', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main' }]);
        connect(true);
        render(<ToolStreamPanel />);
        fireEvent.click(screen.getByTestId('tool-stream-actor-filter-anima'));
        fireEvent.click(screen.getByTestId('tool-stream-kind-settled'));
        fireEvent.click(screen.getByTestId('tool-stream-timerange-last-hour'));
        const f = toolState().filters;
        expect(f.actor).toBe('anima');
        expect(f.eventKind).toContain('dispatch.settled');
        expect(f.timeRange).toBe('last-hour');
    });

    it('activates the Evidence tab from a stream evidence deep-link (15.11)', async () => {
        mockSessions([{ sessionKey: 'agent:pi:main', evidenceRef: 'evidence://run-1' }]);
        connect(true);
        render(<ToolStreamPanel />);
        const chip = await screen.findByTestId('dispatch-stream-link-omniEvidence');
        fireEvent.click(chip);
        expect(readOmniPanelSessionState().activeTab).toBe('evidence');
    });

    it('is honest when disconnected — no stream to fold', () => {
        connect(false);
        render(<ToolStreamPanel />);
        expect(screen.getByTestId('tool-stream-disconnected')).toBeTruthy();
        expect(screen.queryByTestId('dispatch-genealogy-stream')).toBeNull();
    });
});
