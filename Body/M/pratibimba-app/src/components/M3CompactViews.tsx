/**
 * Coordinate: M' M3' (Track-08 compact renderer wrappers, 24.T24.17)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): daily cosmic and shared context-strip compact views.
 * Actualises: M3CodonChip and M3WheelMiniView over the one wheel renderer,
 *   with the 24.T24.18 pentadic hinge badge sourced from the same held frame
 *   while global choreography is paused.
 * Public surface: M3CodonChip, M3WheelMiniView, M3ContextCodonChip,
 *   M3DailyWheelMiniView.
 * Does NOT own: profile production, a fifth store, rendering law, or layout state.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.17.
 */

import { useMemo, useRef } from 'react';
import { useEngineStore } from '../engine/modulation/engine';
import {
    buildPentadicInspectorView,
    type PentadicInspectorViewModel
} from '../panes/m3PentadicInspector';
import { useTickStore } from '../state/stores';
import { M3PentadicRelationInspector } from './M3PentadicRelationInspector';
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

export function M3WheelMiniView({
    pentadic,
    surface
}: {
    readonly pentadic?: PentadicInspectorViewModel;
    readonly surface: M3WheelSurface;
}) {
    const relation = pentadic ?? buildPentadicInspectorView({
        payload: {},
        generation: surface.generation
    });
    return (
        <div
            className="m3-wheel-mini-view"
            data-testid="m3-wheel-mini-view"
            data-generation={surface.generation}
        >
            <M3CosmicWheelRenderService surface={surface} mode="mini-view" />
            <M3PentadicRelationInspector mode="badge" view={relation} />
        </div>
    );
}

interface M3AuthorityFrame {
    readonly generation: number;
    readonly payload: Readonly<Record<string, unknown>>;
}

function useLiveM3AuthorityFrame(): M3AuthorityFrame {
    const cached = useTickStore(state => state.profile);
    const paused = useEngineStore(state => state.paused);
    const liveFrame = useMemo<M3AuthorityFrame>(
        () => ({
            payload: (cached?.profile as Record<string, unknown> | null) ?? {},
            generation: cached?.generation ?? 0
        }),
        [cached]
    );
    const heldFrame = useRef<M3AuthorityFrame | null>(null);
    if (!paused || heldFrame.current === null) {
        heldFrame.current = liveFrame;
    }
    return heldFrame.current;
}

function useLiveM3CompactProjection(): {
    readonly pentadic: PentadicInspectorViewModel;
    readonly surface: M3WheelSurface;
} {
    const frame = useLiveM3AuthorityFrame();
    return useMemo(
        () => ({
            pentadic: buildPentadicInspectorView(frame),
            surface: buildM3WheelSurface(frame)
        }),
        [frame]
    );
}

export function M3ContextCodonChip() {
    return <M3CodonChip surface={useLiveM3CompactProjection().surface} />;
}

export function M3DailyWheelMiniView() {
    const projection = useLiveM3CompactProjection();
    return (
        <div className="m3-daily-wheel-mini-view" data-testid="m3-daily-wheel-mini-view">
            <M3WheelMiniView
                pentadic={projection.pentadic}
                surface={projection.surface}
            />
        </div>
    );
}
