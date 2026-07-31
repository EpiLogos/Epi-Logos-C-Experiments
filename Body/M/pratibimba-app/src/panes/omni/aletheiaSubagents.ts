/**
 * Coordinate: M' M5' / `/` membrane (Aletheia subagent surfacing register — 26.T26.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): #4 — Context/Type: the type law of WHAT an Aletheia subagent
 *   contributes when it appears, held apart from where it is drawn. A pure
 *   module (no React, no gateway) so the node suite and the Playwright spec can
 *   both import it — `scripts/lint-e2e-import-graph.mjs`.
 * Actualises: tranche 26.9 — "each Aletheia subagent appears as dispatch
 *   sub-trace in crystallisation-mode, never as peer review actor". Three things
 *   live here:
 *
 *   (1) THE SUBAGENT TRACE REGISTER (`ALETHEIA_SUBAGENT_TRACES`). Until this
 *       tranche the six subagents surfaced as a bare lowercase id in a badge —
 *       `anansi`, `janus`, … — which is an identity, not a trace. 26.9 names a
 *       DISTINCT contribution per subagent (citation trail / prospective-
 *       retrospective / tarot cast-anchor / kairos signal / deliberation log /
 *       temporal-rhythm anchor), and nothing rendered any of it. Each row also
 *       carries the CF binding and techne class the substrate contract really
 *       declares — `Body/S/S3/gateway-contract/src/aletheia.rs::FacetId`, whose
 *       `cf_label()` and per-variant doc comments are the source. The sibling
 *       suite holds every row against that file, so a roster or CF change in the
 *       substrate reds the carrier instead of drifting silently.
 *
 *   (2) THE LIVE LINEAGE PROJECTION (`aletheiaLineageFromGenealogy`). Which
 *       subagents REALLY ran is not a declaration — it is read off the folded
 *       genealogy (`dispatchGenealogyFromSessions` over the real `sessions.list`
 *       lineage). The register supplies the six rows and their meaning; the
 *       genealogy supplies `observed`, `dispatchCount`, and the vetoes. A
 *       surface that renders the roster alone is showing a constant and calling
 *       it lineage.
 *
 *   (3) THE SURFACING SEAM REGISTER (`ALETHEIA_SURFACING_SEAMS`). The 12.19 veto
 *       primitive is FULLY TYPED in `Body/S/S3/gateway-contract/src/aletheia.rs`
 *       (`FacetId` / `FacetReturn` / `FacetRoundResult` / `VetoLogEntry` /
 *       `check_veto_miscalibration`, all re-exported by `lib.rs:57`) and its
 *       persistence reducer exists (`epi-spacetime-module::publish_aletheia_veto`
 *       + the gateway presence client). NOTHING PRODUCES ONE. No S-layer source
 *       outside `aletheia.rs` and its own tests constructs a `FacetReturn`; the
 *       reducer has no non-test caller; and the session-record fields the
 *       carrier's fold reads for a veto (`vetoReason` / `veto_reason`) and for a
 *       crystallisation intent (`crystallisationIntent` /
 *       `crystallisation_intent`) appear nowhere in `Body/S`. So the veto banner
 *       and the crystallisation-intent label are render paths gated on data the
 *       wire does not carry. This tranche does NOT fake a feed: it lands the
 *       render, types it against the substrate contract so it lights up the day
 *       a producer arrives, and says on the surface that the feed is absent —
 *       the `atelierSeams.ts` / `acrGovernance.ts` discipline, held to the real
 *       `Body/S` sources by `aletheiaSubagents.test.ts` in both directions.
 *
 *   THE INVOCATION NEGATIVE. `aletheia_*` are SUBAGENT TOOLS dispatched by Anima
 *   through `s4'.mediation.route` under entitlement. They are in no S-layer
 *   dispatch table and are not gateway methods. Surfacing Aletheia means
 *   rendering LINEAGE and VETO — never calling a method (DR-M5-1 / 12.1).
 * Public surface: AletheiaSubagentTraceKind, ALETHEIA_SUBAGENT_TRACES,
 *   ALETHEIA_SUBAGENT_IDS, aletheiaSubagentTrace, aletheiaSubagentLabel,
 *   ALETHEIA_VETO_BLOCKS_HUMAN_GATE, vetoBannerText, AletheiaVetoRecord,
 *   AletheiaLineageObservation, aletheiaLineageFromGenealogy,
 *   AletheiaSurfacingSeam, ALETHEIA_SURFACING_SEAMS, aletheiaSurfacingSeam,
 *   ALETHEIA_ABSENT_FEED_SEAMS.
 * Does NOT own: the subagent id type (`evidenceShapes.ts`), the facet-return
 *   shape (`omnipanelRuntime.ts`), the genealogy fold (`dispatchGenealogy.ts` /
 *   `dispatchGenealogyFromSessions.ts`), the guardian roster used for dispatch
 *   targeting (`omnipanelCapabilities.ts`), or any render.
 * Contract: [[DR-M5-1]] · 12.T12.19 veto primitive ·
 *   [[2026-06-04-prospective-retrospective-canvas-spec]] §4 + §5 ·
 *   rerun tranche [[26.T26.9]].
 */

