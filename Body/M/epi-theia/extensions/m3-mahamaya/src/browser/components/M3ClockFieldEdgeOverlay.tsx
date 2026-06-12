import * as React from 'react';
import { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3-3' Clock-field angular/hop edge overlay (task 04.T4.3).
//
// This is a RENDERER OVERLAY ONLY. The clock substrate — CLOCK_DEGREE_LUT[360],
// the 360+24 backbone, and the 360+24 == 64*6 line-change topology — is landed
// in epi-lib/src/m3_clock_lut.c. This component never forks that LUT, never
// invents codon/hexagram/tarot/planetary data, and never embeds an ontological
// table. It consumes the backend-provided projection surface and draws three
// geometric overlays on the cosmic-wheel face:
//
//   1. spokeLattice  — the 12-tick spoke ring of the codon wheel. The lattice
//                       PERTURBS (rotates) with tick advance, so each tick
//                       redraws a fresh spoke orientation.
//   2. aspectEdges   — cross-clock angular relations from the active clock
//                       position: opposition (180°), trine (±120°), square
//                       (±90°). Pure angular geometry, no LUT.
//   3. hopGraph      — single-line-flip hop edges along the 384 (= 64×6) I-Ching
//                       line-change graph. A line flip is native bitwise XOR on
//                       the hexagram id; each lineChangeEdge lands on the
//                       384-node ring by position only.
//
// All edge geometry is derived from backend-provided scalars (degree720,
// hexagramId, lineIndex, lineChangeOperatorAddress, tick). The angular
// constants (180/120/90) and the bit-flip law are mathematics, not authority.

const VIEW = 220;
const CENTER = VIEW / 2;
const RIM_RADIUS = 96;
const HOP_RADIUS = 60;
const HUB_RADIUS = 14;
const SPOKE_COUNT = 12;
const LINE_CHANGE_NODES = 384;

export type M3AspectKind = 'opposition' | 'trine' | 'square';

export interface M3OverlayPoint {
    readonly x: number;
    readonly y: number;
}

export interface M3Spoke {
    readonly index: number;
    readonly baseAngleDeg: number;
    readonly angleDeg: number;
    readonly active: boolean;
    readonly inner: M3OverlayPoint;
    readonly outer: M3OverlayPoint;
}

export interface M3AspectEdge {
    readonly kind: M3AspectKind;
    readonly offsetDeg: number;
    readonly angleDeg: number;
    readonly from: M3OverlayPoint;
    readonly to: M3OverlayPoint;
}

export interface M3LineChangeEdge {
    readonly line: number;
    readonly fromNode: number;
    readonly toNode: number;
    readonly neighborHexagramId: number;
    readonly fromAngleDeg: number;
    readonly toAngleDeg: number;
    readonly from: M3OverlayPoint;
    readonly to: M3OverlayPoint;
}

export interface M3HopGraph {
    readonly activeNode: number;
    readonly hexagramId: number;
    readonly lineIndex: number;
    readonly nodeCount: typeof LINE_CHANGE_NODES;
    readonly activeAngleDeg: number;
    readonly active: M3OverlayPoint;
    readonly lineChangeEdges: readonly M3LineChangeEdge[];
}

export interface M3ClockFieldEdgeModel {
    readonly ready: boolean;
    readonly pendingFields: readonly string[];
    readonly tick: number | null;
    readonly degree720: number | null;
    readonly activeAngleDeg: number;
    readonly perturbationDeg: number;
    readonly active: M3OverlayPoint;
    readonly spokeLattice: readonly M3Spoke[];
    readonly aspectEdges: readonly M3AspectEdge[];
    readonly hopGraph: M3HopGraph;
}

export interface M3ClockFieldEdgeOverlayProps {
    readonly surface: M3ProjectionSurface;
    readonly className?: string;
}

// Aspect law: the classical hard/soft angular relations sampled from the active
// clock position. Each entry is a degree offset and the aspect family it names.
const ASPECT_OFFSETS: readonly { readonly kind: M3AspectKind; readonly offsetDeg: number }[] =
    Object.freeze([
        Object.freeze({ kind: 'opposition' as const, offsetDeg: 180 }),
        Object.freeze({ kind: 'trine' as const, offsetDeg: 120 }),
        Object.freeze({ kind: 'trine' as const, offsetDeg: -120 }),
        Object.freeze({ kind: 'square' as const, offsetDeg: 90 }),
        Object.freeze({ kind: 'square' as const, offsetDeg: -90 })
    ]);

const ASPECT_STROKE: Readonly<Record<M3AspectKind, string>> = {
    opposition: 'var(--theia-charts-red)',
    trine: 'var(--theia-charts-green)',
    square: 'var(--theia-charts-orange)'
};

export function clockFieldEdgeModelFromSurface(surface: M3ProjectionSurface): M3ClockFieldEdgeModel {
    const active = surface.activeProjection;
    const tick = numberValue(active.tick);
    const degree720 = numberValue(active.degree720);
    const hexagramId = numberValue(active.hexagramId);
    const lineIndex = numberValue(active.lineIndex) ?? 0;
    const rotationDegrees = numberValue(active.rotationDegrees) ?? 0;

    const pendingFields: string[] = [];
    if (!surface.readiness.surfaceReady) pendingFields.push('surface.readiness.surfaceReady');
    if (degree720 === null) pendingFields.push('profile.degree720');
    if (hexagramId === null) pendingFields.push('profile.mahamaya.hexagramId');
    const ready = pendingFields.length === 0;

    // Visual clock angle: the 360 degree-nodes span the 720° exact field
    // (2° per node), so the wheel face maps degree720 → degree720 / 2.
    const activeAngleDeg = mod360((degree720 ?? 0) / 2);
    // The codon wheel perturbs with tick advance: 12 ticks sweep the full 360°.
    const perturbationDeg = mod360((tick ?? 0) * (360 / SPOKE_COUNT) + rotationDegrees);

    const spokeLattice = buildSpokeLattice(tick, perturbationDeg);
    const aspectEdges = buildAspectEdges(activeAngleDeg);
    const hopGraph = buildHopGraph(
        hexagramId ?? 0,
        lineIndex,
        numberValue(active.lineChangeOperatorAddress)
    );

    return Object.freeze({
        ready,
        pendingFields: Object.freeze(pendingFields),
        tick,
        degree720,
        activeAngleDeg,
        perturbationDeg,
        active: pointOnCircle(activeAngleDeg, RIM_RADIUS),
        spokeLattice,
        aspectEdges,
        hopGraph
    });
}

function buildSpokeLattice(tick: number | null, perturbationDeg: number): readonly M3Spoke[] {
    const activeTick = tick === null ? null : ((tick % SPOKE_COUNT) + SPOKE_COUNT) % SPOKE_COUNT;
    const spokes: M3Spoke[] = [];
    for (let index = 0; index < SPOKE_COUNT; index++) {
        const baseAngleDeg = index * (360 / SPOKE_COUNT);
        const angleDeg = mod360(baseAngleDeg + perturbationDeg);
        spokes.push(
            Object.freeze({
                index,
                baseAngleDeg,
                angleDeg,
                active: index === activeTick,
                inner: pointOnCircle(angleDeg, HUB_RADIUS),
                outer: pointOnCircle(angleDeg, HOP_RADIUS)
            })
        );
    }
    return Object.freeze(spokes);
}

function buildAspectEdges(activeAngleDeg: number): readonly M3AspectEdge[] {
    const from = pointOnCircle(activeAngleDeg, RIM_RADIUS);
    return Object.freeze(
        ASPECT_OFFSETS.map(offset => {
            const angleDeg = mod360(activeAngleDeg + offset.offsetDeg);
            return Object.freeze({
                kind: offset.kind,
                offsetDeg: offset.offsetDeg,
                angleDeg,
                from,
                to: pointOnCircle(angleDeg, RIM_RADIUS)
            });
        })
    );
}

function buildHopGraph(
    hexagramId: number,
    lineIndex: number,
    lineChangeOperatorAddress: number | null
): M3HopGraph {
    const activeNode =
        lineChangeOperatorAddress !== null ? lineChangeOperatorAddress : hexagramId * 6 + lineIndex;
    const activeAngleDeg = nodeAngleDeg(activeNode);
    const edges: M3LineChangeEdge[] = [];
    // Six single-line-flip hops: flipping line i is XOR (1 << i) on the hexagram
    // id — the native line-change graph. Each neighbour keeps the same line slot.
    for (let line = 0; line < 6; line++) {
        const neighborHexagramId = (hexagramId ^ (1 << line)) & 0x3f;
        const toNode = neighborHexagramId * 6 + lineIndex;
        const toAngleDeg = nodeAngleDeg(toNode);
        edges.push(
            Object.freeze({
                line,
                fromNode: activeNode,
                toNode,
                neighborHexagramId,
                fromAngleDeg: activeAngleDeg,
                toAngleDeg,
                from: pointOnCircle(activeAngleDeg, HOP_RADIUS),
                to: pointOnCircle(toAngleDeg, HOP_RADIUS)
            })
        );
    }
    return Object.freeze({
        activeNode,
        hexagramId,
        lineIndex,
        nodeCount: LINE_CHANGE_NODES,
        activeAngleDeg,
        active: pointOnCircle(activeAngleDeg, HOP_RADIUS),
        lineChangeEdges: Object.freeze(edges)
    });
}

export const M3ClockFieldEdgeOverlay: React.FC<M3ClockFieldEdgeOverlayProps> = ({
    surface,
    className
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(() => clockFieldEdgeModelFromSurface(surface), [surface]);
    const classes = ['m3-clock-field-edge-overlay', className].filter(Boolean).join(' ');

    return (
        <article
            className={classes}
            data-widget-id="pratibimba.m3-mahamaya:clock-field-edge-overlay"
            data-ready={model.ready ? 'true' : 'false'}
            data-tick={model.tick ?? '—'}
            data-degree720={model.degree720 ?? '—'}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            data-active-angle-deg={fmt(model.activeAngleDeg)}
            data-perturbation-deg={fmt(model.perturbationDeg)}
            data-active-line-change-node={model.hopGraph.activeNode}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>M3 clock-field edge overlay</h3>
                    <p style={subtitleStyle}>
                        angular aspects · {LINE_CHANGE_NODES} line-change hop graph · tick-perturbed
                        spoke lattice
                    </p>
                </div>
                {!model.ready && (
                    <ReadinessChip
                        bindingKey={model.pendingFields[0] ?? 'profile.degree720'}
                        state="pending"
                        style={pendingChipStyle}
                    >
                        overlay pending: {model.pendingFields.join('; ') || 'projection surface'}
                    </ReadinessChip>
                )}
            </header>
            <svg
                role="img"
                aria-label="M3 clock-field angular and hop edge overlay"
                viewBox={`0 0 ${VIEW} ${VIEW}`}
                style={svgStyle}
            >
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RIM_RADIUS}
                    fill="none"
                    stroke="var(--theia-contrastBorder)"
                    strokeWidth={1}
                />
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={HOP_RADIUS}
                    fill="none"
                    stroke="var(--theia-contrastBorder)"
                    strokeWidth={0.5}
                    strokeDasharray="2 3"
                />

                <g data-overlay-lane="spoke-lattice" data-perturbation-deg={fmt(model.perturbationDeg)}>
                    {model.spokeLattice.map(spoke => (
                        <line
                            key={spoke.index}
                            data-spoke-index={spoke.index}
                            data-spoke-active={spoke.active ? 'true' : 'false'}
                            data-spoke-angle-deg={fmt(spoke.angleDeg)}
                            x1={fmt(spoke.inner.x)}
                            y1={fmt(spoke.inner.y)}
                            x2={fmt(spoke.outer.x)}
                            y2={fmt(spoke.outer.y)}
                            stroke={
                                spoke.active ? 'var(--theia-charts-blue)' : 'var(--theia-descriptionForeground)'
                            }
                            strokeWidth={spoke.active ? 2 : 0.75}
                        />
                    ))}
                </g>

                <g data-overlay-lane="aspect-edges">
                    {model.aspectEdges.map((edge, index) => (
                        <line
                            key={`${edge.kind}-${index}`}
                            data-aspect={edge.kind}
                            data-aspect-offset-deg={edge.offsetDeg}
                            data-aspect-angle-deg={fmt(edge.angleDeg)}
                            x1={fmt(edge.from.x)}
                            y1={fmt(edge.from.y)}
                            x2={fmt(edge.to.x)}
                            y2={fmt(edge.to.y)}
                            stroke={ASPECT_STROKE[edge.kind]}
                            strokeWidth={edge.kind === 'opposition' ? 1.5 : 1}
                        />
                    ))}
                </g>

                <g
                    data-overlay-lane="hop-graph"
                    data-active-line-change-node={model.hopGraph.activeNode}
                    data-hop-node-count={model.hopGraph.nodeCount}
                >
                    {model.hopGraph.lineChangeEdges.map(edge => (
                        <line
                            key={edge.line}
                            data-line-change-edge={edge.line}
                            data-neighbor-hexagram={edge.neighborHexagramId}
                            data-to-node={edge.toNode}
                            x1={fmt(edge.from.x)}
                            y1={fmt(edge.from.y)}
                            x2={fmt(edge.to.x)}
                            y2={fmt(edge.to.y)}
                            stroke="var(--theia-charts-purple)"
                            strokeWidth={0.75}
                        />
                    ))}
                    <circle
                        data-hop-active-node="true"
                        cx={fmt(model.hopGraph.active.x)}
                        cy={fmt(model.hopGraph.active.y)}
                        r={3}
                        fill="var(--theia-charts-purple)"
                    />
                </g>

                <circle
                    data-active-clock-node="true"
                    cx={fmt(model.active.x)}
                    cy={fmt(model.active.y)}
                    r={3.5}
                    fill="var(--theia-charts-blue)"
                />
            </svg>
        </article>
    );
};

export default M3ClockFieldEdgeOverlay;

function nodeAngleDeg(node: number): number {
    return mod360((node / LINE_CHANGE_NODES) * 360);
}

function pointOnCircle(angleDeg: number, radius: number): M3OverlayPoint {
    // 0° at 12 o'clock, sweeping clockwise.
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return Object.freeze({
        x: round2(CENTER + radius * Math.cos(rad)),
        y: round2(CENTER + radius * Math.sin(rad))
    });
}

function mod360(value: number): number {
    return ((value % 360) + 360) % 360;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function fmt(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 16,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
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

const svgStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 320,
    height: 'auto',
    display: 'block',
    margin: '0 auto'
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
