/**
 * Coordinate: M' `/` membrane (OmniPanel intent-router tests — Track 27.T27.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the `/` fold-routing boundary
 * Actualises: behavioral proof of the 27.9 routing table (all 14 default routes
 *   activate the expected fold with the expected payload), the reveal-on-hidden
 *   discipline, the state-preservation invariant (15.7), the register/dispose
 *   contract, and the shared-store bidirectional Evidence sync (the OmniPanel
 *   Evidence fold and the ide-shell evidence-panel are the SAME `omniEvidence`
 *   component backed by one session store).
 * Public surface: Vitest coverage for OmniPanelIntentRouter + applyOmniPanelRouting.
 * Does NOT own: FlexLayout selection, the intent envelope, or fold rendering.
 * Contract: [[27-omnipanel-tabs-deep]] 27.9 / [[CHROME-CONTRACT]].
 */

import { afterEach, describe, expect, it } from 'vitest';
import type { CrossLayoutIntent } from '../../commands/crossLayoutIntent';
import { commands } from '../../commands/registry';
import { useOmniPanelSessionStore } from './omnipanelSessionState';
import type { OmniPanelTabId } from './omnipanelRuntime';
import {
    applyOmniPanelRouting,
    fireOmniPanelRoute,
    OMNIPANEL_DEFAULT_ROUTES,
    OMNIPANEL_INTENT_ROUTE_COMMAND,
    OmniPanelIntentRouter,
    omniPanelIntentRouter,
    omniPanelIntentRouteKey
} from './omnipanelIntentRouter';

afterEach(() => {
    useOmniPanelSessionStore.getState().hydrate(null);
});

function intentFor(key: string, over: Partial<CrossLayoutIntent> = {}): CrossLayoutIntent {
    const slash = key.indexOf('/');
    return Object.freeze({
        coordinate: null,
        artifactUri: 'art-1',
        reviewId: 'rev-1',
        dayNow: null,
        sessionKey: 'sess-1',
        profileGeneration: null,
        privacyClass: null,
        requestedExtensionId: key.slice(0, slash),
        requestedContributionId: key.slice(slash + 1),
        ...over
    });
}

const EXPECTED: ReadonlyArray<readonly [string, OmniPanelTabId, Record<string, unknown>]> = [
    ['ide-shell-m0-m5/agentic-control-room.select-run', 'dispatch-trace', { selectedNodeId: 'art-1' }],
    ['ide-shell-m0-m5/evidence-pane.select-packet', 'evidence', { selectedPacketId: 'art-1' }],
    ['ide-shell-m0-m5/review-pane.select-review', 'review', { selectedReviewId: 'rev-1' }],
    ['ide-shell-m0-m5/logos-atelier.invoke-aletheia', 'dispatch-trace', { selectedNodeId: 'art-1' }],
    ['m0-anuttara/verifier.open-witness', 'evidence', { selectedPacketId: 'art-1' }],
    ['m4-nara/highlight-service.inscribe-agent-mark', 'sessions', { selectedSessionId: 'sess-1' }],
    ['m5-epii/contemplation-object-viewer.open', 'evidence', { selectedPacketId: 'art-1' }],
    ['omnipanel-shell/dispatch-trace.open-evidence', 'evidence', { selectedPacketId: 'art-1' }],
    ['omnipanel-shell/dispatch-trace.open-tool-stream', 'tool-stream', { selectedEventId: 'art-1' }],
    ['omnipanel-shell/tool-stream.open-dispatch-trace', 'dispatch-trace', { selectedNodeId: 'art-1' }],
    ['omnipanel-shell/evidence.open-review', 'review', { selectedReviewId: 'rev-1' }],
    ['omnipanel-shell/review.open-gateway-blocker', 'gateway', { activeSubView: 'capabilities', selectedCapabilityName: 'art-1' }],
    ['omnipanel-shell/gateway.open-bridge-readiness', 'diagnostics', { activeSubSection: 'kernel-bridge' }],
    ['omnipanel-shell/pi-chat.dispatch-emitted', 'dispatch-trace', { selectedNodeId: 'art-1' }],
    // carrier completion (Tool Stream fold's evidence chip — sibling of dispatch-trace.open-evidence)
    ['omnipanel-shell/tool-stream.open-evidence', 'evidence', { selectedPacketId: 'art-1' }]
];

