/**
 * Coordinate: M' M0' (graph canvas behavioral gate — 28.T28.3b)
 * Residency: Body/M/pratibimba-app/src/panes/bimbaGraph
 * Actualises: the canvas is proven by MOUNTING it — the solar anchor's real
 *   SVG (anchor + orbiting neighbours, the DR-IG-1 dash grammar, keyboard and
 *   pointer activation, the three distinct empty states) and the full lattice's
 *   real hand-off to force-graph (the filtered set, and COPIES — force-graph
 *   mutates what it is handed and must never rewrite the pane's own links).
 * Does NOT own: the projection law (renderingMode.test.ts) or the graph read.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExplorerLink, ExplorerNode } from '../graphData';
import { GraphCanvas, type GraphCanvasProps } from './GraphCanvas';

const graphDataCalls: { nodes: unknown[]; links: unknown[] }[] = [];

vi.mock('force-graph', () => {
    class FakeForceGraph {
        graphData(data: { nodes: unknown[]; links: unknown[] }) {
            graphDataCalls.push(data);
            return this;
        }
        nodeId() {
            return this;
        }
        nodeLabel() {
            return this;
        }
        nodeColor() {
            return this;
        }
        nodeRelSize() {
            return this;
        }
        linkColor() {
            return this;
        }
        linkLineDash() {
            return this;
        }
        backgroundColor() {
            return this;
        }
        onNodeClick() {
            return this;
        }
        onLinkHover() {
            return this;
        }
        nodeVisibility() {
            return this;
        }
        _destructor() {}
    }
    return { default: FakeForceGraph };
});

function node(id: string, family = 'M'): ExplorerNode {
    return { id, label: `${id} label`, family };
}

function link(
    source: string,
    target: string,
    family: ExplorerLink['family'] = 'structural',
    type = 'POS5_INTEGRATES_INTO'
): ExplorerLink {
    return {
        source,
        target,
        type,
        family,
        familyProvenance: family === 'unclassified' ? 'absent' : 'graph'
    };
}

const NODES = [node('M0'), node('M1'), node('M2'), node('M3')];
const LINKS = [
    link('M0', 'M1', 'structural'),
    link('M0', 'M2', 'correspondential', 'RESONATES_WITH'),
    link('M3', 'M2', 'structural')
];

function canvas(overrides: Partial<GraphCanvasProps> = {}) {
    const props: GraphCanvasProps = {
        subgraph: { nodes: NODES, links: LINKS },
        renderingMode: 'solar-anchor',
        activeCoordinate: 'M0',
        relationFamilyFilter: 'all',
        onNodeClick: vi.fn(),
        onEdgeHover: vi.fn(),
        ...overrides
    };
    return { props, ...render(<GraphCanvas {...props} />) };
}

describe('28.T28.3(b) — GraphCanvas, solar anchor', () => {
    afterEach(cleanup);

    it('draws the anchor at the centre with its immediate neighbours around it', () => {
        canvas();
        const svg = screen.getByTestId('bimba-graph-canvas');
        expect(svg.getAttribute('data-rendering-mode')).toBe('solar-anchor');
        expect(svg.getAttribute('data-anchor-coordinate')).toBe('M0');
        expect(screen.getByTestId('bimba-graph-anchor-node').getAttribute('data-coordinate')).toBe('M0');
        expect(
            screen.getAllByTestId('bimba-graph-neighbour-node').map(el => el.getAttribute('data-coordinate'))
        ).toEqual(['M1', 'M2']);
    });

    it('dashes correspondential edges and leaves structural ones solid (DR-IG-1)', () => {
        canvas();
        expect(screen.getByTestId('bimba-edge-M1').getAttribute('stroke-dasharray')).toBeNull();
        expect(screen.getByTestId('bimba-edge-M2').getAttribute('stroke-dasharray')).toBe('6 5');
    });

    it('publishes a coordinate on click AND on keyboard activation — the preview navigates', () => {
        const onNodeClick = vi.fn();
        canvas({ onNodeClick });
        fireEvent.click(screen.getAllByTestId('bimba-graph-neighbour-node')[0]);
        expect(onNodeClick).toHaveBeenCalledWith('M1');
        fireEvent.keyDown(screen.getByTestId('bimba-graph-anchor-node'), { key: 'Enter' });
        expect(onNodeClick).toHaveBeenLastCalledWith('M0');
    });

    it('reports the hovered edge with its real relation type and family', () => {
        const onEdgeHover = vi.fn();
        canvas({ onEdgeHover });
        fireEvent.mouseEnter(screen.getByTestId('bimba-edge-M2'));
        expect(onEdgeHover).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'RESONATES_WITH', family: 'correspondential' })
        );
    });

    it('narrows to the active family, and says so in the caption', () => {
        canvas({ relationFamilyFilter: 'correspondential' });
        expect(
            screen.getAllByTestId('bimba-graph-neighbour-node').map(el => el.getAttribute('data-coordinate'))
        ).toEqual(['M2']);
        expect(screen.getByTestId('bimba-graph-canvas-caption').textContent).toContain(
            '1 immediate relations'
        );
    });

    it('says "none of family X in the loaded window" rather than rendering an empty card silently', () => {
        canvas({ activeCoordinate: 'M1', relationFamilyFilter: 'correspondential' });
        expect(screen.getByTestId('bimba-graph-canvas-caption').textContent).toContain(
            'none of family correspondential'
        );
    });

    it('distinguishes "nothing anchored" from "anchor off-window"', () => {
        const { unmount } = canvas({ activeCoordinate: null });
        const unanchored = screen.getByTestId('bimba-graph-canvas-empty');
        expect(unanchored.textContent).toContain('No coordinate anchored');
        expect(unanchored.getAttribute('data-anchor-off-window')).toBeNull();
        unmount();

        canvas({ activeCoordinate: 'M-not-loaded' });
        const offWindow = screen.getByTestId('bimba-graph-canvas-empty');
        expect(offWindow.getAttribute('data-anchor-off-window')).toBe('true');
        expect(offWindow.textContent).toContain('not in the loaded window');
    });
});

describe('28.T28.3(b) — GraphCanvas, full lattice', () => {
    beforeEach(() => {
        graphDataCalls.length = 0;
    });
    afterEach(cleanup);

    it('hands force-graph the whole loaded set, filtered by family', () => {
        canvas({ renderingMode: 'full-lattice', relationFamilyFilter: 'structural' });
        const host = screen.getByTestId('bimba-graph-canvas');
        expect(host.getAttribute('data-rendering-mode')).toBe('full-lattice');
        expect(host.getAttribute('data-node-count')).toBe('4');
        expect(host.getAttribute('data-edge-count')).toBe('2');
        expect(graphDataCalls).toHaveLength(1);
        expect(graphDataCalls[0].links).toHaveLength(2);
    });

    it('hands force-graph COPIES — the renderer mutates endpoints, the pane’s links must survive', () => {
        canvas({ renderingMode: 'full-lattice' });
        const handed = graphDataCalls[0];
        expect(handed.links[0]).not.toBe(LINKS[0]);
        expect(handed.nodes[0]).not.toBe(NODES[0]);
        // force-graph rewrites `source`/`target` in place; assert the original
        // set is untouched so the solar anchor and the counts still read strings.
        (handed.links[0] as ExplorerLink).source = { id: 'M0' } as unknown as string;
        expect(LINKS[0].source).toBe('M0');
    });
});
