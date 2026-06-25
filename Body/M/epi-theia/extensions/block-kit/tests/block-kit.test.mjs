import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtime = require('../../m-extension-runtime/lib/common/block-contract.js');
const {
    BLOCK_KIT_GATEWAY_METHOD_CONTRACTS,
    BLOCK_KIT_SURFACE_REGISTRATIONS,
    CORE_BLOCK_OWNER_REGISTRATIONS,
    applyBlockSessionOperation,
    createBlockDoc,
    createDefaultBlockRegistry,
    createRendererSessionState,
    createVerdictOperation,
    parseBlockDoc,
    serializeBlockDoc
} = require('../lib/common/index.js');

function block(overrides = {}) {
    return {
        id: 'block:review:44',
        type: 'review-item',
        ctx: {
            cf: '(0/1/2)',
            ct: 'CT2',
            cp: '4.2',
            cpf: 'review-loop',
            cs: 'day'
        },
        coordinate: 'M5-4',
        privacyClass: 'protected',
        provenance: {
            kind: 'evidence-envelope',
            handle: 'evidence:44'
        },
        data: {
            title: 'Track 44 verdict'
        },
        affordances: ['verdict', 'annotate'],
        ...overrides
    };
}

test('core block registry has no orphan block types', () => {
    const registry = createDefaultBlockRegistry();
    assert.deepEqual(registry.noOrphanErrors(), []);
    assert.equal(CORE_BLOCK_OWNER_REGISTRATIONS.length, runtime.CORE_BLOCK_TYPES.length);
    assert.deepEqual(
        [...CORE_BLOCK_OWNER_REGISTRATIONS].map(row => row.type).sort(),
        [...runtime.CORE_BLOCK_TYPES].sort()
    );
});

test('gateway method contracts have explicit owners and routes', () => {
    const methods = BLOCK_KIT_GATEWAY_METHOD_CONTRACTS.map(entry => entry.method);
    assert.deepEqual(methods, [
        'blocks.catalog',
        'blocks.annotate',
        'blocks.verdict',
        'blocks.doc.persist',
        'blocks.doc.read'
    ]);
    for (const entry of BLOCK_KIT_GATEWAY_METHOD_CONTRACTS) {
        assert.ok(entry.ownerExtensionId.length > 0);
        assert.ok(entry.contractEntryId.startsWith('BK-GW-'));
        assert.ok(entry.routesTo.length > 0);
    }
});

test('surface registrations include ACR, evidence inspector, and M0-M5 block consumers', () => {
    const bySurface = new Map(BLOCK_KIT_SURFACE_REGISTRATIONS.map(row => [row.surfaceId, row]));
    assert.deepEqual(bySurface.get('acr.dispatch-trace')?.renderedBlockTypes, ['dispatch-genealogy']);
    assert.deepEqual(bySurface.get('acr.tool-stream')?.renderedBlockTypes, ['tool-stream-event']);
    assert.ok(bySurface.get('ide-shell.evidence-inspector')?.renderedBlockTypes.includes('evidence'));
    for (const id of ['m0.data-model', 'm1.diagram', 'm2.resonance', 'm3.kairos', 'm4.patterns', 'm5.review']) {
        assert.ok(bySurface.has(id), `${id} must be registered`);
    }
});

test('verdict operation round-trips through renderer session state after Human Gate approval', () => {
    const b = block();
    const state = createRendererSessionState([b]);
    const op = createVerdictOperation({
        block: b,
        decision: 'approve',
        actor: 'human',
        actorIsHuman: true,
        reason: 'accepted in M5 review surface',
        humanGate: { ok: true }
    });
    const next = applyBlockSessionOperation(state, op);
    assert.equal(next.currentSelection, b.id);
    assert.equal(next.pendingVerdict?.decision, 'approve');
    assert.equal(next.appliedOperations.length, 1);
});

test('block docs round-trip in markdown and MDX with the same validated block payload', () => {
    const b = block();
    const doc = createBlockDoc([b], b.ctx, 'protected');
    for (const format of ['markdown', 'mdx']) {
        const serialized = serializeBlockDoc(doc, format);
        const parsed = parseBlockDoc(serialized, format);
        assert.deepEqual(parsed.blocks, [b]);
        assert.equal(parsed.coordinate, 'M5-4');
        assert.equal(parsed.ct, 'CT2');
        assert.equal(parsed.ctxFrame, '(0/1/2)');
    }
});
