/**
 * Coordinate: M' M4' (structured oracle history read-law - rerun 25.T25.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #5 - strict history/aliveness projection.
 * Actualises: timestamped reverse-chronological casts, 4-hour decay, and the
 *   durable OracleSpreadPosition join returned by nara.oracle.history.read.
 * Public surface: OracleHistoryEntry, OracleHistoryRead,
 *   parseOracleHistoryProjection, decayStateAt.
 * Does NOT own: ledger order, timestamps, draw facts, or position state.
 * Contract: [[M4'-SPEC]] / design-recon 25.T25.9.
 */

import {
    parseOracleDraw,
    parseOraclePositions,
    type IChingDraw,
    type OraclePosition,
    type TarotDraw
} from './oracleCastReceipt';

export const ORACLE_DECAY_WINDOW_MINUTES = 240;
export const ORACLE_OPEN_WINDOW_MINUTES = 10;

export type OracleModality = 'i-ching' | 'tarot';
export type OracleDecayState = 'open' | 'decay-active' | 'closed';

export interface OracleHistoryEntry {
    readonly castId: number;
    readonly spreadId: string;
    readonly system: string;
    readonly modality: OracleModality;
    readonly questionPrefix: string;
    readonly castAt: number;
    readonly hygiene: string;
    readonly draw: IChingDraw | TarotDraw;
    readonly positions: readonly OraclePosition[];
}

export type OracleHistoryRead =
    | { readonly kind: 'ledger'; readonly totalCount: number; readonly generatedAt: number; readonly entries: readonly OracleHistoryEntry[] }
    | { readonly kind: 'empty' }
    | { readonly kind: 'refused'; readonly reason: string };

function record(value: unknown, label: string): Readonly<Record<string, unknown>> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
    return value as Readonly<Record<string, unknown>>;
}

function integer(value: unknown, label: string, min = 0): number {
    if (!Number.isInteger(value) || (value as number) < min) throw new Error(`${label} must be an integer >= ${min}`);
    return value as number;
}

function string(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`);
    return value;
}

export function oracleModality(system: string): OracleModality {
    return system === 'iching' ? 'i-ching' : 'tarot';
}

export function parseOracleHistoryProjection(value: unknown): OracleHistoryRead {
    try {
        const root = record(value, 'oracle history');
        const totalCount = integer(root.totalCount, 'totalCount');
        const generatedAt = integer(root.generatedAt, 'generatedAt', 1);
        if (!Array.isArray(root.entries)) throw new Error('entries must be an array');
        if (root.entries.length === 0) return totalCount === 0 ? { kind: 'empty' } : { kind: 'refused', reason: 'nonzero totalCount with no entries' };
        const entries = root.entries.map((raw, index) => {
            const row = record(raw, `entries[${index}]`);
            const system = string(row.system, `entries[${index}].system`);
            const castAt = integer(row.castAt, `entries[${index}].castAt`, 1);
            return Object.freeze({
                castId: integer(row.castId, `entries[${index}].castId`, 1),
                spreadId: string(row.spreadId, `entries[${index}].spreadId`),
                system,
                modality: oracleModality(system),
                questionPrefix: string(row.questionPrefix, `entries[${index}].questionPrefix`),
                castAt,
                hygiene: string(row.hygiene, `entries[${index}].hygiene`),
                draw: parseOracleDraw(system, row.draw),
                positions: parseOraclePositions(row.positions)
            });
        });
        for (let index = 1; index < entries.length; index += 1) {
            if (entries[index].castAt > entries[index - 1].castAt) {
                throw new Error('entries must be newest-first');
            }
        }
        return { kind: 'ledger', totalCount, generatedAt, entries };
    } catch (error) {
        return { kind: 'refused', reason: error instanceof Error ? error.message : String(error) };
    }
}

export function decayStateAt(castAtEpoch: number, nowEpoch: number): OracleDecayState {
    const ageMinutes = Math.max(0, nowEpoch - castAtEpoch) / 60;
    if (ageMinutes < ORACLE_OPEN_WINDOW_MINUTES) return 'open';
    if (ageMinutes < ORACLE_DECAY_WINDOW_MINUTES) return 'decay-active';
    return 'closed';
}
