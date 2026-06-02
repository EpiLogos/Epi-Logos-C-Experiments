import {
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt,
    KernelBridgeCapabilityRequest,
    KernelBridgeConnectionStatus,
    KernelBridgeRuntimeEvent,
    KernelBridgeSubscriptionProfile
} from './types';

export const KERNEL_BRIDGE_SERVICE_PATH = '/services/pratibimba/kernel-bridge';

export interface KernelBridgeFrontendClient {
    notifyConnectionStatus(status: KernelBridgeConnectionStatus): void;
    notifyProfile(profile: KernelBridgeCachedProfile): void;
    notifyRuntimeEvent(event: KernelBridgeRuntimeEvent): void;
}
export interface KernelBridgeBackendService {
    setClient(client: KernelBridgeFrontendClient | undefined): void;
    start(mode: KernelBridgeSubscriptionProfile): Promise<void>;
    stop(): Promise<void>;
    requestSubscriptionMode(mode: KernelBridgeSubscriptionProfile): Promise<void>;
    invokeCapability(request: KernelBridgeCapabilityRequest): Promise<KernelBridgeCapabilityReceipt>;
}
