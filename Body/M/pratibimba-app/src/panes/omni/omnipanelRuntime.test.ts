/**
 * Coordinate: M' `/` membrane (omnipanel runtime tests — Track 27.T27.0)
 * Actualises: the tranche's verification as behavioral tests — the manifest
 *   carries exactly the 8 canonical distinct ids, the DR-WC-OP-1 collapse
 *   keeps the three landed carrier folds on their existing panels, the
 *   capability predicate honours exact + wildcard permits only, and the
 *   temporal fold orders/filters the real event ring without synthesis.
 */

import { describe, expect, it } from 'vitest';
import {
    filterOmniPanelTabsForLayout,
    isMediationCapabilityAllowed,
    OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY,
    OMNIPANEL_TABS,
    omniPanelTabForComponent,
    parseOmniPanelLayoutPreference,
    toToolStreamEvents
} from './omnipanelRuntime';

const CANONICAL_IDS = [
    'pi-chat',
    'sessions',
    'dispatch-trace',
    'tool-stream',
    'evidence',
    'review',
    'gateway',
    'diagnostics',
    'tuning'
] as const;

describe('OMNIPANEL_TABS manifest', () => {
    it('carries exactly the 9 canonical distinct tab ids in order', () => {
        expect(OMNIPANEL_TABS.map(tab => tab.id)).toEqual([...CANONICAL_IDS]);
        expect(new Set(OMNIPANEL_TABS.map(tab => tab.id)).size).toBe(9);
    });

    it('collapses the legacy carrier folds onto their landed panels (DR-WC-OP-1)', () => {
        expect(omniPanelTabForComponent('omniChat')?.id).toBe('pi-chat');
        expect(omniPanelTabForComponent('omniSessions')?.id).toBe('sessions');
        expect(omniPanelTabForComponent('omniLogs')?.id).toBe('tool-stream');
        for (const key of ['omniChat', 'omniSessions', 'omniLogs']) {
            expect(omniPanelTabForComponent(key)?.landed).toBe(true);
        }
        expect(omniPanelTabForComponent('omniTuning')?.id).toBe('tuning');
        expect(omniPanelTabForComponent('omniTuning')?.landed).toBe(true);
    });

    it('every OmniPanel fold has landed — no pending body remains (27.5/.7/.8 closed)', () => {
        const pending = OMNIPANEL_TABS.filter(tab => !tab.landed);
        expect(pending.map(tab => tab.id)).toEqual([]);
        // Invariant retained for the next unlanded fold: any pending fold must
        // name a real owning tranche (pending, never hidden).
        for (const tab of pending) {
            expect(tab.owningTranche).toMatch(/^\d+\./);
        }
    });

    it('filters declared tabs against the epi-logos.layout.active preference', () => {
        expect(OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY).toBe('epi-logos.layout.active');
        expect(OMNIPANEL_TABS.every(tab =>
            tab.availableInLayouts.includes('daily-0-1') && tab.availableInLayouts.includes('ide-deep')
        )).toBe(true);

        const withDeepOnlyPi = OMNIPANEL_TABS.map((tab, index) =>
            index === 0 ? { ...tab, availableInLayouts: ['ide-deep'] as const } : tab
        );
        expect(filterOmniPanelTabsForLayout(withDeepOnlyPi, 'daily-0-1').map(tab => tab.id))
            .not.toContain('pi-chat');
        expect(filterOmniPanelTabsForLayout(withDeepOnlyPi, 'ide-deep').map(tab => tab.id))
            .toContain('pi-chat');
        expect(parseOmniPanelLayoutPreference('ide-deep')).toBe('ide-deep');
        expect(parseOmniPanelLayoutPreference('unknown')).toBe('daily-0-1');
    });
});

describe('isMediationCapabilityAllowed', () => {
    const permitted = ['s4.pi.chat.stream', 'oracle.*'];

    it('permits exact ids and wildcard-prefixed ids only', () => {
        expect(isMediationCapabilityAllowed('s4.pi.chat.stream', permitted)).toBe(true);
        expect(isMediationCapabilityAllowed('oracle.iching.cast', permitted)).toBe(true);
        expect(isMediationCapabilityAllowed('oracle', permitted)).toBe(true);
        expect(isMediationCapabilityAllowed('s4.pi.chat', permitted)).toBe(false);
        expect(isMediationCapabilityAllowed('s4.khora.session_start', permitted)).toBe(false);
        expect(isMediationCapabilityAllowed('oracles.fake', permitted)).toBe(false);
        expect(isMediationCapabilityAllowed('', permitted)).toBe(false);
    });
});

describe('toToolStreamEvents — the temporal fold', () => {
    const RING = [
        { seq: 3, emittedAtMs: 30, kind: 'event', channel: 'agent', payload: {} },
        { seq: 1, emittedAtMs: 10, kind: 'event', channel: 'chat', payload: {} },
        { seq: 2, emittedAtMs: 20, kind: 'response', channel: null, payload: {} }
    ];

    it('orders by time then sequence and drops payload bodies', () => {
        const fold = toToolStreamEvents(RING);
        expect(fold.map(event => event.seq)).toEqual([1, 2, 3]);
        expect(Object.keys(fold[0])).toEqual(['seq', 'emittedAtMs', 'kind', 'channel']);
    });

    it('filters by kind, channel, and time window without synthesising rows', () => {
        expect(toToolStreamEvents(RING, { kind: 'response' })).toHaveLength(1);
        expect(toToolStreamEvents(RING, { channel: 'chat' })[0]?.seq).toBe(1);
        expect(toToolStreamEvents(RING, { sinceMs: 25 })).toHaveLength(1);
        expect(toToolStreamEvents([], {})).toHaveLength(0);
    });
});
