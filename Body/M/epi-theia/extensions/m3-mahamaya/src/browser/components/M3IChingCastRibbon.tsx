import * as React from 'react';
import type { M3ProjectionSurface } from '../../common';
import { useM3ProfileTick } from '../context/M3ProfileTickContext';
import { useM3Readiness } from '../context/M3ReadinessContext';
import { ReadinessChip } from './ReadinessChip';

export const M3_ICHING_CAST_WIDGET_ID = 'pratibimba.m3-mahamaya:iching-cast-ribbon';
export const M3_ICHING_CAST_RPC = 's5.oracle.iching.cast';

export type M3IChingCastMethod = 'three-coin' | 'yarrow';
export type M3IChingLineValue = 6 | 7 | 8 | 9;
export type M3IChingLineIndex = 0 | 1 | 2 | 3 | 4 | 5;
export type M3IChingNucleotide = 'A' | 'T' | 'C' | 'G';
export type M3IChingCoinFace = 'tails' | 'heads';
export type M3IChingCoinValue = 2 | 3;

export interface IChingCastResult {
    readonly castMethod: M3IChingCastMethod;
    readonly lines: readonly M3IChingLineValue[];
    readonly primaryHexagramId: number;
    readonly derivedHexagramId: number | null;
    readonly changingLineIndices: readonly M3IChingLineIndex[];
}

export interface M3IChingCastRibbonProps {
    readonly surface: M3ProjectionSurface;
    readonly castResult?: IChingCastResult;
    readonly onCast: () => void;
}

export interface M3IChingCoin {
    readonly face: M3IChingCoinFace;
    readonly value: M3IChingCoinValue;
}

export interface M3IChingNucleotideCast {
    readonly nucleotide: M3IChingNucleotide;
    readonly lineValue: M3IChingLineValue;
    readonly lineName: 'Old Yin' | 'Old Yang' | 'Young Yin' | 'Young Yang';
    readonly tarotSuit: 'Cups' | 'Wands' | 'Pentacles' | 'Swords';
    readonly element: 'Water' | 'Fire' | 'Earth' | 'Air';
    readonly lineShape: 'broken' | 'solid';
    readonly changing: boolean;
    readonly coins: readonly M3IChingCoin[];
}

export interface M3IChingCastLineView {
    readonly lineIndex: number;
    readonly source: 'codon' | 'cast-result';
    readonly nucleotide: M3IChingNucleotide | null;
    readonly lineValue: M3IChingLineValue;
    readonly lineName: M3IChingNucleotideCast['lineName'];
    readonly tarotSuit: M3IChingNucleotideCast['tarotSuit'];
    readonly element: M3IChingNucleotideCast['element'];
    readonly lineShape: M3IChingNucleotideCast['lineShape'];
    readonly changing: boolean;
    readonly coins: readonly M3IChingCoin[];
    readonly coinSum: M3IChingLineValue;
}

export interface M3IChingCastRibbonModel {
    readonly castMethod: M3IChingCastMethod;
    readonly sourceCodon: string | null;
    readonly ready: boolean;
    readonly pendingReason: string | null;
    readonly lines: readonly M3IChingCastLineView[];
    readonly primaryHexagramId: number | null;
    readonly primaryHexagramGlyph: string | null;
    readonly derivedHexagramId: number | null;
    readonly derivedHexagramGlyph: string | null;
    readonly changingLineIndices: readonly number[];
}

export const M3_NUCLEOTIDE_I_CHING_CASTS: Readonly<
    Record<M3IChingNucleotide, M3IChingNucleotideCast>
> = Object.freeze({
    A: nucleotideCast('A', 6, 'Old Yin', 'Cups', 'Water', 'broken', true, [
        'tails',
        'tails',
        'tails'
    ]),
    T: nucleotideCast('T', 9, 'Old Yang', 'Wands', 'Fire', 'solid', true, [
        'heads',
        'heads',
        'heads'
    ]),
    C: nucleotideCast('C', 7, 'Young Yin', 'Pentacles', 'Earth', 'broken', false, [
        'tails',
        'tails',
        'heads'
    ]),
    G: nucleotideCast('G', 8, 'Young Yang', 'Swords', 'Air', 'solid', false, [
        'tails',
        'heads',
        'heads'
    ])
});

const CAST_BY_LINE_VALUE: Readonly<Record<M3IChingLineValue, M3IChingNucleotideCast>> =
    Object.freeze({
        6: M3_NUCLEOTIDE_I_CHING_CASTS.A,
        7: M3_NUCLEOTIDE_I_CHING_CASTS.C,
        8: M3_NUCLEOTIDE_I_CHING_CASTS.G,
        9: M3_NUCLEOTIDE_I_CHING_CASTS.T
    });

