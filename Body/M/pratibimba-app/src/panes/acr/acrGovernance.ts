/**
 * Coordinate: M' M5' chrome (Agentic Control Room — governance law, 28.T28.5)
 * Residency: Body/M/pratibimba-app/src/panes/acr
 * Position (#n): #4 — Context/Type: the type law of what the deep control room
 *   IS, held apart from what it renders. A pure module (no React, no gateway,
 *   no `import.meta.glob`) so the Playwright spec may import it directly —
 *   `scripts/lint-e2e-import-graph.mjs`.
 * Actualises: DR-WC-IS-1 RESOLVED — the ACR is GOVERNANCE PRIMARY. Three things
 *   live here, and none of them is a component:
 *
 *   (1) THE METHOD REGISTER (`ACR_METHOD_BINDINGS`). Every substrate seam this
 *       surface rides, each `live` against a REAL registered method or `unwired`
 *       with its reason — the `ui/errorUxGrammar.ts` discipline. The 28.5 spec
 *       named two methods that do not exist anywhere in `Body/S`; both are
 *       recorded here as corrections rather than built against:
 *         · `s5'.review.transition` — never registered. The real S5 review
 *           surface is `submit` / `inbox` / `resolve` / `history`
 *           (`Body/S/S5/epii-review-core/src/s5_handlers.rs::S5_REVIEW_METHODS`),
 *           and a DECISION on an existing item is `resolve`. So the decision
 *           control rides `s5'.review.resolve`, reached from `s5'.review.inbox`.
 *         · `s5'.epii.runtime_control` — never registered either
 *           (`Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs` owns the
 *           `s5'.epii.*` family and has no such arm). The abort/retry/continue
 *           controls therefore have NO wire, and this tranche renders them as an
 *           honest pending-wire surface that names the missing method instead of
 *           a button that cannot act.
 *
 *   (2) THE IOD-17 THREE-CELL PARITY READOUT (`computeIod17Parity`). One
 *       question — "may an AGENT commit this review decision?" — asked of three
 *       INDEPENDENT declarations, exactly as 26.5 / 28.9 specify:
 *         · `capability-matrix` — the live `s4'.mediation.capabilities.list`
 *           projection. It answers `agent-permitted` only if it exposes a
 *           review-commit capability at `standard` entitlement. It does not
 *           today, and that is the point: the matrix is the source of truth and
 *           this cell is where drift would first show.
 *         · `agent-contract` — `panes/m5ReviewGate.ts::enforceHumanGate`, the
 *           carrier's realisation of `capability-matrix.json`
 *           `m5_4_governance.review_surface_roles`, where pi / anima / aletheia
 *           / sophia all carry `resolve_epii_review_gate` and
 *           `approve_human_required_review` as FORBIDDEN actions.
 *         · `widget` — this surface's own standing declaration: the ACR is a
 *           human governance surface and never enables an agent committal.
 *       `inParity` is agreement of all three. A disagreement is not cosmetic —
 *       it means the substrate would refuse the transition — hence the spec's
 *       verbatim banner (`IOD17_PARITY_VIOLATION_MESSAGE`).
 *
 *   (3) THE DR-M5-1 ROSTER PROJECTION (`acrRoster`). Pi + Anima + the six
 *       Aletheia techne guardians are the executable dispatch targets;
 *       nous / logos / eros / mythos / psyche / sophia are Anima's authorial
 *       Psyche aspect registers and are marked explicitly NON-executable. The
 *       two lists already exist in `panes/omni/omnipanelCapabilities.ts`
 *       (27.T27.10 landed them); this projects them for the governance render
 *       rather than restating them, so Sophia can never re-acquire an actor row.
 * Public surface: ACR_SURFACE_ID, ACR_WIDGET_ID, ACR_PANE_TITLE, ACR_TAB_LABEL,
 *   PI_RUNTIME_MONITOR_BANNER, AcrMethodBinding, ACR_METHOD_BINDINGS,
 *   acrMethodBinding, ACR_UNWIRED_METHODS, Iod17Face, Iod17FaceState,
 *   Iod17ParityCell, Iod17ParityReadout, IOD17_PARITY_FACES,
 *   IOD17_PARITY_VIOLATION_MESSAGE, AGENT_REVIEW_COMMIT_CAPABILITIES,
 *   computeIod17Parity, AcrDispatchRow, AcrAspectRow, AcrRoster, acrRoster.
 * Does NOT own: the capability snapshot or the roster constants
 *   (`panes/omni/omnipanelCapabilities.ts`), the human-gate law
 *   (`panes/m5ReviewGate.ts`), the genealogy fold
 *   (`panes/omni/dispatchGenealogy*.ts`), the evidence packet schema
 *   (`panes/omni/evidenceShapes.ts`), the deposit form
 *   (`panes/omni/evidence/EvidenceDepositForm.tsx`), or the deep pane-set
 *   position (`ui/deepPaneSet.ts`).
 * Contract: [[CHROME-CONTRACT]] §2 (`agenticControlRoom`) + §5 (DR-WC-IS-1) ·
 *   [[DR-M5-1]] · [[DR-ACR-1]] · rerun tranche [[28.T28.5]].
 */

