import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const extensionRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(dirname(extensionRoot));
const repoRoot = dirname(dirname(dirname(workspaceRoot)));
const transpiledRoot = join(tmpdir(), 'm2-parashakti-cymatic-determinism-test');
const baselineProfile = JSON.parse(
    readFileSync(join(repoRoot, 'Body/S/S0/portal-core/contract-inventory/baseline-profile.json'), 'utf8')
);

function compiledModulePath(sourcePath) {
    const relative = sourcePath.slice(extensionRoot.length + 1).replace(/\.(ts|tsx)$/, '.js');
    return join(transpiledRoot, relative);
}

function ensureTranspiledNodeModules() {
    const linkPath = join(transpiledRoot, 'node_modules');
    if (existsSync(linkPath)) {
        rmSync(linkPath, { force: true, recursive: true });
    }
    mkdirSync(transpiledRoot, { recursive: true });
    symlinkSync(join(workspaceRoot, 'node_modules'), linkPath, 'dir');
}

function compileSourceModule(sourcePath) {
    ensureTranspiledNodeModules();
    const outputPath = compiledModulePath(sourcePath);
    const source = readFileSync(sourcePath, 'utf8');
    const output = ts.transpileModule(source, {
        fileName: sourcePath,
        compilerOptions: {
            esModuleInterop: true,
            jsx: ts.JsxEmit.React,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020
        }
    });
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, output.outputText);
    return outputPath;
}

function loadSourceModule(relativePath) {
    const sourcePath = join(extensionRoot, relativePath);
    assert.ok(existsSync(sourcePath), `missing source module ${relativePath}`);
    const outputPath = compileSourceModule(sourcePath);
    return require(outputPath);
}

loadSourceModule('src/common/meaning-packet.ts');
loadSourceModule('src/common/cymatic-chladni.ts');
const {
    buildStandingWavePoints,
    renderM2CymaticFrame
} = require(compiledModulePath(join(extensionRoot, 'src/common/meaning-packet.ts')));
const {
    renderCymaticChladniSurfacePixels
} = require(compiledModulePath(join(extensionRoot, 'src/common/cymatic-chladni.ts')));

const fixture = Object.freeze({
    address72: 37,
    audioOctet: Object.freeze([144, 162, 216, 243, 288, 324, 384, 432]),
    nodalQuartet: Object.freeze([
        Object.freeze({ m: 1, n: 2 }),
        Object.freeze({ m: 2, n: 3 }),
        Object.freeze({ m: 3, n: 5 }),
        Object.freeze({ m: 5, n: 8 })
    ])
});

function profile() {
    return Object.freeze({
        generation: 23017,
        pointerAnchor: 'profile:pointer:cymatic-determinism',
        capabilities: Object.freeze(['profile.public-current']),
        payload: Object.freeze({
            ...baselineProfile,
            audioOctet: fixture.audioOctet,
            nodalQuartet: fixture.nodalQuartet,
            resonance72: Object.freeze({
                ...baselineProfile.resonance72,
                lensAnchorIndex: fixture.address72
            })
        })
    });
}

function waveBytes(points) {
    const view = new Float64Array(points);
    return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
}

test('buildStandingWavePoints path produces byte-identical wavePoints for identical profile-bus inputs', () => {
    const directFirst = buildStandingWavePoints(fixture.audioOctet, fixture.nodalQuartet, fixture.address72);
    const directSecond = buildStandingWavePoints(fixture.audioOctet, fixture.nodalQuartet, fixture.address72);
    const first = renderM2CymaticFrame({
        profile: profile(),
        address72: fixture.address72,
        scope: 'cosmic-public'
    });
    const second = renderM2CymaticFrame({
        profile: profile(),
        address72: fixture.address72,
        scope: 'cosmic-public'
    });

    assert.equal(first.sampleCount, 72);
    assert.deepEqual(first.audioOctetHz, fixture.audioOctet);
    assert.deepEqual(first.nodalQuartet, fixture.nodalQuartet);
    assert.deepEqual(directFirst, directSecond);
    assert.deepEqual(waveBytes(directFirst), waveBytes(directSecond));
    assert.deepEqual(first.wavePoints, directFirst);
    assert.deepEqual(first.wavePoints, second.wavePoints);
    assert.deepEqual(waveBytes(first.wavePoints), waveBytes(second.wavePoints));
});

test('CymaticChladniSurface renders byte-identical plate canvas pixels for identical frames', () => {
    const frame = renderM2CymaticFrame({
        profile: profile(),
        address72: fixture.address72,
        scope: 'cosmic-public'
    });
    const first = renderCymaticChladniSurfacePixels({ frame, width: 96, height: 96, tick: 11 });
    const second = renderCymaticChladniSurfacePixels({ frame, width: 96, height: 96, tick: 11 });

    assert.equal(first.width, 96);
    assert.equal(first.height, 96);
    assert.equal(first.byteHash, second.byteHash);
    assert.deepEqual(Buffer.from(first.rgba), Buffer.from(second.rgba));
});

test('CymaticChladniSurface pixel renderer pins the same canvas-byte hash across repeated renders', () => {
    const frame = renderM2CymaticFrame({
        profile: profile(),
        address72: fixture.address72,
        scope: 'cosmic-public'
    });
    const first = renderCymaticChladniSurfacePixels({ frame, width: 48, height: 48, tick: 11 });
    const second = renderCymaticChladniSurfacePixels({ frame, width: 48, height: 48, tick: 11 });

    assert.equal(first.byteHash, second.byteHash);
    assert.match(first.byteHash, /^[a-f0-9]{8}$/);
    assert.equal(first.width, 48);
    assert.equal(first.height, 48);
    assert.deepEqual(Buffer.from(first.rgba), Buffer.from(second.rgba));
});
