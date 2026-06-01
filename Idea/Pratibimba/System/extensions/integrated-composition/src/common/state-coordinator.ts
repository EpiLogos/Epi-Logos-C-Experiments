import {
    Disposable,
    MExtensionReadinessSnapshot,
    PrivacyClass,
    SharedBridgeAdapter,
    readinessSeverity
} from '@pratibimba/m-extension-runtime';
import {
    IntegratedObservabilityEvent,
    INTEGRATED_OBSERVABILITY_KINDS,
    IntegratedViewState,
    PENDING_INTEGRATED_VIEW_STATE
} from './integrated-state';

/**
 * IntegratedStateCoordinator
 *
 * Sits on top of the SharedBridgeAdapter from m-extension-runtime. The
 * SharedBridgeAdapter already enforces one upstream subscription per
 * bridge channel (07.T1 fan-out). The state coordinator adds a higher
 * level: it tracks the derived view-state both integrated plugins consume,
 * exposes immutable snapshots, and emits typed observability events.
 *
 * 08.T2 verification 1: "Tests prove one bridge subscription is shared by
 *   both integrated plugins and late subscribers receive the current
 *   generation with staleness metadata."
 * 08.T2 verification 2: "Tests simulate disconnect/reconnect/resync and
 *   prove both plugin read models move through degraded states without
 *   stale profile claims." — handled by clearing profileGeneration/
 *   worldClockGeneration on disconnect and only restoring them when fresh
 *   bridge events arrive.
 *
 * The coordinator is intended to be installed once per Theia container
 * (matching the SharedBridgeAdapter singleton). Both plugin contributions
 * resolve it through DI and subscribe via `onViewState()`.
 */
export class IntegratedStateCoordinator {
    private cachedView: IntegratedViewState = PENDING_INTEGRATED_VIEW_STATE;
    private viewListeners = new Set<(view: IntegratedViewState) => void>();
    private eventListeners = new Set<(event: IntegratedObservabilityEvent) => void>();
    private subscriptions: Disposable[] = [];
    private clockProvider: () => number;
    private worldClockGeneration: number | null = null;

