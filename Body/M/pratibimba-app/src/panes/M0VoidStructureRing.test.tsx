/**
 * Coordinate: M' M0' #0-4 (16-fold Void-Structure ring behavioral gate)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier Holographic Matrix projection
 * Actualises: strict profile parsing, sixteen accessible arcs, and lens selection.
 * Public surface: Vitest suite for M0VoidStructureRing.
 * Does NOT own: lens labels, coordinates, provenance, or profile production.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.15.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KernelBridgeCachedProfile } from '../bridge/types';
import {
    M0VoidStructureRing,
    m0VoidStructureFromProfile
} from './M0VoidStructureRing';

const LABELS = [
    'Microscopic',
    'Binary',
    'Quaternary',
    'Octagonal',
    'Enneadic',
    'Decan',
    'Pleromatic',
    'Hourly',
    'Expanded Hours',
    'Solar Month',
    'Decadic',
    'Greater Chamber',
    'Octant',
    'Quadrant',
    'Hemisphere',
    'Unity'
] as const;

function cachedProfile(): KernelBridgeCachedProfile {
    return {
        generation: 17,
        cachedAtMs: 1,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: {
            harmonicProfile: {
                m0_void_structure_ring: LABELS.map((label, lensIndex) => ({
                    lensIndex,
                    coordinate: `#0-4-${lensIndex}`,
                    label,
                    state: 'canonical'
                }))
            }
        }
    };
}

afterEach(cleanup);

describe('M0VoidStructureRing', () => {
    it('strict-reads the exact sixteen kernel lenses and rejects coordinate drift', () => {
        const projection = m0VoidStructureFromProfile(cachedProfile());
        expect(projection?.lenses).toHaveLength(16);
        expect(projection?.lenses[0]).toEqual({
            lensIndex: 0,
            coordinate: '#0-4-0',
            label: 'Microscopic',
            state: 'canonical'
        });
        expect(projection?.lenses[15].label).toBe('Unity');

        const malformed = cachedProfile();
        (
            (
                (malformed.profile as Record<string, unknown>)
                    .harmonicProfile as Record<string, unknown>
            ).m0_void_structure_ring as Array<Record<string, unknown>>
        )[8].coordinate = '#0-4-renderer-invented';
        expect(m0VoidStructureFromProfile(malformed)).toBeNull();
    });

    it('renders sixteen keyboard-operable arcs and reports the selected kernel lens', () => {
        const projection = m0VoidStructureFromProfile(cachedProfile());
        expect(projection).not.toBeNull();
        const onLensClick = vi.fn();
        render(
            <M0VoidStructureRing
                projection={projection!}
                onLensClick={onLensClick}
            />
        );

        const arcs = screen.getAllByRole('button');
        expect(arcs).toHaveLength(16);
        expect(
            screen.getByTestId('m0-void-structure-ring').getAttribute('data-state')
        ).toBe('canonical');

        const opposite = screen.getByRole('button', {
            name: '#0-4-8 Expanded Hours provenance canonical'
        });
        expect(opposite.closest('g')?.getAttribute('data-conjugation-axis')).toBe('0');
        fireEvent.keyDown(opposite, { key: 'Enter' });
        expect(onLensClick).toHaveBeenCalledWith(projection!.lenses[8]);
    });
});
