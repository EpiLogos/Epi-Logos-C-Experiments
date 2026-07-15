/**
 * Coordinate: M' M1' (Coordinate Tree contribution proof - 22.T22.11)
 * Actualises: behavioral proof that the active-carrier manifest exposes the
 *   complete M1 tree, routes family/tick/topology selections to their owning
 *   surfaces, and publishes activation through the real shared store.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { useCoordinateStore } from '../state/stores';
import {
    activateM1CoordinateTreeNode,
    findM1CoordinateTreeNode,
    M1_COORDINATE_TREE_CONTRIBUTION,
    M1CoordinateTreeNode
} from './m1CoordinateTreeContribution';

function allNodes(nodes: readonly M1CoordinateTreeNode[]): M1CoordinateTreeNode[] {
    return nodes.flatMap(current => [current, ...(current.children ? allNodes(current.children) : [])]);
}

function decodedCoordinate(deepLink: string): string | null {
    return new URL(deepLink).searchParams.get('coordinate');
}

describe('M1 Coordinate Tree contribution (22.T22.11)', () => {
    beforeEach(() => useCoordinateStore.setState({ selected: null }));

    it('declares the complete 6-strata / 6-family / 12-tick / 3-constant tree', () => {
        const strata = M1_COORDINATE_TREE_CONTRIBUTION.children;
        expect(M1_COORDINATE_TREE_CONTRIBUTION.rootCoordinate).toBe('M1');
        expect(strata.map(item => item.coordinate)).toEqual([
            "M1-0'",
            "M1-1'",
            "M1-2'",
            "M1-3'",
            "M1-4'",
            "M1-5'"
        ]);
        expect(findM1CoordinateTreeNode("M1-2'")?.children).toHaveLength(6);
        expect(findM1CoordinateTreeNode("M1-3'")?.children).toHaveLength(12);
        expect(findM1CoordinateTreeNode("M1-5'")?.children).toHaveLength(3);
        expect(new Set(allNodes(strata).map(item => item.coordinate)).size).toBe(27);
    });

    it('activates Bimba through the shared coordinate store and pins the vortex browser', () => {
        const activation = activateM1CoordinateTreeNode("M1-2'/Bimba");
        const uri = new URL(activation.deepLink);

        expect(useCoordinateStore.getState().selected).toBe("M1-2'/Bimba");
        expect(activation.surfaceId).toBe('walk');
        expect(uri.protocol).toBe('epi-logos:');
        expect(uri.hostname).toBe('ide');
        expect(uri.pathname).toBe('/m1-paramasiva/walk');
        expect(uri.searchParams.get('coordinate')).toBe("M1-2'/Bimba");
        expect(uri.searchParams.get('view')).toBe('vortexMatricesBrowser');
        expect(uri.searchParams.get('family')).toBe('0');
    });

    it('routes every tick to the walk surface with its exact scrub target', () => {
        const ticks = findM1CoordinateTreeNode("M1-3'")?.children ?? [];
        for (const [tick, current] of ticks.entries()) {
            const activation = activateM1CoordinateTreeNode(current.coordinate);
            const uri = new URL(activation.deepLink);
            expect(activation.surfaceId).toBe('walk');
            expect(decodedCoordinate(activation.deepLink)).toBe(`M1-3'/tick-${tick}`);
            expect(uri.searchParams.get('scrubTo')).toBe(String(tick));
        }
        expect(useCoordinateStore.getState().selected).toBe("M1-3'/tick-11");
    });

    it("routes M1-5' itself to the played K2 torus while constants remain walk addresses", () => {
        const topology = activateM1CoordinateTreeNode("M1-5'");
        expect(topology).toEqual({
            coordinate: "M1-5'",
            deepLink: 'epi-logos://ide/m1-paramasiva-played-torus/k2',
            surfaceId: 'm1PlayedTorus'
        });

        const constant = activateM1CoordinateTreeNode("M1-5'/DOUBLE_COVER_DEG");
        expect(constant.surfaceId).toBe('walk');
        expect(decodedCoordinate(constant.deepLink)).toBe("M1-5'/DOUBLE_COVER_DEG");
        expect(useCoordinateStore.getState().selected).toBe("M1-5'/DOUBLE_COVER_DEG");
    });

    it('keeps the contribution recursively immutable and rejects unknown addresses', () => {
        for (const current of allNodes(M1_COORDINATE_TREE_CONTRIBUTION.children)) {
            expect(Object.isFrozen(current)).toBe(true);
            if (current.children) {
                expect(Object.isFrozen(current.children)).toBe(true);
            }
        }
        expect(() => activateM1CoordinateTreeNode("M1-6'")).toThrow(
            "unknown M1 Coordinate Tree node: M1-6'"
        );
        expect(useCoordinateStore.getState().selected).toBeNull();
    });
});
