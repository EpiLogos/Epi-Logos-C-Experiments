import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTickStore } from '../state/stores';
import { MedicineViewPane } from './MedicineViewPane';
import type { MedicineSnapshot } from './medicineView';

const fixture: MedicineSnapshot = {
    chakras: Array.from({ length: 8 }, (_, id) => ({
        id,
        name: `chakra-${id}`,
        dominantElementId: id === 1 ? 1 : null,
        bodyZones: [`zone_${id}`, `second_${id}`]
    })),
    activeDecan: {
        sunDegree: 15,
        signIdx: 0,
        decanInSign: 1,
        decanIdx: 1,
        bodyPart: 'Eyes and sinuses',
        rulingPlanet: 'Sun',
        rulingPlanetGlyph: 'sun',
        activeChakraId: 7,
        herbs: [{ vernacular: 'Nettle', botanical: 'Urtica dioica' }]
    }
};

afterEach(() => {
    cleanup();
    useTickStore.setState({ profile: null, generation: null });
});

describe('MedicineViewPane', () => {
    it('renders three panels, expands real body zones, and marks the active chakra', () => {
        render(<MedicineViewPane fixture={fixture} />);
        expect(screen.getByRole('heading', { name: 'Chakra ladder' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Active decan' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Herbal evidence' })).toBeTruthy();
        expect(document.querySelector('[data-active="true"]')?.textContent).toContain('chakra-7');
        fireEvent.click(screen.getByRole('button', { name: /chakra-1/i }));
        expect(screen.getByText('zone 1')).toBeTruthy();
    });

    it('attributes the two body ontologies separately and marks the bridge as a correspondence', () => {
        // The chakra ladder is M2-2's yogic body; the decan reading is M2-3's
        // Hermetic medical-astrology body. One organism, two ontologies — the
        // surface must not present them as one undifferentiated "medicine".
        render(<MedicineViewPane fixture={fixture} />);
        const yogic = document.querySelector('[data-body-ontology="yogic"]');
        const hermetic = document.querySelector('[data-body-ontology="hermetic"]');
        expect(yogic?.getAttribute('data-owner-coordinate')).toBe('M2-2');
        expect(hermetic?.getAttribute('data-owner-coordinate')).toBe('M2-3');
        expect(yogic).not.toBe(hermetic);
        // Each body's parts stay inside its own panel: zones are yogic,
        // the decan body part is Hermetic.
        expect(yogic?.textContent).toContain('chakra-7');
        expect(hermetic?.textContent).toContain('Eyes and sinuses');
        expect(yogic?.textContent).not.toContain('Eyes and sinuses');
        // The active chakra is reached ACROSS from the decan through the shared
        // element, so it is labelled a claim rather than a fact of this body.
        const bridged = document.querySelector('[data-active="true"]');
        expect(bridged?.getAttribute('data-corresponded-from')).toBe('m2-3-decan');
        expect(bridged?.getAttribute('title')).toContain('not an identity');
    });

    it('does not claim a pin until persistence succeeds', async () => {
        let resolve!: () => void;
        const pinMateria = vi.fn(() => new Promise<void>(done => { resolve = done; }));
        render(<MedicineViewPane fixture={fixture} pinMateria={pinMateria} />);
        fireEvent.click(screen.getByRole('button', { name: 'Pin to NOW' }));
        expect(screen.getByRole('button', { name: 'Pinning…' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Pinned to NOW' })).toBeNull();
        await act(async () => resolve());
        expect(screen.getByRole('button', { name: 'Pinned to NOW' })).toBeTruthy();
    });

    it('refreshes the active decan when the shared Kairos Sun degree advances', async () => {
        useTickStore.getState().setProfile({
            generation: 1,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'public-current-context',
            profile: { harmonicProfile: { planetDegrees: [15] } }
        });
        const loadSnapshot = vi.fn(async (sunDegree: number): Promise<MedicineSnapshot> => ({
            ...fixture,
            activeDecan: { ...fixture.activeDecan, sunDegree, decanIdx: Math.floor(sunDegree / 10) }
        }));
        render(<MedicineViewPane loadSnapshot={loadSnapshot} />);
        await waitFor(() => expect(loadSnapshot).toHaveBeenCalledWith(15));

        act(() => useTickStore.getState().setProfile({
            generation: 2,
            cachedAtMs: 2,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'public-current-context',
            profile: { harmonicProfile: { planetDegrees: [25] } }
        }));
        await waitFor(() => expect(loadSnapshot).toHaveBeenCalledWith(25));
        await waitFor(() => expect(screen.getByTestId('medicine-active-decan').textContent).toContain('Decan 3'));
    });
});
