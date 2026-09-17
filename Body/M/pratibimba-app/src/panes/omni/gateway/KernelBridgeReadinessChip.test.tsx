/**
 * Coordinate: M' `/` membrane (Gateway readiness chip tests — Track 27.T27.7)
 * Actualises: the chip reads the shared readiness store, surfaces the WORST
 *   binding's tier, is honestly `bridge_unavailable` when the bridge has
 *   reported nothing, and activates the Diagnostics kernel-bridge sub-section
 *   on click (unless an override is supplied).
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KernelBridgeReadinessChip, worstReadinessBinding } from './KernelBridgeReadinessChip';
import { useReadinessStore } from '../../../state/readinessStore';
import { hydrateOmniPanelSessionState, readOmniPanelSessionState } from '../omnipanelSessionState';

beforeEach(() => {
    hydrateOmniPanelSessionState(null);
    useReadinessStore.getState().clear();
});
afterEach(cleanup);

describe('KernelBridgeReadinessChip — worst-binding readiness surface', () => {
    it('is honestly bridge_unavailable when the bridge has reported nothing', () => {
        render(<KernelBridgeReadinessChip />);
        const chip = screen.getByTestId('kernel-bridge-readiness-chip');
        expect(chip.getAttribute('data-readiness')).toBe('bridge_unavailable');
        expect(chip.getAttribute('data-tier')).toBe('red');
    });

    it('surfaces the worst tier across reported bindings', () => {
        useReadinessStore.getState().reportBinding('s5.review.inbox', { state: 'ready_public_current' });
        useReadinessStore.getState().reportBinding('s2.graph.node', { state: 's2_graph_blocked', reason: 'neo4j down' });
        render(<KernelBridgeReadinessChip />);
        const chip = screen.getByTestId('kernel-bridge-readiness-chip');
        expect(chip.getAttribute('data-readiness')).toBe('s2_graph_blocked');
        expect(chip.getAttribute('data-tier')).toBe('amber');
    });

    it('worstReadinessBinding picks red over amber over green', () => {
        expect(
            worstReadinessBinding({
                a: { state: 'ready_public_current' },
                b: { state: 's2_graph_blocked' },
                c: { state: 'privacy_blocked' }
            }).readinessId
        ).toBe('privacy_blocked');
    });

    it('activates the Diagnostics kernel-bridge sub-section on click', () => {
        render(<KernelBridgeReadinessChip />);
        fireEvent.click(screen.getByTestId('kernel-bridge-readiness-chip'));
        const state = readOmniPanelSessionState();
        expect(state.activeTab).toBe('diagnostics');
        expect(state.perTabState.diagnostics.activeSubSection).toBe('kernel-bridge');
    });

    it('honors an onActivate override for controller reuse', () => {
        const onActivate = vi.fn();
        render(<KernelBridgeReadinessChip onActivate={onActivate} />);
        fireEvent.click(screen.getByTestId('kernel-bridge-readiness-chip'));
        expect(onActivate).toHaveBeenCalledTimes(1);
        expect(readOmniPanelSessionState().activeTab).toBe('pi-chat');
    });
});
