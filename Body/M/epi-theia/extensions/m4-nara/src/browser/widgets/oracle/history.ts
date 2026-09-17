export interface IChingCastHistoryEntry {
    readonly timestamp: string;
    readonly hexagramPair: string;
}

export type IChingCastHistory = readonly IChingCastHistoryEntry[];

export interface TarotDrawHistoryEntry {
    readonly timestamp: string;
    readonly cardName: string;
    readonly position: string;
    readonly reversed: boolean;
}

export type TarotDrawHistory = readonly TarotDrawHistoryEntry[];

export const ORACLE_HISTORY_LIMIT = 6;

export function capHistory<T>(entries: readonly T[], limit = ORACLE_HISTORY_LIMIT): readonly T[] {
    return Object.freeze(entries.slice(0, Math.max(0, limit)));
}
