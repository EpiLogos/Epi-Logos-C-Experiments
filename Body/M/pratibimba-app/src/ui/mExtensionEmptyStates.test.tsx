// @vitest-environment jsdom
/**
 * Coordinate: M' shell (per-Mn empty-state renders — 32.T32.6)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the spec's "per-extension empty-state render test against
 *   synthetic blocked-readiness snapshot" — all six, through the registry, in
 *   the ONE shape, plus the two things the shape is FOR: naming the missing
 *   contributor with its owner, and telling a block apart from a plain empty.
 *
 *   It also pins the consume-not-fork claim: the shared 30.6 <EmptyState>
 *   primitive renders inside every one of them. Before this tranche it had no
 *   production call site at all.
 * Does NOT own: the registry law (emptyStateRegistry.test.ts), the taxonomy
 *   (bridgeReadiness), the lint (scripts/empty-state-registry.test.mjs).
 */

import { cleanup, render, screen, within } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useReadinessStore } from '../state/readinessStore';
import { ONBOARDING_COMPLETED_STEPS_PREFERENCE } from '../panes/kairosEnablement';
import { PASU_SKIPPED_PREFERENCE } from '../onboarding/pasuOnboarding';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';
import { readinessOwnerTrack, type BridgeReadinessId } from './bridgeReadiness';
import { grammarFor } from './readinessGrammar';
import { M_EMPTY_STATE_GRAMMAR } from './emptyStateGrammar';
import { MExtensionEmptyState, M_EMPTY_STATE_REGISTRATIONS } from './mExtensionEmptyStates';
import { emptyStateRegistry } from './emptyStateRegistry';

let generation = 0;
function report(bindingKey: string, state: BridgeReadinessId, reason?: string): void {
    act(() => {
        useReadinessStore
            .getState()
            .reportBinding(bindingKey, reason === undefined ? { state } : { state, reason });
    });
}

beforeEach(() => {
    generation += 1;
    act(() => {
        publishProfileTick({
            generation,
            profile: { tick12: 4, degree720: 240 },
            graphRevision: 0
        } as never);
    });
});

afterEach(() => {
    cleanup();
    act(() => {
        useReadinessStore.getState().clear();
        resetProfileTicks();
    });
    localStorage.clear();
});

describe('32.T32.6 — every M-family surface renders its registered empty state', () => {
    it('renders all six through the registry, in the one shape', () => {
        for (const entry of M_EMPTY_STATE_GRAMMAR) {
            const { unmount } = render(
                <MExtensionEmptyState extensionId={entry.extensionId} viewId={entry.viewId} />
            );
            const node = screen.getByTestId('mext-empty-state');
            expect(node.getAttribute('data-extension')).toBe(entry.extensionId);
            expect(node.getAttribute('data-view')).toBe(entry.viewId);
            // header + summary + missing-contributors + reasons table (spec :177)
            expect(screen.getByTestId('mext-empty-state-title').textContent).toBe(entry.header);
            expect(screen.getByTestId('mext-empty-state-summary').textContent).toBe(entry.summary);
            expect(screen.getByTestId('mext-empty-state-missing')).toBeTruthy();
            expect(screen.getByTestId('mext-empty-state-reasons')).toBeTruthy();
            // …and the shared 30.6 primitive, not a local fork.
            const primitive = within(node).getByTestId('empty-state');
            expect(primitive.getAttribute('aria-label')).toContain('Nothing here yet');
            expect(primitive.textContent).toContain(entry.hint);
            unmount();
        }
    });

    it('names every unreported contributor and who owns the axis', () => {
        for (const entry of M_EMPTY_STATE_GRAMMAR) {
            const { unmount } = render(
                <MExtensionEmptyState extensionId={entry.extensionId} viewId={entry.viewId} />
            );
            const rows = screen.getAllByTestId('mext-empty-state-reason');
            expect(rows.map(row => row.getAttribute('data-binding'))).toEqual(
                entry.contributors.map(contributor => contributor.bindingKey)
            );
            for (const row of rows) {
                // An unreported binding is honestly bridge_unavailable.
                expect(row.getAttribute('data-readiness')).toBe('bridge_unavailable');
                expect(row.textContent).toContain(grammarFor('bridge_unavailable').copy);
                expect(row.textContent).toContain(`track ${readinessOwnerTrack('bridge_unavailable')}`);
            }
            unmount();
        }
    });

    it('carries the bridge’s own reason for a synthetic blocked snapshot', () => {
        const entry = M_EMPTY_STATE_GRAMMAR[0];
        report(entry.contributors[0].bindingKey, 's2_graph_blocked', 'neo4j refused the read');
        render(<MExtensionEmptyState extensionId={entry.extensionId} viewId={entry.viewId} />);
        const row = screen
            .getAllByTestId('mext-empty-state-reason')
            .find(node => node.getAttribute('data-binding') === entry.contributors[0].bindingKey);
        expect(row?.getAttribute('data-readiness')).toBe('s2_graph_blocked');
        expect(row?.textContent).toContain('neo4j refused the read');
        expect(row?.textContent).toContain(`track ${readinessOwnerTrack('s2_graph_blocked')}`);
        // The taxonomy's own recovery route, surfaced as a real command.
        expect(screen.getByTestId('mext-empty-state-recovery').getAttribute('data-command')).toBe(
            'omnipanel.tab.activate.7'
        );
    });

    it('drops the reasons table when every contributor is ready — empty is not blocked', () => {
        const entry = M_EMPTY_STATE_GRAMMAR[3];
        for (const contributor of entry.contributors) {
            report(contributor.bindingKey, 'ready_public_current');
        }
        render(<MExtensionEmptyState extensionId={entry.extensionId} viewId={entry.viewId} />);
        expect(screen.getByTestId('mext-empty-state').getAttribute('data-activated')).toBe('false');
        expect(screen.queryByTestId('mext-empty-state-reasons')).toBeNull();
        expect(screen.queryByTestId('mext-empty-state-missing')).toBeNull();
        expect(screen.queryByTestId('mext-empty-state-recovery')).toBeNull();
        // The surface still speaks: the hint is the whole point of the empty case.
        expect(screen.getByTestId('empty-state').textContent).toContain(entry.hint);
    });

    it('a partially-ready chain still activates and lists only what is absent', () => {
        const entry = M_EMPTY_STATE_GRAMMAR[2]; // M2's M1 → audio_bus → cymatic_field chain
        report(entry.contributors[0].bindingKey, 'ready_public_current');
        render(<MExtensionEmptyState extensionId={entry.extensionId} viewId={entry.viewId} />);
        expect(screen.getByTestId('mext-empty-state').getAttribute('data-activated')).toBe('true');
        const listed = screen
            .getAllByTestId('mext-empty-state-reason')
            .map(row => row.getAttribute('data-binding'));
        expect(listed).not.toContain(entry.contributors[0].bindingKey);
        expect(listed).toContain(entry.contributors[1].bindingKey);
    });
});

