import { describe, expect, it, vi } from 'vitest';
import {
    ACTIVE_LAYOUT_CLAIMS,
    LayoutClaim,
    resolveLayoutClaim,
    resolveLayoutClaims
} from './layoutClaims';

describe('active layout claims', () => {
    it('the Smart Connections claim LANDED (52.T6) on its real receiver, and fails closed without it', () => {
        const receiverExists = vi.fn((component: string) => component === 'semanticConnections');
        const resolutions = resolveLayoutClaims('ide-deep', receiverExists);

        expect(resolutions).toEqual([
            expect.objectContaining({
                id: 'pratibimba.smart-connections-sidebar',
                status: 'landed',
                receiverComponent: 'semanticConnections',
                gate: null,
                migrationSource: 'Body/M/epi-theia/extensions/MIGRATION-SOURCES.md'
            })
        ]);
        // A landed claim gets NO tolerance: the receiver really was looked up…
        expect(receiverExists).toHaveBeenCalledWith('semanticConnections');
        expect(ACTIVE_LAYOUT_CLAIMS).toHaveLength(1);
        // …and a shell that cannot find it must throw, not shrug.
        expect(() => resolveLayoutClaims('ide-deep', () => false)).toThrow(
            'landed layout claim pratibimba.smart-connections-sidebar has no receiver for semanticConnections'
        );
    });

    it('does not project the ide-deep-only claim into daily-0-1', () => {
        expect(resolveLayoutClaims('daily-0-1', () => false)).toEqual([]);
    });

    it('fails closed when a claim says landed but its receiver is absent', () => {
        const landedClaim: LayoutClaim = {
            id: 'test.landed-pane',
            layout: 'ide-deep',
            status: 'landed',
            receiverComponent: 'landedPane',
            gate: null,
            deliveryOwner: 'test',
            migrationSource: null
        };

        expect(() => resolveLayoutClaim(landedClaim, () => false)).toThrow(
            'landed layout claim test.landed-pane has no receiver for landedPane'
        );
    });
});
