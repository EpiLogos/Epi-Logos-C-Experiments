import { Disposable, SharedBridgeAdapter } from '@pratibimba/m-extension-runtime';

/**
 * Bridge availability gate consumed by the two integrated plugin
 * contributions: per 08.T1 verification ("both plugins register commands
 * and workspace layouts only after `kernel-bridge` is available"), the
 * Theia commands and named layouts must NOT be installed while the bridge
 * reports `bridge_unavailable` or has not yet been attached.
 *
 * The gate exposes a simple isAttached() snapshot plus an onChange Event so
 * the FrontendApplicationContribution can install commands when the bridge
 * arrives and uninstall them if the bridge later detaches.
 */
export class IntegratedBridgeGate {
    private listeners = new Set<(attached: boolean) => void>();
    private cachedAttached = false;
    private bridgeSubscription: Disposable | null = null;

    constructor(private readonly bridge: SharedBridgeAdapter) {
        this.bridgeSubscription = this.bridge.onConnectionStatus(status => {
            const nextAttached = status.connected && status.mode !== 'detached';
            if (nextAttached !== this.cachedAttached) {
                this.cachedAttached = nextAttached;
                for (const listener of this.listeners) {
                    listener(this.cachedAttached);
                }
            }
        });
    }

    isAttached(): boolean {
        return this.cachedAttached;
    }

    onChange(listener: (attached: boolean) => void): Disposable {
        this.listeners.add(listener);
        listener(this.cachedAttached);
        return {
            dispose: () => {
                this.listeners.delete(listener);
            }
        };
    }

    dispose(): void {
        this.bridgeSubscription?.dispose();
        this.bridgeSubscription = null;
        this.listeners.clear();
    }
}
