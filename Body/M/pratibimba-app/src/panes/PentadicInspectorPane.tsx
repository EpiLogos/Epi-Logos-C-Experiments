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
import { useTickStore } from '../state/stores';
import { buildPentadicInspectorView } from './m3PentadicInspector';

export function PentadicInspectorPane() {
    const cached = useTickStore(s => s.profile);

    const view = useMemo(() => {
        if (!cached) {
            return null;
        }
        return buildPentadicInspectorView({
            payload: (cached.profile as Record<string, unknown> | null) ?? {},
            generation: cached.generation
        });
    }, [cached]);

    const trace = view?.trace ?? null;
    const state = view?.state ?? 'pending-anuttara-pentadic-trace';

    return (
        <section
            className="mext-widget-detail"
            data-testid="m3-pentadic-inspector"
            data-trace-state={state}
        >
            <h3>Pentadic hinge — the two fifteens</h3>

            <dl>
                <dt>Coupling-flow alignment</dt>
                <dd data-testid="m3-pentadic-coupling-flow" data-state={view?.couplingFlowState ?? 'pending-coupling-flow-alignment'}>
                    {view?.couplingFlow
                        ? 'couplingFlowAlignment carried on the bus'
                        : 'pending-coupling-flow-alignment — lane populates when Track 10.M3 lands the projection'}
                </dd>

                <dt>Maxwell / Kaluza–Klein witness</dt>
                <dd data-testid="m3-pentadic-maxwell">
                    {view?.maxwell.label ?? '15 = 10 + 4 + 1'}
                    <small> · {view?.maxwell.provenance}</small>
                </dd>

                {trace ? (
                    <>
                        <dt>Mahāmāyā paired fifteens</dt>
                        <dd data-testid="m3-pentadic-fifteens">
                            {trace.pairedMahamayaFifteens[0]} + {trace.pairedMahamayaFifteens[1]} ·{' '}
                            {trace.backboneIdentity} · {trace.lineGraphIdentity}
                        </dd>

                        <dt>Runtime trace</dt>
                        <dd data-testid="m3-pentadic-trace">
                            tick {trace.tick} (t12 {trace.tick12} · {trace.sourceBinaryState}) · quantum{' '}
                            {trace.shemDegreeQuantum}° · 72-idx {trace.resonance72Index} · 64-addr{' '}
                            {trace.mahamayaAddress64} · codon {trace.codon} ({trace.codonId}) · line-op{' '}
                            {trace.lineChangeOperator}
                        </dd>

                        <dt>Hinge</dt>
                        <dd data-testid="m3-pentadic-hinge">
                            whole 0→{trace.wholeNumberEndpoint} · natural 1→{trace.naturalNumberEndpoint} ·
                            complement [{trace.familyBComplement[0]},{trace.familyBComplement[1]}] ·{' '}
                            epogdoon phase {trace.thirdSpanda.epogdoon.blockPhase}/9 ·
                            round-trip loss {trace.thirdSpanda.epogdoon.roundTripLoss}
                        </dd>

                        <dt>Q reference</dt>
                        <dd data-testid="m3-pentadic-qref">{trace.qCosmicRef}</dd>
                    </>
                ) : (
                    <>
                        <dt>Runtime trace</dt>
                        <dd data-testid="m3-pentadic-pending">
                            pending-anuttara-pentadic-trace — the lanes populate when the bus
                            carries the Track 36/10.P5 projection; nothing is recomputed locally.
                        </dd>
                    </>
                )}
            </dl>
        </section>
    );
}
