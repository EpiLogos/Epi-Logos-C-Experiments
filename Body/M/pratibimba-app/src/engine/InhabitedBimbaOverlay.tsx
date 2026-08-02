/**
 * Coordinate: M' integrated 1-2-3 (Inhabited Bimba cosmic overlay — 29.T29.16)
 * Actualises: the live-entity markers over the Earth-centred solar/clock
 *   field — public-safe `PasuBeingPatternProjection` entities from the
 *   CCT-21 stream, rendered as a polar DOM layer over the wheel: the many
 *   as MANY (never clustered into one symbolic object), `PotentiallyOne` a
 *   suggested contour, `ActualisingOne` a review warning, `MonoPoly` a held
 *   one. Emits the four `composition.being_pattern.*` events on accepted
 *   reads and carries the 29.16 blockers + the canon boundary (`s2Mutated`
 *   verbatim) on its own envelope. Registered in
 *   `tests/e2e/visual-regression.hide.css` as a LIVE region — hidden at
 *   screenshot time like every other live-wire surface.
 */

import { useEffect, useRef, useState } from 'react';
import './inhabitedBimbaOverlay.css';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { useTickStore } from '../state/stores';
import { emitCompositionEvent } from '../composition/compositionEvents';
import {
    INHABITED_BIMBA_SUBSCRIBE_METHOD,
    guardGraphitiRefs,
    readInhabitedBimba,
    type InhabitedBimbaRead
} from '../composition/inhabitedBimba';

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in (receipt as object)) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

const PENDING: InhabitedBimbaRead = {
    state: 'pending',
    reason: 'awaiting the being-pattern stream',
    generation: null,
    source: null,
    markers: [],
    relationEdgeTotal: 0,
    blockers: [],
    s2Mutated: null
};

/** Polar placement: percentage offsets around the wheel centre. */
function polarStyle(clockDegree: number | null, index: number): Record<string, string> {
    // An address-less entity sits at the field margin (top arc), never at an
    // invented degree.
    const angle =
        clockDegree === null
            ? -90 + index * 14
            : clockDegree - 90; // degree 0 = 12 o'clock, clockwise
    const radians = (angle * Math.PI) / 180;
    const radius = clockDegree === null ? 47 : 38;
    return {
        left: `${50 + radius * Math.cos(radians)}%`,
        top: `${50 + radius * Math.sin(radians)}%`
    };
}

export function InhabitedBimbaOverlay() {
    const cached = useTickStore(state => state.profile);
    const [read, setRead] = useState<InhabitedBimbaRead>(PENDING);
    const lastGenerationRef = useRef<number | null>(null);
    const previousRef = useRef<InhabitedBimbaRead>(PENDING);

    const generation = cached?.generation ?? null;
    // Whole-window key (the 25.7 cancel-livelock law): re-subscribe every
    // few ticks, latest-wins, never cancel an in-flight read per tick.
    const windowKey = generation === null ? null : Math.floor(generation / 5);

    useEffect(() => {
        let superseded = false;
        if (!gatewayReady()) {
            setRead({ ...PENDING, reason: `${INHABITED_BIMBA_SUBSCRIBE_METHOD}: gateway not connected` });
            return;
        }
        const profile = (cached?.profile ?? null) as { harmonicProfile?: Record<string, unknown> } | null;
        const root = profile?.harmonicProfile ?? (profile as Record<string, unknown> | null);
        const pasuHandle = root && typeof root === 'object' ? (root as Record<string, unknown>).pasuBeingPattern : null;
        gateway()
            .invoke(INHABITED_BIMBA_SUBSCRIBE_METHOD, {})
            .then(receipt => {
                if (superseded) {
                    return;
                }
                const next = readInhabitedBimba(
                    artifactOf(receipt),
                    lastGenerationRef.current,
                    pasuHandle ?? null
                );
                if (next.state === 'read') {
                    lastGenerationRef.current = next.generation;
                    const previous = previousRef.current;
                    const stamp = {
                        compositionId: 'cosmic-engine.integrated' as const,
                        timestamp: new Date().toISOString(),
                        profileGeneration: generation
                    };
                    if (next.markers.length > previous.markers.length) {
                        emitCompositionEvent({
                            ...stamp,
                            type: 'composition.being_pattern.observed',
                            payload: { entities: next.markers.length, source: next.source }
                        });
                    }
                    const projectedNow = next.markers.filter(m => m.clockDegree !== null).length;
                    const projectedBefore = previous.markers.filter(m => m.clockDegree !== null).length;
                    if (projectedNow > projectedBefore) {
                        emitCompositionEvent({
                            ...stamp,
                            type: 'composition.being_pattern.projected',
                            payload: { projected: projectedNow }
                        });
                    }
                    if (next.relationEdgeTotal > previous.relationEdgeTotal) {
                        emitCompositionEvent({
                            ...stamp,
                            type: 'composition.being_pattern.relation_edge',
                            payload: { relationEdges: next.relationEdgeTotal }
                        });
                    }
                    const risky = next.markers.filter(m => m.reviewRisk !== 'none').length;
                    const riskyBefore = previous.markers.filter(m => m.reviewRisk !== 'none').length;
                    if (risky > riskyBefore) {
                        emitCompositionEvent({
                            ...stamp,
                            type: 'composition.being_pattern.review_candidate',
                            payload: { reviewCandidates: risky }
                        });
                    }
                    previousRef.current = next;
                }
                setRead(next);
            })
            .catch((error: unknown) => {
                if (!superseded) {
                    setRead({
                        ...PENDING,
                        reason: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        return () => {
            superseded = true;
        };
    }, [windowKey]);

    return (
        <div
            className="inhabited-bimba-overlay"
            data-testid="inhabited-bimba-overlay"
            data-state={read.state}
            data-generation={read.generation ?? ''}
            data-source={read.source ?? ''}
            data-marker-count={read.markers.length}
            data-relation-edges={read.relationEdgeTotal}
            data-blockers={read.blockers.join(',')}
            data-s2-mutated={read.s2Mutated === null ? '' : String(read.s2Mutated)}
            // The guard is structural: only handle-shaped strings survive it,
            // and this attribute is the ONLY graphiti-adjacent surface here.
            data-graphiti-refs={guardGraphitiRefs([read.source ?? '']).length}
        >
            {read.markers.map((marker, index) => (
                <span
                    key={marker.entityId}
                    className={`inhabited-bimba-marker inhabited-law-${marker.law}`}
                    data-testid={`inhabited-marker-${marker.entityId}`}
                    data-law={marker.law}
                    data-perspective={marker.perspectiveRole}
                    data-clock-degree={marker.clockDegree ?? ''}
                    data-review-risk={marker.reviewRisk}
                    title={`${marker.entityId} · ${marker.perspectiveRole} · ${marker.law}`}
                    style={polarStyle(marker.clockDegree, index)}
                />
            ))}
        </div>
    );
}
