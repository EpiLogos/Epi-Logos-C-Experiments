import * as React from 'react';
import type {
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    CoordinateContext
} from '@pratibimba/m-extension-runtime';
import { M0_LAYER_VIEWS } from '../../common/m0-layers';
import type { M0LayerView } from '../../common/m0-layers';
import type { M0ProvenanceState } from '../../common';

/**
 * Track 08 compact contribution (21.T21.17): a lean coordinate summary card the
 * integrated composition layer places in compact slots (e.g. the daily-0-1
 * cosmic-face activity-bar compact slot) and in the ide-deep `main` area.
 *
 * The card is purely presentational. It reads the shared-bridge current state
 * (profile / readiness / coordinate context) handed in by its host widget and
 * never mutates canon or talks to S2/S3 directly. The "Open full view" affordance
 * is a callback so the host can wire the canonical `omnipanel.intent.dispatch`
 * deep-link without coupling this component to the CommandRegistry.
 */
export interface M0CoordinateSummaryCardProps {
    readonly currentProfile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly coordinateContext: CoordinateContext;
    readonly onOpenFullView: () => void;
}

interface ProvenancePill {
    readonly state: M0ProvenanceState;
    readonly label: string;
}

/**
 * The coordinate the card is anchored to. Mirrors the widget's selection
 * precedence: explicit selection, then the resolved canonical M coordinate,
 * then the legacy `#` input (kept distinct so DCC-01 attribution stays visible).
 */
function coordinateLabel(context: CoordinateContext): string {
    return (
        context.selectedCoordinate ??
        context.canonicalMCoordinate ??
        context.hashInput ??
        'No coordinate selected'
    );
}

/**
 * The active M0 surface layer (per 21.20 M0SurfaceState). The compact card shows
 * the surface's default active layer — the M0-0' language register — so the
 * operator can see which of the six M0-X' apertures the full view will land on.
 */
function activeLayerView(): M0LayerView {
    return M0_LAYER_VIEWS[0];
}

/**
 * Derive a provenance-state pill from the shared-bridge readiness + coordinate
 * provenance. Uses the canonical {@link M0ProvenanceState} vocabulary rather than
 * collapsing the nine-state readiness taxonomy to a binary.
 */
function deriveProvenancePill(
    context: CoordinateContext,
    readiness: MExtensionReadinessSnapshot
): ProvenancePill {
    switch (readiness.state) {
        case 'ready_public_current':
            return context.canonicalMCoordinate
                ? { state: 'canonical', label: 'canonical' }
                : { state: 'canonical_absent', label: 'canonical-absent' };
        case 'degraded_but_readable':
            return { state: 'derived', label: 'degraded-but-readable' };
        case 's5_review_blocked':
            return { state: 'review_pending', label: 'review-pending' };
        default:
            return { state: 'blocked', label: 'blocked' };
    }
}

export const M0CoordinateSummaryCard: React.FC<M0CoordinateSummaryCardProps> = (
    props: M0CoordinateSummaryCardProps
) => {
    const { currentProfile, readiness, coordinateContext, onOpenFullView } = props;
    const coordinate = coordinateLabel(coordinateContext);
    const layer = activeLayerView();
    const pill = deriveProvenancePill(coordinateContext, readiness);
    const generation =
        currentProfile?.generation ?? coordinateContext.profileGeneration ?? null;

    return (
        <section
            className="mext-widget-detail m0-coordinate-summary-card"
            data-extension-id="m0-anuttara"
            data-provenance-state={pill.state}
        >
            <dl>
                <dt>Coordinate</dt>
                <dd data-test="m0-summary-coordinate">{coordinate}</dd>
                <dt>Active layer</dt>
                <dd data-test="m0-summary-active-layer" data-layer-id={layer.id} data-layer-key={layer.key}>
                    {layer.label}
                </dd>
            </dl>
            <div className="m0-coordinate-summary-card-meta">
                <span
                    className="m0-coordinate-summary-card-pill"
                    data-provenance-state={pill.state}
                    data-test="m0-summary-provenance-pill"
                >
                    {pill.label}
                </span>
                <span className="m0-coordinate-summary-card-generation">
                    {generation === null ? 'generation —' : `generation ${generation}`}
                </span>
            </div>
            <button
                type="button"
                className="m0-coordinate-summary-card-open"
                data-test="m0-summary-open-full-view"
                onClick={() => onOpenFullView()}
            >
                Open full view
            </button>
        </section>
    );
};

export default M0CoordinateSummaryCard;
