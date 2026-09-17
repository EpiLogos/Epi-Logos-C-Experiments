import type { PreferenceContribution } from '@theia/core/lib/browser/preferences/preference-contribution';
import { PreferenceScope } from '@theia/core/lib/common/preferences/preference-scope';
import { injectable } from '@theia/core/shared/inversify';
import * as React from 'react';
import {
    EPI_LOGOS_FAMILY_TIERS,
    EPI_LOGOS_PREFERENCE_DEFAULTS,
    EPI_LOGOS_PREFERENCE_SCOPES,
    EpiLogosFamilyTierPalette,
    EpiLogosPreferenceName,
    EpiLogosPreferences,
    EpiLogosPreferenceSchema,
    getEpiLogosPreferenceDefault,
    getEpiLogosPreferenceScope
} from '../../common/preferences-schema';
import {
    OPEN_WALKTHROUGH_COMMAND,
    replayOnboardingWalkthrough
} from '../onboarding/walkthrough-overlay';

export { OPEN_WALKTHROUGH_COMMAND, replayOnboardingWalkthrough };

export const OPEN_PASU_WIZARD_COMMAND = 'm4.openPasuWizard';
export const RERUN_COLD_START_ORCHESTRATOR_COMMAND = 'epi-logos.coldStart.rerun';

export type EpiLogosSettingsSectionId =
    | 'layout'
    | 'privacy'
    | 'motion'
    | 'identity'
    | 'diagnostics'
    | 'theming';

export type EpiLogosPreferenceKind =
    | 'string'
    | 'boolean'
    | 'number'
    | 'enum'
    | 'string-array'
    | 'family-tier-palette';

export interface EpiLogosSettingsPreferenceRow {
    readonly preferenceName: EpiLogosPreferenceName;
    readonly label: string;
    readonly kind: EpiLogosPreferenceKind;
    readonly enumValues?: readonly string[];
    readonly readOnly?: boolean;
}

export interface EpiLogosSettingsAction {
    readonly id: string;
    readonly label: string;
    readonly run: (services: EpiLogosSettingsActionServices) => unknown;
}

export interface EpiLogosSettingsSection {
    readonly id: EpiLogosSettingsSectionId;
    readonly title: string;
    readonly scope: PreferenceScope;
    readonly preferences: readonly EpiLogosSettingsPreferenceRow[];
    readonly actions?: readonly EpiLogosSettingsAction[];
}

export interface EpiLogosSettingsActionServices {
    readonly executeCommand: (command: string, ...args: unknown[]) => unknown;
    readonly rerunColdStartOrchestrator?: () => unknown;
}

export interface EpiLogosSettingsPageProps extends Partial<EpiLogosSettingsActionServices> {
    readonly preferences?: Partial<EpiLogosPreferences>;
    readonly setPreference?: (
        preferenceName: EpiLogosPreferenceName,
        value: EpiLogosPreferences[EpiLogosPreferenceName],
        scope: PreferenceScope
    ) => void | Promise<void>;
}

