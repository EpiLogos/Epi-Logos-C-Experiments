import type {
    MObservabilityEvent,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';

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
    'composition.being_pattern.observed',
    'composition.being_pattern.projected',
    'composition.being_pattern.relation_edge',
    'composition.being_pattern.review_candidate',
    'composition.juxtaposition.rejected',
    'composition.slot.blocked',
    'composition.slot.recovered'
] as const;

export type CompositionEventType = typeof COMPOSITION_EVENT_TYPES[number];

export type CompositionEventCompositionId =
    | 'cosmic-engine.integrated'
    | 'jiva-siva.integrated';

export interface CompositionEvent {
    readonly type: CompositionEventType;
    readonly compositionId: CompositionEventCompositionId;
    readonly timestamp: string;
    readonly profileGeneration: number | null;
    readonly payload: Readonly<Record<string, unknown>>;
}

export const COMPOSITION_OBSERVABILITY_EXTENSION_ID = 'integrated-composition';

export function isCompositionEventType(type: string): type is CompositionEventType {
    return (COMPOSITION_EVENT_TYPES as readonly string[]).includes(type);
}

export type BeingPatternStreamEventKind =
    | 'EntityObserved'
    | 'BeingPatternProjected'
    | 'PerspectiveRoleResolved'
    | 'MonoPolyOperatorResolved'
    | 'ClockAddressUpdated'
    | 'AspectEdgeComputed'
    | 'ElementalResonanceChanged'
    | 'PatternPacketFormed'
    | 'ReviewCandidateEmitted';

export function beingPatternCompositionEventTypeFromStreamKind(
    kind: BeingPatternStreamEventKind | string
): Extract<
    CompositionEventType,
    | 'composition.being_pattern.observed'
    | 'composition.being_pattern.projected'
    | 'composition.being_pattern.relation_edge'
    | 'composition.being_pattern.review_candidate'
> {
    switch (kind) {
        case 'EntityObserved':
            return 'composition.being_pattern.observed';
        case 'AspectEdgeComputed':
        case 'ElementalResonanceChanged':
            return 'composition.being_pattern.relation_edge';
        case 'ReviewCandidateEmitted':
            return 'composition.being_pattern.review_candidate';
        case 'BeingPatternProjected':
        case 'PerspectiveRoleResolved':
        case 'MonoPolyOperatorResolved':
        case 'ClockAddressUpdated':
        case 'PatternPacketFormed':
            return 'composition.being_pattern.projected';
        default:
            throw new Error(`Unknown BeingPattern stream event kind: ${kind}`);
    }
}

export function compositionEventToObservabilityEvent(
    event: CompositionEvent
): MObservabilityEvent {
    if (!isCompositionEventType(event.type)) {
        throw new Error(`Unknown composition event type: ${event.type}`);
    }

    const emittedAt = Date.parse(event.timestamp);
    if (!Number.isFinite(emittedAt)) {
        throw new Error(`Invalid composition event timestamp: ${event.timestamp}`);
    }

    return Object.freeze({
        type: event.type,
        extensionId: COMPOSITION_OBSERVABILITY_EXTENSION_ID,
        emittedAt,
        payload: Object.freeze({
            ...event.payload,
            compositionId: event.compositionId,
            timestamp: event.timestamp,
            profileGeneration: event.profileGeneration
        })
    });
}

export function emitCompositionEvent(
    bridge: SharedBridgeAdapter,
    event: CompositionEvent
): void {
    bridge.publish(compositionEventToObservabilityEvent(event));
}
