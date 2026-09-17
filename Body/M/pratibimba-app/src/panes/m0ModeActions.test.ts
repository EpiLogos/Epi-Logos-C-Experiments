import { describe, expect, it } from 'vitest';
import {
    M0_AUTHORING_DEEPLINKS,
    M0_DR_M0_1_BANNER,
    M0_ROUTED_ACTIONS,
    m0ActionsForMode,
    type M0SurfaceMode
} from './m0ModeActions';

describe('m0ModeActions — reading/authoring mode-keyed M0 action model (21.12)', () => {
    it('SC-2 invariant: every routed action pins mutatesGraphCanon false (DR-M0-1)', () => {
        for (const action of M0_ROUTED_ACTIONS) {
            expect(action.mutatesGraphCanon).toBe(false);
        }
    });

    it('declares exactly the three spec-named M5-routed actions', () => {
        expect(M0_ROUTED_ACTIONS.map(a => a.id).sort()).toEqual([
            'deposit-graph-readiness-evidence',
            'open-language-development-route',
            'request-anuttara-review'
        ]);
    });

    it('every action targets a real carrier intent target (extension + contribution)', () => {
        const byId = Object.fromEntries(M0_ROUTED_ACTIONS.map(a => [a.id, a]));
        expect(byId['deposit-graph-readiness-evidence']).toMatchObject({
            requestedExtensionId: 'm5-epii',
            requestedContributionId: 'evidence-deposit'
        });
        expect(byId['open-language-development-route']).toMatchObject({
            requestedExtensionId: 'm0-anuttara',
            requestedContributionId: 'language'
        });
        expect(byId['request-anuttara-review']).toMatchObject({
            requestedExtensionId: 'm5-epii',
            requestedContributionId: 'review'
        });
    });

    it('reading mode exposes ONLY the readiness-evidence deposit (routed-write hidden)', () => {
        const reading = m0ActionsForMode('reading');
        expect(reading.map(a => a.id)).toEqual(['deposit-graph-readiness-evidence']);
    });

    it('authoring mode exposes all three routed actions', () => {
        const authoring = m0ActionsForMode('authoring');
        expect(authoring).toHaveLength(3);
        expect(authoring).toEqual(M0_ROUTED_ACTIONS);
    });

    it('the two authoring deep-links route through the single M5-governance path (DR-M0-1)', () => {
        expect(M0_AUTHORING_DEEPLINKS.map(d => d.id)).toEqual(['canonStudio', 'logosAtelier']);
        for (const link of M0_AUTHORING_DEEPLINKS) {
            // DR-M0-1: M0' has ONE routed-write path — M5 governed review (omniReview).
            expect(link.requestedExtensionId).toBe('m5-epii');
            expect(link.requestedContributionId).toBe('review');
        }
    });

    it('carries the DR-M0-1 banner text verbatim', () => {
        expect(M0_DR_M0_1_BANNER).toBe(
            "Per DR-M0-1: M0' never mutates canon. Routed-write via M5 atelier governance."
        );
    });

    it('m0ActionsForMode is total over M0SurfaceMode', () => {
        const modes: M0SurfaceMode[] = ['reading', 'authoring'];
        for (const mode of modes) {
            expect(Array.isArray(m0ActionsForMode(mode))).toBe(true);
        }
    });
});
