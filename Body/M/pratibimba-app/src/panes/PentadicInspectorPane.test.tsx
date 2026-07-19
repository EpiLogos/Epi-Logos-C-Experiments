/**
 * Coordinate: M' M3' (pentadic relation inspector composition, 24.T24.18)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): named full-mode inspector acceptance.
 * Actualises: the existing Pentadic pane through M3PentadicRelationInspector.
 * Public surface: behavioral rendering test.
 * Does NOT own: trace genesis, profile transport, or local derivation.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.18.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useTickStore } from '../state/stores';
import { PENTADIC_TRACE_FIXTURE } from '../test/pentadicTraceFixture';
import { PentadicInspectorPane } from './PentadicInspectorPane';

beforeEach(() => {
    useTickStore.setState({
        profile: {
            generation: 41,
            profile: { anuttaraPentadicTrace: PENTADIC_TRACE_FIXTURE }
        } as never,
        generation: 41
    });
});

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('PentadicInspectorPane 24.T24.18 composition', () => {
    it('renders the named full relation inspector with every kernel-authored row', () => {
        render(<PentadicInspectorPane />);

        const inspector = screen.getByTestId('m3-pentadic-relation-inspector');
        expect(inspector.getAttribute('data-mode')).toBe('full');
        expect(inspector.getAttribute('data-generation')).toBe('41');
        expect(screen.getByTestId('m3-pentadic-maxwell').textContent).toContain('15 = 10 + 4 + 1');
        expect(screen.getByTestId('m3-pentadic-fifteens').textContent).toContain('15 + 15');
        expect(screen.getByTestId('m3-pentadic-fifteens').textContent).toContain('24x15=360');
        expect(screen.getByTestId('m3-pentadic-fifteens').textContent).toContain('360+24=384');
        expect(screen.getByTestId('m3-pentadic-hinge').textContent).toContain(
            'whole 0→5 · natural 1→6'
        );
        expect(screen.getByTestId('m3-pentadic-trace').textContent).toContain('codon GTC (37)');
        expect(screen.getByTestId('m3-pentadic-qref').textContent).toBe('q_cosmic://tick/31');
    });

    it('keeps missing trace and coupling-flow lanes visibly pending', () => {
        useTickStore.setState({ profile: null, generation: null });
        render(<PentadicInspectorPane />);

        expect(screen.getByTestId('m3-pentadic-relation-inspector').getAttribute('data-trace-state'))
            .toBe('pending-anuttara-pentadic-trace');
        expect(screen.getByTestId('m3-pentadic-pending').textContent).toContain(
            'pending-anuttara-pentadic-trace'
        );
        expect(screen.getByTestId('m3-pentadic-coupling-flow').textContent).toContain(
            'pending-coupling-flow-alignment'
        );
        expect(screen.getAllByTestId('provenance-pending')).toHaveLength(2);
    });
});