import type { PsycheFacet } from '../omni/evidenceShapes';
import type { ActorRole } from '../omni/omnipanelRuntime';
import {
    ALETHEIA_TECHNE_GUARDIANS,
    ANIMA_DISPATCH_TARGETS,
    PSYCHE_ASPECT_REGISTERS,
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    type AletheiaTechneGuardian,
    type MediationCapabilitySnapshot
} from '../omni/omnipanelCapabilities';
import { enforceHumanGate, type ReviewDecision } from '../m5ReviewGate';

/** The [[CHROME-CONTRACT]] §2 surface id = the flexlayout component key. */
export const ACR_SURFACE_ID = 'agenticControlRoom';

/** Preserved verbatim from the frozen ide-shell widget id, per 28.5 (c). */
export const ACR_WIDGET_ID = 'pratibimba.ide-shell.agentic-control-room';

/** 28.5 (c) — the reframe: "Agentic Control Room" → "Pi Runtime Monitor (ACR)". */
export const ACR_PANE_TITLE = 'Pi Runtime Monitor (ACR)';

/**
 * The deep tab-strip label. The reframed TITLE is what the pane renders; the
 * strip carries an abbreviation of it because `personal-deep-main` already
 * holds eight tabs and a tab strip that overflows stops answering clicks
 * (measured on `personal-main` at 1280x800). It still carries both halves of
 * the reframe — the Pi monitor and the ACR lineage — so the rename is visible
 * in the strip, not only inside the pane.
 */
export const ACR_TAB_LABEL = 'Pi Monitor (ACR)';

/** 28.5 (c), verbatim. */
export const PI_RUNTIME_MONITOR_BANNER =
    'Pi runtime monitoring — dispatch traces, tool streams, capacity-workflow runs. '
    + 'Single agent harness; Anima dispatches; Aletheia subagents surface in crystallisation-mode.';

// ---------------------------------------------------------------------------
// (1) The method register
// ---------------------------------------------------------------------------

export interface AcrMethodBinding {
    readonly id: string;
    /** The method the carrier really calls; for an `unwired` seam, the method
     *  the spec asked for and the substrate does not register. */
    readonly method: string;
    readonly purpose: string;
    readonly status: 'live' | 'unwired';
    /** LAW: set exactly when `status === 'unwired'`. */
    readonly unwiredReason: string | null;
    /** The name the 28.5 spec used, when this tranche corrected it. */
    readonly specNamed: string | null;
    /** LAW: set exactly when `specNamed !== null`. */
    readonly correction: string | null;
}

