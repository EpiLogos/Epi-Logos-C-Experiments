import type { MObservabilityEvent, PrivacyClass } from '@pratibimba/m-extension-runtime';
import { formatIntegratedDeepLink } from '@pratibimba/integrated-composition/integrated-deep-links';
import type {
    IntegratedDeepLinkInspector
} from '@pratibimba/integrated-composition/integrated-deep-links';
import type {
    JivaSivaRecognitionClaim,
    RecognitionSourceClass
} from '@pratibimba/integrated-composition/recognition-claim';

/**
 * 08.T8.4 — M5 → M0 pedagogical return (Möbius write-back).
 *
 * The plugin owns the personal → pedagogical return path. A pattern that has
 * been *recognized* on the M5 review side (jiva-is-siva recognition) is
 * crystallized through the Logos Atelier (Tranche 06.2) and offered back into
 * the M0' M0-5' pedagogy layer (Tranche 01.1 — the M0-5' bridged route), the
 * pratyabhijñā recognition-closure position of the Anuttara prior-ground.
 *
 * This is the Möbius return (#5 → #0): the integration position folds back to
 * the ground. Crucially it is a **read-only contemplative offering** anchored
 * to *existing* M0 canon nodes. It NEVER mutates canon: it adds no node, edits
 * no node, and carries no protected-local body across the boundary. Hen (the
 * S1' compiler) remains the only authority that may write canonical Forms; the
 * pedagogical return only surfaces a deep-link into nodes that already exist.
 *
 * The return therefore grounds in the BEDROCK archetypal link (the canonical
 * prior-ground anchor of the recognition), not the M4 protected-local source
 * handle — pedagogy is the archetypal pattern made shareable, never the
 * personal field body.
 */

/** The M0-5' pedagogy coordinate — pratyabhijñā recognition closure. */
export const M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE = 'M0-5';

/**
 * Route label for the Logos Atelier crystallization → M0-5' pedagogy handoff.
 * (Literal `atelier-return` is the 08.T8.4 grep marker.)
 */
export const ATELIER_RETURN_ROUTE = 'atelier-return::logos-atelier->m0-5-prime';

/**
 * Observability event type emitted on a pedagogical return. `m0.graph.provenance`
 * is the read-only, anchored-to-graph-nodes M0 event (per m0-anuttara's
 * observabilityEventTypes in 07-t0-extension-contract-preflight.json) — chosen
 * precisely because it carries provenance, never a mutation request.
 */
export const M0_PEDAGOGY_PROVENANCE_EVENT_TYPE = 'm0.graph.provenance';

/** The pedagogical return always opens the M0 graph backdrop inspector. */
export const PEDAGOGY_DEEP_LINK_INSPECTOR: IntegratedDeepLinkInspector = 'm0-graph-backdrop';

/**
 * Read-only privacy scope for a pedagogical return: public-current archetypal
 * pattern carrying graph provenance — explicitly NOT `protected_local_handle_only`.
 */
export const PEDAGOGY_PRIVACY_SCOPE = 'public_current_with_graph_provenance' as const satisfies PrivacyClass;

/**
 * Only recognition claims whose source is archetypal/canonical may be offered
 * back as pedagogy. A raw `graphiti-memory` recollection is personal episodic
 * memory, never a canonical archetypal pattern, so it is refused here (mirrors
 * the graphiti-source-guard discipline on the canon-promotion path).
 */
const ATELIER_ELIGIBLE_SOURCE_CLASSES: ReadonlySet<RecognitionSourceClass> = new Set<RecognitionSourceClass>([
    'm4-protected',
    's2-canonical'
]);

/** A single canonical M0 node, as seen through a read-only canon view. */
export interface M0CanonNode {
    readonly coordinate: string;
    readonly label: string;
}

/**
 * A frozen, read-only view of the M0 canon. It exposes lookup only — there is
 * deliberately no `add`/`set`/`delete`, so a pedagogical return literally has
 * no surface through which to mutate canon.
 */
export interface ReadOnlyM0CanonView {
    readonly nodes: readonly M0CanonNode[];
    readonly nodeCount: number;
    has(coordinate: string): boolean;
    get(coordinate: string): M0CanonNode | undefined;
}

