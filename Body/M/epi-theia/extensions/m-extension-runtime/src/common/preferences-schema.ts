import type { PreferenceProxy } from '@theia/core/lib/browser/preferences';
import {
    PreferenceSchema,
    PreferenceSchemaProperty
} from '@theia/core/lib/common/preferences/preference-schema';
import { PreferenceScope } from '@theia/core/lib/common/preferences/preference-scope';

export const EPI_LOGOS_PREFERENCE_CATEGORY = 'epi-logos';

export type EpiLogosLayoutMode = 'daily-0-1' | 'ide-deep';
export type EpiLogosZeroOneDefault = '0' | '1';
export type EpiLogosPrivacyDefaultClass =
    | 'protected_local'
    | 'protected_local_handle_only'
    | 'public_current';
export type EpiLogosDispatchTraceVerbosity = 'silent' | 'info' | 'debug' | 'trace';
export type EpiLogosKairosProvider = 'kerykeion' | 'stub';
export type EpiLogosThemingMode = 'auto' | 'light' | 'dark';
export type EpiLogosFamilyTier = 'p' | 's' | 't' | 'm' | 'l' | 'c';

export interface EpiLogosFamilyTierPalette {
    readonly p: boolean;
    readonly s: boolean;
    readonly t: boolean;
    readonly m: boolean;
    readonly l: boolean;
    readonly c: boolean;
}

export interface EpiLogosPreferences {
    readonly 'epi-logos.layout.active': EpiLogosLayoutMode;
    readonly 'epi-logos.layout.zero-one-default': EpiLogosZeroOneDefault;
    readonly 'epi-logos.omnipanel.first-launch-collapsed': boolean;
    readonly 'epi-logos.coordinate.first-launch': string;

    readonly 'epi-logos.privacy.default-class': EpiLogosPrivacyDefaultClass;
    readonly 'epi-logos.privacy.kairos-enabled': boolean;
    readonly 'epi-logos.privacy.public-bridge-opt-in': readonly string[];

    readonly 'epi-logos.motion.reduced': boolean;
    readonly 'epi-logos.profile.tick.visible': boolean;
    readonly 'epi-logos.motion.lemniscate-transition-duration-ms': number;
    readonly 'epi-logos.motion.xor-ceremony-duration-ms': number;

    readonly 'epi-logos.identity.kairos.provider': EpiLogosKairosProvider;
    readonly 'epi-logos.identity.atlas-sync.consents': readonly string[];

    readonly 'epi-logos.diagnostics.readiness.visible': boolean;
    readonly 'epi-logos.diagnostics.dispatch.trace.verbosity': EpiLogosDispatchTraceVerbosity;
    readonly 'epi-logos.diagnostics.cold-start-state': readonly string[];
    readonly 'epi-logos.diagnostics.reset-enabled': boolean;

    readonly 'epi-logos.theming.mode': EpiLogosThemingMode;
    readonly 'epi-logos.theming.family-tier.palette': EpiLogosFamilyTierPalette;
}

export type EpiLogosPreferenceName = keyof EpiLogosPreferences;
export type EpiLogosPreferenceProxy = PreferenceProxy<EpiLogosPreferences>;

export const EPI_LOGOS_FAMILY_TIERS: readonly EpiLogosFamilyTier[] = Object.freeze([
    'p',
    's',
    't',
    'm',
    'l',
    'c'
]);

export const EPI_LOGOS_FAMILY_TIER_DEFAULT_PALETTE: EpiLogosFamilyTierPalette = Object.freeze({
    p: true,
    s: true,
    t: true,
    m: true,
    l: true,
    c: true
});

