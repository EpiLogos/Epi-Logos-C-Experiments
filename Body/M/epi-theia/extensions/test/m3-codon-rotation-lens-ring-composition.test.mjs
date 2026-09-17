import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);

const browserIndexPath =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/index.ts';
const projectionSourcePath =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/m3-mahamaya/src/browser/composition/M3CodonRotationProjectionForLensRing.ts';

test('M3 browser index exports the lens-ring projection contract', () => {
    assert.equal(existsSync(browserIndexPath), true);
    assert.match(
        readFileSync(browserIndexPath, 'utf8'),
        /M3CodonRotationProjectionForLensRing/
    );
});

test('K2LensRingCellDescriptor declares the required readonly projection fields', () => {
    const source = readFileSync(projectionSourcePath, 'utf8');
    for (const field of [
        'readonly ringIndex: number',
        'readonly cellIndex: number',
        'readonly positionLabel: string',
        'readonly codonTriple?: string',
        'readonly aminoAcid?: string',
        'readonly colourHsla: string'
    ]) {
        assert.match(source, new RegExp(field.replace(/[?:]/g, '\\$&')));
    }
    assert.match(source, /export interface M3CodonRotationProjectionForLensRing\s*\{/);
    assert.match(source, /readonly cells: readonly K2LensRingCellDescriptor\[\]/);
    assert.match(source, /readonly activeRingIndex: number/);
    assert.match(source, /readonly rotationPhase: number/);
});

test('cosmic-1-2-3 composition reads the M3 lens-ring projection without mutation', () => {
    const { readM3CodonRotationProjectionForLensRing } = require(
        '../plugin-integrated-1-2-3/lib/common/composition-contract.js'
    );
    const {
        buildM3CodonRotationProjectionForLensRing,
        M3CodonRotationProjectionForLensRing
    } = require(
        '../m3-mahamaya/lib/browser/index.js'
    );

    const projection = buildM3CodonRotationProjectionForLensRing({
        readiness: Object.freeze({
            surfaceReady: true,
            blockers: Object.freeze([])
        }),
        activeProjection: Object.freeze({
            lens: 2,
            surfaceIndex: 5,
            codon: 'UGA',
            aminoAcid: 'Stop',
            codonClass: 'dual',
            rotation: 4,
            rotationalStateCount: 8
        })
    });

    const before = JSON.stringify(projection);
    const read = readM3CodonRotationProjectionForLensRing(projection);

    assert.equal(M3CodonRotationProjectionForLensRing, 'M3CodonRotationProjectionForLensRing');
    assert.deepEqual(read, {
        activeRingIndex: 2,
        rotationPhase: Math.PI,
        cellCount: 1,
        activeCell: projection.cells[0]
    });
    assert.deepEqual(projection.cells, [
        {
            ringIndex: 2,
            cellIndex: 5,
            positionLabel: 'P2/upper-aperture-south',
            codonTriple: 'UGA',
            aminoAcid: 'Stop',
            colourHsla: 'hsla(335, 68%, 54%, 0.92)'
        }
    ]);
    assert.equal(JSON.stringify(projection), before);
    assert.equal(Object.isFrozen(projection), true);
    assert.equal(Object.isFrozen(projection.cells), true);
    assert.equal(Object.isFrozen(projection.cells[0]), true);
    assert.throws(() => projection.cells.push(projection.cells[0]), TypeError);
});