export function m3IChingCastModelFromSurface(
    surface: M3ProjectionSurface,
    castResult?: IChingCastResult
): M3IChingCastRibbonModel {
    const sourceCodon = stringValue(surface.activeProjection.codon);
    const codonNucleotides = parseCodonNucleotides(sourceCodon);
    const castLines = castResult?.lines.filter(isLineValue) ?? [];
    const lines =
        castLines.length > 0
            ? castLines.map((lineValue, index) =>
                lineViewFromValue(lineValue, index, 'cast-result', null)
            )
            : codonNucleotides.map((nucleotide, index) =>
                lineViewFromNucleotide(nucleotide, index, 'codon')
            );
    const primaryHexagramId = castResult?.primaryHexagramId ?? numberValue(surface.activeProjection.hexagramId);
    const derivedHexagramId = castResult?.derivedHexagramId ?? null;
    const changingLineIndices =
        castResult?.changingLineIndices.filter(index => index >= 0 && index <= 5) ??
        lines.filter(line => line.changing).map(line => line.lineIndex);

    return Object.freeze({
        castMethod: castResult?.castMethod ?? 'three-coin',
        sourceCodon,
        ready: lines.length > 0,
        pendingReason: lines.length > 0 ? null : 'surface.activeProjection.codon missing A/T/C/G state',
        lines: Object.freeze(lines),
        primaryHexagramId,
        primaryHexagramGlyph: hexagramGlyph(primaryHexagramId),
        derivedHexagramId,
        derivedHexagramGlyph: hexagramGlyph(derivedHexagramId),
        changingLineIndices: Object.freeze(changingLineIndices)
    });
}

export const M3IChingCastRibbon: React.FC<M3IChingCastRibbonProps> = ({
    surface,
    castResult,
    onCast
}) => {
    const profileTick = useM3ProfileTick();
    const inheritedReadiness = useM3Readiness();
    const [castPending, setCastPending] = React.useState(false);
    const model = React.useMemo(
        () => m3IChingCastModelFromSurface(surface, castResult),
        [surface, castResult]
    );

    React.useEffect(() => {
        if (castResult) {
            setCastPending(false);
        }
    }, [castResult]);

    const dispatchCast = React.useCallback(() => {
        setCastPending(true);
        try {
            onCast();
        } catch (error) {
            setCastPending(false);
            throw error;
        }
    }, [onCast]);

    const castState = castPending ? 'frozen-awaiting-result' : model.ready ? 'ready' : 'pending';

    return (
        <article
            className="m3-iching-cast-ribbon"
            data-widget-id={M3_ICHING_CAST_WIDGET_ID}
            data-cast-method={model.castMethod}
            data-rpc-method={M3_ICHING_CAST_RPC}
            data-cast-state={castState}
            data-source-codon={model.sourceCodon ?? 'pending'}
            data-profile-tick={profileTick.tick ?? 'pending'}
            data-context-readiness={inheritedReadiness.snapshot.state}
            style={rootStyle}
        >
            <section style={leftRailStyle} aria-label="I-Ching cast controls">
                <button
                    type="button"
                    onClick={dispatchCast}
                    disabled={castPending}
                    data-cast-action="three-coin"
                    data-rpc-method={M3_ICHING_CAST_RPC}
                    style={castButtonStyle(castPending)}
                >
                    {castPending ? 'Casting' : 'Cast'}
                </button>
                <div aria-label="A=6 T=9 C=7 G=8 correspondence" style={legendStyle}>
                    {(Object.keys(M3_NUCLEOTIDE_I_CHING_CASTS) as M3IChingNucleotide[]).map(key => {
                        const entry = M3_NUCLEOTIDE_I_CHING_CASTS[key];
                        return (
                            <span
                                key={key}
                                data-nucleotide={key}
                                data-line-value={entry.lineValue}
                                data-tarot-suit={entry.tarotSuit}
                                data-element={entry.element}
                                title={`${key}=${entry.lineValue} ${entry.lineName} / ${entry.tarotSuit} / ${entry.element}`}
                                style={legendChipStyle}
                            >
                                {key}={entry.lineValue}
                            </span>
                        );
                    })}
                </div>
            </section>

            <section
                aria-label="3-coin line strip"
                data-line-count={model.lines.length}
                style={lineStripStyle}
            >
                {model.ready ? (
                    model.lines.map(line => <CastLineView key={line.lineIndex} line={line} />)
                ) : (
                    <ReadinessChip
                        bindingKey="surface.activeProjection.codon"
                        state="pending"
                        style={pendingStyle}
                    >
                        {model.pendingReason}
                    </ReadinessChip>
                )}
            </section>

            <section style={hexagramRailStyle} aria-label="Hexagram propagation">
                <HexagramBadge label="primary" id={model.primaryHexagramId} glyph={model.primaryHexagramGlyph} />
                <span aria-hidden="true" style={propagationStyle}>-&gt;</span>
                <HexagramBadge label="derived" id={model.derivedHexagramId} glyph={model.derivedHexagramGlyph} />
                <span
                    data-changing-lines={model.changingLineIndices.join(',')}
                    style={changingLinesStyle}
                >
                    lines {model.changingLineIndices.length ? model.changingLineIndices.join(',') : 'stable'}
                </span>
            </section>
        </article>
    );
};

