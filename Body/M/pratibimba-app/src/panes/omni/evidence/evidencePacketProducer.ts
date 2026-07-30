/**
 * Coordinate: M' M5' (MediatedRunEvidencePacket producer — rerun 26.T26.4)
 * Residency: Body/M/pratibimba-app/src/panes/omni/evidence
 * Position (#n): #5 — Integration; where a run's genealogy and the claim filed
 *   over it become one record that can be reviewed.
 * Actualises: the PRODUCER the Evidence fold has never had. 26.10 landed the
 *   packet SHAPE and 12.6 closed its field parity, but nothing ever built one,
 *   so the fold rendered its honest-empty state and its close-paths could not be
 *   exercised without fabricating a packet.
 *
 *   A packet has two halves, and neither half can invent the other:
 *     - the RUN half — who dispatched what, under which capability gate — comes
 *       from the same live session genealogy the Dispatch and Tool Stream folds
 *       already fold (`dispatchGenealogyFromSessions`), never from a second
 *       source that could disagree with them;
 *     - the CLAIM half — which candidate this is evidence FOR, which review
 *       adjudicates it, which test pins it — comes from the deposit's
 *       `evidenceAnchors`, because a dispatch cannot know what it is evidence of.
 *   A deposit without anchors produces NO packet. That is the honest answer: it
 *   is a filed deposit, not evidence for a run, and a packet with blank anchors
 *   would assert a claim nobody made.
 *
 *   WHAT IS DELIBERATELY EMPTY, and why it is not a defect:
 *     - `toolStream` — there is no per-invocation tool feed on any wire.
 *       `dispatchGenealogyFromSessions` says so in its own header ("evidence/
 *       source refs stay null until a real per-invocation feed lands"), and a
 *       digest invented here would be indistinguishable from a real one.
 *     - `axiomTranslationSteps` — no producer; DR-B-2 translation is not emitted.
 *     - `semanticCandidates` — no S2 candidate feed for a run.
 *   Empty is a claim ("nothing was recorded"); fabricated content is a lie. The
 *   validator accepts empty arrays, so these stay empty and visibly so.
 *
 *   28.T28.8 CLOSED ONE OF THOSE EMPTIES. `GateLanding.iod17Parity` was declared
 *   by 26.10 and never populated by anything: the producer built
 *   `gateType: 'iod17-parity'` landings out of a SINGLE-face
 *   `CapabilityGateOutcome` and never set the three-way object, so the deep
 *   render had nothing to read. It is now filled from the ACR's live
 *   `computeIod17Parity` — the capability matrix off the wire, `enforceHumanGate`
 *   asked about an AGENT actor, and the governance surface's own declaration —
 *   and ONLY when that matrix has actually answered. Per-dispatch capability
 *   landings still carry no readout: one observed face plus two blanks would
 *   render as a parity violation that nobody measured.
 * Public surface: EvidencePacketContext, evidencePacketsFromDeposits,
 *   iod17GateParityFrom.
 * Does NOT own: the packet schema (evidenceShapes.ts, 26.10), the genealogy
 *   dataset or its folds (dispatchGenealogy.ts), the wire→record producer
 *   (dispatchGenealogyFromSessions.ts), the deposit contract (S5'), the fold, or
 *   the IOD-17 parity LAW — DR-WC-IS-1 makes `panes/acr/acrGovernance.ts` its
 *   source of truth and this module only projects its readout onto the schema.
 * Contract: [[M5'-SPEC]] + rerun tranches [[26.T26.4]] / [[28.T28.8]].
 */

import type { DispatchGenealogyRecord } from '../dispatchGenealogy';
import type {
    ActorMediator,
    AletheiaSubagentId,
    DispatchTraceNode,
    GateLanding,
    GateLandingIod17Parity,
    Iod17GateFaceState,
    MediatedRunEvidencePacket
} from '../evidenceShapes';
import type { MediationCapabilitySnapshot } from '../omnipanelCapabilities';
import {
    computeIod17Parity,
    type Iod17Face,
    type Iod17FaceState,
    type Iod17ParityReadout
} from '../../acr/acrGovernance';
import type { EvidenceDeposit } from './evidenceDeposits';

/** The live shell context a run rides. Every field is read, never defaulted:
 *  a packet that invented its own session or profile generation would anchor
 *  evidence to a moment that never happened. */
export interface EvidencePacketContext {
    readonly sessionKey: string;
    readonly dayNowContext: string;
    readonly profileGeneration: number;
    readonly bridgeReadinessHandle: string;
    readonly currentProfile: Readonly<Record<string, unknown>>;
    readonly sessionRuntime: Readonly<Record<string, unknown>>;
    /** Present only when the session actually closed (19.6/19.7). */
    readonly contemplationObjectRef?: string;
    /**
     * 28.T28.8 — the live `s4'.mediation.capabilities.list` projection, which is
     * the FIRST of the IOD-17 gate's three faces. `null`/absent while it has not
     * answered, and then NO parity landing is emitted: a readout built from an
     * unloaded matrix reads `unknown` on one face and would render a red parity
     * VIOLATION that is really a spinner.
     */
    readonly capabilitySnapshot?: MediationCapabilitySnapshot | null;
}

