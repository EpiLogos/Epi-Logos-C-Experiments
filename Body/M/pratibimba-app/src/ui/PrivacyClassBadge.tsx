/**
 * Coordinate: M' shell (privacy-class badge — Track 27.T27.2 continuity fold)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the small shared indicator for the bound session's privacy class
 *   (`useSessionStore(s => s.privacyClass)`). Shows the protected-local marker
 *   when the session touched Nara content, so a viewer sees at a glance that
 *   the session carries protected-local material. Reads the shared store; a
 *   `value` override lets a per-record surface show a record's own class.
 * Public surface: PrivacyClassBadge, privacyClassLabel, isProtectedLocal.
 * Does NOT own: the privacy law (S0 privacy classes), the session store.
 */

import { useSessionStore } from '../state/stores';

const LABELS: Readonly<Record<string, string>> = Object.freeze({
    public: 'public',
    protected: 'protected',
    'protected-local': 'protected-local',
    protected_local: 'protected-local'
});

export function isProtectedLocal(privacyClass: string | null | undefined): boolean {
    return privacyClass === 'protected-local' || privacyClass === 'protected_local';
}

export function privacyClassLabel(privacyClass: string | null | undefined): string | null {
    if (!privacyClass) {
        return null;
    }
    return LABELS[privacyClass] ?? privacyClass;
}

/**
 * Renders the bound session's privacy class. `value` overrides the store for a
 * record-scoped surface; omit it to read `useSessionStore(s => s.privacyClass)`.
 * Renders nothing when there is no privacy class to show (honest absence).
 */
export function PrivacyClassBadge({
    value
}: {
    readonly value?: string | null;
} = {}) {
    const storeValue = useSessionStore(s => s.privacyClass);
    const resolved = value === undefined ? storeValue : value;
    const label = privacyClassLabel(resolved);
    if (!label) {
        return null;
    }
    const protectedLocal = isProtectedLocal(resolved);
    return (
        <span
            className={`privacy-class-badge privacy-${protectedLocal ? 'protected-local' : label}`}
            data-testid="privacy-class-badge"
            data-privacy={label}
            data-protected-local={protectedLocal}
            title={
                protectedLocal
                    ? 'protected-local — this session touched Nara content'
                    : `privacy: ${label}`
            }
        >
            {label}
        </span>
    );
}
