// Renderer-service protocol for the m3-mahamaya M-extension (task 24.T24.16).
//
// DI symbol discipline: every renderer-service contract is addressed through an
// explicit injection Symbol so the implementation class is never the only DI
// token (mirrors omnipanel-shell's OMNIPANEL_RUNTIME_SERVICE convention). The
// interfaces here describe *what* the renderer projects; the implementation in
// `m3-renderer-service.ts` owns *how* it is derived. Both stay framework-
// agnostic — no React types leak into the service layer — so the cosmic-wheel
// React presenters can consume the same deterministic render model.

import { Event } from '@theia/core/lib/common/event';
import {
    M3ProjectionSurface,
    M3ProjectionSurfaceInput
} from '../../common';

/** Injection token for the M3 Mahamaya renderer service. */
export const M3_RENDERER_SERVICE = Symbol('PratibimbaM3MahamayaRendererService');

/** Render aperture requested of the renderer service. */
export type M3RenderMode = 'badge' | 'mini-view' | 'full';

/** Coarse readiness of a rendered surface (matches the wheel badge palette). */
export type M3RenderReadiness = 'ready' | 'blocked';

/** Per-field readiness of a single visualisation section. */
export type M3SectionReadiness = 'ready' | 'pending' | 'blocked';

/** Grid placement of a wheel section in the cosmic-wheel layout. */
export type M3SectionPosition =
    | 'center'
    | 'inner'
    | 'outer'
    | 'bottom'
    | 'right'
    | 'left';

/**
 * Minimal, framework-agnostic profile-tick the renderer needs to caption the
 * cosmic clock. Mirrors the values the React `useM3ProfileTick` hook exposes
 * without importing the hook (which would pull React into the service layer).
 */
export interface M3ProfileTickInput {
    readonly tick: number | null;
    readonly degree720: number | null;
}

/** One placed section of the cosmic-wheel render model. */
export interface M3WheelSectionModel {
    readonly key: string;
    readonly label: string;
    readonly state: M3SectionReadiness;
    readonly detail: string;
    readonly position: M3SectionPosition;
}

/**
 * Deterministic, presenter-ready model of a Mahamaya cosmic-wheel render. The
 * same surface + mode + tick always yields the same model — the renderer never
 * invents codon/Tarot/I-Ching/planetary authority, it only re-projects the
 * backend-provided {@link M3ProjectionSurface}.
 */
export interface M3WheelRenderModel {
    readonly mode: M3RenderMode;
    readonly profileGeneration: number;
    readonly readiness: M3RenderReadiness;
    readonly sections: readonly M3WheelSectionModel[];
}

/** Frozen snapshot emitted whenever the ingested surface changes. */
export interface M3RendererSnapshot {
    readonly surface: M3ProjectionSurface | null;
    readonly profileGeneration: number | null;
}

/**
 * Renderer service for Mahamaya visualisations.
 *
 * Responsibilities:
 *  - safely construct an {@link M3ProjectionSurface} from a bridge profile
 *    (centralises the widget's defensive `buildM3ProjectionSurface` wrapping);
 *  - derive a deterministic {@link M3WheelRenderModel} the React presenters can
 *    render without re-deriving section state inline;
 *  - cache the latest surface and notify subscribers via {@link onDidChange}.
 */
export interface M3RendererService {
    /** Latest ingested surface, or null when no valid surface has arrived. */
    readonly surface: M3ProjectionSurface | null;

    /** Fires a frozen snapshot whenever the cached surface changes. */
    readonly onDidChange: Event<M3RendererSnapshot>;

    /**
     * Build a projection surface from a profile-shaped input. Returns null
     * (never throws) when the backend has not yet provided the mandatory
     * mahamaya / codonRotationProjection payload fields.
     */
    buildSurface(input: M3ProjectionSurfaceInput): M3ProjectionSurface | null;

    /** Cache a surface (null clears it) and notify subscribers. */
    ingest(surface: M3ProjectionSurface | null): void;

    /**
     * Derive the cosmic-wheel render model for a surface at a given aperture.
     * Pure and idempotent.
     */
    deriveWheelRenderModel(
        surface: M3ProjectionSurface,
        mode: M3RenderMode,
        tick: M3ProfileTickInput
    ): M3WheelRenderModel;

    /**
     * Render model for the currently-cached surface, or null when no surface is
     * cached.
     */
    currentRenderModel(mode: M3RenderMode, tick: M3ProfileTickInput): M3WheelRenderModel | null;
}
