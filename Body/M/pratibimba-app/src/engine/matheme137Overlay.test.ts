/**
 * 29.T29.8 — the 137 = 64 + 72 + 1 annotation directive for the cosmic
 * composition, against the tranche's own six acceptance points.
 *
 * The law itself (five canonical forms, translation rule, parent attribution)
 * is Track 07.T7.2's and is COMPOSED here, never restated — a second copy of
 * `137 = 128 + 8 + 1` in this module would be a place for the two to drift.
 */

import { describe, expect, it } from 'vitest';

import {
    FORBIDDEN_PARENT_ATTRIBUTION,
    QCD_OCTET_SINGLET_FORM,
    THIRD_SPANDA_FORMS,
    TRANSLATION_RULE
} from './compositionMatheme';
import {
    buildMatheme137Overlay,
    formatMatheme137Hover,
    MATHEME_SKELETON_EVENTS,
    skeletonEventFired
} from './matheme137Overlay';

function profileWithSkeletonEvent(skeletonEvent: unknown) {
    return {
        generation: 3,
        cachedAtMs: 3000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: {
            harmonicProfile: {
                position6: 2,
                anandaVortex: { activeCellValue: { skeletonEvent } }
            }
        }
    } as never;
}

const IDLE = profileWithSkeletonEvent(null);

describe('(a) the canonical forms are available on hover', () => {
    it('carries every canonical form the law declares, and no invented one', () => {
        const overlay = buildMatheme137Overlay(IDLE);
        for (const form of THIRD_SPANDA_FORMS) {
            expect(overlay.hoverForms).toContain(form.symbol);
        }
        expect(overlay.hoverForms).toContain(QCD_OCTET_SINGLET_FORM.symbol);
        expect(overlay.hoverForms).toHaveLength(THIRD_SPANDA_FORMS.length + 1);
    });

    it('renders the hover as the annotation plus one form per line', () => {
        const hover = formatMatheme137Hover(buildMatheme137Overlay(IDLE));
        expect(hover).toContain('64 = M3 codons');
        expect(hover).toContain('72 = M2 invariant');
        expect(hover.split('\n').length).toBe(THIRD_SPANDA_FORMS.length + 2);
    });
});

describe('(b) the +1 parent is M1-5', () => {
    it('attributes the parent to M1-5, never the M0 witness', () => {
        const overlay = buildMatheme137Overlay(IDLE);
        expect(overlay.parentAttribution).toBe('M1-5');
        expect(overlay.parentAttribution).not.toBe(FORBIDDEN_PARENT_ATTRIBUTION);
    });
});

describe('(c) the bridge label is the translation rule', () => {
    it('labels the seam with 9₍M2₎ = 8₍M3₎ + 1₍M1₎, sourced from the law', () => {
        const overlay = buildMatheme137Overlay(IDLE);
        expect(overlay.bridge.label).toBe(TRANSLATION_RULE.symbol);
        // The bridge sits BETWEEN the two sides — that is the whole claim.
        expect(overlay.bridge.region).toBe('k2-equatorial-seam');
        expect(overlay.sixtyFour.region).toBe('m3-lens-ring');
        expect(overlay.seventyTwo.region).toBe('m2-cymatic-surface');
    });
});

describe('(d) the 7-8-9 spine activates on Additive137', () => {
    it('is inert until the profile bus says Additive137', () => {
        const overlay = buildMatheme137Overlay(IDLE);
        expect(overlay.spineActive).toBe(false);
        expect(overlay.spineOrbits.every(orbit => !orbit.active)).toBe(true);
    });

    it('activates all three orbits when the event fires, innermost to outermost', () => {
        const overlay = buildMatheme137Overlay(
            profileWithSkeletonEvent(MATHEME_SKELETON_EVENTS.additive137)
        );
        expect(overlay.spineActive).toBe(true);
        expect(overlay.spineOrbits.map(orbit => orbit.n)).toEqual([7, 8, 9]);
        expect(overlay.spineOrbits.map(orbit => orbit.ring)).toEqual([0, 1, 2]);
        expect(overlay.spineOrbits.every(orbit => orbit.active)).toBe(true);
    });

    it('takes the orbit roles from the law rather than naming them here', () => {
        const overlay = buildMatheme137Overlay(IDLE);
        expect(overlay.spineOrbits[0].role).toBe('actional-contraction');
        expect(overlay.spineOrbits[1].role).toBe('octave-field/return');
        expect(overlay.spineOrbits[2].role).toBe('wholeness/epogdoon-extension');
    });

    it('accepts the event as a bare name or as a named object, not as an ordinal', () => {
        // 19.8 states an ordinal for KaprekarPedagogyHit only; guessing one for
        // Additive137 would invent a wire contract.
        expect(skeletonEventFired('Additive137', 'Additive137')).toBe(true);
        expect(skeletonEventFired({ name: 'Additive137' }, 'Additive137')).toBe(true);
        expect(skeletonEventFired(5, 'Additive137')).toBe(false);
        expect(skeletonEventFired(null, 'Additive137')).toBe(false);
    });
});

describe('(e) the Mersenne label is proof-mode only', () => {
    it('is hidden by default and shown in proof mode, with the same text', () => {
        const quiet = buildMatheme137Overlay(IDLE);
        const proof = buildMatheme137Overlay(IDLE, { proofMode: true });
        expect(quiet.mersenne.visible).toBe(false);
        expect(proof.mersenne.visible).toBe(true);
        expect(proof.mersenne.label).toBe('127 = 2^7 - 1');
        expect(quiet.mersenne.label).toBe(proof.mersenne.label);
    });

    it('changes nothing else about the composition — proof mode is a viewer state', () => {
        const quiet = buildMatheme137Overlay(IDLE);
        const proof = buildMatheme137Overlay(IDLE, { proofMode: true });
        expect(proof.bridge).toEqual(quiet.bridge);
        expect(proof.spineOrbits).toEqual(quiet.spineOrbits);
        expect(proof.parentAttribution).toBe(quiet.parentAttribution);
    });
});

describe('(f) the Kaprekar chip consumes the bussed event', () => {
    it('stays down until KaprekarPedagogyHit fires', () => {
        expect(buildMatheme137Overlay(IDLE).kaprekarChip).toBe(false);
        expect(
            buildMatheme137Overlay(profileWithSkeletonEvent('Additive137')).kaprekarChip
        ).toBe(false);
    });

    it('fires on the declared name and on the 19.8 wire ordinal 6', () => {
        // The shared reader owns that leniency; this must not fork it.
        expect(
            buildMatheme137Overlay(
                profileWithSkeletonEvent(MATHEME_SKELETON_EVENTS.kaprekarPedagogyHit)
            ).kaprekarChip
        ).toBe(true);
        expect(buildMatheme137Overlay(profileWithSkeletonEvent('6')).kaprekarChip).toBe(true);
    });
});

describe('the directive is a directive — it draws nothing', () => {
    it('states regions rather than coordinates, leaving the mesh to played-torus', () => {
        // 29.8: "composition issues the directive; played-torus renders." A
        // second renderer here would fork the surface.
        const overlay = buildMatheme137Overlay(IDLE);
        const serialised = JSON.stringify(overlay);
        expect(serialised).not.toMatch(/\b(x|y|z|radius|mesh|geometry)\b/i);
        expect(Object.isFrozen(overlay)).toBe(true);
    });
});
