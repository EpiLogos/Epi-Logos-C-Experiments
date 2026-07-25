/**
 * Coordinate: M' `/` membrane (Evidence packet view — Track 27.T27.5)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the full-packet reading surface for a MediatedRunEvidencePacket
 *   (26.10 schema, imported not redefined). Header (id / title / mediator +
 *   privacy badge / coordinate) + a field grid over the packet's anchors,
 *   session/profile context, semantic candidates, s5 refs, gate landings and
 *   axiom-translation steps. The three opaque gateway projections
 *   (currentProfile / graphContext / sessionRuntime) render as KEY metadata
 *   only — never values — so a protected body can never leak through this face.
 *   Cross-fold affordances (dispatch-trace / tool-stream) surface as counts +
 *   deep-link callbacks; routing is 27.9's lane.
 * Public surface: EvidencePacketView, mediatorLabel.
 * Does NOT own: the schema (evidenceShapes.ts), the packet feed, intent routing.
 */

import type { ActorMediator, MediatedRunEvidencePacket } from './evidenceShapes';
import { PrivacyClassBadge } from './PrivacyClassBadge';
import { DispatchTraceMiniGraph } from './DispatchTraceMiniGraph';
import { DepositionAnchorDisplay } from './evidence/DepositionAnchorDisplay';
import { DecisionRegisterEntries } from './evidence/DecisionRegisterEntries';
import { VerifierRVirtueWitnessVector } from './evidence/VerifierRVirtueWitnessVector';

export function mediatorLabel(mediator: ActorMediator): string {
    if (mediator.kind === 'aletheia') {
        return `Aletheia · ${mediator.subagent}`;
    }
    return mediator.kind === 'pi' ? 'Pi' : 'Anima';
}

function Field({ label, value }: { readonly label: string; readonly value: string | number }) {
    return (
        <>
            <dt>{label}</dt>
            <dd data-testid={`evidence-field-${label}`}>{value}</dd>
        </>
    );
}

/** Opaque gateway projection → its KEYS only (metadata; never values/bodies). */
function OpaqueKeys({ label, record }: { readonly label: string; readonly record: Readonly<Record<string, unknown>> }) {
    const keys = Object.keys(record);
    return (
        <div className="evidence-opaque" data-testid={`evidence-opaque-${label}`}>
            <span className="evidence-opaque-label">{label}</span>
            <span className="evidence-opaque-keys">
                {keys.length === 0 ? '—' : keys.join(', ')}
            </span>
        </div>
    );
}

