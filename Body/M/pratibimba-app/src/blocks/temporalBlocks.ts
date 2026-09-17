/**
 * Coordinate: M' (temporal blocks transport consumer — Tranche 44.T44.5)
 * Residency: Body/M/pratibimba-app/src/blocks
 * Actualises: the carrier side of the day/now block transport — the gateway
 *   serves a `blocks` projection on `s3'.temporal.context` (LIVE protocol
 *   methods, Redis Hot tier, source `s4'.psyche.state.renderer` — the exact
 *   renderer patch the 44.4 verdict loop writes). This module normalizes the
 *   projection into contract-validated blocks for the owning host; invalid
 *   items are dropped and counted, never rendered.
 * Does NOT own: the projection producer (gateway temporal_context.rs), the
 *   psyche renderer state (44.4 verdictLoop), block rendering (BlockHost).
 */

import { validateBlockContract, type Block } from './blockContract';

export const TEMPORAL_CONTEXT_RPC = "s3'.temporal.context";
export const TEMPORAL_SUBSCRIBE_RPC = "s3'.temporal.subscribe";

export interface TemporalBlocksProjection {
    readonly source: string;
    readonly sessionKey: string | null;
    readonly blocks: readonly Block[];
    readonly droppedInvalidCount: number;
    readonly activeBlockIds: readonly string[];
    readonly currentSelection: string | null;
    readonly pendingVerdict: Readonly<Record<string, unknown>> | null;
}

function record(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

/** Normalise the `blocks` projection off an `s3'.temporal.context` artifact. */
export function normalizeTemporalBlocksProjection(artifact: unknown): TemporalBlocksProjection {
    const root = record(artifact) ?? {};
    const projection = record(root.blocks) ?? {};
    const rawItems = Array.isArray(projection.items) ? projection.items : [];
    const blocks: Block[] = [];
    let dropped = 0;
    for (const item of rawItems) {
        if (validateBlockContract(item).length === 0) {
            blocks.push(item as Block);
        } else {
            dropped += 1;
        }
    }
    return Object.freeze({
        source: typeof projection.source === 'string' ? projection.source : 'unknown',
        sessionKey: typeof projection.sessionKey === 'string' ? projection.sessionKey : null,
        blocks: Object.freeze(blocks),
        droppedInvalidCount: dropped,
        activeBlockIds: Object.freeze(
            (Array.isArray(projection.activeBlockIds) ? projection.activeBlockIds : []).filter(
                (id): id is string => typeof id === 'string'
            )
        ),
        currentSelection:
            typeof projection.currentSelection === 'string' ? projection.currentSelection : null,
        pendingVerdict: record(projection.pendingVerdict) ?? null
    });
}
