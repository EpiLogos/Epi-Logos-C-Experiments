import * as React from 'react';
import type {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import type { M0ProvenanceState } from '../../common';

export type M0VoidLensIndex =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15;

export interface M0VoidLens {
    readonly lensIndex: M0VoidLensIndex;
    readonly coordinate: string;
    readonly label: string;
    readonly state: M0ProvenanceState;
}

export type M0VoidLensTuple = readonly [
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens,
    M0VoidLens
];

export interface M0VoidStructureProjection {
    readonly lenses: M0VoidLensTuple;
    readonly state: M0ProvenanceState;
}

export interface M0InspectorModel {
    readonly voidStructure: M0VoidStructureProjection;
}

export interface VoidStructureRingProps {
    readonly projection: M0VoidStructureProjection;
    readonly onLensClick: (lens: M0VoidLens) => void;
}

export const M0_VOID_STRUCTURE_RING_PAYLOAD_KEY = 'm0_void_structure_ring' as const;
export const M0_VOID_STRUCTURE_RING_SIZE = 240 as const;
export const M0_VOID_STRUCTURE_LENS_COUNT = 16 as const;
export const M0_VOID_STRUCTURE_ARC_DEGREES = 22.5 as const;

const CENTER = M0_VOID_STRUCTURE_RING_SIZE / 2;
const OUTER_RADIUS = 108;
const INNER_RADIUS = 68;
const PILL_RADIUS = 88;
const ARC_GAP_DEGREES = 0.8;

const VALID_PROVENANCE_STATES = new Set<M0ProvenanceState>([
    'canonical',
    'canonical_absent',
    'derived',
    'inferred',
    'review_pending',
    'blocked'
]);

const AXIS_COLORS: readonly string[] = Object.freeze([
    '#7aa2f7',
    '#9ece6a',
    '#e0af68',
    '#bb9af7',
    '#7dcfff',
    '#f7768e',
    '#c0caf5',
    '#73daca'
]);

export function readM0VoidStructureProjection(
    profile: Pick<MathemeHarmonicProfileBoundary, 'payload'> | null | undefined
): M0VoidStructureProjection | null {
    const payload = profile?.payload;
    const raw = payload?.[M0_VOID_STRUCTURE_RING_PAYLOAD_KEY];
    const lenses = readM0VoidLenses(raw);
    if (!lenses) {
        return null;
    }
    return Object.freeze({
        lenses,
        state: projectionState(lenses)
    });
}

export function readM0VoidLenses(raw: unknown): M0VoidLensTuple | null {
    if (!Array.isArray(raw) || raw.length !== M0_VOID_STRUCTURE_LENS_COUNT) {
        return null;
    }
    const lenses: M0VoidLens[] = [];
    for (let index = 0; index < raw.length; index += 1) {
        const lens = readM0VoidLens(raw[index], index);
        if (!lens) {
            return null;
        }
        lenses.push(lens);
    }
    return toM0VoidLensTuple(lenses);
}

export function voidStructureLensSelectionContextNotes(lens: M0VoidLens): readonly string[] {
    return Object.freeze([
        `selected ${lens.coordinate} from ${M0_VOID_STRUCTURE_RING_PAYLOAD_KEY}`,
        `lensIndex=${lens.lensIndex}`,
        `conjugationAxis=${lens.lensIndex % 8}`
    ]);
}

export function contextForVoidLensSelection(
    current: CoordinateContext,
    lens: M0VoidLens
): CoordinateContext {
    const hashInput = lens.coordinate.startsWith('#') ? lens.coordinate : current.hashInput;
    const canonicalMCoordinate = lens.coordinate.startsWith('M')
        ? lens.coordinate
        : current.canonicalMCoordinate;
    return Object.freeze({
        ...current,
        selectedCoordinate: lens.coordinate,
        hashInput,
        canonicalMCoordinate,
        provenance: Object.freeze({
            source: 'm0-anuttara:void-structure-ring',
            generation: current.profileGeneration,
            notes: voidStructureLensSelectionContextNotes(lens)
        })
    });
}

export function selectM0VoidLens(
    bridge: Pick<SharedBridgeAdapter, 'updateCoordinateContext'>,
    current: CoordinateContext,
    lens: M0VoidLens
): CoordinateContext {
    const next = contextForVoidLensSelection(current, lens);
    bridge.updateCoordinateContext(next);
    return next;
}

export const VoidStructureRing: React.FC<VoidStructureRingProps> = ({
    projection,
    onLensClick
}) => {
    return (
        <section
            className="m0-void-structure-ring"
            data-widget-id="pratibimba.m0-anuttara:VoidStructureRing"
            data-provenance-state={projection.state}
            aria-label="16-Fold Void-Structure ring"
            style={ringShellStyle}
        >
            <svg
                width={M0_VOID_STRUCTURE_RING_SIZE}
                height={M0_VOID_STRUCTURE_RING_SIZE}
                viewBox={`0 0 ${M0_VOID_STRUCTURE_RING_SIZE} ${M0_VOID_STRUCTURE_RING_SIZE}`}
                role="img"
                aria-label="16-Fold Void-Structure sacred-circle divisions"
                style={svgStyle}
            >
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={(OUTER_RADIUS + INNER_RADIUS) / 2}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.18}
                    strokeWidth={1}
                />
                {projection.lenses.map(lens => (
                    <VoidStructureArc
                        key={`${lens.lensIndex}:${lens.coordinate}`}
                        lens={lens}
                        onLensClick={onLensClick}
                    />
                ))}
            </svg>
        </section>
    );
};

