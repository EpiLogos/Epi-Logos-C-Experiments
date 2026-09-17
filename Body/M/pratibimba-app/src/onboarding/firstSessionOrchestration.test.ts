import { describe, expect, it, vi } from 'vitest';
import {
    firstSessionEligible,
    FIRST_SESSION_STEP,
    startFirstSession,
    type FirstSessionPreferences
} from './firstSessionOrchestration';

class Preferences implements FirstSessionPreferences {
    readonly values = new Map<string, unknown>();
    get(key: string) { return this.values.get(key); }
    set(key: string, value: unknown) { this.values.set(key, value); }
}

describe('first-session orchestration (32.T32.11)', () => {
    it('requires walkthrough plus identity completion or an explicit PASU skip', () => {
        const preferences = new Preferences();
        preferences.set('epi-logos.onboarding.completed-steps', ['walkthrough.cosmic-personal']);
        expect(firstSessionEligible(preferences)).toBe(false);
        preferences.set('epi-logos.onboarding.pasu-skipped', ['wizard']);
        expect(firstSessionEligible(preferences)).toBe(true);
    });

    it('orders day, Khora, Mercurius, and psyche-anchor calls and records completion', async () => {
        const preferences = new Preferences();
        preferences.set('epi-logos.privacy.kairos-enabled', true);
        const calls: string[] = [];
        const invoke = vi.fn(async (method: string) => {
            calls.push(method);
            if (method === 'khora.session_start') {
                return {
                    dayId: '20-07-2026',
                    sessionId: '20260720-000000-a1b2c3',
                    nowPath: '/vault/20/20260720-000000-a1b2c3/now.md',
                    createdNow: true
                };
            }
            if (method === 'nara.session_open') return { proteinHandle: 'protein://session/1' };
            return {};
        });

        const receipt = await startFirstSession('20-07-2026', { preferences, invoke });

        expect(calls).toEqual([
            'vault.day.ensure',
            'khora.session_start',
            'nara.kairos.sync',
            'nara.session_open'
        ]);
        expect(receipt.kairosRefreshed).toBe(true);
        expect(preferences.get('epi-logos.onboarding.completed-steps')).toContain(FIRST_SESSION_STEP);
    });

    it('does not refresh Mercurius when Kairos is disabled', async () => {
        const preferences = new Preferences();
        const calls: string[] = [];
        const invoke = async (method: string) => {
            calls.push(method);
            return method === 'khora.session_start'
                ? { dayId: '20-07-2026', sessionId: 'session', nowPath: '/now.md', createdNow: false }
                : {};
        };
        await startFirstSession('20-07-2026', { preferences, invoke });
        expect(calls).not.toContain('nara.kairos.sync');
    });
});
