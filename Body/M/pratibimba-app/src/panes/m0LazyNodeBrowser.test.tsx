/**
 * Coordinate: M' M0-0' (lazy residual-node browser behavioral gate, 21.T21.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' residual graph-data aperture
 * Actualises: strict s2.graph.list pagination, branch switching, and selection
 *   through the one shared coordinate store.
 * Public surface: Vitest suite for M0LazyNodeBrowser.
 * Does NOT own: residual-set membership, graph counts, or canonical node data.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.14.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { M0LazyNodeBrowser } from './M0LazyNodeBrowser';

function connectResidualGateway() {
    const invoke = vi.fn(async (_method: string, params: Record<string, unknown>) => ({
        artifact: {
            contract: { method: 's2.graph.list' },
            coordinatePrefix: params.coordinatePrefix,
            canonicalPrefix: String(params.coordinatePrefix).replace('#', 'M'),
            offset: params.offset,
            limit: params.limit,
            entries: [
                {
                    coordinate: 'M0-3-6-0',
                    name: 'Actual Identity',
                    symbol: '!',
                    form: null,
                    state: 'canonical'
                }
            ],
            total: 28,
            residualTotal: 96,
            datasetTotal: 108,
            state: 'canonical'
        }
    }));
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    return invoke;
}

describe('M0LazyNodeBrowser', () => {
    beforeEach(() => {
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        setGateway(null);
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
    });

    it('requests fixed 20-row pages and advances the second page by 20', async () => {
        const invoke = connectResidualGateway();
        render(<M0LazyNodeBrowser />);

        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('s2.graph.list', {
                coordinatePrefix: '#0-0',
                offset: 0,
                limit: 20
            })
        );

        fireEvent.click(screen.getByTestId('m0-lazy-branch-0-3'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('s2.graph.list', {
                coordinatePrefix: '#0-3',
                offset: 0,
                limit: 20
            })
        );

        fireEvent.click(screen.getByTestId('m0-lazy-next'));
        await waitFor(() =>
            expect(invoke).toHaveBeenCalledWith('s2.graph.list', {
                coordinatePrefix: '#0-3',
                offset: 20,
                limit: 20
            })
        );
    });

    it('publishes a clicked canonical node to the shared coordinate store', async () => {
        connectResidualGateway();
        render(<M0LazyNodeBrowser />);

        const row = await screen.findByTestId('m0-lazy-node-M0-3-6-0');
        fireEvent.click(row);

        expect(useCoordinateStore.getState().selected).toBe('M0-3-6-0');
        expect(screen.getByTestId('m0-lazy-detail').textContent).toContain('Actual Identity');
        expect(screen.getByTestId('m0-lazy-counts').textContent).toContain('96 of 108');
    });
});

