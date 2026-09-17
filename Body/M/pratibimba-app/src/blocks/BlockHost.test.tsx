/**
 * Coordinate: M' (block registry + host tests — Tranche 44.T44.2)
 * Actualises: the 44.2 verification — the registry union IS the live catalog,
 *   the no-orphan law holds for all 19 core types (and reports gaps), the
 *   host renders accepted blocks through their spec with owner/edit-surface
 *   attribution, rejects catalog-absent types per-block without crashing the
 *   host, and enforces the privacyGate BEFORE render (refused data never
 *   reaches the DOM).
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CORE_BLOCK_TYPES, type Block, type BlockSpec } from './blockContract';
import { BlockRegistry, createCoreBlockSpecs, createDefaultBlockRegistry } from './blockRegistry';
import { BlockHost } from './BlockHost';
import { PrivacyDropFeed } from '../services/privacyDropFeed';

afterEach(cleanup);

const BLOCK: Block = {
    id: 'b-1',
    type: 'review-item',
    ctx: { cf: '(5/0)', ct: 'CT2', cp: 'CP4.3' },
    coordinate: 'M5-4',
    privacyClass: 'protected',
    data: { title: 'review me' },
    affordances: ['verdict', 'annotate']
};

describe('44.2 BlockRegistry', () => {
    it('the union of registrations IS the live catalog and the no-orphan law holds for all 19 types', () => {
        const registry = createDefaultBlockRegistry();
        expect(registry.catalog().types).toEqual([...CORE_BLOCK_TYPES]);
        expect(registry.noOrphanErrors()).toEqual([]);
    });

    it('reports orphans when a core type loses its spec or owner', () => {
        const missingSpec = new BlockRegistry(
            createCoreBlockSpecs().filter(spec => spec.type !== 'kairos-strip')
        );
        const errors = missingSpec.noOrphanErrors();
        expect(errors.join(' ')).toMatch(/kairos-strip.*no BlockSpec/);

        const missingOwner = new BlockRegistry(createCoreBlockSpecs(), []);
        expect(missingOwner.noOrphanErrors().join(' ')).toMatch(/no owning extension registration/);
    });
});

describe('44.2 BlockHost', () => {
    it('renders an accepted block through its spec with owner and edit-surface attribution', () => {
        render(<BlockHost blocks={[BLOCK]} />);
        const article = screen.getByTestId('block-b-1');
        expect(article.getAttribute('data-block-type')).toBe('review-item');
        expect(article.getAttribute('data-owner-extension')).toBe('m5-epii');
        expect(article.getAttribute('data-edit-surface')).toBe('inline');
        expect(screen.getByTestId('block-read-model').textContent).toContain('review me');
        expect(screen.getByTestId('block-affordances').textContent).toBe('verdict · annotate');
    });

    it('rejects a catalog-absent type per-block without crashing the host', () => {
        render(
            <BlockHost
                blocks={[BLOCK, { ...BLOCK, id: 'b-2', type: 'hologram' }]}
            />
        );
        expect(screen.getByTestId('block-b-1')).toBeTruthy();
        const rejected = screen.getByTestId('block-rejected');
        expect(rejected.getAttribute('data-block-id')).toBe('b-2');
        expect(rejected.textContent).toMatch(/not present in blocks.catalog/);
    });

    it('privacyGate refuses BEFORE render — the data never reaches the DOM', () => {
        const closedGate: BlockSpec = {
            ...createCoreBlockSpecs().find(spec => spec.type === 'review-item')!,
            privacyGate: { requiredPrivacyClass: 'public', accepts: block => block.privacyClass === 'public' }
        };
        const registry = createDefaultBlockRegistry();
        registry.register(closedGate);
        render(<BlockHost blocks={[BLOCK]} registry={registry} />);
        expect(screen.getByTestId('block-privacy-refused')).toBeTruthy();
        expect(screen.queryByTestId('block-read-model')).toBeNull();
        expect(document.body.textContent).not.toContain('review me');
    });

    it('28.16: a privacy-refused block records exactly one drop into the injected feed', () => {
        const closedGate: BlockSpec = {
            ...createCoreBlockSpecs().find(spec => spec.type === 'review-item')!,
            privacyGate: { requiredPrivacyClass: 'public', accepts: block => block.privacyClass === 'public' }
        };
        const registry = createDefaultBlockRegistry();
        registry.register(closedGate);
        const feed = new PrivacyDropFeed();

        render(<BlockHost blocks={[BLOCK]} registry={registry} privacyDropFeed={feed} />);

        expect(screen.getByTestId('block-privacy-refused')).toBeTruthy();
        const aggregate = feed.aggregate;
        expect(aggregate.total).toBe(1);
        expect(aggregate.byWidget).toEqual({ 'review-item': 1 });
        expect(aggregate.byClass).toEqual({ protected: 1 });
    });

    it('28.16: an accepted (non-refused) block records no drop', () => {
        const feed = new PrivacyDropFeed();
        render(<BlockHost blocks={[BLOCK]} privacyDropFeed={feed} />);
        expect(screen.getByTestId('block-b-1')).toBeTruthy();
        expect(feed.aggregate.total).toBe(0);
    });
});