function readOsReducedMotionDefault(): boolean {
    const candidate = globalThis as {
        readonly matchMedia?: (query: string) => { readonly matches: boolean };
    };
    return candidate.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export const EPI_LOGOS_MOTION_REDUCED_DEFAULT = readOsReducedMotionDefault();

export const EPI_LOGOS_PREFERENCE_DEFAULTS: Readonly<EpiLogosPreferences> = Object.freeze({
    'epi-logos.layout.active': 'daily-0-1',
    'epi-logos.layout.zero-one-default': '0',
    'epi-logos.omnipanel.first-launch-collapsed': true,
    'epi-logos.coordinate.first-launch': '#0',

    'epi-logos.privacy.default-class': 'protected_local',
    'epi-logos.privacy.kairos-enabled': false,
    'epi-logos.privacy.public-bridge-opt-in': [],

    'epi-logos.motion.reduced': EPI_LOGOS_MOTION_REDUCED_DEFAULT,
    'epi-logos.profile.tick.visible': true,
    'epi-logos.motion.lemniscate-transition-duration-ms': 420,
    'epi-logos.motion.xor-ceremony-duration-ms': 1800,

    'epi-logos.identity.kairos.provider': 'kerykeion',
    'epi-logos.identity.atlas-sync.consents': [],

    'epi-logos.diagnostics.readiness.visible': true,
    'epi-logos.diagnostics.dispatch.trace.verbosity': 'info',
    'epi-logos.diagnostics.cold-start-state': [],
    'epi-logos.diagnostics.reset-enabled': false,

    'epi-logos.theming.mode': 'auto',
    'epi-logos.theming.family-tier.palette': EPI_LOGOS_FAMILY_TIER_DEFAULT_PALETTE
});

export const EPI_LOGOS_PREFERENCE_SCOPES: Readonly<Record<EpiLogosPreferenceName, PreferenceScope>> =
Object.freeze({
    'epi-logos.layout.active': PreferenceScope.User,
    'epi-logos.layout.zero-one-default': PreferenceScope.User,
    'epi-logos.omnipanel.first-launch-collapsed': PreferenceScope.User,
    'epi-logos.coordinate.first-launch': PreferenceScope.User,

    'epi-logos.privacy.default-class': PreferenceScope.User,
    'epi-logos.privacy.kairos-enabled': PreferenceScope.User,
    'epi-logos.privacy.public-bridge-opt-in': PreferenceScope.User,

    'epi-logos.motion.reduced': PreferenceScope.User,
    'epi-logos.profile.tick.visible': PreferenceScope.User,
    'epi-logos.motion.lemniscate-transition-duration-ms': PreferenceScope.User,
    'epi-logos.motion.xor-ceremony-duration-ms': PreferenceScope.User,

    'epi-logos.identity.kairos.provider': PreferenceScope.User,
    'epi-logos.identity.atlas-sync.consents': PreferenceScope.User,

    'epi-logos.diagnostics.readiness.visible': PreferenceScope.Workspace,
    'epi-logos.diagnostics.dispatch.trace.verbosity': PreferenceScope.Workspace,
    'epi-logos.diagnostics.cold-start-state': PreferenceScope.Workspace,
    'epi-logos.diagnostics.reset-enabled': PreferenceScope.Workspace,

    'epi-logos.theming.mode': PreferenceScope.User,
    'epi-logos.theming.family-tier.palette': PreferenceScope.User
});

export const EPI_LOGOS_PREFERENCE_NAMES = Object.freeze(
    Object.keys(EPI_LOGOS_PREFERENCE_DEFAULTS) as EpiLogosPreferenceName[]
);

export function getEpiLogosPreferenceDefault<K extends EpiLogosPreferenceName>(
    preferenceName: K
): EpiLogosPreferences[K] {
    return EPI_LOGOS_PREFERENCE_DEFAULTS[preferenceName];
}

export function getEpiLogosPreferenceScope(preferenceName: EpiLogosPreferenceName): PreferenceScope {
    return EPI_LOGOS_PREFERENCE_SCOPES[preferenceName];
}

function preferenceDefault(preferenceName: EpiLogosPreferenceName): PreferenceSchemaProperty['default'] {
    return EPI_LOGOS_PREFERENCE_DEFAULTS[preferenceName] as PreferenceSchemaProperty['default'];
}

function enumPreference<T extends readonly string[]>(
    preferenceName: EpiLogosPreferenceName,
    values: T,
    description: string,
    markdownDescription?: string
): PreferenceSchemaProperty {
    return {
        type: 'string',
        enum: [...values],
        default: preferenceDefault(preferenceName),
        scope: EPI_LOGOS_PREFERENCE_SCOPES[preferenceName],
        description,
        markdownDescription
    };
}

function booleanPreference(
    preferenceName: EpiLogosPreferenceName,
    description: string,
    markdownDescription?: string
): PreferenceSchemaProperty {
    return {
        type: 'boolean',
        default: preferenceDefault(preferenceName),
        scope: EPI_LOGOS_PREFERENCE_SCOPES[preferenceName],
        description,
        markdownDescription
    };
}

function numberPreference(
    preferenceName: EpiLogosPreferenceName,
    minimum: number,
    description: string
): PreferenceSchemaProperty {
    return {
        type: 'number',
        minimum,
        default: preferenceDefault(preferenceName),
        scope: EPI_LOGOS_PREFERENCE_SCOPES[preferenceName],
        description
    };
}

function stringArrayPreference(
    preferenceName: EpiLogosPreferenceName,
    description: string,
    readOnly = false
): PreferenceSchemaProperty {
    return {
        type: 'array',
        items: { type: 'string' },
        default: preferenceDefault(preferenceName),
        scope: EPI_LOGOS_PREFERENCE_SCOPES[preferenceName],
        description,
        readOnly
    };
}

export const EpiLogosPreferenceSchema: PreferenceSchema = {
    type: 'object',
    title: EPI_LOGOS_PREFERENCE_CATEGORY,
    properties: {
        'epi-logos.layout.active': enumPreference(
            'epi-logos.layout.active',
            ['daily-0-1', 'ide-deep'] as const,
            'Default Pratibimba layout mode.'
        ),
        'epi-logos.layout.zero-one-default': enumPreference(
            'epi-logos.layout.zero-one-default',
            ['0', '1'] as const,
            'Initial 0/1 face for the daily layout; 0 is the cosmic side.'
        ),
        'epi-logos.omnipanel.first-launch-collapsed': booleanPreference(
            'epi-logos.omnipanel.first-launch-collapsed',
            'Whether the OmniPanel starts collapsed on first launch.'
        ),
        'epi-logos.coordinate.first-launch': {
            type: 'string',
            default: EPI_LOGOS_PREFERENCE_DEFAULTS['epi-logos.coordinate.first-launch'],
            scope: EPI_LOGOS_PREFERENCE_SCOPES['epi-logos.coordinate.first-launch'],
            description: 'Initial coordinate for the first-launch workspace.'
        },

        'epi-logos.privacy.default-class': enumPreference(
            'epi-logos.privacy.default-class',
            ['protected_local', 'protected_local_handle_only', 'public_current'] as const,
            'Default privacy class for new Epi-Logos artifacts.'
        ),
        'epi-logos.privacy.kairos-enabled': booleanPreference(
            'epi-logos.privacy.kairos-enabled',
            'Enable live kairos enrichment; defaults off per FR-3.'
        ),
        'epi-logos.privacy.public-bridge-opt-in': stringArrayPreference(
            'epi-logos.privacy.public-bridge-opt-in',
            'Per-artifact public bridge opt-in handles; managed by the privacy opt-in dialog.',
            true
        ),

        'epi-logos.motion.reduced': booleanPreference(
            'epi-logos.motion.reduced',
            'Reduce Epi-Logos motion choreography.',
            'Defaults from the browser `prefers-reduced-motion: reduce` media query.'
        ),
        'epi-logos.profile.tick.visible': booleanPreference(
            'epi-logos.profile.tick.visible',
            'Show the profile-tick status bar entry.'
        ),
        'epi-logos.motion.lemniscate-transition-duration-ms': numberPreference(
            'epi-logos.motion.lemniscate-transition-duration-ms',
            0,
            'Duration for lemniscate shell transitions in milliseconds.'
        ),
        'epi-logos.motion.xor-ceremony-duration-ms': numberPreference(
            'epi-logos.motion.xor-ceremony-duration-ms',
            0,
            'Duration for XOR ceremony choreography in milliseconds.'
        ),

        'epi-logos.identity.kairos.provider': enumPreference(
            'epi-logos.identity.kairos.provider',
            ['kerykeion', 'stub'] as const,
            'Kairos provider used for identity-enriched temporal refresh.'
        ),
        'epi-logos.identity.atlas-sync.consents': stringArrayPreference(
            'epi-logos.identity.atlas-sync.consents',
            'Read-only PASU c_4_atlas_sync_consents display.',
            true
        ),

        'epi-logos.diagnostics.readiness.visible': booleanPreference(
            'epi-logos.diagnostics.readiness.visible',
            'Show readiness diagnostics surfaces.'
        ),
        'epi-logos.diagnostics.dispatch.trace.verbosity': enumPreference(
            'epi-logos.diagnostics.dispatch.trace.verbosity',
            ['silent', 'info', 'debug', 'trace'] as const,
            'Dispatch trace verbosity for workspace diagnostics.'
        ),
        'epi-logos.diagnostics.cold-start-state': stringArrayPreference(
            'epi-logos.diagnostics.cold-start-state',
            'Read-only list of completed cold-start stages for this workspace.',
            true
        ),
        'epi-logos.diagnostics.reset-enabled': booleanPreference(
            'epi-logos.diagnostics.reset-enabled',
            'Gate reset access. Defaults off and is intended for manual workspace settings only.'
        ),

        'epi-logos.theming.mode': enumPreference(
            'epi-logos.theming.mode',
            ['auto', 'light', 'dark'] as const,
            'Epi-Logos theme mode.'
        ),
        'epi-logos.theming.family-tier.palette': {
            type: 'object',
            additionalProperties: false,
            properties: {
                p: { type: 'boolean', default: true, description: 'P-tier palette enabled.' },
                s: { type: 'boolean', default: true, description: 'S-tier palette enabled.' },
                t: { type: 'boolean', default: true, description: 'T-tier palette enabled.' },
                m: { type: 'boolean', default: true, description: 'M-tier palette enabled.' },
                l: { type: 'boolean', default: true, description: 'L-tier palette enabled.' },
                c: { type: 'boolean', default: true, description: 'C-tier palette enabled.' }
            },
            default: preferenceDefault('epi-logos.theming.family-tier.palette'),
            scope: EPI_LOGOS_PREFERENCE_SCOPES['epi-logos.theming.family-tier.palette'],
            description: 'Family-tier palette toggles from the Track 30 design language tier.'
        }
    }
};
