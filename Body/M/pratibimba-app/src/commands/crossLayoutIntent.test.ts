/** Behavioral contract for the active-carrier cross-layout intent spine. */

import { describe, expect, it, vi } from 'vitest';
import {
    CROSS_LAYOUT_INTENT_TARGETS,
    dispatchCrossLayoutIntent,
    intentTarget,
    parseCrossLayoutIntent
} from './crossLayoutIntent';

const INTENT = {
    coordinate: 'M5-4',
    artifactUri: 'Idea/Bimba/Seeds/M/M5.md',
    reviewId: 'review-17',
    dayNow: '07-14-2026',
    sessionKey: 'session-31',
    profileGeneration: 12,
    privacyClass: 'protected',
    requestedExtensionId: 'm5-epii',
    requestedContributionId: 'review'
} as const;

describe('cross-layout intent targets (31.T31.10)', () => {
    it('catalogues the 45 declared targets across all six M families', () => {
        expect(CROSS_LAYOUT_INTENT_TARGETS).toHaveLength(45);
        expect(new Set(CROSS_LAYOUT_INTENT_TARGETS.map(t => `${t.extensionId}/${t.contributionId}`)).size)
            .toBe(CROSS_LAYOUT_INTENT_TARGETS.length);
        expect(new Set(CROSS_LAYOUT_INTENT_TARGETS.map(t => t.extensionId))).toEqual(
            new Set(['m0-anuttara', 'm1-paramasiva', 'm2-parashakti', 'm3-mahamaya', 'm4-nara', 'm5-epii'])
        );
    });

    it('contains every explicitly named Stage-1 target with a mounted host', () => {
        for (const [extensionId, contributionId] of [
            ['m0-anuttara', 'graph'], ['m0-anuttara', 'pedagogy'],
            ['m1-paramasiva', 'instrument'], ['m2-parashakti', 'cymatic'],
            ['m2-parashakti', 'correspondenceTree'], ['m3-mahamaya', 'wheel'],
            ['m3-mahamaya', 'cosmicClock'], ['m3-mahamaya', 'decanChain'],
            ['m4-nara', 'dayCalendar'], ['m4-nara', 'medicine'],
            ['m5-epii', 'review'], ['m5-epii', 'evidence-deposit'],
            ['m5-epii', 'recognitionLayer'], ['m5-epii', 'mobiusPassRibbon']
        ]) {
            expect(intentTarget({ requestedExtensionId: extensionId, requestedContributionId: contributionId })).not.toBeNull();
        }
        expect(CROSS_LAYOUT_INTENT_TARGETS.every(target => target.component.length > 0)).toBe(true);
    });

    it('preserves the complete envelope while applying real navigation dependencies', async () => {
        const setCoordinate = vi.fn();
        const applySession = vi.fn();
        const navigate = vi.fn();
        const result = await dispatchCrossLayoutIntent(INTENT, {
            setCoordinate, applySession, navigate
        });
        expect(result.component).toBe('omniReview');
        expect(setCoordinate).toHaveBeenCalledWith('M5-4');
        expect(applySession).toHaveBeenCalledWith(INTENT);
        expect(navigate).toHaveBeenCalledWith(result, INTENT);
        expect(navigate.mock.calls[0]?.[1]?.artifactUri).toBe(INTENT.artifactUri);
        expect(Object.isFrozen(parseCrossLayoutIntent(INTENT))).toBe(true);
    });

    it('fails closed for unknown and malformed targets', async () => {
        const dependencies = {
            setCoordinate: vi.fn(), applySession: vi.fn(), navigate: vi.fn()
        };
        await expect(dispatchCrossLayoutIntent({ ...INTENT, requestedContributionId: 'unknown' }, dependencies))
            .rejects.toThrow('unregistered intent target');
        expect(() => parseCrossLayoutIntent({ ...INTENT, profileGeneration: -1 })).toThrow('profileGeneration');
        expect(dependencies.navigate).not.toHaveBeenCalled();
    });
});
