import {
    Disposable,
    KernelBridgeAPI,
    seedCoordinateContext
} from './bridge-api';
import { CoordinateContext, EMPTY_COORDINATE_CONTEXT } from './coordinate-context';
import { MObservabilityEvent, MObservabilityPublisher } from './observability';
import { ConnectionStatus, DISCONNECTED_STATUS, MathemeHarmonicProfileBoundary } from './profile';
import {
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS
} from './readiness';

/**
 * Shared runtime adapter — single fan-out source for all six M-extensions.
 *
 * Verification target (07.T1, fourth bullet): "Tests prove only one bridge
 * subscription source fans out to six extensions." This class is the
 * singleton; M-extensions never construct their own subscription against
 * `KernelBridgeAPI` directly.
 *
 * Late-subscriber cache: every subscriber, on subscribe, immediately receives
 * the latest cached profile/connection/readiness/coordinate snapshot. This is
 * what lets six extensions activate in any order and still agree on the same
 * profile generation id.
 */
export class SharedBridgeAdapter implements MObservabilityPublisher {
    private bridge: KernelBridgeAPI | null = null;
    private bridgeSubscriptions: Disposable[] = [];

    private cachedProfile: MathemeHarmonicProfileBoundary | null = null;
    private cachedStatus: ConnectionStatus = DISCONNECTED_STATUS;
    private cachedReadiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    private cachedContext: CoordinateContext = EMPTY_COORDINATE_CONTEXT;

    private profileListeners = new Set<(profile: MathemeHarmonicProfileBoundary | null) => void>();
    private statusListeners = new Set<(status: ConnectionStatus) => void>();
    private readinessListeners = new Set<(snapshot: MExtensionReadinessSnapshot) => void>();
    private contextListeners = new Set<(context: CoordinateContext) => void>();
    private observabilityListeners = new Set<(event: MObservabilityEvent) => void>();

    /** Test/runtime hook: how many times the adapter subscribed upstream. */
    private upstreamSubscriptionCount = 0;

    attachBridge(bridge: KernelBridgeAPI): void {
        if (this.bridge === bridge) {
            return;
        }
        this.detachBridge();
        this.bridge = bridge;
        this.upstreamSubscriptionCount += 1;

        this.bridgeSubscriptions.push(
            bridge.onMathemeHarmonicProfile(profile => this.handleProfile(profile))
        );
        this.bridgeSubscriptions.push(
            bridge.onConnectionStatusChange(status => this.handleStatus(status))
        );
        this.bridgeSubscriptions.push(
            bridge.onObservabilityEvent(event => this.fanOutObservability(event))
        );

        void bridge.readReadiness().then(snapshot => this.handleReadiness(snapshot));
        void bridge.readCurrentProfile().then(profile => this.handleProfile(profile));
    }

    detachBridge(): void {
        for (const sub of this.bridgeSubscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        this.bridgeSubscriptions = [];
        this.bridge = null;
        this.cachedProfile = null;
        this.cachedStatus = DISCONNECTED_STATUS;
        this.cachedReadiness = PENDING_M_READINESS;
        this.cachedContext = EMPTY_COORDINATE_CONTEXT;
        this.replayCachesToAll();
    }

    onProfile(listener: (profile: MathemeHarmonicProfileBoundary | null) => void): Disposable {
        this.profileListeners.add(listener);
        listener(this.cachedProfile);
        return { dispose: () => this.profileListeners.delete(listener) };
    }

    onConnectionStatus(listener: (status: ConnectionStatus) => void): Disposable {
        this.statusListeners.add(listener);
        listener(this.cachedStatus);
        return { dispose: () => this.statusListeners.delete(listener) };
    }

    onReadiness(listener: (snapshot: MExtensionReadinessSnapshot) => void): Disposable {
        this.readinessListeners.add(listener);
        listener(this.cachedReadiness);
        return { dispose: () => this.readinessListeners.delete(listener) };
    }

    onCoordinateContext(listener: (context: CoordinateContext) => void): Disposable {
        this.contextListeners.add(listener);
        listener(this.cachedContext);
        return { dispose: () => this.contextListeners.delete(listener) };
    }

    onObservabilityEvent(listener: (event: MObservabilityEvent) => void): Disposable {
        this.observabilityListeners.add(listener);
        return { dispose: () => this.observabilityListeners.delete(listener) };
    }

    publish(event: MObservabilityEvent): void {
        this.fanOutObservability(event);
        if (this.bridge) {
            void this.bridge.depositKernelObservation(event).catch(() => {
                // Deposit failure is observability noise; do not surface to UI.
            });
        }
    }

    updateCoordinateContext(next: CoordinateContext): void {
        this.cachedContext = next;
        for (const listener of this.contextListeners) {
            listener(next);
        }
    }

    /** Test hook — number of times an upstream bridge was attached. */
    getUpstreamSubscriptionCount(): number {
        return this.upstreamSubscriptionCount;
    }

    currentSnapshot(): {
        profile: MathemeHarmonicProfileBoundary | null;
        status: ConnectionStatus;
        readiness: MExtensionReadinessSnapshot;
        context: CoordinateContext;
    } {
        return {
            profile: this.cachedProfile,
            status: this.cachedStatus,
            readiness: this.cachedReadiness,
            context: this.cachedContext
        };
    }

    private handleProfile(profile: MathemeHarmonicProfileBoundary | null): void {
        this.cachedProfile = profile;
        if (profile) {
            const seeded = seedCoordinateContext(profile.generation);
            if (this.cachedContext.profileGeneration !== profile.generation) {
                this.cachedContext = seeded;
                for (const listener of this.contextListeners) {
                    listener(seeded);
                }
            }
        }
        for (const listener of this.profileListeners) {
            listener(profile);
        }
    }

    private handleStatus(status: ConnectionStatus): void {
        this.cachedStatus = status;
        for (const listener of this.statusListeners) {
            listener(status);
        }
    }

    private handleReadiness(snapshot: MExtensionReadinessSnapshot): void {
        this.cachedReadiness = snapshot;
        for (const listener of this.readinessListeners) {
            listener(snapshot);
        }
    }

    private fanOutObservability(event: MObservabilityEvent): void {
        for (const listener of this.observabilityListeners) {
            listener(event);
        }
    }

    private replayCachesToAll(): void {
        for (const listener of this.profileListeners) {
            listener(this.cachedProfile);
        }
        for (const listener of this.statusListeners) {
            listener(this.cachedStatus);
        }
        for (const listener of this.readinessListeners) {
            listener(this.cachedReadiness);
        }
        for (const listener of this.contextListeners) {
            listener(this.cachedContext);
        }
    }
}
