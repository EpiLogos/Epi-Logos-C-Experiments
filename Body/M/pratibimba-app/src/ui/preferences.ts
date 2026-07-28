/**
 * Coordinate: M' shell-0 (the one preference-key authority — 31.T31.9)
 * Residency: Body/M/pratibimba-app/src/ui/preferences.ts
 * Position (#n): #4 — Context/Type (the persisted frame a surface resumes into)
 * Actualises: Tranche 31.9 of the design-recon spec
 *   `31-chrome-contributions-catalog.md:454` ("Preference contributions per
 *   extension", CC-09 / CCT-9). Retarget of the frozen epi-theia target
 *   `m-extension-runtime/src/browser/preferences/epi-logos-preferences.ts` per
 *   CHARTER rule 2: Theia's `PreferenceContribution` + Inversify binding is dead
 *   plumbing, but the LAW it carried — one declaration point, one namespace, a
 *   default and a description per key — is live and lands here.
 * Public surface: PREFERENCE_KEYS, EPI_LOGOS_PREFERENCES, PreferenceDescriptor,
 *   PREFERENCE_NAMESPACE_PATTERN, isPreferenceKey, preferenceDescriptor,
 *   SPECIFIED_PREFERENCES.
 * Does NOT own: the STORAGE of any preference (each consumer keeps its own
 *   localStorage/session-state read-write path), the theme selection vocabulary
 *   (`ui/themeMapping.ts`), the layout-id vocabulary (`ui/layoutId.ts`, 52.T1),
 *   or command ids (`commands/catalog.ts` — those share the `epi-logos.` prefix
 *   but are a different register entirely; see the namespace note below).
 * Contract: rerun tranche [[31.T31.9]].
 */

import { LAYOUT_IDS } from './layoutId';
import { THEME_SELECTIONS } from './themeMapping';

/**
 * The 31.9 namespace law, verbatim from the spec's verification block:
 * `epi-logos.{area}.{setting}`. The area segment is lower-kebab-free (a single
 * lowercase word) and the setting segment may carry `-` or a further `.`.
 *
 * NOTE — command ids share the `epi-logos.` prefix (`epi-logos.help.openWalkthrough`)
 * and would match this shape. They are NOT preferences: they live in
 * `commands/catalog.ts` and are subtracted explicitly by `preferences.test.ts`
 * before it asserts that every remaining literal is declared here.
 */
export const PREFERENCE_NAMESPACE_PATTERN = /^epi-logos\.[a-z][a-z0-9]*\.[a-zA-Z][a-zA-Z0-9.-]*$/;

/** THE key register. Every preference literal in the carrier lives here and
 *  nowhere else; consumers alias these constants (the 52.T1 pattern). */
export const PREFERENCE_KEYS = Object.freeze({
    appearanceTheme: 'epi-logos.appearance.theme',
    layoutActive: 'epi-logos.layout.active',
    privacyKairosEnabled: 'epi-logos.privacy.kairos-enabled',
    onboardingCompletedSteps: 'epi-logos.onboarding.completed-steps',
    onboardingPasuSkipped: 'epi-logos.onboarding.pasu-skipped',
    onboardingSkippedSteps: 'epi-logos.onboarding.skipped-steps'
} as const);

export type PreferenceKey = (typeof PREFERENCE_KEYS)[keyof typeof PREFERENCE_KEYS];

export type PreferenceValueType = 'string' | 'boolean' | 'string-array';

export interface PreferenceDescriptor {
    readonly key: PreferenceKey;
    readonly type: PreferenceValueType;
    /** The carrier's shipped default — what a first run behaves as. */
    readonly defaultValue: string | boolean | readonly string[];
    /** Closed value set for `string` preferences; absent when free-form. */
    readonly enumValues?: readonly string[];
    readonly description: string;
    /** The tranche that owns this preference's behaviour. */
    readonly owningTranche: string;
    /** The module that actually reads and writes it. */
    readonly consumer: string;
}

/**
 * The LIVE preference register: every key the running carrier reads or writes.
 *
 * Deliberately NOT the spec's nine — see `SPECIFIED_PREFERENCES` below. A key
 * declared here that nothing reads would be a registered-but-unfired seam, the
 * exact shape earlier tranches were pulled up for; this register describes the
 * app as it is, and names the rest as pending.
 */
