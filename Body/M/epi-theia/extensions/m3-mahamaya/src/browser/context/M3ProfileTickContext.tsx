import * as React from 'react';
import type {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import type { M3ProjectionSurface } from '../../common';

export interface M3ProfileTickSnapshot {
    readonly generation: number | null;
    readonly tick: number | null;
    readonly degree720: number | null;
    readonly fibonacciGround: M3ProfileTickFibonacciGroundSnapshot | null;
}

export interface M3ProfileTickFibonacciGroundSnapshot {
    readonly natalSunPosition: number | null;
    readonly liveSunPosition: number | null;
}

export interface M3ProfileTickProviderProps {
    readonly bridge?: SharedBridgeAdapter | null;
    readonly surface?: M3ProjectionSurface | null;
    readonly children: React.ReactNode;
}

export const EMPTY_M3_PROFILE_TICK: M3ProfileTickSnapshot = Object.freeze({
    generation: null,
    tick: null,
    degree720: null,
    fibonacciGround: null
});

export const M3ProfileTickContext = React.createContext<M3ProfileTickSnapshot>(
    EMPTY_M3_PROFILE_TICK
);

export function profileTickFromM3Surface(
    surface: M3ProjectionSurface | null | undefined
): M3ProfileTickSnapshot {
    if (!surface) {
        return EMPTY_M3_PROFILE_TICK;
    }
    return Object.freeze({
        generation: surface.profileGeneration,
        tick: numberValue(surface.activeProjection.tick),
        degree720: numberValue(surface.activeProjection.degree720),
        fibonacciGround: null
    });
}

export function profileTickFromProfile(
    profile: MathemeHarmonicProfileBoundary | null
): M3ProfileTickSnapshot {
    if (!profile) {
        return EMPTY_M3_PROFILE_TICK;
    }
    return Object.freeze({
        generation: profile.generation ?? null,
        tick: numberValue(profile.payload.tick),
        degree720: numberValue(profile.payload.degree720),
        fibonacciGround: fibonacciGroundTickFromPayload(profile.payload)
    });
}

export function subscribeM3ProfileTick(
    bridge: SharedBridgeAdapter,
    listener: (snapshot: M3ProfileTickSnapshot) => void
): Disposable {
    return bridge.onProfile(profile => listener(profileTickFromProfile(profile)));
}

export const M3ProfileTickProvider: React.FC<M3ProfileTickProviderProps> = ({
    bridge,
    surface,
    children
}) => {
    const [snapshot, setSnapshot] = React.useState<M3ProfileTickSnapshot>(() =>
        profileTickFromM3Surface(surface)
    );

    React.useEffect(() => {
        setSnapshot(profileTickFromM3Surface(surface));
    }, [surface]);

    React.useEffect(() => {
        if (!bridge) {
            return undefined;
        }
        const sub = subscribeM3ProfileTick(bridge, setSnapshot);
        return () => sub.dispose();
    }, [bridge]);

    return (
        <M3ProfileTickContext.Provider value={snapshot}>
            {children}
        </M3ProfileTickContext.Provider>
    );
};

export function useM3ProfileTick(): M3ProfileTickSnapshot {
    return React.useContext(M3ProfileTickContext);
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function fibonacciGroundTickFromPayload(
    payload: Readonly<Record<string, unknown>>
): M3ProfileTickFibonacciGroundSnapshot | null {
    const ground = objectValue(
        payload.fibonacciGround ??
        payload.fibonacci_ground ??
        payload.level0FibonacciGround ??
        payload.level0_fibonacci_ground
    );
    if (!ground) {
        return null;
    }
    const natalSun = objectValue(ground.natalSun ?? ground.natal_sun);
    const liveSun = objectValue(ground.liveSun ?? ground.live_sun);
    const natalSunPosition = boundedGroundPosition(
        ground.natalSunFibonacciPosition ??
        ground.natal_sun_fibonacci_position ??
        natalSun?.fibonacciPosition ??
        natalSun?.fibonacci_position
    );
    const liveSunPosition = boundedGroundPosition(
        ground.liveSunFibonacciPosition ??
        ground.live_sun_fibonacci_position ??
        liveSun?.fibonacciPosition ??
        liveSun?.fibonacci_position
    );
    if (natalSunPosition === null && liveSunPosition === null) {
        return null;
    }
    return Object.freeze({
        natalSunPosition,
        liveSunPosition
    });
}

function boundedGroundPosition(value: unknown): number | null {
    const number = numberValue(value);
    return number !== null && number >= 0 && number < 60 ? number : null;
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}
