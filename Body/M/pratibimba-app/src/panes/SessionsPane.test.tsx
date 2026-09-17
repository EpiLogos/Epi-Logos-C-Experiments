/**
 * Coordinate: M' `/` membrane (Sessions continuity fold proof — Track 27.T27.2)
 * Actualises: behavioral + pure-logic proof for the SessionManager continuity
 *   reframe — the continuity ordering (active → main → kairos-desc), the honest
 *   ReadinessBanner degrades for the kairos + tarot/psyche strips, the real
 *   khora session-start wiring (parent:agent:epii:main), and PrivacyClassBadge.
 */

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../bridge/gatewayHolder', () => ({
    gateway: () => ({ invoke }),
    gatewayReady: () => true
}));

import type { SessionRecord } from '../bridge/sessionClient';
import { useCoordinateStore, useProvenanceStore, useSessionStore } from '../state/stores';
import { useOmniPanelSessionStore } from './omni/omnipanelSessionState';
import { PrivacyClassBadge } from '../ui/PrivacyClassBadge';
import { MAIN_SESSION_KEY, orderSessionsForContinuity, SessionsPane } from './SessionsPane';

function rec(sessionKey: string, extra: Record<string, unknown> = {}): SessionRecord {
    return { sessionKey, ...extra };
}

function connect(): void {
    useProvenanceStore.setState(s => ({ connection: { ...s.connection, connected: true } }));
}

beforeEach(() => {
    invoke.mockReset();
    invoke.mockResolvedValue({ artifact: [] });
    useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
    useCoordinateStore.setState({ selected: null });
    useProvenanceStore.setState(s => ({ connection: { ...s.connection, connected: false } }));
    useOmniPanelSessionStore.getState().hydrate(null);
});

afterEach(() => {
    cleanup();
});

describe('orderSessionsForContinuity (pure)', () => {
    it('places the active session first, the main session second, siblings by kairos_at_open descending', () => {
        const records = [
            rec('sib-early', { kairos_at_open: 100 }),
            rec(MAIN_SESSION_KEY),
            rec('active-one'),
            rec('sib-late', { kairos_at_open: 300 }),
            rec('sib-mid', { kairos_at_open: 200 })
        ];
        const ordered = orderSessionsForContinuity(records, 'active-one').map(r => r.sessionKey);
        expect(ordered).toEqual(['active-one', MAIN_SESSION_KEY, 'sib-late', 'sib-mid', 'sib-early']);
    });

    it('sorts records lacking kairos_at_open last, stably preserving input order', () => {
        const records = [
            rec('no-kairos-a'),
            rec('has-kairos', { kairos_at_open: 500 }),
            rec('no-kairos-b'),
            rec('no-kairos-c')
        ];
        const ordered = orderSessionsForContinuity(records, null).map(r => r.sessionKey);
        expect(ordered).toEqual(['has-kairos', 'no-kairos-a', 'no-kairos-b', 'no-kairos-c']);
    });

    it('renders the main session once at the front when it is also the active session', () => {
        const records = [rec('sib', { kairos_at_open: 10 }), rec(MAIN_SESSION_KEY)];
        const ordered = orderSessionsForContinuity(records, MAIN_SESSION_KEY).map(r => r.sessionKey);
        expect(ordered).toEqual([MAIN_SESSION_KEY, 'sib']);
    });
});

describe('SessionDetailPane readiness degrades', () => {
    it('shows a pending-kairos ReadinessBanner when the session has no kairos snapshot', async () => {
        connect();
        useOmniPanelSessionStore.getState().patchTab('sessions', { selectedSessionId: 'sess-1' });
        render(<SessionsPane />);
        const strip = await screen.findByTestId('kairos-at-open-strip');
        const banner = within(strip).getByTestId('readiness-banner');
        expect(banner.getAttribute('data-state')).toBe('pending-kairos');
        await waitFor(() => expect(invoke).toHaveBeenCalledWith('sessions.list', {}));
    });

    it('shows a ReadinessBanner for the tarot/psyche anchor (producer 19.6 unlanded)', async () => {
        connect();
        useOmniPanelSessionStore.getState().patchTab('sessions', { selectedSessionId: 'sess-1' });
        render(<SessionsPane />);
        const strip = await screen.findByTestId('tarot-psyche-anchor-strip');
        const banner = within(strip).getByTestId('readiness-banner');
        expect(banner.getAttribute('data-state')).toBe('pending-tarot-psyche');
    });
});

describe('New session button', () => {
    it('invokes the real khora session-start method anchored to agent:epii:main', async () => {
        connect();
        useSessionStore.setState({ dayNow: '22-07-2026', sessionKey: null, privacyClass: null });
        invoke.mockImplementation((method: string) =>
            method === 'khora.session_start'
                ? Promise.resolve({ artifact: { sessionId: 'agent:epii:22-07-2026-a', dayId: '22-07-2026', createdNow: true } })
                : Promise.resolve({ artifact: [] })
        );
        render(<SessionsPane />);
        fireEvent.click(screen.getByTestId('session-new'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith(
                'khora.session_start',
                expect.objectContaining({ dayId: '22-07-2026', parent: MAIN_SESSION_KEY })
            )
        );
        await waitFor(() => expect(useSessionStore.getState().sessionKey).toBe('agent:epii:22-07-2026-a'));
    });

    it('never fabricates a local key — it is disabled without a day anchor', () => {
        connect();
        render(<SessionsPane />);
        expect((screen.getByTestId('session-new') as HTMLButtonElement).disabled).toBe(true);
    });
});

describe('PrivacyClassBadge', () => {
    it('renders the protected-local indicator for an M4/Nara-touching session', () => {
        useSessionStore.setState({ sessionKey: 'sess-1', dayNow: null, privacyClass: 'protected-local' });
        render(<PrivacyClassBadge />);
        const badge = screen.getByTestId('privacy-class-badge');
        expect(badge.getAttribute('data-protected-local')).toBe('true');
        expect(badge.textContent).toContain('protected-local');
    });

    it('renders nothing when there is no privacy class', () => {
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
        render(<PrivacyClassBadge />);
        expect(screen.queryByTestId('privacy-class-badge')).toBeNull();
    });
});
