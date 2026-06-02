import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import {
    DEFAULT_CONNECTION_STATUS,
    KERNEL_BRIDGE_CAPABILITIES,
    KERNEL_BRIDGE_SOURCE,
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt,
    KernelBridgeCapabilityRequest,
    KernelBridgeConnectionStatus,
    KernelBridgeRuntimeEvent,
    KernelBridgeRuntimeSnapshot,
    KernelBridgeStreamDelta,
    KernelBridgeStreamRow,
    KernelBridgeStreamTable,
    KernelBridgeSubscriptionProfile,
    SPACETIME_PROJECTION_MODE_FULL,
    SPACETIME_PROJECTION_MODE_LITE,
    isKernelBridgeCapability,
    makeKernelBridgeSafeProfilePending
} from '../common/types';

/**
 * DI binding token for the KernelBridgeAPI service. Importers should depend
 * on this symbol rather than the implementation class so that test extensions
 * can rebind an in-memory fake without recompiling against the runtime
 * adapter.
 */
export const KERNEL_BRIDGE_API = Symbol('PratibimbaKernelBridgeAPI');

export type KernelBridgeUnsubscribe = () => void;

export type KernelBridgeEventHandler<E> = (event: E) => void;

const STREAM_TABLES: readonly KernelBridgeStreamTable[] = [
    'world_clock',
    'pratibimba_presence',
    'shared_archetype_event'
];

const FORBIDDEN_STREAM_KEYS = [
    'rawNaraBody',
    'journalBody',
    'dreamBody',
    'oracleBody',
    'dialogueText',
    'rawBirthData',
    'identityHashPreview',
    'privateIdentityData',
    'bioquaternion',
    'layerPresenceMask',
    'graphitiEpisodeBody',
    'personalGraphFact'
] as const;

/**
 * Single-source-of-truth view of the kernel bridge — Track 05 T3 deliverable.
 *
 * Downstream extensions (M0..M5, integrated plugins, OmniPanel, Agentic
 * Control Room) MUST go through this API rather than reaching the gateway
 * directly. The runtime adapter caches the latest safe profile and replays
 * it to late subscribers with `stale: true` until the next live observation
 * lands.
 *
 * Both workspace layout modes (`daily-0-1` and `ide-deep`) share the same
 * bridge instance — verified by the layout-switch round-trip test that
 * asserts no second subscription opens after `switchTo(ide-deep)` then
 * `switchTo(daily-0-1)`.
 */
export interface KernelBridgeAPI {
    /** Current connection state — synchronous read for status-bar widgets. */
    readonly connectionStatus: KernelBridgeConnectionStatus;
    /** Last cached profile (may be stale). null until first observation. */
    readonly cachedProfile: KernelBridgeCachedProfile | null;
    /** Snapshot of the runtime state — mirrors `KernelBridgeRuntimeSnapshot`. */
    readonly snapshot: KernelBridgeRuntimeSnapshot;

    /** Subscribe to typed runtime events (connection/readiness/profile/observability). */
    onEvent(handler: KernelBridgeEventHandler<KernelBridgeRuntimeEvent>): KernelBridgeUnsubscribe;
    /** Subscribe to connection-status transitions. */
    onConnectionChange(
        handler: KernelBridgeEventHandler<KernelBridgeConnectionStatus>
    ): KernelBridgeUnsubscribe;
    /** Subscribe to profile-generation updates. */
    onProfile(handler: KernelBridgeEventHandler<KernelBridgeCachedProfile>): KernelBridgeUnsubscribe;
    /** Subscribe to committed S3 `world_clock` rows through the gateway-owned bridge. */
    subscribeWorldClock(handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>): KernelBridgeUnsubscribe;
    /** Subscribe to protected-reference-only Pratibimba presence rows. */
    subscribePratibimbaPresence(handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>): KernelBridgeUnsubscribe;
    /** Subscribe to opt-in shared archetype rows. */
    subscribeSharedArchetypeEvents(handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>): KernelBridgeUnsubscribe;