import type { DispatchGenealogyRecord } from './dispatchGenealogy';
import type { AletheiaSubagentId } from './evidenceShapes';
import type { AletheiaFacetReturn } from './omnipanelRuntime';

/** Where the substrate declares the facet identity, CF binding and techne class. */
export const ALETHEIA_FACET_CONTRACT_SOURCE = 'Body/S/S3/gateway-contract/src/aletheia.rs';

/** The M4' canvas spec 26.9 requires the Janus trace to read (§4). */
export const JANUS_CANVAS_SPEC_SOURCE =
    "Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md";

/**
 * One subagent as a surface must render it: who it is, the CF it is bound to,
 * the techne class it stewards, and — the 26.9 deliverable — the KIND of trace
 * it contributes when it appears in a crystallisation fan-out.
 */
export interface AletheiaSubagentTraceKind {
    readonly id: AletheiaSubagentId;
    /** `FacetId::label()` in the substrate contract. */
    readonly label: string;
    /** `FacetId::cf_label()` — CF0…CF5, in enum order. */
    readonly cf: string;
    /** The techne class the contract's variant doc-comment binds it to. */
    readonly techneClass: string;
    /** 26.9's per-subagent sub-trace: what this subagent's appearance MEANS. */
    readonly traceKind: string;
    /** The file that holds the trace kind as canon. */
    readonly canonRef: string;
}

/**
 * The six, in `FacetId` enum order (Anansi CF0 … Zeithoven CF5). Not a second
 * roster: `omnipanelCapabilities.ts::ALETHEIA_TECHNE_GUARDIANS` names WHO may be
 * dispatched; this names WHAT each contributes when one is. The sibling suite
 * proves the two agree and that both agree with the substrate contract.
 */
export const ALETHEIA_SUBAGENT_TRACES: readonly AletheiaSubagentTraceKind[] = Object.freeze([
    Object.freeze({
        id: 'anansi' as const,
        label: 'Anansi',
        cf: 'CF0',
        techneClass: 'coordinate-mapping / blueprint / Darshana-REPL',
        traceKind: 'citation trail — source-to-source provenance graph',
        canonRef: "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/anansi.md"
    }),
    Object.freeze({
        id: 'janus' as const,
        label: 'Janus',
        cf: 'CF1',
        techneClass: 'temporal-structure / bhedabheda-threshold',
        traceKind:
            'prospective / retrospective binary (12.18) — OracleSpread aliveness and the '
            + 'kairos-driven Klein weighting the doorway computes',
        canonRef: `${JANUS_CANVAS_SPEC_SOURCE} §4`
    }),
    Object.freeze({
        id: 'moirai' as const,
        label: 'Moirai',
        cf: 'CF2',
        techneClass: 'GraphRAG-distillation (Klotho / Lachesis / Atropos)',
        traceKind: 'tarot cast-anchor at session open or decision point',
        canonRef: "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md"
    }),
    Object.freeze({
        id: 'mercurius' as const,
        label: 'Mercurius',
        cf: 'CF3',
        techneClass: 'Kairos-signal / qualitative-temporal-pattern',
        traceKind: 'kairos signal — Kerykeion-derived ephemeris context',
        canonRef: "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/mercurius.md"
    }),
    Object.freeze({
        id: 'agora' as const,
        label: 'Agora',
        cf: 'CF4',
        techneClass: 'plugin-absorption / skill-index / multi-channel-aggregation',
        traceKind: 'deliberation log between Anima dispatchees',
        canonRef: "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/agora.md"
    }),
    Object.freeze({
        id: 'zeithoven' as const,
        label: 'Zeithoven',
        cf: 'CF5',
        techneClass: 'creative-advance / skill-and-agent-creation',
        traceKind: 'temporal-rhythm anchor — tick-grid alignment of subagent invocations',
        canonRef: "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/zeithoven.md"
    })
]);

