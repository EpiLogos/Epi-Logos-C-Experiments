/**
 * Coordinate: M' M3' (pentadic relation inspector, 24.T24.18)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): full-wheel relation inspector and mini-view hinge badge.
 * Actualises: verbatim rendering of the kernel-authored 0/1-to-5 trace,
 *   Maxwell/Mahamaya fifteens, backbone, line-change, and active M3 fields.
 * Public surface: M3PentadicRelationInspector.
 * Does NOT own: trace parsing, arithmetic derivation, profile transport, or state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.18.
 */

import type { PentadicInspectorViewModel } from '../panes/m3PentadicInspector';
import { ProvenanceBadge } from '../ui/primitives';

export interface M3PentadicRelationInspectorProps {
    readonly mode: 'badge' | 'full';
    readonly view: PentadicInspectorViewModel;
}

export function M3PentadicRelationInspector({
    mode,
    view
}: M3PentadicRelationInspectorProps) {
    const trace = view.trace;

    if (mode === 'badge') {
        return (
            <div
                className="m3-pentadic-hinge-badge"
                data-testid="m3-pentadic-hinge-badge"
                data-generation={view.generation}
                data-trace-state={view.state}
            >
                {trace ? (
                    <>
                        <span>{trace.sourceBinaryState}→{trace.wholeNumberEndpoint}</span>
                        <span>{trace.resonance72Index}:{trace.mahamayaAddress64}</span>
                    </>
                ) : (
                    <>
                        <ProvenanceBadge
                            state="pending"
                            reason="pending-anuttara-pentadic-trace"
                        />
                        <span>0/1→5 pending</span>
                    </>
                )}
            </div>
        );
    }

    return (
        <div
            className="m3-pentadic-relation-inspector"
            data-testid="m3-pentadic-relation-inspector"
            data-mode="full"
            data-generation={view.generation}
            data-trace-state={view.state}
        >
            <h4>Pentadic hinge — the two fifteens</h4>
            <dl>
                <dt>Coupling-flow alignment</dt>
                <dd
                    data-testid="m3-pentadic-coupling-flow"
                    data-state={view.couplingFlowState}
                >
                    {view.couplingFlow ? (
                        'couplingFlowAlignment carried on the bus'
                    ) : (
                        <>
                            <ProvenanceBadge
                                state="pending"
                                reason="pending-coupling-flow-alignment"
                            />
                            pending-coupling-flow-alignment — lane populates when the profile carries
                            the projection
                        </>
                    )}
                </dd>

                <dt>Maxwell / Kaluza-Klein witness</dt>
                <dd data-testid="m3-pentadic-maxwell">
                    {view.maxwell.label}
                    <small> · {view.maxwell.provenance}</small>
                </dd>

                {trace ? (
                    <>
                        <dt>Mahamaya paired fifteens</dt>
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
                            epogdoon phase {trace.thirdSpanda.epogdoon.blockPhase}/9 · round-trip loss{' '}
                            {trace.thirdSpanda.epogdoon.roundTripLoss}
                        </dd>

                        <dt>Q reference</dt>
                        <dd data-testid="m3-pentadic-qref">{trace.qCosmicRef}</dd>
                    </>
                ) : (
                    <>
                        <dt>Runtime trace</dt>
                        <dd data-testid="m3-pentadic-pending">
                            <ProvenanceBadge
                                state="pending"
                                reason="pending-anuttara-pentadic-trace"
                            />
                            pending-anuttara-pentadic-trace — nothing is recomputed locally
                        </dd>
                    </>
                )}
            </dl>
        </div>
    );
}
