import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePngRgba, sha256 } from '../scripts/visual-regression-renderer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(__dirname, '..', 'fixtures', 'visual-regression');
const MANIFEST = JSON.parse(readFileSync(join(FIXTURE_ROOT, 'm2-parashakti-manifest.json'), 'utf8'));

test('m2-parashakti visual-regression suite indexes every required baseline family', () => {
    assert.equal(MANIFEST.fixtureId, 'visual-regression/m2-parashakti');
    assert.equal(MANIFEST.tranche, '23.T23.17');
    assert.equal(MANIFEST.suite, 'm2-parashakti');
    assert.equal(MANIFEST.privacyClass, 'protected-local-synthetic-fixture');
    assert.deepEqual(MANIFEST.zodiacalSignStarts, Array.from({ length: 12 }, (_, index) => index * 6));

    assert.equal(filesMatching(/^m2-cymatic-plate-tick-\d+\.png$/).length, 12);
    assert.equal(filesMatching(/^m2-mef-grid-tick-\d+\.png$/).length, 12);
    assert.ok(entry('m2-cymatic-klein-flip-boundary.png'));
    assert.ok(entry('m2-correspondence-tree-six-axes.png'));
    assert.ok(entry('m2-breadcrumb-72-fold.png'));
});

test('m2-parashakti visual-regression baselines are committed PNGs with tranche thresholds', () => {
    for (const item of MANIFEST.entries) {
        const path = join(FIXTURE_ROOT, item.file);
        assert.ok(existsSync(path), `${item.file} must exist`);
        assert.match(item.sha256, /^[a-f0-9]{64}$/);
        assert.ok(item.diffThreshold === 0.01 || item.diffThreshold === 0.05);
        if (item.file === 'm2-cymatic-klein-flip-boundary.png') {
            assert.equal(item.diffThreshold, 0.05);
        } else {
            assert.equal(item.diffThreshold, 0.01);
        }

        const png = readFileSync(path);
        assert.equal(sha256(png), item.sha256);
        const decoded = decodePngRgba(png);
        assert.equal(decoded.width, item.width);
        assert.equal(decoded.height, item.height);
        assert.equal(decoded.rgba.length, item.width * item.height * 4);
    }
});

test('m2-parashakti baseline names match the 23.17 visual-regression contract', () => {
    assert.deepEqual(
        filesMatching(/^m2-cymatic-plate-tick-\d+\.png$/),
        Array.from({ length: 12 }, (_, tick) => `m2-cymatic-plate-tick-${tick}.png`)
    );
    assert.deepEqual(
        filesMatching(/^m2-mef-grid-tick-\d+\.png$/),
        Array.from({ length: 12 }, (_, tick) => `m2-mef-grid-tick-${tick}.png`)
    );
});

function entry(file) {
    return MANIFEST.entries.find(item => item.file === file);
}

function filesMatching(pattern) {
    return MANIFEST.entries
        .map(item => item.file)
        .filter(file => pattern.test(file))
        .sort((a, b) => numericSuffix(a) - numericSuffix(b));
}

function numericSuffix(file) {
    const match = file.match(/-(\d+)\.png$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
