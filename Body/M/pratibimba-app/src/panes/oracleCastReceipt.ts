/**
 * Coordinate: M' M4' (typed oracle cast receipt - rerun 25.T25.8)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 - strict carrier read-law for governed oracle casts.
 * Actualises: typed I-Ching/Tarot draw facts, OracleSpreadPosition aliveness,
 *   kernel correspondence provenance, and the 5.11 envelope without deriving
 *   any of them in the browser.
 * Public surface: OracleCastReceipt, OraclePosition, parseOracleCastReceipt.
 * Does NOT own: random draws, correspondence LUTs, state transitions, or
 *   interpretation prose.
 * Contract: [[M4'-SPEC]] / design-recon 25.T25.8.
 */

export type OracleLiveState = 'generating' | 'muting' | 'mute';

export interface OraclePosition {
    readonly positionIndex: number;
    readonly cardId: number;
    readonly cardKind: 'hexagram' | 'tarot-major' | 'tarot-pip' | 'tarot-court';
    readonly liveState: OracleLiveState;
    readonly targetAspect: Readonly<Record<string, unknown>> | null;
}

export interface IChingLine {
    readonly lineIndex: number;
    readonly value: 6 | 7 | 8 | 9;
    readonly lineType: 'old-yin' | 'young-yang' | 'young-yin' | 'old-yang';
    readonly moving: boolean;
    readonly nucleotide: 'A' | 'T' | 'C' | 'G';
    readonly codonRef: string;
}

export interface IChingDraw {
    readonly kind: 'iching';
    readonly lines: readonly IChingLine[];
    readonly primaryHexagramId: number;
    readonly relatingHexagramId: number | null;
    readonly nuclearHexagramId: number;
    readonly torusPosition: number;
    readonly body: Readonly<Record<string, unknown>> | null;
}

export interface TarotCard {
    readonly positionIndex: number;
    readonly cardId: number;
    readonly reversed: boolean;
    readonly cardKind: 'tarot-major' | 'tarot-pip' | 'tarot-court';
    readonly label: string;
    readonly codonRef: string | null;
    readonly codonBinding: 'primary' | 'unbound';
    readonly suit: string | null;
    readonly rank: string | null;
    readonly decan: Readonly<Record<string, unknown>> | null;
    readonly planet: Readonly<Record<string, unknown>> | null;
    readonly element: string | null;
    readonly chakra: Readonly<Record<string, unknown>> | null;
    readonly bodyZones: readonly string[];
    readonly chainSource: 'kernel-oracle-luts';
}

export interface TarotDraw {
    readonly kind: 'tarot';
    readonly spreadSize: 3 | 4 | 5;
    readonly cards: readonly TarotCard[];
}

export interface OracleCastReceipt {
    readonly castId: number;
    readonly spreadId: string;
    readonly system: string;
    readonly castAt: number;
    readonly hygiene: string;
    readonly output: string;
    readonly draw: IChingDraw | TarotDraw;
    readonly positions: readonly OraclePosition[];
    readonly envelope: Readonly<Record<string, unknown>>;
    readonly spacetimePublished: boolean;
}

function record(value: unknown, label: string): Readonly<Record<string, unknown>> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Readonly<Record<string, unknown>>;
}

function string(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function integer(value: unknown, label: string, min = 0, max = Number.MAX_SAFE_INTEGER): number {
    if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
        throw new Error(`${label} must be an integer in ${min}..${max}`);
    }
    return value as number;
}

function nullableRecord(value: unknown, label: string): Readonly<Record<string, unknown>> | null {
    return value === null ? null : record(value, label);
}

export function parseOraclePositions(value: unknown): readonly OraclePosition[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error('positions must be a non-empty array');
    }
    return value.map((raw, index) => {
        const item = record(raw, `positions[${index}]`);
        const cardKind = string(item.cardKind, `positions[${index}].cardKind`);
        if (!['hexagram', 'tarot-major', 'tarot-pip', 'tarot-court'].includes(cardKind)) {
            throw new Error(`positions[${index}].cardKind is invalid`);
        }
        const liveState = string(item.liveState, `positions[${index}].liveState`);
        if (!['generating', 'muting', 'mute'].includes(liveState)) {
            throw new Error(`positions[${index}].liveState is invalid`);
        }
        return Object.freeze({
            positionIndex: integer(item.positionIndex, `positions[${index}].positionIndex`, 0, 11),
            cardId: integer(item.cardId, `positions[${index}].cardId`, 0, 77),
            cardKind: cardKind as OraclePosition['cardKind'],
            liveState: liveState as OracleLiveState,
            targetAspect: nullableRecord(item.targetAspect, `positions[${index}].targetAspect`)
        });
    });
}

