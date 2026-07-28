/**
 * 29.T29.6 — hard fail at load, graceful degrade at runtime. Closes 15.4's
 * verification.
 *
 * The two laws are different in kind and the tests keep them apart: a CONTRACT
 * breach refuses the mount and names every offender; a RUNTIME absence leaves
 * the composition mounted with one slot unable to paint.
 */

import { describe, expect, it } from 'vitest';

import { COSMIC_COMPOSITION_CONTRIBUTORS } from './cosmicComposition';
import { describeCompositionLoad, loadComposition } from './compositionLoad';
import type { CompositionContributor } from './geometricSlotEnforcement';
import { PERSONAL_COMPOSITION_CONTRIBUTORS } from './personalComposition';

function profileWith(fields: Record<string, unknown>) {
    return {
        generation: 1,
        cachedAtMs: 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { harmonicProfile: fields }
    } as never;
}

const FULL_PROFILE = profileWith({
    kleinFlip: false,
    resonance72Index: 36,
    audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
    nodalQuartet: [{ qlPosition: 0, helix: 'a', m: 1, n: 2 }]
});

describe('hard fail at load — the contract is not negotiable (15.4)', () => {
    it('refuses a side-by-side compact view, naming the contributor (15.4 verbatim)', () => {
        const result = loadComposition(
            'cosmic-engine.integrated',
            [
                ...COSMIC_COMPOSITION_CONTRIBUTORS,
                { extensionId: 'm5-sidebar', compactViewSlot: 'side-by-side', miniModeFallback: true }
            ],
            FULL_PROFILE
        );
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.rejection.rejections).toHaveLength(1);
            expect(result.rejection.rejections[0].extensionId).toBe('m5-sidebar');
            expect(result.rejection.rejections[0].reason).toBe(
                'contribution-declares-side-by-side-slot'
            );
            expect(result.rejection.rejections[0].humanReason).toContain('slots, not columns');
        }
    });

    it('refuses a widget with no claim and no mini-mode fallback', () => {
        const result = loadComposition(
            'cosmic-engine.integrated',
            [...COSMIC_COMPOSITION_CONTRIBUTORS, { extensionId: 'm4-orphan' }],
            FULL_PROFILE
        );
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.rejection.rejections[0].reason).toBe(
                'contribution-has-no-mini-mode-fallback-and-no-geometric-claim'
            );
            expect(result.rejection.rejections[0].humanReason).toContain('nowhere to put it');
        }
    });

    it('refuses a raw personal body on a geometric slot, on EITHER composition', () => {
        // The spec scopes this to the personal layout. Kept universal: the
        // forbidden classes are personal material, and a cosmic contributor
        // declaring a journal body is just as wrong.
        for (const compositionId of ['cosmic-engine.integrated', 'jiva-siva.integrated'] as const) {
            const result = loadComposition(
                compositionId,
                [
                    {
                        extensionId: 'm4-leak',
                        geometricClaim: {
                            extensionId: 'm4-leak',
                            geometricSlot: 'grounding',
                            priority: 0,
                            handleClass: 'plaintext-journal'
                        }
                    }
                ],
                FULL_PROFILE
            );
            expect(result.ok, `${compositionId} granted a raw body`).toBe(false);
            if (!result.ok) {
                expect(result.rejection.rejections[0].reason).toBe(
                    'contribution-declares-raw-body-on-geometric-slot'
                );
                expect(result.rejection.compositionId).toBe(compositionId);
            }
        }
    });

    it('reports EVERY offender, not just the first', () => {
        // The mount is refused either way, so withholding the rest only makes
        // an author fix one, re-run, and find the next.
        const result = loadComposition(
            'jiva-siva.integrated',
            [
                { extensionId: 'a-side-by-side', compactViewSlot: 'side-by-side', miniModeFallback: true },
                { extensionId: 'b-no-claim' },
                {
                    extensionId: 'c-raw-body',
                    geometricClaim: {
                        extensionId: 'c-raw-body',
                        geometricSlot: 'left-composition',
                        priority: 0,
                        handleClass: 'raw-quaternion'
                    }
                }
            ],
            FULL_PROFILE
        );
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.rejection.rejections.map(r => r.extensionId)).toEqual([
                'a-side-by-side',
                'b-no-claim',
                'c-raw-body'
            ]);
            expect(new Set(result.rejection.rejections.map(r => r.reason)).size).toBe(3);
        }
    });

    it('names every offender in the one-line reading too', () => {
        const result = loadComposition('jiva-siva.integrated', [
            { extensionId: 'x-orphan' },
            { extensionId: 'y-orphan' }
        ]);
        const text = describeCompositionLoad(result);
        expect(text).toContain('composition refused (2)');
        expect(text).toContain('x-orphan');
        expect(text).toContain('y-orphan');
    });

    it('still refuses a second claimant on an occupied slot', () => {
        const intruder: CompositionContributor = {
            extensionId: 'm5-overlay',
            geometricClaim: {
                extensionId: 'm5-overlay',
                geometricSlot: 'surface',
                priority: 9,
                handleClass: 'k2-surface-handle'
            }
        };
        const result = loadComposition(
            'cosmic-engine.integrated',
            [...COSMIC_COMPOSITION_CONTRIBUTORS, intruder],
            FULL_PROFILE
        );
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.rejection.rejections[0].extensionId).toBe('m5-overlay');
            expect(result.rejection.rejections[0].reason).toBe('contested-geometric-slot');
        }
    });
});

