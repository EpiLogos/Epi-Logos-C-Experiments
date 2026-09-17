/**
 * Coordinate: M' (provenance primitive)
 * Actualises: the unified ProvenanceState taxonomy (THEIA-UI-PATTERNS §3 —
 *   the taxonomy survives its carrier): one badge component, no widget
 *   invents its own provenance rendering.
 */

export type ProvenanceState =
    | 'canonical'
    | 'derived'
    | 'inferred'
    | 'pending'
    | 'canonical_absent'
    | 'review_pending'
    | 'blocked';

const GLYPHS: Record<ProvenanceState, string> = {
    canonical: '',
    derived: 'Δ',
    inferred: '?',
    pending: '⏳',
    canonical_absent: '∅',
    review_pending: '⚖',
    blocked: '⛔'
};

export function ProvenanceBadge({ state, reason }: { state: ProvenanceState; reason?: string }) {
    if (state === 'canonical') {
        return null;
    }
    return (
        <span
            className={`provenance-badge provenance-${state}`}
            data-testid={`provenance-${state}`}
            title={reason ?? state.replace('_', ' ')}
        >
            {GLYPHS[state]}
        </span>
    );
}
