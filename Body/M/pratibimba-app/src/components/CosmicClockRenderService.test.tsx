/**
 * Coordinate: M' M3' (385-node cosmic-clock depth overlay tests)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): #2 depth overlay.
 * Actualises: behavioral proof for rerun tranche 24.T24.2.
 * Public surface: Vitest assertions over CosmicClockRenderService.
 * Does NOT own: clock data, profile cadence, or edge derivation.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    buildCosmicClockRenderModel,
    CosmicClockRenderService
} from './CosmicClockRenderService';

const BACKBONE_DEGREES = Array.from({ length: 24 }, (_, index) => index * 15);

afterEach(cleanup);

describe('CosmicClockRenderService', () => {
    it('builds the 360 + 24 + 1 clock from the current profile tick', () => {
        const model = buildCosmicClockRenderModel({
            tick12: 4,
            degree720: 416,
            backboneDegrees: BACKBONE_DEGREES,
            mode: 'flat-clock-debug'
        });

        expect(model.nodeCount).toBe(385);
        expect(model.degreeNodes).toHaveLength(360);
        expect(model.aminoBackbone).toHaveLength(24);
        expect(model.axisMundi).toEqual({ id: 'axis-mundi', state: 'ready' });
        expect(model.activeDegree).toBe(212);
        expect(model.degreeNodes.find(node => node.active)?.degree).toBe(208);
        expect(new Set(model.aminoBackbone.map(node => node.ring))).toEqual(
            new Set([0, 1, 2, 3])
        );
    });

    it('moves the displayed skeleton only when the profile tick advances', () => {
        const first = buildCosmicClockRenderModel({
            tick12: 4,
            degree720: 416,
            backboneDegrees: BACKBONE_DEGREES,
            mode: 'flat-clock-debug'
        });
        const next = buildCosmicClockRenderModel({
            tick12: 5,
            degree720: 416,
            backboneDegrees: BACKBONE_DEGREES,
            mode: 'flat-clock-debug'
        });

        expect(first.degreeNodes[0].displayDegree).toBe(4);
        expect(next.degreeNodes[0].displayDegree).toBe(5);
        expect(next.degreeNodes[0].displayDegree).not.toBe(first.degreeNodes[0].displayDegree);
    });

    it('renders all nodes and honest pending edge lanes without local edge synthesis', () => {
        const model = buildCosmicClockRenderModel({
            tick12: 4,
            degree720: 416,
            backboneDegrees: BACKBONE_DEGREES,
            mode: 'flat-clock-debug'
        });

        render(
            <svg>
                <CosmicClockRenderService model={model} center={180} size={360} />
            </svg>
        );

        expect(screen.getAllByTestId(/^m3-clock-degree-\d+$/)).toHaveLength(360);
        expect(screen.getAllByTestId(/^m3-clock-amino-\d+$/)).toHaveLength(24);
        expect(screen.getByTestId('m3-clock-axis-mundi')).toBeTruthy();
        expect(screen.getByTestId('m3-clock-aspect-edges').getAttribute('data-state')).toBe(
            'pending-profile-field:cosmicClock.aspectEdges'
        );
        expect(screen.getByTestId('m3-clock-hop-edges').getAttribute('data-state')).toBe(
            'pending-profile-field:cosmicClock.hopEdges'
        );
    });

    it('refuses a malformed backbone instead of fabricating 24 nodes', () => {
        expect(() =>
            buildCosmicClockRenderModel({
                tick12: 4,
                degree720: 416,
                backboneDegrees: [0, 15],
                mode: 'flat-clock-debug'
            })
        ).toThrow('CosmicClockRenderService requires 24 backend backbone degrees');
    });
});
