import * as React from 'react';
import type { Disposable, MathemeHarmonicProfileBoundary, SharedBridgeAdapter } from '@pratibimba/m-extension-runtime';

export type Quaternion = readonly [number, number, number, number];

export interface SlerpClockSnapshot {
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly slerpFraction: number;
    readonly kleinAtBoundary: boolean;
    readonly hopfFlagFlipped: boolean;
}

export interface SubscribeToProfileTickEvent {
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly intervalMs?: number;
    readonly tick12?: number;
    readonly position6?: number;
    readonly slerpFraction?: number;
    readonly kleinAtBoundary?: boolean;
    readonly hopfFlagFlipped?: boolean;
}

export interface SubscribeToProfileTickBridge {
    subscribeToProfileTick?(
        listener: (event: SubscribeToProfileTickEvent) => void
    ): Disposable | (() => void);
}

export interface SlerpChoreographyClockProps {
    readonly bridge?: (SharedBridgeAdapter & SubscribeToProfileTickBridge) | SubscribeToProfileTickBridge | null;
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly tick?: number;
    readonly totalTicks?: number;
    readonly label?: string;
    readonly className?: string;
    readonly children?: React.ReactNode;
}

export const SLERP_TICK_COUNT = 12;
export const SLERP_POSITION_COUNT = 6;
export const SLERP_ANGULAR_STEP_DEG = 30;
export const SLERP_KLEIN_BOUNDARY_TICK = 5;

export const RING_QUATERNION_LUT = Object.freeze([
    [1, 0, 0, 0],
    [0.9659258262890683, 0, 0.25881904510252074, 0],
    [0.8660254037844387, 0, 0.5, 0],
    [0.7071067811865476, 0, 0.7071067811865475, 0],
    [0.5, 0, 0.8660254037844386, 0],
    [0.25881904510252074, 0, 0.9659258262890683, 0],
    [0, 0, 1, 0],
    [-0.25881904510252063, 0, 0.9659258262890683, 0],
    [-0.5, 0, 0.8660254037844387, 0],
    [-0.7071067811865475, 0, 0.7071067811865476, 0],
    [-0.8660254037844387, 0, 0.5, 0],
    [-0.9659258262890682, 0, 0.258819045102521, 0]
] as readonly Quaternion[]);

const EMPTY_SLERP_CLOCK: SlerpClockSnapshot = Object.freeze({
    tick12: null,
    position6: null,
    slerpFraction: 0,
    kleinAtBoundary: false,
    hopfFlagFlipped: false
});

const SlerpClockContext = React.createContext<SlerpClockSnapshot>(EMPTY_SLERP_CLOCK);

export function useSlerpClock(): SlerpClockSnapshot {
    return React.useContext(SlerpClockContext);
}

export const SlerpChoreographyClock: React.FC<SlerpChoreographyClockProps> = ({
    bridge,
    profile,
    tick,
    totalTicks = SLERP_TICK_COUNT,
    label,
    className,
    children
}) => {
    const [snapshot, setSnapshot] = React.useState<SlerpClockSnapshot>(() =>
        profile ? slerpClockFromProfile(profile) : slerpClockFromTick(tick ?? null)
    );

    React.useEffect(() => {
        setSnapshot(profile ? slerpClockFromProfile(profile) : slerpClockFromTick(tick ?? null));
    }, [profile, tick]);

    React.useEffect(() => {
        if (!bridge) {
            return undefined;
        }

        const subscribeToProfileTick = bridge.subscribeToProfileTick;
        if (typeof subscribeToProfileTick === 'function') {
            const subscription = subscribeToProfileTick(event => {
                setSnapshot(slerpClockFromProfileTickEvent(event));
            });
            return disposeSubscription(subscription);
        }

        if ('onProfile' in bridge && typeof bridge.onProfile === 'function') {
            const subscription = bridge.onProfile(profileUpdate => {
                setSnapshot(slerpClockFromProfile(profileUpdate));
            });
            return () => subscription.dispose();
        }

        return undefined;
    }, [bridge]);

    const denominator = Math.max(1, totalTicks);
    const currentTick = snapshot.tick12 ?? 0;
    const progress = clampUnit((currentTick + snapshot.slerpFraction) / denominator);
    const rootClassName = className
        ? `epilogos-slerp-choreography-clock ${className}`
        : 'epilogos-slerp-choreography-clock';

    return (
        <SlerpClockContext.Provider value={snapshot}>
            <span
                className={rootClassName}
                data-slerp-progress={progress}
                data-tick12={snapshot.tick12 ?? 'pending'}
                data-position6={snapshot.position6 ?? 'pending'}
                data-klein-boundary={snapshot.kleinAtBoundary ? 'true' : 'false'}
                data-hopf-flag-flipped={snapshot.hopfFlagFlipped ? 'true' : 'false'}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={denominator}
                aria-valuenow={Math.max(0, Math.min(denominator, currentTick))}
                aria-label={label ?? 'Slerp choreography clock'}
                style={{
                    display: 'inline-grid',
                    gridTemplateColumns: children ? 'minmax(0, 1fr)' : '4rem auto',
                    gap: '0.5rem',
                    alignItems: 'center'
                }}
            >
                {children ?? (
                    <>
                        <span
                            aria-hidden="true"
                            style={{
                                height: '0.35rem',
                                background: `linear-gradient(90deg, var(--theia-progressBar-background) ${progress * 100}%, var(--theia-editorWidget-border) ${progress * 100}%)`
                            }}
                        />
                        <span>{label ?? `${currentTick}/${denominator}`}</span>
                    </>
                )}
            </span>
        </SlerpClockContext.Provider>
    );
};

