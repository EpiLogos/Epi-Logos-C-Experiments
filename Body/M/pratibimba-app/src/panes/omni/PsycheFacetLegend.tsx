/**
 * Coordinate: M' `/` membrane (psyche-facet legend — rerun tranche 26.T26.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the legend header both DR-WC-M5-3 hosts render — the Dispatch
 *   fold's own header and the Agentic Control Room's governance header.
 * Actualises: the decision's legend clause — the seven-name roster
 *   `Sophia · Anima · Logos · Eros · Mythos · Psyche · Nous` in canonical order,
 *   each swatch carrying the hover reading of its `## 6. Sattva` section and the
 *   path where that section is canon. ONE component with a prefixed testid
 *   rather than two copies of the same row, so the two hosts cannot disagree
 *   about the vocabulary or the order.
 * Public surface: PsycheFacetLegend.
 * Does NOT own: the facet vocabulary, the Sattva readings, or the colours
 *   (psycheFacet.ts + styles.css), and it renders NO actor row — a facet is a
 *   voice, never a dispatch authority (DR-M5-1 / DR-WC-M5-3).
 * Contract: DR-WC-M5-3 · rerun tranche 26.T26.8.
 */

import {
    PSYCHE_FACETS,
    PSYCHE_FACET_LABEL,
    PSYCHE_FACET_SATTVA,
    psycheFacetClass,
    psycheFacetSourceAnchor
} from './psycheFacet';

export interface PsycheFacetLegendProps {
    /** Testid prefix, so two mounted hosts stay individually addressable. */
    readonly idPrefix?: string;
    /** Rendered above the swatches when the host needs the claim spelled out. */
    readonly caption?: string;
}

export function PsycheFacetLegend(props: PsycheFacetLegendProps) {
    const prefix = props.idPrefix ?? 'dispatch';
    return (
        <div
            className="dispatch-psyche-legend"
            data-testid={`${prefix}-psyche-legend`}
            role="list"
            aria-label="psyche-facet legend"
        >
            {props.caption && (
                <span className="psyche-legend-caption" data-testid={`${prefix}-psyche-legend-caption`}>
                    {props.caption}
                </span>
            )}
            {PSYCHE_FACETS.map(facet => (
                <span
                    key={facet}
                    role="listitem"
                    className={`psyche-legend-item ${psycheFacetClass(facet)}`}
                    data-testid={`${prefix === 'dispatch' ? '' : `${prefix}-`}psyche-legend-${facet}`}
                    data-psyche-facet={facet}
                    title={`${PSYCHE_FACET_SATTVA[facet]} — ${psycheFacetSourceAnchor(facet)}`}
                >
                    <span className="psyche-legend-swatch" aria-hidden="true" />
                    {PSYCHE_FACET_LABEL[facet]}
                </span>
            ))}
        </div>
    );
}
