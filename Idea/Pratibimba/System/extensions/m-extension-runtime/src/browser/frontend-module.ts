import { ContainerModule } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../common/shared-bridge';

/**
 * DI symbol the six M-extensions resolve to obtain the single fan-out adapter.
 * Bound as a singleton here so any number of consumer extensions share the
 * same `SharedBridgeAdapter` instance.
 */
export const SHARED_BRIDGE_ADAPTER = Symbol('SharedBridgeAdapter');

export default new ContainerModule((bind, _unbind, isBound) => {
    if (!isBound(SHARED_BRIDGE_ADAPTER)) {
        bind(SHARED_BRIDGE_ADAPTER)
            .toDynamicValue(() => new SharedBridgeAdapter())
            .inSingletonScope();
    }
});