describe('32.T32.6 — the per-Mn differences the spec asks for', () => {
    it('M4 keeps the 32.11 start-session affordance, on the ONE primitive button', () => {
        render(<MExtensionEmptyState extensionId="m4-nara" viewId="journal" />);
        const buttons = screen.getAllByRole('button', { name: 'Start session' });
        expect(buttons).toHaveLength(1);
        expect(buttons[0].getAttribute('data-testid')).toBe('start-first-session');
        expect(buttons[0].className).toBe('empty-state-action');
    });

    it('M4 warns on incomplete PASU identity — and stays silent once it is skipped', () => {
        const { unmount } = render(<MExtensionEmptyState extensionId="m4-nara" viewId="journal" />);
        expect(screen.getByTestId('mext-empty-state-notice-pasu-incomplete')).toBeTruthy();
        unmount();

        // A skipped wizard is a decision, not an incompletion (32.7 "if applicable").
        localStorage.setItem(PASU_SKIPPED_PREFERENCE, JSON.stringify(['wizard']));
        render(<MExtensionEmptyState extensionId="m4-nara" viewId="journal" />);
        expect(screen.queryByTestId('mext-empty-state-notice-pasu-incomplete')).toBeNull();
    });

    it('M1 reports the real cold-start step, read from the onboarding ledger', () => {
        localStorage.setItem(
            ONBOARDING_COMPLETED_STEPS_PREFERENCE,
            JSON.stringify(['walkthrough.cosmic-personal', 'identity.pasu-birth-date'])
        );
        render(<MExtensionEmptyState extensionId="m1-paramasiva" viewId="playedTorus" />);
        expect(screen.getByTestId('mext-empty-state-notice-cold-start-step').textContent).toBe(
            'Cold-start orchestrator is at step 2.'
        );
    });

    it('M2 shows the pending-dataset chip only when the bridge reported the payload missing', () => {
        const { unmount } = render(<MExtensionEmptyState extensionId="m2-parashakti" viewId="cymatic" />);
        // Unreported is bridge_unavailable, NOT a named missing payload.
        expect(screen.queryByTestId('mext-empty-state-notice-pending-dataset')).toBeNull();
        unmount();

        report('s2.parashaktiCorrespondences', 'authority_payload_missing', '3 outer planets absent');
        render(<MExtensionEmptyState extensionId="m2-parashakti" viewId="cymatic" />);
        expect(screen.getByTestId('mext-empty-state-notice-pending-dataset').textContent).toContain(
            '3 outer planets dataset'
        );
    });

    it('M5 names both atelier queues', () => {
        render(<MExtensionEmptyState extensionId="m5-epii" viewId="review" />);
        expect(screen.getByTestId('mext-empty-state-notice-review-queue-empty')).toBeTruthy();
        expect(screen.getByTestId('mext-empty-state-notice-dispatch-history-empty')).toBeTruthy();
    });
});

describe('32.T32.6 — the registry is the authority', () => {
    it('the six enrol into the shared registry once rendered', () => {
        render(<MExtensionEmptyState extensionId="m0-anuttara" viewId="language" />);
        expect(emptyStateRegistry.all()).toHaveLength(6);
        for (const registration of M_EMPTY_STATE_REGISTRATIONS) {
            expect(emptyStateRegistry.resolve(registration.extensionId, registration.viewId)).toBe(
                registration
            );
        }
    });

    it('each Mn resolves to its OWN component, not one shared body', () => {
        const components = new Set(M_EMPTY_STATE_REGISTRATIONS.map(entry => entry.component));
        expect(components.size).toBe(6);
    });

    it('an unregistered key says so rather than rendering silence', () => {
        render(<MExtensionEmptyState extensionId="m9-nowhere" viewId="ghost" />);
        expect(screen.getByTestId('mext-empty-state-unregistered').textContent).toContain(
            'm9-nowhere/ghost'
        );
    });
});
