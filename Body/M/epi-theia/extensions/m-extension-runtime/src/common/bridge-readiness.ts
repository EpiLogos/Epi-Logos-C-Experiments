import * as React from 'react';
import type { Disposable, KernelBridgeAPI } from './bridge-api';
import {
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS
} from './readiness';

export type BridgeReadinessId =
    | 'bridge_unavailable'
    | 'profile_missing_field'
    | 's2_graph_blocked'
    | 's3_subscription_blocked'
    | 's5_review_blocked'
    | 'authority_payload_missing'
    | 'privacy_blocked'
    | 'degraded_but_readable'
    | 'ready_public_current';

export const BRIDGE_READINESS_IDS = Object.freeze([
    'bridge_unavailable',
    'profile_missing_field',
    's2_graph_blocked',
    's3_subscription_blocked',
    's5_review_blocked',
    'authority_payload_missing',
    'privacy_blocked',
    'degraded_but_readable',
    'ready_public_current'
] as const satisfies readonly BridgeReadinessId[]);

export interface BridgeReadinessBinding {
    readonly bindingKey: string;
    readonly readinessId: BridgeReadinessId;
    readonly blockers: readonly string[];
    readonly lastTickObserved: number;
}

export interface BridgeReadinessBadgeProps {
    readonly bindingKey: string;
    readonly bridge?: BridgeReadinessSource | null;
    readonly readiness?: BridgeReadinessBinding;
}

type ReadinessListener = (event: unknown) => void;

export interface BridgeReadinessSource {
    readonly readReadiness?: () => Promise<MExtensionReadinessSnapshot>;
    readonly subscribeObservability?: (listener: ReadinessListener) => Disposable;
    readonly onObservabilityEvent?: (listener: ReadinessListener) => Disposable;
    readonly onEvent?: (listener: ReadinessListener) => Disposable | (() => void);
    readonly subscribe?: (channel: 'observability', listener: ReadinessListener) => Disposable | (() => void);
    readonly onConnectionStatusChange?: (listener: ReadinessListener) => Disposable;
    readonly onConnectionChange?: (listener: ReadinessListener) => Disposable | (() => void);
    readonly onMathemeHarmonicProfile?: (listener: ReadinessListener) => Disposable;
    readonly onProfile?: (listener: ReadinessListener) => Disposable | (() => void);
    readonly connectionStatus?: {
        readonly connected?: boolean;
        readonly reason?: string;
        readonly profileGeneration?: number | null;
        readonly state?: string;
    };
    readonly cachedProfile?: {
        readonly generation?: number;
        readonly stale?: boolean;
    } | null;
    readonly currentSnapshot?: () => {
        readonly readiness?: MExtensionReadinessSnapshot;
    };
}

const READINESS_SET = new Set<string>(BRIDGE_READINESS_IDS);

export function isBridgeReadinessId(value: unknown): value is BridgeReadinessId {
    return typeof value === 'string' && READINESS_SET.has(value);
}

export function isBridgeReadinessRed(id: BridgeReadinessId): boolean {
    return id === 'bridge_unavailable' || id === 'privacy_blocked';
}

export function bridgeReadinessColour(id: BridgeReadinessId): 'green' | 'amber' | 'red' {
    if (id === 'ready_public_current' || id === 'degraded_but_readable') {
        return 'green';
    }
    return isBridgeReadinessRed(id) ? 'red' : 'amber';
}

export function classifyReadiness(
    snapshot: MExtensionReadinessSnapshot,
    bindingKey: string
): BridgeReadinessBinding {
    const readinessId = isBridgeReadinessId(snapshot.state)
        ? snapshot.state
        : 'bridge_unavailable';
    const blockers = new Set<string>();
    for (const blocker of snapshot.blockerIds ?? []) {
        blockers.add(blocker);
    }
    if (snapshot.reason) {
        blockers.add(snapshot.reason);
    }
    return Object.freeze({
        bindingKey,
        readinessId,
        blockers: Object.freeze([...blockers]) as readonly string[],
        lastTickObserved: snapshot.fetchedAt
    });
}