export const ACR_METHOD_BINDINGS: readonly AcrMethodBinding[] = Object.freeze([
    Object.freeze({
        id: 'capability-matrix',
        method: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
        purpose:
            'IOD-17 capability-matrix source-of-truth (DR-WC-IS-1): the live S4 projection the '
            + 'parity readout reads its first cell from.',
        status: 'live' as const,
        unwiredReason: null,
        specNamed: null,
        correction: null
    }),
    Object.freeze({
        id: 'run-tree',
        method: 'sessions.list',
        purpose:
            'RunTree for governance audit: the Pi → Anima → subagent genealogy, folded from real '
            + 'session lineage (`dispatchGenealogyFromSessions`, 27.T27.3).',
        status: 'live' as const,
        unwiredReason: null,
        specNamed: null,
        correction: null
    }),
    Object.freeze({
        id: 'evidence-deposit',
        method: "s5'.epii.deposit",
        purpose:
            'The full MediatedRunEvidencePacket deposition write (26.10), through the already-live '
            + '`EvidenceDepositForm` rather than a second form over the same method.',
        status: 'live' as const,
        unwiredReason: null,
        specNamed: null,
        correction: null
    }),
    Object.freeze({
        id: 'review-inbox',
        method: "s5'.review.inbox",
        purpose: 'The open governance queue the decision controls act on.',
        status: 'live' as const,
        unwiredReason: null,
        specNamed: null,
        correction: null
    }),
    Object.freeze({
        id: 'review-decision',
        method: "s5'.review.resolve",
        purpose:
            'The review DECISION — approve / reject / revise / defer on an inbox item, under the '
            + 'human gate and the IOD-17 parity readout.',
        status: 'live' as const,
        unwiredReason: null,
        specNamed: "s5'.review.transition",
        correction:
            "`s5'.review.transition` is registered nowhere in Body/S. The S5 review surface is "
            + "`submit` / `inbox` / `resolve` / `history` "
            + '(Body/S/S5/epii-review-core/src/s5_handlers.rs::S5_REVIEW_METHODS); `submit` OPENS an '
            + 'item and `resolve` is the transition on an open one. The only live occurrences of the '
            + 'spec name are in the FROZEN epi-theia tree, which is dead plumbing.'
    }),
    Object.freeze({
        id: 'runtime-control',
        method: "s5'.epii.runtime_control",
        purpose:
            'Would back abort / retry / continue on a running dispatch (28.5 (a), third bullet).',
        status: 'unwired' as const,
        unwiredReason:
            "No such method exists. `s5'.epii.*` is owned by "
            + 'Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs, whose arms are `deposit`, '
            + '`deposit.list`, `deposit.typed_candidate`, `axiom_translate`, '
            + '`axiom_translation_history`, `status`, `runtime.context`, `user.orientation`, '
            + '`pratibimba.status`, `workbench.*` and `kairos.context` — there is no runtime-control '
            + 'arm, and no other coordinate registers one. A run cannot be aborted, retried, or '
            + 'continued from any surface in this carrier, so these controls render disabled and say '
            + 'why. Owner: whoever lands a run-lifecycle method on S5’; until then this seam is '
            + 'declared and not actuated.',
        specNamed: null,
        correction: null
    })
]);

export function acrMethodBinding(id: string): AcrMethodBinding {
    const binding = ACR_METHOD_BINDINGS.find(entry => entry.id === id);
    if (!binding) {
        throw new Error(`unknown ACR method binding: ${id}`);
    }
    return binding;
}

/** The seams the spec asked for that the substrate does not register. */
export const ACR_UNWIRED_METHODS: readonly AcrMethodBinding[] = Object.freeze(
    ACR_METHOD_BINDINGS.filter(binding => binding.status === 'unwired')
);

// ---------------------------------------------------------------------------
// (2) IOD-17 three-cell parity
// ---------------------------------------------------------------------------

export const IOD17_PARITY_FACES = Object.freeze([
    'capability-matrix',
    'agent-contract',
    'widget'
] as const);

export type Iod17Face = (typeof IOD17_PARITY_FACES)[number];

/** The one question each face answers: may an AGENT commit this decision? */
export type Iod17FaceState = 'agent-permitted' | 'human-required' | 'unknown';

/** 28.9 (b), verbatim. */
export const IOD17_PARITY_VIOLATION_MESSAGE =
    'IOD-17 parity violated — gateway will reject any transition';

/**
 * The action names `capability-matrix.json` `m5_4_governance.review_surface_roles`
 * lists as FORBIDDEN for pi / anima / aletheia / sophia. If the live S4
 * projection ever exposes one of these at `standard` entitlement, an agent has
 * acquired a review-commit path and the first parity cell flips — which is the
 * drift IOD-17 exists to catch.
 */
export const AGENT_REVIEW_COMMIT_CAPABILITIES: readonly string[] = Object.freeze([
    'resolve_epii_review_gate',
    'approve_human_required_review'
]);

export interface Iod17ParityCell {
    readonly face: Iod17Face;
    readonly state: Iod17FaceState;
    /** The real source this face was read from — never a restatement. */
    readonly source: string;
}

export interface Iod17ParityReadout {
    readonly cells: readonly Iod17ParityCell[];
    readonly inParity: boolean;
    /** Present exactly when `inParity === false`. */
    readonly violation: string | null;
    /** The faces that disagree with the majority reading, for the cell marks. */
    readonly disagreements: readonly Iod17Face[];
}

export interface Iod17ParityInput {
    /** The review item's own `requires_human`, as `s5'.review.inbox` reports it. */
    readonly humanRequired: boolean;
    /** The decision under consideration (`defer`/`summarize` are non-committal). */
    readonly decision: ReviewDecision;
    /** The live S4 projection, or null while it has not loaded. */
    readonly snapshot: MediationCapabilitySnapshot | null;
}

