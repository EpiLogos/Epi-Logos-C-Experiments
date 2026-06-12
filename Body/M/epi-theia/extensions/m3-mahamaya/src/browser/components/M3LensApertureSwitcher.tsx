import * as React from 'react';
import type { MExtensionReadinessSnapshot } from '@pratibimba/m-extension-runtime';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

// Tranche 24.10 / 24.3 — M3 lens-stack aperture switcher (DR-M3-3 / closes DR-WC-M3-2).
//
// This widget is the renderer-side anchor of the M3 Mahāmāyā lens-stack
// namespace. Per DR-M3-3 (ratified Tranche 4.6) the M3 lens-stack
// (16 apertures + 1 integral) and the M1' chromatic lens (12 anchors) MUST NOT
// silently merge into one "lens" control.
//
// Namespace discipline (enforced structurally):
//   - This component consumes ONLY `payload.mahamayaLensStack.activeLensId` —
//     the M3 aperture lane. It NEVER reads the M1' chromatic-lens lane
//     (`surface.activeProjection.lens`, sourced from the codon-rotation
//     projection lens field); that lane lives exclusively in
//     M1ChromaticLensConsumer.tsx.
//   - It takes the profile payload (not the projection surface), so it has no
//     access to `surface.activeProjection.lens`, and it deliberately reaches
//     into `mahamayaLensStack` only — never the codon-rotation projection lane.
//
// It renders side-by-side with — never merged into — the M1' chromatic-lens chip.

// The M3 lens-stack is 16 discrete apertures PLUS 2 meta-apertures (DR-M3-LENS-18):
//   aperture 16 — the `()` Frame (the original "+1": Level-0 unity / Fibonacci-ground
//                 meta-lens per DR-FIB-1 — the whole circle held as one);
//   aperture 17 — the `(-)` Operator (the no-frame view: the relational topology
//                 read with the 360°-container withheld).
// Total 18 = 16+2 = 12+4+2 = 6g (g=3), the genus-3 signature of the M0-3 Anuttara
// number-language; the two meta-apertures are the two Mirror children (Frame/Operator).
// These counts are the M3 namespace; they are deliberately NOT the 12-anchor M1'
// chromatic count, and there is intentionally no single flattened "16+2" table.
export const M3_LENS_APERTURE_COUNT = 16;
export const M3_LENS_FRAME_APERTURE_ID = 16;
export const M3_LENS_OPERATOR_APERTURE_ID = 17;
export const M3_LENS_STACK_TOTAL = 18;
/** @deprecated retained for older importers; the stack now carries TWO meta-apertures. */
export const M3_HAS_INTEGRAL_APERTURE = true;

export type M3LensMetaKind = 'division' | 'frame-unity' | 'operator-no-frame';

export interface M3LensApertureView {
    readonly activeLensId: number | null;
    readonly apertureCount: typeof M3_LENS_APERTURE_COUNT;
    readonly stackTotal: typeof M3_LENS_STACK_TOTAL;
    readonly hasIntegralAperture: typeof M3_HAS_INTEGRAL_APERTURE;
    readonly namespaceResolved: boolean;
    readonly activeMetaKind: M3LensMetaKind | null;
    readonly activeIsIntegral: boolean;
    readonly activeIsOperatorNoFrame: boolean;
    readonly resolved: boolean;
    readonly outOfRange: boolean;
}

// Pure projection of the M3 aperture lane off the profile payload. Reads ONLY
// `payload.mahamayaLensStack` — never the M1' codon-rotation projection lens.
export function m3LensApertureFromProfilePayload(
    profilePayload: Readonly<Record<string, unknown>> | undefined
): M3LensApertureView {
    const stack = objectValue(profilePayload?.mahamayaLensStack);
    const activeLensId = numberValue(stack?.activeLensId);
    // Valid aperture ids are 0..15 (divisions), 16 (`()` Frame), 17 (`(-)` Operator).
    const outOfRange = activeLensId !== null
        && (activeLensId < 0 || activeLensId > M3_LENS_OPERATOR_APERTURE_ID);
    const activeMetaKind: M3LensMetaKind | null = activeLensId === null || outOfRange
        ? null
        : activeLensId === M3_LENS_FRAME_APERTURE_ID
            ? 'frame-unity'
            : activeLensId === M3_LENS_OPERATOR_APERTURE_ID
                ? 'operator-no-frame'
                : 'division';
    return Object.freeze({
        activeLensId,
        apertureCount: M3_LENS_APERTURE_COUNT,
        stackTotal: M3_LENS_STACK_TOTAL,
        hasIntegralAperture: M3_HAS_INTEGRAL_APERTURE,
        namespaceResolved: stack?.namespaceResolved === true || stack?.namespace_resolved === true,
        activeMetaKind,
        activeIsIntegral: activeMetaKind === 'frame-unity',
        activeIsOperatorNoFrame: activeMetaKind === 'operator-no-frame',
        resolved: activeLensId !== null && !outOfRange,
        outOfRange
    });
}

export interface M3LensApertureSwitcherProps {
    readonly profilePayload: Readonly<Record<string, unknown>> | undefined;
    readonly readiness?: MExtensionReadinessSnapshot;
    readonly onSelectAperture?: (lensId: number) => void;
}

