import type { DeckContext } from './deck-context';

export type OracleReadingDirection =
    | 'Day'
    | "Night'"
    | 'day'
    | 'night'
    | 'night-prime'
    | 'inverse'
    | 'clockwise'
    | 'counterclockwise';

export type OracleSpreadType =
    | 'single-card'
    | 'compressed-triad'
    | 'sixfold-ql-traverse'
    | 'night-inverse-pass'
    | 'depth-4-5-pass'
    | 'clock-walk'
    | 'symbolic-orf'
    | string;

export interface OracleVakAddress {
    readonly cpf: string;
    readonly ct: string;
    readonly cp: readonly string[];
    readonly cf: string;
    readonly cfp: string;
    readonly cs: string;
}

export interface OraclePositionSemantics {
    readonly key: string;
    readonly ordinal: number;
    readonly cpPositionRef: string;
    readonly label?: string;
    readonly role?: string;
    readonly complementaryKey?: string;
    readonly vakAddress?: OracleVakAddress;
}

export interface OracleFrame {
    readonly frameId: string;
    readonly spreadType: OracleSpreadType;
    readonly deckContext: DeckContext;
    readonly positions: readonly OraclePositionSemantics[];
    readonly readingDirection: OracleReadingDirection;
    readonly vakAddress: OracleVakAddress;
    readonly subjectHandle?: string;
    readonly dayNowHandle?: string;
    readonly graphProvenanceHandles?: readonly string[];
}

export function isOracleFrame(value: unknown): value is OracleFrame {
    const record = objectValue(value);
    if (!record) {
        return false;
    }
    return (
        isNonEmptyString(record.frameId) &&
        isNonEmptyString(record.spreadType) &&
        isDeckContextLike(record.deckContext) &&
        Array.isArray(record.positions) &&
        record.positions.length > 0 &&
        record.positions.every(isOraclePositionSemantics) &&
        isNonEmptyString(record.readingDirection) &&
        isOracleVakAddress(record.vakAddress) &&
        optionalString(record.subjectHandle) &&
        optionalString(record.dayNowHandle) &&
        optionalStringArray(record.graphProvenanceHandles)
    );
}

export function isOracleVakAddress(value: unknown): value is OracleVakAddress {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.cpf) &&
            isNonEmptyString(record.ct) &&
            Array.isArray(record.cp) &&
            record.cp.length > 0 &&
            record.cp.every(isNonEmptyString) &&
            isNonEmptyString(record.cf) &&
            isNonEmptyString(record.cfp) &&
            isNonEmptyString(record.cs)
    );
}

function isOraclePositionSemantics(value: unknown): value is OraclePositionSemantics {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.key) &&
            isNonNegativeInteger(record.ordinal) &&
            isNonEmptyString(record.cpPositionRef) &&
            optionalString(record.label) &&
            optionalString(record.role) &&
            optionalString(record.complementaryKey) &&
            (record.vakAddress === undefined || isOracleVakAddress(record.vakAddress))
    );
}

function isDeckContextLike(value: unknown): value is DeckContext {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.deckName) &&
            isPositiveInteger(record.cardCount) &&
            objectValue(record.currentDrawState) &&
            objectValue(record.spreadBinding)
    );
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : undefined;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function optionalString(value: unknown): boolean {
    return value === undefined || isNonEmptyString(value);
}

function optionalStringArray(value: unknown): boolean {
    return value === undefined || (Array.isArray(value) && value.every(isNonEmptyString));
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && typeof value === 'number' && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
    return Number.isInteger(value) && typeof value === 'number' && value >= 0;
}