    /**
     * Request a subscription-mode change. Lite mode is the default; the deep
     * IDE layout requests full mode when it summons. Multiple consumers may
     * request modes; the bridge uses the highest requested mode and never
     * opens a second upstream subscription.
     */
    requestSubscriptionMode(mode: KernelBridgeSubscriptionProfile): void;

    /**
     * Invoke a bounded gateway capability with VAK lineage. Methods not in
     * `KERNEL_BRIDGE_CAPABILITIES` are rejected with a typed error before
     * any network round-trip — capability gate matches `kernel_bridge_runtime`
     * Track 01 T7 deliverable.
     */
    invokeCapability(request: KernelBridgeCapabilityRequest): Promise<KernelBridgeCapabilityReceipt>;
}

/**
 * Default kernel-bridge implementation. The frontend module binds this as a
 * singleton in DI and provides it to downstream consumers via `KERNEL_BRIDGE_API`.
 *
 * Wire model:
 *   1. The adapter holds the most recent `KernelBridgeRuntimeSnapshot` in
 *      memory and re-fires events through Theia's `Emitter` to all attached
 *      handlers.
 *   2. `KernelBridgeRuntimeSource` (separate file) drives the adapter from
 *      the live gateway WebSocket; the adapter is intentionally agnostic of
 *      transport so test extensions can drive it directly.
 *   3. Capability invocations route through `invokeCapabilityImpl` callback
 *      provided at construction time — for the live runtime this hits the
 *      gateway's `s4'.mediation.route` / capability endpoints; for tests it
 *      is a fixture function.
 */
@injectable()
export class KernelBridgeAPIImpl implements KernelBridgeAPI {
    protected _connectionStatus: KernelBridgeConnectionStatus = { ...DEFAULT_CONNECTION_STATUS };
    protected _cachedProfile: KernelBridgeCachedProfile | null = null;
    protected _mode: KernelBridgeSubscriptionProfile = 'lite';
    protected _subscriberCount: number = 0;
    protected _upstreamSubscriptionCount: number = 0;
    protected readonly _latestRows: Map<KernelBridgeStreamTable, KernelBridgeStreamRow[]> = new Map();
    /** Set by KernelBridgeRuntimeSource to perform capability dispatch. */
    public invokeCapabilityImpl: (
        request: KernelBridgeCapabilityRequest
    ) => Promise<KernelBridgeCapabilityReceipt> = async () => {
        throw new Error('kernel-bridge: capability dispatcher not initialised');
    };
    public onSubscriptionModeRequest: ((mode: KernelBridgeSubscriptionProfile) => void) | undefined;

    protected readonly _onEvent = new Emitter<KernelBridgeRuntimeEvent>();
    protected readonly _onConnectionChange = new Emitter<KernelBridgeConnectionStatus>();
    protected readonly _onProfile = new Emitter<KernelBridgeCachedProfile>();
    protected readonly _onWorldClock = new Emitter<KernelBridgeStreamDelta>();
    protected readonly _onPratibimbaPresence = new Emitter<KernelBridgeStreamDelta>();
    protected readonly _onSharedArchetypeEvents = new Emitter<KernelBridgeStreamDelta>();

    readonly onEventEvent: Event<KernelBridgeRuntimeEvent> = this._onEvent.event;
    readonly onConnectionChangeEvent: Event<KernelBridgeConnectionStatus> = this._onConnectionChange.event;
    readonly onProfileEvent: Event<KernelBridgeCachedProfile> = this._onProfile.event;

    get connectionStatus(): KernelBridgeConnectionStatus {
        return this._connectionStatus;
    }

    get cachedProfile(): KernelBridgeCachedProfile | null {
        return this._cachedProfile;
    }

