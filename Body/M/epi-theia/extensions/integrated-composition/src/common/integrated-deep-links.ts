import type {
    PrivacyClass,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import type { IntegratedReadinessAggregate } from './layout-claim';
import type { IntegratedCompositionPersistedState } from './workspace-persistence';

/**
 * Integrated deep-link grammar — 08.T7 deliverable 2.
 *
 * Two routes, matching the two integrated plugins:
 *
 *   epi-logos://ide/integrated/cosmic-engine?...
 *   epi-logos://ide/integrated/jiva-siva?...
 *
 * Query parameters carry the cross-surface continuity state: selected
 * coordinate, profile generation observed by the originating surface,
 * session/DAY/NOW handles, privacy scope, and the inspector the deep link
 * intends to open (M3 codon / M2 meaning packet / M1 walk / M4 field /
 * M5 review / M0 graph backdrop).
 */
export type IntegratedDeepLinkPluginId =
    | 'plugin-integrated-1-2-3'
    | 'plugin-integrated-4-5-0';

export type IntegratedDeepLinkRouteName = 'cosmic-engine' | 'jiva-siva';

const PLUGIN_ID_BY_ROUTE: Record<IntegratedDeepLinkRouteName, IntegratedDeepLinkPluginId> = {
    'cosmic-engine': 'plugin-integrated-1-2-3',
    'jiva-siva': 'plugin-integrated-4-5-0'
};

const ROUTE_NAME_BY_PLUGIN_ID: Record<IntegratedDeepLinkPluginId, IntegratedDeepLinkRouteName> = {
    'plugin-integrated-1-2-3': 'cosmic-engine',
    'plugin-integrated-4-5-0': 'jiva-siva'
};

export type IntegratedDeepLinkInspector =
    | 'm0-graph-backdrop'
    | 'm1-walk'
    | 'm2-meaning-packet'
    | 'm3-codon'
    | 'm4-field-foreground'
    | 'm5-review-side';

export interface IntegratedDeepLink {
    readonly routeName: IntegratedDeepLinkRouteName;
    readonly pluginId: IntegratedDeepLinkPluginId;
    readonly selectedCoordinate: string | null;
    readonly profileGeneration: number | null;
    readonly s3SessionHandle: string | null;
    readonly s3DayNowHandle: string | null;
    readonly privacyScope: PrivacyClass | null;
    readonly intendedInspector: IntegratedDeepLinkInspector | null;
}

export const COMPOSITION_ROUTES = {
    cosmicComposition: 'epi-logos://ide/integrated-1-2-3/cosmic-composition',
    personalComposition: 'epi-logos://ide/integrated-4-5-0/personal-composition'
} as const;

export type CompositionRoute =
    typeof COMPOSITION_ROUTES[keyof typeof COMPOSITION_ROUTES];

export type CompositionIntentCompositionId =
    'cosmic-engine.integrated'
    | 'jiva-siva.integrated';

export type CompositionContributionId =
    'cosmic-composition'
    | 'personal-composition';

export type CompositionLayoutRange =
    'integrated-1-2-3'
    | 'integrated-4-5-0';

export interface CompositionIntent {
    readonly route: typeof COMPOSITION_ROUTES[keyof typeof COMPOSITION_ROUTES];
    readonly compositionId: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    readonly stateHints: Partial<IntegratedCompositionPersistedState>;
}

export interface CompositionCrossLayoutIntent {
    readonly coordinate: string | null;
    readonly artifactUri: string | null;
    readonly reviewId: string | null;
    readonly dayNow: string | null;
    readonly sessionKey: string | null;
    readonly profileGeneration: number | null;
    readonly privacyClass: 'public' | 'protected' | 'private' | null;
    readonly requestedLayout: 'daily-0-1';
    readonly requestedExtensionId: IntegratedDeepLinkPluginId;
    readonly requestedContributionId: CompositionContributionId;
    readonly reason: string;
    readonly compositionRoute: CompositionRoute;
    readonly compositionId: CompositionIntentCompositionId;
    readonly stateHints: Partial<IntegratedCompositionPersistedState>;
}

export interface CompositionRouteResolution {
    readonly route: CompositionRoute;
    readonly layoutRange: CompositionLayoutRange;
    readonly requestedLayout: 'daily-0-1';
    readonly requestedExtensionId: IntegratedDeepLinkPluginId;
    readonly requestedContributionId: CompositionContributionId;
    readonly compositionId: CompositionIntentCompositionId;
    readonly canMount: boolean;
    readonly blockedBy: readonly string[];
}

export class InvalidCompositionRouteError extends Error {
    constructor(public readonly raw: string) {
        super(`Invalid composition route "${raw}"`);
        this.name = 'InvalidCompositionRouteError';
    }
}

export class InvalidIntegratedDeepLinkError extends Error {
    constructor(public readonly raw: string, public readonly reason: string) {
        super(`Invalid integrated deep link "${raw}": ${reason}`);
        this.name = 'InvalidIntegratedDeepLinkError';
    }
}

const SCHEME = 'epi-logos://ide/integrated/';

const COMPOSITION_ROUTE_DESCRIPTORS: Record<
    CompositionRoute,
    Omit<CompositionRouteResolution, 'route' | 'canMount' | 'blockedBy'>
> = Object.freeze({
    [COMPOSITION_ROUTES.cosmicComposition]: Object.freeze({
        layoutRange: 'integrated-1-2-3',
        requestedLayout: 'daily-0-1',
        requestedExtensionId: 'plugin-integrated-1-2-3',
        requestedContributionId: 'cosmic-composition',
        compositionId: 'cosmic-engine.integrated'
    }),
    [COMPOSITION_ROUTES.personalComposition]: Object.freeze({
        layoutRange: 'integrated-4-5-0',
        requestedLayout: 'daily-0-1',
        requestedExtensionId: 'plugin-integrated-4-5-0',
        requestedContributionId: 'personal-composition',
        compositionId: 'jiva-siva.integrated'
    })
});

const COMPOSITION_ROUTE_BY_ID: Record<CompositionIntentCompositionId, CompositionRoute> = Object.freeze({
    'cosmic-engine.integrated': COMPOSITION_ROUTES.cosmicComposition,
    'jiva-siva.integrated': COMPOSITION_ROUTES.personalComposition
});

const COMPOSITION_INTENT_EVENT_TYPE = 'composition.intent.dispatch';

export function formatIntegratedDeepLink(link: Omit<IntegratedDeepLink, 'pluginId'>): string {
    const params = new URLSearchParams();
    if (link.selectedCoordinate !== null) params.set('coordinate', link.selectedCoordinate);
    if (link.profileGeneration !== null)
        params.set('profile_generation', String(link.profileGeneration));
    if (link.s3SessionHandle !== null) params.set('session', link.s3SessionHandle);
    if (link.s3DayNowHandle !== null) params.set('day_now', link.s3DayNowHandle);
    if (link.privacyScope !== null) params.set('privacy_scope', link.privacyScope);
    if (link.intendedInspector !== null) params.set('inspector', link.intendedInspector);
    const qs = params.toString();
    return qs.length > 0
        ? `${SCHEME}${link.routeName}?${qs}`
        : `${SCHEME}${link.routeName}`;
}

export function parseIntegratedDeepLink(raw: string): IntegratedDeepLink {
    if (!raw.startsWith(SCHEME)) {
        throw new InvalidIntegratedDeepLinkError(raw, `must start with ${SCHEME}`);
    }
    const tail = raw.slice(SCHEME.length);
    const [routePart, queryPart] = tail.split('?', 2);
    if (!isKnownRouteName(routePart)) {
        throw new InvalidIntegratedDeepLinkError(raw, `unknown route name: ${routePart}`);
    }
    const routeName = routePart;
    const pluginId = PLUGIN_ID_BY_ROUTE[routeName];
    const params = new URLSearchParams(queryPart ?? '');

    const profileGenRaw = params.get('profile_generation');
    let profileGeneration: number | null = null;
    if (profileGenRaw !== null) {
        const parsed = Number(profileGenRaw);
        if (!Number.isFinite(parsed)) {
            throw new InvalidIntegratedDeepLinkError(
                raw,
                `profile_generation must be a finite number, got ${profileGenRaw}`
            );
        }
        profileGeneration = parsed;
    }

    const inspectorRaw = params.get('inspector');
    let intendedInspector: IntegratedDeepLinkInspector | null = null;
    if (inspectorRaw !== null) {
        if (!isKnownInspector(inspectorRaw)) {
            throw new InvalidIntegratedDeepLinkError(
                raw,
                `unknown inspector: ${inspectorRaw}`
            );
        }
        intendedInspector = inspectorRaw;
    }

    const privacyScopeRaw = params.get('privacy_scope');
    const privacyScope = privacyScopeRaw === null ? null : (privacyScopeRaw as PrivacyClass);

    return Object.freeze({
        routeName,
        pluginId,
        selectedCoordinate: params.get('coordinate'),
        profileGeneration,
        s3SessionHandle: params.get('session'),
        s3DayNowHandle: params.get('day_now'),
        privacyScope,
        intendedInspector
    });
}

export function deepLinkForPlugin(
    pluginId: IntegratedDeepLinkPluginId,
    rest: Omit<IntegratedDeepLink, 'pluginId' | 'routeName'>
): IntegratedDeepLink {
    return Object.freeze({
        routeName: ROUTE_NAME_BY_PLUGIN_ID[pluginId],
        pluginId,
        ...rest
    });
}

export function buildCompositionIntent(
    compositionId: CompositionIntent['compositionId'],
    stateHints: Partial<IntegratedCompositionPersistedState> = {}
): CompositionIntent {
    if (
        stateHints.compositionId !== undefined &&
        stateHints.compositionId !== compositionId
    ) {
        throw new Error(
            `Composition intent stateHints.compositionId (${stateHints.compositionId}) does not match ${compositionId}`
        );
    }

    return Object.freeze({
        route: COMPOSITION_ROUTE_BY_ID[compositionId],
        compositionId,
        stateHints: Object.freeze({ ...stateHints })
    });
}

export function resolveCompositionRoute(
    route: CompositionRoute,
    readiness?: IntegratedReadinessAggregate
): CompositionRouteResolution {
    const descriptor = COMPOSITION_ROUTE_DESCRIPTORS[route];
    if (!descriptor) {
        throw new InvalidCompositionRouteError(route);
    }

    const blockedBy = readiness ? [...readiness.blockingContributorIds] : [];
    if (
        readiness &&
        readiness.overall !== 'ready_public_current' &&
        readiness.overall !== 'degraded_but_readable' &&
        blockedBy.length === 0
    ) {
        blockedBy.push(readiness.overall);
    }

    return Object.freeze({
        route,
        ...descriptor,
        canMount: blockedBy.length === 0,
        blockedBy: Object.freeze(blockedBy)
    });
}

export function buildCompositionCrossLayoutIntent(
    intent: CompositionIntent
): CompositionCrossLayoutIntent {
    const resolution = resolveCompositionRoute(intent.route);
    if (resolution.compositionId !== intent.compositionId) {
        throw new Error(
            `Composition route ${intent.route} resolves to ${resolution.compositionId}, not ${intent.compositionId}`
        );
    }

    return Object.freeze({
        coordinate: null,
        artifactUri: null,
        reviewId: null,
        dayNow: null,
        sessionKey: null,
        profileGeneration: null,
        privacyClass: 'public',
        requestedLayout: resolution.requestedLayout,
        requestedExtensionId: resolution.requestedExtensionId,
        requestedContributionId: resolution.requestedContributionId,
        reason: `integrated-composition: ${resolution.requestedContributionId}`,
        compositionRoute: intent.route,
        compositionId: intent.compositionId,
        stateHints: Object.freeze({ ...intent.stateHints })
    });
}

export async function dispatchCompositionIntent(
    bridge: SharedBridgeAdapter,
    intent: CompositionIntent
): Promise<void> {
    const crossLayoutIntent = buildCompositionCrossLayoutIntent(intent);
    bridge.publish({
        type: COMPOSITION_INTENT_EVENT_TYPE,
        extensionId: 'integrated-composition',
        emittedAt: Date.now(),
        payload: Object.freeze({
            route: intent.route,
            compositionId: intent.compositionId,
            crossLayoutIntent,
            stateHints: crossLayoutIntent.stateHints
        })
    });
}

function isKnownRouteName(value: string): value is IntegratedDeepLinkRouteName {
    return value === 'cosmic-engine' || value === 'jiva-siva';
}

function isKnownInspector(value: string): value is IntegratedDeepLinkInspector {
    return (
        value === 'm0-graph-backdrop' ||
        value === 'm1-walk' ||
        value === 'm2-meaning-packet' ||
        value === 'm3-codon' ||
        value === 'm4-field-foreground' ||
        value === 'm5-review-side'
    );
}