describe('OmniPanelIntentRouter routing table', () => {
    it('declares the 14 canonical spec routes plus the one carrier completion (15)', () => {
        expect(OMNIPANEL_DEFAULT_ROUTES.size).toBe(15);
        expect(omniPanelIntentRouter.routeKeys().length).toBe(15);
        expect(EXPECTED.length).toBe(15);
        expect(new Set(omniPanelIntentRouter.routeKeys())).toEqual(new Set(EXPECTED.map(([key]) => key)));
    });

    it.each(EXPECTED)('routes %s to its fold with the expected payload', (key, tab, payload) => {
        const result = omniPanelIntentRouter.route(intentFor(key));
        expect(result).not.toBeNull();
        expect(result!.activateTab).toBe(tab);
        expect(result!.shouldRevealOmniPanel).toBe(true);
        expect(result!.perTabPayload).toEqual(payload);
    });

    it('falls back to artifactUri when a review intent carries no reviewId', () => {
        const result = omniPanelIntentRouter.route(
            intentFor('omnipanel-shell/evidence.open-review', { reviewId: null, artifactUri: 'pkt-9' })
        );
        expect(result!.activateTab).toBe('review');
        expect(result!.perTabPayload).toEqual({ selectedReviewId: 'pkt-9' });
    });

    it('returns null for an unregistered intent key', () => {
        const result = omniPanelIntentRouter.route(intentFor('m9-unknown/nowhere.noop'));
        expect(result).toBeNull();
    });

    it('builds the routing key from extension + contribution id', () => {
        expect(
            omniPanelIntentRouteKey({
                requestedExtensionId: 'omnipanel-shell',
                requestedContributionId: 'evidence.open-review'
            })
        ).toBe('omnipanel-shell/evidence.open-review');
    });
});

describe('OmniPanelIntentRouter.register', () => {
    it('registers a new route and the disposer removes exactly it', () => {
        const router = new OmniPanelIntentRouter();
        const before = router.routeKeys().length;
        const dispose = router.register('custom-ext/custom.action', intent =>
            Object.freeze({ activateTab: 'tuning', perTabPayload: { selectedKnobKey: intent.coordinate }, shouldRevealOmniPanel: false })
        );
        expect(router.routeKeys().length).toBe(before + 1);
        const routed = router.route(intentFor('custom-ext/custom.action', { coordinate: 'M1-4' }));
        expect(routed).toEqual({ activateTab: 'tuning', perTabPayload: { selectedKnobKey: 'M1-4' }, shouldRevealOmniPanel: false });

        dispose();
        expect(router.routeKeys().length).toBe(before);
        expect(router.route(intentFor('custom-ext/custom.action'))).toBeNull();
    });

    it('does not mutate the shared default-route table when a fresh router registers', () => {
        const router = new OmniPanelIntentRouter();
        router.register('scratch/one.two', () => Object.freeze({ activateTab: 'pi-chat', perTabPayload: {}, shouldRevealOmniPanel: false }));
        expect(OMNIPANEL_DEFAULT_ROUTES.has('scratch/one.two')).toBe(false);
    });
});

