/**
 * Coordinate: M' M0-2' (relations-layer reader behavioral tests, rerun 21.T21.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-2' relation-field two-column reader gate
 * Actualises: structural and correspondential edges rendered in distinct
 *   columns (never collapsed, Track 01.9), unclassified edges surfaced not
 *   guessed, and per-row provenance over the real s2.graph.node relations.
 * Public surface: Vitest suite for M0RelationsReaderPanel.
 * Does NOT own: gateway transport, the family enum authority, or the
 *   discrimination law (m0RelationFamily.ts buildM0RelationFamilyProjection).
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.4.
 */

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M0RelationsReaderPanel } from './M0RelationsReaderPanel';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';

function connectGateway(relations: readonly Record<string, unknown>[]) {
    const invoke = vi.fn(async (method: string) =>
        method === 's2.graph.node'
            ? ({
                  artifact: {
                      contract: 's2.graph.node',
                      node: { coordinate: 'M0' },
                      relations
                  }
              } as never)
            : ({ artifact: {} } as never)
    );
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    return invoke;
}

describe('M0RelationsReaderPanel', () => {
    beforeEach(() => {
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        setGateway(null);
    });
    afterEach(() => {
        cleanup();
        setGateway(null);
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        useCoordinateStore.setState({ selected: null });
    });

    it('waits for a selected coordinate before reading (honest idle state)', () => {
        render(<M0RelationsReaderPanel />);
        expect(screen.getByTestId('m0-relations-reader').getAttribute('data-state')).toBe('idle');
    });

    it('renders structural and correspondential edges in distinct columns (never collapsed)', async () => {
        connectGateway([
            { coordinate: 'M0-1', type: 'CONTAINS', c_1_relation_family: 'structural' },
            {
                coordinate: 'M3-4',
                type: 'DECAN_RULERSHIP',
                c_1_relation_family: 'correspondential'
            }
        ]);
        useCoordinateStore.setState({ selected: 'M0' });
        render(<M0RelationsReaderPanel />);

        const structural = await screen.findByTestId('m0-relations-column-structural');
        const correspondential = screen.getByTestId('m0-relations-column-correspondential');
        expect(within(structural).getByText(/CONTAINS/)).toBeTruthy();
        expect(within(structural).getByText(/M0-1/)).toBeTruthy();
        expect(within(correspondential).getByText(/DECAN_RULERSHIP/)).toBeTruthy();
        expect(within(correspondential).getByText(/M3-4/)).toBeTruthy();
        // the columns are separate DOM subtrees — the two families never merge
        expect(within(structural).queryByText(/DECAN_RULERSHIP/)).toBeNull();
    });

    it('surfaces an unfamilied edge as unclassified — never guessed from its type', async () => {
        connectGateway([{ coordinate: 'B', type: 'REFERENCES' }]);
        useCoordinateStore.setState({ selected: 'A' });
        render(<M0RelationsReaderPanel />);

        await waitFor(() =>
            expect(
                screen.getByTestId('m0-relations-reader').getAttribute('data-unclassified')
            ).toBe('1')
        );
        // the structural column stays present (never collapsed) but empty — the
        // REFERENCES edge is NOT guessed into it despite looking structural
        const structural = screen.getByTestId('m0-relations-column-structural');
        expect(within(structural).queryByText(/REFERENCES/)).toBeNull();
        // it surfaces honestly in the unclassified group instead
        const unclassified = screen.getByTestId('m0-relations-column-unclassified');
        expect(within(unclassified).getByText(/REFERENCES/)).toBeTruthy();
    });

    it('reports a pending read while the gateway is disconnected', () => {
        useCoordinateStore.setState({ selected: 'M0' });
        render(<M0RelationsReaderPanel />);
        expect(screen.getByTestId('m0-relations-reader').getAttribute('data-state')).toBe(
            'pending'
        );
    });
});
