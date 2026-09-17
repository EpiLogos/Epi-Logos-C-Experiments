import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const repoRoot = resolve(import.meta.dirname, '../../../../../..');
const extensionRoot = resolve(repoRoot, 'Body/M/epi-theia/extensions/m1-paramasiva-played-torus');
const { buildPlayedTorusFrame } = require('../lib/common/index.js');

test('extension and Bevy/wgpu toolchain declarations are present', () => {
    assert.equal(existsSync(extensionRoot), true);
    assert.equal(existsSync(join(extensionRoot, 'ARCHITECTURE.md')), true);
    assert.equal(existsSync(join(extensionRoot, 'package.json')), true);
    assert.equal(existsSync(join(extensionRoot, 'wgpu/Cargo.toml')), true);
    const cargoToml = readFileSync(join(extensionRoot, 'wgpu/Cargo.toml'), 'utf8');
    assert.match(cargoToml, /bevy/);
    assert.match(cargoToml, /wgpu/);
});

test('profile frame consumes Ananda and Vimarsha data through the bridge payload', () => {
    const frame = buildPlayedTorusFrame({
        profile: {
            generation: 77,
            pointerAnchor: 'profile://m1/k2/77',
            capabilities: ['m1.paramasiva.playedTorus.read'],
            payload: samplePayload()
        },
        readiness: readySnapshot(),
        context: sampleContext(),
        emittedAt: 101
    });

    assert.equal(frame.topology.surface, 'K2');
    assert.equal(frame.topology.doubleCoverDeg, 720);
    assert.equal(frame.topology.torusGenus, 1);
    assert.equal(frame.topology.boundary, 'single-k2-only');
    assert.equal(frame.rendererInput.canvasMount, 'bevy-wgpu');
    assert.deepEqual(frame.rendererInput.orientationQuaternion, [0.5, -0.8660254, 0, 0]);
    assert.equal(frame.ananda.activeCellValueSource, 'profile.ananda_vortex.active_cell_value');
    assert.equal(frame.ananda.rawValue, 64);
    assert.equal(frame.ananda.digitRootValue, 1);
    assert.equal(frame.vimarshaWindows.audioSource, 'profile.audio_octet');
    assert.equal(frame.vimarshaWindows.nodalSource, 'profile.nodal_quartet');
    assert.equal(frame.vimarshaWindows.particleEmitterCount, 8);
    assert.equal(frame.vimarshaWindows.satelliteGlyphCount, 4);
    assert.deepEqual(frame.readinessBadges, []);
});

test('missing profile fields produce explicit readiness badges without local fallback math', () => {
    const frame = buildPlayedTorusFrame({
        profile: {
            generation: 8,
            pointerAnchor: null,
            capabilities: [],
            payload: { tick12: 1, position6: 1, degree720: 60 }
        },
        readiness: { ...readySnapshot(), state: 'profile_missing_field' },
        context: sampleContext(),
        emittedAt: 202
    });

    assert.deepEqual(
        frame.readinessBadges.map(badge => badge.id),
        ['pending-ananda-vortex', 'pending-audio-octet', 'pending-nodal-quartet']
    );
    assert.equal(frame.rendererInput.activeCellValueSource, null);
    assert.equal(frame.observabilityEvents[0].type, 'm1.played_torus.readiness_block');
});

test('boundary audit: source contains no downstream torus primitive', () => {
    const source = readSourceTree(join(extensionRoot, 'src')).concat(readSourceTree(join(extensionRoot, 'wgpu/src')));
    const combined = source.map(entry => entry.content).join('\n');
    assert.doesNotMatch(combined, /T2_Mahamaya|double_torus|T2_Mahamāyā|m3_torus_outer/);
});

test('Vimarsha-window audit: no local audio or nodal derivation symbols exist', () => {
    const combined = readSourceTree(extensionRoot).map(entry => entry.content).join('\n');
    for (const token of ['synth' + 'esise', 'local' + '_pitch', 'compute' + 'Hz', 'derive' + 'Octet']) {
        assert.equal(combined.includes(token), false, `${token} should not appear`);
    }
    assert.match(combined, /profile\.audio_octet/);
    assert.match(combined, /profile\.nodal_quartet/);
});

test('substrate-derivation audit: extension source does not fork ring or basis tables', () => {
    const combined = readSourceTree(join(extensionRoot, 'src')).concat(readSourceTree(join(extensionRoot, 'wgpu/src')))
        .map(entry => entry.content)
        .join('\n');
    for (const token of ['RING' + '_QUATERNION_LUT =', 'CL42' + '_BASIS =', 'DR' + '_RING_']) {
        assert.equal(combined.includes(token), false, `${token} should not appear`);
    }
});

function samplePayload() {
    return {
        tick12: 7,
        position6: 1,
        degree720: 420,
        lens_mode: { lens: 7, mode: 1 },
        audio_octet: [130, 146, 164, 174, 196, 220, 246, 261],
        nodal_quartet: [
            { ql_position: 0, helix: 'bimba', m: 1, n: 2 },
            { ql_position: 5, helix: 'bimba', m: 3, n: 4 },
            { ql_position: 0, helix: 'pratibimba', m: 5, n: 6 },
            { ql_position: 5, helix: 'pratibimba', m: 7, n: 8 }
        ],
        ananda_vortex: {
            active_matrix_op: 'pratibimba',
            active_cell: [7, 9],
            active_cell_value: {
                family: 'pratibimba',
                row_k: 7,
                position_p: 9,
                raw_value: 64,
                raw_pratibimba: 64,
                dr_value: 1,
                dr_pratibimba: 1
            },
            dr_ring_phase: { mahamaya_idx: 2, parashakti_idx: 6 },
            cl42_signature_at_position: 1,
            ring_quaternion: [0.5, -0.8660254, 0, 0],
            helix_sheet: 1,
            klein_flip_at_this_tick: false
        }
    };
}

function readySnapshot() {
    return {
        fetchedAt: 101,
        state: 'ready_public_current',
        reason: 'fixture-ready',
        profileGeneration: 77,
        bridgeReachable: true,
        blockerIds: []
    };
}

function sampleContext() {
    return {
        selectedCoordinate: 'M1-2',
        hashInput: null,
        canonicalMCoordinate: 'M1-2',
        profileGeneration: 77,
        pointerAnchor: 'profile://m1/k2/77',
        dayNowSessionHandle: 'now://session',
        privacyClass: 'public_current',
        provenance: { source: 'test', generation: 77, notes: [] }
    };
}

function readSourceTree(root) {
    if (!existsSync(root)) {
        return [];
    }
    return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
        const path = join(root, entry.name);
        if (entry.isDirectory()) {
            return readSourceTree(path);
        }
        if (!/\.(ts|tsx|rs|wgsl|toml|json|md|css)$/.test(entry.name)) {
            return [];
        }
        if (statSync(path).size > 256000) {
            return [];
        }
        return [{ path, content: readFileSync(path, 'utf8') }];
    });
}