export default M3IChingCastRibbon;

const CastLineView: React.FC<{ readonly line: M3IChingCastLineView }> = ({ line }) => (
    <div
        data-cast-line={line.lineIndex}
        data-line-value={line.lineValue}
        data-line-name={line.lineName}
        data-line-shape={line.lineShape}
        data-changing={line.changing ? 'true' : 'false'}
        data-nucleotide={line.nucleotide ?? 'from-cast-result'}
        style={castLineStyle}
    >
        <div aria-label={`line ${line.lineIndex + 1} coins`} style={coinStackStyle}>
            {line.coins.map((coin, index) => (
                <span
                    key={`${line.lineIndex}-${index}`}
                    data-coin-index={index}
                    data-coin-face={coin.face}
                    data-coin-value={coin.value}
                    title={`${coin.face}=${coin.value}`}
                    style={coinStyle(coin.face)}
                >
                    {coin.value}
                </span>
            ))}
        </div>
        <LineShape shape={line.lineShape} changing={line.changing} />
        <div style={lineAnnotationStyle}>
            <strong>{line.lineValue} {line.lineName}</strong>
            <span>{line.tarotSuit} / {line.element}</span>
        </div>
    </div>
);

const LineShape: React.FC<{
    readonly shape: M3IChingNucleotideCast['lineShape'];
    readonly changing: boolean;
}> = ({ shape, changing }) => (
    <div
        aria-label={shape}
        data-line-render={shape}
        data-line-changing={changing ? 'true' : 'false'}
        style={lineShapeContainerStyle}
    >
        {shape === 'solid' ? (
            <span style={lineSegmentStyle(changing, 'full')} />
        ) : (
            <>
                <span style={lineSegmentStyle(changing, 'half')} />
                <span style={lineGapStyle} />
                <span style={lineSegmentStyle(changing, 'half')} />
            </>
        )}
    </div>
);

const HexagramBadge: React.FC<{
    readonly label: string;
    readonly id: number | null;
    readonly glyph: string | null;
}> = ({ label, id, glyph }) => (
    <span data-hexagram-role={label} data-hexagram-id={id ?? 'pending'} style={hexagramBadgeStyle}>
        <span style={hexagramGlyphStyle}>{glyph ?? '--'}</span>
        <span>{label} {id ?? 'pending'}</span>
        <ReadinessChip
            bindingKey={`surface.activeProjection.${label}HexagramId`}
            state={id === null ? 'pending' : 'ready'}
        />
    </span>
);

function nucleotideCast(
    nucleotide: M3IChingNucleotide,
    lineValue: M3IChingLineValue,
    lineName: M3IChingNucleotideCast['lineName'],
    tarotSuit: M3IChingNucleotideCast['tarotSuit'],
    element: M3IChingNucleotideCast['element'],
    lineShape: M3IChingNucleotideCast['lineShape'],
    changing: boolean,
    faces: readonly M3IChingCoinFace[]
): M3IChingNucleotideCast {
    const coins = Object.freeze(faces.map(face => coin(face)));
    const coinSum = coins.reduce((sum, entry) => sum + entry.value, 0);
    if (coinSum !== lineValue) {
        throw new Error(`M3 I-Ching nucleotide ${nucleotide} has invalid 3-coin arithmetic`);
    }
    return Object.freeze({
        nucleotide,
        lineValue,
        lineName,
        tarotSuit,
        element,
        lineShape,
        changing,
        coins
    });
}

function coin(face: M3IChingCoinFace): M3IChingCoin {
    return Object.freeze({
        face,
        value: face === 'heads' ? 3 : 2
    });
}

function lineViewFromNucleotide(
    nucleotide: M3IChingNucleotide,
    lineIndex: number,
    source: M3IChingCastLineView['source']
): M3IChingCastLineView {
    const entry = M3_NUCLEOTIDE_I_CHING_CASTS[nucleotide];
    return lineView(entry, lineIndex, source, nucleotide);
}

function lineViewFromValue(
    lineValue: M3IChingLineValue,
    lineIndex: number,
    source: M3IChingCastLineView['source'],
    nucleotide: M3IChingNucleotide | null
): M3IChingCastLineView {
    return lineView(CAST_BY_LINE_VALUE[lineValue], lineIndex, source, nucleotide);
}

