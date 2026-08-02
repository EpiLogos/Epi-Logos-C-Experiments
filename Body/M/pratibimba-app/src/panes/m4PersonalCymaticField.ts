/**
 * Coordinate: M' M4-5' (personal cymatic field read — Track 25.T25.6)
 * Residency: Body/M/pratibimba-app/src/panes/m4PersonalCymaticField.ts
 * Actualises: the fail-closed read of the `nara.field.handle` reply (the
 *   OPAQUE DR-IG-6 renderer handle — 25.T25.6's gateway arm over portal-core
 *   `build_psychoid_cymatic_renderer_handle`) and the scene the widget body
 *   draws from it: the CARRIER-FIXTURE dipyramid (engine/dipyramidGeometry —
 *   this widget is its first consumer, closing the "zero consumers" gap its
 *   own header records) plus two Hopf-linked tori winding the apex axis,
 *   phased by the handle's tick12. DR-M4-3 strict invariant: the handle is
 *   opaque — nothing here decodes it, and no `q_*` body ever enters.
 * Public surface: FIELD_HANDLE_METHOD, PsychoidFieldHandle, FieldHandleRead,
 *   parseFieldHandle, buildCymaticScene, projectVertex, CymaticScene.
 * Does NOT own: the handle law (portal-core psychoid_cymatic), the dipyramid
 *   fixture (engine/dipyramidGeometry), or the time-axis vocabulary (25.17).
 */

import { buildDipyramid6Plus6, type DipyramidVertex } from '../engine/dipyramidGeometry';

export const FIELD_HANDLE_METHOD = 'nara.field.handle';
const CONTRACT_VERSION = 'psychoid-cymatic.handle.v1';
const GEOMETRY_LAW = 'DR-IG-6';

export interface PsychoidFieldHandle {
    readonly rendererHandle: string;
    readonly geometryHandle: string;
    readonly solverStrategy: string;
    readonly privacyClass: string;
    readonly tick: number;
    readonly tick12: number;
    readonly audioBusDigest: string;
    readonly nodalDigest: string;
    readonly sessionKey: string;
    readonly foregroundedHandle: string | null;
}

export type FieldHandleRead =
    | { readonly kind: 'read'; readonly handle: PsychoidFieldHandle }
    | { readonly kind: 'refused'; readonly reason: string };

function str(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Fail-closed parse. A reply under the wrong contract version or geometry
 * law is REFUSED — drawing DR-IG-6 geometry against a handle minted under
 * some other law would claim a coherence nothing proved.
 */
export function parseFieldHandle(artifact: unknown): FieldHandleRead {
    if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
        return { kind: 'refused', reason: 'field handle reply is not an object' };
    }
    const record = artifact as Record<string, unknown>;
    if (record.contractVersion !== CONTRACT_VERSION) {
        return { kind: 'refused', reason: `contractVersion is not ${CONTRACT_VERSION}` };
    }
    if (record.geometryLaw !== GEOMETRY_LAW) {
        return { kind: 'refused', reason: `geometryLaw is not ${GEOMETRY_LAW}` };
    }
    const rendererHandle = str(record.rendererHandle);
    const geometryHandle = str(record.geometryHandle);
    const solverStrategy = str(record.solverStrategy);
    const privacyClass = str(record.privacyClass);
    const audioBusDigest = str(record.audioBusDigest);
    const nodalDigest = str(record.nodalDigest);
    const sessionKey = str(record.sessionKey);
    const tick = record.tick;
    const tick12 = record.tick12;
    const foreground = record.foregroundedHandle;
    if (
        rendererHandle === null ||
        !rendererHandle.startsWith('psychoid-cymatic://renderer/dr-ig-6/') ||
        geometryHandle === null ||
        !geometryHandle.startsWith('psychoid-cymatic://geometry/dr-ig-6/') ||
        solverStrategy === null ||
        privacyClass !== 'protected-local-handle-only' ||
        audioBusDigest === null ||
        nodalDigest === null ||
        sessionKey === null ||
        typeof tick !== 'number' ||
        typeof tick12 !== 'number' ||
        !(foreground === null || foreground === undefined || typeof foreground === 'string')
    ) {
        return { kind: 'refused', reason: 'field handle reply is mis-shaped — refusing to draw' };
    }
    return {
        kind: 'read',
        handle: Object.freeze({
            rendererHandle,
            geometryHandle,
            solverStrategy,
            privacyClass,
            tick,
            tick12,
            audioBusDigest,
            nodalDigest,
            sessionKey,
            foregroundedHandle: typeof foreground === 'string' ? foreground : null
        })
    };
}

export interface CymaticTorus {
    readonly id: 'day' | 'night';
    /** Projected 2D polyline (closed). */
    readonly points: readonly (readonly [number, number])[];
    readonly windsApexAxis: true;
}

export interface CymaticScene {
    /** All 12 DR-IG-6 vertices, straight from the carrier fixture. */
    readonly nodes: readonly DipyramidVertex[];
    readonly tori: readonly CymaticTorus[];
    /** The handle phase the tori are wound at (tick12 of the reply). */
    readonly phase: number;
}

/** Simple fixed isometric projection for the canvas draw. */
export function projectVertex(position: readonly [number, number, number]): readonly [number, number] {
    const [x, y, z] = position;
    return [x - z * 0.5, -y + (x + z) * 0.25];
}

const TORUS_SEGMENTS = 72;
const TORUS_MAJOR = 0.95;
const TORUS_MINOR = 0.3;

/**
 * The scene: 12 fixture vertices + two Hopf-linked tori winding the apex
 * (pole-to-pole) axis, phase-offset by the handle's tick12. The two loops
 * lie in transverse planes through the shared axis — interlocked by
 * construction, which is the "at least two interlocking tori" DR-IG-6 test.
 */
export function buildCymaticScene(handle: PsychoidFieldHandle): CymaticScene {
    const phase = ((handle.tick12 % 12) + 12) % 12;
    const phi = (phase / 12) * Math.PI * 2;
    const torus = (id: 'day' | 'night', offset: number): CymaticTorus => {
        const points: (readonly [number, number])[] = [];
        for (let i = 0; i <= TORUS_SEGMENTS; i += 1) {
            const theta = (i / TORUS_SEGMENTS) * Math.PI * 2;
            // A loop through the apex axis: major circle in a vertical plane
            // rotated `offset` about the axis, minor winding phased by phi.
            const r = TORUS_MAJOR + TORUS_MINOR * Math.cos(3 * theta + phi + offset);
            const x = r * Math.cos(theta) * Math.cos(offset);
            const z = r * Math.cos(theta) * Math.sin(offset);
            const y = r * Math.sin(theta) * 0.9;
            points.push(projectVertex([x, y, z]));
        }
        return Object.freeze({ id, points: Object.freeze(points), windsApexAxis: true as const });
    };
    return Object.freeze({
        nodes: buildDipyramid6Plus6(),
        tori: Object.freeze([torus('day', 0), torus('night', Math.PI / 2)]),
        phase
    });
}
