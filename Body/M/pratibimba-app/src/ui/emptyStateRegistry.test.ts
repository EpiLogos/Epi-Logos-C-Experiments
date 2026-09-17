// @vitest-environment node
/**
 * Coordinate: M' shell (empty-state registry law — 32.T32.6)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the pure half of 32.6 — the register/resolve/all contract, the
 *   disposable's retraction semantics, and the derivation of the reasons table
 *   from the landed nine-id taxonomy. No DOM: none of this needs one, and a
 *   jsdom mount would hide that.
 * Does NOT own: the copy (emptyStateGrammar), the components
 *   (mExtensionEmptyStates.tsx), the taxonomy (bridgeReadiness).
 */

import { describe, expect, it } from 'vitest';
import type { ComponentType } from 'react';
import type { MExtensionReadinessSnapshot } from './bridgeReadiness';
import { readinessOwnerTrack } from './bridgeReadiness';
import { grammarFor } from './readinessGrammar';
import {
    contributorsActivation,
    createEmptyStateRegistry,
    emptyStateReasonRows,
    missingContributors,
    type EmptyStateProps,
    type EmptyStateRegistration
} from './emptyStateRegistry';
import { M_EMPTY_STATE_GRAMMAR } from './emptyStateGrammar';

const NOTHING = null as unknown as ComponentType<EmptyStateProps>;

function registration(over: Partial<EmptyStateRegistration> = {}): EmptyStateRegistration {
    const contributors = over.contributors ?? [{ bindingKey: 's2.graph.node', label: 'Graph' }];
    return {
        extensionId: 'm0-anuttara',
        viewId: 'language',
        header: 'header',
        summary: 'summary',
        hint: 'hint',
        family: 'M',
        contributors,
        activationCondition: contributorsActivation(contributors),
        component: NOTHING,
        ...over
    };
}

function snapshot(
    bindings: Record<string, { state: Parameters<typeof grammarFor>[0]; reason?: string }>,
    lastTick = 3
): MExtensionReadinessSnapshot {
    return { bindings, lastTick };
}

describe('32.T32.6 — the registry contract', () => {
    it('resolves what it registered, by both keys', () => {
        const registry = createEmptyStateRegistry();
        const entry = registration();
        registry.register(entry);
        expect(registry.resolve('m0-anuttara', 'language')).toBe(entry);
        // The viewId is part of the key: a different view is a different surface.
        expect(registry.resolve('m0-anuttara', 'graph')).toBeUndefined();
        expect(registry.resolve('m1-paramasiva', 'language')).toBeUndefined();
    });

    it('all() reports every registration, in registration order', () => {
        const registry = createEmptyStateRegistry();
        const first = registration();
        const second = registration({ extensionId: 'm5-epii', viewId: 'review' });
        registry.register(first);
        registry.register(second);
        expect(registry.all()).toEqual([first, second]);
    });

    it('disposing retracts the registration', () => {
        const registry = createEmptyStateRegistry();
        const disposable = registry.register(registration());
        disposable.dispose();
        expect(registry.resolve('m0-anuttara', 'language')).toBeUndefined();
        expect(registry.all()).toEqual([]);
    });

    it('a stale disposable does not delete the registration that replaced it', () => {
        // Otherwise a re-register (HMR, a remount) followed by the old
        // disposable firing would silently blank a live surface.
        const registry = createEmptyStateRegistry();
        const stale = registry.register(registration({ header: 'old' }));
        const live = registration({ header: 'new' });
        registry.register(live);
        stale.dispose();
        expect(registry.resolve('m0-anuttara', 'language')).toBe(live);
    });
});

