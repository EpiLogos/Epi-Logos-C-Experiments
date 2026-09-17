/**
 * 15.T15.11 acceptance — the synthetic Pi → Anima → Moirai dispatch renders
 * consistently in BOTH foldings (Dispatch Trace tree, Tool Stream list) with
 * consistent ids; selectable nodes emit deep-link descriptors to evidence and
 * source.
 */

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DispatchGenealogyTree } from './DispatchGenealogyTree';
import { DispatchGenealogyStream } from './DispatchGenealogyStream';
import { DispatchDeepLink } from './dispatchGenealogy';
import { syntheticPiAnimaMoiraiDispatch } from './dispatchGenealogy.fixture';

describe('dispatch genealogy — both foldings over the synthetic dispatch', () => {
    afterEach(cleanup);

    it('renders the same node ids in the tree folding and the stream folding', () => {
        const records = syntheticPiAnimaMoiraiDispatch();
        render(
            <>
                <DispatchGenealogyTree records={records} />
                <DispatchGenealogyStream records={records} />
            </>
        );

        const treeIds = new Set(
            screen
                .getAllByTestId('dispatch-tree-node')
                .map(node => node.getAttribute('data-node-id'))
        );
        const streamIds = new Set(
            screen
                .getAllByTestId('dispatch-stream-row')
                .map(row => row.getAttribute('data-node-id'))
        );
        const recordIds = new Set(records.map(record => record.id));

        expect(treeIds).toEqual(recordIds);
        expect(streamIds).toEqual(recordIds);
    });

    it('tree folding nests Pi → Anima → Moirai structurally', () => {
        render(<DispatchGenealogyTree records={syntheticPiAnimaMoiraiDispatch()} />);
        const nodes = screen.getAllByTestId('dispatch-tree-node');
        const pi = nodes.find(node => node.getAttribute('data-node-id') === 'run-pi-001')!;
        const anima = within(pi)
            .getAllByTestId('dispatch-tree-node')
            .find(node => node.getAttribute('data-node-id') === 'run-anima-001')!;
        expect(anima).toBeTruthy();
        const moirai = within(anima)
            .getAllByTestId('dispatch-tree-node')
            .find(node => node.getAttribute('data-node-id') === 'run-moirai-001');
        expect(moirai).toBeTruthy();
    });

    it('tree nodes carry provenance, timing, and the capability-gate outcome', () => {
        render(<DispatchGenealogyTree records={syntheticPiAnimaMoiraiDispatch()} />);
        const nodes = screen.getAllByTestId('dispatch-tree-node');
        const anima = nodes.find(node => node.getAttribute('data-node-id') === 'run-anima-001')!;
        const row = within(anima).getAllByTestId('dispatch-tree-node-row')[0];
        expect(row.textContent).toContain('anima');
        expect(row.textContent).toContain("s4'.mediation.route");
        expect(row.textContent).toContain('4500ms');
        expect(row.textContent).toContain('succeeded');
        expect(within(anima).getAllByTestId('dispatch-node-gate')[0].textContent).toContain(
            "s4'.mediation.route ✓"
        );
    });

    it('stream folding is time-ordered: three invocations then three settles', () => {
        render(<DispatchGenealogyStream records={syntheticPiAnimaMoiraiDispatch()} />);
        const rows = screen.getAllByTestId('dispatch-stream-row');
        expect(rows).toHaveLength(6);
        expect(rows.map(row => row.getAttribute('data-kind'))).toEqual([
            'dispatch.invoked',
            'dispatch.invoked',
            'dispatch.invoked',
            'dispatch.settled',
            'dispatch.settled',
            'dispatch.settled'
        ]);
        expect(rows.map(row => row.getAttribute('data-node-id'))).toEqual([
            'run-pi-001',
            'run-anima-001',
            'run-moirai-001',
            'run-moirai-001',
            'run-anima-001',
            'run-pi-001'
        ]);
    });

    it('selecting the same dispatch in either folding emits the same node id', () => {
        const records = syntheticPiAnimaMoiraiDispatch();
        const onTreeSelect = vi.fn();
        const onStreamSelect = vi.fn();
        render(
            <>
                <DispatchGenealogyTree records={records} onSelect={onTreeSelect} />
                <DispatchGenealogyStream records={records} onSelect={onStreamSelect} />
            </>
        );

        const moiraiTreeRow = screen
            .getAllByTestId('dispatch-tree-node')
            .find(node => node.getAttribute('data-node-id') === 'run-moirai-001')!
            .querySelector('[data-testid="dispatch-tree-node-row"]')!;
        fireEvent.click(moiraiTreeRow);

        const moiraiStreamRow = screen
            .getAllByTestId('dispatch-stream-row')
            .find(row => row.getAttribute('data-node-id') === 'run-moirai-001')!;
        fireEvent.click(moiraiStreamRow);

        expect(onTreeSelect).toHaveBeenCalledWith('run-moirai-001');
        expect(onStreamSelect).toHaveBeenCalledWith('run-moirai-001');
        expect(onTreeSelect.mock.calls[0][0]).toBe(onStreamSelect.mock.calls[0][0]);
    });

    it('deep-links to evidence and source from a selectable node', () => {
        const onDeepLink = vi.fn<(link: DispatchDeepLink) => void>();
        render(
            <DispatchGenealogyTree
                records={syntheticPiAnimaMoiraiDispatch()}
                onDeepLink={onDeepLink}
            />
        );
        const moirai = screen
            .getAllByTestId('dispatch-tree-node')
            .find(node => node.getAttribute('data-node-id') === 'run-moirai-001')!;
        fireEvent.click(within(moirai).getByTestId('dispatch-link-omniEvidence'));
        fireEvent.click(within(moirai).getByTestId('dispatch-link-backendStudio'));

        expect(onDeepLink).toHaveBeenNthCalledWith(1, {
            target: 'omniEvidence',
            evidenceRef: 'evidence:run-moirai-001'
        });
        expect(onDeepLink).toHaveBeenNthCalledWith(2, {
            target: 'backendStudio',
            sourceRef: 'ta-onta/aletheia/moirai'
        });
    });

    it('folding a tree node collapses its subtree (view-local, data untouched)', () => {
        render(<DispatchGenealogyTree records={syntheticPiAnimaMoiraiDispatch()} />);
        const anima = screen
            .getAllByTestId('dispatch-tree-node')
            .find(node => node.getAttribute('data-node-id') === 'run-anima-001')!;
        const toggle = within(anima).getAllByTestId('dispatch-tree-fold-toggle')[0];
        fireEvent.click(toggle);

        const visibleIds = screen
            .getAllByTestId('dispatch-tree-node')
            .map(node => node.getAttribute('data-node-id'));
        expect(visibleIds).not.toContain('run-moirai-001');
        expect(visibleIds).toContain('run-anima-001');

        fireEvent.click(toggle);
        expect(
            screen
                .getAllByTestId('dispatch-tree-node')
                .map(node => node.getAttribute('data-node-id'))
        ).toContain('run-moirai-001');
    });

    it('renders honest empties — nothing synthesised when no records arrive', () => {
        render(
            <>
                <DispatchGenealogyTree records={[]} />
                <DispatchGenealogyStream records={[]} />
            </>
        );
        expect(screen.getByTestId('dispatch-tree-empty')).toBeTruthy();
        expect(screen.getByTestId('dispatch-stream-empty')).toBeTruthy();
    });
});