export function snapshotReadinessFromBridge(bridge: BridgeReadinessSource | null | undefined): MExtensionReadinessSnapshot {
    if (!bridge) {
        return PENDING_M_READINESS;
    }
    const adapterSnapshot = bridge.currentSnapshot?.().readiness;
    if (adapterSnapshot) {
        return adapterSnapshot;
    }
    const status = bridge.connectionStatus;
    const profile = bridge.cachedProfile;
    if (!status && profile === undefined) {
        return PENDING_M_READINESS;
    }
    if (status?.connected === false) {
        return {
            fetchedAt: Date.now(),
            state: 'bridge_unavailable',
            reason: status.reason ?? PENDING_M_READINESS.reason,
            profileGeneration: status.profileGeneration ?? null,
            bridgeReachable: false,
            blockerIds: Object.freeze(['s0.kernel-bridge.unavailable']) as readonly string[]
        };
    }
    if (!profile) {
        return {
            fetchedAt: Date.now(),
            state: 'profile_missing_field',
            reason: status?.reason ?? 'Kernel bridge connected but no safe profile has been observed.',
            profileGeneration: status?.profileGeneration ?? null,
            bridgeReachable: Boolean(status?.connected),
            blockerIds: Object.freeze(['s0.kernel-bridge.awaiting-safe-profile']) as readonly string[]
        };
    }
    if (profile.stale) {
        return {
            fetchedAt: Date.now(),
            state: 'degraded_but_readable',
            reason: status?.reason ?? 'Using a stale safe profile while bridge refresh catches up.',
            profileGeneration: profile.generation ?? status?.profileGeneration ?? null,
            bridgeReachable: Boolean(status?.connected),
            blockerIds: Object.freeze(['s0.kernel-bridge.stale-profile']) as readonly string[]
        };
    }
    return {
        fetchedAt: Date.now(),
        state: 'ready_public_current',
        reason: status?.reason ?? 'Bridge binding is ready for public-current reads.',
        profileGeneration: profile.generation ?? status?.profileGeneration ?? null,
        bridgeReachable: true,
        blockerIds: Object.freeze([] as string[]) as readonly string[]
    };
}

export function readinessFromEvent(event: unknown, bindingKey: string): BridgeReadinessBinding | null {
    const snapshot = extractSnapshotFromEvent(event, bindingKey);
    if (snapshot) {
        return classifyReadiness(snapshot, bindingKey);
    }
    const record = extractBindingRecord(event, bindingKey);
    if (record) {
        return record;
    }
    return null;
}

export function useBridgeReadiness(
    bridge: KernelBridgeAPI | BridgeReadinessSource,
    bindingKey: string
): BridgeReadinessBinding {
    const source = bridge as BridgeReadinessSource;
    const [binding, setBinding] = React.useState<BridgeReadinessBinding>(() =>
        classifyReadiness(snapshotReadinessFromBridge(source), bindingKey)
    );

    React.useEffect(() => {
        let disposed = false;
        const updateFromSnapshot = (snapshot: MExtensionReadinessSnapshot): void => {
            if (!disposed) {
                setBinding(classifyReadiness(snapshot, bindingKey));
            }
        };
        const updateFromBridge = (): void => updateFromSnapshot(snapshotReadinessFromBridge(source));
        const updateFromEvent = (event: unknown): void => {
            const next = readinessFromEvent(event, bindingKey);
            if (next && !disposed) {
                setBinding(next);
            }
        };

        void source.readReadiness?.().then(updateFromSnapshot).catch(() => updateFromBridge());
        updateFromBridge();

        const disposers: Array<() => void> = [
            normalizeDisposable(source.subscribe?.('observability', updateFromEvent)),
            normalizeDisposable(source.subscribeObservability?.(updateFromEvent)),
            normalizeDisposable(source.onObservabilityEvent?.(updateFromEvent)),
            normalizeDisposable(source.onEvent?.(event => {
                updateFromEvent(event);
                const kind = getStringProp(event, 'kind');
                if (kind === 'readiness') {
                    const payload = getProp(event, 'payload');
                    const snapshot = coerceSnapshot(payload);
                    if (snapshot) {
                        updateFromSnapshot(snapshot);
                    }
                }
            })),
            normalizeDisposable(source.onConnectionStatusChange?.(updateFromBridge)),
            normalizeDisposable(source.onConnectionChange?.(updateFromBridge)),
            normalizeDisposable(source.onMathemeHarmonicProfile?.(updateFromBridge)),
            normalizeDisposable(source.onProfile?.(updateFromBridge))
        ].filter((dispose): dispose is () => void => dispose !== null);

        return () => {
            disposed = true;
            for (const dispose of disposers) {
                dispose();
            }
        };
    }, [bindingKey, source]);

    return binding;
}

export const BridgeReadinessBadge: React.FC<BridgeReadinessBadgeProps> = props => {
    const observed = props.bridge ? useBridgeReadiness(props.bridge, props.bindingKey) : null;
    const binding = props.readiness ?? observed ?? classifyReadiness(PENDING_M_READINESS, props.bindingKey);
    const colour = bridgeReadinessColour(binding.readinessId);
    const blocked = isBridgeReadinessRed(binding.readinessId);
    return React.createElement(
        'span',
        {
            className: `bridge-readiness-badge bridge-readiness-${colour} bridge-readiness-${binding.readinessId}`,
            'data-test': `bridge-readiness-${binding.bindingKey}`,
            'data-binding-key': binding.bindingKey,
            'data-readiness-id': binding.readinessId,
            title: binding.blockers.join(' | ')
        },
        React.createElement('span', { className: 'bridge-readiness-binding' }, binding.bindingKey),
        React.createElement('span', { className: 'bridge-readiness-pending-badge' }, binding.readinessId),
        blocked
            ? React.createElement('span', { className: 'bridge-readiness-blocked-overlay' }, 'blocked')
            : null
    );
};

