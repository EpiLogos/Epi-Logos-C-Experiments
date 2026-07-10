/**
 * Coordinate: M' M0-5' (pedagogical return law — Track 08.T8.4)
 * Actualises: the tranche's integration acceptance — the pedagogical return
 *   surfaces in the M0-5' deep-link WITHOUT mutating canon: read-only by
 *   construction, mutation intents refused, M0 anchoring required.
 */

import { describe, expect, it } from 'vitest';
import { receivePedagogicalReturn } from './m0PedagogicalReturn';

describe('m5 → m0 pedagogical return (08.T8.4)', () => {
    it('surfaces the offering in the M0-5 deep-link, read-only, anchored to its M0 node', () => {
        const returned = receivePedagogicalReturn({
            offeringRef: 'atelier://offering/recognized-pattern-42',
            anchorCoordinate: 'M0-2'
        });
        expect(returned.accepted).toBe(true);
        if (returned.accepted) {
            expect(returned.readOnly).toBe(true);
            expect(returned.deepLink).toContain('/m0-anuttara/coordinate/pedagogy');
            expect(returned.deepLink).toContain('anchor=M0-2');
            expect(returned.deepLink).toContain(
                encodeURIComponent('atelier://offering/recognized-pattern-42')
            );
        }
    });

    it('refuses ANY canon-mutation intent — the return never writes', () => {
        const refused = receivePedagogicalReturn({
            offeringRef: 'atelier://offering/x',
            anchorCoordinate: 'M0-2',
            mutation: { setProperty: { key: 'essence', value: 'overwritten' } }
        });
        expect(refused.accepted).toBe(false);
        if (!refused.accepted) {
            expect(refused.refusal).toContain('canon mutation refused');
        }
    });

    it('refuses non-atelier references and free-floating (non-M0-anchored) content', () => {
        expect(
            receivePedagogicalReturn({ offeringRef: 'file://x', anchorCoordinate: 'M0-1' }).accepted
        ).toBe(false);
        expect(
            receivePedagogicalReturn({
                offeringRef: 'atelier://offering/x',
                anchorCoordinate: 'M4-3'
            }).accepted
        ).toBe(false);
    });
});
