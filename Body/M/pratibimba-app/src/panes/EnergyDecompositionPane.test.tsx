/**
 * Coordinate: M' M5' (energy-decomposition read-out pane tests — Track 33.T33.3)
 * Actualises: the render verification, driven through the REAL tick store over
 *   the REAL bussed profile shape (`cached.profile.profile` = the kernel
 *   projection, `energy` a sibling of `harmonicProfile`): narrative + honest
 *   pending banner when no energy is bussed; three channels + the 4:5:6 total
 *   (bussed verbatim) + the bimba–pratibimba diagnostic + stated provenance
 *   when energy is present; E₅/E₆ stub-zero rendered zero-with-provenance while
 *   a real E₄ shows its value; and re-render on profile generation advance.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTickStore } from '../state/stores';
import { EnergyDecompositionPane } from './EnergyDecompositionPane';

/** Bus a profile the way the gateway does — the kernel projection is
 *  `cached.profile.profile`, with `energy` a sibling of `harmonicProfile`. */
function busEnergy(energy: Record<string, string> | null, generation: number) {
    act(() => {
        useTickStore.getState().setProfile({
            generation,
            cachedAtMs: generation * 1000,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: {
                harmonicProfile: { tick12: 3, degree720: 275 },
                ...(energy ? { energy } : {})
            }
        });
    });
}

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('EnergyDecompositionPane', () => {
    it('renders narrative + pending banner when no energy is on the bus', () => {
        render(<EnergyDecompositionPane />);
        expect(screen.getByTestId('energy-decomposition').getAttribute('data-state')).toBe(
            'pending-energy'
        );
        expect(screen.getByTestId('energy-decomposition-narrative').textContent).toContain(
            'canonical 4:5:6 weighting'
        );
        expect(screen.getByTestId('energy-decomposition-pending').textContent).toContain(
            'no energy decomposition yet'
        );
        expect(screen.queryByTestId('energy-decomposition-total')).toBeNull();
        expect(screen.queryByTestId('energy-channel-e4-value')).toBeNull();
    });

    it('renders the three channels + bussed 4:5:6 total + diagnostic + provenance', () => {
        render(<EnergyDecompositionPane />);
        busEnergy(
            {
                bimbaPratibimbaEnergy: '9.000000',
                e4PersonalEnergy: '1.000000',
                e5HarmonicEnergy: '2.000000',
                e6VerifierEnergy: '3.000000',
                totalEnergy: '2.133333'
            },
            11
        );

        expect(screen.getByTestId('energy-decomposition').getAttribute('data-state')).toBe('ready');
        expect(screen.getByTestId('energy-channel-e4-value').textContent).toBe('1.000000');
        expect(screen.getByTestId('energy-channel-e5-value').textContent).toBe('2.000000');
        expect(screen.getByTestId('energy-channel-e6-value').textContent).toBe('3.000000');
        expect(screen.getByTestId('energy-channel-e4-weight').textContent).toContain('weight 4');
        expect(screen.getByTestId('energy-channel-e5-weight').textContent).toContain('weight 5');
        expect(screen.getByTestId('energy-channel-e6-weight').textContent).toContain('weight 6');
        // the 4:5:6 total is the bussed value, verbatim
        expect(screen.getByTestId('energy-decomposition-total').textContent).toContain('2.133333');
        // the bimba–pratibimba diagnostic renders separately (9, not folded into the total)
        expect(screen.getByTestId('energy-decomposition-diagnostic').textContent).toContain(
            '9.000000'
        );
        expect(screen.getByTestId('energy-decomposition-provenance').textContent).toContain(
            'no renderer-local energy math'
        );
        expect(screen.queryByTestId('energy-decomposition-pending')).toBeNull();
    });

    it('renders E₅/E₆ stub-zero as zero-with-provenance while a real E₄ shows its value', () => {
        render(<EnergyDecompositionPane />);
        busEnergy(
            {
                bimbaPratibimbaEnergy: '0.250000',
                e4PersonalEnergy: '0.420000',
                e5HarmonicEnergy: '0.000000',
                e6VerifierEnergy: '0.000000',
                totalEnergy: '0.112000'
            },
            14
        );

        expect(screen.getByTestId('energy-channel-e4-value').textContent).toBe('0.420000');
        // E₅/E₆ render the honest bussed 0, flagged zero, with a provenance badge —
        // NEVER a fabricated non-zero value
        expect(screen.getByTestId('energy-channel-e5-value').textContent).toBe('0.000000');
        expect(screen.getByTestId('energy-channel-e6-value').textContent).toBe('0.000000');
        expect(screen.getByTestId('energy-channel-e5').getAttribute('data-zero')).toBe('true');
        expect(screen.getByTestId('energy-channel-e6').getAttribute('data-zero')).toBe('true');
        expect(screen.getByTestId('energy-channel-e4').getAttribute('data-zero')).toBe('false');
        // the provenance badges on the zero channels state their provenance
        const badges = screen.getAllByTestId('provenance-derived');
        expect(badges.some(b => (b.getAttribute('title') ?? '').includes('not fabricated'))).toBe(
            true
        );
    });

    it('re-renders on profile generation advance — it lives on the one tick spine', () => {
        render(<EnergyDecompositionPane />);
        busEnergy(
            {
                e4PersonalEnergy: '1.000000',
                e5HarmonicEnergy: '0.000000',
                e6VerifierEnergy: '0.000000',
                totalEnergy: '0.266667',
                bimbaPratibimbaEnergy: '0.000000'
            },
            5
        );
        expect(screen.getByTestId('energy-decomposition').getAttribute('data-generation')).toBe('5');
        expect(screen.getByTestId('energy-channel-e4-value').textContent).toBe('1.000000');

        busEnergy(
            {
                e4PersonalEnergy: '2.500000',
                e5HarmonicEnergy: '0.000000',
                e6VerifierEnergy: '0.000000',
                totalEnergy: '0.666667',
                bimbaPratibimbaEnergy: '0.000000'
            },
            6
        );
        expect(screen.getByTestId('energy-decomposition').getAttribute('data-generation')).toBe('6');
        expect(screen.getByTestId('energy-channel-e4-value').textContent).toBe('2.500000');
    });
});
