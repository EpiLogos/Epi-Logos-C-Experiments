import * as React from 'react';
import type { MExtensionMiniMode } from '@pratibimba/m-extension-runtime';
import { privacyChromeClass } from '../../privacy-chrome';
import type { IChingCastHistory } from './history';

export const QUERY_ICHING_READING_METHOD = 'query_iching_reading';

export type IChingLineValue = 6 | 7 | 8 | 9;
export type IChingNucleotide = 'A' | 'T' | 'C' | 'G';
export type IChingLinePolarity = 'yin' | 'yang';

export interface IChingLine {
    readonly index: number;
    readonly value: IChingLineValue;
    readonly nucleotide: IChingNucleotide;
    readonly polarity: IChingLinePolarity;
    readonly moving: boolean;
    readonly label: string;
}

export interface IChingReading {
    readonly judgement: string;
    readonly image: string;
    readonly lines: readonly string[];
}

export interface IChingCastResult {
    readonly lines: readonly IChingLine[];
    readonly hexagramNumber: number;
    readonly hexagramGlyph: string;
    readonly upperTrigram: string;
    readonly lowerTrigram: string;
    readonly movingLines: readonly number[];
    readonly transformedHexagramNumber: number | null;
    readonly transformedHexagramGlyph: string | null;
    readonly transformedUpperTrigram: string | null;
    readonly transformedLowerTrigram: string | null;
    readonly reading: IChingReading | null;
}

export interface M4IChingCastPanelProps {
    readonly result: IChingCastResult | null;
    readonly history: IChingCastHistory;
    readonly busy?: boolean;
    readonly mode?: MExtensionMiniMode;
    readonly onCast: () => void;
}

type RandomSource = () => number;

const LINE_BY_VALUE: Readonly<Record<IChingLineValue, Omit<IChingLine, 'index'>>> = Object.freeze({
    6: Object.freeze({
        value: 6,
        nucleotide: 'A',
        polarity: 'yin',
        moving: true,
        label: 'old yin'
    }),
    7: Object.freeze({
        value: 7,
        nucleotide: 'C',
        polarity: 'yin',
        moving: false,
        label: 'young yin'
    }),
    8: Object.freeze({
        value: 8,
        nucleotide: 'G',
        polarity: 'yang',
        moving: false,
        label: 'young yang'
    }),
    9: Object.freeze({
        value: 9,
        nucleotide: 'T',
        polarity: 'yang',
        moving: true,
        label: 'old yang'
    })
});

const TRIGRAM_BY_BITS: Readonly<Record<number, string>> = Object.freeze({
    0: 'Kun',
    1: 'Zhen',
    2: 'Kan',
    3: 'Dui',
    4: 'Gen',
    5: 'Li',
    6: 'Xun',
    7: 'Qian'
});

export function castIChingWithThreeCoins(random: RandomSource = Math.random): IChingCastResult {
    const lines = Array.from({ length: 6 }, (_, index) => castLine(index + 1, random));
    return buildIChingCastResult(lines, null);
}

export function buildIChingCastResult(
    lines: readonly IChingLine[],
    reading: IChingReading | null = null
): IChingCastResult {
    if (lines.length !== 6) {
        throw new Error(`I-Ching cast requires exactly 6 lines; received ${lines.length}`);
    }
    const hexagramNumber = hexagramNumberForLines(lines);
    const movingLines = Object.freeze(lines.filter(line => line.moving).map(line => line.index));
    const transformedLines = lines.map(line => transformMovingLine(line));
    const transformedHexagramNumber = movingLines.length > 0
        ? hexagramNumberForLines(transformedLines)
        : null;
    const trigrams = trigramsForLines(lines);
    const transformedTrigrams = movingLines.length > 0
        ? trigramsForLines(transformedLines)
        : null;

    return Object.freeze({
        lines: Object.freeze([...lines]),
        hexagramNumber,
        hexagramGlyph: hexagramGlyph(hexagramNumber),
        upperTrigram: trigrams.upper,
        lowerTrigram: trigrams.lower,
        movingLines,
        transformedHexagramNumber,
        transformedHexagramGlyph: transformedHexagramNumber ? hexagramGlyph(transformedHexagramNumber) : null,
        transformedUpperTrigram: transformedTrigrams?.upper ?? null,
        transformedLowerTrigram: transformedTrigrams?.lower ?? null,
        reading
    });
}

export function normalizeIChingReading(value: unknown): IChingReading {
    const record = objectValue(value);
    const lines = record ? stringArray(record.lines ?? record.lineTexts ?? record.movingLines) : [];
    return Object.freeze({
        judgement: stringValue(record?.judgement ?? record?.judgment ?? record?.hexagramJudgement),
        image: stringValue(record?.image ?? record?.hexagramImage),
        lines: Object.freeze(lines)
    });
}

export function movingLineTexts(result: IChingCastResult): readonly string[] {
    if (!result.reading) {
        return Object.freeze([]);
    }
    return Object.freeze(
        result.movingLines.map(lineIndex => result.reading?.lines[lineIndex - 1] ?? '').filter(text => text.length > 0)
    );
}

export function hexagramPairLabel(result: IChingCastResult): string {
    return result.transformedHexagramNumber
        ? `${result.hexagramNumber}->${result.transformedHexagramNumber}`
        : String(result.hexagramNumber);
}

