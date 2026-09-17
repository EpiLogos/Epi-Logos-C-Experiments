/**
 * Coordinate: M' M5' (Autoresearch substrate seams — rerun 26.T26.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #1 — Definition: what tranche 26.6 NAMES, held against what the
 *   S5 substrate really computes and what the intent ledger really resolves, so
 *   the Möbius ribbon cannot claim a pass ordinal nobody produces.
 * Actualises: the register discipline `panes/acr/acrGovernance.ts` (28.5),
 *   `panes/atelier/atelierSeams.ts` (28.7) and `panes/omni/review/reviewPaneSeams.ts`
 *   (28.9) established. An unavailable seam renders its affordance with the
 *   producer NAME and the reason ON the surface; the sibling suite probes the
 *   real `Body/S/S5/epii-autoresearch-core` sources, so every claim here goes RED
 *   the day the missing producer lands.
 *
 *   THE ONE REAL ABSENCE this tranche found is the ribbon's "recompose-pass
 *   count". 26.6 asks `<MobiusPassRibbon />` to read `s5'.improve.status` →
 *   `recompose.rs` pass-state. `recompose_pass` exists — but it is a pure
 *   library function over the Aletheia `InboxStore` with NO non-test caller
 *   anywhere in `Body/S`, and `ImproveStatus` (the struct `s5'.improve.status`
 *   serialises) carries no pass field of any kind. There is therefore no pass
 *   ordinal on the wire, in the store, or in any handler — and none is invented
 *   here. The ribbon names the function that would produce it instead.
 *
 *   THE ONE SEAM THIS TRANCHE CLOSED is the mirror image: the `capacity:<id>`
 *   cross-layout route into this pane's per-capacity filter was declared in the
 *   intent ledger (31.T31.10) and decoded in `App.tsx` (28.T28.10), and NOTHING
 *   in the carrier ever dispatched one. A consumed route with no producer is a
 *   filter you can only reach by hunting a dropdown. The 26.2 capacity lanes now
 *   fire it, which is why that seam is recorded `available: true`.
 * Public surface: AutoresearchSeamKind, AutoresearchSeam, AUTORESEARCH_SEAMS,
 *   autoresearchSeam, RECOMPOSE_PASS_SEAM, RECOMPOSE_PASS_PRODUCER,
 *   RECOMPOSE_PASS_STATUS_STRUCT, AUTORESEARCH_LIVE_METHODS.
 * Does NOT own: the improvement law (S5 `epii-autoresearch-core`), the wire
 *   parsers (`autoresearchModel.ts`), the intent ledger
 *   (`commands/crossLayoutIntent.ts`), or the render.
 * Contract: [[M5'-SPEC]] / [[CHROME-CONTRACT]] · rerun tranche [[26.T26.6]].
 */

/** The S5 function that would compute a recompose pass, named on the surface. */
export const RECOMPOSE_PASS_PRODUCER =
    'Body/S/S5/epii-autoresearch-core/src/recompose.rs::recompose_pass';

/** The struct `s5'.improve.status` serialises — the wire that would carry it. */
export const RECOMPOSE_PASS_STATUS_STRUCT =
    'Body/S/S5/epii-autoresearch-core/src/types.rs::ImproveStatus';

/** Methods this pane really invokes, held against the S-layer dispatch tables. */
export const AUTORESEARCH_LIVE_METHODS: readonly string[] = Object.freeze([
    "s5'.improve.status",
    "s5'.improve.history",
    "s5'.improve.q_review.latest",
    "s5'.review.submit",
    "s5'.review.resolve",
    "s1'.q_articulation.accept"
]);

export type AutoresearchSeamKind = 'substrate-projection' | 'gateway-method' | 'intent-route';

