import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    BACKEND_STUDIO_LSP_CONTRIBUTIONS,
    BACKEND_STUDIO_PROVENANCE_ROOTS,
    lspContributionFor,
    provenanceRootsForCore
} from '../lib/common/index.js';

test('declares system-shape LSP contributions', () => {
    assert.deepEqual(
        BACKEND_STUDIO_LSP_CONTRIBUTIONS.map(item => item.command),
        ['rust-analyzer', 'clangd', 'pylsp']
    );
    assert.equal(lspContributionFor('clangd').workspaceRoots[0], 'Body/S/S0/epi-lib');
});

test('surfaces epi-lib, portal-core, and S1-S5 provenance roots', () => {
    const cores = new Set(BACKEND_STUDIO_PROVENANCE_ROOTS.map(item => item.core));
    for (const core of ['epi-lib', 'portal-core', 'S1', 'S2', 'S3', 'S4', 'S5']) {
        assert.equal(cores.has(core), true, `${core} should be surfaced`);
    }
    assert.equal(provenanceRootsForCore('portal-core')[0].lsp, 'rust-analyzer');
});
