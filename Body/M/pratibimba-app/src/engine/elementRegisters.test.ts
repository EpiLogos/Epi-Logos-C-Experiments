/**
 * Coordinate: M' M3' (L2' canonical element law — DR-L2-ASPECT-1)
 * Actualises: behavioural proof of the element law — the L2' ordering carries
 *   SALT, the legacy conversions round-trip exactly where m_canonical.h says they
 *   do (and refuse where they cannot), the triplicity identity reproduces the
 *   classical triplicities from `sign mod 4`, and — the load-bearing test — the
 *   per-aspect relation AGREES with the relation computed from real degree pairs
 *   at that aspect. That agreement is what makes it one law rather than two
 *   tables that happen to match.
 */

import { describe, expect, it } from 'vitest';
import { aspectBetween, ASPECT_KINDS } from './clockFieldOverlay';
import { ELEMENT_COLOURS } from './cosmicMath';
import {
    ELEMENT_REGISTER_INVALID,
    ALCHEMICAL_ELEMENT_NAMES,
    AlchemicalElement,
    alchemicalElementName,
    alchemicalFromTriplicityBranch,
    alchemicalFromMahabhuta,
    elementalRelationBetweenDegrees,
    elementalRelationOfAspect,
    triplicityOfDegree,
    triplicityOfSign,
    isOperativeElement,
    mahabhutaFromAlchemical,
    signOfDegree,
    MAHABHUTA_NAMES
} from './elementRegisters';

/** Sign indices of the four classical triplicities (Aries = 0 … Pisces = 11). */
const TRIPLICITIES = [
    { element: AlchemicalElement.FIRE, signs: [0, 4, 8] }, // Aries, Leo, Sagittarius
    { element: AlchemicalElement.EARTH, signs: [1, 5, 9] }, // Taurus, Virgo, Capricorn
    { element: AlchemicalElement.AIR, signs: [2, 6, 10] }, // Gemini, Libra, Aquarius
    { element: AlchemicalElement.WATER, signs: [3, 7, 11] } // Cancer, Scorpio, Pisces
] as const;

describe('the [[M2-1]]/L2 alchemical register', () => {
    it('is the six-position alchemical ordering, and it carries Salt', () => {
        expect(AlchemicalElement.AETHER).toBe(0);
        expect(AlchemicalElement.EARTH).toBe(1);
        expect(AlchemicalElement.WATER).toBe(2);
        expect(AlchemicalElement.AIR).toBe(3);
        expect(AlchemicalElement.FIRE).toBe(4);
        expect(AlchemicalElement.SALT).toBe(5);
        expect(Object.keys(ALCHEMICAL_ELEMENT_NAMES)).toHaveLength(6);
        expect(ALCHEMICAL_ELEMENT_NAMES[AlchemicalElement.SALT]).toBe('Salt');
    });

    it('treats only the quartet 1-4 as operative — Aether and Salt frame it', () => {
        expect(isOperativeElement(AlchemicalElement.AETHER)).toBe(false);
        expect(isOperativeElement(AlchemicalElement.SALT)).toBe(false);
        for (const element of [
            AlchemicalElement.EARTH,
            AlchemicalElement.WATER,
            AlchemicalElement.AIR,
            AlchemicalElement.FIRE
        ]) {
            expect(isOperativeElement(element)).toBe(true);
        }
    });
});

