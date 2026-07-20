/**
 * Coordinate: M' M4' (first-day orchestration - 32.T32.11)
 * Residency: Body/M/pratibimba-app/src/onboarding
 * Position (#n): cold-start to daily-flow transition
 * Actualises: day ensure, Khora NOW creation, optional Mercurius refresh,
 *   Nara session-open psyche anchor, and completion recording in order.
 * Public surface: firstSessionEligible, startFirstSession.
 * Does NOT own: filesystem templates, Khora lifecycle law, oracle law, or Kairos.
 * Contract: [[M4'-SPEC]] / [[32-onboarding-settings-empty-states]].
 */

import { KAIROS_ENABLED_PREFERENCE, ONBOARDING_COMPLETED_STEPS_PREFERENCE } from '../panes/kairosEnablement';

export const VAULT_DAY_ENSURE_RPC = 'vault.day.ensure';
export const KHORA_SESSION_START_RPC = 'khora.session_start';
export const NARA_SESSION_OPEN_RPC = 'nara.session_open';
export const KAIROS_REFRESH_RPC = 'nara.kairos.sync';
export const FIRST_SESSION_STEP = 'first-session.start';

export interface FirstSessionPreferences {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
}

export interface FirstSessionDependencies {
    readonly preferences: FirstSessionPreferences;
    readonly invoke: (method: string, params: Record<string, unknown>) => Promise<unknown>;
}

export interface FirstSessionReceipt {
    readonly dayId: string;
    readonly sessionId: string;
    readonly nowPath: string;
    readonly createdNow: boolean;
    readonly kairosRefreshed: boolean;
    readonly psycheAnchor: unknown;
}

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
    return value as Record<string, unknown>;
}

function string(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${label} must be non-blank`);
    return value;
}

function completedSteps(preferences: FirstSessionPreferences): string[] {
    const value = preferences.get(ONBOARDING_COMPLETED_STEPS_PREFERENCE);
    return Array.isArray(value)
        ? [...new Set(value.filter((entry): entry is string => typeof entry === 'string'))]
        : [];
}

export function firstSessionEligible(preferences: FirstSessionPreferences): boolean {
    const completed = completedSteps(preferences);
    const walkthroughComplete = completed.includes('walkthrough.cosmic-personal');
    const identityComplete = [
        'identity.pasu-birth-date',
        'identity.pasu-birth-location',
        'identity.pasu-natal-chart',
        'identity.pasu-jungian',
        'identity.pasu-gene-keys',
        'identity.pasu-human-design'
    ].every(step => completed.includes(step));
    const pasuSkipped = preferences.get('epi-logos.onboarding.pasu-skipped');
    return walkthroughComplete
        && (identityComplete || (Array.isArray(pasuSkipped) && pasuSkipped.includes('wizard')));
}

export async function startFirstSession(
    dayId: string,
    dependencies: FirstSessionDependencies
): Promise<FirstSessionReceipt> {
    await dependencies.invoke(VAULT_DAY_ENSURE_RPC, { dayId });
    const khora = record(
        await dependencies.invoke(KHORA_SESSION_START_RPC, { dayId }),
        'Khora session-start receipt'
    );
    const sessionId = string(khora.sessionId, 'Khora sessionId');
    const nowPath = string(khora.nowPath, 'Khora nowPath');
    if (typeof khora.createdNow !== 'boolean') throw new Error('Khora createdNow must be boolean');
    if (string(khora.dayId, 'Khora dayId') !== dayId) throw new Error('Khora dayId does not match request');

    const kairosEnabled = dependencies.preferences.get(KAIROS_ENABLED_PREFERENCE) === true;
    if (kairosEnabled) {
        await dependencies.invoke(KAIROS_REFRESH_RPC, { reason: 'first-session-start', dayId, sessionId });
    }
    const psycheAnchor = await dependencies.invoke(NARA_SESSION_OPEN_RPC, {
        sessionId,
        dayId,
        nowPath
    });

    dependencies.preferences.set(
        ONBOARDING_COMPLETED_STEPS_PREFERENCE,
        [...new Set([...completedSteps(dependencies.preferences), FIRST_SESSION_STEP])]
    );
    return Object.freeze({
        dayId,
        sessionId,
        nowPath,
        createdNow: khora.createdNow,
        kairosRefreshed: kairosEnabled,
        psycheAnchor
    });
}
