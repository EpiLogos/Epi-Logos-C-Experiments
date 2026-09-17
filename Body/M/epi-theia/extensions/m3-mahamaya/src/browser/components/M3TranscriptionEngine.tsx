import * as React from 'react';
import type { M3ProjectionSurface } from '../../common';
import {
    buildM3CodonRotationProjectionForLensRing,
    K2LensRingCellDescriptor
} from '../composition/M3CodonRotationProjectionForLensRing';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { M3_LENS_OPERATOR_APERTURE_ID } from './M3LensApertureSwitcher';
import { ReadinessChip } from './ReadinessChip';

export interface LensCodonBinaryProjection {
    readonly lensId: number;
    readonly segment?: readonly number[];
    readonly tick12?: number;
    readonly perDegree: readonly LensCodonBinaryDegree[];
}

export interface LensCodonBinaryDegree {
    readonly degree360: number;
    readonly exactDegree720: number;
    readonly codonUpper?: number | string;
    readonly codonLower?: number | string;
    readonly codonThird?: number | string;
    readonly codonThirdPair?: string;
    readonly codonBits?: string;
    readonly codon6Bit?: number;
    readonly hexagramId: number;
    readonly codonClass: string;
    readonly charges: LensCodonBinaryCharges;
    readonly quaternion: readonly number[];
    readonly elementCanonical: string | number;
    readonly lineChangeOperator?: string;
    readonly lineChangeHops?: readonly LensCodonBinaryLineHop[];
    readonly rnaCapable?: boolean;
    readonly rnaFamily?: string | null;
    readonly chromosomeGraph?: string | null;
    readonly xLogicInvariant?: string;
    readonly chargeIdentity?: readonly LensCodonChargeIdentity[];
}

export interface LensCodonBinaryCharges {
    readonly pp: number;
    readonly nn: number;
    readonly np: number;
    readonly pn: number;
}

export interface LensCodonChargeIdentity {
    readonly charge: keyof LensCodonBinaryCharges;
    readonly xPermutation: string;
    readonly element: string;
    readonly quaternionComponent: string;
}

export interface LensCodonBinaryLineHop {
    readonly line: number;
    readonly degree360: number;
    readonly hexagramId: number;
}

export interface M3TranscriptionEngineProps {
    readonly surface: M3ProjectionSurface;
    readonly lensCodonBinary?: LensCodonBinaryProjection;
    readonly activeLensId: number;
    readonly devModeXLogicLamps?: boolean;
}

const CHARGE_ORDER = Object.freeze(['pp', 'nn', 'np', 'pn'] as const);

export const M3TranscriptionEngine: React.FC<M3TranscriptionEngineProps> = ({
    surface,
    lensCodonBinary,
    activeLensId,
    devModeXLogicLamps = false
}) => {
    const profileTick = useM3ProfileTick();
    const readiness = useM3Readiness();
    const renderMode = activeLensId === M3_LENS_OPERATOR_APERTURE_ID
        ? 'operator-no-frame-graph'
        : 'degree-ring';
    const lensRingDescriptor = React.useMemo(
        () => lensRingDescriptorForSurface(surface),
        [surface]
    );

    if (!lensCodonBinary) {
        return (
            <article
                className="m3-transcription-engine"
                data-widget-id="pratibimba.m3-mahamaya:m3-transcription-engine"
                data-active-lens-id={activeLensId}
                data-render-mode={renderMode}
                data-profile-tick={profileTick.tick ?? 'pending'}
                data-context-readiness={readiness.snapshot.state}
                style={rootStyle}
            >
                <EngineHeader
                    activeLensId={activeLensId}
                    renderMode={renderMode}
                    lensRingDescriptor={lensRingDescriptor}
                    tick12={null}
                />
                <ReadinessChip
                    bindingKey="profile.lensCodonBinary"
                    state="pending"
                    style={pendingChipStyle}
                >
                    pending-profile-field:lensCodonBinary
                </ReadinessChip>
            </article>
        );
    }

    const degrees = lensCodonBinary.perDegree;
    const projectionTick = lensCodonBinary.tick12 ?? profileTick.tick;

    return (
        <article
            className="m3-transcription-engine"
            data-widget-id="pratibimba.m3-mahamaya:m3-transcription-engine"
            data-active-lens-id={activeLensId}
            data-projection-lens-id={lensCodonBinary.lensId}
            data-render-mode={renderMode}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-tick12={projectionTick ?? 'pending'}
            data-context-readiness={readiness.snapshot.state}
            style={rootStyle}
        >
            <EngineHeader
                activeLensId={activeLensId}
                renderMode={renderMode}
                lensRingDescriptor={lensRingDescriptor}
                tick12={projectionTick ?? null}
            />
            <div
                className={renderMode === 'operator-no-frame-graph'
                    ? 'm3-transcription-graph'
                    : 'm3-transcription-degree-ring'}
                data-degree-count={degrees.length}
                style={renderMode === 'operator-no-frame-graph' ? graphStyle : degreeGridStyle}
            >
                {degrees.map(degree => (
                    <DegreeCodonCell
                        key={`${degree.degree360}:${degree.exactDegree720}:${degree.hexagramId}`}
                        degree={degree}
                        devModeXLogicLamps={devModeXLogicLamps}
                    />
                ))}
            </div>
        </article>
    );
};

