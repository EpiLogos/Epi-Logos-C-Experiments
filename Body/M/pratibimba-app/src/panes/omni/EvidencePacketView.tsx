/**
 * Coordinate: M' `/` membrane + M5' chrome (Evidence packet view — 27.T27.5 / 28.T28.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the reading surface for a MediatedRunEvidencePacket (26.10 schema,
 *   imported not redefined). Header (id / title / mediator + privacy badge /
 *   coordinate) + a field grid over the packet's anchors, session/profile
 *   context, semantic candidates, s5 refs, gate landings and axiom-translation
 *   steps. The three opaque gateway projections (currentProfile / graphContext /
 *   sessionRuntime) render as KEY metadata only — never values — so a protected
 *   body can never leak through this face.
 *
 *   28.T28.8 made this ONE component the two DR-WC-IS-2 foldings rather than two
 *   components over one dataset. `fold="abbreviated"` is the always-on `/`
 *   membrane render (record, anchors, close-paths, collapsed trace);
 *   `fold="deep"` is the GOVERNANCE AUDIT render that lives only in the
 *   `agenticControlRoom` pane of `ide-deep` (§5 DR-WC-IS-1) and adds:
 *     · the IOD-17 three-cell parity readout carried by the packet's own
 *       `iod17-parity` gate landing (28.8 b/c — the field 26.10 declared and
 *       nothing populated until this tranche);
 *     · the dispatch-trace mini-graph OPEN, with tick + psyche-facet per node;
 *     · the axiom-translation seam (28.8 e), disclosed rather than faked — no
 *       row of CROSS_LAYOUT_INTENT_TARGETS resolves to `piAxiomTranslation`.
 *   Same packet, two foldings, one identity: both surfaces read the record the
 *   shared OmniPanel evidence tab state selects, so a selection in either is the
 *   record the other renders.
 * Public surface: EvidenceFold, EvidencePacketView, mediatorLabel, mediatorClass.
 * Does NOT own: the schema (evidenceShapes.ts), the packet feed, intent routing
 *   (27.9), the IOD-17 parity LAW (panes/acr/acrGovernance.ts — DR-WC-IS-1).
 * Contract: [[CHROME-CONTRACT]] §5 ([[DR-WC-IS-1]] / [[DR-WC-IS-2]]) · rerun
 *   tranches [[27.T27.5]] / [[28.T28.8]].
 */

import { IOD17_PARITY_VIOLATION_MESSAGE } from '../acr/acrGovernance';
import type { ActorMediator, GateLandingIod17Parity, MediatedRunEvidencePacket } from './evidenceShapes';
import { PrivacyClassBadge } from './PrivacyClassBadge';
import { DispatchTraceMiniGraph } from './DispatchTraceMiniGraph';
import { DepositionAnchorDisplay } from './evidence/DepositionAnchorDisplay';
import { DecisionRegisterEntries } from './evidence/DecisionRegisterEntries';
import { VerifierRVirtueWitnessVector } from './evidence/VerifierRVirtueWitnessVector';
import { evidencePaneSeam } from './evidence/evidencePaneSeams';

/** DR-WC-IS-2: the abbreviated `/` render vs the `ide-deep` governance audit. */
export type EvidenceFold = 'abbreviated' | 'deep';

export function mediatorLabel(mediator: ActorMediator): string {
    if (mediator.kind === 'aletheia') {
        return `Aletheia · ${mediator.subagent}`;
    }
    return mediator.kind === 'pi' ? 'Pi' : 'Anima';
}

/**
 * 28.8 (b) — the mediator badge's colour class. Pi and Anima carry their own;
 * an Aletheia mediator carries BOTH the family class and its per-subagent one
 * (26.9), so the six guardians are distinguishable without six top-level
 * vocabularies. Colours ride CSS classes, never raw hex (carrier-token lint).
 */
