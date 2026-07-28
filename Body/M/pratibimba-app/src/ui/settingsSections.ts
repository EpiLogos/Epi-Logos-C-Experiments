/**
 * Coordinate: M' shell (the Settings UX section law — Track 32.T32.4)
 * Residency: Body/M/pratibimba-app/src/ui
 * Position (#n): #4 — Context/Type (the six frames a preference is read inside;
 *   the type law of the carrier's one settings surface)
 * Actualises: Tranche 32.4 of the design-recon spec
 *   `32-onboarding-settings-empty-states.md:101` ("Settings UX surface",
 *   DR-WC-OB-4 / O-WC-OB-3). Retarget per CHARTER rule 2: Theia's
 *   `PreferenceContribution` + `PreferenceProxy` + Inversify DI is dead
 *   plumbing, and "Preferences → Open Settings (UI)" is a dead menu path. The
 *   LAW it carried is live and lands here — six named sections, a declared
 *   scope per section (User vs Workspace, WC-OB-21), every preference read in
 *   exactly one place, and the action affordances each section offers.
 *
 *   THE HONEST SHAPE. The 32.4 spec lists roughly twenty preferences. Six of
 *   them exist: `ui/preferences.ts` (31.T31.9) declares the live register and
 *   deliberately records the rest as `pending` / `superseded` / `declined`
 *   rather than declaring keys nothing reads. This module inherits that
 *   posture instead of overturning it — a section renders its LIVE entries as
 *   working controls and its SPECIFIED entries as disclosure rows carrying the
 *   register's own reason. A settings page whose switches move nothing would
 *   be worse than no settings page: it would lie about what the app does.
 *
 *   Both registers are consumed, never re-listed: every live key and every
 *   specified key must land in exactly one section, asserted in both
 *   directions, so a key added to `ui/preferences.ts` fails this suite until
 *   it is given a home.
 * Public surface: SettingsSectionId, SettingsScope, SettingsEntry,
 *   SettingsAction, SettingsSection, SETTINGS_SECTIONS, settingsSection,
 *   liveEntries, disclosedEntries, SETTINGS_ACTION_IDS.
 * Does NOT own: the preference keys, defaults or descriptions (`ui/preferences.ts`,
 *   31.T31.9); the STORAGE of any value (each consumer keeps its own path —
 *   `state/themeStore`, `panes/kairosEnablement`, `onboarding/*`); what the
 *   action commands do (`commands/catalog.ts` + their owners); the rendering
 *   (`panes/omni/SettingsPane.tsx`); the layout switch itself (52.T3) or the
 *   profile-tick visibility behaviour (32.T32.9).
 * Contract: rerun tranche [[32.T32.4]] · [[CHROME-CONTRACT]] §2 row `omniSettings`.
 */

import {
    EPI_LOGOS_PREFERENCES,
    PREFERENCE_KEYS,
    SPECIFIED_PREFERENCES,
    type PreferenceKey
} from './preferences';

export type SettingsSectionId =
    | 'layout'
    | 'privacy'
    | 'motion'
    | 'identity'
    | 'diagnostics'
    | 'theming';

/** WC-OB-21: Diagnostics is workspace-scoped; everything a person chooses
 *  about their own experience is user-scoped. */
export type SettingsScope = 'user' | 'workspace';

/**
 * How a live preference is edited HERE. `read-only` is a first-class answer,
 * not a shortfall: two of the six live keys are written by a flow that owns
 * more than the value (the layout switch; the onboarding ledger), and a second
 * writer in this surface would let Settings and that flow disagree.
 */
export type SettingsControlKind = 'select' | 'toggle' | 'read-only';

export interface LiveSettingsEntry {
    readonly kind: 'live';
    readonly key: PreferenceKey;
    readonly control: SettingsControlKind;
    /** The path that actually performs the write — named so a reader can see
     *  this surface is a face on an existing seam, not a seventh writer. */
    readonly writePath: string;
}

export interface DisclosedSettingsEntry {
    readonly kind: 'disclosed';
    readonly key: string;
    readonly status: 'pending' | 'superseded' | 'declined';
}