    get snapshot(): KernelBridgeRuntimeSnapshot {
        return {
            runtimeOwner: "S0/S0' kernel-bridge runtime",
            theiaAdapter: 'Theia KernelBridgeAPI dependency-injection adapter',
            tauriAdapter: 'Tauri 0/1 surface adapter',
            upstreamSubscriptionCount: this._upstreamSubscriptionCount,
            subscriberCount: this._subscriberCount,
            mode: this._mode,
            subscriptionMode:
                this._mode === 'full' ? SPACETIME_PROJECTION_MODE_FULL : SPACETIME_PROJECTION_MODE_LITE,
            currentProfileGeneration: this._cachedProfile?.generation ?? null,
            cachedProfile: this._cachedProfile,
            connection: this._connectionStatus,
            readiness: {
                source: KERNEL_BRIDGE_SOURCE,
                mode: this._mode,
                pending: this._cachedProfile === null,
                pendingPlaceholder: makeKernelBridgeSafeProfilePending(),
                streamTables: STREAM_TABLES,
                latestRowCache: Object.fromEntries(
                    STREAM_TABLES.map(table => [table, this._latestRows.get(table)?.length ?? 0])
                )
            }
        };
    }

    onEvent(handler: KernelBridgeEventHandler<KernelBridgeRuntimeEvent>): KernelBridgeUnsubscribe {
        this._subscriberCount += 1;
        const sub = this._onEvent.event(handler);
        return () => {
            this._subscriberCount = Math.max(0, this._subscriberCount - 1);
            sub.dispose();
        };
    }

    onConnectionChange(
        handler: KernelBridgeEventHandler<KernelBridgeConnectionStatus>
    ): KernelBridgeUnsubscribe {
        const sub = this._onConnectionChange.event(handler);
        // Replay current state so late subscribers see something.
        queueMicrotask(() => handler(this._connectionStatus));
        return () => sub.dispose();
    }

    onProfile(handler: KernelBridgeEventHandler<KernelBridgeCachedProfile>): KernelBridgeUnsubscribe {
        const sub = this._onProfile.event(handler);
        if (this._cachedProfile) {
            const cached = this._cachedProfile;
            queueMicrotask(() => handler(cached));
        }
        return () => sub.dispose();
    }

    subscribeWorldClock(handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>): KernelBridgeUnsubscribe {
        return this.subscribeStream('world_clock', this._onWorldClock, handler);
    }

    subscribePratibimbaPresence(handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>): KernelBridgeUnsubscribe {
        return this.subscribeStream('pratibimba_presence', this._onPratibimbaPresence, handler);
    }

    subscribeSharedArchetypeEvents(handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>): KernelBridgeUnsubscribe {
        return this.subscribeStream('shared_archetype_event', this._onSharedArchetypeEvents, handler);
    }

    requestSubscriptionMode(mode: KernelBridgeSubscriptionProfile): void {
        // Lite stays lite unless any consumer requests full. The current
        // implementation upgrades immediately; downgrade-on-no-consumers is a
        // T3+ refinement once the layout-switch verification is in place.
        if (mode === 'full' && this._mode !== 'full') {
            this._mode = 'full';
            this._connectionStatus = {
                ...this._connectionStatus,
                mode: 'full',
                subscriptionMode: SPACETIME_PROJECTION_MODE_FULL
            };
            this._onConnectionChange.fire(this._connectionStatus);
        }
        this.onSubscriptionModeRequest?.(mode);
    }

    async invokeCapability(
        request: KernelBridgeCapabilityRequest
    ): Promise<KernelBridgeCapabilityReceipt> {
        if (!isKernelBridgeCapability(request.method)) {
            throw new Error(
                `kernel-bridge: rejected capability "${request.method}" — not in allow-list [${KERNEL_BRIDGE_CAPABILITIES.join(', ')}]`
            );
        }
        return this.invokeCapabilityImpl(request);
    }

    // ---- adapter-driven mutators (called from KernelBridgeRuntimeSource) ----

    /** Apply a connection-state change observed on the upstream. */
    applyConnectionStatus(status: KernelBridgeConnectionStatus): void {
        this._connectionStatus = status;
        this._onConnectionChange.fire(status);
    }

