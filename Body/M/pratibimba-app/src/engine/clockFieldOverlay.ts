/**
 * Coordinate: M' M3' (clock-field aspect + hop-edge overlay — Track 04.T4.3)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: the cross-clock angular relations (conjunction/sextile/square/
 *   trine/opposition) and the 384 line-change hop edge as a renderer overlay
 *   on the cosmic clock plane. The aspect law is a VERBATIM PORT of the C
 *   kernel `m2_aspect_between` (m2.c: MAJOR_ASPECT_ANGLE {0,60,90,120,180},
 *   MAJOR_ASPECT_ORB {10,6,8,8,10}, tightest match wins) over the BUSSED
 *   planet degrees — one law, both sides of the wire; never a local
 *   astrology table. The hop edge applies the line-change involution
 *   (target = hexagram ⊕ (1 << line)) to the BUSSED hexagram/line — the same
 *   XOR law the oracle four-faces carrier already renders. Absent bus fields
 *   → empty overlay (pending), never fabricated edges. The codon wheel
 *   perturbation IS the per-generation update (tick advance = new state).
 * Does NOT own: the aspect LUTs (epi-lib m2), the line-change graph substrate
 *   (m3_clock_lut.c), the wheel geometry (CosmicEngine), or the element law —
 *   each edge's elemental reading comes from `canonicalElement.ts` ([[L2']]
 *   canon, DR-L2-ASPECT-1), computed from the bussed degrees, never a per-aspect
 *   element table.
 */

import * as THREE from 'three';
import { elementalRelationBetweenDegrees, type AspectElements } from './canonicalElement';

/** Verbatim port of the C aspect law (m2.h:572-577 / m2.c:17-19). */
export const ASPECT_KINDS = ['conjunction', 'sextile', 'square', 'trine', 'opposition'] as const;
export type AspectKind = (typeof ASPECT_KINDS)[number];
const MAJOR_ASPECT_ANGLE: readonly number[] = [0, 60, 90, 120, 180];
const MAJOR_ASPECT_ORB: readonly number[] = [10, 6, 8, 8, 10];

export interface AspectEdge {
    readonly a: number;
    readonly b: number;
    readonly degreeA: number;
    readonly degreeB: number;
    readonly kind: AspectKind;
    readonly orb: number;
    /**
     * The edge's elemental reading — the canonical [[L2']] element at each end and
     * the relation between them, per DR-L2-ASPECT-1. The elements come from the
     * actual bussed degrees through the M2-3 triplicity identity, never from a
     * per-aspect-kind table: an aspect carries a relation, not an element.
     * Null only when a degree is not a finite position.
     */
    readonly elements: AspectElements | null;
}

export interface HopEdge {
    readonly fromHexagram: number;
    readonly toHexagram: number;
    readonly line: number;
    readonly lineChangeAddress: number;
}

export interface ClockFieldOverlayState {
    readonly aspectEdges: readonly AspectEdge[];
    readonly hopEdge: HopEdge | null;
    /** generation marker so tick advance provably perturbs the overlay */
    readonly tick12: number | null;
}

