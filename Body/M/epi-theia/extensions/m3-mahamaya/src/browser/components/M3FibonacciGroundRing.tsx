import * as React from 'react';
import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';
import {
    fibonacciGroundModelFromProfilePayload,
    type M3FibonacciGroundModel
} from './M3CosmicWheelRenderService';

// M3 Mahāmāyā — Level-0 Fibonacci-Ground outer ring (DR-FIB-1).
//
// This is the OUTERMOST ring of the M3 cosmic-clock surface: 60 wedges, one per
// 6° of the 360° circle (60 × 6 = 360), each labelled with its Pisano/Fibonacci
// digit (0..9). The 60-fold division is the level-0 ground the whole clock is
// held within — the slow outer scaffold beneath the 16-lens annulus and the
// inner codon/hexagram/tarot rings.
//
// Two anchor classes are highlighted on the ring:
//   - cardinal-zero  : positions {0, 15, 30, 45} — the four 90° quarter points,
//                      the cross of the circle (drawn luminous);
//   - zodiacal-five  : positions {5,10,20,25,35,40,50,55} — the eight remaining
//                      multiples of 5 that fall on a sign/decan grid.
//
// The ring is a pure projection: it reads ONLY the level-0 fibonacci-ground lane
// off the profile payload (via the shared `fibonacciGroundModelFromProfilePayload`
// model, so the wedge LUT, anchors and sun markers stay single-sourced with the
// cosmic-wheel render service). It owns no codon-rotation, lens, or oracle state.

export const M3_FIBONACCI_GROUND_RING_WIDGET_ID =
    'pratibimba.m3-mahamaya:fibonacci-ground-ring';

/** 60 wedges × 6° = the full circle. */
export const M3_FIBONACCI_GROUND_WEDGE_COUNT = 60;
export const M3_FIBONACCI_GROUND_WEDGE_DEGREES =
    360 / M3_FIBONACCI_GROUND_WEDGE_COUNT;
/** The four 90° quarter points — drawn as cardinal-zero highlights. */
export const M3_FIBONACCI_CARDINAL_ZERO_POSITIONS: readonly number[] =
    Object.freeze([0, 15, 30, 45]);

export interface M3FibonacciGroundRingProps {
    /** Shared-bridge profile payload carrying the `fibonacciGround` lane. */
    readonly profilePayload?: Readonly<Record<string, unknown>>;
    /**
     * Pre-resolved model override (e.g. from a parent that already computed it).
     * Falls back to deriving the model off `profilePayload`.
     */
    readonly model?: M3FibonacciGroundModel;
    readonly readiness?: MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ============================================================================
// Geometry — radii in a 240×240 user-space box, 12° offset so position 0 sits
// at the top (−90°) and the ring winds clockwise.
// ============================================================================

const CENTER = 120;
const RING_OUTER_RADIUS = 112;
const RING_INNER_RADIUS = 96;
const DIGIT_RADIUS = 104;
const ANCHOR_RADIUS = 88;
const SUN_RADIUS = 116;

function positionDegree(position: number): number {
    return position * M3_FIBONACCI_GROUND_WEDGE_DEGREES;
}

function positionMidpointDegree(position: number): number {
    return positionDegree(position) + M3_FIBONACCI_GROUND_WEDGE_DEGREES / 2;
}

function polarX(radius: number, degree: number): number {
    return CENTER + radius * Math.cos(((degree - 90) * Math.PI) / 180);
}

function polarY(radius: number, degree: number): number {
    return CENTER + radius * Math.sin(((degree - 90) * Math.PI) / 180);
}

function ringWedgePath(position: number, innerRadius: number, outerRadius: number): string {
    const start = positionDegree(position);
    const end = positionDegree(position + 1);
    const x1 = polarX(outerRadius, start);
    const y1 = polarY(outerRadius, start);
    const x2 = polarX(outerRadius, end);
    const y2 = polarY(outerRadius, end);
    const x3 = polarX(innerRadius, end);
    const y3 = polarY(innerRadius, end);
    const x4 = polarX(innerRadius, start);
    const y4 = polarY(innerRadius, start);
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} `
        + `L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
}

