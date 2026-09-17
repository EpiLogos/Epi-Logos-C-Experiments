import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const contract = require('../lib/common/block-contract.js');
const schema = JSON.parse(
    readFileSync(new URL('../src/common/block-contract.schema.json', import.meta.url), 'utf8')
);

const LISTED_CORE_TYPES = Object.freeze([
    'rich-text',
    'callout',
    'diff',
    'data-model',
    'file-tree',
    'annotated-code',
    'code',
    'table',
    'checklist',
    'question-form',
    'review-item',
    'evidence',
    'dispatch-genealogy',
    'tool-stream-event',
    'pattern-packet',
    'kairos-strip',
    'resonance-indicator',
    'wireframe',
    'diagram'
]);

function validBlock(overrides = {}) {
    return {
        id: 'block:review:1',
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
            handle: 'evidence:review:1'
        },
        data: {
            title: 'Review claim'
        },
        affordances: ['verdict', 'annotate'],
        ...overrides
    };
}

test('block contract exports the listed core vocabulary and mirrors it in JSON schema', () => {
    assert.deepEqual([...contract.CORE_BLOCK_TYPES], [...LISTED_CORE_TYPES]);
    assert.equal(new Set(contract.CORE_BLOCK_TYPES).size, contract.CORE_BLOCK_TYPES.length);
    assert.deepEqual(schema.$defs.coreBlockType.enum, [...LISTED_CORE_TYPES]);
    assert.equal(contract.BLOCKS_CATALOG_GATEWAY_METHOD, 'blocks.catalog');
});

test('validateBlockContract enforces DR-PSS-1 ctx framing, privacy, provenance, and affordances', () => {
    assert.deepEqual(contract.validateBlockContract(validBlock()), []);

    assert.deepEqual(contract.validateBlockContract(validBlock({ ctx: undefined })), [
        'Block.ctx is required'
    ]);
    assert.match(
        contract.validateBlockContract(validBlock({ ctx: { cf: '(0/1/2)', ct: 'CT2' } })).join('\n'),
        /Block.ctx.cp is required/
    );
    assert.match(
        contract.validateBlockContract(validBlock({ privacyClass: 'private' })).join('\n'),
        /privacyClass/
    );
    assert.match(
        contract.validateBlockContract(validBlock({ affordances: ['verdict', 'mutate'] })).join('\n'),
        /affordances\[1\]/
    );
});

test('blocks.catalog accepts registered in-parity types and rejects absent or parity-split types', () => {
    const catalog = contract.createBlocksCatalog([
        contract.createCoreBlockCatalogEntry('review-item'),
        contract.createCoreBlockCatalogEntry('evidence', {
            iod17Parity: {
                inParity: false,
                faces: {
                    capabilityMatrix: true,
                    agentContract: false,
                    widgetRegistry: true
                },
                disagreements: ['agent-contract missing evidence block registration']
            }
        })
    ]);

    assert.equal(catalog.method, 'blocks.catalog');
    assert.deepEqual(catalog.types, ['review-item', 'evidence']);
    assert.equal(contract.assertBlockAcceptedByCatalog(validBlock(), catalog).type, 'review-item');

    assert.throws(
        () => contract.assertBlockAcceptedByCatalog(validBlock({ type: 'diagram' }), catalog),
        /not present in blocks.catalog/
    );
    assert.throws(
        () => contract.assertBlockAcceptedByCatalog(validBlock({ type: 'evidence' }), catalog),
        /IOD-17 parity/
    );
});

test('block schema requires the same wire fields S-layer emitters must provide', () => {
    assert.deepEqual(schema.required, ['id', 'type', 'ctx', 'privacyClass', 'data']);
    assert.deepEqual(schema.$defs.ctx.required, ['cf', 'ct', 'cp']);
    assert.deepEqual(schema.$defs.privacyClass.enum, ['public', 'protected', 'protected-local']);
    assert.deepEqual(schema.$defs.affordance.enum, ['verdict', 'annotate', 'select', 'navigate']);
    assert.equal(schema.properties.provenance.$ref, '#/$defs/provenance');
});
