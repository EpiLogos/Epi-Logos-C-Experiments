import * as React from 'react';
import type {
    BimbaGraphNodePayload,
    BimbaSubgraphPayload
} from '../../common/graph-types';

export type RenderingMode = 'solar-anchor' | 'full-lattice';
export type RelationFamilyFilterValue = 'all' | 'structural' | 'correspondential';
export type BimbaRelationFamily = 'structural' | 'correspondential';

export interface BimbaEdge {
    readonly sourceCoordinate: string;
    readonly targetCoordinate: string;
    readonly relationType: string;
    readonly relationFamily: BimbaRelationFamily;
    readonly raw: unknown;
}

export interface GraphCanvasProps {
    readonly subgraph: BimbaSubgraphPayload;
    readonly renderingMode: 'solar-anchor'|'full-lattice';
    readonly activeCoordinate: string|null;
    readonly relationFamilyFilter: 'all'|'structural'|'correspondential';
    readonly onNodeClick: (coordinate: string) => void;
    readonly onEdgeHover: (edge: BimbaEdge) => void;
}

interface PlacedNode {
    readonly coordinate: string;
    readonly label: string;
    readonly namespace: string;
    readonly color: string;
    readonly x: number;
    readonly y: number;
    readonly active: boolean;
    readonly raw: BimbaGraphNodePayload | null;
}

const SVG_WIDTH = 520;
const SVG_HEIGHT = 320;
const SVG_CENTER_X = SVG_WIDTH / 2;
const SVG_CENTER_Y = SVG_HEIGHT / 2;

const FAMILY_COLOURS: Readonly<Record<string, string>> = Object.freeze({
    P: '#7c3aed',
    S: '#2563eb',
    T: '#0891b2',
    M: '#059669',
    L: '#d97706',
    C: '#dc2626',
    Empty: '#64748b',
    Pratibimba: '#db2777',
    default: '#475569'
});

