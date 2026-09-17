import * as React from 'react';
import type {
    Disposable,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

export type ReadinessId = MExtensionReadinessState;
export type ReadinessSeverity = 'ready' | 'degraded' | 'blocked';
export type FamilyLetter = 'p' | 's' | 't' | 'm' | 'l' | 'c';
export type FamilyArchetype = 0 | 1 | 2 | 3 | 4 | 5;

export type ReadinessReasonPacket =
    | string
    | {
        readonly reason?: string;
        readonly humanReason?: string;
        readonly ownerTrack?: string;
    };

export interface ReadinessSnapshotLike extends MExtensionReadinessSnapshot {
    readonly reasons?: Readonly<Record<string, ReadinessReasonPacket>>;
}

export interface ReadinessSubscriptionSource {
    readonly subscribeToReadiness?: (
        listener: (snapshot: ReadinessSnapshotLike) => void
    ) => Disposable | (() => void);
    readonly onReadiness?: (
        listener: (snapshot: ReadinessSnapshotLike) => void
    ) => Disposable | (() => void);
    readonly onProfile?: (
        listener: (profile: MathemeHarmonicProfileBoundary | null) => void
    ) => Disposable | (() => void);
    readonly currentSnapshot?: () => {
        readonly readiness?: ReadinessSnapshotLike;
        readonly profile?: MathemeHarmonicProfileBoundary | null;
    };
}

export const READINESS_IDS = Object.freeze([
    'bridge_unavailable',
    'profile_missing_field',
    's2_graph_blocked',
    's3_subscription_blocked',
    's5_review_blocked',
    'authority_payload_missing',
    'privacy_blocked',
    'degraded_but_readable',
    'ready_public_current'
] as const satisfies readonly ReadinessId[]);

export const READINESS_OWNER_TRACKS: Readonly<Record<ReadinessId, string>> = Object.freeze({
    bridge_unavailable: '01',
    profile_missing_field: '01',
    s2_graph_blocked: '02',
    s3_subscription_blocked: '03',
    s5_review_blocked: '04',
    authority_payload_missing: '02',
    privacy_blocked: '03/04',
    degraded_but_readable: '01/02/03/04',
    ready_public_current: '01/02/03/04'
});

export const READINESS_SEVERITY: Readonly<Record<ReadinessId, ReadinessSeverity>> = Object.freeze({
    bridge_unavailable: 'blocked',
    profile_missing_field: 'blocked',
    s2_graph_blocked: 'blocked',
    s3_subscription_blocked: 'blocked',
    s5_review_blocked: 'blocked',
    authority_payload_missing: 'degraded',
    privacy_blocked: 'blocked',
    degraded_but_readable: 'degraded',
    ready_public_current: 'ready'
});

const PENDING_READINESS_SNAPSHOT: ReadinessSnapshotLike = Object.freeze({
    fetchedAt: 0,
    state: 'bridge_unavailable',
    reason: 'No kernel bridge instance has bound a readiness source yet.',
    profileGeneration: null,
    bridgeReachable: false,
    blockerIds: Object.freeze([] as string[]) as readonly string[]
});

export interface BlockedOverlayAction {
    readonly label: string;
    readonly deepLink: string;
    readonly command: string;
    readonly argument: string;
}

export function useReadinessSnapshot(
    readiness: ReadinessSnapshotLike | undefined,
    bridge: (SharedBridgeAdapter & ReadinessSubscriptionSource) | ReadinessSubscriptionSource | null | undefined
): ReadinessSnapshotLike {
    const [observed, setObserved] = React.useState<ReadinessSnapshotLike>(() =>
        readiness ?? snapshotFromReadinessSource(bridge)
    );

    React.useEffect(() => {
        if (readiness) {
            setObserved(readiness);
            return undefined;
        }
        if (!bridge) {
            setObserved(PENDING_READINESS_SNAPSHOT);
            return undefined;
        }
        setObserved(snapshotFromReadinessSource(bridge));
        return subscribeToReadiness(bridge, setObserved);
    }, [bridge, readiness]);

    return readiness ?? observed;
}

export function subscribeToReadiness(
    bridge: ReadinessSubscriptionSource,
    listener: (snapshot: ReadinessSnapshotLike) => void
): () => void {
    const subscribe = bridge.subscribeToReadiness ?? bridge.onReadiness;
    if (typeof subscribe !== 'function') {
        return () => undefined;
    }
    return normalizeDisposable(subscribe.call(bridge, listener));
}

export function snapshotFromReadinessSource(
    bridge: ReadinessSubscriptionSource | null | undefined
): ReadinessSnapshotLike {
    return bridge?.currentSnapshot?.().readiness ?? PENDING_READINESS_SNAPSHOT;
}

export function readinessIdOf(readiness: ReadinessSnapshotLike): ReadinessId {
    return isReadinessId(readiness.state) ? readiness.state : 'bridge_unavailable';
}

export function isReadinessId(value: unknown): value is ReadinessId {
    return typeof value === 'string' && (READINESS_IDS as readonly string[]).includes(value);
}

export function readinessSeverityOf(readiness: ReadinessSnapshotLike | ReadinessId): ReadinessSeverity {
    const id = typeof readiness === 'string' ? readiness : readinessIdOf(readiness);
    return READINESS_SEVERITY[id];
}

export function readinessIdTokenPath(id: ReadinessId | string): `epilogos.colour.readiness.id.${string}` {
    return `epilogos.colour.readiness.id.${id}`;
}

export function readinessSeverityTokenPath(severity: ReadinessSeverity): `epilogos.colour.readiness.severity.${ReadinessSeverity}` {
    return `epilogos.colour.readiness.severity.${severity}`;
}

export function familyTokenPath(
    familyLetter: FamilyLetter,
    archetype: FamilyArchetype
): `epilogos.colour.family.${FamilyLetter}.${FamilyArchetype}` {
    return `epilogos.colour.family.${familyLetter}.${archetype}`;
}

export function readinessCssVar(id: ReadinessId | string): string {
    return `var(--epilogos-colour-readiness-id-${id}, var(--theia-errorForeground))`;
}

export function readinessSeverityCssVar(severity: ReadinessSeverity): string {
    return `var(--epilogos-colour-readiness-severity-${severity}, var(--theia-editorWidget-background))`;
}

export function familyCssVar(familyLetter: FamilyLetter, archetype: FamilyArchetype): string {
    return `var(--epilogos-colour-family-${familyLetter}-${archetype}, var(--theia-focusBorder))`;
}

export function readinessTooltip(readiness: ReadinessSnapshotLike, id: ReadinessId | string = readinessIdOf(readiness)): string {
    const routed = readiness.reasons?.[id];
    const reason = typeof routed === 'string'
        ? routed
        : routed?.reason ?? routed?.humanReason ?? readiness.reason;
    const ownerTrack = typeof routed === 'object' && routed?.ownerTrack
        ? routed.ownerTrack
        : isReadinessId(id)
            ? READINESS_OWNER_TRACKS[id]
            : readiness.payloadOwner ?? 'unknown';
    return `${id}: ${reason} | ownerTrack: ${ownerTrack}`;
}

export function readinessLabel(readiness: ReadinessSnapshotLike, id: ReadinessId | string = readinessIdOf(readiness)): string {
    return id === 'ready_public_current' ? 'ready' : `pending: ${id}`;
}

export function blockedOverlayActionFor(readiness: ReadinessSnapshotLike): BlockedOverlayAction {
    switch (readinessIdOf(readiness)) {
        case 'bridge_unavailable':
            return Object.freeze({
                label: 'Reconnect to kernel bridge',
                deepLink: 'omnipanel.gateway',
                command: 'omnipanel.openTab',
                argument: 'gateway'
            });
        case 's5_review_blocked':
            return Object.freeze({
                label: 'Open Review tab',
                deepLink: 'omnipanel.review',
                command: 'omnipanel.openTab',
                argument: 'review'
            });
        default:
            return Object.freeze({
                label: 'Open Diagnostics',
                deepLink: 'omnipanel.diagnostics',
                command: 'omnipanel.openTab',
                argument: 'diagnostics'
            });
    }
}

export function tick12FromProfile(profile: MathemeHarmonicProfileBoundary | null | undefined): number | null {
    if (!profile) {
        return null;
    }
    const payload = profile.payload;
    const tickAddress = recordValue(payload.tickAddress);
    return normalizedTick12(finiteNumber(payload.tick12 ?? tickAddress?.tick12 ?? payload.tick));
}

export function normalizedTick12(value: number | null): number | null {
    if (value === null) {
        return null;
    }
    return ((Math.floor(value) % 12) + 12) % 12;
}

function normalizeDisposable(value: Disposable | (() => void)): () => void {
    if (typeof value === 'function') {
        return value;
    }
    return () => value.dispose();
}

function finiteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}