export type SettingsEntry = LiveSettingsEntry | DisclosedSettingsEntry;

export interface SettingsAction {
    /** A command id that MUST exist in `commands/catalog.ts` — asserted. */
    readonly commandId: string;
    readonly label: string;
    readonly description: string;
}

export interface SettingsSection {
    readonly id: SettingsSectionId;
    readonly label: string;
    readonly scope: SettingsScope;
    /** One sentence a reader can act on, not a restatement of the label. */
    readonly purpose: string;
    readonly entries: readonly SettingsEntry[];
    readonly actions: readonly SettingsAction[];
}

const live = (
    key: PreferenceKey,
    control: SettingsControlKind,
    writePath: string
): LiveSettingsEntry => Object.freeze({ kind: 'live', key, control, writePath });

/**
 * Which section a specified-but-not-live preference is disclosed in, keyed by
 * its AREA segment (`epi-logos.{area}.{setting}`) rather than by its full key.
 *
 * This is the documented rule made executable, and it is also why no preference
 * key is spelled in this file: 31.T31.9's guard holds that `ui/preferences.ts`
 * is the only place in `src` that spells one, and a hand-written list of
 * disclosures here would have been a second spelling free to drift from the
 * register. Areas that name a section go to it; the four that do not go where
 * their SUBJECT lives — `kairos` is a privacy opt-in, `profile` is motion,
 * `keymap` is chrome, and the developer/per-surface modes are diagnostics.
 */
const DISCLOSURE_AREA_SECTION: Readonly<Record<string, SettingsSectionId>> = Object.freeze({
    layout: 'layout',
    keymap: 'layout',
    privacy: 'privacy',
    kairos: 'privacy',
    motion: 'motion',
    profile: 'motion',
    identity: 'identity',
    ui: 'diagnostics',
    m1: 'diagnostics',
    m2: 'diagnostics',
    theming: 'theming'
});

function disclosureSection(key: string): SettingsSectionId {
    const area = key.split('.')[1] ?? '';
    const section = DISCLOSURE_AREA_SECTION[area];
    if (!section) {
        throw new Error(`no settings section for preference area: ${area} (${key})`);
    }
    return section;
}

/** Status is READ from `SPECIFIED_PREFERENCES`, never restated — the register
 *  is the authority on why a key is not live. */
function disclosuresFor(id: SettingsSectionId): readonly DisclosedSettingsEntry[] {
    return Object.freeze(
        SPECIFIED_PREFERENCES.filter(entry => disclosureSection(entry.key) === id).map(entry =>
            Object.freeze({ kind: 'disclosed' as const, key: entry.key, status: entry.status })
        )
    );
}

function section(spec: {
    readonly id: SettingsSectionId;
    readonly label: string;
    readonly scope: SettingsScope;
    readonly purpose: string;
    readonly live: readonly LiveSettingsEntry[];
    readonly actions: readonly SettingsAction[];
}): SettingsSection {
    return Object.freeze({
        id: spec.id,
        label: spec.label,
        scope: spec.scope,
        purpose: spec.purpose,
        entries: Object.freeze([...spec.live, ...disclosuresFor(spec.id)]),
        actions: Object.freeze([...spec.actions])
    });
}

/**
 * The six. Section membership follows the key's own area segment wherever a
 * section matches it (`privacy.*` → Privacy, `motion.*` → Motion); the two
 * that have no matching section go where their SUBJECT lives — `keymap.*` is
 * chrome, so Layout; `ui.developerMode` and the per-surface `m1.*` / `m2.*`
 * modes are developer state, so Diagnostics.
 */
