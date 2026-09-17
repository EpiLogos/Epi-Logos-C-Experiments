import { readinessSeverity } from '@pratibimba/m-extension-runtime';
import type {
    CoordinateContext,
    MExtensionId,
    MExtensionReadinessSnapshot,
    MExtensionReadinessState,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import type {
    IntegratedNamedLayout,
    IntegratedReadinessAggregate
} from '@pratibimba/integrated-composition';

/**
 * Surface dispatch contract for M1 Paramasiva.
 *
 * Standalone mode renders from the extension widget's own bridge subscription.
 * Composed mode renders under plugin-integrated-1-2-3 and receives the parent
 * composition coordinator context through the shared bridge coordinate context.
 */
export type M1SurfaceMode = 'standalone' | 'composed';

export type M1ComposedPluginId = Extract<
    IntegratedNamedLayout['pluginId'],
    'plugin-integrated-1-2-3'
>;

export interface M1SurfaceParentContext {
    readonly pluginId: M1ComposedPluginId;
    readonly layoutId: Extract<IntegratedNamedLayout['id'], 'cosmic-engine.integrated'> | null;
    readonly rangeId: Extract<IntegratedNamedLayout['rangeId'], '1-2-3'> | null;
    readonly readiness: IntegratedReadinessAggregate | null;
    readonly coordinateContext: CoordinateContext;
}

export interface M1SurfaceDispatch {
    /** Reads the current bridge coordinate context and returns composed when plugin-integrated-1-2-3 owns M1. */
    getMode(): M1SurfaceMode;
    /** Returns the composition coordinator context in composed mode, otherwise null. */
    getParentContext(): M1SurfaceParentContext | null;
    /** Returns bridge readiness, promoted to the composed aggregate state when parent dependencies are worse. */
    getReadiness(): MExtensionReadinessSnapshot;
}

export function createM1SurfaceDispatch(bridge: SharedBridgeAdapter): M1SurfaceDispatch {
    return Object.freeze({
        getMode(): M1SurfaceMode {
            return readParentContext(bridge.currentSnapshot().context) ? 'composed' : 'standalone';
        },
        getParentContext(): M1SurfaceParentContext | null {
            return readParentContext(bridge.currentSnapshot().context);
        },
        getReadiness(): MExtensionReadinessSnapshot {
            const snapshot = bridge.currentSnapshot();
            const parent = readParentContext(snapshot.context);
            if (!parent?.readiness) {
                return snapshot.readiness;
            }
            return mergeComposedReadiness(snapshot.readiness, parent.readiness);
        }
    });
}

function readParentContext(context: CoordinateContext): M1SurfaceParentContext | null {
    const root = context as CoordinateContext & Record<string, unknown>;
    const candidates = [
        root,
        objectRecord(root.composition),
        objectRecord(root.compositionContext),
        objectRecord(root.compositionCoordinator),
        objectRecord(root.parentComposition),
        objectRecord(root.parentContext),
        objectRecord(root.surfaceComposition)
    ].filter((value): value is Readonly<Record<string, unknown>> => value !== null);

    for (const candidate of candidates) {
        const pluginId = stringField(candidate, 'pluginId', 'compositionPluginId', 'parentPluginId');
        if (pluginId !== 'plugin-integrated-1-2-3') {
            continue;
        }

        const layoutId = stringField(candidate, 'layoutId', 'compositionLayoutId');
        const rangeId = stringField(candidate, 'rangeId', 'compositionRangeId');
        return Object.freeze({
            pluginId,
            layoutId: layoutId === 'cosmic-engine.integrated' ? layoutId : null,
            rangeId: rangeId === '1-2-3' ? rangeId : null,
            readiness: readReadinessAggregate(candidate),
            coordinateContext: context
        });
    }

    return null;
}

function mergeComposedReadiness(
    base: MExtensionReadinessSnapshot,
    aggregate: IntegratedReadinessAggregate
): MExtensionReadinessSnapshot {
    if (severityRank(aggregate.overall) <= severityRank(base.state)) {
        return base;
    }

    const dependencyBlockers = aggregate.blockingContributorIds.map(
        id => `composition:${id}`
    );
    const reason = dependencyBlockers.length > 0
        ? `${base.reason} Composed dependencies blocked: ${dependencyBlockers.join(', ')}.`
        : `${base.reason} Composed readiness is ${aggregate.overall}.`;

    return Object.freeze({
        ...base,
        state: aggregate.overall,
        reason,
        blockerIds: Object.freeze([
            ...base.blockerIds,
            ...dependencyBlockers
        ])
    });
}

function readReadinessAggregate(
    record: Readonly<Record<string, unknown>>
): IntegratedReadinessAggregate | null {
    const direct = aggregateValue(record);
    if (direct) {
        return direct;
    }

    const nestedKeys = [
        'readiness',
        'readinessAggregate',
        'compositionReadiness',
        'coordinatorReadiness'
    ];
    for (const key of nestedKeys) {
        const nested = objectRecord(record[key]);
        const aggregate = nested ? aggregateValue(nested) : null;
        if (aggregate) {
            return aggregate;
        }
    }
    return null;
}

function aggregateValue(
    record: Readonly<Record<string, unknown>>
): IntegratedReadinessAggregate | null {
    const overall = record.overall;
    const contributorReadinesses = record.contributorReadinesses;
    const blockingContributorIds = record.blockingContributorIds;
    if (!isReadinessState(overall) || !Array.isArray(contributorReadinesses) || !Array.isArray(blockingContributorIds)) {
        return null;
    }
    return Object.freeze({
        overall,
        contributorReadinesses: Object.freeze(
            contributorReadinesses.filter(isContributorReadiness)
        ),
        blockingContributorIds: Object.freeze(
            blockingContributorIds.filter(isMExtensionId)
        )
    });
}

function isContributorReadiness(value: unknown): value is IntegratedReadinessAggregate['contributorReadinesses'][number] {
    const record = objectRecord(value);
    return Boolean(
        record &&
        isMExtensionId(record.extensionId) &&
        isReadinessState(record.state) &&
        typeof record.reason === 'string'
    );
}

function severityRank(state: MExtensionReadinessState): number {
    switch (readinessSeverity(state)) {
        case 'ok':
            return 0;
        case 'degraded':
            return 1;
        case 'blocked':
        default:
            return 2;
    }
}

function isReadinessState(value: unknown): value is MExtensionReadinessState {
    return (
        value === 'bridge_unavailable' ||
        value === 'profile_missing_field' ||
        value === 's2_graph_blocked' ||
        value === 's3_subscription_blocked' ||
        value === 's5_review_blocked' ||
        value === 'authority_payload_missing' ||
        value === 'privacy_blocked' ||
        value === 'degraded_but_readable' ||
        value === 'ready_public_current'
    );
}

function isMExtensionId(value: unknown): value is MExtensionId {
    return (
        value === 'm0-anuttara' ||
        value === 'm1-paramasiva' ||
        value === 'm2-parashakti' ||
        value === 'm3-mahamaya' ||
        value === 'm4-nara' ||
        value === 'm5-epii'
    );
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function stringField(
    record: Readonly<Record<string, unknown>>,
    ...keys: readonly string[]
): string | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string') {
            return value;
        }
    }
    return null;
}
