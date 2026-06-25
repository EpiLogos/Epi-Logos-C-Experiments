import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
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
const { renderM2CymaticFrame } = require(compiledModulePath(join(extensionRoot, 'src/common/meaning-packet.ts')));
const {
    CymaticChladniSurface,
    renderCymaticChladniSurfacePixels
} = loadSourceModule('src/browser/components/CymaticChladniSurface.tsx');

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

test('CymaticChladniSurface markup pins the same canvas-byte hash across repeated server renders', () => {
    const frame = renderM2CymaticFrame({
        profile: profile(),
        address72: fixture.address72,
        scope: 'cosmic-public'
    });
    const props = { frame, width: 48, height: 48, tick: 11 };
    const first = renderToStaticMarkup(React.createElement(CymaticChladniSurface, props));
    const second = renderToStaticMarkup(React.createElement(CymaticChladniSurface, props));

    assert.equal(first, second);
    assert.match(first, /data-cymatic-chladni-surface="plate"/);
    assert.match(first, /data-canvas-byte-hash="[a-f0-9]{8}"/);
    assert.match(first, /aria-label="M2 cymatic Chladni plate at 72-address 37"/);
});