function normalizeDisposable(value: Disposable | (() => void) | undefined): (() => void) | null {
    if (!value) {
        return null;
    }
    if (typeof value === 'function') {
        return value;
    }
    return () => value.dispose();
}

function extractSnapshotFromEvent(event: unknown, bindingKey: string): MExtensionReadinessSnapshot | null {
    const payload = getPayload(event);
    const direct = coerceSnapshot(payload) ??
        coerceSnapshot(getProp(payload, 'readinessSnapshot')) ??
        coerceSnapshot(getProp(payload, 'readiness'));
    if (direct) {
        return direct;
    }

    const ledger = getProp(payload, 'readinessLedger') ?? getProp(payload, 'bindingReadiness');
    const fromRecord = coerceBindingRecord(lookupBindingRecord(ledger, bindingKey), bindingKey);
    if (fromRecord) {
        return bindingToSnapshot(fromRecord);
    }
    return null;
}

function extractBindingRecord(event: unknown, bindingKey: string): BridgeReadinessBinding | null {
    const payload = getPayload(event);
    const directKey = getStringProp(payload, 'bindingKey');
    const direct = directKey === bindingKey ? coerceBindingRecord(payload, bindingKey) : null;
    if (direct) {
        return direct;
    }
    const ledger = getProp(payload, 'readinessLedger') ?? getProp(payload, 'bindingReadiness');
    return coerceBindingRecord(lookupBindingRecord(ledger, bindingKey), bindingKey);
}

function lookupBindingRecord(ledger: unknown, bindingKey: string): unknown {
    if (Array.isArray(ledger)) {
        return ledger.find(entry => getStringProp(entry, 'bindingKey') === bindingKey) ?? null;
    }
    if (isRecord(ledger)) {
        return ledger[bindingKey] ?? null;
    }
    return null;
}

function bindingToSnapshot(binding: BridgeReadinessBinding): MExtensionReadinessSnapshot {
    return {
        fetchedAt: binding.lastTickObserved,
        state: binding.readinessId,
        reason: binding.blockers[0] ?? binding.readinessId,
        profileGeneration: null,
        bridgeReachable: binding.readinessId !== 'bridge_unavailable',
        blockerIds: binding.blockers
    };
}

function coerceBindingRecord(value: unknown, bindingKey: string): BridgeReadinessBinding | null {
    if (!isRecord(value)) {
        return null;
    }
    const readinessId = getStringProp(value, 'readinessId');
    if (!isBridgeReadinessId(readinessId)) {
        return null;
    }
    const blockersValue = getProp(value, 'blockers');
    const blockers = Array.isArray(blockersValue)
        ? blockersValue.filter((item): item is string => typeof item === 'string')
        : [];
    const lastTick = getNumberProp(value, 'lastTickObserved') ?? getNumberProp(value, 'fetchedAt') ?? Date.now();
    return Object.freeze({
        bindingKey,
        readinessId,
        blockers: Object.freeze(blockers) as readonly string[],
        lastTickObserved: lastTick
    });
}

function coerceSnapshot(value: unknown): MExtensionReadinessSnapshot | null {
    if (!isRecord(value)) {
        return null;
    }
    const state = getStringProp(value, 'state') ?? getStringProp(value, 'readinessId');
    if (!isBridgeReadinessId(state)) {
        return null;
    }
    const blockerIds = getProp(value, 'blockerIds');
    return {
        fetchedAt: getNumberProp(value, 'fetchedAt') ?? getNumberProp(value, 'emittedAt') ?? Date.now(),
        state,
        reason: getStringProp(value, 'reason') ?? state,
        profileGeneration: getNullableNumberProp(value, 'profileGeneration'),
        bridgeReachable: getBooleanProp(value, 'bridgeReachable') ?? state !== 'bridge_unavailable',
        blockerIds: Array.isArray(blockerIds)
            ? blockerIds.filter((item): item is string => typeof item === 'string')
            : Object.freeze([] as string[]) as readonly string[]
    };
}

function getPayload(event: unknown): unknown {
    const payload = getProp(event, 'payload');
    if (isRecord(payload) && getProp(payload, 'payload') !== undefined) {
        return getProp(payload, 'payload');
    }
    return payload ?? event;
}

function getProp(value: unknown, key: string): unknown {
    return isRecord(value) ? value[key] : undefined;
}

function getStringProp(value: unknown, key: string): string | null {
    const prop = getProp(value, key);
    return typeof prop === 'string' ? prop : null;
}

function getNumberProp(value: unknown, key: string): number | null {
    const prop = getProp(value, key);
    return typeof prop === 'number' && Number.isFinite(prop) ? prop : null;
}

function getNullableNumberProp(value: unknown, key: string): number | null {
    const prop = getProp(value, key);
    return typeof prop === 'number' && Number.isFinite(prop) ? prop : null;
}

function getBooleanProp(value: unknown, key: string): boolean | null {
    const prop = getProp(value, key);
    return typeof prop === 'boolean' ? prop : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
