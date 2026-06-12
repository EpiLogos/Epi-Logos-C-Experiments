import * as React from 'react';
import { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// Tranche 24.10 — M1' chromatic-lens consumer (DR-M3-3 / closes DR-WC-M3-2).
//
// Widget label: "M1 chromatic lens (12)" (canonical glyph form: "M1' chromatic lens (12)").
//
// This widget is the renderer-side anchor of the M1' chromatic-lens namespace.
// Per DR-M3-3 (ratified Tranche 4.6) the M1' chromatic lens (12 anchors) and the
// M3 Mahāmāyā lens-stack (16 apertures + 1 integral) MUST NOT silently merge.
//
// Namespace discipline (enforced structurally):
//   - This component consumes ONLY `surface.activeProjection.lens` — the M1'
//     chromatic-lens lane sourced upstream from `projection.lens`
//     (i.e. profile `codonRotationProjection.lens`). The build pipeline projects
//     that lane onto `surface.activeProjection.lens` in common/codon-wheel.ts.
//   - It takes NO profile payload prop, so it is structurally incapable of
//     reading the M3 aperture lane (the M3 lens-stack field on the payload).
//     That lane lives exclusively in M3LensApertureSwitcher.tsx.
//
// It is rendered as a small chromatic-lens chip in the wheel-center inner-ring
// slot (24.1), side-by-side with — never merged into — the M3 aperture switcher.

// The M1' chromatic lens has exactly 12 anchors (mirrors the 12 spanda ticks).
// This count is the M1' namespace; it is deliberately NOT the M3 aperture count.
export const M1_CHROMATIC_LENS_COUNT = 12;

export interface M1ChromaticLensView {
    readonly lensIndex: number | null;
    readonly lensCount: typeof M1_CHROMATIC_LENS_COUNT;
    readonly resolved: boolean;
    readonly outOfRange: boolean;
}

// Pure projection of the M1' chromatic-lens lane off the M3 projection surface.
// Reads `surface.activeProjection.lens` and nothing else — never the M3 lane.
export function m1ChromaticLensFromSurface(surface: M3ProjectionSurface): M1ChromaticLensView {
    const raw = surface.activeProjection.lens;
    const lensIndex = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
    const outOfRange = lensIndex !== null && (lensIndex < 0 || lensIndex >= M1_CHROMATIC_LENS_COUNT);
    return Object.freeze({
        lensIndex,
        lensCount: M1_CHROMATIC_LENS_COUNT,
        resolved: lensIndex !== null && !outOfRange,
        outOfRange
    });
}

export interface M1ChromaticLensConsumerProps {
    readonly surface: M3ProjectionSurface;
}

export const M1ChromaticLensConsumer: React.FC<M1ChromaticLensConsumerProps> = ({ surface }) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(() => m1ChromaticLensFromSurface(surface), [surface]);
    // Hue is a presentation-only mapping of the lens index onto the colour wheel;
    // no chromatic data is invented — only the backend-provided index is read.
    const hue = model.lensIndex === null ? null : Math.round((model.lensIndex / M1_CHROMATIC_LENS_COUNT) * 360);
    const swatch = hue === null ? 'var(--theia-descriptionForeground)' : `hsl(${hue}, 70%, 55%)`;

    return (
        <span
            className="m1-chromatic-lens-consumer"
            data-widget-id="pratibimba.m3-mahamaya:m1-chromatic-lens-consumer"
            data-lens-namespace="m1-chromatic"
            data-lens-index={model.lensIndex ?? 'pending'}
            data-lens-resolved={model.resolved ? 'true' : 'false'}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            title="M1' chromatic lens (12) — distinct from the M3 lens-stack aperture (16+1)"
            style={chipStyle}
        >
            <span aria-hidden="true" style={{ ...swatchStyle, background: swatch }} />
            <span style={labelStyle}>M1&#39; chromatic lens (12)</span>
            <span style={valueStyle} data-lens-value>
                {model.resolved
                    ? `${model.lensIndex} / ${model.lensCount}`
                    : model.outOfRange
                        ? `out-of-range (${model.lensIndex})`
                        : 'pending'}
            </span>
            <ReadinessChip
                bindingKey="surface.activeProjection.lens"
                state={model.resolved ? 'ready' : model.outOfRange ? 'blocked' : 'pending'}
            />
        </span>
    );
};

export default M1ChromaticLensConsumer;

const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 10px',
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)',
    fontSize: 'var(--theia-ui-font-size0)',
    whiteSpace: 'nowrap'
};

const swatchStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '1px solid var(--theia-contrastBorder)'
};

const labelStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontWeight: 600
};

const valueStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-monospace-font-family)'
};
