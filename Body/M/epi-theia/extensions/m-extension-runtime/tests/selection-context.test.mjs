import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    SELECTION_CONTEXT_ASSEMBLE_METHOD,
    SELECTION_CONTEXT_XRAY_METHOD,
    createCtxFramedContextHandle,
    createSelectionContextRequest,
    selectionFromBlock
} = require('../lib/common/selection-context.js');

function block(overrides = {}) {
    return Object.freeze({
        id: 'block:review-item:44',
        type: 'review-item',
        ctx: Object.freeze({ cf: '(0/1/2)', ct: 'CT2', cp: '4.2' }),
        coordinate: "M5'",
        privacyClass: 'protected',
        provenance: Object.freeze({ kind: 'evidence-envelope', handle: 'review:44' }),
        data: Object.freeze({ title: 'Selection context' }),
        affordances: Object.freeze(['select']),
        ...overrides
    });
}

test('selection context request targets s2 coordinate context_xray with s4 assemble fallback named', () => {
    const selection = selectionFromBlock(block(), 'selected passage', { from: 4, to: 20 });
    const request = createSelectionContextRequest({
        selection,
        includeEpisodes: true,
        requestedBy: 'test-agent'
    });

    assert.equal(request.method, SELECTION_CONTEXT_XRAY_METHOD);
    assert.equal(request.params.fallbackMethod, SELECTION_CONTEXT_ASSEMBLE_METHOD);
    assert.equal(request.params.includeEpisodes, true);
    assert.equal(request.params.selection.kind, 'passage');
    assert.equal(request.params.selection.text, 'selected passage');
});

test('route response normalises into a CTX-framed context handle', () => {
    const source = block();
    const related = block({ id: 'block:evidence:44', type: 'evidence' });
    const handle = createCtxFramedContextHandle({
        selection: selectionFromBlock(source),
        response: {
            handleId: 'ctx:selection:44',
            relatedBlocks: [related, { nope: true }],
            relatedCoordinates: ["M5'", "M4'", 42],
            episodes: [{ id: 'episode:44', summary: 'review loop opened' }, { id: 3 }]
        },
        requestedBy: 'test-agent'
    });

    assert.equal(handle.kind, 'ctx-framed-context-handle');
    assert.equal(handle.id, 'ctx:selection:44');
    assert.deepEqual(handle.ctx, source.ctx);
    assert.equal(handle.privacyClass, 'protected');
    assert.deepEqual(handle.relatedBlocks.map(block => block.id), ['block:evidence:44']);
    assert.deepEqual(handle.relatedCoordinates, ["M5'", "M4'"]);
    assert.deepEqual(handle.episodes.map(episode => episode.id), ['episode:44']);
    assert.equal(handle.provenance.route, SELECTION_CONTEXT_XRAY_METHOD);
    assert.equal(handle.provenance.fallbackUsed, false);
});
