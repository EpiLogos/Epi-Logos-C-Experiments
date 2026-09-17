/**
 * Coordinate: M' M5' (mediated-run evidence shapes — Tranche 26.T26.10)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the canonical `MediatedRunEvidencePacket` schema — the single
 *   home the Evidence fold, dispatch-trace, and M5' review surfaces import
 *   (spec 26.10; DR-WC-IS-2: same packet, two foldings). `DispatchTraceNode`
 *   is the primitive for BOTH the Trace tab (recursive tree) and the Stream
 *   tab (depth-first flat list) per 15.11 — `flattenDispatchTrace` is that
 *   law. Round-trip serialization is part of the contract (wire-safe).
 *   28.T28.8 narrowed `GateLanding.iod17Parity`'s three faces from `string` to
 *   the spec's own `Iod17GateFaceState` union and made the validator refuse a
 *   half-filled readout — the packet is the wire contract for the deep render,
 *   so an unrepresentable face is better than a rendered lie.
 * Drift note: the frozen integrated-composition `evidence-shapes.ts` carries
 *   a DIFFERENT, simpler verdict-ledger shape — the 26.10 spec block is the
 *   law and is landed here shape-exact; the frozen file is recorded as
 *   divergence, not ported.
 * Does NOT own: the run-model event types (omnipanelRuntime.ts — siblings,
 *   consumed unchanged), the wire producer (track-12 seam), block projection
 *   (reviewBlocks.ts consumes these shapes when the producer lands).
 */

export type AletheiaSubagentId = 'anansi' | 'janus' | 'moirai' | 'mercurius' | 'agora' | 'zeithoven';

export type ActorMediator =
    | { readonly kind: 'pi' }
    | { readonly kind: 'anima' }
    | { readonly kind: 'aletheia'; readonly subagent: AletheiaSubagentId };

export type PsycheFacet = 'anima' | 'eros' | 'logos' | 'mythos' | 'nous' | 'psyche' | 'sophia';

export interface DispatchTraceNode {
    readonly id: string;
    readonly parentId: string | null;
    readonly actor: ActorMediator;
    readonly methodOrSkill: string;
    readonly invokedAt: number;
    readonly tickAtInvoke: number;
    readonly psycheFacet?: PsycheFacet;
    readonly children: readonly DispatchTraceNode[];
}

export interface ToolInvocationRef {
    readonly id: string;
    readonly dispatchNodeId: string;
    readonly toolName: string;
    readonly gatewayMethod?: string;
    readonly inputDigest: string;
    readonly outputDigest: string;
    readonly errorMessage?: string;
}

export type GateType = 'human-required' | 'iod17-parity' | 'autoresearch-dry-run' | 'canon-write';
export type GateState = 'pending' | 'transitioned' | 'blocked';

/**
 * One IOD-17 face's answer to the ONE question the gate asks — "may an AGENT
 * commit this decision?" — narrowed from `string` to the spec's own enumeration
 * (28.9 (a) verbatim) by 28.T28.8. `unset` means the face did not answer; it is
 * never a verdict, and the parity aggregate must not read it as agreement.
 */
export type Iod17GateFaceState = 'human-required' | 'agent-allowed' | 'unset';

export const IOD17_GATE_FACE_STATES: readonly Iod17GateFaceState[] = Object.freeze([
    'human-required',
    'agent-allowed',
    'unset'
]);

export interface GateLandingIod17Parity {
    readonly capabilityMatrixState: Iod17GateFaceState;
    readonly agentContractState: Iod17GateFaceState;
    readonly widgetState: Iod17GateFaceState;
    readonly inParity: boolean;
}

export interface GateLanding {
    readonly gateId: string;
    readonly gateType: GateType;
    readonly state: GateState;
    readonly transitionedBy?: 'human' | 'agent';
    /** Present only on a landing whose three faces were really read (28.T28.8).
     *  A capability-gate outcome carries ONE face and therefore no readout —
     *  publishing two `unset` faces beside it would manufacture a violation. */
    readonly iod17Parity?: GateLandingIod17Parity;
}

export type AxiomForm = 'philosophical-english' | 'formal-notation' | 'owl' | 'shacl';

export interface AxiomTranslationStep {
    readonly id: string;
    readonly fromForm: AxiomForm;
    readonly toForm: AxiomForm;
    readonly inputText: string;
    readonly outputText: string;
    readonly reasoningTrace: string;
    readonly verifiedBy?: 'pi' | 'human';
}

/** Pleroma's `m5_4_governance.mediated_run_evidence_bridge` contract fields. */
export const MEDIATED_RUN_EVIDENCE_PACKET_REQUIRED_FIELDS = Object.freeze([
    'candidateId',
    'coordinate',
    'sourceAnchor',
    'graphAnchor',
    'reviewId',
    'testAnchor',
    'profileGeneration',
    'bridgeReadinessHandle',
    'sessionKey',
    'dayNowContext',
    'currentProfile',
    'graphContext',
    'sessionRuntime',
    'semanticCandidates',
    's5Refs',
    'privacyClass'
] as const);

