import { describe, expect, it } from 'vitest';
import {
    FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC,
    GEOMETRIC_SLOTS,
    PERSONAL_GEOMETRIC_SLOTS,
    READS_ONLY_HANDLE_CLASSES,
    compositionLoad,
    enforceGeometricPrivacyBoundary,
    type CompositionContributor,
    type GeometricHandleClass,
    type IntegratedGeometricClaim
} from './geometricSlotEnforcement';

function claim(over: Partial<IntegratedGeometricClaim>): IntegratedGeometricClaim {
    return {
        extensionId: 'm4-nara',
        geometricSlot: 'left-composition',
        priority: 1,
        handleClass: 'opaque-handle',
        ...over
    };
}

function contributor(over: Partial<CompositionContributor>): CompositionContributor {
    return { extensionId: 'm4-nara', ...over };
}

describe('geometric-slot protected-local boundary (29.T29.13)', () => {
    it('exposes exactly the five raw-body forbidden handle classes (per 29.13 spec)', () => {
        expect([...FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC].sort()).toEqual(
            [
                'graphiti-episode-body',
                'plaintext-journal',
                'raw-audio-octet',
                'raw-natal-chart',
                'raw-quaternion'
            ].sort()
        );
    });

    it('enforces the six personal geometric slots (six-slot enforcement)', () => {
        expect([...PERSONAL_GEOMETRIC_SLOTS].sort()).toEqual(
            [
                'composition-ambient',
                'composition-status',
                'center-composition',
                'grounding',
                'left-composition',
                'right-composition'
            ].sort()
        );
        expect(PERSONAL_GEOMETRIC_SLOTS).toHaveLength(6);
    });

    it('rejects all 5 raw-body handle classes across all 6 personal geometric slots (30-case matrix)', () => {
        let cases = 0;
        for (const handleClass of FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC) {
            for (const geometricSlot of PERSONAL_GEOMETRIC_SLOTS) {
                const verdict = enforceGeometricPrivacyBoundary(claim({ handleClass, geometricSlot }));
                expect(verdict.allowed, `${handleClass} @ ${geometricSlot} must be rejected`).toBe(false);
                expect(verdict.allowed ? null : verdict.reason).toBe(
                    'contribution-declares-raw-body-on-geometric-slot'
                );
                cases += 1;
            }
        }
        expect(cases).toBe(30);
    });

    it('accepts the reads-only allow-list handle classes on texture and cell-state slots', () => {
        for (const handleClass of READS_ONLY_HANDLE_CLASSES) {
            for (const geometricSlot of ['texture', 'cell-state'] as const) {
                const verdict = enforceGeometricPrivacyBoundary(claim({ handleClass, geometricSlot }));
                expect(verdict.allowed, `${handleClass} @ ${geometricSlot} must be allowed`).toBe(true);
            }
        }
    });

    it('rejects a write-back (non-reads-only) handle class on a reads-only texture/cell-state slot', () => {
        const writeBack: GeometricHandleClass = 'psychoid-renderer-handle';
        const verdict = enforceGeometricPrivacyBoundary(
            claim({ handleClass: writeBack, geometricSlot: 'cell-state' })
        );
        expect(verdict.allowed).toBe(false);
        expect(verdict.allowed ? null : verdict.reason).toBe(
            'contribution-declares-write-back-on-reads-only-slot'
        );
    });

    it('rejects an unknown geometric slot', () => {
        const verdict = enforceGeometricPrivacyBoundary(
            claim({ geometricSlot: 'side-panel' as unknown as IntegratedGeometricClaim['geometricSlot'] })
        );
        expect(verdict.allowed).toBe(false);
        expect(verdict.allowed ? null : verdict.reason).toBe('unknown-geometric-slot');
    });

    it('accepts a valid k2-surface-handle claim on the surface slot', () => {
        const verdict = enforceGeometricPrivacyBoundary(
            claim({ extensionId: 'm1-paramasiva-played-torus', geometricSlot: 'surface', handleClass: 'k2-surface-handle' })
        );
        expect(verdict.allowed).toBe(true);
    });

    it('knows all nine geometric slots (cosmic four + personal six, grounding shared)', () => {
        expect([...GEOMETRIC_SLOTS].sort()).toEqual(
            [
                'cell-state',
                'composition-ambient',
                'composition-status',
                'center-composition',
                'grounding',
                'left-composition',
                'right-composition',
                'surface',
                'texture'
            ].sort()
        );
    });
});

describe('compositionLoad hard-fail at composition mount (29.T29.13 / 29.6 / 15.4)', () => {
    it('hard-fails a side-by-side contribution and names the offending contributor', () => {
        const result = compositionLoad([
            contributor({ extensionId: 'rogue-ext', compactViewSlot: 'side-by-side' })
        ]);
        expect(result.mounted).toBe(false);
        if (!result.mounted) {
            expect(result.rejection.reason).toBe('contribution-declares-side-by-side-slot');
            expect(result.rejection.contributorId).toBe('rogue-ext');
        }
    });

    it('hard-fails a contributor with no geometric claim, no widget claim, and no mini-mode fallback', () => {
        const result = compositionLoad([contributor({ extensionId: 'empty-ext' })]);
        expect(result.mounted).toBe(false);
        if (!result.mounted) {
            expect(result.rejection.reason).toBe(
                'contribution-has-no-mini-mode-fallback-and-no-geometric-claim'
            );
            expect(result.rejection.contributorId).toBe('empty-ext');
        }
    });

    it('hard-fails a raw-body geometric claim and names the contributor', () => {
        const result = compositionLoad([
            contributor({
                extensionId: 'leaky-ext',
                geometricClaim: claim({
                    extensionId: 'leaky-ext',
                    geometricSlot: 'left-composition',
                    handleClass: 'raw-natal-chart'
                })
            })
        ]);
        expect(result.mounted).toBe(false);
        if (!result.mounted) {
            expect(result.rejection.reason).toBe('contribution-declares-raw-body-on-geometric-slot');
            expect(result.rejection.contributorId).toBe('leaky-ext');
        }
    });

    it('mounts a valid cosmic composition (surface/texture/cell-state granted to their named owners)', () => {
        const result = compositionLoad([
            contributor({
                extensionId: 'm1-paramasiva-played-torus',
                geometricClaim: claim({
                    extensionId: 'm1-paramasiva-played-torus',
                    geometricSlot: 'surface',
                    handleClass: 'k2-surface-handle'
                })
            }),
            contributor({
                extensionId: 'm2-parashakti',
                geometricClaim: claim({
                    extensionId: 'm2-parashakti',
                    geometricSlot: 'texture',
                    handleClass: 'cymatic-mount-point'
                })
            }),
            contributor({
                extensionId: 'm3-mahamaya',
                geometricClaim: claim({
                    extensionId: 'm3-mahamaya',
                    geometricSlot: 'cell-state',
                    handleClass: 'codon-rotation-export'
                })
            })
        ]);
        expect(result.mounted).toBe(true);
        if (result.mounted) {
            const bySlot = Object.fromEntries(
                result.composition.grantedGeometricClaims.map(c => [c.geometricSlot, c.extensionId])
            );
            expect(bySlot).toEqual({
                surface: 'm1-paramasiva-played-torus',
                texture: 'm2-parashakti',
                'cell-state': 'm3-mahamaya'
            });
        }
    });

    it('mounts a contributor that has no geometric claim but declares a mini-mode fallback', () => {
        const result = compositionLoad([
            contributor({ extensionId: 'mini-only', miniModeFallback: true })
        ]);
        expect(result.mounted).toBe(true);
    });
});
