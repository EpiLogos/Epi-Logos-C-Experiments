import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isWalkableCoordinate, WalkPane } from './WalkPane';
import { modulationEngine, useEngineStore } from '../engine/modulation/engine';
import { setGateway } from '../bridge/gatewayHolder';
import { instrument } from '../audio/instrument';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore, useTickStore } from '../state/stores';

// REAL gateway envelope shapes (verifier live probe 2026-07-02)
const GRAPH: Record<string, { label: string; rels: { type: string; direction: string; coordinate: string }[] }> = {
    M1: { label: 'Paramasiva', rels: [{ type: 'structural', direction: 'outbound', coordinate: 'M1-2' }] },
    'M1-2': { label: 'Ananda', rels: [{ type: 'correspondential', direction: 'outbound', coordinate: 'M2' }] }
};

describe('WalkPane', () => {
    const invoke = vi.fn(async (method: string, params?: Record<string, unknown>) => {
        const key = String(params?.coordinate ?? params?.from);
        const entry = GRAPH[key] ?? { label: null, rels: [] };
        return method === 's2.graph.node'
            ? ({
                  artifact: {
                      contract: 's2.graph.node',
                      node: { coordinate: key, label: entry.label },
                      relations: entry.rels,
                      resolution: { canonical: key }
                  }
              } as never)
            : ({ artifact: { contract: 's2.graph.traverse', nodes: [] } } as never);
    });

    beforeEach(() => {
        invoke.mockClear();
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        useCoordinateStore.setState({ selected: null });
        useTickStore.setState({ profile: null, generation: null });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('arrives at the seed, walks a relation, publishes the coordinate, and pulses a voice', async () => {
        const pulse = vi.spyOn(instrument, 'pulseVoice');
        render(<WalkPane />);

        expect((await screen.findByTestId('walk-node')).textContent).toContain('M1');
        expect(useCoordinateStore.getState().selected).toBe('M1');

        await act(async () => {
            (await screen.findByTestId('walk-rel-M1-2')).click();
        });
        expect((await screen.findByTestId('walk-node')).textContent).toContain('M1-2');
        expect(screen.getByTestId('walk-phrase').textContent).toContain('—structural→');
        expect(useCoordinateStore.getState().selected).toBe('M1-2');
        // E7-verifier closure: prove the ROUTING with a non-1 gearing — the
        // ground toggle (60) reaches the pulse even profile-free
        expect(pulse).toHaveBeenCalledWith(2, 1); // last digit of M1-2 mod 8; gearing 1 (no engine profile)
        useEngineStore.getState().setGroundGearing(true);
        expect(modulationEngine.currentSubdivision()).toBe(60);
        await act(async () => {
            (await screen.findByTestId('walk-rel-M2')).click();
        });
        expect(pulse).toHaveBeenLastCalledWith(2, 60); // M2 → voice 2, geared ×60
        useEngineStore.getState().setGroundGearing(false);
        expect(invoke).toHaveBeenCalledWith('s2.graph.node', { coordinate: 'M1-2' });
        pulse.mockRestore();
    });

    it('never auto-walks a namespaced selection address — planet:Venus seeds M1 instead (E5 guard)', async () => {
        useCoordinateStore.setState({ selected: 'planet:Venus' });
        render(<WalkPane />);
        expect((await screen.findByTestId('walk-node')).textContent).toContain('M1');
        // the graph was asked for the fallback seed, never the planet address
        expect(invoke).toHaveBeenCalledWith('s2.graph.node', { coordinate: 'M1' });
        expect(invoke).not.toHaveBeenCalledWith('s2.graph.node', { coordinate: 'planet:Venus' });
    });

    it('surfaces the single session-held # operator and round-trips the invert (X → X′ → X) without walking', async () => {
        // The profile bus carries the ONE session-held # (Inversion_Operator),
        // identical at every coordinate (M1'-SPEC §14). Seed the real shape.
        useTickStore.setState({
            generation: 1,
            profile: {
                generation: 1,
                cachedAtMs: 0,
                stale: false,
                stalenessMs: 0,
                privacyClass: 'public-current-context',
                // REAL gateway shape: MathemeHarmonicProfile nests under
                // `harmonicProfile` (verified against the live profile in the
                // visual-panes e2e). A flat `profile.inversionOperator` mock
                // hid the T2.5 path bug — never seed the flat shape again.
                profile: {
                    harmonicProfile: {
                        inversionOperator: {
                            operator: 'matheme-shell-toggle',
                            handle: 'm1://inversion/operator',
                            provenance: 'session-held'
                        }
                    }
                }
            }
        } as never);

        render(<WalkPane />);
        expect((await screen.findByTestId('walk-node')).textContent).toContain('M1');

        // the single session-held operator handle is surfaced on the walked coordinate
        expect(screen.getByTestId('m1-inversion-operator').textContent).toBe('m1://inversion/operator');

        const invokesBefore = invoke.mock.calls.length;
        // base face is the current coordinate
        expect(screen.getByTestId('m1-invert-face').textContent).toBe('M1');
        // invert → the X′ partner
        await act(async () => {
            screen.getByTestId('m1-invert-current-coordinate').click();
        });
        expect(screen.getByTestId('m1-invert-face').textContent).toBe("M1'");
        // invert again → round-trips back to X (pure involution: invert∘invert = id)
        await act(async () => {
            screen.getByTestId('m1-invert-current-coordinate').click();
        });
        expect(screen.getByTestId('m1-invert-face').textContent).toBe('M1');
        // the reciprocal face was surfaced WITHOUT any new graph walk — no node fetch
        expect(invoke.mock.calls.length).toBe(invokesBefore);
    });

    it('isWalkableCoordinate admits Bimba shapes and rejects namespaced/empty addresses', () => {
        expect(isWalkableCoordinate('M1')).toBe(true);
        expect(isWalkableCoordinate('M4-4-4')).toBe(true);
        expect(isWalkableCoordinate('planet:Venus')).toBe(false);
        expect(isWalkableCoordinate('')).toBe(false);
        expect(isWalkableCoordinate(null)).toBe(false);
    });
});
