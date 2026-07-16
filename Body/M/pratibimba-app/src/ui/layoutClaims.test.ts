import { describe, expect, it, vi } from 'vitest';
import {
    ACTIVE_LAYOUT_CLAIMS,
    LayoutClaim,
    resolveLayoutClaim,
    resolveLayoutClaims
} from './layoutClaims';

describe('active layout claims', () => {
    it('keeps Smart Connections explicitly code-pending without inventing a receiver', () => {
        const receiverExists = vi.fn(() => false);
        const resolutions = resolveLayoutClaims('ide-deep', receiverExists);

        expect(resolutions).toEqual([
            expect.objectContaining({
                id: 'pratibimba.smart-connections-sidebar',
                status: 'code-pending',
                receiverComponent: null,
                gate: '03.T6.5',
                deliveryOwner: '28.T28.12',
                migrationSource: 'Body/M/epi-theia/extensions/MIGRATION-SOURCES.md'
            })
        ]);
        expect(receiverExists).not.toHaveBeenCalled();
        expect(ACTIVE_LAYOUT_CLAIMS).toHaveLength(1);
    });

    it('does not project the ide-deep-only pending claim into daily-0-1', () => {
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
