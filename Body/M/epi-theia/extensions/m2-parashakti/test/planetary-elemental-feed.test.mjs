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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-planetary-elemental-feed-test');

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

// Pre-compile the dependency graph used by PlanetaryElementalFeed.
loadSourceModule('src/common/meaning-packet.ts');
const composition = loadSourceModule('src/common/composition.ts');
loadSourceModule('src/browser/components/ProvenanceBadge.tsx');
const {
    PlanetaryElementalFeed,
    PLANETARY_FEED_SOURCE,
    buildPlanetaryElementalFeedModel
} = loadSourceModule('src/browser/components/PlanetaryElementalFeed.tsx');

const keplerianProjection = Object.freeze({
    weights: Object.freeze({
        water: 50891 / 67949,
        air: 14739 / 67949,
        fire: 2185 / 67949,
        earth: 134 / 67949
    }),
    perPlanet: Object.freeze([
        Object.freeze({ planetId: 1, element: 'water', couEnergy: 47270 }),
        Object.freeze({ planetId: 2, element: 'air', couEnergy: 14739 }),
        Object.freeze({ planetId: 3, element: 'water', couEnergy: 3600 }),
        Object.freeze({ planetId: 4, element: 'fire', couEnergy: 1886 }),
        Object.freeze({ planetId: 5, element: 'fire', couEnergy: 299 }),
        Object.freeze({ planetId: 6, element: 'earth', couEnergy: 120 }),
        Object.freeze({ planetId: 7, element: 'aether', couEnergy: 42 }),
        Object.freeze({ planetId: 8, element: 'water', couEnergy: 21 }),
        Object.freeze({ planetId: 9, element: 'earth', couEnergy: 14 })
    ]),
    aspectGain: Object.freeze([])
});

const amplifiedProjection = Object.freeze({
    weights: Object.freeze({
        water: 76326 / 91013,
        air: 14687 / 91013,
        fire: 0,
        earth: 0
    }),
    perPlanet: Object.freeze([
        Object.freeze({ planetId: 1, element: 'water', couEnergy: 47270 }),
        Object.freeze({ planetId: 3, element: 'water', couEnergy: 3600 }),
        Object.freeze({ planetId: 2, element: 'air', couEnergy: 14739 })
    ]),
    aspectGain: Object.freeze([
        Object.freeze({
            handle: 'aspect:conjunction:1-3',
            planetA: 1,
            planetB: 3,
            aspectType: 0,
            aspectLabel: 'conjunction',
            gain: 1
        })
    ])
});

function bridgeFor(projection) {
    return Object.freeze({
        m2: Object.freeze({
            planetaryElementalWeights: () => projection
        })
    });
}

test('planetary elemental feed consumes the kernel bridge projection authority', () => {
    const model = buildPlanetaryElementalFeedModel({
        kernelBridge: bridgeFor(keplerianProjection),
        activePlanetId: 4,
        tick: 37
    });

    assert.equal(PLANETARY_FEED_SOURCE, 'kernelBridge.m2.planetaryElementalWeights()');
    assert.equal(model.feedReady, true);
    assert.equal(model.contributions.length, 9);
    assert.equal(model.contributions.some(contribution => contribution.planetId === 0), false);
    assert.equal(model.aetherContributions.length, 1);
    assert.equal(model.aetherContributions[0].planetId, 7);
    assert.equal(model.weightsConsistent, true);

    const waterBar = model.bars.find(bar => bar.element === 'water');
    assert.ok(waterBar);
    assert.equal(waterBar.segments.length, 3);
    assert.ok(Math.abs(waterBar.weight - keplerianProjection.weights.water) < 1e-9);
    assert.equal(model.bars.find(bar => bar.element === 'fire').segments.some(segment => segment.isActive), true);

    const folded = composition.foldM2ElementalWeightContributions(keplerianProjection.perPlanet);
    assert.ok(Math.abs(folded.water - keplerianProjection.weights.water) < 1e-9);
    assert.ok(Math.abs(folded.air - keplerianProjection.weights.air) < 1e-9);
});

test('aspect-adjusted weights remain authoritative while aspect handles render', () => {
    const model = buildPlanetaryElementalFeedModel({
        kernelBridge: bridgeFor(amplifiedProjection),
        tick: 0
    });

    assert.equal(model.feedReady, true);
    assert.equal(model.aspectGain.length, 1);
    assert.equal(model.aspectGain[0].handle, 'aspect:conjunction:1-3');
    assert.ok(model.weights.water > model.recomputedWeights.water);

    const html = markup(React.createElement(PlanetaryElementalFeed, { kernelBridge: bridgeFor(amplifiedProjection) }));
    assert.match(html, /data-aspect-gain-strip="true"/);
    assert.match(html, /data-aspect-handle="aspect:conjunction:1-3"/);
    assert.match(html, /data-gain-polarity="harmonious"/);
});

test('feed component declares public M2 production without protected M4 writes', () => {
    const source = readFileSync(
        join(extensionRoot, 'src/browser/components/PlanetaryElementalFeed.tsx'),
        'utf8'
    );
    assert.doesNotMatch(source, /personal-pratibimba|protected-m4/);
    assert.match(source, /kernelBridge\.m2\.planetaryElementalWeights\(\)/);
    assert.match(
        readFileSync(join(extensionRoot, 'src/common/composition.ts'), 'utf8'),
        /M2ElementalWeightContribution/
    );
});
