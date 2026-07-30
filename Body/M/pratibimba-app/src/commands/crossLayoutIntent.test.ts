/** Behavioral contract for the active-carrier cross-layout intent spine. */

import { describe, expect, it, vi } from 'vitest';
import {
    CROSS_LAYOUT_INTENT_TARGETS,
    DEPTH_DIFFERENTIATED_COMPONENTS,
    dispatchCrossLayoutIntent,
    intentTarget,
    parseCrossLayoutIntent
} from './crossLayoutIntent';
import type { LayoutId } from '../ui/layoutId';

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

    // 52.T3 — the layout audit. Before this tranche `preferredLayout` defaulted
    // to 'ide-deep' and 32 of the 55 rows inherited it, so an intent could carry
    // a person across the DCC-07 authority boundary without any row deciding it.
    // The default is gone; these assertions are what keeps it gone.
    describe('layout audit (52.T3): no target promotes to depth by accident', () => {
        it('promotes ONLY into components whose render actually differs by layout', () => {
            const illegitimate = CROSS_LAYOUT_INTENT_TARGETS.filter(
                t =>
                    t.preferredLayout === 'ide-deep'
                    && !DEPTH_DIFFERENTIATED_COMPONENTS.includes(t.component)
            ).map(t => `${t.extensionId}/${t.contributionId} → ${t.component}`);
            expect(
                illegitimate,
                'a target may promote to ide-deep only when the deep layout gives it a different render'
            ).toEqual([]);
        });

        it('every row states its layout — the ledger holds no inherited answer', () => {
            // 17 promote to depth, 16 pull back to the daily preview, 22 keep
            // whatever layout the user chose. The counts are asserted so a bulk
            // edit that re-widens deep carriage has to say so here first.
            //
            // 28.T28.6 moved ONE row out of the depth column: `coordinate-tree`
            // pointed at `bimbaGraph` under `ide-deep` only because no
            // coordinate tree existed to receive it. The tree now mounts on
            // face 1 in BOTH layouts, so its render does not differ by layout
            // and the rule above (a target promotes only where depth gives it a
            // different render) forbids the promotion it used to take.
            const count = (value: LayoutId | null) =>
                CROSS_LAYOUT_INTENT_TARGETS.filter(t => t.preferredLayout === value).length;
            expect(count('ide-deep')).toBe(17);
            expect(count('daily-0-1')).toBe(16);
            expect(count(null)).toBe(22);
            expect(count('ide-deep') + count('daily-0-1') + count(null)).toBe(
                CROSS_LAYOUT_INTENT_TARGETS.length
            );
        });

        it('the surfaces that render identically in both layouts preserve the current one', () => {
            for (const [extensionId, contributionId] of [
                ['m1-paramasiva', 'kleinTopology'],
                ['m2-parashakti', 'correspondenceTree'],
                ['m4-nara', 'kairos'],
                ['m4-nara', 'medicine'],
                ['m5-epii', 'jointComposition']
            ] as const) {
                expect(
                    intentTarget({
                        requestedExtensionId: extensionId,
                        requestedContributionId: contributionId
                    })?.preferredLayout,
                    `${extensionId}/${contributionId} must not move the user's layout`
                ).toBeNull();
            }
        });
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
