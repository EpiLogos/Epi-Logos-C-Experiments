import * as React from 'react';
import { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// M3 CosmicClockRenderService (24.T24.2).
//
// Renderer-only M3 face of the cosmic clock: 360 degree nodes + 24 amino
// backbone nodes + 1 Axis Mundi/Quintessence. Cross-Mn CosmicClockPlugin
// orchestration stays outside this component. Wave-B profile fields are consumed
// when supplied; until then the component renders the substrate-derived skeleton
// and marks the missing edge payloads as honest pending fields.

export type CosmicClockMode =
    | 'flat-clock-debug'
    | 'toroidal-world'
    | 'lens-annulus'
    | 'hopf-identity';

export type AspectEdgeKind = 'aspect' | 'opposition' | 'trine' | 'square';

export interface CosmicClockDegreeNode {
    readonly degree: number;
    readonly id?: string;
    readonly label?: string;
    readonly state?: 'active' | 'available' | 'pending';
}

export interface CosmicClockAminoNode {
    readonly index: number;
    readonly degree: number;
    readonly ring?: 0 | 1 | 2 | 3;
    readonly id?: string;
    readonly label?: string;
}

export interface CosmicClockAxisMundi {
    readonly id?: string;
    readonly label?: string;
    readonly state?: 'active' | 'available' | 'pending';
}

export interface AspectEdge {
    readonly id?: string;
    readonly kind: AspectEdgeKind;
    readonly fromDegree: number;
    readonly toDegree: number;
    readonly weight?: number;
    readonly label?: string;
}

export interface LineChangeHopEdge {
    readonly id?: string;
    readonly fromNode: number;
    readonly toNode: number;
    readonly line: number;
    readonly operator?: string;
    readonly weight?: number;
}

export interface CosmicClockRenderServiceProps {
    readonly surface: M3ProjectionSurface;
    readonly degreeNodes: readonly CosmicClockDegreeNode[];
    readonly aminoBackbone: readonly CosmicClockAminoNode[];
    readonly axisMundi: CosmicClockAxisMundi;
    readonly aspectEdges: readonly AspectEdge[];
    readonly hopEdges: readonly LineChangeHopEdge[];
    readonly mode: CosmicClockMode;
}

export interface CosmicClockPoint {
    readonly x: number;
    readonly y: number;
}

export interface CosmicClockDegreeRenderNode {
    readonly degree: number;
    readonly displayDegree: number;
    readonly point: CosmicClockPoint;
    readonly active: boolean;
    readonly source: 'profile' | 'skeleton';
}

export interface CosmicClockAminoRenderNode {
    readonly index: number;
    readonly degree: number;
    readonly displayDegree: number;
    readonly ring: 0 | 1 | 2 | 3;
    readonly point: CosmicClockPoint;
    readonly source: 'profile' | 'skeleton';
}

export interface CosmicClockAspectRenderEdge {
    readonly kind: AspectEdgeKind;
    readonly fromDegree: number;
    readonly toDegree: number;
    readonly displayFromDegree: number;
    readonly displayToDegree: number;
    readonly weight: number;
    readonly from: CosmicClockPoint;
    readonly to: CosmicClockPoint;
    readonly source: 'profile';
}

export interface CosmicClockHopRenderEdge {
    readonly line: number;
    readonly fromNode: number;
    readonly toNode: number;
    readonly displayFromNode: number;
    readonly displayToNode: number;
    readonly weight: number;
    readonly operator: string;
    readonly from: CosmicClockPoint;
    readonly to: CosmicClockPoint;
    readonly source: 'profile';
}

export interface CosmicClockToroidalPosition {
    readonly stage: number;
    readonly degree: number;
    readonly displayDegree: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

export interface CosmicClockLensSector {
    readonly index: number;
    readonly startDegree: number;
    readonly endDegree: number;
    readonly active: boolean;
}

export interface CosmicClockRenderModel {
    readonly mode: CosmicClockMode;
    readonly tick: number;
    readonly activeDegree: number;
    readonly degreeNodes: readonly CosmicClockDegreeRenderNode[];
    readonly aminoBackbone: readonly CosmicClockAminoRenderNode[];
    readonly axisMundi: CosmicClockAxisMundi;
    readonly aspectEdges: readonly CosmicClockAspectRenderEdge[];
    readonly hopGraph: readonly CosmicClockHopRenderEdge[];
    readonly toroidalPositions: readonly CosmicClockToroidalPosition[];
    readonly lensSectors: readonly CosmicClockLensSector[];
    readonly pendingFields: readonly string[];
    readonly nodeCount: 385;
}

const VIEW = 360;
const CENTER = VIEW / 2;
const DEGREE_RADIUS = 154;
const ASPECT_RADIUS = 136;
const HOP_RADIUS = 112;
const AMINO_RING_RADII = Object.freeze([46, 70, 94, 118] as const);
const DEGREE_NODE_COUNT = 360;
const AMINO_NODE_COUNT = 24;
const LINE_CHANGE_NODE_COUNT = 384;
const TORUS_STAGE_COUNT = 12;
const LENS_SECTOR_COUNT = 17;
const COSMIC_CLOCK_NODE_COUNT = 385 as const;

const ASPECT_STROKE: Readonly<Record<AspectEdgeKind, string>> = {
    aspect: 'var(--theia-descriptionForeground)',
    opposition: 'var(--theia-charts-red)',
    trine: 'var(--theia-charts-green)',
    square: 'var(--theia-charts-orange)'
};

export function cosmicClockModelFromProps(
    props: CosmicClockRenderServiceProps
): CosmicClockRenderModel {
    const tick = numberValue(props.surface.activeProjection.tick) ?? 0;
    const degree720 = numberValue(props.surface.activeProjection.degree720);
    const activeDegree = mod360((degree720 ?? 0) / 2 + tick);
    const degreeNodes = normalDegreeNodes(props.degreeNodes).map(node => {
        const displayDegree = mod360(node.degree + tick);
        return Object.freeze({
            degree: node.degree,
            displayDegree,
            point: pointOnCircle(displayDegree, DEGREE_RADIUS),
            active: angularDistance(displayDegree, activeDegree) < 0.5,
            source: node.source
        });
    });
    const aminoBackbone = normalAminoNodes(props.aminoBackbone).map(node => {
        const displayDegree = mod360(node.degree + tick);
        return Object.freeze({
            index: node.index,
            degree: node.degree,
            displayDegree,
            ring: node.ring,
            point: pointOnCircle(displayDegree, AMINO_RING_RADII[node.ring]),
            source: node.source
        });
    });
    const aspectInput = arrayValue<AspectEdge>(props.aspectEdges);
    const hopInput = arrayValue<LineChangeHopEdge>(props.hopEdges);
    const pendingFields: string[] = [];
    if (!props.surface.readiness.surfaceReady) {
        pendingFields.push('surface.readiness.surfaceReady');
    }
    if (degree720 === null) {
        pendingFields.push('surface.activeProjection.degree720');
    }
    if (aspectInput.length === 0) {
        pendingFields.push('pending-profile-field:cosmicClock.aspectEdges');
    }
    if (hopInput.length === 0) {
        pendingFields.push('pending-profile-field:cosmicClock.hopEdges');
    }

    return Object.freeze({
        mode: props.mode,
        tick,
        activeDegree,
        degreeNodes: Object.freeze(degreeNodes),
        aminoBackbone: Object.freeze(aminoBackbone),
        axisMundi: Object.freeze(props.axisMundi ?? { state: 'pending', label: 'Axis Mundi' }),
        aspectEdges: buildAspectEdges(aspectInput, tick),
        hopGraph: buildHopGraph(hopInput, tick),
        toroidalPositions: buildToroidalPositions(tick),
        lensSectors: buildLensSectors(activeDegree),
        pendingFields: Object.freeze(pendingFields),
        nodeCount: COSMIC_CLOCK_NODE_COUNT
    });
}

export const CosmicClockRenderService: React.FC<CosmicClockRenderServiceProps> = props => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(() => cosmicClockModelFromProps(props), [props]);

    return (
        <article
            className="m3-cosmic-clock-render-service"
            data-widget-id="pratibimba.m3-mahamaya:cosmic-clock"
            data-mode={model.mode}
            data-node-count={model.nodeCount}
            data-degree-node-count={model.degreeNodes.length}
            data-amino-node-count={model.aminoBackbone.length}
            data-profile-tick={profileTick.tick ?? model.tick}
            data-model-tick={model.tick}
            data-context-readiness={inheritedReadiness.snapshot.state}
            data-active-degree={fmt(model.activeDegree)}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>M3 Cosmic Clock</h3>
                    <p style={subtitleStyle}>
                        360 degree nodes · 24 amino backbone · Axis Mundi · tick {model.tick}
                    </p>
                </div>
                <ReadinessChip
                    bindingKey={model.pendingFields[0] ?? 'payload.cosmicClock'}
                    state={model.pendingFields.length === 0 ? 'ready' : 'pending'}
                    style={chipStyle}
                >
                    {model.pendingFields.length === 0 ? 'cosmic clock ready' : model.pendingFields[0]}
                </ReadinessChip>
            </header>
            {model.mode === 'flat-clock-debug' && <FlatClockDebugView model={model} />}
            {model.mode === 'toroidal-world' && <ToroidalWorldView model={model} />}
            {model.mode === 'lens-annulus' && <LensAnnulusView model={model} />}
            {model.mode === 'hopf-identity' && <HopfIdentityView model={model} />}
        </article>
    );
};

export default CosmicClockRenderService;

export const AspectEdgeLayer: React.FC<{ readonly model: CosmicClockRenderModel }> = ({ model }) => {
    if (model.aspectEdges.length === 0) {
        return (
            <g
                data-overlay-lane="aspect-edges"
                data-aspect-edge-state="pending-profile-field:cosmicClock.aspectEdges"
            />
        );
    }
    return (
        <g data-overlay-lane="aspect-edges" data-aspect-edge-count={model.aspectEdges.length}>
            {model.aspectEdges.map((aspectEdge, index) => (
                <line
                    key={`${aspectEdge.kind}-${index}`}
                    data-aspect-edge={aspectEdge.kind}
                    data-aspect-from-degree={fmt(aspectEdge.displayFromDegree)}
                    data-aspect-to-degree={fmt(aspectEdge.displayToDegree)}
                    x1={fmt(aspectEdge.from.x)}
                    y1={fmt(aspectEdge.from.y)}
                    x2={fmt(aspectEdge.to.x)}
                    y2={fmt(aspectEdge.to.y)}
                    stroke={ASPECT_STROKE[aspectEdge.kind]}
                    strokeWidth={fmt(Math.max(0.75, aspectEdge.weight))}
                    opacity={0.86}
                />
            ))}
        </g>
    );
};

export const LineChangeHopLayer: React.FC<{ readonly model: CosmicClockRenderModel }> = ({ model }) => {
    if (model.hopGraph.length === 0) {
        return (
            <g
                data-overlay-lane="hop-graph"
                data-hop-graph-state="pending-profile-field:cosmicClock.hopEdges"
            />
        );
    }
    return (
        <g data-overlay-lane="hop-graph" data-line-change-edge-count={model.hopGraph.length}>
            {model.hopGraph.map((lineChangeEdge, index) => (
                <path
                    key={`${lineChangeEdge.fromNode}-${lineChangeEdge.toNode}-${index}`}
                    data-line-change-edge={lineChangeEdge.line}
                    data-hop-operator={lineChangeEdge.operator}
                    data-hop-from-node={lineChangeEdge.displayFromNode}
                    data-hop-to-node={lineChangeEdge.displayToNode}
                    d={arcPath(lineChangeEdge.from, lineChangeEdge.to, HOP_RADIUS)}
                    fill="none"
                    stroke="var(--theia-charts-purple)"
                    strokeWidth={fmt(Math.max(0.7, lineChangeEdge.weight))}
                    opacity={0.72}
                />
            ))}
        </g>
    );
};

const FlatClockDebugView: React.FC<{ readonly model: CosmicClockRenderModel }> = ({ model }) => (
    <svg
        role="img"
        aria-label="M3 385-node cosmic clock flat debug projection"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        style={svgStyle}
    >
        <circle cx={CENTER} cy={CENTER} r={DEGREE_RADIUS} fill="none" stroke="var(--theia-contrastBorder)" />
        <circle cx={CENTER} cy={CENTER} r={HOP_RADIUS} fill="none" stroke="var(--theia-contrastBorder)" strokeDasharray="2 4" />
        <AspectEdgeLayer model={model} />
        <LineChangeHopLayer model={model} />
        <g data-node-lane="amino-backbone" data-node-count={model.aminoBackbone.length}>
            {AMINO_RING_RADII.map(radius => (
                <circle key={radius} cx={CENTER} cy={CENTER} r={radius} fill="none" stroke="var(--theia-contrastBorder)" strokeWidth={0.6} />
            ))}
            {model.aminoBackbone.map(node => (
                <circle
                    key={node.index}
                    data-amino-node={node.index}
                    data-amino-ring={node.ring}
                    data-amino-degree={fmt(node.displayDegree)}
                    cx={fmt(node.point.x)}
                    cy={fmt(node.point.y)}
                    r={2.6}
                    fill="var(--theia-charts-yellow)"
                />
            ))}
        </g>
        <g data-node-lane="degree-nodes" data-node-count={model.degreeNodes.length}>
            {model.degreeNodes.map(node => (
                <circle
                    key={node.degree}
                    data-degree-node={node.degree}
                    data-degree-display={fmt(node.displayDegree)}
                    data-degree-active={node.active ? 'true' : 'false'}
                    cx={fmt(node.point.x)}
                    cy={fmt(node.point.y)}
                    r={node.active ? 2.8 : 1.15}
                    fill={node.active ? 'var(--theia-charts-blue)' : 'var(--theia-descriptionForeground)'}
                    opacity={node.active ? 1 : 0.64}
                />
            ))}
        </g>
        <circle
            data-axis-mundi="true"
            cx={CENTER}
            cy={CENTER}
            r={7}
            fill="var(--theia-editorWidget-background)"
            stroke="var(--theia-charts-blue)"
            strokeWidth={2}
        />
    </svg>
);

const ToroidalWorldView: React.FC<{ readonly model: CosmicClockRenderModel }> = ({ model }) => (
    <section
        data-depth-view="toroidal-world"
        data-webgl-renderer="deferred-threejs-profile-consumer"
        data-toroidal-position-count={model.toroidalPositions.length}
        style={modePanelStyle}
    >
        <svg
            role="img"
            aria-label="M3 toroidal world clock projection fallback"
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            style={svgStyle}
        >
            <circle cx={CENTER} cy={CENTER} r={124} fill="none" stroke="var(--theia-contrastBorder)" />
            <circle cx={CENTER} cy={CENTER} r={76} fill="none" stroke="var(--theia-contrastBorder)" />
            {model.toroidalPositions
                .filter(position => position.degree % 12 === 0)
                .map(position => (
                    <circle
                        key={`${position.stage}-${position.degree}`}
                        data-torus-stage={position.stage}
                        data-torus-degree={position.degree}
                        cx={fmt(CENTER + position.x * 92)}
                        cy={fmt(CENTER + position.y * 54 + position.z * 18)}
                        r={position.stage === 0 ? 1.8 : 0.9}
                        fill="var(--theia-charts-blue)"
                        opacity={0.42 + position.stage / 22}
                    />
                ))}
        </svg>
        <div
            role="img"
            aria-label="Braille canvas fallback for non-WebGL cosmic clock contexts"
            data-braille-canvas-fallback="true"
            style={brailleFallbackStyle}
        >
            ⠁⠂⠄⡀⢀⠠⠐⠈
        </div>
    </section>
);

const LensAnnulusView: React.FC<{ readonly model: CosmicClockRenderModel }> = ({ model }) => (
    <svg
        role="img"
        aria-label="M3 16 plus 1 lens stack annulus"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        style={svgStyle}
    >
        <circle cx={CENTER} cy={CENTER} r={34} fill="var(--theia-editorWidget-background)" stroke="var(--theia-charts-blue)" />
        <g data-depth-view="lens-annulus" data-lens-sector-count={model.lensSectors.length}>
            {model.lensSectors.map(sector => (
                <path
                    key={sector.index}
                    data-lens-sector={sector.index}
                    data-lens-active={sector.active ? 'true' : 'false'}
                    d={sectorPath(sector.startDegree, sector.endDegree, 62, 150)}
                    fill={sector.active ? 'var(--theia-charts-blue)' : 'var(--theia-editorWidget-background)'}
                    stroke="var(--theia-contrastBorder)"
                    opacity={sector.active ? 0.85 : 0.55}
                />
            ))}
        </g>
    </svg>
);

const HopfIdentityView: React.FC<{ readonly model: CosmicClockRenderModel }> = ({ model }) => (
    <section
        data-depth-view="hopf-identity"
        data-profile-bus-consumer="true"
        data-recomputes-hopf-fibre="false"
        style={modePanelStyle}
    >
        <svg role="img" aria-label="M3 Hopf identity profile-bus projection" viewBox={`0 0 ${VIEW} ${VIEW}`} style={svgStyle}>
            <circle cx={CENTER} cy={CENTER} r={124} fill="none" stroke="var(--theia-contrastBorder)" />
            <path
                data-hopf-fibre-projection="profile-bus"
                d={`M ${CENTER - 112} ${CENTER} C ${CENTER - 48} ${CENTER - 126}, ${CENTER + 48} ${CENTER + 126}, ${CENTER + 112} ${CENTER}`}
                fill="none"
                stroke="var(--theia-charts-green)"
                strokeWidth={2}
            />
            <circle
                data-hopf-active-degree={fmt(model.activeDegree)}
                cx={fmt(pointOnCircle(model.activeDegree, 124).x)}
                cy={fmt(pointOnCircle(model.activeDegree, 124).y)}
                r={4}
                fill="var(--theia-charts-green)"
            />
        </svg>
    </section>
);

function normalDegreeNodes(nodes: readonly CosmicClockDegreeNode[] | undefined): readonly (CosmicClockDegreeNode & { readonly source: 'profile' | 'skeleton' })[] {
    const input = arrayValue<CosmicClockDegreeNode>(nodes);
    if (input.length === DEGREE_NODE_COUNT) {
        return Object.freeze(input.map(node => Object.freeze({ ...node, degree: mod360(node.degree), source: 'profile' as const })));
    }
    return Object.freeze(
        Array.from({ length: DEGREE_NODE_COUNT }, (_, degree) =>
            Object.freeze({ degree, state: 'pending' as const, source: 'skeleton' as const })
        )
    );
}

function normalAminoNodes(nodes: readonly CosmicClockAminoNode[] | undefined): readonly (CosmicClockAminoNode & { readonly ring: 0 | 1 | 2 | 3; readonly source: 'profile' | 'skeleton' })[] {
    const input = arrayValue<CosmicClockAminoNode>(nodes);
    if (input.length === AMINO_NODE_COUNT) {
        return Object.freeze(
            input.map((node, fallbackIndex) =>
                Object.freeze({
                    ...node,
                    index: clampInteger(node.index, fallbackIndex),
                    degree: mod360(node.degree),
                    ring: ringIndex(node.ring ?? fallbackIndex % 4),
                    source: 'profile' as const
                })
            )
        );
    }
    return Object.freeze(
        Array.from({ length: AMINO_NODE_COUNT }, (_, index) =>
            Object.freeze({
                index,
                degree: index * (360 / AMINO_NODE_COUNT),
                ring: ringIndex(Math.floor(index / 6)),
                source: 'skeleton' as const
            })
        )
    );
}

function buildAspectEdges(edges: readonly AspectEdge[], tick: number): readonly CosmicClockAspectRenderEdge[] {
    return Object.freeze(
        edges.map(edge => {
            const displayFromDegree = mod360(edge.fromDegree + tick);
            const displayToDegree = mod360(edge.toDegree + tick);
            return Object.freeze({
                kind: edge.kind,
                fromDegree: mod360(edge.fromDegree),
                toDegree: mod360(edge.toDegree),
                displayFromDegree,
                displayToDegree,
                weight: positiveWeight(edge.weight),
                from: pointOnCircle(displayFromDegree, ASPECT_RADIUS),
                to: pointOnCircle(displayToDegree, ASPECT_RADIUS),
                source: 'profile' as const
            });
        })
    );
}

function buildHopGraph(edges: readonly LineChangeHopEdge[], tick: number): readonly CosmicClockHopRenderEdge[] {
    return Object.freeze(
        edges.map(edge => {
            const displayFromNode = lineNode(edge.fromNode + tick);
            const displayToNode = lineNode(edge.toNode + tick);
            return Object.freeze({
                line: clampInteger(edge.line, 0),
                fromNode: lineNode(edge.fromNode),
                toNode: lineNode(edge.toNode),
                displayFromNode,
                displayToNode,
                weight: positiveWeight(edge.weight),
                operator: edge.operator ?? 'lineChangeEdge',
                from: pointOnCircle(nodeAngleDeg(displayFromNode), HOP_RADIUS),
                to: pointOnCircle(nodeAngleDeg(displayToNode), HOP_RADIUS),
                source: 'profile' as const
            });
        })
    );
}

function buildToroidalPositions(tick: number): readonly CosmicClockToroidalPosition[] {
    const positions: CosmicClockToroidalPosition[] = [];
    for (let stage = 0; stage < TORUS_STAGE_COUNT; stage++) {
        const phi = (stage / TORUS_STAGE_COUNT) * Math.PI * 2;
        for (let degree = 0; degree < DEGREE_NODE_COUNT; degree++) {
            const displayDegree = mod360(degree + tick);
            const theta = (displayDegree / DEGREE_NODE_COUNT) * Math.PI * 2;
            const tube = 0.28;
            const major = 1 + tube * Math.cos(phi);
            positions.push(
                Object.freeze({
                    stage,
                    degree,
                    displayDegree,
                    x: round4(major * Math.cos(theta)),
                    y: round4(major * Math.sin(theta)),
                    z: round4(tube * Math.sin(phi))
                })
            );
        }
    }
    return Object.freeze(positions);
}

function buildLensSectors(activeDegree: number): readonly CosmicClockLensSector[] {
    const sectorSize = 360 / LENS_SECTOR_COUNT;
    return Object.freeze(
        Array.from({ length: LENS_SECTOR_COUNT }, (_, index) => {
            const startDegree = index * sectorSize;
            const endDegree = startDegree + sectorSize;
            return Object.freeze({
                index,
                startDegree,
                endDegree,
                active: activeDegree >= startDegree && activeDegree < endDegree
            });
        })
    );
}

function pointOnCircle(angleDeg: number, radius: number): CosmicClockPoint {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return Object.freeze({
        x: round2(CENTER + radius * Math.cos(rad)),
        y: round2(CENTER + radius * Math.sin(rad))
    });
}

function arcPath(from: CosmicClockPoint, to: CosmicClockPoint, radius: number): string {
    return `M ${fmt(from.x)} ${fmt(from.y)} A ${radius} ${radius} 0 0 1 ${fmt(to.x)} ${fmt(to.y)}`;
}

function sectorPath(startDegree: number, endDegree: number, innerRadius: number, outerRadius: number): string {
    const outerStart = pointOnCircle(startDegree, outerRadius);
    const outerEnd = pointOnCircle(endDegree, outerRadius);
    const innerEnd = pointOnCircle(endDegree, innerRadius);
    const innerStart = pointOnCircle(startDegree, innerRadius);
    const largeArc = endDegree - startDegree > 180 ? 1 : 0;
    return [
        `M ${fmt(outerStart.x)} ${fmt(outerStart.y)}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${fmt(outerEnd.x)} ${fmt(outerEnd.y)}`,
        `L ${fmt(innerEnd.x)} ${fmt(innerEnd.y)}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${fmt(innerStart.x)} ${fmt(innerStart.y)}`,
        'Z'
    ].join(' ');
}

function nodeAngleDeg(node: number): number {
    return mod360((lineNode(node) / LINE_CHANGE_NODE_COUNT) * 360);
}

function angularDistance(a: number, b: number): number {
    const diff = Math.abs(mod360(a) - mod360(b));
    return Math.min(diff, 360 - diff);
}

function lineNode(value: number): number {
    return ((clampInteger(value, 0) % LINE_CHANGE_NODE_COUNT) + LINE_CHANGE_NODE_COUNT) % LINE_CHANGE_NODE_COUNT;
}

function ringIndex(value: number): 0 | 1 | 2 | 3 {
    const index = clampInteger(value, 0);
    return Math.min(3, Math.max(0, index)) as 0 | 1 | 2 | 3;
}

function positiveWeight(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

function clampInteger(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback;
}

function arrayValue<T>(value: readonly T[] | undefined): readonly T[] {
    return Array.isArray(value) ? value : Object.freeze([]);
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mod360(value: number): number {
    return ((value % 360) + 360) % 360;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function round4(value: number): number {
    return Math.round(value * 10000) / 10000;
}

function fmt(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
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

const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid currentColor',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};

const svgStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    height: 'auto',
    display: 'block',
    margin: '0 auto'
};

const modePanelStyle: React.CSSProperties = {
    display: 'grid',
    justifyItems: 'center',
    gap: 8
};

const brailleFallbackStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    letterSpacing: 0,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};