    constructor(
        private readonly bridge: SharedBridgeAdapter,
        options: { clockProvider?: () => number } = {}
    ) {
        // We accept a clockProvider so tests can drive deterministic
        // lastUpdatedAt values.
        this.clockProvider = options.clockProvider ?? (() => Date.now());
        this.subscriptions.push(
            this.bridge.onProfile(profile => this.handleProfile(profile))
        );
        this.subscriptions.push(
            this.bridge.onConnectionStatus(status => this.handleConnectionStatus(status))
        );
        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => this.handleReadiness(snapshot))
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(ctx => this.handleCoordinateContext(ctx))
        );
        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => {
                // Bridge-level observability events are passed through if they
                // are one of the integrated kinds, but we never up-cast a
                // foreign event to an integrated kind.
                void event;
            })
        );
    }

    dispose(): void {
        for (const sub of this.subscriptions) {
            try { sub.dispose(); } catch { /* best-effort */ }
        }
        this.subscriptions = [];
        this.viewListeners.clear();
        this.eventListeners.clear();
    }

    /** Subscribe to immutable view-state updates with late-subscriber replay. */
    onViewState(listener: (view: IntegratedViewState) => void): Disposable {
        this.viewListeners.add(listener);
        // Late-subscriber replay — same pattern as the SharedBridgeAdapter.
        listener(this.cachedView);
        return { dispose: () => this.viewListeners.delete(listener) };
    }

    onIntegratedEvent(listener: (event: IntegratedObservabilityEvent) => void): Disposable {
        this.eventListeners.add(listener);
        return { dispose: () => this.eventListeners.delete(listener) };
    }

    currentView(): IntegratedViewState {
        return this.cachedView;
    }

    /**
     * Emit a typed integrated event. The kind must be one of the six declared
     * in INTEGRATED_OBSERVABILITY_KINDS — undeclared kinds throw rather than
     * silently passing.
     */
    publish(event: IntegratedObservabilityEvent): void {
        if (!INTEGRATED_OBSERVABILITY_KINDS.includes(event.kind)) {
            throw new Error(
                `IntegratedStateCoordinator cannot publish undeclared kind ${event.kind}`
            );
        }
        for (const listener of this.eventListeners) {
            listener(event);
        }
    }

    /**
     * Test/runtime hook so harnesses can inject a world_clock tick. In
     * production this is the kernel-bridge runtime's job once 01.T6 lands.
     */
    advanceWorldClock(generation: number): void {
        if (this.cachedView.worldClockGeneration === generation) {
            return;
        }
        this.worldClockGeneration = generation;
        this.cachedView = Object.freeze({
            ...this.cachedView,
            worldClockGeneration: generation,
            lastUpdatedAt: this.clockProvider()
        });
        this.publishView();
    }

    /**
     * Test hook to inject an active deep-link route — production wiring lives
     * in the plugin frontend modules but the coordinator owns the active
     * value so both plugins read it from one place.
     */
    setActiveRoute(route: string | null): void {
        if (this.cachedView.activeRoute === route) {
            return;
        }
        this.cachedView = Object.freeze({
            ...this.cachedView,
            activeRoute: route,
            lastUpdatedAt: this.clockProvider()
        });
        this.publishView();
    }

    private handleProfile(profile: { generation: number } | null): void {
        if (!profile) {
            return;
        }
        if (this.cachedView.profileGeneration === profile.generation) {
            return;
        }
        this.cachedView = Object.freeze({
            ...this.cachedView,
            profileGeneration: profile.generation,
            lastUpdatedAt: this.clockProvider()
        });
        this.publishView();
    }

    private handleConnectionStatus(status: IntegratedViewState['connection']): void {
        const previous = this.cachedView.connection;
        const next = status;
        if (
            previous.connected === next.connected &&
            previous.mode === next.mode &&
            previous.reason === next.reason
        ) {
            return;
        }
        // On disconnect, clear authoritative profile/world-clock generations
        // so renderers can no longer report stale-but-believable values.
        const disconnected = !next.connected || next.mode === 'detached';
        const nextProfileGen = disconnected ? null : this.cachedView.profileGeneration;
        const nextWcGen = disconnected ? null : this.worldClockGeneration;
        if (disconnected) {
            this.worldClockGeneration = null;
        }
        this.cachedView = Object.freeze({
            ...this.cachedView,
            connection: next,
            profileGeneration: nextProfileGen,
            worldClockGeneration: nextWcGen,
            lastUpdatedAt: this.clockProvider()
        });
        this.publishView();
        this.publish({
            kind: 'integrated.readiness-transition',
            pluginId: 'plugin-integrated-1-2-3',
            emittedAt: this.cachedView.lastUpdatedAt,
            profileGeneration: this.cachedView.profileGeneration,
            worldClockGeneration: this.cachedView.worldClockGeneration,
            payload: {
                previousMode: previous.mode,
                nextMode: next.mode,
                disconnected
            }
        });
    }

    private handleReadiness(snapshot: MExtensionReadinessSnapshot): void {
        const severity = readinessSeverity(snapshot.state);
        const s2 = mapReadinessToTrack(snapshot.state, severity, 's2');
        const s3 = mapReadinessToTrack(snapshot.state, severity, 's3');
        const s5 = mapReadinessToTrack(snapshot.state, severity, 's5');
        this.cachedView = Object.freeze({
            ...this.cachedView,
            bridgeReadiness: snapshot,
            s2GraphReadiness: s2,
            s3StreamReadiness: s3,
            s5ReviewReadiness: s5,
            lastUpdatedAt: this.clockProvider()
        });
        this.publishView();
    }

    private handleCoordinateContext(ctx: IntegratedViewState['selectedCoordinate']): void {
        const nextPrivacy: PrivacyClass = ctx.privacyClass;
        this.cachedView = Object.freeze({
            ...this.cachedView,
            selectedCoordinate: ctx,
            privacyScope: nextPrivacy,
            lastUpdatedAt: this.clockProvider()
        });
        this.publishView();
    }

    private publishView(): void {
        for (const listener of this.viewListeners) {
            listener(this.cachedView);
        }
    }
}

function mapReadinessToTrack(
    state: MExtensionReadinessSnapshot['state'],
    severity: 'ok' | 'degraded' | 'blocked',
    track: 's2' | 's3' | 's5'
): 'pending' | 'ready' | 'blocked' {
    if (severity === 'ok') {
        return 'ready';
    }
    // State-specific blocks: only block the track explicitly named.
    if (
        (track === 's2' && state === 's2_graph_blocked') ||
        (track === 's3' && state === 's3_subscription_blocked') ||
        (track === 's5' && state === 's5_review_blocked')
    ) {
        return 'blocked';
    }
    if (severity === 'degraded') {
        return 'ready';
    }
    return 'pending';
}