export const GraphCanvas: React.FC<GraphCanvasProps> = props => {
    const center = normalizeNode(props.subgraph.node, props.activeCoordinate, true);
    const immediateNeighbors = props.subgraph.neighbors
        .map((neighbor, index) => normalizeNode(neighbor, `neighbor-${index}`, false))
        .filter((node): node is PlacedNode => node !== null);
    const visibleNeighbors =
        props.renderingMode === 'solar-anchor'
            ? immediateNeighbors.filter(isBimbaSideNode).slice(0, 6)
            : immediateNeighbors;
    const nodes = center ? [center, ...visibleNeighbors] : visibleNeighbors;
    const edges = buildEdges(
        props.subgraph.node,
        visibleNeighbors,
        props.activeCoordinate,
        props.relationFamilyFilter
    );

    if (nodes.length === 0) {
        return (
            <div className="bimba-graph-canvas-empty" data-test="bimba-graph-canvas-empty">
                Awaiting graph payload
            </div>
        );
    }

    const placedNodes = placeNodes(nodes, props.renderingMode);
    const placedByCoordinate = new Map(placedNodes.map(node => [node.coordinate, node]));

    return (
        <svg
            className={`bimba-graph-canvas bimba-graph-canvas-${props.renderingMode}`}
            data-test="bimba-graph-canvas"
            data-rendering-mode={props.renderingMode}
            data-relation-family-filter={props.relationFamilyFilter}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            role="img"
            aria-label={`Bimba graph ${props.renderingMode}`}
        >
            <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} rx="8" fill="#0f172a" opacity="0.04" />
            {edges.map(edge => {
                const source = placedByCoordinate.get(edge.sourceCoordinate) ?? placedByCoordinate.get(center?.coordinate ?? '');
                const target = placedByCoordinate.get(edge.targetCoordinate);
                if (!source || !target) {
                    return null;
                }
                return (
                    <g key={`${edge.sourceCoordinate}-${edge.targetCoordinate}-${edge.relationType}`}>
                        <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={edge.relationFamily === 'correspondential' ? '#d97706' : '#475569'}
                            strokeWidth={edge.relationFamily === 'correspondential' ? 1.75 : 2}
                            strokeDasharray={edge.relationFamily === 'correspondential' ? '6 5' : undefined}
                            opacity={0.74}
                            data-test={`bimba-edge-${edge.relationFamily}`}
                            data-relation-family={edge.relationFamily}
                            data-relation-type={edge.relationType}
                            onMouseEnter={() => props.onEdgeHover(edge)}
                            onFocus={() => props.onEdgeHover(edge)}
                        />
                        <title>{`${edge.relationType} (${edge.relationFamily})`}</title>
                    </g>
                );
            })}
            {placedNodes.map(node => (
                <g
                    key={node.coordinate}
                    className={node.active ? 'bimba-graph-node-active' : 'bimba-graph-node'}
                    data-test={node.active ? 'bimba-graph-active-node' : 'bimba-graph-neighbor-node'}
                    data-coordinate={node.coordinate}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open coordinate ${node.coordinate}`}
                    onClick={() => props.onNodeClick(node.coordinate)}
                    onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            props.onNodeClick(node.coordinate);
                        }
                    }}
                >
                    <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.active ? 26 : 16}
                        fill={node.color}
                        stroke={node.active ? '#111827' : '#ffffff'}
                        strokeWidth={node.active ? 2.5 : 2}
                        opacity={node.active ? 0.96 : 0.88}
                    />
                    {node.active && props.renderingMode === 'solar-anchor' && (
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={36}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth={1.5}
                            opacity={0.45}
                        />
                    )}
                    <text
                        x={node.x}
                        y={node.y + (node.active ? 43 : 31)}
                        textAnchor="middle"
                        fontSize={node.active ? 12 : 10}
                        fontFamily="var(--theia-ui-font-family, sans-serif)"
                        fill="#111827"
                    >
                        {shortLabel(node)}
                    </text>
                    <title>{`${node.label} (${node.coordinate})`}</title>
                </g>
            ))}
        </svg>
    );
};

function normalizeNode(
    node: BimbaGraphNodePayload | null,
    fallbackCoordinate: string | null,
    active: boolean
): PlacedNode | null {
    const coordinate = readString(node, 'coordinate') ?? fallbackCoordinate;
    if (!coordinate) {
        return null;
    }
    const namespace = readString(node, 'namespace') ?? '';
    const label = readString(node, 'label') ?? coordinate;
    return {
        coordinate,
        label,
        namespace,
        color: colorForNode(coordinate, namespace),
        x: SVG_CENTER_X,
        y: SVG_CENTER_Y,
        active,
        raw: node
    };
}

function placeNodes(nodes: readonly PlacedNode[], renderingMode: RenderingMode): readonly PlacedNode[] {
    const [center, ...neighbors] = nodes;
    if (!center) {
        return [];
    }
    const radius = renderingMode === 'solar-anchor' ? 92 : 118;
    const placedCenter = {
        ...center,
        x: SVG_CENTER_X,
        y: SVG_CENTER_Y
    };
    const placedNeighbors = neighbors.map((node, index) => {
        const theta = eigenvalueAngle(index, Math.max(neighbors.length, 1), renderingMode);
        const eigenvalue = 1 + ((index % 3) * 0.12);
        return {
            ...node,
            x: SVG_CENTER_X + Math.cos(theta) * radius * eigenvalue,
            y: SVG_CENTER_Y + Math.sin(theta) * (radius * 0.72) * eigenvalue
        };
    });
    return [placedCenter, ...placedNeighbors];
}

function eigenvalueAngle(index: number, total: number, renderingMode: RenderingMode): number {
    if (renderingMode === 'solar-anchor') {
        return (Math.PI * 2 * index) / Math.max(total, 1) - Math.PI / 2;
    }
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return index * goldenAngle - Math.PI / 2;
}

function buildEdges(
    activeNode: BimbaGraphNodePayload | null,
    neighbors: readonly PlacedNode[],
    activeCoordinate: string | null,
    relationFamilyFilter: RelationFamilyFilterValue
): readonly BimbaEdge[] {
    const sourceCoordinate = readString(activeNode, 'coordinate') ?? activeCoordinate ?? 'active-coordinate';
    return neighbors
        .map(neighbor => {
            const raw = neighbor.raw && isRecord(neighbor.raw) ? neighbor.raw : {};
            const relationFamily = readRelationFamily(raw);
            return {
                sourceCoordinate,
                targetCoordinate: neighbor.coordinate,
                relationType: readString(raw, 'relationType') ??
                    readString(raw, 'relation_type') ??
                    readString(raw, 'type') ??
                    'RELATED_TO',
                relationFamily,
                raw
            };
        })
        .filter(edge =>
            relationFamilyFilter === 'all' || edge.relationFamily === relationFamilyFilter
        );
}

function readRelationFamily(record: Record<string, unknown>): BimbaRelationFamily {
    const properties = isRecord(record.properties) ? record.properties : null;
    const direct = readString(record, 'c_1_relation_family') ??
        readString(record, 'relationFamily') ??
        readString(record, 'family') ??
        (properties ? readString(properties, 'c_1_relation_family') : null);
    return direct === 'correspondential' ? 'correspondential' : 'structural';
}

function colorForNode(coordinate: string, namespace: string): string {
    const lowerNamespace = namespace.toLowerCase();
    if (lowerNamespace.includes('empty')) {
        return FAMILY_COLOURS.Empty;
    }
    if (lowerNamespace.includes('pratibimba')) {
        return FAMILY_COLOURS.Pratibimba;
    }
    const first = coordinate.trim().charAt(0).toUpperCase();
    return FAMILY_COLOURS[first] ?? FAMILY_COLOURS.default;
}

function isBimbaSideNode(node: PlacedNode): boolean {
    const ns = node.namespace.toLowerCase();
    return ns === '' || ns.includes('bimba') || (!ns.includes('pratibimba') && !ns.includes('empty'));
}

function shortLabel(node: PlacedNode): string {
    const text = node.label || node.coordinate;
    if (text.length <= 18) {
        return text;
    }
    return `${text.slice(0, 15)}...`;
}

function readString(record: unknown, key: string): string | null {
    if (!isRecord(record)) {
        return null;
    }
    const value = record[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
