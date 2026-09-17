/**
 * Coordinate: M' M1' (played-torus scene-graph law — Track 02.T2.6)
 * Actualises: the tranche's render-test + boundary audit as headless
 *   behavioral tests over the pure three.js graph — K² proportions are the
 *   ratified derivation (R/r = 16/9, R + r = 1), the ONLY tori are the single
 *   K² and its SU(2) shadow sheet (no T²_Mahāmāyā — M3-5 territory), the
 *   orientation IS the kernel ring quaternion, and the luminous cell sits on
 *   the torus surface at the bus-declared address with the Cl(4,2) halo.
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { buildPlayedTorusView, K2_MAJOR_RADIUS, K2_MINOR_RADIUS } from './m1PlayedTorus';
import {
    buildPlayedTorusScene,
    CL42_INDIGO,
    CL42_WARM,
    K2_SCALE,
    updatePlayedTorusScene
} from './playedTorusScene';

const VORTEX = {
    activeMatrixOp: 'pratibimba',
    activeCell: [7, 5],
    activeCellValue: {
        family: 'pratibimba',
        rowK: 7,
        positionP: 5,
        rawValue: 36,
        rawBimba: 35,
        rawPratibimba: 36,
        rawSum: 71,
        rawDelta: 1,
        drValue: 9,
        drBimba: 8,
        drPratibimba: 9,
        drSum: 8,
        ruleValue: null,
        skeletonEvent: 'Hit36'
    },
    drRingPhase: { mahamayaIdx: 2, parashaktiIdx: 6 },
    cl42SignatureAtPosition: -1,
    ringQuaternion: [0.5, -0.8660254, 0, 0],
    helixSheet: 1,
    kleinFlipAtThisTick: false
};

function readyView(overrides: Record<string, unknown> = {}) {
    return buildPlayedTorusView({
        payload: { anandaVortex: { ...VORTEX, ...overrides } },
        generation: 1
    });
}

function torusGeometries(root: THREE.Group): THREE.TorusGeometry[] {
    const found: THREE.TorusGeometry[] = [];
    root.traverse(obj => {
        const geometry = (obj as THREE.Mesh).geometry;
        if (geometry && geometry.type === 'TorusGeometry') {
            found.push(geometry as THREE.TorusGeometry);
        }
    });
    return found;
}

describe('m1 played-torus scene graph (T2.6)', () => {
    it('renders a single K² + its SU(2) shadow — exactly two tori, no T²_Mahāmāyā primitive', () => {
        const { root } = buildPlayedTorusScene();
        const tori = torusGeometries(root);
        expect(tori).toHaveLength(2);
        for (const torus of tori) {
            const { radius, tube } = torus.parameters;
            // R/r = 16/9 with R + r = 1 (× world scale) — the 64 + 36 identity
            expect(radius / tube).toBeCloseTo(16 / 9, 6);
            expect(radius + tube).toBeCloseTo(K2_SCALE, 6);
            expect(radius).toBeCloseTo(K2_SCALE * K2_MAJOR_RADIUS, 6);
            expect(tube).toBeCloseTo(K2_SCALE * K2_MINOR_RADIUS, 6);
        }
    });

    it('the Hopf shadow sheet is the 30%-opacity concentric second sheet', () => {
        const { hopfShadow } = buildPlayedTorusScene();
        const material = hopfShadow.material as THREE.MeshStandardMaterial;
        expect(material.transparent).toBe(true);
        expect(material.opacity).toBeCloseTo(0.3, 6);
        expect(hopfShadow.name).toBe('m1-hopf-shadow-sheet');
    });

    it('the diamond still-point octahedron sits at the torus centre', () => {
        const { diamond } = buildPlayedTorusScene();
        expect(diamond.geometry.type).toBe('OctahedronGeometry');
        expect(diamond.position.length()).toBe(0);
    });

    it('blocked (pending-ananda-vortex): no luminous cell, shell greys — no fallback animation state', () => {
        const parts = buildPlayedTorusScene();
        const blocked = buildPlayedTorusView({ payload: {}, generation: 1 });
        updatePlayedTorusScene(parts, blocked);
        expect(parts.activeCell.visible).toBe(false);
        expect(parts.root.quaternion.equals(new THREE.Quaternion())).toBe(true);
    });

    it('K² orientation IS the kernel ring quaternion ([w,x,y,z] → THREE (x,y,z,w))', () => {
        const parts = buildPlayedTorusScene();
        updatePlayedTorusScene(parts, readyView());
        const q = parts.root.quaternion;
        expect(q.x).toBeCloseTo(-0.8660254, 6);
        expect(q.y).toBeCloseTo(0, 6);
        expect(q.z).toBeCloseTo(0, 6);
        expect(q.w).toBeCloseTo(0.5, 6);
    });

    it('the luminous cell sits ON the K² surface at the bus-declared address', () => {
        const parts = buildPlayedTorusScene();
        updatePlayedTorusScene(parts, readyView());
        expect(parts.activeCell.visible).toBe(true);
        const p = parts.activeCell.position;
        const R = K2_SCALE * K2_MAJOR_RADIUS;
        const r = K2_SCALE * K2_MINOR_RADIUS;
        const ringDistance = Math.sqrt(
            (Math.sqrt(p.x * p.x + p.y * p.y) - R) ** 2 + p.z * p.z
        );
        expect(ringDistance).toBeCloseTo(r, 6);
    });

    it('Cl(4,2) halo colour-binary: implicate −1 indigo, explicate +1 warm', () => {
        const parts = buildPlayedTorusScene();
        updatePlayedTorusScene(parts, readyView({ cl42SignatureAtPosition: -1 }));
        expect((parts.activeCell.material as THREE.MeshStandardMaterial).color.getHex()).toBe(
            CL42_INDIGO
        );
        updatePlayedTorusScene(parts, readyView({ cl42SignatureAtPosition: 1 }));
        expect((parts.activeCell.material as THREE.MeshStandardMaterial).color.getHex()).toBe(
            CL42_WARM
        );
    });

    it('helix sheet 1 phase-shifts the shadow; the klein flip interpenetrates the sheets', () => {
        const parts = buildPlayedTorusScene();
        updatePlayedTorusScene(parts, readyView({ helixSheet: 1 }));
        expect(parts.hopfShadow.rotation.z).toBeCloseTo(Math.PI, 6);
        updatePlayedTorusScene(parts, readyView({ helixSheet: 0 }));
        expect(parts.hopfShadow.rotation.z).toBeCloseTo(0, 6);
        updatePlayedTorusScene(parts, readyView({ kleinFlipAtThisTick: true }));
        expect(parts.hopfShadow.scale.x).toBeLessThan(1);
    });
});
