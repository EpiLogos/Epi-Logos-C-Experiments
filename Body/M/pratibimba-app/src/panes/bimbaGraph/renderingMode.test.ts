/**
 * Coordinate: M' M0' (rendering-mode + solar-anchor projection law — 28.T28.3a)
 * Residency: Body/M/pratibimba-app/src/panes/bimbaGraph
 * Actualises: the two laws the canvas depends on and cannot restate — which
 *   mode a layout selects, and what the solar anchor is allowed to claim it is
 *   showing (the ≤6 cap with its honest total, the family filter, the dedupe,
 *   and the off-window anchor that must NOT read as "no relations").
 * Does NOT own: the drawing (GraphCanvas.tsx) or the edge classification
 *   (m0RelationFamily.ts).
 */

import { describe, expect, it } from 'vitest';
import type { ExplorerLink, ExplorerNode } from '../graphData';
import {
    linkEndpointId,
    renderingModeForLayout,
    solarAnchorProjection,
    SOLAR_ANCHOR_MAX_NEIGHBOURS
} from './renderingMode';

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

describe('28.T28.3(a) — the layout selects the rendering mode', () => {
    it('renders the full lattice in the deep layout and the solar anchor everywhere else', () => {
        expect(renderingModeForLayout('ide-deep')).toBe('full-lattice');
        expect(renderingModeForLayout('daily-0-1')).toBe('solar-anchor');
    });

    it('falls back to the preview mode for an unset or unknown layout', () => {
        expect(renderingModeForLayout(null)).toBe('solar-anchor');
        expect(renderingModeForLayout(undefined)).toBe('solar-anchor');
        expect(renderingModeForLayout('some-future-layout')).toBe('solar-anchor');
    });
});

describe('linkEndpointId', () => {
    it('reads a string endpoint and a force-graph-mutated object endpoint alike', () => {
        expect(linkEndpointId('M0-2')).toBe('M0-2');
        expect(linkEndpointId({ id: 'M0-2', family: 'M' })).toBe('M0-2');
        expect(linkEndpointId(null)).toBeNull();
        expect(linkEndpointId({ nope: 1 })).toBeNull();
    });
});

describe('28.T28.3(a) — the solar-anchor projection', () => {
    const nodes = [node('M0'), node('M1'), node('M2'), node('M3'), node('M4'), node('M5'), node('M0-1')];

    it('has no anchor at all when nothing is selected', () => {
        const projection = solarAnchorProjection(nodes, [link('M0', 'M1')], null, 'all');
        expect(projection.anchor).toBeNull();
        expect(projection.anchorOffWindow).toBe(false);
        expect(projection.neighbours).toEqual([]);
    });

    it('reports an anchor the loaded window does not contain as OFF-WINDOW, not as empty', () => {
        const projection = solarAnchorProjection(nodes, [link('M0', 'M1')], 'M9-not-loaded', 'all');
        expect(projection.anchor).toBeNull();
        expect(projection.anchorOffWindow).toBe(true);
        expect(projection.anchorCoordinate).toBe('M9-not-loaded');
    });

    it('gathers both directions and records which way each edge points', () => {
        const projection = solarAnchorProjection(
            nodes,
            [link('M0', 'M1'), link('M2', 'M0')],
            'M0',
            'all'
        );
        expect(projection.neighbours.map(n => [n.node.id, n.direction])).toEqual([
            ['M1', 'out'],
            ['M2', 'in']
        ]);
    });

    it('caps the rendered neighbours at six but reports the honest total', () => {
        const many = ['M1', 'M2', 'M3', 'M4', 'M5', 'M0-1'].map(target => link('M0', target));
        // a seventh neighbour that is in the node set only via a second edge
        const extra = [...many, link('M0', 'M1', 'correspondential', 'RESONATES_WITH')];
        const projection = solarAnchorProjection(nodes, extra, 'M0', 'all');
        expect(projection.neighbours).toHaveLength(SOLAR_ANCHOR_MAX_NEIGHBOURS);
        // M1 appeared twice; the projection dedupes by coordinate, so the total
        // is 6 distinct neighbours, not 7 edges.
        expect(projection.neighbourTotal).toBe(6);
    });

    it('narrows by relation family, and `all` keeps the unclassified edges', () => {
        const links = [
            link('M0', 'M1', 'structural'),
            link('M0', 'M2', 'correspondential'),
            link('M0', 'M3', 'unclassified')
        ];
        expect(solarAnchorProjection(nodes, links, 'M0', 'all').neighbours.map(n => n.node.id)).toEqual([
            'M1',
            'M2',
            'M3'
        ]);
        expect(
            solarAnchorProjection(nodes, links, 'M0', 'structural').neighbours.map(n => n.node.id)
        ).toEqual(['M1']);
        expect(
            solarAnchorProjection(nodes, links, 'M0', 'correspondential').neighbours.map(n => n.node.id)
        ).toEqual(['M2']);
    });

    it('ignores edges whose other endpoint is not a loaded node, and self-edges', () => {
        const links = [link('M0', 'M-absent'), link('M0', 'M0'), link('M0', 'M1')];
        const projection = solarAnchorProjection(nodes, links, 'M0', 'all');
        expect(projection.neighbours.map(n => n.node.id)).toEqual(['M1']);
        expect(projection.neighbourTotal).toBe(1);
    });

    it('reads endpoints force-graph has already mutated into node objects', () => {
        const mutated = {
            ...link('M0', 'M1'),
            source: { id: 'M0' } as unknown as string,
            target: { id: 'M1' } as unknown as string
        };
        const projection = solarAnchorProjection(nodes, [mutated], 'M0', 'all');
        expect(projection.neighbours.map(n => n.node.id)).toEqual(['M1']);
    });
});