function lineView(
    entry: M3IChingNucleotideCast,
    lineIndex: number,
    source: M3IChingCastLineView['source'],
    nucleotide: M3IChingNucleotide | null
): M3IChingCastLineView {
    const coinSum = entry.coins.reduce((sum, coinEntry) => sum + coinEntry.value, 0);
    return Object.freeze({
        lineIndex,
        source,
        nucleotide,
        lineValue: entry.lineValue,
        lineName: entry.lineName,
        tarotSuit: entry.tarotSuit,
        element: entry.element,
        lineShape: entry.lineShape,
        changing: entry.changing,
        coins: entry.coins,
        coinSum: coinSum as M3IChingLineValue
    });
}

function parseCodonNucleotides(codon: string | null): M3IChingNucleotide[] {
    if (!codon) {
        return [];
    }
    return codon
        .toUpperCase()
        .split('')
        .filter((char): char is M3IChingNucleotide => isNucleotide(char));
}

function isNucleotide(value: string): value is M3IChingNucleotide {
    return value === 'A' || value === 'T' || value === 'C' || value === 'G';
}

function isLineValue(value: number): value is M3IChingLineValue {
    return value === 6 || value === 7 || value === 8 || value === 9;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function hexagramGlyph(id: number | null): string | null {
    if (id === null || id < 1 || id > 64) {
        return null;
    }
    return String.fromCodePoint(0x4dc0 + id - 1);
}

const rootStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(168px, max-content) 1fr minmax(170px, max-content)',
    gap: 12,
    alignItems: 'stretch',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 12,
    background: 'var(--theia-editorWidget-background)',
    color: 'var(--theia-foreground)'
};

const leftRailStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'space-between'
};

function castButtonStyle(pending: boolean): React.CSSProperties {
    return {
        border: '1px solid var(--theia-button-border, var(--theia-contrastBorder))',
        borderRadius: 6,
        padding: '6px 10px',
        background: pending ? 'var(--theia-inputOption-activeBackground)' : 'var(--theia-button-background)',
        color: 'var(--theia-button-foreground)',
        cursor: pending ? 'progress' : 'pointer',
        fontWeight: 600
    };
}

const legendStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 4
};

const legendChipStyle: React.CSSProperties = {
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 6,
    padding: '2px 6px',
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size0)',
    textAlign: 'center',
    background: 'var(--theia-editor-background)'
};

const lineStripStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    alignItems: 'stretch',
    overflowX: 'auto',
    minWidth: 0
};

const castLineStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
    gap: 6,
    minWidth: 96,
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 8,
    background: 'var(--theia-editor-background)'
};

const coinStackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    alignItems: 'center'
};

function coinStyle(face: M3IChingCoinFace): React.CSSProperties {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: '1px solid var(--theia-contrastBorder)',
        background: face === 'heads' ? 'var(--theia-charts-yellow)' : 'var(--theia-editorWidget-background)',
        color: face === 'heads' ? 'var(--theia-editor-background)' : 'var(--theia-foreground)',
        fontFamily: 'var(--theia-monospace-font-family)',
        fontSize: 'var(--theia-ui-font-size0)',
        fontWeight: 700
    };
}

const lineShapeContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 14
};

function lineSegmentStyle(changing: boolean, width: 'full' | 'half'): React.CSSProperties {
    return {
        display: 'inline-block',
        height: 5,
        width: width === 'full' ? 58 : 24,
        borderRadius: 3,
        background: changing ? 'var(--theia-charts-red)' : 'var(--theia-charts-blue)'
    };
}

const lineGapStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 10
};

const lineAnnotationStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    textAlign: 'center',
    fontSize: 'var(--theia-ui-font-size0)',
    lineHeight: 1.25
};

const hexagramRailStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 6,
    alignItems: 'center'
};

const hexagramBadgeStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--theia-contrastBorder)',
    borderRadius: 8,
    padding: 6,
    minWidth: 62,
    background: 'var(--theia-editor-background)',
    fontSize: 'var(--theia-ui-font-size0)'
};

const hexagramGlyphStyle: React.CSSProperties = {
    fontSize: 24,
    lineHeight: 1
};

const propagationStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    fontFamily: 'var(--theia-monospace-font-family)'
};

const changingLinesStyle: React.CSSProperties = {
    gridColumn: '1 / -1',
    color: 'var(--theia-descriptionForeground)',
    fontFamily: 'var(--theia-monospace-font-family)',
    fontSize: 'var(--theia-ui-font-size0)',
    textAlign: 'center'
};

const pendingStyle: React.CSSProperties = {
    alignSelf: 'center',
    border: '1px solid var(--theia-charts-yellow)',
    borderRadius: 999,
    padding: '3px 8px',
    color: 'var(--theia-charts-yellow)',
    fontSize: 'var(--theia-ui-font-size0)'
};
