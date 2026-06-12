// Renderer-service implementation for the m3-mahamaya M-extension (24.T24.16).
//
// `M3MahamayaRendererService` is a passive, deterministic projector. It consumes
// the backend-provided M3 projection surface and re-projects it into a
// presenter-ready cosmic-wheel render model. It never invents codon, Tarot,
// I-Ching, planetary, or reward-training authority locally — every field it
// renders is read straight off the {@link M3ProjectionSurface} the kernel bridge
// already published. The service is bound `inSingletonScope` and addressed
// through the {@link M3_RENDERER_SERVICE} Symbol (DI symbol discipline).

import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import {
    M3ProjectionSurface,
    M3ProjectionSurfaceInput,
    buildM3ProjectionSurface
} from '../../common';
import {
    M3ProfileTickInput,
    M3RenderMode,
    M3RendererService,
    M3RendererSnapshot,
    M3SectionReadiness,
    M3WheelRenderModel,
    M3WheelSectionModel
} from './m3-renderer-protocol';

@injectable()
export class M3MahamayaRendererService implements M3RendererService {
    protected readonly onDidChangeEmitter = new Emitter<M3RendererSnapshot>();
    readonly onDidChange: Event<M3RendererSnapshot> = this.onDidChangeEmitter.event;

    protected cachedSurface: M3ProjectionSurface | null = null;

    dispose(): void {
        this.onDidChangeEmitter.dispose();
    }

    get surface(): M3ProjectionSurface | null {
        return this.cachedSurface;
    }

    buildSurface(input: M3ProjectionSurfaceInput): M3ProjectionSurface | null {
        try {
            return buildM3ProjectionSurface(input);
        } catch {
            // The renderer refuses to fabricate a surface when the backend has
            // not yet supplied authoritative mahamaya / codonRotationProjection
            // payload fields. Returning null keeps the widget on its empty state.
            return null;
        }
    }

    ingest(surface: M3ProjectionSurface | null): void {
        this.cachedSurface = surface;
        this.onDidChangeEmitter.fire(this.snapshot());
    }

    snapshot(): M3RendererSnapshot {
        return Object.freeze({
            surface: this.cachedSurface,
            profileGeneration: this.cachedSurface ? this.cachedSurface.profileGeneration : null
        });
    }

    currentRenderModel(mode: M3RenderMode, tick: M3ProfileTickInput): M3WheelRenderModel | null {
        return this.cachedSurface ? this.deriveWheelRenderModel(this.cachedSurface, mode, tick) : null;
    }

    deriveWheelRenderModel(
        surface: M3ProjectionSurface,
        mode: M3RenderMode,
        tick: M3ProfileTickInput
    ): M3WheelRenderModel {
        const sections = wheelSections(surface, mode, tick);
        return Object.freeze({
            mode,
            profileGeneration: surface.profileGeneration,
            readiness: surface.readiness.surfaceReady ? 'ready' : 'blocked',
            sections: Object.freeze(sections)
        });
    }
}

/**
 * Derive the placed cosmic-wheel sections for a surface. Mirrors the layout the
 * `M3CosmicWheelRenderService` presenter expects, but owned by the service so
 * section state is computed once, deterministically, off the surface.
 */
function wheelSections(
    surface: M3ProjectionSurface,
    mode: M3RenderMode,
    tick: M3ProfileTickInput
): M3WheelSectionModel[] {
    const pending = new Set(surface.pendingFields);
    const active = surface.activeProjection;
    const provenance = surface.m30ProvenanceStrip;
    const surfaceState: M3SectionReadiness = surface.readiness.surfaceReady ? 'ready' : 'blocked';
    const tickDetail = `profile tick ${displayValue(tick.tick)} at degree ${displayValue(tick.degree720)}`;

    const sections: M3WheelSectionModel[] = [
        {
            key: 'quintessence-akasha',
            label: 'Quintessence / Akasha indicator',
            state: surfaceState,
            detail: `active codon ${displayValue(active.codon)} (${displayValue(active.codonId)})`,
            position: 'center'
        },
        {
            key: 'sixteen-lens-annulus',
            label: "M1' chromatic-lens inner ring",
            state: isPresent(active.lens) ? 'ready' : 'pending',
            detail: `M1' chromatic lens ${displayValue(active.lens)} of 12 · mode ${displayValue(active.mode)}`,
            position: 'inner'
        },
        {
            key: 'cosmic-clock',
            label: 'Cosmic clock',
            state: pending.has('s3.worldClock') ? 'pending' : 'ready',
            detail: tickDetail,
            position: 'outer'
        },
        {
            key: 'hexagram-browser',
            label: 'Hexagram browser',
            state: isPresent(active.hexagramId) ? 'ready' : 'pending',
            detail: `hexagram ${displayValue(active.hexagram)} (${displayValue(active.hexagramId)})`,
            position: 'bottom'
        },
        {
            key: 'tarot-wheel',
            label: 'Tarot wheel',
            state: isPresent(active.tarotMinorId) ? 'ready' : 'pending',
            detail: `minor ${displayValue(active.tarotMinorId)} · shadow ${displayValue(active.tarotShadowCodon)}`,
            position: 'right'
        },
        {
            key: 'decan-chain-breadcrumb',
            label: 'Decan-chain breadcrumb',
            state: pending.has('s2.m3LibrarySummary') ? 'pending' : 'ready',
            detail: `M2 source ${displayValue(provenance.m2SourceIndex72)} -> DET ${displayValue(provenance.detResult64)}`,
            position: 'left'
        }
    ];

    if (mode === 'mini-view') {
        return sections.filter(section =>
            section.position === 'center' ||
            section.position === 'inner' ||
            section.position === 'outer'
        );
    }
    return sections;
}

function isPresent(value: unknown): boolean {
    return value !== null && value !== undefined;
}

function displayValue(value: unknown): string {
    if (typeof value === 'number' || typeof value === 'string') {
        return String(value);
    }
    return '-';
}
