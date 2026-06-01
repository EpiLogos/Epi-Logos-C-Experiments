import { CoordinateContext } from './coordinate-context';
import { MObservabilityEvent } from './observability';
import { ConnectionStatus, MathemeHarmonicProfileBoundary } from './profile';
import { MExtensionReadinessSnapshot } from './readiness';

/**
 * KernelBridgeAPI — the dependency symbol named in 07.T0
 * (`sharedBridgeAdapter.dependencySymbol`). The full runtime/contract live in
 * Track 01 T5/T6. This interface is the shape M-extensions consume; any
 * downstream provider (Theia kernel-bridge extension, Tauri-owned singleton,
 * test stub) implements it.
 *
 * The required capabilities and subscriptions exactly match the 07.T0
 * manifest's `sharedBridgeAdapter` block so a static check can compare the two.
 */
export type Disposable = { dispose(): void };

export interface KernelBridgeAPI {
    /** capability: readCurrentProfile */
    readCurrentProfile(): Promise<MathemeHarmonicProfileBoundary | null>;

    /** capability: readPointerAnchor */
    readPointerAnchor(): Promise<string | null>;

    /** capability: readReadiness */
    readReadiness(): Promise<MExtensionReadinessSnapshot>;

    /** capability: subscribeObservability */
    subscribeObservability(listener: (event: MObservabilityEvent) => void): Disposable;

    /** capability: invokeGatewayRpc */
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;

    /** capability: depositKernelObservation */
    depositKernelObservation(event: MObservabilityEvent): Promise<void>;

    /** capability: requestReviewEvidence */
    requestReviewEvidence(handle: string): Promise<unknown>;

    /** subscription: onMathemeHarmonicProfile */
    onMathemeHarmonicProfile(listener: (profile: MathemeHarmonicProfileBoundary) => void): Disposable;

    /** subscription: onConnectionStatusChange */
    onConnectionStatusChange(listener: (status: ConnectionStatus) => void): Disposable;

    /** subscription: onObservabilityEvent */
    onObservabilityEvent(listener: (event: MObservabilityEvent) => void): Disposable;
}

export const KERNEL_BRIDGE_API = Symbol('KernelBridgeAPI');

/**
 * Catalogue used by the shared adapter and the contract-vs-runtime check.
 * Compared against the 07.T0 manifest by `verify-m-extension-runtime.mjs`.
 */
export const KERNEL_BRIDGE_REQUIRED_CAPABILITIES = Object.freeze([
    'readCurrentProfile',
    'readPointerAnchor',
    'readReadiness',
    'subscribeObservability',
    'invokeGatewayRpc',
    'depositKernelObservation',
    'requestReviewEvidence'
] as const);

export const KERNEL_BRIDGE_REQUIRED_SUBSCRIPTIONS = Object.freeze([
    'onMathemeHarmonicProfile',
    'onConnectionStatusChange',
    'onObservabilityEvent'
] as const);

/**
 * Identity-shaped CoordinateContext seed — kept here so adapters can hand a
 * fresh seed to subscribers without depending on the empty constant.
 */
export function seedCoordinateContext(generation: number | null): CoordinateContext {
    return Object.freeze({
        selectedCoordinate: null,
        hashInput: null,
        canonicalMCoordinate: null,
        profileGeneration: generation,
        pointerAnchor: null,
        dayNowSessionHandle: null,
        privacyClass: 'public_current',
        provenance: Object.freeze({
            source: 'm-extension-runtime:seed',
            generation,
            notes: Object.freeze([] as string[]) as readonly string[]
        })
    });
}