export const M3TranscriptionEngineCard: React.FC<M3TranscriptionEngineProps> = props => (
    <M3TranscriptionEngine {...props} />
);

export default M3TranscriptionEngine;

const EngineHeader: React.FC<{
    readonly activeLensId: number;
    readonly renderMode: string;
    readonly lensRingDescriptor: K2LensRingCellDescriptor | null;
    readonly tick12: number | null;
}> = ({
    activeLensId,
    renderMode,
    lensRingDescriptor,
    tick12
}) => (
    <header style={headerStyle}>
        <div>
            <h3 style={titleStyle}>M3 transcription engine</h3>
            <p style={subtitleStyle}>
                lens aperture {activeLensId} {'->'} codon binary projection {'->'} rendered cells
            </p>
        </div>
        <div style={headerChipsStyle}>
            <ReadinessChip bindingKey="profile.lensCodonBinary" state="ready">
                lensCodonBinary
            </ReadinessChip>
            <span
                data-render-mode-chip={renderMode}
                data-lens-ring-position={lensRingDescriptor?.positionLabel ?? 'pending-lens-ring-descriptor'}
                style={modeChipStyle}
            >
                {renderMode}
            </span>
            <span data-tick12-chip style={modeChipStyle}>
                tick12={tick12 ?? 'pending'}
            </span>
        </div>
    </header>
);

const DegreeCodonCell: React.FC<{
    readonly degree: LensCodonBinaryDegree;
    readonly devModeXLogicLamps: boolean;
}> = ({ degree, devModeXLogicLamps }) => (
    <section
        className="m3-transcription-degree-cell"
        data-degree360={degree.degree360}
        data-exact-degree720={degree.exactDegree720}
        data-hexagram-address={degree.hexagramId}
        data-codon-class={degree.codonClass}
        style={cellStyle}
    >
        <header style={cellHeaderStyle}>
            <strong>Degree {degree.degree360}</strong>
            <span>H{degree.hexagramId}</span>
        </header>
        <div data-binary-readout style={binaryStyle}>
            {binaryReadout(degree)}
        </div>
        <div style={chargeGridStyle}>
            {CHARGE_ORDER.map(key => (
                <span key={key} data-charge-key={key} style={chargeStyle}>
                    {key}={degree.charges[key]}
                    {devModeXLogicLamps ? chargeIdentityLabel(degree, key) : ''}
                </span>
            ))}
        </div>
        {devModeXLogicLamps && degree.xLogicInvariant && (
            <div data-x-logic-invariant style={invariantStyle}>
                {degree.xLogicInvariant}
            </div>
        )}
        <dl style={factsStyle}>
            <div>
                <dt>charge quaternion</dt>
                <dd>{quaternionLabel(degree.quaternion)}</dd>
            </div>
            <div>
                <dt>element</dt>
                <dd>{elementLabel(degree.elementCanonical)}</dd>
            </div>
            <div>
                <dt>codon class</dt>
                <dd>{degree.codonClass}</dd>
            </div>
            <div>
                <dt>line-change operator</dt>
                <dd>{degree.lineChangeOperator ?? 'pending-line-change-operator'}</dd>
            </div>
        </dl>
        <LineChangeHops hops={degree.lineChangeHops ?? []} />
        <div style={readinessRowStyle}>
            <span data-rna-capable-flag>
                m3_codon_is_rna_capable={degree.rnaCapable === true ? 'true' : 'false'}
            </span>
            {degree.rnaFamily ? (
                <span data-rna-family>{degree.rnaFamily}</span>
            ) : (
                <ReadinessChip bindingKey="profile.lensCodonBinary.rnaFamily" state="pending">
                    pending-rna-codon-family
                </ReadinessChip>
            )}
            {degree.chromosomeGraph ? (
                <span data-chromosome-graph>{degree.chromosomeGraph}</span>
            ) : (
                <ReadinessChip bindingKey="profile.lensCodonBinary.chromosomeGraph" state="pending">
                    pending-chromosome-graph
                </ReadinessChip>
            )}
        </div>
    </section>
);

