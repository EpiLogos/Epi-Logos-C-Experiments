/**
 * Coordinate: M' `/` membrane (readiness summary tests — Track 27.T27.8)
 * Actualises: the readiness summary groups the live per-binding ledger by its
 *   nine-state class in canonical S0 order, one row per class present with a
 *   correct count, and states honest-empty when the bridge has reported nothing
 *   — it never invents a "ready" class.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    KernelBridgeReadinessSummary,
    groupReadinessBindings
} from './KernelBridgeReadinessSummary';
import { useReadinessStore } from '../../../state/readinessStore';
import type { ReportedBinding } from '../../../ui/bridgeReadiness';

function seed(bindings: Record<string, ReportedBinding>) {
    useReadinessStore.setState({ bindings });
}

beforeEach(() => useReadinessStore.setState({ bindings: {} }));
afterEach(() => cleanup());

describe('groupReadinessBindings (pure)', () => {
    it('groups by class, counts, and orders by the canonical S0 taxonomy', () => {
        const groups = groupReadinessBindings({
            's5.review.inbox': { state: 'ready_public_current' },
            's2.graph.node': { state: 'bridge_unavailable' },
            's3.subscription': { state: 'ready_public_current' }
        });
        // bridge_unavailable precedes ready_public_current in canonical order.
        expect(groups.map(g => g.id)).toEqual(['bridge_unavailable', 'ready_public_current']);
        expect(groups.find(g => g.id === 'ready_public_current')?.count).toBe(2);
        expect(groups.find(g => g.id === 'bridge_unavailable')?.count).toBe(1);
    });

    it('returns nothing for an empty ledger', () => {
        expect(groupReadinessBindings({})).toEqual([]);
    });
});

describe('KernelBridgeReadinessSummary', () => {
    it('renders honest-empty when the bridge has reported no bindings', () => {
        render(<KernelBridgeReadinessSummary />);
        expect(screen.getByTestId('kernel-bridge-readiness-summary')).toBeTruthy();
        expect(screen.getByTestId('kernel-bridge-readiness-empty')).toBeTruthy();
    });

    it('renders one row per class present, with per-class counts', () => {
        seed({
            's2.graph.node': { state: 'profile_missing_field', reason: 'tick12 pending' },
            's2.graph.query': { state: 'profile_missing_field' },
            's5.review.inbox': { state: 'ready_public_current' }
        });
        render(<KernelBridgeReadinessSummary />);
        expect(screen.getByTestId('readiness-count-profile_missing_field').textContent).toBe('2');
        expect(screen.getByTestId('readiness-count-ready_public_current').textContent).toBe('1');
        expect(screen.getByTestId('readiness-class-profile_missing_field').getAttribute('data-tier')).toBe('amber');
        expect(screen.getByTestId('readiness-class-ready_public_current').getAttribute('data-tier')).toBe('green');
        expect(screen.queryByTestId('kernel-bridge-readiness-empty')).toBeNull();
    });
});
