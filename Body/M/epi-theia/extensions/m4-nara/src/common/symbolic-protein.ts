import type { OracleFrame } from './oracle-frame';

export type SymbolicProteinFoldState =
    | 'linear'
    | 'folding'
    | 'folded'
    | 'active'
    | 'reviewed'
    | 'dormant';

export type SymbolicProteinSequenceMode =
    | 'motif'
    | 'peptide'
    | 'protein'
    | 'clock-walk'
    | 'spread-chain'
    | 'symbolic-orf';

export interface SymbolicProteinChainNode {
    readonly ordinal: number;
    readonly packetRef: string;
    readonly tarotRef?: string;
    readonly ichingRef?: string;
    readonly codonRef?: string;
    readonly cpPositionRef?: string;
}

export interface SymbolicProteinActivationMarker {
    readonly markerId: string;
    readonly positionRef: string;
    readonly state: 'start' | 'stop' | 'activated' | 'muted' | 'review-required';
    readonly sourceHandle: string;
}

export interface SymbolicProtein {
    readonly proteinId: string;
    readonly frameId: string;
    readonly chainSequence: readonly SymbolicProteinChainNode[];
    readonly foldingState: SymbolicProteinFoldState;
    readonly activationMarkers: readonly SymbolicProteinActivationMarker[];
    readonly sequenceMode: SymbolicProteinSequenceMode;
    readonly oracleFrame?: OracleFrame;
    readonly graphProvenanceHandles?: readonly string[];
    readonly patternPacketHandle?: string;
}

export function isSymbolicProtein(value: unknown): value is SymbolicProtein {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.proteinId) &&
            isNonEmptyString(record.frameId) &&
            Array.isArray(record.chainSequence) &&
            record.chainSequence.length > 0 &&
            record.chainSequence.every(isSymbolicProteinChainNode) &&
            isSymbolicProteinFoldState(record.foldingState) &&
            Array.isArray(record.activationMarkers) &&
            record.activationMarkers.every(isSymbolicProteinActivationMarker) &&
            isSymbolicProteinSequenceMode(record.sequenceMode) &&
            optionalStringArray(record.graphProvenanceHandles) &&
            optionalString(record.patternPacketHandle)
    );
}

function isSymbolicProteinChainNode(value: unknown): value is SymbolicProteinChainNode {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonNegativeInteger(record.ordinal) &&
            isNonEmptyString(record.packetRef) &&
            optionalString(record.tarotRef) &&
            optionalString(record.ichingRef) &&
            optionalString(record.codonRef) &&
            optionalString(record.cpPositionRef)
    );
}

function isSymbolicProteinActivationMarker(value: unknown): value is SymbolicProteinActivationMarker {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.markerId) &&
            isNonEmptyString(record.positionRef) &&
            isActivationMarkerState(record.state) &&
            isNonEmptyString(record.sourceHandle)
    );
}

function isSymbolicProteinFoldState(value: unknown): value is SymbolicProteinFoldState {
    return (
        value === 'linear' ||
        value === 'folding' ||
        value === 'folded' ||
        value === 'active' ||
        value === 'reviewed' ||
        value === 'dormant'
    );
}

function isSymbolicProteinSequenceMode(value: unknown): value is SymbolicProteinSequenceMode {
    return (
        value === 'motif' ||
        value === 'peptide' ||
        value === 'protein' ||
        value === 'clock-walk' ||
        value === 'spread-chain' ||
        value === 'symbolic-orf'
    );
}

function isActivationMarkerState(value: unknown): boolean {
    return (
        value === 'start' ||
        value === 'stop' ||
        value === 'activated' ||
        value === 'muted' ||
        value === 'review-required'
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

function isNonNegativeInteger(value: unknown): value is number {
    return Number.isInteger(value) && typeof value === 'number' && value >= 0;
}
