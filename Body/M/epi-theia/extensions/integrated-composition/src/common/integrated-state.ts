import {
    ConnectionStatus,
    CoordinateContext,
    EMPTY_COORDINATE_CONTEXT,
    DISCONNECTED_STATUS,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    PrivacyClass
} from '@pratibimba/m-extension-runtime';

/**
 * Integrated view state — the immutable snapshot both integrated plugins
 * consume from the IntegratedStateCoordinator. Renderer code receives this
 * read-only; mutation only happens inside the coordinator.
 *
 * `worldClockGeneration` is treated as a first-class generation separate from
 * `profileGeneration` because 03.T0 declares world_clock is its own ordered
 * stream — a profile change does NOT necessarily mean a new world_clock tick
 * and vice versa. Renderers carry the world_clock generation in their
 * staleness metadata so the user can see exactly which tick the frame is
 * derived from.
 */
export interface IntegratedViewState {
    readonly profileGeneration: number | null;
    readonly worldClockGeneration: number | null;
    readonly selectedCoordinate: CoordinateContext;
    readonly activeRoute: string | null;
    readonly connection: ConnectionStatus;
    readonly bridgeReadiness: MExtensionReadinessSnapshot;
    readonly s2GraphReadiness: 'pending' | 'ready' | 'blocked';
    readonly s3StreamReadiness: 'pending' | 'ready' | 'blocked';
    readonly s5ReviewReadiness: 'pending' | 'ready' | 'blocked';
    readonly privacyScope: PrivacyClass;
    readonly lastUpdatedAt: number;
}

export const PENDING_INTEGRATED_VIEW_STATE: IntegratedViewState = Object.freeze({
    profileGeneration: null,
    worldClockGeneration: null,
    selectedCoordinate: EMPTY_COORDINATE_CONTEXT,
    activeRoute: null,
    connection: DISCONNECTED_STATUS,
    bridgeReadiness: PENDING_M_READINESS,
    s2GraphReadiness: 'pending',
    s3StreamReadiness: 'pending',
    s5ReviewReadiness: 'pending',
    privacyScope: 'public_current' as PrivacyClass,
    lastUpdatedAt: 0
});

/**
 * Staleness metadata that renderer-local interpolation MUST carry: the
 * authoritative generation the coordinator currently holds, and the
 * generation the renderer is actually displaying right now. The two diverge
 * during render interpolation and converge on the next animation frame.
 *
 * 08.T2 verification: "Tests assert renderer-local cadence never mutates
 * authoritative profile, graph, codon, or review fields." We model this by
 * making the renderer compute its own StalenessMeta from an immutable
 * IntegratedViewState — never the other way around.
 */
export interface StalenessMeta {
    readonly displayedProfileGeneration: number | null;
    readonly displayedWorldClockGeneration: number | null;
    readonly authoritativeProfileGeneration: number | null;
    readonly authoritativeWorldClockGeneration: number | null;
    readonly profileBehindBy: number;
    readonly worldClockBehindBy: number;
    readonly isFresh: boolean;
}

export function computeStaleness(
    view: IntegratedViewState,
    displayedProfileGeneration: number | null,
    displayedWorldClockGeneration: number | null
): StalenessMeta {
    const profileBehindBy = computeBehindBy(
        displayedProfileGeneration,
        view.profileGeneration
    );
    const worldClockBehindBy = computeBehindBy(
        displayedWorldClockGeneration,
        view.worldClockGeneration
    );
    return Object.freeze({
        displayedProfileGeneration,
        displayedWorldClockGeneration,
        authoritativeProfileGeneration: view.profileGeneration,
        authoritativeWorldClockGeneration: view.worldClockGeneration,
        profileBehindBy,
        worldClockBehindBy,
        isFresh: profileBehindBy === 0 && worldClockBehindBy === 0
    });
}

function computeBehindBy(displayed: number | null, authoritative: number | null): number {
    if (displayed === null && authoritative === null) {
        return 0;
    }
    if (authoritative === null) {
        return 0;
    }
    if (displayed === null) {
        return authoritative;
    }
    return Math.max(0, authoritative - displayed);
}

/**
 * Observability event kinds emitted exclusively through
 * IntegratedStateCoordinator.publish(). 08.T2 deliverable 4.
 *
 * The canonical event schema remains owned by kernel-bridge/S5 (IOD-12); these
 * are the Track 08-specific event families the coordinator emits.
 */
export type IntegratedObservabilityKind =
    | 'integrated.activation'
    | 'integrated.readiness-transition'
    | 'integrated.layout-conflict'
    | 'integrated.privacy-blocked-projection'
    | 'integrated.evidence-envelope-created'
    | 'integrated.capability-invocation-rejected';

export const INTEGRATED_OBSERVABILITY_KINDS: readonly IntegratedObservabilityKind[] = Object.freeze([
    'integrated.activation',
    'integrated.readiness-transition',
    'integrated.layout-conflict',
    'integrated.privacy-blocked-projection',
    'integrated.evidence-envelope-created',
    'integrated.capability-invocation-rejected'
]);

export interface IntegratedObservabilityEvent {
    readonly kind: IntegratedObservabilityKind;
    readonly pluginId: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0';
    readonly emittedAt: number;
    readonly profileGeneration: number | null;
    readonly worldClockGeneration: number | null;
    readonly payload: Readonly<Record<string, unknown>>;
}
