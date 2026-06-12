export type DeckContextRole = 'macro' | 'session' | 'reviewed';

export type DeckDrawStatus = 'idle' | 'drawing' | 'drawn' | 'sealed' | 'reviewed';

export type DeckEntropyMode =
    | 'deterministic'
    | 'manual'
    | 'seeded'
    | 'shuffled'
    | 'external';

export interface DeckDrawCardRef {
    readonly cardRef: string;
    readonly ordinal: number;
    readonly positionKey?: string;
    readonly drawnAt?: string;
}

export interface DeckDrawState {
    readonly drawId: string;
    readonly status: DeckDrawStatus;
    readonly entropyMode: DeckEntropyMode;
    readonly drawnCards: readonly DeckDrawCardRef[];
    readonly provenanceHandles: readonly string[];
}

export interface DeckSpreadBinding {
    readonly frameId: string;
    readonly spreadType: string;
    readonly positionKeys: readonly string[];
}

export interface DeckContext {
    readonly deckName: string;
    readonly cardCount: number;
    readonly currentDrawState: DeckDrawState;
    readonly spreadBinding: DeckSpreadBinding;
    readonly role?: DeckContextRole;
    readonly deckRef?: string;
    readonly macroDeckRef?: string;
    readonly sessionDeckRef?: string;
    readonly deckOrderHash?: string;
}

export function isDeckContext(value: unknown): value is DeckContext {
    const record = objectValue(value);
    if (!record) {
        return false;
    }
    const drawState = objectValue(record.currentDrawState);
    const spreadBinding = objectValue(record.spreadBinding);
    return (
        isNonEmptyString(record.deckName) &&
        isPositiveInteger(record.cardCount) &&
        isDeckDrawState(drawState) &&
        isDeckSpreadBinding(spreadBinding)
    );
}

export function isDeckDrawState(value: unknown): value is DeckDrawState {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.drawId) &&
            isDeckDrawStatus(record.status) &&
            isDeckEntropyMode(record.entropyMode) &&
            Array.isArray(record.drawnCards) &&
            record.drawnCards.every(isDeckDrawCardRef) &&
            Array.isArray(record.provenanceHandles) &&
            record.provenanceHandles.every(isNonEmptyString)
    );
}

function isDeckDrawCardRef(value: unknown): value is DeckDrawCardRef {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.cardRef) &&
            isNonNegativeInteger(record.ordinal) &&
            optionalString(record.positionKey) &&
            optionalString(record.drawnAt)
    );
}

function isDeckSpreadBinding(value: unknown): value is DeckSpreadBinding {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.frameId) &&
            isNonEmptyString(record.spreadType) &&
            Array.isArray(record.positionKeys) &&
            record.positionKeys.length > 0 &&
            record.positionKeys.every(isNonEmptyString)
    );
}

function isDeckDrawStatus(value: unknown): value is DeckDrawStatus {
    return value === 'idle' || value === 'drawing' || value === 'drawn' || value === 'sealed' || value === 'reviewed';
}

function isDeckEntropyMode(value: unknown): value is DeckEntropyMode {
    return (
        value === 'deterministic' ||
        value === 'manual' ||
        value === 'seeded' ||
        value === 'shuffled' ||
        value === 'external'
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

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && typeof value === 'number' && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
    return Number.isInteger(value) && typeof value === 'number' && value >= 0;
}