export const EPI_LOGOS_SETTINGS_SECTIONS: readonly EpiLogosSettingsSection[] = Object.freeze([
    {
        id: 'layout',
        title: 'Layout',
        scope: PreferenceScope.User,
        preferences: [
            {
                preferenceName: 'epi-logos.layout.active',
                label: 'Active layout',
                kind: 'enum',
                enumValues: ['daily-0-1', 'ide-deep']
            },
            {
                preferenceName: 'epi-logos.layout.zero-one-default',
                label: '0/1 default face',
                kind: 'enum',
                enumValues: ['0', '1']
            },
            {
                preferenceName: 'epi-logos.omnipanel.first-launch-collapsed',
                label: 'OmniPanel first launch collapsed',
                kind: 'boolean'
            },
            {
                preferenceName: 'epi-logos.coordinate.first-launch',
                label: 'First launch coordinate',
                kind: 'string'
            }
        ]
    },
    {
        id: 'privacy',
        title: 'Privacy',
        scope: PreferenceScope.User,
        preferences: [
            {
                preferenceName: 'epi-logos.privacy.default-class',
                label: 'Default privacy class',
                kind: 'enum',
                enumValues: ['protected_local', 'protected_local_handle_only', 'public_current']
            },
            {
                preferenceName: 'epi-logos.privacy.kairos-enabled',
                label: 'Kairos enabled',
                kind: 'boolean'
            },
            {
                preferenceName: 'epi-logos.privacy.public-bridge-opt-in',
                label: 'Public bridge opt-in handles',
                kind: 'string-array',
                readOnly: true
            }
        ]
    },
    {
        id: 'motion',
        title: 'Motion',
        scope: PreferenceScope.User,
        preferences: [
            {
                preferenceName: 'epi-logos.motion.reduced',
                label: 'Reduced motion',
                kind: 'boolean'
            },
            {
                preferenceName: 'epi-logos.profile.tick.visible',
                label: 'Profile tick visible',
                kind: 'boolean'
            },
            {
                preferenceName: 'epi-logos.motion.lemniscate-transition-duration-ms',
                label: 'Lemniscate transition duration',
                kind: 'number'
            },
            {
                preferenceName: 'epi-logos.motion.xor-ceremony-duration-ms',
                label: 'XOR ceremony duration',
                kind: 'number'
            }
        ]
    },
    {
        id: 'identity',
        title: 'Identity',
        scope: PreferenceScope.User,
        preferences: [
            {
                preferenceName: 'epi-logos.identity.kairos.provider',
                label: 'Kairos provider',
                kind: 'enum',
                enumValues: ['kerykeion', 'stub']
            },
            {
                preferenceName: 'epi-logos.identity.atlas-sync.consents',
                label: 'Atlas sync consents',
                kind: 'string-array',
                readOnly: true
            }
        ],
        actions: [
            {
                id: 'edit-pasu-identity',
                label: 'Edit PASU.md identity',
                run: services => editPasuIdentity(services.executeCommand)
            }
        ]
    },
    {
        id: 'diagnostics',
        title: 'Diagnostics',
        scope: PreferenceScope.Workspace,
        preferences: [
            {
                preferenceName: 'epi-logos.diagnostics.readiness.visible',
                label: 'Readiness visible',
                kind: 'boolean'
            },
            {
                preferenceName: 'epi-logos.diagnostics.dispatch.trace.verbosity',
                label: 'Dispatch trace verbosity',
                kind: 'enum',
                enumValues: ['silent', 'info', 'debug', 'trace']
            },
            {
                preferenceName: 'epi-logos.diagnostics.cold-start-state',
                label: 'Cold-start completed stages',
                kind: 'string-array',
                readOnly: true
            },
            {
                preferenceName: 'epi-logos.diagnostics.reset-enabled',
                label: 'Reset access enabled',
                kind: 'boolean'
            }
        ],
        actions: [
            {
                id: 'replay-onboarding-walkthrough',
                label: 'Replay onboarding walkthrough',
                run: services => replayOnboardingWalkthrough(services.executeCommand)
            },
            {
                id: 'rerun-cold-start-orchestrator',
                label: 'Re-run cold-start orchestrator',
                run: services => rerunColdStartOrchestrator(services)
            }
        ]
    },
    {
        id: 'theming',
        title: 'Theming',
        scope: PreferenceScope.User,
        preferences: [
            {
                preferenceName: 'epi-logos.theming.mode',
                label: 'Theme mode',
                kind: 'enum',
                enumValues: ['auto', 'light', 'dark']
            },
            {
                preferenceName: 'epi-logos.theming.family-tier.palette',
                label: 'Family-tier palette',
                kind: 'family-tier-palette'
            }
        ]
    }
]);

@injectable()
export class EpiLogosSettingsPreferenceContribution implements PreferenceContribution {
    readonly schema = EpiLogosPreferenceSchema;
}

export function editPasuIdentity(executeCommand: EpiLogosSettingsActionServices['executeCommand']): unknown {
    return executeCommand(OPEN_PASU_WIZARD_COMMAND, { mode: 'edit' });
}

export function rerunColdStartOrchestrator(services: EpiLogosSettingsActionServices): unknown {
    return services.rerunColdStartOrchestrator
        ? services.rerunColdStartOrchestrator()
        : services.executeCommand(RERUN_COLD_START_ORCHESTRATOR_COMMAND);
}

export function isReadonlyPreference(preferenceName: EpiLogosPreferenceName): boolean {
    return EpiLogosPreferenceSchema.properties[preferenceName]?.readOnly === true;
}

export function sectionPreferenceNames(sectionId: EpiLogosSettingsSectionId): readonly EpiLogosPreferenceName[] {
    return EPI_LOGOS_SETTINGS_SECTIONS.find(section => section.id === sectionId)?.preferences.map(
        preference => preference.preferenceName
    ) ?? [];
}

function currentPreferenceValue<K extends EpiLogosPreferenceName>(
    preferences: Partial<EpiLogosPreferences> | undefined,
    preferenceName: K
): EpiLogosPreferences[K] {
    return preferences?.[preferenceName] ?? getEpiLogosPreferenceDefault(preferenceName);
}

function formatPreferenceValue(value: unknown): string {
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'None recorded';
    }
    if (value && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>)
            .map(([key, enabled]) => `${key.toUpperCase()}=${enabled === true ? 'on' : 'off'}`)
            .join(', ');
    }
    return String(value);
}

function preferenceDescription(preferenceName: EpiLogosPreferenceName): string {
    return EpiLogosPreferenceSchema.properties[preferenceName]?.description ?? preferenceName;
}

function scopeLabel(scope: PreferenceScope): string {
    return scope === PreferenceScope.Workspace ? 'Workspace' : 'User';
}

function writePreference(
    props: EpiLogosSettingsPageProps,
    preferenceName: EpiLogosPreferenceName,
    value: EpiLogosPreferences[EpiLogosPreferenceName]
): void {
    if (isReadonlyPreference(preferenceName)) {
        return;
    }
    void props.setPreference?.(preferenceName, value, getEpiLogosPreferenceScope(preferenceName));
}

