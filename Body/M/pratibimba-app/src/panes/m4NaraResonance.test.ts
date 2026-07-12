import { describe, expect, it } from 'vitest';
import {
    artifactResonanceIndicator,
    normalizeConjugateFormCharacter,
    normalizeResonanceIndicator,
    resonanceIndicatorFromProfile,
    summarizeDayResonance
} from './m4NaraResonance';

describe('normalizeConjugateFormCharacter (05.T5.1 §6.5 vocabulary)', () => {
    it('passes the three §6.5 surface characters through', () => {
        expect(normalizeConjugateFormCharacter('Major')).toBe('Major');
        expect(normalizeConjugateFormCharacter('Minor')).toBe('Minor');
        expect(normalizeConjugateFormCharacter('Shadow')).toBe('Shadow');
    });

    it('maps the kernel wire spelling ShadowInversion (kernel.rs enum) to Shadow', () => {
        expect(normalizeConjugateFormCharacter('ShadowInversion')).toBe('Shadow');
        expect(normalizeConjugateFormCharacter('shadow-inversion')).toBe('Shadow');
        expect(normalizeConjugateFormCharacter('shadow_inversion')).toBe('Shadow');
    });

    it('never invents a character for unknown values', () => {
        expect(normalizeConjugateFormCharacter('major')).toBeNull();
        expect(normalizeConjugateFormCharacter(2)).toBeNull();
        expect(normalizeConjugateFormCharacter(null)).toBeNull();
    });
});

describe('normalizeResonanceIndicator (envelope law)', () => {
    it('resolves a stamped envelope resonance field with the numeric+character label', () => {
        const indicator = normalizeResonanceIndicator({
            numeric: 0.812,
            conjugateFormCharacter: 'Major',
            sourceHandle: 'm4.protected://resonance/1'
        });
        expect(indicator.state).toBe('resolved');
        expect(indicator.numeric).toBe(0.812);
        expect(indicator.conjugateFormCharacter).toBe('Major');
        expect(indicator.sourceHandle).toBe('m4.protected://resonance/1');
        expect(indicator.label).toBe('0.812 Major');
    });

    it('falls back to pending-resonance when the numeric is missing', () => {
        const indicator = normalizeResonanceIndicator({ conjugateFormCharacter: 'Minor' });
        expect(indicator.state).toBe('pending-resonance');
        expect(indicator.numeric).toBeNull();
        expect(indicator.conjugateFormCharacter).toBeNull();
        expect(indicator.label).toBe('pending-resonance');
    });

    it('falls back to pending-resonance when the character is missing or the stamp is absent', () => {
        expect(normalizeResonanceIndicator({ numeric: 0.4 }).state).toBe('pending-resonance');
        expect(normalizeResonanceIndicator(undefined).state).toBe('pending-resonance');
        expect(normalizeResonanceIndicator(null).state).toBe('pending-resonance');
        expect(normalizeResonanceIndicator('0.4 Major').state).toBe('pending-resonance');
    });

    it('refuses non-finite numerics rather than rendering them', () => {
        expect(
            normalizeResonanceIndicator({ numeric: Number.NaN, conjugateFormCharacter: 'Major' }).state
        ).toBe('pending-resonance');
        expect(
            normalizeResonanceIndicator({ numeric: Infinity, conjugateFormCharacter: 'Major' }).state
        ).toBe('pending-resonance');
    });

    it('keeps a sourceHandle on the pending fallback when the stamp names one', () => {
        const indicator = normalizeResonanceIndicator({ sourceHandle: 'm4.protected://resonance/2' });
        expect(indicator.state).toBe('pending-resonance');
        expect(indicator.sourceHandle).toBe('m4.protected://resonance/2');
    });
});

