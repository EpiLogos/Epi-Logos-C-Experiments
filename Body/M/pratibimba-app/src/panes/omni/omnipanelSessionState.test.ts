/**
 * Coordinate: M' `/` membrane (OmniPanel session-state tests — Track 27.T27.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): `/` persistence boundary
 * Actualises: behavioral proof that active fold selection and each typed
 *   per-tab record survive serialisation and layout re-mounts.
 * Public surface: Vitest coverage for the OmniPanel session-state contract.
 * Does NOT own: FlexLayout rendering, gateway events, or individual fold bodies.
 * Contract: [[M'-SYSTEM-SPEC]] + [[27-omnipanel-tabs-deep]] 27.11.
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
    createOmniPanelSessionState,
    hydrateOmniPanelSessionState,
    readOmniPanelSessionState,
    useOmniPanelSessionStore
} from './omnipanelSessionState';

afterEach(() => {
    useOmniPanelSessionStore.getState().hydrate(null);
});

describe('OmniPanelSessionState', () => {
    it('preserves the active fold and typed per-tab values through a serialisable snapshot', () => {
        const store = useOmniPanelSessionStore.getState();
        store.selectTab('evidence');
        store.setOmniState('fullscreen');
        store.patchTab('pi-chat', { draftMessage: '/dispatch nous', scrollOffset: 48 });
        store.patchTab('sessions', { selectedSessionId: 'session-7', filterPredicate: 'this-week' });
        store.patchTab('evidence', { selectedPacketId: 'pkt-xyz', depositFormOpen: true });
        store.patchTab('review', { selectedReviewId: 'review-4', annotateFormOpen: true });
        store.patchTab('tuning', {
            selectedKnobKey: 'nara.weights.body_natal',
            subsystemFilter: 'M4'
        });

        const snapshot = JSON.parse(JSON.stringify(readOmniPanelSessionState()));
        useOmniPanelSessionStore.getState().hydrate(null);
        hydrateOmniPanelSessionState(snapshot);

        const restored = readOmniPanelSessionState();
        expect(restored.activeTab).toBe('evidence');
        expect(restored.omniState).toBe('fullscreen');
        expect(restored.perTabState['pi-chat']).toMatchObject({
            draftMessage: '/dispatch nous',
            scrollOffset: 48
        });
        expect(restored.perTabState.sessions).toMatchObject({
            selectedSessionId: 'session-7',
            filterPredicate: 'this-week'
        });
        expect(restored.perTabState.evidence).toMatchObject({
            selectedPacketId: 'pkt-xyz',
            depositFormOpen: true
        });
        expect(restored.perTabState.review).toMatchObject({
            selectedReviewId: 'review-4',
            annotateFormOpen: true
        });
        expect(restored.perTabState.tuning).toEqual({
            selectedKnobKey: 'nara.weights.body_natal',
            subsystemFilter: 'M4'
        });
    });

    it('rejects malformed persisted values while retaining every canonical tab record', () => {
        const hydrated = createOmniPanelSessionState({
            activeTab: 'not-a-tab',
            omniState: 'expanded',
            perTabState: {
                'pi-chat': { draftMessage: 12 },
                review: { selectedReviewId: 'review-9' }
            }
        });

        expect(hydrated.activeTab).toBe('pi-chat');
        expect(hydrated.omniState).toBe('minimal');
        expect(hydrated.perTabState['pi-chat'].draftMessage).toBe('');
        expect(hydrated.perTabState.review.selectedReviewId).toBe('review-9');
        expect(Object.keys(hydrated.perTabState)).toHaveLength(9);
    });
});
