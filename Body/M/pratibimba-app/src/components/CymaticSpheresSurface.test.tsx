import { describe, expect, it } from 'vitest';
import {
    buildCymaticSpheresScene,
    parseCymaticSpheresProjection
} from './CymaticSpheresSurface';

const projection = {
    chakras: Array.from({ length: 8 }, (_, chakraId) => ({
        chakraId,
        name: chakraId === 0 ? 'Earth/Ground' : `chakra-${chakraId}`,
        elementId: chakraId === 0 || chakraId > 5 ? null : chakraId % 5,
        tattvaIndex: chakraId > 0 && chakraId < 6 ? 36 - chakraId : null,
        meaningId: 0x0380 + chakraId,
        harmonic: {
            degree: 2 + (chakraId % 2),
            order: 1,
            amplitudeHz: 144 + chakraId * 12,
            qlPosition: chakraId % 2 === 0 ? 0 : 5,
            helix: chakraId % 2 === 0 ? 'bimba' : 'pratibimba'
        },
        provenance: 'M2_CHAKRA_LUT[8] + profile audioOctet/nodalQuartet'
    })),
    earthObserver: {
        ordinal: 10,
        name: 'Earth',
        role: 'observer-centre',
        position: [0, 0, 0],
        provenance: 'EarthBodyState + DR-M2-1/DCC-03'
    },
    sun: {
        planetId: 0,
        name: 'Sun',
        degree: 15,
        retrograde: false,
        elementId: 2,
        provenance: 'M2_PLANET_LUT[10] + Kerykeion live sky'
    },
    activePlanet: {
        planetId: 4,
        name: 'Mars',
        degree: 95,
        retrograde: false,
        elementId: 2,
        provenance: 'M2_PLANET_LUT[10] + Kerykeion live sky'
    },
    epogdoonRatio: '9:8',
    provenance: 'portal-core::f_routing + M2 substrate projection'
};

describe('CymaticSpheresSurface projection and scene', () => {
    it('strictly parses the typed profile path and builds eight deformed sphere meshes', () => {
        const parsed = parseCymaticSpheresProjection({
            harmonicProfile: { cymaticSpheres: projection }
        });
        expect(parsed).not.toBeNull();
        const scene = buildCymaticSpheresScene(parsed!);
        const spheres = scene.children
            .flatMap(child => child.children)
            .filter(child => child.name.startsWith('chakra-sphere-'));
        expect(spheres).toHaveLength(8);
        expect(scene.getObjectByName('earth-observer-centre')?.position.toArray()).toEqual([
            0, 0, 0
        ]);
        expect(scene.getObjectByName('sun-anchor')).toBeTruthy();
        expect(scene.getObjectByName('active-planet-4')?.userData.planetId).toBe(4);
    });

    it('rejects a malformed chakra row instead of fabricating a scene', () => {
        const malformed = {
            ...projection,
            chakras: projection.chakras.map((chakra, index) =>
                index === 3 ? { ...chakra, chakraId: 7 } : chakra
            )
        };
        expect(
            parseCymaticSpheresProjection({
                harmonicProfile: { cymaticSpheres: malformed }
            })
        ).toBeNull();
    });
});
