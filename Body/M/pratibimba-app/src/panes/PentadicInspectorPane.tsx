/**
 * Coordinate: M' M3' (Maxwell/Mahāmāyā 15 inspector body — Tracks 36.3 + 04.T4.14)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m3.mahamaya.pentadicInspector` panel — four lanes putting
 *   the two fifteens into one runtime surface: the Maxwell/KK witness citation,
 *   the live Mahāmāyā paired fifteens + backbone/line-change identities, and
 *   the active pentadic runtime trace (tick · 5° quantum · 72-index ·
 *   64-address · codon · Q ref). Every runtime value renders VERBATIM from the
 *   view model's bus trace; absence shows the pending chip. Not a caveat box —
 *   the physics/computation hinge made visible.
 * Does NOT own: trace law (m3PentadicInspector.ts), the profile cache, flexlayout.
 */

import { useMemo } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { M3PentadicRelationInspector } from '../components/M3PentadicRelationInspector';
import { M3PentadicTraceService, type M3GatewayPort } from '../services/m3';
import { useTickStore } from '../state/stores';

export function PentadicInspectorPane() {
    const cached = useTickStore(s => s.profile);
    const port = useMemo<M3GatewayPort>(
        () => ({ invoke: (method, params = {}) => gateway().invoke(method, params) }),
        []
    );
    const service = useMemo(() => new M3PentadicTraceService(port), [port]);
    const view = useMemo(
        () => service.render({
            payload: (cached?.profile as Record<string, unknown> | null) ?? {},
            generation: cached?.generation ?? 0
        }),
        [cached, service]
    );

    return (
        <section
            className="mext-widget-detail"
            data-testid="m3-pentadic-inspector"
            data-trace-state={view.state}
        >
            <M3PentadicRelationInspector mode="full" view={view} />
        </section>
    );
}