const VoidStructureArc: React.FC<{
    readonly lens: M0VoidLens;
    readonly onLensClick: (lens: M0VoidLens) => void;
}> = ({ lens, onLensClick }) => {
    const path = arcPath(lens.lensIndex);
    const pill = pillPosition(lens.lensIndex);
    const axis = lens.lensIndex % 8;
    const fill = AXIS_COLORS[axis];
    const ariaLabel = `${lens.coordinate} ${lens.label}`;
    const buttonLabel = `${ariaLabel} provenance ${lens.state}`;

    return (
        <g
            className="m0-void-structure-ring__axis"
            data-conjugation-axis={axis}
            data-lens-index={lens.lensIndex}
        >
            <path
                className="m0-void-structure-ring__arc"
                d={path}
                role="button"
                tabIndex={0}
                aria-label={buttonLabel}
                data-lens-coordinate={lens.coordinate}
                data-provenance-state={lens.state}
                onClick={() => onLensClick(lens)}
                onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onLensClick(lens);
                    }
                }}
                style={{
                    ...arcStyle,
                    fill,
                    fillOpacity: lens.state === 'blocked' ? 0.14 : 0.22
                }}
            />
            <circle
                className="m0-void-structure-ring__provenance-pill"
                cx={pill.x}
                cy={pill.y}
                r={4.25}
                aria-hidden="true"
                data-provenance-state={lens.state}
                style={provenancePillStyle(lens.state)}
            />
        </g>
    );
};