    /** Record a profile observation and replay to subscribers. */
    applyProfile(profile: KernelBridgeCachedProfile): void {
        this._cachedProfile = profile;
        this._onProfile.fire(profile);
        // Also emit as a generic runtime event so consumers that don't
        // specialise on profile still see something.
        this._onEvent.fire({
            kind: 'profile',
            emittedAtMs: profile.cachedAtMs,
            source: KERNEL_BRIDGE_SOURCE,
            profileGeneration: profile.generation,
            privacyClass: profile.privacyClass,
            payload: profile.profile
        });
    }

    /** Fire a generic runtime event (readiness, observability, etc.). */
    fireEvent(event: KernelBridgeRuntimeEvent): void {
        this.applyStreamEvent(event);
        this._onEvent.fire(event);
    }

    /** Set by the source when an upstream subscription is opened/closed. */
    setUpstreamSubscriptionCount(count: number): void {
        this._upstreamSubscriptionCount = count;
    }

    protected subscribeStream(
        table: KernelBridgeStreamTable,
        emitter: Emitter<KernelBridgeStreamDelta>,
        handler: KernelBridgeEventHandler<KernelBridgeStreamDelta>
    ): KernelBridgeUnsubscribe {
        const sub = emitter.event(handler);
        const cachedRows = this._latestRows.get(table);
        if (cachedRows?.length) {
            queueMicrotask(() => handler({
                table,
                inserts: cachedRows,
                deletes: [],
                resync: true,
                protocolMismatch: null
            }));
        }
        return () => sub.dispose();
    }

    protected applyStreamEvent(event: KernelBridgeRuntimeEvent): void {
        const payload = event.payload;
        if (!isRecord(payload)) {
            return;
        }

        const table = streamTableFromPayload(payload);
        if (!table) {
            return;
        }

        const protocolMismatch = typeof payload.protocolMismatch === 'string'
            ? payload.protocolMismatch
            : null;
        const inserts = streamRowsFromPayload(table, payload.inserts, event);
        const deletes = streamRowsFromPayload(table, payload.deletes, event);

        if (!inserts.length && !deletes.length && protocolMismatch === null) {
            return;
        }

        if (inserts.length) {
            this._latestRows.set(table, inserts);
        }

        this.streamEmitter(table).fire({
            table,
            inserts,
            deletes,
            resync: payload.resync === true,
            protocolMismatch
        });
    }

    protected streamEmitter(table: KernelBridgeStreamTable): Emitter<KernelBridgeStreamDelta> {
        switch (table) {
            case 'world_clock':
                return this._onWorldClock;
            case 'pratibimba_presence':
                return this._onPratibimbaPresence;
            case 'shared_archetype_event':
                return this._onSharedArchetypeEvents;
        }
    }
}

function streamTableFromPayload(payload: Record<string, unknown>): KernelBridgeStreamTable | null {
    const tableName = payload.tableName ?? payload.table_name ?? payload.table;
    return typeof tableName === 'string' && isStreamTable(tableName) ? tableName : null;
}

function isStreamTable(value: string): value is KernelBridgeStreamTable {
    return (STREAM_TABLES as readonly string[]).includes(value);
}

function streamRowsFromPayload(
    table: KernelBridgeStreamTable,
    rawRows: unknown,
    event: KernelBridgeRuntimeEvent
): KernelBridgeStreamRow[] {
    if (!Array.isArray(rawRows)) {
        return [];
    }
    return rawRows.flatMap(row => {
        if (!isFrontendSafeRow(row)) {
            return [];
        }
        return [{
            table,
            row,
            receivedAtMs: event.emittedAtMs,
            profileGeneration: event.profileGeneration,
            privacyClass: event.privacyClass,
            source: event.source
        }];
    });
}

function isFrontendSafeRow(row: unknown): boolean {
    const raw = JSON.stringify(row);
    if (raw === undefined) {
        return false;
    }
    return !FORBIDDEN_STREAM_KEYS.some(key => raw.includes(`"${key}"`));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
