/**
 * Coordinate: M' `/` membrane (profile-tick hook — Track 27.T27.0)
 * Residency: Body/M/pratibimba-app/src/state
 * Actualises: `useProfileTick()` — the ONE re-render alignment seam per
 *   15.6 ("Widgets re-render on MathemeHarmonicProfile tick advance, not
 *   user input"). Wraps the tick store (generation-gated, stale
 *   generations already refused there) and exposes the clock view every
 *   fold panel consumes: generation + tick12 + degree720. Passive zustand
 *   subscription: subscribe on mount, unsubscribe on unmount, no timer.
 * Does NOT own: the tick store law (stores.ts), profile parsing (bridge),
 *   any interval/rAF clock (banned — one clock only).
 */

import { useMemo } from 'react';
import { useTickStore } from './stores';

export interface ProfileTickView {
    readonly generation: number | null;
    readonly tick12: number | null;
    readonly degree720: number | null;
    /** B-12: the S2 graph revision this profile was projected against, so a
     *  rendering can tell a governed edit crossed (via `crossSurfacePropagation`
     *  in `composition/compositionContract`). Null when the bridge stamped none. */
    readonly graphRevision: number | null;
}

function num(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function useProfileTick(): ProfileTickView {
    const generation = useTickStore(s => s.generation);
    const cached = useTickStore(s => s.profile);

    return useMemo(() => {
        const payload = (cached?.profile ?? null) as Record<string, unknown> | null;
        const root =
            ((payload as { harmonicProfile?: unknown } | null)?.harmonicProfile as
                | Record<string, unknown>
                | undefined) ?? payload;
        return Object.freeze({
            generation,
            tick12: num(root?.tick12),
            degree720: num(root?.degree720),
            graphRevision: num(cached?.graphRevision)
        });
    }, [generation, cached]);
}