export const EPI_LOGOS_PREFERENCES: readonly PreferenceDescriptor[] = Object.freeze([
    {
        key: PREFERENCE_KEYS.appearanceTheme,
        type: 'string',
        defaultValue: 'dark',
        enumValues: THEME_SELECTIONS,
        description:
            'Theme selection. `dark` is the ground every surface and every visual-regression baseline was authored against; a `nara-*` selection degrades to its base outside M4 per the 30.4 resolution law.',
        owningTranche: '30.T30.4',
        consumer: 'src/state/themeStore.ts'
    },
    {
        key: PREFERENCE_KEYS.layoutActive,
        type: 'string',
        defaultValue: 'daily-0-1',
        enumValues: LAYOUT_IDS,
        description:
            'Active workspace layout, persisted across reload. Consumed by the cross-layout intent spine and by OmniPanel fold filtering (`availableInLayouts`).',
        owningTranche: '31.T31.3 / 52.T1',
        consumer: 'src/panes/omni/omnipanelRuntime.ts'
    },
    {
        key: PREFERENCE_KEYS.privacyKairosEnabled,
        type: 'boolean',
        defaultValue: false,
        description:
            'Whether the Kerykeion kairos populator is active. Default-OFF is the FR-3 law: the temporal ingress is an opt-in, and the carrier probes for the dependency before offering it.',
        owningTranche: '32.T32.10',
        consumer: 'src/panes/kairosEnablement.ts'
    },
    {
        key: PREFERENCE_KEYS.onboardingCompletedSteps,
        type: 'string-array',
        defaultValue: [],
        description:
            'Onboarding step ids the user has completed. Paired with `onboarding.skipped-steps`; the executable ledger (`contracts/onboarding-completion-ledger.json`) is the authority on which ids are legal.',
        owningTranche: '32.T32.13',
        consumer: 'src/panes/kairosEnablement.ts'
    },
    {
        key: PREFERENCE_KEYS.onboardingPasuSkipped,
        type: 'string-array',
        defaultValue: [],
        description:
            'PASU identity steps the user declined. `wizard` present means the full identity wizard was skipped — the first-session orchestration reads this to decide whether the cold-start branch still owes the user an identity gesture.',
        owningTranche: '32.T32.11',
        consumer: 'src/onboarding/pasuOnboarding.ts'
    },
    {
        key: PREFERENCE_KEYS.onboardingSkippedSteps,
        type: 'string-array',
        defaultValue: [],
        description:
            'Walkthrough step ids the user skipped. Dismissing the walkthrough writes NEITHER array — dismissal is not a decision about any step.',
        owningTranche: '32.T32.3',
        consumer: 'src/onboarding/walkthrough.ts'
    }
] as const);

/**
 * Preferences the 31.9 spec declares that the carrier does NOT yet read.
 *
 * Recorded rather than silently dropped, so the 31.12 contributions catalog can
 * enumerate the full designed set and no later reader has to re-derive which of
 * the spec's nine actually landed. Two carry a correction:
 *
 *   * `epi-logos.kairos.enabled` — the carrier landed this as
 *     `epi-logos.privacy.kairos-enabled` (32.T32.10), which is the better name:
 *     the opt-in is a privacy decision, not a scheduling one. The spec spelling
 *     is superseded, not pending.
 *   * `epi-logos.motion.reduced` — NOT landed as a preference and should not be.
 *     Reduced motion is read from the OS via the `prefers-reduced-motion` media
 *     query (`styles.css`, DR-WC-DL-4). A carrier preference would let the app
 *     disagree with the platform accessibility setting, which is a regression.
 */
export const SPECIFIED_PREFERENCES: readonly {
    readonly key: string;
    readonly status: 'pending' | 'superseded' | 'declined';
    readonly note: string;
}[] = Object.freeze([
    {
        key: 'epi-logos.profile.tick.visible',
        status: 'pending',
        note: 'Status-bar profile-tick visibility. The six-entry status bar is fixed (15.10); a visibility toggle needs the 32.4 settings surface to expose it.'
    },
    {
        key: 'epi-logos.privacy.default-class',
        status: 'pending',
        note: 'Default privacy class for new artifacts. The privacy-class vocabulary landed (25.T25.18) but application is per-artifact; a global default is a 25/32 decision.'
    },
    {
        key: 'epi-logos.kairos.enabled',
        status: 'superseded',
        note: 'Landed as `epi-logos.privacy.kairos-enabled` (32.T32.10) — the opt-in is a privacy decision.'
    },
    {
        key: 'epi-logos.motion.reduced',
        status: 'declined',
        note: 'Read from the OS `prefers-reduced-motion` media query instead; a carrier preference could contradict the platform accessibility setting.'
    },
    {
        key: 'epi-logos.ui.developerMode',
        status: 'pending',
        note: 'Developer-mode gating for matheme proof overlays (22.6) and dev panels; no carrier surface reads it yet.'
    },
    {
        key: 'epi-logos.keymap.preserveTheiaDefaults',
        status: 'declined',
        note: 'Theia chord defaults are frozen-Theia plumbing; the carrier owns its own keymap, so there is nothing to preserve.'
    },
    {
        key: 'epi-logos.m1.vortex.faceMode',
        status: 'pending',
        note: 'Vortex face-mode (digit-root vs raw) is currently local view state in the M1 surfaces, not a persisted preference.'
    },
    {
        key: 'epi-logos.m2.devMode',
        status: 'pending',
        note: 'Normalisation of the stage-1 `epiLogos.m2Parashakti.devMode` per CCT-9; the M2 proof-identity panel does not yet gate on a preference.'
    }
] as const);

export function isPreferenceKey(value: string): value is PreferenceKey {
    return EPI_LOGOS_PREFERENCES.some(descriptor => descriptor.key === value);
}

export function preferenceDescriptor(key: string): PreferenceDescriptor | undefined {
    return EPI_LOGOS_PREFERENCES.find(descriptor => descriptor.key === key);
}