export function EvidencePacketView({
    packet,
    onOpenDispatchTrace,
    onOpenToolStream,
    onOpenAxiomTranslation,
    onOpenContemplation
}: {
    readonly packet: MediatedRunEvidencePacket;
    readonly onOpenDispatchTrace?: (dispatchNodeId: string) => void;
    readonly onOpenToolStream?: (packetId: string) => void;
    /** 26.14 inspector, offered only when the run actually translated axioms. */
    readonly onOpenAxiomTranslation?: (packetId: string) => void;
    /** 19.7 close-path: the contemplation object this run landed into. */
    readonly onOpenContemplation?: (contemplationObjectRef: string) => void;
}) {
    return (
        <article className="evidence-packet-view" data-testid="evidence-packet-view" data-packet-id={packet.id}>
            <header className="evidence-packet-header">
                <strong className="evidence-packet-title">{packet.title}</strong>
                <span className="evidence-packet-id">{packet.id}</span>
                <span className="evidence-packet-mediator" data-testid="evidence-mediator">
                    {mediatorLabel(packet.mediatedBy)}
                </span>
                <span className="evidence-packet-coordinate">{packet.coordinate}</span>
                <PrivacyClassBadge privacyClass={packet.privacyClass} />
            </header>

            <dl className="evidence-packet-fields">
                <Field label="candidateId" value={packet.candidateId} />
                <Field label="sourceAnchor" value={packet.sourceAnchor} />
                <Field label="graphAnchor" value={packet.graphAnchor} />
                <Field label="testAnchor" value={packet.testAnchor} />
                <Field label="reviewId" value={packet.reviewId} />
                <Field label="sessionKey" value={packet.sessionKey} />
                <Field label="dayNowContext" value={packet.dayNowContext} />
                <Field label="profileGeneration" value={packet.profileGeneration} />
                <Field label="bridgeReadinessHandle" value={packet.bridgeReadinessHandle} />
            </dl>

            <OpaqueKeys label="currentProfile" record={packet.currentProfile} />
            <OpaqueKeys label="graphContext" record={packet.graphContext} />
            <OpaqueKeys label="sessionRuntime" record={packet.sessionRuntime} />

            {packet.semanticCandidates.length > 0 && (
                <div className="evidence-semantic" data-testid="evidence-semantic-candidates">
                    <span className="evidence-list-label">semantic candidates</span>
                    <ul>
                        {packet.semanticCandidates.map((candidate, i) => (
                            <li key={`${candidate}:${i}`}>{candidate}</li>
                        ))}
                    </ul>
                </div>
            )}

            {packet.s5Refs.length > 0 && (
                <div className="evidence-s5refs" data-testid="evidence-s5-refs">
                    <span className="evidence-list-label">s5 refs</span>
                    <ul>
                        {packet.s5Refs.map((ref, i) => (
                            <li key={`${ref}:${i}`}>{ref}</li>
                        ))}
                    </ul>
                </div>
            )}

            {packet.gateLandings.length > 0 && (
                <ul className="evidence-gate-landings" data-testid="evidence-gate-landings">
                    {packet.gateLandings.map(gate => (
                        <li key={gate.gateId} data-gate-state={gate.state}>
                            {gate.gateType}: {gate.state}
                            {gate.transitionedBy ? ` (${gate.transitionedBy})` : ''}
                        </li>
                    ))}
                </ul>
            )}

            {packet.axiomTranslationSteps.length > 0 && (
                <ul className="evidence-axiom-steps" data-testid="evidence-axiom-steps">
                    {packet.axiomTranslationSteps.map(step => (
                        <li key={step.id}>
                            {step.fromForm} → {step.toForm}
                        </li>
                    ))}
                </ul>
            )}

            {/* 27.T27.5 tails — the deposition anchor, decision-register readout,
                and verifier-R virtue-witness vector. Their fields/feeds are
                26.10/26.13/12.x deliverables not yet on the carrier wire, so they
                render the spec's honest ReadinessBanner until those land. */}
            <DepositionAnchorDisplay />
            <DecisionRegisterEntries packetId={packet.id} />
            <VerifierRVirtueWitnessVector />

            <div className="evidence-cross-fold">
                <DispatchTraceMiniGraph root={packet.dispatchTrace} onOpen={onOpenDispatchTrace} />
                <button
                    type="button"
                    className="evidence-open-tools"
                    data-testid="evidence-open-tools"
                    // 26.4 verbatim: the cross-link names its destination fold
                    // and carries the record id, so the Tool Stream tab can
                    // select the SAME record rather than merely opening.
                    data-cross-link="omnipanel.tool-stream"
                    data-evidence-id={packet.id}
                    onClick={() => onOpenToolStream?.(packet.id)}
                >
                    View {packet.toolStream.length} tool events →
                </button>

                {packet.axiomTranslationSteps.length > 0 ? (
                    <button
                        type="button"
                        className="evidence-open-axiom"
                        data-testid="evidence-open-axiom"
                        data-cross-link="m5-epii.axiomTranslation"
                        data-evidence-id={packet.id}
                        onClick={() => onOpenAxiomTranslation?.(packet.id)}
                    >
                        Axiom translation — {packet.axiomTranslationSteps.length} step
                        {packet.axiomTranslationSteps.length === 1 ? '' : 's'} →
                    </button>
                ) : null}

                {packet.contemplationObjectRef ? (
                    <button
                        type="button"
                        className="evidence-open-contemplation"
                        data-testid="evidence-open-contemplation"
                        data-cross-link="m5-epii.contemplationObject"
                        data-contemplation-ref={packet.contemplationObjectRef}
                        onClick={() => onOpenContemplation?.(packet.contemplationObjectRef!)}
                    >
                        Contemplation: open viewer →
                    </button>
                ) : null}
            </div>
        </article>
    );
}