describe('graceful degrade at runtime — the composition stays mounted', () => {
    it('mounts the real declarations and carries their readiness', () => {
        const result = loadComposition(
            'jiva-siva.integrated',
            PERSONAL_COMPOSITION_CONTRIBUTORS,
            FULL_PROFILE
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.mounted.compositionId).toBe('jiva-siva.integrated');
            expect(result.mounted.grantedGeometricClaims).toHaveLength(6);
            expect(result.mounted.readiness.compositionId).toBe('jiva-siva.integrated');
        }
    });

    it('KEEPS the mount when a transported field is absent, and says which slots degraded', () => {
        // This is the law: a runtime absence must not take the whole surface
        // away because one pole is waiting.
        const result = loadComposition(
            'cosmic-engine.integrated',
            COSMIC_COMPOSITION_CONTRIBUTORS,
            profileWith({ resonance72Index: 36 })
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            // Every granted owner still stands…
            expect(result.mounted.grantedGeometricClaims.map(c => c.geometricSlot)).toEqual([
                'surface',
                'texture',
                'cell-state'
            ]);
            // …and the readiness names what cannot paint.
            expect(result.mounted.readiness.overall).not.toBe('ready');
            const ids = result.mounted.readiness.compositionBlockers.map(b => b.id);
            expect(ids).toContain('pending-klein-flip');
            expect(describeCompositionLoad(result)).toContain('degraded:');
        }
    });

    it('a contract breach and a runtime absence are different outcomes, not degrees', () => {
        const breach = loadComposition('cosmic-engine.integrated', [
            { extensionId: 'bad', compactViewSlot: 'side-by-side', miniModeFallback: true }
        ]);
        const absence = loadComposition(
            'cosmic-engine.integrated',
            COSMIC_COMPOSITION_CONTRIBUTORS,
            profileWith({})
        );
        expect(breach.ok).toBe(false);
        expect(absence.ok).toBe(true);
    });

    it('reads a fully-supplied cosmic mount as undegraded', () => {
        const result = loadComposition(
            'cosmic-engine.integrated',
            [
                ...COSMIC_COMPOSITION_CONTRIBUTORS,
                {
                    extensionId: 'm0-anuttara',
                    geometricClaim: {
                        extensionId: 'm0-anuttara',
                        geometricSlot: 'grounding',
                        priority: 3,
                        handleClass: 'r-virtue-witness'
                    }
                }
            ],
            FULL_PROFILE
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(describeCompositionLoad(result)).not.toContain('degraded');
            expect(result.mounted.readiness.overall).toBe('ready');
        }
    });
});
