/**
 * 25.T25.7 — the Personal Coordinate sidebar. Covered (the brief's own list):
 * lean render against a fixture profile with ConjugateFormCharacter Major;
 * L2' element ordering (Earth · Water · Air · Fire) with intensities off the
 * pole balance; the no-quaternion-dump DOM scan; profile-tick re-render; the
 * cross-link law (this surface and 5.1's bind the SAME profile field — both
 * read through `resonanceIndicatorFromProfile`); honest-pending rows when the
 * public tick withholds the pole.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { publishProfileTick } from '../composition/profileTickSubscription';
import { M4PersonalCoordinatePane } from './M4PersonalCoordinatePane';
import { resonanceIndicatorFromProfile } from './m4NaraResonance';
import {
    OPERATIVE_ELEMENT_ORDER,
    QUATERNION_DUMP_PATTERN,
    readElementalGlyphs
} from './m4PersonalCoordinate';

const CHAKRA_NAMES = [
    'Ground', 'Muladhara', 'Svadhisthana', 'Manipura',
    'Anahata', 'Vishuddha', 'Ajna', 'Sahasrara'
];
const MEDICINE_SNAPSHOT = {
    chakras: CHAKRA_NAMES.map((name, id) => ({
        id,
        name,
        dominantElementId: id === 0 ? null : ((id % 4) + 1),
        bodyZones: [`zone-${id}`]
    })),
    activeDecan: {
        sunDegree: 15,
        signIdx: 0,
        decanInSign: 1,
        decanIdx: 1,
        bodyPart: 'Head',
        rulingPlanet: 'Sun',
        rulingPlanetGlyph: '☉',
        activeChakraId: 3,
        herbs: [{ vernacular: 'Nettle', botanical: 'Urtica dioica' }]
    }
};

const POLE_PROFILE = {
    harmonicProfile: {
        degree360: 15,
        personalPole: {
            resonance: { score: 0.842, conjugateFormCharacter: 'Major' },
            elementalBalance: { earth: 0.1, water: 0.4, air: 0.2, fire: 0.3 },
            qPersonalHandle: { targetKind: 'q-personal', handle: 'protected://q/personal', privacy: 'protected-local-body' }
        }
    }
};

let generation = 400;

function mount(profile: unknown): void {
    generation += 1;
    publishProfileTick({
        generation,
        cachedAtMs: 0,
        stale: false,
        profile,
        connection: 'connected',
        readiness: null
    } as never);
    render(<M4PersonalCoordinatePane />);
}

afterEach(() => {
    setGateway(null);
    cleanup();
});

describe('m4PersonalCoordinate read law', () => {
    it('orders the quartet Earth · Water · Air · Fire — the L2 operative order', () => {
        expect(OPERATIVE_ELEMENT_ORDER.map(e => e.name)).toEqual(['Earth', 'Water', 'Air', 'Fire']);
        expect(OPERATIVE_ELEMENT_ORDER.map(e => e.elementId)).toEqual([1, 2, 3, 4]);
    });

    it('reads intensities off the pole balance and refuses a partial quartet', () => {
        const read = readElementalGlyphs(POLE_PROFILE);
        expect(read.state).toBe('resolved');
        if (read.state === 'resolved') {
            expect(read.glyphs.map(g => g.intensity)).toEqual([0.1, 0.4, 0.2, 0.3]);
        }
        const partial = {
            harmonicProfile: {
                personalPole: { elementalBalance: { earth: 0.5, water: 0.5, air: 0.5 } }
            }
        };
        expect(readElementalGlyphs(partial).state).toBe('pending');
        expect(readElementalGlyphs({ harmonicProfile: {} }).state).toBe('pending');
    });

    it('cross-link law: this surface and the 5.1 per-artifact surface bind ONE field', () => {
        // Both consume resonanceIndicatorFromProfile — same module, same
        // binding. The sidebar renders exactly what 5.1's indicator resolves.
        const indicator = resonanceIndicatorFromProfile(POLE_PROFILE);
        expect(indicator.state).toBe('resolved');
        expect(indicator.numeric).toBeCloseTo(0.842, 5);
        expect(indicator.conjugateFormCharacter).toBe('Major');
    });
});

describe('M4PersonalCoordinatePane', () => {
    it('renders the lean panel off a Major fixture with live medicine', async () => {
        const invoke = vi.fn().mockResolvedValue({ artifact: MEDICINE_SNAPSHOT });
        setGateway({ connected: true, invoke } as never);
        mount(POLE_PROFILE);

        const pane = screen.getByTestId('m4-personal-coordinate');
        expect(pane.getAttribute('data-resonance-state')).toBe('resolved');
        expect(screen.getByTestId('m4-pc-resonance-score').textContent).toBe('0.842');
        expect(screen.getByTestId('m4-pc-character').textContent).toBe('Major');

        // L2' order in the DOM, sized by intensity.
        const row = screen.getByTestId('m4-pc-elements');
        const rendered = Array.from(row.querySelectorAll('[data-element-id]')).map(node => ({
            id: node.getAttribute('data-element-id'),
            intensity: node.getAttribute('data-intensity')
        }));
        expect(rendered).toEqual([
            { id: '1', intensity: '0.100' },
            { id: '2', intensity: '0.400' },
            { id: '3', intensity: '0.200' },
            { id: '4', intensity: '0.300' }
        ]);

        // Live medicine chain: dominant chakra + sun-decan ruling planet.
        await waitFor(() =>
            expect(screen.getByTestId('m4-pc-medicine').getAttribute('data-state')).toBe('read')
        );
        expect(invoke).toHaveBeenCalledWith('nara.medicine.snapshot', { sunDegree: 15 });
        expect(screen.getByTestId('m4-pc-chakra').textContent).toBe('Manipura');
        expect(screen.getByTestId('m4-pc-planet').textContent).toContain('Sun');

        // UX §6.5 — no quaternion dump anywhere in the rendered DOM.
        expect(pane.textContent ?? '').not.toMatch(QUATERNION_DUMP_PATTERN);
    });

    it('re-renders on a profile-tick advance (principle 2)', async () => {
        const invoke = vi.fn().mockResolvedValue({ artifact: MEDICINE_SNAPSHOT });
        setGateway({ connected: true, invoke } as never);
        mount(POLE_PROFILE);
        const before = screen.getByTestId('m4-personal-coordinate').getAttribute('data-generation');

        generation += 1;
        publishProfileTick({
            generation,
            cachedAtMs: 0,
            stale: false,
            profile: {
                harmonicProfile: {
                    ...POLE_PROFILE.harmonicProfile,
                    personalPole: {
                        ...POLE_PROFILE.harmonicProfile.personalPole,
                        resonance: { score: 0.5, conjugateFormCharacter: 'Minor' }
                    }
                }
            },
            connection: 'connected',
            readiness: null
        } as never);

        await waitFor(() =>
            expect(screen.getByTestId('m4-pc-character').textContent).toBe('Minor')
        );
        expect(
            screen.getByTestId('m4-personal-coordinate').getAttribute('data-generation')
        ).not.toBe(before);
    });

    it('renders honest-pending rows when the public tick withholds the pole', () => {
        setGateway(null);
        mount({ harmonicProfile: { degree360: 100 } });
        expect(screen.getByTestId('m4-pc-resonance-pending')).toBeTruthy();
        expect(screen.getByTestId('m4-pc-elements-pending').textContent).toContain('personalPole');
        expect(screen.getByTestId('m4-pc-medicine').getAttribute('data-state')).toBe('pending');
    });
});
