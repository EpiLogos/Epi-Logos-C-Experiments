import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const { M1_BACKEND_STUDIO_PACK } = require('../m1-paramasiva/lib/common/m1-backend-studio-pack.js');

test('M1 Backend Studio pack declares eight read-only sources with expected LSPs', () => {
    assert.equal(M1_BACKEND_STUDIO_PACK.packId, 'm1-paramasiva.backend-studio-pack');
    assert.equal(M1_BACKEND_STUDIO_PACK.owner, 'm1-paramasiva');
    assert.match(M1_BACKEND_STUDIO_PACK.label, /M1 Backend Pack/);
    assert.ok(Object.isFrozen(M1_BACKEND_STUDIO_PACK));
    assert.ok(Object.isFrozen(M1_BACKEND_STUDIO_PACK.sources));
    assert.equal(M1_BACKEND_STUDIO_PACK.sources.length, 8);

    const lspCounts = M1_BACKEND_STUDIO_PACK.sources.reduce((counts, source) => {
        counts[source.lsp] = (counts[source.lsp] ?? 0) + 1;
        return counts;
    }, {});

    assert.deepEqual(lspCounts, {
        clangd: 2,
        'rust-analyzer': 6
    });
    assert.equal(M1_BACKEND_STUDIO_PACK.sources.every(source => source.readOnly === true), true);
});

test('M1 Backend Studio pack references only source files that exist on disk', () => {
    for (const source of M1_BACKEND_STUDIO_PACK.sources) {
        assert.equal(
            existsSync(join(repoRoot, source.path)),
            true,
            `${source.path} must exist for Backend Studio source navigation`
        );
    }
});

test('M1 Backend Studio pack pins the curated backend source order', () => {
    assert.deepEqual(
        M1_BACKEND_STUDIO_PACK.sources.map(source => source.path),
        [
            'Body/S/S0/epi-lib/include/m1.h',
            'Body/S/S0/epi-lib/src/m1.c',
            'Body/S/S0/portal-core/src/kernel.rs',
            'Body/S/S0/portal-core/src/hopf.rs',
            'Body/S/S0/portal-core/src/quaternion.rs',
            'Body/S/S0/portal-core/src/spanda.rs',
            'Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs',
            'Body/S/S0/portal-core/src/codon_rotation_projection.rs'
        ]
    );
});