export interface AutoresearchSeam {
    /** Which 26.6 deliverable named it. */
    readonly deliverable: string;
    readonly kind: AutoresearchSeamKind;
    /** The name the spec used — producer, method, or route key. */
    readonly name: string;
    /** The name the SUBSTRATE really carries, when it differs. */
    readonly carrierName: string | null;
    /** True only when the substrate really produces/dispatches the close-path. */
    readonly available: boolean;
    /** What the spec expected it to do. */
    readonly expected: string;
    /** What it really is, and why the gap is disclosed rather than filled. */
    readonly reason: string;
}

/**
 * The recompose-pass seam, exported on its own because the ribbon renders its
 * name and reason inline — the disclosure is at the datum, not in a footnote.
 */
export const RECOMPOSE_PASS_SEAM: AutoresearchSeam = Object.freeze({
    deliverable: '26.6 (b) — the Möbius ribbon recompose-pass count',
    kind: 'substrate-projection' as const,
    name: RECOMPOSE_PASS_PRODUCER,
    carrierName: RECOMPOSE_PASS_STATUS_STRUCT,
    available: false,
    expected: 'a recompose-pass ordinal on `s5\'.improve.status` for the ribbon to count',
    reason:
        '`recompose_pass` is a pure function over the Aletheia `InboxStore` with NO non-test caller '
        + 'anywhere in `Body/S` — nothing invokes it in production, so no pass is ever run, let alone '
        + 'counted. `ImproveStatus`, the struct `s5\'.improve.status` serialises, carries `loop_state`, '
        + '`active_vectors`, `last_run`, `total_runs`, `keep_count`, `discard_count` and '
        + '`kernel_evidence_count` and no pass field of any kind. So the ribbon has a real ACTIVE STAGE '
        + '(`loop_state` → Surface/Route/Orchestrate/Integrate) and a real dry-run law, and names this '
        + 'producer where a count would go rather than counting its own renders.'
});

export const AUTORESEARCH_SEAMS: readonly AutoresearchSeam[] = Object.freeze([
    RECOMPOSE_PASS_SEAM,
    Object.freeze({
        deliverable: '26.6 (b) — the pass-state the ribbon really reads',
        kind: 'gateway-method' as const,
        name: "s5'.improve.status",
        carrierName: null,
        available: true,
        expected: 'the Möbius stage the ribbon highlights',
        reason:
            'registered at S5 (`epii-autoresearch-core/src/s5_handlers/mod.rs::S5_AUTORESEARCH_SYNC_METHODS`) '
            + 'and composed into the gateway registry by the S0 gate host. `ImproveStatus.loop_state` is '
            + 'the only lifecycle signal the substrate really computes, and `loopStateToMobiusStage` maps '
            + 'its four states onto the four ribbon stages one-for-one — a total projection with no '
            + 'default arm, so an unmapped state is a type error rather than a silently wrong highlight.'
    }),
    Object.freeze({
        deliverable: '26.6 (c) — the per-capacity entry into the filter',
        kind: 'intent-route' as const,
        name: 'ide-shell-m0-m5/capacity:<id>',
        carrierName: 'ide-shell-m0-m5/autoresearch-pane',
        available: true,
        expected: 'open the Autoresearch pane with the filter pre-seated on one of the six 26.2 capacities',
        reason:
            '`intentTarget()` has aliased the `capacity:` prefix onto the `autoresearch-pane` row since '
            + '31.T31.10, and `App.tsx` has decoded it into `requestedCapacity` since 28.T28.10 — but the '
            + 'carrier dispatched no such intent from anywhere, so both ends were a route with no traffic. '
            + '26.T26.6 lands the producer on the 26.2 capacity lanes, and both ends now read one codec '
            + '(`autoresearchModel.ts::capacityIntentContributionId` / `capacityFromIntentContributionId`) '
            + 'so the prefix and the six-id vocabulary cannot drift apart across the seam.'
    })
]);

/** The seam covering a spec name, if the register discloses one. */
export function autoresearchSeam(name: string): AutoresearchSeam | null {
    return AUTORESEARCH_SEAMS.find(seam => seam.name === name || seam.carrierName === name) ?? null;
}
