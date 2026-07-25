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
import {
    CANONICAL_ELEMENT_INVALID,
    CANONICAL_ELEMENT_NAMES,
    CanonicalElement,
    canonicalFromM2_3Branch,
    canonicalFromM2ElementId,
    elementalRelationBetweenDegrees,
    elementalRelationOfAspect,
    elementOfDegree,
    elementOfSign,
    isOperativeElement,
    m2ElementIdFromCanonical,
    signOfDegree
} from './canonicalElement';

/** Sign indices of the four classical triplicities (Aries = 0 … Pisces = 11). */
const TRIPLICITIES = [
    { element: CanonicalElement.FIRE, signs: [0, 4, 8] }, // Aries, Leo, Sagittarius
    { element: CanonicalElement.EARTH, signs: [1, 5, 9] }, // Taurus, Virgo, Capricorn
    { element: CanonicalElement.AIR, signs: [2, 6, 10] }, // Gemini, Libra, Aquarius
    { element: CanonicalElement.WATER, signs: [3, 7, 11] } // Cancer, Scorpio, Pisces
] as const;

describe('L2 canonical element ordering', () => {
    it('is the six-position L2 ordering, and it carries Salt', () => {
        expect(CanonicalElement.AETHER).toBe(0);
        expect(CanonicalElement.EARTH).toBe(1);
        expect(CanonicalElement.WATER).toBe(2);
        expect(CanonicalElement.AIR).toBe(3);
        expect(CanonicalElement.FIRE).toBe(4);
        expect(CanonicalElement.SALT).toBe(5);
        expect(Object.keys(CANONICAL_ELEMENT_NAMES)).toHaveLength(6);
        expect(CANONICAL_ELEMENT_NAMES[CanonicalElement.SALT]).toBe('Salt');
    });

    it('treats only the quartet 1-4 as operative — Aether and Salt frame it', () => {
        expect(isOperativeElement(CanonicalElement.AETHER)).toBe(false);
        expect(isOperativeElement(CanonicalElement.SALT)).toBe(false);
        for (const element of [
            CanonicalElement.EARTH,
            CanonicalElement.WATER,
            CanonicalElement.AIR,
            CanonicalElement.FIRE
        ]) {
            expect(isOperativeElement(element)).toBe(true);
        }
    });
});

describe('legacy ordering conversions', () => {
    it('maps m2.h Element_Id to canonical and back for every value it carries', () => {
        // AKASHA=0, VAYU/Air=1, AGNI/Fire=2, APAS/Water=3, PRITHVI/Earth=4
        expect(canonicalFromM2ElementId(0)).toBe(CanonicalElement.AETHER);
        expect(canonicalFromM2ElementId(1)).toBe(CanonicalElement.AIR);
        expect(canonicalFromM2ElementId(2)).toBe(CanonicalElement.FIRE);
        expect(canonicalFromM2ElementId(3)).toBe(CanonicalElement.WATER);
        expect(canonicalFromM2ElementId(4)).toBe(CanonicalElement.EARTH);
        for (let legacy = 0; legacy <= 4; legacy++) {
            expect(m2ElementIdFromCanonical(canonicalFromM2ElementId(legacy))).toBe(legacy);
        }
    });

    it('refuses rather than inventing: m2.h has no Salt, so the mapping is lossy', () => {
        expect(m2ElementIdFromCanonical(CanonicalElement.SALT)).toBe(CANONICAL_ELEMENT_INVALID);
        expect(canonicalFromM2ElementId(5)).toBe(CANONICAL_ELEMENT_INVALID);
        expect(canonicalFromM2ElementId(-1)).toBe(CANONICAL_ELEMENT_INVALID);
    });

    it('maps the M2-3 branch ordering as a full bijection (it does carry Salt)', () => {
        expect(canonicalFromM2_3Branch(1)).toBe(CanonicalElement.FIRE);
        expect(canonicalFromM2_3Branch(2)).toBe(CanonicalElement.EARTH);
        expect(canonicalFromM2_3Branch(3)).toBe(CanonicalElement.AIR);
        expect(canonicalFromM2_3Branch(4)).toBe(CanonicalElement.WATER);
        expect(canonicalFromM2_3Branch(0)).toBe(CanonicalElement.AETHER);
        expect(canonicalFromM2_3Branch(5)).toBe(CanonicalElement.SALT);
        const mapped = [0, 1, 2, 3, 4, 5].map(canonicalFromM2_3Branch);
        expect(new Set(mapped).size).toBe(6);
    });
});

describe('the triplicity identity — element_of(sign) = sign mod 4', () => {
    it('reproduces the four classical triplicities exactly', () => {
        for (const { element, signs } of TRIPLICITIES) {
            for (const sign of signs) {
                expect(elementOfSign(sign)).toBe(element);
            }
        }
    });

    it('assigns every sign an operative element and nothing else', () => {
        for (let sign = 0; sign < 12; sign++) {
            expect(isOperativeElement(elementOfSign(sign))).toBe(true);
        }
    });

    it('refuses out-of-range signs instead of wrapping silently', () => {
        expect(elementOfSign(12)).toBe(CANONICAL_ELEMENT_INVALID);
        expect(elementOfSign(-1)).toBe(CANONICAL_ELEMENT_INVALID);
        expect(elementOfSign(1.5)).toBe(CANONICAL_ELEMENT_INVALID);
    });

    it('reads a degree through its sign, normalising the circle', () => {
        expect(signOfDegree(0)).toBe(0); // 0° Aries
        expect(signOfDegree(95)).toBe(3); // 5° Cancer
        expect(signOfDegree(359.9)).toBe(11); // late Pisces
        expect(signOfDegree(-30)).toBe(11); // wraps backwards
        expect(signOfDegree(390)).toBe(1); // wraps forwards
        expect(elementOfDegree(0)).toBe(CanonicalElement.FIRE);
        expect(elementOfDegree(95)).toBe(CanonicalElement.WATER);
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
            elementA: CanonicalElement.FIRE,
            elementB: CanonicalElement.FIRE,
            relation: 'same-element'
        });
        // 15° Aries (Fire) opposite 15° Libra (Air) — polar complement.
        expect(elementalRelationBetweenDegrees(15, 195)).toEqual({
            elementA: CanonicalElement.FIRE,
            elementB: CanonicalElement.AIR,
            relation: 'complementary-pair'
        });
        // 15° Aries (Fire) square 15° Cancer (Water) — cross-pair tension.
        expect(elementalRelationBetweenDegrees(15, 105)).toEqual({
            elementA: CanonicalElement.FIRE,
            elementB: CanonicalElement.WATER,
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