/**
 * The ACR's three-face readout as the packet's wire-safe parity object
 * (28.T28.8). DR-WC-IS-1 makes the ACR the IOD-17 source of truth, so the law
 * is CONSUMED here, never restated; this function is only the projection from
 * the readout's cells onto the 26.10 schema's flat field names.
 */
const GATE_FACE_STATE: Readonly<Record<Iod17FaceState, Iod17GateFaceState>> = Object.freeze({
    'agent-permitted': 'agent-allowed',
    'human-required': 'human-required',
    unknown: 'unset'
});

export function iod17GateParityFrom(readout: Iod17ParityReadout): GateLandingIod17Parity {
    const face = (id: Iod17Face): Iod17GateFaceState => {
        const cell = readout.cells.find(entry => entry.face === id);
        return cell ? GATE_FACE_STATE[cell.state] : 'unset';
    };
    return Object.freeze({
        capabilityMatrixState: face('capability-matrix'),
        agentContractState: face('agent-contract'),
        widgetState: face('widget'),
        inParity: readout.inParity
    });
}

const ALETHEIA_SUBAGENTS: readonly string[] = [
    'anansi',
    'janus',
    'moirai',
    'mercurius',
    'agora',
    'zeithoven'
];

/**
 * The record's actor as a packet mediator. The packet's `ActorMediator` is
 * narrower than the genealogy's `ActorIdentity` — only pi / anima / aletheia
 * exist as mediators, and an aletheia mediator MUST name a canonical subagent
 * (the validator refuses one that does not). A `user` or `gateway` actor is not
 * a mediator at all, so it resolves to the dispatcher that carried it.
 */
function mediatorFor(record: DispatchGenealogyRecord): ActorMediator {
    if (record.aletheiaSubagent && ALETHEIA_SUBAGENTS.includes(record.aletheiaSubagent)) {
        return { kind: 'aletheia', subagent: record.aletheiaSubagent as AletheiaSubagentId };
    }
    if (record.actor.role === 'subagent') {
        const actor = record.actor.actor.toLowerCase();
        // A subagent whose id is a canonical Aletheia guardian is one, even when
        // the record did not carry the typed field.
        if (ALETHEIA_SUBAGENTS.includes(actor)) {
            return { kind: 'aletheia', subagent: actor as AletheiaSubagentId };
        }
        return { kind: 'anima' };
    }
    return record.actor.role === 'pi' ? { kind: 'pi' } : { kind: 'anima' };
}

/** The genealogy as the packet's dispatch trace: same ids, same nesting, so a
 *  node selected in the Evidence packet highlights the SAME node in the
 *  Dispatch fold (15.2 cross-link law). */
function traceNodeFrom(
    record: DispatchGenealogyRecord,
    childrenOf: ReadonlyMap<string, readonly DispatchGenealogyRecord[]>
): DispatchTraceNode {
    return {
        id: record.id,
        parentId: record.parentId,
        actor: mediatorFor(record),
        methodOrSkill: record.route.method,
        invokedAt: record.startedAtMs,
        tickAtInvoke: record.tickAtInvoke ?? 0,
        ...(record.psycheFacet ? { psycheFacet: record.psycheFacet } : {}),
        children: (childrenOf.get(record.id) ?? []).map(child => traceNodeFrom(child, childrenOf))
    };
}

function childIndex(
    records: readonly DispatchGenealogyRecord[]
): ReadonlyMap<string, readonly DispatchGenealogyRecord[]> {
    const index = new Map<string, DispatchGenealogyRecord[]>();
    for (const record of records) {
        if (record.parentId === null) {
            continue;
        }
        const siblings = index.get(record.parentId) ?? [];
        siblings.push(record);
        index.set(record.parentId, siblings);
    }
    return index;
}

/**
 * The gates this run actually landed. Three real sources, no invention:
 *   - each dispatch carries a capability-gate OUTCOME (12.10 parity matrix),
 *     which is an `iod17-parity` landing that either transitioned or blocked.
 *     It carries ONE face, so it carries NO `iod17Parity` readout — publishing
 *     two `unset` faces beside it would manufacture a violation;
 *   - the deposit itself is a `human-required` landing — pending while the
 *     review item is open, transitioned once a human resolved it;
 *   - 28.T28.8: when the live capability projection has answered, the deposit
 *     ALSO lands at the three-face IOD-17 gate. That is the one landing whose
 *     three faces were genuinely read — the live matrix, `enforceHumanGate`
 *     asked about an AGENT actor, and the governance surface's own standing
 *     declaration — so it is the one that carries the readout.
 */
