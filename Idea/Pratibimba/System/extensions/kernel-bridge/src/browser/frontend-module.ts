import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser/messaging';
import { SHARED_BRIDGE_ADAPTER } from '@pratibimba/m-extension-runtime';
import type { SharedBridgeAdapter } from '@pratibimba/m-extension-runtime';
import {
    KERNEL_BRIDGE_SERVICE_PATH,
    KernelBridgeBackendService
} from '../common/protocol';
import {
    KERNEL_BRIDGE_API,
    KernelBridgeAPI,
    KernelBridgeAPIImpl
} from './kernel-bridge-api';
import {
    KernelBridgeRuntimeClient,
    KernelBridgeRuntimeSource
} from './kernel-bridge-runtime-source';
import { KERNEL_BRIDGE_BACKEND_SERVICE } from './kernel-bridge-service-binding';
import { KernelBridgeStatusBarContribution } from './kernel-bridge-status-bar';
import { T3ToMExtBridgeAdapter } from './m-extension-runtime-bridge';

/**
 * Kernel-bridge frontend module — Track 05 T3.
 *
 * Bound types:
 *   - `KernelBridgeAPIImpl` is the singleton adapter.
 *   - `KERNEL_BRIDGE_API` symbol resolves to the same singleton so downstream
 *     extensions can `@inject(KERNEL_BRIDGE_API)` without a type-import on
 *     the implementation class.
 *   - `KernelBridgeStatusBarContribution` adds the status-bar item that
 *     reflects the live connection state.
 *
 * Runtime source: `KernelBridgeRuntimeSource` is constructed once when the
 * frontend app starts and starts the upstream WebSocket connection. It is
 * NOT in the DI container because there is exactly one instance per process
 * and downstream code interacts only via `KernelBridgeAPI`.
 */
export default new ContainerModule(bind => {
    bind(KernelBridgeAPIImpl).toSelf().inSingletonScope();
    bind<KernelBridgeAPI>(KERNEL_BRIDGE_API).toService(KernelBridgeAPIImpl);
    bind(KernelBridgeRuntimeClient).toSelf().inSingletonScope();
    bind<KernelBridgeBackendService>(KERNEL_BRIDGE_BACKEND_SERVICE)
        .toDynamicValue(ctx =>
            WebSocketConnectionProvider.createProxy<KernelBridgeBackendService>(
                ctx.container,
                KERNEL_BRIDGE_SERVICE_PATH,
                ctx.container.get(KernelBridgeRuntimeClient)
            )
        )
        .inSingletonScope();

    bind(KernelBridgeStatusBarContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(KernelBridgeStatusBarContribution);

    // Start the runtime source as a separate FrontendApplicationContribution
    // so it begins dialing the gateway as soon as the workbench loads.
    bind(KernelBridgeRuntimeSource).toSelf().inSingletonScope();
    bind(KernelBridgeBootstrap).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(KernelBridgeBootstrap);
});

import { injectable, inject } from '@theia/core/shared/inversify';

@injectable()
class KernelBridgeBootstrap implements FrontendApplicationContribution {
    @inject(KernelBridgeAPIImpl) protected readonly adapter!: KernelBridgeAPIImpl;
    @inject(KernelBridgeRuntimeSource) protected readonly source!: KernelBridgeRuntimeSource;
    @inject(SHARED_BRIDGE_ADAPTER) protected readonly sharedBridge!: SharedBridgeAdapter;

    async onStart(): Promise<void> {
        this.source.start();

        // T6 wiring: hand the live T3 bridge to m-extension-runtime's
        // SharedBridgeAdapter so all six M-extensions get real readiness +
        // profile + observability events without each opening its own
        // subscription.
        const adapter = new T3ToMExtBridgeAdapter(this.adapter);
        this.sharedBridge.attachBridge(adapter);
    }

    onStop(): void {
        this.source.dispose();
        this.sharedBridge.detachBridge();
    }
}
