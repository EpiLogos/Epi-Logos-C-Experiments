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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-cymatic-monopoly-engine-test');

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

loadSourceModule('src/common/cymatic-chladni.ts');
loadSourceModule('src/browser/components/CymaticChladniSurface.tsx');
loadSourceModule('src/browser/components/ProvenanceBadge.tsx');
const {
    MONOPOLY_RESONANCE_SOURCE,
    buildCymaticMonoPolyModel
} = loadSourceModule('src/browser/components/CymaticMonoPolyEngine.tsx');

function bridgeFor(fixtures) {
    return Object.freeze({
        m2: Object.freeze({
            cymaticMonoPolyState: address72 => {
                const projection = fixtures.get(address72);
                if (!projection) {
                    throw new Error(`missing fixture for ${address72}`);
                }
                return projection;
            }
        })
    });
}

test('cymatic MonoPoly engine consumes the ratified four-state bridge projection', () => {
    const fixtures = new Map([
        [1, Object.freeze({ behaviourState: 'mono', activeToneCount: 1, mutualResonance: 0, projection64: 1 })],
        [7, Object.freeze({ behaviourState: 'actually-many', activeToneCount: 2, mutualResonance: 0.2, projection64: 7 })],
        [19, Object.freeze({ behaviourState: 'actualising-one', activeToneCount: 4, mutualResonance: 0.6, projection64: 19 })],
        [31, Object.freeze({ behaviourState: 'monopoly', activeToneCount: 6, mutualResonance: 1, projection64: 31 })]
    ]);

    assert.equal(MONOPOLY_RESONANCE_SOURCE, 'kernelBridge.m2.cymaticMonoPolyState(address72)');

    for (const [address72, projection] of fixtures) {
        const model = buildCymaticMonoPolyModel({
            kernelBridge: bridgeFor(fixtures),
            activeAddress72: address72,
            audioOctet0: 128,
            tick: 144
        });

        assert.equal(model.bridgeReady, true);
        assert.equal(model.classification.behaviourState, projection.behaviourState);
        assert.equal(model.classification.activeToneCount, projection.activeToneCount);
        assert.equal(model.classification.mutualResonance, projection.mutualResonance);
        assert.equal(model.classification.projection64, projection.projection64);
    }
});

test('cymatic MonoPoly engine rejects renderer-local resonance shapes', () => {
    const model = buildCymaticMonoPolyModel({
        kernelBridge: Object.freeze({
            m2: Object.freeze({
                cymaticMonoPolyState: () => Object.freeze({
                    address72: 7,
                    projectionCodon: 7,
                    resonanceCondition: 7,
                    resonantConditions: [1, 7, 13],
                    superposedCodons: [1, 7, 13]
                })
            })
        }),
        activeAddress72: 7
    });

    assert.equal(model.bridgeReady, false);
    assert.equal(model.classification, null);
});
