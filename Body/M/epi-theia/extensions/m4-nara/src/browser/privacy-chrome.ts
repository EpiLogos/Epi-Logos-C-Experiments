import { PRIVACY_CLASS, type NaraPrivacyClass } from '../common';

export const PRIVACY_CHROME_CLASSES = Object.freeze({
    protected_local: 'mext-privacy-protected-local',
    protected_local_handle_only: 'mext-privacy-protected-local-handle-only',
    shared_archetype_opt_in: 'mext-privacy-shared-archetype-opt-in'
} satisfies Readonly<Record<NaraPrivacyClass, string>>);

export type PrivacyChromeClass = (typeof PRIVACY_CHROME_CLASSES)[NaraPrivacyClass];

export const SURFACE_PRIVACY_TOOLTIP = PRIVACY_CLASS;

export function privacyChromeClass(privacyClass: NaraPrivacyClass): PrivacyChromeClass {
    return PRIVACY_CHROME_CLASSES[privacyClass];
}
