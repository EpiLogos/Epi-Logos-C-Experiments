/**
 * Coordinate: M4' first-run onboarding (PASU-absence orchestration — 32.T32.2)
 * Residency: Body/M/pratibimba-app/src/onboarding
 * Position (#n): cold-start → identity-wizard branch (post-first-tick, pre-kairos)
 * Actualises: the first-run PASU-absence detection + routing DECISION. On the
 *   first profile-tick, cold-start fires `nara.pasu.show`; when PASU is absent
 *   (no PASU.md) and the wizard was not skipped, cold-start suspends the kairos
 *   stage and routes to the identity wizard (25.T25.4). This is the orchestration
 *   decision ONLY — a pure branch mirroring `coldStartKairosBranch`; the wizard
 *   MOUNT and its `nara.pasu.set` writes are 25.T25.4's deliverable. The routing
 *   carries NO write (DR-WC-M4-3: only the wizard writes, via `nara.pasu.set`).
 * Public surface: PASU_SHOW_RPC, PASU_SKIPPED_PREFERENCE, PASU_IDENTITY_STEPS,
 *   readPasuSkipped, detectPasuPresence, coldStartPasuBranch, recordPasuWizardSkip.
 * Does NOT own: the wizard UI + `nara.pasu.set` (25.T25.4), the kairos branch
 *   (panes/kairosEnablement.ts), or the completion-ledger keys (onboardingCompletionLedger).
 * Contract: [[M4'-SPEC]] + rerun tranche [[32.T32.2]] (DR-WC-OB-2, DR-WC-M4-3).
 */

import { PREFERENCE_KEYS } from '../ui/preferences';

export const PASU_SHOW_RPC = 'nara.pasu.show';

/** Preference array; `'wizard'` present means the full wizard was skipped.
 *  Aliases the one preference-key authority (`ui/preferences.ts`, 31.T31.9). */
export const PASU_SKIPPED_PREFERENCE = PREFERENCE_KEYS.onboardingPasuSkipped;

/** The six PASU identity completion steps (32.13 ledger keys; DR-WC-M4-3). */
export const PASU_IDENTITY_STEPS = [
    'identity.pasu-birth-date',
    'identity.pasu-birth-location',
    'identity.pasu-natal-chart',
    'identity.pasu-jungian',
    'identity.pasu-gene-keys',
    'identity.pasu-human-design'
] as const;

export function readPasuSkipped(value: unknown): boolean {
    return Array.isArray(value) && value.includes('wizard');
}

/**
 * Fire `nara.pasu.show` and classify PASU presence by the FILE-level `exists`
 * flag (the spec's "no PASU.md" absence signal). The gateway's `pasu_record`
 * (S0 pasu.rs) resolves a missing — or blank — `Idea/Pratibimba/Self/PASU.md` to
 * an all-empty record and never errors, so the `nara.pasu.show` handler carries
 * an explicit `exists` boolean: present when the file exists, ABSENT when it does
 * not (a truly first-run vault) so cold-start offers the wizard. A present-but-
 * blank PASU.md is NOT re-prompted at boot (it opens from settings, 32.4).
 * `invoke` returns the record artifact; never throws — a failure degrades to absent.
 */
export async function detectPasuPresence(
    invoke: (method: string, params: Record<string, unknown>) => Promise<unknown>
): Promise<boolean> {
    try {
        const record = await invoke(PASU_SHOW_RPC, {});
        if (!record || typeof record !== 'object') {
            return false;
        }
        return (record as Record<string, unknown>).exists === true;
    } catch {
        return false;
    }
}

/**
 * The cold-start PASU branch (mirrors `coldStartKairosBranch`). Decided on the
 * first profile-tick:
 * - PASU absent AND the wizard was not skipped → `'mount-wizard'` (route to
 *   25.4; the kairos stage is suspended until the wizard resolves).
 * - PASU present, OR the wizard was skipped → `'proceed'` (advance to the
 *   kairos branch).
 */
export function coldStartPasuBranch(
    pasuPresent: boolean,
    pasuSkippedPreference: unknown
): 'mount-wizard' | 'proceed' {
    if (pasuPresent) {
        return 'proceed';
    }
    return readPasuSkipped(pasuSkippedPreference) ? 'proceed' : 'mount-wizard';
}

export interface OnboardingPreferences {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
}

/**
 * Persist a full-wizard skip: append `'wizard'` to the pasu-skipped preference
 * (idempotent, deduped). A skipped wizard makes `coldStartPasuBranch` return
 * `'proceed'` on the next launch — the user is never re-prompted unless they
 * clear the skip in settings (32.4). Survives session restart via the
 * preference store. Returns the resulting skip list.
 */
export function recordPasuWizardSkip(preferences: OnboardingPreferences): readonly string[] {
    const current = preferences.get(PASU_SKIPPED_PREFERENCE);
    const existing = Array.isArray(current)
        ? current.filter((entry): entry is string => typeof entry === 'string')
        : [];
    const next = [...new Set([...existing, 'wizard'])];
    preferences.set(PASU_SKIPPED_PREFERENCE, next);
    return next;
}
