/** Behavioral contract for the active-carrier Kairos onboarding - 32.T32.10. */

import { beforeEach, describe, expect, it } from 'vitest';
import {
    KAIROS_ENABLED_PREFERENCE,
    KAIROS_ENABLE_STEP,
    KAIROS_SKIP_STEP,
    ONBOARDING_COMPLETED_STEPS_PREFERENCE,
    browserKairosPreferences,
    coldStartKairosBranch,
    readKairosEnabled,
    runKairosEnable,
    runKairosSkip
} from './kairosEnablement';

beforeEach(() => localStorage.clear());

describe('Kairos enablement law', () => {
    it('is default-off and mounts enablement until the user explicitly opts in', () => {
        expect(readKairosEnabled(undefined)).toBe(false);
        expect(readKairosEnabled('true')).toBe(false);
        expect(coldStartKairosBranch(undefined)).toBe('mount-enablement');
        expect(coldStartKairosBranch(true)).toBe('refresh');
    });

    it('keeps the preference false and does not refresh when the real dependency probe refuses', async () => {
        const calls: string[] = [];
        const result = await runKairosEnable({
            preferences: browserKairosPreferences(localStorage),
            invokeGatewayRpc: async method => {
                calls.push(method);
                return {
                    dependency: 'kerykeion',
                    available: false,
                    pythonAvailable: true,
                    version: null,
                    reason: 'swisseph cannot load'
                };
            },
            nowIso: () => '2026-07-14T22:55:00.000Z'
        });

        expect(calls).toEqual(['nara.kairos.probe_kerykeion']);
        if (result.outcome !== 'unavailable') throw new Error(`expected unavailable, got ${result.outcome}`);
        expect(result.message).toContain('pip3 install kerykeion');
        expect(localStorage.getItem(KAIROS_ENABLED_PREFERENCE)).toBe('false');
    });

    it('persists opt-in only after a successful probe and records active Mercurius refresh', async () => {
        const calls: string[] = [];
        const result = await runKairosEnable({
            preferences: browserKairosPreferences(localStorage),
            invokeGatewayRpc: async method => {
                calls.push(method);
                if (method === 'nara.kairos.probe_kerykeion') {
                    return {
                        dependency: 'kerykeion',
                        available: true,
                        pythonAvailable: true,
                        version: '4.26.3',
                        reason: null
                    };
                }
                return { result: 'Kairos synced' };
            },
            nowIso: () => '2026-07-14T22:56:00.000Z'
        });

        expect(calls).toEqual(['nara.kairos.probe_kerykeion', 'nara.kairos.sync']);
        expect(result).toMatchObject({
            outcome: 'enabled',
            refreshedAt: '2026-07-14T22:56:00.000Z',
            version: '4.26.3'
        });
        expect(localStorage.getItem(KAIROS_ENABLED_PREFERENCE)).toBe('true');
        expect(JSON.parse(localStorage.getItem(ONBOARDING_COMPLETED_STEPS_PREFERENCE) ?? '[]'))
            .toContain(KAIROS_ENABLE_STEP);
    });

    it('records a de-duplicated skip without enabling Kairos', () => {
        const preferences = browserKairosPreferences(localStorage);
        runKairosSkip(preferences);
        runKairosSkip(preferences);

        expect(preferences.completedSteps()).toEqual([KAIROS_SKIP_STEP]);
        expect(readKairosEnabled(preferences.get(KAIROS_ENABLED_PREFERENCE))).toBe(false);
    });
});
