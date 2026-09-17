/**
 * Coordinate: M' M0' (compact coordinate summary, rerun 21.T21.17)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): daily-0-1 cosmic-face compact entrypoint
 * Actualises: the read-only M0 coordinate, default language layer, and
 *   bridge readiness/provenance visible before routing to the deep M0 graph.
 * Public surface: M0CoordinateSummaryCard.
 * Does NOT own: M0 layer state persistence (21.T21.20), graph reads, canon
 *   mutation, or cross-layout navigation semantics.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.17.
 * Ported from: Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/m0-coordinate-summary-card.tsx
 */

import { useCoordinateStore, useTickStore } from '../state/stores';
import { useReadinessStore } from '../state/readinessStore';
import { ProvenanceBadge, type ProvenanceState } from '../ui/ProvenanceBadge';

const M0_GRAPH_READINESS_BINDING = 's2.graph.node';

export interface M0CoordinateSummaryCardProps {
    readonly onOpenFullView: () => void;
}

function provenanceForReadiness(readiness: string | undefined, coordinate: string | null): ProvenanceState {
    if (readiness === 'ready_public_current') {
        return coordinate ? 'canonical' : 'canonical_absent';
    }
    if (readiness === 'degraded_but_readable') {
        return 'derived';
    }
    if (readiness === 's5_review_blocked') {
        return 'review_pending';
    }
    if (readiness === undefined) {
        return 'pending';
    }
    return 'blocked';
}

export function M0CoordinateSummaryCard({ onOpenFullView }: M0CoordinateSummaryCardProps) {
    const coordinate = useCoordinateStore(state => state.selected);
    const generation = useTickStore(state => state.generation);
    const readiness = useReadinessStore(state => state.bindings[M0_GRAPH_READINESS_BINDING]);
    const provenance = provenanceForReadiness(readiness?.state, coordinate);
    const coordinateLabel = coordinate ?? 'No coordinate selected';

    return (
        <section
            className="m0-coordinate-summary-card"
            data-testid="m0-coordinate-summary-card"
            data-coordinate={coordinate ?? ''}
            data-active-layer="language"
            data-provenance-state={provenance}
        >
            <span className="m0-coordinate-summary-card-kicker">M0-0'</span>
            <strong className="m0-coordinate-summary-card-coordinate">{coordinateLabel}</strong>
            <span className="m0-coordinate-summary-card-layer">Language layer</span>
            <span className="m0-coordinate-summary-card-provenance" title={readiness?.reason ?? provenance}>
                <ProvenanceBadge state={provenance} reason={readiness?.reason} />
                {provenance.replace('_', ' ')}
            </span>
            <span className="m0-coordinate-summary-card-generation">
                {generation === null ? 'generation pending' : `generation ${generation}`}
            </span>
            <button
                type="button"
                className="m0-coordinate-summary-card-open"
                data-testid="m0-summary-open-full-view"
                onClick={onOpenFullView}
            >
                Open full view
            </button>
        </section>
    );
}
