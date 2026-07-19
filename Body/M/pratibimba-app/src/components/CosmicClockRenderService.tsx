/**
 * Coordinate: M' M3' (385-node cosmic-clock depth overlay)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): #2 depth overlay.
 * Actualises: the 360 degree nodes, 24 backend backbone nodes, and one
 *   Axis Mundi on the active M3 wheel for rerun tranche 24.T24.2.
 * Public surface: CosmicClockRenderService, buildCosmicClockRenderModel.
 * Does NOT own: clock cadence, backbone degrees, angular relations, hop law,
 *   lens law, or Three.js choreography.
 * Contract: [[M3'-SPEC]]; ported from frozen
 *   Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/CosmicClockRenderService.tsx.
 */

export type CosmicClockMode =
    | 'flat-clock-debug'
    | 'toroidal-world'
    | 'lens-annulus'
    | 'hopf-identity';

export interface CosmicClockAspectEdge {
    readonly kind: string;
    readonly fromDegree: number;
    readonly toDegree: number;
}

export interface CosmicClockHopEdge {
    readonly fromNode: number;
    readonly toNode: number;
    readonly line: number;
    readonly operator: string;
}

export interface CosmicClockRenderInput {
    readonly tick12: number | null;
    readonly degree720: number | null;
    readonly backboneDegrees: readonly number[];
    readonly mode: CosmicClockMode;
    readonly aspectEdges?: readonly CosmicClockAspectEdge[];
    readonly hopEdges?: readonly CosmicClockHopEdge[];
}

export interface CosmicClockRenderNode {
    readonly degree: number;
    readonly displayDegree: number;
    readonly active: boolean;
}

export interface CosmicClockBackboneNode {
    readonly index: number;
    readonly degree: number;
    readonly displayDegree: number;
    readonly ring: 0 | 1 | 2 | 3;
}

export interface CosmicClockRenderModel {
    readonly mode: CosmicClockMode;
    readonly tick12: number | null;
    readonly activeDegree: number | null;
    readonly degreeNodes: readonly CosmicClockRenderNode[];
    readonly aminoBackbone: readonly CosmicClockBackboneNode[];
    readonly axisMundi: { readonly id: 'axis-mundi'; readonly state: 'ready' };
    readonly aspectEdges: readonly CosmicClockAspectEdge[];
    readonly hopEdges: readonly CosmicClockHopEdge[];
    readonly pendingFields: readonly string[];
    readonly nodeCount: 385;
}

interface CosmicClockRenderServiceProps {
    readonly model: CosmicClockRenderModel;
    readonly center: number;
    readonly size: number;
}

const DEGREE_NODE_COUNT = 360;
const BACKBONE_NODE_COUNT = 24;
const COSMIC_CLOCK_NODE_COUNT = 385 as const;

function mod(value: number, modulus: number): number {
    return ((value % modulus) + modulus) % modulus;
}

function point(
    center: number,
    radius: number,
    degree: number
): readonly [number, number] {
    const angle = ((degree - 90) * Math.PI) / 180;
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
}

function isBackboneDegree(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value < 360;
}

export function buildCosmicClockRenderModel(
    input: CosmicClockRenderInput
): CosmicClockRenderModel {
    if (
        input.backboneDegrees.length !== BACKBONE_NODE_COUNT ||
        !input.backboneDegrees.every(isBackboneDegree)
    ) {
        throw new Error('CosmicClockRenderService requires 24 backend backbone degrees');
    }

    const shift = input.tick12 === null ? 0 : mod(input.tick12, 12);
    const activeDegree =
        input.degree720 === null ? null : mod(input.degree720 / 2 + shift, 360);
    const degreeNodes = Object.freeze(
        Array.from({ length: DEGREE_NODE_COUNT }, (_, degree) => {
            const displayDegree = mod(degree + shift, 360);
            return Object.freeze({
                degree,
                displayDegree,
                active:
                    activeDegree !== null &&
                    Math.abs(displayDegree - activeDegree) < 0.5
            });
        })
    );
    const aminoBackbone = Object.freeze(
        input.backboneDegrees.map((degree, index) =>
            Object.freeze({
                index,
                degree,
                displayDegree: mod(degree + shift, 360),
                ring: Math.floor(index / 6) as 0 | 1 | 2 | 3
            })
        )
    );
    const aspectEdges = Object.freeze([...(input.aspectEdges ?? [])]);
    const hopEdges = Object.freeze([...(input.hopEdges ?? [])]);
    const pendingFields = Object.freeze([
        ...(input.degree720 === null ? ['pending-profile-field:degree720'] : []),
        ...(aspectEdges.length === 0
            ? ['pending-profile-field:cosmicClock.aspectEdges']
            : []),
        ...(hopEdges.length === 0
            ? ['pending-profile-field:cosmicClock.hopEdges']
            : [])
    ]);

    return Object.freeze({
        mode: input.mode,
        tick12: input.tick12,
        activeDegree,
        degreeNodes,
        aminoBackbone,
        axisMundi: Object.freeze({ id: 'axis-mundi', state: 'ready' as const }),
        aspectEdges,
        hopEdges,
        pendingFields,
        nodeCount: COSMIC_CLOCK_NODE_COUNT
    });
}

