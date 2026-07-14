/**
 * Coordinate: M' M5' (review → blocks projection — Tranche 44.T44.3)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the first real data rendered through the Track-44 standard —
 *   pure mappers from the omnipanel run-model type-graph to CTX-framed
 *   blocks: a genealogy record projects to `review-item` (+`evidence` when
 *   the record carries a ref, +`dispatch-genealogy` lineage), tool events
 *   project to `tool-stream-event`, pattern packets to `pattern-packet`.
 *   Every projected block passes the 44.1 catalog law by construction.
 * Does NOT own: the run-model types (omnipanelRuntime.ts, consumed
 *   unchanged), the verdict loop (44.4 — affordances declared here, actions
 *   land there), the live wire→record producer (track-12 seam; the synthetic
 *   fixture is the acceptance per the 15.T15.11 precedent).
 */

import type { Block } from '../../blocks/blockContract';
import type { DispatchGenealogyRecord } from './dispatchGenealogy';
import type { ToolStreamEvent } from './omnipanelRuntime';

/**
 * The Review fold's own CTX frame (the run-model carries no per-record VAK
 * yet — 12.36 seam): CF (5/0) synthesis return, CT5 integrative review, the
 * `/` membrane's CP. Documented constant, never fabricated per-record data.
 */
export const REVIEW_FOLD_CTX = Object.freeze({
    cf: '(5/0)',
    ct: 'CT5',
    cp: 'CP4.5'
});

export function reviewItemBlock(record: DispatchGenealogyRecord): Block {
    return Object.freeze({
        id: `review-item:${record.id}`,
        type: 'review-item',
        ctx: REVIEW_FOLD_CTX,
        privacyClass: 'protected' as const,
        data: {
            runId: record.id,
            actor: record.actor,
            method: record.route.method,
            capability: record.route.capability,
            status: record.status,
            startedAtMs: record.startedAtMs,
            endedAtMs: record.endedAtMs
        },
        affordances: ['verdict', 'annotate'] as const
    });
}

export function evidenceBlock(record: DispatchGenealogyRecord): Block | null {
    if (!record.evidenceRef) {
        return null;
    }
    return Object.freeze({
        id: `evidence:${record.id}`,
        type: 'evidence',
        ctx: REVIEW_FOLD_CTX,
        privacyClass: 'protected' as const,
        provenance: Object.freeze({ kind: 'evidence-envelope' as const, handle: record.evidenceRef }),
        data: { evidenceRef: record.evidenceRef, runId: record.id },
        affordances: ['navigate'] as const
    });
}

export function dispatchGenealogyBlock(records: readonly DispatchGenealogyRecord[]): Block {
    return Object.freeze({
        id: `dispatch-genealogy:${records[0]?.id ?? 'empty'}`,
        type: 'dispatch-genealogy',
        ctx: REVIEW_FOLD_CTX,
        privacyClass: 'protected' as const,
        data: {
            nodes: records.map(record => ({
                id: record.id,
                parentId: record.parentId,
                actor: record.actor,
                status: record.status
            }))
        },
        affordances: ['navigate', 'select'] as const
    });
}

export function toolStreamEventBlock(event: ToolStreamEvent): Block {
    return Object.freeze({
        id: `tool-stream-event:${event.seq}`,
        type: 'tool-stream-event',
        ctx: REVIEW_FOLD_CTX,
        privacyClass: 'protected' as const,
        data: { seq: event.seq, emittedAtMs: event.emittedAtMs, kind: event.kind, channel: event.channel }
    });
}

export function patternPacketBlock(packet: Readonly<Record<string, unknown>> & { id?: string }): Block {
    return Object.freeze({
        id: `pattern-packet:${packet.id ?? 'packet'}`,
        type: 'pattern-packet',
        ctx: REVIEW_FOLD_CTX,
        privacyClass: 'protected' as const,
        data: packet
    });
}

/** Project a genealogy run into the Review fold's block list. */
export function genealogyToReviewBlocks(records: readonly DispatchGenealogyRecord[]): readonly Block[] {
    const blocks: Block[] = [];
    for (const record of records) {
        blocks.push(reviewItemBlock(record));
        const evidence = evidenceBlock(record);
        if (evidence) {
            blocks.push(evidence);
        }
    }
    if (records.length > 0) {
        blocks.push(dispatchGenealogyBlock(records));
    }
    return Object.freeze(blocks);
}
