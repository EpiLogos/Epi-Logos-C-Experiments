/**
 * Coordinate: M' `/` membrane (S2 graph reachability — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's S2 reachability probe (27.8; 15.10).
 * Actualises: the spec's <S2GraphReachability />. The gateway-contract protocol
 *   exposes s2.graph.list / s2.graph.query / s2.graph.node / … but NO dedicated
 *   `s2.graph_services.ping` (nor any s2 health/ping method) on the wire — a
 *   grep of Body/S/S3/gateway-contract/src confirms none exists. Rather than
 *   repurpose a data-read as a fake reachability probe (which would fabricate a
 *   green/red verdict), this renders the honest s2_graph_blocked banner naming
 *   the missing method. Reachability lands when a real ping method ships.
 * Public surface: S2GraphReachability, S2_GRAPH_PING_METHOD.
 * Does NOT own: the gateway transport, the S2 graph services, the readiness
 *   banner grammar (ui/ReadinessBanner).
 */

import { ReadinessBanner } from '../../../ui/ReadinessBanner';

/** The method the spec names for an S2 reachability ping. It is NOT registered
 *  on the wire (see the coordinate header) — kept here as the honest reference
 *  to what is absent, never invoked against a fabricated result. */
export const S2_GRAPH_PING_METHOD = 's2.graph_services.ping';

export function S2GraphReachability() {
    return (
        <section className="s2-graph-reachability" data-testid="s2-graph-reachability">
            <h4 className="diagnostics-section-title">S2 graph reachability</h4>
            <ReadinessBanner
                state="s2_graph_blocked"
                reason="no s2 graph ping method on the wire"
                testId="s2-graph-reachability-pending"
            />
        </section>
    );
}
