/**
 * Coordinate: M' M2'+M4' (cymatic polarity law — Track 08.T8.6)
 * Actualises: the render-test asserting polarity matches ratified canon
 *   (DR-M4-2 clause 5: 0=cosmic, 1=personal) and the personal register's
 *   protected-surface block.
 */

import { describe, expect, it } from 'vitest';
import { cymaticRegisterForFace, gateCymaticRender } from './cymaticPolarity';

describe('0/1 cymatic polarity (08.T8.6 / DR-M4-2 clause 5)', () => {
    it('polarity matches ratified canon: 0 = cosmic, 1 = personal — never inverted', () => {
        expect(cymaticRegisterForFace(0)).toBe('cosmic');
        expect(cymaticRegisterForFace(1)).toBe('personal');
    });

    it('the cosmic register renders openly on face 0', () => {
        const gate = gateCymaticRender({ face: 0, protectedM4Surface: false });
        expect(gate.allowed).toBe(true);
        expect(gate.register).toBe('cosmic');
    });

    it('the personal register is BLOCKED outside protected M4′ surfaces', () => {
        const blocked = gateCymaticRender({ face: 1, protectedM4Surface: false });
        expect(blocked.allowed).toBe(false);
        if (!blocked.allowed) {
            expect(blocked.reason).toContain('protected M4′ surfaces');
        }
        const allowed = gateCymaticRender({ face: 1, protectedM4Surface: true });
        expect(allowed.allowed).toBe(true);
        expect(allowed.register).toBe('personal');
    });
});
