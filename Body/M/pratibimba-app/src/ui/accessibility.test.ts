/**
 * Coordinate: M' shell-0 (accessibility contract tests — 30.T30.5)
 * Residency: Body/M/pratibimba-app/src/ui/accessibility.test.ts
 * Actualises: each clause of the a11y contract asserted as law — the contrast
 *   maths against WCAG's own published pairs, the reduced-motion
 *   continuous/discrete distinction, the coordinate text equivalent, and the
 *   tick-announcement budget.
 */

import { describe, expect, it } from 'vitest';
import {
    A11Y_KEYBINDINGS,
    cl42SignatureAriaLabel,
    contrastRatio,
    coordinateAriaLabel,
    createTickAnnouncer,
    FOCUS_RING_MIN_PX,
    meetsContrast,
    MOTION_KIND,
    parseHex,
    REDUCED_MOTION_SNAP_MS,
    reducedMotionDurationMs,
    relativeLuminance,
    tickAnnouncement,
    TICK_ANNOUNCE_MIN_INTERVAL_MS,
    WCAG_AA
} from './accessibility';

describe('contrast maths', () => {
    it('reproduces the WCAG reference extremes', () => {
        // Black on white is the published maximum, 21:1.
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
        // A colour against itself is 1:1.
        expect(contrastRatio('#7f6ab8', '#7f6ab8')).toBeCloseTo(1, 5);
    });

    it('is symmetric — order of foreground and background cannot change the ratio', () => {
        const forward = contrastRatio('#181026', '#e8e2f4');
        const backward = contrastRatio('#e8e2f4', '#181026');
        expect(forward).toBeCloseTo(backward as number, 10);
    });

    it('computes relative luminance at the published anchors', () => {
        expect(relativeLuminance('#000000')).toBeCloseTo(0, 10);
        expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
    });

    it('expands short hex and tolerates an alpha channel', () => {
        expect(parseHex('#fff')).toEqual(parseHex('#ffffff'));
        expect(parseHex('#221737b3')).toEqual(parseHex('#221737'));
    });

    it('refuses to assert on an unparseable colour rather than passing it', () => {
        expect(contrastRatio('var(--ink)', '#ffffff')).toBeNull();
        expect(meetsContrast('var(--ink)', '#ffffff')).toBe(false);
    });

    it('holds each role to its own AA threshold', () => {
        // #767676 on white is the canonical 4.54:1 — passes body text and, being
        // above 3, large text too.
        expect(meetsContrast('#767676', '#ffffff', 'bodyText')).toBe(true);
        // #949494 on white is ~3.03:1 — fails body text, passes large/UI.
        expect(meetsContrast('#949494', '#ffffff', 'bodyText')).toBe(false);
        expect(meetsContrast('#949494', '#ffffff', 'largeText')).toBe(true);
        expect(meetsContrast('#949494', '#ffffff', 'uiComponent')).toBe(true);
    });

    it('fixes the AA thresholds at the published values', () => {
        expect(WCAG_AA).toEqual({ bodyText: 4.5, largeText: 3, uiComponent: 3 });
    });
});

describe('the carrier ink/ground pairs meet AA', () => {
    // The two themes' body pairs, read from the token definitions in styles.css.
    const PAIRS: ReadonlyArray<readonly [string, string, string]> = [
        ['dark ink on ground', '#e8e2f4', '#181026'],
        ['dark ink on raised ground', '#e8e2f4', '#221737'],
        ['light ink on ground', '#201936', '#f5f2fb'],
        ['light ink on raised ground', '#201936', '#e8e2f4']
    ];

    for (const [name, ink, ground] of PAIRS) {
        it(`${name} meets AA body text`, () => {
            const ratio = contrastRatio(ink, ground);
            expect(ratio, `${ink} on ${ground}`).not.toBeNull();
            expect(ratio as number).toBeGreaterThanOrEqual(WCAG_AA.bodyText);
        });
    }
});

