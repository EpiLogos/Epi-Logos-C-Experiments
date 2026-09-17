import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    LiveBlockTransport,
    blocksFromTemporalContext
} = require('../lib/common/block-transport.js');

function reviewBlock(id, type = 'review-item') {
    return Object.freeze({
        id,
        type,
        ctx: Object.freeze({ cf: '(0/1/2)', ct: 'CT2', cp: '4.2' }),
        coordinate: "M5'",
        privacyClass: 'protected',
        provenance: Object.freeze({
            kind: 'evidence-envelope',
            handle: id
        }),
        data: Object.freeze({ title: id }),
        affordances: Object.freeze(['select'])
    });
}

test('temporal context blocks projection is extracted only from the day-now runtime surface', () => {
    const block = reviewBlock('block:review-item:44');
    const context = Object.freeze({
        blocks: Object.freeze({
            transport: 'day-now-runtime',
            items: Object.freeze([block])
        })
    });

    assert.deepEqual(blocksFromTemporalContext(context), [block]);
    assert.deepEqual(blocksFromTemporalContext({ blocks: { transport: 'ctx', items: [block] } }), []);
    assert.deepEqual(blocksFromTemporalContext({ blocks: { transport: 'day-now-runtime', items: 'bad' } }), []);
});

test('live block transport dispatches arriving temporal blocks to the owning host only', () => {
    const transport = new LiveBlockTransport({
        ownerForBlock: block => block.type === 'review-item' ? 'm5-epii' : 'agentic-control-room'
    });
    const m5Seen = [];
    const acrSeen = [];
    transport.registerHost({
        ownerExtensionId: 'm5-epii',
        setBlocks: blocks => m5Seen.push(blocks.map(block => block.id))
    });
    transport.registerHost({
        ownerExtensionId: 'agentic-control-room',
        setBlocks: blocks => acrSeen.push(blocks.map(block => block.id))
    });

    const review = reviewBlock('block:review-item:44', 'review-item');
    const genealogy = reviewBlock('block:dispatch-genealogy:44', 'dispatch-genealogy');
    const accepted = transport.dispatchTemporalContext({
        blocks: {
            transport: 'day-now-runtime',
            items: [review, genealogy]
        }
    });

    assert.equal(accepted, 2);
    assert.deepEqual(m5Seen, [['block:review-item:44']]);
    assert.deepEqual(acrSeen, [['block:dispatch-genealogy:44']]);
});
