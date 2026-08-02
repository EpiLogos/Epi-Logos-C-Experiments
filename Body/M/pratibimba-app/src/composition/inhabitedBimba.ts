/**
 * Coordinate: M' integrated 1-2-3 ∘ 4-5-0 (Inhabited Bimba overlay — 29.T29.16)
 * Residency: Body/M/pratibimba-app/src/composition/inhabitedBimba.ts
 * Actualises: the live-entity field over the Bimba map WITHOUT making live
 *   state canonical. The overlay consumes `s3'.being_pattern.subscribe`
 *   (CCT-21's producer, 16.T16.21), drops stale generations per the 18.10
 *   consumption law, classifies each public-safe entity into its VISUAL LAW
 *   state (the many render as many; `PotentiallyOne` a suggested contour;
 *   `ActualisingOne` a review warning; `MonoPoly` a held many-in-one only
 *   when verified), and carries the four 29.16 readiness blockers on its own
 *   envelope — the 24.9 precedent: the field still renders when blocked,
 *   because hiding it would destroy the evidence.
 * Public surface: INHABITED_BIMBA_SUBSCRIBE_METHOD, InhabitedBimbaBlockerId,
 *   INHABITED_BIMBA_BLOCKER_IDS, InhabitedBimbaEntityMarker,
 *   InhabitedBimbaRead, entityMarkerLaw, readInhabitedBimba,
 *   guardGraphitiRefs.
 * Does NOT own: the producer (Body/S/S3/gateway/src/being_pattern.rs), the
 *   stream parse (panes/beingPattern/beingPatternProjection.ts — ONE parser,
 *   reused), canon promotion (M5/M0 only — `s2Mutated` is repeated verbatim,
 *   never overridden), or the clock-field geometry (engine/clockFieldOverlay).
 */

import {
    parseBeingPatternStream,
    type BeingPatternProjectionView,
    type BeingPatternStreamView
} from '../panes/beingPattern/beingPatternProjection';

export const INHABITED_BIMBA_SUBSCRIBE_METHOD = "s3'.being_pattern.subscribe";

/** The four 29.16 readiness blockers. IDS ARE LAW (the tranche brief names
 *  them); their HOME is the overlay's own envelope because the composition
 *  blocker registry (29.5) only admits wave-a-marker / slot-contributor
 *  backings — stream readiness is this surface's own fact to carry. */
export type InhabitedBimbaBlockerId =
    | 'pending-pasu-being-pattern'
    | 'pending-spacetime-live-state'
    | 'pending-monopoly-operator'
    | 'pending-perspective-role';

export const INHABITED_BIMBA_BLOCKER_IDS: readonly InhabitedBimbaBlockerId[] = Object.freeze([
    'pending-pasu-being-pattern',
    'pending-spacetime-live-state',
    'pending-monopoly-operator',
    'pending-perspective-role'
]);

/** The visual law (29.16 brief, verbatim classes). */
export type InhabitedMarkerLaw =
    | 'many' // Poly / ActuallyMany co-exist around the clock, never clustered
    | 'suggested-contour' // PotentiallyOne
    | 'review-warning' // ActualisingOne — a review candidate, never canon
    | 'held-one' // MonoPoly, verified
    | 'unresolved'; // operator absent/unknown — a blocker, not a guess

export function entityMarkerLaw(entity: BeingPatternProjectionView): InhabitedMarkerLaw {
    switch (entity.monopolyOperator) {
        case 'Poly':
        case 'ActuallyMany':
            return 'many';
        case 'PotentiallyOne':
            return 'suggested-contour';
        case 'ActualisingOne':
            return 'review-warning';
        case 'MonoPoly':
            return 'held-one';
        default:
            return 'unresolved';
    }
}

export interface InhabitedBimbaEntityMarker {
    readonly entityId: string;
    readonly law: InhabitedMarkerLaw;
    readonly perspectiveRole: string;
    /** Degree position on the Earth-centred clock, or null (renders at the
     *  field margin rather than inventing an address). */
    readonly clockDegree: number | null;
    readonly reviewRisk: string;
    readonly relationEdgeCount: number;
}

