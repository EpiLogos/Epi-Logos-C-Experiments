import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtime = require('../../m-extension-runtime/lib/common/block-contract.js');
const selectionRuntime = require('../../m-extension-runtime/lib/common/selection-context.js');
const {
    BLOCK_KIT_GATEWAY_METHOD_CONTRACTS,
    BLOCK_KIT_SURFACE_REGISTRATIONS,
    CORE_BLOCK_OWNER_REGISTRATIONS,
    applyBlockSessionOperation,
    createBlockDoc,
    createAnnotationOperation,
    createBlockPsycheUpdateRequest,
    createDefaultBlockRegistry,
    createRendererSessionState,
    createSelectionContextAgentInjectionRequest,
    createVerdictOperation,
    inscribeSelectionContextHighlightBack,
    parseBlockDoc,
    requestSelectionContextHandle,
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
        resolutionTarget: 'human',
        reason: 'accepted in M5 review surface',
        humanGate: { ok: true }
    });
    const next = applyBlockSessionOperation(state, op);
    assert.equal(next.currentSelection, b.id);
    assert.equal(next.pendingVerdict?.decision, 'approve');
    assert.equal(next.pendingVerdict?.resolutionTarget, 'human');
    assert.equal(next.appliedOperations.length, 1);
});

test('block verdict and annotation ops route renderer state to s4 psyche update by resolution target', () => {
    const b = block();
    const state = createRendererSessionState([b]);
    assert.throws(
        () => createVerdictOperation({
            block: b,
            decision: 'reject',
            actor: 'anima',
            actorIsHuman: false,
            resolutionTarget: 'agent',
            reason: 'agent attempted committal verdict',
            humanGate: { ok: false, reason: 'human-gate enforced' }
        }),
        /human-gate/i
    );

    const annotation = createAnnotationOperation({
        block: b,
        annotation: 'needs a human-side note',
        actor: 'anima',
        actorIsHuman: false,
        resolutionTarget: 'agent'
    });
    assert.equal(annotation.method, 'blocks.annotate');
    assert.equal(annotation.resolutionTarget, 'agent');
    assert.equal(annotation.routesTo, "s4'.psyche.update");

    const next = applyBlockSessionOperation(state, annotation);
    const request = createBlockPsycheUpdateRequest({
        sessionKey: 'session:44.4',
        state: next
    });
    assert.equal(request.method, "s4'.psyche.update");
    assert.equal(request.params.sessionKey, 'session:44.4');
    assert.deepEqual(request.params.patch.renderer.activeBlockIds, [b.id]);
    assert.equal(request.params.patch.renderer.currentSelection, b.id);
    assert.equal(request.params.patch.renderer.appliedOperations[0].method, 'blocks.annotate');
    assert.equal(request.params.patch.renderer.appliedOperations[0].resolutionTarget, 'agent');
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

test('selection context handle fires context_xray and injects the CTX-framed handle into Psyche', async () => {
    const calls = [];
    const bridge = {
        async invokeGatewayRpc(method, params) {
            calls.push({ method, params });
            return {
                handleId: 'ctx:handle:44.6',
                relatedBlocks: [block({ id: 'block:evidence:44.6', type: 'evidence' })],
                relatedCoordinates: ["M4'", "M5'"],
                episodes: [{ id: 'episode:44.6', summary: 'episodic context' }]
            };
        }
    };

    const source = block({ affordances: ['select'] });
    const handle = await requestSelectionContextHandle({
        bridge,
        selection: selectionRuntime.selectionFromBlock(source, 'chosen words', { from: 7, to: 19 }),
        includeEpisodes: true,
        requestedBy: 'block-kit-test'
    });
    const injection = createSelectionContextAgentInjectionRequest({
        sessionKey: 'session:44.6',
        handle
    });

    assert.equal(calls[0].method, "s2'.coordinate.context_xray");
    assert.equal(calls[0].params.fallbackMethod, "s4'.context.assemble");
    assert.equal(handle.kind, 'ctx-framed-context-handle');
    assert.equal(handle.id, 'ctx:handle:44.6');
    assert.deepEqual(handle.relatedCoordinates, ["M4'", "M5'"]);
    assert.equal(injection.method, "s4'.psyche.update");
    assert.equal(injection.params.patch.renderer.currentSelection, source.id);
    assert.equal(injection.params.patch.renderer.contextHandle.id, handle.id);
});

test('selection context falls back to s4 context assemble and records highlight-back through service port', async () => {
    const calls = [];
    const bridge = {
        async invokeGatewayRpc(method, params) {
            calls.push({ method, params });
            if (method === "s2'.coordinate.context_xray") {
                throw new Error('context_xray route pending');
            }
            return {
                handleId: 'ctx:fallback:44.6',
                relatedBlocks: [],
                relatedCoordinates: ["M5'"],
                episodes: []
            };
        }
    };
    const inscriptions = [];
    const highlightService = {
        inscribeAgentMark(position, category, content, sourceFacet) {
            const inscription = { position, category, content, sourceFacet };
            inscriptions.push(inscription);
            return inscription;
        }
    };

    const source = block({ affordances: ['select'] });
    const handle = await requestSelectionContextHandle({
        bridge,
        selection: selectionRuntime.selectionFromBlock(source, 'fallback passage', { from: 2, to: 18 }),
        requestedBy: 'block-kit-test',
        allowAssembleFallback: true
    });
    const inscription = inscribeSelectionContextHighlightBack({
        handle,
        highlightService,
        category: 'prospective-surfacing'
    });

    assert.deepEqual(calls.map(call => call.method), ["s2'.coordinate.context_xray", "s4'.context.assemble"]);
    assert.equal(handle.sourceMethod, "s4'.context.assemble");
    assert.equal(handle.provenance.fallbackUsed, true);
    assert.equal(calls[1].params.reason, 'context_xray route pending');
    assert.deepEqual(inscription.position, { from: 2, to: 18 });
    assert.equal(inscription.category, 'prospective-surfacing');
    assert.equal(inscription.content, 'fallback passage');
    assert.equal(inscriptions[0].sourceFacet, 'ctx:fallback:44.6');
});
