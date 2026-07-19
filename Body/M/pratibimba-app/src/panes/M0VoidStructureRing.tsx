/**
 * Coordinate: M' M0' #0-4 (16-fold Void-Structure ring)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier Holographic Matrix projection
 * Actualises: the kernel m0_void_structure_ring payload as a 240px SVG ring.
 * Public surface: M0VoidLens, M0VoidStructureProjection,
 *   m0VoidStructureFromProfile, M0VoidStructureRing.
 * Does NOT own: lens labels, coordinates, provenance, or another profile store.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.15.
 */

import type { KeyboardEvent } from 'react';
import type { KernelBridgeCachedProfile } from '../bridge/types';

export type M0VoidLensState = 'canonical' | 'canonical_absent' | 'blocked';

export interface M0VoidLens {
    readonly lensIndex: number;
    readonly coordinate: string;
    readonly label: string;
    readonly state: M0VoidLensState;
}

export interface M0VoidStructureProjection {
    readonly lenses: readonly M0VoidLens[];
    readonly state: M0VoidLensState;
}

interface M0VoidStructureRingProps {
    readonly projection: M0VoidStructureProjection;
    readonly onLensClick: (lens: M0VoidLens) => void;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 108;
const INNER_RADIUS = 68;
const ARC_DEGREES = 22.5;
const ARC_GAP_DEGREES = 0.8;
const STATES = new Set<M0VoidLensState>([
    'canonical',
    'canonical_absent',
    'blocked'
]);

function record(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function harmonicProfile(cached: KernelBridgeCachedProfile | null): Record<string, unknown> | null {
    const root = record(cached?.profile);
    const payload = record(root?.payload);
    return record(root?.harmonicProfile) ?? record(payload?.harmonicProfile) ?? payload ?? root;
}

export function m0VoidStructureFromProfile(
    cached: KernelBridgeCachedProfile | null
): M0VoidStructureProjection | null {
    const raw = harmonicProfile(cached)?.m0_void_structure_ring;
    if (!Array.isArray(raw) || raw.length !== 16) {
        return null;
    }

    const lenses: M0VoidLens[] = [];
    for (let index = 0; index < raw.length; index += 1) {
        const row = record(raw[index]);
        const state = row?.state;
        if (
            row?.lensIndex !== index ||
            row.coordinate !== `#0-4-${index}` ||
            typeof row.label !== 'string' ||
            row.label.trim().length === 0 ||
            typeof state !== 'string' ||
            !STATES.has(state as M0VoidLensState)
        ) {
            return null;
        }
        lenses.push(Object.freeze({
            lensIndex: index,
            coordinate: row.coordinate,
            label: row.label.trim(),
            state: state as M0VoidLensState
        }));
    }

    const state: M0VoidLensState = lenses.some(lens => lens.state === 'blocked')
        ? 'blocked'
        : lenses.some(lens => lens.state === 'canonical_absent')
            ? 'canonical_absent'
            : 'canonical';
    return Object.freeze({
        lenses: Object.freeze(lenses),
        state
    });
}

export function M0VoidStructureRing({
    projection,
    onLensClick
}: M0VoidStructureRingProps) {
    return (
        <section
            className="m0-void-structure-ring"
            data-testid="m0-void-structure-ring"
            data-state={projection.state}
            aria-label="16-Fold Void-Structure ring"
        >
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label="16-Fold Void-Structure sacred-circle divisions"
            >
                <circle
                    className="m0-void-structure-ring-track"
                    cx={CENTER}
                    cy={CENTER}
                    r={(OUTER_RADIUS + INNER_RADIUS) / 2}
                />
                {projection.lenses.map(lens => {
                    const activate = () => onLensClick(lens);
                    const onKeyDown = (event: KeyboardEvent<SVGPathElement>) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            activate();
                        }
                    };
                    return (
                        <g
                            key={lens.coordinate}
                            className={`m0-void-structure-axis m0-void-structure-axis-${lens.lensIndex % 8}`}
                            data-conjugation-axis={lens.lensIndex % 8}
                        >
                            <path
                                className="m0-void-structure-arc"
                                d={arcPath(lens.lensIndex)}
                                role="button"
                                tabIndex={0}
                                aria-label={`${lens.coordinate} ${lens.label} provenance ${lens.state}`}
                                data-lens-coordinate={lens.coordinate}
                                data-provenance-state={lens.state}
                                onClick={activate}
                                onKeyDown={onKeyDown}
                            />
                        </g>
                    );
                })}
            </svg>
        </section>
    );
}

function arcPath(lensIndex: number): string {
    const start = -90 + lensIndex * ARC_DEGREES + ARC_GAP_DEGREES / 2;
    const end = start + ARC_DEGREES - ARC_GAP_DEGREES;
    const outerStart = polarPoint(OUTER_RADIUS, start);
    const outerEnd = polarPoint(OUTER_RADIUS, end);
    const innerEnd = polarPoint(INNER_RADIUS, end);
    const innerStart = polarPoint(INNER_RADIUS, start);
    return [
        `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
        `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
        'Z'
    ].join(' ');
}

function polarPoint(radius: number, angleDegrees: number) {
    const radians = angleDegrees * Math.PI / 180;
    return {
        x: CENTER + radius * Math.cos(radians),
        y: CENTER + radius * Math.sin(radians)
    };
}
