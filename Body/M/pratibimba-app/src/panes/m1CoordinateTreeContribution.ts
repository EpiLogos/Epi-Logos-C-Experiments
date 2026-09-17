/**
 * Coordinate: M' M1' (Coordinate Tree contribution - Track 22.T22.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position: #1 (M1' Paramaśiva)
 * Actualises: the typed M1 subtree consumed by the carrier's Coordinate Tree
 *   host: six strata, six Ananda matrix families, twelve Spanda tick positions,
 *   and three M1-5' topology constants. Activating a node publishes its
 *   coordinate to the one shared coordinate store and returns the surface/deep
 *   link the host must open.
 * Public surface: M1CoordinateTreeNode, M1CoordinateTreeContribution,
 *   M1CoordinateTreeActivation, M1_COORDINATE_TREE_CONTRIBUTION,
 *   findM1CoordinateTreeNode, activateM1CoordinateTreeNode.
 * Does NOT own: the generic Coordinate Tree pane (28.6), flexlayout selection,
 *   M1 domain law, profile state, graph traversal, or played-torus rendering.
 * Contract: [[M1'-SPEC]]; [[M1-2-ANANDA-VORTEX-ARCHITECTURE]];
 *   [[M1-3-SPANDA-TRANSPORT-ARCHITECTURE]]; Track 22.T22.11.
 *
 * Ported from the frozen warehouse:
 * Body/M/epi-theia/extensions/m1-paramasiva/src/browser/
 * m1-coordinate-tree-contribution.ts. Theia DI was shed; the manifest now
 * speaks the active carrier's surface ids and shared coordinate store.
 */

import { useCoordinateStore } from '../state/stores';

export type M1CoordinateTreeSurfaceId = 'walk' | 'm1PlayedTorus';

export interface M1CoordinateTreeNode {
    readonly coordinate: string;
    readonly label: string;
    readonly deepLink: string;
    readonly surfaceId: M1CoordinateTreeSurfaceId;
    readonly children?: readonly M1CoordinateTreeNode[];
}

export interface M1CoordinateTreeContribution {
    readonly rootCoordinate: 'M1';
    readonly children: readonly M1CoordinateTreeNode[];
}

export interface M1CoordinateTreeActivation {
    readonly coordinate: string;
    readonly deepLink: string;
    readonly surfaceId: M1CoordinateTreeSurfaceId;
}

function encodedCoordinate(coordinate: string): string {
    // encodeURIComponent leaves apostrophes untouched; coordinate URIs require
    // the prime marker to be explicit so every host parses the same address.
    return encodeURIComponent(coordinate).replace(/'/g, '%27');
}

function walkLink(coordinate: string, query: Readonly<Record<string, string | number>> = {}): string {
    const params = new URLSearchParams({ coordinate: encodedCoordinate(coordinate) });
    for (const [key, value] of Object.entries(query)) {
        params.set(key, String(value));
    }
    // URLSearchParams would encode the percent signs in the already canonical
    // coordinate address. Restore those signs while retaining encoded slashes.
    return `epi-logos://ide/m1-paramasiva/walk?${params.toString().replace(/%25/g, '%')}`;
}

function node(
    coordinate: string,
    label: string,
    deepLink: string = walkLink(coordinate),
    surfaceId: M1CoordinateTreeSurfaceId = 'walk',
    children?: readonly M1CoordinateTreeNode[]
): M1CoordinateTreeNode {
    return Object.freeze({
        coordinate,
        label,
        deepLink,
        surfaceId,
        ...(children ? { children: Object.freeze(children) } : {})
    });
}

const matrixFamilies = [
    ['Bimba', 'Bimba matrix family (#X+0)'],
    ['Pratibimba', 'Pratibimba matrix family (#X+1)'],
    ['Sum', 'Sum matrix family'],
    ['DiffA', 'DiffA matrix family'],
    ['DiffB', 'DiffB matrix family'],
    ['Quintessence', 'Quintessence (rule/tuple)']
] as const;

const m1TwoChildren = matrixFamilies.map(([family, label], index) => {
    const coordinate = `M1-2'/${family}`;
    return node(
        coordinate,
        label,
        walkLink(coordinate, { view: 'vortexMatricesBrowser', family: index })
    );
});

const m1ThreeChildren = Array.from({ length: 12 }, (_, tick) => {
    const coordinate = `M1-3'/tick-${tick}`;
    return node(coordinate, `Tick ${tick} (${tick * 30}° SO(3))`, walkLink(coordinate, { scrubTo: tick }));
});

const m1FiveChildren = [
    node("M1-5'/TORUS_GENUS", 'TORUS_GENUS = 1'),
    node("M1-5'/DOUBLE_COVER_DEG", 'DOUBLE_COVER_DEG = 720'),
    node("M1-5'/RING_QUATERNION_LUT", 'RING_QUATERNION_LUT[12]')
] as const;

export const M1_COORDINATE_TREE_CONTRIBUTION: M1CoordinateTreeContribution = Object.freeze({
    rootCoordinate: 'M1',
    children: Object.freeze([
        node("M1-0'", "Canonical Source (M1-0')"),
        node("M1-1'", "Instance Manager (M1-1')"),
        node(
            "M1-2'",
            "Harmonic Engine - Ananda Vortex (M1-2')",
            walkLink("M1-2'", { view: 'vortexMatricesBrowser' }),
            'walk',
            m1TwoChildren
        ),
        node("M1-3'", "Spanda Core - 12-tick phase (M1-3')", undefined, 'walk', m1ThreeChildren),
        node("M1-4'", "QL Flowering - 84-state landscape (M1-4')"),
        node(
            "M1-5'",
            "Topology Analyzer - K² + Hopf (M1-5')",
            'epi-logos://ide/m1-paramasiva-played-torus/k2',
            'm1PlayedTorus',
            m1FiveChildren
        )
    ])
});

function walkNodes(nodes: readonly M1CoordinateTreeNode[]): M1CoordinateTreeNode[] {
    return nodes.flatMap(current => [current, ...(current.children ? walkNodes(current.children) : [])]);
}

const m1NodesByCoordinate = new Map(
    walkNodes(M1_COORDINATE_TREE_CONTRIBUTION.children).map(current => [current.coordinate, current])
);

export function findM1CoordinateTreeNode(coordinate: string): M1CoordinateTreeNode | null {
    return m1NodesByCoordinate.get(coordinate) ?? null;
}

/** Publish a real Coordinate Tree selection and tell the host which live M1
 * surface to open. Unknown coordinates fail closed rather than silently
 * selecting an address absent from this contribution. */
export function activateM1CoordinateTreeNode(coordinate: string): M1CoordinateTreeActivation {
    const selected = findM1CoordinateTreeNode(coordinate);
    if (!selected) {
        throw new Error(`unknown M1 Coordinate Tree node: ${coordinate}`);
    }
    useCoordinateStore.getState().setSelected(selected.coordinate);
    return Object.freeze({
        coordinate: selected.coordinate,
        deepLink: selected.deepLink,
        surfaceId: selected.surfaceId
    });
}