export interface MediatedRunEvidencePacket {
    readonly id: string;
    readonly title: string;
    readonly mediatedBy: ActorMediator;
    readonly candidateId: string;
    readonly coordinate: string;
    readonly sourceAnchor: string;
    readonly graphAnchor: string;
    readonly reviewId: string;
    readonly testAnchor: string;
    readonly privacyClass: string;
    readonly dispatchTrace: DispatchTraceNode;
    readonly toolStream: readonly ToolInvocationRef[];
    readonly gateLandings: readonly GateLanding[];
    readonly axiomTranslationSteps: readonly AxiomTranslationStep[];
    readonly sessionKey: string;
    readonly dayNowContext: string;
    readonly profileGeneration: number;
    readonly bridgeReadinessHandle: string;
    /** Opaque public-current projection from the S0 profile boundary. */
    readonly currentProfile: Readonly<Record<string, unknown>>;
    /** Opaque S2 provenance projection supplied by the gateway. */
    readonly graphContext: Readonly<Record<string, unknown>>;
    /** Opaque S3 session/runtime projection supplied by the gateway. */
    readonly sessionRuntime: Readonly<Record<string, unknown>>;
    readonly semanticCandidates: readonly string[];
    readonly s5Refs: readonly string[];
    /** 19.6 close-path link. */
    readonly contemplationObjectRef?: string;
}

/** 15.11 law: one trace, two foldings — the Stream tab is the depth-first flat list. */
export function flattenDispatchTrace(node: DispatchTraceNode): readonly DispatchTraceNode[] {
    const flat: DispatchTraceNode[] = [];
    const walk = (current: DispatchTraceNode) => {
        flat.push(current);
        for (const child of current.children) {
            walk(child);
        }
    };
    walk(node);
    return Object.freeze(flat);
}

/** Wire round-trip: serialize/parse must preserve the packet exactly. */
export function serializeEvidencePacket(packet: MediatedRunEvidencePacket): string {
    return JSON.stringify(packet);
}

export function parseEvidencePacket(raw: string): MediatedRunEvidencePacket {
    const parsed = JSON.parse(raw) as MediatedRunEvidencePacket;
    const errors = validateEvidencePacket(parsed);
    if (errors.length > 0) {
        throw new Error(`MediatedRunEvidencePacket invalid: ${errors.join('; ')}`);
    }
    return parsed;
}

const ALETHEIA_SUBAGENTS: readonly string[] = ['anansi', 'janus', 'moirai', 'mercurius', 'agora', 'zeithoven'];

export function validateEvidencePacket(value: unknown): string[] {
    const errors: string[] = [];
    if (typeof value !== 'object' || value === null) {
        return ['packet must be an object'];
    }
    const packet = value as Record<string, unknown>;
    for (const field of [
        'id',
        'title',
        'candidateId',
        'coordinate',
        'sourceAnchor',
        'graphAnchor',
        'reviewId',
        'testAnchor',
        'privacyClass',
        'sessionKey',
        'dayNowContext',
        'bridgeReadinessHandle'
    ]) {
        if (typeof packet[field] !== 'string' || (packet[field] as string).length === 0) {
            errors.push(`${field} is required`);
        }
    }
    if (typeof packet.profileGeneration !== 'number') {
        errors.push('profileGeneration is required');
    }
    for (const field of ['currentProfile', 'graphContext', 'sessionRuntime']) {
        if (typeof packet[field] !== 'object' || packet[field] === null || Array.isArray(packet[field])) {
            errors.push(`${field} is required`);
        }
    }
    for (const field of ['semanticCandidates', 's5Refs']) {
        if (!Array.isArray(packet[field]) || !packet[field].every(value => typeof value === 'string')) {
            errors.push(`${field} must be a string array`);
        }
    }
    const mediator = packet.mediatedBy as Record<string, unknown> | undefined;
    if (!mediator || !['pi', 'anima', 'aletheia'].includes(String(mediator.kind))) {
        errors.push('mediatedBy.kind must be pi | anima | aletheia');
    } else if (mediator.kind === 'aletheia' && !ALETHEIA_SUBAGENTS.includes(String(mediator.subagent))) {
        errors.push('aletheia mediator requires a canonical subagent id');
    }
    if (typeof packet.dispatchTrace !== 'object' || packet.dispatchTrace === null) {
        errors.push('dispatchTrace root node is required');
    }
    for (const field of ['toolStream', 'gateLandings', 'axiomTranslationSteps']) {
        if (!Array.isArray(packet[field])) {
            errors.push(`${field} must be an array`);
        }
    }
    // 28.T28.8 — a gate landing that carries an IOD-17 readout must carry a
    // COMPLETE one. A packet arriving off the wire with a half-filled parity
    // object would render a three-cell matrix from two real faces and one
    // invented blank, which is exactly the fabrication the deep render exists
    // to make impossible.
    if (Array.isArray(packet.gateLandings)) {
        for (const [i, landing] of (packet.gateLandings as unknown[]).entries()) {
            const parity = (landing as Record<string, unknown> | null)?.iod17Parity;
            if (parity === undefined) {
                continue;
            }
            if (typeof parity !== 'object' || parity === null) {
                errors.push(`gateLandings[${i}].iod17Parity must be an object`);
                continue;
            }
            const faces = parity as Record<string, unknown>;
            for (const face of ['capabilityMatrixState', 'agentContractState', 'widgetState']) {
                if (!IOD17_GATE_FACE_STATES.includes(faces[face] as Iod17GateFaceState)) {
                    errors.push(
                        `gateLandings[${i}].iod17Parity.${face} must be one of ${IOD17_GATE_FACE_STATES.join(' | ')}`
                    );
                }
            }
            if (typeof faces.inParity !== 'boolean') {
                errors.push(`gateLandings[${i}].iod17Parity.inParity must be a boolean`);
            }
        }
    }
    return errors;
}