describe('correspondences between registers (claims, not casts)', () => {
    it('maps Mahabhuta to alchemical and back for every member it carries', () => {
        // AKASHA=0, VAYU/Air=1, AGNI/Fire=2, APAS/Water=3, PRITHVI/Earth=4
        expect(alchemicalFromMahabhuta(0)).toBe(AlchemicalElement.AETHER);
        expect(alchemicalFromMahabhuta(1)).toBe(AlchemicalElement.AIR);
        expect(alchemicalFromMahabhuta(2)).toBe(AlchemicalElement.FIRE);
        expect(alchemicalFromMahabhuta(3)).toBe(AlchemicalElement.WATER);
        expect(alchemicalFromMahabhuta(4)).toBe(AlchemicalElement.EARTH);
        for (let legacy = 0; legacy <= 4; legacy++) {
            expect(mahabhutaFromAlchemical(alchemicalFromMahabhuta(legacy))).toBe(legacy);
        }
    });

    it('refuses rather than inventing: Salt is no Mahabhuta, so it has no counterpart', () => {
        expect(mahabhutaFromAlchemical(AlchemicalElement.SALT)).toBe(ELEMENT_REGISTER_INVALID);
        expect(alchemicalFromMahabhuta(5)).toBe(ELEMENT_REGISTER_INVALID);
        expect(alchemicalFromMahabhuta(-1)).toBe(ELEMENT_REGISTER_INVALID);
    });

    it('maps the M2-3 branch ordering as a full bijection (it does carry Salt)', () => {
        expect(alchemicalFromTriplicityBranch(1)).toBe(AlchemicalElement.FIRE);
        expect(alchemicalFromTriplicityBranch(2)).toBe(AlchemicalElement.EARTH);
        expect(alchemicalFromTriplicityBranch(3)).toBe(AlchemicalElement.AIR);
        expect(alchemicalFromTriplicityBranch(4)).toBe(AlchemicalElement.WATER);
        expect(alchemicalFromTriplicityBranch(0)).toBe(AlchemicalElement.AETHER);
        expect(alchemicalFromTriplicityBranch(5)).toBe(AlchemicalElement.SALT);
        const mapped = [0, 1, 2, 3, 4, 5].map(alchemicalFromTriplicityBranch);
        expect(new Set(mapped).size).toBe(6);
    });
});

describe('the registers stay distinguishable', () => {
    it('names the Mahabhuta register separately from the alchemical one', () => {
        expect(MAHABHUTA_NAMES).toEqual(['Akasha', 'Vayu', 'Agni', 'Apas', 'Prithvi']);
        expect(alchemicalElementName(AlchemicalElement.WATER)).toBe('Water');
        // The collision that makes an unmarked id dangerous: id 2 is Water in
        // the alchemical register and Agni/Fire in the Mahabhuta register.
        expect(MAHABHUTA_NAMES[2]).toBe('Agni');
        expect(alchemicalElementName(2)).toBe('Water');
    });

    it('keeps ELEMENT_COLOURS keyed by the Mahābhūta register — convert first', () => {
        // Fire is 4 in the alchemical register but 2 as a Mahabhuta. Looking an
        // alchemical id up in the scene table paints Fire with Prithvi/umber.
        expect(mahabhutaFromAlchemical(AlchemicalElement.FIRE)).toBe(2);
        expect(ELEMENT_COLOURS[mahabhutaFromAlchemical(AlchemicalElement.FIRE)]).toBe(0xd8613c);
        expect(ELEMENT_COLOURS[AlchemicalElement.FIRE]).toBe(0x9b7a4b); // the wrong colour
    });

    it('names an unknown alchemical id as null rather than guessing', () => {
        expect(alchemicalElementName(6)).toBeNull();
        expect(alchemicalElementName(ELEMENT_REGISTER_INVALID)).toBeNull();
    });
});

describe('the triplicity identity — element_of(sign) = sign mod 4', () => {
    it('reproduces the four classical triplicities exactly', () => {
        for (const { element, signs } of TRIPLICITIES) {
            for (const sign of signs) {
                expect(triplicityOfSign(sign)).toBe(element);
            }
        }
    });

    it('assigns every sign an operative element and nothing else', () => {
        for (let sign = 0; sign < 12; sign++) {
            expect(isOperativeElement(triplicityOfSign(sign))).toBe(true);
        }
    });

    it('refuses out-of-range signs instead of wrapping silently', () => {
        expect(triplicityOfSign(12)).toBe(ELEMENT_REGISTER_INVALID);
        expect(triplicityOfSign(-1)).toBe(ELEMENT_REGISTER_INVALID);
        expect(triplicityOfSign(1.5)).toBe(ELEMENT_REGISTER_INVALID);
    });

    it('reads a degree through its sign, normalising the circle', () => {
        expect(signOfDegree(0)).toBe(0); // 0° Aries
        expect(signOfDegree(95)).toBe(3); // 5° Cancer
        expect(signOfDegree(359.9)).toBe(11); // late Pisces
        expect(signOfDegree(-30)).toBe(11); // wraps backwards
        expect(signOfDegree(390)).toBe(1); // wraps forwards
        expect(triplicityOfDegree(0)).toBe(AlchemicalElement.FIRE);
        expect(triplicityOfDegree(95)).toBe(AlchemicalElement.WATER);
    });
});

