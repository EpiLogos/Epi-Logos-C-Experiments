/**
 * 15.T15.11 — dispatch genealogy primitive: pure-fold law.
 * One dataset, two foldings, consistent ids.
 */

import { describe, expect, it } from 'vitest';
import {
    deepLinksFor,
    foldGenealogyStream,
    foldGenealogyTree,
    genealogyIndex,
    DispatchGenealogyRecord,
    DISPATCH_STREAM_KIND_INVOKED,
    DISPATCH_STREAM_KIND_SETTLED
} from './dispatchGenealogy';
import { syntheticPiAnimaMoiraiDispatch, FIXTURE_T0 } from './dispatchGenealogy.fixture';

const record = (overrides: Partial<DispatchGenealogyRecord> & { id: string }): DispatchGenealogyRecord => ({
    parentId: null,
    actor: { actor: 'anima', role: 'anima' },
    route: { method: "s4'.mediation.route", capability: "s4'.mediation.route" },
    status: 'running',
    startedAtMs: FIXTURE_T0,
    endedAtMs: null,
    gate: { capability: "s4'.mediation.route", allowed: true },
    evidenceRef: null,
    sourceRef: null,
    ...overrides
});

describe('foldGenealogyTree (structural fold)', () => {
    it('folds the synthetic Pi → Anima → Moirai dispatch as one nested tree', () => {
        const trees = foldGenealogyTree(syntheticPiAnimaMoiraiDispatch());
        expect(trees).toHaveLength(1);
        const pi = trees[0];
        expect(pi.id).toBe('run-pi-001');
        expect(pi.actor).toEqual({ actor: 'pi', role: 'pi' });
        expect(pi.children).toHaveLength(1);
        const anima = pi.children[0];
        expect(anima.id).toBe('run-anima-001');
        expect(anima.route.method).toBe("s4'.mediation.route");
        expect(anima.children).toHaveLength(1);
        const moirai = anima.children[0];
        expect(moirai.id).toBe('run-moirai-001');
        expect(moirai.actor.role).toBe('subagent');
        expect(moirai.children).toHaveLength(0);
    });

    it('computes durations from timing and keeps unsettled nodes null', () => {
        const trees = foldGenealogyTree([
            record({ id: 'a', endedAtMs: FIXTURE_T0 + 4500 }),
            record({ id: 'b', parentId: 'a', startedAtMs: FIXTURE_T0 + 100 })
        ]);
        expect(trees[0].durationMs).toBe(4500);
        expect(trees[0].children[0].durationMs).toBeNull();
    });

    it('orders siblings by start time', () => {
        const trees = foldGenealogyTree([
            record({ id: 'parent', endedAtMs: FIXTURE_T0 + 10 }),
            record({ id: 'late', parentId: 'parent', startedAtMs: FIXTURE_T0 + 900 }),
            record({ id: 'early', parentId: 'parent', startedAtMs: FIXTURE_T0 + 100 })
        ]);
        expect(trees[0].children.map(child => child.id)).toEqual(['early', 'late']);
    });

    it('surfaces orphans (parent absent from dataset) as roots — never dropped', () => {
        const trees = foldGenealogyTree([record({ id: 'orphan', parentId: 'never-arrived' })]);
        expect(trees).toHaveLength(1);
        expect(trees[0].id).toBe('orphan');
    });

    it('folds mutual-parent cycles without recursing forever', () => {
        const trees = foldGenealogyTree([
            record({ id: 'a', parentId: 'b' }),
            record({ id: 'b', parentId: 'a', startedAtMs: FIXTURE_T0 + 1 })
        ]);
        const flatten = (nodes: readonly { id: string; children: readonly unknown[] }[]): string[] =>
            nodes.flatMap(node => [
                node.id,
                ...flatten(node.children as { id: string; children: readonly unknown[] }[])
            ]);
        expect(flatten(trees).sort()).toEqual(['a', 'b']);
    });
});

describe('foldGenealogyStream (temporal fold)', () => {
    it('yields invoked + settled rows, time-ordered with strictly increasing seq', () => {
        const events = foldGenealogyStream(syntheticPiAnimaMoiraiDispatch());
        expect(events).toHaveLength(6); // 3 invoked + 3 settled
        for (let i = 1; i < events.length; i++) {
            expect(events[i].emittedAtMs).toBeGreaterThanOrEqual(events[i - 1].emittedAtMs);
            expect(events[i].seq).toBe(events[i - 1].seq + 1);
        }
        expect(events.map(event => event.kind)).toEqual([
            DISPATCH_STREAM_KIND_INVOKED, // pi t0
            DISPATCH_STREAM_KIND_INVOKED, // anima t0+300
            DISPATCH_STREAM_KIND_INVOKED, // moirai t0+700
            DISPATCH_STREAM_KIND_SETTLED, // moirai t0+4100
            DISPATCH_STREAM_KIND_SETTLED, // anima t0+4800
            DISPATCH_STREAM_KIND_SETTLED // pi t0+5200
        ]);
    });

    it('unsettled records yield only the invoked row', () => {
        const events = foldGenealogyStream([record({ id: 'open' })]);
        expect(events).toHaveLength(1);
        expect(events[0].kind).toBe(DISPATCH_STREAM_KIND_INVOKED);
        expect(events[0].status).toBe('running');
    });

    it('carries the gateway method as the channel', () => {
        const events = foldGenealogyStream(syntheticPiAnimaMoiraiDispatch());
        expect(events[0].channel).toBe('s4.pi.chat.stream');
        expect(events[1].channel).toBe("s4'.mediation.route");
    });
});

describe('cross-fold consistency (the 15.11 acceptance invariant)', () => {
    it('tree node ids and stream node ids are the same set as the records', () => {
        const records = syntheticPiAnimaMoiraiDispatch();
        const treeIds = new Set<string>();
        const walk = (nodes: readonly { id: string; children: readonly unknown[] }[]) => {
            for (const node of nodes) {
                treeIds.add(node.id);
                walk(node.children as { id: string; children: readonly unknown[] }[]);
            }
        };
        walk(foldGenealogyTree(records) as unknown as { id: string; children: readonly unknown[] }[]);
        const streamIds = new Set(foldGenealogyStream(records).map(event => event.nodeId));
        const recordIds = new Set(records.map(entry => entry.id));
        expect(treeIds).toEqual(recordIds);
        expect(streamIds).toEqual(recordIds);
    });
});

describe('genealogyIndex + deepLinksFor', () => {
    it('indexes by id and preserves the capability-gate outcome', () => {
        const index = genealogyIndex([
            record({ id: 'refused', gate: { capability: 's4.aletheia.janus', allowed: false } })
        ]);
        expect(index.get('refused')?.gate).toEqual({
            capability: 's4.aletheia.janus',
            allowed: false
        });
    });

    it('derives deep-links only from refs the record genuinely carries', () => {
        const records = syntheticPiAnimaMoiraiDispatch();
        const pi = records[0];
        const moirai = records[2];
        expect(deepLinksFor(pi)).toEqual([
            { target: 'omniEvidence', evidenceRef: 'evidence:run-pi-001' }
        ]);
        expect(deepLinksFor(moirai)).toEqual([
            { target: 'omniEvidence', evidenceRef: 'evidence:run-moirai-001' },
            { target: 'backendStudio', sourceRef: 'ta-onta/aletheia/moirai' }
        ]);
        expect(deepLinksFor(record({ id: 'refless' }))).toEqual([]);
    });
});
