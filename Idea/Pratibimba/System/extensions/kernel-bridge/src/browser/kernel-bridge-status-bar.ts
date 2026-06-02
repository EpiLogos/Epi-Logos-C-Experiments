import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution, StatusBar, StatusBarAlignment } from '@theia/core/lib/browser';
import { Disposable } from '@theia/core/lib/common/disposable';
import { KernelBridgeConnectionStatus } from '../common/types';
import { KERNEL_BRIDGE_API, KernelBridgeAPI } from './kernel-bridge-api';

const STATUS_BAR_ID = 'pratibimba.kernel-bridge.status';

@injectable()
export class KernelBridgeStatusBarContribution implements FrontendApplicationContribution {
    @inject(KERNEL_BRIDGE_API) protected readonly bridge!: KernelBridgeAPI;
    @inject(StatusBar) protected readonly statusBar!: StatusBar;

    protected subscription: Disposable | undefined;

    async onStart(): Promise<void> {
        this.update(this.bridge.connectionStatus);
        this.subscription = {
            dispose: this.bridge.onConnectionChange(status => this.update(status))
        };
    }

    onStop(): void {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = undefined;
        }
        this.statusBar.removeElement(STATUS_BAR_ID);
    }

    protected update(status: KernelBridgeConnectionStatus): void {
        const icon = iconForState(status);
        const tooltip = `kernel-bridge: ${status.reason}` +
            (status.profileGeneration !== null ? `\nprofile generation: ${status.profileGeneration}` : '') +
            `\nmode: ${status.mode}`;
        this.statusBar.setElement(STATUS_BAR_ID, {
            text: `${icon} kernel-bridge`,
            tooltip,
            alignment: StatusBarAlignment.LEFT,
            priority: 200
        });
    }
}

function iconForState(status: KernelBridgeConnectionStatus): string {
    switch (status.state) {
        case 'connected':
        case 'resynced':
            return '$(check)';
        case 'connecting':
        case 'reconnecting':
            return '$(sync~spin)';
        case 'degraded':
        case 'pending_lut':
            return '$(warning)';
        case 'protocol_mismatch':
        case 'private_blocked':
            return '$(error)';
        case 'disconnected':
        default:
            return '$(circle-slash)';
    }
}