export const SETTINGS_SECTIONS: readonly SettingsSection[] = Object.freeze([
    section({
        id: 'layout',
        label: 'Layout',
        scope: 'user',
        purpose:
            'Which workspace layout the shell resumes into. The switch itself belongs to the layout surface (52.T3); this section shows what is persisted.',
        live: [
            live(PREFERENCE_KEYS.layoutActive, 'read-only', 'the shell layout switch (52.T3) writes it')
        ],
        actions: []
    }),
    section({
        id: 'privacy',
        label: 'Privacy',
        scope: 'user',
        purpose:
            'What the carrier is permitted to reach for on your behalf. Kairos is opt-in and stays off until its local dependency actually answers.',
        live: [
            live(
                PREFERENCE_KEYS.privacyKairosEnabled,
                'toggle',
                'runKairosEnable / runKairosSkip (panes/kairosEnablement.ts) — probe-gated, never a raw key write'
            )
        ],
        actions: []
    }),
    section({
        id: 'motion',
        label: 'Motion',
        scope: 'user',
        purpose:
            'How much the surfaces move. Reduced motion is the platform\u2019s call, not the carrier\u2019s — this section reports what the OS is currently asking for.',
        live: [],
        actions: []
    }),
    section({
        id: 'identity',
        label: 'Identity',
        scope: 'user',
        purpose:
            'Your PASU identity note and the parts of it you have chosen not to fill in yet.',
        live: [
            live(
                PREFERENCE_KEYS.onboardingPasuSkipped,
                'read-only',
                'the identity wizard (25.T25.4) and the cold-start branch write it'
            )
        ],
        actions: [
            {
                commandId: 'identity.openWizard',
                label: 'Edit PASU.md identity',
                description:
                    'Opens the identity wizard on the PASU note. Editing there is the only write path — this surface never edits identity in place.'
            }
        ]
    }),
    section({
        id: 'diagnostics',
        label: 'Diagnostics',
        scope: 'workspace',
        purpose:
            'What the carrier has recorded about this workspace\u2019s cold start — which onboarding steps completed, and which you skipped.',
        live: [
            live(
                PREFERENCE_KEYS.onboardingCompletedSteps,
                'read-only',
                'the onboarding ledger (32.T32.13) writes it as steps complete'
            ),
            live(
                PREFERENCE_KEYS.onboardingSkippedSteps,
                'read-only',
                'the walkthrough (32.T32.3) writes it when a step is skipped'
            )
        ],
        actions: [
            {
                commandId: 'epi-logos.help.openWalkthrough',
                label: 'Replay onboarding walkthrough',
                description:
                    'Re-runs the walkthrough from its first step. It does not clear what you have already completed — replaying is not resetting.'
            }
        ]
    }),
    section({
        id: 'theming',
        label: 'Theming',
        scope: 'user',
        purpose:
            'The theme every surface resolves against. A nara-* selection degrades to its base outside M4 per the 30.4 resolution law.',
        live: [
            live(
                PREFERENCE_KEYS.appearanceTheme,
                'select',
                'the theme command spine (commands/theme.ts) \u2192 useThemeStore.select'
            )
        ],
        actions: []
    })
]);

export function settingsSection(id: SettingsSectionId): SettingsSection {
    const section = SETTINGS_SECTIONS.find(entry => entry.id === id);
    if (!section) {
        throw new Error(`unknown settings section: ${id}`);
    }
    return section;
}

export function liveEntries(section: SettingsSection): readonly LiveSettingsEntry[] {
    return section.entries.filter((entry): entry is LiveSettingsEntry => entry.kind === 'live');
}

export function disclosedEntries(section: SettingsSection): readonly DisclosedSettingsEntry[] {
    return section.entries.filter(
        (entry): entry is DisclosedSettingsEntry => entry.kind === 'disclosed'
    );
}

/** Every command this surface can fire — the set a registration test checks. */
export const SETTINGS_ACTION_IDS: readonly string[] = Object.freeze(
    SETTINGS_SECTIONS.flatMap(section => section.actions.map(action => action.commandId))
);

/** Fails at module load if a live key has no home, so the surface can never
 *  quietly stop showing a preference the app actually reads. */
const assignedLiveKeys = SETTINGS_SECTIONS.flatMap(section =>
    liveEntries(section).map(entry => entry.key)
);
for (const descriptor of EPI_LOGOS_PREFERENCES) {
    if (!assignedLiveKeys.includes(descriptor.key)) {
        throw new Error(`live preference has no settings section: ${descriptor.key}`);
    }
}
