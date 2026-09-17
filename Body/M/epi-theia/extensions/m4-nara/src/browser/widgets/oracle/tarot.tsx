import * as React from 'react';
import type { MExtensionMiniMode } from '@pratibimba/m-extension-runtime';
import { privacyChromeClass } from '../../privacy-chrome';
import type { TarotDrawHistory } from './history';

export const DRAW_TAROT_CARD_METHOD = 'draw_tarot_card';
export const Q_FRAMESTORE_POSITION_SEMANTICS_METHOD = 'q_framestore.position_semantics';

export type QuaternalPosition = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export interface QuaternalPositionSemantics {
    readonly position: QuaternalPosition;
    readonly label: string;
    readonly semantics: string;
}

export interface TarotDrawResult {
    readonly cardName: string;
    readonly position: QuaternalPosition;
    readonly positionLabel: string;
    readonly reversed: boolean;
    readonly semantics: QuaternalPositionSemantics | null;
}

export interface M4TarotDrawPanelProps {
    readonly result: TarotDrawResult | null;
    readonly history: TarotDrawHistory;
    readonly busy?: boolean;
    readonly readingPosition?: boolean;
    readonly expanded?: boolean;
    readonly mode?: MExtensionMiniMode;
    readonly onDraw: () => void;
    readonly onTogglePosition: () => void;
}

const POSITION_LABELS: Readonly<Record<QuaternalPosition, string>> = Object.freeze({
    P0: 'Ground',
    P1: 'Definition',
    P2: 'Operation',
    P3: 'Pattern',
    P4: 'Context',
    P5: 'Integration'
});

export function normalizeTarotDrawResult(value: unknown): TarotDrawResult {
    const record = objectValue(value);
    const position = normalizePosition(
        record?.position ?? record?.positionKey ?? record?.quaternalPosition ?? record?.drawnPosition
    );
    const card = objectValue(record?.card);
    const cardName = stringValue(record?.cardName ?? record?.name ?? card?.name ?? card?.cardName, 'Unknown card');
    const reversed = booleanValue(record?.reversed ?? record?.isReversed ?? record?.reversalFlag ?? card?.reversed);
    const positionLabel = stringValue(record?.positionLabel ?? record?.label, POSITION_LABELS[position]);
    return Object.freeze({
        cardName,
        position,
        positionLabel,
        reversed,
        semantics: normalizePositionSemantics(record?.semantics ?? record?.positionSemantics, position, positionLabel)
    });
}

export function withPositionSemantics(
    draw: TarotDrawResult,
    value: unknown
): TarotDrawResult {
    return Object.freeze({
        ...draw,
        semantics: normalizePositionSemantics(value, draw.position, draw.positionLabel)
    });
}

export function normalizePositionSemantics(
    value: unknown,
    position: QuaternalPosition,
    fallbackLabel = POSITION_LABELS[position]
): QuaternalPositionSemantics {
    const record = objectValue(value);
    return Object.freeze({
        position,
        label: stringValue(record?.label ?? record?.positionLabel, fallbackLabel),
        semantics: stringValue(record?.semantics ?? record?.text ?? record?.description, '')
    });
}

export const M4TarotDrawPanel: React.FC<M4TarotDrawPanelProps> = ({
    result,
    history,
    busy = false,
    readingPosition = false,
    expanded = false,
    mode = 'compact-card',
    onDraw,
    onTogglePosition
}) => (
    <section
        className={`m4-oracle-mode m4-oracle-tarot ${privacyChromeClass('protected_local')}`}
        data-test="m4-oracle-tarot"
        data-mode={mode}
        data-card-name={result?.cardName ?? ''}
        data-position={result?.position ?? ''}
        data-reversed={result?.reversed ? 'true' : 'false'}
    >
        <header className="m4-oracle-mode-header">
            <h3>Tarot</h3>
            <button type="button" data-test="m4-oracle-draw-card" disabled={busy} onClick={onDraw}>
                {busy ? 'Drawing' : 'Draw card'}
            </button>
        </header>
        {result ? (
            <article className="m4-oracle-tarot-result" data-test="m4-oracle-tarot-result">
                <h4 data-test="m4-oracle-tarot-card">{result.cardName}</h4>
                <dl>
                    <div>
                        <dt>Position</dt>
                        <dd data-test="m4-oracle-tarot-position">{result.position} / {result.positionLabel}</dd>
                    </div>
                    <div>
                        <dt>Orientation</dt>
                        <dd data-test="m4-oracle-tarot-reversal">{result.reversed ? 'reversed' : 'upright'}</dd>
                    </div>
                </dl>
                <button
                    type="button"
                    data-test="m4-oracle-read-position"
                    aria-expanded={expanded}
                    disabled={readingPosition}
                    onClick={onTogglePosition}
                >
                    {expanded ? 'Hide position' : readingPosition ? 'Reading' : 'Read position'}
                </button>
                {expanded ? (
                    <section className="m4-oracle-position-semantics" data-test="m4-oracle-position-semantics">
                        <strong>{result.semantics?.label ?? result.positionLabel}</strong>
                        <p>{result.semantics?.semantics ?? 'Position semantics pending'}</p>
                    </section>
                ) : null}
            </article>
        ) : (
            <p data-test="m4-oracle-tarot-empty">No Tarot card drawn in this session.</p>
        )}
        <ol className="m4-oracle-history" data-test="m4-oracle-tarot-history" data-history-count={history.length}>
            {history.map(entry => (
                <li key={`${entry.timestamp}:${entry.cardName}:${entry.position}`}>
                    <time dateTime={entry.timestamp}>{entry.timestamp}</time>
                    <span>{entry.cardName}</span>
                    <span>{entry.position}</span>
                    <span>{entry.reversed ? 'reversed' : 'upright'}</span>
                </li>
            ))}
        </ol>
    </section>
);

function normalizePosition(value: unknown): QuaternalPosition {
    const raw = stringValue(value, 'P0').toUpperCase();
    return raw === 'P1' || raw === 'P2' || raw === 'P3' || raw === 'P4' || raw === 'P5'
        ? raw
        : 'P0';
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : undefined;
}

function stringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function booleanValue(value: unknown): boolean {
    return value === true || value === 'true' || value === 1;
}
