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
const transpiledRoot = join(tmpdir(), 'm2-parashakti-cymatic-spheres-deferred-test');

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

function markup(node) {
    return renderToStaticMarkup(node);
}

// Pre-compile the runtime dependency graph so relative requires resolve.
loadSourceModule('src/common/planetary-lut.ts');
loadSourceModule('src/common/meaning-packet.ts');
const composition = loadSourceModule('src/common/composition.ts');
const {
    CymaticSpheresSurface,
    buildCymaticSpheresPendingModel,
    CYMATIC_SPHERES_DEFERRAL,
    CYMATIC_SPHERES_PENDING_LABEL,
    CYMATIC_SPHERES_CHAKRA_COUNT
} = loadSourceModule('src/browser/components/CymaticSpheresSurface.tsx');

test("surfaceVariantRegistry maps 'spheres' to 'deferred-23.9' while plate/torus stay built", () => {
    assert.equal(composition.M2_SURFACE_VARIANT_REGISTRY.spheres, 'deferred-23.9');
    assert.equal(composition.M2_SURFACE_VARIANT_REGISTRY.plate, 'built');
    assert.equal(composition.M2_SURFACE_VARIANT_REGISTRY.torus, 'built');
    assert.equal(composition.M2_SPHERES_DEFERRAL, 'deferred-23.9');

    assert.equal(composition.m2SurfaceVariantIsDeferred('spheres'), true);
    assert.equal(composition.m2SurfaceVariantIsDeferred('plate'), false);
    assert.equal(composition.m2SurfaceVariantIsDeferred('torus'), false);

    // Registry is frozen — a deferred carrier must not be silently re-pointed.
    assert.ok(Object.isFrozen(composition.M2_SURFACE_VARIANT_REGISTRY));
});

test('CymaticSpheresSurface renders the pending solar-anchor tile without crashing', () => {
    const html = markup(React.createElement(CymaticSpheresSurface, {}));
    assert.match(html, /pending — solar anchor variant/);
    assert.match(html, /data-surface-variant="spheres"/);
    assert.match(html, /data-deferral-id="deferred-23.9"/);
    assert.match(html, /data-cymatic-spheres-surface="deferred"/);
    assert.match(html, new RegExp(`data-chakra-count="${CYMATIC_SPHERES_CHAKRA_COUNT}"`));
    // Substrate is cited, not recomputed.
    assert.match(html, /M2_CHAKRA_LUT\[8\]/);
    assert.match(html, /M2_PLANET_LUT\[10\]/);

    assert.equal(CYMATIC_SPHERES_DEFERRAL, 'deferred-23.9');
    assert.equal(CYMATIC_SPHERES_PENDING_LABEL, 'pending — solar anchor variant');
});

test('pending tile resolves the active planetary-hour ruler, degrading to unresolved', () => {
    const venus = markup(React.createElement(CymaticSpheresSurface, { activePlanetIndex: 3, address72: 21 }));
    assert.match(venus, /Venus/);
    assert.match(venus, /data-active-planet-index="3"/);
    assert.match(venus, /data-address72="21"/);

    // Out-of-range / absent ruler must never throw the switcher.
    const unresolved = markup(React.createElement(CymaticSpheresSurface, { activePlanetIndex: 99 }));
    assert.match(unresolved, /unresolved/);
    assert.doesNotMatch(unresolved, /data-active-planet-index="99"/);

    const model = buildCymaticSpheresPendingModel({ activePlanetIndex: 99 });
    assert.equal(model.activePlanetIndex, null);
    assert.equal(model.activePlanetName, 'unresolved');
    assert.equal(model.planetCount, 10);
    assert.equal(model.deferralId, 'deferred-23.9');
});

test('cymatic engine widget registers the deferred variant and switches to the pending tile', () => {
    const source = readFileSync(
        join(extensionRoot, 'src/browser/m2-cymatic-engine-widget.tsx'),
        'utf8'
    );
    assert.match(source, /static readonly surfaceVariantRegistry/);
    assert.match(source, /M2_SURFACE_VARIANT_REGISTRY/);
    assert.match(source, /m2SurfaceVariantIsDeferred\(this\.surfaceVariant\)/);
    assert.match(source, /<CymaticSpheresSurface/);
    assert.match(source, /renderSurfaceVariantSwitcher/);
});
