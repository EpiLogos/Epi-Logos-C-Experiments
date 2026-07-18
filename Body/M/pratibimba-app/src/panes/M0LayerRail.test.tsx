import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M0LayerRail } from './M0LayerRail';
import { commands } from '../commands/registry';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';

describe('M0LayerRail', () => {
    beforeEach(() => {
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        setGateway(null);
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
    });

    it('renders all six layers and discriminates local from bridged', () => {
        render(<M0LayerRail />);
        for (const key of [
            'language',
            'ql-structure',
            'relations',
            'time-community',
            'personal',
            'pedagogy'
        ]) {
            expect(screen.getByTestId(`m0-layer-${key}`)).toBeTruthy();
        }
        expect(screen.getByTestId('m0-layer-language').tagName).toBe('BUTTON');
        expect(screen.getByTestId('m0-layer-personal').tagName).toBe('A');
    });

    it('starts on the language layer and switches the active local layer on click', async () => {
        render(<M0LayerRail />);
        expect(screen.getByTestId('m0-layer-language').getAttribute('data-active')).toBe('true');
        await act(async () => {
            screen.getByTestId('m0-layer-relations').click();
        });
        expect(screen.getByTestId('m0-layer-relations').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m0-layer-language').getAttribute('data-active')).toBe('false');
    });

    it('uses the carrier-owned active layer and reports changes without keeping a duplicate selection', async () => {
        const onLayerChange = vi.fn();
        render(<M0LayerRail activeLayer="rel" onLayerChange={onLayerChange} />);

        expect(screen.getByTestId('m0-layer-relations').getAttribute('data-active')).toBe('true');
        await act(async () => {
            screen.getByTestId('m0-layer-time-community').click();
        });
        expect(onLayerChange).toHaveBeenCalledWith('time');
        expect(screen.getByTestId('m0-layer-relations').getAttribute('data-active')).toBe('true');
    });

    it('activates a local layer requested by a cross-layout intent after mount', () => {
        const { rerender } = render(<M0LayerRail requestedLayer="ql" />);
        expect(screen.getByTestId('m0-layer-ql-structure').getAttribute('data-active')).toBe('true');

        rerender(<M0LayerRail requestedLayer="time" />);
        expect(screen.getByTestId('m0-layer-time-community').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m0-layer-ql-structure').getAttribute('data-active')).toBe('false');
    });

    it('registers the m0.layer.* commands while mounted and switches tabs through them (09.T9.1)', async () => {
        const onLayerChange = vi.fn();
        const { unmount } = render(<M0LayerRail onLayerChange={onLayerChange} />);
        for (const id of ['m0.layer.lang', 'm0.layer.ql', 'm0.layer.rel', 'm0.layer.time']) {
            expect(commands.has(id)).toBe(true);
        }
        // bridged layers are routes, never local tab commands
        expect(commands.has('m0.layer.pers')).toBe(false);
        expect(commands.has('m0.layer.pedag')).toBe(false);

        await act(async () => {
            await commands.execute('m0.layer.time');
        });
        expect(
            screen.getByTestId('m0-layer-time-community').getAttribute('data-active')
        ).toBe('true');
        expect(onLayerChange).toHaveBeenCalledWith('time');

        unmount();
        expect(commands.has('m0.layer.lang')).toBe(false);
    });

    it('carries the frozen tab-route law on every entry', () => {
        render(<M0LayerRail />);
        expect(screen.getByTestId('m0-layer-language').getAttribute('data-route')).toBe(
            '/m0-anuttara/coordinate/language'
        );
        expect(screen.getByTestId('m0-layer-pedagogy').getAttribute('data-route')).toBe(
            '/m0-anuttara/coordinate/pedagogy'
        );
    });

    it('bridged layers carry the deep-link for the selected coordinate and follow the store', async () => {
        useCoordinateStore.setState({ selected: 'M4-4-4' });
        render(<M0LayerRail />);
        expect(screen.getByTestId('m0-layer-personal').getAttribute('href')).toBe(
            'epi-logos://ide/m4-nara/artifact?coordinate=M4-4-4&source=m0-anuttara'
        );
        expect(screen.getByTestId('m0-layer-pedagogy').getAttribute('href')).toBe(
            'epi-logos://ide/m5-epii/review?coordinate=M4-4-4&source=m0-anuttara'
        );
        await act(async () => {
            useCoordinateStore.getState().setSelected("M0-1'");
        });
        expect(screen.getByTestId('m0-layer-personal').getAttribute('href')).toBe(
            "epi-logos://ide/m4-nara/artifact?coordinate=M0-1'&source=m0-anuttara"
        );
    });

    it('routes graph-change proposals through M5 review instead of exposing a graph write', () => {
        useCoordinateStore.setState({ selected: 'M0-1' });
        render(<M0LayerRail />);

        const proposal = screen.getByTestId('m0-governed-proposal');
        expect(proposal.tagName).toBe('A');
        expect(proposal.getAttribute('href')).toBe(
            'epi-logos://ide/m5-epii/review?coordinate=M0-1&intent=governed-promotion&source=m0-anuttara'
        );
        expect(proposal.getAttribute('href')).not.toContain('s2.graph');
    });

    /* 21.T21.18 — each local layer reads its own evidence from the shared
     * s2.graph.node response; the two bridges are explicit dispositions. */

    const connectGateway = (
        node: { coordinate: string; label: string | null; properties?: Record<string, unknown> } | null,
        relations: readonly Record<string, unknown>[] = []
    ) => {
        const invoke = vi.fn(async (method: string) =>
            method === 's2.graph.node'
                ? ({ artifact: { contract: 's2.graph.node', node, relations } } as never)
                : ({ artifact: {} } as never)
        );
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
        return invoke;
    };

    it('carries no S2 read chip until a coordinate is selected (honest absence, not a placeholder)', () => {
        render(<M0LayerRail />);
        expect(screen.getByTestId('m0-layer-language').getAttribute('data-s2-read')).toBe('none');
        // no provenance glyph is rendered when there is nothing to read
        expect(screen.queryByTestId('provenance-canonical_absent')).toBeNull();
        expect(screen.queryByTestId('provenance-pending')).toBeNull();
    });

    it('shows distinct per-layer evidence pills and explicit bridge dispositions (21.18)', async () => {
        connectGateway(
            {
                coordinate: 'M1',
                label: 'Paramasiva',
                properties: {
                    c_1_symbol: 'Paramasiva',
                    c_1_ql_variant: 'quaternal',
                    gds_community: 'source-cluster'
                }
            },
            [{ coordinate: 'M0', type: 'CONTAINS', direction: 'outbound' }]
        );
        useCoordinateStore.setState({ selected: 'M1' });
        render(<M0LayerRail />);

        const expected = {
            language: 'canonical',
            'ql-structure': 'canonical',
            relations: 'canonical',
            'time-community': 'derived'
        } as const;
        for (const [key, state] of Object.entries(expected)) {
            await waitFor(() =>
                expect(screen.getByTestId(`m0-layer-${key}`).getAttribute('data-s2-read')).toBe(state)
            );
        }
        expect(screen.getByTestId('m0-layer-personal').getAttribute('data-m0-provenance')).toBe('bridged_local');
        expect(screen.getByTestId('m0-layer-pedagogy').getAttribute('data-m0-provenance')).toBe('bridged_public');
    });

    it('shows canonical_absent when the selected coordinate has no canonical node (never inferred)', async () => {
        connectGateway(null);
        useCoordinateStore.setState({ selected: 'M9-9-9' });
        render(<M0LayerRail />);

        await waitFor(() =>
            expect(
                screen.getByTestId('m0-layer-language').getAttribute('data-s2-read')
            ).toBe('canonical_absent')
        );
        expect(screen.getAllByTestId('m0-layer-provenance-canonical_absent')).toHaveLength(3);
        expect(screen.getAllByTestId('m0-layer-provenance-blocked')).toHaveLength(1);
    });
});
