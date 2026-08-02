/**
 * Coordinate: M' integrated composition observability (29.T29.11)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): shared event vocabulary and existing-ring adapter
 * Actualises: fifteen typed composition events without another event bus
 *   (incl. 29.15's composition.pentadic_trace.advance).
 * Public surface: COMPOSITION_EVENT_TYPES, emitCompositionEvent,
 *   compositionEventsFromEntries, useCompositionLifecycleEvents,
 *   useCompositionPentadicTraceEvents.
 * Does NOT own: gateway events, dispatch genealogy, or composition state.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]].
 */

import { useEffect, useRef } from 'react';
import type { GatewayEventEntry } from '../state/eventsStore';
import { useEventsStore } from '../state/eventsStore';
import type { IntegratedCompositionId } from './compositionState';
import type { IntegratedPentadicTraceOverlay } from './integratedPentadicTrace';

export const COMPOSITION_EVENT_TYPES = [
    'composition.mount',
    'composition.unmount',
    'composition.kleinflip.choreography.start',
    'composition.kleinflip.choreography.end',
    'composition.mobius-return.composed',
    'composition.matrix-family.pin',
    'composition.codon-cell.select',
    'composition.lens-cell.select',
    'composition.sense.toggle',
    'composition.time-axis.switch',
    'composition.contemplation.complete',
    'composition.juxtaposition.rejected',
    'composition.slot.blocked',
    'composition.slot.recovered',
    'composition.pentadic_trace.advance',
    // 29.T29.16 — the Inhabited Bimba live entity field. Observed/projected
    // mirror the CCT-21 producer's own chain; relation_edge and
    // review_candidate carry counts and handles only (public-safe law).
    'composition.being_pattern.observed',
    'composition.being_pattern.projected',
    'composition.being_pattern.relation_edge',
    'composition.being_pattern.review_candidate'
] as const;

export type CompositionEventType = (typeof COMPOSITION_EVENT_TYPES)[number];

export interface CompositionEvent {
    readonly type: CompositionEventType;
    readonly compositionId: IntegratedCompositionId;
    readonly timestamp: string;
    readonly profileGeneration: number | null;
    readonly payload: Readonly<Record<string, unknown>>;
}

const EVENT_TYPES = new Set<CompositionEventType>(COMPOSITION_EVENT_TYPES);
const COMPOSITION_IDS = new Set<IntegratedCompositionId>([
    'cosmic-engine.integrated',
    'jiva-siva.integrated'
]);

export function emitCompositionEvent(event: CompositionEvent): void {
    useEventsStore.getState().push({
        kind: 'observability',
        emittedAtMs: Date.parse(event.timestamp),
        source: 'composition',
        profileGeneration: event.profileGeneration,
        privacyClass: 'public',
        payload: {
            event: event.type,
            compositionId: event.compositionId,
            timestamp: event.timestamp,
            profileGeneration: event.profileGeneration,
            payload: event.payload
        }
    });
}

function parseCompositionEntry(entry: GatewayEventEntry): CompositionEvent | null {
    if (!entry.channel || !EVENT_TYPES.has(entry.channel as CompositionEventType)) return null;
    if (!entry.payload || typeof entry.payload !== 'object' || Array.isArray(entry.payload)) return null;
    const raw = entry.payload as Record<string, unknown>;
    if (!COMPOSITION_IDS.has(raw.compositionId as IntegratedCompositionId)) return null;
    if (
        typeof raw.timestamp !== 'string' ||
        (raw.profileGeneration !== null &&
            (!Number.isSafeInteger(raw.profileGeneration) || (raw.profileGeneration as number) < 0)) ||
        !raw.payload ||
        typeof raw.payload !== 'object' ||
        Array.isArray(raw.payload)
    ) {
        return null;
    }
    return Object.freeze({
        type: entry.channel as CompositionEventType,
        compositionId: raw.compositionId as IntegratedCompositionId,
        timestamp: raw.timestamp,
        profileGeneration: raw.profileGeneration as number | null,
        payload: Object.freeze({ ...(raw.payload as Record<string, unknown>) })
    });
}

export function compositionEventsFromEntries(
    entries: readonly GatewayEventEntry[]
): readonly CompositionEvent[] {
    return Object.freeze(
        entries
            .map(parseCompositionEntry)
            .filter((event): event is CompositionEvent => event !== null)
            .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    );
}

export function useCompositionLifecycleEvents(
    compositionId: IntegratedCompositionId,
    profileGeneration: number | null
): void {
    const generationRef = useRef(profileGeneration);
    generationRef.current = profileGeneration;
    useEffect(() => {
        const lifecycle = (type: 'composition.mount' | 'composition.unmount') =>
            emitCompositionEvent({
                type,
                compositionId,
                timestamp: new Date().toISOString(),
                profileGeneration: generationRef.current,
                payload: Object.freeze({})
            });
        lifecycle('composition.mount');
        return () => lifecycle('composition.unmount');
    }, [compositionId]);
}

/**
 * 29.T29.15 — emit `composition.pentadic_trace.advance` when the pentadic-trace
 * GENERATION (the kernel trace tick) advances for a mounted composition. The
 * generation is read straight off the typed {@link IntegratedPentadicTraceOverlay}
 * envelope — never recomputed here — so the emit and the readiness aggregate
 * can never diverge. It fires ONLY on a real change (a new trace tick, or the
 * trace first arriving), never on an unchanged re-render, and never while the
 * trace is absent (`overlay === null`). The payload carries the new and prior
 * generation so a consumer can see the delta.
 */
export function useCompositionPentadicTraceEvents(
    compositionId: IntegratedCompositionId,
    overlay: IntegratedPentadicTraceOverlay | null,
    profileGeneration: number | null
): void {
    const previousRef = useRef<number | null>(null);
    const generationRef = useRef(profileGeneration);
    generationRef.current = profileGeneration;
    const traceGeneration = overlay?.generation ?? null;
    useEffect(() => {
        if (traceGeneration === null) {
            return; // trace absent — there is nothing to advance
        }
        const previousGeneration = previousRef.current;
        if (previousGeneration === traceGeneration) {
            return; // unchanged generation — a re-render/re-subscribe, not an advance
        }
        previousRef.current = traceGeneration;
        emitCompositionEvent({
            type: 'composition.pentadic_trace.advance',
            compositionId,
            timestamp: new Date().toISOString(),
            profileGeneration: generationRef.current,
            payload: Object.freeze({ traceGeneration, previousGeneration })
        });
    }, [compositionId, traceGeneration]);
}