export function freezeM0CanonView(nodes: readonly M0CanonNode[]): ReadOnlyM0CanonView {
    const frozen = Object.freeze(nodes.map(n => Object.freeze({ ...n })));
    const index = new Map<string, M0CanonNode>(frozen.map(n => [n.coordinate, n]));
    return Object.freeze({
        nodes: frozen,
        nodeCount: frozen.length,
        has: (coordinate: string) => index.has(coordinate),
        get: (coordinate: string) => index.get(coordinate)
    });
}

/**
 * The Logos Atelier output — a recognized pattern distilled to its shareable
 * archetypal essence. Carries only an archetype label and the canonical BEDROCK
 * provenance handle; the M4 protected-local body is left behind by construction.
 */
export interface AtelierCrystallizedPattern {
    readonly patternId: string;
    readonly recognizedArchetype: string;
    readonly m0AnchorCoordinate: string;
    readonly provenanceHandle: string;
    readonly sourceRecognitionClaimId: string;
    readonly sourceClass: RecognitionSourceClass;
    readonly atelierRoute: typeof ATELIER_RETURN_ROUTE;
}

/**
 * The contemplative offering surfaced into M0-5'. `canonMutation` is hard-wired
 * `false` and `readOnly` hard-wired `true`; the `deepLink` is the M0-5' bridged
 * route the user follows to contemplate the pattern against its prior ground.
 */
export interface PedagogicalReturnOffering {
    readonly offeringId: string;
    readonly recognizedArchetype: string;
    readonly m0AnchorCoordinate: string;
    readonly pedagogyLayerCoordinate: typeof M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE;
    readonly provenanceHandle: string;
    readonly sourceRecognitionClaimId: string;
    readonly atelierRoute: typeof ATELIER_RETURN_ROUTE;
    readonly deepLink: string;
    readonly privacyScope: typeof PEDAGOGY_PRIVACY_SCOPE;
    readonly readOnly: true;
    readonly canonMutation: false;
    readonly offeredAt: number;
}

export type PedagogicalReturnResult =
    | {
        readonly status: 'offered';
        readonly offering: PedagogicalReturnOffering;
        readonly canonNodeCountBefore: number;
        readonly canonNodeCountAfter: number;
        readonly event: MObservabilityEvent;
    }
    | {
        readonly status: 'rejected';
        readonly reason: string;
        readonly event: MObservabilityEvent;
    };

export class PedagogicalReturnError extends Error {
    constructor(public readonly reason: string) {
        super(`Pedagogical return refused: ${reason}`);
        this.name = 'PedagogicalReturnError';
    }
}

export interface PedagogicalReturnOptions {
    /** Override the M0 anchor; defaults to the M0-5' recognition-closure node. */
    readonly m0AnchorCoordinate?: string;
    /** Human-readable archetype label for the recognized pattern. */
    readonly recognizedArchetype?: string;
    readonly profileGeneration?: number | null;
    readonly offeredAt?: number;
}

/**
 * Crystallize an M5-recognized claim through the Logos Atelier into a shareable
 * archetypal pattern. Refuses claims that are not archetypally grounded and
 * refuses to ground in the personal protected-local handle.
 */
export function crystallizeRecognitionThroughAtelier(
    claim: JivaSivaRecognitionClaim,
    options: PedagogicalReturnOptions = {}
): AtelierCrystallizedPattern {
    if (!ATELIER_ELIGIBLE_SOURCE_CLASSES.has(claim.sourceClass)) {
        throw new PedagogicalReturnError(
            `recognition source class "${claim.sourceClass}" is not archetypally grounded; ` +
            `only ${[...ATELIER_ELIGIBLE_SOURCE_CLASSES].join('/')} may return as pedagogy`
        );
    }
    const m0AnchorCoordinate =
        options.m0AnchorCoordinate ?? M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE;
    return Object.freeze({
        patternId: `atelier-return::${claim.claimId}`,
        recognizedArchetype: options.recognizedArchetype ?? 'jiva-is-siva',
        m0AnchorCoordinate,
        // Ground in the canonical BEDROCK archetypal link, NOT the M4
        // protected-local source handle — pedagogy is the archetype, not the body.
        provenanceHandle: claim.bedrockLinkHandle,
        sourceRecognitionClaimId: claim.claimId,
        sourceClass: claim.sourceClass,
        atelierRoute: ATELIER_RETURN_ROUTE
    });
}

