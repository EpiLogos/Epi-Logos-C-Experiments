/**
 * Coordinate: M' M0-0' (language-layer reader behavioral tests, rerun 21.T21.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' language-reader component gate
 * Actualises: real render of the canonical c_1_* language fields + asset-handle
 *   row over the shared s2.graph.node read; honest canonical-absence, derived
 *   alias fallback, and review_pending asset provenance.
 * Public surface: Vitest suite for M0LanguageReaderPanel.
 * Does NOT own: gateway transport, canon mutation, the asset projection law
 *   (m0AssetHandles.ts), or the field list (m0Layers.ts M0_LAYER_FIELDS).
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.2.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M0LanguageReaderPanel } from './M0LanguageReaderPanel';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';

function connectGateway(
    node: { coordinate: string; label?: string | null; properties?: Record<string, unknown> } | null
) {
    const invoke = vi.fn(async (method: string) =>
        method === 's2.graph.node'
            ? ({ artifact: { contract: 's2.graph.node', node, relations: [] } } as never)
            : ({ artifact: {} } as never)
    );
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    return invoke;
}

describe('M0LanguageReaderPanel', () => {
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

    it('asks the reader to pick a coordinate before anything is selected (honest, not a placeholder read)', () => {
        render(<M0LanguageReaderPanel />);
        expect(screen.getByTestId('m0-language-reader').getAttribute('data-state')).toBe('idle');
    });

    it('renders the canonical c_1_* language fields from the real s2.graph.node read', async () => {
        connectGateway({
            coordinate: 'M0',
            label: 'Anuttara',
            properties: {
                c_1_symbol: '#',
                c_1_formulation_type: 'implicate',
                c_1_complete_formulation: '(0000) receptive dynamism'
            }
        });
        useCoordinateStore.setState({ selected: 'M0' });
        render(<M0LanguageReaderPanel />);

        await waitFor(() =>
            expect(screen.getByTestId('m0-language-field-c_1_symbol').textContent).toContain('#')
        );
        expect(screen.getByTestId('m0-language-field-c_1_formulation_type').textContent).toContain(
            'implicate'
        );
        expect(
            screen.getByTestId('m0-language-field-c_1_complete_formulation').textContent
        ).toContain('receptive dynamism');
        // a present canonical field carries no absence/derived glyph
        expect(
            screen
                .getByTestId('m0-language-field-c_1_symbol')
                .getAttribute('data-provenance')
        ).toBe('canonical');
    });

    it('accepts an unprefixed alias as a derived reading (DR-M0-2 naming canon)', async () => {
        connectGateway({
            coordinate: 'M0-1',
            properties: { symbol: '0/1' } // legacy alias, no c_1_ prefix
        });
        useCoordinateStore.setState({ selected: 'M0-1' });
        render(<M0LanguageReaderPanel />);

        await waitFor(() =>
            expect(
                screen.getByTestId('m0-language-field-c_1_symbol').getAttribute('data-provenance')
            ).toBe('derived')
        );
        expect(screen.getByTestId('m0-language-field-c_1_symbol').textContent).toContain('0/1');
    });

    it('marks fields canonical-absent when the payload does not carry them (never invented)', async () => {
        connectGateway({ coordinate: 'M9-9', properties: {} });
        useCoordinateStore.setState({ selected: 'M9-9' });
        render(<M0LanguageReaderPanel />);

        await waitFor(() =>
            expect(
                screen
                    .getByTestId('m0-language-field-c_1_complete_formulation')
                    .getAttribute('data-provenance')
            ).toBe('canonical_absent')
        );
    });

    it('surfaces asset handles as review_pending (candidate DR-M0-4), never canonical', async () => {
        connectGateway({
            coordinate: 'M0',
            properties: {
                c_1_asset_uri: ['vault://seals/decan-01.png'],
                c_1_asset_kind: 'decan-seal'
            }
        });
        useCoordinateStore.setState({ selected: 'M0' });
        render(<M0LanguageReaderPanel />);

        await waitFor(() =>
            expect(screen.getByTestId('m0-language-asset-row').getAttribute('data-state')).toBe(
                'review_pending'
            )
        );
        const handle = screen.getByTestId('m0-language-asset-0');
        expect(handle.textContent).toContain('vault://seals/decan-01.png');
        expect(handle.textContent).toContain('decan-seal');
    });

    it('shows an honest asset absence when no c_1_asset_uri is emitted', async () => {
        connectGateway({ coordinate: 'M0', properties: { c_1_symbol: '#' } });
        useCoordinateStore.setState({ selected: 'M0' });
        render(<M0LanguageReaderPanel />);

        await waitFor(() =>
            expect(screen.getByTestId('m0-language-asset-row').getAttribute('data-state')).toBe(
                'canonical_absent'
            )
        );
    });

    it('reports a pending read while the gateway is disconnected (no fabricated data)', () => {
        useCoordinateStore.setState({ selected: 'M0' });
        render(<M0LanguageReaderPanel />);
        expect(screen.getByTestId('m0-language-reader').getAttribute('data-state')).toBe('pending');
    });
});
