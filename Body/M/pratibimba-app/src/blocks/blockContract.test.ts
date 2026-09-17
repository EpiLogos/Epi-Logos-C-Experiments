/**
 * Coordinate: M' (block contract law tests — Tranche 44.T44.1)
 * Actualises: the binding-fact verification — mandatory CTX framing
 *   (DR-PSS-1), the closed core vocabulary with catalog acceptance and
 *   IOD-17 parity rejection (DR-PSS-3), privacy/affordance/provenance law,
 *   and the schema mirror staying in lockstep with the TS vocabulary.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    BLOCKS_CATALOG_GATEWAY_METHOD,
    CORE_BLOCKS_CATALOG,
    CORE_BLOCK_TYPES,
    assertBlockAcceptedByCatalog,
    createBlocksCatalog,
    createCoreBlockCatalogEntry,
    validateBlockContract,
    type Block
} from './blockContract';

const VALID_BLOCK: Block = {
    id: 'blk-1',
    type: 'review-item',
    ctx: { cf: '(5/0)', ct: 'CT2', cp: 'CP4.3' },
    coordinate: 'M4-3',
    privacyClass: 'protected-local',
    provenance: { kind: 's2-handle', handle: 'neo4j://Bimba/M4-3' },
    data: { title: 'a review row' },
    affordances: ['verdict', 'annotate']
};

describe('44.1 block contract law', () => {
    it('accepts a fully-framed block and rejects every mandatory-ctx violation (DR-PSS-1)', () => {
        expect(validateBlockContract(VALID_BLOCK)).toEqual([]);
        expect(validateBlockContract({ ...VALID_BLOCK, ctx: undefined })).toContain('Block.ctx is required');
        expect(validateBlockContract({ ...VALID_BLOCK, ctx: { ct: 'CT2', cp: 'CP4.3' } })).toContain(
            'Block.ctx.cf is required'
        );
        expect(validateBlockContract({ ...VALID_BLOCK, ctx: { cf: '(5/0)', cp: 'CP4.3' } })).toContain(
            'Block.ctx.ct is required'
        );
        expect(validateBlockContract({ ...VALID_BLOCK, ctx: { cf: '(5/0)', ct: 'CT2' } })).toContain(
            'Block.ctx.cp is required'
        );
    });

    it('enforces privacy-class, affordance, provenance, and data law', () => {
        expect(validateBlockContract({ ...VALID_BLOCK, privacyClass: 'secret' })).toContain(
            'Block.privacyClass must be public, protected, or protected-local'
        );
        expect(validateBlockContract({ ...VALID_BLOCK, affordances: ['destroy'] }).join(' ')).toMatch(
            /affordances\[0\]/
        );
        expect(
            validateBlockContract({ ...VALID_BLOCK, provenance: { kind: 'rumor', handle: 'x' } })
        ).toContain('Block.provenance.kind must be evidence-envelope or s2-handle');
        const { data: _omitted, ...withoutData } = VALID_BLOCK;
        expect(validateBlockContract(withoutData)).toContain('Block.data is required');
    });

    it('carries the closed 19-type core vocabulary in the static catalog', () => {
        expect(CORE_BLOCK_TYPES).toHaveLength(19);
        expect(CORE_BLOCKS_CATALOG.method).toBe(BLOCKS_CATALOG_GATEWAY_METHOD);
        expect(CORE_BLOCKS_CATALOG.types).toEqual([...CORE_BLOCK_TYPES]);
        expect(assertBlockAcceptedByCatalog(VALID_BLOCK, CORE_BLOCKS_CATALOG).type).toBe('review-item');
    });

    it('rejects catalog-absent types and IOD-17 out-of-parity entries (DR-PSS-3)', () => {
        expect(() =>
            assertBlockAcceptedByCatalog({ ...VALID_BLOCK, type: 'hologram' }, CORE_BLOCKS_CATALOG)
        ).toThrow(/not present in blocks.catalog/);

        const outOfParity = createBlocksCatalog([
            createCoreBlockCatalogEntry('review-item', {
                iod17Parity: { inParity: false, disagreements: ['widgetRegistry missing review-item'] }
            })
        ]);
        expect(() => assertBlockAcceptedByCatalog(VALID_BLOCK, outOfParity)).toThrow(
            /IOD-17 parity gate: widgetRegistry missing review-item/
        );
    });

    it('keeps the mirrored JSON schema in lockstep with the TS vocabulary', () => {
        const schema = JSON.parse(
            readFileSync(join(__dirname, 'block-contract.schema.json'), 'utf8')
        ) as Record<string, any>;
        const text = JSON.stringify(schema);
        for (const type of CORE_BLOCK_TYPES) {
            expect(text).toContain(type);
        }
        for (const privacy of ['public', 'protected', 'protected-local']) {
            expect(text).toContain(privacy);
        }
        const required: string[] =
            schema.required ?? schema.$defs?.block?.required ?? schema.definitions?.block?.required ?? [];
        expect(required).toEqual(expect.arrayContaining(['id', 'type', 'ctx', 'privacyClass', 'data']));
    });
});