describe('reduced motion (DR-WC-DL-4)', () => {
    it('classifies tick choreography as continuous and the face inversion as discrete', () => {
        expect(MOTION_KIND.profileTickSlerp).toBe('continuous');
        expect(MOTION_KIND.flowStreamline).toBe('continuous');
        expect(MOTION_KIND.lemniscateToggle).toBe('discrete');
        expect(MOTION_KIND.layoutSwitch).toBe('discrete');
    });

    it('leaves every channel at full duration when the user has no preference', () => {
        expect(reducedMotionDurationMs('profileTickSlerp', 400, false)).toBe(400);
        expect(reducedMotionDurationMs('lemniscateToggle', 400, false)).toBe(400);
    });

    it('stops continuous motion entirely under reduce', () => {
        expect(reducedMotionDurationMs('profileTickSlerp', 400, true)).toBe(0);
        expect(reducedMotionDurationMs('flowStreamline', 200, true)).toBe(0);
    });

    it('PRESERVES a discrete transition as a snap — the state change keeps its semantics', () => {
        expect(reducedMotionDurationMs('lemniscateToggle', 400, true)).toBe(REDUCED_MOTION_SNAP_MS);
        expect(reducedMotionDurationMs('kleinFlip', 500, true)).toBe(REDUCED_MOTION_SNAP_MS);
    });

    it('never lengthens a transition that was already shorter than the snap', () => {
        expect(reducedMotionDurationMs('kleinFlip', 60, true)).toBe(60);
    });

    it('makes the layout switch instantaneous, per canon', () => {
        expect(reducedMotionDurationMs('layoutSwitch', 320, true)).toBe(0);
    });
});

describe('screen-reader text equivalents', () => {
    it('speaks a coordinate with its family tier and archetype', () => {
        expect(coordinateAriaLabel('M4-3')).toBe('M4 dash 3, subsystem family, nara');
    });

    it('unrolls the separators a reader would otherwise run together', () => {
        expect(coordinateAriaLabel('M3-1-0-13')).toBe(
            'M3 dash 1 dash 0 dash 13, subsystem family, mahamaya'
        );
        expect(coordinateAriaLabel("S4-5'")).toContain('S4 dash 5 prime');
    });

    it('names each family tier from the coordinate-name authority', () => {
        expect(coordinateAriaLabel('S1')).toBe('S1, stack family, obsidian');
        expect(coordinateAriaLabel('C5')).toBe('C5, category family, pratibimba');
        expect(coordinateAriaLabel('L2')).toBe('L2, lens family, structural');
    });

    it('gives a non-family coordinate no family it does not have', () => {
        expect(coordinateAriaLabel('cpf')).toBe('Coordinate cpf');
        expect(coordinateAriaLabel('#4')).toBe('Coordinate #4');
    });

    it('names the Cl(4,2) signature cue in words, not colour alone', () => {
        expect(cl42SignatureAriaLabel(-1)).toBe('signature minus one, cool indigo');
        expect(cl42SignatureAriaLabel(1)).toBe('signature plus one, warm amber');
    });
});

describe('profile-tick announcement budget', () => {
    it('announces the tick against its twelve-fold', () => {
        expect(tickAnnouncement(7)).toBe('tick 7 of 11');
    });

    it('announces the first tick immediately', () => {
        const announce = createTickAnnouncer();
        expect(announce(0, 1_000)).toBe('tick 0 of 11');
    });

    it('stays silent for a repeat of the same tick', () => {
        const announce = createTickAnnouncer();
        announce(3, 1_000);
        expect(announce(3, 9_000)).toBeNull();
    });

    it('suppresses a new tick that arrives inside the one-second budget', () => {
        const announce = createTickAnnouncer();
        announce(3, 1_000);
        expect(announce(4, 1_000 + TICK_ANNOUNCE_MIN_INTERVAL_MS - 1)).toBeNull();
        // the 1Hz heartbeat is exactly at the budget, so it speaks
        expect(announce(5, 1_000 + TICK_ANNOUNCE_MIN_INTERVAL_MS)).toBe('tick 5 of 11');
    });
});

describe('contract constants', () => {
    it('holds the focus ring to a visible minimum', () => {
        expect(FOCUS_RING_MIN_PX).toBeGreaterThanOrEqual(2);
    });

    it('registers the pause and both scrub chords', () => {
        expect(A11Y_KEYBINDINGS.map(binding => binding.chord)).toEqual([
            'space',
            'shift+left',
            'shift+right'
        ]);
    });
});
