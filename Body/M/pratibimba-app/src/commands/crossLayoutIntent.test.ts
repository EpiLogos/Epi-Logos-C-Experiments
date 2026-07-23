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
    it('catalogues the M-family, ide-shell, and composition targets without collisions', () => {
        expect(CROSS_LAYOUT_INTENT_TARGETS).toHaveLength(55);
        expect(new Set(CROSS_LAYOUT_INTENT_TARGETS.map(t => `${t.extensionId}/${t.contributionId}`)).size)
            .toBe(CROSS_LAYOUT_INTENT_TARGETS.length);
        expect(CROSS_LAYOUT_INTENT_TARGETS.filter(t => t.extensionId === 'ide-shell-m0-m5')).toHaveLength(8);
    });

    it('resolves ide-shell handler patterns without weakening unknown-target refusal', () => {
        expect(intentTarget({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'term:anuttara'
        })?.contributionId).toBe('logos-atelier');
        expect(intentTarget({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'capacity:epii-self-referential'
        })?.contributionId).toBe('autoresearch-pane');
        expect(intentTarget({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'highlight-coordinate'
        })?.contributionId).toBe('coordinate-tree');
        expect(intentTarget({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'term:'
        })).toBeNull();
        expect(intentTarget({
            requestedExtensionId: 'm5-epii',
            requestedContributionId: 'capacity:epii-self-referential'
        })).toBeNull();
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

    it('exposes the 31.T31.5 launcher COMPOSE group: both engines reach their live compose faces', () => {
        // The discoverable grouped launcher (31.5) reaches the two compose
        // engines — cosmic 1-2-3 and personal 4-5-0 — through the single intent
        // dispatch; each resolves to its mounted factory component on the right
        // face and layout. This is the one launcher group (alongside cosmic /
        // personal / diagnostics) that lacked its own catalogue assertion.
        const cosmic = intentTarget({
            requestedExtensionId: 'plugin-integrated-1-2-3',
            requestedContributionId: 'cosmic-composition'
        });
        expect(cosmic?.component).toBe('cosmic');
        expect(cosmic?.face).toBe(0);
        expect(cosmic?.preferredLayout).toBe('daily-0-1');

        const personal = intentTarget({
            requestedExtensionId: 'plugin-integrated-4-5-0',
            requestedContributionId: 'personal-composition'
        });
        expect(personal?.component).toBe('personalHome');
        expect(personal?.face).toBe(1);
        expect(personal?.preferredLayout).toBe('daily-0-1');
    });

    it('promotes deep M-family contributions while OmniPanel receivers preserve the current layout', () => {
        expect(intentTarget({
            requestedExtensionId: 'm3-mahamaya',
            requestedContributionId: 'codon'
        })?.preferredLayout).toBe('ide-deep');
        expect(intentTarget({
            requestedExtensionId: 'm3-mahamaya',
            requestedContributionId: 'cosmicClock'
        })?.preferredLayout).toBe('daily-0-1');
        expect(intentTarget({
            requestedExtensionId: 'm5-epii',
            requestedContributionId: 'review'
        })?.preferredLayout).toBeNull();
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
