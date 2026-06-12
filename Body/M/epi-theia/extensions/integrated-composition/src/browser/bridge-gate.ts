import * as React from 'react';
import type { Disposable } from '@pratibimba/m-extension-runtime/lib/common/bridge-api';
import { SharedBridgeAdapter } from '@pratibimba/m-extension-runtime/lib/common/shared-bridge';
import {
    type BridgeReadinessBinding,
    type BridgeReadinessSource,
    BridgeReadinessBadge,
    classifyReadiness,
    snapshotReadinessFromBridge,
    useBridgeReadiness
} from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';

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
    private readinessSubscription: Disposable | null = null;
    private readiness: BridgeReadinessBinding;
    readonly useBridgeReadiness = useBridgeReadiness;

    constructor(private readonly bridge: SharedBridgeAdapter) {
        this.readiness = classifyReadiness(snapshotReadinessFromBridge(this.readinessSource), 'integrated.bridge');
        this.bridgeSubscription = this.bridge.onConnectionStatus(status => {
            this.updateAttached(status.connected && status.mode !== 'detached');
        });
        this.readinessSubscription = this.bridge.onReadiness(snapshot => {
            this.readiness = classifyReadiness(snapshot, 'integrated.bridge');
            this.updateAttached(this.readiness.readinessId !== 'bridge_unavailable');
        });
    }

    renderBadge(bindingKey: string = 'integrated.bridge'): React.ReactNode {
        return React.createElement(BridgeReadinessBadge, {
            bridge: this.readinessSource,
            bindingKey,
            readiness: bindingKey === this.readiness.bindingKey ? this.readiness : undefined
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
        this.readinessSubscription?.dispose();
        this.readinessSubscription = null;
        this.listeners.clear();
    }

    private updateAttached(nextAttached: boolean): void {
        if (nextAttached !== this.cachedAttached) {
            this.cachedAttached = nextAttached;
            for (const listener of this.listeners) {
                listener(this.cachedAttached);
            }
        }
    }

    private get readinessSource(): BridgeReadinessSource {
        return this.bridge as unknown as BridgeReadinessSource;
    }
}
