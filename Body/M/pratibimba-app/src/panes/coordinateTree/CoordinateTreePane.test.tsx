/**
 * Coordinate: M' M0' chrome (Coordinate Tree render proof — 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree
 * Actualises: the three things the tranche is named for, proved against the
 *   REAL component, the REAL stores and the REAL `s2.graph.query` envelope
 *   (`{contract, columns, rowCount, rows}` — the shape `GraphMethodService::query`
 *   really returns). The gateway is the only stub, and its call log is itself
 *   an assertion.
 *
 *     (a) FAMILY COLOURING reaches the DOM — each rendered row carries exactly
 *         one `coordinate-family-*` class, the namespace class only where the
 *         graph really answered with an `s_1_vault_path`, the receipt privacy
 *         class on every row, and the theme-resolved hue as the inline tint.
 *     (b) ACTIVE-COORDINATE HIGHLIGHT is a subscription AND a publication: a
 *         coordinate published by any other surface highlights the matching row
 *         with no interaction here, and a click here writes the ONE shared
 *         store. The two halves are 15-foundation principle 1 / 21-m0 SC-5.
 *     (b′) …and the pane PUBLISHES NOTHING ON MOUNT. This is 52.T4's live defect
 *         in one assertion: entering the deep layout mounts every opening rail
 *         tab on the hidden face too, and a coordinate tree is precisely the
 *         surface that would otherwise seize the shared coordinate on arrival.
 *         The mount is driven to completion — gateway read resolved, rows on
 *         screen — and the shared store is still exactly what the other surface
 *         left there.
 *     (c) CRUD-vs-GOVERNANCE: reading mode offers no authoring affordance at
 *         all; authoring mode routes a `CrossLayoutIntent` to `canon-studio`
 *         through the real command registry; and across the whole flow the
 *         gateway saw `s2.graph.query` and nothing else. "It never writes" is
 *         asserted from the wire, not from reading the source.
 *     (d) the expand set SURVIVES A REMOUNT — the layout toggle remounts every
 *         pane (52.T3's `routingRevision`), so an unmount/remount is the real
 *         gesture, not a metaphor for one.
 * Does NOT own: the pure law (`coordinateTreeModel.test.ts`), the seam register
 *   (`coordinateTreeSeams.test.ts`), the deep mount (`ui/deepPaneSet.test.ts`),
 *   or the through-the-switch proof (`tests/e2e/coordinate-tree-deep.spec.ts`).
 * Contract: [[CHROME-CONTRACT]] §2 + §5 + §7 · [[DR-M0-1]] · rerun [[28.T28.6]].
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGateway } from '../../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../../bridge/types';
import { CROSS_LAYOUT_INTENT_COMMAND, parseCrossLayoutIntent } from '../../commands/crossLayoutIntent';
import { commands } from '../../commands/registry';
import { useCoordinateStore, useProvenanceStore, useSessionStore } from '../../state/stores';
import { FAMILY_PALETTE } from '../../ui/tokens';
import { useThemeStore } from '../../state/themeStore';
import { CoordinateTreePane } from './CoordinateTreePane';
import { useCoordinateTreeStore } from './coordinateTreeModel';

/** The six family-root rows, as `s2.graph.query` really answers them. */
const ROOT_ROWS = [
    { coordinate: 'P', name: 'P Position Family', vaultPath: null },
    { coordinate: 'S', name: 'S Stack Family', vaultPath: null },
    { coordinate: 'T', name: 'T Thought Family', vaultPath: null },
    { coordinate: 'M', name: 'M Subsystem Family', vaultPath: 'Idea/Bimba/World/Types/M/M.md' },
    { coordinate: 'L', name: 'L Lens Family', vaultPath: null },
    { coordinate: 'C', name: 'C Category Family', vaultPath: null }
];

const EDGE_ROWS = [
    {
        source: 'M',
        target: 'M4',
        type: 'CONTAINS',
        targetName: 'Nara',
        targetVaultPath: 'Idea/Bimba/World/Types/M/M4.md'
    },
    {
        source: 'M4',
        target: 'M4-3',
        type: 'HAS_INTERNAL_COMPONENT',
        targetName: 'Nara Decanic',
        targetVaultPath: 'Idea/Pratibimba/Self/PASU.md'
    },
    { source: 'S', target: 'S3', type: 'CONTAINS', targetName: 'Gateway', targetVaultPath: null }
];

