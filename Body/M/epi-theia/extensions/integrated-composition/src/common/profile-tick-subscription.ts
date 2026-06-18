import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

export interface CompositionProfileTickSubscription {
    readonly currentProfile: MathemeHarmonicProfileBoundary | null;
    readonly currentGeneration: number | null;
    readonly subscribe: (listener: (profile: MathemeHarmonicProfileBoundary) => void) => Disposable;
    readonly dispose: () => void;
}

export function openCompositionProfileSubscription(
    bridge: SharedBridgeAdapter
): CompositionProfileTickSubscription {
    let disposed = false;
    let currentProfile: MathemeHarmonicProfileBoundary | null = null;
    const listeners = new Set<(profile: MathemeHarmonicProfileBoundary) => void>();
    const upstream = bridge.onProfile(profile => {
        currentProfile = profile;
        if (!profile) {
            return;
        }
        for (const listener of listeners) {
            listener(profile);
        }
    });

    return Object.freeze({
        get currentProfile() {
            return currentProfile;
        },
        get currentGeneration() {
            return currentProfile?.generation ?? null;
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
        dispose(): void {
            if (disposed) {
                return;
            }
            disposed = true;
            listeners.clear();
            upstream.dispose();
        }
    });
}
