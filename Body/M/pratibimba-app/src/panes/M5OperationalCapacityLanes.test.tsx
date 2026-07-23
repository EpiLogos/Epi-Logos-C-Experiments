/**
 * Coordinate: M' M5' (operational-capacity lanes — Track 26.T26.2)
 * Actualises: the behavioural proof for the six-capacity affordance the M5'
 *   EBM observatory hosts — six lanes render at once (NOT tabs), each carrying
 *   honest dispatch + human-gate counts from `s5'.improve.history`, an explicit
 *   substrate-pending harmonic-boundary note (never fabricated), a click-through
 *   that dispatches a cross-layout intent to the Pi-monitor (ACR,
 *   `agentic-control-room`) with the lane's subsystem vak coordinate, and a
 *   profile-tick-driven refresh (one clock only — no local timer).
 */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../bridge/gatewayHolder', () => ({
    gateway: () => ({ invoke }),
    gatewayReady: () => true
}));

import { commands } from '../commands/registry';
import { parseImproveHistory } from './autoresearchModel';
import { M5OperationalCapacityLanes } from './M5OperationalCapacityLanes';
import { useTickStore } from '../state/stores';

const HISTORY_WIRE = {
    runs: [
        {
            run_id: 'run-1',
            target_coordinate: "M5-4'",
            direction: 'Refine recursive review routing',
            typed_candidate: { target_subsystem: 'epii', requires_human: true },
            source_review_item_id: 'review-17',
            loop_state: 'evaluating',
            decision: null,
            updated_at: 700
        },
        {
            run_id: 'run-2',
            target_coordinate: "M5-5'",
            direction: 'Second epii recursion pass',
            typed_candidate: { target_subsystem: 'epii' },
            source_review_item_id: null,
            loop_state: 'hypothesis',
            decision: 'keep',
            updated_at: 900
        },
        {
            run_id: 'run-3',
            target_coordinate: "M2-2'",
            direction: 'Re-index relational evidence',
            typed_candidate: { target_subsystem: 'parashakti' },
            source_review_item_id: null,
            loop_state: 'hypothesis',
            decision: 'keep',
            updated_at: 600
        }
    ]
};

const CANDIDATES = parseImproveHistory(HISTORY_WIRE);

afterEach(() => {
    cleanup();
    invoke.mockReset();
    useTickStore.setState({ profile: null, generation: null });
});

describe('M5OperationalCapacityLanes', () => {
    it('renders all six capacity lanes at once (never a tab bar)', () => {
        render(<M5OperationalCapacityLanes fixture={CANDIDATES} />);
        const region = screen.getByTestId('m5-capacity-lanes');
        expect(within(region).getAllByTestId(/^m5-capacity-lane-/)).toHaveLength(6);
        // DR-TS-4 / DR-MP-1: the six operational-capacity views are NOT tabs.
        expect(within(region).queryAllByRole('tab')).toHaveLength(0);
    });

    it('discloses honest per-capacity dispatch + human-gate counts from the improve history', () => {
        render(<M5OperationalCapacityLanes fixture={CANDIDATES} />);
        const epii = screen.getByTestId('m5-capacity-lane-epii-self-referential');
        expect(epii.textContent).toContain('2 dispatches');
        expect(epii.textContent).toContain('1 human gate');
        expect(screen.getByTestId('m5-capacity-lane-parashakti-graph-relational-ml').textContent).toContain(
            '1 dispatch'
        );
        expect(screen.getByTestId('m5-capacity-lane-nara-anima-dialogic').textContent).toContain('0 dispatches');
    });

    it('marks the capacity-scoped harmonic boundary substrate-pending, never fabricated', () => {
        render(<M5OperationalCapacityLanes fixture={CANDIDATES} />);
        expect(screen.getByTestId('m5-capacity-harmonic-pending').textContent?.toLowerCase()).toContain(
            'not projected'
        );
    });

    it('routes a lane to the Pi-monitor via the injected handler with its vak coordinate', () => {
        const onOpenPiMonitor = vi.fn();
        render(<M5OperationalCapacityLanes fixture={CANDIDATES} onOpenPiMonitor={onOpenPiMonitor} />);
        fireEvent.click(screen.getByTestId('m5-capacity-open-pi-monitor-epii-self-referential'));
        expect(onOpenPiMonitor).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'epii-self-referential', coordinate: "M5'" })
        );
    });

    it('by default dispatches a cross-layout intent to the ACR carrying the vak coordinate', () => {
        const execute = vi.spyOn(commands, 'execute').mockResolvedValue(undefined);
        render(<M5OperationalCapacityLanes fixture={CANDIDATES} />);
        fireEvent.click(screen.getByTestId('m5-capacity-open-pi-monitor-anuttara-construction'));
        expect(execute).toHaveBeenCalledWith(
            'pratibimba.intent.dispatch',
            expect.objectContaining({
                requestedExtensionId: 'ide-shell-m0-m5',
                requestedContributionId: 'agentic-control-room',
                coordinate: 'M0'
            })
        );
        execute.mockRestore();
    });

    it('reads improve history from the gateway and re-reads on profile-tick advance (no local clock)', async () => {
        invoke.mockResolvedValue({ artifact: HISTORY_WIRE });
        render(<M5OperationalCapacityLanes />);
        await waitFor(() => {
            expect(screen.getByTestId('m5-capacity-lane-epii-self-referential').textContent).toContain('2 dispatches');
        });
        const first = invoke.mock.calls.filter(call => call[0] === "s5'.improve.history").length;
        expect(first).toBeGreaterThanOrEqual(1);
        act(() => {
            useTickStore.getState().setProfile({
                generation: 5,
                cachedAtMs: 5000,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'public',
                profile: { harmonicProfile: {} }
            });
        });
        await waitFor(() => {
            const next = invoke.mock.calls.filter(call => call[0] === "s5'.improve.history").length;
            expect(next).toBeGreaterThan(first);
        });
    });
});