export const M3LensApertureSwitcher: React.FC<M3LensApertureSwitcherProps> = ({
    profilePayload,
    readiness,
    onSelectAperture
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const model = React.useMemo(() => m3LensApertureFromProfilePayload(profilePayload), [profilePayload]);
    const frameId = M3_LENS_FRAME_APERTURE_ID;
    const operatorId = M3_LENS_OPERATOR_APERTURE_ID;
    const apertures = React.useMemo(
        () => Array.from({ length: M3_LENS_APERTURE_COUNT }, (_, index) => index),
        []
    );

    return (
        <article
            className="m3-lens-aperture-switcher"
            data-widget-id="pratibimba.m3-mahamaya:m3-lens-stack-aperture"
            data-lens-namespace="m3-lens-stack"
            data-active-lens-id={model.activeLensId ?? 'pending'}
            data-namespace-resolved={model.namespaceResolved ? 'true' : 'false'}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>M3 lens-stack aperture (16+2 = 18)</h3>
                    <p style={subtitleStyle}>
                        16 apertures + the () Frame + the (-) Operator/no-frame — the M3
                        Mahāmāyā lens-stack lane (DR-M3-3 / DR-M3-LENS-18), distinct from
                        the M1&#39; chromatic lens (12).
                    </p>
                </div>
                <ReadinessChip
                    bindingKey="profile.mahamayaLensStack.activeLensId"
                    state={model.resolved ? 'ready' : model.outOfRange ? 'blocked' : 'pending'}
                    style={statePillStyle}
                >
                    {model.namespaceResolved ? 'namespace-resolved' : readiness?.state ?? 'pending'}
                </ReadinessChip>
            </header>

            {model.resolved ? (
                <div role="tablist" aria-label="M3 lens-stack apertures" style={apertureBarStyle}>
                    {apertures.map(id => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={model.activeLensId === id}
                            data-aperture-id={id}
                            data-active={model.activeLensId === id ? 'true' : 'false'}
                            onClick={onSelectAperture ? () => onSelectAperture(id) : undefined}
                            style={model.activeLensId === id ? activeApertureStyle : apertureStyle}
                        >
                            {id}
                        </button>
                    ))}
                    <button
                        type="button"
                        role="tab"
                        aria-selected={model.activeIsIntegral}
                        data-aperture-id={frameId}
                        data-aperture-integral="true"
                        data-aperture-meta-kind="frame-unity"
                        data-active={model.activeIsIntegral ? 'true' : 'false'}
                        onClick={onSelectAperture ? () => onSelectAperture(frameId) : undefined}
                        style={model.activeIsIntegral ? activeIntegralStyle : integralStyle}
                        title="The () Frame — Level-0 unity meta-aperture (the whole held as one)"
                    >
                        ()
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={model.activeIsOperatorNoFrame}
                        data-aperture-id={operatorId}
                        data-aperture-no-frame="true"
                        data-aperture-meta-kind="operator-no-frame"
                        data-active={model.activeIsOperatorNoFrame ? 'true' : 'false'}
                        onClick={onSelectAperture ? () => onSelectAperture(operatorId) : undefined}
                        style={model.activeIsOperatorNoFrame ? activeIntegralStyle : integralStyle}
                        title="The (-) Operator — no-frame view (relational topology, 360° container withheld)"
                    >
                        (-)
                    </button>
                </div>
            ) : (
                <ReadinessChip
                    bindingKey="profile.mahamayaLensStack.activeLensId"
                    state={model.outOfRange ? 'blocked' : 'pending'}
                    style={pendingChipStyle}
                >
                    {model.outOfRange
                        ? `M3 lens-stack activeLensId out of range (${model.activeLensId})`
                        : 'M3 lens-stack aperture pending: profile.mahamayaLensStack.activeLensId not on the bus'}
                </ReadinessChip>
            )}
        </article>
    );
};

export default M3LensApertureSwitcher;

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const rootStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 'var(--theia-ui-font-size2)',
    fontWeight: 600
};

const subtitleStyle: React.CSSProperties = {
    margin: '4px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size1)'
};

const statePillStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    color: 'var(--theia-descriptionForeground)',
    whiteSpace: 'nowrap'
};

const apertureBarStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4
};

const apertureStyle: React.CSSProperties = {
    minWidth: 28,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '3px 8px',
    background: 'var(--theia-editor-background)',
    color: 'var(--theia-foreground)',
    cursor: 'pointer',
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const activeApertureStyle: React.CSSProperties = {
    ...apertureStyle,
    borderColor: 'var(--theia-charts-blue)',
    color: 'var(--theia-charts-blue)',
    fontWeight: 600
};

const integralStyle: React.CSSProperties = {
    ...apertureStyle,
    borderColor: 'var(--theia-charts-purple)',
    color: 'var(--theia-charts-purple)'
};

const activeIntegralStyle: React.CSSProperties = {
    ...integralStyle,
    fontWeight: 600,
    background: 'var(--theia-editorWidget-background)'
};

const pendingChipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid var(--theia-charts-yellow)',
    borderRadius: 999,
    color: 'var(--theia-charts-yellow)',
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)'
};