/** The real envelope `GraphMethodService::query` returns. */
function envelope(rows: readonly Record<string, unknown>[]) {
    return {
        contract: { method: 's2.graph.query' },
        columns: Object.keys(rows[0] ?? {}),
        rowCount: rows.length,
        rows
    };
}

const invoke = vi.fn();

function connect(privacyClass = 'public') {
    invoke.mockImplementation(async (method: string, params: Record<string, unknown>) => {
        if (method !== 's2.graph.query') {
            throw new Error(`the coordinate tree must not invoke ${method}`);
        }
        const cypher = String(params.cypher ?? '');
        return {
            artifact: envelope(cypher.includes('MATCH (parent:Bimba)') ? EDGE_ROWS : ROOT_ROWS),
            privacyClass
        };
    });
    setGateway({ invoke } as never);
    useProvenanceStore.setState({
        connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
    });
}

/** Render and let the mount read resolve into real rows. */
async function renderReady() {
    const view = render(<CoordinateTreePane />);
    await waitFor(() => expect(screen.getByTestId('coordinate-tree-rows')).toBeTruthy());
    return view;
}

function row(coordinate: string): HTMLElement {
    return screen.getByTestId(`coordinate-tree-node-${coordinate}`);
}

describe('28.T28.6 — the Coordinate Tree pane', () => {
    beforeEach(() => {
        invoke.mockReset();
        useCoordinateTreeStore.setState({
            status: 'idle',
            detail: null,
            forest: null,
            receiptPrivacyClass: null,
            expanded: new Set<string>(),
            surfaceMode: 'reading'
        });
        useCoordinateStore.setState({ selected: null });
        useSessionStore.setState({
            sessionKey: 'agent:pi',
            dayNow: '07-30-2026',
            privacyClass: 'public'
        });
        useThemeStore.setState({ applied: 'dark' });
        connect();
    });

    afterEach(() => {
        cleanup();
        useCoordinateStore.setState({ selected: null });
    });

    // ── (a) family colouring ────────────────────────────────────────────────

    it('(a) colours every row by family, namespaces only what S1 residency answered for', async () => {
        await renderReady();
        for (const family of ['P', 'S', 'T', 'M', 'L', 'C'] as const) {
            const li = row(family);
            expect(li.className).toContain(`coordinate-family-${family}`);
            // exactly one family class per row — never two, never none
            expect(li.className.match(/coordinate-family-[A-Za-z]+/g)).toHaveLength(1);
            // …and the receipt privacy class rides every row (deliverable e)
            expect(li.className).toContain('coordinate-privacy-public');
        }
        // Namespace is READ, not inferred: `M` carries a Bimba vault path, the
        // other five carry none, and none of them is guessed into a namespace.
        expect(row('M').className).toContain('coordinate-namespace-bimba');
        for (const bare of ['P', 'S', 'T', 'L', 'C']) {
            expect(row(bare).className).not.toMatch(/coordinate-namespace-/);
        }
    });

    it('(a) the row tint is the theme-resolved token hue, never a local literal', async () => {
        await renderReady();
        fireEvent.click(screen.getByTestId('coordinate-tree-arrow-M'));
        const m4 = row('M4');
        expect(m4.style.getPropertyValue('--coordinate-family-tint')).toBe(
            FAMILY_PALETTE.M[4].dark
        );
        // …and the same row in the light theme takes the light half.
        useThemeStore.setState({ applied: 'light' });
        await waitFor(() =>
            expect(row('M4').style.getPropertyValue('--coordinate-family-tint')).toBe(
                FAMILY_PALETTE.M[4].light
            )
        );
        // A bare family root is not `[PSTMLC][0-5]`, so it takes no grade hue —
        // it is classed but untinted, which is the honest state.
        expect(row('M').style.getPropertyValue('--coordinate-family-tint')).toBe('');
    });

    it('(a) deep rows keep their family class as the graph nests them', async () => {
        await renderReady();
        fireEvent.click(screen.getByTestId('coordinate-tree-arrow-M'));
        fireEvent.click(screen.getByTestId('coordinate-tree-arrow-M4'));
        expect(row('M4-3').className).toContain('coordinate-family-M');
        expect(row('M4-3').className).toContain('coordinate-namespace-pratibimba');
        expect(row('M4-3').getAttribute('data-depth')).toBe('2');
    });

    // ── (b) active-coordinate highlight ─────────────────────────────────────

    it('(b) SUBSCRIBES — a coordinate published elsewhere highlights the matching row', async () => {
        await renderReady();
        expect(row('S').className).not.toContain('active-coordinate');

        // Any other surface (the Bimba graph viewer, a breadcrumb, an intent)
        // writes the ONE shared store; this pane must follow without a gesture.
        useCoordinateStore.getState().setSelected('S');
        await waitFor(() => expect(row('S').className).toContain('active-coordinate'));
        expect(row('S').querySelector('.coordinate-tree-label')?.getAttribute('aria-current')).toBe(
            'true'
        );
        expect(screen.getByTestId('coordinate-tree').getAttribute('data-active-coordinate')).toBe('S');
        // exactly one row is active at a time
        expect(document.querySelectorAll('.active-coordinate')).toHaveLength(1);

        useCoordinateStore.getState().setSelected('T');
        await waitFor(() => expect(row('T').className).toContain('active-coordinate'));
        expect(row('S').className).not.toContain('active-coordinate');
    });

    it('(b) PUBLISHES — a row click writes the one shared coordinate store', async () => {
        await renderReady();
        fireEvent.click(screen.getByTestId('coordinate-tree-select-L'));
        expect(useCoordinateStore.getState().selected).toBe('L');
        await waitFor(() => expect(row('L').className).toContain('active-coordinate'));
    });

    it('(b′) publishes NOTHING on mount — the opening-tab law, driven to completion', async () => {
        // Another surface owns the coordinate when the deep layout is entered.
        useCoordinateStore.setState({ selected: 'M3-2' });
        const setSelected = vi.spyOn(useCoordinateStore.getState(), 'setSelected');

        await renderReady();
        // The mount really did its work — this is not a vacuous pass.
        expect(invoke).toHaveBeenCalledTimes(2);
        expect(screen.getAllByTestId(/^coordinate-tree-node-/).length).toBeGreaterThan(0);

        expect(
            useCoordinateStore.getState().selected,
            'mounting the coordinate tree seized the shared coordinate — that is the 52.T4 defect'
        ).toBe('M3-2');
        expect(setSelected).not.toHaveBeenCalled();
        // …and no row claims the highlight it did not earn.
        expect(document.querySelectorAll('.active-coordinate')).toHaveLength(0);
        setSelected.mockRestore();
    });

    // ── (c) CRUD vs governance ──────────────────────────────────────────────

    it('(c) reading mode offers no authoring affordance at all', async () => {
        await renderReady();
        expect(screen.getByTestId('coordinate-tree').getAttribute('data-surface-mode')).toBe(
            'reading'
        );
        expect(screen.queryByTestId('coordinate-tree-propose-M')).toBeNull();
        expect(screen.queryByTestId('coordinate-tree-governance')).toBeNull();
        expect(document.querySelectorAll('.coordinate-tree-propose')).toHaveLength(0);
    });

    it('(c) authoring ROUTES to Canon Studio and mutates nothing (DR-M0-1)', async () => {
        const dispatched: unknown[] = [];
        const dispose = commands.register({
            id: CROSS_LAYOUT_INTENT_COMMAND,
            title: 'test capture',
            run: intent => {
                dispatched.push(intent);
            }
        });
        try {
            await renderReady();
            fireEvent.click(screen.getByTestId('coordinate-tree-mode-authoring'));
            await waitFor(() => expect(screen.getByTestId('coordinate-tree-propose-M')).toBeTruthy());
            expect(screen.getByTestId('coordinate-tree-governance').textContent).toContain(
                'never mutates canon'
            );
            expect(screen.getByTestId('coordinate-tree').getAttribute('data-mutates-graph-canon')).toBe(
                'false'
            );

            fireEvent.click(screen.getByTestId('coordinate-tree-propose-M'));
            await waitFor(() => expect(dispatched).toHaveLength(1));

            // Parsed by the shipping parser — a shape guess would prove nothing.
            const intent = parseCrossLayoutIntent(dispatched[0]);
            expect(intent.requestedContributionId).toBe('canon-studio');
            expect(intent.requestedExtensionId).toBe('ide-shell-m0-m5');
            expect(intent.coordinate).toBe('M');
            expect(intent.dayNow).toBe('07-30-2026');
            expect(intent.sessionKey).toBe('agent:pi');
            expect(intent.privacyClass).toBe('public');

            // THE CLAIM, from the wire: across mount, mode toggle and the
            // authoring gesture, the gateway saw one read method and no other.
            const methods = new Set(invoke.mock.calls.map(call => call[0]));
            expect([...methods]).toEqual(['s2.graph.query']);
        } finally {
            dispose();
        }
    });

    // ── (d) expand state survives the layout toggle ─────────────────────────

    it('(d) the expand state survives a full unmount/remount, and reads the gateway once', async () => {
        const view = await renderReady();
        fireEvent.click(screen.getByTestId('coordinate-tree-arrow-M'));
        fireEvent.click(screen.getByTestId('coordinate-tree-arrow-M4'));
        expect(row('M4-3')).toBeTruthy();
        expect(row('M').getAttribute('data-expanded')).toBe('true');

        // 52.T3 bumps `routingRevision` on a layout switch, which remounts every
        // pane — so this IS the layout toggle, not an analogy for one.
        view.unmount();
        await renderReady();
        expect(row('M').getAttribute('data-expanded')).toBe('true');
        expect(row('M4-3')).toBeTruthy();
        // …and the module-scope forest means the remount cost no second read.
        expect(invoke).toHaveBeenCalledTimes(2);
    });

    it('(d) the six bulk-expand commands open a whole family from the registry', async () => {
        const { registerCoordinateTreeCommands } = await import('./coordinateTreeCommands');
        const disposers = registerCoordinateTreeCommands(commands);
        try {
            await renderReady();
            expect(screen.queryByTestId('coordinate-tree-node-M4-3')).toBeNull();
            await commands.execute('pratibimba.coordinate-tree.expand-family.M');
            await waitFor(() => expect(screen.getByTestId('coordinate-tree-node-M4-3')).toBeTruthy());
            // …and only that family opened.
            expect(screen.queryByTestId('coordinate-tree-node-S3')).toBeNull();
        } finally {
            disposers.forEach(dispose => dispose());
        }
    });

    // ── (e) the privacy gate runs before the payload reaches a render tree ──

    it('(e) a refused receipt never becomes rows — it becomes a blocked overlay, ONCE', async () => {
        connect('private');
        render(<CoordinateTreePane />);
        await waitFor(() =>
            expect(screen.getByTestId('coordinate-tree').getAttribute('data-status')).toBe(
                'privacy-refused'
            )
        );
        expect(screen.queryByTestId('coordinate-tree-rows')).toBeNull();
        expect(document.querySelectorAll('.coordinate-tree-node')).toHaveLength(0);

        // A terminal status is TERMINAL. This assertion is why the mount effect
        // guards on `idle` and not on "not ready": the earlier guard let the
        // refusal feed back through its own status change, so the pane read S2
        // in a tight loop for as long as the tab stayed open. Two calls is one
        // read (roots + edges); anything above it is the loop returning.
        const readsAfterRefusal = invoke.mock.calls.length;
        expect(readsAfterRefusal).toBe(2);
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(invoke.mock.calls.length).toBe(readsAfterRefusal);
    });

    it('(e) a reconnect retries the refused read exactly once', async () => {
        connect('private');
        render(<CoordinateTreePane />);
        await waitFor(() =>
            expect(screen.getByTestId('coordinate-tree').getAttribute('data-status')).toBe(
                'privacy-refused'
            )
        );
        expect(invoke).toHaveBeenCalledTimes(2);

        // The bridge drops, then returns public. The pane owns no retry button,
        // so the reconnect IS the retry — and it fires once, not on a poll.
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: false, state: 'disconnected' }
        });
        await waitFor(() =>
            expect(screen.getByTestId('coordinate-tree').getAttribute('data-status')).toBe('idle')
        );
        connect('public');
        await waitFor(() =>
            expect(screen.getByTestId('coordinate-tree').getAttribute('data-status')).toBe('ready')
        );
        expect(invoke).toHaveBeenCalledTimes(4);
        expect(screen.getByTestId('coordinate-tree-node-M')).toBeTruthy();
    });
});