describe('applyOmniPanelRouting', () => {
    it('activates the fold and applies the per-tab payload to the shared store', () => {
        const result = omniPanelIntentRouter.route(intentFor('ide-shell-m0-m5/evidence-pane.select-packet', { artifactUri: 'pkt-123' }))!;
        applyOmniPanelRouting(result);
        const session = useOmniPanelSessionStore.getState().session;
        expect(session.activeTab).toBe('evidence');
        expect(session.perTabState.evidence.selectedPacketId).toBe('pkt-123');
    });

    it('preserves unrelated per-tab state (15.7) when routing sets the routing-induced field', () => {
        const store = useOmniPanelSessionStore.getState();
        store.patchTab('evidence', { filters: { mediator: 'anima', privacyClass: 'protected' }, scrollOffset: 240, depositFormOpen: true });
        applyOmniPanelRouting(
            omniPanelIntentRouter.route(intentFor('ide-shell-m0-m5/evidence-pane.select-packet', { artifactUri: 'pkt-777' }))!
        );
        const evidence = useOmniPanelSessionStore.getState().session.perTabState.evidence;
        expect(evidence.selectedPacketId).toBe('pkt-777');
        // unrelated state survives the route:
        expect(evidence.filters).toEqual({ mediator: 'anima', privacyClass: 'protected' });
        expect(evidence.scrollOffset).toBe(240);
        expect(evidence.depositFormOpen).toBe(true);
    });

    it('bidirectional Evidence sync: the routed packet is the one the shared ide-shell/OmniPanel evidence fold reads', () => {
        // In the carrier, ide-shell-m0-m5/evidence-panel and the OmniPanel
        // Evidence tab are the same `omniEvidence` component over one store —
        // routing from ide-shell IS the highlight the OmniPanel fold shows.
        applyOmniPanelRouting(
            omniPanelIntentRouter.route(intentFor('ide-shell-m0-m5/evidence-pane.select-packet', { artifactUri: 'pkt-bi' }))!
        );
        expect(useOmniPanelSessionStore.getState().session.perTabState.evidence.selectedPacketId).toBe('pkt-bi');

        // reverse: an OmniPanel-internal evidence route addresses the same field
        applyOmniPanelRouting(
            omniPanelIntentRouter.route(intentFor('m5-epii/contemplation-object-viewer.open', { artifactUri: 'pkt-bi-2' }))!
        );
        expect(useOmniPanelSessionStore.getState().session.perTabState.evidence.selectedPacketId).toBe('pkt-bi-2');
    });

    it('invokes the FlexLayout reveal hook (the real, observable reveal) with the activated fold id', () => {
        const revealed: OmniPanelTabId[] = [];
        applyOmniPanelRouting(omniPanelIntentRouter.route(intentFor('omnipanel-shell/review.open-gateway-blocker'))!, {
            revealBorderTab: tab => revealed.push(tab)
        });
        expect(revealed).toEqual(['gateway']);
        expect(useOmniPanelSessionStore.getState().session.perTabState.gateway.selectedCapabilityName).toBe('art-1');
        expect(useOmniPanelSessionStore.getState().session.perTabState.gateway.activeSubView).toBe('capabilities');
    });

    it('does NOT reveal when the route sets shouldRevealOmniPanel = false', () => {
        const revealed: OmniPanelTabId[] = [];
        applyOmniPanelRouting(
            { activateTab: 'evidence', perTabPayload: { selectedPacketId: 'pkt-x' }, shouldRevealOmniPanel: false },
            { revealBorderTab: tab => revealed.push(tab) }
        );
        expect(revealed).toEqual([]);
        // the fold still activates + carries its payload — only the reveal is gated
        expect(useOmniPanelSessionStore.getState().session.activeTab).toBe('evidence');
        expect(useOmniPanelSessionStore.getState().session.perTabState.evidence.selectedPacketId).toBe('pkt-x');
    });
});

describe('fireOmniPanelRoute', () => {
    it('applies the route store-only when the command spine is not registered (unmounted fold)', () => {
        expect(commands.has(OMNIPANEL_INTENT_ROUTE_COMMAND)).toBe(false);
        fireOmniPanelRoute({
            requestedExtensionId: 'omnipanel-shell',
            requestedContributionId: 'dispatch-trace.open-evidence',
            artifactUri: 'pkt-fire'
        });
        const session = useOmniPanelSessionStore.getState().session;
        expect(session.activeTab).toBe('evidence');
        expect(session.perTabState.evidence.selectedPacketId).toBe('pkt-fire');
    });

    it('prefers the command spine when it is registered (App.tsx wires the real reveal)', () => {
        const seen: unknown[] = [];
        const dispose = commands.register({
            id: OMNIPANEL_INTENT_ROUTE_COMMAND,
            title: 'OmniPanel: Route cross-layout intent to a fold',
            run: input => {
                seen.push(input);
            }
        });
        try {
            fireOmniPanelRoute({
                requestedExtensionId: 'omnipanel-shell',
                requestedContributionId: 'tool-stream.open-dispatch-trace',
                artifactUri: 'node-9'
            });
            expect(seen).toHaveLength(1);
            expect(seen[0]).toMatchObject({
                requestedExtensionId: 'omnipanel-shell',
                requestedContributionId: 'tool-stream.open-dispatch-trace',
                artifactUri: 'node-9'
            });
        } finally {
            dispose();
        }
        expect(commands.has(OMNIPANEL_INTENT_ROUTE_COMMAND)).toBe(false);
    });
});
