/**
 * Coordinate: M' M4' (Kairos enablement onboarding - 32.T32.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): post-PASU optional temporal-ingress branch
 * Actualises: FR-3 default-off preference law, local dependency probe,
 *   Mercurius refresh request, and onboarding completion ledger.
 * Public surface: coldStartKairosBranch, runKairosEnable, runKairosSkip,
 *   browserKairosPreferences.
 * Does NOT own: Kerykeion, PASU/natal data, planet computation, or clocks.
 * Contract: [[M4'-SPEC]] / [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]].
 * Ported from: Body/M/epi-theia/extensions/m-extension-runtime/src/browser/
 *   onboarding/kairos-enablement-step.tsx (corrected to probe before opt-in).
 */

export const KAIROS_ENABLED_PREFERENCE = 'epi-logos.privacy.kairos-enabled';
export const ONBOARDING_COMPLETED_STEPS_PREFERENCE = 'epi-logos.onboarding.completed-steps';
export const KAIROS_ENABLE_STEP = 'kairos.enable';
export const KAIROS_SKIP_STEP = 'kairos.skip';
export const KAIROS_PROBE_RPC = 'nara.kairos.probe_kerykeion';
export const KAIROS_REFRESH_RPC = 'nara.kairos.sync';

export interface KairosPreferenceAccess {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    completedSteps(): readonly string[];
}

export interface KerykeionProbe {
    readonly dependency: 'kerykeion';
    readonly available: boolean;
    readonly pythonAvailable: boolean;
    readonly version: string | null;
    readonly reason: string | null;
}

export type KairosEnableResult =
    | { readonly outcome: 'enabled'; readonly refreshedAt: string; readonly version: string | null }
    | { readonly outcome: 'unavailable'; readonly message: string; readonly probe: KerykeionProbe }
    | { readonly outcome: 'refresh-failed'; readonly message: string; readonly version: string | null };

export interface KairosEnableDependencies {
    readonly preferences: KairosPreferenceAccess;
    readonly invokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    readonly nowIso?: () => string;
}

function stringOrNull(value: unknown, label: string): string | null {
    if (value === null) return null;
    if (typeof value !== 'string') throw new Error(`${label} must be a string or null`);
    return value;
}

export function parseKerykeionProbe(value: unknown): KerykeionProbe {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Kerykeion probe must be an object');
    }
    const raw = value as Record<string, unknown>;
    if (raw.dependency !== 'kerykeion') throw new Error('Kerykeion probe dependency must be kerykeion');
    if (typeof raw.available !== 'boolean') throw new Error('Kerykeion probe available must be boolean');
    if (typeof raw.pythonAvailable !== 'boolean') {
        throw new Error('Kerykeion probe pythonAvailable must be boolean');
    }
    return Object.freeze({
        dependency: 'kerykeion',
        available: raw.available,
        pythonAvailable: raw.pythonAvailable,
        version: stringOrNull(raw.version, 'Kerykeion probe version'),
        reason: stringOrNull(raw.reason, 'Kerykeion probe reason')
    });
}

export function readKairosEnabled(value: unknown): boolean {
    return value === true;
}

export function coldStartKairosBranch(value: unknown): 'refresh' | 'mount-enablement' {
    return readKairosEnabled(value) ? 'refresh' : 'mount-enablement';
}

function parseCompletedSteps(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0))];
}

export function browserKairosPreferences(storage: Storage): KairosPreferenceAccess {
    return {
        get(key) {
            const raw = storage.getItem(key);
            if (raw === null) return null;
            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        },
        set(key, value) {
            storage.setItem(key, JSON.stringify(value));
        },
        completedSteps() {
            const raw = storage.getItem(ONBOARDING_COMPLETED_STEPS_PREFERENCE);
            if (raw === null) return [];
            try {
                return parseCompletedSteps(JSON.parse(raw));
            } catch {
                return [];
            }
        }
    };
}

function recordStep(preferences: KairosPreferenceAccess, step: string): readonly string[] {
    const next = [...new Set([...preferences.completedSteps(), step])];
    preferences.set(ONBOARDING_COMPLETED_STEPS_PREFERENCE, next);
    return next;
}

export async function runKairosEnable(dependencies: KairosEnableDependencies): Promise<KairosEnableResult> {
    let probe: KerykeionProbe;
    try {
        probe = parseKerykeionProbe(await dependencies.invokeGatewayRpc(KAIROS_PROBE_RPC, {}));
    } catch (error) {
        probe = {
            dependency: 'kerykeion',
            available: false,
            pythonAvailable: false,
            version: null,
            reason: error instanceof Error ? error.message : String(error)
        };
    }

    if (!probe.available) {
        dependencies.preferences.set(KAIROS_ENABLED_PREFERENCE, false);
        return {
            outcome: 'unavailable',
            probe,
            message:
                'Kerykeion not available. Suggested install: `pip3 install kerykeion`. ' +
                'Kairos will stay disabled; you can enable later in Settings -> Privacy.'
        };
    }

    dependencies.preferences.set(KAIROS_ENABLED_PREFERENCE, true);
    try {
        await dependencies.invokeGatewayRpc(KAIROS_REFRESH_RPC, { reason: 'kairos-enable-onboarding' });
        recordStep(dependencies.preferences, KAIROS_ENABLE_STEP);
        return {
            outcome: 'enabled',
            refreshedAt: (dependencies.nowIso ?? (() => new Date().toISOString()))(),
            version: probe.version
        };
    } catch (error) {
        return {
            outcome: 'refresh-failed',
            version: probe.version,
            message: `Kerykeion is available, but the initial Kairos refresh failed: ${
                error instanceof Error ? error.message : String(error)
            }`
        };
    }
}

export function runKairosSkip(preferences: KairosPreferenceAccess): readonly string[] {
    preferences.set(KAIROS_ENABLED_PREFERENCE, false);
    return recordStep(preferences, KAIROS_SKIP_STEP);
}
