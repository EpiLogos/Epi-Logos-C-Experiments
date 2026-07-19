/**
 * Coordinate: M' M3' (Track-08 compact renderer wrappers, 24.T24.17)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): daily cosmic and shared context-strip compact views.
 * Actualises: M3CodonChip and M3WheelMiniView over the one wheel renderer,
 *   retaining the last received surface while global choreography is paused.
 * Public surface: M3CodonChip, M3WheelMiniView, M3ContextCodonChip,
 *   M3DailyWheelMiniView.
 * Does NOT own: profile production, a fifth store, rendering law, or layout state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.17.
 */

import { useMemo, useRef } from 'react';
import { useEngineStore } from '../engine/modulation/engine';
import { useTickStore } from '../state/stores';
import {
    buildM3WheelSurface,
    M3CosmicWheelRenderService,
    type M3WheelSurface
} from './M3CosmicWheelRenderService';

export function M3CodonChip({ surface }: { readonly surface: M3WheelSurface }) {
    return (
        <span
            className="m3-codon-chip"
            data-testid="m3-codon-chip"
            data-generation={surface.generation}
        >
            <M3CosmicWheelRenderService surface={surface} mode="badge" />
        </span>
    );
}

export function M3WheelMiniView({ surface }: { readonly surface: M3WheelSurface }) {
    return (
        <div
            className="m3-wheel-mini-view"
            data-testid="m3-wheel-mini-view"
            data-generation={surface.generation}
        >
            <M3CosmicWheelRenderService surface={surface} mode="mini-view" />
        </div>
    );
}

function useLiveM3WheelSurface(): M3WheelSurface {
    const cached = useTickStore(state => state.profile);
    const paused = useEngineStore(state => state.paused);
    const liveSurface = useMemo(
        () =>
            buildM3WheelSurface({
                payload: (cached?.profile as Record<string, unknown> | null) ?? {},
                generation: cached?.generation ?? 0
            }),
        [cached]
    );
    const heldSurface = useRef<M3WheelSurface | null>(null);
    if (!paused || heldSurface.current === null) {
        heldSurface.current = liveSurface;
    }
    return heldSurface.current;
}

export function M3ContextCodonChip() {
    return <M3CodonChip surface={useLiveM3WheelSurface()} />;
}

export function M3DailyWheelMiniView() {
    return (
        <div className="m3-daily-wheel-mini-view" data-testid="m3-daily-wheel-mini-view">
            <M3WheelMiniView surface={useLiveM3WheelSurface()} />
        </div>
    );
}