export const ALETHEIA_SUBAGENT_IDS: readonly AletheiaSubagentId[] = Object.freeze(
    ALETHEIA_SUBAGENT_TRACES.map(trace => trace.id)
);

export function aletheiaSubagentTrace(id: AletheiaSubagentId): AletheiaSubagentTraceKind {
    const trace = ALETHEIA_SUBAGENT_TRACES.find(entry => entry.id === id);
    if (!trace) {
        throw new Error(`unknown Aletheia subagent: ${id}`);
    }
    return trace;
}

export function aletheiaSubagentLabel(id: AletheiaSubagentId): string {
    return aletheiaSubagentTrace(id).label;
}

// ---------------------------------------------------------------------------
// The veto primitive (12.19) — one authority for both surfaces
// ---------------------------------------------------------------------------

/**
 * 12.19: an Aletheia veto blocks the emerging SYNTHESIS, never the HUMAN GATE.
 * It colours the trace red and it is recorded; the human still decides. Pinned
 * as a const so no render can quietly make it blocking, and shared by the ACR
 * banner and the Atelier banner so the two cannot disagree.
 */
export const ALETHEIA_VETO_BLOCKS_HUMAN_GATE = false as const;

/**
 * The banner line 26.9 specifies verbatim: "Aletheia subagent {name} veto —
 * {reason}". It needs the subagent NAME, which is exactly what the carrier's
 * facet-return type dropped until this tranche restored it from the substrate
 * contract (`FacetReturn` carries `facet` on BOTH variants).
 */
export function vetoBannerText(facet: AletheiaSubagentId, reason: string): string {
    return `Aletheia subagent ${aletheiaSubagentLabel(facet)} veto — ${reason}`;
}

// ---------------------------------------------------------------------------
// The live lineage projection
// ---------------------------------------------------------------------------

export interface AletheiaVetoRecord {
    /** The genealogy node the veto was returned on. */
    readonly nodeId: string;
    readonly facet: AletheiaSubagentId;
    readonly reason: string;
    readonly whatIsMissed: string;
}

export interface AletheiaLineageObservation {
    readonly trace: AletheiaSubagentTraceKind;
    /** TRUE only when this subagent really appears in the folded genealogy. */
    readonly observed: boolean;
    readonly dispatchCount: number;
    readonly vetoes: readonly AletheiaVetoRecord[];
}

function isVeto(
    facetReturn: AletheiaFacetReturn | undefined
): facetReturn is Extract<AletheiaFacetReturn, { kind: 'veto' }> {
    return facetReturn?.kind === 'veto';
}

/**
 * Project the six onto REAL dispatch lineage. Every row is returned — the
 * register is the whole roster and a surface that hid the unobserved ones would
 * make "no Anansi ran" indistinguishable from "Anansi is not part of this
 * system" — but `observed` / `dispatchCount` / `vetoes` come only from records
 * the fold really produced. Nothing is synthesised.
 */
export function aletheiaLineageFromGenealogy(
    records: readonly DispatchGenealogyRecord[]
): readonly AletheiaLineageObservation[] {
    return Object.freeze(
        ALETHEIA_SUBAGENT_TRACES.map(trace => {
            const mine = records.filter(record => record.aletheiaSubagent === trace.id);
            const vetoes = mine
                .filter(record => isVeto(record.aletheiaFacetReturn))
                .map(record => {
                    const facetReturn = record.aletheiaFacetReturn as Extract<
                        AletheiaFacetReturn,
                        { kind: 'veto' }
                    >;
                    return Object.freeze({
                        nodeId: record.id,
                        facet: facetReturn.facet,
                        reason: facetReturn.reason,
                        whatIsMissed: facetReturn.whatIsMissed
                    });
                });
            return Object.freeze({
                trace,
                observed: mine.length > 0,
                dispatchCount: mine.length,
                vetoes: Object.freeze(vetoes)
            });
        })
    );
}

// ---------------------------------------------------------------------------
// The surfacing seam register
// ---------------------------------------------------------------------------

export interface AletheiaSurfacingSeam {
    readonly id: string;
    /** Which 26.9 deliverable named it. */
    readonly deliverable: string;
    /** The substrate declaration this seam is measured against. */
    readonly contract: string;
    /** TRUE only when the stack really produces the datum on a live run. */
    readonly available: boolean;
    readonly expected: string;
    readonly reason: string;
}