const PreferenceControl: React.FC<{
    readonly row: EpiLogosSettingsPreferenceRow;
    readonly props: EpiLogosSettingsPageProps;
}> = ({ row, props }) => {
    const value = currentPreferenceValue(props.preferences, row.preferenceName);
    const disabled = row.readOnly === true || isReadonlyPreference(row.preferenceName);

    if (row.kind === 'boolean') {
        return (
            <input
                type="checkbox"
                checked={value === true}
                disabled={disabled}
                aria-label={row.label}
                onChange={event => writePreference(props, row.preferenceName, event.currentTarget.checked)}
            />
        );
    }

    if (row.kind === 'number') {
        return (
            <input
                type="number"
                min={0}
                value={String(value)}
                disabled={disabled}
                aria-label={row.label}
                onChange={event => writePreference(props, row.preferenceName, Number(event.currentTarget.value))}
            />
        );
    }

    if (row.kind === 'enum') {
        return (
            <select
                value={String(value)}
                disabled={disabled}
                aria-label={row.label}
                onChange={event => writePreference(props, row.preferenceName, event.currentTarget.value)}
            >
                {(row.enumValues ?? []).map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        );
    }

    if (row.kind === 'family-tier-palette') {
        const palette = value as EpiLogosFamilyTierPalette;
        return (
            <div className="mext-settings-family-palette" data-test="family-tier-palette">
                {EPI_LOGOS_FAMILY_TIERS.map(tier => (
                    <label key={tier}>
                        <input
                            type="checkbox"
                            checked={palette[tier] === true}
                            disabled={disabled}
                            onChange={event => writePreference(props, row.preferenceName, {
                                ...palette,
                                [tier]: event.currentTarget.checked
                            })}
                        />
                        <span>{tier.toUpperCase()}-tier</span>
                    </label>
                ))}
            </div>
        );
    }

    if (row.kind === 'string-array' || disabled) {
        return (
            <output aria-label={row.label} data-readonly={disabled ? 'true' : 'false'}>
                {formatPreferenceValue(value)}
            </output>
        );
    }

    return (
        <input
            type="text"
            value={String(value)}
            disabled={disabled}
            aria-label={row.label}
            onChange={event => writePreference(props, row.preferenceName, event.currentTarget.value)}
        />
    );
};

export const EpiLogosSettingsPage: React.FC<EpiLogosSettingsPageProps> = props => {
    const executeCommand = props.executeCommand ?? (() => undefined);
    const actionServices: EpiLogosSettingsActionServices = {
        executeCommand,
        rerunColdStartOrchestrator: props.rerunColdStartOrchestrator
    };

    return (
        <section
            className="mext-settings-page"
            data-category="epi-logos"
            aria-label="Epi-Logos settings"
        >
            {EPI_LOGOS_SETTINGS_SECTIONS.map(section => (
                <article
                    key={section.id}
                    className="mext-settings-card"
                    data-section={section.id}
                    data-scope={scopeLabel(section.scope)}
                >
                    <header className="mext-settings-card-header">
                        <h2>{section.title}</h2>
                        <span>{scopeLabel(section.scope)}</span>
                    </header>
                    <dl>
                        {section.preferences.map(row => (
                            <React.Fragment key={row.preferenceName}>
                                <dt>
                                    <label>{row.label}</label>
                                    <code>{row.preferenceName}</code>
                                </dt>
                                <dd>
                                    <PreferenceControl row={row} props={props} />
                                    <small>{preferenceDescription(row.preferenceName)}</small>
                                </dd>
                            </React.Fragment>
                        ))}
                    </dl>
                    {section.actions?.length ? (
                        <footer className="mext-settings-actions">
                            {section.actions.map(action => (
                                <button
                                    key={action.id}
                                    type="button"
                                    className="theia-button"
                                    data-action={action.id}
                                    data-command={
                                        action.id === 'replay-onboarding-walkthrough'
                                            ? OPEN_WALKTHROUGH_COMMAND
                                            : action.id === 'edit-pasu-identity'
                                                ? OPEN_PASU_WIZARD_COMMAND
                                                : RERUN_COLD_START_ORCHESTRATOR_COMMAND
                                    }
                                    onClick={() => action.run(actionServices)}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </footer>
                    ) : null}
                </article>
            ))}
        </section>
    );
};

export const EPI_LOGOS_SETTINGS_DEFAULT_SCOPE_SUMMARY = Object.freeze(
    Object.fromEntries(
        Object.entries(EPI_LOGOS_PREFERENCE_SCOPES).map(([name, scope]) => [
            name,
            scopeLabel(scope)
        ])
    ) as Record<EpiLogosPreferenceName, 'User' | 'Workspace'>
);

export const EPI_LOGOS_SETTINGS_DEFAULT_VALUE_SUMMARY = EPI_LOGOS_PREFERENCE_DEFAULTS;