export function CosmicClockRenderService({
    model,
    center,
    size
}: CosmicClockRenderServiceProps) {
    const degreeRadius = size * 0.355;
    const backboneRadii = [0.14, 0.18, 0.22, 0.26].map(scale => size * scale);
    const edgeRadius = size * 0.31;

    return (
        <g
            data-testid="m3-cosmic-clock-depth-overlay"
            data-mode={model.mode}
            data-node-count={model.nodeCount}
            data-profile-tick={model.tick12 ?? 'pending'}
            data-active-degree={model.activeDegree ?? 'pending'}
        >
            <g data-testid="m3-clock-aspect-edges" data-state={
                model.aspectEdges.length === 0
                    ? 'pending-profile-field:cosmicClock.aspectEdges'
                    : 'ready'
            }>
                {model.aspectEdges.map((edge, index) => {
                    const from = point(center, edgeRadius, edge.fromDegree);
                    const to = point(center, edgeRadius, edge.toDegree);
                    return (
                        <line
                            key={`${edge.kind}-${index}`}
                            data-testid={`m3-clock-aspect-edge-${index}`}
                            data-kind={edge.kind}
                            x1={from[0]}
                            y1={from[1]}
                            x2={to[0]}
                            y2={to[1]}
                            className="m3-clock-aspect-edge"
                        />
                    );
                })}
            </g>

            <g data-testid="m3-clock-hop-edges" data-state={
                model.hopEdges.length === 0
                    ? 'pending-profile-field:cosmicClock.hopEdges'
                    : 'ready'
            }>
                {model.hopEdges.map((edge, index) => {
                    const from = point(center, edgeRadius, (edge.fromNode / 384) * 360);
                    const to = point(center, edgeRadius, (edge.toNode / 384) * 360);
                    return (
                        <line
                            key={`${edge.fromNode}-${edge.toNode}-${index}`}
                            data-testid={`m3-clock-hop-edge-${index}`}
                            data-line={edge.line}
                            data-operator={edge.operator}
                            x1={from[0]}
                            y1={from[1]}
                            x2={to[0]}
                            y2={to[1]}
                            className="m3-clock-hop-edge"
                        />
                    );
                })}
            </g>

            <g aria-label="360 profile-tick degree nodes">
                {model.degreeNodes.map(node => {
                    const [cx, cy] = point(center, degreeRadius, node.displayDegree);
                    return (
                        <circle
                            key={node.degree}
                            data-testid={`m3-clock-degree-${node.degree}`}
                            data-degree={node.degree}
                            data-display-degree={node.displayDegree}
                            data-active={node.active ? 'true' : 'false'}
                            cx={cx}
                            cy={cy}
                            r={node.active ? size * 0.008 : size * 0.0022}
                            className={
                                node.active
                                    ? 'm3-clock-degree-node m3-clock-degree-node-active'
                                    : 'm3-clock-degree-node'
                            }
                        />
                    );
                })}
            </g>

            <g aria-label="24 backend backbone nodes">
                {model.aminoBackbone.map(node => {
                    const [cx, cy] = point(
                        center,
                        backboneRadii[node.ring],
                        node.displayDegree
                    );
                    return (
                        <circle
                            key={node.index}
                            data-testid={`m3-clock-amino-${node.index}`}
                            data-degree={node.degree}
                            data-display-degree={node.displayDegree}
                            data-ring={node.ring}
                            cx={cx}
                            cy={cy}
                            r={size * 0.005}
                            className="m3-clock-amino-node"
                        />
                    );
                })}
            </g>

            <circle
                data-testid="m3-clock-axis-mundi"
                cx={center}
                cy={center}
                r={size * 0.035}
                className="m3-clock-axis-mundi"
            />
        </g>
    );
}