export function slerpClockFromProfileTickEvent(event: SubscribeToProfileTickEvent): SlerpClockSnapshot {
    if (event.profile) {
        return mergeSlerpClock(slerpClockFromProfile(event.profile), event);
    }
    return mergeSlerpClock(EMPTY_SLERP_CLOCK, event);
}

export function slerpClockFromProfile(profile: MathemeHarmonicProfileBoundary | null | undefined): SlerpClockSnapshot {
    if (!profile) {
        return EMPTY_SLERP_CLOCK;
    }
    const payload = profile.payload;
    const rawTick = finiteNumber(payload.tick12 ?? recordValue(payload.tickAddress)?.tick12 ?? payload.tick);
    const tick12 = normalizedTick12(rawTick);
    const position6 = normalizedPosition6(
        finiteNumber(payload.position6 ?? recordValue(payload.tickAddress)?.position6),
        tick12
    );
    const anandaVortex = recordValue(payload.ananda_vortex ?? payload.anandaVortex);
    const slerpFraction = clampUnit(
        finiteNumber(payload.slerpFraction ?? recordValue(payload.tickProjection)?.slerpFraction) ??
            fractionalPart(rawTick)
    );
    const kleinAtBoundary =
        booleanValue(payload.kleinAtBoundary ?? recordValue(payload.tickProjection)?.isAtKleinBoundary) ??
        (tick12 === SLERP_KLEIN_BOUNDARY_TICK && slerpFraction > 0);
    const hopfFlagFlipped =
        booleanValue(
            payload.hopfFlagFlipped ??
                anandaVortex?.hopfFlagFlipped ??
                anandaVortex?.kleinFlipAtThisTick ??
                recordValue(payload.kleinFlip)?.hopfFlagFlipped
        ) ?? (tick12 !== null && tick12 > SLERP_KLEIN_BOUNDARY_TICK);

    return Object.freeze({
        tick12,
        position6,
        slerpFraction,
        kleinAtBoundary,
        hopfFlagFlipped
    });
}

function mergeSlerpClock(
    base: SlerpClockSnapshot,
    event: SubscribeToProfileTickEvent
): SlerpClockSnapshot {
    const tick12 = normalizedTick12(finiteNumber(event.tick12)) ?? base.tick12;
    const slerpFraction = clampUnit(finiteNumber(event.slerpFraction) ?? base.slerpFraction);
    return Object.freeze({
        tick12,
        position6: normalizedPosition6(finiteNumber(event.position6), tick12) ?? base.position6,
        slerpFraction,
        kleinAtBoundary:
            event.kleinAtBoundary ?? (tick12 === SLERP_KLEIN_BOUNDARY_TICK && slerpFraction > 0),
        hopfFlagFlipped:
            event.hopfFlagFlipped ?? (tick12 !== null && tick12 > SLERP_KLEIN_BOUNDARY_TICK)
    });
}

function slerpClockFromTick(tick: number | null): SlerpClockSnapshot {
    const tick12 = normalizedTick12(tick);
    return Object.freeze({
        tick12,
        position6: normalizedPosition6(null, tick12),
        slerpFraction: fractionalPart(tick),
        kleinAtBoundary: tick12 === SLERP_KLEIN_BOUNDARY_TICK && fractionalPart(tick) > 0,
        hopfFlagFlipped: tick12 !== null && tick12 > SLERP_KLEIN_BOUNDARY_TICK
    });
}

function disposeSubscription(subscription: Disposable | (() => void)): () => void {
    return () => {
        if (typeof subscription === 'function') {
            subscription();
        } else {
            subscription.dispose();
        }
    };
}

function normalizedTick12(value: number | null): number | null {
    if (value === null) {
        return null;
    }
    return positiveModulo(Math.floor(value), SLERP_TICK_COUNT);
}

function normalizedPosition6(value: number | null, tick12: number | null): number | null {
    if (value !== null) {
        return positiveModulo(Math.floor(value), SLERP_POSITION_COUNT);
    }
    return tick12 === null ? null : positiveModulo(tick12, SLERP_POSITION_COUNT);
}

function fractionalPart(value: number | null): number {
    if (value === null) {
        return 0;
    }
    return clampUnit(value - Math.floor(value));
}

function finiteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function booleanValue(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function positiveModulo(value: number, modulo: number): number {
    return ((value % modulo) + modulo) % modulo;
}

function clampUnit(value: number): number {
    return Math.max(0, Math.min(1, value));
}
