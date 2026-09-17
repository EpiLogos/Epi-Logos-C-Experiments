/**
 * Coordinate: M' M2' (element registers — DR-L2-ELEM-2 / DR-L2-ASPECT-1)
 * Actualises: behavioural proof that the M2 element registers stay separate —
 *   each register admits only its own values, correspondences between them are
 *   partial where the ontologies genuinely differ (Salt is no mahābhūta), M2-3's
 *   triplicity identity reproduces the classical triplicities from `sign mod 4`,
 *   and — the load-bearing test — the per-aspect relation AGREES with the
 *   relation computed from real degree pairs at that aspect. That agreement is
 *   what makes it one law rather than two tables that happen to match.
 *   The cross-register REFUSALS are compile-time (`@ts-expect-error` below):
 *   `npx tsc --noEmit` fails if any of them ever starts type-checking.
 */

import { describe, expect, it } from 'vitest';
import { aspectBetween, ASPECT_KINDS } from './clockFieldOverlay';
import { ELEMENT_COLOURS } from './cosmicMath';
import {
    ALCHEMICAL_ELEMENT_NAMES,
    AlchemicalElement,
    alchemicalElementName,
    alchemicalFromMahabhuta,
    alchemicalFromTriplicityBranch,
    asAlchemical,
    asMahabhuta,
    asTriplicityBranch,
    elementalRelationBetweenDegrees,
    elementalRelationOfAspect,
    isOperativeElement,
    MAHABHUTA_NAMES,
    MAHABHUTA_TATTVA_BASE,
    mahabhutaFromAlchemical,
    mahabhutaName,
    signOfDegree,
    triplicityBranchFromAlchemical,
    triplicityBranchOfSign,
    triplicityOfDegree,
    triplicityOfSign,
    type Alchemical,
    type Mahabhuta
} from './elementRegisters';

/** Non-null branded constructors for test data. */
function mahabhuta(value: number): Mahabhuta {
    const branded = asMahabhuta(value);
    if (branded === null) throw new Error(`not a mahabhuta: ${value}`);
    return branded;
}
function alchemical(value: number): Alchemical {
    const branded = asAlchemical(value);
    if (branded === null) throw new Error(`not an alchemical element: ${value}`);
    return branded;
}

/** Sign indices of the four classical triplicities (Aries = 0 … Pisces = 11). */
const TRIPLICITIES = [
    { element: AlchemicalElement.FIRE, signs: [0, 4, 8] }, // Aries, Leo, Sagittarius
    { element: AlchemicalElement.EARTH, signs: [1, 5, 9] }, // Taurus, Virgo, Capricorn
    { element: AlchemicalElement.AIR, signs: [2, 6, 10] }, // Gemini, Libra, Aquarius
    { element: AlchemicalElement.WATER, signs: [3, 7, 11] } // Cancer, Scorpio, Pisces
] as const;

describe('registers admit only their own values', () => {
    it('bounds each register at its own cardinality', () => {
        expect(asMahabhuta(4)).toBe(4); // Prithvi, the last mahabhuta
        expect(asMahabhuta(5)).toBeNull(); // there is no sixth mahabhuta
        expect(asAlchemical(5)).toBe(5); // Salt
        expect(asAlchemical(6)).toBeNull();
        expect(asTriplicityBranch(5)).toBe(5); // #2-3-5/0 Quintessence
        expect(asTriplicityBranch(6)).toBeNull();
    });

    it('refuses non-integers, negatives and non-numbers rather than coercing', () => {
        for (const bad of [-1, 1.5, Number.NaN, '2', null, undefined, {}]) {
            expect(asMahabhuta(bad)).toBeNull();
            expect(asAlchemical(bad)).toBeNull();
        }
    });

    it('REFUSES CROSS-REGISTER USE AT COMPILE TIME', () => {
        // Each line below is a real defect the type system now catches. If any
        // stops erroring, `@ts-expect-error` itself becomes the error and
        // `tsc --noEmit` fails — so these assertions cannot silently rot.
        // @ts-expect-error a bare number belongs to no register at all
        alchemicalFromMahabhuta(2);
        // @ts-expect-error an alchemical value is not a mahabhuta
        alchemicalFromMahabhuta(AlchemicalElement.WATER);
        // @ts-expect-error a mahabhuta is not an alchemical value
        mahabhutaFromAlchemical(mahabhuta(2));
        // @ts-expect-error ELEMENT_COLOURS is keyed by the Mahabhuta register
        ELEMENT_COLOURS[AlchemicalElement.FIRE];
        // @ts-expect-error a triplicity branch coordinate is not an alchemical value
        alchemicalFromTriplicityBranch(AlchemicalElement.FIRE);
        expect(true).toBe(true); // the proof is the compile, not the runtime
    });
});

