/**
 * Coordinate: M' M3' (hexagram body-dynamics tests — Track 24.T24.8)
 * Actualises: the tranche's verification as behavioral tests — the silhouette
 *   and its eight chakra points render, primary and secondary chakras light
 *   distinctly off the RESOLVED row, zones and dynamic come out verbatim, the
 *   suit-element halo renders when there is a suit, and an unresolved read
 *   draws nothing at all rather than a half-lit body.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    CHAKRA_POINT_COUNT,
    M3HexagramBodyDynamicsViewer,
    M3_HEXAGRAM_BODY_DYNAMICS_WIDGET_ID
} from './M3HexagramBodyDynamicsViewer';
import {
    HexagramBodyDynamicsService,
    HEXAGRAM_BODY_PENDING,
    isResolvedHexagramBody,
    type HexagramBodyEntry
} from '../services/m3/HexagramBodyDynamicsService';

/** Shaped exactly as the gateway's `i-ching` arm answers (epi-cli gate/codon.rs). */
const WIRE_ARTIFACT = {
    refKind: 'i-ching',
    scalarRef: '1',
    resolved: true,
    entry: {
        hexagramId: 1,
        primaryChakraId: 6,
        secondaryChakraIds: [6],
        bodyZones: ['head', 'lungs'],
        dynamic: 'Head/Lungs governing Head/Lungs'
    },
    authority: 'epi-cli::nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS'
};

const ENTRY: HexagramBodyEntry = Object.freeze({
    hexagramId: 12,
    primaryChakraId: 4,
    secondaryChakraIds: [2],
    bodyZones: ['heart', 'chest'],
    dynamic: 'rising'
});

function serviceOver(artifact: unknown): HexagramBodyDynamicsService {
    return new HexagramBodyDynamicsService({
        invoke: async (method, params) => ({
            method,
            gatewayMethod: method,
            sessionKey: 'test',
            profileGeneration: 1,
            privacyClass: 'public_current_context',
            provenanceHandles: [],
            vak: { coordinate: null, contextFrame: null, position: null } as never,
            artifact: typeof params === 'object' ? artifact : artifact
        })
    });
}

afterEach(cleanup);

describe('HexagramBodyDynamicsService.lookup', () => {
    it('parses the gateway i-ching answer into the typed row', async () => {
        const resolved = await serviceOver(WIRE_ARTIFACT).lookup(1);
        expect(isResolvedHexagramBody(resolved)).toBe(true);
        expect(resolved).toEqual({
            hexagramId: 1,
            primaryChakraId: 6,
            secondaryChakraIds: [6],
            bodyZones: ['head', 'lungs'],
            dynamic: 'Head/Lungs governing Head/Lungs'
        });
    });

    it('honours an explicit resolved:false as pending rather than salvaging it', async () => {
        const answer = await serviceOver({
            refKind: 'i-ching',
            resolved: false,
            reason: 'not yet',
            ownerTranche: '24.T24.8'
        }).lookup(3);
        expect(answer).toEqual(HEXAGRAM_BODY_PENDING);
    });

    it('refuses a partial row — a body map without zones is not a body map', async () => {
        const answer = await serviceOver({
            resolved: true,
            entry: { hexagramId: 1, primaryChakraId: 6, secondaryChakraIds: [6], dynamic: 'x' }
        }).lookup(1);
        expect(answer).toEqual(HEXAGRAM_BODY_PENDING);
    });

    it('refuses an out-of-range chakra id instead of lighting a point that does not exist', async () => {
        const answer = await serviceOver({
            resolved: true,
            entry: { ...WIRE_ARTIFACT.entry, primaryChakraId: 9 }
        }).lookup(1);
        expect(answer).toEqual(HEXAGRAM_BODY_PENDING);
    });
});

describe('M3HexagramBodyDynamicsViewer', () => {
    it('lights primary and secondary chakras distinctly and reads zones verbatim', () => {
        render(
            <M3HexagramBodyDynamicsViewer
                hexagramId={12}
                entry={ENTRY}
                halo={{ element: 'Fire', colour: '#d8613c' }}
            />
        );
        const panel = screen.getByTestId('m3-hexagram-body-dynamics');
        expect(panel.getAttribute('data-widget-id')).toBe(M3_HEXAGRAM_BODY_DYNAMICS_WIDGET_ID);
        expect(panel.getAttribute('data-rpc-method')).toBe('s2.codon.scalar_ref.read');
        expect(panel.getAttribute('data-state')).toBe('ready');
        expect(panel.getAttribute('data-primary-chakra')).toBe('4');
        expect(panel.getAttribute('data-secondary-chakra')).toBe('2');

        expect(screen.getAllByTestId(/^m3-hexagram-chakra-\d+$/)).toHaveLength(CHAKRA_POINT_COUNT);
        expect(screen.getByTestId('m3-hexagram-chakra-4').getAttribute('data-role')).toBe('primary');
        expect(screen.getByTestId('m3-hexagram-chakra-2').getAttribute('data-role')).toBe(
            'secondary'
        );
        expect(screen.getByTestId('m3-hexagram-chakra-0').getAttribute('data-lit')).toBe('false');

        expect(screen.getByTestId('m3-hexagram-body-zones').textContent).toBe('heart, chest');
        expect(screen.getByTestId('m3-hexagram-body-dynamic').textContent).toBe('rising');
        expect(screen.getByTestId('m3-hexagram-body-halo-readout').textContent).toBe('Fire');
        expect(screen.getByTestId('m3-hexagram-body-halo')).toBeTruthy();
        expect(screen.getByTestId('m3-hexagram-body-silhouette')).toBeTruthy();
    });

    it('lights ONE point when the dataset repeats the primary as secondary', () => {
        render(
            <M3HexagramBodyDynamicsViewer
                hexagramId={1}
                entry={{
                    hexagramId: 1,
                    primaryChakraId: 6,
                    secondaryChakraIds: [6],
                    bodyZones: ['head', 'lungs'],
                    dynamic: 'Head/Lungs governing Head/Lungs'
                }}
            />
        );
        // The dataset carries `secondary == primary` for hexagram 1. That is what
        // it says; the viewer must not invent a second lit point to fill the slot.
        const lit = screen
            .getAllByTestId(/^m3-hexagram-chakra-\d+$/)
            .filter(node => node.getAttribute('data-lit') === 'true');
        expect(lit).toHaveLength(1);
        expect(lit[0].getAttribute('data-role')).toBe('primary');
    });

    it('draws nothing when the row is pending — no half-lit body', () => {
        render(
            <M3HexagramBodyDynamicsViewer hexagramId={7} entry={HEXAGRAM_BODY_PENDING} />
        );
        expect(screen.getByTestId('m3-hexagram-body-dynamics').getAttribute('data-state')).toBe(
            'pending'
        );
        expect(screen.getByTestId('m3-hexagram-body-pending').textContent).toContain(
            'pending:s2-hexagram-body'
        );
        expect(screen.queryByTestId('m3-hexagram-body-zones')).toBeNull();
        expect(
            screen
                .getAllByTestId(/^m3-hexagram-chakra-\d+$/)
                .every(node => node.getAttribute('data-lit') === 'false')
        ).toBe(true);
        expect(screen.queryByTestId('m3-hexagram-body-halo')).toBeNull();
    });
});
