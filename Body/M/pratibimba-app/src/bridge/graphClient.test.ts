import { describe, expect, it, vi } from 'vitest';
import { coerceNode, coerceRelations, GraphClient } from './graphClient';

function receipt(artifact: unknown) {
    return { artifact } as never;
}

describe('graph client', () => {
    it('coerces node shapes across coordinate/bimbaCoordinate/properties aliases', () => {
        expect(coerceNode({ coordinate: 'M1-2', label: 'Ananda' })?.coordinate).toBe('M1-2');
        expect(coerceNode({ bimbaCoordinate: 'M3' })?.coordinate).toBe('M3');
        expect(coerceNode({ properties: { coordinate: 'M0-1', label: 'QL' } })?.label).toBe('QL');
        expect(coerceNode({ nothing: true })).toBeNull();
    });

    it('coerces the REAL gateway shapes: node.relations typed rows and traverse.nodes rows', () => {
        // s2.graph.node relations: {type, direction: 'outbound'|'inbound', coordinate}
        const typed = coerceRelations([
            { type: 'structural', direction: 'outbound', coordinate: 'M1-2' },
            { type: 'sync', direction: 'inbound', coordinate: 'M0' }
        ]);
        expect(typed[0]).toMatchObject({ target: 'M1-2', type: 'structural', direction: 'out' });
        expect(typed[1]).toMatchObject({ target: 'M0', type: 'sync', direction: 'in' });
        // s2.graph.traverse: neighbor rows under `nodes`, untyped
        const swept = coerceRelations({ nodes: [{ coordinate: 'M1-1', family: 'M', layer: 1 }] });
        expect(swept[0]).toMatchObject({ target: 'M1-1', type: 'NEIGHBOR', direction: 'out' });
        expect(coerceRelations(null)).toEqual([]);
    });

    it('node() reads the real {node, relations} envelope; traverse() the {nodes} envelope', async () => {
        const invoke = vi.fn(async (method: string) =>
            method === 's2.graph.node'
                ? receipt({
                      contract: 's2.graph.node',
                      node: { coordinate: 'M1', label: 'Paramasiva' },
                      relations: [{ type: 'structural', direction: 'outbound', coordinate: 'M1-2' }],
                      resolution: { canonical: 'M1' }
                  })
                : receipt({ contract: 's2.graph.traverse', from: { canonical: 'M1' }, nodes: [{ coordinate: 'M1-1' }] })
        );
        const client = new GraphClient({ invoke: invoke as never });
        const result = await client.node('M1');
        expect(result.node?.label).toBe('Paramasiva');
        expect(result.relations[0]).toMatchObject({ target: 'M1-2', type: 'structural' });
        expect(invoke).toHaveBeenCalledWith('s2.graph.node', { coordinate: 'M1' });
        const swept = await client.traverse('M1');
        expect(swept[0].target).toBe('M1-1');
        expect(invoke).toHaveBeenCalledWith('s2.graph.traverse', { from: 'M1' });
    });
});
