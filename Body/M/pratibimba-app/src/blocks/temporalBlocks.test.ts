/**
 * Coordinate: M' (temporal blocks transport tests — Tranche 44.T44.5)
 * Actualises: the consumer-side verification — the `s3'.temporal.context`
 *   blocks projection (source `s4'.psyche.state.renderer`, the exact shape
 *   the gateway's temporal_context.rs serves) normalizes into
 *   contract-validated blocks; invalid items are dropped and counted, never
 *   passed to a host; renderer echoes (selection/pending verdict) survive.
 */

import { describe, expect, it } from 'vitest';
import { normalizeTemporalBlocksProjection } from './temporalBlocks';

/** Mirror of the gateway projection shape (temporal_context.rs json!). */
const WIRE_ARTIFACT = {
    coordinateOwner: "S3'",
    session: { canonicalKey: 'sess-1' },
    blocks: {
        projectionOwner: "S3'",
        source: "s4'.psyche.state.renderer",
        transport: 'day-now-runtime',
        sessionKey: 'sess-1',
        redisKey: 's3:gateway:temporal:session:sess-1:blocks',
        activeBlockIds: ['review-item:run-1'],
        currentSelection: 'review-item:run-1',
        pendingVerdict: { method: 'blocks.verdict', decision: 'reject', blockId: 'review-item:run-1' },
        items: [
            {
                id: 'review-item:run-1',
                type: 'review-item',
                ctx: { cf: '(5/0)', ct: 'CT5', cp: 'CP4.5' },
                privacyClass: 'protected',
                data: { runId: 'run-1' },
                affordances: ['verdict', 'annotate']
            },
            { id: 'broken', type: 'review-item' } // no ctx/privacy/data — must drop
        ]
    }
};

describe('44.5 temporal blocks projection consumer', () => {
    it('normalizes the wire projection into contract-valid blocks and drops invalid items', () => {
        const projection = normalizeTemporalBlocksProjection(WIRE_ARTIFACT);
        expect(projection.source).toBe("s4'.psyche.state.renderer");
        expect(projection.blocks).toHaveLength(1);
        expect(projection.blocks[0].id).toBe('review-item:run-1');
        expect(projection.droppedInvalidCount).toBe(1);
        expect(projection.activeBlockIds).toEqual(['review-item:run-1']);
        expect(projection.currentSelection).toBe('review-item:run-1');
        expect(projection.pendingVerdict?.decision).toBe('reject');
    });

    it('an artifact with no blocks projection yields the honest empty shape', () => {
        const projection = normalizeTemporalBlocksProjection({ session: {} });
        expect(projection.blocks).toHaveLength(0);
        expect(projection.source).toBe('unknown');
        expect(projection.droppedInvalidCount).toBe(0);
    });
});
