/**
 * Coordinate: M' M0' chrome (the coordinate tree's honest seam register — 28.T28.6)
 * Residency: Body/M/pratibimba-app/src/panes/coordinateTree/coordinateTreeSeams.ts
 * Position (#n): #4 — Context/Type: the declared type of what this surface can
 *   and cannot know.
 * Actualises: the register the pane RENDERS when a tranche 28.6 deliverable
 *   names a substrate field that does not exist. Two of the five deliverables
 *   are fully carried by live methods; deliverable (e) names a privacy class
 *   per node, and no layer of this stack carries one. Saying so on the surface —
 *   beside the method name and the reason — is the whole point (the 28.T28.5
 *   pattern, DR-ACR-1): a disabled affordance that explains itself, never a
 *   fabricated badge that implies a gate is running.
 *
 *   THE CLAIMS ARE TESTED AGAINST THE SUBSTRATE. `coordinateTreeSeams.test.ts`
 *   reads the real S2 sources: it fails if a named LIVE method stops being
 *   registered, and it fails if an ABSENT field ever lands. So the disclosure
 *   cannot outlive the gap it describes.
 * Public surface: CoordinateTreeSeam, COORDINATE_TREE_LIVE_METHODS,
 *   COORDINATE_TREE_SEAMS.
 * Does NOT own: the S2 method table (`Body/S/S2/graph-services/src/s2_handlers.rs`),
 *   the graph schema (`Body/S/S2/graph-schema`), the privacy verdict
 *   (`ui/privacyGate.ts`), or the render tree.
 * Contract: [[CHROME-CONTRACT]] §2 + §7 · rerun tranche [[28.T28.6]].
 */

/** The gateway methods this pane really invokes. Both probed live 2026-07-30. */
export const COORDINATE_TREE_LIVE_METHODS: readonly string[] = Object.freeze(['s2.graph.query']);

/**
 * The methods tranche 28.6 names by hand, and what they actually are. Kept
 * separate from the list above because a method can EXIST and still not carry
 * the field a spec attributes to it — which is exactly the case here.
 */
export const COORDINATE_TREE_SPEC_METHODS: readonly string[] = Object.freeze([
    "s2'.coordinate.resolve"
]);

export interface CoordinateTreeSeam {
    /** Which 28.6 deliverable named it. */
    readonly deliverable: string;
    /** The method the spec named. Registered or not — `registered` says which. */
    readonly method: string;
    readonly registered: boolean;
    /** What the spec expected the method to carry. */
    readonly expected: string;
    /** What it really carries, and why the gap is not filled here. */
    readonly reason: string;
}

/**
 * ONE seam, and it is a real one.
 *
 * 28.6 (e) reads: "`BimbaSubgraphPayload`-style privacy fetch via
 * `s2'.coordinate.resolve` returns privacy class per node; apply
 * `coordinate-privacy-{class}` CSS class; forbidden-privacy nodes render as
 * gray-out with privacy-blocked overlay."
 *
 * `s2'.coordinate.resolve` IS registered (`s2_handlers.rs` `S2_METHODS`) — the
 * spec did not invent a method. But it is a pure string resolver that returns
 * `CoordinateResolution { input, canonical, compatibility_property }` and never
 * touches Neo4j, so it cannot carry a privacy class; and nothing else does
 * either. `s2.graph.node`'s `bimba_node_row` projects nine fields
 * (`coordinate, uuid, name, family, layer, ql_position, depth, anchors,
 * anuttara`) with no privacy among them, and `Body/S/S2/graph-schema` declares
 * no privacy property at all. The only privacy this stack carries for graph
 * reads is the RECEIPT's `privacyClass`, which the pane gates on exactly as the
 * Bimba graph viewer does (28.T28.3 (e) / CHROME-CONTRACT §7).
 *
 * So the class the spec asks for IS applied — `coordinate-privacy-{class}` from
 * the receipt — and the per-node refinement is disclosed rather than faked. A
 * grey-out per node would have implied a per-node verdict nobody computed.
 */
export const COORDINATE_TREE_SEAMS: readonly CoordinateTreeSeam[] = Object.freeze([
    Object.freeze({
        deliverable: '28.6 (e) — privacy-class colouring per node',
        method: "s2'.coordinate.resolve",
        registered: true,
        expected: 'a privacy class per coordinate',
        reason:
            'the method is a pure coordinate-string resolver (input/canonical/compatibility_property, no Neo4j read); '
            + "s2.graph.node's node row carries no privacy field and Body/S/S2/graph-schema declares no privacy property. "
            + 'Rows therefore carry the RECEIPT privacy class, which is the only per-read verdict that exists.'
    })
]);