describe('the [[M2-1]]/L2 alchemical register', () => {
    it('is the six-position alchemical ordering, and it carries Salt', () => {
        expect(AlchemicalElement.AETHER).toBe(0);
        expect(AlchemicalElement.EARTH).toBe(1);
        expect(AlchemicalElement.WATER).toBe(2);
        expect(AlchemicalElement.AIR).toBe(3);
        expect(AlchemicalElement.FIRE).toBe(4);
        expect(AlchemicalElement.SALT).toBe(5);
        expect(ALCHEMICAL_ELEMENT_NAMES).toHaveLength(6);
        expect(alchemicalElementName(AlchemicalElement.SALT)).toBe('Salt');
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

describe('the [[M2-2]] Mahabhuta register', () => {
    it('is the mahabhuta run of the tattva series, tattvas 31..35', () => {
        expect(MAHABHUTA_TATTVA_BASE).toBe(31);
        expect(MAHABHUTA_NAMES).toEqual(['Akasha', 'Vayu', 'Agni', 'Apas', 'Prithvi']);
        expect(mahabhutaName(mahabhuta(0))).toBe('Akasha'); // tattva 31
        expect(mahabhutaName(mahabhuta(4))).toBe('Prithvi'); // tattva 35
    });

    it('is a different series from the alchemical one — same integer, other element', () => {
        // The collision that makes an unmarked id dangerous: 2 is Water in the
        // alchemical register and Agni (fire) as a mahabhuta.
        expect(alchemicalElementName(alchemical(2))).toBe('Water');
        expect(mahabhutaName(mahabhuta(2))).toBe('Agni');
    });
});

describe('correspondences between registers (claims, not casts)', () => {
    it('maps Mahabhuta to alchemical and back for every member it carries', () => {
        expect(alchemicalFromMahabhuta(mahabhuta(0))).toBe(AlchemicalElement.AETHER);
        expect(alchemicalFromMahabhuta(mahabhuta(1))).toBe(AlchemicalElement.AIR);
        expect(alchemicalFromMahabhuta(mahabhuta(2))).toBe(AlchemicalElement.FIRE);
        expect(alchemicalFromMahabhuta(mahabhuta(3))).toBe(AlchemicalElement.WATER);
        expect(alchemicalFromMahabhuta(mahabhuta(4))).toBe(AlchemicalElement.EARTH);
        for (let value = 0; value <= 4; value++) {
            const across = alchemicalFromMahabhuta(mahabhuta(value));
            expect(across).not.toBeNull();
            expect(mahabhutaFromAlchemical(across as Alchemical)).toBe(value);
        }
    });

    it('refuses rather than inventing: Salt is no Mahabhuta, so it has no counterpart', () => {
        expect(mahabhutaFromAlchemical(AlchemicalElement.SALT)).toBeNull();
    });

    it('maps the M2-3 branch ordering as a full bijection (it does carry Salt)', () => {
        const branch = (value: number) => asTriplicityBranch(value)!;
        expect(alchemicalFromTriplicityBranch(branch(1))).toBe(AlchemicalElement.FIRE);
        expect(alchemicalFromTriplicityBranch(branch(2))).toBe(AlchemicalElement.EARTH);
        expect(alchemicalFromTriplicityBranch(branch(3))).toBe(AlchemicalElement.AIR);
        expect(alchemicalFromTriplicityBranch(branch(4))).toBe(AlchemicalElement.WATER);
        expect(alchemicalFromTriplicityBranch(branch(0))).toBe(AlchemicalElement.AETHER);
        expect(alchemicalFromTriplicityBranch(branch(5))).toBe(AlchemicalElement.SALT);
        for (let value = 0; value <= 5; value++) {
            const across = alchemicalFromTriplicityBranch(branch(value));
            expect(triplicityBranchFromAlchemical(across as Alchemical)).toBe(value);
        }
    });

    it('keeps ELEMENT_COLOURS keyed by the Mahabhuta register — convert first', () => {
        // Fire is 4 in the alchemical register but 2 as a mahabhuta. Crossing is
        // required; skipping it would paint Fire with Prithvi/umber.
        const fireAsMahabhuta = mahabhutaFromAlchemical(AlchemicalElement.FIRE);
        expect(fireAsMahabhuta).toBe(2);
        expect(ELEMENT_COLOURS[fireAsMahabhuta as Mahabhuta]).toBe(0xd8613c); // vermilion
        expect(ELEMENT_COLOURS[mahabhuta(4)]).toBe(0x9b7a4b); // umber — what skipping gives
    });

    it('names an unknown value as null rather than guessing', () => {
        expect(alchemicalElementName(null)).toBeNull();
        expect(mahabhutaName(null)).toBeNull();
    });
});

describe('the [[M2-3]] triplicity identity — element_of(sign) = sign mod 4', () => {
    it('reproduces the four classical triplicities exactly', () => {
        for (const { element, signs } of TRIPLICITIES) {
            for (const sign of signs) {
                expect(triplicityOfSign(sign)).toBe(element);
            }
        }
    });

    it('answers first in M2-3 own branch coordinates — #2-3-N = 1 + sign mod 4', () => {
        expect(triplicityBranchOfSign(0)).toBe(1); // Aries → #2-3-1 Fire
        expect(triplicityBranchOfSign(1)).toBe(2); // Taurus → #2-3-2 Earth
        expect(triplicityBranchOfSign(2)).toBe(3); // Gemini → #2-3-3 Air
        expect(triplicityBranchOfSign(3)).toBe(4); // Cancer → #2-3-4 Water
        expect(triplicityBranchOfSign(12)).toBeNull();
    });

    it('assigns every sign an operative element and nothing else', () => {
        for (let sign = 0; sign < 12; sign++) {
            expect(isOperativeElement(triplicityOfSign(sign) as Alchemical)).toBe(true);
        }
    });

    it('refuses out-of-range signs instead of wrapping silently', () => {
        expect(triplicityOfSign(12)).toBeNull();
        expect(triplicityOfSign(-1)).toBeNull();
        expect(triplicityOfSign(1.5)).toBeNull();
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
                const angle = {
                    conjunction: 0,
                    sextile: 60,
                    square: 90,
                    trine: 120,
                    opposition: 180
                }[kind];
                const a = degreeA + 15; // mid-sign so orb never straddles
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
