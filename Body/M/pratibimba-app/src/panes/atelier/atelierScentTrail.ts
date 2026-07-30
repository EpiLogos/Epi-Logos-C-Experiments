/**
 * Coordinate: M' M5-5' (Logos Atelier scent-trail surface law — 28.T28.7)
 * Residency: Body/M/pratibimba-app/src/panes/atelier/atelierScentTrail.ts
 * Position (#n): #4 — Context/Type: the type law of what the Atelier surface
 *   may show, admit, and route.
 * Actualises: tranche 28.7 deliverables (c), (d) and (e) as MODEL, so the
 *   render tree carries no law of its own.
 *
 *   (c) NAMESPACE INTEGRITY. UX §5.3: every Atelier provenance handle lives in
 *   the `etymology://` scheme. `admitProvenanceHandle` is the gate — a handle
 *   in any other scheme is REFUSED with its scheme named, never silently
 *   dropped and never rendered as though it belonged to the trail.
 *
 *   (d) MÖBIUS WRITE-BACK GOVERNANCE. 21-m0 SC-2 + DR-M0-1: the Atelier
 *   crystallises a CANDIDATE and routes it; it never mutates canon. The write-
 *   back therefore has exactly two moves — stage a Hen candidate through
 *   `s1'.entity.capture` (the command owns that call) and emit a
 *   `CrossLayoutIntent` to Canon Studio carrying the candidate as `artifactUri`.
 *   `ATELIER_MUTATES_GRAPH_CANON` is pinned `false as const` so the invariant
 *   is a type, not a comment.
 *
 *   (e) ALETHEIA LINEAGE + VETO. 26.9 + 12.19: the six subagents appear as
 *   evidence lineage on the trail, and a veto renders as a red banner that is
 *   NON-BLOCKING on the human gate — `ATELIER_VETO_BLOCKS_HUMAN_GATE` is pinned
 *   `false as const` for the same reason.
 * Public surface: AtelierStageBinding, ATELIER_STAGE_BINDINGS,
 *   atelierStageBinding, ProvenanceHandleVerdict, admitProvenanceHandle,
 *   admitProvenanceHandles, AtelierSubagentVeto,
 *   ATELIER_VETO_BLOCKS_HUMAN_GATE, ATELIER_LINEAGE_SUBAGENTS; plus the
 *   re-exported write-back envelope law (ATELIER_MUTATES_GRAPH_CANON,
 *   MOBIUS_WRITE_BACK_TARGET, mobiusWriteBackIntent).
 * Does NOT own: the stage sequence or the command bodies (`commands/atelier.ts`),
 *   the substrate gaps (`atelierSeams.ts`), the intent transport
 *   (`commands/crossLayoutIntent.ts`), or the render (`AtelierScentTrailPanel`).
 * Contract: [[CHROME-CONTRACT]] §2 + §4 + §5 · rerun tranche [[28.T28.7]].
 */

import {
    ALETHEIA_LINEAGE,
    ETYMOLOGY_PROVENANCE_SCHEME,
    SCENT_FOLLOWING_STAGES,
    type AtelierScentStage
} from '../../commands/atelier';
import { atelierSeamFor, ATELIER_UNDISPATCHED_METHODS, type AtelierSeam } from './atelierSeams';

/**
 * (d) lives one level down, with the command that performs it — the write-back
 * IS a command body, and a second copy of the envelope law would be a second
 * authority. Re-exported here because the surface addresses it here.
 */
export {
    ATELIER_MUTATES_GRAPH_CANON,
    MOBIUS_WRITE_BACK_TARGET,
    mobiusWriteBackIntent
} from '../../commands/atelier';
export type { MobiusWriteBackInput } from '../../commands/atelier';

/**
 * One scent stage as the surface must render it: the stage, the real binding
 * key its readiness badge reads, whether the stack DISPATCHES that method, and
 * the seam that explains a `false`.
 */
export interface AtelierStageBinding {
    readonly stage: AtelierScentStage;
    /** The gateway method, or null for the local `pros-hen` synthesis stage. */
    readonly bindingKey: string | null;
    /** True when the method really has a dispatch arm (or the stage is local). */
    readonly dispatched: boolean;
    /** The disclosure when `dispatched` is false — never null in that case. */
    readonly seam: AtelierSeam | null;
}

const UNDISPATCHED = new Set(ATELIER_UNDISPATCHED_METHODS);

export const ATELIER_STAGE_BINDINGS: readonly AtelierStageBinding[] = Object.freeze(
    SCENT_FOLLOWING_STAGES.map(stage => {
        const method = stage.gatewayMethod;
        const dispatched = method === null || !UNDISPATCHED.has(method);
        return Object.freeze({
            stage,
            bindingKey: method,
            dispatched,
            seam: dispatched ? null : atelierSeamFor(method)
        });
    })
);

export function atelierStageBinding(stageId: AtelierScentStage['id']): AtelierStageBinding {
    const binding = ATELIER_STAGE_BINDINGS.find(entry => entry.stage.id === stageId);
    if (!binding) {
        throw new Error(`unknown Atelier scent stage: ${stageId}`);
    }
    return binding;
}

// ── (c) etymology:// namespace integrity ───────────────────────────────────

export interface ProvenanceHandleVerdict {
    readonly handle: string;
    readonly admitted: boolean;
    /** The scheme the handle actually declared (`''` when it declared none). */
    readonly scheme: string;
    /** Why a handle was refused; null when admitted. */
    readonly reason: string | null;
}

/**
 * UX §5.3 namespace integrity as a verdict rather than a filter. The Atelier
 * refuses a foreign scheme OUT LOUD: a handle silently dropped looks identical
 * to a handle that was never produced, and the reader cannot audit either.
 */
export function admitProvenanceHandle(handle: string): ProvenanceHandleVerdict {
    const match = /^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)/.exec(handle);
    const scheme = match ? match[1] : '';
    if (scheme !== ETYMOLOGY_PROVENANCE_SCHEME) {
        return Object.freeze({
            handle,
            admitted: false,
            scheme,
            reason: scheme
                ? `refused: \`${scheme}\` is outside the Atelier's \`${ETYMOLOGY_PROVENANCE_SCHEME}\` namespace`
                : `refused: no URI scheme — the Atelier admits \`${ETYMOLOGY_PROVENANCE_SCHEME}\` handles only`
        });
    }
    if (handle.length <= ETYMOLOGY_PROVENANCE_SCHEME.length) {
        return Object.freeze({
            handle,
            admitted: false,
            scheme,
            reason: 'refused: the handle names no reference after the scheme'
        });
    }
    return Object.freeze({ handle, admitted: true, scheme, reason: null });
}

export function admitProvenanceHandles(
    handles: readonly string[]
): readonly ProvenanceHandleVerdict[] {
    return Object.freeze(handles.map(admitProvenanceHandle));
}

// ── (e) Aletheia lineage + veto ────────────────────────────────────────────

export interface AtelierSubagentVeto {
    /** One of ALETHEIA_LINEAGE's six — a veto from anyone else is not lineage. */
    readonly subagent: string;
    readonly reason: string;
}

/**
 * 12.19: an Aletheia veto is ADVISORY. It colours the trail red and it is
 * recorded, but the human gate stays open — the subagents are evidence, not
 * approvers. Pinned as a const so no render can quietly make it blocking.
 */
export const ATELIER_VETO_BLOCKS_HUMAN_GATE = false as const;

/** The six subagent names a veto may legitimately come from. */
export const ATELIER_LINEAGE_SUBAGENTS: readonly string[] = Object.freeze(
    ALETHEIA_LINEAGE.map(entry => entry.subagent)
);
