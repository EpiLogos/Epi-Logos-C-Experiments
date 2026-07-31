/**
 * Coordinate: M' M5' / `/` membrane (Aletheia subagent sub-trace — 26.T26.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: 26.9's named deliverable — "`<AletheiaSubagentTrace>` per
 *   subagent … RunTree nodes whose mediator is an Aletheia subagent render an
 *   expanded sub-trace". Before this tranche a subagent node rendered its bare
 *   lowercase id in a badge; the six DISTINCT contributions 26.9 enumerates
 *   (citation trail / prospective-retrospective / tarot cast-anchor / kairos
 *   signal / deliberation log / temporal-rhythm anchor) were nowhere on any
 *   surface. This is the render of that contribution, beside the CF binding and
 *   techne class the substrate contract really declares.
 *
 *   IT ALSO RENDERS THE DISCLOSURE ARM. `AletheiaFacetReturn` has carried a
 *   `disclosure` variant since 27.3 and NOTHING rendered it — `VetoBanner`
 *   returns null for it and no other reader existed, so an angle and its
 *   citations were a typed field with no surface. A disclosure IS the ordinary
 *   subagent return (12.19 §5.5: "every dispatched facet discloses an angle;
 *   never concludes"); the veto is the exception. Both are drawn here.
 *
 *   The facet return is OPTIONAL and its absence is disclosed rather than
 *   hidden: no S-layer source constructs a `FacetReturn` today, so a node with
 *   no return is the normal case and the reader is told why
 *   (`aletheiaSubagents.ts::ALETHEIA_SURFACING_SEAMS` `facet-return-feed`).
 * Public surface: AletheiaSubagentTrace, AletheiaSubagentTraceProps.
 * Does NOT own: the register (`aletheiaSubagents.ts`), the veto banner
 *   (`VetoBanner.tsx`), the dispatch structure (`dispatchGenealogy.ts`), or the
 *   crystallisation grouping (`AletheiaCrystallisationGroup.tsx`).
 * Contract: [[DR-M5-1]] · 12.T12.19 · rerun tranche [[26.T26.9]].
 */

import {
    aletheiaSubagentTrace,
    aletheiaSurfacingSeam
} from './aletheiaSubagents';
import type { AletheiaSubagentId } from './evidenceShapes';
import type { AletheiaFacetReturn } from './omnipanelRuntime';
import { VetoBanner } from './VetoBanner';

const FEED_SEAM = aletheiaSurfacingSeam('facet-return-feed');

export interface AletheiaSubagentTraceProps {
    readonly subagent: AletheiaSubagentId;
    /** The subagent's disclosure or veto, when a producer supplied one. */
    readonly facetReturn?: AletheiaFacetReturn;
    /** The profile tick the dispatch was invoked at, when the record carries it. */
    readonly tickAtInvoke?: number;
}

export function AletheiaSubagentTrace({
    subagent,
    facetReturn,
    tickAtInvoke
}: AletheiaSubagentTraceProps) {
    const trace = aletheiaSubagentTrace(subagent);
    return (
        <div
            className={`aletheia-subagent-trace subagent-${trace.id}`}
            data-testid={`aletheia-subagent-trace-${trace.id}`}
            data-subagent={trace.id}
            data-cf={trace.cf}
        >
            <div className="aletheia-subagent-trace-head">
                <strong className="aletheia-subagent-name">{trace.label}</strong>
                <span className="aletheia-subagent-cf">{trace.cf}</span>
                <span className="aletheia-subagent-techne">{trace.techneClass}</span>
            </div>
            <span
                className="aletheia-subagent-trace-kind"
                data-testid={`aletheia-trace-kind-${trace.id}`}
            >
                {trace.traceKind}
            </span>
            <span className="aletheia-subagent-canon">
                <code>{trace.canonRef}</code>
            </span>
            {tickAtInvoke === undefined ? null : (
                <span className="aletheia-subagent-tick">{`tick ${tickAtInvoke}`}</span>
            )}
            {facetReturn === undefined ? (
                <span
                    className="aletheia-subagent-no-return"
                    data-testid={`aletheia-no-return-${trace.id}`}
                >
                    {`no facet return on this dispatch — \`${FEED_SEAM.contract}\` ${FEED_SEAM.reason}`}
                </span>
            ) : facetReturn.kind === 'disclosure' ? (
                <div
                    className="aletheia-subagent-disclosure"
                    data-testid={`aletheia-disclosure-${trace.id}`}
                >
                    <span className="aletheia-disclosure-angle">{facetReturn.angle}</span>
                    {facetReturn.evidenceRefs.length === 0 ? (
                        <span className="aletheia-disclosure-evidence-empty">
                            angle disclosed without citations
                        </span>
                    ) : (
                        <ul className="aletheia-disclosure-evidence" role="list">
                            {facetReturn.evidenceRefs.map(ref => (
                                <li key={ref} role="listitem">
                                    <code>{ref}</code>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <VetoBanner facetReturn={facetReturn} />
            )}
        </div>
    );
}
