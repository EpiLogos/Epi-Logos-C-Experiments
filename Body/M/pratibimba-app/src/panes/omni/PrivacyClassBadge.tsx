/**
 * Coordinate: M' `/` membrane (shared privacy-class badge — Track 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the shared privacy-class indicator (27.1/2/4/5/6 all consume it).
 *   Renders the packet/event privacy class with the M4 protected-local
 *   invariant tooltip: protected-local content never crosses the public bridge —
 *   only handle metadata is ever shown, never a protected body.
 * Public surface: PrivacyClassBadge, privacyClassKind.
 * Does NOT own: the packet schema (evidenceShapes.ts), any data feed.
 */

export type PrivacyClassKind = 'public' | 'protected' | 'private' | 'unknown';

/** Normalise a free-form privacyClass string to a known kind (e.g.
 *  `safe-public-current-kernel-tick` → public). */
export function privacyClassKind(privacyClass: string): PrivacyClassKind {
    const value = privacyClass.toLowerCase();
    if (value.includes('private')) {
        return 'private';
    }
    if (value.includes('protected')) {
        return 'protected';
    }
    if (value.includes('public')) {
        return 'public';
    }
    return 'unknown';
}

const TOOLTIP: Readonly<Record<PrivacyClassKind, string>> = {
    public: 'Public-current content — safe to cross the bridge.',
    protected:
        'Protected-local content never crosses the public bridge — this carries handle metadata only, never a protected body.',
    private: 'Private content — not displayed; redacted at the bridge.',
    unknown: 'Privacy class unrecognised — treated as non-public.'
};

export function PrivacyClassBadge({ privacyClass }: { readonly privacyClass: string }) {
    const kind = privacyClassKind(privacyClass);
    return (
        <span
            className={`privacy-class-badge privacy-${kind}`}
            data-testid="privacy-class-badge"
            data-privacy-kind={kind}
            title={TOOLTIP[kind]}
        >
            {kind}
        </span>
    );
}
