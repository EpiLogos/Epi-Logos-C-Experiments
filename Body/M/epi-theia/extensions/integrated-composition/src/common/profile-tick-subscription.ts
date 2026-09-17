import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

export interface CompositionProfileTickSubscription {
    readonly currentProfile: MathemeHarmonicProfileBoundary | null;
    readonly currentGeneration: number | null;
    readonly currentTick: CompositionProfileTickEvent | null;
    readonly subscribe: (listener: (profile: MathemeHarmonicProfileBoundary) => void) => Disposable;
    readonly subscribeToProfileTick: (listener: (event: CompositionProfileTickEvent) => void) => Disposable;
    readonly dispose: () => void;
}

export interface CompositionProfileTickEvent {
    readonly profile: MathemeHarmonicProfileBoundary;
    readonly generation: number;
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly intervalMs: number | null;
}

export function openCompositionProfileSubscription(
    bridge: SharedBridgeAdapter
): CompositionProfileTickSubscription {
    let disposed = false;
    let currentProfile: MathemeHarmonicProfileBoundary | null = null;
    let currentTick: CompositionProfileTickEvent | null = null;
    const listeners = new Set<(profile: MathemeHarmonicProfileBoundary) => void>();
    const tickListeners = new Set<(event: CompositionProfileTickEvent) => void>();
    const upstream = bridge.onProfile(profile => {
        currentProfile = profile;
        if (!profile) {
            return;
        }
        currentTick = profileTickEventFromProfile(profile);
        for (const listener of listeners) {
            listener(profile);
        }
        for (const listener of tickListeners) {
            listener(currentTick);
        }
    });

    return Object.freeze({
        get currentProfile() {
            return currentProfile;
        },
        get currentGeneration() {
            return currentProfile?.generation ?? null;
        },
        get currentTick() {
            return currentTick;
        },
        subscribe(listener: (profile: MathemeHarmonicProfileBoundary) => void): Disposable {
            if (disposed) {
                return { dispose: () => undefined };
            }
            listeners.add(listener);
            if (currentProfile) {
                listener(currentProfile);
            }
            return {
                dispose: () => {
                    listeners.delete(listener);
                }
            };
        },
        subscribeToProfileTick(listener: (event: CompositionProfileTickEvent) => void): Disposable {
            if (disposed) {
                return { dispose: () => undefined };
            }
            tickListeners.add(listener);
            if (currentTick) {
                listener(currentTick);
            }
            return {
                dispose: () => {
                    tickListeners.delete(listener);
                }
            };
        },
        dispose(): void {
            if (disposed) {
                return;
            }
            disposed = true;
            listeners.clear();
            tickListeners.clear();
            upstream.dispose();
        }
    });
}

export function profileTickEventFromProfile(
    profile: MathemeHarmonicProfileBoundary
): CompositionProfileTickEvent {
    const payload = profile.payload;
    const tickAddress = recordValue(payload.tickAddress);
    return Object.freeze({
        profile,
        generation: profile.generation,
        tick12: normalizedTick12(finiteNumber(payload.tick12 ?? tickAddress?.tick12 ?? payload.tick)),
        position6: normalizedPosition6(finiteNumber(payload.position6 ?? tickAddress?.position6)),
        intervalMs: positiveFiniteNumber(payload.intervalMs ?? payload.tickIntervalMs ?? tickAddress?.intervalMs)
    });
}

function normalizedTick12(value: number | null): number | null {
    if (value === null) {
        return null;
    }
    return positiveModulo(Math.floor(value), 12);
}

function normalizedPosition6(value: number | null): number | null {
    if (value === null) {
        return null;
    }
    return positiveModulo(Math.floor(value), 6);
}

function positiveModulo(value: number, modulus: number): number {
    return ((value % modulus) + modulus) % modulus;
}

function finiteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function positiveFiniteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}