export const ALETHEIA_SURFACING_SEAMS: readonly AletheiaSurfacingSeam[] = Object.freeze([
    Object.freeze({
        id: 'facet-return-feed',
        deliverable: '26.9 — veto primitive (12.19) in the dispatch sub-trace',
        contract: `${ALETHEIA_FACET_CONTRACT_SOURCE}::FacetReturn`,
        available: false,
        expected:
            'a subagent dispatch that carries its `FacetReturn` — a disclosure (angle + citations) '
            + 'or a veto (reason + what is missed) — onto the genealogy node the carrier renders',
        reason:
            'the contract is COMPLETE and re-exported (gateway-contract/src/lib.rs `pub use '
            + 'aletheia::*`) — FacetId, FacetReturn, FacetRoundResult, VetoLogEntry and '
            + 'check_veto_miscalibration all exist — but NOTHING CONSTRUCTS ONE: no source under '
            + 'Body/S outside aletheia.rs and its own unit tests mentions FacetReturn, and the '
            + 'session-record fields the carrier folds a veto from (`vetoReason` / `veto_reason`) '
            + 'appear nowhere in Body/S. The render is landed and typed against the contract so it '
            + 'lights up the day a producer lands; until then a veto banner can only be reached by '
            + 'a caller supplying the datum, and this surface says so rather than leaving an '
            + 'affordance that looks live and never fires.'
    }),
    Object.freeze({
        id: 'veto-log-persistence',
        deliverable: '26.9 / 12.19 — veto patterns persist and inform later dispatch',
        contract: 'Body/S/S3/epi-spacetime-module/src/lib.rs::publish_aletheia_veto',
        available: false,
        expected:
            'a live run writing the `aletheia_veto_log` table so recurring facet gaps are readable '
            + 'across sessions (12.19 §5.4)',
        reason:
            'the reducer exists and the gateway presence client can call it '
            + '(Body/S/S3/gateway/src/spacetime/presence.rs::publish_aletheia_veto), but its only '
            + 'callers are in Body/S/S3/gateway/tests/aletheia_veto_contract.rs — the persistence '
            + 'path is proven and unused, so no historical veto exists for any surface to read.'
    }),
    Object.freeze({
        id: 'crystallisation-intent',
        deliverable: "26.9 — the crystallisation-mode grouping label on Anima's fan-out",
        contract: 'Body/S/S3/gateway sessions.list record',
        available: false,
        expected:
            'the intent Anima crystallised under, carried on the dispatch record so the subagent '
            + 'fan-out is grouped by WHAT it was crystallising',
        reason:
            'the carrier folds it from `crystallisationIntent` / `crystallisation_intent`; neither '
            + 'name occurs anywhere in Body/S. The group therefore renders without an intent label '
            + 'rather than inventing one — the subagent badges beside it are real (they come from '
            + 'the `agent:<parent>:subagent:<child>` session keys the gateway really mints).'
    }),
    Object.freeze({
        id: 'aletheia-tool-invocation',
        deliverable: '26.9 — "surfacing" is lineage + veto, never invocation',
        contract: "Body/S/S4 ta-onta subagent tools via s4'.mediation.route",
        available: false,
        expected:
            'nothing — this row exists to state the NEGATIVE: no surface may call an `aletheia_*` '
            + 'name',
        reason:
            'the `aletheia_*` names are Anima-dispatched SUBAGENT TOOLS reached through '
            + "`s4'.mediation.route` under entitlement. They are in no S-layer dispatch table and "
            + 'are not gateway methods (the same correction `panes/atelier/atelierSeams.ts` records '
            + 'for the Atelier). A surface renders their LINEAGE; it never invokes them.'
    })
]);

export function aletheiaSurfacingSeam(id: string): AletheiaSurfacingSeam {
    const seam = ALETHEIA_SURFACING_SEAMS.find(entry => entry.id === id);
    if (!seam) {
        throw new Error(`unknown Aletheia surfacing seam: ${id}`);
    }
    return seam;
}

/** The seams a surface must disclose because the datum never arrives. */
export const ALETHEIA_ABSENT_FEED_SEAMS: readonly AletheiaSurfacingSeam[] = Object.freeze(
    ALETHEIA_SURFACING_SEAMS.filter(seam => !seam.available)
);
