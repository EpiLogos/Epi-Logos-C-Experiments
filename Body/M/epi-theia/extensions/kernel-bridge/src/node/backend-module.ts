import { ContainerModule } from '@theia/core/shared/inversify';
import {
    ConnectionHandler,
    JsonRpcConnectionHandler
} from '@theia/core/lib/common/messaging';
import {
    KERNEL_BRIDGE_SERVICE_PATH,
    KernelBridgeBackendService
} from '../common/protocol';
import { KernelBridgeBackendServiceImpl } from './kernel-bridge-backend-service';

export default new ContainerModule(bind => {
    bind(KernelBridgeBackendServiceImpl).toSelf().inSingletonScope();
    bind(ConnectionHandler)
        .toDynamicValue(ctx =>
            new JsonRpcConnectionHandler<KernelBridgeBackendService>(
                KERNEL_BRIDGE_SERVICE_PATH,
                () => ctx.container.get(KernelBridgeBackendServiceImpl)
            )
        )
        .inSingletonScope();
});