describe('the aspect law — an aspect carries a relation, not an element', () => {
    it('gives each major aspect its relation from the sign span', () => {
        expect(elementalRelationOfAspect('conjunction')).toBe('same-element');
        expect(elementalRelationOfAspect('trine')).toBe('same-element');
        expect(elementalRelationOfAspect('sextile')).toBe('complementary-pair');
        expect(elementalRelationOfAspect('opposition')).toBe('complementary-pair');
        expect(elementalRelationOfAspect('square')).toBe('cross-pair');
    });

    it('is total over the engine aspect kinds and refuses anything else', () => {
        for (const kind of ASPECT_KINDS) {
            expect(elementalRelationOfAspect(kind)).not.toBeNull();
        }
        expect(elementalRelationOfAspect('aspect')).toBeNull();
        expect(elementalRelationOfAspect('quincunx')).toBeNull();
    });

    it('reads both elements plus the relation from two degrees', () => {
        // 15° Aries (Fire) trine 15° Leo (Fire) — same triplicity.
        expect(elementalRelationBetweenDegrees(15, 135)).toEqual({
            elementA: AlchemicalElement.FIRE,
            elementB: AlchemicalElement.FIRE,
            relation: 'same-element'
        });
        // 15° Aries (Fire) opposite 15° Libra (Air) — polar complement.
        expect(elementalRelationBetweenDegrees(15, 195)).toEqual({
            elementA: AlchemicalElement.FIRE,
            elementB: AlchemicalElement.AIR,
            relation: 'complementary-pair'
        });
        // 15° Aries (Fire) square 15° Cancer (Water) — cross-pair tension.
        expect(elementalRelationBetweenDegrees(15, 105)).toEqual({
            elementA: AlchemicalElement.FIRE,
            elementB: AlchemicalElement.WATER,
            relation: 'cross-pair'
        });
    });

    it('never yields Aether or Salt — they frame the wheel, they are not aspects', () => {
        for (let degree = 0; degree < 360; degree += 7) {
            const reading = elementalRelationBetweenDegrees(degree, degree + 60);
            expect(reading).not.toBeNull();
            expect(isOperativeElement(reading!.elementA)).toBe(true);
            expect(isOperativeElement(reading!.elementB)).toBe(true);
        }
    });

    it('agrees with the degree-pair reading for every exact major aspect — one law, not two tables', () => {
        for (const kind of ASPECT_KINDS) {
            const expected = elementalRelationOfAspect(kind);
            for (let degreeA = 0; degreeA < 360; degreeA += 30) {
                // Place B at the exact aspect angle, mid-sign so orb never straddles.
                const angle = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 }[
                    kind
                ];
                const a = degreeA + 15;
                const b = a + angle;
                // The engine's own kernel-ported law must agree this IS that aspect.
                expect(aspectBetween(a, b)?.kind).toBe(kind);
                expect(elementalRelationBetweenDegrees(a, b)?.relation).toBe(expected);
            }
        }
    });

    it('is symmetric — an aspect edge has no preferred end', () => {
        for (let degreeA = 0; degreeA < 360; degreeA += 13) {
            const forward = elementalRelationBetweenDegrees(degreeA, degreeA + 90);
            const backward = elementalRelationBetweenDegrees(degreeA + 90, degreeA);
            expect(forward?.relation).toBe(backward?.relation);
            expect(forward?.elementA).toBe(backward?.elementB);
        }
    });

    it('refuses a non-finite position instead of guessing', () => {
        expect(elementalRelationBetweenDegrees(Number.NaN, 90)).toBeNull();
        expect(elementalRelationBetweenDegrees(0, Number.POSITIVE_INFINITY)).toBeNull();
    });
});