function ichingDraw(value: unknown): IChingDraw {
    const draw = record(value, 'draw');
    if (!Array.isArray(draw.lines) || draw.lines.length !== 6) {
        throw new Error('draw.lines must contain exactly six lines');
    }
    const lines = draw.lines.map((raw, index) => {
        const line = record(raw, `draw.lines[${index}]`);
        const value = integer(line.value, `draw.lines[${index}].value`, 6, 9);
        const lineType = string(line.lineType, `draw.lines[${index}].lineType`);
        const nucleotide = string(line.nucleotide, `draw.lines[${index}].nucleotide`);
        if (!['old-yin', 'young-yang', 'young-yin', 'old-yang'].includes(lineType)) {
            throw new Error(`draw.lines[${index}].lineType is invalid`);
        }
        if (!['A', 'T', 'C', 'G'].includes(nucleotide)) {
            throw new Error(`draw.lines[${index}].nucleotide is invalid`);
        }
        if (typeof line.moving !== 'boolean') {
            throw new Error(`draw.lines[${index}].moving must be boolean`);
        }
        return Object.freeze({
            lineIndex: integer(line.lineIndex, `draw.lines[${index}].lineIndex`, 1, 6),
            value: value as IChingLine['value'],
            lineType: lineType as IChingLine['lineType'],
            moving: line.moving,
            nucleotide: nucleotide as IChingLine['nucleotide'],
            codonRef: string(line.codonRef, `draw.lines[${index}].codonRef`)
        });
    });
    return Object.freeze({
        kind: 'iching' as const,
        lines,
        primaryHexagramId: integer(draw.primaryHexagramId, 'draw.primaryHexagramId', 1, 64),
        relatingHexagramId:
            draw.relatingHexagramId === null
                ? null
                : integer(draw.relatingHexagramId, 'draw.relatingHexagramId', 1, 64),
        nuclearHexagramId: integer(draw.nuclearHexagramId, 'draw.nuclearHexagramId', 1, 64),
        torusPosition: integer(draw.torusPosition, 'draw.torusPosition', 0, 11),
        body: nullableRecord(draw.body, 'draw.body')
    });
}

function tarotDraw(value: unknown): TarotDraw {
    const draw = record(value, 'draw');
    const spreadSize = integer(draw.spreadSize, 'draw.spreadSize', 3, 5);
    if (![3, 4, 5].includes(spreadSize) || !Array.isArray(draw.cards) || draw.cards.length !== spreadSize) {
        throw new Error('draw.cards must match a 3, 4, or 5 card spread');
    }
    const cards = draw.cards.map((raw, index) => {
        const card = record(raw, `draw.cards[${index}]`);
        const cardKind = string(card.cardKind, `draw.cards[${index}].cardKind`);
        if (!['tarot-major', 'tarot-pip', 'tarot-court'].includes(cardKind)) {
            throw new Error(`draw.cards[${index}].cardKind is invalid`);
        }
        if (typeof card.reversed !== 'boolean') {
            throw new Error(`draw.cards[${index}].reversed must be boolean`);
        }
        if (card.chainSource !== 'kernel-oracle-luts') {
            throw new Error(`draw.cards[${index}].chainSource is invalid`);
        }
        const codonBinding = string(card.codonBinding, `draw.cards[${index}].codonBinding`);
        if (!['primary', 'unbound'].includes(codonBinding)) {
            throw new Error(`draw.cards[${index}].codonBinding is invalid`);
        }
        if (codonBinding === 'unbound' && (cardKind !== 'tarot-major' || card.codonRef !== null)) {
            throw new Error(`draw.cards[${index}] may be unbound only for a Major Arcana card with null codonRef`);
        }
        const bodyZones = Array.isArray(card.bodyZones)
            ? card.bodyZones.map((zone, zoneIndex) => string(zone, `draw.cards[${index}].bodyZones[${zoneIndex}]`))
            : (() => { throw new Error(`draw.cards[${index}].bodyZones must be an array`); })();
        return Object.freeze({
            positionIndex: integer(card.positionIndex, `draw.cards[${index}].positionIndex`, 0, 4),
            cardId: integer(card.cardId, `draw.cards[${index}].cardId`, 0, 77),
            reversed: card.reversed,
            cardKind: cardKind as TarotCard['cardKind'],
            label: string(card.label, `draw.cards[${index}].label`),
            codonRef:
                codonBinding === 'unbound'
                    ? null
                    : string(card.codonRef, `draw.cards[${index}].codonRef`),
            codonBinding: codonBinding as TarotCard['codonBinding'],
            suit: card.suit === null ? null : string(card.suit, `draw.cards[${index}].suit`),
            rank: card.rank === null ? null : string(card.rank, `draw.cards[${index}].rank`),
            decan: nullableRecord(card.decan, `draw.cards[${index}].decan`),
            planet: nullableRecord(card.planet, `draw.cards[${index}].planet`),
            element: card.element === null ? null : string(card.element, `draw.cards[${index}].element`),
            chakra: nullableRecord(card.chakra, `draw.cards[${index}].chakra`),
            bodyZones,
            chainSource: 'kernel-oracle-luts' as const
        });
    });
    return Object.freeze({ kind: 'tarot' as const, spreadSize: spreadSize as 3 | 4 | 5, cards });
}

export function parseOracleCastReceipt(value: unknown): OracleCastReceipt {
    const root = record(value, 'oracle cast receipt');
    const system = string(root.system, 'system');
    const positions = parseOraclePositions(root.positions);
    const draw = parseOracleDraw(system, root.draw);
    if (positions.length !== (draw.kind === 'iching' ? 6 : draw.spreadSize)) {
        throw new Error('positions cardinality must match draw cardinality');
    }
    if (typeof root.spacetimePublished !== 'boolean') {
        throw new Error('spacetimePublished must be boolean');
    }
    return Object.freeze({
        castId: integer(root.castId, 'castId', 1),
        spreadId: string(root.spreadId, 'spreadId'),
        system,
        castAt: integer(root.castAt, 'castAt', 1),
        hygiene: string(root.hygiene, 'hygiene'),
        output: string(root.output, 'output'),
        draw,
        positions,
        envelope: record(root.envelope, 'envelope'),
        spacetimePublished: root.spacetimePublished
    });
}

export function parseOracleDraw(system: string, value: unknown): IChingDraw | TarotDraw {
    return system === 'iching' ? ichingDraw(value) : tarotDraw(value);
}
