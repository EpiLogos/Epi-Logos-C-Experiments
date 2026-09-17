/**
 * Coordinate: M' M1'+M2'+M3' (coupling-flow overlay law — Track 07.T7.6)
 * Residency: Body/M/pratibimba-app/src/engine
 * Position: #3 — Pattern (the overlay is a source-warranted pattern reading)
 * Actualises: strict consumption of the kernel's coupling-flow alignment for
 *   the compact 137 composition disclosure.
 * Public surface: buildCouplingFlowOverlay behavioral contract.
 * Does NOT own: coupling-flow derivation, physics calculation, or WebGL.
 * Contract: Body/S/S0/portal-core/src/profile_projections.rs::CouplingFlowAlignment.
 */

import { describe, expect, it } from 'vitest';
import { buildCouplingFlowOverlay } from './couplingFlowOverlay';

const ALIGNMENT = {
    symbolicSkeletons: ['137 = 64 + 72 + 1', 'X(1) = (0,4,2,2,9)'],
    physicsDescent: ['physics_reference:G_SM', 'physics_reference:alpha_EM(0)'],
    measurementFaces: [
        '137 integer skeleton',
        '137.035999... dressed low-energy measurement-face'
    ],
    recognitionContext: {
        warrant: 'source-warrant symbolic skeleton, not renderer computation',
        handles: ['canon://third-spanda']
    },
    caveats: [
        '137 is the integer skeleton; 137.035999... is the dressed low-energy measurement-face',
        'No executable formula or renderer-computed constant is serialized'
    ]
};

describe('07.T7.6 coupling-flow overlay', () => {
    it('renders only the source-warranted symbolic, measurement, physics, and caveat lanes', () => {
        const overlay = buildCouplingFlowOverlay({ couplingFlowAlignment: ALIGNMENT });

        expect(overlay.state).toBe('ready');
        expect(overlay.symbolicSkeletons).toEqual(ALIGNMENT.symbolicSkeletons);
        expect(overlay.physicsDescent).toEqual(ALIGNMENT.physicsDescent);
        expect(overlay.measurementFaces).toEqual(ALIGNMENT.measurementFaces);
        expect(overlay.recognitionWarrant).toBe(ALIGNMENT.recognitionContext.warrant);
        expect(overlay.caveats).toEqual(ALIGNMENT.caveats);
    });

    it('unwraps the harmonic-profile wire envelope without creating a parallel source', () => {
        const overlay = buildCouplingFlowOverlay({ harmonicProfile: { couplingFlowAlignment: ALIGNMENT } });
        expect(overlay.state).toBe('ready');
        expect(overlay.symbolicSkeletons[0]).toBe('137 = 64 + 72 + 1');
    });

    it('stays explicitly pending when the projection is absent or structurally incomplete', () => {
        expect(buildCouplingFlowOverlay({}).state).toBe('pending-coupling-flow-alignment');
        expect(
            buildCouplingFlowOverlay({
                couplingFlowAlignment: { ...ALIGNMENT, physicsDescent: [''] }
            }).state
        ).toBe('pending-coupling-flow-alignment');
    });
});