describe('32.T32.6 — missing contributors and the reasons table', () => {
    const contributors = [
        { bindingKey: 's2.graph.node', label: 'Graph' },
        { bindingKey: 's5.review.inbox', label: 'Review queue' }
    ];

    it('an unreported binding is missing — the bridge has not spoken about it', () => {
        const entry = registration({ contributors });
        expect(missingContributors(entry, null).map(c => c.bindingKey)).toEqual([
            's2.graph.node',
            's5.review.inbox'
        ]);
        const rows = emptyStateReasonRows(entry, null);
        expect(rows.map(row => row.readinessId)).toEqual(['bridge_unavailable', 'bridge_unavailable']);
    });

    it('a contributor the bridge reported ready drops out of the table', () => {
        const entry = registration({ contributors });
        const rows = emptyStateReasonRows(
            entry,
            snapshot({ 's2.graph.node': { state: 'ready_public_current' } })
        );
        expect(rows.map(row => row.bindingKey)).toEqual(['s5.review.inbox']);
    });

    it('the row carries the bridge’s OWN reason when it gave one', () => {
        const entry = registration({ contributors });
        const rows = emptyStateReasonRows(
            entry,
            snapshot({ 's2.graph.node': { state: 's2_graph_blocked', reason: 'neo4j refused' } })
        );
        const graph = rows.find(row => row.bindingKey === 's2.graph.node');
        expect(graph?.reason).toBe('neo4j refused');
        expect(graph?.readinessId).toBe('s2_graph_blocked');
        expect(graph?.ownerTrack).toBe(readinessOwnerTrack('s2_graph_blocked'));
    });

    it('with no reason on the wire the row falls back to the grammar copy, never blank', () => {
        const entry = registration({ contributors });
        const rows = emptyStateReasonRows(entry, snapshot({ 's2.graph.node': { state: 'privacy_blocked' } }));
        const graph = rows.find(row => row.bindingKey === 's2.graph.node');
        expect(graph?.reason).toBe(grammarFor('privacy_blocked').copy);
        expect((graph?.reason ?? '').length).toBeGreaterThan(0);
    });

    it('a blank reason string does not win over the grammar copy', () => {
        const entry = registration({ contributors });
        const rows = emptyStateReasonRows(
            entry,
            snapshot({ 's2.graph.node': { state: 's3_subscription_blocked', reason: '   ' } })
        );
        expect(rows[0].reason).toBe(grammarFor('s3_subscription_blocked').copy);
    });
});

describe('32.T32.6 — activation separates blocked from merely empty', () => {
    const contributors = [
        { bindingKey: 'a.one', label: 'One' },
        { bindingKey: 'b.two', label: 'Two' }
    ];

    it('activates while ANY contributor is unready', () => {
        const activate = contributorsActivation(contributors);
        expect(activate(null)).toBe(true);
        expect(activate(snapshot({ 'a.one': { state: 'ready_public_current' } }))).toBe(true);
    });

    it('stands down once every contributor is ready — then the surface is merely empty', () => {
        const activate = contributorsActivation(contributors);
        expect(
            activate(
                snapshot({
                    'a.one': { state: 'ready_public_current' },
                    'b.two': { state: 'ready_public_current' }
                })
            )
        ).toBe(false);
    });
});

describe('32.T32.6 — the six copy blocks', () => {
    it('covers M0..M5 exactly once, each with real copy', () => {
        expect(M_EMPTY_STATE_GRAMMAR.map(entry => entry.extensionId)).toEqual([
            'm0-anuttara',
            'm1-paramasiva',
            'm2-parashakti',
            'm3-mahamaya',
            'm4-nara',
            'm5-epii'
        ]);
        for (const entry of M_EMPTY_STATE_GRAMMAR) {
            for (const field of [entry.header, entry.summary, entry.hint] as const) {
                expect(field.trim().length).toBeGreaterThan(0);
            }
            expect(entry.contributors.length).toBeGreaterThan(0);
            for (const contributor of entry.contributors) {
                expect(contributor.bindingKey).toMatch(/^[a-z0-9']+([._][a-zA-Z0-9_]+)+$/);
                expect(contributor.label.trim().length).toBeGreaterThan(0);
            }
        }
    });

    it('carries the spec’s own words for each Mn header', () => {
        // 32.6 spec :180-185 — the user-facing strings, verbatim.
        const headers = Object.fromEntries(
            M_EMPTY_STATE_GRAMMAR.map(entry => [entry.extensionId, entry.header])
        );
        expect(headers['m0-anuttara']).toBe('Anuttara waits — the implicate ground.');
        expect(headers['m1-paramasiva']).toBe('K² torus rests — profile-tick has not fired.');
        expect(headers['m2-parashakti']).toBe('Cymatic surface unmodulated — awaiting M1 profile.');
        expect(headers['m3-mahamaya']).toBe('Cosmic clock at noon — awaiting first tick.');
        expect(headers['m4-nara']).toBe('Day not yet begun.');
        expect(headers['m5-epii']).toBe('Atelier quiet.');
    });
});
