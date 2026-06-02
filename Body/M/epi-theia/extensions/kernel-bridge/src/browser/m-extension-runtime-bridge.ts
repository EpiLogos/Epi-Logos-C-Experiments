/**
 * Adapter that exposes `@pratibimba/kernel-bridge`'s typed `KernelBridgeAPI`
 * (T3) as the m-extension-runtime's `KernelBridgeAPI` shape (T6 wiring).
 *
 * The six M-extension widgets consume `SharedBridgeAdapter` from
 * `m-extension-runtime`, which in turn fans out from a single
 * `KernelBridgeAPI` implementation via `attachBridge()`. This adapter
 * implements that interface by translating T3 events into the legacy shape.
 *
 * Without this wiring, the M-widgets sit idle on `PENDING_M_READINESS`
 * because nothing calls `SharedBridgeAdapter.attachBridge()`.
 */

import type {
    KernelBridgeAPI as MExtKernelBridgeAPI,
    Disposable as MExtDisposable
} from '@pratibimba/m-extension-runtime';
import type {
    MathemeHarmonicProfileBoundary,
    ConnectionStatus,
    MObservabilityEvent,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import {
    KernelBridgeCachedProfile,
    KernelBridgeConnectionStatus,
    KernelBridgeRuntimeEvent
} from '../common/types';
import { KernelBridgeAPI as T3KernelBridgeAPI } from './kernel-bridge-api';

const NOOP_DISPOSABLE: MExtDisposable = { dispose: () => undefined };

/**
 * Translates T3's `KernelBridgeAPI` into the m-extension-runtime's
 * `KernelBridgeAPI` shape so `SharedBridgeAdapter.attachBridge(this)`
 * receives live data.
 */
export class T3ToMExtBridgeAdapter implements MExtKernelBridgeAPI {
    constructor(private readonly source: T3KernelBridgeAPI) {}

    // ---- Capabilities (Promise<T> from T3 readers) ----

    async readCurrentProfile(): Promise<MathemeHarmonicProfileBoundary | null> {
        return translateProfile(this.source.cachedProfile);
    }

    async readPointerAnchor(): Promise<string | null> {
        const cached = this.source.cachedProfile;
        if (!cached) return null;
        const payload = cached.profile as Record<string, unknown> | null;
        const anchor = payload?.pointer_anchor ?? payload?.pointerAnchor;
        return typeof anchor === 'string' ? anchor : null;
    }

    async readReadiness(): Promise<MExtensionReadinessSnapshot> {
        return translateReadiness(this.source.connectionStatus, this.source.cachedProfile);
    }

    subscribeObservability(listener: (event: MObservabilityEvent) => void): MExtDisposable {
        const dispose = this.source.onEvent(event => {
            if (event.kind === 'observability') {
                listener(translateObservability(event));
            }
        });
        return { dispose };
    }

    async invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown> {
        const receipt = await this.source.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: typeof params.sessionKey === 'string' ? params.sessionKey : '',
            params: { gatewayMethod: method, ...params },
            profileGeneration: this.source.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
        return receipt.artifact;
    }

    async depositKernelObservation(event: MObservabilityEvent): Promise<void> {
        await this.source.invokeCapability({
            method: 'depositKernelObservation',
            sessionKey: '',
            params: { event },
            profileGeneration: this.source.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
    }

    async requestReviewEvidence(handle: string): Promise<unknown> {
        const receipt = await this.source.invokeCapability({
            method: 'requestReviewEvidence',
            sessionKey: '',
            params: { handle },
            profileGeneration: this.source.cachedProfile?.generation ?? null,
            provenanceHandles: [handle],
            vak: null
        });
        return receipt.artifact;
    }

    // ---- Subscriptions (translated from T3 events) ----

    onMathemeHarmonicProfile(
        listener: (profile: MathemeHarmonicProfileBoundary) => void
    ): MExtDisposable {
        const dispose = this.source.onProfile(cached => {
            const translated = translateProfile(cached);
            if (translated) {
                listener(translated);
            }
        });
        return { dispose };
    }

    onConnectionStatusChange(listener: (status: ConnectionStatus) => void): MExtDisposable {
        const dispose = this.source.onConnectionChange(t3 => listener(translateConnection(t3)));
        return { dispose };
    }

    onObservabilityEvent(listener: (event: MObservabilityEvent) => void): MExtDisposable {
        return this.subscribeObservability(listener);
    }

    // For symmetry — m-extension-runtime KernelBridgeAPI doesn't declare onCoordinateContext,
    // but SharedBridgeAdapter seeds context from the profile. If consumers ever need
    // coordinate context here we'd add it.
    static readonly NOOP_DISPOSABLE = NOOP_DISPOSABLE;
}

// ---- translation helpers ----

function translateProfile(
    cached: KernelBridgeCachedProfile | null
): MathemeHarmonicProfileBoundary | null {
    if (!cached) return null;
    const rawPayload = (cached.profile as Record<string, unknown> | null) ?? {};
    const capabilities = Array.isArray(rawPayload.capabilities)
        ? (rawPayload.capabilities as string[])
        : [];
    const pointerAnchor =
        typeof rawPayload.pointer_anchor === 'string'
            ? (rawPayload.pointer_anchor as string)
            : typeof rawPayload.pointerAnchor === 'string'
              ? (rawPayload.pointerAnchor as string)
              : null;
    return {
        generation: cached.generation,
        capabilities,
        pointerAnchor,
        payload: rawPayload
    };
}

function translateConnection(t3: KernelBridgeConnectionStatus): ConnectionStatus {
    const mode: ConnectionStatus['mode'] = t3.mode === 'full' ? 'full' : 'lite';
    return {
        connected: t3.connected,
        reason: t3.reason,
        mode
    };
}

function translateReadiness(
    connection: KernelBridgeConnectionStatus,
    cached: KernelBridgeCachedProfile | null
): MExtensionReadinessSnapshot {
    const ready = connection.connected && cached !== null && !cached.stale;
    const state: MExtensionReadinessSnapshot['state'] = ready
        ? 'ready_public_current'
        : connection.state === 'connecting' ||
          connection.state === 'reconnecting' ||
          connection.state === 'pending_lut'
          ? 's3_subscription_blocked'
          : connection.state === 'protocol_mismatch' || connection.state === 'private_blocked'
            ? 'privacy_blocked'
            : connection.state === 'degraded'
              ? 'degraded_but_readable'
              : 'bridge_unavailable';
    return {
        fetchedAt: Date.now(),
        state,
        reason: connection.reason,
        profileGeneration: cached?.generation ?? connection.profileGeneration ?? null,
        bridgeReachable: connection.connected,
        blockerIds: Object.freeze([] as string[]) as readonly string[]
    };
}

function translateObservability(event: KernelBridgeRuntimeEvent): MObservabilityEvent {
    const payloadRecord: Readonly<Record<string, unknown>> =
        event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload)
            ? (event.payload as Readonly<Record<string, unknown>>)
            : { value: event.payload };
    return {
        type: `kernel-bridge.${event.kind}`,
        extensionId: event.source,
        emittedAt: event.emittedAtMs,
        payload: payloadRecord
    };
}
