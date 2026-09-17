import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const runtime = require('../../m-extension-runtime/lib/common/block-contract.js');
const blockKit = require('../../block-kit/lib/common/index.js');
const { enforceHumanGate } = require('../../agentic-control-room/lib/common/run-model.js');

const RELEASE_GATE_CONTRACT = JSON.parse(readFileSync(
    resolve(__dirname, '../../contracts/block-kit-release-gate.json'),
    'utf8'
));

function reviewBlock(overrides = {}) {
    return {
        id: 'block:acceptance:review',
        type: 'review-item',
        ctx: {
            cf: '(0/1/2)',
            ct: 'CT2',
            cp: '4.2',
            cpf: 'human-gate-verdict',
            cs: 'day'
        },
        coordinate: 'M5-4',
        privacyClass: 'protected',
        provenance: {
            kind: 'evidence-envelope',
            handle: 'acceptance:evidence:44'
        },
        data: {
            candidateId: 'candidate-44',
            title: 'Track 44 release-gate verdict'
        },
        affordances: ['verdict', 'annotate'],
        ...overrides
    };
}

test('Track 44 no-orphan gate: every core block type has a BlockSpec and owning extension registration', () => {
    const registry = blockKit.createDefaultBlockRegistry();
    assert.deepEqual(registry.noOrphanErrors(), []);

    const ownerTypes = new Set(blockKit.CORE_BLOCK_OWNER_REGISTRATIONS.map(row => row.type));
    for (const type of runtime.CORE_BLOCK_TYPES) {
        assert.ok(ownerTypes.has(type), `${type} must have an owning extension registration`);
        assert.ok(registry.spec(type), `${type} must have a BlockSpec`);
    }
});

test('Track 44 gateway-method gate: every block-kit gateway method has contract entry plus owner', () => {
    const expected = RELEASE_GATE_CONTRACT.requiredGatewayMethods;
    const actualByMethod = new Map(blockKit.BLOCK_KIT_GATEWAY_METHOD_CONTRACTS.map(entry => [entry.method, entry]));
    assert.equal(actualByMethod.size, expected.length);
    for (const entry of expected) {
        const actual = actualByMethod.get(entry.method);
        assert.ok(actual, `${entry.method} must be present in code catalog`);
        assert.equal(actual.ownerExtensionId, entry.ownerExtensionId);
        assert.equal(actual.contractEntryId, entry.contractEntryId);
        assert.equal(actual.routesTo, entry.routesTo);
        assert.equal(actual.humanGateRequired, entry.humanGateRequired);
    }
});

test('Track 44 Human Gate: verdict loop blocks agent commit and round-trips when human approves', () => {
    const b = reviewBlock();

    const agentGate = enforceHumanGate({
        decision: 'approve',
        humanRequired: true,
        actorIsHuman: false,
        actor: 'anima'
    });
    assert.equal(agentGate.ok, false);
    assert.throws(
        () => blockKit.createVerdictOperation({
            block: b,
            decision: 'approve',
            actor: 'anima',
            actorIsHuman: false,
            reason: 'agent attempted committal verdict',
            humanGate: agentGate
        }),
        /human|required|blocked|gate/i
    );

    const humanGate = enforceHumanGate({
        decision: 'approve',
        humanRequired: true,
        actorIsHuman: true,
        actor: 'human'
    });
    assert.equal(humanGate.ok, true);
    const state = blockKit.createRendererSessionState([b]);
    const op = blockKit.createVerdictOperation({
        block: b,
        decision: 'approve',
        actor: 'human',
        actorIsHuman: true,
        reason: 'accepted under M5 Human Gate',
        humanGate
    });
    const next = blockKit.applyBlockSessionOperation(state, op);
    assert.equal(next.pendingVerdict.decision, 'approve');
    assert.equal(next.currentSelection, b.id);
    assert.equal(next.appliedOperations[0].routesTo, "s4'.psyche.update");
});

test('Track 44 persisted block-doc gate: markdown and MDX round-trip the same validated block-doc', () => {
    const b = reviewBlock();
    const doc = blockKit.createBlockDoc([b], b.ctx, 'protected');
    for (const format of ['markdown', 'mdx']) {
        const serialized = blockKit.serializeBlockDoc(doc, format);
        const parsed = blockKit.parseBlockDoc(serialized, format);
        assert.deepEqual(parsed.blocks, [b]);
        assert.equal(parsed.coordinate, 'M5-4');
        assert.equal(parsed.ct, 'CT2');
        assert.equal(parsed.ctxFrame, '(0/1/2)');
        assert.deepEqual(blockKit.fromDoc(blockKit.toDoc([b], { format }), format), [b]);
        assert.doesNotMatch(serialized, /^block_count:/m);
        assert.doesNotMatch(serialized, /^block_doc_format:/m);
    }
    assert.equal(
        blockKit.assertBlockDocWritablePath(blockKit.blockDocVaultPath('02-06-2026', 'nara-daily-briefing.block-doc.mdx')),
        'Idea/Empty/Present/02-06-2026/nara-daily-briefing.block-doc.mdx'
    );
});

test('Track 44 rollout gate: ACR, evidence inspector, and M0-M5 block surfaces are registered', () => {
    const surfaces = new Map(blockKit.BLOCK_KIT_SURFACE_REGISTRATIONS.map(row => [row.surfaceId, row]));
    for (const required of [
        'acr.dispatch-trace',
        'acr.tool-stream',
        'ide-shell.evidence-inspector',
        'm0.data-model',
        'm1.diagram',
        'm2.resonance',
        'm3.kairos',
        'm4.patterns',
        'm5.review'
    ]) {
        assert.ok(surfaces.has(required), `${required} must have a block-kit surface registration`);
    }
});