export function mediatorClass(mediator: ActorMediator): string {
    if (mediator.kind === 'aletheia') {
        return `mediator-aletheia mediator-aletheia-${mediator.subagent}`;
    }
    return `mediator-${mediator.kind}`;
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

const IOD17_CELLS = Object.freeze([
    { id: 'capability-matrix', field: 'capabilityMatrixState' },
    { id: 'agent-contract', field: 'agentContractState' },
    { id: 'widget', field: 'widgetState' }
] as const);

/**
 * 28.8 (b/c) — the three-cell IOD-17 readout the packet CARRIES. It is rendered
 * only from a populated `GateLanding.iod17Parity`; the producer emits that
 * landing only once the live capability matrix has answered, so an unloaded
 * matrix shows nothing here rather than a red violation nobody measured. The
 * violation string is imported from the ACR (DR-WC-IS-1 source of truth), never
 * restated.
 */
function Iod17PacketParity({ parity }: { readonly parity: GateLandingIod17Parity }) {
    return (
        <section
            className="evidence-iod17"
            data-testid="evidence-iod17-parity"
            data-in-parity={parity.inParity ? 'true' : 'false'}
        >
            <span className="evidence-list-label">IOD-17 parity</span>
            <ul className="evidence-iod17-cells" role="list">
                {IOD17_CELLS.map(cell => (
                    <li
                        key={cell.id}
                        role="listitem"
                        data-testid={`evidence-iod17-cell-${cell.id}`}
                        data-state={parity[cell.field]}
                    >
                        <span className="evidence-iod17-face">{cell.id}</span>
                        <span className="evidence-iod17-state">{parity[cell.field]}</span>
                    </li>
                ))}
            </ul>
            {parity.inParity ? null : (
                <p className="evidence-iod17-violation" data-testid="evidence-iod17-violation">
                    {IOD17_PARITY_VIOLATION_MESSAGE}
                </p>
            )}
        </section>
    );
}

/** A seam the 28.8 spec named and the substrate does not resolve: disabled, and
 *  saying which name is missing and why (the 28.7 / 28.5 discipline). */
function DisabledSeam({
    testId,
    label,
    seamName
}: {
    readonly testId: string;
    readonly label: string;
    readonly seamName: string;
}) {
    const seam = evidencePaneSeam(seamName);
    return (
        <div className="evidence-unwired-seam" data-testid={testId} data-wire-state="unwired">
            <button type="button" disabled data-testid={`${testId}-button`}>
                {label}
            </button>
            <span className="evidence-unwired-target">{seamName}</span>
            <span className="evidence-unwired-reason">{seam?.reason ?? 'no seam declared'}</span>
        </div>
    );
}

export function EvidencePacketView({
    packet,
    fold = 'abbreviated',
    onOpenDispatchTrace,
    onOpenToolStream,
    onOpenContemplation
}: {
    readonly packet: MediatedRunEvidencePacket;
    /** DR-WC-IS-2. Defaults to the always-on `/` render. */
    readonly fold?: EvidenceFold;
    readonly onOpenDispatchTrace?: (dispatchNodeId: string) => void;
    readonly onOpenToolStream?: (packetId: string) => void;
    /** 19.7 close-path: the contemplation object this run landed into. */
    readonly onOpenContemplation?: (contemplationObjectRef: string) => void;
}) {
    const deep = fold === 'deep';
    const parity = packet.gateLandings.find(gate => gate.iod17Parity)?.iod17Parity;
    return (
        <article
            className={`evidence-packet-view fold-${fold}`}
            data-testid="evidence-packet-view"
            data-packet-id={packet.id}
            data-fold={fold}
        >
            <header className="evidence-packet-header">
                <strong className="evidence-packet-title">{packet.title}</strong>
                <span className="evidence-packet-id">{packet.id}</span>
                <span
                    className={`evidence-packet-mediator ${mediatorClass(packet.mediatedBy)}`}
                    data-testid="evidence-mediator"
                    data-mediator={packet.mediatedBy.kind}
                    data-subagent={
                        packet.mediatedBy.kind === 'aletheia' ? packet.mediatedBy.subagent : ''
                    }
                >
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
                        <li key={gate.gateId} data-gate-state={gate.state} data-gate-type={gate.gateType}>
                            {gate.gateType}: {gate.state}
                            {gate.transitionedBy ? ` (${gate.transitionedBy})` : ''}
                        </li>
                    ))}
                </ul>
            )}

            {/* ── the GOVERNANCE AUDIT half (DR-WC-IS-1 / DR-WC-IS-2) ───────── */}
            {deep && parity ? <Iod17PacketParity parity={parity} /> : null}
            {deep && !parity ? (
                <p className="pane-message" data-testid="evidence-iod17-pending">
                    {"IOD-17 parity unread — the packet carries no three-face landing, which means "
                        + "`s4'.mediation.capabilities.list` had not answered when it was composed. "
                        + 'Nothing is asserted from an unloaded matrix.'}
                </p>
            ) : null}

            {packet.axiomTranslationSteps.length > 0 && (
                <ul className="evidence-axiom-steps" data-testid="evidence-axiom-steps">
                    {packet.axiomTranslationSteps.map(step => (
                        <li key={step.id}>
                            {step.fromForm} → {step.toForm}
                        </li>
                    ))}
                </ul>
            )}

            {/* 28.8 (e). The spec asks this link to emit a CrossLayoutIntent at
                `ide-shell-m0-m5/axiom-translation-inspector`; no row of the live
                target ledger resolves to the mounted inspector, so the deep fold
                DISCLOSES the missing target rather than dispatching an envelope
                that resolves to nothing. It is rendered whether or not the packet
                carries steps, because "no steps ever, and no route either" is the
                fact a governance reader needs. */}
            {deep ? (
                <DisabledSeam
                    testId="evidence-axiom-link"
                    label={
                        packet.axiomTranslationSteps.length > 0
                            ? `View axiom translation (${packet.axiomTranslationSteps.length} steps) →`
                            : 'View axiom translation →'
                    }
                    seamName="ide-shell-m0-m5/axiom-translation-inspector"
                />
            ) : null}

            {/* 27.T27.5 tails — the deposition anchor, decision-register readout,
                and verifier-R virtue-witness vector. Their fields/feeds are
                26.10/26.13/12.x deliverables not yet on the carrier wire, so they
                render the spec's honest ReadinessBanner until those land. */}
            <DepositionAnchorDisplay />
            <DecisionRegisterEntries packetId={packet.id} />
            <VerifierRVirtueWitnessVector />

            <div className="evidence-cross-fold">
                <DispatchTraceMiniGraph
                    root={packet.dispatchTrace}
                    onOpen={onOpenDispatchTrace}
                    defaultExpanded={deep}
                />
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

                {/* DR-WC-IS-2's click-through, in the direction the carrier
                    cannot yet route: crossing INTO `ide-deep` needs a target that
                    promotes `agenticControlRoom`, and the licensed set does not
                    carry it (52.T3 / 28.T28.14). The record identity crosses
                    anyway — this selection IS what the deep pane renders. */}
                {deep ? null : (
                    <DisabledSeam
                        testId="evidence-open-governance-audit"
                        label="Open the governance audit →"
                        seamName={'ide-shell-m0-m5/evidence-panel → agenticControlRoom'}
                    />
                )}
            </div>
        </article>
    );
}
