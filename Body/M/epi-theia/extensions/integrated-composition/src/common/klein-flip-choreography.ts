import type {
    Disposable,
    MathemeHarmonicProfileBoundary,
    MObservabilityEvent,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import { emitCompositionEvent } from './composition-events';

export const KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS = 200;

export const KLEIN_FLIP_EVENT_VARIANTS = [
    'M1TritoneCrossing',
    'M2CymaticValenceInvert',
    'M3CodonRotationCross'
] as const;

export type KleinFlipEventVariant = typeof KLEIN_FLIP_EVENT_VARIANTS[number];

interface KleinFlipEventBase {
    readonly variant: KleinFlipEventVariant;
    readonly tick12: number | null;
    readonly fromTick: number | null;
    readonly toTick: number | null;
    readonly profileGeneration: number | null;
    readonly emittedAtMs: number;
    readonly payload: Readonly<Record<string, unknown>>;
}

export interface M1TritoneCrossingKleinFlipEvent extends KleinFlipEventBase {
    readonly variant: 'M1TritoneCrossing';
    readonly lensPair: readonly [number, number] | null;
}

export interface M2CymaticValenceInvertKleinFlipEvent extends KleinFlipEventBase {
    readonly variant: 'M2CymaticValenceInvert';
    readonly valenceBefore: string | null;
    readonly valenceAfter: string | null;
}

export interface M3CodonRotationCrossKleinFlipEvent extends KleinFlipEventBase {
    readonly variant: 'M3CodonRotationCross';
    readonly codonBefore: number | null;
    readonly codonAfter: number | null;
}

export type KleinFlipEvent =
    | M1TritoneCrossingKleinFlipEvent
    | M2CymaticValenceInvertKleinFlipEvent
    | M3CodonRotationCrossKleinFlipEvent;

export interface KleinFlipChoreographyRequest {
    readonly durationMs: number;
}

export interface K2SurfaceHandle {
    readonly requestFold: (request: KleinFlipChoreographyRequest) => void;
}

export interface CymaticMountPoint {
    readonly requestValenceInvert: (request: KleinFlipChoreographyRequest) => void;
}

export interface CodonRotationExport {
    readonly requestAxisFlip: (request: KleinFlipChoreographyRequest) => void;
}

export interface CompositionChoreographyDirector {
    readonly start: (event: KleinFlipEvent) => void;
    readonly registerK2Handle: (handle: K2SurfaceHandle) => void;
    readonly registerCymaticMount: (mount: CymaticMountPoint) => void;
    readonly registerCodonRotation: (rotation: CodonRotationExport) => void;
    readonly dispose: () => void;
}

export function openChoreographyDirector(
    bridge: SharedBridgeAdapter
): CompositionChoreographyDirector {
    return new SharedBridgeCompositionChoreographyDirector(bridge);
}

class SharedBridgeCompositionChoreographyDirector implements CompositionChoreographyDirector {
    private readonly k2Handles = new Set<K2SurfaceHandle>();
    private readonly cymaticMounts = new Set<CymaticMountPoint>();
    private readonly codonRotations = new Set<CodonRotationExport>();
    private readonly subscriptions: Disposable[] = [];
    private readonly completionTimers: ReturnType<typeof setTimeout>[] = [];
    private readonly seenEventKeys: string[] = [];
    private disposed = false;

    constructor(private readonly bridge: SharedBridgeAdapter) {
        this.subscriptions.push(
            bridge.onProfile(profile => {
                const event = kleinFlipEventFromProfile(profile, Date.now());
                if (event) {
                    this.start(event);
                }
            })
        );
        this.subscriptions.push(
            bridge.onObservabilityEvent(event => {
                const kleinFlip = kleinFlipEventFromObservabilityEvent(event, Date.now());
                if (kleinFlip) {
                    this.start(kleinFlip);
                }
            })
        );
    }

    start(event: KleinFlipEvent): void {
        if (this.disposed || !isTickFiveToSixKleinFlipEvent(event)) {
            return;
        }
        const eventKey = choreographyEventKey(event);
        if (this.hasSeenEvent(eventKey)) {
            return;
        }
        this.rememberEvent(eventKey);

        queueMicrotask(() => {
            if (this.disposed) {
                return;
            }

            this.emitChoreographyEvent('composition.kleinflip.choreography.start', event);
            const request = Object.freeze({
                durationMs: KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS
            });

            dispatchKleinFlipVariant(event, {
                request,
                k2Handles: this.k2Handles,
                cymaticMounts: this.cymaticMounts,
                codonRotations: this.codonRotations
            });

            const timer = setTimeout(() => {
                this.removeCompletionTimer(timer);
                if (!this.disposed) {
                    this.emitChoreographyEvent('composition.kleinflip.choreography.end', {
                        ...event,
                        emittedAtMs: event.emittedAtMs + KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS
                    });
                }
            }, KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS);
            this.completionTimers.push(timer);
        });
    }

    registerK2Handle(handle: K2SurfaceHandle): void {
        this.k2Handles.add(handle);
    }

    registerCymaticMount(mount: CymaticMountPoint): void {
        this.cymaticMounts.add(mount);
    }

    registerCodonRotation(rotation: CodonRotationExport): void {
        this.codonRotations.add(rotation);
    }

    dispose(): void {
        this.disposed = true;
        for (const subscription of this.subscriptions.splice(0)) {
            subscription.dispose();
        }
        for (const timer of this.completionTimers.splice(0)) {
            clearTimeout(timer);
        }
        this.k2Handles.clear();
        this.cymaticMounts.clear();
        this.codonRotations.clear();
        this.seenEventKeys.splice(0);
    }

    private emitChoreographyEvent(
        type:
            | 'composition.kleinflip.choreography.start'
            | 'composition.kleinflip.choreography.end',
        event: KleinFlipEvent
    ): void {
        emitCompositionEvent(this.bridge, {
            type,
            compositionId: 'cosmic-engine.integrated',
            timestamp: new Date(event.emittedAtMs).toISOString(),
            profileGeneration: event.profileGeneration,
            payload: Object.freeze({
                choreography: 'klein-flip-three-pole',
                durationMs: KLEIN_FLIP_CHOREOGRAPHY_DURATION_MS,
                kleinFlipVariant: event.variant,
                tick12: event.tick12,
                fromTick: event.fromTick,
                toTick: event.toTick,
                sourcePayload: event.payload
            })
        });
    }

    private hasSeenEvent(eventKey: string): boolean {
        return this.seenEventKeys.includes(eventKey);
    }

    private rememberEvent(eventKey: string): void {
        this.seenEventKeys.push(eventKey);
        if (this.seenEventKeys.length > 64) {
            this.seenEventKeys.shift();
        }
    }

    private removeCompletionTimer(timer: ReturnType<typeof setTimeout>): void {
        const index = this.completionTimers.indexOf(timer);
        if (index >= 0) {
            this.completionTimers.splice(index, 1);
        }
    }
}

function kleinFlipEventFromProfile(
    profile: MathemeHarmonicProfileBoundary | null,
    receivedAtMs: number
): KleinFlipEvent | null {
    if (!profile) {
        return null;
    }
    const raw = recordValue(profile.payload.kleinFlip ?? profile.payload.klein_flip);
    if (!raw) {
        return null;
    }
    return normalizeKleinFlipEvent(raw, {
        profileGeneration: profile.generation,
        emittedAtMs: receivedAtMs,
        tick12: numberValue(
            raw.tick12 ?? raw.tick_12 ?? profile.payload.tick12 ?? recordValue(profile.payload.tickAddress)?.tick12
        ),
        fallbackPayload: profile.payload
    });
}

function kleinFlipEventFromObservabilityEvent(
    event: MObservabilityEvent,
    receivedAtMs: number
): KleinFlipEvent | null {
    if (!isKleinFlipBusEventType(event.type)) {
        return null;
    }
    const raw =
        recordValue(event.payload.kleinFlip ?? event.payload.klein_flip) ??
        recordValue(event.payload);
    if (!raw) {
        return null;
    }
    return normalizeKleinFlipEvent(raw, {
        profileGeneration: numberValue(event.payload.profileGeneration),
        emittedAtMs: event.emittedAt || receivedAtMs,
        tick12: numberValue(raw.tick12 ?? raw.tick_12 ?? event.payload.tick12),
        fallbackPayload: event.payload
    });
}

function normalizeKleinFlipEvent(
    raw: Readonly<Record<string, unknown>>,
    fallback: {
        readonly profileGeneration: number | null;
        readonly emittedAtMs: number;
        readonly tick12: number | null;
        readonly fallbackPayload: Readonly<Record<string, unknown>>;
    }
): KleinFlipEvent | null {
    const variant = normalizeVariant(raw.variant ?? raw.kind ?? raw.type);
    if (!variant) {
        return null;
    }

    const base = {
        tick12: fallback.tick12,
        fromTick: numberValue(raw.fromTick ?? raw.from_tick ?? raw.tickFrom ?? raw.tick_from),
        toTick: numberValue(raw.toTick ?? raw.to_tick ?? raw.tickTo ?? raw.tick_to),
        profileGeneration: fallback.profileGeneration,
        emittedAtMs: fallback.emittedAtMs,
        payload: Object.freeze({
            ...fallback.fallbackPayload,
            kleinFlip: Object.freeze({ ...raw })
        })
    };

    switch (variant) {
        case 'M1TritoneCrossing':
            return Object.freeze({
                ...base,
                variant,
                lensPair: pairValue(raw.lensPair ?? raw.lens_pair)
            });
        case 'M2CymaticValenceInvert':
            return Object.freeze({
                ...base,
                variant,
                valenceBefore: stringValue(raw.valenceBefore ?? raw.valence_before),
                valenceAfter: stringValue(raw.valenceAfter ?? raw.valence_after)
            });
        case 'M3CodonRotationCross':
            return Object.freeze({
                ...base,
                variant,
                codonBefore: numberValue(raw.codonBefore ?? raw.codon_before),
                codonAfter: numberValue(raw.codonAfter ?? raw.codon_after)
            });
        default:
            return assertNever(variant);
    }
}

function normalizeVariant(value: unknown): KleinFlipEventVariant | null {
    switch (stringValue(value)) {
        case 'M1TritoneCrossing':
        case 'm1TritoneCrossing':
        case 'm1.tritone.crossing':
            return 'M1TritoneCrossing';
        case 'M2ValenceInvert':
        case 'M2CymaticValenceInvert':
        case 'm2CymaticValenceInvert':
        case 'm2.cymatic.valence.invert':
            return 'M2CymaticValenceInvert';
        case 'M3CodonRotationCross':
        case 'm3CodonRotationCross':
        case 'm3.codon.rotation.cross':
            return 'M3CodonRotationCross';
        default:
            return null;
    }
}

function isTickFiveToSixKleinFlipEvent(event: KleinFlipEvent): boolean {
    if (event.fromTick !== null || event.toTick !== null) {
        return event.fromTick === 5 && event.toTick === 6;
    }
    return event.tick12 === 6;
}

function isKleinFlipBusEventType(type: string): boolean {
    return (
        type === 'm1.klein_flip.source' ||
        type === 'm2.klein_flip' ||
        type === 'kernel.profile.klein_flip' ||
        type === 'matheme.profile.klein_flip'
    );
}

function choreographyEventKey(event: KleinFlipEvent): string {
    return [
        event.profileGeneration ?? 'generation?',
        event.variant,
        event.fromTick ?? 'from?',
        event.toTick ?? 'to?',
        event.tick12 ?? 'tick?'
    ].join(':');
}

function dispatchKleinFlipVariant(
    event: KleinFlipEvent,
    handles: {
        readonly request: KleinFlipChoreographyRequest;
        readonly k2Handles: ReadonlySet<K2SurfaceHandle>;
        readonly cymaticMounts: ReadonlySet<CymaticMountPoint>;
        readonly codonRotations: ReadonlySet<CodonRotationExport>;
    }
): void {
    switch (event.variant) {
        case 'M1TritoneCrossing':
        case 'M2CymaticValenceInvert':
        case 'M3CodonRotationCross':
            dispatchAllHandles(handles);
            return;
        default:
            assertNever(event);
    }
}

function dispatchAllHandles(handles: {
    readonly request: KleinFlipChoreographyRequest;
    readonly k2Handles: ReadonlySet<K2SurfaceHandle>;
    readonly cymaticMounts: ReadonlySet<CymaticMountPoint>;
    readonly codonRotations: ReadonlySet<CodonRotationExport>;
}): void {
    for (const handle of handles.k2Handles) {
        handle.requestFold(handles.request);
    }
    for (const mount of handles.cymaticMounts) {
        mount.requestValenceInvert(handles.request);
    }
    for (const rotation of handles.codonRotations) {
        rotation.requestAxisFlip(handles.request);
    }
}

function pairValue(value: unknown): readonly [number, number] | null {
    if (!Array.isArray(value) || value.length !== 2) {
        return null;
    }
    const first = numberValue(value[0]);
    const second = numberValue(value[1]);
    return first === null || second === null ? null : Object.freeze([first, second] as const);
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function assertNever(value: never): never {
    throw new Error(`Unhandled KleinFlipEvent variant: ${String(value)}`);
}
