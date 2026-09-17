/**
 * Coordinate: M' M0-1' (QL-structure reader behavioral tests, rerun 21.T21.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-1' structural-pointer reader gate
 * Actualises: a real selected-coordinate `s2.graph.node` read that renders
 *   canonical QL fields and structural typed edges without locally fabricating
 *   a coordinate tree.
 * Public surface: Vitest suite for M0QlStructureReaderPanel.
 * Does NOT own: S2 transport, relation-family classification, cross-layout
 *   navigation, or canon mutation.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.3.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M0QlStructureReaderPanel } from './M0QlStructureReaderPanel';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';

function connectGateway(input: {
    readonly node: { coordinate: string; properties?: Record<string, unknown> } | null;
    readonly relations: readonly Record<string, unknown>[];
}) {
    const invoke = vi.fn(async (method: string) =>
        method === 's2.graph.node'
            ? ({ artifact: { contract: 's2.graph.node', node: input.node, relations: input.relations } } as never)
            : ({ artifact: {} } as never)
    );
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    return invoke;
}

describe('M0QlStructureReaderPanel', () => {
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

    it('waits for a selected coordinate before issuing the graph read', () => {
        render(<M0QlStructureReaderPanel />);
        expect(screen.getByTestId('m0-ql-structure-reader').getAttribute('data-state')).toBe('idle');
    });

    it('renders canonical QL fields plus only the declared structural relations', async () => {
        const invoke = connectGateway({
            node: {
                coordinate: 'M0-4',
                properties: { c_1_ql_position: 4, c_1_ql_variant: 'mod6' }
            },
            relations: [
                { coordinate: 'M0-0', type: 'FAMILY_CONTAINS', c_1_relation_family: 'structural' },
                { coordinate: 'M0-5', type: 'MIRROR_CHILDREN', c_1_relation_family: 'structural' },
                { coordinate: 'M4-0', type: 'ANCHORED_TO', c_1_relation_family: 'structural' },
                { coordinate: 'M3-4', type: 'DECAN_RULERSHIP', c_1_relation_family: 'correspondential' }
            ]
        });
        useCoordinateStore.setState({ selected: 'M0-4' });
        render(<M0QlStructureReaderPanel />);

        await waitFor(() =>
            expect(screen.getByTestId('m0-ql-position').textContent).toContain('4')
        );
        expect(screen.getByTestId('m0-ql-variant').textContent).toContain('mod6');
        expect(screen.getByTestId('m0-ql-family-parent').textContent).toContain('M0-0');
        expect(screen.getByTestId('m0-ql-mirror-child').textContent).toContain('M0-5');
        expect(screen.getByTestId('m0-ql-anchors').textContent).toContain('M4-0');
        expect(screen.getByTestId('m0-ql-structure-reader').textContent).not.toContain('DECAN_RULERSHIP');
        expect(invoke).toHaveBeenCalledWith('s2.graph.node', { coordinate: 'M0-4' });
    });

    it('distinguishes canonical absence from a failed or disconnected read', async () => {
        connectGateway({ node: { coordinate: 'M0-1', properties: {} }, relations: [] });
        useCoordinateStore.setState({ selected: 'M0-1' });
        render(<M0QlStructureReaderPanel />);

        await waitFor(() =>
            expect(screen.getByTestId('m0-ql-position').getAttribute('data-provenance')).toBe(
                'canonical_absent'
            )
        );
        expect(screen.getByTestId('m0-ql-structure-reader').getAttribute('data-state')).toBe('ready');
    });
});