function gateLandingsFor(
    deposit: EvidenceDeposit,
    records: readonly DispatchGenealogyRecord[],
    context: EvidencePacketContext
): readonly GateLanding[] {
    const landings: GateLanding[] = records
        .filter(record => record.gate.capability !== null)
        .map(record => ({
            gateId: `${record.id}:capability`,
            gateType: 'iod17-parity' as const,
            state: record.gate.allowed ? ('transitioned' as const) : ('blocked' as const),
            transitionedBy: 'agent' as const
        }));
    if (deposit.requiresHuman) {
        landings.push({
            gateId: `${deposit.itemId}:human`,
            gateType: 'human-required',
            state: deposit.status === 'open' ? 'pending' : 'transitioned',
            ...(deposit.status === 'open' ? {} : { transitionedBy: 'human' as const })
        });
    }
    const snapshot = context.capabilitySnapshot ?? null;
    if (snapshot !== null) {
        // `approve` is the committal decision — the strictest form of the one
        // question IOD-17 asks. `defer`/`summarize` commit nothing, so asking
        // the gate about them would answer an easier question than the one the
        // reader needs.
        const parity = iod17GateParityFrom(
            computeIod17Parity({
                humanRequired: deposit.requiresHuman,
                decision: 'approve',
                snapshot
            })
        );
        landings.push({
            gateId: `${deposit.itemId}:iod17`,
            gateType: 'iod17-parity',
            // Out of parity the substrate would REFUSE any transition, so the
            // landing is blocked whatever the review item's own status says.
            state: !parity.inParity
                ? 'blocked'
                : deposit.status === 'open'
                  ? 'pending'
                  : 'transitioned',
            ...(parity.inParity && deposit.status !== 'open'
                ? { transitionedBy: 'human' as const }
                : {}),
            iod17Parity: parity
        });
    }
    return landings;
}

/**
 * Compose packets from the deposits that carry anchors and the genealogy of the
 * runs they are evidence for.
 *
 * Genealogy is matched to a deposit by SESSION. A deposit filed against a
 * session with no recorded dispatches still yields a packet — the claim was
 * made and is reviewable — but its trace is the deposit's own root node rather
 * than a borrowed one, because attaching another session's genealogy would
 * misattribute the run.
 */
export function evidencePacketsFromDeposits(
    deposits: readonly EvidenceDeposit[],
    genealogy: readonly DispatchGenealogyRecord[],
    context: EvidencePacketContext
): readonly MediatedRunEvidencePacket[] {
    const packets: MediatedRunEvidencePacket[] = [];
    for (const deposit of deposits) {
        const anchors = deposit.evidenceAnchors;
        if (!anchors) {
            continue; // a filed deposit, not evidence for a run
        }
        const sessionKey = deposit.sessionKey ?? context.sessionKey;
        const records = genealogy.filter(record => record.id.startsWith(sessionKey));
        const childrenOf = childIndex(records);
        const roots = records.filter(record => record.parentId === null);
        const dispatchTrace: DispatchTraceNode =
            roots.length > 0
                ? traceNodeFrom(roots[0], childrenOf)
                : {
                      // No recorded dispatch for this session. The deposit is
                      // still the root of its own evidence; saying "filed
                      // without a recorded dispatch" is honest, borrowing
                      // another run's tree would not be.
                      id: deposit.itemId,
                      parentId: null,
                      actor: { kind: 'anima' },
                      methodOrSkill: "s5'.epii.deposit",
                      invokedAt: deposit.createdAtMs ?? 0,
                      tickAtInvoke: 0,
                      children: []
                  };
        packets.push({
            id: deposit.itemId,
            title: deposit.title,
            mediatedBy: roots.length > 0 ? mediatorFor(roots[0]) : { kind: 'anima' },
            candidateId: anchors.candidateId,
            coordinate: deposit.sourceCoordinate ?? anchors.graphAnchor,
            sourceAnchor: deposit.artifactPath ?? anchors.graphAnchor,
            graphAnchor: anchors.graphAnchor,
            reviewId: anchors.reviewId,
            testAnchor: anchors.testAnchor,
            privacyClass: anchors.privacyClass,
            dispatchTrace,
            toolStream: [],
            gateLandings: gateLandingsFor(deposit, records, context),
            axiomTranslationSteps: [],
            sessionKey,
            dayNowContext: context.dayNowContext,
            profileGeneration: context.profileGeneration,
            bridgeReadinessHandle: context.bridgeReadinessHandle,
            currentProfile: context.currentProfile,
            // Real S2 addressing for this evidence, not a synthesised provenance
            // blob: the coordinate and graph anchor the deposit itself carries.
            graphContext: { coordinate: deposit.sourceCoordinate, graphAnchor: anchors.graphAnchor },
            sessionRuntime: context.sessionRuntime,
            semanticCandidates: [],
            // The review item IS an S5 reference — the one this packet resolves against.
            s5Refs: [deposit.itemId],
            ...(context.contemplationObjectRef
                ? { contemplationObjectRef: context.contemplationObjectRef }
                : {})
        });
    }
    return packets;
}
