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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-epogdoon-bridge-engine-test');

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

function markup(node) {
    return renderToStaticMarkup(node);
}

loadSourceModule('src/common/meaning-packet.ts');
loadSourceModule('src/browser/components/ProvenanceBadge.tsx');
const {
    EPOGDOON_M2_ADDRESS_COUNT,
    EPOGDOON_M3_CODON_COUNT,
    EPOGDOON_M3_RESONANCE_GAP_SENTINEL,
    EPOGDOON_M3_TAROT_FLOOR_COUNT,
    EPOGDOON_PROJECTION_SOURCE,
    EpogdoonBridgeEngine,
    buildEpogdoonBridgeModel
} = loadSourceModule('src/browser/components/EpogdoonBridgeEngine.tsx');

const foldPointAddresses = new Set([8, 17, 26, 35, 44, 53, 62, 70, 71]);

function bridgeForEpogdoonFixtures() {
    return Object.freeze({
        m2: Object.freeze({
            epogdoonProjection: address72 => {
                const compressedCodon = Math.floor((address72 * 8) / 9);
                return Object.freeze({
                    compressedCodon,
                    isEvolutionaryGap: foldPointAddresses.has(address72),
                    expandedBack: foldPointAddresses.has(address72) ? Math.max(0, address72 - 1) : address72
                });
            }
        })
    });
}

test('epogdoon bridge model consumes typed bridge projections into 72→64→56 bands', () => {
    const model = buildEpogdoonBridgeModel({
        kernelBridge: bridgeForEpogdoonFixtures(),
        activeAddress72: 53,
        tick: 125
    });

    assert.equal(EPOGDOON_PROJECTION_SOURCE, 'kernelBridge.m2.epogdoonProjection(address72)');
    assert.equal(model.latticeComplete, true);
    assert.equal(model.cells.length, EPOGDOON_M2_ADDRESS_COUNT);
    assert.equal(model.codonBand.length, EPOGDOON_M3_CODON_COUNT);
    assert.equal(model.tarotFloor.length, 64);
    assert.equal(model.tarotFloor.filter(cell => !cell.isPadding).length, EPOGDOON_M3_TAROT_FLOOR_COUNT);
    assert.equal(model.foldPointCount, 9);
    assert.equal(model.codonBand.filter(cell => cell.isResonanceGap).length, 8);
    assert.equal(model.activeCell?.address72, 53);
    assert.equal(model.codonBand.find(cell => cell.isActive)?.compressedCodon, model.activeCell?.compressedCodon);
});

test('epogdoon bridge component renders the required descent bands and glyph counts', () => {
    const html = markup(
        React.createElement(EpogdoonBridgeEngine, {
            kernelBridge: bridgeForEpogdoonFixtures(),
            activeAddress72: 53,
            tick: 125
        })
    );

    assert.match(html, /data-epogdoon-bridge-engine="true"/);
    assert.match(html, /data-descent-band="72"/);
    assert.match(html, /data-descent-band="64"/);
    assert.match(html, /data-descent-band="56"/);
    assert.equal((html.match(/data-fold-point-glyph="true"/g) ?? []).length, 9);
    assert.equal((html.match(/data-resonance-gap="0xFF"/g) ?? []).length, 8);
    assert.equal((html.match(/data-tarot-floor-cell="true"/g) ?? []).length, 64);
    assert.equal((html.match(/data-tarot-padding="false"/g) ?? []).length, 56);
    assert.equal((html.match(/data-tarot-padding="true"/g) ?? []).length, 8);
    for (const integral of [84, 96, 88, 92]) {
        assert.match(html, new RegExp(`data-suit-integral="${integral}"`));
    }
    assert.match(html, new RegExp(`data-resonance-gap="${EPOGDOON_M3_RESONANCE_GAP_SENTINEL}"`));
    assert.match(html, /data-active="true"/);
});

test('epogdoon bridge source avoids direct M3 imports and local compression arithmetic', () => {
    const source = readFileSync(
        join(extensionRoot, 'src/browser/components/EpogdoonBridgeEngine.tsx'),
        'utf8'
    );

    assert.doesNotMatch(source, /import.*m3-mahamaya/);
    assert.doesNotMatch(source, /\*\s*8\s*\/\s*9/);
    assert.doesNotMatch(source, /\*\s*8u\s*\/\s*9u/);
    assert.match(source, /kernelBridge\.m2\.epogdoonProjection\(address72\)/);
});