export interface InhabitedBimbaRead {
    readonly state: 'read' | 'pending' | 'refused';
    readonly reason: string | null;
    readonly generation: number | null;
    /** The producer's own honesty string, repeated verbatim. */
    readonly source: string | null;
    readonly markers: readonly InhabitedBimbaEntityMarker[];
    readonly relationEdgeTotal: number;
    readonly blockers: readonly InhabitedBimbaBlockerId[];
    /** Canon boundary, verbatim from the producer — never overridden. */
    readonly s2Mutated: boolean | null;
}

const EMPTY: Omit<InhabitedBimbaRead, 'state' | 'reason'> = {
    generation: null,
    source: null,
    markers: [],
    relationEdgeTotal: 0,
    blockers: [],
    s2Mutated: null
};

/**
 * The 18.10 consumption law + the 29.16 readiness law over one subscribe
 * reply. `lastGeneration` is the newest generation this consumer has already
 * rendered: an OLDER reply is dropped (state `pending`, reason names the
 * staleness) rather than rewinding the field.
 */
export function readInhabitedBimba(
    artifact: unknown,
    lastGeneration: number | null,
    profilePasuBeingPattern: unknown
): InhabitedBimbaRead {
    const parsed = parseBeingPatternStream(artifact);
    if (parsed.kind === 'refused') {
        // The ONE parser refuses a defaulted operator/role outright (its own
        // law), so those two 29.16 blockers surface here — on the refusal —
        // rather than as per-entity scans a refused stream can never reach.
        const blockers: InhabitedBimbaBlockerId[] = [];
        if (parsed.reason.includes('monopolyOperator')) {
            blockers.push('pending-monopoly-operator');
        }
        if (parsed.reason.toLowerCase().includes('perspectiverole')) {
            blockers.push('pending-perspective-role');
        }
        return { state: 'refused', reason: parsed.reason, ...EMPTY, blockers: Object.freeze(blockers) };
    }
    const stream: BeingPatternStreamView = parsed.stream;
    if (
        stream.generation !== null &&
        lastGeneration !== null &&
        stream.generation < lastGeneration
    ) {
        return {
            state: 'pending',
            reason: `stale generation ${stream.generation} < ${lastGeneration} — dropped per the 18.10 law`,
            ...EMPTY,
            generation: stream.generation
        };
    }

    const blockers: InhabitedBimbaBlockerId[] = [];
    // 18.10: the M4 consumer's profile handle. Its absence does not hide the
    // cosmic field — it marks the personal pass-through pending.
    if (profilePasuBeingPattern === null || profilePasuBeingPattern === undefined) {
        blockers.push('pending-pasu-being-pattern');
    }
    // The producer says which live-state substrate backs the stream; a null
    // delta key means no SpaceTimeDB/Redis live-state handle yet.
    if (stream.streamDeltaKey === null) {
        blockers.push('pending-spacetime-live-state');
    }


    const markers = stream.entities.map(
        (entity): InhabitedBimbaEntityMarker =>
            Object.freeze({
                entityId: entity.entityId,
                law: entityMarkerLaw(entity),
                perspectiveRole: entity.perspectiveRole,
                clockDegree:
                    entity.clockAddress && typeof entity.clockAddress.degree360 === 'number'
                        ? entity.clockAddress.degree360
                        : null,
                reviewRisk: entity.reviewRisk,
                relationEdgeCount: entity.relationEdges.length
            })
    );

    return {
        state: 'read',
        reason: null,
        generation: stream.generation,
        source: stream.source,
        markers: Object.freeze(markers),
        relationEdgeTotal: stream.entities.reduce(
            (total, entity) => total + entity.relationEdges.length,
            0
        ),
        blockers: Object.freeze(blockers),
        s2Mutated: stream.s2Mutated
    };
}

/**
 * Graphiti source guard (29.16): episodic provenance stays HANDLES. Built
 * field-by-field (the dreamJournal law — a spread that gained a field later
 * would leak it): anything that does not look like a protected episode
 * reference is DROPPED, and prose can never ride along.
 */
export function guardGraphitiRefs(values: readonly unknown[]): readonly string[] {
    const guarded: string[] = [];
    for (const value of values) {
        if (typeof value !== 'string') {
            continue;
        }
        const trimmed = value.trim();
        // A handle is a compact, spaceless reference — an episode BODY has
        // spaces; refusing whitespace refuses prose wholesale.
        if (trimmed.length === 0 || trimmed.length > 256 || /\s/.test(trimmed)) {
            continue;
        }
        guarded.push(trimmed);
    }
    return Object.freeze(guarded);
}
