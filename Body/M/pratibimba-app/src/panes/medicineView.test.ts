import { describe, expect, it } from 'vitest';
import { medicineSunDegree, parseMedicineSnapshot } from './medicineView';

const snapshot = {
    chakras: Array.from({ length: 8 }, (_, id) => ({
        id,
        name: `chakra-${id}`,
        dominantElementId: id > 0 && id < 5 ? id : null,
        bodyZones: [`zone-${id}`]
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

describe('Medicine gateway projection', () => {
    it('strictly accepts the eight-row snapshot and preserves botanical evidence', () => {
        const parsed = parseMedicineSnapshot(snapshot);
        expect(parsed.chakras).toHaveLength(8);
        expect(parsed.activeDecan.herbs[0]).toEqual({
            vernacular: 'Nettle',
            botanical: 'Urtica dioica'
        });
    });

    it('refuses incomplete chakra projections', () => {
        expect(() => parseMedicineSnapshot({ ...snapshot, chakras: snapshot.chakras.slice(0, 7) }))
            .toThrow('exactly eight');
    });

    it('reads the Sun from the same live profile payload as the cosmic engine', () => {
        expect(medicineSunDegree({ harmonicProfile: { planetDegrees: [375, 20] } })).toBe(15);
        expect(medicineSunDegree({ harmonicProfile: { degree360: 42 } })).toBe(42);
    });
});
