import { PrivacyClass } from '@pratibimba/m-extension-runtime';

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

export class InvalidIntegratedDeepLinkError extends Error {
    constructor(public readonly raw: string, public readonly reason: string) {
        super(`Invalid integrated deep link "${raw}": ${reason}`);
        this.name = 'InvalidIntegratedDeepLinkError';
    }
}

const SCHEME = 'epi-logos://ide/integrated/';

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
