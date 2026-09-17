/**
 * Coordinate: M' M0' (Bimba graph explorer behavioral gate — 28.T28.3 a/d/e)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the three pane-level laws of 28.3 that only a mounted pane can
 *   prove — (a) the ACTIVE LAYOUT chooses the rendering mode, (d) a node click
 *   publishes the coordinate to the ONE shared store every M0'/M1' subscriber
 *   reads, and (e) a receipt whose privacy class the CHROME-CONTRACT §7 gate
 *   refuses NEVER reaches the render tree, is counted in the federated
 *   PrivacyDropFeed, and shows that count as chrome.
 *   Every case drives the real component against the real stores; the gateway
 *   is the only stub, and it returns the real `s2.graph.query` row shape.
 * Does NOT own: the projection law (bimbaGraph/renderingMode.test.ts), the
 *   drawing (bimbaGraph/GraphCanvas.test.tsx), or the drop sink's own contract
 *   (services/privacyDropFeed.test.ts).
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { PrivacyDropFeed } from '../services/privacyDropFeed';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { BIMBA_GRAPH_SURFACE_ID, GraphExplorerPane } from './GraphExplorerPane';
import { M0SurfaceProvider } from './M0SurfaceContext';
import { DEFAULT_M0_SURFACE_STATE } from './m0SurfaceState';

vi.mock('force-graph', () => {
    class FakeForceGraph {
        graphData() {
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

/** The real `s2.graph.query` envelope: `{columns, rowCount, rows}` per row set. */
function connectGraphGateway(privacyClass = 'public') {
    const invoke = vi.fn(async (_method: string, params: Record<string, unknown>) => {
        const cypher = String(params.cypher ?? '');
        const rows = cypher.includes('MATCH (a:Bimba)')
            ? [
                  {
                      source: 'M0',
                      target: 'M1',
                      type: 'POS5_INTEGRATES_INTO',
                      c_1_relation_family: 'structural'
                  },
                  {
                      source: 'M0',
                      target: 'M2',
                      type: 'RESONATES_WITH',
                      c_1_relation_family: 'correspondential'
                  }
              ]
            : [
                  { coordinate: 'M0', label: 'Anuttara' },
                  { coordinate: 'M1', label: 'Paramasiva' },
                  { coordinate: 'M2', label: 'Parashakti' }
              ];
        return {
            privacyClass,
            artifact: { columns: Object.keys(rows[0]), rowCount: rows.length, rows }
        };
    });
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
    return invoke;
}

function mount(props: Parameters<typeof GraphExplorerPane>[0] = {}) {
    return render(
        <M0SurfaceProvider state={DEFAULT_M0_SURFACE_STATE} update={() => {}}>
            <GraphExplorerPane {...props} />
        </M0SurfaceProvider>
    );
}

describe('28.T28.3 — GraphExplorerPane', () => {
    beforeEach(() => {
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
        setGateway(null);
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
        useCoordinateStore.setState({ selected: null });
        useProvenanceStore.setState({ connection: { ...DEFAULT_CONNECTION_STATUS } });
    });

    it('(a) previews the solar anchor in the daily layout', async () => {
        connectGraphGateway();
        useCoordinateStore.setState({ selected: 'M0' });
        mount({ activeLayout: 'daily-0-1' });

        await waitFor(() =>
            expect(screen.getByTestId('bimba-graph-canvas').getAttribute('data-rendering-mode')).toBe(
                'solar-anchor'
            )
        );
        expect(screen.getByTestId('graph-explorer').getAttribute('data-rendering-mode')).toBe(
            'solar-anchor'
        );
        expect(screen.getByTestId('bimba-graph-anchor-node').getAttribute('data-coordinate')).toBe('M0');
    });

    it('(a) renders the full lattice in the deep layout, over the same read', async () => {
        connectGraphGateway();
        useCoordinateStore.setState({ selected: 'M0' });
        mount({ activeLayout: 'ide-deep' });

        await waitFor(() =>
            expect(screen.getByTestId('bimba-graph-canvas').getAttribute('data-rendering-mode')).toBe(
                'full-lattice'
            )
        );
        const host = screen.getByTestId('bimba-graph-canvas');
        expect(host.getAttribute('data-node-count')).toBe('3');
        expect(host.getAttribute('data-edge-count')).toBe('2');
    });

    it('(d) a node click publishes the coordinate to the one shared store', async () => {
        connectGraphGateway();
        useCoordinateStore.setState({ selected: 'M0' });
        mount({ activeLayout: 'daily-0-1' });

        await waitFor(() => expect(screen.getAllByTestId('bimba-graph-neighbour-node').length).toBe(2));
        fireEvent.click(screen.getAllByTestId('bimba-graph-neighbour-node')[0]);
        expect(useCoordinateStore.getState().selected).toBe('M1');
        // and the anchor follows the store — the click IS navigation
        await waitFor(() =>
            expect(screen.getByTestId('bimba-graph-canvas').getAttribute('data-anchor-coordinate')).toBe(
                'M1'
            )
        );
    });

    it('(e) refuses a forbidden privacy class: nothing renders, the drop is counted and shown', async () => {
        connectGraphGateway('private-journal');
        const feed = new PrivacyDropFeed();
        useCoordinateStore.setState({ selected: 'M0' });
        mount({ activeLayout: 'daily-0-1', privacyDropFeed: feed });

        await waitFor(() => expect(screen.getByTestId('graph-privacy-refused')).toBeTruthy());
        expect(screen.getByTestId('graph-privacy-refused').textContent).toContain('private-journal');
        // the map itself never reached the render tree
        expect(screen.queryByTestId('bimba-graph-canvas')).toBeNull();
        expect(screen.queryByTestId('bimba-graph-anchor-node')).toBeNull();
        // the drop is federated (28.16) and visible as chrome
        expect(feed.aggregate.byWidget[BIMBA_GRAPH_SURFACE_ID]).toBe(1);
        expect(feed.aggregate.byClass['private-journal']).toBe(1);
        expect(screen.getByTestId('graph-privacy-dropped').textContent).toContain('1 privacy-dropped');
        expect(screen.getByTestId('graph-explorer').getAttribute('data-privacy-dropped')).toBe('1');
    });

    it('(e) wears the per-binding bridge-gate readiness for its own s2 binding', async () => {
        connectGraphGateway();
        mount({ activeLayout: 'daily-0-1' });
        await waitFor(() =>
            expect(document.querySelector('[data-binding="s2.graph.node"]')).not.toBeNull()
        );
        const badge = document.querySelector('[data-binding="s2.graph.node"]')!;
        // the readiness id is rendered at the datum, never in a separate panel
        expect(badge.getAttribute('data-readiness')).toBeTruthy();
    });

    it('(e) renders normally for an allowed class, and records no drop', async () => {
        connectGraphGateway('public_current_with_graph_provenance');
        const feed = new PrivacyDropFeed();
        useCoordinateStore.setState({ selected: 'M0' });
        mount({ activeLayout: 'daily-0-1', privacyDropFeed: feed });

        await waitFor(() => expect(screen.getByTestId('bimba-graph-canvas')).toBeTruthy());
        expect(feed.aggregate.total).toBe(0);
        expect(screen.queryByTestId('graph-privacy-dropped')).toBeNull();
    });
});