describe('resonanceIndicatorFromProfile (profile-bus law)', () => {
    it('prefers personalPole.resonance and maps the kernel ShadowInversion spelling', () => {
        const indicator = resonanceIndicatorFromProfile({
            harmonicProfile: {
                resonance: 0.2,
                conjugateFormCharacter: 'Minor',
                personalPole: {
                    resonance: { score: 0.931, conjugateFormCharacter: 'ShadowInversion' },
                    qPersonalHandle: {
                        targetKind: 'q-personal',
                        handle: 'm4.protected://q-personal/7',
                        privacy: 'protected-local-body'
                    }
                }
            }
        });
        expect(indicator.state).toBe('resolved');
        expect(indicator.numeric).toBe(0.931);
        expect(indicator.conjugateFormCharacter).toBe('Shadow');
        expect(indicator.label).toBe('0.931 Shadow');
        // handle-only provenance per DR-M4-3 — a reference, never a body
        expect(indicator.sourceHandle).toBe('m4.protected://q-personal/7');
    });

    it('falls back to the tick-level resonance + conjugateFormCharacter pair', () => {
        const indicator = resonanceIndicatorFromProfile({
            harmonicProfile: { resonance: 0.512, conjugateFormCharacter: 'Minor' }
        });
        expect(indicator.state).toBe('resolved');
        expect(indicator.label).toBe('0.512 Minor');
        expect(indicator.sourceHandle).toBe('kernel-profile');
    });

    it('is pending-resonance when the kernel carries no personal resonance (resonance: null default)', () => {
        expect(
            resonanceIndicatorFromProfile({
                harmonicProfile: { resonance: null, conjugateFormCharacter: 'Major' }
            }).state
        ).toBe('pending-resonance');
        expect(resonanceIndicatorFromProfile({ harmonicProfile: {} }).state).toBe('pending-resonance');
        expect(resonanceIndicatorFromProfile(null).state).toBe('pending-resonance');
    });
});

describe('artifactResonanceIndicator (envelope-first, at-now fallback)', () => {
    const profile = {
        harmonicProfile: { resonance: 0.444, conjugateFormCharacter: 'Minor' }
    };

    it('lets a stamped envelope win over the live profile', () => {
        const indicator = artifactResonanceIndicator(
            { numeric: 0.9, conjugateFormCharacter: 'Major' },
            profile
        );
        expect(indicator.label).toBe('0.900 Major');
    });

    it('reads the at-now profile when the envelope is unstamped', () => {
        const indicator = artifactResonanceIndicator(undefined, profile);
        expect(indicator.label).toBe('0.444 Minor');
    });

    it('stays pending-resonance when both envelope and profile are silent', () => {
        const indicator = artifactResonanceIndicator(undefined, null);
        expect(indicator.state).toBe('pending-resonance');
        expect(indicator.label).toBe('pending-resonance');
    });
});

describe('summarizeDayResonance (day-summary law)', () => {
    it('aggregates resolved stamps: average + Major/Minor/Shadow counts + pending count', () => {
        const summary = summarizeDayResonance([
            { artifactPath: 'a', resonance: { numeric: 0.8, conjugateFormCharacter: 'Major' } },
            { artifactPath: 'b', resonance: { numeric: 0.4, conjugateFormCharacter: 'ShadowInversion' } },
            { artifactPath: 'c' }
        ]);
        expect(summary.state).toBe('resolved');
        expect(summary.numericAverage).toBeCloseTo(0.6, 10);
        expect(summary.resolvedCount).toBe(2);
        expect(summary.pendingCount).toBe(1);
        expect(summary.byConjugateFormCharacter).toEqual({ Major: 1, Minor: 0, Shadow: 1 });
        expect(summary.label).toBe('0.600 day resonance');
    });

    it('is pending-resonance for a day of unstamped artifacts (no fabricated average)', () => {
        const summary = summarizeDayResonance([{ artifactPath: 'a' }, { artifactPath: 'b' }]);
        expect(summary.state).toBe('pending-resonance');
        expect(summary.numericAverage).toBeNull();
        expect(summary.resolvedCount).toBe(0);
        expect(summary.pendingCount).toBe(2);
        expect(summary.label).toBe('pending-resonance');
    });

    it('is pending-resonance for an empty day', () => {
        const summary = summarizeDayResonance([]);
        expect(summary.state).toBe('pending-resonance');
        expect(summary.pendingCount).toBe(0);
        expect(summary.byConjugateFormCharacter).toEqual({ Major: 0, Minor: 0, Shadow: 0 });
    });
});