/** Port of `m2_aspect_between` — tightest matching major aspect or null. */
export function aspectBetween(
    degreeA: number,
    degreeB: number
): { kind: AspectKind; orb: number } | null {
    let diff = Math.abs(degreeA - degreeB) % 360;
    if (diff > 180) {
        diff = 360 - diff;
    }
    let best: { kind: AspectKind; orb: number } | null = null;
    for (let i = 0; i < MAJOR_ASPECT_ANGLE.length; i++) {
        const deviation = Math.abs(diff - MAJOR_ASPECT_ANGLE[i]);
        if (deviation <= MAJOR_ASPECT_ORB[i] && (best === null || deviation < best.orb)) {
            best = { kind: ASPECT_KINDS[i], orb: deviation };
        }
    }
    return best;
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function profileRoot(payload: Readonly<Record<string, unknown>>): Record<string, unknown> {
    return objectValue(payload.harmonicProfile) ?? (payload as Record<string, unknown>);
}

/** Build the overlay state from ONE bus payload: aspect edges between the
 *  bussed planet degrees; the hop edge from the bussed hexagram/line. */
export function buildClockFieldOverlayState(
    payload: Readonly<Record<string, unknown>>
): ClockFieldOverlayState {
    const root = profileRoot(payload);
    const degreesRaw = Array.isArray(root.planetDegrees) ? root.planetDegrees : null;
    const degrees =
        degreesRaw && degreesRaw.every(d => typeof d === 'number' && Number.isFinite(d))
            ? (degreesRaw as number[])
            : null;

    const aspectEdges: AspectEdge[] = [];
    if (degrees) {
        for (let a = 0; a < degrees.length; a++) {
            for (let b = a + 1; b < degrees.length; b++) {
                const aspect = aspectBetween(degrees[a], degrees[b]);
                if (aspect) {
                    aspectEdges.push({
                        a,
                        b,
                        degreeA: degrees[a],
                        degreeB: degrees[b],
                        kind: aspect.kind,
                        orb: aspect.orb,
                        elements: elementalRelationBetweenDegrees(degrees[a], degrees[b])
                    });
                }
            }
        }
    }

    const mahamaya = objectValue(root.mahamaya) ?? objectValue(root.binary);
    let hopEdge: HopEdge | null = null;
    if (mahamaya) {
        const hexagram = mahamaya.hexagramId;
        const line = mahamaya.lineIndex;
        const address = mahamaya.lineChangeOperatorAddress;
        if (
            typeof hexagram === 'number' &&
            typeof line === 'number' &&
            typeof address === 'number' &&
            line >= 0 &&
            line < 6
        ) {
            hopEdge = {
                fromHexagram: hexagram & 0x3f,
                // the line-change involution — same XOR law as the oracle
                // temporal face (primary ^ changing); pure arithmetic on
                // bussed values, target codon identity stays kernel-owned
                toHexagram: (hexagram ^ (1 << line)) & 0x3f,
                line,
                lineChangeAddress: address
            };
        }
    }

    const tick12 = typeof root.tick12 === 'number' ? root.tick12 : null;
    return Object.freeze({ aspectEdges, hopEdge, tick12 });
}

const ASPECT_COLOURS: Readonly<Record<AspectKind, number>> = {
    conjunction: 0xf5e6a8,
    sextile: 0x9fd6a8,
    square: 0xd08f8f,
    trine: 0x8fb7d6,
    opposition: 0xc9a8e6
};

export interface ClockFieldOverlayParts {
    readonly group: THREE.Group;
}

function degreePoint(degree: number, radius: number): THREE.Vector3 {
    const angle = (degree / 360) * Math.PI * 2;
    return new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0);
}

/** Build the (initially empty) overlay group for the clock plane. */
export function buildClockFieldOverlay(): ClockFieldOverlayParts {
    const group = new THREE.Group();
    group.name = 'm3-clock-field-overlay';
    return { group };
}

/** Re-draw the overlay for one generation's state (tick advance perturbs). */
export function updateClockFieldOverlay(
    parts: ClockFieldOverlayParts,
    state: ClockFieldOverlayState,
    radius: number
): void {
    // dispose + rebuild the light line set (small N; per-generation cadence)
    for (const child of [...parts.group.children]) {
        parts.group.remove(child);
        const line = child as THREE.Line;
        line.geometry?.dispose();
        (line.material as THREE.Material | undefined)?.dispose?.();
    }
    for (const edge of state.aspectEdges) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            degreePoint(edge.degreeA, radius),
            degreePoint(edge.degreeB, radius)
        ]);
        const line = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
                color: ASPECT_COLOURS[edge.kind],
                transparent: true,
                opacity: 0.45
            })
        );
        line.name = `m3-aspect-edge-${edge.kind}`;
        parts.group.add(line);
    }
    if (state.hopEdge) {
        const from = (state.hopEdge.fromHexagram / 64) * 360;
        const to = (state.hopEdge.toHexagram / 64) * 360;
        const geometry = new THREE.BufferGeometry().setFromPoints([
            degreePoint(from, radius * 0.82),
            degreePoint(to, radius * 0.82)
        ]);
        const line = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
        );
        line.name = 'm3-hop-edge';
        parts.group.add(line);
    }
}
