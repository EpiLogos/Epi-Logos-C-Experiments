/**
 * Coordinate: M' M1' (played-torus scene graph — Track 02.T2.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the pure three.js scene graph of the M1 played-torus — the
 *   single K² (R/r = 16/9, R + r = 1 — the 64 + 36 identity), its SU(2)
 *   Hopf-shadow second sheet at 30% opacity (the SAME K², phase-shifted —
 *   never a second world-torus), the diamond octahedron still-point at
 *   centre, and the luminous ananda active-cell with its Cl(4,2) halo
 *   colour-binary (indigo for implicate −1, warm for explicate +1). All
 *   dynamic state (orientation quaternion, cell address, halo signature,
 *   helix sheet, klein flip) arrives via the view model off the profile bus
 *   — nothing here derives from local LUTs. Pure construction: no renderer,
 *   no DOM — the Pane owns mounting; tests assert the graph headlessly.
 *   Visual law: M1-2-ANANDA-VORTEX-ARCHITECTURE §5 (K² mesh · placement ·
 *   Cl(4,2) colour-binary · Hopf second sheet · diamond §5.6).
 * Does NOT own: WebGL mounting (PlayedTorusPane), tick choreography beyond
 *   per-generation state application (Tranche 15.9), the six-perspex heatmap
 *   + DR streamlines (Tranche 15.8), the M3-5 double torus (boundary).
 */

import * as THREE from 'three';
import {
    K2_MAJOR_RADIUS,
    K2_MINOR_RADIUS,
    PlayedTorusViewModel
} from './m1PlayedTorus';

/** One free framing choice — world scale of the unit-proportioned K². */
export const K2_SCALE = 1.8;

/** Cl(4,2) colour-binary (§5.4): implicate generator poles P0/P5 (signature
 *  −1) cool indigo; explicate derived positions P1–P4 (signature +1) warm. */
export const CL42_INDIGO = 0x4b0082;
export const CL42_WARM = 0xff7f2a;
const BLOCKED_GREY = 0x5a5a63;
const K2_SHELL = 0x8fb7d6;
const DIAMOND_COLOUR = 0xdfe7ef;

export interface PlayedTorusSceneParts {
    readonly root: THREE.Group;
    readonly k2: THREE.Mesh;
    readonly hopfShadow: THREE.Mesh;
    readonly diamond: THREE.Mesh;
    readonly activeCell: THREE.Mesh;
}

function k2Geometry(): THREE.TorusGeometry {
    return new THREE.TorusGeometry(
        K2_SCALE * K2_MAJOR_RADIUS,
        K2_SCALE * K2_MINOR_RADIUS,
        72,
        144
    );
}

/** Torus-surface point for a 12×12 matrix address: U (chromatic longitude φ)
 *  from the column/position, V (fifths meridian θ) from the row (§5.2). */
function cellSurfacePoint(rowK: number, positionP: number): THREE.Vector3 {
    const phi = (positionP / 12) * Math.PI * 2;
    const theta = (rowK / 12) * Math.PI * 2;
    const R = K2_SCALE * K2_MAJOR_RADIUS;
    const r = K2_SCALE * K2_MINOR_RADIUS;
    return new THREE.Vector3(
        (R + r * Math.cos(theta)) * Math.cos(phi),
        (R + r * Math.cos(theta)) * Math.sin(phi),
        r * Math.sin(theta)
    );
}

/** Build the static scene graph. Dynamic state applies via
 *  `updatePlayedTorusScene` — construction is state-free. */
export function buildPlayedTorusScene(): PlayedTorusSceneParts {
    const root = new THREE.Group();
    root.name = 'm1-played-torus-root';

    const k2 = new THREE.Mesh(
        k2Geometry(),
        new THREE.MeshStandardMaterial({
            color: K2_SHELL,
            roughness: 0.55,
            metalness: 0.15
        })
    );
    k2.name = 'm1-k2-torus';
    root.add(k2);

    // The SU(2) second sheet (§5.5): the SAME K², concentric, 30% opacity.
    // hopf_fiber(degree720) selects the sheet; a second WORLD torus (the
    // K² × T²_Mahāmāyā) is M3-5 territory and must never appear here.
    const hopfShadow = new THREE.Mesh(
        k2Geometry(),
        new THREE.MeshStandardMaterial({
            color: K2_SHELL,
            transparent: true,
            opacity: 0.3,
            roughness: 0.8,
            metalness: 0.0,
            depthWrite: false
        })
    );
    hopfShadow.name = 'm1-hopf-shadow-sheet';
    hopfShadow.scale.setScalar(1.02);
    root.add(hopfShadow);

    // Diamond at centre (§5.6): 6 vertices = 6 QL positions; the matheme's
    // still-point — it never tick-jumps (choreography beyond this is 15.9).
    const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(K2_SCALE * 0.14),
        new THREE.MeshStandardMaterial({
            color: DIAMOND_COLOUR,
            roughness: 0.2,
            metalness: 0.6
        })
    );
    diamond.name = 'm1-diamond-centre';
    root.add(diamond);

    // The luminous ananda cell — visible only when the bus carries the vortex.
    const activeCell = new THREE.Mesh(
        new THREE.SphereGeometry(K2_SCALE * 0.055, 16, 16),
        new THREE.MeshStandardMaterial({
            color: CL42_WARM,
            emissive: CL42_WARM,
            emissiveIntensity: 1.2
        })
    );
    activeCell.name = 'm1-ananda-active-cell';
    activeCell.visible = false;
    root.add(activeCell);

    return { root, k2, hopfShadow, diamond, activeCell };
}

/** Apply one generation's view-model state to the scene graph. Every input
 *  is a kernel/Vimarśa write carried on the bus; pending state renders the
 *  blocked overlay (grey shell, no cell) — no local fallback animation. */
export function updatePlayedTorusScene(
    parts: PlayedTorusSceneParts,
    view: PlayedTorusViewModel
): void {
    const k2Material = parts.k2.material as THREE.MeshStandardMaterial;
    const cellMaterial = parts.activeCell.material as THREE.MeshStandardMaterial;
    const vortex = view.vortex;

    if (!vortex) {
        k2Material.color.setHex(BLOCKED_GREY);
        parts.activeCell.visible = false;
        return;
    }

    k2Material.color.setHex(K2_SHELL);

    // K² orientation IS the kernel's ring quaternion (substrate order
    // [w, x, y, z] per RING_QUATERNION_LUT → THREE's (x, y, z, w)).
    const q = vortex.ringQuaternion;
    parts.root.quaternion.set(q[1], q[2], q[3], q[0]);

    // Luminous dual-register cell at the bus-declared address.
    const [rowK, positionP] = vortex.activeCell;
    parts.activeCell.position.copy(cellSurfacePoint(rowK, positionP));
    parts.activeCell.visible = true;

    // Cl(4,2) halo colour-binary off the bus signature (§5.4).
    const halo = vortex.cl42SignatureAtPosition < 0 ? CL42_INDIGO : CL42_WARM;
    cellMaterial.color.setHex(halo);
    cellMaterial.emissive.setHex(halo);

    // Hopf second sheet phase (§5.5): sheet 1 is the shadow phase-shifted by
    // half a meridian turn; the klein flip briefly interpenetrates the sheets.
    parts.hopfShadow.rotation.z = vortex.helixSheet === 1 ? Math.PI : 0;
    parts.hopfShadow.scale.setScalar(vortex.kleinFlipAtThisTick ? 0.98 : 1.02);
}
