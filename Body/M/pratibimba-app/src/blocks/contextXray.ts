/**
 * Coordinate: M' (selection → context seam — Tranche 44.T44.6)
 * Residency: Body/M/pratibimba-app/src/blocks
 * Actualises: block/coordinate selection fires `s2'.coordinate.context_xray`
 *   (with `s4'.context.assemble` as the spec-ahead composite), returning
 *   related blocks/coordinates/episodes normalized into a CTX-framed context
 *   handle. Lands stub-or-real per S2' readiness exactly as the tranche
 *   gates: both routes answer `unimplemented` on the live wire today, so the
 *   result carries the honest wire state instead of fabricated context.
 *   Highlight-back rides the app's own cross-pane law: selection writes the
 *   shared coordinate store (the carrier's HighlightService equivalent).
 * Does NOT own: the S2' route bodies (graph-services seam), block rendering,
 *   the coordinate store itself (state/stores.ts).
 */

import { validateBlockContract, type Block } from './blockContract';
import { classifyWireError, type ArenaWireState as XrayWireState } from '../panes/m4DialogicalArena';

export const CONTEXT_XRAY_RPC = "s2'.coordinate.context_xray";
export const CONTEXT_ASSEMBLE_RPC = "s4'.context.assemble";

export interface ContextXrayHandle {
    readonly wireState: XrayWireState;
    readonly coordinate: string | null;
    readonly relatedBlocks: readonly Block[];
    readonly relatedCoordinates: readonly string[];
    readonly episodeHandles: readonly string[];
    readonly droppedInvalidCount: number;
}

function record(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function strings(value: unknown): readonly string[] {
    return Object.freeze(
        (Array.isArray(value) ? value : []).filter((item): item is string => typeof item === 'string')
    );
}

/** Normalise an xray artifact into the CTX-framed context handle. */
export function normalizeContextXray(artifact: unknown, coordinate: string | null): ContextXrayHandle {
    const root = record(artifact) ?? {};
    const rawBlocks = Array.isArray(root.relatedBlocks)
        ? root.relatedBlocks
        : Array.isArray(root.blocks)
          ? root.blocks
          : [];
    const relatedBlocks: Block[] = [];
    let dropped = 0;
    for (const item of rawBlocks) {
        if (validateBlockContract(item).length === 0) {
            relatedBlocks.push(item as Block);
        } else {
            dropped += 1;
        }
    }
    return Object.freeze({
        wireState: 'live',
        coordinate,
        relatedBlocks: Object.freeze(relatedBlocks),
        relatedCoordinates: strings(root.relatedCoordinates ?? root.coordinates),
        episodeHandles: strings(root.episodeHandles ?? root.episodes),
        droppedInvalidCount: dropped
    });
}

/** The honest handle for a refused/unwired xray call. */
export function pendingContextXray(err: unknown, coordinate: string | null): ContextXrayHandle {
    return Object.freeze({
        wireState: classifyWireError(err),
        coordinate,
        relatedBlocks: Object.freeze([]),
        relatedCoordinates: Object.freeze([]),
        episodeHandles: Object.freeze([]),
        droppedInvalidCount: 0
    });
}