// ============================================================================
// Component
// ============================================================================

export const M3FibonacciGroundRing: React.FC<M3FibonacciGroundRingProps> = ({
    profilePayload,
    model,
    readiness,
    className
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();

    const resolved = React.useMemo(
        () => model ?? fibonacciGroundModelFromProfilePayload(profilePayload, profileTick.fibonacciGround),
        [model, profilePayload, profileTick.fibonacciGround]
    );

    const cardinalSet = React.useMemo(
        () => new Set(resolved.cardinalAnchors),
        [resolved.cardinalAnchors]
    );
    const zodiacalSet = React.useMemo(
        () => new Set(resolved.zodiacalAnchors),
        [resolved.zodiacalAnchors]
    );

    const classes = ['m3-fibonacci-ground-ring', className].filter(Boolean).join(' ');
    const state = resolved.ready ? 'ready' : 'pending';

    return (
        <article
            className={classes}
            data-widget-id={M3_FIBONACCI_GROUND_RING_WIDGET_ID}
            data-wedge-count={M3_FIBONACCI_GROUND_WEDGE_COUNT}
            data-wedge-degrees={M3_FIBONACCI_GROUND_WEDGE_DEGREES}
            data-fibonacci-ground-readiness={state}
            data-fibonacci-ground-pending-fields={resolved.pendingFields.join(',')}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Fibonacci-Ground ring (60 · level-0)</h3>
                    <p style={subtitleStyle}>
                        60 wedges × 6° = 360°, each labelled with its Fibonacci digit (0–9).
                        Cardinal-zero highlights at {M3_FIBONACCI_CARDINAL_ZERO_POSITIONS.join(', ')}.
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="profile.fibonacciGround"
                    state={resolved.ready ? (readiness?.state === 'blocked' ? 'blocked' : 'ready') : 'pending'}
                    style={chipStyle}
                >
                    {resolved.ready ? 'level-0 ready' : 'ground pending'}
                </ReadinessChip>
            </header>

            {resolved.ready ? (
                <svg
                    role="img"
                    aria-label="Fibonacci-Ground level-0 outer ring, 60 wedges at 6 degrees each"
                    viewBox="0 0 240 240"
                    data-layer-order="ring-track,fibonacci-wedges,zodiacal-anchors,cardinal-zero-anchors,sun-markers"
                    style={svgStyle}
                >
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RING_OUTER_RADIUS}
                        fill="none"
                        stroke="var(--theia-contrastBorder)"
                        strokeWidth="1"
                    />
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RING_INNER_RADIUS}
                        fill="none"
                        stroke="var(--theia-contrastBorder)"
                        strokeWidth="0.5"
                    />

                    {/* 60 wedges, each labelled with its Fibonacci digit. */}
                    {resolved.wedges.map(wedge => {
                        const isCardinal = cardinalSet.has(wedge.position);
                        const isZodiacal = zodiacalSet.has(wedge.position);
                        return (
                            <g
                                key={wedge.position}
                                data-fibonacci-wedge={wedge.position}
                                data-fibonacci-digit={wedge.digit}
                                data-cardinal-zero={isCardinal ? 'true' : 'false'}
                                data-zodiacal-five={isZodiacal ? 'true' : 'false'}
                            >
                                <path
                                    d={ringWedgePath(wedge.position, RING_INNER_RADIUS, RING_OUTER_RADIUS)}
                                    fill={
                                        isCardinal
                                            ? 'var(--epi-cardinal-anchor, var(--theia-charts-red))'
                                            : 'var(--theia-editor-background)'
                                    }
                                    fillOpacity={isCardinal ? 0.18 : 1}
                                    stroke="var(--theia-contrastBorder)"
                                    strokeWidth="0.5"
                                />
                                <text
                                    x={polarX(DIGIT_RADIUS, positionMidpointDegree(wedge.position))}
                                    y={polarY(DIGIT_RADIUS, positionMidpointDegree(wedge.position))}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    style={isCardinal ? cardinalDigitStyle : fibonacciDigitStyle}
                                >
                                    {wedge.digit}
                                </text>
                            </g>
                        );
                    })}

                    {/* Zodiacal-five anchors — hollow markers on the 5°-grid points. */}
                    {resolved.zodiacalAnchors.map(position => (
                        <circle
                            key={`zodiacal-${position}`}
                            data-zodiacal-anchor={position}
                            cx={polarX(ANCHOR_RADIUS, positionDegree(position))}
                            cy={polarY(ANCHOR_RADIUS, positionDegree(position))}
                            r="3"
                            fill="none"
                            stroke="var(--epi-zodiacal-anchor, var(--theia-charts-blue))"
                            strokeWidth="1.5"
                        />
                    ))}

                    {/* Cardinal-zero anchors — luminous quarter-point markers. */}
                    {resolved.cardinalAnchors.map(position => (
                        <circle
                            key={`cardinal-${position}`}
                            data-cardinal-anchor={position}
                            cx={polarX(ANCHOR_RADIUS, positionDegree(position))}
                            cy={polarY(ANCHOR_RADIUS, positionDegree(position))}
                            r="4.5"
                            fill="var(--epi-cardinal-anchor, var(--theia-charts-red))"
                            stroke="var(--theia-editor-background)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Sun markers — natal (gold ring) and live (silver dot). */}
                    {resolved.natalSunPosition !== null && (
                        <circle
                            data-sun-marker="natal"
                            data-fibonacci-position={resolved.natalSunPosition}
                            cx={polarX(SUN_RADIUS, positionDegree(resolved.natalSunPosition))}
                            cy={polarY(SUN_RADIUS, positionDegree(resolved.natalSunPosition))}
                            r="5"
                            fill="none"
                            stroke="gold"
                            strokeWidth="2"
                        />
                    )}
                    {resolved.liveSunPosition !== null && (
                        <circle
                            data-sun-marker="live"
                            data-fibonacci-position={resolved.liveSunPosition}
                            cx={polarX(SUN_RADIUS, positionDegree(resolved.liveSunPosition))}
                            cy={polarY(SUN_RADIUS, positionDegree(resolved.liveSunPosition))}
                            r="4"
                            fill="silver"
                            stroke="var(--theia-editor-background)"
                            strokeWidth="1"
                        />
                    )}
                </svg>
            ) : (
                <ReadinessChip
                    bindingKey="profile.fibonacciGround"
                    state="pending"
                    style={pendingChipStyle}
                >
                    {resolved.pendingFields.join('; ') || 'fibonacci-ground pending'}
                </ReadinessChip>
            )}
        </article>
    );
};

export default M3FibonacciGroundRing;

// ============================================================================
// Styles
// ============================================================================

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    minWidth: 280
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const chipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const pendingChipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--theia-charts-yellow)',
    borderRadius: 999,
    color: 'var(--theia-charts-yellow)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};

const svgStyle: React.CSSProperties = {
    display: 'block',
    inlineSize: 'min(100%, 360px)',
    aspectRatio: '1 / 1',
    margin: '4px auto 0'
};

const fibonacciDigitStyle: React.CSSProperties = {
    fill: 'var(--theia-descriptionForeground)',
    fontSize: 5,
    fontWeight: 600,
    fontFamily: 'var(--theia-monospace-font-family)'
};

const cardinalDigitStyle: React.CSSProperties = {
    ...fibonacciDigitStyle,
    fill: 'var(--epi-cardinal-anchor, var(--theia-charts-red))',
    fontWeight: 700
};
