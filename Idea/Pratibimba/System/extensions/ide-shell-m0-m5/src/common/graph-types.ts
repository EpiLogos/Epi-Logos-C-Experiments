/**
 * Graph payload shape consumed by the Bimba graph viewer — Track 05 T4.
 *
 * The viewer is intentionally a thin renderer over the S2 gateway response.
 * It does NOT compute coordinate trees, derive pointer webs, or shape nodes
 * locally; everything below is read from the gateway's `s2.graph.node` /
 * `s2.graph.query` / `s2.graph.pointer_web.compute` envelopes.
 *
 * The shape mirrors the m-extension-runtime `buildM0InspectorModel` reader
 * (m0-anuttara/src/common/m0-inspector.ts) — the viewer accepts the same
 * `graphNode` record the M0 widget already consumes from
 * `MathemeHarmonicProfileBoundary.payload`, so the two renderings stay
 * payload-compatible.
 */

export interface BimbaPointerAnchor {
    /** Anchor path in M-coordinate form (e.g. `#0.0.0`, `M5.review`). */
    readonly path: string;
    /** Anchor kind: source/spec/code/test (Track 07 standard). */
    readonly kind?: 'source' | 'spec' | 'code' | 'test' | string;
}

export interface BimbaGraphNodePayload {
    readonly coordinate?: string;
    readonly namespace?: string;
    readonly label?: string;
    readonly pointer?: string;
    readonly pointerAnchor?: BimbaPointerAnchor | string;
    /** GDS overlay readiness (Track 02 verification surface). */
    readonly gdsReadiness?: string;
    /** Source/spec/code/test anchors, when surfaced by S2. */
    readonly sourceAnchor?: string;
    readonly specAnchor?: string;
    readonly codeAnchor?: string;
    readonly testAnchor?: string;
    /** Relation families exposed by the S2 payload. */
    readonly relationFamilies?: Readonly<Record<string, unknown>>;
    /** Raw fall-through — the viewer preserves any field the gateway emits. */
    readonly [extra: string]: unknown;
}

export interface BimbaSubgraphPayload {
    readonly node: BimbaGraphNodePayload | null;
    readonly neighbors: readonly BimbaGraphNodePayload[];
    readonly privacyClass: string;
    readonly profileGeneration: number | null;
    readonly source: 's2.graph.node' | 's2.graph.query' | 's2.graph.traverse' | string;
}

/** Empty / pending subgraph used before the gateway responds. */
export const EMPTY_SUBGRAPH: BimbaSubgraphPayload = {
    node: null,
    neighbors: [],
    privacyClass: 'safe-public-current-kernel-tick',
    profileGeneration: null,
    source: 's2.graph.node'
};

/**
 * Wrap a raw gateway artifact into a BimbaSubgraphPayload. The artifact
 * structure is `KernelBridgeCapabilityReceipt.artifact` — whatever shape S2
 * returns. The reader is defensive: it accepts either a bare node object or a
 * `{ node, neighbors[] }` envelope.
 */
export function asSubgraph(
    artifact: unknown,
    privacyClass: string,
    profileGeneration: number | null,
    source: string
): BimbaSubgraphPayload {
    if (!artifact || typeof artifact !== 'object') {
        return { ...EMPTY_SUBGRAPH, privacyClass, profileGeneration, source };
    }
    const obj = artifact as Record<string, unknown>;
    const nodeCandidate =
        obj.node && typeof obj.node === 'object' ? (obj.node as BimbaGraphNodePayload) :
        obj.graph_node && typeof obj.graph_node === 'object' ? (obj.graph_node as BimbaGraphNodePayload) :
        (obj as BimbaGraphNodePayload);
    const neighbors =
        Array.isArray(obj.neighbors)
            ? (obj.neighbors as BimbaGraphNodePayload[])
            : [];
    return {
        node: nodeCandidate,
        neighbors,
        privacyClass,
        profileGeneration,
        source
    };
}