export const M4IChingCastPanel: React.FC<M4IChingCastPanelProps> = ({
    result,
    history,
    busy = false,
    mode = 'compact-card',
    onCast
}) => (
    <section
        className={`m4-oracle-mode m4-oracle-iching ${privacyChromeClass('protected_local')}`}
        data-test="m4-oracle-iching"
        data-mode={mode}
        data-line-count={result?.lines.length ?? 0}
        data-hexagram-number={result?.hexagramNumber ?? ''}
        data-moving-lines={result?.movingLines.join(',') ?? ''}
    >
        <header className="m4-oracle-mode-header">
            <h3>I-Ching</h3>
            <button type="button" data-test="m4-oracle-cast-coins" disabled={busy} onClick={onCast}>
                {busy ? 'Casting' : 'Cast coins'}
            </button>
        </header>
        {result ? (
            <div className="m4-oracle-iching-result" data-test="m4-oracle-iching-result">
                <HexagramSummary result={result} transformed={false} />
                {result.transformedHexagramNumber ? (
                    <HexagramSummary result={result} transformed />
                ) : null}
                <ol className="m4-oracle-lines" data-test="m4-oracle-iching-lines">
                    {result.lines.map(line => (
                        <li
                            key={line.index}
                            data-test="m4-oracle-iching-line"
                            data-line-index={line.index}
                            data-line-value={line.value}
                            data-moving={line.moving ? 'true' : 'false'}
                        >
                            <span>{line.index}</span>
                            <strong>{line.nucleotide}={line.value}</strong>
                            <span>{line.label}</span>
                        </li>
                    ))}
                </ol>
                <ReadingBlock result={result} />
            </div>
        ) : (
            <p data-test="m4-oracle-iching-empty">No I-Ching cast in this session.</p>
        )}
        <HistoryList history={history} />
    </section>
);

const HexagramSummary: React.FC<{ readonly result: IChingCastResult; readonly transformed: boolean }> = ({
    result,
    transformed
}) => {
    const number = transformed ? result.transformedHexagramNumber : result.hexagramNumber;
    const glyph = transformed ? result.transformedHexagramGlyph : result.hexagramGlyph;
    const upper = transformed ? result.transformedUpperTrigram : result.upperTrigram;
    const lower = transformed ? result.transformedLowerTrigram : result.lowerTrigram;
    if (!number || !glyph || !upper || !lower) {
        return null;
    }
    return (
        <article className="m4-oracle-hexagram" data-test={transformed ? 'm4-oracle-transformed-hexagram' : 'm4-oracle-primary-hexagram'}>
            <span className="m4-oracle-hexagram-glyph" aria-hidden="true">{glyph}</span>
            <div>
                <strong>{transformed ? 'Transformed' : 'Primary'} #{number}</strong>
                <span>{upper} over {lower}</span>
            </div>
        </article>
    );
};

const ReadingBlock: React.FC<{ readonly result: IChingCastResult }> = ({ result }) => {
    const lineTexts = movingLineTexts(result);
    return (
        <section className="m4-oracle-reading" data-test="m4-oracle-iching-reading">
            <p data-test="m4-oracle-iching-judgement">{result.reading?.judgement ?? 'Judgement pending'}</p>
            <p data-test="m4-oracle-iching-image">{result.reading?.image ?? 'Image pending'}</p>
            {lineTexts.length > 0 ? (
                <ol data-test="m4-oracle-iching-moving-line-texts">
                    {lineTexts.map((text, index) => (
                        <li key={`${result.movingLines[index]}:${text}`}>
                            Line {result.movingLines[index]}: {text}
                        </li>
                    ))}
                </ol>
            ) : null}
        </section>
    );
};

const HistoryList: React.FC<{ readonly history: IChingCastHistory }> = ({ history }) => (
    <ol className="m4-oracle-history" data-test="m4-oracle-iching-history" data-history-count={history.length}>
        {history.map(entry => (
            <li key={`${entry.timestamp}:${entry.hexagramPair}`}>
                <time dateTime={entry.timestamp}>{entry.timestamp}</time>
                <span>{entry.hexagramPair}</span>
            </li>
        ))}
    </ol>
);

function castLine(index: number, random: RandomSource): IChingLine {
    const value = (coinValue(random) + coinValue(random) + coinValue(random)) as IChingLineValue;
    return Object.freeze({ ...LINE_BY_VALUE[value], index });
}

function coinValue(random: RandomSource): 2 | 3 {
    return random() < 0.5 ? 2 : 3;
}

function transformMovingLine(line: IChingLine): IChingLine {
    if (line.value === 6) {
        return Object.freeze({ ...LINE_BY_VALUE[8], index: line.index });
    }
    if (line.value === 9) {
        return Object.freeze({ ...LINE_BY_VALUE[7], index: line.index });
    }
    return line;
}

function hexagramNumberForLines(lines: readonly IChingLine[]): number {
    const bits = lines.reduce((acc, line, index) => acc + (line.polarity === 'yang' ? 2 ** index : 0), 0);
    return bits + 1;
}

function hexagramGlyph(hexagramNumber: number): string {
    const normalized = Math.min(64, Math.max(1, hexagramNumber));
    return String.fromCodePoint(0x4dc0 + normalized - 1);
}

function trigramsForLines(lines: readonly IChingLine[]): { readonly upper: string; readonly lower: string } {
    return Object.freeze({
        lower: TRIGRAM_BY_BITS[trigramBits(lines.slice(0, 3))],
        upper: TRIGRAM_BY_BITS[trigramBits(lines.slice(3, 6))]
    });
}

function trigramBits(lines: readonly IChingLine[]): number {
    return lines.reduce((acc, line, index) => acc + (line.polarity === 'yang' ? 2 ** index : 0), 0);
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : undefined;
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown): readonly string[] {
    if (Array.isArray(value)) {
        return value.map(item => {
            const record = objectValue(item);
            return stringValue(record?.text ?? record?.body ?? item);
        });
    }
    const record = objectValue(value);
    if (!record) {
        return [];
    }
    return [1, 2, 3, 4, 5, 6].map(index => stringValue(record[String(index)] ?? record[`line${index}`]));
}