const LineChangeHops: React.FC<{
    readonly hops: readonly LensCodonBinaryLineHop[];
}> = ({ hops }) => (
    <ol style={hopListStyle}>
        {hops.length === 0 ? (
            <li data-line-change-hop="pending">pending-line-change-hop</li>
        ) : hops.map(hop => (
            <li
                key={`${hop.line}:${hop.degree360}:${hop.hexagramId}`}
                data-line-change-hop="true"
                style={hopStyle}
            >
                line-change-hop L{hop.line} {'->'} degree {hop.degree360} / H{hop.hexagramId}
            </li>
        ))}
    </ol>
);

function lensRingDescriptorForSurface(
    surface: M3ProjectionSurface
): K2LensRingCellDescriptor | null {
    try {
        return buildM3CodonRotationProjectionForLensRing(surface).cells[0] ?? null;
    } catch {
        return null;
    }
}

function binaryReadout(degree: LensCodonBinaryDegree): string {
    if (degree.codonBits && degree.codonBits.trim().length > 0) {
        return degree.codonBits;
    }
    const third = degree.codonThirdPair ?? valueLabel(degree.codonThird);
    return [valueLabel(degree.codonUpper), valueLabel(degree.codonLower), third]
        .filter(part => part.length > 0)
        .join(' ');
}

function quaternionLabel(quaternion: readonly number[]): string {
    return `[${quaternion.join(', ')}]`;
}

function chargeIdentityLabel(
    degree: LensCodonBinaryDegree,
    key: keyof LensCodonBinaryCharges
): string {
    const identity = degree.chargeIdentity?.find(entry => entry.charge === key);
    return identity ? ` ${key}=${identity.xPermutation}` : '';
}

function elementLabel(element: string | number): string {
    return typeof element === 'number' ? `canonical-B:${element}` : element;
}

function valueLabel(value: number | string | undefined): string {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return '';
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
    marginBottom: 12
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

const headerChipsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6
};

const modeChipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 'var(--theia-ui-font-size0)',
    color: 'var(--theia-descriptionForeground)',
    whiteSpace: 'nowrap'
};

const pendingChipStyle: React.CSSProperties = {
    marginTop: 4
};

const degreeGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 10
};

const graphStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 10,
    borderTop: '1px dashed var(--theia-contrastBorder)',
    paddingTop: 10
};

const cellStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 10,
    background: 'var(--theia-editor-background)'
};

const cellHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8
};

const binaryStyle: React.CSSProperties = {
    fontFamily: 'var(--theia-code-font-family)',
    fontSize: 'var(--theia-ui-font-size2)',
    marginBottom: 8
};

const chargeGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 4,
    marginBottom: 8
};

const chargeStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '2px 4px',
    fontSize: 'var(--theia-ui-font-size0)'
};

const invariantStyle: React.CSSProperties = {
    marginBottom: 8,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const factsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 8,
    margin: '0 0 8px'
};

const hopListStyle: React.CSSProperties = {
    margin: '0 0 8px',
    paddingLeft: 18
};

const hopStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)'
};

const readinessRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 'var(--theia-ui-font-size0)'
};
