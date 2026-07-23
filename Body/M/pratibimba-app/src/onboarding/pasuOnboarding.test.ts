/**
 * Coordinate: M4' first-run onboarding acceptance (32.T32.2 — PASU-absence branch)
 * Residency: Body/M/pratibimba-app/src/onboarding
 * Actualises: proves the cold-start PASU-absence detection + routing decision —
 *   absent PASU routes to the wizard, present or skipped proceeds, detection
 *   degrades to absent on gateway error, and a skip persists idempotently.
 * Contract: rerun tranche [[32.T32.2]] (DR-WC-OB-2, DR-WC-M4-3)
 */

import { describe, expect, it } from 'vitest';
import {
    coldStartPasuBranch,
    detectPasuPresence,
    PASU_IDENTITY_STEPS,
    PASU_SHOW_RPC,
    PASU_SKIPPED_PREFERENCE,
    readPasuSkipped,
    recordPasuWizardSkip,
    type OnboardingPreferences
} from './pasuOnboarding';

function memoryPreferences(seed: Record<string, unknown> = {}): OnboardingPreferences & { store: Map<string, unknown> } {
    const store = new Map<string, unknown>(Object.entries(seed));
    return {
        store,
        get: key => store.get(key),
        set: (key, value) => {
            store.set(key, value);
        }
    };
}

describe('32.T32.2 cold-start PASU-absence branch', () => {
    it('routes to the wizard when PASU is absent and the wizard was not skipped', () => {
        expect(coldStartPasuBranch(false, undefined)).toBe('mount-wizard');
        expect(coldStartPasuBranch(false, [])).toBe('mount-wizard');
    });

    it('proceeds when PASU is present (never re-prompts an existing identity)', () => {
        expect(coldStartPasuBranch(true, undefined)).toBe('proceed');
        expect(coldStartPasuBranch(true, ['wizard'])).toBe('proceed');
    });

    it('proceeds when the wizard was skipped, even with PASU absent', () => {
        expect(coldStartPasuBranch(false, ['wizard'])).toBe('proceed');
    });
});

describe('32.T32.2 PASU presence detection (nara.pasu.show)', () => {
    it('classifies a real show record as present', async () => {
        const calls: string[] = [];
        const invoke = async (method: string) => {
            calls.push(method);
            return { coordinate: 'PASU', c_0_birth_date: '1990-01-01' };
        };
        expect(await detectPasuPresence(invoke)).toBe(true);
        expect(calls).toEqual([PASU_SHOW_RPC]);
    });

    it('classifies a gateway error (no PASU.md) as absent, without throwing', async () => {
        const invoke = async () => {
            throw new Error('PASU.md not found');
        };
        expect(await detectPasuPresence(invoke)).toBe(false);
    });

    it('classifies a null/empty receipt as absent', async () => {
        expect(await detectPasuPresence(async () => null)).toBe(false);
        expect(await detectPasuPresence(async () => '')).toBe(false);
    });
});

describe('32.T32.2 wizard-skip persistence', () => {
    it('records a skip and reads it back (survives restart via the preference store)', () => {
        const prefs = memoryPreferences();
        const result = recordPasuWizardSkip(prefs);
        expect(result).toEqual(['wizard']);
        expect(readPasuSkipped(prefs.get(PASU_SKIPPED_PREFERENCE))).toBe(true);
        // and a fresh branch decision now proceeds even though PASU is absent
        expect(coldStartPasuBranch(false, prefs.get(PASU_SKIPPED_PREFERENCE))).toBe('proceed');
    });

    it('is idempotent — a second skip does not duplicate the entry', () => {
        const prefs = memoryPreferences({ [PASU_SKIPPED_PREFERENCE]: ['wizard'] });
        expect(recordPasuWizardSkip(prefs)).toEqual(['wizard']);
    });

    it('preserves unrelated skip entries', () => {
        const prefs = memoryPreferences({ [PASU_SKIPPED_PREFERENCE]: ['natal-chart'] });
        expect(recordPasuWizardSkip(prefs)).toEqual(['natal-chart', 'wizard']);
    });
});

describe('32.T32.2 identity step vocabulary', () => {
    it('declares the six DR-WC-M4-3 PASU completion steps', () => {
        expect(PASU_IDENTITY_STEPS).toHaveLength(6);
        expect(PASU_IDENTITY_STEPS).toContain('identity.pasu-birth-date');
        expect(PASU_IDENTITY_STEPS).toContain('identity.pasu-human-design');
    });
});
