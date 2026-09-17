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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-outer-planet-pending-test');

const M2_HEADER_PATH =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-lib/include/m2.h';
const M2_SOURCE_PATH =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-lib/src/m2.c';

const outerPlanetExpectations = Object.freeze([
    Object.freeze({ index: 7, name: 'Uranus', frequencyMacro: 'PLANET_FREQ_URANUS' }),
    Object.freeze({ index: 8, name: 'Neptune', frequencyMacro: 'PLANET_FREQ_NEPTUNE' }),
    Object.freeze({ index: 9, name: 'Pluto', frequencyMacro: 'PLANET_FREQ_PLUTO' })
]);

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
    if (existsSync(linkPath)) {
        return;
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

const {
    OUTER_PLANET_DATASET_BADGE,
    PENDING_PSYCHOID_OUTER_PLANET_BADGE,
    planetLUT
} = loadSourceModule('src/common/planetary-lut.ts');
loadSourceModule('src/browser/components/ProvenanceBadge.tsx');
const {
    PlanetaryChakralCard,
    CorrespondenceTreePlanetaryKeyingPanel,
    SeventyTwoFoldBreadcrumb
} = loadSourceModule('src/browser/components/planetary-correspondence.tsx');

function macroValue(name) {
    const header = readFileSync(M2_HEADER_PATH, 'utf8');
    const match = header.match(new RegExp(`#define\\s+${name}\\s+(\\d+)u`));
    assert.ok(match, `${name} must be defined in m2.h`);
    return Number(match[1]);
}

function markup(node) {
    return renderToStaticMarkup(node);
}

test('Uranus Neptune and Pluto cards render Cousto Hz from M2_PLANET_LUT .rodata', () => {
    const source = readFileSync(M2_SOURCE_PATH, 'utf8');

    for (const planet of outerPlanetExpectations) {
        assert.match(source, new RegExp(`\\[${planet.index}\\] ${planet.name}`));
        const row = planetLUT(planet.index);
        assert.equal(row.name, planet.name);
        assert.equal(row.coustoHz, macroValue(planet.frequencyMacro));

        const html = markup(React.createElement(PlanetaryChakralCard, { planetIndex: planet.index }));
        assert.match(html, new RegExp(`data-planet-index="${planet.index}"`));
        assert.match(html, new RegExp(`>${planet.name}<`));
        assert.match(html, new RegExp(`${row.coustoHz} Hz`));
        assert.match(html, new RegExp(`DR ${row.digitalRoot}`));
        assert.match(html, new RegExp(row.chakra));
        assert.match(html, new RegExp(row.element));
        assert.match(html, new RegExp(row.phase));
        assert.match(html, new RegExp(`Ananda row ${row.anandaRow}`));
        assert.match(html, new RegExp(OUTER_PLANET_DATASET_BADGE));
    }
});

test('outer planet cards expose pending dataset and pending psychoid badges without folklore', () => {
    const forbiddenFolklore = /awakener|dissolver|transformer|imagination|death|rebirth|intuition|subconscious/i;

    for (const planet of outerPlanetExpectations) {
        const vibrational = markup(
            React.createElement(PlanetaryChakralCard, {
                planetIndex: planet.index,
                viewMode: 'vibrational'
            })
        );
        assert.match(vibrational, new RegExp(OUTER_PLANET_DATASET_BADGE));
        assert.doesNotMatch(vibrational, forbiddenFolklore);

        const psychoid = markup(
            React.createElement(PlanetaryChakralCard, {
                planetIndex: planet.index,
                viewMode: 'psychoid'
            })
        );
        assert.match(psychoid, new RegExp(PENDING_PSYCHOID_OUTER_PLANET_BADGE));
        assert.match(psychoid, /m2-5-transpersonal-extension/);
        assert.doesNotMatch(psychoid, forbiddenFolklore);
    }
});

test('CorrespondenceTreeWidget planetary keying panel renders 10 LUT rows with outer badges', () => {
    const html = markup(React.createElement(CorrespondenceTreePlanetaryKeyingPanel, { selectedPlanetIndex: 8 }));
    const rows = html.match(/data-planet-key-row=/g) ?? [];
    assert.equal(rows.length, 10);
    assert.match(html, /data-selected="true"/);

    for (const planet of outerPlanetExpectations) {
        assert.match(html, new RegExp(`data-planet-index="${planet.index}"`));
        assert.match(html, new RegExp(planet.name));
        assert.match(html, new RegExp(`${macroValue(planet.frequencyMacro)} Hz`));
        assert.match(html, new RegExp(OUTER_PLANET_DATASET_BADGE));
    }
});

test('breadcrumb step 4 traverses outer planets without rendering folklore', () => {
    const forbiddenFolklore = /awakener|dissolver|transformer|imagination|death|rebirth|intuition|subconscious/i;

    for (const planet of outerPlanetExpectations) {
        const html = markup(React.createElement(SeventyTwoFoldBreadcrumb, { planetIndex: planet.index }));
        assert.match(html, /data-breadcrumb-step="4"/);
        assert.match(html, new RegExp(`>${planet.name}<`));
        assert.match(html, new RegExp(OUTER_PLANET_DATASET_BADGE));
        assert.doesNotMatch(html, forbiddenFolklore);
    }
});