function capabilityMatrixFace(snapshot: MediationCapabilitySnapshot | null): Iod17ParityCell {
    if (snapshot === null) {
        return Object.freeze({
            face: 'capability-matrix' as const,
            state: 'unknown' as const,
            source: `${S4_MEDIATION_CAPABILITIES_LIST_METHOD} has not answered yet`
        });
    }
    const exposed = snapshot.capabilities.find(
        capability =>
            AGENT_REVIEW_COMMIT_CAPABILITIES.includes(capability.name)
            && capability.entitlementClass === 'standard'
    );
    return Object.freeze({
        face: 'capability-matrix' as const,
        state: exposed ? ('agent-permitted' as const) : ('human-required' as const),
        source: exposed
            ? `${S4_MEDIATION_CAPABILITIES_LIST_METHOD} exposes \`${exposed.name}\` at standard entitlement`
            : `${S4_MEDIATION_CAPABILITIES_LIST_METHOD} exposes no review-commit capability`
    });
}

function agentContractFace(input: Iod17ParityInput): Iod17ParityCell {
    // The contract face asks the gate about an AGENT actor, never the human at
    // the keyboard — otherwise the cell would read the operator, not the law.
    const gate = enforceHumanGate({
        decision: input.decision,
        humanRequired: input.humanRequired,
        actorIsHuman: false
    });
    return Object.freeze({
        face: 'agent-contract' as const,
        state: gate.ok ? ('agent-permitted' as const) : ('human-required' as const),
        source: gate.ok
            ? 'm5ReviewGate.enforceHumanGate admits an agent committal'
            : 'm5ReviewGate.enforceHumanGate refuses an agent committal'
    });
}

/** This surface's standing declaration. The ACR is governance primary: it is
 *  the human's audit perimeter and never enables an agent committal. */
const WIDGET_FACE: Iod17ParityCell = Object.freeze({
    face: 'widget' as const,
    state: 'human-required' as const,
    source: 'the ACR is GOVERNANCE PRIMARY (DR-WC-IS-1) and never enables an agent committal'
});

export function computeIod17Parity(input: Iod17ParityInput): Iod17ParityReadout {
    const cells = Object.freeze([
        capabilityMatrixFace(input.snapshot),
        agentContractFace(input),
        WIDGET_FACE
    ]);
    const states = new Set(cells.map(cell => cell.state));
    const inParity = states.size === 1 && !states.has('unknown');
    const disagreements = inParity
        ? []
        : cells.filter(cell => cell.state !== WIDGET_FACE.state).map(cell => cell.face);
    return Object.freeze({
        cells,
        inParity,
        violation: inParity ? null : IOD17_PARITY_VIOLATION_MESSAGE,
        disagreements: Object.freeze(disagreements)
    });
}

// ---------------------------------------------------------------------------
// (3) The DR-M5-1 roster projection
// ---------------------------------------------------------------------------

export interface AcrDispatchRow {
    readonly actor: string;
    readonly role: ActorRole;
    readonly techneClass: AletheiaTechneGuardian | null;
    /** DR-M5-1: these, and only these, are dispatch targets. */
    readonly executable: true;
    readonly mode: 'harness' | 'dispatcher' | 'crystallisation';
}

export interface AcrAspectRow {
    readonly register: string;
    readonly facet: PsycheFacet;
    /** DR-M5-1: an authorial register is NOT a peer agent. */
    readonly executable: false;
    readonly why: string;
}

export interface AcrRoster {
    readonly dispatchTargets: readonly AcrDispatchRow[];
    readonly aspectRegisters: readonly AcrAspectRow[];
}

/**
 * 28.5 (b) — the roster collapse, projected for the governance render. Both
 * lists come from `omnipanelCapabilities.ts`; nothing is re-enumerated here, so
 * a guardian added there appears here and an aspect register can never migrate
 * into the executable column by being retyped in a second place.
 */
export function acrRoster(): AcrRoster {
    return Object.freeze({
        dispatchTargets: Object.freeze(
            ANIMA_DISPATCH_TARGETS.map(target =>
                Object.freeze({
                    actor: target.techneClass ?? target.actor,
                    role: target.role,
                    techneClass: target.techneClass,
                    executable: true as const,
                    mode:
                        target.techneClass !== null
                            ? ('crystallisation' as const)
                            : target.role === 'anima'
                              ? ('dispatcher' as const)
                              : ('harness' as const)
                })
            )
        ),
        aspectRegisters: Object.freeze(
            PSYCHE_ASPECT_REGISTERS.map(register =>
                Object.freeze({
                    register,
                    facet: register as PsycheFacet,
                    executable: false as const,
                    why:
                        register === 'sophia'
                            ? 'Sophia surfaces only as a facet, never an actor row (DR-M5-1 / 26.8).'
                            : "Anima's authorial register — composed by Anima, not dispatched to."
                })
            )
        )
    });
}

/** The six Aletheia techne guardians, re-exported so a consumer of this module
 *  never needs a second import to name them. */
export { ALETHEIA_TECHNE_GUARDIANS };
