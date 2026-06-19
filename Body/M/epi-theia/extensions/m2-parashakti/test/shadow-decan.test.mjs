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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-shadow-decan-test');

const M2_SOURCE_PATH =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-lib/src/m2.c';

function compiledModulePath(sourcePath) {
    const relative = sourcePath.slice(extensionRoot.length + 1).replace(/\.(ts|tsx)$/, '.js');
    return join(transpiledRoot, relative);
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

function ensureTranspiledNodeModules() {
    const linkPath = join(transpiledRoot, 'node_modules');
    if (existsSync(linkPath)) {
        rmSync(linkPath, { force: true, recursive: true });
    }
    mkdirSync(transpiledRoot, { recursive: true });
    symlinkSync(join(workspaceRoot, 'node_modules'), linkPath, 'dir');
}

function loadSourceModule(relativePath) {
    const sourcePath = join(extensionRoot, relativePath);
    assert.ok(existsSync(sourcePath), `missing source module ${relativePath}`);
    const outputPath = compileSourceModule(sourcePath);
    return require(outputPath);
}

loadSourceModule('src/common/planetary-lut.ts');
const {
    M2_DECAN_FACE_ROWS,
    allDecanFaces,
    primaryDecanFaces,
    shadowDecanFaces
} = loadSourceModule('src/common/decan-lut.ts');
loadSourceModule('src/browser/components/ProvenanceBadge.tsx');
const {
    PENDING_SHADOW_DECAN_GRAPH,
    PENDING_TAROT_REVERSED_MEANING,
    ShadowDecanSurface,
    buildShadowDecanSurfaceModel,
    normalizeShadowDecanGraphPayload
} = loadSourceModule('src/browser/components/ShadowDecanSurface.tsx');

function markup(node) {
    return renderToStaticMarkup(node);
}

function cDecanRows() {
    const source = readFileSync(M2_SOURCE_PATH, 'utf8');
    const tableMatch = source.match(/const Decan_Face_Desc M2_DECAN_DESC\[72\] = \{([\s\S]*?)\n\};/);
    assert.ok(tableMatch, 'M2_DECAN_DESC[72] table must be present in m2.c');
    const rows = [];
    const entryPattern =
        /\{\s*ELEMENT_ID_([A-Z]+),\s*(\d+),\s*(\d+),\s*(\d+),\s*PLANET_([A-Z]+),\s*0,\s*(0x[0-9A-F]+)\s*\}/g;
    for (const match of tableMatch[1].matchAll(entryPattern)) {
        rows.push({
            elementName: match[1],
            signIndex: Number(match[2]),
            decanIndexInSign: Number(match[3]),
            face: Number(match[4]),
            rulingPlanetName: planetName(match[5]),
            meaningId: match[6]
        });
    }
    return rows;
}

function planetName(macroName) {
    return macroName[0] + macroName.slice(1).toLowerCase();
}

function completeGraphPayload() {
    return {
        coordinate: '#2-3',
        primaryDescriptors: Array.from({ length: 36 }, (_, decanIndex) => ({
            decanIndex,
            coordinate: `#2-3-${decanIndex}`,
            label: `primary-${decanIndex}`,
            body: `primary body ${decanIndex}`,
            sourceHandle: `s2:#2-3-${decanIndex}`
        })),
        shadowProperDescriptors: Array.from({ length: 36 }, (_, decanIndex) => ({
            decanIndex,
            coordinate: '#2-3',
            label: `shadow-proper-${decanIndex}`,
            body: `shadow body ${decanIndex}`,
            sourceHandle: `s2:#2-3:shadow:${decanIndex}`
        })),
        tarotReversedMeanings: Array.from({ length: 36 }, (_, decanIndex) => ({
            decanIndex,
            coordinate: '#3-4',
            reversedMeaning: `reversed-${decanIndex}`,
            sourceHandle: `kernelBridge.m3.tarotReversedMeaning(${decanIndex})`
        }))
    };
}

test('M2 decan decoder exposes 72 light and shadow faces from M2_DECAN_DESC .rodata', () => {
    const cRows = cDecanRows();
    assert.equal(cRows.length, 72);
    assert.equal(allDecanFaces().length, 72);
    assert.equal(primaryDecanFaces().length, 36);
    assert.equal(shadowDecanFaces().length, 36);

    for (let index = 0; index < cRows.length; index += 1) {
        const actual = M2_DECAN_FACE_ROWS[index];
        const expected = cRows[index];
        assert.equal(actual.elementName, expected.elementName);
        assert.equal(actual.signIndex, expected.signIndex);
        assert.equal(actual.decanIndexInSign, expected.decanIndexInSign);
        assert.equal(actual.face, expected.face);
        assert.equal(actual.rulingPlanetName, expected.rulingPlanetName);
        assert.equal(actual.meaningId, expected.meaningId);
    }
});

test('shadow surface exposes 108 cells when S2 shadow graph and M3 tarot adapter data are present', () => {
    const graphPayload = completeGraphPayload();
    const model = buildShadowDecanSurfaceModel({ selectedAddress72: 7, expanded: true, graphPayload });
    assert.equal(model.selectedDecanIndex, 3);
    assert.equal(model.primaryCells.length, 36);
    assert.equal(model.lightCells.length, 36);
    assert.equal(model.shadowProperCells.length, 36);
    assert.equal(model.visibleCellCount, 108);
    assert.deepEqual(model.pendingBadges, []);

    const html = markup(
        React.createElement(ShadowDecanSurface, {
            selectedAddress72: 7,
            expanded: true,
            graphPayload
        })
    );
    assert.match(html, /data-visible-cell-count="108"/);
    assert.match(html, /shadow-proper-35/);
    assert.match(html, /data-tarot-reversed-meaning="true"/);
    assert.match(html, /reversed-35/);
});

test('shadow surface flags missing S2 shadow graph and M3 tarot reversed meaning cleanly', () => {
    const model = buildShadowDecanSurfaceModel({ selectedAddress72: 0, expanded: true, graphPayload: null });
    assert.equal(model.primaryCells.length, 36);
    assert.equal(model.lightCells.length, 36);
    assert.equal(model.shadowProperCells.length, 36);
    assert.equal(model.visibleCellCount, 72);
    assert.deepEqual(model.pendingBadges, [
        PENDING_SHADOW_DECAN_GRAPH,
        PENDING_TAROT_REVERSED_MEANING
    ]);

    const html = markup(
        React.createElement(ShadowDecanSurface, {
            selectedAddress72: 0,
            expanded: true,
            graphPayload: null
        })
    );
    assert.match(html, new RegExp(PENDING_SHADOW_DECAN_GRAPH));
    assert.match(html, new RegExp(PENDING_TAROT_REVERSED_MEANING));
    assert.match(html, /data-visible-cell-count="72"/);
});

test('normalizer accepts wired S2 and M3 adapter payload shapes', () => {
    const payload = normalizeShadowDecanGraphPayload({
        shadowDecanSurface: {
            primary_decans: [{ decan_idx: 0, title: 'Aries primary', meaning: 'structural' }],
            shadow_decans: [{ decan_idx: 0, title: 'Aries shadow proper', meaning: 'shadow' }],
            tarot_reversed_meanings: [{ decan_idx: 0, reversed_meaning: 'tarot reversal' }]
        }
    });
    assert.ok(payload);
    assert.equal(payload.primaryDescriptors.length, 1);
    assert.equal(payload.shadowProperDescriptors.length, 1);
    assert.equal(payload.tarotReversedMeanings.length, 1);
    assert.equal(payload.tarotReversedMeanings[0].sourceHandle, 'kernelBridge.m3.tarotReversedMeaning(0)');
});