export function arcPath(lensIndex: M0VoidLensIndex): string {
    const start = -90 + lensIndex * M0_VOID_STRUCTURE_ARC_DEGREES + ARC_GAP_DEGREES / 2;
    const end = start + M0_VOID_STRUCTURE_ARC_DEGREES - ARC_GAP_DEGREES;
    const outerStart = polarPoint(OUTER_RADIUS, start);
    const outerEnd = polarPoint(OUTER_RADIUS, end);
    const innerEnd = polarPoint(INNER_RADIUS, end);
    const innerStart = polarPoint(INNER_RADIUS, start);
    const largeArcFlag = end - start > 180 ? 1 : 0;

    return [
        `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
        `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
        `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
        'Z'
    ].join(' ');
}

function readM0VoidLens(raw: unknown, index: number): M0VoidLens | null {
    const record = objectValue(raw);
    const lensIndex = numberValue(record?.lensIndex ?? record?.lens_index);
    const coordinate = stringValue(record?.coordinate);
    const label = stringValue(record?.label);
    const state = provenanceState(record?.state);

    if (lensIndex !== index || !isM0VoidLensIndex(lensIndex) || !coordinate || !label || !state) {
        return null;
    }
    return Object.freeze({
        lensIndex,
        coordinate,
        label,
        state
    });
}

function toM0VoidLensTuple(lenses: readonly M0VoidLens[]): M0VoidLensTuple | null {
    if (lenses.length !== M0_VOID_STRUCTURE_LENS_COUNT) {
        return null;
    }
    const [
        lens0,
        lens1,
        lens2,
        lens3,
        lens4,
        lens5,
        lens6,
        lens7,
        lens8,
        lens9,
        lens10,
        lens11,
        lens12,
        lens13,
        lens14,
        lens15
    ] = lenses;
    if (
        !lens0 ||
        !lens1 ||
        !lens2 ||
        !lens3 ||
        !lens4 ||
        !lens5 ||
        !lens6 ||
        !lens7 ||
        !lens8 ||
        !lens9 ||
        !lens10 ||
        !lens11 ||
        !lens12 ||
        !lens13 ||
        !lens14 ||
        !lens15
    ) {
        return null;
    }
    return Object.freeze([
        lens0,
        lens1,
        lens2,
        lens3,
        lens4,
        lens5,
        lens6,
        lens7,
        lens8,
        lens9,
        lens10,
        lens11,
        lens12,
        lens13,
        lens14,
        lens15
    ]);
}

function projectionState(lenses: readonly M0VoidLens[]): M0ProvenanceState {
    if (lenses.some(lens => lens.state === 'blocked')) {
        return 'blocked';
    }
    if (lenses.some(lens => lens.state === 'canonical_absent')) {
        return 'canonical_absent';
    }
    if (lenses.every(lens => lens.state === 'canonical')) {
        return 'canonical';
    }
    return 'derived';
}

function pillPosition(lensIndex: M0VoidLensIndex): { readonly x: number; readonly y: number } {
    const midAngle = -90 + lensIndex * M0_VOID_STRUCTURE_ARC_DEGREES + M0_VOID_STRUCTURE_ARC_DEGREES / 2;
    return polarPoint(PILL_RADIUS, midAngle);
}

function polarPoint(radius: number, angleDegrees: number): { readonly x: number; readonly y: number } {
    const radians = angleDegrees * Math.PI / 180;
    return Object.freeze({
        x: CENTER + radius * Math.cos(radians),
        y: CENTER + radius * Math.sin(radians)
    });
}

function isM0VoidLensIndex(value: number | null): value is M0VoidLensIndex {
    return (
        value !== null &&
        Number.isInteger(value) &&
        value >= 0 &&
        value < M0_VOID_STRUCTURE_LENS_COUNT
    );
}

function objectValue(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function provenanceState(value: unknown): M0ProvenanceState | null {
    return typeof value === 'string' && VALID_PROVENANCE_STATES.has(value as M0ProvenanceState)
        ? (value as M0ProvenanceState)
        : null;
}

const ringShellStyle: React.CSSProperties = Object.freeze({
    display: 'inline-flex',
    width: M0_VOID_STRUCTURE_RING_SIZE,
    height: M0_VOID_STRUCTURE_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--theia-foreground)'
});

const svgStyle: React.CSSProperties = Object.freeze({
    width: M0_VOID_STRUCTURE_RING_SIZE,
    height: M0_VOID_STRUCTURE_RING_SIZE,
    flex: '0 0 auto'
});

const arcStyle: React.CSSProperties = Object.freeze({
    stroke: 'var(--theia-editor-background)',
    strokeWidth: 1.5,
    cursor: 'pointer',
    outline: 'none'
});

function provenancePillStyle(state: M0ProvenanceState): React.CSSProperties {
    if (state === 'blocked') {
        return blockedPillStyle;
    }
    if (state === 'canonical_absent') {
        return dottedPillStyle;
    }
    if (state === 'canonical') {
        return canonicalPillStyle;
    }
    return derivedPillStyle;
}

const canonicalPillStyle: React.CSSProperties = Object.freeze({
    fill: 'var(--theia-charts-green, #89d185)',
    stroke: 'var(--theia-editor-background)',
    strokeWidth: 1
});

const dottedPillStyle: React.CSSProperties = Object.freeze({
    fill: 'transparent',
    stroke: 'var(--theia-descriptionForeground)',
    strokeDasharray: '1.5 1.5',
    strokeWidth: 1.5
});

const blockedPillStyle: React.CSSProperties = Object.freeze({
    fill: 'var(--theia-errorForeground, #f48771)',
    stroke: 'var(--theia-editor-background)',
    strokeWidth: 1
});

const derivedPillStyle: React.CSSProperties = Object.freeze({
    fill: 'var(--theia-descriptionForeground)',
    fillOpacity: 0.72,
    stroke: 'var(--theia-editor-background)',
    strokeWidth: 1
});
