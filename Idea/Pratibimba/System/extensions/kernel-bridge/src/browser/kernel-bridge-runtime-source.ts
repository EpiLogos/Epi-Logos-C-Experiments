import { inject, injectable } from '@theia/core/shared/inversify';
import {
    KernelBridgeBackendService,
    KernelBridgeFrontendClient
} from '../common/protocol';
import {
    KernelBridgeCachedProfile,
    KernelBridgeConnectionStatus,
    KernelBridgeRuntimeEvent
} from '../common/types';
import { KernelBridgeAPIImpl } from './kernel-bridge-api';
import { KERNEL_BRIDGE_BACKEND_SERVICE } from './kernel-bridge-service-binding';

@injectable()
export class KernelBridgeRuntimeClient implements KernelBridgeFrontendClient {
    @inject(KernelBridgeAPIImpl) protected readonly adapter!: KernelBridgeAPIImpl;

    notifyConnectionStatus(status: KernelBridgeConnectionStatus): void {
        this.adapter.setUpstreamSubscriptionCount(status.connected ? 1 : 0);
        this.adapter.applyConnectionStatus(status);
    }

    notifyProfile(profile: KernelBridgeCachedProfile): void {
        this.adapter.applyProfile(profile);
    }

    notifyRuntimeEvent(event: KernelBridgeRuntimeEvent): void {
        this.adapter.fireEvent(event);
    }
}
/**
 * Frontend wire layer for the Theia `kernel-bridge` extension.
 *
 * The frontend no longer opens the S3 gateway socket directly. It connects to
 * the Theia backend service via `WebSocketConnectionProvider`; the backend
 * service is the only Theia-side consumer of the external Rust gateway.
 */
@injectable()
export class KernelBridgeRuntimeSource {
    @inject(KernelBridgeAPIImpl) protected readonly adapter!: KernelBridgeAPIImpl;
    @inject(KERNEL_BRIDGE_BACKEND_SERVICE) protected readonly service!: KernelBridgeBackendService;

    start(): void {
        this.adapter.invokeCapabilityImpl = request => this.service.invokeCapability(request);
        this.adapter.onSubscriptionModeRequest = mode => {
            void this.service.requestSubscriptionMode(mode);
        };
        void this.service.start(this.adapter.connectionStatus.mode);
    }

    dispose(): void {
        this.adapter.onSubscriptionModeRequest = undefined;
        void this.service.stop();
    }
}
