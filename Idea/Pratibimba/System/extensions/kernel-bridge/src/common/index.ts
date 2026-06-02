export * from './types';
export * from './protocol';

// Browser-side helpers re-exported through the package root so downstream
// extensions can import `KernelBridgeAPI`, `KERNEL_BRIDGE_API`, etc. without
// reaching into `lib/browser/*` subpaths. Mirrors the m-extension-runtime
// barrel pattern.
export {
    KERNEL_BRIDGE_API,
    KernelBridgeAPIImpl
} from '../browser/kernel-bridge-api';
export type {
    KernelBridgeAPI,
    KernelBridgeEventHandler,
    KernelBridgeUnsubscribe
} from '../browser/kernel-bridge-api';