/**
 * Offer the M5 → M0 pedagogical return. Crystallizes the recognized claim,
 * verifies the anchor names an *existing* M0 canon node (no fabrication), builds
 * the M0-5' deep-link, and returns the read-only offering plus an
 * `m0.graph.provenance` event. The supplied canon view is never written to —
 * the result reports node count before/after so callers can assert immutability.
 */
export function offerPedagogicalReturn(
    claim: JivaSivaRecognitionClaim,
    canon: ReadOnlyM0CanonView,
    options: PedagogicalReturnOptions = {}
): PedagogicalReturnResult {
    const offeredAt = options.offeredAt ?? Date.now();
    const nodeCountBefore = canon.nodeCount;

    let pattern: AtelierCrystallizedPattern;
    try {
        pattern = crystallizeRecognitionThroughAtelier(claim, options);
    } catch (err) {
        if (err instanceof PedagogicalReturnError) {
            return rejected(claim, offeredAt, err.reason, nodeCountBefore);
        }
        throw err;
    }

    // Anchored to M0 nodes: the offering may only point at canon that already
    // exists. A missing anchor is refused rather than silently fabricated —
    // that would be a back-door canon mutation.
    if (!canon.has(pattern.m0AnchorCoordinate)) {
        return rejected(
            claim,
            offeredAt,
            `M0 anchor "${pattern.m0AnchorCoordinate}" is not an existing canon node; ` +
            `pedagogical return may not fabricate canon`,
            nodeCountBefore
        );
    }

    const deepLink = formatIntegratedDeepLink({
        routeName: 'jiva-siva',
        selectedCoordinate: pattern.m0AnchorCoordinate,
        profileGeneration: options.profileGeneration ?? null,
        s3SessionHandle: null,
        s3DayNowHandle: null,
        privacyScope: PEDAGOGY_PRIVACY_SCOPE,
        intendedInspector: PEDAGOGY_DEEP_LINK_INSPECTOR
    });

    const offering: PedagogicalReturnOffering = Object.freeze({
        offeringId: `pedagogy::${pattern.patternId}`,
        recognizedArchetype: pattern.recognizedArchetype,
        m0AnchorCoordinate: pattern.m0AnchorCoordinate,
        pedagogyLayerCoordinate: M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE,
        provenanceHandle: pattern.provenanceHandle,
        sourceRecognitionClaimId: pattern.sourceRecognitionClaimId,
        atelierRoute: pattern.atelierRoute,
        deepLink,
        privacyScope: PEDAGOGY_PRIVACY_SCOPE,
        readOnly: true,
        canonMutation: false,
        offeredAt
    });

    return Object.freeze({
        status: 'offered',
        offering,
        canonNodeCountBefore: nodeCountBefore,
        // The canon view is read-only; we re-read its count to prove the offer
        // path touched nothing.
        canonNodeCountAfter: canon.nodeCount,
        event: Object.freeze({
            type: M0_PEDAGOGY_PROVENANCE_EVENT_TYPE,
            extensionId: 'm0-anuttara',
            emittedAt: offeredAt,
            payload: Object.freeze({
                pedagogyLayerCoordinate: M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE,
                m0AnchorCoordinate: pattern.m0AnchorCoordinate,
                recognizedArchetype: pattern.recognizedArchetype,
                atelierRoute: pattern.atelierRoute,
                deepLink,
                sourceRecognitionClaimId: pattern.sourceRecognitionClaimId,
                privacyScope: PEDAGOGY_PRIVACY_SCOPE,
                canonMutation: false,
                readOnly: true
            })
        })
    });
}

function rejected(
    claim: JivaSivaRecognitionClaim,
    offeredAt: number,
    reason: string,
    nodeCountBefore: number
): PedagogicalReturnResult {
    return Object.freeze({
        status: 'rejected',
        reason,
        event: Object.freeze({
            type: M0_PEDAGOGY_PROVENANCE_EVENT_TYPE,
            extensionId: 'm0-anuttara',
            emittedAt: offeredAt,
            payload: Object.freeze({
                pedagogyLayerCoordinate: M0_5_PRIME_RECOGNITION_CLOSURE_COORDINATE,
                atelierRoute: ATELIER_RETURN_ROUTE,
                sourceRecognitionClaimId: claim.claimId,
                reason,
                canonMutation: false,
                readOnly: true,
                canonNodeCount: nodeCountBefore
            })
        })
    });
}
